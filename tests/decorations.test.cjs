const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request,integrationDeps}=require('./harness.cjs');
// Paid table decorations ("Marry me"…): only the owner/manager edits the list; a guest picks one at booking,
// it becomes a receipt line, counts in the online deposit and shows on the restaurant's Telegram card.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 db.exec("INSERT INTO restaurants(id,name,status,owner_id,booking_open,booking_close) VALUES ('r','Real','active','owner','08:00','23:00');INSERT INTO restaurant_tables(id,restaurant_id,number,seats) VALUES ('t','r',1,4);INSERT INTO menu(id,restaurant_id,name,price,available) VALUES ('dish','r','Plov',45000,1)");
 const DB={prepare(sql){let args=[];return {bind(...a){args=a;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 const env={DB,CLICK_SERVICE_ID:'11',CLICK_MERCHANT_ID:'22',CLICK_SECRET_KEY:'click-secret'},cw={'cloudflare:workers':{env}},http=load('app/http.ts',cw);
 let user={userId:'owner',role:'restaurant_owner'};
 const deps={...cw,'../../access':{identity:async()=>user},'../../http':http,'../../table-rules':load('app/table-rules.ts',{'./http':http}),'../../booking-rules':load('app/booking-rules.ts',{'./http':http}),'../../booking-preorder':load('app/booking-preorder.ts',{'./http':http})};
 Object.assign(deps,integrationDeps(env,http));deps['../../decorations']=load('app/decorations.ts',{...cw,'./http':http});
 const route=load('app/api/decorations/route.ts',deps),bookings=load('app/api/bookings/route.ts',deps);
 const save=(decoration,who)=>{if(who)user=who;return route.POST(request('/api/decorations',{restaurantId:'r',action:'save',decoration}))};
 // Owner adds "Marry me"; bad input and strangers are refused.
 let r=await save({name:'Marry me',price:500000,description:'Gullar va shamlar'});assert.equal(r.status,200);let list=(await r.json()).decorations;assert.equal(list.length,1);const marry=list[0];
 assert.equal((await save({name:'X',price:1000})).status,400,'name too short');assert.equal((await save({name:'Sharlar',price:-5})).status,400,'negative price');
 r=await save({id:marry.id,name:'Marry me',price:450000,description:''});assert.equal((await r.json()).decorations[0].price,450000,'edit keeps the id');
 assert.equal((await save({name:'Sharlar',price:150000},{userId:'stranger',role:'customer'})).status,403,'only the restaurant');
 user={userId:'owner',role:'restaurant_owner'};await save({name:'Tug‘ilgan kun',price:200000});
 r=await route.GET(new Request('https://t/api/decorations?restaurantId=r'));assert.deepEqual((await r.json()).decorations.map(d=>d.name),['Marry me','Tug‘ilgan kun'],'public list for the booking form');
 // Booking with a decoration: one more line, part of the deposit.
 user={userId:'guest',role:'customer'};db.exec("INSERT INTO accounts(id,email,name,created_at) VALUES ('guest','g@x','G','now')");
 const date=new Date(Date.now()+3*86400000).toISOString().slice(0,10),book=extra=>bookings.POST(request('/api/bookings',{restaurantId:'r',date,slot:'19:00',endSlot:'21:00',tableNumber:1,guests:2,phone:'+998901234567',...extra}));
 r=await book({decorationId:'missing'});assert.equal(r.status,409,'unknown decoration');
 r=await book({decorationId:marry.id,preorderItems:[{id:'dish',quantity:2}]});assert.equal(r.status,201);const res=await r.json();
 const row=db.prepare('SELECT preorder_items,preorder_total FROM bookings WHERE id=?').get(res.id),items=JSON.parse(row.preorder_items);
 assert.deepEqual(items.map(i=>[i.name,i.price,i.quantity]),[['Plov',45000,2],['🎀 Marry me',450000,1]]);assert.equal(row.preorder_total,540000);
 assert.equal(res.deposit.amount,540000,'deposit = dishes + decoration (within 100 000–600 000)');
 // The restaurant's Telegram card names the decoration.
 const telegram=deps['../../telegram'];assert.match(telegram.bookingText({...db.prepare('SELECT * FROM bookings WHERE id=?').get(res.id),restaurant_name:'Real'}),/🎀 <b>Dekoratsiya:<\/b> Marry me · 450 000 so‘m/);
 // Removing it: owner only.
 user={userId:'owner',role:'restaurant_owner'};r=await route.POST(request('/api/decorations',{restaurantId:'r',action:'delete',id:marry.id}));assert.deepEqual((await r.json()).decorations.map(d=>d.name),['Tug‘ilgan kun']);
 console.log('PASS decorations: owner-only list (validate, edit, delete), public list, booking line + deposit, restaurant Telegram card');
})().catch(e=>{console.error(e);process.exit(1)});
