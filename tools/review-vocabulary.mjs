import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const words=JSON.parse(await fs.readFile(new URL('words.json',root),'utf8'));
const overrides=JSON.parse(await fs.readFile(new URL('tools/vocabulary-overrides.json',root),'utf8'));
const names={n:'Danh từ',v:'Động từ',adj:'Tính từ',adv:'Trạng từ',prep:'Giới từ',conj:'Liên từ',pron:'Đại từ',det:'Từ hạn định',modal:'Động từ khuyết thiếu',prefix:'Tiền tố',exclamation:'Thán từ'};
const changes=[],reviewed=[];
for(const word of words){
 if(word.en==='suf'){changes.push({en:word.en,before:word.vi,after:'',beforePos:word.pos,afterPos:'',reason:'Loại mục lỗi tách chữ không phải từ độc lập'});continue;}
 const value=overrides[word.en],vi=Array.isArray(value)?value[0]:value||word.vi,pos=Array.isArray(value)?value[1]:word.pos;
 if(!names[pos]||!vi||/[;,]/.test(vi)||vi.length>65)throw Error('Mục không hợp lệ: '+word.en);
 if(vi!==word.vi||pos!==word.pos)changes.push({en:word.en,before:word.vi,after:vi,beforePos:word.pos,afterPos:pos,reason:'Chỉnh nghĩa thông dụng, chính tả hoặc loại từ'});
 reviewed.push({...word,vi,pos,hint:`${names[pos]} · ${word.en.length} chữ cái. Bạn đoán được từ này không?`});
}
if(reviewed.length<3000||new Set(reviewed.map(w=>w.en)).size!==reviewed.length)throw Error('Bộ từ không đủ hoặc có từ trùng');
await fs.mkdir(new URL('work/vocabulary-review/',root),{recursive:true});
if(changes.length){await fs.writeFile(new URL('work/vocabulary-review/before.json',root),JSON.stringify(words,null,2)+'\n');
await fs.writeFile(new URL('work/vocabulary-review/changes.json',root),JSON.stringify(changes,null,2)+'\n');}
await fs.writeFile(new URL('words.json',root),JSON.stringify(reviewed,null,2)+'\n');
console.log(JSON.stringify({reviewed:words.length,retained:reviewed.length,changed:changes.filter(c=>c.after).length,removed:changes.filter(c=>!c.after).length}));
