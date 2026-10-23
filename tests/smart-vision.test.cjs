const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Smart Vision zone rule: a person counts at a table when boxes overlap enough or their centre is inside.
const window={};vm.runInNewContext(fs.readFileSync('public/smart-vision.js','utf8'),{window,localStorage:undefined,performance:{now:()=>0},requestAnimationFrame:()=>0,cancelAnimationFrame:()=>{}});
const {overlaps}=window.RFSmartVision,zone={x:.1,y:.4,w:.3,h:.4};
assert.equal(overlaps(zone,{x:.15,y:.3,w:.15,h:.4}),true,'person seated at the table');
assert.equal(overlaps(zone,{x:.6,y:.3,w:.15,h:.4}),false,'person elsewhere');
assert.equal(overlaps(zone,{x:.38,y:.42,w:.2,h:.4}),false,'barely touching the edge');
assert.equal(overlaps(zone,{x:0,y:0,w:1,h:1}),true,'large box covering the zone');
assert.ok(!fs.readFileSync('public/smart-vision.js','utf8').includes('toDataURL'),'no frames are captured or sent');
console.log('PASS smart vision: zone overlap rule, no frame upload');
