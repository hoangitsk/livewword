export const DEFAULT_AUDIO=Object.freeze({owner:'overlay',enabled:true,musicOn:true,ttsOn:true,sfxOn:true,musicVolume:20,voiceVolume:90,offset:120,end:210,testNonce:0});
export function updateAudio(current,patch,now=Date.now()){
 if(!patch||typeof patch!=='object'||Array.isArray(patch))throw Error('Thiết lập âm thanh không hợp lệ.');
 const next={...DEFAULT_AUDIO,...current,owner:'overlay'};
 for(const [key,value]of Object.entries(patch)){
  if(['enabled','musicOn','ttsOn','sfxOn'].includes(key)){if(typeof value!=='boolean')throw Error('Thiết lập bật/tắt không hợp lệ.');next[key]=value;}
  else if(['musicVolume','voiceVolume'].includes(key)){if(!Number.isFinite(value)||value<0||value>100)throw Error('Âm lượng phải từ 0 đến 100.');next[key]=value;}
  else if(['offset','end'].includes(key)){if(!Number.isFinite(value)||value<0||value>86400)throw Error('Mốc nhạc không hợp lệ.');next[key]=value;}
  else if(key==='test'){if(value!==true)throw Error('Lệnh nghe thử không hợp lệ.');next.testNonce=now;next.enabled=true;}
  else throw Error('Thiết lập âm thanh không được hỗ trợ.');
 }
 return next;
}
