import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {readFileSync,writeFileSync,renameSync,appendFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {Game} from './game.mjs';
import {DEFAULT_AUDIO,updateAudio} from './audio-config.mjs';
import {synthesizeVoice} from './voice-cache.mjs';
import {parseTikTokChat} from './tiktok-chat.mjs';
import {LiveConnection} from './live-connection.mjs';
import {openWordDeck} from './word-deck-store.mjs';
import {fileURLToPath} from 'node:url';
const words=JSON.parse(await readFile(new URL('./words.json',import.meta.url),'utf8'));
const deck=openWordDeck(words,fileURLToPath(new URL('./data/word-progress.json',import.meta.url)));
const scoreFile=new URL('./data/live-scores.json',import.meta.url);
let saved={};try{saved=JSON.parse(readFileSync(scoreFile,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
let audioSettings={...DEFAULT_AUDIO,...saved.audioSettings,owner:'overlay'};
let liveSettings={username:'_hln110',enabled:true,...saved.liveSettings};
const game=new Game(words,()=>Date.now(),Math.random,{deck,sequence:saved.sequence,engagementState:saved.engagement}), clients=new Set();
game.demo=false;game.start();game.pause();
for(const p of saved.players||[])if(typeof p.id==='string'&&typeof p.name==='string'&&Number.isFinite(p.score)&&p.score>=0)game.players.set(p.id,p);
game.comments=(saved.comments||[]).slice(0,30);game.seen=new Set(saved.seen||game.comments.map(c=>c.id));
function saveScores(){const temp=new URL('./data/live-scores.tmp',import.meta.url);writeFileSync(temp,JSON.stringify({liveSettings,audioSettings,players:[...game.players.values()],comments:game.comments,seen:[...game.seen],sequence:game.sequence,engagement:game.engagement?.export()}));renameSync(temp,scoreFile);}
let live={status:liveSettings.enabled?'waiting':'demo',username:liveSettings.username,autoReconnect:liveSettings.enabled,message:'Đang chuẩn bị kết nối LIVE…'};
let clientVersion='';async function readClientVersion(){try{clientVersion=(await readFile(new URL('./public/app.js',import.meta.url),'utf8')).match(/^const CLIENT_VERSION='([^']+)'/m)?.[1]||'';}catch{}}
await readClientVersion();setInterval(readClientVersion,2000).unref();
const send=()=>{const data=`data: ${JSON.stringify({...game.snapshot(),live,clientVersion,audio:audioSettings})}\n\n`;for(const c of clients)c.write(data);};
const result=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
const liveManager=new LiveConnection({settings:liveSettings,
 createConnection:async username=>{const mod=await import('tiktok-live-connector');const Constructor=mod.TikTokLiveConnection||mod.WebcastPushConnection;if(!Constructor)throw Error('Connector không tương thích.');return new Constructor(username,{processInitialData:false,...(process.env.TIKTOK_SIGN_API_KEY?{signApiKey:process.env.TIKTOK_SIGN_API_KEY}:{})});},
 onChange:state=>{live=state;if(state.autoReconnect)game.demo=false;send();},
 onSettings:settings=>{liveSettings=settings;saveScores();},
 onChat:data=>{const chat=parseTikTokChat(data,randomUUID);if(!chat)return;const points=game.comment(chat);if(points!==false){appendFileSync(new URL('./data/live-comments.jsonl',import.meta.url),JSON.stringify({...chat,points,receivedAt:Date.now()})+'\n');saveScores();}send();}
});
const server=http.createServer(async(req,res)=>{
 try {
 const url=new URL(req.url,'http://localhost');
 if(req.method==='GET'&&url.pathname==='/events'){res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});clients.add(res);send();req.on('close',()=>clients.delete(res));return;}
 // cue-99 is the generated public MC cue. Its text is still restricted to the current round.
 if(req.method==='GET'&&['/api/voice','/voice/cue-99.mp3'].includes(url.pathname)){const bytes=await synthesizeVoice(url.searchParams.get('text')||'',url.searchParams.get('lang')||'',game.word);res.writeHead(200,{'Content-Type':'audio/mpeg','Content-Length':bytes.length,'Cache-Control':'private, max-age=86400'});res.end(bytes);return;}
 if(req.method==='GET'&&url.pathname==='/api/state')return result(res,200,{...game.snapshot(),live,clientVersion,audio:audioSettings});
 if(req.method==='GET'&&url.pathname==='/api/word-history')return result(res,200,{progress:deck.progress(),history:deck.history()});
 if(req.method==='GET'&&url.pathname==='/api/scores')return result(res,200,[...game.players.values()].sort((a,b)=>b.score-a.score));
 if(req.method==='POST'&&url.pathname.startsWith('/api/')){
  // Chỉ nhận lệnh từ cùng nguồn hoặc công cụ cục bộ; không mở máy chủ ra Internet.
  const expected=`http://${req.headers.host}`;
  if(req.headers.origin&&req.headers.origin!==expected)return result(res,403,{error:'Nguồn yêu cầu không hợp lệ.'});
  if(req.headers['sec-fetch-site']==='cross-site')return result(res,403,{error:'Yêu cầu ngoài ứng dụng bị chặn.'});
  let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>8192)return result(res,413,{error:'Dữ liệu quá dài.'});}const body=JSON.parse(raw||'{}');
  if(url.pathname==='/api/comment'){
   if(liveSettings.enabled)throw Error('Bấm Dùng demo trước khi thử bình luận mẫu.');
   const name=String(body.name||'').trim().slice(0,40),text=String(body.text||'').trim().slice(0,180);if(!name||!text)throw Error('Nhập tên và câu trả lời.');
   game.comment({id:randomUUID(),userId:`demo:${name.toLowerCase()}`,name,text});
  }else if(url.pathname==='/api/control'){
   if(body.action==='start')game.start();else if(body.action==='pause')game.pause();else if(body.action==='next')game.next();else if(body.action==='reveal')game.reveal();else if(body.action==='reset')game.reset();
   else if(body.action==='duration'){const n=Number(body.value);if(![20,30,45].includes(n))throw Error('Thời gian không hợp lệ.');game.setDuration(n);}
   else if(body.action==='bots'){if(liveSettings.enabled)throw Error('Bấm Dùng demo trước khi bật bot.');game.demo=Boolean(body.value);}
   else if(body.action==='scoreMode'){if(!['auto','total','stage'].includes(body.value))throw Error('Kiểu bảng điểm không hợp lệ.');game.engagement.scoreMode=body.value;}
   else throw Error('Lệnh không hợp lệ.');saveScores();
  }else if(url.pathname==='/api/audio'){audioSettings=updateAudio(audioSettings,body);saveScores();}
  else if(url.pathname==='/api/connect'){const name=String(body.username||'').replace(/^@/,'');if(!/^[a-zA-Z0-9_.]{2,30}$/.test(name))throw Error('Nhập username TikTok hợp lệ.');game.demo=false;await liveManager.enable(name);}
  else if(url.pathname==='/api/disconnect'){liveManager.disable();game.demo=true;}
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
setInterval(saveScores,5000).unref();
server.listen(3210,'127.0.0.1',()=>{console.log('WordLive: http://127.0.0.1:3210 | Màn hình phát: http://127.0.0.1:3210/overlay');liveManager.start();});
