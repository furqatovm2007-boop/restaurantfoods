const assert=require('node:assert/strict'),{load}=require('./harness.cjs');
(async()=>{
const http=load('app/http.ts',{'cloudflare:workers':{env:{}}});let code='same_password';
const service=load('app/auth-service.ts',{'cloudflare:workers':{env:{AUTH_SETUP_COMPLETE:'true',SUPABASE_URL:'https://test.supabase.co',SUPABASE_ANON_KEY:'test',TURNSTILE_SITE_KEY:'test'}},'next/headers':{cookies:async()=>({})},'./http':http},{fetch:async()=>new Response(JSON.stringify({error_code:code}),{status:422})});
await assert.rejects(()=>service.provider('/user','PUT',{password:'test'},'test'),/Yangi parol eski paroldan/);
code='otp_expired';await assert.rejects(()=>service.provider('/verify','POST',{}),/ishlatilgan yoki muddati/);
code='weak_password';await assert.rejects(()=>service.provider('/user','PUT',{}),/xavfsizlik talablariga/);
console.log('PASS provider errors: same password, consumed or expired code, weak password have distinct safe messages');
})().catch(e=>{console.error(e);process.exitCode=1});
