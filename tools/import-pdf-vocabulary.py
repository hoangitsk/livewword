"""Import the user's Oxford vocabulary PDF; never upload the original PDF."""
import json, re, sys
from pathlib import Path
import pdfplumber

root = Path(__file__).resolve().parent.parent
source = Path(sys.argv[1])
rows = []
with pdfplumber.open(source) as doc:
    for page in doc.pages:
        for table in page.find_tables():
            if len(table.rows) < 4:
                continue
            for row, cells in zip(table.rows, table.extract()):
                en = re.sub(r'\s+', ' ', cells[0] or '').strip().lower()
                pos = re.sub(r'\s+', ' ', cells[1] or '').strip() if len(cells)>1 else ''
                if not re.fullmatch('[a-z]{2,16}', en) or pos == 'Type':
                    continue
                y0, y1 = row.bbox[1], row.bbox[3]
                meaning = page.crop((414, y0, page.width, y1)).extract_text() or ''
                meaning = re.sub(r'\s+', ' ', meaning).replace('DỤNG NHẤT', '').strip()
                rows.append(dict(en=en, vi=meaning, pos=pos))
fixes = {
    'accommodation':'chỗ ở','adapt':'thích nghi','actually':'thực ra','advertise':'quảng cáo',
    'agency':'cơ quan','aged':'có tuổi','abroad':'ở nước ngoài','access':'quyền truy cập',
    'absorb':'hấp thụ','abuse':'lạm dụng','accent':'giọng nói','acquire':'đạt được',
    'activity':'hoạt động','active':'năng động','actively':'một cách tích cực',
    'admit':'thừa nhận','advance':'sự tiến bộ','addition':'phép cộng','academic':'thuộc học thuật',
    'affair':'sự việc','afford':'có đủ khả năng chi trả','aim':'mục tiêu','aid':'sự giúp đỡ',
    'alarmed':'hoảng sợ','alarming':'đáng lo ngại','alcoholic':'người nghiện rượu',
    'allied':'thuộc phe đồng minh','ally':'đồng minh','amazing':'đáng kinh ngạc',
    'able':'có khả năng','able-bodied':'khỏe mạnh','medical':'thuộc y khoa',
    'can':'có thể','will':'sẽ','may':'có lẽ','would':'sẽ','should':'nên','must':'phải',
    'have':'có','get':'nhận được','make':'làm','take':'lấy','do':'làm','be':'thì là',
    'mean':'có nghĩa là','present':'món quà','spring':'mùa xuân','fall':'rơi',
    'bank':'ngân hàng','patient':'bệnh nhân','fine':'tốt','kind':'tử tế','right':'đúng',
    'left':'bên trái','light':'ánh sáng','watch':'đồng hồ đeo tay','match':'trận đấu',
    'fair':'công bằng','lie':'nói dối','miss':'bỏ lỡ','hard':'khó','well':'khỏe mạnh',
    'essential':'thiết yếu','evening':'buổi tối','evidence':'bằng chứng','equipment':'thiết bị',
    'crack':'vết nứt','commit':'cam kết','cooker':'bếp nấu','impress':'gây ấn tượng',
    'fund':'quỹ','grant':'cấp cho','great':'tuyệt vời','her':'cô ấy','him':'anh ấy',
    'household':'hộ gia đình','joint':'khớp nối','lost':'bị lạc','male':'nam giới',
    'meaning':'ý nghĩa','might':'có lẽ','ministry':'bộ ngành','mount':'leo lên',
    'mrs':'bà','ms':'cô','outline':'dàn ý','parent':'cha hoặc mẹ','pot':'nồi',
    'public':'công cộng','quarter':'một phần tư','ride':'cưỡi','royal':'thuộc hoàng gia',
    'she':'cô ấy','since':'kể từ','suck':'hút','superior':'vượt trội','target':'mục tiêu',
    'throat':'cổ họng','touch':'chạm','walk':'đi bộ','you':'bạn','chest':'ngực',
    'clap':'vỗ tay','collapse':'sụp đổ','fail':'thất bại','false':'sai',
    'forgive':'tha thứ','generate':'tạo ra','general':'chung','listen':'lắng nghe',
    'news':'tin tức','oh':'ôi','pass':'vượt qua','period':'giai đoạn',
    'role':'vai trò','shell':'vỏ sò','strangely':'một cách kỳ lạ',
    'congratulations':'lời chúc mừng','characteristic':'đặc trưng',
    'disappointment':'sự thất vọng','representative':'người đại diện',
}
fixes.update({'from':'từ','cupboard':'tủ đựng đồ','gallon':'đơn vị đo thể tích galông','pint':'đơn vị đo thể tích panh','only':'chỉ','player':'người chơi','spoken':'được nói ra','wednesday':'thứ tư','your':'của bạn','yours':'của bạn','yourself':'chính bạn','abandon':'từ bỏ','absent':'vắng mặt','alphabetical':'thuộc bảng chữ cái','good':'tốt','bad':'xấu','smart':'thông minh','strong':'mạnh mẽ'})
names={'n':'Danh từ','v':'Động từ','adj':'Tính từ','adv':'Trạng từ','prep':'Giới từ','conj':'Liên từ','pron':'Đại từ','det':'Từ hạn định','modal':'Động từ khuyết thiếu','prefix':'Tiền tố','exclamation':'Thán từ'}
out=[]; seen=set(); rejected=[]
for row in rows:
    en=row['en']
    if en in seen: continue
    vi=fixes.get(en, row['vi'])
    vi=re.sub(r'\([^)]*\)', '',vi)
    vi=re.split(r'[,;]|\.\s|\b(?:US|UK):',vi)[0].strip(' .:;')
    vi=re.sub(r'\s+',' ',vi)
    if not vi or len(vi)>65 or re.search(r'[əæʃʌɳʤˈ]',vi):
        rejected.append(row); continue
    seen.add(en)
    pos=re.split(r'[,\s]',row['pos'])[0]
    out.append(dict(en=en,vi=vi,pos=pos,hint=f"{names.get(pos,'Từ vựng')} · {len(en)} chữ cái. Bạn đoán được từ này không?"))
(root/'work/pdf-import').mkdir(exist_ok=True,parents=True)
(root/'work/pdf-import/raw.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
(root/'work/pdf-import/rejected.json').write_text(json.dumps(rejected,ensure_ascii=False,indent=2),encoding='utf-8')
overrides=json.loads((root/'tools/vocabulary-overrides.json').read_text(encoding='utf-8'))
out=[w for w in out if w['en']!='suf']
for w in out:
    value=overrides.get(w['en'])
    if isinstance(value,list): w['vi'],w['pos']=value
    elif value: w['vi']=value
    w['hint']=f"{names.get(w['pos'],'Từ vựng')} · {len(w['en'])} chữ cái. Bạn đoán được từ này không?"
out.sort(key=lambda w:w['en'])
(root/'words.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'imported':len(out),'raw':len(rows),'rejected':len(rejected)}))
