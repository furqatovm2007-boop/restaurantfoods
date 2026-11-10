const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
// Welcome guide (public/welcome-guide.js): opens once on a first visit to the home / catalogue page (not on
// other pages, not over a Telegram deep link, not after it was seen), in the site's language, types its words
// with the concierge's mouth following them, walks through the steps and remembers it was seen.
function run({hash='#/discover',search='',seen=null,lang='uz'}={}){
 const storage=new Map(seen?[['rf-guide-v1',seen]]:[]),appended=[],timers=[],levels=[];
 const node=()=>{const n={children:[],classList:{set:new Set(),add(c){this.set.add(c)},remove(c){this.set.delete(c)},contains(c){return this.set.has(c)}},attrs:{},textContent:'',innerHTML:'',hidden:false,setAttribute(k,v){this.attrs[k]=v},append(...c){this.children.push(...c)},remove(){n.removed=true},getClientRects:()=>[1],getBoundingClientRect:()=>({top:200,bottom:300}),scrollIntoView(){},addEventListener(){},querySelector(s){n.q??={};return n.q[s]??=node()}};return n};
 const body=node();body.append=(...c)=>appended.push(...c);
 const document={readyState:'complete',documentElement:{lang},body,createElement:()=>node(),querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},removeEventListener(){}};
 const window={RF_I18N:{lang},matchMedia:()=>({matches:false}),RFConcierge:{mount:()=>({mode(){},level(v,b){levels.push(v)},speak(){},gesture(){},destroy(){}})}};
 const ctx={window,document,location:{hash,search},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},setTimeout:(fn)=>{timers.push(fn);return timers.length},clearInterval(){},setInterval:(fn)=>{ctx._typer=fn;return 1},requestAnimationFrame:fn=>fn(),addEventListener(){},getComputedStyle:()=>({visibility:'visible'}),innerHeight:800,fetch:async()=>({status:401,ok:false})};
 vm.runInNewContext(fs.readFileSync('public/welcome-guide.js','utf8'),ctx);
 const flush=()=>{while(timers.length)timers.shift()()};
 return {window,appended,storage,flush,levels,ctx};
}
let r=run();r.flush();assert.equal(r.appended.length,1,'first visit on the catalogue: the guide opens');
const box=r.appended[0];assert.match(box.innerHTML,/RestaurantFoods konsyerji/);assert.match(box.innerHTML,/O‘tkazib yuborish/);assert.match(box.innerHTML,/Ovoz bilan/);
const text=box.q['[data-text]'];for(let i=0;i<200;i++)r.ctx._typer?.();assert.match(text.textContent,/^👋 Assalomu alaykum! Men RestaurantFoods konsyerjiman/);assert.ok(r.levels.some(v=>v>0.5)&&r.levels.includes(0),'the mouth opens on vowels and closes on m/b/p and pauses');assert.equal(r.levels.at(-1),null,'and stops when the text is out');
assert.match(box.q['[data-dots]'].innerHTML,/(<i[^>]*><\/i>){7}/,'seven steps');
for(let i=0;i<6;i++)box.q['[data-next]'].onclick();assert.equal(box.q['[data-next]'].textContent,'Boshlash ✓','last step');box.q['[data-next]'].onclick();r.flush();assert.equal(r.storage.get('rf-guide-v1'),'1','remembered');assert.ok(box.removed,'closed');
for(const [opts,why] of [[{hash:'#/cart'},'other pages'],[{search:'?source=tg_miniapp&restaurant_id=r1&action=book'},'Telegram deep link'],[{seen:'1'},'already seen']]){r=run(opts);r.flush();assert.equal(r.appended.length,0,why)}
r=run({lang:'ru',hash:''});r.flush();assert.match(r.appended[0].innerHTML,/Консьерж RestaurantFoods/);assert.match(r.appended[0].innerHTML,/Пропустить/);r.appended[0].q['[data-skip]'].onclick();assert.equal(r.storage.get('rf-guide-v1'),'1','skip is remembered');
r=run({lang:'en'});r.flush();assert.match(r.appended[0].innerHTML,/RestaurantFoods concierge/);
// The three languages tell the same tour.
const src=fs.readFileSync('public/welcome-guide.js','utf8');const counts=['uz','ru','en'].map(l=>src.split('\n    '+l+': {')[1].split('next:')[0].match(/\['/g).length);assert.deepEqual(counts,[7,7,7]);
console.log('PASS welcome guide: first visit only on the catalogue (not other pages, Telegram deep links or after seen), uz/ru/en, typed words drive the mouth, 7 steps, remembered on finish and skip.');
