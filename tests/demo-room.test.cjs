const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{DatabaseSync}=require('node:sqlite'),{load,request}=require('./harness.cjs');
(async()=>{
const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
assert.equal(db.prepare('select count(*) n from restaurants where is_demo=1').get().n,10);
assert.equal(db.prepare("select count(*) n from menu where is_demo=1 and image_url<>''").get().n,72);
for(const r of db.prepare('select * from restaurants where is_demo=1').all()){assert.ok(fs.existsSync('public'+r.image_url));assert.equal(JSON.parse(r.gallery).length,3)}
assert.throws(()=>db.prepare("insert into bookings(id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) values('reject-demo','rf-demo-restaurant-01','test','2090-01-01','10:00','12:00',1,2,'+998901234567','pending','now')").run(),/demo_requires_isolated/);
assert.throws(()=>db.prepare("insert into orders(id,restaurant_id,user_id,items,total,phone,status,created_at) values('reject-demo','rf-demo-restaurant-01','test','[]',0,'+998901234567','pending','now')").run(),/demo_requires_isolated/);
const context={RF_I18N:{lang:'en'},esc:s=>s};vm.createContext(context);vm.runInContext(fs.readFileSync('public/demo-room.js','utf8'),context);
for(const shape of ['round','square','rectangle'])for(const seats of [2,4,6,8]){const html=vm.runInContext(`demoGlyph({id:'t',number:1,shape:'${shape}',seats:${seats},x:20,y:30,active:true,reservations:[]},true)`,context);assert.equal((html.match(/class="demo-chair"/g)||[]).length,seats);assert.ok(html.includes('aria-label="Table 1'))}
const http=load('app/http.ts',{'cloudflare:workers':{env:{}}});let user=null,forwarded=0,last;const route=load('app/api/demo-room/route.ts',{'../../access':{identity:async()=>user},'../../auth-service':{authConfig:()=>({url:'https://example.supabase.co',key:'public-key'}),accessToken:async()=> 'session-token'},'../../http':{...http,throttle:async()=>{}}},{fetch:async(url,opts)=>{forwarded++;last=opts;return Response.json({ok:true,server_now:new Date().toISOString(),tables:[]})}});
let res=await route.POST(request('/api/demo-room',{action:'hold'}));assert.equal(res.status,401);assert.equal(forwarded,0);
user={userId:'customer',role:'customer'};res=await route.POST(request('/api/demo-room',{action:'sample'}));assert.equal(res.status,403);assert.equal(forwarded,0);
res=await route.POST(request('/api/demo-room',{action:'hold',restaurantId:'rf-demo-restaurant-01'}));assert.equal(res.status,200);assert.equal(last.headers.Authorization,'Bearer session-token');
res=await route.POST(request('/api/demo-room',{action:'hold'},'POST','https://evil.test'));assert.equal(res.status,403);
console.log('PASS demo isolation DB guards, 10 illustrated restaurants / 72 menu images, SVG chair counts, session forwarding, CSRF, anonymous and admin access guards');
})().catch(e=>{console.error(e);process.exitCode=1});
