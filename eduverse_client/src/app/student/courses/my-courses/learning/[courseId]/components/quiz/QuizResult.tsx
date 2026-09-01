// QuizResult.tsx
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
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  EmojiEvents as EmojiEventsIcon,
  Replay as ReplayIcon,
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import type { ReviewQizzDto } from "../../hooks/useQuiz";
import { BRAND, STATUS } from "@/src/theme/tokens";

// ── Design tokens — đồng bộ với QuizContainer / QuizView / QuizReview ──
const RED = BRAND.main;
const RED_DARK = "#6B1414";
const GREEN = STATUS.success;
const AMBER = STATUS.warningDark;
const CRIMSON = STATUS.error;
const INK = "#1c1d1f";
const SUB = "#6a6f73";
const RADIUS = "4px";

interface KetQuaProps {
  tieuDe: string;
  diem: number;
  diemToiDa: number;
  diemDat?: number;
  soCauDung: number;
  tongSoCau: number;
  thoiGianLam?: number;
  soLanLam?: number;
  canRetake?: boolean;
  onRetake?: () => void;
  onClose?: () => void;
  onXemLai?: () => void;
  daDat100?: boolean;
  review?: ReviewQizzDto | null;
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
  onXemLai,
  daDat100 = false,
  review,
}: KetQuaProps) => {
  const phanTram = diemToiDa > 0 ? Math.round((diem / diemToiDa) * 100) : 0;
  const nguongDat = diemDat ?? diemToiDa * 0.5;
  const daDat = diem >= nguongDat;

  const scoreColor =
    daDat100 || daDat ? GREEN : phanTram >= 40 ? AMBER : CRIMSON;

  const getScoreLabel = () => {
    if (daDat100) return "Hoàn hảo!";
    if (phanTram === 100) return "Xuất sắc!";
    if (phanTram >= 80) return "Tốt lắm!";
    if (phanTram >= 60) return "Khá!";
    if (daDat) return "Đạt!";
    return "Chưa đạt";
  };

  return (
    <Box
      sx={{
        maxWidth: 620,
        mx: "auto",
        my: { xs: 3, md: 5 },
        px: { xs: 2, md: 0 },
      }}
    >
      <Box
        sx={{
          borderRadius: RADIUS,
          overflow: "hidden",
          border: `1px solid ${alpha(scoreColor, 0.18)}`,
          boxShadow: `0 12px 32px ${alpha(scoreColor, 0.1)}`,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 4,
            pt: 4.5,
            pb: 3.5,
            background: `linear-gradient(180deg, ${alpha(scoreColor, 0.06)} 0%, ${alpha(scoreColor, 0.015)} 100%)`,
            textAlign: "center",
            borderBottom: `1px solid ${alpha(scoreColor, 0.1)}`,
          }}
        >
          {/* Score ring */}
          <Box
            sx={{
              width: 132,
              height: 132,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2.5,
              position: "relative",
              background: `conic-gradient(${scoreColor} ${phanTram * 3.6}deg, ${alpha(scoreColor, 0.1)} 0deg)`,
              p: "6px",
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                bgcolor: "#fff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: scoreColor,
                  lineHeight: 1,
                }}
              >
                {phanTram}%
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  color: SUB,
                  fontWeight: 600,
                  mt: 0.5,
                }}
              >
                {diem}/{diemToiDa} điểm
              </Typography>
            </Box>
          </Box>

          <Chip
            icon={
              daDat || daDat100 ? (
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
                    color: `${CRIMSON} !important`,
                  }}
                />
              )
            }
            label={getScoreLabel()}
            sx={{
              bgcolor: alpha(scoreColor, 0.1),
              color: scoreColor,
              fontWeight: 700,
              fontSize: "0.8rem",
              height: 28,
              mb: 1.75,
              borderRadius: RADIUS,
            }}
          />

          <Typography
            sx={{
              fontSize: 19,
              fontWeight: 800,
              lineHeight: 1.3,
              mb: 0.75,
              color: INK,
            }}
          >
            {tieuDe}
          </Typography>
          <Typography sx={{ fontSize: 14, color: SUB }}>
            {daDat100
              ? "Chúc mừng! Bạn đã hoàn thành xuất sắc bài kiểm tra!"
              : daDat
                ? "Chúc mừng, bạn đã vượt qua bài kiểm tra!"
                : "Bạn chưa đạt yêu cầu. Hãy ôn lại và thử lại nhé!"}
          </Typography>
        </Box>

        {/* Stats */}
        <Box sx={{ bgcolor: "#fff" }}>
          <Box sx={{ px: 4, pt: 3, pb: 2 }}>
            <Stack
              direction="row"
              sx={{ mb: 1, justifyContent: "space-between" }}
            >
              <Typography sx={{ fontSize: 12, color: SUB, fontWeight: 700 }}>
                Tiến độ
              </Typography>
              <Typography
                sx={{ fontSize: 12, fontWeight: 700, color: scoreColor }}
              >
                {soCauDung}/{tongSoCau} câu đúng
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={tongSoCau > 0 ? (soCauDung / tongSoCau) * 100 : 0}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: "#eceef0",
                "& .MuiLinearProgress-bar": {
                  bgcolor: scoreColor,
                  borderRadius: 3,
                },
              }}
            />
          </Box>

          <Divider sx={{ borderColor: alpha(scoreColor, 0.08) }} />

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <Box
              sx={{
                px: 4,
                py: 2.25,
                borderRight: `1px solid ${alpha(scoreColor, 0.08)}`,
                borderBottom: `1px solid ${alpha(scoreColor, 0.08)}`,
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center" }}
              >
                <CheckCircleIcon sx={{ color: GREEN, fontSize: 20 }} />
                <Box>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: SUB,
                      display: "block",
                      lineHeight: 1,
                    }}
                  >
                    Câu đúng
                  </Typography>
                  <Typography
                    sx={{ fontSize: 14, fontWeight: 700, color: INK, mt: 0.4 }}
                  >
                    {soCauDung} câu
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box
              sx={{
                px: 4,
                py: 2.25,
                borderBottom: `1px solid ${alpha(scoreColor, 0.08)}`,
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center" }}
              >
                <CancelIcon sx={{ color: CRIMSON, fontSize: 20 }} />
                <Box>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: SUB,
                      display: "block",
                      lineHeight: 1,
                    }}
                  >
                    Câu sai
                  </Typography>
                  <Typography
                    sx={{ fontSize: 14, fontWeight: 700, color: INK, mt: 0.4 }}
                  >
                    {tongSoCau - soCauDung} câu
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {soLanLam != null && (
              <Box sx={{ px: 4, py: 2.25 }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: "center" }}
                >
                  <SchoolIcon sx={{ color: SUB, fontSize: 20 }} />
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: SUB,
                        display: "block",
                        lineHeight: 1,
                      }}
                    >
                      Lần làm
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: INK,
                        mt: 0.4,
                      }}
                    >
                      Lần {soLanLam}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}
          </Box>

          {diemDat != null && (
            <Box
              sx={{
                mx: 4,
                mb: 2,
                mt: 2,
                px: 3,
                py: 1.5,
                borderRadius: RADIUS,
                bgcolor: alpha(scoreColor, 0.04),
                border: `1px solid ${alpha(scoreColor, 0.14)}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography sx={{ fontSize: 12, color: SUB }}>
                Điểm yêu cầu để đạt
              </Typography>
              <Typography
                sx={{ fontSize: 14, fontWeight: 700, color: scoreColor }}
              >
                {diemDat}/{diemToiDa}
              </Typography>
            </Box>
          )}

          {/* Actions */}
          <Box sx={{ px: 4, pb: 4, pt: diemDat != null ? 0 : 1 }}>
            <Stack spacing={1.25}>
              {onRetake && (
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ReplayIcon />}
                  onClick={onRetake}
                  sx={{
                    borderColor: RED,
                    color: RED,
                    fontWeight: 700,
                    borderRadius: RADIUS,
                    textTransform: "none",
                    py: 1.25,
                    "&:hover": {
                      borderColor: RED_DARK,
                      bgcolor: alpha(RED, 0.04),
                    },
                  }}
                >
                  Làm lại
                </Button>
              )}

              {onXemLai && (review?.choXemDapAn ?? daDat) ? (
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<SchoolIcon />}
                  onClick={onXemLai}
                  sx={{
                    bgcolor: GREEN,
                    fontWeight: 700,
                    borderRadius: RADIUS,
                    textTransform: "none",
                    py: 1.25,
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#059669", boxShadow: "none" },
                  }}
                >
                  Xem đáp án đúng
                </Button>
              ) : onXemLai ? (
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SchoolIcon />}
                  onClick={onXemLai}
                  sx={{
                    borderColor: alpha(RED, 0.5),
                    color: RED,
                    fontWeight: 700,
                    borderRadius: RADIUS,
                    textTransform: "none",
                    py: 1.25,
                    "&:hover": {
                      borderColor: RED,
                      bgcolor: alpha(RED, 0.04),
                    },
                  }}
                >
                  Xem lại bài làm
                </Button>
              ) : null}

              {onClose && (
                <Button
                  fullWidth
                  variant={canRetake ? "text" : "contained"}
                  startIcon={<ArrowBackIcon />}
                  onClick={onClose}
                  sx={
                    canRetake
                      ? {
                          color: SUB,
                          fontWeight: 600,
                          borderRadius: RADIUS,
                          textTransform: "none",
                          py: 1.25,
                          "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                        }
                      : {
                          bgcolor: RED,
                          fontWeight: 700,
                          borderRadius: RADIUS,
                          textTransform: "none",
                          py: 1.25,
                          boxShadow: "none",
                          "&:hover": { bgcolor: RED_DARK, boxShadow: "none" },
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
