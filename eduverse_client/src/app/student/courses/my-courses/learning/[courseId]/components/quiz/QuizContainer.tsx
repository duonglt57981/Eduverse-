/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Chip,
  alpha,
} from "@mui/material";
import {
  PlayArrowRounded,
  ReplayRounded,
  LockRounded,
  SchoolRounded,
  CheckCircleRounded,
  ArrowForwardRounded,
} from "@mui/icons-material";
import type { BaiKiemTraInfoDto, LichSuLamBaiDto } from "../../hooks/useQuiz";
import { BRAND, STATUS, CSSVAR, FONT_FAMILY } from "@/src/theme/tokens";

// ── Design tokens — Tông đỏ chủ đạo ──
const RED = BRAND.main;
const RED_DARK = "#6B1414";
const GREEN = STATUS.success;
const INK = "#1c1d1f";
const SUB = "#6a6f73";
const BORDER = "#d1d7dc";
const RADIUS = "8px";
const FONT = FONT_FAMILY;

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
  onSkip: () => void;
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
      {/* Tiêu đề & Tag Đạt */}
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: "center", flexWrap: "wrap", mb: 1.5 }}
      >
        <Typography
          sx={{
            fontFamily: FONT,
            fontWeight: 800,
            color: INK,
            letterSpacing: "-0.01em",
            lineHeight: 1.3,
            fontSize: { xs: 22, sm: 26 },
          }}
        >
          {info.tenBaiKiemTra}
        </Typography>

        {daDatLanNao && (
          <Chip
            icon={
              <CheckCircleRounded
                sx={{
                  fontSize: "15px !important",
                  color: `${GREEN} !important`,
                }}
              />
            }
            label="Đã đạt"
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: 12,
              height: 26,
              borderRadius: "6px",
              bgcolor: alpha(GREEN, 0.12),
              color: GREEN,
            }}
          />
        )}
      </Stack>

      {/* Dòng thông tin meta — đơn giản & gọn gàng */}
      <Stack
        direction="row"
        spacing={1.25}
        sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.5, mb: 3 }}
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
        {info.gioiHanThoiGian ? (
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
              {info.gioiHanThoiGian} phút
            </Typography>
          </>
        ) : null}
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
              {daDatLanNao ? "Đạt" : `Cao nhất: ${diemCaoNhat.toFixed(1)}đ`}
            </Typography>
          </>
        )}
      </Stack>

      {/* Mô tả nội dung */}
      {info.moTa && (
        <Box
          sx={{
            fontFamily: FONT,
            fontSize: 15,
            color: "#3c3d40",
            lineHeight: 1.7,
            mb: 4,
            maxWidth: "100%",
            "& p": { mb: 1 },
            "& p:last-child": { mb: 0 },
            "& ul": { pl: 2.5, mb: 1 },
            "& li": { mb: 0.5 },
            "& b, & strong": { fontWeight: 700, color: INK },
          }}
          dangerouslySetInnerHTML={{ __html: info.moTa }}
        />
      )}

      {/* Cảnh báo bài làm dở */}
      {lanLamDoDang && (
        <Alert
          severity="warning"
          sx={{
            width: "100%",
            mb: 3.5,
            borderRadius: RADIUS,
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

      {/* Nút bấm hành động — tông đỏ chủ đạo */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1.5 }}
      >
        {/* Nút Bắt đầu / Làm lại */}
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
              boxShadow: "0 2px 8px rgba(139,19,19,0.25)",
              transition: "all 0.18s ease",
              "&:hover": {
                bgcolor: RED_DARK,
                boxShadow: "0 4px 14px rgba(139,19,19,0.35)",
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

        {/* Nút Xem đáp án — Chỉ hiển thị khi ĐÃ CÓ LẦN ĐẠT */}
        {daDatLanNao && (
          <Button
            variant="outlined"
            onClick={() => {
              const lanDat =
                lichSu.find(
                  (l) => (l.dat === true || (l as any).dat) && l.thoiGianNop,
                ) ||
                lichSu.find((l) => l.thoiGianNop) ||
                lichSu[0];
              const targetId =
                lanDat?.idLanLamBaiKiemTra ||
                (lanDat as any)?.id ||
                (lanDat as any)?.idLanLamBai;

              onXemLai(targetId);
            }}
            startIcon={<SchoolRounded />}
            sx={{
              py: 1.35,
              px: 3,
              borderRadius: RADIUS,
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 15,
              textTransform: "none",
              borderColor: RED,
              color: RED,
              "&:hover": {
                borderColor: RED_DARK,
                bgcolor: alpha(RED, 0.04),
                transform: "translateY(-1px)",
              },
              transition: "all 0.18s ease",
            }}
          >
            Xem đáp án
          </Button>
        )}

        {/* Nút Bỏ qua */}
        {!hetLuot && (
          <Button
            onClick={onSkip}
            endIcon={<ArrowForwardRounded sx={{ fontSize: 16 }} />}
            sx={{
              py: 1.35,
              px: 2,
              borderRadius: RADIUS,
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 14.5,
              textTransform: "none",
              color: SUB,
              transition: "all 0.18s ease",
              "&:hover": {
                color: INK,
                bgcolor: "rgba(0,0,0,0.04)",
              },
            }}
          >
            Bỏ qua bài kiểm tra
          </Button>
        )}
      </Stack>

      {/* Lỗi nếu có */}
      {error && (
        <Alert
          severity="error"
          sx={{
            width: "100%",
            mt: 3,
            borderRadius: RADIUS,
            fontFamily: FONT,
          }}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
}
