"""Đọc nội dung từ stdin, chỉ được gọi bởi máy chủ WordLive."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'work'/'tts-runtime'))
from gtts import gTTS
if __name__=='__main__':
 lang,output=sys.argv[1:3]
 if lang not in ('vi','en'):raise ValueError('Unsupported language')
 text=sys.stdin.buffer.read().decode('utf8')
 path=Path(output)
 path.parent.mkdir(parents=True,exist_ok=True)
 temp=path.with_suffix('.tmp')
 gTTS(text,lang=lang,timeout=12).save(str(temp))
 temp.replace(path)
