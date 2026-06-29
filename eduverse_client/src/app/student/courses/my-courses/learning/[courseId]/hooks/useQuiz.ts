"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import BaiKiemTraService from "@/src/services/BaiKiemTraService";
import {
  BaiKiemTraLamBaiDto,
  LanLamBaiKiemTraDto,
  ReviewQuizDto,
  ContinueQuizFullDto,
} from "@/src/types/baiKiemTra/Dto/baiKiemTraDto";
import {
  AutoSaveRequest,
  SubmitQuizRequest,
} from "@/src/types/baiKiemTra/Request/QuizzRequest";

const QuizSvc = new BaiKiemTraService();

export type QuizPhase =
  | "idle"
  | "loading"
  | "doing"
  | "submitting"
  | "result"
  | "error";

export interface SelectedAnswers {
  [cauHoiId: string]: string[];
}

export interface UseQuizReturn {
  phase: QuizPhase;
  quiz: BaiKiemTraLamBaiDto | null;
  lanLamBai: LanLamBaiKiemTraDto | null;
  review: ReviewQuizDto | null;
  selectedAnswers: SelectedAnswers;
  currentQuestion: number;
  timeLeft: number | null;
  errorMsg: string;
  savingCauHoi: string | null;
  startQuiz: (idBaiKiemTra: string, idDangKyKhoaHoc: string) => Promise<void>;
  continueQuiz: (idLanLamBai: string) => Promise<void>;
  selectAnswer: (cauHoiId: string, dapAnId: string, isMulti: boolean) => void;
  goToQuestion: (idx: number) => void;
  submitQuiz: () => Promise<void>;
  resetQuiz: () => void;
}

type ApiErrorShape = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  const error = err as ApiErrorShape;
  return error?.response?.data?.message ?? fallback;
};

export const useQuiz = (): UseQuizReturn => {
  const [phase, setPhase] = useState<QuizPhase>("idle");
  const [quiz, setQuiz] = useState<BaiKiemTraLamBaiDto | null>(null);
  const [lanLamBai, setLanLamBai] = useState<LanLamBaiKiemTraDto | null>(null);
  const [review, setReview] = useState<ReviewQuizDto | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [savingCauHoi, setSavingCauHoi] = useState<string | null>(null);

  const lanLamBaiRef = useRef<LanLamBaiKiemTraDto | null>(null);
  const selectedAnswersRef = useRef<SelectedAnswers>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSaveQueueRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    lanLamBaiRef.current = lanLamBai;
  }, [lanLamBai]);
  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  const clearAllIntervals = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const startBackgroundTasks = useCallback(
    (timeLimitMinutes: number | null | undefined, idLanLamBai: string) => {
      clearAllIntervals();

      if (timeLimitMinutes && timeLimitMinutes > 0) {
        setTimeLeft(timeLimitMinutes * 60);
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev === null || prev <= 1) {
              if (timerRef.current) {
                clearInterval(timerRef.current);
              }
              timerRef.current = null;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }

      // Heartbeat mỗi 15 giây
      heartbeatRef.current = setInterval(async () => {
        try {
          await QuizSvc.Heartbeat(idLanLamBai);
        } catch {
          // Fail silently
        }
      }, 15000);
    },
    [clearAllIntervals],
  );

  const autoSaveSingleAnswer = useCallback(
    async (idLanLamBai: string, cauHoiId: string, dapAnIds: string[]) => {
      if (autoSaveQueueRef.current.has(cauHoiId)) return;
      autoSaveQueueRef.current.add(cauHoiId);
      setSavingCauHoi(cauHoiId);
      try {
        const request: AutoSaveRequest = {
          idLanLamBaiKiemTra: idLanLamBai,
          idCauHoi: cauHoiId,
          idDapAnChons: dapAnIds,
        };
        await QuizSvc.AutoSaveDapAn(request);
      } catch {
        // Fail silently
      } finally {
        autoSaveQueueRef.current.delete(cauHoiId);
        setSavingCauHoi((prev) => (prev === cauHoiId ? null : prev));
      }
    },
    [],
  );

  const startQuiz = useCallback(
    async (idBaiKiemTra: string, idDangKyKhoaHoc: string) => {
      setPhase("loading");
      setErrorMsg("");
      try {
        const quizRes = await QuizSvc.GetQuizzForStudent(idBaiKiemTra);
        const quizData = quizRes.data;
        setQuiz(quizData);

        const startRes = await QuizSvc.StartQuizz({
          idBaiKiemTra,
          idDangKi: idDangKyKhoaHoc,
        });
        const lanData = startRes.data;
        setLanLamBai(lanData);

        setSelectedAnswers({});
        setCurrentQuestion(0);
        setReview(null);
        setPhase("doing");

        // Lấy thời gian giới hạn từ quizData
        const timeLimit = quizData?.gioiHanThoiGian;
        startBackgroundTasks(timeLimit, lanData.id);
      } catch (err: unknown) {
        setErrorMsg(getErrorMessage(err, "Không thể bắt đầu bài kiểm tra."));
        setPhase("error");
      }
    },
    [startBackgroundTasks],
  );

  const continueQuiz = useCallback(
    async (idLanLamBai: string) => {
      setPhase("loading");
      setErrorMsg("");
      try {
        const res = await QuizSvc.ContinueQuiz(idLanLamBai);
        const data: ContinueQuizFullDto = res.data;

        // Map dữ liệu từ ContinueQuizFullDto sang các state
        const lanLamData: LanLamBaiKiemTraDto = {
          id: data.idLanLamBaiKiemTra,
          idBaiKiemTra: data.idBaiKiemTra,
          thoiGianBatDau: new Date(data.thoiGian.thoiGianBatDau),
        };

        setQuiz(null); // Quiz không có trong response này, có thể lấy từ allQuestions
        setLanLamBai(lanLamData);

        // Khôi phục đáp án đã lưu
        const restored: SelectedAnswers = {};
        Object.entries(data.savedAnswers).forEach(([cauHoiId, dapAnIds]) => {
          restored[cauHoiId] = dapAnIds;
        });
        setSelectedAnswers(restored);
        setCurrentQuestion(data.currentQuestionIndex);
        setReview(null);
        setPhase("doing");

        startBackgroundTasks(data.thoiGian.gioiHanThoiGian / 60, idLanLamBai);
        setTimeLeft(data.thoiGian.thoiGianConLai);
      } catch (err: unknown) {
        setErrorMsg(getErrorMessage(err, "Không thể tiếp tục bài kiểm tra."));
        setPhase("error");
      }
    },
    [startBackgroundTasks],
  );

  const selectAnswer = useCallback(
    (cauHoiId: string, dapAnId: string, isMulti: boolean) => {
      const idLanLamBai = lanLamBaiRef.current?.id;
      if (!idLanLamBai) return;

      setSelectedAnswers((prev) => {
        const current = prev[cauHoiId] ?? [];
        let next: string[];

        if (isMulti) {
          next = current.includes(dapAnId)
            ? current.filter((id) => id !== dapAnId)
            : [...current, dapAnId];
        } else {
          next = current[0] === dapAnId ? [] : [dapAnId];
        }

        // AutoSave ngay lập tức với đáp án mới
        autoSaveSingleAnswer(idLanLamBai, cauHoiId, next);

        return { ...prev, [cauHoiId]: next };
      });
    },
    [autoSaveSingleAnswer],
  );

  const goToQuestion = useCallback((idx: number) => {
    setCurrentQuestion(idx);
  }, []);

  const submitQuiz = useCallback(async () => {
    const current = lanLamBaiRef.current;
    const id = current?.id;
    if (!id) return;

    setPhase("submitting");
    clearAllIntervals();

    try {
      const cauTraLois = Object.entries(selectedAnswersRef.current).map(
        ([idCauHoi, idDapAnChons]) => ({
          idCauHoi,
          idDapAnChons,
        }),
      );

      const submitRequest: SubmitQuizRequest = {
        idLanLamBaiKiemTra: id,
        cauTraLois,
      };

      await QuizSvc.SubMitQuizz(submitRequest);

      // Lấy review chi tiết sau khi nộp
      const reviewRes = await QuizSvc.GetReviewQuiz(id);
      setReview(reviewRes.data);
      setPhase("result");
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err, "Có lỗi khi nộp bài."));
      setPhase("error");
    }
  }, [clearAllIntervals]);

  const resetQuiz = useCallback(() => {
    clearAllIntervals();
    setPhase("idle");
    setQuiz(null);
    setLanLamBai(null);
    setReview(null);
    setSelectedAnswers({});
    setCurrentQuestion(0);
    setTimeLeft(null);
    setErrorMsg("");
    setSavingCauHoi(null);
    autoSaveQueueRef.current.clear();
  }, [clearAllIntervals]);

  // Auto submit khi hết giờ
  useEffect(() => {
    if (timeLeft === 0 && phase === "doing") {
      submitQuiz();
    }
  }, [timeLeft, phase, submitQuiz]);

  // Cleanup khi unmount
  useEffect(() => {
    return () => clearAllIntervals();
  }, [clearAllIntervals]);

  return {
    phase,
    quiz,
    lanLamBai,
    review,
    selectedAnswers,
    currentQuestion,
    timeLeft,
    errorMsg,
    savingCauHoi,
    startQuiz,
    continueQuiz,
    selectAnswer,
    goToQuestion,
    submitQuiz,
    resetQuiz,
  };
};
