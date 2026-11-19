const assert=require('node:assert/strict'),fs=require('node:fs'),zlib=require('node:zlib'),{DatabaseSync}=require('node:sqlite'),{load,request}=require('./harness.cjs');
// SIMPLE_MVP_MODE guest policy + central-card prepayment:
//  - self-cancel until 1 hour before (site PATCH and the bot), the restaurant told "⚠️ Bron bekor qilindi! …",
//    the last hour locked with the restaurant's phone; 2 cancellations in 7 days restrict 1-click booking;
//  - prepayment: the booking is held (p2p_wait, restaurant not told), the receipt goes to the owner's Telegram
//    once (same picture refused), ✅ confirms + tells the restaurant and the guest, ⚠️ asks again, 🚫 bans.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...v){args=v;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 const env={DB,TELEGRAM_BOT_TOKEN:'1:x',TELEGRAM_WEBHOOK_SECRET:'s',SITE_URL:'https://restaurantfoods.online'},cw={'cloudflare:workers':{env}};
 const sent=[];const fetch=async(url,init)=>{const method=String(url).split('/').pop();if(init.body instanceof FormData){sent.push({method,chat:init.body.get('chat_id'),caption:init.body.get('caption'),markup:JSON.parse(init.body.get('reply_markup')||'{}')});return Response.json({ok:true,result:{}})}const body=JSON.parse(init.body);sent.push({method,body});return Response.json({ok:true,result:method==='sendMessage'?{message_id:sent.length}:true})};
 const http=load('app/http.ts',cw),i18n=load('app/bot-i18n.ts',cw),rules=load('app/booking-rules.ts',{'./http':http});
 const tg=load('app/telegram.ts',{...cw,'./otp-store':load('app/otp-store.ts',cw),'./telegram-login':{createMagicLink:async()=>'',saveTelegramUsername:async()=>{}},'./bot-i18n':i18n},{fetch});
 const policy=load('app/guest-policy.ts',{...cw,'./telegram':tg,'./booking-rules':rules});
 const mvpCfg={SIMPLE_MVP_MODE:true,MVP_CHECKOUT:'guest',AMANDA_ID:'rf-demo-amanda',ensureDemoAmanda:async()=>false,CENTRAL_PAYMENT_CARD:'8600 XXXX XXXX XXXX',CENTRAL_PAYMENT_HOLDER:'MUHAMMADJON F.',SUPER_ADMIN_TG_ID:'4242'};
 const p2pFor=cfg=>load('app/p2p.ts',{...cw,'./http':http,'./telegram':tg,'./health':{adminChats:async()=>['1000']},'./mvp':cfg,'./image-content':load('app/image-content.ts',{}),'./guest-policy':policy},{fetch,FormData,Blob});
 let p2p=p2pFor(mvpCfg);
 assert.equal(await p2p.p2pEnabled(),false,'placeholder card (X) keeps prepayment off');
 const real={...mvpCfg,CENTRAL_PAYMENT_CARD:'8600 1234 5678 9012'};p2p=p2pFor(real);assert.equal(await p2p.p2pEnabled(),true);assert.equal(JSON.stringify(await p2p.ownerChats()),'["4242"]','SUPER_ADMIN_TG_ID first');

 db.exec("INSERT INTO accounts(id,email,name,created_at,role,telegram_chat_id) VALUES ('owner','o@x','O','now','restaurant_owner','900'),('guest:a','','Dilnoza','now','customer',NULL),('tg:7','','Aziz','now','customer','7')");
 db.exec("INSERT INTO restaurants(id,name,owner_id,status,tables,floors,booking_open,booking_close,phone,deposit_amount) VALUES ('r','Amanda','owner','active',9,1,'08:00','23:00','+998 66 233 44 55',0)");
 db.exec("INSERT INTO restaurant_tables(id,restaurant_id,number,seats,x,y) VALUES ('t1','r',1,4,10,10),('t2','r',2,4,20,10),('t3','r',3,4,30,10),('t4','r',4,4,40,10),('t5','r',5,4,50,10)");
 db.exec("INSERT INTO menu(id,restaurant_id,name,price,available) VALUES ('m1','r','Osh',45000,1)");
 const day=new Date(Date.now()+5*3600000+86400000).toISOString().slice(0,10),soonDate=new Date(Date.now()+5*3600000+40*60000).toISOString().slice(0,10),soonSlot=new Date(Date.now()+5*3600000+40*60000).toISOString().slice(11,16);
 const ins=(id,user,date,slot,table,phone,dep='not_required')=>db.prepare("INSERT INTO bookings(id,restaurant_id,user_id,date,slot,table_number,guests,phone,status,created_at,deposit_status) VALUES (?,?,?,?,?,?,2,?,'pending','now',?)").run(id,'r',user,date,slot,table,phone,dep);

 // 1) Site cancel (PATCH, MVP path): more than 1 hour before → cancelled, strike, restaurant alert.
 const {integrationDeps}=require('./harness.cjs'),plans=load('app/plans.ts',{...cw,'./http':http});
 const bdeps={...cw,'../../access':{identity:async()=>({userId:'guest:a',role:'customer'})},'../../http':http,'../../plans':plans,'../../geo':load('app/geo.ts',{'./http':http}),'../../table-rules':load('app/table-rules.ts',{'./http':http}),'../../booking-rules':rules,'../../booking-preorder':load('app/booking-preorder.ts',{'./http':http})};Object.assign(bdeps,integrationDeps(env,http));
 const bookingsRoute=load('app/api/bookings/route.ts',{...bdeps,'../../mvp':{SIMPLE_MVP_MODE:true},'../../guest-policy':policy,'../../telegram':tg});
 ins('c1','guest:a',day,'19:00',1,'+998901112233');
 sent.length=0;let r=await bookingsRoute.PATCH(request('/api/bookings',{id:'c1'},'PATCH'));assert.equal(r.status,200);
 assert.equal(db.prepare("SELECT status FROM bookings WHERE id='c1'").get().status,'cancelled','table free again');
 const alert=sent.find(s=>s.body?.chat_id==='900').body.text;assert.ok(alert.startsWith('⚠️ <b>Bron bekor qilindi!</b> Mijoz: Dilnoza (+998901112233), Stol #1, Vaqt: 19:00. Stol yana bo‘sh.'),alert);
 assert.equal(await policy.strikeCount(['ph:+998901112233']),1);
 // Last hour: locked, the restaurant's phone shown.
 ins('c2','guest:a',soonDate,soonSlot,2,'+998901112233');r=await bookingsRoute.PATCH(request('/api/bookings',{id:'c2'},'PATCH'));assert.equal(r.status,400);
 assert.equal((await r.json()).error,'Bron vaqtiga 1 soatdan kam qoldi. Bekor qilish uchun restoran admini bilan bog‘laning: +998 66 233 44 55');
 assert.equal(db.prepare("SELECT status FROM bookings WHERE id='c2'").get().status,'pending');
 // GET lists the restaurant phone for the profile's lock text.
 const list=await (await bookingsRoute.GET()).json();assert.equal(list.find(b=>b.id==='c2').restaurant_phone,'+998 66 233 44 55');

 // 2) Bot cancel from "Mening bronlarim" (chat that owns the booking): ask, then cancel.
 const menu=load('app/telegram-menu.ts',{...cw,'qrcode-generator':{default:require('qrcode-generator')},'./telegram':tg,'./booking-pass':load('app/booking-pass.ts',cw),'./mvp':{SIMPLE_MVP_MODE:true},'./guest-policy':policy,'./bot-i18n':i18n},{fetch,FormData,Blob,CompressionStream,Response});
 ins('c3','tg:7',day,'20:00',3,'+998935556677');
 const cb=(data,chat)=>({callback_query:{id:'q',data,from:{id:Number(chat)},message:{chat:{id:Number(chat),type:'private'},message_id:3}}});
 sent.length=0;assert.equal(await menu.handleMenu(cb('my_bookings','7')),'menu_bookings');const card=sent.find(s=>s.markup||s.body?.reply_markup);const kb=(card.markup||card.body.reply_markup).inline_keyboard;assert.ok(kb.some(r=>r[0].callback_data==='bk:c:c3'),'cancel button under the booking');
 assert.equal(await menu.handleMenu(cb('bk:y:c3','55')),'cancel_missing','another chat cannot cancel');
 sent.length=0;assert.equal(await menu.handleMenu(cb('bk:c:c3','7')),'cancel_ask');assert.equal(sent.find(s=>s.method==='sendMessage').body.reply_markup.inline_keyboard[0][0].callback_data,'bk:y:c3');
 sent.length=0;assert.equal(await menu.handleMenu(cb('bk:y:c3','7')),'cancel_done');assert.equal(db.prepare("SELECT status FROM bookings WHERE id='c3'").get().status,'cancelled');assert.ok(sent.some(s=>s.body?.chat_id==='900'&&/Bron bekor qilindi!/.test(s.body.text)));
 ins('c4','tg:7',soonDate,soonSlot,4,'+998935556677');sent.length=0;assert.equal(await menu.handleMenu(cb('bk:c:c4','7')),'cancel_too_late');assert.match(sent.find(s=>s.method==='sendMessage').body.text,/1 soatdan kam qoldi.*\+998 66 233 44 55/);

 // 3) Strikes: a second cancellation restricts 1-click booking for that phone (and chat).
 ins('c5','guest:a',day,'21:00',5,'+998901112233');await bookingsRoute.PATCH(request('/api/bookings',{id:'c5'},'PATCH'));
 assert.equal(await policy.restricted(['ph:+998901112233']),true);assert.equal(await policy.restricted(['ph:+998901112233'],Date.now()+8*86400000),false,'lifts after 7 days');
 const NOW=Date.now();
 const quickFor=(cfg,user=null)=>load('app/api/bookings/quick/route.ts',{...cw,'../../../access':{identity:async()=>user},'../../../http':{...http,throttle:async()=>{}},'../../../table-rules':load('app/table-rules.ts',{'./http':http}),'../../../booking-preorder':load('app/booking-preorder.ts',{'./http':http}),'../../../booking-rules':rules,'../../../telegram':{notifyBooking:async id=>(told.push(id),true),notifyCustomer:async()=>false},'../../../booking-pass':load('app/booking-pass.ts',cw),'../../../mvp':cfg,'../../../telegram-login':{botUsername:()=>'rf_bot',issueSession:async()=>{}},'../../../phone-codes':load('app/phone-codes.ts',{'./http':http}),'../../../guest-policy':policy,'../../../p2p':p2pFor(cfg),'../../../deposits':{DEPOSIT_MIN:100000}});
 const told=[];
 const qpost=(route,x)=>route.POST(request('/api/bookings/quick',{restaurantId:'r',date:day,slot:'12:00',endSlot:'13:00',tableNumber:2,tableId:'t2',guests:2,name:'Dilnoza',phone:'+998 90 111 22 33',...x}));
 r=await qpost(quickFor(mvpCfg),{});assert.equal(r.status,403);assert.equal((await r.json()).error,policy.STRIKE_MESSAGE,'no prepayment available: blocked');
 // With the central card on, the restricted guest may book by prepaying 100 000.
 told.length=0;r=await qpost(quickFor(real),{});assert.equal(r.status,201);let d=await r.json();assert.equal(d.payment.amount,100000);assert.equal(d.payment.card,'8600 1234 5678 9012');assert.equal(d.payment.holder,'MUHAMMADJON F.');assert.match(d.restricted,/cheklov/);
 assert.equal(db.prepare('SELECT deposit_status,status FROM bookings WHERE id=?').get(d.id).deposit_status,'p2p_wait');assert.equal(told.length,0,'restaurant not told before the payment');
 // Pre-ordered dishes → prepayment of exactly their total (no strike for this phone).
 r=await qpost(quickFor(real),{phone:'+998 97 000 11 22',tableNumber:3,tableId:'t3',preorderItems:[{id:'m1',quantity:6}]});const pre=await r.json();assert.equal(pre.payment.total,270000);assert.equal(pre.payment.minDeposit,100000,'advance from 100 000');
 // Nothing to prepay → booked at once, restaurant told.
 r=await qpost(quickFor(real),{phone:'+998 97 000 33 44',tableNumber:4,tableId:'t4'});const plain=await r.json();assert.equal(plain.payment,undefined);assert.deepEqual(told,[plain.id]);

 // 4) Receipt: owner gets the photo with the checklist and 3 buttons; the same picture is refused.
 const png=seed=>{const chunk=(t,data)=>{const b=Buffer.alloc(12+data.length);b.writeUInt32BE(data.length,0);b.write(t,4,'ascii');data.copy(b,8);b.writeUInt32BE(zlib.crc32(Buffer.concat([Buffer.from(t,'ascii'),data]))>>>0,8+data.length);return b};const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(1,0);ihdr.writeUInt32BE(1,4);ihdr[8]=8;ihdr[9]=0;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(Buffer.from([0,seed]))),chunk('IEND',Buffer.alloc(0))])};
 const userId=db.prepare('SELECT user_id FROM bookings WHERE id=?').get(pre.id).user_id;
 const up=(id,bytes,uid=userId,deposit)=>p2p.submitReceipt(id,uid,new Request('https://test/api/bookings/p2p?id='+id,{method:'POST',body:bytes,headers:{'Content-Type':'image/png'}}),Date.now(),deposit);
 await assert.rejects(up(pre.id,png(1),'guest:other'),e=>e.status===404,'only the booking’s browser');
 await assert.rejects(up(pre.id,Buffer.from('not an image')),e=>e.status===400);
 await assert.rejects(up(pre.id,png(9),userId,50000),e=>e.status===400,'advance below the minimum');await assert.rejects(up(pre.id,png(9),userId,300000),e=>e.status===400,'more than the bill');
 sent.length=0;const out=await up(pre.id,png(1),userId,100000);assert.equal(out.status,'p2p_review');assert.equal(out.remaining,170000);
 const photo=sent.find(s=>s.method==='sendPhoto');assert.equal(photo.chat,'4242');
 for(const part of ['💰 Kutilayotgan summa: <b>100 000 UZS</b>','🧾 Jami zakaz summasi: <b>270 000 UZS</b>','✅ Hozir o‘tkazilgan avans (Depozit): <b>100 000 UZS</b>','💳 Qoldiq (Restoranda to‘lanadi): <b>170 000 UZS</b>','🕒 Zakaz vaqti: <b>','(chekdagi vaqt bilan solishtiring!)','🏪 Restoran: <b>Amanda</b> | Stol #3','👤 Mijoz: Dilnoza (+998970001122)','🍽 Taomlar: Osh × 6'])assert.ok(photo.caption.includes(part),part);
 assert.deepEqual([...photo.markup.inline_keyboard.map(r=>r[0].callback_data)],['pp:ok:'+pre.id,'pp:re:'+pre.id,'pp:ban:'+pre.id]);
 assert.deepEqual(photo.markup.inline_keyboard.map(r=>r[0].text),['✅ Pul tushdi (Tasdiqlash)','⚠️ Chek noaniq (Qayta so‘rash)','🚫 Soxta chek (Bloklash)']);
 const userId2=db.prepare('SELECT user_id FROM bookings WHERE id=?').get(d.id).user_id;
 await assert.rejects(p2p.submitReceipt(d.id,userId2,new Request('https://test/x',{method:'POST',body:png(1)})),e=>e.status===409&&e.message===p2p.DUPLICATE_RECEIPT,'same picture for another booking');

 // 5) Owner buttons: only the owner's chat; ⚠️ asks again; ✅ confirms and tells restaurant + guest.
 const ownerCb=(data,chat='4242')=>({callback_query:{id:'q',data,message:{chat:{id:Number(chat)},message_id:5,caption:'🧾 …'}}});
 assert.equal(await p2p.handleP2P(ownerCb('pp:ok:'+pre.id,'999')),'p2p_denied');
 db.prepare("INSERT INTO app_settings(key,value,updated_at,updated_by) VALUES (?,?,'now','t')").run('bookchat:'+pre.id,'77');
 sent.length=0;assert.equal(await p2p.handleP2P(ownerCb('pp:re:'+pre.id)),'p2p_again');assert.equal(db.prepare('SELECT deposit_status FROM bookings WHERE id=?').get(pre.id).deposit_status,'p2p_wait');assert.match(sent.find(s=>s.body?.chat_id==='77').body.text,/noaniq/);
 sent.length=0;await up(pre.id,png(2),userId,100000);sent.length=0;assert.equal(await p2p.handleP2P(ownerCb('pp:ok:'+pre.id)),'p2p_confirmed');
 {const st=await p2p.p2pState(pre.id);assert.equal(st.paid,100000);assert.equal(st.remaining,170000);assert.equal(st.paymentStatus,'partially_paid');}
 let row=db.prepare('SELECT status,deposit_status FROM bookings WHERE id=?').get(pre.id);assert.equal(row.status,'confirmed');assert.equal(row.deposit_status,'p2p_paid');
 const rCard=sent.find(s=>s.body?.chat_id==='900').body.text;assert.match(rCard,/Oldindan to‘lov markaziy hisobga qabul qilindi/);for(const line of ['🧾 Jami hisob: <b>270 000 UZS</b>','✅ Oldindan to‘langan: <b>100 000 UZS</b>','💳 Restoranda qolgan to‘lov: <b>170 000 UZS</b>'])assert.ok(rCard.includes(line),line);
 {const g=sent.find(s=>s.body?.chat_id==='77').body.text;assert.ok(g.startsWith('✅ To‘lovingiz tasdiqlandi va stolingiz band qilindi!'));assert.ok(g.includes('💳 Restoranda qolgan to‘lov: <b>170 000 UZS</b>'));}
 {const listed=await (await load('app/api/bookings/route.ts',{...bdeps,'../../access':{identity:async()=>({userId,role:'customer'})},'../../mvp':{SIMPLE_MVP_MODE:true},'../../guest-policy':policy,'../../telegram':tg}).GET()).json();const ps=JSON.parse(listed.find(b=>b.id===pre.id).p2p_state);assert.equal(ps.paid,100000);assert.equal(ps.total,270000);}
 assert.equal(await p2p.handleP2P(ownerCb('pp:ok:'+pre.id)),'p2p_stale','pressed once');
 // 🚫 fake: cancelled, phone + Telegram banned, the next booking refused.
 await up(d.id,png(3),userId2);assert.equal((await p2p.p2pState(d.id)).deposit,100000,'no advance choice: the full amount');db.prepare("INSERT INTO app_settings(key,value,updated_at,updated_by) VALUES (?,?,'now','t')").run('bookchat:'+d.id,'88');
 sent.length=0;assert.equal(await p2p.handleP2P(ownerCb('pp:ban:'+d.id)),'p2p_banned');assert.equal(db.prepare('SELECT status FROM bookings WHERE id=?').get(d.id).status,'cancelled');
 assert.equal(await policy.banned(['ph:+998901112233']),true);assert.equal(await policy.banned(['tg:88']),true);assert.ok(!sent.some(s=>s.body?.chat_id==='900'),'restaurant never bothered');
 r=await qpost(quickFor(real),{slot:'15:00',endSlot:'16:00'});assert.equal(r.status,403);assert.equal((await r.json()).error,policy.BAN_MESSAGE);

 // 6) A transfer that never came: the table is released after 30 minutes.
 r=await qpost(quickFor(real),{phone:'+998 97 555 66 77',tableNumber:5,tableId:'t5',slot:'18:00',endSlot:'19:00',preorderItems:[{id:'m1',quantity:1}]});const late=await r.json();
 assert.equal((await p2p.sweepP2P(NOW+10*60000)).released,0);assert.equal((await p2p.sweepP2P(Date.now()+31*60000)).released,1);assert.equal(db.prepare('SELECT status FROM bookings WHERE id=?').get(late.id).status,'cancelled');
 console.log('PASS guest policy + central-card prepayment: 1-hour self-cancel (site + bot) with restaurant alert, lock text with phone, 2 strikes / 7 days, prepayment held without telling the restaurant, receipt checklist + 3 owner buttons, duplicate picture refused, confirm / ask again / ban, unpaid hold released');
})().catch(e=>{console.error(e);process.exitCode=1});
