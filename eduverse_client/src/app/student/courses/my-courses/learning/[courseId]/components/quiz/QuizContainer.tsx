"use client";

import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Divider,
  Alert,
  LinearProgress,
  Chip,
} from "@mui/material";
import {
  PlayArrowRounded,
  ReplayRounded,
  LockRounded,
  HistoryRounded,
  ChevronRightRounded,
} from "@mui/icons-material";
import type { BaiKiemTraInfoDto, LichSuLamBaiDto } from "../../hooks/useQuiz";
import { BRAND, STATUS, CSSVAR } from "@/src/theme/tokens";

// ── Design tokens — dùng chung tông đỏ với QuizView / QuizResult / QuizReview ──
const RED = BRAND.main;
const RED_DARK = "#6B1414";
const RED_TINT = "rgba(139,19,19,0.04)";
const INK = "#1c1d1f";
const SUB = "#6a6f73";
const BORDER = "#d1d7dc";
const GREEN = STATUS.success;
const RADIUS = "10px";
const RADIUS_SM = "6px";
const FONT = "Inter, sans-serif";

interface QuizContainerProps {
  info: BaiKiemTraInfoDto;
  lichSu: LichSuLamBaiDto[];
  canRetake: boolean;
  loading: boolean;
  lanLamDoDang?: LichSuLamBaiDto;
  error?: string;
  onBatDau: () => void;
  onTiepTuc: (id: string) => void;
  onXemLai: (id: string) => void;
  onSkip: () => void; // 🆕 Thêm prop để xử lý bỏ qua
}

export function QuizContainer({
  info,
  lichSu,
  canRetake,
  loading,
  lanLamDoDang,
  error,
  onBatDau,
  onTiepTuc,
  onXemLai,
  onSkip,
}: QuizContainerProps) {
  const soLanDaLam = lichSu.length;
  const daLam = soLanDaLam > 0;
  const hetLuot = !canRetake && soLanDaLam > 0;
  const daNop = lichSu.filter((l) => l.thoiGianNop);
  const diemCaoNhat =
    daNop.length > 0 ? Math.max(...daNop.map((l) => l.tongDiem ?? 0)) : null;
  const daDatLanNao = lichSu.some((l) => l.dat);
  const soCauHoi = info.soCauHoi ?? 0;

  return (
    <Box
      sx={{
        maxWidth: 640,
        mx: "auto",
        py: { xs: 5, md: 7 },
        px: { xs: 3, md: 4 },
        fontFamily: FONT,
      }}
    >
      {/* Tiêu đề */}
      <Typography
        sx={{
          fontFamily: FONT,
          fontWeight: 800,
          color: INK,
          mb: 1,
          letterSpacing: "-0.01em",
          lineHeight: 1.3,
          fontSize: { xs: 22, sm: 27 },
        }}
      >
        {info.tenBaiKiemTra}
      </Typography>

      {/* Dòng meta — ngăn cách bằng dấu | */}
      <Stack
        direction="row"
        spacing={1.25}
        sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.5, mb: 2.5 }}
      >
        <Typography
          sx={{ fontFamily: FONT, fontSize: 14, color: SUB, fontWeight: 500 }}
        >
          Bài kiểm tra
        </Typography>
        <Typography sx={{ fontFamily: FONT, fontSize: 14, color: BORDER }}>
          |
        </Typography>
        <Typography
          sx={{ fontFamily: FONT, fontSize: 14, color: SUB, fontWeight: 500 }}
        >
          {soCauHoi} câu hỏi
        </Typography>
        {daLam && (
          <>
            <Typography sx={{ fontFamily: FONT, fontSize: 14, color: BORDER }}>
              |
            </Typography>
            <Typography
              sx={{
                fontFamily: FONT,
                fontSize: 14,
                color: SUB,
                fontWeight: 500,
              }}
            >
              Đã làm {soLanDaLam} lần
            </Typography>
          </>
        )}
        {daLam && !lanLamDoDang && diemCaoNhat != null && (
          <>
            <Typography sx={{ fontFamily: FONT, fontSize: 14, color: BORDER }}>
              |
            </Typography>
            <Typography
              sx={{
                fontFamily: FONT,
                fontSize: 14,
                fontWeight: 700,
                color: daDatLanNao ? GREEN : RED,
              }}
            >
              {daDatLanNao ? "Đã đạt" : `Cao nhất ${diemCaoNhat.toFixed(1)}đ`}
            </Typography>
          </>
        )}
      </Stack>

      {/* Mô tả HTML */}
      {info.moTa && (
        <Box
          sx={{
            fontFamily: FONT,
            fontSize: 15,
            color: "#3c3d40",
            lineHeight: 1.7,
            mb: 3.5,
            maxWidth: "100%",
            "& p": { mb: 1 },
            "& ul": { pl: 2.5, mb: 1 },
            "& li": { mb: 0.5 },
            "& b, & strong": { fontWeight: 700, color: INK },
          }}
          dangerouslySetInnerHTML={{ __html: info.moTa }}
        />
      )}

      {/* Thanh điểm cao nhất */}
      {daLam && !lanLamDoDang && diemCaoNhat != null && (
        <Box sx={{ maxWidth: 280, mb: 3 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, diemCaoNhat)}
            sx={{
              height: 4,
              borderRadius: 3,
              bgcolor: "rgba(0,0,0,0.06)",
              "& .MuiLinearProgress-bar": {
                bgcolor: daDatLanNao ? GREEN : RED,
                borderRadius: 3,
              },
            }}
          />
        </Box>
      )}

      {/* Cảnh báo bài làm dở */}
      {lanLamDoDang && (
        <Alert
          severity="warning"
          sx={{
            width: "100%",
            mb: 3,
            borderRadius: RADIUS_SM,
            fontFamily: FONT,
            "& .MuiAlert-action": { pt: 0 },
          }}
          action={
            <Button
              size="small"
              sx={{ fontFamily: FONT, fontWeight: 700, color: "#92400e" }}
              onClick={() => onTiepTuc(lanLamDoDang.idLanLamBaiKiemTra)}
            >
              Tiếp tục
            </Button>
          }
        >
          Bạn có bài làm chưa hoàn thành (lần {lanLamDoDang.lamLanThu}).
        </Alert>
      )}

      {/* Nút bấm */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1.5 }}
      >
        {hetLuot ? (
          <Button
            variant="contained"
            disabled
            startIcon={<LockRounded />}
            sx={{
              py: 1.35,
              px: 3.5,
              borderRadius: RADIUS,
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 15,
              textTransform: "none",
              bgcolor: "#E5E7EB",
              color: CSSVAR.grey,
              boxShadow: "none",
            }}
          >
            Đã hết lượt làm bài
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={onBatDau}
            disabled={loading || !!lanLamDoDang}
            startIcon={
              loading ? (
                <CircularProgress size={16} sx={{ color: "#fff" }} />
              ) : daLam ? (
                <ReplayRounded sx={{ fontSize: 18 }} />
              ) : (
                <PlayArrowRounded sx={{ fontSize: 18 }} />
              )
            }
            sx={{
              py: 1.35,
              px: 3.5,
              borderRadius: RADIUS,
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 15,
              textTransform: "none",
              bgcolor: RED,
              boxShadow: "0 2px 6px rgba(139,19,19,0.25)",
              transition: "all 0.18s ease",
              "&:hover": {
                bgcolor: RED_DARK,
                boxShadow: "0 4px 12px rgba(139,19,19,0.32)",
                transform: "translateY(-1px)",
              },
              "&:active": {
                transform: "translateY(0)",
              },
              "&:disabled": {
                bgcolor: "#E5E7EB",
                color: CSSVAR.grey,
                boxShadow: "none",
              },
            }}
          >
            {loading
              ? "Đang chuẩn bị..."
              : daLam
                ? "Làm lại bài kiểm tra"
                : "Bắt đầu bài kiểm tra"}
          </Button>
        )}

        {!hetLuot && (
          <Button
            onClick={onSkip} // 🆕 Đã thay đổi: gọi onSkip thay vì onXemLai
            sx={{
              py: 1.35,
              px: 2.5,
              borderRadius: RADIUS,
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 15,
              textTransform: "none",
              color: INK,
              transition: "all 0.18s ease",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.04)",
              },
            }}
          >
            Bỏ qua bài kiểm tra
          </Button>
        )}
      </Stack>

      {/* Lỗi */}
      {error && (
        <Alert
          severity="error"
          sx={{
            width: "100%",
            mt: 3,
            borderRadius: RADIUS_SM,
            fontFamily: FONT,
          }}
        >
          {error}
        </Alert>
      )}

      {/* Lịch sử làm bài */}
      {daNop.length > 0 && (
        <>
          <Divider sx={{ width: "100%", opacity: 0.6, my: 4.5 }} />
          <Typography
            sx={{
              fontFamily: FONT,
              fontSize: 13,
              fontWeight: 700,
              color: SUB,
              mb: 1.5,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Lịch sử làm bài
          </Typography>
          <Stack spacing={1} sx={{ width: "100%" }}>
            {daNop.slice(0, 3).map((l) => (
              <Box
                key={l.idLanLamBaiKiemTra}
                onClick={() => onXemLai(l.idLanLamBaiKiemTra)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.75,
                  borderRadius: RADIUS_SM,
                  cursor: "pointer",
                  border: `1px solid ${BORDER}`,
                  bgcolor: "#fff",
                  transition: "border-color 0.15s, background-color 0.15s",
                  "&:hover": {
                    borderColor: RED,
                    bgcolor: RED_TINT,
                  },
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: "center" }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: RADIUS_SM,
                      bgcolor: "#f7f9fa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <HistoryRounded sx={{ fontSize: 16, color: SUB }} />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: FONT,
                        fontSize: 13,
                        fontWeight: 700,
                        color: INK,
                      }}
                    >
                      Lần {l.lamLanThu}
                    </Typography>
                    <Typography
                      sx={{ fontFamily: FONT, fontSize: 12, color: SUB }}
                    >
                      {l.thoiGianNop
                        ? new Date(l.thoiGianNop).toLocaleDateString("vi-VN")
                        : ""}
                    </Typography>
                  </Box>
                </Stack>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <Chip
                    label={l.dat ? "Đạt" : "Chưa đạt"}
                    size="small"
                    sx={{
                      height: 22,
                      fontFamily: FONT,
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: RADIUS_SM,
                      bgcolor: l.dat ? "rgba(16,185,129,0.1)" : RED_TINT,
                      color: l.dat ? GREEN : RED,
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: FONT,
                      fontSize: 14,
                      fontWeight: 800,
                      color: INK,
                      minWidth: 44,
                      textAlign: "right",
                    }}
                  >
                    {l.tongDiem?.toFixed(1) ?? "—"}đ
                  </Typography>
                  <ChevronRightRounded
                    sx={{ fontSize: 18, color: "#a4a9ac" }}
                  />
                </Stack>
              </Box>
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
}
