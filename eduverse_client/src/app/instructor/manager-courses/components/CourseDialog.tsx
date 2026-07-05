/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/instructor/manager-courses/components/CourseDialog.tsx

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  Stack,
  Box,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  InputAdornment,
  Typography,
  IconButton,
  Grid,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CategoryIcon from "@mui/icons-material/Category";
import CloseIcon from "@mui/icons-material/Close";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

import KhoaHocService from "@/src/services/KhoaHocService";
import { danhMucService } from "@/src/services/danhmucService";
import { KhoaHocType, DanhMucDto, CourseForm } from "../types";
import {
  R,
  RedBtn,
  OutlineBtn,
  UploadZone,
  ALLOWED_IMG_EXT,
  MAX_IMG_MB,
  validateImgFile,
  resolveApiResult,
} from "../types/constants";
import { useToast } from "./useToast";
import { RichTextEditor } from "./RichTextEditor";

const khoaHocSvc = new KhoaHocService();

const MAX_GIA = 100_000_000;
const IMG_ACCEPT = ".jpg,.jpeg,.png,image/jpeg,image/png";

/* ── Shared input styling ────────────────────────────────────────────────── */
const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontSize: 14,
    height: 46,
    backgroundColor: "#fff",
    "& fieldset": { borderColor: "#D1D5DB" },
    "&:hover fieldset": { borderColor: "rgba(141, 19, 19, 0.4)" },
    "&.Mui-focused fieldset": { borderColor: R, borderWidth: "1.5px" },
    "&.Mui-focused": {
      boxShadow: "0 0 0 3px rgba(141, 19, 19, 0.06)",
    },
  },
  "& .MuiInputLabel-root": { display: "none" },
  "& .MuiOutlinedInput-notchedOutline legend": { display: "none" },
  "& .MuiOutlinedInput-input": {
    padding: "12px 14px",
    "&::placeholder": { color: "#9CA3AF", opacity: 1 },
  },
  "& .MuiOutlinedInput-root.Mui-error fieldset": {
    borderColor: "#DC2626",
  },
};

const labelSx = {
  fontSize: 14,
  fontWeight: 600,
  color: "#1F2937",
  mb: 0.75,
  fontFamily: '"Be Vietnam Pro", sans-serif',
};

interface CourseDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editCourse?: KhoaHocType | null;
}

export function CourseDialog({
  open,
  onClose,
  onSaved,
  editCourse,
}: CourseDialogProps) {
  const { show, ToastComponent } = useToast();
  const [form, setForm] = useState<CourseForm>({
    tieuDe: "",
    moTa: "",
    gia: "",
    giaGoc: "",
    capDo: "Cơ bản",
    idDanhMucList: [],
  });
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{
    img?: string;
    gia?: string;
    danhMuc?: string;
  }>({});

  const [danhMucList, setDanhMucList] = useState<DanhMucDto[]>([]);
  const [danhMucLoading, setDanhMucLoading] = useState(false);
  const [danhMucError, setDanhMucError] = useState<string | null>(null);

  // ── Load danh mục ──────────────────────────────────────────────────────────
  const loadDanhMuc = useCallback(async () => {
    if (danhMucList.length > 0) return;

    setDanhMucLoading(true);
    setDanhMucError(null);

    try {
      const res = await danhMucService.getList({
        pageIndex: 1,
        pageSize: 100,
      });

      let items: DanhMucDto[] = [];

      if (Array.isArray(res.data)) {
        items = res.data;
      } else {
        items = res.data.items ?? [];
      }

      setDanhMucList(items);
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
      setDanhMucError("Không thể tải danh mục. Vui lòng thử lại.");
      show("Không thể tải danh mục", "error");
    } finally {
      setDanhMucLoading(false);
    }
  }, [danhMucList.length, show]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open && danhMucList.length === 0) loadDanhMuc();
  }, [open, danhMucList.length, loadDanhMuc]);

  // ── Điền form khi chỉnh sửa ──────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      if (editCourse) {
        const existing =
          (editCourse as any).idDanhMucList ??
          (editCourse as any).danhSachDanhMuc?.map((d: any) => d.id) ??
          [];
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm({
          tieuDe: editCourse.tieuDe ?? "",
          moTa: editCourse.moTa ?? "",
          gia: String(editCourse.gia ?? ""),
          giaGoc: String(editCourse.giaGoc ?? ""),
          capDo: editCourse.capDo ?? "Cơ bản",
          idDanhMucList: Array.isArray(existing) ? existing : [],
        });
        setImgPreview(editCourse.hinhAnhKhoaHoc ?? null);
      } else {
        setForm({
          tieuDe: "",
          moTa: "",
          gia: "",
          giaGoc: "",
          capDo: "Cơ bản",
          idDanhMucList: [],
        });
        setImgPreview(null);
      }
      setImgFile(null);
      setErrors({});
    }
  }, [open, editCourse]);

  // ── Xử lý ảnh ──────────────────────────────────────────────────────────────
  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const errMsg = validateImgFile(f);
    if (errMsg) {
      setErrors((p) => ({ ...p, img: errMsg }));
      show(errMsg, "error");
      e.target.value = "";
      return;
    }
    setErrors((p) => ({ ...p, img: undefined }));
    setImgFile(f);
    setImgPreview(URL.createObjectURL(f));
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!form.tieuDe.trim()) return "Vui lòng nhập tiêu đề khóa học";

    // Tạo mới bắt buộc phải có ảnh bìa. Khi sửa, nếu không chọn ảnh mới thì
    // giữ ảnh cũ (imgPreview đã có sẵn từ editCourse).
    if (!editCourse && !imgFile) return "Vui lòng chọn ảnh bìa khóa học";
    if (imgFile) {
      const imgErr = validateImgFile(imgFile);
      if (imgErr) return imgErr;
    }

    if (form.idDanhMucList.length === 0)
      return "Vui lòng chọn ít nhất một danh mục";

    const gia = Number(form.gia || 0);
    const giaGoc = Number(form.giaGoc || 0);

    if (!form.giaGoc || giaGoc <= 0) return "Vui lòng nhập giá gốc";
    if (Number.isNaN(gia) || gia < 0) return "Giá không được âm";
    if (Number.isNaN(giaGoc) || giaGoc < 0) return "Giá gốc không được âm";
    if (gia >= MAX_GIA)
      return `Giá phải nhỏ hơn ${MAX_GIA.toLocaleString("vi-VN")}đ`;
    if (giaGoc >= MAX_GIA)
      return `Giá gốc phải nhỏ hơn ${MAX_GIA.toLocaleString("vi-VN")}đ`;
    if (gia > giaGoc) return "Giá bán không được lớn hơn giá gốc";

    return null;
  };

  // ── Lưu ──────────────────────────────────────────────────
  const handleSave = async () => {
    const err = validate();
    if (err) {
      show(err, "error");
      const lower = err.toLowerCase();
      setErrors((p) => ({
        ...p,
        img: lower.includes("ảnh") ? err : p.img,
        gia: lower.includes("giá") ? err : p.gia,
        danhMuc: lower.includes("danh mục") ? err : p.danhMuc,
      }));
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("TieuDe", form.tieuDe.trim());
      fd.append("MoTa", form.moTa || "");
      fd.append("Gia", form.gia || "0");
      fd.append("GiaGoc", form.giaGoc || "0");
      fd.append("CapDo", form.capDo);

      form.idDanhMucList.forEach((id) => {
        fd.append("DanhSachDanhMuc", id);
      });

      if (imgFile) fd.append("Img", imgFile);

      const result: any = editCourse
        ? await (() => {
            const targetId = editCourse.idBanGhiTruoc ?? editCourse.id;
            fd.append("IdKhoaHoc", targetId!);
            return khoaHocSvc.UpdateKhoaHoc(fd as any);
          })()
        : await khoaHocSvc.CreateKhoaHoc(fd as any);

      const { ok, errorMsg } = resolveApiResult(result);
      if (!ok) {
        show(errorMsg ?? "Lỗi khi lưu khóa học", "error");
        return;
      }
      show(editCourse ? "Đã cập nhật khóa học" : "Đã tạo khóa học mới");
      onSaved();
      onClose();
    } catch (error: any) {
      console.error("Lỗi lưu khóa học:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi khi lưu khóa học";
      show(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            borderRadius: "20px",
            width: { xs: "calc(100% - 24px)", sm: 680, md: 700 },
            maxWidth: 720,
            maxHeight: "90vh",
            boxShadow:
              "0 25px 60px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.04)",
            m: { xs: 1.5, sm: 2 },
          },
        },
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          px: { xs: 2.5, sm: 4 },
          pt: { xs: 2.5, sm: 3.5 },
          pb: 0,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 20, sm: 23 },
              fontWeight: 700,
              color: R,
              fontFamily: '"Be Vietnam Pro", sans-serif',
              lineHeight: 1.3,
            }}
          >
            {editCourse ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              color: "#6B7280",
              mt: 0.5,
            }}
          >
            {editCourse
              ? "Cập nhật thông tin khóa học của bạn."
              : "Nhập thông tin cơ bản để bắt đầu xây dựng khóa học."}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            mt: 0.5,
            color: "#9CA3AF",
            "&:hover": { color: "#1F2937", bgcolor: "rgba(0,0,0,0.04)" },
          }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <DialogContent
        sx={{
          px: { xs: 2.5, sm: 4 },
          pt: 2.5,
          pb: 1,
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(141, 19, 19, 0.12)",
            borderRadius: 10,
          },
        }}
      >
        <Stack spacing={2.5}>
          {/* ── Ảnh bìa ────────────────────────────────────────────────── */}
          <Box>
            <Typography sx={labelSx}>Ảnh bìa khóa học</Typography>
            <input
              ref={imgRef}
              type="file"
              accept={IMG_ACCEPT}
              style={{ display: "none" }}
              onChange={handleImg}
            />
            <Box
              onClick={() => imgRef.current?.click()}
              sx={{
                height: imgPreview ? "auto" : { xs: 130, sm: 150 },
                border: `1.5px dashed ${errors.img ? "#DC2626" : alpha(R, 0.25)}`,
                borderRadius: "12px",
                cursor: "pointer",
                bgcolor: errors.img
                  ? "rgba(220, 38, 38, 0.02)"
                  : "rgba(141, 19, 19, 0.015)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                overflow: "hidden",
                "&:hover": {
                  bgcolor: alpha(R, 0.04),
                  borderColor: R,
                },
              }}
            >
              {imgPreview ? (
                <Box
                  component="img"
                  src={imgPreview}
                  alt="preview"
                  sx={{
                    width: "100%",
                    maxHeight: 180,
                    objectFit: "cover",
                  }}
                />
              ) : (
                <>
                  <CloudUploadIcon sx={{ color: alpha(R, 0.4), mb: 0.5 }} />
                  <Typography sx={{ fontSize: 13, color: "#888" }}>
                    Nhấn để chọn ảnh bìa * ({ALLOWED_IMG_EXT.join(", ")}, tối đa{" "}
                    {MAX_IMG_MB}MB)
                  </Typography>
                </>
              )}
            </Box>
            {errors.img && (
              <Typography
                sx={{
                  fontSize: 12.5,
                  color: "#DC2626",
                  mt: 0.75,
                  fontWeight: 500,
                }}
              >
                {errors.img}
              </Typography>
            )}
          </Box>
          {/* ── Tiêu đề ────────────────────────────────────────────────── */}
          <Box>
            <Typography sx={labelSx}>Tiêu đề khóa học *</Typography>
            <TextField
              fullWidth
              placeholder="Nhập tiêu đề khóa học"
              value={form.tieuDe}
              onChange={(e) =>
                setForm((p) => ({ ...p, tieuDe: e.target.value }))
              }
              sx={fieldSx}
            />
          </Box>

          {/* ── Mô tả - RichTextEditor ─────────────────────────────────── */}
          <RichTextEditor
            value={form.moTa}
            onChange={(value) => setForm((p) => ({ ...p, moTa: value }))}
            placeholder="Mô tả chi tiết về khóa học..."
            height={250}
            label="Mô tả khóa học"
          />

          {/* ── Danh mục ────────────────────────────────────────────────── */}
          <Box>
            <Typography sx={labelSx}>Danh mục *</Typography>
            <TextField
              select
              fullWidth
              error={!!errors.danhMuc}
              value={form.idDanhMucList}
              onChange={(e) => {
                const val = e.target.value;
                const ids =
                  typeof val === "string" ? val.split(",") : (val as string[]);
                setForm((p) => ({ ...p, idDanhMucList: ids }));
                setErrors((p) => ({
                  ...p,
                  danhMuc:
                    ids.length === 0
                      ? "Vui lòng chọn ít nhất một danh mục"
                      : undefined,
                }));
              }}
              sx={fieldSx}
              slotProps={{
                select: {
                  multiple: true,
                  displayEmpty: true,
                  MenuProps: {
                    slotProps: {
                      paper: {
                        sx: {
                          maxHeight: 320,
                          borderRadius: "10px",
                          mt: 0.5,
                          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                        },
                      },
                    },
                  },
                  renderValue: (selected) => {
                    const ids = selected as string[];
                    if (!ids.length) {
                      return (
                        <Typography sx={{ color: "#9CA3AF", fontSize: 14 }}>
                          Chọn danh mục khóa học
                        </Typography>
                      );
                    }
                    return (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {ids.map((id) => {
                          const dm = danhMucList.find((d) => d.id === id);
                          return (
                            <Chip
                              key={id}
                              label={dm?.tenDanhMuc ?? id}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                bgcolor: alpha(R, 0.08),
                                color: R,
                                border: `1px solid ${alpha(R, 0.12)}`,
                              }}
                            />
                          );
                        })}
                      </Box>
                    );
                  },
                },
                input: {
                  endAdornment: danhMucLoading ? (
                    <InputAdornment position="end" sx={{ mr: 2 }}>
                      <CircularProgress size={14} sx={{ color: R }} />
                    </InputAdornment>
                  ) : danhMucError ? (
                    <InputAdornment position="end" sx={{ mr: 2 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#DC2626",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                        onClick={loadDanhMuc}
                      >
                        Tải lại
                      </Typography>
                    </InputAdornment>
                  ) : undefined,
                },
              }}
            >
              {danhMucLoading ? (
                <MenuItem disabled value="__loading__">
                  <CircularProgress size={20} sx={{ color: R }} />
                  <Box component="span" sx={{ ml: 1 }}>
                    Đang tải...
                  </Box>
                </MenuItem>
              ) : danhMucList.length === 0 ? (
                <MenuItem disabled value="__empty__">
                  {danhMucError || "Không có danh mục nào"}
                </MenuItem>
              ) : (
                danhMucList.map((dm) => (
                  <MenuItem key={dm.id} value={dm.id}>
                    {dm.tenDanhMuc}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Box>

          {/* ── Giá bán, Giá gốc, Cấp độ ────────────────────────────────── */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4.2 }}>
              <Box>
                <Typography sx={labelSx}>Giá bán (VNĐ)</Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="0"
                  value={form.gia}
                  error={!!errors.gia}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((p) => ({ ...p, gia: v }));
                    const giaNum = Number(v || 0);
                    const giaGocNum = Number(form.giaGoc || 0);
                    if (giaNum < 0) {
                      setErrors((p) => ({ ...p, gia: "Giá không được âm" }));
                    } else if (giaNum >= MAX_GIA) {
                      setErrors((p) => ({
                        ...p,
                        gia: `Giá phải nhỏ hơn ${MAX_GIA.toLocaleString("vi-VN")}đ`,
                      }));
                    } else if (giaGocNum > 0 && giaNum > giaGocNum) {
                      setErrors((p) => ({
                        ...p,
                        gia: "Giá bán không được lớn hơn giá gốc",
                      }));
                    } else {
                      setErrors((p) => ({ ...p, gia: undefined }));
                    }
                  }}
                  sx={fieldSx}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: "#6B7280",
                              fontSize: 14,
                            }}
                          >
                            ₫
                          </Typography>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                {errors.gia && (
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      color: "#DC2626",
                      mt: 0.5,
                      fontWeight: 500,
                    }}
                  >
                    {errors.gia}
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4.2 }}>
              <Box>
                <Typography sx={labelSx}>Giá gốc</Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="0"
                  value={form.giaGoc}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((p) => ({ ...p, giaGoc: v }));
                    const giaNum = Number(form.gia || 0);
                    const giaGocNum = Number(v || 0);
                    if (giaGocNum < 0) {
                      setErrors((p) => ({
                        ...p,
                        gia: "Giá gốc không được âm",
                      }));
                    } else if (giaGocNum >= MAX_GIA) {
                      setErrors((p) => ({
                        ...p,
                        gia: `Giá gốc phải nhỏ hơn ${MAX_GIA.toLocaleString("vi-VN")}đ`,
                      }));
                    } else if (giaGocNum > 0 && giaNum > giaGocNum) {
                      setErrors((p) => ({
                        ...p,
                        gia: "Giá bán không được lớn hơn giá gốc",
                      }));
                    } else {
                      setErrors((p) => ({ ...p, gia: undefined }));
                    }
                  }}
                  sx={fieldSx}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: "#6B7280",
                              fontSize: 14,
                            }}
                          >
                            ₫
                          </Typography>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 3.6 }}>
              <Box>
                <Typography sx={labelSx}>Cấp độ</Typography>
                <TextField
                  select
                  fullWidth
                  value={form.capDo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, capDo: e.target.value }))
                  }
                  sx={fieldSx}
                >
                  {["Cơ bản", "Trung cấp", "Nâng cao"].map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.5,
          px: { xs: 2.5, sm: 4 },
          pt: 2.5,
          pb: { xs: 2.5, sm: 3.5 },
        }}
      >
        <OutlineBtn
          onClick={onClose}
          sx={{
            height: 44,
            px: 3,
            borderRadius: "10px",
            fontSize: 14,
          }}
        >
          Hủy
        </OutlineBtn>
        <RedBtn
          onClick={handleSave}
          disabled={
            !form.tieuDe.trim() ||
            saving ||
            !!errors.gia ||
            !!errors.img ||
            !!errors.danhMuc ||
            (!editCourse && !imgFile) ||
            form.idDanhMucList.length === 0 ||
            !form.giaGoc ||
            Number(form.giaGoc) <= 0
          }
          sx={{
            height: 44,
            px: 3,
            borderRadius: "10px",
            fontSize: 14,
            "&.Mui-disabled": {
              bgcolor: alpha(R, 0.35),
              color: "rgba(255, 255, 255, 0.75)",
            },
          }}
        >
          {saving ? (
            <CircularProgress size={18} sx={{ color: "#fff" }} />
          ) : editCourse ? (
            "Cập nhật"
          ) : (
            "Tạo khóa học"
          )}
        </RedBtn>
      </Box>
      {ToastComponent}
    </Dialog>
  );
}
