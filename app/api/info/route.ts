import {env} from 'cloudflare:workers';
import {faqs,languages,type Language} from '../../seo-copy';
import {ApiError,json,failure} from '../../http';
export const dynamic='force-dynamic';
// Public reading API: never return draft articles or administrative fields.
export async function GET(request:Request){try{
 const query=new URL(request.url).searchParams,lang=query.get('lang')||'ru';
 if(!languages.includes(lang as Language))throw new ApiError(400,'Til noto‘g‘ri.');
 if(query.get('section')!=='blog')return json({faqs:faqs[lang as Language]});
 const slug=query.get('slug');
 if(slug){if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||slug.length>100)throw new ApiError(400,'INVALID_REQUEST');
  const post=await env.DB!.prepare("SELECT slug,title,description,content,updated_at FROM blog_posts WHERE lang=? AND slug=? AND status='published'").bind(lang,slug).first();
  return json({post:post||null});
 }
 const posts=(await env.DB!.prepare("SELECT slug,title,description,updated_at FROM blog_posts WHERE lang=? AND status='published' ORDER BY updated_at DESC LIMIT 100").bind(lang).all()).results;
 return json({posts});
 }catch(e){return failure(e)}}
