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
  ToggleButtonGroup,
  ToggleButton,
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
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useMemo, useState, useEffect } from "react";
import { useHoiDap } from "../hooks/useHoiDap";
import { HoiDapDto, TraLoiDto } from "@/src/services/HoiDapService";

const PRIMARY = "#8B1313";

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

// ── Card câu trả lời ─────────────────────────────────────────────────────
function TraLoiCard({
  traLoi,
  laGiangVien,
  onLike,
  onGhim,
  onXoa,
  onReply,
}: {
  traLoi: TraLoiDto;
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
        gap: 1.5,
        py: 2,
        ...(traLoi.ghimTraLoi
          ? { bgcolor: `${PRIMARY}05`, mx: -2, px: 2, borderRadius: "10px" }
          : {}),
      }}
    >
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
          <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#1F2937" }}>
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
                color: "#D97706",
              }}
            />
          )}
          <Typography sx={{ fontSize: 11, color: "#9CA3AF", ml: "auto" }}>
            {thoiGianTuatoi(traLoi.ngayTao)}
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
          {traLoi.noiDung.startsWith("@") ? (
            <>
              <Box component="span" sx={{ color: PRIMARY, fontWeight: 700 }}>
                {traLoi.noiDung.split(" ")[0]}
              </Box>
              {" " + traLoi.noiDung.split(" ").slice(1).join(" ")}
            </>
          ) : (
            traLoi.noiDung
          )}
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
                color: traLoi.daLike ? PRIMARY : "#9CA3AF",
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
                  color: traLoi.ghimTraLoi ? "#D97706" : "#9CA3AF",
                  "&:hover": { color: "#D97706" },
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
                  color: "#9CA3AF",
                  "&:hover": { color: "#DC2626" },
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

// ── Component chính ──────────────────────────────────────────────────────

export function QnAPanel({
  idKhoaHoc,
  idBaiGiang,
  laGiangVien,
  tenBaiGiang,
  idCauHoiCanMo,
}: QnAPanelProps) {
  console.log("🔍 QnAPanel render:", { idKhoaHoc, idBaiGiang });
  const hd = useHoiDap({ idKhoaHoc, idBaiGiang, laGiangVien });
  console.log("🔍 useHoiDap state:", {
    cauHoisLength: hd.cauHois.length,
    loading: hd.loading,
    error: hd.error,
  });

  useEffect(() => {
    if (idCauHoiCanMo) {
      hd.moChiTiet(idCauHoiCanMo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idCauHoiCanMo]);

  // ── Filter state ──────────────────────────────────────────────────────
  // Drawer bài giảng: "TatCa" | "ChiBaiGiangNay"
  // Tab tổng:         "TatCa" | "ChiChung"
  const [filterLoai, setFilterLoai] = useState<"TatCa" | "ChiBaiGiangNay">(
    "TatCa",
  );

  // Danh sách sau khi filter — xử lý ở FE, không cần gọi lại API
  const cauHoisHienThi = useMemo(() => {
    if (!idBaiGiang) {
      return hd.cauHois.filter((c) => !c.idBaiGiang);
    }
    if (filterLoai === "ChiBaiGiangNay") {
      return hd.cauHois.filter((c) => c.idBaiGiang === idBaiGiang);
    }
    return hd.cauHois;
  }, [hd.cauHois, filterLoai, idBaiGiang]);

  // ── View chi tiết câu hỏi ─────────────────────────────────────────────
  console.log("cauHoiMo hiện tại:", hd.cauHoiMo);
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
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#1F2937" }}>
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
                  sx={{ color: cauHoi.daGhim ? "#D97706" : "#9CA3AF" }}
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
                  sx={{ color: cauHoi.daDong ? "#DC2626" : "#9CA3AF" }}
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
                    sx={{ color: "#9CA3AF", "&:hover": { color: "#DC2626" } }}
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
                    color: "#D97706",
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
                    color: "#DC2626",
                  }}
                />
              )}
              <Typography sx={{ fontSize: 11, color: "#9CA3AF", ml: "auto" }}>
                {thoiGianTuatoi(cauHoi.ngayTao)}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: 14,
                color: "#1F2937",
                fontWeight: 600,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}
            >
              {cauHoi.noiDung}
            </Typography>
            {cauHoi.tenBaiGiang && (
              <Typography sx={{ fontSize: 11, color: "#8A7676", mt: 0.5 }}>
                📹 {cauHoi.tenBaiGiang}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Danh sách trả lời */}
        <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
          {hd.loadingChiTiet ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={24} sx={{ color: PRIMARY }} />
            </Box>
          ) : cauHoi.danhSachTraLoi.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <QuestionAnswerOutlinedIcon
                sx={{ fontSize: 36, color: "#D1D5DB", mb: 1 }}
              />
              <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>
                Chưa có câu trả lời nào. Hãy là người đầu tiên!
              </Typography>
            </Box>
          ) : (
            cauHoi.danhSachTraLoi.map((tl, idx) => (
              <Box key={tl.id}>
                <TraLoiCard
                  traLoi={tl}
                  laGiangVien={laGiangVien}
                  onLike={() => hd.toggleLike(tl.id)}
                  onGhim={() => hd.ghimTraLoi(tl.id, !tl.ghimTraLoi)}
                  onXoa={() => hd.xoaTraLoi(tl.id)}
                  onReply={(idTraLoi, tenNguoi) => {
                    hd.setReplyingTo({ idTraLoi, tenNguoi });
                    hd.setNoiDungReply("");
                  }}
                />
                {idx < cauHoi.danhSachTraLoi.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </Box>

        {/* Box phản hồi — hiện khi đang reply ai đó */}
        {!cauHoi.daDong && hd.replyingTo && (
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: "1px solid #ECE7E4",
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
                  "& fieldset": { borderColor: "#ECE7E4" },
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
          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #ECE7E4" }}>
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
                  "& fieldset": { borderColor: "#ECE7E4" },
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
              sx={{ fontSize: 13, color: "#DC2626", fontWeight: 600 }}
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
          sx={{ fontWeight: 800, fontSize: 17, color: "#1F2937", mb: 0.5 }}
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
                border: `1px solid ${filterLoai === val ? PRIMARY : "#ECE7E4"}`,
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
              "& fieldset": { borderColor: "#ECE7E4" },
              "&.Mui-focused fieldset": { borderColor: PRIMARY },
            },
          }}
        />
        {hd.error && (
          <Typography sx={{ fontSize: 12, color: "#DC2626", mb: 1 }}>
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
              "& fieldset": { borderColor: "#ECE7E4" },
              "&.Mui-focused fieldset": { borderColor: PRIMARY },
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
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ECE7E4" },
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
              sx={{ fontWeight: 700, fontSize: 15, color: "#9CA3AF" }}
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
                  onClick={() => {
                    console.log("🖱️ CLICKED cauHoi:", cauHoi.id); // ← thêm dòng này
                    hd.moChiTiet(cauHoi.id);
                  }}
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    cursor: "pointer",
                    border: `1px solid ${cauHoi.daGhim ? "#FDE68A" : "#ECE7E4"}`,
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
                              height: 16,
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

                      <Typography
                        sx={{
                          fontSize: 13.5,
                          color: "#1F2937",
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
                          <Typography sx={{ fontSize: 11, color: "#8A7676" }}>
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
                            sx={{ fontSize: 13, color: "#9CA3AF" }}
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
                  borderColor: "#ECE7E4",
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
