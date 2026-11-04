# Bộ từ từ PDF của chủ kênh

Nguồn hiện tại: 3000.pdf do người dùng cung cấp, tài liệu mang tiêu đề Oxford 3000, 120 trang, có ghi địa chỉ effortlessenglishclub.edu.vn/oxford-3000.html. Đây là mô tả nguồn trong tài liệu, không khẳng định đây là bản dịch chính thức của Oxford.

Mỗi từ chỉ giữ một nghĩa tiếng Việt. Bỏ phiên âm, nghĩa phụ sau dấu phẩy/chấm phẩy, ví dụ và chú thích; sửa một số nghĩa rõ ràng chưa chuẩn. Chỉ nhập từ đơn gồm chữ cái, dài 2–16 chữ; bỏ cụm từ, mục trùng và dòng không tách được nghĩa an toàn. Số từ chính xác xem words.json hoặc bảng điều khiển. Các từ đồng nghĩa có thể cùng nghĩa tiếng Việt; gợi ý có loại từ và số chữ cái. Chấm điểm vẫn theo đúng từ tiếng Anh của vòng hiện tại.

Đã rà soát toàn bộ 3.263 mục bằng AI ngày 04/11/2026: chỉnh 1.063 mục về nghĩa, chính tả hoặc loại từ; loại một mục lỗi tách chữ (suf); giữ 3.262 từ. Chọn một nghĩa thông dụng cho mỗi từ, không ghép nhiều nghĩa. Đây là rà soát ngôn ngữ bằng AI, chưa được chuyên gia từ điển thẩm định độc lập. Có thể sửa words.json nếu phát hiện điểm chưa phù hợp. Các chỉnh sửa được giữ trong tools/vocabulary-overrides.json để không mất khi nhập lại PDF. Không tự gán giấy phép CC BY-SA của nguồn cũ cho tài liệu PDF này; không đưa PDF gốc lên kho mã. Các tệp giấy phép nguồn cũ trong licenses/ được giữ để truy vết lịch sử Git, không mô tả nguồn của bộ từ hiện tại.

Tạo lại: chạy tools/import-pdf-vocabulary.py với Python có pdfplumber, truyền đường dẫn PDF làm đối số. Công cụ cũ tools/build-vocabulary.mjs dành cho nguồn trước, không dùng để xây bộ hiện tại.

## Không lặp lại từ

Từ được ghi vào data/word-progress.json ngay khi chuẩn bị vòng, kể cả bỏ qua. Hết toàn bộ bộ từ mới xáo và lặp. Đóng/mở máy chủ hoặc đặt lại điểm không xóa tiến độ. Khi thay bộ từ, giữ lịch sử cũ theo từ tiếng Anh, loại từ không còn trong bộ và thêm từ mới vào hàng đợi chưa dùng.

Nút Xuất lịch sử tải CSV các vòng đã hiển thị. Lịch sử riêng được lưu trên máy phát, không đưa lên GitHub và không công khai qua overlay.
