const assert=require('node:assert/strict'),{load,request}=require('./harness.cjs');
(async()=>{
const revoked=new Set();let current='real-token',providerCalls=0,cutoff=null;
const DB={prepare(sql){return{bind(...args){return{first:async()=>sql.includes('account_session_cutoffs')?(cutoff===null?null:{revoked_before:cutoff}):(revoked.has(args[0])?{token_hash:args[0]}:null),run:async()=>{if(sql.startsWith('INSERT'))revoked.add(args[0])}}}}}};
const http=load('app/http.ts',{'cloudflare:workers':{env:{DB}}});
for(const value of [null,[],1,'x'])await assert.rejects(()=>http.body(request('/api/orders',value)),e=>e.status===400);
await assert.rejects(()=>http.body(request('/api/orders',{},'POST','https://evil.example')),e=>e.status===403);
await assert.rejects(()=>http.body(request('/api/orders',{x:'😀'.repeat(6000)})),e=>e.status===413);
assert.equal((await http.body(request('/api/orders',{x:'ok'}))).x,'ok');
const auth=load('app/auth-service.ts',{'cloudflare:workers':{env:{DB,AUTH_SETUP_COMPLETE:'true',SUPABASE_URL:'https://test.supabase.co',SUPABASE_ANON_KEY:'test',TURNSTILE_SITE_KEY:'test'}},'next/headers':{cookies:async()=>({get:()=>current?{value:current}:null,set:(k,v)=>current=v})},'./http':http},{fetch:async(url)=>{providerCalls++;if(url.includes('/logout'))throw Error('Provider offline');return Response.json({id:'u',email:'person@example.com',email_confirmed_at:'now'})}});
assert.ok(await auth.customerIdentity());await auth.revokeSession();assert.equal(current,'');const before=providerCalls;current='real-token';assert.equal(await auth.customerIdentity(),null);assert.equal(providerCalls,before,'revoked token must be rejected before provider call');
cutoff=Math.floor(Date.now()/1000);current='header.'+btoa(JSON.stringify({sub:'u',iat:cutoff-10}))+'.signature';assert.equal(await auth.customerIdentity(),null,'old session rejected after reset');current='header.'+btoa(JSON.stringify({sub:'u',iat:cutoff+1}))+'.signature';assert.ok(await auth.customerIdentity(),'new session allowed after reset');
const root=await load('app/route.ts',{'./site-html':{siteHtml:'test'},'./seo':{publicPage:async()=>new Response('<body>Public content</body>'),head:()=>''},'./seo-copy':{copy:{ru:{home:'Home',intro:'Intro'}}}}).GET();assert.ok(root.headers.get('Content-Security-Policy').includes("frame-ancestors 'none'"));assert.equal(root.headers.get('X-Frame-Options'),'DENY');
console.log('PASS adversarial: cross-origin writes, malformed JSON shapes, multibyte oversized body, revoked-token replay with provider outage, framing restrictions');
})().catch(e=>{console.error(e);process.exitCode=1});
