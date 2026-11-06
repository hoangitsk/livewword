const DEFAULT_ORIGIN='https://wordlive-yniem-live.stilldandelion.chatgpt.site';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).end();}
 const lang=String(req.query.lang||''),text=String(req.query.text||'');
 if(!['vi','en'].includes(lang)||!text||text.length>400)return res.status(400).json({error:'Nội dung MC không hợp lệ.'});
 try{const origin=new URL(process.env.LIVE_ORIGIN||DEFAULT_ORIGIN);if(origin.protocol!=='https:'||!origin.hostname.endsWith('.chatgpt.site'))throw Error();
  const url=new URL('/voice/cue-99.mp3',origin);url.searchParams.set('lang',lang);url.searchParams.set('text',text);
  const response=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!response.ok)return res.status(response.status).json({error:'Chưa tạo được MC cho vòng hiện tại.'});
  if(!response.headers.get('content-type')?.includes('audio/mpeg'))throw Error();res.setHeader('Content-Type','audio/mpeg');return res.status(200).end(Buffer.from(await response.arrayBuffer()));
 }catch{return res.status(503).json({error:'Máy phát MC chưa kết nối.'});}
}
