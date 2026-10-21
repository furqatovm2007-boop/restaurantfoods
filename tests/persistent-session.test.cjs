const assert=require('node:assert/strict'),{load,request}=require('./harness.cjs');
(async()=>{
 const jar=new Map(),rows=new Map(),revoked=new Set();let cutoff=null,suspended=false,offline=false,rotations=0;
 const DB={prepare(sql){return{bind(...args){return{async first(){if(sql.includes('SELECT status'))return suspended?{status:'suspended'}:null;if(sql.includes('SELECT user_id,session_key'))return rows.get(args[0])||null;if(sql.includes('account_session_cutoffs'))return cutoff===null?null:{revoked_before:cutoff};if(sql.includes('revoked_sessions'))return revoked.has(args[0])?{token_hash:args[0]}:null;return null},async run(){if(sql.startsWith('INSERT INTO persistent_sessions'))rows.set(args[0],{user_id:args[1],session_key:args[2],started_at:args[3],expires_at:args[4]});if(sql.startsWith('INSERT OR REPLACE INTO revoked_sessions'))revoked.add(args[0]);if(sql.startsWith('DELETE FROM persistent_sessions')){const key=rows.get(args[0])?.session_key;for(const [hash,row] of rows)if(row.session_key===key)rows.delete(hash)}return{meta:{changes:1}}}}}}}};
 const env={DB,AUTH_SETUP_COMPLETE:'true',SUPABASE_URL:'https://test.supabase.co',SUPABASE_ANON_KEY:'public',TURNSTILE_SITE_KEY:'sitekey'};
 const http=load('app/http.ts',{'cloudflare:workers':{env}}),cookieOptions=new Map();
 const makeSession=(n=0)=>({access_token:'access-'+n,refresh_token:'refresh-'+n,expires_in:3600,user:{id:'user-1',email:'person@example.com',email_confirmed_at:'yes'}});
 const auth=load('app/auth-service.ts',{'cloudflare:workers':{env},'next/headers':{cookies:async()=>({get:k=>jar.has(k)?{value:jar.get(k)}:undefined,set:(k,v,o)=>{cookieOptions.set(k,o);if(o.maxAge===0)jar.delete(k);else jar.set(k,v)}})},'./http':http},{fetch:async url=>{if(offline)return Response.json({error:'unavailable'},{status:503});if(url.includes('grant_type=refresh_token'))return Response.json(makeSession(++rotations));return Response.json({})}});
 await auth.saveSession(makeSession());assert.equal(cookieOptions.get('__Host-rf-refresh').httpOnly,true);assert.equal(cookieOptions.get('__Host-rf-refresh').secure,true);assert.equal(cookieOptions.get('__Host-rf-refresh').path,'/');assert.ok(cookieOptions.get('__Host-rf-refresh').maxAge>86400);assert.equal(rows.size,1);
 // Simulate access expiry/browser restart. Only the HttpOnly refresh cookie remains.
 jar.delete('__Host-rf-access');await auth.refreshSession();assert.equal(jar.get('__Host-rf-access'),'access-1');assert.equal(jar.get('__Host-rf-refresh'),'refresh-1');assert.equal(rows.size,2);assert.equal(new Set([...rows.values()].map(x=>x.session_key)).size,1);
 offline=true;await assert.rejects(()=>auth.refreshSession(),e=>e.status===503);assert.equal(jar.get('__Host-rf-refresh'),'refresh-1');offline=false;
 cutoff=Math.floor(Date.now()/1000);await assert.rejects(()=>auth.refreshSession(),e=>e.status===401);assert.equal(jar.has('__Host-rf-refresh'),false);cutoff=null;
 await auth.saveSession(makeSession(10));const logoutChain=[...rows.values()].at(-1).session_key;await auth.revokeSession();assert.equal(jar.has('__Host-rf-access'),false);assert.equal(jar.has('__Host-rf-refresh'),false);assert.ok(![...rows.values()].some(r=>r.session_key===logoutChain));
 // Replaying a stolen refresh cookie from a logged-out chain is denied locally.
 jar.set('__Host-rf-refresh','refresh-10');await assert.rejects(()=>auth.refreshSession(),e=>e.status===401);assert.equal(jar.size,0);
 suspended=true;await assert.rejects(()=>auth.saveSession(makeSession(20)),e=>e.status===403);assert.equal(jar.size,0);
 const route=load('app/api/auth/[action]/route.ts',{'cloudflare:workers':{env},'next/headers':{cookies:async()=>({})},'../../../auth-service':{...auth,authReady:()=>true},'../../../access':{identity:async()=>null},'../../../http':http});
 assert.equal((await route.POST(request('/api/auth/refresh',{},'POST','https://evil'))).status,403);
 console.log('PASS persistent HttpOnly session: restart/expiry refresh, rotation, outage retention, reset cutoff, suspended account, logout chain revocation and CSRF');
})().catch(e=>{console.error(e);process.exitCode=1});
