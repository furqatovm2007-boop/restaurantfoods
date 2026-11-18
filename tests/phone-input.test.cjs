const assert=require('node:assert/strict'),fs=require('node:fs'),{load}=require('./harness.cjs');
// Checkout phone with a country selector: local digits spaced by the country's mask, a pasted full number loses
// its dial code (and switches the country), the booking gets E.164; the server accepts the same list.
const vm=require('node:vm'),mod={exports:{}};vm.runInNewContext(fs.readFileSync('public/phone-input.js','utf8'),{module:mod});const P=mod.exports;
assert.equal(P.format('993847384','uz'),'99 384 73 84');
assert.equal(P.format('9131234567','ru'),'913 123 45 67');
assert.equal(P.format('5551234567','us'),'555 123 4567');
assert.equal(P.format('9938','uz'),'99 38','partial numbers are spaced too');
assert.deepEqual({...P.parse('+998993847384','uz')},{country:'uz',digits:'993847384'},'pasted +998 is stripped');
assert.deepEqual({...P.parse('998993847384','uz')},{country:'uz',digits:'993847384'},'998 without + is stripped');
assert.deepEqual({...P.parse('+1 (555) 123-4567','uz')},{country:'us',digits:'5551234567'},'another country switches');
assert.deepEqual({...P.parse('0044 7911 123456','uz')},{country:'gb',digits:'7911123456'},'00 prefix');
assert.deepEqual({...P.parse('+971501234567','uz')},{country:'ae',digits:'501234567'},'+971 is not read as +9x');
assert.deepEqual({...P.parse('07911123456','gb')},{country:'gb',digits:'7911123456'},'trunk 0 dropped');
assert.deepEqual({...P.parse('89131234567','ru')},{country:'ru',digits:'9131234567'},'Russian 8 dropped');
assert.deepEqual({...P.parse('99 384 73 84 55','uz')},{country:'uz',digits:'993847384'},'cut to the maximum');
assert.equal(P.parse('+4','uz').pending,true,'a dial code being typed waits');
assert.equal(P.e164('993847384','uz'),'+998993847384');
assert.equal(P.e164('5551234567','us'),'+15551234567');
assert.equal(P.e164('99384','uz'),'','incomplete → empty');
assert.equal(P.e164('15123456789','de'),'+4915123456789');
// Server: the same countries and lengths.
const http=load('app/http.ts',{'cloudflare:workers':{env:{}}}),codes=load('app/phone-codes.ts',{'./http':http});
assert.equal(JSON.stringify(codes.PHONE_COUNTRIES.map(c=>[c.id,c.dial,c.len.join()])),JSON.stringify(P.COUNTRIES.map(c=>[c.id,c.dial,c.len.join()])),'browser and server lists agree');
for(const ok of ['+998993847384','+15551234567','+79131234567','+447911123456','+905321234567','+971501234567','+4915123456789','+821012345678'])assert.equal(codes.intlPhone(ok),ok);
for(const bad of ['+99899384738','+155512345678','+33612345678','998993847384','+998 99 384 73 84',''])assert.throws(()=>codes.intlPhone(bad),bad);
assert.ok(fs.readFileSync('app/site-html.ts','utf8').indexOf('/phone-input.js')<fs.readFileSync('app/site-html.ts','utf8').indexOf('/mvp.js?'),'loads before the checkout');
console.log('PASS phone input: flag + dial code, masks, pasted numbers stripped / country switched, E.164 out, same list on the server');
