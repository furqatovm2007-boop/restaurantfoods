import { env } from 'cloudflare:workers';
import { md5 } from '../../../md5';
import { active,payable,depositById,markPaid,cancelDeposit } from '../../../deposits';
export const dynamic='force-dynamic';

/*
 * Click SHOP-API callback: action=0 Prepare, action=1 Complete. Requests are verified with
 * the MD5 sign_string; merchant_trans_id is our deposit id. Click expects HTTP 200 + JSON.
 */
const reply=(fields:Record<string,unknown>,error:number,note:string)=>Response.json({...fields,error,error_note:note});

export async function POST(request:Request){
  let f:URLSearchParams;
  try{f=new URLSearchParams(await request.text())}catch{return reply({},-8,'Error in request from click')}
  const get=(k:string)=>f.get(k)??'';
  const clickTransId=get('click_trans_id'),depositId=get('merchant_trans_id'),amount=get('amount'),action=get('action'),prepareId=get('merchant_prepare_id');
  const base={click_trans_id:clickTransId,merchant_trans_id:depositId};
  const secret=env.CLICK_SECRET_KEY?.trim();
  if(!secret||!clickTransId||!depositId||!amount||!get('sign_time')||!get('sign_string'))return reply(base,-8,'Error in request from click');
  if(get('service_id')!==env.CLICK_SERVICE_ID?.trim())return reply(base,-1,'SIGN CHECK FAILED!');
  const sign=md5(clickTransId+get('service_id')+secret+depositId+(action==='1'?prepareId:'')+amount+action+get('sign_time'));
  if(sign!==get('sign_string').toLowerCase())return reply(base,-1,'SIGN CHECK FAILED!');
  if(action!=='0'&&action!=='1')return reply(base,-3,'Action not found');
  const d=await depositById(depositId);
  if(!d)return reply(base,-5,'User does not exist');
  if(Math.abs(Number(amount)-d.amount)>0.009)return reply(base,-2,'Incorrect parameter amount');
  if(d.state==='paid')return reply(base,-4,'Already paid');
  if(action==='0'){
    if(!payable(d))return reply(base,-9,'Transaction cancelled');
    const merchantPrepareId=d.click_prepare_id??crypto.getRandomValues(new Uint32Array(1))[0]%2000000000+1;
    await env.DB!.prepare("UPDATE deposits SET click_trans_id=?,click_prepare_id=? WHERE id=? AND state='pending'").bind(clickTransId,merchantPrepareId,d.id).run();
    return reply({...base,merchant_prepare_id:merchantPrepareId},0,'Success');
  }
  if(!d.click_prepare_id||String(d.click_prepare_id)!==prepareId||d.click_trans_id!==clickTransId)return reply(base,-6,'Transaction does not exist');
  // Click reports a failed payment with a negative error; the order is then cancelled.
  if(Number(get('error'))<0){await cancelDeposit(d.id);return reply(base,-9,'Transaction cancelled')}
  if(!active(d))return reply(base,-9,'Transaction cancelled');
  if(!(await markPaid(d.id,'click')))return reply(base,-7,'Failed to update user');
  return reply({...base,merchant_confirm_id:d.click_prepare_id},0,'Success');
}
