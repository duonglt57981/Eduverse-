using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService.Validate
{
    namespace YourNamespace.KiemDuyet
    {
        public static class TuCams
        {
            // ===== DANH SÁCH TỪ CẤM =====
            public static readonly HashSet<string> _tuCam = new(StringComparer.OrdinalIgnoreCase)
            {
                // 1. Thô tục, chửi thề
                "cac", "cặc", "lon", "lồn", "dit", "địt", "vai lon", "vãi lồn",
                "dm", "đm", "vcl", "loz", "lồz", "cmm", "dit me", "địt mẹ",
                "con cac", "con cặc", "me may", "mẹ mày", "du ma", "đụ má",
                "thang cho", "thằng chó", "con me may", "con mẹ mày",
                "dcm", "dkm", "vl", "vloz", "clm", "ccm", "buoi", "bòi",
                "cho de", "chó đẻ", "sung sai", "đĩ", "di", "con di", "con đĩ",
                "ngu nhu bo", "ngu như bò", "do khon nan", "đồ khốn nạn",
                "do rac ruoi", "đồ rác rưởi", "sup", "súc vật", "suc vat",

                // 2. Bạo lực
                "giet", "giết", "chem", "chém", "sat hai", "sát hại",
                "hanh hung", "hành hung", "tra tan", "tra tấn",
                "vu khi", "vũ khí", "sung", "súng", "bom",
                "cuop giat", "cướp giật", "bao hanh", "bạo hành",
                "diet chung", "diệt chủng", "tan sat", "tàn sát",
                "danh dap", "đánh đập", "dam chet", "đâm chết",
                "no bom", "nổ bom", "khung bo", "khủng bố",
                "bat coc", "bắt cóc", "ban giet", "bắn giết",
                "che tao bom", "chế tạo bom", "vu khi tu che", "vũ khí tự chế",

                // 3. Ma túy
                "ma tuy", "ma túy", "can sa", "cần sa", "thuoc lac", "thuốc lắc",
                "thuoc phien", "thuốc phiện", "heroin", "cocaine", "meth",
                "chat gay nghien", "chất gây nghiện", "chat kich thich", "chất kích thích",
                "buon ban ma tuy", "buôn bán ma túy", "hut chich", "hút chích",
                "tiem chich", "tiêm chích", "da phien", "đá phiện", "keo lac", "kẹo lắc",

                // 4. Khiêu dâm
                "sex", "lam tinh", "làm tình", "khieu dam", "khiêu dâm",
                "phim cap ba", "phim cấp ba", "truyen cap ba", "truyện cấp ba",
                "khoa than", "khỏa thân", "loan luan", "loạn luân",
                "au dam", "ấu dâm", "hiep dam", "hiếp dâm",
                "cuong dam", "cưỡng dâm", "moi goi", "môi giới mại dâm",
                "mai dam", "mại dâm", "gai goi", "gái gọi", "banh be", "bán dâm",

                // 5. Lừa đảo
                "lua dao", "lừa đảo", "gian lan", "gian lận", "trom cap", "trộm cắp",
                "lua tien", "lừa tiền", "chiem doat tai san", "chiếm đoạt tài sản",
                "rua tien", "rửa tiền", "da cap", "đa cấp lừa đảo",
                "tin dung den", "tín dụng đen", "cho vay nang lai", "cho vay nặng lãi",

                // 6. Quấy rối
                "quay roi", "quấy rối", "bat nat", "bắt nạt", "de doa", "đe dọa",
                "ham doa", "hăm dọa",
                "nhuoc ma", "nhục mạ", "si nhuc", "sỉ nhục", "xuc pham", "xúc phạm",
                "quay roi tinh duc", "quấy rối tình dục", "cuong buc", "cưỡng bức",
                "de doa giet", "đe dọa giết",

                // 7. Tự tử
                "tu tu", "tự tử", "tu sat", "tự sát", "tu hai", "tự hại",
                "cat tay", "cắt tay", "muon chet", "muốn chết",
                "ket lieu doi minh", "kết liễu đời mình", "treo co", "treo cổ tự tử",

                // 8. Cờ bạc
                "co bac", "cờ bạc", "ca do", "cá độ", "danh bac", "đánh bạc",
                "ca do bong da", "cá độ bóng đá", "xoc dia", "xóc đĩa",
                "danh de", "đánh đề", "lo de", "lô đề",

                // 9. Xâm hại trẻ em
                "xam hai tre em", "xâm hại trẻ em", "lam dung tre em", "lạm dụng trẻ em",
                "boc lot tre em", "bóc lột trẻ em", "buon ban nguoi", "buôn bán người",
                "buon ban tre em", "buôn bán trẻ em",

                // 10. Chính trị
                "phan dong", "phản động", "lat do chinh quyen", "lật đổ chính quyền",
                "chong pha nha nuoc", "chống phá nhà nước", "bao dong", "bạo động",
                "kich dong bieu tinh", "kích động biểu tình",

                // ===== TIẾNG ANH =====
                "fuck", "fucking", "motherfucker", "shit", "bullshit",
                "bitch", "cunt", "whore", "slut", "porn",
                "asshole", "dick", "pussy", "bastard", "douchebag",
                "jackass", "twat", "wanker", "prick", "nigger", "retard",

                "kill", "killing", "murder", "slaughter",
                "assassinate", "assault", "rape", "molest",
                "terrorism", "terrorist", "genocide", "massacre",
                "behead", "lynch", "mass murder", "serial killer", "homicide",
                "torture", "stab", "gunman", "school shooting", "bomb making",
                "explosive device", "hostage", "kidnap",

                "racist", "racism", "nazi", "fascist", "holocaust",
                "homophobic", "transphobic", "bigot", "bigotry",
                "white supremacy", "hate crime", "faggot", "ethnic cleansing",
                "supremacist", "xenophobic",

                "amphetamine", "hashish", "overdose", "trafficking", "fentanyl",
                "drug dealer", "narcotics",

                "porno", "xxx", "hentai", "incest", "bestiality",
                "pedophile", "pedophilia", "prostitute", "prostitution",
                "child abuse", "child exploitation", "human trafficking",

                "bully", "bullying", "harass", "harassment",
                "intimidate", "threaten", "humiliate", "abusive",
                "sexual harassment", "stalking",

                "scam", "fraud", "phishing", "malware",
                "hacker", "blackmail", "extortion", "defraud",
                "ransomware", "identity theft", "money laundering",

                "suicide", "self-harm", "self harm", "kill myself",
                "cutting myself", "want to die",

                "gambling", "betting scam", "illegal casino",
            };

            // ===== DANH SÁCH TRẮNG (ƯU TIÊN CAO NHẤT) =====
            // Các từ này sẽ KHÔNG BAO GIỜ bị coi là từ cấm, dù có chứa substring trùng.
            public static readonly HashSet<string> _ngoaiLe = new(StringComparer.OrdinalIgnoreCase)
            {
                // Quan trọng: thêm "method" và các biến thể để không bị nhầm với "meth"
                "method", "methods", "methodology", "methodologies", "methodical",
                "methodologically", "methanol", "methane",

                // Có thể thêm các từ kỹ thuật khác nếu phát sinh false-positive
                // "class", "using", "namespace", ...
            };

            // Tập từ cấm 1 từ (không chứa khoảng trắng/dấu gạch)
            private static readonly HashSet<string> _tuCamMotTu = new(
                _tuCam.Where(t => !t.Contains(' ') && !t.Contains('-')),
                StringComparer.OrdinalIgnoreCase);

            // Cụm từ cấm (có khoảng trắng/dấu gạch) → dùng Regex
            private static readonly Dictionary<string, Regex> _regexCumTu = _tuCam
                .Where(t => t.Contains(' ') || t.Contains('-'))
                .ToDictionary(
                    t => t,
                    t => new Regex(
                        $@"(?<![\p{{L}}\p{{N}}_]){Regex.Escape(t)}(?![\p{{L}}\p{{N}}_])",
                        RegexOptions.IgnoreCase | RegexOptions.Compiled),
                    StringComparer.OrdinalIgnoreCase);

            // Tokenizer (tách từng từ/chữ số)
            private static readonly Regex _tachTuRegex = new(@"[\p{L}\p{N}]+", RegexOptions.Compiled);

            /// <summary>
            /// Kiểm tra nhanh xem nội dung có chứa từ cấm nào không.
            /// Trả về danh sách các từ cấm tìm thấy.
            /// </summary>
            public static List<string> TimTuCam(string noiDung)
            {
                var ketQua = new List<string>();

                if (string.IsNullOrWhiteSpace(noiDung))
                    return ketQua;

                // 1. Kiểm tra từng token đơn lẻ
                foreach (Match m in _tachTuRegex.Matches(noiDung))
                {
                    var token = m.Value;

                    // Ưu tiên số 1: kiểm tra danh sách trắng
                    if (_ngoaiLe.Contains(token))
                        continue;

                    // Kiểm tra từ cấm 1 từ
                    if (_tuCamMotTu.Contains(token))
                        ketQua.Add(token.ToLowerInvariant()); // Thêm vào kết quả
                }

                // 2. Kiểm tra cụm từ
                foreach (var kv in _regexCumTu)
                {
                    if (kv.Value.IsMatch(noiDung))
                        ketQua.Add(kv.Key);
                }

                return ketQua.Distinct(StringComparer.OrdinalIgnoreCase).ToList();
            }

            /// <summary>
            /// Kiểm tra nhanh có/không (dừng ngay khi tìm thấy match đầu tiên).
            /// </summary>
            public static bool ChuaTuCam(string noiDung)
            {
                if (string.IsNullOrWhiteSpace(noiDung))
                    return false;

                foreach (Match m in _tachTuRegex.Matches(noiDung))
                {
                    var token = m.Value;

                    if (_ngoaiLe.Contains(token))
                        continue;

                    if (_tuCamMotTu.Contains(token))
                        return true;
                }

                foreach (var kv in _regexCumTu)
                {
                    if (kv.Value.IsMatch(noiDung))
                        return true;
                }

                return false;
            }
        }
    }
}