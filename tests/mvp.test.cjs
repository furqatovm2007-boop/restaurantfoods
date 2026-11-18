const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request}=require('./harness.cjs');
// SIMPLE_MVP_MODE: the flag is the same for server and browser; the featured demo "Amanda Restaurant" is
// created once (10 tables, 8 dishes); POST /api/bookings/quick takes name, phone, time and guests — no card,
// deposit or code — keeps every table rule, saves the booking under a guest record, tells the restaurant on
// Telegram and returns the QR pass; a demo restaurant answers with a sample pass and saves nothing.
(async()=>{
 const flag=v=>/SIMPLE_MVP_MODE\s*=\s*(true|false)/.exec(v)[1];
 assert.equal(flag(fs.readFileSync('app/mvp.ts','utf8')),flag(fs.readFileSync('public/mvp-mode.js','utf8')),'server and browser flags agree');
 const html=fs.readFileSync('app/site-html.ts','utf8');assert.ok(html.indexOf('/mvp-mode.js')<html.indexOf('/messages.js')&&html.indexOf('/mvp.js?')<html.indexOf('/restaurant.js'),'the mode loads before the app');
 for(const f of ['app/api/bookings/route.ts','app/deposits.ts','app/booking-otp.ts','app/payme-cards.ts','public/flowers.js','public/ai-chat.js','public/call-ai.js','public/smart-vision.js'])assert.ok(fs.existsSync(f),f+' is kept');

 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...v){args=v;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 DB.batch=async st=>{const out=[];for(const s of st)out.push(await s.run());return out};
 const today=new Date(Date.now()+5*3600000).toISOString().slice(0,10),NOW=Date.parse(today+'T12:00:00+05:00');
 class FixedDate extends Date{constructor(...a){super(...(a.length?a:[NOW]))}static now(){return NOW}}
 const env={DB},cw={'cloudflare:workers':{env}};let user=null;const told=[],limits=new Map();
 const http=load('app/http.ts',cw),limited={...http,throttle:async(k,n)=>{const c=(limits.get(k)||0)+1;limits.set(k,c);if(c>n)throw new http.ApiError(429,'Juda ko‘p urinish.')}};
 const mvp=load('app/mvp.ts',cw);
 assert.equal(await mvp.ensureDemoAmanda(),true);assert.equal(await mvp.ensureDemoAmanda(),false,'created once');
 const a=db.prepare("SELECT name,is_demo,status FROM restaurants WHERE id='rf-demo-amanda'").get();assert.equal(a.name,'Amanda Restaurant');assert.equal(a.is_demo,1);assert.equal(a.status,'active');
 assert.equal(db.prepare("SELECT COUNT(*) n FROM restaurant_tables WHERE restaurant_id='rf-demo-amanda'").get().n,10);
 const dishes=db.prepare("SELECT name,price,image_url FROM menu WHERE restaurant_id='rf-demo-amanda'").all();assert.equal(dishes.length,8);assert.ok(dishes.every(d=>d.price>=10000&&d.image_url.startsWith('/demo-assets/')),'UZS prices and photos');
 for(const d of dishes)assert.ok(fs.existsSync('public'+d.image_url),d.image_url+' exists');
 const route=load('app/api/bookings/quick/route.ts',{...cw,'../../../access':{identity:async()=>user},'../../../http':limited,'../../../table-rules':load('app/table-rules.ts',{'./http':http}),'../../../booking-preorder':load('app/booking-preorder.ts',{'./http':http}),'../../../booking-rules':load('app/booking-rules.ts',{'./http':http},{Date:FixedDate}),'../../../telegram':{notifyBooking:async id=>(told.push(id),true),notifyCustomer:async()=>false},'../../../booking-pass':load('app/booking-pass.ts',cw),'../../../mvp':mvp});
 db.exec("INSERT INTO accounts(id,email,name,created_at,role) VALUES ('owner','o@x','O','now','restaurant_owner')");
 db.prepare("INSERT INTO restaurants(id,name,owner_id,status,tables,floors,booking_open,booking_close,plan,paid_until) VALUES ('r','Real','owner','active',3,1,'08:00','23:00','premium',?)").run(new Date(Date.now()+30*86400000).toISOString());
 db.exec("INSERT INTO restaurant_tables(id,restaurant_id,number,seats,x,y) VALUES ('t1','r',1,4,20,30),('t2','r',2,2,50,30),('t3','r',3,4,80,30)");
 db.exec("INSERT INTO menu(id,restaurant_id,name,price,available) VALUES ('m1','r','Osh',45000,1)");
 const post=x=>route.POST(request('/api/bookings/quick',{restaurantId:'r',date:today,slot:'14:00',endSlot:'16:00',tableNumber:1,tableId:'t1',guests:2,name:'Aziz Karimov',phone:'+998901234567',...x}));
 // Real restaurant: saved under a guest record, no deposit, restaurant told, QR pass returned.
 let r=await post({preorderItems:[{id:'m1',quantity:2}]});assert.equal(r.status,201);let d=await r.json();
 assert.equal(d.demo,false);assert.ok(d.passCode&&d.passPayload==='RFB1:'+d.passCode);assert.equal(d.notified,true);assert.deepEqual(told,[d.id]);assert.equal(d.preorderTotal,90000);
 const b=db.prepare('SELECT * FROM bookings WHERE id=?').get(d.id);assert.equal(b.user_id,'guest:+998901234567');assert.equal(b.deposit_status,'not_required');assert.equal(b.status,'pending');assert.equal(b.pass_code,d.passCode);
 assert.equal(db.prepare("SELECT name,provider FROM accounts WHERE id='guest:+998901234567'").get().name,'Aziz Karimov');
 // The table rules stay.
 assert.equal((await post({phone:'+998901111111'})).status,409,'overlap refused');
 assert.equal((await post({tableNumber:2,tableId:'t2',guests:3,phone:'+998902222222'})).status,400,'too many guests');
 assert.equal((await post({tableNumber:3,tableId:'t1',phone:'+998903333333'})).status,409,'table id must match');
 assert.equal((await post({phone:'12345',tableNumber:3,tableId:'t3'})).status,400,'phone format');
 assert.equal((await post({name:'',tableNumber:3,tableId:'t3',phone:'+998904444444'})).status,400,'name required');
 assert.equal((await post({slot:'22:30',endSlot:'23:30',tableNumber:3,tableId:'t3',phone:'+998905555555'})).status,400,'after closing');
 db.exec("INSERT INTO app_settings(key,value,updated_at,updated_by) VALUES ('tablemeta:r','{\"3\":{\"walkin\":true}}','now','owner')");
 assert.equal((await post({tableNumber:3,tableId:'t3',phone:'+998906666666'})).status,409,'walk-in table');
 // A signed-in customer books under their own account.
 db.exec("INSERT INTO accounts(id,email,name,created_at,role) VALUES ('c1','c@x','C','now','customer')");user={userId:'c1',role:'customer'};
 r=await post({slot:'18:00',endSlot:'19:00',phone:'+998907777777'});d=await r.json();assert.equal(r.status,201);assert.equal(db.prepare('SELECT user_id FROM bookings WHERE id=?').get(d.id).user_id,'c1');user=null;
 // At most 5 per phone an hour (and 10 per network).
 limits.clear(); for(let i=0;i<5;i++)await post({slot:'10:00',endSlot:'10:30',phone:'+998908888888'});assert.equal((await post({slot:'10:00',endSlot:'10:30',phone:'+998908888888'})).status,429);limits.clear();for(let i=0;i<10;i++)limits.set([...limits.keys()].find(k=>k.includes(':ip:'))||'quick-booking:ip:unknown',i+1);assert.equal((await post({slot:'11:00',endSlot:'11:30',phone:'+998908888880'})).status,429,'network limit');
 // Demo: same checks, a sample pass, nothing saved or sent.
 limits.clear(); const before=db.prepare('SELECT COUNT(*) n FROM bookings').get().n,toldBefore=told.length;
 r=await post({restaurantId:'rf-demo-amanda',tableNumber:4,tableId:'rf-demo-amanda-t4',phone:'+998909999999'});d=await r.json();assert.equal(r.status,201);
 assert.equal(d.demo,true);assert.match(d.passCode,/^DEMO-/);assert.equal(d.restaurant,'Amanda Restaurant');
 assert.equal(db.prepare('SELECT COUNT(*) n FROM bookings').get().n,before,'demo not saved');assert.equal(told.length,toldBefore,'demo not sent');
 assert.equal((await post({restaurantId:'rf-demo-amanda',tableNumber:1,tableId:'rf-demo-amanda-t1',guests:6,phone:'+998909999990'})).status,400,'demo keeps the seat rule');
 console.log('PASS MVP mode: flags agree, Amanda demo seeded once, quick booking (guest record, no deposit, Telegram, QR pass), table rules kept, per-phone limit, demo answers without saving.');
})().catch(e=>{console.error(e);process.exitCode=1});
