const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
// Layout: compile the TS module on the fly and check the physical book structure.
const layoutSource=ts.transpileModule(fs.readFileSync('components/menu-book-3d/layout.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const layout={exports:{}};new Function('module','exports','require',layoutSource)(layout,layout.exports,require);
const {buildBook,spreadForPage,pagesAtSpread}=layout.exports;
const dish=(id,available=true)=>({id,name:'Dish '+id,price:'1 000',available});
for(const sizes of [[1],[2,3],[5,1,4],[0,2],Array.from({length:14},()=>1)]){
 const data={restaurantName:'R',chapters:sizes.map((n,i)=>({key:'c'+i,title:'Chapter '+i,dishes:Array.from({length:n},(_,j)=>dish(i+'-'+j,j!==2))}))};
 const {pages,sheets,toc}=buildBook(data);
 assert.equal(pages.length%2,0);assert.equal(sheets.length*2,pages.length);
 assert.equal(pages[0].content.kind,'cover');assert.equal(pages.at(-1).content.kind,'back-cover');
 assert.ok(sheets[0].rigid&&sheets.at(-1).rigid);assert.ok(sheets.slice(1,-1).every(s=>!s.rigid));
 assert.equal(toc.length,sizes.filter(Boolean).length);
 for(const entry of toc){const page=pages[entry.page];assert.equal(page.content.kind,'dishes');assert.equal(page.content.chapter.key,entry.chapterKey);assert.ok(page.content.first);
  const {left,right}=pagesAtSpread(spreadForPage(entry.page),sheets);assert.ok(left===page||right===page)}
 const listed=pages.flatMap(p=>p.content.kind==='dishes'?p.content.dishes.map(d=>d.id):[]);
 assert.deepEqual(listed,data.chapters.flatMap(c=>c.dishes.map(d=>d.id)));
 const folios=pages.map(p=>p.folio).filter(f=>f!==null);assert.deepEqual(folios,folios.map((_,i)=>i+1));
 assert.ok(pages.filter(p=>p.content.kind==='toc').every(p=>p.content.entries.length<=11));
}
// Site wiring: the launcher opens the full-screen book and adds dishes through the existing button only.
const source=fs.readFileSync('ui/restaurant.js','utf8');
assert.ok(source.includes('bindMenuCategories();bindMenuBook3D(r,menu);'));
const html=fs.readFileSync('app/site-html.ts','utf8');assert.ok(!html.includes('rf-3d.js'),'3D bundle loads on demand, not on every page');assert.ok(html.includes('/rf-3d-loader.js'));
const snippet=source.slice(source.indexOf('// Full-screen WebGL menu'),source.indexOf('// Subscription: 14-day'));
let opened=null,clicked=0;const cart={items:[]};
const input={value:'1'},add={click(){clicked++;cart.items.push({id:'a',quantity:Number(input.value)})}};
let formClick=null;const form={isConnected:true,classList:{add(c){form.added=c}},addEventListener:(type,fn)=>{if(type==='click')formClick=fn},elements:{namedItem:id=>id==='a'?input:null},querySelector:s=>s.includes('"a"')?add:null};
const attrs={},launcher={hidden:true,closest:()=>form,focus(){},getAttribute:k=>attrs[k]??null,setAttribute:(k,v)=>{attrs[k]=v},removeAttribute:k=>{delete attrs[k]}};
const ctx={document:{documentElement:{lang:'uz'},querySelector:s=>s==='[data-menu-3d-open]'?launcher:null,createElement:()=>({getContext:()=>({})})},
 window:{RF3DLoad:async()=>({fullscreenMenu:{open(props){opened=props;return {close(){}}}}})},CSS:{escape:s=>s},Promise,Map,Boolean,String,JSON,matchMedia:()=>({matches:false}),setTimeout,
 t:s=>'T:'+s,money:n=>n+' sum',notify:()=>{},menuCategory:m=>m.category,menuCategories:['Salatlar','Desertlar'],readCart:()=>cart};
vm.createContext(ctx);vm.runInContext(snippet,ctx);
ctx.bindMenuBook3D({name:'Real'},[{id:'b',category:'Desertlar',price:5,available:true},{id:'a',category:'Salatlar',price:3,available:true,image_url:'/x.jpg'}]);
assert.equal(launcher.hidden,false,'launcher shown once WebGL is available');assert.equal(form.added,'menu-3d-only','Business/Premium show only the 3D book');
(async()=>{const first=launcher.onclick();assert.equal(attrs['aria-busy'],'true','launcher shows loading while the bundle downloads');assert.equal(launcher.onclick(),undefined,'double tap does not load twice');await first;assert.equal(attrs['aria-busy'],undefined);await new Promise(r=>setTimeout(r,0));
 assert.ok(opened,'full-screen menu opened');assert.equal(opened.lang,'uz');assert.equal(opened.origin,launcher,'book grows out of the launcher');
 assert.deepEqual([...opened.data.chapters.map(c=>c.title)],['T:Salatlar','T:Desertlar']);
 assert.equal(opened.data.chapters[0].dishes[0].price,'3 sum');assert.equal(opened.data.chapters[0].dishes[0].image,'/x.jpg');
 assert.equal(opened.onAddToCart({id:'a'},4),true);assert.equal(input.value,'4');assert.equal(clicked,1);
 assert.equal(opened.onAddToCart({id:'missing'},1),false);assert.equal(clicked,1);
 // Tapping a dish photo opens the book on that dish, growing out of its card; controls do not.
 const card={dataset:{dish:'a'}},at=hit=>({target:{closest:s=>s==='.food-card[data-dish]'?card:s.startsWith('button')?(hit==='button'?{}:null):s==='.food-image,h3'?(hit==='photo'?{}:null):null}});
 opened=null;formClick(at('button'));await new Promise(r=>setTimeout(r,0));assert.equal(opened,null,'stepper buttons do not open the book');
 formClick(at('photo'));await new Promise(r=>setTimeout(r,0));assert.equal(opened.revealDishId,'a');assert.equal(opened.origin,card);
 console.log('menu-book-3d ok');
})();
