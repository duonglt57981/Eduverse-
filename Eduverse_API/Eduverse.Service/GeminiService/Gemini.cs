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
    public class Gemini : IGemini
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly ILogger<Gemini> _logger;

        // Nguong co dinh
        private const double NGUONG_CHAN = 0.7;

        public Gemini(IConfiguration configuration, ILogger<Gemini> logger)
        {
            _apiKey = configuration["Gemini:ApiKey"] ?? throw new Exception("Thieu Gemini API Key");
            _httpClient = new HttpClient();
            _httpClient.BaseAddress = new Uri("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent");
            _httpClient.DefaultRequestHeaders.Add("x-goog-api-key", _apiKey);
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
                    generationConfig = new { temperature = 0.1, maxOutputTokens = 512 }
                };

                var json = JsonSerializer.Serialize(request);
                var response = await _httpClient.PostAsync("", new StringContent(json, Encoding.UTF8, "application/json"));
                response.EnsureSuccessStatusCode();

                var responseJson = await response.Content.ReadAsStringAsync();
                return ParseResponse(responseJson);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Loi goi Gemini");
                throw new Exception("Loi he thong kiem duyet, vui long thu lai");
            }
        }

        private KetQuaKiemDuyetInput ParseResponse(string responseJson)
        {
            try
            {
                using var doc = JsonDocument.Parse(responseJson);
                var text = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                using var resultDoc = JsonDocument.Parse(text);
                var root = resultDoc.RootElement;

                var hopLe = root.GetProperty("hopLe").GetBoolean();
                var diemSo = root.GetProperty("diemSo").GetDouble();

                // Neu diem >= 0.7 -> Chan (bat ke hopLe la true hay false)
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
            catch
            {
                return new KetQuaKiemDuyetInput
                {
                    HopLe = true,
                    ThongBao = "Loi parse ket qua"
                };
            }
        }
    }
}
