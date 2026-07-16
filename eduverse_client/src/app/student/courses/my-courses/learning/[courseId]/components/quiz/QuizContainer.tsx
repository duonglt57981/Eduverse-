"use client";

import { useEffect } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  alpha,
} from "@mui/material";
// FIX: import named từ root package thay vì path con "/ErrorOutline" —
// path con bị TS báo "Cannot find module" (lỗi 2307) trong môi trường hiện tại.
// FIX: MUI v9 đặt tên export là "ErrorOutlined" (không phải "ErrorOutline").
import { ErrorOutlined as ErrorOutlineIcon } from "@mui/icons-material";
import { useQuiz } from "../../hooks/useQuiz";
import { QuizEntry } from "./QuizEntry";
import { QuizView } from "./QuizView";
import { QuizResult } from "./QuizResult";

const PRIMARY_RED = "#8B1313";
const PRIMARY_RED_DARK = "#6B1414";

// Điểm tối đa luôn là 100 theo thang chấm của backend (xem KetQuaLanKiemTraDto.tongDiemToiDa)
const DIEM_TOI_DA = 100;

// Type tối thiểu cho 1 câu hỏi trong ReviewQuizDto.cauHois — chỉ khai báo field
// thực sự dùng ở đây (cờ đúng/sai) để tránh "any". CHỈNH LẠI tên field "dung"
// nếu CauHoiReviewDto thật trong project dùng tên khác (vd: isDung, dapAnDung...).
interface CauHoiReviewMinimal {
  dung?: boolean;
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
  soLanDaLam?: number;
  diemCaoNhat?: number | null;
  daQua?: boolean;
  canRetake?: boolean;
  idLanLamConDang?: string | null; // nếu có lần làm đang dở
  onClose?: () => void;
}

export const QuizContainer = ({
  baiKiemTra,
  idDangKyKhoaHoc,
  soLanDaLam = 0,
  diemCaoNhat,
  daQua = false,
  canRetake = true,
  idLanLamConDang,
  onClose,
}: QuizContainerProps) => {
  const {
    phase,
    quiz,
    review, // FIX: hook trả về "review" (ReviewQuizDto | null), không phải "ketQua"
    selectedAnswers,
    currentQuestion,
    timeLeft,
    errorMsg,
    startQuiz,
    continueQuiz,
    selectAnswer,
    goToQuestion,
    submitQuiz,
    resetQuiz,
  } = useQuiz();

  // Khi unmount, dọn dẹp
  useEffect(() => {
    return () => {
      resetQuiz();
    };
  }, []);

  // ── Phase: idle → hiển thị màn hình giới thiệu ──
  if (phase === "idle") {
    return (
      <QuizEntry
        baiKiemTra={baiKiemTra}
        soLanDaLam={soLanDaLam}
        diemCaoNhat={diemCaoNhat}
        daQua={daQua}
        canRetake={canRetake}
        hasDraft={!!idLanLamConDang}
        onStart={() => startQuiz(baiKiemTra.id, idDangKyKhoaHoc)}
        onContinue={
          idLanLamConDang ? () => continueQuiz(idLanLamConDang) : undefined
        }
      />
    );
  }

  // ── Phase: loading ──
  if (phase === "loading") {
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
        <CircularProgress
          sx={{ color: PRIMARY_RED }}
          size={40}
          thickness={3.5}
        />
        <Typography color="text.secondary" variant="body2">
          Đang tải bài kiểm tra…
        </Typography>
      </Box>
    );
  }

  // ── Phase: error ──
  if (phase === "error") {
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
        <ErrorOutlineIcon
          sx={{ fontSize: 52, color: alpha(PRIMARY_RED, 0.5) }}
        />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Có lỗi xảy ra
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {errorMsg || "Không thể tải bài kiểm tra. Vui lòng thử lại."}
        </Typography>
        <Button
          variant="contained"
          onClick={resetQuiz}
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

  // ── Phase: doing hoặc submitting ──
  if ((phase === "doing" || phase === "submitting") && quiz) {
    // FIX: BaiKiemTraLamBaiDto có field "cauHois", không phải "danhSachCauHoi"
    const danhSachCauHoi = quiz.cauHois ?? [];

    return (
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <QuizView
          tieuDe={baiKiemTra.tieuDe ?? "Bài kiểm tra"}
          danhSachCauHoi={danhSachCauHoi}
          selectedAnswers={selectedAnswers}
          currentQuestion={currentQuestion}
          timeLeft={timeLeft}
          submitting={phase === "submitting"}
          onSelectAnswer={selectAnswer}
          onGoToQuestion={goToQuestion}
          onSubmit={submitQuiz}
        />
      </Box>
    );
  }

  // ── Phase: result ──
  if (phase === "result" && review) {
    // FIX: ReviewQuizDto không có "diem"/"soCauDung" trực tiếp.
    // - diem lấy từ review.tongDiem
    // - diemToiDa luôn = 100 theo thang chấm backend (KetQuaLanKiemTraDto.tongDiemToiDa)
    // - soCauDung đếm từ review.cauHois (giả định mỗi câu có field đánh dấu đúng/sai,
    //   ví dụ "dung: boolean" tương tự DapAnDto — CHỈNH LẠI field này nếu CauHoiReviewDto
    //   dùng tên khác trong project thật của bạn)
    const tongSoCau = review.cauHois?.length ?? baiKiemTra.soLuongCauHoi ?? 0;
    const soCauDung =
      (review.cauHois as CauHoiReviewMinimal[] | undefined)?.filter(
        (c) => c.dung === true,
      ).length ?? 0;

    return (
      <QuizResult
        tieuDe={baiKiemTra.tieuDe ?? "Bài kiểm tra"}
        diem={review.tongDiem ?? 0}
        diemToiDa={baiKiemTra.diemToiDa ?? DIEM_TOI_DA}
        diemDat={baiKiemTra.diemDat}
        soCauDung={soCauDung}
        tongSoCau={tongSoCau}
        soLanLam={(soLanDaLam ?? 0) + 1}
        canRetake={
          canRetake &&
          (!baiKiemTra.soLanLamToiDa ||
            soLanDaLam + 1 < baiKiemTra.soLanLamToiDa)
        }
        onRetake={() => {
          resetQuiz();
        }}
        onClose={onClose}
      />
    );
  }

  return null;
};
