import { env } from 'cloudflare:workers';
import { cookies } from 'next/headers';
import { authConfig,authReady,refreshSession,provider,saveSession,clearSession,accessToken,revokeSession,revokeUserSessions } from '../../../auth-service';
import { identity } from '../../../access';
import { ApiError,json,failure,body,text,throttle } from '../../../http';
import { startTelegramLogin,pollTelegramLogin,endTelegramSession,telegramLoginAvailable } from '../../../telegram-login';
export const dynamic='force-dynamic';
const getAction=(r:Request)=>new URL(r.url).pathname.split('/').pop();
const emailOf=(v:unknown)=>{const e=text(v,3,254).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))throw new ApiError(400,'Email noto‘g‘ri.');return e};
const passwordOf=(v:unknown,min=8)=>{if(typeof v!=='string'||v.length<min||v.length>128)throw new ApiError(400,'Parol kamida '+min+' va ko‘pi bilan 128 belgi bo‘lsin.');return v};
const codeOf=(v:unknown)=>{const t=text(v,6,6);if(!/^\d{6}$/.test(t))throw new ApiError(400,'6 xonali kodni kiriting.');return t};
export async function GET(request:Request){try{const action=getAction(request),c=authConfig();if(action==='config')return json({ready:authReady(),sitekey:authReady()?c.sitekey:null,google:authReady()&&c.google,apple:authReady()&&c.apple,phone:authReady()&&c.phone,telegram:telegramLoginAvailable()});if(action!=='oauth')throw new ApiError(404,'Topilmadi.');if(!authReady())throw new ApiError(503,'Kirish xizmati hali ulanmagan.');const providerName=new URL(request.url).searchParams.get('provider');if(!((providerName==='google'&&c.google)||(providerName==='apple'&&c.apple)))throw new ApiError(400,'Bu kirish usuli hali yoqilmagan.');const verifier=Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join('');const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier));const challenge=btoa(String.fromCharCode(...new Uint8Array(digest))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');(await cookies()).set('__Host-rf-pkce',verifier,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:600});const url=new URL(c.url+'/auth/v1/authorize');url.searchParams.set('provider',providerName!);url.searchParams.set('redirect_to',new URL('/auth/complete',request.url).href);url.searchParams.set('code_challenge',challenge);url.searchParams.set('code_challenge_method','s256');return new Response(null,{status:302,headers:{Location:url.href,'Cache-Control':'no-store'}});}catch(e){return failure(e)}}
export async function POST(request:Request){try{const b=await body(request);const action=getAction(request);if(action==='logout'){await endTelegramSession();await revokeSession();return json({ok:true})}
// Sign-in with Telegram does not depend on the email/SMS provider (see app/telegram-login.ts).
if(action==='telegram-start'){await throttle('tg-login:'+request.headers.get('cf-connecting-ip'),20);return json(await startTelegramLogin())}
if(action==='telegram-poll'){await throttle('tg-poll:'+request.headers.get('cf-connecting-ip'),400);return json(await pollTelegramLogin())}if(!authReady())throw new ApiError(503,'Email va xavfsizlik xizmati hali ulanmagan.');if(action==='refresh'){await throttle('refresh-ip:'+request.headers.get('cf-connecting-ip'),120);await refreshSession();return json({ok:true})}await throttle('auth-ip:'+request.headers.get('cf-connecting-ip'),40);if(['phone-signup','phone-login','phone-resend','phone-verify'].includes(action||''))return await phoneAuth(request,b,action!);const allowed=['signup','login','verify','forgot','reset','resend','change-start','change-finish'];if(!allowed.includes(action||''))throw new ApiError(404,'Topilmadi.');const changing=action?.startsWith('change-');const u=changing?await identity():null;if(changing&&(!u||u.source!=='supabase'))throw new ApiError(401,'Email akkauntingizga qayta kiring.');const email=changing?u!.email:emailOf(b.email);await throttle('auth-email:'+email,15);if(['verify','reset','change-finish'].includes(action||''))await throttle('email-code:'+email,5);// Supabase Auth performs Cloudflare Siteverify using its server-side CAPTCHA secret.
// Forward each token once: pre-validating the same token here would consume it and break Auth.
const security=()=>({captcha_token:text(b.captchaToken,1,2048)});
if(action==='signup'){if((b.role||'customer')!=='customer')throw new ApiError(400,'Profil turi noto‘g‘ri.');const password=passwordOf(b.password);const name=text(b.name,2,80);const data=await provider('/signup','POST',{email,password,data:{full_name:name},gotrue_meta_security:security()});if(data.access_token)throw new ApiError(503,'Email tasdiqlash sozlamasi tekshirilishi kerak.');// Supabase answers a sign-up for an already confirmed email with an empty identity list and sends no code; tell the user instead of waiting for a code that never comes.
const identities=(data.user??data)?.identities;if(Array.isArray(identities)&&identities.length===0)throw new ApiError(409,'Bu email bilan akkaunt allaqachon bor. Kirish bo‘limidan kiring yoki “Parolni unutdingizmi?” orqali tiklang.');return json({ok:true,message:'Emailga yuborilgan kodni kiriting. Agar akkauntingiz mavjud bo‘lsa, Kirish bo‘limidan foydalaning.'})}
if(action==='login'){const data=await provider('/token?grant_type=password','POST',{email,password:passwordOf(b.password,1),gotrue_meta_security:security()});await saveSession(data);return json({ok:true})}
if(action==='verify'){const data=await provider('/verify','POST',{email,token:codeOf(b.code),type:'signup'});await saveSession(data);(await cookies()).set('__Host-rf-signup-role','',{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:0});return json({ok:true})}
if(action==='resend'){await provider('/resend','POST',{type:'signup',email,gotrue_meta_security:security()});return json({ok:true,message:'Kod qayta so‘raldi. Emailingizni tekshiring.'})}
if(action==='forgot'||action==='change-start'){await provider('/recover','POST',{email,gotrue_meta_security:security()});return json({ok:true,message:'Bu emailda akkaunt bo‘lsa, tasdiqlash kodi yuboriladi.'})}
if(action==='reset'||action==='change-finish'){const password=passwordOf(b.password);const data=await provider('/verify','POST',{email,token:codeOf(b.code),type:'recovery'});if(!data.access_token||!data.user?.email_confirmed_at||data.user.email.toLowerCase()!==email.toLowerCase())throw new ApiError(403,'Kod tasdiqlanmadi.');if(changing&&'sb:'+data.user.id!==u!.userId)throw new ApiError(403,'Kod bu akkauntga tegishli emas.');await provider('/user','PUT',{password},data.access_token);await revokeUserSessions(data.user.id);await clearSession();return json({ok:true,message:'Parol yangilandi. Yangi parol bilan kiring.'})}
throw new ApiError(404,'Topilmadi.');}catch(e){return failure(e)}}

async function phoneAuth(request:Request,b:any,action:string){
 if(!authConfig().phone)throw new ApiError(503,'SMS xizmati hali ulanmagan. Email orqali kiring.');
 const phone=text(b.phone,8,25).replace(/[ ()-]/g,'');if(!/^\+998\d{9}$/.test(phone))throw new ApiError(400,'Telefon raqamini xalqaro formatda kiriting.');
 const jar=await cookies();
 const security=()=>({captcha_token:text(b.captchaToken,1,2048)});
 if(action==='phone-login'){
 await throttle('phone-login:'+phone,10);
 const data=await provider('/token?grant_type=password','POST',{phone,password:passwordOf(b.password,1),gotrue_meta_security:security()});
 if(!data.user?.phone_confirmed_at||String(data.user.phone).replace(/^\+/,'')!==phone.slice(1))throw new ApiError(403,'Kod tasdiqlanmadi.');
 await saveSession(data);return json({ok:true});
 }
 if(action==='phone-signup'||action==='phone-resend'){
 const password=action==='phone-signup'?passwordOf(b.password):undefined;
 const name=action==='phone-signup'?text(b.name,2,80):undefined;
 if(action==='phone-signup'&&b.confirm!==password)throw new ApiError(400,'Parollar bir xil emas.');
 const captchaSecurity=security();
 await throttle('sms-send:'+phone,5);
 const cooldown=await env.DB!.prepare('INSERT INTO sms_cooldowns (phone,next_at) VALUES (?,?) ON CONFLICT(phone) DO UPDATE SET next_at=excluded.next_at WHERE sms_cooldowns.next_at<=? RETURNING phone').bind(phone,Date.now()+60000,Date.now()).first();if(!cooldown)throw new ApiError(429,'Kodni qayta yuborish uchun 60 soniya kuting.');
 const data=await provider(action==='phone-signup'?'/signup':'/resend','POST',action==='phone-signup'?{phone,password,data:{full_name:name},channel:'sms',gotrue_meta_security:captchaSecurity}:{type:'sms',phone,gotrue_meta_security:captchaSecurity});
 if(data.access_token)throw new ApiError(503,'Telefon tasdiqlash sozlamasi tekshirilishi kerak.');
 await env.DB!.prepare('UPDATE otp_challenges SET consumed=1 WHERE phone=? AND consumed=0').bind(phone).run();
 const id=crypto.randomUUID();await env.DB!.prepare('INSERT INTO otp_challenges (id,phone,expires_at,created_at) VALUES (?,?,?,?)').bind(id,phone,Date.now()+300000,Date.now()).run();
 jar.set('__Host-rf-sms',id,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:300});return json({ok:true,resendAfter:60,expiresIn:300});
 }
 await throttle('sms-verify:'+phone,10);const id=jar.get('__Host-rf-sms')?.value;if(!id)throw new ApiError(400,'Yangi kod so‘rang.');
 const challenge=await env.DB!.prepare('UPDATE otp_challenges SET attempts=attempts+1 WHERE id=? AND phone=? AND consumed=0 AND expires_at>? AND attempts<5 RETURNING id').bind(id,phone,Date.now()).first();if(!challenge)throw new ApiError(429,'Kod muddati yoki urinishlar limiti tugadi. Yangi kod so‘rang.');
 const data=await provider('/verify','POST',{phone,token:codeOf(b.code),type:'sms'});
 if(!data.user?.phone_confirmed_at||String(data.user.phone).replace(/^\+/,'')!==phone.slice(1))throw new ApiError(403,'Kod tasdiqlanmadi.');
 const claimed=await env.DB!.prepare('UPDATE otp_challenges SET consumed=1 WHERE id=? AND consumed=0').bind(id).run();if(!claimed.meta.changes)throw new ApiError(409,'Kod allaqachon ishlatilgan.');
 await saveSession(data);jar.set('__Host-rf-sms','',{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:0});return json({ok:true});
}
