const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load}=require('./harness.cjs');
// Sign-in with Telegram: browser-bound request, own contact only, verified phone + Telegram birthday saved,
// existing account found by its verified number, admin refused, one-time approval, then a session.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...v){args=v;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 const env={DB,TELEGRAM_BOT_TOKEN:'bot:t',TELEGRAM_WEBHOOK_SECRET:'s',TELEGRAM_BOT_USERNAME:'@restaurantfoods_bot'};
 let jar=new Map();const cookies=async()=>({get:n=>jar.has(n)?{value:jar.get(n)}:undefined,set:(n,v)=>{if(v)jar.set(n,v);else jar.delete(n)}});
 const sent=[];const fetch=async(url,init)=>{const method=String(url).split('/').pop(),body=JSON.parse(init.body);sent.push({method,body});if(method==='getChat')return Response.json({ok:true,result:{id:body.chat_id,birthdate:{day:5,month:3,year:1995}}});return Response.json({ok:true,result:{}})};
 const cf={'cloudflare:workers':{env}},http=load('app/http.ts',cf);
 const login=load('app/telegram-login.ts',{...cf,'next/headers':{cookies},'./http':http});
 const telegram=load('app/telegram.ts',{...cf,'./otp-store':load('app/otp-store.ts',cf),'./telegram-login':login},{fetch});
 const start=async()=>{jar=new Map();const r=await login.startTelegramLogin();assert.ok(r.url.startsWith('https://t.me/restaurantfoods_bot?start=l_'));return r.url.split('start=')[1]};
 const msg=(chat,extra)=>({message:{chat:{id:chat},from:{id:chat,first_name:'Aziz',last_name:'Karimov'},...extra}});
 // New user.
 let code=await start();assert.equal((await login.pollTelegramLogin()).status,'pending');
 assert.equal(await telegram.handleUpdate(msg(42,{text:'/start '+code})),'login_opened');
 assert.equal(await telegram.handleUpdate(msg(42,{contact:{phone_number:'998901234567',user_id:99}})),'contact_not_own','someone else’s contact');
 assert.equal((await login.pollTelegramLogin()).status,'awaiting_contact');
 assert.equal(await telegram.handleUpdate(msg(42,{contact:{phone_number:'998901234567',user_id:42}})),'login_approved');
 const a=db.prepare("SELECT * FROM accounts WHERE id='tg:42'").get();assert.equal(a.contact_phone,'+998901234567');assert.equal(a.contact_phone_verified,1);assert.equal(a.birth_date,'1995-03-05');assert.equal(a.name,'Aziz Karimov');assert.equal(a.telegram_chat_id,'42');
 const saved=new Map(jar);jar.delete('__Host-rf-tglogin');await assert.rejects(login.pollTelegramLogin(),/eskirgan/,'another browser cannot claim it');jar=saved;
 assert.equal((await login.pollTelegramLogin()).status,'approved');assert.ok(jar.get('__Host-rf-tg'),'session cookie');
 const me=await login.telegramIdentity();assert.equal(me.userId,'tg:42');assert.equal(me.phoneVerified,true);assert.equal(me.phone,'998901234567');assert.equal(me.source,'telegram');
 assert.ok(!db.prepare('SELECT token_hash FROM telegram_sessions').get().token_hash.includes(jar.get('__Host-rf-tg')),'only the hash is stored');
 await assert.rejects(login.pollTelegramLogin(),/eskirgan|ishlatilgan/,'one-time');
 // Remembered device: "Chiqish" ends the session but keeps the device key; one tap signs in again, the key rotates.
 const device=jar.get('__Host-rf-device');assert.ok(device&&device.length>=32,'device key set on sign-in');
 await login.endTelegramSession();assert.equal(await login.telegramIdentity(),null);assert.equal(jar.get('__Host-rf-device'),device,'logout keeps the device');
 assert.ok(!db.prepare('SELECT token_hash FROM telegram_sessions').all().some(r=>r.token_hash.includes(device)),'device key stored as a hash only');
 jar.set('__Host-rf-tg',device);assert.equal(await login.telegramIdentity(),null,'a device key is not a session');jar.delete('__Host-rf-tg');
 assert.equal((await login.deviceLogin()).ok,true);assert.equal((await login.telegramIdentity()).userId,'tg:42','signed in without the bot');
 const rotated=jar.get('__Host-rf-device');assert.notEqual(rotated,device,'key rotates');
 jar.set('__Host-rf-device',device);await assert.rejects(login.deviceLogin(),/eskirgan/,'old key is single-use');assert.equal(jar.get('__Host-rf-device'),undefined);
 jar.set('__Host-rf-device',rotated);await login.forgetDevice();assert.equal(jar.get('__Host-rf-device'),undefined);jar.set('__Host-rf-device',rotated);await assert.rejects(login.deviceLogin(),/eskirgan/,'forgotten');
 await login.endTelegramSession();
 // Another browser, same Telegram account: the bot recognises the chat and approves without asking for the number.
 code=await start();sent.length=0;assert.equal(await telegram.handleUpdate(msg(42,{text:'/start '+code})),'login_approved');
 assert.ok(!sent.some(m=>JSON.stringify(m.body).includes('request_contact')),'no contact request');assert.ok(sent.some(m=>JSON.stringify(m.body).includes('Saytga kirish')),'inline button to the site');
 // The bot's button is a one-time sign-in link for whichever browser opens it (Telegram's own included).
 const pollingJar=jar;const btn=[...sent].reverse().find(m=>JSON.stringify(m.body).includes('Saytga kirish')).body.reply_markup.inline_keyboard[0][0].url;
 const magic=btn.split('#/tg/')[1];assert.match(magic,/^m_[A-Za-z0-9]{32}$/);
 assert.equal(db.prepare("SELECT COUNT(*) n FROM telegram_logins WHERE code=?").get(magic).n,0,'only the hash is stored');
 jar=new Map();assert.equal((await login.magicLogin(magic)).ok,true);assert.ok(jar.get('__Host-rf-tg'),'session in the opening browser');assert.ok(jar.get('__Host-rf-device'));
 jar=new Map();await assert.rejects(login.magicLogin(magic),e=>e.status===410,'one use');assert.equal(jar.get('__Host-rf-tg'),undefined);
 await assert.rejects(login.magicLogin('m_bad'),e=>e.status===410);
 db.exec("UPDATE telegram_logins SET expires_at=0 WHERE browser_hash='magic'");jar=pollingJar;
 assert.equal((await login.pollTelegramLogin()).status,'approved');assert.equal((await login.telegramIdentity()).userId,'tg:42');await login.endTelegramSession();
 // Existing account with this verified number signs in to that account.
 db.exec("INSERT INTO accounts(id,email,name,created_at,contact_phone,contact_phone_verified) VALUES ('sb:old','old@x','Old','now','+998907777777',1)");
 code=await start();await telegram.handleUpdate(msg(55,{text:'/start '+code}));assert.equal(await telegram.handleUpdate(msg(55,{contact:{phone_number:'+998907777777',user_id:55}})),'login_approved');
 assert.equal((await login.pollTelegramLogin()).status,'approved');assert.equal((await login.telegramIdentity()).userId,'sb:old');assert.equal(db.prepare("SELECT telegram_chat_id FROM accounts WHERE id='sb:old'").get().telegram_chat_id,'55');
 // The administrator never signs in through Telegram.
 db.exec("INSERT INTO accounts(id,email,name,created_at,role,contact_phone,contact_phone_verified) VALUES ('sb:4fcd0d25-6ec1-4e10-a15f-8005d683edfe','a@x','Admin','now','admin','+998905555555',1)");
 code=await start();await telegram.handleUpdate(msg(66,{text:'/start '+code}));assert.equal(await telegram.handleUpdate(msg(66,{contact:{phone_number:'998905555555',user_id:66}})),'login_admin');assert.equal((await login.pollTelegramLogin()).status,'denied');
 // The admin never gets a device key login.
 await login.rememberDevice('sb:4fcd0d25-6ec1-4e10-a15f-8005d683edfe');await assert.rejects(login.deviceLogin(),/tezkor kirish mumkin emas/);
 // Expired links and foreign numbers.
 assert.equal(await telegram.handleUpdate(msg(77,{text:'/start l_AAAAAAAAAAAAAAAAAAAAAAAA'})),'login_expired');
 code=await start();await telegram.handleUpdate(msg(88,{text:'/start '+code}));assert.equal(await telegram.handleUpdate(msg(88,{contact:{phone_number:'+79001234567',user_id:88}})),'login_not_uz');
 console.log('PASS telegram-login: browser-bound one-time request, own contact only, verified phone + birthday saved, existing account by verified number, admin refused, hashed session');
})().catch(e=>{console.error(e);process.exitCode=1});
