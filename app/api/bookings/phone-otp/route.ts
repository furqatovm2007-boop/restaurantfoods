import { identity } from '../../../access';
import { ApiError,json,failure,body,phone,throttle } from '../../../http';
import { sendBookingOtp } from '../../../booking-otp';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{const b=await body(request),u=await identity();if(!u)throw new ApiError(401,'Avval akkauntingizga kiring.');const contact=phone(b.phone);await throttle('booking-otp:'+u.userId,5);await throttle('booking-otp-phone:'+contact,3);return json(await sendBookingOtp(u.userId,contact))}catch(e){return failure(e)}}
