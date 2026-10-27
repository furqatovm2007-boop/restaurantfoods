import { ApiError } from './http';
export function coordinate(value:unknown,latitude:boolean){if(value===null||value===undefined||value==='')return null;if(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>(latitude?90:180))throw new ApiError(400,'Xarita koordinatasi noto‘g‘ri.');return value;}
export function point(lat:unknown,lng:unknown,required=false){const a=coordinate(lat,true),b=coordinate(lng,false);if((a===null)!==(b===null)||(required&&a===null))throw new ApiError(400,'Xaritada joyni belgilang.');return [a,b];}
export function imageUrl(value:unknown){if(!value)return '';if(typeof value!=='string'||value.length>1500)throw new ApiError(400,'Rasm havolasi noto‘g‘ri.');if(/^\/demo-assets\/[a-z-]+\.jpg$/.test(value))return value;if(/^\/api\/media\?key=photos%2F[a-f0-9-]{36}\.(jpg|png|webp)$/.test(value))return value;// Only our own uploads and demo assets: an outside URL would let anyone track every visitor or swap the picture unmoderated.
throw new ApiError(400,'Rasmni fayl sifatida yuklang.');}
/** Straight-line distance in kilometres. */
export function distanceKm(aLat:number,aLng:number,bLat:number,bLng:number){const r=Math.PI/180,x=Math.sin((bLat-aLat)*r/2)**2+Math.cos(aLat*r)*Math.cos(bLat*r)*Math.sin((bLng-aLng)*r/2)**2;return 12742*Math.asin(Math.sqrt(x));}
/** Kitchen time before a delivery leaves (minutes). */
export const PREP_MIN=15,PREP_MAX=20;
/** Road minutes for a straight-line distance: ×1.4 for streets at 22 km/h in town. */
export const roadMinutes=(km:number)=>km*1.4/22*60;
/** Promised delivery window [from, to] in minutes from the map: preparation 15–20 min plus the road; null without both points. */
export function deliveryWindow(rLat?:number|null,rLng?:number|null,cLat?:number|null,cLng?:number|null):[number,number]|null{if(rLat==null||rLng==null||cLat==null||cLng==null)return null;const road=roadMinutes(distanceKm(rLat,rLng,cLat,cLng));return [Math.round(PREP_MIN+road),Math.round(PREP_MAX+road)];}
/**
 * Rough minutes until a delivery arrives. On the way: courier→customer distance ×1.4 for streets at
 * 22 km/h. Before pickup: the promised time from the map (preparation + road, or an old manual value)
 * minus what has passed (never under 10).
 * Null when it is finished, cancelled or there is nothing to estimate from.
 */
export function etaMinutes(o:{status:string;fulfillment:string;delivery_status:string;created_at:string;delivery_minutes?:number|null;restaurant_lat?:number|null;restaurant_lng?:number|null;courier_lat?:number|null;courier_lng?:number|null;delivery_lat?:number|null;delivery_lng?:number|null},now=Date.now()){
  if(o.fulfillment!=='delivery'||!['pending','confirmed'].includes(o.status))return null;
  if(o.delivery_status==='picked_up'){if(o.courier_lat==null||o.courier_lng==null||o.delivery_lat==null||o.delivery_lng==null)return null;return Math.max(2,Math.round(distanceKm(o.courier_lat,o.courier_lng,o.delivery_lat,o.delivery_lng)*1.4/22*60+2));}
  const promised=deliveryWindow(o.restaurant_lat,o.restaurant_lng,o.delivery_lat,o.delivery_lng)?.[1]??o.delivery_minutes;
  if(!promised)return null;return Math.max(10,Math.round(promised-(now-Date.parse(o.created_at))/60000));
}
