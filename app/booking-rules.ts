import { ApiError } from './http';
/** Online bookings close 1 hour before the start, so they never collide with guests already waiting in the hall (live queue). */
export const BOOKING_LEAD_MS=3600000;
export function bookingSlot(date:string,slot:string,now=Date.now()){if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(slot))throw new ApiError(400,'Sana yoki vaqt noto‘g‘ri.');const timestamp=Date.parse(date+'T'+slot+':00+05:00');if(!Number.isFinite(timestamp)||new Date(timestamp+18000000).toISOString().slice(0,16)!==date+'T'+slot||timestamp<now+BOOKING_LEAD_MS||timestamp>now+90*86400000)throw new ApiError(400,'Onlayn bron kelishdan kamida 1 soat oldin yakunlanishi kerak (ko‘pi bilan 90 kun oldin). Zaldagi jonli navbat bilan to‘qnashmasligi uchun undan yaqin vaqtga bron yo‘q.');return timestamp;}
export function slotList(value:unknown){if(!Array.isArray(value)||value.length>8)throw new ApiError(400,'Vaqtlar noto‘g‘ri.');const slots=[...new Set(value)].sort();let last=-120;for(const s of slots){if(typeof s!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(s))throw new ApiError(400,'Vaqt formati HH:MM.');const [h,m]=s.split(':').map(Number);if(h*60+m>1320)throw new ApiError(400,'Oxirgi bron vaqti 22:00 dan kech bo‘lmasin.');if(h*60+m-last<120)throw new ApiError(400,'Bron vaqtlari oralig‘i kamida 2 soat bo‘lsin.');last=h*60+m;}return slots;}
/** Restaurant-local (Tashkent, UTC+5) start of a booking as a timestamp. */
export const bookingStartMs=(date:string,slot:string)=>Date.parse(date+'T'+String(slot).slice(0,5)+':00+05:00');
/** A table the camera (or staff) shows as occupied cannot be booked for a start within this many minutes. */
export const SEATED_BLOCK_MINUTES=120;
export const seatedWindow=(date:string,slot:string,now=Date.now())=>bookingStartMs(date,slot)-now<SEATED_BLOCK_MINUTES*60000;
export const SEATED_MESSAGE='Bu stolga hozir mijoz o‘tirgan, boshqa stol yoki vaqt tanlang.';
/** Customers may cancel until 2 hours before the start; later only the restaurant can. */
export const CANCEL_NOTICE_MS=2*3600000;
export const cancellable=(date:string,slot:string,now=Date.now())=>bookingStartMs(date,slot)-now>=CANCEL_NOTICE_MS;
export const LATE_CANCEL_WARNING='Bron vaqtiga 2 soatdan kam vaqt qolganda uni ilova orqali o‘zingiz bekor qila olmaysiz. Agar bekor qilmoqchi bo‘lsangiz, bevosita restoranga telefon qilishingiz kerak bo‘ladi, lekin bunda oldindan kelishilgan jarima (charge) kartangizdan baribir yechiladi.';
export const CANCEL_TOO_LATE='Bron vaqtiga 2 soatdan kam qoldi — ilova orqali bekor qilib bo‘lmaydi. Bekor qilish uchun restoranga qo‘ng‘iroq qiling; kelishilgan jarima kartangizdan yechiladi.';
