const DEFAULT_ORIGIN='https://wordlive-yniem-live.stilldandelion.chatgpt.site';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Màn hình phát chỉ cho phép xem.'});}
 try{const origin=new URL(process.env.LIVE_ORIGIN||DEFAULT_ORIGIN);if(origin.protocol!=='https:'||!origin.hostname.endsWith('.chatgpt.site'))throw Error('Nguồn LIVE không hợp lệ.');const r=await fetch(origin.origin+'/api/state',{cache:'no-store',signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('Máy phát chưa kết nối.');const s=await r.json();return res.status(200).json(s);}catch{return res.status(503).json({error:'Máy phát đang ngoại tuyến. Hãy giữ game và kết nối LIVE trên máy đang chạy.'});}
}
