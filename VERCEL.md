# Triển khai lên Vercel

Repo này có sẵn vercel.json và lệnh build. Trong Vercel chọn Import Git Repository → hoangitsk/livewword; giữ Root Directory ở gốc, Framework Preset Other. Build: node tools/build-vercel.mjs; Output Directory: dist. Node.js 22+.

Vercel chỉ phục vụ **màn hình phát chỉ xem** tại /overlay. Trang / tự chuyển sang /overlay. Tệp nhạc và lời dẫn là nội dung tĩnh. Hàm GET /api/state nhận trạng thái qua nguồn HTTPS hiện có; các lệnh quản trị không triển khai trên Vercel.

Mặc định dữ liệu lấy từ https://wordlive-yniem-live.stilldandelion.chatgpt.site, đang nối về máy phát. Có thể đặt LIVE_ORIGIN thành nguồn Sites HTTPS khác do bạn quản lý. Không đặt biến này về chính website Vercel hoặc tên miền đang trỏ về Vercel vì sẽ tạo vòng lặp. Giá trị không phải khóa đăng nhập; chỉ dùng URL gốc, không thêm /overlay.

**Vẫn cần chạy game trên máy**: START.cmd → http://127.0.0.1:3210/. Máy phát xử lý chat TikTok, chấm điểm, thời gian, nhạc/MC. Nguồn chỉ xem và đường truyền HTTPS phải hoạt động. Bản này chưa chuyển việc giữ vòng chơi và nhận chat sang một máy chủ đám mây chạy liên tục. Không được hiểu là chỉ bấm Deploy là có game LIVE độc lập hoàn toàn.

URL https://live.yniemdienanh.id.vn/overlay hiện được gắn với Sites. Import repo vào Vercel không tự chuyển DNS của tên miền đó; địa chỉ Sites vẫn hoạt động. Có thể đổi sang Vercel sau nếu cần, theo bản ghi DNS Vercel cấp.

Các thư mục bin/, work/, Tai-lieu/, node_modules/, live-site/ và .env* không đưa lên GitHub. Không chứa thông tin đăng nhập Tenten, GitHub hoặc Vercel. live-site là bản triển khai trung gian riêng đã được quản lý trong kho nguồn Sites.

Chạy kiểm tra: node --test. Chạy thử build: node tools/build-vercel.mjs.

Giấy phép bài nhạc trong MUSIC-LICENSE.txt phải được giữ nguyên khi chia sẻ/triển khai mã nguồn.
