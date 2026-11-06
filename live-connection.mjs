export class LiveConnection {
 constructor({createConnection,onChat=()=>{},onChange=()=>{},onSettings=()=>{},settings={},now=Date.now,setTimer=setTimeout,clearTimer=clearTimeout,timeoutMs=20000}){
  Object.assign(this,{createConnection,onChat,onChange,onSettings,now,setTimer,clearTimer,timeoutMs});
  this.settings={username:settings.username||'_hln110',enabled:settings.enabled!==false};this.connecting=false;this.epoch=0;this.failures=0;this.connection=null;this.inFlight=null;this.state={status:'waiting',username:this.settings.username,autoReconnect:this.settings.enabled,message:'Đang chuẩn bị kết nối LIVE…'};
 }
 publish(status,message,nextRetryAt=null){this.state={status,message,username:this.settings.username,autoReconnect:this.settings.enabled,nextRetryAt};this.onChange(this.state);}
 cancelTimers(){for(const key of ['retryTimer','healthTimer']){this.clearTimer(this[key]);this[key]=null;}}
 detach(candidate){if(!candidate)return;candidate.removeAllListeners();candidate.on('error',()=>{});try{Promise.resolve(candidate.disconnect()).catch(()=>{});}catch{}if(this.connection===candidate)this.connection=null;}
 retry(error){
  if(!this.settings.enabled)return;this.cancelTimers();this.failures++;
  const offline=/offline|isn't online|not online|not live/i.test(error?.message||'');
  const delay=offline?30000:Math.min(30000,5000*2**Math.min(this.failures-1,3));
  this.publish('waiting',offline?`Chờ @${this.settings.username} LIVE · tự thử lại sau 30 giây`:`Mất kết nối @${this.settings.username} · tự nối lại sau ${delay/1000} giây`,this.now()+delay);
  this.retryTimer=this.setTimer(()=>{this.retryTimer=null;this.attempt();},delay);this.retryTimer?.unref?.();
 }
 health(token,candidate){this.healthTimer=this.setTimer(()=>{this.healthTimer=null;if(token!==this.epoch||!this.settings.enabled||this.connection!==candidate)return;if(candidate.isConnected===false){this.epoch++;this.detach(candidate);this.retry(Error('Socket closed'));}else this.health(token,candidate);},5000);this.healthTimer?.unref?.();}
 start(){if(!this.settings.enabled){this.publish('demo','Bình luận demo · tự kết nối đã tắt');return Promise.resolve(this.state);}return this.attempt();}
 enable(username=this.settings.username){
  if(!/^[a-zA-Z0-9_.]{2,30}$/.test(username))throw Error('Nhập username TikTok hợp lệ.');
  if(this.settings.username!==username){this.epoch++;this.cancelTimers();this.detach(this.connection);this.connecting=false;this.inFlight=null;this.failures=0;}
  this.settings={username,enabled:true};this.onSettings({...this.settings});
  if(this.state.status==='connected'&&this.connection&&this.connection.isConnected!==false)return Promise.resolve(this.state);
  return this.attempt();
 }
 disable(){this.settings={...this.settings,enabled:false};this.epoch++;this.cancelTimers();this.detach(this.connection);this.connecting=false;this.inFlight=null;this.onSettings({...this.settings});this.publish('demo','Bình luận demo · tự kết nối đã tắt');}
 attempt(){
  if(!this.settings.enabled)return Promise.resolve(this.state);if(this.connecting)return this.inFlight||Promise.resolve(this.state);
  this.cancelTimers();this.connecting=true;const token=++this.epoch;this.publish('connecting',`Đang tự kết nối @${this.settings.username}…`);
  const job=(async()=>{let candidate,timeout,closed=false;
   try{
    candidate=await this.createConnection(this.settings.username);if(token!==this.epoch||!this.settings.enabled){this.detach(candidate);return this.state;}
    this.connection=candidate;
    const current=()=>token===this.epoch&&this.settings.enabled&&this.connection===candidate;
    const lost=()=>{if(!current())return;closed=true;if(!this.connecting){this.epoch++;this.detach(candidate);this.retry(Error('Disconnected'));}};
    candidate.on('chat',data=>{if(current()&&this.state.status==='connected')this.onChat(data);});
    candidate.on('disconnected',lost);candidate.on('streamEnd',lost);
    // Decode/sign-service warnings do not invalidate an otherwise healthy socket.
    candidate.on('error',()=>{if(candidate.isConnected===false&&!this.connecting)lost();});
    const connecting=candidate.connect().then(()=>{if(!current())this.detach(candidate);});
    await Promise.race([connecting,new Promise((_,reject)=>{timeout=this.setTimer(()=>reject(Error('Connection timeout')),this.timeoutMs);timeout?.unref?.();})]);
    if(!current())return this.state;if(closed||candidate.isConnected===false)throw Error('Socket closed during connection');
    this.failures=0;this.publish('connected',`Đang nhận bình luận @${this.settings.username} · tự nối lại nếu bị ngắt`);this.health(token,candidate);
   }catch(error){if(token===this.epoch&&this.settings.enabled){this.detach(candidate);this.retry(error);}}
   finally{this.clearTimer(timeout);if(token===this.epoch)this.connecting=false;}
   return this.state;
  })();this.inFlight=job;job.finally(()=>{if(this.inFlight===job)this.inFlight=null;});return job;
 }
}
