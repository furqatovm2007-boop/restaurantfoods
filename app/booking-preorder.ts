import { ApiError,integer } from './http';
export function quoteBookingMeals(input:unknown,menu:any[]){
 if(input===undefined)return {items:[],total:0};
 if(!Array.isArray(input)||input.length>30)throw new ApiError(400,'Bron taomlari noto‘g‘ri.');
 const seen=new Set();let total=0;
 const items=input.map((item:any)=>{if(!item||typeof item!=='object'||Array.isArray(item)||typeof item.id!=='string'||seen.has(item.id))throw new ApiError(400,'Bron taomlari noto‘g‘ri.');seen.add(item.id);const quantity=integer(item.quantity,1,20),dish=menu.find(m=>m.id===item.id&&m.available);if(!dish)throw new ApiError(409,'Taom mavjud emas. Menyuni yangilang.');total+=dish.price*quantity;return {id:dish.id,name:dish.name,price:dish.price,quantity}});
 if(!Number.isSafeInteger(total)||total<0||total>100000000)throw new ApiError(400,'Buyurtma summasi juda katta.');
 return {items,total};
}
