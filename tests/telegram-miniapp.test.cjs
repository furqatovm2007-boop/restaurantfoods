const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),zlib=require('node:zlib'),jsQR=require('jsqr'),{DatabaseSync}=require('node:sqlite'),{load}=require('./harness.cjs');
// Telegram Mini App: launch data checked on the server (signature, age, real user), zero-click sign-in
// (new account, existing linked account, admin and suspended refused), the phone through Telegram's
// "share contact" (saved verified, or the chat moves to the account that owns the number), and the bot's
// own menu (restaurants without demo ones, free tables, menu, flowers, bookings with a QR picture) plus
// the admin menu-button setup.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...v){args=v;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 const TOKEN='123456:ABCdef',env={DB,TELEGRAM_BOT_TOKEN:TOKEN,TELEGRAM_WEBHOOK_SECRET:'s',TELEGRAM_BOT_USERNAME:'rf_bot',SITE_URL:'https://restaurantfoods.online'};
 let jar=new Map();const cookies=async()=>({get:n=>jar.has(n)?{value:jar.get(n)}:undefined,set:(n,v)=>{if(v)jar.set(n,v);else jar.delete(n)}});
 const sent=[];const fetch=async(url,init)=>{const method=String(url).split('/').pop();if(init.body instanceof FormData){const photo=init.body.get('photo');sent.push({method,form:true,chat:init.body.get('chat_id'),caption:init.body.get('caption'),png:Buffer.from(await photo.arrayBuffer())});return Response.json({ok:true,result:{}})}const body=JSON.parse(init.body);sent.push({method,body});if(method==='sendPhoto'&&String(body.photo).includes('broken'))return Response.json({ok:false,description:'bad photo'});return Response.json({ok:true,result:method.startsWith('set')?true:{}})};
 const extras={fetch,FormData,Blob,CompressionStream,Response,setTimeout};
 const cf={'cloudflare:workers':{env}},http=load('app/http.ts',cf);
 const login=load('app/telegram-login.ts',{...cf,'next/headers':{cookies},'./http':http});
 const telegram=load('app/telegram.ts',{...cf,'./otp-store':load('app/otp-store.ts',cf),'./telegram-login':login},extras);
 const menu=load('app/telegram-menu.ts',{...cf,'qrcode-generator':{default:require('qrcode-generator')},'./telegram':telegram,'./booking-pass':load('app/booking-pass.ts',cf)},extras);

 // Signed launch data, made the way Telegram makes it.
 const sign=(fields,token=TOKEN)=>{const p=new URLSearchParams(fields);const dcs=[...p.entries()].sort(([a],[b])=>a<b?-1:1).map(([k,v])=>k+'='+v).join('\n');const secret=crypto.createHmac('sha256','WebAppData').update(token).digest();p.set('hash',crypto.createHmac('sha256',secret).update(dcs).digest('hex'));return p.toString()};
 const now=Math.floor(Date.now()/1000),launch=(id,extra={})=>sign({auth_date:String(now),query_id:'AAH',user:JSON.stringify({id,first_name:'Aziz',last_name:'Karimov',username:'aziz',...extra})});
 let v=await login.verifyWebAppData(launch(42),TOKEN);assert.equal(v.user.id,42);assert.equal(v.user.first_name,'Aziz');
 const tampered=launch(42).replace('Aziz','Admin');assert.equal(await login.verifyWebAppData(tampered,TOKEN),null,'changed data fails the signature');
 assert.equal(await login.verifyWebAppData(launch(42),'999:other'),null,'another bot’s token');
 assert.equal(await login.verifyWebAppData(sign({auth_date:String(now-2*86400),user:JSON.stringify({id:42,first_name:'A'})}),TOKEN),null,'older than 24 h');
 assert.equal(await login.verifyWebAppData(sign({auth_date:String(now),user:JSON.stringify({id:42,first_name:'A',is_bot:true})}),TOKEN),null,'bots are refused');
 assert.equal(await login.verifyWebAppData('user=%7B%22id%22%3A42%7D&auth_date='+now,TOKEN),null,'no hash');
 assert.equal(await login.verifyWebAppData(123,TOKEN),null);

 // Zero-click sign-in: a new customer account for the Telegram user, then the same account again.
 let r=await login.webAppLogin(launch(42));assert.deepEqual({...r},{ok:true,created:true});
 let acc=db.prepare("SELECT * FROM accounts WHERE id='tg:42'").get();assert.equal(acc.telegram_chat_id,'42');assert.equal(acc.role,'customer');assert.equal(acc.name,'Aziz Karimov');assert.equal(acc.preferred_language,'uz','default Uzbek');assert.equal(acc.contact_phone_verified,0);
 assert.ok(jar.get('__Host-rf-tg'),'session cookie issued');assert.ok(jar.get('__Host-rf-device'));const first=jar.get('__Host-rf-tg');
 assert.equal((await login.telegramIdentity()).userId,'tg:42');
 r=await login.webAppLogin(launch(42));assert.equal(r.created,false);assert.notEqual(jar.get('__Host-rf-tg'),first,'session replaced');assert.equal(db.prepare("SELECT COUNT(*) n FROM telegram_sessions WHERE token_hash=?").get(await login.sha256(first)).n,0,'old session removed');
 await assert.rejects(login.webAppLogin(tampered),e=>e.status===401);
 // An existing site account linked to this chat signs in as itself; admin and suspended accounts never do.
 db.exec("INSERT INTO accounts(id,email,name,created_at,role,telegram_chat_id) VALUES ('sb:linked','a@b.c','Linked','2026-01-01','customer','77'),('sb:boss','x@y.z','Boss','2026-01-01','admin','7'),('sb:off','o@y.z','Off','2026-01-01','customer','8')");db.exec("UPDATE accounts SET status='suspended' WHERE id='sb:off'");
 jar=new Map();r=await login.webAppLogin(launch(77));assert.equal(r.created,false);assert.equal((await login.telegramIdentity()).userId,'sb:linked');
 await assert.rejects(login.webAppLogin(launch(7)),e=>e.status===403);await assert.rejects(login.webAppLogin(launch(8)),e=>e.status===403);
 env.TELEGRAM_BOT_TOKEN='';await assert.rejects(login.webAppLogin(launch(42)),e=>e.status===503);env.TELEGRAM_BOT_TOKEN=TOKEN;

 // The phone through Telegram's requestContact: saved as verified at once.
 const msg=(chat,extra)=>({message:{chat:{id:chat,type:'private'},from:{id:chat,first_name:'Aziz'},...extra}});
 jar=new Map();await login.webAppLogin(launch(42));
 assert.equal((await login.webAppContactStatus('tg:42')).status,'none');
 await login.startWebAppContact('tg:42');assert.equal((await login.webAppContactStatus('tg:42')).status,'waiting');
 assert.equal(await telegram.handleUpdate(msg(42,{contact:{phone_number:'998901234567',user_id:99}})),'contact_not_own','someone else’s number');
 assert.equal(await telegram.handleUpdate(msg(42,{contact:{phone_number:'+998 90 123 45 67',user_id:42}})),'webapp_contact_saved');
 acc=db.prepare("SELECT contact_phone,contact_phone_verified FROM accounts WHERE id='tg:42'").get();assert.equal(acc.contact_phone,'+998901234567');assert.equal(acc.contact_phone_verified,1);
 assert.equal((await login.webAppContactStatus('tg:42')).status,'saved');assert.equal((await login.webAppContactStatus('tg:42')).status,'none','read once');
 assert.ok(sent.some(s=>s.method==='sendMessage'&&/saqlandi/.test(s.body.text)));
 // Foreign numbers are refused; an account without a Mini App request keeps the old code flow.
 await login.startWebAppContact('tg:42');assert.equal(await telegram.handleUpdate(msg(42,{contact:{phone_number:'+77011234567',user_id:42}})),'webapp_contact_not_uz');assert.equal((await login.webAppContactStatus('tg:42')).status,'not_uz');
 assert.equal(await telegram.handleUpdate(msg(42,{contact:{phone_number:'998901234567',user_id:42}})),'code_sent','no request: the usual code');
 // The number already belongs to another account: the chat moves there and the page signs into it.
 db.exec("INSERT INTO accounts(id,email,name,created_at,role,contact_phone,contact_phone_verified) VALUES ('sb:owner-of-number','n@b.c','Nodira','2026-01-01','customer','+998911112233',1)");
 jar=new Map();await login.webAppLogin(launch(43));await login.startWebAppContact('tg:43');
 assert.equal(await telegram.handleUpdate(msg(43,{contact:{phone_number:'998911112233',user_id:43}})),'webapp_contact_switched');
 assert.equal(db.prepare("SELECT telegram_chat_id FROM accounts WHERE id='sb:owner-of-number'").get().telegram_chat_id,'43');assert.equal(db.prepare("SELECT telegram_chat_id FROM accounts WHERE id='tg:43'").get().telegram_chat_id,null);
 assert.equal((await login.webAppContactStatus('tg:43')).status,'switched');assert.equal((await login.telegramIdentity()).userId,'sb:owner-of-number');
 jar=new Map();assert.equal((await login.webAppLogin(launch(43))).created,false,'next launch opens that account');assert.equal((await login.telegramIdentity()).userId,'sb:owner-of-number');
 // The admin's number is never taken over.
 db.exec("UPDATE accounts SET contact_phone='+998935556677',contact_phone_verified=1 WHERE id='sb:boss'");jar=new Map();await login.webAppLogin(launch(44,{language_code:'en'}));assert.equal(db.prepare("SELECT preferred_language FROM accounts WHERE id='tg:44'").get().preferred_language,'en','Telegram app language');await login.startWebAppContact('tg:44');
 assert.equal(await telegram.handleUpdate(msg(44,{contact:{phone_number:'998935556677',user_id:44}})),'webapp_contact_taken');assert.equal(db.prepare("SELECT telegram_chat_id FROM accounts WHERE id='sb:boss'").get().telegram_chat_id,'7');
 await assert.rejects(login.startWebAppContact('tg:43'),e=>e.status===409,'no linked chat');

 // Bot menu.
 sent.length=0;assert.equal(await menu.handleMenu(msg(42,{text:'/start'})),'menu');
 const kbd=sent[0].body.reply_markup;assert.equal(kbd.is_persistent,true);assert.equal(kbd.resize_keyboard,true);assert.equal(kbd.keyboard[0][0].web_app.url,'https://restaurantfoods.online/?source=tg_miniapp&lang=uz');assert.deepEqual(kbd.keyboard.slice(1).map(r=>r.map(k=>k.text)),[['🍽️ Restoranlar','📖 Menyu'],['💐 Gullar','📅 Bronlarim'],['🤖 AI Yordamchi','👤 Profilim'],['🌐 Til / Язык / Language']]);assert.deepEqual(sent[1].body.reply_markup.inline_keyboard[0].map(b=>b.callback_data),['m:l:uz','m:l:ru','m:l:en'],'/start offers the three languages');const main=sent[2].body.reply_markup.inline_keyboard;assert.equal(main[0][0].web_app.url,'https://restaurantfoods.online/?source=tg_miniapp&lang=uz');assert.match(main[0][0].text,/Restoranlar, 3D Stol va Menyu/);assert.deepEqual(main.slice(1).map(r=>r[0].callback_data),['m:r:0','m:f:0','m:b']);
 assert.equal(await menu.handleMenu({message:{chat:{id:-5,type:'group'},text:'/start'}}),null,'groups keep the restaurant bot');
 assert.equal(await menu.handleMenu(msg(42,{text:'/start l_abc'})),null,'deep links go to the regular bot');
 const until=new Date(Date.now()+30*86400000).toISOString();
 db.prepare("INSERT INTO restaurants(id,name,status,owner_id,plan,paid_until,image_url,booking_open,booking_close,cuisine,address) VALUES ('r1','Osh Markazi','active','o','business',?,'/api/media?key=photos/x.jpg','00:00','24:00','Milliy','Registon 1'),('r2','Broken Photo','active','o','business',?,'https://cdn.test/broken.jpg','00:00','24:00','',''),('rf-demo-1','Demo','active','o','business',?,'','00:00','24:00','',''),('r3','Closed','pending','o','business',?,'','00:00','24:00','','')").run(until,until,until,until);
 db.exec("UPDATE restaurants SET is_demo=1 WHERE id='rf-demo-1'");
 db.exec("INSERT INTO restaurant_tables(id,restaurant_id,number,seats,active) VALUES ('t1','r1',1,4,1),('t2','r1',2,6,1),('t3','r1',3,2,1)");
 db.prepare("INSERT INTO table_live_status(restaurant_id,table_number,status,source,updated_at) VALUES ('r1',2,'occupied','camera',?)").run(new Date().toISOString());
 db.exec("INSERT INTO menu(id,restaurant_id,name,price,available,category) VALUES ('d1','r1','Samarqand oshi',45000,1,'Taomlar'),('d2','r1','Ko‘k choy',8000,1,'Ichimliklar'),('d3','r1','Tugagan',1000,0,'Taomlar')");
 db.exec("INSERT INTO reviews(id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rv1','r1','u1',5,'Zo‘r','2026-01-01','2026-01-01')");
 const cb=(data,chat=42)=>({callback_query:{id:'q',data,message:{chat:{id:chat,type:'private'},message_id:1}}});
 sent.length=0;assert.equal(await menu.handleMenu(cb('m:r:0')),'menu_restaurants');
 const cards=sent.filter(s=>s.method==='sendPhoto'||s.method==='sendMessage');const text=cards.map(s=>s.body.caption||s.body.text).join('\n');
 assert.ok(text.includes('Osh Markazi')&&text.includes('Broken Photo'));assert.ok(!text.includes('Demo')&&!text.includes('Closed'),'demo and inactive restaurants are not listed');
 // Step 1: one list message, a button per restaurant (no demo / inactive ones).
 const list=sent.find(s=>s.method==='sendMessage'&&/Restoranni tanlang/.test(s.body.text));assert.ok(list);assert.match(list.body.text,/Osh Markazi/);assert.match(list.body.text,/🪑 2 bo‘sh/);
 assert.deepEqual(list.body.reply_markup.inline_keyboard.map(r=>r[0].callback_data),['m:c:r2','m:c:r1'],'one button per restaurant, by name');assert.equal(sent.filter(s=>s.method==='sendPhoto').length,0,'no photo flood in the list');
 // Step 2: the chosen restaurant's card — its own booking deep link, menu, free tables and the way back.
 sent.length=0;assert.equal(await menu.handleMenu(cb('m:c:r1')),'menu_restaurant');
 const osh=sent.find(s=>s.method==='sendPhoto');assert.equal(osh.body.photo,'https://restaurantfoods.online/api/media?key=photos/x.jpg');assert.match(osh.body.caption,/bo‘sh stollar: <b>2<\/b> \/ 3/);assert.match(osh.body.caption,/⭐/);
 const kb=osh.body.reply_markup.inline_keyboard;assert.equal(kb[0][0].web_app.url,'https://restaurantfoods.online/?source=tg_miniapp&lang=uz&restaurant_id=r1&action=book');assert.match(kb[0][0].text,/Shu restoran stollarini ko‘rish va Bron qilish/);assert.deepEqual([kb[1][0].callback_data,kb[1][1].callback_data,kb[2][0].callback_data],['m:m:r1','m:t:r1','m:r:0']);assert.match(kb[2][0].text,/Orqaga \(Barcha restoranlar\)/);
 assert.equal(await menu.handleMenu(cb('m:c:rf-demo-1')),'menu_gone','demo restaurants have no card');assert.equal(await menu.handleMenu(cb('m:c:r3')),'menu_gone','inactive restaurants have no card');
 sent.length=0;await menu.handleMenu(cb('m:c:r2'));assert.ok(sent.some(s=>s.method==='sendMessage'&&(s.body.text||'').includes('Broken Photo')),'a photo Telegram refuses falls back to text');
 sent.length=0;assert.equal(await menu.handleMenu(cb('m:t:r1')),'menu_tables');let out=sent.find(s=>s.method==='sendMessage').body.text;assert.ok(out.includes('1-stol')&&out.includes('3-stol')&&!out.includes('2-stol'),'busy table hidden');
 sent.length=0;assert.equal(await menu.handleMenu(cb('m:m:r1')),'menu_dishes');out=sent.find(s=>s.method==='sendMessage').body.text;assert.ok(out.includes('Samarqand oshi — 45 000 so‘m')&&out.includes('<b>Ichimliklar</b>')&&!out.includes('Tugagan'));
 assert.equal(await menu.handleMenu(cb('m:m:rf-demo-1')),'menu_gone');assert.equal(await menu.handleMenu(cb('m:t:<b>x</b>')),'menu_gone');
 db.exec("INSERT INTO accounts(id,email,name,created_at,role,status) VALUES ('fl','f@b.c','Gulchi Nilufar','2026-01-01','florist','active')");
 db.exec("INSERT INTO flowers(id,florist_id,title,kind,size,price,image_url,created_at,status,is_approved,in_stock) VALUES ('f1','fl','Atirgul 25','Atirgul','O‘rta',250000,'','2026-01-02','active',1,1),('f2','fl','Tugagan gul','Lola','Kichik',90000,'','2026-01-01','active',1,0)");
 sent.length=0;assert.equal(await menu.handleMenu(cb('m:f:0')),'menu_flowers');out=sent.map(s=>s.body?.text||'').join('\n');assert.ok(out.includes('Atirgul 25')&&out.includes('250 000 so‘m')&&out.includes('Gulchi Nilufar')&&!out.includes('Tugagan gul'));assert.match(sent.find(s=>s.body?.reply_markup).body.reply_markup.inline_keyboard[0][0].web_app.url,/go=%2Fflowers$/);
 // My bookings: unknown chat is asked to open the Mini App; a booking comes with its QR pass as a PNG.
 sent.length=0;assert.equal(await menu.handleMenu(cb('m:b',999)),'menu_bookings_signin');
 assert.equal(await menu.handleMenu(cb('m:b',42)),'menu_bookings_empty');
 const day=new Date(Date.now()+5*3600000+86400000).toISOString().slice(0,10);
 db.prepare("INSERT INTO bookings(id,restaurant_id,user_id,date,slot,table_number,guests,phone,status,created_at) VALUES ('bk1','r1','tg:42',?,'19:00',1,2,'+998901234567','confirmed','2026-01-01'),('bk2','r1','tg:42',?,'20:00',3,2,'+998901234567','cancelled','2026-01-01')").run(day,day);
 sent.length=0;assert.equal(await menu.handleMenu(cb('m:b',42)),'menu_bookings');
 const photo=sent.find(s=>s.form);assert.equal(photo.chat,'42');assert.match(photo.caption,/Osh Markazi/);assert.match(photo.caption,/Tasdiqlangan/);assert.equal(sent.filter(s=>s.form).length,1,'cancelled bookings are not shown');
 assert.deepEqual([...photo.png.subarray(0,8)],[137,80,78,71,13,10,26,10],'PNG signature');
 // Decode the picture back: the QR holds the booking's pass.
 const w=photo.png.readUInt32BE(16),h=photo.png.readUInt32BE(20);let pos=8,idat=[];while(pos<photo.png.length){const len=photo.png.readUInt32BE(pos),type=photo.png.toString('ascii',pos+4,pos+8);if(type==='IDAT')idat.push(photo.png.subarray(pos+8,pos+8+len));pos+=12+len}
 const raw=zlib.inflateSync(Buffer.concat(idat)),rgba=new Uint8ClampedArray(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const g=raw[y*(w+1)+1+x];rgba.set([g,g,g,255],(y*w+x)*4)}
 const pass=db.prepare("SELECT pass_code FROM bookings WHERE id='bk1'").get().pass_code;assert.ok(pass);assert.equal(jsQR(rgba,w,h).data,'RFB1:'+pass);
 // Admin setup of the menu button.
 sent.length=0;const setup=await menu.setupMiniApp();assert.equal(setup.menuButton,true);assert.deepEqual({...sent.find(s=>s.method==='setChatMenuButton').body.menu_button},{type:'commands'});const cmds=sent.find(s=>s.method==='setMyCommands').body;assert.equal(cmds.scope.type,'default');assert.deepEqual(cmds.commands.map(c=>c.command),['start','restaurants','menu','flowers','mybookings','ai','profile','language']);assert.deepEqual(sent.filter(s=>s.method==='setMyCommands').map(s=>s.body.language_code||'default').sort(),['default','en','ru'],'commands in each language');
 // Commands and the keyboard's plain-text labels open the same sections; other text brings the keyboard back.
 for(const [input,expect] of [['/restaurants','menu_restaurants'],['🏢 Restoranlar ro‘yxati','menu_restaurants'],['/menu','menu_picker'],['📖 Menyu','menu_picker'],['/flowers','menu_flowers'],['💐 Gullar','menu_flowers'],['/mybookings','menu_bookings'],['📅 Bronlarim va QR','menu_bookings'],['/ai','menu_ai'],['🤖 AI Yordamchi','menu_ai'],['/profile','menu_profile'],['👤 Profilim','menu_profile'],['/restaurants@rf_bot','menu_restaurants'],['salom','menu_hint']]){sent.length=0;assert.equal(await menu.handleMenu(msg(42,{text:input})),expect,input)}
 sent.length=0;await menu.handleMenu(msg(42,{text:'/menu'}));assert.deepEqual(sent[0].body.reply_markup.inline_keyboard.find(r=>r[0].callback_data==='m:m:r1')[0].text,'📖 Osh Markazi');
 sent.length=0;await menu.handleMenu(msg(42,{text:'/profile'}));let prof=sent[0].body.text;assert.match(prof,/\+998 90 \*\*\* \*\* 67 ✅/);assert.ok(!prof.includes('901234567'),'phone masked');assert.match(prof,/15% chegirma/);
 assert.equal(await menu.handleMenu(msg(999,{text:'/profile'})),'menu_signin');
 for(const t of ['/stop','/start c_abcdefghijklmnopqrstuvwx','/start l_abc'])assert.equal(await menu.handleMenu(msg(42,{text:t})),null,t+' stays with the regular bot');
 assert.equal(await menu.handleMenu({message:{chat:{id:-5,type:'group'},text:'salom'}}),null,'groups are never answered by the menu');
 // Contact flows bring the menu keyboard back instead of removing it.
 sent.length=0;await login.startWebAppContact('tg:42');await telegram.handleUpdate(msg(42,{contact:{phone_number:'998901234567',user_id:42}}));assert.equal(sent.find(s=>s.method==='sendMessage').body.reply_markup.is_persistent,true);
 // Language: /language and the 🌐 key show the picker; a choice is saved for the chat and the linked account,
 // and the keyboard, the menus and the Mini App links follow it. Old keyboard labels keep working.
 sent.length=0;assert.equal(await menu.handleMenu(msg(42,{text:'/language'})),'menu_language');assert.equal(sent[0].body.reply_markup.inline_keyboard[0].length,3);
 assert.equal(await menu.handleMenu(msg(42,{text:'🌐 Til / Язык / Language'})),'menu_language');
 sent.length=0;assert.equal(await menu.handleMenu(cb('m:l:ru')),'menu_language_ru');
 assert.equal(sent.find(s=>s.method==='editMessageText').body.text,'✅ Язык сохранён: Русский');
 const ruKbd=sent.find(s=>s.body?.reply_markup?.keyboard).body.reply_markup;assert.equal(ruKbd.keyboard[0][0].web_app.url,'https://restaurantfoods.online/?source=tg_miniapp&lang=ru');assert.deepEqual(ruKbd.keyboard.slice(1,4).map(r=>r.map(k=>k.text)),[['🍽️ Рестораны','📖 Меню'],['💐 Цветы','📅 Мои брони'],['🤖 ИИ Помощник','👤 Профиль']]);
 assert.equal(db.prepare("SELECT preferred_language FROM accounts WHERE telegram_chat_id='42'").get().preferred_language,'ru','saved on the linked account');
 sent.length=0;assert.equal(await menu.handleMenu(msg(42,{text:'🍽️ Рестораны'})),'menu_restaurants');assert.match(sent[0].body.text,/Выберите ресторан/);
 sent.length=0;assert.equal(await menu.handleMenu(msg(42,{text:'🏢 Restoranlar ro‘yxati'})),'menu_restaurants','old keyboard label');
 sent.length=0;await menu.handleMenu(cb('m:c:r1'));const ruCard=sent.find(s=>s.method==='sendPhoto');assert.match(ruCard.body.reply_markup.inline_keyboard[0][0].web_app.url,/lang=ru&restaurant_id=r1/);assert.match(ruCard.body.caption,/Свободных столов сейчас/);
 sent.length=0;await menu.handleMenu(msg(42,{text:'salom'}));assert.match(sent[0].body.text,/Выберите кнопку/);assert.equal(sent[0].body.reply_markup.keyboard[1][0].text,'🍽️ Рестораны');
 sent.length=0;await menu.handleMenu(cb('m:l:en'));await menu.handleMenu(msg(42,{text:'📅 My Bookings'}));assert.ok(sent.some(s=>s.form&&/Confirmed/.test(s.caption)),'bookings in English');
 assert.equal(await menu.handleMenu(cb('m:l:xx')),'menu_unknown');
 // The site's language switch moves the bot too; contact flows keep the chat's keyboard language.
 const i18n=load('app/bot-i18n.ts',cf);await i18n.syncAccountLang('tg:42','ru');assert.equal(await i18n.chatLang('42'),'ru');
 sent.length=0;await login.startWebAppContact('tg:42');await telegram.handleUpdate(msg(42,{contact:{phone_number:'998901234567',user_id:42}}));assert.equal(sent.find(s=>s.method==='sendMessage').body.reply_markup.keyboard[1][0].text,'🍽️ Рестораны');
 assert.equal(await i18n.chatLang('999'),'uz','never chosen: Uzbek');
 await menu.handleMenu(cb('m:l:uz'));
 // One-time announcement to every linked chat, in batches, never twice; suspended and unlinked are skipped.
 db.exec("UPDATE accounts SET status='suspended' WHERE id='sb:off'");const linked=db.prepare("SELECT COUNT(*) n FROM accounts WHERE telegram_chat_id IS NOT NULL AND COALESCE(status,'active')<>'suspended'").get().n;assert.ok(linked>=4);
 sent.length=0;let st=await menu.syncOldUsers(2);assert.equal(st.sent,2);assert.equal(st.finished,false);
 while(!st.finished)st=await menu.syncOldUsers(2);assert.equal(st.sent,linked);assert.equal(st.failed,0);
 const msgs=sent.filter(s=>s.method==='sendMessage'&&s.body.text===menu.SYNC_TEXT);assert.equal(msgs.length,linked);assert.equal(new Set(msgs.map(m=>String(m.body.chat_id))).size,linked,'nobody twice');assert.ok(!msgs.some(m=>m.body.chat_id==='8'),'suspended skipped');assert.ok(msgs.every(m=>m.body.reply_markup.is_persistent));
 sent.length=0;st=await menu.syncOldUsers(2);assert.equal(sent.length,0,'finished: no more messages');
 sent.length=0;await menu.ensureBotSetup();assert.ok(sent.some(s=>s.method==='setMyCommands'));sent.length=0;assert.equal((await menu.ensureBotSetup()).already,true);assert.equal(sent.length,0,'setup once per release');
 sent.length=0;await menu.runBotSync();assert.equal(sent.length,0);
 console.log('PASS Telegram Mini App: signed launch data only, zero-click sign-in (admin/suspended refused), phone via share contact (saved/moved/foreign/admin), bot menu (no demo, free tables, menu, flowers, bookings with a decodable QR PNG), commands menu, persistent keyboard and its labels, one-time announcement to linked chats.');
})().catch(e=>{console.error(e);process.exitCode=1});
