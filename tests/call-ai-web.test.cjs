const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request}=require('./harness.cjs');
// Free Call AI channels: the live web call (/call-ai/:id + /api/call-ai: token or own session,
// spoken question, spoken/typed/tapped answer) and the real phone call hook (Vapi or a generic
// provider webhook, both authenticated) that confirms or declines the booking.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...v){args=v;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 const env={DB,TELEGRAM_BOT_TOKEN:'bot:t'};
 const tg=[],vapi=[],hooks=[],edge=[];
 const fetch=async(url,init)=>{url=String(url);
  if(url.includes('restaurantfoods-ai')){const b=JSON.parse(init.body);edge.push(b);return b.mode==='call_speech'?Response.json({audio:btoa('OggS'),mimeType:'audio/ogg'}):Response.json({transcript:'ha, boraman'})}
  if(url.startsWith('https://api.vapi.ai/')){vapi.push({auth:init.headers.Authorization,body:JSON.parse(init.body)});return Response.json({id:'call_1'},{status:201})}
  if(url.startsWith('https://provider.example/')){hooks.push({sig:init.headers['X-RF-Signature'],body:JSON.parse(init.body)});return Response.json({ok:true})}
  if(url.endsWith('/sendVoice'))return Response.json({ok:true,result:{}});
  tg.push({method:url.split('/').pop(),body:JSON.parse(init.body)});return Response.json({ok:true,result:{}})};
 const cf={'cloudflare:workers':{env}},http=load('app/http.ts',cf),noLimit={...http,throttle:async()=>{}};
 const telegram=load('app/telegram.ts',{...cf,'./otp-store':load('app/otp-store.ts',cf)},{fetch});
 const call=load('app/call-ai.ts',{...cf,'./auth-service':{authConfig:()=>({url:'https://x.supabase.co',key:'anon',proxy:'p'})},'./plans':load('app/plans.ts',{...cf,'./http':http}),'./telegram':telegram},{fetch,FormData,Blob});
 let user=null;
 const api=load('app/api/call-ai/route.ts',{'../../access':{identity:async()=>user},'../../http':noLimit,'../../call-ai':call},{fetch});
 const hook=load('app/api/call-ai/hook/route.ts',{...cf,'../../../http':http,'../../../call-ai':call},{fetch});
 const page=load('app/call-ai/[id]/route.ts',{});
 const trial=new Date(Date.now()+7*86400000).toISOString(),soon=new Date(Date.now()+100*60000+5*3600000).toISOString();
 db.exec("INSERT INTO accounts(id,email,name,created_at,role,telegram_chat_id,preferred_language) VALUES ('c1','c1@x','Aziz Karimov','now','customer','500','uz'),('c2','c2@x','Olga','now','customer',NULL,'ru')");
 db.prepare("INSERT INTO restaurants(id,name,owner_id,status,tables,plan,trial_ends_at,telegram_chat_id,phone) VALUES ('p','Prem','o','active',5,'premium',?,'777','+998712000000')").run(trial);
 const add=(id,user,table)=>db.prepare("INSERT INTO bookings(id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES (?,?,?,?,?,'',?,2,'+998901234567','pending','now')").run(id,'p',user,soon.slice(0,10),soon.slice(11,16),table);
 add('b1','c1',1);add('b2','c2',2);
 await call.runCallAi();
 const tok=id=>db.prepare('SELECT call_token FROM bookings WHERE id=?').get(id).call_token;
 const status=id=>({...db.prepare('SELECT status,call_status FROM bookings WHERE id=?').get(id)});

 // Page: standalone HTML with a strict CSP and the microphone allowed.
 let r=page.GET();assert.equal(r.status,200);assert.ok((await r.text()).includes('/call-ai.js'));assert.ok(r.headers.get('content-security-policy').includes("script-src 'self'"));assert.ok(r.headers.get('permissions-policy').includes('microphone=(self)'));
 // Access: token or own session only.
 const get=(id,k)=>api.GET(new Request('https://test/api/call-ai?id='+id+(k?'&k='+k:'')));
 assert.equal((await get('b1')).status,404,'no token, no session');assert.equal((await get('b1','x'.repeat(24))).status,404,'wrong token');assert.equal((await get('b1',tok('b2'))).status,404,'other booking token');
 let v=(await (await get('b1',tok('b1'))).json()).call;assert.equal(v.question,'Assalomu alaykum, Aziz! Soat '+v.slot+' da Prem restoranida stolingiz band qilingan. Tashrifingizni tasdiqlaysizmi?');assert.equal(v.restaurantPhone,'+998712000000');assert.ok(!('call_token' in v),'token not echoed');
 user={userId:'c2',role:'customer'};assert.equal((await get('b2')).status,200,'own session');assert.equal((await get('b1')).status,404,'not someone else’s');
 let open=await (await api.GET(new Request('https://test/api/call-ai?open=1'))).json();assert.deepEqual(open.calls.map(c=>c.id),['b2'],'site rings for own open call');assert.equal((await (await get('b2')).json()).call.lang,'ru');
 user=null;
 // Speech: the server voice (OGG) for the question.
 const post=p=>api.POST(request('/api/call-ai',p));
 r=await post({action:'speech',id:'b1',k:tok('b1')});let sp=await r.json();assert.equal(sp.audio,btoa('OggS'));assert.equal(edge.at(-1).mode,'call_speech');
 // Unclear answer -> asked again; spoken "ha, boraman" -> confirmed, Telegram thanks + restaurant told.
 assert.equal((await (await post({action:'answer',id:'b1',k:tok('b1'),text:'bilmadim'})).json()).understood,false);
 tg.length=0;r=await post({action:'answer',id:'b1',k:tok('b1'),text:'Ha, boraman'});let an=await r.json();assert.equal(an.verdict,'yes');assert.ok(an.message.includes('Rahmat, broningiz tasdiqlandi! Sizni kutamiz!'));
 assert.deepEqual(status('b1'),{status:'confirmed',call_status:'confirmed'});assert.ok(tg.some(x=>x.body.chat_id==='500'));assert.ok(tg.some(x=>x.body.chat_id==='777'&&x.body.text.includes('tasdiqladi')));
 // Recorded audio is transcribed on the server.
 r=await post({action:'transcribe',id:'b2',k:tok('b2'),audio:{mimeType:'audio/webm',data:btoa('webm')}});assert.deepEqual({...await r.json()},{transcript:'ha, boraman',verdict:'yes'});
 // "No" tap -> penalty reminder with the restaurant phone; booking stays for the restaurant to decide.
 r=await post({action:'answer',id:'b2',k:tok('b2'),verdict:'no'});an=await r.json();assert.ok(an.message.includes('+998712000000'));assert.deepEqual(status('b2'),{status:'pending',call_status:'declined'});

 // Real phone call via Vapi when configured.
 env.VAPI_API_KEY='vk';env.VAPI_ASSISTANT_ID='asst';env.VAPI_PHONE_NUMBER_ID='pn';env.VAPI_WEBHOOK_SECRET='vs';
 add('b3','c2',3);await call.callNow('b3');const vc=vapi[0];assert.equal(vc.auth,'Bearer vk');assert.equal(vc.body.customer.number,'+998901234567');assert.equal(vc.body.metadata.bookingId,'b3');assert.ok(vc.body.assistantOverrides.firstMessage.includes('Напоминаем, что сегодня в'));
 assert.equal(db.prepare("SELECT call_channel FROM bookings WHERE id='b3'").get().call_channel,'web,phone');
 const vapiHook=(secret,msg)=>hook.POST(new Request('https://test/api/call-ai/hook',{method:'POST',headers:{'Content-Type':'application/json','x-vapi-secret':secret},body:JSON.stringify({message:msg})}));
 const report={type:'end-of-call-report',call:{metadata:{bookingId:'b3'}},artifact:{messages:[{role:'bot',message:'Kelishingizni tasdiqlaysizmi?'},{role:'user',message:'Ha, albatta boraman'}]}};
 assert.equal((await vapiHook('wrong',report)).status,403);assert.equal(status('b3').call_status,'calling');
 assert.equal((await vapiHook('vs',{type:'status-update'})).status,200);assert.equal(status('b3').call_status,'calling','only the end of the call counts');
 assert.equal((await vapiHook('vs',report)).status,200);assert.deepEqual(status('b3'),{status:'confirmed',call_status:'confirmed'});
 // Generic provider webhook (HMAC-signed both ways).
 for(const k of ['VAPI_API_KEY','VAPI_ASSISTANT_ID','VAPI_PHONE_NUMBER_ID'])delete env[k];env.CALL_AI_WEBHOOK_URL='https://provider.example/call';env.CALL_AI_WEBHOOK_SECRET='ws';
 add('b4','c1',4);await call.callNow('b4');assert.equal(hooks[0].body.bookingId,'b4');assert.equal(hooks[0].sig,await call.callHmac('ws',JSON.stringify(hooks[0].body)));assert.ok(hooks[0].body.webCallUrl.includes('/call-ai/b4?k='));
 const signed=async(body,key='ws')=>hook.POST(new Request('https://test/api/call-ai/hook',{method:'POST',headers:{'Content-Type':'application/json','X-RF-Signature':await call.callHmac(key,body)},body}));
 assert.equal((await signed(JSON.stringify({bookingId:'b4',answer:'no'}),'bad')).status,403);
 assert.equal((await signed(JSON.stringify({bookingId:'b4',answer:'no'}))).status,200);assert.deepEqual(status('b4'),{status:'pending',call_status:'declined'});
 console.log('PASS call-ai web: standalone call page, token/session access, server voice, spoken/tapped answers, transcription, penalty reminder with phone, Vapi call + signed hook, generic provider webhook');
})().catch(e=>{console.error(e);process.exitCode=1});
