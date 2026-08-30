// QuizView.tsx
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  AccessTimeRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  SendRounded,
  GridViewRounded,
  CheckRounded,
} from "@mui/icons-material";
import { useState } from "react";
import type { CauHoiLamBaiDto } from "../../hooks/useQuiz";
import { isMultiChoice } from "../../hooks/useQuiz";
import { BRAND, STATUS } from "@/src/theme/tokens";
import { cleanHtmlContent, isHtmlContent, stripHtml } from "@/src/utils/htmlHelpers";

// ── Design tokens ──
const RED = BRAND.main;
const RED_DARK = "#6B1414";
const RED_TINT = "rgba(139,19,19,0.04)";
const INK = "#1c1d1f";
const SUB = "#6a6f73";
const BORDER = "#e2e5e8";
const GREEN = STATUS.success;
const RADIUS = "4px";
const LABELS = ["A", "B", "C", "D", "E", "F"];

interface CauHoiGridProps {
  cauHois: CauHoiLamBaiDto[];
  cauHoiHienTai: number;
  traLois: Record<string, string[]>;
  onPick: (i: number) => void;
}

function CauHoiGrid({
  cauHois,
  cauHoiHienTai,
  traLois,
  onPick,
}: CauHoiGridProps) {
  return (
    <Box
      sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1 }}
    >
      {cauHois.map((c, i) => {
        const daTraLoi = (traLois[c.id] ?? []).length > 0;
        const isHienTai = i === cauHoiHienTai;
        return (
          <Box
            key={c.id}
            onClick={() => onPick(i)}
            sx={{
              aspectRatio: "1 / 1",
              borderRadius: RADIUS,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 13,
              border: `1.5px solid ${isHienTai ? RED : daTraLoi ? "rgba(16,185,129,0.4)" : BORDER}`,
              bgcolor: isHienTai
                ? RED
                : daTraLoi
                  ? "rgba(16,185,129,0.08)"
                  : "#fff",
              color: isHienTai ? "#fff" : daTraLoi ? GREEN : SUB,
              transition: "all 0.15s",
              "&:hover": { borderColor: RED, transform: "translateY(-1px)" },
            }}
          >
            {i + 1}
          </Box>
        );
      })}
    </Box>
  );
}

interface QuizViewProps {
  cauHois: CauHoiLamBaiDto[];
  traLois: Record<string, string[]>;
  cauHoiHienTai: number;
  thoiGianConLai: number;
  coGioiHanThoiGian: boolean;
  formatTimer: (s: number) => string;
  loading: boolean;
  onChonDapAn: (idCauHoi: string, idDapAn: string) => void;
  onSetCauHoi: (i: number) => void;
  onNopBai: () => void;
}

export function QuizView({
  cauHois,
  traLois,
  cauHoiHienTai,
  thoiGianConLai,
  coGioiHanThoiGian,
  formatTimer,
  loading,
  onChonDapAn,
  onSetCauHoi,
  onNopBai,
}: QuizViewProps) {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openOverview, setOpenOverview] = useState(false);

  const cauHoi = cauHois[cauHoiHienTai];
  const tongCau = cauHois.length;
  const soDaTraLoi = cauHois.filter(
    (c) => (traLois[c.id] ?? []).length > 0,
  ).length;
  const tatCaDaTraLoi = soDaTraLoi === tongCau;
  const progress = tongCau > 0 ? ((cauHoiHienTai + 1) / tongCau) * 100 : 0;

  const sapHetGio = coGioiHanThoiGian && thoiGianConLai <= 60;
  const canhoHetGio = coGioiHanThoiGian && thoiGianConLai <= 180;
  const isMulti = isMultiChoice(cauHoi?.loaiCauHoi);

  if (!cauHoi) return null;

  const selected = traLois[cauHoi.id] ?? [];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "#fafafa",
      }}
    >
      {/* Top bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          borderBottom: `1px solid ${BORDER}`,
          bgcolor: "#fff",
          flexShrink: 0,
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: RADIUS,
              bgcolor: RED_TINT,
              color: RED,
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {cauHoiHienTai + 1}
            <Typography
              component="span"
              sx={{ fontSize: 13, fontWeight: 600, color: SUB }}
            >
              {" "}
              / {tongCau}
            </Typography>
          </Box>
          {isMulti && (
            <Chip
              label="Chọn nhiều đáp án"
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: 11,
                height: 22,
                borderRadius: RADIUS,
                bgcolor: "rgba(59,130,246,0.08)",
                color: "#1E40AF",
              }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          {coGioiHanThoiGian && (
            <Chip
              icon={<AccessTimeRounded sx={{ fontSize: 16 }} />}
              label={formatTimer(thoiGianConLai)}
              size="small"
              sx={{
                fontWeight: 700,
                fontFamily: "monospace",
                fontSize: 14,
                borderRadius: RADIUS,
                bgcolor: sapHetGio
                  ? "rgba(220,38,38,0.08)"
                  : canhoHetGio
                    ? "rgba(245,158,11,0.08)"
                    : "#f7f9fa",
                color: sapHetGio ? STATUS.error : canhoHetGio ? "#92400e" : SUB,
                animation: sapHetGio ? "blink 1s step-end infinite" : "none",
                "@keyframes blink": {
                  "0%,100%": { opacity: 1 },
                  "50%": { opacity: 0.4 },
                },
                "& .MuiChip-icon": { color: "inherit !important" },
              }}
            />
          )}
          <Tooltip title="Danh sách câu hỏi">
            <IconButton
              size="small"
              onClick={() => setOpenOverview(true)}
              sx={{
                display: { xs: "inline-flex", md: "none" },
                borderRadius: RADIUS,
                bgcolor: "#f7f9fa",
                border: `1px solid ${BORDER}`,
                "&:hover": { bgcolor: RED_TINT, borderColor: RED },
              }}
            >
              <GridViewRounded sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Progress */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 3,
          bgcolor: "#eceef0",
          "& .MuiLinearProgress-bar": { bgcolor: RED },
        }}
      />

      {/* Content */}
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Box sx={{ flex: 1, overflow: "auto", p: { xs: 2.5, md: 4 } }}>
          <Box sx={{ maxWidth: 760, mx: "auto" }}>
            <Box
              sx={{
                bgcolor: "#fff",
                border: `1px solid ${BORDER}`,
                borderRadius: RADIUS,
                p: { xs: 2.5, md: 3.5 },
                mb: 2.5,
              }}
            >
              {(() => {
                const cleanedTitle = cleanHtmlContent(cauHoi.tenCauHoi);
                const cleanedNoiDung = cleanHtmlContent(cauHoi.noiDungCauHoi);
                const hasDistinctNoiDung =
                  Boolean(cleanedNoiDung) &&
                  cleanedNoiDung !== cleanedTitle &&
                  stripHtml(cleanedNoiDung) !== stripHtml(cleanedTitle);
                const isTitleHtml = isHtmlContent(cleanedTitle);
                const isNoiDungHtml = isHtmlContent(cleanedNoiDung);

                return (
                  <>
                    {isTitleHtml ? (
                      <Box
                        sx={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: INK,
                          lineHeight: 1.5,
                          mb: 0.5,
                          "& p": { m: 0 },
                        }}
                        dangerouslySetInnerHTML={{ __html: cleanedTitle }}
                      />
                    ) : (
                      <Typography
                        sx={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: INK,
                          lineHeight: 1.5,
                          mb: 0.5,
                        }}
                      >
                        {cleanedTitle}
                      </Typography>
                    )}

                    {hasDistinctNoiDung && (
                      isNoiDungHtml ? (
                        <Box
                          sx={{
                            fontSize: 14,
                            color: "#3c3d40",
                            lineHeight: 1.7,
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
                            "& table": {
                              borderCollapse: "collapse",
                              width: "100%",
                              my: 1,
                            },
                            "& td, & th": {
                              border: `1px solid ${BORDER}`,
                              p: 1,
                              fontSize: 13,
                            },
                          }}
                          dangerouslySetInnerHTML={{ __html: cleanedNoiDung }}
                        />
                      ) : (
                        <Typography
                          sx={{
                            fontSize: 14,
                            color: "#3c3d40",
                            lineHeight: 1.7,
                          }}
                        >
                          {cleanedNoiDung}
                        </Typography>
                      )
                    )}
                  </>
                );
              })()}
              {cauHoi.diem && (
                <Typography
                  sx={{ fontSize: 12, color: SUB, mt: 1, fontWeight: 600 }}
                >
                  {cauHoi.diem} điểm
                </Typography>
              )}
            </Box>

            {/* Đáp án */}
            <Stack spacing={1.25}>
              {cauHoi.dapAns.map((da, i) => {
                const isSelected = selected.includes(da.id);
                const rawAnswer = da.noiDungDapAn ?? "";
                const answerText = cleanHtmlContent(rawAnswer);
                const isAnswerHtml = isHtmlContent(answerText);
                return (
                  <Box
                    key={da.id}
                    onClick={() => onChonDapAn(cauHoi.id, da.id)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 2,
                      borderRadius: RADIUS,
                      cursor: "pointer",
                      border: `1.5px solid ${isSelected ? RED : BORDER}`,
                      bgcolor: isSelected ? RED_TINT : "#fff",
                      transition:
                        "border-color 0.15s, background-color 0.15s, box-shadow 0.15s",
                      boxShadow: isSelected ? `0 1px 0 ${RED_TINT}` : "none",
                      "&:hover": { borderColor: isSelected ? RED : "#a4a9ac" },
                    }}
                  >
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: isMulti ? "6px" : "50%",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `1.5px solid ${isSelected ? RED : "#a4a9ac"}`,
                        bgcolor: isSelected ? RED : "transparent",
                        color: isSelected ? "#fff" : SUB,
                        fontWeight: 700,
                        fontSize: 12.5,
                        transition: "all 0.15s",
                      }}
                    >
                      {isMulti ? (
                        isSelected ? (
                          <CheckRounded sx={{ fontSize: 17 }} />
                        ) : null
                      ) : (
                        (LABELS[i] ?? i + 1)
                      )}
                    </Box>
                    {isAnswerHtml ? (
                      <Box
                        sx={{
                          fontSize: 15,
                          lineHeight: 1.5,
                          flex: 1,
                          fontWeight: isSelected ? 600 : 400,
                          color: isSelected ? RED_DARK : INK,
                          "& p": { m: 0 },
                          "& strong": { fontWeight: 700 },
                        }}
                        dangerouslySetInnerHTML={{ __html: answerText }}
                      />
                    ) : (
                      <Typography
                        sx={{
                          fontSize: 15,
                          lineHeight: 1.5,
                          flex: 1,
                          fontWeight: isSelected ? 600 : 400,
                          color: isSelected ? RED_DARK : INK,
                        }}
                      >
                        {answerText || "(Trống)"}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Box>

        {/* Sidebar */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            width: 288,
            flexShrink: 0,
            borderLeft: `1px solid ${BORDER}`,
            bgcolor: "#fff",
            p: 3,
            overflow: "auto",
          }}
        >
          <Typography
            sx={{ fontSize: 13, fontWeight: 700, color: INK, mb: 0.5 }}
          >
            Danh sách câu hỏi
          </Typography>
          <Typography sx={{ fontSize: 13, color: SUB, mb: 2 }}>
            Đã trả lời <strong style={{ color: RED }}>{soDaTraLoi}</strong>/
            {tongCau}
          </Typography>
          <CauHoiGrid
            cauHois={cauHois}
            cauHoiHienTai={cauHoiHienTai}
            traLois={traLois}
            onPick={onSetCauHoi}
          />
          <Stack spacing={1} sx={{ mt: 3 }}>
            {[
              { c: RED, l: "Đang xem" },
              { c: GREEN, l: "Đã trả lời" },
              { c: BORDER, l: "Chưa trả lời" },
            ].map((item, i) => (
              <Stack
                key={i}
                direction="row"
                spacing={1}
                sx={{ alignItems: "center" }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "3px",
                    border: i === 2 ? `1.5px solid ${BORDER}` : "none",
                    bgcolor: i === 2 ? "transparent" : item.c,
                  }}
                />
                <Typography sx={{ fontSize: 12, color: SUB }}>
                  {item.l}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Navigation */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${BORDER}`,
          bgcolor: "#fff",
          flexShrink: 0,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Button
            variant="outlined"
            startIcon={<ChevronLeftRounded />}
            disabled={cauHoiHienTai === 0}
            onClick={() => onSetCauHoi(cauHoiHienTai - 1)}
            sx={{
              borderRadius: RADIUS,
              fontWeight: 600,
              textTransform: "none",
              borderColor: "#a4a9ac",
              color: "#3c3d40",
              "&:hover": {
                borderColor: RED,
                color: RED,
                bgcolor: "transparent",
              },
              "&:disabled": { borderColor: BORDER, color: "#a4a9ac" },
            }}
          >
            Câu trước
          </Button>
          <Box
            sx={{
              flex: 1,
              textAlign: "center",
              display: { xs: "none", sm: "block" },
            }}
          >
            <Typography sx={{ fontSize: 13, color: SUB, fontWeight: 500 }}>
              Đã trả lời {soDaTraLoi}/{tongCau}
            </Typography>
          </Box>
          {cauHoiHienTai < tongCau - 1 ? (
            <Button
              variant="outlined"
              endIcon={<ChevronRightRounded />}
              onClick={() => onSetCauHoi(cauHoiHienTai + 1)}
              sx={{
                borderRadius: RADIUS,
                fontWeight: 600,
                textTransform: "none",
                borderColor: "#a4a9ac",
                color: "#3c3d40",
                "&:hover": {
                  borderColor: RED,
                  color: RED,
                  bgcolor: "transparent",
                },
              }}
            >
              Câu tiếp
            </Button>
          ) : (
            <Tooltip
              title={
                !tatCaDaTraLoi
                  ? "Bạn cần trả lời tất cả câu hỏi trước khi nộp bài"
                  : ""
              }
            >
              <span>
                <Button
                  variant="contained"
                  endIcon={<SendRounded />}
                  onClick={() => setOpenConfirm(true)}
                  disabled={loading || !tatCaDaTraLoi}
                  sx={{
                    borderRadius: RADIUS,
                    fontWeight: 700,
                    textTransform: "none",
                    bgcolor: RED,
                    boxShadow: "none",
                    "&:hover": { bgcolor: RED_DARK, boxShadow: "none" },
                    "&:disabled": { bgcolor: BORDER, color: SUB },
                  }}
                >
                  Nộp bài
                </Button>
              </span>
            </Tooltip>
          )}
        </Stack>
      </Box>

      {/* Confirm Dialog */}
      <Dialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: RADIUS } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: INK }}>
          Xác nhận nộp bài?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14, color: "#3c3d40", mb: 2 }}>
            Bạn đã trả lời{" "}
            <strong style={{ color: RED }}>
              {soDaTraLoi}/{tongCau}
            </strong>{" "}
            câu hỏi.
          </Typography>
          {!tatCaDaTraLoi ? (
            <Box
              sx={{
                p: 2,
                borderRadius: RADIUS,
                bgcolor: "rgba(220,38,38,0.06)",
                border: "1px solid rgba(220,38,38,0.15)",
              }}
            >
              <Typography
                sx={{ fontSize: 13, color: STATUS.error, fontWeight: 600 }}
              >
                ⚠️ Bạn cần trả lời tất cả {tongCau} câu hỏi trước khi nộp bài.
                Còn {tongCau - soDaTraLoi} câu chưa trả lời.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                p: 2,
                borderRadius: RADIUS,
                bgcolor: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.15)",
              }}
            >
              <Typography
                sx={{ fontSize: 13, color: STATUS.success, fontWeight: 500 }}
              >
                ✅ Bạn đã trả lời tất cả câu hỏi.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setOpenConfirm(false)}
            sx={{
              color: SUB,
              borderRadius: RADIUS,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Quay lại
          </Button>
          <Button
            variant="contained"
            disabled={loading || !tatCaDaTraLoi}
            onClick={() => {
              setOpenConfirm(false);
              onNopBai();
            }}
            sx={{
              bgcolor: RED,
              borderRadius: RADIUS,
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { bgcolor: RED_DARK },
              "&:disabled": { bgcolor: BORDER, color: SUB },
            }}
          >
            Nộp bài
          </Button>
        </DialogActions>
      </Dialog>

      {/* Overview Dialog - Mobile */}
      <Dialog
        open={openOverview}
        onClose={() => setOpenOverview(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: RADIUS } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: INK, pb: 0.5 }}>
          Danh sách câu hỏi
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, color: SUB, mb: 2 }}>
            Đã trả lời:{" "}
            <strong style={{ color: INK }}>
              {soDaTraLoi}/{tongCau}
            </strong>
          </Typography>
          <CauHoiGrid
            cauHois={cauHois}
            cauHoiHienTai={cauHoiHienTai}
            traLois={traLois}
            onPick={(i) => {
              onSetCauHoi(i);
              setOpenOverview(false);
            }}
          />
          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 2.5, flexWrap: "wrap", rowGap: 1 }}
          >
            {[
              { c: RED, l: "Đang xem" },
              { c: GREEN, l: "Đã trả lời" },
              { c: BORDER, l: "Chưa trả lời" },
            ].map((item, i) => (
              <Stack
                key={i}
                direction="row"
                spacing={1}
                sx={{ alignItems: "center" }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "3px",
                    border: i === 2 ? `1.5px solid ${BORDER}` : "none",
                    bgcolor: i === 2 ? "transparent" : item.c,
                  }}
                />
                <Typography sx={{ fontSize: 12, color: SUB }}>
                  {item.l}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            variant="contained"
            fullWidth
            disabled={!tatCaDaTraLoi}
            onClick={() => {
              setOpenConfirm(true);
              setOpenOverview(false);
            }}
            sx={{
              bgcolor: RED,
              borderRadius: RADIUS,
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { bgcolor: RED_DARK },
              "&:disabled": { bgcolor: BORDER, color: SUB },
            }}
          >
            {tatCaDaTraLoi ? "Nộp bài ngay" : "Chưa trả lời hết"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
