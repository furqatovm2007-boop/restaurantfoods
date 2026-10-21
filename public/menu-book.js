/* Paginated menu keeps the original form controls in place; turns are decorative snapshots. */
(()=>{'use strict';
 const controllers=new WeakMap(),live=new Set(),motion=matchMedia('(prefers-reduced-motion: reduce)');
 const words={uz:{page:'Varaq',of:'/',empty:'Taomlar yo‘q'},ru:{page:'Страница',of:'/',empty:'Нет блюд'},en:{page:'Page',of:'/',empty:'No dishes'}};
 let paperAudio=null,paperMedia=null,paperSound=true;const paperSources=new Set();try{paperSound=localStorage.getItem('rf-book-sound')!=='off'}catch{}
 function rustle(){if(!paperSound)return;stopPaper();if(window.Audio)try{paperMedia??=new window.Audio(window.RF_PAGE_TURN_AUDIO||'/book-page-turn-v2.wav?v=55');paperMedia.preload='auto';paperMedia.volume=.9;paperMedia.currentTime=0;const playback=paperMedia.play();playback?.catch(()=>{});return}catch{}try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;paperAudio??=new Audio();const context=paperAudio;if(context.state==='suspended')context.resume().catch(()=>{});if(context.state==='closed')return;const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*.48),context.sampleRate),samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*(.65+.35*Math.sin(i*.009));const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain(),now=context.currentTime;source.buffer=buffer;filter.type='bandpass';filter.frequency.setValueAtTime(1700,now);filter.frequency.exponentialRampToValueAtTime(850,now+.43);filter.Q.value=.65;gain.gain.setValueAtTime(.0001,now);gain.gain.linearRampToValueAtTime(.038,now+.09);gain.gain.linearRampToValueAtTime(.06,now+.23);gain.gain.exponentialRampToValueAtTime(.0001,now+.47);source.connect(filter);filter.connect(gain);gain.connect(context.destination);source.onended=()=>{paperSources.delete(source);source.disconnect();filter.disconnect();gain.disconnect()};paperSources.add(source);source.start(now);source.stop(now+.48)}catch{}}
 function stopPaper(){if(paperMedia)try{paperMedia.pause();paperMedia.currentTime=0}catch{}for(const source of paperSources)try{source.stop()}catch{}paperSources.clear()}
 function soundButton(button){if(!button)return;const paint=()=>{button.setAttribute('aria-pressed',String(paperSound));const lang=document.documentElement.lang,copy={uz:['Varaq ovozi yoqilgan','Varaq ovozi o‘chirilgan'],ru:['Звук страниц включён','Звук страниц выключен'],en:['Page sound on','Page sound off']};button.textContent=(paperSound?'♫ ':'♩ ')+(copy[lang]||copy.ru)[paperSound?0:1]};paint();button.onclick=()=>{paperSound=!paperSound;try{localStorage.setItem('rf-book-sound',paperSound?'on':'off')}catch{}if(!paperSound)stopPaper();else rustle();document.querySelectorAll('[data-book-sound]').forEach(soundButton)}}
 function bind(root){if(!root||controllers.has(root))return;const pages=[...root.querySelectorAll('[data-menu-page]')],stage=root.querySelector('[data-book-stage]'),cover=root.querySelector('[data-book-open]'),toolbar=root.querySelector('[data-book-toolbar]'),prev=root.querySelector('[data-book-prev]'),next=root.querySelector('[data-book-next]'),status=root.querySelector('[data-book-status]'),nav=root.querySelector('.menu-categories');if(!pages.length||!stage||!cover||!toolbar||!prev||!next||!status||!nav)return;
  let filtered=pages,category='all',offset=0,size=1,opened=false,turn=null,drag=null,lastWidth=null;const contacts=new Set();
  function cancelTurn(){const current=turn;if(!current)return;turn=null;clearTimeout(current.timer);current.animation?.cancel();current.node.remove()}
  // The reference bends a subdivided sheet with sin(u * PI) in a vertex shader.
  // Apply the same curve to DOM strips so real menu controls remain accessible.
  function sheetPoint(u,p,width,back,rigid){
   const angle=p*Math.PI,bow=rigid?0:Math.sin(u*Math.PI)*Math.sin(p*Math.PI)*width*.18;
   const x=u*width*Math.cos(angle)-bow*Math.sin(angle),z=u*width*Math.sin(angle)+bow*Math.cos(angle);
   return {x:back?width-x:x,z};
  }
  function animateTurn(page,back=false,reversePage=null){
   cancelTurn();if(!page?.isConnected)return;rustle();
   if(motion.matches||typeof window.requestAnimationFrame!=='function')return;
   const rect=page.getBoundingClientRect();if(!rect.width||!rect.height)return;
   const scene=document.createElement('div');scene.className='paper-curl-scene reference-book-turn';scene.setAttribute('aria-hidden','true');scene.setAttribute('inert','');
   Object.assign(scene.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});scene.style.setProperty('--turn-height',rect.height+'px');
   const hinge=document.createElement('div');hinge.className='paper-curl-hinge';scene.append(hinge);
   const rigid=page===cover,count=rigid?1:(rect.width<420?20:28),w=rect.width/count,strips=[];
   for(let i=0;i<count;i++){
    const strip=document.createElement('div');strip.className='paper-curl-strip';
    Object.assign(strip.style,{left:'0',width:(w+.5)+'px',height:rect.height+'px',transformOrigin:'left center'});
    const front=document.createElement('div');front.className='paper-curl-front menu-book';
    const snapshot=page.cloneNode(true);snapshot.hidden=false;snapshot.removeAttribute('id');snapshot.removeAttribute('name');
    for(const el of snapshot.querySelectorAll('[id],[name],[for]')){el.removeAttribute('id');el.removeAttribute('name');el.removeAttribute('for')}
    for(const el of snapshot.querySelectorAll('button,input,select,textarea')){el.disabled=true;el.tabIndex=-1}
    Object.assign(snapshot.style,{position:'absolute',left:-i*w+'px',top:'0',width:rect.width+'px',height:rect.height+'px',margin:'0',boxSizing:'border-box',transform:'none'});
    front.append(snapshot);const reverse=document.createElement('div');reverse.className='paper-curl-back';
    if(reversePage){const backContent=document.createElement('div');backContent.className='menu-book';const backSnapshot=reversePage.cloneNode(true);backSnapshot.hidden=false;backSnapshot.removeAttribute('id');backSnapshot.removeAttribute('name');
     for(const el of backSnapshot.querySelectorAll('[id],[name],[for]')){el.removeAttribute('id');el.removeAttribute('name');el.removeAttribute('for')}
     for(const el of backSnapshot.querySelectorAll('button,input,select,textarea')){el.disabled=true;el.tabIndex=-1}
     Object.assign(backSnapshot.style,{position:'absolute',left:-(count-1-i)*w+'px',top:'0',width:rect.width+'px',height:rect.height+'px',margin:'0',boxSizing:'border-box',transform:'none'});backContent.append(backSnapshot);reverse.append(backContent)}
    strip.append(front,reverse);hinge.append(strip);strips.push(strip);
   }
   document.body.append(scene);
   let frame=0,start=null,finished=false;
   const finish=()=>{if(finished)return;finished=true;window.cancelAnimationFrame(frame);scene.remove();if(turn===current)turn=null;clearTimeout(current.timer)};
   const current={node:scene,animation:{cancel:finish},timer:null};turn=current;
   function tick(now){
    if(finished)return;if(start===null)start=now;
    const elapsed=Math.min(1,(now-start)/(rigid?850:1050)),p=elapsed*elapsed*(3-2*elapsed);
    for(let i=0;i<count;i++){
     const a=sheetPoint(back?1-i/count:i/count,p,rect.width,back,rigid),b=sheetPoint(back?1-(i+1)/count:(i+1)/count,p,rect.width,back,rigid);
     const dx=b.x-a.x,dz=b.z-a.z,angle=-Math.atan2(dz,dx)*180/Math.PI,scale=Math.hypot(dx,dz)/w;
     strips[i].style.transform=`translate3d(${a.x}px,0,${a.z}px) rotateY(${angle}deg) scaleX(${scale})`;
     strips[i].style.setProperty('--turn-shade',String(Math.sin(p*Math.PI)*(.06+.12*i/count)));
    }
    scene.style.opacity=String(elapsed>.9?(1-elapsed)/.1:1);
    if(elapsed<1)frame=window.requestAnimationFrame(tick);else finish();
   }
   frame=window.requestAnimationFrame(tick);current.timer=setTimeout(finish,1400);
  }
  function paint(){pages.forEach(p=>p.hidden=!opened||!filtered.slice(offset,offset+size).includes(p));stage.hidden=!opened;toolbar.hidden=!opened;nav.hidden=!opened;cover.hidden=opened;root.classList.toggle('is-open',opened);root.style.setProperty('--book-progress',String(filtered.length?Math.min(1,(offset+size)/filtered.length):0));root.classList.toggle('is-spread',size===2);prev.disabled=offset===0;next.disabled=offset+size>=filtered.length;const c=words[document.documentElement.lang]||words.ru;status.textContent=filtered.length?c.page+' '+(offset+1)+(Math.min(offset+size,filtered.length)>offset+1?'–'+Math.min(offset+size,filtered.length):'')+' '+c.of+' '+filtered.length:c.empty;root.querySelectorAll('[data-menu-category]').forEach(b=>{const key=b.dataset.menuCategory;const active=key===category;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))})}
  function open(){if(opened)return;animateTurn(cover);opened=true;paint();stage.focus({preventScroll:true})}
  function go(index){const to=Math.max(0,Math.min(Math.floor(index/size)*size,Math.max(0,Math.floor((filtered.length-1)/size)*size)));if(to===offset)return;const old=filtered[offset+(to>offset?size-1:0)]||filtered[offset];animateTurn(old,to<offset,filtered[to+(to<offset?size-1:0)]||filtered[to]);offset=to;paint()}
  function select(key){const subset=key==='all'?pages:pages.filter(p=>p.dataset.chapter===key);if(!subset.length)return;if(opened&&key!==category)animateTurn(filtered[offset],false,subset[0]);else open();category=key;filtered=subset;offset=0;paint()}
  function reveal(itemId){const item=root.querySelectorAll('input[name]');const input=[...item].find(i=>i.name===itemId),page=input?.closest('[data-menu-page]');if(!page)return;open();category='all';filtered=pages;go(pages.indexOf(page));paint()}
  function resize(){if(!root.isConnected){dispose();return}const width=root.getBoundingClientRect().width,wanted=width>=680?2:1;if(lastWidth!==null&&Math.abs(width-lastWidth)>1)cancelTurn();lastWidth=width;if(size!==wanted){cancelTurn();size=wanted;offset=Math.floor(offset/size)*size;paint()}}
  function keydown(e){if(e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,textarea,select,[contenteditable]'))return;if(e.target.closest('button,a'))return;if(opened&&['ArrowLeft','ArrowRight','PageUp','PageDown','Home','End','Escape'].includes(e.key)){e.preventDefault();if(e.key==='Escape')close();else go(e.key==='Home'?0:e.key==='End'?filtered.length-1:offset+(['ArrowRight','PageDown'].includes(e.key)?size:-size))}}
  function down(e){if(e.button!==0)return;contacts.add(e.pointerId);if(contacts.size>1){drag=null;return}if(!opened||e.target.closest('button,a,input,select,textarea,label'))return;drag={id:e.pointerId,x:e.clientX,y:e.clientY}}
  function up(e){contacts.delete(e.pointerId);if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)go(offset+(dx<0?size:-size))}
  function move(e){if(drag&&drag.id===e.pointerId&&Math.abs(e.clientY-drag.y)>24)drag=null}
  function cancel(e){contacts.delete(e.pointerId);drag=null}
  function reduce(){cancelTurn()}
  function close(){cancelTurn();stopPaper();opened=false;paint();cover.focus({preventScroll:true})}
  const closeButton=root.querySelector('[data-book-close]');if(closeButton)closeButton.onclick=close;
  cover.onclick=open;prev.onclick=()=>go(offset-size);next.onclick=()=>go(offset+size);root.addEventListener('keydown',keydown);stage.addEventListener('pointerdown',down,{passive:true});stage.addEventListener('pointermove',move,{passive:true});window.addEventListener('pointerup',up,{passive:true});stage.addEventListener('pointercancel',cancel,{passive:true});motion.addEventListener('change',reduce);window.addEventListener('scroll',reduce,{passive:true,capture:true});
  const observer=window.ResizeObserver?new ResizeObserver(resize):null;observer?.observe(root);if(!observer)window.addEventListener('resize',resize);
  function dispose(){cancelTurn();observer?.disconnect();motion.removeEventListener('change',reduce);window.removeEventListener('scroll',reduce,true);window.removeEventListener('resize',resize);root.removeEventListener('keydown',keydown);stage.removeEventListener('pointerdown',down);stage.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);stage.removeEventListener('pointercancel',cancel);live.delete(api);controllers.delete(root)}
  const api={root,open,select,reveal,dispose};controllers.set(root,api);live.add(api);root.classList.add('is-ready');if(paperSound&&window.Audio&&!paperMedia)try{paperMedia=new window.Audio(window.RF_PAGE_TURN_AUDIO||'/book-page-turn-v2.wav?v=55');paperMedia.preload='auto';paperMedia.volume=.9;paperMedia.load?.()}catch{}soundButton(root.querySelector('[data-book-sound]'));resize();paint();
 }
 window.RFMenuBook={bind,select(root,key){controllers.get(root)?.select(key)},reveal(form,itemId){const root=form?.querySelector('[data-menu-book]');controllers.get(root)?.reveal(itemId)}};
 const content=document.getElementById('content');if(content)new MutationObserver(()=>{for(const api of live)if(!api.root.isConnected)api.dispose()}).observe(content,{childList:true});
 window.addEventListener('pageshow',()=>document.querySelectorAll('[data-menu-book]').forEach(bind));
 window.addEventListener('hashchange',stopPaper);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPaper()});
 window.addEventListener('pagehide',()=>{stopPaper();try{paperAudio?.close()?.catch(()=>{})}catch{}paperAudio=null;for(const api of [...live])api.dispose()});
})();
