import {identity} from '../../../access';
import {accessToken,authConfig} from '../../../auth-service';
import {ApiError,body,text,throttle,failure} from '../../../http';
import {aiCatalog,validRecommendations} from '../../../ai-catalog';
import {guideActions,checkGuideAvailability,availabilitySpeech} from '../../../ai-guide';
import {requireFeature} from '../../../plans';
import {assertClientAiUser,takeClientAiQuestion,refundClientAiQuestion} from '../../../client-ai';
import {readSse,sseFrame,sseHeaders} from '../../../sse';
import {aiHeaders} from '../../../ai-key';
import {fallbackClient} from '../../../ai-fallback';
export const dynamic='force-dynamic';

/*
 * Streaming variant of /api/ai. Reply text is forwarded as `delta` events the moment the
 * model writes it; the closing `done` event carries recommendations and actions after the
 * same server-side validation as the JSON endpoint. When a verified availability check
 * rewrites the answer, `done.replaced` tells the client to show `done.reply` instead.
 */
export async function POST(request:Request){try{
 const b=await body(request),u=await identity();if(!u)throw new ApiError(401,'AI_LOGIN_REQUIRED');assertClientAiUser(u);
 const message=text(b.message,1,1400),lang=text(b.lang);if(!['uz','ru','en'].includes(lang))throw new ApiError(400,'AI_INVALID_LANGUAGE');
 const restaurantId=typeof b.restaurantId==='string'&&b.restaurantId?b.restaurantId:undefined;
 // The customer assistant on a restaurant page is a Premium feature of that restaurant.
 if(restaurantId)await requireFeature(restaurantId,'clientAi');
 await throttle('ai:user:'+u.userId,15);await throttle('ai:global',200);
 const token=await accessToken(),c=authConfig();
 const history=Array.isArray(b.history)?b.history.slice(-10).map((m:any)=>{if(!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.length>1600)throw new ApiError(400,'AI_INVALID_HISTORY');return {role:m.role,content:m.content}}):[];
 const catalog=await aiCatalog(restaurantId,message,b.voice===true);
 // One free question a day (+1 per booking/order today); refunded if the model call fails.
 const quota=await takeClientAiQuestion(u);const refund=()=>quota?refundClientAiQuestion(u.userId,quota.day):Promise.resolve();
 // When OpenAI cannot answer (no key or session, billing, limits, timeout) the internal engine
 // (Workers AI + live D1 data) answers instead, so the window never ends in an error.
 const reserve=async()=>{const fb=await fallbackClient(lang as any,message,history,catalog);if(!fb)return null;return {reply:fb.reply,engine:fb.engine,recommendations:validRecommendations(fb.recommendations,catalog)}};
 const reserveStream=(fb:{reply:string,engine:string,recommendations:any[]})=>new Response(new ReadableStream<Uint8Array>({start(controller){controller.enqueue(sseFrame('delta',{text:fb.reply}));controller.enqueue(sseFrame('done',{reply:fb.reply,replaced:false,engine:fb.engine,recommendations:fb.recommendations,actions:[],quota:quota&&{remaining:quota.remaining,limit:quota.limit}}));controller.close()}}),{headers:sseHeaders});
 const failed=async(status:number,error:string)=>{const fb=await reserve();if(fb)return reserveStream(fb);await refund();throw new ApiError(status,error)};
 if(!token||!c.url||!c.key)return await failed(token?503:401,token?'AI_UNAVAILABLE':'AI_LOGIN_REQUIRED');
 let upstream:Response;try{upstream=await fetch(c.url+'/functions/v1/restaurantfoods-ai',{method:'POST',headers:await aiHeaders({'Content-Type':'application/json',apikey:c.key,Authorization:'Bearer '+token,...(c.proxy?{'X-RF-Proxy':c.proxy}:{})}),body:JSON.stringify({message,lang,history,catalog,stream:true,voice:b.voice===true,currentRestaurantId:catalog.some(r=>r.id===restaurantId)?restaurantId:null,serverDate:new Date(Date.now()+5*3600000).toISOString().slice(0,10)}),signal:AbortSignal.timeout(35000)})}catch{return await failed(504,'AI_TIMEOUT')}
 if(!upstream.ok){let error='';try{error=(await upstream.clone().json() as any).error}catch{}return await failed(upstream.status===429?429:upstream.status===401?401:503,error==='AI_BILLING_REQUIRED'?'AI_BILLING_REQUIRED':upstream.status===429?'AI_LIMIT':upstream.status===401?'AI_LOGIN_REQUIRED':'AI_UNAVAILABLE')}

 const finish=async(data:any)=>{if(typeof data?.reply!=='string'||!data.reply.trim())return reserveDone();
  const actions=guideActions(data.actions,catalog);let reply=data.reply.trim(),replaced=false;const availabilityAction=actions.find(a=>a.type==='check_availability');
  if(availabilityAction){const result=await checkGuideAvailability(availabilityAction,token);availabilityAction.availability=result;reply=availabilitySpeech(availabilityAction,result,lang);replaced=true}
  else if(Array.isArray(data.actions)&&data.actions.some((a:any)=>a?.type==='check_availability')){reply=availabilitySpeech({},{checked:false},lang);replaced=true}
  return sseFrame('done',{reply,replaced,model:typeof data.model==='string'?data.model:undefined,recommendations:validRecommendations(data.recommendations,catalog),actions,quota:quota&&{remaining:quota.remaining,limit:quota.limit}})};

 // A stream that fails midway is finished by the internal engine: done.replaced shows its reply.
 const reserveDone=async()=>{const fb=await reserve().catch(()=>null);return fb?sseFrame('done',{reply:fb.reply,replaced:true,engine:fb.engine,recommendations:fb.recommendations,actions:[],quota:quota&&{remaining:quota.remaining,limit:quota.limit}}):sseFrame('error',{error:'AI_UNAVAILABLE'})};
 const stream=new ReadableStream<Uint8Array>({async start(controller){
  try{
   // An Edge Function deployed before streaming answers with plain JSON: replay it as one delta.
   if(!upstream.headers.get('content-type')?.includes('text/event-stream')||!upstream.body){const data=await upstream.json() as any;if(typeof data?.reply==='string')controller.enqueue(sseFrame('delta',{text:data.reply.trim()}));controller.enqueue(await finish(data))}
   else for await(const e of readSse(upstream.body)){let data:any;try{data=JSON.parse(e.data)}catch{continue}
    if(e.event==='delta'&&typeof data.text==='string')controller.enqueue(sseFrame('delta',{text:data.text.slice(0,4000)}));
    else if(e.event==='done'){controller.enqueue(await finish(data));break}
    else if(e.event==='error'){controller.enqueue(await reserveDone());break}}
  }catch{controller.enqueue(await reserveDone())}
  controller.close()},cancel(){upstream.body?.cancel().catch(()=>{})}});
 return new Response(stream,{headers:sseHeaders});
 }catch(e){return failure(e)}}
