using Eduverse.Service.LichSuKiemDuyetKhoaHocService;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Eduverse.Service.GeminiService
{
    public class GeminiService : IGeminiService
    {


        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly ILogger<GeminiService> _logger;

        // Nguong co dinh
        private const double NGUONG_CHAN = 0.7;      // Reject if score >= 0.7
        private const double NGUONG_PHAN_VAN = 0.4;  // Need admin review if score >= 0.4 and < 0.7

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

        #region KiemDuyetInput

        public async Task<KetQuaKiemDuyetInput> KiemDuyetInputAsync(string noiDung)
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
                        maxOutputTokens = 1024, // tăng để tránh bị cắt giữa JSON khi tuViPham dài
                        responseMimeType = "application/json"
                    }
                };

                var json = JsonSerializer.Serialize(request);
                var response = await _httpClient.PostAsync("", new StringContent(json, Encoding.UTF8, "application/json"));

                var responseContent = await response.Content.ReadAsStringAsync();

                _logger.LogInformation("Status Code: {StatusCode}", response.StatusCode);
                _logger.LogDebug("Response: {Response}", responseContent);

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
                // Fail-closed: nếu service kiểm duyệt lỗi, KHÔNG tự ý coi nội dung là hợp lệ.
                throw new Exception($"Loi he thong kiem duyet: {ex.Message}");
            }
        }

        private KetQuaKiemDuyetInput ParseResponse(string responseJson, string noiDungGoc)
        {
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

            bool IsValidJson(string json)
            {
                if (string.IsNullOrWhiteSpace(json)) return false;
                json = json.Trim();

                if (!json.StartsWith("{") && !json.StartsWith("[")) return false;
                if (!json.EndsWith("}") && !json.EndsWith("]")) return false;

                try
                {
                    JsonDocument.Parse(json);
                    return true;
                }
                catch
                {
                    return false;
                }
            }

            try
            {
                // ===== 1. PARSE RESPONSE GỐC (envelope của Gemini) =====
                using var doc = JsonDocument.Parse(responseJson);

                if (!doc.RootElement.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
                {
                    _logger.LogWarning("No candidates in response: {Response}", responseJson);
                    return FailClosed("Khong co ket qua tu AI, can duyet thu cong");
                }

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

                if (string.Equals(finishReason, "MAX_TOKENS", StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogWarning("Gemini bi cat cut do het maxOutputTokens: {Content}", noiDungGoc);
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

                // ===== 2. LÀM SẠCH TEXT (dùng đúng 1 hàm duy nhất, có brace-balancing) =====
                text = CleanJsonText(text);

                if (!IsValidJson(text))
                {
                    _logger.LogWarning("Invalid JSON from Gemini: {Text}", text);

                    var extracted = ExtractJson(text);

                    if (!string.IsNullOrEmpty(extracted))
                    {
                        // Vá lại dấu đóng nếu thiếu sau khi extract thô
                        extracted = CleanJsonText(extracted);
                    }

                    if (!string.IsNullOrEmpty(extracted) && IsValidJson(extracted))
                    {
                        _logger.LogInformation("Extracted JSON: {Extracted}", extracted);
                        text = extracted;
                    }
                    else
                    {
                        return FailClosed("Ket qua kiem duyet khong dung dinh dang JSON, can duyet thu cong");
                    }
                }

                // ===== 3. PARSE KẾT QUẢ =====
                using var resultDoc = JsonDocument.Parse(text);
                var root = resultDoc.RootElement;

                if (!root.TryGetProperty("hopLe", out var hopLeProp) ||
                    !root.TryGetProperty("diemSo", out var diemSoProp))
                {
                    _logger.LogWarning("JSON tu Gemini thieu field bat buoc: {Text}", text);
                    return FailClosed("Ket qua kiem duyet khong day du, can duyet thu cong");
                }

                var hopLe = hopLeProp.GetBoolean();
                var diemSo = diemSoProp.GetDouble();

                if (diemSo >= NGUONG_CHAN)
                {
                    hopLe = false;
                }

                var tuViPham = new List<string>();
                if (root.TryGetProperty("tuViPham", out var terms) && terms.ValueKind == JsonValueKind.Array)
                {
                    tuViPham = terms.EnumerateArray()
                        .Select(t => t.GetString())
                        .Where(t => !string.IsNullOrWhiteSpace(t))
                        .Select(t => t!)
                        .ToList();
                }

                var loai = root.TryGetProperty("loai", out var loaiProp)
                    ? loaiProp.GetString() ?? "Khac"
                    : "Khac";

                var thongBao = root.TryGetProperty("lyDo", out var lyDoProp)
                    ? lyDoProp.GetString() ?? ""
                    : "";

                var goiYSua = root.TryGetProperty("goiYSua", out var sugProp)
                    ? sugProp.GetString() ?? ""
                    : "";

                return new KetQuaKiemDuyetInput
                {
                    HopLe = hopLe,
                    Loai = loai,
                    ThongBao = thongBao,
                    TuViPham = tuViPham,
                    GoiYSua = goiYSua
                };
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Loi parse JSON: {Response}", responseJson);
                return FailClosed("Loi parse ket qua AI, can duyet thu cong");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Loi xu ly response: {Response}", responseJson);
                return FailClosed("Loi xu ly ket qua AI, can duyet thu cong");
            }
        }

        // ===== HELPER: TRÍCH XUẤT JSON THÔ TỪ ĐOẠN TEXT LỘN XỘN =====
        private string ExtractJson(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return null;

            var start = text.IndexOf('{');
            if (start == -1) start = text.IndexOf('[');
            if (start == -1) return null;

            var end = text.LastIndexOf('}');
            if (end == -1) end = text.LastIndexOf(']');
            if (end == -1 || end <= start) return null;

            return text.Substring(start, end - start + 1);
        }

        /// <summary>
        /// Loai bo markdown code fence (```json ... ``` hoac ``` ... ```) ma Gemini
        /// doi khi van them vao du da yeu cau JSON thuan, va tu dong bo sung dau dong
        /// con thieu neu JSON bi cat cut do het maxOutputTokens.
        /// </summary>
        private static string CleanJsonText(string responseJson)
        {
            if (string.IsNullOrWhiteSpace(responseJson))
                return responseJson;

            // 1. Xóa các block code markdown nếu có (```json ... ```)
            var cleaned = Regex.Replace(
                responseJson,
                @"```(?:json)?\s*|\s*```",
                "",
                RegexOptions.Multiline
            );

            // 2. Trim khoảng trắng
            cleaned = cleaned.Trim();

            // 3. Đếm số dấu mở/đóng để phát hiện JSON bị cắt cụt
            var openBraces = cleaned.Count(c => c == '{');
            var closeBraces = cleaned.Count(c => c == '}');
            var openBrackets = cleaned.Count(c => c == '[');
            var closeBrackets = cleaned.Count(c => c == ']');

            // 4. Bổ sung dấu đóng nếu thiếu (best-effort vá JSON bị cắt cụt)
            if (openBrackets > closeBrackets)
            {
                for (int i = 0; i < openBrackets - closeBrackets; i++)
                    cleaned += "]";
            }

            if (openBraces > closeBraces)
            {
                for (int i = 0; i < openBraces - closeBraces; i++)
                    cleaned += "}";
            }

            return cleaned;
        }

        #endregion


        #region KiemDuyetOuput
        /// <summary>
        /// Gọi Gemini để kiểm duyệt 1 đoạn nội dung text, parse JSON kết quả.
        /// Fail-closed: mọi lỗi (parse, response rỗng, thiếu field, lỗi mạng)
        /// đều trả về diemSo nằm trong khoảng phân vân (cần xem xét),
        /// KHÔNG bao giờ mặc định an toàn khi gặp lỗi không rõ nguyên nhân.
        /// </summary>
        public async Task<KetQuaKiemDuyetInput> KiemDuyetOuputAsync(string noiDung)
        {
            if (string.IsNullOrWhiteSpace(noiDung))
            {
                return new KetQuaKiemDuyetInput { HopLe = true, DiemSo = 0.0, Loai = "AnToan" };
            }

            try
            {
                var prompt = $@"
                        Kiem duyet noi dung sau: ""{noiDung}""
 
                        Yeu cau:
                        - Phat hien tu ngu nhay cam, bao luc, khieu dam, tho tuc, chinh tri cuc doan
                        - Tra ve JSON:
                        {{
                            ""hopLe"": true/false,
                            ""loai"": ""AnToan|BaoLuc|KhieuDam|ThoTuc|ChinhTri"",
                            ""diemSo"": 0.0-1.0,
                            ""tuViPham"": [""tu1"", ""tu2""],
                            ""lyDo"": ""Ly do chi tiet"",
                            ""goiYSua"": ""Goi y sua chua""
                        }}
                        Chi tra ve JSON, khong them text khac.";

                var request = new
                {
                    contents = new[] { new { parts = new[] { new { text = prompt } } } },
                    generationConfig = new
                    {
                        temperature = 0.1,
                        maxOutputTokens = 512,
                        responseMimeType = "application/json"
                    }
                };

                var json = JsonSerializer.Serialize(request);
                var response = await _httpClient.PostAsync("", new StringContent(json, Encoding.UTF8, "application/json"));
                var responseContent = await response.Content.ReadAsStringAsync();

                _logger.LogInformation("Gemini Status Code: {StatusCode}", response.StatusCode);
                _logger.LogDebug("Gemini Response: {Response}", responseContent);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Gemini API Error: {StatusCode} - {Response}", response.StatusCode, responseContent);
                    return FailClosedOuput("Loi goi Gemini API, can duyet thu cong");
                }

                return ParseResponseOutput(responseContent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Loi goi Gemini kiem duyet");
                return FailClosedOuput($"Loi he thong kiem duyet: {ex.Message}");
            }
        }

        private KetQuaKiemDuyetInput ParseResponseOutput(string responseJson)
        {
            try
            {
                using var doc = JsonDocument.Parse(responseJson);

                if (!doc.RootElement.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
                {
                    _logger.LogWarning("Khong co candidates trong response Gemini: {Response}", responseJson);
                    return FailClosedOuput("Khong co ket qua tu AI, can duyet thu cong");
                }

                var finishReason = candidates[0].TryGetProperty("finishReason", out var fr) ? fr.GetString() : null;
                if (string.Equals(finishReason, "SAFETY", StringComparison.OrdinalIgnoreCase))
                {
                    return new KetQuaKiemDuyetInput
                    {
                        HopLe = false,
                        Loai = "ViPhamAnToan",
                        DiemSo = 1.0,
                        ThongBao = "Noi dung bi danh dau vi pham chinh sach an toan cua Gemini"
                    };
                }

                var text = candidates[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();
                if (string.IsNullOrWhiteSpace(text))
                {
                    return FailClosedOuput("Khong co noi dung tra ve tu AI, can duyet thu cong");
                }

                text = CleanJsonTextOutput(text);

                using var resultDoc = JsonDocument.Parse(text);
                var root = resultDoc.RootElement;

                if (!root.TryGetProperty("hopLe", out var hopLeProp) || !root.TryGetProperty("diemSo", out var diemSoProp))
                {
                    _logger.LogWarning("JSON Gemini thieu field bat buoc: {Text}", text);
                    return FailClosedOuput("Ket qua kiem duyet khong day du, can duyet thu cong");
                }

                return new KetQuaKiemDuyetInput
                {
                    HopLe = hopLeProp.GetBoolean(),
                    DiemSo = diemSoProp.GetDouble(),
                    Loai = root.GetProperty("loai").GetString() ?? "Khac",
                    ThongBao = root.TryGetProperty("lyDo", out var lyDo) ? lyDo.GetString() : "",
                    TuViPham = root.TryGetProperty("tuViPham", out var terms)
                        ? terms.EnumerateArray().Select(t => t.GetString()).Where(t => t != null).Select(t => t!).ToList()
                        : new List<string>(),
                    GoiYSua = root.TryGetProperty("goiYSua", out var sug) ? sug.GetString() : ""
                };
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Loi parse JSON Gemini: {Response}", responseJson);
                return FailClosedOuput("Loi parse ket qua AI, can duyet thu cong");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Loi xu ly response Gemini: {Response}", responseJson);
                return FailClosedOuput("Loi xu ly ket qua AI, can duyet thu cong");
            }
        }

        private static KetQuaKiemDuyetInput FailClosedOuput(string lyDo) => new()
        {
            HopLe = false,
            Loai = "KhongXacDinh",
            DiemSo = (NGUONG_PHAN_VAN + NGUONG_CHAN) / 2,
            ThongBao = lyDo
        };

        private static string CleanJsonTextOutput(string text)
        {
            var trimmed = text.Trim();
            if (trimmed.StartsWith("```"))
            {
                var firstNewline = trimmed.IndexOf('\n');
                if (firstNewline >= 0) trimmed = trimmed[(firstNewline + 1)..];
                var lastFence = trimmed.LastIndexOf("```", StringComparison.Ordinal);
                if (lastFence >= 0) trimmed = trimmed[..lastFence];
            }
            return trimmed.Trim();
        }
        #endregion
    }
}
