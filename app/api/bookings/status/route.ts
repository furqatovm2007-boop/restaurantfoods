import { env } from 'cloudflare:workers';
import { identity } from '../../../access';
import { ApiError,json,failure } from '../../../http';
export const dynamic='force-dynamic';
// Lightweight status feed polled by open booking pages, so a Telegram confirm/cancel shows up without a reload.
export async function GET(){try{const u=await identity();if(!u)throw new ApiError(401,'Avval kiring.');const mine=(await env.DB!.prepare('SELECT id,status,deposit_status FROM bookings WHERE user_id=? ORDER BY created_at DESC LIMIT 200').bind(u.userId).all()).results;let managed:unknown[]=[];if(['admin','restaurant_owner'].includes(u.role)){const all=u.role==='admin';managed=(await env.DB!.prepare('SELECT b.id,b.status,b.deposit_status FROM bookings b JOIN restaurants r ON r.id=b.restaurant_id WHERE '+(all?'1=1':'r.owner_id=?')+' ORDER BY b.created_at DESC LIMIT 200').bind(...(all?[]:[u.userId])).all()).results}return json({mine,managed})}catch(e){return failure(e)}}
