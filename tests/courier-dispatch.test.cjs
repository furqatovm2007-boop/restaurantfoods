const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load}=require('./harness.cjs');
// 🛵 10-second courier offers: only online, approved, free couriers with Telegram; ✅ in time assigns the order;
// ❌ or a timeout moves the offer to the next courier and edits the message; a late ✅ is refused.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return {sql,bind(...a){args=a;return this},first:async()=>db.prepare(sql).get(...args),all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 const sent=[];let mid=100;const tg={telegram:async(method,p)=>{sent.push({method,...p});return method==='sendMessage'?{message_id:++mid}:true},html:x=>String(x),restaurantChats:async()=>['rest-chat'],site:()=>'https://rf.test'};
 const d=load('app/courier-dispatch.ts',{'cloudflare:workers':{env:{DB}},'./telegram':tg,'../lib/after-response':{afterResponse:()=>{}}});
 const now=new Date().toISOString();
 const acc=(id,role,chat,approved=1)=>db.prepare("INSERT INTO accounts(id,email,name,role,created_at,courier_approved,telegram_chat_id) VALUES (?,?,?,?,?,?,?)").run(id,id+'@x.uz',id,role,now,approved,chat);
 acc('o1','restaurant_owner',null);acc('c','customer',null);acc('k1','courier','111');acc('k2','courier','222');acc('k3','courier',null);acc('k4','courier','444',0);
 db.prepare("INSERT INTO restaurants(id,name,owner_id,status,tables,floors,booking_open,booking_close) VALUES ('r1','Osh Markazi','o1','active',5,1,'09:00','23:00')").run();
 const order=(id,status='confirmed')=>db.prepare("INSERT INTO orders(id,restaurant_id,user_id,items,total,phone,status,created_at,fulfillment,delivery_address,delivery_fee,delivery_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").run(id,'r1','c','[]',105000,'+998901112233',status,now,'delivery','Registon 5',15000,'unassigned');
 const offer=id=>JSON.parse(db.prepare("SELECT value FROM app_settings WHERE key=?").get('offer:'+id)?.value||'null');
 const cb=(chat,data,msg)=>({callback_query:{id:'q',data,message:{chat:{id:chat},message_id:msg}}});
 order('A');
 // Nobody online: the restaurant hears it once.
 await d.startDispatch('A');assert.equal(offer('A').none,true);assert.ok(sent.some(m=>m.chat_id==='rest-chat'&&/kuryer topilmadi/.test(m.text)));
 await d.setCourierOnline('k1',true);await new Promise(r=>setTimeout(r,5));await d.setCourierOnline('k2',true);await d.setCourierOnline('k3',true);await d.setCourierOnline('k4',true);
 sent.length=0;await d.advanceOffers(true);
 let of=offer('A');assert.equal(of.courier,'k1','first online courier with Telegram');assert.ok(of.expires>Date.now()&&of.expires<=Date.now()+10000);
 const m1=sent.find(m=>m.chat_id==='111');assert.match(m1.text,/10 soniya/);assert.match(m1.text,/Osh Markazi/);assert.match(m1.text,/Registon 5/);assert.match(m1.text,/15 000 so‘m/);assert.deepEqual(JSON.parse(JSON.stringify(m1.reply_markup.inline_keyboard[0].map(b=>b.callback_data))),['co:a:A','co:r:A']);
 // Someone else's chat cannot answer.
 assert.equal(await d.handleCourierOffer(cb('222','co:a:A',of.msg)),'offer_stale');
 // ❌ → k2 is asked, k1's message says the time is over.
 sent.length=0;assert.equal(await d.handleCourierOffer(cb('111','co:r:A',of.msg)),'offer_rejected');
 assert.ok(sent.some(m=>m.method==='editMessageText'&&m.chat_id==='111'&&/Vaqt tugadi/.test(m.text)));of=offer('A');assert.equal(of.courier,'k2');assert.deepEqual(JSON.parse(JSON.stringify(of.tried)),['k1','k2']);
 // 10 s pass (simulated): the sweep expires it; nobody left → none.
 db.prepare("UPDATE app_settings SET value=json_set(value,'$.expires',CAST(? AS INTEGER)) WHERE key='offer:A'").run(Date.now()-2000);
 const late=offer('A');sent.length=0;await d.advanceOffers(true);assert.equal(offer('A').courier,null);assert.equal(offer('A').none,true);assert.ok(sent.some(m=>m.method==='editMessageText'&&m.chat_id==='222'));
 // A late ✅ on the expired message is refused.
 assert.equal(await d.handleCourierOffer(cb('222','co:a:A',late.msg)),'offer_stale');assert.equal(db.prepare("SELECT courier_id FROM orders WHERE id='A'").get().courier_id,null);
 // New order: ✅ in time assigns it; the restaurant is told; a busy courier is not asked again.
 order('B');sent.length=0;await d.startDispatch('B');of=offer('B');assert.equal(of.courier,'k1');
 assert.equal(await d.handleCourierOffer(cb('111','co:a:B',of.msg)),'offer_accepted');
 const row=db.prepare("SELECT courier_id,delivery_status FROM orders WHERE id='B'").get();assert.equal(row.courier_id,'k1');assert.equal(row.delivery_status,'assigned');assert.equal(offer('B'),null);
 assert.ok(sent.some(m=>m.chat_id==='rest-chat'&&/qabul qildi/.test(m.text)));
 order('C');await d.startDispatch('C');assert.equal(offer('C').courier,'k2','k1 is busy now');
 // A late ✅ (after 10 s) on a still-open offer is refused and moves on.
 db.prepare("UPDATE app_settings SET value=json_set(value,'$.expires',CAST(? AS INTEGER)) WHERE key='offer:C'").run(Date.now()-1);
 assert.equal(await d.handleCourierOffer(cb('222','co:a:C',offer('C').msg)),'offer_late');assert.equal(db.prepare("SELECT courier_id FROM orders WHERE id='C'").get().courier_id,null);
 // Offline couriers get nothing.
 await d.setCourierOnline('k2',false);assert.equal(await d.courierOnline('k2'),false);
 console.log('PASS courier dispatch: online/approved/free couriers only, 10 s offers, ✅ assigns, ❌ and timeout move on, late ✅ refused, restaurant told');
})().catch(e=>{console.error(e);process.exitCode=1});
