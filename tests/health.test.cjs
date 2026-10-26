const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load}=require('./harness.cjs');
// Health watch: a broken Telegram webhook or a burst of 5xx answers sends one Telegram message to the
// admin, no repeats within the hour, a "recovered" message when it clears; no admin chat → logged only.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...v){args=v;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 const env={DB,TELEGRAM_BOT_TOKEN:'bot:t',SITE_URL:'https://restaurantfoods.online'};
 let hook={url:'https://restaurantfoods.online/api/telegram/webhook',pending_update_count:0};const sent=[];
 const fetch=async(url,init)=>{const method=String(url).split('/').pop(),body=JSON.parse(init.body);if(method==='getWebhookInfo')return Response.json({ok:true,result:hook});if(method==='sendMessage')sent.push(body);return Response.json({ok:true,result:{}})};
 const cf={'cloudflare:workers':{env}};
 const telegram=load('app/telegram.ts',{...cf,'./otp-store':load('app/otp-store.ts',cf)},{fetch});
 const errors=[];const health=load('app/health.ts',{...cf,'./telegram':telegram},{console:{error:m=>errors.push(m)}});
 const T=Date.parse('2026-10-26T10:00:00Z');
 // Healthy, no admin chat yet.
 assert.equal((await health.runHealthCheck(T)).problems.length,0);
 // Webhook pointing elsewhere, no admin chat: nothing sent, logged.
 hook={url:'https://old.example/hook'};let r=await health.runHealthCheck(T+60000);
 assert.equal(r.problems[0].kind,'telegram');assert.equal(sent.length,0);assert.ok(errors.some(e=>e.includes('health_alert_no_admin_chat')));
 // Admin links Telegram: one alert, no repeat within the hour, repeat after it.
 db.exec("INSERT INTO accounts(id,email,name,created_at,role,telegram_chat_id) VALUES ('adm','a@x','Admin','now','admin','555')");
 db.exec("DELETE FROM app_settings WHERE key='health:alerts'");
 await health.runHealthCheck(T+120000);assert.equal(sent.length,1);assert.equal(sent[0].chat_id,'555');assert.match(sent[0].text,/webhooki saytga ulanmagan/);
 await health.runHealthCheck(T+300000);assert.equal(sent.length,1,'no repeat within the hour');
 await health.runHealthCheck(T+120000+3600000);assert.equal(sent.length,2,'hourly reminder');
 // Recovered.
 hook={url:'https://restaurantfoods.online/api/telegram/webhook',pending_update_count:0};
 await health.runHealthCheck(T+120000+3700000);assert.equal(sent.length,3);assert.match(sent[2].text,/yana normal/);
 // Delivery errors in the last 15 minutes and a stuck queue count too.
 const now=T+5*3600000;hook={url:'https://restaurantfoods.online/api/telegram/webhook',last_error_date:Math.floor(now/1000)-60,last_error_message:'Wrong response from the webhook: 403 Forbidden'};
 assert.match((await health.checkHealth(now))[0].text,/403 Forbidden/);
 hook={url:'https://restaurantfoods.online/api/telegram/webhook',pending_update_count:57};assert.match((await health.checkHealth(now))[0].text,/57 ta xabar/);
 // 5xx burst: 20 within 20 minutes alerts; old buckets are dropped.
 hook={url:'https://restaurantfoods.online/api/telegram/webhook'};
 await health.recordServerError(now-3*3600000);
 for(let i=0;i<19;i++)await health.recordServerError(now-i*1000);
 assert.equal((await health.checkHealth(now)).length,0,'19 errors: below the limit');
 assert.equal(db.prepare("SELECT COUNT(*) n FROM app_settings WHERE key LIKE 'health:5xx:%'").get().n<=2,true,'old buckets dropped');
 await health.recordServerError(now);const p=await health.checkHealth(now);assert.equal(p[0].kind,'errors');assert.match(p[0].text,/20 marta/);
 const last=JSON.parse(db.prepare("SELECT value FROM app_settings WHERE key='health:last'").get().value);assert.equal(last.alertChats,1);
 console.log('PASS health watch: webhook/queue/delivery errors and 5xx bursts → one admin Telegram alert per hour, recovery message, no chat → log');
})().catch(e=>{console.error(e);process.exit(1)});
