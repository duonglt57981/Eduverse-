"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "../../../store/hook";
import { login, clearError, clearSuccess } from "../../../store/auth/AuthSlice";
import GoogleAuthButton from "../../../components/auth/GoogleAuthButton";
import {
  Box,
  CssBaseline,
  Paper,
  Typography,
  Link as MuiLink,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Divider,
  FormControl,
  OutlinedInput,
} from "@mui/material";
import {
  PersonRounded,
  LockRounded,
  VisibilityRounded,
  VisibilityOffRounded,
} from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import { createAppTheme } from "@/src/theme/createAppTheme";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, successMessage } = useSelector((s) => s.auth);

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleSize, setGoogleSize] = useState({ width: 0, height: 44 });

  const theme = useMemo(() => createAppTheme("light"), []);

  // Xoá lỗi và thông báo thành công Redux khi mount/unmount trang
  useEffect(() => {
    dispatch(clearError());
    return () => {
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  // Gộp thông tin lỗi
  const activeError = errorMsg || googleError || error;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !password) {
      setErrorMsg("Vui lòng điền đầy đủ tên đăng nhập/email và mật khẩu.");
      return;
    }
    setErrorMsg(null);
    try {
      const result = await dispatch(
        login({ userName: userName.trim(), password }),
      );
      if (login.fulfilled.match(result)) {
        console.log("Login successful:", result);
        const roles: string[] = result.payload.roles || [];
        if (roles.includes("Admin")) {
          router.push("/admin/dashboard");
        } else if (roles.includes("GiaoVien")) {
          router.push("/instructor/dashboard");
        } else if (roles.includes("personnel")) {
          router.push("/personnel/courses");
        } else {
          router.push("/student/dashboard");
        }
      } else {
        setErrorMsg(
          (result.payload as string) ||
            "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
        );
      }
    } catch (err) {
      setErrorMsg("Có lỗi xảy ra trong quá trình đăng nhập.");
    }
  };

  const inputSx = {
    height: 44,
    borderRadius: 3,
    bgcolor: "rgba(17,17,17,0.035)",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "var(--ev-divider, rgba(17,17,17,0.08))",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(17,17,17,0.16)",
    },
    "&.Mui-focused": {
      bgcolor: "rgba(17,17,17,0.03)",
      boxShadow: "0 0 0 4px rgba(139,19,19,0.14)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(139,19,19,0.38)",
    },
  } as const;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "var(--ev-paper-alt, #F7F5F2)",
          px: 2.5,
          py: 4,
          position: "relative",
        }}
      >
        {/* Floating Back to Home button */}
        <Box
          sx={{
            position: "absolute",
            top: { xs: 16, sm: 24 },
            left: { xs: 16, sm: 24 },
            zIndex: 999,
          }}
        >
          <NextLink href="/" style={{ textDecoration: "none" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "var(--ev-text-secondary, #4B5563)",
                fontWeight: 600,
                fontSize: 14.5,
                transition: "color 200ms ease",
                cursor: "pointer",
                "&:hover": {
                  color: "#8B1313",
                },
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Quay lại trang chủ
            </Box>
          </NextLink>
        </Box>

        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 500,
            borderRadius: "28px",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            boxShadow: "0 16px 40px rgba(30, 41, 59, 0.06)",
            backgroundColor: "var(--ev-paper, #ffffff)",
            p: { xs: 4, sm: 5.5 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3.5,
          }}
        >
          {/* Logo & Header */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2.5,
              width: "100%",
            }}
          >
            <Box
              sx={{
                width: 250,
                height: "auto",
                mb: 1,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <NextLink href="/" style={{ display: "block", width: "100%" }}>
                <Image
                  src="/auth/img/logo_nentrang.png"
                  alt="EduVerse"
                  width={270}
                  height={70}
                  priority
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                    cursor: "pointer",
                  }}
                />
              </NextLink>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: "var(--ev-text-primary, #1F2937)",
                  fontSize: 26,
                  letterSpacing: "-0.5px",
                  mb: 1.5,
                }}
              >
                Chào mừng trở lại!
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "var(--ev-text-secondary, #4B5563)",
                  fontSize: 15,
                  lineHeight: 1.6,
                }}
              >
                Đăng nhập để tiếp tục hành trình học tập tại EduVerse
              </Typography>
            </Box>
          </Box>

          {/* Alert Error */}
          {activeError && (
            <Paper
              elevation={0}
              sx={{
                width: "100%",
                px: 3,
                py: 2,
                borderRadius: "14px",
                border: "1px solid #FECACA",
                background: "#FEF2F2",
                color: "#8B1313",
                fontSize: 14,
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              {activeError}
            </Paper>
          )}

          {/* Alert Success */}
          {successMessage && (
            <Paper
              elevation={0}
              sx={{
                width: "100%",
                px: 3,
                py: 2,
                borderRadius: "14px",
                border: "1px solid rgba(10,90,58,0.25)",
                background: "rgba(10,90,58,0.06)",
                color: "#0a5a3a",
                fontSize: 14,
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              {successMessage}
            </Paper>
          )}

          {/* Login Form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2.25,
            }}
          >
            <FormControl fullWidth>
              <OutlinedInput
                placeholder="Tên đăng nhập hoặc Email"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                disabled={loading}
                startAdornment={
                  <InputAdornment position="start">
                    <PersonRounded
                      sx={{
                        color: "var(--ev-text-muted, rgba(17,17,17,0.35))",
                      }}
                    />
                  </InputAdornment>
                }
                sx={inputSx}
              />
            </FormControl>

            <FormControl fullWidth>
              <OutlinedInput
                placeholder="Mật khẩu"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                startAdornment={
                  <InputAdornment position="start">
                    <LockRounded
                      sx={{
                        color: "var(--ev-text-muted, rgba(17,17,17,0.35))",
                      }}
                    />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: "rgba(17,17,17,0.35)" }}
                    >
                      {showPassword ? (
                        <VisibilityOffRounded />
                      ) : (
                        <VisibilityRounded />
                      )}
                    </IconButton>
                  </InputAdornment>
                }
                sx={inputSx}
              />
            </FormControl>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: -1,
                position: "relative",
                zIndex: 999,
              }}
            >
              <a
                href="/auth/forgot-password"
                style={{ textDecoration: "none" }}
              >
                <Box
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#8B1313",
                    cursor: "pointer",
                    "&:hover": {
                      textDecoration: "underline",
                      color: "#5c1111",
                    },
                  }}
                >
                  Quên mật khẩu?
                </Box>
              </a>
            </Box>

            <Button
              type="submit"
              disabled={loading}
              variant="contained"
              sx={{
                width: "100%",
                height: 44,
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 15,
                textTransform: "none",
                background:
                  "linear-gradient(90deg, #8B1313 0%, #8B1313 55%, #6b1414 100%)",
                boxShadow: "0 10px 24px rgba(139,19,19,0.2)",
                "&:hover": {
                  background:
                    "linear-gradient(90deg, #8B1313 0%, #6b1414 60%, #5c1111 100%)",
                },
              }}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </Box>

          {/* Divider */}
          <Divider sx={{ width: "100%", opacity: 0.35, my: 0.5 }}>
            <Typography
              sx={{
                fontSize: 10.5,
                fontWeight: 900,
                color: "var(--ev-text-muted, rgba(17,17,17,0.45))",
              }}
            >
              HOẶC TIẾP TỤC VỚI
            </Typography>
          </Divider>

          {/* Google Login Button Container */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              py: 0.5,
            }}
          >
            <GoogleAuthButton
              text="signin_with"
              theme="filled_blue"
              height={44}
              maxWidth={1000}
              onError={setGoogleError}
              onSize={setGoogleSize}
            />
          </Box>

          {/* Suggest Register */}
          <Typography
            sx={{
              textAlign: "center",
              fontSize: 13.5,
              color: "rgba(17,17,17,0.60)",
              position: "relative",
              zIndex: 999,
            }}
          >
            Chưa có tài khoản?{" "}
            <a href="/auth/register" style={{ textDecoration: "none" }}>
              <Box
                component="span"
                sx={{
                  color: "#8B1313",
                  fontWeight: 900,
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline", color: "#5c1111" },
                }}
              >
                Đăng ký ngay
              </Box>
            </a>
          </Typography>

          {/* Elegant Footer */}
          <Typography
            sx={{
              textAlign: "center",
              fontSize: 12.5,
              color: "#8A7676",
              lineHeight: 1.6,
              position: "relative",
              zIndex: 999,
              mt: 1,
            }}
          >
            Bằng cách đăng nhập, bạn đồng ý với{" "}
            <a href="/auth/terms" style={{ textDecoration: "none" }}>
              <Box
                component="span"
                sx={{
                  color: "#8B1313",
                  fontWeight: 600,
                  cursor: "pointer",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Điều khoản Dịch vụ
              </Box>
            </a>{" "}
            và{" "}
            <a href="/auth/privacy" style={{ textDecoration: "none" }}>
              <Box
                component="span"
                sx={{
                  color: "#8B1313",
                  fontWeight: 600,
                  cursor: "pointer",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Chính sách Bảo mật
              </Box>
            </a>{" "}
            của EduVerse.
          </Typography>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
