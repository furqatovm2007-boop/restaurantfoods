import { cookies } from 'next/headers';
import { provider,saveSession } from '../../auth-service';

export const dynamic='force-dynamic';
export async function GET(request:Request){const jar=await cookies();const verifier=jar.get('__Host-rf-pkce')?.value;jar.set('__Host-rf-pkce','',{path:'/',httpOnly:true,secure:true,sameSite:'lax',maxAge:0});try{const code=new URL(request.url).searchParams.get('code');if(!code||!verifier)throw Error();const data=await provider('/token?grant_type=pkce','POST',{auth_code:code,code_verifier:verifier});await saveSession(data);return new Response(null,{status:302,headers:{Location:'/','Cache-Control':'no-store'}})}catch{return new Response(null,{status:302,headers:{Location:'/?auth_error=1#/login','Cache-Control':'no-store'}})}}
