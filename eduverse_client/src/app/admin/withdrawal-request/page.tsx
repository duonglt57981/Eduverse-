"use client";

import AuthGuard from "@/src/components/AuthGuard";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx";
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
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Grid,
  Stack,
  Checkbox,
  Tooltip,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
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

  // ── Multi-select state ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkDaChuyen, setBulkDaChuyen] = useState(false);

  useEffect(() => {
    dispatch(getTatCaYeuCau());
  }, [dispatch]);

  const choDuyet = tatCaYeuCau.filter((y) => y.trangThai === "ChoDuyet");
  const daXuLy = tatCaYeuCau.filter((y) => y.trangThai !== "ChoDuyet");

  const formatTien = (n?: number) =>
    n ? `${n.toLocaleString("vi-VN")}đ` : "0đ";

  // ── Tổng tiền các mục đang chọn ──
  const tongTienChon = useMemo(() => {
    return choDuyet
      .filter((y) => selectedIds.has(y.id))
      .reduce((s, y) => s + (y.soTienRut ?? 0), 0);
  }, [choDuyet, selectedIds]);

  const isAllSelected =
    choDuyet.length > 0 && selectedIds.size === choDuyet.length;
  const isIndeterminate =
    selectedIds.size > 0 && selectedIds.size < choDuyet.length;

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(choDuyet.map((y) => y.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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
      await dispatch(
        xuLyYeuCau({ id: selected.id, trangThai: action, ghiChu }),
      ).unwrap();
      setSuccessMsg(
        action === "DaDuyet"
          ? `✅ Đã xác nhận chuyển ${formatTien(selected.soTienRut)} cho ${selected.tenGiangVien}`
          : `❌ Đã từ chối yêu cầu của ${selected.tenGiangVien}`,
      );
      closeDialog();
      dispatch(getTatCaYeuCau());
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Có lỗi xảy ra khi xử lý");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Duyệt hàng loạt ──
  const handleBulkApprove = async () => {
    if (!bulkDaChuyen) return;
    setBulkSubmitting(true);
    const ids = Array.from(selectedIds);
    let successCount = 0;
    for (const id of ids) {
      try {
        await dispatch(
          xuLyYeuCau({ id, trangThai: "DaDuyet", ghiChu: "Duyệt hàng loạt" }),
        ).unwrap();
        successCount++;
      } catch {
        /* bỏ qua từng lỗi */
      }
    }
    setSuccessMsg(
      `✅ Đã duyệt thành công ${successCount}/${ids.length} yêu cầu rút tiền.`,
    );
    setSelectedIds(new Set());
    setShowBulkConfirm(false);
    setBulkDaChuyen(false);
    setBulkSubmitting(false);
    dispatch(getTatCaYeuCau());
  };

  // ── Xuất Excel theo chuẩn MBBank chuyển khoản hàng loạt ──
  const BIN_TO_TEN: Record<string, string> = {
    "970436": "Vietcombank",
    "970415": "VietinBank",
    "970418": "BIDV",
    "970405": "Agribank",
    "970407": "Techcombank",
    "970422": "MBBank",
    "970432": "VPBank",
    "970416": "ACB",
    "970423": "TPBank",
    "970403": "Sacombank",
    "970437": "HDBank",
    "970448": "OCB",
    "970426": "MSB",
    "970443": "SHB",
    BAOKIMWALLET: "Vi Bao Kim",
  };
  const getTenNganHang = (bin: string) => BIN_TO_TEN[bin] ?? bin;
  const handleExportExcel = () => {
    const rows = choDuyet
      .filter((y) => selectedIds.size === 0 || selectedIds.has(y.id))
      .map((y, i) => ({
        STT: i + 1,
        "Số tài khoản thụ hưởng": y.soTaiKhoan ?? "",
        "Tên tài khoản thụ hưởng": y.tenTaiKhoan ?? "",
        "Ngân hàng thụ hưởng": getTenNganHang(y.tenNganHang ?? ""),
        "Số tiền": y.soTienRut ?? 0,
        "Nội dung chuyển khoản": `Rut tien giang vien ${y.tenGiangVien ?? ""}`
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D"),
      }));

    const ws = XLSX.utils.json_to_sheet(rows);

    // Định dạng cột
    ws["!cols"] = [
      { wch: 5 }, // STT
      { wch: 20 }, // Số TK
      { wch: 28 }, // Tên TK
      { wch: 25 }, // Ngân hàng
      { wch: 15 }, // Số tiền
      { wch: 40 }, // Nội dung
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Chuyen khoan hang loat");

    const fileName = `MBBank_CK_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const renderStatusBadge = (trangThai?: string) => {
    let bg = "#F1F5F9",
      color = "#475569",
      text = trangThai ?? "";
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
      <Box
        sx={{
          display: "inline-block",
          px: 1.5,
          py: 0.5,
          borderRadius: "6px",
          bgcolor: bg,
          color,
          fontWeight: 700,
          fontSize: "12px",
        }}
      >
        {text}
      </Box>
    );
  };

  const totalRequests = tatCaYeuCau.length;
  const pendingRequests = choDuyet.length;
  const approvedRequests = tatCaYeuCau.filter(
    (y) => y.trangThai === "DaChuyenTien",
  ).length;
  const rejectedRequests = tatCaYeuCau.filter(
    (y) => y.trangThai === "TuChoi",
  ).length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              sx={{ fontSize: 28, fontWeight: 900, color: "#1F2937", mb: 0.5 }}
            >
              Quản lý rút tiền
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              Kiểm tra, phê duyệt và theo dõi các yêu cầu rút tiền của giảng
              viên.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {successMsg && (
        <Alert
          severity="success"
          onClose={() => setSuccessMsg("")}
          sx={{ mb: 4, borderRadius: "12px", fontWeight: 600 }}
        >
          {successMsg}
        </Alert>
      )}

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            icon: (
              <AccountBalanceWalletRoundedIcon
                sx={{ color: "#111827", fontSize: 24 }}
              />
            ),
            bg: "rgba(17,24,39,0.04)",
            label: "Tổng yêu cầu",
            value: totalRequests,
            chip: "Tất cả",
            chipBg: "rgba(17,24,39,0.04)",
            chipColor: "#111827",
          },
          {
            icon: (
              <HourglassEmptyRoundedIcon
                sx={{ color: "#D97706", fontSize: 24 }}
              />
            ),
            bg: "rgba(217,119,6,0.08)",
            label: "Chờ duyệt",
            value: pendingRequests,
            chip: pendingRequests > 0 ? `${pendingRequests} mới` : null,
            chipBg: "#FFF7ED",
            chipColor: "#D97706",
          },
          {
            icon: (
              <CheckCircleOutlineRoundedIcon
                sx={{ color: "#15803D", fontSize: 24 }}
              />
            ),
            bg: "rgba(21,128,61,0.08)",
            label: "Đã chuyển tiền",
            value: approvedRequests,
            chip: "Thành công",
            chipBg: "#ECFDF5",
            chipColor: "#15803D",
          },
          {
            icon: <BlockRoundedIcon sx={{ color: "#DC2626", fontSize: 24 }} />,
            bg: "rgba(220,38,38,0.08)",
            label: "Đã từ chối",
            value: rejectedRequests,
            chip: "Từ chối",
            chipBg: "#FEF2F2",
            chipColor: "#DC2626",
          },
        ].map((s, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                p: 3,
                borderRadius: "16px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 4px 20px rgba(0,0,0,0.01)",
                bgcolor: "#FFFFFF",
              }}
            >
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box sx={{ p: 1.5, borderRadius: "12px", bgcolor: s.bg }}>
                  {s.icon}
                </Box>
                {s.chip && (
                  <Chip
                    label={s.chip}
                    size="small"
                    sx={{
                      bgcolor: s.chipBg,
                      color: s.chipColor,
                      fontWeight: 700,
                    }}
                  />
                )}
              </Stack>
              <Typography
                variant="caption"
                sx={{
                  color: "#64748B",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  fontSize: "11px",
                  letterSpacing: "0.5px",
                }}
              >
                {s.label}
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 900, color: "#111827", mt: 0.5 }}
              >
                {s.value}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Bảng chờ duyệt */}
      <Card
        sx={{
          borderRadius: "16px",
          mb: 4,
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
          bgcolor: "#FFFFFF",
          overflow: "hidden",
        }}
      >
        {/* Header bảng + action bar */}
        <Box
          sx={{
            p: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Typography
              sx={{ fontWeight: 850, fontSize: 17, color: "#111827" }}
            >
              Yêu cầu chờ duyệt
            </Typography>
            {choDuyet.length > 0 && (
              <Chip
                label={choDuyet.length}
                size="small"
                sx={{
                  bgcolor: "#FFF7ED",
                  color: "#D97706",
                  fontWeight: 800,
                  fontSize: "12px",
                }}
              />
            )}
            {selectedIds.size > 0 && (
              <Chip
                label={`Đã chọn ${selectedIds.size} • ${formatTien(tongTienChon)}`}
                size="small"
                sx={{
                  bgcolor: "#EFF6FF",
                  color: "#1D4ED8",
                  fontWeight: 800,
                  fontSize: "12px",
                }}
              />
            )}
          </Stack>

          {/* Action buttons */}
          <Stack direction="row" spacing={1.5}>
            <Tooltip
              title={
                selectedIds.size === 0
                  ? "Xuất tất cả chờ duyệt"
                  : `Xuất ${selectedIds.size} mục đã chọn`
              }
            >
              <Button
                size="small"
                variant="outlined"
                startIcon={<FileDownloadRoundedIcon />}
                onClick={handleExportExcel}
                disabled={choDuyet.length === 0}
                sx={{
                  borderColor: "#E5E7EB",
                  color: "#374151",
                  fontWeight: 700,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontSize: 13,
                  "&:hover": { borderColor: PRIMARY, color: PRIMARY },
                }}
              >
                Xuất Excel MBBank
              </Button>
            </Tooltip>

            {selectedIds.size > 0 && (
              <Button
                size="small"
                variant="contained"
                startIcon={<DoneAllRoundedIcon />}
                onClick={() => setShowBulkConfirm(true)}
                sx={{
                  bgcolor: "#15803D",
                  "&:hover": { bgcolor: "#166534" },
                  fontWeight: 700,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontSize: 13,
                  boxShadow: "none",
                }}
              >
                Duyệt {selectedIds.size} yêu cầu
              </Button>
            )}
          </Stack>
        </Box>

        <Divider sx={{ borderColor: "#E5E7EB" }} />

        {choDuyet.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 6,
              minHeight: 240,
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                bgcolor: "#ECFDF5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <CheckCircleOutlineRoundedIcon
                sx={{ fontSize: 30, color: "#15803D" }}
              />
            </Box>
            <Typography
              sx={{ color: "#111827", fontSize: 16, fontWeight: 700, mb: 0.5 }}
            >
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
                  {/* Checkbox chọn tất cả */}
                  <TableCell padding="checkbox" sx={{ pl: 2 }}>
                    <Checkbox
                      indeterminate={isIndeterminate}
                      checked={isAllSelected}
                      onChange={toggleAll}
                      sx={{
                        color: "#94A3B8",
                        "&.Mui-checked": { color: PRIMARY },
                        "&.MuiCheckbox-indeterminate": { color: PRIMARY },
                      }}
                    />
                  </TableCell>
                  {[
                    "Giảng viên",
                    "Số tiền",
                    "Ngân hàng",
                    "Số tài khoản",
                    "Mã QR",
                    "Ngày yêu cầu",
                    "Thao tác",
                  ].map((h, i) => (
                    <TableCell
                      key={i}
                      align={i === 6 ? "right" : "left"}
                      sx={{
                        fontWeight: 800,
                        color: "#64748B",
                        fontSize: 13,
                        ...(i === 6 ? { pr: 3 } : {}),
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {choDuyet.map((y) => {
                  const isChecked = selectedIds.has(y.id);
                  return (
                    <TableRow
                      key={y.id}
                      sx={{
                        bgcolor: isChecked
                          ? "rgba(153,27,27,0.02)"
                          : "transparent",
                        "&:hover": {
                          bgcolor: isChecked
                            ? "rgba(153,27,27,0.04)"
                            : "rgba(0,0,0,0.01)",
                        },
                        transition: "background-color 150ms ease",
                      }}
                    >
                      <TableCell padding="checkbox" sx={{ pl: 2 }}>
                        <Checkbox
                          checked={isChecked}
                          onChange={() => toggleOne(y.id)}
                          sx={{
                            color: "#94A3B8",
                            "&.Mui-checked": { color: PRIMARY },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: PRIMARY,
                              fontSize: 14,
                              fontWeight: 700,
                            }}
                          >
                            {y.tenGiangVien?.[0] ?? "G"}
                          </Avatar>
                          <Typography
                            sx={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: "#111827",
                            }}
                          >
                            {y.tenGiangVien}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography
                          sx={{ fontWeight: 800, color: PRIMARY, fontSize: 15 }}
                        >
                          {formatTien(y.soTienRut)}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          py: 2,
                          fontSize: 13.5,
                          color: "#111827",
                          fontWeight: 500,
                        }}
                      >
                        {getTenNganHang(y.tenNganHang ?? "")}
                      </TableCell>
                      <TableCell
                        sx={{
                          py: 2,
                          fontSize: 13.5,
                          color: "#111827",
                          fontFamily: "monospace",
                          fontWeight: 700,
                        }}
                      >
                        {y.soTaiKhoan}
                      </TableCell>
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
                            }}
                            onClick={() => {
                              setSelected(y as YeuCauRutTien);
                              setAction("DaDuyet");
                            }}
                          />
                        ) : (
                          <Typography sx={{ fontSize: 12, color: "#94A3B8" }}>
                            Chưa có QR
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 2, fontSize: 13, color: "#64748B" }}>
                        {y.ngayYeuCau
                          ? new Date(y.ngayYeuCau).toLocaleDateString("vi-VN")
                          : ""}
                      </TableCell>
                      <TableCell sx={{ py: 2, pr: 3 }} align="right">
                        <Stack
                          direction="row"
                          spacing={1.5}
                          sx={{ justifyContent: "flex-end" }}
                        >
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<QrCode2RoundedIcon />}
                            onClick={() => {
                              setSelected(y as YeuCauRutTien);
                              setAction("DaDuyet");
                            }}
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
                            }}
                          >
                            Xem & Duyệt
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<CancelRoundedIcon />}
                            onClick={() => {
                              setSelected(y as YeuCauRutTien);
                              setAction("TuChoi");
                            }}
                            sx={{
                              borderColor: "#DC2626",
                              color: "#DC2626",
                              "&:hover": {
                                borderColor: "#B91C1C",
                                bgcolor: "rgba(220,38,38,0.04)",
                              },
                              fontSize: 12,
                              fontWeight: 700,
                              py: 0.8,
                              px: 2,
                              borderRadius: "8px",
                              textTransform: "none",
                            }}
                          >
                            Từ chối
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Lịch sử đã xử lý */}
      {daXuLy.length > 0 && (
        <Card
          sx={{
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
            bgcolor: "#FFFFFF",
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <Typography
              sx={{ fontWeight: 850, fontSize: 17, color: "#111827" }}
            >
              Lịch sử đã xử lý
            </Typography>
          </Box>
          <Divider sx={{ borderColor: "#E5E7EB" }} />
          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  {["Giảng viên", "Số tiền", "Trạng thái", "Ngày xử lý"].map(
                    (h) => (
                      <TableCell
                        key={h}
                        sx={{ fontWeight: 800, color: "#64748B", fontSize: 13 }}
                      >
                        {h}
                      </TableCell>
                    ),
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {daXuLy.map((y) => (
                  <TableRow
                    key={y.id}
                    sx={{ "&:hover": { bgcolor: "rgba(0,0,0,0.01)" } }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: PRIMARY,
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          {y.tenGiangVien?.[0] ?? "G"}
                        </Avatar>
                        <Typography
                          sx={{
                            fontSize: 13.5,
                            fontWeight: 700,
                            color: "#111827",
                          }}
                        >
                          {y.tenGiangVien}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 2,
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#111827",
                      }}
                    >
                      {formatTien(y.soTienRut)}
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      {renderStatusBadge(y.trangThai)}
                    </TableCell>
                    <TableCell sx={{ py: 2, fontSize: 13, color: "#64748B" }}>
                      {y.ngayXuLy
                        ? new Date(y.ngayXuLy).toLocaleDateString("vi-VN")
                        : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Dialog duyệt đơn lẻ */}
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
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 850,
            fontSize: "20px",
            pb: 1,
            color: action === "DaDuyet" ? "#15803D" : "#DC2626",
          }}
        >
          {action === "DaDuyet"
            ? "Quét mã QR & Xác nhận chuyển tiền"
            : "Từ chối yêu cầu rút tiền"}
        </DialogTitle>
        <DialogContent>
          {selected && (
            <>
              <Box
                sx={{
                  bgcolor: "#F8FAFC",
                  borderRadius: "14px",
                  border: "1px solid #E2E8F0",
                  p: 2.5,
                  mb: 3,
                }}
              >
                <Typography
                  sx={{
                    color: "#64748B",
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Giảng viên nhận tiền
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: "#111827",
                    fontSize: 15,
                    mb: 1,
                  }}
                >
                  {selected.tenGiangVien}
                </Typography>
                <Typography
                  sx={{
                    color: "#64748B",
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Thông tin tài khoản
                </Typography>
                <Typography
                  sx={{ fontWeight: 700, color: "#111827", fontSize: 14.5 }}
                >
                  {selected.tenNganHang} • {selected.soTaiKhoan} •{" "}
                  {selected.tenTaiKhoan}
                </Typography>
              </Box>

              {action === "DaDuyet" && (
                <>
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "#64748B",
                        mb: 0.5,
                        fontWeight: 600,
                      }}
                    >
                      Số tiền cần chuyển
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 32,
                        fontWeight: 900,
                        color: PRIMARY,
                        mb: 3,
                      }}
                    >
                      {formatTien(selected.soTienRut)}
                    </Typography>
                    {selected.hinhAnhQR ? (
                      <Box
                        sx={{
                          display: "inline-block",
                          p: 2,
                          border: `2.5px solid ${PRIMARY}`,
                          borderRadius: "20px",
                          bgcolor: "#FFFFFF",
                          boxShadow: "0 8px 24px rgba(153,27,27,0.06)",
                        }}
                      >
                        <img
                          src={selected.hinhAnhQR}
                          alt="QR"
                          style={{
                            width: 220,
                            height: 220,
                            objectFit: "contain",
                            display: "block",
                          }}
                        />
                      </Box>
                    ) : (
                      <Alert
                        severity="warning"
                        sx={{ borderRadius: "12px", mb: 2 }}
                      >
                        Giảng viên chưa tải lên mã QR! Vui lòng chuyển khoản thủ
                        công.
                      </Alert>
                    )}
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "#64748B",
                        mt: 2,
                        fontWeight: 500,
                      }}
                    >
                      Mở ứng dụng ngân hàng → Quét mã QR để chuyển khoản nhanh
                      và chính xác
                    </Typography>
                  </Box>
                  <Box
                    onClick={() => {
                      setDaChuyen(!daChuyen);
                      setErrorMsg("");
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 2,
                      border: `2px solid ${daChuyen ? "#15803D" : "#E2E8F0"}`,
                      borderRadius: "12px",
                      cursor: "pointer",
                      mt: 3,
                      mb: 1,
                      bgcolor: daChuyen
                        ? "rgba(21,128,61,0.04)"
                        : "transparent",
                      transition: "all 150ms ease",
                    }}
                  >
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: "6px",
                        border: `2px solid ${daChuyen ? "#15803D" : "#CBD5E1"}`,
                        bgcolor: daChuyen ? "#15803D" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {daChuyen && (
                        <CheckCircleRoundedIcon
                          sx={{ fontSize: 16, color: "#fff" }}
                        />
                      )}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 13.5,
                        fontWeight: daChuyen ? 800 : 600,
                        color: daChuyen ? "#15803D" : "#111827",
                      }}
                    >
                      Tôi đã quét mã QR và chuyển thành công{" "}
                      {formatTien(selected.soTienRut)}
                    </Typography>
                  </Box>
                </>
              )}

              {action === "TuChoi" && (
                <TextField
                  fullWidth
                  label="Lý do từ chối *"
                  placeholder="Nhập lý do từ chối..."
                  multiline
                  rows={4}
                  size="small"
                  value={ghiChu}
                  onChange={(e) => {
                    setGhiChu(e.target.value);
                    setErrorMsg("");
                  }}
                  sx={{
                    mt: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      bgcolor: "#F8FAFC",
                    },
                  }}
                />
              )}

              {errorMsg && (
                <Alert
                  severity="error"
                  sx={{ borderRadius: "12px", mt: 2, fontWeight: 600 }}
                >
                  {errorMsg}
                </Alert>
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
              py: 1,
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
              "&:hover": {
                bgcolor: action === "DaDuyet" ? "#166534" : "#B91C1C",
              },
              borderRadius: "10px",
              fontWeight: 800,
              px: 3,
              py: 1,
              textTransform: "none",
              boxShadow: "none",
              opacity: action === "DaDuyet" && !daChuyen ? 0.55 : 1,
            }}
          >
            {submitting ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : action === "DaDuyet" ? (
              "Xác nhận đã chuyển tiền"
            ) : (
              "Từ chối yêu cầu"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog duyệt hàng loạt */}
      <Dialog
        open={showBulkConfirm}
        onClose={() => {
          setShowBulkConfirm(false);
          setBulkDaChuyen(false);
        }}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "20px", p: 1.5 } } }}
      >
        <DialogTitle
          sx={{ fontWeight: 850, fontSize: "20px", pb: 1, color: "#15803D" }}
        >
          Duyệt hàng loạt {selectedIds.size} yêu cầu
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              bgcolor: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: "14px",
              p: 2.5,
              mb: 3,
            }}
          >
            <Typography
              sx={{ fontWeight: 800, color: "#15803D", fontSize: 15, mb: 0.5 }}
            >
              Tổng số tiền cần chuyển
            </Typography>
            <Typography
              sx={{ fontWeight: 900, color: "#15803D", fontSize: 28 }}
            >
              {formatTien(tongTienChon)}
            </Typography>
            <Typography sx={{ color: "#166534", fontSize: 13, mt: 0.5 }}>
              cho {selectedIds.size} giảng viên
            </Typography>
          </Box>

          <Alert severity="info" sx={{ borderRadius: "12px", mb: 3 }}>
            Hãy chuyển khoản đủ số tiền cho tất cả giảng viên trước khi xác nhận
            duyệt hàng loạt. Gợi ý: xuất file Excel MBBank để chuyển khoản
            nhanh.
          </Alert>

          <Box
            onClick={() => setBulkDaChuyen(!bulkDaChuyen)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 2,
              border: `2px solid ${bulkDaChuyen ? "#15803D" : "#E2E8F0"}`,
              borderRadius: "12px",
              cursor: "pointer",
              bgcolor: bulkDaChuyen ? "rgba(21,128,61,0.04)" : "transparent",
              transition: "all 150ms ease",
            }}
          >
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: "6px",
                border: `2px solid ${bulkDaChuyen ? "#15803D" : "#CBD5E1"}`,
                bgcolor: bulkDaChuyen ? "#15803D" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {bulkDaChuyen && (
                <CheckCircleRoundedIcon sx={{ fontSize: 16, color: "#fff" }} />
              )}
            </Box>
            <Typography
              sx={{
                fontSize: 13.5,
                fontWeight: bulkDaChuyen ? 800 : 600,
                color: bulkDaChuyen ? "#15803D" : "#111827",
              }}
            >
              Tôi đã chuyển khoản thành công cho tất cả {selectedIds.size} giảng
              viên
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1.5 }}>
          <Button
            onClick={() => {
              setShowBulkConfirm(false);
              setBulkDaChuyen(false);
            }}
            sx={{
              color: "#64748B",
              borderRadius: "10px",
              fontWeight: 700,
              textTransform: "none",
              px: 2.5,
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleBulkApprove}
            disabled={bulkSubmitting || !bulkDaChuyen}
            sx={{
              bgcolor: "#15803D",
              "&:hover": { bgcolor: "#166534" },
              borderRadius: "10px",
              fontWeight: 800,
              px: 3,
              py: 1,
              textTransform: "none",
              boxShadow: "none",
              opacity: !bulkDaChuyen ? 0.55 : 1,
            }}
          >
            {bulkSubmitting ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              `Xác nhận duyệt ${selectedIds.size} yêu cầu`
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function AdminWithdrawalsPage() {
  return (
    <AuthGuard allowedRoles={["Admin"]}>
      <DashboardShell>
        <Box sx={{ width: "100%" }}>
          <RutTienContent />
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}
