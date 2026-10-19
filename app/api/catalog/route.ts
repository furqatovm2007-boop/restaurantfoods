import { env } from 'cloudflare:workers';
import {authConfig} from '../../auth-service';
import { json,failure } from '../../http';
export const dynamic='force-dynamic';
async function demoEnabled(){try{const c=authConfig();const res=await fetch(c.url+'/rest/v1/rpc/rf_demo_room',{method:'POST',headers:{apikey:c.key,Authorization:'Bearer '+c.key,'Content-Type':'application/json'},body:JSON.stringify({p:{action:'config'}}),signal:AbortSignal.timeout(4000)});return res.ok&&(await res.json() as any).enabled===true}catch{return false}}

export async function GET(){try{const [restaurants,menu,demo_enabled]=await Promise.all([env.DB!.prepare("SELECT r.is_demo,r.gallery,r.id,r.name,r.address,r.phone,r.description,r.cuisine,r.tables,r.floors,r.booking_open,r.booking_close,r.latitude,r.longitude,r.image_url,r.hours,r.delivery_enabled,r.delivery_fee,r.delivery_minutes,(SELECT AVG(stars) FROM reviews WHERE restaurant_id=r.id) AS rating,(SELECT COUNT(*) FROM reviews WHERE restaurant_id=r.id) AS review_count FROM restaurants r WHERE r.status='active' ORDER BY r.name").all(),env.DB!.prepare("SELECT m.* FROM menu m JOIN restaurants r ON r.id=m.restaurant_id WHERE r.status='active' ORDER BY m.name").all(),demoEnabled()]);return json({restaurants:restaurants.results,menu:menu.results,demo_enabled})}catch(e){return failure(e)}}
