const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Smart Vision rules: one table per person (zone under the lower body), seated = still and not
// tall-and-narrow, standing/moving people at a table mean staff (yellow "cleaning").
const window={};vm.runInNewContext(fs.readFileSync('public/smart-vision.js','utf8'),{window,localStorage:undefined,performance:{now:()=>0},requestAnimationFrame:()=>0,cancelAnimationFrame:()=>{}});
const {zoneOf,seated,rawStatus,strongest}=window.RFSmartVision,aspect=720/1280;
const zones=[{table:1,x:.05,y:.4,w:.27,h:.45},{table:2,x:.37,y:.4,w:.27,h:.45},{table:3,x:.69,y:.4,w:.27,h:.45}];
// A webcam close-up spanning all three zones belongs to one table only: the one under the hips.
const closeUp={x:.15,y:0,w:.6,h:1,score:.9,moving:false};assert.equal(zoneOf(zones,closeUp),1,'one person, one table');
assert.equal(zoneOf(zones,{x:.08,y:.35,w:.2,h:.45}),0,'guest at table 1');
assert.equal(zoneOf(zones,{x:.4,y:0,w:.1,h:.2}),-1,'person far from every table');
const guest={x:.08,y:.35,w:.2,h:.45,score:.8,moving:false,zone:0},waiter={x:.1,y:.05,w:.1,h:.85,score:.8,moving:false,zone:0};
assert.equal(seated(guest,aspect),true,'seated shape');assert.equal(seated(waiter,aspect),false,'standing adult is tall and narrow');
assert.equal(seated({...guest,moving:true},aspect),false,'walking is not sitting');
assert.equal(rawStatus([guest],zones,[0],aspect),'occupied');
assert.equal(rawStatus([waiter],zones,[0],aspect),'cleaning','waiter alone at the table: yellow');
assert.equal(rawStatus([guest,waiter],zones,[0],aspect),'occupied','guests stay red while served');
assert.equal(rawStatus([],zones,[0],aspect),'free');
assert.equal(strongest(['free','cleaning']),'cleaning');assert.equal(strongest(['cleaning','occupied','free']),'occupied','two cameras on one table: the strongest reading wins');assert.equal(strongest([]),'free');
assert.ok(!fs.readFileSync('public/smart-vision.js','utf8').includes('toDataURL'),'no frames are captured or sent');
// AI table finder: boxes seen in most frames become zones (grown for the chairs), numbered row by row,
// left to right, free tables first; a box seen once (a passing tray, a false hit) is ignored.
const {tableZones}=window.RFSmartVision;
const jitter=(b,d)=>({x:b.x+d,y:b.y-d,w:b.w,h:b.h,score:.6});
const A={x:.6,y:.55,w:.2,h:.15},B={x:.1,y:.6,w:.2,h:.15},C={x:.35,y:.15,w:.15,h:.1};
const frames=Array.from({length:10},(_,i)=>[jitter(A,i%2?.005:-.005),jitter(B,.003),...(i<6?[jitter(C,0)]:[]),...(i===3?[{x:.9,y:.9,w:.05,h:.05,score:.4}]:[])]);
let z=tableZones(frames,[1,2,3,4,5]);
assert.equal(z.length,3,'three stable tables, the one-frame hit is dropped');
assert.equal(z.map(t=>t.table).join(),'1,2,3');
assert.ok(z[0].y<z[1].y&&z[1].x<z[2].x,'back row first, then left to right');
assert.ok(z.every(t=>t.ai===true&&t.x>=0&&t.y>=0&&t.x+t.w<=1.0001&&t.y+t.h<=1.0001),'inside the picture, marked as AI');
assert.ok(z[1].w>B.w&&z[1].h>B.h,'grown for the chairs');
z=tableZones(frames,[1,2,3,4,5],[1,2]);assert.equal(z.map(t=>t.table).join(),'3,4,5','tables another camera covers are numbered last');
assert.equal(tableZones(frames,[7]).length,1,'never more zones than tables');
assert.equal(tableZones([[],[],[]],[1,2]).length,0,'nothing found');
const svSrc=fs.readFileSync('public/smart-vision.js','utf8');
assert.ok(svSrc.includes("free: '#10b981'")&&svSrc.includes("occupied: '#ef4444'"),'green/red box colours');
console.log('PASS smart vision: one table per person, seated vs standing, cleaning state, AI table finder, no frame upload');
