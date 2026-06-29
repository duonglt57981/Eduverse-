"use client";

import {
  Box,
  Typography,
  Button,
  Stack,
  LinearProgress,
  alpha,
  Chip,
  Divider,
} from "@mui/material";
// FIX: MUI v9 - import named từ root package "@mui/icons-material" thay vì
// subpath (subpath không resolve được ở v9, gây lỗi "Module not found").
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  EmojiEvents as EmojiEventsIcon,
  Replay as ReplayIcon,
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  Timer as TimerIcon,
} from "@mui/icons-material";

const PRIMARY_RED = "#8B1A1A";
const PRIMARY_RED_DARK = "#6B1414";

interface KetQuaProps {
  tieuDe: string;
  diem: number;
  diemToiDa: number;
  diemDat?: number;
  soCauDung: number;
  tongSoCau: number;
  thoiGianLam?: number; // giây
  soLanLam?: number;
  canRetake?: boolean;
  onRetake?: () => void;
  onClose?: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} giây`;
  return `${m} phút ${s} giây`;
}

export const QuizResult = ({
  tieuDe,
  diem,
  diemToiDa,
  diemDat,
  soCauDung,
  tongSoCau,
  thoiGianLam,
  soLanLam,
  canRetake = false,
  onRetake,
  onClose,
}: KetQuaProps) => {
  const phanTram = diemToiDa > 0 ? Math.round((diem / diemToiDa) * 100) : 0;
  const nguongDat = diemDat ?? diemToiDa * 0.5;
  const daDat = diem >= nguongDat;

  const getScoreColor = () => {
    if (daDat) return PRIMARY_RED;
    if (phanTram >= 40) return "#d97706";
    return "#dc2626";
  };

  const getScoreLabel = () => {
    if (phanTram === 100) return "Xuất sắc!";
    if (phanTram >= 80) return "Tốt lắm!";
    if (phanTram >= 60) return "Khá!";
    if (daDat) return "Đạt!";
    return "Chưa đạt";
  };

  const scoreColor = getScoreColor();

  return (
    <Box
      sx={{
        maxWidth: 520,
        mx: "auto",
        my: { xs: 3, md: 5 },
        px: { xs: 2, md: 0 },
      }}
    >
      {/* Result card */}
      <Box
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: `1px solid ${alpha(scoreColor, 0.2)}`,
          boxShadow: `0 4px 24px ${alpha(scoreColor, 0.1)}`,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 3,
            pt: 4,
            pb: 3,
            bgcolor: daDat ? alpha(PRIMARY_RED, 0.03) : alpha("#dc2626", 0.03),
            textAlign: "center",
            borderBottom: `1px solid ${alpha(scoreColor, 0.12)}`,
          }}
        >
          {/* Score ring */}
          <Box
            sx={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              border: `5px solid ${alpha(scoreColor, 0.15)}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
              position: "relative",
              background: `conic-gradient(${scoreColor} ${phanTram * 3.6}deg, ${alpha(scoreColor, 0.08)} 0deg)`,
            }}
          >
            <Box
              sx={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                bgcolor: "background.paper",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "absolute",
              }}
            >
              <Typography
                sx={{
                  fontSize: "1.6rem",
                  fontWeight: 900,
                  color: scoreColor,
                  lineHeight: 1,
                }}
              >
                {phanTram}%
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.6rem",
                  color: "text.secondary",
                  fontWeight: 600,
                }}
              >
                {diem}/{diemToiDa}đ
              </Typography>
            </Box>
          </Box>

          {/* Status badge */}
          <Chip
            icon={
              daDat ? (
                <EmojiEventsIcon
                  sx={{
                    fontSize: "16px !important",
                    color: `${scoreColor} !important`,
                  }}
                />
              ) : (
                <CancelIcon
                  sx={{
                    fontSize: "16px !important",
                    color: "#dc2626 !important",
                  }}
                />
              )
            }
            label={getScoreLabel()}
            sx={{
              bgcolor: alpha(scoreColor, 0.1),
              color: scoreColor,
              fontWeight: 800,
              fontSize: "0.8rem",
              height: 28,
              mb: 1.5,
            }}
          />

          <Typography
            variant="h6"
            sx={{ fontWeight: 800, lineHeight: 1.3, mb: 0.5 }}
          >
            {tieuDe}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {daDat
              ? "Chúc mừng, bạn đã vượt qua bài kiểm tra!"
              : "Bạn chưa đạt yêu cầu. Hãy ôn lại và thử lại nhé!"}
          </Typography>
        </Box>

        {/* Stats */}
        <Box sx={{ bgcolor: "background.paper" }}>
          {/* Progress bar */}
          <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
            {/* FIX: MUI v9 - Stack không còn nhận justifyContent/alignItems làm
                prop riêng (StackOwnProps đã bỏ 2 prop này) -> chuyển vào sx. */}
            <Stack
              direction="row"
              sx={{ mb: 0.75, justifyContent: "space-between" }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                Tiến độ
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: scoreColor }}
              >
                {soCauDung}/{tongSoCau} câu đúng
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={(soCauDung / tongSoCau) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(scoreColor, 0.1),
                "& .MuiLinearProgress-bar": {
                  bgcolor: scoreColor,
                  borderRadius: 4,
                },
              }}
            />
          </Box>

          <Divider sx={{ borderColor: alpha(scoreColor, 0.08) }} />

          {/* Detail stats */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
            }}
          >
            <Box
              sx={{
                px: 3,
                py: 2,
                borderRight: `1px solid ${alpha(scoreColor, 0.08)}`,
                borderBottom: `1px solid ${alpha(scoreColor, 0.08)}`,
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <CheckCircleIcon sx={{ color: PRIMARY_RED, fontSize: 18 }} />
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", lineHeight: 1 }}
                  >
                    Câu đúng
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 800, color: PRIMARY_RED }}
                  >
                    {soCauDung} câu
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box
              sx={{
                px: 3,
                py: 2,
                borderBottom: `1px solid ${alpha(scoreColor, 0.08)}`,
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <CancelIcon sx={{ color: "#9ca3af", fontSize: 18 }} />
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", lineHeight: 1 }}
                  >
                    Câu sai
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 800, color: "text.secondary" }}
                  >
                    {tongSoCau - soCauDung} câu
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {thoiGianLam != null && (
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  borderRight: `1px solid ${alpha(scoreColor, 0.08)}`,
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <TimerIcon sx={{ color: "text.disabled", fontSize: 18 }} />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", lineHeight: 1 }}
                    >
                      Thời gian
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {formatDuration(thoiGianLam)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}

            {soLanLam != null && (
              <Box sx={{ px: 3, py: 2 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <SchoolIcon sx={{ color: "text.disabled", fontSize: 18 }} />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", lineHeight: 1 }}
                    >
                      Lần làm
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Lần {soLanLam}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}
          </Box>

          {/* Điểm đạt threshold */}
          {diemDat != null && (
            <Box
              sx={{
                mx: 3,
                mb: 2,
                mt: 0.5,
                px: 2,
                py: 1.25,
                borderRadius: 1.5,
                bgcolor: daDat
                  ? alpha(PRIMARY_RED, 0.05)
                  : alpha("#dc2626", 0.05),
                border: `1px solid ${daDat ? alpha(PRIMARY_RED, 0.15) : alpha("#dc2626", 0.15)}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Điểm yêu cầu để đạt
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 800, color: daDat ? PRIMARY_RED : "#dc2626" }}
              >
                {diemDat}/{diemToiDa}
              </Typography>
            </Box>
          )}

          {/* Actions */}
          <Box sx={{ px: 3, pb: 3 }}>
            <Stack spacing={1.25}>
              {canRetake && onRetake && (
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ReplayIcon />}
                  onClick={onRetake}
                  sx={{
                    borderColor: PRIMARY_RED,
                    color: PRIMARY_RED,
                    fontWeight: 700,
                    borderRadius: 1.5,
                    "&:hover": {
                      borderColor: PRIMARY_RED_DARK,
                      bgcolor: alpha(PRIMARY_RED, 0.04),
                    },
                  }}
                >
                  Làm lại
                </Button>
              )}
              {onClose && (
                <Button
                  fullWidth
                  variant={canRetake ? "text" : "contained"}
                  startIcon={<ArrowBackIcon />}
                  onClick={onClose}
                  sx={
                    canRetake
                      ? {
                          color: "text.secondary",
                          fontWeight: 600,
                          borderRadius: 1.5,
                        }
                      : {
                          bgcolor: PRIMARY_RED,
                          fontWeight: 700,
                          borderRadius: 1.5,
                          "&:hover": { bgcolor: PRIMARY_RED_DARK },
                        }
                  }
                >
                  Về bài học
                </Button>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
