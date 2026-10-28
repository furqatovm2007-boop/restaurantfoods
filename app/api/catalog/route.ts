import { env } from 'cloudflare:workers';
import {authConfig} from '../../auth-service';
import {withDemoDrinks} from '../../demo-drinks';
import { failure } from '../../http';
import { planState } from '../../plans';
import { countedReview } from '../../review-rules';
import { liveTables } from '../../live-tables';
import { hall3dEnabled } from '../../hall-layout';
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
async function catalog(){try{const [restaurants,menu,demo_enabled]=await Promise.all([env.DB!.prepare("SELECT r.is_demo,r.gallery,r.id,r.name,r.address,r.phone,r.description,r.cuisine,r.tables,r.floors,r.booking_open,r.booking_close,r.latitude,r.longitude,r.image_url,r.hours,r.delivery_enabled,r.delivery_fee,r.delivery_minutes,r.plan,r.trial_ends_at,r.paid_until,r.city,r.booking_open AS open_from,r.booking_close AS open_to,r.birthday_enabled,r.birthday_kind,r.birthday_percent,(SELECT AVG(stars) FROM reviews WHERE restaurant_id=r.id AND "+countedReview('reviews','r')+") AS rating,(SELECT COUNT(*) FROM reviews WHERE restaurant_id=r.id AND "+countedReview('reviews','r')+") AS review_count FROM restaurants r WHERE r.status='active' ORDER BY r.name").all(),env.DB!.prepare("SELECT m.* FROM menu m JOIN restaurants r ON r.id=m.restaurant_id WHERE r.status='active' ORDER BY m.name").all(),demoEnabled()]);const [live,with3d]=await Promise.all([liveTables(),hall3dEnabled()]);const listed=restaurants.results.map(({plan,trial_ends_at,paid_until,birthday_enabled,birthday_kind,birthday_percent,open_from,open_to,...r}:any)=>{const p=planState({plan,trial_ends_at,paid_until});const t=live.tables.get(r.id),busy=live.busy.get(r.id)?.size||0;const open=!open_from||(live.hhmm>=String(open_from).slice(0,5)&&live.hhmm<String(open_to||'24:00').slice(0,5));
 // Quick-filter facts: free tables right now (live marks + bookings covering now), a birthday offer, family/cabin seating.
 return {...r,has_3d_hall:with3d.has(r.id),city:r.city||'Samarqand',features:p.features,tier:p.status==='active'?p.effective:null,tables_total:t?.n||0,free_now:t?.n&&open?Math.max(0,t.n-busy):null,birthday_promo:!!birthday_enabled&&!!p.features.birthdayCrm?(birthday_kind==='percent'||!birthday_kind?Number(birthday_percent)||15:true):false,family:!!(t?.big)||/kabina|oilaviy|family|семей|кабин/i.test(String(r.description||'')+' '+String(r.name||''))}});return new Response(JSON.stringify({restaurants:listed,menu:withDemoDrinks(listed,menu.results),demo_enabled}),{headers:CACHE_HEADERS})}catch(e){return failure(e)}}
