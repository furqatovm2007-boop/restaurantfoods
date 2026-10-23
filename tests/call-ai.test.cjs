const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load}=require('./harness.cjs');
// Call AI (Premium): 2 hours before the booking the customer gets a voice note + question with
// Yes/No in Telegram; Yes confirms; No / no answer / unreachable are reported to the restaurant.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...v){args=v;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 const env={DB,TELEGRAM_BOT_TOKEN:'bot:t'};
 const tg=[],edge=[];let transcript='ha, albatta kelaman';
 const fetch=async(url,init)=>{url=String(url);
  if(url.includes('/functions/v1/restaurantfoods-ai')){const b=JSON.parse(init.body);edge.push({b,headers:init.headers});return b.mode==='call_speech'?Response.json({audio:btoa('OggS-voice'),mimeType:'audio/ogg'}):Response.json({transcript})}
  if(url.includes('/file/bot'))return new Response(new Uint8Array([79,103,103,83]));
  const method=url.split('/').pop();if(method==='sendVoice'){tg.push({method,chat:init.body.get('chat_id'),voice:init.body.get('voice')});return Response.json({ok:true,result:{}})}
  const body=JSON.parse(init.body);tg.push({method,body});return Response.json({ok:true,result:method==='getFile'?{file_path:'voice/1.oga',file_size:3000}:{}})};
 const cf={'cloudflare:workers':{env}},http=load('app/http.ts',cf);
 let proxy='proxy-secret';
 const telegram=load('app/telegram.ts',{...cf,'./otp-store':load('app/otp-store.ts',cf)},{fetch});
 const call=load('app/call-ai.ts',{...cf,'./auth-service':{authConfig:()=>({url:'https://x.supabase.co',key:'anon',proxy})},'./plans':load('app/plans.ts',{...cf,'./http':http}),'./telegram':telegram},{fetch,FormData,Blob});
 // parseAnswer
 for(const [t,v] of [['Ha','yes'],['ha kelaman','yes'],['Albatta!','yes'],['Да, приду','yes'],['yes sure','yes'],["Yo'q",'no'],['yo‘q kela olmayman','no'],['нет, не смогу','no'],['no','no'],['bilmadim','null'],['hayot','null']])assert.equal(String(call.parseAnswer(t)),v,t);
 const future=d=>new Date(Date.now()+d*60000+5*3600000).toISOString(),trial=new Date(Date.now()+7*86400000).toISOString(),paid=new Date(Date.now()+30*86400000).toISOString();
 db.exec("INSERT INTO accounts(id,email,name,created_at,role,telegram_chat_id,preferred_language) VALUES ('c1','c1@x','Aziz Karimov','now','customer','500','uz'),('c2','c2@x','Olga','now','customer',NULL,'ru'),('c3','c3@x','Ann','now','customer','700','en')");
 db.prepare("INSERT INTO restaurants(id,name,owner_id,status,tables,plan,trial_ends_at,telegram_chat_id) VALUES ('prem','Real <Osh>','o','active',5,'premium',?,'777'),('biz','Biz','o','active',5,'business',NULL,'888')").run(trial);
 db.prepare("UPDATE restaurants SET paid_until=? WHERE id='biz'").run(paid);
 let table=0;const add=(id,r,user,mins,status='pending')=>{const f=future(mins);db.prepare("INSERT INTO bookings(id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES (?,?,?,?,?,'',?,3,'+998901234567',?,'now')").run(id,r,user,f.slice(0,10),f.slice(11,16),++table,status)};
 add('b1','prem','c1',100);add('b2','prem','c2',90);add('b3','biz','c3',100);add('b4','prem','c3',200);add('b5','prem','c3',100,'cancelled');
 const status=id=>db.prepare('SELECT status,call_status FROM bookings WHERE id=?').get(id);
 let r=await call.runCallAi();assert.equal(r.called,2,'b1 + b2 only (Premium, active, within 2 h)');
 // b1: voice note via the Edge Function service mode, then the question with Yes/No buttons.
 assert.equal(edge[0].b.mode,'call_speech');assert.equal(edge[0].headers['X-RF-Proxy'],'proxy-secret');assert.equal(edge[0].headers['X-RF-Service'],'call');
 assert.ok(edge[0].b.text.startsWith('Salom Aziz, RestaurantFoods orqali qilgan broningizga 2 soat qoldi. Kelishingizni tasdiqlaysizmi?'));
 const voice=tg.find(x=>x.method==='sendVoice');assert.equal(voice.chat,'500');assert.equal(voice.voice.type,'audio/ogg');
 const ask=tg.find(x=>x.method==='sendMessage'&&x.body.chat_id==='500');assert.ok(ask.body.text.includes('Real &lt;Osh&gt;'));assert.deepEqual(ask.body.reply_markup.inline_keyboard[0].map(b=>b.callback_data),['cc:y:b1','cc:n:b1']);
 assert.equal(status('b1').call_status,'calling');
 // b2: no Telegram -> restaurant told at once.
 assert.equal(status('b2').call_status,'unreachable');assert.ok(tg.some(x=>x.body?.chat_id==='777'&&x.body.text.includes('ulanmagan')));
 assert.equal(status('b3').call_status,'','Business plan: no Call AI');assert.equal(status('b4').call_status,'','more than 2 h left');assert.equal(status('b5').call_status,'','cancelled');
 assert.equal((await call.runCallAi()).called,0,'never twice');
 // Answers: a foreign chat cannot answer; the customer's "Yes" button confirms and tells the restaurant.
 tg.length=0;assert.equal(await call.handleCallReply({callback_query:{id:'q',data:'cc:y:b1',message:{chat:{id:999},message_id:1}}}),'call_denied');assert.equal(status('b1').call_status,'calling');
 assert.equal(await call.handleCallReply({callback_query:{id:'q',data:'cc:y:b1',message:{chat:{id:500},message_id:1}}}),'call_confirmed');
 assert.deepEqual({...status('b1')},{status:'confirmed',call_status:'confirmed'});assert.ok(tg.some(x=>x.body?.chat_id==='777'&&x.body.text.includes('tasdiqladi')));
 // Text and voice answers; regular messages pass through to the normal bot.
 add('b6','prem','c3',60);proxy='';await call.runCallAi();assert.equal(status('b6').call_status,'calling','no proxy secret: text call without voice');
 assert.equal(await call.handleCallReply({message:{chat:{id:700},text:'/start x'}}),null,'commands go to the bot');
 assert.equal(await call.handleCallReply({message:{chat:{id:700},text:'maybe later'}}),'call_unclear');
 tg.length=0;assert.equal(await call.handleCallReply({message:{chat:{id:700},text:'No, I can’t come'}}),'call_declined');assert.equal(status('b6').call_status,'declined');assert.equal(status('b6').status,'pending','restaurant decides');assert.ok(tg.some(x=>x.body?.chat_id==='777'&&x.body.text.includes('kela olmasligini')));
 proxy='proxy-secret';add('b7','prem','c1',70);await call.runCallAi();edge.length=0;
 assert.equal(await call.handleCallReply({message:{chat:{id:500},voice:{file_id:'F',duration:3}}}),'call_confirmed');assert.equal(edge[0].b.mode,'call_transcribe');assert.equal(edge[0].b.audio.mimeType,'audio/ogg');assert.equal(status('b7').status,'confirmed');
 assert.equal(await call.handleCallReply({message:{chat:{id:500},text:'salom'}}),null,'no open call: normal bot');
 // No answer within 20 minutes -> reported once.
 add('b8','prem','c1',110);await call.runCallAi();tg.length=0;r=await call.runCallAi(Date.now()+21*60000);assert.equal(status('b8').call_status,'no_answer');assert.ok(tg.some(x=>x.body?.chat_id==='777'&&x.body.text.includes('javob bermadi')));
 tg.length=0;await call.runCallAi(Date.now()+30*60000);assert.ok(!tg.some(x=>x.body?.text?.includes('javob bermadi')),'reported once');
 // Manual call: Premium only.
 add('b9','biz','c3',300);assert.equal(await call.callNow('b9'),'plan');add('b10','prem','c3',300);assert.equal(await call.callNow('b10'),'calling');
 console.log('PASS call-ai: Premium-only T-2h calls (voice note + Yes/No), unreachable/no-answer/declined reported to the restaurant, Yes confirms, text/voice answers, own chat only, no double calls');
})().catch(e=>{console.error(e);process.exitCode=1});
