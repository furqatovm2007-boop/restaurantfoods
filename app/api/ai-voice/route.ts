import {identity} from '../../access';
import {accessToken,authConfig} from '../../auth-service';
import {ApiError,sameOrigin,throttle,json,failure} from '../../http';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 sameOrigin(request);const u=await identity();if(!u)throw new ApiError(401,'AI_LOGIN_REQUIRED');
 if(request.headers.get('content-type')?.split(';')[0]!=='application/json')throw new ApiError(415,'JSON_REQUIRED');
 if(Number(request.headers.get('content-length'))>650000)throw new ApiError(413,'AUDIO_TOO_LARGE');
 const reader=request.body?.getReader();let size=0,raw='';const decoder=new TextDecoder();if(reader){try{while(true){const v=await reader.read();if(v.done)break;size+=v.value.byteLength;if(size>650000){await reader.cancel();throw new ApiError(413,'AUDIO_TOO_LARGE')}raw+=decoder.decode(v.value,{stream:true})}raw+=decoder.decode()}finally{reader.releaseLock()}}
 let b:any;try{b=JSON.parse(raw)}catch{throw new ApiError(400,'INVALID_REQUEST')}
 if(!b||!['uz','ru','en'].includes(b.lang)||!['speech','greeting','transcribe'].includes(b.mode))throw new ApiError(400,'INVALID_REQUEST');
 const payload:any={mode:b.mode,lang:b.lang};
 if(b.mode==='speech'){if(typeof b.text!=='string'||!b.text.trim()||b.text.length>1600)throw new ApiError(400,'INVALID_REQUEST');payload.text=b.text;}
 if(b.mode==='transcribe'){if(!b.audio||!['audio/webm','audio/mp4','audio/ogg','audio/wav'].includes(b.audio.mimeType)||typeof b.audio.data!=='string'||b.audio.data.length>600000||!/^[A-Za-z0-9+/]+={0,2}$/.test(b.audio.data))throw new ApiError(400,'INVALID_AUDIO');payload.audio=b.audio;}
 await throttle('voice:'+u.userId,60);await throttle('voice:global',500);
 const c=authConfig(),token=await accessToken();if(!token)throw new ApiError(401,'AI_LOGIN_REQUIRED');
 const res=await fetch(c.url+'/functions/v1/restaurantfoods-ai',{method:'POST',headers:{apikey:c.key,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(28000)});
 const data:any=await res.json();if(!res.ok)throw new ApiError(res.status===429?429:res.status===401?401:503,['AI_LOGIN_REQUIRED','AI_LIMIT','AI_CONFIGURATION','AI_MODEL_UNAVAILABLE','AI_TIMEOUT'].includes(data.error)?data.error:'AI_VOICE_UNAVAILABLE');
 if(b.mode==='transcribe'){if(typeof data.transcript!=='string'||data.transcript.length>1400)throw new ApiError(502,'AI_VOICE_UNAVAILABLE');return json({transcript:data.transcript});}
 if(typeof data.audio!=='string'||data.audio.length>5000000||!['audio/wav','audio/mpeg','audio/l16'].includes(data.mimeType)||!/^[A-Za-z0-9+/]+={0,2}$/.test(data.audio))throw new ApiError(502,'AI_VOICE_UNAVAILABLE');
 return json({audio:data.audio,mimeType:data.mimeType,sampleRate:data.sampleRate||24000});
 }catch(e){return failure(e)}}
