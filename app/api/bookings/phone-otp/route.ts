import { identity } from '../../../access';
import { ApiError,json,failure,body,phone } from '../../../http';
import { sendGuardedOtp } from '../../../booking-otp';
import { phoneOtpEnabled as bookingOtpRequired } from '../../../sms';
export const dynamic='force-dynamic';
// Each SMS costs money and reaches a real person: send only when booking OTP is on, and cap
// per account, per phone, per network address and per day overall.
export async function POST(request:Request){try{if(!bookingOtpRequired())throw new ApiError(404,'SMS tasdiqlash yoqilmagan.');const b=await body(request),u=await identity();if(!u)throw new ApiError(401,'Avval akkauntingizga kiring.');const contact=phone(b.phone);return json(await sendGuardedOtp(request,u.userId,contact))}catch(e){return failure(e)}}
