"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Stack,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import CloseRounded from "@mui/icons-material/CloseRounded";
import { apiService } from "@/src/services/index";

const PRIMARY = "#8B1313";

interface DanhGiaDialogProps {
  open: boolean;
  onClose: () => void;
  idKhoaHoc: string;
  tenKhoaHoc?: string;
  onSuccess?: () => void;
}

export function DanhGiaDialog({
  open,
  onClose,
  idKhoaHoc,
  tenKhoaHoc,
  onSuccess,
}: DanhGiaDialogProps) {
  const [soSao, setSoSao] = useState(0);
  const [hoverSao, setHoverSao] = useState(0);
  const [noiDung, setNoiDung] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const SAO_LABELS = ["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Xuất sắc"];

  const handleClose = () => {
    if (loading) return;
    setSoSao(0);
    setHoverSao(0);
    setNoiDung("");
    setError("");
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (soSao === 0) return setError("Vui lòng chọn số sao đánh giá");
    setLoading(true);
    setError("");
    try {
      await apiService.post("/danhgia", {
        idKhoaHoc,
        soSao,
        noiDung: noiDung.trim() || null,
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1500);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg ?? "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const activeStar = hoverSao || soSao;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: { sx: { borderRadius: "20px", overflow: "hidden" } },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #7C1313 100%)`,
          px: 3,
          py: 2.5,
          color: "#fff",
          position: "relative",
        }}
      >
        <Typography sx={{ fontWeight: 900, fontSize: 18 }}>
          Đánh giá khóa học
        </Typography>
        {tenKhoaHoc && (
          <Typography
            sx={{
              fontSize: 13,
              opacity: 0.8,
              mt: 0.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {tenKhoaHoc}
          </Typography>
        )}
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            color: "rgba(255,255,255,0.7)",
            "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.1)" },
          }}
        >
          <CloseRounded fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3.5, py: 3 }}>
        {success ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography sx={{ fontSize: 40, mb: 1 }}>🎉</Typography>
            <Typography
              sx={{ fontWeight: 800, fontSize: 18, color: "#10B981", mb: 0.5 }}
            >
              Cảm ơn bạn đã đánh giá!
            </Typography>
            <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
              Đánh giá của bạn giúp cải thiện chất lượng khóa học.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Chọn sao */}
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Typography
                sx={{
                  fontSize: 14,
                  color: "text.secondary",
                  mb: 2,
                  fontWeight: 600,
                }}
              >
                Bạn đánh giá khóa học này như thế nào?
              </Typography>

              <Stack
                direction="row"
                spacing={0.5}
                sx={{ justifyContent: "center", mb: 1 }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <IconButton
                    key={star}
                    size="large"
                    onMouseEnter={() => setHoverSao(star)}
                    onMouseLeave={() => setHoverSao(0)}
                    onClick={() => {
                      setSoSao(star);
                      setError("");
                    }}
                    sx={{
                      p: 0.5,
                      transition: "transform 0.15s",
                      "&:hover": { transform: "scale(1.2)" },
                    }}
                  >
                    {star <= activeStar ? (
                      <StarIcon
                        sx={{
                          fontSize: 44,
                          color:
                            star <= (hoverSao || soSao) ? "#F59E0B" : "#FCD34D",
                          filter: "drop-shadow(0 2px 4px rgba(245,158,11,0.3))",
                        }}
                      />
                    ) : (
                      <StarBorderIcon sx={{ fontSize: 44, color: "#D1D5DB" }} />
                    )}
                  </IconButton>
                ))}
              </Stack>

              {activeStar > 0 && (
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    color:
                      activeStar >= 4
                        ? "#10B981"
                        : activeStar >= 3
                          ? "#F59E0B"
                          : "#EF4444",
                  }}
                >
                  {SAO_LABELS[activeStar]}
                </Typography>
              )}
            </Box>

            {/* Nhận xét */}
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Chia sẻ trải nghiệm của bạn về khóa học này... (không bắt buộc)"
              value={noiDung}
              onChange={(e) => setNoiDung(e.target.value)}
              slotProps={{
                htmlInput: {
                  maxLength: 500,
                },
              }}
              helperText={`${noiDung.length}/500`}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  fontSize: 14,
                  "&.Mui-focused fieldset": { borderColor: PRIMARY },
                },
                "& .MuiFormHelperText-root": {
                  textAlign: "right",
                  color: "text.secondary",
                },
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: "10px" }}>
                {error}
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      {!success && (
        <DialogActions sx={{ px: 3.5, pb: 3, gap: 1 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{
              color: "#6B7280",
              borderRadius: "10px",
              fontWeight: 700,
              px: 3,
            }}
          >
            Để sau
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || soSao === 0}
            startIcon={
              loading ? (
                <CircularProgress size={16} sx={{ color: "#fff" }} />
              ) : (
                <StarIcon />
              )
            }
            sx={{
              background:
                soSao > 0
                  ? `linear-gradient(135deg, ${PRIMARY}, #7C1313)`
                  : undefined,
              borderRadius: "10px",
              fontWeight: 800,
              px: 3,
              py: 1.2,
              boxShadow: "none",
              "&.Mui-disabled": {
                bgcolor: "rgba(0,0,0,0.08)",
                color: "rgba(0,0,0,0.3)",
              },
            }}
          >
            {loading ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
