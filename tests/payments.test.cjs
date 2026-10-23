const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),{DatabaseSync}=require('node:sqlite'),{load,request,integrationDeps}=require('./harness.cjs');
// Booking SMS OTP, Click / Payme deposits and Telegram notifications on real SQLite with mocked providers.
(async()=>{
const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
db.exec("INSERT INTO restaurants(id,name,status,owner_id,deposit_amount,telegram_chat_id) VALUES ('r','Real <Osh>','active','owner',50000,'777');INSERT INTO restaurant_tables(id,restaurant_id,number,seats) VALUES ('t1','r',1,4),('t2','r',2,4),('t3','r',3,4),('t4','r',4,4)");
const DB={prepare(sql){let args=[];return{bind(...a){args=a;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
DB.batch=async ops=>{db.exec('BEGIN');try{const r=[];for(const op of ops)r.push(await op.run());db.exec('COMMIT');return r}catch(e){db.exec('ROLLBACK');throw e}};
const env={DB,TELEGRAM_BOT_TOKEN:'bot:secret',TELEGRAM_WEBHOOK_SECRET:'hook-secret',TELEGRAM_BOT_USERNAME:'rf_bot',CLICK_SERVICE_ID:'11',CLICK_MERCHANT_ID:'22',CLICK_SECRET_KEY:'click-key',PAYME_MERCHANT_ID:'pm',PAYME_KEY:'payme-key',ESKIZ_EMAIL:'e@x',ESKIZ_PASSWORD:'p',BOOKING_PHONE_OTP:'true'};
const calls=[];let smsCode='';
let eskizFail=null;const fetch=async(url,init)=>{url=String(url);if(url.includes('eskiz')){if(url.endsWith('/auth/login'))return Response.json({data:{token:'tok'}});if(eskizFail)return new Response(eskizFail,{status:400});smsCode=/kodi (\d{6})/.exec(init.body.get('message'))[1];calls.push({sms:init.body.get('mobile_phone')});return Response.json({status:'waiting'})}const method=url.split('/').pop();calls.push({telegram:method,body:JSON.parse(init.body)});return Response.json({ok:true,result:{}})};
const extras={fetch,FormData,URLSearchParams};
let user={userId:'client',role:'customer',phoneVerified:false,phone:''};
const http=load('app/http.ts',{'cloudflare:workers':{env}}),cf={'cloudflare:workers':{env}},integrations=integrationDeps(env,http,'../../',extras),deep=integrationDeps(env,http,'../../../',extras);
const deps={...cf,...integrations,'../../access':{identity:async()=>user},'../../http':http,'../../table-rules':load('app/table-rules.ts',{'./http':http}),'../../booking-rules':load('app/booking-rules.ts',{'./http':http}),'../../booking-preorder':load('app/booking-preorder.ts',{'./http':http})};
const bookings=load('app/api/bookings/route.ts',deps,extras),otpRoute=load('app/api/bookings/phone-otp/route.ts',{...deep,'../../../access':{identity:async()=>user},'../../../http':http},extras);
const withHttp={...cf,...deep,'../../../http':http},click=load('app/api/payments/click/route.ts',withHttp,extras),payme=load('app/api/payments/payme/route.ts',withHttp,extras),hook=load('app/api/telegram/webhook/route.ts',withHttp,extras);
const {md5}=deep['../../../md5'],{bookingText,prettyPhone}=deep['../../../telegram'];

// md5 matches Node for ASCII and UTF-8 of all lengths around block boundaries.
for(const s of ['','a','abc','Click✓ooo',...Array.from({length:130},(_,i)=>'x'.repeat(i))])assert.equal(md5(s),crypto.createHash('md5').update(s).digest('hex'));
assert.equal(prettyPhone('+998901234567'),'+998 90 123 45 67');
const card=bookingText({id:'b',restaurant_name:'A&B',phone:'+998901234567',table_number:4,date:'2026-11-01',slot:'19:30',end_slot:'21:30',guests:2,deposit_status:'paid',deposit_provider:'payme',status:'pending'});
for(const part of ['📌 <b>Yangi Bron!</b>','👤 <b>Mijoz:</b> +998 90 123 45 67','🍽 <b>Stol:</b> 4-stol','🕒 <b>Vaqt:</b> 19:30–21:30','💵 <b>Depozit:</b> To‘langan (Payme)','A&amp;B'])assert.ok(card.includes(part),part);

// Booking requires the SMS code for the phone it is made with.
const date=new Date(Date.now()+3*86400000).toISOString().slice(0,10);
const base={restaurantId:'r',date,slot:'12:00',endSlot:'14:00',tableNumber:1,guests:2,phone:'+998901234567'};
const book=extra=>bookings.POST(request('/api/bookings',{...base,...extra}));
assert.equal((await book({})).status,400,'no OTP');
let r=await otpRoute.POST(request('/api/bookings/phone-otp',{phone:'+998901234567'}));assert.equal(r.status,200);const otp=await r.json();assert.equal(calls.pop().sms,'998901234567');assert.match(smsCode,/^\d{6}$/);
assert.ok(!JSON.stringify(db.prepare('SELECT * FROM booking_phone_otps').all()).includes(smsCode),'code stored hashed');
assert.equal((await book({phoneOtpId:otp.id,phoneCode:smsCode==='000000'?'111111':'000000'})).status,400,'wrong code');
assert.equal((await book({phoneOtpId:otp.id,phoneCode:smsCode,phone:'+998901111111'})).status,400,'code bound to phone');
db.prepare("INSERT OR IGNORE INTO accounts(id,email,name,created_at) VALUES ('client','c@x','C','now')").run();
r=await book({phoneOtpId:otp.id,phoneCode:smsCode});assert.equal(r.status,201);const created=await r.json();
assert.deepEqual({...db.prepare("SELECT contact_phone,contact_phone_verified FROM accounts WHERE id='client'").get()},{contact_phone:'+998901234567',contact_phone_verified:1},'a booking code also verifies the account phone');db.prepare("UPDATE accounts SET contact_phone_verified=0 WHERE id='client'").run();
assert.equal(created.deposit.amount,50000);assert.ok(created.deposit.links.click.includes('transaction_param='+created.deposit.id));
assert.ok(atob(created.deposit.links.payme.split('/').pop()).includes('ac.deposit_id='+created.deposit.id+';a=5000000;'));
assert.equal(calls.length,0,'restaurant is not notified before the deposit is paid');
assert.equal(db.prepare('SELECT phone_verified,deposit_status FROM bookings WHERE id=?').get(created.id).deposit_status,'pending');
assert.equal((await book({phoneOtpId:otp.id,phoneCode:smsCode,tableNumber:2})).status,400,'code is single use');
db.prepare("UPDATE accounts SET contact_phone_verified=1 WHERE id='client'").run();r=await book({tableNumber:4,slot:'14:00',endSlot:'16:00'});assert.equal(r.status,201,'an SMS-verified account number needs no new code');db.prepare("UPDATE bookings SET status='cancelled' WHERE id=?").run((await r.json()).id);db.prepare('UPDATE rate_limits SET count=count-1').run();db.prepare("UPDATE accounts SET contact_phone='',contact_phone_verified=0 WHERE id='client'").run();
// A phone-verified account booking with its own number skips SMS.
user={...user,phoneVerified:true,phone:'998901234567'};

// Click: Prepare + Complete with MD5 signatures.
const depositId=created.deposit.id;
const clickReq=f=>{const fields={click_trans_id:'9001',service_id:'11',click_paydoc_id:'1',merchant_trans_id:depositId,amount:'50000.00',error:'0',error_note:'Success',sign_time:'2026-10-21 10:00:00',...f};fields.sign_string??=md5(fields.click_trans_id+fields.service_id+'click-key'+fields.merchant_trans_id+(fields.action==='1'?fields.merchant_prepare_id:'')+fields.amount+fields.action+fields.sign_time);return click.POST(new Request('https://test/api/payments/click',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(fields).toString()}))};
assert.equal((await (await clickReq({action:'0',sign_string:'bad'})).json()).error,-1);
assert.equal((await (await clickReq({action:'0',amount:'100.00'})).json()).error,-2);
assert.equal((await (await clickReq({action:'0',merchant_trans_id:'missing'})).json()).error,-5);
const prepared=await (await clickReq({action:'0'})).json();assert.equal(prepared.error,0);assert.ok(prepared.merchant_prepare_id>0);
assert.equal((await (await clickReq({action:'1',merchant_prepare_id:'1'})).json()).error,-6);
const completed=await (await clickReq({action:'1',merchant_prepare_id:String(prepared.merchant_prepare_id)})).json();assert.equal(completed.error,0);
assert.equal((await (await clickReq({action:'1',merchant_prepare_id:String(prepared.merchant_prepare_id)})).json()).error,-4,'already paid');
assert.equal(db.prepare('SELECT deposit_status FROM bookings WHERE id=?').get(created.id).deposit_status,'paid');
let sent=calls.pop();assert.equal(sent.telegram,'sendMessage');assert.equal(sent.body.chat_id,'777');assert.ok(sent.body.text.includes('To‘langan (Click)'));assert.equal(sent.body.reply_markup.inline_keyboard[0][0].callback_data,'b:c:'+created.id);

// Telegram callbacks: only the linked chat may confirm; webhook needs its secret.
const update=(data,chat)=>hook.POST(new Request('https://test/api/telegram/webhook',{method:'POST',headers:{'X-Telegram-Bot-Api-Secret-Token':'hook-secret','Content-Type':'application/json'},body:JSON.stringify(data)}));
assert.equal((await hook.POST(new Request('https://test/api/telegram/webhook',{method:'POST',body:'{}'}))).status,403);
await update({callback_query:{id:'q1',data:'b:c:'+created.id,message:{chat:{id:999},message_id:5}}});
assert.equal(db.prepare('SELECT status FROM bookings WHERE id=?').get(created.id).status,'pending','foreign chat denied');
await update({callback_query:{id:'q2',data:'b:c:'+created.id,message:{chat:{id:777},message_id:5}}});
assert.equal(db.prepare('SELECT status FROM bookings WHERE id=?').get(created.id).status,'confirmed');
assert.ok(calls.some(c=>c.telegram==='editMessageText'&&c.body.text.includes('Tasdiqlandi')));
// The site sees the Telegram decision through the status feed (customer and owner views).
const statusFeed=load('app/api/bookings/status/route.ts',{...cf,'../../../access':{identity:async()=>who},'../../../http':http});let who={userId:'client',role:'customer'};
assert.equal((await (await statusFeed.GET()).json()).mine.find(b=>b.id===created.id).status,'confirmed');
who={userId:'owner',role:'restaurant_owner'};let feed=await (await statusFeed.GET()).json();assert.equal(feed.managed.find(b=>b.id===created.id).status,'confirmed');assert.equal(feed.mine.length,0);
who={userId:'other-owner',role:'restaurant_owner'};assert.equal((await (await statusFeed.GET()).json()).managed.length,0,'other restaurants stay private');
who=null;assert.equal((await statusFeed.GET()).status,401);
// Linking: one-time code from telegram_links binds the chat.
db.prepare('INSERT INTO telegram_links(code,restaurant_id,created_by,expires_at) VALUES (?,?,?,?)').run('abcdef123456','r','owner',Date.now()+60000);
await update({message:{chat:{id:4242},text:'/start abcdef123456'}});
assert.equal(db.prepare("SELECT telegram_chat_id FROM restaurants WHERE id='r'").get().telegram_chat_id,'4242');
assert.equal(db.prepare('SELECT COUNT(*) n FROM telegram_links').get().n,0,'code used once');

// Payme: second booking, full JSON-RPC lifecycle.
calls.length=0;
r=await book({tableNumber:2});assert.equal(r.status,201);const second=await r.json(),pd=second.deposit.id;
const rpc=(method,params,key='payme-key')=>payme.POST(new Request('https://test/api/payments/payme',{method:'POST',headers:{Authorization:'Basic '+btoa('Paycom:'+key),'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:7,method,params})})).then(x=>x.json());
assert.equal((await rpc('CheckPerformTransaction',{amount:5000000,account:{deposit_id:pd}},'wrong')).error.code,-32504);
assert.equal((await rpc('toString',{})).error.code,-32601);
assert.equal((await rpc('CheckPerformTransaction',{amount:100,account:{deposit_id:pd}})).error.code,-31001);
assert.equal((await rpc('CheckPerformTransaction',{amount:5000000,account:{deposit_id:'nope'}})).error.code,-31050);
assert.equal((await rpc('CheckPerformTransaction',{amount:5000000,account:{deposit_id:pd}})).result.allow,true);
const t=Date.now(),createdTx=(await rpc('CreateTransaction',{id:'pm-1',time:t,amount:5000000,account:{deposit_id:pd}})).result;assert.equal(createdTx.state,1);
assert.equal((await rpc('CreateTransaction',{id:'pm-1',time:t,amount:5000000,account:{deposit_id:pd}})).result.create_time,createdTx.create_time,'idempotent');
assert.equal((await rpc('CreateTransaction',{id:'pm-2',time:t,amount:5000000,account:{deposit_id:pd}})).error.code,-31099,'one transaction per deposit');
assert.equal((await rpc('PerformTransaction',{id:'nope'})).error.code,-31003);
const performed=(await rpc('PerformTransaction',{id:'pm-1'})).result;assert.equal(performed.state,2);
assert.equal((await rpc('PerformTransaction',{id:'pm-1'})).result.perform_time,performed.perform_time,'idempotent perform');
sent=calls.find(c=>c.telegram==='sendMessage');assert.ok(sent.body.text.includes('To‘langan (Payme)'));
assert.equal((await rpc('CheckTransaction',{id:'pm-1'})).result.state,2);
const statement=(await rpc('GetStatement',{from:t-1000,to:Date.now()+1000})).result.transactions;assert.equal(statement.length,1);assert.equal(statement[0].account.deposit_id,pd);
const refund=(await rpc('CancelTransaction',{id:'pm-1',reason:5})).result;assert.equal(refund.state,-2);
assert.deepEqual({...db.prepare('SELECT status,deposit_status FROM bookings WHERE id=?').get(second.id)},{status:'cancelled',deposit_status:'refunded'});

// Paid by Click while a Payme transaction was open: Payme must be refused, not charged twice.
r=await book({tableNumber:4,slot:'18:00',endSlot:'20:00'});const both=(await r.json()).deposit.id;
assert.equal((await rpc('CreateTransaction',{id:'pm-race',time:Date.now(),amount:5000000,account:{deposit_id:both}})).result.state,1);
assert.equal(await deep['../../../deposits'].markPaid(both,'click'),true);
assert.equal((await rpc('PerformTransaction',{id:'pm-race'})).error.code,-31008,'second provider refused');
assert.equal((await rpc('CheckTransaction',{id:'pm-race'})).result.state,-1);
assert.equal(db.prepare('SELECT provider FROM deposits WHERE id=?').get(both).provider,'click');
// Unpaid deposits release the table after the hold; a Payme create on an expired deposit is refused.
r=await book({tableNumber:3});const third=await r.json();
db.prepare("UPDATE deposits SET created_at=? WHERE id=?").run(new Date(Date.now()-31*60000).toISOString(),third.deposit.id);
assert.equal((await rpc('CheckPerformTransaction',{amount:5000000,account:{deposit_id:third.deposit.id}})).error.code,-31051);
assert.equal(await deep['../../../deposits'].sweepDeposits(),1);
assert.deepEqual({...db.prepare('SELECT status,deposit_status FROM bookings WHERE id=?').get(third.id)},{status:'cancelled',deposit_status:'cancelled'});
assert.equal((await book({tableNumber:3})).status,201,'table is free again');

// Without a configured provider the booking goes straight to Telegram, deposit not required.
for(const k of ['CLICK_SECRET_KEY','PAYME_KEY'])delete env[k];calls.length=0;
r=await book({tableNumber:1,slot:'16:00',endSlot:'18:00'});const plain=await r.json();assert.equal(plain.deposit,null);
assert.equal(db.prepare('SELECT deposit_status FROM bookings WHERE id=?').get(plain.id).deposit_status,'not_required');
assert.ok(calls.find(c=>c.telegram==='sendMessage').body.text.includes('Talab qilinmaydi'));
assert.equal(db.prepare('PRAGMA foreign_key_check').all().length,0);
// Profile completion: the contact phone is confirmed with an SMS code, then an address is saved.
const profile=load('app/api/profile/route.ts',{...cf,'../../access':{identity:async()=>user},'../../http':http,'../../account-admin':{hashInvite:async()=>'',audit:()=>null},'../../geo':load('app/geo.ts',{'./http':http}),...integrations},extras);
db.prepare("INSERT OR IGNORE INTO accounts(id,email,name,created_at) VALUES ('client','c@x','C','now')").run();
const prof=b=>profile.POST(request('/api/profile',b));
r=await prof({action:'contact-otp',phone:'+998907777777'});assert.equal(r.status,200);const pOtp=await r.json();const pCode=smsCode;
assert.equal((await prof({action:'contact-verify',phone:'+998907777777',otpId:pOtp.id,code:pCode==='000000'?'111111':'000000'})).status,400,'wrong code');
r=await prof({action:'contact-verify',phone:'+998907777777',otpId:pOtp.id,code:pCode});assert.equal(r.status,200);assert.equal((await r.json()).verified,true);
assert.deepEqual({...db.prepare("SELECT contact_phone,contact_phone_verified FROM accounts WHERE id='client'").get()},{contact_phone:'+998907777777',contact_phone_verified:1});
assert.equal((await prof({action:'contact-phone',phone:'+998908888888'})).status,400,'with SMS on, a new number needs its code');assert.equal(db.prepare("SELECT contact_phone_verified v FROM accounts WHERE id='client'").get().v,1,'verified number untouched');
assert.equal((await prof({action:'contact-phone',phone:''})).status,400,'customers keep a phone');
assert.equal((await prof({action:'address',address:'Samarqand, Registon 1',latitude:39.65,longitude:66.97})).status,200);
assert.equal(db.prepare("SELECT address FROM accounts WHERE id='client'").get().address,'Samarqand, Registon 1');
assert.equal((await prof({action:'address',address:'x'})).status,400);
// Eskiz refusals come back as an actionable reason, with digits masked in the log.
eskizFail=JSON.stringify({message:'Этот смс текст еще не прошел модерацию'});r=await prof({action:'contact-otp',phone:'+998907777777'});assert.equal(r.status,503);assert.match((await r.json()).error,/tasdiqlanmagan/);
eskizFail=JSON.stringify({message:'Недостаточно средств на балансе'});r=await prof({action:'contact-otp',phone:'+998907777777'});assert.match((await r.json()).error,/balans/);eskizFail=null;
// SMS is only sent while booking OTP is switched on.
env.BOOKING_PHONE_OTP='false';assert.equal((await otpRoute.POST(request('/api/bookings/phone-otp',{phone:'+998901234567'}))).status,404);
console.log('PASS booking SMS OTP (hashed, phone-bound, single use), Click prepare/complete signatures + errors, Payme JSON-RPC lifecycle/refund/statement, Telegram card format, linked-chat callbacks, deep-link binding, deposit hold sweep, provider-less bookings.');
})().catch(e=>{console.error(e);process.exitCode=1});
