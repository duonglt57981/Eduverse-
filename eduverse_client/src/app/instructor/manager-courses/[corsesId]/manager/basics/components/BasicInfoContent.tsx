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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import TitleRoundedIcon from "@mui/icons-material/TitleRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import CropIcon from "@mui/icons-material/Crop";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useState, useRef, useEffect, useMemo } from "react";
import KhoaHocService from "@/src/services/KhoaHocService";
import { DanhMucDto } from "@/src/types/khoaHoc";
import { danhMucService } from "@/src/services/danhmucService";
import RichTextEditor from "../../../../create/context/Richtexteditor";
import AuthGuard from "@/src/components/AuthGuard";
import { MAU } from "../../components/courseEditCore";
import { useCourseEdit } from "../../components/CourseEditContext";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// ===== Ràng buộc (theo chuẩn Udemy) =====
const DO_DAI_TIEU_DE_TOI_THIEU = 3; // Tối thiểu 3 ký tự (không tính dấu cách)
const DO_DAI_TIEU_DE_TOI_DA = 99; // Tối đa 99 ký tự (không tính dấu cách)
const DO_DAI_MO_TA_TOI_THIEU = 200;
const DO_DAI_MO_TA_TOI_DA = 9999;
const DUNG_LUONG_ANH_TOI_DA = 10 * 1024 * 1024; // 10MB
const DUOI_ANH_HOP_LE = [".jpg", ".jpeg", ".png"];
const DO_PHAN_GIAI_TOI_THIEU_WIDTH = 1280; // 720p width
const DO_PHAN_GIAI_TOI_THIEU_HEIGHT = 720; // 720p height
const TY_LE_ANH = 16 / 9; // Udemy standard

/**
 * Đếm số ký tự thực tế trong văn bản, KHÔNG tính dấu cách/khoảng trắng.
 * Dùng cho các điều kiện TỐI THIỂU và TỐI ĐA của tiêu đề.
 */
function demSoKyTuKhongTinhDauCach(text: string): number {
  if (!text || typeof text !== "string") return 0;
  // Loại bỏ toàn bộ khoảng trắng (đầu, cuối, giữa các từ)
  return text.replace(/\s+/g, "").length;
}

/**
 * Kiểm tra xem chuỗi có chỉ chứa khoảng trắng hay không
 */
function isOnlySpaces(text: string): boolean {
  if (!text || typeof text !== "string") return true;
  return text.trim().length === 0;
}

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

// Hàm cắt ảnh - giữ nguyên độ phân giải gốc.
function cropImage(
  imageSrc: string,
  crop: PixelCrop,
  scaleX: number,
  scaleY: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;
    image.onload = () => {
      const cropWidth = Math.round(crop.width * scaleX);
      const cropHeight = Math.round(crop.height * scaleY);

      const canvas = document.createElement("canvas");
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Không thể tạo canvas context"));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight,
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Không thể tạo blob từ canvas"));
          }
        },
        "image/jpeg",
        1.0,
      );
    };
    image.onerror = () => {
      reject(new Error("Không thể tải ảnh để cắt"));
    };
  });
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

// Component crop ảnh theo chuẩn Udemy
function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
}: {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState<Crop>(() => {
    return {
      unit: "%",
      width: 90,
      height: (90 * 9) / 16,
      x: 5,
      y: 5,
    };
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [loading, setLoading] = useState(false);
  const [displayScale, setDisplayScale] = useState<{
    scaleX: number;
    scaleY: number;
  } | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = () => {
    const imgEl = imgRef.current;
    if (!imgEl || !imgEl.naturalWidth || !imgEl.width) return;
    setDisplayScale({
      scaleX: imgEl.naturalWidth / imgEl.width,
      scaleY: imgEl.naturalHeight / imgEl.height,
    });
  };

  const handleCropComplete = (crop: PixelCrop) => {
    setCompletedCrop(crop);
  };

  const handleSave = async () => {
    if (!completedCrop) {
      alert("Vui lòng chọn vùng cắt ảnh");
      return;
    }

    const imgEl = imgRef.current;
    const scaleX =
      imgEl && imgEl.width
        ? imgEl.naturalWidth / imgEl.width
        : displayScale?.scaleX;
    const scaleY =
      imgEl && imgEl.height
        ? imgEl.naturalHeight / imgEl.height
        : displayScale?.scaleY;

    if (!scaleX || !scaleY) {
      alert("Không thể xác định kích thước ảnh, vui lòng thử lại");
      return;
    }

    const cropWidth = Math.round(completedCrop.width * scaleX);
    const cropHeight = Math.round(completedCrop.height * scaleY);

    if (
      cropWidth < DO_PHAN_GIAI_TOI_THIEU_WIDTH ||
      cropHeight < DO_PHAN_GIAI_TOI_THIEU_HEIGHT
    ) {
      alert(
        `Kích thước sau khi cắt tối thiểu phải là ${DO_PHAN_GIAI_TOI_THIEU_WIDTH}x${DO_PHAN_GIAI_TOI_THIEU_HEIGHT}. Hiện tại: ${cropWidth}x${cropHeight}`,
      );
      return;
    }

    setLoading(true);
    try {
      const croppedBlob = await cropImage(
        imageSrc,
        completedCrop,
        scaleX,
        scaleY,
      );

      if (croppedBlob.size > DUNG_LUONG_ANH_TOI_DA) {
        alert(
          `Dung lượng ảnh sau khi cắt (${(croppedBlob.size / (1024 * 1024)).toFixed(2)}MB) vượt quá ${DUNG_LUONG_ANH_TOI_DA / (1024 * 1024)}MB`,
        );
        setLoading(false);
        return;
      }

      onCropComplete(croppedBlob);
    } catch (error: any) {
      alert(error.message || "Lỗi khi cắt ảnh");
    } finally {
      setLoading(false);
    }
  };

  const cropSizeText =
    completedCrop && displayScale
      ? `${Math.round(completedCrop.width * displayScale.scaleX)}×${Math.round(
          completedCrop.height * displayScale.scaleY,
        )}px`
      : null;

  return (
    <Dialog
      open={true}
      onClose={onCancel}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          color: MAU.chuDen,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #EDEFF3",
          py: 1.5,
          px: 2.5,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
          Cắt ảnh (tỷ lệ 16:9)
        </Typography>
        <IconButton onClick={onCancel} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2.5 }}>
        <Box
          sx={{
            maxWidth: "100%",
            maxHeight: "60vh",
            overflow: "auto",
            borderRadius: "8px",
            bgcolor: "#FAFAFA",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={handleCropComplete}
            aspect={TY_LE_ANH}
            minWidth={DO_PHAN_GIAI_TOI_THIEU_WIDTH}
            minHeight={DO_PHAN_GIAI_TOI_THIEU_HEIGHT}
            keepSelection
            ruleOfThirds
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Ảnh cần cắt"
              style={{
                maxWidth: "100%",
                maxHeight: "60vh",
                display: "block",
              }}
              onLoad={handleImageLoad}
            />
          </ReactCrop>
        </Box>

        {cropSizeText && (
          <Typography
            sx={{
              mt: 1.5,
              textAlign: "center",
              fontSize: 12.5,
              color: "#8A93A3",
            }}
          >
            Kích thước sau khi cắt:{" "}
            <span style={{ color: MAU.chinh, fontWeight: 600 }}>
              {cropSizeText}
            </span>
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3, gap: 1 }}>
        <Button
          onClick={onCancel}
          sx={{
            textTransform: "none",
            color: "#8A93A3",
            fontWeight: 600,
            "&:hover": {
              bgcolor: "#F5F6F8",
            },
          }}
        >
          Hủy bỏ
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          sx={{
            bgcolor: MAU.chinh,
            textTransform: "none",
            fontWeight: 700,
            px: 4,
            "&:hover": {
              bgcolor: MAU.chinhDam,
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "#fff" }} />
          ) : (
            "Lưu ảnh đã cắt"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function BasicInfoContent() {
  const { thongTin, setThongTin, refreshData, idKhoaHoc, loading, trangThai } =
    useCourseEdit();
  const [loadingSave, setLoadingSave] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [danhMucList, setDanhMucList] = useState<DanhMucDto[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [danhSachDanhMucId, setDanhSachDanhMucId] = useState<string[]>([]);
  const [isBanHienTai, setIsBanHienTai] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [timKiemDanhMuc, setTimKiemDanhMuc] = useState("");

  const [loiTieuDe, setLoiTieuDe] = useState<string | null>(null);
  const [loiMoTa, setLoiMoTa] = useState<string | null>(null);
  const [loiHinhAnh, setLoiHinhAnh] = useState<string | null>(null);
  const [loiGia, setLoiGia] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const oTimKiemDanhMucRef = useRef<HTMLInputElement>(null);

  const khoaHocService = useMemo(() => new KhoaHocService(), []);

  // Kiểm tra có thể chỉnh sửa hay không (chỉ DangSua mới cho sửa)
  const isEditable = trangThai === "DangSua";

  // Danh mục sau khi lọc theo từ khóa tìm kiếm
  const danhMucDaLoc = useMemo(() => {
    const tuKhoa = timKiemDanhMuc.trim().toLowerCase();
    if (!tuKhoa) return danhMucList;
    return danhMucList.filter((cat) =>
      (cat.tenDanhMuc || "").toLowerCase().includes(tuKhoa),
    );
  }, [danhMucList, timKiemDanhMuc]);

  // Lấy danh sách danh mục
  useEffect(() => {
    const fetchDanhMuc = async () => {
      try {
        const res = await danhMucService.getList({
          pageIndex: 1,
          pageSize: 100,
          trangThai: "HoatDong",
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

  // Validate form
  const validateForm = (): boolean => {
    let hopLe = true;

    // Validate tiêu đề
    const tieuDe = thongTin.tieuDe || "";
    const soKyTuTieuDe = demSoKyTuKhongTinhDauCach(tieuDe);

    // Kiểm tra trống hoặc chỉ có khoảng trắng
    if (isOnlySpaces(tieuDe)) {
      setLoiTieuDe("Vui lòng nhập tiêu đề khóa học");
      hopLe = false;
    } else if (soKyTuTieuDe < DO_DAI_TIEU_DE_TOI_THIEU) {
      setLoiTieuDe(
        `Tiêu đề cần tối thiểu ${DO_DAI_TIEU_DE_TOI_THIEU} ký tự (không tính dấu cách). Hiện tại: ${soKyTuTieuDe} ký tự.`,
      );
      hopLe = false;
    } else if (soKyTuTieuDe > DO_DAI_TIEU_DE_TOI_DA) {
      setLoiTieuDe(
        `Tiêu đề không được vượt quá ${DO_DAI_TIEU_DE_TOI_DA} ký tự (không tính dấu cách). Hiện tại: ${soKyTuTieuDe} ký tự.`,
      );
      hopLe = false;
    } else {
      setLoiTieuDe(null);
    }

    // Validate giá
    if (thongTin.giaGoc !== undefined && thongTin.giaGoc < 0) {
      setLoiGia("Giá không được nhỏ hơn 0");
      hopLe = false;
    } else if (thongTin.giaGoc !== undefined && thongTin.giaGoc > 100000000) {
      setLoiGia("Giá không được lớn hơn 100,000,000");
      hopLe = false;
    } else {
      setLoiGia(null);
    }

    // Validate mô tả
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

    // Validate hình ảnh
    if (imageFile) {
      const duoi = layDuoiFile(imageFile.name);
      if (!DUOI_ANH_HOP_LE.includes(duoi)) {
        setLoiHinhAnh(
          `Định dạng ảnh không hợp lệ. Chỉ chấp nhận: ${DUOI_ANH_HOP_LE.join(", ")}`,
        );
        hopLe = false;
      } else if (imageFile.size > DUNG_LUONG_ANH_TOI_DA) {
        setLoiHinhAnh(
          `Dung lượng ảnh vượt quá ${DUNG_LUONG_ANH_TOI_DA / (1024 * 1024)}MB`,
        );
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditable) return;
    const file = e.target.files?.[0] || null;
    if (file) {
      const duoi = layDuoiFile(file.name);
      if (!DUOI_ANH_HOP_LE.includes(duoi)) {
        setLoiHinhAnh(
          `Định dạng ảnh không hợp lệ. Chỉ chấp nhận: ${DUOI_ANH_HOP_LE.join(", ")}`,
        );
        e.target.value = "";
        return;
      }
      if (file.size > DUNG_LUONG_ANH_TOI_DA) {
        setLoiHinhAnh(
          `Dung lượng ảnh vượt quá ${DUNG_LUONG_ANH_TOI_DA / (1024 * 1024)}MB`,
        );
        e.target.value = "";
        return;
      }

      setTempImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setImageToCrop(imageUrl);
      setShowCropper(true);
      setLoiHinhAnh(null);
      e.target.value = "";
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isEditable) return;
    const file = e.dataTransfer.files?.[0] || null;
    if (file) {
      const duoi = layDuoiFile(file.name);
      if (!DUOI_ANH_HOP_LE.includes(duoi)) {
        setLoiHinhAnh(
          `Định dạng ảnh không hợp lệ. Chỉ chấp nhận: ${DUOI_ANH_HOP_LE.join(", ")}`,
        );
        return;
      }
      if (file.size > DUNG_LUONG_ANH_TOI_DA) {
        setLoiHinhAnh(
          `Dung lượng ảnh vượt quá ${DUNG_LUONG_ANH_TOI_DA / (1024 * 1024)}MB`,
        );
        return;
      }

      setTempImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setImageToCrop(imageUrl);
      setShowCropper(true);
      setLoiHinhAnh(null);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedFile = new File(
      [croppedBlob],
      tempImageFile?.name || "cropped_image.jpg",
      { type: "image/jpeg" },
    );

    if (croppedFile.size > DUNG_LUONG_ANH_TOI_DA) {
      setLoiHinhAnh(
        `Dung lượng ảnh sau khi cắt vượt quá ${DUNG_LUONG_ANH_TOI_DA / (1024 * 1024)}MB`,
      );
      setShowCropper(false);
      setImageToCrop(null);
      setTempImageFile(null);
      return;
    }

    setImageFile(croppedFile);
    setLoiHinhAnh(null);
    setShowCropper(false);
    setImageToCrop(null);
    setTempImageFile(null);
    setSuccess("Ảnh đã được cắt thành công!");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
    setImageToCrop(null);
    setTempImageFile(null);
  };

  const handleSave = async () => {
    if (!isEditable) {
      setError("Không thể chỉnh sửa khi khóa học không ở trạng thái Đang sửa");
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
  const soKyTuTieuDeHienTai = demSoKyTuKhongTinhDauCach(tenKhoaHoc);
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

        {!isEditable && (
          <Alert
            severity={trangThai === "DaDuyet" ? "success" : "info"}
            sx={{ mb: 2 }}
          >
            {trangThai === "DaDuyet"
              ? "Khóa học đã được duyệt. Bạn chỉ có thể xem thông tin."
              : trangThai === "TuChoi"
                ? "Khóa học bị từ chối. Bạn chỉ có thể xem thông tin."
                : "Khóa học đang trong quá trình duyệt. Bạn chỉ có thể xem thông tin."}
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
                subtitle={`Tiêu đề cần tối thiểu ${DO_DAI_TIEU_DE_TOI_THIEU} ký tự (không tính dấu cách) và tối đa ${DO_DAI_TIEU_DE_TOI_DA} ký tự.`}
              />
              <TextField
                fullWidth
                placeholder="VD: Lập trình React từ cơ bản đến nâng cao"
                value={tenKhoaHoc}
                onChange={(e) => {
                  if (!isEditable) return;
                  setThongTin({ tieuDe: e.target.value });
                  if (loiTieuDe) setLoiTieuDe(null);
                }}
                error={!!loiTieuDe}
                helperText={loiTieuDe}
                disabled={!isEditable}
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  "& .MuiInputBase-input": { color: "#1F2937" },
                }}
              />
              <Typography
                sx={{
                  fontSize: 12,
                  color: loiTieuDe ? "#D32F2F" : "#8A93A3",
                  mt: 0.75,
                  textAlign: "right",
                }}
              >
                {loiTieuDe
                  ? loiTieuDe
                  : `${soKyTuTieuDeHienTai}/${DO_DAI_TIEU_DE_TOI_DA} ký tự (không tính dấu cách)`}
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
                {!isEditable ? (
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
                  <FormControl fullWidth disabled={!isEditable}>
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
                  <FormControl fullWidth disabled={!isEditable}>
                    <InputLabel>Danh mục</InputLabel>
                    <Select
                      multiple
                      value={danhSachDanhMucId}
                      onChange={(e) => {
                        if (!isEditable) return;
                        const value = e.target.value;
                        setDanhSachDanhMucId(
                          typeof value === "string" ? value.split(",") : value,
                        );
                      }}
                      onClose={() => setTimKiemDanhMuc("")}
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
                      MenuProps={{
                        autoFocus: false,
                        slotProps: {
                          paper: {
                            sx: {
                              bgcolor: "#FFFFFF",
                              maxHeight: 360,
                              "& .MuiMenuItem-root": { color: "#1F2937" },
                            },
                          },
                        },
                      }}
                    >
                      <Box
                        sx={{
                          px: 1.5,
                          py: 1,
                          position: "sticky",
                          top: 0,
                          bgcolor: "#FFFFFF",
                          zIndex: 1,
                          borderBottom: "1px solid #EDEFF3",
                        }}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <TextField
                          inputRef={oTimKiemDanhMucRef}
                          size="small"
                          fullWidth
                          autoFocus
                          placeholder="Tìm danh mục..."
                          value={timKiemDanhMuc}
                          onChange={(e) => setTimKiemDanhMuc(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchRoundedIcon
                                    sx={{ fontSize: 18, color: "#8A93A3" }}
                                  />
                                </InputAdornment>
                              ),
                            },
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
                          }}
                        />
                      </Box>

                      {danhMucDaLoc.length === 0 ? (
                        <Box sx={{ px: 2, py: 1.5 }}>
                          <Typography sx={{ fontSize: 13, color: "#8A93A3" }}>
                            Không tìm thấy danh mục nào.
                          </Typography>
                        </Box>
                      ) : (
                        danhMucDaLoc.map((cat) => (
                          <MenuItem key={cat.id} value={cat.id}>
                            {cat.tenDanhMuc}
                          </MenuItem>
                        ))
                      )}
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
                  if (!isEditable) return;
                  const raw = e.target.value.replace(/\D/g, "");
                  const val = raw === "" ? undefined : Number(raw);
                  setThongTin({ giaGoc: val });
                  if (loiGia) setLoiGia(null);
                }}
                error={!!loiGia}
                helperText={loiGia}
                disabled={!isEditable}
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
                      {isEditable && (
                        <>
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
                          <IconButton
                            size="small"
                            onClick={() => fileInputRef.current?.click()}
                            sx={{
                              position: "absolute",
                              bottom: 6,
                              right: 6,
                              bgcolor: "rgba(255,255,255,0.92)",
                              boxShadow: 1,
                              width: 26,
                              height: 26,
                              "&:hover": { bgcolor: "#fff" },
                            }}
                            title="Thay đổi ảnh"
                          >
                            <CropIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </>
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
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                      mb: 2,
                      pl: 1,
                    }}
                  >
                    <Typography sx={{ fontSize: 13, color: "#4B5563" }}>
                      • <strong>Định dạng:</strong> {DUOI_ANH_HOP_LE.join(", ")}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#4B5563" }}>
                      • <strong>Tỷ lệ:</strong> 16:9
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#4B5563" }}>
                      • <strong>Độ phân giải tối thiểu:</strong>{" "}
                      {DO_PHAN_GIAI_TOI_THIEU_WIDTH}x
                      {DO_PHAN_GIAI_TOI_THIEU_HEIGHT} (720p)
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#4B5563" }}>
                      • <strong>Khuyến nghị:</strong> 1920x1080px (Full HD)
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#4B5563" }}>
                      • <strong>Dung lượng tối đa:</strong>{" "}
                      {DUNG_LUONG_ANH_TOI_DA / (1024 * 1024)}MB
                    </Typography>
                  </Box>

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
                      disabled={!isEditable}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!isEditable}
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
            {isEditable && (
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
                  disabled={loadingSave || loading}
                  sx={{
                    bgcolor: MAU.chinh,
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: 2,
                    px: 4,
                    py: 1,
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: MAU.chinhDam,
                      boxShadow: "none",
                    },
                  }}
                >
                  {loadingSave ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    "Lưu thay đổi"
                  )}
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Image Cropper Dialog */}
      {showCropper && imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCancelCrop}
        />
      )}
    </AuthGuard>
  );
}
