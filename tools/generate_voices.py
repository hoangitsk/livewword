"""Tạo lại 22 lời dẫn tiếng Việt/Anh. Cần: pip install gTTS==2.5.4
Dịch vụ Google Translate qua gTTS (không chính thức), cần mạng lúc tạo.
Khi phát game, chỉ sử dụng MP3 đã lưu; không gửi chat người xem ra dịch vụ.
"""
import json
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from gtts import gTTS
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public'/'voice'
OUT.mkdir(parents=True,exist_ok=True)
words=json.loads((ROOT/'words.json').read_text(encoding='utf-8-sig'))
items=[('vi','Chào mừng bạn đến với WordLive! Đoán thật nhanh để ghi điểm nhé!'),('vi','Một chữ đã mở. Bạn đoán được chưa?'),('vi','Còn năm giây. Chốt đáp án nào!'),('vi','Đáp án là')]
for word in words:
 items.extend([('vi',f"Từ mới nhé. {word['vi']}. {word['hint']} Đoán từ tiếng Anh nào!"),('en',word['en']),('vi',word['vi']+'.')])
def generate(pair):
 index,(lang,text)=pair
 name=f'cue-{index:02d}.mp3'
 gTTS(text,lang=lang,timeout=20).save(str(OUT/name))
 return f'{lang}:{text}',name
if __name__=='__main__':
 with ThreadPoolExecutor(max_workers=3) as pool:
  manifest=dict(pool.map(generate,enumerate(items)))
 (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
 print(f'Da tao {len(manifest)} doan MC.')
