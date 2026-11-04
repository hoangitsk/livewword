import {readFileSync,mkdirSync,openSync,writeFileSync,fsyncSync,closeSync,renameSync} from 'node:fs';
import {dirname} from 'node:path';import {WordDeck} from './word-deck.mjs';
export function openWordDeck(words,file,options={}){let state=null;try{state=JSON.parse(readFileSync(file,'utf8').replace(/^\uFEFF/,''));}catch(e){if(e.code!=='ENOENT')throw Error('Không đọc được lịch sử từ tại '+file+'. Giữ nguyên tệp để khôi phục; không tự đặt lại.');}
 const save=value=>{mkdirSync(dirname(file),{recursive:true});const temp=file+'.tmp';const fd=openSync(temp,'w');try{writeFileSync(fd,JSON.stringify(value,null,2)+'\n','utf8');fsyncSync(fd);}finally{closeSync(fd);}renameSync(temp,file);};
 return new WordDeck(words,{...options,state,save});
}
