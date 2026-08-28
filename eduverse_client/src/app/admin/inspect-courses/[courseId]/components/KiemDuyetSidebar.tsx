/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { BRAND, CSSVAR } from "@/src/theme/tokens";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import {
  COLORS,
  FONTS,
  isTrangThaiCho,
} from "@/src/app/admin/approve-courses/types/constants";

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

  // Tổng số mục & số mục chờ duyệt
  const totalLessons = flatBaiGiang.length + flatBaiKiemTra.length;
  const pendingLessons =
    flatBaiGiang.filter((b) => isTrangThaiCho(b.trangThaiPheDuyet)).length +
    flatBaiKiemTra.filter((b) => isTrangThaiCho(b.trangThaiPheDuyet)).length;

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

  const renderTaiLieu = (bg: any) => {
    const taiLieus = taiLieuOfBaiGiang(bg);
    if (taiLieus.length === 0) return null;
    const bgId = bg.idBaiGiang ?? bg.id;
    const open = openTaiLieu[bgId] ?? false;

    return (
      <Box sx={{ mb: 0.5 }}>
        <Box
          onClick={() => toggleTaiLieu(bgId)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            ml: 4.5,
            mr: 1.5,
            px: 1.25,
            py: 0.6,
            borderRadius: "8px",
            color: "#64748B",
            cursor: "pointer",
            transition: "all 0.15s ease",
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.03)",
              color: BRAND.main,
            },
          }}
        >
          <InsertDriveFileRoundedIcon sx={{ fontSize: 14 }} />
          <Typography
            sx={{ flex: 1, fontWeight: 700, fontSize: 11.5, lineHeight: 1 }}
          >
            {taiLieus.length} tài liệu đính kèm
          </Typography>
          <KeyboardArrowDownRoundedIcon
            sx={{
              fontSize: 16,
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
        </Box>

        <Collapse in={open}>
          <Stack sx={{ ml: 5, mr: 1.5, my: 0.5, gap: 0.5 }}>
            {taiLieus.map((tl: any, idx: number) => {
              const active = isActive("taiLieu", tl);
              return (
                <Box
                  key={tl.idTaiLieu ?? tl.id ?? idx}
                  onClick={() => onSelectContent("taiLieu", tl, bg)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.25,
                    py: 0.75,
                    borderRadius: "8px",
                    cursor: "pointer",
                    border: `1px solid ${active ? alpha(BRAND.main, 0.3) : "transparent"}`,
                    bgcolor: active ? alpha(BRAND.main, 0.06) : "transparent",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      bgcolor: active
                        ? alpha(BRAND.main, 0.09)
                        : "rgba(0, 0, 0, 0.03)",
                    },
                  }}
                >
                  <InsertDriveFileRoundedIcon
                    sx={{
                      fontSize: 14,
                      color: active ? BRAND.main : "#94A3B8",
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      flex: 1,
                      fontWeight: active ? 700 : 500,
                      fontSize: 12,
                      color: active ? BRAND.main : "#334155",
                    }}
                    noWrap
                  >
                    {tl.tenTaiLieu ?? tl.tieuDe}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Collapse>
      </Box>
    );
  };

  const renderBaiGiang = (bg: any) => {
    const active = isActive("baiGiang", bg);
    const pending = isTrangThaiCho(bg.trangThaiPheDuyet);
    const isApproved = bg.trangThaiPheDuyet === "DaDuyet";
    const bgId = bg.idBaiGiang ?? bg.id;

    return (
      <Box key={bgId} sx={{ mb: 0.5 }}>
        <Box
          onClick={() => onSelectContent("baiGiang", bg)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            px: 1.5,
            py: 1.1,
            mx: 1.25,
            borderRadius: "10px",
            cursor: "pointer",
            borderLeft: `3.5px solid ${
              active
                ? BRAND.main
                : pending
                  ? "#F59E0B"
                  : isApproved
                    ? "#10B981"
                    : "transparent"
            }`,
            bgcolor: active
              ? alpha(BRAND.main, 0.06)
              : pending
                ? "rgba(245, 158, 11, 0.03)"
                : "transparent",
            transition: "all 0.15s ease",
            "&:hover": {
              bgcolor: active
                ? alpha(BRAND.main, 0.09)
                : "rgba(0, 0, 0, 0.03)",
              transform: "translateX(2px)",
            },
          }}
        >
          <Box
            sx={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              bgcolor: active
                ? alpha(BRAND.main, 0.12)
                : pending
                  ? "rgba(245, 158, 11, 0.12)"
                  : "#F1F5F9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <PlayCircleFilledRoundedIcon
              sx={{
                fontSize: 16,
                color: active
                  ? BRAND.main
                  : pending
                    ? "#D97706"
                    : "#64748B",
              }}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: active ? 800 : pending ? 700 : 500,
                fontSize: 13,
                lineHeight: 1.35,
                color: active ? BRAND.main : "#1E293B",
              }}
              noWrap
            >
              {bg.tenBaiGiang ?? bg.tieuDe}
            </Typography>
          </Box>

          {pending && (
            <Tooltip title="Chờ kiểm duyệt">
              <HourglassTopRoundedIcon
                sx={{ fontSize: 14, color: "#D97706", flexShrink: 0 }}
              />
            </Tooltip>
          )}
          {isApproved && (
            <Tooltip title="Đã duyệt">
              <CheckCircleRoundedIcon
                sx={{ fontSize: 14, color: "#16A34A", flexShrink: 0 }}
              />
            </Tooltip>
          )}
        </Box>
        {renderTaiLieu(bg)}
      </Box>
    );
  };

  const renderBaiKiemTra = (bkt: any) => {
    const active = isActive("baiKiemTra", bkt);
    const pending = isTrangThaiCho(bkt.trangThaiPheDuyet);
    const isApproved = bkt.trangThaiPheDuyet === "DaDuyet";
    const bktId = bkt.idBaiKiemTra ?? bkt.id;
    const cauHois: any[] = bkt.cauHois ?? [];

    return (
      <Box key={bktId} sx={{ mb: 0.5 }}>
        <Box
          onClick={() => onSelectContent("baiKiemTra", bkt)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            px: 1.5,
            py: 1.1,
            mx: 1.25,
            borderRadius: "10px",
            cursor: "pointer",
            borderLeft: `3.5px solid ${
              active
                ? BRAND.main
                : pending
                  ? "#F59E0B"
                  : isApproved
                    ? "#10B981"
                    : "transparent"
            }`,
            bgcolor: active
              ? alpha(BRAND.main, 0.06)
              : pending
                ? "rgba(245, 158, 11, 0.03)"
                : "transparent",
            transition: "all 0.15s ease",
            "&:hover": {
              bgcolor: active
                ? alpha(BRAND.main, 0.09)
                : "rgba(0, 0, 0, 0.03)",
              transform: "translateX(2px)",
            },
          }}
        >
          <Box
            sx={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              bgcolor: active
                ? alpha(BRAND.main, 0.12)
                : pending
                  ? "rgba(245, 158, 11, 0.12)"
                  : "#F1F5F9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <QuizRoundedIcon
              sx={{
                fontSize: 15,
                color: active
                  ? BRAND.main
                  : pending
                    ? "#D97706"
                    : "#64748B",
              }}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: active ? 800 : pending ? 700 : 500,
                fontSize: 13,
                lineHeight: 1.35,
                color: active ? BRAND.main : "#1E293B",
              }}
              noWrap
            >
              {bkt.tenBaiKiemTra ?? bkt.tieuDe}
            </Typography>
            {cauHois.length > 0 && (
              <Typography
                sx={{ color: "#94A3B8", fontSize: 11, fontWeight: 500 }}
              >
                {cauHois.length} câu hỏi
              </Typography>
            )}
          </Box>

          {pending && (
            <Tooltip title="Chờ kiểm duyệt">
              <HourglassTopRoundedIcon
                sx={{ fontSize: 14, color: "#D97706", flexShrink: 0 }}
              />
            </Tooltip>
          )}
          {isApproved && (
            <Tooltip title="Đã duyệt">
              <CheckCircleRoundedIcon
                sx={{ fontSize: 14, color: "#16A34A", flexShrink: 0 }}
              />
            </Tooltip>
          )}
        </Box>
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
          borderBottom: "1px solid #F1F5F9",
          bgcolor: "#FFFFFF",
          flexShrink: 0,
        }}
      >
        <Stack
          direction="row"
          sx={{
            mb: 1.5,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#475569",
                fontFamily: FONTS.display,
              }}
            >
              Nội dung khóa học
            </Typography>
            {totalLessons > 0 && (
              <Box
                sx={{
                  px: 0.9,
                  py: 0.2,
                  borderRadius: "999px",
                  bgcolor: "#F1F5F9",
                  color: "#64748B",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {totalLessons} bài
              </Box>
            )}
          </Stack>

          {pendingLessons > 0 && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1,
                py: 0.25,
                borderRadius: "999px",
                bgcolor: "#FFFBEB",
                border: "1px solid #FDE68A",
                color: "#D97706",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <HourglassTopRoundedIcon sx={{ fontSize: 11 }} />
              {pendingLessons} chờ duyệt
            </Box>
          )}

          {isMobile && onCloseMobile && (
            <IconButton size="small" onClick={onCloseMobile}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>

        <TextField
          fullWidth
          placeholder="Tìm bài giảng, tài liệu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            bgcolor: "#F8FAFC",
            "& .MuiOutlinedInput-root": {
              height: 44,
              borderRadius: "12px",
              fontSize: 13.5,
              fontWeight: 500,
              bgcolor: "#F8FAFC",
              transition: "all 0.15s ease",
              "& fieldset": { borderColor: "#E2E8F0" },
              "&:hover fieldset": { borderColor: alpha(BRAND.main, 0.4) },
              "&.Mui-focused": {
                bgcolor: "#FFFFFF",
                boxShadow: `0 0 0 3px ${alpha(BRAND.main, 0.08)}`,
              },
              "&.Mui-focused fieldset": {
                borderColor: BRAND.main,
                borderWidth: 1.5,
              },
            },
            "& .MuiOutlinedInput-input": {
              py: 0,
              height: "100%",
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 1 }}>
                  <SearchIcon sx={{ fontSize: 20, color: "#64748B" }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm("")}
                    sx={{
                      p: 0.5,
                      color: "#94A3B8",
                      "&:hover": { color: "#334155" },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />
      </Box>

      {/* Danh sách chương & bài */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          p: 1.25,
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            background: alpha(BRAND.main, 0.2),
            borderRadius: 8,
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
            const totalPhanItems = bgs.length + bkts.length;
            const pendingPhanItems =
              bgs.filter((b: any) => isTrangThaiCho(b.trangThaiPheDuyet)).length +
              bkts.filter((b: any) => isTrangThaiCho(b.trangThaiPheDuyet)).length;

            return (
              <Box
                key={phanId}
                sx={{
                  mb: 1.5,
                  borderRadius: "14px",
                  border: "1px solid #F1F5F9",
                  bgcolor: "#FFFFFF",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                }}
              >
                {/* Header phần */}
                <Box
                  onClick={() => togglePhan(phanId)}
                  sx={{
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    cursor: "pointer",
                    bgcolor: isOpen ? "#F8FAFC" : "#FFFFFF",
                    borderBottom: isOpen ? "1px solid #F1F5F9" : "none",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      bgcolor: "#F1F5F9",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "8px",
                      bgcolor: "#FEF2F2",
                      color: BRAND.main,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: 13.5,
                        color: "#0F172A",
                        lineHeight: 1.3,
                      }}
                      noWrap
                    >
                      {phan.tenPhan || `Phần ${idx + 1}`}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center", mt: 0.3 }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: "#64748B", fontSize: 11.5, fontWeight: 500 }}
                      >
                        {totalPhanItems} mục
                      </Typography>
                      {pendingPhanItems > 0 && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#D97706",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          · {pendingPhanItems} chờ duyệt
                        </Typography>
                      )}
                    </Stack>
                  </Box>

                  <KeyboardArrowDownRoundedIcon
                    sx={{
                      fontSize: 20,
                      color: "#94A3B8",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                </Box>

                {/* Danh sách bài giảng & bài kiểm tra */}
                <Collapse in={isOpen}>
                  <Box sx={{ py: 1 }}>
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
                        {bgs.map((bg: any) => renderBaiGiang(bg))}
                        {bkts.map((bkt: any) => renderBaiKiemTra(bkt))}
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
