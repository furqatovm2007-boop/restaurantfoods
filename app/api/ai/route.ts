import {identity} from '../../access';
import {accessToken,authConfig} from '../../auth-service';
import {ApiError,body,text,throttle,json,failure} from '../../http';
import {aiCatalog,validRecommendations} from '../../ai-catalog';
import {guideActions,checkGuideAvailability,availabilitySpeech} from '../../ai-guide';
import {requireFeature} from '../../plans';
import {assertClientAiUser,takeClientAiQuestion,refundClientAiQuestion} from '../../client-ai';
import {aiHeaders} from '../../ai-key';
import {fallbackClient} from '../../ai-fallback';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 const b=await body(request),u=await identity();if(!u)throw new ApiError(401,'AI_LOGIN_REQUIRED');assertClientAiUser(u);
 const message=text(b.message,1,1400),lang=text(b.lang);if(!['uz','ru','en'].includes(lang))throw new ApiError(400,'AI_INVALID_LANGUAGE');
 if(typeof b.restaurantId==='string'&&b.restaurantId)await requireFeature(b.restaurantId,'clientAi');await throttle('ai:user:'+u.userId,15);await throttle('ai:global',200);
 const token=await accessToken(),c=authConfig();
 const history=Array.isArray(b.history)?b.history.slice(-10).map((m:any)=>{if(!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.length>1600)throw new ApiError(400,'AI_INVALID_HISTORY');return {role:m.role,content:m.content}}):[];
 const catalog=await aiCatalog(typeof b.restaurantId==='string'?b.restaurantId:undefined,message);
 // One free question a day (+1 per booking/order today); refunded if the model call fails.
 const quota=await takeClientAiQuestion(u);const refund=()=>quota?refundClientAiQuestion(u.userId,quota.day):Promise.resolve();
 // OpenAI unavailable (no key or session, billing, limits, timeout): the internal engine answers.
 const failed=async(status:number,error:string)=>{const fb=await fallbackClient(lang as any,message,history,catalog);if(fb)return json({reply:fb.reply,engine:fb.engine,recommendations:validRecommendations(fb.recommendations,catalog),actions:[],quota:quota&&{remaining:quota.remaining,limit:quota.limit}});await refund();throw new ApiError(status,error)};
 if(!token||!c.url||!c.key)return await failed(token?503:401,token?'AI_UNAVAILABLE':'AI_LOGIN_REQUIRED');
 let response:Response;try{response=await fetch(c.url+'/functions/v1/restaurantfoods-ai',{method:'POST',headers:await aiHeaders({'Content-Type':'application/json',apikey:c.key,Authorization:'Bearer '+token,...(c.proxy?{'X-RF-Proxy':c.proxy}:{})}),body:JSON.stringify({message,lang,history,catalog,voice:b.voice===true,currentRestaurantId:catalog.some(r=>r.id===b.restaurantId)?b.restaurantId:null,serverDate:new Date(Date.now()+5*3600000).toISOString().slice(0,10)}),signal:AbortSignal.timeout(28000)})}catch{return await failed(504,'AI_TIMEOUT')}
 if(!response.ok){let error='';try{error=(await response.clone().json() as any).error}catch{}return await failed(response.status===429?429:response.status===401?401:503,error==='AI_BILLING_REQUIRED'?'AI_BILLING_REQUIRED':response.status===429?'AI_LIMIT':response.status===401?'AI_LOGIN_REQUIRED':['AI_CONFIGURATION','AI_MODEL_UNAVAILABLE','AI_TIMEOUT','AI_AUDIO_INVALID','AI_BILLING_REQUIRED'].includes(error)?error:'AI_UNAVAILABLE')}
 let data:any;try{data=await response.json()}catch{return await failed(502,'AI_UNAVAILABLE')}
 if(typeof data.reply!=='string'||!data.reply.trim()||data.reply.length>16000)return await failed(502,'AI_UNAVAILABLE');
 const actions=guideActions(data.actions,catalog);let reply=data.reply.trim();const availabilityAction=actions.find(a=>a.type==='check_availability');if(availabilityAction){const result=await checkGuideAvailability(availabilityAction,token);availabilityAction.availability=result;reply=availabilitySpeech(availabilityAction,result,lang);}else if(Array.isArray(data.actions)&&data.actions.some((a:any)=>a?.type==='check_availability')){reply=availabilitySpeech({}, {checked:false},lang);}
 return json({reply,recommendations:validRecommendations(data.recommendations,catalog),actions,quota:quota&&{remaining:quota.remaining,limit:quota.limit}});
 }catch(e){return failure(e)}}
