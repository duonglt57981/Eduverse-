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
            "dcm", "dkm", "vl", "vloz", "clm", "ccm", "buoi", "bòi",
            "cho de", "chó đẻ", "sung sai", "đĩ", "di", "con di", "con đĩ",
            "ngu nhu bo", "ngu như bò", "do khon nan", "đồ khốn nạn",
            "do rac ruoi", "đồ rác rưởi", "sup", "súc vật", "suc vat",

            // 2. Bạo lực cụ thể, vũ khí, hành vi gây hại trực tiếp
            "giet", "giết", "chem", "chém", "sat hai", "sát hại",
            "hanh hung", "hành hung", "tra tan", "tra tấn",
            "vu khi", "vũ khí", "sung", "súng", "bom",
            "cuop giat", "cướp giật", "bao hanh", "bạo hành",
            "diet chung", "diệt chủng", "tan sat", "tàn sát",
            "danh dap", "đánh đập", "dam chet", "đâm chết",
            "no bom", "nổ bom", "khung bo", "khủng bố",
            "bat coc", "bắt cóc", "ban giet", "bắn giết",
            "che tao bom", "chế tạo bom", "vu khi tu che", "vũ khí tự chế",

            // 3. Ma túy, chất cấm cụ thể
            "ma tuy", "ma túy", "can sa", "cần sa", "thuoc lac", "thuốc lắc",
            "thuoc phien", "thuốc phiện", "heroin", "cocaine", "meth",
            "chat gay nghien", "chất gây nghiện", "chat kich thich", "chất kích thích",
            "buon ban ma tuy", "buôn bán ma túy", "hut chich", "hút chích",
            "tiem chich", "tiêm chích", "da phien", "đá phiện", "keo lac", "kẹo lắc",

            // 4. Khiêu dâm, tình dục thô tục
            "sex", "lam tinh", "làm tình", "khiêu dam", "khiêu dâm",
            "phim cap ba", "phim cấp ba", "truyen cap ba", "truyện cấp ba",
            "khoa than", "khỏa thân", "loan luan", "loạn luân",
            "an ban", "ấu dâm", "au dam", "hiep dam", "hiếp dâm",
            "cuong dam", "cưỡng dâm", "moi goi", "môi giới mại dâm",
            "mai dam", "mại dâm", "gai goi", "gái gọi", "banh be", "bán dâm",

            // 5. Lừa đảo, gian lận
            "lua dao", "lừa đảo", "gian lan", "gian lận", "trom cap", "trộm cắp",
            "lua tien", "lừa tiền", "chiem doat tai san", "chiếm đoạt tài sản",
            "rua tien", "rửa tiền", "da cap", "đa cấp lừa đảo",
            "tin dung den", "tín dụng đen", "cho vay nang lai", "cho vay nặng lãi",

            // 6. Quấy rối, đe dọa, sỉ nhục trực tiếp
            "quay roi", "quấy rối", "bat nat", "bắt nạt", "de doa", "đe dọa",
            "ham doa", "hăm dọa", "khung bo", "khủng bố",
            "nhuoc ma", "nhục mạ", "si nhuc", "sỉ nhục", "xuc pham", "xúc phạm",
            "quay roi tinh duc", "quấy rối tình dục", "cuong buc", "cưỡng bức",
            "de doa giet", "đe dọa giết",

            // 7. Tự tử, tự hại (nhạy cảm, cần rà soát để hỗ trợ thay vì chỉ chặn)
            "tu tu", "tự tử", "tu sat", "tự sát", "tu hai", "tự hại",
            "cat tay", "cắt tay", "muon chet", "muốn chết",
            "ket lieu doi minh", "kết liễu đời mình", "treo co", "treo cổ tự tử",

            // 8. Cờ bạc, cá độ
            "co bac", "cờ bạc", "ca do", "cá độ", "danh bac", "đánh bạc",
            "ca do bong da", "cá độ bóng đá", "xoc dia", "xóc đĩa",
            "danh de", "đánh đề", "lo de", "lô đề",

            // 9. Xâm hại, bóc lột trẻ em (thuật ngữ chung, không mã lóng)
            "xam hai tre em", "xâm hại trẻ em", "lam dung tre em", "lạm dụng trẻ em",
            "boc lot tre em", "bóc lột trẻ em", "buon ban nguoi", "buôn bán người",
            "buon ban tre em", "buôn bán trẻ em",

            // 10. Chính trị nhạy cảm / phản động (tùy ngữ cảnh nền tảng)
            "phan dong", "phản động", "lat do chinh quyen", "lật đổ chính quyền",
            "chong pha nha nuoc", "chống phá nhà nước", "bao dong", "bạo động",
            "kich dong bieu tinh", "kích động biểu tình",


            // ========== TIẾNG ANH ==========

            // 1. Profanity (Thô tục, rõ ràng)
            "fuck", "fucking", "motherfucker", "shit", "bullshit",
            "bitch", "cunt", "whore", "slut", "porn",
            "asshole", "dick", "pussy", "bastard", "douchebag",
            "jackass", "twat", "wanker", "prick", "nigger", "retard",

            // 2. Violence (Bạo lực cụ thể)
            "kill", "killing", "murder", "slaughter",
            "assassinate", "assault", "rape", "molest",
            "terrorism", "terrorist", "genocide", "massacre",
            "behead", "lynch", "mass murder", "serial killer", "homicide",
            "torture", "stab", "gunman", "school shooting", "bomb making",
            "explosive device", "hostage", "kidnap",

            // 3. Hate Speech (Kỳ thị rõ ràng, không phải từ mô tả trung tính)
            "racist", "racism", "nazi", "fascist", "holocaust",
            "homophobic", "transphobic", "bigot", "bigotry",
            "white supremacy", "hate crime", "faggot", "ethnic cleansing",
            "supremacist", "xenophobic",

            // 4. Drugs (Ma túy cụ thể)
            "cocaine", "heroin", "meth", "amphetamine",
            "hashish", "overdose", "trafficking", "fentanyl",
            "drug dealer", "narcotics",

            // 5. Porn/Adult (Khiêu dâm rõ ràng)
            "porn", "porno", "xxx", "hentai", "incest", "bestiality",
            "pedophile", "pedophilia", "prostitute", "prostitution",
            "child abuse", "child exploitation", "human trafficking",

            // 6. Bullying/Abuse (Quấy rối, lạm dụng trực tiếp)
            "bully", "bullying", "harass", "harassment",
            "intimidate", "threaten", "humiliate", "abusive",
            "sexual harassment", "stalking",

            // 7. Spam/Scam (Lừa đảo, tấn công mạng)
            "scam", "fraud", "phishing", "malware",
            "hacker", "blackmail", "extortion", "defraud",
            "ransomware", "identity theft", "money laundering",

            // 8. Self-harm (Tự tử, tự hại)
            "suicide", "self-harm", "self harm", "kill myself",
            "cutting myself", "want to die",

            // 9. Gambling (Cờ bạc)
            "gambling", "betting scam", "illegal casino"
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