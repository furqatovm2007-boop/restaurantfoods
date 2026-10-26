const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request}=require('./harness.cjs');
// Anti-fraud and booking integrity: the birth date is saved once and locked, the birthday promo works only
// within ±3 days of the birthday, a picked table is held for 5 minutes against other customers.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...v){args=v;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 const env={DB},cf={'cloudflare:workers':{env}},http=load('app/http.ts',cf);
 db.exec("INSERT INTO accounts(id,email,name,created_at,role) VALUES ('c1','c1@x','Aziz','now','customer'),('c2','c2@x','Bek','now','customer')");
 db.exec("INSERT INTO restaurants(id,name,owner_id,status,tables,floors,booking_open,booking_close) VALUES ('r','Osh','o','active',3,1,'08:00','23:00'),('off','Yopiq','o','pending',3,1,'08:00','23:00')");
 db.exec("INSERT INTO restaurant_tables(id,restaurant_id,number,seats,x,y) VALUES ('t1','r',1,4,10,10),('t2','r',2,4,20,10),('o1','off',1,4,10,10)");

 // 1. Birth date: once, then locked (same value is a no-op; any change is refused).
 let user={userId:'c1',role:'customer'};
 const profile=load('app/api/profile/route.ts',{...cf,'../../access':{identity:async()=>user},'../../http':{...http,throttle:async()=>{}},'../../account-admin':{hashInvite:async()=>'',audit:()=>DB.prepare('SELECT 1')},'../../geo':{point:()=>[0,0]},'../../sms':{phoneOtpEnabled:()=>false,telegramOtpConfigured:()=>false},'../../telegram':{telegram:async()=>({})},'../../booking-otp':{}});
 const birth=v=>profile.POST(request('/api/profile',{action:'birth-date',birthDate:v}));
 assert.equal((await birth('2000-13-40')).status,400);
 assert.equal((await birth('1995-06-15')).status,200);
 assert.equal(db.prepare("SELECT birth_date FROM accounts WHERE id='c1'").get().birth_date,'1995-06-15');
 assert.equal((await (await birth('1995-06-15')).json()).locked,true);
 const moved=await birth('1995-07-20');assert.equal(moved.status,403);assert.match((await moved.json()).error,/o‘zgartirilmaydi/);
 assert.equal((await birth('')).status,403,'a saved birth date cannot be cleared by the customer');
 assert.equal(db.prepare("SELECT birth_date FROM accounts WHERE id='c1'").get().birth_date,'1995-06-15');

 // 2. Birthday promo: valid only for bookings within ±3 days of the birthday of the promo's year.
 const growth=load('app/growth.ts',{...cf,'./plans':{planState:async()=>({})},'./telegram':{telegram:async()=>({}),telegramConfigured:()=>false,html:s=>s}});
 db.prepare("INSERT INTO promo_codes(code,restaurant_id,user_id,percent,kind,year,expires_at,created_at) VALUES ('BDAY-AZIZ1','r','c1',15,'birthday',?,'2999-01-01T00:00:00Z','now')").run(2026);
 assert.ok(await growth.validPromo('BDAY-AZIZ1','c1','r','2026-06-15'));
 assert.ok(await growth.validPromo('bday-aziz1','c1','r','2026-06-12'));
 assert.ok(await growth.validPromo('BDAY-AZIZ1','c1','r','2026-06-18'));
 assert.equal(await growth.validPromo('BDAY-AZIZ1','c1','r','2026-06-19'),null);
 assert.equal(await growth.validPromo('BDAY-AZIZ1','c1','r','2026-06-11'),null);
 assert.equal(await growth.validPromo('BDAY-AZIZ1','c1','other','2026-06-15'),null,'another restaurant');
 assert.equal(await growth.validPromo('BDAY-AZIZ1','c2','r','2026-06-15'),null,'another customer');
 db.exec("UPDATE promo_codes SET used_booking_id='b1'");
 assert.equal(await growth.validPromo('BDAY-AZIZ1','c1','r','2026-06-15'),null,'used once a year');

 // 3. Table hold: 5 minutes, exclusive against other customers, ignores the holder, expires, released on booking.
 const holds=load('app/holds.ts',{...cf,'./http':http}),T0=Date.parse('2026-10-26T12:00:00Z');
 const until=await holds.placeHold('r','c1',[1],'2026-10-27','19:00','21:00',T0);
 assert.equal(until,T0+5*60000);
 await assert.rejects(holds.placeHold('r','c2',[1],'2026-10-27','20:00','22:00',T0+1000),e=>e.status===409&&/5 daqiqa/.test(e.message));
 assert.ok(await holds.placeHold('r','c2',[1],'2026-10-27','21:00','23:00',T0+1000),'back-to-back slot is free');
 assert.ok(await holds.otherHold('r',[1],'2026-10-27',19*60+30,20*60,'c2',T0+2000));
 assert.equal(await holds.otherHold('r',[1],'2026-10-27',19*60+30,20*60,'c1',T0+2000),null,'own hold does not block');
 assert.deepEqual((await holds.holdsFor('r','2026-10-27','c2',T0+2000)).map(h=>[h.table_number,h.slot,h.held]),[[1,'19:00',true]]);
 assert.equal((await holds.holdsFor('r','2026-10-27','c2',T0+5*60000+1)).length,0,'expired after 5 minutes');
 assert.ok(await holds.placeHold('r','c2',[1],'2026-10-27','19:30','21:00',T0+5*60000+1),'free again after expiry');
 assert.equal(db.prepare("SELECT COUNT(*) n FROM table_holds WHERE user_id='c2'").get().n,1,'one hold per customer');
 await assert.rejects(holds.placeHold('r','c1',[9],'2026-10-27','12:00','13:00',T0),e=>e.status===404);
 await assert.rejects(holds.placeHold('off','c1',[1],'2026-10-27','12:00','13:00',T0),e=>e.status===404,'not an active restaurant');
 db.exec("INSERT INTO bookings(id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('bk','r','c2','2026-10-27','12:00','14:00',2,2,'+998901234567','confirmed','now')");
 await assert.rejects(holds.placeHold('r','c1',[2],'2026-10-27','13:00','15:00',T0),e=>e.status===409&&/band/.test(e.message));
 await holds.releaseHolds('c2');
 assert.equal(db.prepare("SELECT COUNT(*) n FROM table_holds WHERE user_id='c2'").get().n,0);

 // 4. Stop-list / prep columns exist with safe defaults.
 assert.equal(db.prepare("SELECT prep_status FROM bookings WHERE id='bk'").get().prep_status,'');
 console.log('PASS booking integrity: birth date saved once and locked, birthday promo ±3 days once a year, 5-minute exclusive table hold (expiry, own hold, real active tables, booked overlap)');
})().catch(e=>{console.error(e);process.exit(1)});
