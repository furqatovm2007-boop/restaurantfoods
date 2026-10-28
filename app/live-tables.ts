import { env } from 'cloudflare:workers';

/* Live table availability, shared by the catalog (quick filters on cards) and the Telegram bot menu. */
/** Table counts and tables busy at this moment for every restaurant, in three queries. */
export async function liveTables(){const local=new Date(Date.now()+5*3600000).toISOString(),date=local.slice(0,10),hhmm=local.slice(11,16);
 const [tables,marks,bookings]=await Promise.all([env.DB!.prepare('SELECT restaurant_id,COUNT(*) AS n,SUM(CASE WHEN seats>=6 THEN 1 ELSE 0 END) AS big FROM restaurant_tables WHERE active=1 GROUP BY restaurant_id').all<any>(),env.DB!.prepare("SELECT restaurant_id,table_number FROM table_live_status WHERE status='occupied' AND updated_at>=strftime('%Y-%m-%dT%H:%M:%fZ','now','-20 minutes')").all<any>(),env.DB!.prepare("SELECT restaurant_id,table_number,merged_table FROM bookings WHERE date=? AND status IN ('pending','confirmed') AND slot<=? AND (CASE WHEN end_slot<>'' THEN end_slot ELSE time(slot,'+2 hours') END)>?").bind(date,hhmm,hhmm).all<any>()]);
 const busy=new Map<string,Set<number>>(),add=(id:string,n:number|null)=>{if(n==null)return;if(!busy.has(id))busy.set(id,new Set());busy.get(id)!.add(n)};for(const m of marks.results)add(m.restaurant_id,m.table_number);for(const b of bookings.results){add(b.restaurant_id,b.table_number);add(b.restaurant_id,b.merged_table)}
 return {hhmm,busy,tables:new Map<string,{n:number;big:number}>(tables.results.map((t:any)=>[t.restaurant_id,{n:Number(t.n),big:Number(t.big)}]))}}

/** Free tables right now (Tashkent time) for one restaurant, or null when it is closed or has no tables. */
export function freeNow(live: Awaited<ReturnType<typeof liveTables>>, restaurantId: string, openFrom?: string, openTo?: string) {
  const t = live.tables.get(restaurantId),
    busy = live.busy.get(restaurantId)?.size || 0;
  const open = !openFrom || (live.hhmm >= String(openFrom).slice(0, 5) && live.hhmm < String(openTo || '24:00').slice(0, 5));
  return { total: t?.n || 0, free: t?.n && open ? Math.max(0, t.n - busy) : null };
}
