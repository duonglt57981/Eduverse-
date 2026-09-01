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
  CircularProgress,
  Divider,
  Tooltip,
  InputAdornment,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import ReplyIcon from "@mui/icons-material/Reply";
import CloseIcon from "@mui/icons-material/Close";
import ClearIcon from "@mui/icons-material/Clear";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import PlayCircleFilledWhiteOutlinedIcon from "@mui/icons-material/PlayCircleFilledWhiteOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import { useState, useEffect, useCallback, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import AuthGuard from "@/src/components/AuthGuard";
import { useCourseEdit } from "../../components/CourseEditContext";
import { MAU } from "../../components/courseEditCore";
import { useQuyenCuaToi } from "@/src/hook/useQuyenCuaToi";
import HoiDapService, {
  HoiDapDto,
  TraLoiDto,
  SearchHoiDapRequest,
} from "@/src/services/HoiDapService";
import { useSearchParams } from "next/navigation";
import { BRAND, STATUS, NEUTRAL } from "@/src/theme/tokens";
import { EduAvatar } from "@/src/components/common/EduAvatar";

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
  isInstructor = false,
}: {
  anh?: string;
  ten?: string;
  size?: number;
  isInstructor?: boolean;
}) {
  return (
    <EduAvatar
      src={anh}
      name={ten}
      size={size}
      border={isInstructor ? `2px solid ${BRAND.main}` : true}
      shadow={isInstructor ? `0 2px 8px ${BRAND.main}30` : true}
    />
  );
}

// ── Cây trả lời (build từ idTraLoiDuocReply) ─────────────────────────────
interface TraLoiNode {
  traLoi: TraLoiDto;
  con: TraLoiNode[];
}

function xayDungCayTraLoi(danhSach: TraLoiDto[]): TraLoiNode[] {
  const mapNode = new Map<string, TraLoiNode>();
  danhSach.forEach((tl) => mapNode.set(tl.id, { traLoi: tl, con: [] }));

  const goc: TraLoiNode[] = [];

  danhSach.forEach((tl) => {
    const node = mapNode.get(tl.id)!;
    const idCha = tl.idTraLoiDuocReply;
    if (idCha && mapNode.has(idCha)) {
      mapNode.get(idCha)!.con.push(node);
    } else {
      goc.push(node);
    }
  });

  const sapXep = (nodes: TraLoiNode[]) => {
    nodes.sort(
      (a, b) =>
        new Date(a.traLoi.ngayTao).getTime() -
        new Date(b.traLoi.ngayTao).getTime(),
    );
    nodes.forEach((n) => sapXep(n.con));
  };
  sapXep(goc);

  return goc;
}

// ── Card câu trả lời ─────────────────────────────────────────────────────
function TraLoiCard({
  traLoi,
  tenNguoiDuocReply,
  depth,
  laCuoiNhom,
  onToggleTopAnswer,
  onXoa,
  onReply,
}: {
  traLoi: TraLoiDto;
  tenNguoiDuocReply?: string;
  depth: number;
  laCuoiNhom: boolean;
  onLike: () => void;
  onToggleTopAnswer: () => void;
  onXoa: () => void;
  onReply: (idTraLoi: string, tenNguoi: string) => void;
}) {
  const isTopAnswer = Boolean(traLoi.ghimTraLoi);
  const isGV = Boolean(traLoi.laGiangVien);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.75,
        pt: 2,
        pb: laCuoiNhom ? 0 : 2,
      }}
    >
      {/* Đường nối ngang */}
      {depth > 0 && (
        <Box
          sx={{
            width: "18px",
            height: "2px",
            bgcolor: "#E2E8F0",
            flexShrink: 0,
            mt: "18px",
            ml: "-18px",
          }}
        />
      )}

      <UserAvatar
        anh={traLoi.nguoiTraLoiAnh}
        ten={traLoi.nguoiTraLoiTen}
        size={34}
        isInstructor={isGV}
      />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Comment Box Container */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: "16px",
            bgcolor: isTopAnswer
              ? "#FFFDF5"
              : isGV
                ? "#FAF7F6"
                : "#F8FAFC",
            border: `1px solid ${
              isTopAnswer
                ? "#FDE68A"
                : isGV
                  ? "rgba(139, 19, 19, 0.15)"
                  : "#E2E8F0"
            }`,
            boxShadow: isTopAnswer
              ? "0 4px 14px rgba(245, 158, 11, 0.12)"
              : "0 1px 3px rgba(0, 0, 0, 0.02)",
            position: "relative",
            transition: "all 0.2s ease",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
              borderColor: isTopAnswer ? "#F59E0B" : isGV ? BRAND.main : "#CBD5E1",
            },
          }}
        >
          {/* Header trả lời */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 0.75,
              flexWrap: "wrap",
            }}
          >
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "0.88rem",
                color: isGV ? BRAND.dark : "#0F172A",
              }}
            >
              {traLoi.nguoiTraLoiTen || "Ẩn danh"}
            </Typography>

            {isGV && (
              <Chip
                icon={
                  <SchoolOutlinedIcon
                    sx={{ fontSize: "13px !important", color: "#FFFFFF !important" }}
                  />
                }
                label="Giảng viên"
                size="small"
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  height: 20,
                  bgcolor: BRAND.main,
                  color: "#FFFFFF",
                  borderRadius: "6px",
                  px: 0.5,
                }}
              />
            )}

            {isTopAnswer && (
              <Chip
                icon={
                  <StarIcon
                    sx={{ fontSize: "13px !important", color: "#92400E !important" }}
                  />
                }
                label="Top Answer"
                size="small"
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  height: 20,
                  bgcolor: "#FEF3C7",
                  color: "#92400E",
                  border: "1px solid #FDE68A",
                  borderRadius: "6px",
                }}
              />
            )}

            <Typography
              sx={{
                fontSize: "0.76rem",
                color: "#94A3B8",
                ml: "auto",
                fontWeight: 500,
              }}
            >
              {thoiGianTuatoi(traLoi.ngayTao)}
            </Typography>
          </Box>

          {/* Nhãn "Trả lời @Ten" */}
          {tenNguoiDuocReply && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                mb: 1,
                px: 1,
                py: 0.25,
                borderRadius: "6px",
                bgcolor: "rgba(139, 19, 19, 0.06)",
              }}
            >
              <SubdirectoryArrowRightIcon
                sx={{ fontSize: 13, color: BRAND.main, opacity: 0.8 }}
              />
              <Typography
                sx={{ fontSize: "0.75rem", fontWeight: 700, color: BRAND.main }}
              >
                Trả lời @{tenNguoiDuocReply}
              </Typography>
            </Box>
          )}

          {/* Nội dung */}
          <Typography
            sx={{
              fontSize: "0.9rem",
              color: "#334155",
              lineHeight: 1.65,
              whiteSpace: "pre-wrap",
            }}
          >
            {traLoi.noiDung}
          </Typography>

          {/* Actions Bar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 1.5,
              pt: 1,
              borderTop: "1px solid rgba(0,0,0,0.04)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "#64748B",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                }}
              >
                <ThumbUpOutlinedIcon sx={{ fontSize: 14 }} />
                <span>{traLoi.soLike}</span>
              </Box>

              <Button
                size="small"
                startIcon={<ReplyIcon sx={{ fontSize: 14 }} />}
                onClick={() =>
                  onReply(traLoi.id, traLoi.nguoiTraLoiTen || "Ẩn danh")
                }
                sx={{
                  textTransform: "none",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "#475569",
                  p: "2px 8px",
                  borderRadius: "8px",
                  "&:hover": { color: BRAND.main, bgcolor: "rgba(139, 19, 19, 0.08)" },
                }}
              >
                Phản hồi
              </Button>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Tooltip
                title={isTopAnswer ? "Bỏ đánh dấu Top Answer" : "Đánh dấu là Top Answer"}
              >
                <IconButton
                  size="small"
                  onClick={onToggleTopAnswer}
                  sx={{
                    p: 0.5,
                    color: isTopAnswer ? "#D97706" : "#94A3B8",
                    "&:hover": { color: "#D97706", bgcolor: "#FEF3C7" },
                  }}
                >
                  {isTopAnswer ? (
                    <StarIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <StarBorderIcon sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title="Xóa câu trả lời này">
                <IconButton
                  size="small"
                  onClick={onXoa}
                  sx={{
                    p: 0.5,
                    color: "#94A3B8",
                    "&:hover": { color: STATUS.error, bgcolor: "#FEE2E2" },
                  }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

// ── Nhóm trả lời con ──────────────────────────────────────────────────────
const SO_LUONG_HIEN_MAC_DINH = 2;

function TraLoiChildren({
  nodes,
  depth,
  tenTheoId,
  onLike,
  onToggleTopAnswer,
  onXoa,
  onReply,
  soLuongHienMacDinh = SO_LUONG_HIEN_MAC_DINH,
  coDuongDoc = true,
}: {
  nodes: TraLoiNode[];
  depth: number;
  tenTheoId: Map<string, string>;
  onLike: (id: string) => void;
  onToggleTopAnswer: (id: string, ghimHienTai: boolean) => void;
  onXoa: (id: string) => void;
  onReply: (idTraLoi: string, tenNguoi: string) => void;
  soLuongHienMacDinh?: number;
  coDuongDoc?: boolean;
}) {
  const [daMoRong, setDaMoRong] = useState(false);

  const coTheAn = nodes.length > soLuongHienMacDinh;
  const nodesHienThi =
    coTheAn && !daMoRong ? nodes.slice(0, soLuongHienMacDinh) : nodes;
  const soLuongAn = nodes.length - soLuongHienMacDinh;

  return (
    <Box
      sx={
        coDuongDoc
          ? {
              ml: "16px",
              pl: "18px",
              borderLeft: "2px solid #E2E8F0",
            }
          : {}
      }
    >
      <TraLoiThread
        nodes={nodesHienThi}
        depth={depth}
        tenTheoId={tenTheoId}
        onLike={onLike}
        onToggleTopAnswer={onToggleTopAnswer}
        onXoa={onXoa}
        onReply={onReply}
      />

      {coTheAn && (
        <Button
          size="small"
          onClick={() => setDaMoRong((v) => !v)}
          startIcon={
            <SubdirectoryArrowRightIcon
              sx={{ fontSize: 13, transform: daMoRong ? "scaleY(-1)" : "none" }}
            />
          }
          sx={{
            textTransform: "none",
            fontSize: "0.78rem",
            fontWeight: 800,
            color: BRAND.main,
            p: "4px 10px",
            my: 0.5,
            borderRadius: "8px",
            "&:hover": { bgcolor: "rgba(139, 19, 19, 0.08)" },
          }}
        >
          {daMoRong ? "Thu gọn phản hồi" : `Xem thêm ${soLuongAn} phản hồi`}
        </Button>
      )}
    </Box>
  );
}

// ── Render đệ quy cây trả lời ─────────────────────────────────────────────
function TraLoiThread({
  nodes,
  depth,
  tenTheoId,
  onLike,
  onToggleTopAnswer,
  onXoa,
  onReply,
}: {
  nodes: TraLoiNode[];
  depth: number;
  tenTheoId: Map<string, string>;
  onLike: (id: string) => void;
  onToggleTopAnswer: (id: string, ghimHienTai: boolean) => void;
  onXoa: (id: string) => void;
  onReply: (idTraLoi: string, tenNguoi: string) => void;
}) {
  return (
    <Box>
      {nodes.map((node, idx) => {
        const { traLoi, con } = node;
        const idCha = traLoi.idTraLoiDuocReply;
        const tenCha = idCha ? tenTheoId.get(idCha) : undefined;
        const laCuoiNhom = idx === nodes.length - 1 && con.length === 0;

        return (
          <Box key={traLoi.id}>
            <TraLoiCard
              traLoi={traLoi}
              tenNguoiDuocReply={depth > 0 ? tenCha : undefined}
              depth={depth}
              laCuoiNhom={laCuoiNhom}
              onLike={() => onLike(traLoi.id)}
              onToggleTopAnswer={() =>
                onToggleTopAnswer(traLoi.id, traLoi.ghimTraLoi)
              }
              onXoa={() => onXoa(traLoi.id)}
              onReply={onReply}
            />
            {con.length > 0 && (
              <TraLoiChildren
                nodes={con}
                depth={depth + 1}
                tenTheoId={tenTheoId}
                onLike={onLike}
                onToggleTopAnswer={onToggleTopAnswer}
                onXoa={onXoa}
                onReply={onReply}
              />
            )}
            {depth === 0 && idx < nodes.length - 1 && (
              <Box sx={{ pt: 0.5, pb: 0.5 }}>
                <Divider sx={{ borderColor: "#F1F5F9" }} />
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ── COMPONENT CHÍNH ────────────────────────────────────────────────────────
export default function QnAManagerContent() {
  const { idKhoaHoc, trangThai } = useCourseEdit();
  const { coQuyen, loading: loadingQuyen } = useQuyenCuaToi(idKhoaHoc);
  const searchParams = useSearchParams();

  // ── Filter state ──────────────────────────────────────────────────
  const [keyword, setKeyword] = useState("");
  const [filterLoai, setFilterLoai] = useState<
    "TatCa" | "ChuaTraLoi" | "ChuaDoc" | "NhieuLike"
  >("TatCa");
  const [sapXep] = useState<"MoiNhat" | "NhieuTraLoi" | "DaGhim">(
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

  // ── Load danh sách câu hỏi ─────────────────────────────────────────
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
        const res = await HoiDapService.GetDanhSachChoGiangVien(req);
        setCauHois(reset ? res.items : (prev) => [...prev, ...res.items]);
        setTotalPages(res.totalPages);
        if (!reset) setPage((p) => p + 1);
        else setPage(1);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [idKhoaHoc, keyword, filterLoai, sapXep, page],
  );

  useEffect(() => {
    load(true);
  }, [idKhoaHoc, filterLoai, sapXep]);

  // ── Mở chi tiết câu hỏi ──────────────────────────────────────────
  const moChiTiet = useCallback(async (cauHoi: HoiDapDto) => {
    setLoadingChiTiet(true);
    setNoiDungTraLoi("");
    setReplyingTo(null);
    setAiCoNoiDungBaiGiang(null);
    try {
      const data = await HoiDapService.GetChiTiet(cauHoi.id);
      setCauHoiMo(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingChiTiet(false);
    }
  }, []);

  // ── AI gợi ý ─────────────────────────────────────────────────────
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
  }, [cauHoiMo, replyingTo]);

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
    setError(null);
    try {
      const tl = await HoiDapService.TraLoi({
        idCauHoi: cauHoiMo.id,
        noiDung: noiDungTraLoi.trim(),
      });
      if (tl) {
        setCauHoiMo((prev) =>
          prev
            ? {
                ...prev,
                danhSachTraLoi: [...(prev.danhSachTraLoi || []), tl],
                soTraLoi: (prev.soTraLoi || 0) + 1,
              }
            : prev,
        );
        setCauHois((prev) =>
          prev.map((c) =>
            c.id === cauHoiMo.id ? { ...c, soTraLoi: (c.soTraLoi || 0) + 1 } : c,
          ),
        );
        setNoiDungTraLoi("");
      }
    } catch (err: any) {
      console.error("Lỗi gửi câu trả lời:", err);
      setError(err?.message || "Không thể gửi câu trả lời");
    } finally {
      setDangTraLoi(false);
    }
  }, [cauHoiMo, noiDungTraLoi]);

  // ── Reply ─────────────────────────────────────────────────────────
  const reply = useCallback(async () => {
    if (!cauHoiMo || !replyingTo || !noiDungReply.trim()) return;
    setDangReply(true);
    setError(null);
    try {
      const tl = await HoiDapService.Reply({
        idCauHoi: cauHoiMo.id,
        idTraLoiDuocReply: replyingTo.idTraLoi,
        noiDung: noiDungReply.trim(),
      });
      if (tl) {
        setCauHoiMo((prev) =>
          prev
            ? {
                ...prev,
                soTraLoi: (prev.soTraLoi || 0) + 1,
                danhSachTraLoi: [...(prev.danhSachTraLoi || []), tl],
              }
            : prev,
        );
        setNoiDungReply("");
        setReplyingTo(null);
      }
    } catch (err: any) {
      console.error("Lỗi gửi phản hồi:", err);
      setError(err?.message || "Không thể gửi phản hồi");
    } finally {
      setDangReply(false);
    }
  }, [cauHoiMo, replyingTo, noiDungReply]);

  // ── Top Answer ────────────────────────────────────────────────────
  const toggleTopAnswer = useCallback(
    async (idTraLoi: string, ghimHienTai: boolean) => {
      try {
        await HoiDapService.GhimTopAnswer(idTraLoi, !ghimHienTai);
        setCauHoiMo((prev) =>
          prev
            ? {
                ...prev,
                danhSachTraLoi: prev.danhSachTraLoi.map((t) =>
                  t.id === idTraLoi
                    ? { ...t, ghimTraLoi: !ghimHienTai }
                    : { ...t, ghimTraLoi: false },
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

  // ── Xóa câu hỏi ──────────────────────────────────────────────────
  const xoaCauHoi = useCallback(
    async (id: string) => {
      await HoiDapService.XoaCauHoi(id);
      setCauHois((prev) => prev.filter((c) => c.id !== id));
      if (cauHoiMo?.id === id) setCauHoiMo(null);
    },
    [cauHoiMo],
  );

  // ── Xóa trả lời ──────────────────────────────────────────────────
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

  const cayTraLoi = useMemo(() => {
    if (!cauHoiMo) return [];
    const cay = xayDungCayTraLoi(cauHoiMo.danhSachTraLoi);
    return [...cay].sort(
      (a, b) => (b.traLoi.ghimTraLoi ? 1 : 0) - (a.traLoi.ghimTraLoi ? 1 : 0),
    );
  }, [cauHoiMo]);

  const tenTheoId = useMemo(() => {
    const m = new Map<string, string>();
    if (cauHoiMo) {
      cauHoiMo.danhSachTraLoi.forEach((tl) =>
        m.set(tl.id, tl.nguoiTraLoiTen || "Ẩn danh"),
      );
    }
    return m;
  }, [cauHoiMo]);

  // Quick stats
  const totalQuestions = cauHois.length;
  const unansweredCount = cauHois.filter((c) => c.soTraLoi === 0).length;
  const pinnedCount = cauHois.filter((c) => c.daGhim).length;

  if (loadingQuyen) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress sx={{ color: BRAND.main }} />
      </Box>
    );
  }

  if (trangThai !== "DaDuyet") {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: "center",
          borderRadius: "24px",
          border: "1.5px dashed #CBD5E1",
          bgcolor: "#F8FAFC",
          my: 4,
        }}
      >
        <HelpOutlineOutlinedIcon sx={{ fontSize: 48, color: "#94A3B8", mb: 1.5 }} />
        <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#334155", mb: 0.5 }}>
          Hỏi đáp chưa khả dụng
        </Typography>
        <Typography sx={{ fontSize: "0.88rem", color: "#64748B" }}>
          Chức năng hỏi đáp & thảo luận chỉ khả dụng sau khi khóa học được phê duyệt chính thức.
        </Typography>
      </Paper>
    );
  }

  if (!coQuyen("qnA")) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: "center",
          borderRadius: "24px",
          border: "1.5px dashed #CBD5E1",
          bgcolor: "#F8FAFC",
          my: 4,
        }}
      >
        <LockOutlinedIcon sx={{ fontSize: 48, color: "#94A3B8", mb: 1.5 }} />
        <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#334155", mb: 0.5 }}>
          Không có quyền truy cập
        </Typography>
        <Typography sx={{ fontSize: "0.88rem", color: "#64748B" }}>
          Bạn chưa được ủy quyền quản lý mục Hỏi đáp cho khóa học này.
        </Typography>
      </Paper>
    );
  }

  return (
    <AuthGuard allowedRoles={["Admin", "GiaoVien"]}>
      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ mb: 2.5, borderRadius: "14px", fontWeight: 600 }}
        >
          {error}
        </Alert>
      )}

      {/* ── Main Container Card (Master-Detail Architecture) ── */}
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          height: { xs: "auto", md: "calc(100vh - 160px)" },
          minHeight: { xs: "auto", md: 680 },
          borderRadius: "28px",
          bgcolor: "#FFFFFF",
          border: "1px solid #ECE7E4",
          boxShadow: "0 12px 36px -10px rgba(0, 0, 0, 0.05)",
          overflow: "hidden",
        }}
      >
        {/* ── CỘT TRÁI: DANH SÁCH CÂU HỎI & BỘ LỌC ── */}
        <Box
          sx={{
            width: { xs: "100%", md: 400 },
            flexShrink: 0,
            borderRight: { xs: "none", md: "1px solid #F1F5F9" },
            borderBottom: { xs: "1px solid #F1F5F9", md: "none" },
            display: "flex",
            flexDirection: "column",
            bgcolor: "#FAF8F6",
            overflow: "hidden",
          }}
        >
          {/* Header Panel */}
          <Box
            sx={{
              p: { xs: 2.5, sm: 3 },
              bgcolor: "#FFFFFF",
              borderBottom: "1px solid #F1F5F9",
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "12px",
                    background: `linear-gradient(135deg, ${BRAND.main} 0%, #A81B1B 100%)`,
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 12px ${BRAND.main}30`,
                  }}
                >
                  <QuestionAnswerOutlinedIcon sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: "1.18rem",
                      color: "#0F172A",
                      letterSpacing: "-0.015em",
                    }}
                  >
                    Hỏi đáp & Thảo luận
                  </Typography>
                  <Typography
                    sx={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 500 }}
                  >
                    Quản lý và giải đáp câu hỏi của học viên
                  </Typography>
                </Box>
              </Box>

              {unansweredCount > 0 && (
                <Chip
                  label={`${unansweredCount} mới`}
                  size="small"
                  sx={{
                    bgcolor: "#FEF2F2",
                    color: BRAND.main,
                    border: "1px solid #FECACA",
                    fontWeight: 800,
                    fontSize: "0.72rem",
                    height: 22,
                  }}
                />
              )}
            </Box>

            {/* Search Input */}
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm kiếm câu hỏi..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load(true)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
                    </InputAdornment>
                  ),
                  endAdornment: keyword ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setKeyword("");
                          load(true);
                        }}
                        sx={{ p: 0.5 }}
                      >
                        <ClearIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  height: 42,
                  borderRadius: "12px",
                  bgcolor: "#F8FAFC",
                  fontSize: "0.88rem",
                  "& fieldset": { borderColor: "#E2E8F0" },
                  "&:hover fieldset": { borderColor: "#CBD5E1" },
                  "&.Mui-focused fieldset": {
                    borderColor: BRAND.main,
                    borderWidth: "1.5px",
                  },
                },
              }}
            />

            {/* Filter Pills */}
            <Box
              sx={{
                display: "flex",
                gap: 0.75,
                overflowX: "auto",
                pb: 0.5,
                "&::-webkit-scrollbar": { display: "none" },
                scrollbarWidth: "none",
              }}
            >
              {[
                { val: "TatCa" as const, label: "Tất cả" },
                { val: "ChuaTraLoi" as const, label: "Chưa trả lời" },
                { val: "ChuaDoc" as const, label: "Chưa có GV" },
                { val: "NhieuLike" as const, label: "Nhiều like" },
              ].map((f) => {
                const isActive = filterLoai === f.val;
                return (
                  <Chip
                    key={f.val}
                    label={f.label}
                    onClick={() => setFilterLoai(f.val)}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.76rem",
                      cursor: "pointer",
                      height: 28,
                      borderRadius: "8px",
                      px: 0.5,
                      bgcolor: isActive ? BRAND.main : "#F8FAFC",
                      color: isActive ? "#FFFFFF" : "#64748B",
                      border: `1px solid ${isActive ? BRAND.main : "#E2E8F0"}`,
                      transition: "all 0.15s ease",
                      "&:hover": {
                        bgcolor: isActive ? BRAND.dark : "#F1F5F9",
                        color: isActive ? "#FFFFFF" : "#1E293B",
                      },
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          {/* Danh sách câu hỏi cuộn */}
          <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 10,
                  gap: 1.5,
                }}
              >
                <CircularProgress size={32} sx={{ color: BRAND.main }} />
                <Typography sx={{ fontSize: "0.84rem", color: "#64748B", fontWeight: 600 }}>
                  Đang tải câu hỏi...
                </Typography>
              </Box>
            ) : cauHois.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
                <QuestionAnswerOutlinedIcon
                  sx={{ fontSize: 44, color: "#CBD5E1", mb: 1.5 }}
                />
                <Typography
                  sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#475569", mb: 0.5 }}
                >
                  Không có câu hỏi nào
                </Typography>
                <Typography sx={{ fontSize: "0.82rem", color: "#94A3B8" }}>
                  {keyword
                    ? "Không tìm thấy câu hỏi khớp với từ khóa tìm kiếm"
                    : "Chưa có học viên nào đặt câu hỏi trong mục này"}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {cauHois.map((cauHoi) => {
                  const isSelected = cauHoiMo?.id === cauHoi.id;
                  const isUnanswered = cauHoi.soTraLoi === 0;

                  return (
                    <Paper
                      key={cauHoi.id}
                      elevation={0}
                      onClick={() => moChiTiet(cauHoi)}
                      sx={{
                        p: 2,
                        borderRadius: "16px",
                        cursor: "pointer",
                        position: "relative",
                        border: isSelected
                          ? `1.5px solid ${BRAND.main}`
                          : cauHoi.daGhim
                            ? "1px solid #FDE68A"
                            : "1px solid #E2E8F0",
                        bgcolor: isSelected
                          ? "#FFFFFF"
                          : cauHoi.daGhim
                            ? "#FFFDF5"
                            : "#FFFFFF",
                        boxShadow: isSelected
                          ? `0 6px 18px -4px ${BRAND.main}25, 0 2px 6px rgba(0,0,0,0.04)`
                          : "0 1px 3px rgba(0,0,0,0.02)",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: isSelected ? BRAND.main : "#CBD5E1",
                          transform: "translateY(-1px)",
                          boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
                        },
                      }}
                    >
                      {/* Active Indicator Bar */}
                      {isSelected && (
                        <Box
                          sx={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 4,
                            bgcolor: BRAND.main,
                            borderRadius: "16px 0 0 16px",
                          }}
                        />
                      )}

                      {/* Header Info */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 1,
                          gap: 1,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <UserAvatar
                            anh={cauHoi.nguoiHoiAnh}
                            ten={cauHoi.nguoiHoiTen}
                            size={24}
                          />
                          <Typography
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              color: "#334155",
                              maxWidth: 160,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {cauHoi.nguoiHoiTen || "Ẩn danh"}
                          </Typography>
                        </Box>

                        <Typography
                          sx={{ fontSize: "0.72rem", color: "#94A3B8", flexShrink: 0 }}
                        >
                          {thoiGianTuatoi(cauHoi.ngayTao)}
                        </Typography>
                      </Box>

                      {/* Title / Content */}
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "0.9rem",
                          color: isSelected ? BRAND.main : "#0F172A",
                          lineHeight: 1.45,
                          mb: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {cauHoi.noiDung}
                      </Typography>

                      {/* Lesson Badge */}
                      {cauHoi.tenBaiGiang && (
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.75,
                            px: 1,
                            py: 0.35,
                            borderRadius: "6px",
                            bgcolor: "#F8FAFC",
                            border: "1px solid #F1F5F9",
                            maxWidth: "100%",
                            mb: 1.25,
                          }}
                        >
                          <PlayCircleFilledWhiteOutlinedIcon
                            sx={{ fontSize: 13, color: "#64748B", flexShrink: 0 }}
                          />
                          <Typography
                            sx={{
                              fontSize: "0.74rem",
                              color: "#64748B",
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {cauHoi.tenBaiGiang}
                          </Typography>
                        </Box>
                      )}

                      {/* Badges and Metrics */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mt: 0.5,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.4,
                              color: "#64748B",
                              fontSize: "0.76rem",
                              fontWeight: 600,
                            }}
                          >
                            <ThumbUpOutlinedIcon sx={{ fontSize: 13 }} />
                            <span>{cauHoi.tongLike ?? 0}</span>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.4,
                              color: isUnanswered ? STATUS.warningDark : "#64748B",
                              fontSize: "0.76rem",
                              fontWeight: 700,
                            }}
                          >
                            <QuestionAnswerOutlinedIcon sx={{ fontSize: 13 }} />
                            <span>{cauHoi.soTraLoi}</span>
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          {cauHoi.daGhim && (
                            <Chip
                              label="📌 Ghim"
                              size="small"
                              sx={{
                                fontSize: "0.7rem",
                                height: 20,
                                bgcolor: "#FEF3C7",
                                color: "#92400E",
                                border: "1px solid #FDE68A",
                                fontWeight: 800,
                              }}
                            />
                          )}

                          {isUnanswered ? (
                            <Chip
                              label="Chưa trả lời"
                              size="small"
                              sx={{
                                fontSize: "0.7rem",
                                height: 20,
                                bgcolor: "#FEF2F2",
                                color: BRAND.main,
                                border: "1px solid #FECACA",
                                fontWeight: 800,
                              }}
                            />
                          ) : null}

                          {cauHoi.daDong && (
                            <Chip
                              label="🔒 Đóng"
                              size="small"
                              sx={{
                                fontSize: "0.7rem",
                                height: 20,
                                bgcolor: "#F1F5F9",
                                color: "#64748B",
                                fontWeight: 700,
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}

                {page < totalPages && (
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => load(false)}
                    disabled={loadingMore}
                    sx={{
                      mt: 1,
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "0.84rem",
                      borderRadius: "12px",
                      borderColor: "#E2E8F0",
                      color: "#475569",
                      bgcolor: "#FFFFFF",
                      "&:hover": { borderColor: BRAND.main, color: BRAND.main },
                    }}
                  >
                    {loadingMore ? (
                      <CircularProgress size={18} sx={{ color: BRAND.main }} />
                    ) : (
                      "Xem thêm câu hỏi cũ hơn"
                    )}
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* ── CỘT PHẢI: CHI TIẾT CÂU HỎI HOẶC TRANG TỔNG QUAN ── */}
        {cauHoiMo ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              bgcolor: "#FFFFFF",
              overflow: "hidden",
            }}
          >
            {loadingChiTiet ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                  gap: 1.5,
                }}
              >
                <CircularProgress size={38} sx={{ color: BRAND.main }} />
                <Typography sx={{ fontSize: "0.88rem", color: "#64748B", fontWeight: 600 }}>
                  Đang tải nội dung câu hỏi...
                </Typography>
              </Box>
            ) : (
              <>
                {/* ── Top Header Chi Tiết ── */}
                <Box
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    borderBottom: "1px solid #F1F5F9",
                    flexShrink: 0,
                    bgcolor: "#FAF8F6",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1.25,
                          flexWrap: "wrap",
                        }}
                      >
                        {cauHoiMo.daGhim && (
                          <Chip
                            label="📌 Đã ghim câu hỏi"
                            size="small"
                            sx={{
                              fontSize: "0.75rem",
                              height: 22,
                              bgcolor: "#FEF3C7",
                              color: "#92400E",
                              border: "1px solid #FDE68A",
                              fontWeight: 800,
                            }}
                          />
                        )}
                        {cauHoiMo.daDong && (
                          <Chip
                            label="🔒 Đã đóng chủ đề"
                            size="small"
                            sx={{
                              fontSize: "0.75rem",
                              height: 22,
                              bgcolor: "#FEE2E2",
                              color: STATUS.error,
                              fontWeight: 800,
                            }}
                          />
                        )}
                        {cauHoiMo.tenBaiGiang && (
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.75,
                              px: 1.25,
                              py: 0.35,
                              borderRadius: "8px",
                              bgcolor: "#FFFFFF",
                              border: "1px solid #E2E8F0",
                            }}
                          >
                            <PlayCircleFilledWhiteOutlinedIcon
                              sx={{ fontSize: 14, color: BRAND.main }}
                            />
                            <Typography
                              sx={{
                                fontSize: "0.76rem",
                                color: "#334155",
                                fontWeight: 700,
                              }}
                            >
                              {cauHoiMo.tenBaiGiang}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: { xs: "1.1rem", sm: "1.25rem" },
                          color: "#0F172A",
                          lineHeight: 1.4,
                          letterSpacing: "-0.015em",
                        }}
                      >
                        {cauHoiMo.noiDung}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          mt: 1.5,
                          flexWrap: "wrap",
                        }}
                      >
                        <UserAvatar
                          anh={cauHoiMo.nguoiHoiAnh}
                          ten={cauHoiMo.nguoiHoiTen}
                          size={28}
                        />
                        <Typography
                          sx={{
                            fontSize: "0.85rem",
                            color: "#1E293B",
                            fontWeight: 700,
                          }}
                        >
                          {cauHoiMo.nguoiHoiTen || "Học viên"}
                        </Typography>
                        <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8" }}>
                          Đã hỏi {thoiGianTuatoi(cauHoiMo.ngayTao)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Toolbar actions */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        flexShrink: 0,
                        bgcolor: "#FFFFFF",
                        p: 0.5,
                        borderRadius: "12px",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <Tooltip
                        title={
                          cauHoiMo.daGhim
                            ? "Bỏ ghim câu hỏi này"
                            : "Ghim câu hỏi lên đầu danh sách"
                        }
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            ghimCauHoi(cauHoiMo.id, !cauHoiMo.daGhim)
                          }
                          sx={{
                            color: cauHoiMo.daGhim ? "#D97706" : "#64748B",
                            bgcolor: cauHoiMo.daGhim ? "#FEF3C7" : "transparent",
                            "&:hover": { bgcolor: "#FEF3C7", color: "#D97706" },
                          }}
                        >
                          {cauHoiMo.daGhim ? (
                            <PushPinIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <PushPinOutlinedIcon sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                      </Tooltip>

                      <Tooltip
                        title={
                          cauHoiMo.daDong
                            ? "Mở lại câu hỏi để thảo luận"
                            : "Đóng câu hỏi (khóa bình luận mới)"
                        }
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            dongCauHoi(cauHoiMo.id, !cauHoiMo.daDong)
                          }
                          sx={{
                            color: cauHoiMo.daDong ? STATUS.error : "#64748B",
                            bgcolor: cauHoiMo.daDong ? "#FEE2E2" : "transparent",
                            "&:hover": { bgcolor: "#FEE2E2", color: STATUS.error },
                          }}
                        >
                          {cauHoiMo.daDong ? (
                            <LockOutlinedIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <LockOpenOutlinedIcon sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Xóa toàn bộ câu hỏi và thảo luận">
                        <IconButton
                          size="small"
                          onClick={() => xoaCauHoi(cauHoiMo.id)}
                          sx={{
                            color: "#64748B",
                            "&:hover": { color: STATUS.error, bgcolor: "#FEE2E2" },
                          }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>

                      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                      <Tooltip title="Đóng cửa sổ chi tiết">
                        <IconButton size="small" onClick={() => setCauHoiMo(null)}>
                          <CloseIcon sx={{ fontSize: 18, color: "#64748B" }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>

                {/* ── Thảo luận & Danh sách phản hồi ── */}
                <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 2.5, sm: 3 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2.5,
                    }}
                  >
                    <ForumOutlinedIcon sx={{ fontSize: 18, color: BRAND.main }} />
                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        fontWeight: 800,
                        color: "#334155",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      Các câu trả lời ({cauHoiMo.danhSachTraLoi.length})
                    </Typography>
                  </Box>

                  {cauHoiMo.danhSachTraLoi.length === 0 ? (
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 8,
                        px: 3,
                        borderRadius: "18px",
                        bgcolor: "#FAF8F6",
                        border: "1.5px dashed #E2E8F0",
                      }}
                    >
                      <QuestionAnswerOutlinedIcon
                        sx={{ fontSize: 44, color: "#CBD5E1", mb: 1.5 }}
                      />
                      <Typography
                        sx={{
                          fontSize: "0.95rem",
                          fontWeight: 800,
                          color: "#334155",
                          mb: 0.5,
                        }}
                      >
                        Chưa có câu trả lời nào
                      </Typography>
                      <Typography sx={{ fontSize: "0.84rem", color: "#64748B" }}>
                        Hãy là người đầu tiên giải đáp thắc mắc này cho học viên
                        để tăng trải nghiệm học tập.
                      </Typography>
                    </Box>
                  ) : (
                    <TraLoiChildren
                      nodes={cayTraLoi}
                      depth={0}
                      tenTheoId={tenTheoId}
                      soLuongHienMacDinh={5}
                      coDuongDoc={false}
                      onLike={() => {}}
                      onToggleTopAnswer={toggleTopAnswer}
                      onXoa={xoaTraLoi}
                      onReply={(idTraLoi, tenNguoi) => {
                        setReplyingTo({ idTraLoi, tenNguoi });
                        setNoiDungReply("");
                      }}
                    />
                  )}
                </Box>

                {/* ── Form phản hồi trực tiếp (Reply cụ thể) ── */}
                {!cauHoiMo.daDong && replyingTo && (
                  <Box
                    sx={{
                      p: 2.5,
                      borderTop: "1px solid #F1F5F9",
                      bgcolor: "#FAF8F6",
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      sx={{
                        mb: 1.5,
                        px: 1.5,
                        py: 0.75,
                        bgcolor: "#FFFFFF",
                        border: "1px solid rgba(139, 19, 19, 0.2)",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.82rem",
                          fontWeight: 800,
                          color: BRAND.main,
                        }}
                      >
                        ↩ Đang trả lời phản hồi của @{replyingTo.tenNguoi}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setReplyingTo(null)}
                      >
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>

                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      maxRows={4}
                      placeholder={`Nhập nội dung phản hồi cho @${replyingTo.tenNguoi}...`}
                      value={noiDungReply}
                      onChange={(e) => setNoiDungReply(e.target.value)}
                      disabled={dangReply || dangGoiY}
                      autoFocus
                      sx={{
                        mb: 1.5,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "14px",
                          bgcolor: "#FFFFFF",
                          fontSize: "0.9rem",
                          "& fieldset": { borderColor: "#E2E8F0" },
                          "&.Mui-focused fieldset": { borderColor: BRAND.main },
                        },
                      }}
                    />

                    {aiCoNoiDungBaiGiang === false && (
                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          color: STATUS.warningDark,
                          mb: 1.25,
                          fontWeight: 600,
                        }}
                      >
                        ⚠️ AI sử dụng thông tin tổng quan của khóa học do chưa
                        tìm thấy tài liệu bài giảng.
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
                              sx={{ color: BRAND.main }}
                            />
                          ) : (
                            <AutoAwesomeIcon sx={{ fontSize: 16 }} />
                          )
                        }
                        onClick={goiYTraLoiReply}
                        disabled={dangGoiY || dangReply}
                        sx={{
                          textTransform: "none",
                          fontWeight: 800,
                          fontSize: "0.82rem",
                          color: BRAND.main,
                          bgcolor: "#FFFFFF",
                          border: "1px solid rgba(139, 19, 19, 0.2)",
                          borderRadius: "10px",
                          px: 2,
                          py: 0.6,
                          "&:hover": { bgcolor: "rgba(139, 19, 19, 0.06)" },
                        }}
                      >
                        {dangGoiY ? "Đang tạo gợi ý..." : "AI gợi ý phản hồi"}
                      </Button>

                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          onClick={() => setReplyingTo(null)}
                          sx={{
                            textTransform: "none",
                            color: "#64748B",
                            fontWeight: 700,
                            fontSize: "0.84rem",
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
                            bgcolor: BRAND.main,
                            textTransform: "none",
                            fontWeight: 800,
                            borderRadius: "10px",
                            px: 3,
                            boxShadow: `0 4px 12px ${BRAND.main}30`,
                            "&:hover": {
                              bgcolor: BRAND.dark,
                            },
                          }}
                        >
                          {dangReply ? (
                            <CircularProgress size={14} sx={{ color: "#fff" }} />
                          ) : (
                            "Gửi phản hồi"
                          )}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* ── Form trả lời chính (Giảng viên trả lời) ── */}
                {!cauHoiMo.daDong && !replyingTo && (
                  <Box
                    sx={{
                      p: 2.5,
                      borderTop: "1px solid #F1F5F9",
                      bgcolor: "#FAF8F6",
                      flexShrink: 0,
                    }}
                  >
                    {error && (
                      <Alert
                        severity="error"
                        onClose={() => setError(null)}
                        sx={{ mb: 1.5, borderRadius: "12px" }}
                      >
                        {error}
                      </Alert>
                    )}
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      maxRows={5}
                      placeholder="Viết câu trả lời chi tiết và tận tình với tư cách giảng viên..."
                      value={noiDungTraLoi}
                      onChange={(e) => setNoiDungTraLoi(e.target.value)}
                      disabled={dangTraLoi || dangGoiY}
                      sx={{
                        mb: 1.5,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "16px",
                          bgcolor: "#FFFFFF",
                          fontSize: "0.9rem",
                          "& fieldset": { borderColor: "#E2E8F0" },
                          "&.Mui-focused fieldset": {
                            borderColor: BRAND.main,
                            borderWidth: "1.5px",
                          },
                        },
                      }}
                    />

                    {aiCoNoiDungBaiGiang === false && (
                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          color: STATUS.warningDark,
                          mb: 1.25,
                          fontWeight: 600,
                        }}
                      >
                        ⚠️ AI sử dụng thông tin tổng quan của khóa học do chưa
                        tìm thấy tài liệu bài giảng.
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
                        size="medium"
                        startIcon={
                          dangGoiY ? (
                            <CircularProgress
                              size={15}
                              sx={{ color: BRAND.main }}
                            />
                          ) : (
                            <AutoAwesomeIcon sx={{ fontSize: 18 }} />
                          )
                        }
                        onClick={goiYTraLoi}
                        disabled={dangGoiY || dangTraLoi}
                        sx={{
                          textTransform: "none",
                          fontWeight: 800,
                          fontSize: "0.85rem",
                          color: BRAND.main,
                          bgcolor: "#FFFFFF",
                          border: "1.5px solid rgba(139, 19, 19, 0.2)",
                          borderRadius: "12px",
                          px: 2.5,
                          py: 0.75,
                          boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                          "&:hover": {
                            bgcolor: "rgba(139, 19, 19, 0.06)",
                            borderColor: BRAND.main,
                          },
                        }}
                      >
                        {dangGoiY ? "Đang tạo gợi ý..." : "✨ AI gợi ý câu trả lời"}
                      </Button>

                      <Button
                        variant="contained"
                        size="medium"
                        disabled={
                          dangTraLoi || dangGoiY || !noiDungTraLoi.trim()
                        }
                        onClick={traLoi}
                        sx={{
                          bgcolor: BRAND.main,
                          textTransform: "none",
                          fontWeight: 800,
                          fontSize: "0.88rem",
                          borderRadius: "12px",
                          px: 4,
                          py: 0.85,
                          boxShadow: `0 4px 14px ${BRAND.main}35`,
                          background: `linear-gradient(135deg, ${BRAND.main} 0%, ${BRAND.dark} 100%)`,
                          color: "#FFFFFF",
                          "&:hover": {
                            background: `linear-gradient(135deg, ${BRAND.dark} 0%, ${BRAND.darker} 100%)`,
                            boxShadow: `0 8px 20px ${BRAND.main}45`,
                          },
                        }}
                      >
                        {dangTraLoi ? (
                          <CircularProgress size={16} sx={{ color: "#fff" }} />
                        ) : (
                          "Gửi câu trả lời"
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
                      border: "1px solid #FECACA",
                      borderRadius: "14px",
                      textAlign: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.88rem",
                        color: STATUS.error,
                        fontWeight: 700,
                      }}
                    >
                      🔒 Câu hỏi này đã bị đóng. Học viên và giảng viên không thể gửi thêm phản hồi.
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        ) : (
          /* ── TRẠNG THÁI CHƯA CHỌN CÂU HỎI (COMMAND CENTER STATS) ── */
          <Box
            sx={{
              flex: 1,
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 6,
              bgcolor: "#FFFFFF",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 90,
                height: 90,
                borderRadius: "28px",
                background: `linear-gradient(135deg, ${BRAND.main}18 0%, ${BRAND.main}06 100%)`,
                border: `2px solid ${BRAND.main}25`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: BRAND.main,
                mb: 3,
                boxShadow: `0 10px 24px ${BRAND.main}15`,
              }}
            >
              <ForumOutlinedIcon sx={{ fontSize: 48 }} />
            </Box>

            <Typography
              sx={{
                fontWeight: 900,
                fontSize: "1.35rem",
                color: "#0F172A",
                mb: 1,
                letterSpacing: "-0.015em",
              }}
            >
              Trung tâm Giải đáp & Thảo luận
            </Typography>

            <Typography
              sx={{
                fontSize: "0.92rem",
                color: "#64748B",
                maxWidth: 460,
                lineHeight: 1.6,
                mb: 4,
              }}
            >
              Chọn một câu hỏi từ danh sách bên trái để xem nội dung chi tiết,
              sử dụng AI gợi ý và phản hồi giải đáp cho học viên.
            </Typography>

            {/* Quick Overview Metric Cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 2,
                width: "100%",
                maxWidth: 540,
                mb: 4,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: "16px",
                  bgcolor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "1.4rem",
                    fontWeight: 900,
                    color: "#0F172A",
                    lineHeight: 1.2,
                  }}
                >
                  {totalQuestions}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    color: "#64748B",
                    mt: 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  Tổng câu hỏi
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: "16px",
                  bgcolor: unansweredCount > 0 ? "#FEF2F2" : "#F8FAFC",
                  border: `1px solid ${
                    unansweredCount > 0 ? "#FECACA" : "#E2E8F0"
                  }`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "1.4rem",
                    fontWeight: 900,
                    color: unansweredCount > 0 ? BRAND.main : "#0F172A",
                    lineHeight: 1.2,
                  }}
                >
                  {unansweredCount}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    color: unansweredCount > 0 ? BRAND.main : "#64748B",
                    mt: 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  Chưa trả lời
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: "16px",
                  bgcolor: "#FFFDF5",
                  border: "1px solid #FDE68A",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "1.4rem",
                    fontWeight: 900,
                    color: "#D97706",
                    lineHeight: 1.2,
                  }}
                >
                  {pinnedCount}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    color: "#92400E",
                    mt: 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  Đã ghim
                </Typography>
              </Paper>
            </Box>

            {/* AI Assistant Hint Box */}
            <Box
              sx={{
                p: 2,
                borderRadius: "14px",
                bgcolor: "#FAF8F6",
                border: "1px solid rgba(139, 19, 19, 0.12)",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                maxWidth: 540,
                textAlign: "left",
              }}
            >
              <TipsAndUpdatesOutlinedIcon sx={{ color: BRAND.main, fontSize: 22 }} />
              <Typography sx={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.5 }}>
                <strong>Mẹo giảng viên:</strong> Sử dụng nút <strong>✨ AI gợi ý</strong> khi xem chi tiết câu hỏi để tạo câu trả lời mẫu nhanh chóng dựa trên tài liệu bài giảng!
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </AuthGuard>
  );
}
