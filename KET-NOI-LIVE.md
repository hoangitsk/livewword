# Kết nối tên miền LIVE

Địa chỉ màn hình phát: https://live.yniemdienanh.id.vn/overlay
Địa chỉ dự phòng: https://wordlive-yniem-live.stilldandelion.chatgpt.site/overlay
Bàn điều khiển riêng: http://127.0.0.1:3210/

Tên miền phụ đã gắn với Sites; DNS Tenten được thêm ba bản ghi (CNAME live và hai TXT xác minh). Các bản ghi website chính, wf và _vercel được giữ nguyên.

Đây là kết nối thử nghiệm từ game trên máy ra màn hình HTTPS. Giữ máy bật, game chạy, nguồn chỉ xem và cloudflared hoạt động trong khi LIVE. Không cần mở cổng router. Người truy cập link chỉ xem được màn hình/trạng thái; các lệnh đổi vòng, xóa điểm, bình luận demo và kết nối TikTok bị chặn tại cổng công khai.

Các thành phần:
- server.mjs: game/bàn điều khiển cổng 3210, chỉ trên máy.
- public-relay.mjs: nguồn chỉ xem cổng 3211, chặn mọi yêu cầu ghi.
- bin/cloudflared.exe: bản chính thức của Cloudflare, đường truyền HTTPS ra ngoài.
- live-site/worker/index.js: cổng HTTPS trên Sites, chỉ cho phép nội dung màn hình phát.
- work/public-processes.json: mã tiến trình trợ giúp đang chạy, không phải thông tin đăng nhập.

Kiểm tra kết nối: mở link màn hình trên điện thoại/máy khác. Bấm Tiếp tục ở bàn điều khiển và kiểm tra đồng hồ trên link công khai cùng vòng.

LIVE Studio: Add source → Link, nhập URL màn hình HTTPS, kích thước 1080 × 1920. Bật âm thanh ở bàn điều khiển và cấu hình thu âm cửa sổ/hệ thống trong Studio. Overlay không tự bật nhạc/MC. Nhận chat TikTok thật là chức năng riêng, cần username đang LIVE và connector phù hợp.

Giới hạn quan trọng: kết nối hiện dùng Cloudflare Quick Tunnel để phát thử; không có cam kết uptime. Dừng cloudflared, khởi động lại máy hoặc tạo tunnel mới có thể làm nguồn thay đổi. Khi đó cần cập nhật LIVE_ORIGIN phía Sites rồi xuất bản lại phiên bản đã lưu, trước khi dùng lại link tên miền. Chỉ chạy lại START.cmd chưa khôi phục toàn bộ đường truyền công khai. Để dùng lâu dài cần chuyển sang tunnel cố định hoặc hosting game phù hợp; chưa thay nameserver hiện tại và chưa mua thêm dịch vụ.

Do Quick Tunnel không hỗ trợ SSE, màn hình công khai lấy trạng thái mỗi 0,5 giây, có độ trễ mạng. Bàn điều khiển trên máy vẫn dùng đồng bộ SSE 0,1 giây. Chấm điểm vẫn thực hiện trên máy chủ game, không phụ thuộc đồng hồ màn hình công khai.

Trang công khai có thể hiển thị tên/bình luận của người chơi như màn hình LIVE. Chỉ dùng dữ liệu phù hợp để phát công khai.
