const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request}=require('./harness.cjs');
// SIMPLE_MVP_MODE: the flag is the same for server and browser; the featured demo "Amanda Restaurant" is
// created once (10 tables, 8 dishes); POST /api/bookings/quick (Telegram checkout) takes time and guests — no
// card, deposit or code; name and phone come from Telegram — keeps every table rule, tells the restaurant on
// Telegram; a demo restaurant answers with a sample and saves nothing.
(async()=>{
 const flag=v=>/SIMPLE_MVP_MODE\s*=\s*(true|false)/.exec(v)[1];
 assert.equal(flag(fs.readFileSync('app/mvp.ts','utf8')),flag(fs.readFileSync('public/mvp-mode.js','utf8')),'server and browser flags agree');
 const mode=v=>/MVP_CHECKOUT[^=]*=\s*'(telegram|guest)'/.exec(v)[1];assert.equal(mode(fs.readFileSync('app/mvp.ts','utf8')),mode(fs.readFileSync('public/mvp-mode.js','utf8')),'checkout modes agree');
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
 const routeFor=mode=>load('app/api/bookings/quick/route.ts',{...cw,'../../../access':{identity:async()=>user},'../../../http':limited,'../../../table-rules':load('app/table-rules.ts',{'./http':http}),'../../../booking-preorder':load('app/booking-preorder.ts',{'./http':http}),'../../../booking-rules':load('app/booking-rules.ts',{'./http':http},{Date:FixedDate}),'../../../telegram':{notifyBooking:async id=>(told.push(id),true),notifyCustomer:async()=>false},'../../../booking-pass':load('app/booking-pass.ts',cw),'../../../mvp':{...mvp,MVP_CHECKOUT:mode},'../../../telegram-login':{botUsername:()=>'rf_bot'}});
 const route=routeFor('telegram');
 db.exec("INSERT INTO accounts(id,email,name,created_at,role) VALUES ('owner','o@x','O','now','restaurant_owner')");
 db.prepare("INSERT INTO restaurants(id,name,owner_id,status,tables,floors,booking_open,booking_close,plan,paid_until) VALUES ('r','Real','owner','active',3,1,'08:00','23:00','premium',?)").run(new Date(Date.now()+30*86400000).toISOString());
 db.exec("INSERT INTO restaurant_tables(id,restaurant_id,number,seats,x,y) VALUES ('t1','r',1,4,20,30),('t2','r',2,2,50,30),('t3','r',3,4,80,30)");
 db.exec("INSERT INTO menu(id,restaurant_id,name,price,available) VALUES ('m1','r','Osh',45000,1)");
 const post=x=>route.POST(request('/api/bookings/quick',{restaurantId:'r',date:today,slot:'14:00',endSlot:'16:00',tableNumber:1,tableId:'t1',guests:2,...x}));
 // Telegram checkout: no sign-in → 401; a non-Telegram account → 401; Telegram without a phone → 428.
 assert.equal((await post({})).status,401);assert.equal((await (await post({})).json()).error,'TELEGRAM_LOGIN');
 db.exec("INSERT INTO accounts(id,email,name,created_at,role) VALUES ('mail','m@x','Mail','now','customer')");user={userId:'mail',role:'customer'};assert.equal((await post({})).status,401,'email account is not enough');
 db.exec("INSERT INTO accounts(id,email,name,created_at,role,telegram_chat_id) VALUES ('tg:500','','Aziz Karimov','now','customer','500')");user={userId:'tg:500',role:'customer'};
 let r=await post({});assert.equal(r.status,428);assert.equal((await r.json()).error,'TELEGRAM_PHONE');
 db.exec("UPDATE accounts SET contact_phone='+998901234567',contact_phone_verified=1,telegram_phone='+998901234567' WHERE id='tg:500'");
 // Booked under the Telegram account: name and phone from Telegram, no deposit, restaurant told, summary returned.
 r=await post({name:'Ignored',phone:'+998999999999',preorderItems:[{id:'m1',quantity:2}]});assert.equal(r.status,201);let d=await r.json();
 assert.equal(d.demo,false);assert.equal(d.name,'Aziz Karimov');assert.equal(d.phone,'+998901234567');assert.equal(d.table,1);assert.equal(d.slot,'14:00');assert.equal(d.notified,true);assert.deepEqual(told,[d.id]);assert.equal(d.preorderTotal,90000);
 const b=db.prepare('SELECT * FROM bookings WHERE id=?').get(d.id);assert.equal(b.user_id,'tg:500');assert.equal(b.phone,'+998901234567');assert.equal(b.deposit_status,'not_required');assert.equal(b.status,'pending');
 // The table rules stay.
 limits.clear(); assert.equal((await post({})).status,409,'overlap refused');
 assert.equal((await post({tableNumber:2,tableId:'t2',guests:3})).status,400,'too many guests');
 assert.equal((await post({tableNumber:3,tableId:'t1'})).status,409,'table id must match');
 assert.equal((await post({slot:'22:30',endSlot:'23:30',tableNumber:3,tableId:'t3'})).status,400,'after closing');
 limits.clear();db.exec("INSERT INTO app_settings(key,value,updated_at,updated_by) VALUES ('tablemeta:r','{\"3\":{\"walkin\":true}}','now','owner')");
 assert.equal((await post({tableNumber:3,tableId:'t3'})).status,409,'walk-in table');
 // At most 5 per phone an hour (and 10 per network).
 limits.clear();for(let i=0;i<5;i++)await post({slot:'10:00',endSlot:'10:30'});assert.equal((await post({slot:'10:00',endSlot:'10:30'})).status,429);
 limits.clear();limits.set('quick-booking:ip:unknown',10);assert.equal((await post({slot:'11:00',endSlot:'11:30'})).status,429,'network limit');
 // The restaurant's Telegram card: the guest's Telegram profile and ✅ Tasdiqlash / ❌ Joy band.
 const tgm=load('app/telegram.ts',{...cw,'./otp-store':load('app/otp-store.ts',cw),'./telegram-login':{createMagicLink:async()=>'',saveTelegramUsername:async()=>{}}});
 const card=tgm.bookingText({id:'x',restaurant_name:'Real',phone:'+998901234567',table_number:4,date:today,slot:'19:00',end_slot:'21:00',guests:2,deposit_status:'not_required',status:'pending',customer_name:'Aziz',customer_chat:'500',customer_username:'aziz_k'});
 assert.match(card,/<a href="tg:\/\/user\?id=500">Aziz<\/a> \(@aziz_k\) · \+998 90 123 45 67/);
 assert.equal(tgm.bookingKeyboard('x').inline_keyboard[0].map(b=>b.text).join('|'),'✅ Tasdiqlash (Confirm)|❌ Joy band (Reject)');
 // Guest checkout (name + phone typed in): saved under a guest record, the restaurant told, and a one-tap
 // t.me/<bot>?start=book_<id> link; that link gives the booking to the first Telegram chat that opens it.
 user=null;limits.clear();const guest=routeFor('guest');
 const gpost=x=>guest.POST(request('/api/bookings/quick',{restaurantId:'r',date:today,slot:'18:00',endSlot:'19:00',tableNumber:1,tableId:'t1',guests:2,name:'Dilnoza',phone:'+998 90 555 66 77',...x}));
 assert.equal((await gpost({name:''})).status,400,'name required');assert.equal((await gpost({phone:'123'})).status,400,'phone format');
 r=await gpost({});assert.equal(r.status,201);d=await r.json();assert.equal(d.name,'Dilnoza');assert.equal(d.phone,'+998905556677');assert.equal(d.telegramLink,'https://t.me/rf_bot?start=book_'+d.id);
 assert.equal(db.prepare('SELECT user_id FROM bookings WHERE id=?').get(d.id).user_id,'guest:+998905556677');assert.ok(told.includes(d.id),'restaurant told');
 const sentTg=[];const tgb=load('app/telegram.ts',{...cw,'./otp-store':load('app/otp-store.ts',cw),'./telegram-login':{createMagicLink:async()=>'',saveTelegramUsername:async()=>{}}});
 const msg=(chat,text)=>({message:{chat:{id:chat},from:{id:chat},text}});
 assert.equal(await tgb.handleUpdate(msg(901,'/start book_'+d.id)),'book_claimed');assert.equal(db.prepare("SELECT value FROM app_settings WHERE key=?").get('bookchat:'+d.id).value,'901');
 assert.equal(await tgb.handleUpdate(msg(902,'/start book_'+d.id)),'book_claim_taken','another chat cannot take it');
 assert.equal(await tgb.handleUpdate(msg(901,'/start book_'+d.id)),'book_claimed','the same chat again is fine');
 assert.equal(await tgb.handleUpdate(msg(901,'/start book_00000000-0000-0000-0000-000000000000')),'book_claim_missing');
 // Demo: same checks, a sample pass, nothing saved or sent.
 user={userId:'tg:500',role:'customer'}; limits.clear(); const before=db.prepare('SELECT COUNT(*) n FROM bookings').get().n,toldBefore=told.length;
 r=await post({restaurantId:'rf-demo-amanda',tableNumber:4,tableId:'rf-demo-amanda-t4'});d=await r.json();assert.equal(r.status,201);
 assert.equal(d.demo,true);assert.match(d.passCode,/^DEMO-/);assert.equal(d.restaurant,'Amanda Restaurant');
 assert.equal(db.prepare('SELECT COUNT(*) n FROM bookings').get().n,before,'demo not saved');assert.equal(told.length,toldBefore,'demo not sent');
 assert.equal((await post({restaurantId:'rf-demo-amanda',tableNumber:1,tableId:'rf-demo-amanda-t1',guests:6})).status,400,'demo keeps the seat rule');
 console.log('PASS MVP mode: flags agree, guest checkout with a one-tap Telegram link (first chat keeps the booking), Amanda demo seeded once, Telegram-only checkout (401 / 428), booking under the Telegram account with name and phone from Telegram, restaurant card with profile link and Confirm / Reject, table rules kept, limits, demo answers without saving.');
})().catch(e=>{console.error(e);process.exitCode=1});
