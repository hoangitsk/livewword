import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {Game} from './game.mjs';
import {synthesizeVoice} from './voice-cache.mjs';
import {parseTikTokChat} from './tiktok-chat.mjs';
import {openWordDeck} from './word-deck-store.mjs';
import {fileURLToPath} from 'node:url';
const words=JSON.parse(await readFile(new URL('./words.json',import.meta.url),'utf8'));
const deck=openWordDeck(words,fileURLToPath(new URL('./data/word-progress.json',import.meta.url)));
const game=new Game(words,()=>Date.now(),Math.random,{deck}), clients=new Set();
game.demo=false;game.start();game.pause();
let live={status:'demo',message:'Bình luận demo · chưa kết nối LIVE'}, connection, connecting=false;
const send=()=>{const data=`data: ${JSON.stringify({...game.snapshot(),live})}\n\n`;for(const c of clients)c.write(data);};
const result=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
async function connect(username){
 if(connecting)throw Error('Đang kết nối, vui lòng chờ.');
 connecting=true;game.demo=false;
 try {
  if(connection){connection.removeAllListeners();connection.disconnect();connection=null;}
  live={status:'connecting',message:`Đang kết nối @${username}…`};send();
  const mod=await import('tiktok-live-connector');
  const Constructor=mod.TikTokLiveConnection||mod.WebcastPushConnection;
  if(!Constructor)throw Error('Phiên bản connector không tương thích.');
  const candidate=new Constructor(username,{processInitialData:false,...(process.env.TIKTOK_SIGN_API_KEY?{signApiKey:process.env.TIKTOK_SIGN_API_KEY}:{})});connection=candidate;
  candidate.on('chat',d=>{if(live.status!=='connected')return;const chat=parseTikTokChat(d,randomUUID);if(!chat)return;game.comment(chat);send();});
  candidate.on('error',()=>{live={status:'error',message:'Lỗi kết nối TikTok. Kiểm tra mạng, tài khoản đang LIVE và thử lại.'};send();});
  candidate.on('disconnected',()=>{live={status:'offline',message:'Đã mất kết nối LIVE. Bấm kết nối lại khi sẵn sàng.'};send();});
  await candidate.connect();live={status:'connected',message:`Đang nhận bình luận @${username}`};
 }catch(e){if(connection){connection.removeAllListeners();connection.disconnect();connection=null;}live={status:'error',message:e.code==='ERR_MODULE_NOT_FOUND'?'Chưa cài connector. Xem README để bật tích hợp thử nghiệm.':'Không kết nối được. Kiểm tra người dùng đang LIVE và hướng dẫn README.'};throw Error(live.message);}finally{connecting=false;send();}
}
const server=http.createServer(async(req,res)=>{
 try {
 const url=new URL(req.url,'http://localhost');
 if(req.method==='GET'&&url.pathname==='/events'){res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});clients.add(res);send();req.on('close',()=>clients.delete(res));return;}
 if(req.method==='GET'&&url.pathname==='/api/voice'){const bytes=await synthesizeVoice(url.searchParams.get('text')||'',url.searchParams.get('lang')||'',game.word);res.writeHead(200,{'Content-Type':'audio/mpeg','Content-Length':bytes.length,'Cache-Control':'private, max-age=86400'});res.end(bytes);return;}
 if(req.method==='GET'&&url.pathname==='/api/state')return result(res,200,{...game.snapshot(),live});
 if(req.method==='GET'&&url.pathname==='/api/word-history')return result(res,200,{progress:deck.progress(),history:deck.history()});
 if(req.method==='GET'&&url.pathname==='/api/scores')return result(res,200,[...game.players.values()].sort((a,b)=>b.score-a.score));
 if(req.method==='POST'&&url.pathname.startsWith('/api/')){
  // Chỉ nhận lệnh từ cùng nguồn hoặc công cụ cục bộ; không mở máy chủ ra Internet.
  const expected=`http://${req.headers.host}`;
  if(req.headers.origin&&req.headers.origin!==expected)return result(res,403,{error:'Nguồn yêu cầu không hợp lệ.'});
  if(req.headers['sec-fetch-site']==='cross-site')return result(res,403,{error:'Yêu cầu ngoài ứng dụng bị chặn.'});
  let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>8192)return result(res,413,{error:'Dữ liệu quá dài.'});}const body=JSON.parse(raw||'{}');
  if(url.pathname==='/api/comment'){
   if(live.status==='connected'||live.status==='connecting')throw Error('Ngắt LIVE trước khi thử bình luận demo.');
   const name=String(body.name||'').trim().slice(0,40),text=String(body.text||'').trim().slice(0,180);if(!name||!text)throw Error('Nhập tên và câu trả lời.');
   game.comment({id:randomUUID(),userId:`demo:${name.toLowerCase()}`,name,text});
  }else if(url.pathname==='/api/control'){
   if(body.action==='start')game.start();else if(body.action==='pause')game.pause();else if(body.action==='next')game.next();else if(body.action==='reveal')game.reveal();else if(body.action==='reset')game.reset();
   else if(body.action==='duration'){const n=Number(body.value);if(![20,30,45].includes(n))throw Error('Thời gian không hợp lệ.');game.setDuration(n);}
   else if(body.action==='bots'){if(live.status==='connected'||connecting)throw Error('Ngắt LIVE trước khi bật bot.');game.demo=Boolean(body.value);}
   else throw Error('Lệnh không hợp lệ.');
  }else if(url.pathname==='/api/connect'){const name=String(body.username||'').replace(/^@/,'');if(!/^[a-zA-Z0-9_.]{2,30}$/.test(name))throw Error('Nhập username TikTok hợp lệ.');await connect(name);}
  else if(url.pathname==='/api/disconnect'){if(connecting)throw Error('Chờ kết nối hoàn tất rồi ngắt.');if(connection){connection.removeAllListeners();connection.disconnect();connection=null;}live={status:'demo',message:'Bình luận demo · chưa kết nối LIVE'};game.demo=true;}
  else return result(res,404,{error:'Không tìm thấy.'});send();return result(res,200,{ok:true});
 }
 const files={'/':'index.html','/overlay':'index.html','/audio.mjs':'audio.mjs','/music/edm-detection-mode.mp3':'music/edm-detection-mode.mp3','/app.js':'app.js','/style.css':'style.css'};
 if(/^\/voice\/(?:cue-\d{2}\.mp3|manifest\.json)$/.test(url.pathname))files[url.pathname]=url.pathname.slice(1);
 if(req.method!=='GET'||!files[url.pathname])return result(res,404,{error:'Không tìm thấy.'});
 const file=files[url.pathname];
 if(file.endsWith('.mp3')){const bytes=await readFile(new URL('./public/'+file,import.meta.url));const range=req.headers.range;const headers={'Content-Type':'audio/mpeg','Accept-Ranges':'bytes','Cache-Control':'no-store'};if(range){const m=/^bytes=(\d+)-(\d*)$/.exec(range);if(!m){res.writeHead(416,{'Content-Range':'bytes */'+bytes.length});return res.end();}const start=Number(m[1]),end=m[2]?Math.min(Number(m[2]),bytes.length-1):bytes.length-1;if(start>=bytes.length||end<start){res.writeHead(416,{'Content-Range':'bytes */'+bytes.length});return res.end();}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${bytes.length}`,'Content-Length':end-start+1});return res.end(bytes.subarray(start,end+1));}res.writeHead(200,{...headers,'Content-Length':bytes.length});return res.end(bytes);}
 res.writeHead(200,{'Content-Type':file.endsWith('.json')?'application/json; charset=utf-8':file.endsWith('.mp3')?'audio/mpeg':(file.endsWith('.js')||file.endsWith('.mjs'))?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(await readFile(new URL(`./public/${file}`,import.meta.url)));
 }catch(e){result(res,400,{error:e.message||'Không xử lý được yêu cầu.'});}
});
setInterval(send,100).unref();
server.listen(3210,'127.0.0.1',()=>console.log('WordLive: http://127.0.0.1:3210 | Màn hình phát: http://127.0.0.1:3210/overlay'));
