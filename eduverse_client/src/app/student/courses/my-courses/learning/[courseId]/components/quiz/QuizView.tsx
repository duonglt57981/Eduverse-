"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  LinearProgress,
  alpha,
  Tooltip,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
// FIX: MUI v9 - import named từ root package "@mui/icons-material" thay vì
// subpath (subpath không resolve được ở v9, gây lỗi "Module not found").
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  CheckBox as CheckBoxIcon,
  Timer as TimerIcon,
  Flag as FlagIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Send as SendIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import { SelectedAnswers } from "../../hooks/useQuiz";

const PRIMARY_RED = "#8B1313";
const PRIMARY_RED_DARK = "#6B1414";

interface DapAn {
  id: string;
  noiDung: string;
}

interface CauHoi {
  id: string;
  noiDung: string;
  loai?: "single" | "multi" | string;
  // Khớp với CauHoiLamBaiDto: field là "dapAn"
  dapAn?: DapAn[];
}

interface QuizViewProps {
  tieuDe: string;
  danhSachCauHoi: CauHoi[];
  selectedAnswers: SelectedAnswers;
  currentQuestion: number;
  timeLeft: number | null;
  submitting?: boolean;
  onSelectAnswer: (cauHoiId: string, dapAnId: string, isMulti: boolean) => void;
  onGoToQuestion: (idx: number) => void;
  onSubmit: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const QuizView = ({
  tieuDe,
  danhSachCauHoi,
  selectedAnswers,
  currentQuestion,
  timeLeft,
  submitting = false,
  onSelectAnswer,
  onGoToQuestion,
  onSubmit,
}: QuizViewProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());

  const total = danhSachCauHoi.length;
  const cauHoi = danhSachCauHoi[currentQuestion];
  const isMulti = cauHoi?.loai === "multi";
  const answered = Object.keys(selectedAnswers).filter(
    (k) => selectedAnswers[k].length > 0,
  ).length;
  const unanswered = total - answered;
  const progress = total > 0 ? (answered / total) * 100 : 0;

  const isTimeCritical = timeLeft !== null && timeLeft <= 120;
  const isTimeWarning = timeLeft !== null && timeLeft <= 300;

  const toggleFlag = (idx: number) => {
    setFlagged((prev) => {
      const s = new Set(prev);
      s.has(idx) ? s.delete(idx) : s.add(idx);
      return s;
    });
  };

  const getQuestionStatus = (
    idx: number,
  ): "answered" | "flagged" | "current" | "empty" => {
    const q = danhSachCauHoi[idx];
    if (idx === currentQuestion) return "current";
    if (flagged.has(idx)) return "flagged";
    if (q && selectedAnswers[q.id]?.length > 0) return "answered";
    return "empty";
  };

  if (!cauHoi) return null;

  // Lấy danh sách đáp án từ field "dapAn" (CauHoiLamBaiDto)
  const danhSachDapAn: DapAn[] = cauHoi.dapAn ?? [];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "grey.50",
      }}
    >
      {/* Top bar */}
      <Box
        sx={{
          flexShrink: 0,
          bgcolor: "#fff",
          borderBottom: `1px solid ${alpha(PRIMARY_RED, 0.12)}`,
          px: { xs: 2, md: 3 },
          py: 1.25,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}
            noWrap
          >
            {tieuDe}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {answered}/{total} câu đã trả lời
          </Typography>
        </Box>

        {/* Timer */}
        {timeLeft !== null && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.5,
              py: 0.5,
              borderRadius: 1.5,
              bgcolor: isTimeCritical
                ? alpha("#dc2626", 0.08)
                : isTimeWarning
                  ? alpha("#f59e0b", 0.08)
                  : alpha(PRIMARY_RED, 0.06),
              border: `1px solid ${
                isTimeCritical
                  ? alpha("#dc2626", 0.3)
                  : isTimeWarning
                    ? alpha("#f59e0b", 0.3)
                    : alpha(PRIMARY_RED, 0.15)
              }`,
            }}
          >
            <TimerIcon
              sx={{
                fontSize: 16,
                color: isTimeCritical
                  ? "#dc2626"
                  : isTimeWarning
                    ? "#d97706"
                    : PRIMARY_RED,
                animation: isTimeCritical
                  ? "pulse 1s ease-in-out infinite"
                  : "none",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.4 },
                },
              }}
            />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 800,
                fontVariantNumeric: "tabular-nums",
                color: isTimeCritical
                  ? "#dc2626"
                  : isTimeWarning
                    ? "#d97706"
                    : PRIMARY_RED,
                fontSize: "0.85rem",
                letterSpacing: "0.05em",
              }}
            >
              {formatTime(timeLeft)}
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          size="small"
          startIcon={
            submitting ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <SendIcon />
            )
          }
          onClick={() => setConfirmOpen(true)}
          disabled={submitting}
          sx={{
            bgcolor: PRIMARY_RED,
            fontWeight: 700,
            borderRadius: 1.5,
            flexShrink: 0,
            "&:hover": { bgcolor: PRIMARY_RED_DARK },
          }}
        >
          Nộp bài
        </Button>
      </Box>

      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 3,
          bgcolor: alpha(PRIMARY_RED, 0.1),
          "& .MuiLinearProgress-bar": { bgcolor: PRIMARY_RED },
          flexShrink: 0,
        }}
      />

      {/* Main content */}
      <Box sx={{ flex: 1, overflow: "auto", display: "flex", gap: 0 }}>
        {/* Question panel */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            py: { xs: 3, md: 5 },
            px: { xs: 2, md: 6 },
            maxWidth: 720,
            mx: "auto",
            width: "100%",
          }}
        >
          {/* Question header */}
          <Box sx={{ mb: 3 }}>
            <Stack
              sx={{
                mb: 1.5,
                alignItems: "center",
                flexDirection: "row",
                gap: 1,
              }}
            >
              <Chip
                label={`Câu ${currentQuestion + 1}/${total}`}
                size="small"
                sx={{
                  bgcolor: PRIMARY_RED,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  height: 22,
                }}
              />
              {isMulti && (
                <Chip
                  label="Nhiều đáp án"
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: alpha(PRIMARY_RED, 0.4),
                    color: PRIMARY_RED,
                    fontSize: "0.65rem",
                    height: 22,
                    fontWeight: 600,
                  }}
                />
              )}
              <Box sx={{ flex: 1 }} />
              <Tooltip
                title={
                  flagged.has(currentQuestion)
                    ? "Bỏ đánh dấu"
                    : "Đánh dấu câu này"
                }
              >
                <IconButton
                  size="small"
                  onClick={() => toggleFlag(currentQuestion)}
                  sx={{
                    color: flagged.has(currentQuestion)
                      ? "#f59e0b"
                      : "text.disabled",
                    "&:hover": { color: "#f59e0b" },
                  }}
                >
                  <FlagIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Stack>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                lineHeight: 1.5,
                color: "text.primary",
                fontSize: { xs: "1rem", md: "1.1rem" },
              }}
            >
              {cauHoi.noiDung}
            </Typography>
            {isMulti && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                Chọn tất cả đáp án đúng
              </Typography>
            )}
          </Box>

          {/* Answers */}
          <Stack
            sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 1.25 }}
          >
            {danhSachDapAn.map((dapAn, idx) => {
              const isSelected =
                selectedAnswers[cauHoi.id]?.includes(dapAn.id) ?? false;
              const letter = String.fromCharCode(65 + idx); // A, B, C, D…

              return (
                <Box
                  key={dapAn.id}
                  onClick={() => onSelectAnswer(cauHoi.id, dapAn.id, isMulti)}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    cursor: "pointer",
                    border: "2px solid",
                    borderColor: isSelected ? PRIMARY_RED : alpha("#000", 0.1),
                    bgcolor: isSelected ? alpha(PRIMARY_RED, 0.04) : "#fff",
                    transition: "all 0.15s",
                    "&:hover": {
                      borderColor: alpha(PRIMARY_RED, 0.5),
                      bgcolor: alpha(PRIMARY_RED, 0.025),
                    },
                    userSelect: "none",
                  }}
                >
                  {/* Checkbox / Radio icon */}
                  <Box sx={{ mt: 0.1, flexShrink: 0 }}>
                    {isMulti ? (
                      isSelected ? (
                        <CheckBoxIcon
                          sx={{ color: PRIMARY_RED, fontSize: 20 }}
                        />
                      ) : (
                        <CheckBoxOutlineBlankIcon
                          sx={{ color: "text.disabled", fontSize: 20 }}
                        />
                      )
                    ) : isSelected ? (
                      <CheckCircleIcon
                        sx={{ color: PRIMARY_RED, fontSize: 20 }}
                      />
                    ) : (
                      <RadioButtonUncheckedIcon
                        sx={{ color: "text.disabled", fontSize: 20 }}
                      />
                    )}
                  </Box>

                  {/* Letter badge */}
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: isSelected ? PRIMARY_RED : alpha("#000", 0.06),
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        color: isSelected ? "#fff" : "text.secondary",
                        lineHeight: 1,
                      }}
                    >
                      {letter}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      lineHeight: 1.55,
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? "text.primary" : "text.secondary",
                      flex: 1,
                    }}
                  >
                    {dapAn.noiDung}
                  </Typography>
                </Box>
              );
            })}
          </Stack>

          {/* Navigation */}
          <Stack
            sx={{ mt: "auto", display: "flex", flexDirection: "row", gap: 1.5 }}
          >
            <Button
              variant="outlined"
              startIcon={<NavigateBeforeIcon />}
              onClick={() => onGoToQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              sx={{
                borderColor: alpha(PRIMARY_RED, 0.35),
                color: PRIMARY_RED,
                fontWeight: 600,
                borderRadius: 1.5,
                "&:hover": {
                  borderColor: PRIMARY_RED,
                  bgcolor: alpha(PRIMARY_RED, 0.04),
                },
                "&.Mui-disabled": { borderColor: "divider" },
              }}
            >
              Câu trước
            </Button>
            <Box sx={{ flex: 1 }} />
            {currentQuestion < total - 1 ? (
              <Button
                variant="contained"
                endIcon={<NavigateNextIcon />}
                onClick={() => onGoToQuestion(currentQuestion + 1)}
                sx={{
                  bgcolor: PRIMARY_RED,
                  fontWeight: 700,
                  borderRadius: 1.5,
                  "&:hover": { bgcolor: PRIMARY_RED_DARK },
                }}
              >
                Câu tiếp
              </Button>
            ) : (
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                onClick={() => setConfirmOpen(true)}
                sx={{
                  bgcolor: PRIMARY_RED,
                  fontWeight: 700,
                  borderRadius: 1.5,
                  "&:hover": { bgcolor: PRIMARY_RED_DARK },
                }}
              >
                Nộp bài
              </Button>
            )}
          </Stack>
        </Box>

        {/* Question navigator sidebar */}
        <Box
          sx={{
            width: 200,
            flexShrink: 0,
            borderLeft: `1px solid ${alpha(PRIMARY_RED, 0.1)}`,
            bgcolor: "#fff",
            py: 2.5,
            px: 2,
            display: { xs: "none", md: "block" },
            overflowY: "auto",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              color: "text.secondary",
              letterSpacing: "0.08em",
              display: "block",
              mb: 1.5,
              fontSize: "0.65rem",
            }}
          >
            DANH SÁCH CÂU HỎI
          </Typography>

          {/* Legend */}
          <Stack
            sx={{ mb: 2, display: "flex", flexDirection: "column", gap: 0.5 }}
          >
            {[
              { color: PRIMARY_RED, label: "Đang làm", fill: true },
              { color: PRIMARY_RED, label: "Đã trả lời", fill: false },
              { color: "#f59e0b", label: "Đánh dấu", fill: false },
              { color: alpha("#000", 0.15), label: "Chưa làm", fill: false },
            ].map((l) => (
              <Stack
                key={l.label}
                sx={{ flexDirection: "row", gap: 1, alignItems: "center" }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 0.5,
                    bgcolor: l.fill ? l.color : "transparent",
                    border: `2px solid ${l.color}`,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "0.62rem" }}
                >
                  {l.label}
                </Typography>
              </Stack>
            ))}
          </Stack>

          {/* Grid */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {danhSachCauHoi.map((_, idx) => {
              const status = getQuestionStatus(idx);
              const bgMap = {
                current: PRIMARY_RED,
                answered: "transparent",
                flagged: "transparent",
                empty: alpha("#000", 0.04),
              };
              const borderMap = {
                current: PRIMARY_RED,
                answered: PRIMARY_RED,
                flagged: "#f59e0b",
                empty: alpha("#000", 0.15),
              };
              const colorMap = {
                current: "#fff",
                answered: PRIMARY_RED,
                flagged: "#d97706",
                empty: "text.secondary",
              };

              return (
                <Box
                  key={idx}
                  onClick={() => onGoToQuestion(idx)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    bgcolor: bgMap[status],
                    border: `2px solid ${borderMap[status]}`,
                    transition: "all 0.12s",
                    "&:hover": { transform: "scale(1.1)" },
                    position: "relative",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.68rem",
                      fontWeight: status === "current" ? 800 : 600,
                      color: colorMap[status],
                      lineHeight: 1,
                    }}
                  >
                    {idx + 1}
                  </Typography>
                  {flagged.has(idx) && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -4,
                        right: -4,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#f59e0b",
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Summary */}
          <Box
            sx={{
              mt: 2.5,
              pt: 2,
              borderTop: `1px solid ${alpha(PRIMARY_RED, 0.1)}`,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 0.25 }}
            >
              Đã làm: <strong style={{ color: PRIMARY_RED }}>{answered}</strong>
              /{total}
            </Typography>
            {flagged.size > 0 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 0.25 }}
              >
                Đánh dấu:{" "}
                <strong style={{ color: "#d97706" }}>{flagged.size}</strong>
              </Typography>
            )}
            {unanswered > 0 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
              >
                Chưa làm:{" "}
                <strong style={{ color: "#374151" }}>{unanswered}</strong>
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Confirm submit dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Xác nhận nộp bài
        </DialogTitle>
        <DialogContent>
          {unanswered > 0 && (
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.25,
                bgcolor: alpha("#f59e0b", 0.08),
                border: `1px solid ${alpha("#f59e0b", 0.3)}`,
                borderRadius: 1.5,
                px: 2,
                py: 1.5,
                mb: 2,
              }}
            >
              <WarningAmberIcon
                sx={{ color: "#d97706", fontSize: 20, mt: 0.1, flexShrink: 0 }}
              />
              <Typography
                variant="body2"
                sx={{ color: "#92400e", lineHeight: 1.5 }}
              >
                Bạn còn <strong>{unanswered} câu</strong> chưa trả lời. Câu chưa
                trả lời sẽ bị tính là sai.
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="text.secondary">
            Bạn có chắc muốn nộp bài không? Sau khi nộp bạn sẽ không thể thay
            đổi câu trả lời.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            variant="outlined"
            sx={{
              borderColor: "divider",
              color: "text.secondary",
              borderRadius: 1.5,
              fontWeight: 600,
            }}
          >
            Quay lại
          </Button>
          <Button
            onClick={() => {
              setConfirmOpen(false);
              onSubmit();
            }}
            variant="contained"
            disabled={submitting}
            sx={{
              bgcolor: PRIMARY_RED,
              fontWeight: 700,
              borderRadius: 1.5,
              "&:hover": { bgcolor: PRIMARY_RED_DARK },
            }}
          >
            {submitting ? "Đang nộp..." : "Nộp bài"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
