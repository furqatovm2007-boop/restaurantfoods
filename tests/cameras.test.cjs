const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request}=require('./harness.cjs');
// Smart Vision cameras saved per restaurant (D1): owners only, Premium only, HTTPS streams, valid zones, at most 8.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...v){args=v;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 const env={DB},cw={'cloudflare:workers':{env}};let user={userId:'owner',role:'restaurant_owner'};
 const http=load('app/http.ts',cw),plans=load('app/plans.ts',{...cw,'./http':http}),feeds=load('app/camera-feeds.ts',{'./http':http});
 const route=load('app/api/manage/cameras/route.ts',{...cw,'../../../access':{identity:async()=>user},'../../../http':{...http,throttle:async()=>{}},'../../../plans':plans,'../../../camera-feeds':feeds});
 db.prepare("INSERT INTO restaurants(id,name,status,owner_id,plan,paid_until) VALUES ('r','Real','active','owner','premium',?)").run(new Date(Date.now()+30*86400000).toISOString());
 const save=camera=>route.POST(request('/api/manage/cameras',{action:'save',restaurantId:'r',camera}));
 const list=async()=>(await (await route.GET(new Request('https://test/api/manage/cameras?restaurantId=r'))).json()).cameras;
 const zones=[{table:1,x:.05,y:.4,w:.27,h:.45},{table:2,x:.4,y:.4,w:.27,h:.45}];

 let r=await save({name:'1-Kamera: Asosiy zal',kind:'device',deviceId:'abc',deviceLabel:'USB Camera',zones});assert.equal(r.status,201);const first=(await r.json()).id;
 r=await save({name:'2-Kamera: VIP',kind:'stream',streamUrl:'https://cam.example.uz/vip.mjpg',zones:[{table:3,x:0,y:0,w:.5,h:.5}],sort:1});assert.equal(r.status,201);
 let cams=await list();assert.equal(cams.length,2);assert.deepEqual(cams.map(c=>c.name),['1-Kamera: Asosiy zal','2-Kamera: VIP']);assert.equal(cams[0].deviceLabel,'USB Camera');assert.equal(cams[0].zones.length,2);
 // Zones edited on the page are saved back.
 r=await save({id:first,name:'1-Kamera: Asosiy zal',kind:'device',deviceId:'abc',deviceLabel:'USB Camera',zones:[{table:1,x:.1,y:.1,w:.3,h:.3}]});assert.equal(r.status,200);
 assert.deepEqual({...(await list())[0].zones[0]},{table:1,x:.1,y:.1,w:.3,h:.3});
 // Validation.
 assert.equal((await save({name:'x',kind:'stream',streamUrl:'http://cam.local/a.mjpg'})).status,400,'http (mixed content) refused');
 assert.equal((await save({name:'x',kind:'stream',streamUrl:'https://user:pass@cam.example.uz/a'})).status,400,'no credentials in the URL');
 assert.equal((await save({name:'x',kind:'stream',streamUrl:'rtsp://cam/a'})).status,400,'RTSP needs a gateway');
 assert.equal((await save({name:'x',kind:'device',zones:[{table:1,x:.9,y:0,w:.5,h:.5}]})).status,400,'zone outside the picture');
 assert.equal((await save({name:'x',kind:'laser'})).status,400);
 assert.equal((await save({name:'',kind:'device'})).status,400,'name required');
 // At most 8 cameras.
 for(let i=0;i<6;i++)assert.equal((await save({name:'c'+i,kind:'device'})).status,201);
 assert.equal((await save({name:'nine',kind:'device'})).status,400,'ninth camera refused');
 // Delete.
 r=await route.POST(request('/api/manage/cameras',{action:'delete',restaurantId:'r',id:first}));assert.equal(r.status,200);assert.equal((await list()).length,7);
 // Other owners and non-Premium plans are refused; cross-site posts too.
 user={userId:'stranger',role:'restaurant_owner'};assert.equal((await route.GET(new Request('https://test/api/manage/cameras?restaurantId=r'))).status,403);
 user={userId:'c',role:'customer'};assert.equal((await save({name:'x',kind:'device'})).status,403);
 user={userId:'owner',role:'restaurant_owner'};assert.equal((await route.POST(request('/api/manage/cameras',{action:'save',restaurantId:'r',camera:{name:'x',kind:'device'}},'POST','https://evil.test'))).status,403);
 db.exec("UPDATE restaurants SET plan='business' WHERE id='r'");assert.equal((await route.GET(new Request('https://test/api/manage/cameras?restaurantId=r'))).status,402,'Business has no AI camera');
 console.log('PASS cameras: save/list/update/delete per restaurant, https-only streams, zone checks, max 8, owner + Premium only');
})().catch(e=>{console.error(e);process.exitCode=1});
