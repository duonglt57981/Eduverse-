using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Eduverse.Service.GeminiService
{
    public class GeminiService : IGeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly ILogger<GeminiService> _logger;

        // Nguong co dinh
        private const double NGUONG_CHAN = 0.7;

        public GeminiService(IConfiguration configuration, ILogger<GeminiService> logger)
        {
            _apiKey = configuration["Gemini:ApiKey"] ?? throw new Exception("Thieu Gemini API Key");

            _httpClient = new HttpClient();

            var apiKey = configuration["Gemini:ApiKey"];
            var modelVersion = configuration["Gemini:ModelVersion"];
            _httpClient.BaseAddress = new Uri($"https://generativelanguage.googleapis.com/v1beta/models/{modelVersion}:generateContent");
            _httpClient.DefaultRequestHeaders.Add("x-goog-api-key", apiKey);

            _logger = logger;
        }

        public async Task<KetQuaKiemDuyetInput> KiemTraAsync(string noiDung)
        {
            if (string.IsNullOrWhiteSpace(noiDung))
            {
                return new KetQuaKiemDuyetInput { HopLe = true };
            }

            try
            {
                var prompt = $@"
                Kiem duyet noi dung sau: ""{noiDung}""

                Yeu cau:
                - Phat hien tu ngu nhay cam, bao luc, khi dam, tho tuc, chinh tri
                - Tra ve JSON:
                {{
                    ""hopLe"": true/false,
                    ""loai"": ""AnToan|BaoLuc|KhiDam|ThoTuc|ChinhTri"",
                    ""diemSo"": 0.0-1.0,
                    ""tuViPham"": [""tu1"", ""tu2""],
                    ""lyDo"": ""Ly do chi tiet"",
                    ""goiYSua"": ""Goi y sua chua""
                }}
                Chi tra ve JSON, khong them text khac.";

                var request = new
                {
                    contents = new[]
                    {
                new
                {
                    parts = new[] { new { text = prompt } }
                }
            },
                    generationConfig = new
                    {
                        temperature = 0.1,
                        maxOutputTokens = 512,
                        // ✅ FIX: ép Gemini trả JSON thuần, tránh bị bọc trong ```json ... ```
                        responseMimeType = "application/json"
                    }
                };

                var json = JsonSerializer.Serialize(request);
                var response = await _httpClient.PostAsync("", new StringContent(json, Encoding.UTF8, "application/json"));

                // ✅ Đọc response 1 LẦN DUY NHẤT
                var responseContent = await response.Content.ReadAsStringAsync();

                _logger.LogInformation("Status Code: {StatusCode}", response.StatusCode);
                _logger.LogDebug("Response: {Response}", responseContent);

                // ✅ Kiểm tra status code
                if (!response.IsSuccessStatusCode)
                {
                    try
                    {
                        using var errorDoc = JsonDocument.Parse(responseContent);
                        if (errorDoc.RootElement.TryGetProperty("error", out var error))
                        {
                            var errorMessage = error.GetProperty("message").GetString();
                            var errorCode = error.GetProperty("code").GetInt32();

                            _logger.LogError("Gemini API Error: {Code} - {Message}", errorCode, errorMessage);

                            if (errorCode == 403)
                                throw new Exception("API key khong hop le hoac bi khoa. Vui long kiem tra lai.");
                            else if (errorCode == 429)
                                throw new Exception("Vuot qua gioi han request. Vui long thu lai sau.");
                            else
                                throw new Exception($"Gemini API Error: {errorMessage}");
                        }
                        else
                        {
                            throw new Exception($"Gemini API Error: {response.StatusCode} - {responseContent}");
                        }
                    }
                    catch (JsonException)
                    {
                        throw new Exception($"Gemini API Error: {response.StatusCode} - {responseContent}");
                    }
                }

                return ParseResponse(responseContent, noiDung);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Loi goi Gemini");
                // ✅ FIX (fail-closed): nếu service kiểm duyệt lỗi, KHÔNG được tự ý coi nội dung là hợp lệ.
                // Ném lỗi để tầng gọi quyết định (vd: chặn tạm và đưa vào hàng đợi duyệt thủ công),
                // thay vì nuốt lỗi và để lọt nội dung chưa được kiểm tra.
                throw new Exception($"Loi he thong kiem duyet: {ex.Message}");
            }
        }

        private KetQuaKiemDuyetInput ParseResponse(string responseJson, string noiDungGoc)
        {
            // ✅ FIX: helper fail-closed dùng chung cho mọi nhánh lỗi parse bên dưới.
            // Trước đây mọi lỗi đều trả HopLe = true (fail-open) -> đây là lỗi chính khiến
            // từ cấm lọt qua khi Gemini trả JSON không đúng format mong đợi.
            KetQuaKiemDuyetInput FailClosed(string lyDo)
            {
                return new KetQuaKiemDuyetInput
                {
                    HopLe = false,
                    Loai = "KhongXacDinh",
                    ThongBao = lyDo,
                    TuViPham = new List<string>(),
                    GoiYSua = "He thong khong the tu dong kiem duyet, vui long cho admin duyet thu cong."
                };
            }

            try
            {
                using var doc = JsonDocument.Parse(responseJson);

                if (!doc.RootElement.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
                {
                    _logger.LogWarning("No candidates in response: {Response}", responseJson);
                    return FailClosed("Khong co ket qua tu AI, can duyet thu cong");
                }

                // ✅ Kiểm tra finishReason — nếu bị cắt do maxOutputTokens hoặc bị chặn bởi
                // chính bộ lọc an toàn của Gemini (SAFETY), JSON trả về có thể rỗng/không đầy đủ.
                var finishReason = candidates[0].TryGetProperty("finishReason", out var fr) ? fr.GetString() : null;
                if (string.Equals(finishReason, "SAFETY", StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogWarning("Gemini tu chan noi dung vi ly do an toan: {Content}", noiDungGoc);
                    return new KetQuaKiemDuyetInput
                    {
                        HopLe = false,
                        Loai = "ViPhamAnToan",
                        ThongBao = "Noi dung bi danh dau vi pham chinh sach an toan",
                        TuViPham = new List<string>(),
                        GoiYSua = ""
                    };
                }

                var text = candidates[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                if (string.IsNullOrWhiteSpace(text))
                {
                    _logger.LogWarning("Empty text in response: {Response}", responseJson);
                    return FailClosed("Khong co noi dung tra ve tu AI, can duyet thu cong");
                }

                // ✅ FIX: làm sạch text phòng trường hợp model vẫn bọc markdown code fence
                // (```json ... ``` hoặc ``` ... ```) du da set responseMimeType, de an toan double.
                text = CleanJsonText(text);

                using var resultDoc = JsonDocument.Parse(text);
                var root = resultDoc.RootElement;

                if (!root.TryGetProperty("hopLe", out var hopLeProp) || !root.TryGetProperty("diemSo", out var diemSoProp))
                {
                    _logger.LogWarning("JSON tu Gemini thieu field bat buoc: {Text}", text);
                    return FailClosed("Ket qua kiem duyet khong day du, can duyet thu cong");
                }

                var hopLe = hopLeProp.GetBoolean();
                var diemSo = diemSoProp.GetDouble();

                // Neu diem >= nguong -> Chan (giu nguyen logic goc)
                if (diemSo >= NGUONG_CHAN)
                {
                    hopLe = false;
                }

                return new KetQuaKiemDuyetInput
                {
                    HopLe = hopLe,
                    Loai = root.GetProperty("loai").GetString() ?? "Khac",
                    ThongBao = root.GetProperty("lyDo").GetString() ?? "",
                    TuViPham = root.TryGetProperty("tuViPham", out var terms)
                        ? terms.EnumerateArray().Select(t => t.GetString()).Where(t => t != null).Select(t => t!).ToList()
                        : new List<string>(),
                    GoiYSua = root.TryGetProperty("goiYSua", out var sug) ? sug.GetString() : ""
                };
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Loi parse JSON: {Response}", responseJson);
                // ✅ FIX: trước đây return HopLe = true. Đây chính xác là chỗ làm nội dung
                // có từ cấm bị lọt qua mỗi khi Gemini trả format hơi khác kỳ vọng.
                return FailClosed("Loi parse ket qua AI, can duyet thu cong");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Loi xu ly response: {Response}", responseJson);
                return FailClosed("Loi xu ly ket qua AI, can duyet thu cong");
            }
        }

        /// <summary>
        /// Loai bo markdown code fence (```json ... ``` hoac ``` ... ```) ma Gemini
        /// doi khi van them vao du da yeu cau JSON thuan.
        /// </summary>
        private static string CleanJsonText(string text)
        {
            var trimmed = text.Trim();

            if (trimmed.StartsWith("```"))
            {
                // Bo dong dau tien (``` hoac ```json)
                var firstNewline = trimmed.IndexOf('\n');
                if (firstNewline >= 0)
                {
                    trimmed = trimmed[(firstNewline + 1)..];
                }

                // Bo ``` o cuoi neu co
                var lastFence = trimmed.LastIndexOf("```", StringComparison.Ordinal);
                if (lastFence >= 0)
                {
                    trimmed = trimmed[..lastFence];
                }
            }

            return trimmed.Trim();
        }

        private KetQuaKiemDuyetInput ParseResponse(string responseJson)
        {
            try
            {
                using var doc = JsonDocument.Parse(responseJson);

                // ✅ Kiểm tra có candidates không
                if (!doc.RootElement.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
                {
                    _logger.LogWarning("No candidates in response");
                    return new KetQuaKiemDuyetInput
                    {
                        HopLe = true,
                        ThongBao = "Khong co ket qua tu AI"
                    };
                }

                // ✅ Lấy text từ response
                var text = candidates[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                if (string.IsNullOrWhiteSpace(text))
                {
                    _logger.LogWarning("Empty text in response");
                    return new KetQuaKiemDuyetInput
                    {
                        HopLe = true,
                        ThongBao = "Khong co noi dung tra ve"
                    };
                }

                // ✅ Parse JSON từ text
                using var resultDoc = JsonDocument.Parse(text);
                var root = resultDoc.RootElement;

                var hopLe = root.GetProperty("hopLe").GetBoolean();
                var diemSo = root.GetProperty("diemSo").GetDouble();

                // Neu diem >= 0.7 -> Chan
                if (diemSo >= NGUONG_CHAN)
                {
                    hopLe = false;
                }

                return new KetQuaKiemDuyetInput
                {
                    HopLe = hopLe,
                    Loai = root.GetProperty("loai").GetString() ?? "Khac",
                    ThongBao = root.GetProperty("lyDo").GetString() ?? "",
                    TuViPham = root.TryGetProperty("tuViPham", out var terms)
                        ? terms.EnumerateArray().Select(t => t.GetString()).Where(t => t != null).Select(t => t!).ToList()
                        : new List<string>(),
                    GoiYSua = root.TryGetProperty("goiYSua", out var sug) ? sug.GetString() : ""
                };
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Loi parse JSON: {Response}", responseJson);
                return new KetQuaKiemDuyetInput
                {
                    HopLe = true,
                    ThongBao = "Loi parse ket qua"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Loi xu ly response: {Response}", responseJson);
                return new KetQuaKiemDuyetInput
                {
                    HopLe = true,
                    ThongBao = "Loi xu ly ket qua"
                };
            }
        }
    }
}
