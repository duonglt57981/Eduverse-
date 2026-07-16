# Cấu hình Email OTP — Tính năng Quên mật khẩu

Tài liệu này hướng dẫn cấu hình gửi **mã OTP thật qua email** cho luồng quên mật khẩu của EduVerse.

## 1. Luồng hoạt động

Luồng 3 bước, xác minh hoàn toàn ở backend:

1. **Nhập email** → `POST /api/auth/forgot-password` → hệ thống sinh OTP 6 số, lưu **bản băm (SHA-256)** của OTP vào bảng `AspNetUserTokens`, rồi **gửi OTP qua email SMTP**.
2. **Xác minh OTP** → `POST /api/auth/verify-otp` → backend so khớp bản băm, kiểm tra hạn & số lần thử. Đúng → trả về **reset token ngắn hạn** (dùng một lần).
3. **Đặt mật khẩu mới** → `POST /api/auth/reset-password` → gửi kèm reset token; backend đổi mật khẩu qua ASP.NET Identity, thu hồi mọi refresh token và đổi security stamp.

> OTP **không bao giờ** được trả về cho frontend, ghi ra console hay lưu ở localStorage. Chỉ bản băm được lưu ở server.

## 2. Lấy Gmail App Password (bắt buộc)

Gmail **không** cho dùng mật khẩu đăng nhập thường để gửi SMTP. Cần tạo **App Password** 16 ký tự:

1. Đăng nhập tài khoản Gmail sẽ dùng để gửi (ví dụ tài khoản trong `Email:From`).
2. Vào **Google Account → Security** (https://myaccount.google.com/security).
3. Bật **2-Step Verification** (xác minh 2 bước) nếu chưa bật — đây là điều kiện bắt buộc để có App Passwords.
4. Vào **App passwords** (https://myaccount.google.com/apppasswords).
5. Đặt tên bất kỳ (ví dụ `EduVerse SMTP`) → **Create**.
6. Google hiển thị chuỗi **16 ký tự** (dạng `abcd efgh ijkl mnop`). Sao chép lại (bỏ khoảng trắng khi dùng cũng được).

## 3. Đặt App Password AN TOÀN (không commit lên Git)

File `Eduverse_API/Eduverse.Api/appsettings.json` **đang được Git theo dõi**, nên **KHÔNG** đặt App Password thật trực tiếp vào đó. Hãy chọn **một** trong các cách sau.

### Cách A — dotnet user-secrets (khuyến nghị cho môi trường dev)

Mở terminal tại thư mục `Eduverse_API/Eduverse.Api/`:

```bash
dotnet user-secrets init
dotnet user-secrets set "Email:Password" "your-16-char-app-password"
```

Secret được lưu ngoài thư mục dự án (không nằm trong Git). Các key khác (`Email:Host`, `Port`, `From`, `Username`) có thể để trong `appsettings.json` vì không phải bí mật.

### Cách B — Biến môi trường

Đặt biến (dùng `__` thay cho `:`):

```bash
# Windows (PowerShell)
$env:Email__Password = "your-16-char-app-password"

# Linux/macOS
export Email__Password="your-16-char-app-password"
```

### Cách C — appsettings.Development.json (nhớ thêm vào .gitignore)

Tạo `appsettings.Development.json` (đảm bảo đã được `.gitignore` bỏ qua) và đặt:

```json
{ "Email": { "Password": "your-16-char-app-password" } }
```

> Dù chọn cách nào, các giá trị còn lại đã có sẵn trong `appsettings.json`:
> `Email:Host = smtp.gmail.com`, `Email:Port = 587`,
> `Email:From = Email:Username = ngthiluonghau08@gmail.com`.
> Nếu đổi tài khoản gửi, cập nhật `From` và `Username` cho khớp tài khoản đã tạo App Password.

## 4. Tham số OTP (đặt trong `AuthService.cs`)

| Tham số | Giá trị | Ý nghĩa |
|---|---|---|
| Độ dài OTP | 6 chữ số | Sinh bằng `RandomNumberGenerator` (an toàn mật mã) |
| Hạn dùng OTP | **5 phút** | `OtpExpiryMinutes` |
| Số lần nhập sai tối đa | **5 lần** | `MaxOtpAttempts` — quá số lần sẽ hủy OTP |
| Cooldown gửi lại | **60 giây** | `ResendCooldownSeconds` |
| Hạn dùng reset token | **10 phút** | `ResetTokenExpiryMinutes` — dùng một lần |

Muốn đổi, sửa các hằng số ở đầu vùng "FORGOT PASSWORD" trong
`Eduverse.Service/AuthService/AuthService.cs`.

## 5. Kiểm thử nhanh

1. Điền App Password (mục 3), chạy backend bằng Visual Studio.
2. Vào trang `/auth/forgot-password`, nhập một email **đã đăng ký**.
3. Kiểm tra hộp thư (kể cả mục Spam) — email tiêu đề *"Mã xác minh đặt lại mật khẩu EduVerse"* chứa 6 số.
4. Nhập OTP → đặt mật khẩu mới → đăng nhập lại bằng mật khẩu mới.

### Xử lý sự cố

- **Không nhận được email:** kiểm tra App Password đúng chưa; tài khoản `From/Username` khớp App Password chưa; xem mục Spam. Backend cố tình **không** báo lỗi SMTP ra ngoài (chống dò email), nên hãy xem log server nếu nghi lỗi cấu hình.
- **Báo "email tồn tại thì sẽ nhận mã":** đây là thông báo **chung có chủ đích** (chống dò tìm tài khoản) — luôn hiển thị dù email có tồn tại hay không.
- **OTP báo hết hạn/không đúng:** OTP chỉ sống 5 phút và bị hủy sau khi nhập sai 5 lần hoặc sau khi đã dùng.

## 6. Không cần migration / package mới

Tính năng tái sử dụng bảng `AspNetUserTokens` có sẵn của ASP.NET Identity để lưu bản băm OTP và reset token, nên **không thêm bảng, không cần migration, không cài package mới**.
