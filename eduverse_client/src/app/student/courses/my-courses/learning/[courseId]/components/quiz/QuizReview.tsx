/* eslint-disable @typescript-eslint/no-explicit-any */
// QuizReview.tsx
import { BRAND, STATUS } from "@/src/theme/tokens";
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  Divider,
  alpha,
  LinearProgress,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  EmojiEvents as EmojiEventsIcon,
} from "@mui/icons-material";
import {
  ReviewQizzDto,
  CauHoiReviewDto,
  DapAnReviewDto,
  isMultiChoice,
} from "../../hooks/useQuiz";
import { cleanHtmlContent, isHtmlContent, stripHtml } from "@/src/utils/htmlHelpers";

// ── Design tokens — đồng bộ với QuizContainer / QuizView / QuizResult ──
const RED = BRAND.main;
const RED_DARK = "#6B1414";
const GREEN = STATUS.success;
const INK = "#1c1d1f";
const SUB = "#6a6f73";
const RADIUS = "4px";
const LABELS = ["A", "B", "C", "D", "E", "F"];

interface QuizReviewProps {
  review: ReviewQizzDto;
  tieuDe?: string;
  onQuayLai: () => void;
}

function CauHoiReviewItem({
  cauHoi,
  stt,
  choXemDapAn,
}: {
  cauHoi: CauHoiReviewDto;
  stt: number;
  choXemDapAn: boolean;
}) {
  const dung = cauHoi.laDung;
  const selectedAnswerIds: string[] = [
    ...(Array.isArray(cauHoi.idDapAnChons) ? cauHoi.idDapAnChons : []),
    ...(Array.isArray((cauHoi as any).dapAnDaChon)
      ? (cauHoi as any).dapAnDaChon
      : []),
    ...(Array.isArray((cauHoi as any).idDapAnsDaChon)
      ? (cauHoi as any).idDapAnsDaChon
      : []),
    ...(cauHoi.idDapAnChon ? [cauHoi.idDapAnChon] : []),
  ];
  const hasAnswered = selectedAnswerIds.length > 0;
  const isMulti =
    isMultiChoice(cauHoi.loaiCauHoi) ||
    cauHoi.dapAns.filter((d) => d.laDapAnDung).length > 1 ||
    selectedAnswerIds.length > 1;

  return (
    <Box
      sx={{
        borderRadius: RADIUS,
        border: `1.5px solid ${dung ? alpha(GREEN, 0.22) : alpha(RED, 0.16)}`,
        bgcolor: "#fff",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          borderBottom: `1px solid ${dung ? alpha(GREEN, 0.12) : alpha(RED, 0.1)}`,
          bgcolor: dung ? alpha(GREEN, 0.035) : alpha(RED, 0.025),
        }}
      >
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: dung ? alpha(GREEN, 0.14) : alpha(RED, 0.1),
            mt: 0.1,
          }}
        >
          {dung ? (
            <CheckCircleIcon sx={{ color: GREEN, fontSize: 17 }} />
          ) : (
            <CancelIcon sx={{ color: RED, fontSize: 17 }} />
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.5 }}
          >
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 700,
                color: INK,
                lineHeight: 1.5,
              }}
            >
              Câu {stt}. {cauHoi.tenCauHoi}
            </Typography>
            {isMulti && (
              <Chip
                label="Chọn nhiều đáp án"
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: 11,
                  height: 20,
                  borderRadius: RADIUS,
                  bgcolor: "rgba(59,130,246,0.08)",
                  color: "#1E40AF",
                }}
              />
            )}
          </Stack>
          {cauHoi.noiDungCauHoi &&
            cauHoi.noiDungCauHoi !== cauHoi.tenCauHoi && (
              <Box
                sx={{
                  fontSize: 13,
                  color: "#3c3d40",
                  mt: 0.4,
                  lineHeight: 1.6,
                  "& p": { m: 0, mb: 1 },
                  "& p:last-child": { mb: 0 },
                  "& ul, & ol": { pl: 2.5, mb: 1 },
                  "& li": { mb: 0.5 },
                  "& img": {
                    maxWidth: "100%",
                    borderRadius: RADIUS,
                    my: 1,
                    display: "block",
                  },
                  "& b, & strong": { fontWeight: 700, color: INK },
                  "& a": { color: RED },
                }}
                dangerouslySetInnerHTML={{ __html: cauHoi.noiDungCauHoi }}
              />
            )}
        </Box>
      </Box>

      <Box sx={{ px: 3, py: 2 }}>
        <Stack spacing={1}>
          {cauHoi.dapAns.map((da: DapAnReviewDto, i: number) => {
            const laDung =
              da.laDapAnDung === true ||
              (da as any).dung === true ||
              (da as any).isDapAnDung === true;
            const daChon = selectedAnswerIds.includes(da.id);
            const chonSai = daChon && !laDung;

            let borderColor = "#d1d7dc";
            let bgColor = "transparent";
            let labelColor = SUB;
            let labelBg = "#f7f9fa";
            let textColor = INK;

            if (laDung) {
              borderColor = alpha(GREEN, 0.35);
              bgColor = alpha(GREEN, 0.045);
              labelColor = GREEN;
              labelBg = alpha(GREEN, 0.12);
            }
            if (chonSai) {
              borderColor = alpha(RED, 0.35);
              bgColor = alpha(RED, 0.045);
              labelColor = RED;
              labelBg = alpha(RED, 0.12);
              textColor = RED;
            }

            const rawAnswer = da.noiDungDapAn ?? "";
            const answerText = cleanHtmlContent(rawAnswer);
            const isAnswerHtml = isHtmlContent(answerText);

            return (
              <Box
                key={da.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2,
                  py: 1.5,
                  borderRadius: RADIUS,
                  border: `1.5px solid ${borderColor}`,
                  bgcolor: bgColor,
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: isMulti ? "6px" : "50%",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: labelBg,
                    color: labelColor,
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {isMulti && daChon ? (
                    <CheckCircleIcon sx={{ fontSize: 16 }} />
                  ) : (
                    (LABELS[i] ?? i + 1)
                  )}
                </Box>

                {isAnswerHtml ? (
                  <Box
                    sx={{
                      fontSize: 14,
                      flex: 1,
                      color: textColor,
                      fontWeight: laDung || chonSai ? 600 : 400,
                      lineHeight: 1.5,
                      "& p": { m: 0 },
                      "& strong": { fontWeight: 700 },
                    }}
                    dangerouslySetInnerHTML={{ __html: answerText }}
                  />
                ) : (
                  <Typography
                    sx={{
                      fontSize: 14,
                      flex: 1,
                      color: textColor,
                      fontWeight: laDung || chonSai ? 600 : 400,
                      lineHeight: 1.5,
                    }}
                  >
                    {answerText || "(Trống)"}
                  </Typography>
                )}

                {choXemDapAn && laDung && (
                  <CheckCircleIcon
                    sx={{ color: GREEN, fontSize: 18, flexShrink: 0 }}
                  />
                )}
                {choXemDapAn && chonSai && (
                  <CancelIcon
                    sx={{ color: RED, fontSize: 18, flexShrink: 0 }}
                  />
                )}
              </Box>
            );
          })}
        </Stack>

        {choXemDapAn && !dung && hasAnswered && (
          <Box
            sx={{
              mt: 1.5,
              px: 2,
              py: 1,
              borderRadius: RADIUS,
              bgcolor: alpha(RED, 0.045),
              border: `1px solid ${alpha(RED, 0.12)}`,
            }}
          >
            <Typography sx={{ fontSize: 12, color: RED, fontWeight: 600 }}>
              Bạn chọn chưa chính xác — đáp án đúng được đánh dấu màu xanh lá
            </Typography>
          </Box>
        )}
        {choXemDapAn && !dung && !hasAnswered && (
          <Box
            sx={{
              mt: 1.5,
              px: 2,
              py: 1,
              borderRadius: RADIUS,
              bgcolor: alpha(STATUS.warning, 0.06),
              border: `1px solid ${alpha(STATUS.warning, 0.14)}`,
            }}
          >
            <Typography
              sx={{ fontSize: 12, color: "#92400e", fontWeight: 600 }}
            >
              Bạn chưa trả lời câu này
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export function QuizReview({ review, tieuDe, onQuayLai }: QuizReviewProps) {
  const tongSoCau = review.cauHois.length;
  const soCauDung = review.cauHois.filter((c) => c.laDung).length;
  const soCauSai = tongSoCau - soCauDung;
  const phanTram =
    tongSoCau > 0 ? Math.round((soCauDung / tongSoCau) * 100) : 0;
  const daDat = review.dat;
  const choXemDapAn = review.choXemDapAn ?? false;
  const scoreColor = daDat ? GREEN : RED;

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", py: 4, px: { xs: 2, md: 0 } }}>
      <Box
        sx={{
          borderRadius: RADIUS,
          border: `1.5px solid ${alpha(scoreColor, 0.2)}`,
          bgcolor: alpha(scoreColor, 0.025),
          px: 4,
          py: 3,
          mb: 3,
          display: "flex",
          alignItems: "center",
          gap: 2.5,
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: RADIUS,
            bgcolor: alpha(scoreColor, 0.12),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <EmojiEventsIcon sx={{ fontSize: 26, color: scoreColor }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <Typography
            sx={{ fontSize: 16, fontWeight: 700, color: INK, mb: 0.25 }}
          >
            {tieuDe ?? "Kết quả chi tiết"}
          </Typography>
          <Typography sx={{ fontSize: 14, color: SUB }}>
            Đúng {soCauDung}/{tongSoCau} câu · {phanTram}% · Điểm:{" "}
            {review.tongDiem}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={phanTram}
            sx={{
              mt: 1,
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
        <Stack direction="row" spacing={1}>
          <Chip
            icon={
              <CheckCircleIcon
                sx={{
                  fontSize: "14px !important",
                  color: `${GREEN} !important`,
                }}
              />
            }
            label={`${soCauDung} đúng`}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: 12,
              borderRadius: RADIUS,
              bgcolor: alpha(GREEN, 0.1),
              color: GREEN,
            }}
          />
          <Chip
            icon={
              <CancelIcon
                sx={{ fontSize: "14px !important", color: `${RED} !important` }}
              />
            }
            label={`${soCauSai} sai`}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: 12,
              borderRadius: RADIUS,
              bgcolor: alpha(RED, 0.08),
              color: RED,
            }}
          />
        </Stack>
      </Box>

      <Stack spacing={2}>
        {review.cauHois.map((cauHoi, i) => (
          <CauHoiReviewItem
            key={cauHoi.idCauHoi}
            cauHoi={cauHoi}
            stt={i + 1}
            choXemDapAn={choXemDapAn}
          />
        ))}
      </Stack>

      <Divider sx={{ my: 3.5, opacity: 0.6 }} />

      <Button
        fullWidth
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={onQuayLai}
        sx={{
          borderColor: RED,
          color: RED,
          fontWeight: 700,
          borderRadius: RADIUS,
          textTransform: "none",
          py: 1.5,
          "&:hover": { borderColor: RED_DARK, bgcolor: alpha(RED, 0.04) },
        }}
      >
        Quay lại kết quả
      </Button>
    </Box>
  );
}
