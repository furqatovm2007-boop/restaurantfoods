const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request,integrationDeps}=require('./harness.cjs');
// Receipt + QR pass, staff check-in (Seated), no-show counting, and the smart waitlist, on real SQLite.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...v){args=v;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 DB.batch=async statements=>{db.exec('BEGIN');try{const out=[];for(const s of statements)out.push(await s.run());db.exec('COMMIT');return out}catch(e){db.exec('ROLLBACK');throw e}};
 const today=new Date(Date.now()+5*3600000).toISOString().slice(0,10),NOW=Date.parse(today+'T12:00:00+05:00');
 class FixedDate extends Date{constructor(...a){super(...(a.length?a:[NOW]))}static now(){return NOW}}
 const env={DB},cw={'cloudflare:workers':{env}};let user={userId:'owner',role:'restaurant_owner'};
 const http=load('app/http.ts',cw),noLimit={...http,throttle:async()=>{}},plans=load('app/plans.ts',{...cw,'./http':http}),waitlist=load('app/waitlist.ts',{...cw,'./telegram':load('app/telegram.ts',{...cw,'./otp-store':load('app/otp-store.ts',cw)})}),pass=load('app/booking-pass.ts',cw);
 const access={identity:async()=>user};
 const deps={...cw,'../../access':access,'../../http':noLimit,'../../plans':plans,'../../geo':load('app/geo.ts',{'./http':http}),'../../table-rules':load('app/table-rules.ts',{'./http':http}),'../../booking-rules':load('app/booking-rules.ts',{'./http':http},{Date:FixedDate}),'../../booking-preorder':load('app/booking-preorder.ts',{'./http':http})};Object.assign(deps,integrationDeps(Object.assign(env,{CLICK_SERVICE_ID:'11',CLICK_MERCHANT_ID:'22',CLICK_SECRET_KEY:'click-secret'}),http));
 const bookings=load('app/api/bookings/route.ts',deps);
 const receipt=load('app/api/bookings/receipt/route.ts',{...cw,'../../../access':access,'../../../http':http,'../../../booking-pass':pass});
 const checkin=load('app/api/manage/checkin/route.ts',{...cw,...integrationDeps(Object.assign(cw['cloudflare:workers'].env,{CLICK_SERVICE_ID:'11',CLICK_MERCHANT_ID:'22',CLICK_SECRET_KEY:'click-secret'}),http,'../../../'),'../../../access':access,'../../../http':noLimit,'../../../booking-pass':pass});
 const wl=load('app/api/waitlist/route.ts',{...cw,'../../access':access,'../../http':noLimit,'../../waitlist':waitlist});
 const camAuth=load('app/camera-auth.ts',{...cw,'./access':access,'./http':http});
 const occupancy=load('app/api/manage/occupancy/route.ts',{...cw,...integrationDeps(Object.assign(cw['cloudflare:workers'].env,{CLICK_SERVICE_ID:'11',CLICK_MERCHANT_ID:'22',CLICK_SECRET_KEY:'click-secret'}),http,'../../../'),'../../../http':noLimit,'../../../camera-auth':camAuth,'../../../plans':plans,'../../../waitlist':waitlist});
 const manage=load('app/api/manage/route.ts',{...deps,'../../account-admin':load('app/account-admin.ts',{...cw,'./http':http})});
 db.exec("INSERT INTO accounts(id,email,name,created_at,role) VALUES ('owner','o@x','O','now','restaurant_owner'),('stranger','s@x','S','now','restaurant_owner'),('c1','c1@x','Aziz Karimov','now','customer'),('c2','c2@x','C2','now','customer'),('c3','c3@x','C3','now','customer')");
 db.prepare("INSERT INTO restaurants(id,name,owner_id,status,tables,floors,booking_open,booking_close,plan,paid_until,service_fee_percent,address,phone) VALUES ('r','Real Osh','owner','active',3,1,'08:00','23:00','premium',?,10,'Registon 1','+998901112233')").run(new Date(Date.now()+30*86400000).toISOString());
 db.exec("INSERT INTO restaurant_tables(id,restaurant_id,number,seats,x,y) VALUES ('t1','r',1,4,20,30),('t2','r',2,4,50,30),('t3','r',3,4,80,30)");
 db.exec("INSERT INTO menu(id,restaurant_id,name,price,category,available) VALUES ('m1','r','Osh',45000,'Milliy',1),('m2','r','Choy',8000,'Ichimlik',1)");
 const book=(who,table,slot,endSlot,extra={})=>{user={userId:who,role:'customer'};return bookings.POST(request('/api/bookings',{restaurantId:'r',date:today,slot,endSlot,tableNumber:table,guests:2,phone:'+998901234567',...extra}))};

 // ---- Receipt + pass ----
 let r=await book('c1',2,'19:00','21:00',{preorderItems:[{id:'m1',quantity:2},{id:'m2',quantity:3}]});assert.equal(r.status,201);const b1=(await r.json()).id;
 user={userId:'c1',role:'customer'};r=await receipt.GET(new Request('https://test/api/bookings/receipt?id='+b1));assert.equal(r.status,200);let rc=await r.json();
 assert.match(rc.receiptNo,/^RF-\d{6}-[0-9A-F]{6}$/);assert.equal(rc.restaurant.name,'Real Osh');assert.equal(rc.booking.table,2);
 assert.deepEqual(rc.items.map(i=>[i.name,i.quantity,i.price,i.total]),[['Osh',2,45000,90000],['Choy',3,8000,24000]]);
 assert.equal(rc.subtotal,114000);assert.equal(rc.serviceFeePercent,10);assert.equal(rc.serviceFee,11400);assert.equal(rc.total,125400,'subtotal + 10% service');
 assert.match(rc.pass.payload,/^RFB1:[A-Z2-9]{16}$/);const code=rc.pass.code;
 rc=await (await receipt.GET(new Request('https://test/api/bookings/receipt?id='+b1))).json();assert.equal(rc.pass.code,code,'pass code is stable');
 user={userId:'owner',role:'restaurant_owner'};assert.equal((await receipt.GET(new Request('https://test/api/bookings/receipt?id='+b1))).status,200,'staff can open it');
 user={userId:'c2',role:'customer'};assert.equal((await receipt.GET(new Request('https://test/api/bookings/receipt?id='+b1))).status,404,'others cannot');
 assert.equal(pass.parsePass('rfb1:'+code.toLowerCase()),code);assert.equal(pass.parsePass(code.replace(/(.{4})/g,'$1 ')),code,'typed with spaces');assert.equal(pass.parsePass('hello'),null);

 // ---- Check-in ----
 user={userId:'stranger',role:'restaurant_owner'};assert.equal((await checkin.POST(request('/api/manage/checkin',{code:'RFB1:'+code}))).status,404,'other restaurant');
 user={userId:'owner',role:'restaurant_owner'};assert.equal((await checkin.POST(request('/api/manage/checkin',{code:'not a pass'}))).status,400);
 r=await checkin.POST(request('/api/manage/checkin',{code:'RFB1:'+code}));let ck=await r.json();assert.equal(ck.booking.table,2);assert.equal(ck.booking.customer,'Aziz');assert.equal(ck.booking.checkedInAt,null,'only shown, not yet checked in');
 r=await checkin.POST(request('/api/manage/checkin',{code:'RFB1:'+code,confirm:true}));assert.equal(r.status,200);
 assert.ok(db.prepare('SELECT checked_in_at FROM bookings WHERE id=?').get(b1).checked_in_at);assert.equal(db.prepare('SELECT status FROM bookings WHERE id=?').get(b1).status,'confirmed');
 assert.deepEqual({...db.prepare("SELECT status,source FROM table_live_status WHERE restaurant_id='r' AND table_number=2").get()},{status:'occupied',source:'manual'},'table becomes Seated/occupied');
 ck=await (await checkin.POST(request('/api/manage/checkin',{code:'RFB1:'+code}))).json();assert.ok(ck.booking.warnings.some(w=>/allaqachon/.test(w)),'second scan warns');

 // ---- No-show ----
 const tomorrow=new Date(NOW+5*3600000+86400000).toISOString().slice(0,10);
 user={userId:'c3',role:'customer'};r=await book('c3',3,'13:30','14:30',{date:tomorrow});assert.equal(r.status,201);const b3=(await r.json()).id;
 user={userId:'owner',role:'restaurant_owner'};const mark=id=>manage.POST(request('/api/manage',{action:'status',kind:'booking',id,status:'no_show'}));
 r=await mark(b3);assert.equal(r.status,409,'not before the booking started');
 db.prepare("UPDATE bookings SET date='2020-01-01',slot='12:00' WHERE id=?").run(b3);
 r=await mark(b3);assert.equal(r.status,200);assert.equal(db.prepare('SELECT status FROM bookings WHERE id=?').get(b3).status,'no_show');assert.equal(db.prepare("SELECT no_show_count n FROM accounts WHERE id='c3'").get().n,1,'customer no_show_count +1');
 db.prepare("UPDATE bookings SET date='2020-01-01',slot='12:00' WHERE id=?").run(b1);r=await mark(b1);assert.equal(r.status,409,'a checked-in guest is not a no-show');
 assert.equal(db.prepare("SELECT no_show_count n FROM accounts WHERE id='c1'").get().n,0);

 // ---- Waitlist ----
 user={userId:'owner',role:'restaurant_owner'};const camera=tables=>occupancy.POST(request('/api/manage/occupancy',{restaurantId:'r',tables}));
 assert.equal((await camera([{number:1,status:'free'}])).status,200);
 user={userId:'c2',role:'customer'};assert.equal((await wl.POST(request('/api/waitlist',{restaurantId:'r',tableNumber:1}))).status,409,'free table: just book it');
 user={userId:'owner',role:'restaurant_owner'};await camera([{number:1,status:'occupied',confidence:.9}]);
 user={userId:'c2',role:'customer'};r=await wl.POST(request('/api/waitlist',{restaurantId:'r',tableNumber:1,guests:2}));assert.equal(r.status,201);assert.equal((await r.json()).position,1);
 r=await wl.POST(request('/api/waitlist',{restaurantId:'r',tableNumber:1}));assert.equal((await r.json()).already,true,'no duplicates');
 user={userId:'c3',role:'customer'};r=await wl.POST(request('/api/waitlist',{restaurantId:'r',tableNumber:1}));assert.equal((await r.json()).position,2);
 // The camera sees the guests leave: the first in line is notified and holds the table.
 user={userId:'owner',role:'restaurant_owner'};await camera([{number:1,status:'free'}]);
 user={userId:'c2',role:'customer'};let mine=(await (await wl.GET()).json()).entries;assert.equal(mine[0].status,'notified');assert.ok(Date.parse(mine[0].hold_until)-Date.now()>9*60000,'10-minute hold');
 user={userId:'c3',role:'customer'};mine=(await (await wl.GET()).json()).entries;assert.equal(mine[0].status,'waiting');assert.equal(mine[0].position,1,'now first in line');
 // During the hold nobody else can book that table for the next 2 hours; the holder can.
 r=await book('c3',1,'13:30','14:30');assert.equal(r.status,409);assert.match((await r.json()).error,/navbatda/);
 r=await book('c2',1,'13:30','14:30');assert.equal(r.status,201,'the notified customer books it');
 assert.equal(db.prepare("SELECT status FROM waitlist WHERE user_id='c2'").get().status,'booked');
 // An unused hold expires and the next in line gets it.
 db.exec("UPDATE waitlist SET status='waiting' WHERE user_id='c3'");db.exec("INSERT INTO waitlist(id,restaurant_id,table_number,user_id,guests,status,notified_at,hold_until,created_at) VALUES ('old','r',3,'c1',2,'notified','2020-01-01','2020-01-01T00:10:00Z','2020-01-01')");
 db.exec("INSERT INTO waitlist(id,restaurant_id,table_number,user_id,guests,status,created_at) VALUES ('next','r',3,'c3',2,'waiting','2020-01-02')");db.exec("DELETE FROM table_live_status WHERE table_number=3");
 await waitlist.expireHolds('r');assert.equal(db.prepare("SELECT status FROM waitlist WHERE id='old'").get().status,'expired');assert.equal(db.prepare("SELECT status FROM waitlist WHERE id='next'").get().status,'notified','next in line promoted');
 // Leaving the queue.
 user={userId:'c3',role:'customer'};assert.equal((await wl.POST(request('/api/waitlist',{action:'leave',id:'next'}))).status,200);assert.equal(db.prepare("SELECT status FROM waitlist WHERE id='next'").get().status,'left');
 console.log('PASS receipt (items, 10% service, pass code), QR check-in -> Seated, no-show count, waitlist (join/notify/10-min hold/expiry/leave)');
})().catch(e=>{console.error(e);process.exitCode=1});
