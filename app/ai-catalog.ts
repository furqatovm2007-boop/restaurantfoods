import {env} from 'cloudflare:workers';

/*
 * Dynamic AI context. Every request reads the live D1 catalog (a newly approved restaurant
 * or an edited menu is visible to the assistant immediately), then keeps only what the
 * question needs: restaurants and dishes are ranked by word overlap with the message so
 * the prompt stays small and the first token arrives quickly.
 */
const MAX_RESTAURANTS=8,CURRENT_MENU=60,OTHER_MENU=12,MAX_BYTES=52000;

export function terms(text?:string){return [...new Set((text||'').toLocaleLowerCase().normalize('NFKC').match(/[\p{L}\p{N}]{3,}/gu)||[])].slice(0,40)}
function score(haystack:string,words:string[]){if(!words.length)return 0;const value=haystack.toLocaleLowerCase();let total=0;for(const w of words)if(value.includes(w))total+=1;else if(w.length>4&&value.includes(w.slice(0,-2)))total+=.5;return total}

export async function aiCatalog(currentRestaurantId?:string,query?:string){
 const [restaurants,menu]=await Promise.all([
  env.DB!.prepare("SELECT id,name,cuisine,address,description,hours,is_demo,delivery_enabled,booking_open,booking_close,tables FROM restaurants WHERE status='active' ORDER BY name LIMIT 1000").all<any>(),
  env.DB!.prepare("SELECT m.id,m.restaurant_id,m.name,m.price,m.category,m.ingredients,m.allergens,m.is_demo FROM menu m JOIN restaurants r ON r.id=m.restaurant_id WHERE r.status='active' AND m.available=1 ORDER BY m.restaurant_id,m.name LIMIT 8000").all<any>(),
 ]).then(r=>r.map(x=>x.results));
 const words=terms(query),byRestaurant=new Map<string,any[]>();
 for(const m of menu){const list=byRestaurant.get(m.restaurant_id)||[];list.push({...m,score:score(m.name+' '+m.category+' '+m.ingredients,words)});byRestaurant.set(m.restaurant_id,list)}
 const ranked=restaurants.map(r=>{const dishes=byRestaurant.get(r.id)||[];return {r,dishes,score:(r.id===currentRestaurantId?1000:0)+score(r.name+' '+r.cuisine+' '+r.address+' '+r.description,words)*3+dishes.reduce((s,d)=>s+d.score,0)}})
  .sort((a,b)=>b.score-a.score||Number(!!a.r.is_demo)-Number(!!b.r.is_demo)||String(a.r.name).localeCompare(String(b.r.name))).slice(0,MAX_RESTAURANTS);
 const catalog=ranked.map(({r,dishes})=>({id:r.id,name:r.name,cuisine:r.cuisine,address:r.address,hours:r.hours,booking:r.booking_open?{open:r.booking_open,close:r.booking_close,tables:r.tables}:undefined,description:String(r.description).slice(0,300),is_demo:!!r.is_demo||String(r.id).startsWith('rf-demo-'),delivery:!!r.delivery_enabled,
  menu:[...dishes].sort((a,b)=>b.score-a.score).slice(0,r.id===currentRestaurantId?CURRENT_MENU:OTHER_MENU).map(m=>({id:m.id,name:m.name,price:m.price,currency:'UZS',category:m.category,ingredients:String(m.ingredients).slice(0,150),allergens:String(m.allergens).slice(0,180)}))}));
 while(new TextEncoder().encode(JSON.stringify(catalog)).length>MAX_BYTES){const r=[...catalog].reverse().find(r=>r.menu.length>1);if(!r)break;r.menu.pop()}return catalog;
}
export function validRecommendations(value:any,catalog:any[]){if(!Array.isArray(value))return[];const seen=new Set();return value.slice(0,4).flatMap(v=>{const r=catalog.find(r=>r.id===v?.restaurantId);if(!r||seen.has(r.id))return[];seen.add(r.id);const used=new Set();const items=(Array.isArray(v.items)?v.items:[]).slice(0,12).flatMap((item:any)=>{const m=r.menu.find((m:any)=>m.id===item?.id);if(!m||used.has(m.id))return[];used.add(m.id);return[{id:m.id,name:m.name,price:m.price,quantity:Number.isInteger(item.quantity)&&item.quantity>=1&&item.quantity<=20?item.quantity:1}]});return[{restaurantId:r.id,name:r.name,is_demo:r.is_demo,reason:typeof v.reason==='string'?v.reason.slice(0,500):'',items,total:items.reduce((s:any,m:any)=>s+m.price*m.quantity,0)}]})}
