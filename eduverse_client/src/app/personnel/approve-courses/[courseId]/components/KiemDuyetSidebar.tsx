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
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import QuizIcon from "@mui/icons-material/Quiz";
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

// Sắp xếp: mục đang chờ duyệt lên đầu
const sortPending = (arr: any[]) =>
  [...arr].sort((x, y) => {
    const px = isTrangThaiCho(x.trangThaiPheDuyet) ? 0 : 1;
    const py = isTrangThaiCho(y.trangThaiPheDuyet) ? 0 : 1;
    return px - py;
  });

const dem = (arr: any[]) =>
  arr.filter((x) => isTrangThaiCho(x.trangThaiPheDuyet)).length;

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

  // Dữ liệu: API thật trả về "phans" chứa sẵn baiGiangs/baiKiemTras bên trong
  const phans: any[] = detail?.phans ?? detail?.phanHocs ?? [];
  const flatBaiGiang: any[] =
    detail?.baiGiangs ?? detail?.baiGiangChoDuyet ?? [];
  const flatTaiLieu: any[] = detail?.taiLieus ?? detail?.taiLieuChoDuyet ?? [];
  const flatBaiKiemTra: any[] =
    detail?.baiKiemTras ?? detail?.baiKiemTraChoDuyet ?? [];

  // Bỏ qua trạng thái của tài liệu, chỉ lấy tất cả
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

  // Lọc theo search (khớp tên phần / bài giảng / tài liệu / bài kiểm tra)
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
      <Box>
        <ListItemButton
          onClick={() => toggleTaiLieu(bgId)}
          sx={{
            pl: 7,
            pr: 2.5,
            py: 0.5,
            color: CSSVAR.textSecondary,
            "&:hover": { bgcolor: "transparent", color: COLORS.primary },
          }}
        >
          <AttachFileIcon sx={{ fontSize: 14, mr: 0.75 }} />
          <Typography
            variant="caption"
            sx={{ flex: 1, fontWeight: 700, fontSize: 12 }}
          >
            {taiLieus.length} tài liệu
          </Typography>
          {open ? (
            <ExpandLessIcon sx={{ fontSize: 14 }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: 14 }} />
          )}
        </ListItemButton>
        <Collapse in={open}>
          <Stack sx={{ pl: 7, pr: 2, pb: 1, gap: 0.75, mt: 0.5 }}>
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
                    px: 1.5,
                    py: 0.75,
                    borderRadius: "6px",
                    cursor: "pointer",
                    border: `1px solid ${active ? COLORS.primary : "${CSSVAR.divider}"}`,
                    bgcolor: active ? "rgba(139, 19, 19, 0.05)" : "transparent",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      bgcolor: active
                        ? "rgba(139, 19, 19, 0.08)"
                        : "var(--ev-hover, rgba(24, 18, 20, 0.04))",
                    },
                  }}
                >
                  <AttachFileIcon
                    sx={{
                      fontSize: 14,
                      color: active
                        ? COLORS.primary
                        : CSSVAR.textMuted,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      flex: 1,
                      fontWeight: active ? 700 : 500,
                      fontSize: 12.5,
                      color: active
                        ? COLORS.primary
                        : CSSVAR.textPrimary,
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
    const bgId = bg.idBaiGiang ?? bg.id;
    return (
      <Box key={bgId}>
        <ListItemButton
          selected={active}
          onClick={() => onSelectContent("baiGiang", bg)}
          sx={{
            pl: 2,
            pr: 2,
            py: 1.1,
            borderLeft: `3px solid ${active ? COLORS.primary : pending ? alpha(COLORS.gold, 0.45) : "transparent"}`,
            bgcolor: active
              ? `${alpha(COLORS.primary, 0.06)} !important`
              : pending
                ? alpha(COLORS.gold, 0.025)
                : "transparent",
            mb: 0.5,
            mx: 1.5,
            borderRadius: "8px",
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor: active
                ? "rgba(139, 19, 19, 0.08) !important"
                : "var(--ev-hover, rgba(24, 18, 20, 0.04))",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 28 }}>
            <PlayArrowIcon
              sx={{
                color: active
                  ? COLORS.primary
                  : pending
                    ? COLORS.gold
                    : CSSVAR.textMuted,
                fontSize: 18,
              }}
            />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography
                variant="body2"
                sx={{
                  fontWeight: active ? 700 : pending ? 600 : 500,
                  fontSize: 13.5,
                  lineHeight: 1.4,
                  color: active
                    ? COLORS.primary
                    : CSSVAR.textPrimary,
                }}
                noWrap
              >
                {bg.tenBaiGiang ?? bg.tieuDe}
              </Typography>
            }
          />
        </ListItemButton>
        {renderTaiLieu(bg)}
      </Box>
    );
  };

  // Đã bỏ phần xổ xuống (danh sách câu hỏi) của bài kiểm tra —
  // giờ đây bài kiểm tra chỉ là một mục có thể click để chọn, không mở rộng nữa.
  const renderBaiKiemTra = (bkt: any) => {
    const active = isActive("baiKiemTra", bkt);
    const pending = isTrangThaiCho(bkt.trangThaiPheDuyet);
    const bktId = bkt.idBaiKiemTra ?? bkt.id;
    const cauHois: any[] = bkt.cauHois ?? [];
    return (
      <Box key={bktId}>
        <ListItemButton
          selected={active}
          onClick={() => onSelectContent("baiKiemTra", bkt)}
          sx={{
            pl: 2,
            pr: 2,
            py: 1.1,
            borderLeft: `3px solid ${active ? COLORS.primary : pending ? alpha(COLORS.gold, 0.45) : "transparent"}`,
            bgcolor: active
              ? `${alpha(COLORS.primary, 0.06)} !important`
              : pending
                ? alpha(COLORS.gold, 0.025)
                : "transparent",
            mb: 0.5,
            mx: 1.5,
            borderRadius: "8px",
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor: active
                ? "rgba(139, 19, 19, 0.08) !important"
                : "var(--ev-hover, rgba(24, 18, 20, 0.04))",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 28 }}>
            <QuizIcon
              sx={{
                color: active
                  ? COLORS.primary
                  : pending
                    ? COLORS.gold
                    : CSSVAR.textMuted,
                fontSize: 18,
              }}
            />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography
                variant="body2"
                sx={{
                  fontWeight: active ? 700 : pending ? 600 : 500,
                  fontSize: 13.5,
                  lineHeight: 1.4,
                  color: active
                    ? COLORS.primary
                    : CSSVAR.textPrimary,
                }}
                noWrap
              >
                {bkt.tenBaiKiemTra ?? bkt.tieuDe}
              </Typography>
            }
            secondary={
              cauHois.length > 0 ? (
                <Typography
                  variant="caption"
                  sx={{ color: CSSVAR.textMuted, fontSize: 11 }}
                >
                  {cauHois.length} câu hỏi
                </Typography>
              ) : undefined
            }
          />
        </ListItemButton>
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
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: `1px solid ${CSSVAR.divider}`,
          bgcolor: CSSVAR.paperAlt,
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
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: CSSVAR.textMuted,
              fontFamily: FONTS.body,
            }}
          >
            Nội dung khóa học
          </Typography>
          {isMobile && onCloseMobile && (
            <IconButton size="small" onClick={onCloseMobile}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>

        <TextField
          size="small"
          fullWidth
          placeholder="Tìm bài giảng, tài liệu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            bgcolor: CSSVAR.paper,
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              fontSize: 13,
              "& fieldset": { borderColor: CSSVAR.divider },
              "&:hover fieldset": { borderColor: "rgba(139,19,19,0.3)" },
              "&.Mui-focused fieldset": {
                borderColor: BRAND.main,
                borderWidth: 1.5,
              },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    sx={{
                      fontSize: 18,
                      color: CSSVAR.textMuted,
                    }}
                  />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
        />
      </Box>

      {/* Danh sách */}
      <Box sx={{ overflowY: "auto", flex: 1, pb: 2 }}>
        {noiDungRong ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: COLORS.inkSoft }}>
              Khóa học chưa có nội dung.
            </Typography>
          </Box>
        ) : phans.length > 0 ? (
          <>
            {filteredPhans.map((phan: any, phanIndex: number) => {
              const id = phan.id ?? phan.idPhan ?? `phan-${phanIndex}`;
              const baiGiangs = Array.isArray(phan.baiGiangs)
                ? phan.baiGiangs
                : [];
              const baiKiemTras = Array.isArray(phan.baiKiemTras)
                ? phan.baiKiemTras
                : [];
              const soCho = dem(baiGiangs) + dem(baiKiemTras);
              const isOpen = openPhan[id] !== false;

              return (
                <Box
                  key={id}
                  sx={{ borderBottom: `1px solid ${CSSVAR.divider}` }}
                >
                  <ListItemButton
                    onClick={() => togglePhan(id)}
                    sx={{
                      bgcolor:
                        soCho > 0 ? "rgba(245, 158, 11, 0.02)" : "transparent",
                      borderLeft: `3px solid ${soCho > 0 ? alpha(COLORS.gold, 0.45) : "transparent"}`,
                      py: 1.75,
                      px: 2.5,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "var(--ev-hover, rgba(24, 18, 20, 0.04))",
                      },
                    }}
                  >
                    <FolderRoundedIcon
                      sx={{ color: COLORS.gold, fontSize: 20, mr: 1.5 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 800,
                          fontSize: 13.5,
                          color: CSSVAR.textPrimary,
                          fontFamily: FONTS.body,
                        }}
                        noWrap
                      >
                        {phanIndex + 1}. {phan.tenPhan}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: CSSVAR.textMuted,
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      >
                        {baiGiangs.length + baiKiemTras.length} mục
                        {soCho > 0 ? ` · ${soCho} chờ duyệt` : ""}
                      </Typography>
                    </Box>
                    {isOpen ? (
                      <ExpandLessIcon
                        sx={{
                          fontSize: 20,
                          color: CSSVAR.textMuted,
                        }}
                      />
                    ) : (
                      <ExpandMoreIcon
                        sx={{
                          fontSize: 20,
                          color: CSSVAR.textMuted,
                        }}
                      />
                    )}
                  </ListItemButton>
                  <Collapse in={isOpen}>
                    <List disablePadding sx={{ py: 1.5 }}>
                      {baiGiangs.map((bg: any) => renderBaiGiang(bg))}
                      {baiKiemTras.map((bkt: any) => renderBaiKiemTra(bkt))}
                    </List>
                  </Collapse>
                </Box>
              );
            })}
            {filteredPhans.length === 0 && (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: COLORS.inkSoft }}>
                  Không tìm thấy nội dung phù hợp.
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <List disablePadding>
            {flatBaiGiang.map((bg: any) => renderBaiGiang(bg))}
            {flatBaiKiemTra.map((bkt: any) => renderBaiKiemTra(bkt))}
          </List>
        )}
      </Box>
    </Box>
  );
}
