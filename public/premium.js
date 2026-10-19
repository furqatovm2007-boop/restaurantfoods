/* Decorative only: never delays or cancels an authentication, booking or navigation action. */
(()=>{'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
 const selector='button,a[href],[role="button"],.restaurant-card';
 const presses=new Map(),effects=new Set();let hover=null,frame=0,lastBurst=0;
 function target(node){const el=node?.closest?.(selector);return el&&!el.matches(':disabled,[aria-disabled="true"]')?el:null}
 function clear(){presses.clear();effects.forEach(x=>x.remove());effects.clear();if(frame)cancelAnimationFrame(frame);frame=0;hover?.classList.remove('cursor-lit');hover=null}
 function burst(el,x,y){if(reduced.matches||performance.now()-lastBurst<80)return;lastBurst=performance.now();
  while(effects.size>=4){const first=effects.values().next().value;first.remove();effects.delete(first)}
  const layer=document.createElement('div');layer.className='neon-burst';layer.setAttribute('aria-hidden','true');layer.style.left=x+'px';layer.style.top=y+'px';(el.closest('dialog[open]')||document.body).append(layer);effects.add(layer);
  const ripple=document.createElement('i');ripple.className='neon-ripple';layer.append(ripple);
  ripple.animate([{transform:'translate(-50%,-50%) scale(.1)',opacity:.65},{transform:'translate(-50%,-50%) scale(1)',opacity:0}],{duration:600,easing:'cubic-bezier(.15,.6,.3,1)',fill:'forwards'});
  for(let i=0;i<24;i++){const p=document.createElement('i'),angle=(i+Math.random()*.45)*Math.PI*2/24,distance=30+Math.random()*48,size=2+Math.random()*3;p.className='neon-particle';p.style.width=p.style.height=size+'px';layer.append(p);p.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:`translate(${Math.cos(angle)*distance}px,${Math.sin(angle)*distance}px) scale(0)`,opacity:0}],{duration:450+Math.random()*180,easing:'cubic-bezier(.15,.65,.3,1)',fill:'forwards'})}
  if(el instanceof HTMLElement)el.animate([{scale:'1'},{scale:'1.025',offset:.4},{scale:'1'}],{duration:220,easing:'ease-out'});
  setTimeout(()=>{layer.remove();effects.delete(layer)},650);
 }
 document.addEventListener('pointerdown',e=>{if(e.button!==0||reduced.matches)return;if(presses.size){presses.clear();return}const el=target(e.target);if(el)presses.set(e.pointerId,{el,x:e.clientX,y:e.clientY,at:performance.now(),moved:false})},{passive:true,capture:true});
 document.addEventListener('pointermove',e=>{const p=presses.get(e.pointerId);if(p&&Math.hypot(e.clientX-p.x,e.clientY-p.y)>8)p.moved=true;
  if(!fine.matches||e.pointerType!=='mouse'||reduced.matches)return;const el=target(e.target);if(hover!==el){hover?.classList.remove('cursor-lit');hover=el}if(!el||frame)return;frame=requestAnimationFrame(()=>{frame=0;if(!el.isConnected)return;const r=el.getBoundingClientRect();el.style.setProperty('--pointer-x',`${e.clientX-r.left}px`);el.style.setProperty('--pointer-y',`${e.clientY-r.top}px`);el.classList.add('cursor-lit')})
 },{passive:true});
 document.addEventListener('pointerup',e=>{const p=presses.get(e.pointerId);presses.delete(e.pointerId);if(p&&!p.moved&&performance.now()-p.at<700&&Math.hypot(e.clientX-p.x,e.clientY-p.y)<=8&&p.el.contains(document.elementFromPoint?.(e.clientX,e.clientY)||e.target))burst(p.el,e.clientX,e.clientY)},{passive:true,capture:true});
 document.addEventListener('pointercancel',e=>presses.delete(e.pointerId),{passive:true});
 document.addEventListener('scroll',()=>presses.forEach(p=>p.moved=true),{passive:true,capture:true});
 document.addEventListener('pointerout',e=>{if(hover&&!hover.contains(e.relatedTarget)){hover.classList.remove('cursor-lit');hover=null}},{passive:true});
 document.addEventListener('click',e=>{const card=e.target.closest('.restaurant-card');if(card&&!e.target.closest('a,button,input,select')&&!getSelection()?.toString()){const a=card.querySelector('a.primary');if(a)location.hash=a.hash}});
 window.addEventListener('pagehide',clear);reduced.addEventListener('change',clear);
 // Desktop dashboard navigation reuses the same authorized navigation links.
 const nav=document.getElementById('nav');let sidebar;
 function syncSidebar(){const management=/^#\/(manage|admin|courier|blog-admin)(\/|$)/.test(location.hash);document.body.classList.toggle('management-view',management);if(!sidebar){sidebar=document.createElement('aside');sidebar.className='management-sidebar';document.body.append(sidebar)}sidebar.hidden=!management;if(management){sidebar.innerHTML='<button class="quiet sidebar-toggle" aria-expanded="true">‹</button><nav>'+nav.innerHTML+'</nav>';sidebar.querySelector('button').setAttribute('aria-label',({uz:'Yon menyuni yig‘ish yoki ochish',ru:'Свернуть или развернуть меню',en:'Collapse or expand sidebar'})[window.RF_I18N?.lang||'ru']);sidebar.querySelector('button').onclick=e=>{const collapsed=document.body.classList.toggle('sidebar-collapsed');e.currentTarget.setAttribute('aria-expanded',String(!collapsed));e.currentTarget.textContent=collapsed?'›':'‹'}}}
 if(nav){new MutationObserver(syncSidebar).observe(nav,{childList:true});window.addEventListener('hashchange',syncSidebar);syncSidebar()}
})();
