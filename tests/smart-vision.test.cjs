const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Smart Vision rules: one table per person (zone under the lower body), seated = still and not
// tall-and-narrow, standing/moving people at a table mean staff (yellow "cleaning").
const window={};vm.runInNewContext(fs.readFileSync('public/smart-vision.js','utf8'),{window,localStorage:undefined,performance:{now:()=>0},requestAnimationFrame:()=>0,cancelAnimationFrame:()=>{}});
const {zoneOf,seated,rawStatus}=window.RFSmartVision,aspect=720/1280;
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
assert.ok(!fs.readFileSync('public/smart-vision.js','utf8').includes('toDataURL'),'no frames are captured or sent');
console.log('PASS smart vision: one table per person, seated vs standing, cleaning state, no frame upload');
