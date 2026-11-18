const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
// Welcome guide (public/welcome-guide.js): opens once on a first visit to the home / catalogue page (not on
// other pages, not over a Telegram deep link, not after it was seen), in the site's language, types its words
// with the concierge's mouth following them, walks through the steps and remembers it was seen.
function run({hash='#/discover',search='',seen=null,lang='uz',mvp=false,muted=null}={}){
 const storage=new Map([...(seen?[['rf-guide-v1',seen]]:[]),...(muted?[['rf-guide-muted',muted]]:[])]),audio={played:[],paused:0},appended=[],timers=[],levels=[];
 const node=()=>{const n={children:[],classList:{set:new Set(),add(c){this.set.add(c)},remove(c){this.set.delete(c)},contains(c){return this.set.has(c)}},attrs:{},textContent:'',innerHTML:'',hidden:false,setAttribute(k,v){this.attrs[k]=v},append(...c){this.children.push(...c)},remove(){n.removed=true},getClientRects:()=>[1],getBoundingClientRect:()=>({top:200,bottom:300}),scrollIntoView(){},addEventListener(){},querySelector(s){n.q??={};return n.q[s]??=node()}};return n};
 const body=node();body.append=(...c)=>appended.push(...c);
 const document={readyState:'complete',documentElement:{lang},body,createElement:()=>node(),querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},removeEventListener(){}};
 const window={SIMPLE_MVP_MODE:mvp,RF_I18N:{lang},matchMedia:()=>({matches:false}),RFConcierge:{mount:()=>({mode(){},level(v,b){levels.push(v)},speak(){},gesture(){},destroy(){}})}};
 const ctx={window,document,location:{hash,search},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},setTimeout:(fn)=>{timers.push(fn);return timers.length},clearInterval(){},setInterval:(fn)=>{ctx._typer=fn;return 1},requestAnimationFrame:fn=>fn(),addEventListener(){},getComputedStyle:()=>({visibility:'visible'}),innerHeight:800,fetch:async()=>({status:401,ok:false}),Audio:class{constructor(){this.src='';this.muted=false;this.currentTime=0}play(){audio.played.push(this.src);return Promise.resolve()}pause(){audio.paused++}}};
 vm.runInNewContext(fs.readFileSync('public/welcome-guide.js','utf8'),ctx);
 const flush=()=>{while(timers.length)timers.shift()()};
 return {window,appended,storage,flush,levels,ctx,audio};
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
// SIMPLE_MVP_MODE: three steps with the recorded voice per language and step; a new step stops the previous
// recording; Mute pauses it and is remembered; no browser speech synthesis.
(async()=>{
 const tick=()=>new Promise(ok=>setImmediate(ok));
 for(const [l,done,mute,skip] of [['uz','Boshladik ✓','🔇 Ovozni o‘chirish','O‘tkazib yuborish'],['ru','Поехали ✓','🔇 Без звука','Пропустить'],['en','Let’s go ✓','🔇 Mute','Skip']]){
  const r=run({mvp:true,lang:l});r.flush();await tick();const g=r.appended[0];
  assert.ok(g.innerHTML.includes(skip)&&g.innerHTML.includes(mute),l+' labels');
  assert.match(g.q['[data-dots]'].innerHTML,/^(<i[^>]*><\/i>){3}$/,'three steps');assert.deepEqual([...r.audio.played],['/audio/concierge/'+l+'-step1.mp3']);
  g.q['[data-next]'].onclick();await tick();assert.equal(r.audio.played.at(-1),'/audio/concierge/'+l+'-step2.mp3');assert.ok(r.audio.paused>=1,'the previous recording stops');
  g.q['[data-next]'].onclick();await tick();assert.equal(r.audio.played.at(-1),'/audio/concierge/'+l+'-step3.mp3');assert.equal(g.q['[data-next]'].textContent,done);
  const before=r.audio.played.length;g.q['[data-voice]'].onclick();assert.equal(r.storage.get('rf-guide-muted'),'1');assert.match(g.q['[data-voice]'].textContent,/🔊/);
  g.q['[data-next]'].onclick();r.flush();await tick();assert.equal(r.audio.played.length,before,'muted: nothing more plays');assert.equal(r.storage.get('rf-guide-v1'),'1','finished');
 }
 const r=run({mvp:true,muted:'1'});r.flush();await tick();assert.equal(r.audio.played.length,0,'remembered mute');r.appended[0].q['[data-voice]'].onclick();await tick();assert.equal(r.audio.played.at(-1),'/audio/concierge/uz-step1.mp3','unmute plays the current step');
 assert.ok(!/speechSynthesis/.test(fs.readFileSync('public/welcome-guide.js','utf8')),'no browser speech synthesis');
 for(const l of ['uz','ru','en'])for(const n of [1,2,3])assert.ok(fs.readFileSync('public/audio/concierge/README.md','utf8').includes(l+'-step'+n+'.mp3'));
 console.log('PASS welcome guide (MVP): 3 steps in uz/ru/en, recorded voice per language and step, previous clip stops, mute remembered, no speech synthesis.');
})().catch(e=>{console.error(e);process.exitCode=1});
