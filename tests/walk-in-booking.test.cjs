const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request,integrationDeps}=require('./harness.cjs');
// Full chain: the camera sees a guest -> the table is "occupied" in the database -> a customer tries to
// book that table for the next 2 hours -> refused. Plus the 2-hour customer cancellation rule.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...v){args=v;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 DB.batch=async statements=>{db.exec('BEGIN');try{const results=[];for(const s of statements)results.push(await s.run());db.exec('COMMIT');return results}catch(e){db.exec('ROLLBACK');throw e}};
 // Restaurant clock fixed at 12:00 Tashkent today, so "now + 90 min" is always a valid same-day slot.
 const today=new Date(Date.now()+5*3600000).toISOString().slice(0,10),NOW=Date.parse(today+'T12:00:00+05:00');
 class FixedDate extends Date{constructor(...a){super(...(a.length?a:[NOW]))}static now(){return NOW}}
 const env={DB},cw={'cloudflare:workers':{env}};let user={userId:'owner',role:'restaurant_owner'};
 const http=load('app/http.ts',cw),httpNoLimit={...http,throttle:async()=>{}},plans=load('app/plans.ts',{...cw,'./http':http});
 const rules=load('app/booking-rules.ts',{'./http':http},{Date:FixedDate});
 const deps={...cw,'../../access':{identity:async()=>user},'../../http':httpNoLimit,'../../plans':plans,'../../geo':load('app/geo.ts',{'./http':http}),'../../table-rules':load('app/table-rules.ts',{'./http':http}),'../../booking-rules':rules,'../../booking-preorder':load('app/booking-preorder.ts',{'./http':http})};Object.assign(deps,integrationDeps(env,http));
 const bookings=load('app/api/bookings/route.ts',deps);
 const camAuth=load('app/camera-auth.ts',{...cw,'./access':{identity:async()=>user},'./http':http});
 const occupancy=load('app/api/manage/occupancy/route.ts',{...cw,'../../../http':httpNoLimit,'../../../camera-auth':camAuth,'../../../plans':plans,'../../../waitlist':load('app/waitlist.ts',{...cw,'./telegram':load('app/telegram.ts',{...cw,'./otp-store':load('app/otp-store.ts',cw)})})});
 db.exec("INSERT INTO accounts(id,email,name,created_at,role) VALUES ('owner','o@x','O','now','restaurant_owner'),('c1','c1@x','C1','now','customer'),('c2','c2@x','C2','now','customer'),('c3','c3@x','C3','now','customer'),('c4','c4@x','C4','now','customer')");
 db.prepare("INSERT INTO restaurants(id,name,owner_id,status,tables,floors,booking_open,booking_close,plan,paid_until) VALUES ('r','Real','owner','active',3,1,'08:00','23:00','premium',?)").run(new Date(Date.now()+30*86400000).toISOString());
 db.exec("INSERT INTO restaurant_tables(id,restaurant_id,number,seats,x,y) VALUES ('t1','r',1,4,20,30),('t2','r',2,4,50,30),('t3','r',3,4,80,30)");
 const camera=tables=>occupancy.POST(request('/api/manage/occupancy',{restaurantId:'r',tables}));
 const book=(who,table,slot,endSlot)=>{user={userId:who,role:'customer'};return bookings.POST(request('/api/bookings',{restaurantId:'r',date:today,slot,endSlot,tableNumber:table,guests:2,phone:'+998901234567'}))};

 // 1. The camera sees a seated guest at table 1 (walk-in).
 user={userId:'owner',role:'restaurant_owner'};assert.equal((await camera([{number:1,status:'occupied',confidence:.8},{number:3,status:'cleaning'}])).status,200);
 assert.equal(db.prepare("SELECT status FROM table_live_status WHERE restaurant_id='r' AND table_number=1").get().status,'occupied','2. stored as occupied');
 // 3-4. Another customer tries to book table 1 for 13:30 (90 min from now) -> refused.
 let r=await book('c1',1,'13:30','14:30');assert.equal(r.status,409);assert.equal((await r.json()).error,rules.SEATED_MESSAGE);
 assert.equal(db.prepare("SELECT COUNT(*) n FROM bookings WHERE restaurant_id='r' AND table_number=1").get().n,0,'nothing saved');
 // Later than 2 hours, another table, or a table being cleaned (yellow) are fine.
 r=await book('c1',1,'14:30','15:30');assert.equal(r.status,201,'table 1 after the 2-hour window');const later=(await r.json()).id;
 r=await book('c2',2,'13:30','14:30');assert.equal(r.status,201,'free table 2');
 r=await book('c3',3,'13:30','14:30');assert.equal(r.status,201,'cleaning does not block');const soon=(await r.json()).id;
 // The guest leaves: the camera reports free and table 1 can be booked for 13:30 again.
 user={userId:'owner',role:'restaurant_owner'};assert.equal((await camera([{number:1,status:'free'}])).status,200);
 r=await book('c4',1,'13:00','14:00');assert.equal(r.status,201,'unblocked once free');
 // A stale camera mark (older than 20 minutes) does not block.
 db.prepare("UPDATE table_live_status SET status='occupied',updated_at=? WHERE restaurant_id='r' AND table_number=2").run(new Date(Date.now()-30*60000).toISOString());
 r=await book('c4',2,'12:15','13:15');assert.notEqual(r.status,409,'stale mark ignored');

 // 2-hour cancellation rule.
 assert.equal(rules.cancellable(today,'14:00'),true,'exactly 2 hours: still allowed');assert.equal(rules.cancellable(today,'13:59'),false);
 user={userId:'c3',role:'customer'};r=await bookings.PATCH(request('/api/bookings',{id:soon},'PATCH'));assert.equal(r.status,400,'13:30 booking at 12:00: too late');assert.equal((await r.json()).error,rules.CANCEL_TOO_LATE);
 assert.equal(db.prepare('SELECT status FROM bookings WHERE id=?').get(soon).status,'pending','still active');
 user={userId:'c1',role:'customer'};r=await bookings.PATCH(request('/api/bookings',{id:later},'PATCH'));assert.equal(r.status,200,'14:30 booking at 12:00: allowed');
 assert.equal(db.prepare('SELECT status FROM bookings WHERE id=?').get(later).status,'cancelled');
 user={userId:'c2',role:'customer'};assert.equal((await bookings.PATCH(request('/api/bookings',{id:later},'PATCH'))).status,404,'only your own active booking');
 console.log('PASS walk-in: camera occupied -> near-time booking refused (cleaning/stale/later ok), 2-hour cancellation rule');
})().catch(e=>{console.error(e);process.exitCode=1});
