/* Decorative interactions never cancel or delay the underlying action. */
(()=>{'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
 const selector='button,a[href],[role="button"],.restaurant-card',presses=new Map(),effects=new Map(),contacts=new Set();
 let hover=null,hoverPoint=null,frame=0,lastBurst=-Infinity;
 function target(node){const el=node?.closest?.(selector);return el&&!el.matches(':disabled,[aria-disabled="true"]')?el:null}
 function unlight(){if(hover){hover.classList.remove('cursor-lit');hover.style.removeProperty('--tilt-x');hover.style.removeProperty('--tilt-y')}hover=null;hoverPoint=null}
 function clear(){presses.clear();contacts.clear();for(const [el,timer] of effects){clearTimeout(timer);el.remove()}effects.clear();if(frame)cancelAnimationFrame(frame);frame=0;unlight()}
 function burst(el,x,y){if(reduced.matches||performance.now()-lastBurst<80||!Element.prototype.animate)return;lastBurst=performance.now();
  while(effects.size>=4){const first=effects.keys().next().value;clearTimeout(effects.get(first));first.remove();effects.delete(first)}
  const layer=document.createElement('div');layer.className='neon-burst';layer.setAttribute('aria-hidden','true');layer.style.left=x+'px';layer.style.top=y+'px';(el.closest('dialog[open]')||document.body).append(layer);
  const ripple=document.createElement('i');ripple.className='neon-ripple';layer.append(ripple);
  ripple.animate([{transform:'translate(-50%,-50%) scale(.1)',opacity:.6},{transform:'translate(-50%,-50%) scale(1)',opacity:0}],{duration:600,easing:'cubic-bezier(.15,.6,.3,1)',fill:'forwards'});
  for(let i=0;i<24;i++){const p=document.createElement('i'),angle=(i+Math.random()*.4)*Math.PI*2/24,distance=34+Math.random()*42,size=2+Math.random()*3;p.className='neon-particle';p.style.width=p.style.height=size+'px';layer.append(p);p.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:`translate(${Math.cos(angle)*distance}px,${Math.sin(angle)*distance}px) scale(0)`,opacity:0}],{duration:450+Math.random()*180,easing:'cubic-bezier(.15,.65,.3,1)',fill:'forwards'})}
  if(el instanceof HTMLElement)el.animate([{scale:'1'},{scale:'1.025',offset:.4},{scale:'1'}],{duration:220,easing:'ease-out'});
  effects.set(layer,setTimeout(()=>{layer.remove();effects.delete(layer)},650));
 }
 document.addEventListener('pointerdown',e=>{if(e.button!==0||reduced.matches)return;contacts.add(e.pointerId);if(contacts.size>1){presses.clear();return}const el=target(e.target);if(el)presses.set(e.pointerId,{el,x:e.clientX,y:e.clientY,at:performance.now(),moved:false})},{passive:true,capture:true});
 document.addEventListener('pointermove',e=>{const p=presses.get(e.pointerId);if(p&&Math.hypot(e.clientX-p.x,e.clientY-p.y)>8)p.moved=true;
  if(!fine.matches||e.pointerType!=='mouse'||reduced.matches)return;const el=target(e.target);if(hover!==el){unlight();hover=el}if(!el)return;hoverPoint={x:e.clientX,y:e.clientY};if(frame)return;
  frame=requestAnimationFrame(()=>{frame=0;if(!hover?.isConnected||!hoverPoint)return;const r=hover.getBoundingClientRect(),x=hoverPoint.x-r.left,y=hoverPoint.y-r.top;hover.style.setProperty('--pointer-x',x+'px');hover.style.setProperty('--pointer-y',y+'px');hover.style.setProperty('--tilt-x',((.5-y/Math.max(r.height,1))*4)+'deg');hover.style.setProperty('--tilt-y',((x/Math.max(r.width,1)-.5)*4)+'deg');hover.classList.add('cursor-lit')});
 },{passive:true});
 document.addEventListener('pointerup',e=>{const p=presses.get(e.pointerId);presses.delete(e.pointerId);contacts.delete(e.pointerId);if(p&&!p.moved&&performance.now()-p.at<700&&Math.hypot(e.clientX-p.x,e.clientY-p.y)<=8&&!p.el.matches(':disabled,[aria-disabled="true"]')&&p.el.contains(document.elementFromPoint?.(e.clientX,e.clientY)||e.target))burst(p.el,e.clientX,e.clientY)},{passive:true,capture:true});
 document.addEventListener('pointercancel',e=>{presses.delete(e.pointerId);contacts.delete(e.pointerId)},{passive:true});
 document.addEventListener('scroll',()=>presses.forEach(p=>p.moved=true),{passive:true,capture:true});
 document.addEventListener('pointerout',e=>{if(hover&&!hover.contains(e.relatedTarget))unlight()},{passive:true});
 document.addEventListener('click',e=>{const card=e.target.closest('.restaurant-card');if(card&&!e.target.closest('a,button,input,select')&&!getSelection()?.toString()){const a=card.querySelector('a.primary');if(a)location.hash=a.hash}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clear()});window.addEventListener('pagehide',clear);window.addEventListener('hashchange',()=>{presses.clear();contacts.clear();unlight()});reduced.addEventListener('change',clear);
 // Reveal only once, then stop observing: no continuous scroll handler or hidden content without JS.
 const content=document.getElementById('content');let revealObserver;
 function reveal(){if(!content)return;revealObserver?.disconnect();if(reduced.matches||!window.IntersectionObserver)return;revealObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('market-reveal');revealObserver.unobserve(entry.target)}},{threshold:.08});content.querySelectorAll('.restaurant-card,.market-promo,.market-hero').forEach((el,i)=>{el.style.setProperty('--reveal-delay',Math.min(i%3,2)*55+'ms');revealObserver.observe(el)})}
 if(content){new MutationObserver(reveal).observe(content,{childList:true});reveal()}
 const nav=document.getElementById('nav');let sidebar;
 function syncSidebar(){const management=/^#\/(manage|admin|courier|blog-admin)(\/|$)/.test(location.hash);document.body.classList.toggle('management-view',management);if(!sidebar){sidebar=document.createElement('aside');sidebar.className='management-sidebar';document.body.append(sidebar)}sidebar.hidden=!management;if(management){const collapsed=document.body.classList.contains('sidebar-collapsed');sidebar.innerHTML='<button class="quiet sidebar-toggle" aria-expanded="'+!collapsed+'">'+(collapsed?'›':'‹')+'</button><nav>'+nav.innerHTML+'</nav>';sidebar.querySelector('button').setAttribute('aria-label',({uz:'Yon menyuni yig‘ish yoki ochish',ru:'Свернуть или развернуть меню',en:'Collapse or expand sidebar'})[window.RF_I18N?.lang||'ru']);sidebar.querySelector('button').onclick=e=>{const collapsed=document.body.classList.toggle('sidebar-collapsed');e.currentTarget.setAttribute('aria-expanded',String(!collapsed));e.currentTarget.textContent=collapsed?'›':'‹'}}}
 if(nav){new MutationObserver(syncSidebar).observe(nav,{childList:true});window.addEventListener('hashchange',syncSidebar);syncSidebar()}
})();
