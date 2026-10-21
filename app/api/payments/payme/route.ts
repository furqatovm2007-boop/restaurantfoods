import { env } from 'cloudflare:workers';
import { active,payable,depositById,depositByPayme,markPaid,cancelDeposit,type DepositRow } from '../../../deposits';
export const dynamic='force-dynamic';

/*
 * Payme Merchant API (JSON-RPC 2.0). Payme authenticates with Basic "Paycom:<key>".
 * Amounts are in tiyin; account.deposit_id is our deposit id. Errors are returned with HTTP 200.
 */
const TIMEOUT=12*3600000;
const MESSAGES:Record<number,string>={[-32504]:'Ruxsat yo‘q',[-32600]:'Noto‘g‘ri so‘rov',[-32601]:'Metod topilmadi',[-31001]:'Noto‘g‘ri summa',[-31003]:'Tranzaksiya topilmadi',[-31008]:'Amalni bajarib bo‘lmaydi',[-31050]:'Depozit topilmadi',[-31051]:'Depozit to‘lovga yaroqsiz',[-31099]:'Depozit band'};
class RpcError extends Error{constructor(public code:number,public data?:string){super(String(code))}}
const fail=(code:number,data?:string):never=>{throw new RpcError(code,data)};

function authorized(request:Request){const key=env.PAYME_KEY?.trim();if(!key)return false;const header=request.headers.get('authorization')||'';const m=/^Basic\s+(.+)$/i.exec(header);if(!m)return false;try{return atob(m[1])==='Paycom:'+key}catch{return false}}

const state=(d:DepositRow)=>({create_time:d.payme_create_time??0,perform_time:d.payme_perform_time??0,cancel_time:d.payme_cancel_time??0,transaction:d.id,state:d.payme_state,reason:d.payme_reason??null});

async function account(p:any){const id=p?.account?.deposit_id;if(typeof id!=='string')fail(-31050,'deposit_id');const d=await depositById(id);if(!d)fail(-31050,'deposit_id');if(!Number.isSafeInteger(p.amount)||p.amount!==d!.amount*100)fail(-31001);if(!payable(d))fail(-31051,'deposit_id');return d!}

async function cancel(d:DepositRow,reason:unknown){
  const code=Number.isInteger(reason)?Number(reason):null,now=Date.now();
  if(d.payme_state===1){await env.DB!.prepare('UPDATE deposits SET payme_state=-1,payme_cancel_time=?,payme_reason=? WHERE id=? AND payme_state=1').bind(now,code,d.id).run();await cancelDeposit(d.id)}
  else if(d.payme_state===2){await env.DB!.prepare('UPDATE deposits SET payme_state=-2,payme_cancel_time=?,payme_reason=? WHERE id=? AND payme_state=2').bind(now,code,d.id).run();await cancelDeposit(d.id,true)}
  return (await depositById(d.id))!;
}

const methods:Record<string,(p:any)=>Promise<unknown>>={
  async CheckPerformTransaction(p){await account(p);return {allow:true}},
  async CreateTransaction(p){
    if(typeof p?.id!=='string')fail(-32600);
    const existing=await depositByPayme(p.id);
    if(existing){if(existing.payme_state!==1)fail(-31008);if(Date.now()-existing.payme_create_time!>TIMEOUT){await cancel(existing,4);fail(-31008)}return {create_time:existing.payme_create_time,transaction:existing.id,state:1}}
    const d=await account(p);
    if(d.payme_transaction)fail(-31099,'deposit_id');
    const now=Date.now();
    const saved=await env.DB!.prepare('UPDATE deposits SET payme_transaction=?,payme_state=1,payme_create_time=? WHERE id=? AND payme_transaction IS NULL').bind(p.id,now,d.id).run();
    if(!saved.meta.changes)fail(-31099,'deposit_id');
    return {create_time:now,transaction:d.id,state:1};
  },
  async PerformTransaction(p){
    const d=typeof p?.id==='string'?await depositByPayme(p.id):null;if(!d)fail(-31003);
    if(d!.payme_state===2)return {transaction:d!.id,perform_time:d!.payme_perform_time,state:2};
    if(d!.payme_state!==1)fail(-31008);
    if(Date.now()-d!.payme_create_time!>TIMEOUT||!active(d)){await cancel(d!,4);fail(-31008)}
    const now=Date.now();
    await env.DB!.prepare('UPDATE deposits SET payme_state=2,payme_perform_time=? WHERE id=? AND payme_state=1').bind(now,d!.id).run();
    await markPaid(d!.id,'payme');
    return {transaction:d!.id,perform_time:now,state:2};
  },
  async CancelTransaction(p){const d=typeof p?.id==='string'?await depositByPayme(p.id):null;if(!d)fail(-31003);const c=await cancel(d!,p.reason);return {transaction:c.id,cancel_time:c.payme_cancel_time,state:c.payme_state}},
  async CheckTransaction(p){const d=typeof p?.id==='string'?await depositByPayme(p.id):null;if(!d)fail(-31003);return state(d!)},
  async GetStatement(p){
    if(!Number.isSafeInteger(p?.from)||!Number.isSafeInteger(p?.to))fail(-32600);
    const rows=await env.DB!.prepare('SELECT d.*,b.status AS booking_status FROM deposits d JOIN bookings b ON b.id=d.booking_id WHERE d.payme_transaction IS NOT NULL AND d.payme_create_time BETWEEN ? AND ? ORDER BY d.payme_create_time LIMIT 1000').bind(p.from,p.to).all<DepositRow>();
    return {transactions:rows.results.map(d=>({id:d.payme_transaction,time:d.payme_create_time,amount:d.amount*100,account:{deposit_id:d.id},...state(d)}))};
  },
};

export async function POST(request:Request){
  let id:unknown=null;
  const error=(code:number,data?:string)=>Response.json({jsonrpc:'2.0',id,error:{code,message:{uz:MESSAGES[code]??'Xato',ru:MESSAGES[code]??'Ошибка',en:MESSAGES[code]??'Error'},...(data?{data}:{})}});
  let rpc:any;
  try{rpc=await request.json()}catch{return error(-32700)}
  id=rpc?.id??null;
  if(!authorized(request))return error(-32504);
  const method=typeof rpc?.method==='string'&&Object.hasOwn(methods,rpc.method)?methods[rpc.method]:null;
  if(!method)return error(-32601);
  try{return Response.json({jsonrpc:'2.0',id,result:await method(rpc.params)})}
  catch(e){if(e instanceof RpcError)return error(e.code,e.data);console.error(JSON.stringify({event:'payme_failed',method:rpc.method}));return error(-32400)}
}
