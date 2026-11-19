const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load}=require('./harness.cjs');
// 1 hour before the table: the bot asks the guest "Kelasizmi?" (✅ Ha, yo‘ldaman / ❌ Bekor qilish) once; the
// answer reaches the restaurant at once with the guest's Telegram profile and phone; cancel frees the table.
// A guest who takes a site booking with the t.me link: the restaurant gets their Telegram profile too.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...v){args=v;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 const env={DB,TELEGRAM_BOT_TOKEN:'1:x',TELEGRAM_WEBHOOK_SECRET:'s',SITE_URL:'https://restaurantfoods.online'},cw={'cloudflare:workers':{env}};
 const sent=[];const fetch=async(url,init)=>{const method=String(url).split('/').pop(),body=JSON.parse(init.body);sent.push({method,body});return Response.json({ok:true,result:method==='sendMessage'?{message_id:sent.length}:true})};
 const i18n=load('app/bot-i18n.ts',cw);
 const tg=load('app/telegram.ts',{...cw,'./otp-store':load('app/otp-store.ts',cw),'./telegram-login':{createMagicLink:async()=>'',saveTelegramUsername:async(c,u)=>db.prepare("INSERT OR REPLACE INTO app_settings(key,value,updated_at,updated_by) VALUES (?,?,'now','t')").run('tguser:'+c,u)},'./bot-i18n':i18n},{fetch});
 const ping=load('app/hour-ping.ts',{...cw,'./telegram':tg,'./bot-i18n':i18n},{fetch});
 db.exec("INSERT INTO accounts(id,email,name,created_at,role,telegram_chat_id) VALUES ('owner','o@x','O','now','restaurant_owner','900'),('tg:7','','Aziz','now','customer','7'),('guest:g','','Malika','now','customer',NULL)");
 db.exec("INSERT INTO restaurants(id,name,owner_id,status,tables,floors,booking_open,booking_close) VALUES ('r','Amanda','owner','active',3,1,'08:00','23:00')");
 const NOW=Date.parse('2026-11-19T12:00:00+05:00');
 db.prepare("INSERT INTO bookings(id,restaurant_id,user_id,date,slot,table_number,guests,phone,status,created_at) VALUES ('b1','r','tg:7','2026-11-19','13:00',2,2,'+998993847384','confirmed','now'),('b2','r','guest:g','2026-11-19','13:00',3,4,'+998901112233','pending','now'),('b3','r','guest:g','2026-11-19','15:00',2,2,'+998901112233','pending','now'),('b4','r','guest:g','2026-11-19','13:05',4,2,'+998901112233','pending','now')").run();
 db.exec("INSERT INTO app_settings(key,value,updated_at,updated_by) VALUES ('bookchat:b2','55','now','t'),('tguser:7','aziz_k','now','t')");

 // Cron: b1 (account chat) and b2 (t.me link) get it; b3 is 3 h away; b4 has no Telegram chat.
 let r=await ping.runHourPing(NOW);assert.equal(r.sent,2);
 const asks=sent.filter(s=>s.method==='sendMessage');assert.deepEqual(asks.map(s=>s.body.chat_id).sort(),['55','7']);
 const a7=asks.find(s=>s.body.chat_id==='7').body;assert.match(a7.text,/Amanda restoranidagi stolingizga 1 soat qoldi\. Kelasizmi\?/);
 assert.deepEqual(a7.reply_markup.inline_keyboard[0].map(b=>[b.text,b.callback_data]),[['✅ Ha, yo‘ldaman','hp:y:b1'],['❌ Bekor qilish','hp:n:b1']]);
 sent.length=0;r=await ping.runHourPing(NOW+5*60000);assert.equal(r.sent,0,'once per booking');assert.equal(sent.length,0);
 // Russian chat gets it in Russian.
 db.prepare("INSERT INTO bookings(id,restaurant_id,user_id,date,slot,table_number,guests,phone,status,created_at) VALUES ('b5','r','guest:g','2026-11-19','13:00',5,2,'+998901112233','pending','now')").run();db.exec("INSERT INTO app_settings(key,value,updated_at,updated_by) VALUES ('bookchat:b5','66','now','t'),('tglang:66','ru','now','t')");
 sent.length=0;await ping.runHourPing(NOW);assert.match(sent[0].body.text,/Amanda остался 1 час\. Вы придёте\?/);

 const cb=(data,chat)=>({callback_query:{id:'q',data,from:{id:Number(chat)},message:{chat:{id:Number(chat),type:'private'},message_id:9}}});
 // Only the guest's own chat may answer.
 sent.length=0;assert.equal(await ping.handleHourPing(cb('hp:y:b1','55')),'ping_denied');assert.equal(sent.filter(s=>s.method==='sendMessage').length,0);
 // ✅ → thanks to the guest, "Mijoz yo‘lda" to the restaurant with the Telegram link and phone.
 sent.length=0;assert.equal(await ping.handleHourPing(cb('hp:y:b1','7')),'ping_yes');
 const toR=sent.find(s=>s.method==='sendMessage'&&s.body.chat_id==='900').body.text;assert.match(toR,/Mijoz yo‘lda/);assert.match(toR,/<a href="tg:\/\/user\?id=7">Aziz<\/a> \(@aziz_k\)/);assert.match(toR,/\+998 99 384 73 84/);assert.match(toR,/2-stol/);
 assert.match(sent.find(s=>s.method==='sendMessage'&&s.body.chat_id==='7').body.text,/Rahmat/);assert.ok(sent.some(s=>s.method==='editMessageReplyMarkup'),'buttons removed');
 assert.equal(db.prepare("SELECT status FROM bookings WHERE id='b1'").get().status,'confirmed');
 sent.length=0;assert.equal(await ping.handleHourPing(cb('hp:n:b1','7')),'ping_stale','one answer only');assert.equal(db.prepare("SELECT status FROM bookings WHERE id='b1'").get().status,'confirmed');
 // ❌ → booking cancelled, the restaurant told the table is free.
 sent.length=0;assert.equal(await ping.handleHourPing(cb('hp:n:b2','55')),'ping_no');assert.equal(db.prepare("SELECT status FROM bookings WHERE id='b2'").get().status,'cancelled');
 const toR2=sent.find(s=>s.body.chat_id==='900').body.text;assert.match(toR2,/bekor qildi/);assert.match(toR2,/stol bo‘shadi/);assert.match(toR2,/tg:\/\/user\?id=55/);assert.match(toR2,/\+998 90 111 22 33/);
 assert.equal(await ping.handleHourPing({message:{chat:{id:1}}}),null,'other updates pass through');

 // A site guest opens the t.me link: the restaurant gets their Telegram profile right away.
 sent.length=0;assert.equal(await tg.handleUpdate({message:{chat:{id:77},from:{id:77,username:'malika_k'},text:'/start book_'+'00000000-0000-4000-8000-000000000001'}}),'book_claim_missing');
 db.prepare("INSERT INTO bookings(id,restaurant_id,user_id,date,slot,table_number,guests,phone,status,created_at) VALUES ('00000000-0000-4000-8000-000000000002','r','guest:g','2026-11-20','19:00',6,2,'+15551234567','pending','now')").run();
 sent.length=0;assert.equal(await tg.handleUpdate({message:{chat:{id:77},from:{id:77,username:'malika_k'},text:'/start book_00000000-0000-4000-8000-000000000002'}}),'book_claimed');
 const link=sent.find(s=>s.body.chat_id==='900').body.text;assert.match(link,/Mijoz Telegram’ni uladi/);assert.match(link,/<a href="tg:\/\/user\?id=77">Malika<\/a> \(@malika_k\)/);assert.match(link,/\+15551234567/);
 console.log('PASS hour ping: "Kelasizmi?" 1 hour before (account chat or t.me-linked guest, once, chat language), only the guest answers, once; yes / cancel reach the restaurant with tg://user link and phone; cancel frees the table; t.me link claim tells the restaurant the guest’s Telegram');
})().catch(e=>{console.error(e);process.exitCode=1});
