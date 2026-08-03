using Microsoft.Extensions.Configuration;
using System.Text;
using System.Text.Json;

namespace Eduverse.Service.SmsService
{
    /// <summary>
    /// Bản triển khai gửi SMS qua eSMS.vn.
    ///
    /// Có hai chế độ, tự chọn dựa trên cấu hình trong appsettings.json:
    ///
    ///   - Chế độ THẬT (IsLiveMode = true): khi đã điền Sms:ApiKey và Sms:SecretKey.
    ///     Tin nhắn được gửi qua API của eSMS.vn.
    ///
    ///   - Chế độ GHI LOG (IsLiveMode = false): khi chưa có khóa.
    ///     Nội dung tin nhắn được in ra console thay vì gửi đi.
    ///     Dùng để phát triển và demo mà không tốn phí SMS.
    ///
    /// Muốn chuyển sang gửi thật chỉ cần điền khóa vào appsettings.json,
    /// KHÔNG phải sửa bất kỳ dòng mã nào.
    /// </summary>
    public class SmsService : ISmsService
    {
        private readonly IConfiguration _config;

        private const string EsmsEndpoint = "https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json";

        // Dùng chung một HttpClient cho toàn ứng dụng để tránh cạn kiệt socket.
        private static readonly HttpClient _http = new HttpClient
        {
            Timeout = TimeSpan.FromSeconds(20)
        };

        public SmsService(IConfiguration config)
        {
            _config = config;
        }

        public bool IsLiveMode =>
            !string.IsNullOrWhiteSpace(_config["Sms:ApiKey"])
            && !string.IsNullOrWhiteSpace(_config["Sms:SecretKey"]);

        public async Task SendAsync(string phoneNumber, string message)
        {
            if (string.IsNullOrWhiteSpace(phoneNumber))
                throw new Exception("Thiếu số điện thoại người nhận.");

            var normalized = NormalizePhone(phoneNumber);

            // ── Chế độ ghi log: chưa cấu hình khóa nhà cung cấp ──
            if (!IsLiveMode)
            {
                Console.WriteLine("╔══════════════════════════════════════════════════════════════╗");
                Console.WriteLine("║  [EduVerse][SMS] CHẾ ĐỘ GHI LOG — tin nhắn KHÔNG được gửi đi ║");
                Console.WriteLine("╚══════════════════════════════════════════════════════════════╝");
                Console.WriteLine($"  Người nhận : {normalized}");
                Console.WriteLine($"  Nội dung   : {message}");
                Console.WriteLine($"  Ghi chú    : Điền Sms:ApiKey và Sms:SecretKey trong appsettings.json để gửi thật.");
                Console.WriteLine("──────────────────────────────────────────────────────────────");
                return;
            }

            // ── Chế độ thật: gọi API eSMS.vn ──
            var payload = new
            {
                ApiKey = _config["Sms:ApiKey"],
                SecretKey = _config["Sms:SecretKey"],
                Phone = normalized,
                Content = message,
                // 2 = tin nhắn chăm sóc khách hàng có brandname
                // 8 = tin nhắn cố định của nhà mạng (dùng khi chưa đăng ký brandname)
                SmsType = _config["Sms:SmsType"] ?? "2",
                Brandname = _config["Sms:Brandname"] ?? "EduVerse",
                Sandbox = _config["Sms:Sandbox"] ?? "0"
            };

            var content = new StringContent(
                JsonSerializer.Serialize(payload),
                Encoding.UTF8,
                "application/json");

            var response = await _http.PostAsync(EsmsEndpoint, content);
            var body = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                throw new Exception($"Nhà cung cấp SMS trả về mã lỗi {(int)response.StatusCode}.");

            // eSMS trả về CodeResult = "100" khi thành công
            try
            {
                using var doc = JsonDocument.Parse(body);
                if (doc.RootElement.TryGetProperty("CodeResult", out var code))
                {
                    var codeValue = code.GetString();
                    if (codeValue != "100")
                    {
                        var errMsg = doc.RootElement.TryGetProperty("ErrorMessage", out var em)
                            ? em.GetString()
                            : "không rõ nguyên nhân";
                        throw new Exception($"Gửi SMS thất bại (mã {codeValue}): {errMsg}");
                    }
                }
            }
            catch (JsonException)
            {
                throw new Exception("Không đọc được phản hồi từ nhà cung cấp SMS.");
            }
        }

        /// <summary>
        /// Chuẩn hóa số điện thoại Việt Nam về dạng 0xxxxxxxxx.
        /// Chấp nhận đầu vào dạng +84..., 84..., hoặc có khoảng trắng, dấu chấm, dấu gạch.
        /// </summary>
        public static string NormalizePhone(string phone)
        {
            var digits = new string(phone.Where(char.IsDigit).ToArray());

            if (digits.StartsWith("84") && digits.Length >= 11)
                digits = "0" + digits.Substring(2);

            return digits;
        }
    }
}
