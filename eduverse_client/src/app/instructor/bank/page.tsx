'use client';

import AuthGuard from '@/src/components/AuthGuard';
import DashboardShell from '@/src/components/dashboard/DashboardShell';
import { useEffect, useState } from "react";
import {
  Box, Typography, Card, Button, Divider, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Alert, IconButton, Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import { useDispatch, useSelector } from "@/src/store/hook";
import { getNganHangs, xoaNganHang } from "@/src/store/rutTien/RutTienSlice";
import { apiService } from '@/src/services';

const PRIMARY = "#8D1313";

const NGAN_HANG_LIST = [
  { ten: "Vietcombank", bin: "970436" },
  { ten: "VietinBank", bin: "970415" },
  { ten: "BIDV", bin: "970418" },
  { ten: "Agribank", bin: "970405" },
  { ten: "Techcombank", bin: "970407" },
  { ten: "MB Bank", bin: "970422" },
  { ten: "VPBank", bin: "970432" },
  { ten: "ACB", bin: "970416" },
  { ten: "TPBank", bin: "970423" },
  { ten: "Sacombank", bin: "970403" },
  { ten: "HDBank", bin: "970437" },
  { ten: "OCB", bin: "970448" },
  { ten: "MSB", bin: "970426" },
  { ten: "SHB", bin: "970443" },
  { ten: "Ví Bảo Kim", bin: "BAOKIMWALLET" },
];

const getTenNganHang = (bin?: string) =>
  NGAN_HANG_LIST.find((n) => n.bin === bin)?.ten ?? bin ?? "Ngân hàng";

function NganHangContent() {
  const dispatch = useDispatch();
  const { nganHangs } = useSelector((s) => s.rutTien);

  const [openAdd, setOpenAdd] = useState(false);
  const [tenNganHang, setTenNganHang] = useState("");
  const [tenTaiKhoan, setTenTaiKhoan] = useState("");
  const [soTaiKhoan, setSoTaiKhoan] = useState("");
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string>("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { dispatch(getNganHangs()); }, [dispatch]);

  const resetForm = () => {
    setTenNganHang("");
    setTenTaiKhoan("");
    setSoTaiKhoan("");
    setQrFile(null);
    setQrPreview("");
    setError("");
  };

  const handleChonFile = (file: File) => {
    setQrFile(file);
    setQrPreview(URL.createObjectURL(file)); // preview local, không upload trước
    setError("");
  };

  const handleThem = async () => {
    if (!tenNganHang.trim()) return setError("Vui lòng chọn ngân hàng");
    if (!tenTaiKhoan.trim()) return setError("Vui lòng nhập tên tài khoản");
    if (!soTaiKhoan.trim()) return setError("Vui lòng nhập số tài khoản");
    if (!qrFile) return setError("Vui lòng upload ảnh mã QR nhận tiền");

    setSubmitting(true);
    setError("");
    try {
      const nganHangInfo = NGAN_HANG_LIST.find((n) => n.ten === tenNganHang);

      // Gửi FormData — backend [FromForm] nhận IFormFile HinhAnhQR, upload Cloudinary
      const formData = new FormData();
      formData.append("TenNganHang", nganHangInfo?.bin ?? tenNganHang);
      formData.append("TenTaiKhoan", tenTaiKhoan.trim().toUpperCase());
      formData.append("SoTaiKhoan", soTaiKhoan.trim());
      formData.append("HinhAnhQR", qrFile);

      await apiService.post("/NganHang", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch(getNganHangs());
      setSuccess(true);
      setOpenAdd(false);
      resetForm();
    } catch {
      setError("Không thể thêm tài khoản. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleXoa = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa tài khoản này?")) return;
    dispatch(xoaNganHang(id));
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 26, fontWeight: 900, color: PRIMARY, mb: 0.5 }}>
            Tài khoản ngân hàng
          </Typography>
          <Typography sx={{ fontSize: 14, color: "rgba(31,41,55,0.55)" }}>
            Quản lý tài khoản nhận tiền khi rút doanh thu
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setOpenAdd(true); setSuccess(false); }}
          sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#7f1d1d" }, borderRadius: "10px", fontWeight: 800, px: 2.5 }}
        >
          Thêm tài khoản
        </Button>
      </Box>

      {success && (
        <Alert severity="success" onClose={() => setSuccess(false)} sx={{ mb: 3, borderRadius: "10px" }}>
          Đã thêm tài khoản ngân hàng thành công!
        </Alert>
      )}

      <Card sx={{ borderRadius: "16px", p: 2.5, border: "1px solid rgba(141,19,19,0.08)", boxShadow: "0 2px 12px rgba(141,19,19,0.06)" }}>
        {nganHangs.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <AccountBalanceIcon sx={{ fontSize: 56, color: "#ddd", mb: 1.5 }} />
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Chưa có tài khoản ngân hàng</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13, mb: 3 }}>
              Thêm tài khoản để có thể rút doanh thu về ngân hàng
            </Typography>
            <Button variant="outlined" onClick={() => setOpenAdd(true)}
              sx={{ borderColor: PRIMARY, color: PRIMARY, borderRadius: "10px", fontWeight: 700 }}>
              Thêm ngay
            </Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            {nganHangs.map((n, i) => (
              <Box key={n.id}>
                {i > 0 && <Divider sx={{ mb: 2, borderColor: "rgba(141,19,19,0.06)" }} />}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                    <Box sx={{ width: 46, height: 46, bgcolor: "rgba(141,19,19,0.06)", borderRadius: "12px",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <AccountBalanceIcon sx={{ color: PRIMARY, fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 14, color: "text.primary" }}>
                        {getTenNganHang(n.tenNganHang)}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{n.soTaiKhoan}</Typography>
                      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{n.tenTaiKhoan}</Typography>

                      {n.hinhAnhQR && (
                        <Box sx={{ mt: 1.5, p: 1, border: "1px solid rgba(141,19,19,0.15)",
                          borderRadius: "10px", display: "inline-block", bgcolor: "#fff" }}>
                          <img src={n.hinhAnhQR} alt="QR"
                            style={{ width: 120, height: 120, objectFit: "contain", display: "block" }} />
                          <Typography sx={{ fontSize: 10, color: "text.secondary", textAlign: "center", mt: 0.5 }}>
                            Mã QR nhận tiền
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                    <Chip label="Hoạt động" color="success" size="small" sx={{ fontWeight: 700 }} />
                    <IconButton size="small" onClick={() => handleXoa(n.id)}
                      sx={{ color: "#bbb", "&:hover": { color: PRIMARY, bgcolor: "rgba(141,19,19,0.06)" } }}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Card>

      {/* Dialog thêm ngân hàng */}
      <Dialog open={openAdd} onClose={() => { setOpenAdd(false); resetForm(); }}
        maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: "16px" } } }}>
        <DialogTitle sx={{ fontWeight: 800, color: PRIMARY }}>Thêm tài khoản ngân hàng</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
            Thông tin tài khoản phải chính xác để nhận tiền thành công.
          </Typography>

          <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 1 }}>Chọn ngân hàng *</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mb: 2.5 }}>
            {NGAN_HANG_LIST.map((n) => (
              <Chip key={n.bin} label={n.ten}
                onClick={() => { setTenNganHang(n.ten); setError(""); }}
                variant={tenNganHang === n.ten ? "filled" : "outlined"}
                sx={{
                  borderColor: tenNganHang === n.ten ? PRIMARY : "#ddd",
                  bgcolor: tenNganHang === n.ten ? PRIMARY : "transparent",
                  color: tenNganHang === n.ten ? "#fff" : "text.primary",
                  cursor: "pointer", fontSize: 12,
                  fontWeight: tenNganHang === n.ten ? 700 : 400,
                }}
              />
            ))}
          </Box>

          <TextField fullWidth label="Số tài khoản *" size="small" value={soTaiKhoan}
            onChange={(e) => { setSoTaiKhoan(e.target.value); setError(""); }}
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "10px" },
              "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: PRIMARY } }}
          />

          <TextField fullWidth label="Tên chủ tài khoản *" size="small" value={tenTaiKhoan}
            onChange={(e) => { setTenTaiKhoan(e.target.value.toUpperCase()); setError(""); }}
            helperText="Nhập đúng tên in hoa như trên tài khoản ngân hàng"
            sx={{ mb: 2.5, "& .MuiOutlinedInput-root": { borderRadius: "10px" },
              "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: PRIMARY } }}
          />

          {/* Upload QR */}
          <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 1 }}>Ảnh mã QR nhận tiền *</Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 1 }}>
            Mở app ngân hàng → Nhận tiền → Chụp màn hình mã QR
          </Typography>
          <Box
            onClick={() => document.getElementById("qr-upload")?.click()}
            sx={{
              border: `2px dashed ${qrPreview ? PRIMARY : "#ddd"}`,
              borderRadius: "12px", p: 2, textAlign: "center",
              cursor: "pointer", mb: 2, transition: "border-color 0.2s",
              "&:hover": { borderColor: PRIMARY, bgcolor: "rgba(141,19,19,0.02)" },
            }}
          >
            {qrPreview ? (
              <Box>
                <img src={qrPreview} alt="QR Preview"
                  style={{ maxHeight: 200, maxWidth: "100%", borderRadius: 8, objectFit: "contain" }} />
                <Typography sx={{ fontSize: 12, color: PRIMARY, mt: 1, fontWeight: 600 }}>
                  Nhấn để đổi ảnh
                </Typography>
              </Box>
            ) : (
              <Box>
                <QrCode2Icon sx={{ fontSize: 48, color: "#ddd", mb: 1 }} />
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                  Nhấn để tải ảnh mã QR lên
                </Typography>
              </Box>
            )}
          </Box>
          <input id="qr-upload" type="file" accept="image/*" style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleChonFile(file);
              e.target.value = "";
            }}
          />

          {error && <Alert severity="error" sx={{ borderRadius: "10px" }}>{error}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => { setOpenAdd(false); resetForm(); }} sx={{ color: "#666", borderRadius: "10px" }}>
            Hủy
          </Button>
          <Button variant="contained" onClick={handleThem} disabled={submitting}
            sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#7f1d1d" }, borderRadius: "10px", fontWeight: 800, px: 3 }}>
            {submitting ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Thêm tài khoản"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function InstructorBankPage() {
  return (
    <AuthGuard allowedRoles={['GiaoVien']}>
      <DashboardShell>
        <Box sx={{ p: { xs: 2, md: 4 }, borderRadius: '24px', border: '1px solid rgba(141,19,19,0.06)',
          bgcolor: '#ffffff', boxShadow: '0 10px 30px rgba(141,19,19,0.015)' }}>
          <NganHangContent />
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}