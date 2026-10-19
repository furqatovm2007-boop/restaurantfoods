const {createRequire}=require('node:module');
const req=createRequire(require.resolve('wrangler/package.json'));
req('esbuild').buildSync({entryPoints:['ui/demo-realtime.js'],bundle:true,format:'esm',platform:'browser',target:['es2022'],minify:true,outfile:'public/demo-realtime.js'});
