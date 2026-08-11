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
                new { parts = new[] { new { text = prompt } } }
            },
                    generationConfig = new
                    {
                        temperature = 0.1,
                        maxOutputTokens = 1024,
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
                        }
                        else
                        {
                            _logger.LogError("Gemini API Error: {StatusCode} - {Response}", response.StatusCode, responseContent);
                        }
                    }
                    catch (JsonException)
                    {
                        _logger.LogError("Gemini API Error (non-JSON): {StatusCode} - {Response}", response.StatusCode, responseContent);
                    }

                    // Gemini lỗi -> mặc định CHO PHÉP (fail-open), chỉ đánh dấu để admin/log biết
                    return FailOpen("He thong kiem duyet dang loi (Gemini API), da mac dinh cho phep - vui long kiem tra lai thu cong");
                }

                return ParseResponse(responseContent, noiDung);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Loi goi Gemini, mac dinh cho phep");
                return FailOpen($"He thong kiem duyet dang loi ({ex.Message}), da mac dinh cho phep - vui long kiem tra lai thu cong");
            }
        }

        // ===== HELPER: khi HỆ THỐNG lỗi kỹ thuật -> mặc định CHO PHÉP (fail-open) =====
        private static KetQuaKiemDuyetInput FailOpen(string lyDo)
        {
            return new KetQuaKiemDuyetInput
            {
                HopLe = true,
                Loai = "LoiHeThongMacDinhChoPhep",
                ThongBao = lyDo,
                TuViPham = new List<string>(),
                GoiYSua = ""
            };
        }

        private KetQuaKiemDuyetInput ParseResponse(string responseJson, string noiDungGoc)
        {
            bool IsValidJson(string json)
            {
                if (string.IsNullOrWhiteSpace(json)) return false;
                json = json.Trim();
                if (!json.StartsWith("{") && !json.StartsWith("[")) return false;
                if (!json.EndsWith("}") && !json.EndsWith("]")) return false;
                try { JsonDocument.Parse(json); return true; }
                catch { return false; }
            }

            try
            {
                // ===== 1. PARSE RESPONSE GỐC (envelope của Gemini) =====
                using var doc = JsonDocument.Parse(responseJson);

                if (!doc.RootElement.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
                {
                    _logger.LogWarning("No candidates in response: {Response}", responseJson);
                    return FailOpen("He thong khong tra ve ket qua kiem duyet, da mac dinh cho phep");
                }

                var finishReason = candidates[0].TryGetProperty("finishReason", out var fr) ? fr.GetString() : null;

                // Đây là AI THỰC SỰ chặn vì lý do an toàn -> đây là phát hiện vi phạm thật, phải CHẶN
                if (string.Equals(finishReason, "SAFETY", StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogWarning("Gemini tu chan noi dung vi ly do an toan: {Content}", noiDungGoc);
                    return new KetQuaKiemDuyetInput
                    {
                        HopLe = false,
                        Loai = "ViPhamAnToan",
                        ThongBao = "Noi dung vi pham chinh sach an toan, khong the dang",
                        TuViPham = new List<string>(),
                        GoiYSua = "Vui long chinh sua lai noi dung cho phu hop"
                    };
                }

                if (string.Equals(finishReason, "MAX_TOKENS", StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogWarning("Gemini bi cat cut do het maxOutputTokens: {Content}", noiDungGoc);
                }

                var text = candidates[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();

                if (string.IsNullOrWhiteSpace(text))
                {
                    _logger.LogWarning("Empty text in response: {Response}", responseJson);
                    return FailOpen("AI khong tra ve noi dung kiem duyet, da mac dinh cho phep");
                }

                // ===== 2. LÀM SẠCH TEXT =====
                text = CleanJsonText(text);

                if (!IsValidJson(text))
                {
                    _logger.LogWarning("Invalid JSON from Gemini: {Text}", text);
                    var extracted = ExtractJson(text);
                    if (!string.IsNullOrEmpty(extracted))
                        extracted = CleanJsonText(extracted);

                    if (!string.IsNullOrEmpty(extracted) && IsValidJson(extracted))
                    {
                        _logger.LogInformation("Extracted JSON: {Extracted}", extracted);
                        text = extracted;
                    }
                    else
                    {
                        // Lỗi định dạng kỹ thuật -> mặc định cho phép
                        return FailOpen("Ket qua kiem duyet khong dung dinh dang JSON, da mac dinh cho phep");
                    }
                }

                // ===== 3. PARSE KẾT QUẢ =====
                using var resultDoc = JsonDocument.Parse(text);
                var root = resultDoc.RootElement;

                if (!root.TryGetProperty("hopLe", out var hopLeProp) ||
                    !root.TryGetProperty("diemSo", out var diemSoProp))
                {
                    _logger.LogWarning("JSON tu Gemini thieu field bat buoc: {Text}", text);
                    return FailOpen("Ket qua kiem duyet khong day du, da mac dinh cho phep");
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

                var loai = root.TryGetProperty("loai", out var loaiProp) ? loaiProp.GetString() ?? "Khac" : "Khac";
                var thongBao = root.TryGetProperty("lyDo", out var lyDoProp) ? lyDoProp.GetString() ?? "" : "";
                var goiYSua = root.TryGetProperty("goiYSua", out var sugProp) ? sugProp.GetString() ?? "" : "";

                // hopLe = false ở đây là AI THỰC SỰ phát hiện vi phạm -> để nguyên, sẽ bị chặn ở tầng gọi
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
                return FailOpen("Loi parse ket qua AI, da mac dinh cho phep");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Loi xu ly response: {Response}", responseJson);
                return FailOpen("Loi xu ly ket qua AI, da mac dinh cho phep");
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

        private static string CleanJsonText(string responseJson)
        {
            if (string.IsNullOrWhiteSpace(responseJson))
                return responseJson;

            var cleaned = Regex.Replace(responseJson, @"```(?:json)?\s*|\s*```", "", RegexOptions.Multiline);
            cleaned = cleaned.Trim();

            var openBraces = cleaned.Count(c => c == '{');
            var closeBraces = cleaned.Count(c => c == '}');
            var openBrackets = cleaned.Count(c => c == '[');
            var closeBrackets = cleaned.Count(c => c == ']');

            if (openBrackets > closeBrackets)
                for (int i = 0; i < openBrackets - closeBrackets; i++) cleaned += "]";

            if (openBraces > closeBraces)
                for (int i = 0; i < openBraces - closeBraces; i++) cleaned += "}";

            return cleaned;
        }

        // ===== HÀM MỚI: KIỂM TRA VÀ NÉM EXCEPTION NẾU VI PHẠM =====
        public async Task KiemTraVaNemExceptionAsync(string noiDung)
        {
            var ketQua = await KiemDuyetInputAsync(noiDung);

            // Chỉ chặn khi thực sự phát hiện vi phạm (không phải do lỗi hệ thống)
            if (!ketQua.HopLe)
            {
                var lyDo = string.IsNullOrWhiteSpace(ketQua.ThongBao)
                    ? "Noi dung vi pham quy dinh kiem duyet"
                    : ketQua.ThongBao;

                if (ketQua.TuViPham != null && ketQua.TuViPham.Any())
                {
                    lyDo += $" (Tu vi pham: {string.Join(", ", ketQua.TuViPham)})";
                }

                if (!string.IsNullOrWhiteSpace(ketQua.GoiYSua))
                {
                    lyDo += $" - Goi y: {ketQua.GoiYSua}";
                }

                throw new Exception(lyDo);
            }

            // Nếu là do lỗi hệ thống (fail-open) thì chỉ log cảnh báo, không chặn
            if (ketQua.Loai == "LoiHeThongMacDinhChoPhep")
            {
                _logger.LogWarning("Kiem duyet mac dinh cho phep do loi he thong: {ThongBao}", ketQua.ThongBao);
            }
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

        #region GoiYTraLoi

        /// <summary>
        /// Gọi Gemini để sinh 1 câu trả lời nháp tự nhiên (không phải JSON kiểm duyệt).
        /// Dùng cho tính năng "AI gợi ý" trong Q&A — chỉ trả về text thô để giảng viên chỉnh sửa.
        /// </summary>
        public async Task<string> GoiYTraLoiCauHoiAsync(string prompt)
        {
            if (string.IsNullOrWhiteSpace(prompt))
                throw new Exception("Prompt trống, không thể gọi AI gợi ý");

            try
            {
                var request = new
                {
                    contents = new[]
                    {
                new { parts = new[] { new { text = prompt } } }
            },
                    generationConfig = new
                    {
                        temperature = 0.4,
                        maxOutputTokens = 500
                        // Lưu ý: KHÔNG set responseMimeType = "application/json" ở đây,
                        // vì đây cần trả lời tự nhiên dạng text, không phải JSON như kiểm duyệt.
                    }
                };

                var json = JsonSerializer.Serialize(request);
                var response = await _httpClient.PostAsync("", new StringContent(json, Encoding.UTF8, "application/json"));
                var responseContent = await response.Content.ReadAsStringAsync();

                _logger.LogInformation("GoiYTraLoi Status Code: {StatusCode}", response.StatusCode);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Gemini API Error (GoiYTraLoi): {StatusCode} - {Response}", response.StatusCode, responseContent);
                    throw new Exception("AI hiện không phản hồi được, vui lòng thử lại sau");
                }

                using var doc = JsonDocument.Parse(responseContent);

                if (!doc.RootElement.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
                {
                    _logger.LogWarning("Khong co candidates (GoiYTraLoi): {Response}", responseContent);
                    throw new Exception("AI không trả về nội dung gợi ý");
                }

                var finishReason = candidates[0].TryGetProperty("finishReason", out var fr) ? fr.GetString() : null;
                if (string.Equals(finishReason, "SAFETY", StringComparison.OrdinalIgnoreCase))
                {
                    throw new Exception("Nội dung câu hỏi hoặc ngữ cảnh bị Gemini từ chối vì lý do an toàn");
                }

                var text = candidates[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();

                if (string.IsNullOrWhiteSpace(text))
                    throw new Exception("AI không trả về nội dung gợi ý");

                return text.Trim();
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Loi parse JSON (GoiYTraLoi)");
                throw new Exception("Lỗi xử lý phản hồi từ AI");
            }
        }

        #endregion
    }
}
