const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Every classic <script> of the app page shares one global scope in the browser: two files declaring the same
// top-level const/let/class make the later file fail with "already declared" and the site hangs on the splash.
// Compiling them as one script catches that (nothing is executed).
const html=fs.readFileSync('app/site-html.ts','utf8'),files=[...html.matchAll(/<script src=\\"\/([^"?\\]+\.js)/g)].map(m=>'public/'+m[1]);
assert.ok(files.includes('public/auth-ui.js')&&files.includes('public/restaurant.js')&&files.includes('public/otp-glass.js'));
const source=files.map(f=>fs.readFileSync(f,'utf8').replace(/^'use strict';/,'')).join('\n;\n');
try{new vm.Script(source,{filename:'app-page.js'})}catch(e){assert.fail('page scripts clash in the shared global scope: '+e.message)}
console.log('PASS page scripts: '+files.length+' classic scripts compile together without duplicate global declarations');
