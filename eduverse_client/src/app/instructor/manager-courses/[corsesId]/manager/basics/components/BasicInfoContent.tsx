/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  OutlinedInput,
  Stack,
  InputAdornment,
} from "@mui/material";
import TitleRoundedIcon from "@mui/icons-material/TitleRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import { useState, useRef, useEffect, useMemo } from "react";
import KhoaHocService from "@/src/services/KhoaHocService";
import { DanhMucDto } from "@/src/types/khoaHoc";
import { danhMucService } from "@/src/services/danhmucService";
import RichTextEditor from "../../../../create/context/Richtexteditor";
import AuthGuard from "@/src/components/AuthGuard";
import { MAU } from "../../components/courseEditCore";
import { useCourseEdit } from "../../components/CourseEditContext";

// ===== Ràng buộc =====
const DO_DAI_TIEU_DE_TOI_DA = 99;
const DO_DAI_MO_TA_TOI_THIEU = 200;
const DO_DAI_MO_TA_TOI_DA = 9999;
const DUNG_LUONG_ANH_TOI_DA = 10 * 1024 * 1024;
const DUOI_ANH_HOP_LE = [".jpg", ".jpeg", ".png"];

function boTheHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function layDuoiFile(tenFile: string): string {
  const idx = tenFile.lastIndexOf(".");
  return idx === -1 ? "" : tenFile.slice(idx).toLowerCase();
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ mb: 2, alignItems: "flex-start" }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: `${MAU.chinh}0F`,
          color: MAU.chinh,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#1F2937" }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: 12.5, color: "#8A93A3", mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

export default function BasicInfoContent() {
  const {
    thongTin,
    setThongTin,
    refreshData,
    idKhoaHoc,
    loading,
    isReadOnly,
    trangThai,
  } = useCourseEdit();
  const [loadingSave, setLoadingSave] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [danhMucList, setDanhMucList] = useState<DanhMucDto[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [danhSachDanhMucId, setDanhSachDanhMucId] = useState<string[]>([]);
  const [isBanHienTai, setIsBanHienTai] = useState(false);

  const [loiTieuDe, setLoiTieuDe] = useState<string | null>(null);
  const [loiMoTa, setLoiMoTa] = useState<string | null>(null);
  const [loiHinhAnh, setLoiHinhAnh] = useState<string | null>(null);
  const [loiGia, setLoiGia] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const khoaHocService = useMemo(() => new KhoaHocService(), []);

  // Lấy danh sách danh mục để hiển thị trong dropdown
  useEffect(() => {
    const fetchDanhMuc = async () => {
      try {
        const res = await danhMucService.getList({
          pageIndex: 1,
          pageSize: 100,
        });
        if (res.status !== false && res.data) {
          setDanhMucList(res.data.items || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDanhMuc();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!idKhoaHoc) return;
      try {
        const data = await khoaHocService.GetToUpdateKhoaHoc(idKhoaHoc);
        if (data) {
          if (data.danhSachDanhMuc) {
            setDanhSachDanhMucId(data.danhSachDanhMuc);
          }
          const isBan = (data as any).isBanHienTai;
          if (isBan !== undefined) {
            setIsBanHienTai(isBan);
          }
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách danh mục:", err);
      }
    };
    fetchData();
  }, [idKhoaHoc, khoaHocService]);

  // Validate
  const validateForm = (): boolean => {
    let hopLe = true;

    const tieuDe = thongTin.tieuDe || "";
    if (tieuDe.trim().length === 0) {
      setLoiTieuDe("Vui lòng nhập tiêu đề khóa học");
      hopLe = false;
    } else if (tieuDe.length > DO_DAI_TIEU_DE_TOI_DA) {
      setLoiTieuDe(
        `Tiêu đề không được vượt quá ${DO_DAI_TIEU_DE_TOI_DA} ký tự`,
      );
      hopLe = false;
    } else {
      setLoiTieuDe(null);
    }

    if (thongTin.giaGoc !== undefined && thongTin.giaGoc < 0) {
      setLoiGia("Giá không được nhỏ hơn 0");
      hopLe = false;
    } else if (thongTin.giaGoc !== undefined && thongTin.giaGoc > 100000000) {
      setLoiGia("Giá không được lớn hơn 100,000,000");
      hopLe = false;
    } else {
      setLoiGia(null);
    }

    const doDaiMoTa = boTheHtml(thongTin.moTa || "").length;
    if (doDaiMoTa < DO_DAI_MO_TA_TOI_THIEU) {
      setLoiMoTa(
        `Mô tả phải có ít nhất ${DO_DAI_MO_TA_TOI_THIEU} ký tự (hiện tại: ${doDaiMoTa})`,
      );
      hopLe = false;
    } else if (doDaiMoTa > DO_DAI_MO_TA_TOI_DA) {
      setLoiMoTa(
        `Mô tả không được vượt quá ${DO_DAI_MO_TA_TOI_DA} ký tự (hiện tại: ${doDaiMoTa})`,
      );
      hopLe = false;
    } else {
      setLoiMoTa(null);
    }

    if (imageFile) {
      const duoi = layDuoiFile(imageFile.name);
      if (!DUOI_ANH_HOP_LE.includes(duoi)) {
        setLoiHinhAnh(
          `Định dạng ảnh không hợp lệ. Chỉ chấp nhận: ${DUOI_ANH_HOP_LE.join(", ")}`,
        );
        hopLe = false;
      } else if (imageFile.size > DUNG_LUONG_ANH_TOI_DA) {
        setLoiHinhAnh("Dung lượng ảnh vượt quá 10MB");
        hopLe = false;
      } else {
        setLoiHinhAnh(null);
      }
    } else if (isBanHienTai && !thongTin.hinhAnhKhoaHoc) {
      setLoiHinhAnh("Vui lòng chọn hình ảnh cho khóa học");
      hopLe = false;
    } else {
      setLoiHinhAnh(null);
    }

    return hopLe;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    const file = e.target.files?.[0] || null;
    validateAndSetImage(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isReadOnly) return;
    const file = e.dataTransfer.files?.[0] || null;
    validateAndSetImage(file);
  };

  const validateAndSetImage = (file: File | null) => {
    if (!file) return;
    const duoi = layDuoiFile(file.name);
    if (!DUOI_ANH_HOP_LE.includes(duoi)) {
      setLoiHinhAnh(
        `Định dạng ảnh không hợp lệ. Chỉ chấp nhận: ${DUOI_ANH_HOP_LE.join(", ")}`,
      );
      return;
    }
    if (file.size > DUNG_LUONG_ANH_TOI_DA) {
      setLoiHinhAnh("Dung lượng ảnh vượt quá 10MB");
      return;
    }
    setLoiHinhAnh(null);
    setImageFile(file);
  };

  const handleSave = async () => {
    if (isReadOnly) {
      setError("Không thể chỉnh sửa khi khóa học đang chờ duyệt");
      return;
    }

    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      setError("Vui lòng kiểm tra lại các trường được đánh dấu lỗi");
      return;
    }

    setLoadingSave(true);
    try {
      const payload = new FormData();
      payload.append("idKhoaHoc", idKhoaHoc);
      payload.append("tieuDe", thongTin.tieuDe || "");
      payload.append("moTa", thongTin.moTa || "");
      payload.append("capDo", thongTin.capDo || "");
      payload.append("isBanHienTai", String(isBanHienTai));
      payload.append("giaGoc", String(thongTin.giaGoc ?? 0));
      danhSachDanhMucId.forEach((id) => payload.append("danhSachDanhMuc", id));
      if (imageFile) payload.append("img", imageFile);

      const response = await khoaHocService.UpdateKhoaHoc(payload as any);
      if (response.status === false) {
        setError(response.message || "Cập nhật thất bại");
        return;
      }
      setSuccess("Cập nhật thông tin thành công!");
      await refreshData();
      setImageFile(null);
    } catch (err) {
      console.error(err);
      setError("Đã xảy ra lỗi khi cập nhật");
    } finally {
      setLoadingSave(false);
    }
  };

  const cardSx = {
    p: 3,
    mb: 3,
    bgcolor: "#FFFFFF",
    border: `1px solid #EDEFF3`,
    borderRadius: 3,
    boxShadow: "0 1px 2px rgba(16,24,40,0.02)",
    transition: "box-shadow .2s ease, border-color .2s ease",
    "&:hover": {
      borderColor: MAU.chinh + "40",
      boxShadow: "0 4px 16px rgba(16,24,40,0.05)",
    },
  } as const;

  const selectSx = {
    borderRadius: 2,
    bgcolor: "#FFFFFF",
    "& .MuiSelect-select": {
      color: "#1F2937 !important",
      WebkitTextFillColor: "#1F2937 !important",
    },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E3E6EB" },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: MAU.chinh + "80",
    },
  } as const;

  const tenKhoaHoc = thongTin.tieuDe || "";
  const doDaiMoTaHienTai = boTheHtml(thongTin.moTa || "").length;
  const anhDangHienThi = imageFile
    ? URL.createObjectURL(imageFile)
    : thongTin.hinhAnhKhoaHoc || "";

  return (
    <AuthGuard allowedRoles={["Admin", "GiaoVien"]}>
      <Box sx={{ maxWidth: 900, mx: "auto", pb: 12, bgcolor: "#FBFBFD" }}>
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{ fontWeight: 800, fontSize: 24, color: "#1F2937", mb: 0.5 }}
          >
            Trang đích của khóa học
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: "#8A93A3" }}>
            Đây là những gì học viên sẽ thấy đầu tiên — hãy làm cho nó thật rõ
            ràng và hấp dẫn.
          </Typography>
        </Box>

        {isReadOnly && (
          <Alert
            severity={trangThai === "DaDuyet" ? "success" : "info"}
            sx={{ mb: 2 }}
          >
            {trangThai === "DaDuyet"
              ? "Khóa học đã được duyệt. Bạn không thể chỉnh sửa thông tin."
              : "Khóa học đang trong quá trình duyệt. Bạn không thể chỉnh sửa thông tin trong giai đoạn này."}
          </Alert>
        )}

        {(error || success) && (
          <Box sx={{ mb: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
          </Box>
        )}

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        )}

        {!loading && (
          <>
            {/* Tên khóa học */}
            <Paper elevation={0} sx={cardSx}>
              <SectionHeader
                icon={<TitleRoundedIcon fontSize="small" />}
                title="Tên khóa học"
                subtitle="Tiêu đề nên kết hợp sự thu hút, thông tin rõ ràng và từ khóa dễ tìm kiếm."
              />
              <TextField
                fullWidth
                placeholder="VD: Lập trình React từ cơ bản đến nâng cao"
                value={tenKhoaHoc}
                onChange={(e) => {
                  if (isReadOnly) return;
                  setThongTin({ tieuDe: e.target.value });
                  if (loiTieuDe) setLoiTieuDe(null);
                }}
                error={!!loiTieuDe}
                helperText={loiTieuDe}
                disabled={isReadOnly}
                slotProps={{
                  htmlInput: { maxLength: DO_DAI_TIEU_DE_TOI_DA },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  "& .MuiInputBase-input": { color: "#1F2937" },
                }}
              />
              <Typography
                sx={{
                  fontSize: 12,
                  color: "#8A93A3",
                  mt: 0.75,
                  textAlign: "right",
                }}
              >
                {tenKhoaHoc.length}/{DO_DAI_TIEU_DE_TOI_DA}
              </Typography>
            </Paper>

            {/* Mô tả */}
            <Paper elevation={0} sx={cardSx}>
              <SectionHeader
                icon={<DescriptionRoundedIcon fontSize="small" />}
                title="Mô tả khóa học"
                subtitle="Giải thích khóa học này dạy điều gì và học viên sẽ đạt được gì sau khi hoàn thành."
              />
              <Box
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  border: loiMoTa ? "1px solid #D32F2F" : "1px solid #E3E6EB",
                }}
              >
                {isReadOnly ? (
                  <Box
                    sx={{
                      p: 2,
                      minHeight: 200,
                      bgcolor: "#f9f9f9",
                      borderRadius: 2,
                      "& img": { maxWidth: "100%" },
                      "& *": { maxWidth: "100%" },
                    }}
                    dangerouslySetInnerHTML={{ __html: thongTin.moTa || "" }}
                  />
                ) : (
                  <RichTextEditor
                    key={thongTin.moTa}
                    value={thongTin.moTa || ""}
                    onChange={(html) => {
                      setThongTin({ moTa: html });
                      if (loiMoTa) setLoiMoTa(null);
                    }}
                    placeholder="Nhập mô tả chi tiết về khóa học..."
                    minHeight={200}
                  />
                )}
              </Box>
              <Typography
                sx={{
                  fontSize: 12,
                  color: loiMoTa ? "#D32F2F" : "#8A93A3",
                  mt: 0.75,
                }}
              >
                {loiMoTa
                  ? loiMoTa
                  : `${doDaiMoTaHienTai}/${DO_DAI_MO_TA_TOI_DA} ký tự (tối thiểu ${DO_DAI_MO_TA_TOI_THIEU})`}
              </Typography>
            </Paper>

            {/* Thông tin cơ bản */}
            <Paper elevation={0} sx={cardSx}>
              <SectionHeader
                icon={<TuneRoundedIcon fontSize="small" />}
                title="Thông tin cơ bản"
                subtitle="Giúp học viên biết khóa học phù hợp với trình độ và chủ đề nào."
              />
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <FormControl fullWidth disabled={isReadOnly}>
                    <InputLabel>Cấp độ</InputLabel>
                    <Select
                      value={thongTin.capDo || ""}
                      onChange={(e) => setThongTin({ capDo: e.target.value })}
                      label="Cấp độ"
                      sx={selectSx}
                      MenuProps={{
                        slotProps: {
                          paper: {
                            sx: {
                              bgcolor: "#FFFFFF",
                              "& .MuiMenuItem-root": { color: "#1F2937" },
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem value="Cơ bản">Cơ bản</MenuItem>
                      <MenuItem value="Trung cấp">Trung cấp</MenuItem>
                      <MenuItem value="Nâng cao">Nâng cao</MenuItem>
                      <MenuItem value="Tất cả cấp độ">Tất cả cấp độ</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <FormControl fullWidth disabled={isReadOnly}>
                    <InputLabel>Danh mục</InputLabel>
                    <Select
                      multiple
                      value={danhSachDanhMucId}
                      onChange={(e) => {
                        const value = e.target.value;
                        setDanhSachDanhMucId(
                          typeof value === "string" ? value.split(",") : value,
                        );
                      }}
                      input={<OutlinedInput label="Danh mục" />}
                      sx={selectSx}
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {(selected as string[]).map((id) => {
                            const cat = danhMucList.find((c) => c.id === id);
                            return (
                              <Chip
                                key={id}
                                label={cat?.tenDanhMuc || id}
                                size="small"
                                sx={{
                                  bgcolor: `${MAU.chinh}0F`,
                                  color: MAU.chinh,
                                  fontWeight: 600,
                                }}
                              />
                            );
                          })}
                        </Box>
                      )}
                      label="Danh mục"
                    >
                      {danhMucList.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.tenDanhMuc}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
            </Paper>

            {/* Giá khóa học */}
            <Paper elevation={0} sx={cardSx}>
              <SectionHeader
                icon={<AttachMoneyRoundedIcon fontSize="small" />}
                title="Giá khóa học"
                subtitle="Nhập mức giá cho khóa học (VNĐ). Để trống nếu muốn miễn phí."
              />
              <TextField
                fullWidth
                type="text"
                inputMode="numeric"
                placeholder="VD: 500.000"
                value={thongTin.giaGoc !== undefined ? thongTin.giaGoc : ""}
                onChange={(e) => {
                  if (isReadOnly) return;
                  const raw = e.target.value.replace(/\D/g, "");
                  const val = raw === "" ? undefined : Number(raw);
                  setThongTin({ giaGoc: val });
                  if (loiGia) setLoiGia(null);
                }}
                error={!!loiGia}
                helperText={loiGia}
                disabled={isReadOnly}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">₫</InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  "& .MuiInputBase-input": { color: "#1F2937" },
                }}
              />
              <Typography sx={{ fontSize: 12, color: "#8A93A3", mt: 0.75 }}>
                Giá trị lưu là số nguyên (VNĐ), dấu chấm chỉ để hiển thị.
              </Typography>
            </Paper>

            {/* Hình ảnh */}
            <Paper elevation={0} sx={cardSx}>
              <SectionHeader
                icon={<ImageRoundedIcon fontSize="small" />}
                title="Hình ảnh khóa học"
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                <Box
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  sx={{
                    position: "relative",
                    flexShrink: 0,
                    width: { xs: "100%", sm: 260 },
                    height: 170,
                    borderRadius: 2,
                    border: isDragging
                      ? `2px dashed ${MAU.chinh}`
                      : loiHinhAnh
                        ? "2px dashed #D32F2F"
                        : "2px dashed #E3E6EB",
                    bgcolor: isDragging ? `${MAU.chinh}0A` : "#FBFBFC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    transition: "all .15s ease",
                  }}
                >
                  {anhDangHienThi ? (
                    <>
                      <Avatar
                        src={anhDangHienThi}
                        sx={{ width: "100%", height: "100%", borderRadius: 0 }}
                        variant="square"
                      />
                      {!isReadOnly && (
                        <IconButton
                          size="small"
                          onClick={() => {
                            setImageFile(null);
                            setLoiHinhAnh(null);
                            setThongTin({ hinhAnhKhoaHoc: undefined });
                          }}
                          sx={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                            bgcolor: "rgba(255,255,255,0.92)",
                            boxShadow: 1,
                            width: 26,
                            height: 26,
                            "&:hover": { bgcolor: "#fff" },
                          }}
                        >
                          <CloseRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      )}
                    </>
                  ) : (
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: `${MAU.chinh}0F`,
                        color: MAU.chinh,
                      }}
                    >
                      <CloudUploadRoundedIcon />
                    </Box>
                  )}
                </Box>

                <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 13.5, color: "#8A93A3", mb: 2 }}>
                    Tải ảnh khóa học của bạn lên đây. Định dạng chấp nhận:{" "}
                    {DUOI_ANH_HOP_LE.join(", ")}. Dung lượng tối đa 10MB. Kích
                    thước chuẩn 750x422px.
                  </Typography>

                  {loiHinhAnh && (
                    <Typography
                      sx={{ fontSize: 12.5, color: "#D32F2F", mb: 1 }}
                    >
                      {loiHinhAnh}
                    </Typography>
                  )}

                  <Stack direction="row" spacing={1.5} sx={{ mt: "auto" }}>
                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        px: 1.5,
                        borderRadius: 2,
                        border: "1px solid #E3E6EB",
                        bgcolor: "#FBFBFC",
                        color: "#8A93A3",
                        fontSize: 13.5,
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        noWrap
                        sx={{ fontSize: 13.5, color: "#8A93A3" }}
                      >
                        {imageFile
                          ? imageFile.name
                          : "Chưa có tệp nào được chọn"}
                      </Typography>
                    </Box>

                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      hidden
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      disabled={isReadOnly}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isReadOnly}
                      sx={{
                        flexShrink: 0,
                        textTransform: "none",
                        borderRadius: 2,
                        borderColor: MAU.chinh,
                        color: MAU.chinh,
                        fontWeight: 600,
                        "&:hover": {
                          borderColor: MAU.chinhDam,
                          bgcolor: `${MAU.chinh}0A`,
                        },
                      }}
                    >
                      Tải lên tệp
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            {/* Thanh lưu */}
            <Box
              sx={{
                position: "sticky",
                bottom: 0,
                left: 0,
                right: 0,
                mt: 2,
                py: 2,
                bgcolor: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(6px)",
                borderTop: "1px solid #E3E6EB",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={loadingSave || loading || isReadOnly}
                sx={{
                  bgcolor: isReadOnly ? "#9AA2B1" : MAU.chinh,
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 4,
                  py: 1,
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: isReadOnly ? "#9AA2B1" : MAU.chinhDam,
                    boxShadow: "none",
                  },
                }}
              >
                {loadingSave ? (
                  <CircularProgress size={22} color="inherit" />
                ) : isReadOnly ? (
                  "Đang chờ duyệt"
                ) : (
                  "Lưu thay đổi"
                )}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </AuthGuard>
  );
}
