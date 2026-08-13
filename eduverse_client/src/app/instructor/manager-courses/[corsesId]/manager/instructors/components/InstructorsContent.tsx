/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  IconButton,
  TextField,
  Switch,
  Checkbox,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import { useState, useEffect, useCallback } from "react";
import AuthGuard from "@/src/components/AuthGuard";
import { useCourseEdit } from "../../components/CourseEditContext";
import { MAU } from "../../components/courseEditCore";
import LoiMoiGiangVienService, {
  GiangVienCongTacDto,
  GuiLoiMoiRequest,
  CapNhatQuyenRequest,
  LoiMoiDangChoDto,
} from "@/src/services/LoiMoiGiangVienService";

// ── Các cột quyền hiển thị trên bảng ────────────────────────────────────────
const COT_QUYEN: { key: keyof CapNhatQuyenRequest; nhan: string }[] = [
  { key: "visible", nhan: "Hiển thị" },
  { key: "manage", nhan: "Quản lý" },
  { key: "performance", nhan: "Hiệu suất" },
  { key: "qnA", nhan: "Hỏi đáp" },
  { key: "reviews", nhan: "Đánh giá" },
  { key: "assignments", nhan: "Bài tập" },
  { key: "materials", nhan: "Tài liệu" },
  { key: "promotions", nhan: "Khuyến mãi" },
];

const QUYEN_MO_TA: Record<
  string,
  { label: string; desc: string; icon: React.ReactNode }
> = {
  visible: {
    label: "Hiển thị",
    desc: "Hiển thị tên công khai trên khóa học",
    icon: <VisibilityRoundedIcon sx={{ fontSize: 18 }} />,
  },
  manage: {
    label: "Quản lý",
    desc: "Quản lý bài giảng & nội dung khóa học",
    icon: <TuneRoundedIcon sx={{ fontSize: 18 }} />,
  },
  performance: {
    label: "Hiệu suất",
    desc: "Xem báo cáo hiệu suất & học viên",
    icon: <InsightsRoundedIcon sx={{ fontSize: 18 }} />,
  },
  qnA: {
    label: "Hỏi đáp",
    desc: "Trả lời câu hỏi & tương tác học viên",
    icon: <ForumRoundedIcon sx={{ fontSize: 18 }} />,
  },
  reviews: {
    label: "Đánh giá",
    desc: "Quản lý & phản hồi đánh giá khóa học",
    icon: <RateReviewRoundedIcon sx={{ fontSize: 18 }} />,
  },
  assignments: {
    label: "Bài tập",
    desc: "Tạo và chấm bài tập cho học viên",
    icon: <AssignmentRoundedIcon sx={{ fontSize: 18 }} />,
  },
  materials: {
    label: "Tài liệu",
    desc: "Tải lên & quản lý tài liệu đính kèm",
    icon: <FolderRoundedIcon sx={{ fontSize: 18 }} />,
  },
  promotions: {
    label: "Khuyến mãi",
    desc: "Tạo mã giảm giá & chương trình ưu đãi",
    icon: <LocalOfferRoundedIcon sx={{ fontSize: 18 }} />,
  },
};

// ── Row state (giá trị đang sửa trên bảng, chưa save) ───────────────────────
interface RowState extends GiangVienCongTacDto {
  _dirty: boolean; // đánh dấu đã chỉnh sửa
}

// ── Default quyền khi mời mới ────────────────────────────────────────────────
const DEFAULT_QUYEN: GuiLoiMoiRequest = {
  idKhoaHoc: "",
  email: "",
  visible: true,
  tyLeChiaDoanhThu: 0,
  manage: true,
  performance: false,
  qnA: true,
  reviews: false,
  assignments: false,
  materials: true,
  promotions: false,
};

export default function InstructorsContent() {
  const { idKhoaHoc, trangThai } = useCourseEdit();
  const isEditable = trangThai === "DangSua";

  const [rows, setRows] = useState<RowState[]>([]);
  const [loading, setLoading] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Dialog mời mới
  const [showMoiDialog, setShowMoiDialog] = useState(false);
  const [formMoi, setFormMoi] = useState<GuiLoiMoiRequest>({
    ...DEFAULT_QUYEN,
  });
  const [dangGui, setDangGui] = useState(false);
  const [loiMoiDialog, setLoiMoiDialog] = useState<string | null>(null);

  // Dialog xác nhận remove
  const [removeTarget, setRemoveTarget] = useState<GiangVienCongTacDto | null>(
    null,
  );
  const [dangXoa, setDangXoa] = useState(false);

  // Thêm state cho pending list
  const [pendingRows, setPendingRows] = useState<LoiMoiDangChoDto[]>([]);
  const [dangHuyLoiMoi, setDangHuyLoiMoi] = useState<string | null>(null);

  // ── Load ─────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!idKhoaHoc) return;
    setLoading(true);
    try {
      const data = await LoiMoiGiangVienService.GetDanhSachGiangVien(idKhoaHoc);
      setRows(data.danhSachCongTac.map((gv) => ({ ...gv, _dirty: false })));
      setPendingRows(data.danhSachDangMoi);
    } catch (err: any) {
      setToast({
        open: true,
        message: err.message || "Lỗi tải dữ liệu",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [idKhoaHoc]);

  // Thêm hàm hủy lời mời:
  const handleHuyLoiMoi = async (idLoiMoi: string) => {
    setDangHuyLoiMoi(idLoiMoi);
    try {
      await LoiMoiGiangVienService.HuyLoiMoi(idLoiMoi);
      setToast({ open: true, message: "Đã hủy lời mời", severity: "success" });
      await load();
    } catch (err: any) {
      setToast({
        open: true,
        message: err.message || "Hủy thất bại",
        severity: "error",
      });
    } finally {
      setDangHuyLoiMoi(null);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // ── Tính tổng % ──────────────────────────────────────────────────────────
  const tongTyLe = rows.reduce((s, r) => s + (r.tyLeChiaDoanhThu || 0), 0);
  const hasDirty = rows.some((r) => r._dirty);

  const vuot100 = tongTyLe > 100;
  const coSoAm = rows.some((r) => r.tyLeChiaDoanhThu < 0);
  const coLoi = vuot100 || coSoAm;

  // ── Sửa 1 cell trên bảng ─────────────────────────────────────────────────
  const setCell = (
    idGiangVien: string,
    field: keyof CapNhatQuyenRequest,
    value: boolean | number,
  ) => {
    if (
      field === "tyLeChiaDoanhThu" &&
      typeof value === "number" &&
      value < 0
    ) {
      return;
    }
    setRows((prev) =>
      prev.map((r) =>
        r.idGiangVien === idGiangVien
          ? { ...r, [field]: value, _dirty: true }
          : r,
      ),
    );
  };

  // ── Save tất cả row đã dirty ──────────────────────────────────────────────
  const handleSave = async () => {
    // Validate tổng %
    if (tongTyLe > 100) {
      setToast({
        open: true,
        message: `Tổng tỷ lệ doanh thu đang là ${tongTyLe}%, không được vượt 100%.`,
        severity: "error",
      });
      return;
    }

    setDangLuu(true);
    try {
      const dirtyRows = rows.filter((r) => r._dirty && !r.laChuSoHuu);
      await Promise.all(
        dirtyRows.map((r) =>
          LoiMoiGiangVienService.CapNhatQuyenTheoGiangVien(
            idKhoaHoc,
            r.idGiangVien,
            {
              visible: r.visible,
              tyLeChiaDoanhThu: r.tyLeChiaDoanhThu,
              manage: r.manage,
              performance: r.performance,
              qnA: r.qnA,
              reviews: r.reviews,
              assignments: r.assignments,
              materials: r.materials,
              promotions: r.promotions,
            },
          ),
        ),
      );
      setRows((prev) => prev.map((r) => ({ ...r, _dirty: false })));
      setToast({
        open: true,
        message: "Đã lưu thay đổi!",
        severity: "success",
      });
    } catch (err: any) {
      setToast({
        open: true,
        message: err.message || "Lưu thất bại",
        severity: "error",
      });
    } finally {
      setDangLuu(false);
    }
  };

  // ── Gửi lời mời ──────────────────────────────────────────────────────────
  const handleGuiLoiMoi = async () => {
    if (!formMoi.email.trim()) {
      setLoiMoiDialog("Vui lòng nhập email");
      return;
    }

    // Kiểm tra tổng % sau khi thêm
    if (tongTyLe + formMoi.tyLeChiaDoanhThu > 100) {
      setLoiMoiDialog(
        `Tổng tỷ lệ sẽ vượt 100%. Tối đa bạn có thể thêm ${100 - tongTyLe}%.`,
      );
      return;
    }

    setDangGui(true);
    setLoiMoiDialog(null);
    try {
      await LoiMoiGiangVienService.GuiLoiMoi({ ...formMoi, idKhoaHoc });
      setToast({ open: true, message: "Đã gửi lời mời!", severity: "success" });
      setShowMoiDialog(false);
      setFormMoi({ ...DEFAULT_QUYEN });
      await load();
    } catch (err: any) {
      setLoiMoiDialog(
        err.response?.data?.message || err.message || "Gửi lời mời thất bại",
      );
    } finally {
      setDangGui(false);
    }
  };

  // ── Remove ────────────────────────────────────────────────────────────────
  const handleRemove = async () => {
    if (!removeTarget) return;
    setDangXoa(true);
    try {
      await LoiMoiGiangVienService.HuyTheoGiangVien(
        idKhoaHoc,
        removeTarget.idGiangVien,
      );
      setToast({
        open: true,
        message: "Đã xóa giảng viên",
        severity: "success",
      });
      setRemoveTarget(null);
      await load();
    } catch (err: any) {
      setToast({
        open: true,
        message: err.message || "Xóa thất bại",
        severity: "error",
      });
    } finally {
      setDangXoa(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AuthGuard allowedRoles={["Admin", "GiaoVien"]}>
      <Box sx={{ maxWidth: 1100, mx: "auto", pb: 12 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 24,
                  color: "#0F172A",
                  letterSpacing: "-0.02em",
                }}
              >
                Quản lý quyền giảng viên
              </Typography>
              <Tooltip title="Quản lý quyền hạn và tỷ lệ chia sẻ doanh thu cho từng giảng viên trong khóa học này.">
                <InfoOutlinedIcon
                  sx={{
                    fontSize: 19,
                    color: "#64748B",
                    cursor: "pointer",
                    transition: "color 0.2s",
                    "&:hover": { color: MAU.chinh },
                  }}
                />
              </Tooltip>
            </Box>
            <Typography
              sx={{ fontSize: 13, color: "#64748B", mt: 0.5, fontWeight: 500 }}
            >
              Phân quyền chi tiết & tỷ lệ chia sẻ doanh thu cho đội ngũ giảng viên cộng tác
            </Typography>
          </Box>

          {isEditable && (
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 20 }} />}
              onClick={() => {
                setShowMoiDialog(true);
                setLoiMoiDialog(null);
                setFormMoi({ ...DEFAULT_QUYEN });
              }}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontSize: 14,
                bgcolor: MAU.chinh,
                color: "#FFFFFF",
                borderRadius: "12px",
                px: 2.75,
                py: 1.1,
                boxShadow: "0 4px 14px rgba(139,19,19,0.22)",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: MAU.chinhDam || "#6b0f0f",
                  boxShadow: "0 6px 20px rgba(139,19,19,0.35)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              Thêm giảng viên
            </Button>
          )}
        </Box>

        {/* Card Tỷ lệ chia doanh thu */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3.5,
            borderRadius: "16px",
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "10px",
                  bgcolor: `${MAU.chinh}12`,
                  color: MAU.chinh,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PercentRoundedIcon sx={{ fontSize: 19 }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: "#1E293B" }}>
                Tổng tỷ lệ chia sẻ doanh thu giảng viên
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={`${tongTyLe}% / 100%`}
                size="small"
                sx={{
                  fontWeight: 800,
                  fontSize: 12.5,
                  bgcolor: vuot100 ? "#FEE2E2" : `${MAU.chinh}12`,
                  color: vuot100 ? "#DC2626" : MAU.chinh,
                  border: `1px solid ${vuot100 ? "#FCA5A5" : `${MAU.chinh}30`}`,
                  borderRadius: "8px",
                  px: 0.75,
                  py: 0.25,
                }}
              />
              {100 - tongTyLe > 0 && !vuot100 && (
                <Typography sx={{ fontSize: 12, color: "#10B981", fontWeight: 600 }}>
                  (Còn khả dụng {100 - tongTyLe}%)
                </Typography>
              )}
              {vuot100 && (
                <Typography sx={{ fontSize: 12, color: "#DC2626", fontWeight: 700 }}>
                  ⚠️ Vượt {tongTyLe - 100}%
                </Typography>
              )}
            </Stack>
          </Box>

          <Box
            sx={{
              height: 10,
              borderRadius: 99,
              bgcolor: "#F1F5F9",
              overflow: "hidden",
              p: "2px",
              border: "1px solid #E2E8F0",
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: `${Math.min(tongTyLe, 100)}%`,
                background: vuot100
                  ? "linear-gradient(90deg, #EF4444 0%, #DC2626 100%)"
                  : `linear-gradient(90deg, ${MAU.chinh} 0%, #E11D48 100%)`,
                borderRadius: 99,
                transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            />
          </Box>
        </Paper>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: MAU.chinh }} />
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
              bgcolor: "#FFFFFF",
            }}
          >
            {/* ── Header bảng ── */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `260px 110px repeat(${COT_QUYEN.length}, 1fr) 70px`,
                px: 3,
                py: 2,
                bgcolor: "#F8FAFC",
                borderBottom: "1px solid #E2E8F0",
                minWidth: 950,
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 12.5,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Giảng viên
              </Typography>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 12.5,
                  color: "#475569",
                  textAlign: "center",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Doanh thu
              </Typography>
              {COT_QUYEN.map((c) => {
                const info = QUYEN_MO_TA[c.key];
                return (
                  <Tooltip key={c.key} title={info?.desc || c.nhan} arrow placement="top">
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: 12,
                        color: "#475569",
                        textAlign: "center",
                        cursor: "help",
                        transition: "color 0.2s",
                        "&:hover": { color: MAU.chinh },
                      }}
                    >
                      {c.nhan}
                    </Typography>
                  </Tooltip>
                );
              })}
              <Box /> {/* cột action */}
            </Box>

            {/* ── Các row ── */}
            {rows.map((row, idx) => (
              <Box key={row.idGiangVien}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: `260px 110px repeat(${COT_QUYEN.length}, 1fr) 70px`,
                    px: 3,
                    py: 2.25,
                    alignItems: "center",
                    bgcolor: row._dirty ? `${MAU.chinh}04` : "transparent",
                    transition: "all 0.15s ease",
                    minWidth: 950,
                    "&:hover": { bgcolor: "#F8FAFC" },
                  }}
                >
                  {/* Instructor info */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.75,
                      minWidth: 0,
                      overflow: "hidden",
                    }}
                  >
                    <Avatar
                      src={row.anhDaiDien || ""}
                      sx={{
                        width: 42,
                        height: 42,
                        flexShrink: 0,
                        bgcolor: `${MAU.chinh}15`,
                        color: MAU.chinh,
                        fontSize: 15,
                        fontWeight: 800,
                        border: "2px solid #FFFFFF",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      }}
                    >
                      {row.hoTen?.[0] || (
                        <PersonOutlineIcon sx={{ fontSize: 20 }} />
                      )}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 14.5,
                          color: "#0F172A",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.hoTen || "Chưa có tên"}
                      </Typography>
                      {row.laChuSoHuu ? (
                        <Chip
                          icon={
                            <WorkspacePremiumRoundedIcon
                              sx={{
                                fontSize: "14px !important",
                                color: "#F59E0B !important",
                              }}
                            />
                          }
                          label="Chủ sở hữu"
                          size="small"
                          sx={{
                            fontSize: 11,
                            fontWeight: 800,
                            height: 22,
                            bgcolor: "#0F172A",
                            color: "#FFFFFF",
                            borderRadius: "6px",
                            mt: 0.25,
                            px: 0.5,
                          }}
                        />
                      ) : (
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "#64748B",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            mt: 0.25,
                          }}
                        >
                          {row.email}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Revenue share */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.75,
                    }}
                  >
                    <TextField
                      type="number"
                      size="small"
                      disabled={!isEditable}
                      value={row.tyLeChiaDoanhThu}
                      onChange={(e) => {
                        const v = Math.min(
                          100,
                          Math.max(0, Number(e.target.value)),
                        );
                        setCell(row.idGiangVien, "tyLeChiaDoanhThu", v);
                      }}
                      slotProps={{ htmlInput: { min: 0, max: 100, step: 5 } }}
                      sx={{
                        width: 70,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          height: 36,
                          bgcolor: "#F8FAFC",
                          transition: "all 0.2s ease",
                          "& input": {
                            textAlign: "center",
                            fontWeight: 800,
                            fontSize: 14,
                            p: "0 6px",
                            color: "#0F172A",
                          },
                          "& fieldset": {
                            borderColor:
                              row.tyLeChiaDoanhThu < 0 ||
                              (tongTyLe > 100 && row._dirty)
                                ? "#EF4444"
                                : "#E2E8F0",
                          },
                          "&:hover fieldset": {
                            borderColor:
                              row.tyLeChiaDoanhThu < 0 ||
                              (tongTyLe > 100 && row._dirty)
                                ? "#EF4444"
                                : "#CBD5E1",
                          },
                          "&.Mui-focused": {
                            bgcolor: "#FFFFFF",
                            boxShadow: "0 0 0 3px rgba(139,19,19,0.1)",
                            "& fieldset": {
                              borderColor:
                                row.tyLeChiaDoanhThu < 0 ||
                                (tongTyLe > 100 && row._dirty)
                                  ? "#EF4444"
                                  : MAU.chinh,
                            },
                          },
                        },
                      }}
                    />
                    <Typography
                      sx={{ fontSize: 13, color: "#64748B", fontWeight: 700 }}
                    >
                      %
                    </Typography>
                  </Box>

                  {/* Checkboxes quyền */}
                  {COT_QUYEN.map((c) => {
                    const isChecked = !!row[c.key as keyof GiangVienCongTacDto];
                    const info = QUYEN_MO_TA[c.key];
                    return (
                      <Box
                        key={c.key}
                        sx={{ display: "flex", justifyContent: "center" }}
                      >
                        <Tooltip title={info?.desc || c.nhan} arrow placement="top">
                          <span>
                            <Checkbox
                              checked={isChecked}
                              disabled={!isEditable || row.laChuSoHuu}
                              onChange={(e) =>
                                setCell(row.idGiangVien, c.key, e.target.checked)
                              }
                              size="small"
                              sx={{
                                p: 0.5,
                                color: "#CBD5E1",
                                "&.Mui-checked": { color: MAU.chinh },
                                "&:hover": { bgcolor: `${MAU.chinh}0A` },
                              }}
                            />
                          </span>
                        </Tooltip>
                      </Box>
                    );
                  })}

                  {/* Action */}
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    {!row.laChuSoHuu && isEditable && (
                      <IconButton
                        size="small"
                        onClick={() => setRemoveTarget(row)}
                        sx={{
                          color: "#94A3B8",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            color: "#EF4444",
                            bgcolor: "#FEE2E2",
                          },
                        }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 19 }} />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                {idx < rows.length - 1 && <Divider sx={{ borderColor: "#F1F5F9" }} />}
              </Box>
            ))}
          </Paper>
        )}

        {/* Nút Save */}
        {isEditable && hasDirty && (
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={dangLuu || coLoi} // ← dùng coLoi thay vì chỉ tongTyLe > 100
              sx={{
                bgcolor: "#1F2937",
                textTransform: "none",
                fontWeight: 700,
                fontSize: 15,
                px: 4,
                py: 1.2,
                borderRadius: "10px",
                boxShadow: "none",
                "&:hover": { bgcolor: "#111827", boxShadow: "none" },
                "&.Mui-disabled": { bgcolor: "#9CA3AF", color: "#fff" },
              }}
            >
              {dangLuu ? (
                <CircularProgress size={20} sx={{ color: "#fff" }} />
              ) : (
                "Lưu thay đổi"
              )}
            </Button>

            {/* Hiện lỗi cụ thể */}
            {vuot100 && (
              <Typography
                sx={{
                  fontSize: 12,
                  color: "#DC2626",
                  mt: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                ⚠ Tổng tỷ lệ đang là {tongTyLe}%, vượt quá 100%. Vui lòng điều
                chỉnh lại.
              </Typography>
            )}
            {coSoAm && (
              <Typography
                sx={{
                  fontSize: 12,
                  color: "#DC2626",
                  mt: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                ⚠ Có giảng viên đang có tỷ lệ âm. Vui lòng nhập lại.
              </Typography>
            )}
          </Box>
        )}
        {/* ── Section đang chờ xác nhận ─────────────────────────────────────── */}
        {pendingRows.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography
              sx={{ fontWeight: 700, fontSize: 15, color: "#1F2937", mb: 1.5 }}
            >
              Đang chờ xác nhận ({pendingRows.length})
            </Typography>
            <Paper
              elevation={0}
              sx={{
                borderRadius: "14px",
                border: "1px solid #FEF3C7",
                overflow: "hidden",
                bgcolor: "#FFFBEB",
              }}
            >
              {pendingRows.map((lm, idx) => (
                <Box key={lm.idLoiMoi}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      px: 2.5,
                      py: 2,
                    }}
                  >
                    {/* Avatar */}
                    <Avatar
                      src={lm.anhDaiDienDuocMoi || ""}
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: "#FEF3C7",
                        color: "#D97706",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {lm.hoTenDuocMoi?.[0] || (
                        <PersonOutlineIcon sx={{ fontSize: 18 }} />
                      )}
                    </Avatar>

                    {/* Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{ fontWeight: 700, fontSize: 14, color: "#1F2937" }}
                      >
                        {lm.hoTenDuocMoi || lm.emailDuocMoi}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "#8A7676" }}>
                        {lm.emailDuocMoi} · Mời lúc{" "}
                        {new Date(lm.ngayMoi).toLocaleDateString("vi-VN")}
                      </Typography>
                    </Box>

                    {/* % */}
                    <Chip
                      label={`${lm.tyLeChiaDoanhThu}% doanh thu`}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: 11,
                        bgcolor: "#FEF3C7",
                        color: "#D97706",
                      }}
                    />

                    {/* Quyền badges */}
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        maxWidth: 300,
                      }}
                    >
                      {COT_QUYEN.filter((c) => (lm as any)[c.key] === true).map(
                        (c) => (
                          <Chip
                            key={c.key}
                            label={c.nhan}
                            size="small"
                            sx={{
                              fontSize: 10,
                              fontWeight: 600,
                              bgcolor: "#F5F6F8",
                              color: "#4B5563",
                            }}
                          />
                        ),
                      )}
                    </Box>

                    {/* Badge trạng thái + nút hủy */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        flexShrink: 0,
                      }}
                    >
                      <Chip
                        label="Đang mời"
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: 11,
                          bgcolor: "#FEF3C7",
                          color: "#D97706",
                          border: "1px solid #FDE68A",
                        }}
                      />
                      {isEditable && (
                        <Button
                          size="small"
                          disabled={dangHuyLoiMoi === lm.idLoiMoi}
                          onClick={() => handleHuyLoiMoi(lm.idLoiMoi)}
                          sx={{
                            textTransform: "none",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#DC2626",
                            p: "2px 10px",
                            minWidth: 0,
                            border: "1px solid #FECACA",
                            borderRadius: "8px",
                            bgcolor: "#FFF",
                            "&:hover": {
                              bgcolor: "#FEE2E2",
                              borderColor: "#DC2626",
                            },
                          }}
                        >
                          {dangHuyLoiMoi === lm.idLoiMoi ? (
                            <CircularProgress
                              size={14}
                              sx={{ color: "#DC2626" }}
                            />
                          ) : (
                            "Hủy lời mời"
                          )}
                        </Button>
                      )}
                    </Box>
                  </Box>

                  {idx < pendingRows.length - 1 && <Divider sx={{ mx: 2.5 }} />}
                </Box>
              ))}
            </Paper>
          </Box>
        )}

        {/* ── Dialog mời giảng viên ──────────────────────────────────────────── */}
        <Dialog
          open={showMoiDialog}
          onClose={() => !dangGui && setShowMoiDialog(false)}
          maxWidth="sm"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                borderRadius: "24px",
                boxShadow: "0 24px 48px rgba(0, 0, 0, 0.16)",
                overflow: "hidden",
                border: "1px solid var(--ev-divider, #ECE7E4)",
              },
            },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2.75,
              pb: 2,
              background:
                "linear-gradient(135deg, #FFFBFB 0%, #FDF2F2 60%, #FAF0F0 100%)",
              borderBottom: "1px solid #F3E8E8",
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: "14px",
                  bgcolor: `${MAU.chinh}15`,
                  color: MAU.chinh,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(139,19,19,0.12)",
                }}
              >
                <PersonAddAlt1RoundedIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: 18,
                    color: "#1F2937",
                    lineHeight: 1.25,
                  }}
                >
                  Mời giảng viên cộng tác
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12.5,
                    color: "#6B7280",
                    mt: 0.25,
                    fontWeight: 500,
                  }}
                >
                  Phân quyền quản lý và chia sẻ tỷ lệ doanh thu khóa học
                </Typography>
              </Box>
            </Stack>

            <IconButton
              onClick={() => !dangGui && setShowMoiDialog(false)}
              disabled={dangGui}
              sx={{
                color: "#9CA3AF",
                bgcolor: "#FFFFFF",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                "&:hover": { color: "#1F2937", bgcolor: "#F3F4F6" },
              }}
            >
              <CloseRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          <DialogContent
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2.75,
              maxHeight: "75vh",
            }}
          >
            {/* Email Input Section */}
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 13.5,
                  color: "#1F2937",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                }}
              >
                Email giảng viên <span style={{ color: "#DC2626" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                placeholder="Ví dụ: giangvien@email.com"
                value={formMoi.email}
                onChange={(e) =>
                  setFormMoi((p) => ({ ...p, email: e.target.value }))
                }
                disabled={dangGui}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon
                          sx={{ color: MAU.chinh, fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    bgcolor: "#FAFAFA",
                    fontSize: 14,
                    transition: "all 0.2s ease",
                    "& fieldset": { borderColor: "#E5E7EB" },
                    "&:hover fieldset": { borderColor: "#CBD5E1" },
                    "&.Mui-focused": {
                      bgcolor: "#FFFFFF",
                      boxShadow: "0 0 0 4px rgba(139,19,19,0.08)",
                      "& fieldset": { borderColor: MAU.chinh, borderWidth: 1.5 },
                    },
                  },
                }}
              />
            </Box>

            {/* Revenue Share Section */}
            <Paper
              elevation={0}
              sx={{
                p: 2.25,
                borderRadius: "16px",
                bgcolor: "#FAFAFA",
                border: "1px solid #E5E7EB",
              }}
            >
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1.5,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 13.5,
                    color: "#1F2937",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                  }}
                >
                  <PercentRoundedIcon sx={{ fontSize: 18, color: MAU.chinh }} />
                  Tỷ lệ chia doanh thu
                </Typography>

                <Chip
                  label={`Còn lại: ${100 - tongTyLe}%`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: 11.5,
                    bgcolor: 100 - tongTyLe > 0 ? "#ECFDF5" : "#FEF2F2",
                    color: 100 - tongTyLe > 0 ? "#059669" : "#DC2626",
                    border: `1px solid ${100 - tongTyLe > 0 ? "#A7F3D0" : "#FCA5A5"}`,
                  }}
                />
              </Stack>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                <TextField
                  type="number"
                  size="small"
                  value={formMoi.tyLeChiaDoanhThu}
                  onChange={(e) => {
                    const v = Math.min(
                      100,
                      Math.max(0, Number(e.target.value)),
                    );
                    setFormMoi((p) => ({ ...p, tyLeChiaDoanhThu: v }));
                  }}
                  disabled={dangGui}
                  slotProps={{
                    htmlInput: { min: 0, max: 100, step: 5 },
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography
                            sx={{
                              fontSize: 14,
                              fontWeight: 800,
                              color: MAU.chinh,
                            }}
                          >
                            %
                          </Typography>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    width: 120,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      bgcolor: "#FFFFFF",
                      "& input": { textAlign: "center", fontWeight: 800, fontSize: 16 },
                      "& fieldset": { borderColor: "#CBD5E1" },
                      "&.Mui-focused fieldset": { borderColor: MAU.chinh },
                    },
                  }}
                />

                {/* Preset Chips */}
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.5 }}>
                  {[0, 10, 20, 30, 50].map((val) => (
                    <Chip
                      key={val}
                      label={`${val}%`}
                      clickable
                      disabled={dangGui}
                      onClick={() =>
                        setFormMoi((p) => ({
                          ...p,
                          tyLeChiaDoanhThu: Math.min(100 - tongTyLe, val),
                        }))
                      }
                      sx={{
                        fontSize: 12,
                        fontWeight: 700,
                        borderRadius: "8px",
                        bgcolor:
                          formMoi.tyLeChiaDoanhThu === val
                            ? `${MAU.chinh}15`
                            : "#FFFFFF",
                        color:
                          formMoi.tyLeChiaDoanhThu === val
                            ? MAU.chinh
                            : "#4B5563",
                        border:
                          formMoi.tyLeChiaDoanhThu === val
                            ? `1.5px solid ${MAU.chinh}`
                            : "1px solid #E2E8F0",
                        "&:hover": { bgcolor: `${MAU.chinh}10` },
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </Paper>

            {/* Permissions Section */}
            <Box>
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1.5,
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: "#1F2937" }}>
                  Phân quyền truy cập
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>
                  Đã chọn:{" "}
                  <strong style={{ color: MAU.chinh }}>
                    {COT_QUYEN.filter(
                      (c) => !!formMoi[c.key as keyof GuiLoiMoiRequest],
                    ).length}
                    /8
                  </strong>
                </Typography>
              </Stack>

              <Grid container spacing={1.25}>
                {COT_QUYEN.map((c) => {
                  const isChecked = !!formMoi[c.key as keyof GuiLoiMoiRequest];
                  const info = QUYEN_MO_TA[c.key];

                  return (
                    <Grid size={{ xs: 12, sm: 6 }} key={c.key}>
                      <Paper
                        elevation={0}
                        onClick={() =>
                          !dangGui &&
                          setFormMoi((p) => ({
                            ...p,
                            [c.key]: !isChecked,
                          }))
                        }
                        sx={{
                          p: 1.5,
                          borderRadius: "14px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1.25,
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          bgcolor: isChecked ? `${MAU.chinh}09` : "#FFFFFF",
                          border: isChecked
                            ? `1.5px solid ${MAU.chinh}`
                            : "1px solid #E5E7EB",
                          boxShadow: isChecked
                            ? "0 4px 12px rgba(139,19,19,0.08)"
                            : "none",
                          "&:hover": {
                            borderColor: MAU.chinh,
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", minWidth: 0 }}>
                          <Box
                            sx={{
                              width: 34,
                              height: 34,
                              borderRadius: "10px",
                              bgcolor: isChecked ? `${MAU.chinh}18` : "#F3F4F6",
                              color: isChecked ? MAU.chinh : "#6B7280",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              transition: "all 0.2s ease",
                            }}
                          >
                            {info?.icon}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: isChecked ? MAU.chinh : "#1F2937",
                                lineHeight: 1.3,
                              }}
                            >
                              {info?.label || c.nhan}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: 10.5,
                                color: "#6B7280",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                mt: 0.25,
                              }}
                            >
                              {info?.desc}
                            </Typography>
                          </Box>
                        </Stack>

                        {c.key === "visible" ? (
                          <Switch
                            checked={isChecked}
                            onChange={(e) => {
                              e.stopPropagation();
                              setFormMoi((p) => ({
                                ...p,
                                visible: e.target.checked,
                              }));
                            }}
                            disabled={dangGui}
                            size="small"
                            sx={{
                              "& .MuiSwitch-switchBase.Mui-checked": {
                                color: MAU.chinh,
                              },
                              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                { bgcolor: MAU.chinh },
                            }}
                          />
                        ) : (
                          <Checkbox
                            checked={isChecked}
                            onChange={(e) => {
                              e.stopPropagation();
                              setFormMoi((p) => ({
                                ...p,
                                [c.key]: e.target.checked,
                              }));
                            }}
                            disabled={dangGui}
                            size="small"
                            sx={{
                              p: 0.25,
                              color: "#CBD5E1",
                              "&.Mui-checked": { color: MAU.chinh },
                            }}
                          />
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>

            {loiMoiDialog && (
              <Alert
                severity="error"
                sx={{
                  borderRadius: "12px",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {loiMoiDialog}
              </Alert>
            )}
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              py: 2,
              borderTop: "1px solid #ECE7E4",
              bgcolor: "#FAFAFA",
              gap: 1.25,
            }}
          >
            <Button
              onClick={() => setShowMoiDialog(false)}
              disabled={dangGui}
              sx={{
                textTransform: "none",
                color: "#6B7280",
                fontWeight: 700,
                fontSize: 13.5,
                borderRadius: "12px",
                px: 2.5,
                py: 1,
                "&:hover": { bgcolor: "#E5E7EB" },
              }}
            >
              Hủy bỏ
            </Button>

            <Button
              variant="contained"
              onClick={handleGuiLoiMoi}
              disabled={dangGui || !formMoi.email.trim()}
              startIcon={
                dangGui ? (
                  <CircularProgress size={18} sx={{ color: "#fff" }} />
                ) : (
                  <SendRoundedIcon sx={{ fontSize: 18 }} />
                )
              }
              sx={{
                bgcolor: MAU.chinh,
                textTransform: "none",
                fontWeight: 800,
                fontSize: 14,
                borderRadius: "12px",
                px: 3.5,
                py: 1,
                boxShadow: "0 4px 14px rgba(139,19,19,0.25)",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: MAU.chinhDam,
                  boxShadow: "0 6px 20px rgba(139,19,19,0.38)",
                  transform: "translateY(-1px)",
                },
                "&.Mui-disabled": { bgcolor: "#E2E8F0", color: "#94A3B8" },
              }}
            >
              {dangGui ? "Đang gửi..." : "Gửi lời mời"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Dialog xác nhận remove ─────────────────────────────────────────── */}
        <Dialog
          open={!!removeTarget}
          onClose={() => !dangXoa && setRemoveTarget(null)}
          maxWidth="xs"
          fullWidth
          slotProps={{ paper: { sx: { borderRadius: "14px" } } }}
        >
          <DialogTitle sx={{ fontWeight: 700, color: "#DC2626" }}>
            Xóa giảng viên
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: "#4B5563" }}>
              Bạn chắc chắn muốn xóa{" "}
              <strong>{removeTarget?.hoTen || removeTarget?.email}</strong> khỏi
              khóa học này?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              onClick={() => setRemoveTarget(null)}
              disabled={dangXoa}
              sx={{ textTransform: "none", color: "#8A7676" }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleRemove}
              disabled={dangXoa}
              sx={{
                bgcolor: "#DC2626",
                textTransform: "none",
                fontWeight: 700,
                "&:hover": { bgcolor: "#B91C1C" },
              }}
            >
              {dangXoa ? (
                <CircularProgress size={18} sx={{ color: "#fff" }} />
              ) : (
                "Xác nhận xóa"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={() => setToast({ ...toast, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={toast.severity} sx={{ width: "100%" }}>
            {toast.message}
          </Alert>
        </Snackbar>
      </Box>
    </AuthGuard>
  );
}
