const assert=require('node:assert/strict'),{load}=require('./harness.cjs');
// /investors: public pitch page with a strict CSP (no inline scripts or styles), the revenue model, the
// 12-month plan marked as a forecast, 10 answered questions and the PDF / print button.
(async()=>{
 const page=load('app/investors/route.ts',{'../investors':load('app/investors.ts',{})});
 const r=await page.GET();assert.equal(r.status,200);
 const csp=r.headers.get('content-security-policy');assert.match(csp,/script-src 'self'/);assert.match(csp,/style-src 'self'/);assert.doesNotMatch(csp,/unsafe-inline/);
 const html=await r.text();
 assert.ok(!/<script>|<script [^>]*>[^<]/.test(html.replace(/<script src="[^"]+" defer><\/script>/g,'')),'no inline script');assert.ok(!/ style="/.test(html),'no inline style attributes (blocked by the CSP)');
 for(const s of ['699 000 so‘m / oy','23 300','3% komissiya','1,9 – 5,9 mln so‘m','45 000 – 75 000','≈ 23 mln so‘m / oy','≈ 115 mln so‘m / oy','400+ mln so‘m / oy','prognoz','📥 PDF shaklida yuklab olish / Chop etish','Yandex Eats','No-Show','5 daqiqa','Call AI','0 so‘m','15%'])assert.ok(html.includes(s),'missing: '+s);
 assert.equal((html.match(/<details/g)||[]).length,10,'10 questions');
 console.log('PASS investors page: public, strict CSP without inline code, revenue model, unit economics, forecast, 10 answers, print/PDF.');
})().catch(e=>{console.error(e);process.exitCode=1});
