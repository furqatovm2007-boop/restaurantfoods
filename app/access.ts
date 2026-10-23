import { customerIdentity } from './auth-service';
import { env } from 'cloudflare:workers';
export const ADMIN_EMAIL='furqatovm2007@gmail.com';
// Preserve the already established administrator by immutable provider ID, never by a new matching email.
export const EXISTING_ADMIN_ID='sb:4fcd0d25-6ec1-4e10-a15f-8005d683edfe';
export async function identity(){const user=await customerIdentity();if(!user)return null;const profile=await env.DB!.prepare('SELECT role,role_selected,courier_approved,preferred_language,status,contact_phone FROM accounts WHERE id=?').bind(user.userId).first<any>();if(profile?.status==='suspended')return null;const legacyOwner=await env.DB!.prepare('SELECT id FROM restaurants WHERE owner_id=? LIMIT 1').bind(user.userId).first();const role=user.userId===EXISTING_ADMIN_ID?'admin':profile?.role==='owner'||legacyOwner?'restaurant_owner':['admin','restaurant_owner','courier','florist'].includes(profile?.role)?profile.role:'customer';return {...user,contactPhone:profile?.contact_phone||'',role,roleSelected:true,courierApproved:!!profile?.courier_approved,preferredLanguage:['ru','uz','en'].includes(profile?.preferred_language)?profile.preferred_language:'ru'};}
export const privateHeaders={'Cache-Control':'private, no-store, no-cache, must-revalidate, max-age=0','Pragma':'no-cache','Vary':'Cookie'};
