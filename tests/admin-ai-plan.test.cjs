const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request}=require('./harness.cjs');
// Admin AI by plan: Premium unlimited with full data; Business only bookings/requests and 30 questions a day; Start none.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return {sql,bind(...a){args=a;return this},first:async()=>db.prepare(sql).get(...args),all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 const env={DB},cf={'cloudflare:workers':{env}};
 const http=load('app/http.ts',cf),plans=load('app/plans.ts',{...cf,'./http':http});
 const future=new Date(Date.now()+30*86400000).toISOString();
 db.exec(`INSERT INTO accounts(id,email,name,created_at,role) VALUES ('owner','o@x','O','now','restaurant_owner')`);
 db.prepare("INSERT INTO restaurants(id,name,status,owner_id,plan,paid_until) VALUES ('r','Real','active','owner','business',?)").run(future);
 db.prepare("INSERT INTO table_live_status(restaurant_id,table_number,status,source,confidence,updated_at) VALUES ('r',1,'occupied','camera',1,?)").run(new Date().toISOString());
 let sent=null;
 const assistant=load('app/api/manage/assistant/route.ts',{...cf,'../../../access':{identity:async()=>({userId:'owner',role:'restaurant_owner'})},'../../../auth-service':{accessToken:async()=>'tok',authConfig:()=>({url:'https://ai.test',key:'k'})},'../../../http':http,'../../../plans':plans,'../../../sse':load('app/sse.ts',{})},{fetch:async(_url,init)=>{sent=JSON.parse(init.body);return new Response('event: done\ndata: {"reply":"ok"}\n\n',{headers:{'content-type':'text/event-stream'}})},ReadableStream});
 const ask=()=>assistant.POST(request('/api/manage/assistant',{restaurantId:'r',message:'Bugungi bronlar?',lang:'uz'}));

 // Business: bookings and pending requests only — no live tables, orders or menu reach the model.
 let r=await ask();assert.equal(r.status,200);await r.text();
 assert.ok(Array.isArray(sent.context.bookingsToday)&&Array.isArray(sent.context.pendingRequestsNext7Days),'bookings and requests are in');
 assert.equal(sent.context.liveTables,undefined,'no camera data on Business');assert.equal(sent.context.ordersSinceYesterday,undefined);assert.match(sent.context.scope,/Business plan/);
 // 30 questions a day per restaurant, then a clear limit error.
 for(let i=1;i<plans.BUSINESS_ADMIN_AI_DAILY;i++){r=await ask();assert.equal(r.status,200,'question '+(i+1));await r.text()}
 r=await ask();assert.equal(r.status,429);assert.equal((await r.json()).error,'AI_DAILY_LIMIT','31st question today is refused');

 // Premium: unlimited (no daily quota) and full data including the camera.
 db.exec("UPDATE restaurants SET plan='premium' WHERE id='r'");db.exec('DELETE FROM rate_limits');
 r=await ask();assert.equal(r.status,200);await r.text();assert.equal(sent.context.liveTables.length,1);assert.equal(sent.context.scope,undefined);

 // Start: no admin AI at all.
 db.exec("UPDATE restaurants SET plan='start' WHERE id='r'");
 r=await ask();assert.equal(r.status,402);assert.equal((await r.json()).error,'PLAN_UPGRADE_REQUIRED');
 console.log('PASS admin AI by plan: Business bookings-only scope + 30/day, Premium full + unlimited, Start none');
})().catch(e=>{console.error(e);process.exitCode=1});
