"use client";

import { Box, CircularProgress, Typography } from "@mui/material";
import { useQuiz } from "../../hooks/useQuiz";
import { QuizContainer } from "./QuizContainer";
import { QuizView } from "./QuizView";
import { QuizResult } from "./QuizResult";
import { QuizReview } from "./QuizReview";
import { BRAND } from "@/src/theme/tokens";

interface QuizSessionProps {
  idBaiKiemTra: string;
  idDangKyKhoaHoc: string;
  userId?: string;
  onClose?: () => void;
  onSkip?: () => void; // 🆕 Thêm prop
}

export function QuizSession({
  idBaiKiemTra,
  idDangKyKhoaHoc,
  userId,
  onClose,
  onSkip,
}: QuizSessionProps) {
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
    daDat100,
  } = useQuiz(idBaiKiemTra, idDangKyKhoaHoc, userId);

  // ── Màn hình giới thiệu (Entry) ──
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
          <CircularProgress sx={{ color: BRAND.main }} />
          <Typography color="text.secondary">Đang tải bài kiểm tra…</Typography>
        </Box>
      );
    }
    if (error) {
      return <Typography color="error">{error}</Typography>;
    }
    if (!info) return null;
    return (
      <QuizContainer
        info={info}
        lichSu={lichSu}
        canRetake={canRetake}
        loading={loading}
        lanLamDoDang={lanLamDoDang}
        error={error}
        onBatDau={batDauLamBai}
        onTiepTuc={tiepTucLamBai}
        onXemLai={xemLaiBai}
        onSkip={onSkip ?? (() => {})} // 🆕 Truyền callback skip
      />
    );
  }

  // ── Màn hình làm bài (Doing / Submitting) ──
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

  // ── Màn hình kết quả (Result) ──
  if (phase === "result" && ketQua) {
    const thoiGianLam =
      ketQua.thoiGianBatDau && ketQua.thoiGianKetThuc
        ? (new Date(ketQua.thoiGianKetThuc).getTime() -
            new Date(ketQua.thoiGianBatDau).getTime()) /
          1000
        : undefined;

    return (
      <QuizResult
        tieuDe={info?.tenBaiKiemTra ?? "Bài kiểm tra"}
        diem={ketQua.tongDiem}
        diemToiDa={ketQua.tongDiemToiDa}
        diemDat={info?.diemDat}
        soCauDung={ketQua.soCauDung}
        tongSoCau={ketQua.tongSoCau}
        thoiGianLam={thoiGianLam}
        soLanLam={lichSu.length}
        canRetake={canRetake}
        onRetake={lamLaiDau}
        onClose={onClose}
        onXemLai={
          ketQua?.idLanLamBaiKiemTra
            ? () => xemLaiBai(ketQua.idLanLamBaiKiemTra)
            : undefined
        }
        daDat100={daDat100}
        review={review}
      />
    );
  }

  // ── Màn hình xem lại chi tiết (Review) ──
  if (phase === "review" && review) {
    return (
      <QuizReview
        review={review}
        tieuDe={info?.tenBaiKiemTra}
        onQuayLai={lamLaiDau}
      />
    );
  }

  return null;
}
