import test from 'node:test';
import assert from 'node:assert/strict';
import {parseTikTokChat} from './tiktok-chat.mjs';
import {Game} from './game.mjs';
test('Bình luận TikTok v3 vào game và ghi điểm đúng một lần',()=>{
 const game=new Game([{en:'apple',vi:'quả táo',hint:''}]);game.start();
 const chat=parseTikTokChat({common:{msgId:'101'},user:{id:'999',nickname:'Người xem thật'},content:'apple'},()=> 'fallback');
 assert.equal(chat.userId,'live:999');assert.equal(chat.text,'apple');assert.equal(game.comment(chat),40);assert.equal(game.comment(chat),false);assert.equal(game.comments[0].source,'live');
});
test('Đọc thời điểm gửi của TikTok theo giây thành mili giây',()=>{assert.equal(parseTikTokChat({common:{msgId:'x',createTime:'1793765595'},user:{id:'1'},content:'most'},()=> 'fallback').sentAt,1793765595000);});
test('Vẫn nhận định dạng chat cũ và không nhận dữ liệu thiếu danh tính/nội dung',()=>{
 assert.equal(parseTikTokChat({msgId:'a',userId:'b',nickname:'C',comment:'hello'},()=> 'x').text,'hello');
 assert.equal(parseTikTokChat({user:{id:'1'},content:''},()=> 'x'),null);
 assert.equal(parseTikTokChat({user:{id:'0'},content:'hello'},()=> 'x'),null);
});
