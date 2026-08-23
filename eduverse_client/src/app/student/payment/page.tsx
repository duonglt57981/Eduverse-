"use client";

import AuthGuard from "@/src/components/AuthGuard";
import StudentDashboardShell from "@/src/components/dashboard/StudentDashboardShell";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Divider,
  Stack,
  CircularProgress,
  Dialog,
  DialogContent,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import ShieldIcon from "@mui/icons-material/Shield";
import LoopIcon from "@mui/icons-material/Loop";
import SchoolIcon from "@mui/icons-material/School";
import { useDispatch, useSelector } from "@/src/store/hook";
import { getGioHang } from "@/src/store/gioHang/GioHangSlice";
import {
  taoThanhToan,
  clearPaymentResponse,
} from "@/src/store/thanhToan/ThanhToanSlice";
import { useRouter } from "next/navigation";
import { apiService } from "@/src/services/index";
import { DonHangDto } from "@/src/types/thanhToan";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { BRAND, CSSVAR, STATUS } from "@/src/theme/tokens";

// ✅ Thay MaGiamGiaResponse (1 mã) bằng shape nhiều mã
interface KetQuaApDungMa {
  maGiamGia: string;
  hopLe: boolean;
  thongBao: string;
  phanTramGiam?: number;
  soTienGiam?: number;
}
interface ApDungNhieuMaResponse {
  ketQua: KetQuaApDungMa[];
  soTienGoc: number;
  tongSoTienGiam: number;
  soTienSauGiam: number;
}

const PRIMARY = BRAND.main;
const steps = ["Giỏ hàng", "Thanh toán", "Hoàn tất"];

function ThanhToanContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { gioHang } = useSelector((s) => s.gioHang);
  const { loading, paymentResponse } = useSelector((s) => s.thanhToan);

  const [openQR, setOpenQR] = useState(false);
  const [ketQuaMa, setKetQuaMa] = useState<ApDungNhieuMaResponse | null>(null); // ✅

  const daChonItems = gioHang?.items.filter((i) => i.daChon) ?? [];
  const tongTien = gioHang?.tongTienDaChon ?? 0;

  const THOI_GIAN_QR = 5 * 60; // 5 phút (giây)
  const [countdown, setCountdown] = useState(THOI_GIAN_QR);
  const [hetHan, setHetHan] = useState(false);

  useEffect(() => {
    dispatch(getGioHang());
    dispatch(clearPaymentResponse());
  }, [dispatch]);

  useEffect(() => {
    if (!openQR || !paymentResponse) return;
    const interval = setInterval(async () => {
      try {
        const data = await apiService.get<DonHangDto>(
          `/thanhtoan/don-hang/${paymentResponse.donHangId}`,
        );
        const trangThai = data?.data?.trangThai;
        if (trangThai === 1) {
          clearInterval(interval);
          setOpenQR(false);
          dispatch(getGioHang());
          router.push(
            `/student/payment-result?code=00&orderCode=${paymentResponse.maGiaoDich?.replace("EDU", "")}`,
          );
        }
      } catch (e) {
        console.log("Polling error:", e);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [openQR, paymentResponse]);

  useEffect(() => {
    if (!openQR) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCountdown(THOI_GIAN_QR);
      setHetHan(false);
      return;
    }
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setHetHan(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [openQR]);

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // ✅ Đọc danh sách mã từ sessionStorage (key mới: "dsMaGiamGia", giá trị JSON array)
  useEffect(() => {
    const raw = sessionStorage.getItem("dsMaGiamGia");
    if (!raw || daChonItems.length === 0) return;

    let dsMa: string[] = [];
    try {
      dsMa = JSON.parse(raw);
    } catch {
      return;
    }
    if (!Array.isArray(dsMa) || dsMa.length === 0) return;

    const ids = daChonItems.map((i) => i.idKhoaHoc!).filter(Boolean);
    apiService
      .post<ApDungNhieuMaResponse>("/thanhtoan/kiem-tra-ma-giam-gia", {
        danhSachMa: dsMa,
        khoaHocIds: ids,
      })
      .then((res) => {
        if (res.data) setKetQuaMa(res.data);
      })
      .catch(() => {});
  }, [daChonItems.length]);

  const formatGia = (gia?: number) =>
    gia ? `${gia.toLocaleString("vi-VN")}đ` : "0đ";

  const handleXacNhan = async () => {
    const ids = daChonItems.map((i) => i.idKhoaHoc!).filter(Boolean);

    // ✅ Đọc lại danh sách mã, gửi nguyên mảng lên BE (BE tự tính lại giảm giá,
    // không tin số tiền FE hiển thị)
    const raw = sessionStorage.getItem("dsMaGiamGia");
    let danhSachMaGiamGia: string[] | undefined;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0)
          danhSachMaGiamGia = parsed;
      } catch {
        danhSachMaGiamGia = undefined;
      }
    }

    const result = await dispatch(
      taoThanhToan({ khoaHocIds: ids, danhSachMaGiamGia }), // ✅ đổi field
    );
    if (taoThanhToan.fulfilled.match(result)) {
      sessionStorage.removeItem("dsMaGiamGia"); // ✅ đổi key
      setOpenQR(true);
    }
  };

  if (daChonItems.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <Typography sx={{ fontSize: 40, mb: 2 }}>🛒</Typography>
        <Typography sx={{ color: "text.secondary", mb: 3, fontSize: 15 }}>
          Không có khóa học nào được chọn
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push("/student/cart")}
          sx={{
            bgcolor: PRIMARY,
            "&:hover": { bgcolor: "#7f1d1d" },
            borderRadius: "10px",
            fontWeight: 700,
            px: 4,
            py: 1.2,
          }}
        >
          Quay lại giỏ hàng
        </Button>
      </Box>
    );
  }

  // ✅ Số tiền hiển thị: dùng kết quả nhiều mã nếu có, không thì giá gốc
  const soTienGiam = ketQuaMa?.tongSoTienGiam ?? 0;
  const soTienSauGiam = ketQuaMa?.soTienSauGiam ?? tongTien;
  const coApDungMaHopLe = !!ketQuaMa && ketQuaMa.tongSoTienGiam > 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{ fontSize: 26, fontWeight: 900, color: PRIMARY, mb: 0.5 }}
        >
          Thanh toán
        </Typography>
        <Typography
          sx={{
            color: "var(--ev-text-secondary, rgba(31,41,55,0.55))",
            fontSize: 14,
          }}
        >
          Xác nhận đơn hàng và hoàn tất thanh toán
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={1} sx={{ mb: 5, maxWidth: 460, mx: "auto" }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel
              sx={{
                "& .MuiStepLabel-label": { fontSize: 13, fontWeight: 600 },
                "& .MuiStepIcon-root.Mui-active": { color: PRIMARY },
                "& .MuiStepIcon-root.Mui-completed": { color: PRIMARY },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={3}>
        {/* Left: Order info + Instructions */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography
            sx={{ fontSize: 16, fontWeight: 800, mb: 2, color: "text.primary" }}
          >
            Thông tin đơn hàng
          </Typography>

          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: "0 2px 12px rgba(141,19,19,0.06)",
              border: "1px solid rgba(141,19,19,0.08)",
              p: 2.5,
              mb: 2.5,
            }}
          >
            <Stack spacing={2}>
              {daChonItems.map((item) => (
                <Box
                  key={item.id}
                  sx={{ display: "flex", gap: 2, alignItems: "center" }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 48,
                      borderRadius: "8px",
                      overflow: "hidden",
                      flexShrink: 0,
                      bgcolor: "#eee",
                    }}
                  >
                    {item.hinhAnh && (
                      <img
                        src={item.hinhAnh}
                        alt={item.tenKhoaHoc}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.tenKhoaHoc}
                    </Typography>
                    {/* ✅ Nếu khóa học này được 1 mã giảm giá, hiện rõ */}
                    {ketQuaMa?.ketQua.find(
                      (k) => k.hopLe && item.idKhoaHoc, // BE không trả idKhoaHocDuocGiam ở đây trong interface rút gọn này, xem ghi chú bên dưới
                    ) && null}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: PRIMARY,
                      flexShrink: 0,
                    }}
                  >
                    {formatGia(item.gia)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Card>

          {/* QR Instructions */}
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: "0 2px 12px rgba(141,19,19,0.06)",
              border: "1px solid rgba(141,19,19,0.08)",
              p: 2.5,
            }}
          >
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 14,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "text.primary",
              }}
            >
              <QrCode2Icon sx={{ color: PRIMARY }} />
              Hướng dẫn thanh toán QR
            </Typography>

            <Stack spacing={1.5}>
              {[
                'Bấm "Xác nhận thanh toán" bên dưới',
                "Mở app ngân hàng và quét mã QR hiện ra",
                "Thông tin chuyển khoản sẽ tự động điền (số tiền + nội dung)",
                "Xác nhận OTP trên điện thoại",
                "Hệ thống tự động kích hoạt khóa học sau khi nhận tiền",
              ].map((step, i) => (
                <Box
                  key={i}
                  sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}
                >
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      bgcolor: PRIMARY,
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {i + 1}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "text.secondary",
                      lineHeight: 1.6,
                    }}
                  >
                    {step}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>

        {/* Right: Summary + Confirm */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: "0 2px 12px rgba(141,19,19,0.06)",
              border: "1px solid rgba(141,19,19,0.08)",
              p: 2.5,
              position: "sticky",
              top: 80,
            }}
          >
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 15,
                mb: 2,
                color: "text.primary",
              }}
            >
              Tóm tắt đơn hàng
            </Typography>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                Tạm tính ({daChonItems.length} khóa học)
              </Typography>
              <Typography sx={{ fontSize: 13 }}>
                {formatGia(tongTien)}
              </Typography>
            </Box>

            {/* ✅ Hiện từng mã đã áp, không gộp thành 1 % chung nữa vì mỗi mã
                có thể có % khác nhau và áp cho khóa học khác nhau */}
            {ketQuaMa && ketQuaMa.ketQua.some((k) => k.hopLe) && (
              <Box sx={{ mb: 1 }}>
                {ketQuaMa.ketQua
                  .filter((k) => k.hopLe)
                  .map((k) => (
                    <Box
                      key={k.maGiamGia}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        sx={{ fontSize: 12.5, color: "text.secondary" }}
                      >
                        Mã {k.maGiamGia} ({k.phanTramGiam}%)
                      </Typography>
                      <Typography
                        sx={{ fontSize: 12.5, color: "success.main" }}
                      >
                        -{formatGia(k.soTienGiam)}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            )}

            <Divider sx={{ my: 2, borderColor: "rgba(141,19,19,0.1)" }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                Tổng cộng
              </Typography>
              <Typography
                sx={{ fontWeight: 900, fontSize: 24, color: PRIMARY }}
              >
                {formatGia(soTienSauGiam)} {/* ✅ */}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              onClick={handleXacNhan}
              startIcon={
                loading ? (
                  <CircularProgress size={18} sx={{ color: "#fff" }} />
                ) : (
                  <QrCode2Icon />
                )
              }
              sx={{
                bgcolor: PRIMARY,
                "&:hover": { bgcolor: "#7f1d1d" },
                borderRadius: "10px",
                fontWeight: 800,
                fontSize: 15,
                py: 1.5,
                mb: 2,
              }}
            >
              {loading ? "Đang tạo QR..." : "Xác nhận thanh toán"}
            </Button>

            <Stack spacing={1}>
              {[
                {
                  icon: <ShieldIcon fontSize="small" />,
                  text: "Thanh toán an toàn & bảo mật 100%",
                },
                {
                  icon: <LoopIcon fontSize="small" />,
                  text: "Hoàn tiền trong 30 ngày nếu không hài lòng",
                },
                {
                  icon: <SchoolIcon fontSize="small" />,
                  text: "Gia hạn 6 tháng",
                },
              ].map((item, i) => (
                <Box
                  key={i}
                  sx={{ display: "flex", gap: 1, alignItems: "center" }}
                >
                  <Box sx={{ color: "success.main", display: "flex" }}>
                    {item.icon}
                  </Box>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Typography
              sx={{
                fontSize: 11,
                color: "text.disabled",
                textAlign: "center",
                mt: 2,
              }}
            >
              Bằng cách xác nhận, bạn đồng ý với Điều khoản dịch vụ của EduVerse
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* QR Dialog */}
      <Dialog
        open={openQR}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "20px", p: 1 } } }}
      >
        <DialogContent>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontWeight: 900, fontSize: 18, mb: 0.5 }}>
              Quét mã để thanh toán
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 3 }}>
              Mở app ngân hàng và quét mã QR bên dưới
            </Typography>

            <Box
              sx={{
                width: 220,
                height: 220,
                mx: "auto",
                mb: 2,
                border: `3px solid ${PRIMARY}`,
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: CSSVAR.paper,
              }}
            >
              {paymentResponse?.qrCode ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentResponse.qrCode)}`}
                  alt="QR Code"
                  width={200}
                  height={200}
                />
              ) : (
                <CircularProgress sx={{ color: PRIMARY }} />
              )}
            </Box>
            <Box sx={{ mt: 1.5, mb: 1 }}>
              {hetHan ? (
                <Box>
                  <Alert
                    severity="error"
                    sx={{ borderRadius: 2, mb: 1, fontSize: 12 }}
                  >
                    Mã QR đã hết hạn! Vui lòng tạo đơn hàng mới.
                  </Alert>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      setOpenQR(false);
                      setHetHan(false);
                    }}
                    sx={{
                      borderColor: PRIMARY,
                      color: PRIMARY,
                      borderRadius: 2,
                      fontWeight: 700,
                    }}
                  >
                    Tạo lại đơn hàng
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <AccessTimeIcon
                      sx={{
                        fontSize: 18,
                        color:
                          countdown <= 60
                            ? "error.main"
                            : countdown <= 180
                              ? STATUS.warningDark
                              : "text.secondary",
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: 20,
                        fontWeight: 900,
                        fontFamily: "monospace",
                        color:
                          countdown <= 60
                            ? "error.main"
                            : countdown <= 180
                              ? STATUS.warningDark
                              : "text.primary",
                        animation:
                          countdown <= 30
                            ? "blink 1s step-end infinite"
                            : "none",
                        "@keyframes blink": {
                          "0%,100%": { opacity: 1 },
                          "50%": { opacity: 0.3 },
                        },
                      }}
                    >
                      {formatCountdown(countdown)}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 12,
                        color:
                          countdown <= 60
                            ? "error.main"
                            : countdown <= 180
                              ? STATUS.warningDark
                              : "text.secondary",
                      }}
                    >
                      {countdown <= 60
                        ? "⚠️ Sắp hết hạn!"
                        : countdown <= 180
                          ? "Còn ít thời gian"
                          : "còn lại"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      height: 4,
                      bgcolor: "#f0f0f0",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: `${(countdown / THOI_GIAN_QR) * 100}%`,
                        bgcolor:
                          countdown <= 60
                            ? "error.main"
                            : countdown <= 180
                              ? STATUS.warningDark
                              : PRIMARY,
                        borderRadius: 2,
                        transition: "width 1s linear, background-color 0.3s",
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Box>

            <Chip
              label={`Số tiền: ${formatGia(coApDungMaHopLe ? soTienSauGiam : paymentResponse?.soTien)}`}
              sx={{
                bgcolor: "#fff0f0",
                color: PRIMARY,
                fontWeight: 700,
                fontSize: 14,
                mb: 1,
              }}
            />

            {paymentResponse?.maGiaoDich && (
              <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 2 }}>
                Mã đơn hàng: <strong>{paymentResponse.maGiaoDich}</strong>
              </Typography>
            )}

            <Alert
              severity="info"
              sx={{ textAlign: "left", fontSize: 12, mb: 2 }}
            >
              Hệ thống đang chờ xác nhận thanh toán. Sau khi chuyển khoản thành
              công, trang sẽ tự động chuyển.
            </Alert>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                mb: 2,
              }}
            >
              <CircularProgress size={16} sx={{ color: PRIMARY }} />
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                Đang chờ xác nhận...
              </Typography>
            </Box>

            {paymentResponse?.checkoutUrl && (
              <Button
                fullWidth
                variant="outlined"
                size="small"
                href={paymentResponse.checkoutUrl}
                target="_blank"
                sx={{
                  borderColor: PRIMARY,
                  color: PRIMARY,
                  borderRadius: "10px",
                  fontSize: 13,
                  mb: 1,
                }}
              >
                Mở trang thanh toán PayOS
              </Button>
            )}

            <Button
              fullWidth
              variant="text"
              size="small"
              color="inherit"
              onClick={() => setOpenQR(false)}
              sx={{ fontSize: 13, color: "#999" }}
            >
              Hủy thanh toán
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default function StudentCheckoutPage() {
  return (
    <AuthGuard allowedRoles={["HocVien", "GiaoVien"]}>
      <StudentDashboardShell>
        <Box
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: "24px",
            border: "1px solid rgba(141,19,19,0.06)",
            bgcolor: CSSVAR.paper,
            boxShadow: "0 10px 30px rgba(141,19,19,0.015)",
          }}
        >
          <ThanhToanContent />
        </Box>
      </StudentDashboardShell>
    </AuthGuard>
  );
}
