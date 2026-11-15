const assert=require('node:assert/strict'),fs=require('fs');
// public/app.css (one render-blocking stylesheet for the site) must match its source files, and the page must
// load it instead of the separate files; fonts are served from the site, not from Google.
const {FILES,build}=require('../scripts/build-css.cjs');
assert.equal(fs.readFileSync('public/app.css','utf8'),build(),'public/app.css is stale: run node scripts/build-css.cjs');
const html=fs.readFileSync('app/site-html.ts','utf8');
assert.match(html,/href=\\"\/app\.css\?v=\d+\\"/);
for(const f of FILES)assert.ok(!new RegExp('href=\\\\"/'+f+'\\.css').test(html),f+'.css is in app.css, not linked on its own');
assert.ok(!/fonts\.googleapis/.test(fs.readFileSync('public/app.css','utf8')),'no Google Fonts round trip');
for(const s of ['latin','cyrillic'])assert.ok(fs.existsSync('public/fonts/manrope-'+s+'.woff2'));
console.log('PASS app.css: fresh bundle of '+FILES.length+' stylesheets, linked once, self-hosted Manrope.');
