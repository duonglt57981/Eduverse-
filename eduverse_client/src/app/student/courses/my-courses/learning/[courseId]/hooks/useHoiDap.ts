/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from "react";
import HoiDapService, {
  HoiDapDto,
  TraLoiDto,
  SearchHoiDapRequest,
} from "@/src/services/HoiDapService";

interface UseHoiDapProps {
  idKhoaHoc: string;
  idBaiGiang?: string | null; // null = xem tổng
  laGiangVien?: boolean;
}

export function useHoiDap({
  idKhoaHoc,
  idBaiGiang,
  laGiangVien,
}: UseHoiDapProps) {
  const [cauHois, setCauHois] = useState<HoiDapDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [sapXep, setSapXep] = useState<"MoiNhat" | "NhieuTraLoi" | "DaGhim">(
    "MoiNhat",
  );

  // Chi tiết câu hỏi đang mở
  const [cauHoiMo, setCauHoiMo] = useState<HoiDapDto | null>(null);
  const [loadingChiTiet, setLoadingChiTiet] = useState(false);

  // Form đặt câu hỏi
  const [noiDungMoi, setNoiDungMoi] = useState("");
  const [dangDat, setDangDat] = useState(false);

  // Form trả lời
  const [noiDungTraLoi, setNoiDungTraLoi] = useState("");
  const [dangTraLoi, setDangTraLoi] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // ── Load danh sách ────────────────────────────────────────────────
  const load = useCallback(
    async (reset = true) => {
      if (!idKhoaHoc) {
        console.log("❌ idKhoaHoc rỗng");
        return;
      }
      reset ? setLoading(true) : setLoadingMore(true);
      setError(null);
      try {
        const currentPage = reset ? 1 : page + 1;
        const req: SearchHoiDapRequest = {
          idKhoaHoc,
          idBaiGiang: idBaiGiang ?? null,
          keyword: keyword || undefined,
          sapXep,
          pageNumber: currentPage,
          pageSize: 10,
        };

        console.log("📤 Request:", req);
        const res = await HoiDapService.GetDanhSach(req);
        console.log("📥 Response:", res);
        console.log("📥 Items:", res?.items);

        setCauHois(
          reset ? (res.items ?? []) : (prev) => [...prev, ...(res.items ?? [])],
        );
        setTotalPages(res.totalPages ?? 1);
        if (!reset) setPage((p) => p + 1);
        else setPage(1);
      } catch (err: any) {
        console.log("❌ Lỗi:", err);
        setError(
          err.response?.data?.message || err.message || "Lỗi tải dữ liệu",
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [idKhoaHoc, idBaiGiang, keyword, sapXep],
  );

  useEffect(() => {
    if (!idKhoaHoc) {
      console.log("❌ idKhoaHoc rỗng");
      return;
    }
    console.log("✅ useHoiDap load:", idKhoaHoc, idBaiGiang);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    const req: SearchHoiDapRequest = {
      idKhoaHoc,
      idBaiGiang: idBaiGiang ?? null,
      keyword: keyword || undefined,
      sapXep,
      pageNumber: 1,
      pageSize: 10,
    };

    HoiDapService.GetDanhSach(req)
      .then((res) => {
        console.log("✅ HoiDap response:", res);
        setCauHois(res.items ?? []);
        setTotalPages(res.totalPages ?? 1);
        setPage(1);
      })
      .catch((err) => {
        console.log("❌ HoiDap error:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idKhoaHoc, idBaiGiang, sapXep]);

  // ── Mở chi tiết câu hỏi ──────────────────────────────────────────
  const moChiTiet = useCallback(async (idCauHoi: string) => {
    setLoadingChiTiet(true);
    try {
      const data = await HoiDapService.GetChiTiet(idCauHoi);
      setCauHoiMo(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingChiTiet(false);
    }
  }, []);

  // ── Đặt câu hỏi mới ──────────────────────────────────────────────
  const datCauHoi = useCallback(async () => {
    if (!noiDungMoi.trim() || noiDungMoi.trim().length < 10) {
      setError("Câu hỏi phải có ít nhất 10 ký tự");
      return;
    }
    setDangDat(true);
    setError(null);
    try {
      const cauHoiMoi = await HoiDapService.DatCauHoi({
        idKhoaHoc,
        idBaiGiang: idBaiGiang ?? null,
        noiDung: noiDungMoi.trim(),
      });
      setNoiDungMoi("");
      // Thay vì thêm thủ công, reload lại danh sách từ server
      await load(true); // ← đổi từ setCauHois thủ công thành reload
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Đặt câu hỏi thất bại",
      );
    } finally {
      setDangDat(false);
    }
  }, [idKhoaHoc, idBaiGiang, noiDungMoi, load]);

  // ── Trả lời ──────────────────────────────────────────────────────
  const traLoi = useCallback(async () => {
    if (!cauHoiMo || !noiDungTraLoi.trim()) return;
    setDangTraLoi(true);
    try {
      const tl = await HoiDapService.TraLoi({
        idCauHoi: cauHoiMo.id,
        noiDung: noiDungTraLoi.trim(),
      });
      setCauHoiMo((prev) =>
        prev
          ? {
              ...prev,
              danhSachTraLoi: [...prev.danhSachTraLoi, tl],
              soTraLoi: prev.soTraLoi + 1,
            }
          : prev,
      );
      setCauHois((prev) =>
        prev.map((c) =>
          c.id === cauHoiMo.id ? { ...c, soTraLoi: c.soTraLoi + 1 } : c,
        ),
      );
      setNoiDungTraLoi("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDangTraLoi(false);
    }
  }, [cauHoiMo, noiDungTraLoi]);

  const [replyingTo, setReplyingTo] = useState<{
    idTraLoi: string;
    tenNguoi: string;
  } | null>(null);
  const [noiDungReply, setNoiDungReply] = useState("");
  const [dangReply, setDangReply] = useState(false);

  // Thêm hàm reply:
  const reply = useCallback(async () => {
    if (!cauHoiMo || !replyingTo || !noiDungReply.trim()) return;
    setDangReply(true);
    try {
      const tl = await HoiDapService.Reply({
        idCauHoi: cauHoiMo.id,
        idTraLoiDuocReply: replyingTo.idTraLoi,
        noiDung: noiDungReply.trim(),
      });
      setCauHoiMo((prev) =>
        prev
          ? {
              ...prev,
              soTraLoi: prev.soTraLoi + 1,
              danhSachTraLoi: [...prev.danhSachTraLoi, tl],
            }
          : prev,
      );
      setNoiDungReply("");
      setReplyingTo(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDangReply(false);
    }
  }, [cauHoiMo, replyingTo, noiDungReply]);

  // ── Toggle like ───────────────────────────────────────────────────
  const toggleLike = useCallback(
    async (idTraLoi: string) => {
      if (!cauHoiMo) return;
      try {
        const soLikeMoi = await HoiDapService.ToggleLike(idTraLoi);
        setCauHoiMo((prev) =>
          prev
            ? {
                ...prev,
                danhSachTraLoi: prev.danhSachTraLoi.map((t) =>
                  t.id === idTraLoi
                    ? { ...t, soLike: soLikeMoi, daLike: !t.daLike }
                    : t,
                ),
              }
            : prev,
        );
      } catch {}
    },
    [cauHoiMo],
  );

  // ── Ghim / Đóng (giảng viên) ─────────────────────────────────────
  const ghimCauHoi = useCallback(
    async (idCauHoi: string, ghim: boolean) => {
      await HoiDapService.GhimCauHoi(idCauHoi, ghim);
      setCauHois((prev) =>
        prev.map((c) => (c.id === idCauHoi ? { ...c, daGhim: ghim } : c)),
      );
      if (cauHoiMo?.id === idCauHoi)
        setCauHoiMo((prev) => (prev ? { ...prev, daGhim: ghim } : prev));
    },
    [cauHoiMo],
  );

  const ghimTraLoi = useCallback(async (idTraLoi: string, ghim: boolean) => {
    await HoiDapService.GhimTraLoi(idTraLoi, ghim);
    setCauHoiMo((prev) =>
      prev
        ? {
            ...prev,
            danhSachTraLoi: prev.danhSachTraLoi.map((t) =>
              t.id === idTraLoi ? { ...t, ghimTraLoi: ghim } : t,
            ),
          }
        : prev,
    );
  }, []);

  const dongCauHoi = useCallback(
    async (idCauHoi: string, dong: boolean) => {
      await HoiDapService.DongCauHoi(idCauHoi, dong);
      setCauHois((prev) =>
        prev.map((c) => (c.id === idCauHoi ? { ...c, daDong: dong } : c)),
      );
      if (cauHoiMo?.id === idCauHoi)
        setCauHoiMo((prev) => (prev ? { ...prev, daDong: dong } : prev));
    },
    [cauHoiMo],
  );

  const xoaCauHoi = useCallback(
    async (idCauHoi: string) => {
      await HoiDapService.XoaCauHoi(idCauHoi);
      setCauHois((prev) => prev.filter((c) => c.id !== idCauHoi));
      if (cauHoiMo?.id === idCauHoi) setCauHoiMo(null);
    },
    [cauHoiMo],
  );

  const xoaTraLoi = useCallback(async (idTraLoi: string) => {
    await HoiDapService.XoaTraLoi(idTraLoi);
    setCauHoiMo((prev) =>
      prev
        ? {
            ...prev,
            danhSachTraLoi: prev.danhSachTraLoi.filter(
              (t) => t.id !== idTraLoi,
            ),
            soTraLoi: prev.soTraLoi - 1,
          }
        : prev,
    );
  }, []);

  return {
    cauHois,
    loading,
    loadingMore,
    page,
    totalPages,
    keyword,
    setKeyword,
    sapXep,
    setSapXep,
    cauHoiMo,
    setCauHoiMo,
    loadingChiTiet,
    noiDungMoi,
    setNoiDungMoi,
    dangDat,
    noiDungTraLoi,
    setNoiDungTraLoi,
    dangTraLoi,
    error,
    setError,
    load,
    moChiTiet,
    datCauHoi,
    traLoi,
    toggleLike,
    ghimCauHoi,
    ghimTraLoi,
    dongCauHoi,
    xoaCauHoi,
    xoaTraLoi,
    replyingTo,
    setReplyingTo,
    noiDungReply,
    setNoiDungReply,
    dangReply,
    reply,
  };
}
