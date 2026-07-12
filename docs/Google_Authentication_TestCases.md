# EduVerse — Test Cases: Đăng nhập & Đăng ký bằng Google

- **Dự án:** EduVerse (Frontend: Next.js 16 + Redux Toolkit · Backend: ASP.NET Core .NET 8 + Identity + JWT)
- **Nhánh Git:** `LuongHau`
- **Chức năng kiểm thử:** Đăng ký / Đăng nhập bằng Google (OpenID Connect, ID token do Google Identity Services cấp, backend tự xác minh).
- **Người soạn:** Claude (Cowork)

## 1. Phạm vi đã kiểm chứng & giới hạn môi trường

| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Frontend `tsc --noEmit` (type-check) | ✅ Pass | 0 lỗi, đã chạy thực tế trên máy. |
| Frontend ESLint (3 file thay đổi) | ✅ Pass | 0 error (1 warning `Stack` không dùng — có sẵn từ trước, không thuộc phạm vi). |
| Backend `dotnet build` | ⛔ Not Run | Môi trường sandbox không có .NET SDK và bị chặn NuGet. **Cần build trong Visual Studio.** |
| Khởi động backend / frontend (server) | ⛔ Not Run | Không chạy được server trong sandbox. |
| Đăng nhập Google thực tế (end-to-end) | ⛔ Not Run | Chưa có Google Client ID thật; chưa chạy server. |

> **Quy tắc ghi kết quả:** chỉ ghi **Pass** khi đã chạy thực tế và đúng; **Fail** khi chạy nhưng sai; **Not Run** khi chưa đủ điều kiện. Vì chưa có Google Client ID và chưa chạy server, toàn bộ test case chức năng dưới đây ghi **Not Run** (không tạo kết quả giả).

## 2. Tổng hợp kết quả

- Tổng số test case chức năng: **36**
- Pass: **0** · Fail: **0** · Not Run: **36**
- Kiểm tra kỹ thuật kèm theo: type-check **Pass**, lint **Pass**, build backend **Not Run**.

## 3. Điều kiện tiên quyết để chạy các test Not Run

1. Tạo **Google OAuth Client ID** (loại *Web application*) trong Google Cloud Console.
2. Khai báo **Authorized JavaScript origins**: `http://localhost:3000` (và domain production).
3. Đặt biến môi trường:
   - Frontend `eduverse_client/.env.local`: `NEXT_PUBLIC_GOOGLE_CLIENT_ID=<client-id>` và `NEXT_PUBLIC_API_URL=http://localhost:5002`.
   - Backend `appsettings.json` (hoặc biến môi trường `Authentication__Google__ClientId`): `Authentication:Google:ClientId=<client-id>` (TRÙNG với frontend).
4. `dotnet build` + chạy backend (`http://localhost:5002`), `npm run dev` + chạy frontend (`http://localhost:3000`).
5. SQL Server đang chạy và chuỗi kết nối hợp lệ.

## 4. Danh sách test case

Ký hiệu: **KQ** = kết quả. Trạng thái mặc định **Not Run** (NR) do chưa đủ điều kiện chạy.

| Mã | Chức năng | Mục tiêu | Tiền điều kiện | Dữ liệu kiểm thử | Các bước | KQ mong đợi | KQ thực tế | Trạng thái | Ghi chú |
|---|---|---|---|---|---|---|---|---|---|
| TC01 | Đăng ký bằng Google mới | Tạo tài khoản mới từ Google | Email Google chưa có trong hệ thống | Tài khoản Google hợp lệ | Trang đăng ký → nút Google → chọn tài khoản → cấp quyền | Tạo user mới, tự đăng nhập, vào trang Học viên | Chưa chạy | NR | Đã cài đặt tại `ExternalLoginAsync` + `GoogleAuthButton`. |
| TC02 | Tạo tài khoản đúng 1 lần | Không tạo trùng | Như TC01 | | Đăng ký Google 1 lần | Chỉ 1 bản ghi user + 1 bản ghi `AspNetUserLogins` | Chưa chạy | NR | `FindByLoginAsync` chặn tạo trùng. |
| TC03 | Vai trò mặc định = Học viên | Gán đúng role | Như TC01 | | Đăng ký Google → kiểm tra role | Role = `HocVien` | Chưa chạy | NR | `AddToRoleAsync(user,"HocVien")`. |
| TC04 | Không thể tự thành Giảng viên | Chặn leo quyền | Tài khoản Google mới | | Đăng ký Google | Không có role `GiaoVien` | Chưa chạy | NR | Chỉ gán HocVien; nâng cấp phải qua duyệt. |
| TC05 | Không thể thành Admin qua Google | Chặn tạo Admin | Tài khoản Google mới | | Đăng ký Google | Không có role `Admin` | Chưa chạy | NR | Không có nhánh gán Admin trong code. |
| TC06 | Đăng nhập lại bằng Google | Nhận diện user cũ | User đã liên kết Google | Cùng tài khoản Google | Đăng nhập Google lần 2 | Đăng nhập vào đúng user cũ | Chưa chạy | NR | `FindByLoginAsync` trả về user cũ. |
| TC07 | Không tạo trùng khi đăng nhập lại | Idempotent | Như TC06 | | Đăng nhập Google lần 2, 3 | Không tạo user/login mới | Chưa chạy | NR | |
| TC08 | Email Google trùng tài khoản mật khẩu | Liên kết an toàn | Đã có user đăng ký bằng email+mật khẩu cùng email | Google email = email user cũ, đã xác minh | Đăng nhập Google | Liên kết vào user cũ, không tạo user thứ 2 | Chưa chạy | NR | `FindByEmailAsync` + `AddLoginAsync`. |
| TC09 | Liên kết không mất mật khẩu cũ | Bảo toàn dữ liệu | Như TC08 | | Sau liên kết, đăng nhập lại bằng mật khẩu | Vẫn đăng nhập được bằng mật khẩu | Chưa chạy | NR | Không đụng `PasswordHash`. |
| TC10 | Liên kết không mất dữ liệu người dùng | Bảo toàn dữ liệu | Như TC08, user có khóa học/tiến độ | | Đăng nhập Google | Khóa học, tiến độ, đơn hàng giữ nguyên | Chưa chạy | NR | Chỉ thêm bản ghi login, không sửa dữ liệu khác. |
| TC11 | Đăng nhập mật khẩu sau khi liên kết | Song song 2 cách | Như TC08 | | Đăng nhập bằng email+mật khẩu | Thành công | Chưa chạy | NR | |
| TC12 | Tài khoản bị khóa không đăng nhập Google | Chặn tài khoản khóa | User bị lockout | Google hợp lệ của user đó | Đăng nhập Google | Bị từ chối kèm thông báo tiếng Việt | Chưa chạy | NR | Kiểm tra `IsLockedOutAsync` sau khi xác thực. |
| TC13 | Tài khoản vô hiệu hóa không đăng nhập | Chặn tài khoản xóa mềm | User `IsDeleted=true` | | Đăng nhập Google | Bị từ chối | Chưa chạy | NR | Kiểm tra `user.IsDeleted`. |
| TC14 | Người dùng hủy đăng nhập Google | Xử lý hủy | Có Client ID | | Mở popup Google rồi đóng | Không lỗi vỡ giao diện, không gọi backend | Chưa chạy | NR | GIS không gọi callback khi hủy. |
| TC15 | Từ chối cấp quyền | Xử lý từ chối | Có Client ID | | Ở màn Google chọn "Hủy/Không cho phép" | Thông báo nhẹ nhàng, không đăng nhập | Chưa chạy | NR | |
| TC16 | Callback thiếu authorization/token | Xử lý thiếu token | | Gửi request external-login không token (Google) | POST `/auth/external-login` `{provider:'Google'}` | Backend trả lỗi "Thiếu mã xác thực Google." | Chưa chạy | NR | Đã bắt buộc token cho Google. |
| TC17 | Token không hợp lệ | Từ chối token sai | Backend chạy | id_token rác | POST external-login với token sai | Trả lỗi "Mã xác thực Google không hợp lệ..." | Chưa chạy | NR | `tokeninfo` trả lỗi. |
| TC18 | State không hợp lệ (CSRF) | Chống giả mạo | | | Dùng GIS (tự quản state/nonce) | GIS bác bỏ; không nhận credential | Chưa chạy | NR | GIS xử lý nonce/state nội bộ. |
| TC19 | Token audience sai (aud) | Chống token của app khác | Backend chạy, ClientId cấu hình | id_token của Client ID khác | POST external-login | Trả lỗi "Token Google không dành cho ứng dụng này." | Chưa chạy | NR | Verify `aud == ClientId`. |
| TC20 | Email Google chưa xác minh | Chặn email chưa verify | | id_token có `email_verified=false` | POST external-login | Trả lỗi "Email Google của bạn chưa được xác minh." | Chưa chạy | NR | Verify `email_verified`. |
| TC21 | Thiếu Google Client ID (FE) | Thông báo cấu hình | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` rỗng | | Mở trang đăng nhập | Nút hiện trạng thái "chưa cấu hình", không lỗi | Chưa chạy | NR | Nhánh `if (!clientId)` trong `GoogleAuthButton`. |
| TC22 | Thiếu Google Client ID (BE) | Chặn khi chưa cấu hình | `Authentication:Google:ClientId` rỗng | | POST external-login Google | Trả lỗi "Hệ thống chưa được cấu hình đăng nhập Google." | Chưa chạy | NR | Kiểm tra tại `ValidateGoogleTokenAsync`. |
| TC23 | Redirect URI / Origin không đúng | Chống origin lạ | Client ID cấu hình sai origin | | Mở trang đăng nhập từ origin chưa khai báo | Google chặn hiển thị nút | Chưa chạy | NR | Cấu hình tại Google Console. |
| TC24 | Duy trì phiên sau khi tải lại trang | Session bền | Đã đăng nhập Google | | F5 lại trang | Vẫn đăng nhập (redux-persist + refresh cookie) | Chưa chạy | NR | Dùng cơ chế session hiện có. |
| TC25 | Đăng xuất xóa phiên | Logout sạch | Đã đăng nhập Google | | Bấm đăng xuất | Xóa AccessToken + thu hồi refresh token | Chưa chạy | NR | Dùng `logout` hiện có. |
| TC26 | Đăng nhập email+mật khẩu vẫn hoạt động | Không hồi quy | | Tài khoản mật khẩu hợp lệ | Đăng nhập thường | Thành công như trước | Chưa chạy | NR | Không sửa `LoginAsync`. |
| TC27 | Đăng ký email+mật khẩu vẫn hoạt động | Không hồi quy | | | Đăng ký thường | Thành công như trước | Chưa chạy | NR | Không sửa `RegisterAsync`. |
| TC28 | Nút Google hiển thị trang đăng nhập | UI | Có Client ID | | Mở `/auth/login` | Thấy nút Google chuẩn thương hiệu | Chưa chạy | NR | Đã thêm `GoogleAuthButton`. |
| TC29 | Nút Google hiển thị trang đăng ký | UI | Có Client ID | | Mở `/auth/register` | Thấy nút Google | Chưa chạy | NR | Đã thêm `GoogleAuthButton`. |
| TC30 | Trạng thái loading khi xử lý | UX | Có Client ID | | Bấm Google, trong lúc gọi backend | Hiện spinner, khóa tương tác | Chưa chạy | NR | State `processing` + overlay. |
| TC31 | Chặn bấm nhiều lần liên tiếp | Chống double submit | | | Bấm/nhả credential nhiều lần | Chỉ xử lý 1 request | Chưa chạy | NR | `processingRef` guard. |
| TC32 | Giao diện trên desktop | Responsive | | | Xem ở desktop | Bố cục đúng | Chưa chạy | NR | |
| TC33 | Giao diện trên tablet | Responsive | | | Xem ở tablet | Bố cục đúng | Chưa chạy | NR | |
| TC34 | Giao diện trên mobile | Responsive | | | Xem ở mobile | Bố cục đúng | Chưa chạy | NR | Nút GIS + layout co giãn. |
| TC35 | Phân quyền API đúng sau đăng nhập | Bảo mật | Đã đăng nhập Google (HocVien) | | Gọi API chỉ dành cho Admin | Bị 401/403 | Chưa chạy | NR | JWT chứa role từ DB. |
| TC36 | Không đổi được role từ frontend | Bảo mật | | | Sửa payload/localStorage để giả role | Backend không tin role FE; vẫn theo DB | Chưa chạy | NR | Role lấy từ `GetRolesAsync`, đưa vào JWT ký server. |

## 5. Kết luận

Toàn bộ mã nguồn đã hoàn thiện và **frontend đã qua type-check + lint (Pass)**. Các test case chức năng ở trạng thái **Not Run** vì cần: (1) Google Client ID thật, (2) `dotnet build` + chạy backend, (3) chạy frontend. Sau khi hoàn tất các điều kiện tiên quyết ở mục 3, chạy lại lần lượt TC01–TC36 và cập nhật cột "Kết quả thực tế" + "Trạng thái".
