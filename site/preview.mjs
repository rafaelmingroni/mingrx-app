// Review a production build locally; never publishes or changes the domain.
import http from 'node:http';
import path from 'node:path';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../work/site-preview/',import.meta.url));
await stat(path.join(root,'index.html')).catch(()=>{throw Error('Primeiro execute: node site/build.mjs')});
const port=Number(process.env.PORT||4173);
if(!Number.isInteger(port)||port<1||port>65535)throw Error('PORT deve estar entre 1 e 65535.');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2','.ttf':'font/ttf','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});return res.end()}
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
  if(!file.startsWith(root)){res.writeHead(403);return res.end('Forbidden')}
  const data=await readFile(file);
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':data.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Página não encontrada')}
});
server.on('error',error=>{console.error(error.message);process.exitCode=1});
server.listen(port,'127.0.0.1',()=>console.log(`Prévia local: http://127.0.0.1:${port}/\nSomente o build estático é servido. Ctrl+C para encerrar.`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close());
