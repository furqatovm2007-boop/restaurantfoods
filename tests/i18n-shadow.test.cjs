const assert=require('node:assert/strict'),fs=require('node:fs');
// build-locales wraps UI text in t('…'). A local variable or parameter named `t` (a table, say)
// hides that function and the page crashes with "t is not a function" — this happened to the
// table plan. Scan every built UI script for a `t` binding whose scope calls t('…').
const files=fs.readdirSync('public').filter(f=>f.endsWith('.js')&&!/^rf-|\.min\.js$|^sw\.js$/.test(f));
const bad=[];
for(const f of files){const s=fs.readFileSync('public/'+f,'utf8');
 for(const m of s.matchAll(/function (\w*)\(([^)]*)\)\{|(?:const|let) t=|\(t(?:,[^)]*)?\)=>\{|[(,]t=>/g)){
  if(m[0].startsWith('function')&&!m[2].split(',').map(p=>p.split('=')[0].trim()).includes('t'))continue;
  // A block body ends where its opening brace closes; an expression body ends at the first unmatched bracket.
  const block=m[0].includes('{'),i=block?s.indexOf('{',m.index):m.index+m[0].length,seg=s.slice(i,i+6000);let depth=0,end=seg.length;
  for(let k=0;k<seg.length;k++){const c=seg[k];if('({['.includes(c))depth++;else if(')}]'.includes(c)){depth--;if(depth<0||(block&&depth===0)){end=k;break}}}
  if(/(?<![\w.$])t\('/.test(seg.slice(0,end)))bad.push(f+': '+s.slice(m.index,m.index+60));}}
assert.deepEqual(bad,[],'a `t` binding shadows the translation function');
console.log('PASS no UI script shadows t() ('+files.length+' files)');
