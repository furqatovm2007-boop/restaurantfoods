import {ApiError,failure} from '../../http';
import {assertClientAiUser} from '../../client-ai';
import {voiceProxy} from '../../ai-voice';
import {aiUser} from '../../ai-guest';
export const dynamic='force-dynamic';
// Voice for the customer assistant (3D avatar). Couriers and restaurant staff are refused.
export async function POST(request:Request){try{const u=await aiUser(request);if(!u)throw new ApiError(401,'AI_LOGIN_REQUIRED');assertClientAiUser(u);return await voiceProxy(request,'voice:'+u.userId)}catch(e){return failure(e)}}
