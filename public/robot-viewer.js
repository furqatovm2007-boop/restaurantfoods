/* Local user-provided GLB, displayed on a transparent canvas. */
(()=>{'use strict';
 let modulePromise=null;
 function load(){if(customElements.get('model-viewer'))return Promise.resolve();modulePromise??=import('/vendor/model-viewer-4.1.0.min.js').then(()=>customElements.whenDefined('model-viewer')).catch(error=>{modulePromise=null;throw error});return modulePromise}
 function legacy(model,callbacks={}){
  let closed=false,loaded=false,held=false,wanted='idle';
  const motion=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  function play(kind){wanted=kind;held=false;if(!loaded||closed)return;
   if(motion?.matches){model.pause();return}
   const clips=model.availableAnimations||[],name=clips.find(n=>/idle/i.test(n))||clips[0];if(!name)return;
   if(model.animationName!==name)model.animationName=name;
   // This file has one authored Experiment clip. Preserve its current time;
   // repeatedly restarting it on each guide step would cause visible stutter.
   model.play(kind==='gesture'?{repetitions:1}:{repetitions:Infinity})
  }
  function ready(){if(closed)return;loaded=true;if(held||motion?.matches)model.pause();else play(wanted);callbacks.ready?.()}
  function failed(){if(!closed)callbacks.error?.()}
  function finished(){if(!closed&&!held)play('idle')}
  function reduced(){if(motion?.matches)model.pause();else if(!held)play(wanted)}
  model.addEventListener('load',ready);model.addEventListener('error',failed);model.addEventListener('finished',finished);motion?.addEventListener?.('change',reduced);
  model.setAttribute('src','/models/assistant-robot.glb?v=52');
  load().catch(failed);
  return {gesture(){play('gesture')},idle(){play('idle')},pause(){held=true;model.pause?.()},speak(){},destroy(){closed=true;held=true;model.pause?.();model.removeEventListener('load',ready);model.removeEventListener('error',failed);model.removeEventListener('finished',finished);motion?.removeEventListener?.('change',reduced);model.removeAttribute('src')}}
 }
 // Prefer the React Three Fiber avatar (mouth follows the TTS audio); <model-viewer> remains the fallback.
 function webgl(){try{const c=document.createElement('canvas');return !!(c.getContext('webgl2')||c.getContext('webgl'))}catch{return false}}
 window.RFRobotViewer={mount(model,callbacks={}){
  if(typeof window.RF3DLoad!=='function'||!webgl())return legacy(model,callbacks);
  let closed=false,impl=null,fallback=null;const host=document.createElement('div');host.className='rf-avatar-3d';host.style.cssText='width:100%;height:100%;pointer-events:none';model.hidden=true;model.after(host);
  const useFallback=()=>{if(closed||fallback)return;impl?.destroy();impl=null;host.remove();model.hidden=false;fallback=legacy(model,callbacks)};
  window.RF3DLoad().then(api=>{if(closed)return;impl=api.avatar.mount(host,{onReady:()=>!closed&&callbacks.ready?.(),onError:useFallback});if(!impl)useFallback()}).catch(useFallback);
  const target=()=>impl||fallback;
  return {gesture(){target()?.gesture()},idle(){target()?.idle()},pause(){target()?.pause()},speak(analyser){impl?.speak(analyser)},mode(name){impl?.mode?.(name)},destroy(){closed=true;target()?.destroy();host.remove();model.hidden=false}}
 }};
})();
