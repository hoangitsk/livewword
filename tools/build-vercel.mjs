import {mkdir,copyFile,readdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
async function copy(src,dest){await mkdir(dest,{recursive:true});for(const e of await readdir(src,{withFileTypes:true})){const from=path.join(src,e.name),to=path.join(dest,e.name);if(e.isDirectory())await copy(from,to);else await copyFile(from,to);}}
await copy('public','dist');
const polling=`class PollingEvents {constructor(){this.stopped=false;this.poll=async()=>{try{const r=await fetch('/api/state',{cache:'no-store'});if(!r.ok)throw Error('offline');this.onmessage?.({data:await r.text()});}catch(e){this.onerror?.(e);}finally{if(!this.stopped)this.timer=setTimeout(this.poll,1000);}};setTimeout(this.poll,0);}close(){this.stopped=true;clearTimeout(this.timer);}}\n`;
const js=await readFile('dist/app.js','utf8');await writeFile('dist/app.js',polling+js.replace("new EventSource('/events')","new PollingEvents()"));
console.log('Da tao man hinh phat Vercel (chi xem).');
