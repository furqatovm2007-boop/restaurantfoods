/* Loads the React Three Fiber bundle (public/rf-3d.js) only when a 3D feature is used. */
(()=>{'use strict';
 let pending=null,prefetched=false;
 const JS='/rf-3d.js?v=22',CSS='/rf-3d.css?v=18';
 // Download only (no parsing, so the page never stalls): the first open then starts from the cache.
 window.RF3DPrefetch=()=>{if(prefetched||window.RF3D||pending)return;prefetched=true;for(const [href,as] of [[JS,'script'],[CSS,'style']]){const l=document.createElement('link');l.rel='prefetch';l.href=href;l.as=as;document.head.append(l)}};
 window.RF3DLoad=()=>{if(window.RF3D)return Promise.resolve(window.RF3D);pending??=new Promise((resolve,reject)=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href=CSS;document.head.append(css);
  const script=document.createElement('script');script.src=JS;script.async=true;
  script.onload=()=>window.RF3D?resolve(window.RF3D):reject(new Error('RF3D_UNAVAILABLE'));
  script.onerror=()=>{pending=null;css.remove();script.remove();reject(new Error('RF3D_UNAVAILABLE'))};
  document.head.append(script)});return pending};
})();
