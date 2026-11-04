const MINUTE=60000;
export const TOPICS=[
 {id:'food',label:'Đồ ăn',code:'1',words:'apple banana beef beer biscuit bread breakfast butter cabbage cake candy carrot cheese chicken chocolate coffee cook cookie cooking corn cream cup dessert diet dinner dish drink eat egg fish flour food fork fruit grape honey hungry ice juice lemon lunch meal meat milk onion orange pepper pie plate pork potato rice salad salt sandwich sauce sausage soup spoon steak sugar sweet taste tea tomato vegetable water wine yogurt'.split(' ')},
 {id:'love',label:'Tình cảm',code:'2',words:'admiration admire affection afraid alone angry anxiety anxious aunt baby beautiful beauty beloved boyfriend brave bride brother calm care caring cheerful child couple cry dad daughter dear delight delighted emotion emotional family father fear feel feeling friend friendly friendship girlfriend glad grateful happiness happy hate hatred heart honest hope hug husband jealous joy kind kindness kiss laugh lonely love lovely lover marriage married marry miss mother mum nervous nice parent peace pleasure proud romance romantic sad sadness smile son sorry soul surprise surprised sympathy thank trust uncle upset wedding wife wish worried worry'.split(' ')},
 {id:'school',label:'Trường học',code:'3',words:'answer art bag bell biology blackboard board book bookshelf calculate calculation chemistry class classroom clock college computer course desk dictionary diploma discuss discussion educate education essay exam examination exercise geography grammar history homework knowledge language learn learner lesson letter library listen literature mark mathematics notebook note page paper pen pencil physics pupil question read reading ruler school science scientist scissors score spell spelling student study subject teach teacher teaching term test textbook timetable training university vocabulary word write writer writing'.split(' ')}
];
export class Engagement {
 constructor(game,state={}){
  this.game=game;this.roundNumber=(state.roundNumber||0)+1;this.normalCount=(state.normalCount||0)+1;
  this.recent=[...(state.recent||[]),game.words[game.index].en].slice(-10);this.reviewQueue=[];this.reviewBatchAt=state.reviewBatchAt||0;this.isReview=false;
  this.stage=state.stage&&Number.isFinite(state.stage.remainingMs)?structuredClone(state.stage):{number:1,remainingMs:10*MINUTE,scores:{}};
  this.completed=state.completed||[];this.activeTopic=state.activeTopic||'mixed';this.scoreMode=state.scoreMode||'auto';this.votes=new Map(state.votes||[]);this.lastClock=game.now();this.lastCommand=new Map();this.noticeQueue=[];this.notice=null;
 }
 tick(active){const now=this.game.now(),delta=Math.max(0,now-this.lastClock);this.lastClock=now;if(active)this.stage.remainingMs=Math.max(0,this.stage.remainingMs-delta);if(this.notice&&this.notice.expiresAt<=now)this.notice=null;if(!this.notice&&this.noticeQueue.length)this.notice={...this.noticeQueue.shift(),expiresAt:now+5000};}
 notify(title,name,detail,id){const n={id:id||`${this.game.now()}:${this.noticeQueue.length}`,title,name,detail};if(!this.notice)this.notice={...n,expiresAt:this.game.now()+5000};else{this.noticeQueue.push(n);this.noticeQueue=this.noticeQueue.slice(-20);}}
 leaders(stage=this.stage){return Object.entries(stage.scores).map(([id,p])=>({id,...p})).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));}
 beforeNext(){
  if(this.stage.remainingMs===0){const leaders=this.leaders();this.completed.push({...structuredClone(this.stage),leaders});this.completed=this.completed.slice(-6);if(leaders[0])this.notify('🏆 VÔ ĐỊCH CHẶNG '+this.stage.number,leaders[0].name,leaders[0].score+' điểm · Chặng mới ai cũng có cơ hội!');this.stage={number:this.stage.number+1,remainingMs:10*MINUTE,scores:{}};}
  if(!this.isReview&&this.normalCount%30===0){const counts=TOPICS.map(t=>({id:t.id,n:[...this.votes.values()].filter(v=>v===t.id).length}));const max=Math.max(...counts.map(c=>c.n));if(max>0)this.activeTopic=counts.find(c=>c.n===max).id;this.votes.clear();}
  this.roundNumber++;
  if(this.reviewQueue.length){this.isReview=true;return this.reviewQueue.shift();}
  if(!this.isReview&&this.normalCount%10===0&&this.reviewBatchAt!==this.normalCount){this.reviewBatchAt=this.normalCount;const candidates=[...new Set(this.recent.slice(0,-1))];this.reviewQueue=this.game.deck.shuffle(candidates).slice(0,2);this.isReview=true;return this.reviewQueue.shift()||null;}
  this.isReview=false;return null;
 }
 normalWord(word){this.normalCount++;this.recent.push(word.en);this.recent=this.recent.slice(-10);}
 prefer(word){const topic=TOPICS.find(t=>t.id===this.activeTopic);return !topic||topic.words.includes(word.en);}
 get multiplier(){return this.roundNumber%5===0?2:1;}
 score(player,points,window){
  let stage=this.stage.number===window.stage?this.stage:this.completed.find(s=>s.number===window.stage);if(stage){const p=stage.scores[player.id]||{name:player.name,score:0,wins:0};p.name=player.name;p.score+=points;p.wins++;stage.scores[player.id]=p;if(stage!==this.stage)stage.leaders=this.leaders(stage);}
  const badges=new Set(player.badges||[]),rank=[...this.game.players.values()].filter(p=>p.score>player.score).length+1;
  for(const [id,ok,title]of [['first',player.wins>=1,'Đáp án đúng đầu tiên'],['three',player.wins>=3,'Đã nhớ 3 từ'],['hundred',player.score>=100,'Cột mốc 100 điểm'],['top10',rank<=10&&player.score>0,'Lần đầu vào top 10']])if(ok&&!badges.has(id)){badges.add(id);this.notify('🎯 HOÀN THÀNH THỬ THÁCH',player.name,title,`${player.id}:${id}`);}
  player.badges=[...badges];
 }
 command(chat){
  const text=chat.text.normalize('NFKC').trim().toLowerCase();if(!/^!(?:diem|điểm|chuoi|chuỗi|vote)(?:\s|$)/.test(text))return null;
  const now=this.game.now();if(now-(this.lastCommand.get(chat.userId)??-Infinity)<2500)return '';this.lastCommand.set(chat.userId,now);
  const vote=/^!vote\s+([123])$/.exec(text);if(vote){const topic=TOPICS.find(t=>t.code===vote[1]);this.votes.set(chat.userId,topic.id);return `${chat.name} chọn ${topic.label} ✓`;}
  if(text.startsWith('!vote'))return 'Chọn chủ đề: !vote 1 Đồ ăn · !vote 2 Tình cảm · !vote 3 Trường học';
  const p=this.game.players.get(chat.userId);const score=p?.score||0,streak=p?this.game.currentStreak(p):0;const rank=score?[...this.game.players.values()].filter(x=>x.score>score).length+1:'—';
  return `${chat.name}: ${score} đ · hạng ${rank} · chuỗi ${streak} 🔥 · ${Math.min(p?.wins||0,3)}/3 từ · ${Math.min(score,100)}/100 đ`;
 }
 snapshot(){
  const g=this.game,seconds=Math.ceil(this.stage.remainingMs/1000),rescue=[...g.players.values()].map(p=>({...p,streak:g.currentStreak(p)})).filter(p=>p.streak%3===2).sort((a,b)=>b.streak-a.streak)[0];
  const topic=TOPICS.find(t=>t.id===this.activeTopic),actualTopic=topic?.words.includes(g.word.en)||this.isReview?topic:null;return {topicVoteIn:this.normalCount%30===0&&!this.isReview?0:30-this.normalCount%30,version:'2026-11-04-retention-1',scoreMode:this.scoreMode,roundNumber:this.roundNumber,multiplier:this.multiplier,isReview:this.isReview,stage:{number:this.stage.number,seconds,leaders:this.leaders().slice(0,10),previous:this.completed.at(-1)?{number:this.completed.at(-1).number,winner:this.leaders(this.completed.at(-1))[0]||null}:null},topics:TOPICS.map(t=>({id:t.id,label:t.label,code:t.code,votes:[...this.votes.values()].filter(id=>id===t.id).length})),topic:actualTopic?.label||'Tổng hợp',nextBonusIn:(5-this.roundNumber%5)%5||5,rescue:rescue?{name:rescue.name,streak:rescue.streak,target:rescue.streak+1}:null,notice:this.notice,mission:'Đúng 3 từ · Ghi 100 điểm · Lọt top 10',reviewIn:10-this.normalCount%10};
 }
 reset(){this.stage={number:this.stage.number+1,remainingMs:10*MINUTE,scores:{}};this.completed=[];this.notice=null;this.noticeQueue=[];this.votes.clear();}
 export(){return {votes:[...this.votes],version:'2026-11-04-retention-1',scoreMode:this.scoreMode,roundNumber:this.roundNumber,normalCount:this.normalCount,recent:this.recent,reviewBatchAt:this.reviewBatchAt,stage:this.stage,completed:this.completed,activeTopic:this.activeTopic};}
}
