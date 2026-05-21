# VisionSearch Local Demo

Ứng dụng demo tìm kiếm ảnh cục bộ theo hướng CBIR giả lập.

## Kiến trúc thực tế

- `server.js`: Node.js static server, không có REST API backend.
- `index.html` + `main.js` + `style.css`: frontend chính của ứng dụng.
- `db.js`: truy cập `IndexedDB` trong trình duyệt.
- `public/sample_images`: ảnh mẫu local dùng để seed dữ liệu.
- `public/*.csv`: dữ liệu tham khảo, không nằm trong luồng chạy chính.

## Công nghệ đang dùng

- Node.js core modules: `http`, `fs`, `path`
- HTML, CSS, JavaScript thuần
- `IndexedDB`
- CDN: `lucide`, `chart.js`

## Cách chạy local

1. Mở terminal tại thư mục project.
2. Chạy:

```bash
node server.js
```

3. Mở:

```text
http://localhost:3080
```

Có thể đổi port bằng biến môi trường `PORT`.

## Dependency

Không có dependency npm bắt buộc để chạy bản hiện tại. Chỉ cần cài `Node.js`.

## Database

- Database là `IndexedDB` local trong browser.
- Tên database: `CBIR_VisionSearch_DB_v6`
- Object store: `records`

Không cần cài SQL Server, SQLite hay cấu hình kết nối DB server-side.

## Tính năng chính

- Seed dữ liệu mẫu local từ thư mục `public/sample_images`
- Upload ảnh mới và lưu vào `IndexedDB`
- Filter/search theo tên, tag, loại thuật toán
- Dashboard thống kê bằng Chart.js
- Export CSV và in báo cáo
- So khớp ảnh cục bộ bằng heuristic màu + tag

## Hạn chế hiện tại

- Không có backend xử lý ảnh thật
- Không có model ML/CNN thật
- Không có REST API
- Dữ liệu chỉ tồn tại trong browser hiện tại
