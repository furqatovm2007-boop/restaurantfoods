import { ApiError } from './http';
export function minutes(value:unknown){if(typeof value!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(value))throw new ApiError(400,'Vaqtni HH:MM shaklida tanlang.');const [h,m]=value.split(':').map(Number);return h*60+m;}
export function interval(start:unknown,end:unknown){const from=minutes(start),to=minutes(end);if(to-from<30||to-from>360)throw new ApiError(400,'Bron davomiyligi 30 daqiqadan 6 soatgacha bo‘lsin.');return [from,to]}
export function day(value:unknown){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+'T00:00:00Z'))||new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value)throw new ApiError(400,'Sana noto‘g‘ri.');return value;}
export const endMinuteSQL="CASE WHEN end_slot<>'' THEN CAST(substr(end_slot,1,2) AS INTEGER)*60+CAST(substr(end_slot,4,2) AS INTEGER) ELSE CAST(substr(slot,1,2) AS INTEGER)*60+CAST(substr(slot,4,2) AS INTEGER)+120 END";
