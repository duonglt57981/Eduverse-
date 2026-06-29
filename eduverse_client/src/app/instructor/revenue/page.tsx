"use client";
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
  Avatar,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddIcon from "@mui/icons-material/Add";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { useDispatch, useSelector } from "../../../store/hook";
import {
  getSoDu,
  getLichSuRutTien,
  getNganHangs,
  taoYeuCauRutTien,
} from "../../../store/rutTien/RutTienSlice";

const PRIMARY = "#9b1c1c";

const trangThaiColor: Record<string, "warning" | "success" | "error" | "info"> =
  {
    ChoDuyet: "warning",
    DaChuyenTien: "success",
    TuChoi: "error",
  };

const trangThaiLabel: Record<string, string> = {
  ChoDuyet: "Chờ duyệt",
  DaChuyenTien: "Đã chuyển tiền",
  TuChoi: "Từ chối",
};

export default function DoanhThuPage() {
  const dispatch = useDispatch();
  const { soDu, lichSu, nganHangs, loading } = useSelector((s) => s.rutTien);

  const [openRut, setOpenRut] = useState(false);
  const [soTienRut, setSoTienRut] = useState("");
  const [idNganHang, setIdNganHang] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getSoDu());
    dispatch(getLichSuRutTien());
    dispatch(getNganHangs());
  }, [dispatch]);

  const formatTien = (n?: number) =>
    n ? `${n.toLocaleString("vi-VN")}đ` : "0đ";

  const handleRutTien = async () => {
    const so = parseFloat(soTienRut);
    if (!so || so <= 0) return setError("Vui lòng nhập số tiền hợp lệ");
    if (!idNganHang) return setError("Vui lòng chọn tài khoản ngân hàng");
    if (so > soDu)
      return setError(`Số dư không đủ. Hiện có: ${formatTien(soDu)}`);
    if (so < 50000) return setError("Số tiền rút tối thiểu là 50.000đ");

    setSubmitting(true);
    setError("");
    try {
      await dispatch(taoYeuCauRutTien({ soTienRut: so, idNganHang })).unwrap();
      setSuccess(true);
      setOpenRut(false);
      setSoTienRut("");
      setIdNganHang("");
      dispatch(getSoDu());
      dispatch(getLichSuRutTien());
    } catch (e: unknown) {
      setError(typeof e === "string" ? e : "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Typography
        sx={{ fontSize: 24, fontWeight: 700, mb: 3, color: "text.primary" }}
      >
        Doanh thu & Rút tiền
      </Typography>

      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess(false)}
          sx={{ mb: 2 }}
        >
          Đã gửi yêu cầu rút tiền thành công! Admin sẽ xử lý trong 1-3 ngày làm
          việc.
        </Alert>
      )}

      {/* Số dư */}
      <Card
        sx={{
          borderRadius: 3,
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #7f1d1d 100%)`,
          color: "#fff",
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
            <Typography sx={{ fontSize: 36, fontWeight: 800 }}>
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
              gap: 1,
              alignItems: "flex-end",
            }}
          >
            <AccountBalanceWalletIcon sx={{ fontSize: 48, opacity: 0.5 }} />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenRut(true)}
              disabled={soDu < 50000 || nganHangs.length === 0}
              sx={{
                bgcolor: "#fff",
                color: PRIMARY,
                fontWeight: 700,
                borderRadius: 2,
                "&:hover": { bgcolor: "#f5f5f5" },
                "&.Mui-disabled": {
                  bgcolor: "rgba(255,255,255,0.3)",
                  color: "#fff",
                },
              }}
            >
              Rút tiền
            </Button>
          </Box>
        </Box>

        {nganHangs.length === 0 && (
          <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
            Bạn chưa có tài khoản ngân hàng. Vui lòng thêm tài khoản trước khi
            rút tiền.
          </Alert>
        )}
        {soDu < 50000 && soDu > 0 && (
          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            Số dư tối thiểu để rút là 50.000đ
          </Alert>
        )}
      </Card>

      {/* Lịch sử rút tiền */}
      <Card sx={{ borderRadius: 3, p: 2.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2 }}>
          Lịch sử rút tiền
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {lichSu.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
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
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                    {formatTien(item.soTienRut)}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    {item.tenNganHang} • {item.soTaiKhoan}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                    {item.ngayYeuCau
                      ? new Date(item.ngayYeuCau).toLocaleDateString("vi-VN")
                      : ""}
                  </Typography>
                </Box>
                <Chip
                  label={trangThaiLabel[item.trangThai ?? ""] ?? item.trangThai}
                  color={trangThaiColor[item.trangThai ?? ""] ?? "default"}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            ))}
          </Stack>
        )}
      </Card>

      {/* Dialog rút tiền */}
      <Dialog
        open={openRut}
        onClose={() => {
          setOpenRut(false);
          setError("");
        }}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Tạo yêu cầu rút tiền</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
            Số dư khả dụng: <strong>{formatTien(soDu)}</strong>
          </Typography>

          <TextField
            fullWidth
            label="Số tiền rút (đ)"
            type="number"
            size="small"
            value={soTienRut}
            onChange={(e) => {
              setSoTienRut(e.target.value);
              setError("");
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                borderColor: PRIMARY,
              },
            }}
            slotProps={{
              htmlInput: {
                min: 50000,
                max: soDu,
              },
            }}
            helperText="Tối thiểu 50.000đ"
          />

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Tài khoản ngân hàng</InputLabel>
            <Select
              value={idNganHang}
              onChange={(e) => setIdNganHang(e.target.value)}
              label="Tài khoản ngân hàng"
            >
              {nganHangs.map((n) => (
                <MenuItem key={n.id} value={n.id}>
                  {n.tenNganHang} - {n.soTaiKhoan} ({n.tenTaiKhoan})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setOpenRut(false);
              setError("");
            }}
            sx={{ color: "#666" }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleRutTien}
            disabled={submitting}
            sx={{
              bgcolor: PRIMARY,
              "&:hover": { bgcolor: "#7f1d1d" },
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            {submitting ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              "Gửi yêu cầu"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
