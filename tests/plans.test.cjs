const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request,integrationDeps}=require('./harness.cjs');
// Plans, 14-day trial, feature guards, live tables, vision and AI streaming against real SQLite migrations.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return {sql,bind(...a){args=a;return this},get args(){return args},first:async()=>db.prepare(sql).get(...args),all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}},batch:async list=>{db.exec('BEGIN');try{for(const s of list)db.prepare(s.sql).run(...s.args);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}}};
 const env={DB,OPENAI_API_KEY:'sk-worker-test'},cf={'cloudflare:workers':{env}};
 const http=load('app/http.ts',cf),httpNoLimit={...http,throttle:async()=>{}},integrations=integrationDeps(env,http);
 const plans=load('app/plans.ts',{...cf,'./http':http});
 const DAY=86400000,now=Date.parse('2030-01-10T00:00:00Z'),iso=t=>new Date(t).toISOString();

 // Pure plan logic
 let s=plans.planState({plan:'business',trial_ends_at:iso(now+3*DAY)},now);assert.equal(s.status,'trial');assert.equal(s.effective,'premium');assert.equal(s.daysLeft,3);assert.ok(s.features.clientAi&&s.features.visionTables);
 s=plans.planState({plan:'business',trial_ends_at:iso(now-DAY),paid_until:iso(now+10*DAY)},now);assert.equal(s.status,'active');assert.equal(s.effective,'business');assert.ok(s.features.menu3d&&s.features.adminAi&&!s.features.liveTables&&!s.features.visionTables,'Business: 3D menu + limited admin AI, no camera/live map');assert.ok(!s.features.room3d&&!s.features.clientAi&&!s.features.visionTables,'3D hall and customer AI are Premium only');
 s=plans.planState({plan:'premium',trial_ends_at:iso(now-DAY)},now);assert.equal(s.status,'payment_required');assert.equal(s.effective,'start');assert.ok(Object.values(s.features).every(v=>!v));
 s=plans.planState({plan:'start',paid_until:iso(now+DAY)},now);assert.equal(s.effective,'start');assert.ok(!s.features.menu3d);
 assert.equal(plans.planState({plan:'bogus'},now).plan,'premium');
 assert.equal(plans.extendPaid(null,1,now),iso(now+30*DAY));assert.equal(plans.extendPaid(iso(now+5*DAY),2,now),iso(now+65*DAY));assert.equal(plans.extendPaid(iso(now-5*DAY),1,now),iso(now+30*DAY));
 assert.deepEqual([plans.PLANS.start.price,plans.PLANS.business.price,plans.PLANS.premium.price],[199000,399000,699000]);

 // Migration: existing rows get a fresh trial, demo rows are always paid
 db.exec("INSERT INTO restaurants(id,name,status,owner_id,tables,floors) VALUES ('legacy','Legacy','active','o1',4,1)");
 assert.equal(db.prepare("SELECT plan FROM restaurants WHERE id='legacy'").get().plan,'premium');

 // Manage: new restaurants start a 14-day trial; owners choose, only admins record payment
 let user={userId:'owner',role:'restaurant_owner'};
 const manageDeps={...cf,...integrations,'../../geo':load('app/geo.ts',{'./http':http}),'../../access':{identity:async()=>user},'../../http':http,'../../table-rules':load('app/table-rules.ts',{'./http':http}),'../../account-admin':load('app/account-admin.ts',{...cf,'./http':http}),'../../plans':plans};
 const manage=load('app/api/manage/route.ts',manageDeps);
 let r=await manage.POST(request('/api/manage',{action:'restaurant',name:'New place',address:'Samarqand 1',phone:'+998901234567',tables:4,floors:1}));assert.equal(r.status,200);const id=(await r.json()).id;
 let row=db.prepare('SELECT * FROM restaurants WHERE id=?').get(id);assert.ok(Math.abs(Date.parse(row.trial_ends_at)-Date.now()-14*DAY)<60000,'14-day trial');assert.equal(row.paid_until,null);
 r=await manage.POST(request('/api/manage',{action:'restaurant',id,name:'New place 2',address:'Samarqand 1',phone:'+998901234567',tables:4,floors:1}));assert.equal(r.status,200);assert.equal(db.prepare('SELECT trial_ends_at FROM restaurants WHERE id=?').get(id).trial_ends_at,row.trial_ends_at,'edit keeps trial');
 const listing=await (await manage.GET()).json();assert.equal(listing.restaurants.find(x=>x.id===id).plan_state.status,'trial');assert.equal(listing.plans.business.price,399000);
 r=await manage.POST(request('/api/manage',{action:'plan',restaurantId:id,plan:'business'}));assert.equal(r.status,200);assert.equal((await r.json()).plan_state.plan,'business');
 assert.equal((await manage.POST(request('/api/manage',{action:'plan',restaurantId:id,plan:'business',months:1}))).status,403,'owner cannot mark paid');
 assert.equal((await manage.POST(request('/api/manage',{action:'plan',restaurantId:id,plan:'gold'}))).status,400);
 user={userId:'stranger',role:'restaurant_owner'};assert.equal((await manage.POST(request('/api/manage',{action:'plan',restaurantId:id,plan:'start'}))).status,403);
 user={userId:'sb:4fcd0d25-6ec1-4e10-a15f-8005d683edfe',role:'admin'};r=await manage.POST(request('/api/manage',{action:'plan',restaurantId:id,plan:'business',months:2}));assert.equal(r.status,200);
 row=db.prepare('SELECT * FROM restaurants WHERE id=?').get(id);assert.ok(Date.parse(row.paid_until)>Date.now()+59*DAY);assert.equal(db.prepare("SELECT COUNT(*) n FROM admin_audit WHERE action='restaurant-plan'").get().n,1);
 user={userId:'owner',role:'restaurant_owner'};assert.equal((await manage.POST(request('/api/manage',{action:'plan',restaurantId:id,plan:'premium'}))).status,409,'no self-upgrade inside a paid period');
 db.prepare("UPDATE restaurants SET status='active' WHERE id=?").run(id);

 // Catalog exposes feature flags, never billing dates
 const catalog=load('app/api/catalog/route.ts',{...cf,'../../auth-service':{authConfig:()=>({url:'',key:''})},'../../demo-drinks':{withDemoDrinks:(_r,m)=>m},'../../http':http,'../../plans':plans},{fetch:async()=>{throw Error('offline')}});
 const cat=await (await catalog.GET()).json(),entry=cat.restaurants.find(x=>x.id===id);assert.equal(entry.features.menu3d,true);assert.equal(entry.features.clientAi,false);assert.ok(!('paid_until' in entry)&&!('trial_ends_at' in entry)&&!('plan' in entry));

 // Tables: live status (camera / live map) is Premium only
 db.exec(`INSERT INTO restaurant_tables(id,restaurant_id,number,seats,x,y) VALUES ('t1','${id}',1,4,20,30),('t2','${id}',2,2,60,30),('t3','legacy',1,4,50,50)`);
 const tables=load('app/api/tables/route.ts',{...cf,...integrations,'../../access':{identity:async()=>user},'../../http':http,'../../geo':load('app/geo.ts',{'./http':http}),'../../table-rules':load('app/table-rules.ts',{'./http':http}),'../../plans':plans});
 assert.equal((await tables.POST(request('/api/tables',{action:'live',restaurantId:id,tableNumber:1,status:'occupied'}))).status,402,'Business has no live table map');
 db.prepare("UPDATE restaurants SET plan='premium' WHERE id=?").run(id);
 assert.equal((await tables.POST(request('/api/tables',{action:'live',restaurantId:id,tableNumber:1,status:'occupied'}))).status,200);
 assert.equal((await tables.POST(request('/api/tables',{action:'live',restaurantId:id,tableNumber:1,status:'party'}))).status,400);
 let t=await (await tables.GET(new Request('https://test/api/tables?restaurantId='+id))).json();assert.deepEqual(t.features,{room3d:true,liveTables:true},'Premium: live tables and the 3D hall');assert.equal(t.live[0].status,'occupied');
 db.prepare("UPDATE restaurants SET paid_until=NULL,trial_ends_at=? WHERE id=?").run(iso(Date.now()-DAY),id);
 assert.equal((await tables.POST(request('/api/tables',{action:'live',restaurantId:id,tableNumber:2,status:'free'}))).status,402,'expired trial loses live tables');
 t=await (await tables.GET(new Request('https://test/api/tables?restaurantId='+id))).json();assert.equal(t.features.room3d,false);assert.deepEqual(t.live,[]);
 db.prepare("UPDATE restaurants SET plan='premium',paid_until=? WHERE id=?").run(iso(Date.now()+30*DAY),id);

 // Camera keys + vision
 r=await manage.POST(request('/api/manage',{action:'camera_key',restaurantId:id,label:'Zal'}));assert.equal(r.status,200);const {key}=await r.json();assert.match(key,/^rfcam_[a-f0-9]{48}$/);assert.ok(!JSON.stringify(db.prepare('SELECT * FROM camera_keys').all()).includes(key),'only the hash is stored');
 let visionCalls=0,visionAnswer={tables:[{number:1,status:'free',confidence:.9},{number:2,status:'occupied',confidence:.4},{number:9,status:'occupied',confidence:.99}]};
 const camAuth=load('app/camera-auth.ts',{...cf,'./access':{identity:async()=>user},'./http':httpNoLimit});
 const vision=load('app/api/manage/vision/route.ts',{...cf,'../../../camera-auth':camAuth,'../../../http':httpNoLimit,'../../../plans':plans,'../../../vision':load('app/vision.ts',{})},{fetch:async(url,options)=>{visionCalls++;assert.equal(url,'https://api.openai.com/v1/chat/completions');const payload=JSON.parse(options.body);assert.equal(payload.model,'gpt-4o-mini');assert.equal(payload.response_format.type,'json_schema');assert.match(payload.messages[1].content[1].image_url.url,/^data:image\/jpeg;base64,/);return Response.json({choices:[{message:{content:JSON.stringify(visionAnswer)}}]})}});
 const frame=(headers,payload)=>new Request('https://test/api/manage/vision',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify({restaurantId:id,mimeType:'image/jpeg',image:'AAAA',...payload})});
 assert.equal((await vision.POST(frame({Authorization:'Bearer rfcam_wrong'}))).status,401);
 // A fresh staff mark wins over the camera; once it is older than the live TTL the camera takes over.
 assert.equal((await vision.POST(frame({Authorization:'Bearer '+key}))).status,200);assert.equal(db.prepare('SELECT source FROM table_live_status WHERE restaurant_id=? AND table_number=1').get(id).source,'manual');
 db.prepare("UPDATE table_live_status SET updated_at=? WHERE restaurant_id=?").run(iso(Date.now()-30*60000),id);
 r=await vision.POST(frame({Authorization:'Bearer '+key}));assert.equal(r.status,200);let v=await r.json();assert.deepEqual(v.tables,[{number:1,status:'free',confidence:.9}]);assert.equal(v.skipped,1);
 assert.equal(db.prepare('SELECT status FROM table_live_status WHERE restaurant_id=? AND table_number=1').get(id).status,'free');assert.equal(db.prepare('SELECT source FROM table_live_status WHERE restaurant_id=? AND table_number=1').get(id).source,'vision');
 assert.equal((await vision.POST(frame({Authorization:'Bearer '+key},{image:'not base64!'}))).status,400);
 assert.equal((await vision.POST(frame({Authorization:'Bearer '+key},{restaurantId:'legacy'}))).status,401,'key is bound to its restaurant');
 assert.equal((await vision.POST(frame({Origin:'https://evil'}))).status,403,'session uploads need same origin');
 db.prepare("UPDATE restaurants SET plan='business' WHERE id=?").run(id);assert.equal((await vision.POST(frame({Authorization:'Bearer '+key}))).status,402,'vision is Premium');assert.equal(visionCalls,2);
 // Smart Vision (on-device detection): statuses only, Business+ (liveTables), staff mark still wins.
 const occupancy=load('app/api/manage/occupancy/route.ts',{...cf,'../../../http':httpNoLimit,'../../../camera-auth':camAuth,'../../../plans':plans,'../../../waitlist':load('app/waitlist.ts',{...cf,'./telegram':load('app/telegram.ts',{...cf,'./otp-store':load('app/otp-store.ts',cf)})})});
 const occ=(headers,tables)=>occupancy.POST(new Request('https://test/api/manage/occupancy',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify({restaurantId:id,tables})}));
 const savedLive=db.prepare('SELECT * FROM table_live_status WHERE restaurant_id=?').all(id);db.prepare('DELETE FROM table_live_status WHERE restaurant_id=?').run(id);
 assert.equal((await occ({Authorization:'Bearer '+key},[{number:1,status:'occupied',confidence:.8}])).status,402,'Business: no AI camera');db.prepare("UPDATE restaurants SET plan='premium' WHERE id=?").run(id);
 assert.equal((await occ({Authorization:'Bearer '+key},[{number:1,status:'occupied',confidence:.8}])).status,200,'Premium uses the camera page');
 assert.deepEqual({...db.prepare('SELECT status,source FROM table_live_status WHERE restaurant_id=? AND table_number=1').get(id)},{status:'occupied',source:'camera'});
 assert.equal((await occ({Authorization:'Bearer '+key},[{number:9,status:'free'}])).status,400,'unknown table');
 assert.equal((await occ({Authorization:'Bearer '+key},[{number:1,status:'reserved'}])).status,400,'only free/occupied/cleaning');
 const sinceA=db.prepare('SELECT since FROM table_live_status WHERE restaurant_id=? AND table_number=1').get(id).since;assert.ok(sinceA);
 db.prepare("UPDATE table_live_status SET since='2026-01-01T00:00:00.000Z' WHERE restaurant_id=? AND table_number=1").run(id);
 assert.equal((await occ({Authorization:'Bearer '+key},[{number:1,status:'occupied'}])).status,200);assert.equal(db.prepare('SELECT since FROM table_live_status WHERE restaurant_id=? AND table_number=1').get(id).since,'2026-01-01T00:00:00.000Z','heartbeat keeps since');
 assert.equal((await occ({Authorization:'Bearer '+key},[{number:1,status:'cleaning'}])).status,200);{const row=db.prepare('SELECT status,since FROM table_live_status WHERE restaurant_id=? AND table_number=1').get(id);assert.equal(row.status,'cleaning');assert.notEqual(row.since,'2026-01-01T00:00:00.000Z','a new status restarts since')}
 assert.equal((await occ({Authorization:'Bearer '+key},[{number:1,status:'free'},{number:1,status:'free'}])).status,400,'no duplicates');
 assert.equal((await occ({Origin:'https://evil'},[{number:1,status:'free'}])).status,403,'browser posts need same origin');
 db.prepare("INSERT INTO table_live_status (restaurant_id,table_number,status,source,confidence,updated_at) VALUES (?,2,'occupied','manual',1,?)").run(id,new Date().toISOString());
 assert.equal((await occ({Authorization:'Bearer '+key},[{number:2,status:'free'}])).status,200);assert.equal(db.prepare('SELECT source FROM table_live_status WHERE restaurant_id=? AND table_number=2').get(id).source,'manual','fresh staff mark wins');
 db.prepare("UPDATE restaurants SET plan='start' WHERE id=?").run(id);assert.equal((await occ({Authorization:'Bearer '+key},[{number:1,status:'free'}])).status,402,'Start plan has no live tables');db.prepare("UPDATE restaurants SET plan='business' WHERE id=?").run(id);
 db.prepare('DELETE FROM table_live_status WHERE restaurant_id=?').run(id);for(const l of savedLive)db.prepare('INSERT INTO table_live_status (restaurant_id,table_number,status,source,confidence,updated_at) VALUES (?,?,?,?,?,?)').run(l.restaurant_id,l.table_number,l.status,l.source,l.confidence,l.updated_at);

 // Events feed for the admin orb
 db.prepare("INSERT INTO bookings(id,restaurant_id,user_id,date,slot,table_number,guests,phone,status,created_at) VALUES ('b1',?, 'c','2030-01-01','18:00',1,3,'+998901234567','pending',?)").run(id,iso(Date.now()-5000));
 const events=load('app/api/manage/events/route.ts',{...cf,'../../../access':{identity:async()=>user},'../../../http':http,'../../../plans':plans});
 let ev=await (await events.GET(new Request('https://test/api/manage/events?since='+iso(Date.now()-60000)))).json();assert.equal(ev.enabled,true);assert.equal(ev.bookings.length,1);assert.equal(ev.bookings[0].guests,3);assert.ok(ev.live.some(l=>l.status==='free'));
 ev=await (await events.GET(new Request('https://test/api/manage/events?since='+ev.now))).json();assert.equal(ev.bookings.length,0);
 user={userId:'o1',role:'restaurant_owner'};db.prepare("UPDATE restaurants SET trial_ends_at=? WHERE id='legacy'").run(iso(Date.now()-DAY));ev=await (await events.GET(new Request('https://test/api/manage/events'))).json();assert.equal(ev.enabled,false);
 user={userId:'customer',role:'customer'};assert.equal((await events.GET(new Request('https://test/api/manage/events'))).status,403);

 // SSE helpers
 const sse=load('app/sse.ts',{});const split=new sse.MarkerSplitter('⟦DATA⟧');let out='';for(const c of ['Salom, ','bugun ⟦D','AT','A⟧ {"actions":[]}'])out+=split.push(c);out+=split.flush();assert.equal(out,'Salom, bugun ');assert.equal(split.tail.trim(),'{"actions":[]}');
 const plain=new sse.MarkerSplitter('⟦DATA⟧');assert.equal(plain.push('a ⟦')+plain.flush(),'a ⟦');

 // AI stream route: deltas pass through, done is validated, plan gate applies
 user={userId:'client',role:'customer'};
 const streamBody=frames=>new Response(new ReadableStream({start(c){for(const f of frames)c.enqueue(new TextEncoder().encode(f));c.close()}}),{headers:{'Content-Type':'text/event-stream'}});
 let edge='stream';
 const streamRoute=load('app/api/ai/stream/route.ts',{'../../../access':{identity:async()=>user},'../../../client-ai':load('app/client-ai.ts',{...cf,'./http':http}),'../../../auth-service':{accessToken:async()=>'tok',authConfig:()=>({url:'https://sb.test',key:'anon'})},'../../../http':httpNoLimit,'../../../ai-catalog':{aiCatalog:async(rid,q)=>{assert.equal(q,'Osh bormi?');return [{id,name:'New place 2',menu:[{id:'m1',name:'Osh',price:40000}]}]},validRecommendations:(v,c)=>v.filter(x=>c.some(r=>r.id===x.restaurantId))},'../../../ai-guide':{guideActions:()=>[],checkGuideAvailability:async()=>({}),availabilitySpeech:()=>''},'../../../plans':plans,'../../../sse':sse},{ReadableStream,fetch:async(url,options)=>{const p=JSON.parse(options.body);assert.equal(p.stream,true);if(edge==='json')return Response.json({reply:'Bor.',recommendations:[],actions:[]});return streamBody(['event: delta\ndata: {"text":"Ha, "}\n\n','event: delta\ndata: {"text":"osh bor."}\n\nevent: done\n','data: {"reply":"Ha, osh bor.","recommendations":[{"restaurantId":"'+id+'"},{"restaurantId":"fake"}],"actions":[]}\n\n'])}});
 const read=async res=>{const text=await res.text();return [...text.matchAll(/event: (\w+)\ndata: (.*)\n\n/g)].map(m=>[m[1],JSON.parse(m[2])])};
 db.prepare("UPDATE restaurants SET plan='premium' WHERE id=?").run(id);
 let evs=await read(await streamRoute.POST(request('/api/ai/stream',{message:'Osh bormi?',lang:'uz',restaurantId:id})));
 assert.deepEqual(evs.filter(e=>e[0]==='delta').map(e=>e[1].text).join(''),'Ha, osh bor.');const done=evs.find(e=>e[0]==='done')[1];assert.equal(done.replaced,false);assert.equal(done.recommendations.length,1,'unknown restaurants dropped');
 // Once today's customer questions are used up, the next one is refused until tomorrow (or a booking/order).
 db.prepare('UPDATE ai_quota SET used=1000').run();
 r=await streamRoute.POST(request('/api/ai/stream',{message:'Osh bormi?',lang:'uz',restaurantId:id}));assert.equal(r.status,429);assert.equal((await r.json()).error,'AI_DAILY_LIMIT');db.prepare('DELETE FROM ai_quota').run();
 edge='json';evs=await read(await streamRoute.POST(request('/api/ai/stream',{message:'Osh bormi?',lang:'uz'})));assert.deepEqual(evs.map(e=>e[0]),['delta','done'],'legacy JSON edge replayed');
 db.prepare("UPDATE restaurants SET plan='business' WHERE id=?").run(id);assert.equal((await streamRoute.POST(request('/api/ai/stream',{message:'Osh bormi?',lang:'uz',restaurantId:id}))).status,402,'client AI is Premium');
 user=null;assert.equal((await streamRoute.POST(request('/api/ai/stream',{message:'x',lang:'uz'}))).status,401);
 console.log('PASS plans, 14-day trial, payment recording, feature guards, live tables, camera keys, vision updates, booking feed, SSE streaming');
})().catch(e=>{console.error(e);process.exit(1)});
