import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'docs');
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.pdf':'application/pdf'};
const server=http.createServer(async(req,res)=>{
  let requestPath;try{requestPath=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
  // The local preview uses the same coach service as GitHub Pages. No API key
  // is stored here, and only these two fixed destinations can be proxied.
  if(requestPath==='/health'||requestPath==='/api/chat'){
    const method=requestPath==='/health'?'GET':'POST';
    if(req.method!==method){res.writeHead(405,{Allow:method});res.end();return;}
    try{
      const chunks=[];let bytes=0;
      for await(const chunk of req){bytes+=chunk.length;if(bytes>24576){res.writeHead(413);res.end();return;}chunks.push(chunk);}
      const response=await fetch(`https://ce2407a-tutorial2.onrender.com${requestPath}`,{
        method,headers:{'Content-Type':'application/json'},
        ...(method==='POST'?{body:Buffer.concat(chunks)}:{}),
        signal:AbortSignal.timeout(requestPath==='/health'?90000:65000)
      });
      res.writeHead(response.status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});
      res.end(await response.text());
    }catch{res.writeHead(502,{'content-type':'application/json'});res.end(JSON.stringify({error:'The AI Coach is unavailable. Please try again.'}));}
    return;
  }
  const target=path.resolve(root,`.${requestPath==='/'?'/index.html':requestPath}`);
  if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  fs.stat(target,(err,stat)=>{if(err||!stat.isFile()){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'content-type':types[path.extname(target)]||'application/octet-stream','cache-control':'no-store'});fs.createReadStream(target).pipe(res);});
});
server.listen(4172,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4172'));

