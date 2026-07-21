/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  Alert,
  Paper,
  Stack,
  Divider,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  CircularProgress,
  Snackbar,
  alpha,
  IconButton,
  Fade,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PlayCircleIcon from "@mui/icons-material/PlayCircleRounded";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SchoolIcon from "@mui/icons-material/School";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockIcon from "@mui/icons-material/Lock";
import StarIcon from "@mui/icons-material/Star";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import DevicesIcon from "@mui/icons-material/Devices";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import FolderIcon from "@mui/icons-material/Folder";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AuthGuard from "@/src/components/AuthGuard";
import StudentDashboardShell from "@/src/components/dashboard/StudentDashboardShell";
import DangKiService from "@/src/services/DangKiService";
import KhoaHocService from "@/src/services/KhoaHocService";
import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import { apiService } from "@/src/services/index";

// ─── constants ────────────────────────────────────────────────────────────────

const RED = "#8B1313";
const RED_HOVER = "#6B1010";
const RED_SOFT = "#fdf2f2";

// ─── styled components ────────────────────────────────────────────────────────

const HeroBanner = styled(Box)(() => ({
  background: "linear-gradient(135deg, #1c1d1f 0%, #141414 100%)",
  borderRadius: 24,
  padding: "2.5rem",
  marginBottom: "1.5rem",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    right: 0,
    width: 320,
    height: "100%",
    background: `radial-gradient(circle at top right, ${alpha(RED, 0.4)}, transparent 70%)`,
    pointerEvents: "none",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: -60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${alpha(RED, 0.15)}, transparent 70%)`,
    pointerEvents: "none",
  },
}));

const SidebarCard = styled(Paper)(() => ({
  borderRadius: 20,
  border: "1px solid #f3d9d9",
  boxShadow: "0 16px 40px rgba(141,19,19,0.10)",
  overflow: "hidden",
  position: "sticky",
  top: 24,
}));

const ThumbBox = styled(Box)<{ bgimg?: string }>(({ bgimg }) => ({
  position: "relative",
  paddingTop: "56%",
  background: bgimg
    ? `#1c1d1f url(${bgimg}) center/cover no-repeat`
    : "#1c1d1f",
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 100%)",
  },
}));

const SectionCard = styled(Paper)(() => ({
  borderRadius: 20,
  border: "1px solid #f3d9d9",
  boxShadow: "0 6px 24px rgba(141,19,19,0.06)",
  padding: "1.75rem",
  transition: "box-shadow 0.25s ease",
}));

const PhanCard = styled(Paper)(() => ({
  borderRadius: 18,
  border: "1px solid #f3d9d9",
  boxShadow: "0 6px 20px rgba(141,19,19,0.05)",
  overflow: "hidden",
}));

const LessonRow = styled(Box)<{ clickable?: number }>(({ clickable }) => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "12px 8px",
  borderBottom: "1px solid #f6e9e9",
  fontSize: 13,
  borderRadius: 10,
  cursor: clickable ? "pointer" : "default",
  transition: "background-color 0.18s ease, transform 0.18s ease",
  "&:last-child": { borderBottom: "none" },
  "&:hover": clickable
    ? {
        backgroundColor: RED_SOFT,
      }
    : undefined,
}));

const PlayBadge = styled(Box)(() => ({
  width: 30,
  height: 30,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: "transform 0.18s ease, background-color 0.18s ease",
}));

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatTongThoiLuong(totalSeconds?: number): string {
  if (!totalSeconds || totalSeconds <= 0) return "0 giờ";
  const hours = totalSeconds / 3600;
  return `${hours.toFixed(1)} giờ`;
}

function formatLessonDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function extractKhoaHoc(res: any): any | null {
  if (!res) return null;
  const candidates = [res, res.data, res.data?.data, res.data?.data?.data];
  for (const c of candidates) {
    if (c && typeof c === "object" && "id" in c && "tieuDe" in c) {
      return c;
    }
  }
  return null;
}

function findFirstFreeVideo(
  khoaHoc: any,
): { url: string; title: string } | null {
  const phanHocs = khoaHoc?.danhSachPhanHoc ?? [];
  for (const phan of phanHocs) {
    const baiGiangs = phan.danhSachBaiGiang ?? [];
    for (const bg of baiGiangs) {
      if (bg.laBaiGiangFree && bg.urlBaiGiang) {
        return { url: String(bg.urlBaiGiang), title: bg.tieuDe };
      }
    }
  }
  return null;
}

// ─── inner content ──────────────────────────────────────────────────────────────

function CourseRegistrationContent() {
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const courseId = params?.courseId ?? "";

  const [tab, setTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  const [khoaHoc, setKhoaHoc] = useState<KhoaHocType | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Video preview player
  const [videoPlayer, setVideoPlayer] = useState<{
    open: boolean;
    url: string | null;
    title: string;
  }>({ open: false, url: null, title: "" });
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const dangKiService = new DangKiService();
  const khoaHocService = new KhoaHocService();

  // ── Fetch dữ liệu khóa học ──────────────────────────────────────────────
  useEffect(() => {
    if (!courseId) return;

    let active = true;

    (async () => {
      setPageLoading(true);
      setPageError(null);
      try {
        const res = await khoaHocService.GetKhoaHocPreview(courseId);
        if (!active) return;

        const course = extractKhoaHoc(res);

        if (course) {
          setKhoaHoc(course);
          setEnrolled(!!course.daDangKy);
        } else {
          const errMsg =
            res?.message ||
            (Array.isArray(res?.errors)
              ? res.errors.join(", ")
              : res?.errors) ||
            "Không tìm thấy khóa học.";
          setPageError(String(errMsg));
        }
      } catch (err) {
        if (active) {
          setPageError("Không tải được thông tin khóa học. Vui lòng thử lại.");
        }
      } finally {
        if (active) setPageLoading(false);
      }
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await dangKiService.DangKiKhoaHocMienPhi(courseId);
      setModalOpen(false);
      setEnrolled(true);
      setSnackbar({
        open: true,
        message: "Đăng ký thành công! Chúc bạn học tốt.",
        severity: "success",
      });
    } catch {
      setModalOpen(false);
      setSnackbar({
        open: true,
        message: "Đăng ký thất bại. Vui lòng thử lại.",
        severity: "error",
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleOpenVideo = (bg: any) => {
    if (!bg.laBaiGiangFree || !bg.urlBaiGiang) return;
    setVideoPlayer({
      open: true,
      url: String(bg.urlBaiGiang),
      title: bg.tieuDe,
    });
    setIsVideoLoading(true);
  };

  const handleOpenPreviewVideo = (preview: { url: string; title: string }) => {
    setVideoPlayer({
      open: true,
      url: String(preview.url),
      title: preview.title,
    });
    setIsVideoLoading(true);
  };

  const handleCloseVideo = () => {
    setVideoPlayer({ open: false, url: null, title: "" });
    setIsVideoLoading(true);
  };

  const previewVideo = findFirstFreeVideo(khoaHoc);

  if (pageLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          py: 12,
        }}
      >
        <CircularProgress sx={{ color: RED }} size={36} thickness={4} />
        <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
          Đang tải khóa học...
        </Typography>
      </Box>
    );
  }

  if (pageError || !khoaHoc) {
    return (
      <Alert severity="error" sx={{ borderRadius: 3 }}>
        {pageError ?? "Không tìm thấy khóa học."}
      </Alert>
    );
  }

  const phanHocs = khoaHoc.danhSachPhanHoc ?? [];
  const gia = khoaHoc.gia ?? khoaHoc.giaGoc ?? 0;
  const isFree =
    khoaHoc.loaiKhoaHoc !== "Khóa học trả phí" &&
    (!khoaHoc.gia || khoaHoc.gia <= 0);

  const giangVien = khoaHoc.createdBy || "Không xác định";

  return (
    <Box>
      <Grid container spacing={3}>
        {/* ── Main column ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <HeroBanner>
            <Chip
              label={khoaHoc.loaiKhoaHoc ?? "KHÓA HỌC"}
              size="small"
              sx={{
                bgcolor: RED,
                color: "#fff",
                fontWeight: 700,
                fontSize: 11,
                mb: 1.75,
                letterSpacing: 0.3,
              }}
            />
            <Typography
              variant="h5"
              sx={{
                color: "#fff",
                fontWeight: 800,
                mb: 1.5,
                lineHeight: 1.35,
                fontSize: { xs: 20, md: 26 },
              }}
            >
              {khoaHoc.tieuDe}
            </Typography>
            <Box
              sx={{
                color: "#c9c9c9",
                fontSize: 13,
                mb: 2.5,
                lineHeight: 1.8,
                maxWidth: 560,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                "& img": { maxWidth: "100%" },
                "& ul, & ol": { pl: 2 },
                "& p": { mb: 1 },
              }}
              dangerouslySetInnerHTML={{ __html: khoaHoc.moTa || "" }}
            />

            {/* Hiển thị tên giảng viên */}
            <Typography
              sx={{
                color: "#ddd",
                fontSize: 13,
                mb: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <SchoolIcon sx={{ fontSize: 16, color: RED }} />
              Giảng viên: <strong>{giangVien}</strong>
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", mb: 2.5 }}
            >
              <Stack direction="row">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} sx={{ fontSize: 16, color: "#e0a800" }} />
                ))}
              </Stack>
              <Typography sx={{ color: "#aaa", fontSize: 12 }}>
                {khoaHoc.soLuongHocVien ?? 0} học viên
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }}>
              {[
                {
                  icon: <AccessTimeIcon sx={{ fontSize: 14 }} />,
                  label: formatTongThoiLuong(khoaHoc.tongThoiLuong),
                },
                {
                  icon: <MenuBookIcon sx={{ fontSize: 14 }} />,
                  label: `${khoaHoc.tongBaiGiang ?? 0} bài học`,
                },
                {
                  icon: <WorkspacePremiumIcon sx={{ fontSize: 14 }} />,
                  label: "Chứng chỉ hoàn thành",
                },
              ].map((item, i) => (
                <Stack
                  key={i}
                  direction="row"
                  spacing={0.75}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 999,
                    px: 1.5,
                    py: 0.6,
                    color: "#ddd",
                    alignItems: "center",
                  }}
                >
                  {item.icon}
                  <Typography sx={{ fontSize: 12 }}>{item.label}</Typography>
                </Stack>
              ))}
            </Stack>
          </HeroBanner>

          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              mb: 2.5,
              minHeight: 44,
              bgcolor: RED_SOFT,
              borderRadius: 999,
              p: 0.5,
              width: "fit-content",
              "& .MuiTabs-indicator": { display: "none" },
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: 13,
                minHeight: 36,
                borderRadius: 999,
                color: "text.secondary",
                px: 2.5,
                transition: "all 0.2s ease",
              },
              "& .Mui-selected": {
                color: "#fff !important",
                bgcolor: RED,
              },
            }}
          >
            <Tab label="Tổng quan" disableRipple />
            <Tab label={`Nội dung (${phanHocs.length})`} disableRipple />
            <Tab label="Đánh giá" disableRipple />
          </Tabs>

          <Fade in key={tab} timeout={250}>
            <Box>
              {tab === 0 && (
                <SectionCard>
                  <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 2 }}>
                    Mô tả khóa học
                  </Typography>
                  <Box
                    sx={{
                      fontSize: 13.5,
                      color: "text.secondary",
                      lineHeight: 1.9,
                      mb: 3,
                      "& img": { maxWidth: "100%" },
                      "& ul, & ol": { pl: 2 },
                      "& p": { mb: 1 },
                    }}
                    dangerouslySetInnerHTML={{ __html: khoaHoc.moTa || "" }}
                  />
                  <Divider sx={{ mb: 2.5, borderColor: "#f3d9d9" }} />
                  <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
                    {[
                      {
                        icon: (
                          <MenuBookIcon sx={{ fontSize: 18, color: RED }} />
                        ),
                        label: `${phanHocs.length} phần học`,
                      },
                      {
                        icon: (
                          <PlayArrowIcon sx={{ fontSize: 18, color: RED }} />
                        ),
                        label: `${khoaHoc.tongBaiGiang ?? 0} bài giảng`,
                      },
                      {
                        icon: <FolderIcon sx={{ fontSize: 18, color: RED }} />,
                        label: `${khoaHoc.tongTaiLieu ?? 0} tài liệu đính kèm`,
                      },
                    ].map((item, i) => (
                      <Stack
                        key={i}
                        direction="row"
                        spacing={1}
                        sx={{
                          bgcolor: RED_SOFT,
                          borderRadius: 3,
                          px: 1.75,
                          py: 1,
                          alignItems: "center",
                        }}
                      >
                        {item.icon}
                        <Typography
                          sx={{
                            fontSize: 13,
                            color: "text.secondary",
                            fontWeight: 600,
                          }}
                        >
                          {item.label}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </SectionCard>
              )}

              {tab === 1 && (
                <Stack spacing={2}>
                  {phanHocs.length === 0 && (
                    <SectionCard>
                      <Typography
                        sx={{ fontSize: 13, color: "text.secondary" }}
                      >
                        Khóa học chưa có nội dung.
                      </Typography>
                    </SectionCard>
                  )}
                  {phanHocs.map((phan: any, i: number) => (
                    <PhanCard key={phan.id ?? i}>
                      <Stack
                        direction="row"
                        sx={{
                          p: 2,
                          background: `linear-gradient(90deg, ${RED_SOFT}, #fff)`,
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.25}
                          sx={{ alignItems: "center" }}
                        >
                          <Box
                            sx={{
                              width: 26,
                              height: 26,
                              borderRadius: "50%",
                              bgcolor: RED,
                              color: "#fff",
                              fontSize: 12,
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {i + 1}
                          </Box>
                          <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>
                            {phan.tenPhan}
                          </Typography>
                        </Stack>
                        <Typography
                          sx={{ fontSize: 11.5, color: "text.disabled" }}
                        >
                          {(phan.danhSachBaiGiang ?? []).length} bài
                        </Typography>
                      </Stack>
                      <Box sx={{ px: 1.5, py: 0.5 }}>
                        {(phan.danhSachBaiGiang ?? []).map(
                          (bg: any, j: number) => {
                            const playable =
                              !!bg.laBaiGiangFree && !!bg.urlBaiGiang;
                            return (
                              <LessonRow
                                key={bg.id ?? j}
                                clickable={playable ? 1 : 0}
                                onClick={() => handleOpenVideo(bg)}
                              >
                                <PlayBadge
                                  sx={{
                                    bgcolor: playable
                                      ? RED_SOFT
                                      : "transparent",
                                  }}
                                >
                                  {playable ? (
                                    <PlayArrowIcon
                                      sx={{ fontSize: 16, color: RED }}
                                    />
                                  ) : (
                                    <LockIcon
                                      sx={{
                                        fontSize: 15,
                                        color: "text.disabled",
                                      }}
                                    />
                                  )}
                                </PlayBadge>
                                <Typography
                                  sx={{
                                    flex: 1,
                                    fontSize: 13,
                                    fontWeight: playable ? 600 : 400,
                                    color: playable
                                      ? "text.primary"
                                      : "text.secondary",
                                  }}
                                >
                                  {bg.tieuDe}
                                </Typography>
                                {Array.isArray(bg.danhSachTaiLieu) &&
                                  bg.danhSachTaiLieu.length > 0 && (
                                    <Chip
                                      icon={
                                        <FolderIcon sx={{ fontSize: 12 }} />
                                      }
                                      label={bg.danhSachTaiLieu.length}
                                      size="small"
                                      sx={{
                                        bgcolor: RED_SOFT,
                                        color: RED,
                                        fontSize: 10,
                                        height: 22,
                                        fontWeight: 600,
                                      }}
                                    />
                                  )}
                                {bg.laBaiGiangFree && (
                                  <Chip
                                    label="Miễn phí"
                                    size="small"
                                    sx={{
                                      bgcolor: "#e8f5e9",
                                      color: "#2e7d32",
                                      fontSize: 10,
                                      height: 22,
                                      fontWeight: 600,
                                    }}
                                  />
                                )}
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    color: "text.disabled",
                                    minWidth: 42,
                                    textAlign: "right",
                                    fontVariantNumeric: "tabular-nums",
                                  }}
                                >
                                  {formatLessonDuration(bg.thoiLuong)}
                                </Typography>
                              </LessonRow>
                            );
                          },
                        )}
                      </Box>
                    </PhanCard>
                  ))}
                </Stack>
              )}

              {tab === 2 && (
                <SectionCard>
                  <Stack
                    sx={{
                      alignItems: "center",
                      justifyContent: "center",
                      py: 5,
                      color: "text.disabled",
                    }}
                    spacing={1.5}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        bgcolor: RED_SOFT,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <StarIcon sx={{ fontSize: 26, color: RED }} />
                    </Box>
                    <Typography sx={{ fontSize: 13.5 }}>
                      Chưa có đánh giá nào cho khóa học này.
                    </Typography>
                  </Stack>
                </SectionCard>
              )}
            </Box>
          </Fade>
        </Grid>

        {/* ── Sidebar ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <SidebarCard>
            <ThumbBox bgimg={khoaHoc.hinhAnhKhoaHoc}>
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                }}
              >
                {previewVideo && (
                  <Box
                    onClick={() => handleOpenPreviewVideo(previewVideo)}
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      bgcolor: alpha(RED, 0.92),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
                      border: "3px solid rgba(255,255,255,0.25)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        transform: "scale(1.1)",
                        boxShadow: "0 10px 32px rgba(0,0,0,0.55)",
                      },
                    }}
                  >
                    <PlayArrowIcon sx={{ color: "#fff", fontSize: 30 }} />
                  </Box>
                )}
              </Box>

              {previewVideo && (
                <Chip
                  label="Xem thử miễn phí"
                  size="small"
                  sx={{
                    position: "absolute",
                    bottom: 12,
                    left: 12,
                    bgcolor: "rgba(0,0,0,0.65)",
                    color: "#fff",
                    fontSize: 10.5,
                    height: 24,
                    fontWeight: 600,
                    zIndex: 1,
                    backdropFilter: "blur(4px)",
                  }}
                />
              )}
            </ThumbBox>

            <Box sx={{ p: 2.75 }}>
              <Stack
                direction="row"
                spacing={1.25}
                sx={{ alignItems: "baseline", mb: 1.5 }}
              >
                <Typography
                  sx={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: isFree ? "#2d7a35" : RED,
                  }}
                >
                  {isFree
                    ? "Miễn phí"
                    : gia > 0
                      ? `${gia.toLocaleString("vi-VN")}₫`
                      : "Liên hệ"}
                </Typography>
                {khoaHoc.giaGoc && khoaHoc.giaGoc !== gia && (
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "text.disabled",
                      textDecoration: "line-through",
                    }}
                  >
                    {khoaHoc.giaGoc.toLocaleString("vi-VN")}₫
                  </Typography>
                )}
              </Stack>

              {!enrolled ? (
                isFree ? (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SchoolIcon />}
                    onClick={async () => {
                      try {
                        await apiService.post(
                          `/dangkikhoahoc/dangki-khoahoc/${khoaHoc.id}`,
                        );
                        setEnrolled(true);
                      } catch (e: any) {
                        const msg =
                          e?.response?.data?.message ?? "Có lỗi xảy ra";
                        if (msg.includes("đã đăng ký")) {
                          setEnrolled(true);
                        } else {
                          alert(msg);
                        }
                      }
                    }}
                    sx={{
                      bgcolor: "#2d7a35",
                      "&:hover": { bgcolor: "#245f2a" },
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: 14.5,
                      borderRadius: 2.5,
                      py: 1.35,
                      mb: 1.5,
                      boxShadow: `0 8px 20px ${alpha("#2d7a35", 0.3)}`,
                    }}
                  >
                    Đăng ký miễn phí
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ShoppingCartIcon />}
                    onClick={async () => {
                      try {
                        await apiService.post(`/GioHang/${khoaHoc.id}`);
                        router.push("/student/cart");
                      } catch (e: any) {
                        const msg = e?.response?.data?.message ?? "";
                        const status = e?.response?.status;

                        if (status === 409) {
                          router.push("/student/cart");
                        } else if (
                          msg.includes("sở hữu") ||
                          msg.includes("đã mua")
                        ) {
                          setEnrolled(true);
                          setSnackbar({
                            open: true,
                            message: "Bạn đã sở hữu khóa học này!",
                            severity: "success",
                          });
                        } else {
                          setSnackbar({
                            open: true,
                            message: msg || "Có lỗi xảy ra",
                            severity: "error",
                          });
                        }
                      }
                    }}
                    sx={{
                      bgcolor: RED,
                      "&:hover": { bgcolor: RED_HOVER },
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: 14.5,
                      borderRadius: 2.5,
                      py: 1.35,
                      mb: 1.5,
                      boxShadow: `0 8px 20px ${alpha(RED, 0.3)}`,
                    }}
                  >
                    Mua ngay
                  </Button>
                )
              ) : (
                <Box sx={{ mb: 1.5 }}>
                  <Box
                    sx={{
                      bgcolor: "#f0fdf4",
                      border: "1.5px solid #86efac",
                      borderRadius: "14px",
                      p: 2,
                      mb: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        bgcolor: "#22c55e",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircleIcon sx={{ color: "#fff", fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: 13.5,
                          color: "#15803d",
                        }}
                      >
                        Khóa học của bạn
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "#16a34a" }}>
                        Bạn đã sở hữu khóa học này
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SchoolIcon />}
                    onClick={() =>
                      router.push(`/hoc-vien/khoa-hoc-cua-toi/${khoaHoc.id}`)
                    }
                    sx={{
                      bgcolor: "#22c55e",
                      "&:hover": { bgcolor: "#16a34a" },
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: 14.5,
                      borderRadius: 2.5,
                      py: 1.35,
                      boxShadow: "0 8px 20px rgba(34,197,94,0.3)",
                    }}
                  >
                    Vào học ngay
                  </Button>
                </Box>
              )}

              <Stack
                direction="row"
                spacing={0.5}
                sx={{ justifyContent: "center", mb: 2.5 }}
              >
                <VerifiedUserIcon
                  sx={{ fontSize: 14, color: "text.disabled" }}
                />
              </Stack>

              <Typography sx={{ fontWeight: 700, fontSize: 13.5, mb: 1.5 }}>
                Khóa học bao gồm
              </Typography>
              <Stack spacing={1.25}>
                {[
                  {
                    icon: <PlayArrowIcon sx={{ fontSize: 17 }} />,
                    label: formatTongThoiLuong(khoaHoc.tongThoiLuong),
                  },
                  {
                    icon: <FolderIcon sx={{ fontSize: 17 }} />,
                    label: `${khoaHoc.tongTaiLieu ?? 0} tài nguyên tải về`,
                  },
                  {
                    icon: <DevicesIcon sx={{ fontSize: 17 }} />,
                    label: "Truy cập trên mọi thiết bị",
                  },
                  {
                    icon: <AllInclusiveIcon sx={{ fontSize: 17 }} />,
                    label: "Truy cập trọn đời",
                  },
                  {
                    icon: <WorkspacePremiumIcon sx={{ fontSize: 17 }} />,
                    label: "Chứng chỉ hoàn thành",
                  },
                ].map((item, i) => (
                  <Stack
                    key={i}
                    direction="row"
                    spacing={1.25}
                    sx={{ alignItems: "center" }}
                  >
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: 2,
                        bgcolor: RED_SOFT,
                        color: RED,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography
                      sx={{ fontSize: 12.5, color: "text.secondary" }}
                    >
                      {item.label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </SidebarCard>
        </Grid>
      </Grid>

      {/* ── Confirm dialog ── */}
      <Dialog
        open={modalOpen}
        onClose={() => !registering && setModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4 } } }}
      >
        <DialogContent sx={{ p: 3.5 }}>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 0.5,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Xác nhận đăng ký
            </Typography>
            <IconButton
              size="small"
              disabled={registering}
              onClick={() => setModalOpen(false)}
              sx={{ color: "text.disabled" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2.5 }}>
            {isFree
              ? "Bạn sắp đăng ký khóa học sau hoàn toàn miễn phí."
              : "Bạn sắp đăng ký khóa học sau."}
          </Typography>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "center",
              bgcolor: RED_SOFT,
              borderRadius: 3,
              p: 1.75,
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.5,
                bgcolor: RED,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              <SchoolIcon />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                {khoaHoc.tieuDe}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
                {khoaHoc.tongBaiGiang ?? 0} bài học ·{" "}
                {formatTongThoiLuong(khoaHoc.tongThoiLuong)}
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={1.25}>
            <Button
              fullWidth
              variant="contained"
              disabled={registering}
              onClick={handleRegister}
              startIcon={
                registering ? (
                  <CircularProgress size={16} sx={{ color: "#fff" }} />
                ) : (
                  <SchoolIcon />
                )
              }
              sx={{
                bgcolor: RED,
                "&:hover": { bgcolor: RED_HOVER },
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2.5,
                py: 1.35,
              }}
            >
              {registering ? "Đang đăng ký..." : "Xác nhận đăng ký"}
            </Button>
            <Button
              fullWidth
              variant="text"
              disabled={registering}
              onClick={() => setModalOpen(false)}
              sx={{
                color: "text.secondary",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Hủy bỏ
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* ── Video preview player (modal nhỏ gọn, tỉ lệ 16:9) ── */}
      <Dialog
        open={videoPlayer.open}
        onClose={handleCloseVideo}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "20px",
              bgcolor: "#111214",
              overflow: "hidden",
              boxShadow: "0 24px 70px rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,255,255,0.08)",
              m: 2,
            },
          },
          backdrop: {
            sx: {
              backgroundColor: "rgba(10,10,10,0.7)",
              backdropFilter: "blur(6px)",
            },
          },
        }}
      >
        {/* Header nhỏ gọn */}
        <Stack
          direction="row"
          sx={{
            px: 2.25,
            py: 1.5,
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Stack
            direction="row"
            spacing={1.25}
            sx={{ alignItems: "center", minWidth: 0 }}
          >
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                bgcolor: alpha(RED, 0.18),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PlayCircleIcon sx={{ fontSize: 17, color: RED }} />
            </Box>
            <Typography
              sx={{
                color: "#fff",
                fontSize: 13.5,
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {videoPlayer.title}
            </Typography>
          </Stack>
          <IconButton
            size="small"
            onClick={handleCloseVideo}
            sx={{
              color: "rgba(255,255,255,0.7)",
              bgcolor: "rgba(255,255,255,0.06)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.14)",
                color: "#fff",
              },
              flexShrink: 0,
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Khung video tỉ lệ 16:9 */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            bgcolor: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isVideoLoading && (
            <CircularProgress
              sx={{ color: RED, position: "absolute", zIndex: 5 }}
              size={40}
              thickness={4}
            />
          )}

          {videoPlayer.url ? (
            <Box
              component="video"
              src={videoPlayer.url}
              controls
              autoPlay
              playsInline
              preload="auto"
              crossOrigin="anonymous"
              onCanPlay={() => setIsVideoLoading(false)}
              onError={(e) => {
                console.error("Video error:", e);
                setIsVideoLoading(false);
              }}
              onWaiting={() => setIsVideoLoading(true)}
              onPlaying={() => setIsVideoLoading(false)}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                backgroundColor: "#000",
              }}
            />
          ) : (
            <Typography sx={{ color: "#fff", fontSize: 13 }}>
              Không thể tải video
            </Typography>
          )}
        </Box>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 2.5 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// ─── exported page ────────────────────────────────────────────────────────────

export default function CourseRegistrationPage() {
  return (
    <AuthGuard allowedRoles={["HocVien", "GiaoVien"]}>
      <StudentDashboardShell>
        <Box sx={{ py: { xs: 2.5, md: 4.5 } }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 4.5 },
              borderRadius: "28px",
              border: "1px solid rgba(141,19,19,0.06)",
              bgcolor: "#ffffff",
              boxShadow: "0 10px 30px rgba(141,19,19,0.015)",
            }}
          >
            <CourseRegistrationContent />
          </Paper>
        </Box>
      </StudentDashboardShell>
    </AuthGuard>
  );
}
