"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import KhoaHocService from "@/src/services/KhoaHocService";
import { BaiGiangType } from "@/src/types/BaiGiang/BaiGiangDto";
import { TaiLieuType } from "@/src/types/TaiLieu/TaiLieuDto";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Link as MuiLink,
  AppBar,
  Toolbar,
  LinearProgress,
  Tooltip,
  IconButton,
  Fade,
} from "@mui/material";
import {
  ExpandMore,
  Search,
  PlayCircleFilled,
  PictureAsPdf,
  InsertDriveFile,
  OndemandVideo,
  SkipNext,
  CheckCircle,
  MenuBook,
  AccessTime,
  People,
  NavigateNext,
  ChevronRight,
  ChevronLeft,
} from "@mui/icons-material";
import { KhoaHocType } from "@/src/types/KhoaHoc/dto";

const C = {
  red: "#c0392b",
  redHover: "#a93226",
  redLight: "#fdecea",
  redMid: "#e74c3c",
} as const;

const T = {
  bg: "#ffffff",
  bgAlt: "#f7f9fa",
  bgCard: "#ffffff",
  bgHover: "#f0f0f0",
  bgActive: "#fdecea",
  border: "#e4e4e4",
  text: "#1c1d1f",
  textSub: "#6a6f73",
  appbar: "#ffffff",
  sidebarHead: "#f0f0f0",
  divider: "#e4e4e4",
};

const KhoaHocServiceInstance = new KhoaHocService();
const SIDEBAR_W = 370;

const KhoaHocPage = () => {
  // ── mount guard: tránh hydration mismatch ────────────────────────────────
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [khoaHoc, setKhoaHoc] = useState<KhoaHocType | null>(null);
  const [loading, setLoading] = useState(false);
  const [idKhoaHoc, setIdKhoaHoc] = useState("");
  const [idNguoiDung, setIdNguoiDung] = useState("");
  const [error, setError] = useState("");
  const [baiGiangDangPhat, setBaiGiangDangPhat] = useState<BaiGiangType | null>(
    null,
  );
  const [danhSachTatCa, setDanhSachTatCa] = useState<BaiGiangType[]>([]);
  const [phanDangMo, setPhanDangMo] = useState<string[]>([]);
  const [hoanThanh, setHoanThanh] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const flatten = (d: KhoaHocType): BaiGiangType[] =>
    d.danhSachPhanHoc?.flatMap((p) => p.danhSachBaiGiang ?? []) ?? [];

  const chon = (bg: BaiGiangType) => {
    setBaiGiangDangPhat(bg);
    const pid = bg.idPhan as string;
    if (pid) setPhanDangMo((p) => (p.includes(pid) ? p : [...p, pid]));
  };

  const danhDau = (id: string) =>
    setHoanThanh((prev) => {
      const s = new Set(prev);
      s.add(id);
      return s;
    });

  const next = (ds: BaiGiangType[], cur: BaiGiangType) => {
    const i = ds.findIndex((b) => b.id === cur.id);
    if (i !== -1 && i < ds.length - 1) chon(ds[i + 1]);
  };

  const handleEnded = () => {
    if (baiGiangDangPhat) {
      danhDau(baiGiangDangPhat.id as string);
      next(danhSachTatCa, baiGiangDangPhat);
    }
  };

  const togglePhan = (id: string, playing?: string) => {
    if (id === playing) return;
    setPhanDangMo((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );
  };

  useEffect(() => {
    if (!baiGiangDangPhat) return;
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
    document
      .getElementById(`bai-${baiGiangDangPhat.id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [baiGiangDangPhat]);

  const fetchKhoaHoc = async () => {
    if (!idKhoaHoc.trim() || !idNguoiDung.trim()) {
      setError("Vui lòng nhập đầy đủ ID khóa học và ID người dùng");
      return;
    }
    try {
      setError("");
      setLoading(true);
      setKhoaHoc(null);
      setBaiGiangDangPhat(null);
      setPhanDangMo([]);
      setHoanThanh(new Set());
      const res = await KhoaHocServiceInstance.getLearningKhoaHoc(
        idKhoaHoc,
        idNguoiDung,
      );
      setKhoaHoc(res);
      const ds = flatten(res);
      setDanhSachTatCa(ds);
      if (ds.length > 0) {
        chon(ds[0]);
        setSidebarOpen(true);
      }
    } catch {
      setError("Không tìm thấy khóa học. Vui lòng kiểm tra lại ID.");
    } finally {
      setLoading(false);
    }
  };

  const idx = danhSachTatCa.findIndex((b) => b.id === baiGiangDangPhat?.id);
  const coNext = idx !== -1 && idx < danhSachTatCa.length - 1;
  const idPhanPlay = baiGiangDangPhat?.idPhan as string | undefined;
  const pct =
    danhSachTatCa.length > 0
      ? Math.round((hoanThanh.size / danhSachTatCa.length) * 100)
      : 0;

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: T.bgCard,
      "& fieldset": { borderColor: T.border },
      "&:hover fieldset": { borderColor: C.red + "99" },
      "&.Mui-focused fieldset": { borderColor: C.red },
    },
    "& .MuiInputLabel-root": { color: T.textSub },
    "& .MuiInputLabel-root.Mui-focused": { color: C.red },
    "& .MuiInputBase-input": { color: T.text },
  };

  // ── Chờ mount xong mới render để tránh SSR/client mismatch ───────────────
  if (!mounted) return null;

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        bgcolor: T.bg,
      }}
    >
      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <AppBar
        position="relative"
        elevation={0}
        sx={{
          bgcolor: T.appbar,
          borderBottom: `1.5px solid ${khoaHoc ? C.red : T.border}`,
          zIndex: 1200,
          flexShrink: 0,
        }}
      >
        <Toolbar
          sx={{
            minHeight: "62px !important",
            px: { xs: 1.5, md: 2.5 },
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <Image
              src="/khoahoc/1-removebg-preview.png"
              alt="EduVerse"
              width={110}
              height={34}
              style={{ objectFit: "contain" }}
            />
          </Box>

          {khoaHoc ? (
            <>
              <Tooltip
                title={
                  sidebarOpen
                    ? "Ẩn nội dung khóa học"
                    : "Hiện nội dung khóa học"
                }
              >
                <IconButton
                  onClick={() => setSidebarOpen((v) => !v)}
                  size="small"
                  sx={{
                    ml: 0.5,
                    width: 34,
                    height: 34,
                    borderRadius: 1.5,
                    border: `1.5px solid ${sidebarOpen ? C.red : T.border}`,
                    bgcolor: sidebarOpen ? C.redLight : T.bgAlt,
                    color: sidebarOpen ? C.red : T.textSub,
                    transition: "all .2s",
                    "&:hover": {
                      bgcolor: C.redLight,
                      borderColor: C.red,
                      color: C.red,
                    },
                  }}
                >
                  {sidebarOpen ? (
                    <ChevronRight sx={{ fontSize: 20 }} />
                  ) : (
                    <ChevronLeft sx={{ fontSize: 20 }} />
                  )}
                </IconButton>
              </Tooltip>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ borderColor: T.border, mx: 0.5 }}
              />

              <Typography
                sx={{
                  color: T.text,
                  fontWeight: 600,
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: { xs: 12, md: 14 },
                }}
              >
                {khoaHoc.tieuDe}
              </Typography>

              <Box
                sx={{
                  display: { xs: "none", sm: "flex" },
                  alignItems: "center",
                  gap: 1.5,
                  flexShrink: 0,
                }}
              >
                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    sx={{ color: T.textSub, fontSize: 10, lineHeight: 1.2 }}
                  >
                    Tiến độ
                  </Typography>
                  <Typography
                    sx={{ color: C.red, fontWeight: 700, fontSize: 13 }}
                  >
                    {pct}%
                  </Typography>
                </Box>
                <Box sx={{ width: 96 }}>
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: "#f8dada",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 3,
                        background: `linear-gradient(90deg, ${C.redHover}, ${C.redMid})`,
                      },
                    }}
                  />
                </Box>
                <Typography
                  sx={{ color: T.textSub, fontSize: 12, whiteSpace: "nowrap" }}
                >
                  {hoanThanh.size}/{danhSachTatCa.length}
                </Typography>
              </Box>

              {coNext && (
                <Tooltip title="Chuyển bài tiếp theo">
                  <Button
                    size="small"
                    variant="outlined"
                    endIcon={<SkipNext sx={{ fontSize: 16 }} />}
                    onClick={() => next(danhSachTatCa, baiGiangDangPhat!)}
                    sx={{
                      textTransform: "none",
                      fontSize: 12,
                      py: 0.5,
                      px: 1.5,
                      borderColor: C.red,
                      color: C.red,
                      borderRadius: 1.5,
                      display: { xs: "none", md: "flex" },
                      "&:hover": {
                        bgcolor: C.redLight,
                        borderColor: C.redHover,
                      },
                    }}
                  >
                    Tiếp theo
                  </Button>
                </Tooltip>
              )}
            </>
          ) : (
            <Typography
              sx={{
                color: T.textSub,
                flex: 1,
                fontStyle: "italic",
                fontSize: 13,
                display: { xs: "none", sm: "block" },
                pl: 1,
              }}
            >
              Nền tảng học trực tuyến hàng đầu Việt Nam
            </Typography>
          )}
        </Toolbar>
      </AppBar>

      {/* ══ FORM ════════════════════════════════════════════════════════════ */}
      {!khoaHoc && (
        <Fade in timeout={350}>
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 3,
              bgcolor: T.bg,
              overflow: "auto",
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 5 },
                borderRadius: 3,
                width: "100%",
                maxWidth: 440,
                bgcolor: T.bgCard,
                border: `1px solid ${T.border}`,
                boxShadow: `0 4px 28px rgba(192,57,43,.09)`,
              }}
            >
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                  <Image
                    src="/khoahoc/1-removebg-preview.png"
                    alt="EduVerse"
                    width={148}
                    height={46}
                    style={{ objectFit: "contain" }}
                  />
                </Box>
                <Box
                  sx={{
                    width: 36,
                    height: 3,
                    bgcolor: C.red,
                    mx: "auto",
                    borderRadius: 2,
                    mb: 2.5,
                  }}
                />
                <Typography
                  sx={{ fontWeight: 700, color: T.text, fontSize: 20, mb: 0.5 }}
                >
                  Bắt đầu học ngay
                </Typography>
                <Typography sx={{ color: T.textSub, fontSize: 14 }}>
                  Nhập thông tin để truy cập khóa học
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="ID Khóa học"
                value={idKhoaHoc}
                onChange={(e) => setIdKhoaHoc(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchKhoaHoc()}
                placeholder="Nhập ID khóa học"
                size="small"
                sx={{ ...fieldSx, mb: 2 }}
              />
              <TextField
                fullWidth
                label="ID Người dùng"
                value={idNguoiDung}
                onChange={(e) => setIdNguoiDung(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchKhoaHoc()}
                placeholder="Nhập ID người dùng"
                size="small"
                sx={{ ...fieldSx, mb: error ? 1.5 : 3 }}
              />

              {error && (
                <Typography sx={{ color: "#e53935", fontSize: 13, mb: 2 }}>
                  ⚠ {error}
                </Typography>
              )}

              <Button
                fullWidth
                variant="contained"
                onClick={fetchKhoaHoc}
                disabled={loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={15} color="inherit" />
                  ) : (
                    <Search sx={{ fontSize: 18 }} />
                  )
                }
                sx={{
                  bgcolor: C.red,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: "none",
                  py: 1.4,
                  fontSize: 14.5,
                  boxShadow: `0 4px 16px ${C.red}44`,
                  "&:hover": {
                    bgcolor: C.redHover,
                    boxShadow: `0 6px 22px ${C.red}55`,
                  },
                  "&:disabled": { bgcolor: C.red + "88" },
                }}
              >
                {loading ? "Đang tải..." : "Vào học ngay"}
              </Button>
            </Paper>
          </Box>
        </Fade>
      )}

      {/* ══ LAYOUT HỌC - MAIN CONTENT AREA ══════════════════════════════════ */}
      {khoaHoc && (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* LEFT SIDE - BODY (Video + Info) - Scroll độc lập */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              transition: "all .28s cubic-bezier(.4,0,.2,1)",
              mr: sidebarOpen ? 0 : 0,
            }}
          >
            {/* Video Container - Fixed height, no scroll */}
            <Box
              sx={{
                flexShrink: 0,
                bgcolor: "#060606",
                borderBottom: `2px solid ${C.red}`,
                position: "relative",
                "& video": {
                  width: "100%",
                  display: "block",
                  maxHeight: "55vh",
                  objectFit: "contain",
                },
              }}
            >
              {baiGiangDangPhat?.urlBaiGiang ? (
                <video ref={videoRef} controls autoPlay onEnded={handleEnded}>
                  <source src={baiGiangDangPhat.urlBaiGiang} type="video/mp4" />
                </video>
              ) : (
                <Box
                  sx={{
                    height: "45vh",
                    minHeight: 320,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    background: "linear-gradient(160deg,#0c0c0c,#1a0808)",
                  }}
                >
                  <Box
                    sx={{
                      width: 88,
                      height: 88,
                      borderRadius: "50%",
                      bgcolor: `${C.red}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `2px solid ${C.red}33`,
                    }}
                  >
                    <OndemandVideo sx={{ fontSize: 42, color: C.red }} />
                  </Box>
                  <Typography
                    sx={{ color: "#666", fontSize: 14, letterSpacing: 0.4 }}
                  >
                    Chọn bài giảng để bắt đầu học
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Info Panel - Scroll độc lập */}
            <Box
              sx={{
                flex: 1,
                overflow: "auto",
                bgcolor: T.bg,
                "&::-webkit-scrollbar": {
                  width: 8,
                  height: 8,
                },
                "&::-webkit-scrollbar-track": {
                  bgcolor: T.bgAlt,
                },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: T.border,
                  borderRadius: 4,
                  "&:hover": {
                    bgcolor: C.red,
                  },
                },
              }}
            >
              <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
                {baiGiangDangPhat && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.6,
                      mb: 1.5,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography sx={{ color: T.textSub, fontSize: 12 }}>
                      {khoaHoc.danhSachPhanHoc?.find((p) => p.id === idPhanPlay)
                        ?.tenPhan ?? ""}
                    </Typography>
                    <NavigateNext sx={{ fontSize: 14, color: T.textSub }} />
                    <Typography
                      sx={{ color: C.red, fontWeight: 600, fontSize: 12 }}
                    >
                      {baiGiangDangPhat.tieuDe}
                    </Typography>
                  </Box>
                )}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 2,
                    mb: 2.5,
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: T.text,
                        lineHeight: 1.35,
                        fontSize: { xs: 17, md: 22 },
                        mb: 0.8,
                      }}
                    >
                      {baiGiangDangPhat?.tieuDe ?? khoaHoc.tieuDe}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      {baiGiangDangPhat && (
                        <Typography sx={{ color: T.textSub, fontSize: 13 }}>
                          Bài {idx + 1}/{danhSachTatCa.length} ·{" "}
                          {Math.floor((baiGiangDangPhat.thoiLuong ?? 0) / 60)}p
                          {(baiGiangDangPhat.thoiLuong ?? 0) % 60}s
                        </Typography>
                      )}
                      {baiGiangDangPhat?.laBaiGiangFree && (
                        <Chip
                          label="Miễn phí"
                          size="small"
                          sx={{
                            bgcolor: "#e8f5e9",
                            color: "#27ae60",
                            fontSize: 11,
                            height: 21,
                            fontWeight: 600,
                          }}
                        />
                      )}
                      {hoanThanh.has(baiGiangDangPhat?.id as string) && (
                        <Chip
                          icon={
                            <CheckCircle
                              sx={{
                                fontSize: "13px !important",
                                color: `${C.red} !important`,
                              }}
                            />
                          }
                          label="Đã hoàn thành"
                          size="small"
                          sx={{
                            bgcolor: C.redLight,
                            color: C.red,
                            fontSize: 11,
                            height: 21,
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
                    {baiGiangDangPhat &&
                      !hoanThanh.has(baiGiangDangPhat.id as string) && (
                        <Tooltip title="Đánh dấu bài này đã hoàn thành">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CheckCircle sx={{ fontSize: 15 }} />}
                            onClick={() =>
                              danhDau(baiGiangDangPhat.id as string)
                            }
                            sx={{
                              textTransform: "none",
                              fontSize: 12.5,
                              py: 0.7,
                              borderColor: T.border,
                              color: T.textSub,
                              borderRadius: 1.5,
                              "&:hover": {
                                borderColor: C.red,
                                color: C.red,
                                bgcolor: C.redLight,
                              },
                            }}
                          >
                            Hoàn thành
                          </Button>
                        </Tooltip>
                      )}
                    {coNext && (
                      <Button
                        variant="contained"
                        size="small"
                        endIcon={<SkipNext sx={{ fontSize: 16 }} />}
                        onClick={() => next(danhSachTatCa, baiGiangDangPhat!)}
                        sx={{
                          textTransform: "none",
                          fontSize: 12.5,
                          py: 0.7,
                          bgcolor: C.red,
                          borderRadius: 1.5,
                          boxShadow: "none",
                          "&:hover": { bgcolor: C.redHover, boxShadow: "none" },
                        }}
                      >
                        Bài tiếp theo
                      </Button>
                    )}
                  </Box>
                </Box>

                <Divider sx={{ borderColor: T.divider, mb: 3 }} />

                {khoaHoc.moTa && (
                  <Typography
                    sx={{
                      color: T.textSub,
                      lineHeight: 1.8,
                      fontSize: 14,
                      mb: 3,
                    }}
                  >
                    {khoaHoc.moTa}
                  </Typography>
                )}

                <Box
                  sx={{
                    display: "flex",
                    gap: { xs: 2, md: 4 },
                    flexWrap: "wrap",
                    p: 2.5,
                    bgcolor: T.bgAlt,
                    borderRadius: 2,
                    border: `1px solid ${T.border}`,
                  }}
                >
                  {[
                    {
                      icon: <AccessTime sx={{ fontSize: 16 }} />,
                      label: khoaHoc.tongThoiLuong
                        ? `${Math.floor(khoaHoc.tongThoiLuong / 3600)}h ${Math.floor((khoaHoc.tongThoiLuong % 3600) / 60)}p`
                        : "0h 0p",
                    },
                    {
                      icon: <MenuBook sx={{ fontSize: 16 }} />,
                      label: `${khoaHoc.tongBaiGiang ?? 0} bài giảng`,
                    },
                    {
                      icon: <People sx={{ fontSize: 16 }} />,
                      label: `${khoaHoc.soLuongHocVien ?? 0} học viên`,
                    },
                  ].map(({ icon, label }, i) => (
                    <Box
                      key={i}
                      sx={{ display: "flex", alignItems: "center", gap: 0.8 }}
                    >
                      <Box
                        sx={{ color: T.textSub, display: "flex", fontSize: 16 }}
                      >
                        {icon}
                      </Box>
                      <Typography sx={{ color: T.textSub, fontSize: 13 }}>
                        {label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* RIGHT SIDE - SIDEBAR (Taskbar) - Scroll độc lập */}
          <Box
            sx={{
              width: sidebarOpen ? SIDEBAR_W : 0,
              flexShrink: 0,
              overflow: "hidden",
              transition: "width .28s cubic-bezier(.4,0,.2,1)",
              borderLeft: sidebarOpen ? `1px solid ${T.border}` : "none",
              display: "flex",
              flexDirection: "column",
              bgcolor: T.bgCard,
              position: "relative",
            }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderBottom: `2px solid ${C.red}`,
                bgcolor: T.sidebarHead,
                flexShrink: 0,
                minWidth: SIDEBAR_W,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography
                  sx={{ fontWeight: 700, fontSize: 14, color: T.text }}
                >
                  Nội dung khóa học
                </Typography>
                <Tooltip title="Đóng sidebar">
                  <IconButton
                    size="small"
                    onClick={() => setSidebarOpen(false)}
                    sx={{
                      color: T.textSub,
                      p: 0.5,
                      borderRadius: 1,
                      "&:hover": { color: C.red, bgcolor: C.redLight },
                    }}
                  >
                    <ChevronRight sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                      height: 5,
                      borderRadius: 3,
                      bgcolor: "#f5d5d5",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 3,
                        background: `linear-gradient(90deg, ${C.redHover}, ${C.redMid})`,
                      },
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    color: C.red,
                    fontWeight: 700,
                    fontSize: 11,
                    whiteSpace: "nowrap",
                  }}
                >
                  {pct}%
                </Typography>
              </Box>
              <Typography sx={{ color: T.textSub, fontSize: 11, mt: 0.5 }}>
                {hoanThanh.size}/{danhSachTatCa.length} bài đã hoàn thành
              </Typography>
            </Box>

            {/* Sidebar Scrollable Content */}
            <Box
              sx={{
                overflow: "auto",
                flex: 1,
                minWidth: SIDEBAR_W,
                "&::-webkit-scrollbar": {
                  width: 6,
                },
                "&::-webkit-scrollbar-track": {
                  bgcolor: T.bgAlt,
                },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: T.border,
                  borderRadius: 3,
                  "&:hover": {
                    bgcolor: C.red,
                  },
                },
              }}
            >
              {khoaHoc.danhSachPhanHoc?.map((phan, pi) => {
                const isOpen = phanDangMo.includes(phan.id ?? "");
                const isPlaying = phan.id === idPhanPlay;
                const doneCnt =
                  phan.danhSachBaiGiang?.filter((b: BaiGiangType) =>
                    hoanThanh.has(b.id as string),
                  ).length ?? 0;
                const totalMin = Math.floor(
                  (phan.danhSachBaiGiang?.reduce(
                    (a: number, b: BaiGiangType) => a + (b.thoiLuong ?? 0),
                    0,
                  ) ?? 0) / 60,
                );

                return (
                  <Accordion
                    key={phan.id ?? pi}
                    expanded={isOpen}
                    onChange={() => togglePhan(phan.id ?? "", idPhanPlay)}
                    disableGutters
                    elevation={0}
                    sx={{
                      bgcolor: "transparent",
                      "&:before": { display: "none" },
                      borderBottom: `1px solid ${T.border}`,
                    }}
                  >
                    <AccordionSummary
                      expandIcon={
                        <ExpandMore
                          sx={{
                            fontSize: 19,
                            color: isPlaying ? C.red : T.textSub,
                          }}
                        />
                      }
                      sx={{
                        bgcolor: isPlaying ? "#fff3f3" : T.bgAlt,
                        px: 2,
                        minHeight: "54px !important",
                        borderLeft: `3px solid ${isPlaying ? C.red : "transparent"}`,
                        transition: "all .15s",
                        "&:hover": {
                          bgcolor: isPlaying ? C.redLight : T.bgHover,
                        },
                        "& .MuiAccordionSummary-content": {
                          my: "10px !important",
                        },
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: 12.5,
                            color: isPlaying ? C.red : T.text,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            lineHeight: 1.45,
                          }}
                        >
                          {phan.thuTuSapXep ?? pi + 1}. {phan.tenPhan}
                        </Typography>
                        <Typography
                          sx={{ color: T.textSub, fontSize: 11, mt: 0.2 }}
                        >
                          {doneCnt}/{phan.danhSachBaiGiang?.length ?? 0} bài ·{" "}
                          {totalMin}p
                        </Typography>
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails sx={{ p: 0, bgcolor: T.bgCard }}>
                      {(phan.danhSachBaiGiang?.length ?? 0) === 0 && (
                        <Typography
                          sx={{
                            color: T.textSub,
                            px: 3,
                            py: 2.5,
                            fontStyle: "italic",
                            fontSize: 13,
                          }}
                        >
                          Chưa có bài giảng
                        </Typography>
                      )}

                      {phan.danhSachBaiGiang?.map(
                        (bg: BaiGiangType, bi: number) => {
                          const isActive = baiGiangDangPhat?.id === bg.id;
                          const isDone = hoanThanh.has(bg.id as string);

                          return (
                            <Box key={bg.id ?? bi} id={`bai-${bg.id}`}>
                              <Box
                                onClick={() => chon(bg)}
                                sx={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 1.5,
                                  px: 2,
                                  py: 1.5,
                                  cursor: "pointer",
                                  bgcolor: isActive
                                    ? C.redLight
                                    : "transparent",
                                  borderLeft: `3px solid ${isActive ? C.red : "transparent"}`,
                                  transition: "all .15s",
                                  "&:hover": {
                                    bgcolor: isActive ? C.redLight : T.bgHover,
                                  },
                                }}
                              >
                                {isDone ? (
                                  <CheckCircle
                                    sx={{
                                      fontSize: 17,
                                      mt: 0.25,
                                      flexShrink: 0,
                                      color: C.red,
                                    }}
                                  />
                                ) : (
                                  <PlayCircleFilled
                                    sx={{
                                      fontSize: 17,
                                      mt: 0.25,
                                      flexShrink: 0,
                                      color: isActive ? C.red : T.textSub,
                                    }}
                                  />
                                )}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography
                                    sx={{
                                      fontWeight: isActive ? 700 : 400,
                                      color: isActive ? C.red : T.text,
                                      lineHeight: 1.5,
                                      fontSize: 13,
                                    }}
                                  >
                                    {bg.tieuDe}
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: 1,
                                      mt: 0.3,
                                      alignItems: "center",
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    <Typography
                                      sx={{ color: T.textSub, fontSize: 11 }}
                                    >
                                      {Math.floor((bg.thoiLuong ?? 0) / 60)}p
                                      {(bg.thoiLuong ?? 0) % 60}s
                                    </Typography>
                                    {bg.laBaiGiangFree && (
                                      <Chip
                                        label="Miễn phí"
                                        size="small"
                                        sx={{
                                          bgcolor: "#e8f5e9",
                                          color: "#27ae60",
                                          fontSize: 10,
                                          height: 16,
                                          fontWeight: 600,
                                        }}
                                      />
                                    )}
                                    {isDone && !isActive && (
                                      <Typography
                                        sx={{
                                          color: C.red,
                                          fontSize: 10,
                                          fontWeight: 700,
                                        }}
                                      >
                                        ✓ Hoàn thành
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              </Box>

                              {(bg.danhSachTaiLieu?.length ?? 0) > 0 && (
                                <Box
                                  sx={{
                                    pl: 5.5,
                                    pr: 2,
                                    pb: 1.5,
                                    pt: 0.5,
                                    bgcolor: "#fafafa",
                                    borderTop: `1px dashed ${T.border}`,
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      color: T.textSub,
                                      fontWeight: 600,
                                      display: "block",
                                      mb: 0.8,
                                      fontSize: 11,
                                    }}
                                  >
                                    📎 Tài liệu đính kèm
                                  </Typography>
                                  {bg.danhSachTaiLieu?.map(
                                    (tl: TaiLieuType, ti: number) => (
                                      <Box
                                        key={tl.id ?? ti}
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                          py: 0.5,
                                        }}
                                      >
                                        {tl.loaiTaiLieu === "PDF" ? (
                                          <PictureAsPdf
                                            sx={{
                                              fontSize: 14,
                                              color: C.redMid,
                                              flexShrink: 0,
                                            }}
                                          />
                                        ) : (
                                          <InsertDriveFile
                                            sx={{
                                              fontSize: 14,
                                              color: "#2980b9",
                                              flexShrink: 0,
                                            }}
                                          />
                                        )}
                                        <MuiLink
                                          href={tl.url}
                                          download={tl.tenTaiLieu}
                                          sx={{
                                            color: "#2980b9",
                                            flex: 1,
                                            fontSize: 12,
                                            cursor: "pointer",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            textDecoration: "none",
                                            "&:hover": {
                                              color: C.red,
                                              textDecoration: "underline",
                                            },
                                          }}
                                        >
                                          {tl.tenTaiLieu}
                                        </MuiLink>
                                        <Chip
                                          label={tl.loaiTaiLieu}
                                          size="small"
                                          sx={{
                                            fontSize: 9,
                                            height: 16,
                                            flexShrink: 0,
                                            bgcolor: T.bgAlt,
                                            color: T.textSub,
                                          }}
                                        />
                                      </Box>
                                    ),
                                  )}
                                </Box>
                              )}
                            </Box>
                          );
                        },
                      )}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          </Box>

          {/* Floating open button */}
          {!sidebarOpen && (
            <Fade in={!sidebarOpen}>
              <Box
                sx={{
                  position: "fixed",
                  right: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 900,
                }}
              >
                <Tooltip title="Mở nội dung khóa học" placement="left">
                  <Box
                    onClick={() => setSidebarOpen(true)}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.5,
                      width: 28,
                      py: 3,
                      bgcolor: C.red,
                      borderRadius: "8px 0 0 8px",
                      cursor: "pointer",
                      boxShadow: `-3px 0 12px ${C.red}44`,
                      transition: "all .2s",
                      "&:hover": { bgcolor: C.redHover, width: 32 },
                    }}
                  >
                    <ChevronLeft sx={{ fontSize: 18, color: "#fff" }} />
                    <Typography
                      sx={{
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                        letterSpacing: 1,
                      }}
                    >
                      NỘI DUNG
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            </Fade>
          )}
        </Box>
      )}
    </Box>
  );
};

export default KhoaHocPage;
