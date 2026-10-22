const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load}=require('./harness.cjs');
// Customer AI rules on real SQLite: daily quota with booking/order bonus, roles, refund, Premium/trial-only catalog.
(async()=>{
const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
const DB={prepare(sql){let a=[];return{bind(...v){a=v;return this},first:async()=>db.prepare(sql).get(...a)||null,all:async()=>({results:db.prepare(sql).all(...a)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...a).changes)}})}}};
const env={DB},http=load('app/http.ts',{'cloudflare:workers':{env}}),plans=load('app/plans.ts',{'cloudflare:workers':{env},'./http':http});
const ai=load('app/client-ai.ts',{'cloudflare:workers':{env},'./http':http}),catalog=load('app/ai-catalog.ts',{'cloudflare:workers':{env},'./http':http,'./plans':plans});
const iso=d=>new Date(d).toISOString(),DAY=86400000,now=Date.parse('2026-10-22T10:00:00+05:00');
const customer={userId:'c1',role:'customer'};
const status=async(p)=>{try{await p;return 200}catch(e){return e.status}};
// Roles: the customer assistant is not for couriers or restaurant staff.
assert.throws(()=>ai.assertClientAiUser({userId:'k',role:'courier'}),e=>e.status===403&&e.message==='AI_NOT_FOR_COURIERS');
assert.throws(()=>ai.assertClientAiUser({userId:'o',role:'restaurant_owner'}),e=>e.message==='AI_USE_ADMIN_ASSISTANT');
ai.assertClientAiUser(customer);
// One free question per Tashkent day.
assert.equal(ai.tashkentDay(Date.parse('2026-10-22T20:30:00Z')),'2026-10-23','UTC+5 day boundary');
let q=await ai.takeClientAiQuestion(customer,now);assert.deepEqual({...q},{day:'2026-10-22',limit:1,used:1,remaining:0});
assert.equal(await status(ai.takeClientAiQuestion(customer,now)),429);
// Refund after a failed model call gives the question back.
await ai.refundClientAiQuestion('c1','2026-10-22');assert.equal((await ai.takeClientAiQuestion(customer,now)).used,1);
// A real booking or order today adds one; cancelled and demo ones do not; yesterday's do not.
db.exec("INSERT INTO restaurants(id,name,status,owner_id) VALUES ('r','Real','active','o')");
let table=0;const book=(id,created,st='pending')=>db.prepare("INSERT INTO bookings(id,restaurant_id,user_id,date,slot,table_number,guests,phone,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)").run(id,'r','c1','2026-10-25','12:00',++table,2,'+998901234567',st,created);
book('b-old',iso(now-DAY));book('b-cancel',iso(now-3600000),'cancelled');
assert.equal(await status(ai.takeClientAiQuestion(customer,now)),429,'old/cancelled bookings give no bonus');
book('b-today',iso(now-3600000));
assert.equal((await ai.takeClientAiQuestion(customer,now)).remaining,0,'booking today = +1 question');
db.prepare("INSERT INTO orders(id,restaurant_id,user_id,items,total,status,created_at,phone) VALUES (?,?,?,?,?,?,?,?)").run('o1','r','c1','[]',1000,'pending',iso(now-60000),'+998901234567');
assert.equal((await ai.clientAiQuota('c1',now)).limit,3,'order today = +1 more');
for(let i=0;i<8;i++)book('b'+i,iso(now-1000*i));assert.equal((await ai.clientAiQuota('c1',now)).limit,1+ai.MAX_BONUS,'bonus is capped');
// Next day starts fresh; administrators are unlimited.
assert.equal((await ai.takeClientAiQuestion(customer,now+DAY)).used,1);
assert.equal(await ai.takeClientAiQuestion({userId:'a',role:'admin'},now),null);
// Catalog: only restaurants whose plan includes clientAi (Premium / trial).
db.exec("UPDATE restaurants SET plan='start',trial_ends_at=NULL,paid_until=NULL WHERE id='r';UPDATE restaurants SET status='paused' WHERE is_demo=1");
const add=(id,plan,trial,paid)=>db.prepare("INSERT INTO restaurants(id,name,status,owner_id,plan,trial_ends_at,paid_until) VALUES (?,?,?,?,?,?,?)").run(id,id,'active','o',plan,trial,paid);
add('start-paid','start',null,iso(Date.now()+30*DAY));add('business-paid','business',null,iso(Date.now()+30*DAY));
assert.equal(await status(catalog.aiCatalog(undefined,'osh')),403,'no Premium/trial restaurant: AI_NOT_AVAILABLE');
add('premium-paid','premium',null,iso(Date.now()+30*DAY));add('in-trial','start',iso(Date.now()+5*DAY),null);add('trial-over','premium',iso(Date.now()-DAY),null);
const ids=(await catalog.aiCatalog(undefined,'osh')).map(r=>r.id).sort();
assert.deepEqual(ids,['in-trial','premium-paid']);
console.log('PASS client AI: couriers/owners refused, 1 free question per Tashkent day, +1 per real booking/order today (capped), refund, admin unlimited, Premium/trial-only catalog.');
})().catch(e=>{console.error(e);process.exitCode=1});
