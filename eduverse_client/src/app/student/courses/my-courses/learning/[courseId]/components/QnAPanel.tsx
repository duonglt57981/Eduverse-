/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Box,
  Typography,
  Avatar,
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
} from "@mui/material";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import PushPinIcon from "@mui/icons-material/PushPin";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ReplyIcon from "@mui/icons-material/Reply";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useMemo, useState, useEffect } from "react";
import { useHoiDap } from "../hooks/useHoiDap";
import { HoiDapDto, TraLoiDto } from "@/src/services/HoiDapService";
import { BRAND, STATUS, NEUTRAL } from "@/src/theme/tokens";

const PRIMARY = BRAND.main;

interface QnAPanelProps {
  idKhoaHoc: string; // ← id thật của khóa học, KHÔNG phải idDangKyKhoaHoc
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
  return (
    <Avatar
      src={anh || ""}
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        bgcolor: `${PRIMARY}22`,
        color: PRIMARY,
        fontWeight: 700,
        fontSize: size * 0.4,
      }}
    >
      {ten?.[0] || "?"}
    </Avatar>
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
    // Chỉ coi là "con" nếu tìm thấy cha thật sự trong danh sách hiện có.
    // Nếu cha không còn tồn tại (đã bị xóa) thì fallback về gốc, tránh mất trả lời.
    if (idCha && mapNode.has(idCha)) {
      mapNode.get(idCha)!.con.push(node);
    } else {
      goc.push(node);
    }
  });

  // Sắp theo thời gian tạo (cũ → mới) ở mọi cấp
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

function demTongSoNode(nodes: TraLoiNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + demTongSoNode(n.con), 0);
}

// ── Card câu trả lời ─────────────────────────────────────────────────────
// Ghi chú: KHÔNG dùng position:absolute + top/left tính cứng theo px nữa,
// vì chiều cao mỗi card thay đổi theo độ dài nội dung → dễ lệch, răng cưa.
// Thay vào đó: đường dọc là border-left của cả CỤM CON (xem TraLoiThread),
// tự co giãn theo chiều cao thật; ở đây chỉ vẽ 1 đường ngang ngắn nối
// vào tâm avatar bằng flex + margin âm, luôn canh giữa avatar (36px).
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
        // Card cuối cùng của một nhóm anh em KHÔNG có padding-bottom, vì
        // padding này nằm bên trong đường borderLeft của khối cha (xem
        // TraLoiChildren) — nếu để pb ở đây, đường kẻ dọc sẽ bị "thừa"
        // một đoạn trống phía dưới avatar cuối cùng thay vì dừng khít lại.
        // LƯU Ý: không dùng margin-bottom thay thế — trong flex container,
        // margin của phần tử con vẫn nằm trong phạm vi mà border-left của
        // cha kéo dài qua (không bị "đẩy ra ngoài" như block layout có thể
        // collapse), nên margin cũng sẽ kéo dài đường kẻ y hệt padding.
        // Khoảng cách với phần tử tiếp theo (nút "Xem thêm", card cha kế
        // tiếp) phải đặt ở ngoài TraLoiChildren, không đặt ở card con.
        pb: laCuoiNhom ? 0 : 1.5,
        ...(traLoi.ghimTraLoi
          ? { bgcolor: `${PRIMARY}05`, mx: -2, px: 2, borderRadius: "10px" }
          : {}),
      }}
    >
      {/* Đường ngang nối từ đường dọc (border-left của khối bọc, xem
          TraLoiThread) vào tâm avatar. Khối bọc có pl: 17px nên đường ngang
          dài đúng 17px và kéo ngược bằng margin âm để chạm vào border đó —
          không đoán số theo chiều cao card, nên không phụ thuộc nội dung dài/ngắn. */}
      {depth > 0 && (
        <Box
          sx={{
            width: "17px",
            height: "2px",
            bgcolor: `${PRIMARY}22`,
            flexShrink: 0,
            mt: "15px", // canh vào tâm avatar 32px (pt:1.5 = 12px, +16px nửa avatar, -1px nửa đường kẻ)
            ml: "-17px",
          }}
        />
      )}

      <UserAvatar
        anh={traLoi.nguoiTraLoiAnh}
        ten={traLoi.nguoiTraLoiTen}
        size={32}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
            mb: 0.5,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 13, color: NEUTRAL.textPrimary }}>
            {traLoi.nguoiTraLoiTen || "Ẩn danh"}
          </Typography>
          {traLoi.laGiangVien && (
            <Chip
              icon={<SchoolOutlinedIcon sx={{ fontSize: 12 }} />}
              label="Giảng viên"
              size="small"
              sx={{
                fontSize: 10,
                fontWeight: 700,
                height: 18,
                bgcolor: `${PRIMARY}14`,
                color: PRIMARY,
              }}
            />
          )}
          {traLoi.ghimTraLoi && (
            <Chip
              label="Được ghim"
              size="small"
              sx={{
                fontSize: 10,
                height: 18,
                bgcolor: "#FEF3C7",
                color: STATUS.warningDark,
              }}
            />
          )}
          <Typography sx={{ fontSize: 11, color: NEUTRAL.grey, ml: "auto" }}>
            {thoiGianTuatoi(traLoi.ngayTao)}
          </Typography>
        </Box>

        {/* Nhãn "Trả lời @Ten" — lấy từ id thật (idTraLoiDuocReply), không đoán từ text nữa */}
        {tenNguoiDuocReply && (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.4,
              mb: 0.5,
              px: 0.75,
              py: 0.25,
              borderRadius: "6px",
              bgcolor: `${PRIMARY}0A`,
            }}
          >
            <SubdirectoryArrowRightIcon
              sx={{ fontSize: 12, color: PRIMARY, opacity: 0.7 }}
            />
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: PRIMARY }}>
              Trả lời {tenNguoiDuocReply}
            </Typography>
          </Box>
        )}

        {/* Nội dung */}
        <Typography
          sx={{
            fontSize: 14,
            color: "#374151",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}
        >
          {traLoi.noiDung}
        </Typography>

        {/* Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1 }}>
          {/* Like */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={onLike}
              sx={{
                p: 0.5,
                color: traLoi.daLike ? PRIMARY : NEUTRAL.grey,
                "&:hover": { color: PRIMARY },
              }}
            >
              {traLoi.daLike ? (
                <ThumbUpIcon sx={{ fontSize: 15 }} />
              ) : (
                <ThumbUpOutlinedIcon sx={{ fontSize: 15 }} />
              )}
            </IconButton>
            {traLoi.soLike > 0 && (
              <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                {traLoi.soLike}
              </Typography>
            )}
          </Box>

          {/* Nút Phản hồi */}
          <Button
            size="small"
            startIcon={<ReplyIcon sx={{ fontSize: 14 }} />}
            onClick={() =>
              onReply(traLoi.id, traLoi.nguoiTraLoiTen || "Ẩn danh")
            }
            sx={{
              textTransform: "none",
              fontSize: 12,
              fontWeight: 600,
              color: "#6B7280",
              p: "2px 8px",
              minWidth: 0,
              "&:hover": { color: PRIMARY, bgcolor: `${PRIMARY}08` },
            }}
          >
            Phản hồi
          </Button>

          {laGiangVien && (
            <Tooltip title={traLoi.ghimTraLoi ? "Bỏ ghim" : "Ghim trả lời này"}>
              <IconButton
                size="small"
                onClick={onGhim}
                sx={{
                  p: 0.5,
                  color: traLoi.ghimTraLoi ? STATUS.warningDark : NEUTRAL.grey,
                  "&:hover": { color: STATUS.warningDark },
                }}
              >
                {traLoi.ghimTraLoi ? (
                  <PushPinIcon sx={{ fontSize: 15 }} />
                ) : (
                  <PushPinOutlinedIcon sx={{ fontSize: 15 }} />
                )}
              </IconButton>
            </Tooltip>
          )}

          {(traLoi.laCuaToi || laGiangVien) && (
            <Tooltip title="Xóa">
              <IconButton
                size="small"
                onClick={onXoa}
                sx={{
                  p: 0.5,
                  color: NEUTRAL.grey,
                  "&:hover": { color: STATUS.error },
                }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ── Nhóm trả lời con — mặc định chỉ hiện vài cái đầu, có nút "Xem thêm" ──
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
              ml: "15px", // canh đúng tâm avatar 32px của card cha (16px - 1px border)
              pl: "17px", // khoảng cách từ đường dọc tới avatar con
              borderLeft: `2px solid ${PRIMARY}22`,
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
            <SubdirectoryArrowRightIcon
              sx={{
                fontSize: 13,
                transform: daMoRong ? "scaleY(-1)" : "none",
              }}
            />
          }
          sx={{
            textTransform: "none",
            fontSize: 12.5,
            fontWeight: 700,
            color: PRIMARY,
            p: "4px 8px",
            minWidth: 0,
            "&:hover": { bgcolor: `${PRIMARY}08` },
          }}
        >
          {daMoRong ? "Ẩn bớt phản hồi" : `Xem thêm ${soLuongAn} phản hồi`}
        </Button>
      )}
    </Box>
  );
}

// ── Render đệ quy cây trả lời (thread) ───────────────────────────────────
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
              // Đường dọc = borderLeft của khối bọc quanh toàn bộ nhóm con.
              // Vì đây là border thật trên 1 khối duy nhất (không phải nhiều
              // box absolute rời rạc), nó luôn chạy liền mạch và tự co giãn
              // đúng theo chiều cao thật của nội dung — không thể bị lệch.
              // Bọc thêm qua TraLoiChildren để có nút "Xem thêm" khi nhóm
              // con quá dài, tránh cả panel bị kéo dài vô hạn.
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
              <Box sx={{ pt: 0.5, pb: 0.5 }}>
                <Divider />
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ── Component chính ──────────────────────────────────────────────────────

export function QnAPanel({
  idKhoaHoc,
  idBaiGiang,
  laGiangVien,
  tenBaiGiang,
  idCauHoiCanMo,
}: QnAPanelProps) {
  const hd = useHoiDap({ idKhoaHoc, idBaiGiang, laGiangVien });

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

  // ── Cây trả lời + map id→tên cho câu hỏi đang mở ────────────────────────
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

  // ── View chi tiết câu hỏi ─────────────────────────────────────────────
  if (hd.cauHoiMo) {
    const cauHoi = hd.cauHoiMo;
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <IconButton
            size="small"
            onClick={() => hd.setCauHoiMo(null)}
            sx={{ color: PRIMARY }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: NEUTRAL.textPrimary }}>
            Câu hỏi
          </Typography>
          {laGiangVien && (
            <Box sx={{ ml: "auto", display: "flex", gap: 0.5 }}>
              <Tooltip
                title={cauHoi.daGhim ? "Bỏ ghim câu hỏi" : "Ghim câu hỏi"}
              >
                <IconButton
                  size="small"
                  onClick={() => hd.ghimCauHoi(cauHoi.id, !cauHoi.daGhim)}
                  sx={{ color: cauHoi.daGhim ? STATUS.warningDark : NEUTRAL.grey }}
                >
                  {cauHoi.daGhim ? (
                    <PushPinIcon fontSize="small" />
                  ) : (
                    <PushPinOutlinedIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip
                title={cauHoi.daDong ? "Mở lại câu hỏi" : "Đóng câu hỏi"}
              >
                <IconButton
                  size="small"
                  onClick={() => hd.dongCauHoi(cauHoi.id, !cauHoi.daDong)}
                  sx={{ color: cauHoi.daDong ? STATUS.error : NEUTRAL.grey }}
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
                    sx={{ color: NEUTRAL.grey, "&:hover": { color: STATUS.error } }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        </Box>

        {/* Câu hỏi gốc */}
        <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
          <UserAvatar anh={cauHoi.nguoiHoiAnh} ten={cauHoi.nguoiHoiTen} />
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                {cauHoi.nguoiHoiTen || "Ẩn danh"}
              </Typography>
              {cauHoi.daGhim && (
                <Chip
                  label="Được ghim"
                  size="small"
                  sx={{
                    fontSize: 10,
                    height: 18,
                    bgcolor: "#FEF3C7",
                    color: STATUS.warningDark,
                  }}
                />
              )}
              {cauHoi.daDong && (
                <Chip
                  label="Đã đóng"
                  size="small"
                  sx={{
                    fontSize: 10,
                    height: 18,
                    bgcolor: "#FEE2E2",
                    color: STATUS.error,
                  }}
                />
              )}
              <Typography sx={{ fontSize: 11, color: NEUTRAL.grey, ml: "auto" }}>
                {thoiGianTuatoi(cauHoi.ngayTao)}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: 14,
                color: NEUTRAL.textPrimary,
                fontWeight: 600,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}
            >
              {cauHoi.noiDung}
            </Typography>
            {cauHoi.tenBaiGiang && (
              <Typography sx={{ fontSize: 11, color: NEUTRAL.textMuted, mt: 0.5 }}>
                📹 {cauHoi.tenBaiGiang}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Danh sách trả lời — dạng thread có dây nối */}
        <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
          {hd.loadingChiTiet ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={24} sx={{ color: PRIMARY }} />
            </Box>
          ) : cayTraLoi.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <QuestionAnswerOutlinedIcon
                sx={{ fontSize: 36, color: "#D1D5DB", mb: 1 }}
              />
              <Typography sx={{ fontSize: 13, color: NEUTRAL.grey }}>
                Chưa có câu trả lời nào. Hãy là người đầu tiên!
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

        {/* Box phản hồi — hiện khi đang reply ai đó */}
        {!cauHoi.daDong && hd.replyingTo && (
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: `1px solid ${NEUTRAL.divider}`,
            }}
          >
            <Box
              sx={{
                mb: 1.5,
                px: 1.5,
                py: 1,
                bgcolor: `${PRIMARY}08`,
                border: `1px solid ${PRIMARY}22`,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                sx={{ fontSize: 12, fontWeight: 700, color: PRIMARY }}
              >
                ↩ Đang phản hồi @{hd.replyingTo.tenNguoi}
              </Typography>
              <IconButton size="small" onClick={() => hd.setReplyingTo(null)}>
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              placeholder={`Phản hồi @${hd.replyingTo.tenNguoi}...`}
              value={hd.noiDungReply}
              onChange={(e) => hd.setNoiDungReply(e.target.value)}
              disabled={hd.dangReply}
              autoFocus
              sx={{
                mb: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  fontSize: 14,
                  "& fieldset": { borderColor: NEUTRAL.divider },
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
                  color: "#6B7280",
                  fontWeight: 600,
                }}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                size="small"
                disabled={hd.dangReply || !hd.noiDungReply.trim()}
                onClick={hd.reply}
                sx={{
                  bgcolor: PRIMARY,
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: "8px",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#6B0F0F", boxShadow: "none" },
                }}
              >
                {hd.dangReply ? (
                  <CircularProgress size={14} sx={{ color: "#fff" }} />
                ) : (
                  "Gửi phản hồi"
                )}
              </Button>
            </Box>
          </Box>
        )}

        {/* Form trả lời chính — ẩn khi đang reply */}
        {!cauHoi.daDong && !hd.replyingTo && (
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${NEUTRAL.divider}` }}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={5}
              placeholder="Viết câu trả lời..."
              value={hd.noiDungTraLoi}
              onChange={(e) => hd.setNoiDungTraLoi(e.target.value)}
              disabled={hd.dangTraLoi}
              sx={{
                mb: 1.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  fontSize: 14,
                  "& fieldset": { borderColor: NEUTRAL.divider },
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
                sx={{
                  bgcolor: PRIMARY,
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: "8px",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#6B0F0F", boxShadow: "none" },
                }}
              >
                {hd.dangTraLoi ? (
                  <CircularProgress size={16} sx={{ color: "#fff" }} />
                ) : (
                  "Gửi trả lời"
                )}
              </Button>
            </Box>
          </Box>
        )}

        {cauHoi.daDong && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              bgcolor: "#FEE2E2",
              borderRadius: "10px",
              textAlign: "center",
            }}
          >
            <Typography
              sx={{ fontSize: 13, color: STATUS.error, fontWeight: 600 }}
            >
              🔒 Câu hỏi này đã bị đóng
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  // ── View danh sách câu hỏi ─────────────────────────────────────────────
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", height: "100%", gap: 2 }}
    >
      {/* Header */}
      <Box>
        <Typography
          sx={{ fontWeight: 800, fontSize: 17, color: NEUTRAL.textPrimary, mb: 0.5 }}
        >
          {idBaiGiang
            ? `Q&A — ${tenBaiGiang || "Bài giảng"}`
            : "Hỏi đáp khóa học"}
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#6B7280" }}>
          {cauHoisHienThi.length} câu hỏi
        </Typography>
      </Box>

      {/* ── Filter ── */}
      {idBaiGiang && (
        <Box sx={{ display: "flex", gap: 1 }}>
          {(["TatCa", "ChiBaiGiangNay"] as const).map((val) => (
            <Chip
              key={val}
              label={val === "TatCa" ? "Tất cả bài giảng" : "Chỉ bài này"}
              onClick={() => setFilterLoai(val)}
              sx={{
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                height: 28,
                bgcolor: filterLoai === val ? PRIMARY : "transparent",
                color: filterLoai === val ? "#fff" : "#6B7280",
                border: `1px solid ${filterLoai === val ? PRIMARY : NEUTRAL.divider}`,
                "&:hover": {
                  bgcolor: filterLoai === val ? PRIMARY : `${PRIMARY}08`,
                  color: filterLoai === val ? "#fff" : PRIMARY,
                },
              }}
            />
          ))}
        </Box>
      )}

      {/* Form đặt câu hỏi */}
      <Box
        sx={{
          p: 2,
          borderRadius: "12px",
          border: `1px solid ${PRIMARY}33`,
          bgcolor: `${PRIMARY}04`,
        }}
      >
        <Typography
          sx={{ fontWeight: 700, fontSize: 13, color: PRIMARY, mb: 1 }}
        >
          ✏️ Đặt câu hỏi
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={5}
          placeholder="Bạn đang gặp khó khăn gì? (ít nhất 10 ký tự)"
          value={hd.noiDungMoi}
          onChange={(e) => hd.setNoiDungMoi(e.target.value)}
          disabled={hd.dangDat}
          sx={{
            mb: 1.5,
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              fontSize: 14,
              bgcolor: "#fff",
              "& fieldset": { borderColor: NEUTRAL.divider },
              "&.Mui-focused fieldset": { borderColor: PRIMARY },
            },
          }}
        />
        {hd.error && (
          <Typography sx={{ fontSize: 12, color: STATUS.error, mb: 1 }}>
            {hd.error}
          </Typography>
        )}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            size="small"
            disabled={hd.dangDat || hd.noiDungMoi.trim().length < 10}
            onClick={hd.datCauHoi}
            sx={{
              bgcolor: PRIMARY,
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "8px",
              boxShadow: "none",
              "&:hover": { bgcolor: "#6B0F0F", boxShadow: "none" },
            }}
          >
            {hd.dangDat ? (
              <CircularProgress size={16} sx={{ color: "#fff" }} />
            ) : (
              "Đặt câu hỏi"
            )}
          </Button>
        </Box>
      </Box>

      {/* Filter & Sort */}
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
              height: "44px",
              borderRadius: "8px",
              fontSize: 14,
              "& fieldset": { borderColor: NEUTRAL.divider },
              "&.Mui-focused fieldset": { borderColor: PRIMARY },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: NEUTRAL.grey }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Select
          size="small"
          value={hd.sapXep}
          onChange={(e) => hd.setSapXep(e.target.value as any)}
          sx={{
            height: "44px",
            fontSize: 14,
            borderRadius: "8px",
            minWidth: 120,
            "& .MuiSelect-select": {
              display: "flex",
              alignItems: "center",
            },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: NEUTRAL.divider },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: PRIMARY,
            },
          }}
        >
          <MenuItem value="MoiNhat">Mới nhất</MenuItem>
          <MenuItem value="NhieuTraLoi">Nhiều trả lời</MenuItem>
          <MenuItem value="DaGhim">Được ghim</MenuItem>
        </Select>
      </Box>

      {/* Danh sách */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {hd.loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={28} sx={{ color: PRIMARY }} />
          </Box>
        ) : cauHoisHienThi.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <QuestionAnswerOutlinedIcon
              sx={{ fontSize: 48, color: "#D1D5DB", mb: 1 }}
            />
            <Typography
              sx={{ fontWeight: 700, fontSize: 15, color: NEUTRAL.grey }}
            >
              Chưa có câu hỏi nào
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#C4C9D4", mt: 0.5 }}>
              {!idBaiGiang
                ? "Chưa có câu hỏi chung nào"
                : filterLoai === "ChiBaiGiangNay"
                  ? "Chưa có câu hỏi nào cho bài giảng này"
                  : "Hãy đặt câu hỏi đầu tiên!"}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {cauHoisHienThi
              .filter((c) => c != null)
              .map((cauHoi) => (
                <Box
                  key={cauHoi.id}
                  onClick={() => hd.moChiTiet(cauHoi.id)}
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    cursor: "pointer",
                    border: `1px solid ${cauHoi.daGhim ? "#FDE68A" : NEUTRAL.divider}`,
                    bgcolor: cauHoi.daGhim
                      ? "#FFFBEB"
                      : "var(--ev-paper, #fff)",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      borderColor: PRIMARY,
                      bgcolor: `${PRIMARY}05`,
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <UserAvatar
                      anh={cauHoi.nguoiHoiAnh}
                      ten={cauHoi.nguoiHoiTen}
                      size={32}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
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
                            fontSize: 12.5,
                            color: "#374151",
                          }}
                        >
                          {cauHoi.nguoiHoiTen || "Ẩn danh"}
                        </Typography>
                        {cauHoi.daGhim && (
                          <Chip
                            label="📌 Ghim"
                            size="small"
                            sx={{
                              fontSize: 10,
                              height: 16,
                              bgcolor: "#FEF3C7",
                              color: STATUS.warningDark,
                            }}
                          />
                        )}
                        {cauHoi.daDong && (
                          <Chip
                            label="🔒 Đóng"
                            size="small"
                            sx={{
                              fontSize: 10,
                              height: 16,
                              bgcolor: "#FEE2E2",
                              color: STATUS.error,
                            }}
                          />
                        )}
                        <Typography
                          sx={{ fontSize: 11, color: NEUTRAL.grey, ml: "auto" }}
                        >
                          {thoiGianTuatoi(cauHoi.ngayTao)}
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          fontSize: 13.5,
                          color: NEUTRAL.textPrimary,
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          lineHeight: 1.5,
                        }}
                      >
                        {cauHoi.noiDung}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          mt: 1,
                        }}
                      >
                        {/* Hiện tên bài giảng nếu đang ở tab tổng */}
                        {cauHoi.tenBaiGiang && !idBaiGiang && (
                          <Typography sx={{ fontSize: 11, color: NEUTRAL.textMuted }}>
                            📹 {cauHoi.tenBaiGiang}
                          </Typography>
                        )}
                        {/* Badge "Chung" nếu không gắn bài giảng */}
                        {!cauHoi.tenBaiGiang && !idBaiGiang && (
                          <Chip
                            label="Chung"
                            size="small"
                            sx={{
                              fontSize: 10,
                              height: 16,
                              bgcolor: "#EFF6FF",
                              color: "#2563EB",
                            }}
                          />
                        )}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            ml: "auto",
                          }}
                        >
                          <QuestionAnswerOutlinedIcon
                            sx={{ fontSize: 13, color: NEUTRAL.grey }}
                          />
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "#6B7280",
                              fontWeight: 600,
                            }}
                          >
                            {cauHoi.soTraLoi}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}

            {/* Load more */}
            {hd.page < hd.totalPages && (
              <Button
                fullWidth
                variant="outlined"
                onClick={() => hd.load(false)}
                disabled={hd.loadingMore}
                sx={{
                  mt: 1,
                  textTransform: "none",
                  borderRadius: "10px",
                  borderColor: NEUTRAL.divider,
                  color: "#6B7280",
                  "&:hover": { borderColor: PRIMARY, color: PRIMARY },
                }}
              >
                {hd.loadingMore ? (
                  <CircularProgress size={18} sx={{ color: PRIMARY }} />
                ) : (
                  "Xem thêm câu hỏi"
                )}
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
