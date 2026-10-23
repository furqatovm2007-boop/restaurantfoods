/* Loads the React Three Fiber bundle (public/rf-3d.js) only when a 3D feature is used. */
(()=>{'use strict';
 let pending=null;
 window.RF3DLoad=()=>{if(window.RF3D)return Promise.resolve(window.RF3D);pending??=new Promise((resolve,reject)=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='/rf-3d.css?v=13';document.head.append(css);
  const script=document.createElement('script');script.src='/rf-3d.js?v=13';script.async=true;
  script.onload=()=>window.RF3D?resolve(window.RF3D):reject(new Error('RF3D_UNAVAILABLE'));
  script.onerror=()=>{pending=null;css.remove();script.remove();reject(new Error('RF3D_UNAVAILABLE'))};
  document.head.append(script)});return pending};
})();
