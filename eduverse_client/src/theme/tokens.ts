// ============================================================
// EduVerse — Design Tokens (nguồn chân lý duy nhất cho giao diện)
// Chỉ chứa hằng số GIAO DIỆN. KHÔNG chứa logic nghiệp vụ.
// Mọi trang/component nên import từ đây thay vì tự khai báo màu.
// ============================================================

// -------- Thương hiệu: đỏ đô (maroon) --------
export const BRAND = {
  main: "#8B1313", // Đỏ đô chủ đạo (primary)
  dark: "#6D0F0F", // Hover / nhấn
  darker: "#5C0D0D", // Đậm nhất
  light: "#FBEFEF", // Nền tint nhạt
  border: "#F0DEDE", // Viền nhạt theo thương hiệu
  contrast: "#FFFFFF", // Chữ trên nền đỏ đô
} as const;

// -------- Trung tính --------
export const NEUTRAL = {
  bg: "#F7F5F2", // Nền trang
  paper: "#FFFFFF", // Nền thẻ/khối
  textPrimary: "#1F2937", // Chữ chính
  textSecondary: "#4B5563", // Chữ phụ
  textMuted: "#8A7676", // Chữ mờ (tông đỏ đô)
  grey: "#9CA3AF",
  divider: "#ECE7E4", // Đường kẻ
} as const;

// -------- Trạng thái --------
export const STATUS = {
  success: "#10B981",
  successDark: "#0A5A3A",
  warning: "#F59E0B",
  error: "#DC2626",
  info: "#0284C7",
} as const;

// -------- Bo góc / bóng đổ / kiểu chữ --------
export const RADIUS = { sm: 8, base: 10, card: 16, pill: 999 } as const;

export const SHADOWS = {
  sm: "0 1px 2px rgba(24,18,20,0.06)",
  card: "0 8px 24px rgba(24,18,20,0.06)",
  lg: "0 16px 40px rgba(24,18,20,0.10)",
  focus: "0 0 0 4px rgba(139,19,19,0.14)", // vòng focus theo brand
} as const;

export const FONT_FAMILY =
  '"Be Vietnam Pro","Roboto",system-ui,-apple-system,"Segoe UI",Arial,sans-serif';

// -------- Gradient dùng lại --------
export const GRADIENTS = {
  crimson: "linear-gradient(90deg, #9f1717 0%, #7f1d1d 100%)",
  crimsonHover: "linear-gradient(90deg, #7f1d1d 0%, #681212 100%)",
  ai: "linear-gradient(135deg, #8B1313 0%, #7C3AED 100%)",
  tech: "linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)",
} as const;

// ============================================================
// Tương thích ngược: giữ nguyên "hình dạng" các object màu cũ
// (MAU / COLORS) để các trang import thay vì khai báo lại.
// Không đổi tên khóa -> không phải sửa JSX đang dùng.
// ============================================================

// Bảng màu kiểu Việt (MAU) — trước đây lặp ở nhiều trang instructor
export const MAU = {
  chinh: BRAND.main, // #8B1313
  chinhDam: BRAND.darker, // #5C0D0D
  chinhNhat: BRAND.light, // #FBEFEF
  vien: BRAND.border, // #F0DEDE
  chuDen: "#231313",
  chuXam: NEUTRAL.textMuted,
} as const;

// Bảng màu kiểu Anh (COLORS) — hợp nhất mọi biến thể admin/dashboard
export const COLORS = {
  primary: BRAND.main, // #8B1313 (trước đây #8D1313)
  primaryLight: "#B91C1C",
  primaryDark: BRAND.dark, // #6D0F0F (trước đây #7F1D1D)
  bgLight: NEUTRAL.bg, // nền trang thống nhất
  white: NEUTRAL.paper,
  textDark: NEUTRAL.textPrimary,
  textSecondary: NEUTRAL.textSecondary,
  green: STATUS.success,
  grey: NEUTRAL.grey,
  red: STATUS.error,
  purpleAI: "#7C3AED",
  gradientAI: GRADIENTS.ai,
  gradientCrimson: GRADIENTS.crimson,
  gradientCrimsonHover: GRADIENTS.crimsonHover,
  gradientTech: GRADIENTS.tech,
} as const;
