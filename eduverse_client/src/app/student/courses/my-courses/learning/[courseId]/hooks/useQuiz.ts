"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { apiService } from "@/src/services/index";

// ── Types (map từ BE DTOs) ─────────────────────────────────────────────────────

export interface DapAnLamBaiDto {
  id: string;
  noiDungDapAn?: string;
  thuTuSapXep?: number;
}

export interface DapAnReviewDto {
  id: string;
  noiDungDapAn?: string;
  laDapAnDung?: boolean;
}

export interface CauHoiLamBaiDto {
  id: string;
  tenCauHoi?: string;
  noiDungCauHoi?: string;
  loaiCauHoi?: number;
  diem?: number;
  dapAns: DapAnLamBaiDto[];
  dapAnDaChon?: string[];
  daTraLoi: boolean;
  doKho?: string;
}

export interface BaiKiemTraLamBaiDto {
  id: string;
  tenBaiKiemTra?: string;
  moTa?: string;
  gioiHanThoiGian?: number; // phút
  cauHois: CauHoiLamBaiDto[];
}

// BaiKiemTraDto (thông tin tổng quan)
export interface BaiKiemTraInfoDto {
  id: string;
  tenBaiKiemTra?: string;
  moTa?: string;
  diemDat?: number;
  gioiHanThoiGian?: number;
  choLamLai?: boolean;
  soLanLamToiDa?: number;
  soCauHoi?: number;
}

export interface KetQuaLanKiemTraDto {
  idLanLamBaiKiemTra: string;
  dat: boolean;
  tongDiem: number;
  soCauDung: number;
  soCauSai: number;
  tongSoCau: number;
  thoiGianNop?: string;
  datYeuCau: boolean;
  tongDiemToiDa: number;
  thoiGianBatDau?: string;
  thoiGianKetThuc?: string;
}

export interface CauHoiReviewDto {
  idCauHoi: string;
  tenCauHoi?: string;
  noiDungCauHoi?: string;
  idDapAnChon?: string;
  idDapAnDung?: string;
  laDung: boolean;
  diemNhanDuoc: number;
  dapAns: DapAnReviewDto[];
}

export interface ReviewQizzDto {
  idLanLamBaiKiemTra: string;
  tongDiem: number;
  thoiGianNop?: string;
  dat: boolean;
  cauHois: CauHoiReviewDto[];
}

export interface ContinueQuizFullDto {
  idLanLamBaiKiemTra: string;
  idBaiKiemTra: string;
  tenBaiKiemTra: string;
  currentQuestionIndex: number;
  currentQuestionId?: string;
  savedAnswers: Record<string, string[]>;
  allQuestions: CauHoiLamBaiDto[];
  progress: {
    soCauDaLam: number;
    tongSoCau: number;
    phanTram: number;
    daHoanThanh: boolean;
  };
  thoiGian: {
    thoiGianBatDau: string;
    thoiGianDaLam: number;
    thoiGianConLai: number;
    gioiHanThoiGian: number;
    coGioiHan: boolean;
  };
}

export interface AutoSaveDapAnDto {
  success: boolean;
  soCauDaLam: number;
  tongSoCau: number;
  daHoanThanh: boolean;
  nextQuestionId?: string;
  thoiGianConLai: number;
  coGioiHan: boolean;
  message: string;
}

export interface LichSuLamBaiDto {
  idLanLamBaiKiemTra: string;
  lamLanThu?: number;
  dat?: boolean;
  tongDiem?: number;
  thoiGianBatDau?: string;
  thoiGianNop?: string;
}

export type QuizPhase = "entry" | "doing" | "submitting" | "result" | "review";

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useQuiz(
  idBaiKiemTra: string | undefined,
  idDangKi: string | undefined,
  userId: string | undefined,
) {
  const [phase, setPhase] = useState<QuizPhase>("entry");
  const [info, setInfo] = useState<BaiKiemTraInfoDto | null>(null);
  const [cauHois, setCauHois] = useState<CauHoiLamBaiDto[]>([]);
  const [ketQua, setKetQua] = useState<KetQuaLanKiemTraDto | null>(null);
  const [review, setReview] = useState<ReviewQizzDto | null>(null);
  const [lichSu, setLichSu] = useState<LichSuLamBaiDto[]>([]);
  const [canRetake, setCanRetake] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [idLanLam, setIdLanLam] = useState<string>("");
  const [cauHoiHienTai, setCauHoiHienTai] = useState(0);
  // traLois: idCauHoi → list idDapAn (support multi-choice)
  const [traLois, setTraLois] = useState<Record<string, string[]>>({});
  const [thoiGianConLai, setThoiGianConLai] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savingRef = useRef(false);

  // ── Load thông tin bài + lịch sử ──────────────────────────────────────────
  useEffect(() => {
    if (!idBaiKiemTra || !userId) return;
    const load = async () => {
      setLoading(true);
      try {
        const [infoRes, histRes, retakeRes] = await Promise.all([
          apiService.get<BaiKiemTraInfoDto>(`/baikimtra/${idBaiKiemTra}`),
          apiService.get<LichSuLamBaiDto[]>(
            `/baikimtra/${idBaiKiemTra}/history/${userId}`,
          ),
          apiService.get<boolean>(
            `/baikimtra/${idBaiKiemTra}/can-retake/${userId}`,
          ),
        ]);
        setInfo(infoRes.data);
        setLichSu(histRes.data ?? []);
        setCanRetake(retakeRes.data);
      } catch {
        setError("Không thể tải thông tin bài kiểm tra");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [idBaiKiemTra, userId]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const nopBai = useCallback(async () => {
    if (!idLanLam || !cauHois.length) return;
    stopTimer();
    stopHeartbeat();
    setPhase("submitting");
    try {
      const payload = {
        idLanLamBaiKiemTra: idLanLam,
        cauTraLois: cauHois.map((c) => ({
          idCauHoi: c.id,
          idDapAnChons: traLois[c.id] ?? [],
        })),
      };
      const res = await apiService.post<KetQuaLanKiemTraDto>(
        "/baikimtra/submit",
        payload,
      );
      setKetQua(res.data);
      setPhase("result");

      // Refresh lịch sử
      if (userId && idBaiKiemTra) {
        const histRes = await apiService.get<LichSuLamBaiDto[]>(
          `/baikimtra/${idBaiKiemTra}/history/${userId}`,
        );
        setLichSu(histRes.data ?? []);
        const retakeRes = await apiService.get<boolean>(
          `/baikimtra/${idBaiKiemTra}/can-retake/${userId}`,
        );
        setCanRetake(retakeRes.data);
      }
    } catch {
      setError("Không thể nộp bài. Vui lòng thử lại.");
      setPhase("doing");
    }
  }, [
    idLanLam,
    cauHois,
    traLois,
    stopTimer,
    stopHeartbeat,
    userId,
    idBaiKiemTra,
  ]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  const startTimer = useCallback((giayConLai: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setThoiGianConLai(giayConLai);
    timerRef.current = setInterval(() => {
      setThoiGianConLai((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Tự nộp khi hết giờ
          nopBai();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ── Heartbeat ──────────────────────────────────────────────────────────────
  const startHeartbeat = useCallback((id: string) => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    heartbeatRef.current = setInterval(async () => {
      try {
        const res = await apiService.post<{ thoiGianConLai?: number }>(
          `/baikimtra/heartbeat-timequiz/${id}`,
        );
        if (res.data?.thoiGianConLai != null) {
          setThoiGianConLai(res.data.thoiGianConLai);
        }
      } catch {
        /* ignore */
      }
    }, 10000); // 10s
  }, []);

  useEffect(
    () => () => {
      stopTimer();
      stopHeartbeat();
    },
    [stopTimer, stopHeartbeat],
  );

  // ── Bắt đầu làm bài ───────────────────────────────────────────────────────
  const batDauLamBai = useCallback(async () => {
    if (!idBaiKiemTra) return;
    setLoading(true);
    setError("");
    try {
      // 1. Start quiz → lấy idLanLamBaiKiemTra
      const startRes = await apiService.post<{
        id: string;
        thoiGianBatDau: string;
      }>("/baikimtra/start", { idBaiKiemTra, idDangKi: idDangKi ?? null });
      const newIdLanLam = startRes.data.id;
      setIdLanLam(newIdLanLam);

      // 2. Lấy câu hỏi cho học viên (không có đáp án đúng)
      const quizRes = await apiService.get<BaiKiemTraLamBaiDto>(
        `/baikimtra/${idBaiKiemTra}/for-student`,
      );
      const questions = quizRes.data.cauHois ?? [];
      setCauHois(questions);
      setTraLois({});
      setCauHoiHienTai(0);
      setPhase("doing");

      // 3. Khởi động timer
      if (quizRes.data.gioiHanThoiGian) {
        startTimer(quizRes.data.gioiHanThoiGian * 60);
      }

      // 4. Heartbeat
      startHeartbeat(newIdLanLam);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg ?? "Không thể bắt đầu làm bài");
    } finally {
      setLoading(false);
    }
  }, [idBaiKiemTra, idDangKi, startTimer, startHeartbeat]);

  // ── Tiếp tục bài làm dở ───────────────────────────────────────────────────
  const tiepTucLamBai = useCallback(
    async (idLanLamCu: string) => {
      setLoading(true);
      try {
        const res = await apiService.get<ContinueQuizFullDto>(
          `/baikimtra/continue-full/${idLanLamCu}`,
        );
        const d = res.data;
        setIdLanLam(idLanLamCu);
        setCauHois(d.allQuestions ?? []);
        setCauHoiHienTai(d.currentQuestionIndex);

        // Convert savedAnswers từ Record<Guid, List<Guid>>
        const restored: Record<string, string[]> = {};
        Object.entries(d.savedAnswers ?? {}).forEach(([k, v]) => {
          restored[k] = v;
        });
        setTraLois(restored);
        setPhase("doing");

        if (d.thoiGian?.coGioiHan && d.thoiGian.thoiGianConLai > 0) {
          startTimer(d.thoiGian.thoiGianConLai);
        }
        startHeartbeat(idLanLamCu);
      } catch {
        setError("Không thể tiếp tục bài làm");
      } finally {
        setLoading(false);
      }
    },
    [startTimer, startHeartbeat],
  );

  // ── Chọn đáp án + auto-save ────────────────────────────────────────────────
  const chonDapAn = useCallback(
    async (idCauHoi: string, idDapAn: string) => {
      // Update local state ngay
      setTraLois((prev) => {
        const current = prev[idCauHoi] ?? [];
        // Single choice: replace; multi-choice: toggle
        const cauHoi = cauHois.find((c) => c.id === idCauHoi);
        const isMulti = cauHoi?.loaiCauHoi === 2; // 2 = multiple choice
        if (isMulti) {
          const updated = current.includes(idDapAn)
            ? current.filter((x) => x !== idDapAn)
            : [...current, idDapAn];
          return { ...prev, [idCauHoi]: updated };
        }
        return { ...prev, [idCauHoi]: [idDapAn] };
      });

      // Auto-save lên BE (debounce bằng savingRef)
      if (savingRef.current || !idLanLam) return;
      savingRef.current = true;
      try {
        const cauHoi = cauHois.find((c) => c.id === idCauHoi);
        const isMulti = cauHoi?.loaiCauHoi === 2;
        const current = traLois[idCauHoi] ?? [];
        const updated = isMulti
          ? current.includes(idDapAn)
            ? current.filter((x) => x !== idDapAn)
            : [...current, idDapAn]
          : [idDapAn];

        const res = await apiService.post<AutoSaveDapAnDto>(
          "/baikimtra/auto-save",
          {
            idLanLamBaiKiemTra: idLanLam,
            idCauHoi,
            idDapAnChons: updated,
          },
        );

        // Cập nhật thời gian từ BE
        if (res.data?.coGioiHan && res.data.thoiGianConLai > 0) {
          setThoiGianConLai(res.data.thoiGianConLai);
        }

        // Tự động chuyển câu tiếp
        if (res.data?.nextQuestionId) {
          const nextIdx = cauHois.findIndex(
            (c) => c.id === res.data.nextQuestionId,
          );
          if (nextIdx !== -1) setCauHoiHienTai(nextIdx);
        }
      } catch {
        /* ignore auto-save errors */
      } finally {
        savingRef.current = false;
      }
    },
    [cauHois, idLanLam, traLois],
  );

  // ── Nộp bài ───────────────────────────────────────────────────────────────

  // ── Xem lại bài làm ───────────────────────────────────────────────────────
  const xemLaiBai = useCallback(
    async (idLanLamBai?: string) => {
      const id = idLanLamBai ?? idLanLam;
      if (!id) return;
      setLoading(true);
      try {
        const res = await apiService.get<ReviewQizzDto>(
          `/baikimtra/review/${id}`,
        );
        setReview(res.data);
        setPhase("review");
      } catch {
        setError("Không thể tải kết quả chi tiết");
      } finally {
        setLoading(false);
      }
    },
    [idLanLam],
  );

  const lamLaiDau = useCallback(() => {
    stopTimer();
    stopHeartbeat();
    setPhase("entry");
    setKetQua(null);
    setReview(null);
    setTraLois({});
    setCauHoiHienTai(0);
    setError("");
    setIdLanLam("");
  }, [stopTimer, stopHeartbeat]);

  const formatTimer = (giay: number) => {
    const m = Math.floor(giay / 60)
      .toString()
      .padStart(2, "0");
    const s = (giay % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const soLanDaLam = lichSu.length;
  const lanLamDoDang = lichSu.find((l) => !l.thoiGianNop); // chưa nộp = đang dở

  return {
    phase,
    // Alias để tương thích code cũ
    quiz: info,
    selectedAnswers: traLois,
    currentQuestion: cauHoiHienTai,
    timeLeft: thoiGianConLai,
    errorMsg: error,
    startQuiz: batDauLamBai,
    continueQuiz: tiepTucLamBai,
    selectAnswer: chonDapAn,
    goToQuestion: setCauHoiHienTai,
    submitQuiz: nopBai,
    resetQuiz: lamLaiDau,
    // API mới
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
    setCauHoiHienTai,
    thoiGianConLai,
    formatTimer,
    soLanDaLam,
    lanLamDoDang,
    batDauLamBai,
    tiepTucLamBai,
    chonDapAn,
    nopBai,
    xemLaiBai,
    lamLaiDau,
  };
}
