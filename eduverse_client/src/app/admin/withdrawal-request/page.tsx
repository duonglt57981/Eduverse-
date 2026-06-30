'use client';

import AuthGuard from '@/src/components/AuthGuard';
import DashboardShell from '@/src/components/dashboard/DashboardShell';
import { useEffect, useState } from "react";
import {
  Box, Typography, Card, Button, Divider, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Avatar,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useDispatch, useSelector } from "@/src/store/hook";
import { getTatCaYeuCau, xuLyYeuCau } from "@/src/store/rutTien/RutTienSlice";

const PRIMARY = "#8D1313";

interface YeuCauRutTien {
  id: string;
  tenGiangVien?: string;
  soTienRut?: number;
  tenNganHang?: string;
  soTaiKhoan?: string;
  soDuHienTai?: number;
  ngayYeuCau?: string;
  ngayXuLy?: string;
  trangThai?: string;
}

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

function RutTienContent() {
  const dispatch = useDispatch();
  const { tatCaYeuCau } = useSelector((s) => s.rutTien);

  const [selected, setSelected] = useState<YeuCauRutTien | null>(null);
  const [action, setAction] = useState<"DaDuyet" | "TuChoi" | null>(null);
  const [ghiChu, setGhiChu] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => { dispatch(getTatCaYeuCau()); }, [dispatch]);

  const choDuyet = tatCaYeuCau.filter((y) => y.trangThai === "ChoDuyet");
  const daXuLy = tatCaYeuCau.filter((y) => y.trangThai !== "ChoDuyet");

  const formatTien = (n?: number) => (n ? `${n.toLocaleString("vi-VN")}đ` : "0đ");

  const closeDialog = () => {
    setSelected(null);
    setAction(null);
    setGhiChu("");
    setErrorMsg("");
  };

  const handleXuLy = async () => {
    if (!selected || !action) return;
    if (action === "TuChoi" && !ghiChu.trim()) return setErrorMsg("Vui lòng nhập lý do từ chối");

    setSubmitting(true);
    setErrorMsg("");
    try {
      await dispatch(xuLyYeuCau({ id: selected.id, trangThai: action, ghiChu })).unwrap();
      setSuccessMsg(
        action === "DaDuyet"
          ? `Đã duyệt và chuyển ${formatTien(selected.soTienRut)} cho ${selected.tenGiangVien}`
          : `Đã từ chối yêu cầu của ${selected.tenGiangVien}`
      );
      closeDialog();
      dispatch(getTatCaYeuCau());
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Có lỗi xảy ra khi xử lý");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 26, fontWeight: 900, color: PRIMARY, mb: 0.5 }}>
          Quản lý rút tiền
        </Typography>
        <Typography sx={{ color: "rgba(31,41,55,0.55)", fontSize: 14 }}>
          Duyệt hoặc từ chối yêu cầu rút tiền của giảng viên
        </Typography>
      </Box>

      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg("")} sx={{ mb: 3, borderRadius: "10px" }}>
          {successMsg}
        </Alert>
      )}

      {/* Chờ duyệt */}
      <Card
        sx={{
          borderRadius: "16px",
          mb: 3,
          border: "1px solid rgba(141,19,19,0.08)",
          boxShadow: "0 2px 12px rgba(141,19,19,0.06)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 16, color: "text.primary" }}>
            Chờ duyệt
          </Typography>
          {choDuyet.length > 0 && (
            <Chip label={choDuyet.length} color="warning" size="small" sx={{ fontWeight: 700 }} />
          )}
        </Box>
        <Divider sx={{ borderColor: "rgba(141,19,19,0.08)" }} />

        {choDuyet.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: "#ddd", mb: 1 }} />
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Không có yêu cầu nào đang chờ duyệt
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "rgba(141,19,19,0.02)" }}>
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
                  <TableRow key={y.id} sx={{ "&:hover": { bgcolor: "rgba(141,19,19,0.02)" } }}>
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
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => { setSelected(y); setAction("DaDuyet"); }}
                          sx={{
                            bgcolor: "success.main",
                            "&:hover": { bgcolor: "success.dark" },
                            fontSize: 11,
                            py: 0.3,
                            borderRadius: "8px",
                          }}
                        >
                          Duyệt
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={() => { setSelected(y); setAction("TuChoi"); }}
                          sx={{
                            borderColor: "error.main",
                            color: "error.main",
                            fontSize: 11,
                            py: 0.3,
                            borderRadius: "8px",
                          }}
                        >
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
        <Card
          sx={{
            borderRadius: "16px",
            border: "1px solid rgba(141,19,19,0.08)",
            boxShadow: "0 2px 12px rgba(141,19,19,0.06)",
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 16, color: "text.primary" }}>
              Đã xử lý
            </Typography>
          </Box>
          <Divider sx={{ borderColor: "rgba(141,19,19,0.08)" }} />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "rgba(141,19,19,0.02)" }}>
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
                    <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>
                      {formatTien(y.soTienRut)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={trangThaiLabel[y.trangThai ?? ""] ?? y.trangThai}
                        color={trangThaiColor[y.trangThai ?? ""] ?? "default"}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
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
      <Dialog
        open={!!selected}
        onClose={closeDialog}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "16px" } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: action === "DaDuyet" ? "success.main" : "error.main" }}>
          {action === "DaDuyet" ? "Xác nhận duyệt" : "Từ chối yêu cầu"}
        </DialogTitle>
        <DialogContent>
          {selected && (
            <Box sx={{ bgcolor: "rgba(141,19,19,0.03)", borderRadius: "12px", p: 2, mb: 2 }}>
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
            <Alert severity="warning" sx={{ borderRadius: "10px", mb: 1 }}>
              Hành động này sẽ chuyển tiền ngay lập tức qua PayOS. Không thể hoàn tác!
            </Alert>
          )}

          {action === "TuChoi" && (
            <TextField
              fullWidth
              label="Lý do từ chối *"
              multiline
              rows={3}
              size="small"
              value={ghiChu}
              onChange={(e) => { setGhiChu(e.target.value); setErrorMsg(""); }}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: PRIMARY },
              }}
            />
          )}

          {errorMsg && (
            <Alert severity="error" sx={{ borderRadius: "10px", mt: 1 }}>{errorMsg}</Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={closeDialog} sx={{ color: "#666", borderRadius: "10px" }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleXuLy}
            disabled={submitting}
            sx={{
              bgcolor: action === "DaDuyet" ? "success.main" : "error.main",
              "&:hover": { bgcolor: action === "DaDuyet" ? "success.dark" : "error.dark" },
              borderRadius: "10px",
              fontWeight: 800,
              px: 3,
            }}
          >
            {submitting ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : action === "DaDuyet" ? (
              "Xác nhận duyệt & chuyển tiền"
            ) : (
              "Từ chối"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function AdminWithdrawalsPage() {
  return (
    <AuthGuard allowedRoles={['Admin']}>
      <DashboardShell>
        <Box
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: '24px',
            border: '1px solid rgba(141,19,19,0.06)',
            bgcolor: '#ffffff',
            boxShadow: '0 10px 30px rgba(141,19,19,0.015)',
          }}
        >
          <RutTienContent />
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}