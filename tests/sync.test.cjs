const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request,integrationDeps}=require('./harness.cjs');
// Sync audit: whatever a cabinet writes is what the public pages read, at once and from the same
// D1 tables — flowers (florist/admin -> showcase -> orders for florist, courier, admin), restaurants,
// menu (also the 3D book's source), tables and live states, bookings (restaurant + "my bookings"
// + receipt/QR) — and every API answer forbids caching.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...v){args=v;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 DB.batch=async ops=>{db.exec('BEGIN');try{const r=[];for(const op of ops)r.push(await op.run());db.exec('COMMIT');return r}catch(e){db.exec('ROLLBACK');throw e}};
 const env={DB,PAYME_MERCHANT_ID:'m',PAYME_KEY:'k',PAYME_SUBSCRIBE:'true'};
 const fetch=async(url,init)=>{url=String(url);if(url.includes('paycom')){const b=JSON.parse(init.body);return b.method==='receipts.create'?Response.json({result:{receipt:{_id:'rc1'}}}):Response.json({result:{receipt:{_id:'rc1',state:4}}})}return Response.json({enabled:false})};
 const extras={fetch};
 const cf={'cloudflare:workers':{env}},http=load('app/http.ts',cf),noLimit={...http,throttle:async()=>{}};
 const ADMIN='sb:4fcd0d25-6ec1-4e10-a15f-8005d683edfe';
 let who=null;const access=load('app/access.ts',{...cf,'./auth-service':{customerIdentity:async()=>who}});
 const as=id=>{who={userId:id,email:id+'@x',displayName:id}};
 const base=integrationDeps(env,http,'../../',extras);
 const deps={...cf,...base,'../../access':access,'../../http':noLimit,'../../geo':load('app/geo.ts',{'./http':http}),'../../table-rules':load('app/table-rules.ts',{'./http':http}),'../../booking-rules':load('app/booking-rules.ts',{'./http':http}),'../../booking-preorder':load('app/booking-preorder.ts',{'./http':http}),'../../account-admin':{audit:()=>({run:async()=>({})}),hashInvite:async()=>''},'../../demo-drinks':load('app/demo-drinks.ts',{}),'../../auth-service':{authConfig:()=>({url:'',key:''})}};
 const flowers=load('app/api/flowers/route.ts',deps,extras),catalog=load('app/api/catalog/route.ts',deps,{fetch:async()=>Response.json({enabled:false})}),manage=load('app/api/manage/route.ts',deps,extras),tables=load('app/api/tables/route.ts',deps,extras),bookings=load('app/api/bookings/route.ts',deps,extras);
 const receipt=load('app/api/bookings/receipt/route.ts',{...cf,'../../../access':access,'../../../http':http,'../../../booking-pass':load('app/booking-pass.ts',cf)});
 const paid=new Date(Date.now()+30*86400000).toISOString();
 db.exec(`INSERT INTO accounts(id,email,name,created_at,role,status,courier_approved) VALUES ('${ADMIN}','furqatovm2007@gmail.com','Admin','now','admin','active',0),('fl','fl@x','Gul Saroy','now','florist','active',0),('own','own@x','Owner','now','restaurant_owner','active',0),('c1','c1@x','Aziz','now','customer','active',0),('cr','cr@x','Kuryer Ali','now','courier','active',1)`);
 db.exec("INSERT INTO payment_cards(id,user_id,token,masked,expire,created_at) VALUES ('pc','c1','tok','8600','03/99','now')");
 const GET=(route,path)=>route.GET(new Request('https://test'+path));
 const cat=async()=>(await (await GET(flowers,'/api/flowers')).json()).flowers.map(f=>f.title).sort();

 // 1. Flowers: the admin's and the florist's posts both reach the public showcase at once.
 as(ADMIN);let r=await flowers.POST(request('/api/flowers',{action:'save',title:'Admin atirgullari',kind:'Atirgul',size:'Katta',price:200000}));assert.equal(r.status,201);
 as('fl');r=await flowers.POST(request('/api/flowers',{action:'save',title:'Lolalar',kind:'Lola',size:'O‘rtacha',price:90000,active:false}));const lola=(await r.json()).id;
 assert.deepEqual(await cat(),['Admin atirgullari','Lolalar'],'admin + florist posts visible (new posts are always on sale)');
 assert.deepEqual({...db.prepare('SELECT active,status,is_approved FROM flowers WHERE id=?').get(lola)},{active:1,status:'active',is_approved:1});
 r=await GET(flowers,'/api/flowers');assert.ok(r.headers.get('cache-control').includes('no-store'));
 // The cabinet shows exactly the same row.
 let cab=await (await GET(flowers,'/api/flowers?view=florist')).json();assert.deepEqual(cab.flowers.map(f=>f.id),[lola]);
 // Taking a post off sale or suspending the seller hides it; putting it back shows it again.
 await flowers.POST(request('/api/flowers',{action:'save',id:lola,title:'Lolalar',kind:'Lola',size:'O‘rtacha',price:95000,active:false}));assert.deepEqual(await cat(),['Admin atirgullari']);
 await flowers.POST(request('/api/flowers',{action:'save',id:lola,title:'Lolalar',kind:'Lola',size:'O‘rtacha',price:95000}));assert.deepEqual(await cat(),['Admin atirgullari','Lolalar']);
 db.exec("UPDATE accounts SET status='suspended' WHERE id='fl'");assert.deepEqual(await cat(),['Admin atirgullari']);db.exec("UPDATE accounts SET status='active' WHERE id='fl'");

 // 2. Flower order chain: customer -> florist -> courier -> admin (3%).
 as('c1');r=await flowers.POST(request('/api/flowers',{action:'order',flowerId:lola,quantity:2,deliveryType:'home',latitude:39.65,longitude:66.95,address:'5-uy',phone:'+998901234567'}));assert.equal(r.status,201);const order=(await r.json()).id;
 as('fl');cab=await (await GET(flowers,'/api/flowers?view=florist')).json();assert.equal(cab.orders[0].id,order,'florist sees it at once');
 as('cr');assert.equal((await (await GET(flowers,'/api/flowers?view=courier')).json()).orders.length,0,'not before the florist accepts');
 as('fl');assert.equal((await flowers.POST(request('/api/flowers',{action:'status',id:order,status:'accepted'}))).status,200);
 as('cr');let cour=await (await GET(flowers,'/api/flowers?view=courier')).json();assert.equal(cour.orders[0].id,order,'courier sees it');
 assert.equal((await flowers.POST(request('/api/flowers',{action:'courier_take',id:order}))).status,200);
 as('fl');cab=await (await GET(flowers,'/api/flowers?view=florist')).json();assert.equal(cab.orders[0].status,'delivering');assert.equal(cab.orders[0].courier_name,'Kuryer Ali');
 as(ADMIN);let adm=await (await GET(flowers,'/api/flowers?view=admin')).json();assert.equal(adm.orders[0].id,order);assert.equal(adm.orders[0].commission,5700,'3% of 190 000');assert.equal(adm.orders[0].courier_name,'Kuryer Ali');
 as('cr');assert.equal((await flowers.POST(request('/api/flowers',{action:'courier_done',id:order}))).status,200);assert.equal(db.prepare('SELECT status FROM flower_orders WHERE id=?').get(order).status,'delivered');
 {const h=await (await GET(flowers,'/api/flowers?view=courier')).json();assert.deepEqual(h.history.map(x=>x.id),[order],'balance tab: delivered history');assert.ok('florist_address' in h.history[0]&&'florist_phone' in h.history[0],'pick-up address for the card');}
 as('c1');assert.equal((await (await GET(flowers,'/api/flowers?view=mine')).json()).orders[0].status,'delivered');
 as('c1');assert.equal((await GET(flowers,'/api/flowers?view=courier')).status,403,'only approved couriers');

 // 3. Restaurants: the admin's new restaurant is live at once; an owner's waits for approval.
 as(ADMIN);r=await manage.POST(request('/api/manage',{action:'restaurant',name:'Admin Osh',address:'Samarqand 1',phone:'+998901234567',tables:4,floors:1}));assert.equal(r.status,200,await r.clone().text());
 as('own');r=await manage.POST(request('/api/manage',{action:'restaurant',name:'Owner Kafe',address:'Samarqand 2',phone:'+998901234568',tables:4,floors:1}));const ownR=(await r.json()).id;
 let c=await (await catalog.GET(new Request('https://test/api/catalog'))).json();assert.deepEqual(c.restaurants.filter(x=>!x.is_demo).map(x=>x.name),['Admin Osh']);
 r=await catalog.GET(new Request('https://test/api/catalog'));assert.ok(r.headers.get('cache-control').includes('no-store'),'catalog not cached');
 db.prepare("UPDATE restaurants SET status='active',plan='premium',paid_until=? WHERE id=?").run(paid,ownR);
 // Owner edits (hours) show immediately.
 r=await manage.POST(request('/api/manage',{action:'restaurant',id:ownR,name:'Owner Kafe Plus',address:'Samarqand 2',phone:'+998901234568',tables:4,floors:1,bookingOpen:'08:00',bookingClose:'23:00'}));assert.equal(r.status,200);
 c=await (await catalog.GET(new Request('https://test/api/catalog'))).json();assert.ok(c.restaurants.some(x=>x.name==='Owner Kafe Plus'));
 // 4. Menu (also the 3D book's data): a new dish and a new price appear in the catalog at once.
 r=await manage.POST(request('/api/manage',{action:'menu',restaurantId:ownR,name:'Plov',price:30000,ingredients:'Guruch',allergens:'',category:'Main',description:'Issiq',imageUrl:''}));assert.equal(r.status,200,await r.clone().text());
 c=await (await catalog.GET(new Request('https://test/api/catalog'))).json();let dish=c.menu.find(m=>m.restaurant_id===ownR&&m.name==='Plov');assert.equal(dish.price,30000);
 r=await manage.POST(request('/api/manage',{action:'menu',id:dish.id,restaurantId:ownR,name:'Plov',price:35000,ingredients:'Guruch',allergens:'',category:'Main',description:'Issiq',imageUrl:''}));assert.equal(r.status,200);
 c=await (await catalog.GET(new Request('https://test/api/catalog'))).json();assert.equal(c.menu.find(m=>m.id===dish.id).price,35000,'new price at once');

 // 5. Tables and live states: what the owner saves is what the customer's booking plan shows.
 r=await tables.POST(request('/api/tables',{restaurantId:ownR,number:1,seats:4,floor:1,shape:'round',atmosphere:'',x:20,y:30}));assert.equal(r.status,200,await r.clone().text());
 await tables.POST(request('/api/tables',{restaurantId:ownR,number:2,seats:4,floor:1,shape:'round',atmosphere:'',x:35,y:30}));
 r=await tables.POST(request('/api/tables',{action:'live',restaurantId:ownR,tableNumber:2,status:'cleaning'}));assert.equal(r.status,200);
 as('c1');const day=new Date(Date.now()+5*3600000+86400000).toISOString().slice(0,10);
 let plan=await (await GET(tables,'/api/tables?restaurantId='+ownR+'&date='+day)).json();assert.deepEqual(plan.tables.map(t=>t.number),[1,2]);assert.equal(plan.live.find(l=>l.table_number===2).status,'cleaning');
 // 6. Booking: restaurant dashboard, "my bookings", receipt + QR — all at once; a merged booking blocks both tables.
 r=await bookings.POST(request('/api/bookings',{restaurantId:ownR,date:day,slot:'19:00',endSlot:'21:00',tableNumber:1,mergeTable:2,guests:7,phone:'+998901234567',acceptPenalty:true}));assert.equal(r.status,201,await r.clone().text());const bk=(await r.json()).id;
 plan=await (await GET(tables,'/api/tables?restaurantId='+ownR+'&date='+day)).json();assert.deepEqual(plan.bookings.map(b=>b.table_number).sort(),[1,2],'both merged tables busy on the plan');
 const mine=await (await bookings.GET()).json();assert.equal(mine[0].id,bk);
 r=await receipt.GET(new Request('https://test/api/bookings/receipt?id='+bk));let rc=await r.json();assert.ok(rc.pass.payload.startsWith('RFB1:'));assert.equal(rc.booking.mergedTable,2);
 as('own');const dash=await (await manage.GET()).json();assert.ok(dash.bookings.some(b=>b.id===bk&&b.merged_table===2),'restaurant dashboard');
 r=await manage.GET();assert.ok(r.headers.get('cache-control').includes('no-store'));
 console.log('PASS sync: flowers (admin+florist -> showcase, order -> florist/courier/admin 3%), restaurants (admin live, owner after approval), menu/price at once, tables + live states, booking -> dashboard/my bookings/receipt, no-store everywhere');
})().catch(e=>{console.error(e);process.exitCode=1});
