const assert=require('node:assert/strict'),{load,request}=require('./harness.cjs');
// Natural voice: /api/ai/tts through the Edge Function's proxy-only "tts" service (no Supabase token needed,
// so Telegram sessions get it too); nova by default, onyx on request; signed-in users only; no robotic fallback.
(async()=>{
 const env={};const cf={'cloudflare:workers':{env}},http=load('app/http.ts',cf),noLimit={...http,throttle:async()=>{}};
 const seen=[];let ok=true;const fetch=async(url,init)=>{seen.push({url,headers:init.headers,body:JSON.parse(init.body)});return ok?Response.json({audio:'QUJD',mimeType:'audio/mpeg'}):Response.json({error:'AI_CONFIGURATION'},{status:503})};
 const voice=load('app/ai-voice.ts',{'./auth-service':{authConfig:()=>({url:'https://x.supabase.co',key:'anon',proxy:'p'}),accessToken:async()=>null},'./http':noLimit,'./ai-key':{aiHeaders:async h=>h,cloudflareOnly:async()=>false},'./ai-fallback':{fallbackTranscribe:async()=>null}},{fetch});
 let user=null;const route=load('app/api/ai/tts/route.ts',{'../../../access':{identity:async()=>user},'../../../http':noLimit,'../../../ai-voice':voice});
 assert.equal((await route.POST(request('/api/ai/tts',{text:'Salom',lang:'uz'}))).status,401,'sign-in needed');
 user={userId:'tg:1',role:'customer',source:'telegram'};
 assert.equal((await route.POST(request('/api/ai/tts',{text:'Salom',lang:'uz'},'POST','https://evil'))).status,403,'same origin only');
 let r=await route.POST(request('/api/ai/tts',{text:'Assalomu alaykum! Xush kelibsiz.',lang:'uz'}));assert.equal(r.status,200);const d=await r.json();assert.equal(d.mimeType,'audio/mpeg');assert.equal(d.audio,'QUJD');
 const h=seen[0].headers;assert.equal(h['X-RF-Service'],'tts');assert.equal(h['X-RF-Proxy'],'p');assert.equal(h.Authorization,'Bearer anon','no user token involved');assert.equal(seen[0].body.voice,'nova');
 await route.POST(request('/api/ai/tts',{text:'Salom',lang:'uz',voice:'onyx'}));assert.equal(seen[1].body.voice,'onyx');
 assert.equal((await route.POST(request('/api/ai/tts',{text:'Hi',lang:'de'}))).status,400);
 ok=false;assert.equal((await route.POST(request('/api/ai/tts',{text:'Salom',lang:'uz'}))).status,503,'voice down -> the page shows text');
 // The avatar's voice proxy also speaks without a Supabase token (Telegram session).
 ok=true;const vr=await voice.voiceProxy(request('/api/ai-voice',{mode:'speech',lang:'uz',text:'Marhamat'}),'b');assert.equal(vr.status,200);assert.equal((await vr.json()).mimeType,'audio/mpeg');
 console.log('PASS tts: proxy-only natural voice for every signed-in user (Telegram too), nova/onyx, same-origin, text fallback when down');
})().catch(e=>{console.error(e);process.exitCode=1});
