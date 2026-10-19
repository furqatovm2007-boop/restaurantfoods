export const dynamic='force-dynamic';
export function GET(){return new Response(null,{status:302,headers:{Location:'/#/login','Cache-Control':'no-store'}})}
