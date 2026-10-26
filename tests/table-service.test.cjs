const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request}=require('./harness.cjs');
// Guest at the table: call the waiter / ask for the bill from their own active booking, only around its time;
// staff see it in the alerts and resolve it; the catalog reports free tables now and quick-filter facts.
(async()=>{
 // A fixed clock (13:00 Tashkent today): the at-table window and "free now" depend on the hour.
 const NOON=Date.parse(new Date(Date.now()+5*3600000).toISOString().slice(0,10)+'T13:00:00+05:00');Date.now=()=>NOON;
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...v){args=v;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 const env={DB,TELEGRAM_BOT_TOKEN:'bot:t'};const cf={'cloudflare:workers':{env}},http=load('app/http.ts',cf),noLimit={...http,throttle:async()=>{}};const tg=[];
 const fetch=async(url,init)=>{tg.push(JSON.parse(init.body));return Response.json({ok:true,result:{}})};
 const telegram=load('app/telegram.ts',{...cf,'./otp-store':load('app/otp-store.ts',cf)},{fetch});
 let user={userId:'c1',role:'customer'};const access={identity:async()=>user};
 const route=load('app/api/bookings/service/route.ts',{...cf,'../../../access':access,'../../../http':noLimit,'../../../telegram':telegram});
 const local=new Date(Date.now()+5*3600000).toISOString(),today=local.slice(0,10),hh=Number(local.slice(11,13)),slot=String(Math.max(0,hh-0)).padStart(2,'0')+':00',end=hh>=22?'23:59':String(hh+2).padStart(2,'0')+':00';
 db.exec(`INSERT INTO accounts(id,email,name,created_at) VALUES ('c1','c@x','C','now'),('c2','d@x','D','now')`);
 db.prepare("INSERT INTO restaurants(id,name,status,tables,telegram_chat_id,city,cuisine,birthday_enabled,plan,paid_until) VALUES ('r1','Osh','active',4,'900','Toshkent','Milliy',1,'business',?)").run(new Date(Date.now()+30*86400000).toISOString());
 db.exec("INSERT INTO restaurant_tables(id,restaurant_id,number,seats,x,y) VALUES ('t1','r1',1,4,10,10),('t2','r1',2,8,20,20),('t3','r1',3,2,30,30)");
 db.prepare("INSERT INTO bookings(id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('b1','r1','c1',?,?,?,2,4,'+998901112233','confirmed','now'),('b2','r1','c1','2030-01-01','12:00','14:00',1,2,'+998901112233','confirmed','now')").run(today,slot,end);
 const post=d=>route.POST(request('/api/bookings/service',d));
 assert.equal((await post({bookingId:'b1',kind:'dance'})).status,400);
 assert.equal((await post({bookingId:'b2',kind:'waiter'})).status,409,'not at the table yet');
 user={userId:'c2',role:'customer'};assert.equal((await post({bookingId:'b1',kind:'waiter'})).status,404,'someone else’s booking');user={userId:'c1',role:'customer'};
 let r=await post({bookingId:'b1',kind:'waiter'});assert.equal(r.status,200);assert.ok(tg.some(m=>m.chat_id==='900'&&m.text.includes('2-stol')&&m.text.includes('Ofitsiant')));
 assert.equal((await (await post({bookingId:'b1',kind:'waiter'})).json()).repeated,true,'once a minute');
 assert.equal((await post({bookingId:'b1',kind:'bill'})).status,200);
 assert.equal(db.prepare('SELECT COUNT(*) AS n FROM service_requests WHERE resolved_at IS NULL').get().n,2);
 // Catalog: free tables now (table 2 is booked now), city, family (8 seats), national cuisine, birthday offer.
 const catalog=load('app/api/catalog/route.ts',{...cf,'../../auth-service':{authConfig:()=>({url:'',key:''})},'../../demo-drinks':{withDemoDrinks:(r,m)=>m},'../../http':http,'../../plans':load('app/plans.ts',{...cf,'./http':http})},{fetch:async()=>{throw new Error('offline')}});
 const c=await (await catalog.GET()).json();const x=c.restaurants.find(r=>r.id==='r1');
 assert.equal(x.city,'Toshkent');assert.equal(x.tables_total,3);assert.equal(x.free_now,2);assert.equal(x.family,true);assert.equal(x.birthday_promo,15);
 console.log('PASS table-service: own active booking only, at-table window, once a minute, Telegram to the restaurant; catalog free-now, city, family, birthday facts');
})().catch(e=>{console.error(e);process.exitCode=1});
