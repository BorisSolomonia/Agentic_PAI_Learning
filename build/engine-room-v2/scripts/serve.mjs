import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { resolve, relative, extname, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=await realpath(fileURLToPath(new URL('../dist/',import.meta.url)));
const port=Number(process.env.ENGINE_ROOM_PORT||4178);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json','.rsc':'text/x-component','.woff2':'font/woff2','.png':'image/png','.ico':'image/x-icon'};
function inside(path){const rel=relative(root,path);return rel!== '..'&&!rel.startsWith('..'+sep)&&!isAbsolute(rel)}
const server=createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Cache-Control','no-cache');
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return}
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const requested=resolve(root,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));
  if(!inside(requested)){res.writeHead(403);res.end('Forbidden');return}
  const path=await realpath(requested);
  if(!inside(path)){res.writeHead(403);res.end('Forbidden');return}
  const info=await stat(path);if(!info.isFile())throw new Error('Not a file');
  const data=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Content-Length':data.length});res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found')}
});
server.on('error',err=>{console.error(err.code==='EADDRINUSE'?`Port ${port} is already in use. If Engine Room is running, open http://127.0.0.1:${port}/. Otherwise set ENGINE_ROOM_PORT to another port.`:err.message);process.exitCode=1});
server.listen(port,'127.0.0.1',()=>console.log(`LifeOS Engine Room: http://127.0.0.1:${port}/\nLocal static learning guide. Press Ctrl+C to stop.`));
