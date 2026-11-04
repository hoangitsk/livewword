import {readFile,mkdir} from 'node:fs/promises';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';import {spawn} from 'node:child_process';
const root=new URL('./',import.meta.url),pending=new Map();
export async function synthesizeVoice(text,lang,word){
 const permitted=new Map([['vi',new Set(['Chào mừng bạn đến với WordLive! Đoán thật nhanh để ghi điểm nhé!','Một chữ đã mở. Bạn đoán được chưa?','Còn năm giây. Chốt đáp án nào!','Đáp án là',word.vi+'.',`Từ mới nhé. ${word.vi}. ${word.hint} Đoán từ tiếng Anh nào!`])],['en',new Set([word.en])]]);
 if(!permitted.get(lang)?.has(text))throw Error('Chỉ tạo giọng cho nội dung của vòng hiện tại.');
 const hash=createHash('sha256').update(lang+':'+text).digest('hex'),dir=new URL('./work/voice-cache/',root),file=new URL(hash+'.mp3',dir);try{return await readFile(file);}catch(e){if(e.code!=='ENOENT')throw e;}
 if(pending.has(hash))return pending.get(hash);if(pending.size>=3)throw Error('Đang tạo lời dẫn, thử lại sau.');
 const job=(async()=>{await mkdir(dir,{recursive:true});let config={};try{config=JSON.parse(await readFile(new URL('./work/voice-runtime.json',root),'utf8'));}catch{}
 const python=process.env.WORDLIVE_PYTHON||config.python||'python';
 await new Promise((resolve,reject)=>{const child=spawn(python,[fileURLToPath(new URL('./tools/synthesize_voice.py',root)),lang,fileURLToPath(file)],{windowsHide:true,stdio:['pipe','ignore','pipe']});let error='';const timer=setTimeout(()=>{child.kill();reject(Error('Tạo giọng quá thời gian.'));},20000);child.stderr.on('data',d=>{error+=d.toString().slice(0,1000);});child.on('error',e=>{clearTimeout(timer);reject(e);});child.on('exit',code=>{clearTimeout(timer);code===0?resolve():reject(Error('Chưa tạo được lời dẫn. Kiểm tra Internet và gTTS theo README.'));});child.stdin.on('error',()=>{});child.stdin.end(text,'utf8');});return await readFile(file);})();pending.set(hash,job);try{return await job;}finally{pending.delete(hash);}
}
