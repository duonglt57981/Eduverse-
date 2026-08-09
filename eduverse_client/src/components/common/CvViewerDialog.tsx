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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

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
    if (!cvUrl) return "";

    if (loaiTep === "pdf") {
      // PDF bắt buộc dùng Blob URL trong bộ nhớ (được tải bằng apiService kèm Token Authorization)
      return blobUrl ?? "";
    }

    if (loaiTep === "office") {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(cvUrl)}`;
    }

    return cvUrl;
  }, [cvUrl, loaiTep, blobUrl]);

  // Tải tệp PDF qua apiService (tự động kèm Authorization Bearer token) để tạo Blob URL chuẩn
  useEffect(() => {
    if (!open || !cvUrl) {
      setDangTai(false);
      return;
    }

    let cancel = false;
    let createdUrl: string | null = null;

    const loadPdfBlob = async () => {
      setDangTai(true);
      setLoi(false);

      try {
        let pdfBlob: Blob | null = null;

        // 1. Lấy tệp qua Backend API theo requestId
        if (requestId) {
          try {
            pdfBlob = await apiService.getBlob(
              `/admin/instructor-requests/${requestId}/cv`,
            );
          } catch (err) {
            console.warn("Lỗi lấy CV qua requestId:", err);
          }
        }

        // 2. Nếu không lấy được qua requestId, tải qua Proxy API của backend (gửi kèm Token)
        if (!pdfBlob && cvUrl) {
          try {
            pdfBlob = await apiService.getBlob(
              `/admin/cv-proxy?url=${encodeURIComponent(cvUrl)}`,
            );
          } catch (err) {
            console.warn("Lỗi lấy CV qua Proxy:", err);
          }
        }

        if (cancel) return;

        if (pdfBlob && pdfBlob.size > 0) {
          // Ép kiểu application/pdf để trình duyệt bật bộ đọc PDF native
          const buffer = await pdfBlob.arrayBuffer();
          const purePdfBlob = new Blob([buffer], {
            type: "application/pdf",
          });
          createdUrl = URL.createObjectURL(purePdfBlob);
          setBlobUrl(createdUrl);
          setDangTai(false);
          return;
        }

        throw new Error("Không thể đọc tệp PDF");
      } catch (err) {
        console.error("Lỗi tải PDF Blob:", err);
        if (!cancel) {
          setDangTai(false);
          setLoi(true);
        }
      }
    };

    if (loaiTep === "pdf") {
      void loadPdfBlob();
    } else {
      setDangTai(false);
    }

    return () => {
      cancel = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
      setBlobUrl(null);
    };
  }, [open, cvUrl, requestId, loaiTep]);

  // Tự động tắt spinner sau 6 giây
  useEffect(() => {
    if (!open || !dangTai) return;
    const hen = setTimeout(() => setDangTai(false), 6000);
    return () => clearTimeout(hen);
  }, [open, dangTai]);

  const moTabMoi = () => {
    if (blobUrl) {
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    } else if (cvUrl) {
      window.open(cvUrl, "_blank", "noopener,noreferrer");
    }
  };

  const taiVe = async () => {
    if (blobUrl) {
      const the = document.createElement("a");
      the.href = blobUrl;
      the.download = tenTepTuUrl(cvUrl ?? "Hoso_CV.pdf");
      document.body.appendChild(the);
      the.click();
      document.body.removeChild(the);
    } else if (requestId) {
      try {
        const blob = await apiService.getBlob(
          `/admin/instructor-requests/${requestId}/cv`,
        );
        const url = URL.createObjectURL(blob);
        const the = document.createElement("a");
        the.href = url;
        the.download = tenTepTuUrl(cvUrl ?? "Hoso_CV.pdf");
        document.body.appendChild(the);
        the.click();
        document.body.removeChild(the);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch {
        if (cvUrl) window.open(cvUrl, "_blank");
      }
    } else if (cvUrl) {
      window.open(cvUrl, "_blank");
    }
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
                    : "Đang tải tài liệu PDF..."}
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
                  Tệp có thể đã bị xóa trên máy chủ lưu trữ. Bạn vẫn có thể tải tệp về để xem.
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
            ) : loaiTep === "pdf" ? (
              <Box
                component="object"
                key={nguonNhung}
                data={nguonNhung}
                type="application/pdf"
                onLoad={() => setDangTai(false)}
                sx={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  display: "block",
                  bgcolor: "#525659",
                }}
              >
                <iframe
                  src={nguonNhung}
                  title="Hồ sơ CV PDF"
                  onLoad={() => setDangTai(false)}
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
              </Box>
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
