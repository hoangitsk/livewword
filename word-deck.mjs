const key=word=>String(word).normalize('NFKC').trim().toLowerCase();
export class WordDeck {
 constructor(words,{state=null,random=Math.random,save=()=>{},now=()=>new Date().toISOString()}={}){
  this.words=words;this.random=random;this.save=save;this.now=now;this.ids=words.map(w=>key(w.en));
  if(!this.ids.length||new Set(this.ids).size!==this.ids.length)throw Error('Bộ từ rỗng hoặc có từ tiếng Anh trùng nhau.');
  this.indices=new Map(this.ids.map((id,i)=>[id,i]));
  if(state&&(state.version!==1||!Array.isArray(state.history)||!Array.isArray(state.remaining)||!Number.isInteger(state.cycle)||state.cycle<1))throw Error('Lịch sử từ không hợp lệ. Không tự xóa để tránh lặp lại từ.');
  this.state=state?structuredClone(state):{version:1,cycle:1,history:[],remaining:[]};
  const shown=new Set(this.state.history.filter(e=>e.cycle===this.state.cycle).map(e=>e.word));
  this.state.remaining=[...new Set(this.state.remaining)].filter(id=>this.indices.has(id)&&!shown.has(id));
  const queued=new Set(this.state.remaining);const added=this.ids.filter(id=>!shown.has(id)&&!queued.has(id));
  this.state.remaining.push(...this.shuffle(added));
 }
 shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 draw(prefer){const next=structuredClone(this.state);if(!next.remaining.length){next.cycle++;next.remaining=this.shuffle(this.ids);const last=next.history.at(-1)?.word;if(next.remaining.length>1&&next.remaining[0]===last)[next.remaining[0],next.remaining[1]]=[next.remaining[1],next.remaining[0]];}
  if(prefer){const chosen=next.remaining.findIndex(id=>prefer(this.words[this.indices.get(id)]));if(chosen>0){const [id]=next.remaining.splice(chosen,1);next.remaining.unshift(id);}}
  const word=next.remaining.shift(),index=this.indices.get(word);next.history.push({sequence:next.history.length+1,cycle:next.cycle,word,vi:this.words[index].vi,displayedAt:this.now()});
  this.save(next);this.state=next;return index;
 }
 progress(){const shown=new Set(this.state.history.filter(e=>e.cycle===this.state.cycle&&this.indices.has(e.word)).map(e=>e.word));return {total:this.ids.length,cycle:this.state.cycle,shown:shown.size,remaining:this.state.remaining.length,totalDisplayed:this.state.history.length};}
 history(){return structuredClone(this.state.history);}
}
