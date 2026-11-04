import http from 'node:http';
export const allowed=path=>path==='/overlay'||path==='/events'||path==='/api/state'||['/app.js','/audio.mjs','/style.css','/music/edm-detection-mode.mp3'].includes(path)||/^\/voice\/(?:cue-\d{2}\.mp3|manifest\.json)$/.test(path);
export function createRelay({port=3210}={}){return http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(req.method!=='GET'){res.writeHead(405,{'Allow':'GET','Content-Type':'text/plain; charset=utf-8'});res.end('Màn hình phát chỉ cho phép xem.');return;}
 if(url.pathname==='/'){res.writeHead(302,{Location:'/overlay'});res.end();return;}
 if(!allowed(url.pathname)){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Không tìm thấy.');return;}
 const upstream=http.request({hostname:'127.0.0.1',port,path:url.pathname+url.search,method:'GET',headers:{...(req.headers.range?{range:req.headers.range}:{}),host:'127.0.0.1:'+port}},r=>{res.writeHead(r.statusCode,{...r.headers,'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});r.pipe(res);});
 upstream.on('error',()=>{if(!res.headersSent){res.writeHead(503,{'Content-Type':'text/plain; charset=utf-8'});res.end('Game chưa chạy. Hãy mở START.cmd trên máy phát.');}else res.destroy();});res.on('close',()=>upstream.destroy());upstream.end();
 });}
if(process.argv[1]&&new URL(import.meta.url).pathname.toLowerCase().endsWith('/public-relay.mjs')&&process.argv[1].replaceAll('\\','/').endsWith('/public-relay.mjs'))createRelay().listen(3211,'127.0.0.1',()=>console.log('Nguồn chỉ xem: http://127.0.0.1:3211/overlay — chỉ trỏ tunnel vào cổng 3211.'));
