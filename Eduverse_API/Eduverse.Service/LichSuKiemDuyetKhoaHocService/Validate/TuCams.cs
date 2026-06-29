using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService.Validate
{
    using System;
    using System.Collections.Generic;
    using System.Text.RegularExpressions;

    namespace YourNamespace.KiemDuyet
    {
        public static class TuCams
        {
            public static readonly HashSet<string> _tuCam = new(StringComparer.OrdinalIgnoreCase)
        {
            // 1. Thô tục, chửi thề (rõ ràng, hiếm khi dùng vô hại)
            "cac", "cặc", "lon", "lồn", "dit", "địt", "vai lon", "vãi lồn",
            "dm", "đm", "vcl", "loz", "lồz", "cmm", "dit me", "địt mẹ",
            "con cac", "con cặc", "me may", "mẹ mày", "du ma", "đụ má",
            "thang cho", "thằng chó", "con me may", "con mẹ mày",

            // 2. Bạo lực cụ thể, vũ khí, hành vi gây hại trực tiếp
            "giet", "giết", "chem", "chém", "sat hai", "sát hại",
            "hanh hung", "hành hung", "tra tan", "tra tấn",
            "vu khi", "vũ khí", "sung", "súng", "bom",
            "cuop giat", "cướp giật", "bao hanh", "bạo hành",
            "diet chung", "diệt chủng", "tan sat", "tàn sát",

            // 3. Ma túy, chất cấm cụ thể
            "ma tuy", "ma túy", "can sa", "cần sa", "thuoc lac", "thuốc lắc",
            "thuoc phien", "thuốc phiện", "heroin", "cocaine", "meth",
            "chat gay nghien", "chất gây nghiện", "chat kich thich", "chất kích thích",

            // 4. Khiêu dâm, tình dục thô tục
            "sex", "lam tinh", "làm tình", "khiêu dam", "khiêu dâm",
            "phim cap ba", "phim cấp ba", "truyen cap ba", "truyện cấp ba",
            "khoa than", "khỏa thân",

            // 5. Lừa đảo, gian lận
            "lua dao", "lừa đảo", "gian lan", "gian lận", "trom cap", "trộm cắp",

            // 6. Quấy rối, đe dọa, sỉ nhục trực tiếp
            "quay roi", "quấy rối", "bat nat", "bắt nạt", "de doa", "đe dọa",
            "ham doa", "hăm dọa", "khung bo", "khủng bố",
            "nhuoc ma", "nhục mạ", "si nhuc", "sỉ nhục", "xuc pham", "xúc phạm",


            // ========== TIẾNG ANH ==========

            // 1. Profanity (Thô tục, rõ ràng)
            "fuck", "fucking", "motherfucker", "shit", "bullshit",
            "bitch", "cunt", "whore", "slut", "porn",
            "asshole", "dick", "pussy",

            // 2. Violence (Bạo lực cụ thể)
            "kill", "killing", "murder", "slaughter", "execute",
            "assassinate", "assault", "rape", "molest",
            "terrorism", "terrorist", "genocide", "massacre",
            "behead", "lynch", "mass murder", "serial killer", "homicide",

            // 3. Hate Speech (Kỳ thị rõ ràng, không phải từ mô tả trung tính)
            "racist", "racism", "nazi", "fascist", "holocaust",
            "homophobic", "transphobic", "bigot", "bigotry",
            "white supremacy", "hate crime", "faggot",

            // 4. Drugs (Ma túy cụ thể)
            "cocaine", "heroin", "meth", "amphetamine",
            "hashish", "overdose", "trafficking",

            // 5. Porn/Adult (Khiêu dâm rõ ràng)
            "porn", "porno", "xxx", "hentai", "incest", "bestiality",
            "pedophile", "pedophilia", "prostitute", "prostitution",

            // 6. Bullying/Abuse (Quấy rối, lạm dụng trực tiếp)
            "bully", "bullying", "harass", "harassment",
            "intimidate", "threaten", "humiliate", "abusive",

            // 7. Spam/Scam (Lừa đảo, tấn công mạng)
            "scam", "fraud", "phishing", "malware",
            "hacker", "blackmail", "extortion", "defraud"
        };

            // Cache regex theo từng từ cấm để tránh build lại pattern mỗi lần gọi.
            private static readonly Dictionary<string, Regex> _regexCache = BuildRegexCache();

            private static Dictionary<string, Regex> BuildRegexCache()
            {
                var cache = new Dictionary<string, Regex>(StringComparer.OrdinalIgnoreCase);
                foreach (var tu in _tuCam)
                {
                    // \b chỉ hoạt động đúng với ký tự ASCII trong .NET regex mặc định khi
                    // chuỗi có dấu tiếng Việt (vì \b dựa trên \w, và \w mặc định không coi
                    // ký tự có dấu là "word character" một cách nhất quán). Để an toàn cho
                    // cả từ có dấu và không dấu, dùng lookaround thủ công thay vì \b.
                    var pattern = $@"(?<![\p{{L}}\p{{N}}_]){Regex.Escape(tu)}(?![\p{{L}}\p{{N}}_])";
                    cache[tu] = new Regex(pattern, RegexOptions.IgnoreCase | RegexOptions.Compiled);
                }
                return cache;
            }

            /// <summary>
            /// Kiểm tra nhanh xem nội dung có chứa từ cấm nào không (match theo ranh giới từ,
            /// không match vào giữa từ khác). Trả về danh sách các từ cấm tìm thấy.
            /// </summary>
            public static List<string> TimTuCam(string noiDung)
            {
                var ketQua = new List<string>();

                if (string.IsNullOrWhiteSpace(noiDung))
                {
                    return ketQua;
                }

                foreach (var tu in _tuCam)
                {
                    if (_regexCache[tu].IsMatch(noiDung))
                    {
                        ketQua.Add(tu);
                    }
                }

                return ketQua;
            }

            /// <summary>
            /// Kiểm tra nhanh true/false — có chứa ít nhất 1 từ cấm hay không.
            /// Dùng khi chỉ cần biết có/không, không cần danh sách chi tiết (nhanh hơn TimTuCam
            /// vì dừng ngay khi tìm thấy match đầu tiên).
            /// </summary>
            public static bool ChuaTuCam(string noiDung)
            {
                if (string.IsNullOrWhiteSpace(noiDung))
                {
                    return false;
                }

                foreach (var tu in _tuCam)
                {
                    if (_regexCache[tu].IsMatch(noiDung))
                    {
                        return true;
                    }
                }

                return false;
            }
        }
    }

}
