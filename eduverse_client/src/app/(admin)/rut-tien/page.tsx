"use client";
import { useEffect, useState } from "react";
import {
  Box, Typography, Card, Button, Divider, Chip, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Avatar,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { useDispatch, useSelector } from "../../../store/hook";
import { getTatCaYeuCau, xuLyYeuCau, YeuCauRutTienDto } from "../../../store/rutTien/RutTienSlice";

const PRIMARY = "#9b1c1c";

const trangThaiColor: Record<string, "warning" | "success" | "error"> = {
  ChoDuyet: "warning",
  DaChuyenTien: "success",
  TuChoi: "error",
};

const trangThaiLabel: Record<string, string> = {
  ChoDuyet: "Chờ duyệt",
  DaChuyenTien: "Đã chuyển tiền",
  TuChoi: "Từ chối",
};

export default function AdminRutTienPage() {
  const dispatch = useDispatch();
  const { tatCaYeuCau, loading } = useSelector((s) => s.rutTien);

  const [selected, setSelected] = useState<YeuCauRutTienDto | null>(null);
  const [action, setAction] = useState<"DaDuyet" | "TuChoi" | null>(null);
  const [ghiChu, setGhiChu] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => { dispatch(getTatCaYeuCau()); }, [dispatch]);

  const choDuyet = tatCaYeuCau.filter((y) => y.trangThai === "ChoDuyet");
  const daXuLy = tatCaYeuCau.filter((y) => y.trangThai !== "ChoDuyet");

  const formatTien = (n?: number) => n ? `${n.toLocaleString("vi-VN")}đ` : "0đ";

  const handleXuLy = async () => {
    if (!selected || !action) return;
    if (action === "TuChoi" && !ghiChu.trim()) return setErrorMsg("Vui lòng nhập lý do từ chối");

    setSubmitting(true);
    setErrorMsg("");
    try {
      await dispatch(xuLyYeuCau({ id: selected.id, trangThai: action, ghiChu })).unwrap();
      setSuccessMsg(action === "DaDuyet"
        ? `Đã duyệt và chuyển ${formatTien(selected.soTienRut)} cho ${selected.tenGiangVien}`
        : `Đã từ chối yêu cầu của ${selected.tenGiangVien}`);
      setSelected(null);
      setAction(null);
      setGhiChu("");
      dispatch(getTatCaYeuCau());
    } catch (e: unknown) {
      setErrorMsg(typeof e === "string" ? e : "Có lỗi xảy ra khi xử lý");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontSize: 24, fontWeight: 700, mb: 0.5, color: "text.primary" }}>
        Quản lý rút tiền
      </Typography>
      <Typography sx={{ color: "text.secondary", fontSize: 13, mb: 3 }}>
        Duyệt hoặc từ chối yêu cầu rút tiền của giảng viên
      </Typography>

      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg("")} sx={{ mb: 2, borderRadius: 2 }}>
          {successMsg}
        </Alert>
      )}

      {/* Chờ duyệt */}
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Chờ duyệt</Typography>
          {choDuyet.length > 0 && (
            <Chip label={choDuyet.length} color="warning" size="small" sx={{ fontWeight: 700 }} />
          )}
        </Box>
        <Divider />

        {choDuyet.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: "#ddd", mb: 1 }} />
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Không có yêu cầu nào đang chờ duyệt
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f9f8f6" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Giảng viên</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Số tiền</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Ngân hàng</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Số TK</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Số dư còn lại</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Ngày yêu cầu</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {choDuyet.map((y) => (
                  <TableRow key={y.id} sx={{ "&:hover": { bgcolor: "#f9f8f6" } }}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: PRIMARY, fontSize: 12 }}>
                          {y.tenGiangVien?.[0] ?? "G"}
                        </Avatar>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                          {y.tenGiangVien}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, color: PRIMARY }}>
                        {formatTien(y.soTienRut)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{y.tenNganHang}</TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{y.soTaiKhoan}</TableCell>
                    <TableCell sx={{ fontSize: 13, color: "text.secondary" }}>
                      {formatTien(y.soDuHienTai)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: "text.secondary" }}>
                      {y.ngayYeuCau ? new Date(y.ngayYeuCau).toLocaleDateString("vi-VN") : ""}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Button size="small" variant="contained" startIcon={<CheckCircleIcon />}
                          onClick={() => { setSelected(y); setAction("DaDuyet"); }}
                          sx={{ bgcolor: "success.main", "&:hover": { bgcolor: "success.dark" },
                            fontSize: 11, py: 0.3, borderRadius: 1.5 }}>
                          Duyệt
                        </Button>
                        <Button size="small" variant="outlined" startIcon={<CancelIcon />}
                          onClick={() => { setSelected(y); setAction("TuChoi"); }}
                          sx={{ borderColor: "error.main", color: "error.main",
                            fontSize: 11, py: 0.3, borderRadius: 1.5 }}>
                          Từ chối
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Đã xử lý */}
      {daXuLy.length > 0 && (
        <Card sx={{ borderRadius: 3 }}>
          <Box sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Đã xử lý</Typography>
          </Box>
          <Divider />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f9f8f6" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Giảng viên</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Số tiền</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Ngày xử lý</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {daXuLy.map((y) => (
                  <TableRow key={y.id}>
                    <TableCell sx={{ fontSize: 13 }}>{y.tenGiangVien}</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>{formatTien(y.soTienRut)}</TableCell>
                    <TableCell>
                      <Chip label={trangThaiLabel[y.trangThai ?? ""] ?? y.trangThai}
                        color={trangThaiColor[y.trangThai ?? ""] ?? "default"}
                        size="small" sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: "text.secondary" }}>
                      {y.ngayXuLy ? new Date(y.ngayXuLy).toLocaleDateString("vi-VN") : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Dialog xác nhận */}
      <Dialog open={!!selected} onClose={() => { setSelected(null); setAction(null); setGhiChu(""); setErrorMsg(""); }}
        maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {action === "DaDuyet" ? "Xác nhận duyệt" : "Từ chối yêu cầu"}
        </DialogTitle>
        <DialogContent>
          {selected && (
            <Box sx={{ bgcolor: "#f9f8f6", borderRadius: 2, p: 2, mb: 2 }}>
              <Typography sx={{ fontSize: 13 }}>
                Giảng viên: <strong>{selected.tenGiangVien}</strong>
              </Typography>
              <Typography sx={{ fontSize: 13 }}>
                Số tiền: <strong style={{ color: PRIMARY }}>{formatTien(selected.soTienRut)}</strong>
              </Typography>
              <Typography sx={{ fontSize: 13 }}>
                Tài khoản: <strong>{selected.tenNganHang} - {selected.soTaiKhoan}</strong>
              </Typography>
            </Box>
          )}

          {action === "DaDuyet" && (
            <Alert severity="warning" sx={{ borderRadius: 2, mb: 1 }}>
              Hành động này sẽ chuyển tiền ngay lập tức qua PayOS. Không thể hoàn tác!
            </Alert>
          )}

          {action === "TuChoi" && (
            <TextField fullWidth label="Lý do từ chối *" multiline rows={3} size="small"
              value={ghiChu} onChange={(e) => { setGhiChu(e.target.value); setErrorMsg(""); }}
              sx={{ "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: PRIMARY } }}
            />
          )}

          {errorMsg && <Alert severity="error" sx={{ borderRadius: 2, mt: 1 }}>{errorMsg}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setSelected(null); setAction(null); setGhiChu(""); setErrorMsg(""); }}
            sx={{ color: "#666" }}>Hủy</Button>
          <Button variant="contained" onClick={handleXuLy} disabled={submitting}
            sx={{
              bgcolor: action === "DaDuyet" ? "success.main" : "error.main",
              "&:hover": { bgcolor: action === "DaDuyet" ? "success.dark" : "error.dark" },
              borderRadius: 2, fontWeight: 700
            }}>
            {submitting ? <CircularProgress size={18} sx={{ color: "#fff" }} /> :
              action === "DaDuyet" ? "Xác nhận duyệt & chuyển tiền" : "Từ chối"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
