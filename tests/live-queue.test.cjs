const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request}=require('./harness.cjs');
// Live queue on the hall till: staff add a waiting party, seat or remove it; strangers and customers cannot
// read or change it; bad input is refused; the list survives in app_settings per restaurant.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...a){args=a;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 const cf={'cloudflare:workers':{env:{DB}}},http=load('app/http.ts',cf),noLimit={...http,throttle:async()=>{}};
 const plans=load('app/plans.ts',{...cf,'./http':http}),staff=load('app/staff.ts',{...cf,'./http':http,'./plans':plans});
 let user=null;const route=load('app/api/manage/queue/route.ts',{...cf,'../../../access':{identity:async()=>user},'../../../http':noLimit,'../../../staff':staff,'../../../live-queue':load('app/live-queue.ts',{...cf,'./http':http})});
 db.prepare("INSERT INTO restaurants(id,name,status,owner_id,plan,paid_until) VALUES ('r','Real','active','owner','business',?),('other','Other','active','owner2','business',?)").run(new Date(Date.now()+30*86400000).toISOString(),new Date(Date.now()+30*86400000).toISOString());
 const post=data=>route.POST(request('/api/manage/queue',{restaurantId:'r',...data})),list=()=>route.GET(new Request('https://test/api/manage/queue?restaurantId=r'));
 user={userId:'c1',role:'customer'};
 assert.equal((await list()).status,403,'a customer cannot see the queue');
 assert.equal((await post({action:'add',name:'Ali',guests:2})).status,403,'a customer cannot add');
 user={userId:'owner2',role:'restaurant_owner'};
 assert.equal((await post({action:'add',name:'Ali',guests:2})).status,403,'another restaurant owner cannot add');
 user={userId:'owner',role:'restaurant_owner'};
 let r=await post({action:'add',name:'  Ali   aka ',guests:4,phone:'+998 90 123-45-67'});assert.equal(r.status,201);
 let q=(await r.json()).queue;assert.equal(q.length,1);assert.equal(q[0].name,'Ali aka');assert.equal(q[0].phone,'+998901234567');
 assert.equal((await post({action:'add',name:'Vali',guests:2})).status,201);
 for(const bad of [{name:'',guests:2},{name:'X',guests:0},{name:'X',guests:31},{name:'X',guests:2,phone:'123'},{name:'x'.repeat(41),guests:2}])assert.equal((await post({action:'add',...bad})).status,400);
 q=(await (await list()).json()).queue;assert.deepEqual(q.map(e=>e.name),['Ali aka','Vali'],'oldest first');
 assert.equal((await post({action:'seat',id:q[0].id})).status,200);
 assert.equal((await post({action:'seat',id:q[0].id})).status,404,'already seated');
 assert.equal((await post({action:'remove',id:q[1].id})).status,200);
 assert.equal((await (await list()).json()).queue.length,0);
 assert.equal((await post({action:'nope'})).status,400);
 assert.equal(db.prepare("SELECT COUNT(*) n FROM app_settings WHERE key='livequeue:r'").get().n,1);
 console.log('PASS live queue: staff add/seat/remove, oldest first, input checks, customers and other owners refused.');
})().catch(e=>{console.error(e);process.exitCode=1});
