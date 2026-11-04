# WordLive — bản cobalt

## Chạy ứng dụng

Cần Node.js 22+. Mở START.cmd trong G:\WordLive, giữ cửa sổ đó mở rồi truy cập http://127.0.0.1:3210. Hoặc chạy `node server.mjs` trong thư mục dự án. Không cần bước build.

Màn hình dành cho OBS/LIVE Studio: http://127.0.0.1:3210/overlay. Dùng nguồn Browser 1080 × 1920; bảng điều khiển mở riêng tại trang chính. App không tự phát hình lên TikTok. Khả năng phát và nguồn trang web của LIVE Studio phụ thuộc tài khoản/phiên bản. Có thể dùng chụp cửa sổ trình duyệt nếu cần.

## Giao diện và hiệu ứng

Thiết kế theo wordlive.html: nền cobalt chấm bi, viền mực và bóng cứng, bố cục tối đa 960 px, LIVE 380 px, khoảng cách 44 px. Dưới 860 px xếp một cột; màu nền theo chế độ sáng/tối của máy. Hỗ trợ giảm chuyển động theo cài đặt hệ thống.

Có ô chữ rơi lệch nhịp, lật gợi ý, thanh cầu chì đổi màu, số đếm nhấp nhô trong 5 giây cuối, chat trượt vào, điểm nảy, hàng xếp hạng trượt, đáp án lật lần lượt, 30 mảnh pháo giấy nếu vòng có người đúng, logo lắc, chữ chạy 16 giây và nút lún khi nhấn. Bảng LIVE hiển thị top 4; chat giữ 3 dòng. Những hàng điểm phía sau vẫn giữ trạng thái để di chuyển vào top 4.

## Luật chơi và demo

App chuẩn bị một từ chưa dùng và tạm dừng khi mở máy chủ. Bộ mới có hơn 3.000 từ; mỗi lượt dùng hết bộ mới lặp. Chọn 20, 30 hoặc 45 giây; thay thời gian bắt đầu lại từ hiện tại. Mỗi vòng mở một chữ ở mốc còn 50%, thêm một chữ ở mốc còn 25%, luôn chừa ít nhất một chữ. Hết giờ hiển thị đáp án 5 giây rồi tự sang vòng tiếp.

Đúng được 10 + số giây còn lại làm tròn lên; mỗi mã người dùng ghi điểm một lần/vòng. Không phân biệt hoa/thường, chuẩn hóa Unicode và khoảng trắng. Cần trả lời toàn bộ từ, không phải câu chứa từ. Thời điểm tính điểm là lúc máy chủ nhận tin; chưa bù độ trễ LIVE.

Demo có 8 bot: Bảo Ngọc, Hoàng Nam, Khánh Linh, Thảo Vy, Quốc Bảo, Mai Chi, Đức Anh, Gia Hân. Mỗi bot thử một lần/vòng tại thời điểm ngẫu nhiên từ giây 1,5 đến trước khi hết giờ; khoảng 60% chọn đúng, còn lại chọn apple/happy/water/moon/sky. Minh Anh là tên thử mặc định thứ 9. Chỉ 9 tên này được cộng điểm ở demo; tên khác vẫn có bình luận. Có thể tắt bot trong mục “Kết nối TikTok LIVE & xuất điểm”.

Tạm dừng giữ thời gian và không nhận điểm. Tiếp tục chạy tiếp; Lật đáp án cũng dùng được khi đang tạm dừng. Nút Đặt lại điểm cần xác nhận, xóa điểm và sang từ chưa dùng tiếp theo; không xóa lịch sử từ. Khi kết nối LIVE thật, bot tắt và mọi người xem trả lời đúng đều có thể ghi điểm, không giới hạn 9 tên.

Điểm và bình luận lưu trong bộ nhớ, mất khi tắt máy chủ. Xuất CSV trong mục kết nối để lưu toàn bộ bảng điểm. Tải lại trang không xóa phiên. Demo có thể bị giả tên; không dùng cho trao giải có giá trị.

## TikTok LIVE thử nghiệm

Đã cài tiktok-live-connector 2.5.0 tại dự án này. Nhập username đang LIVE trong mục kết nối. App không yêu cầu mật khẩu/cookie và không đăng bình luận lên TikTok. Adapter là thư viện không chính thức, không phải API được TikTok bảo đảm; chưa được thử với phòng LIVE thật trong lần bàn giao này. Có thể lỗi do thay đổi giao thức, mạng, hạn mức, khu vực hoặc yêu cầu dịch vụ ký bên thứ ba.

Xem tài liệu, điều khoản và giấy phép trước khi dùng:
- https://github.com/zerodytrash/TikTok-Live-Connector
- https://ttlc.docs.isaackogan.com/
- https://developers.tiktok.com/

Chỉ dùng khi có quyền và phù hợp điều khoản áp dụng. App không xác nhận việc TikTok chấp thuận cách kết nối này. Nếu phiên bản connector cần khóa ký, có thể đặt biến môi trường phía máy chủ trong PowerShell:

```powershell
$env:TIKTOK_SIGN_API_KEY = 'khoa-cua-ban'
node server.mjs
```

Khóa không được đưa xuống trình duyệt. Dịch vụ ký có thể có phí/hạn mức riêng; app không tự đăng ký hoặc mua. Nếu kết nối lỗi, bot vẫn tắt để tránh nhầm trạng thái; chọn Dùng demo hoặc bật lại bot khi cần. Không tự kết nối lại khi mất mạng. Nên đặt lại điểm trước khi LIVE thật để xóa điểm demo.

## Lời dẫn và mã nguồn

Bản âm thanh mới có MC Google lưu sẵn trong public/voice; xem mục Nhạc nền & MC tự động bên dưới. Có thể chọn thêm giọng trình duyệt nếu máy hỗ trợ.

Font Bricolage Grotesque được tải từ Google Fonts; không có mạng thì dùng font hệ thống.

- public/index.html, style.css, app.js: giao diện và hiệu ứng.
- game.mjs: thời gian, bot, chấm điểm và bộ nhớ phiên.
- server.mjs: HTTP/SSE, điều khiển và adapter TikTok. SSE cập nhật 100 ms.
- words.json: bộ hơn 3.000 từ, sửa rồi khởi động lại.
- game.test.mjs: kiểm tra quy tắc; chạy `node --test`.
- package.json, pnpm-lock.yaml: thư viện và phiên bản đã khóa. Để cài lại dùng `pnpm install --frozen-lockfile`, hoặc `npm install` nếu dùng npm.

Adapter nguồn chat khác cần chuyển sự kiện được phép sử dụng thành `game.comment({id,userId,name,text,source:'live'})`, dùng mã tin nhắn duy nhất và mã người dùng ổn định. Không gửi lại chat cũ. Chống trùng giữ 10.000 mã gần nhất; 30 bình luận gần nhất được giữ trong phiên.

Máy chủ chỉ nghe 127.0.0.1, dùng trên máy cục bộ; chưa có đăng nhập/phân quyền để triển khai công khai. Không mở cổng này ra Internet.

## Kiểm tra

Đã chạy kiểm tra cho giới hạn 9 tên demo, chấm người LIVE bất kỳ, chống trùng, mốc gợi ý, khóa điểm khi hết giờ, chuyển vòng sau 5 giây, tạm dừng/tiếp tục, lật từ tạm dừng, bot gửi một lần, đặt lại và thời gian 20 giây. Kết nối TikTok thật, âm thanh phát thực tế và OBS/LIVE Studio cần thử trên tài khoản của bạn.

Bản giao diện trước nằm trong Tai-lieu/truoc-thiet-ke-cobalt-*.

## Nhạc nền & MC tự động (bản mới)

Mở START.cmd, vào trang chính và bấm **Bật âm thanh**. Trình duyệt yêu cầu thao tác này trước khi phát. Chọn giọng mặc định **Google tiếng Việt · tự tạo và lưu giọng**. Nút Nghe thử MC phát đoạn chào. Nhạc và MC không tự phát từ overlay; chỉ bật tiếng ở một cửa sổ điều khiển và thu âm cửa sổ/âm thanh hệ thống đó trong OBS hoặc LIVE Studio. Hãy thu thử một đoạn để kiểm tra cả nhạc lẫn tiếng nói đã vào luồng. Không chỉ thu nguồn overlay nếu âm thanh nằm ở cửa sổ điều khiển.

Nhạc mặc định: **EDM Detection Mode — Kevin MacLeod**, tải từ website tác giả. YouTube chính thức: https://www.youtube.com/watch?v=laHl-aFZUJI . Nhịp 128 BPM, mặc định phát/lặp giây **120–210**, chỉnh hai ô để chọn đoạn bạn thích. Giá trị kết thúc 0 nghĩa là phát đến hết bài rồi quay lại điểm bắt đầu. Nhạc không khởi động lại ở mỗi vòng chơi. Tệp MP3 gốc không bị sửa; app chỉ chọn đoạn khi phát.

Bài có giấy phép **CC BY 4.0**, miễn phí có điều kiện ghi nguồn; không phải public domain và không cam kết tránh mọi nhận diện tự động. Xem MUSIC-LICENSE.txt; bấm **Chép ghi nguồn cho LIVE**, dán vào mô tả LIVE/video và giữ dòng ghi nguồn trên hình. Lưu lại nguồn/giấy phép khi dùng. Dòng ghi nguồn nhạc riêng đồng bộ sang overlay trong cùng trình duyệt/profile.

Bạn thích nhạc quẩy cũ/drop kiểu “2 Phút Hơn” hoặc “Tuổi Trẻ Tương Lai”: app có chỗ chọn MP3/WAV riêng và chọn đoạn cao trào, nhưng **không cài sẵn các bản remix này khi chưa có quyền sử dụng**. Bài cũ hoặc được đăng YouTube không tự có nghĩa miễn bản quyền. Với mỗi bản ghi/remix phải kiểm tra đúng quyền phát và các điều kiện. Không tải/rip audio từ YouTube qua app; nhạc mặc định lấy từ kênh tải chính thức của tác giả.

Âm lượng nhạc mặc định 20%, MC 90%. Nhạc tự nhỏ khi MC nói. Có thể tắt riêng nhạc, MC hoặc âm báo. Khi game tạm dừng, MC dừng và nhạc hạ nhỏ. Các âm báo gồm tiếng ghi điểm, nhịp 5 giây cuối và âm công bố đáp án, được tổng hợp ngay trong app. Không có tiếng hét/âm lượng tăng đột ngột.

MC tự đọc nghĩa/gợi ý đầu vòng, nhắc khi mở chữ và còn 5 giây, đọc từ tiếng Anh khi công bố đáp án. Không đọc dồn mọi bình luận, không gửi chat người xem ra dịch vụ giọng nói. Vòng mới/hành động tạm dừng sẽ ngắt lời dẫn cũ. Cửa sổ bật âm thanh mới yêu cầu cửa sổ khác trong cùng profile/ngồn web tắt để tránh trùng; khác trình duyệt/profile thì bạn cần tự tắt cửa sổ còn lại.

22 tệp giọng có sẵn nằm trong public/voice, được tạo bằng gTTS (Google Translate TTS qua thư viện không chính thức, không API trả phí). Khi phát các từ mẫu, không cần mạng cho MC. Tùy chọn giọng hệ thống/Google của trình duyệt cũng xuất hiện nếu máy có, nhưng không được bảo đảm có sẵn hay giống nhau giữa các máy.

Khi sửa bộ từ/lời dẫn, tạo lại tệp bằng Python 3:

```powershell
python -m pip install gTTS==2.5.4
python tools/generate_voices.py --limit 6
```

Chỉ việc tạo lại giọng mới cần Internet và phụ thuộc dịch vụ bên ngoài; có thể bị hạn chế/thay đổi. Không cần Python để chạy bộ giọng đã kèm. Nếu lời dẫn mới chưa có tệp, app thông báo thay vì phát sai. Không có chức năng clone giọng trong bản này. Muốn dùng giọng của bạn: thu các câu tương ứng hoặc cung cấp mẫu riêng để thiết lập một quy trình clone có sự đồng ý; chưa tải giọng bạn lên bất kỳ dịch vụ nào.

Đã kiểm tra phát MP3 nền đúng từ giây 120, tệp MC Google phát được trong trình duyệt và hỗ trợ tải theo byte để tua nhạc. Âm thanh thực tế đi vào TikTok/OBS vẫn cần thu thử trên máy của bạn.

## GitHub & Vercel
Xem VERCEL.md để nhập repo lên Vercel. Vercel phục vụ màn hình phát; phần điều khiển/nhận chat vẫn chạy trên máy phát.


## Bộ hơn 3.000 từ và lịch sử không lặp (bản mới)

Bộ từ đã tăng lên hơn 3.000 từ tiếng Anh, mỗi từ một nghĩa tiếng Việt lấy từ PDF do chủ kênh cung cấp; xem VOCABULARY.md. Đã rà soát toàn bộ bằng AI; hiện có 3.262 từ, một nghĩa thông dụng mỗi từ. Chưa được chuyên gia ngôn ngữ thẩm định độc lập.

Game lưu thứ tự xáo, lượt và các từ đã hiển thị trong **data/word-progress.json**. Không lặp lại trong cùng lượt, kể cả bấm Vòng tiếp, đặt lại điểm hoặc mở lại app. Chỉ khi hết bộ mới mở lượt tiếp. Đặt lại điểm không còn quay về từ đầu. Khi chuyển máy, chép cả thư mục data; không xóa tệp tiến độ nếu muốn giữ lịch sử. Nút Xuất lịch sử nằm ở bàn điều khiển. Lịch sử bắt đầu từ phiên bản cập nhật, không khôi phục các vòng trước khi tính năng này tồn tại.

Máy chủ mở lại sẽ chuẩn bị một từ chưa dùng và tạm dừng, bot mặc định tắt. Bấm Tiếp tục khi sẵn sàng. Lịch sử được ghi khi từ được chọn để hiển thị, không đợi người chơi đoán đúng. Đổi thời gian trong cùng vòng không xóa tiến độ từ.

MC Google với từ mới được tạo khi cần rồi lưu vào work/voice-cache. Lần đầu đọc từ mới cần Internet; các lần sau dùng tệp đã lưu. Nhạc/MC không bị đóng gói thành hàng nghìn yêu cầu tạo giọng cùng lúc. Chỉ gửi lời dẫn/đáp án của vòng hiện tại tới dịch vụ, không gửi bình luận hoặc thông tin người chơi.

Trên máy này runtime giọng đã được cấu hình. Khi cài trên máy khác, cần Python 3 và chạy:

```powershell
python -m pip install --target work/tts-runtime gTTS==2.5.4
```

Nếu Python không có trong PATH, đặt WORDLIVE_PYTHON thành đường dẫn python.exe trước khi chạy START.cmd. Mã nguồn và dữ liệu không cần Python để chơi; Python chỉ dùng khi cần tạo tệp giọng mới. Có thể chọn giọng vi-VN của trình duyệt nếu máy có giọng đó.
