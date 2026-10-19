import { env } from 'cloudflare:workers';
import { isReplacementAdmin } from './legacy-account';
// Explicitly authorized by the owner on 2026-10-16. Exact snapshot only;
// no email matching, broad non-admin deletion, or effect on future signups.
const ids=['sb:7fc8f00c-40bd-478f-a76c-9538a864a398','sb:8221e85f-6ca5-4040-b49f-d04f4660c837','sb:ba9e1173-93a9-460d-8412-ee0b3817534a','sb:cfa2a37b-348d-40a6-bd22-4705f2b99739'];
const marker='owner-test-cleanup-2026-10-16';
const restaurant='7b0aeffb-4747-456f-8c44-59f8f19601ec';
export async function cleanupTestAccounts(user:{userId:string;role:string}){
 if(!isReplacementAdmin(user))return;
 if(await env.DB!.prepare('SELECT id FROM admin_audit WHERE id=?').bind(marker).first())return;
 const present=await env.DB!.prepare('SELECT id FROM accounts WHERE id=? AND email=?').bind(user.userId,'furqatovm2007@gmail.com').first();if(!present)return;
 const qs=ids.map(()=>'?').join(','),statements=[];
 for(const id of ids)statements.push(env.DB!.prepare('INSERT INTO account_session_cutoffs (user_id,revoked_before) VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET revoked_before=MAX(revoked_before,excluded.revoked_before)').bind(id.slice(3),Math.floor(Date.now()/1000)));
 // Children before parent: all business records from the authorized test restaurant.
 for(const table of ['payments','reviews','bookings','orders','menu','restaurant_tables'])statements.push(env.DB!.prepare('DELETE FROM '+table+' WHERE restaurant_id=?').bind(restaurant));
 for(const table of ['reviews','bookings','orders','access_requests'])statements.push(env.DB!.prepare('DELETE FROM '+table+' WHERE user_id IN ('+qs+')').bind(...ids));
 statements.push(env.DB!.prepare('DELETE FROM restaurants WHERE id=? AND owner_id=?').bind(restaurant,ids[2]));
 statements.push(env.DB!.prepare('DELETE FROM account_invites WHERE accepted_by IN ('+qs+') OR created_by IN ('+qs+')').bind(...ids,...ids));
 statements.push(env.DB!.prepare('DELETE FROM accounts WHERE id IN ('+qs+')').bind(...ids));
 statements.push(env.DB!.prepare("UPDATE accounts SET role='admin',role_selected=1 WHERE id=? AND email=?").bind(user.userId,'furqatovm2007@gmail.com'));
 statements.push(env.DB!.prepare('INSERT OR IGNORE INTO admin_audit (id,actor_id,target_id,action,details,created_at) VALUES (?,?,?,?,?,?)').bind(marker,user.userId,restaurant,'owner-requested-test-cleanup',JSON.stringify({accountIds:ids,restaurantId:restaurant}),new Date().toISOString()));
 await env.DB!.batch(statements);
}
