'use strict';
const RF_I18N={lang:'ru',set(lang){this.lang=['ru','uz','en'].includes(lang)?lang:'ru';document.documentElement.lang=this.lang;try{localStorage.setItem('rf-language',this.lang)}catch{}},locale(){return {ru:'ru-RU',uz:'uz-UZ',en:'en-US'}[this.lang]}};
try{RF_I18N.set(localStorage.getItem('rf-language')||'ru')}catch{RF_I18N.set('ru')}
function t(source){if(typeof source!=='string')return source;const key=source.trim(),entry=RF_MESSAGES[key];if(entry)return source.replace(key,entry[RF_I18N.lang]||entry.uz);const password=source.match(/^Parol kamida (\d+) va ko‘pi bilan 128 belgi bo‘lsin\.$/);if(password)return t('Parol kamida')+' '+password[1]+' '+t('va ko‘pi bilan 128 belgi bo‘lsin.');return source;}
// Only static template segments pass through this function. Dynamic names, addresses,
// menu descriptions and reviews are already escaped by the caller and remain untouched.
function ht(strings,...values){let tag=false,quote='',output='';for(let n=0;n<strings.length;n++){const s=strings[n];let chunk='',textMode=!tag;const flush=()=>{output+=textMode?t(chunk):chunk.replace(/(placeholder|aria-label|title)="([^"]*)"/g,(_,a,v)=>a+'="'+t(v).replaceAll('"','&quot;')+'"');chunk=''};for(const c of s){if(!tag&&c==='<'){flush();tag=true;textMode=false;chunk=c;continue}chunk+=c;if(tag){if(quote){if(c===quote)quote=''}else if(c==='"'||c==="'")quote=c;else if(c==='>'){flush();tag=false;textMode=true}}}flush();if(n<values.length)output+=values[n]??'';}return output;}
function lh(s){return ht([s])}

const requestedLanguage=new URLSearchParams(location.search).get('lang')||String(location.pathname||'').match(/^\/(ru|uz|en)\/?$/)?.[1];if(['ru','uz','en'].includes(requestedLanguage))RF_I18N.set(requestedLanguage);
