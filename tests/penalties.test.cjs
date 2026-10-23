const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request,integrationDeps}=require('./harness.cjs');
// Card guarantee + penalties: tiers, card binding (token only, re-checked with Payme), booking needs
// card + consent, late cancel previews/charges the right amount once, failed charge never blocks the
// cancellation, no-show charge, card removal blocked while a guaranteed booking is active.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...v){args=v;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 DB.batch=async ops=>{db.exec('BEGIN');try{const r=[];for(const op of ops)r.push(await op.run());db.exec('COMMIT');return r}catch(e){db.exec('ROLLBACK');throw e}};
 const today=new Date(Date.now()+5*3600000).toISOString().slice(0,10);let NOW=Date.parse(today+'T12:00:00+05:00');
 class FixedDate extends Date{constructor(...a){super(...(a.length?a:[NOW]))}static now(){return NOW}}
 const env={DB,PAYME_MERCHANT_ID:'cashbox',PAYME_KEY:'secret-key',PAYME_SUBSCRIBE:'true',PAYME_TEST:'true'};
 const calls=[];let payFails=false;
 const fetch=async(url,init)=>{const body=JSON.parse(init.body);calls.push({url:String(url),auth:init.headers['X-Auth'],method:body.method,params:body.params});
  if(body.method==='cards.check')return Response.json({result:{card:{number:'860006******6311',expire:'03/99',token:body.params.token,recurrent:true,verify:body.params.token!=='unverified'}}});
  if(body.method==='receipts.create')return Response.json({result:{receipt:{_id:'rc-'+calls.length,state:0}}});
  if(body.method==='receipts.pay')return payFails?Response.json({error:{code:-31630,message:{uz:'Mablag‘ yetarli emas'}}}):Response.json({result:{receipt:{_id:body.params.id,state:4}}});
  if(body.method==='cards.remove')return Response.json({result:{success:true}});
  return Response.json({error:{code:-32601,message:'?'}})};
 const extras={fetch,Date:FixedDate};
 const cf={'cloudflare:workers':{env}},http=load('app/http.ts',cf),noLimit={...http,throttle:async()=>{}};
 const rules=load('app/booking-rules.ts',{'./http':http},{Date:FixedDate}),cards=load('app/payme-cards.ts',{...cf,'./http':http},extras),penalties=load('app/penalties.ts',{...cf,'./booking-rules':rules,'./payme-cards':cards},extras);
 let user={userId:'c1',role:'customer'};
 const deps={...cf,...integrationDeps(env,http,'../../',extras),'../../access':{identity:async()=>user},'../../http':noLimit,'../../plans':load('app/plans.ts',{...cf,'./http':http}),'../../geo':load('app/geo.ts',{'./http':http}),'../../table-rules':load('app/table-rules.ts',{'./http':http}),'../../booking-rules':rules,'../../booking-preorder':load('app/booking-preorder.ts',{'./http':http}),'../../payme-cards':cards,'../../penalties':penalties};
 const bookings=load('app/api/bookings/route.ts',deps,extras),cardRoute=load('app/api/cards/route.ts',deps,extras);
 db.exec("INSERT INTO accounts(id,email,name,created_at,role) VALUES ('owner','o@x','O','now','restaurant_owner'),('c1','c1@x','C1','now','customer'),('c2','c2@x','C2','now','customer')");
 db.exec("INSERT INTO restaurants(id,name,owner_id,status,tables,floors,booking_open,booking_close) VALUES ('r','Real','owner','active',3,1,'08:00','23:00')");
 db.exec("INSERT INTO restaurant_tables(id,restaurant_id,number,seats,x,y) VALUES ('t1','r',1,4,20,30),('t2','r',2,4,50,30),('t3','r',3,4,80,30)");

 // Tiers (minutes before the start).
 const at=m=>{const d=new Date(NOW+m*60000+5*3600000).toISOString();return [d.slice(0,10),d.slice(11,16)]};
 for(const [m,amount] of [[180,0],[120,0],[119,50000],[90,50000],[61,50000],[60,100000],[31,100000],[30,150000],[5,150000]])assert.equal(penalties.cancellationPenalty(...at(m)),amount,m+' min');

 // Card: consent required; unverified token refused; saved token is never returned.
 let r=await cardRoute.POST(request('/api/cards',{action:'save',token:'tok-c1-xxxxxxxx'}));assert.equal(r.status,400,'consent');
 r=await cardRoute.POST(request('/api/cards',{action:'save',token:'unverified',acceptRules:true}));assert.equal(r.status,400,'unverified card');
 r=await cardRoute.POST(request('/api/cards',{action:'save',token:'tok-c1-xxxxxxxx',acceptRules:true}));assert.equal(r.status,200);
 assert.equal(calls.find(c=>c.method==='cards.check').auth,'cashbox:secret-key','server checks with the secret key');assert.ok(calls[0].url.includes('checkout.test.paycom.uz'));
 let g=await (await cardRoute.GET()).json();assert.equal(g.enabled,true);assert.equal(g.merchantId,'cashbox');assert.deepEqual(g.card.masked,'860006******6311');assert.ok(!JSON.stringify(g).includes('tok-c1'),'token stays on the server');assert.equal(g.rules.noShow,150000);

 // Booking: no card -> 402; no consent -> 400; card + consent -> guaranteed booking.
 const book=(who,table,slot,endSlot,extra={})=>{user={userId:who,role:'customer'};return bookings.POST(request('/api/bookings',{restaurantId:'r',date:today,slot,endSlot,tableNumber:table,guests:2,phone:'+998901234567',...extra}))};
 assert.equal((await book('c2',1,'15:00','16:00',{acceptPenalty:true})).status,402,'card required');
 assert.equal((await book('c1',1,'15:00','16:00')).status,400,'consent required');
 r=await book('c1',1,'15:00','16:00',{acceptPenalty:true});assert.equal(r.status,201);const b1=(await r.json()).id;
 assert.equal(db.prepare('SELECT penalty_accepted FROM bookings WHERE id=?').get(b1).penalty_accepted,1);
 r=await book('c1',2,'18:00','19:00',{acceptPenalty:true});const b2=(await r.json()).id;
 r=await book('c1',3,'13:20','14:20',{acceptPenalty:true});const b3=(await r.json()).id;

 // Free cancel (6 h before), nothing charged.
 user={userId:'c1',role:'customer'};const patch=p=>bookings.PATCH(request('/api/bookings',p,'PATCH'));
 assert.equal((await (await patch({id:b2,preview:true})).json()).penalty,0);
 calls.length=0;assert.equal((await patch({id:b2})).status,200);assert.ok(!calls.some(c=>c.method.startsWith('receipts')),'free: no charge');
 // 1.5 h before 15:00 (13:30): preview 50 000, needs explicit acceptance, charged once to the restaurant.
 NOW=Date.parse(today+'T13:30:00+05:00');
 assert.equal((await (await patch({id:b1,preview:true})).json()).penalty,50000);
 r=await patch({id:b1});assert.equal(r.status,409,'must accept');assert.equal(db.prepare('SELECT status FROM bookings WHERE id=?').get(b1).status,'pending');
 calls.length=0;r=await patch({id:b1,acceptPenalty:true});assert.equal(r.status,200);assert.deepEqual((await r.json()).penalty.status,'paid');
 const create=calls.find(c=>c.method==='receipts.create'),pay=calls.find(c=>c.method==='receipts.pay');assert.equal(create.params.amount,5000000,'tiyin');assert.equal(pay.params.token,'tok-c1-xxxxxxxx');
 let p=db.prepare('SELECT * FROM penalties WHERE booking_id=?').get(b1);assert.equal(p.amount,50000);assert.equal(p.status,'paid');assert.equal(p.restaurant_id,'r');assert.equal(p.reason,'late_cancel');
 assert.equal(await penalties.chargePenalty(b1,'late_cancel',50000),null,'charged once per booking');
 assert.deepEqual({...await penalties.restaurantBalance('r')},{paid:50000,unpaid:0});
 // Started bookings cannot be cancelled any more (that is a no-show).
 NOW=Date.parse(today+'T13:25:00+05:00');
 // 13:20 booking already started at 13:25.
 assert.equal((await patch({id:b3,acceptPenalty:true})).status,400);
 // No-show: 150 000; a failed bank charge is recorded as unpaid.
 payFails=true;const ns=await penalties.chargePenalty(b3,'no_show',penalties.NO_SHOW_PENALTY);assert.equal(ns.status,'failed');
 p=db.prepare('SELECT * FROM penalties WHERE booking_id=?').get(b3);assert.equal(p.amount,150000);assert.ok(p.error.includes('yetarli'));
 assert.deepEqual({...await penalties.restaurantBalance('r')},{paid:50000,unpaid:150000});
 // Card removal is blocked while a guaranteed booking is active, then allowed.
 payFails=false;NOW=Date.parse(today+'T12:00:00+05:00');
 r=await book('c1',2,'20:00','21:00',{acceptPenalty:true});const b4=(await r.json()).id;
 assert.equal((await cardRoute.POST(request('/api/cards',{action:'remove'}))).status,409);
 await patch({id:b4});db.exec("UPDATE bookings SET status='completed' WHERE id='"+b3+"'");
 assert.equal((await cardRoute.POST(request('/api/cards',{action:'remove'}))).status,200);assert.equal(db.prepare("SELECT COUNT(*) n FROM payment_cards").get().n,0);
 // Without a bound card, an old booking keeps the strict 2-hour rule.
 env.PAYME_SUBSCRIBE='false';r=await book('c2',1,'13:30','14:30');assert.equal(r.status,201,'binding off: booking as before');const b5=(await r.json()).id;
 user={userId:'c2',role:'customer'};assert.equal((await patch({id:b5})).status,400);
 console.log('PASS penalties: tiers, card binding (token only), card+consent required, preview/accept late cancel charge once, started booking locked, no-show/failed charge, card removal guard');
})().catch(e=>{console.error(e);process.exitCode=1});
