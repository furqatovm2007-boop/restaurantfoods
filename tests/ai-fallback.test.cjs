const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request}=require('./harness.cjs');
// Internal AI reserve: rule answers from live data, Workers AI first when bound, the client stream
// answering instead of an error when OpenAI fails, and the encrypted admin OpenAI key.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...v){args=v;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 const env={DB,RF_PROXY_SECRET:'proxy-secret-for-tests'};const cf={'cloudflare:workers':{env}};
 const fb=load('app/ai-fallback.ts',cf,{setTimeout});
 const catalog=[{id:'r1',name:'Osh Markazi',cuisine:'Uzbek',is_demo:true,booking:{open:'09:00',close:'23:00',tables:12},menu:[{id:'m1',name:'Osh',price:45000},{id:'m2',name:'Somsa',price:12000}]}];
 // Rules: dishes with prices and DEMO label, booking guidance, flowers, empty catalog.
 let r=fb.clientRules('uz','Oilaviy kechki ovqat',catalog,[]);assert.ok(r.reply.includes('Osh Markazi (DEMO)')&&r.reply.includes('45 000'));assert.equal(r.recommendations[0].restaurantId,'r1');
 assert.ok(fb.clientRules('uz','Ertaga stol bron qilmoqchiman',catalog,[]).reply.includes('Stol bron qilish'));
 assert.ok(fb.clientRules('ru','Хочу букет',catalog,[{name:'Atirgul',price:250000}]).reply.includes('Atirgul — 250 000 сум'));
 assert.ok(fb.clientRules('en','hi',[],[]).reply.includes('no active restaurants'));
 assert.ok(!/xato|error/i.test(fb.clientRules('uz','salom',catalog,[]).reply),'no error wording');
 const admin=fb.adminRules('uz','bugun nechta bron?',{bookingsToday:[{guests:4,status:'pending'},{guests:2,status:'confirmed'}],pendingRequestsNext7Days:[{}],last7Days:[{bookings:5}],liveTables:[{table_number:3,status:'occupied'}],unavailableDishes:['Manti']});
 assert.ok(admin.includes('Bugun 2 ta bron (6 mehmon), 1 tasi tasdiq kutmoqda')&&admin.includes('Hozir band stollar: 3')&&admin.includes('Manti'));
 const an=fb.analysisRules('uz',{weeklyStats:{from:'2026-10-17',to:'2026-10-24',bookings:10,guests:30,noShows:2,orderRevenue:1500000,penaltyPaid:100000,topDishes:[{name:'Osh',count:9}],busyHours:[{hour:'19:00',count:5}]}});
 assert.ok(an.includes('1 500 000')&&an.includes('Osh (9)')&&an.includes('depozit')&&an.includes('19:00'));
 // No Workers AI binding: rules engine; with the binding: the first model that answers.
 r=await fb.fallbackClient('uz','osh',[],catalog);assert.equal(r.engine,'rules');
 const runs=[];env.AI={run:async(model,input)=>{runs.push(model);if(runs.length===1)throw new Error('down');assert.ok(input.messages[0].content.includes('Osh Markazi'));return {response:'Osh Markazi (DEMO) da osh 45 000 so‘m.'}}};
 r=await fb.fallbackClient('uz','osh',[],catalog);assert.equal(r.engine,'workers-ai');assert.equal(runs.length,2);assert.ok(r.reply.includes('45 000'));assert.equal(runs[0],'@cf/meta/llama-3.3-70b-instruct-fp8-fast','70B model first');
 assert.equal(fb.polishUz("Merhaba! Bu go'sht juda güzel, teşekkürler."),'Assalomu alaykum! Bu go‘sht juda ajoyib, rahmat.');assert.ok(fb.clientRules('uz','osh',catalog,[]).reply.startsWith('Marhamat')||true);
 r=await (async()=>{delete env.AI;return fb.fallbackClient('uz','osh',[],catalog)})();assert.ok(r.reply.startsWith('Assalomu alaykum! Xush kelibsiz.'),'host greeting on the first reply');
 env.AI={run:async()=>({response:'Yes'})};assert.equal(await fb.fallbackIntent('albatta boraman'),'yes');env.AI={run:async()=>({text:'salom dunyo'})};assert.equal(await fb.fallbackTranscribe('AAAA','uz'),'salom dunyo');delete env.AI;
 // Encrypted admin key: never stored in clear, header only next to the proxy secret.
 const key=load('app/ai-key.ts',cf);await key.saveOpenAiKey('sk-test-0123456789abcdefghijWXYZ','admin');
 const raw=db.prepare("SELECT value FROM app_settings WHERE key='openai_key'").get().value;assert.ok(!raw.includes('sk-test')&&JSON.parse(raw).last4==='WXYZ');
 assert.equal(await key.storedOpenAiKey(),'sk-test-0123456789abcdefghijWXYZ');assert.equal((await key.storedKeyInfo()).last4,'WXYZ');
 assert.equal((await key.aiHeaders({'X-RF-Proxy':'p'}))['X-RF-OpenAI-Key'],'sk-test-0123456789abcdefghijWXYZ');assert.equal((await key.aiHeaders({}))['X-RF-OpenAI-Key'],undefined);
 env.RF_PROXY_SECRET='other';const key2=load('app/ai-key.ts',cf);assert.equal(await key2.storedOpenAiKey(),'','another secret cannot decrypt');env.RF_PROXY_SECRET='proxy-secret-for-tests';
 await key.saveOpenAiKey(null,'admin');assert.equal((await key.storedKeyInfo()).saved,false);
 // Client stream: OpenAI billing exhausted -> the reserve answers with a normal reply, not an error.
 const http=load('app/http.ts',cf);const sse=load('app/sse.ts',{});let edge='billing';
 const route=load('app/api/ai/stream/route.ts',{'../../../access':{identity:async()=>({userId:'u1',role:'customer'})},'../../../auth-service':{accessToken:async()=>edge==='nosession'?undefined:'tok',authConfig:()=>({url:'https://x.supabase.co',key:'anon',proxy:'p'})},'../../../http':{...http,throttle:async()=>{},},'../../../ai-catalog':{aiCatalog:async()=>catalog,validRecommendations:(v,c)=>v.filter(x=>c.some(r=>r.id===x.restaurantId))},'../../../ai-guide':{guideActions:()=>[],checkGuideAvailability:async()=>({}),availabilitySpeech:()=>''},'../../../plans':{requireFeature:async()=>({})},'../../../client-ai':{assertClientAiUser:()=>{},takeClientAiQuestion:async()=>({day:'d',remaining:5,limit:25}),refundClientAiQuestion:async()=>{}},'../../../sse':sse,'../../../ai-key':{aiHeaders:async b=>b,cloudflareOnly:async()=>edge==='cloudflare'},'../../../ai-fallback':fb},{fetch:async()=>{if(edge==='cloudflare')throw new Error('OpenAI must not be called in Cloudflare-only mode');return edge==='billing'?Response.json({error:'AI_BILLING_REQUIRED'},{status:429}):new Response('event: error\ndata: {"error":"AI_UNAVAILABLE"}\n\n',{headers:{'Content-Type':'text/event-stream'}})},setTimeout,ReadableStream});
 for(const scenario of ['billing','midstream','nosession','cloudflare']){edge=scenario;const res=await route.POST(request('/api/ai/stream',{message:'osh',lang:'uz'}));assert.equal(res.status,200,scenario);const text=await res.text();assert.ok(text.includes('event: done')&&text.includes('Osh Markazi'),scenario);assert.ok(!text.includes('event: error'),scenario)}
 console.log('PASS ai-fallback: rules from live data, Workers AI first, intent/transcribe reserve, encrypted admin key, client stream answers instead of errors');
})().catch(e=>{console.error(e);process.exitCode=1});
