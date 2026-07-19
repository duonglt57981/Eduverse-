"use client";

import { useEffect } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  alpha,
} from "@mui/material";
import { ErrorOutlined as ErrorOutlineIcon } from "@mui/icons-material";
import { useQuiz } from "../../hooks/useQuiz";
import { QuizEntry } from "./QuizEntry";
import { QuizView } from "./QuizView";
import { QuizResult } from "./QuizResult";
import { QuizReview } from "./QuizReview";

const PRIMARY_RED = "#8B1313";
const PRIMARY_RED_DARK = "#6B1414";

// Lấy userId từ JWT token trong localStorage
function getUserIdFromToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const token = localStorage.getItem("AccessToken");
  if (!token) return undefined;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return undefined;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    const keys = [
      "sub",
      "id",
      "userId",
      "nameid",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
    ];
    for (const key of keys) {
      if (payload[key]) return String(payload[key]);
    }
  } catch {}
  return undefined;
}

interface BaiKiemTraBasic {
  id: string;
  tieuDe?: string;
  moTa?: string;
  thoiGianGioiHan?: number | null;
  soLuongCauHoi?: number;
  diemToiDa?: number;
  soLanLamToiDa?: number;
  diemDat?: number;
}

interface QuizContainerProps {
  baiKiemTra: BaiKiemTraBasic;
  idDangKyKhoaHoc: string;
  onClose?: () => void;
}

export const QuizContainer = ({
  baiKiemTra,
  idDangKyKhoaHoc,
  onClose,
}: QuizContainerProps) => {
  const userId = getUserIdFromToken();
  console.log("[QuizContainer] idDangKyKhoaHoc:", idDangKyKhoaHoc);
console.log("[QuizContainer] baiKiemTra.id:", baiKiemTra.id);

  const {
    phase,
    info,
    cauHois,
    ketQua,
    review,
    lichSu,
    canRetake,
    loading,
    error,
    traLois,
    cauHoiHienTai,
    thoiGianConLai,
    formatTimer,
    lanLamDoDang,
    batDauLamBai,
    tiepTucLamBai,
    chonDapAn,
    setCauHoiHienTai,
    nopBai,
    xemLaiBai,
    lamLaiDau,
  } = useQuiz(baiKiemTra.id, idDangKyKhoaHoc, userId);

  useEffect(() => {
    return () => {
      lamLaiDau();
    };
  }, []);

  // ── Phase: entry → màn hình giới thiệu ──
  if (phase === "entry") {
    if (loading && !info) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 10,
            gap: 2,
          }}
        >
          <CircularProgress sx={{ color: PRIMARY_RED }} size={40} thickness={3.5} />
          <Typography color="text.secondary" variant="body2">
            Đang tải bài kiểm tra…
          </Typography>
        </Box>
      );
    }

    if (error && !info) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            px: 3,
            gap: 2,
            textAlign: "center",
            maxWidth: 400,
            mx: "auto",
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 52, color: alpha(PRIMARY_RED, 0.5) }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Có lỗi xảy ra
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {error || "Không thể tải bài kiểm tra. Vui lòng thử lại."}
          </Typography>
          <Button
            variant="contained"
            onClick={lamLaiDau}
            sx={{
              bgcolor: PRIMARY_RED,
              fontWeight: 700,
              borderRadius: 1.5,
              "&:hover": { bgcolor: PRIMARY_RED_DARK },
            }}
          >
            Thử lại
          </Button>
        </Box>
      );
    }

    if (!info) return null;

    return (
      <QuizEntry
        info={info}
        lichSu={lichSu}
        canRetake={canRetake}
        loading={loading}
        error={error} 
        lanLamDoDang={lanLamDoDang}
        onBatDau={batDauLamBai}
        onTiepTuc={tiepTucLamBai}
        onXemLai={xemLaiBai}
      />
    );
  }

  // ── Phase: doing hoặc submitting ──
  if (phase === "doing" || phase === "submitting") {
    return (
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <QuizView
          cauHois={cauHois}
          traLois={traLois}
          cauHoiHienTai={cauHoiHienTai}
          thoiGianConLai={thoiGianConLai}
          coGioiHanThoiGian={!!info?.gioiHanThoiGian}
          formatTimer={formatTimer}
          loading={phase === "submitting"}
          onChonDapAn={chonDapAn}
          onSetCauHoi={setCauHoiHienTai}
          onNopBai={nopBai}
        />
      </Box>
    );
  }

  // ── Phase: result ──
  if (phase === "result" && ketQua) {
    return (
      <QuizResult
        tieuDe={baiKiemTra.tieuDe ?? "Bài kiểm tra"}
        diem={ketQua.tongDiem}
        diemToiDa={ketQua.tongDiemToiDa}
        diemDat={baiKiemTra.diemDat}
        soCauDung={ketQua.soCauDung}
        tongSoCau={ketQua.tongSoCau}
        soLanLam={lichSu.length}
        canRetake={canRetake}
        onRetake={lamLaiDau}
        onClose={onClose}
        onXemLai={
          ketQua?.idLanLamBaiKiemTra
            ? () => xemLaiBai(ketQua.idLanLamBaiKiemTra)
            : undefined
        }
      />
    );
  }

  // ── Phase: review ──
  if (phase === "review" && review) {
    return (
      <QuizReview
        review={review}
        tieuDe={baiKiemTra.tieuDe}
        onQuayLai={lamLaiDau}
      />
    );
  }

  return null;
};