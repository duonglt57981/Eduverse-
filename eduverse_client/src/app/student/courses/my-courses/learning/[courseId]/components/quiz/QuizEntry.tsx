"use client";

import {
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  alpha,
  Chip,
} from "@mui/material";
// FIX: MUI v9 - import named từ root package "@mui/icons-material" thay vì
// subpath (subpath không resolve được ở v9 và đổi tên hậu tố Outline -> Outlined).
import {
  Quiz as QuizIcon,
  Timer as TimerIcon,
  HelpOutlined as HelpOutlineIcon,
  Replay as ReplayIcon,
  CheckCircleOutlined as CheckCircleOutlineIcon,
  Star as StarIcon,
} from "@mui/icons-material";

const PRIMARY_RED = "#8B1A1A";
const PRIMARY_RED_DARK = "#6B1414";

interface BaiKiemTraInfo {
  tieuDe?: string;
  moTa?: string;
  thoiGianGioiHan?: number | null;
  soLuongCauHoi?: number;
  diemToiDa?: number;
  soLanLamToiDa?: number;
  diemDat?: number;
}

interface QuizEntryProps {
  baiKiemTra: BaiKiemTraInfo;
  soLanDaLam?: number;
  diemCaoNhat?: number | null;
  daQua?: boolean;
  canRetake?: boolean;
  onStart: () => void;
  onContinue?: () => void;
  hasDraft?: boolean;
  loading?: boolean;
}

export const QuizEntry = ({
  baiKiemTra,
  soLanDaLam = 0,
  diemCaoNhat,
  daQua = false,
  canRetake = true,
  onStart,
  onContinue,
  hasDraft = false,
  loading = false,
}: QuizEntryProps) => {
  const stats = [
    {
      icon: <HelpOutlineIcon sx={{ fontSize: 18 }} />,
      label: "Số câu hỏi",
      value: `${baiKiemTra.soLuongCauHoi ?? "?"} câu`,
    },
    {
      icon: <TimerIcon sx={{ fontSize: 18 }} />,
      label: "Thời gian",
      value: baiKiemTra.thoiGianGioiHan
        ? `${baiKiemTra.thoiGianGioiHan} phút`
        : "Không giới hạn",
    },
    {
      icon: <StarIcon sx={{ fontSize: 18 }} />,
      label: "Điểm đạt",
      value: baiKiemTra.diemDat
        ? `${baiKiemTra.diemDat}/${baiKiemTra.diemToiDa ?? 10}`
        : `${baiKiemTra.diemToiDa ?? 10} điểm`,
    },
    {
      icon: <ReplayIcon sx={{ fontSize: 18 }} />,
      label: "Số lần làm",
      value: baiKiemTra.soLanLamToiDa
        ? `${soLanDaLam}/${baiKiemTra.soLanLamToiDa} lần`
        : `${soLanDaLam} lần`,
    },
  ];

  return (
    <Box
      sx={{
        maxWidth: 560,
        mx: "auto",
        my: 4,
        px: { xs: 2, md: 0 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          borderRadius: "12px 12px 0 0",
          bgcolor: PRIMARY_RED,
          px: 3,
          py: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: alpha("#fff", 0.15),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <QuizIcon sx={{ color: "#fff", fontSize: 26 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="overline"
            sx={{
              color: alpha("#fff", 0.7),
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              display: "block",
              lineHeight: 1,
              mb: 0.4,
            }}
          >
            BÀI KIỂM TRA
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#fff",
              fontWeight: 800,
              lineHeight: 1.25,
              fontSize: "1.05rem",
            }}
          >
            {baiKiemTra.tieuDe ?? "Kiểm tra"}
          </Typography>
        </Box>
        {daQua && (
          <Chip
            label="Đã qua"
            size="small"
            icon={
              <CheckCircleOutlineIcon
                sx={{ fontSize: "14px !important", color: "#fff !important" }}
              />
            }
            sx={{
              ml: "auto",
              bgcolor: alpha("#fff", 0.2),
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.68rem",
              flexShrink: 0,
            }}
          />
        )}
      </Box>

      {/* Body */}
      <Box
        sx={{
          border: `1px solid ${alpha(PRIMARY_RED, 0.15)}`,
          borderTop: "none",
          borderRadius: "0 0 12px 12px",
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        {/* Stats grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            borderBottom: `1px solid ${alpha(PRIMARY_RED, 0.1)}`,
          }}
        >
          {stats.map((s, i) => (
            <Box
              key={i}
              sx={{
                px: 2.5,
                py: 2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                borderRight:
                  i % 2 === 0 ? `1px solid ${alpha(PRIMARY_RED, 0.1)}` : "none",
                borderBottom:
                  i < 2 ? `1px solid ${alpha(PRIMARY_RED, 0.1)}` : "none",
              }}
            >
              <Box sx={{ color: PRIMARY_RED, opacity: 0.7, display: "flex" }}>
                {s.icon}
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    lineHeight: 1.2,
                    fontSize: "0.68rem",
                  }}
                >
                  {s.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, lineHeight: 1.3 }}
                >
                  {s.value}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Điểm cao nhất (nếu đã làm) */}
        {soLanDaLam > 0 && diemCaoNhat != null && (
          <Box
            sx={{
              px: 3,
              py: 1.75,
              bgcolor: daQua
                ? alpha(PRIMARY_RED, 0.04)
                : alpha("#f59e0b", 0.06),
              borderBottom: `1px solid ${alpha(PRIMARY_RED, 0.1)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Điểm cao nhất của bạn
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 800,
                color: daQua ? PRIMARY_RED : "#b45309",
              }}
            >
              {diemCaoNhat}/{baiKiemTra.diemToiDa ?? 10}
            </Typography>
          </Box>
        )}

        {/* Mô tả */}
        {baiKiemTra.moTa && (
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: `1px solid ${alpha(PRIMARY_RED, 0.1)}`,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.6 }}
            >
              {baiKiemTra.moTa}
            </Typography>
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ px: 3, py: 2.5 }}>
          <Stack spacing={1.25}>
            {hasDraft && onContinue && (
              <Button
                fullWidth
                variant="outlined"
                onClick={onContinue}
                disabled={loading}
                sx={{
                  borderColor: PRIMARY_RED,
                  color: PRIMARY_RED,
                  fontWeight: 700,
                  borderRadius: 1.5,
                  "&:hover": {
                    borderColor: PRIMARY_RED_DARK,
                    bgcolor: alpha(PRIMARY_RED, 0.05),
                  },
                }}
              >
                Tiếp tục làm bài
              </Button>
            )}
            <Button
              fullWidth
              variant="contained"
              onClick={onStart}
              disabled={loading || (!canRetake && soLanDaLam > 0)}
              sx={{
                bgcolor: PRIMARY_RED,
                fontWeight: 700,
                borderRadius: 1.5,
                py: 1.1,
                fontSize: "0.9rem",
                "&:hover": { bgcolor: PRIMARY_RED_DARK },
                "&.Mui-disabled": { bgcolor: "action.disabledBackground" },
              }}
            >
              {loading
                ? "Đang tải..."
                : soLanDaLam === 0
                  ? "Bắt đầu kiểm tra"
                  : !canRetake
                    ? "Đã hết lượt làm"
                    : "Làm lại"}
            </Button>
            {!canRetake && soLanDaLam > 0 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textAlign: "center", display: "block" }}
              >
                Bạn đã dùng hết {baiKiemTra.soLanLamToiDa} lần làm bài
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};
