const assert=require('node:assert/strict'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite'),{load,request,integrationDeps}=require('./harness.cjs');
// Business/Premium growth features: plans, peak deposit (charged from the card, counted on the
// receipt), table merging, birthday promo codes, staff roles (hostess sees no money), AI weekly
// report quota, service timer alerts, VIP dossier and happy-hour discounts.
(async()=>{
 const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const DB={prepare(sql){let args=[];return{bind(...v){args=v;return this},first:async()=>db.prepare(sql).get(...args)||null,all:async()=>({results:db.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})}}};
 DB.batch=async ops=>{db.exec('BEGIN');try{const r=[];for(const op of ops)r.push(await op.run());db.exec('COMMIT');return r}catch(e){db.exec('ROLLBACK');throw e}};
 const today=new Date(Date.now()+5*3600000).toISOString().slice(0,10),NOW=Date.parse(today+'T12:00:00+05:00');
 class FixedDate extends Date{constructor(...a){super(...(a.length?a:[NOW]))}static now(){return NOW}}
 const env={DB,PAYME_MERCHANT_ID:'m',PAYME_KEY:'k',PAYME_SUBSCRIBE:'true',TELEGRAM_BOT_TOKEN:'bot:t',SUPABASE_URL:'https://x.supabase.co',SUPABASE_ANON_KEY:'anon'};
 const tg=[],pay=[];
 const fetch=async(url,init)=>{url=String(url);
  if(url.includes('paycom')){const b=JSON.parse(init.body);pay.push(b);if(b.method==='receipts.create')return Response.json({result:{receipt:{_id:'rc'+pay.length}}});if(b.method==='receipts.pay')return Response.json({result:{receipt:{_id:b.params.id,state:4}}});return Response.json({result:{}})}
  if(url.includes('restaurantfoods-ai'))return new Response('event: delta\ndata: {"text":"Osh eng ko‘p sotildi. "}\n\nevent: delta\ndata: {"text":"Juma 19:00 eng band."}\n\nevent: done\ndata: {}\n\n',{headers:{'Content-Type':'text/event-stream'}});
  tg.push({method:url.split('/').pop(),body:JSON.parse(init.body)});return Response.json({ok:true,result:{}})};
 const extras={fetch,Date:FixedDate,FormData,Blob};
 const cf={'cloudflare:workers':{env}},http=load('app/http.ts',cf),noLimit={...http,throttle:async()=>{}};
 const telegram=load('app/telegram.ts',{...cf,'./otp-store':load('app/otp-store.ts',cf)},{fetch});
 const plans=load('app/plans.ts',{...cf,'./http':http});
 const growth=load('app/growth.ts',{...cf,'./plans':plans,'./telegram':telegram},extras);
 const staffMod=load('app/staff.ts',{...cf,'./http':http,'./plans':plans});
 const rules=load('app/booking-rules.ts',{'./http':http},{Date:FixedDate});
 const cards=load('app/payme-cards.ts',{...cf,'./http':http},extras);
 let user={userId:'c1',role:'customer'};
 const access={identity:async()=>user,privateHeaders:{}};
 const base=integrationDeps(env,http,'../../',extras),deep=integrationDeps(env,http,'../../../',extras);
 const deps={...cf,...base,'../../access':access,'../../http':noLimit,'../../geo':load('app/geo.ts',{'./http':http}),'../../table-rules':load('app/table-rules.ts',{'./http':http}),'../../booking-rules':rules,'../../booking-preorder':load('app/booking-preorder.ts',{'./http':http}),'../../growth':growth,'../../plans':plans,'../../payme-cards':cards,'../../staff':staffMod,'../../account-admin':{audit:()=>DB.prepare('SELECT 1')},'../../demo-drinks':load('app/demo-drinks.ts',{}),'../../auth-service':{authConfig:()=>({url:'',key:''})}};
 const bookings=load('app/api/bookings/route.ts',deps,extras),manage=load('app/api/manage/route.ts',deps,extras),tables=load('app/api/tables/route.ts',deps,extras),receipt=load('app/api/bookings/receipt/route.ts',{...cf,'../../../access':access,'../../../http':http,'../../../booking-pass':load('app/booking-pass.ts',cf)});
 const ddeps={...cf,...deep,'../../../access':access,'../../../http':noLimit,'../../../growth':growth,'../../../plans':plans,'../../../staff':staffMod,'../../../sse':load('app/sse.ts',{}),'../../../auth-service':{accessToken:async()=>'user-token',authConfig:()=>({url:'https://x.supabase.co',key:'anon',proxy:''})},'../../../booking-pass':load('app/booking-pass.ts',cf),'../../../birthday':load('app/birthday.ts',{...cf,'./plans':plans,'./telegram':telegram},extras)};
 const growthRoute=load('app/api/manage/growth/route.ts',ddeps,extras),checkin=load('app/api/manage/checkin/route.ts',ddeps,extras),birthday=load('app/birthday.ts',{...cf,'./plans':plans,'./telegram':telegram},extras);
 const paid=new Date(NOW+30*86400000).toISOString();
 db.exec("INSERT INTO accounts(id,email,name,created_at,role,telegram_chat_id,birth_date) VALUES ('owner','o@x','Owner','now','restaurant_owner',NULL,NULL),('c1','c1@x','Aziz Karimov','now','customer','501',NULL),('c2','c2@x','Bek','now','customer','502',NULL),('h1','host@x','Hostess Nigora','now','customer',NULL,NULL),('w1','waiter@x','Waiter','now','customer',NULL,NULL),('m1','man@x','Manager','now','customer','777m',NULL)");
 db.prepare("INSERT INTO restaurants(id,name,owner_id,status,tables,floors,booking_open,booking_close,plan,paid_until,telegram_chat_id) VALUES ('biz','Biz Osh','owner','active',6,1,'08:00','23:00','business',?,'900'),('pre','Prem Saroy','owner','active',6,1,'08:00','23:00','premium',?,'901'),('st','Start Kafe','owner','active',6,1,'08:00','23:00','start',?,NULL)").run(paid,paid,paid);
 for(const r of ['biz','pre','st'])db.exec(`INSERT INTO restaurant_tables(id,restaurant_id,number,seats,x,y) VALUES ('${r}1','${r}',1,4,20,30),('${r}2','${r}',2,4,35,30),('${r}3','${r}',3,2,80,80),('${r}4','${r}',4,6,80,20)`);
 db.exec("INSERT INTO payment_cards(id,user_id,token,masked,expire,created_at) VALUES ('pc','c1','tok-c1','8600****','03/99','now'),('pc2','c2','tok-c2','8600****','03/99','now')");

 // Plans: Start has none of it; Business the shared set; Premium everything.
 const st=s=>plans.planState({plan:s,paid_until:paid},NOW).features;
 assert.equal(st('start').peakDeposit,false);for(const f of ['peakDeposit','tableMerge','birthdayCrm','staffAccounts','aiReports'])assert.equal(st('business')[f],true,f);for(const f of ['serviceTimer','vipGuests','happyHours','tableView'])assert.equal(st('business')[f],false,f),assert.equal(st('premium')[f],true,f);
 // Pure helpers.
 const rule={days:'5,6',date:'',start:'18:00',end:'23:00',amount:150000};
 const fri=(()=>{let d=new Date(NOW);while(d.getUTCDay()!==5)d=new Date(d.getTime()+86400000);return new Date(d.getTime()+5*3600000).toISOString().slice(0,10)})();
 assert.equal(growth.peakDepositFor([rule],fri,'19:00').amount,150000);assert.equal(growth.peakDepositFor([rule],fri,'17:30'),null);assert.equal(growth.peakDepositFor([{...rule,days:'',date:'2026-12-31',amount:300000}],'2026-12-31','20:00').amount,300000);
 const plan=[{number:1,floor:1,seats:4,x:20,y:30},{number:2,floor:1,seats:4,x:35,y:30},{number:3,floor:1,seats:2,x:80,y:80},{number:4,floor:1,seats:6,x:80,y:20}];
 assert.equal(JSON.stringify(growth.mergeSuggestions(plan,new Set(),8).map(p=>p.tables)),'[[1,2]]','only neighbours');assert.equal(growth.mergeSuggestions(plan,new Set([2]),8).length,0);
 assert.deepEqual({...growth.happyState({happy_enabled:1,happy_threshold:70,happy_percent:15},true,10,2)},{active:true,percent:15,freePercent:80});assert.equal(growth.happyState({happy_enabled:1,happy_threshold:70,happy_percent:15},true,10,4).active,false);

 // 1. Peak deposit: owner sets Friday/Saturday 18–23 → 150 000; the bound card pays it; the receipt counts it.
 user={userId:'owner',role:'restaurant_owner'};const g=p=>growthRoute.POST(request('/api/manage/growth',p));
 assert.equal((await g({action:'peak_save',restaurantId:'st',days:[5,6],start:'18:00',end:'23:00',amount:150000})).status,402,'Start: no peak deposit');
 assert.equal((await g({action:'peak_save',restaurantId:'biz',days:[5,6],start:'18:00',end:'23:00',amount:150000,label:'Hafta oxiri'})).status,201);
 const book=(who,r,table,date,slot,endSlot,extra={})=>{user={userId:who,role:'customer'};return bookings.POST(request('/api/bookings',{restaurantId:r,date,slot,endSlot,tableNumber:table,guests:2,phone:'+998901234567',acceptPenalty:true,...extra}))};
 pay.length=0;let r=await book('c1','biz',1,fri,'19:00','20:00');assert.equal(r.status,201);let res=await r.json();assert.equal(res.deposit.amount,150000);assert.equal(res.deposit.paid,true);assert.equal(pay.find(p=>p.method==='receipts.create').params.amount,15000000);
 const peakBooking=res.id;r=await receipt.GET(new Request('https://test/api/bookings/receipt?id='+peakBooking));let rc=await r.json();assert.equal(rc.deposit.amount,150000);assert.equal(rc.deposit.status,'paid');
 r=await book('c1','biz',2,fri,'13:00','14:00');res=await r.json();assert.equal(res.deposit.amount,100000,'outside peak: the online minimum 100 000');assert.equal(res.deposit.peak,false);

 // 2. Table merging: 1+2 (neighbours) for 8 guests; the merged table is busy for others; far tables refused; Start refused.
 const tomorrow=new Date(NOW+5*3600000+86400000).toISOString().slice(0,10);
 r=await book('c2','biz',1,tomorrow,'19:00','21:00',{guests:8,mergeTable:2});assert.equal(r.status,201);assert.equal((await r.json()).mergedTable,2);
 assert.equal((await book('c1','biz',2,tomorrow,'20:00','21:00')).status,409,'merged table is taken');
 assert.equal((await book('c1','biz',3,tomorrow,'19:00','20:00',{guests:7,mergeTable:4})).status,400,'not neighbours');
 assert.equal((await book('c1','st',1,tomorrow,'19:00','20:00',{guests:8,mergeTable:2})).status,402);
 assert.equal((await book('c1','biz',4,tomorrow,'19:00','20:00',{guests:8})).status,400,'8 do not fit table 4 alone');
 user={userId:'c1',role:'customer'};let plan2=await (await tables.GET(new Request('https://test/api/tables?restaurantId=biz&date='+tomorrow))).json();assert.ok(plan2.bookings.some(b=>b.table_number===2&&b.slot==='19:00'),'merged table shown busy');assert.equal(plan2.features.tableMerge,true);assert.equal(plan2.peak.length,1);

 // 3. Birthday CRM: 3 days before, a promo code from a restaurant the customer visited, once.
 user={userId:'owner',role:'restaurant_owner'};assert.equal((await g({action:'settings',restaurantId:'biz',birthdayPercent:20})).status,200);
 const bday=new Date(NOW+5*3600000+3*86400000).toISOString().slice(5,10);db.prepare("UPDATE accounts SET birth_date=? WHERE id='c1'").run('1995-'+bday);db.exec("UPDATE bookings SET status='confirmed' WHERE id='"+peakBooking+"'");
 tg.length=0;let out=await birthday.runBirthdays(NOW,true);assert.equal(out.sent,1);const msg=tg.find(x=>x.body.chat_id==='501');assert.ok(msg.body.text.includes('20% chegirma')&&msg.body.text.includes('Biz Osh'));
 const code=/(BD-[A-Z0-9]{6})/.exec(msg.body.text)[1];assert.equal((await birthday.runBirthdays(NOW,true)).sent,0,'once a year');
 assert.equal((await book('c2','biz',3,tomorrow,'13:00','14:00',{promoCode:code})).status,400,'someone else’s code');
 r=await book('c1','biz',3,tomorrow,'13:00','14:00',{promoCode:code});assert.equal(r.status,201);res=await r.json();assert.deepEqual(res.discount,{percent:20,reason:'birthday'});
 assert.equal((await book('c1','biz',3,tomorrow,'15:00','16:00',{promoCode:code})).status,400,'used once');
 // Flexible gifts: a fixed bonus with a minimum order (Premium restaurant), greeting 3 days before and on the day.
 user={userId:'owner',role:'restaurant_owner'}; assert.equal((await g({action:'settings',restaurantId:'biz',birthdayKind:'gift',birthdayGift:''})).status,400,'gift needs a name');
 assert.equal((await g({action:'settings',restaurantId:'biz',birthdayKind:'bonus'})).status,400);
 assert.equal((await g({action:'settings',restaurantId:'pre',birthdayKind:'amount',birthdayAmount:100000,birthdayMinOrder:300000})).status,200);
 let gs=await (await growthRoute.GET(new Request('https://test/api/manage/growth?restaurantId=pre'))).json();assert.equal(gs.settings.birthdayKind,'amount');assert.equal(gs.settings.birthdayPercent,15,'standard 15%');assert.equal(gs.settings.birthdayEnabled,true);
 db.prepare("UPDATE accounts SET birth_date=? WHERE id='c2'").run('1990-'+bday);db.prepare("INSERT INTO bookings(id,restaurant_id,user_id,date,slot,table_number,guests,phone,status,created_at) VALUES ('old-pre','pre','c2','2026-01-01','12:00',1,2,'+998901112233','completed','now')").run();
 tg.length=0;await birthday.runBirthdays(NOW,true);let m2=tg.filter(x=>x.body.chat_id==='502');assert.equal(m2.length,1);assert.ok(m2[0].body.text.includes('100 000 so‘m bonus')&&m2[0].body.text.includes('300 000 so‘m dan ortiq')&&m2[0].body.text.includes('Prem Saroy'),m2[0].body.text);
 const code2=/(BD-[A-Z0-9]{6})/.exec(m2[0].body.text)[1];
 tg.length=0;await birthday.runBirthdays(NOW+3*86400000,true);m2=tg.filter(x=>x.body.chat_id==='502');assert.equal(m2.length,1,'reminder on the day');assert.ok(m2[0].body.text.includes('muborak')&&m2[0].body.text.includes(code2));
 tg.length=0;await birthday.runBirthdays(NOW+3*86400000,true);assert.equal(tg.filter(x=>x.body.chat_id==='502').length,0,'reminded once');
 user={userId:'c2',role:'customer'};r=await book('c2','pre',3,tomorrow,'13:00','14:00',{promoCode:code2});assert.equal(r.status,201);res=await r.json();assert.equal(JSON.stringify(res.discount),JSON.stringify({percent:0,reason:'birthday',amount:100000,minOrder:300000}));
 let rc2=await (await receipt.GET(new Request('https://test/api/bookings/receipt?id='+res.id))).json();assert.equal(rc2.discount.applied,false,'no dishes: below the minimum');assert.equal(rc2.discount.bonus,100000);assert.equal(rc2.discount.code,code2);db.exec("DELETE FROM deposits WHERE booking_id IN (SELECT id FROM bookings WHERE user_id='c2' AND restaurant_id='pre')");db.exec("DELETE FROM bookings WHERE user_id='c2' AND restaurant_id='pre'");
 const P=load('app/booking-pass.ts',cf);let tt=P.receiptTotals([{name:'Osh',price:200000,quantity:2}],10,{amount:100000,minOrder:300000});assert.equal(tt.discount,100000);assert.equal(tt.serviceFee,30000);assert.equal(tt.total,330000);
 assert.equal(P.receiptTotals([{name:'Osh',price:200000,quantity:2}],0,{amount:100000,minOrder:500000}).discount,0);assert.equal(P.receiptTotals([{name:'Choy',price:20000,quantity:1}],0,{amount:100000}).total,0,'never below zero');
 tt=P.receiptTotals([{name:'Osh',price:100000,quantity:1}],0,{gift:'Bepul bayram torti'});assert.equal(tt.gift,'Bepul bayram torti');assert.equal(tt.total,100000);assert.equal(P.receiptTotals([{name:'Osh',price:100000,quantity:1}],0,15).discount,15000,'old numeric form');
 user={userId:'owner',role:'restaurant_owner'};assert.equal((await g({action:'settings',restaurantId:'biz',birthdayKind:'gift',birthdayGift:'Bepul bayram torti'})).status,200);
 const B=load('app/birthday.ts',{...cf,'./plans':plans,'./telegram':telegram},extras);assert.ok(B.offerText(B.birthdayOffer({birthday_kind:'gift',birthday_gift:'Bepul tort'})).includes('Bepul tort'));assert.equal(B.birthdayOffer({birthday_kind:'gift',birthday_gift:''}).type,'percent');assert.equal(B.birthdayOffer({birthday_percent:0}).percent,15);

 // 4. Staff: owner adds a hostess and a waiter; the hostess sees bookings without money and cannot change them.
 user={userId:'owner',role:'restaurant_owner'};assert.equal((await g({action:'staff_add',restaurantId:'st',email:'host@x',role:'hostess'})).status,402,'Start: no staff');
 user={userId:'owner',role:'restaurant_owner'};assert.equal((await g({action:'staff_add',restaurantId:'biz',email:'HOST@x',role:'hostess'})).status,200);assert.equal((await g({action:'staff_add',restaurantId:'biz',email:'waiter@x',role:'waiter'})).status,200);assert.equal((await g({action:'staff_add',restaurantId:'biz',email:'man@x',role:'manager'})).status,200);
 assert.equal((await g({action:'staff_add',restaurantId:'biz',email:'nobody@x',role:'waiter'})).status,404);
 user={userId:'h1',role:'customer'};let sv=await (await growthRoute.GET(new Request('https://test/api/manage/growth?view=staff&restaurantId=biz'))).json();assert.equal(sv.level,'hostess');assert.ok(sv.bookings.length>0);assert.ok(sv.bookings.every(b=>!('preorder_total' in b)&&!('penalty_amount' in b)),'no money for hostess');assert.deepEqual(sv.orders,[]);assert.equal(sv.finance,null);
 assert.equal((await manage.POST(request('/api/manage',{action:'status',kind:'booking',id:peakBooking,status:'completed'}))).status,403,'hostess cannot change bookings');
 assert.equal((await growthRoute.GET(new Request('https://test/api/manage/growth?view=staff&restaurantId=pre'))).status,403,'other restaurant');
 assert.equal((await g({action:'settings',restaurantId:'biz',birthdayPercent:5})).status,403,'hostess: no settings');
 // Hostess checks a guest in by QR.
 const pass=load('app/booking-pass.ts',cf);const pc=await pass.ensurePassCode(peakBooking,null);db.prepare('UPDATE bookings SET date=? WHERE id=?').run(today,peakBooking);
 r=await checkin.POST(request('/api/manage/checkin',{code:pc}));assert.equal(r.status,200,'hostess may scan');
 user={userId:'w1',role:'customer'};const pending=db.prepare("SELECT id FROM bookings WHERE restaurant_id='biz' AND status='pending' LIMIT 1").get().id;assert.equal((await manage.POST(request('/api/manage',{action:'status',kind:'booking',id:pending,status:'confirmed'}))).status,200,'waiter confirms');
 assert.equal((await manage.POST(request('/api/manage',{action:'status',kind:'booking',id:pending,status:'cancelled'}))).status,403,'waiter cannot cancel (money)');
 user={userId:'m1',role:'customer'};sv=await (await growthRoute.GET(new Request('https://test/api/manage/growth?view=staff&restaurantId=biz'))).json();assert.equal(sv.level,'manager');assert.ok(sv.finance);
 // Staff lose access when the plan drops to Start.
 db.exec("UPDATE restaurants SET plan='start' WHERE id='biz'");assert.equal((await growthRoute.GET(new Request('https://test/api/manage/growth?view=staff&restaurantId=biz'))).status,403);db.exec("UPDATE restaurants SET plan='business' WHERE id='biz'");

 // 5. AI weekly report: numbers + AI text; Business allows 1 per day.
 user={userId:'owner',role:'restaurant_owner'};
 const throttled=new Map();const limited={...http,throttle:async(key,limit)=>{const n=(throttled.get(key)||0)+1;throttled.set(key,n);if(n>limit)throw new http.ApiError(429,'limit')}};
 const growthLimited=load('app/api/manage/growth/route.ts',{...ddeps,'../../../http':limited},extras);
 r=await growthLimited.POST(request('/api/manage/growth',{action:'report',restaurantId:'biz',lang:'uz'}));assert.equal(r.status,200);let rep=await r.json();assert.ok(rep.stats.bookings>=1);assert.equal(rep.ai,true);assert.ok(rep.summary.includes('Osh'));
 r=await growthLimited.POST(request('/api/manage/growth',{action:'report',restaurantId:'biz',lang:'uz'}));assert.equal(r.status,429,'Business: 1 a day');
 for(let i=0;i<3;i++)assert.equal((await growthLimited.POST(request('/api/manage/growth',{action:'report',restaurantId:'pre',lang:'uz'}))).status,200,'Premium: more');
 // AI finance advisor (gpt-4o on the edge): manager+, needs aiReports.
 r=await growthLimited.POST(request('/api/manage/growth',{action:'advisor',restaurantId:'biz',question:'Tushumni qanday oshiramiz?',lang:'uz'}));assert.equal(r.status,200);rep=await r.json();assert.equal(rep.model,'gpt-6.1-sol');assert.ok(rep.answer.includes('Osh'));
 assert.equal((await growthLimited.POST(request('/api/manage/growth',{action:'advisor',restaurantId:'st',question:'Savol bormi?',lang:'uz'}))).status,402,'Start: no advisor');

 // 6. Service timer (Premium): seated 8 min without service -> alert to the owner chat and the manager; serving clears it.
 db.exec("INSERT INTO restaurant_staff(restaurant_id,user_id,role,created_by,created_at) VALUES ('pre','m1','manager','owner','now')");
 const seated=new Date(NOW-8*60000).toISOString();db.prepare("INSERT INTO table_live_status(restaurant_id,table_number,status,source,updated_at,since,seated_at) VALUES ('pre',2,'occupied','camera',?,?,?)").run(new Date(NOW).toISOString(),seated,seated);
 tg.length=0;assert.equal(JSON.stringify(await growth.checkServiceTimer('pre',NOW)),'[2]');assert.ok(tg.some(x=>x.body.chat_id==='901'&&x.body.text.includes('2-stolda mijoz 8 daqiqadan beri kutmoqda')));assert.ok(tg.some(x=>x.body.chat_id==='777m'),'manager told');
 assert.equal(JSON.stringify(await growth.checkServiceTimer('pre',NOW+60000)),'[]','alerted once');assert.equal(JSON.stringify(await growth.checkServiceTimer('biz',NOW)),'[]','Business: no timer');
 user={userId:'m1',role:'customer'};let al=await (await growthRoute.GET(new Request('https://test/api/manage/growth?view=alerts&restaurantId=pre'))).json();assert.equal(al.alerts.length,1);
 db.exec("UPDATE table_live_status SET status='cleaning' WHERE restaurant_id='pre' AND table_number=2");await growth.trackSeats('pre',[2]);
 assert.ok(db.prepare("SELECT served_at FROM table_live_status WHERE restaurant_id='pre' AND table_number=2").get().served_at,'waiter at the table = served');
 al=await (await growthRoute.GET(new Request('https://test/api/manage/growth?view=alerts&restaurantId=pre'))).json();assert.equal(al.alerts.length,0,'resolved');
 // Live feed for the staff chime: new pending bookings of the last 6 hours; a hostess sees it but cannot resolve.
 db.prepare("INSERT INTO bookings(id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('feed1','pre','c9','2099-01-01','19:00','21:00',3,2,'+998901112233','pending',?),('feed0','pre','c9','2099-01-01','12:00','14:00',4,2,'+998901112233','pending',?)").run(new Date(NOW-60000).toISOString(),new Date(NOW-7*3600000).toISOString());
 db.exec("INSERT INTO restaurant_staff(restaurant_id,user_id,role,created_by,created_at) VALUES ('pre','h1','hostess','owner','now')");
 user={userId:'h1',role:'customer'};al=await (await growthRoute.GET(new Request('https://test/api/manage/growth?view=alerts&restaurantId=pre'))).json();
 assert.deepEqual(al.bookings.map(b=>b.id),['feed1'],'only the last 6 hours');assert.equal(al.canResolve,false,'hostess: view only');
 user={userId:'m1',role:'customer'};assert.equal((await (await growthRoute.GET(new Request('https://test/api/manage/growth?view=alerts&restaurantId=pre'))).json()).canResolve,true);
 db.exec("DELETE FROM deposits WHERE booking_id IN (SELECT id FROM bookings WHERE id IN ('feed0','feed1'))");db.exec("DELETE FROM bookings WHERE id IN ('feed0','feed1')");

 // 7. VIP dossier (Premium): 4 visits -> VIP with favourite dishes and table; shown at QR check-in.
 for(let i=0;i<4;i++)db.prepare("INSERT INTO bookings(id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at,preorder_items,preorder_total) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)").run('v'+i,'pre','c2','2026-0'+(i+1)+'-10','19:00','',4,2,'+998901234567','completed','now',JSON.stringify([{name:'Osh',quantity:2},{name:i%2?'Somsa':'Choy',quantity:1}]),100000);
 const dossier=await growth.guestDossier('pre','c2');assert.equal(dossier.vip,true);assert.equal(dossier.visits,4);assert.equal(dossier.favoriteTable,4);assert.equal(dossier.favorites[0].name,'Osh');assert.ok(dossier.note.includes('4-stol'));
 assert.equal((await growth.vipUsers('pre')).has('c2'),true);
 // 8. Happy hours (Premium): hall mostly empty -> discount on bookings within 3 hours; banner data on the plan.
 user={userId:'owner',role:'restaurant_owner'};assert.equal((await g({action:'settings',restaurantId:'biz',happyEnabled:true})).status,402,'Business: no happy hours');assert.equal((await g({action:'settings',restaurantId:'pre',happyEnabled:true,happyThreshold:70,happyPercent:15})).status,200);
 db.exec("DELETE FROM table_live_status");user={userId:'c1',role:'customer'};let pl=await (await tables.GET(new Request('https://test/api/tables?restaurantId=pre&date='+today))).json();assert.deepEqual(pl.happy,{percent:15,freePercent:100});
 r=await book('c1','pre',1,today,'13:30','14:30');assert.deepEqual((await r.json()).discount,{percent:15,reason:'happy_hours'});
 r=await book('c1','pre',3,tomorrow,'19:00','20:00');assert.equal((await r.json()).discount,null,'not within 3 hours');
 // Deleting a restaurant: owner only, typed name, refused while bookings are open; hidden afterwards, history kept.
 user={userId:'c1',role:'customer'};assert.equal((await manage.POST(request('/api/manage',{action:'restaurant_delete',id:'st',confirm:'Start Kafe'}))).status,403,'customers cannot');
 user={userId:'owner',role:'restaurant_owner'};assert.equal((await manage.POST(request('/api/manage',{action:'restaurant_delete',id:'st',confirm:'Boshqa'}))).status,400,'name must match');
 db.prepare("INSERT INTO bookings(id,restaurant_id,user_id,date,slot,table_number,guests,phone,status,created_at) VALUES ('st-open','st','c2',?,'12:00',1,2,'+998901112233','confirmed','now')").run(tomorrow);
 r=await manage.POST(request('/api/manage',{action:'restaurant_delete',id:'st',confirm:'start kafe'}));assert.equal(r.status,409,'open bookings block');assert.ok((await r.json()).error.includes('1 ta faol bron'));
 db.exec("UPDATE bookings SET status='completed' WHERE id='st-open'");
 r=await manage.POST(request('/api/manage',{action:'restaurant_delete',id:'st',confirm:'  Start Kafe '}));assert.equal(r.status,200);
 assert.equal(db.prepare("SELECT status FROM restaurants WHERE id='st'").get().status,'deleted');assert.ok(db.prepare("SELECT 1 FROM bookings WHERE id='st-open'").get(),'history kept');
 const listed=await (await manage.GET(new Request('https://test/api/manage'))).json();assert.ok(!listed.restaurants.some(x=>x.id==='st'),'not in dashboard');
 assert.equal((await manage.POST(request('/api/manage',{action:'restaurant_delete',id:'st',confirm:'Start Kafe'}))).status,403,'already gone');
 // After deleting their only restaurant an owner can be given another role (deleted ones do not count).
 db.exec("INSERT INTO accounts(id,email,name,created_at,role) VALUES ('o2','o2@x','Owner Two','now','restaurant_owner')");db.exec("INSERT INTO restaurants(id,name,owner_id,status) VALUES ('gone','Gone','o2','deleted')");
 const accountAdmin=load('app/account-admin.ts',{...cf,'./http':http});await accountAdmin.assignRole('admin','o2','courier');assert.equal(db.prepare("SELECT role FROM accounts WHERE id='o2'").get().role,'courier');
 console.log('PASS growth: plan split, peak deposit (card, receipt), table merging, birthday promo once, staff levels (hostess no money), AI report quota, service timer alerts, VIP dossier, happy hours');
})().catch(e=>{console.error(e);process.exitCode=1});
