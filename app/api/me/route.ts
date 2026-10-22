import { cleanupTestAccounts } from '../../test-account-cleanup';
import { env } from 'cloudflare:workers';
import { identity,privateHeaders } from '../../access';
import { legacyAccountCleanup,isReplacementAdmin } from '../../legacy-account';
import { smsConfigured } from '../../sms';
export const dynamic='force-dynamic';
export async function GET(){const user=await identity();if(!user)return Response.json({user:null},{headers:privateHeaders});
try{await env.DB!.prepare('INSERT INTO accounts (id,email,name,created_at,phone,email_verified,phone_verified,provider) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET email=excluded.email,name=excluded.name,phone=excluded.phone,email_verified=excluded.email_verified,phone_verified=excluded.phone_verified,provider=excluded.provider').bind(user.userId,user.email,user.displayName,new Date().toISOString(),user.phone||'',user.emailVerified?1:0,user.phoneVerified?1:0,user.providerName||'supabase').run();
if(isReplacementAdmin(user)){await env.DB!.prepare(legacyAccountCleanup).run();await cleanupTestAccounts(user);}
// New customers and couriers finish their profile (verified phone + address) before using the site.
const extra=await env.DB!.prepare('SELECT contact_phone_verified,address,address_lat,address_lng FROM accounts WHERE id=?').bind(user.userId).first<any>();const sms=smsConfigured();const phoneOk=!!user.contactPhone&&(!!extra?.contact_phone_verified||!sms);const needsProfile=['customer','courier'].includes(user.role)&&(!phoneOk||!extra?.address);
return Response.json({user:{needsProfile,smsVerification:sms,contactPhoneVerified:!!extra?.contact_phone_verified,address:extra?.address||'',addressLat:extra?.address_lat??null,addressLng:extra?.address_lng??null,id:user.userId,email:user.email,name:user.displayName,role:user.role,source:user.source,roleSelected:user.roleSelected,courierApproved:user.courierApproved,preferredLanguage:user.preferredLanguage,phone:user.phone,contactPhone:user.contactPhone,emailVerified:user.emailVerified,phoneVerified:user.phoneVerified}},{headers:privateHeaders});}catch{return Response.json({error:'Akkauntni yuklab bo‘lmadi. Qayta urinib ko‘ring.'},{status:503,headers:privateHeaders});}}
