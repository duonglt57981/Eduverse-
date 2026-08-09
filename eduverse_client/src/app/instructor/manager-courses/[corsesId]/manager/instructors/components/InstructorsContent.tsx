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
  { key: "visible", nhan: "Visible" },
  { key: "manage", nhan: "Manage" },
  { key: "performance", nhan: "Performance" },
  { key: "qnA", nhan: "Q&A" },
  { key: "reviews", nhan: "Reviews" },
  { key: "assignments", nhan: "Assignments" },
  { key: "materials", nhan: "Materials" },
  { key: "promotions", nhan: "Promotions" },
];

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
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{ fontWeight: 900, fontSize: 22, color: "#1E293B" }}
            >
              Manage instructor permissions
            </Typography>
            <Tooltip title="Quản lý quyền hạn và tỷ lệ doanh thu cho từng giảng viên trong khóa học này.">
              <InfoOutlinedIcon
                sx={{ fontSize: 18, color: "#8A7676", cursor: "pointer" }}
              />
            </Tooltip>
          </Box>
          {isEditable && (
            <Button
              startIcon={<AddIcon />}
              onClick={() => {
                setShowMoiDialog(true);
                setLoiMoiDialog(null);
                setFormMoi({ ...DEFAULT_QUYEN });
              }}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                color: MAU.chinh,
                "&:hover": { bgcolor: `${MAU.chinh}0F` },
              }}
            >
              + Add instructor
            </Button>
          )}
        </Box>

        {/* Thanh % tổng */}
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              flex: 1,
              height: 6,
              borderRadius: 99,
              bgcolor: "#F1F2F5",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: `${Math.min(tongTyLe, 100)}%`,
                bgcolor: vuot100 ? "#DC2626" : MAU.chinh,
                borderRadius: 99,
                transition: "width 0.3s ease",
              }}
            />
          </Box>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
              color: vuot100 ? "#DC2626" : "#4B5563",
            }}
          >
            {tongTyLe}% / 100% doanh thu giảng viên
            {vuot100 && (
              <Box
                component="span"
                sx={{ ml: 1, fontSize: 11, fontWeight: 600 }}
              >
                (vượt {tongTyLe - 100}%)
              </Box>
            )}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: MAU.chinh }} />
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{
              borderRadius: "14px",
              border: "1px solid var(--ev-divider, #ECE7E4)",
              overflow: "auto",
            }}
          >
            {/* ── Header bảng ── */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `240px 90px repeat(${COT_QUYEN.length}, 1fr) 80px`,
                px: 2.5,
                py: 1.5,
                bgcolor: "var(--ev-paper-alt, #F7F5F2)",
                borderBottom: "1px solid var(--ev-divider, #ECE7E4)",
                minWidth: 900,
              }}
            >
              <Typography
                sx={{ fontWeight: 700, fontSize: 13, color: "#4B5563" }}
              >
                Instructor
              </Typography>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#4B5563",
                  textAlign: "center",
                }}
              >
                Revenue share
              </Typography>
              {COT_QUYEN.map((c) => (
                <Typography
                  key={c.key}
                  sx={{
                    fontWeight: 700,
                    fontSize: 12,
                    color: "#4B5563",
                    textAlign: "center",
                  }}
                >
                  {c.nhan}
                </Typography>
              ))}
              <Box /> {/* cột action */}
            </Box>

            {/* ── Các row ── */}
            {rows.map((row, idx) => (
              <Box key={row.idGiangVien}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: `240px 90px repeat(${COT_QUYEN.length}, 1fr) 80px`,
                    px: 2.5,
                    py: 2,
                    alignItems: "center",
                    bgcolor: row._dirty ? `${MAU.chinh}05` : "transparent",
                    transition: "background-color 0.15s ease",
                  }}
                >
                  {/* Instructor info */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      minWidth: 0,
                      overflow: "hidden",
                    }}
                  >
                    <Avatar
                      src={row.anhDaiDien || ""}
                      sx={{
                        width: 36,
                        height: 36,
                        flexShrink: 0,
                        bgcolor: `${MAU.chinh}22`,
                        color: MAU.chinh,
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {row.hoTen?.[0] || (
                        <PersonOutlineIcon sx={{ fontSize: 18 }} />
                      )}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: "#1F2937",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.hoTen || "Chưa có tên"}
                      </Typography>
                      {row.laChuSoHuu ? (
                        <Chip
                          label="Owner"
                          size="small"
                          sx={{
                            fontSize: 10,
                            fontWeight: 700,
                            height: 18,
                            bgcolor: "#1F2937",
                            color: "#fff",
                            borderRadius: "4px",
                          }}
                        />
                      ) : (
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "#8A7676",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
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
                      gap: 0.5,
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
                        width: 64,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          height: 34,
                          "& input": {
                            textAlign: "center",
                            fontWeight: 700,
                            fontSize: 14,
                            p: "0 8px",
                          },
                          "& fieldset": {
                            borderColor:
                              row.tyLeChiaDoanhThu < 0 ||
                              (tongTyLe > 100 && row._dirty)
                                ? "#DC2626"
                                : "#ECE7E4",
                          },
                          "&:hover fieldset": {
                            borderColor:
                              row.tyLeChiaDoanhThu < 0 ||
                              (tongTyLe > 100 && row._dirty)
                                ? "#DC2626"
                                : "#CBD5E1",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor:
                              row.tyLeChiaDoanhThu < 0 ||
                              (tongTyLe > 100 && row._dirty)
                                ? "#DC2626"
                                : MAU.chinh,
                          },
                        },
                      }}
                    />
                    <Typography
                      sx={{ fontSize: 13, color: "#8A7676", fontWeight: 600 }}
                    >
                      %
                    </Typography>
                  </Box>

                  {/* Checkboxes quyền */}
                  {COT_QUYEN.map((c) => (
                    <Box
                      key={c.key}
                      sx={{ display: "flex", justifyContent: "center" }}
                    >
                      <Checkbox
                        checked={!!row[c.key as keyof GiangVienCongTacDto]}
                        disabled={!isEditable || row.laChuSoHuu}
                        onChange={(e) =>
                          setCell(row.idGiangVien, c.key, e.target.checked)
                        }
                        size="small"
                        sx={{
                          p: 0.5,
                          color: "#C7CCD6",
                          "&.Mui-checked": { color: MAU.chinh },
                        }}
                      />
                    </Box>
                  ))}

                  {/* Action */}
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    {!row.laChuSoHuu && isEditable && (
                      <Button
                        size="small"
                        onClick={() => setRemoveTarget(row)}
                        sx={{
                          textTransform: "none",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#DC2626",
                          p: "2px 8px",
                          minWidth: 0,
                          "&:hover": { bgcolor: "#FEE2E2" },
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                </Box>

                {idx < rows.length - 1 && <Divider sx={{ mx: 2.5 }} />}
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
                "Save"
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
          maxWidth="xs"
          fullWidth
          slotProps={{ paper: { sx: { borderRadius: "16px" } } }}
        >
          <DialogTitle
            sx={{
              fontWeight: 700,
              fontSize: 17,
              borderBottom: "1px solid #ECE7E4",
              py: 2,
            }}
          >
            Mời giảng viên cộng tác
          </DialogTitle>
          <DialogContent
            sx={{ pt: 3, display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            {/* Email */}
            <TextField
              fullWidth
              label="Email giảng viên"
              placeholder="example@email.com"
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
                        sx={{ color: "#8A7676", fontSize: 18 }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  "&.Mui-focused fieldset": { borderColor: MAU.chinh },
                },
              }}
            />

            {/* % doanh thu */}
            <Box>
              <Typography
                sx={{ fontWeight: 700, fontSize: 13, mb: 1, color: "#1F2937" }}
              >
                Tỷ lệ doanh thu
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                  slotProps={{ htmlInput: { min: 0, max: 100, step: 5 } }}
                  sx={{
                    width: 80,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      "& input": { textAlign: "center", fontWeight: 700 },
                      "& fieldset": { borderColor: "#ECE7E4" },
                      "&.Mui-focused fieldset": { borderColor: MAU.chinh },
                    },
                  }}
                />
                <Typography sx={{ fontSize: 13, color: "#4B5563" }}>
                  % &nbsp;·&nbsp; Còn lại: <strong>{100 - tongTyLe}%</strong>
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* Quyền dạng bảng nhỏ */}
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 13,
                  mb: 1.5,
                  color: "#1F2937",
                }}
              >
                Quyền hạn
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {/* visible riêng vì có label dài */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                      Visible
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#8A7676" }}>
                      Hiển thị công khai trên trang khóa học
                    </Typography>
                  </Box>
                  <Switch
                    checked={formMoi.visible}
                    onChange={(e) =>
                      setFormMoi((p) => ({ ...p, visible: e.target.checked }))
                    }
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
                </Box>
                {COT_QUYEN.filter((c) => c.key !== "visible").map((c) => (
                  <Box
                    key={c.key}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      py: 0.5,
                    }}
                  >
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                      {c.nhan}
                    </Typography>
                    <Checkbox
                      checked={!!formMoi[c.key as keyof GuiLoiMoiRequest]}
                      onChange={(e) =>
                        setFormMoi((p) => ({ ...p, [c.key]: e.target.checked }))
                      }
                      disabled={dangGui}
                      size="small"
                      sx={{
                        p: 0.5,
                        color: "#C7CCD6",
                        "&.Mui-checked": { color: MAU.chinh },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>

            {loiMoiDialog && <Alert severity="error">{loiMoiDialog}</Alert>}
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: "1px solid #ECE7E4", gap: 1 }}>
            <Button
              onClick={() => setShowMoiDialog(false)}
              disabled={dangGui}
              sx={{ textTransform: "none", color: "#8A7676", fontWeight: 600 }}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="contained"
              onClick={handleGuiLoiMoi}
              disabled={dangGui || !formMoi.email.trim()}
              sx={{
                bgcolor: MAU.chinh,
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "10px",
                px: 3,
                boxShadow: "none",
                "&:hover": { bgcolor: MAU.chinhDam, boxShadow: "none" },
              }}
            >
              {dangGui ? (
                <CircularProgress size={18} sx={{ color: "#fff" }} />
              ) : (
                "Gửi lời mời"
              )}
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
