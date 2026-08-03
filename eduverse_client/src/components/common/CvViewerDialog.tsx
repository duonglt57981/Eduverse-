"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  Tooltip,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import { BRAND, NEUTRAL } from "@/src/theme/tokens";
import { apiService } from "@/src/services/index";

/**
 * Hộp thoại xem hồ sơ CV của người xin nâng cấp giảng viên.
 *
 * CV được lưu trên Cloudinary dưới dạng tệp thô (raw), phát ra với
 * Content-Type octet-stream nên trình duyệt tải về thay vì mở, và với PDF thì
 * còn báo "Failed to load PDF document". Vì vậy:
 *   - PDF  -> tải qua endpoint /admin/instructor-requests/{id}/cv của hệ thống.
 *             Máy chủ đặt đúng Content-Type và inline, đồng thời chỉ quản trị
 *             viên đã đăng nhập mới lấy được tệp.
 *   - DOCX -> nhờ bộ hiển thị Office Online kết xuất rồi nhúng lại. Cách này
 *             không cần thêm thư viện, đổi lại tệp phải ở địa chỉ công khai.
 */

type LoaiTep = "pdf" | "office" | "khac";

function nhanDangLoaiTep(url: string): LoaiTep {
  const duoi = url.split("?")[0].split("#")[0].split(".").pop()?.toLowerCase();
  if (duoi === "pdf") return "pdf";
  if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(duoi ?? "")) {
    return "office";
  }
  return "khac";
}

function tenTepTuUrl(url: string): string {
  try {
    const duongDan = url.split("?")[0].split("#")[0];
    return decodeURIComponent(duongDan.split("/").pop() || "CV");
  } catch {
    return "CV";
  }
}

export default function CvViewerDialog({
  open,
  onClose,
  cvUrl,
  hoTen,
  requestId,
}: {
  open: boolean;
  onClose: () => void;
  cvUrl?: string | null;
  hoTen?: string | null;
  requestId?: string | null;
}) {
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState(false);
  // Địa chỉ tạm trỏ tới tệp đã tải về bộ nhớ trình duyệt
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const loaiTep = useMemo(
    () => (cvUrl ? nhanDangLoaiTep(cvUrl) : "khac"),
    [cvUrl],
  );

  const nguonNhung = useMemo(() => {
    // PDF: dùng tệp đã tải qua API (đúng Content-Type, không bị chặn phát)
    if (loaiTep === "pdf") return blobUrl ?? "";
    // Word: nhờ Office Online kết xuất, việc này cần đường dẫn công khai
    if (loaiTep === "office" && cvUrl) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(cvUrl)}`;
    }
    return "";
  }, [cvUrl, loaiTep, blobUrl]);

  // Tải PDF qua API của hệ thống thay vì để iframe gọi thẳng Cloudinary
  useEffect(() => {
    if (!open || loaiTep !== "pdf" || !requestId) return;
    let huy = false;
    let diaChiTam: string | null = null;

    (async () => {
      try {
        setDangTai(true);
        setLoi(false);
        const blob = await apiService.getBlob(
          `/admin/instructor-requests/${requestId}/cv`,
        );
        if (huy) return;
        diaChiTam = URL.createObjectURL(blob);
        setBlobUrl(diaChiTam);
      } catch {
        if (!huy) {
          setDangTai(false);
          setLoi(true);
        }
      }
    })();

    return () => {
      huy = true;
      if (diaChiTam) URL.revokeObjectURL(diaChiTam);
      setBlobUrl(null);
    };
  }, [open, loaiTep, requestId]);

  // Mỗi lần mở lại thì đặt về trạng thái đang tải
  useEffect(() => {
    if (open) {
      setDangTai(true);
      setLoi(false);
    }
  }, [open, cvUrl]);

  // Bộ hiển thị Office đôi khi không phát sự kiện tải xong.
  // Sau 12 giây thì tự tắt vòng quay để người dùng không phải chờ vô tận.
  useEffect(() => {
    if (!open || !dangTai) return;
    const hen = setTimeout(() => setDangTai(false), 12000);
    return () => clearTimeout(hen);
  }, [open, dangTai]);

  // Ưu tiên tệp đã tải qua API; chỉ lùi về đường dẫn Cloudinary khi chưa có.
  const diaChiDung = blobUrl ?? cvUrl ?? "";

  const moTabMoi = () => {
    if (diaChiDung) window.open(diaChiDung, "_blank", "noopener,noreferrer");
  };

  const taiVe = () => {
    if (!diaChiDung) return;
    const the = document.createElement("a");
    the.href = diaChiDung;
    the.download = tenTepTuUrl(cvUrl ?? "CV");
    the.rel = "noopener noreferrer";
    document.body.appendChild(the);
    the.click();
    document.body.removeChild(the);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "20px",
            height: { xs: "92vh", md: "88vh" },
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1.5 }}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                flexShrink: 0,
                borderRadius: "12px",
                display: "grid",
                placeItems: "center",
                bgcolor: BRAND.light,
                border: `1px solid ${BRAND.border}`,
              }}
            >
              <DescriptionRoundedIcon sx={{ fontSize: 21, color: BRAND.main }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{ fontSize: 16.5, fontWeight: 900, color: NEUTRAL.textPrimary }}
              >
                Hồ sơ CV
              </Typography>
              <Typography
                sx={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: NEUTRAL.textMuted,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {hoTen ? `${hoTen} · ` : ""}
                {cvUrl ? tenTepTuUrl(cvUrl) : "Không có tệp"}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexShrink: 0 }}>
            <Tooltip title="Tải về máy">
              <span>
                <IconButton
                  onClick={taiVe}
                  disabled={!cvUrl}
                  sx={{ borderRadius: "10px", color: NEUTRAL.textSecondary }}
                >
                  <DownloadRoundedIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Mở trong tab mới">
              <span>
                <IconButton
                  onClick={moTabMoi}
                  disabled={!cvUrl}
                  sx={{ borderRadius: "10px", color: NEUTRAL.textSecondary }}
                >
                  <OpenInNewRoundedIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Đóng">
              <IconButton
                onClick={onClose}
                sx={{ borderRadius: "10px", color: NEUTRAL.textSecondary }}
              >
                <CloseRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: 0,
          flex: 1,
          minHeight: 0,
          position: "relative",
          bgcolor: NEUTRAL.bg,
          borderColor: NEUTRAL.divider,
        }}
      >
        {!cvUrl || !nguonNhung ? (
          <Stack
            spacing={1.5}
            sx={{ height: "100%", alignItems: "center", justifyContent: "center", p: 4 }}
          >
            <ErrorOutlineRoundedIcon sx={{ fontSize: 44, color: NEUTRAL.textMuted }} />
            <Typography
              sx={{ fontSize: 14, fontWeight: 700, color: NEUTRAL.textSecondary }}
            >
              {cvUrl
                ? "Định dạng tệp này không xem trực tiếp được"
                : "Học viên chưa đính kèm CV"}
            </Typography>
            {cvUrl && (
              <Button
                variant="contained"
                disableElevation
                onClick={taiVe}
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: "10px",
                  bgcolor: BRAND.main,
                  "&:hover": { bgcolor: BRAND.dark },
                }}
              >
                Tải tệp về máy
              </Button>
            )}
          </Stack>
        ) : (
          <>
            {dangTai && !loi && (
              <Stack
                spacing={1.5}
                sx={{
                  position: "absolute",
                  inset: 0,
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: NEUTRAL.bg,
                  zIndex: 1,
                }}
              >
                <CircularProgress size={30} sx={{ color: BRAND.main }} />
                <Typography
                  sx={{ fontSize: 13, fontWeight: 600, color: NEUTRAL.textMuted }}
                >
                  {loaiTep === "office"
                    ? "Đang kết xuất tài liệu Word..."
                    : "Đang tải tài liệu..."}
                </Typography>
              </Stack>
            )}

            {loi ? (
              <Stack
                spacing={1.5}
                sx={{
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 4,
                  textAlign: "center",
                }}
              >
                <ErrorOutlineRoundedIcon sx={{ fontSize: 44, color: NEUTRAL.textMuted }} />
                <Typography
                  sx={{ fontSize: 14, fontWeight: 700, color: NEUTRAL.textSecondary }}
                >
                  Không hiển thị được tài liệu
                </Typography>
                <Typography
                  sx={{ fontSize: 12.5, color: NEUTRAL.textMuted, maxWidth: 420 }}
                >
                  Tệp có thể đã bị xóa trên máy chủ lưu trữ, hoặc bộ hiển thị tài
                  liệu đang không phản hồi. Bạn vẫn có thể tải tệp về để xem.
                </Typography>
                <Stack direction="row" spacing={1.25} sx={{ mt: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={moTabMoi}
                    sx={{
                      textTransform: "none",
                      fontWeight: 800,
                      borderRadius: "10px",
                      color: BRAND.main,
                      borderColor: BRAND.border,
                    }}
                  >
                    Mở tab mới
                  </Button>
                  <Button
                    variant="contained"
                    disableElevation
                    onClick={taiVe}
                    sx={{
                      textTransform: "none",
                      fontWeight: 800,
                      borderRadius: "10px",
                      bgcolor: BRAND.main,
                      "&:hover": { bgcolor: BRAND.dark },
                    }}
                  >
                    Tải về máy
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Box
                component="iframe"
                key={nguonNhung}
                src={nguonNhung}
                title="Hồ sơ CV"
                onLoad={() => setDangTai(false)}
                onError={() => {
                  setDangTai(false);
                  setLoi(true);
                }}
                sx={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  display: "block",
                  bgcolor: NEUTRAL.paper,
                }}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
