import { env } from 'cloudflare:workers';
import { identity,privateHeaders } from '../../access';
export const dynamic='force-dynamic';
export async function GET(request:Request){const user=await identity();if(!user)return Response.json({error:'Kirish talab etiladi'},{status:401,headers:privateHeaders});if(user.role!=='admin')return Response.json({error:'Ruxsat yo‘q'},{status:403,headers:privateHeaders});
const url=new URL(request.url);const days=url.searchParams.get('days')||'30';if(!['7','30','365','all'].includes(days))return Response.json({error:'Noto‘g‘ri davr'},{status:400,headers:privateHeaders});const since=days==='all'?'0000':new Date(Date.now()-Number(days)*86400000).toISOString();
try{const [accountCount,restaurants,totals,accounts,flowers]=await Promise.all([
env.DB!.prepare('SELECT COUNT(*) AS count FROM accounts').first(),
env.DB!.prepare("SELECT r.id,r.name,r.status,COUNT(p.id) AS payments,COALESCE(SUM(p.gross),0) AS gross,COALESCE(SUM(p.refund),0) AS refunds,COALESCE(SUM(p.commission),0) AS commission FROM restaurants r LEFT JOIN payments p ON p.restaurant_id=r.id AND p.status='paid' AND p.created_at>=? GROUP BY r.id ORDER BY gross DESC").bind(since).all(),
env.DB!.prepare("SELECT COUNT(*) AS payments,COALESCE(SUM(gross),0) AS gross,COALESCE(SUM(refund),0) AS refunds,COALESCE(SUM(commission),0) AS commission FROM payments WHERE status='paid' AND created_at>=?").bind(since).first(),
env.DB!.prepare('SELECT id,email,name,created_at,role,courier_approved FROM accounts ORDER BY created_at DESC LIMIT 100').all(),
// Flowers: the 3% platform commission of paid flower orders in the same period.
env.DB!.prepare("SELECT COUNT(*) AS count,COALESCE(SUM(total),0) AS sales,COALESCE(SUM(commission),0) AS commission FROM flower_orders WHERE status IN ('paid','accepted','delivering','delivered') AND created_at>=?").bind(since).first()]);
return Response.json({accountCount:accountCount?.count||0,restaurants:restaurants.results,totals,flowers,accounts:accounts.results,paymentsConnected:false},{headers:privateHeaders});}catch{return Response.json({error:'Hisobot yuklanmadi. Qayta urinib ko‘ring.'},{status:503,headers:privateHeaders});}}
