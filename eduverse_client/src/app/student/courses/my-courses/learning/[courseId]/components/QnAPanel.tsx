/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Divider,
  CircularProgress,
  Tooltip,
  MenuItem,
  Select,
  InputAdornment,
  Paper,
  Stack,
  Fade,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbUpRoundedIcon from "@mui/icons-material/ThumbUpRounded";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import QuestionAnswerRoundedIcon from "@mui/icons-material/QuestionAnswerRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import SubdirectoryArrowRightRoundedIcon from "@mui/icons-material/SubdirectoryArrowRightRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import VideoLibraryRoundedIcon from "@mui/icons-material/VideoLibraryRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useMemo, useState, useEffect, useRef } from "react";
import { useHoiDap } from "../hooks/useHoiDap";
import { HoiDapDto, TraLoiDto } from "@/src/services/HoiDapService";
import { BRAND, STATUS, CSSVAR } from "@/src/theme/tokens";
import { EduAvatar } from "@/src/components/common/EduAvatar";

const PRIMARY = BRAND.main;

interface QnAPanelProps {
  idKhoaHoc: string;
  idBaiGiang?: string | null;
  laGiangVien?: boolean;
  tenBaiGiang?: string;
  idCauHoiCanMo?: string | null;
}

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
  return <EduAvatar src={anh} name={ten} size={size} />;
}

// ── Cây trả lời ──────────────────────────────────────────────────────────
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
  laGiangVien,
  onLike,
  onGhim,
  onXoa,
  onReply,
}: {
  traLoi: TraLoiDto;
  tenNguoiDuocReply?: string;
  depth: number;
  laCuoiNhom: boolean;
  laGiangVien?: boolean;
  onLike: () => void;
  onGhim: () => void;
  onXoa: () => void;
  onReply: (idTraLoi: string, tenNguoi: string) => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        pt: 1.5,
        pb: laCuoiNhom ? 0 : 1.5,
        ...(traLoi.ghimTraLoi
          ? {
              bgcolor: "rgba(245, 158, 11, 0.05)",
              mx: -1.5,
              px: 1.5,
              borderRadius: "12px",
              border: "1px solid rgba(245, 158, 11, 0.18)",
            }
          : {}),
      }}
    >
      {/* Đường nối ngang */}
      {depth > 0 && (
        <Box
          sx={{
            width: "16px",
            height: "2px",
            bgcolor: alpha(PRIMARY, 0.18),
            flexShrink: 0,
            mt: "15px",
            ml: "-16px",
          }}
        />
      )}

      <UserAvatar
        anh={traLoi.nguoiTraLoiAnh}
        ten={traLoi.nguoiTraLoiTen}
        size={32}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Header người trả lời */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.8,
            flexWrap: "wrap",
            mb: 0.5,
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 13,
              color: CSSVAR.textPrimary,
              lineHeight: 1.3,
            }}
          >
            {traLoi.nguoiTraLoiTen || "Ẩn danh"}
          </Typography>

          {traLoi.laGiangVien && (
            <Chip
              icon={<SchoolRoundedIcon sx={{ fontSize: "12px !important", color: `${PRIMARY} !important` }} />}
              label="Giảng viên"
              size="small"
              sx={{
                fontSize: 10.5,
                fontWeight: 700,
                height: 20,
                bgcolor: alpha(PRIMARY, 0.08),
                color: PRIMARY,
                border: `1px solid ${alpha(PRIMARY, 0.2)}`,
                "& .MuiChip-label": { px: 0.8 },
              }}
            />
          )}

          {traLoi.ghimTraLoi && (
            <Chip
              icon={<PushPinRoundedIcon sx={{ fontSize: "11px !important", color: "#D97706 !important" }} />}
              label="Được ghim"
              size="small"
              sx={{
                fontSize: 10.5,
                fontWeight: 700,
                height: 20,
                bgcolor: "#FEF3C7",
                color: "#92400E",
                border: "1px solid #FDE68A",
                "& .MuiChip-label": { px: 0.8 },
              }}
            />
          )}

          <Typography
            sx={{
              fontSize: 11.5,
              color: "text.secondary",
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
              gap: 0.4,
              mb: 0.6,
              px: 0.9,
              py: 0.3,
              borderRadius: "6px",
              bgcolor: alpha(PRIMARY, 0.06),
              border: `1px solid ${alpha(PRIMARY, 0.12)}`,
            }}
          >
            <SubdirectoryArrowRightRoundedIcon
              sx={{ fontSize: 13, color: PRIMARY, opacity: 0.85 }}
            />
            <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: PRIMARY }}>
              Trả lời @{tenNguoiDuocReply}
            </Typography>
          </Box>
        )}

        {/* Nội dung phản hồi */}
        <Typography
          sx={{
            fontSize: 13.5,
            color: "text.primary",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {traLoi.noiDung}
        </Typography>

        {/* Actions bar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          {/* Like */}
          <Button
            size="small"
            onClick={onLike}
            startIcon={
              traLoi.daLike ? (
                <ThumbUpRoundedIcon sx={{ fontSize: "14px !important", color: PRIMARY }} />
              ) : (
                <ThumbUpOutlinedIcon sx={{ fontSize: "14px !important" }} />
              )
            }
            sx={{
              textTransform: "none",
              fontSize: 12,
              fontWeight: 600,
              borderRadius: "6px",
              py: 0.25,
              px: 0.8,
              minWidth: 0,
              color: traLoi.daLike ? PRIMARY : "text.secondary",
              bgcolor: traLoi.daLike ? alpha(PRIMARY, 0.08) : "transparent",
              "&:hover": {
                bgcolor: alpha(PRIMARY, 0.08),
                color: PRIMARY,
              },
            }}
          >
            {traLoi.soLike > 0 ? traLoi.soLike : "Thích"}
          </Button>

          {/* Phản hồi */}
          <Button
            size="small"
            startIcon={<ReplyRoundedIcon sx={{ fontSize: "15px !important" }} />}
            onClick={() =>
              onReply(traLoi.id, traLoi.nguoiTraLoiTen || "Ẩn danh")
            }
            sx={{
              textTransform: "none",
              fontSize: 12,
              fontWeight: 600,
              borderRadius: "6px",
              color: "text.secondary",
              py: 0.25,
              px: 0.8,
              minWidth: 0,
              "&:hover": { color: PRIMARY, bgcolor: alpha(PRIMARY, 0.06) },
            }}
          >
            Phản hồi
          </Button>

          {laGiangVien && (
            <Tooltip title={traLoi.ghimTraLoi ? "Bỏ ghim" : "Ghim phản hồi này"}>
              <IconButton
                size="small"
                onClick={onGhim}
                sx={{
                  p: 0.5,
                  color: traLoi.ghimTraLoi ? "#D97706" : "text.secondary",
                  "&:hover": { color: "#D97706", bgcolor: "#FEF3C7" },
                }}
              >
                {traLoi.ghimTraLoi ? (
                  <PushPinRoundedIcon sx={{ fontSize: 15 }} />
                ) : (
                  <PushPinOutlinedIcon sx={{ fontSize: 15 }} />
                )}
              </IconButton>
            </Tooltip>
          )}

          {(traLoi.laCuaToi || laGiangVien) && (
            <Tooltip title="Xóa phản hồi">
              <IconButton
                size="small"
                onClick={onXoa}
                sx={{
                  p: 0.5,
                  color: "text.secondary",
                  "&:hover": { color: STATUS.error, bgcolor: alpha(STATUS.error, 0.08) },
                }}
              >
                <DeleteOutlineRoundedIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ── Nhóm trả lời con ─────────────────────────────────────────────────────
const SO_LUONG_HIEN_MAC_DINH = 2;

function TraLoiChildren({
  nodes,
  depth,
  tenTheoId,
  laGiangVien,
  onLike,
  onGhim,
  onXoa,
  onReply,
  soLuongHienMacDinh = SO_LUONG_HIEN_MAC_DINH,
  coDuongDoc = true,
}: {
  nodes: TraLoiNode[];
  depth: number;
  tenTheoId: Map<string, string>;
  laGiangVien?: boolean;
  onLike: (id: string) => void;
  onGhim: (id: string, ghim: boolean) => void;
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
              ml: "15px",
              pl: "16px",
              borderLeft: `2px solid ${alpha(PRIMARY, 0.16)}`,
            }
          : {}
      }
    >
      <TraLoiThread
        nodes={nodesHienThi}
        depth={depth}
        tenTheoId={tenTheoId}
        laGiangVien={laGiangVien}
        onLike={onLike}
        onGhim={onGhim}
        onXoa={onXoa}
        onReply={onReply}
      />

      {coTheAn && (
        <Button
          size="small"
          onClick={() => setDaMoRong((v) => !v)}
          startIcon={
            <SubdirectoryArrowRightRoundedIcon
              sx={{
                fontSize: 13,
                transform: daMoRong ? "scaleY(-1)" : "none",
              }}
            />
          }
          sx={{
            textTransform: "none",
            fontSize: 12,
            fontWeight: 700,
            color: PRIMARY,
            p: "3px 8px",
            my: 0.5,
            minWidth: 0,
            borderRadius: "6px",
            "&:hover": { bgcolor: alpha(PRIMARY, 0.08) },
          }}
        >
          {daMoRong ? "Thu gọn bớt phản hồi" : `Xem thêm ${soLuongAn} phản hồi khác`}
        </Button>
      )}
    </Box>
  );
}

// ── Render cây trả lời ───────────────────────────────────────────────────
function TraLoiThread({
  nodes,
  depth,
  tenTheoId,
  laGiangVien,
  onLike,
  onGhim,
  onXoa,
  onReply,
}: {
  nodes: TraLoiNode[];
  depth: number;
  tenTheoId: Map<string, string>;
  laGiangVien?: boolean;
  onLike: (id: string) => void;
  onGhim: (id: string, ghim: boolean) => void;
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
              laGiangVien={laGiangVien}
              onLike={() => onLike(traLoi.id)}
              onGhim={() => onGhim(traLoi.id, !traLoi.ghimTraLoi)}
              onXoa={() => onXoa(traLoi.id)}
              onReply={onReply}
            />
            {con.length > 0 && (
              <TraLoiChildren
                nodes={con}
                depth={depth + 1}
                tenTheoId={tenTheoId}
                laGiangVien={laGiangVien}
                onLike={onLike}
                onGhim={onGhim}
                onXoa={onXoa}
                onReply={onReply}
              />
            )}
            {depth === 0 && idx < nodes.length - 1 && (
              <Divider sx={{ my: 0.5, borderColor: "divider" }} />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ── COMPONENT CHÍNH ──────────────────────────────────────────────────────
export function QnAPanel({
  idKhoaHoc,
  idBaiGiang,
  laGiangVien,
  tenBaiGiang,
  idCauHoiCanMo,
}: QnAPanelProps) {
  const hd = useHoiDap({ idKhoaHoc, idBaiGiang, laGiangVien });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (idCauHoiCanMo) {
      hd.moChiTiet(idCauHoiCanMo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idCauHoiCanMo]);

  // ── Filter state ──────────────────────────────────────────────────────
  const [filterLoai, setFilterLoai] = useState<"TatCa" | "ChiBaiGiangNay">(
    "TatCa",
  );

  const cauHoisHienThi = useMemo(() => {
    if (!idBaiGiang) {
      return hd.cauHois.filter((c) => !c.idBaiGiang);
    }
    if (filterLoai === "ChiBaiGiangNay") {
      return hd.cauHois.filter((c) => c.idBaiGiang === idBaiGiang);
    }
    return hd.cauHois;
  }, [hd.cauHois, filterLoai, idBaiGiang]);

  const countTatCa = hd.cauHois.length;
  const countBaiNay = useMemo(
    () => hd.cauHois.filter((c) => c.idBaiGiang === idBaiGiang).length,
    [hd.cauHois, idBaiGiang],
  );

  // ── Cây trả lời ────────────────────────────────────────────────────────
  const cayTraLoi = useMemo(() => {
    if (!hd.cauHoiMo) return [];
    return xayDungCayTraLoi(hd.cauHoiMo.danhSachTraLoi);
  }, [hd.cauHoiMo]);

  const tenTheoId = useMemo(() => {
    const m = new Map<string, string>();
    if (hd.cauHoiMo) {
      hd.cauHoiMo.danhSachTraLoi.forEach((tl) =>
        m.set(tl.id, tl.nguoiTraLoiTen || "Ẩn danh"),
      );
    }
    return m;
  }, [hd.cauHoiMo]);

  const doDaiCauHoi = hd.noiDungMoi.trim().length;
  const hopLeCauHoi = doDaiCauHoi >= 10;

  // ── VIEW: CHI TIẾT CÂU HỎI & THREAD TRẢ LỜI ────────────────────────────
  if (hd.cauHoiMo) {
    const cauHoi = hd.cauHoiMo;
    const soLuongTraLoi = cauHoi.danhSachTraLoi?.length ?? 0;

    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        {/* Top bar điều hướng */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            mb: 2,
            pb: 1.5,
            borderBottom: `1px solid ${CSSVAR.divider}`,
          }}
        >
          <Button
            size="small"
            onClick={() => hd.setCauHoiMo(null)}
            startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              color: "text.primary",
              fontWeight: 700,
              fontSize: 13,
              textTransform: "none",
              borderRadius: "8px",
              px: 1.25,
              py: 0.5,
              bgcolor: alpha(PRIMARY, 0.04),
              border: `1px solid ${alpha(PRIMARY, 0.12)}`,
              "&:hover": {
                bgcolor: alpha(PRIMARY, 0.1),
                color: PRIMARY,
                borderColor: PRIMARY,
              },
            }}
          >
            Quay lại danh sách
          </Button>

          {laGiangVien && (
            <Box sx={{ ml: "auto", display: "flex", gap: 0.5 }}>
              <Tooltip title={cauHoi.daGhim ? "Bỏ ghim câu hỏi" : "Ghim câu hỏi lên đầu"}>
                <IconButton
                  size="small"
                  onClick={() => hd.ghimCauHoi(cauHoi.id, !cauHoi.daGhim)}
                  sx={{
                    color: cauHoi.daGhim ? "#D97706" : "text.secondary",
                    bgcolor: cauHoi.daGhim ? "#FEF3C7" : "transparent",
                    "&:hover": { bgcolor: "#FEF3C7", color: "#D97706" },
                  }}
                >
                  {cauHoi.daGhim ? (
                    <PushPinRoundedIcon fontSize="small" />
                  ) : (
                    <PushPinOutlinedIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title={cauHoi.daDong ? "Mở lại thảo luận" : "Đóng câu hỏi này"}>
                <IconButton
                  size="small"
                  onClick={() => hd.dongCauHoi(cauHoi.id, !cauHoi.daDong)}
                  sx={{
                    color: cauHoi.daDong ? STATUS.error : "text.secondary",
                    bgcolor: cauHoi.daDong ? alpha(STATUS.error, 0.1) : "transparent",
                    "&:hover": { bgcolor: alpha(STATUS.error, 0.1), color: STATUS.error },
                  }}
                >
                  {cauHoi.daDong ? (
                    <LockOutlinedIcon fontSize="small" />
                  ) : (
                    <LockOpenOutlinedIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
              {cauHoi.laCuaToi && (
                <Tooltip title="Xóa câu hỏi">
                  <IconButton
                    size="small"
                    onClick={() => hd.xoaCauHoi(cauHoi.id)}
                    sx={{
                      color: "text.secondary",
                      "&:hover": { color: STATUS.error, bgcolor: alpha(STATUS.error, 0.1) },
                    }}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        </Box>

        {/* Nội dung câu hỏi chính & Danh sách phản hồi (Scrollable) */}
        <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
          {/* Card Câu hỏi gốc */}
          <Paper
            elevation={0}
            sx={{
              p: 2.25,
              borderRadius: "14px",
              border: `1px solid ${cauHoi.daGhim ? "#FDE68A" : CSSVAR.divider}`,
              bgcolor: cauHoi.daGhim ? "rgba(254, 243, 199, 0.35)" : "background.paper",
              mb: 2.5,
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
              <UserAvatar anh={cauHoi.nguoiHoiAnh} ten={cauHoi.nguoiHoiTen} size={38} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexWrap: "wrap" }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 14, color: CSSVAR.textPrimary }}>
                    {cauHoi.nguoiHoiTen || "Ẩn danh"}
                  </Typography>
                  {cauHoi.daGhim && (
                    <Chip
                      icon={<PushPinRoundedIcon sx={{ fontSize: "11px !important", color: "#D97706 !important" }} />}
                      label="Đã ghim"
                      size="small"
                      sx={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        height: 20,
                        bgcolor: "#FEF3C7",
                        color: "#92400E",
                        border: "1px solid #FDE68A",
                      }}
                    />
                  )}
                  {cauHoi.daDong && (
                    <Chip
                      icon={<LockOutlinedIcon sx={{ fontSize: "11px !important", color: `${STATUS.error} !important` }} />}
                      label="Đã đóng"
                      size="small"
                      sx={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        height: 20,
                        bgcolor: alpha(STATUS.error, 0.08),
                        color: STATUS.error,
                        border: `1px solid ${alpha(STATUS.error, 0.2)}`,
                      }}
                    />
                  )}
                  <Typography sx={{ fontSize: 12, color: "text.secondary", ml: "auto" }}>
                    {thoiGianTuatoi(cauHoi.ngayTao)}
                  </Typography>
                </Box>
                {cauHoi.tenBaiGiang && (
                  <Chip
                    icon={<PlayCircleOutlineRoundedIcon sx={{ fontSize: "13px !important", color: `${PRIMARY} !important` }} />}
                    label={cauHoi.tenBaiGiang}
                    size="small"
                    sx={{
                      mt: 0.5,
                      fontSize: 11,
                      fontWeight: 600,
                      height: 22,
                      bgcolor: alpha(PRIMARY, 0.06),
                      color: PRIMARY,
                      border: `1px solid ${alpha(PRIMARY, 0.15)}`,
                      maxWidth: "100%",
                      "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
                    }}
                  />
                )}
              </Box>
            </Box>

            <Typography
              sx={{
                fontSize: 14.5,
                color: "text.primary",
                fontWeight: 500,
                lineHeight: 1.65,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {cauHoi.noiDung}
            </Typography>
          </Paper>

          {/* Tiêu đề phần phản hồi */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <ForumRoundedIcon sx={{ fontSize: 18, color: PRIMARY }} />
            <Typography sx={{ fontWeight: 800, fontSize: 14, color: CSSVAR.textPrimary }}>
              Phản hồi ({soLuongTraLoi})
            </Typography>
          </Box>

          {/* Danh sách các câu trả lời dạng Thread */}
          {hd.loadingChiTiet ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress size={28} sx={{ color: PRIMARY }} />
            </Box>
          ) : cayTraLoi.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                px: 2,
                borderRadius: "12px",
                bgcolor: "action.hover",
                border: `1px dashed ${CSSVAR.divider}`,
              }}
            >
              <QuestionAnswerRoundedIcon sx={{ fontSize: 36, color: "text.disabled", mb: 1 }} />
              <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: "text.secondary" }}>
                Chưa có câu trả lời nào
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.5 }}>
                Hãy là người đầu tiên chia sẻ giải đáp hoặc phản hồi!
              </Typography>
            </Box>
          ) : (
            <TraLoiChildren
              nodes={cayTraLoi}
              depth={0}
              tenTheoId={tenTheoId}
              laGiangVien={laGiangVien}
              soLuongHienMacDinh={5}
              coDuongDoc={false}
              onLike={(id) => hd.toggleLike(id)}
              onGhim={(id, ghim) => hd.ghimTraLoi(id, ghim)}
              onXoa={(id) => hd.xoaTraLoi(id)}
              onReply={(idTraLoi, tenNguoi) => {
                hd.setReplyingTo({ idTraLoi, tenNguoi });
                hd.setNoiDungReply("");
              }}
            />
          )}
        </Box>

        {/* COMPOSER PHẢN HỒI Ở CUỐI */}
        {!cauHoi.daDong && (
          <Box
            sx={{
              mt: 1.5,
              pt: 1.5,
              borderTop: `1px solid ${CSSVAR.divider}`,
              bgcolor: "background.paper",
            }}
          >
            {/* Banner trạng thái Replying */}
            {hd.replyingTo && (
              <Fade in={Boolean(hd.replyingTo)}>
                <Box
                  sx={{
                    mb: 1.25,
                    px: 1.5,
                    py: 0.8,
                    bgcolor: alpha(PRIMARY, 0.08),
                    border: `1px solid ${alpha(PRIMARY, 0.2)}`,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: PRIMARY }}>
                    ↩ Đang phản hồi @{hd.replyingTo.tenNguoi}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => hd.setReplyingTo(null)}
                    sx={{ p: 0.25, color: PRIMARY }}
                  >
                    <CloseRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Fade>
            )}

            {hd.replyingTo ? (
              // Form reply con
              <Box>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={4}
                  placeholder={`Viết phản hồi cho @${hd.replyingTo.tenNguoi}...`}
                  value={hd.noiDungReply}
                  onChange={(e) => hd.setNoiDungReply(e.target.value)}
                  disabled={hd.dangReply}
                  autoFocus
                  sx={{
                    mb: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      fontSize: 13.5,
                      bgcolor: "background.default",
                      "& fieldset": { borderColor: "divider" },
                      "&.Mui-focused fieldset": { borderColor: PRIMARY },
                    },
                  }}
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                  <Button
                    size="small"
                    onClick={() => hd.setReplyingTo(null)}
                    sx={{
                      textTransform: "none",
                      color: "text.secondary",
                      fontWeight: 600,
                      borderRadius: "8px",
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={hd.dangReply || !hd.noiDungReply.trim()}
                    onClick={hd.reply}
                    endIcon={
                      hd.dangReply ? (
                        <CircularProgress size={14} sx={{ color: "#fff" }} />
                      ) : (
                        <SendRoundedIcon sx={{ fontSize: 15 }} />
                      )
                    }
                    sx={{
                      bgcolor: PRIMARY,
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "8px",
                      px: 2,
                      boxShadow: "none",
                      "&:hover": { bgcolor: BRAND.dark, boxShadow: "none" },
                    }}
                  >
                    Gửi phản hồi
                  </Button>
                </Box>
              </Box>
            ) : (
              // Form trả lời câu hỏi gốc
              <Box>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={4}
                  placeholder="Viết câu trả lời hoặc thảo luận..."
                  value={hd.noiDungTraLoi}
                  onChange={(e) => hd.setNoiDungTraLoi(e.target.value)}
                  disabled={hd.dangTraLoi}
                  sx={{
                    mb: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      fontSize: 13.5,
                      bgcolor: "background.default",
                      "& fieldset": { borderColor: "divider" },
                      "&.Mui-focused fieldset": { borderColor: PRIMARY },
                    },
                  }}
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={hd.dangTraLoi || !hd.noiDungTraLoi.trim()}
                    onClick={hd.traLoi}
                    endIcon={
                      hd.dangTraLoi ? (
                        <CircularProgress size={14} sx={{ color: "#fff" }} />
                      ) : (
                        <SendRoundedIcon sx={{ fontSize: 15 }} />
                      )
                    }
                    sx={{
                      bgcolor: PRIMARY,
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "8px",
                      px: 2.25,
                      py: 0.6,
                      boxShadow: "none",
                      "&:hover": { bgcolor: BRAND.dark, boxShadow: "none" },
                    }}
                  >
                    Gửi trả lời
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {cauHoi.daDong && (
          <Box
            sx={{
              mt: 1.5,
              p: 1.25,
              bgcolor: alpha(STATUS.error, 0.08),
              border: `1px solid ${alpha(STATUS.error, 0.18)}`,
              borderRadius: "10px",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 16, color: STATUS.error }} />
            <Typography sx={{ fontSize: 13, color: STATUS.error, fontWeight: 700 }}>
              Câu hỏi này đã bị đóng và không nhận thêm phản hồi mới
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  // ── VIEW: DANH SÁCH CÂU HỎI ─────────────────────────────────────────────
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", gap: 2, overflow: "hidden" }}>
      {/* ── Segmented Control Filter Tabs ── */}
      {idBaiGiang && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            bgcolor: "action.hover",
            p: 0.5,
            borderRadius: "12px",
            border: `1px solid ${CSSVAR.divider}`,
          }}
        >
          <Button
            size="small"
            onClick={() => setFilterLoai("TatCa")}
            startIcon={<VideoLibraryRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: "9px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: 12.5,
              py: 0.75,
              color: filterLoai === "TatCa" ? PRIMARY : "text.secondary",
              bgcolor: filterLoai === "TatCa" ? "background.paper" : "transparent",
              boxShadow: filterLoai === "TatCa" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              border: filterLoai === "TatCa" ? `1px solid ${alpha(PRIMARY, 0.15)}` : "1px solid transparent",
              transition: "all 0.2s ease",
            }}
          >
            Tất cả bài giảng ({countTatCa})
          </Button>

          <Button
            size="small"
            onClick={() => setFilterLoai("ChiBaiGiangNay")}
            startIcon={<PlayCircleOutlineRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: "9px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: 12.5,
              py: 0.75,
              color: filterLoai === "ChiBaiGiangNay" ? PRIMARY : "text.secondary",
              bgcolor: filterLoai === "ChiBaiGiangNay" ? "background.paper" : "transparent",
              boxShadow: filterLoai === "ChiBaiGiangNay" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              border: filterLoai === "ChiBaiGiangNay" ? `1px solid ${alpha(PRIMARY, 0.15)}` : "1px solid transparent",
              transition: "all 0.2s ease",
            }}
          >
            Chỉ bài này ({countBaiNay})
          </Button>
        </Box>
      )}

      {/* ── Box Đặt câu hỏi mới ── */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: "14px",
          border: `1px solid ${alpha(PRIMARY, 0.2)}`,
          bgcolor: alpha(PRIMARY, 0.02),
          transition: "all 0.2s ease",
          "&:focus-within": {
            bgcolor: "background.paper",
            borderColor: PRIMARY,
            boxShadow: `0 4px 16px ${alpha(PRIMARY, 0.08)}`,
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.25 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "8px",
              bgcolor: alpha(PRIMARY, 0.1),
              color: PRIMARY,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <EditNoteRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: 13.5, color: PRIMARY }}>
            Đặt câu hỏi mới
          </Typography>
        </Box>

        <TextField
          inputRef={inputRef}
          fullWidth
          multiline
          minRows={2}
          maxRows={4}
          placeholder="Bạn đang gặp khó khăn hoặc có câu hỏi gì? (Tối thiểu 10 ký tự)"
          value={hd.noiDungMoi}
          onChange={(e) => hd.setNoiDungMoi(e.target.value)}
          disabled={hd.dangDat}
          sx={{
            mb: 1.25,
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              fontSize: 13.5,
              bgcolor: "background.paper",
              "& fieldset": { borderColor: "divider" },
              "&.Mui-focused fieldset": { borderColor: PRIMARY },
            },
          }}
        />

        {hd.error && (
          <Typography sx={{ fontSize: 12, color: STATUS.error, mb: 1, fontWeight: 600 }}>
            ⚠️ {hd.error}
          </Typography>
        )}

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Character counter */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {hopLeCauHoi ? (
              <Chip
                icon={<CheckCircleRoundedIcon sx={{ fontSize: "13px !important", color: `${STATUS.success} !important` }} />}
                label={`${doDaiCauHoi} ký tự`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: 11,
                  fontWeight: 600,
                  bgcolor: alpha(STATUS.success, 0.08),
                  color: STATUS.success,
                  border: `1px solid ${alpha(STATUS.success, 0.2)}`,
                }}
              />
            ) : (
              <Typography sx={{ fontSize: 11.5, color: doDaiCauHoi > 0 ? "text.secondary" : "text.disabled", fontWeight: 500 }}>
                {doDaiCauHoi}/10 ký tự
              </Typography>
            )}
          </Box>

          <Button
            variant="contained"
            size="small"
            disabled={hd.dangDat || !hopLeCauHoi}
            onClick={hd.datCauHoi}
            endIcon={
              hd.dangDat ? (
                <CircularProgress size={14} sx={{ color: "#fff" }} />
              ) : (
                <SendRoundedIcon sx={{ fontSize: 15 }} />
              )
            }
            sx={{
              bgcolor: PRIMARY,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13,
              borderRadius: "8px",
              px: 2,
              py: 0.6,
              boxShadow: "none",
              "&:hover": { bgcolor: BRAND.dark, boxShadow: "none" },
            }}
          >
            Đặt câu hỏi
          </Button>
        </Box>
      </Paper>

      {/* ── Thanh tìm kiếm & Sắp xếp ── */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Tìm câu hỏi..."
          value={hd.keyword}
          onChange={(e) => hd.setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && hd.load(true)}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              height: "40px",
              borderRadius: "10px",
              fontSize: 13.5,
              bgcolor: "background.paper",
              "& fieldset": { borderColor: "divider" },
              "&.Mui-focused fieldset": { borderColor: PRIMARY },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                </InputAdornment>
              ),
              endAdornment: hd.keyword ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      hd.setKeyword("");
                      hd.load(true);
                    }}
                    sx={{ p: 0.25 }}
                  >
                    <ClearRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />

        <Select
          size="small"
          value={hd.sapXep}
          onChange={(e) => hd.setSapXep(e.target.value as any)}
          startAdornment={
            <InputAdornment position="start" sx={{ mr: 0.5 }}>
              <SortRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            </InputAdornment>
          }
          sx={{
            height: "40px",
            fontSize: 13,
            fontWeight: 600,
            borderRadius: "10px",
            minWidth: 130,
            bgcolor: "background.paper",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PRIMARY },
          }}
        >
          <MenuItem value="MoiNhat" sx={{ fontSize: 13, fontWeight: 600 }}>Mới nhất</MenuItem>
          <MenuItem value="NhieuTraLoi" sx={{ fontSize: 13, fontWeight: 600 }}>Nhiều phản hồi</MenuItem>
          <MenuItem value="DaGhim" sx={{ fontSize: 13, fontWeight: 600 }}>Được ghim</MenuItem>
        </Select>
      </Box>

      {/* ── Danh sách câu hỏi ── */}
      <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
        {hd.loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={30} sx={{ color: PRIMARY }} />
          </Box>
        ) : cauHoisHienThi.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              px: 3,
              borderRadius: "16px",
              bgcolor: "action.hover",
              border: `1px dashed ${CSSVAR.divider}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: alpha(PRIMARY, 0.08),
                color: PRIMARY,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1.5,
              }}
            >
              <QuestionAnswerRoundedIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: 15, color: CSSVAR.textPrimary }}>
              Chưa có câu hỏi nào
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5, maxWidth: 320 }}>
              {!idBaiGiang
                ? "Chưa có câu hỏi thảo luận chung nào cho khóa học."
                : filterLoai === "ChiBaiGiangNay"
                  ? "Chưa có câu hỏi nào cho bài giảng này. Hãy là người đầu tiên đặt câu hỏi!"
                  : "Bạn có thắc mắc về bài học? Hãy đặt câu hỏi để giảng viên và bạn học hỗ trợ nhé!"}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => inputRef.current?.focus()}
              startIcon={<EditNoteRoundedIcon />}
              sx={{
                mt: 2,
                textTransform: "none",
                fontWeight: 700,
                fontSize: 12.5,
                borderRadius: "8px",
                borderColor: PRIMARY,
                color: PRIMARY,
                "&:hover": { bgcolor: alpha(PRIMARY, 0.06), borderColor: BRAND.dark },
              }}
            >
              Đặt câu hỏi ngay
            </Button>
          </Box>
        ) : (
          <Stack spacing={1.25}>
            {cauHoisHienThi
              .filter((c) => c != null)
              .map((cauHoi) => (
                <Paper
                  key={cauHoi.id}
                  elevation={0}
                  onClick={() => hd.moChiTiet(cauHoi.id)}
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    cursor: "pointer",
                    border: `1px solid ${cauHoi.daGhim ? "#FDE68A" : CSSVAR.divider}`,
                    bgcolor: cauHoi.daGhim
                      ? "rgba(254, 243, 199, 0.35)"
                      : "background.paper",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      borderColor: PRIMARY,
                      bgcolor: alpha(PRIMARY, 0.02),
                      transform: "translateY(-1.5px)",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1.25 }}>
                    <UserAvatar
                      anh={cauHoi.nguoiHoiAnh}
                      ten={cauHoi.nguoiHoiTen}
                      size={34}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.8,
                          mb: 0.5,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: CSSVAR.textPrimary,
                          }}
                        >
                          {cauHoi.nguoiHoiTen || "Ẩn danh"}
                        </Typography>

                        {cauHoi.daGhim && (
                          <Chip
                            icon={<PushPinRoundedIcon sx={{ fontSize: "10px !important", color: "#D97706 !important" }} />}
                            label="Ghim"
                            size="small"
                            sx={{
                              fontSize: 10,
                              fontWeight: 700,
                              height: 18,
                              bgcolor: "#FEF3C7",
                              color: "#92400E",
                              border: "1px solid #FDE68A",
                              "& .MuiChip-label": { px: 0.6 },
                            }}
                          />
                        )}

                        {cauHoi.daDong && (
                          <Chip
                            icon={<LockOutlinedIcon sx={{ fontSize: "10px !important", color: `${STATUS.error} !important` }} />}
                            label="Đã đóng"
                            size="small"
                            sx={{
                              fontSize: 10,
                              fontWeight: 700,
                              height: 18,
                              bgcolor: alpha(STATUS.error, 0.08),
                              color: STATUS.error,
                              border: `1px solid ${alpha(STATUS.error, 0.2)}`,
                              "& .MuiChip-label": { px: 0.6 },
                            }}
                          />
                        )}

                        <Typography
                          sx={{
                            fontSize: 11.5,
                            color: "text.secondary",
                            ml: "auto",
                          }}
                        >
                          {thoiGianTuatoi(cauHoi.ngayTao)}
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          fontSize: 13.5,
                          color: "text.primary",
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          lineHeight: 1.5,
                          wordBreak: "break-word",
                        }}
                      >
                        {cauHoi.noiDung}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 1.25,
                        }}
                      >
                        {/* Tag tên bài giảng */}
                        {cauHoi.tenBaiGiang && !idBaiGiang && (
                          <Chip
                            icon={<PlayCircleOutlineRoundedIcon sx={{ fontSize: "12px !important", color: `${PRIMARY} !important` }} />}
                            label={cauHoi.tenBaiGiang}
                            size="small"
                            sx={{
                              fontSize: 10.5,
                              fontWeight: 600,
                              height: 20,
                              bgcolor: alpha(PRIMARY, 0.06),
                              color: PRIMARY,
                              border: `1px solid ${alpha(PRIMARY, 0.15)}`,
                              maxWidth: 220,
                              "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
                            }}
                          />
                        )}

                        {!cauHoi.tenBaiGiang && !idBaiGiang && (
                          <Chip
                            label="Thảo luận chung"
                            size="small"
                            sx={{
                              fontSize: 10.5,
                              fontWeight: 600,
                              height: 20,
                              bgcolor: "#EFF6FF",
                              color: "#2563EB",
                              border: "1px solid #BFDBFE",
                            }}
                          />
                        )}

                        {/* Reply count pill */}
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            ml: "auto",
                            px: 1,
                            py: 0.3,
                            borderRadius: "999px",
                            bgcolor: cauHoi.soTraLoi > 0 ? alpha(PRIMARY, 0.08) : "action.hover",
                            color: cauHoi.soTraLoi > 0 ? PRIMARY : "text.secondary",
                            border: `1px solid ${cauHoi.soTraLoi > 0 ? alpha(PRIMARY, 0.18) : CSSVAR.divider}`,
                          }}
                        >
                          <ForumRoundedIcon sx={{ fontSize: 13 }} />
                          <Typography
                            sx={{
                              fontSize: 11.5,
                              fontWeight: 700,
                            }}
                          >
                            {cauHoi.soTraLoi} phản hồi
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              ))}

            {/* Nút Xem thêm câu hỏi */}
            {hd.page < hd.totalPages && (
              <Button
                fullWidth
                variant="outlined"
                onClick={() => hd.load(false)}
                disabled={hd.loadingMore}
                sx={{
                  mt: 1,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 13,
                  borderRadius: "10px",
                  borderColor: "divider",
                  color: "text.secondary",
                  py: 1,
                  "&:hover": { borderColor: PRIMARY, color: PRIMARY, bgcolor: alpha(PRIMARY, 0.04) },
                }}
              >
                {hd.loadingMore ? (
                  <CircularProgress size={18} sx={{ color: PRIMARY }} />
                ) : (
                  "Xem thêm câu hỏi cũ hơn"
                )}
              </Button>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
