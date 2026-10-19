// Validate container boundaries and dimensions; never trust extension or MIME supplied by a client.
export function imageContent(b:Uint8Array):{ext:string,type:string}|null{
 const n=b.length,v=new DataView(b.buffer,b.byteOffset,b.byteLength),str=(p:number,l:number)=>new TextDecoder().decode(b.subarray(p,p+l));
 const dimensions=(w:number,h:number)=>w>0&&h>0&&w<=16000&&h<=16000&&w*h<=40000000;
 if(n>=45&&[137,80,78,71,13,10,26,10].every((x,i)=>b[i]===x)){
  let p=8,header=false,data=false,end=false;
  while(p+12<=n){const l=v.getUint32(p),type=str(p+4,4);if(l>n-p-12)return null;
   let crc=0xffffffff;for(let k=p+4;k<p+8+l;k++){crc^=b[k];for(let j=0;j<8;j++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}if(((crc^0xffffffff)>>>0)!==v.getUint32(p+8+l))return null;
   if(!header){if(type!=='IHDR'||l!==13||!dimensions(v.getUint32(p+8),v.getUint32(p+12)))return null;header=true}
   if(type==='IDAT'&&l>0)data=true;if(type==='IEND'){if(l!==0||p+12!==n)return null;end=true;break}p+=12+l;
  }return header&&data&&end?{ext:'png',type:'image/png'}:null;
 }
 if(n>20&&b[0]===255&&b[1]===216&&b[n-2]===255&&b[n-1]===217){
  let p=2,frame=false,scan=false;while(p<n-2){if(b[p++]!==255)return null;while(b[p]===255)p++;const marker=b[p++];if(marker===0||marker===217)return null;if(marker===1||marker>=208&&marker<=215)continue;if(p+2>n)return null;const l=v.getUint16(p);if(l<2||p+l>n)return null;
   if([192,193,194].includes(marker)){if(l<8||!dimensions(v.getUint16(p+5),v.getUint16(p+3)))return null;frame=true}
   if(marker===218){if(!frame||l<6)return null;scan=p+l<n-2;break}p+=l;
  }return frame&&scan?{ext:'jpg',type:'image/jpeg'}:null;
 }
 if(n>=30&&str(0,4)==='RIFF'&&str(8,4)==='WEBP'&&v.getUint32(4,true)+8===n){
  let p=12,valid=false;while(p+8<=n){const t=str(p,4),l=v.getUint32(p+4,true),o=p+8;if(l>n-o)return null;
   if(t==='VP8 '&&l>=10&&b[o+3]===157&&b[o+4]===1&&b[o+5]===42)valid=dimensions(v.getUint16(o+6,true)&16383,v.getUint16(o+8,true)&16383);
   if(t==='VP8L'&&l>=5&&b[o]===47){const bits=v.getUint32(o+1,true);valid=dimensions((bits&16383)+1,((bits>>>14)&16383)+1)}
   if(t==='ANIM'||t==='ANMF')return null;p=o+l+(l%2);
  }return valid&&p===n?{ext:'webp',type:'image/webp'}:null;
 }return null;
}
