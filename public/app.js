import {LiveAudio} from '/audio.mjs';
const $=id=>document.getElementById(id), stage=$('stage');
const overlay=location.pathname==='/overlay';if(overlay)document.body.classList.add('overlay');
function scale(){document.documentElement.style.setProperty('--scale',Math.min(innerWidth/380,innerHeight/(380*16/9)));}scale();addEventListener('resize',scale);
const colors=['#FF8FA3','#7DF0C8','#FFC93C','#B9A8FF','#FFB07A'];
const sound=new LiveAudio(overlay);
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
let state,round,lastPhase,lastComments='',lastSpoken,rows=new Map(),tileTimers=[],knownComments=new Set();
function el(tag,cls,text=''){const e=document.createElement(tag);e.className=cls;e.textContent=text;return e;}
async function api(path,body){try{const r=await fetch('/api/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw Error(d.error);$('notice').textContent='';return true;}catch(e){$('notice').textContent=e.message;return false;}}
function flip(tile,ch,answer,delay=0){tileTimers.push(setTimeout(()=>{if(reduced()){tile.textContent=ch;tile.className='tile '+(answer?'ok':'hint');return;}tile.classList.remove('flip');void tile.offsetWidth;tile.style.animationDelay='0s';tile.classList.add('flip');tileTimers.push(setTimeout(()=>{tile.textContent=ch;tile.classList.toggle('hint',!answer);tile.classList.toggle('ok',answer);},220));},delay));}
function confetti(){if(reduced())return;for(let i=0;i<30;i++){const c=el('i','cf');c.style.left=Math.random()*100+'%';c.style.background=[...colors,'#27D8A1','#fff'][i%7];c.style.animationDelay=Math.random()*.5+'s';stage.append(c);setTimeout(()=>c.remove(),2400);}}
function render(s){
 const roundKey=(s.deck?.totalDisplayed??0)+':'+s.round+':'+s.generation;const newRound=round!==roundKey;const first=round===undefined;
 if(newRound){tileTimers.forEach(clearTimeout);tileTimers=[];stage.querySelectorAll('.cf').forEach(c=>c.remove());$('rd').textContent='Vòng '+s.round;$('vi').textContent=s.vi;$('clue').textContent=s.hint;$('cnt').textContent=s.letters.length+' chữ cái, gợi ý sẽ dần hiện ra';$('tiles').classList.toggle('long-word',s.letters.length>11);$('tiles').replaceChildren(...s.letters.map((ch,i)=>{const t=el('div','tile',ch==='·'?'':ch);t.dataset.value=ch;t.style.animationDelay=i*.05+'s';if(ch!=='·')t.classList.add(s.answer?'ok':'hint');return t;}));}
 else s.letters.forEach((ch,i)=>{const t=$('tiles').children[i];if(t.dataset.value!==ch){t.dataset.value=ch;flip(t,ch,Boolean(s.answer),s.answer?i*70:0);}else if(s.answer){t.classList.remove('hint');t.classList.add('ok');}});
 if(s.phase==='answer'&&lastPhase!=='answer'&&!first&&s.winners>0)confetti();
 const ratio=s.answer?0:s.remainingMs/(s.duration*1000);$('fill').style.width=Math.max(0,Math.min(100,ratio*100))+'%';stage.dataset.z=ratio>.5?'hi':ratio>=.2?'mid':'low';$('num').textContent=s.answer?'0':s.seconds;$('num').classList.toggle('hot',s.phase==='playing'&&s.seconds<=5);
 $('state').textContent=s.phase==='playing'?'Đang chạy, đoán ngay':s.phase==='answer'?'Đáp án đã hiện':s.phase==='paused'?'Đang tạm dừng, chưa nhận điểm':'Sẵn sàng chơi';$('go').textContent=s.phase==='playing'?'Tạm dừng':s.phase==='paused'?'Tiếp tục':'Bắt đầu';$('go').disabled=s.phase==='answer';$('rev').disabled=s.phase==='answer';$('dur').value=s.duration;
 const commentsKey=JSON.stringify(s.comments);if(commentsKey!==lastComments){
  const newest=s.comments.slice(0,3).reverse();const ids=new Set(newest.map(c=>c.id));for(const m of [...$('feed').children])if(!ids.has(m.dataset.id))m.remove();
  for(const c of newest){if([...$('feed').children].some(m=>m.dataset.id===c.id))continue;const m=el('div','m'+(c.points?' ok':''));m.dataset.id=c.id;const b=el('b','',c.name);m.append(b,document.createTextNode(c.points?'đoán đúng +'+c.points:c.text));if(first||knownComments.has(c.id))m.style.animation='none';$('feed').append(m);knownComments.add(c.id);}
  if(knownComments.size>300)knownComments=new Set(s.comments.map(c=>c.id));lastComments=commentsKey;
 }
 const honor=s.honor;const banner=$('honor');if(banner){banner.hidden=!honor;if(honor){$('honor-name').textContent=honor.name;$('honor-streak').textContent=honor.streak+' vòng đúng liên tiếp!';if(banner.dataset.id!==honor.id){banner.dataset.id=honor.id;confetti();}}}
 const streakBoard=$('streak-board');if(streakBoard){
  const champions=s.leaders.filter(p=>p.streak>0).sort((a,b)=>b.streak-a.streak||b.score-a.score).slice(0,3);
  const signature=JSON.stringify(champions.map(p=>[p.id,p.name,p.streak]));if(streakBoard.dataset.signature!==signature){streakBoard.dataset.signature=signature;streakBoard.replaceChildren();if(!champions.length)streakBoard.append(el('p','streak-empty','Chưa có chuỗi. Đoán đúng để bắt đầu!'));champions.forEach((p,i)=>{const row=el('div','streak-row');row.append(el('span','streak-medal',['🥇','🥈','🥉'][i]),el('span','streak-name',p.name),el('b','streak-value',p.streak+' 🔥'));row.title=p.name+' · '+p.streak+' vòng đúng liên tiếp';streakBoard.append(row);});}
 }
 const present=new Set();s.leaders.forEach((p,i)=>{present.add(p.id);let row=rows.get(p.id);if(!row){row=el('div','r');row.append(el('span','av',p.name.trim().split(/\s+/).at(-1).slice(0,1)),el('span','n',p.name),el('span','p',p.score+' đ'));row.children[0].style.background=colors[rows.size%colors.length];row.dataset.score=p.score;if(!first&&p.score>0)row.children[2].classList.add('bump');rows.set(p.id,row);$('board').append(row);}
 row.style.transform=`translateY(${i*33}px)`;row.style.opacity=i<4?'1':'0';row.setAttribute('aria-hidden',String(i>=4));row.classList.toggle('first',i===0&&p.score>0);row.children[1].textContent=p.name;
 if(Number(row.dataset.score)!==p.score){const point=row.children[2];point.textContent=p.score+' đ';point.classList.remove('bump');void point.offsetWidth;point.classList.add('bump');row.dataset.score=p.score;}
 });for(const [id,r] of rows)if(!present.has(id)){r.remove();rows.delete(id);}
 $('connection').textContent=s.live.message;$('bots').checked=s.demo;const active=['connecting','connected'].includes(s.live.status);$('bots').disabled=active;$('who').disabled=active;$('ans').disabled=active;$('send').disabled=active;$('connect').disabled=s.live.status==='connecting';
 sound.update(s);
 if(s.deck){$('deck-counter').textContent=`Lượt ${s.deck.cycle} · Đã hiện ${s.deck.shown}/${s.deck.total} từ`;$('deck-summary').textContent=`Lượt ${s.deck.cycle}: đã hiện ${s.deck.shown}/${s.deck.total}, còn ${s.deck.remaining} từ chưa hiện. Lịch sử giữ qua lần mở app.`;}
 $('vi').style.fontSize=s.vi.length>25?'27px':s.vi.length>16?'34px':'';
 state=s;round=roundKey;lastPhase=s.phase;
}
const ticker=$('stage').querySelector('.tick span');const line='Gõ đáp án vào bình luận để ghi điểm. Đoán càng nhanh, điểm càng cao. ';ticker.replaceChildren(el('span','',line),el('span','repeat',line));ticker.children[1].setAttribute('aria-hidden','true');
const events=new EventSource('/events');events.onmessage=e=>render(JSON.parse(e.data));events.onerror=()=>{$('state').textContent='Mất kết nối máy chủ, đang thử lại…';$('notice').textContent='Kiểm tra cửa sổ START.cmd vẫn đang chạy.';};
$('go').onclick=()=>api('control',{action:state?.phase==='playing'?'pause':'start'});$('rev').onclick=()=>api('control',{action:'reveal'});$('next').onclick=()=>api('control',{action:'next'});$('dur').onchange=e=>api('control',{action:'duration',value:e.target.value});$('reset').onclick=()=>{if(confirm('Xóa điểm và sang từ chưa xuất hiện tiếp theo? Lịch sử từ vẫn được giữ.'))api('control',{action:'reset'});};
async function mine(){const text=$('ans').value.trim();if(!text)return;if(await api('comment',{name:$('who').value.trim()||'Khách',text})){$('ans').value='';$('ans').focus();}}$('send').onclick=mine;$('ans').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();mine();}};
$('bots').onchange=e=>api('control',{action:'bots',value:e.target.checked});$('connect').onclick=()=>api('connect',{username:$('username').value});$('disconnect').onclick=()=>api('disconnect',{});
if(!('speechSynthesis' in window))$('tts').disabled=true;
$('export').onclick=async()=>{try{const r=await fetch('/api/scores');if(!r.ok)throw Error('Không tải được điểm.');const scores=await r.json();const cell=v=>'"'+String(v).replace(/^\s*[=+@-]/,"'$&").replaceAll('"','""')+'"';const csv='\uFEFF'+[['Tên','Điểm','Số vòng đúng'],...scores.map(p=>[p.name,p.score,p.wins])].map(r=>r.map(cell).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=el('a','');a.href=url;a.download='wordlive-diem.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){$('notice').textContent=e.message;}};

$('word-history').onclick=async()=>{try{const r=await fetch('/api/word-history');if(!r.ok)throw Error('Lịch sử chỉ xuất được trên bàn điều khiển của máy phát.');const d=await r.json();const cell=v=>'\"'+String(v).replace(/^[=+@-]/,"'$&").replaceAll('\"','\"\"')+'\"';const csv='\uFEFF'+[['STT','Lượt','Từ tiếng Anh','Nghĩa','Thời điểm hiển thị'],...d.history.map(e=>[e.sequence,e.cycle,e.word,e.vi,e.displayedAt])].map(row=>row.map(cell).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=el('a','');a.href=url;a.download='wordlive-lich-su-tu.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){$('notice').textContent=e.message;}};
