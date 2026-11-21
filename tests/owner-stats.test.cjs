const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load}=require('./harness.cjs');
// 📊 Owner analytics: only the owner's own restaurant, period filter, revenue = paid advances + completed
// orders, confirmed counts, top dishes from orders and pre-orders, public rating and latest reviews; empty state.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return {sql,bind(...a){args=a;return this},first:async()=>db.prepare(sql).get(...args),all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 const env={DB},cf={'cloudflare:workers':{env}};let who=null;
 const http=load('app/http.ts',cf),ps=load('app/platform-stats.ts',{...cf,'./review-rules':load('app/review-rules.ts',{})});
 const route=load('app/api/manage/stats/route.ts',{...cf,'../../../access':{identity:async()=>who},'../../../http':http,'../../../review-rules':load('app/review-rules.ts',{}),'../../../platform-stats':ps});
 const adminRoute=load('app/api/admin/stats/route.ts',{'../../../access':{identity:async()=>who},'../../../http':http,'../../../platform-stats':ps});
 const get=async(qs='')=>{const r=await route.GET(new Request('https://x.test/api/manage/stats'+qs));return {status:r.status,body:await r.json()}};
 const now=new Date().toISOString(),day=ms=>new Date(ms+5*3600000).toISOString().slice(0,10),today=day(Date.now()),old=day(Date.now()-10*86400000);
 for(const [id,role] of [['o1','restaurant_owner'],['o2','restaurant_owner'],['c1','customer'],['c2','customer']])db.prepare("INSERT INTO accounts(id,email,name,role,created_at) VALUES (?,?,?,?,?)").run(id,id+'@x.uz',id==='c1'?'Aziz Karimov':id,role,now);
 db.prepare("INSERT INTO restaurants(id,name,owner_id,status,tables,floors,booking_open,booking_close) VALUES ('r1','Osh Markazi','o1','active',5,1,'09:00','23:00')").run();
 db.prepare("INSERT INTO restaurants(id,name,owner_id,status,tables,floors,booking_open,booking_close) VALUES ('r2','Boshqa','o2','active',5,1,'09:00','23:00')").run();
 who={userId:'c1',role:'customer'};assert.deepEqual((await get()).body.restaurants,[],'a customer has no restaurant');
 who={userId:'o1',role:'restaurant_owner'};let s=(await get()).body;
 assert.equal(s.restaurant.id,'r1');assert.equal(s.revenue.total,0);assert.equal(s.count.total,0);assert.equal(s.top.length,0);assert.equal(s.rating.average,null);assert.equal(s.reviews.length,0);
 assert.equal((await get('?restaurantId=r2')).body.restaurant.id,'r1','another owner\'s restaurant is never shown');
 const bk=(id,date,status,items,dep='not_required')=>db.prepare("INSERT INTO bookings(id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at,preorder_items,preorder_total,deposit_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)").run(id,'r1','c1',date,'19:00','21:00',Number(id.slice(1)),2,'+998901112233',status,now,JSON.stringify(items),0,dep);
 bk('b1',today,'confirmed',[{id:'m1',name:'Osh',price:45000,quantity:2}],'p2p_paid');db.prepare("INSERT INTO app_settings(key,value,updated_at,updated_by) VALUES ('p2p:b1',?,?, 't')").run(JSON.stringify({amount:90000,total:90000,paid:50000,until:0,createdAt:0}),now);
 bk('b2',today,'pending',[]);bk('b3',today,'cancelled',[{id:'m1',name:'Osh',price:45000,quantity:9}]);bk('b4',old,'completed',[{id:'m2',name:'Somsa',price:12000,quantity:5}]);
 const ord=(id,status,items,total,at=now)=>db.prepare("INSERT INTO orders(id,restaurant_id,user_id,items,total,phone,status,created_at,fulfillment,delivery_address,delivery_fee) VALUES (?,?,?,?,?,?,?,?,?,?,?)").run(id,'r1','c1',JSON.stringify(items),total,'+998901112233',status,at,'delivery','Registon 5',15000);
 ord('x1','completed',[{id:'m1',name:'Osh',price:45000,quantity:1},{id:'m3',name:'Choy',price:5000,quantity:3}],75000);ord('x2','pending',[{id:'m3',name:'Choy',price:5000,quantity:1}],20000);ord('x3','completed',[{id:'m2',name:'Somsa',price:12000,quantity:2}],39000,new Date(Date.now()-20*86400000).toISOString());
 db.prepare("INSERT INTO reviews(id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('v1','r1','c1',5,'Zo‘r osh!',?,?)").run(now,now);
 db.prepare("INSERT INTO reviews(id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('v2','r1','c2',4,'Yaxshi',?,?)").run(now,now);
 s=(await get('?period=today')).body;
 assert.equal(s.revenue.deposits,50000,'approved transfer counted');assert.equal(s.revenue.orders,75000,'completed order counted');assert.equal(s.revenue.total,125000);
 assert.equal(s.count.bookings,1);assert.equal(s.count.orders,1);assert.equal(s.count.total,2);assert.equal(s.count.pending,2);
 assert.deepEqual(JSON.parse(JSON.stringify(s.top.map(t=>[t.name,t.quantity,t.revenue]))),[['Choy',4,20000],['Osh',3,135000]],'cancelled bookings not counted; ranked by quantity');
 assert.equal(s.rating.average,4.5);assert.equal(s.rating.count,2);assert.equal(s.reviews[0].name.length>0,true);
 s=(await get('?period=month')).body;assert.equal(s.revenue.orders,114000,'30 days include the older order');assert.equal(s.count.bookings,2);assert.ok(s.top.some(t=>t.name==='Somsa'&&t.quantity===7));
 s=(await get('?period=week')).body;assert.equal(s.count.bookings,1,'10-day-old booking outside the week');
 // 🏆 Ranking: r1 has 2 served orders (b1 confirmed today, x1 completed, x3 completed, b4 completed) and 4.5★; r2 none.
 s=(await get()).body;assert.equal(s.leaderboard.mine,1);assert.equal(s.leaderboard.top[0].name,'Osh Markazi');assert.equal(s.leaderboard.total,2);
 // Admin: combined figures and every restaurant ranked; owners are refused.
 assert.equal((await adminRoute.GET(new Request('https://x.test/api/admin/stats'))).status,403);
 who={userId:'a1',role:'admin'};let a=await (await adminRoute.GET(new Request('https://x.test/api/admin/stats?period=month'))).json();
 assert.equal(a.totals.revenue,50000+114000);assert.equal(a.totals.bookings,2);assert.equal(a.restaurants.length,2);assert.equal(a.restaurants[0].id,'r1');assert.equal(a.restaurants[0].rank,1);assert.equal(a.restaurants[0].periodRevenue,164000);assert.equal(a.restaurants[1].periodOrders,0);
 who=null;assert.equal((await get()).status,401);
 console.log('PASS owner stats: own restaurant only, today/week/month, revenue = paid advances + completed orders, counts, top dishes, rating & reviews, empty state, Top-3 + own rank, admin platform totals and ranking');
})().catch(e=>{console.error(e);process.exitCode=1});
