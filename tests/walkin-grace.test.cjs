const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request,integrationDeps}=require('./harness.cjs');
// Online guests vs walk-in guests: tables kept for walk-ins (70/30) cannot be booked or held online; a late
// booking is released to walk-ins only after the 10-minute grace period (not when the guest is in, not
// before time, a Call AI confirmation needs a second confirmation); the coffee bonus goes once by Telegram.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...v){args=v;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 DB.batch=async statements=>{const results=[];for(const s of statements)results.push(await s.run());return results};
 const today=new Date(Date.now()+5*3600000).toISOString().slice(0,10),NOW=Date.parse(today+'T12:00:00+05:00');
 class FixedDate extends Date{constructor(...a){super(...(a.length?a:[NOW]))}static now(){return NOW}}
 const env={DB},cw={'cloudflare:workers':{env}};let user={userId:'owner',role:'restaurant_owner'};
 const http=load('app/http.ts',cw),noLimit={...http,throttle:async()=>{}},plans=load('app/plans.ts',{...cw,'./http':http});
 const rules=load('app/booking-rules.ts',{'./http':http},{Date:FixedDate}),tableRules=load('app/table-rules.ts',{'./http':http});
 const layout=load('app/hall-layout.ts',{...cw,'./http':http});
 const deps={...cw,'../../access':{identity:async()=>user},'../../http':noLimit,'../../plans':plans,'../../geo':load('app/geo.ts',{'./http':http}),'../../table-rules':tableRules,'../../booking-rules':rules,'../../booking-preorder':load('app/booking-preorder.ts',{'./http':http}),'../../hall-layout':layout};Object.assign(deps,integrationDeps(Object.assign(env,{CLICK_SERVICE_ID:'11',CLICK_MERCHANT_ID:'22',CLICK_SECRET_KEY:'click-secret'}),http));
 const bookings=load('app/api/bookings/route.ts',deps);
 const hold=load('app/api/tables/hold/route.ts',{...cw,'../../../access':{identity:async()=>user},'../../../http':noLimit,'../../../booking-rules':rules,'../../../table-rules':tableRules,'../../../hall-layout':layout});
 db.exec("INSERT INTO accounts(id,email,name,created_at,role,telegram_chat_id) VALUES ('owner','o@x','O','now','restaurant_owner',NULL),('c1','c1@x','Ali Valiyev','now','customer','777'),('c2','c2@x','C2','now','customer',NULL)");
 db.prepare("INSERT INTO restaurants(id,name,owner_id,status,tables,floors,booking_open,booking_close,plan,paid_until) VALUES ('r','Real','owner','active',3,1,'08:00','23:00','premium',?)").run(new Date(Date.now()+30*86400000).toISOString());
 db.exec("INSERT INTO restaurant_tables(id,restaurant_id,number,seats,x,y) VALUES ('t1','r',1,4,20,30),('t2','r',2,4,50,30),('t3','r',3,4,80,30)");

 // 70/30: table 3 is kept for walk-in guests.
 assert.equal(JSON.stringify(layout.cleanMeta({zone:'vip',walkin:true})),JSON.stringify({zone:'vip',kind:'',tags:[],walkin:true}));
 assert.equal(layout.cleanMeta({walkin:'yes'}).walkin,false,'only a real true marks a walk-in table');
 await layout.saveTableMeta('r',{3:layout.cleanMeta({walkin:true}),2:layout.cleanMeta({})},'owner');
 assert.equal([...await layout.walkinTables('r')].join(),'3');
 user={userId:'c2',role:'customer'};
 let r=await bookings.POST(request('/api/bookings',{restaurantId:'r',date:today,slot:'14:00',endSlot:'15:00',tableNumber:3,guests:2,phone:'+998901234567'}));
 assert.equal(r.status,409);assert.equal((await r.json()).error,layout.WALKIN_ONLY);
 assert.equal(db.prepare("SELECT COUNT(*) n FROM bookings WHERE table_number=3").get().n,0,'nothing saved');
 r=await hold.POST(request('/api/tables/hold',{restaurantId:'r',date:today,slot:'14:00',endSlot:'15:00',table:3}));
 assert.equal(r.status,409,'a walk-in table cannot be held online');
 r=await bookings.POST(request('/api/bookings',{restaurantId:'r',date:today,slot:'14:00',endSlot:'15:00',tableNumber:2,guests:2,phone:'+998901234567'}));
 assert.equal(r.status,201,'other tables stay bookable');

 // Grace period and coffee bonus (Telegram, penalties and the waitlist are recorded, not sent).
 const sent=[],charged=[],told=[],notified=[];let tgOk=true;
 const grace=load('app/grace.ts',{...cw,'./http':http,'./telegram':{telegram:async(m,p)=>(sent.push(p),tgOk),html:s=>String(s),notifyCustomer:async(id,kind)=>(told.push(kind),true)},'./penalties':{chargePenalty:async(id,kind)=>charged.push(kind),NO_SHOW_PENALTY:150000},'./waitlist':{notifyNext:async(rid,t)=>notified.push(t)}});
 assert.equal(grace.GRACE_MIN,10);
 db.exec(`INSERT INTO bookings(id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('b1','r','c1','${today}','12:00','14:00',1,2,'+998901234567','confirmed','now'),('b2','r','c2','${today}','12:00','14:00',2,2,'+998901234567','confirmed','now')`);
 const fail=async(p,code)=>{try{await p;assert.fail('expected '+code)}catch(e){assert.equal(e.status,code,e.message);return e}};
 await fail(grace.releaseBooking('r','b1',false,NOW+9*60000),409);
 await fail(grace.releaseBooking('other','b1',false,NOW+11*60000),404);
 db.exec("UPDATE bookings SET checked_in_at='now' WHERE id='b1'");await fail(grace.releaseBooking('r','b1',false,NOW+11*60000),409);
 db.exec("UPDATE bookings SET checked_in_at=NULL WHERE id='b1'");
 db.exec("INSERT INTO table_orders(id,restaurant_id,table_number,booking_id,status,waiter_id,receipt_key,opened_at,updated_at) VALUES ('o1','r',1,'b1','open','owner','k','now','now')");
 await fail(grace.releaseBooking('r','b1',false,NOW+11*60000),409);
 db.exec("DELETE FROM table_orders");
 db.exec("UPDATE bookings SET call_status='confirmed' WHERE id='b1'");
 await fail(grace.releaseBooking('r','b1',false,NOW+11*60000),428);
 assert.equal(db.prepare("SELECT status FROM bookings WHERE id='b1'").get().status,'confirmed','not released without the second confirmation');
 assert.equal(JSON.stringify(await grace.releaseBooking('r','b1',true,NOW+11*60000)),'{"ok":true,"table":1}');
 assert.equal(db.prepare("SELECT status FROM bookings WHERE id='b1'").get().status,'no_show');
 assert.equal(db.prepare("SELECT no_show_count n FROM accounts WHERE id='c1'").get().n,1);
 assert.deepEqual([charged,told,notified],[['no_show'],['no_show'],[1]]);
 await fail(grace.releaseBooking('r','b1',true,NOW+12*60000),409);

 await fail(grace.coffeeBonus('r','b2','owner'),409);
 assert.equal(sent.length,0,'no Telegram, no message');
 db.exec("UPDATE bookings SET status='confirmed' WHERE id='b1'");
 tgOk=false;await fail(grace.coffeeBonus('r','b1','owner'),502);
 assert.equal(db.prepare("SELECT COUNT(*) n FROM app_settings WHERE key='coffee:b1'").get().n,0,'a failed send can be retried');
 tgOk=true;const c=await grace.coffeeBonus('r','b1','owner');
 assert.match(c.code,/^KOFE-[A-Z2-9]{4}$/);
 assert.equal(sent.at(-1).chat_id,'777');assert.ok(sent.at(-1).text.includes(c.code)&&sent.at(-1).text.includes('5 daqiqa')&&sent.at(-1).text.includes('Ali,'));
 const again=await fail(grace.coffeeBonus('r','b1','owner'),409);assert.ok(again.message.includes(c.code),'sent once per booking');

 // The route: hostess and up only.
 const route=load('app/api/manage/grace/route.ts',{...cw,'../../../access':{identity:async()=>user},'../../../http':noLimit,'../../../staff':load('app/staff.ts',{...cw,'./http':http,'./plans':plans}),'../../../grace':grace});
 user={userId:'c2',role:'customer'};
 assert.equal((await route.POST(request('/api/manage/grace',{restaurantId:'r',bookingId:'b2',action:'release'}))).status,403);
 user={userId:'owner',role:'restaurant_owner'};
 assert.equal((await route.POST(request('/api/manage/grace',{restaurantId:'r',bookingId:'b2',action:'nope'}))).status,400);
 console.log('PASS walk-in & grace: walk-in tables not bookable/holdable, 10-min release rules, Call AI re-confirm, coffee bonus once.');
})().catch(e=>{console.error(e);process.exitCode=1});
