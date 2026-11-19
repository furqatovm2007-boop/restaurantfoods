const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request}=require('./harness.cjs');
// 3D dish models: .glb upload to the site's own storage (owner of that restaurant or admin, glTF 2.0 binary only,
// ≤ 15 MB), served same-origin; a dish keeps the link (dish3d:<menuId>) only for its own restaurant's model;
// the catalogue returns menu.model_3d_url; '' clears it.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...v){args=v;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 const objects=new Map();const BUCKET={put:async(k,v,o)=>objects.set(k,{bytes:v,...o}),head:async k=>objects.has(k)?{customMetadata:objects.get(k).customMetadata}:null,get:async k=>objects.has(k)?{body:objects.get(k).bytes,httpEtag:'"e"'}:null};
 const env={DB,BUCKET},cw={'cloudflare:workers':{env}};let user=null;
 const http=load('app/http.ts',cw),model=load('app/dish-model.ts',{...cw,'./http':http});
 const route=load('app/api/media/model/route.ts',{...cw,'../../../access':{identity:async()=>user},'../../../http':{...http,throttle:async()=>{}},'../../../dish-model':model});
 db.exec("INSERT INTO accounts(id,email,name,created_at,role) VALUES ('o1','o@x','O','now','restaurant_owner'),('o2','p@x','P','now','restaurant_owner')");
 db.exec("INSERT INTO restaurants(id,name,owner_id,status,tables,floors) VALUES ('r1','A','o1','active',3,1),('r2','B','o2','active',3,1)");
 db.exec("INSERT INTO menu(id,restaurant_id,name,price,available) VALUES ('m1','r1','Osh',45000,1),('m2','r1','Somsa',12000,1)");
 const glb=()=>{const b=Buffer.alloc(64);b.write('glTF',0,'ascii');b.writeUInt32LE(2,4);b.writeUInt32LE(64,8);return b};
 const up=(rid,body)=>route.POST(new Request('https://test/api/media/model?restaurantId='+rid,{method:'POST',headers:{Origin:'https://test','Content-Type':'model/gltf-binary'},body}));
 assert.equal((await up('r1',glb())).status,403,'signed out');
 user={userId:'o2',role:'restaurant_owner'};assert.equal((await up('r1',glb())).status,403,'another owner');
 user={userId:'o1',role:'restaurant_owner'};assert.equal((await up('r1',Buffer.from('not a model at all, just text....'))).status,400,'not glTF');
 const big=Buffer.alloc(16*1024*1024);big.write('glTF',0,'ascii');big.writeUInt32LE(2,4);assert.equal((await up('r1',big)).status,413);
 const r=await up('r1',glb());assert.equal(r.status,201);const {url}=await r.json();assert.match(url,/^\/api\/media\/model\?key=models%2F[a-f0-9-]{36}\.glb$/);
 const got=await route.GET(new Request('https://test'+url));assert.equal(got.status,200);assert.equal(got.headers.get('Content-Type'),'model/gltf-binary');
 assert.equal((await route.GET(new Request('https://test/api/media/model?key=photos/x.glb'))).status,404);
 // The dish keeps only its own restaurant's model.
 await model.saveDishModel('m1','r1',url);assert.equal(db.prepare("SELECT value FROM app_settings WHERE key='dish3d:m1'").get().value,url);
 await assert.rejects(model.saveDishModel('m9','r2',url),e=>e.status===403,'r2 cannot use r1’s model');
 await assert.rejects(model.saveDishModel('m2','r1','https://example.com/x.glb'),e=>e.status===400,'outside links refused (CSP: same origin only)');
 await model.saveDishModel('m2','r1',undefined);assert.equal(db.prepare("SELECT COUNT(*) n FROM app_settings WHERE key='dish3d:m2'").get().n,0,'untouched when not sent');
 // The catalogue's menu query returns model_3d_url (null without a model).
 const src=fs.readFileSync('app/api/catalog/route.ts','utf8');const sql=src.match(/SELECT m\.\*,\(SELECT value FROM app_settings WHERE key='dish3d:'\|\|m\.id\) AS model_3d_url FROM menu m/);assert.ok(sql,'catalogue joins the model link');
 const rows=db.prepare("SELECT m.id,(SELECT value FROM app_settings WHERE key='dish3d:'||m.id) AS model_3d_url FROM menu m ORDER BY m.id").all();assert.equal(rows[0].model_3d_url,url);assert.equal(rows[1].model_3d_url,null);
 await model.saveDishModel('m1','r1','');assert.equal(db.prepare("SELECT COUNT(*) n FROM app_settings WHERE key='dish3d:m1'").get().n,0,'cleared');
 assert.ok(fs.existsSync('public/vendor/model-viewer-4.4.0.min.js'),'viewer vendored (same origin)');assert.match(fs.readFileSync('public/mvp.js','utf8'),/import\('\/vendor\/model-viewer-4\.4\.0\.min\.js'\)/,'loaded only on demand');
 console.log('PASS 3D dish models: .glb upload (owner/admin, glTF 2 only, ≤15 MB), same-origin serving, own-restaurant links only, catalogue model_3d_url, clear, viewer vendored and lazy');
})().catch(e=>{console.error(e);process.exitCode=1});
