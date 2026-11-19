const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request,integrationDeps}=require('./harness.cjs');
// Several tables in one reservation: one booking (main) + linked hold rows that make the other tables busy,
// all-or-nothing; status follows the main booking (trigger); guests up to the combined seats; the advance
// scales with the tables; customer lists show one booking; Telegram shows "🪑 Stollar: #2, #3, #4 (Jami 14 o‘rin)".
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...v){args=v;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 DB.batch=async st=>{db.exec('BEGIN');try{const out=[];for(const s of st)out.push(await s.run());db.exec('COMMIT');return out}catch(e){db.exec('ROLLBACK');throw e}};
 const env={DB,TELEGRAM_BOT_TOKEN:'1:x',SITE_URL:'https://restaurantfoods.online'},cw={'cloudflare:workers':{env}};
 const sent=[];const fetch=async(url,init)=>{const method=String(url).split('/').pop();if(init.body instanceof FormData){sent.push({method,chat:init.body.get('chat_id'),caption:init.body.get('caption')});return Response.json({ok:true,result:{}})}const body=JSON.parse(init.body);sent.push({method,body});return Response.json({ok:true,result:method==='sendMessage'?{message_id:1}:true})};
 const http=load('app/http.ts',cw),i18n=load('app/bot-i18n.ts',cw),rules=load('app/booking-rules.ts',{'./http':http}),group=load('app/table-group.ts',cw);
 const tg=load('app/telegram.ts',{...cw,'./otp-store':load('app/otp-store.ts',cw),'./telegram-login':{createMagicLink:async()=>'',saveTelegramUsername:async()=>{}},'./bot-i18n':i18n,'./table-group':group},{fetch});
 const policy=load('app/guest-policy.ts',{...cw,'./telegram':tg,'./booking-rules':rules,'./table-group':group});
 const cfgOff={SIMPLE_MVP_MODE:true,MVP_CHECKOUT:'guest',CENTRAL_PAYMENT_CARD:'8600 XXXX XXXX XXXX',CENTRAL_PAYMENT_HOLDER:'M',SUPER_ADMIN_TG_ID:'4242'},cfgOn={...cfgOff,CENTRAL_PAYMENT_CARD:'8600 1234 5678 9012'};
 const p2pFor=cfg=>load('app/p2p.ts',{...cw,'./http':http,'./telegram':tg,'./health':{adminChats:async()=>[]},'./mvp':cfg,'./image-content':load('app/image-content.ts',{}),'./guest-policy':policy,'./table-group':group},{fetch,FormData,Blob});
 db.exec("INSERT INTO accounts(id,email,name,created_at,role,telegram_chat_id) VALUES ('owner','o@x','O','now','restaurant_owner','900')");
 db.exec("INSERT INTO restaurants(id,name,owner_id,status,tables,floors,booking_open,booking_close,phone) VALUES ('r','Amanda','owner','active',6,1,'08:00','23:00','+998662334455')");
 db.exec("INSERT INTO restaurant_tables(id,restaurant_id,number,seats,x,y) VALUES ('t1','r',1,4,10,10),('t2','r',2,4,20,10),('t3','r',3,4,30,10),('t4','r',4,6,40,10),('t5','r',5,2,50,10)");
 const told=[],sessions=[];
 const quickFor=(cfg,user=null)=>load('app/api/bookings/quick/route.ts',{...cw,'../../../access':{identity:async()=>user},'../../../http':{...http,throttle:async()=>{}},'../../../table-rules':load('app/table-rules.ts',{'./http':http}),'../../../booking-preorder':load('app/booking-preorder.ts',{'./http':http}),'../../../booking-rules':rules,'../../../telegram':{notifyBooking:async id=>(told.push(id),tg.notifyBooking(id)),notifyCustomer:async()=>false},'../../../booking-pass':load('app/booking-pass.ts',cw),'../../../mvp':cfg,'../../../telegram-login':{botUsername:()=>'rf_bot',issueSession:async id=>sessions.push(id)},'../../../phone-codes':load('app/phone-codes.ts',{'./http':http}),'../../../guest-policy':policy,'../../../p2p':p2pFor(cfg),'../../../deposits':{DEPOSIT_MIN:100000},'../../../table-group':group});
 const day=new Date(Date.now()+5*3600000+86400000).toISOString().slice(0,10);
 const post=(route,x)=>route.POST(request('/api/bookings/quick',{restaurantId:'r',date:day,slot:'19:00',endSlot:'21:00',tableNumber:2,tableId:'t2',guests:12,name:'Aziz',phone:'+998 90 123 45 67',...x}));
 const off=quickFor(cfgOff);
 // Guests above one table need more tables; 3 tables = 14 seats.
 let r=await post(off,{});assert.equal(r.status,400,'12 guests do not fit table 2');
 r=await post(off,{extraTables:[{number:3,id:'t3'},{number:4,id:'t4'}],guests:15});assert.equal(r.status,400);assert.match((await r.json()).error,/jami 14 o‘rin/);
 await assert.equal((await post(off,{extraTables:[{number:2,id:'t2'}]})).status,400,'same table twice');
 assert.equal((await post(off,{extraTables:[{number:3,id:'t1'}]})).status,409,'table id must match');
 r=await post(off,{extraTables:[{number:3,id:'t3'},{number:4,id:'t4'}]});assert.equal(r.status,201);const d=await r.json();
 assert.deepEqual([...d.tables],[2,3,4]);assert.equal(d.seatsTotal,14);
 const rows=db.prepare("SELECT id,table_number,status,deposit_status,guests FROM bookings WHERE restaurant_id='r' ORDER BY table_number").all();assert.equal(rows.length,3,'one booking + 2 hold rows');
 const holds=rows.filter(x=>x.id!==d.id);assert.ok(holds.every(x=>x.deposit_status==='group_hold'&&x.status==='pending'));
 assert.equal(JSON.parse(db.prepare("SELECT value FROM app_settings WHERE key=?").get('grpm:'+d.id).value).seats,14);
 // Restaurant card: one message, all tables on one line.
 const card=sent.find(s=>s.body?.chat_id==='900').body.text;assert.ok(card.includes("🪑 Stollar: #2, #3, #4 (Jami 14 o‘rin)"),card);assert.equal(sent.filter(s=>s.body?.chat_id==='900').length,1);
 // The other tables are busy: another guest cannot take table 4 at that time.
 r=await post(off,{tableNumber:4,tableId:'t4',guests:2,phone:'+998 90 000 00 01'});assert.equal(r.status,409);
 // All or nothing: table 5 is free but table 3 is taken → nothing saved.
 const before=db.prepare('SELECT COUNT(*) n FROM bookings').get().n;r=await post(off,{tableNumber:5,tableId:'t5',guests:4,extraTables:[{number:3,id:'t3'}],phone:'+998 90 000 00 02'});assert.equal(r.status,409);assert.equal(db.prepare('SELECT COUNT(*) n FROM bookings').get().n,before);
 // Status follows the main booking (confirm, then cancel) — the tables become free again.
 db.prepare("UPDATE bookings SET status='confirmed' WHERE id=?").run(d.id);assert.ok(db.prepare("SELECT status FROM bookings WHERE id IN (?,?)").all(holds[0].id,holds[1].id).every(x=>x.status==='confirmed'));
 const route=load('app/api/bookings/route.ts',{...cw,...integrationDeps(env,http),'../../access':{identity:async()=>({userId:sessions[0],role:'customer'})},'../../http':http,'../../plans':load('app/plans.ts',{...cw,'./http':http}),'../../geo':load('app/geo.ts',{'./http':http}),'../../table-rules':load('app/table-rules.ts',{'./http':http}),'../../booking-rules':rules,'../../booking-preorder':load('app/booking-preorder.ts',{'./http':http}),'../../mvp':{SIMPLE_MVP_MODE:true},'../../guest-policy':policy,'../../telegram':tg});
 const list=await (await route.GET()).json();assert.equal(list.length,1,'customer sees one booking');assert.equal(JSON.parse(list[0].group_tables).tables.length,3);
 sent.length=0;r=await route.PATCH(request('/api/bookings',{id:d.id},'PATCH'));assert.equal(r.status,200);
 assert.ok(db.prepare("SELECT status FROM bookings WHERE restaurant_id='r'").all().every(x=>x.status==='cancelled'),'all three released');
 assert.match(sent.find(s=>s.body?.chat_id==='900').body.text,/Stollar: #2, #3, #4 \(Jami 14 o‘rin\), Vaqt: 19:00/);
 assert.equal((await post(off,{tableNumber:4,tableId:'t4',guests:2,phone:'+998 90 000 00 03'})).status,201,'table 4 free again');
 // Prepayment on: the default advance is 100 000 × tables; the owner's receipt alert shows the tables.
 r=await post(quickFor(cfgOn),{tableNumber:1,tableId:'t1',guests:6,extraTables:[{number:2,id:'t2'}],phone:'+998 93 111 22 33',slot:'12:00',endSlot:'13:00'});const pd=await r.json();
 assert.equal(pd.payment.minDeposit,200000);assert.equal(pd.payment.total,200000);
 const b=await policy.loadGuestBooking(pd.id),cap=p2pFor(cfgOn).ownerCaption(b,200000,Date.now(),200000);assert.ok(cap.includes('Stollar: #1, #2'));assert.ok(cap.includes("🪑 Stollar: #1, #2 (Jami 8 o‘rin)"));
 console.log('PASS table groups: guests up to the combined seats, one booking + hold rows (all or nothing), other tables busy, status follows the main booking, one booking in the customer list, "🪑 Stollar: …" in restaurant / cancel / owner messages, advance 100 000 × tables');
})().catch(e=>{console.error(e);process.exitCode=1});
