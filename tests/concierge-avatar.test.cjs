const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
// AI concierge (public/concierge-avatar.js): the mouth follows the analyser of the playing voice — closed
// smile in silence and the moment speak(null) arrives, open for loud speech, round for low (o/u) sounds and
// wide for bright (e/i/s) ones; blinks happen on their own; pause and destroy stop the animation loop.
const els=new Map(),el=sel=>{if(!els.has(sel))els.set(sel,{sel,attrs:{},dataset:{},setAttribute(k,v){this.attrs[k]=String(v)},removeAttribute(k){delete this.attrs[k]}});return els.get(sel)};
const svg={dataset:{},querySelector:el,querySelectorAll:s=>[el(s+'#1'),el(s+'#2')]};
const host={_h:'',set innerHTML(v){this._h=v},get innerHTML(){return this._h},querySelector:()=>svg};
let now=0,frames=[];const raf=fn=>{frames.push(fn);return frames.length};
const window={matchMedia:()=>({matches:false})};
vm.runInNewContext(fs.readFileSync('public/concierge-avatar.js','utf8'),{window,performance:{now:()=>now},requestAnimationFrame:raf,cancelAnimationFrame:()=>{frames=[]},setTimeout:fn=>fn(),Math,String,Number,Uint8Array});
let ready=0;const c=window.RFConcierge.mount(host,{ready:()=>ready++});
assert.equal(ready,1);assert.match(host.innerHTML,/<svg class="rf-concierge"/);assert.match(host.innerHTML,/data-mouth/);assert.ok(!/model-viewer|\.glb/.test(host.innerHTML),'no 3D model');
const tick=(n=1)=>{for(let i=0;i<n;i++){now+=16;const f=frames;frames=[];f.forEach(fn=>fn(now))}};
const gap=()=>{const d=el('[data-mouth-in]').attrs.d;const ys=[...d.matchAll(/-?\d+(?:\.\d+)?/g)].map(Number).filter((_,i)=>i%2===1);return Math.max(...ys)-Math.min(...ys)};
const width=()=>{const d=el('[data-lips]').attrs.d;const xs=[...d.matchAll(/-?\d+(?:\.\d+)?/g)].map(Number).filter((_,i)=>i%2===0);return Math.max(...xs)-Math.min(...xs)};
// A fake analyser: energy put in chosen frequency bands (48 kHz, 256 bins → 93.75 Hz per bin).
let spectrum=()=>0;const analyser={frequencyBinCount:256,context:{sampleRate:48000},getByteFrequencyData(a){for(let i=0;i<a.length;i++)a[i]=spectrum(i*93.75)}};
tick(3);assert.equal(el('[data-mouth-in]').attrs.opacity,'0','idle: closed smile');
c.mode('speaking');c.speak(analyser);
spectrum=f=>f>=150&&f<700?240:0;tick(8);assert.equal(el('[data-mouth-in]').attrs.opacity,'1','loud low voice opens the mouth');const roundGap=gap(),roundWidth=width();assert.ok(roundGap>4,'open: '+roundGap);
spectrum=f=>f>=1900&&f<4000?240:f>=150&&f<4000?20:0;tick(8);const wideWidth=width();assert.ok(wideWidth>roundWidth+4,'bright sounds are wider than round ones: '+wideWidth+' vs '+roundWidth);
spectrum=()=>0;tick(4);assert.equal(el('[data-mouth-in]').attrs.opacity,'0','silence closes the mouth within a few frames');
spectrum=f=>f>=150&&f<4000?230:0;tick(6);assert.equal(el('[data-mouth-in]').attrs.opacity,'1');c.speak(null);assert.equal(el('[data-mouth-in]').attrs.opacity,'0','speak(null) closes at once');
// Blink: within 4.5 s both lids close at least once.
let blinked=false;for(let i=0;i<300&&!blinked;i++){tick();blinked=/scale\(1 0\.[0-4]/.test(el('[data-lid]#1').attrs.transform||'')}assert.ok(blinked,'blinks on its own');
c.mode('listening');tick();assert.match(el('[data-brows]').attrs.transform,/-3\.5/,'listening raises the brows');assert.match(el('[data-head]').attrs.transform,/rotate\(-/,'listening tilts the head');
c.pause();tick();assert.equal(frames.length,0,'paused: no loop');c.idle();assert.equal(frames.length,1);c.destroy();assert.equal(host.innerHTML,'');tick();assert.equal(frames.length,0,'destroyed: no loop');
// Wired into the voice assistant instead of the old robot.
const chat=fs.readFileSync('public/ai-chat.js','utf8');assert.ok(chat.includes('data-avatar')&&!chat.includes('model-viewer'));assert.ok(!fs.existsSync('public/robot-viewer.js')&&!fs.existsSync('public/models/assistant-robot.glb'));
console.log('PASS concierge avatar: analyser lip-sync (open/round/wide, closes on silence and speak(null)), blinks, listening pose, pause/destroy stop the loop, old robot removed.');
