import { createTheme } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import {
  BRAND,
  STATUS,
  RADIUS,
  SHADOWS,
  FONT_FAMILY,
  SURFACE_LIGHT,
  SURFACE_DARK,
} from "./tokens";

/**
 * Theme MUI dùng chung cho toàn hệ thống EduVerse.
 * Mọi khu vực (landing, auth, dashboard, admin, instructor, student)
 * tạo theme từ đây để đồng bộ màu, bo góc, kiểu chữ và component.
 *
 * Chỉ định nghĩa GIAO DIỆN — không đụng tới logic/nghiệp vụ.
 *
 * @param mode        'light' | 'dark'
 * @param primaryMain màu chủ đạo (mặc định: đỏ đô thương hiệu)
 * @param primaryDark màu hover/nhấn của màu chủ đạo
 */
export function createAppTheme(
  mode: "light" | "dark" = "light",
  primaryMain: string = BRAND.main,
  primaryDark: string = BRAND.dark,
): Theme {
  const isDark = mode === "dark";
  const S = isDark ? SURFACE_DARK : SURFACE_LIGHT;

  return createTheme({
    palette: {
      mode,
      primary: { main: primaryMain, dark: primaryDark, contrastText: "#ffffff" },
      success: { main: STATUS.success },
      warning: { main: STATUS.warning },
      error: { main: STATUS.error },
      info: { main: STATUS.info },
      background: { default: S.bg, paper: S.paper },
      text: { primary: S.textPrimary, secondary: S.textSecondary },
      divider: S.divider,
      action: {
        hover: S.hover,
        selected: S.selected,
        disabled: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.26)",
        disabledBackground: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
      },
    },
    shape: { borderRadius: RADIUS.base },
    typography: {
      fontFamily: FONT_FAMILY,
      h1: { fontWeight: 900, letterSpacing: "-1px" },
      h2: { fontWeight: 900, letterSpacing: "-0.8px" },
      h3: { fontWeight: 900, letterSpacing: "-0.7px" },
      h4: { fontWeight: 800, letterSpacing: "-0.5px" },
      h5: { fontWeight: 800 },
      h6: { fontWeight: 800 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 700 },
    },
    components: {
      // Bơm biến CSS vào :root -> mọi nơi dùng COLORS/MAU tự đổi theo chế độ
      MuiCssBaseline: {
        styleOverrides: {
          ":root": {
            colorScheme: mode,
            "--ev-bg": S.bg,
            "--ev-paper": S.paper,
            "--ev-paper-alt": S.paperAlt,
            "--ev-text-primary": S.textPrimary,
            "--ev-text-secondary": S.textSecondary,
            "--ev-text-muted": S.textMuted,
            "--ev-grey": S.grey,
            "--ev-divider": S.divider,
            "--ev-brand-tint": S.brandTint,
            "--ev-brand-border": S.brandBorder,
            "--ev-hover": S.hover,
            "--ev-selected": S.selected,
            "--ev-overlay": S.overlay,
            "--ev-brand": primaryMain,
          },
          "html, body": { backgroundColor: S.bg, color: S.textPrimary },
          // Thanh cuộn hợp tông nền tối
          "*::-webkit-scrollbar": { width: 10, height: 10 },
          "*::-webkit-scrollbar-track": { background: "transparent" },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: isDark ? "rgba(255,255,255,0.18)" : "rgba(24,18,20,0.18)",
            borderRadius: 8,
          },
          "*::-webkit-scrollbar-thumb:hover": {
            backgroundColor: isDark ? "rgba(255,255,255,0.28)" : "rgba(24,18,20,0.28)",
          },
          // Ảnh/logo KHÔNG bị đảo màu trong chế độ tối
          "img, video, canvas, svg.no-invert": { filter: "none" },
        },
      },
      MuiPopover: { styleOverrides: { paper: { backgroundColor: S.paper, backgroundImage: "none" } } },
      MuiMenu: { styleOverrides: { paper: { backgroundColor: S.paper, backgroundImage: "none" } } },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            "&:hover": { backgroundColor: S.hover },
            "&.Mui-selected": { backgroundColor: S.selected },
            "&.Mui-selected:hover": { backgroundColor: S.selected },
          },
        },
      },
      MuiDrawer: { styleOverrides: { paper: { backgroundColor: S.paper, backgroundImage: "none" } } },
      MuiAppBar: {
        styleOverrides: { root: { backgroundColor: S.paper, backgroundImage: "none", color: S.textPrimary } },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backgroundColor: S.overlay,
            // Select/Menu/Popover dùng Backdrop với trạng thái invisible để bắt
            // click bên ngoài. Giữ lớp này trong suốt để trang không bị tối.
            "&.MuiBackdrop-invisible": { backgroundColor: "transparent" },
          },
        },
      },
      MuiDivider: { styleOverrides: { root: { borderColor: S.divider } } },
      MuiTableRow: {
        styleOverrides: { root: { "&:hover": { backgroundColor: S.hover } } },
      },
      MuiTablePagination: { styleOverrides: { root: { color: S.textSecondary } } },
      MuiPaginationItem: {
        styleOverrides: {
          root: { color: S.textSecondary, "&.Mui-selected": { color: "#ffffff" } },
        },
      },
      MuiInputBase: { styleOverrides: { input: { "&::placeholder": { color: S.textMuted, opacity: 1 } } } },
      MuiInputLabel: { styleOverrides: { root: { color: S.textSecondary } } },
      MuiFormHelperText: { styleOverrides: { root: { color: S.textMuted } } },
      MuiSelect: { styleOverrides: { icon: { color: S.textSecondary } } },
      MuiCheckbox: { styleOverrides: { root: { color: S.grey } } },
      MuiRadio: { styleOverrides: { root: { color: S.grey } } },
      MuiSwitch: { styleOverrides: { track: { backgroundColor: S.grey } } },
      MuiSkeleton: {
        styleOverrides: {
          root: { backgroundColor: isDark ? "rgba(255,255,255,0.09)" : "rgba(24,18,20,0.08)" },
        },
      },
      MuiAlert: { styleOverrides: { root: { borderRadius: RADIUS.base } } },
      MuiSnackbarContent: {
        styleOverrides: { root: { backgroundColor: S.paperAlt, color: S.textPrimary } },
      },
      MuiAutocomplete: {
        styleOverrides: { paper: { backgroundColor: S.paper, backgroundImage: "none" } },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS.base,
            fontWeight: 700,
            paddingTop: 9,
            paddingBottom: 9,
            paddingLeft: 18,
            paddingRight: 18,
          },
          contained: {
            color: "#ffffff",
            boxShadow: "none",
            "&:hover": { boxShadow: SHADOWS.sm },
          },
          sizeLarge: { paddingTop: 12, paddingBottom: 12, fontSize: 15 },
          sizeSmall: { paddingTop: 5, paddingBottom: 5 },
        },
      },
      MuiIconButton: {
        styleOverrides: { root: { borderRadius: RADIUS.sm } },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS.base,
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: primaryMain,
              borderWidth: 1.5,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
          rounded: { borderRadius: RADIUS.base },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS.card,
            boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.45)" : SHADOWS.card,
            backgroundImage: "none",
          },
        },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 700, borderRadius: RADIUS.sm } },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: RADIUS.card, backgroundColor: S.paper, backgroundImage: "none" },
        },
      },
      MuiTab: {
        styleOverrides: { root: { textTransform: "none", fontWeight: 700 } },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 800,
            color: S.textPrimary,
            borderBottomColor: S.divider,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { borderRadius: RADIUS.sm, fontSize: 12, fontWeight: 600 },
        },
      },
    },
  });
}

/** Theme sáng mặc định (đỏ đô thương hiệu). */
export const appLightTheme = createAppTheme("light");
