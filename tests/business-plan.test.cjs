const assert=require('node:assert/strict'),{load}=require('./harness.cjs');
// Admin "Biznes-reja (PDF)": the same sections as /investors (app/plan-content.ts), word for word, in UZ / RU / EN;
// the live MVP pricing (100 000 so'm pilot → Start / Business / Premium later), the Click + receipt + anti-spam
// workflow (no card binding / penalty fee), Telegram instead of SMS, the 4-phase roadmap; admin only, noindex.
(async()=>{
 const content=load('app/plan-content.ts',{});
 const bp=load('app/business-plan.ts',{'./plan-content':content});const inv=load('app/investors.ts',{'./plan-content':content});
 const body=(html,open,close)=>[...html.matchAll(new RegExp(open+'([\\s\\S]*?)'+close,'g'))].map(m=>m[1]);
 const need={
  uz:['100 000 so‘m / oy','Amanda','Start','Business','Premium','199 000 so‘m','399 000 so‘m','699 000 so‘m','20–30+ faol restoran','Click Business','total_amount','paid_amount','remaining_amount','Telegram’da tekshirish','anti-spam','0 so‘m','Eskiz.uz','$0','3D virtual turi','Bir nechta stolni guruh bilan','3D menyu','Korzinka','Tungi / kunduzgi','UZ | RU | EN','1-bosqich — Pilot','2-bosqich — Avtomatlashtirish','3-bosqich — Kengayish','4-bosqich — Ekotizim','R-Keeper, iiko, Poster','Telegram Mini App','3–5% komissiya','Toshkent','Supabase','Cloudflare','React','3 000 000 so‘m'],
  ru:['100 000 сум / мес','Пилот','Фаза 1 — Пилот','Фаза 4 — Экосистема','Click Business','remaining_amount','Eskiz.uz','Корзина','Тёмная / светлая','R-Keeper'],
  en:['100 000 UZS / month','Phase 1 — Pilot','Phase 2 — Automation','Phase 3 — Scale','Phase 4 — Ecosystem','1-tap Click Business','Receipt check in Telegram','Automated anti-spam blocking','Eskiz.uz','Multi-table group booking','Interactive 3D menu','Cart (Korzinka)','Dark / light mode'],
 };
 for(const lang of ['uz','ru','en']){
  const pdf=bp.businessPlanHtml(new Date('2026-11-21T09:00:00Z'),lang),page=inv.investorsHtml(lang);
  assert.ok(pdf.includes(`<html lang="${lang}"`)&&page.includes(`<html lang="${lang}"`),lang);
  for(const s of need[lang])assert.ok(pdf.includes(s),lang+' pdf missing: '+s);
  // The six sections are the same markup in both documents.
  const a=body(pdf,'<section class="page plan-page">','</section>'),b=body(page,'<section>','</section>');
  assert.equal(a.length,6,lang+' six sections');assert.deepEqual(JSON.stringify(a),JSON.stringify(b),lang+': page and PDF match');
  assert.ok(!/avtomatik jarima|50 000 so‘m|150 000 so‘m|\$20[ ,]000|256 000 000/.test(a.join('')+pdf.split('<main')[1]),lang+': no penalty fee or old $20 000 plan');
  assert.ok(!/<script>/.test(pdf),'no inline script (CSP)');assert.ok(!/ style="/.test(pdf)&&!/ style="/.test(page),'no inline styles (CSP)');
 }
 assert.equal(bp.businessPlanHtml(new Date(),'xx').includes('<html lang="uz"'),true,'unknown language → uz');
 // The older plan stays in the code (not served).
 assert.ok(bp.legacyBusinessPlanHtml(new Date('2026-10-24T09:00:00Z')).includes('$20 000'));
 let who=null;const route=load('app/business-plan/route.ts',{'../access':{identity:async()=>who},'../business-plan':bp});
 let r=await route.GET();assert.equal(r.status,302);assert.equal(r.headers.get('location'),'/#/login');
 who={userId:'c',role:'customer'};assert.equal((await route.GET()).status,403);
 who={userId:'a',role:'admin'};r=await route.GET(new Request('https://x.test/business-plan?lang=ru'));assert.equal(r.status,200);assert.ok(r.headers.get('cache-control').includes('no-store'));assert.ok(r.headers.get('x-robots-tag').includes('noindex'));const t=await r.text();assert.ok(t.includes('<html lang="ru"')&&t.includes('RestaurantFoods'));
 console.log('PASS business plan: same 6 sections as /investors in UZ/RU/EN, pilot pricing, Click/receipt/anti-spam, roadmap, admin only, noindex');
})().catch(e=>{console.error(e);process.exitCode=1});
