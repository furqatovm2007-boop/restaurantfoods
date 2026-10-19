import {identity} from '../../access';
import {accessToken,authConfig} from '../../auth-service';
import {ApiError,body,text,throttle,json,failure} from '../../http';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 const b=await body(request),u=await identity();if(!u)throw new ApiError(401,'AI_LOGIN_REQUIRED');
 const message=text(b.message,1,1400),lang=text(b.lang);if(!['uz','ru','en'].includes(lang))throw new ApiError(400,'AI_INVALID_LANGUAGE');
 await throttle('ai:user:'+u.userId,15);await throttle('ai:global',200);
 const token=await accessToken(),c=authConfig();if(!token)throw new ApiError(401,'AI_LOGIN_REQUIRED');if(!c.url||!c.key)throw new ApiError(503,'AI_UNAVAILABLE');
 let response:Response;try{response=await fetch(c.url+'/functions/v1/restaurantfoods-ai',{method:'POST',headers:{'Content-Type':'application/json',apikey:c.key,Authorization:'Bearer '+token},body:JSON.stringify({message:'Please reply in '+({uz:'Uzbek Latin',ru:'Russian',en:'English'}[lang])+'.\n\n'+message}),signal:AbortSignal.timeout(25000)})}catch{throw new ApiError(504,'AI_TIMEOUT')}
 if(!response.ok)throw new ApiError(response.status===429?429:response.status===401?401:503,response.status===429?'AI_LIMIT':response.status===401?'AI_LOGIN_REQUIRED':'AI_UNAVAILABLE');
 let data:any;try{data=await response.json()}catch{throw new ApiError(502,'AI_UNAVAILABLE')}
 if(typeof data.reply!=='string'||!data.reply.trim()||data.reply.length>16000)throw new ApiError(502,'AI_UNAVAILABLE');
 return json({reply:data.reply.trim()});
 }catch(e){return failure(e)}}
