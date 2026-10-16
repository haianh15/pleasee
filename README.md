# GreenHouse - Quản lý nhà cho thuê

Ứng dụng quản lý phòng, khách thuê, hợp đồng, thu tiền và tài sản. Giao diện dùng React, TypeScript và Vite; tài khoản và dữ liệu được lưu trên Supabase.

## Kết nối Supabase

1. Trong Supabase, mở **SQL Editor** và chạy lần lượt các file trong `supabase/migrations` theo thứ tự tên.
2. Trong **Authentication > Users**, tạo tài khoản email cho người quản lý. Ứng dụng không mở đăng ký tự do.
3. Sao chép **Project URL** và khóa **anon/public** (hoặc **publishable**) trong phần API.
4. Trong **Authentication > URL Configuration**, thêm địa chỉ website Vercel vào danh sách URL được phép chuyển về sau khi đặt lại mật khẩu.
5. Tạo file `.env.local` từ `.env.example`, rồi điền:

   ```text
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-public-key
   ```

6. Chạy `npm install`, sau đó `npm run dev`.
7. Khi triển khai trên Vercel, thêm hai biến trên vào **Project Settings > Environment Variables**, chọn Production (và Preview nếu cần), rồi redeploy.
8. Triển khai Edge Function `change-first-password` bằng Supabase CLI (`supabase functions deploy change-first-password`). Function dùng các biến mặc định `SUPABASE_URL`, `SUPABASE_ANON_KEY` và `SUPABASE_SERVICE_ROLE_KEY` ở phía Supabase; không sao chép khóa service role vào client hoặc Vercel.
9. Với tài khoản cần đổi mật khẩu lần đầu, đặt `must_change_password: true` trong **User Metadata**. Migration sao chép cờ này sang **App Metadata** do máy chủ quản lý; ứng dụng không dùng metadata người dùng để quyết định quyền truy cập. Để bật lại cho tài khoản đã tồn tại, thay đổi User Metadata sau khi cài migration để trigger đồng bộ cờ một chiều.

Không đưa khóa `service_role` vào ứng dụng hoặc Vercel dưới tên biến `VITE_*`. Khóa này có quyền vượt qua chính sách bảo mật dữ liệu.

## Dữ liệu và bảo mật

- Dữ liệu mỗi tài khoản nằm trong một bản ghi PostgreSQL ở bảng `app_state`.
- Row Level Security giới hạn tài khoản chỉ đọc và sửa dữ liệu của chính mình.
- Khi đăng nhập lần đầu, ứng dụng tạo bộ dữ liệu khởi tạo riêng cho tài khoản. Những lần sau, dữ liệu trên Supabase là nguồn chính.
- Mọi thay đổi được tự động lưu sau một khoảng ngắn. Thanh trạng thái đầu trang báo đang lưu, đã lưu hoặc có lỗi.
- Nếu nhiều thiết bị cùng sửa một lúc, ứng dụng phát hiện phiên bản dữ liệu xung đột và yêu cầu tải lại để tránh ghi đè.
- Mỗi tài khoản có dữ liệu riêng. Chia sẻ một tòa nhà giữa nhiều tài khoản cần bổ sung chức năng thành viên/chia sẻ sau.
- Màn hình tài khoản chỉ truy cập khi đã đăng nhập; đổi mật khẩu yêu cầu xác minh mật khẩu hiện tại, mật khẩu mới từ 12 ký tự và xác nhận khớp. Sau khi đổi, phiên hiện tại được giữ và ứng dụng yêu cầu Supabase thu hồi các phiên khác. Đặt lại mật khẩu qua email kết thúc phiên và yêu cầu đăng nhập lại.
- Đổi mật khẩu lần đầu được xác minh và xử lý qua Edge Function; bộ đếm sai, trạng thái yêu cầu, thu hồi phiên và nhật ký được quản lý phía Supabase. App Metadata (không thể tự sửa bởi người dùng) cùng RLS chặn quyền dữ liệu cho đến khi đổi mật khẩu hoàn tất.

## Lệnh

- `npm run dev` - chạy ứng dụng trên máy.
- `npm run lint` - kiểm tra TypeScript.
- `npm run build` - tạo bản phát hành trong `dist`.
