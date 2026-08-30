/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { apiService } from "@/src/services/index";

// ── Types ─────────────────────────────────────────────────────────────────────

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

export function isMultiChoice(loaiCauHoi?: string | number): boolean {
  if (loaiCauHoi === undefined || loaiCauHoi === null) return false;
  if (typeof loaiCauHoi === "number") return loaiCauHoi === 2;
  const s = String(loaiCauHoi).toUpperCase().trim();
  return s === "MULTI" || s === "MULTIPLE" || s === "2" || s === "NHIEU";
}

export interface CauHoiLamBaiDto {
  id: string;
  tenCauHoi?: string;
  noiDungCauHoi?: string;
  loaiCauHoi?: string | number;
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
  idDapAnChons?: string[];
  dapAnDaChon?: string[];
  idDapAnsDaChon?: string[];
  idDapAnDung?: string;
  idDapAnDungs?: string[];
  laDung: boolean;
  diemNhanDuoc: number;
  dapAns: DapAnReviewDto[];
  loaiCauHoi?: string | number;
}

export interface ReviewQizzDto {
  idLanLamBaiKiemTra: string;
  tongDiem: number;
  thoiGianNop?: string;
  dat: boolean;
  cauHois: CauHoiReviewDto[];
  choXemDapAn?: boolean; // 🚀 Thêm dòng này
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
  tongDiem?: number; // điểm lần đó
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
  const [traLois, setTraLois] = useState<Record<string, string[]>>({});
  const [thoiGianConLai, setThoiGianConLai] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savingRef = useRef(false);

  // ── Ref để tránh stale closure trong timer ────────────────────────────────
  const nopBaiRef = useRef<() => Promise<void>>(async () => {});

  // ── Load thông tin bài + lịch sử ──────────────────────────────────────────
  useEffect(() => {
    if (!idBaiKiemTra || !userId) return;
    const load = async () => {
      setLoading(true);
      try {
        const [infoRes, histRes] = await Promise.all([
          apiService.get<BaiKiemTraLamBaiDto>(
            `/BaiKiemTra/${idBaiKiemTra}/quiz`, // ✅ viết hoa
          ),
          apiService.get<LichSuLamBaiDto[]>(
            `/BaiKiemTra/${idBaiKiemTra}/history/${userId}`, // ✅ viết hoa
          ),
        ]);

        // 🚀 FIX: BaiKiemTraLamBaiDto (trả về từ /quiz) không có field
        // soCauHoi — chỉ có mảng cauHois. Trước đây setInfo(infoRes.data)
        // gán thẳng nên soCauHoi luôn undefined -> UI hiện "0 câu hỏi".
        // Map lại đúng field của BaiKiemTraInfoDto, tính soCauHoi từ
        // độ dài mảng cauHois đã được BE trả về.
        setInfo({
          id: infoRes.data.id,
          tenBaiKiemTra: infoRes.data.tenBaiKiemTra,
          moTa: infoRes.data.moTa,
          gioiHanThoiGian: infoRes.data.gioiHanThoiGian,
          soCauHoi: infoRes.data.cauHois?.length ?? 0,
        });
        setLichSu(histRes.data ?? []);
        setCanRetake(true); // ✅ Luôn cho phép làm lại
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

  // ── Nộp bài ───────────────────────────────────────────────────────────────
  const nopBai = useCallback(async () => {
    if (!idLanLam) {
      setError("Chưa có ID lần làm bài — thử bắt đầu lại");
      return;
    }
    if (!cauHois.length) {
      setError("Không có câu hỏi");
      return;
    }
    stopTimer();
    stopHeartbeat();
    setPhase("submitting");
    try {
      // Lấy đáp án từ traLois hiện tại (đã được cập nhật khi chọn đáp án)
      const payload = {
        idLanLamBaiKiemTra: idLanLam,
        cauTraLois: cauHois.map((c) => ({
          idCauHoi: c.id,
          idDapAnChons: traLois[c.id] ?? [],
        })),
      };
      const res = await apiService.post<KetQuaLanKiemTraDto>(
        "/BaiKiemTra/submit", // ✅ viết hoa
        payload,
      );
      setKetQua(res.data);

      setPhase("result");

      // Refresh lịch sử
      if (userId && idBaiKiemTra) {
        const [histRes] = await Promise.all([
          apiService.get<LichSuLamBaiDto[]>(
            `/BaiKiemTra/${idBaiKiemTra}/history/${userId}`, // ✅ viết hoa
          ),
        ]);
        setLichSu(histRes.data ?? []);
      }

      // Luôn cho phép làm lại (unlimited retake)
      setCanRetake(true);
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

  // ── Cập nhật ref mỗi khi nopBai thay đổi (tránh stale closure trong timer) ─
  useEffect(() => {
    nopBaiRef.current = nopBai;
  }, [nopBai]);

  // ── Timer — dùng ref để luôn gọi phiên bản mới nhất của nopBai ────────────
  const startTimer = useCallback((giayConLai: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setThoiGianConLai(giayConLai);
    timerRef.current = setInterval(() => {
      setThoiGianConLai((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          nopBaiRef.current();
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
          `/BaiKiemTra/heartbeat-timequiz/${id}`, // ✅ viết hoa
        );
        if (res.data?.thoiGianConLai != null) {
          setThoiGianConLai(res.data.thoiGianConLai);
        }
      } catch {
        /* ignore */
      }
    }, 10000);
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
      const startRes = await apiService.post<any>(
        "/BaiKiemTra/start", // ✅ viết hoa
        {
          idBaiKiemTra,
          idDangKi: idDangKi ?? null,
        },
      );

      if (!startRes.status || !startRes.data) {
        setError(startRes.message ?? "Không thể bắt đầu làm bài");
        setLoading(false);
        return;
      }

      const newIdLanLam =
        startRes.data?.id ??
        startRes.data?.idLanLamBaiKiemTra ??
        (startRes as any)?.id;

      if (!newIdLanLam) {
        setError("Không nhận được ID lần làm bài");
        setLoading(false);
        return;
      }

      setIdLanLam(newIdLanLam);

      // Lấy câu hỏi
      const quizRes = await apiService.get<BaiKiemTraLamBaiDto>(
        `/BaiKiemTra/${idBaiKiemTra}/quiz`, // ✅ viết hoa
      );
      const questions = quizRes.data?.cauHois ?? [];
      setCauHois(questions);
      setTraLois({});
      setCauHoiHienTai(0);
      setPhase("doing");

      // Ưu tiên lấy thời gian từ info (đã load trước), fallback sang quizRes
      const gioiHanPhut =
        info?.gioiHanThoiGian ?? quizRes.data?.gioiHanThoiGian ?? 0;

      if (gioiHanPhut > 0) {
        startTimer(gioiHanPhut * 60);
      }

      startHeartbeat(newIdLanLam);
    } catch (e: unknown) {
      const msg = (e as any)?.response?.data?.message;
      setError(msg ?? "Không thể bắt đầu làm bài");
    } finally {
      setLoading(false);
    }
  }, [idBaiKiemTra, idDangKi, info, startTimer, startHeartbeat]);

  // ── Tiếp tục bài làm dở ───────────────────────────────────────────────────
  const tiepTucLamBai = useCallback(
    async (idLanLamCu: string) => {
      setLoading(true);
      try {
        const res = await apiService.get<ContinueQuizFullDto>(
          `/BaiKiemTra/continue-full/${idLanLamCu}`, // ✅ viết hoa
        );
        const d = res.data;
        setIdLanLam(idLanLamCu);
        setCauHois(d.allQuestions ?? []);
        setCauHoiHienTai(d.currentQuestionIndex);

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
      const cauHoi = cauHois.find((c) => c.id === idCauHoi);
      const isMulti = isMultiChoice(cauHoi?.loaiCauHoi);
      const current = traLois[idCauHoi] ?? [];
      const updated = isMulti
        ? current.includes(idDapAn)
          ? current.filter((x) => x !== idDapAn)
          : [...current, idDapAn]
        : [idDapAn];

      // Cập nhật state ngay lập tức (optimistic update)
      setTraLois((prev) => ({
        ...prev,
        [idCauHoi]: updated,
      }));

      // Auto-save (không chặn UI)
      if (savingRef.current || !idLanLam) return;
      savingRef.current = true;
      try {
        const res = await apiService.post<AutoSaveDapAnDto>(
          "/BaiKiemTra/auto-save", // ✅ viết hoa
          {
            idLanLamBaiKiemTra: idLanLam,
            idCauHoi,
            idDapAnChons: updated,
          },
        );

        if (res.data?.coGioiHan && res.data.thoiGianConLai > 0) {
          setThoiGianConLai(res.data.thoiGianConLai);
        }

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

  // ── Xem lại bài làm ───────────────────────────────────────────────────────
  const xemLaiBai = useCallback(
    async (idLanLamBai?: string) => {
      const targetId =
        idLanLamBai ||
        idLanLam ||
        lichSu.find((l) => l.dat && l.thoiGianNop)?.idLanLamBaiKiemTra ||
        lichSu.find((l) => l.thoiGianNop)?.idLanLamBaiKiemTra ||
        lichSu[0]?.idLanLamBaiKiemTra;

      if (!targetId) {
        setError("Không tìm thấy thông tin lần làm bài để xem đáp án");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await apiService.get<ReviewQizzDto>(
          `/BaiKiemTra/review/${targetId}`, // ✅ viết hoa
        );
        setReview(res.data);
        setPhase("review");
      } catch (err) {
        console.error("Lỗi khi tải bài xem lại:", err);
        setError("Không thể tải kết quả chi tiết");
      } finally {
        setLoading(false);
      }
    },
    [idLanLam, lichSu],
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
  const lanLamDoDang = lichSu.find((l) => !l.thoiGianNop);

  // ── Kiểm tra đạt 100% ───────────────────────────────────────────────────────
  const daDat100 = ketQua?.tongDiem === 100;

  return {
    phase,
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
    daDat100,
  };
}
