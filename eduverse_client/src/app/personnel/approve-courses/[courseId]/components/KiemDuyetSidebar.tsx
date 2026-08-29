/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { BRAND } from "@/src/theme/tokens";
import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  TextField,
  InputAdornment,
  Collapse,
  alpha,
  Tooltip,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import { isTrangThaiCho } from "@/src/app/admin/approve-courses/types/constants";

const PRIMARY_RED = BRAND.main;

type LoaiNoiDung = "baiGiang" | "taiLieu" | "baiKiemTra";

interface SelectedContent {
  loai: LoaiNoiDung;
  item: any;
}

interface KiemDuyetSidebarProps {
  detail: any;
  selected: SelectedContent | null;
  onSelectContent: (loai: LoaiNoiDung, item: any, parentBaiGiang?: any) => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function KiemDuyetSidebar({
  detail,
  selected,
  onSelectContent,
  isMobile,
  onCloseMobile,
}: KiemDuyetSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [openPhan, setOpenPhan] = useState<Record<string, boolean>>({});
  const [openTaiLieu, setOpenTaiLieu] = useState<Record<string, boolean>>({});

  const togglePhan = (id: string) =>
    setOpenPhan((p) => ({ ...p, [id]: p[id] === false ? true : !p[id] }));
  const toggleTaiLieu = (id: string) =>
    setOpenTaiLieu((p) => ({ ...p, [id]: !p[id] }));

  const isActive = (loai: LoaiNoiDung, item: any) => {
    if (!selected || selected.loai !== loai) return false;
    const key =
      loai === "baiGiang"
        ? "idBaiGiang"
        : loai === "taiLieu"
          ? "idTaiLieu"
          : "idBaiKiemTra";
    return (selected.item[key] ?? selected.item.id) === (item[key] ?? item.id);
  };

  const phans: any[] = detail?.phans ?? detail?.phanHocs ?? [];
  const flatBaiGiang: any[] =
    detail?.baiGiangs ?? detail?.baiGiangChoDuyet ?? [];
  const flatTaiLieu: any[] = detail?.taiLieus ?? detail?.taiLieuChoDuyet ?? [];
  const flatBaiKiemTra: any[] =
    detail?.baiKiemTras ?? detail?.baiKiemTraChoDuyet ?? [];

  const taiLieuOfBaiGiang = (bg: any) => {
    if (Array.isArray(bg.taiLieus) && bg.taiLieus.length > 0) {
      return bg.taiLieus;
    }
    return flatTaiLieu.filter((tl) => tl.idBaiGiang === bg.idBaiGiang);
  };

  const baiKiemTraOfPhan = (phan: any, phanId: any) => {
    if (Array.isArray(phan.baiKiemTras) && phan.baiKiemTras.length > 0) {
      return phan.baiKiemTras;
    }
    return flatBaiKiemTra.filter((bkt) => bkt.idPhan === phanId);
  };

  const filteredPhans = useMemo(() => {
    if (!searchTerm.trim()) return phans;
    const lower = searchTerm.toLowerCase();
    const match = (s?: string) => (s ?? "").toLowerCase().includes(lower);
    return phans
      .map((phan, idx) => {
        const id = phan.id ?? phan.idPhan ?? `phan-${idx}`;
        const baiGiangs = (
          Array.isArray(phan.baiGiangs)
            ? phan.baiGiangs
            : flatBaiGiang.filter((bg) => bg.idPhan === id)
        ).filter(
          (bg: any) =>
            match(bg.tenBaiGiang) ||
            match(bg.tieuDe) ||
            taiLieuOfBaiGiang(bg).some(
              (tl: any) => match(tl.tenTaiLieu) || match(tl.tieuDe),
            ),
        );
        const baiKiemTras = baiKiemTraOfPhan(phan, id).filter(
          (bkt: any) => match(bkt.tenBaiKiemTra) || match(bkt.tieuDe),
        );
        if (
          match(phan.tenPhan) ||
          baiGiangs.length > 0 ||
          baiKiemTras.length > 0
        ) {
          return { ...phan, baiGiangs, baiKiemTras };
        }
        return null;
      })
      .filter(Boolean) as any[];
  }, [phans, searchTerm, flatBaiGiang]);

  // Đếm số kết quả tìm kiếm
  const soKetQuaTimKiem = useMemo(() => {
    if (!searchTerm.trim()) return 0;
    let count = 0;
    filteredPhans.forEach((phan) => {
      count += (phan.baiGiangs ?? []).length;
      count += (phan.baiKiemTras ?? []).length;
    });
    return count;
  }, [filteredPhans, searchTerm]);

  const renderTaiLieu = (bg: any) => {
    const taiLieus = taiLieuOfBaiGiang(bg);
    if (taiLieus.length === 0) return null;
    const bgId = bg.idBaiGiang ?? bg.id;
    const open = openTaiLieu[bgId] ?? false;
    if (!open) return null;

    return (
      <Box sx={{ mt: 0.75, pl: 2, pr: 0.5, display: "flex", flexDirection: "column", gap: 0.75 }}>
        {taiLieus.map((tl: any, idx: number) => {
          const active = isActive("taiLieu", tl);
          const pending = isTrangThaiCho(tl.trangThaiPheDuyet);
          const isApproved = tl.trangThaiPheDuyet === "DaDuyet";

          return (
            <Box
              key={tl.idTaiLieu ?? tl.id ?? idx}
              onClick={(e) => {
                e.stopPropagation();
                onSelectContent("taiLieu", tl, bg);
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                p: "10px 12px",
                borderRadius: "12px",
                cursor: "pointer",
                bgcolor: active ? "#FFFFFF" : "#F8FAFC",
                border: active
                  ? `2px solid ${PRIMARY_RED}`
                  : "1px solid #E2E8F0",
                boxShadow: active
                  ? `0 2px 10px ${alpha(PRIMARY_RED, 0.1)}`
                  : "none",
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: active ? "#FFFFFF" : "#F1F5F9",
                },
              }}
            >
              <InsertDriveFileRoundedIcon
                sx={{
                  fontSize: 18,
                  color: active ? PRIMARY_RED : "#64748B",
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  flex: 1,
                  fontWeight: active ? 800 : 600,
                  fontSize: "12.5px",
                  color: active ? PRIMARY_RED : "#1E293B",
                }}
                noWrap
              >
                {tl.tenTaiLieu ?? tl.tieuDe}
              </Typography>

              {pending && (
                <Tooltip title="Chờ kiểm duyệt" arrow>
                  <HourglassTopRoundedIcon
                    sx={{ fontSize: 15, color: "#D97706", flexShrink: 0 }}
                  />
                </Tooltip>
              )}
              {isApproved && (
                <Tooltip title="Đã duyệt" arrow>
                  <CheckCircleRoundedIcon
                    sx={{ fontSize: 15, color: "#16A34A", flexShrink: 0 }}
                  />
                </Tooltip>
              )}
            </Box>
          );
        })}
      </Box>
    );
  };

  const renderBaiGiang = (bg: any, i: number) => {
    const active = isActive("baiGiang", bg);
    const pending = isTrangThaiCho(bg.trangThaiPheDuyet);
    const isApproved = bg.trangThaiPheDuyet === "DaDuyet";
    const bgId = bg.idBaiGiang ?? bg.id;
    const taiLieus = taiLieuOfBaiGiang(bg);
    const hasDocs = taiLieus.length > 0;
    const isDocOpen = openTaiLieu[bgId] || false;

    return (
      <Box key={bgId}>
        {/* Lecture Card */}
        <Box
          onClick={() => onSelectContent("baiGiang", bg)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: "12px 14px",
            borderRadius: "16px",
            cursor: "pointer",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            bgcolor: active ? "#FFFFFF" : "#F1F4F9",
            border: active
              ? `2px solid ${PRIMARY_RED}`
              : "1.5px solid transparent",
            boxShadow: active
              ? `0 4px 16px ${alpha(PRIMARY_RED, 0.12)}`
              : "none",
            "&:hover": {
              bgcolor: active ? "#FFFFFF" : "#E9EDF5",
              transform: "translateY(-1px)",
            },
          }}
        >
          {/* Left Rounded Square Icon Box */}
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              bgcolor: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              flexShrink: 0,
              color: active
                ? PRIMARY_RED
                : isApproved
                  ? "#16A34A"
                  : pending
                    ? "#D97706"
                    : "#1E293B",
              transition: "all 0.2s ease",
            }}
          >
            <PlayArrowRoundedIcon
              sx={{
                fontSize: 22,
                color: active ? PRIMARY_RED : "#1E293B",
              }}
            />
          </Box>

          {/* Title & Duration */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: active ? 800 : 700,
                fontSize: "13.5px",
                lineHeight: 1.35,
                color: active ? PRIMARY_RED : "#1E293B",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {i + 1}. {bg.tenBaiGiang ?? bg.tieuDe}
            </Typography>
            <Typography
              sx={{
                fontSize: "12px",
                color: "#64748B",
                fontWeight: 500,
                mt: 0.4,
              }}
            >
              {Math.floor((bg.thoiLuong ?? 0) / 60)} phút
              {(bg.thoiLuong ?? 0) % 60 > 0
                ? ` ${(bg.thoiLuong ?? 0) % 60}s`
                : ""}
            </Typography>
          </Box>

          {/* Right Icons: Documents & Status */}
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: "center", flexShrink: 0 }}
          >
            {hasDocs && (
              <Tooltip
                title={`${taiLieus.length} tài liệu đính kèm`}
                arrow
              >
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTaiLieu(bgId);
                  }}
                  sx={{
                    color: isDocOpen ? PRIMARY_RED : "#64748B",
                    p: 0.6,
                    bgcolor: isDocOpen
                      ? alpha(PRIMARY_RED, 0.08)
                      : "transparent",
                    "&:hover": {
                      color: PRIMARY_RED,
                      bgcolor: alpha(PRIMARY_RED, 0.08),
                    },
                  }}
                >
                  <FolderOpenOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}

            {pending && (
              <Tooltip title="Chờ kiểm duyệt" arrow>
                <HourglassTopRoundedIcon
                  sx={{ fontSize: 17, color: "#D97706" }}
                />
              </Tooltip>
            )}
            {isApproved && (
              <Tooltip title="Đã duyệt" arrow>
                <CheckCircleRoundedIcon
                  sx={{ fontSize: 17, color: "#16A34A" }}
                />
              </Tooltip>
            )}
          </Stack>
        </Box>

        {/* Attached Documents */}
        {renderTaiLieu(bg)}
      </Box>
    );
  };

  const renderBaiKiemTra = (bkt: any, qIdx: number, offsetIdx: number) => {
    const active = isActive("baiKiemTra", bkt);
    const pending = isTrangThaiCho(bkt.trangThaiPheDuyet);
    const isApproved = bkt.trangThaiPheDuyet === "DaDuyet";
    const bktId = bkt.idBaiKiemTra ?? bkt.id;
    const cauHois: any[] = bkt.cauHois ?? [];

    return (
      <Box
        key={bktId}
        onClick={() => onSelectContent("baiKiemTra", bkt)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: "12px 14px",
          borderRadius: "16px",
          cursor: "pointer",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          bgcolor: active ? "#FFFFFF" : "#F1F4F9",
          border: active
            ? `2px solid ${PRIMARY_RED}`
            : "1.5px solid transparent",
          boxShadow: active
            ? `0 4px 16px ${alpha(PRIMARY_RED, 0.12)}`
            : "none",
          "&:hover": {
            bgcolor: active ? "#FFFFFF" : "#E9EDF5",
            transform: "translateY(-1px)",
          },
        }}
      >
        {/* Left Rounded Square Quiz Icon */}
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            bgcolor: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            flexShrink: 0,
            color: active ? PRIMARY_RED : "#64748B",
          }}
        >
          <QuizRoundedIcon sx={{ fontSize: 22 }} />
        </Box>

        {/* Quiz Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: active ? 800 : 700,
              fontSize: "13.5px",
              lineHeight: 1.35,
              color: active ? PRIMARY_RED : "#1E293B",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {offsetIdx + qIdx + 1}. {bkt.tenBaiKiemTra ?? bkt.tieuDe ?? "Bài kiểm tra"}
          </Typography>
          <Typography
            sx={{
              fontSize: "12px",
              color: "#64748B",
              fontWeight: 500,
              mt: 0.4,
            }}
          >
            {cauHois.length > 0 ? cauHois.length : bkt.soCauHoi ?? 0} câu hỏi
            {bkt.gioiHanThoiGian ? `  •  ${bkt.gioiHanThoiGian} phút` : ""}
          </Typography>
        </Box>

        {/* Status */}
        {pending && (
          <Tooltip title="Chờ kiểm duyệt" arrow>
            <HourglassTopRoundedIcon
              sx={{ fontSize: 17, color: "#D97706", flexShrink: 0 }}
            />
          </Tooltip>
        )}
        {isApproved && (
          <Tooltip title="Đã duyệt" arrow>
            <CheckCircleRoundedIcon
              sx={{ fontSize: 17, color: "#16A34A", flexShrink: 0 }}
            />
          </Tooltip>
        )}
      </Box>
    );
  };

  const noiDungRong =
    phans.length === 0 &&
    flatBaiGiang.length === 0 &&
    flatTaiLieu.length === 0 &&
    flatBaiKiemTra.length === 0;

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        bgcolor: "#FFFFFF",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.25,
          pb: 1.5,
          bgcolor: "#FFFFFF",
          flexShrink: 0,
        }}
      >
        {/* Section Title & Mobile Close */}
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.75,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: "#1E293B",
              fontSize: "19px",
              letterSpacing: "-0.2px",
            }}
          >
            Nội dung khóa học
          </Typography>
          {isMobile && onCloseMobile && (
            <IconButton size="small" onClick={onCloseMobile}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
        </Stack>

        {/* Search input */}
        <Box sx={{ mb: 0.5 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm bài giảng, tài liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "40px",
                borderRadius: "14px",
                bgcolor: "#F1F4F9",
                border: "1px solid transparent",
                transition: "all 0.2s ease",
                "& fieldset": { border: "none" },
                "&:hover": {
                  bgcolor: "#E9EDF5",
                },
                "&.Mui-focused": {
                  borderColor: PRIMARY_RED,
                  bgcolor: "#FFFFFF",
                  boxShadow: `0 0 0 3px ${alpha(PRIMARY_RED, 0.1)}`,
                },
              },
              "& .MuiInputBase-input": {
                fontSize: "13.5px",
                color: "#1E293B",
                padding: "8px 12px",
                "&::placeholder": {
                  color: "#94A3B8",
                  fontWeight: 500,
                },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start" sx={{ ml: 0.5 }}>
                    <SearchIcon
                      sx={{
                        fontSize: 18,
                        color: "#94A3B8",
                      }}
                    />
                  </InputAdornment>
                ),
                endAdornment: searchTerm ? (
                  <InputAdornment position="end" sx={{ gap: 0.5 }}>
                    <Chip
                      label={`${soKetQuaTimKiem} kết quả`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "10px",
                        fontWeight: 700,
                        bgcolor: alpha(PRIMARY_RED, 0.08),
                        color: PRIMARY_RED,
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm("")}
                      sx={{ p: 0.5 }}
                    >
                      <CloseIcon
                        sx={{
                          fontSize: 16,
                          color: "#94A3B8",
                        }}
                      />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />
        </Box>
      </Box>

      {/* Curriculum Sections List - Scrollable */}
      <Box
        sx={{
          overflowY: "auto",
          flex: 1,
          px: 2,
          pb: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "#CBD5E1",
            borderRadius: 3,
          },
        }}
      >
        {noiDungRong ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <FolderRoundedIcon sx={{ fontSize: 40, color: "#CBD5E1", mb: 1 }} />
            <Typography sx={{ color: "#94A3B8", fontSize: 13, fontWeight: 500 }}>
              Khóa học chưa có nội dung bài giảng.
            </Typography>
          </Box>
        ) : filteredPhans.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography sx={{ color: "#94A3B8", fontSize: 13, fontWeight: 500 }}>
              Không tìm thấy nội dung phù hợp với &quot;{searchTerm}&quot;.
            </Typography>
          </Box>
        ) : (
          filteredPhans.map((phan: any, idx: number) => {
            const phanId = phan.id ?? phan.idPhan ?? `phan-${idx}`;
            const isOpen = openPhan[phanId] !== false; // Mặc định mở
            const bgs =
              phan.baiGiangs ??
              flatBaiGiang.filter((b) => b.idPhan === phanId);
            const bkts = baiKiemTraOfPhan(phan, phanId);
            const totalItems = bgs.length + bkts.length;
            const pendingCount =
              bgs.filter((b: any) => isTrangThaiCho(b.trangThaiPheDuyet)).length +
              bkts.filter((b: any) => isTrangThaiCho(b.trangThaiPheDuyet)).length;
            const isSectionDone = totalItems > 0 && pendingCount === 0;

            const totalMin = Math.floor(
              bgs.reduce((s: number, b: any) => s + (b.thoiLuong ?? 0), 0) / 60,
            );

            return (
              <Box key={phanId} sx={{ mb: 0.5 }}>
                {/* Section Accordion Header */}
                <Box
                  onClick={() => togglePhan(phanId)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1.25,
                    borderRadius: "16px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "#F8FAFC",
                    },
                  }}
                >
                  {/* Circular Section Progress Badge */}
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: isSectionDone
                        ? "2px solid #16A34A"
                        : pendingCount > 0
                          ? "2px solid #FDE68A"
                          : "2px solid #E2E8F0",
                      bgcolor: isSectionDone
                        ? "#F0FDF4"
                        : pendingCount > 0
                          ? "#FFFBEB"
                          : "#FFFFFF",
                      color: isSectionDone
                        ? "#16A34A"
                        : pendingCount > 0
                          ? "#D97706"
                          : "#475569",
                      fontWeight: 800,
                      fontSize: "12.5px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isSectionDone ? (
                      <CheckCircleRoundedIcon sx={{ fontSize: 20 }} />
                    ) : (
                      String(idx + 1).padStart(2, "0")
                    )}
                  </Box>

                  {/* Section Title & Metadata */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "11.5px",
                        fontWeight: 700,
                        color: "#64748B",
                        textTransform: "none",
                        lineHeight: 1.2,
                        mb: 0.3,
                      }}
                    >
                      Phần {idx + 1}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: "14.5px",
                        color: "#1E293B",
                        lineHeight: 1.3,
                      }}
                      noWrap
                    >
                      {phan.tenPhan || `Phần ${idx + 1}`}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        fontWeight: 500,
                        color: pendingCount > 0 ? "#D97706" : "#64748B",
                        mt: 0.3,
                      }}
                    >
                      {totalItems} mục  •  {totalMin > 0 ? `${totalMin} phút` : "Chưa có video"}
                      {pendingCount > 0 && `  •  ${pendingCount} chờ duyệt`}
                    </Typography>
                  </Box>

                  {/* Chevron Expand/Collapse */}
                  <IconButton
                    size="small"
                    sx={{
                      color: "#64748B",
                      p: 0.5,
                      "&:hover": { color: "#1E293B" },
                    }}
                  >
                    {isOpen ? (
                      <KeyboardArrowUpRoundedIcon sx={{ fontSize: 22 }} />
                    ) : (
                      <KeyboardArrowDownRoundedIcon sx={{ fontSize: 22 }} />
                    )}
                  </IconButton>
                </Box>

                {/* Section Content (Lectures & Quizzes) */}
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.25,
                      pt: 1.25,
                      pl: 0.5,
                    }}
                  >
                    {bgs.length === 0 && bkts.length === 0 ? (
                      <Typography
                        sx={{
                          color: "#94A3B8",
                          fontSize: 12,
                          textAlign: "center",
                          py: 1.5,
                        }}
                      >
                        Chưa có nội dung trong phần này
                      </Typography>
                    ) : (
                      <>
                        {bgs.map((bg: any, i: number) => renderBaiGiang(bg, i))}
                        {bkts.map((bkt: any, qIdx: number) =>
                          renderBaiKiemTra(bkt, qIdx, bgs.length),
                        )}
                      </>
                    )}
                  </Box>
                </Collapse>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}
