import { identity } from '../../../access';
import { ApiError,json,failure,body,phone,throttle,clientIp } from '../../../http';
import { sendBookingOtp } from '../../../booking-otp';
import { bookingOtpRequired } from '../../../sms';
export const dynamic='force-dynamic';
const DAY=86400000;
// Each SMS costs money and reaches a real person: send only when booking OTP is on, and cap
// per account, per phone, per network address and per day overall.
export async function POST(request:Request){try{if(!bookingOtpRequired())throw new ApiError(404,'SMS tasdiqlash yoqilmagan.');const b=await body(request),u=await identity();if(!u)throw new ApiError(401,'Avval akkauntingizga kiring.');const contact=phone(b.phone);await throttle('booking-otp:'+u.userId,5);await throttle('booking-otp-day:'+u.userId,10,DAY);await throttle('booking-otp-phone:'+contact,3);await throttle('booking-otp-ip:'+clientIp(request),8);await throttle('sms:global',1000,DAY);return json(await sendBookingOtp(u.userId,contact))}catch(e){return failure(e)}}
