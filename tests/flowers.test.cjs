const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request}=require('./harness.cjs');
// Roles: everyone starts as a customer; a florist request is approved by the admin, only then the
// florist cabinet works. Flowers: posts, catalog, card-paid orders to a booked table or home, 3%
// commission, florist status flow, refund on cancel, payment failure.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...v){args=v;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 DB.batch=async ops=>{db.exec('BEGIN');try{const r=[];for(const op of ops)r.push(await op.run());db.exec('COMMIT');return r}catch(e){db.exec('ROLLBACK');throw e}};
 const env={DB,PAYME_MERCHANT_ID:'cashbox',PAYME_KEY:'k',PAYME_SUBSCRIBE:'true'};
 const calls=[];let payFails=false;
 const fetch=async(url,init)=>{const b=JSON.parse(init.body);calls.push(b);if(b.method==='receipts.create')return Response.json({result:{receipt:{_id:'rc'+calls.length}}});if(b.method==='receipts.pay')return payFails?Response.json({error:{code:-1,message:'Karta bloklangan'}}):Response.json({result:{receipt:{_id:b.params.id,state:4}}});if(b.method==='receipts.cancel')return Response.json({result:{receipt:{_id:b.params.id,state:50}}});return Response.json({error:{code:-32601,message:'?'}})};
 const cf={'cloudflare:workers':{env}},http=load('app/http.ts',cf),noLimit={...http,throttle:async()=>{}};
 let who=null;const access=load('app/access.ts',{...cf,'./auth-service':{customerIdentity:async()=>who}});
 const cards=load('app/payme-cards.ts',{...cf,'./http':http},{fetch});
 const flowers=load('app/api/flowers/route.ts',{...cf,'../../access':access,'../../http':noLimit,'../../geo':load('app/geo.ts',{'./http':http}),'../../payme-cards':cards},{fetch});
 const aa=load('app/account-admin.ts',{...cf,'./http':http});
 const admin=load('app/api/admin/accounts/route.ts',{...cf,'../../../access':access,'../../../http':noLimit,'../../../account-admin':aa});
 const profile=load('app/api/profile/route.ts',{...cf,'../../access':access,'../../http':noLimit,'../../account-admin':aa,'../../geo':load('app/geo.ts',{'./http':http}),'../../sms':{phoneOtpEnabled:()=>false,telegramOtpConfigured:()=>false},'../../telegram':{telegram:async()=>null},'../../booking-otp':{}});
 const as=(id,email)=>{who={userId:id,email,displayName:id}};
 db.exec("INSERT INTO accounts(id,email,name,created_at,role) VALUES ('sb:4fcd0d25-6ec1-4e10-a15f-8005d683edfe','furqatovm2007@gmail.com','Admin','now','admin'),('fl','fl@x','Gulchi','now','customer'),('c1','c1@x','C1','now','customer')");
 db.exec("INSERT INTO restaurants(id,name,owner_id,status,tables,address,latitude,longitude) VALUES ('r','Real','sb:4fcd0d25-6ec1-4e10-a15f-8005d683edfe','active',3,'Registon 1',39.65,66.97)");
 db.exec("INSERT INTO bookings(id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('bk','r','c1','2099-01-01','19:00','21:00',2,2,'+998901234567','confirmed','now'),('other','r','fl','2099-01-01','19:00','21:00',3,2,'+998901234567','confirmed','now')");
 const save=p=>flowers.POST(request('/api/flowers',{action:'save',...p}));

 // 1. A new account is a customer: no florist cabinet, no posts.
 as('fl','fl@x');assert.equal((await access.identity()).role,'customer');
 assert.equal((await flowers.GET(new Request('https://test/api/flowers?view=florist'))).status,403);
 assert.equal((await save({title:'Atirgul',kind:'Atirgul',size:'Katta',price:150000})).status,403,'not approved yet');
 // 2. Florist request -> admin approves -> role florist.
 assert.equal((await profile.POST(request('/api/profile',{action:'request-access',role:'florist',note:'Gul do‘konim bor'}))).status,200);
 as('sb:4fcd0d25-6ec1-4e10-a15f-8005d683edfe','furqatovm2007@gmail.com');assert.equal((await admin.POST(request('/api/admin/accounts',{action:'approve-request',id:'fl'}))).status,200);
 as('fl','fl@x');assert.equal((await access.identity()).role,'florist');
 // 3. Posts: validation, create, catalog.
 assert.equal((await save({title:'A',kind:'Atirgul',size:'Katta',price:150000})).status,400);
 let r=await save({title:'25 ta qizil atirgul',kind:'Atirgul',size:'Katta',price:150000,description:'Lenta bilan'});assert.equal(r.status,201);const fid=(await r.json()).id;
 r=await save({title:'Lola',kind:'Lola',size:'Kichik',price:40000,active:false});const hidden=(await r.json()).id;
 let cat=await (await flowers.GET(new Request('https://test/api/flowers'))).json();assert.deepEqual(cat.flowers.map(f=>f.id),[fid],'inactive hidden');assert.equal(cat.flowers[0].florist_name,'Gulchi');
 // 4. Orders: card needed; table delivery only to own booking; 3% commission; charged from the card.
 as('c1','c1@x');const order=p=>flowers.POST(request('/api/flowers',{action:'order',flowerId:fid,quantity:2,phone:'+998901234567',...p}));
 assert.equal((await order({deliveryType:'table',bookingId:'bk'})).status,402,'card required');
 db.exec("INSERT INTO payment_cards(id,user_id,token,masked,expire,created_at) VALUES ('pc','c1','tok-c1','8600****','03/99','now')");
 assert.equal((await order({deliveryType:'table',bookingId:'other'})).status,400,'someone else’s booking');
 assert.equal((await flowers.POST(request('/api/flowers',{action:'order',flowerId:hidden,quantity:1,deliveryType:'home',latitude:39.6,longitude:66.9,phone:'+998901234567'}))).status,404,'inactive not for sale');
 calls.length=0;r=await order({deliveryType:'table',bookingId:'bk',note:'Tug‘ilgan kun'});assert.equal(r.status,201);let o=await r.json();
 assert.equal(o.total,300000);assert.equal(o.commission,9000,'3%');
 assert.equal(calls.find(c=>c.method==='receipts.create').params.amount,30000000);assert.equal(calls.find(c=>c.method==='receipts.pay').params.token,'tok-c1');
 let row=db.prepare('SELECT * FROM flower_orders WHERE id=?').get(o.id);assert.equal(row.status,'paid');assert.equal(row.florist_amount,291000);assert.ok(row.address.includes('Real')&&row.address.includes('2-stol'));assert.equal(row.deliver_at,'2099-01-01 19:00');
 r=await order({deliveryType:'home',latitude:39.66,longitude:66.95,address:'5-uy',deliverAt:'18:00'});const homeOrder=(await r.json()).id;
 assert.equal((await order({deliveryType:'home'})).status,400,'home needs a map point');
 // Payment failure: nothing paid, clear error.
 payFails=true;r=await order({deliveryType:'home',latitude:39.66,longitude:66.95});assert.equal(r.status,402);assert.ok((await r.json()).error.includes('bloklangan'));payFails=false;
 assert.equal(db.prepare("SELECT COUNT(*) n FROM flower_orders WHERE status='payment_failed'").get().n,1);
 // A customer cannot drive the florist flow.
 assert.equal((await flowers.POST(request('/api/flowers',{action:'status',id:o.id,status:'accepted'}))).status,403);
 // 5. Florist: sees paid orders (not failed), moves them along, cancel refunds.
 as('fl','fl@x');let cab=await (await flowers.GET(new Request('https://test/api/flowers?view=florist'))).json();
 assert.equal(cab.orders.length,2,'only paid orders reach the florist');assert.deepEqual({...cab.totals},{earned:291000*2,commission:9000*2,count:2});
 const st=(id,status)=>flowers.POST(request('/api/flowers',{action:'status',id,status}));
 assert.equal((await st(o.id,'delivered')).status,409,'no skipping');
 for(const s of ['accepted','delivering','delivered'])assert.equal((await st(o.id,s)).status,200,s);
 assert.equal((await st(o.id,'cancelled')).status,409,'delivered is final');
 calls.length=0;assert.equal((await st(homeOrder,'cancelled')).status,200);assert.equal(calls[0].method,'receipts.cancel');assert.equal(db.prepare('SELECT status FROM flower_orders WHERE id=?').get(homeOrder).status,'refunded');
 // Another florist's order is not reachable.
 db.exec("INSERT INTO accounts(id,email,name,created_at,role) VALUES ('fl2','fl2@x','F2','now','florist')");as('fl2','fl2@x');assert.equal((await st(o.id,'accepted')).status,404);
 assert.equal((await save({id:fid,title:'Hijack',kind:'x1',size:'K',price:1000})).status,404,'cannot edit another florist’s post');
 // 6. Admin sees the platform commission; a florist demoted to customer loses the catalog listing.
 as('sb:4fcd0d25-6ec1-4e10-a15f-8005d683edfe','furqatovm2007@gmail.com');let adm=await (await flowers.GET(new Request('https://test/api/flowers?view=admin'))).json();assert.deepEqual({...adm.totals},{sales:300000,commission:9000,count:1},'refunded order excluded');
 assert.equal((await admin.POST(request('/api/admin/accounts',{action:'role',id:'fl',role:'customer'}))).status,200);
 assert.equal((await (await flowers.GET(new Request('https://test/api/flowers'))).json()).flowers.length,0);
 // Card payments off: ordering is refused with a clear message.
 env.PAYME_SUBSCRIBE='false';as('c1','c1@x');assert.equal((await order({deliveryType:'table',bookingId:'bk'})).status,503);
 console.log('PASS flowers: customer by default, florist only after admin approval, posts/catalog, card-paid table/home orders with 3% commission, status flow, refund, isolation, admin totals');
})().catch(e=>{console.error(e);process.exitCode=1});
