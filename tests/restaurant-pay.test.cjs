const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request}=require('./harness.cjs');
// Restaurant payment details: Click link (https://…click.uz only, amount/transaction_param stripped — added per
// booking by the page), card (16 digits + holder); owner/admin only; prepayment works with them even without the
// central card; the payment info carries the Click link; the owner's receipt alert says where the money went.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...v){args=v;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 const env={DB},cw={'cloudflare:workers':{env}};let user=null;
 const http=load('app/http.ts',cw),pay=load('app/restaurant-pay.ts',{...cw,'./http':http});
 const route=load('app/api/manage/payment/route.ts',{...cw,'../../../access':{identity:async()=>user},'../../../http':http,'../../../staff':load('app/staff.ts',{...cw,'./http':http}),'../../../restaurant-pay':pay});
 db.exec("INSERT INTO accounts(id,email,name,created_at,role) VALUES ('o1','o@x','O','now','restaurant_owner'),('o2','p@x','P','now','restaurant_owner')");
 db.exec("INSERT INTO restaurants(id,name,owner_id,status,tables,floors) VALUES ('r1','Amanda','o1','active',3,1)");
 const save=b=>route.POST(request('/api/manage/payment',{restaurantId:'r1',...b}));
 user={userId:'o2',role:'restaurant_owner'};assert.equal((await save({clickPayUrl:'https://my.click.uz/services/pay?service_id=1&merchant_id=2'})).status,403,'another owner');
 user={userId:'o1',role:'restaurant_owner'};
 assert.equal((await save({clickPayUrl:'http://my.click.uz/x'})).status,400,'https only');
 assert.equal((await save({clickPayUrl:'https://evil.example/pay'})).status,400,'click.uz only');
 assert.equal((await save({cardNumber:'8600 1234'})).status,400,'16 digits');
 assert.equal((await save({cardNumber:'8600123456789012'})).status,400,'holder needed');
 let r=await save({clickPayUrl:'https://my.click.uz/services/pay?service_id=11&merchant_id=22&amount=5&transaction_param=old',cardNumber:'8600123456789012',cardHolder:'KARIMOV A.'});assert.equal(r.status,200);
 const got=await (await route.GET(new Request('https://test/api/manage/payment?restaurantId=r1'))).json();
 assert.equal(got.clickPayUrl,'https://my.click.uz/services/pay?service_id=11&merchant_id=22','amount / transaction_param stripped');assert.equal(got.card,'8600 1234 5678 9012');assert.equal(got.holder,'KARIMOV A.');
 // p2p: enabled by the restaurant's details alone; payment info carries the Click link and the restaurant card.
 const p2p=load('app/p2p.ts',{...cw,'./http':http,'./telegram':{telegram:async()=>true,html:x=>String(x),notifyBooking:async()=>true,customerLines:()=>['','','']},'./health':{adminChats:async()=>['1000']},'./mvp':{CENTRAL_PAYMENT_CARD:'8600 XXXX XXXX XXXX',CENTRAL_PAYMENT_HOLDER:'M',SUPER_ADMIN_TG_ID:''},'./image-content':{imageContent:()=>null},'./guest-policy':{ban:async()=>{},guestKeys:()=>[],loadGuestBooking:async()=>null},'./table-group':load('app/table-group.ts',cw),'./restaurant-pay':pay});
 assert.equal(await p2p.p2pEnabled(),false,'no central card, no restaurant');assert.equal(await p2p.p2pEnabled('r1'),true,'restaurant details are enough');
 db.exec("INSERT INTO bookings(id,restaurant_id,user_id,date,slot,table_number,guests,phone,status,created_at) VALUES ('b1','r1','u','2030-01-01','19:00',1,2,'+998901112233','pending','now')");
 const info=await p2p.startP2P('b1',250000,100000,Date.now(),'r1');
 assert.equal(info.clickPayUrl,got.clickPayUrl);assert.equal(info.card,'8600 1234 5678 9012');assert.equal(info.payee,'restaurant');assert.equal(info.minDeposit,100000);
 assert.equal((await p2p.paymentInfo(await p2p.p2pState('b1'))).clickPayUrl,got.clickPayUrl,'same info later (profile re-upload)');
 assert.match(p2p.ownerCaption({restaurant_name:'Amanda',table_number:1,phone:'+998',customer_name:'A',date:'2030-01-01',slot:'19:00',guests:2},100000,Date.now(),250000,'Click (restoran hisobi)'),/🏦 Qabul qiluvchi: <b>Click \(restoran hisobi\)<\/b>/);
 // Clearing both: back to the central card.
 await save({clickPayUrl:'',cardNumber:'',cardHolder:''});assert.equal(db.prepare("SELECT COUNT(*) n FROM app_settings WHERE key='pay:r1'").get().n,0);assert.equal(await p2p.p2pEnabled('r1'),false);
 // The page adds amount + transaction_param to the link.
 const js=fs.readFileSync('public/mvp.js','utf8');assert.match(js,/searchParams\.set\('amount', String\(now\)\)/);assert.match(js,/searchParams\.set\('transaction_param', String\(res\.id\)\)/);
 console.log('PASS restaurant pay: Click link (https click.uz, params stripped) + card, owner only; prepayment with restaurant details; Click link in payment info; payee in the owner alert; page adds amount + transaction_param');
})().catch(e=>{console.error(e);process.exitCode=1});
