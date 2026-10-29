const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request,integrationDeps}=require('./harness.cjs');
// 2D standard hall and the 3D VIP hall: the 3D hall is off until the administrator switches it on (catalog badge
// and booking data follow), the owner's 2D constructor saves positions, seats, shape, zone, amenities and the
// hall's ambience (own tables only, seats never below an upcoming booking), the owner's 3D request reaches the
// admin panel and the administrator's Telegram, and only the administrator switches the 3D hall.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...a){args=a;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}},batch:async(list)=>{db.exec('BEGIN');try{for(const s of list)await s.run();db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}}};
 const sent=[];const env={DB,TELEGRAM_BOT_TOKEN:'bot:t',ADMIN_TELEGRAM_CHAT_ID:'900'};const fetch=async(url,init)=>{sent.push({method:String(url).split('/').pop(),body:JSON.parse(init.body)});return Response.json({ok:true,result:{}})};
 const cf={'cloudflare:workers':{env}},http=load('app/http.ts',cf),noLimit={...http,throttle:async()=>{}};
 const plans=load('app/plans.ts',{...cf,'./http':http}),staff=load('app/staff.ts',{...cf,'./http':http,'./plans':plans});
 const telegram=load('app/telegram.ts',{...cf,'./otp-store':load('app/otp-store.ts',cf)},{fetch});
 const health=load('app/health.ts',{...cf,'./telegram':telegram});
 const layout=load('app/hall-layout.ts',{...cf,'./http':http});
 let user=null;const access={identity:async()=>user};
 const tables=load('app/api/tables/route.ts',{...cf,...integrationDeps(env,http),'../../access':access,'../../http':noLimit,'../../geo':load('app/geo.ts',{'./http':http}),'../../table-rules':load('app/table-rules.ts',{'./http':http}),'../../plans':plans,'../../staff':staff,'../../hall-layout':layout});
 const hall=load('app/api/hall3d/route.ts',{...cf,'../../access':access,'../../http':noLimit,'../../staff':staff,'../../telegram':telegram,'../../health':health,'../../hall-layout':layout});
 const catalog=load('app/api/catalog/route.ts',{...cf,'../../auth-service':{authConfig:()=>({url:'',key:''})},'../../demo-drinks':{withDemoDrinks:(_r,m)=>m},'../../http':http,'../../plans':plans,'../../hall-layout':layout},{fetch:async()=>{throw Error('offline')}});
 db.exec("INSERT INTO accounts(id,email,name,created_at,role) VALUES ('owner','o@x.uz','Owner','2026-01-01','restaurant_owner'),('admin1','a@x.uz','Admin','2026-01-01','admin')");
 db.exec("INSERT INTO restaurants(id,name,status,owner_id,tables,floors) VALUES ('r','Osh Markazi','active','owner',4,2),('other','Other','active','owner2',2,1)");
 db.exec("INSERT INTO restaurant_tables(id,restaurant_id,number,floor,seats,x,y,shape,active) VALUES ('t1','r',1,1,2,20,30,'rectangle',1),('t2','r',2,1,4,50,50,'round',1),('t3','r',3,2,8,40,40,'rectangle',1),('o1','other',1,1,4,50,50,'round',1)");
 const get=async(path)=>(await tables.GET(new Request('https://test'+path))).json();
 // Default: 2D plan, no 3D hall anywhere.
 let d=await get('/api/tables?restaurantId=r');assert.deepEqual({...d.hall3d},{enabled:false,model:''});assert.deepEqual({...d.meta},{});assert.deepEqual([...d.scene],[]);
 let cat=await (await catalog.GET()).json();assert.equal(cat.restaurants.find(r=>r.id==='r').has_3d_hall,false);
 // Owner's 2D constructor.
 const arrange=(data)=>tables.POST(request('/api/tables',{action:'arrange',restaurantId:'r',...data}));
 user={userId:'stranger',role:'customer'};assert.equal((await arrange({tables:[]})).status,403);
 user={userId:'owner',role:'restaurant_owner'};
 assert.equal((await arrange({tables:[{id:'o1',x:10,y:10,seats:4}]})).status,403,'another restaurant’s table');
 let r=await arrange({tables:[{id:'t1',x:150,y:-5,seats:2,kind:'',zone:'window',tags:['window','quiet','bogus']},{id:'t2',x:60,y:62,seats:6,kind:'vip',zone:'vip',tags:['sofa']}],scene:[{type:'entrance',floor:1,x:50,y:95},{type:'bar',floor:2,x:30,y:20},{type:'stage',floor:9,x:200,y:50}]});
 assert.equal(r.status,200);
 const t1=db.prepare("SELECT x,y FROM restaurant_tables WHERE id='t1'").get(),t2=db.prepare("SELECT seats,shape,x,y FROM restaurant_tables WHERE id='t2'").get();
 assert.deepEqual({...t1},{x:96,y:4},'positions clamped');assert.deepEqual({...t2},{seats:6,shape:'rectangle',x:60,y:62});
 d=await get('/api/tables?restaurantId=r');assert.deepEqual({...d.meta['1'],tags:[...d.meta['1'].tags]},{zone:'window',kind:'',tags:['window','quiet'],walkin:false},'unknown tags dropped');assert.equal(d.meta['2'].kind,'vip');
 assert.deepEqual(d.scene.map(s=>[s.type,s.floor,s.x]),[['entrance',1,50],['bar',2,30],['stage',2,98]],'floor and position clamped');
 assert.equal((await arrange({tables:[],scene:[{type:'pool',floor:1,x:1,y:1}]})).status,400,'unknown element');
 assert.equal((await arrange({tables:[],scene:Array.from({length:41},()=>({type:'plant',floor:1,x:5,y:5}))})).status,400,'at most 40 elements');
 // Seats never go below an upcoming booking on that table.
 const tomorrow=new Date(Date.now()+5*3600000+86400000).toISOString().slice(0,10);
 db.prepare("INSERT INTO bookings(id,restaurant_id,user_id,date,slot,table_number,guests,phone,status,created_at) VALUES ('b1','r','c1',?,'19:00',3,7,'+998901234567','confirmed','2026-01-01')").run(tomorrow);
 r=await arrange({tables:[{id:'t3',x:40,y:40,seats:4}]});assert.equal(r.status,409);assert.equal(db.prepare("SELECT seats FROM restaurant_tables WHERE id='t3'").get().seats,8,'nothing saved');
 assert.equal((await arrange({tables:[{id:'t3',x:41,y:40,seats:10}]})).status,200,'more seats is fine');
 // 3D hall request from the owner → admin panel + the administrator's Telegram.
 const post=(data)=>hall.POST(request('/api/hall3d',data));
 assert.equal((await post({action:'lead',restaurantId:'r',package:'huge'})).status,400);
 assert.equal((await post({action:'lead',restaurantId:'r',package:'standard',phone:'123'})).status,400);
 sent.length=0;r=await post({action:'lead',restaurantId:'r',package:'standard',phone:'+998 90 111 22 33',note:'2 qavat, 30 stol'});assert.equal(r.status,201);
 const lead=(await r.json()).lead;assert.equal(lead.price,3500000);assert.equal(lead.phone,'+998901112233');
 const tg=sent.find(s=>s.method==='sendMessage');assert.equal(tg.body.chat_id,'900');assert.match(tg.body.text,/3D zal uchun yangi ariza/);assert.match(tg.body.text,/Osh Markazi/);assert.match(tg.body.text,/3 500 000 so‘m/);
 assert.equal((await post({action:'lead',restaurantId:'r',package:'small'})).status,409,'one open request a day');
 let own=await (await hall.GET(new Request('https://test/api/hall3d?restaurantId=r'))).json();assert.equal(own.lead.id,lead.id);assert.deepEqual({...own.hall3d},{enabled:false},'owner sees no configuration');
 user={userId:'stranger',role:'customer'};assert.equal((await post({action:'lead',restaurantId:'r',package:'small'})).status,403);assert.equal((await hall.GET(new Request('https://test/api/hall3d?restaurantId=r'))).status,403);assert.equal((await hall.GET(new Request('https://test/api/hall3d'))).status,403);
 // Only the administrator switches the 3D hall and attaches the model.
 user={userId:'owner',role:'restaurant_owner'};assert.equal((await post({action:'set',restaurantId:'r',enabled:true,config:'https://cdn.example/hall.glb'})).status,403,'owner cannot switch it on');
 user={userId:'admin1',role:'admin'};
 assert.equal((await post({action:'set',restaurantId:'r',enabled:true,config:'javascript:alert(1)'})).status,400,'https links only');
 assert.equal((await post({action:'set',restaurantId:'nope',enabled:true})).status,404);
 r=await post({action:'set',restaurantId:'r',enabled:true,config:'https://cdn.example/hall.glb'});assert.equal(r.status,200);
 d=await get('/api/tables?restaurantId=r');assert.deepEqual({...d.hall3d},{enabled:true,model:'https://cdn.example/hall.glb'});
 cat=await (await catalog.GET()).json();assert.equal(cat.restaurants.find(x=>x.id==='r').has_3d_hall,true);assert.equal(cat.restaurants.find(x=>x.id==='other').has_3d_hall,false);
 const all=await (await hall.GET(new Request('https://test/api/hall3d'))).json();assert.equal(all.leads.length,1);assert.equal(all.packages.premium.price,5900000);
 assert.equal((await post({action:'mark',id:lead.id,status:'done'})).status,200);assert.equal((await layout.leadsOf())[0].status,'done');
 // Notes instead of a link are kept for the team but never handed to the 3D viewer.
 await post({action:'set',restaurantId:'r',enabled:true,config:'Model tayyorlanmoqda, 2-qavat'});d=await get('/api/tables?restaurantId=r');assert.equal(d.hall3d.model,'');
 await post({action:'set',restaurantId:'r',enabled:false,config:''});d=await get('/api/tables?restaurantId=r');assert.equal(d.hall3d.enabled,false);
 console.log('PASS hall: 3D off by default and switched only by the admin (catalog badge, booking data), 2D constructor (own tables, clamps, zones/kinds/tags, ambience, seats vs bookings), 3D requests to admin panel + Telegram.');
})().catch(e=>{console.error(e);process.exitCode=1});
