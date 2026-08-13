/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Select,
  CircularProgress,
  Divider,
  Drawer,
  Tooltip,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReplyIcon from "@mui/icons-material/Reply";
import CloseIcon from "@mui/icons-material/Close";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { useState, useEffect, useCallback, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import AuthGuard from "@/src/components/AuthGuard";
import { useCourseEdit } from "../../components/CourseEditContext";
import { MAU } from "../../components/courseEditCore";
import HoiDapService, {
  HoiDapDto,
  TraLoiDto,
  SearchHoiDapRequest,
} from "@/src/services/HoiDapService";
import { useSearchParams } from "next/navigation";
import { Alert } from "@mui/material";

function thoiGianTuatoi(ngay: string) {
  try {
    return formatDistanceToNow(new Date(ngay), { addSuffix: true, locale: vi });
  } catch {
    return "";
  }
}

function UserAvatar({
  anh,
  ten,
  size = 36,
}: {
  anh?: string;
  ten?: string;
  size?: number;
}) {
  return (
    <Avatar
      src={anh || ""}
      sx={{
        width: size,
        height: size,
        bgcolor: `${MAU.chinh}22`,
        color: MAU.chinh,
        fontWeight: 700,
        fontSize: size * 0.4,
      }}
    >
      {ten?.[0] || "?"}
    </Avatar>
  );
}

export default function QnAManagerContent() {
  const { idKhoaHoc } = useCourseEdit();
  const searchParams = useSearchParams();

  // ── Filter state ──────────────────────────────────────────────────
  const [keyword, setKeyword] = useState("");
  const [filterLoai, setFilterLoai] = useState<
    "TatCa" | "ChuaTraLoi" | "ChuaDoc" | "NhieuLike"
  >("TatCa");
  const [sapXep, setSapXep] = useState<"MoiNhat" | "NhieuTraLoi" | "DaGhim">(
    "MoiNhat",
  );

  // ── Data state ────────────────────────────────────────────────────
  const [cauHois, setCauHois] = useState<HoiDapDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // ── Chi tiết ─────────────────────────────────────────────────────
  const [cauHoiMo, setCauHoiMo] = useState<HoiDapDto | null>(null);
  const [loadingChiTiet, setLoadingChiTiet] = useState(false);

  // ── Form trả lời ─────────────────────────────────────────────────
  const [noiDungTraLoi, setNoiDungTraLoi] = useState("");
  const [dangTraLoi, setDangTraLoi] = useState(false);

  // ── Reply ─────────────────────────────────────────────────────────
  const [replyingTo, setReplyingTo] = useState<{
    idTraLoi: string;
    tenNguoi: string;
  } | null>(null);
  const [noiDungReply, setNoiDungReply] = useState("");
  const [dangReply, setDangReply] = useState(false);

  // ── AI gợi ý ──────────────────────────────────────────────────────
  const [dangGoiY, setDangGoiY] = useState(false);
  const [aiCoNoiDungBaiGiang, setAiCoNoiDungBaiGiang] = useState<
    boolean | null
  >(null);

  const [error, setError] = useState<string | null>(null);

  // ── Load ──────────────────────────────────────────────────────────
  const load = useCallback(
    async (reset = true) => {
      if (!idKhoaHoc) return;
      reset ? setLoading(true) : setLoadingMore(true);
      try {
        const req: SearchHoiDapRequest = {
          idKhoaHoc,
          keyword: keyword || undefined,
          sapXep: filterLoai === "NhieuLike" ? undefined : sapXep,
          chuaTraLoi: filterLoai === "ChuaTraLoi" ? true : undefined,
          chuaDoc: filterLoai === "ChuaDoc" ? true : undefined,
          nhieuLike: filterLoai === "NhieuLike" ? true : undefined,
          pageNumber: reset ? 1 : page + 1,
          pageSize: 15,
        };
        console.log("📤 QnAManagerContent load request:", req);
        const res = await HoiDapService.GetDanhSachChoGiangVien(req);
        console.log("📥 QnAManagerContent load result:", res);
        setCauHois(reset ? res.items : (prev) => [...prev, ...res.items]);
        setTotalPages(res.totalPages);
        if (!reset) setPage((p) => p + 1);
        else setPage(1);
      } catch (err: any) {
        console.log("❌ QnAManagerContent load error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [idKhoaHoc, keyword, filterLoai, sapXep],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(true);
  }, [idKhoaHoc, filterLoai, sapXep]);

  // ── Mở chi tiết ──────────────────────────────────────────────────
  const moChiTiet = useCallback(async (cauHoi: HoiDapDto) => {
    setLoadingChiTiet(true);
    setNoiDungTraLoi("");
    setReplyingTo(null);
    setAiCoNoiDungBaiGiang(null);
    try {
      const data = await HoiDapService.GetChiTiet(cauHoi.id);
      console.log("🔎 cauHoiMo nhận được:", data);
      setCauHoiMo(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingChiTiet(false);
    }
  }, []);

  // ── AI gợi ý trả lời ─────────────────────────────────────────────
  const goiYTraLoi = useCallback(async () => {
    if (!cauHoiMo) return;
    setDangGoiY(true);
    try {
      const goiY = await HoiDapService.GoiYTraLoi(
        cauHoiMo.id,
        replyingTo?.idTraLoi,
      );
      setNoiDungTraLoi(goiY.noiDungGoiY);
      setAiCoNoiDungBaiGiang(goiY.coNoiDungBaiGiang);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDangGoiY(false);
    }
  }, [cauHoiMo]);

  const goiYTraLoiReply = useCallback(async () => {
    if (!cauHoiMo || !replyingTo) return;
    setDangGoiY(true);
    try {
      const goiY = await HoiDapService.GoiYTraLoi(
        cauHoiMo.id,
        replyingTo.idTraLoi,
      );
      setNoiDungReply(goiY.noiDungGoiY);
      setAiCoNoiDungBaiGiang(goiY.coNoiDungBaiGiang);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDangGoiY(false);
    }
  }, [cauHoiMo, replyingTo]);

  // ── Trả lời ───────────────────────────────────────────────────────
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

  // ── Reply ─────────────────────────────────────────────────────────
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

  // ── Top Answer (ghim) ─────────────────────────────────────────────
  const toggleTopAnswer = useCallback(
    async (idTraLoi: string, ghimHienTai: boolean) => {
      try {
        await HoiDapService.GhimTopAnswer(idTraLoi, !ghimHienTai);
        setCauHoiMo((prev) =>
          prev
            ? {
                ...prev,
                danhSachTraLoi: prev.danhSachTraLoi.map(
                  (t) =>
                    t.id === idTraLoi
                      ? { ...t, ghimTraLoi: !ghimHienTai }
                      : { ...t, ghimTraLoi: false }, // bỏ ghim các cái khác
                ),
              }
            : prev,
        );
      } catch (err: any) {
        setError(err.message);
      }
    },
    [],
  );

  // ── Ghim câu hỏi ─────────────────────────────────────────────────
  const ghimCauHoi = useCallback(
    async (id: string, ghim: boolean) => {
      await HoiDapService.GhimCauHoi(id, ghim);
      setCauHois((prev) =>
        prev.map((c) => (c.id === id ? { ...c, daGhim: ghim } : c)),
      );
      if (cauHoiMo?.id === id)
        setCauHoiMo((prev) => (prev ? { ...prev, daGhim: ghim } : prev));
    },
    [cauHoiMo],
  );

  // ── Đóng câu hỏi ─────────────────────────────────────────────────
  const dongCauHoi = useCallback(
    async (id: string, dong: boolean) => {
      await HoiDapService.DongCauHoi(id, dong);
      setCauHois((prev) =>
        prev.map((c) => (c.id === id ? { ...c, daDong: dong } : c)),
      );
      if (cauHoiMo?.id === id)
        setCauHoiMo((prev) => (prev ? { ...prev, daDong: dong } : prev));
    },
    [cauHoiMo],
  );

  // ── Xóa ──────────────────────────────────────────────────────────
  const xoaCauHoi = useCallback(
    async (id: string) => {
      await HoiDapService.XoaCauHoi(id);
      setCauHois((prev) => prev.filter((c) => c.id !== id));
      if (cauHoiMo?.id === id) setCauHoiMo(null);
    },
    [cauHoiMo],
  );

  const xoaTraLoi = useCallback(async (id: string) => {
    await HoiDapService.XoaTraLoi(id);
    setCauHoiMo((prev) =>
      prev
        ? {
            ...prev,
            danhSachTraLoi: prev.danhSachTraLoi.filter((t) => t.id !== id),
            soTraLoi: prev.soTraLoi - 1,
          }
        : prev,
    );
  }, []);

  useEffect(() => {
    const idCauHoiTuUrl = searchParams.get("idCauHoi");

    if (!idCauHoiTuUrl) return;

    const timer = setTimeout(() => {
      moChiTiet({ id: idCauHoiTuUrl } as HoiDapDto);
    }, 0);

    return () => clearTimeout(timer);
  }, [searchParams, moChiTiet]);

  // ── Render ────────────────────────────────────────────────────────
  return (
    <AuthGuard allowedRoles={["Admin", "GiaoVien"]}>
      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ mb: 2, borderRadius: "10px" }}
        >
          {error}
        </Alert>
      )}
      <Box sx={{ display: "flex", height: "calc(100vh - 200px)", gap: 0 }}>
        {/* ── Cột trái: Danh sách ── */}
        <Box
          sx={{
            width: cauHoiMo ? 380 : "100%",
            flexShrink: 0,
            borderRight: cauHoiMo ? "1px solid #ECE7E4" : "none",
            display: "flex",
            flexDirection: "column",
            transition: "width 0.2s ease",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box sx={{ p: 3, borderBottom: "1px solid #ECE7E4", flexShrink: 0 }}>
            <Typography
              sx={{ fontWeight: 900, fontSize: 20, color: "#1F2937", mb: 2 }}
            >
              Q&A Dashboard
            </Typography>

            {/* Search */}
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm câu hỏi..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load(true)}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  height: "44px",
                  borderRadius: "10px",
                  fontSize: 14,
                  "& fieldset": { borderColor: "#ECE7E4" },
                  "&.Mui-focused fieldset": { borderColor: MAU.chinh },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Filter chips */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {(
                [
                  { val: "TatCa", label: "Tất cả" },
                  { val: "ChuaTraLoi", label: "Chưa trả lời" },
                  { val: "ChuaDoc", label: "Chưa có GV trả lời" },
                  { val: "NhieuLike", label: "Nhiều like" },
                ] as const
              ).map((f) => (
                <Chip
                  key={f.val}
                  label={f.label}
                  onClick={() => setFilterLoai(f.val)}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: 11.5,
                    cursor: "pointer",
                    height: 26,
                    bgcolor: filterLoai === f.val ? MAU.chinh : "transparent",
                    color: filterLoai === f.val ? "#fff" : "#6B7280",
                    border: `1px solid ${filterLoai === f.val ? MAU.chinh : "#ECE7E4"}`,
                    "&:hover": {
                      bgcolor:
                        filterLoai === f.val ? MAU.chinhDam : `${MAU.chinh}08`,
                      color: filterLoai === f.val ? "#fff" : MAU.chinh,
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Danh sách câu hỏi */}
          <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress sx={{ color: MAU.chinh }} />
              </Box>
            ) : cauHois.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <QuestionAnswerOutlinedIcon
                  sx={{ fontSize: 48, color: "#D1D5DB", mb: 1 }}
                />
                <Typography sx={{ fontWeight: 700, color: "#9CA3AF" }}>
                  Không có câu hỏi nào
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {cauHois.map((cauHoi) => (
                  <Paper
                    key={cauHoi.id}
                    elevation={0}
                    onClick={() => moChiTiet(cauHoi)}
                    sx={{
                      p: 2,
                      borderRadius: "12px",
                      cursor: "pointer",
                      border: `1px solid ${
                        cauHoiMo?.id === cauHoi.id
                          ? `${MAU.chinh}66`
                          : cauHoi.daGhim
                            ? "#FDE68A"
                            : "#ECE7E4"
                      }`,
                      bgcolor:
                        cauHoiMo?.id === cauHoi.id
                          ? `${MAU.chinh}06`
                          : cauHoi.daGhim
                            ? "#FFFBEB"
                            : "#fff",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        borderColor: MAU.chinh,
                        bgcolor: `${MAU.chinh}04`,
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                      },
                    }}
                  >
                    {/* Câu hỏi */}
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#1F2937",
                        mb: 1,
                        lineHeight: 1.5,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      ❓ {cauHoi.noiDung}
                    </Typography>

                    {/* Bài giảng */}
                    {cauHoi.tenBaiGiang && (
                      <Typography
                        sx={{ fontSize: 11.5, color: "#8A7676", mb: 1 }}
                      >
                        📹 {cauHoi.tenBaiGiang}
                      </Typography>
                    )}

                    {/* Info row */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        flexWrap: "wrap",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <UserAvatar
                          anh={cauHoi.nguoiHoiAnh}
                          ten={cauHoi.nguoiHoiTen}
                          size={20}
                        />
                        <Typography
                          sx={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#4B5563",
                          }}
                        >
                          {cauHoi.nguoiHoiTen || "Ẩn danh"}
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <ThumbUpOutlinedIcon
                          sx={{ fontSize: 12, color: "#9CA3AF" }}
                        />
                        <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                          {cauHoi.tongLike ?? 0}
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <QuestionAnswerOutlinedIcon
                          sx={{ fontSize: 12, color: "#9CA3AF" }}
                        />
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "#6B7280",
                            fontWeight: 700,
                          }}
                        >
                          {cauHoi.soTraLoi}
                        </Typography>
                      </Box>

                      {cauHoi.soTraLoi === 0 && (
                        <Chip
                          label="Chưa trả lời"
                          size="small"
                          sx={{
                            fontSize: 10,
                            height: 18,
                            bgcolor: "#FEF3C7",
                            color: "#D97706",
                            fontWeight: 700,
                          }}
                        />
                      )}
                      {cauHoi.daGhim && (
                        <Chip
                          label="📌 Ghim"
                          size="small"
                          sx={{
                            fontSize: 10,
                            height: 18,
                            bgcolor: "#FEF3C7",
                            color: "#D97706",
                          }}
                        />
                      )}
                      {cauHoi.daDong && (
                        <Chip
                          label="🔒 Đóng"
                          size="small"
                          sx={{
                            fontSize: 10,
                            height: 18,
                            bgcolor: "#FEE2E2",
                            color: "#DC2626",
                          }}
                        />
                      )}

                      <Typography
                        sx={{ fontSize: 11, color: "#9CA3AF", ml: "auto" }}
                      >
                        {thoiGianTuatoi(cauHoi.ngayTao)}
                      </Typography>
                    </Box>
                  </Paper>
                ))}

                {page < totalPages && (
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => load(false)}
                    disabled={loadingMore}
                    sx={{
                      mt: 1,
                      textTransform: "none",
                      borderRadius: "10px",
                      borderColor: "#ECE7E4",
                      color: "#6B7280",
                      "&:hover": { borderColor: MAU.chinh, color: MAU.chinh },
                    }}
                  >
                    {loadingMore ? (
                      <CircularProgress size={18} sx={{ color: MAU.chinh }} />
                    ) : (
                      "Xem thêm"
                    )}
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* ── Cột phải: Chi tiết câu hỏi ── */}
        {cauHoiMo && (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {loadingChiTiet ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress sx={{ color: MAU.chinh }} />
              </Box>
            ) : (
              <>
                {/* Header chi tiết */}
                <Box
                  sx={{
                    p: 2.5,
                    borderBottom: "1px solid #ECE7E4",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      {cauHoiMo.daGhim && (
                        <Chip
                          label="📌 Được ghim"
                          size="small"
                          sx={{
                            fontSize: 10,
                            height: 18,
                            bgcolor: "#FEF3C7",
                            color: "#D97706",
                          }}
                        />
                      )}
                      {cauHoiMo.daDong && (
                        <Chip
                          label="🔒 Đã đóng"
                          size="small"
                          sx={{
                            fontSize: 10,
                            height: 18,
                            bgcolor: "#FEE2E2",
                            color: "#DC2626",
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: "#1F2937",
                        lineHeight: 1.5,
                      }}
                    >
                      {cauHoiMo.noiDung}
                    </Typography>
                    {cauHoiMo.tenBaiGiang && (
                      <Typography
                        sx={{ fontSize: 12, color: "#8A7676", mt: 0.5 }}
                      >
                        📹 {cauHoiMo.tenBaiGiang}
                      </Typography>
                    )}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        mt: 1,
                      }}
                    >
                      <UserAvatar
                        anh={cauHoiMo.nguoiHoiAnh}
                        ten={cauHoiMo.nguoiHoiTen}
                        size={22}
                      />
                      <Typography
                        sx={{ fontSize: 12, color: "#4B5563", fontWeight: 600 }}
                      >
                        {cauHoiMo.nguoiHoiTen}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>
                        {thoiGianTuatoi(cauHoiMo.ngayTao)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Actions giảng viên */}
                  <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                    <Tooltip
                      title={cauHoiMo.daGhim ? "Bỏ ghim" : "Ghim câu hỏi"}
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          ghimCauHoi(cauHoiMo.id, !cauHoiMo.daGhim)
                        }
                        sx={{ color: cauHoiMo.daGhim ? "#D97706" : "#9CA3AF" }}
                      >
                        {cauHoiMo.daGhim ? (
                          <PushPinIcon fontSize="small" />
                        ) : (
                          <PushPinOutlinedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={cauHoiMo.daDong ? "Mở lại" : "Đóng câu hỏi"}
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          dongCauHoi(cauHoiMo.id, !cauHoiMo.daDong)
                        }
                        sx={{ color: cauHoiMo.daDong ? "#DC2626" : "#9CA3AF" }}
                      >
                        {cauHoiMo.daDong ? (
                          <LockOutlinedIcon fontSize="small" />
                        ) : (
                          <LockOpenOutlinedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa câu hỏi">
                      <IconButton
                        size="small"
                        onClick={() => xoaCauHoi(cauHoiMo.id)}
                        sx={{
                          color: "#9CA3AF",
                          "&:hover": { color: "#DC2626" },
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={() => setCauHoiMo(null)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Danh sách trả lời */}
                <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
                  {cauHoiMo.danhSachTraLoi.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 6 }}>
                      <QuestionAnswerOutlinedIcon
                        sx={{ fontSize: 40, color: "#D1D5DB", mb: 1 }}
                      />
                      <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>
                        Chưa có câu trả lời nào
                      </Typography>
                    </Box>
                  ) : (
                    // Sort: top answer lên đầu, sau đó theo thứ tự
                    [...cauHoiMo.danhSachTraLoi]
                      .sort(
                        (a, b) =>
                          (b.ghimTraLoi ? 1 : 0) - (a.ghimTraLoi ? 1 : 0),
                      )
                      .map((tl, idx, arr) => (
                        <Box key={tl.id}>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1.5,
                              py: 2,
                              ...(tl.ghimTraLoi
                                ? {
                                    bgcolor: "#FFFBEB",
                                    border: "1px solid #FDE68A",
                                    borderRadius: "12px",
                                    px: 2,
                                    mx: -2,
                                    mb: 1,
                                  }
                                : {}),
                            }}
                          >
                            <UserAvatar
                              anh={tl.nguoiTraLoiAnh}
                              ten={tl.nguoiTraLoiTen}
                              size={32}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              {/* Header trả lời */}
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 0.5,
                                  flexWrap: "wrap",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: 13,
                                    color: "#1F2937",
                                  }}
                                >
                                  {tl.nguoiTraLoiTen || "Ẩn danh"}
                                </Typography>
                                {tl.laGiangVien && (
                                  <Chip
                                    icon={
                                      <SchoolOutlinedIcon
                                        sx={{ fontSize: 12 }}
                                      />
                                    }
                                    label="Giảng viên"
                                    size="small"
                                    sx={{
                                      fontSize: 10,
                                      fontWeight: 700,
                                      height: 18,
                                      bgcolor: `${MAU.chinh}14`,
                                      color: MAU.chinh,
                                    }}
                                  />
                                )}
                                {tl.ghimTraLoi && (
                                  <Chip
                                    icon={<StarIcon sx={{ fontSize: 12 }} />}
                                    label="Top Answer"
                                    size="small"
                                    sx={{
                                      fontSize: 10,
                                      fontWeight: 700,
                                      height: 18,
                                      bgcolor: "#FEF3C7",
                                      color: "#D97706",
                                    }}
                                  />
                                )}
                                <Typography
                                  sx={{
                                    fontSize: 11,
                                    color: "#9CA3AF",
                                    ml: "auto",
                                  }}
                                >
                                  {thoiGianTuatoi(tl.ngayTao)}
                                </Typography>
                              </Box>

                              {/* Nội dung — @mention highlight */}
                              <Typography
                                sx={{
                                  fontSize: 14,
                                  color: "#374151",
                                  lineHeight: 1.6,
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {tl.noiDung.startsWith("@") ? (
                                  <>
                                    <Box
                                      component="span"
                                      sx={{ color: MAU.chinh, fontWeight: 700 }}
                                    >
                                      {tl.noiDung.split(" ")[0]}
                                    </Box>
                                    {" " +
                                      tl.noiDung.split(" ").slice(1).join(" ")}
                                  </>
                                ) : (
                                  tl.noiDung
                                )}
                              </Typography>

                              {/* Actions */}
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                  mt: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <ThumbUpOutlinedIcon
                                    sx={{ fontSize: 13, color: "#9CA3AF" }}
                                  />
                                  <Typography
                                    sx={{ fontSize: 12, color: "#6B7280" }}
                                  >
                                    {tl.soLike}
                                  </Typography>
                                </Box>

                                <Button
                                  size="small"
                                  startIcon={
                                    <ReplyIcon sx={{ fontSize: 13 }} />
                                  }
                                  onClick={() => {
                                    setReplyingTo({
                                      idTraLoi: tl.id,
                                      tenNguoi: tl.nguoiTraLoiTen || "Ẩn danh",
                                    });
                                    setNoiDungReply("");
                                  }}
                                  sx={{
                                    textTransform: "none",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "#6B7280",
                                    p: "2px 8px",
                                    minWidth: 0,
                                    "&:hover": {
                                      color: MAU.chinh,
                                      bgcolor: `${MAU.chinh}08`,
                                    },
                                  }}
                                >
                                  Phản hồi
                                </Button>

                                {/* Nút Top Answer */}
                                <Tooltip
                                  title={
                                    tl.ghimTraLoi
                                      ? "Bỏ Top Answer"
                                      : "Đánh dấu Top Answer"
                                  }
                                >
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      toggleTopAnswer(tl.id, tl.ghimTraLoi)
                                    }
                                    sx={{
                                      p: 0.5,
                                      color: tl.ghimTraLoi
                                        ? "#D97706"
                                        : "#9CA3AF",
                                      "&:hover": { color: "#D97706" },
                                    }}
                                  >
                                    {tl.ghimTraLoi ? (
                                      <StarIcon sx={{ fontSize: 16 }} />
                                    ) : (
                                      <StarBorderIcon sx={{ fontSize: 16 }} />
                                    )}
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Xóa">
                                  <IconButton
                                    size="small"
                                    onClick={() => xoaTraLoi(tl.id)}
                                    sx={{
                                      p: 0.5,
                                      color: "#9CA3AF",
                                      "&:hover": { color: "#DC2626" },
                                    }}
                                  >
                                    <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </Box>
                          {idx < arr.length - 1 && <Divider sx={{ my: 0.5 }} />}
                        </Box>
                      ))
                  )}
                </Box>

                {/* Form phản hồi */}
                {!cauHoiMo.daDong && replyingTo && (
                  <Box
                    sx={{
                      px: 2.5,
                      pt: 1.5,
                      borderTop: "1px solid #ECE7E4",
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      sx={{
                        mb: 1.5,
                        px: 1.5,
                        py: 1,
                        bgcolor: `${MAU.chinh}08`,
                        border: `1px solid ${MAU.chinh}22`,
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        sx={{ fontSize: 12, fontWeight: 700, color: MAU.chinh }}
                      >
                        ↩ Đang phản hồi @{replyingTo.tenNguoi}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setReplyingTo(null)}
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>

                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      maxRows={4}
                      placeholder={`Phản hồi @${replyingTo.tenNguoi}...`}
                      value={noiDungReply}
                      onChange={(e) => setNoiDungReply(e.target.value)}
                      disabled={dangReply || dangGoiY}
                      autoFocus
                      sx={{
                        mb: 1,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          fontSize: 14,
                          "& fieldset": { borderColor: "#ECE7E4" },
                          "&.Mui-focused fieldset": { borderColor: MAU.chinh },
                        },
                      }}
                    />

                    {aiCoNoiDungBaiGiang === false && (
                      <Typography
                        sx={{ fontSize: 11.5, color: "#D97706", mb: 1 }}
                      >
                        ⚠️ AI chưa đọc được tài liệu của bài giảng này (chưa có
                        tài liệu hoặc chưa được duyệt), chỉ dựa vào thông tin
                        khóa học.
                      </Typography>
                    )}

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        pb: 1.5,
                      }}
                    >
                      <Button
                        size="small"
                        startIcon={
                          dangGoiY ? (
                            <CircularProgress
                              size={14}
                              sx={{ color: MAU.chinh }}
                            />
                          ) : (
                            <AutoAwesomeIcon sx={{ fontSize: 16 }} />
                          )
                        }
                        onClick={goiYTraLoiReply}
                        disabled={dangGoiY || dangReply}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: 12.5,
                          color: MAU.chinh,
                          "&:hover": { bgcolor: `${MAU.chinh}0A` },
                        }}
                      >
                        {dangGoiY ? "Đang tạo gợi ý..." : "AI gợi ý"}
                      </Button>

                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          onClick={() => setReplyingTo(null)}
                          sx={{
                            textTransform: "none",
                            color: "#6B7280",
                            fontWeight: 600,
                          }}
                        >
                          Hủy
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={
                            dangReply || dangGoiY || !noiDungReply.trim()
                          }
                          onClick={reply}
                          sx={{
                            bgcolor: MAU.chinh,
                            textTransform: "none",
                            fontWeight: 700,
                            borderRadius: "8px",
                            boxShadow: "none",
                            "&:hover": {
                              bgcolor: MAU.chinhDam,
                              boxShadow: "none",
                            },
                          }}
                        >
                          {dangReply ? (
                            <CircularProgress
                              size={14}
                              sx={{ color: "#fff" }}
                            />
                          ) : (
                            "Gửi phản hồi"
                          )}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Form trả lời chính */}
                {!cauHoiMo.daDong && !replyingTo && (
                  <Box
                    sx={{
                      px: 2.5,
                      pt: 1.5,
                      pb: 2,
                      borderTop: "1px solid #ECE7E4",
                      flexShrink: 0,
                    }}
                  >
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      maxRows={5}
                      placeholder="Viết câu trả lời với tư cách giảng viên..."
                      value={noiDungTraLoi}
                      onChange={(e) => setNoiDungTraLoi(e.target.value)}
                      disabled={dangTraLoi || dangGoiY}
                      sx={{
                        mb: 1,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          fontSize: 14,
                          "& fieldset": { borderColor: "#ECE7E4" },
                          "&.Mui-focused fieldset": { borderColor: MAU.chinh },
                        },
                      }}
                    />

                    {/* Cảnh báo nếu AI thiếu context bài giảng */}
                    {aiCoNoiDungBaiGiang === false && (
                      <Typography
                        sx={{ fontSize: 11.5, color: "#D97706", mb: 1 }}
                      >
                        ⚠️ AI chưa đọc được tài liệu của bài giảng này (chưa có
                        tài liệu hoặc chưa được duyệt), chỉ dựa vào thông tin
                        khóa học.
                      </Typography>
                    )}

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        size="small"
                        startIcon={
                          dangGoiY ? (
                            <CircularProgress
                              size={14}
                              sx={{ color: MAU.chinh }}
                            />
                          ) : (
                            <AutoAwesomeIcon sx={{ fontSize: 16 }} />
                          )
                        }
                        onClick={goiYTraLoi}
                        disabled={dangGoiY || dangTraLoi}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: 12.5,
                          color: MAU.chinh,
                          "&:hover": { bgcolor: `${MAU.chinh}0A` },
                        }}
                      >
                        {dangGoiY ? "Đang tạo gợi ý..." : "AI gợi ý"}
                      </Button>

                      <Button
                        variant="contained"
                        size="small"
                        disabled={
                          dangTraLoi || dangGoiY || !noiDungTraLoi.trim()
                        }
                        onClick={traLoi}
                        sx={{
                          bgcolor: MAU.chinh,
                          textTransform: "none",
                          fontWeight: 700,
                          borderRadius: "8px",
                          boxShadow: "none",
                          "&:hover": {
                            bgcolor: MAU.chinhDam,
                            boxShadow: "none",
                          },
                        }}
                      >
                        {dangTraLoi ? (
                          <CircularProgress size={16} sx={{ color: "#fff" }} />
                        ) : (
                          "Trả lời"
                        )}
                      </Button>
                    </Box>
                  </Box>
                )}

                {cauHoiMo.daDong && (
                  <Box
                    sx={{
                      p: 2,
                      m: 2.5,
                      bgcolor: "#FEE2E2",
                      borderRadius: "10px",
                      textAlign: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      sx={{ fontSize: 13, color: "#DC2626", fontWeight: 600 }}
                    >
                      🔒 Câu hỏi này đã bị đóng
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        )}
      </Box>
    </AuthGuard>
  );
}
