"use client";

import AuthGuard from "@/src/components/AuthGuard";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddIcon from "@mui/icons-material/Add";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import { useDispatch, useSelector } from "@/src/store/hook";
import {
  getSoDu,
  getLichSuRutTien,
  getNganHangs,
  taoYeuCauRutTien,
  huyYeuCau,
} from "@/src/store/rutTien/RutTienSlice";
import { apiService } from "@/src/services/index";
import { BRAND, CSSVAR, STATUS } from "@/src/theme/tokens";

const PRIMARY = BRAND.main;

const getStatusChip = (trangThai?: string) => {
  const status = trangThai ?? "";
  if (status === "ChoDuyet") {
    return (
      <Chip
        label="Chờ duyệt"
        size="small"
        sx={{
          bgcolor: "#FEF3C7",
          color: "#92400E",
          fontWeight: 700,
          border: "1px solid #FDE68A",
          fontSize: "12px",
          px: 0.5,
        }}
      />
    );
  }
  if (status === "DaChuyenTien") {
    return (
      <Chip
        label="Đã chuyển tiền"
        size="small"
        sx={{
          bgcolor: "#D1FAE5",
          color: "#065F46",
          fontWeight: 700,
          border: "1px solid #A7F3D0",
          fontSize: "12px",
          px: 0.5,
        }}
      />
    );
  }
  if (status === "TuChoi") {
    return (
      <Chip
        label="Từ chối"
        size="small"
        sx={{
          bgcolor: "#FEE2E2",
          color: "#991B1B",
          fontWeight: 700,
          border: "1px solid #FCA5A5",
          fontSize: "12px",
          px: 0.5,
        }}
      />
    );
  }
  if (status === "DaHuy" || status === "DaHuyYeuCau" || status === "Huy") {
    return (
      <Chip
        label="Đã hủy"
        size="small"
        sx={{
          bgcolor: "#F3F4F6",
          color: "#374151",
          fontWeight: 700,
          border: "1px solid #E5E7EB",
          fontSize: "12px",
          px: 0.5,
        }}
      />
    );
  }
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        bgcolor: "#F3F4F6",
        color: "#374151",
        fontWeight: 700,
        fontSize: "12px",
      }}
    />
  );
};

// Bước trong flow rút tiền
type Step = "nhap-thong-tin" | "nhap-otp";

function DoanhThuContent() {
  const dispatch = useDispatch();
  const { soDu, lichSu, nganHangs } = useSelector((s) => s.rutTien);

  const [openRut, setOpenRut] = useState(false);
  const [step, setStep] = useState<Step>("nhap-thong-tin");

  // Bước 1
  const [soTienRut, setSoTienRut] = useState("");
  const [idNganHang, setIdNganHang] = useState("");

  // Bước 2
  const [otp, setOtp] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  useEffect(() => {
    dispatch(getSoDu());
    dispatch(getLichSuRutTien());
    dispatch(getNganHangs());
  }, [dispatch]);

  // Đếm ngược OTP countdown
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const t = setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCountdown]);

  const formatTien = (n?: number) =>
    n ? `${n.toLocaleString("vi-VN")}đ` : "0đ";

  const resetDialog = () => {
    setOpenRut(false);
    setStep("nhap-thong-tin");
    setSoTienRut("");
    setIdNganHang("");
    setOtp("");
    setOtpCountdown(0);
    setError("");
    setSendingOtp(false);
    setSubmitting(false);
  };

  // Bước 1: Gửi OTP
  const handleGuiOtp = async () => {
    const so = parseFloat(soTienRut);
    if (!so || so <= 0) return setError("Vui lòng nhập số tiền hợp lệ");
    if (!idNganHang) return setError("Vui lòng chọn tài khoản ngân hàng");
    if (so > soDu)
      return setError(`Số dư không đủ. Hiện có: ${formatTien(soDu)}`);
    if (so < 50000) return setError("Số tiền rút tối thiểu là 50.000đ");

    setSendingOtp(true);
    setError("");
    try {
      await apiService.post("/yeucauruttien/gui-otp", {
        soTienRut: so,
        idNganHang,
      });
      setStep("nhap-otp");
      setOtpCountdown(300); // 5 phút
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg ?? "Không thể gửi OTP. Vui lòng thử lại.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Bước 2: Xác nhận OTP và tạo yêu cầu
  const handleXacNhanOtp = async () => {
    if (!otp.trim() || otp.length !== 6)
      return setError("Vui lòng nhập mã OTP 6 số");

    setSubmitting(true);
    setError("");
    try {
      await dispatch(
        taoYeuCauRutTien({
          soTienRut: parseFloat(soTienRut),
          idNganHang,
          otp: otp.trim(),
        }),
      ).unwrap();
      setSuccess(true);
      resetDialog();
      dispatch(getSoDu());
      dispatch(getLichSuRutTien());
    } catch (e: unknown) {
      setError(
        typeof e === "string" ? e : "Mã OTP không đúng hoặc đã hết hạn.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Gửi lại OTP
  const handleGuiLaiOtp = async () => {
    setOtp("");
    setError("");
    setSendingOtp(true);
    try {
      await apiService.post("/yeucauruttien/gui-otp", {
        soTienRut: parseFloat(soTienRut),
        idNganHang,
      });
      setOtpCountdown(300);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg ?? "Không thể gửi lại OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{ fontSize: 26, fontWeight: 900, color: CSSVAR.textPrimary, mb: 0.5 }}
        >
          Doanh thu & Rút tiền
        </Typography>
        <Typography
          sx={{
            color: "var(--ev-text-secondary, rgba(31,41,55,0.55))",
            fontSize: 14,
          }}
        >
          Quản lý số dư và yêu cầu rút tiền của bạn
        </Typography>
      </Box>

      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess(false)}
          sx={{ mb: 3, borderRadius: "10px" }}
        >
          Đã gửi yêu cầu rút tiền thành công! Admin sẽ xử lý trong 1–3 ngày làm
          việc.
        </Alert>
      )}

      {/* Số dư */}
      <Card
        sx={{
          borderRadius: "16px",
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #7f1d1d 100%)`,
          color: "#fff",
          boxShadow: "0 8px 24px rgba(141,19,19,0.25)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 13, opacity: 0.8, mb: 0.5 }}>
              Số dư khả dụng
            </Typography>
            <Typography sx={{ fontSize: 36, fontWeight: 900 }}>
              {formatTien(soDu)}
            </Typography>
            <Typography sx={{ fontSize: 12, opacity: 0.7, mt: 0.5 }}>
              Tỷ lệ doanh thu: 70% mỗi khóa học được mua
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              alignItems: "flex-end",
            }}
          >
            <AccountBalanceWalletIcon sx={{ fontSize: 48, opacity: 0.4 }} />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenRut(true)}
              disabled={soDu < 50000 || nganHangs.length === 0}
              sx={{
                bgcolor: CSSVAR.paper,
                color: PRIMARY,
                fontWeight: 800,
                borderRadius: "10px",
                px: 2.5,
                "&:hover": { bgcolor: "#f5f5f5" },
                "&.Mui-disabled": {
                  bgcolor: "rgba(255,255,255,0.25)",
                  color: "#fff",
                },
              }}
            >
              Rút tiền
            </Button>
          </Box>
        </Box>
        {nganHangs.length === 0 && (
          <Alert severity="warning" sx={{ mt: 2, borderRadius: "10px" }}>
            Bạn chưa có tài khoản ngân hàng. Vui lòng thêm tài khoản trước khi
            rút tiền.
          </Alert>
        )}
        {soDu < 50000 && soDu > 0 && (
          <Alert severity="info" sx={{ mt: 2, borderRadius: "10px" }}>
            Số dư tối thiểu để rút là 50.000đ
          </Alert>
        )}
      </Card>

      {/* Lịch sử rút tiền */}
      <Card
        sx={{
          borderRadius: "16px",
          p: 2.5,
          border: "1px solid rgba(141,19,19,0.08)",
          boxShadow: "0 2px 12px rgba(141,19,19,0.06)",
        }}
      >
        <Typography
          sx={{ fontWeight: 800, fontSize: 16, mb: 2, color: "text.primary" }}
        >
          Lịch sử rút tiền
        </Typography>
        <Divider sx={{ mb: 2, borderColor: "rgba(141,19,19,0.08)" }} />

        {lichSu.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <AccountBalanceIcon sx={{ fontSize: 48, color: "#ddd", mb: 1 }} />
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Chưa có lịch sử rút tiền
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {lichSu.map((item) => (
              <Box
                key={item.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 1.5,
                  bgcolor: "#f9f8f6",
                  borderRadius: 2,
                  border:
                    item.trangThai === "ChoDuyet"
                      ? "1px solid #fde68a"
                      : "1px solid transparent",
                }}
              >
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <AccountBalanceIcon sx={{ fontSize: 18, color: PRIMARY }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                      {formatTien(item.soTienRut)}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      {item.tenNganHang} • {item.soTaiKhoan}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                      {item.ngayYeuCau
                        ? new Date(item.ngayYeuCau).toLocaleString("vi-VN")
                        : ""}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  {getStatusChip(item.trangThai)}
                  {/* Nút hủy — chỉ hiện khi ChoDuyet */}
                  {item.trangThai === "ChoDuyet" && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={async () => {
                        if (
                          !confirm(
                            "Bạn có chắc muốn hủy yêu cầu này? Tiền sẽ được hoàn lại vào số dư.",
                          )
                        )
                          return;
                        await dispatch(huyYeuCau(item.id)).unwrap();
                        dispatch(getSoDu());
                        dispatch(getLichSuRutTien());
                      }}
                      sx={{
                        borderColor: "error.main",
                        color: "error.main",
                        fontSize: 12,
                        borderRadius: "8px",
                        py: 0.3,
                        fontWeight: 700,
                        "&:hover": { bgcolor: "rgba(220,38,38,0.04)" },
                      }}
                    >
                      Hủy
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Card>

      {/* Dialog rút tiền */}
      <Dialog
        open={openRut}
        onClose={resetDialog}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "16px" } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: PRIMARY, pb: 1 }}>
          {step === "nhap-thong-tin" ? "Tạo yêu cầu rút tiền" : "Xác nhận OTP"}
        </DialogTitle>

        <DialogContent>
          {/* ── Bước 1: Nhập thông tin ── */}
          {step === "nhap-thong-tin" && (
            <>
              <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
                Số dư khả dụng: <strong>{formatTien(soDu)}</strong>
              </Typography>

              <TextField
                fullWidth
                placeholder="Số tiền rút (đ)"
                type="number"
                value={soTienRut}
                onChange={(e) => {
                  setSoTienRut(e.target.value);
                  setError("");
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    height: "44px",
                    borderRadius: "10px",
                  },
                }}
                slotProps={{ htmlInput: { min: 50000, max: soDu } }}
                helperText="Tối thiểu 50.000đ"
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <Select
                  value={idNganHang}
                  onChange={(e) => {
                    setIdNganHang(e.target.value);
                    setError("");
                  }}
                  displayEmpty
                  sx={{
                    height: "44px",
                    borderRadius: "10px",
                  }}
                >
                  <MenuItem value="" disabled>
                    <span style={{ color: "rgba(0, 0, 0, 0.38)" }}>Tài khoản ngân hàng</span>
                  </MenuItem>
                  {nganHangs.map((n) => (
                    <MenuItem key={n.id} value={n.id}>
                      {n.tenNganHang} - {n.soTaiKhoan} ({n.tenTaiKhoan})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box
                sx={{
                  bgcolor: "#FFF7ED",
                  border: "1px solid #FED7AA",
                  borderRadius: "10px",
                  p: 2,
                  mb: 1,
                }}
              >
                <Typography
                  sx={{ fontSize: 13, color: "#92400E", fontWeight: 600 }}
                >
                  📧 Sau khi nhấn tiếp theo, hệ thống sẽ gửi mã OTP đến email đã
                  đăng ký của bạn để xác nhận giao dịch.
                </Typography>
              </Box>
            </>
          )}

          {/* ── Bước 2: Nhập OTP ── */}
          {step === "nhap-otp" && (
            <>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: "rgba(141,19,19,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <EmailRoundedIcon sx={{ fontSize: 32, color: PRIMARY }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: 16, mb: 0.5 }}>
                  Kiểm tra email của bạn
                </Typography>
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                  Mã OTP 6 số đã được gửi đến email đăng ký. Nhập mã để xác nhận
                  rút{" "}
                  <strong style={{ color: PRIMARY }}>
                    {formatTien(parseFloat(soTienRut))}
                  </strong>
                  .
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Mã OTP 6 số"
                size="small"
                value={otp}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(v);
                  setError("");
                }}
                slotProps={{
                  htmlInput: {
                    maxLength: 6,
                    style: {
                      textAlign: "center",
                      fontSize: 24,
                      letterSpacing: 8,
                      fontWeight: 800,
                    },
                  },
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
                placeholder="• • • • • •"
              />

              {/* Countdown */}
              <Box sx={{ textAlign: "center", mb: 1 }}>
                {otpCountdown > 0 ? (
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    Mã hết hạn sau{" "}
                    <strong
                      style={{ color: otpCountdown < 60 ? STATUS.error : PRIMARY }}
                    >
                      {formatCountdown(otpCountdown)}
                    </strong>
                  </Typography>
                ) : (
                  <Typography
                    sx={{ fontSize: 13, color: STATUS.error, fontWeight: 600 }}
                  >
                    Mã OTP đã hết hạn
                  </Typography>
                )}
              </Box>

              {/* Gửi lại */}
              <Box sx={{ textAlign: "center" }}>
                <Button
                  size="small"
                  onClick={handleGuiLaiOtp}
                  disabled={otpCountdown > 0 || sendingOtp}
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: PRIMARY,
                    textTransform: "none",
                  }}
                >
                  {sendingOtp ? (
                    <CircularProgress size={14} sx={{ mr: 1 }} />
                  ) : null}
                  Gửi lại mã OTP
                </Button>
              </Box>
            </>
          )}

          {error && (
            <Alert
              severity="error"
              sx={{ borderRadius: "10px", mt: 1.5, fontWeight: 600 }}
            >
              {error}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={resetDialog}
            sx={{ color: "#666", borderRadius: "10px", fontWeight: 700 }}
          >
            Hủy
          </Button>

          {step === "nhap-thong-tin" && (
            <Button
              variant="contained"
              onClick={handleGuiOtp}
              disabled={sendingOtp}
              sx={{
                bgcolor: PRIMARY,
                "&:hover": { bgcolor: "#7f1d1d" },
                borderRadius: "10px",
                fontWeight: 800,
                px: 3,
              }}
            >
              {sendingOtp ? (
                <CircularProgress size={18} sx={{ color: "#fff" }} />
              ) : (
                "Tiếp theo →"
              )}
            </Button>
          )}

          {step === "nhap-otp" && (
            <>
              <Button
                onClick={() => {
                  setStep("nhap-thong-tin");
                  setOtp("");
                  setError("");
                }}
                sx={{ color: "#666", borderRadius: "10px", fontWeight: 700 }}
              >
                Quay lại
              </Button>
              <Button
                variant="contained"
                onClick={handleXacNhanOtp}
                disabled={submitting || otp.length !== 6 || otpCountdown === 0}
                sx={{
                  bgcolor: PRIMARY,
                  "&:hover": { bgcolor: "#7f1d1d" },
                  borderRadius: "10px",
                  fontWeight: 800,
                  px: 3,
                }}
              >
                {submitting ? (
                  <CircularProgress size={18} sx={{ color: "#fff" }} />
                ) : (
                  "Xác nhận"
                )}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function InstructorRevenuePage() {
  return (
    <AuthGuard allowedRoles={["GiaoVien"]}>
      <DashboardShell>
        <Box
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: "24px",
            border: "1px solid rgba(141,19,19,0.06)",
            bgcolor: CSSVAR.paper,
            boxShadow: "0 10px 30px rgba(141,19,19,0.015)",
          }}
        >
          <DoanhThuContent />
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}
