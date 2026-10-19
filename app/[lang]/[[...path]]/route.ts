import {renderHome} from '../../route';
import {publicPage} from '../../seo';
import {Language,languages} from '../../seo-copy';
export const dynamic='force-dynamic';
export async function GET(request:Request){const [lang,...parts]=new URL(request.url).pathname.split('/').filter(Boolean);if(!languages.includes(lang as Language))return new Response('Not found',{status:404,headers:{'X-Robots-Tag':'noindex'}});try{if(!parts.length)return await renderHome(lang as Language);return await publicPage(lang as Language,parts.length?'/'+parts.join('/'):'')}catch{return new Response('Temporarily unavailable. Please try again.',{status:503,headers:{'Retry-After':'60','X-Robots-Tag':'noindex','Cache-Control':'no-store'}})}}
