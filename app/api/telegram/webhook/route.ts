import { env } from 'cloudflare:workers';
import { handleUpdate } from '../../../telegram';
import { handleCallReply } from '../../../call-ai';
import { handleMenu } from '../../../telegram-menu';
import { sameSecret } from '../../../http';
export const dynamic='force-dynamic';
// Telegram signs every delivery with the secret_token given to setWebhook.
export async function POST(request:Request){const secret=env.TELEGRAM_WEBHOOK_SECRET?.trim();if(!secret||!(await sameSecret(request.headers.get('x-telegram-bot-api-secret-token')||'',secret)))return new Response('Forbidden',{status:403});let update:any;try{update=await request.json()}catch{return new Response('Bad request',{status:400})}try{// Answers to a Call AI confirmation first, then the customer menu (/start, /menu and its buttons), then the regular bot.
if(!(await handleCallReply(update))&&!(await handleMenu(update)))await handleUpdate(update)}catch{console.error(JSON.stringify({event:'telegram_update_failed'}))}return new Response('ok')}
