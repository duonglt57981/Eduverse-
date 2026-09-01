/**
 * Utility chuẩn hóa initials cho Avatar EduVerse
 * Quy tắc:
 * - Tên có >= 2 từ: lấy chữ cái đầu của 2 từ cuối cùng (Ví dụ: "Nguyễn Thị Lương Hậu" -> "LH", "Trần Văn Nam" -> "VN", "Lê Minh Anh" -> "MA")
 * - Tên có 1 từ: lấy tối đa 2 ký tự đầu tiên (Ví dụ: "Nam" -> "NA", "Hậu" -> "HẬ", "An" -> "AN", "A" -> "A")
 * - Hỗ trợ chuẩn Unicode tiếng Việt có dấu
 * - Uppercase toàn bộ
 */
export function getAvatarInitials(name?: string | null): string {
  if (!name || typeof name !== "string") return "U";
  const trimmed = name.trim();
  if (!trimmed) return "U";

  // Phân tách từ theo khoảng trắng, loại bỏ khoảng trắng thừa
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "U";

  if (words.length >= 2) {
    const secondLast = words[words.length - 2];
    const last = words[words.length - 1];
    const char1 = Array.from(secondLast)[0] || "";
    const char2 = Array.from(last)[0] || "";
    return (char1 + char2).toUpperCase();
  }

  // Trường hợp tên chỉ có 1 từ
  const chars = Array.from(words[0]);
  return chars.slice(0, 2).join("").toUpperCase();
}
