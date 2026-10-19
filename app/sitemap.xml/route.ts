import {sitemap} from '../seo';
export const dynamic='force-dynamic';
export async function GET(){try{return await sitemap()}catch{return new Response('Sitemap temporarily unavailable',{status:503,headers:{'Retry-After':'60','Cache-Control':'no-store'}})}}
