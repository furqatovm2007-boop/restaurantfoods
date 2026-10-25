const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request,integrationDeps}=require('./harness.cjs');
// POS cash desk: goods base with barcodes, one-scan lookup, server-priced sales that take stock all-or-nothing,
// cash / card at once, Payme and Click QR paid by the merchant callbacks, refunds, staff levels.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...a){args=a;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 DB.batch=async ops=>{db.exec('BEGIN');try{const r=[];for(const op of ops)r.push(await op.run());db.exec('COMMIT');return r}catch(e){db.exec('ROLLBACK');throw e}};
 const env={DB,CLICK_SERVICE_ID:'11',CLICK_MERCHANT_ID:'22',CLICK_SECRET_KEY:'click-key',PAYME_MERCHANT_ID:'pm',PAYME_KEY:'payme-key'};
 const extras={fetch:async()=>Response.json({ok:true,result:{}}),FormData,URLSearchParams};
 const cf={'cloudflare:workers':{env}},http=load('app/http.ts',cf),noLimit={...http,throttle:async()=>{}},deep=integrationDeps(env,http,'../../../',extras),two=integrationDeps(env,http,'../../',extras);
 const plans=load('app/plans.ts',{...cf,'./http':http}),staff=load('app/staff.ts',{...cf,'./http':http,'./plans':plans}),pos=load('app/pos.ts',{...cf,'./http':http});
 let user=null;const access={identity:async()=>user};
 const route=load('app/api/pos/route.ts',{...cf,'../../access':access,'../../http':noLimit,'../../staff':staff,'../../deposits':two['../../deposits'],'../../pos':pos});
 const receipt=load('app/api/pos/receipt/route.ts',{...cf,'../../../http':http,'../../../pos':pos});
 const payme=load('app/api/payments/payme/route.ts',{...cf,...deep,'../../../http':http},extras),click=load('app/api/payments/click/route.ts',{...cf,...deep,'../../../http':http},extras);
 const {md5}=deep['../../../md5'];
 db.prepare("INSERT INTO restaurants(id,name,status,owner_id,plan,paid_until) VALUES ('r','Osh Markazi','active','owner','business',?)").run(new Date(Date.now()+30*86400000).toISOString());
 db.exec("INSERT INTO restaurant_staff(restaurant_id,user_id,role,created_by,created_at) VALUES ('r','w1','waiter','owner','now'),('r','m1','manager','owner','now')");
 const post=d=>route.POST(request('/api/pos',{restaurantId:'r',...d}));const get=q=>route.GET(new Request('https://test/api/pos?restaurantId=r&'+q));
 // Access: strangers no; the waiter sells but does not edit the base.
 user={userId:'x',role:'customer'};assert.equal((await get('view=products')).status,403);
 user={userId:'w1',role:'customer'};assert.equal((await get('view=products')).status,200);assert.equal((await post({action:'product_save',name:'Non',price:5000,stock:10})).status,403,'waiter cannot edit');
 // Goods base: generated EAN-13 or a scanned code; duplicates refused.
 user={userId:'m1',role:'customer'};
 const bc=(await (await post({action:'barcode_new'})).json()).barcode;assert.match(bc,/^2\d{12}$/);const d=[...bc].map(Number);assert.equal((10-d.slice(0,12).reduce((n,v,i)=>n+v*(i%2?3:1),0)%10)%10,d[12],'valid EAN-13 check digit');
 let r=await post({action:'product_save',barcode:'4780000000017',name:'Coca-Cola 0.5',price:8000,stock:5});assert.equal(r.status,201);const cola=(await r.json()).id;
 r=await post({action:'product_save',name:'Non',price:4000,stock:2});assert.equal(r.status,201);const non=await r.json();assert.match(non.barcode,/^2\d{12}$/,'auto barcode');
 assert.equal((await post({action:'product_save',barcode:'4780000000017',name:'Dup',price:1,stock:1})).status,409);
 assert.equal((await post({action:'product_save',name:'Bad',price:-1,stock:1})).status,400);
 // One scan finds the product with its price.
 user={userId:'w1',role:'customer'};let p=(await (await get('view=lookup&barcode=4780000000017')).json()).product;assert.equal(p.name,'Coca-Cola 0.5');assert.equal(p.price,8000);
 assert.equal((await get('view=lookup&barcode=999')).status,404);
 // Cash: prices from the base (not the browser), duplicates merged, stock taken, change computed.
 r=await post({action:'sale_create',method:'cash',received:50000,items:[{productId:cola,qty:2,price:1},{productId:cola,qty:1}]});assert.equal(r.status,201);let s=(await r.json()).sale;
 assert.equal(s.total,24000);assert.equal(s.status,'paid');assert.equal(s.change,26000);assert.equal(s.items[0].qty,3);assert.match(s.receiptNo,/^K-\d{6}-0001$/);
 assert.equal(db.prepare("SELECT stock FROM pos_products WHERE id=?").get(cola).stock,2);
 assert.equal((await post({action:'sale_create',method:'cash',received:1000,items:[{productId:cola,qty:1}]})).status,400,'not enough cash');
 // Oversell: refused, nothing taken.
 assert.equal((await post({action:'sale_create',method:'card',items:[{productId:cola,qty:3}]})).status,409);assert.equal(db.prepare("SELECT stock FROM pos_products WHERE id=?").get(cola).stock,2);
 // The electronic receipt opens with its key only.
 const key=db.prepare('SELECT receipt_key FROM pos_sales WHERE id=?').get(s.id).receipt_key;assert.ok(s.receiptUrl.endsWith('/#/chek/'+s.id+'/'+key));
 let rc=await (await receipt.GET(new Request('https://test/api/pos/receipt?id='+s.id+'&k='+key))).json();assert.equal(rc.receipt.restaurant,'Osh Markazi');assert.equal(rc.receipt.total,24000);
 assert.equal((await receipt.GET(new Request('https://test/api/pos/receipt?id='+s.id+'&k='+'0'.repeat(36)))).status,404);
 // Payme QR: pending until Payme pays; the checkout link carries the amount; stock taken on payment.
 r=await post({action:'sale_create',method:'payme',items:[{productId:non,qty:2}].map(i=>({productId:non.id,qty:2}))});assert.equal(r.status,201);let j=await r.json();
 assert.equal(j.sale.status,'pending');assert.ok(atob(j.payUrl.split('/').pop()).includes('ac.deposit_id='+j.sale.id+';a=800000;'));assert.equal(db.prepare("SELECT stock FROM pos_products WHERE id=?").get(non.id).stock,2,'not taken before payment');
 const rpc=(method,params)=>payme.POST(new Request('https://test/api/payments/payme',{method:'POST',headers:{Authorization:'Basic '+btoa('Paycom:payme-key')},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})})).then(x=>x.json());
 assert.equal((await rpc('CheckPerformTransaction',{amount:800000,account:{deposit_id:j.sale.id}})).result.allow,true);
 assert.equal((await rpc('CheckPerformTransaction',{amount:100,account:{deposit_id:j.sale.id}})).error.code,-31001,'wrong amount');
 assert.equal((await rpc('CreateTransaction',{id:'pm-1',time:Date.now(),amount:800000,account:{deposit_id:j.sale.id}})).result.state,1);
 assert.equal((await post({action:'sale_cancel',id:j.sale.id})).status,409,'not while Payme is paying');
 assert.equal((await rpc('PerformTransaction',{id:'pm-1'})).result.state,2);
 s=(await (await get('view=sale&id='+j.sale.id)).json()).sale;assert.equal(s.status,'paid');assert.equal(s.provider,'payme');assert.equal(db.prepare("SELECT stock FROM pos_products WHERE id=?").get(non.id).stock,0);
 assert.equal((await rpc('CheckTransaction',{id:'pm-1'})).result.state,2);
 assert.ok((await rpc('GetStatement',{from:0,to:Date.now()+1000})).result.transactions.some(t=>t.account.deposit_id===j.sale.id));
 // Payme refund (cancel after perform) puts the stock back.
 assert.equal((await rpc('CancelTransaction',{id:'pm-1',reason:5})).result.state,-2);assert.equal(db.prepare("SELECT stock FROM pos_products WHERE id=?").get(non.id).stock,2);assert.equal(db.prepare("SELECT status FROM pos_sales WHERE id=?").get(j.sale.id).status,'refunded');
 // Click QR: prepare + complete pays the sale.
 j=await (await post({action:'sale_create',method:'click',items:[{productId:cola,qty:1}]})).json();assert.ok(j.payUrl.includes('transaction_param='+j.sale.id));
 const clickReq=f=>{const v={click_trans_id:'77',service_id:'11',click_paydoc_id:'1',merchant_trans_id:j.sale.id,amount:'8000.00',error:'0',error_note:'Success',sign_time:'2026-10-25 10:00:00',...f};v.sign_string=md5(v.click_trans_id+v.service_id+'click-key'+v.merchant_trans_id+(v.action==='1'?v.merchant_prepare_id:'')+v.amount+v.action+v.sign_time);return click.POST(new Request('https://test/api/payments/click',{method:'POST',body:new URLSearchParams(v).toString()})).then(x=>x.json())};
 const prep=await clickReq({action:'0'});assert.equal(prep.error,0);const done=await clickReq({action:'1',merchant_prepare_id:String(prep.merchant_prepare_id)});assert.equal(done.error,0);
 assert.equal(db.prepare("SELECT status FROM pos_sales WHERE id=?").get(j.sale.id).status,'paid');assert.equal(db.prepare("SELECT stock FROM pos_products WHERE id=?").get(cola).stock,1);
 // A pending QR sale can be paid in cash instead, or cancelled; card refund restores stock (manager only).
 j=await (await post({action:'sale_create',method:'payme',items:[{productId:cola,qty:1}]})).json();assert.equal((await (await post({action:'sale_pay',id:j.sale.id,method:'cash'})).json()).sale.status,'paid');assert.equal(db.prepare("SELECT stock FROM pos_products WHERE id=?").get(cola).stock,0);
 s=(await (await post({action:'sale_create',method:'card',items:[{productId:non.id,qty:1}]})).json()).sale;assert.equal((await post({action:'sale_refund',id:s.id})).status,403,'waiter cannot refund');
 user={userId:'m1',role:'customer'};assert.equal((await post({action:'sale_refund',id:s.id})).status,200);assert.equal(db.prepare("SELECT stock FROM pos_products WHERE id=?").get(non.id).stock,2);
 const t=(await (await get('view=sales')).json()).today;assert.ok(t.count>=3&&t.cash>=24000);
 assert.equal((await post({action:'product_delete',id:cola})).status,200);
 console.log('PASS pos: goods base with EAN-13, one-scan lookup, server prices, all-or-nothing stock, cash change, Payme/Click QR via callbacks, refunds restock, staff levels, e-receipt key');
})().catch(e=>{console.error(e);process.exitCode=1});
