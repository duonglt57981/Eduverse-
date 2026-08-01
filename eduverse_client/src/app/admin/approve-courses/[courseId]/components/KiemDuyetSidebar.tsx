/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
  Chip,
  alpha,
  LinearProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import QuizIcon from "@mui/icons-material/Quiz";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import {
  COLORS,
  FONTS,
  isTrangThaiCho,
} from "@/src/app/admin/approve-courses/types/constants";
import StatusChip from "./StatusChip";

type LoaiNoiDung = "baiGiang" | "taiLieu" | "baiKiemTra";

interface SelectedContent {
  loai: LoaiNoiDung;
  item: any;
}

interface KiemDuyetSidebarProps {
  detail: any;
  selected: SelectedContent | null;
  onSelectContent: (loai: LoaiNoiDung, item: any) => void;
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
  const [openBaiKiemTra, setOpenBaiKiemTra] = useState<Record<string, boolean>>(
    {},
  );

  const togglePhan = (id: string) =>
    setOpenPhan((p) => ({ ...p, [id]: p[id] === false ? true : !p[id] }));
  const toggleTaiLieu = (id: string) =>
    setOpenTaiLieu((p) => ({ ...p, [id]: !p[id] }));
  const toggleBaiKiemTra = (id: string) =>
    setOpenBaiKiemTra((p) => ({ ...p, [id]: !p[id] }));

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

  const taiLieuOfBaiGiang = (bg: any) => {
    if (Array.isArray(bg.taiLieus) && bg.taiLieus.length > 0)
      return sortPending(bg.taiLieus);
    return sortPending(
      flatTaiLieu.filter((tl) => tl.idBaiGiang === bg.idBaiGiang),
    );
  };

  const baiKiemTraOfPhan = (phan: any, phanId: any) => {
    if (Array.isArray(phan.baiKiemTras) && phan.baiKiemTras.length > 0)
      return sortPending(phan.baiKiemTras);
    return sortPending(flatBaiKiemTra.filter((bkt) => bkt.idPhan === phanId));
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

  // Thống kê tổng số mục chờ duyệt (bài giảng + tài liệu + bài kiểm tra)
  const { tongSo, tongSoCho } = useMemo(() => {
    let tong = 0;
    let cho = 0;
    const countBg = (bg: any) => {
      tong += 1;
      if (isTrangThaiCho(bg.trangThaiPheDuyet)) cho += 1;
      taiLieuOfBaiGiang(bg).forEach((tl: any) => {
        tong += 1;
        if (isTrangThaiCho(tl.trangThaiPheDuyet)) cho += 1;
      });
    };
    if (phans.length > 0) {
      phans.forEach((phan: any, idx: number) => {
        const id = phan.id ?? phan.idPhan ?? `phan-${idx}`;
        const baiGiangs = Array.isArray(phan.baiGiangs)
          ? phan.baiGiangs
          : flatBaiGiang.filter((bg) => bg.idPhan === id);
        baiGiangs.forEach(countBg);
        baiKiemTraOfPhan(phan, id).forEach((bkt: any) => {
          tong += 1;
          if (isTrangThaiCho(bkt.trangThaiPheDuyet)) cho += 1;
        });
      });
    } else {
      flatBaiGiang.forEach(countBg);
      flatBaiKiemTra.forEach((bkt: any) => {
        tong += 1;
        if (isTrangThaiCho(bkt.trangThaiPheDuyet)) cho += 1;
      });
    }
    return { tongSo: tong, tongSoCho: cho };
  }, [phans, flatBaiGiang, flatBaiKiemTra]);

  const phanTram =
    tongSo > 0 ? Math.round(((tongSo - tongSoCho) / tongSo) * 100) : 100;

  const renderTaiLieu = (bg: any) => {
    const taiLieus = taiLieuOfBaiGiang(bg);
    if (taiLieus.length === 0) return null;
    const bgId = bg.idBaiGiang ?? bg.id;
    const open = openTaiLieu[bgId] ?? false;
    const soCho = dem(taiLieus);
    return (
      <Box sx={{ borderTop: `1px solid ${COLORS.line}` }}>
        <ListItemButton
          onClick={() => toggleTaiLieu(bgId)}
          sx={{ pl: 4, py: 0.75 }}
        >
          <AttachFileIcon
            sx={{ fontSize: 14, color: COLORS.primary, mr: 0.75 }}
          />
          <Typography
            variant="caption"
            sx={{ flex: 1, fontWeight: 500, color: COLORS.inkSoft }}
          >
            {taiLieus.length} tài liệu
          </Typography>
          {soCho > 0 && (
            <Chip
              label={`${soCho} chờ duyệt`}
              size="small"
              sx={{
                height: 18,
                fontSize: 10,
                fontWeight: 700,
                bgcolor: COLORS.gold,
                color: "#fff",
                mr: 0.5,
              }}
            />
          )}
          {open ? (
            <ExpandLessIcon sx={{ fontSize: 16 }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: 16 }} />
          )}
        </ListItemButton>
        <Collapse in={open}>
          <Stack sx={{ pl: 4, pr: 1.5, pb: 1, gap: 0.5 }}>
            {taiLieus.map((tl: any, idx: number) => {
              const active = isActive("taiLieu", tl);
              const pending = isTrangThaiCho(tl.trangThaiPheDuyet);
              return (
                <Box
                  key={tl.idTaiLieu ?? tl.id ?? idx}
                  onClick={() => onSelectContent("taiLieu", tl)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    cursor: "pointer",
                    border: `1px solid ${active ? COLORS.primary : pending ? COLORS.gold : COLORS.line}`,
                    bgcolor: active
                      ? alpha(COLORS.primary, 0.08)
                      : pending
                        ? COLORS.goldSoft
                        : "transparent",
                  }}
                >
                  <AttachFileIcon
                    sx={{
                      fontSize: 14,
                      color: pending ? COLORS.gold : COLORS.primary,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      flex: 1,
                      fontWeight: active || pending ? 600 : 400,
                      color: COLORS.ink,
                    }}
                    noWrap
                  >
                    {tl.tenTaiLieu ?? tl.tieuDe}
                  </Typography>
                  <StatusChip trangThai={tl.trangThaiPheDuyet} size="small" />
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
            pl: 3.5,
            pr: 2.5,
            py: 1.1,
            borderLeft: `3px solid ${active ? COLORS.primary : pending ? COLORS.gold : "transparent"}`,
            bgcolor: active
              ? alpha(COLORS.primary, 0.08)
              : pending
                ? COLORS.goldSoft
                : "transparent",
            transition: "all 0.2s",
            "&:hover": { bgcolor: alpha(COLORS.primary, 0.05) },
          }}
        >
          <ListItemIcon sx={{ minWidth: 30 }}>
            <PlayArrowIcon
              sx={{
                color: active
                  ? COLORS.primary
                  : pending
                    ? COLORS.gold
                    : COLORS.inkSoft,
                fontSize: 18,
              }}
            />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography
                variant="body2"
                sx={{
                  fontWeight: active || pending ? 600 : 400,
                  lineHeight: 1.4,
                  color: active ? COLORS.primary : COLORS.ink,
                }}
                noWrap
              >
                {bg.tenBaiGiang ?? bg.tieuDe}
              </Typography>
            }
          />
          <StatusChip trangThai={bg.trangThaiPheDuyet} size="small" />
        </ListItemButton>
        {renderTaiLieu(bg)}
      </Box>
    );
  };

  const renderBaiKiemTra = (bkt: any) => {
    const active = isActive("baiKiemTra", bkt);
    const pending = isTrangThaiCho(bkt.trangThaiPheDuyet);
    const bktId = bkt.idBaiKiemTra ?? bkt.id;
    const open = openBaiKiemTra[bktId] ?? false;
    const cauHois: any[] = bkt.cauHois ?? [];
    return (
      <Box key={bktId}>
        <ListItemButton
          selected={active}
          sx={{
            pl: 3,
            py: 1,
            borderLeft: `3px solid ${active ? COLORS.primary : pending ? COLORS.gold : "transparent"}`,
            bgcolor: active
              ? alpha(COLORS.primary, 0.08)
              : pending
                ? COLORS.goldSoft
                : "transparent",
          }}
        >
          <ListItemIcon
            sx={{ minWidth: 30 }}
            onClick={() => onSelectContent("baiKiemTra", bkt)}
          >
            <QuizIcon
              sx={{
                color: active
                  ? COLORS.primary
                  : pending
                    ? COLORS.gold
                    : COLORS.inkSoft,
                fontSize: 18,
              }}
            />
          </ListItemIcon>
          <ListItemText
            onClick={() => onSelectContent("baiKiemTra", bkt)}
            primary={
              <Typography
                variant="body2"
                sx={{
                  fontWeight: active || pending ? 600 : 400,
                  lineHeight: 1.4,
                  color: active ? COLORS.primary : COLORS.ink,
                }}
                noWrap
              >
                {bkt.tenBaiKiemTra ?? bkt.tieuDe}
              </Typography>
            }
            secondary={
              cauHois.length > 0 ? (
                <Typography variant="caption" sx={{ color: COLORS.inkSoft }}>
                  {cauHois.length} câu hỏi
                </Typography>
              ) : undefined
            }
          />
          <StatusChip trangThai={bkt.trangThaiPheDuyet} size="small" />
          {cauHois.length > 0 && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                toggleBaiKiemTra(bktId);
              }}
            >
              {open ? (
                <ExpandLessIcon sx={{ fontSize: 16 }} />
              ) : (
                <ExpandMoreIcon sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          )}
        </ListItemButton>
        {cauHois.length > 0 && (
          <Collapse in={open}>
            <Stack spacing={0.75} sx={{ pl: 4.5, pr: 1.5, py: 1 }}>
              {cauHois.map((ch: any, chIndex: number) => (
                <CauHoiRow key={ch.idCauHoi ?? ch.id ?? chIndex} cauHoi={ch} />
              ))}
            </Stack>
          </Collapse>
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
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${COLORS.line}`,
          bgcolor: COLORS.paperRaised,
          flexShrink: 0,
        }}
      >
        <Stack
          direction="row"
          sx={{
            mb: 1.25,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: COLORS.inkSoft,
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
            mb: 1.5,
            bgcolor: "var(--ev-paper, #fff)",
            "& .MuiOutlinedInput-root": {
              borderRadius: 1.5,
              "& fieldset": { borderColor: COLORS.line },
              "&:hover fieldset": { borderColor: COLORS.primary },
              "&.Mui-focused fieldset": { borderColor: COLORS.primary },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: COLORS.inkSoft }} />
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

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: COLORS.ink }}
          >
            Tiến độ kiểm duyệt
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: tongSoCho > 0 ? COLORS.gold : COLORS.success,
            }}
          >
            {phanTram}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={phanTram}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: alpha(COLORS.gold, 0.15),
            "& .MuiLinearProgress-bar": {
              backgroundColor: tongSoCho > 0 ? COLORS.gold : COLORS.success,
              borderRadius: 3,
            },
            mb: 0.75,
          }}
        />
        <Typography
          variant="caption"
          sx={{ display: "block", textAlign: "right", color: COLORS.inkSoft }}
        >
          {tongSoCho} / {tongSo} mục đang chờ duyệt
        </Typography>
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
              const baiGiangs = sortPending(
                Array.isArray(phan.baiGiangs) ? phan.baiGiangs : [],
              );
              const baiKiemTras = sortPending(
                Array.isArray(phan.baiKiemTras) ? phan.baiKiemTras : [],
              );
              const soCho = dem(baiGiangs) + dem(baiKiemTras);
              const isOpen = openPhan[id] !== false;

              return (
                <Box key={id}>
                  <ListItemButton
                    onClick={() => togglePhan(id)}
                    sx={{
                      bgcolor: soCho > 0 ? COLORS.goldSoft : "transparent",
                      borderLeft: `3px solid ${soCho > 0 ? COLORS.gold : "transparent"}`,
                      py: 1.5,
                      px: 2.5,
                      transition: "background-color 0.2s",
                      "&:hover": { bgcolor: alpha(COLORS.primary, 0.05) },
                    }}
                  >
                    <FolderRoundedIcon
                      sx={{ color: COLORS.gold, fontSize: 18, mr: 1.25 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: COLORS.ink }}
                        noWrap
                      >
                        {phanIndex + 1}. {phan.tenPhan}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: COLORS.inkSoft }}
                      >
                        {baiGiangs.length + baiKiemTras.length} mục
                        {soCho > 0 ? ` · ${soCho} chờ duyệt` : ""}
                      </Typography>
                    </Box>
                    {isOpen ? (
                      <ExpandLessIcon sx={{ fontSize: 20 }} />
                    ) : (
                      <ExpandMoreIcon sx={{ fontSize: 20 }} />
                    )}
                  </ListItemButton>
                  <Collapse in={isOpen}>
                    <List disablePadding>
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
            {sortPending(flatBaiGiang).map((bg: any) => renderBaiGiang(bg))}
            {sortPending(flatBaiKiemTra).map((bkt: any) =>
              renderBaiKiemTra(bkt),
            )}
          </List>
        )}
      </Box>
    </Box>
  );
}

// --- Câu hỏi (nested trong bài kiểm tra) ---
function CauHoiRow({ cauHoi }: { cauHoi: any }) {
  const [expanded, setExpanded] = useState(false);
  const dapAns: any[] = cauHoi.dapAns ?? [];

  return (
    <Box
      sx={{
        px: 1.25,
        py: 0.75,
        borderRadius: 1.5,
        border: `1px solid ${COLORS.line}`,
        bgcolor: COLORS.paper,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        onClick={() => setExpanded((v) => !v)}
        sx={{
          alignItems: "center",
          cursor: dapAns.length > 0 ? "pointer" : "default",
        }}
      >
        <HelpOutlineRoundedIcon sx={{ color: COLORS.inkSoft, fontSize: 14 }} />
        <Typography
          variant="body2"
          sx={{ flex: 1, color: COLORS.ink, fontSize: 13 }}
          noWrap
        >
          {cauHoi.noiDungCauHoi ?? cauHoi.tenCauHoi ?? cauHoi.tieuDe}
        </Typography>
        {dapAns.length > 0 && (
          <ExpandMoreIcon
            sx={{
              fontSize: 16,
              color: COLORS.inkSoft,
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform .15s",
            }}
          />
        )}
      </Stack>
      {dapAns.length > 0 && (
        <Collapse in={expanded}>
          <Stack spacing={0.5} sx={{ mt: 0.75, ml: 2.25 }}>
            {dapAns.map((da: any, daIndex: number) => (
              <Stack
                key={da.idDapAn ?? da.id ?? daIndex}
                direction="row"
                spacing={0.75}
                sx={{ alignItems: "center" }}
              >
                {da.dapAnDung || da.isDung || da.laDapAnDung ? (
                  <CheckCircleIcon
                    sx={{ color: COLORS.primary, fontSize: 14 }}
                  />
                ) : (
                  <RadioButtonUncheckedIcon
                    sx={{ color: COLORS.inkSoft, fontSize: 14 }}
                  />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color:
                      da.dapAnDung || da.isDung || da.laDapAnDung
                        ? COLORS.ink
                        : COLORS.inkSoft,
                    fontWeight:
                      da.dapAnDung || da.isDung || da.laDapAnDung ? 600 : 400,
                  }}
                  noWrap
                >
                  {da.noiDungDapAn ?? da.tieuDe}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Collapse>
      )}
    </Box>
  );
}
