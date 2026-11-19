'use strict';
const RF_I18N={lang:'ru',set(lang){this.lang=['ru','uz','en'].includes(lang)?lang:'ru';document.documentElement.lang=this.lang;const l=this.lang;/* saved after the frame: the switch never waits for storage */(typeof setTimeout==='function'?setTimeout:f=>f())(()=>{try{localStorage.setItem('rf-language',l)}catch{}},0)},locale(){return {ru:'ru-RU',uz:'uz-UZ',en:'en-US'}[this.lang]}};
try{RF_I18N.set(localStorage.getItem('rf-language')||'ru')}catch{RF_I18N.set('ru')}
function t(source){if(typeof source!=='string')return source;const key=source.trim(),entry=RF_MESSAGES[key];if(entry)return source.replace(key,entry[RF_I18N.lang]||entry.uz);const password=source.match(/^Parol kamida (\d+) va ko‘pi bilan 128 belgi bo‘lsin\.$/);if(password)return t('Parol kamida')+' '+password[1]+' '+t('va ko‘pi bilan 128 belgi bo‘lsin.');return source;}
// Only static template segments pass through this function. Dynamic names, addresses,
// menu descriptions and reviews are already escaped by the caller and remain untouched.
function ht(strings,...values){let tag=false,quote='',output='';for(let n=0;n<strings.length;n++){const s=strings[n];let chunk='',textMode=!tag;const flush=()=>{output+=textMode?t(chunk):chunk.replace(/(placeholder|aria-label|title)="([^"]*)"/g,(_,a,v)=>a+'="'+t(v).replaceAll('"','&quot;')+'"');chunk=''};for(const c of s){if(!tag&&c==='<'){flush();tag=true;textMode=false;chunk=c;continue}chunk+=c;if(tag){if(quote){if(c===quote)quote=''}else if(c==='"'||c==="'")quote=c;else if(c==='>'){flush();tag=false;textMode=true}}}flush();if(n<values.length)output+=values[n]??'';}return output;}
function lh(s){return ht([s])}
/*
 * In-place translation of what is already on screen (used by the instant language switch so the hall plan is
 * not rebuilt): every text node and placeholder / aria-label / title under root whose text is a known message in
 * the old language gets the new language's text. Leading emoji / punctuation and a trailing ":" are kept.
 * Elements with data-no-i18n (and their children) are left alone.
 */
RF_I18N.reverse={};
RF_I18N.lookup=function(lang,text){let map=this.reverse[lang];if(!map){map=this.reverse[lang]=new Map();for(const [key,entry] of Object.entries(RF_MESSAGES)){const v=entry[lang]||(lang==='uz'?key:'');if(v&&!map.has(v))map.set(v,key)}}return map.get(text)};
RF_I18N.retranslate=function(root,from,to){if(!root||from===to||typeof document==='undefined')return 0;let n=0;const tr=text=>{const key=this.lookup(from,text),entry=key&&RF_MESSAGES[key],next=entry&&(entry[to]||entry.uz);return next&&next!==text?next:null};
 // The whole text, then without emoji / trailing punctuation, then the tail after a date or number ("2026-11-19 — band vaqtlar").
 const swap=raw=>{const str=String(raw),lead=str.match(/^\s*/)[0],trail=str.match(/\s*$/)[0],body=str.trim();if(!body||!/\p{L}/u.test(body))return null;let next=tr(body);if(next)return lead+next+trail;
  const m=body.match(/^([^\p{L}\p{N}]*)([\s\S]*?)([\s:.,!?…·]*)$/u);if(m&&m[2]&&(next=tr(m[2])))return lead+m[1]+next+m[3]+trail;
  const parts=body.split(/(?<=\s)/);for(let i=1;i<Math.min(parts.length,6);i++){const tail=parts.slice(i).join('');if((next=tr(tail)))return lead+parts.slice(0,i).join('')+next+trail}
  // …and the head before a time or number ("Bandlik yangilandi: 10:51:03").
  for(let i=parts.length-1;i>0;i--){const head=parts.slice(0,i).join(''),h=head.trimEnd(),bare=h.replace(/[:.,·•]+$/,'');const hit=tr(h)||(bare!==h&&tr(bare));if(hit)return lead+(bare!==h&&!tr(h)?hit+h.slice(bare.length):hit)+head.slice(h.length)+parts.slice(i).join('')+trail}return null};
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:node=>node.parentElement?.closest('script,style,[data-no-i18n]')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});for(let node=walker.nextNode();node;node=walker.nextNode()){const next=swap(node.nodeValue);if(next!==null){node.nodeValue=next;n++}}
 for(const el of root.querySelectorAll('[placeholder],[aria-label],[title]')){if(el.closest('[data-no-i18n]'))continue;for(const a of ['placeholder','aria-label','title']){const v=el.getAttribute(a);const next=v&&swap(v);if(next){el.setAttribute(a,next);n++}}}return n};

const requestedLanguage=new URLSearchParams(location.search).get('lang')||String(location.pathname||'').match(/^\/(ru|uz|en)\/?$/)?.[1];if(['ru','uz','en'].includes(requestedLanguage))RF_I18N.set(requestedLanguage);
