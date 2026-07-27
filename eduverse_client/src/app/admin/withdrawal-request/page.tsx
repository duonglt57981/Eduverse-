'use client';

import AuthGuard from '@/src/components/AuthGuard';
import DashboardShell from '@/src/components/dashboard/DashboardShell';
import { useEffect, useState } from "react";
import {
  Box, Typography, Card, Button, Divider, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Avatar, Grid, Stack,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import { useDispatch, useSelector } from "@/src/store/hook";
import { getTatCaYeuCau, xuLyYeuCau } from "@/src/store/rutTien/RutTienSlice";

const PRIMARY = "#991B1B";
const PRIMARY_HOVER = "#7F1D1D";

interface YeuCauRutTien {
  id: string;
  tenGiangVien?: string;
  soTienRut?: number;
  tenNganHang?: string;
  soTaiKhoan?: string;
  tenTaiKhoan?: string;
  hinhAnhQR?: string;
  soDuHienTai?: number;
  ngayYeuCau?: string;
  ngayXuLy?: string;
  trangThai?: string;
}

function RutTienContent() {
  const dispatch = useDispatch();
  const { tatCaYeuCau } = useSelector((s) => s.rutTien);

  const [selected, setSelected] = useState<YeuCauRutTien | null>(null);
  const [action, setAction] = useState<"DaDuyet" | "TuChoi" | null>(null);
  const [ghiChu, setGhiChu] = useState("");
  const [daChuyen, setDaChuyen] = useState(false);
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
    setDaChuyen(false);
  };

  const handleXuLy = async () => {
    if (!selected || !action) return;
    if (action === "DaDuyet" && !daChuyen)
      return setErrorMsg("Vui lòng xác nhận đã chuyển tiền");
    if (action === "TuChoi" && !ghiChu.trim())
      return setErrorMsg("Vui lòng nhập lý do từ chối");

    setSubmitting(true);
    setErrorMsg("");
    try {
      await dispatch(xuLyYeuCau({ id: selected.id, trangThai: action, ghiChu })).unwrap();
      setSuccessMsg(
        action === "DaDuyet"
          ? `✅ Đã xác nhận chuyển ${formatTien(selected.soTienRut)} cho ${selected.tenGiangVien}`
          : `❌ Đã từ chối yêu cầu của ${selected.tenGiangVien}`
      );
      closeDialog();
      dispatch(getTatCaYeuCau());
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Có lỗi xảy ra khi xử lý");
    } finally {
      setSubmitting(false);
    }
  };

  // Trạng thái badge màu sắc đồng bộ
  const renderStatusBadge = (trangThai?: string) => {
    let bg = "#F1F5F9";
    let color = "#475569";
    let text = trangThai ?? "";

    if (trangThai === "ChoDuyet") {
      bg = "#FFF7ED";
      color = "#D97706";
      text = "Chờ duyệt";
    } else if (trangThai === "DaChuyenTien") {
      bg = "#ECFDF5";
      color = "#15803D";
      text = "Đã chuyển tiền";
    } else if (trangThai === "TuChoi") {
      bg = "#FEF2F2";
      color = "#DC2626";
      text = "Từ chối";
    }

    return (
      <Box sx={{
        display: "inline-block",
        px: 1.5,
        py: 0.5,
        borderRadius: "6px",
        bgcolor: bg,
        color: color,
        fontWeight: 700,
        fontSize: "12px"
      }}>
        {text}
      </Box>
    );
  };

  // Thống kê động trên Client
  const totalRequests = tatCaYeuCau.length;
  const pendingRequests = choDuyet.length;
  const approvedRequests = tatCaYeuCau.filter((y) => y.trangThai === "DaChuyenTien").length;
  const rejectedRequests = tatCaYeuCau.filter((y) => y.trangThai === "TuChoi").length;

  return (
    <Box>
      {/* Header trang */}
      <Box sx={{ mb: 4 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: "#111827", display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AccountBalanceWalletRoundedIcon sx={{ fontSize: 36, color: PRIMARY }} />
              Quản lý rút tiền
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
              Kiểm tra, phê duyệt và theo dõi các yêu cầu rút tiền của giảng viên.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Thông báo thành công */}
      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg("")} sx={{ mb: 4, borderRadius: "12px", fontWeight: 600 }}>
          {successMsg}
        </Alert>
      )}

      {/* Cards thống kê */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 3, borderRadius: "16px", border: "1px solid #E5E7EB", boxShadow: "0 4px 20px rgba(0,0,0,0.01)", bgcolor: "#FFFFFF" }}>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: "12px", bgcolor: "rgba(17,24,39,0.04)" }}>
                <AccountBalanceWalletRoundedIcon sx={{ color: "#111827", fontSize: 24 }} />
              </Box>
              <Chip label="Tất cả" size="small" sx={{ bgcolor: "rgba(17,24,39,0.04)", color: "#111827", fontWeight: 700 }} />
            </Stack>
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 800, textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>
              Tổng yêu cầu
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: "#111827", mt: 0.5 }}>
              {totalRequests}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 3, borderRadius: "16px", border: "1px solid #E5E7EB", boxShadow: "0 4px 20px rgba(0,0,0,0.01)", bgcolor: "#FFFFFF" }}>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: "12px", bgcolor: "rgba(217,119,6,0.08)" }}>
                <HourglassEmptyRoundedIcon sx={{ color: "#D97706", fontSize: 24 }} />
              </Box>
              {pendingRequests > 0 && (
                <Chip label={`${pendingRequests} mới`} size="small" sx={{ bgcolor: "#FFF7ED", color: "#D97706", fontWeight: 700 }} />
              )}
            </Stack>
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 800, textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>
              Chờ duyệt
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: "#111827", mt: 0.5 }}>
              {pendingRequests}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 3, borderRadius: "16px", border: "1px solid #E5E7EB", boxShadow: "0 4px 20px rgba(0,0,0,0.01)", bgcolor: "#FFFFFF" }}>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: "12px", bgcolor: "rgba(21,128,61,0.08)" }}>
                <CheckCircleOutlineRoundedIcon sx={{ color: "#15803D", fontSize: 24 }} />
              </Box>
              <Chip label="Thành công" size="small" sx={{ bgcolor: "#ECFDF5", color: "#15803D", fontWeight: 700 }} />
            </Stack>
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 800, textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>
              Đã chuyển tiền
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: "#111827", mt: 0.5 }}>
              {approvedRequests}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 3, borderRadius: "16px", border: "1px solid #E5E7EB", boxShadow: "0 4px 20px rgba(0,0,0,0.01)", bgcolor: "#FFFFFF" }}>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: "12px", bgcolor: "rgba(220,38,38,0.08)" }}>
                <BlockRoundedIcon sx={{ color: "#DC2626", fontSize: 24 }} />
              </Box>
              <Chip label="Từ chối" size="small" sx={{ bgcolor: "#FEF2F2", color: "#DC2626", fontWeight: 700 }} />
            </Stack>
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 800, textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>
              Đã từ chối
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: "#111827", mt: 0.5 }}>
              {rejectedRequests}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Khu vực chờ duyệt */}
      <Card sx={{
        borderRadius: "16px",
        mb: 4,
        border: "1px solid #E5E7EB",
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
        bgcolor: "#FFFFFF",
        overflow: "hidden"
      }}>
        <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography sx={{ fontWeight: 850, fontSize: 17, color: "#111827" }}>
            Yêu cầu chờ duyệt
          </Typography>
          {choDuyet.length > 0 && (
            <Chip label={choDuyet.length} size="small" sx={{ bgcolor: "#FFF7ED", color: "#D97706", fontWeight: 800, fontSize: "12px" }} />
          )}
        </Box>
        <Divider sx={{ borderColor: "#E5E7EB" }} />

        {choDuyet.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 6, px: 2, minHeight: 240 }}>
            <Box sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              bgcolor: "#ECFDF5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}>
              <CheckCircleOutlineRoundedIcon sx={{ fontSize: 30, color: "#15803D" }} />
            </Box>
            <Typography sx={{ color: "#111827", fontSize: 16, fontWeight: 700, mb: 0.5 }}>
              Không có yêu cầu nào đang chờ duyệt
            </Typography>
            <Typography sx={{ color: "#64748B", fontSize: 13 }}>
              Các yêu cầu rút tiền mới sẽ được hiển thị tại đây.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  <TableCell sx={{ fontWeight: 800, color: "#64748B", fontSize: 13 }}>Giảng viên</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#64748B", fontSize: 13 }}>Số tiền</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#64748B", fontSize: 13 }}>Ngân hàng</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#64748B", fontSize: 13 }}>Số tài khoản</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#64748B", fontSize: 13 }}>Mã QR</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#64748B", fontSize: 13 }}>Ngày yêu cầu</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: "#64748B", fontSize: 13, pr: 3 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {choDuyet.map((y) => (
                  <TableRow key={y.id} sx={{ "&:hover": { bgcolor: "rgba(0, 0, 0, 0.01)" }, transition: "background-color 150ms ease" }}>
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: PRIMARY, fontSize: 14, fontWeight: 700 }}>
                          {y.tenGiangVien?.[0] ?? "G"}
                        </Avatar>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{y.tenGiangVien}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography sx={{ fontWeight: 800, color: PRIMARY, fontSize: 15 }}>
                        {formatTien(y.soTienRut)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2, fontSize: 13.5, color: "#111827", fontWeight: 500 }}>{y.tenNganHang}</TableCell>
                    <TableCell sx={{ py: 2, fontSize: 13.5, color: "#111827", fontFamily: "monospace", fontWeight: 700 }}>{y.soTaiKhoan}</TableCell>
                    <TableCell sx={{ py: 2 }}>
                      {y.hinhAnhQR ? (
                        <img
                          src={y.hinhAnhQR}
                          alt="QR"
                          style={{
                            width: 44,
                            height: 44,
                            objectFit: "contain",
                            border: "1px solid #E5E7EB",
                            borderRadius: 8,
                            cursor: "pointer",
                            transition: "transform 150ms",
                          }}
                          onClick={() => { setSelected(y as YeuCauRutTien); setAction("DaDuyet"); }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        />
                      ) : (
                        <Typography sx={{ fontSize: 12, color: "#94A3B8" }}>Chưa có QR</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 2, fontSize: 13, color: "#64748B" }}>
                      {y.ngayYeuCau ? new Date(y.ngayYeuCau).toLocaleDateString("vi-VN") : ""}
                    </TableCell>
                    <TableCell sx={{ py: 2, pr: 3 }} align="right">
                      <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<QrCode2RoundedIcon />}
                          onClick={() => { setSelected(y as YeuCauRutTien); setAction("DaDuyet"); }}
                          sx={{
                            bgcolor: PRIMARY,
                            "&:hover": { bgcolor: PRIMARY_HOVER },
                            fontSize: 12,
                            fontWeight: 700,
                            py: 0.8,
                            px: 2,
                            borderRadius: "8px",
                            textTransform: "none",
                            boxShadow: "none",
                            "&:active": { boxShadow: "none" }
                          }}
                        >
                          Xem & Duyệt
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<CancelRoundedIcon />}
                          onClick={() => { setSelected(y as YeuCauRutTien); setAction("TuChoi"); }}
                          sx={{
                            borderColor: "#DC2626",
                            color: "#DC2626",
                            "&:hover": {
                              borderColor: "#B91C1C",
                              bgcolor: "rgba(220,38,38,0.04)"
                            },
                            fontSize: 12,
                            fontWeight: 700,
                            py: 0.8,
                            px: 2,
                            borderRadius: "8px",
                            textTransform: "none"
                          }}
                        >
                          Từ chối
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Khu vực đã xử lý */}
      {daXuLy.length > 0 && (
        <Card sx={{
          borderRadius: "16px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
          bgcolor: "#FFFFFF",
          overflow: "hidden"
        }}>
          <Box sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 850, fontSize: 17, color: "#111827" }}>
              Lịch sử đã xử lý
            </Typography>
          </Box>
          <Divider sx={{ borderColor: "#E5E7EB" }} />
          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  <TableCell sx={{ fontWeight: 800, color: "#64748B", fontSize: 13 }}>Giảng viên</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#64748B", fontSize: 13 }}>Số tiền</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#64748B", fontSize: 13 }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#64748B", fontSize: 13 }}>Ngày xử lý</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {daXuLy.map((y) => (
                  <TableRow key={y.id} sx={{ "&:hover": { bgcolor: "rgba(0, 0, 0, 0.01)" }, transition: "background-color 150ms ease" }}>
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: PRIMARY, fontSize: 13, fontWeight: 700 }}>
                          {y.tenGiangVien?.[0] ?? "G"}
                        </Avatar>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#111827" }}>
                          {y.tenGiangVien}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2, fontWeight: 700, fontSize: 14, color: "#111827" }}>
                      {formatTien(y.soTienRut)}
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      {renderStatusBadge(y.trangThai)}
                    </TableCell>
                    <TableCell sx={{ py: 2, fontSize: 13, color: "#64748B" }}>
                      {y.ngayXuLy ? new Date(y.ngayXuLy).toLocaleDateString("vi-VN") : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Dialog xem QR & xác nhận chuyển tiền */}
      <Dialog
        open={!!selected}
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "20px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
              p: 1.5,
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 850, fontSize: "20px", pb: 1, color: action === "DaDuyet" ? "#15803D" : "#DC2626" }}>
          {action === "DaDuyet" ? "Quét mã QR & Xác nhận chuyển tiền" : "Từ chối yêu cầu rút tiền"}
        </DialogTitle>
        <DialogContent>
          {selected && (
            <>
              {/* Thông tin đơn */}
              <Box sx={{ bgcolor: "#F8FAFC", borderRadius: "14px", border: "1px solid #E2E8F0", p: 2.5, mb: 3 }}>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12 }}>
                    <Typography sx={{ color: "#64748B", fontSize: "12px", fontWeight: 700, textTransform: "uppercase" }}>Giảng viên nhận tiền</Typography>
                    <Typography sx={{ fontWeight: 800, color: "#111827", fontSize: 15 }}>{selected.tenGiangVien}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography sx={{ color: "#64748B", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", mt: 1 }}>Thông tin tài khoản ngân hàng</Typography>
                    <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: 14.5 }}>
                      {selected.tenNganHang} • {selected.soTaiKhoan} • {selected.tenTaiKhoan}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {action === "DaDuyet" && (
                <>
                  {/* Số tiền + QR */}
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    <Typography sx={{ fontSize: 13, color: "#64748B", mb: 0.5, fontWeight: 600 }}>
                      Số tiền cần chuyển
                    </Typography>
                    <Typography sx={{ fontSize: 32, fontWeight: 900, color: PRIMARY, mb: 3 }}>
                      {formatTien(selected.soTienRut)}
                    </Typography>

                    {selected.hinhAnhQR ? (
                      <Box sx={{
                        display: "inline-block",
                        p: 2,
                        border: `2.5px solid ${PRIMARY}`,
                        borderRadius: "20px",
                        bgcolor: "#FFFFFF",
                        boxShadow: "0 8px 24px rgba(153,27,27,0.06)"
                      }}>
                        <img
                          src={selected.hinhAnhQR}
                          alt="QR Code"
                          style={{ width: 220, height: 220, objectFit: "contain", display: "block" }}
                        />
                      </Box>
                    ) : (
                      <Alert severity="warning" sx={{ borderRadius: "12px", mb: 2 }}>
                        Giảng viên chưa tải lên mã QR! Vui lòng chuyển khoản thủ công theo thông tin số tài khoản trên.
                      </Alert>
                    )}

                    <Typography sx={{ fontSize: 12, color: "#64748B", mt: 2, fontWeight: 500 }}>
                      Mở ứng dụng ngân hàng → Quét mã QR để chuyển khoản nhanh và chính xác
                    </Typography>
                  </Box>

                  {/* Checkbox xác nhận chuyển tiền */}
                  <Box
                    onClick={() => { setDaChuyen(!daChuyen); setErrorMsg(""); }}
                    sx={{
                      display: "flex", alignItems: "center", gap: 1.5, p: 2,
                      borderColor: daChuyen ? "#15803D" : "#E2E8F0",
                      border: `2px solid ${daChuyen ? "#15803D" : "#E2E8F0"}`,
                      borderRadius: "12px", cursor: "pointer", mt: 3, mb: 1,
                      bgcolor: daChuyen ? "rgba(21,128,61,0.04)" : "transparent",
                      transition: "all 150ms ease",
                      "&:hover": {
                        borderColor: daChuyen ? "#15803D" : PRIMARY,
                        bgcolor: daChuyen ? "rgba(21,128,61,0.04)" : "rgba(153,27,27,0.02)",
                      }
                    }}
                  >
                    <Box sx={{
                      width: 22, height: 22, borderRadius: "6px",
                      border: `2px solid ${daChuyen ? "#15803D" : "#CBD5E1"}`,
                      bgcolor: daChuyen ? "#15803D" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}>
                      {daChuyen && <CheckCircleRoundedIcon sx={{ fontSize: 16, color: "#fff" }} />}
                    </Box>
                    <Typography sx={{ fontSize: 13.5, fontWeight: daChuyen ? 800 : 600, color: daChuyen ? "#15803D" : "#111827" }}>
                      Tôi đã quét mã QR và chuyển thành công {formatTien(selected.soTienRut)}
                    </Typography>
                  </Box>
                </>
              )}

              {action === "TuChoi" && (
                <TextField
                  fullWidth
                  label="Lý do từ chối *"
                  placeholder="Nhập lý do từ chối để giảng viên nắm rõ..."
                  multiline
                  rows={4}
                  size="small"
                  value={ghiChu}
                  onChange={(e) => { setGhiChu(e.target.value); setErrorMsg(""); }}
                  sx={{
                    mt: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      bgcolor: "#F8FAFC",
                    },
                    "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                      borderColor: PRIMARY
                    }
                  }}
                />
              )}

              {errorMsg && (
                <Alert severity="error" sx={{ borderRadius: "12px", mt: 2, fontWeight: 600 }}>{errorMsg}</Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1.5 }}>
          <Button
            onClick={closeDialog}
            sx={{
              color: "#64748B",
              borderRadius: "10px",
              fontWeight: 700,
              textTransform: "none",
              px: 2.5,
              py: 1
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleXuLy}
            disabled={submitting}
            sx={{
              bgcolor: action === "DaDuyet" ? "#15803D" : "#DC2626",
              "&:hover": { bgcolor: action === "DaDuyet" ? "#166534" : "#B91C1C" },
              borderRadius: "10px",
              fontWeight: 800,
              px: 3,
              py: 1,
              textTransform: "none",
              boxShadow: "none",
              "&:active": { boxShadow: "none" },
              opacity: action === "DaDuyet" && !daChuyen ? 0.55 : 1,
            }}
          >
            {submitting ? <CircularProgress size={18} sx={{ color: "#fff" }} /> :
              action === "DaDuyet" ? "Xác nhận đã chuyển tiền" : "Từ chối yêu cầu"}
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
        <Box sx={{ width: "100%" }}>
          <RutTienContent />
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}