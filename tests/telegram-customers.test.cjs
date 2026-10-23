const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request,integrationDeps}=require('./harness.cjs');
// Customer Telegram: deep link from the profile -> /start c_CODE links the chat -> shared own contact
// verifies the phone -> one-time codes go to Telegram instead of SMS -> booking updates and the
// waitlist "table is free" reach the chat -> /stop or the profile unlinks.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...v){args=v;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 DB.batch=async ops=>{db.exec('BEGIN');try{const r=[];for(const op of ops)r.push(await op.run());db.exec('COMMIT');return r}catch(e){db.exec('ROLLBACK');throw e}};
 const env={DB,TELEGRAM_BOT_TOKEN:'bot:secret',TELEGRAM_WEBHOOK_SECRET:'hook-secret',TELEGRAM_BOT_USERNAME:'@rf_bot',BOOKING_PHONE_OTP:'true'};
 const calls=[];const fetch=async(url,init)=>{url=String(url);if(url.includes('eskiz'))throw Error('SMS must not be used');calls.push({method:url.split('/').pop(),body:JSON.parse(init.body)});return Response.json({ok:true,result:{}})};
 const extras={fetch,FormData,URLSearchParams};
 const cf={'cloudflare:workers':{env}},http=load('app/http.ts',cf),noLimit={...http,throttle:async()=>{}};
 const deep=integrationDeps(env,http,'../../../',extras),top=integrationDeps(env,http,'../../',extras);
 let user={userId:'c1',role:'customer',email:'c1@x',displayName:'C1',phoneVerified:false,phone:null,emailVerified:true,source:'email'};
 const profile=load('app/api/profile/route.ts',{...cf,...top,'../../access':{identity:async()=>user},'../../http':noLimit,'../../account-admin':{hashInvite:async()=>'',audit:()=>null},'../../geo':load('app/geo.ts',{'./http':http})},extras);
 const me=load('app/api/me/route.ts',{...cf,...top,'../../access':{identity:async()=>user,privateHeaders:{}},'../../test-account-cleanup':{cleanupTestAccounts:async()=>{}},'../../legacy-account':{legacyAccountCleanup:'',isReplacementAdmin:()=>false}},extras);
 const hook=load('app/api/telegram/webhook/route.ts',{...cf,...deep,'../../../http':http},extras);
 const update=data=>hook.POST(new Request('https://test/api/telegram/webhook',{method:'POST',headers:{'X-Telegram-Bot-Api-Secret-Token':'hook-secret','Content-Type':'application/json'},body:JSON.stringify(data)}));
 const last=()=>calls[calls.length-1];
 db.exec("INSERT INTO accounts(id,email,name,created_at,role) VALUES ('c1','c1@x','C1','now','customer'),('c2','c2@x','C2','now','customer'),('owner','o@x','O','now','restaurant_owner')");
 db.exec("INSERT INTO restaurants(id,name,owner_id,status,tables) VALUES ('r','Real <Osh>','owner','active',2)");

 // 1. Profile hands out a one-time deep link to the bot (username without @).
 let r=await profile.POST(request('/api/profile',{action:'telegram-link'}));assert.equal(r.status,200);const {url}=await r.json();
 const code=new URL(url).searchParams.get('start');assert.match(url,/^https:\/\/t\.me\/rf_bot\?start=c_[A-Za-z0-9]{24}$/);
 assert.equal(db.prepare('SELECT user_id FROM telegram_user_links WHERE code=?').get(code).user_id,'c1');
 // A wrong or expired code links nothing.
 await update({message:{chat:{id:500},from:{id:500},text:'/start c_'+'x'.repeat(24)}});assert.ok(last().body.text.includes('eskirgan'));
 // 2. /start c_CODE links the chat once and asks for the contact.
 await update({message:{chat:{id:500},from:{id:500},text:'/start '+code}});
 assert.equal(db.prepare("SELECT telegram_chat_id FROM accounts WHERE id='c1'").get().telegram_chat_id,'500');
 assert.equal(last().body.reply_markup.keyboard[0][0].request_contact,true);
 assert.equal(db.prepare('SELECT COUNT(*) n FROM telegram_user_links').get().n,0,'code used once');
 // 3. Someone else's contact is refused; a non-Uzbek number is refused; the own number verifies.
 await update({message:{chat:{id:500},from:{id:500},contact:{phone_number:'998901112233',user_id:777}}});
 assert.equal(db.prepare("SELECT contact_phone_verified v FROM accounts WHERE id='c1'").get().v,0);
 await update({message:{chat:{id:500},from:{id:500},contact:{phone_number:'+79001234567',user_id:500}}});
 assert.equal(db.prepare("SELECT telegram_phone FROM accounts WHERE id='c1'").get().telegram_phone,null);
 calls.length=0;await update({message:{chat:{id:500},from:{id:500},contact:{phone_number:'998901112233',user_id:500}}});
 // The code is generated on the server and sent at once; the number is NOT verified yet.
 assert.equal(calls.length,1,'one message: the code, sent right away');const first=/<b>(\d{6})<\/b>/.exec(last().body.text)[1];
 let a=db.prepare("SELECT telegram_phone,contact_phone,contact_phone_verified FROM accounts WHERE id='c1'").get();
 assert.deepEqual({...a},{telegram_phone:'+998901112233',contact_phone:'',contact_phone_verified:0},'not verified before the code');
 // A contact from a chat that is not linked does nothing.
 await update({message:{chat:{id:900},from:{id:900},contact:{phone_number:'998905556677',user_id:900}}});assert.equal(db.prepare("SELECT COUNT(*) n FROM accounts WHERE telegram_phone='+998905556677'").get().n,0);
 // /api/me hands the page the pending code id so it can show the code input.
 let u=(await (await me.GET()).json()).user;assert.equal(u.telegram.linked,true);assert.equal(u.telegram.phone,'+998901112233');assert.equal(u.telegram.verified,false);assert.ok(u.telegram.otpId);assert.equal(u.contactPhoneVerified,false);assert.equal(u.smsVerification,true,'Telegram alone enables codes');
 // A wrong code fails; the right one verifies; the code is single use.
 r=await profile.POST(request('/api/profile',{action:'contact-verify',phone:'+998901112233',otpId:u.telegram.otpId,code:first==='000000'?'111111':'000000'}));assert.equal(r.status,400);
 r=await profile.POST(request('/api/profile',{action:'contact-verify',phone:'+998901112233',otpId:u.telegram.otpId,code:first}));assert.equal((await r.json()).verified,true);
 r=await profile.POST(request('/api/profile',{action:'contact-verify',phone:'+998901112233',otpId:u.telegram.otpId,code:first}));assert.equal(r.status,400,'used once');
 a=db.prepare("SELECT contact_phone,contact_phone_verified FROM accounts WHERE id='c1'").get();assert.deepEqual({...a},{contact_phone:'+998901112233',contact_phone_verified:1});
 user={...user,contactPhone:'+998901112233'};u=(await (await me.GET()).json()).user;assert.equal(u.telegram.verified,true);assert.equal(u.telegram.otpId,null);

 // 4. One-time code goes to Telegram (no SMS configured) and verifies.
 calls.length=0;r=await profile.POST(request('/api/profile',{action:'contact-otp',phone:'+998901112233'}));assert.equal(r.status,200);const otp=await r.json();
 assert.equal(otp.channel,'telegram');assert.equal(last().body.chat_id,'500');const sent=/<b>(\d{6})<\/b>/.exec(last().body.text)[1];
 r=await profile.POST(request('/api/profile',{action:'contact-verify',phone:'+998901112233',otpId:otp.id,code:sent}));assert.equal((await r.json()).verified,true);
 // Another number has no Telegram proof and no SMS: a clear 503 instead of a silent failure.
 r=await profile.POST(request('/api/profile',{action:'contact-otp',phone:'+998909999999'}));assert.equal(r.status,503);assert.ok((await r.json()).error.includes('Telegram'));

 // 5. Booking updates reach the customer's chat (HTML escaped), with a link to the receipt.
 const {notifyCustomer}=deep['../../../telegram'],waitlist=deep['../../../waitlist'];
 db.exec("INSERT INTO bookings(id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('b1','r','c1','2026-10-24','19:00','21:00',1,2,'+998901112233','pending','now'),('b2','r','c2','2026-10-24','19:00','21:00',2,2,'+998900000000','pending','now')");
 calls.length=0;assert.equal(await notifyCustomer('b1','confirmed'),true);
 assert.ok(last().body.text.includes('tasdiqlandi')&&last().body.text.includes('Real &lt;Osh&gt;'));assert.equal(last().body.reply_markup.inline_keyboard[0][0].url,'https://restaurantfoods.online/#/bookings');
 assert.equal(await notifyCustomer('b2','confirmed'),false,'no Telegram linked: nothing sent');
 // The restaurant's Confirm button in Telegram also notifies the customer.
 db.exec("UPDATE restaurants SET telegram_chat_id='777' WHERE id='r'");calls.length=0;
 await update({callback_query:{id:'q',data:'b:x:b1',message:{chat:{id:777},message_id:1}}});
 assert.ok(calls.some(c=>c.body.chat_id==='500'&&c.body.text.includes('bekor qilindi')));
 // 6. Waitlist: the table turning free sends "table is free" to the first in line.
 db.exec("INSERT INTO waitlist(id,restaurant_id,table_number,user_id,guests,status,created_at) VALUES ('w1','r',2,'c1',2,'waiting','2026-10-23T10:00:00Z')");
 calls.length=0;assert.equal(await waitlist.notifyNext('r',2),'w1');assert.ok(last().body.text.includes('2-stol bo‘shadi'));assert.ok(last().body.reply_markup.inline_keyboard[0][0].url.endsWith('/#/restaurant/r'));

 // 7. One chat per account: linking chat 500 to c2 unlinks c1.
 user={userId:'c2',role:'customer'};const code2=new URL((await (await profile.POST(request('/api/profile',{action:'telegram-link'}))).json()).url).searchParams.get('start');
 await update({message:{chat:{id:500},from:{id:500},text:'/start '+code2}});
 assert.equal(db.prepare("SELECT telegram_chat_id FROM accounts WHERE id='c1'").get().telegram_chat_id,null);assert.equal(db.prepare("SELECT telegram_chat_id FROM accounts WHERE id='c2'").get().telegram_chat_id,'500');
 // 8. Unlink from the profile and /stop from the chat.
 calls.length=0;r=await profile.POST(request('/api/profile',{action:'telegram-unlink'}));assert.equal(r.status,200);assert.equal(last().body.chat_id,'500');
 assert.deepEqual({...db.prepare("SELECT telegram_chat_id,telegram_phone FROM accounts WHERE id='c2'").get()},{telegram_chat_id:null,telegram_phone:null});
 db.exec("UPDATE accounts SET telegram_chat_id='600' WHERE id='c1'");await update({message:{chat:{id:600},from:{id:600},text:'/stop'}});
 assert.equal(db.prepare("SELECT telegram_chat_id FROM accounts WHERE id='c1'").get().telegram_chat_id,null);
 // Restaurant linking still works next to the customer flow.
 db.prepare('INSERT INTO telegram_links(code,restaurant_id,created_by,expires_at) VALUES (?,?,?,?)').run('abcdef123456','r','owner',Date.now()+60000);
 await update({message:{chat:{id:4242},from:{id:4242},text:'/start abcdef123456'}});assert.equal(db.prepare("SELECT telegram_chat_id FROM restaurants WHERE id='r'").get().telegram_chat_id,'4242');
 // Bot not configured: the profile link is refused.
 delete env.TELEGRAM_BOT_TOKEN;assert.equal((await profile.POST(request('/api/profile',{action:'telegram-link'}))).status,503);
 console.log('PASS telegram customers: deep link, own-contact phone verification, Telegram OTP, booking/waitlist notifications, one chat per account, unlink');
})().catch(e=>{console.error(e);process.exitCode=1});
