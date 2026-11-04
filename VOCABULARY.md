# Bộ từ WordLive — 1.500 từ

Dữ liệu từ điển: Từ điển Anh–Việt thichhoc.com (thichhoc-dict), giấy phép CC BY-SA 4.0.
https://github.com/thichhoc-org/thichhoc-dict
Nguồn gốc: WordNet 3.1 (Princeton), CMUdict (CMU), Wiktionary.
**Đã chỉnh sửa dữ liệu.**

Nguồn đã lấy: bốn shard freq-tier1-01..04.jsonl. Revision được ghi trong licenses/vocabulary-source.json. Lọc từ phổ biến dài 3–12 chữ cái, bỏ các nghĩa bị nguồn gắn độ tin cậy thấp, rút nghĩa ngắn, chọn một nghĩa cho mỗi từ, không trùng từ tiếng Anh hoặc nghĩa gợi ý. Một số nghĩa thông dụng được sửa thủ công.

Nguồn nghĩa có phần do LLM sinh và chưa được kiểm duyệt thủ công toàn bộ. Bộ lọc không thay thế kiểm tra ngôn ngữ: có thể gặp nghĩa phụ hoặc bản dịch chưa tự nhiên. Mỗi từ chỉ dùng một nghĩa trong game; từ đồng nghĩa khác chưa được tự động chấm là đáp án đúng. Có thể sửa words.json và khởi động lại game.

Bản words.json phái sinh được phát hành theo **CC BY-SA 4.0**: https://creativecommons.org/licenses/by-sa/4.0/ . Giữ nguồn, nêu thay đổi, phát hành dữ liệu phái sinh cùng giấy phép. Giấy phép này áp dụng dữ liệu, không tự gán giấy phép cho toàn bộ mã ứng dụng.

Phần ghi nguồn của các nguồn gốc giữ nguyên trong [licenses/vocabulary-LICENSE-DATA.txt](licenses/vocabulary-LICENSE-DATA.txt). WordNet 3.1 Copyright 2011 The Trustees of Princeton University. All rights reserved. CMUdict: Carnegie Mellon University, BSD 2-clause.

Tạo lại đúng bộ dữ liệu: chạy `node tools/build-vocabulary.mjs` trong thư mục dự án (cần mạng). Dữ liệu nguồn gốc và tệp tạm nằm trong work/, không đưa lên GitHub.

## Không lặp lại từ

Máy chủ xáo thứ tự, ghi mỗi từ vào data/word-progress.json ngay khi chuẩn bị hiển thị vòng; từ bỏ qua bằng Vòng tiếp vẫn tính đã hiện. Chỉ khi dùng hết 1.500 từ mới xáo và bắt đầu lượt mới. Ở ranh giới lượt cũng tránh chọn lại ngay từ vừa kết thúc.

Đặt lại điểm sang một từ chưa dùng tiếp theo, không xóa lịch sử. Tắt/mở server sẽ đi tiếp hàng đợi đã lưu, không lấy lại từ của vòng trước. Thêm từ mới giữ các từ đã hiện của lượt hiện tại; xóa từ khỏi bộ không xóa bản ghi quá khứ.

Không xóa data/word-progress.json nếu muốn giữ tiến độ. Tệp được ghi tạm, đồng bộ xuống đĩa rồi đổi tên nguyên tử; nếu tệp không đọc được, game dừng báo lỗi thay vì tự tạo lịch sử rỗng. Khi chuyển máy, chép cả thư mục data/ (thư mục này không đưa lên GitHub).

Nút Xuất lịch sử trên bàn điều khiển tải CSV gồm số thứ tự, lượt, từ tiếng Anh, nghĩa và thời điểm UTC. Lịch sử riêng trên máy phát, không có API đọc toàn bộ lịch sử công khai. Tiến độ tổng quát được hiển thị trên overlay. Lịch sử bắt đầu từ bản cập nhật này; không tái dựng các vòng cũ trước đó.
