const assert=require('node:assert/strict'),{load}=require('./harness.cjs');
// The signed-in user behind an access token is asked from Supabase (Tokyo) once a minute per token, not on
// every request; a revoked token and the account's session cutoff still apply on every request.
(async()=>{
 const revoked=new Set();let cutoff=null,calls=0,now=Date.parse('2026-11-11T12:00:00Z');
 const DB={prepare(sql){return{bind(...args){return{async first(){if(sql.includes('revoked_sessions'))return revoked.has(args[0])?{token_hash:args[0]}:null;if(sql.includes('account_session_cutoffs'))return cutoff===null?null:{revoked_before:cutoff};return null}}}}}};
 const env={DB,AUTH_SETUP_COMPLETE:'true',SUPABASE_URL:'https://test.supabase.co',SUPABASE_ANON_KEY:'public',TURNSTILE_SITE_KEY:'sitekey'};
 const b64=o=>Buffer.from(JSON.stringify(o)).toString('base64url'),token='h.'+b64({sub:'user-1',iat:Math.floor(now/1000)-60})+'.s';
 const jar=new Map([['__Host-rf-access',token]]);
 class FixedDate extends Date{constructor(...a){super(...(a.length?a:[now]))}static now(){return now}}
 const http=load('app/http.ts',{'cloudflare:workers':{env}});
 const auth=load('app/auth-service.ts',{'cloudflare:workers':{env},'next/headers':{cookies:async()=>({get:k=>jar.has(k)?{value:jar.get(k)}:undefined,set(){}})},'./http':http},{Date:FixedDate,fetch:async url=>{calls++;assert.match(String(url),/\/auth\/v1\/user$/);return Response.json({id:'user-1',email:'p@example.com',email_confirmed_at:'yes'})}});
 assert.equal((await auth.customerIdentity()).userId,'sb:user-1');assert.equal(calls,1);
 for(let i=0;i<5;i++)assert.equal((await auth.customerIdentity()).userId,'sb:user-1');assert.equal(calls,1,'cached within a minute');
 now+=61000;await auth.customerIdentity();assert.equal(calls,2,'asked again after a minute');
 cutoff=Math.floor(now/1000);assert.equal(await auth.customerIdentity(),null,'"sign out everywhere" applies at once');cutoff=null;
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),v=>v.toString(16).padStart(2,'0')).join('');
 revoked.add(hash);assert.equal(await auth.customerIdentity(),null,'a signed-out token is refused at once, cache or not');assert.equal(calls,2);
 console.log('PASS auth user cache: one Supabase lookup per token per minute; revoked tokens and session cutoffs still apply on every request.');
})().catch(e=>{console.error(e);process.exitCode=1});
