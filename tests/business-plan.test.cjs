const assert=require('node:assert/strict'),{load}=require('./harness.cjs');
// Investor business plan: budget adds up to exactly $15 000 = 192 000 000 so'm, the target forecast
// pays back within 6 months, every requested section is in the document, and only the admin opens it.
(async()=>{
 const bp=load('app/business-plan.ts',{});
 const total=bp.BUDGET.reduce((s,b)=>s+b.usd,0);assert.equal(total,15000);assert.equal(total*bp.USD_RATE,192000000);
 for(const b of bp.BUDGET)assert.equal(b.items.reduce((s,[,v])=>s+v,0),b.usd,b.name);
 assert.equal(bp.BUDGET.map(b=>b.usd).join(),'4800,2700,2000,3800,1700');
 const payback=bp.TARGET.find(r=>r.cumulative>=0).m;assert.ok(payback<=6,'target payback within 6 months: '+payback);
 assert.ok(bp.CONSERVATIVE.find(r=>r.cumulative>=0).m>payback,'conservative scenario is slower');
 const html=bp.businessPlanHtml(new Date('2026-10-24T09:00:00Z'));
 for(const s of ['AI Smart Vision','3 soniya','15 soniyada','Multi-camera','AI Service Timer','7 daqiqa','2 soatlik bekor qilish','50 000 so‘m','100 000 so‘m','150 000 so‘m','Raqamli chek va QR','Call AI','Mijoz AI roboti','3% platformaga','Kuryer','Gulchi','Start','Business','Premium','399 000','699 000','$4,800','$2,700','$2,000','$3,800','$1,700','$15,000','192 000 000','App Store','Google Play','Vapi','12 oylik moliyaviy prognoz','Pitch nutqi','7 ta qiyin savol','PDF yuklab olish / Chop etish'])assert.ok(html.includes(s),'missing: '+s);
 assert.equal((html.split('<ol class="qa">')[1].split('</ol>')[0].match(/<li>/g)||[]).length,7,'seven Q&A');assert.equal((html.match(/<section class="page/g)||[]).length,8);
 assert.ok(!/<script>/.test(html),'no inline script (CSP)');
 let who=null;const route=load('app/business-plan/route.ts',{'../access':{identity:async()=>who},'../business-plan':bp});
 let r=await route.GET();assert.equal(r.status,302);assert.equal(r.headers.get('location'),'/#/login');
 who={userId:'c',role:'customer'};assert.equal((await route.GET()).status,403);
 who={userId:'a',role:'admin'};r=await route.GET();assert.equal(r.status,200);assert.ok(r.headers.get('cache-control').includes('no-store'));assert.ok(r.headers.get('x-robots-tag').includes('noindex'));assert.ok((await r.text()).includes('RestaurantFoods'));
 console.log('PASS business plan: $15 000 budget (5 lines, items add up), payback ≤ 6 months (target), all sections, admin only, noindex');
})().catch(e=>{console.error(e);process.exitCode=1});
