import { createTheme } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import { BRAND, NEUTRAL, STATUS, RADIUS, SHADOWS, FONT_FAMILY } from "./tokens";

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

  return createTheme({
    palette: {
      mode,
      primary: { main: primaryMain, dark: primaryDark, contrastText: "#ffffff" },
      success: { main: STATUS.success },
      warning: { main: STATUS.warning },
      error: { main: STATUS.error },
      info: { main: STATUS.info },
      background: {
        default: isDark ? "#0B0E12" : NEUTRAL.bg,
        paper: isDark ? "#15191F" : NEUTRAL.paper,
      },
      text: {
        primary: isDark ? "#F4F7FB" : NEUTRAL.textPrimary,
        secondary: isDark ? "#A8B0BD" : NEUTRAL.textSecondary,
      },
      divider: isDark ? "rgba(255,255,255,0.10)" : NEUTRAL.divider,
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
        styleOverrides: { rounded: { borderRadius: RADIUS.base } },
      },
      MuiCard: {
        styleOverrides: {
          root: { borderRadius: RADIUS.card, boxShadow: SHADOWS.card },
        },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 700, borderRadius: RADIUS.sm } },
      },
      MuiDialog: {
        styleOverrides: { paper: { borderRadius: RADIUS.card } },
      },
      MuiTab: {
        styleOverrides: { root: { textTransform: "none", fontWeight: 700 } },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 800,
            color: isDark ? "#F4F7FB" : NEUTRAL.textPrimary,
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
