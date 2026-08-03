"use client";

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
import type { ReviewQizzDto, CauHoiReviewDto, DapAnReviewDto } from "../../hooks/useQuiz";

const RED = "#8B1313";
const RED_DARK = "#6B1414";
const GREEN = "#10B981";

interface QuizReviewProps {
  review: ReviewQizzDto;
  tieuDe?: string;
  onQuayLai: () => void; // quay về màn result
}

function CauHoiReviewItem({
  cauHoi,
  stt,
}: {
  cauHoi: CauHoiReviewDto;
  stt: number;
}) {
  const dung = cauHoi.laDung;

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1.5px solid ${dung ? alpha(GREEN, 0.25) : alpha(RED, 0.2)}`,
        bgcolor: dung ? alpha(GREEN, 0.02) : alpha(RED, 0.02),
        overflow: "hidden",
      }}
    >
      {/* Header câu hỏi */}
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          borderBottom: `1px solid ${dung ? alpha(GREEN, 0.12) : alpha(RED, 0.1)}`,
          bgcolor: dung ? alpha(GREEN, 0.04) : alpha(RED, 0.03),
        }}
      >
        {dung ? (
          <CheckCircleIcon sx={{ color: GREEN, fontSize: 20, mt: 0.15, flexShrink: 0 }} />
        ) : (
          <CancelIcon sx={{ color: RED, fontSize: 20, mt: 0.15, flexShrink: 0 }} />
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: "var(--ev-text-primary, #1F2937)", lineHeight: 1.5 }}>
            Câu {stt}. {cauHoi.tenCauHoi}
          </Typography>
          {cauHoi.noiDungCauHoi && cauHoi.noiDungCauHoi !== cauHoi.tenCauHoi && (
            <Typography sx={{ fontSize: 13, color: "rgba(31,41,55,0.6)", mt: 0.4, lineHeight: 1.6 }}>
              {cauHoi.noiDungCauHoi}
            </Typography>
          )}
        </Box>
        <Box sx={{ flexShrink: 0 }}>
          <Chip
            label={dung ? `+${cauHoi.diemNhanDuoc}đ` : "0đ"}
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: 11.5,
              height: 22,
              bgcolor: dung ? alpha(GREEN, 0.12) : alpha(RED, 0.1),
              color: dung ? GREEN : RED,
            }}
          />
        </Box>
      </Box>

      {/* Danh sách đáp án */}
      <Box sx={{ px: 2.5, py: 1.75 }}>
        <Stack spacing={1}>
          {cauHoi.dapAns.map((da: DapAnReviewDto, i: number) => {
            const laDung = da.laDapAnDung === true;
            const daChon = da.id === cauHoi.idDapAnChon;
            const chonSai = daChon && !laDung;
            const chonDung = daChon && laDung;

            let borderColor = "rgba(0,0,0,0.08)";
            let bgColor = "transparent";
            let labelColor = "rgba(31,41,55,0.35)";
            let labelBg = "rgba(0,0,0,0.05)";
            let textColor = "#1F2937";

            if (laDung) {
              borderColor = alpha(GREEN, 0.4);
              bgColor = alpha(GREEN, 0.05);
              labelColor = GREEN;
              labelBg = alpha(GREEN, 0.12);
            }
            if (chonSai) {
              borderColor = alpha(RED, 0.4);
              bgColor = alpha(RED, 0.05);
              labelColor = RED;
              labelBg = alpha(RED, 0.12);
              textColor = RED;
            }

            const LABELS = ["A", "B", "C", "D", "E", "F"];

            return (
              <Box
                key={da.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1.75,
                  py: 1.25,
                  borderRadius: "10px",
                  border: `1.5px solid ${borderColor}`,
                  bgcolor: bgColor,
                  transition: "all 0.1s",
                }}
              >
                {/* Label A/B/C */}
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: labelBg,
                    color: labelColor,
                    fontWeight: 800,
                    fontSize: 12,
                  }}
                >
                  {LABELS[i] ?? i + 1}
                </Box>

                <Typography
                  sx={{
                    fontSize: 13.5,
                    flex: 1,
                    color: textColor,
                    fontWeight: laDung || chonSai ? 600 : 400,
                    lineHeight: 1.5,
                  }}
                >
                  {da.noiDungDapAn}
                </Typography>

                {/* Icon trạng thái */}
                {laDung && (
                  <CheckCircleIcon sx={{ color: GREEN, fontSize: 17, flexShrink: 0 }} />
                )}
                {chonSai && (
                  <CancelIcon sx={{ color: RED, fontSize: 17, flexShrink: 0 }} />
                )}
              </Box>
            );
          })}
        </Stack>

        {/* Ghi chú nếu chọn sai */}
        {!dung && cauHoi.idDapAnChon && (
          <Box
            sx={{
              mt: 1.5,
              px: 1.75,
              py: 1,
              borderRadius: "8px",
              bgcolor: alpha(RED, 0.05),
              border: `1px solid ${alpha(RED, 0.12)}`,
            }}
          >
            <Typography sx={{ fontSize: 12, color: RED, fontWeight: 600 }}>
              ✗ Bạn chọn sai — đáp án đúng được đánh dấu màu xanh lá ở trên
            </Typography>
          </Box>
        )}
        {!dung && !cauHoi.idDapAnChon && (
          <Box
            sx={{
              mt: 1.5,
              px: 1.75,
              py: 1,
              borderRadius: "8px",
              bgcolor: alpha("#f59e0b", 0.06),
              border: `1px solid ${alpha("#f59e0b", 0.15)}`,
            }}
          >
            <Typography sx={{ fontSize: 12, color: "#D97706", fontWeight: 600 }}>
              ⚠ Bạn chưa trả lời câu này
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
  const phanTram = tongSoCau > 0 ? Math.round((soCauDung / tongSoCau) * 100) : 0;
  const daDat = review.dat;

  return (
    <Box sx={{ maxWidth: 680, mx: "auto", py: 3, px: { xs: 2, md: 0 } }}>

      {/* Tóm tắt kết quả */}
      <Box
        sx={{
          borderRadius: 3,
          border: `1.5px solid ${daDat ? alpha(GREEN, 0.2) : alpha(RED, 0.2)}`,
          bgcolor: daDat ? alpha(GREEN, 0.025) : alpha(RED, 0.025),
          px: 3,
          py: 2.5,
          mb: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <EmojiEventsIcon sx={{ fontSize: 36, color: daDat ? GREEN : RED }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 900, color: "var(--ev-text-primary, #1F2937)", mb: 0.25 }}>
            {tieuDe ?? "Kết quả chi tiết"}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "rgba(31,41,55,0.55)" }}>
            Đúng {soCauDung}/{tongSoCau} câu · {phanTram}% · Điểm: {review.tongDiem}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={phanTram}
            sx={{
              mt: 1,
              height: 5,
              borderRadius: 3,
              bgcolor: "rgba(0,0,0,0.07)",
              "& .MuiLinearProgress-bar": {
                bgcolor: daDat ? GREEN : RED,
                borderRadius: 3,
              },
            }}
          />
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: "14px !important", color: `${GREEN} !important` }} />}
            label={`${soCauDung} đúng`}
            size="small"
            sx={{ fontWeight: 800, fontSize: 11.5, bgcolor: alpha(GREEN, 0.1), color: GREEN }}
          />
          <Chip
            icon={<CancelIcon sx={{ fontSize: "14px !important", color: `${RED} !important` }} />}
            label={`${soCauSai} sai`}
            size="small"
            sx={{ fontWeight: 800, fontSize: 11.5, bgcolor: alpha(RED, 0.08), color: RED }}
          />
        </Stack>
      </Box>

      {/* Danh sách câu hỏi */}
      <Stack spacing={2}>
        {review.cauHois.map((cauHoi, i) => (
          <CauHoiReviewItem key={cauHoi.idCauHoi} cauHoi={cauHoi} stt={i + 1} />
        ))}
      </Stack>

      <Divider sx={{ my: 3, opacity: 0.4 }} />

      {/* Nút quay lại */}
      <Button
        fullWidth
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={onQuayLai}
        sx={{
          borderColor: RED,
          color: RED,
          fontWeight: 700,
          borderRadius: 1.5,
          py: 1.25,
          "&:hover": {
            borderColor: RED_DARK,
            bgcolor: alpha(RED, 0.04),
          },
        }}
      >
        Quay lại kết quả
      </Button>
    </Box>
  );
}