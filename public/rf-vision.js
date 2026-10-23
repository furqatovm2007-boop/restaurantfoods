(function(){var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t)=>()=>(e&&(t=e(e=0)),t),s=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports),c=(e,n)=>{let r={};for(var i in e)t(r,i,{get:e[i],enumerable:!0});return n||t(r,Symbol.toStringTag,{value:`Module`}),r},l=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},u=(n,r,a)=>(a=n==null?{}:e(i(n)),l(r||!n||!n.__esModule?t(a,`default`,{value:n,enumerable:!0}):a,n)),d=e=>a.call(e,`module.exports`)?e[`module.exports`]:l(t({},`__esModule`,{value:!0}),e);function f(e){throw Error(`'${e}' not yet implemented or not found in the registry. This kernel may not be supported by the tfjs backend you have chosen`)}var p,m,h,g,_=o((()=>{p=1e-7,m=1e-4,h=class{constructor(e,t){this.backend=e,this.dataMover=t,this.data=new WeakMap,this.dataIdsCount=0}get(e){return this.data.has(e)||this.dataMover.moveData(this.backend,e),this.data.get(e)}set(e,t){this.dataIdsCount++,this.data.set(e,t)}has(e){return this.data.has(e)}delete(e){return this.dataIdsCount--,this.data.delete(e)}numDataIds(){return this.dataIdsCount}},g=class{refCount(e){return f(`refCount`)}incRef(e){return f(`incRef`)}timerAvailable(){return!0}time(e){return f(`time`)}read(e){return f(`read`)}readSync(e){return f(`readSync`)}readToGPU(e,t){return f(`readToGPU`)}numDataIds(){return f(`numDataIds`)}disposeData(e,t){return f(`disposeData`)}write(e,t,n){return f(`write`)}move(e,t,n,r,i){return f(`move`)}createTensorFromGPUData(e,t,n){return f(`createTensorFromGPUData`)}memory(){return f(`memory`)}floatPrecision(){return f(`floatPrecision`)}epsilon(){return this.floatPrecision()===32?p:m}dispose(){return f(`dispose`)}}}));function v(e){let t=e.length,n=0;for(;t>0;)n=Math.random()*t|0,t--,S(e,t,n)}function y(e,t){if(e.length!==t.length)throw Error(`Array sizes must match to be shuffled together First array length was ${e.length}Second array length was ${t.length}`);let n=e.length,r=0;for(;n>0;)r=Math.random()*n|0,n--,S(e,n,r),S(t,n,r)}function b(e,t,n){return Math.max(e,Math.min(t,n))}function x(e){return e%2==0?e:e+1}function S(e,t,n){let r=e[t];e[t]=e[n],e[n]=r}function C(e){let t=0;for(let n=0;n<e.length;n++)t+=e[n];return t}function w(e,t){let n=Math.random();return t*n+(1-n)*e}function T(e,t){let n=0;for(let r=0;r<e.length;r++){let i=Number(e[r])-Number(t[r]);n+=i*i}return n}function E(e,t){if(!e)throw Error(typeof t==`string`?t:t())}function D(e,t,n=``){E(k(e,t),()=>n+` Shapes ${e} and ${t} must match`)}function ee(e){E(e!=null,()=>`The input to the tensor constructor must be a non-null value.`)}function O(e){if(e.length===0)return 1;let t=e[0];for(let n=1;n<e.length;n++)t*=e[n];return t}function te(e){return e.length===0}function ne(e,t){if(e===t)return!0;if(e==null||t==null||e.length!==t.length)return!1;for(let n=0;n<e.length;n++)if(e[n]!==null&&t[n]!==null&&e[n]!==t[n])return!1;return!0}function k(e,t){if(e===t)return!0;if(e==null||t==null||e.length!==t.length)return!1;for(let n=0;n<e.length;n++)if(e[n]!==t[n])return!1;return!0}function re(e){return e%1==0}function ie(e){if(Math.tanh!=null)return Math.tanh(e);if(e===1/0)return 1;if(e===-1/0)return-1;{let t=Math.exp(2*e);return(t-1)/(t+1)}}function ae(e){let t=Math.ceil(Math.sqrt(e));return[t,Math.ceil(e/t)]}function oe(e){let t=new Uint32Array(e);for(let n=0;n<e;++n)t[n]=n;return v(t),t}function se(e,t){return t<=e.length?e:e+` `.repeat(t-e.length)}function ce(e,t=e=>0,n,r){return new Promise((i,a)=>{let o=0,s=()=>{if(e()){i();return}o++;let c=t(o);if(n!=null&&o>=n){a();return}r==null?setTimeout(s,c):r(s,c)};s()})}function le(e,t){let n=1,r=-1;for(let t=0;t<e.length;++t)if(e[t]>=0)n*=e[t];else if(e[t]===-1){if(r!==-1)throw Error(`Shapes can only have 1 implicit size. Found -1 at dim ${r} and dim ${t}`);r=t}else if(e[t]<0)throw Error(`Shapes can not be < 0. Found ${e[t]} at dim ${t}`);if(r===-1){if(t>0&&t!==n)throw Error(`Size(${t}) must match the product of shape ${e}`);return e}if(n===0)throw Error(`Cannot infer the missing size in [${e}] when there are 0 elements`);if(t%n!==0)throw Error(`The implicit shape can't be a fractional number. Got ${t} / ${n}`);let i=e.slice();return i[r]=t/n,i}function A(e,t){let n=t.length;return e=e==null?t.map((e,t)=>t):[].concat(e),E(e.every(e=>e>=-n&&e<n),()=>`All values in axis param must be in range [-${n}, ${n}) but got axis ${e}`),E(e.every(e=>re(e)),()=>`All values in axis param must be integers but got axis ${e}`),e.map(e=>e<0?n+e:e)}function ue(e,t){let n=[],r=[],i=t!=null&&Array.isArray(t)&&t.length===0,a=t==null||i?null:A(t,e).sort(),o=0;for(let t=0;t<e.length;++t){if(a!=null){if(a[o]===t&&e[t]!==1)throw Error(`Can't squeeze axis ${t} since its dim '${e[t]}' is not 1`);(a[o]==null||a[o]>t)&&e[t]===1&&(n.push(e[t]),r.push(t)),a[o]<=t&&o++}e[t]!==1&&(n.push(e[t]),r.push(t))}return{newShape:n,keptDims:r}}function de(e,t){return fe(e,t)}function fe(e,t){let n=null;if(e==null||e===`float32`)n=new Float32Array(t);else if(e===`int32`)n=new Int32Array(t);else if(e===`bool`)n=new Uint8Array(t);else if(e===`string`)n=Array(t);else throw Error(`Unknown data type ${e}`);return n}function pe(e,t){for(let n=0;n<e.length;n++){let r=e[n];if(isNaN(r)||!isFinite(r))throw Error(`A tensor of type ${t} being uploaded contains ${r}.`)}}function me(e){return e===`bool`||e===`complex64`||e===`float32`||e===`int32`||e===`string`}function he(e,t){return!(t===`complex64`||t===`float32`&&e!==`complex64`||t===`int32`&&e!==`float32`&&e!==`complex64`||t===`bool`&&e===`bool`)}function ge(e){if(e===`float32`||e===`int32`)return 4;if(e===`complex64`)return 8;if(e===`bool`)return 1;throw Error(`Unknown dtype ${e}`)}function _e(e){if(e==null)return 0;let t=0;return e.forEach(e=>t+=e.length),t}function ve(e){return typeof e==`string`||e instanceof String}function ye(e){return typeof e==`boolean`}function be(e){return typeof e==`number`}function xe(e){return Array.isArray(e)?xe(e[0]):e instanceof Float32Array?`float32`:e instanceof Int32Array||e instanceof Uint8Array||e instanceof Uint8ClampedArray?`int32`:be(e)?`float32`:ve(e)?`string`:ye(e)?`bool`:`float32`}function Se(e){return!!(e&&e.constructor&&e.call&&e.apply)}function Ce(e,t){for(let n=t;n<e;++n)if(e%n===0)return n;return e}function j(e){let t=e.length;if(t<2)return[];let n=Array(t-1);n[t-2]=e[t-1];for(let r=t-3;r>=0;--r)n[r]=n[r+1]*e[r+1];return n}function we(e,t,n,r=!1){let i=[];if(t.length===1){let a=t[0]*(r?2:1);for(let t=0;t<a;t++)i[t]=n[e+t]}else{let a=t[0],o=t.slice(1),s=o.reduce((e,t)=>e*t)*(r?2:1);for(let t=0;t<a;t++)i[t]=we(e+t*s,o,n,r)}return i}function Te(e,t,n=!1){if(e.length===0)return t[0];let r=e.reduce((e,t)=>e*t)*(n?2:1);if(r===0)return[];if(r!==t.length)throw Error(`[${e}] does not match the input size ${t.length}${n?` for a complex tensor`:``}.`);return we(0,e,t,n)}function Ee(e,t){if(Array.isArray(e))return e;if(t===`float32`)return e instanceof Float32Array?e:new Float32Array(e);if(t===`int32`)return e instanceof Int32Array?e:new Int32Array(e);if(t===`bool`||t===`string`)return Uint8Array.from(new Int32Array(e));throw Error(`Unknown dtype ${t}`)}function De(e,t){let n=Oe(e,t);for(let e=0;e<n.length;e++)n[e]=1;return n}function Oe(e,t){if(t==null||t===`float32`||t===`complex64`)return new Float32Array(e);if(t===`int32`)return new Int32Array(e);if(t===`bool`)return new Uint8Array(e);throw Error(`Unknown data type ${t}`)}function ke(e,t){let n=e.reduce((e,t)=>e*t,1);if(t==null||t===`float32`)return Te(e,new Float32Array(n));if(t===`int32`)return Te(e,new Int32Array(n));if(t===`bool`)return Te(e,new Uint8Array(n));throw Error(`Unknown data type ${t}`)}function Ae(e){e.forEach(t=>{E(Number.isInteger(t)&&t>=0,()=>`Tensor must have a shape comprised of positive integers but got shape [${e}].`)})}function je(e,t,n){if(t===0)return 0;if(t===1)return e[0];let r=e[e.length-1];for(let t=0;t<e.length-1;++t)r+=n[t]*e[t];return r}function Me(e,t,n){if(t===0)return[];if(t===1)return[e];let r=Array(t);for(let t=0;t<r.length-1;++t)r[t]=Math.floor(e/n[t]),e-=r[t]*n[t];return r[r.length-1]=e,r}function Ne(e){return e&&e.then&&typeof e.then==`function`}var Pe=o((()=>{}));function Fe(e){let t={};return e.replace(/[?&]([^=?&]+)(?:=([^&]*))?/g,(e,...n)=>(Ie(t,n[0],n[1]),n.join(`=`))),t}function Ie(e,t,n){e[decodeURIComponent(t)]=decodeURIComponent(n||``)}function Le(e,t){let n=t.toLowerCase();return n===`true`||n===`false`?n===`true`:`${+n}`===n?+n:t}function M(){return Ve}function Re(e){Ve=e}var ze,Be,Ve,He=o((()=>{Pe(),ze=`tfjsflags`,Be=class{constructor(e){this.global=e,this.flags={},this.flagRegistry={},this.urlFlags={},this.getQueryParams=Fe,this.populateURLFlags()}setPlatform(e,t){this.platform!=null&&(M().getBool(`IS_TEST`)||M().getBool(`PROD`)||console.warn(`Platform ${this.platformName} has already been set. Overwriting the platform with ${e}.`)),this.platformName=e,this.platform=t}registerFlag(e,t,n){if(this.flagRegistry[e]={evaluationFn:t,setHook:n},this.urlFlags[e]!=null){let t=this.urlFlags[e];M().getBool(`IS_TEST`)||M().getBool(`PROD`)||console.warn(`Setting feature override from URL ${e}: ${t}.`),this.set(e,t)}}async getAsync(e){return e in this.flags||(this.flags[e]=await this.evaluateFlag(e)),this.flags[e]}get(e){if(e in this.flags)return this.flags[e];let t=this.evaluateFlag(e);if(Ne(t))throw Error(`Flag ${e} cannot be synchronously evaluated. Please use getAsync() instead.`);return this.flags[e]=t,this.flags[e]}getNumber(e){return this.get(e)}getBool(e){return this.get(e)}getString(e){return this.get(e)}getFlags(){return this.flags}get features(){return this.flags}set(e,t){if(this.flagRegistry[e]==null)throw Error(`Cannot set flag ${e} as it has not been registered.`);this.flags[e]=t,this.flagRegistry[e].setHook!=null&&this.flagRegistry[e].setHook(t)}evaluateFlag(e){if(this.flagRegistry[e]==null)throw Error(`Cannot evaluate flag '${e}': no evaluation function found.`);return this.flagRegistry[e].evaluationFn()}setFlags(e){this.flags=Object.assign({},e)}reset(){this.flags={},this.urlFlags={},this.populateURLFlags()}populateURLFlags(){if(this.global===void 0||this.global.location===void 0||this.global.location.search===void 0)return;let e=this.getQueryParams(this.global.location.search);ze in e&&e[ze].split(`,`).forEach(e=>{let[t,n]=e.split(`:`);this.urlFlags[t]=Le(t,n)})}},Ve=null}));function Ue(){if(Ke==null){let e;if(typeof window<`u`)e=window;else if(typeof global<`u`)e=global;else if(typeof process<`u`)e=process;else if(typeof self<`u`)e=self;else throw Error(`Could not find a global object`);Ke=e}return Ke}function We(){let e=Ue();return e._tfGlobals??=new Map,e._tfGlobals}function Ge(e,t){let n=We();if(n.has(e))return n.get(e);{let r=t();return n.set(e,r),n.get(e)}}var Ke,qe=o((()=>{})),Je,Ye,Xe,Ze,Qe,$e,et,tt,nt,rt,it,at,ot,st,ct,lt,ut,dt,ft,pt,mt,ht,gt,_t,vt,yt,bt,xt,St,Ct,wt,Tt,Et,Dt,Ot,kt,At,jt,Mt,Nt,Pt,Ft,It,Lt,Rt,zt,Bt,Vt,Ht,Ut,Wt,Gt,Kt,qt,Jt,Yt,Xt,Zt,Qt,$t,en,tn,nn,rn,an,on,sn,cn,ln,un,dn,fn,pn,mn,hn,gn,_n,vn,yn,bn,xn,Sn,Cn,wn,Tn,En,Dn,On,kn,An,jn,Mn,Nn,Pn,Fn,In,Ln,Rn,zn,Bn,Vn,Hn,Un,Wn,Gn,Kn,qn,Jn,Yn,Xn,Zn,Qn,$n,er,tr,nr,rr,ir,ar,or,sr,cr,lr,ur,dr,fr,pr,mr,hr,gr,_r,vr,yr,br,xr,Sr,Cr,wr,Tr,Er,Dr,Or,kr,Ar,jr,Mr,Nr,Pr,Fr,Ir,Lr,Rr,zr,Br,Vr,Hr,Ur,Wr,Gr,Kr,N=o((()=>{Je=`Acos`,Ye=`Acosh`,Xe=`AddN`,Ze=`ArgMax`,Qe=`ArgMin`,$e=`Asin`,et=`Asinh`,tt=`Atan`,nt=`Atanh`,rt=`Atan2`,it=`AvgPool`,at=`AvgPoolGrad`,ot=`AvgPool3D`,st=`AvgPool3DGrad`,ct=`BatchMatMul`,lt=`BatchToSpaceND`,ut=`Bincount`,dt=`BitwiseAnd`,ft=`BroadcastTo`,pt=`BroadcastArgs`,mt=`Cast`,ht=`Ceil`,gt=`ClipByValue`,_t=`Complex`,vt=`ComplexAbs`,yt=`Concat`,bt=`Conv2D`,xt=`Conv2DBackpropFilter`,St=`Conv2DBackpropInput`,Ct=`Conv3D`,wt=`Conv3DBackpropFilterV2`,Tt=`Conv3DBackpropInputV2`,Et=`Cosh`,Dt=`Cumprod`,Ot=`Cumsum`,kt=`CropAndResize`,At=`DenseBincount`,jt=`DepthToSpace`,Mt=`DepthwiseConv2dNative`,Nt=`DepthwiseConv2dNativeBackpropFilter`,Pt=`DepthwiseConv2dNativeBackpropInput`,Ft=`Diag`,It=`Dilation2D`,Lt=`Dilation2DBackpropInput`,Rt=`Dilation2DBackpropFilter`,zt=`Draw`,Bt=`RealDiv`,Vt=`Einsum`,Ht=`EluGrad`,Ut=`Equal`,Wt=`ExpandDims`,Gt=`Expm1`,Kt=`Fill`,qt=`FlipLeftRight`,Jt=`Floor`,Yt=`FloorDiv`,Xt=`FusedBatchNorm`,Zt=`GatherV2`,Qt=`GatherNd`,$t=`Greater`,en=`GreaterEqual`,tn=`Identity`,nn=`IFFT`,rn=`Imag`,an=`IsFinite`,on=`IsInf`,sn=`IsNan`,cn=`LeakyRelu`,ln=`Less`,un=`LessEqual`,dn=`LinSpace`,fn=`Log1p`,pn=`LogicalAnd`,mn=`LogicalNot`,hn=`LogicalOr`,gn=`LogicalXor`,_n=`LogSoftmax`,vn=`LowerBound`,yn=`LRNGrad`,bn=`MatrixBandPart`,xn=`Maximum`,Sn=`MaxPool`,Cn=`MaxPoolGrad`,wn=`MaxPool3D`,Tn=`MaxPool3DGrad`,En=`MaxPoolWithArgmax`,Dn=`Mean`,On=`Minimum`,kn=`MirrorPad`,An=`Multinomial`,jn=`Multiply`,Mn=`NotEqual`,Nn=`NonMaxSuppressionV3`,Pn=`NonMaxSuppressionV4`,Fn=`NonMaxSuppressionV5`,In=`OnesLike`,Ln=`OneHot`,Rn=`Pack`,zn=`PadV2`,Bn=`Pool`,Vn=`Prelu`,Hn=`Prod`,Un=`RaggedGather`,Wn=`RaggedRange`,Gn=`RaggedTensorToTensor`,Kn=`Range`,qn=`Real`,Jn=`Reciprocal`,Yn=`Relu`,Xn=`Reshape`,Zn=`ResizeNearestNeighbor`,Qn=`ResizeNearestNeighborGrad`,$n=`ResizeBilinear`,er=`ResizeBilinearGrad`,tr=`Relu6`,nr=`Reverse`,rr=`Round`,ir=`Rsqrt`,ar=`ScatterNd`,or=`TensorScatterUpdate`,sr=`SearchSorted`,cr=`Select`,lr=`Selu`,ur=`Slice`,dr=`Sinh`,fr=`Sign`,pr=`Sigmoid`,mr=`Softplus`,hr=`Sqrt`,gr=`SpaceToBatchND`,_r=`SplitV`,vr=`Softmax`,yr=`SparseFillEmptyRows`,br=`SparseReshape`,xr=`SparseSegmentMean`,Sr=`SparseSegmentSum`,Cr=`SparseToDense`,wr=`SquaredDifference`,Tr=`Square`,Er=`StaticRegexReplace`,Dr=`StridedSlice`,Or=`StringNGrams`,kr=`StringSplit`,Ar=`StringToHashBucketFast`,jr=`Tanh`,Mr=`Tile`,Nr=`TopK`,Pr=`Transform`,Fr=`Transpose`,Ir=`Unique`,Lr=`Unpack`,Rr=`UnsortedSegmentSum`,zr=`UpperBound`,Br=`ZerosLike`,Vr=`Step`,Hr=`FromPixels`,Ur=`RotateWithOffset`,Wr=`_FusedMatMul`,Gr=`FusedConv2D`,Kr=`FusedDepthwiseConv2D`}));function qr(...e){M().getBool(`IS_TEST`)||M().getBool(`PROD`)||console.warn(...e)}function Jr(...e){M().getBool(`IS_TEST`)||M().getBool(`PROD`)||console.log(...e)}var Yr=o((()=>{He()}));function Xr(e,t){let n=ii(e,t);return ai.get(n)}function Zr(e){return oi.get(e)}function Qr(e){let t=ai.entries(),n=[];for(;;){let{done:r,value:i}=t.next();if(r)break;let[a,o]=i,[s]=a.split(`_`);s===e&&n.push(o)}return n}function $r(e){let{kernelName:t,backendName:n}=e,r=ii(t,n);ai.has(r)&&qr(`The kernel '${t}' for backend '${n}' is already registered`),ai.set(r,e)}function ei(e){let{kernelName:t}=e;oi.has(t)&&M().getBool(`DEBUG`)&&qr(`Overriding the gradient for '${t}'`),oi.set(t,e)}function ti(e,t){let n=ii(e,t);if(!ai.has(n))throw Error(`The kernel '${e}' for backend '${t}' is not registered`);ai.delete(n)}function ni(e){if(!oi.has(e))throw Error(`The gradient '${e}' for backend is not registered`);oi.delete(e)}function ri(e,t){Qr(e).forEach(e=>{$r(Object.assign({},e,{backendName:t}))})}function ii(e,t){return`${t}_${e}`}var ai,oi,si=o((()=>{He(),qe(),Yr(),ai=Ge(`kernelRegistry`,()=>new Map),oi=Ge(`gradRegistry`,()=>new Map)}));function ci(e){return e instanceof Float32Array||e instanceof Int32Array||e instanceof Uint8Array||e instanceof Uint8ClampedArray}var li=o((()=>{})),ui=s(((e,t)=>{t.exports=r;var n=null;try{n=new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([0,97,115,109,1,0,0,0,1,13,2,96,0,1,127,96,4,127,127,127,127,1,127,3,7,6,0,1,1,1,1,1,6,6,1,127,1,65,0,11,7,50,6,3,109,117,108,0,1,5,100,105,118,95,115,0,2,5,100,105,118,95,117,0,3,5,114,101,109,95,115,0,4,5,114,101,109,95,117,0,5,8,103,101,116,95,104,105,103,104,0,0,10,191,1,6,4,0,35,0,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,126,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,127,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,128,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,129,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,130,34,4,66,32,135,167,36,0,32,4,167,11])),{}).exports}catch{}function r(e,t,n){this.low=e|0,this.high=t|0,this.unsigned=!!n}r.prototype.__isLong__,Object.defineProperty(r.prototype,`__isLong__`,{value:!0});function i(e){return(e&&e.__isLong__)===!0}r.isLong=i;var a={},o={};function s(e,t){var n,r,i;return t?(e>>>=0,(i=0<=e&&e<256)&&(r=o[e],r)?r:(n=l(e,(e|0)<0?-1:0,!0),i&&(o[e]=n),n)):(e|=0,(i=-128<=e&&e<128)&&(r=a[e],r)?r:(n=l(e,e<0?-1:0,!1),i&&(a[e]=n),n))}r.fromInt=s;function c(e,t){if(isNaN(e))return t?b:y;if(t){if(e<0)return b;if(e>=g)return T}else{if(e<=-_)return E;if(e+1>=_)return w}return e<0?c(-e,t).neg():l(e%h|0,e/h|0,t)}r.fromNumber=c;function l(e,t,n){return new r(e,t,n)}r.fromBits=l;var u=Math.pow;function d(e,t,n){if(e.length===0)throw Error(`empty string`);if(e===`NaN`||e===`Infinity`||e===`+Infinity`||e===`-Infinity`)return y;if(typeof t==`number`?(n=t,t=!1):t=!!t,n||=10,n<2||36<n)throw RangeError(`radix`);var r;if((r=e.indexOf(`-`))>0)throw Error(`interior hyphen`);if(r===0)return d(e.substring(1),t,n).neg();for(var i=c(u(n,8)),a=y,o=0;o<e.length;o+=8){var s=Math.min(8,e.length-o),l=parseInt(e.substring(o,o+s),n);if(s<8){var f=c(u(n,s));a=a.mul(f).add(c(l))}else a=a.mul(i),a=a.add(c(l))}return a.unsigned=t,a}r.fromString=d;function f(e,t){return typeof e==`number`?c(e,t):typeof e==`string`?d(e,t):l(e.low,e.high,typeof t==`boolean`?t:e.unsigned)}r.fromValue=f;var p=65536,m=1<<24,h=p*p,g=h*h,_=g/2,v=s(m),y=s(0);r.ZERO=y;var b=s(0,!0);r.UZERO=b;var x=s(1);r.ONE=x;var S=s(1,!0);r.UONE=S;var C=s(-1);r.NEG_ONE=C;var w=l(-1,2147483647,!1);r.MAX_VALUE=w;var T=l(-1,-1,!0);r.MAX_UNSIGNED_VALUE=T;var E=l(0,-2147483648,!1);r.MIN_VALUE=E;var D=r.prototype;D.toInt=function(){return this.unsigned?this.low>>>0:this.low},D.toNumber=function(){return this.unsigned?(this.high>>>0)*h+(this.low>>>0):this.high*h+(this.low>>>0)},D.toString=function(e){if(e||=10,e<2||36<e)throw RangeError(`radix`);if(this.isZero())return`0`;if(this.isNegative())if(this.eq(E)){var t=c(e),n=this.div(t),r=n.mul(t).sub(this);return n.toString(e)+r.toInt().toString(e)}else return`-`+this.neg().toString(e);for(var i=c(u(e,6),this.unsigned),a=this,o=``;;){var s=a.div(i),l=(a.sub(s.mul(i)).toInt()>>>0).toString(e);if(a=s,a.isZero())return l+o;for(;l.length<6;)l=`0`+l;o=``+l+o}},D.getHighBits=function(){return this.high},D.getHighBitsUnsigned=function(){return this.high>>>0},D.getLowBits=function(){return this.low},D.getLowBitsUnsigned=function(){return this.low>>>0},D.getNumBitsAbs=function(){if(this.isNegative())return this.eq(E)?64:this.neg().getNumBitsAbs();for(var e=this.high==0?this.low:this.high,t=31;t>0&&!(e&1<<t);t--);return this.high==0?t+1:t+33},D.isZero=function(){return this.high===0&&this.low===0},D.eqz=D.isZero,D.isNegative=function(){return!this.unsigned&&this.high<0},D.isPositive=function(){return this.unsigned||this.high>=0},D.isOdd=function(){return(this.low&1)==1},D.isEven=function(){return(this.low&1)==0},D.equals=function(e){return i(e)||(e=f(e)),this.unsigned!==e.unsigned&&this.high>>>31==1&&e.high>>>31==1?!1:this.high===e.high&&this.low===e.low},D.eq=D.equals,D.notEquals=function(e){return!this.eq(e)},D.neq=D.notEquals,D.ne=D.notEquals,D.lessThan=function(e){return this.comp(e)<0},D.lt=D.lessThan,D.lessThanOrEqual=function(e){return this.comp(e)<=0},D.lte=D.lessThanOrEqual,D.le=D.lessThanOrEqual,D.greaterThan=function(e){return this.comp(e)>0},D.gt=D.greaterThan,D.greaterThanOrEqual=function(e){return this.comp(e)>=0},D.gte=D.greaterThanOrEqual,D.ge=D.greaterThanOrEqual,D.compare=function(e){if(i(e)||(e=f(e)),this.eq(e))return 0;var t=this.isNegative(),n=e.isNegative();return t&&!n?-1:!t&&n?1:this.unsigned?e.high>>>0>this.high>>>0||e.high===this.high&&e.low>>>0>this.low>>>0?-1:1:this.sub(e).isNegative()?-1:1},D.comp=D.compare,D.negate=function(){return!this.unsigned&&this.eq(E)?E:this.not().add(x)},D.neg=D.negate,D.add=function(e){i(e)||(e=f(e));var t=this.high>>>16,n=this.high&65535,r=this.low>>>16,a=this.low&65535,o=e.high>>>16,s=e.high&65535,c=e.low>>>16,u=e.low&65535,d=0,p=0,m=0,h=0;return h+=a+u,m+=h>>>16,h&=65535,m+=r+c,p+=m>>>16,m&=65535,p+=n+s,d+=p>>>16,p&=65535,d+=t+o,d&=65535,l(m<<16|h,d<<16|p,this.unsigned)},D.subtract=function(e){return i(e)||(e=f(e)),this.add(e.neg())},D.sub=D.subtract,D.multiply=function(e){if(this.isZero())return y;if(i(e)||(e=f(e)),n)return l(n.mul(this.low,this.high,e.low,e.high),n.get_high(),this.unsigned);if(e.isZero())return y;if(this.eq(E))return e.isOdd()?E:y;if(e.eq(E))return this.isOdd()?E:y;if(this.isNegative())return e.isNegative()?this.neg().mul(e.neg()):this.neg().mul(e).neg();if(e.isNegative())return this.mul(e.neg()).neg();if(this.lt(v)&&e.lt(v))return c(this.toNumber()*e.toNumber(),this.unsigned);var t=this.high>>>16,r=this.high&65535,a=this.low>>>16,o=this.low&65535,s=e.high>>>16,u=e.high&65535,d=e.low>>>16,p=e.low&65535,m=0,h=0,g=0,_=0;return _+=o*p,g+=_>>>16,_&=65535,g+=a*p,h+=g>>>16,g&=65535,g+=o*d,h+=g>>>16,g&=65535,h+=r*p,m+=h>>>16,h&=65535,h+=a*d,m+=h>>>16,h&=65535,h+=o*u,m+=h>>>16,h&=65535,m+=t*p+r*d+a*u+o*s,m&=65535,l(g<<16|_,m<<16|h,this.unsigned)},D.mul=D.multiply,D.divide=function(e){if(i(e)||(e=f(e)),e.isZero())throw Error(`division by zero`);if(n)return!this.unsigned&&this.high===-2147483648&&e.low===-1&&e.high===-1?this:l((this.unsigned?n.div_u:n.div_s)(this.low,this.high,e.low,e.high),n.get_high(),this.unsigned);if(this.isZero())return this.unsigned?b:y;var t,r,a;if(this.unsigned){if(e.unsigned||(e=e.toUnsigned()),e.gt(this))return b;if(e.gt(this.shru(1)))return S;a=b}else{if(this.eq(E))return e.eq(x)||e.eq(C)?E:e.eq(E)?x:(t=this.shr(1).div(e).shl(1),t.eq(y)?e.isNegative()?x:C:(r=this.sub(e.mul(t)),a=t.add(r.div(e)),a));if(e.eq(E))return this.unsigned?b:y;if(this.isNegative())return e.isNegative()?this.neg().div(e.neg()):this.neg().div(e).neg();if(e.isNegative())return this.div(e.neg()).neg();a=y}for(r=this;r.gte(e);){t=Math.max(1,Math.floor(r.toNumber()/e.toNumber()));for(var o=Math.ceil(Math.log(t)/Math.LN2),s=o<=48?1:u(2,o-48),d=c(t),p=d.mul(e);p.isNegative()||p.gt(r);)t-=s,d=c(t,this.unsigned),p=d.mul(e);d.isZero()&&(d=x),a=a.add(d),r=r.sub(p)}return a},D.div=D.divide,D.modulo=function(e){return i(e)||(e=f(e)),n?l((this.unsigned?n.rem_u:n.rem_s)(this.low,this.high,e.low,e.high),n.get_high(),this.unsigned):this.sub(this.div(e).mul(e))},D.mod=D.modulo,D.rem=D.modulo,D.not=function(){return l(~this.low,~this.high,this.unsigned)},D.and=function(e){return i(e)||(e=f(e)),l(this.low&e.low,this.high&e.high,this.unsigned)},D.or=function(e){return i(e)||(e=f(e)),l(this.low|e.low,this.high|e.high,this.unsigned)},D.xor=function(e){return i(e)||(e=f(e)),l(this.low^e.low,this.high^e.high,this.unsigned)},D.shiftLeft=function(e){return i(e)&&(e=e.toInt()),(e&=63)==0?this:e<32?l(this.low<<e,this.high<<e|this.low>>>32-e,this.unsigned):l(0,this.low<<e-32,this.unsigned)},D.shl=D.shiftLeft,D.shiftRight=function(e){return i(e)&&(e=e.toInt()),(e&=63)==0?this:e<32?l(this.low>>>e|this.high<<32-e,this.high>>e,this.unsigned):l(this.high>>e-32,this.high>=0?0:-1,this.unsigned)},D.shr=D.shiftRight,D.shiftRightUnsigned=function(e){if(i(e)&&(e=e.toInt()),e&=63,e===0)return this;var t=this.high;if(e<32){var n=this.low;return l(n>>>e|t<<32-e,t>>>e,this.unsigned)}else if(e===32)return l(t,0,this.unsigned);else return l(t>>>e-32,0,this.unsigned)},D.shru=D.shiftRightUnsigned,D.shr_u=D.shiftRightUnsigned,D.toSigned=function(){return this.unsigned?l(this.low,this.high,!1):this},D.toUnsigned=function(){return this.unsigned?this:l(this.low,this.high,!0)},D.toBytes=function(e){return e?this.toBytesLE():this.toBytesBE()},D.toBytesLE=function(){var e=this.high,t=this.low;return[t&255,t>>>8&255,t>>>16&255,t>>>24,e&255,e>>>8&255,e>>>16&255,e>>>24]},D.toBytesBE=function(){var e=this.high,t=this.low;return[e>>>24,e>>>16&255,e>>>8&255,e&255,t>>>24,t>>>16&255,t>>>8&255,t&255]},r.fromBytes=function(e,t,n){return n?r.fromBytesLE(e,t):r.fromBytesBE(e,t)},r.fromBytesLE=function(e,t){return new r(e[0]|e[1]<<8|e[2]<<16|e[3]<<24,e[4]|e[5]<<8|e[6]<<16|e[7]<<24,t)},r.fromBytesBE=function(e,t){return new r(e[4]<<24|e[5]<<16|e[6]<<8|e[7],e[0]<<24|e[1]<<16|e[2]<<8|e[3],t)}}));function di(e){return Ti.fromString(e,!0,16)}function fi(e){return e.xor(e.shru(47))}function pi(e,t,n){let r=e.slice(t,t+n);return Ti.fromBytes(Array.from(r),!0,!0)}function mi(e,t){return pi(e,t,8)}function hi(e,t){return pi(e,t,4)}function gi(e,t){return t===0?e:e.shru(t).or(e.shl(64-t))}function _i(e,t,n=di(`9ddfea08eb382d69`)){let r=e.xor(t).mul(n);r=r.xor(r.shru(47));let i=t.xor(r).mul(n);return i=i.xor(i.shru(47)),i=i.mul(n),i}function vi(e,t,n,r,i,a){i=i.add(e),a=gi(a.add(i).add(r),21);let o=i;return i=i.add(t),i=i.add(n),a=a.add(gi(i,44)),[i.add(r),a.add(o)]}function yi(e,t,n,r){return vi(mi(e,t),mi(e,t+8),mi(e,t+16),mi(e,t+24),n,r)}function bi(e,t=e.length){if(t>=8){let n=Oi.add(t*2),r=mi(e,0).add(Oi),i=mi(e,t-8);return _i(gi(i,37).mul(n).add(r),gi(r,25).add(i).mul(n),n)}if(t>=4){let n=Oi.add(t*2);return _i(hi(e,0).shl(3).add(t),hi(e,t-4),n)}if(t>0){let n=e[0],r=e[t>>1],i=e[t-1],a=n+(r<<8),o=t+(i<<2);return fi(Oi.mul(a).xor(Ei.mul(o))).mul(Oi)}return Oi}function xi(e,t=e.length){let n=Oi.add(t*2),r=mi(e,0).mul(Di),i=mi(e,8),a=mi(e,t-8).mul(n),o=mi(e,t-16).mul(Oi);return _i(gi(r.add(i),43).add(gi(a,30)).add(o),r.add(gi(i.add(Oi),18)).add(a),n)}function Si(e,t=e.length){let n=Oi.add(t*2),r=mi(e,0).mul(Oi),i=mi(e,8),a=mi(e,t-8).mul(n),o=mi(e,t-16).mul(Oi),s=gi(r.add(i),43).add(gi(a,30)).add(o),c=_i(s,r.add(gi(i.add(Oi),18)).add(a),n),l=mi(e,16).mul(n),u=mi(e,24),d=s.add(mi(e,t-32)).mul(n),f=c.add(mi(e,t-24)).mul(n);return _i(gi(l.add(u),43).add(gi(d,30)).add(f),l.add(gi(u.add(r),18)).add(d),n)}function Ci(e,t=e.length){let n=Ti.fromNumber(81,!0);if(t<=32)return t<=16?bi(e,t):xi(e,t);if(t<=64)return Si(e,t);let r=n,i=n.mul(Di).add(113),a=fi(i.mul(Oi).add(113)).mul(Oi),o=[Ti.UZERO,Ti.UZERO],s=[Ti.UZERO,Ti.UZERO];r=r.mul(Oi).add(mi(e,0));let c=0,l=(t-1>>6)*64,u=l+(t-1&63)-63;do r=gi(r.add(i).add(o[0]).add(mi(e,c+8)),37).mul(Di),i=gi(i.add(o[1]).add(mi(e,c+48)),42).mul(Di),r=r.xor(s[1]),i=i.add(o[0]).add(mi(e,c+40)),a=gi(a.add(s[0]),33).mul(Di),o=yi(e,c,o[1].mul(Di),r.add(s[0])),s=yi(e,c+32,a.add(s[1]),i.add(mi(e,c+16))),[a,r]=[r,a],c+=64;while(c!==l);let d=Di.add(a.and(255).shl(1));return c=u,s[0]=s[0].add(t-1&63),o[0]=o[0].add(s[0]),s[0]=s[0].add(o[0]),r=gi(r.add(i).add(o[0]).add(mi(e,c+8)),37).mul(d),i=gi(i.add(o[1]).add(mi(e,c+48)),42).mul(d),r=r.xor(s[1].mul(9)),i=i.add(o[0].mul(9).add(mi(e,c+40))),a=gi(a.add(s[0]),33).mul(d),o=yi(e,c,o[1].mul(d),r.add(s[0])),s=yi(e,c+32,a.add(s[1]),i.add(mi(e,c+16))),[a,r]=[r,a],_i(_i(o[0],s[0],d).add(fi(i).mul(Ei)).add(a),_i(o[1],s[1],d).add(r),d)}var wi,Ti,Ei,Di,Oi,ki=o((()=>{wi=u(ui()),Ti=wi.default||wi,Ei=di(`c3a5c85c97cb3127`),Di=di(`b492b66fbe98f273`),Oi=di(`9ae16a3b2f90404f`)})),Ai=c({arraysEqual:()=>k,arraysEqualWithNull:()=>ne,assert:()=>E,assertNonNegativeIntegerDimensions:()=>Ae,assertNonNull:()=>ee,assertShapesMatch:()=>D,bytesFromStringArray:()=>_e,bytesPerElement:()=>ge,checkConversionForErrors:()=>pe,clamp:()=>b,computeStrides:()=>j,convertBackendValuesAndArrayBuffer:()=>Ee,createScalarValue:()=>ji,createShuffledIndices:()=>oe,decodeString:()=>Li,distSquared:()=>T,encodeString:()=>Ii,fetch:()=>Fi,fingerPrint64:()=>Ci,flatten:()=>zi,getArrayFromDType:()=>fe,getTypedArrayFromDType:()=>de,hasEncodingLoss:()=>he,hexToLong:()=>di,indexToLoc:()=>Me,inferDtype:()=>xe,inferFromImplicitShape:()=>le,isBoolean:()=>ye,isFunction:()=>Se,isInt:()=>re,isNumber:()=>be,isPromise:()=>Ne,isScalarShape:()=>te,isString:()=>ve,isTypedArray:()=>Ri,isValidDtype:()=>me,locToIndex:()=>je,makeOnesTypedArray:()=>De,makeZerosNestedTypedArray:()=>ke,makeZerosTypedArray:()=>Oe,nearestDivisor:()=>Ce,nearestLargerEven:()=>x,now:()=>Pi,parseAxisParam:()=>A,randUniform:()=>w,repeatedTry:()=>ce,rightPad:()=>se,shuffle:()=>v,shuffleCombo:()=>y,sizeFromShape:()=>O,sizeToSquarishShape:()=>ae,squeezeShape:()=>ue,sum:()=>C,swap:()=>S,tanh:()=>ie,toNestedArray:()=>Te,toTypedArray:()=>Ni});function ji(e,t){return t===`string`?Ii(e):Ni([e],t)}function Mi(e,t){return e instanceof Float32Array&&t===`float32`||e instanceof Int32Array&&t===`int32`||e instanceof Uint8Array&&t===`bool`}function Ni(e,t){if(t===`string`)throw Error(`Cannot convert a string[] to a TypedArray`);if(Array.isArray(e)&&(e=zi(e)),M().getBool(`DEBUG`)&&pe(e,t),Mi(e,t))return e;if(t==null||t===`float32`||t===`complex64`)return new Float32Array(e);if(t===`int32`)return new Int32Array(e);if(t===`bool`){let t=new Uint8Array(e.length);for(let n=0;n<t.length;++n)Math.round(e[n])!==0&&(t[n]=1);return t}else throw Error(`Unknown data type ${t}`)}function Pi(){return M().platform.now()}function Fi(e,t){return M().platform.fetch(e,t)}function Ii(e,t=`utf-8`){return t||=`utf-8`,M().platform.encode(e,t)}function Li(e,t=`utf-8`){return t||=`utf-8`,M().platform.decode(e,t)}function Ri(e){return M().platform.isTypedArray==null?ci(e):M().platform.isTypedArray(e)}function zi(e,t=[],n=!1){if(t??=[],typeof e==`boolean`||typeof e==`number`||typeof e==`string`||Ne(e)||e==null||Ri(e)&&n)t.push(e);else if(Array.isArray(e)||Ri(e))for(let r=0;r<e.length;++r)zi(e[r],t,n);else{let r=-1;for(let t of Object.keys(e))/^([1-9]+[0-9]*|0)$/.test(t)&&(r=Math.max(r,Number(t)));for(let i=0;i<=r;i++)zi(e[i],t,n)}return t}var P=o((()=>{He(),li(),Pe(),Pe(),ki()}));function Bi(e,t,n){if(t!==`float32`)return!1;for(let t=0;t<e.length;t++){let r=e[t];if(isNaN(r)||!isFinite(r))return console.warn(`Found ${r} in the result of '${n}'`),!0}return!1}var Vi,Hi,Ui=o((()=>{He(),P(),Vi=class{constructor(e,t){this.backendTimer=e,this.logger=t,t??(this.logger=new Hi)}profileKernel(e,t,n){let r,i=()=>{r=n()},a,o=Pi();if(this.backendTimer.timerAvailable())a=this.backendTimer.time(i);else{i();for(let e of r)e.dataSync();a=Promise.resolve({kernelMs:Pi()-o})}if(M().getBool(`CHECK_COMPUTATION_FOR_ERRORS`))for(let t=0;t<r.length;t++){let n=r[t];n.data().then(t=>{Bi(t,n.dtype,e)})}return{kernelName:e,outputs:r,inputs:t,timeMs:a.then(e=>e.kernelMs),extraInfo:a.then(e=>e.getExtraProfileInfo==null?``:e.getExtraProfileInfo())}}logKernelProfile(e){let{kernelName:t,outputs:n,timeMs:r,inputs:i,extraInfo:a}=e;n.forEach(e=>{Promise.all([e.data(),r,a]).then(n=>{this.logger.logKernelProfile(t,e,n[0],n[1],i,n[2])})})}},Hi=class{logKernelProfile(e,t,n,r,i,a){let o=typeof r==`number`?se(`${r}ms`,9):r.error,s=se(e,25),c=t.rank,l=t.size,u=se(t.shape.toString(),14),d=``;for(let e in i){let n=i[e];if(n!=null){let r=n.shape||t.shape,i=r.length;d+=`${e}: ${i}D ${i>0?r:``} `}}console.log(`%c${s}\t%c${o}\t%c${c}D ${u}\t%c${l}\t%c${d}\t%c${a}`,`font-weight:bold`,`color:red`,`color:blue`,`color: orange`,`color: green`,`color: steelblue`)}}}));function Wi(e,t,n){let r={},i={};for(let e=0;e<t.length;e++)r[t[e].id]=!0;for(let n=0;n<e.length;n++){let a=e[n],o=a.inputs;for(let e in o){let n=o[e],s=!1;for(let e=0;e<t.length;e++)if(r[n.id]){a.outputs.forEach(e=>r[e.id]=!0),s=!0,i[a.id]=!0;break}if(s)break}}let a={};a[n.id]=!0;let o={};for(let t=e.length-1;t>=0;t--){let n=e[t],r=n.inputs;for(let e=0;e<n.outputs.length;e++)if(a[n.outputs[e].id]){for(let e in r)a[r[e].id]=!0,o[n.id]=!0;break}}let s=[];for(let t=0;t<e.length;t++){let n=e[t];if(i[n.id]&&o[n.id]){let e={};for(let t in n.inputs){let i=n.inputs[t];r[i.id]&&(e[t]=i)}let t=Object.assign({},n);t.inputs=e,t.outputs=n.outputs,s.push(t)}}return s}function Gi(e,t,n,r){for(let i=t.length-1;i>=0;i--){let a=t[i],o=[];if(a.outputs.forEach(t=>{let n=e[t.id];n==null?o.push(null):o.push(n)}),a.gradient==null)throw Error(`Cannot compute gradient: gradient function not found for ${a.kernelName}.`);let s=a.gradient(o);for(let t in a.inputs){if(!(t in s))throw Error(`Cannot backprop through input ${t}. Available gradients found: ${Object.keys(s)}.`);let i=n(()=>s[t]());if(i.dtype!==`float32`)throw Error(`Error in gradient for op ${a.kernelName}. The gradient of input ${t} must have 'float32' dtype, but has '${i.dtype}'`);let o=a.inputs[t];if(!k(i.shape,o.shape))throw Error(`Error in gradient for op ${a.kernelName}. The gradient of input '${t}' has shape '${i.shape}', which does not match the shape of the input '${o.shape}'`);if(e[o.id]==null)e[o.id]=i;else{let t=e[o.id];e[o.id]=r(t,i),t.dispose()}}}}var Ki=o((()=>{P()}));function qi(e,t,n,r){let i=j(t),a=Ji(e,t,n,i),o=t.length,s=Zi(e,t,n,i,a),c=[`Tensor`];return r&&(c.push(`  dtype: ${n}`),c.push(`  rank: ${o}`),c.push(`  shape: [${t}]`),c.push(`  values:`)),c.push(s.map(e=>`    `+e).join(`
`)),c.join(`
`)}function Ji(e,t,n,r){let i=O(t),a=r[r.length-1],o=Array(a).fill(0),s=t.length,c=n===`complex64`?Qi(e):e;if(s>1)for(let e=0;e<i/a;e++){let t=e*a;for(let e=0;e<a;e++)o[e]=Math.max(o[e],Yi(c[t+e],0,n).length)}return o}function Yi(e,t,n){let r;return r=Array.isArray(e)?`${parseFloat(e[0].toFixed(ta))} + ${parseFloat(e[1].toFixed(ta))}j`:ve(e)?`'${e}'`:n===`bool`?Xi(e):parseFloat(e.toFixed(ta)).toString(),se(r,t)}function Xi(e){return e===0?`false`:`true`}function Zi(e,t,n,r,i,a=!0){let o=n===`complex64`?2:1,s=t[0],c=t.length;if(c===0)return n===`complex64`?[Yi(Qi(e)[0],0,n)]:n===`bool`?[Xi(e[0])]:[e[0].toString()];if(c===1){if(s>$i){let t=ea*o,r=Array.from(e.slice(0,t)),a=Array.from(e.slice((s-ea)*o,s*o));return n===`complex64`&&(r=Qi(r),a=Qi(a)),[`[`+r.map((e,t)=>Yi(e,i[t],n)).join(`, `)+`, ..., `+a.map((e,t)=>Yi(e,i[s-ea+t],n)).join(`, `)+`]`]}return[`[`+(n===`complex64`?Qi(e):Array.from(e)).map((e,t)=>Yi(e,i[t],n)).join(`, `)+`]`]}let l=t.slice(1),u=r.slice(1),d=r[0]*o,f=[];if(s>$i){for(let t=0;t<ea;t++){let r=t*d,a=r+d;f.push(...Zi(e.slice(r,a),l,n,u,i,!1))}f.push(`...`);for(let t=s-ea;t<s;t++){let r=t*d,a=r+d;f.push(...Zi(e.slice(r,a),l,n,u,i,t===s-1))}}else for(let t=0;t<s;t++){let r=t*d,a=r+d;f.push(...Zi(e.slice(r,a),l,n,u,i,t===s-1))}let p=c===2?`,`:``;f[0]=`[`+(s>0?f[0]+p:``);for(let e=1;e<f.length-1;e++)f[e]=` `+f[e]+p;let m=`,
`;for(let e=2;e<c;e++)m+=`
`;return f[f.length-1]=` `+f[f.length-1]+`]`+(a?``:m),f}function Qi(e){let t=[];for(let n=0;n<e.length;n+=2)t.push([e[n],e[n+1]]);return t}var $i,ea,ta,na=o((()=>{P(),$i=20,ea=3,ta=7}));function ra(e){sa=e}function ia(e){ca=e}function aa(){return Ge(`Tensor`,()=>la)}var oa,sa,ca,la,ua,da=o((()=>{qe(),na(),P(),oa=class{constructor(e,t,n){if(this.dtype=t,this.shape=e.slice(),this.size=O(e),n!=null){let e=n.length;E(e===this.size,()=>`Length of values '${e}' does not match the size inferred by the shape '${this.size}'.`)}if(t===`complex64`)throw Error(`complex64 dtype TensorBuffers are not supported. Please create a TensorBuffer for the real and imaginary parts separately and call tf.complex(real, imag).`);this.values=n||fe(t,this.size),this.strides=j(e)}set(e,...t){t.length===0&&(t=[0]),E(t.length===this.rank,()=>`The number of provided coordinates (${t.length}) must match the rank (${this.rank})`);let n=this.locToIndex(t);this.values[n]=e}get(...e){e.length===0&&(e=[0]);let t=0;for(let n of e){if(n<0||n>=this.shape[t]){let t=`Requested out of range element at ${e}.   Buffer shape=${this.shape}`;throw Error(t)}t++}let n=e[e.length-1];for(let t=0;t<e.length-1;++t)n+=this.strides[t]*e[t];return this.values[n]}locToIndex(e){if(this.rank===0)return 0;if(this.rank===1)return e[0];let t=e[e.length-1];for(let n=0;n<e.length-1;++n)t+=this.strides[n]*e[n];return t}indexToLoc(e){if(this.rank===0)return[];if(this.rank===1)return[e];let t=Array(this.shape.length);for(let n=0;n<t.length-1;++n)t[n]=Math.floor(e/this.strides[n]),e-=t[n]*this.strides[n];return t[t.length-1]=e,t}get rank(){return this.shape.length}toTensor(){return sa().makeTensor(this.values,this.shape,this.dtype)}},sa=null,ca=null,la=class{constructor(e,t,n,r){this.kept=!1,this.isDisposedInternal=!1,this.shape=e.slice(),this.dtype=t||`float32`,this.size=O(e),this.strides=j(e),this.dataId=n,this.id=r,this.rankType=this.rank<5?this.rank.toString():`higher`}get rank(){return this.shape.length}async buffer(){let e=await this.data();return ca.buffer(this.shape,this.dtype,e)}bufferSync(){return ca.buffer(this.shape,this.dtype,this.dataSync())}async array(){let e=await this.data();return Te(this.shape,e,this.dtype===`complex64`)}arraySync(){return Te(this.shape,this.dataSync(),this.dtype===`complex64`)}async data(){this.throwIfDisposed();let e=sa().read(this.dataId);if(this.dtype===`string`){let t=await e;try{return t.map(e=>Li(e))}catch{throw Error(`Failed to decode the string bytes into utf-8. To get the original bytes, call tensor.bytes().`)}}return e}dataToGPU(e){return this.throwIfDisposed(),sa().readToGPU(this.dataId,e)}dataSync(){this.throwIfDisposed();let e=sa().readSync(this.dataId);if(this.dtype===`string`)try{return e.map(e=>Li(e))}catch{throw Error(`Failed to decode the string bytes into utf-8. To get the original bytes, call tensor.bytes().`)}return e}async bytes(){this.throwIfDisposed();let e=await sa().read(this.dataId);return this.dtype===`string`?e:new Uint8Array(e.buffer)}dispose(){this.isDisposed||(this.kerasMask&&this.kerasMask.dispose(),sa().disposeTensor(this),this.isDisposedInternal=!0)}get isDisposed(){return this.isDisposedInternal}throwIfDisposed(){if(this.isDisposed)throw Error(`Tensor is disposed.`)}print(e=!1){return ca.print(this,e)}clone(){return this.throwIfDisposed(),ca.clone(this)}toString(e=!1){return qi(this.dataSync(),this.shape,this.dtype,e)}cast(e){return this.throwIfDisposed(),ca.cast(this,e)}variable(e=!0,t,n){return this.throwIfDisposed(),sa().makeVariable(this,e,t,n)}},Object.defineProperty(la,Symbol.hasInstance,{value:e=>!!e&&e.data!=null&&e.dataSync!=null&&e.throwIfDisposed!=null}),aa(),ua=class extends la{constructor(e,t,n,r){super(e.shape,e.dtype,e.dataId,r),this.trainable=t,this.name=n}assign(e){if(e.dtype!==this.dtype)throw Error(`dtype of the new value (${e.dtype}) and previous value (${this.dtype}) must match`);if(!k(e.shape,this.shape))throw Error(`shape of the new value (${e.shape}) and previous value (${this.shape}) must match`);sa().disposeTensor(this),this.dataId=e.dataId,sa().incRef(this,null)}dispose(){sa().disposeVariable(this),this.isDisposedInternal=!0}},Object.defineProperty(ua,Symbol.hasInstance,{value:e=>e instanceof la&&e.assign!=null&&e.assign instanceof Function})}));function fa(e,t){if(e===`string`||t===`string`){if(e===`string`&&t===`string`)return`string`;throw Error(`Can not upcast ${e} with ${t}`)}return xa[e][t]}function pa(e){return fa(e,`int32`)}function ma(e){return typeof e==`object`&&!!e&&`texture`in e&&e.texture instanceof WebGLTexture}function ha(e){return typeof GPUBuffer<`u`&&typeof e==`object`&&!!e&&`buffer`in e&&e.buffer instanceof GPUBuffer}var ga,_a,va,ya,ba,xa,Sa=o((()=>{(function(e){e.R0=`R0`,e.R1=`R1`,e.R2=`R2`,e.R3=`R3`,e.R4=`R4`,e.R5=`R5`,e.R6=`R6`})(ga||={}),(function(e){e.float32=`float32`,e.int32=`int32`,e.bool=`int32`,e.complex64=`complex64`})(_a||={}),(function(e){e.float32=`float32`,e.int32=`int32`,e.bool=`bool`,e.complex64=`complex64`})(va||={}),(function(e){e.float32=`float32`,e.int32=`float32`,e.bool=`float32`,e.complex64=`complex64`})(ya||={}),(function(e){e.float32=`complex64`,e.int32=`complex64`,e.bool=`complex64`,e.complex64=`complex64`})(ba||={}),xa={float32:ya,int32:_a,bool:va,complex64:ba}})),Ca=c({assertTypesMatch:()=>Ta,getTensorsInContainer:()=>Da,isTensorInList:()=>Ea,makeTypesMatch:()=>wa});function wa(e,t){if(e.dtype===t.dtype)return[e,t];let n=fa(e.dtype,t.dtype);return[e.cast(n),t.cast(n)]}function Ta(e,t){E(e.dtype===t.dtype,()=>`The dtypes of the first(${e.dtype}) and second(${t.dtype}) input must match`)}function Ea(e,t){return t.some(t=>t.id===e.id)}function Da(e){let t=[];return Oa(e,t,new Set),t}function Oa(e,t,n){if(e==null)return;if(e instanceof la){t.push(e);return}if(!ka(e))return;let r=e;for(let e in r){let i=r[e];n.has(i)||(n.add(i),Oa(i,t,n))}}function ka(e){return Array.isArray(e)||typeof e==`object`}var Aa=o((()=>{da(),Sa(),P()}));function ja(e){return e.kernelName!=null}function Ma(e){let t=De(O(e),`float32`);return F.makeTensor(t,e,`float32`)}function Na(){let e=Ue();return e._tfengine??=new Ia(new Be(e)),Re(e._tfengine.ENV),ra(()=>e._tfengine),e._tfengine}function Pa(e,t){let n={a:e,b:t};return F.runKernel(`Add`,n)}var Fa,Ia,F,I=o((()=>{_(),He(),qe(),N(),si(),Yr(),Ui(),Ki(),da(),Aa(),P(),Fa=class{constructor(){this.registeredVariables={},this.nextTapeNodeId=0,this.numBytes=0,this.numTensors=0,this.numStringTensors=0,this.numDataBuffers=0,this.gradientDepth=0,this.kernelDepth=0,this.scopeStack=[],this.numDataMovesStack=[],this.nextScopeId=0,this.tensorInfo=new WeakMap,this.profiling=!1,this.activeProfile={newBytes:0,newTensors:0,peakBytes:0,kernels:[],result:null,get kernelNames(){return Array.from(new Set(this.kernels.map(e=>e.name)))}}}dispose(){for(let e in this.registeredVariables)this.registeredVariables[e].dispose()}},Ia=class e{constructor(e){this.ENV=e,this.registry={},this.registryFactory={},this.pendingBackendInitId=0,this.state=new Fa}async ready(){if(this.pendingBackendInit!=null)return this.pendingBackendInit.then(()=>{});if(this.backendInstance!=null)return;let e=this.getSortedBackends();for(let t=0;t<e.length;t++){let n=e[t];if(await this.initializeBackend(n).success){await this.setBackend(n);return}}throw Error(`Could not initialize any backends, all backend initializations failed.`)}get backend(){if(this.pendingBackendInit!=null)throw Error(`Backend '${this.backendName}' has not yet been initialized. Make sure to await tf.ready() or await tf.setBackend() before calling other methods`);if(this.backendInstance==null){let{name:e,asyncInit:t}=this.initializeBackendsAndReturnBest();if(t)throw Error(`The highest priority backend '${e}' has not yet been initialized. Make sure to await tf.ready() or await tf.setBackend() before calling other methods`);this.setBackend(e)}return this.backendInstance}backendNames(){return Object.keys(this.registryFactory)}findBackend(e){if(!(e in this.registry))if(e in this.registryFactory){let{asyncInit:t}=this.initializeBackend(e);if(t)return null}else return null;return this.registry[e]}findBackendFactory(e){return e in this.registryFactory?this.registryFactory[e].factory:null}registerBackend(e,t,n=1){return e in this.registryFactory?(qr(`${e} backend was already registered. Reusing existing backend factory.`),!1):(this.registryFactory[e]={factory:t,priority:n},!0)}async setBackend(e){if(this.registryFactory[e]==null)throw Error(`Backend name '${e}' not found in registry`);if(this.backendName=e,this.registry[e]==null){this.backendInstance=null;let{success:t,asyncInit:n}=this.initializeBackend(e);if(!(n?await t:t))return!1}return this.backendInstance=this.registry[e],this.setupRegisteredKernels(),this.profiler=new Vi(this.backendInstance),!0}setupRegisteredKernels(){Qr(this.backendName).forEach(e=>{e.setupFunc!=null&&e.setupFunc(this.backendInstance)})}disposeRegisteredKernels(e){Qr(e).forEach(t=>{t.disposeFunc!=null&&t.disposeFunc(this.registry[e])})}initializeBackend(e){let t=this.registryFactory[e];if(t==null)throw Error(`Cannot initialize backend ${e}, no registration found.`);try{let n=t.factory();if(n&&!(n instanceof g)&&typeof n.then==`function`){let t=++this.pendingBackendInitId,r=n.then(n=>t<this.pendingBackendInitId?!1:(this.registry[e]=n,this.pendingBackendInit=null,!0)).catch(n=>t<this.pendingBackendInitId?!1:(this.pendingBackendInit=null,qr(`Initialization of backend ${e} failed`),qr(n.stack||n.message),!1));return this.pendingBackendInit=r,{success:r,asyncInit:!0}}else return this.registry[e]=n,{success:!0,asyncInit:!1}}catch(t){return qr(`Initialization of backend ${e} failed`),qr(t.stack||t.message),{success:!1,asyncInit:!1}}}removeBackend(e){if(!(e in this.registryFactory))throw Error(`${e} backend not found in registry`);this.backendName===e&&this.pendingBackendInit!=null&&this.pendingBackendInitId++,e in this.registry&&(this.disposeRegisteredKernels(e),this.registry[e].dispose(),delete this.registry[e]),delete this.registryFactory[e],this.backendName===e&&(this.pendingBackendInit=null,this.backendName=null,this.backendInstance=null)}getSortedBackends(){if(Object.keys(this.registryFactory).length===0)throw Error(`No backend found in registry.`);return Object.keys(this.registryFactory).sort((e,t)=>this.registryFactory[t].priority-this.registryFactory[e].priority)}initializeBackendsAndReturnBest(){let e=this.getSortedBackends();for(let t=0;t<e.length;t++){let n=e[t],{success:r,asyncInit:i}=this.initializeBackend(n);if(i||r)return{name:n,asyncInit:i}}throw Error(`Could not initialize any backends, all backend initializations failed.`)}moveData(e,t){let n=this.state.tensorInfo.get(t),r=n.backend,i=this.readSync(t),a=r.refCount(t);r.disposeData(t,!0),n.backend=e,e.move(t,i,n.shape,n.dtype,a),this.shouldCheckForMemLeaks()&&this.state.numDataMovesStack[this.state.numDataMovesStack.length-1]++}tidy(e,t){let n=null;if(t==null){if(typeof e!=`function`)throw Error(`Please provide a function to tidy()`);t=e}else{if(typeof e!=`string`&&!(e instanceof String))throw Error(`When calling with two arguments, the first argument to tidy() must be a string`);if(typeof t!=`function`)throw Error(`When calling with two arguments, the 2nd argument to tidy() must be a function`);n=e}let r;return this.scopedRun(()=>this.startScope(n),()=>this.endScope(r),()=>(r=t(),r instanceof Promise&&console.error(`Cannot return a Promise inside of tidy.`),r))}scopedRun(e,t,n){e();try{let e=n();return t(),e}catch(e){throw t(),e}}nextTensorId(){return e.nextTensorId++}nextVariableId(){return e.nextVariableId++}clone(e){let t=F.runKernel(tn,{x:e}),n={x:e};return this.addTapeNode(this.state.activeScope.name,n,[t],e=>({x:()=>{let t={x:e};return F.runKernel(mt,t,{dtype:`float32`})}}),[],{}),t}runKernel(e,t,n){if(this.backendName??this.backend,Xr(e,this.backendName)==null)throw Error(`Kernel '${e}' not registered for backend '${this.backendName}'`);return this.runKernelFunc({kernelName:e,inputs:t,attrs:n})}shouldCheckForMemLeaks(){return this.ENV.getBool(`IS_TEST`)}checkKernelForMemLeak(e,t,n){let r=this.backend.numDataIds(),i=0;n.forEach(e=>{i+=e.dtype===`complex64`?3:1});let a=this.state.numDataMovesStack[this.state.numDataMovesStack.length-1],o=r-t-i-a;if(o>0)throw Error(`Backend '${this.backendName}' has an internal memory leak (${o} data ids) after running '${e}'`)}runKernelFunc(e){let t,n=[],r=this.isTapeOn(),i=this.state.numBytes,a=this.state.numTensors;this.shouldCheckForMemLeaks()&&this.state.numDataMovesStack.push(0);let o;this.backendName??this.backend;let s,c=ja(e)?e.kernelName:this.state.activeScope==null?``:this.state.activeScope.name;if(ja(e)){let{kernelName:t,inputs:i,attrs:a}=e;this.backendName??this.backend;let c=Xr(t,this.backendName);E(c!=null,()=>`Cannot find registered kernel '${t}' for backend '${this.backendName}'`),o=()=>{let e=this.backend.numDataIds();s=c.kernelFunc({inputs:i,attrs:a,backend:this.backend});let o=Array.isArray(s)?s:[s];this.shouldCheckForMemLeaks()&&this.checkKernelForMemLeak(t,e,o);let l=o.map(e=>e.rank==null?this.makeTensorFromTensorInfo(e):e);if(r){let e=this.getTensorsForGradient(t,i,l);n=this.saveTensorsForBackwardMode(e)}return l}}else{let{forwardFunc:t}=e,i=e=>{r&&(n=e.map(e=>this.keep(this.clone(e))))};o=()=>{let e=this.backend.numDataIds();s=this.tidy(()=>t(this.backend,i));let n=Array.isArray(s)?s:[s];return this.shouldCheckForMemLeaks()&&this.checkKernelForMemLeak(c,e,n),n}}let{inputs:l,attrs:u}=e,d=ja(e)?null:e.backwardsFunc,f;return this.scopedRun(()=>this.state.kernelDepth++,()=>this.state.kernelDepth--,()=>{!this.ENV.getBool(`DEBUG`)&&!this.state.profiling?t=o():(f=this.profiler.profileKernel(c,l,()=>o()),this.ENV.getBool(`DEBUG`)&&this.profiler.logKernelProfile(f),t=f.outputs)}),r&&this.addTapeNode(c,l,t,d,n,u),this.state.profiling&&this.state.activeProfile.kernels.push({name:c,bytesAdded:this.state.numBytes-i,totalBytesSnapshot:this.state.numBytes,tensorsAdded:this.state.numTensors-a,totalTensorsSnapshot:this.state.numTensors,inputShapes:Object.keys(l).map(e=>l[e]==null?null:l[e].shape),outputShapes:t.map(e=>e.shape),kernelTimeMs:f.timeMs,extraInfo:f.extraInfo}),Array.isArray(s)?t:t[0]}saveTensorsForBackwardMode(e){return e.map(e=>this.keep(this.clone(e)))}getTensorsForGradient(e,t,n){let r=Zr(e);if(r!=null){let e=r.inputsToSave||[],i=r.outputsToSave||[],a;r.saveAllInputs?(E(Array.isArray(t),()=>`saveAllInputs is true, expected inputs to be an array.`),a=Object.keys(t).map(e=>t[e])):a=e.map(e=>t[e]);let o=n.filter((e,t)=>i[t]);return a.concat(o)}return[]}makeTensor(e,t,n,r){if(e==null)throw Error(`Values passed to engine.makeTensor() are null`);n||=`float32`,r||=this.backend;let i=e;n===`string`&&ve(e[0])&&(i=e.map(e=>Ii(e)));let a=r.write(i,t,n),o=new la(t,n,a,this.nextTensorId());if(this.trackTensor(o,r),n===`string`){let e=this.state.tensorInfo.get(a),t=_e(i);this.state.numBytes+=t-e.bytes,e.bytes=t}return o}makeTensorFromDataId(e,t,n,r){n||=`float32`;let i={dataId:e,shape:t,dtype:n};return this.makeTensorFromTensorInfo(i,r)}makeTensorFromTensorInfo(e,t){let{dataId:n,shape:r,dtype:i}=e,a=new la(r,i,n,this.nextTensorId());return this.trackTensor(a,t),a}makeVariable(e,t=!0,n,r){n||=this.nextVariableId().toString(),r!=null&&r!==e.dtype&&(e=e.cast(r));let i=new ua(e,t,n,this.nextTensorId());if(this.state.registeredVariables[i.name]!=null)throw Error(`Variable with name ${i.name} was already registered`);return this.state.registeredVariables[i.name]=i,this.incRef(i,this.backend),i}trackTensor(e,t){this.state.numTensors++,e.dtype===`string`&&this.state.numStringTensors++;let n=0;e.dtype!==`complex64`&&e.dtype!==`string`&&(n=e.size*ge(e.dtype)),this.state.numBytes+=n,this.state.tensorInfo.has(e.dataId)||(this.state.numDataBuffers++,this.state.tensorInfo.set(e.dataId,{backend:t||this.backend,dtype:e.dtype,shape:e.shape,bytes:n})),e instanceof ua||this.track(e)}incRef(e,t){this.trackTensor(e,t),this.backend.incRef(e.dataId)}removeDataId(e,t){this.state.tensorInfo.has(e)&&this.state.tensorInfo.get(e).backend===t&&(this.state.tensorInfo.delete(e),this.state.numDataBuffers--)}disposeTensor(e){if(!this.state.tensorInfo.has(e.dataId))return;let t=this.state.tensorInfo.get(e.dataId);if(this.state.numTensors--,e.dtype===`string`&&(this.state.numStringTensors--,this.state.numBytes-=t.bytes),e.dtype!==`complex64`&&e.dtype!==`string`){let t=e.size*ge(e.dtype);this.state.numBytes-=t}t.backend.disposeData(e.dataId)&&this.removeDataId(e.dataId,t.backend)}disposeVariables(){for(let e in this.state.registeredVariables){let t=this.state.registeredVariables[e];this.disposeVariable(t)}}disposeVariable(e){this.disposeTensor(e),this.state.registeredVariables[e.name]!=null&&delete this.state.registeredVariables[e.name]}memory(){let e=this.backend.memory();return e.numTensors=this.state.numTensors,e.numDataBuffers=this.state.numDataBuffers,e.numBytes=this.state.numBytes,this.state.numStringTensors>0&&(e.unreliable=!0,e.reasons??=[],e.reasons.push(`Memory usage by string tensors is approximate (2 bytes per character)`)),e}async profile(e){this.state.profiling=!0;let t=this.state.numBytes,n=this.state.numTensors;this.state.activeProfile.kernels=[],this.state.activeProfile.result=await e(),this.state.profiling=!1,this.state.activeProfile.peakBytes=Math.max(...this.state.activeProfile.kernels.map(e=>e.totalBytesSnapshot)),this.state.activeProfile.newBytes=this.state.numBytes-t,this.state.activeProfile.newTensors=this.state.numTensors-n;for(let e of this.state.activeProfile.kernels)e.kernelTimeMs=await e.kernelTimeMs,e.extraInfo=await e.extraInfo;return this.state.activeProfile}isTapeOn(){return this.state.gradientDepth>0&&this.state.kernelDepth===0}addTapeNode(e,t,n,r,i,a){let o={id:this.state.nextTapeNodeId++,kernelName:e,inputs:t,outputs:n,saved:i},s=Zr(e);s!=null&&(r=s.gradFunc),r!=null&&(o.gradient=e=>(e=e.map((e,t)=>{if(e==null){let e=n[t],r=Oe(e.size,e.dtype);return this.makeTensor(r,e.shape,e.dtype)}return e}),r(e.length>1?e:e[0],i,a))),this.state.activeTape.push(o)}keep(e){return e.kept=!0,e}startTape(){this.state.gradientDepth===0&&(this.state.activeTape=[]),this.state.gradientDepth++}endTape(){this.state.gradientDepth--}startScope(e){let t={track:[],name:`unnamed scope`,id:this.state.nextScopeId++};e&&(t.name=e),this.state.scopeStack.push(t),this.state.activeScope=t}endScope(e){let t=Da(e),n=new Set(t.map(e=>e.id));for(let e=0;e<this.state.activeScope.track.length;e++){let t=this.state.activeScope.track[e];!t.kept&&!n.has(t.id)&&t.dispose()}let r=this.state.scopeStack.pop();this.state.activeScope=this.state.scopeStack.length===0?null:this.state.scopeStack[this.state.scopeStack.length-1],t.forEach(e=>{!e.kept&&e.scopeId===r.id&&this.track(e)})}gradients(e,t,n,r=!1){if(E(t.length>0,()=>`gradients() received an empty list of xs.`),n!=null&&n.dtype!==`float32`)throw Error(`dy must have 'float32' dtype, but has '${n.dtype}'`);let i=this.scopedRun(()=>this.startTape(),()=>this.endTape(),()=>this.tidy(`forward`,e));E(i instanceof la,()=>`The result y returned by f() must be a tensor.`);let a=Wi(this.state.activeTape,t,i);if(!r&&a.length===0&&t.length>0)throw Error(`Cannot compute gradient of y=f(x) with respect to x. Make sure that the f you passed encloses all operations that lead from x to y.`);return this.tidy(`backward`,()=>{let e={};e[i.id]=n??Ma(i.shape),Gi(e,a,e=>this.tidy(e),Pa);let r=t.map(t=>e[t.id]);return this.state.gradientDepth===0&&(this.state.activeTape.forEach(e=>{for(let t of e.saved)t.dispose()}),this.state.activeTape=null),{value:i,grads:r}})}customGrad(e){return E(Se(e),()=>`The f passed in customGrad(f) must be a function.`),(...t)=>{E(t.every(e=>e instanceof la),()=>`The args passed in customGrad(f)(x1, x2,...) must all be tensors`);let n,r={};return t.forEach((e,t)=>{r[t]=e}),this.runKernelFunc({forwardFunc:(r,i)=>(n=e(...t,i),E(n.value instanceof la,()=>"The function f passed in customGrad(f) must return an object where `obj.value` is a tensor"),E(Se(n.gradFunc),()=>"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function."),n.value),backwardsFunc:(e,r)=>{let i=n.gradFunc(e,r),a=Array.isArray(i)?i:[i];E(a.length===t.length,()=>"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function that returns the same number of tensors as inputs passed to f(...)."),E(a.every(e=>e instanceof la),()=>"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function that returns a list of only tensors.");let o={};return a.forEach((e,t)=>{o[t]=()=>e}),o},inputs:r})}}readSync(e){return this.state.tensorInfo.get(e).backend.readSync(e)}read(e){return this.state.tensorInfo.get(e).backend.read(e)}readToGPU(e,t){return this.state.tensorInfo.get(e).backend.readToGPU(e,t)}async time(e){let t=Pi(),n=await this.backend.time(e);return n.wallMs=Pi()-t,n}track(e){return this.state.activeScope!=null&&(e.scopeId=this.state.activeScope.id,this.state.activeScope.track.push(e)),e}get registeredVariables(){return this.state.registeredVariables}reset(){this.pendingBackendInitId++,this.state.dispose(),this.ENV.reset(),this.state=new Fa;for(let e in this.registry)this.disposeRegisteredKernels(e),this.registry[e].dispose(),delete this.registry[e];this.backendName=null,this.backendInstance=null,this.pendingBackendInit=null}},Ia.nextTensorId=0,Ia.nextVariableId=0,F=Na()})),La=c({isBrowser:()=>Va,isMobile:()=>Ba,mockIsMobile:()=>za});function Ra(){return typeof navigator<`u`&&navigator!=null}function za(e){Ha=e}function Ba(e){if(Ha!==void 0)return Ha;if(e||Ra()){if(e||=navigator,e.product===`ReactNative`)return!0;let t=e.userAgent||e.vendor||(typeof window<`u`?window.opera:``);if(!t){let t=e;return t.userAgentData&&t.userAgentData.mobile}return/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(t)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(t.substr(0,4))}return!1}function Va(){return typeof window<`u`&&window.document!=null||typeof WorkerGlobalScope<`u`}var Ha,Ua=o((()=>{})),Wa,Ga=o((()=>{I(),Ua(),He(),Wa=M(),Wa.registerFlag(`DEBUG`,()=>!1,e=>{e&&console.warn(`Debugging mode is ON. The output of every math call will be downloaded to CPU and checked for NaNs. This significantly impacts performance.`)}),Wa.registerFlag(`IS_BROWSER`,()=>Va()),Wa.registerFlag(`IS_NODE`,()=>typeof process<`u`&&process.versions!==void 0&&process.versions.node!==void 0),Wa.registerFlag(`IS_CHROME`,()=>typeof navigator<`u`&&navigator!=null&&navigator.userAgent!=null&&/Chrome/.test(navigator.userAgent)&&/Google Inc/.test(navigator.vendor)),Wa.registerFlag(`IS_SAFARI`,()=>typeof navigator<`u`&&navigator!=null&&navigator.userAgent!=null&&/Safari/.test(navigator.userAgent)&&/Apple/.test(navigator.vendor)),Wa.registerFlag(`PROD`,()=>!1),Wa.registerFlag(`TENSORLIKE_CHECK_SHAPE_CONSISTENCY`,()=>Wa.getBool(`DEBUG`)),Wa.registerFlag(`DEPRECATION_WARNINGS_ENABLED`,()=>!0),Wa.registerFlag(`IS_TEST`,()=>!1),Wa.registerFlag(`CHECK_COMPUTATION_FOR_ERRORS`,()=>Wa.getBool(`DEBUG`)),Wa.registerFlag(`WRAP_TO_IMAGEBITMAP`,()=>!1),Wa.registerFlag(`CANVAS2D_WILL_READ_FREQUENTLY_FOR_GPU`,()=>!1),Wa.registerFlag(`USE_SETTIMEOUTCUSTOM`,()=>!1)}));function Ka(e,t){let n=e;if(Ri(e))return t===`string`?[]:[e.length];if(ma(e)){let t=e.channels||`RGBA`;return[e.height,e.width*t.length]}else if(ha(e))return[e.buffer.size/(t==null?4:ge(t))];if(!Array.isArray(e))return[];let r=[];for(;Array.isArray(n)||Ri(n)&&t!==`string`;)r.push(n.length),n=n[0];return Array.isArray(e)&&M().getBool(`TENSORLIKE_CHECK_SHAPE_CONSISTENCY`)&&qa(e,r,[]),r}function qa(e,t,n){if(n||=[],!Array.isArray(e)&&!Ri(e)){E(t.length===0,()=>`Element arr[${n.join(`][`)}] is a primitive, but should be an array/TypedArray of ${t[0]} elements`);return}E(t.length>0,()=>`Element arr[${n.join(`][`)}] should be a primitive, but is an array of ${e.length} elements`),E(e.length===t[0],()=>`Element arr[${n.join(`][`)}] should have ${t[0]} elements, but has ${e.length} elements`);let r=t.slice(1);for(let t=0;t<e.length;++t)qa(e[t],r,n.concat(t))}function Ja(e,t,n,r){if(e!==`string_or_numeric`){if(e==null)throw Error(`Expected dtype cannot be null.`);if(e!==`numeric`&&e!==t||e===`numeric`&&t===`string`)throw Error(`Argument '${n}' passed to '${r}' must be ${e} tensor, but got ${t} tensor`)}}function L(e,t,n,r=`numeric`){if(e instanceof aa())return Ja(r,e.dtype,t,n),e;let i=xe(e);if(i!==`string`&&[`bool`,`int32`,`float32`].indexOf(r)>=0&&(i=r),Ja(r,i,t,n),e==null||!Ri(e)&&!Array.isArray(e)&&typeof e!=`number`&&typeof e!=`boolean`&&typeof e!=`string`){let r=e==null?`null`:e.constructor.name;throw Error(`Argument '${t}' passed to '${n}' must be a Tensor or TensorLike, but got '${r}'`)}let a=Ka(e,i);!Ri(e)&&!Array.isArray(e)&&(e=[e]);let o=i===`string`?zi(e,[],!0):Ni(e,i);return F.makeTensor(o,a,i)}function Ya(e,t,n,r=`numeric`){if(!Array.isArray(e))throw Error(`Argument ${t} passed to ${n} must be a \`Tensor[]\` or \`TensorLike[]\``);return e.map((e,i)=>L(e,`${t}[${i}]`,n,r))}var R=o((()=>{I(),He(),da(),Sa(),P(),Pe()}));function z(e){let t=Object.keys(e);if(t.length!==1)throw Error(`Please provide an object with a single key (operation name) mapping to a function. Got an object with ${t.length} keys.`);let n=t[0],r=e[n];n.endsWith(`_`)&&(n=n.substring(0,n.length-1)),n+=Xa;let i=(...e)=>{F.startScope(n);try{let t=r(...e);return Ne(t)&&console.error(`Cannot return a Promise inside of tidy.`),F.endScope(t),t}catch(e){throw F.endScope(null),e}};return Object.defineProperty(i,`name`,{value:n,configurable:!0}),i}var Xa,B=o((()=>{I(),P(),Xa=`__op`}));function Za(e,t){let n=L(e,`real`,`complex`),r=L(t,`imag`,`complex`);D(n.shape,r.shape,`real and imag shapes, ${n.shape} and ${r.shape}, must match in call to tf.complex().`);let i={real:n,imag:r};return F.runKernel(_t,i)}var Qa,$a=o((()=>{I(),N(),R(),P(),B(),Qa=z({complex_:Za})}));function eo(e,t,n,r){if(r==null)r=xe(e);else if(r===`complex64`)throw Error(`Cannot construct a complex64 tensor directly. Please use tf.complex(real, imag).`);if(ha(e)||ma(e)){if(r!==`float32`&&r!==`int32`)throw Error(`Creating tensor from GPU data only supports 'float32'|'int32' dtype, while the dtype is ${r}.`);return F.backend.createTensorFromGPUData(e,t||n,r)}if(!Ri(e)&&!Array.isArray(e)&&typeof e!=`number`&&typeof e!=`boolean`&&typeof e!=`string`)throw Error(`values passed to tensor(values) must be a number/boolean/string or an array of numbers/booleans/strings, or a TypedArray`);if(t!=null){Ae(t);let e=O(t),r=O(n);E(e===r,()=>`Based on the provided shape, [${t}], the tensor should have ${e} values but has ${r}`);for(let e=0;e<n.length;++e){let r=n[e],i=e===n.length-1?r!==O(t.slice(e)):!0;E(n[e]===t[e]||!i,()=>`Error creating a new Tensor. Inferred shape (${n}) does not match the provided shape (${t}). `)}}return!Ri(e)&&!Array.isArray(e)&&(e=[e]),t||=n,e=r===`string`?zi(e,[],!0):Ni(e,r),F.makeTensor(e,t,r)}var to=o((()=>{I(),Sa(),P()}));function no(e,t,n){return eo(e,t,Ka(e,n),n)}var ro=o((()=>{R(),to()})),io,ao=o((()=>{io={float32:4,float16:2,int32:4,uint16:2,uint8:1,bool:1,complex64:8}}));function oo(e,t){let n=0,r=e.length;for(;n<=r;){let i=Math.floor((r-n)/2)+n,a=t(e[i]);if(a===0)return i;a<0?r=i:n=i+1}return-1}var so,co=o((()=>{P(),so=class e{static join(t){return new e(t).slice()}constructor(e){if(this.shards=[],this.previousShardIndex=0,e==null||(e instanceof Array||(e=[e]),e=e.map(e=>Ri(e)?e.buffer:e),e.length===0))return;this.bufferUniformSize=e[0].byteLength;let t=0;for(let n=0;n<e.length;n++){let r=e[n];n!==e.length-1&&r.byteLength!==this.bufferUniformSize&&(this.bufferUniformSize=void 0);let i=t+r.byteLength;this.shards.push({buffer:r,start:t,end:i}),t=i}this.shards.length===0&&(this.byteLength=0),this.byteLength=this.shards[this.shards.length-1].end}slice(e=0,t=this.byteLength){if(this.shards.length===0||(e=isNaN(Number(e))?0:e,t=isNaN(Number(t))?0:t,e=Math.max(0,e),t=Math.min(this.byteLength,t),t<=e))return new ArrayBuffer(0);let n=this.findShardForByte(e);if(n===-1)throw Error(`Could not find start shard for byte ${e}`);let r=t-e,i=new ArrayBuffer(r),a=new Uint8Array(i),o=0;for(let r=n;r<this.shards.length;r++){let n=this.shards[r],i=e+o-n.start,s=o,c=Math.min(t,n.end)-n.start,l=new Uint8Array(n.buffer,i,c-i);if(a.set(l,s),o+=l.length,t<n.end)break}return i}findShardForByte(e){if(this.shards.length===0||e<0||e>=this.byteLength)return-1;if(this.bufferUniformSize!=null)return this.previousShardIndex=Math.floor(e/this.bufferUniformSize),this.previousShardIndex;function t(t){return e<t.start?-1:+(e>=t.end)}if(t(this.shards[this.previousShardIndex])===0)return this.previousShardIndex;let n=oo(this.shards,t);return n===-1?-1:(this.previousShardIndex=n,this.previousShardIndex)}}}));function lo(){M().set(`PROD`,!0)}function uo(){M().set(`DEBUG`,!0)}function fo(){M().set(`DEPRECATION_WARNINGS_ENABLED`,!1),console.warn(`TensorFlow.js deprecation warnings have been disabled.`)}function po(e){M().getBool(`DEPRECATION_WARNINGS_ENABLED`)&&console.warn(e+` You can disable deprecation warnings with tf.disableDeprecationWarnings().`)}function mo(){F.disposeVariables()}function ho(){return F}function go(){return F.memory()}function _o(e){return F.profile(e)}function vo(e,t){return F.tidy(e,t)}function yo(e){Da(e).forEach(e=>e.dispose())}function bo(e){return F.keep(e)}function xo(e){return F.time(e)}function So(e){return F.setBackend(e)}function Co(){return F.ready()}function wo(){return F.backendName}function To(e){F.removeBackend(e)}function Eo(e){return F.findBackend(e)}function Do(e){return F.findBackendFactory(e)}function Oo(e,t,n=1){return F.registerBackend(e,t,n)}function ko(){return F.backend}function Ao(e,t){M().setPlatform(e,t)}var jo=o((()=>{I(),He(),da(),Aa()}));async function Mo(e,t){let n=[],r=[],i=Array.isArray(e)?e.map(e=>e.name):Object.keys(e);for(let a=0;a<i.length;++a){let o=i[a],s=Array.isArray(e)?e[a].tensor:e[o];if(s.dtype!==`float32`&&s.dtype!==`int32`&&s.dtype!==`bool`&&s.dtype!==`string`&&s.dtype!==`complex64`)throw Error(`Unsupported dtype in weight '${o}': ${s.dtype}`);let c={name:o,shape:s.shape,dtype:s.dtype};if(s.dtype===`string`){let e=new Promise(async e=>{let t=await s.bytes(),n=t.reduce((e,t)=>e+t.length,0)+es*t.length,r=new Uint8Array(n),i=0;for(let e=0;e<t.length;e++){let n=t[e],a=new Uint8Array(new Uint32Array([n.length]).buffer);r.set(a,i),i+=es,r.set(n,i),i+=n.length}e(r)});r.push(e)}else r.push(s.data());t!=null&&(c.group=t),n.push(c)}return{data:zo(await Promise.all(r)),specs:n}}function No(e,t){let n=new so(e),r={},i=0;for(let e of t){let t=Po(e,(e,t)=>n.slice(i+e,i+t));r[e.name]=Io(e,n.slice(i,i+t)),i+=t}return r}function Po(e,t){let n=O(e.shape),r;if(`quantization`in e)r=io[e.quantization.dtype];else if(e.dtype===`string`){let e=0;for(let r=0;r<n;r++)e+=es+new Uint32Array(t(e,e+es))[0];return e}else r=io[e.dtype];return n*r}async function Fo(e,t){let n=O(e.shape),r;if(`quantization`in e)r=io[e.quantization.dtype];else if(e.dtype===`string`){let e=0;for(let r=0;r<n;r++)e+=es+new Uint32Array(await t(e,e+es))[0];return e}else r=io[e.dtype];return n*r}function Io(e,t){let n=e.name,r=e.dtype,i=e.shape,a=O(i),o,s=0;if(`quantization`in e){let i=e.quantization;if(i.dtype===`uint8`||i.dtype===`uint16`){if(!(`min`in i&&`scale`in i))throw Error(`Weight ${e.name} with quantization ${i.dtype} doesn't have corresponding metadata min and scale.`)}else if(i.dtype===`float16`){if(r!==`float32`)throw Error(`Weight ${e.name} is quantized with ${i.dtype} which only supports weights of type float32 not ${r}.`)}else throw Error(`Weight ${e.name} has unknown quantization dtype ${i.dtype}. Supported quantization dtypes are: 'uint8', 'uint16', and 'float16'.`);let c=io[i.dtype],l=i.dtype===`uint8`?new Uint8Array(t):new Uint16Array(t);if(r===`float32`)if(i.dtype===`uint8`||i.dtype===`uint16`){o=new Float32Array(l.length);for(let e=0;e<l.length;e++){let t=l[e];o[e]=t*i.scale+i.min}}else if(i.dtype===`float16`)o=$o()(l);else throw Error(`Unsupported quantization type ${i.dtype} for weight type float32.`);else if(r===`int32`){if(i.dtype!==`uint8`&&i.dtype!==`uint16`)throw Error(`Unsupported quantization type ${i.dtype} for weight type int32.`);o=new Int32Array(l.length);for(let e=0;e<l.length;e++){let t=l[e];o[e]=Math.round(t*i.scale+i.min)}}else throw Error(`Unsupported dtype in weight '${n}': ${r}`);s+=a*c}else if(r===`string`){let n=O(e.shape);o=[];for(let e=0;e<n;e++){let e=new Uint32Array(t.slice(s,s+es))[0];s+=es;let n=new Uint8Array(t.slice(s,s+e));o.push(n),s+=e}}else{let e=io[r];if(r===`float32`)o=new Float32Array(t);else if(r===`int32`)o=new Int32Array(t);else if(r===`bool`)o=new Uint8Array(t);else if(r===`complex64`){o=new Float32Array(t);let e=new Float32Array(o.length/2),n=new Float32Array(o.length/2);for(let t=0;t<e.length;t++)e[t]=o[t*2],n[t]=o[t*2+1];let r=no(e,i,`float32`),a=no(n,i,`float32`),s=Qa(r,a);return r.dispose(),a.dispose(),s}else throw Error(`Unsupported dtype in weight '${n}': ${r}`);s+=a*e}return no(o,i,r)}async function Lo(e,t,n){let r=new Uint8Array(t);for(;r.byteLength<n;){let{done:t,value:i}=await e.read();if(t&&i==null){let e=n-r.byteLength;throw Error(`Reader is done but ${e} bytes are still expected`)}let a=new Uint8Array(r.length+i.byteLength);a.set(r,0),a.set(new Uint8Array(i),r.length),r=a}return r.buffer}async function Ro(e,t){let n={},r=e.getReader(),i=new ArrayBuffer(0);for(let e of t){let t=await Fo(e,async(e,t)=>(i=await Lo(r,i,t),i.slice(e,t)));i=await Lo(r,i,t);let a=i.slice(0,t);i=i.slice(t);let o=Io(e,a);if(n[e.name]=o,wo()===`webgpu`){let e=ko();`uploadToGPU`in e&&O(o.shape)>=M().get(`WEBGPU_CPU_HANDOFF_SIZE_THRESHOLD`)&&e.uploadToGPU(o.dataId)}}return n}function zo(e){if(e===null)throw Error(`Invalid input value: ${JSON.stringify(e)}`);let t=0,n=[];e.forEach(e=>{if(t+=e.byteLength,n.push(e.byteLength===e.buffer.byteLength?e:new e.constructor(e)),!(e instanceof Float32Array||e instanceof Int32Array||e instanceof Uint8Array))throw Error(`Unsupported TypedArray subtype: ${e.constructor.name}`)});let r=new Uint8Array(t),i=0;return n.forEach(e=>{r.set(new Uint8Array(e.buffer),i),i+=e.byteLength}),r.buffer}function Bo(e){return ts?Buffer.byteLength(e,`utf8`):new Blob([e]).size}function Vo(e){if(ts)return Buffer.from(e).toString(`base64`);let t=new Uint8Array(e),n=``;for(let e=0,r=t.length;e<r;e++)n+=String.fromCharCode(t[e]);return btoa(n)}function Ho(e){if(ts){let t=Buffer.from(e,`base64`);return t.buffer.slice(t.byteOffset,t.byteOffset+t.byteLength)}let t=atob(e),n=new Uint8Array(t.length);for(let e=0;e<t.length;++e)n.set([t.charCodeAt(e)],e);return n.buffer}function Uo(e){return so.join(e)}function Wo(e){for(e=e.trim();e.endsWith(`/`);)e=e.slice(0,e.length-1);let t=e.split(`/`);return t[t.length-1]}function Go(e,t){let n={modelTopology:e.modelTopology,format:e.format,generatedBy:e.generatedBy,convertedBy:e.convertedBy,weightsManifest:t};return e.signature!=null&&(n.signature=e.signature),e.userDefinedMetadata!=null&&(n.userDefinedMetadata=e.userDefinedMetadata),e.modelInitializer!=null&&(n.modelInitializer=e.modelInitializer),e.initializerSignature!=null&&(n.initializerSignature=e.initializerSignature),e.trainingConfig!=null&&(n.trainingConfig=e.trainingConfig),n}function Ko(e,t,n){let r={modelTopology:e.modelTopology,format:e.format,generatedBy:e.generatedBy,convertedBy:e.convertedBy};if(e.trainingConfig!=null&&(r.trainingConfig=e.trainingConfig),e.weightsManifest!=null){if(!t)throw Error(`modelJSON has weightsManifest but weightSpecs is null`);if(!n)throw Error(`modelJSON has weightsManifest but weightData is null`);r.weightSpecs=t,r.weightData=n}return e.signature!=null&&(r.signature=e.signature),e.userDefinedMetadata!=null&&(r.userDefinedMetadata=e.userDefinedMetadata),e.modelInitializer!=null&&(r.modelInitializer=e.modelInitializer),e.initializerSignature!=null&&(r.initializerSignature=e.initializerSignature),r}async function qo(e,t){let n,r;return e.weightsManifest!=null&&([n,r]=await t(e.weightsManifest)),Ko(e,n,r)}function Jo(e){if(e.modelTopology instanceof ArrayBuffer)throw Error(`Expected JSON model topology, received ArrayBuffer.`);return{dateSaved:new Date,modelTopologyType:`JSON`,modelTopologyBytes:e.modelTopology==null?0:Bo(JSON.stringify(e.modelTopology)),weightSpecsBytes:e.weightSpecs==null?0:Bo(JSON.stringify(e.weightSpecs)),weightDataBytes:e.weightData==null?0:new so(e.weightData).byteLength}}function Yo(e){let t=[];for(let n of e)t.push(...n.weights);return t}function Xo(){let e=e=>{let t=e<<13,n=0;for(;!(t&8388608);)n-=8388608,t<<=1;return t&=-8388609,n+=947912704,t|n},t=new Uint32Array(2048);t[0]=0;for(let n=1;n<1024;n++)t[n]=e(n);for(let e=1024;e<2048;e++)t[e]=939524096+(e-1024<<13);return t}function Zo(){let e=new Uint32Array(64);e[0]=0,e[31]=1199570944,e[32]=2147483648,e[63]=3347054592;for(let t=1;t<31;t++)e[t]=t<<23;for(let t=33;t<63;t++)e[t]=2147483648+(t-32<<23);return e}function Qo(){let e=new Uint32Array(64);for(let t=0;t<64;t++)e[t]=1024;return e[0]=e[32]=0,e}function $o(){let e=Xo(),t=Zo(),n=Qo();return r=>{let i=new ArrayBuffer(4*r.length),a=new Uint32Array(i);for(let i=0;i<r.length;i++){let o=r[i];a[i]=e[n[o>>10]+(o&1023)]+t[o>>10]}return new Float32Array(i)}}var es,ts,ns=o((()=>{$a(),ro(),P(),ao(),co(),jo(),He(),es=4,ts=typeof Buffer<`u`&&(typeof Blob>`u`||typeof atob>`u`||typeof btoa>`u`)})),rs,is,as,os,ss,cs=o((()=>{rs=class e{constructor(){this.saveRouters=[],this.loadRouters=[]}static getInstance(){return e.instance??=new e,e.instance}static registerSaveRouter(t){e.getInstance().saveRouters.push(t)}static registerLoadRouter(t){e.getInstance().loadRouters.push(t)}static getSaveHandlers(t){return e.getHandlers(t,`save`)}static getLoadHandlers(t,n){return e.getHandlers(t,`load`,n)}static getHandlers(t,n,r){let i=[];return(n===`load`?e.getInstance().loadRouters:e.getInstance().saveRouters).forEach(e=>{let n=e(t,r);n!==null&&i.push(n)}),i}},is=e=>rs.registerSaveRouter(e),as=e=>rs.registerLoadRouter(e),os=e=>rs.getSaveHandlers(e),ss=(e,t)=>rs.getLoadHandlers(e,t)}));function ls(){if(!M().getBool(`IS_BROWSER`))throw Error(`Failed to obtain IndexedDB factory because the current environmentis not a web browser.`);let e=typeof window>`u`?self:window,t=e.indexedDB||e.mozIndexedDB||e.webkitIndexedDB||e.msIndexedDB||e.shimIndexedDB;if(t==null)throw Error(`The current browser does not appear to support IndexedDB.`);return t}function us(e){let t=e.result;t.createObjectStore(hs,{keyPath:`modelPath`}),t.createObjectStore(gs,{keyPath:`modelPath`})}function ds(e){return new _s(e)}function fs(e){return e.startsWith(_s.URL_SCHEME)?e.slice(_s.URL_SCHEME.length):e}var ps,ms,hs,gs,_s,vs,ys,bs=o((()=>{Ga(),He(),ns(),cs(),co(),ps=`tensorflowjs`,ms=1,hs=`models_store`,gs=`model_info_store`,_s=class{constructor(e){if(this.indexedDB=ls(),e==null||!e)throw Error(`For IndexedDB, modelPath must not be null, undefined or empty.`);this.modelPath=e}async save(e){if(e.modelTopology instanceof ArrayBuffer)throw Error(`BrowserLocalStorage.save() does not support saving model topology in binary formats yet.`);return this.databaseAction(this.modelPath,e)}async load(){return this.databaseAction(this.modelPath)}databaseAction(e,t){return new Promise((e,n)=>{let r=this.indexedDB.open(ps,ms);r.onupgradeneeded=()=>us(r),r.onsuccess=()=>{let i=r.result;if(t==null){let t=i.transaction(hs,`readonly`),r=t.objectStore(hs).get(this.modelPath);r.onsuccess=()=>{if(r.result==null)return i.close(),n(Error(`Cannot find model with path '${this.modelPath}' in IndexedDB.`));e(r.result.modelArtifacts)},r.onerror=e=>(i.close(),n(r.error)),t.oncomplete=()=>i.close()}else{t.weightData=so.join(t.weightData);let r=Jo(t),a=i.transaction(gs,`readwrite`),o=a.objectStore(gs),s;try{s=o.put({modelPath:this.modelPath,modelArtifactsInfo:r})}catch(e){return n(e)}let c;s.onsuccess=()=>{c=i.transaction(hs,`readwrite`);let s=c.objectStore(hs),l;try{l=s.put({modelPath:this.modelPath,modelArtifacts:t,modelArtifactsInfo:r})}catch(e){return n(e)}l.onsuccess=()=>e({modelArtifactsInfo:r}),l.onerror=e=>{o=a.objectStore(gs);let t=o.delete(this.modelPath);t.onsuccess=()=>(i.close(),n(l.error)),t.onerror=e=>(i.close(),n(l.error))}},s.onerror=e=>(i.close(),n(s.error)),a.oncomplete=()=>{c==null?i.close():c.oncomplete=()=>i.close()}}},r.onerror=e=>n(r.error)})}},_s.URL_SCHEME=`indexeddb://`,vs=e=>M().getBool(`IS_BROWSER`)&&!Array.isArray(e)&&e.startsWith(_s.URL_SCHEME)?ds(e.slice(_s.URL_SCHEME.length)):null,rs.registerSaveRouter(vs),rs.registerLoadRouter(vs),ys=class{constructor(){this.indexedDB=ls()}async listModels(){return new Promise((e,t)=>{let n=this.indexedDB.open(ps,ms);n.onupgradeneeded=()=>us(n),n.onsuccess=()=>{let r=n.result,i=r.transaction(gs,`readonly`),a=i.objectStore(gs).getAll();a.onsuccess=()=>{let t={};for(let e of a.result)t[e.modelPath]=e.modelArtifactsInfo;e(t)},a.onerror=e=>(r.close(),t(a.error)),i.oncomplete=()=>r.close()},n.onerror=e=>t(n.error)})}async removeModel(e){return e=fs(e),new Promise((t,n)=>{let r=this.indexedDB.open(ps,ms);r.onupgradeneeded=()=>us(r),r.onsuccess=()=>{let i=r.result,a=i.transaction(gs,`readwrite`),o=a.objectStore(gs),s=o.get(e),c;s.onsuccess=()=>{if(s.result==null)return i.close(),n(Error(`Cannot find model with path '${e}' in IndexedDB.`));{let r=o.delete(e),a=()=>{c=i.transaction(hs,`readwrite`);let r=c.objectStore(hs).delete(e);r.onsuccess=()=>t(s.result.modelArtifactsInfo),r.onerror=e=>n(s.error)};r.onsuccess=a,r.onerror=e=>(a(),i.close(),n(s.error))}},s.onerror=e=>(i.close(),n(s.error)),a.oncomplete=()=>{c==null?i.close():c.oncomplete=()=>i.close()}},r.onerror=e=>n(r.error)})}}}));function xs(e){return{info:[Ds,e,Os].join(Es),topology:[Ds,e,ks].join(Es),weightSpecs:[Ds,e,As].join(Es),weightData:[Ds,e,js].join(Es),modelMetadata:[Ds,e,Ms].join(Es)}}function Ss(e){for(let t of Object.values(e))window.localStorage.removeItem(t)}function Cs(e){let t=e.split(Es);if(t.length<3)throw Error(`Invalid key format: ${e}`);return t.slice(1,t.length-1).join(Es)}function ws(e){return e.startsWith(Ns.URL_SCHEME)?e.slice(Ns.URL_SCHEME.length):e}function Ts(e){return new Ns(e)}var Es,Ds,Os,ks,As,js,Ms,Ns,Ps,Fs,Is=o((()=>{Ga(),He(),P(),ns(),co(),cs(),Es=`/`,Ds=`tensorflowjs_models`,Os=`info`,ks=`model_topology`,As=`weight_specs`,js=`weight_data`,Ms=`model_metadata`,Ns=class{constructor(e){if(!M().getBool(`IS_BROWSER`)||typeof window>`u`||window.localStorage===void 0)throw Error(`The current environment does not support local storage.`);if(this.LS=window.localStorage,e==null||!e)throw Error(`For local storage, modelPath must not be null, undefined or empty.`);this.modelPath=e,this.keys=xs(this.modelPath)}async save(e){if(e.modelTopology instanceof ArrayBuffer)throw Error(`BrowserLocalStorage.save() does not support saving model topology in binary formats yet.`);{let t=JSON.stringify(e.modelTopology),n=JSON.stringify(e.weightSpecs),r=Jo(e),i=so.join(e.weightData);try{this.LS.setItem(this.keys.info,JSON.stringify(r)),this.LS.setItem(this.keys.topology,t),this.LS.setItem(this.keys.weightSpecs,n),this.LS.setItem(this.keys.weightData,Vo(i));let a={format:e.format,generatedBy:e.generatedBy,convertedBy:e.convertedBy,signature:e.signature==null?void 0:e.signature,userDefinedMetadata:e.userDefinedMetadata==null?void 0:e.userDefinedMetadata,modelInitializer:e.modelInitializer==null?void 0:e.modelInitializer,initializerSignature:e.initializerSignature==null?void 0:e.initializerSignature,trainingConfig:e.trainingConfig==null?void 0:e.trainingConfig};return this.LS.setItem(this.keys.modelMetadata,JSON.stringify(a)),{modelArtifactsInfo:r}}catch{throw Ss(this.keys),Error(`Failed to save model '${this.modelPath}' to local storage: size quota being exceeded is a possible cause of this failure: modelTopologyBytes=${r.modelTopologyBytes}, weightSpecsBytes=${r.weightSpecsBytes}, weightDataBytes=${r.weightDataBytes}.`)}}}async load(){let e=JSON.parse(this.LS.getItem(this.keys.info));if(e==null)throw Error(`In local storage, there is no model with name '${this.modelPath}'`);if(e.modelTopologyType!==`JSON`)throw Error(`BrowserLocalStorage does not support loading non-JSON model topology yet.`);let t={},n=JSON.parse(this.LS.getItem(this.keys.topology));if(n==null)throw Error(`In local storage, the topology of model '${this.modelPath}' is missing.`);t.modelTopology=n;let r=JSON.parse(this.LS.getItem(this.keys.weightSpecs));if(r==null)throw Error(`In local storage, the weight specs of model '${this.modelPath}' are missing.`);t.weightSpecs=r;let i=this.LS.getItem(this.keys.modelMetadata);if(i!=null){let e=JSON.parse(i);t.format=e.format,t.generatedBy=e.generatedBy,t.convertedBy=e.convertedBy,e.signature!=null&&(t.signature=e.signature),e.userDefinedMetadata!=null&&(t.userDefinedMetadata=e.userDefinedMetadata),e.modelInitializer!=null&&(t.modelInitializer=e.modelInitializer),e.initializerSignature!=null&&(t.initializerSignature=e.initializerSignature),e.trainingConfig!=null&&(t.trainingConfig=e.trainingConfig)}let a=this.LS.getItem(this.keys.weightData);if(a==null)throw Error(`In local storage, the binary weight values of model '${this.modelPath}' are missing.`);return t.weightData=Ho(a),t}},Ns.URL_SCHEME=`localstorage://`,Ps=e=>M().getBool(`IS_BROWSER`)&&!Array.isArray(e)&&e.startsWith(Ns.URL_SCHEME)?Ts(e.slice(Ns.URL_SCHEME.length)):null,rs.registerSaveRouter(Ps),rs.registerLoadRouter(Ps),Fs=class{constructor(){E(M().getBool(`IS_BROWSER`),()=>`Current environment is not a web browser`),E(typeof window>`u`||window.localStorage!==void 0,()=>`Current browser does not appear to support localStorage`),this.LS=window.localStorage}async listModels(){let e={},t=Ds+Es,n=Es+Os;for(let r=0;r<this.LS.length;++r){let i=this.LS.key(r);if(i.startsWith(t)&&i.endsWith(n)){let t=Cs(i);e[t]=JSON.parse(this.LS.getItem(i))}}return e}async removeModel(e){e=ws(e);let t=xs(e);if(this.LS.getItem(t.info)==null)throw Error(`Cannot find model at path '${e}'`);let n=JSON.parse(this.LS.getItem(t.info));return Ss(t),n}}}));function Ls(e){if(e.indexOf(Us)===-1)throw Error(`The url string provided does not contain a scheme. Supported schemes are: ${Ws.getSchemes().join(`,`)}`);return{scheme:e.split(Us)[0],path:e.split(Us)[1]}}async function Rs(e,t,n=!1){E(e!==t,()=>`Old path and new path are the same: '${e}'`);let r=rs.getLoadHandlers(e);E(r.length>0,()=>`Copying failed because no load handler is found for source URL ${e}.`),E(r.length<2,()=>`Copying failed because more than one (${r.length}) load handlers for source URL ${e}.`);let i=r[0],a=rs.getSaveHandlers(t);E(a.length>0,()=>`Copying failed because no save handler is found for destination URL ${t}.`),E(a.length<2,()=>`Copying failed because more than one (${r.length}) save handlers for destination URL ${t}.`);let o=a[0],s=Ls(e).scheme,c=Ls(e).path,l=s===Ls(e).scheme,u=await i.load();n&&l&&await Ws.getManager(s).removeModel(c);let d=await o.save(u);return n&&!l&&await Ws.getManager(s).removeModel(c),d.modelArtifactsInfo}async function zs(){let e=Ws.getSchemes(),t={};for(let n of e){let e=await Ws.getManager(n).listModels();for(let r in e){let i=n+Us+r;t[i]=e[r]}}return t}async function Bs(e){let t=Ls(e);return Ws.getManager(t.scheme).removeModel(t.path)}async function Vs(e,t){return Rs(e,t,!1)}async function Hs(e,t){return Rs(e,t,!0)}var Us,Ws,Gs=o((()=>{P(),cs(),Us=`://`,Ws=class e{constructor(){this.managers={}}static getInstance(){return e.instance??=new e,e.instance}static registerManager(t,n){E(t!=null,()=>`scheme must not be undefined or null.`),t.endsWith(Us)&&(t=t.slice(0,t.indexOf(Us))),E(t.length>0,()=>`scheme must not be an empty string.`);let r=e.getInstance();E(r.managers[t]==null,()=>`A model store manager is already registered for scheme '${t}'.`),r.managers[t]=n}static getManager(t){let n=e.getInstance().managers[t];if(n==null)throw Error(`Cannot find model manager for scheme '${t}'`);return n}static getSchemes(){return Object.keys(e.getInstance().managers)}}})),Ks,qs=o((()=>{if(Ga(),He(),bs(),Is(),Gs(),li(),Ks=class{constructor(){this.messageName=`setTimeoutCustom`,this.functionRefs=[],this.handledMessageCount=0,this.hasEventListener=!1}fetch(e,t){return fetch(e,t)}now(){return performance.now()}encode(e,t){if(t!==`utf-8`&&t!==`utf8`)throw Error(`Browser's encoder only supports utf-8, but got ${t}`);return this.textEncoder??=new TextEncoder,this.textEncoder.encode(e)}decode(e,t){return new TextDecoder(t).decode(e)}setTimeoutCustom(e,t){if(typeof window>`u`||!M().getBool(`USE_SETTIMEOUTCUSTOM`)){setTimeout(e,t);return}this.functionRefs.push(e),setTimeout(()=>{window.postMessage({name:this.messageName,index:this.functionRefs.length-1},`*`)},t),this.hasEventListener||(this.hasEventListener=!0,window.addEventListener(`message`,e=>{if(e.source===window&&e.data.name===this.messageName){e.stopPropagation();let t=this.functionRefs[e.data.index];t(),this.handledMessageCount++,this.handledMessageCount===this.functionRefs.length&&(this.functionRefs=[],this.handledMessageCount=0)}},!0))}isTypedArray(e){return ci(e)}},M().get(`IS_BROWSER`)){M().setPlatform(`browser`,new Ks);try{Ws.registerManager(Ns.URL_SCHEME,new Fs)}catch{}try{Ws.registerManager(_s.URL_SCHEME,new ys)}catch{}}})),Js=s(((e,t)=>{t.exports={}})),Ys,Xs,Zs,Qs=o((()=>{He(),Ys={importFetch:()=>Js()},Zs=class{constructor(){this.util=Js(),this.textEncoder=new this.util.TextEncoder}fetch(e,t){return M().global.fetch==null?(Xs??=Ys.importFetch(),Xs(e,t)):M().global.fetch(e,t)}now(){let e=process.hrtime();return e[0]*1e3+e[1]/1e6}encode(e,t){if(t!==`utf-8`&&t!==`utf8`)throw Error(`Node built-in encoder only supports utf-8, but got ${t}`);return this.textEncoder.encode(e)}decode(e,t){return e.length===0?``:new this.util.TextDecoder(t).decode(e)}isTypedArray(e){return this.util.types.isFloat32Array(e)||this.util.types.isInt32Array(e)||this.util.types.isUint8Array(e)||this.util.types.isUint8ClampedArray(e)}},M().get(`IS_NODE`)&&!M().get(`IS_BROWSER`)&&M().setPlatform(`node`,new Zs)}));function V(e,t=`float32`,n){return t||=`float32`,Ae(e),new oa(e,t,n)}var $s=o((()=>{da(),P()}));function ec(e,t){let n=L(e,`x`,`cast`);if(!me(t))throw Error(`Failed to cast to unknown dtype ${t}`);if(t===`string`&&n.dtype!==`string`||t!==`string`&&n.dtype===`string`)throw Error(`Only strings can be casted to strings`);let r={x:n},i={dtype:t};return F.runKernel(mt,r,i)}var tc,nc=o((()=>{I(),N(),R(),P(),B(),tc=z({cast_:ec})}));function rc(e){let t={x:L(e,`x`,`clone`,`string_or_numeric`)};return F.runKernel(tn,t)}var ic,ac=o((()=>{I(),N(),R(),B(),ic=z({clone_:rc})}));function oc(e,t=!1){console.log(e.toString(t))}var sc=o((()=>{})),cc=o((()=>{I(),Ga(),qs(),Qs(),$s(),nc(),ac(),sc(),da(),Na(),ia({buffer:V,cast:tc,clone:ic,print:oc})}));function lc(e,t){let n=L(e,`a`,`add`),r=L(t,`b`,`add`);[n,r]=wa(n,r);let i={a:n,b:r};return F.runKernel(`Add`,i)}var H,uc=o((()=>{I(),N(),Aa(),R(),B(),H=z({add_:lc})}));function dc(e,t){let n=L(e,`a`,`floorDiv`),r=L(t,`b`,`floorDiv`);[n,r]=wa(n,r);let i={a:n,b:r};return F.runKernel(Yt,i)}var fc,pc=o((()=>{I(),N(),Aa(),R(),B(),fc=z({floorDiv_:dc})}));function mc(e,t){let n=L(e,`a`,`div`),r=L(t,`b`,`div`);if([n,r]=wa(n,r),n.dtype===`int32`&&r.dtype===`int32`)return fc(n,r);let i={a:n,b:r};return F.runKernel(Bt,i,{})}var hc,gc=o((()=>{I(),N(),Aa(),R(),pc(),B(),hc=z({div_:mc})}));function _c(e,t){let n=L(e,`a`,`mul`),r=L(t,`b`,`mul`);[n,r]=wa(n,r);let i={a:n,b:r};return F.runKernel(jn,i)}var U,vc=o((()=>{I(),N(),Aa(),R(),B(),U=z({mul_:_c})}));function yc(e){let t=L(e,`x`,`abs`);if(t.dtype===`complex64`){let e={x:t};return F.runKernel(vt,e)}else{let e={x:t};return F.runKernel(`Abs`,e)}}var bc,xc=o((()=>{I(),N(),R(),B(),bc=z({abs_:yc})}));function Sc(e){let t={x:L(e,`x`,`acos`)};return F.runKernel(Je,t)}var Cc,wc=o((()=>{I(),N(),R(),B(),Cc=z({acos_:Sc})}));function Tc(e){let t={x:L(e,`x`,`acosh`)};return F.runKernel(Ye,t)}var Ec,Dc=o((()=>{I(),N(),R(),B(),Ec=z({acosh_:Tc})}));function Oc(e){E(Array.isArray(e),()=>`The argument passed to tf.addN() must be a list of tensors`),E(e.length>=1,()=>`Must pass at least one tensor to tf.addN(), but got ${e.length}`);let t=e.map((e,t)=>L(e,`tensors${t}`,`addN`)),n=t[0];t.forEach(e=>{if(e.dtype!==n.dtype)throw Error(`All tensors passed to tf.addN() must have the same dtype`)}),t.forEach(e=>{if(!k(e.shape,n.shape))throw Error(`All tensors passed to tf.addN() must have the same shape`)});let r=t;return F.runKernel(Xe,r)}var kc,Ac=o((()=>{I(),N(),R(),P(),B(),kc=z({addN_:Oc})}));function jc(e,t=null,n=!1){let r={x:L(e,`x`,`all`,`bool`)},i={axis:t,keepDims:n};return F.runKernel(`All`,r,i)}var Mc,Nc=o((()=>{I(),N(),R(),B(),Mc=z({all_:jc})}));function Pc(e,t=null,n=!1){let r={x:L(e,`x`,`any`,`bool`)},i={axis:t,keepDims:n};return F.runKernel(`Any`,r,i)}var Fc,Ic=o((()=>{I(),N(),R(),B(),Fc=z({any_:Pc})}));function Lc(e,t=0){let n={x:L(e,`x`,`argMax`)},r={axis:t};return F.runKernel(Ze,n,r)}var Rc,zc=o((()=>{I(),N(),R(),B(),Rc=z({argMax_:Lc})}));function Bc(e,t=0){let n={x:L(e,`x`,`argMin`)},r={axis:t};return F.runKernel(Qe,n,r)}var Vc,Hc=o((()=>{I(),N(),R(),B(),Vc=z({argMin_:Bc})}));function Uc(e){let t={x:L(e,`x`,`asin`)};return F.runKernel($e,t)}var Wc,Gc=o((()=>{I(),N(),R(),B(),Wc=z({asin_:Uc})}));function Kc(e){let t={x:L(e,`x`,`asinh`)};return F.runKernel(et,t)}var qc,Jc=o((()=>{I(),N(),R(),B(),qc=z({asinh_:Kc})}));function Yc(e){let t={x:L(e,`x`,`atan`)};return F.runKernel(tt,t)}var Xc,Zc=o((()=>{I(),N(),R(),B(),Xc=z({atan_:Yc})}));function Qc(e,t){let n=L(e,`a`,`atan2`),r=L(t,`b`,`atan2`);[n,r]=wa(n,r);let i={a:n,b:r};return F.runKernel(rt,i)}var $c,el=o((()=>{I(),N(),Aa(),R(),B(),$c=z({atan2_:Qc})}));function tl(e){let t={x:L(e,`x`,`atanh`)};return F.runKernel(nt,t)}var nl,rl=o((()=>{I(),N(),R(),B(),nl=z({atanh_:tl})}));function il(e,t,n,r,i=`NHWC`,a){let o=e[3];return sl(e,[...t,o],n,a,r,null,null,xl(i))}function al(e,t,n,r,i,a,o=`channelsLast`){let[s,c]=fl(t),l;if(o===`channelsLast`)l=[s,c,e[3],e[3]];else if(o===`channelsFirst`)l=[s,c,e[1],e[1]];else throw Error(`Unknown dataFormat ${o}`);return sl(e,l,n,r,i,a,!1,o)}function ol(e,t,n,r,i,a,o=`NDHWC`){let[s,c,l]=pl(t),u,d;if(o===`NDHWC`)d=`channelsLast`,u=[s,c,l,e[4],e[4]];else if(o===`NCDHW`)d=`channelsFirst`,u=[s,c,l,e[1],e[1]];else throw Error(`Unknown dataFormat ${o}`);return cl(e,u,n,r,i,!1,d,a)}function sl(e,t,n,r,i,a,o=!1,s=`channelsLast`){let[c,l,u,d]=[-1,-1,-1,-1];if(s===`channelsLast`)[c,l,u,d]=e;else if(s===`channelsFirst`)[c,d,l,u]=e;else throw Error(`Unknown dataFormat ${s}`);let[f,p,,m]=t,[h,g]=fl(n),[_,v]=fl(r),y=ml(f,_),b=ml(p,v),{padInfo:x,outHeight:S,outWidth:C}=hl(i,l,u,h,g,y,b,a,s),w=o?m*d:m,T;return s===`channelsFirst`?T=[c,w,S,C]:s===`channelsLast`&&(T=[c,S,C,w]),{batchSize:c,dataFormat:s,inHeight:l,inWidth:u,inChannels:d,outHeight:S,outWidth:C,outChannels:w,padInfo:x,strideHeight:h,strideWidth:g,filterHeight:f,filterWidth:p,effectiveFilterHeight:y,effectiveFilterWidth:b,dilationHeight:_,dilationWidth:v,inShape:e,outShape:T,filterShape:t}}function cl(e,t,n,r,i,a=!1,o=`channelsLast`,s){let[c,l,u,d,f]=[-1,-1,-1,-1,-1];if(o===`channelsLast`)[c,l,u,d,f]=e;else if(o===`channelsFirst`)[c,f,l,u,d]=e;else throw Error(`Unknown dataFormat ${o}`);let[p,m,h,,g]=t,[_,v,y]=pl(n),[b,x,S]=pl(r),C=ml(p,b),w=ml(m,x),T=ml(h,S),{padInfo:E,outDepth:D,outHeight:ee,outWidth:O}=gl(i,l,u,d,_,v,y,C,w,T,s),te=a?g*f:g,ne;return o===`channelsFirst`?ne=[c,te,D,ee,O]:o===`channelsLast`&&(ne=[c,D,ee,O,te]),{batchSize:c,dataFormat:o,inDepth:l,inHeight:u,inWidth:d,inChannels:f,outDepth:D,outHeight:ee,outWidth:O,outChannels:te,padInfo:E,strideDepth:_,strideHeight:v,strideWidth:y,filterDepth:p,filterHeight:m,filterWidth:h,effectiveFilterDepth:C,effectiveFilterHeight:w,effectiveFilterWidth:T,dilationDepth:b,dilationHeight:x,dilationWidth:S,inShape:e,outShape:ne,filterShape:t}}function ll(e,t,n,r,i){r??=dl(e,t,n);let a=e[0],o=e[1];return[_l((a-t+2*r)/n+1,i),_l((o-t+2*r)/n+1,i)]}function ul(e,t,n,r,i,a){i??=dl(e,t[0],r[0]);let o=[0,0,0,n];for(let n=0;n<3;n++)e[n]+2*i>=t[n]&&(o[n]=_l((e[n]-t[n]+2*i)/r[n]+1,a));return o}function dl(e,t,n,r=1){let i=ml(t,r);return Math.floor((e[0]*(n-1)-n+i)/2)}function fl(e){return typeof e==`number`?[e,e,e]:e.length===2?[e[0],e[1],1]:e}function pl(e){return typeof e==`number`?[e,e,e]:e}function ml(e,t){return t<=1?e:e+(e-1)*(t-1)}function hl(e,t,n,r,i,a,o,s,c){let l,u,d;if(typeof e==`number`){l={top:e,bottom:e,left:e,right:e,type:e===0?`VALID`:`NUMBER`};let i=ll([t,n],a,r,e,s);u=i[0],d=i[1]}else if(e===`same`){u=Math.ceil(t/r),d=Math.ceil(n/i);let e=Math.max(0,(u-1)*r+a-t),s=Math.max(0,(d-1)*i+o-n),c=Math.floor(e/2),f=e-c,p=Math.floor(s/2);l={top:c,bottom:f,left:p,right:s-p,type:`SAME`}}else if(e===`valid`)l={top:0,bottom:0,left:0,right:0,type:`VALID`},u=Math.ceil((t-a+1)/r),d=Math.ceil((n-o+1)/i);else if(typeof e==`object`){let f=c===`channelsLast`?e[1][0]:e[2][0],p=c===`channelsLast`?e[1][1]:e[2][1],m=c===`channelsLast`?e[2][0]:e[3][0],h=c===`channelsLast`?e[2][1]:e[3][1];l={top:f,bottom:p,left:m,right:h,type:f===0&&p===0&&m===0&&h===0?`VALID`:`EXPLICIT`},u=_l((t-a+f+p)/r+1,s),d=_l((n-o+m+h)/i+1,s)}else throw Error(`Unknown padding parameter: ${e}`);return{padInfo:l,outHeight:u,outWidth:d}}function gl(e,t,n,r,i,a,o,s,c,l,u){let d,f,p,m;if(e===`valid`&&(e=0),typeof e==`number`){d={top:e,bottom:e,left:e,right:e,front:e,back:e,type:e===0?`VALID`:`NUMBER`};let h=ul([t,n,r,1],[s,c,l],1,[i,a,o],e,u);f=h[0],p=h[1],m=h[2]}else if(e===`same`){f=Math.ceil(t/i),p=Math.ceil(n/a),m=Math.ceil(r/o);let e=(f-1)*i+s-t,u=(p-1)*a+c-n,h=(m-1)*o+l-r,g=Math.floor(e/2),_=e-g,v=Math.floor(u/2),y=u-v,b=Math.floor(h/2);d={top:v,bottom:y,left:b,right:h-b,front:g,back:_,type:`SAME`}}else throw Error(`Unknown padding parameter: ${e}`);return{padInfo:d,outDepth:f,outHeight:p,outWidth:m}}function _l(e,t){if(!t)return Math.trunc(e);switch(t){case`round`:return Math.round(e);case`ceil`:return Math.ceil(e);case`floor`:return Math.floor(e);default:throw Error(`Unknown roundingMode ${t}`)}}function vl(e){let[t,n,r]=fl(e);return t===1&&n===1&&r===1}function yl(e,t){return vl(e)||vl(t)}function bl(e){return fl(e).every(e=>e>0)}function xl(e){if(e===`NHWC`)return`channelsLast`;if(e===`NCHW`)return`channelsFirst`;throw Error(`Unknown dataFormat ${e}`)}function Sl(e,t,n){if(n!=null){if(typeof t==`string`)throw Error(`Error in ${e}: pad must be an integer when using dimRoundingMode ${n} but got pad ${t}.`);if(typeof t==`number`)E(re(t),()=>`Error in ${e}: pad must be an integer when using dimRoundingMode ${n} but got pad ${t}.`);else if(typeof t==`object`)t.forEach(t=>{t.forEach(t=>{E(re(t),()=>`Error in ${e}: pad must be an integer when using dimRoundingMode ${n} but got pad ${t}.`)})});else throw Error(`Error in ${e}: Unknown padding parameter: ${t}`)}}var Cl=o((()=>{P()}));function wl(e,t){let n={x:L(e,`x`,`reshape`,`string_or_numeric`)},r={shape:t};return F.runKernel(Xn,n,r)}var W,G=o((()=>{I(),N(),R(),B(),W=z({reshape_:wl})}));function Tl(e,t,n,r,i){let a=L(e,`x`,`avgPool`,`float32`);E(yl(n,1),()=>`Error in avgPool: Either strides or dilations must be 1. Got strides ${n} and dilations '1'`);let o=a,s=!1;a.rank===3&&(s=!0,o=W(a,[1,a.shape[0],a.shape[1],a.shape[2]])),E(o.rank===4,()=>`Error in avgPool: x must be rank 4 but got rank ${o.rank}.`),Sl(`avgPool`,r,i);let c={x:o},l={filterSize:t,strides:n,pad:r,dimRoundingMode:i},u=F.runKernel(it,c,l);return u=tc(u,a.dtype),s?W(u,[u.shape[1],u.shape[2],u.shape[3]]):u}var El,Dl=o((()=>{I(),N(),R(),P(),nc(),Cl(),B(),G(),El=z({avgPool_:Tl})}));function Ol(e,t,n,r,i,a=`NDHWC`){let o=L(e,`x`,`avgPool3d`,`float32`),s=o,c=!1;o.rank===4&&(c=!0,s=W(o,[1,o.shape[0],o.shape[1],o.shape[2],o.shape[3]])),E(s.rank===5,()=>`Error in avgPool3d: x must be rank 5 but got rank ${s.rank}.`),E(a===`NDHWC`,()=>`Error in avgPool3d: Only NDHWC is currently supported, but got dataFormat of ${a}`),E(typeof n==`number`&&n>0||Array.isArray(n)&&n[0]>0&&n[1]>0&&n[2]>0,()=>`Error in avgPool3d: Stride must be > 0, but got '${n}'`),Sl(`avgPool3d`,r,i);let l={x:s},u={filterSize:t,strides:n,pad:r,dimRoundingMode:i,dataFormat:a},d=F.runKernel(ot,l,u);return d=tc(d,s.dtype),c?W(d,[d.shape[1],d.shape[2],d.shape[3],d.shape[4]]):d}var kl,Al=o((()=>{I(),N(),R(),P(),nc(),Cl(),B(),G(),kl=z({avgPool3d_:Ol})}));function jl(e,t=0){E(e.length>=1,()=>`Pass at least one tensor to concat`);let n=Ya(e,`tensors`,`concat`,`string_or_numeric`);if(n[0].dtype===`complex64`&&n.forEach(e=>{if(e.dtype!==`complex64`)throw Error(`Cannot concatenate complex64 tensors with a tensor
          with dtype ${e.dtype}. `)}),n.length===1)return ic(n[0]);let r=n,i={axis:t};return F.runKernel(yt,r,i)}var Ml,Nl=o((()=>{I(),N(),R(),P(),ac(),B(),Ml=z({concat_:jl})}));function Pl(e,t,n=!1,r=!1){let i=L(e,`a`,`matMul`),a=L(t,`b`,`matMul`);[i,a]=wa(i,a);let o={a:i,b:a},s={transposeA:n,transposeB:r};return F.runKernel(ct,o,s)}var Fl,Il=o((()=>{I(),N(),Aa(),R(),B(),Fl=z({matMul_:Pl})}));function Ll(e){let t={x:L(e,`x`,`sigmoid`,`float32`)};return F.runKernel(pr,t)}var Rl,zl=o((()=>{I(),N(),R(),B(),Rl=z({sigmoid_:Ll})}));function Bl(e,t,n){let r=L(e,`x`,`slice`,`string_or_numeric`);if(r.rank===0)throw Error(`Slicing scalar is not possible`);let i={x:r},a={begin:t,size:n};return F.runKernel(ur,i,a)}var Vl,Hl=o((()=>{I(),N(),R(),B(),Vl=z({slice_:Bl})}));function Ul(e){let t={x:L(e,`x`,`tanh`,`float32`)};return F.runKernel(jr,t)}var Wl,Gl=o((()=>{I(),N(),R(),B(),Wl=z({tanh_:Ul})}));function Kl(e,t,n,r,i,a){let o=L(e,`forgetBias`,`basicLSTMCell`),s=L(t,`lstmKernel`,`basicLSTMCell`),c=L(n,`lstmBias`,`basicLSTMCell`),l=L(r,`data`,`basicLSTMCell`),u=L(i,`c`,`basicLSTMCell`),d=H(Fl(Ml([l,L(a,`h`,`basicLSTMCell`)],1),s),c),f=d.shape[0],p=d.shape[1]/4,m=[f,p],h=Vl(d,[0,0],m),g=Vl(d,[0,p],m),_=Vl(d,[0,p*2],m),v=Vl(d,[0,p*3],m),y=H(U(Rl(h),Wl(g)),U(u,Rl(H(o,_))));return[y,U(Wl(y),Rl(v))]}var ql,Jl=o((()=>{R(),uc(),Nl(),Il(),vc(),B(),zl(),Hl(),Gl(),ql=z({basicLSTMCell_:Kl})}));function Yl(e,t,n){let r=L(e,`x`,`batchToSpaceND`),i=t.reduce((e,t)=>e*t);E(r.rank>=1+t.length,()=>`input rank is ${r.rank} but should be > than blockShape.length ${t.length}`),E(n.length===t.length,()=>`crops.length is ${n.length} but should be equal to blockShape.length  ${t.length}`),E(r.shape[0]%i===0,()=>`input tensor batch is ${r.shape[0]} but is not divisible by the product of the elements of blockShape ${t.join(` * `)} === ${i}`);let a={x:r},o={blockShape:t,crops:n};return F.runKernel(lt,a,o)}var Xl,Zl=o((()=>{I(),N(),R(),P(),B(),Xl=z({batchToSpaceND_:Yl})}));function Ql(e){let t;return t=e.rank===0||e.rank===1?W(e,[1,1,1,e.size]):e.rank===2?W(e,[1,1,e.shape[0],e.shape[1]]):e.rank===3?W(e,[1,e.shape[0],e.shape[1],e.shape[2]]):e,t}var $l=o((()=>{G()}));function eu(e,t,n,r,i,a){a??=.001;let o=L(e,`x`,`batchNorm`),s=L(t,`mean`,`batchNorm`),c=L(n,`variance`,`batchNorm`),l;i!=null&&(l=L(i,`scale`,`batchNorm`));let u;r!=null&&(u=L(r,`offset`,`batchNorm`)),E(s.rank===c.rank,()=>`Batch normalization gradient requires mean and variance to have equal ranks.`),E(u==null||s.rank===u.rank,()=>`Batch normalization gradient requires mean and offset to have equal ranks.`),E(l==null||s.rank===l.rank,()=>`Batch normalization gradient requires mean and scale to have equal ranks.`);let d={x:Ql(o),scale:l,offset:u,mean:s,variance:c},f={varianceEpsilon:a};return W(F.runKernel(Xt,d,f),o.shape)}var tu,nu=o((()=>{I(),N(),R(),P(),$l(),B(),G(),tu=z({batchNorm_:eu})}));function ru(e,t,n,r,i,a){let o=L(e,`x`,`batchNorm`),s=L(t,`mean`,`batchNorm`),c=L(n,`variance`,`batchNorm`),l;i!=null&&(l=L(i,`scale`,`batchNorm`));let u;return r!=null&&(u=L(r,`offset`,`batchNorm`)),E(o.rank===2,()=>`Error in batchNorm2D: x must be rank 2 but got rank ${o.rank}.`),E(s.rank===2||s.rank===1,()=>`Error in batchNorm2D: mean must be rank 2 or rank 1 but got rank ${s.rank}.`),E(c.rank===2||c.rank===1,()=>`Error in batchNorm2D: variance must be rank 2 or rank 1 but got rank ${c.rank}.`),l!=null&&E(l.rank===2||l.rank===1,()=>`Error in batchNorm2D: scale must be rank 2 or rank 1 but got rank ${l.rank}.`),u!=null&&E(u.rank===2||u.rank===1,()=>`Error in batchNorm2D: offset must be rank 2 or rank 1 but got rank ${u.rank}.`),tu(o,s,c,u,l,a)}var iu,au=o((()=>{R(),P(),nu(),B(),iu=z({batchNorm2d_:ru})}));function ou(e,t,n,r,i,a){let o=L(e,`x`,`batchNorm`),s=L(t,`mean`,`batchNorm`),c=L(n,`variance`,`batchNorm`),l;i!=null&&(l=L(i,`scale`,`batchNorm`));let u;return r!=null&&(u=L(r,`offset`,`batchNorm`)),E(o.rank===3,()=>`Error in batchNorm3D: x must be rank 3 but got rank ${o.rank}.`),E(s.rank===3||s.rank===1,()=>`Error in batchNorm3D: mean must be rank 3 or rank 1 but got rank ${s.rank}.`),E(c.rank===3||c.rank===1,()=>`Error in batchNorm3D: variance must be rank 3 or rank 1 but got rank ${c.rank}.`),l!=null&&E(l.rank===3||l.rank===1,()=>`Error in batchNorm3D: scale must be rank 3 or rank 1 but got rank ${l.rank}.`),u!=null&&E(u.rank===3||u.rank===1,()=>`Error in batchNorm3D: offset must be rank 3 or rank 1 but got rank ${u.rank}.`),tu(o,s,c,u,l,a)}var su,cu=o((()=>{R(),P(),nu(),B(),su=z({batchNorm3d_:ou})}));function lu(e,t,n,r,i,a){let o=L(e,`x`,`batchNorm`),s=L(t,`mean`,`batchNorm`),c=L(n,`variance`,`batchNorm`),l;i!=null&&(l=L(i,`scale`,`batchNorm`));let u;return r!=null&&(u=L(r,`offset`,`batchNorm`)),E(o.rank===4,()=>`Error in batchNorm4D: x must be rank 4 but got rank ${o.rank}.`),E(s.rank===4||s.rank===1,()=>`Error in batchNorm4D: mean must be rank 4 or rank 1 but got rank ${s.rank}.`),E(c.rank===4||c.rank===1,()=>`Error in batchNorm4D: variance must be rank 4 or rank 1 but got rank ${c.rank}.`),l!=null&&E(l.rank===4||l.rank===1,()=>`Error in batchNorm4D: scale must be rank 4 or rank 1 but got rank ${l.rank}.`),u!=null&&E(u.rank===4||u.rank===1,()=>`Error in batchNorm4D: offset must be rank 4 or rank 1 but got rank ${u.rank}.`),tu(o,s,c,u,l,a)}var uu,du=o((()=>{R(),P(),nu(),B(),uu=z({batchNorm4d_:lu})}));function fu(e,t,n){let r=L(e,`x`,`bincount`),i=L(t,`weights`,`bincount`);E(r.dtype===`int32`,()=>`Error in bincount: input dtype must be int32, but got ${r.dtype}`),E(n>=0,()=>`size must be non-negative, but got ${n}.`),E(i.size===r.size||i.size===0,()=>`Error in bincount: weights must have the same size as input or0-length, but got input shape: ${r.shape}, weights shape: ${i.shape}.`);let a={x:r,weights:i},o={size:n};return F.runKernel(ut,a,o)}var pu,mu=o((()=>{I(),N(),R(),P(),B(),pu=z({bincount_:fu})}));function hu(e,t){let n=L(e,`x`,`bitwiseAnd`),r=L(t,`y`,`bitwiseAnd`);if(!k(n.shape,r.shape))throw Error(`BitwiseAnd: Tensors must have the same shape. x: ${n.shape}, y: ${r.shape}`);if(n.dtype!==`int32`||r.dtype!==`int32`)throw Error(`BitwiseAnd: Only supports 'int32' values in tensor, found type of x: ${n.dtype} and type of y: ${r.dtype}`);let i={a:n,b:r};return F.runKernel(dt,i)}var gu,_u=o((()=>{I(),N(),R(),Pe(),B(),gu=z({bitwiseAnd_:hu})}));function vu(e,t){let n=L(e,`s0`,`broadcastArgs`,`int32`),r=L(t,`s1`,`broadcastArgs`,`int32`);if(n.rank!==1)throw Error(`broadcastArgs(): first input must be a vector (rank=1). Has rank ${n.rank}`);if(r.rank!==1)throw Error(`broadcastArgs(): second input must be a vector (rank=1). Has rank ${r.rank}`);let i={s0:n,s1:r};return F.runKernel(pt,i)}var yu,bu=o((()=>{I(),N(),R(),B(),yu=z({broadcastArgs_:vu})}));function xu(e,t){let n=L(e,`broadcastTo`,`x`),r=n.shape;if(Ae(t),t.length<n.rank)throw Error(`broadcastTo(): shape.length=${t.length} < input.rank=${n.rank}.`);if(t.length>n.rank){let e=n.shape.slice();for(;e.length<t.length;)e.unshift(1);n=W(n,e)}let i=n.shape,a=Array.from(t);for(let e=t.length-1;e>=0;e--)if(i[e]===t[e])a[e]=1;else if(n.shape[e]!==1)throw Error(`broadcastTo(): [${r}] cannot be broadcast to [${t}].`);if(a.map((e,t)=>e>1?t:-1).filter(e=>e>=0).length===0)return ic(n);let o={x:n},s={reps:a};return F.runKernel(Mr,o,s)}var Su,Cu=o((()=>{I(),N(),R(),Pe(),ac(),B(),G(),Su=z({broadcastTo_:xu})}));function wu(e){let t={x:L(e,`x`,`ceil`,`float32`)};return F.runKernel(ht,t)}var Tu,Eu=o((()=>{I(),N(),R(),B(),Tu=z({ceil_:wu})}));function Du(e,t,n){Ae(e),n||=xe(t);let r={shape:e,value:t,dtype:n};return F.runKernel(Kt,{},r)}var Ou=o((()=>{I(),N(),P(),Pe()}));function ku(e,t,n){let r=L(e,`x`,`clipByValue`);if(E(t<=n,()=>`Error in clip: min (${t}) must be less than or equal to max (${n}).`),t===n)return Du(r.shape,t,r.dtype);let i={x:r},a={clipValueMin:t,clipValueMax:n};return F.runKernel(gt,i,a)}var Au,ju=o((()=>{I(),N(),R(),P(),Ou(),B(),Au=z({clipByValue_:ku})}));function Mu(e){return Ml(e,0)}var Nu,Pu=o((()=>{Nl(),B(),Nu=z({concat1d_:Mu})}));function Fu(e,t){return Ml(e,t)}var Iu,Lu=o((()=>{Nl(),B(),Iu=z({concat2d_:Fu})}));function Ru(e,t){return Ml(e,t)}var zu,Bu=o((()=>{Nl(),B(),zu=z({concat3d_:Ru})}));function Vu(e,t){return Ml(e,t)}var Hu,Uu=o((()=>{Nl(),B(),Hu=z({concat4d_:Vu})}));function Wu(e,t,n,r,i=`NHWC`,a=[1,1],o){let s=L(e,`x`,`conv2d`,`float32`),c=L(t,`filter`,`conv2d`,`float32`),l=s,u=!1;s.rank===3&&(u=!0,l=W(s,[1,s.shape[0],s.shape[1],s.shape[2]])),E(l.rank===4,()=>`Error in conv2d: input must be rank 4, but got rank ${l.rank}.`),E(c.rank===4,()=>`Error in conv2d: filter must be rank 4, but got rank ${c.rank}.`),Sl(`conv2d`,r,o);let d=i===`NHWC`?l.shape[3]:l.shape[1];E(d===c.shape[2],()=>`Error in conv2d: depth of input (${d}) must match input depth for filter ${c.shape[2]}.`),E(yl(n,a),()=>`Error in conv2D: Either strides or dilations must be 1. Got strides ${n} and dilations '${a}'`),E(bl(a),()=>`Error in conv2D: Dilated rates should be larger than 0.`),E(bl(n),()=>`Error in conv2D: Strides should be larger than 0.`);let f={x:l,filter:c},p={strides:n,pad:r,dataFormat:i,dilations:a,dimRoundingMode:o},m=F.runKernel(bt,f,p);return u?W(m,[m.shape[1],m.shape[2],m.shape[3]]):m}var Gu,Ku=o((()=>{I(),N(),R(),P(),Cl(),B(),G(),Gu=z({conv2d_:Wu})}));function qu(e,t,n,r,i=`NWC`,a=1,o){let s=L(e,`x`,`conv1d`),c=L(t,`filter`,`conv1d`),l=s,u=!1;s.rank===2&&(u=!0,l=W(s,[1,s.shape[0],s.shape[1]])),E(l.rank===3,()=>`Error in conv1d: input must be rank 3, but got rank ${l.rank}.`),E(c.rank===3,()=>`Error in conv1d: filter must be rank 3, but got rank ${c.rank}.`),Sl(`conv1d`,r,o),E(l.shape[2]===c.shape[1],()=>`Error in conv1d: depth of input (${l.shape[2]}) must match input depth for filter ${c.shape[1]}.`),E(yl(n,a),()=>`Error in conv1D: Either stride or dilation must be 1. Got stride ${n} and dilation '${a}'`),E(bl(a),()=>`Error in conv1D: Dilated rates should be larger than 0.`),E(bl(n),()=>`Error in conv1D: Stride should be larger than 0.`),E(i===`NWC`,()=>`Error in conv1d: got dataFormat of ${i} but only NWC is currently supported.`);let d=W(c,[1,c.shape[0],c.shape[1],c.shape[2]]),f=Gu(W(l,[l.shape[0],1,l.shape[1],l.shape[2]]),d,[1,n],r,`NHWC`,[1,a],o);return u?W(f,[f.shape[2],f.shape[3]]):W(f,[f.shape[0],f.shape[2],f.shape[3]])}var Ju,Yu=o((()=>{R(),P(),Ku(),Cl(),B(),G(),Ju=z({conv1d_:qu})}));function Xu(e,t,n,r,i,a=`NHWC`,o){E(e.length===t.rank,()=>`Length of inShape (${e.length}) and rank of dy (${t.rank}) must match`);let s=e,c=t,l=!1;t.rank===3&&(l=!0,c=W(t,[1,t.shape[0],t.shape[1],t.shape[2]]),s=[1,e[0],e[1],e[2]]),E(s.length===4,()=>`Error in conv2dDerInput: inShape must be length 4, but got length ${s.length}.`),E(c.rank===4,()=>`Error in conv2dDerInput: dy must be rank 4, but got rank ${c.rank}`),E(n.rank===4,()=>`Error in conv2dDerInput: filter must be rank 4, but got rank ${n.rank}`);let u=a===`NHWC`?s[3]:s[1],d=a===`NHWC`?c.shape[3]:c.shape[1];E(u===n.shape[2],()=>`Error in conv2dDerInput: depth of input (${u}) must match input depth for filter ${n.shape[2]}.`),E(d===n.shape[3],()=>`Error in conv2dDerInput: depth of output (${d}) must match output depth for filter ${n.shape[3]}.`),Sl(`conv2dDerInput`,i,o);let f={dy:c,filter:n},p={strides:r,pad:i,dataFormat:a,dimRoundingMode:o,inputShape:s},m=F.runKernel(St,f,p);return l?W(m,[m.shape[1],m.shape[2],m.shape[3]]):m}var Zu,Qu=o((()=>{I(),N(),P(),Cl(),B(),G(),Zu=z({conv2DBackpropInput_:Xu})}));function $u(e,t,n,r,i,a){return Zu(n,L(e,`x`,`conv2dTranspose`),L(t,`filter`,`conv2dTranspose`),r,i,`NHWC`,a)}var ed,td=o((()=>{R(),Qu(),B(),ed=z({conv2dTranspose_:$u})}));function nd(e,t,n,r,i=`NDHWC`,a=[1,1,1]){let o=L(e,`x`,`conv3d`),s=L(t,`filter`,`conv3d`),c=o,l=!1;o.rank===4&&(l=!0,c=W(o,[1,o.shape[0],o.shape[1],o.shape[2],o.shape[3]])),E(c.rank===5,()=>`Error in conv3d: input must be rank 5, but got rank ${c.rank}.`),E(s.rank===5,()=>`Error in conv3d: filter must be rank 5, but got rank ${s.rank}.`),E(c.shape[4]===s.shape[3],()=>`Error in conv3d: depth of input (${c.shape[4]}) must match input depth for filter ${s.shape[3]}.`),E(yl(n,a),()=>`Error in conv3D: Either strides or dilations must be 1. Got strides ${n} and dilations '${a}'`),E(i===`NDHWC`,()=>`Error in conv3d: got dataFormat of ${i} but only NDHWC is currently supported.`),E(bl(a),()=>`Error in conv3D: Dilated rates should be larger than 0.`),E(bl(n),()=>`Error in conv3D: Strides should be larger than 0.`);let u={x:c,filter:s},d={strides:n,pad:r,dataFormat:i,dilations:a},f=F.runKernel(Ct,u,d);return l?W(f,[f.shape[1],f.shape[2],f.shape[3],f.shape[4]]):f}var rd,id=o((()=>{I(),N(),R(),P(),Cl(),B(),G(),rd=z({conv3d_:nd})}));function ad(e,t,n,r,i){E(e.length===t.rank,()=>`Length of inShape (${e.length}) and rank of dy (${t.rank}) must match`);let a=e,o=t,s=!1;t.rank===4&&(s=!0,o=W(t,[1,t.shape[0],t.shape[1],t.shape[2],t.shape[3]]),a=[1,e[0],e[1],e[2],e[3]]);let c=a[4],l=o.shape[4];E(a.length===5,()=>`Error in conv3dDerInput: inShape must be length 5, but got length ${a.length}.`),E(o.rank===5,()=>`Error in conv3dDerInput: dy must be rank 5, but got rank ${o.rank}`),E(n.rank===5,()=>`Error in conv3dDerInput: filter must be rank 5, but got rank ${n.rank}`),E(c===n.shape[3],()=>`Error in conv3dDerInput: depth of input (${c}) must match input depth for filter ${n.shape[3]}.`),E(l===n.shape[4],()=>`Error in conv3dDerInput: depth of output (${l}) must match output depth for filter ${n.shape[4]}.`);let u={dy:o,filter:n},d={pad:i,strides:r,inputShape:a},f=F.runKernel(Tt,u,d);return s?W(f,[f.shape[1],f.shape[2],f.shape[3],f.shape[4]]):f}var od,sd=o((()=>{I(),N(),P(),B(),G(),od=z({conv3DBackpropInput_:ad})}));function cd(e,t,n,r,i){return od(n,L(e,`x`,`conv3dTranspose`),L(t,`filter`,`conv3dTranspose`),r,i)}var ld,ud=o((()=>{R(),sd(),B(),ld=z({conv3dTranspose_:cd})}));function dd(e){let t={x:L(e,`x`,`cos`,`float32`)};return F.runKernel(`Cos`,t)}var fd,pd=o((()=>{I(),N(),R(),B(),fd=z({cos_:dd})}));function md(e){let t={x:L(e,`x`,`cosh`,`float32`)};return F.runKernel(Et,t)}var hd,gd=o((()=>{I(),N(),R(),B(),hd=z({cosh_:md})}));function _d(e,t=0,n=!1,r=!1){let i={x:L(e,`x`,`cumprod`)},a={axis:t,exclusive:n,reverse:r};return F.runKernel(Dt,i,a)}var vd,yd=o((()=>{I(),N(),R(),B(),vd=z({cumprod_:_d})}));function bd(e,t=0,n=!1,r=!1){let i={x:L(e,`x`,`cumsum`)},a={axis:t,exclusive:n,reverse:r};return F.runKernel(Ot,i,a)}var xd,Sd=o((()=>{I(),N(),R(),B(),xd=z({cumsum_:bd})}));function Cd(e,t,n,r=!1){let i=L(e,`x`,`denseBincount`),a=L(t,`weights`,`denseBincount`);E(i.dtype===`int32`,()=>`Error in denseBincount: input dtype must be int32, but got ${i.dtype}`),E(i.rank<=2,()=>`Error in denseBincount: input must be at most rank 2, but got rank ${i.rank}.`),E(n>=0,()=>`size must be non-negative, but got ${n}.`),E(a.size===i.size||a.size===0,()=>`Error in denseBincount: weights must have the same shape as x or 0-length, but got x shape: ${i.shape}, weights shape: ${a.shape}.`);let o={x:i,weights:a},s={size:n,binaryOutput:r};return F.runKernel(At,o,s)}var wd,Td=o((()=>{I(),N(),R(),P(),B(),wd=z({denseBincount_:Cd})}));function Ed(e,t,n=`NHWC`){let r=L(e,`x`,`depthToSpace`,`float32`),i=n===`NHWC`?r.shape[1]:r.shape[2],a=n===`NHWC`?r.shape[2]:r.shape[3],o=n===`NHWC`?r.shape[3]:r.shape[1];E(t>1,()=>`blockSize should be > 1 for depthToSpace, but was: ${t}`),E(i*t>=0,()=>`Negative dimension size caused by overflow when multiplying
    ${i} and ${t}  for depthToSpace with input shape
    ${r.shape}`),E(a*t>=0,()=>`Negative dimension size caused by overflow when multiplying
    ${a} and ${t} for depthToSpace with input shape
        ${r.shape}`),E(o%(t*t)===0,()=>`Dimension size must be evenly divisible by ${t*t} but is ${o} for depthToSpace with input shape ${r.shape}`);let s={x:r},c={blockSize:t,dataFormat:n};return F.runKernel(jt,s,c)}var Dd,Od=o((()=>{I(),N(),R(),P(),B(),Dd=z({depthToSpace_:Ed})}));function kd(e,t,n,r,i=`NHWC`,a=[1,1],o){let s=L(e,`x`,`depthwiseConv2d`,`float32`),c=L(t,`filter`,`depthwiseConv2d`,`float32`),l=s,u=!1;s.rank===3&&(u=!0,l=W(s,[1,s.shape[0],s.shape[1],s.shape[2]])),E(l.rank===4,()=>`Error in depthwiseConv2d: input must be rank 4, but got rank ${l.rank}.`),E(c.rank===4,()=>`Error in depthwiseConv2d: filter must be rank 4, but got rank ${c.rank}.`);let d=i===`NHWC`?l.shape[3]:l.shape[1];E(d===c.shape[2],()=>`Error in depthwiseConv2d: number of input channels (${d}) must match the inChannels dimension in filter ${c.shape[2]}.`),Sl(`depthwiseConv2d`,r,o);let f={x:l,filter:c},p={strides:n,pad:r,dataFormat:i,dilations:a,dimRoundingMode:o},m=F.runKernel(Mt,f,p);return u?W(m,[m.shape[1],m.shape[2],m.shape[3]]):m}var Ad,jd=o((()=>{I(),N(),R(),P(),Cl(),B(),G(),Ad=z({depthwiseConv2d_:kd})}));function Md(e){let t={x:L(e,`x`,`diag`)};return F.runKernel(Ft,t)}var Nd,Pd=o((()=>{I(),N(),R(),B(),Nd=z({diag_:Md})}));function Fd(e,t,n,r,i=[1,1],a=`NHWC`){let o=L(e,`x`,`dilation2d`),s=L(t,`filter`,`dilation2d`);E(o.rank===3||o.rank===4,()=>`Error in dilation2d: input must be rank 3 or 4, but got rank ${o.rank}.`),E(s.rank===3,()=>`Error in dilation2d: filter must be rank 3, but got rank ${s.rank}.`),E(a===`NHWC`,()=>`Error in dilation2d: Only NHWC is currently supported, but got dataFormat of ${a}`);let c=o,l=!1;o.rank===3&&(c=W(o,[1,o.shape[0],o.shape[1],o.shape[2]]),l=!0),E(c.shape[3]===s.shape[2],()=>`Error in dilation2d:  input and filter must have the same depth: ${c.shape[3]} vs ${s.shape[2]}`);let u={x:c,filter:s},d={strides:n,pad:r,dilations:i},f=F.runKernel(It,u,d);return l?W(f,[f.shape[1],f.shape[2],f.shape[3]]):f}var Id,Ld=o((()=>{I(),N(),R(),P(),B(),G(),Id=z({dilation2d_:Fd})})),Rd=c({assertAndGetBroadcastShape:()=>K,getBroadcastDims:()=>zd,getReductionAxes:()=>Bd});function zd(e,t){let n=e.length,r=[];for(let i=0;i<n;i++){let a=n-1-i,o=e[a]||1;(t[t.length-1-i]||1)>1&&o===1&&r.unshift(a)}return r}function Bd(e,t){let n=[];for(let r=0;r<t.length;r++){let i=e[e.length-r-1],a=t.length-r-1,o=t[a];(i==null||i===1&&o>1)&&n.unshift(a)}return n}function K(e,t){let n=Math.max(e.length,t.length),r=Array(n);for(let i=0;i<n;i++){let a=e[e.length-i-1];a??=1;let o=t[t.length-i-1];if(o??=1,a===1)r[n-i-1]=o;else if(o===1)r[n-i-1]=a;else if(a!==o){let n=`Operands could not be broadcast together with shapes ${e} and ${t}.`;throw Error(n)}else r[n-i-1]=a}return r}var Vd=o((()=>{}));function Hd(e,t){let n=L(e,`a`,`equal`,`string_or_numeric`),r=L(t,`b`,`equal`,`string_or_numeric`);[n,r]=wa(n,r),K(n.shape,r.shape);let i={a:n,b:r};return F.runKernel(Ut,i)}var Ud,Wd=o((()=>{I(),N(),Aa(),R(),Vd(),B(),Ud=z({equal_:Hd})}));function Gd(e,t,n){let r=L(t,`a`,`where`),i=L(n,`b`,`where`),a=L(e,`condition`,`where`,`bool`),o=K(K(a.shape,r.shape),i.shape),s={condition:Su(a,o),t:Su(r,o),e:Su(i,o)};return F.runKernel(cr,s)}var Kd,qd=o((()=>{I(),N(),R(),Cu(),Vd(),B(),Kd=z({where_:Gd})}));function Jd(e){let t={x:L(e,`x`,`zerosLike`)};return F.runKernel(Br,t)}var Yd,Xd=o((()=>{I(),N(),R(),B(),Yd=z({zerosLike_:Jd})}));function Zd(e,t){let n=L(e,`a`,`div`),r=L(t,`b`,`div`);[n,r]=wa(n,r);let i=hc(n,r),a=Yd(i);return Kd(Ud(r,a),a,i)}var Qd,$d=o((()=>{Aa(),R(),gc(),Wd(),B(),qd(),Xd(),Qd=z({divNoNan_:Zd})}));function ef(e,t){let n=L(e,`t1`,`dot`),r=L(t,`t2`,`dot`);E((n.rank===1||n.rank===2)&&(r.rank===1||r.rank===2),()=>`Error in dot: inputs must all be rank 1 or 2, but got ranks ${n.rank} and ${r.rank}.`);let i=n.rank===1?n.size:n.shape[1],a=r.rank===1?r.size:r.shape[0];if(E(i===a,()=>`Error in dot: inner dimensions of inputs must match, but got ${i} and ${a}.`),n.rank===1&&r.rank===1)return W(Fl(W(n,[1,-1]),W(r,[-1,1])),[]);if(n.rank===1&&r.rank===2){let e=Fl(W(n,[1,-1]),W(r,[r.shape[0],r.shape[1]]));return W(e,[e.size])}else if(n.rank===2&&r.rank===1){let e=Fl(n,W(r,[-1,1]));return W(e,[e.size])}else return Fl(n,W(r,[r.shape[0],r.shape[1]]))}var tf,nf=o((()=>{R(),P(),Il(),B(),G(),tf=z({dot_:ef})}));function rf(e,...t){let n=t.map((e,t)=>L(e,`tensors${t}`,`einsum`)),r={equation:e};return F.runKernel(Vt,n,r)}var af,of=o((()=>{I(),N(),R(),B(),af=z({einsum_:rf})}));function sf(e){let t={x:L(e,`x`,`elu`,`float32`)};return F.runKernel(`Elu`,t)}var cf,lf=o((()=>{I(),N(),R(),B(),cf=z({elu_:sf})}));function uf(e,t){let n=L(e,`x`,`ensureShape`,`string_or_numeric`);if(!ne(n.shape,t))throw Error(`EnsureShape: Shape of tensor ${n.shape} is not compatible with expected shape ${t}`);return e}var df,ff=o((()=>{R(),Pe(),B(),df=z({ensureShape_:uf})}));function pf(e){let t=L(e,`x`,`erf`);E(t.dtype===`int32`||t.dtype===`float32`,()=>"Input dtype must be `int32` or `float32`."),t.dtype===`int32`&&(t=tc(t,`float32`));let n={x:t};return F.runKernel(`Erf`,n)}var mf,hf=o((()=>{I(),N(),R(),P(),nc(),B(),mf=z({erf_:pf})}));function gf(e,t){for(let n=0;n<e.length;++n)if(e[e.length-n-1]!==t-1-n)return!1;return!0}function _f(e,t,n){let r=e.length+t.length,i=[],a=0,o=0;for(let s=0;s<r;s++)n.indexOf(s)===-1?i.push(e[a++]):i.push(t[o++]);return i}function vf(e,t){let n=[],r=e.length;for(let i=0;i<r;i++)t.indexOf(i)===-1&&n.push(e[i]);return[n,t.map(t=>e[t])]}function yf(e,t){return _f(e,t.map(e=>1),t)}function bf(e,t,n){E(gf(t,n),()=>`${e} supports only inner-most axes for now. Got axes ${t} and rank-${n} input.`)}function xf(e,t){if(gf(e,t))return null;let n=[];for(let r=0;r<t;++r)e.indexOf(r)===-1&&n.push(r);return e.forEach(e=>n.push(e)),n}function Sf(e){return e.map((e,t)=>[t,e]).sort((e,t)=>e[1]-t[1]).map(e=>e[0])}function Cf(e,t){let n=[];for(let r=t-e;r<t;++r)n.push(r);return n}var wf=o((()=>{P()}));function Tf(e,t=null,n=!1){let r={x:L(e,`x`,`max`)},i={reductionIndices:t,keepDims:n};return F.runKernel(`Max`,r,i)}var Ef,Df=o((()=>{I(),N(),R(),B(),Ef=z({max_:Tf})}));function Of(e,t=null,n=!1){let r={x:L(e,`x`,`min`)},i={axis:t,keepDims:n};return F.runKernel(`Min`,r,i)}var kf,Af=o((()=>{I(),N(),R(),B(),kf=z({min_:Of})}));function jf(e,t){let n=L(e,`base`,`pow`),r=L(t,`exp`,`pow`);[n,r]=wa(n,r);let i={a:n,b:r};return F.runKernel(`Pow`,i)}var Mf,Nf=o((()=>{I(),N(),Aa(),R(),B(),Mf=z({pow_:jf})}));function Pf(e,t){if((Ri(e)&&t!==`string`||Array.isArray(e))&&t!==`complex64`)throw Error(`Error creating a new Scalar: value must be a primitive (number|boolean|string)`);if(t===`string`&&Ri(e)&&!(e instanceof Uint8Array))throw Error("When making a scalar from encoded string, the value must be `Uint8Array`.");return eo(e,[],[],t)}var Ff=o((()=>{P(),to()}));function If(e){let t={x:L(e,`x`,`sqrt`,`float32`)};return F.runKernel(hr,t)}var Lf,Rf=o((()=>{I(),N(),R(),B(),Lf=z({sqrt_:If})}));function zf(e){let t=L(e,`x`,`square`);return F.runKernel(`Square`,{x:t},{})}var Bf,Vf=o((()=>{I(),R(),B(),Bf=z({square_:zf})}));function Hf(e,t=null,n=!1){let r=L(e,`x`,`sum`);r.dtype===`bool`&&(r=tc(r,`int32`));let i={x:r},a={axis:t,keepDims:n};return F.runKernel(`Sum`,i,a)}var Uf,Wf=o((()=>{I(),N(),R(),nc(),B(),Uf=z({sum_:Hf})}));function Gf(e,t=`euclidean`,n=null,r=!1){e=L(e,`x`,`norm`);let i=Kf(e,t,n),a=i.shape;if(r){let t=A(n,e.shape);a=yf(i.shape,t)}return W(i,a)}function Kf(e,t,n=null){if(e.rank===0)return bc(e);if(e.rank!==1&&n===null)return Kf(W(e,[-1]),t,n);if(e.rank===1||typeof n==`number`||Array.isArray(n)&&n.length===1){if(t===1)return Uf(bc(e),n);if(t===1/0)return Ef(bc(e),n);if(t===-1/0)return kf(bc(e),n);if(t===`euclidean`||t===2)return Lf(Uf(Mf(bc(e),Pf(2,`int32`)),n));throw Error(`Error in norm: invalid ord value: ${t}`)}if(Array.isArray(n)&&n.length===2){if(t===1)return Ef(Uf(bc(e),n[0]),n[1]-1);if(t===1/0)return Ef(Uf(bc(e),n[1]),n[0]);if(t===-1/0)return kf(Uf(bc(e),n[1]),n[0]);if(t===`fro`||t===`euclidean`)return Lf(Uf(Bf(e),n));throw Error(`Error in norm: invalid ord value: ${t}`)}throw Error(`Error in norm: invalid axis: ${n}`)}var qf,Jf=o((()=>{R(),P(),xc(),wf(),Df(),Af(),B(),Nf(),G(),Ff(),Rf(),Vf(),Wf(),qf=z({norm_:Gf})}));function Yf(e,t=null,n=!1){return qf(e,`euclidean`,t,n)}var Xf,Zf=o((()=>{Jf(),B(),Xf=z({euclideanNorm_:Yf})}));function Qf(e){let t={x:L(e,`x`,`exp`)};return F.runKernel(`Exp`,t)}var $f,ep=o((()=>{I(),N(),R(),B(),$f=z({exp_:Qf})}));function tp(e,t=0){let n=L(e,`x`,`expandDims`,`string_or_numeric`);E(t<=n.rank,()=>`Axis must be <= rank of the tensor`);let r={input:n},i={dim:t};return F.runKernel(Wt,r,i)}var np,rp=o((()=>{I(),N(),R(),P(),B(),np=z({expandDims_:tp})}));function ip(e){let t={x:L(e,`x`,`expm1`)};return F.runKernel(Gt,t)}var ap,op=o((()=>{I(),N(),R(),B(),ap=z({expm1_:ip})}));function sp(e,t){let n=L(e,`x`,`tile`,`string_or_numeric`);E(n.rank===t.length,()=>`Error in transpose: rank of input ${n.rank} must match length of reps ${t}.`);let r={x:n},i={reps:t};return F.runKernel(Mr,r,i)}var cp,lp=o((()=>{I(),N(),R(),P(),B(),cp=z({tile_:sp})}));function up(e,t,n,r=`float32`){t??=e;let i=V([e,t],r),a=e<=t?e:t;for(let e=0;e<a;++e)i.set(1,e,e);let o=W(i.toTensor(),[e,t]);if(n==null)return o;if(n.length===1)return cp(np(o,0),[n[0],1,1]);if(n.length===2)return cp(np(np(o,0),0),[n[0],n[1],1,1]);if(n.length===3)return cp(np(np(np(o,0),0),0),[n[0],n[1],n[2],1,1]);throw Error(`eye() currently supports only 1D and 2D batchShapes, but received ${n.length}D.`)}var dp,fp=o((()=>{$s(),rp(),B(),G(),lp(),dp=z({eye_:up})}));function pp(e){let t={x:L(e,`x`,`floor`,`float32`)};return F.runKernel(Jt,t)}var mp,hp=o((()=>{I(),N(),R(),B(),mp=z({floor_:pp})}));function gp(e,t,n=0,r=0){let i={x:L(e,`x`,`gather`),indices:L(t,`indices`,`gather`,`int32`)},a={axis:n,batchDims:r};return F.runKernel(Zt,i,a)}var _p,vp=o((()=>{I(),N(),R(),B(),_p=z({gather_:gp})}));function yp(e,t){let n=L(e,`a`,`greater`,`string_or_numeric`),r=L(t,`b`,`greater`,`string_or_numeric`);[n,r]=wa(n,r),K(n.shape,r.shape);let i={a:n,b:r};return F.runKernel($t,i)}var bp,xp=o((()=>{I(),N(),Aa(),R(),Vd(),B(),bp=z({greater_:yp})}));function Sp(e,t){let n=L(e,`a`,`greaterEqual`,`string_or_numeric`),r=L(t,`b`,`greaterEqual`,`string_or_numeric`);[n,r]=wa(n,r),K(n.shape,r.shape);let i={a:n,b:r};return F.runKernel(en,i)}var Cp,wp=o((()=>{I(),N(),Aa(),R(),Vd(),B(),Cp=z({greaterEqual_:Sp})}));function Tp(e){let t={input:L(e,`input`,`imag`)};return F.runKernel(rn,t)}var Ep,Dp=o((()=>{I(),N(),R(),B(),Ep=z({imag_:Tp})}));function Op(e){let t={x:L(e,`x`,`isFinite`)};return F.runKernel(an,t)}var kp,Ap=o((()=>{I(),N(),R(),B(),kp=z({isFinite_:Op})}));function jp(e){let t={x:L(e,`x`,`isInf`)};return F.runKernel(on,t)}var Mp,Np=o((()=>{I(),N(),R(),B(),Mp=z({isInf_:jp})}));function Pp(e){let t={x:L(e,`x`,`isNaN`)};return F.runKernel(sn,t)}var Fp,Ip=o((()=>{I(),N(),R(),B(),Fp=z({isNaN_:Pp})}));function Lp(e,t=.2){let n={x:L(e,`x`,`leakyRelu`)},r={alpha:t};return F.runKernel(cn,n,r)}var Rp,zp=o((()=>{I(),N(),R(),B(),Rp=z({leakyRelu_:Lp})}));function Bp(e,t){let n=L(e,`a`,`less`,`string_or_numeric`),r=L(t,`b`,`less`,`string_or_numeric`);[n,r]=wa(n,r),K(n.shape,r.shape);let i={a:n,b:r};return F.runKernel(ln,i)}var Vp,Hp=o((()=>{I(),N(),Aa(),R(),Vd(),B(),Vp=z({less_:Bp})}));function Up(e,t){let n=L(e,`a`,`lessEqual`,`string_or_numeric`),r=L(t,`b`,`lessEqual`,`string_or_numeric`);[n,r]=wa(n,r),K(n.shape,r.shape);let i={a:n,b:r};return F.runKernel(un,i)}var Wp,Gp=o((()=>{I(),N(),Aa(),R(),Vd(),B(),Wp=z({lessEqual_:Up})}));function Kp(e,t,n){if(n<=0)throw Error(`The number of values should be positive.`);let r={start:e,stop:t,num:n};return F.runKernel(dn,{},r)}var qp=o((()=>{I(),N()}));function Jp(e,t=5,n=1,r=1,i=.5){let a=L(e,`x`,`localResponseNormalization`);E(a.rank===4||a.rank===3,()=>`Error in localResponseNormalization: x must be rank 3 or 4 but got
               rank ${a.rank}.`),E(re(t),()=>`Error in localResponseNormalization: depthRadius must be an integer but got depthRadius ${t}.`);let o=a,s=!1;a.rank===3&&(s=!0,o=W(a,[1,a.shape[0],a.shape[1],a.shape[2]]));let c={x:o},l={depthRadius:t,bias:n,alpha:r,beta:i},u=F.runKernel(`LRN`,c,l);return s?W(u,[u.shape[1],u.shape[2],u.shape[3]]):u}var Yp,Xp=o((()=>{I(),N(),R(),P(),B(),G(),Yp=z({localResponseNormalization_:Jp})}));function Zp(e){let t={x:L(e,`x`,`log`,`float32`)};return F.runKernel(`Log`,t)}var Qp,$p=o((()=>{I(),N(),R(),B(),Qp=z({log_:Zp})}));function em(e){let t={x:L(e,`x`,`log1p`)};return F.runKernel(fn,t)}var tm,nm=o((()=>{I(),N(),R(),B(),tm=z({log1p_:em})}));function rm(e){return E(Se(e),()=>`The f passed in grad(f) must be a function`),(t,n)=>{let r=L(t,`x`,`tf.grad`,`string_or_numeric`),i=n==null?null:L(n,`dy`,`tf.grad`);return F.tidy(()=>{let{value:t,grads:n}=F.gradients(()=>e(r),[r],i);return i!=null&&D(t.shape,i.shape,`The shape of dy passed in grad(f)(x, dy) must match the shape returned by f(x)`),lm(n),n[0]})}}function im(e){return E(Se(e),()=>`The f passed in grads(f) must be a function`),(t,n)=>{E(Array.isArray(t),()=>"The args passed in grads(f)(args) must be an array of `Tensor`s or `TensorLike`s");let r=Ya(t,`args`,`tf.grads`,`string_or_numeric`),i=n==null?null:L(n,`dy`,`tf.grads`);return F.tidy(()=>{let{value:t,grads:n}=F.gradients(()=>e(...r),r,i);return i!=null&&D(t.shape,i.shape,`The shape of dy passed in grads(f)([x1,...], dy) must match the shape returned by f([x1,...])`),lm(n),n})}}function am(e){return E(Se(e),()=>`The f passed in valueAndGrad(f) must be a function`),(t,n)=>{E(t instanceof la,()=>`The x passed in valueAndGrad(f)(x) must be a tensor`),E(n==null||n instanceof la,()=>`The dy passed in valueAndGrad(f)(x, dy) must be a tensor`);let{grads:r,value:i}=F.gradients(()=>e(t),[t],n);return lm(r),{grad:r[0],value:i}}}function om(e){return E(Se(e),()=>`The f passed in valueAndGrads(f) must be a function`),(t,n)=>{E(Array.isArray(t)&&t.every(e=>e instanceof la),()=>`The args passed in valueAndGrads(f)(args) must be array of tensors`),E(n==null||n instanceof la,()=>`The dy passed in valueAndGrads(f)(args, dy) must be a tensor`);let r=F.gradients(()=>e(...t),t,n);return n!=null&&D(r.value.shape,n.shape,`The shape of dy passed in valueAndGrads(f)([x1,...], dy) must match the shape returned by f([x1,...])`),lm(r.grads),r}}function sm(e,t){E(Se(e),()=>`The f passed in variableGrads(f) must be a function`),E(t==null||Array.isArray(t)&&t.every(e=>e instanceof ua),()=>`The varList passed in variableGrads(f, varList) must be an array of variables`);let n=t!=null;if(!n){t=[];for(let e in F.registeredVariables)t.push(F.registeredVariables[e])}let r=n?t.filter(e=>!e.trainable):null,i=t.length;t=t.filter(e=>e.trainable),E(t.length>0,()=>`variableGrads() expects at least one of the input variables to be trainable, but none of the ${i} variables is trainable.`);let{value:a,grads:o}=F.gradients(e,t,null,!0);E(o.some(e=>e!=null),()=>`Cannot find a connection between any variable and the result of the loss function y=f(x). Please make sure the operations that use variables are inside the function f passed to minimize().`),E(a.rank===0,()=>`The f passed in variableGrads(f) must return a scalar, but it returned a rank-${a.rank} tensor`);let s={};return t.forEach((e,t)=>{o[t]!=null&&(s[e.name]=o[t])}),r?.forEach(e=>s[e.name]=null),{value:a,grads:s}}function cm(e){return F.customGrad(e)}function lm(e){if(e.filter(e=>e==null).length>0)throw Error(`Cannot compute gradient of y=f(x) with respect to x. Make sure that
    the f you passed encloses all operations that lead from x to y.`)}var um=o((()=>{I(),da(),R(),P()}));function dm(e){let t={x:L(e,`x`,`neg`)};return F.runKernel(`Neg`,t)}var fm,pm=o((()=>{I(),N(),R(),B(),fm=z({neg_:dm})}));function mm(e){let t={x:L(e,`x`,`softplus`)};return F.runKernel(mr,t)}var hm,gm=o((()=>{I(),N(),R(),B(),hm=z({softplus_:mm})}));function _m(e){let t=L(e,`x`,`logSigmoid`);return cm(e=>({value:fm(hm(fm(e))),gradFunc:t=>U(t,Rl(fm(e)))}))(t)}var vm,ym=o((()=>{um(),R(),vc(),pm(),B(),zl(),gm(),vm=z({logSigmoid_:_m})}));function bm(e,t){let n=L(e,`a`,`sub`),r=L(t,`b`,`sub`);[n,r]=wa(n,r);let i={a:n,b:r};return F.runKernel(`Sub`,i)}var q,xm=o((()=>{I(),N(),Aa(),R(),B(),q=z({sub_:bm})}));function Sm(e,t=-1){let n=L(e,`logits`,`logSoftmax`);if(t===-1&&(t=n.rank-1),t!==n.rank-1)throw Error(`Log Softmax along a non-last dimension is not yet supported. Logits was rank ${n.rank} and axis was ${t}`);return cm((e,n)=>{let r=q(e,Ef(e,t,!0)),i=q(tc(r,`float32`),Qp(Uf($f(r),t,!0)));return n([i]),{value:i,gradFunc:(e,n)=>{let[r]=n,i=$f(r);return q(e,U(Uf(e,t,!0),i))}}})(n)}var Cm,wm=o((()=>{um(),R(),nc(),ep(),$p(),Df(),vc(),B(),xm(),Wf(),Cm=z({logSoftmax_:Sm})}));function Tm(e,t=null,n=!1){let r=L(e,`x`,`logSumExp`),i=A(t,r.shape),a=Ef(r,i,!0),o=Qp(Uf($f(q(r,a)),i)),s=H(W(a,o.shape),o);return n?W(s,yf(s.shape,i)):s}var Em,Dm=o((()=>{R(),P(),uc(),wf(),ep(),$p(),Df(),B(),G(),xm(),Wf(),Em=z({logSumExp_:Tm})}));function Om(e,t){let n=L(e,`a`,`logicalAnd`,`bool`),r=L(t,`b`,`logicalAnd`,`bool`);K(n.shape,r.shape);let i={a:n,b:r};return F.runKernel(pn,i)}var km,Am=o((()=>{I(),N(),R(),Vd(),B(),km=z({logicalAnd_:Om})}));function jm(e){let t={x:L(e,`x`,`logicalNot`,`bool`)};return F.runKernel(mn,t)}var Mm,Nm=o((()=>{I(),N(),R(),B(),Mm=z({logicalNot_:jm})}));function Pm(e,t){let n=L(e,`a`,`logicalOr`,`bool`),r=L(t,`b`,`logicalOr`,`bool`);K(n.shape,r.shape);let i={a:n,b:r};return F.runKernel(hn,i)}var Fm,Im=o((()=>{I(),N(),R(),Vd(),B(),Fm=z({logicalOr_:Pm})}));function Lm(e,t){let n=L(e,`a`,`logicalXor`,`bool`),r=L(t,`b`,`logicalXor`,`bool`);return K(n.shape,r.shape),km(Fm(e,t),Mm(km(e,t)))}var Rm,zm=o((()=>{R(),Vd(),Am(),Nm(),Im(),B(),Rm=z({logicalXor_:Lm})}));function Bm(e,t,n=`left`){let r=L(e,`sortedSequence`,`searchSorted`),i=L(t,`values`,`searchSorted`),a=r.shape[r.shape.length-1],o=i.shape[i.shape.length-1],s=W(r,[-1,a]),c=W(i,[-1,o]);if(s.rank<2)throw Error(`Sorted input argument must be at least 2-dimensional`);if(s.shape[0]!==c.shape[0])throw Error(`Leading dimension of 'sortedSequence' and 'values' must match.`);if(O(c.shape)>=Vm)throw Error(`values tensor size must less than ${Vm}`);if(s.shape[1]>=Vm)throw Error(`trailing dim_size must less than ${Vm} for int32 output type, was ${s.shape[1]}`);let l={sortedSequence:s,values:c},u={side:n};return F.runKernel(sr,l,u)}var Vm,Hm,Um=o((()=>{I(),N(),R(),Pe(),B(),G(),Vm=2147483648,Hm=z({searchSorted_:Bm})}));function Wm(e,t){return Hm(e,t,`left`)}var Gm=o((()=>{Um()}));function Km(e,t,n,r,i){let a=L(e,`x`,`maxPool`),o=a,s=!1;a.rank===3&&(s=!0,o=W(a,[1,a.shape[0],a.shape[1],a.shape[2]])),E(o.rank===4,()=>`Error in maxPool: input must be rank 4 but got rank ${o.rank}.`),E(yl(n,1),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${n} and dilations '1'`),Sl(`maxPool`,r,i);let c={x:o},l={filterSize:t,strides:n,pad:r,dimRoundingMode:i},u=F.runKernel(Sn,c,l);return s?W(u,[u.shape[1],u.shape[2],u.shape[3]]):u}var qm,Jm=o((()=>{I(),N(),R(),P(),Cl(),B(),G(),qm=z({maxPool_:Km})}));function Ym(e,t=[1,1,1],n,r,i,a=`NDHWC`){let o=L(e,`x`,`maxPool3d`),s=o,c=!1;o.rank===4&&(c=!0,s=W(o,[1,o.shape[0],o.shape[1],o.shape[2],o.shape[3]])),E(s.rank===5,()=>`Error in maxPool3d: x must be rank 5 but got rank ${s.rank}.`),E(a===`NDHWC`,()=>`Error in maxPool3d: Only NDHWC is currently supported, but got dataFormat of ${a}`),Sl(`maxPool3d`,r,i);let l={x:s},u={filterSize:t,strides:n,pad:r,dimRoundingMode:i,dataFormat:a},d=F.runKernel(wn,l,u);return c?W(d,[d.shape[1],d.shape[2],d.shape[3],d.shape[4]]):d}var Xm,Zm=o((()=>{I(),N(),R(),P(),Cl(),B(),G(),Xm=z({maxPool3d_:Ym})}));function Qm(e,t,n,r,i=!1){let a={x:L(e,`x`,`maxPoolWithArgmax`)},o={filterSize:t,strides:n,pad:r,includeBatchInIndex:i},s=F.runKernel(En,a,o);return{result:s[0],indexes:s[1]}}var $m,eh=o((()=>{I(),N(),R(),B(),$m=z({maxPoolWithArgmax_:Qm})}));function th(e,t){let n=L(e,`a`,`maximum`),r=L(t,`b`,`maximum`);[n,r]=wa(n,r),n.dtype===`bool`&&(n=tc(n,`int32`),r=tc(r,`int32`)),K(n.shape,r.shape);let i={a:n,b:r};return F.runKernel(xn,i)}var nh,rh=o((()=>{I(),N(),Aa(),R(),Vd(),nc(),B(),nh=z({maximum_:th})}));function ih(e,t=null,n=!1){let r={x:L(e,`x`,`mean`)},i={axis:t,keepDims:n};return F.runKernel(Dn,r,i)}var ah,oh=o((()=>{I(),N(),R(),B(),ah=z({mean_:ih})}));function sh(e,t=`float32`){if(Ae(e),t===`complex64`)return Qa(sh(e,`float32`),sh(e,`float32`));let n=Oe(O(e),t);return F.makeTensor(n,e,t)}var ch=o((()=>{I(),P(),$a()}));function lh(e,t=`float32`){if(Ae(e),t===`complex64`)return Qa(lh(e,`float32`),sh(e,`float32`));let n=De(O(e),t);return F.makeTensor(n,e,t)}var uh=o((()=>{I(),P(),Pe(),$a(),ch()}));function dh(e,t,{indexing:n=`xy`}={}){if(n!==`xy`&&n!==`ij`)throw TypeError(`${n} is not a valid third argument to meshgrid`);if(e===void 0)return[];let r=L(e,`x`,`meshgrid`,e instanceof la?e.dtype:`float32`);if(t===void 0)return[r];let i=L(t,`y`,`meshgrid`,t instanceof la?t.dtype:`float32`),a=O(r.shape),o=O(i.shape);return n===`xy`?(r=W(r,[1,-1]),i=W(i,[-1,1]),[Fl(lh([o,1],r.dtype),r),Fl(i,lh([1,a],i.dtype))]):(r=W(r,[-1,1]),i=W(i,[1,-1]),[Fl(r,lh([1,o],r.dtype)),Fl(lh([a,1],i.dtype),i)])}var fh=o((()=>{Il(),uh(),G(),da(),R(),Pe()}));function ph(e,t){let n=L(e,`a`,`minimum`),r=L(t,`b`,`minimum`);[n,r]=wa(n,r),n.dtype===`bool`&&(n=tc(n,`int32`),r=tc(r,`int32`)),K(n.shape,r.shape);let i={a:n,b:r};return F.runKernel(On,i)}var mh,hh=o((()=>{I(),N(),Aa(),R(),Vd(),nc(),B(),mh=z({minimum_:ph})}));function gh(e,t,n){E(n===`reflect`||n===`symmetric`,()=>`Invalid mode. Mode must be either reflect or symmetric. Got ${n}.`);let r=L(e,`x`,`mirrorPad`);if(r.rank===0)throw Error(`mirrorPad(scalar) is not defined. Pass non-scalar to mirrorPad`);E(t.length===r.rank,()=>`Padding doesn't match input. Must be ${r.rank}. Got ${t.length}.`);let i=+(n===`reflect`);for(let e=0;e<r.rank;e++)E(t[e].length===2,()=>`Invalid number of paddings. Must be length of 2 each.`),E(t[e][0]>=0&&t[e][0]<=r.shape[e]-i&&t[e][1]>=0&&t[e][1]<=r.shape[e]-i,()=>`Padding in dimension ${e} cannot be greater than or equal to ${r.shape[e]-i} or less than 0 for input of shape ${r.shape}`);let a={paddings:t,mode:n},o={x:r};return F.runKernel(kn,o,a)}var _h,vh=o((()=>{I(),N(),R(),P(),B(),_h=z({mirrorPad_:gh})}));function yh(e,t){let n=L(e,`a`,`mod`),r=L(t,`b`,`mod`);[n,r]=wa(n,r);let i={a:n,b:r};return F.runKernel(`Mod`,i)}var bh,xh=o((()=>{I(),N(),Aa(),R(),B(),bh=z({mod_:yh})}));function Sh(e,t=null,n=!1){e=L(e,`x`,`moments`);let r=A(t,e.shape),i=ah(e,r,n),a=i.shape;return n||(a=yf(i.shape,r)),{mean:i,variance:ah(Bf(q(tc(e,`float32`),W(i,a))),r,n)}}var Ch,wh=o((()=>{R(),P(),wf(),nc(),oh(),B(),G(),Vf(),xm(),Ch=z({moments_:Sh})}));function Th(e,t,n,r){let i=L(t,`data`,`multiRNNCell`),a=Ya(n,`c`,`multiRNNCell`),o=Ya(r,`h`,`multiRNNCell`),s=i,c=[];for(let t=0;t<e.length;t++){let n=e[t](s,a[t],o[t]);c.push(n[0]),c.push(n[1]),s=n[1]}let l=[],u=[];for(let e=0;e<c.length;e+=2)l.push(c[e]),u.push(c[e+1]);return[l,u]}var Eh,Dh=o((()=>{R(),B(),Eh=z({multiRNNCell_:Th})}));function Oh(e,t,n,r=!1){let i=L(e,`logits`,`multinomial`),a=i.size,o=i.rank;if(a<2)throw Error(`Error in multinomial: you need at least 2 outcomes, but got ${a}.`);if(o>2)throw Error(`Rank of probabilities must be 1 or 2, but is ${o}`);n||=Math.random();let s={logits:o===1?W(i,[1,-1]):i},c={numSamples:t,seed:n,normalized:r},l=F.runKernel(An,s,c);return o===1?W(l,[l.size]):l}var kh,Ah=o((()=>{I(),N(),R(),B(),G(),kh=z({multinomial_:Oh})}));function jh(e,t){let n=L(e,`a`,`notEqual`,`string_or_numeric`),r=L(t,`b`,`notEqual`,`string_or_numeric`);[n,r]=wa(n,r),K(n.shape,r.shape);let i={a:n,b:r};return F.runKernel(Mn,i)}var Mh,Nh=o((()=>{I(),N(),Aa(),R(),Vd(),B(),Mh=z({notEqual_:jh})}));function Ph(e,t,n=1,r=0,i=`int32`){if(t<2)throw Error(`Error in oneHot: depth must be >=2, but it is ${t}`);let a={indices:L(e,`indices`,`oneHot`,`int32`)},o={dtype:i,depth:t,onValue:n,offValue:r};return F.runKernel(Ln,a,o)}var Fh,Ih=o((()=>{I(),N(),R(),B(),Fh=z({oneHot_:Ph})}));function Lh(e){let t={x:L(e,`x`,`onesLike`)};return F.runKernel(In,t)}var Rh,zh=o((()=>{I(),N(),R(),B(),Rh=z({onesLike_:Lh})}));function Bh(e,t){let n=L(e,`v1`,`outerProduct`),r=L(t,`v2`,`outerProduct`);return E(n.rank===1&&r.rank===1,()=>`Error in outerProduct: inputs must be rank 1, but got ranks ${n.rank} and ${r.rank}.`),Fl(W(n,[-1,1]),W(r,[1,-1]))}var Vh,Hh=o((()=>{R(),P(),Il(),B(),G(),Vh=z({outerProduct_:Bh})}));function Uh(e,t,n=0){let r=L(e,`x`,`pad`);if(r.rank===0)throw Error(`pad(scalar) is not defined. Pass non-scalar to pad`);let i={paddings:t,constantValue:n},a={x:r};return F.runKernel(zn,a,i)}var Wh,Gh=o((()=>{I(),N(),R(),B(),Wh=z({pad_:Uh})}));function Kh(e,t,n=0){return E(t.length===2,()=>`Invalid number of paddings. Must be length of 2.`),Wh(e,[t],n)}var qh,Jh=o((()=>{P(),B(),Gh(),qh=z({pad1d_:Kh})}));function Yh(e,t,n=0){return E(t.length===2&&t[0].length===2&&t[1].length===2,()=>`Invalid number of paddings. Must be length of 2 each.`),Wh(e,t,n)}var Xh,Zh=o((()=>{P(),B(),Gh(),Xh=z({pad2d_:Yh})}));function Qh(e,t,n=0){return E(t.length===3&&t[0].length===2&&t[1].length===2&&t[2].length===2,()=>`Invalid number of paddings. Must be length of 2 each.`),Wh(e,t,n)}var $h,eg=o((()=>{P(),B(),Gh(),$h=z({pad3d_:Qh})}));function tg(e,t,n=0){return E(t.length===4&&t[0].length===2&&t[1].length===2&&t[2].length===2&&t[3].length===2,()=>`Invalid number of paddings. Must be length of 2 each.`),Wh(e,t,n)}var ng,rg=o((()=>{P(),B(),Gh(),ng=z({pad4d_:tg})}));function ig(e,t,n){let r=L(e,`x`,`spaceToBatchND`);E(r.rank>=1+t.length,()=>`input rank ${r.rank} should be > than [blockShape] ${t.length}`),E(n.length===t.length,()=>`paddings.shape[0] ${n.length} must be equal to [blockShape] ${t.length}`),E(r.shape.reduce((e,r,i)=>i>0&&i<=t.length?e&&(r+n[i-1][0]+n[i-1][1])%t[i-1]===0:e,!0),()=>`input spatial dimensions ${r.shape.slice(1)} with paddings ${n.toString()} must be divisible by blockShapes ${t.toString()}`);let i={x:r},a={blockShape:t,paddings:n};return F.runKernel(gr,i,a)}var ag,og=o((()=>{I(),N(),R(),P(),B(),ag=z({spaceToBatchND_:ig})}));function sg(e,t,n,r,i,a,o){i??=[1,1],a??=1,r===0&&(r=`valid`);let s=L(e,`x`,`maxPool`),c=s,l=!1;s.rank===3&&(l=!0,c=W(s,[1,s.shape[0],s.shape[1],s.shape[2]])),E(yl(a,i),()=>`Error in pool: Either strides or dilations must be 1. Got strides ${a} and dilations '${i}'`);let u=al(c.shape,t,a,i,r),d=[u.dilationHeight,u.dilationWidth],f;f=r===`same`?lg([u.filterHeight,u.filterWidth],d):[[0,0],[0,0]];let p=d[0]===1&&d[1]===1,[m,h]=cg([u.inHeight,u.inWidth],d,f),g=p?r:`valid`,_=p?c:ag(c,d,m),v=(n===`avg`?()=>El(_,t,a,g,o):()=>qm(_,t,a,g,o))(),y=p?v:Xl(v,d,h);return l?W(y,[y.shape[1],y.shape[2],y.shape[3]]):y}function cg(e,t,n){let r=n.map(e=>e[0]),i=n.map(e=>e[1]),a=e.concat(r,i),o=t.map((e,t)=>(e-a[t]%e)%e),s=i.map((e,t)=>e+o[t]);return[t.map((e,t)=>[r[t],s[t]]),t.map((e,t)=>[0,o[t]])]}function lg(e,t){let n=e.map((e,n)=>e+(e-1)*(t[n]-1)).map(e=>e-1),r=n.map(e=>Math.floor(e/2)),i=n.map((e,t)=>e-r[t]);return n.map((e,t)=>[r[t],i[t]])}var ug,dg=o((()=>{R(),P(),Dl(),Zl(),Cl(),Jm(),B(),G(),og(),ug=z({pool_:sg})}));function fg(e,t){let n={x:L(e,`x`,`prelu`),alpha:L(t,`alpha`,`prelu`)};return F.runKernel(Vn,n)}var pg,mg=o((()=>{I(),N(),R(),B(),pg=z({prelu_:fg})}));function hg(e,t=null,n=!1){let r=L(e,`x`,`prod`);r.dtype===`bool`&&(r=tc(r,`int32`));let i={x:r},a={axis:t,keepDims:n};return F.runKernel(Hn,i,a)}var gg,_g=o((()=>{I(),N(),R(),nc(),B(),gg=z({prod_:hg})}));function vg(e,t,n,r){let i={paramsNestedSplits:e.map((e,t)=>L(e,`tensors${t}`,`raggedGather`,`int32`)),paramsDenseValues:L(t,`paramsDenseValues`,`raggedGather`),indices:L(n,`indices`,`raggedGather`,`int32`)},a={outputRaggedRank:r},o=F.runKernel(Un,i,a);return{outputNestedSplits:o.slice(0,o.length-1),outputDenseValues:o[o.length-1]}}var yg,bg=o((()=>{I(),N(),R(),B(),yg=z({raggedGather_:vg})}));function xg(e,t,n){let r=L(e,`starts`,`raggedRange`),i={starts:r,limits:L(t,`limits`,`raggedRange`,r.dtype),deltas:L(n,`deltas`,`raggedRange`,r.dtype)},a=F.runKernel(Wn,i);return{rtNestedSplits:a[0],rtDenseValues:a[1]}}var Sg,Cg=o((()=>{I(),N(),R(),B(),Sg=z({raggedRange_:xg})}));function wg(e,t,n,r,i){let a=L(e,`shape`,`raggedTensorToTensor`,`int32`),o=L(t,`values`,`raggedTensorToTensor`),s={shape:a,values:o,defaultValue:L(n,`defaultValue`,`raggedTensorToTensor`,o.dtype),rowPartitionTensors:r.map((e,t)=>L(e,`tensors${t}`,`raggedTensorToTensor`,`int32`))},c={rowPartitionTypes:i};return F.runKernel(Gn,s,c)}var Tg,Eg=o((()=>{I(),N(),R(),B(),Tg=z({raggedTensorToTensor_:wg})}));function Dg(e,t,n){Ae(e);let r=O(e),i=null;if(n==null||n===`float32`)i=new Float32Array(r);else if(n===`int32`)i=new Int32Array(r);else if(n===`bool`)i=new Uint8Array(r);else throw Error(`Unknown data type ${n}`);for(let e=0;e<r;e++)i[e]=t();return F.makeTensor(i,e,n)}var Og,kg=o((()=>{I(),P(),Pe(),B(),Og=z({rand_:Dg})})),Ag=s(((e,t)=>{(function(e,t,n){function r(e){var t=this,n=o();t.next=function(){var e=2091639*t.s0+t.c*23283064365386963e-26;return t.s0=t.s1,t.s1=t.s2,t.s2=e-(t.c=e|0)},t.c=1,t.s0=n(` `),t.s1=n(` `),t.s2=n(` `),t.s0-=n(e),t.s0<0&&(t.s0+=1),t.s1-=n(e),t.s1<0&&(t.s1+=1),t.s2-=n(e),t.s2<0&&(t.s2+=1),n=null}function i(e,t){return t.c=e.c,t.s0=e.s0,t.s1=e.s1,t.s2=e.s2,t}function a(e,t){var n=new r(e),a=t&&t.state,o=n.next;return o.int32=function(){return n.next()*4294967296|0},o.double=function(){return o()+(o()*2097152|0)*11102230246251565e-32},o.quick=o,a&&(typeof a==`object`&&i(a,n),o.state=function(){return i(n,{})}),o}function o(){var e=4022871197;return function(t){t=String(t);for(var n=0;n<t.length;n++){e+=t.charCodeAt(n);var r=.02519603282416938*e;e=r>>>0,r-=e,r*=e,e=r>>>0,r-=e,e+=r*4294967296}return(e>>>0)*23283064365386963e-26}}t&&t.exports?t.exports=a:n&&n.amd?n(function(){return a}):this.alea=a})(e,typeof t==`object`&&t,typeof define==`function`&&define)})),jg=s(((e,t)=>{(function(e,t,n){function r(e){var t=this,n=``;t.x=0,t.y=0,t.z=0,t.w=0,t.next=function(){var e=t.x^t.x<<11;return t.x=t.y,t.y=t.z,t.z=t.w,t.w^=t.w>>>19^e^e>>>8},e===(e|0)?t.x=e:n+=e;for(var r=0;r<n.length+64;r++)t.x^=n.charCodeAt(r)|0,t.next()}function i(e,t){return t.x=e.x,t.y=e.y,t.z=e.z,t.w=e.w,t}function a(e,t){var n=new r(e),a=t&&t.state,o=function(){return(n.next()>>>0)/4294967296};return o.double=function(){do var e=((n.next()>>>11)+(n.next()>>>0)/4294967296)/(1<<21);while(e===0);return e},o.int32=n.next,o.quick=o,a&&(typeof a==`object`&&i(a,n),o.state=function(){return i(n,{})}),o}t&&t.exports?t.exports=a:n&&n.amd?n(function(){return a}):this.xor128=a})(e,typeof t==`object`&&t,typeof define==`function`&&define)})),Mg=s(((e,t)=>{(function(e,t,n){function r(e){var t=this,n=``;t.next=function(){var e=t.x^t.x>>>2;return t.x=t.y,t.y=t.z,t.z=t.w,t.w=t.v,(t.d=t.d+362437|0)+(t.v=t.v^t.v<<4^(e^e<<1))|0},t.x=0,t.y=0,t.z=0,t.w=0,t.v=0,e===(e|0)?t.x=e:n+=e;for(var r=0;r<n.length+64;r++)t.x^=n.charCodeAt(r)|0,r==n.length&&(t.d=t.x<<10^t.x>>>4),t.next()}function i(e,t){return t.x=e.x,t.y=e.y,t.z=e.z,t.w=e.w,t.v=e.v,t.d=e.d,t}function a(e,t){var n=new r(e),a=t&&t.state,o=function(){return(n.next()>>>0)/4294967296};return o.double=function(){do var e=((n.next()>>>11)+(n.next()>>>0)/4294967296)/(1<<21);while(e===0);return e},o.int32=n.next,o.quick=o,a&&(typeof a==`object`&&i(a,n),o.state=function(){return i(n,{})}),o}t&&t.exports?t.exports=a:n&&n.amd?n(function(){return a}):this.xorwow=a})(e,typeof t==`object`&&t,typeof define==`function`&&define)})),Ng=s(((e,t)=>{(function(e,t,n){function r(e){var t=this;t.next=function(){var e=t.x,n=t.i,r=e[n],i;return r^=r>>>7,i=r^r<<24,r=e[n+1&7],i^=r^r>>>10,r=e[n+3&7],i^=r^r>>>3,r=e[n+4&7],i^=r^r<<7,r=e[n+7&7],r^=r<<13,i^=r^r<<9,e[n]=i,t.i=n+1&7,i};function n(e,t){var n,r=[];if(t===(t|0))r[0]=t;else for(t=``+t,n=0;n<t.length;++n)r[n&7]=r[n&7]<<15^t.charCodeAt(n)+r[n+1&7]<<13;for(;r.length<8;)r.push(0);for(n=0;n<8&&r[n]===0;++n);for(n==8?r[7]=-1:r[n],e.x=r,e.i=0,n=256;n>0;--n)e.next()}n(t,e)}function i(e,t){return t.x=e.x.slice(),t.i=e.i,t}function a(e,t){e??=+new Date;var n=new r(e),a=t&&t.state,o=function(){return(n.next()>>>0)/4294967296};return o.double=function(){do var e=((n.next()>>>11)+(n.next()>>>0)/4294967296)/(1<<21);while(e===0);return e},o.int32=n.next,o.quick=o,a&&(a.x&&i(a,n),o.state=function(){return i(n,{})}),o}t&&t.exports?t.exports=a:n&&n.amd?n(function(){return a}):this.xorshift7=a})(e,typeof t==`object`&&t,typeof define==`function`&&define)})),Pg=s(((e,t)=>{(function(e,t,n){function r(e){var t=this;t.next=function(){var e=t.w,n=t.X,r=t.i,i,a;return t.w=e=e+1640531527|0,a=n[r+34&127],i=n[r=r+1&127],a^=a<<13,i^=i<<17,a^=a>>>15,i^=i>>>12,a=n[r]=a^i,t.i=r,a+(e^e>>>16)|0};function n(e,t){var n,r,i,a,o,s=[],c=128;for(t===(t|0)?(r=t,t=null):(t+=`\0`,r=0,c=Math.max(c,t.length)),i=0,a=-32;a<c;++a)t&&(r^=t.charCodeAt((a+32)%t.length)),a===0&&(o=r),r^=r<<10,r^=r>>>15,r^=r<<4,r^=r>>>13,a>=0&&(o=o+1640531527|0,n=s[a&127]^=r+o,i=n==0?i+1:0);for(i>=128&&(s[(t&&t.length||0)&127]=-1),i=127,a=512;a>0;--a)r=s[i+34&127],n=s[i=i+1&127],r^=r<<13,n^=n<<17,r^=r>>>15,n^=n>>>12,s[i]=r^n;e.w=o,e.X=s,e.i=i}n(t,e)}function i(e,t){return t.i=e.i,t.w=e.w,t.X=e.X.slice(),t}function a(e,t){e??=+new Date;var n=new r(e),a=t&&t.state,o=function(){return(n.next()>>>0)/4294967296};return o.double=function(){do var e=((n.next()>>>11)+(n.next()>>>0)/4294967296)/(1<<21);while(e===0);return e},o.int32=n.next,o.quick=o,a&&(a.X&&i(a,n),o.state=function(){return i(n,{})}),o}t&&t.exports?t.exports=a:n&&n.amd?n(function(){return a}):this.xor4096=a})(e,typeof t==`object`&&t,typeof define==`function`&&define)})),Fg=s(((e,t)=>{(function(e,t,n){function r(e){var t=this,n=``;t.next=function(){var e=t.b,n=t.c,r=t.d,i=t.a;return e=e<<25^e>>>7^n,n=n-r|0,r=r<<24^r>>>8^i,i=i-e|0,t.b=e=e<<20^e>>>12^n,t.c=n=n-r|0,t.d=r<<16^n>>>16^i,t.a=i-e|0},t.a=0,t.b=0,t.c=-1640531527,t.d=1367130551,e===Math.floor(e)?(t.a=e/4294967296|0,t.b=e|0):n+=e;for(var r=0;r<n.length+20;r++)t.b^=n.charCodeAt(r)|0,t.next()}function i(e,t){return t.a=e.a,t.b=e.b,t.c=e.c,t.d=e.d,t}function a(e,t){var n=new r(e),a=t&&t.state,o=function(){return(n.next()>>>0)/4294967296};return o.double=function(){do var e=((n.next()>>>11)+(n.next()>>>0)/4294967296)/(1<<21);while(e===0);return e},o.int32=n.next,o.quick=o,a&&(typeof a==`object`&&i(a,n),o.state=function(){return i(n,{})}),o}t&&t.exports?t.exports=a:n&&n.amd?n(function(){return a}):this.tychei=a})(e,typeof t==`object`&&t,typeof define==`function`&&define)})),Ig=s(((e,t)=>{(function(e,n,r){var i=256,a=6,o=52,s=`random`,c=r.pow(i,a),l=r.pow(2,o),u=l*2,d=i-1,f;function p(e,t,o){var d=[];t=t==1?{entropy:!0}:t||{};var f=_(g(t.entropy?[e,y(n)]:e??v(),3),d),p=new m(d),b=function(){for(var e=p.g(a),t=c,n=0;e<l;)e=(e+n)*i,t*=i,n=p.g(1);for(;e>=u;)e/=2,t/=2,n>>>=1;return(e+n)/t};return b.int32=function(){return p.g(4)|0},b.quick=function(){return p.g(4)/4294967296},b.double=b,_(y(p.S),n),(t.pass||o||function(e,t,n,i){return i&&(i.S&&h(i,p),e.state=function(){return h(p,{})}),n?(r[s]=e,t):e})(b,f,`global`in t?t.global:this==r,t.state)}function m(e){var t,n=e.length,r=this,a=0,o=r.i=r.j=0,s=r.S=[];for(n||(e=[n++]);a<i;)s[a]=a++;for(a=0;a<i;a++)s[a]=s[o=d&o+e[a%n]+(t=s[a])],s[o]=t;(r.g=function(e){for(var t,n=0,a=r.i,o=r.j,s=r.S;e--;)t=s[a=d&a+1],n=n*i+s[d&(s[a]=s[o=d&o+t])+(s[o]=t)];return r.i=a,r.j=o,n})(i)}function h(e,t){return t.i=e.i,t.j=e.j,t.S=e.S.slice(),t}function g(e,t){var n=[],r=typeof e,i;if(t&&r==`object`)for(i in e)try{n.push(g(e[i],t-1))}catch{}return n.length?n:r==`string`?e:e+`\0`}function _(e,t){for(var n=e+``,r,i=0;i<n.length;)t[d&i]=d&(r^=t[d&i]*19)+n.charCodeAt(i++);return y(t)}function v(){try{var t;return f&&(t=f.randomBytes)?t=t(i):(t=new Uint8Array(i),(e.crypto||e.msCrypto).getRandomValues(t)),y(t)}catch{var r=e.navigator,a=r&&r.plugins;return[+new Date,e,a,e.screen,y(n)]}}function y(e){return String.fromCharCode.apply(0,e)}if(_(r.random(),n),typeof t==`object`&&t.exports){t.exports=p;try{f=Js()}catch{}}else typeof define==`function`&&define.amd?define(function(){return p}):r[`seed`+s]=p})(typeof self<`u`?self:e,[],Math)})),Lg=s(((e,t)=>{var n=Ag(),r=jg(),i=Mg(),a=Ng(),o=Pg(),s=Fg(),c=Ig();c.alea=n,c.xor128=r,c.xorwow=i,c.xorshift7=a,c.xor4096=o,c.tychei=s,t.exports=c})),Rg=c({TEST_EPSILON_FLOAT16:()=>Qg,createVideoElement:()=>Yg,encodeStrings:()=>Jg,expectArrayBuffersEqual:()=>qg,expectArraysClose:()=>zg,expectArraysEqual:()=>Ug,expectNumbersClose:()=>Wg,expectPromiseToFail:()=>Hg,expectValuesInRange:()=>Kg,play:()=>Xg,testEpsilon:()=>Bg});function zg(e,t,n){return n??=Bg(),Vg(e,t,(e,t)=>Gg(e,t,n))}function Bg(){return F.backend.floatPrecision()===32?Zg:Qg}function Vg(e,t,n){let r=!0;if((Ri(e)||Ri(t))&&(r=!1),Ri(e)&&Ri(t)&&(r=!0),r){let n=e.constructor.name,r=t.constructor.name;if(n!==r)throw Error(`Arrays are of different type. Actual: ${n}. Expected: ${r}`)}if(Array.isArray(e)&&Array.isArray(t)){let n=Ka(e),r=Ka(t);if(!k(n,r))throw Error(`Arrays have different shapes. Actual: [${n}]. Expected: [${r}]`)}let i=Ri(e)?e:zi(e),a=Ri(t)?t:zi(t);if(i.length!==a.length)throw Error(`Arrays have different lengths actual: ${i.length} vs expected: ${a.length}.\nActual:   ${i}.\nExpected: ${a}.`);for(let e=0;e<a.length;++e){let t=i[e],r=a[e];if(!n(t,r))throw Error(`Arrays differ: actual[${e}] = ${t}, expected[${e}] = ${r}.\nActual:   ${i}.\nExpected: ${a}.`)}typeof expect<`u`&&expect().nothing()}function Hg(e,t){e().then(()=>t.fail(),()=>t()),typeof expect<`u`&&expect().nothing()}function Ug(e,t){let n=typeof t==`string`||typeof t==`number`||typeof t==`boolean`?[t]:t;return ve(e)||ve(e[0])||ve(t)||ve(t[0])?Vg(e,n,(e,t)=>e==t):Vg(e,t,(e,t)=>Gg(e,t,0))}function Wg(e,t,n){if(n??=Bg(),!Gg(e,t,n))throw Error(`Numbers differ: actual === ${e}, expected === ${t}`);typeof expect<`u`&&expect().nothing()}function Gg(e,t,n){return!isFinite(e)&&!isFinite(t)?!0:!(isNaN(e)||isNaN(t)||Math.abs(e-t)>n)}function Kg(e,t,n){for(let r=0;r<e.length;r++)if(e[r]<t||e[r]>n)throw Error(`Value out of range:${e[r]} low: ${t}, high: ${n}`)}function qg(e,t){let n=new Float32Array(e),r=new Float32Array(t);if(n.length!==r.length)throw Error(`Expected ArrayBuffer to be of length ${r.length}, but it was ${n.length}`);for(let e=0;e<r.length;e++)if(n[e]!==r[e])throw Error(`Expected ArrayBuffer value at ${e} to be ${r[e]} but got ${n[e]} instead`)}function Jg(e){for(let t=0;t<e.length;t++){let n=e[t];Array.isArray(n)?Jg(n):e[t]=Ii(n)}return e}function Yg(e){let t=document.createElement(`video`);return`playsInline`in t&&(t.playsInline=!0),t.muted=!0,t.loop=!0,t.style.position=`fixed`,t.style.left=`0px`,t.style.top=`0px`,t.preload=`auto`,t.appendChild(e),new Promise(e=>{t.addEventListener(`loadeddata`,n=>e(t)),t.load()})}async function Xg(e){await e.play(),`requestVideoFrameCallback`in e&&await new Promise(t=>{e.requestVideoFrameCallback(t)})}var Zg,Qg,$g=o((()=>{I(),R(),P(),Zg=.001,Qg=.1})),e_,t_,n_,r_,i_=o((()=>{e_=u(Lg()),t_=class{constructor(e,t,n,r,i){this.mean=e,this.stdDev=t,this.dtype=n,this.nextVal=NaN,this.truncated=r,this.truncated&&(this.upper=this.mean+this.stdDev*2,this.lower=this.mean-this.stdDev*2);let a=i||Math.random();this.random=e_.alea(a.toString())}nextValue(){if(!isNaN(this.nextVal)){let e=this.nextVal;return this.nextVal=NaN,e}let e,t,n=!1;for(;!n;){let r,i,a;do r=2*this.random()-1,i=2*this.random()-1,a=r*r+i*i;while(a>=1||a===0);let o=Math.sqrt(-2*Math.log(a)/a);e=this.mean+this.stdDev*r*o,t=this.mean+this.stdDev*i*o,(!this.truncated||this.isValidTruncated(e))&&(n=!0)}return(!this.truncated||this.isValidTruncated(t))&&(this.nextVal=this.convertValue(t)),this.convertValue(e)}convertValue(e){return this.dtype==null||this.dtype===`float32`?e:Math.round(e)}isValidTruncated(e){return e<=this.upper&&e>=this.lower}},n_=class{constructor(e,t,n,r){this.alpha=e,this.beta=1/t,this.dtype=n;let i=r||Math.random();this.randu=e_.alea(i.toString()),this.randn=new t_(0,1,n,!1,this.randu()),e<1?this.d=e+2/3:this.d=e-1/3,this.c=1/Math.sqrt(9*this.d)}nextValue(){let e,t,n,r,i,a;for(;;){do r=this.randn.nextValue(),a=1+this.c*r;while(a<=0);if(a*=a*a,e=r*r,t=1-.331*e*e,n=.5*e+this.d*(1-a+Math.log(a)),i=this.randu(),i<t||Math.log(i)<n)break}return a=1/this.beta*this.d*a,this.alpha<1&&(a*=this.randu()**(1/this.alpha)),this.convertValue(a)}convertValue(e){return this.dtype===`float32`?e:Math.round(e)}},r_=class{constructor(e=0,t=1,n,r){if(this.canReturnFloat=()=>this.dtype==null||this.dtype===`float32`,this.min=e,this.range=t-e,this.dtype=n,r??=Math.random(),typeof r==`number`&&(r=r.toString()),!this.canReturnFloat()&&this.range<=1)throw Error(`The difference between ${e} - ${t} <= 1 and dtype is not float`);this.random=e_.alea(r)}convertValue(e){return this.canReturnFloat()?e:Math.round(e)}nextValue(){return this.convertValue(this.min+this.range*this.random())}}}));function a_(e,t,n=1,r=`float32`,i){if(Ae(e),n??=1,r??=`float32`,r!==`float32`&&r!==`int32`)throw Error(`Unsupported data type ${r}`);let a=new n_(t,n,r,i),o=V(e,r);for(let e=0;e<o.values.length;e++)o.values[e]=a.nextValue();return o.toTensor()}var o_,s_=o((()=>{Pe(),$s(),B(),i_(),o_=z({randomGamma_:a_})}));function c_(e,t=0,n=1,r,i){if(Ae(e),r!=null&&r===`bool`)throw Error(`Unsupported data type ${r}`);let a=new t_(t,n,r,!1,i),o=V(e,r);for(let e=0;e<o.values.length;e++)o.values[e]=a.nextValue();return o.toTensor()}var l_,u_=o((()=>{Pe(),$s(),B(),i_(),l_=z({randomNormal_:c_})}));function d_(e,t,n){if(t!=null&&t===`bool`)throw Error(`Unsupported data type ${t}`);return l_(e,0,1,t,n)}var f_,p_=o((()=>{B(),u_(),f_=z({randomStandardNormal_:d_})}));function m_(e,t=0,n=1,r=`float32`,i){Ae(e);let a=V(e,r),o=new r_(t,n,null,i);for(let e=0;e<a.values.length;e++)a.values[e]=o.nextValue();return a.toTensor()}var h_,g_=o((()=>{Pe(),$s(),B(),i_(),h_=z({randomUniform_:m_})}));function __(e,t,n,r){return h_(e,t,n,`int32`,r)}var v_,y_=o((()=>{B(),g_(),v_=z({randomUniformInt_:__})}));function b_(e,t,n=1,r=`float32`){if(n===0)throw Error(`Cannot have a step of zero`);let i={start:e,stop:t,step:n,dtype:r};return F.runKernel(Kn,{},i)}var x_=o((()=>{I(),N()}));function S_(e){let t={input:L(e,`input`,`real`)};return F.runKernel(qn,t)}var C_,w_=o((()=>{I(),N(),R(),B(),C_=z({real_:S_})}));function T_(e){let t={x:L(e,`x`,`reciprocal`)};return F.runKernel(Jn,t)}var E_,D_=o((()=>{I(),N(),R(),B(),E_=z({reciprocal_:T_})}));function O_(e){let t={x:L(e,`x`,`relu`)};return F.runKernel(Yn,t)}var k_,A_=o((()=>{I(),N(),R(),B(),k_=z({relu_:O_})}));function j_(e){let t={x:L(e,`x`,`relu6`)};return F.runKernel(tr,t)}var M_,N_=o((()=>{I(),N(),R(),B(),M_=z({relu6_:j_})}));function P_(e,t){let n={x:L(e,`x`,`reverse`)},r={dims:t};return F.runKernel(nr,n,r)}var F_,I_=o((()=>{I(),N(),R(),B(),F_=z({reverse_:P_})}));function L_(e){let t=L(e,`x`,`reverse`);return E(t.rank===1,()=>`Error in reverse1D: x must be rank 1 but got rank ${t.rank}.`),F_(t,0)}var R_,z_=o((()=>{R(),P(),B(),I_(),R_=z({reverse1d_:L_})}));function B_(e,t){let n=L(e,`x`,`reverse`);return E(n.rank===2,()=>`Error in reverse2D: x must be rank 2 but got rank ${n.rank}.`),F_(n,t)}var V_,H_=o((()=>{R(),P(),B(),I_(),V_=z({reverse2d_:B_})}));function U_(e,t){let n=L(e,`x`,`reverse`);return E(n.rank===3,()=>`Error in reverse3D: x must be rank 3 but got rank ${n.rank}.`),F_(n,t)}var W_,G_=o((()=>{R(),P(),B(),I_(),W_=z({reverse3d_:U_})}));function K_(e,t){let n=L(e,`x`,`reverse`);return E(n.rank===4,()=>`Error in reverse4D: x must be rank 4 but got rank ${n.rank}.`),F_(n,t)}var q_,J_=o((()=>{R(),P(),B(),I_(),q_=z({reverse4d_:K_})}));function Y_(e){let t={x:L(e,`x`,`round`)};return F.runKernel(rr,t)}var X_,Z_=o((()=>{I(),N(),R(),B(),X_=z({round_:Y_})}));function Q_(e){let t={x:L(e,`x`,`rsqrt`,`float32`)};return F.runKernel(ir,t)}var $_,ev=o((()=>{I(),N(),R(),B(),$_=z({rsqrt_:Q_})}));function tv(e){let t={x:L(e,`x`,`selu`)};return F.runKernel(lr,t)}var nv,rv=o((()=>{I(),N(),R(),B(),nv=z({selu_:tv})}));function iv(e,t,n,r,i,a=[1,1],o=`NHWC`){let s=L(e,`x`,`separableConv2d`),c=L(t,`depthwiseFilter`,`separableConv2d`),l=L(n,`pointwiseFilter`,`separableConv2d`),u=s,d=!1;if(s.rank===3&&(d=!0,u=W(s,[1,s.shape[0],s.shape[1],s.shape[2]])),o===`NCHW`)throw Error(`separableConv2d currently does not support dataFormat NCHW; only NHWC is supported`);E(u.rank===4,()=>`Error in separableConv2d: input must be rank 4, but got rank ${u.rank}.`),E(c.rank===4,()=>`Error in separableConv2d: depthwise filter must be rank 4, but got rank ${c.rank}.`),E(l.rank===4,()=>`Error in separableConv2d: pointwise filter must be rank 4, but got rank ${c.rank}.`),E(l.shape[0]===1,()=>`Error in separableConv2d: the first dimension of pointwise filter  must be 1, but got ${l.shape[0]}.`),E(l.shape[1]===1,()=>`Error in separableConv2d: the second dimension of pointwise filter must be 1, but got ${l.shape[1]}.`);let f=c.shape[2],p=c.shape[3];E(l.shape[2]===f*p,()=>`Error in separableConv2d: the third dimension of pointwise filter must be ${f*p}, but got ${l.shape[2]}.`);let m=Gu(Ad(u,c,r,i,o,a),l,1,`valid`,o);return d?W(m,[m.shape[1],m.shape[2],m.shape[3]]):m}var av,ov=o((()=>{R(),P(),Ku(),jd(),B(),G(),av=z({separableConv2d_:iv})}));async function sv(e,t){let n=L(e,`x`,`setdiff1d`),r=L(t,`y`,`setdiff1d`);E(n.dtype===r.dtype,()=>`x and y should have the same dtype, but got x (${n.dtype}) and y (${r.dtype}).`),E(n.rank===1,()=>`x should be 1D tensor, but got x (${n.shape}).`),E(r.rank===1,()=>`y should be 1D tensor, but got y (${r.shape}).`);let i=await n.data(),a=await r.data(),o=new Set(a),s=0;for(let e=0;e<i.length;e++)o.has(i[e])||s++;let c=new oa([s],n.dtype),l=new oa([s],`int32`);for(let e=0,t=0;e<i.length;e++)o.has(i[e])||(c.values[t]=i[e],l.values[t]=e,t++);return[c.toTensor(),l.toTensor()]}var cv,lv=o((()=>{da(),R(),P(),cv=sv}));function uv(e){let t={x:L(e,`x`,`sign`)};return F.runKernel(fr,t)}var dv,fv=o((()=>{I(),N(),R(),B(),dv=z({sign_:uv})}));function pv(e){let t={x:L(e,`x`,`sin`,`float32`)};return F.runKernel(`Sin`,t)}var mv,hv=o((()=>{I(),N(),R(),B(),mv=z({sin_:pv})}));function gv(e){let t={x:L(e,`x`,`sinh`)};return F.runKernel(dr,t)}var _v,vv=o((()=>{I(),N(),R(),B(),_v=z({sinh_:gv})}));function yv(e,t,n){let r=L(e,`x`,`slice1d`);return E(r.rank===1,()=>`slice1d expects a rank-1 tensor, but got a rank-${r.rank} tensor`),Vl(r,[t],[n])}var bv,xv=o((()=>{R(),P(),B(),Hl(),bv=z({slice1d_:yv})}));function Sv(e,t,n){let r=L(e,`x`,`slice2d`);return E(r.rank===2,()=>`slice2d expects a rank-2 tensor, but got a rank-${r.rank} tensor`),Vl(r,t,n)}var Cv,wv=o((()=>{R(),P(),B(),Hl(),Cv=z({slice2d_:Sv})}));function Tv(e,t,n){let r=L(e,`x`,`slice3d`);return E(r.rank===3,()=>`slice3d expects a rank-3 tensor, but got a rank-${r.rank} tensor`),Vl(r,t,n)}var Ev,Dv=o((()=>{R(),P(),B(),Hl(),Ev=z({slice3d_:Tv})}));function Ov(e,t,n){let r=L(e,`x`,`slice4d`);return E(r.rank===4,()=>`slice4d expects a rank-4 tensor, but got a rank-${r.rank} tensor`),Vl(r,t,n)}var kv,Av=o((()=>{R(),P(),B(),Hl(),kv=z({slice4d_:Ov})}));function jv(e,t=-1){let n=L(e,`logits`,`softmax`,`float32`);if(t===-1&&(t=n.rank-1),t!==n.rank-1)throw Error(`Softmax along a non-last dimension is not yet supported. Logits was rank ${n.rank} and dim was ${t}`);let r={logits:n},i={dim:t};return F.runKernel(vr,r,i)}var Mv,Nv=o((()=>{I(),N(),R(),B(),Mv=z({softmax_:jv})}));function Pv(e){E(e.dtype===`complex64`,()=>`The dtype for tf.spectral.fft() must be complex64 but got ${e.dtype}.`);let t={input:e};return F.runKernel(`FFT`,t)}var Fv,Iv=o((()=>{I(),N(),P(),B(),Fv=z({fft_:Pv})}));function Lv(e){E(e.dtype===`complex64`,()=>`The dtype for tf.spectral.ifft() must be complex64 but got ${e.dtype}.`);let t={input:e};return F.runKernel(nn,t)}var Rv,zv=o((()=>{I(),N(),P(),B(),Rv=z({ifft_:Lv})}));function Bv(e){let t=e.shape[e.shape.length-1],n=e.size/t,r;if(t<=2)r=Rv(W(e,[n,t]));else{let i=[n,2*(t-1)],a=W(C_(e),[n,t]),o=W(Ep(e),[n,t]),s=F_(Vl(a,[0,1],[n,t-2]),1),c=U(F_(Vl(o,[0,1],[n,t-2]),1),Pf(-1));r=Rv(W(Qa(Ml([a,s],1),Ml([o,c],1)),[i[0],i[1]]))}if(r=C_(r),e.rank===3&&e.shape[0]!==0){let t=r,n=e.shape[0];r=W(r,[n,r.shape[0]/n,r.shape[1]]),t.dispose()}return r}var Vv,Hv=o((()=>{$a(),Nl(),Dp(),vc(),B(),w_(),G(),I_(),Ff(),Hl(),zv(),Vv=z({irfft_:Bv})}));function Uv(e,t,n=0){let r={x:L(e,`x`,`split`)},i={numOrSizeSplits:t,axis:n};return F.runKernel(_r,r,i)}var Wv,Gv=o((()=>{I(),N(),R(),B(),Wv=z({split_:Uv})}));function Kv(e,t){E(e.dtype===`float32`,()=>`The dtype for rfft() must be real value but got ${e.dtype}`);let n=e.shape[e.shape.length-1],r=e.size/n,i;if(t!=null&&t<n){let r=e.shape.map(e=>0),a=e.shape.map(e=>e);a[e.shape.length-1]=t,i=Vl(e,r,a),n=t}else if(t!=null&&t>n){let r=e.shape.map(e=>e);r[e.shape.length-1]=t-n,i=Ml([e,sh(r)],e.shape.length-1),n=t}else i=e;let a=Yd(i),o=Fv(W(Qa(i,a),[r,n])),s=Math.floor(n/2)+1,c=C_(o),l=Ep(o),u=Wv(c,[s,n-s],c.shape.length-1),d=Wv(l,[s,n-s],l.shape.length-1),f=i.shape.slice();return f[i.shape.length-1]=s,W(Qa(u[0],d[0]),f)}var qv,Jv=o((()=>{P(),$a(),Nl(),Dp(),B(),w_(),G(),Hl(),Gv(),ch(),Xd(),Iv(),qv=z({rfft_:Kv})}));function Yv(e,t){let n=L(e,`a`,`squaredDifference`),r=L(t,`b`,`squaredDifference`);[n,r]=wa(n,r),K(n.shape,r.shape);let i={a:n,b:r};return F.runKernel(wr,i,{})}var Xv,Zv=o((()=>{I(),N(),Aa(),R(),Vd(),B(),Xv=z({squaredDifference_:Yv})}));function Qv(e,t){let n=L(e,`x`,`squeeze`,`string_or_numeric`);return W(n,ue(n.shape,t).newShape)}var $v,ey=o((()=>{R(),P(),B(),G(),$v=z({squeeze_:Qv})}));function ty(e,t=0){let n=Ya(e,`tensors`,`stack`,`string_or_numeric`);E(n.length>=1,()=>`Pass at least one tensor to tf.stack`),n.length>0&&E(t<=n[0].rank,()=>`Axis must be <= rank of the tensor`);let r=n,i={axis:t};return F.runKernel(Rn,r,i)}var ny,ry=o((()=>{I(),N(),R(),P(),B(),ny=z({stack_:ty})}));function iy(e,t=0){let n={x:L(e,`x`,`step`)},r={alpha:t};return F.runKernel(Vr,n,r)}var ay,oy=o((()=>{I(),N(),R(),B(),ay=z({step_:iy})}));function sy(e,t,n,r,i=0,a=0,o=0,s=0,c=0){let l={x:L(e,`x`,`stridedSlice`,`string_or_numeric`)},u={begin:t,end:n,strides:r,beginMask:i,endMask:a,ellipsisMask:o,newAxisMask:s,shrinkAxisMask:c};return F.runKernel(Dr,l,u)}var cy,ly=o((()=>{I(),N(),R(),B(),cy=z({stridedSlice_:sy})}));function uy(e){let t={x:L(e,`x`,`tan`,`float32`)};return F.runKernel(`Tan`,t)}var dy,fy=o((()=>{I(),N(),R(),B(),dy=z({tan_:uy})}));function py(e,t){ee(e);let n=Ka(e,t);if(n.length!==1)throw Error(`tensor1d() requires values to be a flat/TypedArray`);return eo(e,null,n,t)}var my=o((()=>{R(),P(),to()}));function hy(e,t,n){if(ee(e),t!=null&&t.length!==2)throw Error(`tensor2d() requires shape to have two numbers`);let r=Ka(e,n);if(r.length!==2&&r.length!==1)throw Error(`tensor2d() requires values to be number[][] or flat/TypedArray`);if(r.length===1&&t==null)throw Error("tensor2d() requires shape to be provided when `values` are a flat/TypedArray");return eo(e,t,r,n)}var gy=o((()=>{R(),P(),to()}));function _y(e,t,n){if(ee(e),t!=null&&t.length!==3)throw Error(`tensor3d() requires shape to have three numbers`);let r=Ka(e,n);if(r.length!==3&&r.length!==1)throw Error(`tensor3d() requires values to be number[][][] or flat/TypedArray`);if(r.length===1&&t==null)throw Error("tensor3d() requires shape to be provided when `values` are a flat array");return eo(e,t,r,n)}var vy=o((()=>{R(),P(),to()}));function yy(e,t,n){if(ee(e),t!=null&&t.length!==4)throw Error(`tensor4d() requires shape to have four numbers`);let r=Ka(e,n);if(r.length!==4&&r.length!==1)throw Error(`tensor4d() requires values to be number[][][][] or flat/TypedArray`);if(r.length===1&&t==null)throw Error("tensor4d() requires shape to be provided when `values` are a flat array");return eo(e,t,r,n)}var by=o((()=>{R(),P(),to()}));function xy(e,t,n){if(ee(e),t!=null&&t.length!==5)throw Error(`tensor5d() requires shape to have five numbers`);let r=Ka(e,n);if(r.length!==5&&r.length!==1)throw Error(`tensor5d() requires values to be number[][][][][] or flat/TypedArray`);if(r.length===1&&t==null)throw Error("tensor5d() requires shape to be provided when `values` are a flat array");return eo(e,t,r,n)}var Sy=o((()=>{R(),P(),to()}));function Cy(e,t,n){if(ee(e),t!=null&&t.length!==6)throw Error(`tensor6d() requires shape to have six numbers`);let r=Ka(e,n);if(r.length!==6&&r.length!==1)throw Error(`tensor6d() requires values to be number[][][][][][] or flat/TypedArray`);if(r.length===1&&t==null)throw Error("tensor6d() requires shape to be provided when `values` are a flat array");return t||=r,eo(e,t,r,n)}var wy=o((()=>{R(),P(),to()})),Ty=c({calculateShapes:()=>Oy,validateInput:()=>Dy,validateUpdateShape:()=>Ey});function Ey(e,t,n){let r=t.rank>1?t.shape[t.rank-1]:1,i=t.rank>1?t.rank-1:1,a=`Must have updates.shape = indices.shape[:batchDim] + shape[sliceDim:], got updates.shape: ${n.shape}, indices.shape: ${t.shape}, shape: ${e}, sliceDim: ${r}, and batchDim: ${i}.`;if(n.rank<i)throw Error(a+` update.rank < ${i}. `);if(e.length<r+(n.rank-i))throw Error(a+` Output shape length < ${r+(n.rank-i)}`);if(n.rank!==i+e.length-r)throw Error(a+` update.rank != ${i+e.length-r}`);for(let e=0;e<i;++e)if(n.shape[e]!==t.shape[e])throw Error(a+` updates.shape[${e}] (${n.shape[e]}) != indices.shape[${e}] (${t.shape[e]}).`);for(let t=0;t<n.rank-i;++t)if(n.shape[t+i]!==e[t+r])throw Error(a+` updates.shape[${t+i}] (${n.shape[t+i]}) != shape[${t+i}] (${e[t+i]})`)}function Dy(e,t,n){if(t.rank<1)throw Error(`tf.scatterND() expects the indices to be rank 1 or higher, but the rank was ${t.rank}.`);if(e.rank<1)throw Error(`tf.scatterND() expects the updates to be rank 1 or higher, but the rank was ${e.rank}.`);if(t.dtype!==`int32`)throw Error(`The dtype of 'indices' should be int32, but got dtype: ${t.dtype}`);if(n.length<1)throw Error(`Output rank must be greater or equal to 1, but got shape: ${n}`);if(n.length===0){if(t.size===0)throw Error(`Indices specified for empty output. indices shape: ${t.shape}`);if(e.size===0)throw Error(`Updates specified for empty output. updates shape: ${e.shape}`)}Ey(n,t,e)}function Oy(e,t,n){let r=t.shape.length,i=r>1?t.shape[r-1]:1,a=n.length,o=1;for(let e=i;e<a;++e)o*=n[e];let s=i<1?1:i,c=O(t.shape)/s,l=[...j(n.slice(0,i)),1],u=O(n);return{sliceRank:i,numUpdates:c,sliceSize:o,strides:l,outputSize:u}}var ky=o((()=>{P()}));function Ay(e,t,n){let r=L(e,`tensor`,`tensorScatterupdate`),i=L(t,`indices`,`tensorScatterupdate`,`int32`),a=L(n,`updates`,`tensorScatterupdate`);if(Dy(a,i,r.shape),r.dtype!==a.dtype)throw Error(`tensor and updates must have the same dtype, instead they are ${r.dtype} and ${a.dtype}.`);let o={tensor:r,indices:i,updates:a};return F.runKernel(or,o,{})}var jy,My=o((()=>{I(),N(),R(),B(),ky(),jy=z({tensorScatterUpdate_:Ay})}));function Ny(e,t=1,n=!0){let r=L(e,`x`,`topk`);if(r.rank===0)throw Error(`topk() expects the input to be of rank 1 or higher`);let i=r.shape[r.shape.length-1];if(t<0)throw Error(`'k' passed to topk() must be >= 0 but got ${t}`);if(t>i)throw Error(`'k' passed to topk() must be <= the last dimension (${i}) but got ${t}`);let a={x:r},o={k:t,sorted:n},[s,c]=F.runKernel(Nr,a,o);return{values:s,indices:c}}var Py,Fy=o((()=>{I(),N(),R(),B(),Py=z({topk_:Ny})}));function Iy(e,t=0,n=1,r,i){if(Ae(e),r!=null&&r===`bool`)throw Error(`Unsupported data type $ { dtype }`);let a=new t_(t,n,r,!0,i),o=V(e,r);for(let e=0;e<o.values.length;e++)o.values[e]=a.nextValue();return o.toTensor()}var Ly,Ry=o((()=>{Pe(),$s(),B(),i_(),Ly=z({truncatedNormal_:Iy})}));function zy(e,t=0){let n=L(e,`x`,`unique`,`string_or_numeric`);E(n.rank>0,()=>`The input tensor must be at least 1D`);let r={x:n},i={axis:t},[a,o]=F.runKernel(Ir,r,i);return{values:a,indices:o}}var By,Vy=o((()=>{I(),N(),R(),P(),B(),By=z({unique_:zy})}));function Hy(e,t,n){let r=L(e,`x`,`unsortedSegmentSum`),i=L(t,`segmentIds`,`unsortedSegmentSum`,`int32`);E(re(n),()=>`numSegments must be of dtype int`);let a={x:r,segmentIds:i},o={numSegments:n};return F.runKernel(Rr,a,o)}var Uy,Wy=o((()=>{I(),N(),R(),P(),B(),Uy=z({unsortedSegmentSum_:Hy})}));function Gy(e,t=0){let n=L(e,`x`,`unstack`,`string_or_numeric`);E(t>=-n.shape.length&&t<n.shape.length,()=>`Axis = ${t} is not in [-${n.shape.length}, ${n.shape.length})`);let r={value:n},i={axis:t};return F.runKernel(Lr,r,i)}var Ky,qy=o((()=>{I(),N(),R(),P(),B(),Ky=z({unstack_:Gy})}));function Jy(e,t){return Hm(e,t,`right`)}var Yy=o((()=>{Um()}));function Xy(e,t=!0,n,r){return F.makeVariable(e,t,n,r)}var Zy=o((()=>{I()}));function Qy(e,t){let n=[];for(let e=0;e<t.length;e++)t[e]&&n.push(e);let r=V(e,`int32`),i=V([n.length,e.length],`int32`);for(let t=0;t<n.length;t++){let a=r.indexToLoc(n[t]),o=t*e.length;i.values.set(a,o)}return i.toTensor()}var $y=o((()=>{$s()}));async function eb(e){let t=L(e,`condition`,`whereAsync`,`bool`),n=await t.data(),r=Qy(t.shape,n);return e!==t&&t.dispose(),r}var tb,nb=o((()=>{$y(),R(),tb=eb}));async function rb(e,t,n){let r=L(e,`tensor`,`boolMask`),i=L(t,`mask`,`boolMask`,`bool`),a=n??0,o=i.rank,s=r.shape;E(o>0,()=>`mask cannot be scalar`),D(s.slice(a,a+o),i.shape,`mask's shape must match the first K dimensions of tensor's shape,`);let c=1;for(let e=a;e<a+o;e++)c*=s[e];let l=W(r,s.slice(0,a).concat([c],s.slice(a+o))),u=W(i,[-1]),d=await tb(u),f=$v(d,[1]),p=_p(l,f,a);return e!==r&&r.dispose(),t!==i&&i.dispose(),f.dispose(),l.dispose(),u.dispose(),d.dispose(),p}var ib,ab=o((()=>{R(),P(),vp(),G(),ey(),nb(),ib=rb}));function ob(e,t,n){let r=L(e,`x`,`transpose`);if(t??=r.shape.map((e,t)=>t).reverse(),E(r.rank===t.length,()=>`Error in transpose: rank of input ${r.rank} must match length of perm ${t}.`),t.forEach(e=>{E(e>=0&&e<r.rank,()=>`All entries in 'perm' must be between 0 and ${r.rank-1} but got ${t}`)}),r.rank<=1)return r.clone();let i={x:r},a={perm:t};return r.dtype===`complex64`?vo(()=>{let e=C_(r),t=Ep(r);return e=F.runKernel(Fr,{x:e},a),t=F.runKernel(Fr,{x:t},a),n&&(t=fm(t)),Qa(e,t)}):F.runKernel(Fr,i,a)}var sb,cb=o((()=>{I(),jo(),N(),R(),P(),$a(),Dp(),pm(),B(),w_(),sb=z({transpose_:ob})}));function lb(e,t,n,r,i=!0){let a=L(e,`v`,`movingAverage`),o=L(t,`x`,`movingAverage`),s=L(n,`decay`,`movingAverage`);Ta(a,o),E(k(a.shape,o.shape),()=>`Shape mismatch in v and x`);let c=Pf(1),l=q(c,s),u=U(q(o,a),l);if(i){E(r!=null,()=>`When using zeroDebias: true, step is required.`);let e=L(r,`step`,`movingAverage`);u=hc(u,q(c,Mf(s,e)))}return H(a,u)}var ub,db=o((()=>{Aa(),R(),P(),uc(),gc(),vc(),B(),Nf(),Ff(),xm(),ub=z({movingAverage_:lb})}));function fb(e,t,n){Ae(n);let r=L(e,`indices`,`scatterND`,`int32`),i=L(t,`updates`,`scatterND`);Dy(i,r,n);let a={indices:r,updates:i},o={shape:n};return F.runKernel(ar,a,o)}var pb,mb=o((()=>{I(),N(),R(),Pe(),B(),ky(),pb=z({scatterND_:fb})}));function hb(e,t,n,r){if(e.dtype!==`int32`)throw Error(`tf.sparseToDense() expects the indices to be int32 type, but the dtype was ${e.dtype}.`);if(e.rank>2)throw Error(`sparseIndices should be a scalar, vector, or matrix, but got shape ${e.shape}.`);let i=e.rank>0?e.shape[0]:1,a=e.rank>1?e.shape[1]:1;if(n.length!==a)throw Error(`outputShape has incorrect number of elements:, ${n.length}, should be: ${a}.`);let o=t.size;if(!(t.rank===0||t.rank===1&&o===i))throw Error(`sparseValues has incorrect shape ${t.shape}, should be [] or [${i}]`);if(t.dtype!==r.dtype)throw Error(`sparseValues.dtype must match defaultValues.dtype`)}var gb=o((()=>{}));function _b(e,t,n,r=0){Ae(n);let i=L(e,`sparseIndices`,`sparseToDense`,`int32`),a=L(t,`sparseValues`,`sparseToDense`,`string_or_numeric`),o=L(r,`defaultValue`,`sparseToDense`,a.dtype);hb(i,a,n,o);let s={sparseIndices:i,sparseValues:a,defaultValue:o},c={outputShape:n};return F.runKernel(Cr,s,c)}var vb,yb=o((()=>{I(),N(),gb(),R(),Pe(),B(),vb=z({sparseToDense_:_b})}));function bb(e,t){let n=L(t,`indices`,`gatherND`,`int32`),r={params:L(e,`x`,`gatherND`,`string_or_numeric`),indices:n};return F.runKernel(Qt,r)}var xb,Sb=o((()=>{I(),N(),R(),B(),xb=z({gatherND_:bb})}));function Cb(e,t){if(t==null)return e.shape.slice();if(k(e.shape,t))return t;if(e.shape.length===t.length){let n=[];for(let r=0;r<e.shape.length;r++)t[r]==null&&e.shape[r]!=null?n.push(e.shape[r]):n.push(t[r]);return n}return t}var wb=o((()=>{P()}));function Tb(e,t,n,r){let i=L(e,`x`,`dropout`);if(E(i.dtype===`float32`,()=>`x has to be a floating point tensor since it's going to be scaled, but got a ${i.dtype} tensor instead.`),E(t>=0&&t<1,()=>`rate must be a float in the range [0, 1), but got ${t}.`),t===0)return e instanceof la?i.clone():i;let a=Cb(i,n),o=1-t;return U(i,hc(mp(H(h_(a,0,1,`float32`,r),o)),o))}var Eb,Db=o((()=>{da(),R(),P(),uc(),gc(),wb(),hp(),vc(),B(),g_(),Eb=z({dropout_:Tb})}));function Ob(e){return Math.floor(2**Math.ceil(Math.log(e)/Math.log(2)))}function kb(e,t,n){let r=1-e%2,i=new Float32Array(e);for(let a=0;a<e;++a){let o=2*Math.PI*a/(e+r-1);i[a]=t-n*Math.cos(o)}return py(i,`float32`)}var Ab=o((()=>{my()}));async function jb(e,t,n=1){let r=L(e,`predictions`,`inTopK`),i=L(t,`targets`,`inTopK`);E(r.rank>1,()=>`inTopK() expects the predictions to be of rank 2 or higher, but got ${r.rank}`),E(r.rank-1===i.rank,()=>`predictions rank should be 1 larger than targets rank, but got predictions rank ${r.rank} and targets rank ${i.rank}`),D(r.shape.slice(0,r.shape.length-1),i.shape,`predictions's shape should be align with the targets' shape, except the last dimension.`);let a=r.shape[r.shape.length-1];E(n>0&&n<=a,()=>`'k' passed to inTopK() must be > 0 && <= the predictions last dimension (${a}), but got ${n}`);let o=await r.data(),s=await i.data(),[c,l]=[o.length/a,a],u=de(`bool`,c);for(let e=0;e<c;e++){let t=e*l,r=o.subarray(t,t+l),i=[];for(let e=0;e<r.length;e++)i.push({value:r[e],index:e});i.sort((e,t)=>t.value-e.value),u[e]=0;for(let t=0;t<n;t++)if(i[t].index===s[e]){u[e]=1;break}}return e!==r&&r.dispose(),t!==i&&i.dispose(),no(u,i.shape,`bool`)}var Mb,Nb=o((()=>{R(),P(),ro(),Mb=jb}));function Pb(e,t,n,r,i,a=`NHWC`,o){let s=e;e.rank===3&&(s=W(e,[1,e.shape[0],e.shape[1],e.shape[2]]));let c=t;c.rank===3&&(c=W(t,[1,t.shape[0],t.shape[1],t.shape[2]])),E(s.rank===4,()=>`Error in conv2dDerFilter: input must be rank 4, but got shape ${s.shape}.`),E(c.rank===4,()=>`Error in conv2dDerFilter: dy must be rank 4, but got shape ${c.shape}.`),E(n.length===4,()=>`Error in conv2dDerFilter: filterShape must be length 4, but got ${n}.`);let l=a===`NHWC`?s.shape[3]:s.shape[1],u=a===`NHWC`?c.shape[3]:c.shape[1];E(l===n[2],()=>`Error in conv2dDerFilter: depth of input ${l}) must match input depth in filter (${n[2]}.`),E(u===n[3],()=>`Error in conv2dDerFilter: depth of dy (${u}) must match output depth for filter (${n[3]}).`),Sl(`conv2dDerFilter`,i,o);let d={x:s,dy:c},f={strides:r,pad:i,dataFormat:a,dimRoundingMode:o,filterShape:n};return F.runKernel(xt,d,f)}var Fb,Ib=o((()=>{I(),N(),P(),Cl(),B(),G(),Fb=z({conv2DBackpropFilter_:Pb})}));function Lb(e,t,n){if(n==null||n===`linear`)return e;if(n===`relu`)return U(e,ay(t));throw Error(`Cannot compute gradient for fused activation ${n}.`)}function Rb(e,t){let n=t,r=Bd(e.shape,t.shape);return r.length>0&&(n=Uf(n,r)),W(n,e.shape)}function zb(e,t,n,r){if(t===`linear`)return e;if(t===`relu`)return k_(e);if(t===`elu`)return cf(e);if(t===`relu6`)return M_(e);if(t===`prelu`)return pg(e,n);if(t===`leakyrelu`)return Rp(e,r);if(t===`sigmoid`)return Rl(e);throw Error(`Unknown fused activation ${t}.`)}var Bb,Vb=o((()=>{Vd(),lf(),zp(),vc(),mg(),A_(),N_(),G(),zl(),oy(),Wf(),Bb=(e,t)=>!(e>0)||t===`linear`}));function Hb({x:e,filter:t,strides:n,pad:r,dataFormat:i=`NHWC`,dilations:a=[1,1],dimRoundingMode:o,bias:s,activation:c=`linear`,preluActivationWeights:l,leakyreluAlpha:u}){if(c||=`linear`,Bb(F.state.gradientDepth,c)===!1){E(i===`NHWC`,()=>`Error in fused conv2d: got dataFormat of ${i} but only NHWC is currently supported for the case of gradient depth is 0 and the activation is not linear.`);let d=Gu(e,t,n,r,i,a,o);return s!=null&&(d=H(d,s)),zb(d,c,l,u)}let d=L(e,`x`,`conv2d`,`float32`),f=L(t,`filter`,`conv2d`,`float32`),p=d,m=!1;d.rank===3&&(m=!0,p=W(d,[1,d.shape[0],d.shape[1],d.shape[2]])),E(p.rank===4,()=>`Error in fused conv2d: input must be rank 4, but got rank ${p.rank}.`),E(f.rank===4,()=>`Error in fused conv2d: filter must be rank 4, but got rank ${f.rank}.`),Sl(`fused conv2d`,r,o);let h=i===`NHWC`?p.shape[3]:p.shape[1];E(f.shape[2]===h,()=>`Error in conv2d: depth of input (${h}) must match input depth for filter ${f.shape[2]}.`),E(yl(n,a),()=>`Error in conv2D: Either strides or dilations must be 1. Got strides ${n} and dilations '${a}'`);let g=sl(p.shape,f.shape,n,a,r,o),_;s!=null&&(_=L(s,`bias`,`fused conv2d`),[_]=wa(_,d),i===`NHWC`?K(g.outShape,_.shape):(E(_.shape.length<=1,()=>`Error in fused conv2d: only supports scalar or 1-D Tensor bias for NCHW format but got the bias of rank-${_.shape.length}.`),E(_.shape.length===0||_.shape[0]===g.outChannels||_.shape[0]===1,()=>`Error in fused conv2d: bias shape (${_.shape}) is not compatible with the number of output channels (${g.outChannels})`)));let v;if(l!=null){let e=l.shape;if(E(e.length<=1||e.length===3,()=>`Error in fused conv2d: only supports scalar, 1-D Tensor or 3-D Tensor PReLU activation weights but got a tensor of rank-${e.length}.`),e.length===1)E(e[0]===1||e[0]===g.outChannels,()=>`Error in fused conv2d: PReLU activation weights (${e}) is not compatible with the number of output channels (${g.outChannels}).`);else if(e.length===3)try{K(e,g.outShape)}catch{let t=`Error in fused conv2d: PReLU activation weights (${e}) is not compatible with the output shape of the conv2d (${g.outShape}).`;throw Error(t)}v=L(l,`prelu weights`,`fused conv2d`)}let y=(e,t)=>{E(i===`NHWC`,()=>`Error in gradient of fused conv2D: got dataFormat of ${i} but only NHWC is currently supported.`);let[o,s,l,u]=t,d=Lb(e,l,c);E(vl(a),()=>`Error in gradient of fused conv2D: dilation rates greater than 1 are not yet supported in gradients. Got dilations '${a}'`);let f=[Zu(s.shape,d,o,n,r),Fb(s,d,o.shape,n,r)];if(u!=null){let e=Rb(u,d);f.push(e)}return f},b={x:p,filter:f,bias:_,preluActivationWeights:v},x={strides:n,pad:r,dataFormat:i,dilations:a,dimRoundingMode:o,activation:c,leakyreluAlpha:u};return s==null?cm((e,t,n)=>{let r=F.runKernel(Gr,b,x);return n([t,e,r]),m&&(r=W(r,[r.shape[1],r.shape[2],r.shape[3]])),{value:r,gradFunc:y}})(p,f):cm((e,t,n,r)=>{let i=F.runKernel(Gr,b,x);return r([t,e,i,n]),m&&(i=W(i,[i.shape[1],i.shape[2],i.shape[3]])),{value:i,gradFunc:y}})(p,f,_)}var Ub,Wb=o((()=>{I(),um(),N(),Aa(),R(),P(),uc(),Vd(),Ku(),Ib(),Qu(),Cl(),Vb(),B(),G(),Ub=z({fusedConv2d_:Hb})}));function Gb(e,t,n,r,i,a=[1,1],o){let s=e;e.rank===3&&(s=W(e,[1,e.shape[0],e.shape[1],e.shape[2]]));let c=t;c.rank===3&&(c=W(t,[1,t.shape[0],t.shape[1],t.shape[2]]));let l={x:s,dy:c},u={strides:r,pad:i,dimRoundingMode:o,dilations:a,filterShape:n};return F.runKernel(Nt,l,u)}var Kb,qb=o((()=>{I(),N(),B(),G(),Kb=z({depthwiseConv2dNativeBackpropFilter_:Gb})}));function Jb(e,t,n,r,i,a=[1,1],o){let s=t,c=!1;t.rank===3&&(c=!0,s=W(t,[1,t.shape[0],t.shape[1],t.shape[2]]));let l={dy:s,filter:n},u={strides:r,pad:i,dimRoundingMode:o,dilations:a,inputShape:e},d=F.runKernel(Pt,l,u);return c?W(d,[d.shape[1],d.shape[2],d.shape[3]]):d}var Yb,Xb=o((()=>{I(),N(),B(),G(),Yb=z({depthwiseConv2dNativeBackpropInput_:Jb})}));function Zb({x:e,filter:t,strides:n,pad:r,dataFormat:i=`NHWC`,dilations:a=[1,1],dimRoundingMode:o,bias:s,activation:c=`linear`,preluActivationWeights:l,leakyreluAlpha:u}){if(Bb(F.state.gradientDepth,c)===!1){let d=Ad(e,t,n,r,i,a,o);return s!=null&&(d=H(d,s)),zb(d,c,l,u)}let d=L(e,`x`,`depthwiseConv2d`,`float32`),f=L(t,`filter`,`depthwiseConv2d`,`float32`),p=d,m=!1;d.rank===3&&(m=!0,p=W(d,[1,d.shape[0],d.shape[1],d.shape[2]])),E(p.rank===4,()=>`Error in fused depthwiseConv2d: input must be rank 4, but got rank ${p.rank}.`),E(f.rank===4,()=>`Error in fused depthwiseConv2d: filter must be rank 4, but got rank ${f.rank}.`),E(p.shape[3]===f.shape[2],()=>`Error in fused depthwiseConv2d: number of input channels (${p.shape[3]}) must match the inChannels dimension in filter ${f.shape[2]}.`),a??=[1,1],E(yl(n,a),()=>`Error in fused depthwiseConv2d: Either strides or dilations must be 1. Got strides ${n} and dilations '${a}'`),Sl(`fused depthwiseConv2d`,r,o);let h=sl(p.shape,f.shape,n,a,r,o,!0),g;s!=null&&(g=L(s,`bias`,`fused conv2d`),[g]=wa(g,d),K(h.outShape,g.shape));let _;l!=null&&(_=L(l,`prelu weights`,`fused depthwiseConv2d`));let v=(e,t)=>{E(vl(a),()=>`Error in gradient of fused depthwiseConv2d: dilation rates greater than 1 are not yet supported. Got dilations '${a}'`);let[i,s,l,u]=t,d=Lb(e,l,c),f=Yb(s.shape,d,i,n,r,a,o),p=Kb(s,d,i.shape,n,r,a,o);return u==null?[f,p]:[f,p,Rb(g,d)]},y={x:p,filter:f,bias:g,preluActivationWeights:_},b={strides:n,pad:r,dataFormat:i,dilations:a,dimRoundingMode:o,activation:c,leakyreluAlpha:u};return s==null?cm((e,t,n)=>{let r=F.runKernel(Kr,y,b);return n([t,e,r]),m&&(r=W(r,[r.shape[1],r.shape[2],r.shape[3]])),{value:r,gradFunc:v}})(p,f):cm((e,t,n,r)=>{let i=F.runKernel(Kr,y,b);return r([t,e,i,n]),m&&(i=W(i,[i.shape[1],i.shape[2],i.shape[3]])),{value:i,gradFunc:v}})(p,f,g)}var Qb,$b=o((()=>{I(),um(),N(),Aa(),R(),P(),uc(),Vd(),Cl(),jd(),qb(),Xb(),Vb(),B(),G(),Qb=z({fusedDepthwiseConv2d_:Zb})}));function ex({a:e,b:t,transposeA:n=!1,transposeB:r=!1,bias:i,activation:a=`linear`,preluActivationWeights:o,leakyreluAlpha:s=.2}){if(Bb(F.state.gradientDepth,a)===!1){let c=Fl(e,t,n,r);return i!=null&&(c=H(c,i)),zb(c,a,o,s)}let c=L(e,`a`,`fused matMul`),l=L(t,`b`,`fused matMul`);[c,l]=wa(c,l);let u=n?c.shape[c.rank-2]:c.shape[c.rank-1],d=r?l.shape[l.rank-1]:l.shape[l.rank-2],f=n?c.shape[c.rank-1]:c.shape[c.rank-2],p=r?l.shape[l.rank-2]:l.shape[l.rank-1],m=c.shape.slice(0,-2),h=l.shape.slice(0,-2),g=O(m),_=O(h);E(u===d,()=>`Error in fused matMul: inner shapes (${u}) and (${d}) of Tensors with shapes ${c.shape} and ${l.shape} and transposeA=${n} and transposeB=${r} must match.`);let v=K(c.shape.slice(0,-2),l.shape.slice(0,-2)).concat([f,p]),y=n?W(c,[g,u,f]):W(c,[g,f,u]),b=r?W(l,[_,p,d]):W(l,[_,d,p]),x;i!=null&&(x=L(i,`bias`,`fused matMul`),[x]=wa(x,c),K(v,x.shape));let S;o!=null&&(S=L(o,`prelu weights`,`fused matMul`));let C=(e,t)=>{let[o,s,c,l]=t,u=Lb(W(e,c.shape),c,a),d,f;if(!n&&!r?(d=Fl(u,s,!1,!0),f=Fl(o,u,!0,!1)):!n&&r?(d=Fl(u,s,!1,!1),f=Fl(u,o,!0,!1)):n&&!r?(d=Fl(s,u,!1,!0),f=Fl(o,u,!1,!1)):(d=Fl(s,u,!0,!0),f=Fl(u,o,!0,!0)),i!=null){let e=Rb(l,u);return[d,f,e]}else return[d,f]},w={a:y,b,bias:x,preluActivationWeights:S},T={transposeA:n,transposeB:r,activation:a,leakyreluAlpha:s};return i==null?cm((e,t,n)=>{let r=F.runKernel(Wr,w,T);return n([e,t,r]),{value:W(r,v),gradFunc:C}})(y,b):cm((e,t,n,r)=>{let i=F.runKernel(Wr,w,T);return r([e,t,i,n]),{value:W(i,v),gradFunc:C}})(y,b,x)}var tx,nx=o((()=>{I(),um(),N(),Aa(),R(),P(),uc(),Vd(),Vb(),Il(),B(),G(),tx=z({fusedMatMul_:ex})})),rx=c({conv2d:()=>Ub,depthwiseConv2d:()=>Qb,matMul:()=>tx}),ix=o((()=>{Wb(),$b(),nx()}));function ax(e){return kb(e,.54,.46)}var ox,sx=o((()=>{B(),Ab(),ox=z({hammingWindow_:ax})}));function cx(e){return kb(e,.5,.5)}var lx,ux=o((()=>{B(),Ab(),lx=z({hannWindow_:cx})}));function dx(e,t,n,r=!1,i=0){let a=0,o=[];for(;a+t<=e.size;)o.push(Vl(e,a,t)),a+=n;if(r)for(;a<e.size;){let r=a+t-e.size,s=Ml([Vl(e,a,t-r),Du([r],i)]);o.push(s),a+=n}return o.length===0?hy([],[0,t]):W(Ml(o),[o.length,t])}var fx,px=o((()=>{Nl(),Ou(),B(),G(),Hl(),gy(),fx=z({frame_:dx})}));function mx(e,t,n,r,i=lx){return r??=Ob(t),qv(U(fx(e,t,n),i(t)),r)}var hx,gx=o((()=>{vc(),B(),Ab(),Jv(),px(),ux(),hx=z({stft_:mx})}));function _x(e,t,n,r,i=`bilinear`,a=0){let o=L(e,`image`,`cropAndResize`),s=L(t,`boxes`,`cropAndResize`,`float32`),c=L(n,`boxInd`,`cropAndResize`,`int32`),l=s.shape[0];E(o.rank===4,()=>`Error in cropAndResize: image must be rank 4,but got rank ${o.rank}.`),E(s.rank===2&&s.shape[1]===4,()=>`Error in cropAndResize: boxes must be have size [${l},4] but had shape ${s.shape}.`),E(c.rank===1&&c.shape[0]===l,()=>`Error in cropAndResize: boxInd must be have size [${l}] but had shape ${s.shape}.`),E(r.length===2,()=>`Error in cropAndResize: cropSize must be of length 2, but got length ${r.length}.`),E(r[0]>=1&&r[1]>=1,()=>`cropSize must be atleast [1,1], but was ${r}`),E(i===`bilinear`||i===`nearest`,()=>`method must be bilinear or nearest, but was ${i}`);let u={image:o,boxes:s,boxInd:c},d={method:i,extrapolationValue:a,cropSize:r};return F.runKernel(kt,u,d)}var vx,yx=o((()=>{I(),N(),R(),P(),B(),vx=z({cropAndResize_:_x})}));function bx(e){let t=L(e,`image`,`flipLeftRight`,`float32`);E(t.rank===4,()=>`Error in flipLeftRight: image must be rank 4,but got rank ${t.rank}.`);let n={image:t};return F.runKernel(qt,n,{})}var xx,Sx=o((()=>{I(),N(),R(),P(),B(),xx=z({flipLeftRight_:bx})}));function Cx(e){let t=L(e,`image`,`grayscaleToRGB`),n=t.rank-1,r=t.shape[n];E(t.rank>=2,()=>`Error in grayscaleToRGB: images must be at least rank 2, but got rank ${t.rank}.`),E(r===1,()=>`Error in grayscaleToRGB: last dimension of a grayscale image should be size 1, but got size ${r}.`);let i=Array(t.rank);return i.fill(1,0,n),i[n]=3,cp(t,i)}var wx,Tx=o((()=>{R(),P(),B(),lp(),wx=z({grayscaleToRGB_:Cx})}));function Ex(e){let t=L(e,`image`,`RGBToGrayscale`),n=t.rank-1,r=t.shape[n];E(t.rank>=2,()=>`Error in RGBToGrayscale: images must be at least rank 2, but got rank ${t.rank}.`),E(r===3,()=>`Error in RGBToGrayscale: last dimension of an RGB image should be size 3, but got size ${r}.`);let i=t.dtype,a=tc(t,`float32`),o=py([.2989,.587,.114]),s;switch(t.rank){case 2:s=af(`ij,j->i`,a,o);break;case 3:s=af(`ijk,k->ij`,a,o);break;case 4:s=af(`ijkl,l->ijk`,a,o);break;case 5:s=af(`ijklm,m->ijkl`,a,o);break;case 6:s=af(`ijklmn,n->ijklm`,a,o);break;default:throw Error(`Not a valid tensor rank.`)}return s=np(s,-1),tc(s,i)}var Dx,Ox=o((()=>{R(),P(),nc(),of(),rp(),B(),my(),Dx=z({rgbToGrayscale_:Ex})}));function kx(e,t,n=0,r=.5){let i=L(e,`image`,`rotateWithOffset`,`float32`);E(i.rank===4,()=>`Error in rotateWithOffset: image must be rank 4,but got rank ${i.rank}.`);let a={image:i},o={radians:t,fillValue:n,center:r};return F.runKernel(Ur,a,o)}var Ax,jx=o((()=>{I(),N(),R(),P(),B(),Ax=z({rotateWithOffset_:kx})}));function Mx(e,t,n,r,i,a){r??=.5,i??=-1/0,a??=0;let o=e.shape[0];return n=Math.min(n,o),E(0<=r&&r<=1,()=>`iouThreshold must be in [0, 1], but was '${r}'`),E(e.rank===2,()=>`boxes must be a 2D tensor, but was of rank '${e.rank}'`),E(e.shape[1]===4,()=>`boxes must have 4 columns, but 2nd dimension was ${e.shape[1]}`),E(t.rank===1,()=>`scores must be a 1D tensor`),E(t.shape[0]===o,()=>`scores has incompatible shape with boxes. Expected ${o}, but was ${t.shape[0]}`),E(0<=a&&a<=1,()=>`softNmsSigma must be in [0, 1], but was '${a}'`),{maxOutputSize:n,iouThreshold:r,scoreThreshold:i,softNmsSigma:a}}var Nx=o((()=>{P()}));function Px(e,t,n,r=.5,i=-1/0){let a=L(e,`boxes`,`nonMaxSuppression`,`float32`),o=L(t,`scores`,`nonMaxSuppression`,`float32`),s=Mx(a,o,n,r,i);n=s.maxOutputSize,r=s.iouThreshold,i=s.scoreThreshold;let c={maxOutputSize:n,iouThreshold:r,scoreThreshold:i};return F.runKernel(Nn,{boxes:a,scores:o},c)}var Fx,Ix=o((()=>{I(),N(),R(),Nx(),B(),Fx=z({nonMaxSuppression_:Px})}));function Lx(e,t,n){let r=Rx(e,t,n),i=r<0?-(r+1):r;e.splice(i,0,t)}function Rx(e,t,n){return Bx(e,t,n||zx)}function zx(e,t){return e>t?1:e<t?-1:0}function Bx(e,t,n){let r=0,i=e.length,a=0,o=!1;for(;r<i;){a=r+(i-r>>>1);let s=n(t,e[a]);s>0?r=a+1:(i=a,o=!s)}return o?r:-r-1}var Vx=o((()=>{}));function Hx(e,t,n,r,i){return Gx(e,t,n,r,i,0)}function Ux(e,t,n,r,i,a){return Gx(e,t,n,r,i,0,!1,a,!0)}function Wx(e,t,n,r,i,a){return Gx(e,t,n,r,i,a,!0)}function Gx(e,t,n,r,i,a,o=!1,s=!1,c=!1){let l=[];for(let e=0;e<t.length;e++)t[e]>i&&l.push({score:t[e],boxIndex:e,suppressBeginIndex:0});l.sort(Jx);let u=a>0?-.5/a:0,d=[],f=[];for(;d.length<n&&l.length>0;){let t=l.pop(),{score:n,boxIndex:a,suppressBeginIndex:o}=t;if(n<i)break;let s=!1;for(let n=d.length-1;n>=o;--n){let o=Kx(e,a,d[n]);if(o>=r){s=!0;break}if(t.score*=qx(r,u,o),t.score<=i)break}t.suppressBeginIndex=d.length,s||(t.score===n?(d.push(a),f.push(t.score)):t.score>i&&Lx(l,t,Jx))}let p=d.length,m=n-p;s&&m>0&&(d.push(...Array(m).fill(0)),f.push(...Array(m).fill(0)));let h={selectedIndices:d};return o&&(h.selectedScores=f),c&&(h.validOutputs=p),h}function Kx(e,t,n){let r=e.subarray(t*4,t*4+4),i=e.subarray(n*4,n*4+4),a=Math.min(r[0],r[2]),o=Math.min(r[1],r[3]),s=Math.max(r[0],r[2]),c=Math.max(r[1],r[3]),l=Math.min(i[0],i[2]),u=Math.min(i[1],i[3]),d=Math.max(i[0],i[2]),f=Math.max(i[1],i[3]),p=(s-a)*(c-o),m=(d-l)*(f-u);if(p<=0||m<=0)return 0;let h=Math.max(a,l),g=Math.max(o,u),_=Math.min(s,d),v=Math.min(c,f),y=Math.max(_-h,0)*Math.max(v-g,0);return y/(p+m-y)}function qx(e,t,n){let r=Math.exp(t*n*n);return n<=e?r:0}function Jx(e,t){return e.score-t.score||e.score===t.score&&t.boxIndex-e.boxIndex}var Yx=o((()=>{Vx()}));async function Xx(e,t,n,r=.5,i=-1/0){let a=L(e,`boxes`,`nonMaxSuppressionAsync`),o=L(t,`scores`,`nonMaxSuppressionAsync`),s=Mx(a,o,n,r,i);n=s.maxOutputSize,r=s.iouThreshold,i=s.scoreThreshold;let c=await Promise.all([a.data(),o.data()]),l=c[0],u=c[1],{selectedIndices:d}=Hx(l,u,n,r,i);return a!==e&&a.dispose(),o!==t&&o.dispose(),py(d,`int32`)}var Zx,Qx=o((()=>{Yx(),R(),Nx(),my(),Zx=Xx}));function $x(e,t,n,r=.5,i=-1/0,a=0){let o=L(e,`boxes`,`nonMaxSuppression`),s=L(t,`scores`,`nonMaxSuppression`),c=Mx(o,s,n,r,i,a);n=c.maxOutputSize,r=c.iouThreshold,i=c.scoreThreshold,a=c.softNmsSigma;let l={boxes:o,scores:s},u={maxOutputSize:n,iouThreshold:r,scoreThreshold:i,softNmsSigma:a},d=F.runKernel(Fn,l,u);return{selectedIndices:d[0],selectedScores:d[1]}}var eS,tS=o((()=>{I(),N(),R(),Nx(),B(),eS=z({nonMaxSuppressionWithScore_:$x})}));async function nS(e,t,n,r=.5,i=-1/0,a=0){let o=L(e,`boxes`,`nonMaxSuppressionAsync`),s=L(t,`scores`,`nonMaxSuppressionAsync`),c=Mx(o,s,n,r,i,a);n=c.maxOutputSize,r=c.iouThreshold,i=c.scoreThreshold,a=c.softNmsSigma;let l=await Promise.all([o.data(),s.data()]),u=l[0],d=l[1],{selectedIndices:f,selectedScores:p}=Wx(u,d,n,r,i,a);return o!==e&&o.dispose(),s!==t&&s.dispose(),{selectedIndices:py(f,`int32`),selectedScores:py(p)}}var rS,iS=o((()=>{Yx(),R(),Nx(),my(),rS=nS}));function aS(e,t,n,r=.5,i=-1/0,a=!1){let o=L(e,`boxes`,`nonMaxSuppression`),s=L(t,`scores`,`nonMaxSuppression`),c=Mx(o,s,n,r,i,null),l=c.maxOutputSize,u=c.iouThreshold,d=c.scoreThreshold,f={boxes:o,scores:s},p={maxOutputSize:l,iouThreshold:u,scoreThreshold:d,padToMaxOutputSize:a},m=F.runKernel(Pn,f,p);return{selectedIndices:m[0],validOutputs:m[1]}}var oS,sS=o((()=>{I(),N(),R(),Nx(),B(),oS=z({nonMaxSuppressionPadded_:aS})}));async function cS(e,t,n,r=.5,i=-1/0,a=!1){let o=L(e,`boxes`,`nonMaxSuppressionAsync`),s=L(t,`scores`,`nonMaxSuppressionAsync`),c=Mx(o,s,n,r,i,null),l=c.maxOutputSize,u=c.iouThreshold,d=c.scoreThreshold,[f,p]=await Promise.all([o.data(),s.data()]),{selectedIndices:m,validOutputs:h}=Ux(f,p,l,u,d,a);return o!==e&&o.dispose(),s!==t&&s.dispose(),{selectedIndices:py(m,`int32`),validOutputs:Pf(h,`int32`)}}var lS,uS=o((()=>{Yx(),R(),Nx(),Ff(),my(),lS=cS}));function dS(e,t,n=!1,r=!1){let i=L(e,`images`,`resizeBilinear`);E(i.rank===3||i.rank===4,()=>`Error in resizeBilinear: x must be rank 3 or 4, but got rank ${i.rank}.`),E(t.length===2,()=>`Error in resizeBilinear: new shape must 2D, but got shape ${t}.`),E(r===!1||n===!1,()=>`Error in resizeBilinear: If halfPixelCenters is true, alignCorners must be false.`);let a=i,o=!1;i.rank===3&&(o=!0,a=W(i,[1,i.shape[0],i.shape[1],i.shape[2]]));let[]=t,s={images:a},c={alignCorners:n,halfPixelCenters:r,size:t},l=F.runKernel($n,s,c);return o?W(l,[l.shape[1],l.shape[2],l.shape[3]]):l}var fS,pS=o((()=>{I(),N(),R(),P(),B(),G(),fS=z({resizeBilinear_:dS})}));function mS(e,t,n=!1,r=!1){let i=L(e,`images`,`resizeNearestNeighbor`);E(i.rank===3||i.rank===4,()=>`Error in resizeNearestNeighbor: x must be rank 3 or 4, but got rank ${i.rank}.`),E(t.length===2,()=>`Error in resizeNearestNeighbor: new shape must 2D, but got shape ${t}.`),E(i.dtype===`float32`||i.dtype===`int32`,()=>"`images` must have `int32` or `float32` as dtype"),E(r===!1||n===!1,()=>`Error in resizeNearestNeighbor: If halfPixelCenters is true, alignCorners must be false.`);let a=i,o=!1;i.rank===3&&(o=!0,a=W(i,[1,i.shape[0],i.shape[1],i.shape[2]]));let[]=t,s={images:a},c={alignCorners:n,halfPixelCenters:r,size:t},l=F.runKernel(Zn,s,c);return o?W(l,[l.shape[1],l.shape[2],l.shape[3]]):l}var hS,gS=o((()=>{I(),N(),R(),P(),B(),G(),hS=z({resizeNearestNeighbor_:mS})}));function _S(e,t=`binary`,n=!1,r=.5){let i=L(e,`image`,`threshold`),a=i.shape[0]*i.shape[1],o=U(py([r]),255),s,c,l,u;if(E(i.rank===3,()=>`Error in threshold: image must be rank 3,but got rank ${i.rank}.`),E(i.shape[2]===3||i.shape[2]===1,()=>`Error in threshold: image color channel must be equal to 3 or 1but got ${i.shape[2]}.`),E(i.dtype===`int32`||i.dtype===`float32`,()=>`Error in dtype: image dtype must be int32 or float32,but got dtype ${i.dtype}.`),E(t===`otsu`||t===`binary`,()=>`Method must be binary or otsu, but was ${t}`),i.shape[2]===3){[s,c,l]=Wv(i,[1,1,1],-1);let e=U(s,.2989),t=U(c,.587),n=U(l,.114);u=H(H(e,t),n)}else u=e;return t===`otsu`&&(o=vS(pu(tc(X_(u),`int32`),no([]),256),a)),tc(U(n?Wp(u,o):bp(u,o),255),`int32`)}function vS(e,t){let n=py([-1]),r=py([0]),i=py([0]),a,o,s,c,l,u;for(let d=0;d<e.size-1;d++){a=Vl(e,0,d+1),o=Vl(e,d+1),l=hc(Uf(a),t),u=hc(Uf(o),t),s=hc(Uf(U(a,b_(0,a.size))),Uf(a));let f=Du(o.shape,a.size),p=H(b_(0,o.size),f);c=hc(Uf(U(o,p)),Uf(o));let m=q(s,c),h=q(s,c);i=U(U(U(l,u),m),h);let g=bp(i,r);r=Kd(g,i,r),n=Kd(g,py([d]),n)}return n}var yS,bS=o((()=>{my(),B(),nc(),Gv(),mu(),Gp(),xp(),Wf(),uc(),vc(),gc(),xm(),Z_(),qd(),Ou(),Hl(),x_(),ro(),P(),R(),yS=z({threshold_:_S})}));function xS(e,t,n=`nearest`,r=`constant`,i=0,a){let o=L(e,`image`,`transform`,`float32`),s=L(t,`transforms`,`transform`,`float32`);E(o.rank===4,()=>`Error in transform: image must be rank 4,but got rank ${o.rank}.`),E(s.rank===2&&(s.shape[0]===o.shape[0]||s.shape[0]===1)&&s.shape[1]===8,()=>`Error in transform: Input transform should be batch x 8 or 1 x 8`),E(a==null||a.length===2,()=>`Error in transform: outputShape must be [height, width] or null, but got ${a}.`);let c={image:o,transforms:s},l={interpolation:n,fillMode:r,fillValue:i,outputShape:a};return F.runKernel(Pr,c,l)}var SS,CS=o((()=>{I(),N(),R(),P(),B(),SS=z({transform_:xS})}));function wS(e,t,n){let r=L(e,`a`,`bandPart`);E(r.rank>=2,()=>`bandPart(): Rank must be at least 2, got ${r.rank}.`);let i=r.shape,[a,o]=r.shape.slice(-2),s,c;typeof t==`number`?(E(t%1==0,()=>`bandPart(): numLower must be an integer, got ${t}.`),E(t<=a,()=>`bandPart(): numLower (${t}) must not be greater than the number of rows (${a}).`),s=L(t<0?a:t,`numLower`,`bandPart`)):(E(t.dtype===`int32`,()=>`bandPart(): numLower's dtype must be an int32.`),s=Kd(Vp(t,0),a,mh(t,a))),typeof n==`number`?(E(n%1==0,()=>`bandPart(): numUpper must be an integer, got ${n}.`),E(n<=o,()=>`bandPart(): numUpper (${n}) must not be greater than the number of columns (${o}).`),c=L(n<0?o:n,`numUpper`,`bandPart`)):(E(n.dtype===`int32`,()=>`bandPart(): numUpper's dtype must be an int32.`),c=Kd(Vp(n,0),o,mh(n,o)));let l=q(W(b_(0,a,1,`int32`),[-1,1]),b_(0,o,1,`int32`)),u=km(Wp(l,s),Cp(l,fm(c))),d=sh([a,o],r.dtype);return W(ny(Ky(W(r,[-1,a,o])).map(e=>Kd(u,e,d))),i)}var TS,ES=o((()=>{R(),P(),wp(),Hp(),Gp(),Am(),hh(),pm(),B(),x_(),G(),ry(),xm(),qy(),qd(),ch(),TS=z({bandPart_:wS})}));function DS(e){let t;if(Array.isArray(e)){t=!1,E(e!=null&&e.length>0,()=>`Gram-Schmidt process: input must not be null, undefined, or empty`);let n=e[0].shape[0];for(let t=1;t<e.length;++t)E(e[t].shape[0]===n,()=>`Gram-Schmidt: Non-unique lengths found in the input vectors: (${e[t].shape[0]} vs. ${n})`)}else t=!0,e=Wv(e,e.shape[0],0).map(e=>$v(e,[0]));E(e.length<=e[0].shape[0],()=>`Gram-Schmidt: Number of vectors (${e.length}) exceeds number of dimensions (${e[0].shape[0]}).`);let n=[],r=e;for(let t=0;t<e.length;++t)n.push(F.tidy(()=>{let e=r[t];if(t>0)for(let r=0;r<t;++r){let t=U(Uf(U(n[r],e)),n[r]);e=q(e,t)}return hc(e,qf(e,`euclidean`))}));return t?ny(n,0):n}var OS,kS=o((()=>{I(),P(),gc(),vc(),Jf(),B(),Gv(),ey(),ry(),xm(),Wf(),OS=z({gramSchmidt_:DS})}));function AS(e,t=!1){if(E(e.rank>=2,()=>`qr() requires input tensor to have a rank >= 2, but got rank ${e.rank}`),e.rank===2)return jS(e,t);{let n=Ky(W(e,[e.shape.slice(0,e.shape.length-2).reduce((e,t)=>e*t),e.shape[e.shape.length-2],e.shape[e.shape.length-1]]),0),r=[],i=[];return n.forEach(e=>{let[n,a]=jS(e,t);r.push(n),i.push(a)}),[W(ny(r,0),e.shape),W(ny(i,0),e.shape)]}}function jS(e,t=!1){return F.tidy(()=>{E(e.shape.length===2,()=>`qr2d() requires a 2D Tensor, but got a ${e.shape.length}D Tensor.`);let n=e.shape[0],r=e.shape[1],i=dp(n),a=ic(e),o=hy([[1]],[1,1]),s=ic(o),c=n>=r?r:n;for(let e=0;e<c;++e){let t=a,c=s,l=i;[s,a,i]=F.tidy(()=>{let t=Vl(a,[e,e],[n-e,1]),c=qf(t),l=Vl(a,[e,e],[1,1]),u=Kd(bp(l,0),hy([[-1]]),hy([[1]])),d=q(l,U(u,c)),f=hc(t,d);s=f.shape[0]===1?ic(o):Ml([o,Vl(f,[1,0],[f.shape[0]-1,f.shape[1]])],0);let p=fm(hc(Fl(u,d),c)),m=Vl(a,[e,0],[n-e,r]),h=U(p,s),g=sb(s);if(e===0)a=q(m,Fl(h,Fl(g,m)));else{let t=q(m,Fl(h,Fl(g,m)));a=Ml([Vl(a,[0,0],[e,r]),t],0)}let _=sb(h),v=Vl(i,[0,e],[n,i.shape[1]-e]);if(e===0)i=q(v,Fl(Fl(v,s),_));else{let t=q(v,Fl(Fl(v,s),_));i=Ml([Vl(i,[0,0],[n,e]),t],1)}return[s,a,i]}),yo([t,c,l])}return!t&&n>r&&(i=Vl(i,[0,0],[n,r]),a=Vl(a,[0,0],[r,r])),[i,a]})}var MS,NS=o((()=>{I(),jo(),P(),ac(),Nl(),gc(),fp(),xp(),Il(),vc(),pm(),Jf(),B(),G(),Hl(),ry(),xm(),gy(),cb(),qy(),qd(),MS=z({qr_:AS})})),PS,FS=o((()=>{(function(e){e[e.NONE=0]=`NONE`,e[e.MEAN=1]=`MEAN`,e[e.SUM=2]=`SUM`,e[e.SUM_BY_NONZERO_WEIGHTS=3]=`SUM_BY_NONZERO_WEIGHTS`})(PS||={})}));function IS(e,t,n=PS.SUM_BY_NONZERO_WEIGHTS){let r=L(e,`losses`,`computeWeightedLoss`),i=null;t!=null&&(i=L(t,`weights`,`computeWeightedLoss`));let a=i==null?r:U(r,i);if(n===PS.NONE)return a;if(n===PS.SUM)return Uf(a);if(n===PS.MEAN){if(i==null)return ah(a);{let e=r.size/i.size,t=hc(Uf(a),Uf(i));return e>1?hc(t,Pf(e)):t}}if(n===PS.SUM_BY_NONZERO_WEIGHTS){if(i==null)return hc(Uf(a),Pf(r.size));{let e=tc(Uf(Mh(U(i,lh(r.shape)),Pf(0))),`float32`);return hc(Uf(a),e)}}throw Error(`Unknown reduction: ${n}`)}var LS,RS=o((()=>{R(),nc(),gc(),FS(),oh(),vc(),Nh(),uh(),B(),Ff(),Wf(),LS=z({computeWeightedLoss_:IS})}));function zS(e,t,n,r=PS.SUM_BY_NONZERO_WEIGHTS){let i=L(e,`labels`,`absoluteDifference`),a=L(t,`predictions`,`absoluteDifference`),o=null;return n!=null&&(o=L(n,`weights`,`absoluteDifference`)),D(i.shape,a.shape,`Error in absoluteDifference: `),LS(bc(q(i,a)),o,r)}var BS,VS=o((()=>{R(),P(),xc(),FS(),B(),xm(),RS(),BS=z({absoluteDifference_:zS})}));function HS(e,t,n,r,i=PS.SUM_BY_NONZERO_WEIGHTS){let a=L(e,`labels`,`cosineDistance`),o=L(t,`predictions`,`cosineDistance`),s=null;return r!=null&&(s=L(r,`weights`,`cosineDistance`)),D(a.shape,o.shape,`Error in cosineDistance: `),LS(q(Pf(1),Uf(U(a,o),n,!0)),s,i)}var US,WS=o((()=>{R(),P(),FS(),vc(),B(),Ff(),xm(),Wf(),RS(),US=z({cosineDistance_:HS})}));function GS(e,t,n,r=PS.SUM_BY_NONZERO_WEIGHTS){let i=L(e,`labels`,`hingeLoss`),a=L(t,`predictions`,`hingeLoss`),o=null;n!=null&&(o=L(n,`weights`,`hingeLoss`)),D(i.shape,a.shape,`Error in hingeLoss: `);let s=Pf(1);return i=q(U(Pf(2),i),s),LS(k_(q(s,U(i,a))),o,r)}var KS,qS=o((()=>{R(),P(),FS(),vc(),B(),A_(),Ff(),xm(),RS(),KS=z({hingeLoss_:GS})}));function JS(e,t,n,r=1,i=PS.SUM_BY_NONZERO_WEIGHTS){let a=L(e,`labels`,`huberLoss`),o=L(t,`predictions`,`huberLoss`),s=null;n!=null&&(s=L(n,`weights`,`huberLoss`)),D(a.shape,o.shape,`Error in huberLoss: `);let c=Pf(r),l=bc(q(o,a)),u=mh(l,c),d=q(l,u);return LS(H(U(Pf(.5),Bf(u)),U(c,d)),s,i)}var YS,XS=o((()=>{R(),P(),xc(),uc(),FS(),hh(),vc(),B(),Ff(),Vf(),xm(),RS(),YS=z({huberLoss_:JS})}));function ZS(e,t,n,r=1e-7,i=PS.SUM_BY_NONZERO_WEIGHTS){let a=L(e,`labels`,`logLoss`),o=L(t,`predictions`,`logLoss`),s=null;n!=null&&(s=L(n,`weights`,`logLoss`)),D(a.shape,o.shape,`Error in logLoss: `);let c=Pf(1),l=Pf(r);return LS(q(fm(U(a,Qp(H(o,l)))),U(q(c,a),Qp(H(q(c,o),l)))),s,i)}var QS,$S=o((()=>{R(),P(),uc(),$p(),FS(),vc(),pm(),B(),Ff(),xm(),RS(),QS=z({logLoss_:ZS})}));function eC(e,t,n,r=PS.SUM_BY_NONZERO_WEIGHTS){let i=L(e,`labels`,`meanSquaredError`),a=L(t,`predictions`,`meanSquaredError`),o=null;return n!=null&&(o=L(n,`weights`,`meanSquaredError`)),D(i.shape,a.shape,`Error in meanSquaredError: `),LS(Xv(i,a),o,r)}var tC,nC=o((()=>{R(),P(),FS(),B(),Zv(),RS(),tC=z({meanSquaredError_:eC})}));function rC(e,t){let n=L(e,`labels`,`sigmoidCrossEntropyWithLogits`),r=L(t,`logits`,`sigmoidCrossEntropyWithLogits`);D(n.shape,r.shape,`Error in sigmoidCrossEntropyWithLogits: `);let i=k_(r),a=U(r,n),o=tm($f(fm(bc(r))));return H(q(i,a),o)}function iC(e,t,n,r=0,i=PS.SUM_BY_NONZERO_WEIGHTS){let a=L(e,`multiClassLabels`,`sigmoidCrossEntropy`),o=L(t,`logits`,`sigmoidCrossEntropy`),s=null;if(n!=null&&(s=L(n,`weights`,`sigmoidCrossEntropy`)),D(a.shape,o.shape,`Error in sigmoidCrossEntropy: `),r>0){let e=Pf(r),t=Pf(1),n=Pf(.5);a=H(U(a,q(t,e)),U(n,e))}return LS(rC(a,o),s,i)}var aC,oC=o((()=>{R(),P(),xc(),uc(),ep(),nm(),FS(),vc(),pm(),B(),A_(),Ff(),xm(),RS(),aC=z({sigmoidCrossEntropy_:iC})}));function sC(e,t,n=-1){if(n===-1&&(n=t.rank-1),n!==t.rank-1)throw Error(`Softmax cross entropy along a non-last dimension is not yet supported. Labels / logits was rank ${t.rank} and dim was ${n}`);return cm((e,t,r)=>{let i=Em(t,[n],!0),a=q(tc(t,`float32`),i);return r([e,a]),{value:Uf(fm(U(a,e)),[n]),gradFunc:(e,t)=>{let[r,i]=t,a=yf(e.shape,[n]);return[U(W(e,a),q(tc(r,`float32`),$f(i))),U(W(e,a),q($f(i),tc(r,`float32`)))]}}})(e,t)}function cC(e,t,n,r=0,i=PS.SUM_BY_NONZERO_WEIGHTS){let a=L(e,`onehotLabels`,`softmaxCrossEntropy`),o=L(t,`logits`,`softmaxCrossEntropy`),s=null;if(n!=null&&(s=L(n,`weights`,`softmaxCrossEntropy`)),D(a.shape,o.shape,`Error in softmaxCrossEntropy: `),r>0){let e=Pf(r),t=Pf(1),n=Pf(a.shape[1]);a=H(U(a,q(t,e)),hc(e,n))}return LS(sC(a,o),s,i)}var lC,uC=o((()=>{um(),R(),P(),uc(),wf(),nc(),gc(),ep(),Dm(),FS(),vc(),pm(),B(),G(),Ff(),xm(),Wf(),RS(),lC=z({softmaxCrossEntropy_:cC})}));function dC(e,t,n,r){let i=L(e,`indices`,`sparseFillEmptyRows`,`int32`),a=L(t,`values`,`sparseFillEmptyRows`),o=L(n,`denseShape`,`sparseFillEmptyRows`,`int32`),s=L(r,`defaultValue`,`sparseFillEmptyRows`,a.dtype);if(i.rank!==2)throw Error(`Indices should be Tensor2D but received shape
        ${i.shape}`);if(a.rank!==1)throw Error(`Values should be Tensor1D but received shape ${a.shape}`);if(o.rank!==1)throw Error(`Dense shape should be Tensor1D but received shape ${o.shape}`);if(s.rank!==0)throw Error(`Default value should be a scalar but received shape ${s.shape}`);let c={indices:i,values:a,denseShape:o,defaultValue:s},l=F.runKernel(yr,c);return{outputIndices:l[0],outputValues:l[1],emptyRowIndicator:l[2],reverseIndexMap:l[3]}}var fC,pC=o((()=>{I(),N(),R(),B(),fC=z({sparseFillEmptyRows_:dC})}));function mC(e,t,n){let r=L(e,`inputIndices`,`sparseReshape`,`int32`),i=L(t,`inputShape`,`sparseReshape`,`int32`),a=L(n,`newShape`,`sparseReshape`,`int32`);if(r.rank!==2)throw Error(`Input indices should be Tensor2D but received shape
        ${r.shape}`);if(i.rank!==1)throw Error(`Input shape should be Tensor1D but received shape ${i.shape}`);if(a.rank!==1)throw Error(`New shape should be Tensor1D but received shape ${a.shape}`);let o={inputIndices:r,inputShape:i,newShape:a},s=F.runKernel(br,o);return{outputIndices:s[0],outputShape:s[1]}}var hC,gC=o((()=>{I(),N(),R(),B(),hC=z({sparseReshape_:mC})}));function _C(e,t,n){let r=L(e,`data`,`sparseSegmentMean`),i=L(t,`indices`,`sparseSegmentMean`,`int32`),a=L(n,`segmentIds`,`sparseSegmentMean`,`int32`);if(r.rank<1)throw Error(`Data should be at least 1 dimensional but received scalar`);if(i.rank!==1)throw Error(`Indices should be Tensor1D but received shape
          ${i.shape}`);if(a.rank!==1)throw Error(`Segment ids should be Tensor1D but received shape
          ${a.shape}`);let o={data:r,indices:i,segmentIds:a};return F.runKernel(xr,o)}var vC,yC=o((()=>{I(),N(),R(),B(),vC=z({sparseSegmentMean_:_C})}));function bC(e,t,n){let r=L(e,`data`,`sparseSegmentSum`),i=L(t,`indices`,`sparseSegmentSum`,`int32`),a=L(n,`segmentIds`,`sparseSegmentSum`,`int32`);if(r.rank<1)throw Error(`Data should be at least 1 dimensional but received scalar`);if(i.rank!==1)throw Error(`Indices should be Tensor1D but received shape
         ${i.shape}`);if(a.rank!==1)throw Error(`Segment ids should be Tensor1D but received shape
         ${a.shape}`);let o={data:r,indices:i,segmentIds:a};return F.runKernel(Sr,o)}var xC,SC=o((()=>{I(),N(),R(),B(),xC=z({sparseSegmentSum_:bC})}));function CC(e,t,n,r,i,a,o,s){let c=L(e,`data`,`stringNGrams`,`string`);if(c.dtype!==`string`)throw Error(`Data must be of datatype string`);if(c.shape.length!==1)throw Error(`Data must be a vector, saw: ${c.shape}`);let l=L(t,`dataSplits`,`stringNGrams`);if(l.dtype!==`int32`)throw Error(`Data splits must be of datatype int32`);let u={separator:n,nGramWidths:r,leftPad:i,rightPad:a,padWidth:o,preserveShortSequences:s},d={data:c,dataSplits:l},f=F.runKernel(Or,d,u);return{nGrams:f[0],nGramsSplits:f[1]}}var wC,TC=o((()=>{I(),N(),R(),B(),wC=z({stringNGrams_:CC})}));function EC(e,t,n=!0){let r=L(e,`input`,`stringSplit`,`string`),i=L(t,`delimiter`,`stringSplit`,`string`);if(r.rank!==1)throw Error(`Input should be Tensor1D but received shape ${r.shape}`);if(i.rank!==0)throw Error(`Delimiter should be a scalar but received shape ${i.shape}`);let a={skipEmpty:n},o={input:r,delimiter:i},s=F.runKernel(kr,o,a);return{indices:s[0],values:s[1],shape:s[2]}}var DC,OC=o((()=>{I(),N(),R(),B(),DC=z({stringSplit_:EC})}));function kC(e,t){let n=L(e,`input`,`stringToHashBucketFast`,`string`),r={numBuckets:t};if(t<=0)throw Error(`Number of buckets must be at least 1`);let i={input:n};return F.runKernel(Ar,i,r)}var AC,jC=o((()=>{I(),N(),R(),B(),AC=z({stringToHashBucketFast_:kC})}));function MC(e,t,n,r=!0){let i=L(e,`input`,`staticRegexReplace`,`string`),a={pattern:t,rewrite:n,replaceGlobal:r};return F.runKernel(Er,{x:i},a)}var NC,PC=o((()=>{I(),N(),R(),B(),NC=z({staticRegexReplace_:MC})})),FC,IC,LC,RC,zC,BC,VC,HC=o((()=>{xc(),wc(),Dc(),uc(),Ac(),Nc(),Ic(),zc(),Hc(),Gc(),Jc(),Zc(),el(),rl(),Dl(),Al(),Jl(),Zl(),nu(),au(),cu(),du(),mu(),_u(),bu(),Cu(),$s(),nc(),Eu(),ju(),ac(),$a(),Nl(),Pu(),Lu(),Bu(),Uu(),Yu(),Ku(),td(),id(),ud(),pd(),gd(),yd(),Sd(),Td(),Od(),jd(),Pd(),Ld(),gc(),$d(),nf(),of(),lf(),ff(),Wd(),hf(),Zf(),ep(),rp(),op(),fp(),Ou(),hp(),pc(),vp(),xp(),wp(),Dp(),Ap(),Np(),Ip(),zp(),Hp(),Gp(),qp(),Xp(),$p(),nm(),ym(),wm(),Dm(),Am(),Nm(),Im(),zm(),Gm(),Il(),Df(),Jm(),Zm(),eh(),rh(),oh(),fh(),Af(),hh(),vh(),xh(),wh(),vc(),Dh(),Ah(),pm(),Nh(),Ih(),uh(),zh(),Hh(),Gh(),Jh(),Zh(),eg(),rg(),dg(),Nf(),mg(),sc(),_g(),bg(),Cg(),Eg(),kg(),s_(),u_(),p_(),g_(),y_(),x_(),w_(),D_(),A_(),N_(),G(),I_(),z_(),H_(),G_(),J_(),Z_(),ev(),Ff(),rv(),ov(),lv(),zl(),fv(),hv(),vv(),Hl(),xv(),wv(),Dv(),Av(),Nv(),gm(),og(),Iv(),zv(),Hv(),Jv(),Gv(),Rf(),Vf(),Zv(),ey(),ry(),oy(),ly(),xm(),Wf(),fy(),Gl(),ro(),my(),gy(),vy(),by(),Sy(),wy(),My(),lp(),Fy(),Ry(),Vy(),Wy(),qy(),Yy(),Zy(),qd(),nb(),ch(),Xd(),ab(),cb(),Jf(),db(),mb(),Um(),yb(),Sb(),Db(),Ab(),Nb(),B(),ix(),sx(),ux(),px(),gx(),yx(),Sx(),Tx(),Ox(),jx(),Ix(),Qx(),tS(),iS(),sS(),uS(),pS(),gS(),bS(),CS(),ES(),kS(),NS(),VS(),RS(),WS(),qS(),XS(),$S(),nC(),oC(),uC(),pC(),gC(),yC(),SC(),TC(),OC(),jC(),PC(),FC={fft:Fv,ifft:Rv,rfft:qv,irfft:Vv},IC={hammingWindow:ox,hannWindow:lx,frame:fx,stft:hx},LC={flipLeftRight:xx,grayscaleToRGB:wx,resizeNearestNeighbor:hS,resizeBilinear:fS,rgbToGrayscale:Dx,rotateWithOffset:Ax,cropAndResize:vx,nonMaxSuppression:Fx,nonMaxSuppressionAsync:Zx,nonMaxSuppressionWithScore:eS,nonMaxSuppressionWithScoreAsync:rS,nonMaxSuppressionPadded:oS,nonMaxSuppressionPaddedAsync:lS,threshold:yS,transform:SS},RC={bandPart:TS,gramSchmidt:OS,qr:MS},zC={absoluteDifference:BS,computeWeightedLoss:LS,cosineDistance:US,hingeLoss:KS,huberLoss:YS,logLoss:QS,meanSquaredError:tC,sigmoidCrossEntropy:aC,softmaxCrossEntropy:lC},BC={sparseFillEmptyRows:fC,sparseReshape:hC,sparseSegmentMean:vC,sparseSegmentSum:xC},VC={stringNGrams:wC,stringSplit:DC,stringToHashBucketFast:AC,staticRegexReplace:NC}})),UC=c({Serializable:()=>JC,SerializationMap:()=>YC,getRegisteredName:()=>GC,registerClass:()=>WC});function WC(e,t,n){E(e.className!=null,()=>`Class being registered does not have the static className property defined.`),E(typeof e.className==`string`,()=>`className is required to be a string, but got type `+typeof e.className),E(e.className.length>0,()=>`Class being registered has an empty-string as its className, which is disallowed.`),t===void 0&&(t=`Custom`),n===void 0&&(n=e.className);let r=n,i=t+`>`+r;return YC.register(e),KC.set(i,e),qC.set(e,i),e}function GC(e){return qC.has(e)?qC.get(e):e.className}var KC,qC,JC,YC,XC=o((()=>{P(),KC=new Map,qC=new Map,JC=class{getClassName(){return this.constructor.className}static fromConfig(e,t){return new e(t)}},YC=class e{constructor(){this.classNameMap={}}static getMap(){return e.instance??=new e,e.instance}static register(t){e.getMap().classNameMap[t.className]=[t,t.fromConfig]}}})),ZC,QC=o((()=>{jo(),um(),HC(),XC(),ZC=class extends JC{minimize(e,t=!1,n){let{value:r,grads:i}=this.computeGradients(e,n);if(n!=null){let e=n.map(e=>({name:e.name,tensor:i[e.name]}));this.applyGradients(e)}else this.applyGradients(i);return yo(i),t?r:(r.dispose(),null)}get iterations(){return this.iterations_??=0,this.iterations_}incrementIterations(){this.iterations_=this.iterations+1}computeGradients(e,t){return sm(e,t)}dispose(){this.iterations_!=null&&yo(this.iterations_)}async saveIterations(){return this.iterations_??=0,{name:`iter`,tensor:Pf(this.iterations_,`int32`)}}async getWeights(){throw Error(`getWeights() is not implemented for this optimizer yet.`)}async setWeights(e){throw Error(`setWeights() is not implemented for this optimizer class ${this.getClassName()}`)}async extractIterations(e){return this.iterations_=(await e[0].tensor.data())[0],e.slice(1)}},Object.defineProperty(ZC,Symbol.hasInstance,{value:e=>e.minimize!=null&&e.computeGradients!=null&&e.applyGradients!=null})})),$C,ew=o((()=>{I(),jo(),uc(),gc(),vc(),HC(),Vf(),Xd(),QC(),$C=class extends ZC{static get className(){return`Adadelta`}constructor(e,t,n=null){super(),this.learningRate=e,this.rho=t,this.epsilon=n,this.accumulatedGrads=[],this.accumulatedUpdates=[],n??(this.epsilon=F.backend.epsilon())}applyGradients(e){(Array.isArray(e)?e.map(e=>e.name):Object.keys(e)).forEach((t,n)=>{let r=F.registeredVariables[t];this.accumulatedGrads[n]??(this.accumulatedGrads[n]={originalName:`${t}/accum_grad`,variable:vo(()=>Yd(r).variable(!1))}),this.accumulatedUpdates[n]??(this.accumulatedUpdates[n]={originalName:`${t}/accum_var`,variable:vo(()=>Yd(r).variable(!1))});let i=Array.isArray(e)?e[n].tensor:e[t];if(i==null)return;let a=this.accumulatedGrads[n].variable,o=this.accumulatedUpdates[n].variable;vo(()=>{let e=H(U(a,this.rho),U(Bf(i),1-this.rho)),t=U(hc(Lf(H(o,this.epsilon)),Lf(H(a,this.epsilon))),i),n=H(U(o,this.rho),U(Bf(t),1-this.rho));a.assign(e),o.assign(n);let s=H(U(t,-this.learningRate),r);r.assign(s)})}),this.incrementIterations()}dispose(){this.accumulatedUpdates!=null&&(yo(this.accumulatedGrads.map(e=>e.variable)),yo(this.accumulatedUpdates.map(e=>e.variable)))}async getWeights(){let e=[...this.accumulatedGrads,...this.accumulatedUpdates];return[await this.saveIterations()].concat(e.map(e=>({name:e.originalName,tensor:e.variable})))}async setWeights(e){e=await this.extractIterations(e);let t=e.length/2;this.accumulatedGrads=e.slice(0,t).map(e=>({originalName:e.name,variable:e.tensor.variable(!1)})),this.accumulatedUpdates=e.slice(t,t*2).map(e=>({originalName:e.name,variable:e.tensor.variable(!1)}))}getConfig(){return{learningRate:this.learningRate,rho:this.rho,epsilon:this.epsilon}}static fromConfig(e,t){return new e(t.learningRate,t.rho,t.epsilon)}}})),tw,nw=o((()=>{I(),jo(),uc(),gc(),Ou(),vc(),Rf(),Vf(),QC(),tw=class extends ZC{static get className(){return`Adagrad`}constructor(e,t=.1){super(),this.learningRate=e,this.initialAccumulatorValue=t,this.accumulatedGrads=[]}applyGradients(e){(Array.isArray(e)?e.map(e=>e.name):Object.keys(e)).forEach((t,n)=>{let r=F.registeredVariables[t];this.accumulatedGrads[n]??(this.accumulatedGrads[n]={originalName:`${t}/accumulator`,variable:vo(()=>Du(r.shape,this.initialAccumulatorValue).variable(!1))});let i=Array.isArray(e)?e[n].tensor:e[t];if(i==null)return;let a=this.accumulatedGrads[n].variable;vo(()=>{let e=H(a,Bf(i));a.assign(e);let t=H(U(hc(i,Lf(H(e,F.backend.epsilon()))),-this.learningRate),r);r.assign(t)})}),this.incrementIterations()}dispose(){this.accumulatedGrads!=null&&yo(this.accumulatedGrads.map(e=>e.variable))}async getWeights(){return[await this.saveIterations()].concat(this.accumulatedGrads.map(e=>({name:e.originalName,tensor:e.variable})))}async setWeights(e){e=await this.extractIterations(e),this.accumulatedGrads=e.map(e=>({originalName:e.name,variable:e.tensor.variable(!1)}))}getConfig(){return{learningRate:this.learningRate,initialAccumulatorValue:this.initialAccumulatorValue}}static fromConfig(e,t){return new e(t.learningRate,t.initialAccumulatorValue)}}})),rw,iw=o((()=>{I(),jo(),uc(),gc(),vc(),Nf(),Ff(),Rf(),Vf(),xm(),Xd(),QC(),rw=class extends ZC{static get className(){return`Adam`}constructor(e,t,n,r=null){super(),this.learningRate=e,this.beta1=t,this.beta2=n,this.epsilon=r,this.accumulatedFirstMoment=[],this.accumulatedSecondMoment=[],vo(()=>{this.accBeta1=Pf(t).variable(),this.accBeta2=Pf(n).variable()}),r??(this.epsilon=F.backend.epsilon())}applyGradients(e){let t=Array.isArray(e)?e.map(e=>e.name):Object.keys(e);vo(()=>{let n=q(1,this.accBeta1),r=q(1,this.accBeta2);t.forEach((t,i)=>{let a=F.registeredVariables[t];this.accumulatedFirstMoment[i]??(this.accumulatedFirstMoment[i]={originalName:`${t}/m`,variable:vo(()=>Yd(a).variable(!1))}),this.accumulatedSecondMoment[i]??(this.accumulatedSecondMoment[i]={originalName:`${t}/v`,variable:vo(()=>Yd(a).variable(!1))});let o=Array.isArray(e)?e[i].tensor:e[t];if(o==null)return;let s=this.accumulatedFirstMoment[i].variable,c=this.accumulatedSecondMoment[i].variable,l=H(U(s,this.beta1),U(o,1-this.beta1)),u=H(U(c,this.beta2),U(Bf(o),1-this.beta2)),d=hc(l,n),f=hc(u,r);s.assign(l),c.assign(u);let p=H(U(hc(d,H(Lf(f),this.epsilon)),-this.learningRate),a);a.assign(p)}),this.accBeta1.assign(U(this.accBeta1,this.beta1)),this.accBeta2.assign(U(this.accBeta2,this.beta2))}),this.incrementIterations()}dispose(){this.accBeta1.dispose(),this.accBeta2.dispose(),this.accumulatedFirstMoment!=null&&yo(this.accumulatedFirstMoment.map(e=>e.variable)),this.accumulatedSecondMoment!=null&&yo(this.accumulatedSecondMoment.map(e=>e.variable))}async getWeights(){let e=[...this.accumulatedFirstMoment,...this.accumulatedSecondMoment];return[await this.saveIterations()].concat(e.map(e=>({name:e.originalName,tensor:e.variable})))}async setWeights(e){e=await this.extractIterations(e),vo(()=>{this.accBeta1.assign(Mf(this.beta1,this.iterations_+1)),this.accBeta2.assign(Mf(this.beta2,this.iterations_+1))});let t=e.length/2;this.accumulatedFirstMoment=e.slice(0,t).map(e=>({originalName:e.name,variable:e.tensor.variable(!1)})),this.accumulatedSecondMoment=e.slice(t,t*2).map(e=>({originalName:e.name,variable:e.tensor.variable(!1)}))}getConfig(){return{learningRate:this.learningRate,beta1:this.beta1,beta2:this.beta2,epsilon:this.epsilon}}static fromConfig(e,t){return new e(t.learningRate,t.beta1,t.beta2,t.epsilon)}}})),aw,ow=o((()=>{I(),jo(),xc(),uc(),gc(),rh(),vc(),Ff(),xm(),Xd(),QC(),aw=class extends ZC{static get className(){return`Adamax`}constructor(e,t,n,r=null,i=0){super(),this.learningRate=e,this.beta1=t,this.beta2=n,this.epsilon=r,this.decay=i,this.accumulatedFirstMoment=[],this.accumulatedWeightedInfNorm=[],vo(()=>{this.iteration=Pf(0).variable(),this.accBeta1=Pf(t).variable()}),r??(this.epsilon=F.backend.epsilon())}applyGradients(e){let t=Array.isArray(e)?e.map(e=>e.name):Object.keys(e);vo(()=>{let n=q(1,this.accBeta1),r=hc(-this.learningRate,H(U(this.iteration,this.decay),1));t.forEach((t,i)=>{let a=F.registeredVariables[t];this.accumulatedFirstMoment[i]??(this.accumulatedFirstMoment[i]={originalName:`${t}/m`,variable:Yd(a).variable(!1)}),this.accumulatedWeightedInfNorm[i]??(this.accumulatedWeightedInfNorm[i]={originalName:`${t}/v`,variable:Yd(a).variable(!1)});let o=Array.isArray(e)?e[i].tensor:e[t];if(o==null)return;let s=this.accumulatedFirstMoment[i].variable,c=this.accumulatedWeightedInfNorm[i].variable,l=H(U(s,this.beta1),U(o,1-this.beta1)),u=nh(U(c,this.beta2),bc(o));s.assign(l),c.assign(u);let d=H(U(hc(r,n),hc(l,H(u,this.epsilon))),a);a.assign(d)}),this.iteration.assign(H(this.iteration,1)),this.accBeta1.assign(U(this.accBeta1,this.beta1))}),this.incrementIterations()}dispose(){this.accBeta1.dispose(),this.iteration.dispose(),this.accumulatedFirstMoment!=null&&yo(this.accumulatedFirstMoment.map(e=>e.variable)),this.accumulatedWeightedInfNorm!=null&&yo(this.accumulatedWeightedInfNorm.map(e=>e.variable))}async getWeights(){throw Error(`getWeights() is not implemented for Adamax yet.`)}async setWeights(e){throw Error(`setWeights() is not implemented for Adamax yet.`)}getConfig(){return{learningRate:this.learningRate,beta1:this.beta1,beta2:this.beta2,epsilon:this.epsilon,decay:this.decay}}static fromConfig(e,t){return new e(t.learningRate,t.beta1,t.beta2,t.epsilon,t.decay)}}})),sw,cw=o((()=>{I(),jo(),uc(),vc(),Ff(),QC(),sw=class extends ZC{static get className(){return`SGD`}constructor(e){super(),this.learningRate=e,this.setLearningRate(e)}applyGradients(e){(Array.isArray(e)?e.map(e=>e.name):Object.keys(e)).forEach((t,n)=>{let r=Array.isArray(e)?e[n].tensor:e[t];if(r==null)return;let i=F.registeredVariables[t];vo(()=>{let e=H(U(this.c,r),i);i.assign(e)})}),this.incrementIterations()}setLearningRate(e){this.learningRate=e,this.c!=null&&this.c.dispose(),this.c=bo(Pf(-e))}dispose(){this.c.dispose()}async getWeights(){return[await this.saveIterations()]}async setWeights(e){if(e=await this.extractIterations(e),e.length!==0)throw Error(`SGD optimizer does not have settable weights.`)}getConfig(){return{learningRate:this.learningRate}}static fromConfig(e,t){return new e(t.learningRate)}}})),lw,uw=o((()=>{I(),jo(),uc(),vc(),Ff(),Xd(),cw(),lw=class extends sw{static get className(){return`Momentum`}constructor(e,t,n=!1){super(e),this.learningRate=e,this.momentum=t,this.useNesterov=n,this.accumulations=[],this.m=Pf(this.momentum)}applyGradients(e){(Array.isArray(e)?e.map(e=>e.name):Object.keys(e)).forEach((t,n)=>{let r=F.registeredVariables[t];this.accumulations[n]??(this.accumulations[n]={originalName:`${t}/momentum`,variable:vo(()=>Yd(r).variable(!1))});let i=this.accumulations[n].variable,a=Array.isArray(e)?e[n].tensor:e[t];a!=null&&vo(()=>{let e,t=H(U(this.m,i),a);e=this.useNesterov?H(U(this.c,H(a,U(t,this.m))),r):H(U(this.c,t),r),i.assign(t),r.assign(e)})}),this.incrementIterations()}dispose(){this.m.dispose(),this.accumulations!=null&&yo(this.accumulations.map(e=>e.variable))}setMomentum(e){this.momentum=e}async getWeights(){return[await this.saveIterations()].concat(this.accumulations.map(e=>({name:e.originalName,tensor:e.variable})))}async setWeights(e){e=await this.extractIterations(e),this.accumulations=e.map(e=>({originalName:e.name,variable:e.tensor.variable(!1)}))}getConfig(){return{learningRate:this.learningRate,momentum:this.momentum,useNesterov:this.useNesterov}}static fromConfig(e,t){return new e(t.learningRate,t.momentum,t.useNesterov)}}})),dw,fw=o((()=>{I(),jo(),uc(),gc(),vc(),Rf(),Vf(),xm(),Xd(),QC(),dw=class extends ZC{static get className(){return`RMSProp`}constructor(e,t=.9,n=0,r=null,i=!1){if(super(),this.learningRate=e,this.decay=t,this.momentum=n,this.epsilon=r,this.accumulatedMeanSquares=[],this.accumulatedMoments=[],this.accumulatedMeanGrads=[],this.centered=i,r??(this.epsilon=F.backend.epsilon()),e==null)throw Error(`learningRate for RMSPropOptimizer must be defined.`)}applyGradients(e){(Array.isArray(e)?e.map(e=>e.name):Object.keys(e)).forEach((t,n)=>{let r=F.registeredVariables[t];this.accumulatedMeanSquares[n]??(this.accumulatedMeanSquares[n]={originalName:`${t}/rms`,variable:vo(()=>Yd(r).variable(!1))}),this.accumulatedMoments[n]??(this.accumulatedMoments[n]={originalName:`${t}/momentum`,variable:vo(()=>Yd(r).variable(!1))}),this.accumulatedMeanGrads[n]==null&&this.centered&&(this.accumulatedMeanGrads[n]={originalName:`${t}/mg`,variable:vo(()=>Yd(r).variable(!1))});let i=Array.isArray(e)?e[n].tensor:e[t];if(i==null)return;let a=this.accumulatedMeanSquares[n].variable,o=this.accumulatedMoments[n].variable;vo(()=>{let e=H(U(a,this.decay),U(Bf(i),1-this.decay));if(this.centered){let t=this.accumulatedMeanGrads[n].variable,s=H(U(t,this.decay),U(i,1-this.decay)),c=hc(U(i,this.learningRate),Lf(q(e,H(Bf(s),this.epsilon)))),l=H(U(o,this.momentum),c);a.assign(e),t.assign(s),o.assign(l);let u=q(r,l);r.assign(u)}else{let e=H(U(a,this.decay),U(Bf(i),1-this.decay)),t=H(U(o,this.momentum),hc(U(i,this.learningRate),Lf(H(e,this.epsilon))));a.assign(e),o.assign(t);let n=q(r,t);r.assign(n)}})}),this.incrementIterations()}dispose(){this.accumulatedMeanSquares!=null&&yo(this.accumulatedMeanSquares.map(e=>e.variable)),this.accumulatedMeanGrads!=null&&this.centered&&yo(this.accumulatedMeanGrads.map(e=>e.variable)),this.accumulatedMoments!=null&&yo(this.accumulatedMoments.map(e=>e.variable))}async getWeights(){let e=[...this.accumulatedMeanSquares,...this.accumulatedMoments];return this.centered&&e.push(...this.accumulatedMeanGrads),[await this.saveIterations()].concat(e.map(e=>({name:e.originalName,tensor:e.variable})))}async setWeights(e){e=await this.extractIterations(e);let t=this.centered?e.length/3:e.length/2;this.accumulatedMeanSquares=e.slice(0,t).map(e=>({originalName:e.name,variable:e.tensor.variable(!1)})),this.accumulatedMoments=e.slice(t,t*2).map(e=>({originalName:e.name,variable:e.tensor.variable(!1)})),this.centered&&(this.accumulatedMeanGrads=e.slice(t*2,t*3).map(e=>({originalName:e.name,variable:e.tensor.variable(!1)})))}getConfig(){return{learningRate:this.learningRate,decay:this.decay,momentum:this.momentum,epsilon:this.epsilon,centered:this.centered}}static fromConfig(e,t){return new e(t.learningRate,t.decay,t.momentum,t.epsilon,t.centered)}}}));function pw(){for(let e of mw)WC(e)}var mw,hw=o((()=>{ew(),nw(),iw(),ow(),uw(),fw(),cw(),XC(),mw=[$C,tw,rw,aw,lw,dw,sw]}));function gw(e){return new Promise(e=>setTimeout(e)).then(e)}function _w(e=`model`){return new Sw(e)}function vw(e){return new Cw(e)}var yw,bw,xw,Sw,Cw,ww,Tw=o((()=>{Ga(),He(),ns(),cs(),co(),yw=`model`,bw=`.json`,xw=`.weights.bin`,Sw=class e{constructor(t){if(!M().getBool(`IS_BROWSER`))throw Error(`browserDownloads() cannot proceed because the current environment is not a browser.`);t.startsWith(e.URL_SCHEME)&&(t=t.slice(e.URL_SCHEME.length)),(t==null||t.length===0)&&(t=yw),this.modelJsonFileName=t+bw,this.weightDataFileName=t+xw}async save(e){if(typeof document>`u`)throw Error("Browser downloads are not supported in this environment since `document` is not present");let t=so.join(e.weightData),n=window.URL.createObjectURL(new Blob([t],{type:`application/octet-stream`}));if(e.modelTopology instanceof ArrayBuffer)throw Error(`BrowserDownloads.save() does not support saving model topology in binary formats yet.`);{let t=Go(e,[{paths:[`./`+this.weightDataFileName],weights:e.weightSpecs}]),r=window.URL.createObjectURL(new Blob([JSON.stringify(t)],{type:`application/json`})),i=this.modelJsonAnchor==null?document.createElement(`a`):this.modelJsonAnchor;if(i.download=this.modelJsonFileName,i.href=r,await gw(()=>i.dispatchEvent(new MouseEvent(`click`))),e.weightData!=null){let e=this.weightDataAnchor==null?document.createElement(`a`):this.weightDataAnchor;e.download=this.weightDataFileName,e.href=n,await gw(()=>e.dispatchEvent(new MouseEvent(`click`)))}return{modelArtifactsInfo:Jo(e)}}}},Sw.URL_SCHEME=`downloads://`,Cw=class{constructor(e){if(e==null||e.length<1)throw Error(`When calling browserFiles, at least 1 file is required, but received ${e}`);this.jsonFile=e[0],this.weightsFiles=e.slice(1)}async load(){return new Promise((e,t)=>{let n=new FileReader;n.onload=n=>{let r=JSON.parse(n.target.result),i=r.modelTopology;if(i==null){t(Error(`modelTopology field is missing from file ${this.jsonFile.name}`));return}if(r.weightsManifest==null){t(Error(`weightManifest field is missing from file ${this.jsonFile.name}`));return}if(this.weightsFiles.length===0){e({modelTopology:i});return}e(qo(r,e=>this.loadWeights(e)))},n.onerror=e=>t(`Failed to read model topology and weights manifest JSON from file '${this.jsonFile.name}'. BrowserFiles supports loading Keras-style tf.Model artifacts only.`),n.readAsText(this.jsonFile)})}loadWeights(e){let t=[],n=[];for(let r of e)t.push(...r.weights),n.push(...r.paths);let r=this.checkManifestAndWeightFiles(e),i=n.map(e=>this.loadWeightsFile(e,r[e]));return Promise.all(i).then(e=>[t,e])}loadWeightsFile(e,t){return new Promise((n,r)=>{let i=new FileReader;i.onload=e=>{let t=e.target.result;n(t)},i.onerror=t=>r(`Failed to weights data from file of path '${e}'.`),i.readAsArrayBuffer(t)})}checkManifestAndWeightFiles(e){let t=[],n=this.weightsFiles.map(e=>Wo(e.name)),r={};for(let i of e)i.paths.forEach(e=>{let i=Wo(e);if(t.indexOf(i)!==-1)throw Error(`Duplicate file basename found in weights manifest: '${i}'`);if(t.push(i),n.indexOf(i)===-1)throw Error(`Weight file with basename '${i}' is not provided.`);r[e]=this.weightsFiles[n.indexOf(i)]});if(t.length!==this.weightsFiles.length)throw Error(`Mismatch in the number of files in weights manifest (${t.length}) and the number of weight files provided (${this.weightsFiles.length}).`);return r}},ww=e=>M().getBool(`IS_BROWSER`)&&!Array.isArray(e)&&e.startsWith(Sw.URL_SCHEME)?_w(e.slice(Sw.URL_SCHEME.length)):null,rs.registerSaveRouter(ww)}));function Ew(e,t,n,r){o(e),n??=0,r??=1,s(n,r);let i=0,a=a=>(a.then(a=>(t(n+ ++i/e.length*(r-n)),a)),a);function o(e){E(e!=null&&Array.isArray(e)&&e.length>0,()=>`promises must be a none empty array`)}function s(e,t){E(e>=0&&e<=1,()=>`Progress fraction must be in range [0, 1], but got startFraction ${e}`),E(t>=0&&t<=1,()=>`Progress fraction must be in range [0, 1], but got endFraction ${t}`),E(t>=e,()=>`startFraction must be no more than endFraction, but got startFraction ${e} and endFraction ${t}`)}return Promise.all(e.map(a))}var Dw=o((()=>{P()}));async function Ow(e,t){t??={};let n=t.fetchFunc==null?M().platform.fetch:t.fetchFunc,r=e.map(e=>n(e,t.requestInit,{isBinary:!0})),i=(t.onProgress==null?await Promise.all(r):await Ew(r,t.onProgress,0,.5)).map(e=>e.arrayBuffer());return t.onProgress==null?await Promise.all(i):await Ew(i,t.onProgress,.5,1)}function kw(e,t){var n;let r=t.fetchFunc==null?M().platform.fetch:t.fetchFunc,i=0,a;return(n=t.onProgress)==null||n.call(t,0),new ReadableStream({pull:async n=>{for(var o;i<e.length;){a||=(await r(e[i],t.requestInit,{isBinary:!0})).body.getReader();let{done:s,value:c}=await a.read();if(s){i++,a=void 0,(o=t.onProgress)==null||o.call(t,i/e.length);continue}n.enqueue(c);return}n.close()}})}async function Aw(e,t=``,n,r){return jw(e=>Ow(e,{requestInit:r}))(e,t,n)}function jw(e){return async(t,n=``,r)=>{let i=t.map(()=>!1),a={},o=r==null?[]:r.map(()=>!1),s=[];if(t.forEach((e,t)=>{let n=0;e.weights.forEach(e=>{let c=io[`quantization`in e?e.quantization.dtype:e.dtype]*O(e.shape),l=()=>{i[t]=!0,a[t]??(a[t]=[]),a[t].push({manifestEntry:e,groupOffset:n,sizeBytes:c})};r==null?l():r.forEach((t,n)=>{t===e.name&&(l(),o[n]=!0)}),s.push(e.name),n+=c})}),!o.every(e=>e)){let e=r.filter((e,t)=>!o[t]);throw Error(`Could not find weights in manifest with names: ${e.join(`, `)}. \nManifest JSON has weights with names: ${s.join(`, `)}.`)}let c=i.reduce((e,t,n)=>(t&&e.push(n),e),[]),l=[];c.forEach(e=>{t[e].paths.forEach(e=>{let t=n+(n.endsWith(`/`)?``:`/`)+e;l.push(t)})});let u=await e(l),d={},f=0;return c.forEach(e=>{let n=t[e].paths.length,r=new so(u.slice(f,f+n));a[e].forEach(e=>{let t=No(r.slice(e.groupOffset,e.groupOffset+e.sizeBytes),[e.manifestEntry]);for(let e in t)d[e]=t[e]}),f+=n}),d}}var Mw=o((()=>{He(),P(),co(),ns(),Dw(),ao()}));function Nw(e){let t=e.lastIndexOf(`/`),n=e.lastIndexOf(`?`),r=e.substring(0,t),i=n>t?e.substring(n):``;return[r+`/`,i]}function Pw(e){return e.match(zw.URL_SCHEME_REGEX)!=null}function Fw(e,t){return new zw(e,t)}function Iw(e,t){return Fw(e,t)}var Lw,Rw,zw,Bw,Vw=o((()=>{He(),P(),ns(),co(),cs(),Mw(),Lw=`application/octet-stream`,Rw=`application/json`,zw=class{constructor(e,t){if(this.DEFAULT_METHOD=`POST`,t??={},this.weightPathPrefix=t.weightPathPrefix,this.weightUrlConverter=t.weightUrlConverter,t.fetchFunc==null?this.fetch=M().platform.fetch:(E(typeof t.fetchFunc==`function`,()=>"Must pass a function that matches the signature of `fetch` (see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)"),this.fetch=t.fetchFunc),E(e!=null&&e.length>0,()=>`URL path for http must not be null, undefined or empty.`),Array.isArray(e)&&E(e.length===2,()=>`URL paths for http must have a length of 2, (actual length is ${e.length}).`),this.path=e,t.requestInit!=null&&t.requestInit.body!=null)throw Error(`requestInit is expected to have no pre-existing body, but has one.`);this.requestInit=t.requestInit||{},this.loadOptions=t}async save(e){if(e.modelTopology instanceof ArrayBuffer)throw Error(`BrowserHTTPRequest.save() does not support saving model topology in binary formats yet.`);let t=Object.assign({method:this.DEFAULT_METHOD},this.requestInit);t.body=new FormData;let n=Go(e,[{paths:[`./model.weights.bin`],weights:e.weightSpecs}]);if(t.body.append(`model.json`,new Blob([JSON.stringify(n)],{type:Rw}),`model.json`),e.weightData!=null){let n=so.join(e.weightData);t.body.append(`model.weights.bin`,new Blob([n],{type:Lw}),`model.weights.bin`)}let r=await this.fetch(this.path,t);if(r.ok)return{modelArtifactsInfo:Jo(e),responses:[r]};throw Error(`BrowserHTTPRequest.save() failed due to HTTP response status ${r.status}.`)}async loadModelJSON(){let e=await this.fetch(this.path,this.requestInit);if(!e.ok)throw Error(`Request to ${this.path} failed with status code ${e.status}. Please verify this URL points to the model JSON of the model to load.`);let t;try{t=await e.json()}catch{let e=`Failed to parse model JSON of response from ${this.path}.`;throw this.path.endsWith(`.pb`)?e+=` Your path contains a .pb file extension. Support for .pb models have been removed in TensorFlow.js 1.0 in favor of .json models. You can re-convert your Python TensorFlow model using the TensorFlow.js 1.0 conversion scripts or you can convert your.pb models with the 'pb2json'NPM script in the tensorflow/tfjs-converter repository.`:e+=` Please make sure the server is serving valid JSON for this request.`,Error(e)}let n=t.modelTopology,r=t.weightsManifest;if(n==null&&r==null)throw Error(`The JSON from HTTP path ${this.path} contains neither model topology or manifest for weights.`);return t}async load(){return this.loadOptions.streamWeights?this.loadStream():qo(await this.loadModelJSON(),e=>this.loadWeights(e))}async loadStream(){let e=await this.loadModelJSON(),t=await this.getWeightUrls(e.weightsManifest),n=Yo(e.weightsManifest);return Object.assign(Object.assign({},e),{weightSpecs:n,getWeightStream:()=>kw(t,this.loadOptions)})}async getWeightUrls(e){let[t,n]=Nw(Array.isArray(this.path)?this.path[1]:this.path),r=this.weightPathPrefix||t,i=[],a=[];for(let t of e)for(let e of t.paths)this.weightUrlConverter==null?i.push(r+e+n):a.push(this.weightUrlConverter(e));return this.weightUrlConverter&&i.push(...await Promise.all(a)),i}async loadWeights(e){let t=await this.getWeightUrls(e);return[Yo(e),await Ow(t,this.loadOptions)]}},zw.URL_SCHEME_REGEX=/^https?:\/\//,Bw=(e,t)=>{if(typeof fetch>`u`&&(t==null||t.fetchFunc==null))return null;{let n=!0;if(n=Array.isArray(e)?e.every(e=>Pw(e)):Pw(e),n)return Fw(e,t)}return null},rs.registerSaveRouter(Bw),rs.registerLoadRouter(Bw)}));function Hw(e,t,n,r){return new Jw(Uw(...arguments))}function Uw(e,t,n,r){return arguments.length===1?e.modelTopology!=null||e.weightSpecs!=null?new Kw(e):(console.warn(`Please call tf.io.fromMemory() with only one argument. The argument should be of type ModelArtifacts. The multi-argument signature of tf.io.fromMemory() has been deprecated and will be removed in a future release.`),new Kw({modelTopology:e})):(console.warn(`Please call tf.io.fromMemory() with only one argument. The argument should be of type ModelArtifacts. The multi-argument signature of tf.io.fromMemory() has been deprecated and will be removed in a future release.`),new Kw({modelTopology:e,weightSpecs:t,weightData:n,trainingConfig:r}))}function Ww(e){return new qw(e)}function Gw(e){return new qw(e)}var Kw,qw,Jw,Yw=o((()=>{Kw=class{constructor(e){this.modelArtifacts=e}load(){return this.modelArtifacts}},qw=class{constructor(e){this.saveHandler=e}save(e){return this.saveHandler(e)}},Jw=class{constructor(e){e.load&&(this.load=()=>Promise.resolve(e.load())),e.save&&(this.save=t=>Promise.resolve(e.save(t)))}}})),Xw=c({CompositeArrayBuffer:()=>so,browserFiles:()=>vw,browserHTTPRequest:()=>Iw,concatenateArrayBuffers:()=>Uo,copyModel:()=>Vs,decodeWeights:()=>No,decodeWeightsStream:()=>Ro,encodeWeights:()=>Mo,fromMemory:()=>Hw,fromMemorySync:()=>Uw,getLoadHandlers:()=>ss,getModelArtifactsForJSON:()=>qo,getModelArtifactsForJSONSync:()=>Ko,getModelArtifactsInfoForJSON:()=>Jo,getSaveHandlers:()=>os,getWeightSpecs:()=>Yo,http:()=>Fw,isHTTPScheme:()=>Pw,listModels:()=>zs,loadWeights:()=>Aw,moveModel:()=>Hs,registerLoadRouter:()=>as,registerSaveRouter:()=>is,removeModel:()=>Bs,weightsLoaderFactory:()=>jw,withSaveHandler:()=>Ww,withSaveHandlerSync:()=>Gw}),Zw=o((()=>{bs(),Is(),Tw(),Vw(),ns(),Yw(),cs(),Mw(),co(),Gs()}));function Qw(e,t,n){let r=L(e,`labels`,`confusionMatrix`),i=L(t,`predictions`,`confusionMatrix`);E(n==null||n>0&&Number.isInteger(n),()=>`If provided, numClasses must be a positive integer, but got ${n}`),E(r.rank===1,()=>`Expected the rank of labels to be 1, but got ${r.rank}`),E(i.rank===1,()=>`Expected the rank of predictions to be 1, but got ${i.rank}`),E(r.shape[0]===i.shape[0],()=>`Mismatch in the number of examples: ${r.shape[0]} vs. ${i.shape[0]}. Labels and predictions should have the same number of elements.`),E(n>0&&Number.isInteger(n),()=>`numClasses is required to be a positive integer, but got ${n}`);let a=Fh(tc(r,`int32`),n),o=Fh(tc(i,`int32`),n);return tc(Fl(sb(a),o),`int32`)}var $w,eT=o((()=>{R(),P(),nc(),Il(),Ih(),B(),cb(),$w=z({confusionMatrix_:Qw})})),tT=c({confusionMatrix:()=>$w}),nT=o((()=>{eT()})),rT=c({draw:()=>pT,fromPixels:()=>gT,fromPixelsAsync:()=>lT,toPixels:()=>fT});function iT(e,t=3){if(t>4)throw Error(`Cannot construct Tensor with more than 4 channels from pixels.`);if(e==null)throw Error(`pixels passed to tf.browser.fromPixels() can not be null`);let n=!1,r=!1,i=!1,a=!1,o=!1,s=!1;if(e.data instanceof Uint8Array)n=!0;else if(typeof ImageData<`u`&&e instanceof ImageData)r=!0;else if(typeof HTMLVideoElement<`u`&&e instanceof HTMLVideoElement)i=!0;else if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement)a=!0;else if(e.getContext!=null)o=!0;else if(typeof ImageBitmap<`u`&&e instanceof ImageBitmap)s=!0;else throw Error(`pixels passed to tf.browser.fromPixels() must be either an HTMLVideoElement, HTMLImageElement, HTMLCanvasElement, ImageData in browser, or OffscreenCanvas, ImageData in webworker or {data: Uint32Array, width: number, height: number}, but was ${e.constructor.name}`);if(Xr(`FromPixels`,F.backendName)!=null){let n={pixels:e},r={numChannels:t};return F.runKernel(Hr,n,r)}let[c,l]=i?[e.videoWidth,e.videoHeight]:[e.width,e.height],u;if(o)u=e.getContext(`2d`).getImageData(0,0,c,l).data;else if(r||n)u=e.data;else if(a||i||s){if(mT==null)if(typeof document>`u`)if(typeof OffscreenCanvas<`u`&&typeof OffscreenCanvasRenderingContext2D<`u`)mT=new OffscreenCanvas(1,1).getContext(`2d`);else throw Error(`Cannot parse input in current context. Reason: OffscreenCanvas Context2D rendering is not supported.`);else mT=document.createElement(`canvas`).getContext(`2d`,{willReadFrequently:!0});mT.canvas.width=c,mT.canvas.height=l,mT.drawImage(e,0,0,c,l),u=mT.getImageData(0,0,c,l).data}let d;if(t===4)d=new Int32Array(u);else{let e=c*l;d=new Int32Array(e*t);for(let n=0;n<e;n++)for(let e=0;e<t;++e)d[n*t+e]=u[n*4+e]}return _y(d,[l,c,t],`int32`)}function aT(e){return e!=null&&e.data instanceof Uint8Array}function oT(){return typeof window<`u`&&typeof ImageBitmap<`u`&&window.hasOwnProperty(`createImageBitmap`)}function sT(e){return e!=null&&e.width!==0&&e.height!==0}function cT(e){return oT()&&!(e instanceof ImageBitmap)&&sT(e)&&!aT(e)}async function lT(e,t=3){let n=null;if(M().getBool(`WRAP_TO_IMAGEBITMAP`)&&cT(e)){let t;try{t=await createImageBitmap(e,{premultiplyAlpha:`none`})}catch{t=null}n=t!=null&&t.width===e.width&&t.height===e.height?t:e}else n=e;return iT(n,t)}function uT(e){if(e.rank!==2&&e.rank!==3)throw Error(`toPixels only supports rank 2 or 3 tensors, got rank ${e.rank}.`);let t=e.rank===2?1:e.shape[2];if(t>4||t===2)throw Error(`toPixels only supports depth of size 1, 3 or 4 but got ${t}`);if(e.dtype!==`float32`&&e.dtype!==`int32`)throw Error(`Unsupported type for toPixels: ${e.dtype}. Please use float32 or int32 tensors.`)}function dT(e){let t=e?.alpha||1;if(t>1||t<0)throw Error(`Alpha value ${t} is suppoed to be in range [0 - 1].`)}async function fT(e,t){let n=L(e,`img`,`toPixels`);if(!(e instanceof la)){let e=n;n=tc(e,`int32`),e.dispose()}uT(n);let[r,i]=n.shape.slice(0,2),a=n.rank===2?1:n.shape[2],o=await n.data(),s=n.dtype===`float32`?255:1,c=new Uint8ClampedArray(i*r*4);for(let e=0;e<r*i;++e){let t=[0,0,0,255];for(let r=0;r<a;r++){let i=o[e*a+r];if(n.dtype===`float32`){if(i<0||i>1)throw Error(`Tensor values for a float32 Tensor must be in the range [0 - 1] but encountered ${i}.`)}else if(n.dtype===`int32`&&(i<0||i>255))throw Error(`Tensor values for a int32 Tensor must be in the range [0 - 255] but encountered ${i}.`);a===1?(t[0]=i*s,t[1]=i*s,t[2]=i*s):t[r]=i*s}let r=e*4;c[r+0]=Math.round(t[0]),c[r+1]=Math.round(t[1]),c[r+2]=Math.round(t[2]),c[r+3]=Math.round(t[3])}if(t!=null){hT||Xr(`Draw`,F.backendName)!=null&&(console.warn(`tf.browser.toPixels is not efficient to draw tensor on canvas. Please try tf.browser.draw instead.`),hT=!0),t.width=i,t.height=r;let e=t.getContext(`2d`),n=new ImageData(c,i,r);e.putImageData(n,0,0)}return n!==e&&n.dispose(),c}function pT(e,t,n){let r=L(e,`img`,`draw`);if(!(e instanceof la)){let e=r;r=tc(e,`int32`),e.dispose()}uT(r),dT(n?.imageOptions);let i={image:r},a={canvas:t,options:n};F.runKernel(zt,i,a)}var mT,hT,gT,_T=o((()=>{I(),He(),N(),si(),da(),R(),nc(),B(),vy(),hT=!1,gT=z({fromPixels_:iT})})),vT=c({prepareAndValidate:()=>yT});function yT(e,t){let n=e.shape.length,r=t.shape.length;if(n<1)throw Error(`tf.gatherND() expects the input to be rank 1 or higher, but the rank was ${n}.`);if(r<1)throw Error(`tf.gatherND() expects the indices to be rank 1 or higher, but the rank was ${r}.`);if(t.dtype!==`int32`)throw Error(`tf.gatherND() expects the indices to be int32 type, but the dtype was ${t.dtype}.`);if(t.shape[r-1]>n)throw Error(`index innermost dimension length must be <= tensor rank; saw: ${t.shape[r-1]} vs. ${n}`);if(O(e.shape)===0)throw Error(`Requested more than 0 entries, but input is empty. Input shape: ${e.shape}.`);let i=t.shape,a=i[i.length-1],o=1;for(let e=0;e<i.length-1;++e)o*=i[e];let s=e.shape,c=i.slice();c.pop();let l=1;for(let e=a;e<n;++e)l*=s[e],c.push(s[e]);let u=[...j(e.shape).map(e=>e/l),1].slice(0,a);return[c,o,l,u]}var bT=o((()=>{P()})),xT=c({assertParamsValid:()=>ST,computeFlatOffset:()=>FT,computeOutShape:()=>wT,getNormalizedAxes:()=>OT,isSliceContinous:()=>PT,maskToAxes:()=>CT,parseSliceParams:()=>IT,sliceInfo:()=>LT,startForAxis:()=>MT,startIndicesWithElidedDims:()=>kT,stopForAxis:()=>NT,stopIndicesWithElidedDims:()=>AT,stridesForAxis:()=>jT,stridesWithElidedDims:()=>TT});function ST(e,t,n){let r=e.shape.length;E(r===t.length,()=>`Error in slice${r}D: Length of begin ${t} must match the rank of the array (${r}).`),E(r===n.length,()=>`Error in slice${r}D: Length of size ${n} must match the rank of the array (${r}).`);for(let i=0;i<r;++i)E(t[i]+n[i]<=e.shape[i],()=>`Error in slice${r}D: begin[${i}] + size[${i}] (${t[i]+n[i]}) would overflow input.shape[${i}] (${e.shape[i]})`)}function CT(e){let t=[],n=0;for(;e>0;)e&1&&t.push(n),e/=2,n++;return t}function wT(e,t,n){let r=[];for(let i=0;i<e.length;i++)r[i]=Math.ceil((t[i]-e[i])/n[i]);return r}function TT(e,t,n,r){let i=[...e];for(let e=i.length;e<r.length;e++)i.push(1);for(let e=0;e<n;e++)e===0?i[t]=1:(i.splice(t,0,1),i.pop());return i}function ET(e,t,n){return n<=e?n:n-(t-1)}function DT(e,t){let n=[];for(let r=0;r<e;r++)n.push(t+r);return n}function OT(e,t,n,r,i,a,o,s,c){let l=e.length,u=Array(l),d=Array(l),f=Array(l);if(t.length&&n>0){let c=t[0],l=n+1;u=kT(o,c,l,r,e),d=AT(s,c,l,i,e),f=TT(a,c,l,e)}else for(let t=0;t<l;t++)u[t]=MT(o,r,a,e,t,c),d[t]=NT(s,i,a,e,t,c),f[t]=jT(a,t,c);return{begin:u,end:d,strides:f}}function kT(e,t,n,r,i){let a=[...i],o=DT(n,t);for(let i=0;i<a.length;i++)if(o.indexOf(i)>-1)a[i]=0;else{let o=ET(t,n,i),s=r[o];e&1<<o&&(s=0),a[i]=s}return a}function AT(e,t,n,r,i){let a=[...i],o=DT(n,t);for(let i=0;i<a.length;i++)if(o.indexOf(i)>-1)a[i]=2**53-1;else{let o=ET(t,n,i),s=r[o];e&1<<o&&(s=2**53-1),a[i]=s}for(let e=0;e<a.length;e++){let t=i[e];a[e]<0&&(a[e]+=t),a[e]=b(0,a[e],i[e])}return a}function jT(e,t,n){let r=e[t];return(n&1<<t||r==null)&&(r=1),r}function MT(e,t,n,r,i,a){let o=t[i],s=n[i]||1;(e&1<<i||a&1<<i||o==null)&&(o=s>0?-(2**53-1):2**53-1);let c=r[i];return o<0&&(o+=c),o=b(0,o,c-1),o}function NT(e,t,n,r,i,a){let o=t[i],s=n[i]||1;(e&1<<i||a&1<<i||o==null)&&(o=s>0?2**53-1:-(2**53-1));let c=r[i];return o<0&&(o+=c),o=s>0?b(0,o,c):b(-1,o,c-1),o}function PT(e,t,n){let r=n.length;for(let e=0;e<n.length;e++)if(n[e]>1){r=e;break}for(let i=r+1;i<n.length;i++)if(t[i]>0||n[i]!==e[i])return!1;return!0}function FT(e,t){let n=e.length>0?e[e.length-1]:1;for(let r=0;r<e.length-1;r++)n+=e[r]*t[r];return n}function IT(e,t,n){let r,i=e.shape.length;r=typeof t==`number`?[t,...Array(i-1).fill(0)]:t.length<i?t.concat(Array(i-t.length).fill(0)):t.slice(),r.forEach(e=>{E(e!==-1,()=>`slice() does not support negative begin indexing.`)});let a;return a=n==null?Array(i).fill(-1):typeof n==`number`?[n,...Array(i-1).fill(-1)]:n.length<i?n.concat(Array(i-n.length).fill(-1)):n,a=a.map((t,n)=>t>=0?t:(E(t===-1,()=>`Negative size values should be exactly -1 but got ${t} for the slice() size at index ${n}.`),e.shape[n]-r[n])),[r,a]}function LT(e,t,n,r,i,a,o,s,c){let l;if(r==null?(l=Array(t.length),l.fill(1)):l=r,o!=null&&o&o-1)throw Error(`Multiple ellipses in slice is not allowed.`);let u=!1,d={dims:l.length,numAddAxisAfterEllipsis:0,begin:t.slice(),end:n.slice(),strides:l.slice(),beginMask:i,endMask:a,ellipsisMask:o,newAxisMask:s,shrinkAxisMask:c};for(let e=0;e<d.dims;e++)u&&1<<e&s&&d.numAddAxisAfterEllipsis++,1<<e&o&&(u=!0);u||(d.ellipsisMask|=1<<d.dims,d.dims++);let f={dims:e.length,beginMask:0,endMask:0,beginValid:!1,endValid:!1};RT(d,f);let p=!0,m=!0,h=!0,g=[],_=[];for(let t=0;t<e.length;++t){if(f.strides[t]===0)throw Error(`strides[${t}] must be non-zero`);let n=!!(f.shrinkAxisMask&1<<t),r=e[t];if(r===-1){g.push(n?1:-1);continue}let i=[f.beginMask&1<<t,f.endMask&1<<t],a=[f.strides[t]>0?0:-1,f.strides[t]>0?r:r-1];if(n&&f.strides[t]<=0)throw Error(`only stride 1 allowed on non-range indexing.`);h&&=f.strides[t]===1;let o=!!(f.beginMask&1<<t&&f.endMask&1<<t);if(f.beginValid&&f.endValid){if(n){let e=f.begin[t]<0?r+f.begin[t]:f.begin[t];if(f.begin[t]=e,f.end[t]=f.begin[t]+1,e<0||e>=r)throw Error(`slice index ${f.begin[t]} of dimension ${t} out of bounds.`)}else f.begin[t]=zT(f.begin[t],0,f.strides[t],r,i,a),f.end[t]=zT(f.end[t],1,f.strides[t],r,i,a);let e=f.strides[t]===1&&f.begin[t]===0&&f.end[t]===r;p&&=e,m&&=t===0&&f.strides[t]===1||e}else p=p&&f.strides[t]===1&&o,m&&=t===0&&f.strides[t]===1||o;let s,c=!1;if(f.beginValid&&f.endValid?(s=f.end[t]-f.begin[t],c=!0):n?(s=1,c=!0):o&&r>=0&&(s=f.strides[t]<0?-r:r,c=!0),c){let e;e=s===0||s<0!=f.strides[t]<0?0:Math.trunc(s/f.strides[t])+(s%f.strides[t]===0?0:1),g.push(e)}else g.push(-1)}for(let e=0;e<f.finalShapeGatherIndices.length;++e){let t=f.finalShapeGatherIndices[e];t>=0?_.push(g[t]):t===BT&&_.push(1)}return{finalShapeSparse:_.filter((e,t)=>f.finalShapeGatherIndices[t]!==BT),finalShape:_,isIdentity:p,sliceDim0:m,isSimpleSlice:h,begin:f.begin,end:f.end,strides:f.strides}}function RT(e,t){t.beginMask=0,t.endMask=0,t.shrinkAxisMask=0;let n=0;t.beginValid=e.begin!=null,t.endValid=e.end!=null,t.begin=Array(t.dims),t.end=Array(t.dims),t.strides=Array(t.dims),t.finalShapeGatherIndices=[],t.finalShapeGatherIndicesSparse=[],t.inputShapeGatherIndicesSparse=Array(t.dims);for(let r=0;r<e.dims;r++)if(1<<r&e.ellipsisMask){let i=Math.min(t.dims-(e.dims-r)+1+e.numAddAxisAfterEllipsis,t.dims);for(;n<i;n++)t.begin[n]=0,t.end[n]=0,t.strides[n]=1,t.beginMask|=1<<n,t.endMask|=1<<n,t.finalShapeGatherIndices.push(n),t.finalShapeGatherIndicesSparse.push(-1),t.inputShapeGatherIndicesSparse[n]=r}else if(1<<r&e.newAxisMask)t.finalShapeGatherIndices.push(BT),t.finalShapeGatherIndicesSparse.push(-1);else{if(n===t.begin.length)throw Error(`Index out of range using input dim ${n}; input has only ${t.dims} dims, ${t.begin.length}.`);e.begin!=null&&(t.begin[n]=e.begin[r]),e.end!=null&&(t.end[n]=e.end[r]),t.strides[n]=e.strides[r],e.beginMask&1<<r&&(t.beginMask|=1<<n),e.endMask&1<<r&&(t.endMask|=1<<n),e.shrinkAxisMask&1<<r?(t.finalShapeGatherIndices.push(VT),t.finalShapeGatherIndicesSparse.push(-1),t.shrinkAxisMask|=1<<n):(t.finalShapeGatherIndices.push(n),t.finalShapeGatherIndicesSparse.push(r)),t.inputShapeGatherIndicesSparse[n]=r,n++}}function zT(e,t,n,r,i,a){if(i[t])return n>0?a[t]:a[t+1&1];{let t=e<0?r+e:e;return t<a[0]?a[0]:t>a[1]?a[1]:t}}var BT,VT,HT=o((()=>{P(),BT=-2,VT=-1})),UT,WT=o((()=>{UT=`4.22.0`})),GT,KT=o((()=>{ew(),nw(),iw(),ow(),uw(),fw(),cw(),GT=class{static sgd(e){return new sw(e)}static momentum(e,t,n=!1){return new lw(e,t,n)}static rmsprop(e,t=.9,n=0,r=null,i=!1){return new dw(e,t,n,r,i)}static adam(e=.001,t=.9,n=.999,r=null){return new rw(e,t,n,r)}static adadelta(e=.001,t=.95,n=null){return new $C(e,t,n)}static adamax(e=.002,t=.9,n=.999,r=null,i=0){return new aw(e,t,n,r,i)}static adagrad(e,t=.1){return new tw(e,t)}}})),qT,JT=o((()=>{KT(),qT=GT}));function YT(){return new Promise(e=>XT(()=>e()))}var XT,ZT=o((()=>{XT=typeof requestAnimationFrame<`u`?requestAnimationFrame:typeof setImmediate<`u`?setImmediate:e=>e()}));function QT(e,t){let n=e[0].length;e.forEach((e,t)=>{E(e.length===n,()=>`Error in concat${n}D: rank of tensors[${t}] must be the same as the rank of the rest (${n})`)}),E(t>=0&&t<n,()=>`Error in concat${n}D: axis must be between 0 and ${n-1}.`);let r=e[0];e.forEach((e,i)=>{for(let a=0;a<n;a++)E(a===t||e[a]===r[a],()=>`Error in concat${n}D: Shape of tensors[${i}] (${e}) does not match the shape of the rest (${r}) along the non-concatenated axis ${i}.`)})}function $T(e,t){let n=e[0].slice();for(let r=1;r<e.length;r++)n[t]+=e[r][t];return n}var eE=o((()=>{P()})),tE=o((()=>{}));function nE(e,t,n){let r=[];if(n==null&&t==null)return r;if(t==null)for(;r.length<e+n.length;)r.push(-1);else r=t.slice();if(n==null)return r;if(e+n.length!==r.length)throw Error(`rt input.shape and shape=${t} are incompatible: rt input.rank = ${e+n.length}, but shape.rank = ${r.length}`);for(let i=1;i<n.length;++i){let a=n[i],o=r[r.length-n.length+i],s=r[o];if(a>=0)if(s>=0){if(s!==a)throw Error(`rt input.shape and shape=${t} are incompatible: rt input.shape[${i+e}] = ${a} but shape[${i+e}] = ${s}`)}else r[o]=a}return r}function rE(e){let t={FIRST_DIM_SIZE:oE.FIRST_DIM_SIZE,VALUE_ROWIDS:oE.VALUE_ROWIDS,ROW_LENGTHS:oE.ROW_LENGTHS,ROW_SPLITS:oE.ROW_SPLITS,ROW_LIMITS:oE.ROW_LIMITS,ROW_STARTS:oE.ROW_STARTS},n=[];for(let r of e)if(r in t)n.push(t[r]);else break;return n}function iE(e){return e.length===0?0:e[0]===oE.FIRST_DIM_SIZE?e.length-1:e.length}function aE(e,t){if(e==null||t==null)return;let n=e.length,r=t.length;if(n>=r)throw Error(`defaultValue.shape=${e} and ragged tensor flatValues.shape=${t}, are incompatible: defaultValue.rank = ${n} must be less than ragged tensor input flatValues.rank = ${r})`);for(let i=0;i<Math.min(n,r-1);++i){let n=e[i],r=t[i+1];if(n>=0&&r>=0&&n!==1&&n!==r)throw Error(`defaultValue.shape=${e}, and ragged tensor input flatValues.shape=${t} are incompatible: defaultValue.shape[${i-e.length}] = ${n} but ragged tensor input.flatValues.shape[${i-e.length}] = ${r}`)}}var oE,sE=o((()=>{(function(e){e[e.FIRST_DIM_SIZE=0]=`FIRST_DIM_SIZE`,e[e.VALUE_ROWIDS=1]=`VALUE_ROWIDS`,e[e.ROW_LENGTHS=2]=`ROW_LENGTHS`,e[e.ROW_SPLITS=3]=`ROW_SPLITS`,e[e.ROW_LIMITS=4]=`ROW_LIMITS`,e[e.ROW_STARTS=5]=`ROW_STARTS`})(oE||={})}));function cE(e){return e<=30?e:Ce(e,Math.floor(Math.sqrt(e)))}var lE=o((()=>{P()}));function uE(e,t,n){return[n*(typeof e==`number`?e:e[0]),t*(typeof e==`number`?e:e[1])]}var dE=o((()=>{}));function fE(e,t,n,r=!0){let i=[];if(r)i=i.concat(t.slice(0)),i.push(e[0]/n),i=i.concat(e.slice(1));else{i=i.concat(e[0]);let n=t.length;for(let r=0;r<n;++r)i=i.concat([e[r+1]/t[r],t[r]]);i=i.concat(e.slice(n+1))}return i}function pE(e,t,n=!0){let r=[];if(n){r.push(t);for(let n=t+1;n<e;++n)n<=2*t?(r.push(n),r.push(n-(t+1))):r.push(n)}else{let n=[],i=[];for(let r=1;r<e;++r)r>=t*2+1||r%2==1?i.push(r):n.push(r);r.push(...n),r.push(0),r.push(...i)}return r}function mE(e,t,n,r=!0){let i=[];r?i.push(e[0]/n):i.push(e[0]*n);for(let n=1;n<e.length;++n)n<=t.length?r?i.push(t[n-1]*e[n]):i.push(e[n]/t[n-1]):i.push(e[n]);return i}function hE(e,t){let n=[0];for(let r=0;r<t;++r)n.push(e[r][0]);return n}function gE(e,t,n){let r=e.slice(0,1);for(let i=0;i<n;++i)r.push(e[i+1]-t[i][0]-t[i][1]);return r}var _E=o((()=>{})),vE,yE,bE=o((()=>{vE=1.7580993408473768,yE=1.0507009873554805})),xE,SE,CE,wE,TE,EE,DE=o((()=>{xE=.3275911,SE=.254829592,CE=-.284496736,wE=1.421413741,TE=-1.453152027,EE=1.061405429}));function OE(e,t){if(e.length!==t.length)throw Error(`Cannot merge real and imag arrays of different lengths. real:${e.length}, imag: ${t.length}.`);let n=new Float32Array(e.length*2);for(let r=0;r<n.length;r+=2)n[r]=e[r/2],n[r+1]=t[r/2];return n}function kE(e){let t=new Float32Array(e.length/2),n=new Float32Array(e.length/2);for(let r=0;r<e.length;r+=2)t[r/2]=e[r],n[r/2]=e[r+1];return{real:t,imag:n}}function AE(e){let t=Math.ceil(e.length/4),n=new Float32Array(t),r=new Float32Array(t);for(let t=0;t<e.length;t+=4)n[Math.floor(t/4)]=e[t],r[Math.floor(t/4)]=e[t+1];return{real:n,imag:r}}function jE(e){let t=Math.floor(e.length/4),n=new Float32Array(t),r=new Float32Array(t);for(let t=2;t<e.length;t+=4)n[Math.floor(t/4)]=e[t],r[Math.floor(t/4)]=e[t+1];return{real:n,imag:r}}function ME(e,t){return{real:e[t*2],imag:e[t*2+1]}}function NE(e,t,n,r){e[r*2]=t,e[r*2+1]=n}function PE(e,t){let n=new Float32Array(e/2),r=new Float32Array(e/2);for(let i=0;i<Math.ceil(e/2);i++){let a=(t?2:-2)*Math.PI*(i/e);n[i]=Math.cos(a),r[i]=Math.sin(a)}return{real:n,imag:r}}function FE(e,t,n){let r=(n?2:-2)*Math.PI*(e/t);return{real:Math.cos(r),imag:Math.sin(r)}}var IE=o((()=>{}));function LE(e,t){e=e.replace(/\s/g,``);let n=(e.length-e.replace(WE,``).length)/2;if(n<1)throw Error(`Equations without an arrow are not supported.`);if(n>1)throw Error(`Equation must contain exactly one arrow ("${UE}").`);let[r,i]=e.split(UE);E(r.indexOf(KE)===-1,()=>`The ellipsis notation ("${KE}") is not supported yet.`);let a=r.split(GE),o=a.length;if(t!==o)throw Error(`Expected ${o} input tensors, received ${t}`);if(o>2)throw Error(`Support for more than 2 input tensors is not implemented yet.`);let s=[];for(let e=0;e<i.length;++e){let t=i[e];if(!a.some(e=>e.indexOf(t)!==-1))throw Error(`Output subscripts contain the label ${t} not present in the input subscripts.`);s.indexOf(t)===-1&&s.push(t)}for(let e=0;e<r.length;++e){let t=r[e];s.indexOf(t)===-1&&t!==GE&&s.push(t)}let c=Array(a.length);for(let e=0;e<o;++e){if(new Set(a[e].split(``)).size!==a[e].length)throw Error(`Found duplicate axes in input component ${a[e]}. Support for duplicate axes in input is not implemented yet.`);c[e]=[];for(let t=0;t<a[e].length;++t)c[e].push(s.indexOf(a[e][t]))}let l=s.length,u=i.length,d=[];for(let e=u;e<l;++e)d.push(e);return{allDims:s,summedDims:d,idDims:c}}function RE(e,t){let n=Array(e);n.fill(-1);for(let e=0;e<t.length;++e)n[t[e]]=e;let r=[];for(let t=0;t<e;++t)n[t]===-1&&r.push(t);return n=n.filter(e=>e!==-1),{permutationIndices:n,expandDims:r}}function zE(e,t,n){let r=Array(e);for(let e=0;e<n.length;++e){let i=n[e].shape;for(let n=0;n<t[e].length;++n)r[t[e][n]]===void 0?r[t[e][n]]=i[n]:E(r[t[e][n]]===i[n],()=>`Expected dimension ${r[t[e][n]]} at axis ${n} of input shaped ${JSON.stringify(i)}, but got dimension ${i[n]}`)}}function BE(e,t){let n=e,r=[],i=0;e.length===0&&n.push(-1),i=e.length+1;for(let e=0;e<i;++e)r.push([]);let a=[];for(let e=0;e<n.length;++e){let i=n[e],o=HE(t,i);for(let t of o)a.indexOf(t)===-1&&(r[e].push(t),a.push(t))}return{path:n,steps:r}}function VE(e){return e.every((e,t)=>e===t)}function HE(e,t){let n=[];for(let r=0;r<e.length;++r)(e[r].length===0||e[r].indexOf(t)!==-1||t===-1)&&n.push(r);return n}var UE,WE,GE,KE,qE=o((()=>{Pe(),UE=`->`,WE=/->/g,GE=`,`,KE=`...`}));function JE(e,t,n=0){let r=[];if(typeof t==`number`)E(e.shape[n]%t===0,()=>`Number of splits must evenly divide the axis.`),r=Array(t).fill(e.shape[n]/t);else{E(t.reduce((e,t)=>(t===-1&&(e+=1),e),0)<=1,()=>`There should be only one negative value in split array.`);let i=t.indexOf(-1);if(i!==-1){let r=t.reduce((e,t)=>t>0?e+t:e);t[i]=e.shape[n]-r}E(e.shape[n]===t.reduce((e,t)=>e+t),()=>`The sum of sizes must match the size of the axis dimension.`),r=t}return r}var YE=o((()=>{P()}));function XE(e){return`Received SparseTensor with denseShape[0] = 0 but
  indices.shape[0] = ${e}`}function ZE(e,t){return`indices(${e}, 0) is invalid: ${t} < 0`}function QE(e,t,n){return`indices(${e}, 0) is invalid: ${t} >= ${n}`}var $E=o((()=>{}));function eD(e,t){return`only one output dimension may be -1, not both ${e} and ${t}`}function tD(e,t){return`size ${e} must be non-negative, not ${t}`}function nD(){return`reshape cannot infer the missing input size for an empty tensor unless all specified input sizes are non-zero`}function rD(e,t){return`Input to reshape is a SparseTensor with ${O(e)}
  dense values, but the requested shape requires a multiple of ${O(t)}. inputShape=${e} outputShape= ${t}`}function iD(e,t){return`Input to reshape is a tensor with ${O(e)} dense values, but the requested shape has ${O(t)}. inputShape=${e} outputShape=${t}`}var aD=o((()=>{P()}));function oD(){return`segment ids must be >= 0`}function sD(){return`segment ids are not increasing`}function cD(e,t){return`Segment id ${e} out of range [0, ${t}), possibly because segmentIds input is not sorted.`}function lD(e,t,n){return`Bad: indices[${e}] == ${t} out of range [0, ${n})`}var uD=o((()=>{})),dD=c({collectGatherOpShapeInfo:()=>mD,computeOutShape:()=>pD,segOpComputeOptimalWindowSize:()=>fD});function fD(e,t){let n=!1,r;for(e<=30?(r=e,n=!0):r=Ce(e,Math.floor(Math.sqrt(e)));!n;)r>t||r===e?n=!0:r=Ce(e,r+1);return r}function pD(e,t,n){let r=[],i=e.length;for(let a=0;a<i;a++)a===t?r.push(n):r.push(e[a]);return r}function mD(e,t,n,r){let i=t.shape.length,a=e.shape.length;if(r!==0&&(r<-i||r>i))throw Error(`Expect batchDims in the range of [-${i}, ${i}], but got ${r}`);if(r<0&&(r+=i),r>a)throw Error(`batchDims (${r}) must be less than rank(x) (
    ${a}).`);if(n<r)throw Error(`batchDims (${r}) must be less than or equal to axis (${n}).`);for(let n=0;n<r;++n)if(e.shape[n]!==t.shape[n])throw Error(`x.shape[${n}]: ${e.shape[n]} should be equal to indices.shape[${n}]: ${t.shape[n]}.`);let o=e.shape[n],s=[],c=1,l=1,u=1;for(let t=0;t<r;++t)s.push(e.shape[t]),c*=e.shape[t];for(let t=r;t<n;t++)s.push(e.shape[t]),l*=e.shape[t];for(let e=r;e<i;e++)s.push(t.shape[e]);for(let t=n+1;t<a;t++)s.push(e.shape[t]),u*=e.shape[t];return{batchSize:c,sliceSize:u,outerSize:l,dimSize:o,outputShape:s}}var hD=o((()=>{P(),lE()})),gD=c({ERF_A1:()=>SE,ERF_A2:()=>CE,ERF_A3:()=>wE,ERF_A4:()=>TE,ERF_A5:()=>EE,ERF_P:()=>xE,PARALLELIZE_THRESHOLD:()=>30,RowPartitionType:()=>oE,SELU_SCALE:()=>yE,SELU_SCALEALPHA:()=>vE,applyActivation:()=>zb,assertAndGetBroadcastShape:()=>K,assertAxesAreInnerMostDims:()=>bf,assertParamsConsistent:()=>QT,assignToTypedArray:()=>NE,axesAreInnerMostDims:()=>gf,calculateShapes:()=>Oy,checkEinsumDimSizes:()=>zE,checkPadOnDimRoundingMode:()=>Sl,combineLocations:()=>_f,combineRaggedTensorToTensorShapes:()=>nE,complexWithEvenIndex:()=>AE,complexWithOddIndex:()=>jE,computeConv2DInfo:()=>sl,computeConv3DInfo:()=>cl,computeDefaultPad:()=>dl,computeDilation2DInfo:()=>il,computeOptimalWindowSize:()=>cE,computeOutAndReduceShapes:()=>vf,computeOutShape:()=>$T,computePool2DInfo:()=>al,computePool3DInfo:()=>ol,convertConv2DDataFormat:()=>xl,decodeEinsumEquation:()=>LE,eitherStridesOrDilationsAreOne:()=>yl,expandShapeToKeepDim:()=>yf,exponent:()=>FE,exponents:()=>PE,fromStringArrayToUint8:()=>vD,fromUint8ToStringArray:()=>_D,getAxesPermutation:()=>xf,getBroadcastDims:()=>zd,getComplexWithIndex:()=>ME,getEinsumComputePath:()=>BE,getEinsumPermutation:()=>RE,getFusedBiasGradient:()=>Rb,getFusedDyActivation:()=>Lb,getImageCenter:()=>uE,getInnerMostAxes:()=>Cf,getPermuted:()=>pE,getRaggedRank:()=>iE,getReductionAxes:()=>Bd,getReshaped:()=>fE,getReshapedPermuted:()=>mE,getRowPartitionTypesHelper:()=>rE,getSliceBeginCoords:()=>hE,getSliceSize:()=>gE,getSparseFillEmptyRowsIndicesDenseShapeMismatch:()=>XE,getSparseFillEmptyRowsNegativeIndexErrorMessage:()=>ZE,getSparseFillEmptyRowsOutOfRangeIndexErrorMessage:()=>QE,getSparseReshapeEmptyTensorZeroOutputDimErrorMessage:()=>nD,getSparseReshapeInputOutputMismatchErrorMessage:()=>iD,getSparseReshapeInputOutputMultipleErrorMessage:()=>rD,getSparseReshapeMultipleNegativeOneOutputDimErrorMessage:()=>eD,getSparseReshapeNegativeOutputDimErrorMessage:()=>tD,getSparseSegmentReductionIndicesOutOfRangeErrorMessage:()=>lD,getSparseSegmentReductionNegativeSegmentIdsErrorMessage:()=>oD,getSparseSegmentReductionNonIncreasingSegmentIdsErrorMessage:()=>sD,getSparseSegmentReductionSegmentIdOutOfRangeErrorMessage:()=>cD,getUndoAxesPermutation:()=>Sf,isIdentityPermutation:()=>VE,log:()=>Jr,mergeRealAndImagArrays:()=>OE,prepareAndValidate:()=>yT,prepareSplitSize:()=>JE,segment_util:()=>dD,shouldFuse:()=>Bb,slice_util:()=>xT,splitRealAndImagArrays:()=>kE,stridesOrDilationsArePositive:()=>bl,tupleValuesAreOne:()=>vl,upcastType:()=>fa,validateDefaultValueShape:()=>aE,validateInput:()=>Dy,validateUpdateShape:()=>Ey,warn:()=>qr});function _D(e){try{return e.map(e=>Li(e))}catch(e){throw Error(`Failed to decode encoded string bytes into utf-8, error: ${e}`)}}function vD(e){return e.map(e=>Ii(e))}var yD=o((()=>{P(),wf(),Vd(),eE(),Cl(),Vb(),tE(),sE(),lE(),HT(),Sa(),dE(),_E(),bT(),ky(),bE(),Vb(),DE(),Yr(),IE(),qE(),YE(),$E(),aD(),uD(),hD()})),bD=c({nonMaxSuppressionV3Impl:()=>Hx,nonMaxSuppressionV4Impl:()=>Ux,nonMaxSuppressionV5Impl:()=>Wx,whereImpl:()=>Qy}),xD=o((()=>{Yx(),$y()})),SD=o((()=>{Zw(),nT(),Vd(),_T(),bT(),ky(),HT(),XC(),Aa(),$g(),P(),WT(),ew(),nw(),iw(),ow(),uw(),QC(),KT(),fw(),cw(),da(),Sa(),HC(),FS(),JT(),jo(),si(),um(),He(),ZT(),yD(),Ua(),xD(),_(),N()})),CD=c({Abs:()=>`Abs`,Acos:()=>Je,Acosh:()=>Ye,AdadeltaOptimizer:()=>$C,AdagradOptimizer:()=>tw,AdamOptimizer:()=>rw,AdamaxOptimizer:()=>aw,Add:()=>`Add`,AddN:()=>Xe,All:()=>`All`,Any:()=>`Any`,ArgMax:()=>Ze,ArgMin:()=>Qe,Asin:()=>$e,Asinh:()=>et,Atan:()=>tt,Atan2:()=>rt,Atanh:()=>nt,AvgPool:()=>it,AvgPool3D:()=>ot,AvgPool3DGrad:()=>st,AvgPoolGrad:()=>at,BatchMatMul:()=>ct,BatchToSpaceND:()=>lt,Bincount:()=>ut,BitwiseAnd:()=>dt,BroadcastArgs:()=>pt,BroadcastTo:()=>ft,Cast:()=>mt,Ceil:()=>ht,ClipByValue:()=>gt,Complex:()=>_t,ComplexAbs:()=>vt,Concat:()=>yt,Conv2D:()=>bt,Conv2DBackpropFilter:()=>xt,Conv2DBackpropInput:()=>St,Conv3D:()=>Ct,Conv3DBackpropFilterV2:()=>wt,Conv3DBackpropInputV2:()=>Tt,Cos:()=>`Cos`,Cosh:()=>Et,CropAndResize:()=>kt,Cumprod:()=>Dt,Cumsum:()=>Ot,DataStorage:()=>h,DenseBincount:()=>At,DepthToSpace:()=>jt,DepthwiseConv2dNative:()=>Mt,DepthwiseConv2dNativeBackpropFilter:()=>Nt,DepthwiseConv2dNativeBackpropInput:()=>Pt,Diag:()=>Ft,Dilation2D:()=>It,Dilation2DBackpropFilter:()=>Rt,Dilation2DBackpropInput:()=>Lt,Draw:()=>zt,ENV:()=>Ve,Einsum:()=>Vt,Elu:()=>`Elu`,EluGrad:()=>Ht,Environment:()=>Be,Equal:()=>Ut,Erf:()=>`Erf`,Exp:()=>`Exp`,ExpandDims:()=>Wt,Expm1:()=>Gt,FFT:()=>`FFT`,Fill:()=>Kt,FlipLeftRight:()=>qt,Floor:()=>Jt,FloorDiv:()=>Yt,FromPixels:()=>Hr,FusedBatchNorm:()=>Xt,FusedConv2D:()=>Gr,FusedDepthwiseConv2D:()=>Kr,GatherNd:()=>Qt,GatherV2:()=>Zt,Greater:()=>$t,GreaterEqual:()=>en,IFFT:()=>nn,Identity:()=>tn,Imag:()=>rn,IsFinite:()=>an,IsInf:()=>on,IsNan:()=>sn,KernelBackend:()=>g,LRN:()=>`LRN`,LRNGrad:()=>yn,LeakyRelu:()=>cn,Less:()=>ln,LessEqual:()=>un,LinSpace:()=>dn,Log:()=>`Log`,Log1p:()=>fn,LogSoftmax:()=>_n,LogicalAnd:()=>pn,LogicalNot:()=>mn,LogicalOr:()=>hn,LogicalXor:()=>gn,LowerBound:()=>vn,MatrixBandPart:()=>bn,Max:()=>`Max`,MaxPool:()=>Sn,MaxPool3D:()=>wn,MaxPool3DGrad:()=>Tn,MaxPoolGrad:()=>Cn,MaxPoolWithArgmax:()=>En,Maximum:()=>xn,Mean:()=>Dn,Min:()=>`Min`,Minimum:()=>On,MirrorPad:()=>kn,Mod:()=>`Mod`,MomentumOptimizer:()=>lw,Multinomial:()=>An,Multiply:()=>jn,Neg:()=>`Neg`,NonMaxSuppressionV3:()=>Nn,NonMaxSuppressionV4:()=>Pn,NonMaxSuppressionV5:()=>Fn,NotEqual:()=>Mn,OP_SCOPE_SUFFIX:()=>Xa,OneHot:()=>Ln,OnesLike:()=>In,Optimizer:()=>ZC,OptimizerConstructors:()=>GT,Pack:()=>Rn,PadV2:()=>zn,Pool:()=>Bn,Pow:()=>`Pow`,Prelu:()=>Vn,Prod:()=>Hn,RMSPropOptimizer:()=>dw,RaggedGather:()=>Un,RaggedRange:()=>Wn,RaggedTensorToTensor:()=>Gn,Range:()=>Kn,Rank:()=>ga,Real:()=>qn,RealDiv:()=>Bt,Reciprocal:()=>Jn,Reduction:()=>PS,Relu:()=>Yn,Relu6:()=>tr,Reshape:()=>Xn,ResizeBilinear:()=>$n,ResizeBilinearGrad:()=>er,ResizeNearestNeighbor:()=>Zn,ResizeNearestNeighborGrad:()=>Qn,Reverse:()=>nr,RotateWithOffset:()=>Ur,Round:()=>rr,Rsqrt:()=>ir,SGDOptimizer:()=>sw,ScatterNd:()=>ar,SearchSorted:()=>sr,Select:()=>cr,Selu:()=>lr,Sigmoid:()=>pr,Sign:()=>fr,Sin:()=>`Sin`,Sinh:()=>dr,Slice:()=>ur,Softmax:()=>vr,Softplus:()=>mr,SpaceToBatchND:()=>gr,SparseFillEmptyRows:()=>yr,SparseReshape:()=>br,SparseSegmentMean:()=>xr,SparseSegmentSum:()=>Sr,SparseToDense:()=>Cr,SplitV:()=>_r,Sqrt:()=>hr,Square:()=>Tr,SquaredDifference:()=>wr,StaticRegexReplace:()=>Er,Step:()=>Vr,StridedSlice:()=>Dr,StringNGrams:()=>Or,StringSplit:()=>kr,StringToHashBucketFast:()=>Ar,Sub:()=>`Sub`,Sum:()=>`Sum`,Tan:()=>`Tan`,Tanh:()=>jr,Tensor:()=>la,TensorBuffer:()=>oa,TensorScatterUpdate:()=>or,Tile:()=>Mr,TopK:()=>Nr,Transform:()=>Pr,Transpose:()=>Fr,Unique:()=>Ir,Unpack:()=>Lr,UnsortedSegmentSum:()=>Rr,UpperBound:()=>zr,Variable:()=>ua,ZerosLike:()=>Br,_FusedMatMul:()=>Wr,abs:()=>bc,acos:()=>Cc,acosh:()=>Ec,add:()=>H,addN:()=>kc,all:()=>Mc,any:()=>Fc,argMax:()=>Rc,argMin:()=>Vc,asin:()=>Wc,asinh:()=>qc,atan:()=>Xc,atan2:()=>$c,atanh:()=>nl,avgPool:()=>El,avgPool3d:()=>kl,backend:()=>ko,backend_util:()=>gD,basicLSTMCell:()=>ql,batchNorm:()=>tu,batchNorm2d:()=>iu,batchNorm3d:()=>su,batchNorm4d:()=>uu,batchToSpaceND:()=>Xl,bincount:()=>pu,bitwiseAnd:()=>gu,booleanMaskAsync:()=>ib,broadcastArgs:()=>yu,broadcastTo:()=>Su,broadcast_util:()=>Rd,browser:()=>rT,buffer:()=>V,cast:()=>tc,ceil:()=>Tu,clipByValue:()=>Au,clone:()=>ic,complex:()=>Qa,concat:()=>Ml,concat1d:()=>Nu,concat2d:()=>Iu,concat3d:()=>zu,concat4d:()=>Hu,conv1d:()=>Ju,conv2d:()=>Gu,conv2dTranspose:()=>ed,conv3d:()=>rd,conv3dTranspose:()=>ld,copyRegisteredKernels:()=>ri,cos:()=>fd,cosh:()=>hd,cosineWindow:()=>kb,cumprod:()=>vd,cumsum:()=>xd,customGrad:()=>cm,denseBincount:()=>wd,deprecationWarn:()=>po,depthToSpace:()=>Dd,depthwiseConv2d:()=>Ad,device_util:()=>La,diag:()=>Nd,dilation2d:()=>Id,disableDeprecationWarnings:()=>fo,dispose:()=>yo,disposeVariables:()=>mo,div:()=>hc,divNoNan:()=>Qd,dot:()=>tf,dropout:()=>Eb,einsum:()=>af,elu:()=>cf,enableDebugMode:()=>uo,enableProdMode:()=>lo,enclosingPowerOfTwo:()=>Ob,engine:()=>ho,ensureShape:()=>df,env:()=>M,equal:()=>Ud,erf:()=>mf,euclideanNorm:()=>Xf,exp:()=>$f,expandDims:()=>np,expm1:()=>ap,eye:()=>dp,fft:()=>Fv,fill:()=>Du,findBackend:()=>Eo,findBackendFactory:()=>Do,floor:()=>mp,floorDiv:()=>fc,fused:()=>rx,gather:()=>_p,gatherND:()=>xb,gather_util:()=>vT,getBackend:()=>wo,getGradient:()=>Zr,getKernel:()=>Xr,getKernelsForBackend:()=>Qr,grad:()=>rm,grads:()=>im,greater:()=>bp,greaterEqual:()=>Cp,ifft:()=>Rv,imag:()=>Ep,image:()=>LC,inTopKAsync:()=>Mb,io:()=>Xw,irfft:()=>Vv,isFinite:()=>kp,isInf:()=>Mp,isNaN:()=>Fp,keep:()=>bo,kernel_impls:()=>bD,leakyRelu:()=>Rp,less:()=>Vp,lessEqual:()=>Wp,linalg:()=>RC,linspace:()=>Kp,localResponseNormalization:()=>Yp,log:()=>Qp,log1p:()=>tm,logSigmoid:()=>vm,logSoftmax:()=>Cm,logSumExp:()=>Em,logicalAnd:()=>km,logicalNot:()=>Mm,logicalOr:()=>Fm,logicalXor:()=>Rm,losses:()=>zC,lowerBound:()=>Wm,matMul:()=>Fl,math:()=>tT,max:()=>Ef,maxPool:()=>qm,maxPool3d:()=>Xm,maxPoolWithArgmax:()=>$m,maximum:()=>nh,mean:()=>ah,memory:()=>go,meshgrid:()=>dh,min:()=>kf,minimum:()=>mh,mirrorPad:()=>_h,mod:()=>bh,moments:()=>Ch,movingAverage:()=>ub,mul:()=>U,multiRNNCell:()=>Eh,multinomial:()=>kh,neg:()=>fm,nextFrame:()=>YT,norm:()=>qf,notEqual:()=>Mh,oneHot:()=>Fh,ones:()=>lh,onesLike:()=>Rh,op:()=>z,outerProduct:()=>Vh,pad:()=>Wh,pad1d:()=>qh,pad2d:()=>Xh,pad3d:()=>$h,pad4d:()=>ng,pool:()=>ug,pow:()=>Mf,prelu:()=>pg,print:()=>oc,prod:()=>gg,profile:()=>_o,raggedGather:()=>yg,raggedRange:()=>Sg,raggedTensorToTensor:()=>Tg,rand:()=>Og,randomGamma:()=>o_,randomNormal:()=>l_,randomStandardNormal:()=>f_,randomUniform:()=>h_,randomUniformInt:()=>v_,range:()=>b_,ready:()=>Co,real:()=>C_,reciprocal:()=>E_,registerBackend:()=>Oo,registerGradient:()=>ei,registerKernel:()=>$r,relu:()=>k_,relu6:()=>M_,removeBackend:()=>To,reshape:()=>W,reverse:()=>F_,reverse1d:()=>R_,reverse2d:()=>V_,reverse3d:()=>W_,reverse4d:()=>q_,rfft:()=>qv,round:()=>X_,rsqrt:()=>$_,scalar:()=>Pf,scatterND:()=>pb,scatter_util:()=>Ty,searchSorted:()=>Hm,selu:()=>nv,separableConv2d:()=>av,serialization:()=>UC,setBackend:()=>So,setPlatform:()=>Ao,setdiff1dAsync:()=>cv,sigmoid:()=>Rl,sign:()=>dv,signal:()=>IC,sin:()=>mv,sinh:()=>_v,slice:()=>Vl,slice1d:()=>bv,slice2d:()=>Cv,slice3d:()=>Ev,slice4d:()=>kv,slice_util:()=>xT,softmax:()=>Mv,softplus:()=>hm,spaceToBatchND:()=>ag,sparse:()=>BC,sparseToDense:()=>vb,spectral:()=>FC,split:()=>Wv,sqrt:()=>Lf,square:()=>Bf,squaredDifference:()=>Xv,squeeze:()=>$v,stack:()=>ny,step:()=>ay,stridedSlice:()=>cy,string:()=>VC,sub:()=>q,sum:()=>Uf,sumOutType:()=>pa,tan:()=>dy,tanh:()=>Wl,tensor:()=>no,tensor1d:()=>py,tensor2d:()=>hy,tensor3d:()=>_y,tensor4d:()=>yy,tensor5d:()=>xy,tensor6d:()=>Cy,tensorScatterUpdate:()=>jy,tensor_util:()=>Ca,test_util:()=>Rg,tidy:()=>vo,tile:()=>cp,time:()=>xo,topk:()=>Py,train:()=>qT,transpose:()=>sb,truncatedNormal:()=>Ly,unique:()=>By,unregisterGradient:()=>ni,unregisterKernel:()=>ti,unsortedSegmentSum:()=>Uy,unstack:()=>Ky,upcastType:()=>fa,upperBound:()=>Jy,util:()=>Ai,valueAndGrad:()=>am,valueAndGrads:()=>om,variable:()=>Xy,variableGrads:()=>sm,version_core:()=>UT,where:()=>Kd,whereAsync:()=>tb,zeros:()=>sh,zerosLike:()=>Yd}),J=o((()=>{cc(),hw(),SD(),pw()}));J();function Y(e,t){Array.isArray(e)||(e=[e]),e.forEach(e=>{e!=null&&E(e.dtype!==`complex64`,()=>`${t} does not support complex64 tensors in the CPU backend.`)})}J();var wD=Qy,TD=class e extends g{nextDataId(){return e.nextDataId++}constructor(){super(),this.blockSize=48,this.firstUse=!0,this.data=new h(this,ho())}write(e,t,n){this.firstUse&&(this.firstUse=!1,M().get(`IS_NODE`)&&qr(`
============================
Hi, looks like you are running TensorFlow.js in Node.js. To speed things up dramatically, install our node backend, visit https://github.com/tensorflow/tfjs-node for more details. 
============================`));let r={id:this.nextDataId()};return this.data.set(r,{values:e,dtype:n,refCount:1}),r}makeTensorInfo(e,t,n){let r;if(t===`string`&&n!=null&&n.length>0&&ve(n[0])){let i=n.map(e=>Ii(e));r=this.write(i,e,t)}else r=this.write(n,e,t);return{dataId:r,shape:e,dtype:t}}refCount(e){return this.data.has(e)?this.data.get(e).refCount:0}incRef(e){let t=this.data.get(e);t.refCount++}decRef(e){if(this.data.has(e)){let t=this.data.get(e);t.refCount--}}move(e,t,n,r,i){this.data.set(e,{values:t,dtype:r,refCount:i})}numDataIds(){return this.data.numDataIds()}async read(e){return this.readSync(e)}readSync(e){let{dtype:t,complexTensorInfos:n}=this.data.get(e);return t===`complex64`?OE(this.readSync(n.real.dataId),this.readSync(n.imag.dataId)):Ee(this.data.get(e).values,t)}bufferSync(e){let t=this.readSync(e.dataId);if(e.dtype===`string`)try{let n=t.map(e=>Li(e));return V(e.shape,e.dtype,n)}catch{throw Error(`Failed to decode encoded string bytes into utf-8`)}return V(e.shape,e.dtype,t)}makeOutput(e,t,n){return ho().makeTensorFromTensorInfo(this.makeTensorInfo(t,n,e),this)}disposeData(e,t=!1){if(this.data.has(e)){if(this.data.get(e).refCount--,!t&&this.data.get(e).refCount>0)return!1;let{complexTensorInfos:n}=this.data.get(e);n!=null&&(this.disposeData(n.real.dataId,!0),this.disposeData(n.imag.dataId,!0)),this.data.delete(e)}return!0}disposeIntermediateTensorInfo(e){this.disposeData(e.dataId)}async time(e){let t=Pi();return e(),{kernelMs:Pi()-t}}memory(){return{unreliable:!0,reasons:[`The reported memory is an upper bound. Due to automatic garbage collection, the true allocated memory may be less.`]}}where(e){Y([e],`where`);let t=this.readSync(e.dataId);return wD(e.shape,t)}dispose(){}floatPrecision(){return 32}epsilon(){return super.epsilon()}};TD.nextDataId=0,J();function ED(e){let t=new Float32Array(e.length);for(let n=0;n<e.length;++n)t[n]=Math.abs(e[n]);return t}var DD={kernelName:`Abs`,backendName:`cpu`,kernelFunc:e=>{let{x:t}=e.inputs,n=e.backend;Y(t,`abs`);let r=new Float32Array(O(t.shape)),i=n.data.get(t.dataId).values;return r=ED(i),n.makeOutput(r,t.shape,t.dtype)}};J();function OD(e){return(t,n,r,i,a)=>{let o=K(t,n),s=o.length,c=j(o),l=de(a,O(o)),u=t.length,d=n.length,f=j(t),p=j(n),m=zd(t,o),h=zd(n,o);if(m.length+h.length===0)for(let t=0;t<l.length;++t)l[t]=e(r[t%r.length],i[t%i.length]);else for(let t=0;t<l.length;++t){let n=Me(t,s,c),a=n.slice(-u);m.forEach(e=>a[e]=0);let o=je(a,u,f),g=n.slice(-d);h.forEach(e=>g[e]=0);let _=je(g,d,p);l[t]=e(r[o],i[_])}return[l,o]}}J();function kD(e){let{inputs:t,backend:n}=e,{real:r,imag:i}=t,a=n.data.get(r.dataId).values,o=n.data.get(i.dataId).values,s=n.makeTensorInfo(r.shape,`complex64`),c=n.data.get(s.dataId);return c.complexTensorInfos={real:n.makeTensorInfo(r.shape,`float32`,a),imag:n.makeTensorInfo(i.shape,`float32`,o)},s}var AD={kernelName:_t,backendName:`cpu`,kernelFunc:kD};J();function jD(e,t,n=`float32`){if(n===`complex64`)return kD({inputs:{real:jD(e,t,`float32`),imag:jD(e,t,`float32`)},backend:e});let r=Oe(O(t),n);return e.makeTensorInfo(t,n,r)}J();function MD(e){let{inputs:t,backend:n}=e,{x:r}=t;return n.incRef(r.dataId),{dataId:r.dataId,shape:r.shape,dtype:r.dtype}}var ND={kernelName:tn,backendName:`cpu`,kernelFunc:MD};J();function PD(e){let{inputs:t,backend:n}=e,{input:r}=t,i=n.data.get(r.dataId).complexTensorInfos.real,a=n.data.get(i.dataId).values;return n.makeTensorInfo(i.shape,i.dtype,a)}var FD={kernelName:qn,backendName:`cpu`,kernelFunc:PD};J();function ID(e,t,n,r){if(r===`int32`)return[t,`int32`,Int32Array.from(e)];if(r===`bool`){let r=Ni([0],n),[i,a]=OD((e,t)=>e===t?0:1)(t,[],e,r,`bool`);return[a,`bool`,i]}throw Error(`Error in Cast: failed to cast ${n} to ${r}`)}function LD(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{dtype:a}=r;if(a===`complex64`){if(i.dtype===`complex64`)return MD({inputs:{x:i},backend:n});let e=jD(n,i.shape,i.dtype),t=LD({inputs:{x:i},backend:n,attrs:{dtype:`float32`}}),r=kD({inputs:{real:t,imag:e},backend:n});return n.disposeIntermediateTensorInfo(e),n.disposeIntermediateTensorInfo(t),r}if(i.dtype===`complex64`){let e=PD({inputs:{input:i},backend:n}),t=LD({inputs:{x:e},backend:n,attrs:{dtype:a}});return n.disposeIntermediateTensorInfo(e),t}if(!he(i.dtype,a)){let e=MD({inputs:{x:i},backend:n});return{dataId:e.dataId,shape:e.shape,dtype:a}}let o=n.data.get(i.dataId).values,[s,c,l]=ID(o,i.shape,i.dtype,a);return n.makeTensorInfo(s,c,l)}var RD={kernelName:mt,backendName:`cpu`,kernelFunc:LD};J();function zD(e,t,n,r){return n==null?({inputs:n,backend:i})=>{let{a,b:o}=n,s=i;Y([a,o],e);let c=s.data.get(a.dataId).values,l=s.data.get(o.dataId).values,u=a.dtype===`string`?_D(c):c,d=a.dtype===`string`?_D(l):l,f=r||a.dtype,[p,m]=t(a.shape,o.shape,u,d,f);return s.makeTensorInfo(m,f,p)}:({inputs:e,backend:i})=>{let{a,b:o}=e,s=i;if(a.dtype===`complex64`||o.dtype===`complex64`){let e=LD({inputs:{x:a},backend:s,attrs:{dtype:`complex64`}}),t=s.data.get(e.dataId),r=t.complexTensorInfos.real,i=t.complexTensorInfos.imag,c=s.data.get(r.dataId).values,l=s.data.get(i.dataId).values,u=LD({inputs:{x:o},backend:s,attrs:{dtype:`complex64`}}),d=s.data.get(u.dataId),f=d.complexTensorInfos.real,p=d.complexTensorInfos.imag,m=s.data.get(f.dataId).values,h=s.data.get(p.dataId).values,[g,_,v]=n(a.shape,o.shape,c,l,m,h),y=s.makeTensorInfo(v,`float32`,g),b=s.makeTensorInfo(v,`float32`,_),x=kD({inputs:{real:y,imag:b},backend:s});return s.disposeIntermediateTensorInfo(e),s.disposeIntermediateTensorInfo(u),s.disposeIntermediateTensorInfo(y),s.disposeIntermediateTensorInfo(b),x}else{let e=s.data.get(a.dataId).values,n=s.data.get(o.dataId).values,i=r||a.dtype,[c,l]=t(a.shape,o.shape,e,n,i);return s.makeTensorInfo(l,i,c)}}}function BD(e){return(t,n,r,i,a,o)=>{let s=K(t,n),c=O(s),l=s.length,u=j(s),d=de(`float32`,c),f=de(`float32`,c),p=zd(t,s),m=zd(n,s),h=OE(r,i),g=OE(a,o),_=t.length,v=j(t),y=n.length,b=j(n);if(p.length+m.length===0)for(let t=0;t<d.length;t++){let n=t%h.length,r=t%g.length,i=e(h[n*2],h[n*2+1],g[r*2],g[r*2+1]);d[t]=i.real,f[t]=i.imag}else for(let t=0;t<d.length;t++){let n=Me(t,l,u),r=n.slice(-_);p.forEach(e=>r[e]=0);let i=je(r,_,v),a=n.slice(-y);m.forEach(e=>a[e]=0);let o=je(a,y,b),s=e(h[i*2],h[i*2+1],g[o*2],g[o*2+1]);d[t]=s.real,f[t]=s.imag}return[d,f,s]}}J();var VD=OD(((e,t)=>e+t)),HD=zD(`Add`,VD,BD(((e,t,n,r)=>({real:e+n,imag:t+r})))),UD={kernelName:`Add`,backendName:`cpu`,kernelFunc:HD};J();function WD(e,t,n,r,i){let a=O(r),o=Oe(i,n);for(let n=0;n<e.length;n++){let r=e[n];if(r<0)throw Error(`Input x must be non-negative!`);r>=i||(a>0?o[r]+=t[n]:o[r]+=1)}return o}function GD(e,t,n,r=!1){let i=e.shape[0],a=e.shape[1],o=V([i,n],t.dtype);for(let s=0;s<i;s++)for(let i=0;i<a;i++){let a=e.get(s,i);if(a<0)throw Error(`Input x must be non-negative!`);a>=n||(r?o.set(1,s,a):t.size>0?o.set(o.get(s,a)+t.get(s,i),s,a):o.set(o.get(s,a)+1,s,a))}return o}J();var KD=OD(((e,t)=>e&t)),qD=zD(dt,KD),JD={kernelName:dt,backendName:`cpu`,kernelFunc:qD};J();function YD(e){return(t,n,r)=>{let i=fe(n,t.length);for(let n=0;n<t.length;++n)i[n]=e(t[n],r);return i}}J();function XD(e,t,n){return ZD(e,YD(t),n)}function ZD(e,t,n){return({inputs:r,attrs:i,backend:a})=>{let{x:o}=r;Y(o,e);let s=a,c=s.data.get(o.dataId).values,l;if(o.dtype===`string`){if(!Array.isArray(c))throw Error(`String tensor's value was not an instance of Array`);l=_D(c)}else l=c;let u=n||o.dtype,d=t(l,u,i);return s.makeTensorInfo(o.shape,u,d)}}J();var QD=YD(e=>Math.ceil(e)),$D=ZD(ht,QD),eO={kernelName:ht,backendName:`cpu`,kernelFunc:$D};J();function tO(e,t,n,r){let i=fe(n,O(t));if(r&&n!==`string`){let t=0;e.forEach(e=>{let n=O(e.shape);i.set(e.vals,t),t+=n})}else{let r=0;e.forEach(e=>{let a=n===`string`?_D(e.vals):e.vals,o=0;for(let n=0;n<e.shape[0];++n){let s=n*t[1]+r;for(let t=0;t<e.shape[1];++t)i[s+t]=a[o++]}r+=e.shape[1]})}return i}J();var nO=OD((e,t)=>+(e===t)),rO=zD(Ut,nO,null,`bool`),iO={kernelName:Ut,backendName:`cpu`,kernelFunc:rO};J();var aO=YD(e=>Math.exp(e)),oO=ZD(`Exp`,aO,`float32`),sO={kernelName:`Exp`,backendName:`cpu`,kernelFunc:oO};J();var cO=YD(e=>Math.expm1(e)),lO=ZD(Gt,cO),uO={kernelName:Gt,backendName:`cpu`,kernelFunc:lO};J();var dO=YD(e=>Math.floor(e)),fO=ZD(Jt,dO),pO={kernelName:Jt,backendName:`cpu`,kernelFunc:fO};J();var mO=OD((e,t)=>Math.floor(e/t)),hO=zD(Yt,mO,null,`int32`),gO={kernelName:Yt,backendName:`cpu`,kernelFunc:hO};J();function _O(e,t,n,r,i,a,o,s,c){let l=V([r,a],n);for(let n=0;n<r;n++){let r=[],u=0;for(let t=0;t<i;t++){let a=e[n*i+t];u+=a*o[t],r.push(a)}if(u<0||u>=c/a)throw Error(`Invalid indices: ${r} does not index into ${s}`);for(let e=0;e<a;e++)l.values[n*a+e]=t.get(...t.indexToLoc(u*a+e))}return l}J();function vO(e,t,n){let r=V(n,e.dtype);for(let n=0;n<r.size;++n){let i=r.indexToLoc(n).slice(),a=i[0],o=i[2],s=t.locToIndex([a,o]);i[2]=t.values[s];let c=e.locToIndex(i);0<=c&&c<e.values.length&&(r.values[n]=e.values[c])}return r}J();var yO=OD((e,t)=>+(e>t)),bO=zD($t,yO,null,`bool`),xO={kernelName:$t,backendName:`cpu`,kernelFunc:bO};J();var SO=OD((e,t)=>+(e>=t)),CO=zD(en,SO,null,`bool`),wO={kernelName:en,backendName:`cpu`,kernelFunc:CO};J();var TO=OD((e,t)=>+(e<t)),EO=zD(ln,TO,null,`bool`),DO={kernelName:ln,backendName:`cpu`,kernelFunc:EO};J();var OO=OD((e,t)=>+(e<=t)),kO=zD(un,OO,null,`bool`),AO={kernelName:un,backendName:`cpu`,kernelFunc:kO};J();function jO(e,t,n){let r=(t-e)/(n-1),i=Oe(n,`float32`);i[0]=e;for(let e=1;e<i.length;e++)i[e]=i[e-1]+r;return i}J();var MO=YD(e=>Math.log(e)),NO={kernelName:`Log`,backendName:`cpu`,kernelFunc:ZD(`Log`,MO)};J();function PO(e,t,n,r){let i=de(r,O(n));for(let n=0;n<i.length;++n){let r=n*t,a=e[r];for(let n=0;n<t;++n){let t=e[r+n];(Number.isNaN(t)||t>a)&&(a=t)}i[n]=a}return i}J();var FO=OD(((e,t)=>Math.max(e,t))),IO=zD(xn,FO),LO={kernelName:xn,backendName:`cpu`,kernelFunc:IO};J();var RO=OD(((e,t)=>Math.min(e,t))),zO=zD(On,RO),BO={kernelName:On,backendName:`cpu`,kernelFunc:zO};J();var VO=OD(((e,t)=>e*t)),HO=BD(((e,t,n,r)=>({real:e*n-t*r,imag:e*r+t*n}))),UO=zD(jn,VO,HO),WO={kernelName:jn,backendName:`cpu`,kernelFunc:UO};J();function GO(e,t,n){return VO([],t,ji(-1,n),e,n)}function KO(e){let{inputs:t,backend:n}=e,{x:r}=t;Y(r,`neg`);let i=n.data.get(r.dataId).values,[a,o]=GO(i,r.shape,r.dtype);return n.makeTensorInfo(o,r.dtype,a)}var qO={kernelName:`Neg`,backendName:`cpu`,kernelFunc:KO};J();var JO=OD(((e,t)=>e===t?0:1)),YO=zD(Mn,JO,null,`bool`),XO={kernelName:Mn,backendName:`cpu`,kernelFunc:YO};J();function ZO(e,t,n,r,i){let a=t.length,o=O(t),s=j(t),c=j(i),l=de(n,O(i));for(let t=0;t<o;++t){let n=Me(t,a,s),i=Array(n.length);for(let e=0;e<i.length;e++)i[e]=n[r[e]];let o=je(i,a,c);l[o]=e[t]}return l}J();function QO(e){let{inputs:t,attrs:n,backend:r}=e,{x:i}=t,{perm:a}=n;Y(i,`transpose`);let o=i.shape.length,s=Array(o);for(let e=0;e<s.length;e++)s[e]=i.shape[a[e]];let c=r.data.get(i.dataId).values,l=ZO(c,i.shape,i.dtype,a,s);return{dataId:r.write(l,s,i.dtype),shape:s,dtype:i.dtype}}var $O={kernelName:Fr,backendName:`cpu`,kernelFunc:QO};J();function ek(e,t,n,r){let[i,a]=vf(e,r),o=fa(t,`int32`),s=Oe(O(i),o),c=O(a);for(let e=0;e<s.length;++e){let t=e*c,r=1;for(let e=0;e<c;++e)r*=n[t+e];s[e]=r}return{outVals:s,outShape:i,outDtype:o}}function tk(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r;Y(i,`prod`);let s=i.shape.length,c=A(a,i.shape),l=xf(c,s),u=c,d=i,f=[];l!=null&&(d=QO({inputs:{x:i},backend:n,attrs:{perm:l}}),f.push(d),u=Cf(u.length,s));let p=n.data.get(d.dataId).values,{outVals:m,outShape:h,outDtype:g}=ek(d.shape,d.dtype,p,u),_=h;return o&&(_=yf(h,c)),f.forEach(e=>n.disposeIntermediateTensorInfo(e)),n.makeTensorInfo(_,g,m)}var nk={kernelName:Hn,backendName:`cpu`,kernelFunc:tk};J();function rk(e,t,n){e.forEach((e,r)=>{if(e<0||e>=n){let i=Me(r,t.length,j(t)).join(`,`);throw Error(`indices[${i}] = ${e} is not in [0, ${n})`)}})}function ik(e,t){for(let n=0;n<e.length;++n){let r=e[n],i=n===e.length-1?t:e[n+1].length;if(r.length===0)throw Error(`Ragged splits may not be empty`);if(r[0]<0)throw Error(`Ragged splits must be non-negative`);if(r[r.length-1]>i)throw Error(`Ragged splits must not point past values`);for(let e=1;e<r.length;++e)if(r[e-1]>r[e])throw Error(`Ragged splits must be sorted in ascending order`)}}function ak(e,t,n,r){let i=[],a=0,o=t.length-1+n.length,s=Array(o).fill(null).map(()=>[0]);ik(n,r);let c=1;for(let e=0;e<t.length-1;++e){c*=t[e];let n=t[e+1];for(let t=1;t<c+1;++t)s[e].push(t*n)}for(let r=0;r<e.length;++r){let o=e[r],c=e[r]+1;for(let e=0;e<n.length;++e){let r=n[e],i=e+t.length-1;if(i>=0){let e=s[i],t=e[e.length-1]-r[o];for(let e=o;e<c;++e)s[i].push(r[e+1]+t)}o=r[o],c=r[c]}c!==o&&(i.push([o,c]),a+=c-o)}return{outSplits:s,valueSlices:i,numValues:a}}function ok(e){let t=[];for(let n=0;n<e.length;++n){let r=e[n].length,i=fe(`int32`,r);t.push(i),e[n].forEach((e,t)=>i[t]=e)}return t}function sk(e,t){let n=e.slice(0,t);for(;n.length<t;)n.push(1);for(let r=t;r<e.length;r++)n[t-1]*=e[r];return n}function ck(e,t,n,r,i,a){let o=sk(t,2)[1],s=sk(a,2)[1],c=0;for(let t of n)for(let n=t[0];n<t[1];++n){for(let t=0;t<r;++t)i[c*s+t]=e[n*o+t];++c}}function lk(e,t,n,r,i){let a=t.slice();a[0]=i;let o=fe(n,O(a)),s=e.length;return ck(e,t,r,s===0?0:s/t[0],o,a),[o,a]}function uk(e,t,n,r,i,a,o,s){if(e.length===0)throw Error(`paramsNestedSplits must be non empty`);if(t[0].length===0)throw Error(`Split tensors must not be scalars`);if(rk(a,o,t[0][0]-1),r.length===0)throw Error(`params.rank must be nonzero`);let c=r[0],{outSplits:l,valueSlices:u,numValues:d}=ak(a,o,e,c),f=ok(l),p=lk(n,r,i,u,d);return[f,p[0],p[1]]}J();var dk=2147483647;function fk(e,t,n,r,i,a,o){if(t.length>1)throw Error(`starts must be a scalar or vector`);if(i.length>1)throw Error(`limits must be a scalar or vector`);if(o.length>1)throw Error(`deltas must be a scalar or vector`);let s=t.length===0,c=i.length===0,l=o.length===0,u=[];s||u.push(t[0]),c||u.push(i[0]),l||u.push(o[0]);for(let e=1;e<u.length;++e)if(u[e]!==u[e-1])throw Error(`starts, limits, and deltas must have the same shape`);let d=u.length===0?1:u[0],f=fe(`int32`,d+1);f[0]=0;for(let t=0;t<d;++t){let n=s?e[0]:e[t],i=c?r[0]:r[t],o=l?a[0]:a[t];if(o===0)throw Error(`Requires delta != 0`);let u;if(o>0&&i<n||o<0&&i>n)u=0;else if(u=Math.ceil(Math.abs((i-n)/o)),u>dk)throw Error(`Requires ((limit - start) / delta) <= ${dk}`);f[t+1]=f[t]+u}let p=f[d],m=fe(n,p),h=0;for(let t=0;t<d;++t){let n=f[t+1]-f[t],r=s?e[0]:e[t],i=l?a[0]:a[t];for(let e=0;e<n;++e)m[h++]=r,r+=i}return[f,m]}J();var pk=oE,mk=class e{constructor(e,t,n,r,i,a,o,s,c,l){this.shape=e,this.shapeShape=t,this.values=n,this.valuesShape=r,this.valuesDType=i,this.defaultValue=a,this.defaultValueShape=o,this.rowPartitionValues=s,this.rowPartitionValuesShapes=c,this.rowPartitionTypes=rE(l),this.raggedRank=iE(this.rowPartitionTypes)}getRowPartitionTypeByDimension(e){return this.rowPartitionTypes[0]===pk.FIRST_DIM_SIZE?this.rowPartitionTypes[e+1]:this.rowPartitionTypes[e]}getRowPartitionTensor(e){return this.rowPartitionTypes[0]===pk.FIRST_DIM_SIZE?this.rowPartitionValues[e+1]:this.rowPartitionValues[e]}getMaxWidth(t){let n=this.getRowPartitionTensor(t-1);switch(this.getRowPartitionTypeByDimension(t-1)){case pk.VALUE_ROWIDS:return e.getMaxWidthValueRowID(n);case pk.ROW_SPLITS:return e.getMaxWidthRowSplit(n);default:throw Error(`Cannot handle partition type ${pk[this.getRowPartitionTypeByDimension(t-1)]}`)}}static getMaxWidthRowSplit(e){let t=e.length;if(t===0||t===1)return 0;let n=0;for(let r=0;r<t-1;++r){let t=e[r+1]-e[r];t>n&&(n=t)}return n}static getMaxWidthValueRowID(e){let t=e.length;if(t===0)return 0;let n=0,r=e[0],i=0;for(let a=1;a<t;++a){let t=e[a];t!==r&&(r=t,i=Math.max(a-n,i),n=a)}return Math.max(t-n,i)}tensorShapeFromTensor(e,t,n=!0){if(t.length===0){if(e[0]===-1)return[];throw Error(`The only valid scalar shape tensor is the fully unknown shape specified as -1.`)}return gk(e,n)}calculateOutputSize(e){let t=this.valuesShape,n=this.defaultValueShape;aE(n,t);let r=this.tensorShapeFromTensor(this.shape,this.shapeShape),i=nE(this.raggedRank,r,t);i[0]<0&&(i[0]=e);for(let e=1;e<=this.raggedRank;++e)i[e]<0&&(i[e]=this.getMaxWidth(e));return i}calculateFirstParentOutputIndex(e,t,n){let r=Math.min(e,n),i=[],a=0;for(let e=0;e<r;++e,a+=t)i.push(a);for(let t=r;t<e;++t)i.push(-1);return E(i.length===e,()=>`Final length of result must be equal to firstDimension.`),i}calculateOutputIndexRowSplit(e,t,n,r){let i=e.length,a=[];for(let o=0;o<i-1;++o){let i=e[o+1]-e[o],s=Math.min(r,i),c=t[o];c===-1&&(s=0);for(let e=0;e<s;++e)a.push(c),c+=n;for(let e=0;e<i-s;++e)a.push(-1)}if(i>0&&a.length!==e[i-1])throw Error(`Invalid row split size.`);return a}calculateOutputIndexValueRowID(e,t,n,r){let i=e.length,a=[];if(i===0)return[];let o=0,s=e[0];if(s>=t.length)throw Error(`Got currentValueRowId=${s}, which is not less than ${t.length}`);let c=t[s];a.push(c);for(let l=1;l<i;++l){let i=e[l];if(i===s)c>=0&&(++o,o<r?c+=n:c=-1);else{if(o=0,s=i,i>=t.length)throw Error(`Got nextValueRowId=${i} which is not less than ${t.length}`);c=t[i]}a.push(c)}if(a.length!==e.length)throw Error(`Invalid row ids.`);return a}calculateOutputIndex(e,t,n,r){let i=this.getRowPartitionTensor(e),a=this.getRowPartitionTypeByDimension(e);switch(a){case pk.VALUE_ROWIDS:return this.calculateOutputIndexValueRowID(i,t,n,r);case pk.ROW_SPLITS:if(i.length-1>t.length)throw Error(`Row partition size is greater than output size: ${i.length-1} > ${t.length}`);return this.calculateOutputIndexRowSplit(i,t,n,r);default:throw Error(`Unsupported partition type: ${pk[a]}`)}}getFirstDimensionSize(){let e=this.rowPartitionValues[0];if(this.rowPartitionTypes.length===0)throw Error(`No row_partition_types given.`);let t=this.rowPartitionTypes[0];switch(t){case pk.FIRST_DIM_SIZE:return e[0];case pk.VALUE_ROWIDS:throw Error(`Cannot handle VALUE_ROWIDS in first dimension.`);case pk.ROW_SPLITS:return this.rowPartitionValuesShapes[0][0]-1;default:throw Error(`Cannot handle type ${pk[t]}`)}}compute(){if(this.rowPartitionValues[0].length<=0)throw Error(`Invalid first partition input. Tensor requires at least one element.`);let e=this.getFirstDimensionSize(),t=this.calculateOutputSize(e),n=Array(this.raggedRank+1);n[n.length-1]=1;for(let e=n.length-2;e>=0;--e)n[e]=n[e+1]*t[e+1];let r=gk(t,!1),i=fe(this.valuesDType,O(r));if(n[0]*t[0]>0){let a=this.calculateFirstParentOutputIndex(e,n[0],t[0]);for(let e=1;e<=this.raggedRank;++e)a=this.calculateOutputIndex(e-1,a,n[e],t[e]);this.setOutput(this.raggedRank,a,i,r)}return[r,i]}setOutput(e,t,n,r){if(n.length===0)return;let i=this.values,a=n,o=r.slice();o=o.slice(e+1);let s=O(o),c=t.length,l=this.defaultValue;if(l.length!==s&&l.length!==1){let e=this.defaultValueShape;vo(()=>{l=Su(W(l,e),o).dataSync()})}let u=0,d=0,f=0;for(let e=0;e<=c;++e){let r=e<c?t[e]:-1;if(r===f){++f;continue}if(d<f){let e=i.subarray(u*s);hk(a.subarray(d*s),e,(f-d)*s)}if(e>=c){let e=n.length;r=Math.floor(e/s)}if(r>f)if(this.defaultValue.length===1)a.subarray(f*s,r*s).fill(this.defaultValue[0]),f=r;else for(;r>f;)hk(a.slice(f*s),l,s),++f;r<0?(u=e+1,d=f):(u=e,d=f,f=d+1)}}};function hk(e,t,n){for(let r=0;r<n;r++)e[r]=t[r]}function gk(e,t){let n=[];for(let r of e){if(r<0){if(!t)throw Error(`Dimension ${r} must be >= 0`);if(r<-1)throw Error(`Dimension ${r} must be >= -1`);r=-1}n.push(r)}return n}function _k(e,t,n,r,i,a,o,s,c,l){return new mk(e,t,n,r,i,a,o,s,c,l).compute()}J();function vk(e,t,n,r){if(e===t||e<t&&n<0||t<e&&n>1)return Oe(0,r);let i=Oe(Math.abs(Math.ceil((t-e)/n)),r);t<e&&n===1&&(n=-1),i[0]=e;for(let e=1;e<i.length;e++)i[e]=i[e-1]+n;return i}J();var yk=YD(e=>1/Math.sqrt(e)),bk=ZD(ir,yk),xk={kernelName:ir,backendName:`cpu`,kernelFunc:bk};J();function Sk(e,t,n,r,i,a,o,s,c,l){let u=[r/i,i],d=e.values,f=t.values;if(r===0)return V(n,t.dtype);let p=c instanceof oa?c:V(u,t.dtype);typeof c==`string`||typeof c==`number`?p.values.fill(c):typeof c==`boolean`&&p.values.fill(+c);for(let e=0;e<a;e++){let a=[],c=0;for(let t=0;t<o;t++){let n=d[e*o+t];a.push(n),c+=n*s[t]}if(c<0||c>=r/i)throw Error(`Invalid indices: ${a} does not index into ${n}`);for(let n=0;n<i;n++)l?p.values[c*i+n]+=f[e*i+n]:p.values[c*i+n]=t.rank===0?f[0]:f[e*i+n]}return p}J();var Ck=YD(e=>1/(1+Math.exp(-e))),wk=XD(pr,e=>1/(1+Math.exp(-e))),Tk={kernelName:pr,backendName:`cpu`,kernelFunc:wk};J();function Ek(e,t,n,r,i){let a=PT(r,t,n),o=O(n),s=j(r);if(a){let n=FT(t,s);return i===`string`?e.slice(n,n+o):e.subarray(n,n+o)}let c=V(r,i,i===`string`?_D(e):e),l=V(n,i);for(let e=0;e<l.size;++e){let n=l.indexToLoc(e),r=n.map((e,n)=>e+t[n]);l.set(c.get(...r),...n)}return i===`string`?vD(l.values):l.values}function Dk(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{begin:a,size:o}=r;Y(i,`slice`);let[s,c]=IT(i,a,o);ST(i,s,c);let l=n.data.get(i.dataId).values,u=Ek(l,s,c,i.shape,i.dtype);return n.makeTensorInfo(c,i.dtype,u)}var Ok={kernelName:ur,backendName:`cpu`,kernelFunc:Dk};J();function kk(e,t,n,r,i,a,o){let s=t[0],c=a[0],l=Array(c),u=Array(s),d=t[1];if(c===0){if(s!==0)throw Error(XE(s));let e=fe(n,0),t=fe(i,0);return[e,[0,d],t,l,u]}let f=!0,p=0,m=Array(c).fill(0);for(let t=0;t<s;++t){let n=e[t*d];if(n<0)throw Error(ZE(t,n));if(n>=c)throw Error(QE(t,n,c));++m[n],f&&=n>=p,p=n}let h=!0;for(let e=0;e<c;++e){let t=m[e]===0;l[e]=t,h&&=!t,m[e]=Math.max(m[e],1),e>0&&(m[e]+=m[e-1])}if(h&&f){let t=e,n=r;for(let e=0;e<s;++e)u[e]=e;return[t,[s,d],n,l,u]}else{let t=m[c-1],a=fe(n,t*d),f=fe(i,t),p=Array(c).fill(0);for(let t=0;t<s;++t){let n=e[t*d],i=p[n],o=(n===0?0:m[n-1])+i;p[n]++;for(let n=0;n<d;++n)a[o*d+n]=e[t*d+n];f[o]=r[t],u[t]=o}for(let e=0;e<c;++e)if(p[e]===0){let t=e===0?0:m[e-1];a[t*d+0]=e;for(let e=1;e<d;++e)a[t*d+e]=0;f[t]=o}return[a,[t,d],f,l,u]}}J();function Ak(e,t,n,r,i){let a=O(r),o=t[0],s=i.length,c=[],l=1,u=-1;for(let e=0;e<s;++e){let t=i[e];if(t===-1){if(u!==-1)throw Error(eD(u,e));u=e,c.push(1)}else{if(t<0)throw Error(tD(e,t));l*=t,c.push(t)}}if(u!==-1){if(l<=0)throw Error(nD());let e=Math.trunc(a/l);if(l*e!==a)throw Error(rD(r,c));c[u]=e}if(O(c)!==a)throw Error(iD(r,c));let d=r.length,f=[];if(d>0){f[d-1]=1;for(let e=d-2;e>=0;--e)f[e]=f[e+1]*r[e+1]}let p=[];if(s>0){p[s-1]=1;for(let e=s-2;e>=0;--e)p[e]=p[e+1]*c[e+1]}let m=fe(n,o*s);for(let t=0;t<o;++t){let n=0;for(let r=0;r<d;++r)n+=e[t*d+r]*f[r];for(let e=0;e<s;++e)m[t*s+e]=Math.trunc(n/p[e]),n%=p[e]}return[m,[o,s],c]}J();function jk(e,t,n,r,i,a=!1,o=0){let s=r.length,c=[t[0],e.length/t[0]],l=c[1],u=s>0?i[s-1]+1:0;if(u<0)throw Error(oD());let d=t.slice();d[0]=u;let f=fe(n,d.reduce((e,t)=>e*t,1));if(s===0)return u>0&&f.fill(o),[f,d];if(u<=0)throw Error(oD());let p=0,m=1,h=0,g=i[p];for(;;){let t=0;if(m<s){if(t=i[m],g===t){++m;continue}if(g>=t)throw Error(sD())}if(g<0||g>=u)throw Error(cD(g,u));g>h&&f.fill(o,h*l,g*l);for(let t=p;t<m;++t){let n=r[t];if(n<0||n>=c[0])throw Error(lD(t,r[t],c[0]));for(let t=0;t<l;t++)f[g*l+t]+=e[n*l+t]}if(a)for(let e=0;e<l;e++)f[g*l+e]/=m-p;if(p=m,++m,h=g+1,g=t,m>s)break}return h<u&&f.fill(o,h*l,u*l),[f,d]}J();var Mk=YD(e=>Math.sqrt(e)),Nk=XD(hr,e=>Math.sqrt(e)),Pk={kernelName:hr,backendName:`cpu`,kernelFunc:Nk};J();var Fk=OD(((e,t)=>{let n=e-t;return n*n})),Ik=zD(wr,Fk),Lk={kernelName:wr,backendName:`cpu`,kernelFunc:Ik};J();var Rk=YD((e,t)=>{let{pattern:n,replaceGlobal:r,rewrite:i}=t;return e.replace(new RegExp(n,r?`g`:``),i)}),zk=ZD(Er,Rk),Bk={kernelName:Er,backendName:`cpu`,kernelFunc:zk};J();function Vk(e,t,n,r){let i=V(e,t.dtype);for(let e=0;e<i.size;e++){let a=i.indexToLoc(e),o=Array(a.length);for(let e=0;e<o.length;e++)o[e]=a[e]*n[e]+r[e];i.set(t.get(...o),...a)}return i}J();var Hk=class{constructor(e,t,n,r,i,a){this.separator=Ii(e),this.nGramWidths=t,this.leftPad=Ii(n),this.rightPad=Ii(r),this.padWidth=i,this.preserveShort=a}getPadWidth(e){return Math.min(this.padWidth<0?e-1:this.padWidth,e-1)}getNumNGrams(e,t){let n=this.getPadWidth(t);return Math.max(0,e+2*n-t+1)}createNGrams(e,t,n,r,i,a){for(let o=0;o<i;++o){let s=this.getPadWidth(a),c=Math.max(0,s-o),l=Math.max(0,s-(i-(o+1))),u=a-(c+l),d=t+(c>0?0:o-s),f=0;f+=c*this.leftPad.length;for(let t=0;t<u;++t)f+=e[d+t].length;f+=l*this.rightPad.length;let p=c+l+u-1;f+=p*this.separator.length,n[r+o]=new Uint8Array(f);let m=n[r+o],h=0,g=e=>e.forEach(e=>m[h++]=e);for(let e=0;e<c;++e)g(this.leftPad),g(this.separator);for(let t=0;t<u-1;++t)g(e[d+t]),g(this.separator);if(u>0){g(e[d+u-1]);for(let e=0;e<l;++e)g(this.separator),g(this.rightPad)}else{for(let e=0;e<l-1;++e)g(this.rightPad),g(this.separator);g(this.rightPad)}}}compute(e,t){let n=e.length,r=t.length;if(r>0){let e=t[0];if(e!==0)throw Error(`First split value must be 0, got ${e}`);for(let i=1;i<r;++i){let r=t[i]>=e;if(r&&=t[i]<=n,!r)throw Error(`Invalid split value ${t[i]}, must be in [${e}, ${n}]`);e=t[i]}if(e!==n)throw Error(`Last split value must be data size. Expected ${n}, got ${e}`)}let i=r-1,a=fe(`int32`,r);if(n===0||r===0){let e=Array(n);for(let e=0;e<=i;++e)a[e]=0;return[e,a]}a[0]=0;for(let e=1;e<=i;++e){let n=t[e]-t[e-1],r=0;this.nGramWidths.forEach(e=>{r+=this.getNumNGrams(n,e)}),this.preserveShort&&n>0&&r===0&&(r=1),a[e]=a[e-1]+r}let o=Array(a[i]);for(let n=0;n<i;++n){let r=t[n],i=a[n];if(this.nGramWidths.forEach(a=>{let s=t[n+1]-t[n],c=this.getNumNGrams(s,a);this.createNGrams(e,r,o,i,c,a),i+=c}),this.preserveShort&&i===a[n]){let a=t[n+1]-t[n];if(a===0)continue;let s=a+2*this.padWidth;this.createNGrams(e,r,o,i,1,s)}}return[o,a]}};function Uk(e,t,n,r,i,a,o,s){return new Hk(n,r,i,a,o,s).compute(e,t)}J();function Wk(e,t,n,r){if(!e.length)return;if(t.length===0){for(let t=0;t<e.length;++t)r.push(e.subarray(t,t+1));return}if(t.length===1){let i=t[0],a=e.indexOf(i);for(;a!==-1;){let t=e.subarray(0,a);(!n||t.length!==0)&&r.push(t),e=e.subarray(a+1),a=e.indexOf(i)}(!n||e.length!==0)&&r.push(e);return}let i=0;for(let a=0;a<e.length+1;a++)if(a===e.length||t.indexOf(e[a])!==-1){let t=e.subarray(i,a);(!n||t.length!==0)&&r.push(t),i=a+1}}function Gk(e,t,n){let r=e.length,i=[],a=0,o=0,s=Array(r);for(let c=0;c<r;++c){let r=i.length;Wk(e[c],t,n,i);let l=i.length-r;s[c]=l,a+=l,o=Math.max(o,l)}let c=fe(`int32`,a*2),l=Array(a),u=[r,o],d=0;for(let e=0;e<r;++e)for(let t=0;t<s[e];++t)c[d*2]=e,c[d*2+1]=t,l[d]=i[d],++d;return[c,l,u]}J();function Kk(e,t){let n=fe(`int32`,e.length);for(let r=0;r<e.length;++r)n[r]=Ci(e[r]).modulo(t).getLowBitsUnsigned();return n}J();var qk=OD(((e,t)=>e-t)),Jk=zD(`Sub`,qk,BD(((e,t,n,r)=>({real:e-n,imag:t-r})))),Yk={kernelName:`Sub`,backendName:`cpu`,kernelFunc:Jk};J();function Xk(e,t){let n=Array(e.rank);for(let r=0;r<n.length;r++)n[r]=e.shape[r]*t[r];let r=V(n,e.dtype);for(let t=0;t<r.values.length;++t){let n=r.indexToLoc(t),i=Array(e.rank);for(let t=0;t<i.length;t++)i[t]=n[t]%e.shape[t];let a=e.locToIndex(i);r.values[t]=e.values[a]}return r}J();var Zk=(e,t)=>{let n=t.value-e.value;return n===0?e.index-t.index:n};function Qk(e,t,n=0,r=e.length-1){for(;r>n;){if(r-n>600){let i=r-n+1,a=t-n+1,o=Math.log(i),s=.5*Math.exp(2*o/3),c=.5*Math.sqrt(o*s*(i-s)/i)*Math.sign(a-i/2);Qk(e,t,Math.max(n,Math.floor(t-a*s/i+c)),Math.min(r,Math.floor(t+(i-a)*s/i+c)))}let i=e[t],a=n,o=r;for(S(e,n,t),Zk(e[r],i)>0&&S(e,n,r);a<o;){for(S(e,a,o),a++,o--;Zk(e[a],i)<0;)a+=1;for(;Zk(e[o],i)>0;)--o}Zk(e[n],i)===0?S(e,n,o):(o+=1,S(e,o,r)),o<=t&&(n=o+1),t<=o&&(r=o-1)}}function $k(e,t,n,r,i){let a=t[t.length-1],[o,s]=[e.length/a,a],c=de(n,o*r),l=de(`int32`,o*r);for(let t=0;t<o;t++){let n=t*s,a=e.subarray(n,n+s),o=Array(a.length);a.forEach((e,t)=>o[t]={value:e,index:t}),r<o.length&&(Qk(o,r),o=o.slice(0,r)),i&&o.sort(Zk);let u=t*r,d=c.subarray(u,u+r),f=l.subarray(u,u+r);for(let e=0;e<r;e++)d[e]=o[e].value,f[e]=o[e].index}let u=t.slice();return u[u.length-1]=r,[V(u,n,c),V(u,`int32`,l)]}J();function eA(e,t,n,r){let i=A(t,n)[0],a=[1,n[0],1];for(let e=0;e<i;e++)a[0]*=n[e];a[1]=n[i];for(let e=i+1;e<n.length;e++)a[2]*=n[e];let o=new Map,s=new Int32Array(n[i]),c=new oa(a,r,e),l=[],u=a[0]===1&&a[2]===1;for(let t=0;t<n[i];t++){let n;if(u)n=e[t].toString();else{let e=[];for(let n=0;n<a[0];n++)for(let r=0;r<a[2];r++)e.push(c.get(n,t,r));n=e.join(`,`)}let r=o.get(n);if(r!=null)s[t]=r;else{let e=o.size;o.set(n,e),s[t]=e,l.push(t)}}let d=a.slice();d[1]=o.size;let f=new oa(d,r);l.forEach((e,t)=>{for(let n=0;n<a[0];n++)for(let r=0;r<a[2];r++)f.set(c.get(n,e,r),n,t,r)});let p=n.slice();return p[i]=d[1],{outputValues:f.values,outputShape:p,indices:s}}var tA=c({addImpl:()=>VD,bincountImpl:()=>WD,bincountReduceImpl:()=>GD,bitwiseAndImpl:()=>KD,castImpl:()=>ID,ceilImpl:()=>QD,concatImpl:()=>tO,equalImpl:()=>nO,expImpl:()=>aO,expm1Impl:()=>cO,floorDivImpl:()=>mO,floorImpl:()=>dO,gatherNdImpl:()=>_O,gatherV2Impl:()=>vO,greaterEqualImpl:()=>SO,greaterImpl:()=>yO,lessEqualImpl:()=>OO,lessImpl:()=>TO,linSpaceImpl:()=>jO,logImpl:()=>MO,maxImpl:()=>PO,maximumImpl:()=>FO,minimumImpl:()=>RO,multiplyImpl:()=>VO,negImpl:()=>GO,notEqualImpl:()=>JO,prodImpl:()=>ek,raggedGatherImpl:()=>uk,raggedRangeImpl:()=>fk,raggedTensorToTensorImpl:()=>_k,rangeImpl:()=>vk,rsqrtImpl:()=>yk,scatterImpl:()=>Sk,sigmoidImpl:()=>Ck,simpleAbsImpl:()=>ED,sliceImpl:()=>Ek,sparseFillEmptyRowsImpl:()=>kk,sparseReshapeImpl:()=>Ak,sparseSegmentReductionImpl:()=>jk,sqrtImpl:()=>Mk,squaredDifferenceImpl:()=>Fk,staticRegexReplaceImpl:()=>Rk,stridedSliceImpl:()=>Vk,stringNGramsImpl:()=>Uk,stringSplitImpl:()=>Gk,stringToHashBucketFastImpl:()=>Kk,subImpl:()=>qk,tileImpl:()=>Xk,topKImpl:()=>$k,transposeImpl:()=>ZO,uniqueImpl:()=>eA});J(),Oo(`cpu`,()=>new TD,1),J();var nA=XD(`Elu`,e=>e>=0?e:Math.exp(e)-1),rA={kernelName:`Elu`,backendName:`cpu`,kernelFunc:nA};J();function iA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{alpha:a}=r;Y([i],`leakyRelu`);let o=O(i.shape),s=n.data.get(i.dataId).values,c=de(`float32`,o);for(let e=0;e<s.length;e++)c[e]=s[e]<0?a*s[e]:s[e];return n.makeTensorInfo(i.shape,`float32`,c)}var aA={kernelName:cn,backendName:`cpu`,kernelFunc:iA};J();var oA=OD((e,t)=>e<0?t*e:e);function sA(e){let{inputs:t,backend:n}=e,{x:r,alpha:i}=t;Y([r,i],`prelu`);let a=n.data.get(r.dataId).values,o=n.data.get(i.dataId).values,[s,c]=oA(r.shape,i.shape,a,o,`float32`);return n.makeTensorInfo(c,`float32`,s)}var cA={kernelName:Vn,backendName:`cpu`,kernelFunc:sA};J();var lA=XD(Yn,e=>Math.max(0,e)),uA={kernelName:Yn,backendName:`cpu`,kernelFunc:lA};J();var dA=XD(tr,e=>Math.min(Math.max(0,e),6)),fA={kernelName:tr,backendName:`cpu`,kernelFunc:dA};function pA(e,t,n,r,i){if(n===`linear`)return MD({inputs:{x:t},backend:e});if(n===`relu`)return lA({inputs:{x:t},backend:e});if(n===`elu`)return nA({inputs:{x:t},backend:e});if(n===`relu6`)return dA({inputs:{x:t},backend:e});if(n===`prelu`)return sA({inputs:{x:t,alpha:r},backend:e});if(n===`leakyrelu`)return iA({inputs:{x:t},backend:e,attrs:{alpha:i}});if(n===`sigmoid`)return wk({inputs:{x:t},backend:e});throw Error(`Activation ${n} has not been implemented for the CPU backend.`)}J();function mA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{shape:a}=r,o=O(i.shape),s=le(a,o),c=O(s);E(o===c,()=>`The new shape (${s}) has ${c} elements and the old shape (${i.shape}) has ${o} elements. The new shape and old shape must have the same number of elements.`),n.incRef(i.dataId);let l=n.data.get(i.dataId);if(l.complexTensorInfos!=null){let e=l.complexTensorInfos.real,t=l.complexTensorInfos.imag;e.shape=s,t.shape=s}return{dataId:i.dataId,shape:s,dtype:i.dtype}}var hA={kernelName:Xn,backendName:`cpu`,kernelFunc:mA};J();function gA(e){let{inputs:t,backend:n,attrs:r}=e,{a:i,b:a}=t,{transposeA:o,transposeB:s}=r;Y([i,a],`matMul`);let c=i.shape.length,l=a.shape.length,u=o?i.shape[c-2]:i.shape[c-1],d=s?a.shape[l-1]:a.shape[l-2],f=o?i.shape[c-1]:i.shape[c-2],p=s?a.shape[l-2]:a.shape[l-1],m=i.shape.slice(0,-2),h=a.shape.slice(0,-2),g=O(m),_=O(h),v=K(i.shape.slice(0,-2),a.shape.slice(0,-2)).concat([f,p]);E(u===d,()=>`Error in matMul: inner shapes (${u}) and (${d}) of Tensors with shapes ${i.shape} and ${a.shape} and transposeA=${o} and transposeB=${s} must match.`);let y=o?[g,u,f]:[g,f,u],b=s?[_,p,d]:[_,d,p],x=mA({inputs:{x:i},backend:n,attrs:{shape:y}}),S=mA({inputs:{x:a},backend:n,attrs:{shape:b}}),C=o?x.shape[1]:x.shape[2],w=o?x.shape[2]:x.shape[1],T=s?S.shape[1]:S.shape[2],D=Math.max(g,_),ee=n.data.get(x.dataId).values,te=n.data.get(S.dataId).values,ne=j(x.shape),k=j(S.shape),[re,ie,ae]=o?[ne[0],1,ne[1]]:[ne[0],ne[1],1],[oe,se,ce]=s?[1,k[1],k[0]]:[k[1],1,k[0]],le=w*T,A=V([D,w,T],x.dtype),ue=A.values,de=n.blockSize;for(let e=0;e<D;e++){let t=e%g,n=e%_;for(let r=0;r<w;r+=de){let i=Math.min(r+de,w);for(let a=0;a<T;a+=de){let o=Math.min(a+de,T);for(let s=0;s<C;s+=de){let c=Math.min(s+de,C);for(let l=r;l<i;l++)for(let r=a;r<o;r++){let i=0;for(let e=s;e<c;e++){let a=ee[t*re+l*ie+e*ae],o=te[e*oe+r*se+n*ce];i+=a*o}ue[e*le+(l*T+r)]+=i}}}}}return n.disposeIntermediateTensorInfo(x),n.disposeIntermediateTensorInfo(S),n.makeTensorInfo(v,A.dtype,A.values)}var _A={kernelName:ct,backendName:`cpu`,kernelFunc:gA};J();function vA(e){let{inputs:t,backend:n,attrs:r}=e,{a:i,b:a,bias:o,preluActivationWeights:s}=t,{transposeA:c,transposeB:l,activation:u,leakyreluAlpha:d}=r,f,p,m,h=[];f=gA({inputs:{a:i,b:a},attrs:{transposeA:c,transposeB:l},backend:n}),o&&(p=HD({inputs:{a:f,b:o},backend:n}),h.push(f),f=p),u&&(m=pA(n,f,u,s,d),h.push(f),f=m);for(let e of h)n.disposeIntermediateTensorInfo(e);return f}var yA={kernelName:Wr,backendName:`cpu`,kernelFunc:vA};J();var bA=XD(Je,e=>Math.acos(e)),xA={kernelName:Je,backendName:`cpu`,kernelFunc:bA};J();var SA=XD(Ye,e=>Math.acosh(e)),CA={kernelName:Ye,backendName:`cpu`,kernelFunc:SA};J();function wA(e){let{inputs:t,backend:n}=e,r=t;Y(t,`addN`);let i=r.map(e=>n.data.get(e.dataId).values),a=V(r[0].shape,r[0].dtype),o=a.values;for(let e=0;e<r.length;e++){let t=i[e];for(let e=0;e<o.length;e++)o[e]+=t[e]}return n.makeTensorInfo(a.shape,a.dtype,a.values)}var TA={kernelName:Xe,backendName:`cpu`,kernelFunc:wA};J();function EA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r;Y(i,`all`);let s=A(a,i.shape),c=s,l=xf(c,i.shape.length),u=i;l!=null&&(u=QO({inputs:{x:i},backend:n,attrs:{perm:l}}),c=Cf(c.length,i.shape.length)),bf(`all`,c,u.shape.length);let[d,f]=vf(u.shape,c),p=O(f),m=Oe(O(d),u.dtype),h=n.data.get(u.dataId).values;for(let e=0;e<m.length;++e){let t=e*p,n=h[t];for(let e=0;e<p;++e){let r=h[t+e];n&&=r}m[e]=n}l!=null&&n.disposeIntermediateTensorInfo(u);let g=n.makeTensorInfo(d,u.dtype,m);if(o){let e=yf(d,s),t=mA({inputs:{x:g},backend:n,attrs:{shape:e}});return n.disposeIntermediateTensorInfo(g),t}return g}var DA={kernelName:`All`,backendName:`cpu`,kernelFunc:EA};J();function OA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r;Y(i,`any`);let s=A(a,i.shape),c=s,l=xf(c,i.shape.length),u=i;l!=null&&(u=QO({inputs:{x:i},backend:n,attrs:{perm:l}}),c=Cf(c.length,i.shape.length)),bf(`any`,c,u.shape.length);let[d,f]=vf(u.shape,c),p=O(f),m=Oe(O(d),u.dtype),h=n.data.get(u.dataId).values;for(let e=0;e<m.length;++e){let t=e*p,n=h[t];for(let e=0;e<p;++e){let r=h[t+e];n||=r}m[e]=n}l!=null&&n.disposeIntermediateTensorInfo(u);let g=n.makeTensorInfo(d,u.dtype,m);if(o){let e=yf(d,s),t=mA({inputs:{x:g},backend:n,attrs:{shape:e}});return n.disposeIntermediateTensorInfo(g),t}return g}var kA={kernelName:`Any`,backendName:`cpu`,kernelFunc:OA};J();function AA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a}=r;Y(i,`argMax`);let o=A(a,i.shape),s=xf(o,i.shape.length),c=i,l=[];s!=null&&(c=QO({inputs:{x:i},backend:n,attrs:{perm:s}}),l.push(c),o=Cf(o.length,c.shape.length)),o=[o[0]],bf(`argMax`,o,c.shape.length);let[u,d]=vf(c.shape,o),f=Oe(O(u),`int32`),p=O(d),m=n.data.get(c.dataId).values;for(let e=0;e<f.length;++e){let t=e*p,n=m[t],r=0;for(let e=0;e<p;++e){let i=m[t+e];i>n&&(n=i,r=e)}f[e]=r}return l.forEach(e=>n.disposeIntermediateTensorInfo(e)),n.makeTensorInfo(u,`int32`,f)}var jA={kernelName:Ze,backendName:`cpu`,kernelFunc:AA};J();function MA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a}=r;Y(i,`argMin`);let o=A(a,i.shape),s=xf(o,i.shape.length),c=i,l=[];s!=null&&(c=QO({inputs:{x:i},backend:n,attrs:{perm:s}}),l.push(c),o=Cf(o.length,c.shape.length)),o=[o[0]],bf(`argMin`,o,c.shape.length);let[u,d]=vf(c.shape,o),f=Oe(O(u),`int32`),p=O(d),m=n.data.get(c.dataId).values;for(let e=0;e<f.length;++e){let t=e*p,n=m[t],r=0;for(let e=0;e<p;++e){let i=m[t+e];i<n&&(n=i,r=e)}f[e]=r}return l.forEach(e=>n.disposeIntermediateTensorInfo(e)),n.makeTensorInfo(u,`int32`,f)}var NA={kernelName:Qe,backendName:`cpu`,kernelFunc:MA};J();var PA=XD($e,e=>Math.asin(e)),FA={kernelName:$e,backendName:`cpu`,kernelFunc:PA};J();var IA=XD(et,e=>Math.asinh(e)),LA={kernelName:et,backendName:`cpu`,kernelFunc:IA};J();var RA=XD(tt,e=>Math.atan(e)),zA={kernelName:tt,backendName:`cpu`,kernelFunc:RA};J();var BA=OD((e,t)=>Math.atan2(e,t)),VA=zD(rt,BA),HA={kernelName:rt,backendName:`cpu`,kernelFunc:VA};J();var UA=XD(nt,e=>Math.atanh(e)),WA={kernelName:nt,backendName:`cpu`,kernelFunc:UA};J();function GA(e,t,n,r,i,a){let o=i.strideHeight,s=i.strideWidth,c=i.dilationHeight,l=i.dilationWidth,u=i.effectiveFilterHeight,d=i.effectiveFilterWidth,f=i.padInfo.top,p=i.padInfo.left,m=a===`max`?-1/0:1/0,h=V(i.outShape,n),g=h.values,_=i.outShape[1]*i.outShape[2]*i.outShape[3],v=i.outShape[2]*i.outShape[3],y=i.outShape[3];for(let t=0;t<i.batchSize;++t){let n=t*_,h=t*r[0];for(let t=0;t<i.inChannels;++t)for(let _=0;_<i.outHeight;++_){let b=_*o-f,x=Math.max(0,b),S=Math.min(i.inHeight,u+b),C=n+_*v;for(let n=0;n<i.outWidth;++n){let o=n*s-p,u=Math.max(0,o),f=Math.min(i.inWidth,d+o),_=m,v=0,b=0;for(let n=x;n<S;n+=c){let i=h+n*r[1];for(let n=u;n<f;n+=l){let o=e[i+n*r[2]+t];a===`max`&&o>_?_=o:a===`avg`&&(v+=o,b++)}if(isNaN(_))break}let w=C+n*y+t;g[w]=a===`avg`?v/b:_}}}return h}function KA(e,t,n,r,i=!1,a=!1){let o=V(r.outShape,`int32`),s=r.strideHeight,c=r.strideWidth,l=r.dilationHeight,u=r.dilationWidth,d=r.effectiveFilterHeight,f=r.effectiveFilterWidth,p=r.padInfo.top,m=r.padInfo.left,h=V(t,n,e);for(let e=0;e<r.batchSize;++e)for(let t=0;t<r.inChannels;++t)for(let n=0;n<r.outHeight;++n){let g=n*s-p,_=g;for(;_<0;)_+=l;let v=Math.min(r.inHeight,d+g);for(let s=0;s<r.outWidth;++s){let d=s*c-m,p=d;for(;p<0;)p+=u;let y=Math.min(r.inWidth,f+d),b=-1/0,x=-1;for(let n=_;n<v;n+=l){let o=n-g;for(let s=p;s<y;s+=u){let c=s-d,l=h.get(e,n,s,t);l>b&&(b=l,x=i?a?((e*r.inHeight+n)*r.inWidth+s)*r.inChannels+t:(n*r.inWidth+s)*r.inChannels+t:o*f+c)}}o.set(x,e,n,s,t)}}return o}function qA(e,t,n,r,i,a){let o=i.strideDepth,s=i.strideHeight,c=i.strideWidth,l=i.dilationDepth,u=i.dilationHeight,d=i.dilationWidth,f=i.effectiveFilterDepth,p=i.effectiveFilterHeight,m=i.effectiveFilterWidth,h=i.padInfo.front,g=i.padInfo.top,_=i.padInfo.left,v=a===`max`?-1/0:1/0,y=V(i.outShape,n),b=y.values,x=i.outShape[1]*i.outShape[2]*i.outShape[3]*i.outShape[4],S=i.outShape[2]*i.outShape[3]*i.outShape[4],C=i.outShape[3]*i.outShape[4],w=i.outShape[4];for(let t=0;t<i.batchSize;++t){let n=t*x,y=t*r[0];for(let t=0;t<i.inChannels;++t)for(let x=0;x<i.outDepth;++x){let T=x*o-h,E=T;for(;E<0;)E+=l;let D=Math.min(i.inDepth,f+T),ee=n+x*S;for(let n=0;n<i.outHeight;++n){let o=n*s-g,f=o;for(;f<0;)f+=u;let h=Math.min(i.inHeight,p+o),x=ee+n*C;for(let n=0;n<i.outWidth;++n){let o=n*c-_,s=o;for(;s<0;)s+=d;let p=Math.min(i.inWidth,m+o),g=x+n*w,S=v,C=0,T=0;for(let n=E;n<D;n+=l){let i=y+n*r[1];for(let n=f;n<h;n+=u){let o=i+n*r[2];for(let n=s;n<p;n+=d){let i=e[o+n*r[3]+t];if(a===`max`&&i>S?S=i:a===`avg`&&(C+=i,T++),isNaN(S))break}if(isNaN(S))break}if(isNaN(S))break}let ee=g+t;b[ee]=a===`avg`?C/Math.max(T,1):S}}}}return y}function JA(e,t){let n=V(t.outShape,`int32`),r=t.strideDepth,i=t.strideHeight,a=t.strideWidth,o=t.dilationDepth,s=t.dilationHeight,c=t.dilationWidth,l=t.effectiveFilterDepth,u=t.effectiveFilterHeight,d=t.effectiveFilterWidth,f=t.padInfo.front,p=t.padInfo.top,m=t.padInfo.left;for(let h=0;h<t.batchSize;++h)for(let g=0;g<t.inChannels;++g)for(let _=0;_<t.outDepth;++_){let v=_*r-f,y=v;for(;y<0;)y+=o;let b=Math.min(t.inDepth,l+v);for(let r=0;r<t.outHeight;++r){let l=r*i-p,f=l;for(;f<0;)f+=s;let x=Math.min(t.inHeight,u+l);for(let i=0;i<t.outWidth;++i){let p=i*a-m,S=p;for(;S<0;)S+=c;let C=Math.min(t.inWidth,d+p),w=-1/0,T=-1;for(let t=y;t<b;t+=o){let n=t-v;for(let r=f;r<x;r+=s){let i=r-l;for(let a=S;a<C;a+=c){let o=a-p,s=e.get(h,t,r,a,g);s>=w&&(w=s,T=n*u*d+i*u+o)}}}n.set(T,h,_,r,i,g)}}}return n}J();function YA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t;Y(i,`avgPool`);let{filterSize:a,strides:o,pad:s,dimRoundingMode:c}=r;E(yl(o,1),()=>`Error in avgPool: Either strides or dilations must be 1. Got strides ${o} and dilations '1'`);let l=al(i.shape,a,o,1,s,c),u;if(l.filterWidth===1&&l.filterHeight===1&&k(l.inShape,l.outShape))u=MD({inputs:{x:i},backend:n});else{let e=n.data.get(i.dataId).values,t=j(i.shape),r=GA(e,i.shape,i.dtype,t,l,`avg`);u=n.makeTensorInfo(l.outShape,i.dtype,r.values)}return u}var XA={kernelName:it,backendName:`cpu`,kernelFunc:YA};J();function ZA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{filterSize:a,strides:o,pad:s,dimRoundingMode:c,dataFormat:l}=r;Y(i,`avgPool3d`);let u=ol(i.shape,a,o,1,s,c,l),d=n.data.get(i.dataId).values,f=qA(d,i.shape,i.dtype,j(i.shape),u,`avg`);return n.makeTensorInfo(f.shape,`float32`,f.values)}var QA={kernelName:ot,backendName:`cpu`,kernelFunc:ZA};J();function $A(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a}=t,{filterSize:o,strides:s,pad:c,dimRoundingMode:l}=r;Y([i,a],`avgPool3DGrad`);let u=ol(a.shape,o,s,1,c,l),d=u.strideDepth,f=u.strideHeight,p=u.strideWidth,m=u.filterDepth,h=u.filterHeight,g=u.filterWidth,_=u.dilationDepth,v=u.dilationHeight,y=u.dilationWidth,b=u.effectiveFilterDepth,x=u.effectiveFilterHeight,S=u.effectiveFilterWidth,C=b-1-u.padInfo.front,w=S-1-u.padInfo.left,T=x-1-u.padInfo.top,E=V(a.shape,`float32`),D=1/(m*h*g),ee=n.bufferSync(i);for(let e=0;e<u.batchSize;++e)for(let t=0;t<u.inChannels;++t)for(let n=0;n<u.inDepth;++n)for(let r=0;r<u.inHeight;++r)for(let i=0;i<u.inWidth;++i){let a=n-C,o=r-T,s=i-w,c=0;for(let n=0;n<b;n+=_){let r=(a+n)/d;if(!(r<0||r>=u.outDepth||Math.floor(r)!==r))for(let n=0;n<x;n+=v){let i=(o+n)/f;if(!(i<0||i>=u.outHeight||Math.floor(i)!==i))for(let n=0;n<S;n+=y){let a=(s+n)/p;if(a<0||a>=u.outWidth||Math.floor(a)!==a)continue;let o=ee.get(e,r,i,a,t);c+=o}}}E.set(c*D,e,n,r,i,t)}return n.makeTensorInfo(E.shape,E.dtype,E.values)}var ej={kernelName:st,backendName:`cpu`,kernelFunc:$A};J();function tj(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a}=t,o=a;Y([i,a],`avgPoolGrad`);let{filterSize:s,strides:c,pad:l}=r,u=al(o.shape,s,c,1,l),d=u.strideHeight,f=u.strideWidth,p=u.filterHeight,m=u.filterWidth,h=u.dilationHeight,g=u.dilationWidth,_=u.effectiveFilterHeight,v=u.effectiveFilterWidth,y=v-1-u.padInfo.left,b=_-1-u.padInfo.top,x=V(o.shape,`float32`),S=1/(p*m),C=n.data.get(i.dataId).values,w=V(i.shape,`float32`,C);for(let e=0;e<u.batchSize;++e)for(let t=0;t<u.inChannels;++t)for(let n=0;n<u.inHeight;++n)for(let r=0;r<u.inWidth;++r){let i=n-b,a=r-y,o=0;for(let n=0;n<_;n+=h){let r=(i+n)/d;if(!(r<0||r>=u.outHeight||Math.floor(r)!==r))for(let n=0;n<v;n+=g){let i=(a+n)/f;if(i<0||i>=u.outWidth||Math.floor(i)!==i)continue;let s=w.get(e,r,i,t);o+=s}}x.set(o*S,e,n,r,t)}return n.makeTensorInfo(x.shape,x.dtype,x.values)}var nj={kernelName:at,backendName:`cpu`,kernelFunc:tj};J();function rj(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,scale:a,offset:o,mean:s,variance:c}=t;E(s.shape.length===c.shape.length,()=>`Batch normalization gradient requires mean and variance to have equal ranks.`),E(o==null||s.shape.length===o.shape.length,()=>`Batch normalization gradient requires mean and offset to have equal ranks.`),E(a==null||s.shape.length===a.shape.length,()=>`Batch normalization gradient requires mean and scale to have equal ranks.`),Y([i,s,c,a,o],`batchNorm`);let{varianceEpsilon:l}=r;l??=.001;let u=n.data.get(i.dataId).values,d=n.data.get(s.dataId).values,f=n.data.get(c.dataId).values,p=a?n.data.get(a.dataId).values:new Float32Array([1]),m=o?n.data.get(o.dataId).values:new Float32Array([0]),h=new Float32Array(u.length),g=m.length,_=p.length,v=f.length,y=d.length,b=0,x=0,S=0,C=0;for(let e=0;e<u.length;++e)h[e]=m[b++]+(u[e]-d[x++])*p[S++]/Math.sqrt(f[C++]+l),b>=g&&(b=0),x>=y&&(x=0),S>=_&&(S=0),C>=v&&(C=0);return n.makeTensorInfo(i.shape,i.dtype,h)}var ij={kernelName:Xt,backendName:`cpu`,kernelFunc:rj};J();function aj(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{blockShape:a,crops:o}=r;Y([i],`batchToSpaceND`);let s=a.reduce((e,t)=>e*t),c=fE(i.shape,a,s),l=pE(c.length,a.length),u=mE(i.shape,a,s),d=hE(o,a.length),f=gE(u,o,a.length),p=mA({inputs:{x:i},backend:n,attrs:{shape:c}}),m=QO({inputs:{x:p},backend:n,attrs:{perm:l}}),h=mA({inputs:{x:m},backend:n,attrs:{shape:u}}),g=Dk({inputs:{x:h},backend:n,attrs:{begin:d,size:f}});return n.disposeIntermediateTensorInfo(p),n.disposeIntermediateTensorInfo(m),n.disposeIntermediateTensorInfo(h),g}var oj={kernelName:lt,backendName:`cpu`,kernelFunc:aj};J();function sj(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,weights:a}=t,{size:o}=r,s=n.data.get(i.dataId).values,c=n.data.get(a.dataId).values,l=WD(s,c,a.dtype,a.shape,o);return n.makeTensorInfo([o],a.dtype,l)}var cj={kernelName:ut,backendName:`cpu`,kernelFunc:sj};J();function lj(e){let{inputs:t,backend:n}=e,{s0:r,s1:i}=t,a=n.data.get(r.dataId).values,o=n.data.get(i.dataId).values,s=K(Array.from(a),Array.from(o));return n.makeTensorInfo([s.length],`int32`,Int32Array.from(s))}var uj={kernelName:pt,backendName:`cpu`,kernelFunc:lj};J();var dj=XD(gt,(e,t)=>{let n=t;return e>n.clipValueMax?n.clipValueMax:e<n.clipValueMin?n.clipValueMin:e}),fj={kernelName:gt,backendName:`cpu`,kernelFunc:dj};J();var pj={kernelName:vt,backendName:`cpu`,kernelFunc:e=>{let{x:t}=e.inputs,n=e.backend,r=new Float32Array(O(t.shape)),i=n.data.get(t.dataId),a=i.complexTensorInfos.real,o=i.complexTensorInfos.imag,s=n.data.get(a.dataId).values,c=n.data.get(o.dataId).values;for(let e=0;e<s.length;e++){let t=s[e],n=c[e];r[e]=Math.hypot(t,n)}return n.makeOutput(r,t.shape,`float32`)}};J();function mj(e){let{inputs:t,backend:n}=e,{input:r}=t,i=n.data.get(r.dataId).complexTensorInfos.imag,a=n.data.get(i.dataId).values;return n.makeTensorInfo(i.shape,i.dtype,a)}var hj={kernelName:rn,backendName:`cpu`,kernelFunc:mj};J();function gj(e){let{inputs:t,backend:n,attrs:r}=e,{axis:i}=r,a=A(i,t[0].shape)[0];QT(t.map(e=>e.shape),a);let o=$T(t.map(e=>e.shape),a);if(O(o)===0)return n.makeTensorInfo(o,t[0].dtype,[]);let s=t.filter(e=>O(e.shape)>0);if(s.length===1)return MD({inputs:{x:s[0]},backend:n});if(s[0].dtype===`complex64`){let e=s.map(e=>PD({inputs:{input:e},backend:n})),t=s.map(e=>mj({inputs:{input:e},backend:n})),r=gj({inputs:e,backend:n,attrs:{axis:a}}),i=gj({inputs:t,backend:n,attrs:{axis:a}}),o=kD({inputs:{real:r,imag:i},backend:n});return e.forEach(e=>n.disposeIntermediateTensorInfo(e)),t.forEach(e=>n.disposeIntermediateTensorInfo(e)),n.disposeIntermediateTensorInfo(r),n.disposeIntermediateTensorInfo(i),o}let c=s.map(e=>{let t=[-1,O(e.shape.slice(a))];return mA({inputs:{x:e},backend:n,attrs:{shape:t}})}),l=c.map(e=>({vals:n.data.get(e.dataId).values,shape:e.shape}));o=$T(c.map(e=>e.shape),1);let u=c[0].shape[0]===1,d=tO(l,o,t[0].dtype,u),f=$T(s.map(e=>e.shape),a),p=n.makeTensorInfo(f,t[0].dtype,d);return c.forEach(e=>n.disposeIntermediateTensorInfo(e)),p}var _j={kernelName:yt,backendName:`cpu`,kernelFunc:gj};J();function vj(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a}=t,{strides:o,pad:s,dataFormat:c,dilations:l,dimRoundingMode:u}=r;Y([i,a],`conv2d`);let d=xl(c),f=sl(i.shape,a.shape,o,l,s,u,!1,d),p=f.filterHeight,m=f.filterWidth,h=f.dilationHeight,g=f.dilationWidth,_=f.padInfo.left,v=f.padInfo.top,y=f.dataFormat===`channelsLast`,b=new oa(f.outShape,i.dtype),x=j(i.shape),S=j(a.shape),C=x[0],w=y?x[1]:x[2],T=y?x[2]:1,E=y?1:x[1],D=b.strides[0],ee=y?b.strides[1]:b.strides[2],O=y?b.strides[2]:1,te=y?1:b.strides[1],ne=n.data.get(i.dataId).values,k=n.data.get(a.dataId).values,re=b.values;for(let e=0;e<f.batchSize;++e){let t=e*C,n=e*D;for(let e=0;e<f.outHeight;++e){let r=n+e*ee,i=e*f.strideHeight-v;for(let e=0;e<p;++e){let n=i+e*h;if(n<0||n>=f.inHeight)continue;let a=e*S[0],o=t+n*w;for(let e=0;e<f.outWidth;++e){let t=r+e*O,n=e*f.strideWidth-_;for(let e=0;e<m;++e){let r=n+e*g;if(r<0||r>=f.inWidth)continue;let i=a+e*S[1],s=o+r*T,c=i;for(let e=0;e<f.inChannels;++e){let n=ne[s+e*E];for(let e=0;e<f.outChannels;++e)re[t+e*te]+=n*k[c+e];c+=f.outChannels}}}}}}return n.makeTensorInfo(b.shape,b.dtype,re)}var yj={kernelName:bt,backendName:`cpu`,kernelFunc:vj};J();function bj(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,dy:a}=t,{strides:o,pad:s,dataFormat:c,dimRoundingMode:l,filterShape:u}=r;Y([i,a],`conv2dBackpropFilter`);let d=xl(c),f=sl(i.shape,u,o,1,s,l,!1,d),{strideHeight:p,strideWidth:m,filterHeight:h,filterWidth:g}=f,_=f.dataFormat===`channelsLast`,v=new oa(f.filterShape,`float32`),y=f.padInfo.left,b=f.padInfo.top,x=n.data.get(i.dataId).values,S=n.data.get(a.dataId).values,C=new oa(i.shape,i.dtype,x),w=new oa(a.shape,a.dtype,S);for(let e=0;e<h;++e){let t=Math.max(0,Math.ceil((b-e)/p)),n=Math.min(f.outHeight,(f.inHeight+b-e)/p);for(let r=0;r<g;++r){let i=Math.max(0,Math.ceil((y-r)/m)),a=Math.min(f.outWidth,(f.inWidth+y-r)/m);for(let o=0;o<f.inChannels;++o)for(let s=0;s<f.outChannels;++s){let c=0;for(let l=0;l<f.batchSize;++l)for(let u=t;u<n;++u){let t=e+u*p-b;for(let e=i;e<a;++e){let n=r+e*m-y;_?c+=C.get(l,t,n,o)*w.get(l,u,e,s):c+=C.get(l,o,t,n)*w.get(l,s,u,e)}}v.set(c,e,r,o,s)}}}return n.makeTensorInfo(v.shape,v.dtype,v.values)}var xj={kernelName:xt,backendName:`cpu`,kernelFunc:bj};J();function Sj(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,filter:a}=t,{inputShape:o,strides:s,pad:c,dataFormat:l,dimRoundingMode:u}=r;Y([i,a],`conv2dBackpropInput`);let d=j(a.shape),f=j(i.shape),p=xl(l),m=sl(o,a.shape,s,1,c,u,!1,p),h=new oa(m.inShape,`float32`),g=h.values,_=n.data.get(i.dataId).values,v=n.data.get(a.dataId).values,[y,b,x]=d,{batchSize:S,filterHeight:C,filterWidth:w,inChannels:T,inHeight:E,inWidth:D,outChannels:ee,outHeight:O,outWidth:te,strideHeight:ne,strideWidth:k}=m;p=m.dataFormat;let re=C-1-m.padInfo.top,ie=w-1-m.padInfo.left,ae=p===`channelsLast`,oe=h.strides[0],se=ae?h.strides[1]:h.strides[2],ce=ae?h.strides[2]:1,le=ae?1:h.strides[1],A=f[0],ue=ae?f[1]:f[2],de=ae?f[2]:1,fe=ae?1:f[1];for(let e=0;e<S;++e)for(let t=0;t<T;++t)for(let n=0;n<E;++n){let r=n-re,i=Math.max(0,Math.ceil(r/ne)),a=Math.min(O,(C+r)/ne);for(let o=0;o<D;++o){let s=o-ie,c=Math.max(0,Math.ceil(s/k)),l=Math.min(te,(w+s)/k),u=0;for(let n=i;n<a;++n){let i=n*ne-r;for(let r=c;r<l;++r){let a=r*k-s,o=A*e+ue*n+de*r,c=y*(C-1-i)+b*(w-1-a)+x*t;for(let e=0;e<ee;++e){let t=_[o+fe*e],n=v[c+e];u+=t*n}}}let d=oe*e+se*n+ce*o+le*t;g[d]=u}}return n.makeTensorInfo(h.shape,h.dtype,h.values)}var Cj={kernelName:St,backendName:`cpu`,kernelFunc:Sj};J();function wj(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a}=t,{strides:o,pad:s,dilations:c}=r;Y([i,a],`conv3d`);let l=cl(i.shape,a.shape,o,c,s),{filterDepth:u,filterHeight:d,filterWidth:f,dilationDepth:p,dilationHeight:m,dilationWidth:h,padInfo:g}=l,_=g.front,v=g.left,y=g.top,b=new oa(l.outShape,i.dtype),x=n.data.get(i.dataId).values,S=n.data.get(a.dataId).values,C=b.values,w=j(i.shape),T=j(a.shape);for(let e=0;e<l.batchSize;++e){let t=e*w[0],n=e*b.strides[0];for(let e=0;e<l.outDepth;++e){let r=n+e*b.strides[1],i=e*l.strideDepth-_;for(let e=0;e<u;++e){let n=i+e*p;if(n<0||n>=l.inDepth)continue;let a=e*T[0],o=t+n*w[1];for(let e=0;e<l.outHeight;++e){let t=r+e*b.strides[2],n=e*l.strideHeight-y;for(let e=0;e<d;++e){let r=n+e*m;if(r<0||r>=l.inHeight)continue;let i=a+e*T[1],s=o+r*w[2];for(let e=0;e<l.outWidth;++e){let n=t+e*l.outChannels,r=e*l.strideWidth-v;for(let e=0;e<f;++e){let t=r+e*h;if(t<0||t>=l.inWidth)continue;let a=i+e*T[2],o=s+t*l.inChannels,c=a;for(let e=0;e<l.inChannels;++e){let t=x[o+e];for(let e=0;e<l.outChannels;++e)C[n+e]+=t*S[c+e];c+=l.outChannels}}}}}}}}return n.makeTensorInfo(b.shape,b.dtype,b.values)}var Tj={kernelName:Ct,backendName:`cpu`,kernelFunc:wj};J();function Ej(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,dy:a}=t,{strides:o,pad:s,filterShape:c}=r;Y([i,a],`conv3dBackpropFilterV2`);let l=j(i.shape),u=j(a.shape),d=cl(i.shape,c,o,1,s),f=d.strideDepth,p=d.strideHeight,m=d.strideWidth,h=d.filterDepth,g=d.filterHeight,_=d.filterWidth,v=new oa(d.filterShape,`float32`),y=v.values,[b,x,S,C]=v.strides,w=n.data.get(a.dataId).values,[T,E,D,ee]=u,O=n.data.get(i.dataId).values,[te,ne,k,re]=l,ie=d.padInfo.front,ae=d.padInfo.left,oe=d.padInfo.top;for(let e=0;e<h;++e){let t=Math.max(0,Math.ceil((ie-e)/f)),n=Math.min(d.outDepth,(d.inDepth+ie-e)/f),r=e*b;for(let i=0;i<g;++i){let a=Math.max(0,Math.ceil((oe-i)/p)),o=Math.min(d.outHeight,(d.inHeight+oe-i)/p),s=i*x+r;for(let r=0;r<_;++r){let c=Math.max(0,Math.ceil((ae-r)/m)),l=Math.min(d.outWidth,(d.inWidth+ae-r)/m),u=r*S+s;for(let s=0;s<d.inChannels;++s){let h=s*C+u;for(let u=0;u<d.outChannels;++u){let g=0;for(let h=0;h<d.batchSize;++h){let d=h*te,_=h*T;for(let h=t;h<n;++h){let t=(e+h*f-ie)*ne+d,n=h*E+_;for(let e=a;e<o;++e){let a=(i+e*p-oe)*k+t,o=e*D+n;for(let e=c;e<l;++e){let t=(r+e*m-ae)*re+a,n=e*ee+o;g+=O[t+s]*w[n+u]}}}}y[h+u]=g}}}}}return n.makeTensorInfo(v.shape,v.dtype,v.values)}var Dj={kernelName:wt,backendName:`cpu`,kernelFunc:Ej};J();function Oj(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,filter:a}=t,{pad:o,strides:s,inputShape:c}=r;Y([i],`conv3dBackpropInputV2`);let l=j(i.shape),u=j(a.shape),d=cl(c,a.shape,s,1,o),f=new oa(d.inShape,`float32`),p=f.values,[m,h,g,_]=f.strides,v=n.data.get(i.dataId).values,[y,b,x,S]=l,C=n.data.get(a.dataId).values,[w,T,E,D]=u,{batchSize:ee,filterDepth:O,filterHeight:te,filterWidth:ne,inChannels:k,inDepth:re,inHeight:ie,inWidth:ae,outChannels:oe,outDepth:se,outHeight:ce,outWidth:le,strideDepth:A,strideHeight:ue,strideWidth:de}=d,fe=O-1-d.padInfo.front,pe=te-1-d.padInfo.top,me=ne-1-d.padInfo.left;for(let e=0;e<ee;++e)for(let t=0;t<k;++t)for(let n=0;n<re;++n){let r=n-fe,i=Math.max(0,Math.ceil(r/A)),a=Math.min(se,(O+r)/A);for(let o=0;o<ie;++o){let s=o-pe,c=Math.max(0,Math.ceil(s/ue)),l=Math.min(ce,(te+s)/ue);for(let u=0;u<ae;++u){let d=u-me,f=Math.max(0,Math.ceil(d/de)),ee=Math.min(le,(ne+d)/de),k=0;for(let n=i;n<a;++n){let i=n*A-r;for(let r=c;r<l;++r){let a=r*ue-s;for(let o=f;o<ee;++o){let s=o*de-d,c=y*e+b*n+x*r+S*o,l=w*(O-1-i)+T*(te-1-a)+E*(ne-1-s)+D*t;for(let e=0;e<oe;++e){let t=v[c+e],n=C[l+e];k+=t*n}}}}p[m*e+h*n+g*o+_*u+t]=k}}}return n.makeTensorInfo(f.shape,f.dtype,f.values)}var kj={kernelName:Tt,backendName:`cpu`,kernelFunc:Oj};J();var Aj={kernelName:`Cos`,backendName:`cpu`,kernelFunc:XD(`Cos`,e=>Math.cos(e))};J();var jj=XD(Et,e=>Math.cosh(e)),Mj={kernelName:Et,backendName:`cpu`,kernelFunc:jj};J();function Nj(e){let{inputs:t,backend:n,attrs:r}=e,{image:i,boxes:a,boxInd:o}=t,{cropSize:s,method:c,extrapolationValue:l}=r,[u,d,f,p]=i.shape,m=a.shape[0],[h,g]=s,_=V([m,h,g,p],`float32`),v=n.data.get(a.dataId).values,y=n.data.get(o.dataId).values,b=n.data.get(i.dataId).values,x=j(i.shape),S=j(_.shape);for(let e=0;e<m;e++){let t=e*4,n=v[t],r=v[t+1],i=v[t+2],a=v[t+3],o=y[e];if(o>=u)continue;let s=h>1?(i-n)*(d-1)/(h-1):0,m=g>1?(a-r)*(f-1)/(g-1):0;for(let t=0;t<h;t++){let u=h>1?n*(d-1)+t*s:.5*(n+i)*(d-1);if(u<0||u>d-1){for(let n=0;n<g;n++)for(let r=0;r<p;r++){let i=r+n*S[2]+t*S[1]+e*S[0];_.values[i]=l}continue}if(c===`bilinear`){let n=Math.floor(u),i=Math.ceil(u),s=u-n;for(let c=0;c<g;c++){let u=g>1?r*(f-1)+c*m:.5*(r+a)*(f-1);if(u<0||u>f-1){for(let n=0;n<p;n++){let r=n+c*S[2]+t*S[1]+e*S[0];_.values[r]=l}continue}let d=Math.floor(u),h=Math.ceil(u),v=u-d;for(let r=0;r<p;r++){let a=r+d*x[2]+n*x[1]+o*x[0],l=b[a];a=r+h*x[2]+n*x[1]+o*x[0];let u=b[a];a=r+d*x[2]+i*x[1]+o*x[0];let f=b[a];a=r+h*x[2]+i*x[1]+o*x[0];let p=b[a],m=l+(u-l)*v,g=f+(p-f)*v;a=r+c*S[2]+t*S[1]+e*S[0],_.values[a]=m+(g-m)*s}}}else for(let n=0;n<g;++n){let i=g>1?r*(f-1)+n*m:.5*(r+a)*(f-1);if(i<0||i>f-1){for(let r=0;r<p;r++){let i=r+n*S[2]+t*S[1]+e*S[0];_.values[i]=l}continue}let s=Math.round(i),c=Math.round(u);for(let r=0;r<p;r++){let i=r+s*x[2]+c*x[1]+o*x[0],a=r+n*S[2]+t*S[1]+e*S[0];_.values[a]=b[i]}}}}return n.makeTensorInfo(_.shape,_.dtype,_.values)}var Pj={kernelName:kt,backendName:`cpu`,kernelFunc:Nj};J();function Fj(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,exclusive:o,reverse:s}=r;Y(i,`cumprod`);let c=xf([a],i.shape.length),l=i;c!=null&&(l=QO({inputs:{x:i},backend:n,attrs:{perm:c}}));let u=Cf(1,i.shape.length)[0];if(u!==l.shape.length-1)throw Error(`backend.cumprod in CPU expects an inner-most axis=${l.shape.length-1} but got axis=${u}`);let d=fa(l.dtype,`int32`),f=De(O(l.shape),d),p=n.data.get(l.dataId).values,m=l.shape[l.shape.length-1],h=s?(e,t)=>e+m-t-1:(e,t)=>e+t;for(let e=0;e<p.length;e+=m)for(let t=0;t<m;t++){let n=h(e,t);if(t===0)f[n]=o?1:p[n];else{let r=h(e,t-1);f[n]=o?p[r]*f[r]:p[n]*f[r]}}let g=n.makeTensorInfo(l.shape,d,f);if(c!=null){let e=Sf(c),t=QO({inputs:{x:g},backend:n,attrs:{perm:e}});return n.disposeIntermediateTensorInfo(g),n.disposeIntermediateTensorInfo(l),t}return g}var Ij={kernelName:Dt,backendName:`cpu`,kernelFunc:Fj};J();function Lj(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,exclusive:o,reverse:s}=r;Y(i,`cumsum`);let c=xf([a],i.shape.length),l=i;c!=null&&(l=QO({inputs:{x:i},backend:n,attrs:{perm:c}}));let u=Cf(1,i.shape.length)[0];if(u!==l.shape.length-1)throw Error(`backend.cumsum in CPU expects an inner-most axis=${l.shape.length-1} but got axis=${u}`);let d=fa(l.dtype,`int32`),f=Oe(O(l.shape),d),p=n.data.get(l.dataId).values,m=l.shape[l.shape.length-1],h=s?(e,t)=>e+m-t-1:(e,t)=>e+t;for(let e=0;e<p.length;e+=m)for(let t=0;t<m;t++){let n=h(e,t);if(t===0)f[n]=o?0:p[n];else{let r=h(e,t-1);f[n]=o?p[r]+f[r]:p[n]+f[r]}}let g=n.makeTensorInfo(l.shape,d,f);if(c!=null){let e=Sf(c),t=QO({inputs:{x:g},backend:n,attrs:{perm:e}});return n.disposeIntermediateTensorInfo(g),n.disposeIntermediateTensorInfo(l),t}return g}var Rj={kernelName:Ot,backendName:`cpu`,kernelFunc:Lj};J();function zj(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,weights:a}=t,{size:o,binaryOutput:s}=r;if(i.shape.length===1){let e=n.data.get(i.dataId).values,t=n.data.get(a.dataId).values,r=WD(e,t,a.dtype,a.shape,o);return n.makeTensorInfo([o],a.dtype,r)}else if(i.shape.length===2){let e=GD(n.bufferSync(i),n.bufferSync(a),o,s);return n.makeTensorInfo(e.shape,a.dtype,e.values)}throw Error(`Error in denseBincount: input must be at most rank 2, but got rank${i.shape.length}.`)}var Bj={kernelName:At,backendName:`cpu`,kernelFunc:zj};J();function Vj(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{blockSize:a,dataFormat:o}=r;E(o===`NHWC`,()=>`Only NHWC dataFormat supported on CPU for depthToSpace. Got ${o}`);let s=i.shape[0],c=i.shape[1],l=i.shape[2],u=i.shape[3],d=c*a,f=l*a,p=u/(a*a),m=n.data.get(i.dataId).values,h=new Float32Array(s*d*f*p),g=0;for(let e=0;e<s;++e)for(let t=0;t<d;++t){let n=Math.floor(t/a),r=t%a;for(let t=0;t<f;++t){let i=Math.floor(t/a),o=t%a,s=(r*a+o)*p;for(let t=0;t<p;++t){let r=t+s+u*(i+l*(n+c*e));h[g++]=m[r]}}}return n.makeTensorInfo([s,d,f,p],i.dtype,h)}var Hj={kernelName:jt,backendName:`cpu`,kernelFunc:Vj};J();function Uj(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a}=t,{strides:o,pad:s,dilations:c,dimRoundingMode:l}=r;Y([i,a],`depthwiseConv2DNative`);let u=j(i.shape),d=j(a.shape),f=c;f??=[1,1],E(yl(o,f),()=>`Error in depthwiseConv2d: Either strides or dilations must be 1. Got strides ${o} and dilations '${f}'`);let p=sl(i.shape,a.shape,o,f,s,l,!0),{filterHeight:m,filterWidth:h,dilationHeight:g,dilationWidth:_,padInfo:v}=p,y=v.left,b=v.top,x=p.outChannels/p.inChannels,S=new oa(p.outShape,i.dtype),C=n.data.get(i.dataId).values,w=n.data.get(a.dataId).values,T=S.values;for(let e=0;e<p.batchSize;++e){let t=e*u[0],n=e*S.strides[0];for(let e=0;e<p.outHeight;++e){let r=n+e*S.strides[1],i=e*p.strideHeight-b;for(let e=0;e<m;++e){let n=i+e*g;if(n<0||n>=p.inHeight)continue;let a=e*d[0],o=t+n*u[1];for(let e=0;e<p.outWidth;++e){let t=r+e*S.strides[2],n=e*p.strideWidth-y;for(let e=0;e<h;++e){let r=n+e*_;if(r<0||r>=p.inWidth)continue;let i=a+e*d[1],s=o+r*p.inChannels,c=t,l=i;for(let e=0;e<p.inChannels;++e){let t=C[s+e];for(let e=0;e<x;++e)T[c+e]+=t*w[l+e];c+=x,l+=x}}}}}}return n.makeTensorInfo(S.shape,S.dtype,S.values)}var Wj={kernelName:Mt,backendName:`cpu`,kernelFunc:Uj};J();function Gj(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,dy:a}=t,{strides:o,dilations:s,pad:c,dimRoundingMode:l,filterShape:u}=r;Y([i,a],`depthwiseConv2dNativeBackpropFilter`);let d=sl(i.shape,u,o,s,c,l,!0),{strideHeight:f,strideWidth:p,filterHeight:m,filterWidth:h}=d,g=new oa(d.filterShape,`float32`),_=d.padInfo.left,v=d.padInfo.top,y=d.outChannels/d.inChannels,b=n.data.get(i.dataId).values,x=new oa(i.shape,i.dtype,b),S=n.data.get(a.dataId).values,C=new oa(a.shape,a.dtype,S);for(let e=0;e<m;++e){let t=Math.max(0,Math.ceil((v-e)/f)),n=Math.min(d.outHeight,(d.inHeight+v-e)/f);for(let r=0;r<h;++r){let i=Math.max(0,Math.ceil((_-r)/p)),a=Math.min(d.outWidth,(d.inWidth+_-r)/p);for(let o=0;o<d.outChannels;++o){let s=Math.trunc(o/y),c=o%y,l=0;for(let c=0;c<d.batchSize;++c)for(let u=t;u<n;++u){let t=e+u*f-v;for(let e=i;e<a;++e){let n=r+e*p-_;l+=x.get(c,t,n,s)*C.get(c,u,e,o)}}g.set(l,e,r,s,c)}}}return n.makeTensorInfo(g.shape,g.dtype,g.values)}var Kj={kernelName:Nt,backendName:`cpu`,kernelFunc:Gj};J();function qj(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,filter:a}=t,{strides:o,dilations:s,pad:c,dimRoundingMode:l,inputShape:u}=r;Y([i,a],`depthwiseConv2DNativeBackpropInput`);let d=j(i.shape),f=j(a.shape),p=sl(u,a.shape,o,s,c,l,!0),m=new oa(p.inShape,`float32`),h=m.values,[g,_,v]=m.strides,y=n.data.get(i.dataId).values,[b,x,S]=d,C=n.data.get(a.dataId).values,[w,T,E]=f,{batchSize:D,filterHeight:ee,filterWidth:O,inChannels:te,inHeight:ne,inWidth:k,outChannels:re,outHeight:ie,outWidth:ae,strideHeight:oe,strideWidth:se}=p,ce=ee-1-p.padInfo.top,le=O-1-p.padInfo.left,A=re/te;for(let e=0;e<D;++e)for(let t=0;t<te;++t)for(let n=0;n<ne;++n){let r=n-ce,i=Math.max(0,Math.ceil(r/oe)),a=Math.min(ie,(ee+r)/oe);for(let o=0;o<k;++o){let s=o-le,c=Math.max(0,Math.ceil(s/se)),l=Math.min(ae,(O+s)/se),u=0;for(let n=i;n<a;++n){let i=n*oe-r;for(let r=c;r<l;++r){let a=r*se-s,o=b*e+x*n+S*r,c=w*(ee-1-i)+T*(O-1-a)+E*t;for(let e=0;e<A;++e){let n=y[o+(t*A+e)],r=C[c+e];u+=n*r}}}h[g*e+_*n+v*o+t]=u}}return n.makeTensorInfo(m.shape,m.dtype,m.values)}var Jj={kernelName:Pt,backendName:`cpu`,kernelFunc:qj};J();function Yj(e){let{inputs:t,backend:n}=e,{x:r}=t,i=O(r.shape),a=n.data.get(r.dataId).values,o=V([i,i],r.dtype),s=o.values;for(let e=0;e<a.length;e++)s[e*i+e]=a[e];let c=[...r.shape,...r.shape];return n.makeTensorInfo(c,o.dtype,o.values)}var Xj={kernelName:Ft,backendName:`cpu`,kernelFunc:Yj};J();var Zj={kernelName:It,backendName:`cpu`,kernelFunc:({inputs:e,backend:t,attrs:n})=>{let{x:r,filter:i}=e,{strides:a,pad:o,dilations:s}=n,c=t,l=c.data.get(r.dataId).values,u=r.shape.length,d=c.data.get(i.dataId).values,f=i.shape.length,{batchSize:p,inHeight:m,inWidth:h,inChannels:g,outHeight:_,outWidth:v,padInfo:y,strideHeight:b,strideWidth:x,filterHeight:S,filterWidth:C,dilationHeight:w,dilationWidth:T,outShape:E}=il(r.shape,i.shape,a,o,`NHWC`,s),D=O(E),ee=E.length,te=fe(r.dtype,D);for(let e=0;e<p;++e)for(let t=0;t<_;++t){let n=t*b-y.top;for(let a=0;a<v;++a){let o=a*x-y.left;for(let s=0;s<g;++s){let c=-(2**53-1);for(let t=0;t<S;++t){let a=n+t*w;if(a>=0&&a<m)for(let n=0;n<C;++n){let p=o+n*T;if(p>=0&&p<h){let o=je([e,a,p,s],u,j(r.shape)),m=je([t,n,s],f,j(i.shape)),h=l[o]+d[m];h>c&&(c=h)}}}let p=je([e,t,a,s],ee,j(E));te[p]=c}}}return{dataId:c.write(Ni(te,r.dtype),E,r.dtype),shape:E,dtype:r.dtype}}};J();var Qj={kernelName:Rt,backendName:`cpu`,kernelFunc:({inputs:e,backend:t,attrs:n})=>{let{x:r,filter:i,dy:a}=e,{strides:o,pad:s,dilations:c}=n,l=t,u=Te(r.shape,l.data.get(r.dataId).values),d=Te(i.shape,l.data.get(i.dataId).values),{batchSize:f,inHeight:p,inWidth:m,inChannels:h,outHeight:g,outWidth:_,padInfo:v,strideHeight:y,strideWidth:b,filterHeight:x,filterWidth:S,dilationHeight:C,dilationWidth:w,outShape:T}=il(r.shape,i.shape,o,s,`NHWC`,c);E(a.rank===T.length,()=>`Error in ${Rt}, dy must have the same rank as output ${T.length}, but got ${a.rank}`);let D=Te(T,l.data.get(a.dataId).values),ee=ke(i.shape,i.dtype);for(let e=0;e<f;++e)for(let t=0;t<g;++t){let n=t*y-v.top;for(let r=0;r<_;++r){let i=r*b-v.left;for(let a=0;a<h;++a){let o=-(2**53-1),s=0,c=0;for(let t=0;t<x;++t){let r=n+t*C;if(r>=0&&r<p)for(let n=0;n<S;++n){let l=i+n*w;if(l>=0&&l<m){let i=u[e][r][l][a]+d[t][n][a];i>o&&(o=i,s=t,c=n)}}}ee[s][c][a]+=D[e][t][r][a]}}}return{dataId:l.write(Ni(ee,r.dtype),i.shape,i.dtype),shape:i.shape,dtype:i.dtype}}};J();var $j={kernelName:Lt,backendName:`cpu`,kernelFunc:({inputs:e,backend:t,attrs:n})=>{let{x:r,filter:i,dy:a}=e,{strides:o,pad:s,dilations:c}=n,l=t,u=Te(r.shape,l.data.get(r.dataId).values),d=Te(i.shape,l.data.get(i.dataId).values),{batchSize:f,inHeight:p,inWidth:m,inChannels:h,outHeight:g,outWidth:_,padInfo:v,strideHeight:y,strideWidth:b,filterHeight:x,filterWidth:S,dilationHeight:C,dilationWidth:w,outShape:T}=il(r.shape,i.shape,o,s,`NHWC`,c);E(a.rank===T.length,()=>`Error in ${Lt}, dy must have the same rank as output ${T.length}, but got ${a.rank}`);let D=Te(T,l.data.get(a.dataId).values),ee=ke(r.shape,r.dtype);for(let e=0;e<f;++e)for(let t=0;t<g;++t){let n=t*y-v.top;for(let r=0;r<_;++r){let i=r*b-v.left;for(let a=0;a<h;++a){let o=-(2**53-1),s=n<0?0:n,c=i<0?0:i;for(let t=0;t<x;++t){let r=n+t*C;if(r>=0&&r<p)for(let n=0;n<S;++n){let l=i+n*w;if(l>=0&&l<m){let i=u[e][r][l][a]+d[t][n][a];i>o&&(o=i,s=r,c=l)}}}ee[e][s][c][a]+=D[e][t][r][a]}}}return{dataId:l.write(Ni(ee,r.dtype),r.shape,r.dtype),shape:r.shape,dtype:r.dtype}}};J();function eM(e){let{inputs:t,backend:n,attrs:r}=e,{image:i}=t,{canvas:a,options:o}=r,{contextOptions:s,imageOptions:c}=o||{},l=c?.alpha||1,u=s?.contextType||`2d`;if(u!==`2d`)throw Error(`Context type ${s.contextType} is not supported by the CPU backend.`);let d=a.getContext(u,s?.contextAttributes||{});if(d==null)throw Error(`Could not get the context with ${u} type.`);let[f,p]=i.shape.slice(0,2),m=i.shape.length===2?1:i.shape[2],h=n.data.get(i.dataId).values,g=i.dtype===`float32`?255:1,_=new Uint8ClampedArray(p*f*4);for(let e=0;e<f*p;++e){let t=[0,0,0,255*l];for(let n=0;n<m;n++){let r=h[e*m+n];if(i.dtype===`float32`){if(r<0||r>1)throw Error(`Tensor values for a float32 Tensor must be in the range [0 - 1] but encountered ${r}.`)}else if(i.dtype===`int32`&&(r<0||r>255))throw Error(`Tensor values for a int32 Tensor must be in the range [0 - 255] but encountered ${r}.`);m===1?(t[0]=r*g,t[1]=r*g,t[2]=r*g):t[n]=r*g}let n=e*4;_[n+0]=Math.round(t[0]),_[n+1]=Math.round(t[1]),_[n+2]=Math.round(t[2]),_[n+3]=Math.round(t[3])}a.width=p,a.height=f;let v=new ImageData(_,p,f);return d.putImageData(v,0,0),i}var tM={kernelName:zt,backendName:`cpu`,kernelFunc:eM};J();function nM(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r;Y(i,`sum`);let s;s=i.dtype===`bool`?LD({inputs:{x:i},backend:n,attrs:{dtype:`int32`}}):MD({inputs:{x:i},backend:n});let c=s.shape.length,l=A(a,s.shape),u=xf(l,c),d=l,f=s;u!=null&&(f=QO({inputs:{x:s},backend:n,attrs:{perm:u}}),d=Cf(d.length,c)),bf(`sum`,d,f.shape.length);let[p,m]=vf(f.shape,d),h=jD(n,p,fa(f.dtype,`int32`)),g=O(m),_=n.data.get(h.dataId).values,v=n.data.get(f.dataId).values;for(let e=0;e<_.length;++e){let t=e*g,n=0;for(let e=0;e<g;++e)n+=v[t+e];_[e]=n}if(o){let e=yf(h.shape,l),t=h;h=mA({inputs:{x:h},backend:n,attrs:{shape:e}}),n.disposeIntermediateTensorInfo(t)}return n.disposeIntermediateTensorInfo(s),u!=null&&n.disposeIntermediateTensorInfo(f),h}var rM={kernelName:`Sum`,backendName:`cpu`,kernelFunc:nM};J();function iM(e){let{inputs:t,backend:n,attrs:r}=e,{equation:i}=r,a=t,{allDims:o,summedDims:s,idDims:c}=LE(i,a.length);zE(o.length,c,a);let{path:l,steps:u}=BE(s,c),d=u.length,f=null,p=o.length,m=[];for(let e=0;e<d;++e){for(let t of u[e]){let{permutationIndices:e,expandDims:r}=RE(p,c[t]),i;VE(e)?i=a[t]:(i=QO({inputs:{x:a[t]},backend:n,attrs:{perm:e}}),m.push(i));let o=i.shape.slice();for(let e=0;e<r.length;++e)o.splice(r[e],0,1);k(i.shape,o)||(i=mA({inputs:{x:i},backend:n,attrs:{shape:o}}),m.push(i)),f===null?f=i:(f=UO({inputs:{a:i,b:f},backend:n}),m.push(f))}e<d-1&&(l[e]>=0&&(f=nM({inputs:{x:f},backend:n,attrs:{axis:l[e]-(o.length-p),keepDims:!1}}),m.push(f)),p--)}for(let e of m)e!==f&&n.disposeIntermediateTensorInfo(e);return f}var aM={kernelName:Vt,backendName:`cpu`,kernelFunc:iM};J();function oM(e){let{inputs:t,backend:n}=e,{dy:r,y:i}=t;Y([r,i],`eluGrad`);let a=new Float32Array(O(i.shape)),o=n.data.get(i.dataId).values,s=n.data.get(r.dataId).values;for(let e=0;e<o.length;++e){let t=o[e];t>=0?a[e]=s[e]:a[e]=s[e]*(t+1)}return n.makeTensorInfo(i.shape,`float32`,a)}var sM={kernelName:Ht,backendName:`cpu`,kernelFunc:oM};J();var cM=xE,lM=SE,uM=CE,dM=wE,fM=TE,pM=EE,mM={kernelName:`Erf`,backendName:`cpu`,kernelFunc:XD(`Erf`,e=>{let t=Math.sign(e),n=Math.abs(e),r=1/(1+cM*n);return t*(1-((((pM*r+fM)*r+dM)*r+uM)*r+lM)*r*Math.exp(-n*n))})};J();function hM(e){let{inputs:t,backend:n,attrs:r}=e,{input:i}=t,{dim:a}=r,o=i.shape.length,s=i.shape.slice(),c=a;return a<0&&(E(-(o+1)<=a,()=>`Axis must be in the interval [${-(o+1)}, ${o}]`),c=o+a+1),s.splice(c,0,1),mA({inputs:{x:i},backend:n,attrs:{shape:s}})}var gM={kernelName:Wt,backendName:`cpu`,kernelFunc:hM};J();var _M=OD((e,t)=>e/t),vM=zD(Bt,_M),yM={kernelName:Bt,backendName:`cpu`,kernelFunc:vM};J();function bM(e,t,n){let r=e.shape,i=r[0],a=r[1],o=n.data.get(e.dataId),s=o.complexTensorInfos.real,c=o.complexTensorInfos.imag,l=[i,a],u=O(l),d=de(`float32`,u),f=de(`float32`,u);for(let e=0;e<i;e++){let r=Dk({inputs:{x:s},backend:n,attrs:{begin:[e,0],size:[1,a]}}),i=Dk({inputs:{x:c},backend:n,attrs:{begin:[e,0],size:[1,a]}}),o=kD({inputs:{real:r,imag:i},backend:n}),{real:l,imag:u}=xM(o,t,n),p=OE(l,u);for(let t=0;t<a;t++){let n=ME(p,t);d[e*a+t]=n.real,f[e*a+t]=n.imag}n.disposeIntermediateTensorInfo(r),n.disposeIntermediateTensorInfo(i),n.disposeIntermediateTensorInfo(o)}let p=n.makeTensorInfo(l,`float32`,d),m=n.makeTensorInfo(l,`float32`,f),h=kD({inputs:{real:p,imag:m},backend:n});return n.disposeIntermediateTensorInfo(p),n.disposeIntermediateTensorInfo(m),h}function xM(e,t,n){let r=O(e.shape),i=n.data.get(e.dataId),a=n.data.get(i.complexTensorInfos.real.dataId).values,o=n.data.get(i.complexTensorInfos.imag.dataId).values;if(SM(r)){let i=CM(a,o,r,t,n),s=[e.shape[0],e.shape[1]];if(t){let e=n.makeTensorInfo(s,`float32`,i.real),t=n.makeTensorInfo(s,`float32`,i.imag),a=n.makeTensorInfo([],`float32`,ji(r,`float32`)),o=MD({inputs:{x:a},backend:n}),c=yM.kernelFunc({inputs:{a:e,b:a},backend:n}),l=yM.kernelFunc({inputs:{a:t,b:o},backend:n}),u=n.data.get(c.dataId).values,d=n.data.get(l.dataId).values;return n.disposeIntermediateTensorInfo(e),n.disposeIntermediateTensorInfo(t),n.disposeIntermediateTensorInfo(a),n.disposeIntermediateTensorInfo(o),n.disposeIntermediateTensorInfo(c),n.disposeIntermediateTensorInfo(l),{real:u,imag:d}}return i}else return kE(wM(OE(a,o),r,t))}function SM(e){return(e&e-1)==0}function CM(e,t,n,r,i){if(n===1)return{real:e,imag:t};let a=OE(e,t),o=n/2,s=AE(a),c=s.real,l=s.imag,u=[c.length],d=i.makeTensorInfo(u,`float32`,c),f=i.makeTensorInfo(u,`float32`,l),p=kD({inputs:{real:d,imag:f},backend:i}),m=jE(a),h=m.real,g=m.imag,_=[h.length],v=i.makeTensorInfo(_,`float32`,h),y=i.makeTensorInfo(_,`float32`,g),b=kD({inputs:{real:v,imag:y},backend:i}),x=CM(c,l,o,r,i),S=x.real,C=x.imag,w=[S.length],T=i.makeTensorInfo(w,`float32`,S),E=i.makeTensorInfo(w,`float32`,C),D=kD({inputs:{real:T,imag:E},backend:i}),ee=CM(h,g,o,r,i),O=ee.real,te=ee.imag,ne=[O.length],k=i.makeTensorInfo(ne,`float32`,O),re=i.makeTensorInfo(ne,`float32`,te),ie=kD({inputs:{real:k,imag:re},backend:i}),ae=PE(n,r),oe=[ae.real.length],se=i.makeTensorInfo(oe,`float32`,ae.real),ce=i.makeTensorInfo(oe,`float32`,ae.imag),le=kD({inputs:{real:se,imag:ce},backend:i}),A=UO({inputs:{a:le,b:ie},backend:i}),ue=HD({inputs:{a:D,b:A},backend:i}),de=Jk({inputs:{a:D,b:A},backend:i}),fe=PD({inputs:{input:ue},backend:i}),pe=PD({inputs:{input:de},backend:i}),me=mj({inputs:{input:ue},backend:i}),he=mj({inputs:{input:de},backend:i}),ge=gj({inputs:[fe,pe],backend:i,attrs:{axis:0}}),_e=gj({inputs:[me,he],backend:i,attrs:{axis:0}}),ve=i.data.get(ge.dataId).values,ye=i.data.get(_e.dataId).values;return i.disposeIntermediateTensorInfo(d),i.disposeIntermediateTensorInfo(f),i.disposeIntermediateTensorInfo(p),i.disposeIntermediateTensorInfo(v),i.disposeIntermediateTensorInfo(y),i.disposeIntermediateTensorInfo(b),i.disposeIntermediateTensorInfo(T),i.disposeIntermediateTensorInfo(E),i.disposeIntermediateTensorInfo(D),i.disposeIntermediateTensorInfo(k),i.disposeIntermediateTensorInfo(re),i.disposeIntermediateTensorInfo(ie),i.disposeIntermediateTensorInfo(se),i.disposeIntermediateTensorInfo(ce),i.disposeIntermediateTensorInfo(le),i.disposeIntermediateTensorInfo(A),i.disposeIntermediateTensorInfo(ue),i.disposeIntermediateTensorInfo(de),i.disposeIntermediateTensorInfo(fe),i.disposeIntermediateTensorInfo(me),i.disposeIntermediateTensorInfo(pe),i.disposeIntermediateTensorInfo(he),i.disposeIntermediateTensorInfo(ge),i.disposeIntermediateTensorInfo(_e),{real:ve,imag:ye}}function wM(e,t,n){let r=new Float32Array(t*2);for(let i=0;i<t;i++){let a=0,o=0;for(let r=0;r<t;r++){let s=FE(i*r,t,n),c=ME(e,r);a+=c.real*s.real-c.imag*s.imag,o+=c.real*s.imag+c.imag*s.real}n&&(a/=t,o/=t),NE(r,a,o,i)}return r}J();function TM(e){let{inputs:t,backend:n}=e,{input:r}=t,i=O(r.shape),a=r.shape[r.shape.length-1],o=i/a,s=mA({inputs:{x:r},backend:n,attrs:{shape:[o,a]}}),c=bM(s,!1,n),l=mA({inputs:{x:c},backend:n,attrs:{shape:r.shape}});return n.disposeIntermediateTensorInfo(s),n.disposeIntermediateTensorInfo(c),l}var EM={kernelName:`FFT`,backendName:`cpu`,kernelFunc:TM};J();function DM(e){let{backend:t,attrs:n}=e,{shape:r,value:i,dtype:a}=n,o=a||xe(i),s=fe(o,O(r));return kM(s,i,o),t.makeTensorInfo(r,o,s)}var OM={kernelName:Kt,backendName:`cpu`,kernelFunc:DM};function kM(e,t,n){e.fill(t)}J();var AM={kernelName:qt,backendName:`cpu`,kernelFunc:({inputs:e,attrs:t,backend:n})=>{let{image:r}=e,i=n,a=de(r.dtype,O(r.shape)),[o,s,c,l]=r.shape,u=i.data.get(r.dataId).values;for(let e=0;e<o;e++){let t=e*c*s*l;for(let e=0;e<s;e++){let n=c*l*e;for(let e=0;e<c;e++){let r=e*l;for(let i=0;i<l;i++){let o=Math.round(c-e-1),s=t+n+r+i,d=u[s];if(o>=0&&o<c){let e=o*l;d=u[t+n+e+i]}a[s]=d}}}}return{dataId:i.write(a,r.shape,r.dtype),shape:r.shape,dtype:r.dtype}}};J();function jM(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a,bias:o,preluActivationWeights:s}=t,{strides:c,pad:l,dataFormat:u,dilations:d,dimRoundingMode:f,activation:p,leakyreluAlpha:m}=r,h=vj({inputs:{x:i,filter:a},backend:n,attrs:{strides:c,pad:l,dataFormat:u,dilations:d,dimRoundingMode:f}});if(o){let e=h;if(u===`NCHW`&&o.shape.length===1&&o.shape[0]!==1){let e=mA({inputs:{x:o},backend:n,attrs:{shape:[o.shape[0],1,1]}});h=HD({inputs:{a:h,b:e},backend:n}),n.disposeIntermediateTensorInfo(e)}else h=HD({inputs:{a:h,b:o},backend:n});n.disposeIntermediateTensorInfo(e)}if(p){let e=h;if(u===`NCHW`&&p===`prelu`&&s.shape.length===1&&s.shape[0]!==1){let e=mA({inputs:{x:s},backend:n,attrs:{shape:[s.shape[0],1,1]}});h=pA(n,h,p,e,m),n.disposeIntermediateTensorInfo(e)}else h=pA(n,h,p,s,m);n.disposeIntermediateTensorInfo(e)}return h}var MM={kernelName:Gr,backendName:`cpu`,kernelFunc:jM};J();function NM(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a,bias:o,preluActivationWeights:s}=t,{strides:c,pad:l,dataFormat:u,dilations:d,dimRoundingMode:f,activation:p,leakyreluAlpha:m}=r,h=Uj({inputs:{x:i,filter:a},backend:n,attrs:{strides:c,pad:l,dataFormat:u,dilations:d,dimRoundingMode:f}});if(o){let e=h;h=HD({inputs:{a:h,b:o},backend:n}),n.disposeIntermediateTensorInfo(e)}if(p){let e=h;h=pA(n,h,p,s,m),n.disposeIntermediateTensorInfo(e)}return h}var PM={kernelName:Kr,backendName:`cpu`,kernelFunc:NM};J();function FM(e){let{inputs:t,backend:n}=e,{params:r,indices:i}=t,a=O(r.shape),o=i.shape,s=o[o.length-1],[c,l,u,d]=yT(r,i);if(l===0)return n.makeTensorInfo(c,r.dtype,[]);let f=n.data.get(i.dataId).values,p=_O(f,n.bufferSync(r),r.dtype,l,s,u,d,r.shape,a);return n.makeTensorInfo(c,r.dtype,p.values)}var IM={kernelName:Qt,backendName:`cpu`,kernelFunc:FM};J();function LM(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,indices:a}=t,{axis:o,batchDims:s}=r;Y([i,a],`gatherV2`);let c=A(o,i.shape)[0],l=n.data.get(a.dataId).values,u=i.shape[c];for(let e=0;e<l.length;++e){let t=l[e];E(t<=u-1&&t>=0,()=>`GatherV2: the index value ${t} is not in [0, ${u-1}]`)}let d=s;s??(d=0);let f=O(a.shape),p=mD(i,a,c,d),m=mA({inputs:{x:i},backend:n,attrs:{shape:[p.batchSize,p.outerSize,p.dimSize,p.sliceSize]}}),h=mA({inputs:{x:a},backend:n,attrs:{shape:[p.batchSize,f/p.batchSize]}}),g=[p.batchSize,p.outerSize,f/p.batchSize,p.sliceSize],_=n.bufferSync(h),v=vO(n.bufferSync(m),_,g);return n.disposeIntermediateTensorInfo(m),n.disposeIntermediateTensorInfo(h),n.makeTensorInfo(p.outputShape,v.dtype,v.values)}var RM={kernelName:Zt,backendName:`cpu`,kernelFunc:LM};J();function zM(e){let{inputs:t,backend:n}=e,{input:r}=t,i=O(r.shape),a=r.shape[r.shape.length-1],o=i/a,s=mA({inputs:{x:r},backend:n,attrs:{shape:[o,a]}}),c=bM(s,!0,n),l=mA({inputs:{x:c},backend:n,attrs:{shape:r.shape}});return n.disposeIntermediateTensorInfo(s),n.disposeIntermediateTensorInfo(c),l}var BM={kernelName:nn,backendName:`cpu`,kernelFunc:zM};J();var VM=XD(an,e=>+!!Number.isFinite(e),`bool`),HM={kernelName:an,backendName:`cpu`,kernelFunc:VM};J();var UM=XD(on,e=>+(Math.abs(e)===1/0),`bool`),WM={kernelName:on,backendName:`cpu`,kernelFunc:UM};J();var GM=XD(sn,e=>+!!Number.isNaN(e),`bool`),KM={kernelName:sn,backendName:`cpu`,kernelFunc:GM};J();function qM(e){let{backend:t,attrs:n}=e,{start:r,stop:i,num:a}=n,o=jO(r,i,a);return t.makeTensorInfo([o.length],`float32`,o)}var JM={kernelName:dn,backendName:`cpu`,kernelFunc:qM};J();var YM=XD(fn,e=>Math.log1p(e)),XM={kernelName:fn,backendName:`cpu`,kernelFunc:YM};J();var ZM=OD((e,t)=>e&&t),QM=zD(pn,ZM,null,`bool`),$M={kernelName:pn,backendName:`cpu`,kernelFunc:QM};J();var eN=XD(mn,e=>+!e,`bool`),tN={kernelName:mn,backendName:`cpu`,kernelFunc:eN};J();var nN=OD((e,t)=>e||t),rN=zD(hn,nN,null,`bool`),iN={kernelName:hn,backendName:`cpu`,kernelFunc:rN};J();function aN(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{depthRadius:a,bias:o,alpha:s,beta:c}=r;Y(i,`LRN`);let l=i.shape[3],u=l-1,d=n.data.get(i.dataId).values,f=O(i.shape),p=new Float32Array(f);function m(e){let t=e%l,n=e-t+Math.max(0,t-a),r=e-t+Math.min(t+a,u),i=0;for(;n<=r;n++){let e=d[n];i+=e*e}return i}for(let e=0;e<f;e++){let t=m(e);p[e]=d[e]*(o+s*t)**+-c}return n.makeTensorInfo(i.shape,i.dtype,p)}var oN={kernelName:`LRN`,backendName:`cpu`,kernelFunc:aN};J();function sN(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,y:a,dy:o}=t,{depthRadius:s,bias:c,alpha:l,beta:u}=r;Y(o,`LRNGrad`);let d=O(o.shape),f=o.shape[3],p=n.data.get(o.dataId).values,m=n.data.get(i.dataId).values,h=n.data.get(a.dataId).values,g=new Float32Array(d),_=d;for(let e=0;e<_;e++){let t=e%f,n=e-t+Math.max(0,t-s),r=e-t+Math.min(f,t+s+1),i=0;for(let e=n;e<r;e++)i+=m[e]**2;i=l*i+c;for(let t=n;t<r;t++){let n=-2*l*u*m[t]*h[e]/i;e===t&&(n+=i**+-u),n*=p[e],g[t]+=n}}return n.makeTensorInfo(o.shape,i.dtype,g)}var cN={kernelName:yn,backendName:`cpu`,kernelFunc:sN};J();function lN(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{reductionIndices:a,keepDims:o}=r,s=n,c=i.shape,l=c.length,u=A(a,c),d=u,f=xf(d,l),p=s.data.get(i.dataId).values;if(f!=null){let e=Array(l);for(let t=0;t<e.length;t++)e[t]=c[f[t]];p=ZO(p,c,i.dtype,f,e),d=Cf(d.length,l),c=e}Y(i,`max`),bf(`max`,d,l);let[m,h]=vf(c,d),g=O(h),_=PO(p,g,m,i.dtype),v=s.write(_,m,i.dtype),y=m;return o&&(y=yf(m,u)),{dataId:v,shape:y,dtype:i.dtype}}var uN={kernelName:`Max`,backendName:`cpu`,kernelFunc:lN};J();function dN(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t;Y(i,`maxPool`);let{filterSize:a,strides:o,pad:s,dimRoundingMode:c}=r;E(yl(o,1),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${o} and dilations '1'`);let l=al(i.shape,a,o,1,s,c),u;if(l.filterWidth===1&&l.filterHeight===1&&k(l.inShape,l.outShape))u=MD({inputs:{x:i},backend:n});else{let e=n.data.get(i.dataId).values,t=j(i.shape),r=GA(e,i.shape,i.dtype,t,l,`max`);u=n.makeTensorInfo(l.outShape,i.dtype,r.values)}return u}var fN={kernelName:Sn,backendName:`cpu`,kernelFunc:dN};J();function pN(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{filterSize:a,strides:o,pad:s,dimRoundingMode:c,dataFormat:l}=r;Y(i,`maxPool3d`);let u=ol(i.shape,a,o,1,s,c,l),d=n.data.get(i.dataId).values,f=qA(d,i.shape,i.dtype,j(i.shape),u,`max`);return n.makeTensorInfo(f.shape,`float32`,f.values)}var mN={kernelName:wn,backendName:`cpu`,kernelFunc:pN};J();function hN(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a}=t,{filterSize:o,strides:s,pad:c,dimRoundingMode:l}=r;Y([i,a],`maxPool3DGrad`);let u=ol(a.shape,o,s,1,c,l),d=JA(n.bufferSync(a),u),f=u.strideDepth,p=u.strideHeight,m=u.strideWidth,h=u.dilationDepth,g=u.dilationHeight,_=u.dilationWidth,v=u.effectiveFilterDepth,y=u.effectiveFilterHeight,b=u.effectiveFilterWidth,x=v-1-u.padInfo.front,S=b-1-u.padInfo.left,C=y-1-u.padInfo.top,w=V(a.shape,`float32`),T=n.bufferSync(i);for(let e=0;e<u.batchSize;++e)for(let t=0;t<u.inChannels;++t)for(let n=0;n<u.inDepth;++n)for(let r=0;r<u.inHeight;++r)for(let i=0;i<u.inWidth;++i){let a=n-x,o=r-C,s=i-S,c=0;for(let n=0;n<v;n+=h){let r=(a+n)/f;if(!(r<0||r>=u.outDepth||Math.floor(r)!==r))for(let i=0;i<y;i+=g){let a=(o+i)/p;if(!(a<0||a>=u.outHeight||Math.floor(a)!==a))for(let o=0;o<b;o+=_){let l=(s+o)/m;if(l<0||l>=u.outWidth||Math.floor(l)!==l)continue;let f=+(v*y*b-1-d.get(e,r,a,l,t)===n*y*b+i*b+o);if(f===0)continue;let p=T.get(e,r,a,l,t);c+=p*f}}}w.set(c,e,n,r,i,t)}return n.makeTensorInfo(w.shape,w.dtype,w.values)}var gN={kernelName:Tn,backendName:`cpu`,kernelFunc:hN};J();function _N(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a,output:o}=t,s=a;Y([a,o],`maxPoolGrad`);let{filterSize:c,strides:l,pad:u,dimRoundingMode:d}=r,f=al(s.shape,c,l,1,u,d),p=n.data.get(s.dataId).values,m=V(f.outShape,s.dtype,KA(p,s.shape,s.dtype,f).values),h=f.strideHeight,g=f.strideWidth,_=f.dilationHeight,v=f.dilationWidth,y=f.effectiveFilterHeight,b=f.effectiveFilterWidth,x=b-1-f.padInfo.left,S=y-1-f.padInfo.top,C=V(s.shape,`float32`),w=n.data.get(i.dataId).values,T=V(i.shape,`float32`,w);for(let e=0;e<f.batchSize;++e)for(let t=0;t<f.inChannels;++t)for(let n=0;n<f.inHeight;++n)for(let r=0;r<f.inWidth;++r){let i=n-S,a=r-x,o=0;for(let n=0;n<y;n+=_){let r=(i+n)/h;if(!(r<0||r>=f.outHeight||Math.floor(r)!==r))for(let i=0;i<b;i+=v){let s=(a+i)/g;if(s<0||s>=f.outWidth||Math.floor(s)!==s)continue;let c=+(y*b-1-m.get(e,r,s,t)===n*b+i);if(c===0)continue;let l=T.get(e,r,s,t);o+=l*c}}C.set(o,e,n,r,t)}return n.makeTensorInfo(C.shape,C.dtype,C.values)}var vN={kernelName:Cn,backendName:`cpu`,kernelFunc:_N};J();function yN(e,t,n,r,i){let a=GA(e,t,n,j(t),i,`max`),o=KA(e,t,n,i,!0,r);return[a.values,o.values]}J();var bN={kernelName:En,backendName:`cpu`,kernelFunc:({inputs:e,attrs:t,backend:n})=>{let{x:r}=e,{filterSize:i,strides:a,pad:o,includeBatchInIndex:s}=t,c=n;Y(r,`MaxPoolWithArgmax`);let l=c.data.get(r.dataId).values,u=al(r.shape,i,a,[1,1],o),[d,f]=yN(l,r.shape,r.dtype,s,u),p=c.write(d,u.outShape,r.dtype),m=c.write(f,u.outShape,r.dtype);return[{dataId:p,shape:u.outShape,dtype:r.dtype},{dataId:m,shape:u.outShape,dtype:`int32`}]}};J();function xN(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r,s=A(a,i.shape),c=vf(i.shape,s)[1],l=O(c),u=[],d=n.makeTensorInfo([],`float32`,new Float32Array([l]));u.push(d);let f=LD({inputs:{x:i},backend:n,attrs:{dtype:`float32`}});u.push(f);let p=vM({inputs:{a:f,b:d},backend:n});u.push(p);let m=nM({inputs:{x:p},backend:n,attrs:{axis:a,keepDims:o}});return u.forEach(e=>n.disposeIntermediateTensorInfo(e)),m}var SN={kernelName:Dn,backendName:`cpu`,kernelFunc:xN};J();function CN(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r;Y(i,`min`);let s=A(a,i.shape),c=s,l=xf(c,i.shape.length),u=i;l!=null&&(u=QO({inputs:{x:i},backend:n,attrs:{perm:l}}),c=Cf(c.length,i.shape.length)),bf(`min`,c,u.shape.length);let[d,f]=vf(u.shape,c),p=O(f),m=Oe(O(d),u.dtype),h=n.data.get(u.dataId).values;for(let e=0;e<m.length;++e){let t=e*p,n=h[t];for(let e=0;e<p;++e){let r=h[t+e];(Number.isNaN(r)||r<n)&&(n=r)}m[e]=n}l!=null&&n.disposeIntermediateTensorInfo(u);let g=n.makeTensorInfo(d,u.dtype,m);if(o){let e=yf(d,s),t=mA({inputs:{x:g},backend:n,attrs:{shape:e}});return n.disposeIntermediateTensorInfo(g),t}return g}var wN={kernelName:`Min`,backendName:`cpu`,kernelFunc:CN};J();function TN(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{paddings:a,mode:o}=r;Y(i,`mirrorPad`);let s=a.map((e,t)=>e[0]+i.shape[t]+e[1]),c=a.map(e=>e[0]),l=a.map((e,t)=>e[0]+i.shape[t]),u=o===`reflect`?0:1,d=n.data.get(i.dataId).values,f=i.shape.length,p=j(i.shape),m=O(s),h=s.length,g=j(s),_=de(i.dtype,m);for(let e=0;e<m;e++){let t=Me(e,h,g);for(let e=0;e<h;e++)t[e]<c[e]?t[e]=c[e]*2-t[e]-u:t[e]>=l[e]&&(t[e]=(l[e]-1)*2-t[e]+u);t=t.map((e,t)=>e-c[t]),_[e]=d[je(t,f,p)]}return{dataId:n.write(_,s,i.dtype),shape:s,dtype:i.dtype}}var EN={kernelName:kn,backendName:`cpu`,kernelFunc:TN};J();var DN={kernelName:`Mod`,backendName:`cpu`,kernelFunc:zD(`Mod`,OD(((e,t)=>{let n=e%t;return e<0&&t<0||e>=0&&t>=0?n:(n+t)%t})))};J();function ON(e){let{inputs:t,backend:n,attrs:r}=e,{logits:i}=t,{dim:a}=r,o=i.shape.length,s=a;if(s===-1&&(s=o-1),s!==o-1)throw Error(`Softmax along a non-last dimension is not yet supported. Logits was rank ${o} and dim was ${s}`);let c=A([s],i.shape),l=lN({inputs:{x:i},backend:n,attrs:{reductionIndices:c,keepDims:!1}}),u=yf(l.shape,c),d=mA({inputs:{x:l},backend:n,attrs:{shape:u}}),f=Jk({inputs:{a:i,b:d},backend:n}),p=oO({inputs:{x:f},backend:n}),m=nM({inputs:{x:p},backend:n,attrs:{axis:c,keepDims:!1}}),h=mA({inputs:{x:m},backend:n,attrs:{shape:u}}),g=vM({inputs:{a:p,b:h},backend:n});return n.disposeIntermediateTensorInfo(l),n.disposeIntermediateTensorInfo(d),n.disposeIntermediateTensorInfo(f),n.disposeIntermediateTensorInfo(p),n.disposeIntermediateTensorInfo(m),n.disposeIntermediateTensorInfo(h),g}var kN={kernelName:vr,backendName:`cpu`,kernelFunc:ON};J();var AN=u(Lg());function jN(e){let{inputs:t,backend:n,attrs:r}=e,{logits:i}=t,{numSamples:a,seed:o,normalized:s}=r;Y(i,`multinomial`);let c=s?i:ON({inputs:{logits:i},backend:n,attrs:{dim:-1}}),l=c.shape[0],u=c.shape[1],d=n.data.get(c.dataId).values,f=[l,a],p=Oe(O(f),`int32`);for(let e=0;e<l;++e){let t=e*u,n=new Float32Array(u-1);n[0]=d[t];for(let e=1;e<n.length;++e)n[e]=n[e-1]+d[t+e];let r=AN.alea(o.toString()),i=e*a;for(let e=0;e<a;++e){let t=r();p[i+e]=n.length;for(let r=0;r<n.length;r++)if(t<n[r]){p[i+e]=r;break}}}return s||n.disposeIntermediateTensorInfo(c),n.makeTensorInfo(f,`int32`,p)}var MN={kernelName:An,backendName:`cpu`,kernelFunc:jN};J();var NN=Hx;function PN(e){let{inputs:t,backend:n,attrs:r}=e,{boxes:i,scores:a}=t,{maxOutputSize:o,iouThreshold:s,scoreThreshold:c}=r;Y(i,`NonMaxSuppression`);let l=n.data.get(i.dataId).values,u=n.data.get(a.dataId).values,{selectedIndices:d}=NN(l,u,o,s,c);return n.makeTensorInfo([d.length],`int32`,new Int32Array(d))}var FN={kernelName:Nn,backendName:`cpu`,kernelFunc:PN};J();var IN=Ux;function LN(e){let{inputs:t,backend:n,attrs:r}=e,{boxes:i,scores:a}=t,{maxOutputSize:o,iouThreshold:s,scoreThreshold:c,padToMaxOutputSize:l}=r;Y(i,`NonMaxSuppressionPadded`);let u=n.data.get(i.dataId).values,d=n.data.get(a.dataId).values,{selectedIndices:f,validOutputs:p}=IN(u,d,o,s,c,l);return[n.makeTensorInfo([f.length],`int32`,new Int32Array(f)),n.makeTensorInfo([],`int32`,new Int32Array([p]))]}var RN={kernelName:Pn,backendName:`cpu`,kernelFunc:LN};J();var zN=Wx;function BN(e){let{inputs:t,backend:n,attrs:r}=e,{boxes:i,scores:a}=t,{maxOutputSize:o,iouThreshold:s,scoreThreshold:c,softNmsSigma:l}=r;Y(i,`NonMaxSuppressionWithScore`);let u=n.data.get(i.dataId).values,d=n.data.get(a.dataId).values,{selectedIndices:f,selectedScores:p}=zN(u,d,o,s,c,l);return[n.makeTensorInfo([f.length],`int32`,new Int32Array(f)),n.makeTensorInfo([p.length],`float32`,new Float32Array(p))]}var VN={kernelName:Fn,backendName:`cpu`,kernelFunc:BN};J();function HN(e){let{inputs:t,backend:n,attrs:r}=e,{indices:i}=t,{dtype:a,depth:o,onValue:s,offValue:c}=r;Y(i,`oneHot`);let l=O(i.shape),u=new Float32Array(l*o);u.fill(c);let d=n.data.get(i.dataId).values;for(let e=0;e<l;++e)d[e]>=0&&d[e]<o&&(u[e*o+d[e]]=s);return n.makeTensorInfo([...i.shape,o],a,u)}var UN={kernelName:Ln,backendName:`cpu`,kernelFunc:HN};J();function WN(e){let{inputs:t,backend:n}=e,{x:r}=t;if(r.dtype===`string`)throw Error(`zerosLike is not supported for string tensors`);if(r.dtype===`complex64`){let e=PD({inputs:{input:r},backend:n}),t=WN({inputs:{x:e},backend:n}),i=mj({inputs:{input:r},backend:n}),a=WN({inputs:{x:i},backend:n}),o=kD({inputs:{real:t,imag:a},backend:n});return n.disposeIntermediateTensorInfo(e),n.disposeIntermediateTensorInfo(t),n.disposeIntermediateTensorInfo(i),n.disposeIntermediateTensorInfo(a),o}else return DM({backend:n,attrs:{shape:r.shape,value:0,dtype:r.dtype}})}var GN={kernelName:Br,backendName:`cpu`,kernelFunc:WN};J();function KN(e){let{inputs:t,backend:n}=e,{x:r}=t;if(r.dtype===`string`)throw Error(`onesLike is not supported for string tensors`);if(r.dtype===`complex64`){let e=PD({inputs:{input:r},backend:n}),t=KN({inputs:{x:e},backend:n}),i=mj({inputs:{input:r},backend:n}),a=WN({inputs:{x:i},backend:n}),o=kD({inputs:{real:t,imag:a},backend:n});return n.disposeIntermediateTensorInfo(e),n.disposeIntermediateTensorInfo(t),n.disposeIntermediateTensorInfo(i),n.disposeIntermediateTensorInfo(a),o}else return DM({backend:n,attrs:{shape:r.shape,value:1,dtype:r.dtype}})}var qN={kernelName:In,backendName:`cpu`,kernelFunc:KN};J();function JN(e){let{inputs:t,backend:n,attrs:r}=e,{axis:i}=r;if(t.length===1)return hM({inputs:{input:t[0]},backend:n,attrs:{dim:i}});let a=t[0].shape,o=t[0].dtype;t.forEach(e=>{D(a,e.shape,`All tensors passed to stack must have matching shapes`),E(o===e.dtype,()=>`All tensors passed to stack must have matching dtypes`)});let s=[],c=gj({inputs:t.map(e=>{let t=hM({inputs:{input:e},backend:n,attrs:{dim:i}});return s.push(t),t}),backend:n,attrs:{axis:i}});return s.forEach(e=>n.disposeIntermediateTensorInfo(e)),c}var YN={kernelName:Rn,backendName:`cpu`,kernelFunc:JN};J();function XN(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{paddings:a,constantValue:o}=r;Y(i,`pad`);let s=a.map((e,t)=>e[0]+i.shape[t]+e[1]),c=a.map(e=>e[0]),l=n.data.get(i.dataId).values,u=O(i.shape),d=i.shape.length,f=j(i.shape),p=O(s),m=s.length,h=j(s),g=de(i.dtype,p);o!==0&&g.fill(o);for(let e=0;e<u;e++){let t=je(Me(e,d,f).map((e,t)=>e+c[t]),m,h);g[t]=l[e]}return{dataId:n.write(g,s,i.dtype),shape:s,dtype:i.dtype}}var ZN={kernelName:zn,backendName:`cpu`,kernelFunc:XN};J();var QN={kernelName:`Pow`,backendName:`cpu`,kernelFunc:zD(`Pow`,OD((e,t)=>e**+t))};J();function $N(e){let{inputs:t,backend:n,attrs:r}=e,{paramsNestedSplits:i,paramsDenseValues:a,indices:o}=t,{outputRaggedRank:s}=r,c=i.map(e=>n.data.get(e.dataId).values),l=i.map(e=>e.shape),u=n.data.get(a.dataId).values,d=n.data.get(o.dataId).values,[f,p,m]=uk(c,l,u,a.shape,a.dtype,d,o.shape,s),h=f.map(e=>n.makeTensorInfo([e.length],`int32`,e)),g=n.makeTensorInfo(m,a.dtype,p);return h.concat([g])}var eP={kernelName:Un,backendName:`cpu`,kernelFunc:$N};J();function tP(e){let{inputs:t,backend:n}=e,{starts:r,limits:i,deltas:a}=t,o=n.data.get(r.dataId).values,s=n.data.get(i.dataId).values,c=n.data.get(a.dataId).values,[l,u]=fk(o,r.shape,r.dtype,s,i.shape,c,a.shape);return[n.makeTensorInfo([l.length],`int32`,l),n.makeTensorInfo([u.length],r.dtype,u)]}var nP={kernelName:Wn,backendName:`cpu`,kernelFunc:tP};J();function rP(e){let{inputs:t,backend:n,attrs:r}=e,{shape:i,values:a,defaultValue:o,rowPartitionTensors:s}=t,{rowPartitionTypes:c}=r,l=n.data.get(i.dataId).values,u=n.data.get(a.dataId).values,d=n.data.get(o.dataId).values,f=s.map(e=>n.data.get(e.dataId).values),p=s.map(e=>e.shape),[m,h]=_k(l,i.shape,u,a.shape,a.dtype,d,o.shape,f,p,c);return n.makeTensorInfo(m,a.dtype,h)}var iP={kernelName:Gn,backendName:`cpu`,kernelFunc:rP};J();function aP(e){let{backend:t,attrs:n}=e,{start:r,stop:i,dtype:a,step:o}=n,s=vk(r,i,o,a);return t.makeTensorInfo([s.length],a,s)}var oP={kernelName:Kn,backendName:`cpu`,kernelFunc:aP};J();var sP=XD(Jn,e=>1/e),cP={kernelName:Jn,backendName:`cpu`,kernelFunc:sP};J();function lP(e){let{inputs:t,backend:n,attrs:r}=e,{images:i}=t,{alignCorners:a,halfPixelCenters:o,size:s}=r;Y(i,`resizeBilinear`);let c=j(i.shape),[l,u]=s,[d,f,p,m]=i.shape,h=n.data.get(i.dataId).values,g=new Float32Array(O([d,l,u,m])),_=[a&&l>1?f-1:f,a&&u>1?p-1:p],v=[a&&l>1?l-1:l,a&&u>1?u-1:u],y=0,b=_[0]/v[0],x=_[1]/v[1];for(let e=0;e<d;e++)for(let t=0;t<l;t++){let n;n=o?b*(t+.5)-.5:b*t;let r=Math.max(0,Math.floor(n)),i=n-r,a=Math.min(f-1,Math.ceil(n)),s=e*c[0]+r*c[1],l=e*c[0]+a*c[1];for(let e=0;e<u;e++){let t;t=o?x*(e+.5)-.5:x*e;let n=Math.max(0,Math.floor(t)),r=t-n,a=Math.min(p-1,Math.ceil(t)),u=s+n*c[2],d=l+n*c[2],f=s+a*c[2],_=l+a*c[2];for(let e=0;e<m;e++){let t=h[u+e],n=h[d+e],a=h[f+e],o=h[_+e],s=t+(a-t)*r,c=s+(n+(o-n)*r-s)*i;g[y++]=c}}}return n.makeTensorInfo([d,l,u,m],`float32`,g)}var uP={kernelName:$n,backendName:`cpu`,kernelFunc:lP};J();function dP(e){let{inputs:t,backend:n,attrs:r}=e,{images:i,dy:a}=t,{alignCorners:o}=r;Y([a,i],`resizeBilinearGrad`);let s=j(i.shape),[c,l,u,d]=i.shape,[,f,p]=a.shape,m=new Float32Array(c*l*u*d),h=[o&&f>1?l-1:l,o&&p>1?u-1:u],g=[o&&f>1?f-1:f,o&&p>1?p-1:p],_=h[0]/g[0],v=h[1]/g[1],y=n.data.get(a.dataId).values,b=0;for(let e=0;e<c;e++){let t=e*s[0];for(let e=0;e<f;e++){let n=e*_,r=Math.floor(n),i=Math.min(Math.ceil(n),l-1),a=t+r*s[1],o=t+i*s[1],c=n-r,f=1-c;for(let e=0;e<p;e++){let t=e*v,n=Math.floor(t),r=Math.min(Math.ceil(t),u-1),i=t-n,l=1-i,p=a+n*s[2],h=a+r*s[2],g=o+n*s[2],_=o+r*s[2],x=f*l,S=f*i,C=c*l,w=c*i;for(let e=0;e<d;e++){let t=y[b++];m[p+e]+=t*x,m[h+e]+=t*S,m[g+e]+=t*C,m[_+e]+=t*w}}}}return n.makeTensorInfo([c,u,l,d],`float32`,m)}var fP={kernelName:er,backendName:`cpu`,kernelFunc:dP};J();function pP(e){let{inputs:t,backend:n,attrs:r}=e,{images:i}=t,{alignCorners:a,halfPixelCenters:o,size:s}=r;Y(i,`resizeNearestNeighbor`);let c=j(i.shape),[l,u]=s,[d,f,p,m]=i.shape,h=n.data.get(i.dataId).values,g=new Float32Array(d*l*u*m),_=[a&&l>1?f-1:f,a&&u>1?p-1:p],v=[a&&l>1?l-1:l,a&&u>1?u-1:u],y=_[0]/v[0],b=_[1]/v[1],x=0;for(let e=0;e<d;e++){let t=e*c[0];for(let e=0;e<l;e++){let n=o?y*(e+.5):y*e,r=Math.min(f-1,a?Math.round(n):Math.floor(n));o&&(r=Math.max(0,r));let i=t+r*c[1];for(let e=0;e<u;e++){let t=o?b*(e+.5):b*e,n=Math.min(p-1,a?Math.round(t):Math.floor(t));o&&(n=Math.max(0,n));let r=i+n*c[2];for(let e=0;e<m;e++){let t=h[r+e];g[x++]=t}}}}return n.makeTensorInfo([d,l,u,m],i.dtype,g)}var mP={kernelName:Zn,backendName:`cpu`,kernelFunc:pP};J();function hP(e){let{inputs:t,backend:n,attrs:r}=e,{images:i,dy:a}=t,{alignCorners:o}=r;Y([a,i],`resizeNearestNeighborGrad`);let s=j(i.shape),c=j(a.shape),[l,u,d,f]=i.shape,[,p,m]=a.shape,h=new Float32Array(l*u*d*f),g=n.data.get(a.dataId).values,_=[o&&p>1?u-1:u,o&&m>1?d-1:d],v=[o&&p>1?p-1:p,o&&m>1?m-1:m],y=_[0]/v[0],b=_[1]/v[1],x=1/y,S=1/b,C=Math.ceil(x)*2+2,w=Math.ceil(S)*2+2;for(let e=0;e<l;e++){let t=e*s[0];for(let e=0;e<u;e++){let n=t+e*s[1],r=Math.floor(e*x),i=Math.floor(r-C/2);for(let r=0;r<d;r++){let a=n+r*s[2],l=Math.floor(r*S),_=Math.floor(l-w/2);for(let n=0;n<f;n++){let s=0;for(let a=0;a<C;a++){let l=a+i;if(l<0||l>=p)continue;let f=t+l*c[1],h=l*y,v=Math.min(u-1,o?Math.round(h):Math.floor(h));if(e===v)for(let e=0;e<w;e++){let t=e+_;if(t<0||t>=m)continue;let i=f+t*c[2],a=t*b,l=Math.min(d-1,o?Math.round(a):Math.floor(a));r===l&&(s+=g[i+n])}}h[a+n]=s}}}}return n.makeTensorInfo(i.shape,i.dtype,h)}var gP={kernelName:Qn,backendName:`cpu`,kernelFunc:hP};J();function _P(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{dims:a}=r;Y(i,`reverse`);let o=i.shape.length,s=A(a,i.shape);if(o===0)return MD({inputs:{x:i},backend:n});let c=new oa(i.shape,i.dtype),l=n.bufferSync(i);for(let e=0;e<c.size;e++){let t=c.indexToLoc(e),n=t.slice();s.forEach(e=>n[e]=i.shape[e]-1-n[e]),c.set(l.get(...n),...t)}return n.makeTensorInfo(c.shape,c.dtype,c.values)}var vP={kernelName:nr,backendName:`cpu`,kernelFunc:_P};J();var yP={kernelName:Ur,backendName:`cpu`,kernelFunc:({inputs:e,attrs:t,backend:n})=>{let{image:r}=e,{radians:i,fillValue:a,center:o}=t,s=n,c=de(r.dtype,O(r.shape)),[l,u,d,f]=r.shape,[p,m]=uE(o,u,d),h=Math.sin(i),g=Math.cos(i),_=s.data.get(r.dataId).values;for(let e=0;e<l;e++){let t=e*d*u*f;for(let e=0;e<u;e++){let n=d*f*e;for(let r=0;r<d;r++){let i=r*f;for(let o=0;o<f;o++){let s=[l,e,r,o],v=s[2],y=s[1],b=(v-p)*g-(y-m)*h,x=(v-p)*h+(y-m)*g;b=Math.round(b+p),x=Math.round(x+m);let S=a;if(typeof a!=`number`&&(S=o===3?255:a[o]),b>=0&&b<d&&x>=0&&x<u){let e=d*f*x,n=b*f;S=_[t+e+n+o]}let C=t+n+i+o;c[C]=S}}}}return{dataId:s.write(c,r.shape,r.dtype),shape:r.shape,dtype:r.dtype}}};J();var bP=XD(rr,e=>{let t=Math.floor(e);return e-t<.5?Math.floor(e):e-t>.5?Math.ceil(e):t%2==0?t:t+1}),xP={kernelName:rr,backendName:`cpu`,kernelFunc:bP};J();function SP(e){let{inputs:t,backend:n,attrs:r}=e,{indices:i,updates:a}=t,{shape:o}=r,{sliceRank:s,numUpdates:c,sliceSize:l,strides:u,outputSize:d}=Oy(a,i,o),f=Sk(n.bufferSync(i),n.bufferSync(a),o,d,l,c,s,u,0,!0);return n.makeTensorInfo(o,f.dtype,f.values)}var CP={kernelName:ar,backendName:`cpu`,kernelFunc:SP};J();function wP(e,t){let n=0,r=e.length,i=0;for(;n<r;)i=Math.floor((n+r)/2),e[i]<t?n=i+1:r=i;return r}function TP(e,t){let n=0,r=e.length,i=0;for(;n<r;)i=Math.floor((n+r)/2),e[i]<=t?n=i+1:r=i;return r}function EP(e,t,n,r,i,a){let o=fe(`int32`,n*i);for(let s=0;s<n;++s){let n=e.slice(s*r,(s+1)*r),c=s*i;for(let e=0;e<i;++e)o[c+e]=a===`left`?wP(n,t[e+c]):TP(n,t[e+c])}return o}J();function DP(e){let{inputs:t,backend:n,attrs:r}=e,{sortedSequence:i,values:a}=t,{side:o}=r,s=n.data.get(i.dataId).values,c=n.data.get(a.dataId).values,l=EP(s,c,i.shape[0],i.shape[1],a.shape[1],o);return n.makeTensorInfo(a.shape,`int32`,l)}var OP={kernelName:sr,backendName:`cpu`,kernelFunc:DP};J();function kP(e){let{inputs:t,backend:n}=e,{condition:r,t:i,e:a}=t;Y([r,i,a],`select`);let o=r.shape.length,s=n.data.get(r.dataId).values,c=n.data.get(i.dataId).values,l=n.data.get(a.dataId).values,u=fa(i.dtype,a.dtype),d=Oe(O(i.shape),u),f=0,p=o===0||o>1||i.shape.length===1?1:O(i.shape.slice(1));for(let e=0;e<s.length;e++)for(let t=0;t<p;t++)s[e]===1?d[f++]=c[e]:d[f++]=l[e];return n.makeTensorInfo(i.shape,u,d)}var AP={kernelName:cr,backendName:`cpu`,kernelFunc:kP};J();var jP=vE,MP=yE,NP=XD(lr,e=>e>=0?MP*e:jP*(Math.exp(e)-1)),PP={kernelName:lr,backendName:`cpu`,kernelFunc:NP};J();var FP=XD(fr,e=>e<0?-1:+(e>0)),IP={kernelName:fr,backendName:`cpu`,kernelFunc:FP};J();var LP={kernelName:`Sin`,backendName:`cpu`,kernelFunc:XD(`Sin`,e=>Math.sin(e))};J();var RP=XD(dr,e=>Math.sinh(e)),zP={kernelName:dr,backendName:`cpu`,kernelFunc:RP};J();var BP=Math.log(1.1920928955078125e-7)+2,VP=XD(mr,e=>{let t=e>-BP,n=e<BP,r=Math.exp(e),i;return i=n?r:t?e:Math.log(1+r),i}),HP={kernelName:mr,backendName:`cpu`,kernelFunc:VP};J();function UP(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{blockShape:a,paddings:o}=r;Y([i],`spaceToBatchND`);let s=O(a),c=[[0,0]];c.push(...o);for(let e=1+a.length;e<i.shape.length;++e)c.push([0,0]);let l=ZN.kernelFunc({inputs:{x:i},backend:n,attrs:{paddings:c,constantValue:0}}),u=fE(l.shape,a,s,!1),d=pE(u.length,a.length,!1),f=mE(l.shape,a,s,!1),p=mA({inputs:{x:l},backend:n,attrs:{shape:u}}),m=QO({inputs:{x:p},backend:n,attrs:{perm:d}}),h=mA({inputs:{x:m},backend:n,attrs:{shape:f}});return n.disposeIntermediateTensorInfo(l),n.disposeIntermediateTensorInfo(p),n.disposeIntermediateTensorInfo(m),h}var WP={kernelName:gr,backendName:`cpu`,kernelFunc:UP};J();function GP(e){let{inputs:t,backend:n}=e,{indices:r,values:i,denseShape:a,defaultValue:o}=t;if(a.shape.length!==1)throw Error(`Dense shape must be a vector, saw:
        ${a.shape}`);if(r.shape.length!==2)throw Error(`Indices must be a matrix, saw:
        ${r.shape}`);if(i.shape.length!==1)throw Error(`Values must be a vector, saw:
        ${i.shape}`);if(o.shape.length!==0)throw Error(`Default value must be a scalar, saw:
        ${o.shape}`);let s=n.data.get(r.dataId).values,c=n.data.get(i.dataId).values,l=n.data.get(a.dataId).values,u=n.data.get(o.dataId).values[0],[d,f,p,m,h]=kk(s,r.shape,r.dtype,c,i.dtype,l,u);return[n.makeTensorInfo(f,r.dtype,d),n.makeTensorInfo([f[0]],i.dtype,p),n.makeTensorInfo([m.length],`bool`,new Uint8Array(m.map(e=>Number(e)))),n.makeTensorInfo([h.length],r.dtype,new Int32Array(h))]}var KP={kernelName:yr,backendName:`cpu`,kernelFunc:GP};J();function qP(e){let{inputs:t,backend:n}=e,{inputIndices:r,inputShape:i,newShape:a}=t;if(r.shape.length!==2)throw Error(`Input indices should be a matrix but received shape
        ${r.shape}`);if(i.shape.length!==1)throw Error(`Input shape should be a vector but received shape
        ${i.shape}`);if(a.shape.length!==1)throw Error(`Target shape should be a vector but received shape ${a.shape}`);let o=Array.from(n.data.get(i.dataId).values),s=n.data.get(r.dataId).values,c=Array.from(n.data.get(a.dataId).values),[l,u,d]=Ak(s,r.shape,r.dtype,o,c);return[n.makeTensorInfo(u,r.dtype,l),n.makeTensorInfo([d.length],a.dtype,new Int32Array(d))]}var JP={kernelName:br,backendName:`cpu`,kernelFunc:qP};J();function YP(e){let{inputs:t,backend:n}=e,{data:r,indices:i,segmentIds:a}=t;if(r.shape.length<1)throw Error(`Data should be at least 1 dimensional but received scalar`);if(i.shape.length!==1)throw Error(`Indices should be a vector but received shape
          ${i.shape}`);if(a.shape.length!==1)throw Error(`Segment ids should be a vector but received shape
          ${a.shape}`);if(i.shape[0]!==a.shape[0])throw Error(`segmentIds and indices should have same size.`);let o=n.data.get(r.dataId).values,s=n.data.get(i.dataId).values,c=n.data.get(a.dataId).values,[l,u]=jk(o,r.shape,r.dtype,s,c,!0);return n.makeTensorInfo(u,r.dtype,l)}var XP={kernelName:xr,backendName:`cpu`,kernelFunc:YP};J();function ZP(e){let{inputs:t,backend:n}=e,{data:r,indices:i,segmentIds:a}=t;if(r.shape.length<1)throw Error(`Data should be at least 1 dimensional but received scalar`);if(i.shape.length!==1)throw Error(`Indices should be a vector but received shape
         ${i.shape}`);if(a.shape.length!==1)throw Error(`Segment ids should be a vector but received shape
         ${a.shape}`);if(i.shape[0]!==a.shape[0])throw Error(`segmentIds and indices should have same size.`);let o=n.data.get(r.dataId).values,s=n.data.get(i.dataId).values,c=n.data.get(a.dataId).values,[l,u]=jk(o,r.shape,r.dtype,s,c);return n.makeTensorInfo(u,r.dtype,l)}var QP={kernelName:Sr,backendName:`cpu`,kernelFunc:ZP};J();function $P(e){let{inputs:t,backend:n,attrs:r}=e,{sparseIndices:i,sparseValues:a,defaultValue:o}=t,{outputShape:s}=r,{sliceRank:c,numUpdates:l,sliceSize:u,strides:d,outputSize:f}=Oy(a,i,s),p=n.bufferSync(i),m;switch(a.dtype){case`bool`:m=Sk(p,n.bufferSync(a),s,f,u,l,c,d,!!n.data.get(o.dataId).values[0],!1);break;case`float32`:{let e=n.bufferSync(a),t=n.data.get(o.dataId).values[0];m=Sk(p,e,s,f,u,l,c,d,t,!1);break}case`int32`:{let e=n.bufferSync(a),t=n.data.get(o.dataId).values[0];m=Sk(p,e,s,f,u,l,c,d,t,!1);break}case`string`:m=Sk(p,n.bufferSync(a),s,f,u,l,c,d,Li(n.data.get(o.dataId).values[0]),!1);break;default:throw Error(`Unsupported type ${a.dtype}`)}return n.makeTensorInfo(s,m.dtype,m.values)}var eF={kernelName:Cr,backendName:`cpu`,kernelFunc:$P};J();function tF(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{numOrSizeSplits:a,axis:o}=r,s=A(o,i.shape)[0],c=JE(i,a,s),l=Array(i.shape.length).fill(0),u=i.shape.slice();return c.map(e=>{let t=[...u];t[s]=e;let r=Dk({inputs:{x:i},backend:n,attrs:{begin:l,size:t}});return l[s]+=e,r})}var nF={kernelName:_r,backendName:`cpu`,kernelFunc:tF};J();var rF={kernelName:Tr,backendName:`cpu`,kernelFunc:({inputs:e,backend:t})=>{let{x:n}=e,r=t;Y(n,`square`);let i=r.data.get(n.dataId).values,a=new Float32Array(i.length);for(let e=0;e<i.length;++e){let t=i[e];a[e]=t*t}return{dataId:r.write(a,n.shape,n.dtype),shape:n.shape,dtype:n.dtype}}};J();var iF=XD(Vr,(e,t)=>isNaN(e)?NaN:e>0?1:t.alpha),aF={kernelName:Vr,backendName:`cpu`,kernelFunc:iF};J();function oF(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{begin:a,end:o,strides:s,beginMask:c,endMask:l,ellipsisMask:u,newAxisMask:d,shrinkAxisMask:f}=r;Y(i,`stridedSlice`);let{finalShapeSparse:p,finalShape:m,isIdentity:h,sliceDim0:g,isSimpleSlice:_,begin:v,end:y,strides:b}=LT(i.shape,a,o,s,c,l,u,d,f),x;if(h)x=mA({inputs:{x:i},backend:n,attrs:{shape:m}});else if(g||_){E(i.shape.length>=1,()=>`Input must have rank at least 1, got: ${i.shape.length}`);let e=wT(v,y,b),t=Dk({inputs:{x:i},backend:n,attrs:{begin:v,size:e}});x=mA({inputs:{x:t},backend:n,attrs:{shape:m}}),n.disposeIntermediateTensorInfo(t)}else{let e=Vk(p,n.bufferSync(i),b,v);x=n.makeTensorInfo(m,e.dtype,e.values)}return x}var sF={kernelName:Dr,backendName:`cpu`,kernelFunc:oF};J();function cF(e){let{inputs:t,backend:n,attrs:r}=e,{separator:i,nGramWidths:a,leftPad:o,rightPad:s,padWidth:c,preserveShortSequences:l}=r,{data:u,dataSplits:d}=t,f=n.data.get(u.dataId).values,p=n.data.get(d.dataId).values,[m,h]=Uk(f,p,i,a,o,s,c,l);return[n.makeTensorInfo([m.length],`string`,m),n.makeTensorInfo(d.shape,`int32`,h)]}var lF={kernelName:Or,backendName:`cpu`,kernelFunc:cF};J();function uF(e){let{inputs:t,backend:n,attrs:r}=e,{skipEmpty:i}=r,{input:a,delimiter:o}=t;if(a.dtype!==`string`)throw Error(`Input must be of datatype string`);if(a.shape.length!==1)throw Error(`Input must be a vector, got shape: ${a.shape}`);if(o.shape.length!==0)throw Error(`Delimiter must be a scalar, got shape: ${o.shape}`);let s=n.data.get(a.dataId).values,c=n.data.get(o.dataId).values[0],[l,u,d]=Gk(s,c,i),f=u.length;return[n.makeTensorInfo([f,2],`int32`,l),n.makeTensorInfo([f],`string`,u),n.makeTensorInfo([2],`int32`,new Int32Array(d))]}var dF={kernelName:kr,backendName:`cpu`,kernelFunc:uF};J();function fF(e){let{inputs:t,backend:n,attrs:r}=e,{numBuckets:i}=r,{input:a}=t;if(a.dtype!==`string`)throw Error(`Input must be of datatype string`);if(i<=0)throw Error(`Number of buckets must be at least 1`);let o=n.data.get(a.dataId).values,s=Kk(o,i);return n.makeTensorInfo(a.shape,`int32`,s)}var pF={kernelName:Ar,backendName:`cpu`,kernelFunc:fF};J();var mF={kernelName:`Tan`,backendName:`cpu`,kernelFunc:XD(`Tan`,e=>Math.tan(e))};J();var hF=XD(jr,e=>Math.tanh(e)),gF={kernelName:jr,backendName:`cpu`,kernelFunc:hF};J();function _F(e){let{inputs:t,backend:n}=e,{tensor:r,indices:i,updates:a}=t,{sliceRank:o,numUpdates:s,sliceSize:c,strides:l,outputSize:u}=Oy(a,i,r.shape),d=n.bufferSync(i),f=n.bufferSync(a),p=n.bufferSync(r),m=Sk(d,f,r.shape,u,c,s,o,l,p,!1);return n.makeTensorInfo(r.shape,m.dtype,m.values)}var vF={kernelName:or,backendName:`cpu`,kernelFunc:_F};J();function yF(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{reps:a}=r;Y(i,`tile`);let o=Xk(n.bufferSync(i),a);return n.makeTensorInfo(o.shape,o.dtype,o.values)}var bF={kernelName:Mr,backendName:`cpu`,kernelFunc:yF};J();function xF(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{k:a,sorted:o}=r;Y(i,`topk`);let s=n.data.get(i.dataId).values,[c,l]=$k(s,i.shape,i.dtype,a,o);return[n.makeTensorInfo(c.shape,c.dtype,c.values),n.makeTensorInfo(l.shape,l.dtype,l.values)]}var SF={kernelName:Nr,backendName:`cpu`,kernelFunc:xF};J();function CF(e){let{inputs:t,attrs:n,backend:r}=e,{image:i,transforms:a}=t,{interpolation:o,fillMode:s,fillValue:c,outputShape:l}=n,[u,d,f,p]=i.shape,[m,h]=l??[d,f],g=[u,m,h,p],_=j(i.shape),v=_[0],y=_[1],b=_[2],x=j(g),S=x[0],C=x[1],w=x[2],T=de(i.dtype,O(g));T.fill(c);let E=r.data.get(i.dataId).values,D=r.data.get(a.dataId).values;for(let e=0;e<u;++e){let t=a.shape[0]===1?D:D.subarray(e*8,e*8+8);for(let n=0;n<m;++n)for(let r=0;r<h;++r)for(let i=0;i<p;++i){let a,l=t[6]*r+t[7]*n+1;if(l===0)continue;let u=(t[0]*r+t[1]*n+t[2])/l,p=(t[3]*r+t[4]*n+t[5])/l,m=TF(u,f,s),h=TF(p,d,s);switch(o){case`nearest`:a=jF(E,d,f,v,y,b,e,h,m,i,c);break;case`bilinear`:a=MF(E,d,f,v,y,b,e,h,m,i,c);break;default:throw Error(`Error in Transform: Expect 'nearest' or 'bilinear', but got ${o}`)}let g=e*S+n*C+r*w+i;T[g]=a}return r.makeTensorInfo(g,i.dtype,T)}return{dataId:r.write(T,g,i.dtype),shape:i.shape,dtype:i.dtype}}var wF={kernelName:Pr,backendName:`cpu`,kernelFunc:CF};function TF(e,t,n){switch(n){case`reflect`:return EF(e,t);case`wrap`:return DF(e,t);case`nearest`:return kF(e,t);default:return OF(e,t)}}function EF(e,t){let n=e;if(n<0)if(t<=1)n=0;else{let e=2*t;n<e&&(n=e*Math.trunc(-n/e)+n),n=n<-t?n+e:-n-1}else if(n>t-1)if(t<=1)n=0;else{let e=2*t;n-=e*Math.trunc(n/e),n>=t&&(n=e-n-1)}return b(0,n,t-1)}function DF(e,t){let n=e;if(n<0)if(t<=1)n=0;else{let e=t-1;n+=t*(Math.trunc(-n/e)+1)}else if(n>t-1)if(t<=1)n=0;else{let e=t-1;n-=t*Math.trunc(n/e)}return b(0,n,t-1)}function OF(e,t){return e}function kF(e,t){return b(0,e,t-1)}function AF(e,t,n,r,i,a,o,s,c,l,u){let d=o*r+s*i+c*a+l;return 0<=s&&s<t&&0<=c&&c<n?e[d]:u}function jF(e,t,n,r,i,a,o,s,c,l,u){return AF(e,t,n,r,i,a,o,Math.round(s),Math.round(c),l,u)}function MF(e,t,n,r,i,a,o,s,c,l,u){let d=Math.floor(s),f=Math.floor(c),p=d+1,m=f+1,h=(m-c)*AF(e,t,n,r,i,a,o,d,f,l,u)+(c-f)*AF(e,t,n,r,i,a,o,d,m,l,u),g=(m-c)*AF(e,t,n,r,i,a,o,p,f,l,u)+(c-f)*AF(e,t,n,r,i,a,o,p,m,l,u);return(p-s)*h+(s-d)*g}J();function NF(e){let{inputs:t,attrs:n,backend:r}=e,{axis:i}=n,{x:a}=t;Y(a,`unique`);let o=r.data.get(a.dataId).values,{outputValues:s,outputShape:c,indices:l}=eA(o,i,a.shape,a.dtype);return[r.makeTensorInfo(c,a.dtype,s),r.makeTensorInfo([l.length],`int32`,l)]}var PF={kernelName:Ir,backendName:`cpu`,kernelFunc:NF};J();function FF(e){let{inputs:t,backend:n,attrs:r}=e,{value:i}=t,{axis:a}=r;a<0&&(a+=i.shape.length);let o=i.shape.length,s=i.shape[a],c=Array(o-1),l=0;for(let e=0;e<o;e++)e!==a&&(c[l++]=i.shape[e]);let u=Array(o).fill(0),d=i.shape.slice();d[a]=1;let f=Array(s);for(let e=0;e<f.length;e++){u[a]=e;let t=Dk({inputs:{x:i},backend:n,attrs:{begin:u,size:d}});f[e]=mA({inputs:{x:t},backend:n,attrs:{shape:c}}),n.disposeIntermediateTensorInfo(t)}return f}var IF={kernelName:Lr,backendName:`cpu`,kernelFunc:FF};J();function LF(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,segmentIds:a}=t,{numSegments:o}=r;Y(i,`unsortedSegmentSum`);let s=i.shape.length,c=a.shape.length,l=[],u=[],d=s-c,f=a;for(let e=0;e<d;++e){let t=hM({inputs:{input:f},backend:n,attrs:{dim:e+1}});f=t,u.push(t)}for(let e=0;e<o;++e){let t=ji(e,`int32`),r=n.makeTensorInfo([],`int32`,t),a=rO({inputs:{a:r,b:f},backend:n}),o=LD({inputs:{x:a},backend:n,attrs:{dtype:`float32`}}),s=UO({inputs:{a:o,b:i},backend:n}),c=nM({inputs:{x:s},backend:n,attrs:{axis:0,keepDims:!1}});l.push(c),u.push(r),u.push(a),u.push(o),u.push(s),u.push(c)}let p=JN({inputs:l,backend:n,attrs:{axis:0}});return u.forEach(e=>n.disposeIntermediateTensorInfo(e)),p}var RF={kernelName:Rr,backendName:`cpu`,kernelFunc:LF};J();var zF=[yA,DD,xA,CA,UD,TA,DA,kA,jA,NA,FA,LA,zA,HA,WA,XA,QA,ej,nj,_A,ij,oj,cj,JD,uj,RD,eO,fj,AD,pj,_j,yj,xj,Cj,Tj,Dj,kj,Aj,Mj,Pj,Ij,Rj,Bj,Hj,Wj,Kj,Jj,Xj,Zj,Qj,$j,tM,aM,rA,sM,iO,mM,sO,gM,uO,EM,OM,AM,pO,gO,MM,PM,IM,RM,xO,wO,ND,BM,hj,HM,WM,KM,aA,DO,AO,JM,NO,XM,$M,tN,iN,oN,cN,uN,LO,fN,mN,gN,vN,bN,SN,wN,BO,EN,DN,MN,WO,qO,FN,RN,VN,XO,UN,qN,YN,ZN,QN,cA,nk,eP,nP,iP,oP,FD,yM,cP,uA,fA,hA,uP,fP,mP,gP,vP,yP,xP,xk,CP,OP,AP,PP,Tk,IP,LP,zP,Ok,kN,HP,WP,KP,JP,XP,QP,eF,nF,Pk,rF,Lk,Bk,aF,sF,lF,dF,pF,Yk,rM,mF,gF,vF,bF,SF,wF,$O,PF,IF,RF,GN];for(let e of zF)$r(e);J();var BF={},VF={alpha:!1,antialias:!1,premultipliedAlpha:!1,preserveDrawingBuffer:!1,depth:!1,stencil:!1,failIfMajorPerformanceCaveat:!0};function HF(e,t){BF[e]=t}function UF(e,t){if(!(e in BF)||t!=null){let n=GF(e,t);if(n!==null)BF[e]=n;else return console.log(`Could not get context for WebGL version`,e),null}let n=BF[e];return n==null||n.isContextLost()?(delete BF[e],UF(e)):(n.disable(n.DEPTH_TEST),n.disable(n.STENCIL_TEST),n.disable(n.BLEND),n.disable(n.DITHER),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SAMPLE_COVERAGE),n.enable(n.SCISSOR_TEST),n.enable(n.CULL_FACE),n.cullFace(n.BACK),BF[e])}function WF(e){if(!M().getBool(`IS_SAFARI`)&&typeof OffscreenCanvas<`u`&&e===2)return new OffscreenCanvas(300,150);if(typeof document<`u`)return document.createElement(`canvas`);throw Error(`Cannot create a canvas in this context`)}function GF(e,t){if(e!==1&&e!==2)throw Error(`Cannot get WebGL rendering context, WebGL is disabled.`);let n=t??WF(e);return n.addEventListener(`webglcontextlost`,t=>{t.preventDefault(),delete BF[e]},!1),M().getBool(`SOFTWARE_WEBGL_ENABLED`)&&(VF.failIfMajorPerformanceCaveat=!1),e===1?n.getContext(`webgl`,VF)||n.getContext(`experimental-webgl`,VF):n.getContext(`webgl2`,VF)}J();var KF;(function(e){e[e.DENSE=0]=`DENSE`,e[e.SHARED_BATCH=1]=`SHARED_BATCH`})(KF||={});var qF;(function(e){e[e.RENDER=0]=`RENDER`,e[e.UPLOAD=1]=`UPLOAD`,e[e.PIXELS=2]=`PIXELS`,e[e.DOWNLOAD=3]=`DOWNLOAD`})(qF||={});var JF;(function(e){e[e.UNPACKED_FLOAT16=0]=`UNPACKED_FLOAT16`,e[e.UNPACKED_FLOAT32=1]=`UNPACKED_FLOAT32`,e[e.PACKED_4X1_UNSIGNED_BYTE=2]=`PACKED_4X1_UNSIGNED_BYTE`,e[e.PACKED_2X2_FLOAT32=3]=`PACKED_2X2_FLOAT32`,e[e.PACKED_2X2_FLOAT16=4]=`PACKED_2X2_FLOAT16`})(JF||={});function YF(e,t){return[t,e]}function XF(e,t){return e*t}function ZF(e){let t=O(e);return ae(Math.ceil(t/4))}function QF(e,t){return[Math.max(1,Math.ceil(t/2)),Math.max(1,Math.ceil(e/2))]}function $F(e,t){let[n,r]=QF(e,t);return n*r*4}function eI(e,t){let n=e,r,i,a,o,s,c,l,u,d,f;return M().getNumber(`WEBGL_VERSION`)===2?(r=n.R32F,i=n.R16F,a=n.RGBA16F,o=n.RGBA32F,s=n.RED,l=4,u=1,d=n.HALF_FLOAT,f=n.FLOAT,c=n.RGBA8):(r=e.RGBA,i=e.RGBA,a=e.RGBA,o=n.RGBA,s=e.RGBA,l=4,u=4,d=t==null?null:t.HALF_FLOAT_OES,f=e.FLOAT,c=e.RGBA),{internalFormatFloat:r,internalFormatHalfFloat:i,internalFormatPackedHalfFloat:a,internalFormatPackedFloat:o,textureFormatFloat:s,downloadTextureFormat:c,downloadUnpackNumChannels:l,defaultNumChannels:u,textureTypeHalfFloat:d,textureTypeFloat:f}}J();function X(e,t){let n=t();return M().getBool(`DEBUG`)&&tI(e),n}function tI(e){let t=e.getError();if(t!==e.NO_ERROR)throw Error(`WebGL Error: `+aI(e,t))}var nI=5.96e-8,rI=65504;function iI(e){return!!(M().getBool(`WEBGL_RENDER_FLOAT32_ENABLED`)||e===0||nI<Math.abs(e)&&Math.abs(e)<rI)}function aI(e,t){switch(t){case e.NO_ERROR:return`NO_ERROR`;case e.INVALID_ENUM:return`INVALID_ENUM`;case e.INVALID_VALUE:return`INVALID_VALUE`;case e.INVALID_OPERATION:return`INVALID_OPERATION`;case e.INVALID_FRAMEBUFFER_OPERATION:return`INVALID_FRAMEBUFFER_OPERATION`;case e.OUT_OF_MEMORY:return`OUT_OF_MEMORY`;case e.CONTEXT_LOST_WEBGL:return`CONTEXT_LOST_WEBGL`;default:return`Unknown error code ${t}`}}function oI(e,t){return OI(e,()=>e.getExtension(t),`Extension "`+t+`" not supported on this browser.`)}function sI(e,t){let n=OI(e,()=>e.createShader(e.VERTEX_SHADER),`Unable to create vertex WebGLShader.`);if(X(e,()=>e.shaderSource(n,t)),X(e,()=>e.compileShader(n)),e.getShaderParameter(n,e.COMPILE_STATUS)===!1)throw console.log(e.getShaderInfoLog(n)),Error(`Failed to compile vertex shader.`);return n}function cI(e,t){let n=OI(e,()=>e.createShader(e.FRAGMENT_SHADER),`Unable to create fragment WebGLShader.`);if(X(e,()=>e.shaderSource(n,t)),X(e,()=>e.compileShader(n)),M().get(`ENGINE_COMPILE_ONLY`))return n;if(e.getShaderParameter(n,e.COMPILE_STATUS)===!1)throw uI(t,e.getShaderInfoLog(n)),Error(`Failed to compile fragment shader.`);return n}var lI=/ERROR: [0-9]+:([0-9]+):/g;function uI(e,t){let n=lI.exec(t);if(n==null){console.log(`Couldn't parse line number in error: ${t}`),console.log(e);return}let r=+n[1],i=e.split(`
`),a=i.length.toString().length+2,o=i.map((e,t)=>se((t+1).toString(),a)+e),s=0;for(let e=0;e<o.length;e++)s=Math.max(o[e].length,s);let c=o.slice(0,r-1),l=o.slice(r-1,r),u=o.slice(r);console.log(c.join(`
`)),console.log(t.split(`
`)[0]),console.log(`%c ${se(l[0],s)}`,`border:1px solid red; background-color:#e3d2d2; color:#a61717`),console.log(u.join(`
`))}function dI(e){return OI(e,()=>e.createProgram(),`Unable to create WebGLProgram.`)}function fI(e,t){if(X(e,()=>e.linkProgram(t)),!M().get(`ENGINE_COMPILE_ONLY`)&&e.getProgramParameter(t,e.LINK_STATUS)===!1)throw console.log(e.getProgramInfoLog(t)),Error(`Failed to link vertex and fragment shaders.`)}function pI(e,t){if(X(e,()=>e.validateProgram(t)),e.getProgramParameter(t,e.VALIDATE_STATUS)===!1)throw console.log(e.getProgramInfoLog(t)),Error(`Shader program validation failed.`)}function mI(e,t){let n=OI(e,()=>e.createBuffer(),`Unable to create WebGLBuffer`);return X(e,()=>e.bindBuffer(e.ARRAY_BUFFER,n)),X(e,()=>e.bufferData(e.ARRAY_BUFFER,t,e.STATIC_DRAW)),n}function hI(e,t){let n=OI(e,()=>e.createBuffer(),`Unable to create WebGLBuffer`);return X(e,()=>e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,n)),X(e,()=>e.bufferData(e.ELEMENT_ARRAY_BUFFER,t,e.STATIC_DRAW)),n}function gI(e){return OI(e,()=>e.createTexture(),`Unable to create WebGLTexture.`)}function _I(e,t){let n=M().getNumber(`WEBGL_MAX_TEXTURE_SIZE`);if(e<=0||t<=0){let n=`[${e}x${t}]`;throw Error(`Requested texture size `+n+` is invalid.`)}if(e>n||t>n){let r=`[${e}x${t}]`,i=`[${n}x${n}]`;throw Error(`Requested texture size `+r+` greater than WebGL maximum on this browser / GPU `+i+`.`)}}function vI(e){return OI(e,()=>e.createFramebuffer(),`Unable to create WebGLFramebuffer.`)}function yI(e,t,n,r,i,a,o){let s=e.getAttribLocation(t,n);return s===-1?!1:(X(e,()=>e.bindBuffer(e.ARRAY_BUFFER,r)),X(e,()=>e.vertexAttribPointer(s,i,e.FLOAT,!1,a,o)),X(e,()=>e.enableVertexAttribArray(s)),!0)}function bI(e,t,n){kI(e,n),X(e,()=>e.activeTexture(e.TEXTURE0+n)),X(e,()=>e.bindTexture(e.TEXTURE_2D,t))}function xI(e,t,n){return OI(e,()=>e.getUniformLocation(t,n),`uniform "`+n+`" not present in program.`)}function SI(e,t,n){return e.getUniformLocation(t,n)}function CI(e,t,n,r){X(e,()=>bI(e,t,r)),X(e,()=>e.uniform1i(n,r))}function wI(e,t,n){X(e,()=>e.bindFramebuffer(e.FRAMEBUFFER,n)),X(e,()=>e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0))}function TI(e,t){X(e,()=>e.bindFramebuffer(e.FRAMEBUFFER,t)),X(e,()=>e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,null,0))}function EI(e){let t=e.checkFramebufferStatus(e.FRAMEBUFFER);if(t!==e.FRAMEBUFFER_COMPLETE)throw Error(`Error binding framebuffer: `+DI(e,t))}function DI(e,t){switch(t){case e.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:return`FRAMEBUFFER_INCOMPLETE_ATTACHMENT`;case e.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:return`FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT`;case e.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:return`FRAMEBUFFER_INCOMPLETE_DIMENSIONS`;case e.FRAMEBUFFER_UNSUPPORTED:return`FRAMEBUFFER_UNSUPPORTED`;default:return`unknown error ${t}`}}function OI(e,t,n){let r=X(e,()=>t());if(r==null)throw Error(n);return r}function kI(e,t){let n=e.MAX_COMBINED_TEXTURE_IMAGE_UNITS-1,r=t+e.TEXTURE0;if(r<e.TEXTURE0||r>n){let e=`[gl.TEXTURE0, gl.TEXTURE${n}]`;throw Error(`textureUnit must be in ${e}.`)}}function AI(e,t=2){return O(e.slice(0,e.length-t))}function jI(e){if(e.length===0)throw Error(`Cannot get rows and columns of an empty shape array.`);return[e.length>1?e[e.length-2]:1,e[e.length-1]]}function MI(e){let t=[1,1,1];return e.length===0||e.length===1&&e[0]===1||(t=[AI(e),...jI(e)]),t}function NI(e,t=!1){let n=M().getNumber(`WEBGL_MAX_TEXTURE_SIZE`),r=M().getNumber(`WEBGL_MAX_SIZE_FOR_NARROW_TEXTURE`);r===1/0&&M().getBool(`WEBGL_AUTO_SQUARIFY_NARROW_TEXTURE_SHAPE`)&&(r=n/2),t&&(n*=2,r*=2,e=e.map((t,n)=>n>=e.length-2?x(e[n]):e[n]),e.length===1&&(e=[2,e[0]])),e.length!==2&&(e=ue(e).newShape);let i=O(e),a=null;e.length<=1&&i<=n?a=[1,i]:e.length===2&&e[0]<=n&&e[1]<=n?a=e:e.length===3&&e[0]*e[1]<=n&&e[2]<=n?a=[e[0]*e[1],e[2]]:e.length===3&&e[0]<=n&&e[1]*e[2]<=n?a=[e[0],e[1]*e[2]]:e.length===4&&e[0]*e[1]*e[2]<=n&&e[3]<=n?a=[e[0]*e[1]*e[2],e[3]]:e.length===4&&e[0]<=n&&e[1]*e[2]*e[3]<=n&&(a=[e[0],e[1]*e[2]*e[3]]);let o=a!=null&&Math.max(...a)>r&&Math.min(...a)<=(t?2:1)&&Math.min(...a)>0;if(a==null||o)if(t){let t=AI(e),n=2,r=2;e.length&&([n,r]=jI(e)),i=n/2*t*(r/2),a=ae(i).map(e=>e*2)}else a=ae(i);return a}function PI(e){return e%2==0}function FI(e,t){if(e=e.slice(-2),t=t.slice(-2),k(e,t)||!e.length||!t.length||e[0]===0||e[1]===0||t[0]===0||t[1]===0)return!0;if(e.length!==t.length){let n=e[e.length-1],r=t[t.length-1];if(n===r||PI(n)&&PI(r)&&(e[0]===1||t[0]===1))return!0}return e[1]===t[1]&&PI(e[0])&&PI(t[0])}var II,LI;function RI(e){if(II==null){let t=UF(e);II=t.getParameter(t.MAX_TEXTURE_SIZE)}return II}function zI(e){if(LI==null){let t=UF(e);LI=t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS)}return Math.min(16,LI)}function BI(e){if(e===0)return 0;let t,n=UF(e);return t=VI(n,`EXT_disjoint_timer_query_webgl2`)&&e===2?2:+!!VI(n,`EXT_disjoint_timer_query`),t}function VI(e,t){return e.getExtension(t)!=null}function HI(e){try{if(UF(e)!=null)return!0}catch(e){return console.log(`Error when getting WebGL context: `,e),!1}return!1}function UI(e){if(e===0)return!1;let t=UF(e);if(e===1){if(!VI(t,`OES_texture_float`))return!1}else if(!VI(t,`EXT_color_buffer_float`))return!1;return GI(t)}function WI(e){if(e===0)return!1;let t=UF(e);if(e===1){if(!VI(t,`OES_texture_float`)||!VI(t,`WEBGL_color_buffer_float`))return!1}else{if(VI(t,`EXT_color_buffer_float`))return GI(t);let e=`EXT_color_buffer_half_float`;return VI(t,e)?KI(t,t.getExtension(e)):!1}return GI(t)}function GI(e){let t=eI(e),n=e.createTexture();e.bindTexture(e.TEXTURE_2D,n),e.texImage2D(e.TEXTURE_2D,0,t.internalFormatFloat,1,1,0,t.textureFormatFloat,t.textureTypeFloat,null);let r=e.createFramebuffer();e.bindFramebuffer(e.FRAMEBUFFER,r),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,n,0);let i=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE;return e.bindTexture(e.TEXTURE_2D,null),e.bindFramebuffer(e.FRAMEBUFFER,null),e.deleteTexture(n),e.deleteFramebuffer(r),i}function KI(e,t){let n=eI(e,t),r=e.createTexture();e.bindTexture(e.TEXTURE_2D,r),e.texImage2D(e.TEXTURE_2D,0,n.internalFormatHalfFloat,1,1,0,n.textureFormatFloat,n.textureTypeHalfFloat,null);let i=e.createFramebuffer();e.bindFramebuffer(e.FRAMEBUFFER,i),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,r,0);let a=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE;return e.bindTexture(e.TEXTURE_2D,null),e.bindFramebuffer(e.FRAMEBUFFER,null),e.deleteTexture(r),e.deleteFramebuffer(i),a}function qI(e){return e===2?UF(e).fenceSync!=null:!1}function JI(e,t){Array.isArray(e)||(e=[e]),e.forEach(e=>{e!=null&&E(e.dtype!==`complex64`,()=>`${t} does not support complex64 tensors in the WebGL backend.`)})}J();var Z=M();Z.registerFlag(`HAS_WEBGL`,()=>Z.getNumber(`WEBGL_VERSION`)>0),Z.registerFlag(`WEBGL_VERSION`,()=>HI(2)?2:+!!HI(1)),Z.registerFlag(`WEBGL_CHECK_NUMERICAL_PROBLEMS`,()=>!1),Z.registerFlag(`WEBGL_BUFFER_SUPPORTED`,()=>Z.get(`WEBGL_VERSION`)===2),Z.registerFlag(`WEBGL_CPU_FORWARD`,()=>!0),Z.registerFlag(`WEBGL_FORCE_F16_TEXTURES`,()=>!1),Z.registerFlag(`WEBGL_PACK`,()=>Z.getBool(`HAS_WEBGL`)),Z.registerFlag(`WEBGL_PACK_NORMALIZATION`,()=>Z.getBool(`WEBGL_PACK`)),Z.registerFlag(`WEBGL_PACK_CLIP`,()=>Z.getBool(`WEBGL_PACK`)),Z.registerFlag(`WEBGL_PACK_DEPTHWISECONV`,()=>Z.getBool(`WEBGL_PACK`)),Z.registerFlag(`WEBGL_PACK_BINARY_OPERATIONS`,()=>Z.getBool(`WEBGL_PACK`)),Z.registerFlag(`WEBGL_PACK_UNARY_OPERATIONS`,()=>Z.getBool(`WEBGL_PACK`)),Z.registerFlag(`WEBGL_PACK_ARRAY_OPERATIONS`,()=>Z.getBool(`WEBGL_PACK`)),Z.registerFlag(`WEBGL_PACK_IMAGE_OPERATIONS`,()=>Z.getBool(`WEBGL_PACK`)),Z.registerFlag(`WEBGL_PACK_REDUCE`,()=>Z.getBool(`WEBGL_PACK`)),Z.registerFlag(`WEBGL_LAZILY_UNPACK`,()=>Z.getBool(`WEBGL_PACK`)),Z.registerFlag(`WEBGL_CONV_IM2COL`,()=>Z.getBool(`WEBGL_PACK`)),Z.registerFlag(`WEBGL_PACK_CONV2DTRANSPOSE`,()=>Z.getBool(`WEBGL_PACK`)),Z.registerFlag(`WEBGL_MAX_TEXTURE_SIZE`,()=>RI(Z.getNumber(`WEBGL_VERSION`))),Z.registerFlag(`WEBGL_MAX_TEXTURES_IN_SHADER`,()=>zI(Z.getNumber(`WEBGL_VERSION`))),Z.registerFlag(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`,()=>{let e=Z.getNumber(`WEBGL_VERSION`);return e===0?0:BI(e)}),Z.registerFlag(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE`,()=>Z.getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`)>0&&!Ba()),Z.registerFlag(`WEBGL_RENDER_FLOAT32_CAPABLE`,()=>UI(Z.getNumber(`WEBGL_VERSION`))),Z.registerFlag(`WEBGL_RENDER_FLOAT32_ENABLED`,()=>Z.getBool(`WEBGL_FORCE_F16_TEXTURES`)?!1:Z.getBool(`WEBGL_RENDER_FLOAT32_CAPABLE`)),Z.registerFlag(`WEBGL_DOWNLOAD_FLOAT_ENABLED`,()=>WI(Z.getNumber(`WEBGL_VERSION`))),Z.registerFlag(`WEBGL_FENCE_API_ENABLED`,()=>qI(Z.getNumber(`WEBGL_VERSION`))),Z.registerFlag(`WEBGL_SIZE_UPLOAD_UNIFORM`,()=>Z.getBool(`WEBGL_RENDER_FLOAT32_ENABLED`)?4:0),Z.registerFlag(`WEBGL_DELETE_TEXTURE_THRESHOLD`,()=>-1,e=>{if(typeof e!=`number`)throw Error(`WEBGL_DELETE_TEXTURE_THRESHOLD must be a number but got ${e}.`);if(e<0&&e!==-1)throw Error(`WEBGL_DELETE_TEXTURE_THRESHOLD must be -1 (indicating never delete) or at least 0, but got ${e}.`)}),Z.registerFlag(`WEBGL_FLUSH_THRESHOLD`,()=>Ba()?1:-1,e=>{if(typeof e!=`number`)throw Error(`WEBGL_FLUSH_THRESHOLD must be a number but got ${e}.`);if(e<0&&e!==-1)throw Error(`WEBGL_FLUSH_THRESHOLD must be -1 (indicating never manual flush) or at least 0, but got ${e}.`)}),Z.registerFlag(`CPU_HANDOFF_SIZE_THRESHOLD`,()=>128),Z.registerFlag(`WEBGL_USE_SHAPES_UNIFORMS`,()=>!1),Z.registerFlag(`TOPK_LAST_DIM_CPU_HANDOFF_SIZE_THRESHOLD`,()=>1e5),Z.registerFlag(`TOPK_K_CPU_HANDOFF_THRESHOLD`,()=>128),Z.registerFlag(`WEBGL_EXP_CONV`,()=>!1),Z.registerFlag(`SOFTWARE_WEBGL_ENABLED`,()=>Z.getBool(`IS_TEST`)),Z.registerFlag(`WEBGL_MAX_SIZE_FOR_NARROW_TEXTURE`,()=>1/0),Z.registerFlag(`WEBGL_AUTO_SQUARIFY_NARROW_TEXTURE_SHAPE`,()=>!1),Z.registerFlag(`WEBGL2_ISNAN_CUSTOM`,()=>!1),Z.registerFlag(`ENGINE_COMPILE_ONLY`,()=>!1),J();function YI(){let e,t,n,r,i,a,o,s,c,l;return M().getNumber(`WEBGL_VERSION`)===2?(e=`#version 300 es`,t=`in`,n=`out`,r=`in`,i=`texture`,a=`outputColor`,o=`out vec4 outputColor;`,s=M().getBool(`WEBGL2_ISNAN_CUSTOM`)?`
      bool isnan_custom(float val) {
        uint floatToUint = floatBitsToUint(val);
        return (floatToUint & 0x7fffffffu) > 0x7f800000u;
      }

      bvec4 isnan_custom(vec4 val) {
        return bvec4(isnan_custom(val.x),
          isnan_custom(val.y), isnan_custom(val.z), isnan_custom(val.w));
      }

      #define isnan(value) isnan_custom(value)
    `:``,c=``,l=`
      #define round(value) newRound(value)
      int newRound(float value) {
        return int(floor(value + 0.5));
      }

      ivec4 newRound(vec4 value) {
        return ivec4(floor(value + vec4(0.5)));
      }
    `):(e=``,t=`attribute`,n=`varying`,r=`varying`,i=`texture2D`,a=`gl_FragColor`,o=``,s=`
      #define isnan(value) isnan_custom(value)
      bool isnan_custom(float val) {
        return (val > 0. || val < 1. || val == 0.) ? false : true;
      }
      bvec4 isnan_custom(vec4 val) {
        return bvec4(isnan(val.x), isnan(val.y), isnan(val.z), isnan(val.w));
      }
    `,c=`
      uniform float INFINITY;

      bool isinf(float val) {
        return abs(val) == INFINITY;
      }
      bvec4 isinf(vec4 val) {
        return equal(abs(val), vec4(INFINITY));
      }
    `,l=`
      int round(float value) {
        return int(floor(value + 0.5));
      }

      ivec4 round(vec4 value) {
        return ivec4(floor(value + vec4(0.5)));
      }
    `),{version:e,attribute:t,varyingVs:n,varyingFs:r,texture2D:i,output:a,defineOutput:o,defineSpecialNaN:s,defineSpecialInf:c,defineRound:l}}J();function XI(e,t,n=`index`){let r=j(t);return r.map((t,i)=>`${`int ${e[i]} = ${n} / ${t}`}; ${i===r.length-1?`int ${e[i+1]} = ${n} - ${e[i]} * ${t}`:`index -= ${e[i]} * ${t}`};`).join(``)}function ZI(e,t,n=`index`){let r=j(t);return r.map((t,i)=>`${`int ${e[i]} = ${n} / outShapeStrides[${i}]`}; ${i===r.length-1?`int ${e[i+1]} = ${n} - ${e[i]} * outShapeStrides[${i}]`:`index -= ${e[i]} * outShapeStrides[${i}]`};`).join(``)}function QI(e,t){let n=e.length,r=e.map(e=>`${t}[${e}]`),i=Array(n-1);i[n-2]=r[n-1];for(let e=n-3;e>=0;--e)i[e]=`(${i[e+1]} * ${r[e+1]})`;return i}function $I(e,t,n=`index`){let r=QI(e.map((e,t)=>t),t);return r.map((t,i)=>`${`int ${e[i]} = ${n} / ${r[i]}`}; ${i===r.length-1?`int ${e[i+1]} = ${n} - ${e[i]} * ${r[i]}`:`index -= ${e[i]} * ${r[i]}`};`).join(``)}function eL(e){let t=j(e).map(e=>e.toString());return`
  int getFlatIndex(ivec3 coords) {
    return coords.x * ${t[0]} + coords.y * ${t[1]} + coords.z;
  }
`}function tL(){return`
  int getFlatIndex(ivec3 coords) {
    return coords.x * outShapeStrides[0] + coords.y * outShapeStrides[1] + coords.z;
  }
`}var nL=`
  const float FLOAT_MAX = 1.70141184e38;
  const float FLOAT_MIN = 1.17549435e-38;

  lowp vec4 encode_float(highp float v) {
    if (isnan(v)) {
      return vec4(255, 255, 255, 255);
    }

    highp float av = abs(v);

    if(av < FLOAT_MIN) {
      return vec4(0.0, 0.0, 0.0, 0.0);
    } else if(v > FLOAT_MAX) {
      return vec4(0.0, 0.0, 128.0, 127.0) / 255.0;
    } else if(v < -FLOAT_MAX) {
      return vec4(0.0, 0.0,  128.0, 255.0) / 255.0;
    }

    highp vec4 c = vec4(0,0,0,0);

    highp float e = floor(log2(av));
    highp float m = exp2(fract(log2(av))) - 1.0;

    c[2] = floor(128.0 * m);
    m -= c[2] / 128.0;
    c[1] = floor(32768.0 * m);
    m -= c[1] / 32768.0;
    c[0] = floor(8388608.0 * m);

    highp float ebias = e + 127.0;
    c[3] = floor(ebias / 2.0);
    ebias -= c[3] * 2.0;
    c[2] += floor(ebias) * 128.0;

    c[3] += 128.0 * step(0.0, -v);

    return c / 255.0;
  }
`;J();var{getBroadcastDims:rL}=gD;function iL(e,t,n){let r=[];if(e.forEach(e=>{let t=O(e.shapeInfo.logicalShape);if(e.shapeInfo.isUniform?r.push(`uniform float ${e.name}${t>1?`[${t}]`:``};`):(r.push(`uniform sampler2D ${e.name};`),r.push(`uniform int offset${e.name};`)),n.enableShapeUniforms){let{uniformShape:t}=KL(n.packedInputs,e.shapeInfo.logicalShape,e.shapeInfo.texShape);switch(t.length){case 1:r.push(`uniform int ${e.name}Shape;`);break;case 2:r.push(`uniform ivec2 ${e.name}Shape;`);break;case 3:r.push(`uniform ivec3 ${e.name}Shape;`);break;case 4:r.push(`uniform ivec4 ${e.name}Shape;`);break;default:break}r.push(`uniform ivec2 ${e.name}TexShape;`)}}),n.enableShapeUniforms){switch(t.logicalShape.length){case 1:r.push(`uniform int outShape;`);break;case 2:r.push(`uniform ivec2 outShape;`),r.push(`uniform int outShapeStrides;`);break;case 3:r.push(`uniform ivec3 outShape;`),r.push(`uniform ivec2 outShapeStrides;`);break;case 4:r.push(`uniform ivec4 outShape;`),r.push(`uniform ivec3 outShapeStrides;`);break;default:break}r.push(`uniform ivec2 outTexShape;`)}n.customUniforms&&n.customUniforms.forEach(e=>{r.push(`uniform ${e.type} ${e.name}${e.arrayIndex?`[${e.arrayIndex}]`:``};`)});let i=r.join(`
`),a=e.map(e=>sL(e,t,n.packedInputs,n.enableShapeUniforms)).join(`
`),o=t.texShape,s=YI(),c=uL(s),l,u,d=pL(s);return t.isPacked?(l=cL(t.logicalShape,o,n.enableShapeUniforms),u=fL(s)):(l=lL(t.logicalShape,o,n.enableShapeUniforms),u=dL(s)),n.packedInputs&&(d+=_L),[d,c,u,i,l,a,n.userCode].join(`
`)}function aL(e,t=!1){let n=e.shapeInfo.logicalShape;switch(n.length){case 0:return jL(e,t);case 1:return NL(e,t);case 2:return FL(e,t);case 3:return LL(e,t);case 4:return zL(e,t);case 5:return BL(e);case 6:return VL(e);default:throw Error(`${n.length}-D input sampling is not yet supported`)}}function oL(e,t){switch(e.shapeInfo.logicalShape.length){case 0:return AL(e);case 1:return ML(e,t);case 2:return PL(e,t);case 3:return IL(e,t);default:return RL(e,t)}}function sL(e,t,n=!1,r){let i=``;n?i+=oL(e,r):i+=aL(e,r);let a=e.shapeInfo.logicalShape,o=t.logicalShape;return a.length<=o.length&&(n?i+=UL(e,t):i+=WL(e,t)),i}function cL(e,t,n){switch(e.length){case 0:return vL();case 1:return yL(e,t,n);case 2:return DL(e,t,n);case 3:return xL(e,t,n);default:return CL(e,t,n)}}function lL(e,t,n){switch(e.length){case 0:return vL();case 1:return bL(e,t,n);case 2:return OL(e,t,n);case 3:return SL(e,t,n);case 4:return wL(e,t,n);case 5:return TL(e,t);case 6:return EL(e,t);default:throw Error(`${e.length}-D output sampling is not yet supported`)}}function uL(e){return`
    float sampleTexture(sampler2D textureSampler, vec2 uv) {
      return ${e.texture2D}(textureSampler, uv).r;
    }
  `}function dL(e){return`
    void setOutput(float val) {
      ${e.output} = vec4(val, 0, 0, 0);
    }
  `}function fL(e){return`
    void setOutput(vec4 val) {
      ${e.output} = val;
    }
  `}function pL(e){return`${e.version}
    precision highp float;
    precision highp int;
    precision highp sampler2D;
    ${e.varyingFs} vec2 resultUV;
    ${e.defineOutput}
    const vec2 halfCR = vec2(0.5, 0.5);

    struct ivec5
    {
      int x;
      int y;
      int z;
      int w;
      int u;
    };

    struct ivec6
    {
      int x;
      int y;
      int z;
      int w;
      int u;
      int v;
    };

    uniform float NAN;
    ${e.defineSpecialNaN}
    ${e.defineSpecialInf}
    ${e.defineRound}

    int imod(int x, int y) {
      return x - y * (x / y);
    }

    int idiv(int a, int b, float sign) {
      int res = a / b;
      int mod = imod(a, b);
      if (sign < 0. && mod != 0) {
        res -= 1;
      }
      return res;
    }

    //Based on the work of Dave Hoskins
    //https://www.shadertoy.com/view/4djSRW
    #define HASHSCALE1 443.8975
    float random(float seed){
      vec2 p = resultUV * seed;
      vec3 p3  = fract(vec3(p.xyx) * HASHSCALE1);
      p3 += dot(p3, p3.yzx + 19.19);
      return fract((p3.x + p3.y) * p3.z);
    }

    ${mL}
    ${hL}
    ${gL}
  `}var mL=`
vec2 uvFromFlat(int texNumR, int texNumC, int index) {
  int texR = index / texNumC;
  int texC = index - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
vec2 packedUVfrom1D(int texNumR, int texNumC, int index) {
  int texelIndex = index / 2;
  int texR = texelIndex / texNumC;
  int texC = texelIndex - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
`,hL=`
vec2 packedUVfrom2D(int texelsInLogicalRow, int texNumR,
  int texNumC, int row, int col) {
  int texelIndex = (row / 2) * texelsInLogicalRow + (col / 2);
  int texR = texelIndex / texNumC;
  int texC = texelIndex - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
`,gL=`
vec2 packedUVfrom3D(int texNumR, int texNumC,
    int texelsInBatch, int texelsInLogicalRow, int b,
    int row, int col) {
  int index = b * texelsInBatch + (row / 2) * texelsInLogicalRow + (col / 2);
  int texR = index / texNumC;
  int texC = index - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
`,_L=`
  float getChannel(vec4 frag, vec2 innerDims) {
    vec2 modCoord = mod(innerDims, 2.);
    return modCoord.x == 0. ?
      (modCoord.y == 0. ? frag.r : frag.g) :
      (modCoord.y == 0. ? frag.b : frag.a);
  }
  float getChannel(vec4 frag, int dim) {
    float modCoord = mod(float(dim), 2.);
    return modCoord == 0. ? frag.r : frag.g;
  }
`;function vL(){return`
    int getOutputCoords() {
      return 0;
    }
  `}function yL(e,t,n){let r=[Math.ceil(t[0]/2),Math.ceil(t[1]/2)];return r[0]===1?n?`
      int getOutputCoords() {
        return 2 * int(resultUV.x * ceil(float(outTexShape[1]) / 2.0));
      }
    `:`
      int getOutputCoords() {
        return 2 * int(resultUV.x * ${r[1]}.0);
      }
    `:r[1]===1?n?`
      int getOutputCoords() {
        return 2 * int(resultUV.y * ceil(float(outTexShape[0]) / 2.0));
      }
    `:`
      int getOutputCoords() {
        return 2 * int(resultUV.y * ${r[0]}.0);
      }
    `:n?`
    int getOutputCoords() {
      ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(packedTexShape[0], packedTexShape[1]));
      return 2 * (resTexRC.x * packedTexShape[1] + resTexRC.y);
    }
  `:`
    int getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${r[0]}, ${r[1]}));
      return 2 * (resTexRC.x * ${r[1]} + resTexRC.y);
    }
  `}function bL(e,t,n){return t[0]===1?n?`
      int getOutputCoords() {
        return int(resultUV.x * float(outTexShape[1]));
      }
    `:`
      int getOutputCoords() {
        return int(resultUV.x * ${t[1]}.0);
      }
    `:t[1]===1?n?`
      int getOutputCoords() {
        return int(resultUV.y * float(outTexShape[0]));
      }
    `:`
      int getOutputCoords() {
        return int(resultUV.y * ${t[0]}.0);
      }
    `:n?`
    int getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(outTexShape[0], outTexShape[1]));
      return resTexRC.x * outTexShape[1] + resTexRC.y;
    }
  `:`
    int getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${t[0]}, ${t[1]}));
      return resTexRC.x * ${t[1]} + resTexRC.y;
    }
  `}function xL(e,t,n){if(n)return`
    ivec3 getOutputCoords() {
      ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
      int texelsInLogicalRow = int(ceil(float(outShape[2]) / 2.0));
      int texelsInBatch = texelsInLogicalRow * int(ceil(float(outShape[1]) / 2.0));
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(packedTexShape[0], packedTexShape[1]));
      int index = resTexRC.x * packedTexShape[1] + resTexRC.y;

      int b = index / texelsInBatch;
      index -= b * texelsInBatch;

      int r = 2 * (index / texelsInLogicalRow);
      int c = imod(index, texelsInLogicalRow) * 2;

      return ivec3(b, r, c);
    }
  `;let r=[Math.ceil(t[0]/2),Math.ceil(t[1]/2)],i=Math.ceil(e[2]/2),a=i*Math.ceil(e[1]/2);return`
    ivec3 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${r[0]}, ${r[1]}));
      int index = resTexRC.x * ${r[1]} + resTexRC.y;

      int b = index / ${a};
      index -= b * ${a};

      int r = 2 * (index / ${i});
      int c = imod(index, ${i}) * 2;

      return ivec3(b, r, c);
    }
  `}function SL(e,t,n){if(n)return`
  ivec3 getOutputCoords() {
    ivec2 resTexRC = ivec2(resultUV.yx *
                           vec2(outTexShape[0], outTexShape[1]));
    int index = resTexRC.x * outTexShape[1] + resTexRC.y;
    ${ZI([`r`,`c`,`d`],e)}
    return ivec3(r, c, d);
  }
`;let r=XI([`r`,`c`,`d`],e);return`
    ivec3 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${t[0]}, ${t[1]}));
      int index = resTexRC.x * ${t[1]} + resTexRC.y;
      ${r}
      return ivec3(r, c, d);
    }
  `}function CL(e,t,n){if(n)return`
    ivec4 getOutputCoords() {
      ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(packedTexShape[0], packedTexShape[1]));
      int index = resTexRC.x * packedTexShape[1] + resTexRC.y;

      int texelsInLogicalRow = int(ceil(float(outShape[3]) / 2.0));
      int texelsInBatch = texelsInLogicalRow * int(ceil(float(outShape[2]) / 2.0));
      int texelsInBatchN = texelsInBatch * outShape[1];

      int b2 = index / texelsInBatchN;
      index -= b2 * texelsInBatchN;

      int b = index / texelsInBatch;
      index -= b * texelsInBatch;

      int r = 2 * (index / texelsInLogicalRow);
      int c = imod(index, texelsInLogicalRow) * 2;

      return ivec4(b2, b, r, c);
    }
  `;let r=[Math.ceil(t[0]/2),Math.ceil(t[1]/2)],i=Math.ceil(e[e.length-1]/2),a=i*Math.ceil(e[e.length-2]/2),o=a,s=``,c=`b, r, c`;for(let t=2;t<e.length-1;t++)o*=e[e.length-t-1],s=`
      int b${t} = index / ${o};
      index -= b${t} * ${o};
    `+s,c=`b${t}, `+c;return`
    ivec${e.length} getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${r[0]}, ${r[1]}));
      int index = resTexRC.x * ${r[1]} + resTexRC.y;

      ${s}

      int b = index / ${a};
      index -= b * ${a};

      int r = 2 * (index / ${i});
      int c = imod(index, ${i}) * 2;

      return ivec${e.length}(${c});
    }
  `}function wL(e,t,n){if(n)return`
    ivec4 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
        vec2(outTexShape[0], outTexShape[1]));
      int index = resTexRC.x * outTexShape[1] + resTexRC.y;
      ${ZI([`r`,`c`,`d`,`d2`],e)}
      return ivec4(r, c, d, d2);
    }
  `;let r=XI([`r`,`c`,`d`,`d2`],e);return`
    ivec4 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
        vec2(${t[0]}, ${t[1]}));
      int index = resTexRC.x * ${t[1]} + resTexRC.y;
      ${r}
      return ivec4(r, c, d, d2);
    }
  `}function TL(e,t){let n=XI([`r`,`c`,`d`,`d2`,`d3`],e);return`
    ivec5 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx * vec2(${t[0]},
                             ${t[1]}));

      int index = resTexRC.x * ${t[1]} + resTexRC.y;

      ${n}

      ivec5 outShape = ivec5(r, c, d, d2, d3);
      return outShape;
    }
  `}function EL(e,t){let n=XI([`r`,`c`,`d`,`d2`,`d3`,`d4`],e);return`
    ivec6 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
        vec2(${t[0]}, ${t[1]}));
      int index = resTexRC.x * ${t[1]} + resTexRC.y;

      ${n}

      ivec6 result = ivec6(r, c, d, d2, d3, d4);
      return result;
    }
  `}function DL(e,t,n){let r=[Math.ceil(t[0]/2),Math.ceil(t[1]/2)];if(k(e,t))return n?`
      ivec2 getOutputCoords() {
        ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
        return 2 * ivec2(resultUV.yx * vec2(packedTexShape[0], packedTexShape[1]));
      }
    `:`
      ivec2 getOutputCoords() {
        return 2 * ivec2(resultUV.yx * vec2(${r[0]}, ${r[1]}));
      }
    `;let i=Math.ceil(e[1]/2);return n?`
    ivec2 getOutputCoords() {
      ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
      int texelsInLogicalRow = int(ceil(float(outShape[1]) / 2.0));
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(packedTexShape[0], packedTexShape[1]));

      int index = resTexRC.x * packedTexShape[1] + resTexRC.y;
      int r = 2 * (index / texelsInLogicalRow);
      int c = imod(index, texelsInLogicalRow) * 2;

      return ivec2(r, c);
    }
  `:`
    ivec2 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${r[0]}, ${r[1]}));

      int index = resTexRC.x * ${r[1]} + resTexRC.y;
      int r = 2 * (index / ${i});
      int c = imod(index, ${i}) * 2;

      return ivec2(r, c);
    }
  `}function OL(e,t,n){return k(e,t)?n?`
      ivec2 getOutputCoords() {
        return ivec2(resultUV.yx * vec2(outTexShape[0], outTexShape[1]));
      }
    `:`
      ivec2 getOutputCoords() {
        return ivec2(resultUV.yx * vec2(${t[0]}, ${t[1]}));
      }
    `:e[1]===1?n?`
      ivec2 getOutputCoords() {
        ivec2 resTexRC = ivec2(resultUV.yx *
                               vec2(outTexShape[0], outTexShape[1]));
        int index = resTexRC.x * outTexShape[1] + resTexRC.y;
        return ivec2(index, 0);
      }
    `:`
      ivec2 getOutputCoords() {
        ivec2 resTexRC = ivec2(resultUV.yx *
                               vec2(${t[0]}, ${t[1]}));
        int index = resTexRC.x * ${t[1]} + resTexRC.y;
        return ivec2(index, 0);
      }
    `:e[0]===1?n?`
      ivec2 getOutputCoords() {
        ivec2 resTexRC = ivec2(resultUV.yx *
                               vec2(outTexShape[0], outTexShape[1]));
        int index = resTexRC.x * outTexShape[1] + resTexRC.y;
        return ivec2(0, index);
      }
    `:`
      ivec2 getOutputCoords() {
        ivec2 resTexRC = ivec2(resultUV.yx *
                               vec2(${t[0]}, ${t[1]}));
        int index = resTexRC.x * ${t[1]} + resTexRC.y;
        return ivec2(0, index);
      }
    `:n?`
    ivec2 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(outTexShape[0], outTexShape[1]));
      int index = resTexRC.x * outTexShape[1] + resTexRC.y;
      int r = index / outShape[1];
      int c = index - r * outShape[1];
      return ivec2(r, c);
    }
  `:`
    ivec2 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${t[0]}, ${t[1]}));
      int index = resTexRC.x * ${t[1]} + resTexRC.y;
      int r = index / ${e[1]};
      int c = index - r * ${e[1]};
      return ivec2(r, c);
    }
  `}function kL(e){return`offset${e}`}function AL(e){let t=e.name;return`
    vec4 ${`get`+t.charAt(0).toUpperCase()+t.slice(1)}() {
      return ${YI().texture2D}(${t}, halfCR);
    }
  `}function jL(e,t){let n=e.name,r=`get`+n.charAt(0).toUpperCase()+n.slice(1);if(e.shapeInfo.isUniform)return`float ${r}() {return ${n};}`;let[i,a]=e.shapeInfo.texShape;if(i===1&&a===1)return`
      float ${r}() {
        return sampleTexture(${n}, halfCR);
      }
    `;let o=kL(n);if(t)return`
    float ${r}() {
      vec2 uv = uvFromFlat(${n}TexShape[0], ${n}TexShape[1], ${o});
      return sampleTexture(${n}, uv);
    }
  `;let[s,c]=e.shapeInfo.texShape;return`
    float ${r}() {
      vec2 uv = uvFromFlat(${s}, ${c}, ${o});
      return sampleTexture(${n}, uv);
    }
  `}function ML(e,t){let n=e.name,r=`get`+n.charAt(0).toUpperCase()+n.slice(1),i=e.shapeInfo.texShape,a=YI();if(t)return`
    vec4 ${r}(int index) {
      ivec2 packedTexShape = ivec2(ceil(float(${n}TexShape[0]) / 2.0), ceil(float(${n}TexShape[1]) / 2.0));
      vec2 uv = packedUVfrom1D(
        packedTexShape[0], packedTexShape[1], index);
      return ${a.texture2D}(${n}, uv);
    }
  `;let o=[Math.ceil(i[0]/2),Math.ceil(i[1]/2)];return`
    vec4 ${r}(int index) {
      vec2 uv = packedUVfrom1D(
        ${o[0]}, ${o[1]}, index);
      return ${a.texture2D}(${n}, uv);
    }
  `}function NL(e,t){let n=e.name,r=`get`+n.charAt(0).toUpperCase()+n.slice(1);if(e.shapeInfo.isUniform)return`
      float ${r}(int index) {
        ${HL(e)}
      }
    `;let i=e.shapeInfo.texShape,a=i[0],o=i[1];if(o===1&&a===1)return`
      float ${r}(int index) {
        return sampleTexture(${n}, halfCR);
      }
    `;let s=kL(n);return o===1?t?`
      float ${r}(int index) {
        vec2 uv = vec2(0.5, (float(index + ${s}) + 0.5) / float(${n}TexShape[0]));
        return sampleTexture(${n}, uv);
      }
    `:`
      float ${r}(int index) {
        vec2 uv = vec2(0.5, (float(index + ${s}) + 0.5) / ${a}.0);
        return sampleTexture(${n}, uv);
      }
    `:a===1?t?`
      float ${r}(int index) {
        vec2 uv = vec2((float(index + ${s}) + 0.5) / float(${n}TexShape[1]), 0.5);
        return sampleTexture(${n}, uv);
      }
    `:`
      float ${r}(int index) {
        vec2 uv = vec2((float(index + ${s}) + 0.5) / ${o}.0, 0.5);
        return sampleTexture(${n}, uv);
      }
    `:t?`
    float ${r}(int index) {
      vec2 uv = uvFromFlat(${n}TexShape[0], ${n}TexShape[1], index + ${s});
      return sampleTexture(${n}, uv);
    }
  `:`
    float ${r}(int index) {
      vec2 uv = uvFromFlat(${a}, ${o}, index + ${s});
      return sampleTexture(${n}, uv);
    }
  `}function PL(e,t){let n=e.shapeInfo.logicalShape,r=e.name,i=`get`+r.charAt(0).toUpperCase()+r.slice(1),a=e.shapeInfo.texShape,o=a[0],s=a[1],c=YI();if(a!=null&&k(n,a))return t?`
      vec4 ${i}(int row, int col) {
        vec2 uv = (vec2(col, row) + halfCR) / vec2(${r}TexShape[1], ${r}TexShape[0]);

        return ${c.texture2D}(${r}, uv);
      }
    `:`
      vec4 ${i}(int row, int col) {
        vec2 uv = (vec2(col, row) + halfCR) / vec2(${s}.0, ${o}.0);

        return ${c.texture2D}(${r}, uv);
      }
    `;if(t)return`
    vec4 ${i}(int row, int col) {
      ivec2 packedTexShape = ivec2(ceil(float(${r}TexShape[0]) / 2.0), ceil(float(${r}TexShape[1]) / 2.0));
      int valuesPerRow = int(ceil(float(${r}Shape[1]) / 2.0));
      vec2 uv = packedUVfrom2D(valuesPerRow, packedTexShape[0], packedTexShape[1], row, col);
      return ${c.texture2D}(${r}, uv);
    }
  `;let l=[Math.ceil(a[0]/2),Math.ceil(a[1]/2)];return`
    vec4 ${i}(int row, int col) {
      vec2 uv = packedUVfrom2D(${Math.ceil(n[1]/2)}, ${l[0]}, ${l[1]}, row, col);
      return ${c.texture2D}(${r}, uv);
    }
  `}function FL(e,t){let n=e.shapeInfo.logicalShape,r=e.name,i=`get`+r.charAt(0).toUpperCase()+r.slice(1),a=e.shapeInfo.texShape;if(a!=null&&k(n,a)){if(t)return`
      float ${i}(int row, int col) {
        vec2 uv = (vec2(col, row) + halfCR) / vec2(${r}TexShape[1], ${r}TexShape[0]);
        return sampleTexture(${r}, uv);
      }
    `;let e=a[0];return`
    float ${i}(int row, int col) {
      vec2 uv = (vec2(col, row) + halfCR) / vec2(${a[1]}.0, ${e}.0);
      return sampleTexture(${r}, uv);
    }
  `}let{newShape:o,keptDims:s}=ue(n),c=o;if(c.length<n.length)return`
      ${aL(qL(e,c),t)}
      float ${i}(int row, int col) {
        return ${i}(${JL([`row`,`col`],s)});
      }
    `;if(e.shapeInfo.isUniform)return`
      float ${i}(int row, int col) {
        int index = round(dot(vec2(row, col), vec2(${n[1]}, 1)));
        ${HL(e)}
      }
    `;let l=a[0],u=a[1],d=kL(r);return u===1?t?`
      float ${i}(int row, int col) {
        float index = dot(vec3(row, col, ${d}), vec3(${r}Shape[1], 1, 1));
        vec2 uv = vec2(0.5, (index + 0.5) / float(${r}TexShape[0]));
        return sampleTexture(${r}, uv);
      }
    `:`
    float ${i}(int row, int col) {
      float index = dot(vec3(row, col, ${d}), vec3(${n[1]}, 1, 1));
      vec2 uv = vec2(0.5, (index + 0.5) / ${l}.0);
      return sampleTexture(${r}, uv);
    }
  `:l===1?t?`
      float ${i}(int row, int col) {
        float index = dot(vec3(row, col, ${d}), vec3(${r}Shape[1], 1, 1));
        vec2 uv = vec2((index + 0.5) / float(${r}TexShape[1]), 0.5);
        return sampleTexture(${r}, uv);
      }
    `:`
    float ${i}(int row, int col) {
      float index = dot(vec3(row, col, ${d}), vec3(${n[1]}, 1, 1));
      vec2 uv = vec2((index + 0.5) / ${u}.0, 0.5);
      return sampleTexture(${r}, uv);
    }
  `:t?`
      float ${i}(int row, int col) {
        // Explicitly use integer operations as dot() only works on floats.
        int index = row * ${r}Shape[1] + col + ${d};
        vec2 uv = uvFromFlat(${r}TexShape[0], ${r}TexShape[1], index);
        return sampleTexture(${r}, uv);
      }
    `:`
  float ${i}(int row, int col) {
    // Explicitly use integer operations as dot() only works on floats.
    int index = row * ${n[1]} + col + ${d};
    vec2 uv = uvFromFlat(${l}, ${u}, index);
    return sampleTexture(${r}, uv);
  }
`}function IL(e,t){let n=e.shapeInfo.logicalShape,r=e.name,i=`get`+r.charAt(0).toUpperCase()+r.slice(1),a=e.shapeInfo.texShape,o=[Math.ceil(a[0]/2),Math.ceil(a[1]/2)];if(n[0]===1)return`
        ${oL(qL(e,n.slice(1)),t)}
        vec4 ${i}(int b, int row, int col) {
          return ${i}(${JL([`b`,`row`,`col`],[1,2])});
        }
      `;let s=YI();if(t)return`
    vec4 ${i}(int b, int row, int col) {
      ivec2 packedTexShape = ivec2(ceil(float(${r}TexShape[0]) / 2.0), ceil(float(${r}TexShape[1]) / 2.0));
      int valuesPerRow = int(ceil(float(${r}Shape[2]) / 2.0));
      int texelsInBatch = valuesPerRow * int(ceil(float(${r}Shape[1]) / 2.0));
      vec2 uv = packedUVfrom3D(
        packedTexShape[0], packedTexShape[1], texelsInBatch, valuesPerRow, b, row, col);
      return ${s.texture2D}(${r}, uv);
    }
  `;let c=o[0],l=o[1],u=Math.ceil(n[2]/2);return`
    vec4 ${i}(int b, int row, int col) {
      vec2 uv = packedUVfrom3D(
        ${c}, ${l}, ${u*Math.ceil(n[1]/2)}, ${u}, b, row, col);
      return ${s.texture2D}(${r}, uv);
    }
  `}function LL(e,t){let n=e.shapeInfo.logicalShape,r=e.name,i=`get`+r.charAt(0).toUpperCase()+r.slice(1),a=n[1]*n[2],o=n[2],{newShape:s,keptDims:c}=ue(n),l=s;if(l.length<n.length)return`
        ${aL(qL(e,l),t)}
        float ${i}(int row, int col, int depth) {
          return ${i}(${JL([`row`,`col`,`depth`],c)});
        }
      `;if(e.shapeInfo.isUniform)return`
      float ${i}(int row, int col, int depth) {
        int index = round(dot(vec3(row, col, depth),
                          vec3(${a}, ${o}, 1)));
        ${HL(e)}
      }
    `;let u=e.shapeInfo.texShape,d=u[0],f=u[1],p=e.shapeInfo.flatOffset;if(f===a&&p==null)return t?`
      float ${i}(int row, int col, int depth) {
        int stride1 = ${r}Shape[2];
        float texR = float(row);
        float texC = dot(vec2(col, depth), vec2(stride1, 1));
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${r}TexShape[1], ${r}TexShape[0]);
        return sampleTexture(${r}, uv);
      }
    `:`
        float ${i}(int row, int col, int depth) {
          float texR = float(row);
          float texC = dot(vec2(col, depth), vec2(${o}, 1));
          vec2 uv = (vec2(texC, texR) + halfCR) /
                     vec2(${f}.0, ${d}.0);
          return sampleTexture(${r}, uv);
        }
      `;if(f===o&&p==null)return t?`
      float ${i}(int row, int col, int depth) {
        float texR = dot(vec2(row, col), vec2(${r}Shape[1], 1));
        float texC = float(depth);
        vec2 uv = (vec2(texC, texR) + halfCR) / vec2(${r}TexShape[1], ${r}TexShape[0]);
        return sampleTexture(${r}, uv);
      }
    `:`
    float ${i}(int row, int col, int depth) {
      float texR = dot(vec2(row, col), vec2(${n[1]}, 1));
      float texC = float(depth);
      vec2 uv = (vec2(texC, texR) + halfCR) / vec2(${f}.0, ${d}.0);
      return sampleTexture(${r}, uv);
    }
  `;let m=kL(r);return t?`
    float ${i}(int row, int col, int depth) {
      // Explicitly use integer operations as dot() only works on floats.
      int stride0 = ${r}Shape[1] * ${r}Shape[2];
      int stride1 = ${r}Shape[2];
      int index = row * stride0 + col * stride1 + depth + ${m};
      vec2 uv = uvFromFlat(${r}TexShape[0], ${r}TexShape[1], index);
      return sampleTexture(${r}, uv);
    }
    `:`
      float ${i}(int row, int col, int depth) {
        // Explicitly use integer operations as dot() only works on floats.
        int index = row * ${a} + col * ${o} + depth + ${m};
        vec2 uv = uvFromFlat(${d}, ${f}, index);
        return sampleTexture(${r}, uv);
      }
  `}function RL(e,t){let n=e.name,r=`get`+n.charAt(0).toUpperCase()+n.slice(1),i=YI();if(t)return`
    vec4 ${r}(int b2, int b, int row, int col) {
      int valuesPerRow = int(ceil(float(${n}Shape[3]) / 2.0));
      int texelsInBatch = valuesPerRow * int(ceil(float(${n}Shape[2]) / 2.0));
      int index = b * texelsInBatch + (row / 2) * valuesPerRow + (col / 2);
      texelsInBatch *= ${n}Shape[1];
      index = b2 * texelsInBatch + index;
      ivec2 packedTexShape = ivec2(ceil(float(${n}TexShape[0]) / 2.0), ceil(float(${n}TexShape[1]) / 2.0));
      int texR = index / packedTexShape[1];
      int texC = index - texR * packedTexShape[1];
      vec2 uv = (vec2(texC, texR) + halfCR) / vec2(packedTexShape[1], packedTexShape[0]); return ${i.texture2D}(${n}, uv);
    }
  `;let a=e.shapeInfo.logicalShape,o=a.length,s=e.shapeInfo.texShape,c=[Math.ceil(s[0]/2),Math.ceil(s[1]/2)],l=c[0],u=c[1],d=Math.ceil(a[o-1]/2),f=d*Math.ceil(a[o-2]/2),p=`int b, int row, int col`,m=`b * ${f} + (row / 2) * ${d} + (col / 2)`;for(let e=2;e<o-1;e++)p=`int b${e}, `+p,f*=a[o-e-1],m=`b${e} * ${f} + `+m;return`
    vec4 ${r}(${p}) {
      int index = ${m};
      int texR = index / ${u};
      int texC = index - texR * ${u};
      vec2 uv = (vec2(texC, texR) + halfCR) / vec2(${u}, ${l});
      return ${i.texture2D}(${n}, uv);
    }
  `}function zL(e,t){let n=e.shapeInfo.logicalShape,r=e.name,i=`get`+r.charAt(0).toUpperCase()+r.slice(1),a=n[3],o=n[2]*a,s=n[1]*o,{newShape:c,keptDims:l}=ue(n);if(c.length<n.length)return`
      ${aL(qL(e,c),t)}
      float ${i}(int row, int col, int depth, int depth2) {
        return ${i}(${JL([`row`,`col`,`depth`,`depth2`],l)});
      }
    `;if(e.shapeInfo.isUniform)return`
      float ${i}(int row, int col, int depth, int depth2) {
        int index = round(dot(vec4(row, col, depth, depth2),
                          vec4(${s}, ${o}, ${a}, 1)));
        ${HL(e)}
      }
    `;let u=e.shapeInfo.flatOffset,d=e.shapeInfo.texShape,f=d[0],p=d[1],m=`int stride2 = ${r}Shape[3];`,h=`int stride1 = ${r}Shape[2] * stride2;`,g=`int stride0 = ${r}Shape[1] * stride1;`;if(p===s&&u==null)return t?`
      float ${i}(int row, int col, int depth, int depth2) {
        ${m}
        ${h}
        float texR = float(row);
        float texC =
            dot(vec3(col, depth, depth2),
                vec3(stride1, stride2, 1));
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${r}TexShape[1], ${r}TexShape[0]);
        return sampleTexture(${r}, uv);
      }
    `:`
      float ${i}(int row, int col, int depth, int depth2) {
        float texR = float(row);
        float texC =
            dot(vec3(col, depth, depth2),
                vec3(${o}, ${a}, 1));
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${p}.0, ${f}.0);
        return sampleTexture(${r}, uv);
      }
    `;if(p===a&&u==null)return t?`
      float ${i}(int row, int col, int depth, int depth2) {
        float texR = dot(vec3(row, col, depth),
                         vec3(${r}Shape[1] * ${r}Shape[2], ${r}Shape[2], 1));
        float texC = float(depth2);
        vec2 uv = (vec2(texC, texR) + halfCR) /
                  vec2(${r}TexShape[1], ${r}TexShape[0]);
        return sampleTexture(${r}, uv);
      }
    `:`
      float ${i}(int row, int col, int depth, int depth2) {
        float texR = dot(vec3(row, col, depth),
                         vec3(${n[1]*n[2]}, ${n[2]}, 1));
        float texC = float(depth2);
        vec2 uv = (vec2(texC, texR) + halfCR) /
                  vec2(${p}.0, ${f}.0);
        return sampleTexture(${r}, uv);
      }
    `;let _=kL(r);return t?`
    float ${i}(int row, int col, int depth, int depth2) {
      // Explicitly use integer operations as dot() only works on floats.
      ${m}
      ${h}
      ${g}
      int index = row * stride0 + col * stride1 +
          depth * stride2 + depth2;
      vec2 uv = uvFromFlat(${r}TexShape[0], ${r}TexShape[1], index + ${_});
      return sampleTexture(${r}, uv);
    }
  `:`
    float ${i}(int row, int col, int depth, int depth2) {
      // Explicitly use integer operations as dot() only works on floats.
      int index = row * ${s} + col * ${o} +
          depth * ${a} + depth2;
      vec2 uv = uvFromFlat(${f}, ${p}, index + ${_});
      return sampleTexture(${r}, uv);
    }
  `}function BL(e){let t=e.shapeInfo.logicalShape,n=e.name,r=`get`+n.charAt(0).toUpperCase()+n.slice(1),i=t[4],a=t[3]*i,o=t[2]*a,s=t[1]*o,{newShape:c,keptDims:l}=ue(t);if(c.length<t.length)return`
      ${aL(qL(e,c))}
      float ${r}(int row, int col, int depth, int depth2, int depth3) {
        return ${r}(${JL([`row`,`col`,`depth`,`depth2`,`depth3`],l)});
      }
    `;if(e.shapeInfo.isUniform)return`
      float ${r}(int row, int col, int depth, int depth2, int depth3) {
        float index = dot(
          vec4(row, col, depth, depth2),
          vec4(${s}, ${o}, ${a}, ${i})) +
          depth3;
        ${HL(e)}
      }
    `;let u=e.shapeInfo.flatOffset,d=e.shapeInfo.texShape,f=d[0],p=d[1];return p===s&&u==null?`
      float ${r}(int row, int col, int depth, int depth2, int depth3) {
        int texR = row;
        float texC = dot(vec4(col, depth, depth2, depth3),
                         vec4(${o}, ${a}, ${i}, 1));
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${p}.0, ${f}.0);
        return sampleTexture(${n}, uv);
      }
    `:p===i&&u==null?`
      float ${r}(int row, int col, int depth, int depth2, int depth3) {
        float texR = dot(
          vec4(row, col, depth, depth2),
          vec4(${t[1]*t[2]*t[3]},
               ${t[2]*t[3]}, ${t[3]}, 1));
        int texC = depth3;
        vec2 uv = (vec2(texC, texR) + halfCR) /
                  vec2(${p}.0, ${f}.0);
        return sampleTexture(${n}, uv);
      }
    `:`
    float ${r}(int row, int col, int depth, int depth2, int depth3) {
      // Explicitly use integer operations as dot() only works on floats.
      int index = row * ${s} + col * ${o} + depth * ${a} +
          depth2 * ${i} + depth3 + ${kL(n)};
      vec2 uv = uvFromFlat(${f}, ${p}, index);
      return sampleTexture(${n}, uv);
    }
  `}function VL(e){let t=e.shapeInfo.logicalShape,n=e.name,r=`get`+n.charAt(0).toUpperCase()+n.slice(1),{newShape:i,keptDims:a}=ue(t);if(i.length<t.length)return`
      ${aL(qL(e,i))}
      float ${r}(int row, int col, int depth,
                    int depth2, int depth3, int depth4) {
        return ${r}(${JL([`row`,`col`,`depth`,`depth2`,`depth3`,`depth4`],a)});
      }
    `;let o=t[5],s=t[4]*o,c=t[3]*s,l=t[2]*c,u=t[1]*l;if(e.shapeInfo.isUniform)return`
      float ${r}(int row, int col, int depth,
                  int depth2, int depth3, int depth4) {
        int index = round(dot(
          vec4(row, col, depth, depth2),
          vec4(${u}, ${l}, ${c}, ${s})) +
          dot(
            vec2(depth3, depth4),
            vec2(${o}, 1)));
        ${HL(e)}
      }
    `;let d=e.shapeInfo.flatOffset,f=e.shapeInfo.texShape,p=f[0],m=f[1];return m===u&&d==null?`
      float ${r}(int row, int col, int depth,
                    int depth2, int depth3, int depth4) {
        int texR = row;
        float texC = dot(vec4(col, depth, depth2, depth3),
          vec4(${l}, ${c}, ${s}, ${o})) +
               float(depth4);
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${m}.0, ${p}.0);
        return sampleTexture(${n}, uv);
      }
    `:m===o&&d==null?`
      float ${r}(int row, int col, int depth,
                    int depth2, int depth3, int depth4) {
        float texR = dot(vec4(row, col, depth, depth2),
          vec4(${t[1]*t[2]*t[3]*t[4]},
               ${t[2]*t[3]*t[4]},
               ${t[3]*t[4]},
               ${t[4]})) + float(depth3);
        int texC = depth4;
        vec2 uv = (vec2(texC, texR) + halfCR) /
                  vec2(${m}.0, ${p}.0);
        return sampleTexture(${n}, uv);
      }
    `:`
    float ${r}(int row, int col, int depth,
                  int depth2, int depth3, int depth4) {
      // Explicitly use integer operations as dot() only works on floats.
      int index = row * ${u} + col * ${l} + depth * ${c} +
          depth2 * ${s} + depth3 * ${o} + depth4 + ${kL(n)};
      vec2 uv = uvFromFlat(${p}, ${m}, index);
      return sampleTexture(${n}, uv);
    }
  `}function HL(e){let t=e.name,n=O(e.shapeInfo.logicalShape);return n<2?`return ${t};`:`
    for (int i = 0; i < ${n}; i++) {
      if (i == index) {
        return ${t}[i];
      }
    }
  `}function UL(e,t){let n=e.name,r=n.charAt(0).toUpperCase()+n.slice(1),i=`get`+r+`AtOutCoords`,a=e.shapeInfo.logicalShape.length,o=t.logicalShape.length,s=rL(e.shapeInfo.logicalShape,t.logicalShape),c=GL(o),l=o-a,u,d=[`x`,`y`,`z`,`w`,`u`,`v`];u=a===0?``:o<2&&s.length>=1?`coords = 0;`:s.map(e=>`coords.${d[e+l]} = 0;`).join(`
`);let f=``;f=o<2&&a>0?`coords`:e.shapeInfo.logicalShape.map((e,t)=>`coords.${d[t+l]}`).join(`, `);let p=`return outputValue;`,m=O(e.shapeInfo.logicalShape)===1,h=O(t.logicalShape)===1;if(a===1&&!m&&!h)p=`
      return vec4(outputValue.xy, outputValue.xy);
    `;else if(m&&!h)p=o===1?`
        return vec4(outputValue.x, outputValue.x, 0., 0.);
      `:`
        return vec4(outputValue.x);
      `;else if(s.length){let e=a-2,t=a-1;s.indexOf(e)>-1&&s.indexOf(t)>-1?p=`return vec4(outputValue.x);`:s.indexOf(e)>-1?p=`return vec4(outputValue.x, outputValue.y, outputValue.x, outputValue.y);`:s.indexOf(t)>-1&&(p=`return vec4(outputValue.xx, outputValue.zz);`)}return`
    vec4 ${i}() {
      ${c} coords = getOutputCoords();
      ${u}
      vec4 outputValue = get${r}(${f});
      ${p}
    }
  `}function WL(e,t){let n=e.name,r=n.charAt(0).toUpperCase()+n.slice(1),i=`get`+r+`AtOutCoords`,a=t.texShape,o=e.shapeInfo.texShape,s=e.shapeInfo.logicalShape.length,c=t.logicalShape.length;if(!e.shapeInfo.isUniform&&s===c&&e.shapeInfo.flatOffset==null&&k(o,a))return`
      float ${i}() {
        return sampleTexture(${n}, resultUV);
      }
    `;let l=GL(c),u=rL(e.shapeInfo.logicalShape,t.logicalShape),d=c-s,f,p=[`x`,`y`,`z`,`w`,`u`,`v`];f=s===0?``:c<2&&u.length>=1?`coords = 0;`:u.map(e=>`coords.${p[e+d]} = 0;`).join(`
`);let m=``;return m=c<2&&s>0?`coords`:e.shapeInfo.logicalShape.map((e,t)=>`coords.${p[t+d]}`).join(`, `),`
    float ${i}() {
      ${l} coords = getOutputCoords();
      ${f}
      return get${r}(${m});
    }
  `}function GL(e){if(e<=1)return`int`;if(e===2)return`ivec2`;if(e===3)return`ivec3`;if(e===4)return`ivec4`;if(e===5)return`ivec5`;if(e===6)return`ivec6`;throw Error(`GPU for rank ${e} is not yet supported`)}function KL(e,t,n){let{newShape:r,keptDims:i}=ue(t),a=t.length,o=e&&a===3&&t[0]===1,s=o?t.slice(1):r,c=!e&&a>1&&!k(t,n)&&r.length<a||o;return{useSqueezeShape:c,uniformShape:c?s:t,keptDims:i}}function qL(e,t){let n=JSON.parse(JSON.stringify(e));return n.shapeInfo.logicalShape=t,n}function JL(e,t){return t.map(t=>e[t]).join(`, `)}J();function YL(e,t,n,r){let i=n.map((e,n)=>{let r={logicalShape:e.shape,texShape:e.isUniform?null:e.texData.texShape,isUniform:e.isUniform,isPacked:e.isUniform?!1:e.texData.isPacked,flatOffset:null};return e.texData!=null&&e.texData.slice!=null&&e.texData.slice.flatOffset>0&&(r.flatOffset=e.texData.slice.flatOffset),{name:t.variableNames[n],shapeInfo:r}}),a=i.map(e=>e.shapeInfo),o={logicalShape:r.shape,texShape:r.texData.texShape,isUniform:!1,isPacked:r.texData.isPacked,flatOffset:null},s=iL(i,o,t),c=cI(e.gl,s),l=e.createProgram(c);return M().get(`ENGINE_COMPILE_ONLY`)?{program:t,fragmentShader:c,source:s,webGLProgram:l,inShapeInfos:a,outShapeInfo:o,variablesLocations:null,customUniformLocations:null,infLoc:null,nanLoc:null,outShapeLocation:null,outShapeStridesLocation:null,outTexShapeLocation:null}:(e.buildVao(l),Object.assign({program:t,fragmentShader:c,source:s,webGLProgram:l,inShapeInfos:a,outShapeInfo:o},XL(e,t,l)))}function XL(e,t,n){let r=[],i=[],a,o,s,c=null,l=null;l=e.getUniformLocation(n,`NAN`,!1),M().getNumber(`WEBGL_VERSION`)===1&&(c=e.getUniformLocation(n,`INFINITY`,!1));for(let i of t.variableNames){let a={name:i,uniform:e.getUniformLocation(n,i,!1),offset:e.getUniformLocation(n,`offset${i}`,!1)};t.enableShapeUniforms&&(a.shape=e.getUniformLocation(n,`${i}Shape`,!1),a.texShape=e.getUniformLocation(n,`${i}TexShape`,!1)),r.push(a)}if(t.enableShapeUniforms&&(a=e.getUniformLocation(n,`outShape`,!1),s=e.getUniformLocation(n,`outShapeStrides`,!1),o=e.getUniformLocation(n,`outTexShape`,!1)),t.customUniforms)for(let r of t.customUniforms)i.push(e.getUniformLocation(n,r.name,!1));return{variablesLocations:r,customUniformLocations:i,infLoc:c,nanLoc:l,outShapeLocation:a,outShapeStridesLocation:s,outTexShapeLocation:o}}function ZL(e,t){if(e.length!==t.length)throw Error(`Binary was compiled with ${e.length} inputs, but was executed with ${t.length} inputs`);e.forEach((e,n)=>{let r=e.logicalShape,i=t[n],a=i.shape;if(!k(r,a))throw Error(`Binary was compiled with different shapes than the current args. Shapes ${r} and ${a} must match`);if(e.isUniform&&i.isUniform)return;let o=e.texShape,s=i.isUniform?null:i.texData.texShape;if(!k(o,s))throw Error(`Binary was compiled with different texture shapes than the current args. Shape ${o} and ${s} must match`)})}function QL(e,t,n,r,i){t.program.enableShapeUniforms||(ZL(t.inShapeInfos,n),ZL([t.outShapeInfo],[r]));let a=r.texData.texture,o=r.texData.texShape;r.texData.isPacked?e.setOutputPackedMatrixTexture(a.texture,o[0],o[1]):e.setOutputMatrixTexture(a.texture,o[0],o[1]),e.setProgram(t.webGLProgram),e.bindVertexArray(t.webGLProgram.vao),M().getNumber(`WEBGL_VERSION`)===1&&t.infLoc!==null&&e.gl.uniform1f(t.infLoc,1/0),t.nanLoc!==null&&e.gl.uniform1f(t.nanLoc,NaN);for(let r=0;r<n.length;++r){let i=n[r],{uniform:a,offset:o,shape:s,texShape:c}=t.variablesLocations[r];if(s){let{uniformShape:n}=KL(t.program.packedInputs,i.shape,i.texData.texShape);switch(n.length){case 1:e.gl.uniform1iv(s,new Int32Array(n));break;case 2:e.gl.uniform2iv(s,new Int32Array(n));break;case 3:e.gl.uniform3iv(s,new Int32Array(n));break;case 4:e.gl.uniform4iv(s,new Int32Array(n));break;default:break}}if(c&&e.gl.uniform2i(c,i.texData.texShape[0],i.texData.texShape[1]),a!=null){if(i.isUniform){if(O(i.shape)<2)e.gl.uniform1f(a,i.uniformValues[0]);else{let t=i.uniformValues;t instanceof Float32Array||(t=new Float32Array(t)),e.gl.uniform1fv(a,t)}continue}i.texData.slice!=null&&o!=null&&e.gl.uniform1i(o,i.texData.slice.flatOffset),e.setInputMatrixTexture(i.texData.texture.texture,a,r)}}let s=t.outShapeLocation;if(s)switch(r.shape.length){case 1:e.gl.uniform1iv(s,new Int32Array(r.shape));break;case 2:e.gl.uniform2iv(s,new Int32Array(r.shape));break;case 3:e.gl.uniform3iv(s,new Int32Array(r.shape));break;case 4:e.gl.uniform4iv(s,new Int32Array(r.shape));break;default:break}if(t.outShapeStridesLocation){let n=j(r.shape);switch(r.shape.length){case 2:e.gl.uniform1iv(t.outShapeStridesLocation,new Int32Array(n));break;case 3:e.gl.uniform2iv(t.outShapeStridesLocation,new Int32Array(n));break;case 4:e.gl.uniform3iv(t.outShapeStridesLocation,new Int32Array(n));break;default:break}}if(t.outTexShapeLocation&&e.gl.uniform2i(t.outTexShapeLocation,r.texData.texShape[0],r.texData.texShape[1]),t.program.customUniforms&&i)for(let n=0;n<t.program.customUniforms.length;++n){let r=t.program.customUniforms[n],a=t.customUniformLocations[n],o=i[n];if(r.type===`float`)e.gl.uniform1fv(a,o);else if(r.type===`vec2`)e.gl.uniform2fv(a,o);else if(r.type===`vec3`)e.gl.uniform3fv(a,o);else if(r.type===`vec4`)e.gl.uniform4fv(a,o);else if(r.type===`int`)e.gl.uniform1iv(a,o);else if(r.type===`ivec2`)e.gl.uniform2iv(a,o);else if(r.type===`ivec3`)e.gl.uniform3iv(a,o);else if(r.type===`ivec4`)e.gl.uniform4iv(a,o);else throw Error(`uniform type ${r.type} is not supported yet.`)}e.executeProgram()}function $L(e,t,n){let r=``;t.concat(n).forEach(t=>{let i=t.texData!=null&&t.texData.slice!=null&&t.texData.slice.flatOffset>0;if(e.enableShapeUniforms&&!t.isUniform){let a=t.texData.texShape,{useSqueezeShape:o,uniformShape:s,keptDims:c}=KL(e.packedInputs,t.shape,a),l=``,u=``,d=``;if(s.length===1&&e.packedInputs){let e=[Math.ceil(a[0]/2),Math.ceil(a[1]/2)];l=`${e[0]>1}_${e[1]>1}`}else if(s.length===2&&!e.packedInputs)u=`${s[0]>1}_${s[1]>1}`;else if(s.length>2&&!e.packedInputs){let e=j(s);d=`${e[0]===a[1]}_${e[e.length-1]===a[1]}`}let f=t.shape.length,p=s.length===2&&k(t.shape,a),m=O(t.shape)===1,h=zd(t.shape,n.shape),g=!e.packedInputs&&f===n.shape.length&&k(a,n.texData.texShape),_=e.packedInputs||s.length>2?``:`${a[0]>1}_${a[1]>1}`;r+=`${f}_${g}_${o?c:``}_${s.length}_${m}_${h}_${p}_${l}_${u}_${d}_${_}_${i}`}else{let e=t.isUniform?`uniform`:t.texData.texShape;r+=`${t.shape}_${e}_${i}`}});let i=e.userCode,a=e.constructor.name;return a+=`_`+r+`_`+i+`${M().getNumber(`WEBGL_VERSION`)}`,a}function eR(e){return M().getBool(`WEBGL_USE_SHAPES_UNIFORMS`)&&e<=4}var tR=class{constructor(e){this.variableNames=[`A`],this.packedInputs=!1,this.packedOutput=!0,this.outPackingScheme=KF.DENSE,this.customUniforms=[{name:`texShape`,type:`ivec2`}];let t=YI();this.outputShape=e,this.enableShapeUniforms=eR(this.outputShape.length),this.userCode=`
      ivec3 outCoordsFromFlatIndex(int index) {
        ${this.enableShapeUniforms?ZI([`r`,`c`,`d`],e):XI([`r`,`c`,`d`],e)}
        return ivec3(r, c, d);
      }

      void main() {
        ivec2 resTexRC = ivec2(resultUV.yx * vec2(texShape[0], texShape[1]));
        int index = 4 * (resTexRC.x * texShape[1] + resTexRC.y);

        vec4 result = vec4(0.);

        for (int i=0; i<4; i++) {
          int flatIndex = index + i;
          ivec3 rc = outCoordsFromFlatIndex(flatIndex);
          result[i] = getA(rc.x, rc.y, rc.z);
        }

        ${t.output} = result;
      }
    `}},nR=class{constructor(e){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,this.outPackingScheme=KF.DENSE,this.customUniforms=[{name:`texShape`,type:`ivec2`}];let t=YI();this.outputShape=e,this.enableShapeUniforms=eR(this.outputShape.length),this.userCode=`
      ivec3 outCoordsFromFlatIndex(int index) {
        ${this.enableShapeUniforms?ZI([`r`,`c`,`d`],e):XI([`r`,`c`,`d`],e)}
        return ivec3(r, c, d);
      }

      void main() {
        ivec2 resTexRC = ivec2(resultUV.yx * vec2(texShape[0], texShape[1]));
        int index = 4 * (resTexRC.x * texShape[1] + resTexRC.y);

        vec4 result = vec4(0.);

        for (int i=0; i<4; i++) {
          int flatIndex = index + i;
          ivec3 rc = outCoordsFromFlatIndex(flatIndex);
          result[i] = getChannel(getA(rc.x, rc.y, rc.z), vec2(rc.y, rc.z));
        }

        ${t.output} = result;
      }
    `}},rR=class{constructor(e){this.variableNames=[`A`],this.outTexUsage=qF.DOWNLOAD;let t=YI();this.outputShape=e,this.userCode=`
      ${nL}

      void main() {
        float x = getAAtOutCoords();
        ${t.output} = encode_float(x);
      }
    `}},iR=class{constructor(e){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!1,this.outTexUsage=qF.DOWNLOAD;let t=YI();this.outputShape=e,this.userCode=`
      ${nL}

      void main() {
        ivec3 coords = getOutputCoords();
        float x = getChannel(getAAtOutCoords(), vec2(coords.y, coords.z));
        ${t.output} = encode_float(x);
      }
    `}},aR={R:0,G:1,B:2,A:3},oR=class{constructor(e,t=!1,n=`RGBA`){this.variableNames=[`A`],this.customUniforms=[{name:`texShape`,type:`ivec2`}];let r=YI();this.outputShape=e,this.enableShapeUniforms=eR(this.outputShape.length);let i=`result`;t&&(i=`floor(result * 255. + 0.5)`);let a=``;for(let e=0;e<n.length;e++){let t=n[e];a+=`
          if(offset == ${e}) {
            result = values[${aR[t]}];
          }`}this.userCode=`
      ${this.enableShapeUniforms?tL():eL(e)}

      void main() {
        ivec3 coords = getOutputCoords();
        int flatIndex = getFlatIndex(coords);
        float result = 0.;
        int offset = imod(flatIndex, ${n.length});

        flatIndex = idiv(flatIndex, ${n.length}, 1.);

        int r = flatIndex / texShape[1];
        if (r < texShape[0]) {
          int c = imod(flatIndex, texShape[1]);
          vec2 uv = (vec2(c, r) + halfCR) / vec2(texShape[1], texShape[0]);
          vec4 values = ${r.texture2D}(A, uv);
          ${a}
        }
        ${r.output} = vec4(${i}, 0., 0., 0.);
      }
    `}},sR=class{constructor(e,t=!1){this.variableNames=[`A`],this.packedInputs=!1,this.packedOutput=!0,this.customUniforms=[{name:`texShape`,type:`ivec2`}];let n=YI();this.outputShape=e,this.enableShapeUniforms=eR(this.outputShape.length);let r=``,i=`result`;t&&(i=`floor(result * 255. + 0.5)`);for(let t=0;t<=1;t++)for(let i=0;i<=1;i++){let a=t*2+i;r+=`
          localCoords = coords;
          if(localCoords[2] + ${i} < ${this.enableShapeUniforms?`outShape[2]`:`${e[2]}`}) {
          localCoords[2] += ${i};
          if (localCoords[1] + ${t} < ${this.enableShapeUniforms?`outShape[1]`:`${e[1]}`}) {
            localCoords[1] += ${t};

            flatIndex = getFlatIndex(localCoords);
            offset = imod(flatIndex, 4);

            flatIndex = idiv(flatIndex, 4, 1.);

            int r = flatIndex / texShape[1];
            int c = imod(flatIndex, texShape[1]);
            vec2 uv = (vec2(c, r) + halfCR) / vec2(texShape[1], texShape[0]);
            values = ${n.texture2D}(A, uv);

            if (offset == 0) {
              result[${a}] = values[0];
            } else if (offset == 1) {
              result[${a}] = values[1];
            } else if (offset == 2) {
              result[${a}] = values[2];
            } else {
              result[${a}] = values[3];
            }
          }
        }
        `}this.userCode=`
        ${this.enableShapeUniforms?tL():eL(e)}

        void main() {
          ivec3 coords = getOutputCoords();

          vec4 result = vec4(0.);
          int flatIndex, r, c, offset;
          ivec3 localCoords;
          vec2 uv;
          vec4 values;

          ${r}

          ${n.output} = ${i};
        }
    `}};J();function cR(e){let t=YI();return sI(e,`${t.version}
    precision highp float;
    ${t.attribute} vec3 clipSpacePos;
    ${t.attribute} vec2 uv;
    ${t.varyingVs} vec2 resultUV;

    void main() {
      gl_Position = vec4(clipSpacePos, 1);
      resultUV = uv;
    }`)}function lR(e){return mI(e,new Float32Array([-1,1,0,0,1,-1,-1,0,0,0,1,1,0,1,1,1,-1,0,1,0]))}function uR(e){return hI(e,new Uint16Array([0,1,2,2,1,3]))}function dR(e,t,n,r,i,a){_I(t,n);let o=gI(e),s=e.TEXTURE_2D;return X(e,()=>e.bindTexture(s,o)),X(e,()=>e.texParameteri(s,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE)),X(e,()=>e.texParameteri(s,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)),X(e,()=>e.texParameteri(s,e.TEXTURE_MIN_FILTER,e.NEAREST)),X(e,()=>e.texParameteri(s,e.TEXTURE_MAG_FILTER,e.NEAREST)),M().getNumber(`WEBGL_VERSION`)===1?X(e,()=>e.texImage2D(s,0,r,t,n,0,i,a,null)):X(e,()=>e.texStorage2D(s,1,r,t,n)),X(e,()=>e.bindTexture(e.TEXTURE_2D,null)),{texture:o,texShape:[n,t]}}function fR(e){return e.internalFormatFloat}function pR(e,t,n,r){let[i,a]=YF(t,n);return dR(e,i,a,fR(r),r.textureFormatFloat,e.FLOAT)}function mR(e){return e.internalFormatHalfFloat}function hR(e,t,n,r){let[i,a]=YF(t,n);return dR(e,i,a,mR(r),r.textureFormatFloat,r.textureTypeHalfFloat)}function gR(e){return e.downloadTextureFormat}function _R(e,t,n,r){let[i,a]=YF(t,n);return dR(e,i,a,gR(r),e.RGBA,e.UNSIGNED_BYTE)}function vR(e){return e.internalFormatPackedFloat}function yR(e,t,n,r){let[i,a]=QF(t,n);return dR(e,i,a,vR(r),e.RGBA,e.FLOAT)}function bR(e){return e.internalFormatPackedHalfFloat}function xR(e,t,n,r){let[i,a]=QF(t,n);return dR(e,i,a,bR(r),e.RGBA,r.textureTypeHalfFloat)}function SR(e,t,n){return X(e,()=>e.bindBuffer(e.ARRAY_BUFFER,n)),yI(e,t,`clipSpacePos`,n,3,20,0)&&yI(e,t,`uv`,n,2,20,12)}function CR(e,t,n,r,i,a){X(e,()=>e.bindTexture(e.TEXTURE_2D,t));let o,s,c;i instanceof Uint8Array?(o=new Uint8Array(n*r*4),s=e.UNSIGNED_BYTE,c=e.RGBA):(o=new Float32Array(n*r*4),s=e.FLOAT,c=a.internalFormatPackedFloat),o.set(i),M().getNumber(`WEBGL_VERSION`)===2?X(e,()=>e.texSubImage2D(e.TEXTURE_2D,0,0,0,n,r,e.RGBA,s,o)):X(e,()=>e.texImage2D(e.TEXTURE_2D,0,c,n,r,0,e.RGBA,s,o)),X(e,()=>e.bindTexture(e.TEXTURE_2D,null))}function wR(e,t,n){X(e,()=>e.bindTexture(e.TEXTURE_2D,t)),n.data instanceof Uint8Array?M().getNumber(`WEBGL_VERSION`)===2?X(e,()=>e.texSubImage2D(e.TEXTURE_2D,0,0,0,n.width,n.height,e.RGBA,e.UNSIGNED_BYTE,n.data)):X(e,()=>e.texImage2D(e.TEXTURE_2D,0,e.RGBA,n.width,n.height,0,e.RGBA,e.UNSIGNED_BYTE,n.data)):M().getNumber(`WEBGL_VERSION`)===2?X(e,()=>e.texSubImage2D(e.TEXTURE_2D,0,0,0,e.RGBA,e.UNSIGNED_BYTE,n)):X(e,()=>e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,n)),X(e,()=>e.bindTexture(e.TEXTURE_2D,null))}function TR(e,t,n,r){let i=e.createBuffer();X(e,()=>e.bindBuffer(e.PIXEL_PACK_BUFFER,i));let a=16*t*n;return X(e,()=>e.bufferData(e.PIXEL_PACK_BUFFER,a,e.STREAM_READ)),X(e,()=>e.readPixels(0,0,n,t,e.RGBA,e.FLOAT,0)),X(e,()=>e.bindBuffer(e.PIXEL_PACK_BUFFER,null)),i}function ER(e,t,n){let r=e,i=new Float32Array(n);return r.bindBuffer(r.PIXEL_PACK_BUFFER,t),r.getBufferSubData(r.PIXEL_PACK_BUFFER,0,i),r.bindBuffer(r.PIXEL_PACK_BUFFER,null),i}function DR(e,t,n,r){let[i,a]=YF(t,n),o=new Uint8Array(XF(t*n,4));return X(e,()=>e.readPixels(0,0,i,a,r.downloadTextureFormat,e.UNSIGNED_BYTE,o)),new Float32Array(o.buffer)}function OR(e,t,n,r,i,a,o,s){let c=e,l=new Float32Array($F(a,o));return c.bindBuffer(c.PIXEL_PACK_BUFFER,t),c.getBufferSubData(c.PIXEL_PACK_BUFFER,0,l),c.bindBuffer(c.PIXEL_PACK_BUFFER,null),l}function kR(e,t,n){let r=new Float32Array(t*n*4);return X(e,()=>e.readPixels(0,0,n,t,e.RGBA,e.FLOAT,r)),r}J();var AR=class{constructor(e){this.outputTexture=null,this.program=null,this.disposed=!1,this.itemsToPoll=[];let t=M().getNumber(`WEBGL_VERSION`);if(e==null?this.gl=UF(t):(this.gl=e,HF(t,e)),e=this.gl,M().getNumber(`WEBGL_VERSION`)===2){let t=e;this.createVertexArray=()=>X(t,()=>t.createVertexArray()),this.bindVertexArray=e=>X(t,()=>t.bindVertexArray(e)),this.deleteVertexArray=e=>X(t,()=>t.deleteVertexArray(e)),this.getVertexArray=()=>X(t,()=>t.getParameter(t.VERTEX_ARRAY_BINDING))}else if(e!=null){let t=e.getExtension(`OES_vertex_array_object`);if(t==null)throw Error(`All WebGL1 implementations are expected to offer OES_vertex_array_object.`);this.createVertexArray=()=>X(e,()=>t.createVertexArrayOES()),this.bindVertexArray=n=>X(e,()=>t.bindVertexArrayOES(n)),this.deleteVertexArray=n=>X(e,()=>t.deleteVertexArrayOES(n)),this.getVertexArray=()=>X(e,()=>e.getParameter(t.VERTEX_ARRAY_BINDING_OES))}let n=`WEBGL_color_buffer_float`,r=`EXT_color_buffer_half_float`;if(this.parallelCompilationExtension=this.gl.getExtension(`KHR_parallel_shader_compile`),M().getNumber(`WEBGL_VERSION`)===1){let e=`OES_texture_half_float`;if(this.textureFloatExtension=oI(this.gl,`OES_texture_float`),VI(this.gl,e))this.textureHalfFloatExtension=oI(this.gl,e);else if(M().get(`WEBGL_FORCE_F16_TEXTURES`))throw Error(`GL context does not support half float textures, yet the environment flag WEBGL_FORCE_F16_TEXTURES is set to true.`);if(this.colorBufferFloatExtension=this.gl.getExtension(n),VI(this.gl,r))this.colorBufferHalfFloatExtension=oI(this.gl,r);else if(M().get(`WEBGL_FORCE_F16_TEXTURES`))throw Error(`GL context does not support color renderable half floats, yet the environment flag WEBGL_FORCE_F16_TEXTURES is set to true.`)}else if(n=`EXT_color_buffer_float`,VI(this.gl,n))this.colorBufferFloatExtension=this.gl.getExtension(n);else if(VI(this.gl,r))this.colorBufferHalfFloatExtension=this.gl.getExtension(r);else throw Error(`GL context does not support color renderable floats`);this.vertexBuffer=lR(this.gl),this.indexBuffer=uR(this.gl),this.framebuffer=vI(this.gl),this.textureConfig=eI(this.gl,this.textureHalfFloatExtension)}get debug(){return M().getBool(`DEBUG`)}dispose(){if(this.disposed)return;this.program!=null&&console.warn(`Disposing a GPGPUContext that still has a bound WebGLProgram. This is probably a resource leak, delete the program with GPGPUContext.deleteProgram before disposing.`),this.outputTexture!=null&&console.warn(`Disposing a GPGPUContext that still has a bound output matrix texture.  This is probably a resource leak, delete the output matrix texture with GPGPUContext.deleteMatrixTexture before disposing.`);let e=this.gl;X(e,()=>e.finish()),X(e,()=>e.bindFramebuffer(e.FRAMEBUFFER,null)),X(e,()=>e.deleteFramebuffer(this.framebuffer)),X(e,()=>e.bindBuffer(e.ARRAY_BUFFER,null)),X(e,()=>e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,null)),X(e,()=>e.deleteBuffer(this.indexBuffer)),this.disposed=!0}createFloat32MatrixTexture(e,t){return this.throwIfDisposed(),pR(this.gl,e,t,this.textureConfig)}createFloat16MatrixTexture(e,t){return this.throwIfDisposed(),hR(this.gl,e,t,this.textureConfig)}createUnsignedBytesMatrixTexture(e,t){return this.throwIfDisposed(),_R(this.gl,e,t,this.textureConfig)}uploadPixelDataToTexture(e,t){this.throwIfDisposed(),wR(this.gl,e,t)}uploadDenseMatrixToTexture(e,t,n,r){this.throwIfDisposed(),CR(this.gl,e,t,n,r,this.textureConfig)}createFloat16PackedMatrixTexture(e,t){return this.throwIfDisposed(),xR(this.gl,e,t,this.textureConfig)}createPackedMatrixTexture(e,t){return this.throwIfDisposed(),yR(this.gl,e,t,this.textureConfig)}deleteMatrixTexture(e){this.throwIfDisposed(),this.outputTexture===e&&(TI(this.gl,this.framebuffer),this.outputTexture=null),X(this.gl,()=>this.gl.deleteTexture(e))}downloadByteEncodedFloatMatrixFromOutputTexture(e,t,n){return this.downloadMatrixDriver(e,()=>DR(this.gl,t,n,this.textureConfig))}downloadPackedMatrixFromBuffer(e,t,n,r,i,a){return OR(this.gl,e,t,n,r,i,a,this.textureConfig)}downloadFloat32MatrixFromBuffer(e,t){return ER(this.gl,e,t)}createBufferFromTexture(e,t,n){this.bindTextureToFrameBuffer(e);let r=TR(this.gl,t,n,this.textureConfig);return this.unbindTextureToFrameBuffer(),r}createAndWaitForFence(){let e=this.createFence(this.gl);return this.pollFence(e)}createFence(e){let t,n;if(M().getBool(`WEBGL_FENCE_API_ENABLED`)){let r=e,i=r.fenceSync(r.SYNC_GPU_COMMANDS_COMPLETE,0);e.flush(),n=()=>{let e=r.clientWaitSync(i,0,0);return e===r.ALREADY_SIGNALED||e===r.CONDITION_SATISFIED},t=i}else M().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`)>0?(t=this.beginQuery(),this.endQuery(),n=()=>this.isQueryAvailable(t,M().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`))):n=()=>!0;return{query:t,isFencePassed:n}}downloadMatrixFromPackedTexture(e,t,n){return this.downloadMatrixDriver(e,()=>kR(this.gl,t,n))}createProgram(e){this.throwIfDisposed();let t=this.gl;this.vertexShader??=cR(t);let n=dI(t);X(t,()=>t.attachShader(n,this.vertexShader)),X(t,()=>t.attachShader(n,e)),fI(t,n);let r=Object.assign(n,{vao:this.createVertexArray()});return this.debug&&pI(t,r),r}buildVao(e){this.setProgram(e),this.bindVertexArray(e.vao);let t=this.gl;X(t,()=>t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.indexBuffer)),SR(t,e,this.vertexBuffer)}deleteProgram(e){this.throwIfDisposed(),e===this.program&&(this.program=null),e!=null&&(X(this.gl,()=>this.gl.deleteProgram(e)),this.deleteVertexArray(e.vao))}setProgram(e){this.throwIfDisposed(),this.program=e,this.program!=null&&this.debug&&pI(this.gl,this.program),X(this.gl,()=>this.gl.useProgram(e))}getUniformLocation(e,t,n=!0){return this.throwIfDisposed(),n?xI(this.gl,e,t):SI(this.gl,e,t)}getAttributeLocation(e,t){return this.throwIfDisposed(),X(this.gl,()=>this.gl.getAttribLocation(e,t))}getUniformLocationNoThrow(e,t){return this.throwIfDisposed(),this.gl.getUniformLocation(e,t)}setInputMatrixTexture(e,t,n){this.throwIfDisposed(),this.throwIfNoProgram(),CI(this.gl,e,t,n)}setOutputMatrixTexture(e,t,n){this.setOutputMatrixTextureDriver(e,n,t)}setOutputPackedMatrixTexture(e,t,n){this.throwIfDisposed();let[r,i]=QF(t,n);this.setOutputMatrixTextureDriver(e,r,i)}setOutputMatrixWriteRegion(e,t,n,r){this.setOutputMatrixWriteRegionDriver(n,e,r,t)}setOutputPackedMatrixWriteRegion(e,t,n,r){throw Error(`setOutputPackedMatrixWriteRegion not implemented.`)}debugValidate(){this.program!=null&&pI(this.gl,this.program),EI(this.gl)}executeProgram(){this.throwIfDisposed(),this.throwIfNoProgram();let e=this.gl;if(this.debug){let e=this.getVertexArray();console.assert(e===this.program.vao,`VAO changed between setProgram and executeProgram!`),this.debugValidate()}X(e,()=>e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0))}blockUntilAllProgramsCompleted(){this.throwIfDisposed(),X(this.gl,()=>this.gl.finish())}getQueryTimerExtension(){return this.disjointQueryTimerExtension??=oI(this.gl,M().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`)===2?`EXT_disjoint_timer_query_webgl2`:`EXT_disjoint_timer_query`),this.disjointQueryTimerExtension}getQueryTimerExtensionWebGL2(){return this.getQueryTimerExtension()}getQueryTimerExtensionWebGL1(){return this.getQueryTimerExtension()}beginQuery(){if(M().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`)===2){let e=this.gl,t=this.getQueryTimerExtensionWebGL2(),n=e.createQuery();return e.beginQuery(t.TIME_ELAPSED_EXT,n),n}let e=this.getQueryTimerExtensionWebGL1(),t=e.createQueryEXT();return e.beginQueryEXT(e.TIME_ELAPSED_EXT,t),t}endQuery(){if(M().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`)===2){let e=this.gl,t=this.getQueryTimerExtensionWebGL2();e.endQuery(t.TIME_ELAPSED_EXT);return}let e=this.getQueryTimerExtensionWebGL1();e.endQueryEXT(e.TIME_ELAPSED_EXT)}async waitForQueryAndGetTime(e){return await ce(()=>this.disposed||this.isQueryAvailable(e,M().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`))),this.getQueryTime(e,M().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`))}getQueryTime(e,t){if(t===0)return null;if(t===2){let t=this.gl;return t.getQueryParameter(e,t.QUERY_RESULT)/1e6}else{let t=this.getQueryTimerExtensionWebGL1();return t.getQueryObjectEXT(e,t.QUERY_RESULT_EXT)/1e6}}isQueryAvailable(e,t){if(t===0)return!0;if(t===2){let t=this.gl,n=this.getQueryTimerExtensionWebGL2(),r=t.getQueryParameter(e,t.QUERY_RESULT_AVAILABLE);return this.disjoint??=this.gl.getParameter(n.GPU_DISJOINT_EXT),r&&!this.disjoint}else{let t=this.getQueryTimerExtensionWebGL1(),n=t.getQueryObjectEXT(e,t.QUERY_RESULT_AVAILABLE_EXT);return this.disjoint??=this.gl.getParameter(t.GPU_DISJOINT_EXT),n&&!this.disjoint}}pollFence(e){return new Promise(t=>{this.addItemToPoll(()=>e.isFencePassed(),()=>t())})}pollItems(){let e=jR(this.itemsToPoll.map(e=>e.isDoneFn));for(let t=0;t<=e;++t){let{resolveFn:e}=this.itemsToPoll[t];e()}this.itemsToPoll=this.itemsToPoll.slice(e+1)}addItemToPoll(e,t){if(this.itemsToPoll.push({isDoneFn:e,resolveFn:t}),this.itemsToPoll.length>1)return;let n;`setTimeoutCustom`in M().platform&&(n=M().platform.setTimeoutCustom.bind(M().platform)),ce(()=>(this.pollItems(),this.itemsToPoll.length===0),()=>0,null,n)}bindTextureToFrameBuffer(e){this.throwIfDisposed(),wI(this.gl,e,this.framebuffer),this.debug&&EI(this.gl)}unbindTextureToFrameBuffer(){this.outputTexture==null?TI(this.gl,this.framebuffer):(wI(this.gl,this.outputTexture,this.framebuffer),this.debug&&EI(this.gl))}downloadMatrixDriver(e,t){this.bindTextureToFrameBuffer(e);let n=t();return this.unbindTextureToFrameBuffer(),n}setOutputMatrixTextureDriver(e,t,n){this.throwIfDisposed();let r=this.gl;wI(r,e,this.framebuffer),this.debug&&EI(r),this.outputTexture=e,X(r,()=>r.viewport(0,0,t,n)),X(r,()=>r.scissor(0,0,t,n))}setOutputMatrixWriteRegionDriver(e,t,n,r){this.throwIfDisposed(),X(this.gl,()=>this.gl.scissor(e,t,n,r))}throwIfDisposed(){if(this.disposed)throw Error(`Attempted to use disposed GPGPUContext.`)}throwIfNoProgram(){if(this.program==null)throw Error(`No GPU program is currently set.`)}};function jR(e){let t=0;for(;t<e.length&&e[t]();++t);return t-1}var{addImpl:MR,bincountImpl:NR,bincountReduceImpl:PR,bitwiseAndImpl:FR,castImpl:IR,ceilImpl:LR,concatImpl:RR,equalImpl:zR,expImpl:BR,expm1Impl:VR,floorImpl:HR,gatherNdImpl:UR,gatherV2Impl:WR,greaterImpl:GR,greaterEqualImpl:KR,lessImpl:qR,lessEqualImpl:JR,linSpaceImpl:YR,logImpl:XR,maxImpl:ZR,maximumImpl:QR,minimumImpl:$R,multiplyImpl:ez,negImpl:tz,notEqualImpl:nz,prodImpl:rz,raggedGatherImpl:iz,raggedRangeImpl:az,raggedTensorToTensorImpl:oz,rangeImpl:sz,rsqrtImpl:cz,scatterImpl:lz,sigmoidImpl:uz,simpleAbsImpl:dz,sliceImpl:fz,sparseFillEmptyRowsImpl:pz,sparseReshapeImpl:mz,sparseSegmentReductionImpl:hz,sqrtImpl:gz,staticRegexReplaceImpl:_z,stridedSliceImpl:vz,stringNGramsImpl:yz,stringSplitImpl:bz,stringToHashBucketFastImpl:xz,subImpl:Sz,tileImpl:Cz,topKImpl:wz,transposeImpl:Tz,uniqueImpl:Ez}=tA;function Dz(e,t){return[`x`,`y`,`z`,`w`,`u`,`v`].slice(0,t).map(t=>`${e}.${t}`)}function Oz(e,t){return t===1?[e]:Dz(e,t)}function kz(e,t){if(e===1)return`rc`;let n=``;for(let r=0;r<e;r++)n+=t[r],r<e-1&&(n+=`,`);return n}var Az=class{constructor(e){if(this.variableNames=[`A`],this.packedInputs=!1,this.packedOutput=!0,this.outputShape=e,this.rank=e.length,this.enableShapeUniforms=eR(this.outputShape.length),this.rank===0)this.userCode=`
        void main() {
          setOutput(vec4(getA(), 0., 0., 0.));
        }
      `;else{let e=Oz(`rc`,this.rank),t=GL(this.rank),n=this.getOutOfBoundsCondition(e),r=this.getSetup(e),i=this.getOutput(e);this.userCode=`
        void main() {
          ${t} rc = getOutputCoords();

          if(${n}) {
            setOutput(vec4(0));
          } else {
            ${r}

            setOutput(vec4(${i}));
          }
        }
      `}}getSourceCoordsArr(e){let t=[];for(let n=0;n<=1;n++)for(let r=0;r<=1;r++){let i=`${n===0?`r`:`rp1`}, ${r===0?`c`:`cp1`}`;for(let t=2;t<this.rank;t++)i=`${e[e.length-1-t]},`+i;t.push(i)}return t}getOutOfBoundsCondition(e){if(this.rank===1)return`rc > ${this.enableShapeUniforms?`outShape`:this.outputShape[0]}`;let t=``;for(let n=this.rank-2;n<this.rank;n++)t+=`${e[n]} >= ${this.enableShapeUniforms?`outShape[${n}]`:this.outputShape[n]}`,n<this.rank-1&&(t+=`||`);return t}getSetup(e){if(this.rank===1)return``;let t=e.slice(-2),n=this.enableShapeUniforms?`outShape[${this.rank} - 1]`:this.outputShape[this.rank-1],r=this.enableShapeUniforms?`outShape[${this.rank} - 2]`:this.outputShape[this.rank-2];return`
      int r = ${t[0]};
      int c = ${t[1]};
      int rp1 = r + 1;
      int cp1 = c + 1;

      bool cEdge = cp1 >= ${n};
      bool rEdge = rp1 >= ${r};
    `}getOutput(e){let t=this.getSourceCoordsArr(e);return this.rank===1?`getA(rc), (rc + 1 >= ${this.enableShapeUniforms?`outShape`:this.outputShape[0]} ? 0. : getA(rc + 1)), 0, 0`:`getA(${t[0]}),
            cEdge ? 0. : getA(${t[1]}),
            rEdge ? 0. : getA(${t[2]}),
            rEdge || cEdge ? 0. : getA(${t[3]})`}},jz=class{constructor(e,t){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:`inputShape`,type:`ivec3`}],this.outputShape=e,this.enableShapeUniforms=eR(this.outputShape.length);let n=``;for(let e=0;e<4;e++){let t=`thisRC = rc;`;e%2==1&&(t+=`thisRC.z += 1;`),e>1&&(t+=`thisRC.y += 1;`),n+=`
        ${t}
        ${e>0?`if(thisRC.y < rows && thisRC.z < cols){`:``}
          int flatIndex = getFlatIndex(thisRC);

          ivec3 inputRC = inputCoordsFromReshapedOutCoords(flatIndex);
          vec2 inputRCInnerDims = vec2(float(inputRC.y),float(inputRC.z));

          result[${e}] =
            getChannel(getA(inputRC.x, inputRC.y, inputRC.z), inputRCInnerDims);
        ${e>0?`}`:``}
      `}this.userCode=`
      ${Mz(t,this.enableShapeUniforms)}
      ${this.enableShapeUniforms?tL():eL(e)}

      void main() {
        ivec3 rc = getOutputCoords();

        vec4 result = vec4(0.);

        ivec3 thisRC;
        int rows = ${this.enableShapeUniforms?`outShape[1]`:e[1]};
        int cols = ${this.enableShapeUniforms?`outShape[2]`:e[2]};

        ${n}

        setOutput(result);
      }
    `}};function Mz(e,t){return`
    ivec3 inputCoordsFromReshapedOutCoords(int index) {
      ${t?$I([`r`,`c`,`d`],`inputShape`):XI([`r`,`c`,`d`],e)}
      return ivec3(r, c, d);
    }
  `}J();var Nz=class{constructor(e){this.gpgpu=e,this.numUsedTextures=0,this.numFreeTextures=0,this._numBytesAllocated=0,this._numBytesFree=0,this.freeTextures={},this.usedTextures={},this.logEnabled=!1}acquireTexture(e,t,n){let r=Rz(t,n),i=zz(e,r,n);i in this.freeTextures||(this.freeTextures[i]=[]),i in this.usedTextures||(this.usedTextures[i]=[]);let a=Fz(e,r,this.gpgpu.gl,this.gpgpu.textureConfig,n);if(this.freeTextures[i].length>0){this.numFreeTextures--,this.numUsedTextures++,this._numBytesFree-=a,this.log();let e=this.freeTextures[i].pop();return this.usedTextures[i].push(e),e}let o;return r===JF.PACKED_2X2_FLOAT32?o=this.gpgpu.createPackedMatrixTexture(e[0],e[1]):r===JF.PACKED_2X2_FLOAT16?o=this.gpgpu.createFloat16PackedMatrixTexture(e[0],e[1]):r===JF.UNPACKED_FLOAT32?o=this.gpgpu.createFloat32MatrixTexture(e[0],e[1]):r===JF.UNPACKED_FLOAT16?o=this.gpgpu.createFloat16MatrixTexture(e[0],e[1]):r===JF.PACKED_4X1_UNSIGNED_BYTE&&(o=this.gpgpu.createUnsignedBytesMatrixTexture(e[0],e[1])),this.usedTextures[i].push(o),this.numUsedTextures++,this._numBytesAllocated+=a,this.log(),o}releaseTexture(e,t,n,r){if(this.freeTextures==null)return;let i=Rz(n,r),a=zz(t,i,r);a in this.freeTextures||(this.freeTextures[a]=[]);let o=Fz(t,i,this.gpgpu.gl,this.gpgpu.textureConfig,r),s=M().getNumber(`WEBGL_DELETE_TEXTURE_THRESHOLD`);s!==-1&&this._numBytesAllocated>s?(this.gpgpu.deleteMatrixTexture(e.texture),this._numBytesAllocated-=o):(this.freeTextures[a].push(e),this.numFreeTextures++,this._numBytesFree+=o),this.numUsedTextures--;let c=this.usedTextures[a],l=c&&c.indexOf(e);if(l==null||l<0)throw Error(`Cannot release a texture that was never provided by this texture manager`);c[l]=c[c.length-1],c.pop(),this.log()}log(){if(!this.logEnabled)return;let e=this.numFreeTextures+this.numUsedTextures;console.log(`Free/Used`,`${this.numFreeTextures} / ${this.numUsedTextures}`,`(${e})`);let t=this._numBytesFree/this._numBytesAllocated;console.log(`Bytes allocated: ${this._numBytesAllocated}`),console.log(`Bytes unused: ${this._numBytesFree} (${Math.round(100*t)}%)`)}get numBytesAllocated(){return this._numBytesAllocated}get numBytesFree(){return this._numBytesFree}getNumUsedTextures(){return this.numUsedTextures}getNumFreeTextures(){return this.numFreeTextures}dispose(){if(this.freeTextures!=null){for(let e in this.freeTextures)this.freeTextures[e].forEach(e=>{this.gpgpu.deleteMatrixTexture(e.texture)});for(let e in this.usedTextures)this.usedTextures[e].forEach(e=>{this.gpgpu.deleteMatrixTexture(e.texture)});this.freeTextures=null,this.usedTextures=null,this.numUsedTextures=0,this.numFreeTextures=0,this._numBytesAllocated=0,this._numBytesFree=0}}};function Pz(e,t){let n=e;if(t===n.R32F)return 4;if(t===n.R16F)return 2;if(t===n.RGBA32F||t===e.RGBA)return 16;if(t===n.RGBA16F)return 8;if(t===n.RGBA8)return 4;throw Error(`Unknown internal format ${t}`)}function Fz(e,t,n,r,i){let a=Iz(t,r),o;if(i){let[t,n]=QF(e[0],e[1]);o=t*n}else{let[t,n]=YF(e[0],e[1]);o=t*n}let s=Pz(n,a);return o*s}function Iz(e,t){switch(e){case JF.PACKED_2X2_FLOAT32:return vR(t);case JF.PACKED_2X2_FLOAT16:return bR(t);case JF.UNPACKED_FLOAT32:return fR(t);case JF.UNPACKED_FLOAT16:return mR(t);case JF.PACKED_4X1_UNSIGNED_BYTE:return gR(t);default:throw Error(`Unknown physical texture type ${e}`)}}function Lz(e){return M().getBool(`WEBGL_RENDER_FLOAT32_ENABLED`)?e?JF.PACKED_2X2_FLOAT32:JF.UNPACKED_FLOAT32:e?JF.PACKED_2X2_FLOAT16:JF.UNPACKED_FLOAT16}function Rz(e,t){if(e===qF.UPLOAD)return JF.PACKED_2X2_FLOAT32;if(e===qF.RENDER||e==null)return Lz(t);if(e===qF.DOWNLOAD||e===qF.PIXELS)return JF.PACKED_4X1_UNSIGNED_BYTE;throw Error(`Unknown logical texture type ${e}`)}function zz(e,t,n){return`${e[0]}_${e[1]}_${t}_${n}`}var Bz=class{constructor(e,t){this.variableNames=[`A`],this.outputShape=e,this.enableShapeUniforms=eR(this.outputShape.length),this.userCode=`
      float unaryOperation(float x) {
        ${t}
      }

      void main() {
        float x = getAAtOutCoords();
        float y = unaryOperation(x);

        setOutput(y);
      }
    `}},Vz=`if (isnan(x)) return x;`,Hz=`return x;`,Uz=`return abs(x);`,Wz=`return (x >= 0.0) ? x : (exp(x) - 1.0);`,Gz=Vz+`
  return (x < 0.0) ? 0.0 : x;
`,Kz=Vz+`
  return (x < 0.0) ? 0.0 : min(6.0, x);
`,qz=`return x;`,Jz=`return 1.0 / (1.0 + exp(-1.0 * x));`,Yz=`return x;`,Xz=`
  vec4 result;

  result.r = (x.r >= 0.0) ? x.r : (exp(x.r) - 1.0);
  result.g = (x.g >= 0.0) ? x.g : (exp(x.g) - 1.0);
  result.b = (x.b >= 0.0) ? x.b : (exp(x.b) - 1.0);
  result.a = (x.a >= 0.0) ? x.a : (exp(x.a) - 1.0);

  return result;
`,Zz=`
  vec4 result = x * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,Qz=`
  vec4 result = min(x, vec4(6.)) * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,$z=`return 1.0 / (1.0 + exp(-1.0 * x));`,eB=class{constructor(e,t){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=e,this.enableShapeUniforms=eR(this.outputShape.length),this.userCode=`
      vec4 unaryOperation(vec4 x) {
        ${t}
      }

      void main() {
        vec4 x = getAAtOutCoords();
        vec4 y = unaryOperation(x);

        setOutput(y);
      }
    `}},tB=class{constructor(e){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!1,this.outputShape=e,this.enableShapeUniforms=eR(this.outputShape.length);let t=e.length,n=Oz(`rc`,t),r=GL(t),i=kz(t,n),a=n.slice(-2),o=t<=1?`rc`:`vec2(${a.join(`,`)})`;this.userCode=`
      void main() {
        ${r} rc = getOutputCoords();
        vec4 packedInput = getA(${i});

        setOutput(getChannel(packedInput, ${o}));
      }
    `}};J();var nB=Qy,rB=1e-7,iB=1e-4,aB={};function oB(e){return e in aB||(aB[e]={}),aB[e]}var sB=M().getNumber(`CPU_HANDOFF_SIZE_THRESHOLD`),cB=600;function lB(){return M().global.screen==null?1024:M().global.screen.height*M().global.screen.width*window.devicePixelRatio*cB/1024/1024}var uB=class e extends g{nextDataId(){return e.nextDataId++}constructor(e){if(super(),this.pendingRead=new WeakMap,this.pendingDisposal=new WeakSet,this.dataRefCount=new WeakMap,this.numBytesInGPU=0,this.uploadWaitMs=0,this.downloadWaitMs=0,this.lastGlFlushTime=0,this.warnedAboutMemory=!1,this.pendingDeletes=0,this.disposed=!1,!M().getBool(`HAS_WEBGL`))throw Error(`WebGL is not supported on this device`);let t;e==null?(t=new AR(UF(M().getNumber(`WEBGL_VERSION`))),this.binaryCache=oB(M().getNumber(`WEBGL_VERSION`)),this.gpgpuCreatedLocally=!0):(t=e instanceof AR?e:new AR(UF(M().getNumber(`WEBGL_VERSION`),e)),this.binaryCache={},this.gpgpuCreatedLocally=!1),this.gpgpu=t,this.canvas=this.gpgpu.gl.canvas,this.textureManager=new Nz(this.gpgpu),this.numMBBeforeWarning=lB(),this.texData=new h(this,ho())}numDataIds(){return this.texData.numDataIds()-this.pendingDeletes}writeTexture(e,t,n,r,i,a){let o=this.makeTensorInfo(t,n),s=this.texData.get(o.dataId);s.isPacked=!1,s.texture={texture:e,texShape:[r,i]},s.texShape=[r,i];let c=new oR(MI(t),!1,a),l=this.runWebGLProgram(c,[o],n,[[r,i]]);return l.shape=t,s.texture=null,this.disposeIntermediateTensorInfo(o),l.dataId}write(e,t,n){if((M().getBool(`WEBGL_CHECK_NUMERICAL_PROBLEMS`)||M().getBool(`DEBUG`))&&this.checkNumericalProblems(e),n===`complex64`&&e!=null)throw Error(`Cannot write to a complex64 dtype. Please use tf.complex(real, imag).`);let r={id:this.nextDataId()};return this.texData.set(r,{shape:t,dtype:n,values:e,usage:qF.UPLOAD,refCount:1}),r}refCount(e){return this.texData.has(e)?this.texData.get(e).refCount:0}incRef(e){let t=this.texData.get(e);t.refCount++}decRef(e){if(this.texData.has(e)){let t=this.texData.get(e);t.refCount--}}move(e,t,n,r,i){if(M().getBool(`DEBUG`)&&this.checkNumericalProblems(t),r===`complex64`)throw Error(`Cannot write to a complex64 dtype. Please use tf.complex(real, imag).`);this.texData.set(e,{shape:n,dtype:r,values:t,usage:qF.UPLOAD,refCount:i})}disposeIntermediateTensorInfo(e){this.disposeData(e.dataId)}readSync(e){let{values:t,dtype:n,complexTensorInfos:r,slice:i,shape:a,isPacked:o}=this.texData.get(e);if(i!=null){let t;t=o?new eB(a,qz):new Bz(a,qz);let r=this.runWebGLProgram(t,[{dataId:e,shape:a,dtype:n}],n),i=this.readSync(r.dataId);return this.disposeIntermediateTensorInfo(r),i}if(t!=null)return this.convertAndCacheOnCPU(e);if(n===`string`)return t;let s=this.activeTimers!=null,c;s&&(c=Pi());let l;return l=n===`complex64`?OE(this.readSync(r.real.dataId),this.readSync(r.imag.dataId)):this.getValuesFromTexture(e),s&&(this.downloadWaitMs+=Pi()-c),this.convertAndCacheOnCPU(e,l)}async read(e){if(this.pendingRead.has(e)){let t=this.pendingRead.get(e);return new Promise(e=>t.push(e))}let{values:t,shape:n,slice:r,dtype:i,complexTensorInfos:a,isPacked:o}=this.texData.get(e);if(r!=null){let t;t=o?new eB(n,qz):new Bz(n,qz);let r=this.runWebGLProgram(t,[{dataId:e,shape:n,dtype:i}],i),a=this.read(r.dataId);return this.disposeIntermediateTensorInfo(r),a}if(t!=null)return this.convertAndCacheOnCPU(e);if(M().getBool(`DEBUG`)&&!M().getBool(`WEBGL_DOWNLOAD_FLOAT_ENABLED`)&&M().getNumber(`WEBGL_VERSION`)===2)throw Error(`tensor.data() with WEBGL_DOWNLOAD_FLOAT_ENABLED=false and WEBGL_VERSION=2 not yet supported.`);let s=null,c;if(i!==`complex64`&&M().get(`WEBGL_BUFFER_SUPPORTED`)){c=this.decode(e);let t=this.texData.get(c.dataId);s=this.gpgpu.createBufferFromTexture(t.texture.texture,...ZF(n))}this.pendingRead.set(e,[]),i!==`complex64`&&await this.gpgpu.createAndWaitForFence();let l;if(i===`complex64`){let e=await Promise.all([this.read(a.real.dataId),this.read(a.imag.dataId)]),t=e[0],n=e[1];l=OE(t,n)}else if(s==null)l=this.getValuesFromTexture(e);else{let e=O(n);l=this.gpgpu.downloadFloat32MatrixFromBuffer(s,e)}if(c!=null&&this.disposeIntermediateTensorInfo(c),s!=null){let e=this.gpgpu.gl;X(e,()=>e.deleteBuffer(s))}let u=this.convertAndCacheOnCPU(e,l),d=this.pendingRead.get(e);return this.pendingRead.delete(e),d.forEach(e=>e(u)),this.pendingDisposal.has(e)&&(this.pendingDisposal.delete(e),this.disposeData(e)&&ho().removeDataId(e,this),this.pendingDeletes--),u}readToGPU(e,t={}){let{values:n,shape:r,slice:i,dtype:a,isPacked:o,texture:s}=this.texData.get(e);if(a===`complex64`)throw Error(`Does not support reading texture for complex64 dtype.`);if(i!=null){let n;n=o?new eB(r,qz):new Bz(r,qz);let i=this.runWebGLProgram(n,[{dataId:e,shape:r,dtype:a}],a),s=this.readToGPU(i,t);return this.disposeIntermediateTensorInfo(i),s}if(s==null)throw Error(n==null?`There is no data on GPU or CPU.`:`Data is not on GPU but on CPU.`);let c=this.decode(e,t.customTexShape),l=ho().makeTensorFromTensorInfo(c),u=this.texData.get(c.dataId);return Object.assign({tensorRef:l},u.texture)}bufferSync(e){let t=this.readSync(e.dataId);if(e.dtype===`string`)try{let n=t.map(e=>Li(e));return V(e.shape,e.dtype,n)}catch{throw Error(`Failed to decode encoded string bytes into utf-8`)}return V(e.shape,e.dtype,t)}checkNumericalProblems(e){if(e!=null)for(let t=0;t<e.length;t++){let n=e[t];if(!iI(n))throw M().getBool(`WEBGL_RENDER_FLOAT32_CAPABLE`)?Error(`The value ${n} cannot be represented with your current settings. Consider enabling float32 rendering: 'tf.env().set('WEBGL_RENDER_FLOAT32_ENABLED', true);'`):Error(`The value ${n} cannot be represented on this device.`)}}getValuesFromTexture(e){let{shape:t,dtype:n,isPacked:r}=this.texData.get(e),i=O(t);if(M().getBool(`WEBGL_DOWNLOAD_FLOAT_ENABLED`)){let n=this.decode(e),r=this.texData.get(n.dataId),a=this.gpgpu.downloadMatrixFromPackedTexture(r.texture.texture,...ZF(t)).subarray(0,i);return this.disposeIntermediateTensorInfo(n),a}let a=M().getBool(`WEBGL_PACK`)&&r===!0,o=a?MI(t):t,s=a?new iR(o):new rR(o),c=this.runWebGLProgram(s,[{shape:o,dtype:n,dataId:e}],`float32`),l=this.texData.get(c.dataId),u=this.gpgpu.downloadByteEncodedFloatMatrixFromOutputTexture(l.texture.texture,l.texShape[0],l.texShape[1]).subarray(0,i);return this.disposeIntermediateTensorInfo(c),u}timerAvailable(){return M().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE`)>0}time(e){let t=this.activeTimers,n=[],r=!1;this.programTimersStack==null?(this.programTimersStack=n,r=!0):this.activeTimers.push(n),this.activeTimers=n,e();let i=zi(this.activeTimers.map(e=>e.query)).filter(e=>e!=null),a=zi(this.activeTimers.map(e=>e.name)).filter(e=>e!=null);this.activeTimers=t,r&&(this.programTimersStack=null);let o={uploadWaitMs:this.uploadWaitMs,downloadWaitMs:this.downloadWaitMs,kernelMs:null,wallMs:null};return(async()=>{if(M().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE`)>0){let e=await Promise.all(i);o.kernelMs=C(e),o.getExtraProfileInfo=()=>e.map((e,t)=>({name:a[t],ms:e})).map(e=>`${e.name}: ${e.ms}`).join(`, `)}else o.kernelMs={error:`WebGL query timers are not supported in this environment.`};return this.uploadWaitMs=0,this.downloadWaitMs=0,o})()}memory(){return{unreliable:!1,numBytesInGPU:this.numBytesInGPU,numBytesInGPUAllocated:this.textureManager.numBytesAllocated,numBytesInGPUFree:this.textureManager.numBytesFree}}startTimer(){return M().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE`)>0?this.gpgpu.beginQuery():{startMs:Pi(),endMs:null}}endTimer(e){return M().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE`)>0?(this.gpgpu.endQuery(),e):(e.endMs=Pi(),e)}async getQueryTime(e){if(M().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE`)>0)return this.gpgpu.waitForQueryAndGetTime(e);let t=e;return t.endMs-t.startMs}disposeData(e,t=!1){if(this.pendingDisposal.has(e))return!1;if(!this.texData.has(e))return!0;if(t?this.texData.get(e).refCount=0:this.texData.get(e).refCount--,!t&&this.texData.get(e).refCount>0)return!1;if(this.pendingRead.has(e))return this.pendingDisposal.add(e),this.pendingDeletes++,!1;this.releaseGPUData(e);let{complexTensorInfos:n}=this.texData.get(e);return n!=null&&(this.disposeData(n.real.dataId,t),this.disposeData(n.imag.dataId,t)),this.texData.delete(e),!0}releaseGPUData(e){let{texture:t,dtype:n,texShape:r,usage:i,isPacked:a,slice:o}=this.texData.get(e),s=o&&o.origDataId||e,c=this.dataRefCount.get(s);c>1?this.dataRefCount.set(s,c-1):(this.dataRefCount.delete(s),t!=null&&(this.numBytesInGPU-=this.computeBytes(r,n),this.textureManager.releaseTexture(t,r,i,a)));let l=this.texData.get(e);l.texture=null,l.texShape=null,l.isPacked=!1,l.slice=null}getTexture(e){return this.uploadToGPU(e),this.texData.get(e).texture.texture}getDataInfo(e){return this.texData.get(e)}shouldExecuteOnCPU(e,t=sB){return M().getBool(`WEBGL_CPU_FORWARD`)&&e.every(e=>this.texData.get(e.dataId).texture==null&&O(e.shape)<t)}getGPGPUContext(){return this.gpgpu}where(e){qr(`tf.where() in webgl locks the UI thread. Call tf.whereAsync() instead`);let t=e.dataSync();return nB(e.shape,t)}packedUnaryOp(e,t,n){let r=new eB(e.shape,t),i=this.compileAndRun(r,[e],n);return ho().makeTensorFromTensorInfo(i)}abs(e){if(this.shouldExecuteOnCPU([e])&&e.dtype!==`complex64`){let t=dz(this.texData.get(e.dataId).values);return this.makeOutput(e.shape,e.dtype,t)}if(M().getBool(`WEBGL_PACK_UNARY_OPERATIONS`))return this.packedUnaryOp(e,Uz,e.dtype);let t=new Bz(e.shape,Uz),n=this.compileAndRun(t,[e]);return ho().makeTensorFromTensorInfo(n)}makeTensorInfo(e,t,n){let r;if(t===`string`&&n!=null&&n.length>0&&ve(n[0])){let i=n.map(e=>Ii(e));r=this.write(i,e,t)}else r=this.write(n,e,t);return this.texData.get(r).usage=null,{dataId:r,shape:e,dtype:t}}makeOutput(e,t,n){return ho().makeTensorFromTensorInfo(this.makeTensorInfo(e,t,n),this)}unpackTensor(e){let t=new tB(e.shape);return this.runWebGLProgram(t,[e],e.dtype)}packTensor(e){let t=new Az(e.shape);return this.runWebGLProgram(t,[e],e.dtype,null,!0)}packedReshape(e,t){let n=[AI(e.shape),...jI(e.shape)],r={dtype:e.dtype,shape:n,dataId:e.dataId},i=new jz([AI(t),...jI(t)],n),a=[n],o=this.runWebGLProgram(i,[r],e.dtype,a,!0);return{dataId:o.dataId,shape:t,dtype:o.dtype}}decode(e,t){let{isPacked:n,shape:r,dtype:i}=this.texData.get(e);t!=null&&E(O(r)<=t[0]*t[1]*4,()=>`customTexShape is too small. Row * Column * 4 should be equal or larger than the size of the tensor data.`);let a=MI(r),o;o=n?new nR(a):new tR(a);let s=[t??ZF(a)];return{dtype:i,shape:r,dataId:this.runWebGLProgram(o,[{shape:a,dtype:i,dataId:e}],i,s,!0,t).dataId}}runWebGLProgram(e,t,n,r,i=!1,a){let o=this.makeTensorInfo(e.outputShape,n),s=this.texData.get(o.dataId);if(e.packedOutput&&(s.isPacked=!0),e.outPackingScheme===KF.DENSE&&(s.texShape=(a??ZF(e.outputShape)).map(e=>e*2)),e.outTexUsage!=null&&(s.usage=e.outTexUsage),O(o.shape)===0)return s.values=de(o.dtype,0),o;let c=[],l=t.map(t=>{if(t.dtype===`complex64`)throw Error(`GPGPUProgram does not support complex64 input. For complex64 dtypes, please separate the program into real and imaginary parts.`);let n=this.texData.get(t.dataId);if(n.texture==null){if(!e.packedInputs&&O(t.shape)<=M().getNumber(`WEBGL_SIZE_UPLOAD_UNIFORM`))return{shape:t.shape,texData:null,isUniform:!0,uniformValues:n.values};e.packedInputs&&(n.isPacked=!0,n.shape=t.shape)}if(this.uploadToGPU(t.dataId),!!n.isPacked!=!!e.packedInputs)t=n.isPacked?this.unpackTensor(t):this.packTensor(t),c.push(t),n=this.texData.get(t.dataId);else if(n.isPacked&&!FI(n.shape,t.shape)){let e=t,r=t.shape;t.shape=n.shape,t=this.packedReshape(t,r),c.push(t),n=this.texData.get(t.dataId),e.shape=r}return{shape:t.shape,texData:n,isUniform:!1}});this.uploadToGPU(o.dataId);let u={shape:o.shape,texData:s,isUniform:!1},d=$L(e,l,u),f=this.getAndSaveBinary(d,()=>YL(this.gpgpu,e,l,u)),p=this.activeTimers!=null,m;p&&(m=this.startTimer()),M().get(`ENGINE_COMPILE_ONLY`)||QL(this.gpgpu,f,l,u,r),c.forEach(e=>this.disposeIntermediateTensorInfo(e)),p&&(m=this.endTimer(m),this.activeTimers.push({name:e.constructor.name,query:this.getQueryTime(m)}));let h=M().getNumber(`WEBGL_FLUSH_THRESHOLD`);if(h>0){let e=Pi();e-this.lastGlFlushTime>h&&(this.gpgpu.gl.flush(),this.lastGlFlushTime=e)}if(!M().getBool(`WEBGL_LAZILY_UNPACK`)&&s.isPacked&&i===!1){let e=this.unpackTensor(o);return this.disposeIntermediateTensorInfo(o),e}return o}compileAndRun(e,t,n,r,i=!1){return n||=t[0].dtype,this.runWebGLProgram(e,t,n,r,i)}getAndSaveBinary(e,t){return e in this.binaryCache||(this.binaryCache[e]=t()),this.binaryCache[e]}getTextureManager(){return this.textureManager}dispose(){this.disposed||=(M().getBool(`IS_TEST`)||Object.keys(this.binaryCache).forEach(e=>{this.gpgpu.deleteProgram(this.binaryCache[e].webGLProgram),delete this.binaryCache[e]}),this.textureManager.dispose(),this.canvas!=null&&typeof HTMLCanvasElement<`u`&&this.canvas instanceof HTMLCanvasElement?this.canvas.remove():this.canvas=null,this.gpgpuCreatedLocally&&(this.gpgpu.program=null,this.gpgpu.dispose()),!0)}floatPrecision(){return this.floatPrecisionValue??=vo(()=>{if(!M().get(`WEBGL_RENDER_FLOAT32_ENABLED`)){let e=M().getBool(`DEBUG`);M().set(`DEBUG`,!1);let t=this.abs(Pf(1e-8)).dataSync()[0];if(M().set(`DEBUG`,e),t>0)return 32}return 16}),this.floatPrecisionValue}epsilon(){return this.floatPrecision()===32?rB:iB}uploadToGPU(e){let t=this.texData.get(e),{shape:n,dtype:r,values:i,texture:a,usage:o,isPacked:s}=t;if(a!=null)return;let c=this.activeTimers!=null,l;c&&(l=Pi());let u=t.texShape;if(u??(u=NI(n,s),t.texShape=u),i!=null){let e=MI(n),a,o=u[1],d=u[0],f=i instanceof Uint8Array||i instanceof Uint8ClampedArray;(s||!f)&&([o,d]=QF(u[0],u[1])),a=s?new sR(e,f):new oR(e,f);let p=f?[d,o]:u,m=this.makeTensorInfo(p,r),h=this.texData.get(m.dataId);f?h.usage=qF.PIXELS:h.usage=qF.UPLOAD,h.texShape=p,this.gpgpu.uploadDenseMatrixToTexture(this.getTexture(m.dataId),o,d,i);let g=[[d,o]],_=this.runWebGLProgram(a,[m],r,g,!0),v=this.texData.get(_.dataId);t.texShape=v.texShape,t.isPacked=v.isPacked,t.usage=v.usage,M().get(`ENGINE_COMPILE_ONLY`)?this.disposeData(_.dataId):(t.texture=v.texture,t.values=null,this.texData.delete(_.dataId)),this.disposeIntermediateTensorInfo(m),c&&(this.uploadWaitMs+=Pi()-l)}else t.texture=this.acquireTexture(u,o,r,s)}convertAndCacheOnCPU(e,t){let n=this.texData.get(e),{dtype:r}=n;return t!=null&&(n.values=dB(t,r)),n.values}acquireTexture(e,t,n,r){if(this.numBytesInGPU+=this.computeBytes(e,n),!this.warnedAboutMemory&&this.numBytesInGPU>this.numMBBeforeWarning*1024*1024){let e=(this.numBytesInGPU/1024/1024).toFixed(2);this.warnedAboutMemory=!0,console.warn(`High memory usage in GPU: ${e} MB, most likely due to a memory leak`)}return this.textureManager.acquireTexture(e,t,r)}computeBytes(e,t){return e[0]*e[1]*ge(t)}checkCompileCompletion(){for(let[,e]of Object.entries(this.binaryCache))this.checkCompletion_(e)}async checkCompileCompletionAsync(){let e=[];if(this.gpgpu.parallelCompilationExtension){for(let[,t]of Object.entries(this.binaryCache))e.push(this.checkCompletionAsync_(t));return Promise.all(e)}else{for(let[,t]of Object.entries(this.binaryCache)){let n=new Promise(e=>{try{this.checkCompletion_(t),e(!0)}catch(e){throw e}});e.push(n)}return Promise.all(e)}}async checkCompletionAsync_(e){return this.gpgpu.gl.getProgramParameter(e.webGLProgram,this.gpgpu.parallelCompilationExtension.COMPLETION_STATUS_KHR)?this.checkCompletion_(e):(await YT(),this.checkCompletionAsync_(e))}checkCompletion_(e){if(this.gpgpu.gl.getProgramParameter(e.webGLProgram,this.gpgpu.gl.LINK_STATUS)===!1)throw console.log(this.gpgpu.gl.getProgramInfoLog(e.webGLProgram)),this.gpgpu.gl.getShaderParameter(e.fragmentShader,this.gpgpu.gl.COMPILE_STATUS)===!1?(uI(e.source,this.gpgpu.gl.getShaderInfoLog(e.fragmentShader)),Error(`Failed to compile fragment shader.`)):Error(`Failed to link vertex and fragment shaders.`);return!0}getUniformLocations(){for(let e of Object.values(this.binaryCache)){this.gpgpu.buildVao(e.webGLProgram);let{variablesLocations:t,customUniformLocations:n,infLoc:r,nanLoc:i,outShapeLocation:a,outShapeStridesLocation:o,outTexShapeLocation:s}=XL(this.gpgpu,e.program,e.webGLProgram);e.variablesLocations=t,e.customUniformLocations=n,e.infLoc=r,e.nanLoc=i,e.outShapeLocation=a,e.outShapeStridesLocation=o,e.outTexShapeLocation=s}}createTensorFromGPUData(e,t,n){e.channels=e.channels||`RGBA`;let{texture:r,height:i,width:a,channels:o}=e,s=ho().backend;if(!s.gpgpu.gl.isTexture(r))throw Error(`The texture is invalid. Also, please make sure the texture and the TFJS WebGL backend are using the same canvas. If you want to use your own custom canvas, you have to create and use the custom TFJS WebGL backend created from the canvas through 'new tf.MathBackendWebGL(customCanvas)'.`);let c=s.writeTexture(r,t,n,i,a,o);return ho().makeTensorFromDataId(c,t,n,s)}};uB.nextDataId=0;function dB(e,t){if(t===`float32`||t===`complex64`)return e;if(t===`int32`||t===`bool`){let n=t===`int32`?new Int32Array(e.length):new Uint8Array(e.length);for(let t=0;t<n.length;++t)n[t]=Math.round(e[t]);return n}else throw Error(`Unknown dtype ${t}`)}J(),Va()&&Oo(`webgl`,()=>new uB,2),J();var fB=`
  if (isnan(a)) return a;
  if (isnan(b)) return b;
`,pB=class{constructor(e,t,n){this.variableNames=[`A`,`B`],this.outputShape=K(t,n),this.enableShapeUniforms=eR(this.outputShape.length),this.userCode=`
      float binaryOperation(float a, float b) {
        ${e}
      }

      void main() {
        float a = getAAtOutCoords();
        float b = getBAtOutCoords();
        setOutput(binaryOperation(a, b));
      }
    `}};J();var mB=`
  result.r = isNaN.r ? NAN : result.r;
  result.g = isNaN.g ? NAN : result.g;
  result.b = isNaN.b ? NAN : result.b;
  result.a = isNaN.a ? NAN : result.a;
`,hB=class{constructor(e,t,n,r=!1){this.variableNames=[`A`,`B`],this.supportsBroadcasting=!0,this.packedInputs=!0,this.packedOutput=!0,this.outputShape=K(t,n);let i=this.outputShape.length;this.enableShapeUniforms=eR(i);let a=``;if(r)if(i===0||O(this.outputShape)===1)a=`
          result.y = 0.;
          result.z = 0.;
          result.w = 0.;
        `;else if(a=`
          ${GL(i)} coords = getOutputCoords();
        `,i===1)this.enableShapeUniforms?a+=`
            result.y = (coords + 1) >= outShape ? 0. : result.y;
            result.z = 0.;
            result.w = 0.;
          `:a+=`
            result.y = (coords + 1) >= ${this.outputShape[0]} ? 0. : result.y;
            result.z = 0.;
            result.w = 0.;
          `;else{let e=Oz(`coords`,i);this.enableShapeUniforms?a+=`
            bool nextRowOutOfBounds =
              (${e[i-2]} + 1) >= outShape[${i} - 2];
            bool nextColOutOfBounds =
              (${e[i-1]} + 1) >= outShape[${i} - 1];
            result.y = nextColOutOfBounds ? 0. : result.y;
            result.z = nextRowOutOfBounds ? 0. : result.z;
            result.w = nextColOutOfBounds || nextRowOutOfBounds ? 0. : result.w;
          `:a+=`
            bool nextRowOutOfBounds =
              (${e[i-2]} + 1) >= ${this.outputShape[i-2]};
            bool nextColOutOfBounds =
              (${e[i-1]} + 1) >= ${this.outputShape[i-1]};
            result.y = nextColOutOfBounds ? 0. : result.y;
            result.z = nextRowOutOfBounds ? 0. : result.z;
            result.w = nextColOutOfBounds || nextRowOutOfBounds ? 0. : result.w;
          `}this.userCode=`
      vec4 binaryOperation(vec4 a, vec4 b) {
        ${e}
      }

      void main() {
        vec4 a = getAAtOutCoords();
        vec4 b = getBAtOutCoords();

        vec4 result = binaryOperation(a, b);
        ${a}

        setOutput(result);
      }
    `}};J();function gB(e){let{inputs:t,backend:n}=e,{x:r}=t;return n.incRef(r.dataId),{dataId:r.dataId,shape:r.shape,dtype:r.dtype}}var _B={kernelName:tn,backendName:`webgl`,kernelFunc:gB};J();function vB(e){let{inputs:t,backend:n}=e,{real:r,imag:i}=t,a=n.makeTensorInfo(r.shape,`complex64`),o=n.texData.get(a.dataId);return o.complexTensorInfos={real:gB({inputs:{x:r},backend:n}),imag:gB({inputs:{x:i},backend:n})},a}var yB={kernelName:_t,backendName:`webgl`,kernelFunc:vB};J();var bB=`return (a < 0.) ? b * a : a;`,xB=`
  vec4 aLessThanZero = vec4(lessThan(a, vec4(0.)));
  return (aLessThanZero * (b * a)) + ((vec4(1.0) - aLessThanZero) * a);
`;function SB(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{alpha:a}=r,o=n.makeTensorInfo([],`float32`,ji(a,`float32`)),s=M().getBool(`WEBGL_PACK_BINARY_OPERATIONS`)?new hB(xB,i.shape,o.shape):new pB(bB,i.shape,o.shape),c=n.runWebGLProgram(s,[i,o],`float32`);return n.disposeIntermediateTensorInfo(o),c}var CB={kernelName:cn,backendName:`webgl`,kernelFunc:SB};J();var wB=`return (a < 0.) ? b * a : a;`,TB=`
  vec4 aLessThanZero = vec4(lessThan(a, vec4(0.)));
  return (aLessThanZero * (b * a)) + ((vec4(1.0) - aLessThanZero) * a);
`;function EB(e){let{inputs:t,backend:n}=e,{x:r,alpha:i}=t,a=M().getBool(`WEBGL_PACK_BINARY_OPERATIONS`)?new hB(TB,r.shape,i.shape):new pB(wB,r.shape,i.shape);return n.runWebGLProgram(a,[r,i],`float32`)}var DB={kernelName:Vn,backendName:`webgl`,kernelFunc:EB};J();var OB=`if (isnan(x)) return x;`;function kB({opSnippet:e,packedOpSnippet:t,cpuKernelImpl:n,dtype:r}){return({inputs:i,backend:a})=>{let{x:o}=i,s=a,c=r||o.dtype;if(s.shouldExecuteOnCPU([o])&&n!=null){let e=n(s.texData.get(o.dataId).values,c);return s.makeTensorInfo(o.shape,c,e)}let l=M().getBool(`WEBGL_PACK_UNARY_OPERATIONS`)&&t!=null,u;return u=l?new eB(o.shape,t):new Bz(o.shape,e),s.runWebGLProgram(u,[o],c)}}function AB({opSnippet:e,packedOpSnippet:t,checkOutOfBounds:n=!1,supportsComplex:r=!1,cpuKernelImpl:i,dtype:a}){return({inputs:o,backend:s})=>{let{a:c,b:l}=o,u=s;if(r&&c.dtype===`complex64`){let t=u.texData.get(c.dataId),n=u.texData.get(l.dataId),[r,i]=[[t.complexTensorInfos.real,n.complexTensorInfos.real],[t.complexTensorInfos.imag,n.complexTensorInfos.imag]].map(t=>{let[n,r]=t,i={dataId:n.dataId,dtype:n.dtype,shape:c.shape},a={dataId:r.dataId,dtype:r.dtype,shape:l.shape},o=new pB(e,c.shape,l.shape);return u.runWebGLProgram(o,[i,a],fa(n.dtype,r.dtype))}),a=vB({inputs:{real:r,imag:i},backend:u});return u.disposeIntermediateTensorInfo(r),u.disposeIntermediateTensorInfo(i),a}let d=a||fa(c.dtype,l.dtype);if((c.dtype===`string`||l.dtype===`string`||u.shouldExecuteOnCPU([c,l]))&&i!=null){let e=u.texData.get(c.dataId).values,t=u.texData.get(l.dataId).values,n=c.dtype===`string`?_D(e):e,r=c.dtype===`string`?_D(t):t,[a,o]=i(c.shape,l.shape,n,r,d),s=u.makeTensorInfo(o,d),f=u.texData.get(s.dataId);return f.values=a,s}let f=M().getBool(`WEBGL_PACK_BINARY_OPERATIONS`)&&t!=null,p;return p=f?new hB(t,c.shape,l.shape,n):new pB(e,c.shape,l.shape),u.runWebGLProgram(p,[c,l],d)}}function jB(e,t=!1){if(e===`linear`)return t?Yz:Hz;if(e===`relu`)return t?Zz:Gz;if(e===`elu`)return t?Xz:Wz;if(e===`relu6`)return t?Qz:Kz;if(e===`prelu`)return t?TB:wB;if(e===`leakyrelu`)return t?xB:bB;if(e===`sigmoid`)return t?$z:Jz;throw Error(`Activation ${e} has not been implemented for the WebGL backend.`)}var MB=class{constructor(e,t,n,r=!1,i=!1,a=!1,o=null,s=!1,c=!1){this.variableNames=[`matrixA`,`matrixB`],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=n,this.enableShapeUniforms=eR(this.outputShape.length);let l=r?e[1]:e[2],u=Math.ceil(l/2),d=r?`i * 2, rc.y`:`rc.y, i * 2`,f=i?`rc.z, i * 2`:`i * 2, rc.z`,p=r?[`a.xxyy`,`a.zzww`]:[`a.xxzz`,`a.yyww`],m=i?[`b.xzxz`,`b.ywyw`]:[`b.xyxy`,`b.zwzw`],h=``,g=``;o&&(h=s?`vec4 activation(vec4 a) {
          vec4 b = getPreluActivationWeightsAtOutCoords();
          ${o}
        }`:c?`vec4 activation(vec4 a) {
          vec4 b = getLeakyreluAlphaAtOutCoords();
          ${o}
        }`:`vec4 activation(vec4 x) {
          ${o}
        }`,g=`result = activation(result);`);let _=a?`result += getBiasAtOutCoords();`:``;a&&this.variableNames.push(`bias`),s&&this.variableNames.push(`preluActivationWeights`),c&&this.variableNames.push(`leakyreluAlpha`);let v=`rc.x`,y=`rc.x`;e[0]<t[0]?v=`imod(rc.x, ${e[0]})`:t[0]<e[0]&&(y=`imod(rc.x, ${t[0]})`),this.userCode=`
      ${h}
      // Don't use uniform for sharedDimensionPacked for performance.
      const float sharedDimension = ${u}.0;

      vec4 dot2x2ARowBCol(ivec3 rc) {
        vec4 result = vec4(0);
        int batchA = ${v};
        int batchB = ${y};
        for (int i = 0; i < ${u}; i++) {
          vec4 a = getMatrixA(batchA, ${d});
          vec4 b = getMatrixB(batchB, ${f});

          // These swizzled products need to be separately added.
          // See: https://github.com/tensorflow/tfjs/issues/1735
          result += (${p[0]} * ${m[0]});
          result += (${p[1]} * ${m[1]});
        }
        return result;
      }

      void main() {
        ivec3 rc = getOutputCoords();
        vec4 result = dot2x2ARowBCol(rc);

        ${_}

        ${g}

        setOutput(result);
      }
    `}};J();var NB={REAL:`return areal * breal - aimag * bimag;`,IMAG:`return areal * bimag + aimag * breal;`},PB=class{constructor(e,t,n){this.variableNames=[`AReal`,`AImag`,`BReal`,`BImag`],this.outputShape=K(t,n),this.userCode=`
      float binaryOpComplex(
          float areal, float aimag, float breal, float bimag) {
        ${e}
      }

      void main() {
        float areal = getARealAtOutCoords();
        float aimag = getAImagAtOutCoords();
        float breal = getBRealAtOutCoords();
        float bimag = getBImagAtOutCoords();
        setOutput(binaryOpComplex(areal, aimag, breal, bimag));
      }
    `}};J();var FB=`return a * b;`;function IB(e){let{inputs:t,backend:n}=e,{a:r,b:i}=t,a=fa(r.dtype,i.dtype);if(r.dtype===`complex64`){let e=n.texData.get(r.dataId),t=n.texData.get(i.dataId),a=new PB(NB.REAL,r.shape,i.shape),o=new PB(NB.IMAG,r.shape,i.shape),s=[{dataId:e.complexTensorInfos.real.dataId,dtype:e.complexTensorInfos.real.dtype,shape:r.shape},{dataId:e.complexTensorInfos.imag.dataId,dtype:e.complexTensorInfos.imag.dtype,shape:r.shape},{dataId:t.complexTensorInfos.real.dataId,dtype:t.complexTensorInfos.real.dtype,shape:i.shape},{dataId:t.complexTensorInfos.imag.dataId,dtype:t.complexTensorInfos.imag.dtype,shape:i.shape}],c=n.runWebGLProgram(a,s,`float32`),l=n.runWebGLProgram(o,s,`float32`),u=vB({inputs:{real:c,imag:l},backend:n});return n.disposeIntermediateTensorInfo(c),n.disposeIntermediateTensorInfo(l),u}if(n.shouldExecuteOnCPU([r,i])){let e=n.texData.get(r.dataId),t=n.texData.get(i.dataId),[o,s]=ez(r.shape,i.shape,e.values,t.values,a),c=n.makeTensorInfo(s,a),l=n.texData.get(c.dataId);return l.values=o,c}let o;return o=M().getBool(`WEBGL_PACK_BINARY_OPERATIONS`)?new hB(FB,r.shape,i.shape):new pB(FB,r.shape,i.shape),n.runWebGLProgram(o,[r,i],a)}var LB={kernelName:jn,backendName:`webgl`,kernelFunc:IB};function RB(e,t,n){let r=[AI(e.shape),...jI(e.shape)],i={dtype:e.dtype,shape:r,dataId:e.dataId},a=new jz([AI(t),...jI(t)],r),o=[r],s=n.runWebGLProgram(a,[i],e.dtype,o,!0);return{dataId:s.dataId,shape:t,dtype:s.dtype}}J();function Q(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{shape:a}=r,o=n,s=O(i.shape),c=le(a,s),l=O(c);E(s===l,()=>`The new shape (${c}) has ${l} elements and the old shape (${i.shape}) has ${s} elements. The new shape and old shape must have the same number of elements.`);let u=o.texData.get(i.dataId);return u.isPacked&&!FI(i.shape,c)&&!(u.texture!==null&&FI(u.shape,c))?RB(i,c,o):(o.incRef(i.dataId),{dataId:i.dataId,shape:c,dtype:i.dtype})}var zB={kernelName:Xn,backendName:`webgl`,kernelFunc:Q};J();var BB=class{constructor(e,t){this.variableNames=[`x`];let{windowSize:n,batchSize:r,inSize:i,outSize:a}=e;this.outputShape=[r,a];let o=Math.floor(n/4)*4,s=n%4,c=`sumValue += dot(values, ones);`;if(t!=null){let e=1/t;c=`sumValue += dot(values * ${re(e)?e.toPrecision(2):e}, ones);`}let l=``;i%n>0&&(l=`
        if (inIdx < 0 || inIdx >= ${i}) {
          return 0.0;
        }
      `),this.userCode=`
      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);

      float getValue(int batch, int inIdx) {
        ${l}
        return getX(batch, inIdx);
      }

      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];
        int outIdx = coords[1];
        int inOffset = outIdx * ${n};

        float sumValue = 0.0;

        for (int i = 0; i < ${o}; i += 4) {
          int inIdx = inOffset + i;
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            getValue(batch, inIdx + 3)
          );

          ${c}
        }

        int inIdx = inOffset + ${o};
        if (${s===1}) {
          vec4 values = vec4(getValue(batch, inIdx), 0.0, 0.0, 0.0);

          ${c}
        } else if (${s===2}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1), 0.0, 0.0);

          ${c}
        } else if (${s===3}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2), 0.0);

          ${c}
        }
        setOutput(sumValue);
      }
    `}},VB=class{constructor(e,t){this.variableNames=[`x`];let{windowSize:n,batchSize:r,inSize:i,outSize:a}=e;this.outputShape=[r,a];let o=`0.0`,s=``;t===`prod`?o=`1.0`:t===`min`?(o=`1.0 / 1e-20`,s=`min`):t===`max`&&(o=`-1.0 / 1e-20`,s=`max`);let c=`${t}(${t}(${t}(minMaxValue[0], minMaxValue[1]), minMaxValue[2]), minMaxValue[3])`;t===`sum`?c=`sumValue`:t===`prod`?c=`prodValue`:t===`all`?c=`allValue`:t===`any`&&(c=`anyValue`);let l=Math.floor(n/4)*4,u=n%4,d=`
      if (${t===`sum`}) {
        sumValue += dot(values, ones);
      } else if (${t===`prod`}) {
        vec2 tmp = vec2(values[0], values[1]) * vec2(values[2], values[3]);
        prodValue *= tmp[0] * tmp[1];
      } else {
        minMaxValue = ${s}(values, minMaxValue);
        if (${t===`min`} || ${t===`max`}) {
          minMaxValue = ${s}(values, minMaxValue);
          bvec4 isNaN = isnan(values);
          if (isNaN.r || isNaN.g || isNaN.b || isNaN.a) {
            minMaxValue = vec4(NAN);
          }
        }
      }
    `,f=`vec4`;t===`all`?(o=`1.0`,d=`
        bool reducedAllValue = all(values);
        float floatedReducedAllValue = float(reducedAllValue);
        allValue = float(allValue >= 1.0 && floatedReducedAllValue >= 1.0);
      `,f=`bvec4`):t===`any`&&(o=`0.0`,d=`
        bool reducedAnyValue = any(values);
        float floatedReducedAnyValue = float(reducedAnyValue);
        anyValue = float(anyValue >= 1.0 || floatedReducedAnyValue >= 1.0);
      `,f=`bvec4`);let p=``;i%n>0&&(p=`
        if (inIdx < 0 || inIdx >= ${i}) {
          return initializationValue;
        }
      `),this.userCode=`
      const float initializationValue = ${o};
      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);

      float getValue(int batch, int inIdx) {
        ${p}
        return getX(batch, inIdx);
      }

      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];
        int outIdx = coords[1];
        int inOffset = outIdx * ${n};

        vec4 minMaxValue = vec4(${o});
        float prodValue = 1.0;
        float sumValue = 0.0;
        float allValue = 1.0;
        float anyValue = 0.0;

        for (int i = 0; i < ${l}; i += 4) {
          int inIdx = inOffset + i;
          ${f} values = ${f}(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            getValue(batch, inIdx + 3)
          );

          ${d}
        }

        int inIdx = inOffset + ${l};
        if (${u===1}) {
          ${f} values = ${f}(
            getValue(batch, inIdx),
            initializationValue,
            initializationValue,
            initializationValue
          );

          ${d}
        } else if (${u===2}) {
          ${f} values = ${f}(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            initializationValue,
            initializationValue
          );

          ${d}
        } else if (${u===3}) {
          ${f} values = ${f}(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            initializationValue
          );

          ${d}
        }
        setOutput(${c});
      }
    `}};J();function HB(e){let t=[];for(;t.length===0||t[t.length-1].outSize!==1;){let n=t.length?t[t.length-1].outSize:e[1],r=cE(n);t.push({inSize:n,windowSize:r,outSize:Math.ceil(n/r)})}return t}function UB(e,t,n,r){let i=HB(e.shape),a=e;for(let o=0;o<i.length;o++){let{inSize:s,windowSize:c,outSize:l}=i[o],u,d;u=n===`mean`?o===0?new BB({windowSize:c,inSize:s,batchSize:e.shape[0],outSize:l},s):new BB({windowSize:c,inSize:s,batchSize:e.shape[0],outSize:l}):new VB({windowSize:c,inSize:s,batchSize:e.shape[0],outSize:l},n),d=a,a=r.runWebGLProgram(u,[a],t),d.dataId!==e.dataId&&r.disposeIntermediateTensorInfo(d)}return a}var WB=class{constructor(e,t){this.variableNames=[`A`];let n=Array(e.length);for(let r=0;r<n.length;r++)n[r]=e[t[r]];this.outputShape=n,this.rank=n.length;let r=GL(this.rank),i=GB(t);this.userCode=`
    void main() {
      ${r} resRC = getOutputCoords();
      setOutput(getA(${i}));
    }
    `}};function GB(e){let t=e.length;if(t>6)throw Error(`Transpose for rank ${t} is not yet supported`);let n=[`resRC.x`,`resRC.y`,`resRC.z`,`resRC.w`,`resRC.u`,`resRC.v`],r=Array(t);for(let t=0;t<e.length;t++)r[e[t]]=n[t];return r.join()}var KB=class{constructor(e,t){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0;let n=Array(e.length);for(let r=0;r<n.length;r++)n[r]=e[t[r]];if(this.outputShape=n,this.rank=n.length,this.rank>6)throw Error(`Packed transpose for rank ${this.rank} is not yet supported.`);let r=GL(this.rank),i=Dz(`rc`,this.rank),a=Array(this.rank);for(let e=0;e<t.length;e++)a[t[e]]=i[e];let o=`vec2(${a.slice(-2).join()})`,s=`++${i[this.rank-1]} < ${n[this.rank-1]}`,c=`getChannel(getA(${a.join()}), ${o})`;this.userCode=`
    void main() {
      ${r} rc = getOutputCoords();
      vec4 result = vec4(0.);
      result[0] = ${c};
      if(${s}) {
        result[1] = ${c};
      }
      --${i[this.rank-1]};
      if(++${i[this.rank-2]} < ${n[this.rank-2]}) {
        result[2] = ${c};
        if(${s}) {
          result[3] = ${c};
        }
      }
      setOutput(result);
    }
    `}};J();function qB(e,t,n){let r=M().getBool(`WEBGL_PACK_ARRAY_OPERATIONS`)?new KB(e.shape,t):new WB(e.shape,t);return n.runWebGLProgram(r,[e],e.dtype)}J();function JB(e,t,n,r){let i=t,a=e.shape.length,o=A(i,e.shape),s=o,c=xf(s,a),l=c!=null,u=e;l&&(u=qB(e,c,r),s=Cf(s.length,a)),bf(`sum`,s,a);let[d,f]=vf(u.shape,s),p=d;n&&(p=yf(d,o));let m=O(f),h=O(e.shape)/m,g=Q({inputs:{x:u},attrs:{shape:[h,m]},backend:r}),_=UB(g,pa(e.dtype),`sum`,r),v=Q({inputs:{x:_},attrs:{shape:p},backend:r});return r.disposeIntermediateTensorInfo(g),r.disposeIntermediateTensorInfo(_),l&&r.disposeIntermediateTensorInfo(u),v}J();function YB(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r;return JB(i,a,o,n)}var XB={kernelName:`Sum`,backendName:`webgl`,kernelFunc:YB};J();function ZB(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{perm:a}=r,o=n,s=i.shape.length,c=Array(s);for(let e=0;e<c.length;e++)c[e]=i.shape[a[e]];let l;if(o.shouldExecuteOnCPU([i])){let e=o.texData.get(i.dataId).values,t=Tz(e,i.shape,i.dtype,a,c);l=o.makeTensorInfo(c,i.dtype);let n=o.texData.get(l.dataId);n.values=t}else l=qB(i,a,o);return l}var QB={kernelName:Fr,backendName:`webgl`,kernelFunc:ZB};J();function $B({a:e,b:t,transposeA:n,transposeB:r,backend:i,bias:a=null,preluActivationWeights:o=null,leakyreluAlpha:s=0,activation:c=null}){let l=e.shape.length,u=t.shape.length,d=n?e.shape[l-2]:e.shape[l-1],f=r?t.shape[u-1]:t.shape[u-2],p=n?e.shape[l-1]:e.shape[l-2],m=r?t.shape[u-2]:t.shape[u-1],h=e.shape.slice(0,-2),g=t.shape.slice(0,-2),_=O(h),v=O(g),y=K(e.shape.slice(0,-2),t.shape.slice(0,-2)).concat([p,m]);E(d===f,()=>`Error in matMul: inner shapes (${d}) and (${f}) of Tensors with shapes ${e.shape} and ${t.shape} and transposeA=${n} and transposeB=${r} must match.`);let b=n?[_,d,p]:[_,p,d],x=r?[v,m,f]:[v,f,m],S=Q({inputs:{x:e},backend:i,attrs:{shape:b}}),C=Q({inputs:{x:t},backend:i,attrs:{shape:x}}),w=[S,C],T=Math.max(_,v),D=n?S.shape[1]:S.shape[2],ee=a!=null,te=o!=null,ne=c===`leakyrelu`,k=c==null?null:jB(c,!0),re=ee||te||ne||k!=null,ie;if((p===1||m===1)&&D>1e3&&re===!1){let e=S,t=C;n&&(e=ZB({inputs:{x:S},backend:i,attrs:{perm:[0,2,1]}}),w.push(e)),r&&(t=ZB({inputs:{x:C},backend:i,attrs:{perm:[0,2,1]}}),w.push(t));let a=m!==1,o=m===1,s=e;a&&(s=Q({inputs:{x:e},backend:i,attrs:{shape:[T,D,1]}}),w.push(s));let c=m===1?2:1,l=t;o&&(l=Q({inputs:{x:t},backend:i,attrs:{shape:[T,1,D]}}),w.push(l));let u=IB({inputs:{a:s,b:l},backend:i});ie=YB({inputs:{x:u},backend:i,attrs:{axis:c,keepDims:!0}}),w.push(u)}else{let c=fa(e.dtype,t.dtype),l=new MB(b,x,[T,p,m],n,r,ee,k,te,ne),u=[S,C];if(a!=null&&u.push(a),te&&u.push(o),ne){let e=i.makeTensorInfo([],`float32`,ji(s,`float32`));u.push(e),w.push(e)}ie=i.runWebGLProgram(l,u,c)}let ae=Q({inputs:{x:ie},backend:i,attrs:{shape:y}});w.push(ie);for(let e of w)i.disposeIntermediateTensorInfo(e);return ae}J();function eV(e){let{inputs:t,backend:n,attrs:r}=e,{a:i,b:a,bias:o,preluActivationWeights:s}=t,{transposeA:c,transposeB:l,activation:u,leakyreluAlpha:d}=r;return $B({a:i,b:a,transposeA:c,transposeB:l,backend:n,bias:o,preluActivationWeights:s,leakyreluAlpha:d,activation:u})}var tV={kernelName:Wr,backendName:`webgl`,kernelFunc:eV};J();var nV=`return abs(x);`;function rV(e){let{inputs:t,backend:n}=e,{x:r}=t;if(n.shouldExecuteOnCPU([r])&&r.dtype!==`complex64`){let e=dz(n.texData.get(r.dataId).values);return n.makeTensorInfo(r.shape,r.dtype,e)}let i;return i=M().getBool(`WEBGL_PACK_UNARY_OPERATIONS`)?new eB(r.shape,nV):new Bz(r.shape,nV),n.runWebGLProgram(i,[r],r.dtype)}var iV={kernelName:`Abs`,backendName:`webgl`,kernelFunc:rV};J();var aV=kB({opSnippet:Vz+`
  if (abs(x) > 1.) {
    return NAN;
  }
  return acos(x);
`}),oV={kernelName:Je,backendName:`webgl`,kernelFunc:aV};J();var sV=kB({opSnippet:Vz+`
  if (x < 1.0) return NAN;
return log(x + sqrt(x * x - 1.0));`}),cV={kernelName:Ye,backendName:`webgl`,kernelFunc:sV};J();var lV=`return a + b;`,uV={kernelName:`Add`,backendName:`webgl`,kernelFunc:AB({opSnippet:lV,packedOpSnippet:lV,supportsComplex:!0,cpuKernelImpl:MR})},dV=class{constructor(e,t){this.outputShape=[],this.outputShape=e,this.variableNames=t.map((e,t)=>`T${t}`);let n=[];this.variableNames.forEach(e=>{n.push(`float v${e} = get${e}AtOutCoords();`)});let r=this.variableNames.map(e=>`v${e}`).join(` + `);this.userCode=`
      void main() {
        ${n.join(`
        `)}

        float result = ${r};
        setOutput(result);
      }
    `}},fV=class{constructor(e,t){this.outputShape=[],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=e,this.variableNames=t.map((e,t)=>`T${t}`);let n=[];this.variableNames.forEach(e=>{n.push(`vec4 v${e} = get${e}AtOutCoords();`)});let r=this.variableNames.map(e=>`v${e}`).join(` + `);this.userCode=`
      void main() {
        ${n.join(`
        `)}

        vec4 result = ${r};
        setOutput(result);
      }
    `}};J();function pV(e){let{inputs:t,backend:n}=e,r=t;if(r.length===1)return gB({inputs:{x:r[0]},backend:n});if(r.length>M().getNumber(`WEBGL_MAX_TEXTURES_IN_SHADER`)){let e=Math.floor(r.length/2);return pV({inputs:[pV({inputs:r.slice(0,e),backend:n}),pV({inputs:r.slice(e),backend:n})],backend:n})}let i=r.map(e=>e.dtype).reduce((e,t)=>fa(e,t)),a=r.map(e=>e.shape),o=M().getBool(`WEBGL_PACK`)?new fV(r[0].shape,a):new dV(r[0].shape,a);return n.runWebGLProgram(o,r,i)}var mV={kernelName:Xe,backendName:`webgl`,kernelFunc:pV};J();function hV(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r,s=i.shape.length,c=A(a,i.shape),l=c,u=xf(l,s),d=i;u!=null&&(d=ZB({inputs:{x:i},backend:n,attrs:{perm:u}}),l=Cf(l.length,s)),bf(`all`,l,s);let[f,p]=vf(d.shape,l),m=O(p),h=Q({inputs:{x:d},backend:n,attrs:{shape:[-1,m]}}),g=UB(h,h.dtype,`all`,n),_;if(o){let e=yf(f,c);_=Q({inputs:{x:g},backend:n,attrs:{shape:e}})}else _=Q({inputs:{x:g},backend:n,attrs:{shape:f}});return n.disposeIntermediateTensorInfo(h),n.disposeIntermediateTensorInfo(g),u!=null&&n.disposeIntermediateTensorInfo(d),_}var gV={kernelName:`All`,backendName:`webgl`,kernelFunc:hV};J();function _V(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r,s=i.shape.length,c=A(a,i.shape),l=c,u=xf(l,s),d=i;u!=null&&(d=ZB({inputs:{x:i},backend:n,attrs:{perm:u}}),l=Cf(l.length,s)),bf(`any`,l,s);let[f,p]=vf(d.shape,l),m=O(p),h=Q({inputs:{x:d},backend:n,attrs:{shape:[-1,m]}}),g=UB(h,h.dtype,`any`,n),_;if(o){let e=yf(f,c);_=Q({inputs:{x:g},backend:n,attrs:{shape:e}})}else _=Q({inputs:{x:g},backend:n,attrs:{shape:f}});return n.disposeIntermediateTensorInfo(h),n.disposeIntermediateTensorInfo(g),u!=null&&n.disposeIntermediateTensorInfo(d),_}var vV={kernelName:`Any`,backendName:`webgl`,kernelFunc:_V},yV=class{constructor(e,t,n){this.variableNames=[`A`];let{windowSize:r,batchSize:i,outSize:a}=e;n||this.variableNames.push(`bestIndicesA`),this.outputShape=[i,a];let o=t===`max`?`>`:`<`,s=n?`inOffset + i;`:`round(getBestIndicesA(batch, inOffset + i));`;this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];
        int outIdx = coords[1];
        int inOffset = outIdx * ${r};

        int bestIndex = inOffset;
        float bestValue = getA(batch, bestIndex);

        for (int i = 0; i < ${r}; i++) {
          int inIdx = ${s};
          float candidate = getA(batch, inIdx);
          if (candidate ${o} bestValue) {
            bestValue = candidate;
            bestIndex = inIdx;
          }
        }
        setOutput(float(bestIndex));
      }
    `}};J();var bV=class{constructor(e,t,n,r){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,E(e.length>2,()=>`Packed arg${n.charAt(0).toUpperCase()+n.slice(1)} supports only inputs with rank above 2.`);let i=e[e.length-1],a=Math.ceil(i/t);this.outputShape=e.slice(0,-1),a>1&&this.outputShape.push(a),r||this.variableNames.push(`bestIndicesA`);let o=this.outputShape,s=o.length,c=GL(s),l=Oz(`coords`,s),u,d;if(a===1){d=s+1;let e=GL(d);u=`
        ${e} sourceLocR = ${e}(${l.join()}, 0);
        ++${l[s-1]};
        ${e} sourceLocG = ${e}(${l.join()}, 0);
        ++${l[s-2]};
        ${e} sourceLocA = ${e}(${l.join()}, 0);
        --${l[s-1]};
        ${e} sourceLocB = ${e}(${l.join()}, 0);
        --${l[s-2]};`}else d=s,u=`
        ${c} sourceLocR = coords;
        ++${l[s-1]};
        ${c} sourceLocG = coords;
        ++${l[s-2]};
        ${c} sourceLocA = coords;
        --${l[s-1]};
        ${c} sourceLocB = coords;
        --${l[s-2]};`;let f=[`x`,`y`,`z`,`w`,`u`,`v`].slice(0,d),p=`.`+f[d-1],m=f.map(e=>`int `+e),h=Oz(`sourceLocR`,d-1).concat(`inIdx.r`),g=Oz(`sourceLocG`,d-1).concat(`inIdx.g`),_=Oz(`sourceLocB`,d-1).concat(`inIdx.b`),v=Oz(`sourceLocA`,d-1).concat(`inIdx.a`),y=n===`max`?`greaterThan`:`lessThan`,b=r?``:`
          inIdx = round(vec4(getBestIndicesAChannel(${h.join()}),
                             getBestIndicesAChannel(${g.join()}),
                             getBestIndicesAChannel(${_.join()}),
                             getBestIndicesAChannel(${v.join()})));`,x=`vec4(
            getAChannel(${h.join()}),
            hasNextCol ? getAChannel(${g.join()}) : 0.,
            hasNextRow ? getAChannel(${_.join()}) : 0.,
            hasNextRow && hasNextCol ? getAChannel(${v.join()}) : 0.)`,S=r?``:`
      float getBestIndicesAChannel(${m.join()}) {
        return getChannel(getBestIndicesA(${f.join()}),
                                          vec2(${f.slice(-2).join()}));
      }`;this.userCode=`
      float getAChannel(${m.join()}) {
        return getChannel(getA(${f.join()}),
                               vec2(${f.slice(-2).join()}));
      }
      ${S}
      void main() {
        ${c} coords = getOutputCoords();
        bool hasNextCol = ${l[s-1]} < ${o[s-1]-1};
        bool hasNextRow = ${l[s-2]} < ${o[s-2]-1};
        ${u}
        ivec4 srcIdx = ivec4(sourceLocR${p}, sourceLocG${p},
          sourceLocB${p}, sourceLocA${p}) * ${t};
        ivec4 inIdx = srcIdx;
        vec4 bestIndex = vec4(inIdx);
        vec4 bestValue = ${x};

        for (int i = 0; i < ${t}; i++) {
          inIdx = srcIdx;
          ${b}
          vec4 candidate = ${x};
          bvec4 nan = isnan(candidate);
          bvec4 replace = bvec4(
            vec4(${y}(candidate, bestValue)) * (vec4(1.0) - vec4(nan)));

          bestValue = vec4(replace.x  ? candidate.x : bestValue.x,
                           replace.y  ? candidate.y : bestValue.y,
                           replace.z  ? candidate.z : bestValue.z,
                           replace.w  ? candidate.w : bestValue.w);
          bestIndex = mix(bestIndex, vec4(inIdx), vec4(replace));
          srcIdx++;
        }
        setOutput(bestIndex);
      }
    `}};J();function xV(e,t,n,r=null){let i=t.shape[0],a=t.shape[1];r!=null&&(i=r.shape[0],a=r.shape[1]);let o=cE(a),s=new yV({windowSize:o,inSize:a,batchSize:i,outSize:Math.ceil(a/o)},n,r==null),c=[t];r!=null&&c.push(r);let l=e.runWebGLProgram(s,c,`int32`);if(l.shape[1]===1)return l;let u=xV(e,t,n,l);return e.disposeIntermediateTensorInfo(l),u}function SV(e,t,n,r=null){let i=r==null?t.shape:r.shape,a=i[i.length-1],o=new bV(i,cE(a),n,r==null),s=r==null?[t]:[t,r],c=e.runWebGLProgram(o,s,`int32`);if(c.shape.length===t.shape.length){let r=SV(e,t,n,c);return e.disposeIntermediateTensorInfo(c),r}return c}function CV(e,t,n,r){let i=[n];if(bf(`arg`+r.charAt(0).toUpperCase()+r.slice(1),i,t.shape.length),!M().getBool(`WEBGL_PACK_REDUCE`)||t.shape.length<=2){let n=[],a=e.texData.get(t.dataId),o=a!==null&&a.isPacked,s=t;o&&(s=e.unpackTensor(t),n.push(s));let[c,l]=vf(s.shape,i),u=O(l),d=Q({inputs:{x:s},backend:e,attrs:{shape:[-1,u]}});n.push(d);let f=xV(e,d,r);n.push(f);let p=Q({inputs:{x:f},backend:e,attrs:{shape:c}});return n.forEach(t=>e.disposeIntermediateTensorInfo(t)),p}return SV(e,t,r)}J();function wV(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a}=r,o=A(a,i.shape),s=xf(o,i.shape.length),c=i,l=[];s!=null&&(c=ZB({inputs:{x:i},backend:n,attrs:{perm:s}}),l.push(c),o=Cf(o.length,c.shape.length)),bf(`argMax`,[o[0]],c.shape.length);let u=CV(n,c,o[0],`max`);return l.forEach(e=>n.disposeIntermediateTensorInfo(e)),u}var TV={kernelName:Ze,backendName:`webgl`,kernelFunc:wV};J();function EV(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a}=r,o=A(a,i.shape),s=xf(o,i.shape.length),c=i,l=[];s!=null&&(c=ZB({inputs:{x:i},backend:n,attrs:{perm:s}}),l.push(c),o=Cf(o.length,c.shape.length)),bf(`argMin`,[o[0]],c.shape.length);let u=CV(n,c,o[0],`min`);return l.forEach(e=>n.disposeIntermediateTensorInfo(e)),u}var DV={kernelName:Qe,backendName:`webgl`,kernelFunc:EV};J();var OV=kB({opSnippet:Vz+`
  if (abs(x) > 1.) {
    return NAN;
  }
  return asin(x);
`}),kV={kernelName:$e,backendName:`webgl`,kernelFunc:OV};J();var AV=kB({opSnippet:Vz+`return log(x + sqrt(x * x + 1.0));`}),jV={kernelName:et,backendName:`webgl`,kernelFunc:AV};J();var MV=kB({opSnippet:Vz+`
  return atan(x);
`}),NV={kernelName:tt,backendName:`webgl`,kernelFunc:MV};J();var PV=AB({opSnippet:fB+`
  return atan(a, b);
`,packedOpSnippet:`
  vec4 result = atan(a, b);
  bvec4 isNaNA = isnan(a);
  bvec4 isNaNB = isnan(b);
  bvec4 isNaN = bvec4(isNaNA.x || isNaNB.x, isNaNA.y || isNaNB.y, isNaNA.z || isNaNB.z, isNaNA.w || isNaNB.w);
  `+mB+`
  return result;
`}),FV={kernelName:rt,backendName:`webgl`,kernelFunc:PV};J();var IV=kB({opSnippet:Vz+`
  if ((x < -1.0) || (x > 1.0)) return NAN;
return (log(1.0 + x) - log(1.0 - x)) / 2.0;`}),LV={kernelName:nt,backendName:`webgl`,kernelFunc:IV},RV=class{constructor(e,t,n,r=!1,i=!1){if(this.variableNames=[`x`],t===`avg`&&n)throw Error(`Cannot compute positions for average pool.`);let a=e.filterWidth,o=e.strideHeight,s=e.strideWidth,c=e.dilationHeight,l=e.dilationWidth,u=e.effectiveFilterHeight,d=e.effectiveFilterWidth,f=e.padInfo.top,p=e.padInfo.left;this.outputShape=e.outShape;let m=t===`avg`,h=`((batch  * ${e.inHeight} + xR) * ${e.inWidth} + xC) * ${e.inChannels} + d`,g=`(xR * ${e.inWidth} + xC) * ${e.inChannels} + d`,_=`0.0`;if(m||(_=`-1.0 / 1e-20`),n){this.userCode=`
        const ivec2 strides = ivec2(${o}, ${s});
        const ivec2 pads = ivec2(${f}, ${p});

        void main() {
          ivec4 coords = getOutputCoords();
          int batch = coords[0];
          int d = coords[3];

          ivec2 xRCCorner = coords.yz * strides - pads;
          int xRCorner = xRCCorner.x;
          int xCCorner = xRCCorner.y;

          // max/min x(?, ?, d) to get y(yR, yC, d).
          // ? = to be determined
          float minMaxValue = 0.0;
          float minMaxValueFound = 0.0;
          int minMaxPosition = 0;
          float avgValue = 0.0;

          for (int wR = 0; wR < ${u};
              wR += ${c}) {
            int xR = xRCorner + wR;

            if (xR < 0 || xR >= ${e.inHeight}) {
              continue;
            }

            for (int wC = 0; wC < ${d};
                wC += ${l}) {
              int xC = xCCorner + wC;

              if (xC < 0 || xC >= ${e.inWidth}) {
                continue;
              }

              float value = getX(batch, xR, xC, d);

              // If a min / max value has already been found, use it. If not,
              // use the current value.
              float currMinMaxValue = mix(
                  value, minMaxValue, minMaxValueFound);
              if (value >= currMinMaxValue) {
                minMaxValue = value;
                minMaxValueFound = 1.0;
                minMaxPosition = ${r?i?h:g:`wR * ${d} + wC`};
              }
            }
          }
          setOutput(float(minMaxPosition));
        }
      `;return}let v=`${t}(${t}(${t}(minMaxValue[0], minMaxValue[1]), minMaxValue[2]), minMaxValue[3])`;t===`avg`&&(v=`avgValue / max(count, 1.0)`);let y=Math.floor(a/4)*4,b=a%4,x=`
      if (${m}) {
        avgValue += dot(values, ones);
      } else {
        minMaxValue = max(values, minMaxValue);
      }
    `;this.userCode=`
      const ivec2 strides = ivec2(${o}, ${s});
      const ivec2 pads = ivec2(${f}, ${p});
      const float initializationValue = ${_};
      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);

      float count = 0.0;

      float getValue(int batch, int xR, int xC, int d) {
        if (xC < 0 || xC >= ${e.inWidth}) {
          return initializationValue;
        }
        count += 1.0;
        return getX(batch, xR, xC, d);
      }

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d = coords[3];

        ivec2 xRCCorner = coords.yz * strides - pads;
        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        // max/min x(?, ?, d) to get y(yR, yC, d).
        // ? = to be determined
        vec4 minMaxValue = vec4(${_});
        float avgValue = 0.0;
        count = 0.0;

        for (int wR = 0; wR < ${u};
            wR += ${c}) {
          int xR = xRCorner + wR;

          if (xR < 0 || xR >= ${e.inHeight}) {
            continue;
          }

          for (int wC = 0; wC < ${y}; wC += 4) {
            int xC = xCCorner + wC * ${l};

            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              getValue(batch, xR, xC + ${l}, d),
              getValue(batch, xR, xC + 2 * ${l}, d),
              getValue(batch, xR, xC + 3 * ${l}, d)
            );

            ${x}
          }

          int xC = xCCorner + ${y};
          if (${b===1}) {
            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              initializationValue,
              initializationValue,
              initializationValue
            );

            ${x}
          } else if (${b===2}) {
            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              getValue(batch, xR, xC + ${l}, d),
              initializationValue,
              initializationValue
            );

            ${x}
          } else if (${b===3}) {
            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              getValue(batch, xR, xC + ${l}, d),
              getValue(batch, xR, xC + 2 * ${l}, d),
              initializationValue
            );

            ${x}
          }
        }
        setOutput(${v});
      }
    `}},zV=class{constructor(e,t,n,r=!1,i=!1){if(this.variableNames=[`x`],t===`avg`&&n)throw Error(`Cannot compute positions for average pool.`);let a=e.filterWidth,o=e.strideDepth,s=e.strideHeight,c=e.strideWidth,l=e.dilationDepth,u=e.dilationHeight,d=e.dilationWidth,f=e.effectiveFilterDepth,p=e.effectiveFilterHeight,m=e.effectiveFilterWidth,h=e.padInfo.front,g=e.padInfo.top,_=e.padInfo.left;this.outputShape=e.outShape;let v=t===`avg`,y=`0.0`;if(v||(y=`-1.0 / 1e-20`),n){this.userCode=`
        const ivec3 strides =
            ivec3(${o}, ${s}, ${c});
        const ivec3 pads = ivec3(${h}, ${g}, ${_});

        void main() {
          ivec5 coords = getOutputCoords();
          int batch = coords.x;
          int ch = coords.u;

          ivec3 xCorner = ivec3(coords.y, coords.z, coords.w) * strides - pads;
          int xDCorner = xCorner.x;
          int xRCorner = xCorner.y;
          int xCCorner = xCorner.z;

          // max/min x(?, ?, ?, ch) to get y(yD, yR, yC, ch).
          // ? = to be determined
          float minMaxValue = 0.0;
          float minMaxValueFound = 0.0;
          int minMaxPosition = 0;

          for (int wD = 0; wD < ${f};
              wD += ${l}) {
            int xD = xDCorner + wD;

            if (xD < 0 || xD >= ${e.inDepth}) {
              continue;
            }

            for (int wR = 0; wR < ${p};
                wR += ${u}) {
              int xR = xRCorner + wR;

              if (xR < 0 || xR >= ${e.inHeight}) {
                continue;
              }

              for (int wC = 0; wC < ${m};
                  wC += ${d}) {
                int xC = xCCorner + wC;

                if (xC < 0 || xC >= ${e.inWidth}) {
                  continue;
                }

                float value = getX(batch, xD, xR, xC, ch);

                // If a min / max value has already been found, use it. If not,
                // use the current value.
                float currMinMaxValue = mix(
                    value, minMaxValue, minMaxValueFound);
                if (value >= currMinMaxValue) {
                  minMaxValue = value;
                  minMaxValueFound = 1.0;
                  minMaxPosition = ${r?i?`(((batch * ${e.inDepth} + xD) * ${e.inHeight} + xR) * ${e.inWidth} + xC) * ${e.inChannels} + ch`:`((xD * ${e.inHeight} + xR) * ${e.inWidth} + xC) * ${e.inChannels} + ch`:`wD * ${p} * ${m} +
                      wR * ${m} + wC`};
                }
              }
            }
          }
          setOutput(float(minMaxPosition));
        }
      `;return}let b=`${t}(${t}(${t}(minMaxValue[0], minMaxValue[1]), minMaxValue[2]), minMaxValue[3])`;t===`avg`&&(b=`avgValue / max(count, 1.0)`);let x=Math.floor(a/4)*4,S=a%4,C=`
      if (${v}) {
        avgValue += dot(values, ones);
      } else {
        minMaxValue = max(values, minMaxValue);
      }
    `;this.userCode=`
      const ivec3 strides =
        ivec3(${o}, ${s}, ${c});
      const ivec3 pads = ivec3(${h}, ${g}, ${_});
      const float initializationValue = ${y};
      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);

      float count = 0.0;

      float getValue(int batch, int xD, int xR, int xC, int ch) {
        if (xC < 0 || xC >= ${e.inWidth}) {
          return initializationValue;
        }
        count += 1.0;
        return getX(batch, xD, xR, xC, ch);
      }

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int ch = coords.u;

        ivec3 xCorner = ivec3(coords.y, coords.z, coords.w) * strides - pads;
        int xDCorner = xCorner.x;
        int xRCorner = xCorner.y;
        int xCCorner = xCorner.z;

        // max/min x(?, ?, ?, d) to get y(yD, yR, yC, ch).
        // ? = to be determined
        vec4 minMaxValue = vec4(${y});
        float avgValue = 0.0;
        count = 0.0;

        for (int wD = 0; wD < ${f};
            wD += ${l}) {
          int xD = xDCorner + wD;

          if (xD < 0 || xD >= ${e.inDepth}) {
            continue;
          }

          for (int wR = 0; wR < ${p};
            wR += ${u}) {
            int xR = xRCorner + wR;

            if (xR < 0 || xR >= ${e.inHeight}) {
              continue;
            }

            for (int wC = 0; wC < ${x}; wC += 4) {
              int xC = xCCorner + wC * ${d};

              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                getValue(batch, xD, xR, xC + ${d}, ch),
                getValue(batch, xD, xR, xC + 2 * ${d}, ch),
                getValue(batch, xD, xR, xC + 3 * ${d}, ch)
              );

              ${C}
            }

            int xC = xCCorner + ${x};
            if (${S===1}) {
              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                initializationValue,
                initializationValue,
                initializationValue
              );

              ${C}
            } else if (${S===2}) {
              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                getValue(batch, xD, xR, xC + ${d}, ch),
                initializationValue,
                initializationValue
              );

              ${C}
            } else if (${S===3}) {
              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                getValue(batch, xD, xR, xC + ${d}, ch),
                getValue(batch, xD, xR, xC + 2 * ${d}, ch),
                initializationValue
              );

              ${C}
            }
          }
        }
        setOutput(${b});
      }
    `}};J();function BV(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t;JI(i,`avgPool`);let{filterSize:a,strides:o,pad:s,dimRoundingMode:c}=r;E(yl(o,1),()=>`Error in avgPool: Either strides or dilations must be 1. Got strides ${o} and dilations '1'`);let l=al(i.shape,a,o,1,s,c);if(l.filterWidth===1&&l.filterHeight===1&&k(l.inShape,l.outShape))return gB({inputs:{x:i},backend:n});let u=new RV(l,`avg`,!1);return n.runWebGLProgram(u,[i],`float32`)}var VV={kernelName:it,backendName:`webgl`,kernelFunc:BV};J();function HV(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{filterSize:a,strides:o,pad:s,dimRoundingMode:c,dataFormat:l}=r,u=new zV(ol(i.shape,a,o,[1,1,1],s,c,l),`avg`,!1);return n.runWebGLProgram(u,[i],`float32`)}var UV={kernelName:ot,backendName:`webgl`,kernelFunc:HV},WV=class{constructor(e){this.variableNames=[`dy`],this.outputShape=e.inShape;let t=e.filterHeight,n=e.filterWidth,r=e.strideHeight,i=e.strideWidth,a=e.dilationHeight,o=e.dilationWidth,s=e.effectiveFilterHeight,c=e.effectiveFilterWidth,l=s-1-e.padInfo.top,u=c-1-e.padInfo.left,d=1/(t*n);this.userCode=`
      const ivec2 pads = ivec2(${l}, ${u});
      const float avgMultiplier = float(${d});

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];

        ivec2 dyRCCorner = coords.yz - pads;
        int dyRCorner = dyRCCorner.x;
        int dyCCorner = dyRCCorner.y;

        // Convolve dy(?, ?, d) with pos mask(:, :, d) to get dx(xR, xC, d).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < ${s};
            wR += ${a}) {
          float dyR = float(dyRCorner + wR) / ${r}.0;

          if (dyR < 0.0 || dyR >= ${e.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          for (int wC = 0; wC < ${c};
            wC+= ${o}) {
            float dyC = float(dyCCorner + wC) / ${i}.0;

            if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            float dyValue = getDy(b, idyR, idyC, d);

            dotProd += dyValue * avgMultiplier;
          }
        }
        setOutput(dotProd);
      }
    `}},GV=class{constructor(e){this.variableNames=[`dy`],this.outputShape=e.inShape;let t=e.filterDepth,n=e.filterHeight,r=e.filterWidth,i=e.strideDepth,a=e.strideHeight,o=e.strideWidth,s=e.dilationDepth,c=e.dilationHeight,l=e.dilationWidth,u=e.effectiveFilterDepth,d=e.effectiveFilterHeight,f=e.effectiveFilterWidth,p=u-1-e.padInfo.front,m=d-1-e.padInfo.top,h=f-1-e.padInfo.left,g=1/(t*n*r);this.userCode=`
      const ivec3 pads = ivec3(${p}, ${m}, ${h});
      const float avgMultiplier = float(${g});

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int ch = coords.u;

        ivec3 dyCorner = ivec3(coords.y, coords.z, coords.w) - pads;
        int dyDCorner = dyCorner.x;
        int dyRCorner = dyCorner.y;
        int dyCCorner = dyCorner.z;

        // Convolve dy(?, ?, ?, d) with pos mask(:, :, :, ch) to get
        // dx(xD, xR, xC, ch).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;

        for (int wD = 0; wD < ${u};
            wD += ${s}) {
          float dyD = float(dyDCorner + wD) / ${i}.0;

          if (dyD < 0.0 || dyD >= ${e.outDepth}.0 || fract(dyD) > 0.0) {
            continue;
          }
          int idyD = int(dyD);

          for (int wR = 0; wR < ${d};
              wR += ${c}) {
            float dyR = float(dyRCorner + wR) / ${a}.0;

            if (dyR < 0.0 || dyR >= ${e.outHeight}.0 ||
                fract(dyR) > 0.0) {
              continue;
            }
            int idyR = int(dyR);

            for (int wC = 0; wC < ${f};
                wC += ${l}) {
              float dyC = float(dyCCorner + wC) / ${o}.0;

              if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                  fract(dyC) > 0.0) {
                continue;
              }
              int idyC = int(dyC);

              float dyValue = getDy(batch, idyD, idyR, idyC, ch);

              dotProd += dyValue * avgMultiplier;
            }
          }
        }
        setOutput(dotProd);
      }
    `}};J();function KV(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a}=t,o=a,{filterSize:s,strides:c,pad:l,dimRoundingMode:u}=r,d=new GV(ol(o.shape,s,c,[1,1,1],l,u));return n.runWebGLProgram(d,[i],o.dtype)}var qV={kernelName:st,backendName:`webgl`,kernelFunc:KV};J();function JV(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a}=t,o=a;JI([i,a],`avgPoolGrad`);let{filterSize:s,strides:c,pad:l}=r,u=new WV(al(o.shape,s,c,1,l));return n.runWebGLProgram(u,[i],o.dtype)}var YV={kernelName:at,backendName:`webgl`,kernelFunc:JV};J();function XV(e){let{inputs:t,backend:n,attrs:r}=e,{a:i,b:a}=t,{transposeA:o,transposeB:s}=r;return $B({a:i,b:a,transposeA:o,transposeB:s,backend:n})}var ZV={kernelName:ct,backendName:`webgl`,kernelFunc:XV};J();var QV=class{constructor(e,t,n,r,i,a){this.outputShape=[],this.variableNames=[`x`,`mean`,`variance`],K(e,t),K(e,n);let o=`0.0`;r!=null&&(K(e,r),this.variableNames.push(`offset`),o=`getOffsetAtOutCoords()`);let s=`1.0`;i!=null&&(K(e,i),this.variableNames.push(`scale`),s=`getScaleAtOutCoords()`),this.outputShape=e,this.userCode=`
      void main() {
        float x = getXAtOutCoords();
        float mean = getMeanAtOutCoords();
        float variance = getVarianceAtOutCoords();
        float offset = ${o};
        float scale = ${s};
        float inv = scale * inversesqrt(variance + float(${a}));
        setOutput(dot(vec3(x, -mean, offset), vec3(inv, inv, 1)));
      }
    `}};J();var $V=class{constructor(e,t,n,r,i,a){this.packedInputs=!0,this.packedOutput=!0,this.variableNames=[`x`,`mean`,`variance`],K(e,t),K(e,n);let o=`vec4(0.0)`;r!=null&&(K(e,r),this.variableNames.push(`offset`),o=`getOffsetAtOutCoords()`);let s=`vec4(1.0)`;i!=null&&(K(e,i),this.variableNames.push(`scale`),s=`getScaleAtOutCoords()`),this.outputShape=e,this.userCode=`
      void main() {
        vec4 offset = ${o};
        vec4 scale = ${s};

        vec4 x = getXAtOutCoords();
        vec4 mean = getMeanAtOutCoords();
        vec4 variance = getVarianceAtOutCoords();

        vec4 inv = scale * inversesqrt(variance + vec4(${a}));

        setOutput((x - mean) * inv + offset);
      }
    `}};J();var eH={kernelName:Xt,backendName:`webgl`,kernelFunc:({inputs:e,backend:t,attrs:n})=>{let{x:r,mean:i,variance:a,offset:o,scale:s}=e;E(i.shape.length===a.shape.length,()=>`Batch normalization gradient requires mean and variance to have equal ranks.`),E(o==null||i.shape.length===o.shape.length,()=>`Batch normalization gradient requires mean and offset to have equal ranks.`),E(s==null||i.shape.length===s.shape.length,()=>`Batch normalization gradient requires mean and scale to have equal ranks.`);let{varianceEpsilon:c}=n;c??=.001;let l=[r,i,a],u=null;o!=null&&(u=o.shape,l.push(o));let d=null;s!=null&&(d=s.shape,l.push(s));let f=M().getBool(`WEBGL_PACK_NORMALIZATION`)?new $V(r.shape,i.shape,a.shape,u,d,c):new QV(r.shape,i.shape,a.shape,u,d,c);return t.runWebGLProgram(f,l,l[0].dtype)}},tH=class{constructor(e){this.variableNames=[`source`],this.outputShape=e,this.rank=e.length;let t=GL(this.rank);this.customUniforms=[{name:`start`,arrayIndex:this.rank,type:`int`}];let n=rH(this.rank),r;r=`
        ${t} sourceLoc;
        ${t} coords = getOutputCoords();
        ${e.map((e,t)=>`sourceLoc.${nH[t]} = start[${t}] + coords.${nH[t]};`).join(`
`)}
      `,this.userCode=`
      void main() {
        ${r}
        setOutput(getSource(${n}));
      }
    `}},nH=[`x`,`y`,`z`,`w`,`u`,`v`];function rH(e){if(e===1)return`sourceLoc`;if(e<=6)return nH.slice(0,e).map(e=>`sourceLoc.`+e).join(`,`);throw Error(`Slicing for rank ${e} is not yet supported`)}var iH=class{constructor(e){this.variableNames=[`source`],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=e,this.rank=e.length,this.customUniforms=[{name:`start`,arrayIndex:this.rank,type:`int`}];let t=GL(this.rank),n=Oz(`coords`,this.rank),r=Oz(`sourceLoc`,this.rank),i=this.rank===1?`sourceLoc`:`vec2(${r.slice(-2).join()})`,a=`getChannel(getSource(${r.join()}), ${i})`,o=`
      result.x = ${a};
      if (++${n[this.rank-1]} < ${e[this.rank-1]}) {
        ++${r[this.rank-1]};
        result.y = ${a};
        --${r[this.rank-1]};
      }
    `,s=this.rank===1?``:`
      --${n[this.rank-1]};
      if (++${n[this.rank-2]} < ${e[this.rank-2]}) {
        ++${r[this.rank-2]};
        result.z = ${a};
        if (++${n[this.rank-1]} < ${e[this.rank-1]}) {
          ++${r[this.rank-1]};
          result.w = ${a};
        }
      }
    `,c=this.rank<=4?`sourceLoc = coords +
            ${t}(${e.map((e,t)=>`start[${t}]`).join()});`:e.map((e,t)=>`${r[t]} = ${n[t]} + start[${t}];`).join(`
`);this.userCode=`
      void main() {
        ${t} coords = getOutputCoords();
        ${t} sourceLoc;
        ${c}
        vec4 result = vec4(0.);
        ${o}
        ${s}
        setOutput(result);
      }
    `}};J();function aH(e,t,n,r){let i=r.texData.get(e.dataId),a=r.makeTensorInfo(n,e.dtype),o=r.texData.get(a.dataId);Object.assign(o,i),o.refCount=1,o.shape=n,o.dtype=e.dtype;let s=FT(t,j(e.shape));i.slice&&(s+=i.slice.flatOffset),o.slice={flatOffset:s,origDataId:i.slice&&i.slice.origDataId||e.dataId};let c=r.dataRefCount.get(o.slice.origDataId)||1;return r.dataRefCount.set(o.slice.origDataId,c+1),a}function oH(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{begin:a,size:o}=r,[s,c]=IT(i,a,o);if(ST(i,s,c),O(c)===0)return n.makeTensorInfo(c,i.dtype,[]);if(n.shouldExecuteOnCPU([i])||i.dtype===`string`){let e=fz(n.texData.get(i.dataId).values,s,c,i.shape,i.dtype);return n.makeTensorInfo(c,i.dtype,e)}let{isPacked:l}=n.texData.get(i.dataId),u=PT(i.shape,s,c);if(l||!u){let e=M().getBool(`WEBGL_PACK_ARRAY_OPERATIONS`)?new iH(c):new tH(c),t=[s];return n.runWebGLProgram(e,[i],i.dtype,t)}return n.uploadToGPU(i.dataId),aH(i,s,c,n)}var sH={kernelName:ur,backendName:`webgl`,kernelFunc:oH};J();var cH={kernelName:lt,backendName:`webgl`,kernelFunc:e=>{let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{blockShape:a,crops:o}=r;E(i.shape.length<=4,()=>`batchToSpaceND for rank > 4 with a WebGL backend not implemented yet`);let s=a.reduce((e,t)=>e*t),c=fE(i.shape,a,s),l=pE(c.length,a.length),u=mE(i.shape,a,s),d=hE(o,a.length),f=gE(u,o,a.length),p=[],m=Q({inputs:{x:i},backend:n,attrs:{shape:c}}),h=ZB({inputs:{x:m},backend:n,attrs:{perm:l}}),g=Q({inputs:{x:h},backend:n,attrs:{shape:u}}),_=oH({inputs:{x:g},backend:n,attrs:{begin:d,size:f}});return p.push(m),p.push(h),p.push(g),p.forEach(e=>n.disposeIntermediateTensorInfo(e)),_}};J();function lH(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,weights:a}=t,{size:o}=r,s=NR(n.readSync(i.dataId),n.readSync(a.dataId),a.dtype,a.shape,o);return n.makeTensorInfo([o],a.dtype,s)}var uH={kernelName:ut,backendName:`webgl`,kernelFunc:lH};J();var dH=`
  int r = int(a.r) & int(b.r);
  int g = int(a.g) & int(b.g);
  int rb = int(a.b) & int(b.b);
  int ra = int(a.a) & int(b.a);
  return vec4(r, g, rb, ra);
`,fH=`
  return float(int(a.r) & int(b.r));
`;function pH(e){let{inputs:t,backend:n}=e,{a:r,b:i}=t,a=M().getBool(`WEBGL_PACK_BINARY_OPERATIONS`),o=M().getNumber(`WEBGL_VERSION`);if(n.shouldExecuteOnCPU([r,i])||o===1){let e=n.texData.get(r.dataId).values,t=n.texData.get(i.dataId).values,[a,o]=FR(r.shape,i.shape,e,t,r.dtype),s=n.makeTensorInfo(o,r.dtype),c=n.texData.get(s.dataId);return c.values=a,s}let s;return s=a?new hB(dH,r.shape,i.shape,!1):new pB(fH,r.shape,i.shape),n.runWebGLProgram(s,[r,i],r.dtype)}var mH={kernelName:dt,backendName:`webgl`,kernelFunc:pH};J();function hH(e){let{inputs:t,backend:n}=e,{s0:r,s1:i}=t,a=n.readSync(r.dataId),o=n.readSync(i.dataId),s=K(Array.from(a),Array.from(o));return n.makeTensorInfo([s.length],`int32`,Int32Array.from(s))}var gH={kernelName:pt,backendName:`webgl`,kernelFunc:hH};J();var _H=AB({opSnippet:`return float(a != b);`,cpuKernelImpl:nz,dtype:`bool`}),vH={kernelName:Mn,backendName:`webgl`,kernelFunc:_H};J();function yH(e){let{inputs:t,backend:n}=e,{input:r}=t;return gB({inputs:{x:n.texData.get(r.dataId).complexTensorInfos.real},backend:n})}var bH={kernelName:qn,backendName:`webgl`,kernelFunc:yH},xH=`return float(int(x));`;function SH(e,t){let n=new Bz(e.shape,xH),r=t.runWebGLProgram(n,[e],`int32`);return{dataId:r.dataId,shape:r.shape,dtype:r.dtype}}J();function CH(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{dtype:a}=r;if(a===`complex64`){if(i.dtype===`complex64`)return gB({inputs:{x:i},backend:n});let e=sh(i.shape),t=CH({inputs:{x:i},backend:n,attrs:{dtype:`float32`}}),r=vB({inputs:{real:t,imag:e},backend:n});return e.dispose(),n.disposeIntermediateTensorInfo(t),r}if(i.dtype===`complex64`){let e=yH({inputs:{input:i},backend:n}),t=CH({inputs:{x:e},backend:n,attrs:{dtype:a}});return n.disposeIntermediateTensorInfo(e),t}if(!he(i.dtype,a)){let e=gB({inputs:{x:i},backend:n});return{dataId:e.dataId,shape:e.shape,dtype:a}}if(n.shouldExecuteOnCPU([i])){let e=n.texData.get(i.dataId).values,[t,r,o]=IR(e,i.shape,i.dtype,a);return n.makeTensorInfo(t,r,o)}if(a===`int32`)return SH(i,n);if(a===`bool`){let e=n.makeTensorInfo([],`bool`,de(`bool`,1)),t=_H({inputs:{a:i,b:e},backend:n});return n.disposeIntermediateTensorInfo(e),t}throw Error(`Error in Cast: failed to cast ${i.dtype} to ${a}`)}var wH={kernelName:mt,backendName:`webgl`,kernelFunc:CH};J();var TH=`return ceil(x);`,EH=kB({opSnippet:TH,packedOpSnippet:TH,cpuKernelImpl:LR}),DH={kernelName:ht,backendName:`webgl`,kernelFunc:EH},OH=class{constructor(e){this.variableNames=[`A`],this.customUniforms=[{name:`minVal`,type:`float`},{name:`maxVal`,type:`float`}],this.outputShape=e,this.userCode=`

      void main() {
        float value = getAAtOutCoords();
        if (isnan(value)) {
          setOutput(value);
          return;
        }

        setOutput(clamp(value, minVal, maxVal));
      }
    `}},kH=class{constructor(e){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:`minVal`,type:`float`},{name:`maxVal`,type:`float`}],this.outputShape=e,this.userCode=`
      void main() {
        vec4 value = getAAtOutCoords();

        if (any(isnan(value))) {
          setOutput(value);
          return;
        }

        setOutput(clamp(value, vec4(minVal), vec4(maxVal)));
      }
    `}};J();function AH(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{clipValueMin:a,clipValueMax:o}=r,s;s=M().getBool(`WEBGL_PACK_CLIP`)?new kH(i.shape):new OH(i.shape);let c=[[a],[o]];return n.runWebGLProgram(s,[i],i.dtype,c)}var jH={kernelName:gt,backendName:`webgl`,kernelFunc:AH},MH=class{constructor(e){this.variableNames=[`real`,`imag`],this.outputShape=e,this.userCode=`
      void main() {
        float re = abs(getRealAtOutCoords());
        float im = abs(getImagAtOutCoords());
        float mx = max(re, im);

        // sadly the length function in glsl is not underflow-safe
        // (at least not on Intel GPUs). So the safe solution is
        // to ensure underflow-safety in all cases.
        setOutput(
          mx == 0.0 ? 0.0 : mx * length(vec2(1, min(re, im)/mx))
        );
      }
    `}};J();function NH(e,t){return{dataId:t.dataId,dtype:t.dtype,shape:e.shape}}function PH(e){let{inputs:t,backend:n}=e,{x:r}=t,i=n.texData.get(r.dataId),a=new MH(r.shape),o=[NH(r,i.complexTensorInfos.real),NH(r,i.complexTensorInfos.imag)];return n.runWebGLProgram(a,o,o[0].dtype)}var FH={kernelName:vt,backendName:`webgl`,kernelFunc:PH};J();var IH=class{constructor(e){this.outputShape=[],this.outputShape=$T(e,1),this.variableNames=e.map((e,t)=>`T${t}`);let t=Array(e.length-1);t[0]=e[0][1];for(let n=1;n<t.length;n++)t[n]=t[n-1]+e[n][1];let n=[`if (yC < ${t[0]}) setOutput(getT0(yR, yC));`];for(let e=1;e<t.length;e++){let r=t[e-1];n.push(`else if (yC < ${t[e]}) setOutput(getT${e}(yR, yC-${r}));`)}let r=t.length,i=t[t.length-1];n.push(`else setOutput(getT${r}(yR, yC-${i}));`),this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int yR = coords.x;
        int yC = coords.y;

        ${n.join(`
        `)}
      }
    `}};J();var LH=class{constructor(e,t){this.packedInputs=!0,this.packedOutput=!0,this.outputShape=[],this.outputShape=$T(e,t);let n=this.outputShape,r=n.length,i=GL(r),a=Oz(`coords`,r),o=[`x`,`y`,`z`,`w`,`u`,`v`].slice(0,r);this.variableNames=e.map((e,t)=>`T${t}`);let s=Array(e.length-1);s[0]=e[0][t];for(let n=1;n<s.length;n++)s[n]=s[n-1]+e[n][t];let c=o[t],l=o.slice(-2),u=o.join(),d=`if (${c} < ${s[0]}) {
        return getChannel(
            getT0(${u}), vec2(${l.join()}));
        }`;for(let e=1;e<s.length;e++){let t=s[e-1];d+=`
        if (${c} < ${s[e]}  && ${c} >= ${s[e-1]}) {
          return getChannel(
            getT${e}(${RH(o,c,t)}),
            vec2(${RH(l,c,t)}));
        }`}let f=s.length,p=s[s.length-1];d+=`
        return getChannel(
          getT${f}(${RH(o,c,p)}),
          vec2(${RH(l,c,p)}));`,this.userCode=`
      float getValue(${o.map(e=>`int `+e)}) {
        ${d}
      }

      void main() {
        ${i} coords = getOutputCoords();
        vec4 result = vec4(getValue(${a}), 0., 0., 0.);

        ${a[r-1]} = ${a[r-1]} + 1;
        if (${a[r-1]} < ${n[r-1]}) {
          result.g = getValue(${a});
        }

        ${a[r-2]} = ${a[r-2]} + 1;
        if (${a[r-2]} < ${n[r-2]}) {
          result.a = getValue(${a});
        }

        ${a[r-1]} = ${a[r-1]} - 1;
        if (${a[r-2]} < ${n[r-2]} &&
            ${a[r-1]} < ${n[r-1]}) {
          result.b = getValue(${a});
        }
        setOutput(result);
      }
    `}};function RH(e,t,n){let r=e.indexOf(t);return e.map((e,t)=>t===r?`${e} - ${n}`:e).join()}J();function zH(e){let{inputs:t,backend:n}=e,{input:r}=t;return gB({inputs:{x:n.texData.get(r.dataId).complexTensorInfos.imag},backend:n})}var BH={kernelName:rn,backendName:`webgl`,kernelFunc:zH};J();function VH(e,t,n){let r=e[0].dtype;if(r===`complex64`){let r=e.map(e=>yH({inputs:{input:e},backend:n})),i=e.map(e=>zH({inputs:{input:e},backend:n})),a=VH(r,t,n),o=VH(i,t,n),s=vB({inputs:{real:a,imag:o},backend:n});return r.forEach(e=>n.disposeIntermediateTensorInfo(e)),i.forEach(e=>n.disposeIntermediateTensorInfo(e)),n.disposeIntermediateTensorInfo(a),n.disposeIntermediateTensorInfo(o),s}let i=n.shouldExecuteOnCPU(e);if(r===`string`&&(i=!0),i){let i=e.map(e=>{let r=[-1,O(e.shape.slice(t))];return Q({inputs:{x:e},backend:n,attrs:{shape:r}})}),a=RR(i.map(e=>({vals:n.readSync(e.dataId),shape:e.shape})),$T(i.map(e=>e.shape),1),r,i[0].shape[0]===1),o=$T(e.map(e=>e.shape),t),s=n.makeTensorInfo(o,r,a);return i.forEach(e=>n.disposeIntermediateTensorInfo(e)),s}let a=e.filter(e=>O(e.shape)>0),o=M().getBool(`WEBGL_PACK_ARRAY_OPERATIONS`)&&a[0].shape.length>1;if(a.length===1){let t=o?new Bz(e[0].shape,qz):new eB(e[0].shape,qz);return n.runWebGLProgram(t,e,r)}let s=M().getNumber(`WEBGL_MAX_TEXTURES_IN_SHADER`);if(a.length>s){let e=[];for(let r=0;r<a.length;r+=s){let i=a.slice(r,r+s);e.push(VH(i,t,n))}let r=VH(e,t,n);for(let t of e)n.disposeIntermediateTensorInfo(t);return r}if(o){let e=new LH(a.map(e=>e.shape),t);return n.runWebGLProgram(e,a,r)}let{tensors2D:c,outShape:l}=HH(a,t,n),u=new IH(c.map(e=>e.shape)),d=n.runWebGLProgram(u,c,r);c.forEach(e=>n.disposeIntermediateTensorInfo(e));let f=Q({inputs:{x:d},attrs:{shape:l},backend:n});return n.disposeIntermediateTensorInfo(d),f}function HH(e,t,n){let r=$T(e.map(e=>e.shape),t);return{tensors2D:e.map(e=>Q({inputs:{x:e},attrs:{shape:[-1,O(e.shape.slice(t))]},backend:n})),outShape:r}}J();function UH(e){let{inputs:t,backend:n,attrs:r}=e,{axis:i}=r,a=A(i,t[0].shape)[0];QT(t.map(e=>e.shape),a);let o=$T(t.map(e=>e.shape),a);if(O(o)===0)return n.makeTensorInfo(o,t[0].dtype,[]);let s=t.filter(e=>O(e.shape)>0);return s.length===1?gB({inputs:{x:s[0]},backend:n}):VH(s,a,n)}var WH={kernelName:yt,backendName:`webgl`,kernelFunc:UH},GH=class{constructor(e,t=!1,n=null,r=!1,i=!1){this.variableNames=[`x`,`W`],this.outputShape=e.outShape;let a=e.padInfo.top,o=e.padInfo.left,s=e.strideHeight,c=e.strideWidth,l=e.dilationHeight,u=e.dilationWidth,d=e.filterHeight,f=e.filterWidth,p=Math.floor(e.inChannels/4)*4,m=e.inChannels%4,h=e.dataFormat===`channelsLast`,g=h?1:2,_=h?2:3,v=h?3:1,y=``,b=``;n&&(y=r?`float activation(float a) {
          float b = getPreluActivationWeightsAtOutCoords();
          ${n}
        }`:i?`float activation(float a) {
          float b = getLeakyreluAlphaAtOutCoords();
          ${n}
        }`:`
          float activation(float x) {
            ${n}
          }
        `,b=`result = activation(result);`);let x=t?`result += getBiasAtOutCoords();`:``;t&&this.variableNames.push(`bias`),r&&this.variableNames.push(`preluActivationWeights`),i&&this.variableNames.push(`leakyreluAlpha`),this.userCode=`
      ${y}

      const ivec2 strides = ivec2(${s}, ${c});
      const ivec2 pads = ivec2(${a}, ${o});

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d2 = coords[${v}];

        ivec2 xRCCorner =
            ivec2(coords[${g}], coords[${_}]) * strides - pads;
        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        // Convolve x(?, ?, d1) with w(:, :, d1, d2) to get y(yR, yC, d2).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < ${d}; wR++) {
          int xR = xRCorner + wR * ${l};

          if (xR < 0 || xR >= ${e.inHeight}) {
            continue;
          }

          for (int wC = 0; wC < ${f}; wC++) {
            int xC = xCCorner + wC * ${u};

            if (xC < 0 || xC >= ${e.inWidth}) {
              continue;
            }

            for (int d1 = 0; d1 < ${p}; d1 += 4) {
              vec4 wValues = vec4(
                getW(wR, wC, d1, d2),
                getW(wR, wC, d1 + 1, d2),
                getW(wR, wC, d1 + 2, d2),
                getW(wR, wC, d1 + 3, d2)
              );

              if (${h}) {
                vec4 xValues = vec4(
                  getX(batch, xR, xC, d1),
                  getX(batch, xR, xC, d1 + 1),
                  getX(batch, xR, xC, d1 + 2),
                  getX(batch, xR, xC, d1 + 3)
                );
                dotProd += dot(xValues, wValues);
              } else {
                vec4 xValues = vec4(
                  getX(batch, d1, xR, xC),
                  getX(batch, d1 + 1, xR, xC),
                  getX(batch, d1 + 2, xR, xC),
                  getX(batch, d1 + 3, xR, xC)
                );
                dotProd += dot(xValues, wValues);
              }
            }

            if (${m===1}) {

              if (${h}) {
                dotProd +=
                    getX(batch, xR, xC, ${p}) *
                    getW(wR, wC, ${p}, d2);
              } else {
                dotProd +=
                    getX(batch, ${p}, xR, xC) *
                    getW(wR, wC, ${p}, d2);
              }

            } else if (${m===2}) {
              vec2 wValues = vec2(
                getW(wR, wC, ${p}, d2),
                getW(wR, wC, ${p} + 1, d2)
              );

              if (${h}) {
                vec2 xValues = vec2(
                  getX(batch, xR, xC, ${p}),
                  getX(batch, xR, xC, ${p} + 1)
                );
                dotProd += dot(xValues, wValues);
              } else {
                vec2 xValues = vec2(
                  getX(batch, ${p}, xR, xC),
                  getX(batch, ${p} + 1, xR, xC)
                );
                dotProd += dot(xValues, wValues);
              }

            } else if (${m===3}) {
              vec3 wValues = vec3(
                getW(wR, wC, ${p}, d2),
                getW(wR, wC, ${p} + 1, d2),
                getW(wR, wC, ${p} + 2, d2)
              );

              if (${h}) {
                vec3 xValues = vec3(
                  getX(batch, xR, xC, ${p}),
                  getX(batch, xR, xC, ${p} + 1),
                  getX(batch, xR, xC, ${p} + 2)
                );
                dotProd += dot(xValues, wValues);
              } else {
                vec3 xValues = vec3(
                  getX(batch, ${p}, xR, xC),
                  getX(batch, ${p} + 1, xR, xC),
                  getX(batch, ${p} + 2, xR, xC)
                );
                dotProd += dot(xValues, wValues);
              }

            }
          }
        }

        float result = dotProd;
        ${x}
        ${b}
        setOutput(result);
      }
    `}},KH=class{constructor(e){this.variableNames=[`x`,`W`],this.outputShape=e.outShape;let t=e.padInfo.front,n=e.padInfo.top,r=e.padInfo.left,i=e.strideDepth,a=e.strideHeight,o=e.strideWidth,s=e.dilationDepth,c=e.dilationHeight,l=e.dilationWidth,u=e.filterDepth,d=e.filterHeight,f=e.filterWidth,p=Math.floor(e.inChannels/4)*4,m=e.inChannels%4;this.userCode=`
      const ivec3 strides = ivec3(${i}, ${a}, ${o});
      const ivec3 pads = ivec3(${t}, ${n}, ${r});

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int d2 = coords.u;

        ivec3 xFRCCorner = ivec3(coords.y, coords.z, coords.w) * strides - pads;
        int xFCorner = xFRCCorner.x;
        int xRCorner = xFRCCorner.y;
        int xCCorner = xFRCCorner.z;

        // Convolve x(?, ?, ?, d1) with w(:, :, :, d1, d2) to get
        // y(yF, yR, yC, d2). ? = to be determined. : = across all
        // values in that axis.
        float dotProd = 0.0;
        for (int wF = 0; wF < ${u}; wF++) {
          int xF = xFCorner + wF * ${s};

          if (xF < 0 || xF >= ${e.inDepth}) {
            continue;
          }

          for (int wR = 0; wR < ${d}; wR++) {
            int xR = xRCorner + wR * ${c};

            if (xR < 0 || xR >= ${e.inHeight}) {
              continue;
            }

            for (int wC = 0; wC < ${f}; wC++) {
              int xC = xCCorner + wC * ${l};

              if (xC < 0 || xC >= ${e.inWidth}) {
                continue;
              }

              for (int d1 = 0; d1 < ${p}; d1 += 4) {
                vec4 xValues = vec4(
                  getX(batch, xF, xR, xC, d1),
                  getX(batch, xF, xR, xC, d1 + 1),
                  getX(batch, xF, xR, xC, d1 + 2),
                  getX(batch, xF, xR, xC, d1 + 3)
                );
                vec4 wValues = vec4(
                  getW(wF, wR, wC, d1, d2),
                  getW(wF, wR, wC, d1 + 1, d2),
                  getW(wF, wR, wC, d1 + 2, d2),
                  getW(wF, wR, wC, d1 + 3, d2)
                );

                dotProd += dot(xValues, wValues);
              }

              if (${m===1}) {
                dotProd +=
                  getX(batch, xF, xR, xC, ${p}) *
                  getW(wF, wR, wC, ${p}, d2);
              } else if (${m===2}) {
                vec2 xValues = vec2(
                  getX(batch, xF, xR, xC, ${p}),
                  getX(batch, xF, xR, xC, ${p} + 1)
                );
                vec2 wValues = vec2(
                  getW(wF, wR, wC, ${p}, d2),
                  getW(wF, wR, wC, ${p} + 1, d2)
                );
                dotProd += dot(xValues, wValues);
              } else if (${m===3}) {
                vec3 xValues = vec3(
                  getX(batch, xF, xR, xC, ${p}),
                  getX(batch, xF, xR, xC, ${p} + 1),
                  getX(batch, xF, xR, xC, ${p} + 2)
                );
                vec3 wValues = vec3(
                  getW(wF, wR, wC, ${p}, d2),
                  getW(wF, wR, wC, ${p} + 1, d2),
                  getW(wF, wR, wC, ${p} + 2, d2)
                );
                dotProd += dot(xValues, wValues);
              }
            }
          }
        }
        setOutput(dotProd);
      }
    `}};J();var qH=class{constructor(e,t=!1,n=null,r=!1,i=!1){this.variableNames=[`x`,`W`],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:`pads`,type:`ivec2`},{name:`strides`,type:`ivec2`},{name:`dilations`,type:`ivec2`},{name:`inDims`,type:`ivec2`}],this.outputShape=e.outShape,this.enableShapeUniforms=eR(this.outputShape.length);let a=e.padInfo.left,o=e.strideWidth,s=e.dilationWidth,c=e.filterHeight,l=e.filterWidth,u=l,d=`
       int xR; int xC; int xCOffset;
       vec4 wTexel; vec4 previous; vec4 final;`;for(let e=0;e<l;e++)d+=`
           vec4 xTexelC${e*2};
           int xTexelC${e*2}Ready;
           vec4 xTexelC${e*2+1};
           int xTexelC${e*2+1}Ready;
           vec4 xC${e};`;d+=`
     for (int r = 0; r < ${c}; r++) {
      for (int d1 = 0; d1 < ${e.inChannels}; d1 += 2) {
       `;for(let e=0;e<l;e++)d+=`
           xTexelC${e*2} = vec4(0.0);
           xTexelC${e*2}Ready = 0;
           xTexelC${e*2+1} = vec4(0.0);
           xTexelC${e*2+1}Ready = 0;
           xC${e} = vec4(0.0);`;d+=`
         xR = xRCorner + r * dilations[0];
         if (xR >=0 && xR < inDims[0]) {
       `;for(let t=0;t<(u+1)/2;t++){let n=t*2;if(d+=`
           xC = xCCorner + ${n*s};
           `,o===1){if(n<l&&(a%2==1?(d+=`
                 xCOffset = xC + 1;
                 if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${n}Ready == 0) {
                   xTexelC${n} = getX(batch, xR, xCOffset, d1);

                   // Need to manually clear unused channels in case
                   // we're reading from recycled texture.
                   if (xCOffset + 1 >= inDims[1]) {
                     xTexelC${n}.zw = vec2(0.0);
                   }
                   xTexelC${n}Ready = 1;
                 }
               `,s===1&&n>0?d+=`
                 xC${n} = vec4(xTexelC${n-2}.zw, xTexelC${n}.xy);
                 `:d+=`
                   xCOffset = xC + 1 - 2;

                   if (xCOffset >= 0 && xCOffset < inDims[1]) {
                     previous = getX(batch, xR, xCOffset, d1);

                     // Need to manually clear unused channels in case
                     // we're reading from recycled texture.
                     if (xCOffset + 1 >= inDims[1]) {
                       previous.zw = vec2(0.0);
                     }

                     xC${n} = vec4(previous.zw, xTexelC${n}.xy);
                   } else {
                     xC${n} = vec4(0.0, 0.0, xTexelC${n}.xy);
                   }
                   `):d+=`
                 if (xC >= 0 && xC < inDims[1] && xTexelC${n}Ready == 0) {
                   xTexelC${n} = getX(batch, xR, xC, d1);
                   if (xC + 1 >= inDims[1]) {
                     xTexelC${n}.zw = vec2(0.0);
                   }
                   xTexelC${n}Ready = 1;
                 }

                 xC${n} = xTexelC${n};
                 `,n+1<l)){let e=a%2==0?x(s):s;s%2==0&&a%2==1||s%2!=0&&a%2!=1?(d+=`
                   xCOffset = xC + imod(pads[1], 2) + ${e};

                   if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${n+1}Ready == 0) {
                     xTexelC${n+1} = getX(batch, xR, xCOffset, d1);

                     // Need to manually clear unused channels in case
                     // we're reading from recycled texture.
                     if (xCOffset + 1 >= inDims[1]) {
                       xTexelC${n+1}.zw = vec2(0.0);
                     }
                     xTexelC${n+1}Ready = 1;
                   }
                   `,s>1?d+=`
                     xCOffset -= 2;
                     if (xCOffset >= 0 && xCOffset < inDims[1]) {
                      previous = getX(batch, xR, xCOffset, d1);
                      xC${n+1} = vec4(previous.zw, xTexelC${n+1}.xy);
                     } else {
                      xC${n+1} = vec4(0.0, 0.0, xTexelC${n+1}.xy);
                     }
                     `:d+=`
                     xC${n+1} = vec4(xTexelC${n}.zw, xTexelC${n+1}.xy);
                     `):e===1?d+=`
                     xC${n+1} = xTexelC${n};
                     `:d+=`
                     xCOffset = xC + ${e};

                     if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${n+1}Ready == 0) {
                       xTexelC${n+1} = getX(batch, xR, xCOffset, d1);
                       if (xCOffset + 1 >= inDims[1]) {
                         xTexelC${n+1}.zw = vec2(0.0);
                       }
                       xTexelC${n+1}Ready = 1;
                     }

                     xC${n+1} = xTexelC${n+1};
                     `}}else n<l&&(a%2==1?(d+=`
                 xCOffset = xC + 1 - strides[1];
                 if(xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${n}Ready == 0) {
                   xTexelC${n} = getX(batch, xR, xCOffset, d1);
                   // Need to manually clear unused channels in case
                   // we're reading from recycled texture.
                   if (xCOffset + 1 >= inDims[1]) {
                     xTexelC${n}.zw = vec2(0.0);
                   }
                   xTexelC${n}Ready = 1;
                 }

                 if(xC + 1 >= 0 && xC + 1 < inDims[1] && xTexelC${n+1}Ready == 0) {
                   xTexelC${n+1} = getX(batch, xR, xC + 1, d1);
                   // Need to manually clear unused channels in case
                   // we're reading from recycled texture.
                   if (xC + 2 >= inDims[1]) {
                     xTexelC${n+1}.zw = vec2(0.0);
                   }
                   xTexelC${n+1}Ready = 1;
                 }

                 xC${n} = vec4(xTexelC${n}.zw, xTexelC${n+1}.zw);
               `,n+1<l&&(d+=`
                   final = vec4(0.0);
                   xCOffset = xC + 1 + strides[1];
                   if(xCOffset >= 0 && xCOffset < inDims[1]) {
                     final = getX(batch, xR, xCOffset, d1);
                   }
                   xC${n+1} = vec4(xTexelC${n+1}.xy, final.xy);
                 `)):(d+=`
                 if(xC >= 0 && xC < inDims[1] && xTexelC${n}Ready == 0) {
                   xTexelC${n} = getX(batch, xR, xC, d1);
                   if (xC + 1 >= inDims[1]) {
                     xTexelC${n}.zw = vec2(0.0);
                   }
                   xTexelC${n}Ready = 1;
                 }

                 xCOffset = xC + strides[1];
                 if(xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${n+1}Ready == 0) {
                   xTexelC${n+1} = getX(batch, xR, xCOffset, d1);
                   if (xCOffset + 1 >= inDims[1]) {
                     xTexelC${n+1}.zw = vec2(0.);
                   }
                   xTexelC${n+1}Ready = 1;
                 }

                 xC${n} = vec4(
                   xTexelC${n}.xy, xTexelC${n+1}.xy);
               `,n+1<l&&(d+=`
                   xC${n+1} = vec4(xTexelC${n}.zw, xTexelC${n+1}.zw);
                 `)));n<l&&(d+=`
             wTexel = getW(r, ${n}, d1, d2);
             dotProd += xC${n}.xxzz * vec4(wTexel.xy, wTexel.xy);
             if(d1 + 1 < ${e.inChannels}) {
               dotProd += xC${n}.yyww * vec4(wTexel.zw, wTexel.zw);
             }
           `,n+1<l&&(d+=`
               wTexel = getW(r, ${n+1}, d1, d2);
               dotProd += xC${n+1}.xxzz * vec4(wTexel.xy, wTexel.xy);
               if(d1 + 1 < ${e.inChannels}) {
                 dotProd += xC${n+1}.yyww * vec4(wTexel.zw, wTexel.zw);
               }
             `))}d+=`
     }
   `,d+=`
     }
   `,d+=`
     }
   `;let f=``,p=``;n&&(f=r?`vec4 activation(vec4 a) {
           vec4 b = getPreluActivationWeightsAtOutCoords();
           ${n}
         }`:i?`vec4 activation(vec4 a) {
           vec4 b = getLeakyreluAlphaAtOutCoords();
           ${n}
         }`:`vec4 activation(vec4 x) {
           ${n}
         }`,p=`result = activation(result);`);let m=t?`result += getBiasAtOutCoords();`:``;t&&this.variableNames.push(`bias`),r&&this.variableNames.push(`preluActivationWeights`),i&&this.variableNames.push(`leakyreluAlpha`),this.userCode=`
       ${f}

       void main() {
         ivec4 coords = getOutputCoords();
         int batch = coords.x;
         ivec2 xRCCorner = coords.yz * strides - pads;
         int d2 = coords.w;
         int xRCorner = xRCCorner.x;
         int xCCorner = xRCCorner.y;

         //intialize dotProd with a small epsilon seems to reduce GPU accuracy loss.
         vec4 dotProd = vec4(0.000000000000001);

         ${d}

         vec4 result = dotProd - vec4(0.000000000000001);
         ${m}
         ${p}
         setOutput(result);
       }
     `}},JH=class{constructor(e,t){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:`inputShape`,type:`ivec4`},{name:`pad`,type:`ivec2`},{name:`stride`,type:`ivec2`},{name:`dilation`,type:`ivec2`},{name:`inChannels`,type:`int`},{name:`itemsPerBlockRow`,type:`int`},{name:`outWidth`,type:`int`}],this.outputShape=e,this.enableShapeUniforms=eR(this.outputShape.length);let{dataFormat:n}=t,r=YI(),i=n===`channelsLast`,a=i?1:2,o=i?2:3,s=this.enableShapeUniforms?`if(blockIndex < outShape[2] && pos < outShape[1]) {`:`if(blockIndex < ${e[2]} && pos < ${e[1]}) {`,c=``;for(let e=0;e<=1;e++)for(let t=0;t<=1;t++)c+=`
          blockIndex = rc.z + ${t};
          pos = rc.y + ${e};

          ${s}
            offsetY = int(blockIndex / outWidth) * stride[0] - pad[0];
            d0 = offsetY + dilation[0] * (pos / itemsPerBlockRow);

            if(d0 < inputShape[${a}] && d0 >= 0) {
              // Use custom imod instead mod. On Intel GPU, mod may generate
              // unexpected value.
              // https://github.com/tensorflow/tfjs/issues/5447
              offsetX = imod(blockIndex, outWidth) * stride[1] - pad[1];
              d1 = offsetX + dilation[1] * (imod(pos, itemsPerBlockRow) /
                  inChannels);

              if(d1 < inputShape[${o}] && d1 >= 0) {

                ch = imod(pos, inChannels);

                if (${i}) {
                  innerDims = vec2(d1, ch);
                  result[${e*2+t}] = getChannel(
                    getA(rc.x, d0, int(innerDims.x),
                    int(innerDims.y)), innerDims);
                } else {
                  innerDims = vec2(d0, d1);
                  result[${e*2+t}] = getChannel(
                    getA(rc.x, ch, int(innerDims.x),
                    int(innerDims.y)), innerDims);
                }
              }
            }
          }
        `;this.userCode=`
      void main() {
        ivec3 rc = getOutputCoords();

        vec4 result = vec4(0);

        int blockIndex, pos, offsetY, d0, offsetX, d1, ch;
        vec2 innerDims;

        ${c}

        ${r.output} = result;
      }
    `}};J();function YH(e,t){let n=e.length;return n>=3?t?[...e.slice(0,-3),e[n-3]*e[n-2],e[n-1]]:[...e.slice(0,-3),e[n-3],e[n-2]*e[n-1]]:!t&&n===1&&e[0]>1?[e[0],1]:null}function XH({x:e,filter:t,convInfo:n,backend:r,bias:i=null,preluActivationWeights:a=null,leakyreluAlpha:o=0,activation:s=null}){let c=e.shape,l=r.texData.get(e.dataId),u=n.inChannels,d=c[0]*c[1]*c[2],f=n.outChannels,p=n.dataFormat===`channelsLast`,m,h=[];if(a!=null){let e=YH(a.shape,p);e!=null&&(a=Q({inputs:{x:a},backend:r,attrs:{shape:e}}),h.push(a))}if(i!=null){let e=YH(i.shape,p);e!=null&&(i=Q({inputs:{x:i},backend:r,attrs:{shape:e}}),h.push(i))}if(!((d===1||f===1)&&u>1e3)&&l.isPacked&&p&&l.texture!=null&&c[2]%2!=0&&k(l.shape.slice(-3),c.slice(-3))){let u=c[0]*c[1]*(c[2]+1),d={dataId:e.dataId,shape:[1,u,n.inChannels],dtype:e.dtype},f=l.shape;l.shape=l.shape.slice(),l.shape[l.shape.length-2]++,E(FI(l.shape,d.shape),()=>`packed reshape ${l.shape} to ${d.shape} isn't free`);let p=Q({inputs:{x:t},backend:r,attrs:{shape:[1,n.inChannels,n.outChannels]}});h.push(p);let g=$B({a:d,b:p,backend:r,transposeA:!1,transposeB:!1,bias:i,activation:s,preluActivationWeights:a,leakyreluAlpha:o}),_=r.texData.get(g.dataId);E(_.isPacked,()=>`batchMatMul result is expected to be packed`),l.shape=f,_.shape=n.outShape,m=gB({inputs:{x:g},backend:r}),m.shape=n.outShape,h.push(g)}else{let c=n.outHeight*n.outWidth,l=Q({inputs:{x:e},backend:r,attrs:{shape:p?[n.batchSize,c,n.inChannels]:[n.batchSize,n.inChannels,c]}}),u=Q({inputs:{x:t},backend:r,attrs:{shape:[1,n.inChannels,n.outChannels]}}),d=$B({a:p?l:u,b:p?u:l,transposeA:!p,transposeB:!1,backend:r,bias:i,activation:s,preluActivationWeights:a,leakyreluAlpha:o});m=Q({inputs:{x:d},backend:r,attrs:{shape:n.outShape}}),h.push(l),h.push(u),h.push(d)}for(let e of h)r.disposeIntermediateTensorInfo(e);return m}function ZH({x:e,filter:t,convInfo:n,backend:r,bias:i=null,preluActivationWeights:a=null,leakyreluAlpha:o=0,activation:s=null}){let{filterWidth:c,filterHeight:l,inChannels:u,outWidth:d,outHeight:f,dataFormat:p}=n,m=p===`channelsLast`,h=c*l*u,g=f*d,_=[n.batchSize,h,g],v=[];if(a!=null){let e=YH(a.shape,m);e!=null&&(a=Q({inputs:{x:a},backend:r,attrs:{shape:e}}),v.push(a))}if(i!=null){let e=YH(i.shape,m);e!=null&&(i=Q({inputs:{x:i},backend:r,attrs:{shape:e}}),v.push(i))}let y=Q({inputs:{x:t},backend:r,attrs:{shape:[1,h,O(t.shape)/h]}});v.push(y);let b=new JH(_,n),x=[e.shape,[n.padInfo.top,n.padInfo.left],[n.strideHeight,n.strideWidth],[n.dilationHeight,n.dilationWidth],[n.inChannels],[n.filterWidth*n.inChannels],[n.outWidth]],S=r.runWebGLProgram(b,[e],`float32`,x),C=Q({inputs:{x:S},backend:r,attrs:{shape:_}});v.push(S),v.push(C);let w=i!=null,T=a!=null,E=s===`leakyrelu`,D=s?jB(s,!0):null,ee=new MB(m?C.shape:y.shape,m?y.shape:C.shape,m?[n.batchSize,g,n.outChannels]:[n.batchSize,n.outChannels,g],!0,!1,w,D,T,E),te=m?[C,y]:[y,C];if(i&&te.push(i),T&&te.push(a),E){let e=r.makeTensorInfo([],`float32`,ji(o,`float32`));te.push(e),v.push(e)}let ne=r.runWebGLProgram(ee,te,`float32`),k=Q({inputs:{x:ne},backend:r,attrs:{shape:n.outShape}});v.push(ne);for(let e of v)r.disposeIntermediateTensorInfo(e);return k}J();function QH(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a}=t,{strides:o,pad:s,dataFormat:c,dilations:l,dimRoundingMode:u}=r,d=xl(c),f=sl(i.shape,a.shape,o,l,s,u,!1,d),p;if(f.filterHeight===1&&f.filterWidth===1&&f.dilationHeight===1&&f.dilationWidth===1&&f.strideHeight===1&&f.strideWidth===1&&(f.padInfo.type===`SAME`||f.padInfo.type===`VALID`))p=XH({x:i,filter:a,convInfo:f,backend:n});else if(f.strideWidth<=2&&d===`channelsLast`&&M().getBool(`WEBGL_EXP_CONV`)){let e=new qH(f),t=[[f.padInfo.top,f.padInfo.left],[f.strideHeight,f.strideWidth],[f.dilationHeight,f.dilationWidth],[f.inHeight,f.inWidth]];p=n.runWebGLProgram(e,[i,a],`float32`,t)}else if(M().getBool(`WEBGL_CONV_IM2COL`))p=ZH({x:i,filter:a,convInfo:f,backend:n});else{let e=new GH(f);p=n.runWebGLProgram(e,[i,a],`float32`)}let m=Q({inputs:{x:p},backend:n,attrs:{shape:f.outShape}});return n.disposeIntermediateTensorInfo(p),m}var $H={kernelName:bt,backendName:`webgl`,kernelFunc:QH},eU=class{constructor(e){this.variableNames=[`x`,`dy`],this.outputShape=e.filterShape;let t=e.strideHeight,n=e.strideWidth,r=e.padInfo.top,i=e.padInfo.left,a=e.dataFormat===`channelsLast`;this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int wR = coords.x;
        int wC = coords.y;
        int d1 = coords.z;
        int d2 = coords.w;

        // Convolve x(?, ?, d1) with dy(:, :, d2) to get dw(wR, wC, d1, d2).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;

        for (int b = 0; b < ${e.batchSize}; b++) {
          for (int yR = 0; yR < ${e.outHeight}; yR++) {
            int xR = wR + yR * ${t} - ${r};

            if (xR < 0 || xR >= ${e.inHeight}) {
              continue;
            }

            for (int yC = 0; yC < ${e.outWidth}; yC++) {
              int xC = wC + yC * ${n} - ${i};

              if (xC < 0 || xC >= ${e.inWidth}) {
                continue;
              }

              ${a?`float dyValue = getDy(b, yR, yC, d2);
              float xValue = getX(b, xR, xC, d1);
              dotProd += (xValue * dyValue);`:`float dyValue = getDy(b, d2, yR, yC);
              float xValue = getX(b, d1, xR, xC);
              dotProd += (xValue * dyValue);`}
            }
          }
        }
        setOutput(dotProd);
      }
    `}},tU=class{constructor(e){this.variableNames=[`dy`,`W`],this.outputShape=e.inShape;let t=e.filterHeight,n=e.filterWidth,r=e.strideHeight,i=e.strideWidth,a=e.dataFormat===`channelsLast`,o=t-1-e.padInfo.top,s=n-1-e.padInfo.left,c=a?1:2,l=a?2:3,u=a?3:1;this.userCode=`
      const ivec2 pads = ivec2(${o}, ${s});

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d1 = coords[${u}];

        ivec2 dyCorner = ivec2(coords[${c}], coords[${l}]) - pads;
        int dyRCorner = dyCorner.x;
        int dyCCorner = dyCorner.y;

        // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < ${t}; wR++) {
          float dyR = float(dyRCorner + wR) / ${r}.0;

          if (dyR < 0.0 || dyR >= ${e.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          int wRPerm = ${t} - 1 - wR;

          for (int wC = 0; wC < ${n}; wC++) {
            float dyC = float(dyCCorner + wC) / ${i}.0;

            if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            int wCPerm = ${n} - 1 - wC;

            for (int d2 = 0; d2 < ${e.outChannels}; d2++) {

              if (${a}) {
                float xValue = getDy(batch, idyR, idyC, d2);
                float wValue = getW(wRPerm, wCPerm, d1, d2);
                dotProd += xValue * wValue;
              } else {
                float xValue = getDy(batch, d2, idyR, idyC);
                float wValue = getW(wRPerm, wCPerm, d1, d2);
                dotProd += xValue * wValue;
              }

            }
          }
        }
        setOutput(dotProd);
      }
    `}},nU=class{constructor(e){this.variableNames=[`x`,`dy`],this.outputShape=e.filterShape;let t=e.strideDepth,n=e.strideHeight,r=e.strideWidth,i=e.padInfo.front,a=e.padInfo.top,o=e.padInfo.left;this.userCode=`
      void main() {
        ivec5 coords = getOutputCoords();
        int wF = coords.x;
        int wR = coords.y;
        int wC = coords.z;
        int d1 = coords.w;
        int d2 = coords.u;

        float dotProd = 0.0;

        for (int b = 0; b < ${e.batchSize}; b++) {
          for (int yF = 0; yF < ${e.outDepth}; yF++) {
            int xF = wF + yF * ${t} - ${i};

            if (xF < 0 || xF >= ${e.inDepth}) {
              continue;
            }

            for (int yR = 0; yR < ${e.outHeight}; yR++) {
              int xR = wR + yR * ${n} - ${a};

              if (xR < 0 || xR >= ${e.inHeight}) {
                continue;
              }

              for (int yC = 0; yC < ${e.outWidth}; yC++) {
                int xC = wC + yC * ${r} - ${o};

                if (xC < 0 || xC >= ${e.inWidth}) {
                  continue;
                }

                float dyValue = getDy(b, yF, yR, yC, d2);
                float xValue = getX(b, xF, xR, xC, d1);
                dotProd += (xValue * dyValue);
              }
            }
          }
        }
        setOutput(dotProd);
      }
    `}},rU=class{constructor(e){this.variableNames=[`dy`,`W`],this.outputShape=e.inShape;let t=e.filterDepth,n=e.filterHeight,r=e.filterWidth,i=e.strideDepth,a=e.strideHeight,o=e.strideWidth,s=t-1-e.padInfo.front,c=n-1-e.padInfo.top,l=r-1-e.padInfo.left;this.userCode=`
      const ivec3 pads = ivec3(${s}, ${c}, ${l});

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int d1 = coords.u;


        ivec3 dyCorner = ivec3(coords.y, coords.z, coords.w) - pads;
        int dyFCorner = dyCorner.x;
        int dyRCorner = dyCorner.y;
        int dyCCorner = dyCorner.z;

        float dotProd = 0.0;
        for (int wF = 0; wF < ${t}; wF++) {
          float dyF = float(dyFCorner + wF) / ${i}.0;

          if (dyF < 0.0 || dyF >= ${e.outDepth}.0 || fract(dyF) > 0.0) {
            continue;
          }
          int idyF = int(dyF);

          int wFPerm = ${t} - 1 - wF;

          for (int wR = 0; wR < ${n}; wR++) {
            float dyR = float(dyRCorner + wR) / ${a}.0;

            if (dyR < 0.0 || dyR >= ${e.outHeight}.0 ||
              fract(dyR) > 0.0) {
              continue;
            }
            int idyR = int(dyR);

            int wRPerm = ${n} - 1 - wR;

            for (int wC = 0; wC < ${r}; wC++) {
              float dyC = float(dyCCorner + wC) / ${o}.0;

              if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                  fract(dyC) > 0.0) {
                continue;
              }
              int idyC = int(dyC);

              int wCPerm = ${r} - 1 - wC;

              for (int d2 = 0; d2 < ${e.outChannels}; d2++) {
                float xValue = getDy(batch, idyF, idyR, idyC, d2);
                float wValue = getW(wFPerm, wRPerm, wCPerm, d1, d2);
                dotProd += xValue * wValue;
              }
            }
          }
        }
        setOutput(dotProd);
      }
    `}};J();function iU(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,dy:a}=t,{strides:o,pad:s,dataFormat:c,dimRoundingMode:l,filterShape:u}=r,d=xl(c),f=new eU(sl(i.shape,u,o,1,s,l,!1,d));return n.runWebGLProgram(f,[i,a],`float32`)}var aU={kernelName:xt,backendName:`webgl`,kernelFunc:iU},oU=class{constructor(e){this.variableNames=[`dy`,`W`],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:`strides`,type:`vec2`}],this.outputShape=e.inShape,this.enableShapeUniforms=eR(this.outputShape.length);let t=e.filterHeight,n=e.filterWidth,r=t-1-e.padInfo.top,i=n-1-e.padInfo.left;this.userCode=`
      const ivec2 pads = ivec2(${r}, ${i});

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d1 = coords[3];

        ivec2 dyCorner = ivec2(coords[1], coords[2]) - pads;
        int dyRCorner = dyCorner.x;
        int dyCCorner = dyCorner.y;

        vec4 result = vec4(0.);
        for (int wR = 0; wR < ${t}; wR++) {
          float dyR = float(dyRCorner + wR) / strides[0];
          if (dyR < 0.0 || dyR >= ${e.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);
          int wRPerm = ${t} - 1 - wR;

          for (int wC = 0; wC < ${n}; wC++) {
            int wCPerm = ${n} - 1 - wC;

            float dyC = float(dyCCorner + wC) / strides[1];
            bool idyCVal = (dyC >= 0.0) && (dyC < ${e.outWidth}.0)
              && (fract(dyC) == 0.0);
            int idyC = int(dyC);

            float dyC2 = float(dyCCorner + wC + 1) / strides[1];
            bool idyCVal2 = (dyC2 >= 0.0) && (dyC2 < ${e.outWidth}.0)
              && (fract(dyC2) == 0.0);
            int idyC2 = int(dyC2);

            if (idyCVal && idyCVal2) {
              for (int d2 = 0; d2 < ${e.outChannels}; d2 += 2) {
                vec4 wValue = getW(wRPerm, wCPerm, d1, d2);
                vec4 dySample = getDy(batch, idyR, idyC, d2);
                vec4 dySample2 = (idyC / 2 == idyC2 / 2) ?
                  dySample : getDy(batch, idyR, idyC2, d2);

                vec2 dyValue = mod(float(idyC), 2.) == 0. ?
                  dySample.xy : dySample.zw;
                result.xy += vec2(dot(dyValue, wValue.xy),
                  dot(dyValue, wValue.zw));

                dyValue = mod(float(idyC2), 2.) == 0. ?
                  dySample2.xy : dySample2.zw;
                result.zw += vec2(dot(dyValue, wValue.xy),
                  dot(dyValue, wValue.zw));
              }
            } else if (idyCVal) {
              for (int d2 = 0; d2 < ${e.outChannels}; d2 += 2) {
                vec4 wValue = getW(wRPerm, wCPerm, d1, d2);
                vec4 dySample = getDy(batch, idyR, idyC, d2);
                vec2 dyValue = mod(float(idyC), 2.) == 0. ?
                  dySample.xy : dySample.zw;
                result.xy += vec2(dot(dyValue, wValue.xy),
                  dot(dyValue, wValue.zw));
              }
            } else if (idyCVal2) {
              for (int d2 = 0; d2 < ${e.outChannels}; d2 += 2) {
                vec4 wValue = getW(wRPerm, wCPerm, d1, d2);
                vec4 dySample = getDy(batch, idyR, idyC2, d2);
                vec2 dyValue = mod(float(idyC2), 2.) == 0. ?
                  dySample.xy : dySample.zw;
                result.zw += vec2(dot(dyValue, wValue.xy),
                  dot(dyValue, wValue.zw));
              }
            }
          }
        }
        setOutput(result);
      }
    `}};J();function sU(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,filter:a}=t,{inputShape:o,strides:s,pad:c,dataFormat:l,dimRoundingMode:u}=r,d=xl(l),f=sl(o,a.shape,s,1,c,u,!1,d);if(M().getBool(`WEBGL_PACK_CONV2DTRANSPOSE`)&&d===`channelsLast`){let e=[[f.strideHeight,f.strideWidth]],t=new oU(f);return n.runWebGLProgram(t,[i,a],`float32`,e)}else{let e=new tU(f);return n.runWebGLProgram(e,[i,a],`float32`)}}var cU={kernelName:St,backendName:`webgl`,kernelFunc:sU};J();function lU(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a}=t,{strides:o,pad:s,dilations:c}=r,l=new KH(cl(i.shape,a.shape,o,c,s));return n.runWebGLProgram(l,[i,a],`float32`)}var uU={kernelName:Ct,backendName:`webgl`,kernelFunc:lU};J();function dU(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,dy:a}=t,{strides:o,pad:s,filterShape:c}=r,l=new nU(cl(i.shape,c,o,1,s));return n.runWebGLProgram(l,[i,a],`float32`)}var fU={kernelName:wt,backendName:`webgl`,kernelFunc:dU};J();function pU(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,filter:a}=t,{pad:o,strides:s,inputShape:c}=r,l=new rU(cl(c,a.shape,s,1,o));return n.runWebGLProgram(l,[i,a],`float32`)}var mU={kernelName:Tt,backendName:`webgl`,kernelFunc:pU};J();var hU={kernelName:`Cos`,backendName:`webgl`,kernelFunc:kB({opSnippet:OB+`
  return cos(x);
`,packedOpSnippet:`
  vec4 result = cos(x);
  bvec4 isNaN = isnan(x);
  ${mB}
  return result;
`})};J();var gU=kB({opSnippet:`
  float e2x = exp(-x);
  return (e2x + 1.0 / e2x) / 2.0;
`}),_U={kernelName:Et,backendName:`webgl`,kernelFunc:gU},vU=class{constructor(e,t,n,r,i){this.variableNames=[`Image`,`Boxes`,`BoxInd`],this.outputShape=[];let[a,o,s,c]=e,[l]=t,[u,d]=n;this.outputShape=[l,u,d,c];let f=+(r===`bilinear`),[p,m]=[`${o-1}.0`,`${s-1}.0`],[h,g,_]=u>1?[`${(o-1)/(u-1)}`,`(y2-y1) * height_ratio`,`y1*${p} + float(y)*(height_scale)`]:[`0.0`,`0.0`,`0.5 * (y1+y2) * ${p}`],[v,y,b]=d>1?[`${(s-1)/(d-1)}`,`(x2-x1) * width_ratio`,`x1*${m} + float(x)*(width_scale)`]:[`0.0`,`0.0`,`0.5 * (x1+x2) * ${m}`];this.userCode=`
      const float height_ratio = float(${h});
      const float width_ratio = float(${v});
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int y = coords[1];
        int x = coords[2];
        int d = coords[3];

        // get box vals
        float y1 = getBoxes(b,0);
        float x1 = getBoxes(b,1);
        float y2 = getBoxes(b,2);
        float x2 = getBoxes(b,3);

        // get image in batch index
        int bInd = round(getBoxInd(b));
        if(bInd < 0 || bInd >= ${a}) {
          return;
        }

        float height_scale = ${g};
        float width_scale = ${y};

        float in_y = ${_};
        if( in_y < 0.0 || in_y > ${p} ) {
          setOutput(float(${i}));
          return;
        }
        float in_x = ${b};
        if( in_x < 0.0 || in_x > ${m} ) {
          setOutput(float(${i}));
          return;
        }

        vec2 sourceFracIndexCR = vec2(in_x,in_y);
        if(${f} == 1) {
          // Compute the four integer indices.
          ivec2 sourceFloorCR = ivec2(sourceFracIndexCR);
          ivec2 sourceCeilCR = ivec2(ceil(sourceFracIndexCR));

          float topLeft = getImage(b, sourceFloorCR.y, sourceFloorCR.x, d);
          float bottomLeft = getImage(b, sourceCeilCR.y, sourceFloorCR.x, d);
          float topRight = getImage(b, sourceFloorCR.y, sourceCeilCR.x, d);
          float bottomRight = getImage(b, sourceCeilCR.y, sourceCeilCR.x, d);

          vec2 fracCR = sourceFracIndexCR - vec2(sourceFloorCR);

          float top = topLeft + (topRight - topLeft) * fracCR.x;
          float bottom = bottomLeft + (bottomRight - bottomLeft) * fracCR.x;
          float newValue = top + (bottom - top) * fracCR.y;
          setOutput(newValue);
        } else {
          // Compute the coordinators of nearest neighbor point.
          ivec2 sourceNearestCR = ivec2(floor(
            sourceFracIndexCR + vec2(0.5,0.5)));
          float newValue = getImage(b, sourceNearestCR.y, sourceNearestCR.x, d);
          setOutput(newValue);
        }
      }
    `}};J();var yU={kernelName:kt,backendName:`webgl`,kernelFunc:e=>{let{inputs:t,backend:n,attrs:r}=e,{image:i,boxes:a,boxInd:o}=t,{cropSize:s,method:c,extrapolationValue:l}=r,u=new vU(i.shape,a.shape,s,c,l);return n.runWebGLProgram(u,[i,a,o],`float32`)}},bU;(function(e){e.Prod=`*`,e.Sum=`+`})(bU||={});var xU=class{constructor(e,t,n,r){this.op=e,this.outputShape=t,this.variableNames=[`x`],this.customUniforms=[{name:`index`,type:`float`}];let i=this.outputShape.length,a=this.op===bU.Prod?`1.0`:`0.0`,o=n?a:`getX(${SU(i,`coords`,this.op)})`,s=this.outputShape[this.outputShape.length-1],c=``,l=``;n?(c=r?`end != ${s-1}`:`end != 0`,l=r?`end + 1`:`end - 1`):(c=r?`end + pow2 < ${s}`:`end >= pow2`,l=r?`end + pow2`:`end - pow2`),this.userCode=`
      void main() {
        ${GL(i)} coords = getOutputCoords();
        int end = ${CU(i,`coords`,this.op)};
        float val = ${o};
        int pow2 = int(pow(2.0, index));
        if (${c}) {
          int idx = ${l};
          ${CU(i,`coords`,this.op)} = idx;
          val ${this.op}= getX(${SU(i,`coords`,this.op)});
        }
        setOutput(val);
      }
    `}};function SU(e,t,n){if(e===1)return`${t}`;if(e===2)return`${t}.x, ${t}.y`;if(e===3)return`${t}.x, ${t}.y, ${t}.z`;if(e===4)return`${t}.x, ${t}.y, ${t}.z, ${t}.w`;throw Error(`Cumulative ${n} for rank ${e} is not yet supported`)}function CU(e,t,n){if(e===1)return`${t}`;if(e===2)return`${t}.y`;if(e===3)return`${t}.z`;if(e===4)return`${t}.w`;throw Error(`Cumulative ${n} for rank ${e} is not yet supported`)}J();function wU(e,t,n,r,i,a){let o=t.shape.length,s=xf([r],o),c=t;s!=null&&(c=ZB({inputs:{x:t},backend:n,attrs:{perm:s}}));let l=Cf(1,o)[0];if(l!==o-1)throw Error(`WebGL cumprod shader expects an inner-most axis=${t.shape.length-1} but got axis=${r}`);let u=c.shape[l],d=gB({inputs:{x:c},backend:n});for(let t=0;t<=Math.ceil(Math.log2(u))-1;t++){let r=new xU(e,c.shape,!1,a),i=[[t]],o=d;d=n.runWebGLProgram(r,[d],d.dtype,i),n.disposeIntermediateTensorInfo(o)}if(i){let t=new xU(e,c.shape,i,a),r=d;d=n.runWebGLProgram(t,[d],d.dtype),n.disposeIntermediateTensorInfo(r)}if(s!=null){let e=Sf(s),t=ZB({inputs:{x:d},backend:n,attrs:{perm:e}});return n.disposeIntermediateTensorInfo(d),n.disposeIntermediateTensorInfo(c),t}return d}J();function TU(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,exclusive:o,reverse:s}=r;return wU(bU.Prod,i,n,a,o,s)}var EU={kernelName:Dt,backendName:`webgl`,kernelFunc:TU};J();function DU(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,exclusive:o,reverse:s}=r;return wU(bU.Sum,i,n,a,o,s)}var OU={kernelName:Ot,backendName:`webgl`,kernelFunc:DU};J();function kU(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,weights:a}=t,{size:o,binaryOutput:s}=r;if(i.shape.length===1){let e=NR(n.readSync(i.dataId),n.readSync(a.dataId),a.dtype,a.shape,o);return n.makeTensorInfo([o],a.dtype,e)}else if(i.shape.length===2){let e=PR(n.bufferSync(i),n.bufferSync(a),o,s);return n.makeTensorInfo(e.shape,a.dtype,e.values)}throw Error(`Error in denseBincount: input must be at most rank 2, but got rank${i.shape.length}.`)}var AU={kernelName:At,backendName:`webgl`,kernelFunc:kU},jU=class{constructor(e,t,n){this.variableNames=[`x`],this.outputShape=[],this.outputShape=e,this.blockSize=t,this.dataFormat=n,this.userCode=`
    void main() {
      ivec4 coords = getOutputCoords();
      int b = coords[0];
      int h = ${this.getHeightCoordString()};
      int w = ${this.getWidthCoordString()};
      int d = ${this.getDepthCoordString()};

      int in_h = h / ${t};
      int offset_h = imod(h, ${t});
      int in_w = w / ${t};
      int offset_w = imod(w, ${t});
      int offset_d = (offset_h * ${t} + offset_w) *
        ${this.getOutputDepthSize()};
      int in_d = d + offset_d;

      float result = ${this.getInputSamplingString()};
      setOutput(result);
    }
  `}getHeightCoordString(){return this.dataFormat===`NHWC`?`coords[1]`:`coords[2]`}getWidthCoordString(){return this.dataFormat===`NHWC`?`coords[2]`:`coords[3]`}getDepthCoordString(){return this.dataFormat===`NHWC`?`coords[3]`:`coords[1]`}getOutputDepthSize(){return this.dataFormat===`NHWC`?this.outputShape[3]:this.outputShape[1]}getInputSamplingString(){return this.dataFormat===`NHWC`?`getX(b, in_h, in_w, in_d)`:`getX(b, in_d, in_h, in_w)`}};J();function MU(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{blockSize:a,dataFormat:o}=r,s=i.shape[0],c=o===`NHWC`?i.shape[1]:i.shape[2],l=o===`NHWC`?i.shape[2]:i.shape[3],u=o===`NHWC`?i.shape[3]:i.shape[1],d=c*a,f=l*a,p=u/(a*a),m=new jU(o===`NHWC`?[s,d,f,p]:[s,p,d,f],a,o);return n.runWebGLProgram(m,[i],i.dtype)}var NU={kernelName:jt,backendName:`webgl`,kernelFunc:MU},PU=class{constructor(e,t=!1,n=null,r=!1,i=!1){this.variableNames=[`x`,`W`],this.customUniforms=[{name:`pads`,type:`ivec2`},{name:`strides`,type:`ivec2`},{name:`dilations`,type:`ivec2`},{name:`inDims`,type:`ivec2`}],this.outputShape=e.outShape,this.enableShapeUniforms=eR(this.outputShape.length);let a=e.filterHeight,o=e.filterWidth,s=e.outChannels/e.inChannels,c=``,l=``;n&&(c=r?`float activation(float a) {
          float b = getPreluActivationWeightsAtOutCoords();
          ${n}
        }`:i?`float activation(float a) {
          float b = getLeakyreluAlphaAtOutCoords();
          ${n}
        }`:`
          float activation(float x) {
            ${n}
          }
        `,l=`result = activation(result);`);let u=t?`result += getBiasAtOutCoords();`:``;t&&this.variableNames.push(`bias`),r&&this.variableNames.push(`preluActivationWeights`),i&&this.variableNames.push(`leakyreluAlpha`),this.userCode=`
      ${c}

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords.x;
        ivec2 xRCCorner = coords.yz * strides - pads;
        int d2 = coords.w;
        int d1 = d2 / ${s};
        int q = d2 - d1 * ${s};

        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        // Convolve x(?, ?, d1) with w(:, :, d1, q) to get y(yR, yC, d2).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        // TO DO(dsmilkov): Flatten the two for loops and vec4 the operations.
        for (int wR = 0; wR < ${a}; wR++) {
          int xR = xRCorner + wR * dilations[0];

          if (xR < 0 || xR >= inDims[0]) {
            continue;
          }

          for (int wC = 0; wC < ${o}; wC++) {
            int xC = xCCorner + wC * dilations[1];

            if (xC < 0 || xC >= inDims[1]) {
              continue;
            }

            float xVal = getX(batch, xR, xC, d1);
            float wVal = getW(wR, wC, d1, q);
            dotProd += xVal * wVal;
          }
        }

        float result = dotProd;
        ${u}
        ${l}
        setOutput(result);
      }
    `}};J();var FU=class{constructor(e,t=!1,n=null,r=!1,i=!1){this.variableNames=[`x`,`W`],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:`pads`,type:`ivec2`},{name:`strides`,type:`ivec2`},{name:`dilations`,type:`ivec2`},{name:`inDims`,type:`ivec2`}],this.outputShape=e.outShape,this.enableShapeUniforms=eR(this.outputShape.length);let a=e.outChannels/e.inChannels,o=e.padInfo.left,s=e.strideWidth,c=e.dilationWidth,l=e.filterHeight,u=e.filterWidth,d=u,f=`
      int xR; int xC; int xCOffset;
      vec4 wTexel; vec4 previous; vec4 final;`;for(let e=0;e<u;e++)f+=`
          vec4 xTexelC${e*2};
          int xTexelC${e*2}Ready;
          vec4 xTexelC${e*2+1};
          int xTexelC${e*2+1}Ready;
          vec4 xC${e};`;f+=`
    for (int r = 0; r < ${l}; r++) {
      `;for(let e=0;e<u;e++)f+=`
          xTexelC${e*2} = vec4(0.0);
          xTexelC${e*2}Ready = 0;
          xTexelC${e*2+1} = vec4(0.0);
          xTexelC${e*2+1}Ready = 0;
          xC${e} = vec4(0.0);`;f+=`
        xR = xRCorner + r * dilations[0];
        if (xR >=0 && xR < inDims[0]) {
      `;for(let e=0;e<(d+1)/2;e++){let t=e*2;if(f+=`
          xC = xCCorner + ${t*c};
          `,s===1){if(t<u&&(o%2==1?(f+=`
                xCOffset = xC + 1;
                if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${t}Ready == 0) {
                  xTexelC${t} = getX(batch, xR, xCOffset, d1);

                  // Need to manually clear unused channels in case
                  // we're reading from recycled texture.
                  if (xCOffset + 1 >= inDims[1]) {
                    xTexelC${t}.zw = vec2(0.0);
                  }
                  xTexelC${t}Ready = 1;
                }
              `,c===1&&t>0?f+=`
                xC${t} = vec4(xTexelC${t-2}.zw, xTexelC${t}.xy);
                `:f+=`
                  xCOffset = xC + 1 - 2;

                  if (xCOffset >= 0 && xCOffset < inDims[1]) {
                    previous = getX(batch, xR, xCOffset, d1);

                    // Need to manually clear unused channels in case
                    // we're reading from recycled texture.
                    if (xCOffset + 1 >= inDims[1]) {
                      previous.zw = vec2(0.0);
                    }

                    xC${t} = vec4(previous.zw, xTexelC${t}.xy);
                  } else {
                    xC${t} = vec4(0.0, 0.0, xTexelC${t}.xy);
                  }
                  `):f+=`
                if (xC >= 0 && xC < inDims[1] && xTexelC${t}Ready == 0) {
                  xTexelC${t} = getX(batch, xR, xC, d1);
                  if (xC + 1 >= inDims[1]) {
                    xTexelC${t}.zw = vec2(0.0);
                  }
                  xTexelC${t}Ready = 1;
                }

                xC${t} = xTexelC${t};
                `,t+1<u)){let e=o%2==0?x(c):c;c%2==0&&o%2==1||c%2!=0&&o%2!=1?(f+=`
                  xCOffset = xC + imod(pads[1], 2) + ${e};

                  if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${t+1}Ready == 0) {
                    xTexelC${t+1} = getX(batch, xR, xCOffset, d1);

                    // Need to manually clear unused channels in case
                    // we're reading from recycled texture.
                    if (xCOffset + 1 >= inDims[1]) {
                      xTexelC${t+1}.zw = vec2(0.0);
                    }
                    xTexelC${t+1}Ready = 1;
                  }
                  `,c>1?f+=`
                    xCOffset -= 2;
                    if (xCOffset >= 0 && xCOffset < inDims[1]) {
                     previous = getX(batch, xR, xCOffset, d1);
                     xC${t+1} = vec4(previous.zw, xTexelC${t+1}.xy);
                    } else {
                     xC${t+1} = vec4(0.0, 0.0, xTexelC${t+1}.xy);
                    }
                    `:f+=`
                    xC${t+1} = vec4(xTexelC${t}.zw, xTexelC${t+1}.xy);
                    `):e===1?f+=`
                    xC${t+1} = xTexelC${t};
                    `:f+=`
                    xCOffset = xC + ${e};

                    if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${t+1}Ready == 0) {
                      xTexelC${t+1} = getX(batch, xR, xCOffset, d1);
                      if (xCOffset + 1 >= inDims[1]) {
                        xTexelC${t+1}.zw = vec2(0.0);
                      }
                      xTexelC${t+1}Ready = 1;
                    }

                    xC${t+1} = xTexelC${t+1};
                    `}}else t<u&&(o%2==1?(f+=`
                xCOffset = xC + 1 - strides[1];
                if(xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${t}Ready == 0) {
                  xTexelC${t} = getX(batch, xR, xCOffset, d1);
                  // Need to manually clear unused channels in case
                  // we're reading from recycled texture.
                  if (xCOffset + 1 >= inDims[1]) {
                    xTexelC${t}.zw = vec2(0.0);
                  }
                  xTexelC${t}Ready = 1;
                }

                if(xC + 1 >= 0 && xC + 1 < inDims[1] && xTexelC${t+1}Ready == 0) {
                  xTexelC${t+1} = getX(batch, xR, xC + 1, d1);
                  // Need to manually clear unused channels in case
                  // we're reading from recycled texture.
                  if (xC + 2 >= inDims[1]) {
                    xTexelC${t+1}.zw = vec2(0.0);
                  }
                  xTexelC${t+1}Ready = 1;
                }

                xC${t} = vec4(xTexelC${t}.zw, xTexelC${t+1}.zw);
              `,t+1<u&&(f+=`
                  final = vec4(0.0);
                  xCOffset = xC + 1 + strides[1];
                  if(xCOffset >= 0 && xCOffset < inDims[1]) {
                    final = getX(batch, xR, xCOffset, d1);
                  }
                  xC${t+1} = vec4(xTexelC${t+1}.xy, final.xy);
                `)):(f+=`
                if(xC >= 0 && xC < inDims[1] && xTexelC${t}Ready == 0) {
                  xTexelC${t} = getX(batch, xR, xC, d1);
                  if (xC + 1 >= inDims[1]) {
                    xTexelC${t}.zw = vec2(0.0);
                  }
                  xTexelC${t}Ready = 1;
                }

                xCOffset = xC + strides[1];
                if(xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${t+1}Ready == 0) {
                  xTexelC${t+1} = getX(batch, xR, xCOffset, d1);
                  if (xCOffset + 1 >= inDims[1]) {
                    xTexelC${t+1}.zw = vec2(0.);
                  }
                  xTexelC${t+1}Ready = 1;
                }

                xC${t} = vec4(
                  xTexelC${t}.xy, xTexelC${t+1}.xy);
              `,t+1<u&&(f+=`
                  xC${t+1} = vec4(xTexelC${t}.zw, xTexelC${t+1}.zw);
                `)));t<u&&(f+=`
            wTexel = getW(r, ${t}, d1, q);
            dotProd += xC${t} * vec4(wTexel.xz, wTexel.xz);
          `,t+1<u&&(f+=`
              wTexel = getW(r, ${t+1}, d1, q);
              dotProd += xC${t+1} * vec4(wTexel.xz, wTexel.xz);
            `))}f+=`
    }
  `,f+=`
      }
    `;let p=``,m=``;n&&(p=r?`vec4 activation(vec4 a) {
          vec4 b = getPreluActivationWeightsAtOutCoords();
          ${n}
        }`:i?`vec4 activation(vec4 a) {
          vec4 b = getLeakyreluAlphaAtOutCoords();
          ${n}
        }`:`vec4 activation(vec4 x) {
          ${n}
        }`,m=`result = activation(result);`);let h=t?`result += getBiasAtOutCoords();`:``;t&&this.variableNames.push(`bias`),r&&this.variableNames.push(`preluActivationWeights`),i&&this.variableNames.push(`leakyreluAlpha`),this.userCode=`
      ${p}

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords.x;
        ivec2 xRCCorner = coords.yz * strides - pads;
        int d2 = coords.w;
        int d1 = d2 / ${a};
        int q = d2 - d1 * ${a};
        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        //intialize dotProd with a small epsilon seems to reduce GPU accuracy loss.
        vec4 dotProd = vec4(0.000000000000001);

        ${f}

        vec4 result = dotProd - vec4(0.000000000000001);
        ${h}
        ${m}
        setOutput(result);
      }
    `}};J();function IU(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a}=t,{strides:o,pad:s,dilations:c,dimRoundingMode:l}=r,u=c;u??=[1,1],E(yl(o,u),()=>`Error in depthwiseConv2d: Either strides or dilations must be 1. Got strides ${o} and dilations '${u}'`);let d=sl(i.shape,a.shape,o,u,s,l,!0),f;f=M().getBool(`WEBGL_PACK_DEPTHWISECONV`)&&d.strideWidth<=2&&d.outChannels/d.inChannels===1?new FU(d):new PU(d);let p=[[d.padInfo.top,d.padInfo.left],[d.strideHeight,d.strideWidth],[d.dilationHeight,d.dilationWidth],[d.inHeight,d.inWidth]];return n.runWebGLProgram(f,[i,a],`float32`,p)}var LU={kernelName:Mt,backendName:`webgl`,kernelFunc:IU},RU=class{constructor(e){this.variableNames=[`x`,`dy`],this.outputShape=e.filterShape;let t=e.strideHeight,n=e.strideWidth,r=e.padInfo.top,i=e.padInfo.left,a=e.outChannels/e.inChannels;this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int wR = coords.x;
        int wC = coords.y;
        int d1 = coords.z;
        int dm = coords.w;
        int d2 = d1 * ${a} + dm;

        float dotProd = 0.0;

        // TO DO: Vec4 over the batch size
        for (int b = 0; b < ${e.batchSize}; b++) {
          for (int yR = 0; yR < ${e.outHeight}; yR++) {
            int xR = wR + yR * ${t} - ${r};

            if (xR < 0 || xR >= ${e.inHeight}) {
              continue;
            }

            for (int yC = 0; yC < ${e.outWidth}; yC++) {
              int xC = wC + yC * ${n} - ${i};

              if (xC < 0 || xC >= ${e.inWidth}) {
                continue;
              }

              float dyValue = getDy(b, yR, yC, d2);
              float xValue = getX(b, xR, xC, d1);
              dotProd += (xValue * dyValue);
            }
          }
        }
        setOutput(dotProd);
      }
    `}},zU=class{constructor(e){this.variableNames=[`dy`,`W`],this.outputShape=e.inShape;let t=e.filterHeight,n=e.filterWidth,r=e.strideHeight,i=e.strideWidth,a=t-1-e.padInfo.top,o=n-1-e.padInfo.left,s=e.outChannels/e.inChannels;this.userCode=`
      const ivec2 pads = ivec2(${a}, ${o});

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d1 = coords[3];
        ivec2 dyCorner = coords.yz - pads;
        int dyRCorner = dyCorner.x;
        int dyCCorner = dyCorner.y;

        float dotProd = 0.0;

        for (int wR = 0; wR < ${t}; wR++) {
          float dyR = float(dyRCorner + wR) / ${r}.0;

          if (dyR < 0.0 || dyR >= ${e.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          int wRPerm = ${t} - 1 - wR;

          for (int wC = 0; wC < ${n}; wC++) {
            float dyC = float(dyCCorner + wC) / ${i}.0;

            if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            int wCPerm = ${n} - 1 - wC;

            // TO DO: Vec4 over the channelMul
            for (int dm = 0; dm < ${s}; dm++) {
              int d2 = d1 * ${s} + dm;
              float xValue = getDy(batch, idyR, idyC, d2);
              float wValue = getW(wRPerm, wCPerm, d1, dm);
              dotProd += xValue * wValue;
            }
          }
        }
        setOutput(dotProd);
      }
    `}};J();function BU(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,dy:a}=t,{strides:o,dilations:s,pad:c,dimRoundingMode:l,filterShape:u}=r,d=new RU(sl(i.shape,u,o,s,c,l,!0));return n.runWebGLProgram(d,[i,a],`float32`)}var VU={kernelName:Nt,backendName:`webgl`,kernelFunc:BU};J();function HU(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,filter:a}=t,{strides:o,dilations:s,pad:c,dimRoundingMode:l,inputShape:u}=r,d=new zU(sl(u,a.shape,o,s,c,l,!0));return n.runWebGLProgram(d,[i,a],`float32`)}var UU={kernelName:Pt,backendName:`webgl`,kernelFunc:HU},WU=class{constructor(e){this.variableNames=[`X`],this.outputShape=[e,e],this.userCode=`
      void main() {
          ivec2 coords = getOutputCoords();
          float val = coords[0] == coords[1] ? getX(coords[0]) : 0.0;
          setOutput(val);
      }
    `}};J();function GU(e){let{inputs:t,backend:n}=e,{x:r}=t,i=[...r.shape,...r.shape],a=O(r.shape),o=Q({inputs:{x:r},backend:n,attrs:{shape:[a]}}),s=new WU(a),c=n.runWebGLProgram(s,[o],o.dtype),l=Q({inputs:{x:c},backend:n,attrs:{shape:i}});return n.disposeIntermediateTensorInfo(o),n.disposeIntermediateTensorInfo(c),l}var KU={kernelName:Ft,backendName:`webgl`,kernelFunc:GU},qU=class{constructor(e){this.variableNames=[`x`,`W`],this.outputShape=e.outShape;let{inHeight:t,inWidth:n,padInfo:r,strideHeight:i,strideWidth:a,filterHeight:o,filterWidth:s,dilationHeight:c,dilationWidth:l}=e,{top:u,left:d}=r;this.userCode=`
      const ivec2 strides = ivec2(${i}, ${a});
      const ivec2 pads = ivec2(${u}, ${d});
      const float neg_infinity = -3.4e38;

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords.x;
        int d1 = coords.w;
        ivec2 outTopLeftCorner =
            coords.yz * strides - pads;
        int hBeg = outTopLeftCorner.x;
        int wBeg = outTopLeftCorner.y;

        float curVal = neg_infinity;
        for (int h = 0; h < ${o}; h++) {
          int hIn = hBeg + h * ${c};

          if (hIn >= 0 && hIn < ${t}) {
            for (int w = 0; w < ${s}; w++) {
              int wIn = wBeg + w * ${l};

              if (wIn >= 0 && wIn < ${n}) {
                float xVal = getX(batch, hIn, wIn, d1);
                float wVal = getW(h, w, d1);

                float val = xVal + wVal;
                if (val > curVal) {
                  curVal = val;
                }
              }
            }
          }
        }

        float result = curVal;
        setOutput(result);
      }
    `}};J();function JU(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a}=t,{strides:o,pad:s,dilations:c}=r,l=il(i.shape,a.shape,o,s,`NHWC`,c),u,d=new qU(l);u=n.runWebGLProgram(d,[i,a],`float32`);let f=Q({inputs:{x:u},backend:n,attrs:{shape:l.outShape}});return n.disposeIntermediateTensorInfo(u),f}var YU={kernelName:It,backendName:`webgl`,kernelFunc:JU};J();function XU(e){let{inputs:t,backend:n,attrs:r}=e,{equation:i}=r,a=t,{allDims:o,summedDims:s,idDims:c}=LE(i,a.length);zE(o.length,c,a);let{path:l,steps:u}=BE(s,c),d=u.length,f=null,p=o.length,m=[];for(let e=0;e<d;++e){for(let t of u[e]){let{permutationIndices:e,expandDims:r}=RE(p,c[t]),i;VE(e)?i=a[t]:(i=ZB({inputs:{x:a[t]},backend:n,attrs:{perm:e}}),m.push(i));let o=i.shape.slice();for(let e=0;e<r.length;++e)o.splice(r[e],0,1);k(i.shape,o)||(i=Q({inputs:{x:i},backend:n,attrs:{shape:o}}),m.push(i)),f===null?f=i:(f=IB({inputs:{a:i,b:f},backend:n}),m.push(f))}e<d-1&&(l[e]>=0&&(f=YB({inputs:{x:f},backend:n,attrs:{axis:l[e]-(o.length-p),keepDims:!1}}),m.push(f)),p--)}for(let e of m)e!==f&&n.disposeIntermediateTensorInfo(e);return f}var ZU={kernelName:Vt,backendName:`webgl`,kernelFunc:XU};J();var QU={kernelName:`Elu`,backendName:`webgl`,kernelFunc:kB({opSnippet:`return (x >= 0.0) ? x : (exp(x) - 1.0);`,packedOpSnippet:`
  vec4 result;

  result.r = (x.r >= 0.0) ? x.r : (exp(x.r) - 1.0);
  result.g = (x.g >= 0.0) ? x.g : (exp(x.g) - 1.0);
  result.b = (x.b >= 0.0) ? x.b : (exp(x.b) - 1.0);
  result.a = (x.a >= 0.0) ? x.a : (exp(x.a) - 1.0);

  return result;
`})};J();var $U=`return (b >= 0.0) ? a : a * (b + 1.0);`,eW=`
  vec4 bGTEZero = vec4(greaterThanEqual(b, vec4(0.)));
  return (bGTEZero * a) + ((vec4(1.0) - bGTEZero) * (a * (b + vec4(1.0))));
`,tW={kernelName:Ht,backendName:`webgl`,kernelFunc:e=>{let{inputs:t,backend:n}=e,{dy:r,y:i}=t,a=M().getBool(`WEBGL_PACK_BINARY_OPERATIONS`)?new hB(eW,r.shape,i.shape):new pB($U,r.shape,i.shape);return n.runWebGLProgram(a,[r,i],r.dtype)}};J();var nW=AB({opSnippet:`return float(a == b);`,packedOpSnippet:`
  return vec4(equal(a, b));
`,dtype:`bool`,cpuKernelImpl:zR}),rW={kernelName:Ut,backendName:`webgl`,kernelFunc:nW};J();var iW={kernelName:`Erf`,backendName:`webgl`,kernelFunc:kB({opSnippet:`
  // Error function is calculated approximately with elementary function.
  // See "Handbook of Mathematical Functions with Formulas,
  // Graphs, and Mathematical Tables", Abramowitz and Stegun.
  float p = ${xE};
  float a1 = ${SE};
  float a2 = ${CE};
  float a3 = ${wE};
  float a4 = ${TE};
  float a5 = ${EE};

  float sign = sign(x);
  x = abs(x);
  float t = 1.0 / (1.0 + p * x);
  return sign * (1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*exp(-x*x));
`})};J();var aW=kB({opSnippet:OB+`
  return exp(x);
`,packedOpSnippet:`
  vec4 result = exp(x);
  bvec4 isNaN = isnan(x);
  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,cpuKernelImpl:BR,dtype:`float32`}),oW={kernelName:`Exp`,backendName:`webgl`,kernelFunc:aW};J();function sW(e){let{inputs:t,attrs:n,backend:r}=e,{dim:i}=n,{input:a}=t,o=a.shape.length,s=a.shape.slice(),c=i;return i<0&&(E(-(o+1)<=i,()=>`Axis must be in the interval [${-(o+1)}, ${o}]`),c=o+i+1),s.splice(c,0,1),Q({inputs:{x:a},backend:r,attrs:{shape:s}})}var cW={kernelName:Wt,backendName:`webgl`,kernelFunc:sW};J();var lW=`return exp(x) - 1.0;`,uW=kB({opSnippet:lW,packedOpSnippet:lW,cpuKernelImpl:VR}),dW={kernelName:Gt,backendName:`webgl`,kernelFunc:uW},fW=class{constructor(e,t,n){this.variableNames=[`real`,`imag`];let r=t[1];this.outputShape=t;let i=n?`2.0 * ${Math.PI}`:`-2.0 * ${Math.PI}`,a=n?`${r}.0`:`1.0`,o;if(e===`real`)o=`return real * expR - imag * expI;`;else if(e===`imag`)o=`return real * expI + imag * expR;`;else throw Error(`FFT component must be either "real" or "imag", got ${e}.`);this.userCode=`
      const float exponentMultiplier = ${i};

      float unaryOpComplex(float real, float expR, float imag, float expI) {
        ${o}
      }

      float mulMatDFT(int batch, int index) {
        float indexRatio = float(index) / float(${r});
        float exponentMultiplierTimesIndexRatio =
            exponentMultiplier * indexRatio;

        float result = 0.0;

        for (int i = 0; i < ${r}; i++) {
          // x = (-2|2 * PI / N) * index * i;
          float x = exponentMultiplierTimesIndexRatio * float(i);
          float expR = cos(x);
          float expI = sin(x);
          float real = getReal(batch, i);
          float imag = getImag(batch, i);

          result +=
              unaryOpComplex(real, expR, imag, expI) / ${a};
        }

        return result;
      }

      void main() {
        ivec2 coords = getOutputCoords();
        setOutput(mulMatDFT(coords[0], coords[1]));
      }
    `}};J();function pW(e,t,n){let r=n.texData.get(e.dataId),i=O(e.shape),a=e.shape[e.shape.length-1],o=i/a,s=Q({inputs:{x:e},backend:n,attrs:{shape:[o,a]}}),c=s.shape,l=new fW(`real`,c,t),u=new fW(`imag`,c,t),d=[{dataId:r.complexTensorInfos.real.dataId,dtype:r.complexTensorInfos.real.dtype,shape:c},{dataId:r.complexTensorInfos.imag.dataId,dtype:r.complexTensorInfos.imag.dtype,shape:c}],f=n.runWebGLProgram(l,d,`float32`),p=n.runWebGLProgram(u,d,`float32`),m=vB({inputs:{real:f,imag:p},backend:n});n.disposeIntermediateTensorInfo(f),n.disposeIntermediateTensorInfo(p);let h=Q({inputs:{x:m},backend:n,attrs:{shape:e.shape}});return n.disposeIntermediateTensorInfo(s),n.disposeIntermediateTensorInfo(m),h}J();function mW(e){let{inputs:t,backend:n}=e,{input:r}=t;return pW(r,!1,n)}var hW={kernelName:`FFT`,backendName:`webgl`,kernelFunc:mW},gW=class{constructor(e,t){this.outputShape=[],this.customUniforms=[{name:`value`,type:`float`}],this.variableNames=[`x`],this.outputShape=e,this.userCode=`
      void main() {
        // Input can be obtained from uniform value.
        setOutput(value);
      }
    `}};J();function _W(e){let{backend:t,attrs:n}=e,{shape:r,value:i}=n,{dtype:a}=n;if(a||=xe(i),a===`string`){let e=fe(a,O(r));return e.fill(i),t.makeTensorInfo(r,a,e)}else{let e=new gW(r,i),n=[[i]];return t.runWebGLProgram(e,[],a,n)}}var vW={kernelName:Kt,backendName:`webgl`,kernelFunc:_W},yW=class{constructor(e){this.variableNames=[`Image`],this.outputShape=[];let t=e[2];this.outputShape=e,this.userCode=`
        void main() {
          ivec4 coords = getOutputCoords();
          int x = coords[2];

          int coordX = ${t} - x - 1;
          float outputValue;
          if(coordX >= 0 && coordX < ${t}) {
            outputValue = getImage(coords[0], coords[1], coordX, coords[3]);
          } else {
            outputValue = getImage(coords[0], coords[1], coords[2], coords[3]);
          }
          setOutput(outputValue);
        }
    `}};J();var bW={kernelName:qt,backendName:`webgl`,kernelFunc:({inputs:e,backend:t})=>{let{image:n}=e,r=t,i=new yW(n.shape);return r.runWebGLProgram(i,[n],n.dtype)}};J();var xW=`return floor(x);`,SW=kB({opSnippet:xW,packedOpSnippet:xW,cpuKernelImpl:HR}),CW={kernelName:Jt,backendName:`webgl`,kernelFunc:SW};J();var wW=AB({opSnippet:`
  float s = sign(a) * sign(b);
  int ia = round(a);
  int ib = round(b);
  if (ib != 0) {
    // Windows (D3D) wants guaranteed non-zero int division at compile-time.
    return float(idiv(ia, ib, s));
  } else {
    return NAN;
  }
`,packedOpSnippet:`
  ivec4 ia = round(a);
  ivec4 ib = round(b);
  bvec4 cond = notEqual(ib, ivec4(0));
  ivec4 result = ivec4(0);
  vec4 s = sign(a) * sign(b);

  // Windows (D3D) wants guaranteed non-zero int division at compile-time.
  if (cond[0]) {
    result[0] = idiv(ia[0], ib[0], s[0]);
  }
  if (cond[1]) {
    result[1] = idiv(ia[1], ib[1], s[1]);
  }
  if (cond[2]) {
    result[2] = idiv(ia[2], ib[2], s[2]);
  }
  if (cond[3]) {
    result[3] = idiv(ia[3], ib[3], s[3]);
  }
  return vec4(result);
`,dtype:`int32`}),TW={kernelName:Yt,backendName:`webgl`,kernelFunc:wW},EW=class{constructor(e){this.variableNames=[`A`];let t=YI(),[n,r]=e;this.outputShape=e,this.userCode=`
      void main() {
        ivec3 coords = getOutputCoords();
        int texR = coords[0];
        int texC = coords[1];
        int depth = coords[2];
        vec2 uv = (vec2(texC, texR) + halfCR) / vec2(${r}.0, ${n}.0);

        vec4 values = ${t.texture2D}(A, uv);
        float value;
        if (depth == 0) {
          value = values.r;
        } else if (depth == 1) {
          value = values.g;
        } else if (depth == 2) {
          value = values.b;
        } else if (depth == 3) {
          value = values.a;
        }

        setOutput(floor(value * 255.0 + 0.5));
      }
    `}},DW=class{constructor(e){this.variableNames=[`A`],this.packedInputs=!1,this.packedOutput=!0;let t=YI(),[n,r]=e;this.outputShape=e,this.userCode=`
      void main() {
        ivec3 coords = getOutputCoords();
        int texR = coords[0];
        int texC = coords[1];
        int depth = coords[2];

        vec4 result = vec4(0.);

        for(int row=0; row<=1; row++) {
          for(int col=0; col<=1; col++) {
            texC = coords[1] + row;
            depth = coords[2] + col;

            vec2 uv = (vec2(texC, texR) + halfCR) /
                       vec2(${r}.0, ${n}.0);
            vec4 values = ${t.texture2D}(A, uv);
            float value;
            if (depth == 0) {
              value = values.r;
            } else if (depth == 1) {
              value = values.g;
            } else if (depth == 2) {
              value = values.b;
            } else if (depth == 3) {
              value = values.a;
            }

            result[row * 2 + col] = floor(value * 255.0 + 0.5);
          }
        }

        ${t.output} = result;
      }
    `}};J();var OW={kernelName:Hr,backendName:`webgl`,kernelFunc:jW},kW,AW=M().getBool(`CANVAS2D_WILL_READ_FREQUENTLY_FOR_GPU`);function jW(e){let{inputs:t,backend:n,attrs:r}=e,{pixels:i}=t,{numChannels:a}=r,o=typeof HTMLVideoElement<`u`&&i instanceof HTMLVideoElement,s=typeof HTMLImageElement<`u`&&i instanceof HTMLImageElement,[c,l]=o?[i.videoWidth,i.videoHeight]:[i.width,i.height],u=[l,c],d=[l,c,a];if(s||o){let e=M().getBool(`CANVAS2D_WILL_READ_FREQUENTLY_FOR_GPU`);(kW==null||e!==AW)&&(AW=e,kW=document.createElement(`canvas`).getContext(`2d`,{willReadFrequently:AW})),kW.canvas.width=c,kW.canvas.height=l,kW.drawImage(i,0,0,c,l),i=kW.canvas}let f=n.makeTensorInfo(u,`int32`);n.texData.get(f.dataId).usage=qF.PIXELS,n.gpgpu.uploadPixelDataToTexture(n.getTexture(f.dataId),i);let p=M().getBool(`WEBGL_PACK`)?new DW(d):new EW(d),m=n.runWebGLProgram(p,[f],`int32`);return n.disposeData(f.dataId),m}J();function MW(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a,bias:o,preluActivationWeights:s}=t,{strides:c,pad:l,dataFormat:u,dilations:d,dimRoundingMode:f,activation:p,leakyreluAlpha:m}=r,h=xl(u),g=sl(i.shape,a.shape,c,d,l,f,!1,h),_,v=[],y=o!=null,b=s!=null,x=p===`leakyrelu`,S=()=>{let e=[i,a],t=(e,t)=>{if(t===`NCHW`&&e.shape.length===1&&e.shape[0]!==1){let t=Q({inputs:{x:e},backend:n,attrs:{shape:[e.shape[0],1,1]}});return v.push(t),t}return e};if(y&&e.push(t(o,u)),b&&e.push(t(s,u)),x){let t=n.makeTensorInfo([],`float32`,ji(m,`float32`));e.push(t),v.push(t)}return e};if(g.filterHeight===1&&g.filterWidth===1&&g.dilationHeight===1&&g.dilationWidth===1&&g.strideHeight===1&&g.strideWidth===1&&(g.padInfo.type===`SAME`||g.padInfo.type===`VALID`))_=XH({x:i,filter:a,convInfo:g,backend:n,bias:o,activation:p,preluActivationWeights:s,leakyreluAlpha:m});else if(g.strideWidth<=2&&h===`channelsLast`&&M().getBool(`WEBGL_EXP_CONV`)){let e=new qH(g,y,p?jB(p,!0):null,b,x),t=[[g.padInfo.top,g.padInfo.left],[g.strideHeight,g.strideWidth],[g.dilationHeight,g.dilationWidth],[g.inHeight,g.inWidth]],r=S();_=n.runWebGLProgram(e,r,`float32`,t)}else if(M().getBool(`WEBGL_CONV_IM2COL`))_=ZH({x:i,filter:a,convInfo:g,backend:n,bias:o,activation:p,preluActivationWeights:s,leakyreluAlpha:m});else{let e=new GH(g,y,p?jB(p,!1):null,b,x),t=S();_=n.runWebGLProgram(e,t,`float32`)}let C=Q({inputs:{x:_},backend:n,attrs:{shape:g.outShape}});return v.push(_),v.forEach(e=>n.disposeIntermediateTensorInfo(e)),C}var NW={kernelName:Gr,backendName:`webgl`,kernelFunc:MW};J();function PW(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a,bias:o,preluActivationWeights:s}=t,{strides:c,pad:l,dilations:u,dimRoundingMode:d,activation:f,leakyreluAlpha:p}=r,m=[],h=u;h??=[1,1],E(yl(c,h),()=>`Error in depthwiseConv2d: Either strides or dilations must be 1. Got strides ${c} and dilations '${h}'`);let g=sl(i.shape,a.shape,c,h,l,d,!0),_=M().getBool(`WEBGL_PACK_DEPTHWISECONV`)&&g.strideWidth<=2&&g.outChannels/g.inChannels===1,v=f?jB(f,_):null,y=[i,a],b=o!=null,x=s!=null,S=f===`leakyrelu`;if(b&&y.push(o),x&&y.push(s),S){let e=n.makeTensorInfo([],`float32`,ji(p,`float32`));y.push(e),m.push(e)}let C;C=_?new FU(g,b,v,x,S):new PU(g,b,v,x,S);let w=[[g.padInfo.top,g.padInfo.left],[g.strideHeight,g.strideWidth],[g.dilationHeight,g.dilationWidth],[g.inHeight,g.inWidth]],T=n.runWebGLProgram(C,y,`float32`,w);return m.forEach(e=>n.disposeIntermediateTensorInfo(e)),T}var FW={kernelName:Kr,backendName:`webgl`,kernelFunc:PW},IW=class{constructor(e,t,n,r){this.sliceDim=e,this.strides=t,this.paramsShape=r,this.variableNames=[`x`,`indices`],this.outputShape=n;let i=GL(n.length),a=`
    int index;`;for(let e=0;e<this.sliceDim;e++)a+=`
          index = round(getIndices(coords[0], ${e}));
          out_of_bounds = out_of_bounds || index < 0;
          out_of_bounds = out_of_bounds || index >= ${this.paramsShape[e]};
          flattenIndex += index * ${this.strides[e]};`;this.userCode=`
         void main() {
          ${i} coords = getOutputCoords();
          int flattenIndex = 0;
          bool out_of_bounds = false;

          ${a}

          setOutput(out_of_bounds ? 0.0 : getX(flattenIndex, coords[1]));
        }
      `}};J();function LW(e){let{inputs:t,backend:n}=e,{params:r,indices:i}=t,a=i.shape,o=a[a.length-1],s=O(r.shape),[c,l,u,d]=yT(r,i),f=Q({inputs:{x:i},backend:n,attrs:{shape:[l,o]}}),p=Q({inputs:{x:r},backend:n,attrs:{shape:[O(r.shape)/u,u]}});if(n.shouldExecuteOnCPU([r,i])||r.dtype===`string`){let e=UR(n.readSync(i.dataId),n.bufferSync(r),r.dtype,l,o,u,d,r.shape,s);return n.makeTensorInfo(c,r.dtype,e.values)}let m=new IW(o,d,[l,u],r.shape),h=n.runWebGLProgram(m,[p,f],p.dtype),g=Q({inputs:{x:h},backend:n,attrs:{shape:c}});return n.disposeIntermediateTensorInfo(f),n.disposeIntermediateTensorInfo(p),n.disposeIntermediateTensorInfo(h),g}var RW={kernelName:Qt,backendName:`webgl`,kernelFunc:LW},zW=class{constructor(e,t){this.variableNames=[`A`,`indices`],this.outputShape=t,this.rank=t.length;let n=GL(this.rank),r=BW(e,2);this.userCode=`
      void main() {
        ${n} resRC = getOutputCoords();
        int index = int(getIndices(resRC.x, resRC.z));
        float inBounds = (index >= 0) && (index < ${e[2]}) ? 1.0 : 0.0;
        setOutput(inBounds * getA(${r}));
      }
    `}};function BW(e,t){let n=[`resRC.x`,`resRC.y`,`resRC.z`,`resRC.w`],r=[];for(let t=0;t<e.length;t++)t===2?r.push(`index`):r.push(`${n[t]}`);return r.join()}J();function VW(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,indices:a}=t,{axis:o,batchDims:s}=r,c=A(o,i.shape)[0];if(M().get(`DEBUG`)){let e=n.readSync(a.dataId),t=i.shape[c];for(let n=0;n<e.length;++n){let r=e[n];E(r<=t-1&&r>=0,()=>`GatherV2: the index value ${r} is not in [0, ${t-1}]`)}}let l=mD(i,a,c,s),u=O(a.shape),d=[],f=Q({inputs:{x:i},backend:n,attrs:{shape:[l.batchSize,l.outerSize,l.dimSize,l.sliceSize]}}),p=Q({inputs:{x:a},backend:n,attrs:{shape:[l.batchSize,u/l.batchSize]}});d.push(f),d.push(p);let m=[l.batchSize,l.outerSize,u/l.batchSize,l.sliceSize];if(n.shouldExecuteOnCPU([i,a])||i.dtype===`string`){let e=n.bufferSync(p),t=WR(n.bufferSync(f),e,m);return d.forEach(e=>n.disposeIntermediateTensorInfo(e)),n.makeTensorInfo(l.outputShape,t.dtype,t.values)}let h=new zW(f.shape,m),g=n.runWebGLProgram(h,[f,p],f.dtype);d.push(g);let _=Q({inputs:{x:g},backend:n,attrs:{shape:l.outputShape}});return d.forEach(e=>n.disposeIntermediateTensorInfo(e)),_}var HW={kernelName:Zt,backendName:`webgl`,kernelFunc:VW};J();var UW=AB({opSnippet:`return float(a > b);`,packedOpSnippet:`
  return vec4(greaterThan(a, b));
`,cpuKernelImpl:GR,dtype:`bool`}),WW={kernelName:$t,backendName:`webgl`,kernelFunc:UW};J();var GW=AB({opSnippet:`return float(a >= b);`,packedOpSnippet:`
  return vec4(greaterThanEqual(a, b));
`,dtype:`bool`,cpuKernelImpl:KR}),KW={kernelName:en,backendName:`webgl`,kernelFunc:GW};J();function qW(e){let{inputs:t,backend:n}=e,{input:r}=t;return pW(r,!0,n)}var JW={kernelName:nn,backendName:`webgl`,kernelFunc:qW};J();var YW=kB({opSnippet:`return float(!isnan(x) && !isinf(x));`,dtype:`bool`}),XW={kernelName:an,backendName:`webgl`,kernelFunc:YW};J();var ZW=kB({opSnippet:`return float(isinf(x));`,dtype:`bool`}),QW={kernelName:on,backendName:`webgl`,kernelFunc:ZW};J();var $W=kB({opSnippet:`return float(isnan(x));`,dtype:`bool`}),eG={kernelName:sn,backendName:`webgl`,kernelFunc:$W};J();var tG=AB({opSnippet:`return float(a < b);`,packedOpSnippet:`
  return vec4(lessThan(a, b));
`,cpuKernelImpl:qR,dtype:`bool`}),nG={kernelName:ln,backendName:`webgl`,kernelFunc:tG};J();var rG=AB({opSnippet:`return float(a <= b);`,packedOpSnippet:`
  return vec4(lessThanEqual(a, b));
`,cpuKernelImpl:JR,dtype:`bool`}),iG={kernelName:un,backendName:`webgl`,kernelFunc:rG};J();function aG(e){let{backend:t,attrs:n}=e,{start:r,stop:i,num:a}=n,o=YR(r,i,a);return t.makeTensorInfo([o.length],`float32`,o)}var oG={kernelName:dn,backendName:`webgl`,kernelFunc:aG};J();var sG={kernelName:`Log`,backendName:`webgl`,kernelFunc:kB({opSnippet:OB+`
  return x < 0.0 ? 0./0. : log(x);
`,packedOpSnippet:`
  vec4 result = log(x);
  bvec4 isNaN = isnan(x);
  result.r = isNaN.r ? x.r : (x.r < 0.0 ? 0./0. : result.r);
  result.g = isNaN.g ? x.g : (x.g < 0.0 ? 0./0. : result.g);
  result.b = isNaN.b ? x.b : (x.b < 0.0 ? 0./0. : result.b);
  result.a = isNaN.a ? x.a : (x.a < 0.0 ? 0./0. : result.a);
  return result;
`,cpuKernelImpl:XR})};J();var cG=kB({opSnippet:OB+`
  return log(1.0 + x);
`}),lG={kernelName:fn,backendName:`webgl`,kernelFunc:cG};J();var uG=AB({opSnippet:`return float(a >= 1.0 && b >= 1.0);`,packedOpSnippet:`
  return vec4(
    vec4(greaterThanEqual(a, vec4(1.0))) *
    vec4(greaterThanEqual(b, vec4(1.0))));
`,dtype:`bool`}),dG={kernelName:pn,backendName:`webgl`,kernelFunc:uG};J();var fG=kB({opSnippet:`return float(!(x >= 1.0));`}),pG={kernelName:mn,backendName:`webgl`,kernelFunc:fG};J();var mG=AB({opSnippet:`return float(a >= 1.0 || b >= 1.0);`,packedOpSnippet:`
  return min(
    vec4(greaterThanEqual(a, vec4(1.0))) +
    vec4(greaterThanEqual(b, vec4(1.0))),
    vec4(1.0));
`,dtype:`bool`}),hG={kernelName:hn,backendName:`webgl`,kernelFunc:mG},gG=class{constructor(e,t,n,r,i){this.variableNames=[`x`],this.outputShape=[];let a=t,o=e[3]-1;this.outputShape=e;let s,c=`float(${n}) + float(${r}) * sum`;s=i===.5?`inversesqrt(${c})`:i===1?`1.0/(${c})`:`exp(log(${c}) * float(-${i}));`,this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int r = coords[1];
        int c = coords[2];
        int d = coords[3];
        float x = getX(b, r, c, d);
        float sum = 0.0;
        for (int j = -${a}; j <= ${a}; j++) {
          int idx = d + j;
          if (idx >= 0 && idx <=  ${o}) {
            float z = getX(b, r, c, idx);
            sum += z * z;
          }
        }
        float val = x * ${s};
        setOutput(val);
      }
    `}},_G=class{constructor(e,t,n,r,i){this.variableNames=[`x`],this.outputShape=[],this.packedInputs=!0,this.packedOutput=!0;let a=t,o=e[3]-1;this.outputShape=e;let s,c=`float(${n}) + float(${r}) * sum`;s=i===.5?`inversesqrt(${c})`:i===1?`1.0/(${c})`:`exp(log(${c}) * float(-${i}));`,this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords.x;
        int r = coords.y;
        int c = coords.z;
        int d = coords.w;

        bool hasNextCol = d < ${this.outputShape[3]};
        bool hasNextRow = c < ${this.outputShape[2]};

        vec4 sum = vec4(0.);
        vec4 xFragAtOutputCoords = getX(b, r, c, d);

        vec4 xAtOutputCoords = vec4(
          getChannel(xFragAtOutputCoords, vec2(c, d)),
          hasNextCol ?
            getChannel(xFragAtOutputCoords, vec2(c, d + 1)) : 0.0,
          hasNextRow ?
            getChannel(xFragAtOutputCoords , vec2(c + 1, d)) : 0.0,
          (hasNextRow && hasNextCol) ?
            getChannel(xFragAtOutputCoords, vec2(c + 1, d + 1)) : 0.0
        );

        int firstChannel = d - ${a};
        vec2 cache = vec2(0.);
        if(firstChannel >= 0){
          vec4 firstChannelFrag = getX(b, r, c, firstChannel);
          cache.x = getChannel(firstChannelFrag, vec2(c, firstChannel));
            if(hasNextRow){
              cache.y = getChannel(firstChannelFrag, vec2(c + 1, firstChannel));
            }
        }

        ivec2 depth = ivec2(d, d + 1);
        for (int j = - ${a}; j <= ${a}; j++) {
          ivec2 idx = depth + j;
          bvec2 aboveLowerBound = greaterThanEqual(idx, ivec2(0));
          bvec2 belowUpperBound = lessThanEqual(idx, ivec2(${o}));

          bool depthInRange = aboveLowerBound.x && belowUpperBound.x;
          bool depthPlusOneInRange = aboveLowerBound.y && belowUpperBound.y;

          if(depthInRange || depthPlusOneInRange){
            vec4 z = vec4(0.);
            vec4 xFragAtCurrentDepth;
            z.xz = cache.xy;
            if(depthPlusOneInRange && hasNextCol){
              xFragAtCurrentDepth = idx.y != d ?
                getX(b, r, c, idx.y) : xFragAtOutputCoords;
              z.y = getChannel(xFragAtCurrentDepth, vec2(c, idx.y));
              if(hasNextRow){
                z.w = getChannel(xFragAtCurrentDepth, vec2(c + 1, idx.y));
              }
            }
            cache.xy = z.yw;
            sum += z * z;
          }
        }
        vec4 result = xAtOutputCoords * ${s};
        setOutput(result);
      }
    `}};J();var vG={kernelName:`LRN`,backendName:`webgl`,kernelFunc:e=>{let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{depthRadius:a,bias:o,alpha:s,beta:c}=r,l=M().getBool(`WEBGL_PACK_NORMALIZATION`)?new _G(i.shape,a,o,s,c):new gG(i.shape,a,o,s,c);return n.runWebGLProgram(l,[i],i.dtype)}},yG=class{constructor(e,t,n,r,i){this.variableNames=[`inputImage`,`outputImage`,`dy`],this.outputShape=[],this.outputShape=e,this.depth=e[3],this.depthRadius=t,this.bias=n,this.alpha=r,this.beta=i,this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int r = coords[1];
        int c = coords[2];

        float result = 0.0;
        for (int d = 0; d < ${this.depth}; ++d) {
          int depthBegin = int(max(0.0, float(d - ${t})));
          int depthEnd = int(min(float(${this.depth}),
              float(d + ${t} + 1)));

          const int MIN_DEPTH_BEGIN = 0;
          const int MAX_DEPTH_END = ${this.depth};

          float norm = 0.0;
          for (int k = MIN_DEPTH_BEGIN; k < MAX_DEPTH_END; ++k) {
            if (k < depthBegin){
              continue;
            }
            else if (k >= depthBegin && k < depthEnd) {
              norm += getInputImage(b, r, c, k) * getInputImage(b, r, c, k);
            }
            else {
              break;
            }
          }

          norm = float(${r}) * norm + float(${n});

          for(int k = MIN_DEPTH_BEGIN; k < MAX_DEPTH_END; ++k){
            if (k < depthBegin){
              continue;
            }
            else if (k >= depthBegin && k < depthEnd){
              float dyi = -2.0 * float(${r})
                * float(${i})
                * getInputImage(b, r, c, k) * getOutputImage(b, r, c, d)
                / norm;
              if (k == d) {
                dyi += pow(norm, -1.0 * ${i});
              }
              if (k == coords[3]) {
                dyi *= getDy(b, r, c, d);
                result += dyi;
              }
            }
            else {
              break;
            }
          }
      }
      setOutput(result);
      }
    `}};J();var bG={kernelName:yn,backendName:`webgl`,kernelFunc:e=>{let{inputs:t,backend:n,attrs:r}=e,{x:i,y:a,dy:o}=t,{depthRadius:s,bias:c,alpha:l,beta:u}=r,d=new yG(i.shape,s,c,l,u);return n.runWebGLProgram(d,[i,a,o],i.dtype)}};J();function xG(e,t,n,r){let i=O(t),a=O(e.shape)/i,o=Q({inputs:{x:e},attrs:{shape:[a,i]},backend:r}),s=UB(o,e.dtype,`max`,r),c=Q({inputs:{x:s},attrs:{shape:n},backend:r});return r.disposeIntermediateTensorInfo(o),r.disposeIntermediateTensorInfo(s),c}J();function SG(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{reductionIndices:a,keepDims:o}=r,s=i.shape.length,c=A(a,i.shape),l=c,u=xf(l,s),d=u!=null,f=n.shouldExecuteOnCPU([i]),p=i;if(d){if(f){let e=n.texData.get(p.dataId).values,t=Array(s);for(let e=0;e<t.length;e++)t[e]=i.shape[u[e]];let r=Tz(e,i.shape,i.dtype,u,t);p=n.makeTensorInfo(t,i.dtype);let a=n.texData.get(p.dataId);a.values=r}else p=qB(i,u,n);l=Cf(l.length,s)}bf(`max`,l,s);let[m,h]=vf(p.shape,l),g=m;o&&(g=yf(m,c));let _;if(f){let e=n.texData.get(p.dataId).values,t=ZR(e,O(h),g,i.dtype);_=n.makeTensorInfo(g,i.dtype);let r=n.texData.get(_.dataId);r.values=t}else _=xG(p,h,g,n);return d&&n.disposeIntermediateTensorInfo(p),_}var CG={kernelName:`Max`,backendName:`webgl`,kernelFunc:SG};J();var wG=AB({opSnippet:fB+`
  return max(a, b);
`,packedOpSnippet:`
  vec4 result = vec4(max(a, b));
  bvec4 isNaNA = isnan(a);
  bvec4 isNaNB = isnan(b);
  bvec4 isNaN = bvec4(isNaNA.x || isNaNB.x, isNaNA.y || isNaNB.y, isNaNA.z || isNaNB.z, isNaNA.w || isNaNB.w);
  `+mB+`
  return result;
`,cpuKernelImpl:QR}),TG={kernelName:xn,backendName:`webgl`,kernelFunc:wG};J();function EG(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t;JI(i,`maxPool`);let{filterSize:a,strides:o,pad:s,dimRoundingMode:c}=r;E(yl(o,1),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${o} and dilations '1'`);let l=al(i.shape,a,o,1,s,c);if(l.filterWidth===1&&l.filterHeight===1&&k(l.inShape,l.outShape))return gB({inputs:{x:i},backend:n});let u=new RV(l,`max`,!1);return n.runWebGLProgram(u,[i],i.dtype)}var DG={kernelName:Sn,backendName:`webgl`,kernelFunc:EG};J();function OG(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{filterSize:a,strides:o,pad:s,dataFormat:c,dimRoundingMode:l}=r,u=new zV(ol(i.shape,a,o,[1,1,1],s,l,c),`max`,!1);return n.runWebGLProgram(u,[i],i.dtype)}var kG={kernelName:wn,backendName:`webgl`,kernelFunc:OG},AG=class{constructor(e){this.variableNames=[`dy`,`maxPos`],this.outputShape=e.inShape;let t=e.strideHeight,n=e.strideWidth,r=e.dilationHeight,i=e.effectiveFilterHeight,a=e.effectiveFilterWidth,o=i-1-e.padInfo.top,s=a-1-e.padInfo.left,c=i*a-1;this.userCode=`
      const ivec2 pads = ivec2(${o}, ${s});

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];

        ivec2 dyRCCorner = coords.yz - pads;
        int dyRCorner = dyRCCorner.x;
        int dyCCorner = dyRCCorner.y;

        // Convolve dy(?, ?, d) with pos mask(:, :, d) to get dx(xR, xC, d).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < ${i};
          wR += ${r}) {
          float dyR = float(dyRCorner + wR) / ${t}.0;

          if (dyR < 0.0 || dyR >= ${e.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          for (int wC = 0; wC < ${a}; wC++) {
            float dyC = float(dyCCorner + wC) / ${n}.0;

            if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            float dyValue = getDy(b, idyR, idyC, d);
            int maxPosValue = ${c} - int(getMaxPos(b, idyR, idyC, d));

            // Get the current value, check it against the value from the
            // position matrix.
            int curPosValue = wR * ${a} + wC;
            float mask = float(maxPosValue == curPosValue ? 1.0 : 0.0);

            dotProd += dyValue * mask;
          }
        }
        setOutput(dotProd);
      }
    `}},jG=class{constructor(e){this.variableNames=[`dy`,`maxPos`],this.outputShape=e.inShape;let t=e.strideDepth,n=e.strideHeight,r=e.strideWidth,i=e.dilationDepth,a=e.dilationHeight,o=e.dilationWidth,s=e.effectiveFilterDepth,c=e.effectiveFilterHeight,l=e.effectiveFilterWidth,u=s-1-e.padInfo.front,d=c-1-e.padInfo.top,f=l-1-e.padInfo.left,p=s*c*l-1;this.userCode=`
      const ivec3 pads = ivec3(${u}, ${d}, ${f});

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int ch = coords.u;

        ivec3 dyCorner = ivec3(coords.y, coords.z, coords.w) - pads;
        int dyDCorner = dyCorner.x;
        int dyRCorner = dyCorner.y;
        int dyCCorner = dyCorner.z;

        // Convolve dy(?, ?, ?, ch) with pos mask(:, :, :, d) to get
        // dx(xD, xR, xC, ch).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;

        for (int wD = 0; wD < ${s};
           wD += ${i}) {
          float dyD = float(dyDCorner + wD) / ${t}.0;

          if (dyD < 0.0 || dyD >= ${e.outDepth}.0 || fract(dyD) > 0.0) {
            continue;
          }
          int idyD = int(dyD);

          for (int wR = 0; wR < ${c};
              wR += ${a}) {
            float dyR = float(dyRCorner + wR) / ${n}.0;

            if (dyR < 0.0 || dyR >= ${e.outHeight}.0 ||
                fract(dyR) > 0.0) {
              continue;
            }
            int idyR = int(dyR);

            for (int wC = 0; wC < ${l};
                wC += ${o}) {
              float dyC = float(dyCCorner + wC) / ${r}.0;

              if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                  fract(dyC) > 0.0) {
                continue;
              }
              int idyC = int(dyC);

              float dyValue = getDy(batch, idyD, idyR, idyC, ch);
              int maxPosValue = ${p} -
                  int(getMaxPos(batch, idyD, idyR, idyC, ch));

              // Get the current value, check it against the value from the
              // position matrix.
              int curPosValue =
                  wD * ${c} * ${l} +
                  wR * ${l} + wC;
              float mask = float(maxPosValue == curPosValue ? 1.0 : 0.0);

              dotProd += dyValue * mask;
            }
          }
        }
        setOutput(dotProd);
      }
    `}};J();function MG(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a}=t,o=a,{filterSize:s,strides:c,pad:l,dimRoundingMode:u}=r,d=ol(o.shape,s,c,[1,1,1],l,u),f=new zV(d,`max`,!0),p=n.runWebGLProgram(f,[o],o.dtype),m=new jG(d),h=n.runWebGLProgram(m,[i,p],o.dtype);return n.disposeIntermediateTensorInfo(p),h}var NG={kernelName:Tn,backendName:`webgl`,kernelFunc:MG};J();function PG(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a,output:o}=t,s=a;JI([a,o],`maxPoolGrad`);let{filterSize:c,strides:l,pad:u,dimRoundingMode:d}=r,f=al(s.shape,c,l,1,u,d),p=new RV(f,`max`,!0),m=n.runWebGLProgram(p,[s],s.dtype),h=new AG(f),g=n.runWebGLProgram(h,[i,m],s.dtype);return n.disposeIntermediateTensorInfo(m),g}var FG={kernelName:Cn,backendName:`webgl`,kernelFunc:PG};function IG(e,t,n,r){let i=new RV(n,`max`,!1),a=r.runWebGLProgram(i,[e],`float32`);return i=new RV(n,`max`,!0,!0,t),[a,r.runWebGLProgram(i,[e],`float32`)]}J();var LG={kernelName:En,backendName:`webgl`,kernelFunc:({inputs:e,attrs:t,backend:n})=>{let{x:r}=e,{filterSize:i,strides:a,pad:o,includeBatchInIndex:s}=t,c=n;E(r.shape.length===4,()=>`Error in maxPool: input must be rank 4 but got rank ${r.shape.length}.`);let l=[1,1];E(yl(a,l),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${a} and dilations '${l}'`);let[u,d]=IG(r,s,al(r.shape,i,a,l,o),c);return[u,d]}};J();function RG(e,t,n,r){let i=O(t),a=O(e.shape)/i,o=Q({inputs:{x:e},attrs:{shape:[a,i]},backend:r}),s=UB(o,`float32`,`mean`,r),c=Q({inputs:{x:s},attrs:{shape:n},backend:r});return r.disposeIntermediateTensorInfo(o),r.disposeIntermediateTensorInfo(s),c}J();var zG={kernelName:Dn,backendName:`webgl`,kernelFunc:({inputs:e,attrs:t,backend:n})=>{let{x:r}=e,{keepDims:i,axis:a}=t,o=n,s=r.shape.length,c=A(a,r.shape),l=c,u=xf(l,s),d=u!=null,f=o.shouldExecuteOnCPU([r]),p=[],m=r;if(d){if(f){let e=o.texData.get(m.dataId).values,t=Array(s);for(let e=0;e<t.length;e++)t[e]=r.shape[u[e]];let n=Tz(e,r.shape,r.dtype,u,t);m=o.makeTensorInfo(t,r.dtype);let i=o.texData.get(m.dataId);i.values=n}else m=qB(r,u,o);p.push(m),l=Cf(l.length,s)}bf(`sum`,l,s);let[h,g]=vf(m.shape,l),_=h;i&&(_=yf(h,c));let v=RG(m,g,_,o);for(let e of p)o.disposeIntermediateTensorInfo(e);return v}};J();function BG(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r,s=i.shape.length,c=A(a,i.shape),l=c,u=xf(l,s),d=i;u!=null&&(d=ZB({inputs:{x:i},backend:n,attrs:{perm:u}}),l=Cf(l.length,i.shape.length)),bf(`min`,l,s);let[f,p]=vf(d.shape,l),m=O(p),h=Q({inputs:{x:d},backend:n,attrs:{shape:[-1,m]}}),g=UB(h,h.dtype,`min`,n),_;if(o){let e=yf(f,c);_=Q({inputs:{x:g},backend:n,attrs:{shape:e}})}else _=Q({inputs:{x:g},backend:n,attrs:{shape:f}});return n.disposeIntermediateTensorInfo(h),n.disposeIntermediateTensorInfo(g),u!=null&&n.disposeIntermediateTensorInfo(d),_}var VG={kernelName:`Min`,backendName:`webgl`,kernelFunc:BG};J();var HG=AB({opSnippet:fB+`
  return min(a, b);
`,packedOpSnippet:`
  vec4 result = vec4(min(a, b));
  bvec4 isNaNA = isnan(a);
  bvec4 isNaNB = isnan(b);
  bvec4 isNaN = bvec4(isNaNA.x || isNaNB.x, isNaNA.y || isNaNB.y, isNaNA.z || isNaNB.z, isNaNA.w || isNaNB.w);
  `+mB+`
  return result;
`,cpuKernelImpl:$R}),UG={kernelName:On,backendName:`webgl`,kernelFunc:HG},WG=class{constructor(e,t,n){this.variableNames=[`x`],this.outputShape=t.map((t,n)=>t[0]+e[n]+t[1]);let r=e.length,i=GL(r),a=t.map(e=>e[0]).join(`,`),o=t.map((t,n)=>t[0]+e[n]).join(`,`),s=[`coords[0]`,`coords[1]`,`coords[2]`,`coords[3]`].slice(0,r),c=n===`reflect`?0:1;if(r===1){this.userCode=`
        int start = ${a};
        int end = ${o};

        void main() {
          int outC = getOutputCoords();
          if (outC < start) {
            outC = start * 2 - outC - ${c};
          } else if(outC >= end) {
            outC = (end - 1) * 2 - outC + ${c};
          }
          setOutput(getX(outC - start));
        }
      `;return}this.userCode=`
      ${i} start = ${i}(${a});
      ${i} end = ${i}(${o});

      void main() {
        ${i} outC = getOutputCoords();
        for (int i = 0; i < ${r}; i++) {
          if (outC[i] < start[i]) {
            outC[i] = start[i] * 2 - outC[i] - ${c};
          } else if(outC[i] >= end[i]) {
            outC[i] = (end[i] - 1) * 2 - outC[i] + ${c};
          }
        }
        ${i} coords = outC - start;
        setOutput(getX(${s}));
      }
    `}},GG=class{constructor(e,t,n){this.variableNames=[`x`],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=t.map((t,n)=>t[0]+e[n]+t[1]);let r=e.length,i=GL(r),a=t.map(e=>e[0]).join(`,`),o=t.map((t,n)=>t[0]+e[n]).join(`,`),s=Oz(`rc`,r),c=Oz(`source`,r),l=`${s[r-1]} < ${this.outputShape[r-1]}`,u=r===1?`source`:`vec2(${c.slice(-2).join()})`,d=n===`reflect`?0:1,f=``;if(r===1){let e=`
        ${i} source = rc;
        if (source < start) {
          source = start * 2 - source - ${d};
        } else if (source >= end) {
          source = (end - 1) * 2 - source + ${d};
        }
        source -= start;
      `;f=`
        ${i} rc = outputLoc;
        ${e}
        result[0] = getChannel(getX(${c.join()}), ${u});
        ${s[r-1]} += 1;
        if(${l}) {
          ${e}
          result[1] = getChannel(getX(${c.join()}), ${u});
        }
      `}else{let e=`
        ${i} source = rc;
        ${i} lt = ${i}(lessThan(source, start));
        ${i} gte = ${i}(greaterThanEqual(source, end));
        ${i} orig = 1 - (lt + gte);
        source = orig * source +
                lt * (start * 2 - source - ${d}) +
                gte * ((end - 1) * 2 - source + ${d});
        source -= start;
      `;f=`
        ${i} rc = outputLoc;
        ${e}
        result[0] = getChannel(getX(${c.join()}), ${u});
        ${s[r-1]} += 1;
        if(${l}) {
          ${e}
          result[1] = getChannel(getX(${c.join()}), ${u});
        }
        rc = outputLoc;
        ${s[r-2]} += 1;
        if(${s[r-2]} < ${this.outputShape[r-2]}) {
          ${e}
          result[2] = getChannel(getX(${c.join()}), ${u});
          ${s[r-1]} += 1;
          if(${l}) {
            ${e}
            result[3] = getChannel(getX(${c.join()}), ${u});
          }
        }
      `}this.userCode=`
      const ${i} start = ${i}(${a});
      const ${i} end = ${i}(${o});

      void main() {
        ${i} outputLoc = getOutputCoords();
        vec4 result = vec4(0.);
        ${f}
        setOutput(result);
      }
    `}};J();var KG={kernelName:kn,backendName:`webgl`,kernelFunc:({inputs:e,backend:t,attrs:n})=>{let{x:r}=e,{paddings:i,mode:a}=n,o=M().getBool(`WEBGL_PACK_ARRAY_OPERATIONS`)?new GG(r.shape,i,a):new WG(r.shape,i,a);return t.runWebGLProgram(o,[r],r.dtype)}};J();var qG={kernelName:`Mod`,backendName:`webgl`,kernelFunc:AB({opSnippet:`if (b == 0.0) return NAN;
  return mod(a, b);`,packedOpSnippet:`
  vec4 result = mod(a, b);
  bvec4 isNaN = equal(b, vec4(0.0));
  `+mB+`
  return result;
`})},JG=class{constructor(e,t,n){this.variableNames=[`probs`],this.customUniforms=[{name:`seed`,type:`float`}],this.outputShape=[e,n],this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];

        float r = random(seed);
        float cdf = 0.0;

        for (int i = 0; i < ${t-1}; i++) {
          cdf += getProbs(batch, i);

          if (r < cdf) {
            setOutput(float(i));
            return;
          }
        }

        // If no other event happened, last event happened.
        setOutput(float(${t-1}));
      }
    `}};J();var YG=AB({opSnippet:`
if (a == b) {
  return 1.0;
};
return a / b;`,packedOpSnippet:`
  // vec4 one = vec4(equal(a, b));
  // return one + (vec4(1.0) - one) * a / b;
  vec4 result = a / b;
  if(a.x == b.x) {
    result.x = 1.;
  }
  if(a.y == b.y) {
    result.y = 1.;
  }
  if(a.z == b.z) {
    result.z = 1.;
  }
  if(a.w == b.w) {
    result.w = 1.;
  }

  return result;
`,checkOutOfBounds:!0}),XG={kernelName:Bt,backendName:`webgl`,kernelFunc:YG};J();var ZG=`return a - b;`,QG=AB({opSnippet:ZG,packedOpSnippet:ZG,supportsComplex:!0,cpuKernelImpl:Sz}),$G={kernelName:`Sub`,backendName:`webgl`,kernelFunc:QG};J();function eK(e){let{inputs:t,backend:n,attrs:r}=e,{logits:i}=t,{dim:a}=r,o=A([a],i.shape),s=SG({inputs:{x:i},backend:n,attrs:{reductionIndices:o,keepDims:!1}}),c=yf(s.shape,o),l=Q({inputs:{x:s},backend:n,attrs:{shape:c}}),u=QG({inputs:{a:i,b:l},backend:n}),d=aW({inputs:{x:u},backend:n}),f=YB({inputs:{x:d},backend:n,attrs:{axis:o,keepDims:!1}}),p=Q({inputs:{x:f},backend:n,attrs:{shape:c}}),m=YG({inputs:{a:d,b:p},backend:n});return n.disposeIntermediateTensorInfo(s),n.disposeIntermediateTensorInfo(l),n.disposeIntermediateTensorInfo(u),n.disposeIntermediateTensorInfo(d),n.disposeIntermediateTensorInfo(f),n.disposeIntermediateTensorInfo(p),m}var tK={kernelName:vr,backendName:`webgl`,kernelFunc:eK};J();function nK(e){let{inputs:t,backend:n,attrs:r}=e,{logits:i}=t,{numSamples:a,seed:o,normalized:s}=r,c=s?i:eK({inputs:{logits:i},backend:n,attrs:{dim:i.shape.length-1}}),l=c.shape[0],u=c.shape[1],d=new JG(l,u,a),f=[[o]],p=n.runWebGLProgram(d,[c],`int32`,f);return s||n.disposeIntermediateTensorInfo(c),p}var rK={kernelName:An,backendName:`webgl`,kernelFunc:nK};J();var iK=Vz+`
  return -x;
`,aK=`
  vec4 result = -x;
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`;function oK(e){let{inputs:t,backend:n}=e,{x:r}=t;if(n.shouldExecuteOnCPU([r])){let[e,t]=tz(n.texData.get(r.dataId).values,r.shape,r.dtype);return n.makeTensorInfo(t,r.dtype,e)}let i;return i=M().getBool(`WEBGL_PACK_UNARY_OPERATIONS`)?new eB(r.shape,aK):new Bz(r.shape,iK),n.runWebGLProgram(i,[r],r.dtype)}var sK={kernelName:`Neg`,backendName:`webgl`,kernelFunc:oK};J();var cK=Hx;function lK(e){qr(`tf.nonMaxSuppression() in webgl locks the UI thread. Call tf.nonMaxSuppressionAsync() instead`);let{inputs:t,backend:n,attrs:r}=e,{boxes:i,scores:a}=t,{maxOutputSize:o,iouThreshold:s,scoreThreshold:c}=r,{selectedIndices:l}=cK(n.readSync(i.dataId),n.readSync(a.dataId),o,s,c);return n.makeTensorInfo([l.length],`int32`,new Int32Array(l))}var uK={kernelName:Nn,backendName:`webgl`,kernelFunc:lK};J();var dK=Ux;function fK(e){qr(`tf.nonMaxSuppression() in webgl locks the UI thread. Call tf.nonMaxSuppressionAsync() instead`);let{inputs:t,backend:n,attrs:r}=e,{boxes:i,scores:a}=t,{maxOutputSize:o,iouThreshold:s,scoreThreshold:c,padToMaxOutputSize:l}=r,{selectedIndices:u,validOutputs:d}=dK(n.readSync(i.dataId),n.readSync(a.dataId),o,s,c,l);return[n.makeTensorInfo([u.length],`int32`,new Int32Array(u)),n.makeTensorInfo([],`int32`,new Int32Array([d]))]}var pK={kernelName:Pn,backendName:`webgl`,kernelFunc:fK};J();var mK=Wx;function hK(e){qr(`tf.nonMaxSuppression() in webgl locks the UI thread. Call tf.nonMaxSuppressionAsync() instead`);let{inputs:t,backend:n,attrs:r}=e,{boxes:i,scores:a}=t,{maxOutputSize:o,iouThreshold:s,scoreThreshold:c,softNmsSigma:l}=r,{selectedIndices:u,selectedScores:d}=mK(n.readSync(i.dataId),n.readSync(a.dataId),o,s,c,l);return[n.makeTensorInfo([u.length],`int32`,new Int32Array(u)),n.makeTensorInfo([d.length],`float32`,new Float32Array(d))]}var gK={kernelName:Fn,backendName:`webgl`,kernelFunc:hK},_K=class{constructor(e,t,n,r){this.variableNames=[`indices`],this.outputShape=[e,t],this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int index = round(getIndices(coords.x));
        setOutput(mix(float(${r}), float(${n}),
                      float(index == coords.y)));
      }
    `}};J();var vK={kernelName:Ln,backendName:`webgl`,kernelFunc:e=>{let{inputs:t,backend:n,attrs:r}=e,{indices:i}=t,{dtype:a,depth:o,onValue:s,offValue:c}=r,l=O(i.shape),u=new _K(l,o,s,c),d=Q({inputs:{x:i},backend:n,attrs:{shape:[l]}}),f=n.runWebGLProgram(u,[d],a);n.disposeIntermediateTensorInfo(d);let p=[...i.shape,o],m=Q({inputs:{x:f},backend:n,attrs:{shape:p}});return n.disposeIntermediateTensorInfo(f),m}};J();function yK(e){let{inputs:t,backend:n}=e,{x:r}=t;if(r.dtype===`complex64`){let e=yH({inputs:{input:r},backend:n}),t=yK({inputs:{x:e},backend:n}),i=zH({inputs:{input:r},backend:n}),a=yK({inputs:{x:i},backend:n}),o=vB({inputs:{real:t,imag:a},backend:n});return n.disposeIntermediateTensorInfo(e),n.disposeIntermediateTensorInfo(t),n.disposeIntermediateTensorInfo(i),n.disposeIntermediateTensorInfo(a),o}else return _W({attrs:{shape:r.shape,dtype:r.dtype,value:r.dtype===`string`?``:0},backend:n})}var bK={kernelName:Br,backendName:`webgl`,kernelFunc:yK};J();function xK(e){let{inputs:t,backend:n}=e,{x:r}=t;if(r.dtype===`string`)throw Error(`onesLike is not supported under string dtype`);if(r.dtype===`complex64`){let e=yH({inputs:{input:r},backend:n}),t=xK({inputs:{x:e},backend:n}),i=zH({inputs:{input:r},backend:n}),a=yK({inputs:{x:i},backend:n}),o=vB({inputs:{real:t,imag:a},backend:n});return n.disposeIntermediateTensorInfo(e),n.disposeIntermediateTensorInfo(t),n.disposeIntermediateTensorInfo(i),n.disposeIntermediateTensorInfo(a),o}else return _W({attrs:{shape:r.shape,dtype:r.dtype,value:1},backend:n})}var SK={kernelName:In,backendName:`webgl`,kernelFunc:xK};J();function CK(e){let{inputs:t,backend:n,attrs:r}=e,{axis:i}=r;if(t.length===1)return sW({inputs:{input:t[0]},backend:n,attrs:{dim:i}});let a=t[0].shape,o=t[0].dtype;t.forEach(e=>{D(a,e.shape,`All tensors passed to stack must have matching shapes`),E(o===e.dtype,()=>`All tensors passed to stack must have matching dtypes`)});let s=[],c=UH({inputs:t.map(e=>{let t=sW({inputs:{input:e},backend:n,attrs:{dim:i}});return s.push(t),t}),backend:n,attrs:{axis:i}});return s.forEach(e=>n.disposeIntermediateTensorInfo(e)),c}var wK={kernelName:Rn,backendName:`webgl`,kernelFunc:CK},TK=class{constructor(e,t,n){this.variableNames=[`x`],this.customUniforms=[{name:`value`,type:`float`}],this.outputShape=t.map((t,n)=>t[0]+e[n]+t[1]);let r=e.length,i=GL(r),a=t.map(e=>e[0]).join(`,`),o=t.map((t,n)=>t[0]+e[n]).join(`,`),s=[`coords[0]`,`coords[1]`,`coords[2]`,`coords[3]`].slice(0,r);if(r===1){this.userCode=`
        int start = ${a};
        int end = ${o};

        void main() {
          int outC = getOutputCoords();
          if (outC < start || outC >= end) {
            setOutput(value);
          } else {
            setOutput(getX(outC - start));
          }
        }
      `;return}this.userCode=`
      ${i} start = ${i}(${a});
      ${i} end = ${i}(${o});

      void main() {
        ${i} outC = getOutputCoords();
        if (any(lessThan(outC, start)) || any(greaterThanEqual(outC, end))) {
          setOutput(value);
        } else {
          ${i} coords = outC - start;
          setOutput(getX(${s}));
        }
      }
    `}},EK=class{constructor(e,t,n){this.variableNames=[`x`],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:`value`,type:`float`}],this.outputShape=t.map((t,n)=>t[0]+e[n]+t[1]);let r=e.length,i=GL(r),a=t.map(e=>e[0]).join(`,`),o=t.map((t,n)=>t[0]+e[n]).join(`,`),s=Oz(`rc`,r),c=Oz(`source`,r),l=`${s[r-1]} < ${this.outputShape[r-1]}`,u=r===1?`source`:`vec2(${c.slice(-2).join()})`,d=[`${i} rc = outputLoc;`,`${s[r-1]} += 1;
       if(${l}) {
      `,r===1?``:`}
       rc = outputLoc;
       ${s[r-2]} += 1;
       if(${s[r-2]} < ${this.outputShape[r-2]}) {`,r===1?``:`  ${s[r-1]} += 1;
         if(${l}) {`],f=r===1?`rc < start || rc >= end`:`any(lessThan(rc, start)) || any(greaterThanEqual(rc, end))`,p=``;for(let e=0,t=r===1?2:4;e<t;e++)p+=`
        ${d[e]}
        if (${f}) {
          result[${e}] = float(value);
        } else {
          ${i} source = rc - start;
          result[${e}] = getChannel(getX(${c.join()}), ${u});
        }
      `;p+=r===1?`} `:`}}`,this.userCode=`
      const ${i} start = ${i}(${a});
      const ${i} end = ${i}(${o});

      void main() {
        ${i} outputLoc = getOutputCoords();
        vec4 result = vec4(0.);
        ${p}
        setOutput(result);
      }
    `}};J();var DK=e=>{let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{paddings:a,constantValue:o}=r;if(O(i.shape)===0)return _W({backend:n,attrs:{shape:a.map((e,t)=>e[0]+i.shape[t]+e[1]),value:o,dtype:i.dtype}});let s=M().getBool(`WEBGL_PACK_ARRAY_OPERATIONS`)?new EK(i.shape,a,o):new TK(i.shape,a,o),c=[[o]];return n.runWebGLProgram(s,[i],i.dtype,c)},OK={kernelName:zn,backendName:`webgl`,kernelFunc:DK};J();var kK={kernelName:`Pow`,backendName:`webgl`,kernelFunc:AB({opSnippet:`
  if(a < 0.0 && floor(b) < b){
    return NAN;
  }
  if (b == 0.0) {
    return 1.0;
  }
  return (round(mod(b, 2.0)) != 1) ?
      pow(abs(a), b) : sign(a) * pow(abs(a), b);
`,packedOpSnippet:`
  // isModRound1 has 1 for components with round(mod(b, 2.0)) == 1, 0 otherwise.
  vec4 isModRound1 = vec4(equal(round(mod(b, 2.0)), ivec4(1)));
  vec4 multiplier = sign(a) * isModRound1 + (vec4(1.0) - isModRound1);
  vec4 result = multiplier * pow(abs(a), b);

  // Ensure that a^0 = 1, including 0^0 = 1 as this correspond to TF and JS
  bvec4 isExpZero = equal(b, vec4(0.0));
  result.r = isExpZero.r ? 1.0 : result.r;
  result.g = isExpZero.g ? 1.0 : result.g;
  result.b = isExpZero.b ? 1.0 : result.b;
  result.a = isExpZero.a ? 1.0 : result.a;

  bvec4 isNaN1 = lessThan(a, vec4(0.0));
  bvec4 isNaN2 = lessThan(floor(b), b);
  bvec4 isNaN = bvec4(isNaN1.x && isNaN2.x, isNaN1.y && isNaN2.y, isNaN1.z && isNaN2.z, isNaN1.w && isNaN2.w);
  `+mB+`
  return result;
`})};J();function AK(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r,s=i.shape.length,c=[],l=A(a,i.shape),u=l,d=xf(u,s),f=i;d!=null&&(f=ZB({inputs:{x:i},backend:n,attrs:{perm:d}}),u=Cf(u.length,s),c.push(f)),bf(`prod`,u,s);let p;if(n.shouldExecuteOnCPU([f])){let e=n.texData.get(f.dataId).values,{outVals:t,outShape:r,outDtype:i}=rz(f.shape,f.dtype,e,u);p=n.makeTensorInfo(r,i,t)}else{let[e,t]=vf(f.shape,u),r=O(t),a=Q({inputs:{x:f},backend:n,attrs:{shape:[-1,r]}}),o=UB(a,pa(i.dtype),`prod`,n);p=Q({inputs:{x:o},backend:n,attrs:{shape:e}}),c.push(a),c.push(o)}if(o){c.push(p);let e=yf(p.shape,l);p=Q({inputs:{x:p},backend:n,attrs:{shape:e}})}return c.forEach(e=>n.disposeIntermediateTensorInfo(e)),p}var jK={kernelName:Hn,backendName:`webgl`,kernelFunc:AK};J();function MK(e){let{inputs:t,backend:n,attrs:r}=e,{paramsNestedSplits:i,paramsDenseValues:a,indices:o}=t,{outputRaggedRank:s}=r,c=i.map(e=>n.readSync(e.dataId)),l=i.map(e=>e.shape),u=n.readSync(a.dataId),d=n.readSync(o.dataId),[f,p,m]=iz(c,l,u,a.shape,a.dtype,d,o.shape,s),h=f.map(e=>n.makeTensorInfo([e.length],`int32`,e)),g=n.makeTensorInfo(m,a.dtype,p);return h.concat([g])}var NK={kernelName:Un,backendName:`webgl`,kernelFunc:MK};J();function PK(e){let{inputs:t,backend:n}=e,{starts:r,limits:i,deltas:a}=t,o=n.readSync(r.dataId),s=n.readSync(i.dataId),c=n.readSync(a.dataId),[l,u]=az(o,r.shape,r.dtype,s,i.shape,c,a.shape);return[n.makeTensorInfo([l.length],`int32`,l),n.makeTensorInfo([u.length],r.dtype,u)]}var FK={kernelName:Wn,backendName:`webgl`,kernelFunc:PK};J();function IK(e){let{inputs:t,backend:n,attrs:r}=e,{shape:i,values:a,defaultValue:o,rowPartitionTensors:s}=t,{rowPartitionTypes:c}=r,l=n.readSync(i.dataId),u=n.readSync(a.dataId),d=n.readSync(o.dataId),f=s.map(e=>n.readSync(e.dataId)),p=s.map(e=>e.shape),[m,h]=oz(l,i.shape,u,a.shape,a.dtype,d,o.shape,f,p,c);return n.makeTensorInfo(m,a.dtype,h)}var LK={kernelName:Gn,backendName:`webgl`,kernelFunc:IK};J();var RK=e=>{let{backend:t,attrs:n}=e,{start:r,stop:i,step:a,dtype:o}=n,s=sz(r,i,a,o);return t.makeTensorInfo([s.length],o,s)},zK={kernelName:Kn,backendName:`webgl`,kernelFunc:RK};J();var BK=kB({opSnippet:`return 1.0 / x;`}),VK={kernelName:Jn,backendName:`webgl`,kernelFunc:BK};J();var HK=kB({opSnippet:Vz+`
  return (x < 0.0) ? 0.0 : x;
`,packedOpSnippet:`
  vec4 result = x * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`}),UK={kernelName:Yn,backendName:`webgl`,kernelFunc:HK};J();var WK=kB({opSnippet:Vz+`
  return (x < 0.0) ? 0.0 : min(6.0, x);
`,packedOpSnippet:`
  vec4 result = min(x, vec4(6.)) * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`}),GK={kernelName:tr,backendName:`webgl`,kernelFunc:WK},KK=class{constructor(e,t,n,r,i){this.variableNames=[`A`],this.outputShape=[];let[a,o,s,c]=e;this.outputShape=[a,t,n,c];let l=[r&&t>1?o-1:o,r&&n>1?s-1:s],u=[r&&t>1?t-1:t,r&&n>1?n-1:n],d;d=i?`(vec2(yRC) + vec2(0.5)) * effectiveInputOverOutputRatioRC - vec2(0.5)`:`vec2(yRC) * effectiveInputOverOutputRatioRC`,this.userCode=`
      const vec2 effectiveInputOverOutputRatioRC = vec2(
          ${l[0]/u[0]},
          ${l[1]/u[1]});
      const vec2 inputShapeRC = vec2(${o}.0, ${s}.0);

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        ivec2 yRC = coords.yz;

        // Fractional source index.
        vec2 sourceFracIndexRC = ${d};

        // Compute the four integer indices.
        ivec2 sourceFloorRC = ivec2(max(sourceFracIndexRC, vec2(0.0)));
        ivec2 sourceCeilRC = ivec2(
          min(inputShapeRC - 1.0, ceil(sourceFracIndexRC)));

        float topLeft = getA(b, sourceFloorRC.x, sourceFloorRC.y, d);
        float bottomLeft = getA(b, sourceCeilRC.x, sourceFloorRC.y, d);
        float topRight = getA(b, sourceFloorRC.x, sourceCeilRC.y, d);
        float bottomRight = getA(b, sourceCeilRC.x, sourceCeilRC.y, d);

        vec2 fracRC = sourceFracIndexRC - vec2(sourceFloorRC);

        float top = topLeft + (topRight - topLeft) * fracRC.y;
        float bottom = bottomLeft + (bottomRight - bottomLeft) * fracRC.y;
        float newValue = top + (bottom - top) * fracRC.x;

        setOutput(newValue);
      }
    `}},qK=class{constructor(e,t,n,r,i){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=[];let[a,o,s,c]=e;this.outputShape=[a,t,n,c];let l=[r&&t>1?o-1:o,r&&n>1?s-1:s],u=[r&&t>1?t-1:t,r&&n>1?n-1:n],d;d=i?`(vec3(yRC) + vec3(0.5)) * effectiveInputOverOutputRatioRC - vec3(0.5)`:`vec3(yRC) * effectiveInputOverOutputRatioRC`,this.userCode=`
      const vec3 effectiveInputOverOutputRatioRC = vec3(
          ${l[0]/u[0]},
          ${l[1]/u[1]},
          ${l[1]/u[1]});
      const vec3 inputShapeRC = vec3(${o}.0, ${s}.0,
                                     ${s}.0);

      float getAValue(int b, int r, int c, int d) {
        return getChannel(getA(b, r, c, d), vec2(c, d));
      }

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        // Calculate values for next column in yRC.z.
        ivec3 yRC = coords.yzz + ivec3(0, 0, 1);

        // Fractional source index.
        vec3 sourceFracIndexRC = ${d};

        // Compute the four integer indices.
        ivec3 sourceFloorRC = ivec3(max(sourceFracIndexRC, vec3(0.0)));
        ivec3 sourceCeilRC = ivec3(
          min(inputShapeRC - 1.0, ceil(sourceFracIndexRC)));

        // Should we calculate next column and row elements in 2x2 packed cell.
        bool hasNextCol = d < ${c-1};
        bool hasNextRow = coords.z < ${n-1};

        // In parallel, construct four corners for all four components in
        // packed 2x2 cell.
        vec4 topLeft = vec4(
          getAValue(b, sourceFloorRC.x, sourceFloorRC.y, d),
          hasNextCol ? getAValue(b, sourceFloorRC.x, sourceFloorRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceFloorRC.x, sourceFloorRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceFloorRC.x, sourceFloorRC.z, d + 1) : 0.0);

        vec4 bottomLeft = vec4(
          getAValue(b, sourceCeilRC.x, sourceFloorRC.y, d),
          hasNextCol ? getAValue(b, sourceCeilRC.x, sourceFloorRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceCeilRC.x, sourceFloorRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceCeilRC.x, sourceFloorRC.z, d + 1) : 0.0);

        vec4 topRight = vec4(
          getAValue(b, sourceFloorRC.x, sourceCeilRC.y, d),
          hasNextCol ? getAValue(b, sourceFloorRC.x, sourceCeilRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceFloorRC.x, sourceCeilRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceFloorRC.x, sourceCeilRC.z, d + 1) : 0.0);

        vec4 bottomRight = vec4(
          getAValue(b, sourceCeilRC.x, sourceCeilRC.y, d),
          hasNextCol ? getAValue(b, sourceCeilRC.x, sourceCeilRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceCeilRC.x, sourceCeilRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceCeilRC.x, sourceCeilRC.z, d + 1) : 0.0);

        vec3 fracRC = sourceFracIndexRC - vec3(sourceFloorRC);

        vec4 top = mix(topLeft, topRight, fracRC.yyzz);
        vec4 bottom = mix(bottomLeft, bottomRight, fracRC.yyzz);
        vec4 newValue = mix(top, bottom, fracRC.x);

        setOutput(newValue);
      }
    `}};J();function JK(e){let{inputs:t,backend:n,attrs:r}=e,{images:i}=t,{alignCorners:a,halfPixelCenters:o,size:s}=r,[c,l]=s,u=M().getBool(`WEBGL_PACK_IMAGE_OPERATIONS`)?new qK(i.shape,c,l,a,o):new KK(i.shape,c,l,a,o);return n.runWebGLProgram(u,[i],`float32`)}var YK={kernelName:$n,backendName:`webgl`,kernelFunc:JK},XK=class{constructor(e,t,n){this.variableNames=[`dy`],this.outputShape=[],this.outputShape=t;let[,r,i]=t,[,a,o]=e,s=[n&&a>1?r-1:r,n&&o>1?i-1:i],c=[n&&a>1?a-1:a,n&&o>1?o-1:o],l=s[0]/c[0],u=s[1]/c[1],d=1/l,f=1/u,p=Math.ceil(d)*2+2,m=Math.ceil(f)*2+2;this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        int r = coords[1];
        int c = coords[2];

        float accumulator = 0.0;

        const float heightScale = float(${l});
        const float widthScale = float(${u});

        const float invHeightScale = float(${d});
        const float invWidthScale = float(${f});

        const int winHeight = int(${p});
        const int winWidth = int(${m});

        // Compute bounds for where in dy we will look
        float startRLerp = floor(float(r) * invHeightScale);
        int startDyR = int(startRLerp - float(winHeight / 2));

        float startCLerp = floor(float(c) * invWidthScale);
        int startDyC = int(startCLerp - float(winWidth / 2));

        // Loop over dy
        for (int dyROffset = 0; dyROffset < winHeight; dyROffset++) {
          int dyR = dyROffset + startDyR;

          // Guard against the window exceeding the bounds of dy
          if (dyR < 0 || dyR >= ${a}) {
            continue;
          }

          for (int dyCOffset = 0; dyCOffset < winWidth; dyCOffset++) {
            int dyC = dyCOffset + startDyC;

            // Guard against the window exceeding the bounds of dy
            if (dyC < 0 || dyC >= ${o}) {
              continue;
            }

            float dxR = float(dyR) * heightScale;
            int topDxRIndex = int(floor(dxR));
            int bottomDxRIndex = int(min(ceil(dxR), ${r-1}.0));
            float dxRLerp = dxR - float(topDxRIndex);
            float inverseDxRLerp = 1.0 - dxRLerp;

            float dxC = float(dyC) * widthScale;
            int leftDxCIndex = int(floor(dxC));
            int rightDxCIndex = int(min(ceil(dxC), ${i-1}.0));
            float dxCLerp = dxC - float(leftDxCIndex);
            float inverseDxCLerp = 1.0 - dxCLerp;

            if (r == topDxRIndex && c == leftDxCIndex) {
              // topLeft
              accumulator +=
                getDy(b, dyR, dyC, d) * inverseDxRLerp * inverseDxCLerp;
            }

            if (r == topDxRIndex && c == rightDxCIndex) {
              // topRight
              accumulator += getDy(b, dyR, dyC, d) * inverseDxRLerp * dxCLerp;
            }

            if (r == bottomDxRIndex && c == leftDxCIndex) {
              // bottomLeft
              accumulator += getDy(b, dyR, dyC, d) * dxRLerp * inverseDxCLerp;
            }

            if (r == bottomDxRIndex && c == rightDxCIndex) {
              // bottomRight
              accumulator += getDy(b, dyR, dyC, d) * dxRLerp * dxCLerp;
            }
          }
        }
        // End loop over dy

        setOutput(accumulator);
      }
    `}};J();function ZK(e){let{inputs:t,backend:n,attrs:r}=e,{images:i,dy:a}=t,{alignCorners:o}=r,s=new XK(a.shape,i.shape,o);return n.runWebGLProgram(s,[a],a.dtype)}var QK={kernelName:er,backendName:`webgl`,kernelFunc:ZK},$K=class{constructor(e,t,n,r,i){this.variableNames=[`A`],this.outputShape=[];let[a,o,s,c]=e;this.outputShape=[a,t,n,c];let l=[r&&t>1?o-1:o,r&&n>1?s-1:s],u=[r&&t>1?t-1:t,r&&n>1?n-1:n],d=r?`0.5`:`0.0`,f;f=i?`max((vec2(yRC) + vec2(0.5)) * effectiveInputOverOutputRatioRC, vec2(0.0))`:`vec2(yRC) * effectiveInputOverOutputRatioRC`,this.userCode=`
      const vec2 effectiveInputOverOutputRatioRC = vec2(
          ${l[0]/u[0]},
          ${l[1]/u[1]});
      const vec2 inputShapeRC = vec2(${o}.0, ${s}.0);

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        ivec2 yRC = coords.yz;

        // Fractional source index.
        vec2 sourceFracIndexRC = ${f};

        // Compute the coordinators of nearest neighbor point.
        ivec2 sourceNearestRC = ivec2(
          min(inputShapeRC - 1.0, floor(sourceFracIndexRC + ${d})));
        float newValue = getA(b, sourceNearestRC.x, sourceNearestRC.y, d);

        setOutput(newValue);
      }
    `}},eq=class{constructor(e,t,n,r,i){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=[];let[a,o,s,c]=e;this.outputShape=[a,t,n,c];let l=[r&&t>1?o-1:o,r&&n>1?s-1:s],u=[r&&t>1?t-1:t,r&&n>1?n-1:n],d=r?`0.5`:`0.0`,f;f=i?`max((vec3(yRC) + vec3(0.5)) * effectiveInputOverOutputRatioRC, vec3(0.0))`:`vec3(yRC) * effectiveInputOverOutputRatioRC`,this.userCode=`
      const vec3 effectiveInputOverOutputRatioRC = vec3(
          ${l[0]/u[0]},
          ${l[1]/u[1]},
          ${l[1]/u[1]});
      const vec3 inputShapeRC = vec3(${o}.0, ${s}.0,
                                     ${s}.0);

      float getAValue(int b, int r, int c, int d) {
        return getChannel(getA(b, r, c, d), vec2(c, d));
      }

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        // Calculate values for next column in yRC.z.
        ivec3 yRC = coords.yzz + ivec3(0, 0, 1);

        // Fractional source index.
        vec3 sourceFracIndexRC = ${f};

        // Compute the coordinators of nearest neighbor point.
        ivec3 sourceNearestRC = ivec3(
          min(inputShapeRC - 1.0, floor(sourceFracIndexRC + ${d})));

        // Should we calculate next column and row elements in 2x2 packed cell.
        bool hasNextCol = d < ${c-1};
        bool hasNextRow = coords.z < ${n-1};

        vec4 newValue = vec4(
          getAValue(b, sourceNearestRC.x, sourceNearestRC.y, d),
          hasNextCol ? getAValue(b, sourceNearestRC.x, sourceNearestRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceNearestRC.x, sourceNearestRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceNearestRC.x, sourceNearestRC.z, d + 1) : 0.0);

        setOutput(newValue);
      }
    `}};J();function tq(e){let{inputs:t,backend:n,attrs:r}=e,{images:i}=t,{alignCorners:a,halfPixelCenters:o,size:s}=r,[c,l]=s,u=M().getBool(`WEBGL_PACK_IMAGE_OPERATIONS`)?new eq(i.shape,c,l,a,o):new $K(i.shape,c,l,a,o);return n.runWebGLProgram(u,[i],i.dtype)}var nq={kernelName:Zn,backendName:`webgl`,kernelFunc:tq},rq=class{constructor(e,t,n){this.variableNames=[`dy`],this.outputShape=[],this.outputShape=t;let[,r,i]=t,[,a,o]=e,s=[n&&a>1?r-1:r,n&&o>1?i-1:i],c=[n&&a>1?a-1:a,n&&o>1?o-1:o],l=s[0]/c[0],u=s[1]/c[1],d=1/l,f=1/u,p=Math.ceil(d)*2+2,m=Math.ceil(f)*2+2;this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        int r = coords[1];
        int c = coords[2];

        float accumulator = 0.0;

        const float heightScale = float(${l});
        const float widthScale = float(${u});

        const float invHeightScale = float(${d});
        const float invWidthScale = float(${f});

        const int winHeight = int(${p});
        const int winWidth = int(${m});

        // Compute bounds for where in dy we will look
        float startRLerp = floor(float(r) * invHeightScale);
        int startDyR = int(floor(startRLerp - float(winHeight / 2)));

        float startCLerp = floor(float(c) * invWidthScale);
        int startDyC = int(floor(startCLerp - float(winWidth / 2)));

        // Loop over dy
        for (int dyROffset = 0; dyROffset < winHeight; dyROffset++) {
          int dyR = dyROffset + startDyR;

          // Guard against the window exceeding the bounds of dy
          if (dyR < 0 || dyR >= ${a}) {
            continue;
          }

          for (int dyCOffset = 0; dyCOffset < winWidth; dyCOffset++) {
            int dyC = dyCOffset + startDyC;

            // Guard against the window exceeding the bounds of dy
            if (dyC < 0 || dyC >= ${o}) {
              continue;
            }

            float sourceFracRow =
              float(${s[0]}) *
                (float(dyR) / float(${c[0]}));

            float sourceFracCol =
                float(${s[1]}) *
                  (float(dyC) / float(${c[1]}));

            int sourceNearestRow = int(min(
                float(int(${r}) - 1),
                ${n} ? float(round(sourceFracRow)) :
                                  float(floor(sourceFracRow))));

            int sourceNearestCol = int(min(
                float(int(${i}) - 1),
                ${n} ? float(round(sourceFracCol)) :
                                  float(floor(sourceFracCol))));

            if (r == sourceNearestRow && c == sourceNearestCol) {
              accumulator += getDy(b, dyR, dyC, d);
            }
          }
        }
        // End loop over dy

        setOutput(accumulator);
      }
    `}};J();function iq(e){let{inputs:t,backend:n,attrs:r}=e,{images:i,dy:a}=t,{alignCorners:o}=r,s=new rq(a.shape,i.shape,o);return n.runWebGLProgram(s,[a],a.dtype)}var aq={kernelName:Qn,backendName:`webgl`,kernelFunc:iq},oq=class{constructor(e,t){this.variableNames=[`x`];let n=e.length;if(n>4)throw Error(`WebGL backend: Reverse of rank-${n} tensor is not yet supported`);if(this.outputShape=e,n===1){this.userCode=`
        void main() {
          int coord = getOutputCoords();
          setOutput(getX(${e[0]} - coord - 1));
        }
      `;return}let r=n=>t.indexOf(n)!==-1&&e[n]!==1?`${e[n]} - coords[${n}] - 1`:`coords[${n}]`,i=e.map((e,t)=>r(t)).join(`,`),a=GL(n);this.userCode=`
      void main() {
        ${a} coords = getOutputCoords();
        setOutput(getX(${i}));
      }
    `}},sq=class{constructor(e,t){this.variableNames=[`x`],this.packedInputs=!0,this.packedOutput=!0;let n=e.length;if(n>4)throw Error(`WebGL backend: Reverse of rank-${n} tensor is not yet supported`);this.outputShape=e;let r=Oz(`rc`,n),i=`${r[n-1]} + 1 < ${this.outputShape[n-1]}`,a=`${r[n-2]} + 1 < ${this.outputShape[n-2]}`,o=GL(n);n===1?this.userCode=`
        void main(){
          int rc = getOutputCoords();
          vec4 result = vec4(0.);
          result.r = getChannel(getX(${e[0]} - rc - 1),
            ${e[0]} - rc - 1);
          if(${i}){
              result.g = getChannel(getX(${e[0]} - (rc  + 1) - 1),
                ${e[0]} - (rc  + 1) - 1);
          }
          setOutput(result);
        }
      `:this.userCode=`
        void main() {
          ${o} rc = getOutputCoords();
          vec4 result = vec4(0.);
          result.r = ${s(r.slice())};
          if(${i}){
            result.g = ${c(r.slice())};
          }
          if(${a}) {
            result.b = ${l(r.slice())};
            if(${i}) {
              result.a = ${u(r.slice())};
            }
          }
          setOutput(result);
        }
    `;function s(e){return d(e)}function c(e){return e[n-1]=`(`+e[n-1]+` + 1)`,d(e)}function l(e){return e[n-2]=`(`+e[n-2]+` + 1)`,d(e)}function u(e){return e[n-1]=`(`+e[n-1]+` + 1)`,e[n-2]=`(`+e[n-2]+` + 1)`,d(e)}function d(t){let n=e.map((e,n)=>f(n,t));return`getChannel(getX(${n.join(`,`)}), vec2(${n.slice(-2).join(`,`)}))`}function f(n,r){return t.indexOf(n)!==-1&&e[n]!==1?`${e[n]} - ${r[n]} - 1`:`${r[n]}`}}};J();function cq(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{dims:a}=r,o=i.shape.length,s=A(a,i.shape);if(o===0)return gB({inputs:{x:i},backend:n});let c=M().getBool(`WEBGL_PACK_ARRAY_OPERATIONS`)?new sq(i.shape,s):new oq(i.shape,s);return n.runWebGLProgram(c,[i],i.dtype)}var lq={kernelName:nr,backendName:`webgl`,kernelFunc:cq},uq=class{constructor(e,t){this.variableNames=[`Image`],this.outputShape=[],this.customUniforms=[{name:`params`,type:`vec4`}];let n=e[1],r=e[2];this.outputShape=e;let i=``;i=typeof t==`number`?`float outputValue = ${t.toFixed(2)};`:`
        vec3 fill = vec3(${t.join(`,`)});
        float outputValue = fill[coords[3]];`,this.userCode=`
        void main() {
          ivec4 coords = getOutputCoords();
          int x = coords[2];
          int y = coords[1];
          float coordXFloat = (float(x) - params[0]) * params[3] -
            (float(y) - params[1]) * params[2];
          float coordYFloat = (float(x) - params[0]) * params[2] +
            (float(y) - params[1]) * params[3];
          int coordX = int(round(coordXFloat + params[0]));
          int coordY = int(round(coordYFloat + params[1]));
          ${i}
          if(coordX >= 0 && coordX < ${r} && coordY >= 0 && coordY < ${n}) {
            outputValue = getImage(coords[0], coordY, coordX, coords[3]);
          }
          setOutput(outputValue);
        }
    `}};J();var dq={kernelName:Ur,backendName:`webgl`,kernelFunc:({inputs:e,attrs:t,backend:n})=>{let{image:r}=e,{radians:i,fillValue:a,center:o}=t,s=n,c=new uq(r.shape,a),[l,u]=uE(o,r.shape[1],r.shape[2]),d=[[l,u,Math.sin(i),Math.cos(i)]];return s.runWebGLProgram(c,[r],r.dtype,d)}};J();var fq=kB({opSnippet:`
  // OpenGL ES does not support round function.
  // The algorithm is based on banker's rounding.
  float base = floor(x);
  if ((x - base) < 0.5) {
    return floor(x);
  } else if ((x - base) > 0.5) {
    return ceil(x);
  } else {
    if (mod(base, 2.0) == 0.0) {
      return base;
    } else {
      return base + 1.0;
    }
  }
`}),pq={kernelName:rr,backendName:`webgl`,kernelFunc:fq};J();var mq=kB({opSnippet:`return inversesqrt(x);`,cpuKernelImpl:cz}),hq={kernelName:ir,backendName:`webgl`,kernelFunc:mq},gq=class{constructor(e,t,n,r,i,a,o=!0,s=!1){this.variableNames=[`updates`,`indices`,`defaultValue`],this.outputShape=a;let c=GL(i.length),l=GL(a.length),u=``;n===1?u=`i`:n===2&&(u=`i, j`);let d=`getIndices(${u})`,f=``;r===1?f=`i`:r===2&&(f=`i, coords[1]`);let p=`getUpdates(${f})`,m=``;s&&(m=`coords[0], coords[1]`);let h=`getDefaultValue(${m})`,g=t>1?`strides[j]`:`strides`;this.userCode=`
        ${c} strides = ${c}(${i});

        void main() {
          ${l} coords = getOutputCoords();
          float sum = 0.0;
          bool found = false;
          for (int i = 0; i < ${e}; i++) {
            int flattenedIndex = 0;
            for (int j = 0; j < ${t}; j++) {
              int index = round(${d});
              flattenedIndex += index * ${g};
            }
            if (flattenedIndex == coords[0]) {
              sum += ${p};
              found = true;
            }
          }
          setOutput(mix(${h}, sum, float(found)));
        }
      `}},_q=class{constructor(e,t,n,r,i,a,o=!0,s=!1){this.variableNames=[`updates`,`indices`,`defaultValue`],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=a;let c=GL(i.length),l=GL(a.length),u=``;n===1?u=`i`:n===2&&(u=`i, j`);let d=`getIndices(${u})`,f=``;r===1?f=`i`:r===2&&(f=`i, coords[1]`);let p=`getUpdates(${f})`,m=``;s&&(m=`coords[0], coords[1]`);let h=`getDefaultValue(${m})`,g=t>1?`strides[j]`:`strides`,_=t>1?`strides[j + 1]`:`strides`;this.userCode=`
        ${c} strides = ${c}(${i});

        void main() {
          ${l} coords = getOutputCoords();
          vec4 sum = vec4(0.);
          vec4 found = vec4(0.);
          for (int i = 0; i < ${e}; i+=2) {
            ivec2 flattenedIndex = ivec2(0);
            for (int j = 0; j < ${t}; j+=2) {
              ivec4 index = round(${d});
              flattenedIndex += index.xz * ${g};
              if (j + 1 < ${t}) {
                flattenedIndex += index.yw * ${_};
              }
            }
            if (flattenedIndex[0] == coords[0] || flattenedIndex[1] == coords[0] ||
                flattenedIndex[0] == coords[0] + 1 || flattenedIndex[1] == coords[0] + 1) {
              vec4 updVals = ${p};
              if (flattenedIndex[0] == coords[0]) {
                sum.xy += updVals.xy;
                found.xy = vec2(1.);
              } else if (flattenedIndex[0] == coords[0] + 1) {
                sum.zw += updVals.xy;
                found.zw = vec2(1.);
              }
              if (flattenedIndex[1] == coords[0]) {
                sum.xy += updVals.zw;
                found.xy = vec2(1.);
              } else if (flattenedIndex[1] == coords[0] + 1) {
                sum.zw += updVals.zw;
                found.zw = vec2(1.);
              }
            }
          }
          setOutput(mix(${h}, sum, found));
        }
      `}};J();function vq(e){let{inputs:t,backend:n,attrs:r}=e,{indices:i,updates:a}=t,{shape:o}=r,{sliceRank:s,numUpdates:c,sliceSize:l,strides:u,outputSize:d}=Oy(a,i,o),f=[d/l,l];if(d===0)return n.makeTensorInfo(o,i.dtype);let p=Q({inputs:{x:i},backend:n,attrs:{shape:[c,s]}}),m=Q({inputs:{x:a},backend:n,attrs:{shape:[c,l]}}),h=n.makeTensorInfo([],`float32`,new Float32Array([0])),g;g=M().getBool(`WEBGL_PACK`)?new _q(c,s,p.shape.length,m.shape.length,u,f):new gq(c,s,p.shape.length,m.shape.length,u,f);let _=n.runWebGLProgram(g,[m,p,h],m.dtype),v=Q({inputs:{x:_},backend:n,attrs:{shape:o}});return n.disposeIntermediateTensorInfo(p),n.disposeIntermediateTensorInfo(m),n.disposeIntermediateTensorInfo(_),n.disposeIntermediateTensorInfo(h),v}var yq={kernelName:ar,backendName:`webgl`,kernelFunc:vq};J();var bq=class{constructor(e,t,n,r){this.variableNames=[`sortedSequence`,`values`],this.customUniforms=[{name:`numInputs`,type:`int`}],this.outputShape=[e,n];let i=`for (int i = 0; i < ${Math.ceil(Math.log2(t+1))}; ++i) { if (left >= right) break;`,a=M().getNumber(`WEBGL_VERSION`)===2?`while (left < right) {`:i,o=r===`left`?`<`:`<=`;this.userCode=`
       int findBound(int batch, float value) {
         int left = 0;
         int right = numInputs;
         int mid;
         ${a}
           mid = (left + right) / 2;
           if (getSortedSequence(batch, mid) ${o} value) {
             left = mid + 1;
           } else {
             right = mid;
           }
         }
         return right;
       }

       void main() {
         ivec2 coords = getOutputCoords();
         int batch = coords[0];
         int valueIndex = coords[1];

         float value = getValues(batch, valueIndex);

         setOutput(float(findBound(batch, value)));
       }
     `}};J();function xq(e){let{inputs:t,backend:n,attrs:r}=e,{sortedSequence:i,values:a}=t,{side:o}=r,s=new bq(i.shape[0],i.shape[1],a.shape[1],o),c=[[i.shape[1]]];return n.runWebGLProgram(s,[i,a],`int32`,c)}var Sq={kernelName:sr,backendName:`webgl`,kernelFunc:xq},Cq=class{constructor(e,t,n){this.variableNames=[`c`,`a`,`b`],this.outputShape=t;let r,i;if(n>4)throw Error(`Where for rank ${n} is not yet supported`);if(n===1)i=`resRC`,r=`resRC`;else{let n=[`resRC.x`,`resRC.y`,`resRC.z`,`resRC.w`],a=[],o=[];for(let r=0;r<t.length;r++)o.push(`${n[r]}`),r<e&&a.push(`${n[r]}`);r=a.join(),i=o.join()}let a=GL(n);this.userCode=`
      void main() {
        ${a} resRC = getOutputCoords();
        float cVal = getC(${r});
        if (cVal >= 1.0) {
          setOutput(getA(${i}));
        } else {
          setOutput(getB(${i}));
        }
      }
    `}};J();function wq(e){let{inputs:t,backend:n}=e,{condition:r,t:i,e:a}=t,o=new Cq(r.shape.length,i.shape,i.shape.length);return n.runWebGLProgram(o,[r,i,a],fa(i.dtype,a.dtype))}var Tq={kernelName:cr,backendName:`webgl`,kernelFunc:wq};J();var Eq=kB({opSnippet:`
  // Stable and Attracting Fixed Point (0, 1) for Normalized Weights.
  // see: https://arxiv.org/abs/1706.02515
  float scaleAlpha = ${vE};
  float scale = ${yE};
  return (x >= 0.0) ? scale * x : scaleAlpha * (exp(x) - 1.0);
`}),Dq={kernelName:lr,backendName:`webgl`,kernelFunc:Eq};J();var Oq=kB({opSnippet:OB+`
  return 1.0 / (1.0 + exp(-1.0 * x));
`,packedOpSnippet:`
  vec4 result = 1.0 / (1.0 + exp(-1.0 * x));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,cpuKernelImpl:uz}),kq={kernelName:pr,backendName:`webgl`,kernelFunc:Oq};J();var Aq=kB({opSnippet:`
  if (isnan(x)) { return 0.0; }
  return sign(x);
`}),jq={kernelName:fr,backendName:`webgl`,kernelFunc:Aq};J();var Mq={kernelName:`Sin`,backendName:`webgl`,kernelFunc:kB({opSnippet:OB+`
  return sin(x);
`,packedOpSnippet:`
  vec4 result = sin(x);
  bvec4 isNaN = isnan(x);
  ${mB}
  return result;
`})};J();var Nq=kB({opSnippet:`
  float e2x = exp(x);
  return (e2x - 1.0 / e2x) / 2.0;
`}),Pq={kernelName:dr,backendName:`webgl`,kernelFunc:Nq};J();var Fq=kB({opSnippet:`
  float epsilon = 1.1920928955078125e-7;
  float threshold = log(epsilon) + 2.0;

  bool too_large = x > -threshold;
  bool too_small = x < threshold;

  float result;
  float exp_x = exp(x);

  if (too_large){
    result = x;
  }
  else if (too_small){
    result = exp_x;
  }
  else{
    result = log(exp_x + 1.0);
  }
  return result;
`}),Iq={kernelName:mr,backendName:`webgl`,kernelFunc:Fq};J();var Lq={kernelName:gr,backendName:`webgl`,kernelFunc:e=>{let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{blockShape:a,paddings:o}=r;E(i.shape.length<=4,()=>`spaceToBatchND for rank > 4 with a WebGL backend not implemented yet`);let s=a.reduce((e,t)=>e*t),c=[[0,0]];c.push(...o);for(let e=1+a.length;e<i.shape.length;++e)c.push([0,0]);let l=[],u=DK({inputs:{x:i},backend:n,attrs:{paddings:c,constantValue:0}}),d=fE(u.shape,a,s,!1),f=pE(d.length,a.length,!1),p=mE(u.shape,a,s,!1),m=Q({inputs:{x:u},backend:n,attrs:{shape:d}}),h=ZB({inputs:{x:m},backend:n,attrs:{perm:f}}),g=Q({inputs:{x:h},backend:n,attrs:{shape:p}});return l.push(u),l.push(m),l.push(h),l.forEach(e=>n.disposeIntermediateTensorInfo(e)),g}};J();function Rq(e){let{inputs:t,backend:n}=e,{indices:r,values:i,denseShape:a,defaultValue:o}=t;if(a.shape.length!==1)throw Error(`Dense shape must be a vector, saw:
         ${a.shape}`);if(r.shape.length!==2)throw Error(`Indices must be a matrix, saw:
         ${r.shape}`);if(i.shape.length!==1)throw Error(`Values must be a vector, saw:
         ${i.shape}`);if(o.shape.length!==0)throw Error(`Default value must be a scalar, saw:
        ${o.shape}`);let s=n.readSync(r.dataId),c=n.readSync(i.dataId),l=n.readSync(a.dataId),u=n.readSync(o.dataId)[0],[d,f,p,m,h]=pz(s,r.shape,r.dtype,c,i.dtype,l,u);return[n.makeTensorInfo(f,r.dtype,d),n.makeTensorInfo([f[0]],i.dtype,p),n.makeTensorInfo([m.length],`bool`,new Uint8Array(m.map(e=>Number(e)))),n.makeTensorInfo([h.length],r.dtype,new Int32Array(h))]}var zq={kernelName:yr,backendName:`webgl`,kernelFunc:Rq};J();function Bq(e){let{inputs:t,backend:n}=e,{inputIndices:r,inputShape:i,newShape:a}=t;if(r.shape.length!==2)throw Error(`Input indices should be a matrix but received shape ${r.shape}`);if(i.shape.length!==1)throw Error(`Input shape should be a vector but received shape ${i.shape}`);if(a.shape.length!==1)throw Error(`Target shape should be a vector but received shape ${a.shape}`);let o=Array.from(n.readSync(i.dataId)),s=n.readSync(r.dataId),c=Array.from(n.readSync(a.dataId)),[l,u,d]=mz(s,r.shape,r.dtype,o,c);return[n.makeTensorInfo(u,r.dtype,l),n.makeTensorInfo([d.length],a.dtype,new Int32Array(d))]}var Vq={kernelName:br,backendName:`webgl`,kernelFunc:Bq};J();function Hq(e){let{inputs:t,backend:n}=e,{data:r,indices:i,segmentIds:a}=t;if(r.shape.length<1)throw Error(`Data should be at least 1 dimensional but received scalar`);if(i.shape.length!==1)throw Error(`Indices should be a vector but received shape
              ${i.shape}`);if(a.shape.length!==1)throw Error(`Segment ids should be a vector but received shape
              ${a.shape}`);let o=n.readSync(r.dataId),s=n.readSync(i.dataId),c=n.readSync(a.dataId),[l,u]=hz(o,r.shape,r.dtype,s,c,!0);return n.makeTensorInfo(u,r.dtype,l)}var Uq={kernelName:xr,backendName:`webgl`,kernelFunc:Hq};J();function Wq(e){let{inputs:t,backend:n}=e,{data:r,indices:i,segmentIds:a}=t;if(r.shape.length<1)throw Error(`Data should be at least 1 dimensional but received scalar`);if(i.shape.length!==1)throw Error(`Indices should be a vector but received shape
             ${i.shape}`);if(a.shape.length!==1)throw Error(`Segment ids should be a vector but received shape
             ${a.shape}`);let o=n.readSync(r.dataId),s=n.readSync(i.dataId),c=n.readSync(a.dataId),[l,u]=hz(o,r.shape,r.dtype,s,c);return n.makeTensorInfo(u,r.dtype,l)}var Gq={kernelName:Sr,backendName:`webgl`,kernelFunc:Wq};J();function Kq(e){let{inputs:t,backend:n,attrs:r}=e,{sparseIndices:i,sparseValues:a,defaultValue:o}=t,{outputShape:s}=r,{sliceRank:c,numUpdates:l,sliceSize:u,strides:d,outputSize:f}=Oy(a,i,s);if(a.dtype===`string`){let e=lz(n.bufferSync(i),n.bufferSync(a),s,f,u,l,c,d,Li(n.readSync(o.dataId)[0]),!1);return n.makeTensorInfo(s,e.dtype,e.values)}let p=new gq(l,c,i.shape.length,a.shape.length,d,[f,1],!1),m=n.runWebGLProgram(p,[a,i,o],a.dtype),h=Q({inputs:{x:m},backend:n,attrs:{shape:s}});return n.disposeIntermediateTensorInfo(m),h}var qq={kernelName:Cr,backendName:`webgl`,kernelFunc:Kq};J();function Jq(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{numOrSizeSplits:a,axis:o}=r,s=A(o,i.shape)[0],c=JE(i,a,s),l=i.shape.length,u=Array(l).fill(0),d=i.shape.slice();return c.map(e=>{let t=[...d];t[s]=e;let r=oH({inputs:{x:i},backend:n,attrs:{begin:u,size:t}});return u[s]+=e,r})}var Yq={kernelName:_r,backendName:`webgl`,kernelFunc:Jq};J();var Xq=`return sqrt(x);`,Zq=kB({opSnippet:Xq,packedOpSnippet:Xq,cpuKernelImpl:gz}),Qq={kernelName:hr,backendName:`webgl`,kernelFunc:Zq};J();var $q=kB({opSnippet:`return x * x;`}),eJ={kernelName:Tr,backendName:`webgl`,kernelFunc:$q};J();var tJ=`return (a - b) * (a - b);`,nJ=AB({opSnippet:tJ,packedOpSnippet:tJ}),rJ={kernelName:wr,backendName:`webgl`,kernelFunc:nJ};J();function iJ(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t;if(i.dtype!==`string`)throw Error(`Input must be of datatype string`);let a=_z(_D(n.readSync(i.dataId)),`string`,r);return n.makeTensorInfo(i.shape,`string`,a)}var aJ={kernelName:Er,backendName:`webgl`,kernelFunc:iJ};J();function oJ({inputs:e,attrs:t,backend:n}){let{x:r}=e,i=Vz+`
    return x > 0.0 ? 1.0 : float(${t.alpha});
  `,a=new Bz(r.shape,i);return n.runWebGLProgram(a,[r],r.dtype)}var sJ={kernelName:Vr,backendName:`webgl`,kernelFunc:oJ},cJ=class{constructor(e,t,n){this.variableNames=[`x`],this.outputShape=n;let r=n.length,i=GL(n.length),a=GL(n.length),o=``;if(r===1)o=`coords * strides + begin`;else{let e=0;o=n.map((t,r)=>(e++,n.length===1?`coords * strides[${r}] + begin[${r}]`:`coords[${e-1}] * strides[${r}] + begin[${r}]`)).join(`,`)}this.userCode=`
      ${i} begin = ${i}(${e});
      ${i} strides = ${i}(${t});

      void main() {
        ${a} coords = getOutputCoords();
        setOutput(getX(${o}));
      }
    `}};J();function lJ(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{begin:a,end:o,strides:s,beginMask:c,endMask:l,ellipsisMask:u,newAxisMask:d,shrinkAxisMask:f}=r,{finalShapeSparse:p,finalShape:m,isIdentity:h,sliceDim0:g,isSimpleSlice:_,begin:v,end:y,strides:b}=LT(i.shape,a,o,s,c,l,u,d,f),x;if(h)x=Q({inputs:{x:i},backend:n,attrs:{shape:m}});else if(g||_){E(i.shape.length>=1,()=>`Input must have rank at least 1, got: ${i.shape.length}`);let e=wT(v,y,b),t=oH({inputs:{x:i},backend:n,attrs:{begin:v,size:e}});x=Q({inputs:{x:t},backend:n,attrs:{shape:m}}),n.disposeIntermediateTensorInfo(t)}else if(n.shouldExecuteOnCPU([i])){let e=n.readSync(i.dataId),t=vz(p,V(i.shape,i.dtype,e),b,v);x=n.makeTensorInfo(m,i.dtype,t.values)}else{let e=new cJ(v,b,p);x=n.runWebGLProgram(e,[i],i.dtype)}let S=Q({inputs:{x},backend:n,attrs:{shape:m}});return n.disposeIntermediateTensorInfo(x),S}var uJ={kernelName:Dr,backendName:`webgl`,kernelFunc:lJ};J();function dJ(e){let{inputs:t,backend:n,attrs:r}=e,{separator:i,nGramWidths:a,leftPad:o,rightPad:s,padWidth:c,preserveShortSequences:l}=r,{data:u,dataSplits:d}=t,[f,p]=yz(n.readSync(u.dataId),n.readSync(d.dataId),i,a,o,s,c,l);return[n.makeTensorInfo([f.length],`string`,f),n.makeTensorInfo(d.shape,`int32`,p)]}var fJ={kernelName:Or,backendName:`webgl`,kernelFunc:dJ};J();function pJ(e){let{inputs:t,backend:n,attrs:r}=e,{skipEmpty:i}=r,{input:a,delimiter:o}=t;if(a.dtype!==`string`)throw Error(`Input must be of datatype string`);if(a.shape.length!==1)throw Error(`Input must be a vector, got shape: ${a.shape}`);if(o.shape.length!==0)throw Error(`Delimiter must be a scalar, got shape: ${o.shape}`);let s=n.readSync(a.dataId),c=n.readSync(o.dataId)[0],[l,u,d]=bz(s,c,i),f=u.length;return[n.makeTensorInfo([f,2],`int32`,l),n.makeTensorInfo([f],`string`,u),n.makeTensorInfo([2],`int32`,new Int32Array(d))]}var mJ={kernelName:kr,backendName:`webgl`,kernelFunc:pJ};J();function hJ(e){let{inputs:t,backend:n,attrs:r}=e,{numBuckets:i}=r,{input:a}=t;if(a.dtype!==`string`)throw Error(`Input must be of datatype string`);if(i<=0)throw Error(`Number of buckets must be at least 1`);let o=xz(n.readSync(a.dataId),i);return n.makeTensorInfo(a.shape,`int32`,o)}var gJ={kernelName:Ar,backendName:`webgl`,kernelFunc:hJ};J();var _J={kernelName:`Tan`,backendName:`webgl`,kernelFunc:kB({opSnippet:`return tan(x);`})};J();var vJ=kB({opSnippet:`
  float e2x = exp(-2.0 * abs(x));
  return sign(x) * (1.0 - e2x) / (1.0 + e2x);
`}),yJ={kernelName:jr,backendName:`webgl`,kernelFunc:vJ};J();function bJ(e){let{inputs:t,backend:n,attrs:r}=e,{tensor:i,indices:a,updates:o}=t,{}=r,{sliceRank:s,numUpdates:c,sliceSize:l,strides:u,outputSize:d}=Oy(o,a,i.shape),f=[d/l,l];if(d===0)return n.makeTensorInfo(i.shape,a.dtype);let p=Q({inputs:{x:a},backend:n,attrs:{shape:[c,s]}}),m=Q({inputs:{x:o},backend:n,attrs:{shape:[c,l]}}),h=Q({inputs:{x:i},backend:n,attrs:{shape:f}}),g=new gq(c,s,p.shape.length,m.shape.length,u,f,!1,!0),_=n.runWebGLProgram(g,[m,p,h],h.dtype),v=Q({inputs:{x:_},backend:n,attrs:{shape:i.shape}});return n.disposeIntermediateTensorInfo(p),n.disposeIntermediateTensorInfo(m),n.disposeIntermediateTensorInfo(h),n.disposeIntermediateTensorInfo(_),v}var xJ={kernelName:or,backendName:`webgl`,kernelFunc:bJ},SJ=class{constructor(e,t){this.variableNames=[`A`];let n=Array(e.length);for(let r=0;r<n.length;r++)n[r]=e[r]*t[r];this.outputShape=n,this.rank=n.length;let r=GL(this.rank),i=CJ(e);this.userCode=`
      void main() {
        ${r} resRC = getOutputCoords();
        setOutput(getA(${i}));
      }
    `}};function CJ(e){let t=e.length;if(t>5)throw Error(`Tile for rank ${t} is not yet supported`);if(t===1)return`imod(resRC, ${e[0]})`;let n=[`resRC.x`,`resRC.y`,`resRC.z`,`resRC.w`,`resRC.u`],r=[];for(let t=0;t<e.length;t++)r.push(`imod(${n[t]}, ${e[t]})`);return r.join()}J();function wJ(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{reps:a}=r;if(i.dtype===`string`||i.shape.length>5){let e=n.readSync(i.dataId),t=i.dtype===`string`?e.map(e=>Li(e)):e,r=Cz(V(i.shape,i.dtype,t),a);return n.makeTensorInfo(r.shape,r.dtype,r.values)}let o=new SJ(i.shape,a);return n.runWebGLProgram(o,[i],i.dtype)}var TJ={kernelName:Mr,backendName:`webgl`,kernelFunc:wJ},EJ=class{constructor(e){this.variableNames=[`x`,`indices`],this.customUniforms=[{name:`n`,type:`int`},{name:`firstPass`,type:`int`},{name:`negativeInf`,type:`float`},{name:`dir`,type:`int`},{name:`inc`,type:`int`}],this.outputShape=e,this.userCode=`
       void main() {
         ivec2 coords = getOutputCoords();
         int batch = coords[0];
         int elemIdx = coords[1];

         // We compare elements pair-wise within a group of size 2 * inc.
         // The comparing rule for each group alternates between ascending
         // and descending. Within each group, we compare each pair at
         // positions i and i+inc. To decide whether an element at position i
         // is x0 or x1, we mod it by 2 * inc, if the result is smaller than
         // inc, it is in the first half of the group, we denote it as x0,
         // otherwise we denote it as x1.
         // For example, as shown in the Bitonic top K paper referenced above,
         // Figure5(a) shows that element[1] is in the
         // second half of the group when group size is 2, but it is in the
         // first half of the group when group size is 4.

         bool isFirstInPair = imod(elemIdx, 2 * inc) < inc;
         int i = isFirstInPair ? elemIdx : elemIdx - inc;

         int i0 = firstPass == 1 ? i : int(getIndices(batch, i));
         int i1 = firstPass == 1 ? i + inc : int(getIndices(batch, i + inc));
         float x0 = i0 < n ? getX(batch, i0) : negativeInf;
         float x1 = i1 < n ? getX(batch, i1) : negativeInf;

         // Denotes which direction indices are in (ascending or descending).
         bool reverse = imod(elemIdx, 2 * dir) >= dir;
         bool isGreater = x0 > x1 || (x0 == x1 && i1 > i0);
         if (reverse == isGreater) { // Elements in opposite order of direction
           int iTemp = i0;
           i0 = i1;
           i1 = iTemp;
         }
         if (isFirstInPair) {
            setOutput(float(i0));
         } else {
            setOutput(float(i1));
         }
       }
     `}},DJ=class{constructor(e){this.variableNames=[`x`,`indices`],this.customUniforms=[{name:`n`,type:`int`},{name:`firstPass`,type:`int`},{name:`k`,type:`int`}],this.outputShape=e,this.userCode=`
    void main() {
         // Takes max of indices (0, k), (1, k + 1), (2, k + 2) ...
         ivec2 coords = getOutputCoords();
         int batch = coords[0];
         int elemIdx = coords[1];

         // The output size is half of the previous size.
         // If the previous sequence is | | | | _ _ _ _  | | | |  _ _ _ _ (k=4),
         // we only need to output the indices at positions |, the indices at
         // positions _ can be thrown away, see Figure5(b) After Phase 2
         // (Merge phase) in the Bitonic Top K paper referenced above.
         // For example, the paper shows we only need to output the orange bars.
         // The output sequence should look like this | | | | | | | |.
         // Because the sequence is halved, to map the output index back
         // to the previous sequence to find the corresponding value,
         // we need to double the index. When we double the index,
         // we basically interpolate a position, so 2i looks like
         // | _ | _ | _ | _ | _ | _ | _. We move the | to the first k position
         // of each 2k positions by - elemIdx % k. E.g. for output at
         // index 4,5,6,7, we want to get the corresponding element at
         // original index 8,9,10,11, for output at index 8,9,10,11,
         // we want to get the corresponding element at original index
         // 16,17,18,19, so on and so forth.

         int i = elemIdx < k ? elemIdx : (elemIdx * 2 - imod(elemIdx, k));
         int i0 = firstPass == 1 ? i : int(getIndices(batch, i));
         int i1 = firstPass == 1 ? i + k : int(getIndices(batch, i + k));

         float x0 = getX(batch, i0);
         float x1 = i1 < n ? getX(batch, i1) : x0;

         setOutput(x0 >= x1 ? float(i0) : float(i1));
       }
     `}};J();function OJ(e,t){t!==null&&e.disposeIntermediateTensorInfo(t)}function kJ(e){let t=1;for(;t<e;)t*=2;return t}function AJ(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{k:a,sorted:o}=r,s=M().getNumber(`TOPK_LAST_DIM_CPU_HANDOFF_SIZE_THRESHOLD`),c=M().getNumber(`TOPK_K_CPU_HANDOFF_THRESHOLD`),l=i.shape,u=l[l.length-1];if(n.shouldExecuteOnCPU([i])||u<s||a>c){let[e,t]=wz(n.readSync(i.dataId),l,i.dtype,a,o);return[n.makeTensorInfo(e.shape,e.dtype,e.values),n.makeTensorInfo(t.shape,t.dtype,t.values)]}if(a===0)return l[l.length-1]=0,[n.makeTensorInfo(l,i.dtype,[]),n.makeTensorInfo(l,`int32`,[])];if(u===1)return[i,_W({attrs:{shape:l,dtype:`int32`,value:0},backend:n})];let d=n.texData.get(i.dataId),f=d!==null&&d.isPacked,p=f?n.unpackTensor(i):i,m=O(l)/u,h=Q({inputs:{x:p},attrs:{shape:[m,u]},backend:n});f&&OJ(n,p);let g=kJ(a),_=kJ(u),v=null,y=()=>v===null?[h,h]:[h,v],b=(e,t,r)=>{let i=y(),a=new EJ(r),o=[[u],[+(v===null)],[-1/0],[e],[t]],s=v;v=n.runWebGLProgram(a,i,`int32`,o),OJ(n,s)};for(let e=1;e<g;e*=2){let t=e*2;for(let n=e;n>=1;n/=2)b(t,n,[m,_])}for(let e=_;e>g;e/=2){let t=y(),r=new DJ([m,e/2]),i=[[u],[+(v===null)],[g]],a=v;v=n.runWebGLProgram(r,t,`int32`,i),OJ(n,a);let o=g/2,s=o*2;for(let e=o;e>=1;e/=2)b(s,e,v.shape)}let x=v;v=oH({inputs:{x:v},backend:n,attrs:{begin:0,size:[m,a]}}),OJ(n,x);let S=VW({inputs:{x:h,indices:v},backend:n,attrs:{axis:1,batchDims:1}});OJ(n,h);let C=l.slice(0,-1);C.push(a),x=v,v=Q({inputs:{x:v},attrs:{shape:C},backend:n}),OJ(n,x);let w=S;return S=Q({inputs:{x:S},attrs:{shape:C},backend:n}),OJ(n,w),[S,v]}var jJ={kernelName:Nr,backendName:`webgl`,kernelFunc:AJ},MJ=class{constructor(e,t,n,r,i,a){this.variableNames=[`Image`,`Transforms`],this.outputShape=a;let o=n===`nearest`?1:2,s;switch(r){case`constant`:s=1;break;case`reflect`:s=2;break;case`wrap`:s=3;break;case`nearest`:s=4;break;default:s=1;break}this.userCode=`
            float mapCoord(float outCoord, float len) {
              float inCoord = outCoord;
              if(${s} == 2) {
                if (inCoord < 0.0) {
                  if (len <= 1.0) {
                    inCoord = 0.0;
                  } else {
                    float sz2 = 2.0 * len;
                    if (inCoord < sz2) {
                      inCoord = sz2 * float(int(float(-inCoord / sz2))) +
                      inCoord;
                    }
                    inCoord = inCoord < -len ? inCoord + sz2 : -inCoord - 1.0;
                  }
                } else if (inCoord > len - 1.0) {
                  if (len <= 1.0) {
                    inCoord = 0.0;
                  } else {
                    float sz2 = 2.0 * len;
                    inCoord -= sz2 * float(int(float(inCoord / sz2)));
                    if (inCoord >= len) {
                      inCoord = sz2 - inCoord - 1.0;
                    }
                  }
                }
                return clamp(inCoord, 0.0, len - 1.0);
              } else if (${s} == 3) {
                if (inCoord < 0.0) {
                  if (len <= 1.0) {
                    inCoord = 0.0;
                  } else {
                    float sz = len - 1.0;
                    inCoord += len * (float(int(float(-inCoord / sz))) + 1.0);
                  }
                } else if (inCoord > len - 1.0) {
                  if (len <= 1.0) {
                    inCoord = 0.0;
                  } else {
                    float sz = len - 1.0;
                    inCoord -= len * float(int(float(inCoord / sz)));
                  }
                }
                return clamp(inCoord, 0.0, len - 1.0);
              } else if (${s} == 4) {
                return clamp(outCoord, 0.0, len - 1.0);
              } else {
                return outCoord;
              }
            }

            float readWithFillValue(int batch, int coordY, int coordX,
              int channel) {
              float outputValue;
              if (0 <= coordY && coordY < ${e} && 0 <= coordX && coordX < ${t}) {
                  outputValue = getImage(batch, coordY, coordX, channel);
              } else {
                outputValue = float(${i});
              }
              return outputValue;
            }

            void main() {
              ivec4 coords = getOutputCoords();
              float outputValue;
              int batch = coords[0];
              int x = coords[2];
              int y = coords[1];
              int channel = coords[3];
              float xf = float(x);
              float yf = float(y);
              float a1 = getTransforms(batch, 0);
              float a2 = getTransforms(batch, 1);
              float a3 = getTransforms(batch, 2);
              float b1 = getTransforms(batch, 3);
              float b2 = getTransforms(batch, 4);
              float b3 = getTransforms(batch, 5);
              float c1 = getTransforms(batch, 6);
              float c2 = getTransforms(batch, 7);
              float projection = c1 * xf + c2 * yf + 1.0;
              if (projection == 0.0) {
                outputValue = float(${i});
              } else {
                float inX = (a1 * xf + a2 * yf + a3) / projection;
                float inY = (b1 * xf + b2 * yf + b3) / projection;
                float mapX = mapCoord(inX, float(${t}));
                float mapY = mapCoord(inY, float(${e}));

                if (${o} == 1) {
                  int coordY = int(round(mapY));
                  int coordX = int(round(mapX));
                  outputValue = readWithFillValue(batch, coordY, coordX,
                    channel);
                } else {
                  float yFloor = floor(mapY);
                  float xFloor = floor(mapX);
                  float yCeil = yFloor + 1.0;
                  float xCeil = xFloor + 1.0;
                  float valueYFloor = (xCeil - mapX) *
                  readWithFillValue(batch, int(yFloor), int(xFloor), channel) +
                  (mapX - xFloor) *
                  readWithFillValue(batch, int(yFloor), int(xCeil), channel);
                  float valueYCeil = (xCeil - mapX) *
                  readWithFillValue(batch, int(yCeil), int(xFloor), channel) +
                  (mapX - xFloor) *
                  readWithFillValue(batch, int(yCeil), int(xCeil), channel);
                  outputValue = (yCeil - mapY) * valueYFloor +
                  (mapY - yFloor) * valueYCeil;
                }
              }
              setOutput(outputValue);
            }
        `}};J();function NJ(e){let{inputs:t,backend:n,attrs:r}=e,{image:i,transforms:a}=t,{interpolation:o,fillMode:s,fillValue:c,outputShape:l}=r,[u,d,f,p]=i.shape,[m,h]=l??[d,f],g=new MJ(d,f,o,s,c,[u,m,h,p]);return n.runWebGLProgram(g,[i,a],`float32`)}var PJ={kernelName:Pr,backendName:`webgl`,kernelFunc:NJ};J();function FJ(e){let{inputs:t,attrs:n,backend:r}=e,{axis:i}=n,{x:a}=t;JI(a,`unique`),console.warn(`WARNING: `,`UI might be locked temporarily as data is being downloaded`);let{outputValues:o,outputShape:s,indices:c}=Ez(r.readSync(a.dataId),i,a.shape,a.dtype);return[r.makeTensorInfo(s,a.dtype,o),r.makeTensorInfo([c.length],`int32`,c)]}var IJ={kernelName:Ir,backendName:`webgl`,kernelFunc:FJ};J();function LJ(e){let{inputs:t,backend:n,attrs:r}=e,{value:i}=t,{axis:a}=r;a<0&&(a+=i.shape.length);let o=i,s=o.shape.length,c=i.shape[a],l=Array(s-1),u=0;for(let e=0;e<s;e++)e!==a&&(l[u++]=o.shape[e]);let d=[],f=Array(s).fill(0),p=o.shape.slice();p[a]=1;let m=Array(c);for(let e=0;e<m.length;e++){f[a]=e;let t=oH({inputs:{x:o},backend:n,attrs:{begin:f,size:p}});m[e]=Q({inputs:{x:t},backend:n,attrs:{shape:l}}),d.push(t)}return d.forEach(e=>n.disposeIntermediateTensorInfo(e)),m}var RJ={kernelName:Lr,backendName:`webgl`,kernelFunc:LJ},zJ=class{constructor(e,t){this.variableNames=[`x`,`segmentIds`];let n=e.windowSize,r=e.batchSize,i=e.inSize,a=e.numSegments,o=a*Math.ceil(i/n);this.outputShape=[r,o];let s=Math.floor(n/4)*4,c=n%4,l=`
        sumValue += dot(values, segFilter);
    `,u=``;i%n>0&&(u=`
        if (inIdx < 0 || inIdx >= ${i}) {
          return initializationValue;
        }
      `);let d=``;i%n>0&&(d=`
        if (inIdx < 0 || inIdx >= ${i}) {
          return -1.0;
        }
      `),this.userCode=`
      const float initializationValue = 0.0;

      float getValue(int batch, int inIdx) {
        ${u}
        return getX(batch, inIdx);
      }

      float getSegmentIdAtIndex(int inIdx) {
        ${d}
        return getSegmentIds(inIdx);
      }

      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];
        int outIdx = coords[1];
        int inOffset = int(floor(float(outIdx) / float(
          ${a})) * float(${n}));
        int currentSeg = int(mod(float(outIdx), float(${a})));

        float sumValue = 0.0;

        for (int i = 0; i < ${s}; i += 4) {
          int inIdx = inOffset + i;
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            getValue(batch, inIdx + 3)
          );

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 1)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 2)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 3)) == currentSeg ? 1 : 0
          );

          ${l}
        }

        int inIdx = inOffset + ${s};
        if (${c===1}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            initializationValue,
            initializationValue,
            initializationValue
          );

          int inIdxSeg = int(getSegmentIdAtIndex(inIdx));

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            0,
            0,
            0
          );

          ${l}
        } else if (${c===2}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            initializationValue,
            initializationValue
          );

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 1)) == currentSeg ? 1 : 0,
              0,
              0
          );

          ${l}
        } else if (${c===3}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            initializationValue
          );

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 1)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 2)) == currentSeg ? 1 : 0,
            0
          );

          ${l}
        }
        setOutput(sumValue);
      }
    `}};J();function BJ(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,segmentIds:a}=t,{numSegments:o}=r,s=i.shape.length,c=[],l=0,u=xf([l],s),d=i;u!=null&&(d=ZB({inputs:{x:i},backend:n,attrs:{perm:u}}),c.push(d),l=Cf(1,s)[0]);let f=pD(d.shape,l,o),p=O([d.shape[l]]),m=Q({inputs:{x:d},backend:n,attrs:{shape:[-1,p]}});c.push(m);let h=pa(i.dtype),g=(e,t,r,i,a)=>{let o=e.shape[0],s=e.shape[1],l=fD(s,a),u=new zJ({windowSize:l,inSize:s,batchSize:o,numSegments:a},t),d=n.compileAndRun(u,[e,r],i);if(c.push(d),d.shape[1]===a)return d;let f=RK({backend:n,attrs:{start:0,stop:a,step:1,dtype:`float32`}}),p=wJ({inputs:{x:f},backend:n,attrs:{reps:[s/l]}});return c.push(f),c.push(p),g(d,t,p,i,a)},_=Q({inputs:{x:g(m,`unsortedSegmentSum`,a,h,o)},backend:n,attrs:{shape:f}}),v=_;if(u!=null){c.push(_);let e=Sf(u);v=ZB({inputs:{x:v},backend:n,attrs:{perm:e}})}return c.forEach(e=>n.disposeIntermediateTensorInfo(e)),v}var VJ={kernelName:Rr,backendName:`webgl`,kernelFunc:BJ};J();var HJ=[tV,iV,oV,cV,uV,mV,gV,vV,TV,DV,kV,jV,NV,FV,LV,VV,UV,qV,YV,ZV,eH,cH,uH,mH,gH,wH,DH,jH,yB,FH,WH,$H,aU,cU,uU,fU,mU,hU,_U,yU,EU,OU,AU,NU,LU,VU,UU,KU,YU,ZU,QU,tW,rW,iW,oW,cW,dW,hW,vW,bW,CW,TW,OW,NW,FW,RW,HW,WW,KW,_B,JW,BH,XW,QW,eG,CB,nG,iG,oG,sG,lG,dG,pG,hG,vG,bG,CG,TG,DG,kG,NG,FG,LG,zG,VG,UG,KG,qG,rK,LB,sK,uK,pK,gK,vH,vK,SK,wK,OK,kK,DB,jK,NK,FK,LK,zK,bH,XG,VK,UK,GK,zB,YK,QK,nq,aq,lq,dq,pq,hq,yq,Sq,Tq,Dq,kq,jq,Mq,Pq,sH,tK,Iq,Lq,zq,Vq,Uq,Gq,qq,Yq,Qq,eJ,rJ,aJ,sJ,uJ,fJ,mJ,gJ,$G,XB,_J,yJ,xJ,TJ,jJ,PJ,QB,IJ,RJ,VJ,bK];for(let e of HJ)$r(e);var UJ=o((()=>{J(),M().registerFlag(`KEEP_INTERMEDIATE_TENSORS`,()=>!1,e=>{e&&console.warn(`Keep intermediate tensors is ON. This will print the values of all intermediate tensors during model inference. Not all models support this mode. For details, check e2e/benchmarks/ model_config.js. This significantly impacts performance.`)})})),WJ,GJ,KJ=o((()=>{(function(e){e[e.DT_INVALID=0]=`DT_INVALID`,e[e.DT_FLOAT=1]=`DT_FLOAT`,e[e.DT_DOUBLE=2]=`DT_DOUBLE`,e[e.DT_INT32=3]=`DT_INT32`,e[e.DT_UINT8=4]=`DT_UINT8`,e[e.DT_INT16=5]=`DT_INT16`,e[e.DT_INT8=6]=`DT_INT8`,e[e.DT_STRING=7]=`DT_STRING`,e[e.DT_COMPLEX64=8]=`DT_COMPLEX64`,e[e.DT_INT64=9]=`DT_INT64`,e[e.DT_BOOL=10]=`DT_BOOL`,e[e.DT_QINT8=11]=`DT_QINT8`,e[e.DT_QUINT8=12]=`DT_QUINT8`,e[e.DT_QINT32=13]=`DT_QINT32`,e[e.DT_BFLOAT16=14]=`DT_BFLOAT16`,e[e.DT_QINT16=15]=`DT_QINT16`,e[e.DT_QUINT16=16]=`DT_QUINT16`,e[e.DT_UINT16=17]=`DT_UINT16`,e[e.DT_COMPLEX128=18]=`DT_COMPLEX128`,e[e.DT_HALF=19]=`DT_HALF`,e[e.DT_RESOURCE=20]=`DT_RESOURCE`,e[e.DT_VARIANT=21]=`DT_VARIANT`,e[e.DT_UINT32=22]=`DT_UINT32`,e[e.DT_UINT64=23]=`DT_UINT64`,e[e.DT_FLOAT_REF=101]=`DT_FLOAT_REF`,e[e.DT_DOUBLE_REF=102]=`DT_DOUBLE_REF`,e[e.DT_INT32_REF=103]=`DT_INT32_REF`,e[e.DT_UINT8_REF=104]=`DT_UINT8_REF`,e[e.DT_INT16_REF=105]=`DT_INT16_REF`,e[e.DT_INT8_REF=106]=`DT_INT8_REF`,e[e.DT_STRING_REF=107]=`DT_STRING_REF`,e[e.DT_COMPLEX64_REF=108]=`DT_COMPLEX64_REF`,e[e.DT_INT64_REF=109]=`DT_INT64_REF`,e[e.DT_BOOL_REF=110]=`DT_BOOL_REF`,e[e.DT_QINT8_REF=111]=`DT_QINT8_REF`,e[e.DT_QUINT8_REF=112]=`DT_QUINT8_REF`,e[e.DT_QINT32_REF=113]=`DT_QINT32_REF`,e[e.DT_BFLOAT16_REF=114]=`DT_BFLOAT16_REF`,e[e.DT_QINT16_REF=115]=`DT_QINT16_REF`,e[e.DT_QUINT16_REF=116]=`DT_QUINT16_REF`,e[e.DT_UINT16_REF=117]=`DT_UINT16_REF`,e[e.DT_COMPLEX128_REF=118]=`DT_COMPLEX128_REF`,e[e.DT_HALF_REF=119]=`DT_HALF_REF`,e[e.DT_RESOURCE_REF=120]=`DT_RESOURCE_REF`,e[e.DT_VARIANT_REF=121]=`DT_VARIANT_REF`,e[e.DT_UINT32_REF=122]=`DT_UINT32_REF`,e[e.DT_UINT64_REF=123]=`DT_UINT64_REF`})(WJ||={}),(function(e){(function(e){e[e.LEGACY=0]=`LEGACY`,e[e.V1=1]=`V1`,e[e.V2=2]=`V2`})(e.CheckpointFormatVersion||={})})(GJ||={})}));function qJ(e,t){XJ[e]={tfOpName:e,category:`custom`,inputs:[],attrs:[],customExecutor:t}}function JJ(e){return XJ[e]}function YJ(e){delete XJ[e]}var XJ,ZJ=o((()=>{XJ={}}));function $(e,t,n,r,i){let a=t.inputParams[e];if(a&&a.inputIndexStart!==void 0){let e=a.inputIndexStart,o=a.inputIndexEnd===0?void 0:a.inputIndexEnd===void 0?e+1:a.inputIndexEnd,s=e<0?t.inputNames.length+e:e;if(a.type===`tensor`)return QJ(t.inputNames[s],n,r,i);if(a.type===`tensors`){let a=t.inputs.slice(e,o);return t.inputNames.slice(e,o).filter((e,t)=>a[t]?.op!==`NoOp`).map(e=>QJ(e,n,r,i))}let c=QJ(t.inputNames[s],n,r,i),l=c.dataSync();return a.type===`number`?l[0]:Te(c.shape,l)}let o=t.attrParams[e];return o&&o.value}function QJ(e,t,n,r){let[i,a]=nY(e,n);if(r!=null){let e=r.getHashTableHandleByName(i);if(e!=null)return e}let o=n.currentContextIds.find(e=>!!t[tY(i,e)]);return o===void 0?void 0:t[tY(i,o)][a]}function $J(e,t,n){return t[tY(e,n.currentContextId)]}function eY(e,t){let[n,r,i]=nY(e,t);return[tY(n,t&&t.currentContextId),r,i]}function tY(e,t){return t?`${e}-${t}`:e}function nY(e,t){if(e===``)return[``,0,void 0];let n=t!=null&&t.parseNodeNameCache!=null;if(n){let n=t.parseNodeNameCache.get(e);if(n!=null)return n}let r=e.split(`:`),i;if(r.length===1)i=[e,0,void 0];else{let e=r[0],t=r.length===3?r[1]:void 0;i=[e,Number(r[r.length-1]),t]}return n&&t.parseNodeNameCache.set(e,i),i}function rY(e,t,n){let r=$(`pad`,e,t,n);if(r===`explicit`){r=$(`explicitPaddings`,e,t,n);let i=[[0,0],[0,0],[0,0],[0,0]];for(let e=0;e<4;e++)i[e][0]=r[e*2],i[e][1]=r[e*2+1];return i}return r}function iY(e){return e.kept?e:ic(e)}var aY=o((()=>{J()})),oY=c({json:()=>sY}),sY,cY=o((()=>{sY=[{tfOpName:`Add`,category:`arithmetic`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`AddV2`,category:`arithmetic`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`AddN`,category:`arithmetic`,inputs:[{start:0,end:0,name:`tensors`,type:`tensors`}]},{tfOpName:`BiasAdd`,category:`arithmetic`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0},{tfName:`data_format`,name:`dataFormat`,type:`string`,notSupported:!0}]},{tfOpName:`Sub`,category:`arithmetic`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`RealDiv`,category:`arithmetic`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Div`,category:`arithmetic`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`DivNoNan`,category:`arithmetic`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`FloorDiv`,category:`arithmetic`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Mul`,category:`arithmetic`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Maximum`,category:`arithmetic`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Minimum`,category:`arithmetic`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Pow`,category:`arithmetic`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`SquaredDifference`,category:`arithmetic`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Mod`,category:`arithmetic`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`FloorMod`,category:`arithmetic`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]}]})),lY=c({json:()=>uY}),uY,dY=o((()=>{uY=[{tfOpName:`Abs`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Acos`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Asin`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Atan`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Atan2`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`y`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Ceil`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`ClipByValue`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`clipValueMin`,type:`number`},{start:2,name:`clipValueMax`,type:`number`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Complex`,category:`basic_math`,inputs:[{start:0,name:`real`,type:`tensor`},{start:1,name:`imag`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`ComplexAbs`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Cos`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Cosh`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Elu`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Exp`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Floor`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Log`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Imag`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0},{tfName:`Tout`,name:`outputType`,type:`dtype`,notSupported:!0}]},{tfOpName:`Neg`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Real`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0},{tfName:`Tout`,name:`outputType`,type:`dtype`,notSupported:!0}]},{tfOpName:`Prelu`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`alpha`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Relu`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Relu6`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Selu`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Sigmoid`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Sin`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Sinh`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Sqrt`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Rsqrt`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Square`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Tan`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Tanh`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Sign`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Round`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Expm1`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Log1p`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Reciprocal`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Softplus`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Asinh`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Acosh`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Atanh`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Erf`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`LeakyRelu`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`alpha`,name:`alpha`,type:`number`,defaultValue:.2},{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`IsNan`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`IsFinite`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`IsInf`,category:`basic_math`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]}]})),fY=c({json:()=>pY}),pY,mY=o((()=>{pY=[{tfOpName:`EmptyTensorList`,category:`control`,inputs:[{start:0,name:`elementShape`,type:`shape`},{start:1,name:`maxNumElements`,type:`number`}],attrs:[{tfName:`element_dtype`,name:`elementDType`,type:`dtype`}]},{tfOpName:`LoopCond`,category:`control`,inputs:[{start:0,name:`pred`,type:`tensor`}]},{tfOpName:`Switch`,category:`control`,inputs:[{start:0,name:`data`,type:`tensor`},{start:1,name:`pred`,type:`tensor`}]},{tfOpName:`Merge`,category:`control`,inputs:[{start:0,end:0,name:`tensors`,type:`tensors`}]},{tfOpName:`Enter`,category:`control`,inputs:[{start:0,name:`tensor`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0},{tfName:`frame_name`,name:`frameName`,type:`string`},{tfName:`is_constant`,name:`isConstant`,type:`bool`}]},{tfOpName:`Exit`,category:`control`,inputs:[{start:0,name:`tensor`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`NextIteration`,category:`control`,inputs:[{start:0,name:`tensor`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`TensorArrayV3`,category:`control`,inputs:[{start:0,name:`size`,type:`number`}],attrs:[{tfName:`dtype`,name:`dtype`,type:`dtype`},{tfName:`element_shape`,name:`elementShape`,type:`shape`},{tfName:`dynamic_size`,name:`dynamicSize`,type:`bool`},{tfName:`clear_after_read`,name:`clearAfterRead`,type:`bool`},{tfName:`identical_element_shapes`,name:`identicalElementShapes`,type:`bool`},{tfName:`tensor_array_name`,name:`name`,type:`string`}]},{tfOpName:`TensorArrayWriteV3`,category:`control`,inputs:[{start:0,name:`tensorArrayId`,type:`tensor`},{start:1,name:`index`,type:`number`},{start:2,name:`tensor`,type:`tensor`},{start:3,name:`flowIn`,type:`number`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`TensorArrayReadV3`,category:`control`,inputs:[{start:0,name:`tensorArrayId`,type:`tensor`},{start:1,name:`index`,type:`number`},{start:2,name:`flowIn`,type:`number`}],attrs:[{tfName:`dtype`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`TensorArrayGatherV3`,category:`control`,inputs:[{start:0,name:`tensorArrayId`,type:`tensor`},{start:1,name:`indices`,type:`number[]`},{start:2,name:`flowIn`,type:`number`}],attrs:[{tfName:`dtype`,name:`dtype`,type:`dtype`},{tfName:`element_shape`,name:`elementShape`,type:`shape`}]},{tfOpName:`TensorArrayScatterV3`,category:`control`,inputs:[{start:0,name:`tensorArrayId`,type:`tensor`},{start:1,name:`indices`,type:`number[]`},{start:2,name:`tensor`,type:`tensor`},{start:3,name:`flowIn`,type:`number`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`}]},{tfOpName:`TensorArrayConcatV3`,category:`control`,inputs:[{start:0,name:`tensorArrayId`,type:`tensor`},{start:1,name:`flowIn`,type:`number`}],attrs:[{tfName:`dtype`,name:`dtype`,type:`dtype`},{tfName:`element_shape_except0`,name:`elementShapeExcept0`,type:`shape`,notSupported:!0}]},{tfOpName:`TensorArraySplitV3`,category:`control`,inputs:[{start:0,name:`tensorArrayId`,type:`tensor`},{start:1,name:`tensor`,type:`tensor`},{start:2,name:`lengths`,type:`number[]`},{start:3,name:`flowIn`,type:`number`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`}]},{tfOpName:`TensorArraySizeV3`,category:`control`,inputs:[{start:0,name:`tensorArrayId`,type:`tensor`},{start:1,name:`flowIn`,type:`number`}]},{tfOpName:`TensorArrayCloseV3`,category:`control`,inputs:[{start:0,name:`tensorArrayId`,type:`tensor`}]},{tfOpName:`StatelessIf`,category:`control`,inputs:[{start:0,name:`cond`,type:`tensor`},{start:1,end:0,name:`args`,type:`tensors`}],attrs:[{tfName:`then_branch`,name:`thenBranch`,type:`func`},{tfName:`else_branch`,name:`elseBranch`,type:`func`}]},{tfOpName:`If`,category:`control`,inputs:[{start:0,name:`cond`,type:`tensor`},{start:1,end:0,name:`args`,type:`tensors`}],attrs:[{tfName:`then_branch`,name:`thenBranch`,type:`func`},{tfName:`else_branch`,name:`elseBranch`,type:`func`}]},{tfOpName:`StatelessWhile`,category:`control`,inputs:[{start:0,end:0,name:`args`,type:`tensors`}],attrs:[{tfName:`cond`,name:`cond`,type:`func`},{tfName:`body`,name:`body`,type:`func`}]},{tfOpName:`While`,category:`control`,inputs:[{start:0,end:0,name:`args`,type:`tensors`}],attrs:[{tfName:`cond`,name:`cond`,type:`func`},{tfName:`body`,name:`body`,type:`func`}]},{tfOpName:`TensorListScatter`,category:`control`,inputs:[{start:0,name:`tensor`,type:`tensor`},{start:1,name:`indices`,type:`number[]`},{start:2,name:`elementShape`,type:`shape`}],attrs:[{tfName:`element_dtype`,name:`elementDType`,type:`dtype`}]},{tfOpName:`TensorListScatterV2`,category:`control`,inputs:[{start:0,name:`tensor`,type:`tensor`},{start:1,name:`indices`,type:`number[]`},{start:2,name:`elementShape`,type:`shape`},{start:3,name:`numElements`,type:`number`}],attrs:[{tfName:`element_dtype`,name:`elementDType`,type:`dtype`}]},{tfOpName:`TensorListGather`,category:`control`,inputs:[{start:0,name:`tensorListId`,type:`tensor`},{start:1,name:`indices`,type:`number[]`},{start:2,name:`elementShape`,type:`shape`}],attrs:[{tfName:`element_dtype`,name:`elementDType`,type:`dtype`}]},{tfOpName:`TensorListGetItem`,category:`control`,inputs:[{start:0,name:`tensorListId`,type:`tensor`},{start:1,name:`index`,type:`number`},{start:2,name:`elementShape`,type:`shape`}],attrs:[{tfName:`element_dtype`,name:`elementDType`,type:`dtype`}]},{tfOpName:`TensorListSetItem`,category:`control`,inputs:[{start:0,name:`tensorListId`,type:`tensor`},{start:1,name:`index`,type:`number`},{start:2,name:`tensor`,type:`tensor`}],attrs:[{tfName:`element_dtype`,name:`elementDType`,type:`dtype`}]},{tfOpName:`TensorListReserve`,category:`control`,inputs:[{start:0,name:`elementShape`,type:`shape`},{start:1,name:`numElements`,type:`number`}],attrs:[{tfName:`element_dtype`,name:`elementDType`,type:`dtype`}]},{tfOpName:`TensorListFromTensor`,category:`control`,inputs:[{start:0,name:`tensor`,type:`tensor`},{start:1,name:`elementShape`,type:`shape`}],attrs:[{tfName:`element_dtype`,name:`elementDType`,type:`dtype`}]},{tfOpName:`TensorListStack`,category:`control`,inputs:[{start:0,name:`tensorListId`,type:`tensor`},{start:1,name:`elementShape`,type:`shape`}],attrs:[{tfName:`element_dtype`,name:`elementDType`,type:`dtype`},{tfName:`num_elements`,name:`numElements`,type:`dtype`}]},{tfOpName:`TensorListSplit`,category:`control`,inputs:[{start:0,name:`tensor`,type:`tensor`},{start:1,name:`elementShape`,type:`shape`},{start:2,name:`lengths`,type:`number[]`}],attrs:[{tfName:`element_dtype`,name:`elementDType`,type:`dtype`}]},{tfOpName:`TensorListConcat`,category:`control`,inputs:[{start:0,name:`tensorListId`,type:`tensor`}],attrs:[{tfName:`element_shape`,name:`elementShape`,type:`shape`},{tfName:`element_dtype`,name:`elementDType`,type:`dtype`}]},{tfOpName:`TensorListConcatV2`,category:`control`,inputs:[{start:0,name:`tensorListId`,type:`tensor`}],attrs:[{tfName:`element_shape`,name:`elementShape`,type:`shape`},{tfName:`element_dtype`,name:`elementDType`,type:`dtype`}]},{tfOpName:`TensorListPopBack`,category:`control`,inputs:[{start:0,name:`tensorListId`,type:`tensor`},{start:1,name:`elementShape`,type:`shape`}],attrs:[{tfName:`element_dtype`,name:`elementDType`,type:`dtype`}]},{tfOpName:`TensorListPushBack`,category:`control`,inputs:[{start:0,name:`tensorListId`,type:`tensor`},{start:1,name:`tensor`,type:`tensor`}],attrs:[{tfName:`element_dtype`,name:`elementDType`,type:`dtype`}]},{tfOpName:`TensorListLength`,category:`control`,inputs:[{start:0,name:`tensorListId`,type:`tensor`}]},{tfOpName:`TensorListResize`,category:`control`,inputs:[{start:0,name:`tensorListId`,type:`tensor`},{start:1,name:`size`,type:`number`}]}]})),hY=c({json:()=>gY}),gY,_Y=o((()=>{gY=[{tfOpName:`AvgPool`,category:`convolution`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`strides`,name:`strides`,type:`number[]`},{tfName:`padding`,name:`pad`,type:`string`},{tfName:`data_format`,name:`dataFormat`,type:`string`,notSupported:!0},{tfName:`ksize`,name:`kernelSize`,type:`number[]`},{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`MaxPool`,category:`convolution`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`strides`,name:`strides`,type:`number[]`},{tfName:`padding`,name:`pad`,type:`string`},{tfName:`data_format`,name:`dataFormat`,type:`string`,notSupported:!0},{tfName:`ksize`,name:`kernelSize`,type:`number[]`},{tfName:`explicit_paddings`,name:`explicitPaddings`,type:`number[]`,defaultValue:[],notSupported:!0},{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`MaxPoolWithArgmax`,category:`convolution`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`strides`,name:`strides`,type:`number[]`},{tfName:`padding`,name:`pad`,type:`string`},{tfName:`ksize`,name:`kernelSize`,type:`number[]`},{tfName:`include_batch_in_index`,name:`includeBatchInIndex`,type:`bool`},{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`AvgPool3D`,category:`convolution`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`strides`,name:`strides`,type:`number[]`},{tfName:`padding`,name:`pad`,type:`string`},{tfName:`data_format`,name:`dataFormat`,type:`string`,notSupported:!0},{tfName:`ksize`,name:`kernelSize`,type:`number[]`},{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`MaxPool3D`,category:`convolution`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`strides`,name:`strides`,type:`number[]`},{tfName:`padding`,name:`pad`,type:`string`},{tfName:`data_format`,name:`dataFormat`,type:`string`,notSupported:!0},{tfName:`ksize`,name:`kernelSize`,type:`number[]`},{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Conv1D`,category:`convolution`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`filter`,type:`tensor`}],attrs:[{tfName:`stride`,name:`stride`,type:`number`},{tfName:`padding`,name:`pad`,type:`string`},{tfName:`data_format`,name:`dataFormat`,type:`string`,defaultValue:`NWC`},{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0},{tfName:`dilation`,name:`dilation`,type:`number`,defaultValue:1}]},{tfOpName:`Conv2D`,category:`convolution`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`filter`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0},{tfName:`strides`,name:`strides`,type:`number[]`},{tfName:`padding`,name:`pad`,type:`string`},{tfName:`useCudnnOnGpu`,name:`useCudnnOnGpu`,type:`bool`},{tfName:`data_format`,name:`dataFormat`,type:`string`,defaultValue:`NHWC`},{tfName:`explicit_paddings`,name:`explicitPaddings`,type:`number[]`,defaultValue:[]},{tfName:`dilations`,name:`dilations`,type:`number[]`}]},{tfOpName:`_FusedConv2D`,category:`convolution`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`filter`,type:`tensor`},{start:2,end:0,name:`args`,type:`tensors`}],attrs:[{tfName:`num_args`,name:`numArgs`,type:`number`},{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0},{tfName:`strides`,name:`strides`,type:`number[]`},{tfName:`padding`,name:`pad`,type:`string`},{tfName:`explicit_paddings`,name:`explicitPaddings`,type:`number[]`,defaultValue:[]},{tfName:`use_cudnn_on_gpu`,name:`useCudnnOnGpu`,type:`bool`,defaultValue:!0},{tfName:`data_format`,name:`dataFormat`,type:`string`,defaultValue:`NHWC`},{tfName:`dilations`,name:`dilations`,type:`number[]`,defaultValue:[1,1,1,1]},{tfName:`fused_ops`,name:`fusedOps`,type:`string[]`,defaultValue:[]},{tfName:`epsilon`,name:`epsilon`,type:`number`,defaultValue:1e-4},{tfName:`leakyrelu_alpha`,name:`leakyreluAlpha`,type:`number`,defaultValue:.2}]},{tfOpName:`Conv2DBackpropInput`,category:`convolution`,inputs:[{start:2,name:`x`,type:`tensor`},{start:1,name:`filter`,type:`tensor`},{start:0,name:`outputShape`,type:`number[]`}],attrs:[{tfName:`strides`,name:`strides`,type:`number[]`},{tfName:`padding`,name:`pad`,type:`string`},{tfName:`data_format`,name:`dataFormat`,type:`string`,notSupported:!0},{tfName:`explicit_paddings`,name:`explicitPaddings`,type:`number[]`,defaultValue:[]},{tfName:`dilations`,name:`dilations`,type:`number[]`,notSupported:!0}]},{tfOpName:`DepthwiseConv2d`,category:`convolution`,inputs:[{start:0,name:`input`,type:`tensor`},{start:1,name:`filter`,type:`tensor`}],attrs:[{tfName:`strides`,name:`strides`,type:`number[]`},{tfName:`padding`,name:`pad`,type:`string`},{tfName:`data_format`,name:`dataFormat`,type:`string`,defaultValue:`NHWC`},{tfName:`explicit_paddings`,name:`explicitPaddings`,type:`number[]`,defaultValue:[]},{tfName:`dilations`,name:`dilations`,type:`number[]`}]},{tfOpName:`DepthwiseConv2dNative`,category:`convolution`,inputs:[{start:0,name:`input`,type:`tensor`},{start:1,name:`filter`,type:`tensor`}],attrs:[{tfName:`strides`,name:`strides`,type:`number[]`},{tfName:`padding`,name:`pad`,type:`string`},{tfName:`data_format`,name:`dataFormat`,type:`string`,defaultValue:`NHWC`},{tfName:`explicit_paddings`,name:`explicitPaddings`,type:`number[]`,defaultValue:[]},{tfName:`dilations`,name:`dilations`,type:`number[]`}]},{tfOpName:`FusedDepthwiseConv2dNative`,category:`convolution`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`filter`,type:`tensor`},{start:2,end:0,name:`args`,type:`tensors`}],attrs:[{tfName:`num_args`,name:`numArgs`,type:`number`},{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0},{tfName:`strides`,name:`strides`,type:`number[]`},{tfName:`padding`,name:`pad`,type:`string`},{tfName:`data_format`,name:`dataFormat`,type:`string`,defaultValue:`NHWC`},{tfName:`dilations`,name:`dilations`,type:`number[]`,defaultValue:[1,1,1,1]},{tfName:`fused_ops`,name:`fusedOps`,type:`string[]`,defaultValue:[]},{tfName:`explicit_paddings`,name:`explicitPaddings`,type:`number[]`,defaultValue:[]}]},{tfOpName:`Conv3D`,category:`convolution`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`filter`,type:`tensor`}],attrs:[{tfName:`strides`,name:`strides`,type:`number[]`},{tfName:`padding`,name:`pad`,type:`string`},{tfName:`data_format`,name:`dataFormat`,type:`string`,defaultValue:`NHWC`},{tfName:`dilations`,name:`dilations`,type:`number[]`}]},{tfOpName:`Dilation2D`,category:`convolution`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`filter`,type:`tensor`}],attrs:[{tfName:`strides`,name:`strides`,type:`number[]`},{tfName:`rates`,name:`dilations`,type:`number[]`},{tfName:`padding`,name:`pad`,type:`string`}]}]})),vY=c({json:()=>yY}),yY,bY=o((()=>{yY=[{tfOpName:`Fill`,category:`creation`,inputs:[{start:0,name:`shape`,type:`number[]`},{start:1,name:`value`,type:`number`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`}]},{tfOpName:`LinSpace`,category:`creation`,inputs:[{start:0,name:`start`,type:`number`},{start:1,name:`stop`,type:`number`},{start:2,name:`num`,type:`number`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`OneHot`,category:`creation`,inputs:[{start:0,name:`indices`,type:`tensor`},{start:1,name:`depth`,type:`number`},{start:2,name:`onValue`,type:`number`,defaultValue:1},{start:3,name:`offValue`,type:`number`,defaultValue:0}],attrs:[{tfName:`axis`,name:`axis`,type:`number`,notSupported:!0},{tfName:`T`,name:`dtype`,type:`dtype`}]},{tfOpName:`Ones`,category:`creation`,inputs:[{start:0,name:`shape`,type:`number[]`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`}]},{tfOpName:`OnesLike`,category:`creation`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`dtype`,name:`dtype`,type:`dtype`}]},{tfOpName:`RandomStandardNormal`,category:`creation`,inputs:[{start:0,name:`shape`,type:`number[]`}],attrs:[{tfName:`seed`,name:`seed`,type:`number`,defaultValue:0},{tfName:`seed2`,name:`seed2`,type:`number`,defaultValue:0,notSupported:!0},{tfName:`dtype`,name:`dtype`,type:`dtype`},{tfName:`T`,name:`T`,type:`number`,notSupported:!0}]},{tfOpName:`RandomUniform`,category:`creation`,inputs:[{start:0,name:`shape`,type:`number[]`}],attrs:[{tfName:`minval`,name:`minval`,type:`number`,defaultValue:0},{tfName:`maxval`,name:`maxval`,type:`number`,defaultValue:1},{tfName:`dtype`,name:`dtype`,type:`dtype`},{tfName:`seed`,name:`seed`,type:`number`,defaultValue:0},{tfName:`seed2`,name:`seed2`,type:`number`,defaultValue:0,notSupported:!0},{tfName:`T`,name:`T`,type:`number`,notSupported:!0}]},{tfOpName:`RandomUniformInt`,category:`creation`,inputs:[{start:0,name:`shape`,type:`number[]`}],attrs:[{tfName:`minval`,name:`minval`,type:`number`},{tfName:`maxval`,name:`maxval`,type:`number`},{tfName:`seed`,name:`seed`,type:`number`,defaultValue:0},{tfName:`seed2`,name:`seed2`,type:`number`,defaultValue:0,notSupported:!0}]},{tfOpName:`Range`,category:`creation`,inputs:[{start:0,name:`start`,type:`number`},{start:1,name:`stop`,type:`number`},{start:2,name:`step`,type:`number`,defaultValue:0}],attrs:[{tfName:`Tidx`,name:`dtype`,type:`dtype`}]},{tfOpName:`TruncatedNormal`,category:`creation`,inputs:[{start:0,name:`shape`,type:`number[]`}],attrs:[{tfName:`means`,name:`mean`,type:`number`,defaultValue:0},{tfName:`stddev`,name:`stdDev`,type:`number`,defaultValue:1},{tfName:`seed`,name:`seed`,type:`number`},{tfName:`seed2`,name:`seed2`,type:`number`,defaultValue:0,notSupported:!0},{tfName:`dtype`,name:`dtype`,type:`dtype`},{tfName:`T`,name:`T`,type:`number`,notSupported:!0}]},{tfOpName:`Zeros`,category:`creation`,inputs:[{start:0,name:`shape`,type:`number[]`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`}]},{tfOpName:`ZerosLike`,category:`creation`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`}]},{tfOpName:`Multinomial`,category:`creation`,inputs:[{start:0,name:`logits`,type:`tensor`},{start:1,name:`numSamples`,type:`number`}],attrs:[{tfName:`seed`,name:`seed`,type:`number`},{tfName:`seed2`,name:`seed2`,type:`number`},{tfName:`T`,name:`dtype`,type:`dtype`},{tfName:`output_dtype`,name:`output_dtype`,type:`dtype`}]}]})),xY=c({json:()=>SY}),SY,CY=o((()=>{SY=[{tfOpName:`NonMaxSuppressionV2`,category:`dynamic`,inputs:[{start:0,name:`boxes`,type:`tensor`},{start:1,name:`scores`,type:`tensor`},{start:2,name:`maxOutputSize`,type:`number`},{start:3,name:`iouThreshold`,type:`number`}]},{tfOpName:`NonMaxSuppressionV3`,category:`dynamic`,inputs:[{start:0,name:`boxes`,type:`tensor`},{start:1,name:`scores`,type:`tensor`},{start:2,name:`maxOutputSize`,type:`number`},{start:3,name:`iouThreshold`,type:`number`},{start:4,name:`scoreThreshold`,type:`number`}]},{tfOpName:`NonMaxSuppressionV4`,category:`dynamic`,inputs:[{start:0,name:`boxes`,type:`tensor`},{start:1,name:`scores`,type:`tensor`},{start:2,name:`maxOutputSize`,type:`number`},{start:3,name:`iouThreshold`,type:`number`},{start:4,name:`scoreThreshold`,type:`number`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0},{tfName:`T_threshold`,name:`threshold`,type:`dtype`,notSupported:!0},{tfName:`pad_to_max_output_size`,name:`padToMaxOutputSize`,type:`bool`}]},{tfOpName:`NonMaxSuppressionV5`,category:`dynamic`,inputs:[{start:0,name:`boxes`,type:`tensor`},{start:1,name:`scores`,type:`tensor`},{start:2,name:`maxOutputSize`,type:`number`},{start:3,name:`iouThreshold`,type:`number`},{start:4,name:`scoreThreshold`,type:`number`},{start:5,name:`softNmsSigma`,type:`number`}]},{tfOpName:`Where`,category:`dynamic`,inputs:[{start:0,name:`condition`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`ListDiff`,category:`dynamic`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`y`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]}]})),wY=c({json:()=>TY}),TY,EY=o((()=>{TY=[{tfOpName:`LowerBound`,category:`evaluation`,inputs:[{start:0,name:`sortedSequence`,type:`tensor`},{start:1,name:`values`,type:`tensor`}]},{tfOpName:`TopKV2`,category:`evaluation`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`k`,type:`number`}],attrs:[{tfName:`sorted`,name:`sorted`,type:`bool`}]},{tfOpName:`UpperBound`,category:`evaluation`,inputs:[{start:0,name:`sortedSequence`,type:`tensor`},{start:1,name:`values`,type:`tensor`}]},{tfOpName:`Unique`,category:`evaluation`,inputs:[{start:0,name:`x`,type:`tensor`}]},{tfOpName:`UniqueV2`,category:`evaluation`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`axis`,type:`number`}]}]})),DY=c({json:()=>OY}),OY,kY=o((()=>{OY=[{tfOpName:`PlaceholderWithDefault`,category:`graph`,inputs:[{start:0,name:`default`,type:`tensor`}],attrs:[{tfName:`shape`,name:`shape`,type:`shape`},{tfName:`dtype`,name:`dtype`,type:`dtype`}]},{tfOpName:`Placeholder`,category:`graph`,attrs:[{tfName:`shape`,name:`shape`,type:`shape`},{tfName:`dtype`,name:`dtype`,type:`dtype`}]},{tfOpName:`Const`,category:`graph`},{tfOpName:`Identity`,category:`graph`,inputs:[{start:0,name:`x`,type:`tensor`}]},{tfOpName:`IdentityN`,category:`graph`,inputs:[{start:0,end:0,name:`x`,type:`tensors`}]},{tfOpName:`Snapshot`,category:`graph`,inputs:[{start:0,name:`x`,type:`tensor`}]},{tfOpName:`Rank`,category:`graph`,inputs:[{start:0,name:`x`,type:`tensor`}]},{tfOpName:`Size`,category:`graph`,inputs:[{start:0,name:`x`,type:`tensor`}]},{tfOpName:`Shape`,category:`graph`,inputs:[{start:0,name:`x`,type:`tensor`}]},{tfOpName:`ShapeN`,category:`graph`,inputs:[{start:0,end:0,name:`x`,type:`tensors`}]},{tfOpName:`Print`,category:`graph`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`data`,type:`tensors`}],attrs:[{tfName:`message`,name:`message`,type:`string`},{tfName:`first_n`,name:`firstN`,type:`number`,notSupported:!0},{tfName:`summarize`,name:`summarize`,type:`number`,defaultValue:3}]},{tfOpName:`NoOp`,category:`graph`,inputs:[]},{tfOpName:`StopGradient`,category:`graph`,inputs:[{start:0,name:`x`,type:`tensor`}]},{tfOpName:`FakeQuantWithMinMaxVars`,category:`graph`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`min`,name:`min`,type:`number`},{tfName:`max`,name:`max`,type:`number`}]}]})),AY=c({json:()=>jY}),jY,MY=o((()=>{jY=[{tfOpName:`HashTable`,category:`hash_table`,inputs:[],attrs:[{tfName:`shared_name`,name:`sharedName`,type:`string`},{tfName:`use_node_name_sharing`,name:`useNodeNameSharing`,type:`bool`},{tfName:`key_dtype`,name:`keyDType`,type:`dtype`},{tfName:`value_dtype`,name:`valueDType`,type:`dtype`}]},{tfOpName:`HashTableV2`,category:`hash_table`,inputs:[],attrs:[{tfName:`shared_name`,name:`sharedName`,type:`string`},{tfName:`use_node_name_sharing`,name:`useNodeNameSharing`,type:`bool`},{tfName:`key_dtype`,name:`keyDType`,type:`dtype`},{tfName:`value_dtype`,name:`valueDType`,type:`dtype`}]},{tfOpName:`LookupTableImport`,category:`hash_table`,inputs:[{start:0,name:`tableHandle`,type:`tensor`},{start:1,name:`keys`,type:`tensor`},{start:2,name:`values`,type:`tensor`}],attrs:[{tfName:`Tin`,name:`tIn`,type:`dtype`,notSupported:!0},{tfName:`Tout`,name:`tOut`,type:`dtype`,notSupported:!0}]},{tfOpName:`LookupTableImportV2`,category:`hash_table`,inputs:[{start:0,name:`tableHandle`,type:`tensor`},{start:1,name:`keys`,type:`tensor`},{start:2,name:`values`,type:`tensor`}],attrs:[{tfName:`Tin`,name:`tIn`,type:`dtype`,notSupported:!0},{tfName:`Tout`,name:`tOut`,type:`dtype`,notSupported:!0}]},{tfOpName:`LookupTableFind`,category:`hash_table`,inputs:[{start:0,name:`tableHandle`,type:`tensor`},{start:1,name:`keys`,type:`tensor`},{start:2,name:`defaultValue`,type:`tensor`}],attrs:[{tfName:`Tin`,name:`tIn`,type:`dtype`,notSupported:!0},{tfName:`Tout`,name:`tOut`,type:`dtype`,notSupported:!0}]},{tfOpName:`LookupTableFindV2`,category:`hash_table`,inputs:[{start:0,name:`tableHandle`,type:`tensor`},{start:1,name:`keys`,type:`tensor`},{start:2,name:`defaultValue`,type:`tensor`}],attrs:[{tfName:`Tin`,name:`tIn`,type:`dtype`,notSupported:!0},{tfName:`Tout`,name:`tOut`,type:`dtype`,notSupported:!0}]},{tfOpName:`LookupTableSize`,category:`hash_table`,inputs:[{start:0,name:`tableHandle`,type:`tensor`}]},{tfOpName:`LookupTableSizeV2`,category:`hash_table`,inputs:[{start:0,name:`tableHandle`,type:`tensor`}]},{tfOpName:`InitializeTable`,category:`hash_table`,inputs:[{start:0,name:`tableHandle`,type:`tensor`},{start:1,name:`keys`,type:`tensor`},{start:2,name:`values`,type:`tensor`}]},{tfOpName:`InitializeTableV2`,category:`hash_table`,inputs:[{start:0,name:`tableHandle`,type:`tensor`},{start:1,name:`keys`,type:`tensor`},{start:2,name:`values`,type:`tensor`}]}]})),NY=c({json:()=>PY}),PY,FY=o((()=>{PY=[{tfOpName:`ResizeBilinear`,category:`image`,inputs:[{start:0,name:`images`,type:`tensor`},{start:1,name:`size`,type:`number[]`}],attrs:[{tfName:`align_corners`,name:`alignCorners`,type:`bool`},{tfName:`half_pixel_centers`,name:`halfPixelCenters`,type:`bool`},{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`ResizeNearestNeighbor`,category:`image`,inputs:[{start:0,name:`images`,type:`tensor`},{start:1,name:`size`,type:`number[]`}],attrs:[{tfName:`align_corners`,name:`alignCorners`,type:`bool`},{tfName:`half_pixel_centers`,name:`halfPixelCenters`,type:`bool`},{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`CropAndResize`,category:`image`,inputs:[{start:0,name:`image`,type:`tensor`},{start:1,name:`boxes`,type:`tensor`},{start:2,name:`boxInd`,type:`tensor`},{start:3,name:`cropSize`,type:`number[]`}],attrs:[{tfName:`method`,name:`method`,type:`string`},{tfName:`extrapolation_value`,name:`extrapolationValue`,type:`number`}]},{tfOpName:`ImageProjectiveTransformV3`,category:`image`,inputs:[{start:0,name:`images`,type:`tensor`},{start:1,name:`transforms`,type:`tensor`},{start:2,name:`outputShape`,type:`number[]`},{start:3,name:`fillValue`,type:`number`}],attrs:[{tfName:`interpolation`,name:`interpolation`,type:`string`},{tfName:`fill_mode`,name:`fillMode`,type:`string`}]}]})),IY=c({json:()=>LY}),LY,RY=o((()=>{LY=[{tfOpName:`Equal`,category:`logical`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`NotEqual`,category:`logical`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Greater`,category:`logical`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`GreaterEqual`,category:`logical`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Less`,category:`logical`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`LessEqual`,category:`logical`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`LogicalAnd`,category:`logical`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`LogicalNot`,category:`logical`,inputs:[{start:0,name:`a`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`LogicalOr`,category:`logical`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Select`,category:`logical`,inputs:[{start:0,name:`condition`,type:`tensor`},{start:1,name:`a`,type:`tensor`},{start:2,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`SelectV2`,category:`logical`,inputs:[{start:0,name:`condition`,type:`tensor`},{start:1,name:`a`,type:`tensor`},{start:2,name:`b`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`BitwiseAnd`,category:`logical`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`y`,type:`tensor`}]}]})),zY=c({json:()=>BY}),BY,VY=o((()=>{BY=[{tfOpName:`_FusedMatMul`,category:`matrices`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`},{start:2,end:0,name:`args`,type:`tensors`}],attrs:[{tfName:`num_args`,name:`numArgs`,type:`number`},{tfName:`fused_ops`,name:`fusedOps`,type:`string[]`,defaultValue:[]},{tfName:`epsilon`,name:`epsilon`,type:`number`,defaultValue:1e-4},{tfName:`transpose_a`,name:`transposeA`,type:`bool`,defaultValue:!1},{tfName:`transpose_b`,name:`transposeB`,type:`bool`,defaultValue:!1},{tfName:`leakyrelu_alpha`,name:`leakyreluAlpha`,type:`number`,defaultValue:.2},{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`MatMul`,category:`matrices`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`transpose_a`,name:`transposeA`,type:`bool`,defaultValue:!1},{tfName:`transpose_b`,name:`transposeB`,type:`bool`,defaultValue:!1},{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`BatchMatMul`,category:`matrices`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`adj_x`,name:`transposeA`,type:`bool`,defaultValue:!1},{tfName:`adj_y`,name:`transposeB`,type:`bool`,defaultValue:!1},{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`BatchMatMulV2`,category:`matrices`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`b`,type:`tensor`}],attrs:[{tfName:`adj_x`,name:`transposeA`,type:`bool`,defaultValue:!1},{tfName:`adj_y`,name:`transposeB`,type:`bool`,defaultValue:!1},{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Transpose`,category:`matrices`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`perm`,type:`number[]`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Einsum`,category:`matrices`,inputs:[{start:0,end:0,name:`tensors`,type:`tensors`}],attrs:[{tfName:`equation`,name:`equation`,type:`string`},{tfName:`N`,name:`n`,type:`number`,defaultValue:2},{tfName:`T`,name:`dtype`,type:`dtype`}]},{tfOpName:`MatrixBandPart`,category:`matrices`,inputs:[{start:0,name:`a`,type:`tensor`},{start:1,name:`numLower`,type:`tensor`},{start:1,name:`numUpper`,type:`tensor`}]}]})),HY=c({json:()=>UY}),UY,WY=o((()=>{UY=[{tfOpName:`EuclideanNorm`,category:`normalization`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`axis`,type:`number[]`}],attrs:[{tfName:`keep_dims`,name:`keepDims`,type:`bool`,defaultValue:!1}]},{tfOpName:`FusedBatchNorm`,category:`normalization`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`scale`,type:`tensor`},{start:2,name:`offset`,type:`tensor`},{start:3,name:`mean`,type:`tensor`},{start:4,name:`variance`,type:`tensor`}],attrs:[{tfName:`epsilon`,name:`epsilon`,type:`number`,defaultValue:.001},{tfName:`data_format`,name:`dataFormat`,type:`string`,notSupported:!0}]},{tfOpName:`FusedBatchNormV2`,category:`normalization`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`scale`,type:`tensor`},{start:2,name:`offset`,type:`tensor`},{start:3,name:`mean`,type:`tensor`},{start:4,name:`variance`,type:`tensor`}],attrs:[{tfName:`epsilon`,name:`epsilon`,type:`number`,defaultValue:.001},{tfName:`data_format`,name:`dataFormat`,type:`string`,notSupported:!0}]},{tfOpName:`FusedBatchNormV3`,category:`normalization`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`scale`,type:`tensor`},{start:2,name:`offset`,type:`tensor`},{start:3,name:`mean`,type:`tensor`},{start:4,name:`variance`,type:`tensor`}],attrs:[{tfName:`epsilon`,name:`epsilon`,type:`number`,defaultValue:.001},{tfName:`data_format`,name:`dataFormat`,type:`string`,notSupported:!0}]},{tfOpName:`LRN`,category:`normalization`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`depth_radius`,name:`radius`,type:`number`,defaultValue:5},{tfName:`bias`,name:`bias`,type:`number`,defaultValue:1},{tfName:`alpha`,name:`alpha`,type:`number`,defaultValue:1},{tfName:`beta`,name:`beta`,type:`number`,defaultValue:.5}]},{tfOpName:`Softmax`,category:`normalization`,inputs:[{start:0,name:`x`,type:`tensor`}]},{tfOpName:`LogSoftmax`,category:`normalization`,inputs:[{start:0,name:`x`,type:`tensor`}]}]})),GY=c({json:()=>KY}),KY,qY=o((()=>{KY=[{tfOpName:`Bincount`,category:`reduction`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`size`,type:`number`},{start:2,name:`weights`,type:`tensor`}]},{tfOpName:`DenseBincount`,category:`reduction`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`size`,type:`number`},{start:2,name:`weights`,type:`tensor`}],attrs:[{tfName:`binary_output`,name:`binaryOutput`,type:`bool`}]},{tfOpName:`Max`,category:`reduction`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`axis`,type:`number[]`}],attrs:[{tfName:`keep_dims`,name:`keepDims`,type:`bool`}]},{tfOpName:`Mean`,category:`reduction`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`axis`,type:`number[]`}],attrs:[{tfName:`keep_dims`,name:`keepDims`,type:`bool`}]},{tfOpName:`Min`,category:`reduction`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`axis`,type:`number[]`}],attrs:[{tfName:`keep_dims`,name:`keepDims`,type:`bool`}]},{tfOpName:`Sum`,category:`reduction`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`axis`,type:`number[]`}],attrs:[{tfName:`keep_dims`,name:`keepDims`,type:`bool`}]},{tfOpName:`All`,category:`reduction`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`axis`,type:`number[]`}],attrs:[{tfName:`keep_dims`,name:`keepDims`,type:`bool`}]},{tfOpName:`Any`,category:`reduction`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`axis`,type:`number[]`}],attrs:[{tfName:`keep_dims`,name:`keepDims`,type:`bool`}]},{tfOpName:`ArgMax`,category:`reduction`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`axis`,type:`number`}]},{tfOpName:`ArgMin`,category:`reduction`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`axis`,type:`number`}]},{tfOpName:`Prod`,category:`reduction`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`axis`,type:`number[]`}],attrs:[{tfName:`keep_dims`,name:`keepDims`,type:`bool`},{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`Cumprod`,category:`reduction`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`axis`,type:`number`}],attrs:[{tfName:`exclusive`,name:`exclusive`,type:`bool`},{tfName:`reverse`,name:`reverse`,type:`bool`}]},{tfOpName:`Cumsum`,category:`reduction`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`axis`,type:`number`}],attrs:[{tfName:`exclusive`,name:`exclusive`,type:`bool`},{tfName:`reverse`,name:`reverse`,type:`bool`}]}]})),JY=c({json:()=>YY}),YY,XY=o((()=>{YY=[{tfOpName:`ConcatV2`,category:`slice_join`,inputs:[{start:0,end:-1,name:`tensors`,type:`tensors`},{start:-1,name:`axis`,type:`number`}],attrs:[{tfName:`N`,name:`n`,type:`number`,defaultValue:2}]},{tfOpName:`Concat`,category:`slice_join`,inputs:[{start:1,end:0,name:`tensors`,type:`tensors`},{start:0,name:`axis`,type:`number`}],attrs:[{tfName:`N`,name:`n`,type:`number`,defaultValue:2}]},{tfOpName:`GatherV2`,category:`slice_join`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`indices`,type:`tensor`},{start:2,name:`axis`,type:`number`,defaultValue:0}],attrs:[{tfName:`batch_dims`,name:`batchDims`,type:`number`,defaultValue:0}]},{tfOpName:`Gather`,category:`slice_join`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`indices`,type:`tensor`}],attrs:[{tfName:`validate_indices`,name:`validateIndices`,type:`bool`,notSupported:!0}]},{tfOpName:`Reverse`,category:`slice_join`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`dims`,type:`bool[]`}]},{tfOpName:`ReverseV2`,category:`slice_join`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`axis`,type:`number[]`}]},{tfOpName:`Slice`,category:`slice_join`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`begin`,type:`number[]`},{start:2,name:`size`,type:`number[]`}]},{tfOpName:`StridedSlice`,category:`slice_join`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`begin`,type:`number[]`},{start:2,name:`end`,type:`number[]`},{start:3,name:`strides`,type:`number[]`}],attrs:[{tfName:`begin_mask`,name:`beginMask`,type:`number`,defaultValue:0},{tfName:`end_mask`,name:`endMask`,type:`number`,defaultValue:0},{tfName:`new_axis_mask`,name:`newAxisMask`,type:`number`,defaultValue:0},{tfName:`ellipsis_mask`,name:`ellipsisMask`,type:`number`,defaultValue:0},{tfName:`shrink_axis_mask`,name:`shrinkAxisMask`,type:`number`,defaultValue:0}]},{tfOpName:`Pack`,category:`slice_join`,inputs:[{start:0,end:0,name:`tensors`,type:`tensors`}],attrs:[{tfName:`axis`,name:`axis`,type:`number`,defaultValue:0}]},{tfOpName:`Unpack`,category:`slice_join`,inputs:[{start:0,name:`tensor`,type:`tensor`}],attrs:[{tfName:`axis`,name:`axis`,type:`number`,defaultValue:0},{tfName:`num`,name:`num`,type:`number`,defaultValue:0,notSupported:!0}]},{tfOpName:`Tile`,category:`slice_join`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`reps`,type:`number[]`}]},{tfOpName:`Split`,category:`slice_join`,inputs:[{start:0,name:`axis`,type:`number`,defaultValue:0},{start:1,name:`x`,type:`tensor`}],attrs:[{tfName:`num_split`,name:`numOrSizeSplits`,type:`number`,defaultValue:1}]},{tfOpName:`SplitV`,category:`slice_join`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`numOrSizeSplits`,type:`number[]`},{start:2,name:`axis`,type:`number`,defaultValue:0}]},{tfOpName:`ScatterNd`,category:`slice_join`,inputs:[{start:0,name:`indices`,type:`tensor`},{start:1,name:`values`,type:`tensor`},{start:2,name:`shape`,type:`number[]`}]},{tfOpName:`GatherNd`,category:`slice_join`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`indices`,type:`tensor`}]},{tfOpName:`SparseToDense`,category:`slice_join`,inputs:[{start:0,name:`sparseIndices`,type:`tensor`},{start:1,name:`outputShape`,type:`number[]`},{start:2,name:`sparseValues`,type:`tensor`},{start:3,name:`defaultValue`,type:`tensor`}],attrs:[{tfName:`validate_indices`,name:`validateIndices`,type:`bool`,defaultValue:!1,notSupported:!0}]},{tfOpName:`TensorScatterUpdate`,category:`slice_join`,inputs:[{start:0,name:`tensor`,type:`tensor`},{start:1,name:`indices`,type:`tensor`},{start:2,name:`values`,type:`tensor`}]}]})),ZY=c({json:()=>QY}),QY,$Y=o((()=>{QY=[{tfOpName:`SparseFillEmptyRows`,category:`sparse`,inputs:[{start:0,name:`indices`,type:`tensor`},{start:1,name:`values`,type:`tensor`},{start:2,name:`denseShape`,type:`tensor`},{start:3,name:`defaultValue`,type:`tensor`}]},{tfOpName:`SparseReshape`,category:`sparse`,inputs:[{start:0,name:`inputIndices`,type:`tensor`},{start:1,name:`inputShape`,type:`tensor`},{start:2,name:`newShape`,type:`tensor`}],attrs:[{tfName:`T`,name:`dtype`,type:`dtype`,notSupported:!0}]},{tfOpName:`SparseSegmentMean`,category:`sparse`,inputs:[{start:0,name:`data`,type:`tensor`},{start:1,name:`indices`,type:`tensor`},{start:2,name:`segmentIds`,type:`tensor`}]},{tfOpName:`SparseSegmentSum`,category:`sparse`,inputs:[{start:0,name:`data`,type:`tensor`},{start:1,name:`indices`,type:`tensor`},{start:2,name:`segmentIds`,type:`tensor`}]}]})),eX=c({json:()=>tX}),tX,nX=o((()=>{tX=[{tfOpName:`FFT`,category:`spectral`,inputs:[{start:0,name:`x`,type:`tensor`}]},{tfOpName:`IFFT`,category:`spectral`,inputs:[{start:0,name:`x`,type:`tensor`}]},{tfOpName:`RFFT`,category:`spectral`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`fft_length`,type:`number`,notSupported:!0}]},{tfOpName:`IRFFT`,category:`spectral`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`fft_length`,type:`number`,notSupported:!0}]}]})),rX=c({json:()=>iX}),iX,aX=o((()=>{iX=[{tfOpName:`StaticRegexReplace`,category:`string`,inputs:[{start:0,name:`input`,type:`tensor`}],attrs:[{tfName:`pattern`,name:`pattern`,type:`string`},{tfName:`rewrite`,name:`rewrite`,type:`string`},{tfName:`replace_global`,name:`replaceGlobal`,type:`bool`}]},{tfOpName:`StringNGrams`,category:`string`,inputs:[{start:0,name:`data`,type:`tensor`},{start:1,name:`dataSplits`,type:`tensor`}],attrs:[{tfName:`separator`,name:`separator`,type:`string`},{tfName:`ngram_widths`,name:`nGramWidths`,type:`number[]`},{tfName:`left_pad`,name:`leftPad`,type:`string`},{tfName:`right_pad`,name:`rightPad`,type:`string`},{tfName:`pad_width`,name:`padWidth`,type:`number`},{tfName:`preserve_short_sequences`,name:`preserveShortSequences`,type:`bool`}],outputs:[`ngrams`,`ngrams_splits`]},{tfOpName:`StringSplit`,category:`string`,inputs:[{start:0,name:`input`,type:`tensor`},{start:1,name:`delimiter`,type:`tensor`}],attrs:[{tfName:`skip_empty`,name:`skipEmpty`,type:`bool`}],outputs:[`indices`,`values`,`shape`]},{tfOpName:`StringToHashBucketFast`,category:`string`,inputs:[{start:0,name:`input`,type:`tensor`}],attrs:[{tfName:`num_buckets`,name:`numBuckets`,type:`number`}]}]})),oX=c({json:()=>sX}),sX,cX=o((()=>{sX=[{tfOpName:`Cast`,category:`transformation`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`SrcT`,name:`sdtype`,type:`dtype`,notSupported:!0},{tfName:`DstT`,name:`dtype`,type:`dtype`}]},{tfOpName:`ExpandDims`,category:`transformation`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`axis`,type:`number`}]},{tfOpName:`MirrorPad`,category:`transformation`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`padding`,type:`number[]`}],attrs:[{tfName:`mode`,name:`mode`,type:`string`}]},{tfOpName:`Pad`,category:`transformation`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`padding`,type:`number[]`}],attrs:[{tfName:`constant_value`,name:`constantValue`,type:`number`,defaultValue:0}]},{tfOpName:`PadV2`,category:`transformation`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`padding`,type:`number[]`},{start:2,name:`constantValue`,type:`number`,defaultValue:0}]},{tfOpName:`Reshape`,category:`transformation`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`shape`,type:`number[]`}]},{tfOpName:`EnsureShape`,category:`transformation`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`shape`,type:`number[]`}]},{tfOpName:`Squeeze`,category:`transformation`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`axis`,tfDeprecatedName:`squeeze_dims`,name:`axis`,type:`number[]`}]},{tfOpName:`SpaceToBatchND`,category:`transformation`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`blockShape`,type:`number[]`},{start:2,name:`paddings`,type:`number[]`}]},{tfOpName:`BatchToSpaceND`,category:`transformation`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`blockShape`,type:`number[]`},{start:2,name:`crops`,type:`number[]`}]},{tfOpName:`DepthToSpace`,category:`transformation`,inputs:[{start:0,name:`x`,type:`tensor`}],attrs:[{tfName:`block_size`,name:`blockSize`,type:`number`},{tfName:`data_format`,name:`dataFormat`,type:`string`}]},{tfOpName:`BroadcastTo`,category:`transformation`,inputs:[{start:0,name:`x`,type:`tensor`},{start:1,name:`shape`,type:`number[]`}],attrs:[]},{tfOpName:`BroadcastArgs`,category:`transformation`,inputs:[{start:0,name:`s0`,type:`tensor`},{start:1,name:`s1`,type:`tensor`}],attrs:[]}]}));function lX(e){let t=M().global;if(t.atob!==void 0)return t.atob(e);if(typeof Buffer<`u`)return new Buffer(e,`base64`).toString();throw Error(`Unable to decode base64 in this environment. Missing built-in atob() or Buffer()`)}function uX(e,t){let n=Array.isArray(e)?String.fromCharCode.apply(null,e):lX(e);return t?n:n.toLowerCase()}function dX(e,t,n,r=!1){let i=e[t];return i==null?n:uX(i.s,r)}function fX(e,t,n){let r=e[t];return r?r.b:n}function pX(e,t,n){let r=e[t]||{},i=r.i==null?r.f==null?n:r.f:r.i;return typeof i==`number`?i:parseInt(i,10)}function mX(e){switch(typeof e==`string`&&(e=WJ[e]),e){case WJ.DT_FLOAT:case WJ.DT_HALF:return`float32`;case WJ.DT_INT32:case WJ.DT_INT64:case WJ.DT_INT8:case WJ.DT_UINT8:return`int32`;case WJ.DT_BOOL:return`bool`;case WJ.DT_DOUBLE:return`float32`;case WJ.DT_STRING:return`string`;case WJ.DT_COMPLEX64:case WJ.DT_COMPLEX128:return`complex64`;default:return null}}function hX(e,t,n){let r=e[t];return r&&r.func?r.func.name:n}function gX(e,t,n){let r=e[t];return r&&r.type?mX(r.type):n}function _X(e,t,n){let r=e[t];return r&&r.list&&r.list.type?r.list.type.map(e=>mX(e)):n}function vX(e){if(!e.unknownRank)return e.dim==null?[]:e.dim.map(e=>typeof e.size==`number`?e.size:parseInt(e.size,10))}function yX(e,t,n){let r=e[t];return r&&r.shape?vX(r.shape):n}function bX(e,t,n){let r=e[t];return r?((r.list.f&&r.list.f.length?r.list.f:r.list.i)||[]).map(e=>typeof e==`number`?e:parseInt(e,10)):n}function xX(e,t,n,r=!1){let i=e[t];return i&&i.list&&i.list.s?i.list.s.map(e=>uX(e,r)):n}function SX(e,t,n){let r=e[t];return r&&r.list&&r.list.shape?r.list.shape.map(e=>vX(e)):n}function CX(e,t,n){let r=e[t];return r&&r.list&&r.list.b?r.list.b:n}var wX,TX=o((()=>{J(),KJ(),ZJ(),aY(),cY(),dY(),mY(),_Y(),bY(),CY(),EY(),kY(),MY(),FY(),RY(),VY(),WY(),qY(),XY(),$Y(),nX(),aX(),cX(),wX=class{static get Instance(){return this._instance||=new this}constructor(){let e=[oY,lY,fY,hY,vY,xY,wY,DY,AY,NY,IY,zY,HY,GY,JY,ZY,eX,rX,oX],t=[].concat(...e.map(e=>e.json));this.opMappers=t.reduce((e,t)=>(e[t.tfOpName]=t,e),{})}transformGraph(e,t={}){let n=e.node,r=[],i=[],a=[],o=n.reduce((e,t)=>(e[t.name]=this.mapNode(t),t.op.startsWith(`Placeholder`)?r.push(e[t.name]):t.op===`Const`?i.push(e[t.name]):(t.input==null||t.input.length===0)&&a.push(e[t.name]),e),{}),s=[],c=[],l={},u={};t!=null&&(l=this.mapSignatureEntries(t.inputs),u=this.mapSignatureEntries(t.outputs));let d=Object.keys(o);d.forEach(e=>{let t=o[e];t.inputNames.forEach((e,n)=>{let[r,,i]=eY(e),a=o[r];if(a.outputs!=null){let e=a.outputs.indexOf(i);if(e!==-1){let i=`${r}:${e}`;t.inputNames[n]=i}}t.inputs.push(a),a.children.push(t)})}),Object.keys(u).length===0?d.forEach(e=>{let t=o[e];t.children.length===0&&c.push(t)}):Object.keys(u).forEach(e=>{let[t]=eY(e),n=o[t];n!=null&&(n.signatureKey=u[e],c.push(n))}),Object.keys(l).length>0?Object.keys(l).forEach(e=>{let[t]=eY(e),n=o[t];n&&(n.signatureKey=l[e],s.push(n))}):s=r;let f={};e.library!=null&&e.library.function!=null&&(f=e.library.function.reduce((e,t)=>(e[t.signature.name]=this.mapFunction(t),e),{}));let p={nodes:o,inputs:s,outputs:c,weights:i,placeholders:r,signature:t,functions:f};return a.length>0&&(p.initNodes=a),p}mapSignatureEntries(e){return Object.keys(e||{}).reduce((t,n)=>(t[e[n].name]=n,t),{})}mapNode(e){let t=JJ(e.op)||this.opMappers[e.op]||{};e.attr??={};let n={name:e.name,op:e.op,category:t.category,inputNames:(e.input||[]).map(e=>e.startsWith(`^`)?e.slice(1):e),inputs:[],children:[],inputParams:{},attrParams:{},rawAttrs:e.attr,outputs:t.outputs};return t.inputs!=null&&(n.inputParams=t.inputs.reduce((e,t)=>(e[t.name]={type:t.type,inputIndexStart:t.start,inputIndexEnd:t.end},e),{})),t.attrs!=null&&(n.attrParams=t.attrs.reduce((t,n)=>{let r=n.type,i;switch(n.type){case`string`:i=dX(e.attr,n.tfName,n.defaultValue),i===void 0&&n.tfDeprecatedName&&(i=dX(e.attr,n.tfDeprecatedName,n.defaultValue));break;case`string[]`:i=xX(e.attr,n.tfName,n.defaultValue),i===void 0&&n.tfDeprecatedName&&(i=xX(e.attr,n.tfDeprecatedName,n.defaultValue));break;case`number`:i=pX(e.attr,n.tfName,n.defaultValue||0),i===void 0&&n.tfDeprecatedName&&(i=pX(e.attr,n.tfDeprecatedName,n.defaultValue));break;case`number[]`:i=bX(e.attr,n.tfName,n.defaultValue),i===void 0&&n.tfDeprecatedName&&(i=bX(e.attr,n.tfDeprecatedName,n.defaultValue));break;case`bool`:i=fX(e.attr,n.tfName,n.defaultValue),i===void 0&&n.tfDeprecatedName&&(i=fX(e.attr,n.tfDeprecatedName,n.defaultValue));break;case`bool[]`:i=CX(e.attr,n.tfName,n.defaultValue),i===void 0&&n.tfDeprecatedName&&(i=CX(e.attr,n.tfDeprecatedName,n.defaultValue));break;case`shape`:i=yX(e.attr,n.tfName,n.defaultValue),i===void 0&&n.tfDeprecatedName&&(i=yX(e.attr,n.tfDeprecatedName,n.defaultValue));break;case`shape[]`:i=SX(e.attr,n.tfName,n.defaultValue),i===void 0&&n.tfDeprecatedName&&(i=SX(e.attr,n.tfDeprecatedName,n.defaultValue));break;case`dtype`:i=gX(e.attr,n.tfName,n.defaultValue),i===void 0&&n.tfDeprecatedName&&(i=gX(e.attr,n.tfDeprecatedName,n.defaultValue));break;case`dtype[]`:i=_X(e.attr,n.tfName,n.defaultValue),i===void 0&&n.tfDeprecatedName&&(i=_X(e.attr,n.tfDeprecatedName,n.defaultValue));break;case`func`:i=hX(e.attr,n.tfName,n.defaultValue),i===void 0&&n.tfDeprecatedName&&(i=hX(e.attr,n.tfDeprecatedName,n.defaultValue));break;case`tensor`:case`tensors`:break;default:throw Error(`Unsupported param type: ${n.type} for op: ${e.op}`)}return t[n.name]={value:i,type:r},t},{})),n}mapFunction(e){let t=e.nodeDef,n=[],r=[],i={};t!=null&&(i=t.reduce((e,t)=>(e[t.name]=this.mapNode(t),t.op===`Const`&&r.push(e[t.name]),e),{}));let a=[],o=[];e.signature.inputArg.forEach(e=>{let[t]=eY(e.name),n={name:t,op:`Placeholder`,inputs:[],inputNames:[],category:`graph`,inputParams:{},attrParams:{dtype:{value:mX(e.type),type:`dtype`}},children:[]};n.signatureKey=e.name,a.push(n),i[t]=n}),Object.keys(i).forEach(e=>{let t=i[e];t.inputNames.forEach((e,n)=>{let[r,,a]=eY(e),o=i[r];if(o.outputs!=null){let e=o.outputs.indexOf(a);if(e!==-1){let i=`${r}:${e}`;t.inputNames[n]=i}}t.inputs.push(o),o.children.push(t)})});let s=e.ret;e.signature.outputArg.forEach(e=>{let[t,n]=eY(s[e.name]),r=i[t];r!=null&&(r.defaultOutput=n,o.push(r))});let c=this.mapArgsToSignature(e);return{nodes:i,inputs:a,outputs:o,weights:r,placeholders:n,signature:c}}mapArgsToSignature(e){return{methodName:e.signature.name,inputs:e.signature.inputArg.reduce((e,t)=>(e[t.name]=this.mapArgToTensorInfo(t),e),{}),outputs:e.signature.outputArg.reduce((t,n)=>(t[n.name]=this.mapArgToTensorInfo(n,e.ret),t),{})}}mapArgToTensorInfo(e,t){let n=e.name;return t!=null&&(n=t[n]),{name:n,dtype:e.type}}}})),EX,DX=o((()=>{aY(),TX(),EX=class{constructor(e,t,n){this.node=e,this.tensorMap=t,this.context=n,this.inputs=[],this.attrs={},this.inputs=e.inputNames.map(e=>this.getInput(e)),e.rawAttrs!=null&&(this.attrs=Object.keys(e.rawAttrs).reduce((e,t)=>(e[t]=this.getAttr(t),e),{}))}getInput(e){return QJ(e,this.tensorMap,this.context)}getAttr(e,t){let n=this.node.rawAttrs[e];if(n.tensor!=null)return QJ(e,this.tensorMap,this.context);if(n.i!=null||n.f!=null)return pX(this.node.rawAttrs,e,t);if(n.s!=null)return dX(this.node.rawAttrs,e,t);if(n.b!=null)return fX(this.node.rawAttrs,e,t);if(n.shape!=null)return yX(this.node.rawAttrs,e,t);if(n.type!=null)return gX(this.node.rawAttrs,e,t);if(n.list!=null){if(n.list.i!=null||n.list.f!=null)return bX(this.node.rawAttrs,e,t);if(n.list.s!=null)return xX(this.node.rawAttrs,e,t);if(n.list.shape!=null)return SX(this.node.rawAttrs,e,t);if(n.list.b!=null)return CX(this.node.rawAttrs,e,t);if(n.list.type!=null)return _X(this.node.rawAttrs,e,t)}return t}}})),OX=c({OP_SCOPE_SUFFIX:()=>Xa,abs:()=>bc,acos:()=>Cc,acosh:()=>Ec,add:()=>H,addN:()=>kc,all:()=>Mc,any:()=>Fc,argMax:()=>Rc,argMin:()=>Vc,asin:()=>Wc,asinh:()=>qc,atan:()=>Xc,atan2:()=>$c,atanh:()=>nl,avgPool:()=>El,avgPool3d:()=>kl,basicLSTMCell:()=>ql,batchNorm:()=>tu,batchNorm2d:()=>iu,batchNorm3d:()=>su,batchNorm4d:()=>uu,batchToSpaceND:()=>Xl,bincount:()=>pu,bitwiseAnd:()=>gu,booleanMaskAsync:()=>ib,broadcastArgs:()=>yu,broadcastTo:()=>Su,buffer:()=>V,cast:()=>tc,ceil:()=>Tu,clipByValue:()=>Au,clone:()=>ic,complex:()=>Qa,concat:()=>Ml,concat1d:()=>Nu,concat2d:()=>Iu,concat3d:()=>zu,concat4d:()=>Hu,conv1d:()=>Ju,conv2d:()=>Gu,conv2dTranspose:()=>ed,conv3d:()=>rd,conv3dTranspose:()=>ld,cos:()=>fd,cosh:()=>hd,cosineWindow:()=>kb,cumprod:()=>vd,cumsum:()=>xd,denseBincount:()=>wd,depthToSpace:()=>Dd,depthwiseConv2d:()=>Ad,diag:()=>Nd,dilation2d:()=>Id,div:()=>hc,divNoNan:()=>Qd,dot:()=>tf,dropout:()=>Eb,einsum:()=>af,elu:()=>cf,enclosingPowerOfTwo:()=>Ob,ensureShape:()=>df,equal:()=>Ud,erf:()=>mf,euclideanNorm:()=>Xf,exp:()=>$f,expandDims:()=>np,expm1:()=>ap,eye:()=>dp,fft:()=>Fv,fill:()=>Du,floor:()=>mp,floorDiv:()=>fc,fused:()=>rx,gather:()=>_p,gatherND:()=>xb,greater:()=>bp,greaterEqual:()=>Cp,ifft:()=>Rv,imag:()=>Ep,image:()=>LC,inTopKAsync:()=>Mb,irfft:()=>Vv,isFinite:()=>kp,isInf:()=>Mp,isNaN:()=>Fp,leakyRelu:()=>Rp,less:()=>Vp,lessEqual:()=>Wp,linalg:()=>RC,linspace:()=>Kp,localResponseNormalization:()=>Yp,log:()=>Qp,log1p:()=>tm,logSigmoid:()=>vm,logSoftmax:()=>Cm,logSumExp:()=>Em,logicalAnd:()=>km,logicalNot:()=>Mm,logicalOr:()=>Fm,logicalXor:()=>Rm,losses:()=>zC,lowerBound:()=>Wm,matMul:()=>Fl,max:()=>Ef,maxPool:()=>qm,maxPool3d:()=>Xm,maxPoolWithArgmax:()=>$m,maximum:()=>nh,mean:()=>ah,meshgrid:()=>dh,min:()=>kf,minimum:()=>mh,mirrorPad:()=>_h,mod:()=>bh,moments:()=>Ch,movingAverage:()=>ub,mul:()=>U,multiRNNCell:()=>Eh,multinomial:()=>kh,neg:()=>fm,norm:()=>qf,notEqual:()=>Mh,oneHot:()=>Fh,ones:()=>lh,onesLike:()=>Rh,op:()=>z,outerProduct:()=>Vh,pad:()=>Wh,pad1d:()=>qh,pad2d:()=>Xh,pad3d:()=>$h,pad4d:()=>ng,pool:()=>ug,pow:()=>Mf,prelu:()=>pg,print:()=>oc,prod:()=>gg,raggedGather:()=>yg,raggedRange:()=>Sg,raggedTensorToTensor:()=>Tg,rand:()=>Og,randomGamma:()=>o_,randomNormal:()=>l_,randomStandardNormal:()=>f_,randomUniform:()=>h_,randomUniformInt:()=>v_,range:()=>b_,real:()=>C_,reciprocal:()=>E_,relu:()=>k_,relu6:()=>M_,reshape:()=>W,reverse:()=>F_,reverse1d:()=>R_,reverse2d:()=>V_,reverse3d:()=>W_,reverse4d:()=>q_,rfft:()=>qv,round:()=>X_,rsqrt:()=>$_,scalar:()=>Pf,scatterND:()=>pb,searchSorted:()=>Hm,selu:()=>nv,separableConv2d:()=>av,setdiff1dAsync:()=>cv,sigmoid:()=>Rl,sign:()=>dv,signal:()=>IC,sin:()=>mv,sinh:()=>_v,slice:()=>Vl,slice1d:()=>bv,slice2d:()=>Cv,slice3d:()=>Ev,slice4d:()=>kv,softmax:()=>Mv,softplus:()=>hm,spaceToBatchND:()=>ag,sparse:()=>BC,sparseToDense:()=>vb,spectral:()=>FC,split:()=>Wv,sqrt:()=>Lf,square:()=>Bf,squaredDifference:()=>Xv,squeeze:()=>$v,stack:()=>ny,step:()=>ay,stridedSlice:()=>cy,string:()=>VC,sub:()=>q,sum:()=>Uf,tan:()=>dy,tanh:()=>Wl,tensor:()=>no,tensor1d:()=>py,tensor2d:()=>hy,tensor3d:()=>_y,tensor4d:()=>yy,tensor5d:()=>xy,tensor6d:()=>Cy,tensorScatterUpdate:()=>jy,tile:()=>cp,topk:()=>Py,transpose:()=>sb,truncatedNormal:()=>Ly,unique:()=>By,unsortedSegmentSum:()=>Uy,unstack:()=>Ky,upperBound:()=>Jy,variable:()=>Xy,where:()=>Kd,whereAsync:()=>tb,zeros:()=>sh,zerosLike:()=>Yd}),kX=o((()=>{HC()})),AX,jX=o((()=>{kX(),aY(),AX=(e,t,n,r=OX)=>{switch(e.op){case`BiasAdd`:case`AddV2`:case`Add`:return[r.add($(`a`,e,t,n),$(`b`,e,t,n))];case`AddN`:return[r.addN($(`tensors`,e,t,n))];case`FloorMod`:case`Mod`:return[r.mod($(`a`,e,t,n),$(`b`,e,t,n))];case`Mul`:return[r.mul($(`a`,e,t,n),$(`b`,e,t,n))];case`RealDiv`:case`Div`:return[r.div($(`a`,e,t,n),$(`b`,e,t,n))];case`DivNoNan`:return[r.divNoNan($(`a`,e,t,n),$(`b`,e,t,n))];case`FloorDiv`:return[r.floorDiv($(`a`,e,t,n),$(`b`,e,t,n))];case`Sub`:return[r.sub($(`a`,e,t,n),$(`b`,e,t,n))];case`Minimum`:return[r.minimum($(`a`,e,t,n),$(`b`,e,t,n))];case`Maximum`:return[r.maximum($(`a`,e,t,n),$(`b`,e,t,n))];case`Pow`:return[r.pow($(`a`,e,t,n),$(`b`,e,t,n))];case`SquaredDifference`:return[r.squaredDifference($(`a`,e,t,n),$(`b`,e,t,n))];default:throw TypeError(`Node type ${e.op} is not implemented`)}}})),MX,NX=o((()=>{kX(),aY(),MX=(e,t,n,r=OX)=>{switch(e.op){case`Abs`:case`ComplexAbs`:return[r.abs($(`x`,e,t,n))];case`Acos`:return[r.acos($(`x`,e,t,n))];case`Acosh`:return[r.acosh($(`x`,e,t,n))];case`Asin`:return[r.asin($(`x`,e,t,n))];case`Asinh`:return[r.asinh($(`x`,e,t,n))];case`Atan`:return[r.atan($(`x`,e,t,n))];case`Atan2`:return[r.atan2($(`x`,e,t,n),$(`y`,e,t,n))];case`Atanh`:return[r.atanh($(`x`,e,t,n))];case`Ceil`:return[r.ceil($(`x`,e,t,n))];case`Complex`:return[r.complex($(`real`,e,t,n),$(`imag`,e,t,n))];case`Cos`:return[r.cos($(`x`,e,t,n))];case`Cosh`:return[r.cosh($(`x`,e,t,n))];case`Elu`:return[r.elu($(`x`,e,t,n))];case`Erf`:return[r.erf($(`x`,e,t,n))];case`Exp`:return[r.exp($(`x`,e,t,n))];case`Expm1`:return[r.expm1($(`x`,e,t,n))];case`Floor`:return[r.floor($(`x`,e,t,n))];case`Log`:return[r.log($(`x`,e,t,n))];case`Log1p`:return[r.log1p($(`x`,e,t,n))];case`Imag`:return[r.imag($(`x`,e,t,n))];case`Neg`:return[r.neg($(`x`,e,t,n))];case`Reciprocal`:return[r.reciprocal($(`x`,e,t,n))];case`Real`:return[r.real($(`x`,e,t,n))];case`Relu`:return[r.relu($(`x`,e,t,n))];case`Round`:return[r.round($(`x`,e,t,n))];case`Selu`:return[r.selu($(`x`,e,t,n))];case`Sigmoid`:return[r.sigmoid($(`x`,e,t,n))];case`Sin`:return[r.sin($(`x`,e,t,n))];case`Sign`:return[r.sign($(`x`,e,t,n))];case`Sinh`:return[r.sinh($(`x`,e,t,n))];case`Softplus`:return[r.softplus($(`x`,e,t,n))];case`Sqrt`:return[r.sqrt($(`x`,e,t,n))];case`Square`:return[r.square($(`x`,e,t,n))];case`Tanh`:return[r.tanh($(`x`,e,t,n))];case`Tan`:return[r.tan($(`x`,e,t,n))];case`ClipByValue`:return[r.clipByValue($(`x`,e,t,n),$(`clipValueMin`,e,t,n),$(`clipValueMax`,e,t,n))];case`Relu6`:return[r.relu6($(`x`,e,t,n))];case`Rsqrt`:return[r.rsqrt(QJ(e.inputNames[0],t,n))];case`LeakyRelu`:return[r.leakyRelu($(`x`,e,t,n),$(`alpha`,e,t,n))];case`Prelu`:return[r.prelu($(`x`,e,t,n),$(`alpha`,e,t,n))];case`IsNan`:return[r.isNaN(QJ(e.inputNames[0],t,n))];case`IsInf`:return[r.isInf(QJ(e.inputNames[0],t,n))];case`IsFinite`:return[r.isFinite(QJ(e.inputNames[0],t,n))];default:throw TypeError(`Node type ${e.op} is not implemented`)}}}));function PX(e,t,n=``){if(!(typeof e==`number`||typeof t==`number`)){E(e.length===t.length,()=>n+` Shapes ${e} and ${t} must match`);for(let r=0;r<e.length;r++){let i=e[r],a=t[r];E(i<0||a<0||i===a,()=>n+` Shapes ${e} and ${t} must match`)}}}function FX(e){return!(typeof e==`number`||e.some(e=>e<0))}function IX(e,t,n){let r=LX(e,n),i=!FX(r);if(i&&t.length===0)throw Error(`Tried to calculate elements of an empty list with non-fully-defined elementShape: ${r}`);if(i&&t.forEach(e=>{r=LX(e.shape,r)}),!FX(r))throw Error(`Non-fully-defined elementShape: ${r}`);return r}function LX(e,t){if(typeof e==`number`)return t;if(typeof t==`number`)return e;if(e.length!==t.length)throw Error(`Incompatible ranks during merge: ${e} vs. ${t}`);let n=[];for(let r=0;r<e.length;++r){let i=e[r],a=t[r];if(i>=0&&a>=0&&i!==a)throw Error(`Incompatible shape during merge: ${e} vs. ${t}`);n[r]=i>=0?i:a}return n}var RX=o((()=>{J()})),zX,BX=o((()=>{J(),RX(),zX=class{constructor(e,t,n,r,i,a,o){this.name=e,this.dtype=t,this.maxSize=n,this.elementShape=r,this.identicalElementShapes=i,this.dynamicSize=a,this.clearAfterRead=o,this.tensors=[],this.closed_=!1,this.idTensor=Pf(0),bo(this.idTensor)}get id(){return this.idTensor.id}get closed(){return this.closed_}clearAndClose(e){this.tensors.forEach(t=>{(e==null||!e.has(t.tensor.id))&&t.tensor.dispose()}),this.tensors=[],this.closed_=!0,this.idTensor.dispose()}size(){return this.tensors.length}read(e){if(this.closed_)throw Error(`TensorArray ${this.name} has already been closed.`);if(e<0||e>=this.size())throw Error(`Tried to read from index ${e}, but array size is: ${this.size()}`);let t=this.tensors[e];if(t.cleared)throw Error(`TensorArray ${this.name}: Could not read index ${e} twice because it was cleared after a previous read (perhaps try setting clear_after_read = false?).`);return this.clearAfterRead&&(t.cleared=!0),t.read=!0,t.tensor}readMany(e){return e.map(e=>this.read(e))}write(e,t){if(this.closed_)throw Error(`TensorArray ${this.name} has already been closed.`);if(e<0||!this.dynamicSize&&e>=this.maxSize)throw Error(`Tried to write to index ${e}, but array is not resizeable and size is: ${this.maxSize}`);let n=this.tensors[e]||{};if(t.dtype!==this.dtype)throw Error(`TensorArray ${this.name}: Could not write to TensorArray index ${e},
          because the value dtype is ${t.dtype}, but TensorArray dtype is ${this.dtype}.`);if(this.size()===0&&(this.elementShape==null||this.elementShape.length===0)&&(this.elementShape=t.shape),PX(this.elementShape,t.shape,`TensorArray ${this.name}: Could not write to TensorArray index ${e}.`),n.read)throw Error(`TensorArray ${this.name}: Could not write to TensorArray index ${e}, because it has already been read.`);if(n.written)throw Error(`TensorArray ${this.name}: Could not write to TensorArray index ${e}, because it has already been written.`);n.tensor=t,bo(t),n.written=!0,this.tensors[e]=n}writeMany(e,t){if(e.length!==t.length)throw Error(`TensorArray ${this.name}: could not write multiple tensors,because the index size: ${e.length} is not the same as tensors size: ${t.length}.`);e.forEach((e,n)=>this.write(e,t[n]))}gather(e,t){if(t&&t!==this.dtype)throw Error(`TensorArray dtype is ${this.dtype} but gather requested dtype ${t}`);if(e)e=e.slice(0,this.size());else{e=[];for(let t=0;t<this.size();t++)e.push(t)}if(e.length===0)return no([],[0].concat(this.elementShape));let n=this.readMany(e);return PX(this.elementShape,n[0].shape,`TensorArray shape mismatch: `),ny(n,0)}concat(e){if(e&&e!==this.dtype)throw Error(`TensorArray dtype is ${this.dtype} but concat requested dtype ${e}`);if(this.size()===0)return no([],[0].concat(this.elementShape));let t=[];for(let e=0;e<this.size();e++)t.push(e);let n=this.readMany(t);return PX(this.elementShape,n[0].shape,`TensorArray shape mismatch: tensor array shape (${this.elementShape}) vs first tensor shape (${n[0].shape})`),Ml(n,0)}scatter(e,t){if(t.dtype!==this.dtype)throw Error(`TensorArray dtype is ${this.dtype} but tensor has dtype ${t.dtype}`);if(e.length!==t.shape[0])throw Error(`Expected len(indices) == tensor.shape[0], but saw: ${e.length} vs. ${t.shape[0]}`);let n=Math.max(...e);if(!this.dynamicSize&&n>=this.maxSize)throw Error(`Max index must be < array size (${n}  vs. ${this.maxSize})`);this.writeMany(e,Ky(t,0))}split(e,t){if(t.dtype!==this.dtype)throw Error(`TensorArray dtype is ${this.dtype} but tensor has dtype ${t.dtype}`);let n=0,r=e.map(e=>(n+=e,n));if(n!==t.shape[0])throw Error(`Expected sum of lengths to be equal to
          tensor.shape[0], but sum of lengths is
        ${n}, and tensor's shape is: ${t.shape}`);if(!this.dynamicSize&&e.length!==this.maxSize)throw Error(`TensorArray's size is not equal to the size of lengths (${this.maxSize} vs. ${e.length}), and the TensorArray is not marked as dynamically resizeable`);let i=n===0?0:t.size/n,a=[];vo(()=>{t=W(t,[1,n,i]);for(let n=0;n<e.length;++n){let o=[0,n===0?0:r[n-1],0],s=[1,e[n],i];a[n]=W(Vl(t,o,s),this.elementShape)}return a});let o=[];for(let t=0;t<e.length;t++)o[t]=t;this.writeMany(o,a)}}}));function VX(e,t,n){let r=e.dtype;if(e.shape.length<1)throw Error(`Tensor must be at least a vector, but saw shape: ${e.shape}`);if(e.dtype!==n)throw Error(`Invalid data types; op elements ${e.dtype}, but list elements ${n}`);return PX(e.shape.slice(1),t,`TensorList shape mismatch: `),new GX(Ky(e),t,r)}function HX(e,t,n,r){return new GX([],e,t,r)}function UX(e,t,n,r){if(t.length!==e.shape[0])throw Error(`Expected len(indices) == tensor.shape[0], but saw: ${t.length} vs. ${e.shape[0]}`);let i=Math.max(...t);if(r!=null&&r!==-1&&i>=r)throw Error(`Max index must be < array size (${i}  vs. ${r})`);let a=new GX([],n,e.dtype,r),o=Ky(e,0);return t.forEach((e,t)=>{a.setItem(e,o[t])}),a}function WX(e,t,n){let r=0,i=t.map(e=>(r+=e,r));if(r!==e.shape[0])throw Error(`Expected sum of lengths to be equal to
          tensor.shape[0], but sum of lengths is
        ${r}, and tensor's shape is: ${e.shape}`);let a=LX(e.shape.slice(1),n),o=r===0?0:e.size/r,s=vo(()=>{let n=[];e=W(e,[1,r,o]);for(let r=0;r<t.length;++r){let s=[0,r===0?0:i[r-1],0],c=[1,t[r],o];n[r]=W(Vl(e,s,c),a)}return e.dispose(),n}),c=new GX([],n,e.dtype,t.length);for(let e=0;e<s.length;e++)c.setItem(e,s[e]);return c}var GX,KX=o((()=>{J(),RX(),GX=class e{get id(){return this.idTensor.id}constructor(e,t,n,r=-1){this.tensors=e,this.elementShape=t,this.elementDtype=n,e?.forEach(e=>{if(n!==e.dtype)throw Error(`Invalid data types; op elements ${n}, but list elements ${e.dtype}`);PX(t,e.shape,`TensorList shape mismatch: `),bo(e)}),this.idTensor=Pf(0),this.maxNumElements=r,bo(this.idTensor)}copy(){return new e([...this.tensors],this.elementShape,this.elementDtype)}clearAndClose(e){this.tensors.forEach(t=>{(e==null||!e.has(t.id))&&t.dispose()}),this.tensors.length=0,this.idTensor.dispose()}size(){return this.tensors.length}stack(e,t,n=-1){if(t!==this.elementDtype)throw Error(`Invalid data types; op elements ${t}, but list elements ${this.elementDtype}`);if(n!==-1&&this.tensors.length!==n)throw Error(`Operation expected a list with ${n} elements but got a list with ${this.tensors.length} elements.`);PX(e,this.elementShape,`TensorList shape mismatch: `);let r=IX(this.elementShape,this.tensors,e);return vo(()=>ny(this.tensors.map(e=>W(e,r)),0))}popBack(e,t){if(t!==this.elementDtype)throw Error(`Invalid data types; op elements ${t}, but list elements ${this.elementDtype}`);if(this.size()===0)throw Error(`Trying to pop from an empty list.`);let n=IX(this.elementShape,this.tensors,e),r=this.tensors.pop();return r.kept=!1,PX(r.shape,e,`TensorList shape mismatch: `),W(r,n)}pushBack(e){if(e.dtype!==this.elementDtype)throw Error(`Invalid data types; op elements ${e.dtype}, but list elements ${this.elementDtype}`);if(PX(e.shape,this.elementShape,`TensorList shape mismatch: `),this.maxNumElements===this.size())throw Error(`Trying to push element into a full list.`);bo(e),this.tensors.push(e)}resize(t){if(t<0)throw Error(`TensorListResize expects size to be non-negative. Got: ${t}`);if(this.maxNumElements!==-1&&t>this.maxNumElements)throw Error(`TensorListResize input size ${t} is greater maxNumElement ${this.maxNumElements}.`);let n=new e([],this.elementShape,this.elementDtype,this.maxNumElements);n.tensors.length=t;for(let e=0;e<Math.min(this.tensors.length,t);++e)n.tensors[e]=this.tensors[e];return n}getItem(e,t,n){if(n!==this.elementDtype)throw Error(`Invalid data types; op elements ${n}, but list elements ${this.elementDtype}`);if(e<0||e>this.tensors.length)throw Error(`Trying to access element ${e} in a list with ${this.tensors.length} elements.`);if(this.tensors[e]==null)throw Error(`element at index ${e} is null.`);PX(this.tensors[e].shape,t,`TensorList shape mismatch: `);let r=IX(this.elementShape,this.tensors,t);return W(this.tensors[e],r)}setItem(e,t){if(t.dtype!==this.elementDtype)throw Error(`Invalid data types; op elements ${t.dtype}, but list elements ${this.elementDtype}`);if(e<0||this.maxNumElements!==-1&&e>=this.maxNumElements)throw Error(`Trying to set element ${e} in a list with max ${this.maxNumElements} elements.`);PX(this.elementShape,t.shape,`TensorList shape mismatch: `),bo(t),this.tensors[e]!=null&&(this.tensors[e].kept=!1),this.tensors[e]=t}gather(e,t,n){if(t!==this.elementDtype)throw Error(`Invalid data types; op elements ${t}, but list elements ${this.elementDtype}`);PX(this.elementShape,n,`TensorList shape mismatch: `),e=e.slice(0,this.size());let r=IX(this.elementShape,this.tensors,n);return e.length===0?no([],[0].concat(r)):vo(()=>ny(e.map(e=>W(this.tensors[e],r)),0))}concat(e,t){if(e&&e!==this.elementDtype)throw Error(`TensorList dtype is ${this.elementDtype} but concat requested dtype ${e}`);PX(this.elementShape,t,`TensorList shape mismatch: `);let n=IX(this.elementShape,this.tensors,t);return this.size()===0?no([],[0].concat(n)):vo(()=>Ml(this.tensors.map(e=>W(e,n)),0))}}})),qX,JX=o((()=>{J(),BX(),KX(),aY(),qX=async(e,t,n)=>{switch(e.op){case`If`:case`StatelessIf`:{let r=$(`thenBranch`,e,t,n),i=$(`elseBranch`,e,t,n),a=$(`cond`,e,t,n),o=$(`args`,e,t,n);return(await a.data())[0]?n.functionMap[r].executeFunctionAsync(o,n.tensorArrayMap,n.tensorListMap):n.functionMap[i].executeFunctionAsync(o,n.tensorArrayMap,n.tensorListMap)}case`While`:case`StatelessWhile`:{let r=$(`body`,e,t,n),i=$(`cond`,e,t,n),a=$(`args`,e,t,n),o=await n.functionMap[i].executeFunctionAsync(a,n.tensorArrayMap,n.tensorListMap),s=a.map(e=>e.id),c=await o[0].data();o.forEach(e=>{!e.kept&&s.indexOf(e.id)===-1&&e.dispose()});let l=a;for(;c[0];){let e=l;l=await n.functionMap[r].executeFunctionAsync(l,n.tensorArrayMap,n.tensorListMap);let t=l.map(e=>e.id);e.forEach(e=>{!e.kept&&s.indexOf(e.id)===-1&&t.indexOf(e.id)===-1&&e.dispose()});let a=await n.functionMap[i].executeFunctionAsync(l,n.tensorArrayMap,n.tensorListMap);c=await a[0].data(),a.forEach(e=>{!e.kept&&s.indexOf(e.id)===-1&&t.indexOf(e.id)===-1&&e.dispose()})}return l}case`LoopCond`:return[iY($(`pred`,e,t,n))];case`Switch`:{let r=$(`pred`,e,t,n),i=$(`data`,e,t,n);return i.kept||(i=iY(i)),(await r.data())[0]?[void 0,i]:[i,void 0]}case`Merge`:{let r=e.inputNames.find(e=>QJ(e,t,n)!==void 0);return r?[iY(QJ(r,t,n))]:void 0}case`Enter`:{let r=$(`frameName`,e,t,n),i=$(`tensor`,e,t,n);return n.enterFrame(r),[iY(i)]}case`Exit`:{let r=$(`tensor`,e,t,n);return n.exitFrame(),[iY(r)]}case`NextIteration`:{let r=$(`tensor`,e,t,n);return n.nextIteration(),[iY(r)]}case`TensorArrayV3`:{let r=$(`size`,e,t,n),i=$(`dtype`,e,t,n),a=$(`elementShape`,e,t,n),o=$(`dynamicSize`,e,t,n),s=$(`clearAfterRead`,e,t,n),c=$(`identicalElementShapes`,e,t,n),l=new zX($(`name`,e,t,n),i,r,a,c,o,s);return n.addTensorArray(l),[l.idTensor,Pf(1)]}case`TensorArrayWriteV3`:{let r=$(`tensorArrayId`,e,t,n),i=$(`index`,e,t,n),a=$(`tensor`,e,t,n),o=n.getTensorArray(r.id);return o.write(i,a),[o.idTensor]}case`TensorArrayReadV3`:{let r=$(`tensorArrayId`,e,t,n),i=$(`index`,e,t,n);return[n.getTensorArray(r.id).read(i)]}case`TensorArrayGatherV3`:{let r=$(`tensorArrayId`,e,t,n),i=$(`indices`,e,t,n),a=$(`dtype`,e,t,n);return[n.getTensorArray(r.id).gather(i,a)]}case`TensorArrayScatterV3`:{let r=$(`tensorArrayId`,e,t,n),i=$(`indices`,e,t,n),a=$(`tensor`,e,t,n),o=n.getTensorArray(r.id);return o.scatter(i,a),[o.idTensor]}case`TensorArrayConcatV3`:{let r=$(`tensorArrayId`,e,t,n),i=n.getTensorArray(r.id),a=$(`dtype`,e,t,n);return[i.concat(a)]}case`TensorArraySplitV3`:{let r=$(`tensorArrayId`,e,t,n),i=$(`tensor`,e,t,n),a=$(`lengths`,e,t,n),o=n.getTensorArray(r.id);return o.split(a,i),[o.idTensor]}case`TensorArraySizeV3`:{let r=$(`tensorArrayId`,e,t,n);return[Pf(n.getTensorArray(r.id).size(),`int32`)]}case`TensorArrayCloseV3`:{let r=$(`tensorArrayId`,e,t,n),i=n.getTensorArray(r.id);return i.clearAndClose(),[i.idTensor]}case`TensorListSetItem`:{let r=$(`tensorListId`,e,t,n),i=$(`index`,e,t,n),a=$(`tensor`,e,t,n),o=n.getTensorList(r.id);return o.setItem(i,a),[o.idTensor]}case`TensorListGetItem`:{let r=$(`tensorListId`,e,t,n),i=$(`index`,e,t,n),a=$(`elementShape`,e,t,n),o=$(`elementDType`,e,t,n);return[n.getTensorList(r.id).getItem(i,a,o)]}case`TensorListScatterV2`:case`TensorListScatter`:{let r=$(`indices`,e,t,n),i=UX($(`tensor`,e,t,n),r,$(`elementShape`,e,t,n),$(`numElements`,e,t,n));return n.addTensorList(i),[i.idTensor]}case`TensorListReserve`:case`EmptyTensorList`:{let r=$(`elementShape`,e,t,n),i=$(`elementDType`,e,t,n),a;a=e.op===`TensorListReserve`?`numElements`:`maxNumElements`;let o=$(a,e,t,n),s=HX(r,i,o,e.op===`TensorListReserve`?-1:o);return n.addTensorList(s),[s.idTensor]}case`TensorListGather`:{let r=$(`tensorListId`,e,t,n),i=$(`indices`,e,t,n),a=$(`elementShape`,e,t,n),o=$(`elementDType`,e,t,n);return[n.getTensorList(r.id).gather(i,o,a)]}case`TensorListStack`:{let r=$(`tensorListId`,e,t,n),i=$(`elementShape`,e,t,n),a=$(`elementDType`,e,t,n),o=$(`numElements`,e,t,n);return[n.getTensorList(r.id).stack(i,a,o)]}case`TensorListFromTensor`:{let r=VX($(`tensor`,e,t,n),$(`elementShape`,e,t,n),$(`elementDType`,e,t,n));return n.addTensorList(r),[r.idTensor]}case`TensorListConcat`:case`TensorListConcatV2`:{let r=$(`tensorListId`,e,t,n),i=n.getTensorList(r.id),a=$(`dtype`,e,t,n),o=$(`elementShape`,e,t,n);return[i.concat(a,o)]}case`TensorListPushBack`:{let r=$(`tensorListId`,e,t,n),i=$(`tensor`,e,t,n),a=n.getTensorList(r.id);return a.pushBack(i),[a.idTensor]}case`TensorListPopBack`:{let r=$(`tensorListId`,e,t,n),i=$(`elementShape`,e,t,n),a=$(`elementDType`,e,t,n);return[n.getTensorList(r.id).popBack(i,a)]}case`TensorListSplit`:{let r=$(`tensor`,e,t,n),i=$(`elementShape`,e,t,n),a=WX(r,$(`lengths`,e,t,n),i);return n.addTensorList(a),[a.idTensor]}case`TensorListLength`:{let r=$(`tensorListId`,e,t,n);return[Pf(n.getTensorList(r.id).size(),`int32`)]}case`TensorListResize`:{let r=$(`tensorListId`,e,t,n),i=$(`size`,e,t,n),a=n.getTensorList(r.id).resize(i);return n.addTensorList(a),[a.idTensor]}default:throw TypeError(`Node type ${e.op} is not implemented`)}}}));function YX(e,t,n){let[r,i]=$(`fusedOps`,e,t,n),a=r===`biasadd`,o=!a,s=i===`prelu`,c=r===`fusedbatchnorm`,l=$(`numArgs`,e,t,n);if(a){if(s&&l!==2)throw Error(`FusedConv2d and DepthwiseConv2d with BiasAdd and Prelu must have two extra arguments: bias and alpha.`);if(!s&&a&&l!==1)throw Error(`FusedConv2d and DepthwiseConv2d with BiasAdd must have one extra argument: bias.`)}if(c)throw Error(`FusedConv2d and DepthwiseConv2d with FusedBatchNorm is not supported`);let u=$(`strides`,e,t,n),d=rY(e,t,n),f=$(`dataFormat`,e,t,n).toUpperCase(),p=$(`dilations`,e,t,n),[m,h]=$(`args`,e,t,n);o&&(h=m,m=void 0);let g=$(`leakyreluAlpha`,e,t,n);return{stride:u,pad:d,dataFormat:f,dilations:p,biasArg:m,preluArg:h,activationFunc:i,leakyreluAlpha:g}}var XX,ZX=o((()=>{kX(),aY(),XX=(e,t,n,r=OX)=>{switch(e.op){case`Conv1D`:{let i=$(`stride`,e,t,n),a=$(`pad`,e,t,n),o=$(`dataFormat`,e,t,n).toUpperCase(),s=$(`dilation`,e,t,n);return[r.conv1d($(`x`,e,t,n),$(`filter`,e,t,n),i,a,o,s)]}case`Conv2D`:{let i=$(`strides`,e,t,n),a=rY(e,t,n),o=$(`dataFormat`,e,t,n).toUpperCase(),s=$(`dilations`,e,t,n);return[r.conv2d($(`x`,e,t,n),$(`filter`,e,t,n),[i[1],i[2]],a,o,[s[1],s[2]])]}case`_FusedConv2D`:{let{stride:i,pad:a,dataFormat:o,dilations:s,biasArg:c,preluArg:l,activationFunc:u,leakyreluAlpha:d}=YX(e,t,n);return[r.fused.conv2d({x:$(`x`,e,t,n),filter:$(`filter`,e,t,n),strides:[i[1],i[2]],pad:a,dataFormat:o,dilations:[s[1],s[2]],bias:c,activation:u,preluActivationWeights:l,leakyreluAlpha:d})]}case`FusedDepthwiseConv2dNative`:{let{stride:i,pad:a,dataFormat:o,dilations:s,biasArg:c,preluArg:l,activationFunc:u,leakyreluAlpha:d}=YX(e,t,n);return[r.fused.depthwiseConv2d({x:$(`x`,e,t,n),filter:$(`filter`,e,t,n),strides:[i[1],i[2]],pad:a,dataFormat:o,dilations:[s[1],s[2]],bias:c,activation:u,preluActivationWeights:l,leakyreluAlpha:d})]}case`Conv2DBackpropInput`:case`Conv2dTranspose`:{let i=$(`outputShape`,e,t,n),a=$(`strides`,e,t,n),o=rY(e,t,n);return[r.conv2dTranspose($(`x`,e,t,n),$(`filter`,e,t,n),i,[a[1],a[2]],o)]}case`DepthwiseConv2dNative`:case`DepthwiseConv2d`:{let i=$(`strides`,e,t,n),a=rY(e,t,n),o=$(`dilations`,e,t,n),s=$(`dataFormat`,e,t,n).toUpperCase();return[r.depthwiseConv2d($(`input`,e,t,n),$(`filter`,e,t,n),[i[1],i[2]],a,s,[o[1],o[2]])]}case`Conv3D`:{let i=$(`strides`,e,t,n),a=$(`pad`,e,t,n),o=$(`dataFormat`,e,t,n).toUpperCase(),s=$(`dilations`,e,t,n);return[r.conv3d($(`x`,e,t,n),$(`filter`,e,t,n),[i[1],i[2],i[3]],a,o,[s[1],s[2],s[3]])]}case`AvgPool`:{let i=$(`strides`,e,t,n),a=$(`pad`,e,t,n),o=$(`kernelSize`,e,t,n);return[r.avgPool($(`x`,e,t,n),[o[1],o[2]],[i[1],i[2]],a)]}case`MaxPool`:{let i=$(`strides`,e,t,n),a=$(`pad`,e,t,n),o=$(`kernelSize`,e,t,n);return[r.maxPool($(`x`,e,t,n),[o[1],o[2]],[i[1],i[2]],a)]}case`MaxPoolWithArgmax`:{let i=$(`strides`,e,t,n),a=$(`pad`,e,t,n),o=$(`kernelSize`,e,t,n),s=$(`includeBatchInIndex`,e,t,n),{result:c,indexes:l}=r.maxPoolWithArgmax($(`x`,e,t,n),[o[1],o[2]],[i[1],i[2]],a,s);return[c,l]}case`AvgPool3D`:{let i=$(`strides`,e,t,n),a=$(`pad`,e,t,n),o=$(`kernelSize`,e,t,n);return[r.avgPool3d($(`x`,e,t,n),[o[1],o[2],o[3]],[i[1],i[2],i[3]],a)]}case`MaxPool3D`:{let i=$(`strides`,e,t,n),a=$(`pad`,e,t,n),o=$(`kernelSize`,e,t,n);return[r.maxPool3d($(`x`,e,t,n),[o[1],o[2],o[3]],[i[1],i[2],i[3]],a)]}case`Dilation2D`:{let i=$(`strides`,e,t,n),a=$(`pad`,e,t,n),o=$(`dilations`,e,t,n),s=i[1],c=i[2],l=o[1],u=o[2];return[r.dilation2d($(`x`,e,t,n),$(`filter`,e,t,n),[s,c],a,[l,u],`NHWC`)]}default:throw TypeError(`Node type ${e.op} is not implemented`)}}})),QX,$X=o((()=>{kX(),aY(),QX=(e,t,n,r=OX)=>{switch(e.op){case`Fill`:{let i=$(`shape`,e,t,n),a=$(`dtype`,e,t,n),o=$(`value`,e,t,n);return[r.fill(i,o,a)]}case`LinSpace`:{let i=$(`start`,e,t,n),a=$(`stop`,e,t,n),o=$(`num`,e,t,n);return[r.linspace(i,a,o)]}case`Multinomial`:{let i=$(`logits`,e,t,n),a=$(`numSamples`,e,t,n),o=$(`seed`,e,t,n);return[r.multinomial(i,a,o)]}case`OneHot`:{let i=$(`indices`,e,t,n),a=$(`depth`,e,t,n),o=$(`onValue`,e,t,n),s=$(`offValue`,e,t,n),c=$(`dtype`,e,t,n);return[r.oneHot(i,a,o,s,c)]}case`Ones`:return[r.ones($(`shape`,e,t,n),$(`dtype`,e,t,n))];case`OnesLike`:return[r.onesLike($(`x`,e,t,n))];case`RandomStandardNormal`:return[r.randomStandardNormal($(`shape`,e,t,n),$(`dtype`,e,t,n),$(`seed`,e,t,n))];case`RandomUniform`:return[r.randomUniform($(`shape`,e,t,n),$(`minval`,e,t,n),$(`maxval`,e,t,n),$(`dtype`,e,t,n))];case`RandomUniformInt`:return[r.randomUniformInt($(`shape`,e,t,n),$(`minval`,e,t,n),$(`maxval`,e,t,n),$(`seed`,e,t,n))];case`Range`:{let i=$(`start`,e,t,n),a=$(`stop`,e,t,n),o=$(`step`,e,t,n);return[r.range(i,a,o,$(`dtype`,e,t,n))]}case`TruncatedNormal`:{let i=$(`shape`,e,t,n),a=$(`mean`,e,t,n),o=$(`stdDev`,e,t,n),s=$(`seed`,e,t,n);return[r.truncatedNormal(i,a,o,$(`dtype`,e,t,n),s)]}case`Zeros`:return[r.zeros($(`shape`,e,t,n),$(`dtype`,e,t,n))];case`ZerosLike`:return[r.zerosLike($(`x`,e,t,n))];default:throw TypeError(`Node type ${e.op} is not implemented`)}}}));function eZ(e,t,n){return{boxes:$(`boxes`,e,t,n),scores:$(`scores`,e,t,n),maxOutputSize:$(`maxOutputSize`,e,t,n),iouThreshold:$(`iouThreshold`,e,t,n),scoreThreshold:$(`scoreThreshold`,e,t,n),softNmsSigma:$(`softNmsSigma`,e,t,n)}}var tZ,nZ=o((()=>{kX(),aY(),tZ=async(e,t,n,r,i=OX)=>{switch(e.op){case`NonMaxSuppressionV5`:{let{boxes:r,scores:a,maxOutputSize:o,iouThreshold:s,scoreThreshold:c,softNmsSigma:l}=eZ(e,t,n),u=await i.image.nonMaxSuppressionWithScoreAsync(r,a,o,s,c,l);return[u.selectedIndices,u.selectedScores]}case`NonMaxSuppressionV4`:{let{boxes:r,scores:a,maxOutputSize:o,iouThreshold:s,scoreThreshold:c}=eZ(e,t,n),l=$(`padToMaxOutputSize`,e,t,n),u=await i.image.nonMaxSuppressionPaddedAsync(r,a,o,s,c,l);return[u.selectedIndices,u.validOutputs]}case`NonMaxSuppressionV3`:case`NonMaxSuppressionV2`:{let{boxes:r,scores:a,maxOutputSize:o,iouThreshold:s,scoreThreshold:c}=eZ(e,t,n);return[await i.image.nonMaxSuppressionAsync(r,a,o,s,c)]}case`Where`:{let r=i.cast($(`condition`,e,t,n),`bool`),a=[await i.whereAsync(r)];return r.dispose(),a}case`ListDiff`:return i.setdiff1dAsync($(`x`,e,t,n),$(`y`,e,t,n));default:throw TypeError(`Node type ${e.op} is not implemented`)}}})),rZ,iZ=o((()=>{kX(),aY(),rZ=(e,t,n,r=OX)=>{switch(e.op){case`LowerBound`:{let i=$(`sortedSequence`,e,t,n),a=$(`values`,e,t,n);return[r.lowerBound(i,a)]}case`TopKV2`:{let i=$(`x`,e,t,n),a=$(`k`,e,t,n),o=$(`sorted`,e,t,n),s=r.topk(i,a,o);return[s.values,s.indices]}case`UpperBound`:{let i=$(`sortedSequence`,e,t,n),a=$(`values`,e,t,n);return[r.upperBound(i,a)]}case`Unique`:{let i=$(`x`,e,t,n),a=r.unique(i);return[a.values,a.indices]}case`UniqueV2`:{let i=$(`x`,e,t,n),a=$(`axis`,e,t,n),o=r.unique(i,a);return[o.values,o.indices]}default:throw TypeError(`Node type ${e.op} is not implemented`)}}})),aZ,oZ=o((()=>{kX(),aY(),aZ=(e,t,n,r=OX)=>{switch(e.op){case`Const`:return t[e.name];case`PlaceholderWithDefault`:let i=$(`default`,e,t,n);return[QJ(e.name,t,n)||i];case`Placeholder`:return[QJ(e.name,t,n)];case`Identity`:case`StopGradient`:case`FakeQuantWithMinMaxVars`:return[iY($(`x`,e,t,n))];case`IdentityN`:return $(`x`,e,t,n).map(e=>iY(e));case`Snapshot`:return[iY($(`x`,e,t,n))];case`Shape`:return[r.tensor1d($(`x`,e,t,n).shape,`int32`)];case`ShapeN`:return $(`x`,e,t,n).map(e=>r.tensor1d(e.shape));case`Size`:return[r.scalar($(`x`,e,t,n).size,`int32`)];case`Rank`:return[r.scalar($(`x`,e,t,n).rank,`int32`)];case`NoOp`:return[r.scalar(1)];case`Print`:let a=$(`x`,e,t,n),o=$(`data`,e,t,n),s=$(`message`,e,t,n),c=$(`summarize`,e,t,n);console.warn(`The graph has a tf.print() operation,usually used for debugging, which slows down performance.`),console.log(s);for(let e=0;e<o.length;e++)console.log(Array.prototype.slice.call(o[e].dataSync()).slice(0,c));return[a];default:throw TypeError(`Node type ${e.op} is not implemented`)}}})),sZ,cZ=o((()=>{J(),kX(),sZ=class{get id(){return this.handle.id}constructor(e,t){this.keyDType=e,this.valueDType=t,this.handle=Pf(0),this.tensorMap=new Map,bo(this.handle)}clearAndClose(){this.tensorMap.forEach(e=>e.dispose()),this.tensorMap.clear(),this.handle.dispose()}size(){return this.tensorMap.size}tensorSize(){return Pf(this.size(),`int32`)}async import(e,t){this.checkKeyAndValueTensor(e,t);let n=await e.data();return this.tensorMap.forEach(e=>e.dispose()),this.tensorMap.clear(),vo(()=>{let e=Ky(t),r=n.length,i=e.length;E(r===i,()=>`The number of elements doesn't match, keys has ${r} elements, the values has ${i} elements.`);for(let t=0;t<r;t++){let r=n[t],i=e[t];bo(i),this.tensorMap.set(r,i)}return this.handle})}async find(e,t){this.checkKeyAndValueTensor(e,t);let n=await e.data();return vo(()=>{let e=[];for(let r=0;r<n.length;r++){let i=n[r],a=this.findWithDefault(i,t);e.push(a)}return ny(e)})}findWithDefault(e,t){return this.tensorMap.get(e)??t}checkKeyAndValueTensor(e,t){if(e.dtype!==this.keyDType)throw Error(`Expect key dtype ${this.keyDType}, but got ${e.dtype}`);if(t.dtype!==this.valueDType)throw Error(`Expect value dtype ${this.valueDType}, but got ${t.dtype}`)}}})),lZ,uZ=o((()=>{cZ(),aY(),lZ=async(e,t,n,r)=>{switch(e.op){case`HashTable`:case`HashTableV2`:{let i=r.getHashTableHandleByName(e.name);if(i!=null)return[i];{let i=new sZ($(`keyDType`,e,t,n),$(`valueDType`,e,t,n));return r.addHashTable(e.name,i),[i.handle]}}case`InitializeTable`:case`InitializeTableV2`:case`LookupTableImport`:case`LookupTableImportV2`:{let i=$(`tableHandle`,e,t,n,r),a=$(`keys`,e,t,n),o=$(`values`,e,t,n);return[await r.getHashTableById(i.id).import(a,o)]}case`LookupTableFind`:case`LookupTableFindV2`:{let i=$(`tableHandle`,e,t,n,r),a=$(`keys`,e,t,n),o=$(`defaultValue`,e,t,n);return[await r.getHashTableById(i.id).find(a,o)]}case`LookupTableSize`:case`LookupTableSizeV2`:{let i=$(`tableHandle`,e,t,n,r);return[r.getHashTableById(i.id).tensorSize()]}default:throw TypeError(`Node type ${e.op} is not implemented`)}}})),dZ,fZ=o((()=>{kX(),aY(),dZ=(e,t,n,r=OX)=>{switch(e.op){case`ResizeBilinear`:{let i=$(`images`,e,t,n),a=$(`size`,e,t,n),o=$(`alignCorners`,e,t,n),s=$(`halfPixelCenters`,e,t,n);return[r.image.resizeBilinear(i,[a[0],a[1]],o,s)]}case`ResizeNearestNeighbor`:{let i=$(`images`,e,t,n),a=$(`size`,e,t,n),o=$(`alignCorners`,e,t,n),s=$(`halfPixelCenters`,e,t,n);return[r.image.resizeNearestNeighbor(i,[a[0],a[1]],o,s)]}case`CropAndResize`:{let i=$(`image`,e,t,n),a=$(`boxes`,e,t,n),o=$(`boxInd`,e,t,n),s=$(`cropSize`,e,t,n),c=$(`method`,e,t,n),l=$(`extrapolationValue`,e,t,n);return[r.image.cropAndResize(i,a,o,s,c,l)]}case`ImageProjectiveTransformV3`:{let i=$(`images`,e,t,n),a=$(`transforms`,e,t,n),o=$(`outputShape`,e,t,n),s=$(`fillValue`,e,t,n),c=$(`interpolation`,e,t,n),l=$(`fillMode`,e,t,n);return[r.image.transform(i,a,c.toLowerCase(),l.toLowerCase(),s,o)]}default:throw TypeError(`Node type ${e.op} is not implemented`)}}})),pZ,mZ=o((()=>{kX(),aY(),pZ=(e,t,n,r=OX)=>{switch(e.op){case`Equal`:return[r.equal($(`a`,e,t,n),$(`b`,e,t,n))];case`NotEqual`:return[r.notEqual($(`a`,e,t,n),$(`b`,e,t,n))];case`Greater`:return[r.greater($(`a`,e,t,n),$(`b`,e,t,n))];case`GreaterEqual`:return[r.greaterEqual($(`a`,e,t,n),$(`b`,e,t,n))];case`Less`:return[r.less($(`a`,e,t,n),$(`b`,e,t,n))];case`LessEqual`:return[r.lessEqual($(`a`,e,t,n),$(`b`,e,t,n))];case`LogicalAnd`:return[r.logicalAnd($(`a`,e,t,n),$(`b`,e,t,n))];case`LogicalNot`:return[r.logicalNot($(`a`,e,t,n))];case`LogicalOr`:return[r.logicalOr($(`a`,e,t,n),$(`b`,e,t,n))];case`Select`:case`SelectV2`:return[r.where($(`condition`,e,t,n),$(`a`,e,t,n),$(`b`,e,t,n))];case`BitwiseAnd`:return[r.bitwiseAnd($(`a`,e,t,n),$(`b`,e,t,n))];default:throw TypeError(`Node type ${e.op} is not implemented`)}}})),hZ,gZ=o((()=>{kX(),aY(),hZ=(e,t,n,r=OX)=>{switch(e.op){case`BatchMatMul`:case`BatchMatMulV2`:case`MatMul`:return[r.matMul($(`a`,e,t,n),$(`b`,e,t,n),$(`transposeA`,e,t,n),$(`transposeB`,e,t,n))];case`Einsum`:return[r.einsum($(`equation`,e,t,n),...$(`tensors`,e,t,n))];case`Transpose`:return[r.transpose($(`x`,e,t,n),$(`perm`,e,t,n))];case`_FusedMatMul`:let[i,a]=$(`fusedOps`,e,t,n),o=i===`biasadd`,s=a===`prelu`,c=$(`numArgs`,e,t,n),l=$(`leakyreluAlpha`,e,t,n);if(o){if(s&&c!==2)throw Error(`Fused MatMul with BiasAdd and Prelu must have two extra arguments: bias and alpha.`);if(!s&&c!==1)throw Error(`Fused MatMul with BiasAdd must have one extra argument: bias.`)}let[u,d]=$(`args`,e,t,n);return[r.fused.matMul({a:$(`a`,e,t,n),b:$(`b`,e,t,n),transposeA:$(`transposeA`,e,t,n),transposeB:$(`transposeB`,e,t,n),bias:u,activation:a,preluActivationWeights:d,leakyreluAlpha:l})];case`MatrixBandPart`:return[r.linalg.bandPart($(`a`,e,t,n),$(`numLower`,e,t,n),$(`numUpper`,e,t,n))];default:throw TypeError(`Node type ${e.op} is not implemented`)}}})),_Z,vZ=o((()=>{kX(),aY(),_Z=(e,t,n,r=OX)=>{switch(e.op){case`EuclideanNorm`:return[r.euclideanNorm($(`x`,e,t,n),$(`axis`,e,t,n),$(`keepDims`,e,t,n))];case`FusedBatchNorm`:case`FusedBatchNormV2`:return[r.batchNorm($(`x`,e,t,n),$(`mean`,e,t,n),$(`variance`,e,t,n),$(`offset`,e,t,n),$(`scale`,e,t,n),$(`epsilon`,e,t,n))];case`FusedBatchNormV3`:return[r.batchNorm($(`x`,e,t,n),$(`mean`,e,t,n),$(`variance`,e,t,n),$(`offset`,e,t,n),$(`scale`,e,t,n),$(`epsilon`,e,t,n))];case`LRN`:return[r.localResponseNormalization($(`x`,e,t,n),$(`radius`,e,t,n),$(`bias`,e,t,n),$(`alpha`,e,t,n),$(`beta`,e,t,n))];case`Softmax`:return[r.softmax($(`x`,e,t,n))];case`LogSoftmax`:return[r.logSoftmax($(`x`,e,t,n))];default:throw TypeError(`Node type ${e.op} is not implemented`)}}})),yZ,bZ=o((()=>{kX(),aY(),yZ=(e,t,n,r=OX)=>{switch(e.op){case`RaggedGather`:{let{outputNestedSplits:i,outputDenseValues:a}=r.raggedGather($(`paramsNestedSplits`,e,t,n),$(`paramsDenseValues`,e,t,n),$(`indices`,e,t,n),$(`outputRaggedRank`,e,t,n));return i.concat(a)}case`RaggedRange`:{let{rtNestedSplits:i,rtDenseValues:a}=r.raggedRange($(`starts`,e,t,n),$(`limits`,e,t,n),$(`splits`,e,t,n));return[i,a]}case`RaggedTensorToTensor`:return[r.raggedTensorToTensor($(`shape`,e,t,n),$(`values`,e,t,n),$(`defaultValue`,e,t,n),$(`rowPartitionTensors`,e,t,n),$(`rowPartitionTypes`,e,t,n))];default:throw TypeError(`Node type ${e.op} is not implemented`)}}})),xZ,SZ=o((()=>{kX(),aY(),xZ=(e,t,n,r=OX)=>{switch(e.op){case`Max`:{let i=$(`axis`,e,t,n),a=$(`keepDims`,e,t,n);return[r.max($(`x`,e,t,n),i,a)]}case`Mean`:{let i=$(`axis`,e,t,n),a=$(`keepDims`,e,t,n);return[r.mean($(`x`,e,t,n),i,a)]}case`Min`:{let i=$(`axis`,e,t,n),a=$(`keepDims`,e,t,n);return[r.min($(`x`,e,t,n),i,a)]}case`Sum`:{let i=$(`axis`,e,t,n),a=$(`keepDims`,e,t,n);return[r.sum($(`x`,e,t,n),i,a)]}case`All`:{let i=$(`axis`,e,t,n),a=$(`keepDims`,e,t,n);return[r.all($(`x`,e,t,n),i,a)]}case`Any`:{let i=$(`axis`,e,t,n),a=$(`keepDims`,e,t,n);return[r.any($(`x`,e,t,n),i,a)]}case`ArgMax`:{let i=$(`axis`,e,t,n);return[r.argMax($(`x`,e,t,n),i)]}case`ArgMin`:{let i=$(`axis`,e,t,n);return[r.argMin($(`x`,e,t,n),i)]}case`Prod`:{let i=$(`axis`,e,t,n),a=$(`keepDims`,e,t,n);return[r.prod($(`x`,e,t,n),i,a)]}case`Cumprod`:{let i=$(`axis`,e,t,n),a=$(`exclusive`,e,t,n),o=$(`reverse`,e,t,n);return[r.cumprod($(`x`,e,t,n),i,a,o)]}case`Cumsum`:{let i=$(`axis`,e,t,n),a=$(`exclusive`,e,t,n),o=$(`reverse`,e,t,n);return[r.cumsum($(`x`,e,t,n),i,a,o)]}case`Bincount`:let i=$(`x`,e,t,n),a=$(`weights`,e,t,n),o=$(`size`,e,t,n);return[r.bincount(i,a,o)];case`DenseBincount`:{let i=$(`x`,e,t,n),a=$(`weights`,e,t,n),o=$(`size`,e,t,n),s=$(`binaryOutput`,e,t,n);return[r.denseBincount(i,a,o,s)]}default:throw TypeError(`Node type ${e.op} is not implemented`)}}})),CZ,wZ=o((()=>{J(),kX(),aY(),CZ=(e,t,n,r=OX)=>{switch(e.op){case`ConcatV2`:case`Concat`:{let i=$(`n`,e,t,n),a=$(`axis`,e,t,n),o=$(`tensors`,e,t,n);return o=o.slice(0,i),[r.concat(o,a)]}case`Gather`:{let i=$(`x`,e,t,n),a=$(`indices`,e,t,n);return[r.gather(i,r.cast(a,`int32`),0)]}case`GatherV2`:{let i=$(`axis`,e,t,n),a=$(`batchDims`,e,t,n),o=$(`x`,e,t,n),s=$(`indices`,e,t,n);return[r.gather(o,r.cast(s,`int32`),i,a)]}case`Reverse`:{let i=$(`dims`,e,t,n),a=[];for(let e=0;e<i.length;e++)i[e]&&a.push(e);let o=$(`x`,e,t,n);return[r.reverse(o,a)]}case`ReverseV2`:{let i=$(`axis`,e,t,n),a=$(`x`,e,t,n);return[r.reverse(a,i)]}case`Slice`:{let i=$(`begin`,e,t,n),a=$(`size`,e,t,n);return[r.slice($(`x`,e,t,n),i,a)]}case`StridedSlice`:{let i=$(`begin`,e,t,n),a=$(`end`,e,t,n),o=$(`strides`,e,t,n),s=$(`beginMask`,e,t,n),c=$(`endMask`,e,t,n),l=$(`ellipsisMask`,e,t,n),u=$(`newAxisMask`,e,t,n),d=$(`shrinkAxisMask`,e,t,n),f=$(`x`,e,t,n);return[r.stridedSlice(f,i,a,o,s,c,l,u,d)]}case`Pack`:return vo(()=>{let i=$(`axis`,e,t,n),a=$(`tensors`,e,t,n),o=a[0].shape,s=r.squeeze(a[0]).shape,c=a.map(e=>{let t=k(e.shape,o);if(!t&&!k(r.squeeze(e).shape,s))throw Error(`the input tensors shape does not match`);return t?e:r.reshape(e,o)});return[r.stack(c,i)]});case`Unpack`:{let i=$(`axis`,e,t,n),a=$(`tensor`,e,t,n);return r.unstack(a,i)}case`Tile`:{let i=$(`reps`,e,t,n);return[r.tile($(`x`,e,t,n),i)]}case`Split`:case`SplitV`:{let i=$(`axis`,e,t,n),a=$(`numOrSizeSplits`,e,t,n),o=$(`x`,e,t,n);return r.split(o,a,i)}case`ScatterNd`:{let i=$(`indices`,e,t,n),a=$(`values`,e,t,n),o=$(`shape`,e,t,n);return[r.scatterND(i,a,o)]}case`GatherNd`:{let i=$(`x`,e,t,n),a=$(`indices`,e,t,n);return[r.gatherND(i,a)]}case`SparseToDense`:{let i=$(`sparseIndices`,e,t,n),a=$(`outputShape`,e,t,n),o=$(`sparseValues`,e,t,n),s=$(`defaultValue`,e,t,n);return[r.sparseToDense(i,o,a,o.dtype===s.dtype?s:r.cast(s,o.dtype))]}case`TensorScatterUpdate`:{let i=$(`indices`,e,t,n),a=$(`values`,e,t,n),o=$(`tensor`,e,t,n);return[r.tensorScatterUpdate(o,i,a)]}default:throw TypeError(`Node type ${e.op} is not implemented`)}}})),TZ,EZ=o((()=>{kX(),aY(),TZ=(e,t,n,r=OX)=>{switch(e.op){case`SparseFillEmptyRows`:{let{outputIndices:i,outputValues:a,emptyRowIndicator:o,reverseIndexMap:s}=r.sparse.sparseFillEmptyRows($(`indices`,e,t,n),$(`values`,e,t,n),$(`denseShape`,e,t,n),$(`defaultValue`,e,t,n));return[i,a,o,s]}case`SparseReshape`:{let{outputIndices:i,outputShape:a}=r.sparse.sparseReshape($(`inputIndices`,e,t,n),$(`inputShape`,e,t,n),$(`newShape`,e,t,n));return[i,a]}case`SparseSegmentMean`:return[r.sparse.sparseSegmentMean($(`data`,e,t,n),$(`indices`,e,t,n),$(`segmentIds`,e,t,n))];case`SparseSegmentSum`:return[r.sparse.sparseSegmentSum($(`data`,e,t,n),$(`indices`,e,t,n),$(`segmentIds`,e,t,n))];default:throw TypeError(`Node type ${e.op} is not implemented`)}}})),DZ,OZ=o((()=>{kX(),aY(),DZ=(e,t,n,r=OX)=>{switch(e.op){case`FFT`:return[r.fft($(`x`,e,t,n))];case`IFFT`:return[r.ifft($(`x`,e,t,n))];case`RFFT`:return[r.rfft($(`x`,e,t,n))];case`IRFFT`:return[r.irfft($(`x`,e,t,n))];default:throw TypeError(`Node type ${e.op} is not implemented`)}}})),kZ,AZ=o((()=>{kX(),aY(),kZ=(e,t,n,r=OX)=>{switch(e.op){case`StaticRegexReplace`:return[r.string.staticRegexReplace($(`input`,e,t,n),$(`pattern`,e,t,n),$(`rewrite`,e,t,n),$(`replaceGlobal`,e,t,n))];case`StringNGrams`:{let{nGrams:i,nGramsSplits:a}=r.string.stringNGrams($(`data`,e,t,n),$(`dataSplits`,e,t,n),$(`separator`,e,t,n),$(`nGramWidths`,e,t,n),$(`leftPad`,e,t,n),$(`rightPad`,e,t,n),$(`padWidth`,e,t,n),$(`preserveShortSequences`,e,t,n));return[i,a]}case`StringSplit`:{let{indices:i,values:a,shape:o}=r.string.stringSplit($(`input`,e,t,n),$(`delimiter`,e,t,n),$(`skipEmpty`,e,t,n));return[i,a,o]}case`StringToHashBucketFast`:return[r.string.stringToHashBucketFast($(`input`,e,t,n),$(`numBuckets`,e,t,n))];default:throw TypeError(`Node type ${e.op} is not implemented`)}}})),jZ,MZ=o((()=>{kX(),aY(),jZ=(e,t,n,r=OX)=>{switch(e.op){case`Cast`:return[r.cast($(`x`,e,t,n),$(`dtype`,e,t,n))];case`ExpandDims`:{let i=$(`axis`,e,t,n);return[r.expandDims($(`x`,e,t,n),i)]}case`Squeeze`:{let i=$(`axis`,e,t,n);return[r.squeeze($(`x`,e,t,n),i)]}case`Reshape`:return[r.reshape($(`x`,e,t,n),$(`shape`,e,t,n))];case`EnsureShape`:return[r.ensureShape($(`x`,e,t,n),$(`shape`,e,t,n))];case`MirrorPad`:return[r.mirrorPad($(`x`,e,t,n),$(`padding`,e,t,n),$(`mode`,e,t,n))];case`PadV2`:case`Pad`:return[r.pad($(`x`,e,t,n),$(`padding`,e,t,n),$(`constantValue`,e,t,n))];case`SpaceToBatchND`:{let i=$(`blockShape`,e,t,n),a=$(`paddings`,e,t,n);return[r.spaceToBatchND($(`x`,e,t,n),i,a)]}case`BatchToSpaceND`:{let i=$(`blockShape`,e,t,n),a=$(`crops`,e,t,n);return[r.batchToSpaceND($(`x`,e,t,n),i,a)]}case`DepthToSpace`:{let i=$(`blockSize`,e,t,n),a=$(`dataFormat`,e,t,n).toUpperCase();return[r.depthToSpace($(`x`,e,t,n),i,a)]}case`BroadcastTo`:return[r.broadcastTo($(`x`,e,t,n),$(`shape`,e,t,n))];case`BroadcastArgs`:return[r.broadcastArgs($(`s0`,e,t,n),$(`s1`,e,t,n))];default:throw TypeError(`Node type ${e.op} is not implemented`)}}}));function NZ(e,t,n,r,i=vo){let a=((e,t,n)=>{switch(e.category){case`arithmetic`:return i(()=>AX(e,t,n));case`basic_math`:return i(()=>MX(e,t,n));case`control`:return qX(e,t,n);case`convolution`:return i(()=>XX(e,t,n));case`creation`:return i(()=>QX(e,t,n));case`dynamic`:return tZ(e,t,n);case`evaluation`:return i(()=>rZ(e,t,n));case`image`:return i(()=>dZ(e,t,n));case`graph`:return i(()=>aZ(e,t,n));case`logical`:return i(()=>pZ(e,t,n));case`matrices`:return i(()=>hZ(e,t,n));case`normalization`:return i(()=>_Z(e,t,n));case`ragged`:return i(()=>yZ(e,t,n));case`reduction`:return i(()=>xZ(e,t,n));case`slice_join`:return i(()=>CZ(e,t,n));case`sparse`:return i(()=>TZ(e,t,n));case`spectral`:return i(()=>DZ(e,t,n));case`string`:return i(()=>kZ(e,t,n));case`transformation`:return i(()=>jZ(e,t,n));case`hash_table`:return lZ(e,t,n,r);case`custom`:let a=JJ(e.op);if(a&&a.customExecutor)return a.customExecutor(new EX(e,t,n));throw TypeError(`Custom op ${e.op} is not registered.`);default:throw TypeError(`Unknown op '${e.op}'. File an issue at https://github.com/tensorflow/tfjs/issues so we can add it, or register a custom execution with tf.registerOp()`)}})(e,t,n);return Ne(a)?a.then(e=>[].concat(e)):[].concat(a)}var PZ=o((()=>{J(),DX(),ZJ(),jX(),NX(),JX(),ZX(),$X(),nZ(),iZ(),oZ(),uZ(),fZ(),mZ(),gZ(),vZ(),bZ(),SZ(),wZ(),EZ(),OZ(),AZ(),MZ()})),FZ,IZ=o((()=>{FZ=class{constructor(e={},t={},n={},r={},i){this.weightMap=e,this.tensorArrayMap=t,this.tensorListMap=n,this.functionMap=r,this.parseNodeNameCache=i,this.rootContext={id:0,frameName:``,iterationId:0},this.contexts=[this.rootContext],this.lastId=0,this.generateCurrentContextIds()}newFrame(e,t){return{id:e,frameName:t,iterationId:0}}set currentContext(e){this.contexts!==e&&(this.contexts=e,this.generateCurrentContextIds())}get currentContext(){return this.contexts}get currentContextId(){return this._currentContextIds[0]}get currentContextIds(){return this._currentContextIds}generateCurrentContextIds(){let e=[];for(let t=0;t<this.contexts.length-1;t++){let n=this.contexts.slice(0,this.contexts.length-t);e.push(this.contextIdforContexts(n))}e.push(``),this._currentContextIds=e}contextIdforContexts(e){return e?e.map(e=>e.id===0&&e.iterationId===0?``:`${e.frameName}-${e.iterationId}`).join(`/`):``}enterFrame(e){this.contexts&&(this.lastId++,this.contexts=this.contexts.slice(),this.contexts.push(this.newFrame(this.lastId,e)),this._currentContextIds.unshift(this.contextIdforContexts(this.contexts)))}exitFrame(){if(this.contexts&&this.contexts.length>1)this.contexts=this.contexts.slice(),this.contexts.splice(-1),this.currentContextIds.shift();else throw Error(`Cannot exit frame, the context is empty`)}nextIteration(){if(this.contexts&&this.contexts.length>0){this.contexts=this.contexts.slice(),this.lastId++;let e=Object.assign({},this.contexts[this.contexts.length-1]);e.iterationId+=1,e.id=this.lastId,this.contexts.splice(-1,1,e),this._currentContextIds.splice(0,1,this.contextIdforContexts(this.contexts))}else throw Error(`Cannot increase frame iteration, the context is empty`)}getWeight(e){return this.weightMap[e]}addTensorArray(e){this.tensorArrayMap[e.id]=e}getTensorArray(e){return this.tensorArrayMap[e]}addTensorList(e){this.tensorListMap[e.id]=e}getTensorList(e){return this.tensorListMap[e]}dispose(e){for(let t in this.tensorArrayMap)this.tensorArrayMap[t].clearAndClose(e);for(let t in this.tensorListMap)this.tensorListMap[t].clearAndClose(e)}}}));function LZ(e,t,n,r){let i=new Set,a=[],o=null,s=null,c=new Set,l=new Set(Object.keys(e).map(e=>nY(e)[0]));r||=[];let u=new Set(r.map(e=>nY(e.name)[0])),d=[...t];for(;d.length>0;){let e=d.pop();if((HZ(e)||UZ(e)||WZ(e))&&(o??(o=e,s=o.children.map(e=>e.name).filter(e=>i.has(e)))),i.add(e.name),n[e.name]==null&&!l.has(e.name)&&!u.has(e.name)){if(e.inputs.length===0){a.push(e.name);continue}e.inputs.forEach(e=>{c.has(e.name)||(c.add(e.name),d.push(e))})}}return{inputs:e,outputs:t,usedNodes:i,missingInputs:a,dynamicNode:o,syncInputs:s}}function RZ(e,t){let{usedNodes:n,inputs:r}=t,i=Object.keys(r).map(e=>nY(e)[0]).map(t=>e.nodes[t]),a=e.initNodes||[],o=e=>n.has(typeof e==`string`?e:e.name);function s(e){return[...new Map(e.map(e=>[e.name,e])).values()]}let c=s([...i,...e.weights,...a]).filter(o),l=s([...c,...Object.values(e.nodes)]).filter(o),u=new Map(l.map(e=>[e.name,e])),d={};for(let e of l){d[e.name]=d[e.name]||0;for(let t of e.children)o(t)||(d[t.name]=1/0),d[t.name]=(d[t.name]||0)+1}let f=Object.entries(d).filter(([,e])=>e===0).map(([e])=>e),p=[...f];for(;f.length>0;){let e=f.pop(),t=u.get(e);for(let e of t.children.filter(o))--d[e.name]===0&&(p.push(e.name),f.push(e.name))}let m=zZ(p.map(e=>u.get(e)),c);return BZ(m,c),m}function zZ(e,t){let n=new Map(e.map(e=>[e.name,e])),r=t.map(e=>e.name),i=new Set(r);for(;r.length>0;){let e=r.pop(),t=n.get(e);for(let e of t.children)!n.has(e.name)||i.has(e.name)||(i.add(e.name),r.push(e.name))}return e.filter(e=>i.has(e.name))}function BZ(e,t){let n=new Map(e.map((e,t)=>[e.name,t])),r=new Set(t.map(e=>e.name)),i=e=>r.has(typeof e==`string`?e:e.name),a=new Set(e.map(e=>e.name)),o=e=>a.has(typeof e==`string`?e:e.name);for(let t of e){for(let e of t.children.filter(o)){if(!n.has(e.name))throw new GZ(`Child ${e.name} of node ${t.name} is unreachable.`);if(n.get(t.name)>n.get(e.name))throw new GZ(`Node ${t.name} is scheduled to run after its child ${e.name}.`)}if(!i(t))for(let e of t.inputs){if(!n.has(e.name))throw new GZ(`Input ${e.name} of node ${t.name} is unreachable.`);if(n.get(e.name)>n.get(t.name))throw new GZ(`Node ${t.name} is scheduled to run before its input ${e.name}.`)}}}function VZ(e){let t=new Map(e.map((e,t)=>[e.name,t])),n=2**53-1,r=e.map((e,t)=>HZ(e)?n:t),i=e=>r[t.get(e.name)]??-1,a=e.map((e,t)=>e.children.map(i).reduce((e,t)=>Math.max(e,t),r[t])),o=new Map;for(let t=0;t<e.length;++t){let r=a[t];if(r===n)continue;let i=e[t],s=e[r];o.has(s.name)||o.set(s.name,[]),o.get(s.name).push(i)}return o}function HZ(e){return KZ.has(e.op)}function UZ(e){return qZ.has(e.op)}function WZ(e){return JZ.has(e.op)}var GZ,KZ,qZ,JZ,YZ=o((()=>{aY(),GZ=class extends Error{constructor(e){super(`NodesExecutionOrderError: ${e}`)}},KZ=new Set([`Switch`,`Merge`,`Enter`,`Exit`,`NextIteration`,`StatelessIf`,`StatelessWhile`,`if`,`While`]),qZ=new Set([`NonMaxSuppressionV2`,`NonMaxSuppressionV3`,`NonMaxSuppressionV5`,`Where`]),JZ=new Set([`HashTable`,`HashTableV2`,`LookupTableImport`,`LookupTableImportV2`,`LookupTableFind`,`LookupTableFindV2`,`LookupTableSize`,`LookupTableSizeV2`])})),XZ,ZZ=o((()=>{J(),aY(),PZ(),IZ(),YZ(),XZ=class e{get weightIds(){return this.parent?this.parent.weightIds:this._weightIds}get functionExecutorMap(){return this.parent?this.parent.functionExecutorMap:this._functionExecutorMap}get weightMap(){return this.parent?this.parent.weightMap:this._weightMap}set weightMap(e){let t=Object.keys(e).map(t=>e[t].map(e=>e.id));this._weightIds=[].concat(...t),this._weightMap=e}set resourceManager(e){this._resourceManager=e}get inputs(){return this._inputs.map(e=>({name:e.name,shape:e.attrParams.shape?e.attrParams.shape.value:void 0,dtype:e.attrParams.dtype?e.attrParams.dtype.value:void 0}))}get outputs(){return this._outputs.map(e=>({name:e.name,shape:e.attrParams.shape?e.attrParams.shape.value:void 0,dtype:e.attrParams.dtype?e.attrParams.dtype.value:void 0}))}get inputNodes(){return this._inputs.map(e=>e.signatureKey||e.name)}get outputNodes(){return this._outputs.map(e=>{let t=e.signatureKey||e.name;return e.defaultOutput?`${t}:${e.defaultOutput}`:t})}get functions(){return Object.keys(this._functions).reduce((e,t)=>(e[t]=this._functions[t].signature,e),{})}constructor(t,n){this.graph=t,this.parent=n,this.compiledMap=new Map,this.parseNodeNameCache=new Map,this._weightMap={},this.SEPARATOR=`,`,this._functions={},this._functionExecutorMap={},this.keepIntermediateTensors=!1,this._outputs=t.outputs,this._inputs=t.inputs,this._initNodes=t.initNodes,this._signature=t.signature,this._functions=t.functions,t.functions!=null&&Object.keys(t.functions).forEach(n=>{this._functionExecutorMap[n]=new e(t.functions[n],this)})}getCompilationKey(e,t){let n=e.map(e=>e.name).sort(),r=t.map(e=>e.name).sort();return n.join(this.SEPARATOR)+`--`+r.join(this.SEPARATOR)}compile(e,t){let n=LZ(e,t,this.weightMap,this._initNodes),{missingInputs:r,dynamicNode:i,syncInputs:a}=n;if(i!=null)throw Error(`This execution contains the node '${i.name}', which has the dynamic op '${i.op}'. Please use model.executeAsync() instead. Alternatively, to avoid the dynamic ops, specify the inputs [${a}]`);if(r.length>0){let n=t.map(e=>e.name);throw Error(`Cannot compute the outputs [${n}] from the provided inputs [${Object.keys(e)}]. Missing the following inputs: [${r}]`)}let o=RZ(this.graph,n);return{orderedNodes:o,nodeLiveUntilMap:VZ(o)}}cloneAndKeepTensor(e){if(e==null)return null;let t=e.clone();return bo(t),t}cloneTensorList(e){return e?e.map(e=>this.cloneAndKeepTensor(e)):null}cloneTensorMap(e){return Object.fromEntries(Object.entries(e).map(([e,t])=>[e,this.cloneTensorList(t)]))}execute(e,t){this.disposeIntermediateTensors(),e=this.mapInputs(e);let n=Object.keys(e).sort();this.checkInputs(e),this.checkInputShapeAndType(e),t=this.mapOutputs(t),this.checkOutputs(t);let r=n.map(e=>this.graph.nodes[nY(e)[0]]),i=t.map(e=>nY(e)[0]),a=new Set(i),o=i.map(e=>this.graph.nodes[e]);o.length===0&&(o=this._outputs);let s=this.getCompilationKey(r,o),c=this.compiledMap.get(s);c??(c=this.compile(e,o),this.compiledMap.set(s,c));try{this.keepIntermediateTensors=M().getBool(`KEEP_INTERMEDIATE_TENSORS`)}catch(e){this.keepIntermediateTensors=!1,console.warn(e.message)}let l={},u={};return vo(()=>{let n=new FZ(this.weightMap,l,u,this.functionExecutorMap,this.parseNodeNameCache),r=Object.assign({},this.weightMap);this.keepIntermediateTensors&&(this.clonedTensorsMap=this.cloneTensorMap(this.weightMap)),Object.keys(e).forEach(t=>{let[i,a]=nY(t,n),o=[];o[a]=e[t],r[i]=o,this.keepIntermediateTensors&&(this.clonedTensorsMap[i]=this.cloneTensorList(o))});let i=this.getFrozenTensorIds(r),{orderedNodes:o,nodeLiveUntilMap:s}=c;for(let e of o){if(r[e.name])continue;let t=NZ(e,r,n,this._resourceManager);if(Ne(t))throw Error(`The execution of the op '${e.op}' returned a promise. Please use model.executeAsync() instead.`);r[e.name]=t,this.keepIntermediateTensors&&(this.clonedTensorsMap[e.name]=this.cloneTensorList(t)),this.checkTensorForDisposalWithNodeLiveUntilInfo(e,r,n,i,a,s.get(e.name))}return this.parent??n.dispose(i),t.map(e=>QJ(e,r,n))})}getFrozenTensorIds(e){let t=[].concat.apply([],Object.keys(e).map(t=>e[t]).map(e=>e.map(e=>e.id)));return new Set(t)}checkTensorForDisposal(e,t,n,r,i,a,o){if(!(HZ(t)||a.has(e))){for(let r of n[e])r!=null&&(o[r.id]=(o[r.id]||0)+t.children.length);for(let e of t.inputs){if(HZ(e))continue;let t=$J(e.name,n,r);if(t!=null)for(let e of t){if(!e||e.kept||i.has(e.id))continue;let t=o[e.id];t===1?(e.dispose(),delete o[e.id]):t!=null&&o[e.id]--}}}}checkTensorForDisposalWithNodeLiveUntilInfo(e,t,n,r,i,a){function o(e){return HZ(e)||i.has(e.name)}if(!(HZ(e)||a==null))for(let e of a){if(o(e))continue;let i=$J(e.name,t,n);for(let e of i)!e||e.kept||r.has(e.id)||e.dispose()}}async executeAsync(e,t){return this._executeAsync(e,t)}disposeIntermediateTensors(){this.clonedTensorsMap&&=(Object.values(this.clonedTensorsMap).forEach(e=>{for(let t of e)t&&!t.isDisposed&&t.dispose()}),null)}getIntermediateTensors(){return this.clonedTensorsMap}async _executeAsync(e,t,n=!1,r={},i={}){this.disposeIntermediateTensors(),n||(e=this.mapInputs(e),this.checkInputs(e),this.checkInputShapeAndType(e),t=this.mapOutputs(t),this.checkOutputs(t));try{this.keepIntermediateTensors=M().getBool(`KEEP_INTERMEDIATE_TENSORS`)}catch(e){this.keepIntermediateTensors=!1,console.warn(e.message)}let a=new FZ(this.weightMap,r,i,this.functionExecutorMap,this.parseNodeNameCache);this.keepIntermediateTensors&&(this.clonedTensorsMap=this.cloneTensorMap(this.weightMap));let o=await this.executeWithControlFlow(e,a,t,n),s=t.map(e=>QJ(e,o,a)),c=s.map(e=>e.id),l=Object.keys(e).map(t=>e[t].id),u=new Set([...c,...l,...this.weightIds]);return Object.values(o).forEach(e=>{e.forEach(e=>{e&&!e.isDisposed&&!u.has(e.id)&&e.dispose()})}),this.parent??a.dispose(u),s}async executeFunctionAsync(e,t,n){let r=e.reduce((e,t,n)=>(e[this.inputs[n].name]=t,e),{});return this._executeAsync(r,this.outputNodes,!0,t,n)}async executeWithControlFlow(e,t,n,r){let i=Object.keys(e),a=i.map(e=>this.graph.nodes[nY(e)[0]]),o=n.map(e=>nY(e)[0]),s=new Set(o),c=o.map(e=>this.graph.nodes[e]);c.length===0&&(c=this._outputs);let{usedNodes:l,missingInputs:u,dynamicNode:d,syncInputs:f}=LZ(e,c,this.weightMap,this._initNodes),p=[...a,...this.graph.weights,...this._initNodes||[]].map(e=>({node:e,contexts:t.currentContext})),m=Object.assign({},this.weightMap);Object.keys(e).forEach(t=>{let[n,r]=nY(t),i=[];i[r]=e[t],m[n]=i});let h={},g=this.getFrozenTensorIds(m),_={};for(;p.length>0;){let e=this.processStack(a,p,t,m,_,g,s,h,l);await Promise.all(e)}d==null&&!r&&console.warn(`This model execution did not contain any nodes with control flow or dynamic output shapes. You can use model.execute() instead.`);let v=c.filter(e=>!HZ(e)&&!QJ(e.name,m,t)).map(e=>e.name);if(v.length>0){let e=``;throw d!=null&&(e=`Alternatively, to avoid the dynamic ops, use model.execute() and specify the inputs [${f}]`),Error(`Cannot compute the outputs [${v}] from the provided inputs [${i}]. Consider providing the following inputs: [${u}]. ${e}`)}return m}processStack(e,t,n,r,i,a,o,s,c){let l=[];for(;t.length>0;){let e=t.pop();n.currentContext=e.contexts;let u=``;if(e.node.op===`Enter`&&$(`isConstant`,e.node,r,n)&&([u]=eY(e.node.name,n)),r[e.node.name]==null){let d=NZ(e.node,r,n,this._resourceManager);u||([u]=eY(e.node.name,n));let f=n.currentContext;Ne(d)?l.push(d.then(l=>(r[u]=l,this.keepIntermediateTensors&&(this.clonedTensorsMap[u]=this.cloneTensorList(l)),n.currentContext=f,this.checkTensorForDisposal(u,e.node,r,n,a,o,s),this.processChildNodes(e.node,t,n,r,i,c),l))):(r[u]=d,this.keepIntermediateTensors&&(this.clonedTensorsMap[u]=this.cloneTensorList(d)),this.checkTensorForDisposal(u,e.node,r,n,a,o,s),this.processChildNodes(e.node,t,n,r,i,c))}else this.processChildNodes(e.node,t,n,r,i,c)}return l}processChildNodes(e,t,n,r,i,a){e.children.forEach(e=>{let[o]=eY(e.name,n);i[o]||!a.has(e.name)||(e.op===`Merge`?e.inputNames.some(e=>!!QJ(e,r,n))&&(i[o]=!0,t.push({contexts:n.currentContext,node:e})):e.inputNames.every(e=>!!QJ(e,r,n))&&(i[o]=!0,t.push({contexts:n.currentContext,node:e})))})}dispose(){Object.keys(this.weightMap).forEach(e=>this.weightMap[e].forEach(e=>e.dispose()))}checkInputShapeAndType(e){Object.keys(e).forEach(t=>{let n=e[t],[r]=nY(t),i=this.graph.nodes[r];if(i.attrParams.shape&&i.attrParams.shape.value){let e=i.attrParams.shape.value;E(e.length===n.shape.length&&n.shape.every((t,n)=>e[n]===-1||e[n]===t),()=>`The shape of dict['${i.name}'] provided in model.execute(dict) must be [${e}], but was [${n.shape}]`)}i.attrParams.dtype&&i.attrParams.dtype.value&&E(n.dtype===i.attrParams.dtype.value,()=>`The dtype of dict['${i.name}'] provided in model.execute(dict) must be ${i.attrParams.dtype.value}, but was ${n.dtype}`)})}mapInputs(e){let t={};for(let n in e){let r=this._signature?.inputs?.[n];r==null?t[n]=e[n]:t[r.name]=e[n]}return t}checkInputs(e){let t=Object.keys(e).filter(e=>{let[t]=nY(e);return this.graph.nodes[t]==null});if(t.length>0)throw Error(`The dict provided in model.execute(dict) has keys: [${t}] that are not part of graph`)}mapOutputs(e){return e.map(e=>{let t=this._signature?.outputs?.[e];return t==null?e:t.name},{})}checkOutputs(e){e.forEach(e=>{let[t]=nY(e);if(!this.graph.nodes[t])throw Error(`The output '${e}' is not found in the graph`)})}}})),QZ,$Z=o((()=>{QZ=class{constructor(e={},t={}){this.hashTableNameToHandle=e,this.hashTableMap=t}addHashTable(e,t){this.hashTableNameToHandle[e]=t.handle,this.hashTableMap[t.id]=t}getHashTableHandleByName(e){return this.hashTableNameToHandle[e]}getHashTableById(e){return this.hashTableMap[e]}dispose(){for(let e in this.hashTableMap)this.hashTableMap[e].clearAndClose(),delete this.hashTableMap[e];for(let e in this.hashTableNameToHandle)this.hashTableNameToHandle[e].dispose(),delete this.hashTableNameToHandle[e]}}}));async function eQ(e,t={},n=Xw){if(e==null)throw Error(`modelUrl in loadGraphModel() cannot be null. Please provide a url or an IOHandler that loads the model`);t??={},t.fromTFHub&&typeof e==`string`&&(e=nQ(e));let r=new aQ(e,t,n);return await r.load(),r}function tQ(e){if(e==null)throw Error(`modelUrl in loadGraphModelSync() cannot be null. Please provide model artifacts or an IOHandler that loads the model`);let t;if(e instanceof Array){let[n,r]=e;if(!n)throw Error(`modelJSON must be the first element of the array`);if(!r||!(r instanceof ArrayBuffer))throw Error(`An ArrayBuffer of weights must be the second element of the array`);if(!(`modelTopology`in n))throw Error(`Model JSON is missing 'modelTopology'`);if(!(`weightsManifest`in n))throw Error(`Model JSON is missing 'weightsManifest'`);t=Uw(Ko(n,Yo(n.weightsManifest),r))}else if(`load`in e)t=e;else if(`modelTopology`in e&&`weightSpecs`in e&&`weightData`in e)t=Uw(e);else throw Error(`Unknown model format`);let n=new aQ(t);return n.load(),n}function nQ(e){return e.endsWith(`/`)||(e+=`/`),`${e}${iQ}${rQ}`}var rQ,iQ,aQ,oQ=o((()=>{J(),TX(),ZZ(),$Z(),ns(),rQ=`?tfjs-format=file`,iQ=`model.json`,aQ=class{get modelVersion(){return this.version}get inputNodes(){return this.executor.inputNodes}get outputNodes(){return this.executor.outputNodes}get inputs(){return this.executor.inputs}get outputs(){return this.executor.outputs}get weights(){return this.executor.weightMap}get metadata(){return this.artifacts.userDefinedMetadata}get modelSignature(){return this.signature}get modelStructuredOutputKeys(){return this.structuredOutputKeys}constructor(e,t={},n=Xw){this.modelUrl=e,this.loadOptions=t,this.version=`n/a`,this.io=n,t??(this.loadOptions={}),this.resourceManager=new QZ}findIOHandler(){let e=this.modelUrl;if(e.load!=null)this.handler=e;else if(this.loadOptions.requestInit!=null)this.handler=this.io.browserHTTPRequest(e,this.loadOptions);else{let t=this.io.getLoadHandlers(e,this.loadOptions);if(t.length===0)t.push(this.io.browserHTTPRequest(e,this.loadOptions));else if(t.length>1)throw Error(`Found more than one (${t.length}) load handlers for URL '${[e]}'`);this.handler=t[0]}}load(){if(this.findIOHandler(),this.handler.load==null)throw Error("Cannot proceed with model loading because the IOHandler provided does not have the `load` method implemented.");let e=this.handler.load();return Ne(e)?e.then(e=>e.getWeightStream==null?this.loadSync(e):this.loadStreaming(e)):this.loadSync(e)}loadSync(e){let t=this.io.decodeWeights(e.weightData,e.weightSpecs);return this.loadWithWeightMap(e,t)}async loadStreaming(e){if(e.getWeightStream==null)throw Error(`Model artifacts missing streamWeights function`);let t=await Ro(e.getWeightStream(),e.weightSpecs);return this.loadWithWeightMap(e,t)}loadWithWeightMap(e,t){this.artifacts=e;let n=this.artifacts.modelTopology,r=this.artifacts.signature;if(this.artifacts.userDefinedMetadata!=null){let e=this.artifacts.userDefinedMetadata;e.signature!=null&&(r=e.signature),e.structuredOutputKeys!=null&&(this.structuredOutputKeys=e.structuredOutputKeys)}if(this.signature=r,this.version=`${n.versions.producer}.${n.versions.minConsumer}`,this.executor=new XZ(wX.Instance.transformGraph(n,this.signature)),this.executor.weightMap=this.convertTensorMapToTensorsMap(t),this.executor.resourceManager=this.resourceManager,e.modelInitializer!=null&&e.modelInitializer.node!=null){let t=wX.Instance.transformGraph(e.modelInitializer);this.initializer=new XZ(t),this.initializer.weightMap=this.executor.weightMap,this.initializer.resourceManager=this.resourceManager,this.initializerSignature=e.initializerSignature}return!0}async save(e,t){if(typeof e==`string`){let t=this.io.getSaveHandlers(e);if(t.length===0)throw Error(`Cannot find any save handlers for URL '${e}'`);if(t.length>1)throw Error(`Found more than one (${t.length}) save handlers for URL '${e}'`);e=t[0]}if(e.save==null)throw Error("GraphModel.save() cannot proceed because the IOHandler provided does not have the `save` attribute defined.");return e.save(this.artifacts)}addStructuredOutputNames(e){if(this.structuredOutputKeys){let t=e instanceof la?[e]:e,n={};return t.forEach((e,t)=>n[this.structuredOutputKeys[t]]=e),n}return e}predict(e,t){let n=this.execute(e,this.outputNodes);return this.addStructuredOutputNames(n)}async predictAsync(e,t){let n=await this.executeAsync(e,this.outputNodes);return this.addStructuredOutputNames(n)}normalizeInputs(e){if(!(e instanceof la)&&!Array.isArray(e)){let t=this.signature?.inputs;if(t!=null)for(let n in t){let r=t[n];r.resourceId!=null&&(e[n]=this.resourceIdToCapturedInput[r.resourceId])}return e}e=Array.isArray(e)?e:[e];let t=Object.keys(this.resourceIdToCapturedInput).length;if(e.length+t!==this.inputNodes.length)throw Error(`Input tensor count mismatch, the graph model has ${this.inputNodes.length-t} non-resource placeholders, while there are ${e.length} input tensors provided.`);let n=0;return this.inputNodes.reduce((t,r)=>{let i=this.signature?.inputs?.[r]?.resourceId;return i==null?t[r]=e[n++]:t[r]=this.resourceIdToCapturedInput[i],t},{})}normalizeOutputs(e){return e||=this.outputNodes,Array.isArray(e)?e:[e]}executeInitializerGraph(){return this.initializer==null?[]:this.initializerSignature==null?this.initializer.execute({},[]):this.initializer.execute({},Object.keys(this.initializerSignature.outputs))}async executeInitializerGraphAsync(){return this.initializer==null?[]:this.initializerSignature==null?this.initializer.executeAsync({},[]):this.initializer.executeAsync({},Object.keys(this.initializerSignature.outputs))}setResourceIdToCapturedInput(e){if(this.resourceIdToCapturedInput={},this.initializerSignature){let t=this.initializerSignature.outputs,n=Object.keys(t);for(let r=0;r<n.length;r++){let i=t[n[r]];this.resourceIdToCapturedInput[i.resourceId]=e[r]}}}execute(e,t){this.resourceIdToCapturedInput??this.setResourceIdToCapturedInput(this.executeInitializerGraph()),e=this.normalizeInputs(e),t=this.normalizeOutputs(t);let n=this.executor.execute(e,t);return n.length>1?n:n[0]}async executeAsync(e,t){this.resourceIdToCapturedInput??this.setResourceIdToCapturedInput(await this.executeInitializerGraphAsync()),e=this.normalizeInputs(e),t=this.normalizeOutputs(t);let n=await this.executor.executeAsync(e,t);return n.length>1?n:n[0]}getIntermediateTensors(){return this.executor.getIntermediateTensors()}disposeIntermediateTensors(){this.executor.disposeIntermediateTensors()}convertTensorMapToTensorsMap(e){return Object.keys(e).reduce((t,n)=>(t[n]=[e[n]],t),{})}dispose(){this.executor.dispose(),this.initializer&&(this.initializer.dispose(),this.resourceIdToCapturedInput&&yo(this.resourceIdToCapturedInput)),this.resourceManager.dispose()}}})),sQ,cQ=o((()=>{sQ=`4.22.0`})),lQ=c({GraphModel:()=>aQ,deregisterOp:()=>YJ,loadGraphModel:()=>eQ,loadGraphModelSync:()=>tQ,registerOp:()=>qJ,version_converter:()=>sQ}),uQ=o((()=>{UJ(),oQ(),ZJ(),cQ()})),dQ=s(((e,t)=>{(function(n,r){typeof e==`object`&&t!==void 0?r(e,(uQ(),d(lQ)),(J(),d(CD))):typeof define==`function`&&define.amd?define([`exports`,`@tensorflow/tfjs-converter`,`@tensorflow/tfjs-core`],r):r((n||=self).cocoSsd=n.cocoSsd||{},n.tf,n.tf)})(e,(function(e,t,n){"use strict";let r={1:{name:`/m/01g317`,id:1,displayName:`person`},2:{name:`/m/0199g`,id:2,displayName:`bicycle`},3:{name:`/m/0k4j`,id:3,displayName:`car`},4:{name:`/m/04_sv`,id:4,displayName:`motorcycle`},5:{name:`/m/05czz6l`,id:5,displayName:`airplane`},6:{name:`/m/01bjv`,id:6,displayName:`bus`},7:{name:`/m/07jdr`,id:7,displayName:`train`},8:{name:`/m/07r04`,id:8,displayName:`truck`},9:{name:`/m/019jd`,id:9,displayName:`boat`},10:{name:`/m/015qff`,id:10,displayName:`traffic light`},11:{name:`/m/01pns0`,id:11,displayName:`fire hydrant`},13:{name:`/m/02pv19`,id:13,displayName:`stop sign`},14:{name:`/m/015qbp`,id:14,displayName:`parking meter`},15:{name:`/m/0cvnqh`,id:15,displayName:`bench`},16:{name:`/m/015p6`,id:16,displayName:`bird`},17:{name:`/m/01yrx`,id:17,displayName:`cat`},18:{name:`/m/0bt9lr`,id:18,displayName:`dog`},19:{name:`/m/03k3r`,id:19,displayName:`horse`},20:{name:`/m/07bgp`,id:20,displayName:`sheep`},21:{name:`/m/01xq0k1`,id:21,displayName:`cow`},22:{name:`/m/0bwd_0j`,id:22,displayName:`elephant`},23:{name:`/m/01dws`,id:23,displayName:`bear`},24:{name:`/m/0898b`,id:24,displayName:`zebra`},25:{name:`/m/03bk1`,id:25,displayName:`giraffe`},27:{name:`/m/01940j`,id:27,displayName:`backpack`},28:{name:`/m/0hnnb`,id:28,displayName:`umbrella`},31:{name:`/m/080hkjn`,id:31,displayName:`handbag`},32:{name:`/m/01rkbr`,id:32,displayName:`tie`},33:{name:`/m/01s55n`,id:33,displayName:`suitcase`},34:{name:`/m/02wmf`,id:34,displayName:`frisbee`},35:{name:`/m/071p9`,id:35,displayName:`skis`},36:{name:`/m/06__v`,id:36,displayName:`snowboard`},37:{name:`/m/018xm`,id:37,displayName:`sports ball`},38:{name:`/m/02zt3`,id:38,displayName:`kite`},39:{name:`/m/03g8mr`,id:39,displayName:`baseball bat`},40:{name:`/m/03grzl`,id:40,displayName:`baseball glove`},41:{name:`/m/06_fw`,id:41,displayName:`skateboard`},42:{name:`/m/019w40`,id:42,displayName:`surfboard`},43:{name:`/m/0dv9c`,id:43,displayName:`tennis racket`},44:{name:`/m/04dr76w`,id:44,displayName:`bottle`},46:{name:`/m/09tvcd`,id:46,displayName:`wine glass`},47:{name:`/m/08gqpm`,id:47,displayName:`cup`},48:{name:`/m/0dt3t`,id:48,displayName:`fork`},49:{name:`/m/04ctx`,id:49,displayName:`knife`},50:{name:`/m/0cmx8`,id:50,displayName:`spoon`},51:{name:`/m/04kkgm`,id:51,displayName:`bowl`},52:{name:`/m/09qck`,id:52,displayName:`banana`},53:{name:`/m/014j1m`,id:53,displayName:`apple`},54:{name:`/m/0l515`,id:54,displayName:`sandwich`},55:{name:`/m/0cyhj_`,id:55,displayName:`orange`},56:{name:`/m/0hkxq`,id:56,displayName:`broccoli`},57:{name:`/m/0fj52s`,id:57,displayName:`carrot`},58:{name:`/m/01b9xk`,id:58,displayName:`hot dog`},59:{name:`/m/0663v`,id:59,displayName:`pizza`},60:{name:`/m/0jy4k`,id:60,displayName:`donut`},61:{name:`/m/0fszt`,id:61,displayName:`cake`},62:{name:`/m/01mzpv`,id:62,displayName:`chair`},63:{name:`/m/02crq1`,id:63,displayName:`couch`},64:{name:`/m/03fp41`,id:64,displayName:`potted plant`},65:{name:`/m/03ssj5`,id:65,displayName:`bed`},67:{name:`/m/04bcr3`,id:67,displayName:`dining table`},70:{name:`/m/09g1w`,id:70,displayName:`toilet`},72:{name:`/m/07c52`,id:72,displayName:`tv`},73:{name:`/m/01c648`,id:73,displayName:`laptop`},74:{name:`/m/020lf`,id:74,displayName:`mouse`},75:{name:`/m/0qjjc`,id:75,displayName:`remote`},76:{name:`/m/01m2v`,id:76,displayName:`keyboard`},77:{name:`/m/050k8`,id:77,displayName:`cell phone`},78:{name:`/m/0fx9l`,id:78,displayName:`microwave`},79:{name:`/m/029bxz`,id:79,displayName:`oven`},80:{name:`/m/01k6s3`,id:80,displayName:`toaster`},81:{name:`/m/0130jx`,id:81,displayName:`sink`},82:{name:`/m/040b_t`,id:82,displayName:`refrigerator`},84:{name:`/m/0bt_c3`,id:84,displayName:`book`},85:{name:`/m/01x3z`,id:85,displayName:`clock`},86:{name:`/m/02s195`,id:86,displayName:`vase`},87:{name:`/m/01lsmm`,id:87,displayName:`scissors`},88:{name:`/m/0kmg4`,id:88,displayName:`teddy bear`},89:{name:`/m/03wvsk`,id:89,displayName:`hair drier`},90:{name:`/m/012xff`,id:90,displayName:`toothbrush`}};class i{constructor(e,t){this.modelPath=t||`https://storage.googleapis.com/tfjs-models/savedmodel/${this.getPrefix(e)}/model.json`}getPrefix(e){return e===`lite_mobilenet_v2`?`ssd${e}`:`ssd_${e}`}async load(){this.model=await t.loadGraphModel(this.modelPath);let e=n.zeros([1,300,300,3],`int32`),r=await this.model.executeAsync(e);await Promise.all(r.map((e=>e.data()))),r.map((e=>e.dispose())),e.dispose()}async infer(e,t,r){let i=n.tidy((()=>(e instanceof n.Tensor||(e=n.browser.fromPixels(e)),n.expandDims(e)))),a=i.shape[1],o=i.shape[2],s=await this.model.executeAsync(i),c=s[0].dataSync(),l=s[1].dataSync();i.dispose(),n.dispose(s);let[u,d]=this.calculateMaxScores(c,s[0].shape[1],s[0].shape[2]),f=n.getBackend();n.getBackend()===`webgl`&&n.setBackend(`cpu`);let p=n.tidy((()=>{let e=n.tensor2d(l,[s[1].shape[1],s[1].shape[3]]);return n.image.nonMaxSuppression(e,u,t,r,r)})),m=p.dataSync();return p.dispose(),f!==n.getBackend()&&n.setBackend(f),this.buildDetectedObjects(o,a,l,u,m,d)}buildDetectedObjects(e,t,n,i,a,o){let s=a.length,c=[];for(let l=0;l<s;l++){let s=[];for(let e=0;e<4;e++)s[e]=n[4*a[l]+e];let u=s[0]*t,d=s[1]*e,f=s[2]*t,p=s[3]*e;s[0]=d,s[1]=u,s[2]=p-d,s[3]=f-u,c.push({bbox:s,class:r[o[a[l]]+1].displayName,score:i[a[l]]})}return c}calculateMaxScores(e,t,n){let r=[],i=[];for(let a=0;a<t;a++){let t=Number.MIN_VALUE,o=-1;for(let r=0;r<n;r++)e[a*n+r]>t&&(t=e[a*n+r],o=r);r[a]=t,i[a]=o}return[r,i]}async detect(e,t=20,n=.5){return this.infer(e,t,n)}dispose(){this.model!=null&&this.model.dispose()}}e.ObjectDetection=i,e.load=async function(e={}){if(n==null)throw Error(`Cannot find TensorFlow.js. If you are using a <script> tag, please also include @tensorflow/tfjs on the page before using this model.`);let t=e.base||`lite_mobilenet_v2`,r=e.modelUrl;if([`mobilenet_v1`,`mobilenet_v2`,`lite_mobilenet_v2`].indexOf(t)===-1)throw Error(`ObjectDetection constructed with invalid base model ${t}. Valid names are 'mobilenet_v1', 'mobilenet_v2' and 'lite_mobilenet_v2'.`);let a=new i(t,r);return await a.load(),a},e.version=`2.2.3`,Object.defineProperty(e,`__esModule`,{value:!0})}))}));J();var fQ=dQ();async function pQ(e=.5){await So(`webgl`).catch(()=>!1)||await So(`cpu`),await Co();let t=await(0,fQ.load)({base:`lite_mobilenet_v2`,modelUrl:`/models/coco-ssd/model.json`});return{backend:wo(),async detect(n){return(await t.detect(n,20,e)).filter(e=>e.class===`person`).map(e=>({bbox:e.bbox,score:e.score}))},dispose:()=>t.dispose()}}window.RFVision={createDetector:pQ}})();