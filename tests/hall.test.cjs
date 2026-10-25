const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request}=require('./harness.cjs');
// Hall cash desk: tables Bo‘sh / Band / Bron qilingan with today's booking (name, phone, time, Telegram),
// bills priced from the menu with comments and the service charge, safe concurrent saves, closing frees the
// table and completes the booking, the receipt page, and the customer's Telegram + SMS receipt (once).
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...a){args=a;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 const env={DB,TELEGRAM_BOT_TOKEN:'bot:t',ESKIZ_EMAIL:'e@x',ESKIZ_PASSWORD:'p',SITE_URL:'https://restaurantfoods.online'};
 const sent=[];const fetch=async(url,init)=>{url=String(url);if(url.includes('eskiz')){if(url.endsWith('/auth/login'))return Response.json({data:{token:'tok'}});sent.push({sms:init.body.get('mobile_phone'),text:init.body.get('message')});return Response.json({status:'waiting'})}sent.push({tg:JSON.parse(init.body)});return Response.json({ok:true,result:{message_id:1}})};
 const cf={'cloudflare:workers':{env}},http=load('app/http.ts',cf),noLimit={...http,throttle:async()=>{}};
 const plans=load('app/plans.ts',{...cf,'./http':http}),staffMod=load('app/staff.ts',{...cf,'./http':http,'./plans':plans}),hall=load('app/hall.ts',{...cf,'./http':http});
 const telegram=load('app/telegram.ts',{...cf,'./otp-store':load('app/otp-store.ts',cf)},{fetch}),sms=load('app/sms.ts',{...cf,'./http':http},{fetch,FormData});
 let user=null;const access={identity:async()=>user};
 const api=load('app/api/table-orders/route.ts',{...cf,'../../access':access,'../../http':noLimit,'../../staff':staffMod,'../../hall':hall});
 const notify=load('app/api/notify-customer/route.ts',{...cf,'../../access':access,'../../http':noLimit,'../../staff':staffMod,'../../telegram':telegram,'../../sms':sms,'../../hall':hall});
 const receipt=load('app/api/pos/receipt/route.ts',{...cf,'../../../http':http,'../../../pos':load('app/pos.ts',{...cf,'./http':http}),'../../../hall':hall});
 db.prepare("INSERT INTO restaurants(id,name,status,owner_id,plan,paid_until,service_fee_percent) VALUES ('r','Samarqand Osh Markazi','active','owner','business',?,10)").run(new Date(Date.now()+30*86400000).toISOString());
 db.exec("INSERT INTO restaurant_tables(id,restaurant_id,number,seats,atmosphere) VALUES ('t1','r',1,4,''),('t2','r',2,4,''),('t3','r',3,8,'VIP xona')");
 db.exec("INSERT INTO menu(id,restaurant_id,name,price,category,available) VALUES ('m1','r','Samarqand oshi',45000,'Milliy taomlar',1),('m2','r','Choy',6000,'Ichimliklar',1),('m3','r','Tugagan taom',1000,'Salatlar',0)");
 db.exec("INSERT INTO accounts(id,email,name,created_at,telegram_chat_id) VALUES ('c1','c@x','Aziz Karimov','now','5551'),('w1','w@x','Ofitsiant Bobur','now',NULL)");
 db.exec("INSERT INTO restaurant_staff(restaurant_id,user_id,role,created_by,created_at) VALUES ('r','w1','waiter','owner','now')");
 const {date,minutes}=hall.localNow();const hhmm=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
 const start=Math.min(minutes+30,23*60),end=Math.min(start+90,23*60+59);
 db.prepare("INSERT INTO bookings(id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('b1','r','c1',?,?,?,2,3,'+998901112233','confirmed','now')").run(date,hhmm(start),hhmm(end));
 const get=async()=>(await api.GET(new Request('https://test/api/table-orders?restaurantId=r'))).json();const post=d=>api.POST(request('/api/table-orders',{restaurantId:'r',...d}));
 user={userId:'x',role:'customer'};assert.equal((await api.GET(new Request('https://test/api/table-orders?restaurantId=r'))).status,403);
 user={userId:'w1',role:'customer',displayName:'Ofitsiant Bobur'};
 let d=await get();assert.deepEqual(d.tables.map(t=>t.status),['free','reserved','free']);const t2=d.tables[1];
 assert.equal(t2.booking.name,'Aziz Karimov');assert.equal(t2.booking.phone,'+998901112233');assert.equal(t2.booking.slot,hhmm(start));assert.equal(t2.booking.telegram,true);assert.equal(d.tables[2].vip,true);assert.equal(d.restaurant.serviceFee,10);
 assert.equal(d.menu.length,2,'unavailable dishes hidden');
 // Save: prices from the menu (the browser's price is ignored), comments kept, service 10%.
 let r=await post({action:'save',table:2,servicePercent:10,items:[{menuId:'m1',qty:2,price:1},{menuId:'m2',qty:1,comment:'  Muzsiz  '}]});assert.equal(r.status,200);let o=(await r.json()).order;
 assert.equal(o.subtotal,96000);assert.equal(o.service,9600);assert.equal(o.total,105600);assert.equal(o.items[1].comment,'Muzsiz');assert.equal(o.customer.name,'Aziz Karimov','booking linked');
 assert.ok(db.prepare("SELECT checked_in_at FROM bookings WHERE id='b1'").get().checked_in_at,'guest marked arrived');
 d=await get();assert.equal(d.tables[1].status,'busy');assert.equal(d.tables[1].order.total,105600);
 assert.equal((await post({action:'save',table:2,servicePercent:5,items:[{menuId:'m1',qty:1}],version:o.version})).status,400,'only 0/10/15%');
 assert.equal((await post({action:'save',table:2,servicePercent:10,items:[{menuId:'m3',qty:1}],version:o.version})).status,409,'unavailable dish');
 // Add more later; a stale version (another waiter) is refused.
 r=await post({action:'save',table:2,servicePercent:10,items:[...o.items,{menuId:'m2',qty:1}].map(i=>({menuId:i.menuId,qty:i.qty,comment:i.comment})),version:o.version});const o2=(await r.json()).order;assert.equal(o2.subtotal,102000);
 assert.equal((await post({action:'save',table:2,servicePercent:10,items:[{menuId:'m1',qty:1}],version:o.version})).status,409,'stale version');
 // Close: receipt number, table free, booking completed; live map free.
 r=await post({action:'close',orderId:o2.id,payment:'cash',version:o2.version});assert.equal(r.status,200);const c=(await r.json()).order;
 assert.match(c.receiptNo,/^Z-\d{6}-0001$/);assert.equal(c.status,'closed');assert.equal(c.total,112200);
 d=await get();assert.equal(d.tables[1].status,'free');assert.equal(db.prepare("SELECT status FROM bookings WHERE id='b1'").get().status,'completed');assert.equal(db.prepare("SELECT status FROM table_live_status WHERE table_number=2").get().status,'free');
 assert.equal((await post({action:'close',orderId:o2.id,payment:'cash'})).status,409,'closed once');
 // Receipt page with its key.
 const key=c.receiptUrl.split('/').pop();let rc=(await (await receipt.GET(new Request('https://test/api/pos/receipt?id='+c.id+'&k='+key))).json()).receipt;assert.equal(rc.table,2);assert.equal(rc.service,10200);assert.equal(rc.customer,'Aziz Karimov');assert.equal(rc.waiter,'Ofitsiant Bobur');
 // Notify: Telegram receipt + SMS, once.
 let n=await (await notify.POST(request('/api/notify-customer',{orderId:c.id}))).json();assert.equal(n.telegram,'sent');assert.equal(n.sms,'sent');
 const tg=sent.find(s=>s.tg);assert.equal(tg.tg.chat_id,'5551');assert.ok(tg.tg.text.includes('Jami to‘lov: 112 200 so‘m')&&tg.tg.text.includes('Muzsiz'));assert.ok(sent.find(s=>s.sms==='998901112233').text.includes('112 200'));
 n=await (await notify.POST(request('/api/notify-customer',{orderId:c.id}))).json();assert.equal(n.reason,'already_sent');
 // A walk-in table (no booking): nothing to send; cancelling a bill with dishes needs a manager.
 o=(await (await post({action:'save',table:1,servicePercent:0,items:[{menuId:'m2',qty:2}]})).json()).order;assert.equal(o.customer,null);
 assert.equal((await post({action:'cancel',orderId:o.id})).status,403);
 user={userId:'owner',role:'restaurant_owner'};assert.equal((await post({action:'cancel',orderId:o.id})).status,200);
 o=(await (await post({action:'save',table:1,servicePercent:15,items:[{menuId:'m2',qty:1}]})).json()).order;await post({action:'close',orderId:o.id,payment:'card'});
 n=await (await notify.POST(request('/api/notify-customer',{orderId:o.id}))).json();assert.equal(n.reason,'no_customer');
 console.log('PASS hall: table statuses with booking card, menu prices + comments + 0/10/15% service, safe concurrent saves, close frees table and completes booking, receipt, Telegram + SMS once');
})().catch(e=>{console.error(e);process.exitCode=1});
