import { env } from 'cloudflare:workers';
import {authConfig} from '../../auth-service';
import {withDemoDrinks} from '../../demo-drinks';
import { failure } from '../../http';
import { planState } from '../../plans';
export const dynamic='force-dynamic';
// The demo switch lives in Supabase; ask at most once a minute per isolate.
let demoFlag:{value:boolean,at:number}|null=null;
async function demoEnabled(){if(demoFlag&&Date.now()-demoFlag.at<60000)return demoFlag.value;const value=await demoEnabledNow();demoFlag={value,at:Date.now()};return value}
async function demoEnabledNow(){try{const c=authConfig();const res=await fetch(c.url+'/rest/v1/rpc/rf_demo_room',{method:'POST',headers:{apikey:c.key,Authorization:'Bearer '+c.key,'Content-Type':'application/json'},body:JSON.stringify({p:{action:'config'}}),signal:AbortSignal.timeout(4000)});return res.ok&&(await res.json() as any).enabled===true}catch{return false}}

/*
 * The catalog (restaurants + menus, also the 3D menu book's source) is read straight from D1 on
 * every request and never cached by the edge or the browser, so a new restaurant, a changed
 * price or a new dish is visible to every visitor at once.
 */
const CACHE_HEADERS={'Content-Type':'application/json','Cache-Control':'no-store, no-cache, must-revalidate, max-age=0','Pragma':'no-cache'};
export async function GET(_request?:Request){return catalog()}
async function catalog(){try{const [restaurants,menu,demo_enabled]=await Promise.all([env.DB!.prepare("SELECT r.is_demo,r.gallery,r.id,r.name,r.address,r.phone,r.description,r.cuisine,r.tables,r.floors,r.booking_open,r.booking_close,r.latitude,r.longitude,r.image_url,r.hours,r.delivery_enabled,r.delivery_fee,r.delivery_minutes,r.plan,r.trial_ends_at,r.paid_until,(SELECT AVG(stars) FROM reviews WHERE restaurant_id=r.id) AS rating,(SELECT COUNT(*) FROM reviews WHERE restaurant_id=r.id) AS review_count FROM restaurants r WHERE r.status='active' ORDER BY r.name").all(),env.DB!.prepare("SELECT m.* FROM menu m JOIN restaurants r ON r.id=m.restaurant_id WHERE r.status='active' ORDER BY m.name").all(),demoEnabled()]);const listed=restaurants.results.map(({plan,trial_ends_at,paid_until,...r}:any)=>{const p=planState({plan,trial_ends_at,paid_until});return {...r,features:p.features,tier:p.status==='active'?p.effective:null}});return new Response(JSON.stringify({restaurants:listed,menu:withDemoDrinks(listed,menu.results),demo_enabled}),{headers:CACHE_HEADERS})}catch(e){return failure(e)}}
