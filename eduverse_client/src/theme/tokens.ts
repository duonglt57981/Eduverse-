// ============================================================
// EduVerse — Design Tokens (nguồn chân lý duy nhất cho giao diện)
// Chỉ chứa hằng số GIAO DIỆN. KHÔNG chứa logic nghiệp vụ.
// Mọi trang/component nên import từ đây thay vì tự khai báo màu.
// ============================================================

// ============================================================
// DARK MODE — Bảng màu bề mặt theo chế độ
// Giá trị LITERAL dùng cho palette của MUI (cần màu thật để tính
// contrast/alpha). Component KHÔNG dùng trực tiếp bộ này.
// ============================================================
export const SURFACE_LIGHT = {
  bg: "#F7F5F2",
  paper: "#FFFFFF",
  paperAlt: "#FBFAF9",
  textPrimary: "#1F2937",
  textSecondary: "#4B5563",
  textMuted: "#8A7676",
  grey: "#9CA3AF",
  divider: "#ECE7E4",
  brandTint: "#FBEFEF",
  brandBorder: "#F0DEDE",
  hover: "rgba(24,18,20,0.04)",
  selected: "rgba(139,19,19,0.08)",
  overlay: "rgba(24,18,20,0.45)",
} as const;

// Nền đen than pha xanh — KHÔNG dùng đen tuyệt đối
export const SURFACE_DARK = {
  bg: "#0F1216",
  paper: "#171B21",
  paperAlt: "#1E232B",
  textPrimary: "#F2F5F9",
  textSecondary: "#B4BCC8",
  textMuted: "#8B95A3",
  grey: "#6B7583",
  divider: "rgba(255,255,255,0.10)",
  brandTint: "rgba(139,19,19,0.18)",
  brandBorder: "rgba(196,74,74,0.32)",
  hover: "rgba(255,255,255,0.06)",
  selected: "rgba(196,74,74,0.16)",
  overlay: "rgba(0,0,0,0.62)",
} as const;

/** Tên biến CSS được ThemeProvider bơm vào :root theo chế độ sáng/tối. */
export const CSSVAR = {
  bg: "var(--ev-bg, #F7F5F2)",
  paper: "var(--ev-paper, #FFFFFF)",
  paperAlt: "var(--ev-paper-alt, #FBFAF9)",
  textPrimary: "var(--ev-text-primary, #1F2937)",
  textSecondary: "var(--ev-text-secondary, #4B5563)",
  textMuted: "var(--ev-text-muted, #8A7676)",
  grey: "var(--ev-grey, #9CA3AF)",
  divider: "var(--ev-divider, #ECE7E4)",
  brandTint: "var(--ev-brand-tint, #FBEFEF)",
  brandBorder: "var(--ev-brand-border, #F0DEDE)",
  hover: "var(--ev-hover, rgba(24,18,20,0.04))",
  selected: "var(--ev-selected, rgba(139,19,19,0.08))",
} as const;

// -------- Thương hiệu: đỏ đô (maroon) --------
export const BRAND = {
  main: "#8B1313", // Đỏ đô chủ đạo (primary)
  dark: "#6D0F0F", // Hover / nhấn
  darker: "#5C0D0D", // Đậm nhất
  light: CSSVAR.brandTint, // Nền tint nhạt — đổi theo chế độ
  border: CSSVAR.brandBorder, // Viền nhạt — đổi theo chế độ
  contrast: "#FFFFFF", // Chữ trên nền đỏ đô
} as const;


// -------- Trung tính --------
export const NEUTRAL = {
  bg: CSSVAR.bg, // Nền trang — tự đổi theo sáng/tối
  paper: CSSVAR.paper, // Nền thẻ/khối
  textPrimary: CSSVAR.textPrimary, // Chữ chính
  textSecondary: CSSVAR.textSecondary, // Chữ phụ
  textMuted: CSSVAR.textMuted, // Chữ mờ
  grey: CSSVAR.grey,
  divider: CSSVAR.divider, // Đường kẻ
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
  chuDen: CSSVAR.textPrimary,
  chuXam: NEUTRAL.textMuted,
} as const;

// Bảng màu kiểu Anh (COLORS) — hợp nhất mọi biến thể admin/dashboard
export const COLORS = {
  primary: BRAND.main, // #8B1313 (trước đây #8D1313)
  primaryLight: "#B91C1C",
  primaryDark: BRAND.dark, // #6D0F0F (trước đây #7F1D1D)
  bgLight: NEUTRAL.bg, // nền trang — đổi theo chế độ
  white: NEUTRAL.paper,
  textDark: NEUTRAL.textPrimary,
  textSecondary: NEUTRAL.textSecondary,
  green: STATUS.success,
  grey: NEUTRAL.grey,
  divider: NEUTRAL.divider,
  paperAlt: CSSVAR.paperAlt,
  hover: CSSVAR.hover,
  selected: CSSVAR.selected,
  red: STATUS.error,
  purpleAI: "#7C3AED",
  gradientAI: GRADIENTS.ai,
  gradientCrimson: GRADIENTS.crimson,
  gradientCrimsonHover: GRADIENTS.crimsonHover,
  gradientTech: GRADIENTS.tech,
} as const;
