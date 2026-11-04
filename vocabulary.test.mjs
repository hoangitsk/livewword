import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const words=JSON.parse(readFileSync(new URL('./words.json',import.meta.url),'utf8'));
test('Các lỗi nghĩa và lỗi nhập PDF đã được sửa không quay lại',()=>{
 const expected={smart:'thông minh',strong:'mạnh mẽ',school:'trường học',dinner:'bữa tối',drawer:'ngăn kéo',garbage:'rác thải',mall:'trung tâm thương mại',receipt:'biên lai',sweater:'áo len',truck:'xe tải',wind:'gió',whole:'toàn bộ',financial:'thuộc tài chính',anniversary:'ngày kỷ niệm'};
 for(const [en,vi] of Object.entries(expected))assert.equal(words.find(w=>w.en===en)?.vi,vi,en);
 assert.ok(!words.some(w=>w.en==='suf'));
});
test('Toàn bộ bộ từ đã rà có một nghĩa, loại từ hợp lệ và không có mảnh phiên âm',()=>{
 const allowed=new Set(['n','v','adj','adv','prep','conj','pron','det','modal','prefix','exclamation']);
 assert.equal(words.length,3262);
 for(const w of words){assert.ok(allowed.has(w.pos),w.en);assert.ok(w.vi.length>0&&w.vi.length<=65,w.en);assert.ok(!/[;,]|[əæʃʌɳʤˈ]/.test(w.vi),w.en);}
});
