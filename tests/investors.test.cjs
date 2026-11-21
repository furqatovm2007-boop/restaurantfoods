const assert=require('node:assert/strict'),{load}=require('./harness.cjs');
// /investors: public, strict CSP (no inline scripts or styles), UZ / RU / EN (?lang=), the live MVP pricing and
// roadmap from app/plan-content.ts, the print / PDF button.
(async()=>{
 const content=load('app/plan-content.ts',{});
 const page=load('app/investors/route.ts',{'../investors':load('app/investors.ts',{'./plan-content':content})});
 for(const [lang,must] of [['uz',['100 000 so‘m / oy','📥 PDF shaklida yuklab olish / Chop etish','prognoz','1-bosqich — Pilot']],['ru',['100 000 сум / мес','📥 Скачать PDF / Печать','Фаза 2 — Автоматизация']],['en',['100 000 UZS / month','📥 Download PDF / Print','Phase 3 — Scale']]]){
  const r=await page.GET(new Request('https://x.test/investors?lang='+lang));assert.equal(r.status,200);
  const csp=r.headers.get('content-security-policy');assert.match(csp,/script-src 'self'/);assert.match(csp,/style-src 'self'/);assert.doesNotMatch(csp,/unsafe-inline/);
  const html=await r.text();assert.ok(html.includes(`<html lang="${lang}"`));
  assert.ok(!/<script>|<script [^>]*>[^<]/.test(html.replace(/<script src="[^"]+" defer><\/script>/g,'')),'no inline script');assert.ok(!/ style="/.test(html),'no inline style attributes (blocked by the CSP)');
  for(const s of must)assert.ok(html.includes(s),lang+' missing: '+s);
  assert.equal((html.match(/<section>/g)||[]).length,6,'six sections');
 }
 assert.ok((await (await page.GET()).text()).includes('<html lang="uz"'),'default uz');
 console.log('PASS investors page: public, strict CSP, UZ/RU/EN, pilot pricing, roadmap, print/PDF.');
})().catch(e=>{console.error(e);process.exitCode=1});
