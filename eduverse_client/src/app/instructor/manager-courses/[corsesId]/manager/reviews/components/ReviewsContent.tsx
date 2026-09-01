/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Box,
  Typography,
  Paper,
  Rating,
  LinearProgress,
  CircularProgress,
  Divider,
  TextField,
  Button,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import ReplyIcon from "@mui/icons-material/Reply";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import AuthGuard from "@/src/components/AuthGuard";
import { useCourseEdit } from "../../components/CourseEditContext";
import { MAU } from "../../components/courseEditCore";
import DanhGiaService, {
  DanhGiaDto,
  DanhGiaKhoaHocDto,
} from "@/src/services/DanhGiaService";
import { useQuyenCuaToi } from "@/src/hook/useQuyenCuaToi";
import { CSSVAR, STATUS } from "@/src/theme/tokens";
import { EduAvatar } from "@/src/components/common/EduAvatar";

function thoiGian(ngay: string) {
  try {
    return formatDistanceToNow(new Date(ngay), { addSuffix: true, locale: vi });
  } catch {
    return "";
  }
}

function UserAvatar({
  anh,
  ten,
  size = 36,
}: {
  anh?: string;
  ten?: string;
  size?: number;
}) {
  return (
    <EduAvatar
      src={anh}
      name={ten}
      size={size}
    />
  );
}

// ── Thanh phân bổ sao ────────────────────────────────────────────────────────
function SaoBar({ sao, so, tong }: { sao: number; so: number; tong: number }) {
  const pct = tong > 0 ? (so / tong) * 100 : 0;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.75 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          width: 48,
          flexShrink: 0,
        }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: CSSVAR.textSecondary }}>
          {sao}
        </Typography>
        <StarIcon sx={{ fontSize: 14, color: STATUS.warning }} />
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          flex: 1,
          height: 8,
          borderRadius: 99,
          bgcolor: "#F1F2F5",
          "& .MuiLinearProgress-bar": { bgcolor: STATUS.warning, borderRadius: 99 },
        }}
      />
      <Typography
        sx={{
          fontSize: 12,
          color: "#6B7280",
          width: 32,
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {so}
      </Typography>
    </Box>
  );
}

// ── Card từng đánh giá ───────────────────────────────────────────────────────
function DanhGiaCard({
  dg,
  laGiangVien,
  onPhanHoi,
  onSuaPhanHoi,
  onXoaPhanHoi,
}: {
  dg: DanhGiaDto;
  laGiangVien?: boolean;
  onPhanHoi: (id: string) => void;
  onSuaPhanHoi: (idPhanHoi: string, noiDung: string) => void;
  onXoaPhanHoi: (idPhanHoi: string) => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [noiDungEdit, setNoiDungEdit] = useState(dg.phanHoi?.noiDung || "");
  const [dangLuu, setDangLuu] = useState(false);

  const handleSua = async () => {
    if (!dg.phanHoi || !noiDungEdit.trim()) return;
    setDangLuu(true);
    try {
      await DanhGiaService.SuaPhanHoi(dg.phanHoi.id, noiDungEdit.trim());
      onSuaPhanHoi(dg.phanHoi.id, noiDungEdit.trim());
      setEditMode(false);
    } finally {
      setDangLuu(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "14px",
        border: `1px solid ${CSSVAR.divider}`,
        bgcolor: "var(--ev-paper, #fff)",
      }}
    >
      {/* Header học viên */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 1.5 }}>
        <UserAvatar anh={dg.anhNguoiDung} ten={dg.hoTenNguoiDung} size={40} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography
              sx={{ fontWeight: 700, fontSize: 14, color: CSSVAR.textPrimary }}
            >
              {dg.hoTenNguoiDung || "Ẩn danh"}
            </Typography>
            <Rating
              value={dg.soSao}
              readOnly
              size="small"
              sx={{ "& .MuiRating-iconFilled": { color: STATUS.warning } }}
            />
            <Typography sx={{ fontSize: 11, color: CSSVAR.grey, ml: "auto" }}>
              {thoiGian(dg.ngayTao)}
            </Typography>
          </Box>
          {dg.noiDung && (
            <Typography
              sx={{ fontSize: 14, color: "#374151", lineHeight: 1.6, mt: 0.75 }}
            >
              {dg.noiDung}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Phản hồi của giảng viên */}
      {dg.phanHoi ? (
        <Box
          sx={{
            ml: 7,
            mt: 1.5,
            p: 2,
            borderRadius: "10px",
            bgcolor: `${MAU.chinh}06`,
            border: `1px solid ${MAU.chinh}22`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <UserAvatar
              anh={dg.phanHoi.anhGV}
              ten={dg.phanHoi.hoTenGV}
              size={28}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  sx={{ fontWeight: 700, fontSize: 13, color: CSSVAR.textPrimary }}
                >
                  {dg.phanHoi.hoTenGV || "Giảng viên"}
                </Typography>
                <Chip
                  label="Giảng viên"
                  size="small"
                  sx={{
                    fontSize: 10,
                    height: 18,
                    bgcolor: `${MAU.chinh}14`,
                    color: MAU.chinh,
                    fontWeight: 700,
                  }}
                />
                <Typography sx={{ fontSize: 11, color: CSSVAR.grey, ml: "auto" }}>
                  {thoiGian(dg.phanHoi.ngayTao)}
                </Typography>
              </Box>
            </Box>
            {laGiangVien && !editMode && (
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <Tooltip title="Sửa phản hồi">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditMode(true);
                      setNoiDungEdit(dg.phanHoi!.noiDung);
                    }}
                    sx={{ color: CSSVAR.grey, "&:hover": { color: MAU.chinh } }}
                  >
                    <EditOutlinedIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Xóa phản hồi">
                  <IconButton
                    size="small"
                    onClick={() => onXoaPhanHoi(dg.phanHoi!.id)}
                    sx={{ color: CSSVAR.grey, "&:hover": { color: STATUS.error } }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>

          {editMode ? (
            <Box>
              <TextField
                fullWidth
                multiline
                minRows={2}
                maxRows={5}
                value={noiDungEdit}
                onChange={(e) => setNoiDungEdit(e.target.value)}
                disabled={dangLuu}
                sx={{
                  mb: 1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    fontSize: 13,
                    bgcolor: "#fff",
                    "& fieldset": { borderColor: CSSVAR.divider },
                    "&.Mui-focused fieldset": { borderColor: MAU.chinh },
                  },
                }}
              />
              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button
                  size="small"
                  onClick={() => setEditMode(false)}
                  disabled={dangLuu}
                  startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    textTransform: "none",
                    color: "#6B7280",
                    fontWeight: 600,
                  }}
                >
                  Hủy
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleSua}
                  disabled={dangLuu || !noiDungEdit.trim()}
                  startIcon={
                    dangLuu ? (
                      <CircularProgress size={12} sx={{ color: "#fff" }} />
                    ) : (
                      <CheckIcon sx={{ fontSize: 14 }} />
                    )
                  }
                  sx={{
                    bgcolor: MAU.chinh,
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "8px",
                    boxShadow: "none",
                    "&:hover": { bgcolor: MAU.chinhDam, boxShadow: "none" },
                  }}
                >
                  Lưu
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography
              sx={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}
            >
              {dg.phanHoi.noiDung}
            </Typography>
          )}
        </Box>
      ) : (
        laGiangVien && (
          <Box sx={{ ml: 7, mt: 1.5 }}>
            <Button
              size="small"
              startIcon={<ReplyIcon sx={{ fontSize: 14 }} />}
              onClick={() => onPhanHoi(dg.id)}
              sx={{
                textTransform: "none",
                fontSize: 12.5,
                fontWeight: 700,
                color: MAU.chinh,
                p: "4px 12px",
                border: `1px solid ${MAU.chinh}33`,
                borderRadius: "8px",
                "&:hover": { bgcolor: `${MAU.chinh}08` },
              }}
            >
              Phản hồi đánh giá
            </Button>
          </Box>
        )
      )}
    </Paper>
  );
}

// ── Component chính ──────────────────────────────────────────────────────────
export default function ReviewsContent() {
  const { idKhoaHoc, trangThai } = useCourseEdit();
  const { coQuyen, loading: loadingQuyen } = useQuyenCuaToi(idKhoaHoc);

  const [data, setData] = useState<DanhGiaKhoaHocDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form phản hồi inline
  const [phanHoiId, setPhanHoiId] = useState<string | null>(null); // idDanhGia đang phản hồi
  const [noiDungPhanHoi, setNoiDungPhanHoi] = useState("");
  const [dangGui, setDangGui] = useState(false);

  const coTheXem = trangThai === "DaDuyet" && coQuyen("reviews");

  // Load
  useEffect(() => {
    if (!idKhoaHoc) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    DanhGiaService.GetByKhoaHoc(idKhoaHoc)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [idKhoaHoc]);

  // Gửi phản hồi
  const handleGuiPhanHoi = useCallback(async () => {
    if (!phanHoiId || !noiDungPhanHoi.trim()) return;
    setDangGui(true);
    try {
      await DanhGiaService.PhanHoi(phanHoiId, noiDungPhanHoi.trim());
      // Reload lại data để hiển thị phản hồi mới
      const newData = await DanhGiaService.GetByKhoaHoc(idKhoaHoc);
      setData(newData);
      setPhanHoiId(null);
      setNoiDungPhanHoi("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDangGui(false);
    }
  }, [phanHoiId, noiDungPhanHoi, idKhoaHoc]);

  // Sửa phản hồi — cập nhật local state
  const handleSuaPhanHoi = useCallback((idPhanHoi: string, noiDung: string) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            danhSach: prev.danhSach.map((dg) =>
              dg.phanHoi?.id === idPhanHoi
                ? { ...dg, phanHoi: { ...dg.phanHoi!, noiDung } }
                : dg,
            ),
          }
        : prev,
    );
  }, []);

  // Xóa phản hồi
  const handleXoaPhanHoi = useCallback(async (idPhanHoi: string) => {
    try {
      await DanhGiaService.XoaPhanHoi(idPhanHoi);
      setData((prev) =>
        prev
          ? {
              ...prev,
              danhSach: prev.danhSach.map((dg) =>
                dg.phanHoi?.id === idPhanHoi
                  ? { ...dg, phanHoi: undefined }
                  : dg,
              ),
            }
          : prev,
      );
    } catch (err: any) {
      setError(err.message);
    }
  }, []);
  if (loadingQuyen) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress sx={{ color: MAU.chinh }} />
      </Box>
    );
  }

  // ── Guard render: chưa duyệt ──
  if (trangThai !== "DaDuyet") {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <Typography sx={{ fontWeight: 700, color: CSSVAR.grey }}>
          Đánh giá chỉ khả dụng sau khi khóa học được duyệt.
        </Typography>
      </Box>
    );
  }

  // ── Guard render: không có quyền ──
  if (!coQuyen("reviews")) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <Typography sx={{ fontWeight: 700, color: CSSVAR.grey }}>
          Bạn không có quyền truy cập mục Đánh giá.
        </Typography>
      </Box>
    );
  }

  return (
    <AuthGuard allowedRoles={["Admin", "GiaoVien"]}>
      <Box sx={{ maxWidth: 900, mx: "auto", pb: 8 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontWeight: 900, fontSize: 24, color: CSSVAR.textPrimary }}>
            Đánh giá khóa học
          </Typography>
          <Typography sx={{ fontSize: 14, color: CSSVAR.textSecondary, mt: 0.5 }}>
            Xem và phản hồi đánh giá từ học viên
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: MAU.chinh }} />
          </Box>
        ) : !data ? null : (
          <Box>
            {/* Tổng quan */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "16px",
                border: `1px solid ${CSSVAR.divider}`,
                mb: 4,
                display: "flex",
                gap: 4,
                flexWrap: "wrap",
              }}
            >
              {/* Điểm trung bình */}
              <Box sx={{ textAlign: "center", minWidth: 120 }}>
                <Typography
                  sx={{
                    fontSize: 56,
                    fontWeight: 900,
                    color: CSSVAR.textPrimary,
                    lineHeight: 1,
                  }}
                >
                  {data.diemTrungBinh.toFixed(1)}
                </Typography>
                <Rating
                  value={data.diemTrungBinh}
                  readOnly
                  precision={0.1}
                  sx={{
                    mt: 1,
                    "& .MuiRating-iconFilled": { color: STATUS.warning },
                  }}
                />
                <Typography sx={{ fontSize: 13, color: "#6B7280", mt: 0.5 }}>
                  {data.tongSoDanhGia} đánh giá
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem />

              {/* Phân bổ sao */}
              <Box sx={{ flex: 1, minWidth: 200 }}>
                {[5, 4, 3, 2, 1].map((sao) => (
                  <SaoBar
                    key={sao}
                    sao={sao}
                    so={data.phanBoSao[sao] ?? 0}
                    tong={data.tongSoDanhGia}
                  />
                ))}
              </Box>
            </Paper>

            {/* Danh sách đánh giá */}
            {data.danhSach.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <StarIcon sx={{ fontSize: 48, color: "#D1D5DB", mb: 1 }} />
                <Typography sx={{ fontWeight: 700, color: CSSVAR.grey }}>
                  Chưa có đánh giá nào
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {data.danhSach.map((dg) => (
                  <Box key={dg.id}>
                    <DanhGiaCard
                      dg={dg}
                      laGiangVien={true}
                      onPhanHoi={(id) => {
                        setPhanHoiId(id);
                        setNoiDungPhanHoi("");
                      }}
                      onSuaPhanHoi={handleSuaPhanHoi}
                      onXoaPhanHoi={handleXoaPhanHoi}
                    />

                    {/* Form phản hồi inline — hiện ngay dưới card */}
                    {phanHoiId === dg.id && (
                      <Box
                        sx={{
                          ml: 7,
                          mt: 1,
                          p: 2,
                          borderRadius: "10px",
                          bgcolor: "#F9FAFB",
                          border: "1px dashed ${CSSVAR.divider}",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: MAU.chinh,
                            mb: 1,
                          }}
                        >
                          ↩ Phản hồi đánh giá này
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          maxRows={5}
                          placeholder="Viết phản hồi của bạn..."
                          value={noiDungPhanHoi}
                          onChange={(e) => setNoiDungPhanHoi(e.target.value)}
                          disabled={dangGui}
                          autoFocus
                          sx={{
                            mb: 1.5,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "10px",
                              fontSize: 14,
                              bgcolor: "#fff",
                              "& fieldset": { borderColor: CSSVAR.divider },
                              "&.Mui-focused fieldset": {
                                borderColor: MAU.chinh,
                              },
                            },
                          }}
                        />
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "flex-end",
                          }}
                        >
                          <Button
                            size="small"
                            onClick={() => {
                              setPhanHoiId(null);
                              setNoiDungPhanHoi("");
                            }}
                            disabled={dangGui}
                            sx={{
                              textTransform: "none",
                              color: "#6B7280",
                              fontWeight: 600,
                            }}
                          >
                            Hủy
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={handleGuiPhanHoi}
                            disabled={dangGui || !noiDungPhanHoi.trim()}
                            sx={{
                              bgcolor: MAU.chinh,
                              textTransform: "none",
                              fontWeight: 700,
                              borderRadius: "8px",
                              boxShadow: "none",
                              "&:hover": {
                                bgcolor: MAU.chinhDam,
                                boxShadow: "none",
                              },
                            }}
                          >
                            {dangGui ? (
                              <CircularProgress
                                size={16}
                                sx={{ color: "#fff" }}
                              />
                            ) : (
                              "Gửi phản hồi"
                            )}
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </AuthGuard>
  );
}
