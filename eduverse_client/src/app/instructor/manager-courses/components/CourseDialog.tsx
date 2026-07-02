/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/instructor/manager-courses/components/CourseDialog.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Box,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  InputAdornment,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CategoryIcon from "@mui/icons-material/Category";

import KhoaHocService from "@/src/services/KhoaHocService";
import { danhMucService } from "@/src/services/danhmucService";
import { KhoaHocType, DanhMucDto, CourseForm } from "../types";
import { R, RedBtn, OutlineBtn, UploadZone } from "../types/constants";
import { useToast } from "./useToast";

const khoaHocSvc = new KhoaHocService();

const MAX_IMG_MB = 10;
const MAX_GIA = 100_000_000;

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
  const [errors, setErrors] = useState<{ img?: string; gia?: string }>({});

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
    const sizeMb = f.size / (1024 * 1024);
    if (sizeMb > MAX_IMG_MB) {
      setErrors((p) => ({
        ...p,
        img: `Ảnh vượt quá ${MAX_IMG_MB}MB (hiện tại ${sizeMb.toFixed(1)}MB)`,
      }));
      show(`Ảnh không được vượt quá ${MAX_IMG_MB}MB`, "error");
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

    const gia = Number(form.gia || 0);
    const giaGoc = Number(form.giaGoc || 0);

    if (Number.isNaN(gia) || gia < 0) return "Giá không được âm";
    if (Number.isNaN(giaGoc) || giaGoc < 0) return "Giá gốc không được âm";
    if (gia >= MAX_GIA)
      return `Giá phải nhỏ hơn ${MAX_GIA.toLocaleString("vi-VN")}đ`;
    if (giaGoc >= MAX_GIA)
      return `Giá gốc phải nhỏ hơn ${MAX_GIA.toLocaleString("vi-VN")}đ`;
    if (giaGoc > 0 && gia > giaGoc) return "Giá bán không được lớn hơn giá gốc";

    if (imgFile && imgFile.size / (1024 * 1024) > MAX_IMG_MB) {
      return `Ảnh không được vượt quá ${MAX_IMG_MB}MB`;
    }

    return null;
  };

  // ── Lưu (bỏ tự động chuyển trạng thái) ──────────────────────────────────
  const handleSave = async () => {
    const err = validate();
    if (err) {
      show(err, "error");
      if (err.toLowerCase().includes("ảnh"))
        setErrors((p) => ({ ...p, img: err }));
      if (err.toLowerCase().includes("giá"))
        setErrors((p) => ({ ...p, gia: err }));
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("TieuDe", form.tieuDe.trim());
      fd.append("MoTa", form.moTa.trim());
      fd.append("Gia", form.gia || "0");
      fd.append("GiaGoc", form.giaGoc || "0");
      fd.append("CapDo", form.capDo);

      if (form.idDanhMucList.length > 0) {
        form.idDanhMucList.forEach((id) => {
          fd.append("DanhSachDanhMuc", id);
        });
      }

      if (imgFile) fd.append("Img", imgFile);

      if (editCourse) {
        const targetId = editCourse.idBanGhiTruoc ?? editCourse.id;
        fd.append("IdKhoaHoc", targetId!);
        await khoaHocSvc.UpdateKhoaHoc(fd as any);
        show("Đã cập nhật khóa học");
      } else {
        await khoaHocSvc.CreateKhoaHoc(fd as any);
        show("Đã tạo khóa học mới");
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error("Lỗi lưu khóa học:", error);
      show("Lỗi khi lưu khóa học", "error");
    } finally {
      setSaving(false);
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: R },
    "& label.Mui-focused": { color: R },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: 17, color: R }}>
        {editCourse ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {/* Ảnh bìa */}
          <Box>
            <input
              ref={imgRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImg}
            />
            <UploadZone onClick={() => imgRef.current?.click()}>
              {imgPreview ? (
                <Box
                  component="img"
                  src={imgPreview}
                  alt="preview"
                  sx={{
                    maxHeight: 120,
                    maxWidth: "100%",
                    borderRadius: 1,
                    objectFit: "cover",
                  }}
                />
              ) : (
                <>
                  <CloudUploadIcon sx={{ color: alpha(R, 0.4), mb: 0.5 }} />
                  <Typography sx={{ fontSize: 13, color: "#888" }}>
                    Nhấn để chọn ảnh bìa (tối đa {MAX_IMG_MB}MB)
                  </Typography>
                </>
              )}
            </UploadZone>
            {errors.img && (
              <Typography sx={{ fontSize: 11.5, color: "#d32f2f", mt: 0.5 }}>
                {errors.img}
              </Typography>
            )}
          </Box>

          {/* Tiêu đề */}
          <TextField
            size="small"
            label="Tiêu đề khóa học *"
            fullWidth
            value={form.tieuDe}
            onChange={(e) => setForm((p) => ({ ...p, tieuDe: e.target.value }))}
            sx={inputSx}
          />

          {/* Mô tả */}
          <TextField
            size="small"
            label="Mô tả"
            fullWidth
            multiline
            rows={3}
            value={form.moTa}
            onChange={(e) => setForm((p) => ({ ...p, moTa: e.target.value }))}
            sx={inputSx}
          />

          {/* Danh mục (chọn nhiều) */}
          <TextField
            size="small"
            select
            label="Danh mục"
            fullWidth
            value={form.idDanhMucList}
            onChange={(e) => {
              const val = e.target.value;
              setForm((p) => ({
                ...p,
                idDanhMucList:
                  typeof val === "string" ? val.split(",") : (val as string[]),
              }));
            }}
            sx={inputSx}
            slotProps={{
              select: {
                multiple: true,
                MenuProps: {
                  slotProps: { paper: { style: { maxHeight: 320 } } },
                },
                renderValue: (selected) => {
                  const ids = selected as string[];
                  if (!ids.length) {
                    return (
                      <em style={{ color: "#999", fontSize: "0.85rem" }}>
                        — Chọn danh mục —
                      </em>
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
                              height: 20,
                              fontSize: "0.7rem",
                              bgcolor: alpha(R, 0.08),
                              color: R,
                            }}
                          />
                        );
                      })}
                    </Box>
                  );
                },
              },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <CategoryIcon sx={{ fontSize: 16, color: alpha(R, 0.5) }} />
                  </InputAdornment>
                ),
                endAdornment: danhMucLoading ? (
                  <InputAdornment position="end" sx={{ mr: 2 }}>
                    <CircularProgress size={14} sx={{ color: R }} />
                  </InputAdornment>
                ) : danhMucError ? (
                  <InputAdornment position="end" sx={{ mr: 2 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "#d32f2f", cursor: "pointer" }}
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

          {/* Giá và cấp độ */}
          <Stack direction="row" spacing={1.5}>
            <TextField
              size="small"
              label="Giá (VNĐ)"
              type="number"
              sx={{ flex: 1, ...inputSx }}
              value={form.gia}
              error={!!errors.gia}
              helperText={errors.gia || " "}
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
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">₫</InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              size="small"
              label="Giá gốc"
              type="number"
              sx={{ flex: 1, ...inputSx }}
              value={form.giaGoc}
              onChange={(e) => {
                const v = e.target.value;
                setForm((p) => ({ ...p, giaGoc: v }));
                const giaNum = Number(form.gia || 0);
                const giaGocNum = Number(v || 0);
                if (giaGocNum < 0) {
                  setErrors((p) => ({ ...p, gia: "Giá gốc không được âm" }));
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
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">₫</InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              size="small"
              select
              label="Cấp độ"
              sx={{ minWidth: 120, ...inputSx }}
              value={form.capDo}
              onChange={(e) =>
                setForm((p) => ({ ...p, capDo: e.target.value }))
              }
            >
              {["Cơ bản", "Trung cấp", "Nâng cao"].map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <OutlineBtn onClick={onClose}>Hủy</OutlineBtn>
        <RedBtn
          onClick={handleSave}
          disabled={
            !form.tieuDe.trim() || saving || !!errors.gia || !!errors.img
          }
        >
          {saving ? (
            <CircularProgress size={18} sx={{ color: "#fff" }} />
          ) : editCourse ? (
            "Cập nhật"
          ) : (
            "Tạo khóa học"
          )}
        </RedBtn>
      </DialogActions>
      {ToastComponent}
    </Dialog>
  );
}
