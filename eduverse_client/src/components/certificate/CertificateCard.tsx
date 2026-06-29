"use client";

import { useState } from "react";
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  Typography,
  Box,
  Stack,
  Chip,
  Divider,
  IconButton,
} from "@mui/material";
import {
  VisibilityOutlined,
  DownloadOutlined,
  ShareOutlined,
  EmojiEventsRounded,
} from "@mui/icons-material";
import { Certificate } from "@/src/types/certificate";
import CertificateViewerModal from "./CertificateViewerModal";
import Swal from "sweetalert2";

interface CertificateCardProps {s
  certificate: Certificate;
}

export default function CertificateCard({ certificate }: CertificateCardProps) {
  const [viewerOpen, setViewerOpen] = useState(false);

  const handleShare = async () => {
    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify/certificate/${certificate.id}`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        Swal.fire({
          icon: "success",
          title: "Đã sao chép liên kết!",
          text: "Liên kết xác minh chứng chỉ đã được sao chép vào bộ nhớ tạm.",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      } else {
        throw new Error("Clipboard API not supported");
      }
    } catch (err) {
      Swal.fire({
        icon: "info",
        title: "Chia sẻ chứng chỉ",
        html: `<p>Sao chép liên kết này để chia sẻ:</p><input type="text" value="${shareUrl}" readOnly style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc; font-family: monospace;" />`,
        confirmButtonText: "Đóng",
        confirmButtonColor: "#7f1d1d",
      });
    }
  };

  const handleDownload = () => {
    Swal.fire({
      title: "Đang khởi tạo PDF...",
      text: "Vui lòng chờ trong giây lát.",
      timer: 1500,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
      willClose: () => {
        // Mock PDF file download
        const link = document.createElement("a");
        link.href = "#";
        link.setAttribute("download", `${certificate.maSoChungChi}.pdf`);
        document.body.appendChild(link);

        Swal.fire({
          icon: "success",
          title: "Tải xuống thành công!",
          text: `Đã tải xuống tệp ${certificate.maSoChungChi}.pdf. Bạn có thể in hoặc lưu trữ.`,
          confirmButtonText: "Đồng ý",
          confirmButtonColor: "#7f1d1d",
        });
      },
    });
  };

  const statusColor =
    certificate.trangThai === "Hoạt động"
      ? "success"
      : certificate.trangThai === "Đang chờ"
        ? "warning"
        : "error";

  return (
    <>
      <Card
        elevation={0}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 2.8,
          border: "1px solid rgba(17,17,17,0.08)",
          bgcolor: "#fff",
          overflow: "hidden",
          transition:
            "transform 240ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 240ms cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: "0 20px 38px rgba(127, 29, 29, 0.08)",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            pt: "56.25%",
            bgcolor: "#f5f5f5",
            overflow: "hidden",
          }}
        >
          {certificate.thumbnail ? (
            <CardMedia
              component="img"
              image={certificate.thumbnail}
              alt={certificate.tenChungChi}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.5s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            />
          ) : (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #7f1d1d 0%, #aa1c1c 100%)",
                color: "#fff",
              }}
            >
              <EmojiEventsRounded sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          )}

          {/* Status Chip */}
          <Chip
            label={certificate.trangThai}
            size="small"
            color={statusColor}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              fontWeight: 800,
              fontSize: "11px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          />
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 2.25 }}>
          <Typography
            gutterBottom
            variant="h6"
            component="h2"
            sx={{
              fontSize: "16.5px",
              fontWeight: 900,
              lineHeight: 1.3,
              color: "#1a181e",
              minHeight: "44px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {certificate.tenChungChi}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: "13px",
              mb: 1.5,
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Khóa học: <strong>{certificate.tenKhoaHoc}</strong>
          </Typography>

          <Divider sx={{ my: 1.5, opacity: 0.6 }} />

          <Stack
            direction="row"
            sx={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: "11px",
                  color: "text.secondary",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                }}
              >
                Ngày cấp
              </Typography>
              <Typography
                sx={{ fontSize: "13.5px", fontWeight: 800, color: "#4a484e" }}
              >
                {certificate.ngayCap.split("-").reverse().join("/")}
              </Typography>
            </Box>

            <Box sx={{ textAlign: "right" }}>
              <Typography
                sx={{
                  fontSize: "11px",
                  color: "text.secondary",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                }}
              >
                Điểm tổng kết
              </Typography>
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: 900,
                  color: certificate.diemTongKet >= 9.0 ? "#1f7a4d" : "#7f1d1d",
                }}
              >
                {certificate.diemTongKet.toFixed(1)}/10
              </Typography>
            </Box>
          </Stack>
        </CardContent>

        <CardActions
          sx={{ px: 2, pb: 2, pt: 0, justifyContent: "space-between" }}
        >
          <Button
            size="small"
            variant="contained"
            startIcon={<VisibilityOutlined fontSize="small" />}
            onClick={() => setViewerOpen(true)}
            sx={{
              flex: 1.2,
              mr: 1,
              py: 1,
              bgcolor: "#7f1d1d",
              color: "#fff",
              fontWeight: 800,
              boxShadow: "none",
              borderRadius: 2.2,
              "&:hover": {
                bgcolor: "#5f1616",
                boxShadow: "none",
              },
            }}
          >
            Xem
          </Button>

          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadOutlined fontSize="small" />}
            onClick={handleDownload}
            sx={{
              flex: 0.9,
              mr: 1,
              py: 1,
              borderColor: "rgba(127,29,29,0.18)",
              color: "#7f1d1d",
              fontWeight: 800,
              borderRadius: 2.2,
              "&:hover": {
                borderColor: "#7f1d1d",
                bgcolor: "rgba(127,29,29,0.04)",
              },
            }}
          >
            Tải PDF
          </Button>

          <IconButton
            size="small"
            onClick={handleShare}
            sx={{
              p: 1,
              border: "1px solid rgba(17,17,17,0.08)",
              borderRadius: 2.2,
              color: "rgba(24,24,27,0.64)",
              "&:hover": {
                bgcolor: "rgba(17,17,17,0.04)",
                color: "#19171c",
              },
            }}
          >
            <ShareOutlined fontSize="small" />
          </IconButton>
        </CardActions>
      </Card>

      <CertificateViewerModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        certificate={certificate}
      />
    </>
  );
}
