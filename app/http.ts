import { env } from 'cloudflare:workers';
export class ApiError extends Error { constructor(public status:number,message:string){super(message)} }
export const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}});
export function failure(e:unknown){return json({error:e instanceof ApiError?e.message:'So‘rov bajarilmadi. Keyinroq qayta urinib ko‘ring.'},e instanceof ApiError?e.status:503)}
export function sameOrigin(request:Request){if(request.headers.get('origin')!==new URL(request.url).origin)throw new ApiError(403,'So‘rov manbasi tasdiqlanmadi.')}
export async function body(request:Request){
 sameOrigin(request);
 if(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')throw new ApiError(415,'JSON talab etiladi.');
 const limit=20000, declared=Number(request.headers.get('content-length'));
 if(declared>limit)throw new ApiError(413,'So‘rov juda katta.');
 const reader=request.body?.getReader();let size=0,raw='';const decoder=new TextDecoder();
 if(reader){try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new ApiError(413,'So‘rov juda katta.')}raw+=decoder.decode(value,{stream:true})}raw+=decoder.decode()}finally{reader.releaseLock()}}
 try{const value=JSON.parse(raw);if(!value||typeof value!=='object'||Array.isArray(value))throw Error();return value}catch{throw new ApiError(400,'Noto‘g‘ri ma’lumot.')}
}
export function text(value:unknown,min=1,max=200){if(typeof value!=='string'||value.trim().length<min||value.trim().length>max)throw new ApiError(400,'Maydonlarni to‘liq va to‘g‘ri kiriting.');return value.trim()}
export function integer(value:unknown,min:number,max:number){if(!Number.isSafeInteger(value)||Number(value)<min||Number(value)>max)throw new ApiError(400,'Son noto‘g‘ri kiritildi.');return Number(value)}
export function phone(value:unknown){const v=text(value,13,13);if(!/^\+998\d{9}$/.test(v))throw new ApiError(400,'Telefon: +998 va 9 ta raqam.');return v}
export async function throttle(key:string,limit=20,windowMs=600000){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key));const hash=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');const window=Math.floor(Date.now()/windowMs);const row=await env.DB!.prepare('INSERT INTO rate_limits (key,window,count) VALUES (?,?,1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN window=excluded.window THEN count+1 ELSE 1 END, window=excluded.window RETURNING count').bind(hash,window).first<{count:number}>();if(!row||row.count>limit)throw new ApiError(429,'Juda ko‘p urinish. 10 daqiqadan keyin qayta urinib ko‘ring.');}

/** Constant-time comparison of two secrets (compares their SHA-256 digests). */
export async function sameSecret(a:string,b:string){const enc=new TextEncoder();const [x,y]=await Promise.all([crypto.subtle.digest('SHA-256',enc.encode(a)),crypto.subtle.digest('SHA-256',enc.encode(b))]);const u=new Uint8Array(x),v=new Uint8Array(y);let diff=0;for(let i=0;i<u.length;i++)diff|=u[i]^v[i];return diff===0&&b.length>0}
export const clientIp=(request:Request)=>request.headers.get('cf-connecting-ip')||'unknown';
