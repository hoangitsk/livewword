import {WordDeck} from './word-deck.mjs';
export const normalize=v=>String(v).normalize('NFKC').trim().toLowerCase().replace(/\s+/g,' ');
export const NAMES=['Bảo Ngọc','Hoàng Nam','Khánh Linh','Thảo Vy','Quốc Bảo','Mai Chi','Đức Anh','Gia Hân','Minh Anh'];
export class Game {
 constructor(words,now=()=>Date.now(),random=Math.random,options={}){this.words=words;this.deck=options.deck||new WordDeck(words,{random:options.deckRandom||random});this.now=now;this.random=random;this.duration=30;this.demo=true;this.players=new Map();this.seen=new Set();this.comments=[];this.index=this.deck.draw();this.round=1;this.phase='ready';this.remaining=30000;this.deadline=0;this.winners=new Set();this.revealed=0;this.bots=[];this.generation=0;this.scoringWindows=[];this.seed();}
 seed(){for(const name of NAMES)this.players.set(`demo:${normalize(name)}`,{id:`demo:${normalize(name)}`,name,score:0,wins:0});}
 get word(){return this.words[this.index];}
 plan(){this.generation++;this.bots=NAMES.slice(0,8).map(name=>({name,at:1500+this.random()*(this.duration*1000-6500),ok:this.random()<.6,sent:false}));}
 openScoring(){this.scoringWindows.push({word:this.word.en,round:this.deck.progress().totalDisplayed,start:this.now(),end:this.deadline,deadline:this.deadline,winners:this.winners});this.scoringWindows=this.scoringWindows.slice(-20);}
 closeScoring(){const w=this.scoringWindows.at(-1);if(w)w.end=Math.min(w.end,this.now());}
 start(){if(this.phase==='ready'){this.phase='playing';this.deadline=this.now()+this.remaining;this.plan();this.openScoring();}else if(this.phase==='paused'){this.phase=this.resumePhase;this.deadline=this.now()+this.remaining;if(this.phase==='playing')this.openScoring();}}
 pause(){this.tick();if(['playing','answer'].includes(this.phase)){this.closeScoring();this.remaining=Math.max(0,this.deadline-this.now());this.resumePhase=this.phase;this.phase='paused';}}
 next(){this.closeScoring();this.index=this.deck.draw();this.round++;this.winners=new Set();this.revealed=0;this.phase='playing';this.remaining=this.duration*1000;this.deadline=this.now()+this.remaining;this.plan();this.openScoring();}
 reveal(){if(this.phase!=='playing'&&!(this.phase==='paused'&&this.resumePhase==='playing'))return;this.closeScoring();this.phase='answer';this.revealed=this.word.en.length;this.deadline=this.now()+5000;}
 reset(){this.honor=null;this.scoringWindows=[];this.seen.clear();this.players.clear();this.seed();this.comments=[];this.next();}
 setDuration(n){this.closeScoring();this.duration=n;this.remaining=n*1000;this.winners=new Set();this.revealed=0;this.phase='ready';this.start();}
 tick(){if(!['playing','answer'].includes(this.phase))return;const left=this.deadline-this.now();if(left<=0){if(this.phase==='playing')this.reveal();else this.next();return;}if(this.phase==='playing'){const ratio=left/(this.duration*1000);this.revealed=Math.min(this.word.en.length-1,ratio<=.25?2:ratio<=.5?1:0);if(this.demo){const elapsed=this.duration*1000-left;for(const b of this.bots){if(!b.sent&&elapsed>=b.at){b.sent=true;const wrong=['apple','happy','water','moon','sky'];this.accept({id:`bot:${this.round}:${this.generation}:${b.name}`,userId:`demo:${normalize(b.name)}`,name:b.name,text:b.ok?this.word.en:wrong[Math.floor(this.random()*wrong.length)],source:'demo'});}}}}}
 comment(data){this.tick();return this.accept(data);}
 accept({id,userId,name,text,source='demo',sentAt}){
  if(!id||!userId||!name||!text||this.seen.has(id))return false;
  this.seen.add(id);if(this.seen.size>10000)this.seen.delete(this.seen.values().next().value);
  let points=0;const eligible=source==='live'||NAMES.some(n=>normalize(n)===normalize(name));
  const now=this.now(),timed=source==='live'&&Number.isFinite(sentAt);
  // A delayed LIVE comment belongs to the round active when TikTok sent it.
  // Keep a bounded 90-second allowance; reveal/pause intervals never score.
  const window=timed&&sentAt<=now+1000&&now-sentAt<=90000
   ?this.scoringWindows.findLast(w=>sentAt>=w.start&&sentAt<w.end)
   :!timed&&this.phase==='playing'?this.scoringWindows.at(-1):null;
  if(eligible&&this.phase!=='paused'&&window&&!window.winners.has(userId)&&normalize(text)===normalize(window.word)){
   points=10+Math.max(0,Math.ceil((window.deadline-(timed?sentAt:now))/1000));
   window.winners.add(userId);const p=this.players.get(userId)||{id:userId,name,score:0,wins:0};p.name=name;p.score+=points;p.wins++;
   p.correctRounds=[...new Set([...(p.correctRounds||[]),window.round])].sort((a,b)=>a-b).slice(-100);
   const eventTime=timed?sentAt:now,previous=p.lastCorrectRound??p.correctRounds.filter(n=>n!==window.round).at(-1);
   if(eventTime>=(p.lastStreakEventAt||0)&&window.round>=(p.lastCorrectRound||0)){
    p.streak=previous===window.round-1?(p.streak||0)+1:1;p.lastCorrectRound=window.round;p.lastStreakEventAt=eventTime;
    p.bestStreak=Math.max(p.bestStreak||0,p.streak);
    if(p.streak%3===0&&window.round>(p.lastHonorRound||0)){p.lastHonorRound=window.round;this.honor={id:`${userId}:${window.round}`,userId,name,streak:p.streak,expiresAt:now+5000};}
   }
   this.players.set(userId,p);
  }
  if(eligible&&this.phase!=='paused'&&window&&normalize(text)!==normalize(window.word)){
   const p=this.players.get(userId),eventTime=timed?sentAt:now;
   if(p&&eventTime>=(p.lastStreakEventAt||0)){p.streak=0;p.lastStreakEventAt=eventTime;if(this.honor?.userId===userId)this.honor=null;}
  }
  this.comments.unshift({id,userId,name:String(name).slice(0,40),text:String(text).slice(0,180),points,source,...(timed?{sentAt}:{}),receivedAt:now});this.comments=this.comments.slice(0,30);return points;
 }

 currentStreak(p){const last=p.lastCorrectRound??p.correctRounds?.at(-1),current=this.deck.progress().totalDisplayed;const playing=this.phase==='playing'||(this.phase==='paused'&&this.resumePhase==='playing');return last===current||(playing&&last===current-1)?p.streak||0:0;}
 snapshot(){this.tick();const effective=this.phase==='paused'?this.resumePhase:this.phase;const answer=effective==='answer';const ms=['playing','answer'].includes(this.phase)?Math.max(0,this.deadline-this.now()):this.remaining;return {round:this.round,generation:this.generation,phase:this.phase,duration:this.duration,seconds:Math.ceil(ms/1000),remainingMs:ms,vi:this.word.vi,hint:this.word.hint,letters:[...this.word.en].map((c,i)=>answer||i<this.revealed?c:'·'),answer:answer?this.word.en:null,winners:this.winners.size,leaders:[...this.players.values()].map(p=>({...p,streak:this.currentStreak(p)})).sort((a,b)=>b.score-a.score||NAMES.indexOf(a.name)-NAMES.indexOf(b.name)),honor:this.honor?.expiresAt>this.now()?this.honor:null,comments:this.comments,demo:this.demo,deck:this.deck.progress()};}
}

