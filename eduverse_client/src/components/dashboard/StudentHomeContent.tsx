/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { BRAND, CSSVAR, STATUS, GRADIENTS } from "@/src/theme/tokens";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DOMPurify from "dompurify";
import { apiService } from "@/src/services/index";
import { useFavorite } from "@/src/features/favorite/hooks/useFavorite";
import { useSelector } from "@/src/store/hook";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
  Avatar,
  Portal,
  Tooltip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  StarRounded,
  PeopleAltRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  PlayArrowRounded,
  PsychologyRounded,
  QuizRounded,
  ShoppingCartRounded,
  CheckCircleRounded,
  AccessTimeRounded,
  MenuBookRounded,
  ArrowForwardRounded,
  RefreshRounded,
  WorkspacePremiumRounded,
  AutoStoriesRounded,
  InboxRounded,
  PlayCircleFilledRounded,
  SchoolRounded,
} from "@mui/icons-material";
import FavoriteHeartIcon from "@/src/features/favorite/components/FavoriteHeartIcon";

// ─── Palette (brand maroon, toned neutrals) ──────────────────────────────────
const C = {
  primary: BRAND.main,
  primaryDark: BRAND.dark,
  primaryTint: "var(--dashboard-primary-tint)",
  primaryBorder: "var(--dashboard-primary-border)",
  info: STATUS.info,
  infoTint: "var(--dashboard-info-tint)",
  white: "var(--dashboard-surface)",
  card: "var(--dashboard-surface)",
  border: "var(--dashboard-border)",
  border2: "var(--dashboard-border-strong)",
  textDark: "var(--dashboard-text-primary)",
  textSecondary: "var(--dashboard-text-secondary)",
  textMuted: "var(--dashboard-text-muted)",
  ok: STATUS.success,
  okTint: "var(--dashboard-success-tint)",
  warn: STATUS.warning,
  gradientCrimson: GRADIENTS.crimson,
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface KhoaHocDto {
  id: string;
  tieuDe: string;
  moTa?: string;
  gia: number;
  giaGoc?: number;
  capDo?: string;
  loaiKhoaHoc?: string;
  hinhAnhKhoaHoc?: string;
  tongThoiLuong?: number;
  tongBaiGiang?: number;
  soLuongHocVien?: number;
  daDangKy?: boolean;
  idDangKiKhoaHoc?: string;
  soBaiGiangHoanThanh?: number;
  phanTramHoanThanh?: number;
  thumbnailGradient?: string;
  contentType?: string;
  duration?: string;
  progress?: number;
  rating?: number;
  diemDanhGiaTrungBinh?: number;
  soLuongDanhGia?: number;
  studentsCount?: number;
  level?: string;
  instructor?: string;
  title?: string;
  subtitle?: string;
  categoryNames?: string[];
  tenGiangVien?: string;
  danhSachGiangVienHienThi?: string[];
}

interface DashboardData {
  welcomeStats?: {
    userName?: string;
    avatarUrl?: string;
    totalCourses?: number;
    progressPercent?: number;
    certificatesCount?: number;
    subtitle?: string;
  };
  continueLearning?: {
    courses?: KhoaHocDto[];
    paths?: KhoaHocDto[];
    certificates?: KhoaHocDto[];
    assessments?: KhoaHocDto[];
  };
  interestedSkills?: string[];
  nextSectors?: {
    id: string;
    title: string;
    iconName: string;
    subfields?: string[];
  }[];
  skillsCourses?: KhoaHocDto[];
  promotedCourses?: KhoaHocDto[];
  premiumSelection?: {
    id?: string;
    title?: string;
    hinhAnhKhoaHoc?: string;
    description?: string;
    instructor?: string;
    rating?: number;
    studentsCount?: number;
    thumbnailGradient?: string;
    relatedCourses?: KhoaHocDto[];
    gia?: number;
    giaGoc?: number;
    giagoc?: number;
    level?: string;
    daDangKy?: boolean;
    loaiKhoaHoc?: string;
  };
  historyRecommendation?: {
    basedOnCourse?: string;
    courses?: KhoaHocDto[];
  };
}

// ─── Format helpers ───────────────────────────────────────────────────────────
function fmtPrice(gia: number) {
  if (gia === 0) return "Miễn phí";
  return gia.toLocaleString("vi-VN") + "đ";
}

function fmtDuration(seconds?: number) {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h} giờ ${m > 0 ? m + " phút" : ""}` : `${m} phút`;
}

function getGradient(_course: KhoaHocDto) {
  void _course;
  return "var(--dashboard-surface-muted)";
}

function isValidImage(url?: string): boolean {
  if (!url) return false;
  const t = url.trim();
  if (
    !t ||
    t === "không có" ||
    t === "aaaaaaaa" ||
    t === "string" ||
    t === "null" ||
    t === "undefined"
  )
    return false;
  return t.startsWith("http") || t.startsWith("/") || t.startsWith(".");
}

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

function isValidGuid(id?: string | null): boolean {
  return Boolean(id && id !== EMPTY_GUID && id.trim() !== "");
}

function initialsOf(name?: string) {
  if (!name || name === "học viên") return "HV";
  const cleanName = name.trim();
  const parts = cleanName.split(/\s+/);
  if (parts.length === 0) return "HV";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
}

// ─── Carousel Row ─────────────────────────────────────────────────────────────
function CarouselRow({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 15);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 15);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    setTimeout(checkScroll, 100);
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [children, checkScroll]);

  const scroll = (dir: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir === "left" ? -el.clientWidth * 0.75 : el.clientWidth * 0.75,
      behavior: "smooth",
    });
  };

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      {showLeft && (
        <IconButton
          onClick={() => scroll("left")}
          sx={{
            position: "absolute",
            left: -16,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            bgcolor: C.white,
            boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
            border: `1px solid ${C.border}`,
            width: 38,
            height: 38,
            "&:hover": { bgcolor: "var(--dashboard-surface-raised)" },
          }}
        >
          <ChevronLeftRounded />
        </IconButton>
      )}
      {showRight && (
        <IconButton
          onClick={() => scroll("right")}
          sx={{
            position: "absolute",
            right: -16,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            bgcolor: C.white,
            boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
            border: `1px solid ${C.border}`,
            width: 38,
            height: 38,
            "&:hover": { bgcolor: "var(--dashboard-surface-raised)" },
          }}
        >
          <ChevronRightRounded />
        </IconButton>
      )}
      <Box
        ref={containerRef}
        sx={{
          display: "flex",
          gap: 2.5,
          overflowX: "auto",
          pb: 1.5,
          pt: 1,
          px: 0.5,
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({
  icon,
  title,
  desc,
  actionLabel,
  onAction,
}: {
  icon?: React.ReactNode;
  title: string;
  desc?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3.5, md: 4.5 },
        borderRadius: "16px",
        border: `1px dashed ${C.border2}`,
        bgcolor: C.card,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.4,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "16px",
          bgcolor: C.primaryTint,
          color: C.primary,
          display: "grid",
          placeItems: "center",
        }}
      >
        {icon ?? <InboxRounded />}
      </Box>
      <Typography sx={{ fontSize: 15.5, fontWeight: 800, color: C.textDark }}>
        {title}
      </Typography>
      {desc && (
        <Typography
          sx={{ fontSize: 13.5, color: C.textSecondary, maxWidth: 380 }}
        >
          {desc}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="contained"
          sx={{
            mt: 0.5,
            borderRadius: "11px",
            px: 2.4,
            py: 1,
            fontWeight: 800,
            fontSize: 13.5,
            bgcolor: C.primary,
            boxShadow: "none",
            "&:hover": { bgcolor: C.primaryDark, boxShadow: "none" },
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
}

// ─── Course card skeleton ─────────────────────────────────────────────────────
function CourseCardSkeleton({ width = 240 }: { width?: number }) {
  return (
    <Paper
      elevation={0}
      sx={{
        width,
        flexShrink: 0,
        borderRadius: "18px",
        overflow: "hidden",
        border: `1px solid ${C.border}`,
        bgcolor: C.white,
      }}
    >
      <Skeleton variant="rectangular" height={136} />
      <Box sx={{ p: 1.75 }}>
        <Skeleton width="90%" height={16} />
        <Skeleton width="60%" height={16} sx={{ mt: 0.5 }} />
        <Divider sx={{ my: 1.25, opacity: 0.4 }} />
        <Skeleton width="45%" height={22} />
      </Box>
    </Paper>
  );
}

// ─── Udemy-style Hover Panel ──────────────────────────────────────────────────
interface HoverPanelProps {
  course: KhoaHocDto;
  anchorEl: React.RefObject<HTMLDivElement | null>;
  onAddCart: (course: KhoaHocDto) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function HoverPanel({
  course,
  anchorEl,
  onAddCart,
  onMouseEnter,
  onMouseLeave,
}: HoverPanelProps) {
  const { isFavorited, toggleFavorite } = useFavorite();
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const update = () => {
      const el = anchorEl.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const PANEL_WIDTH = 310;
      const GAP = 12;
      let left = rect.right + GAP;
      if (left + PANEL_WIDTH > window.innerWidth - 8) {
        left = rect.left - PANEL_WIDTH - GAP;
      }
      let top = rect.top;
      if (top + 520 > window.innerHeight) {
        top = Math.max(8, window.innerHeight - 520);
      }
      setPos({ top, left });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [anchorEl]);

  if (!pos) return null;

  const gradient = getGradient(course);
  const isFree =
    course.loaiKhoaHoc !== "Khóa học trả phí" &&
    (!course.gia || course.gia <= 0);
  const displayPrice =
    course.gia ??
    course.giaGoc ??
    ((course as unknown as Record<string, unknown>).giagoc as number) ??
    0;

  return (
    <Box
      ref={panelRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => e.stopPropagation()}
      sx={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: 310,
        zIndex: 1500,
        bgcolor: "background.paper",
        borderRadius: "16px",
        boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
        border: "1px solid rgba(0,0,0,0.07)",
        overflow: "hidden",
        display: { xs: "none", md: "block" },
        animation: "fadeIn 150ms ease",
        "@keyframes fadeIn": {
          from: { opacity: 0, transform: "translateX(-8px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
      }}
    >
      <Box sx={{ height: 5, background: gradient }} />
      <Box sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 1.5, flexWrap: "wrap", gap: 0.5 }}
        >
          {(course.capDo || course.level) && (
            <Chip
              label={course.capDo || course.level}
              size="small"
              sx={{
                bgcolor: C.primaryTint,
                color: C.primary,
                fontWeight: 700,
                fontSize: 10.5,
                height: 20,
              }}
            />
          )}
          {course.loaiKhoaHoc && (
            <Typography
              sx={{
                fontSize: 11,
                color: C.textMuted,
                fontWeight: 600,
                lineHeight: "20px",
              }}
            >
              {course.loaiKhoaHoc}
            </Typography>
          )}
        </Stack>

        <Typography
          sx={{
            fontSize: 14.5,
            fontWeight: 800,
            color: C.textDark,
            lineHeight: 1.4,
            mb: 1,
          }}
        >
          {course.tieuDe || course.title}
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
          {course.tongThoiLuong != null && (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              <AccessTimeRounded sx={{ fontSize: 13, color: C.textMuted }} />
              <Typography
                sx={{ fontSize: 11.5, color: C.textSecondary, fontWeight: 600 }}
              >
                {fmtDuration(course.tongThoiLuong)}
              </Typography>
            </Stack>
          )}
          {course.tongBaiGiang != null && (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              <MenuBookRounded sx={{ fontSize: 13, color: C.textMuted }} />
              <Typography
                sx={{ fontSize: 11.5, color: C.textSecondary, fontWeight: 600 }}
              >
                {course.tongBaiGiang} bài giảng
              </Typography>
            </Stack>
          )}
        </Stack>

        {course.moTa && (
          <Typography
            sx={{
              fontSize: 12.5,
              color: C.textSecondary,
              lineHeight: 1.55,
              mb: 2,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {course.moTa
              .replace(/<[^>]*>/g, "")
              .replace(/&nbsp;/g, " ")
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .trim()}
          </Typography>
        )}

        <Divider sx={{ mb: 2 }} />

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "baseline", mb: 2 }}
        >
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 900,
              color: isFree ? C.ok : C.primary,
            }}
          >
            {isFree ? "Miễn phí" : fmtPrice(displayPrice)}
          </Typography>
          {Boolean(course.giaGoc && course.giaGoc > displayPrice) && (
            <Typography
              sx={{
                fontSize: 13,
                color: C.textMuted,
                textDecoration: "line-through",
                fontWeight: 600,
              }}
            >
              {course.giaGoc?.toLocaleString("vi-VN")}đ
            </Typography>
          )}
        </Stack>

        <Stack spacing={1.2}>
          {course.daDangKy ? (
            <Button
              fullWidth
              variant="contained"
              startIcon={<PlayCircleFilledRounded />}
              onClick={(e) => {
                e.stopPropagation();
                const learningId = isValidGuid(course.idDangKiKhoaHoc)
                  ? course.idDangKiKhoaHoc
                  : course.id;
                router.push(
                  `/student/courses/my-courses/learning/${learningId}`,
                );
              }}
              sx={{
                borderRadius: "12px",
                py: 1.1,
                fontWeight: 800,
                fontSize: 13.5,
                bgcolor: C.ok,
                color: "#fff",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: C.ok,
                  opacity: 0.9,
                  boxShadow: "none",
                },
              }}
            >
              Vào học ngay
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              startIcon={<ShoppingCartRounded />}
              onClick={(e) => {
                e.stopPropagation();
                onAddCart(course);
              }}
              sx={{
                borderRadius: "12px",
                py: 1.1,
                fontWeight: 800,
                fontSize: 13.5,
                background: C.gradientCrimson,
                color: "#fff",
                boxShadow: "none",
                "&:hover": {
                  background: GRADIENTS.crimsonHover,
                  boxShadow: "none",
                },
              }}
            >
              Thêm vào giỏ hàng
            </Button>
          )}
          <Button
            fullWidth
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(course.id, course.tieuDe || course.title || "");
            }}
            startIcon={
              <FavoriteHeartIcon
                active={isFavorited(course.id)}
                color={C.primary}
                size={24}
              />
            }
            sx={{
              borderRadius: "12px",
              py: 1,
              fontWeight: 700,
              fontSize: 13,
              borderColor: C.primaryBorder,
              color: C.primary,
              "&:hover": {
                borderColor: C.primary,
                bgcolor: C.primaryTint,
              },
            }}
          >
            {isFavorited(course.id) ? "Bỏ yêu thích" : "Lưu vào yêu thích"}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

// ─── Course Card (carousel item, fixed width, uniform height) ────────────────
interface CourseCardProps {
  course: KhoaHocDto;
  onAddCart: (course: KhoaHocDto) => void;
  onClick?: (course: KhoaHocDto) => void;
  width?: number;
}

function CourseCard({
  course,
  onAddCart,
  onClick,
  width = 240,
}: CourseCardProps) {
  const { isFavorited, toggleFavorite } = useFavorite();
  const favorited = isFavorited(course.id);
  const [hovered, setHovered] = useState(false);
  const [hoverCard, setHoverCard] = useState(false);
  const [hoverPanel, setHoverPanel] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFree =
    course.loaiKhoaHoc !== "Khóa học trả phí" &&
    (!course.gia || course.gia <= 0);
  const displayPrice =
    course.gia ??
    course.giaGoc ??
    ((course as unknown as Record<string, unknown>).giagoc as number) ??
    0;
  const title = course.tieuDe || course.title || "";
  const ratingVal = course.rating ?? course.diemDanhGiaTrungBinh;
  const hasRating = typeof ratingVal === "number" && ratingVal > 0;
  const reviewCount = course.soLuongDanhGia ?? 0;
  const instructorName =
    course.danhSachGiangVienHienThi &&
    course.danhSachGiangVienHienThi.length > 0
      ? course.danhSachGiangVienHienThi.join(", ")
      : course.tenGiangVien || course.instructor || "Giảng viên EduVerse";

  const levelBadge = course.capDo || course.level || "Tất cả cấp độ";

  const handleCardEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setHoverCard(true);
    setHovered(true);
  };
  const handleCardLeave = () => {
    setHoverCard(false);
    leaveTimer.current = setTimeout(() => {
      if (!hoverPanel) setHovered(false);
    }, 150);
  };
  const handlePanelEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setHoverPanel(true);
  };
  const handlePanelLeave = () => {
    setHoverPanel(false);
    leaveTimer.current = setTimeout(() => {
      if (!hoverCard) setHovered(false);
    }, 150);
  };

  return (
    <>
      <Paper
        ref={cardRef}
        elevation={0}
        onMouseEnter={handleCardEnter}
        onMouseLeave={handleCardLeave}
        onClick={() => onClick?.(course)}
        sx={{
          width,
          flexShrink: 0,
          borderRadius: "10px",
          overflow: "hidden",
          border: `1px solid ${C.border}`,
          bgcolor: C.white,
          cursor: "pointer",
          transition:
            "transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
            borderColor: C.primaryBorder,
            "& .card-wishlist-btn": {
              opacity: 1,
            },
          },
        }}
      >
        {/* ── 1. Thumbnail Image ── */}
        <Box
          sx={{
            height: 136,
            background: isValidImage(course.hinhAnhKhoaHoc)
              ? `url(${course.hinhAnhKhoaHoc}) center/cover no-repeat`
              : "var(--dashboard-surface-muted)",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {!isValidImage(course.hinhAnhKhoaHoc) && (
            <Stack sx={{ alignItems: "center", justifyContent: "center" }}>
              <SchoolRounded sx={{ color: C.textMuted, fontSize: 32 }} />
              <Typography
                sx={{
                  color: C.textMuted,
                  fontSize: 11,
                  fontWeight: 700,
                  mt: 0.75,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                EDUVERSE
              </Typography>
            </Stack>
          )}

          {/* Subtle wishlist heart button (visible on hover or when favorited) */}
          <IconButton
            className="card-wishlist-btn"
            aria-label={favorited ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
            aria-pressed={favorited}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleFavorite(course.id, title);
            }}
            sx={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 28,
              height: 28,
              bgcolor: "rgba(255, 255, 255, 0.92)",
              color: favorited ? C.primary : "rgba(31, 41, 55, 0.4)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              zIndex: 5,
              opacity: favorited ? 1 : 0,
              transition: "opacity 180ms ease, transform 150ms ease",
              p: 0,
              "&:hover": {
                bgcolor: "#ffffff",
                color: C.primary,
                transform: "scale(1.1)",
              },
            }}
          >
            <FavoriteHeartIcon active={favorited} color={C.primary} />
          </IconButton>
        </Box>

        {/* ── 2. Card Content ── */}
        <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
          {/* Title */}
          <Typography
            sx={{
              fontSize: 13.5,
              fontWeight: 700,
              lineHeight: 1.4,
              height: 38,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              color: C.textDark,
            }}
          >
            {title}
          </Typography>

          {/* Instructor name */}
          <Typography
            sx={{
              fontSize: 11.5,
              color: C.textMuted,
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {instructorName}
          </Typography>

          {/* Rating score + Stars OR 'Chưa có đánh giá' */}
          {hasRating ? (
            <Tooltip title={`${reviewCount} lượt đánh giá`} arrow placement="top">
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ alignItems: "center", mt: 0.25, width: "fit-content" }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#b45309",
                    lineHeight: 1,
                  }}
                >
                  {ratingVal.toFixed(1).replace(".", ",")}
                </Typography>
                <Stack direction="row" spacing={0.1} sx={{ alignItems: "center" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarRounded
                      key={star}
                      sx={{
                        fontSize: 13.5,
                        color:
                          star <= Math.round(ratingVal)
                            ? "#f59e0b"
                            : "#d1d5db",
                      }}
                    />
                  ))}
                </Stack>
                {reviewCount > 0 && (
                  <Typography
                    sx={{
                      fontSize: 11.5,
                      color: C.textMuted,
                      fontWeight: 500,
                      lineHeight: 1,
                    }}
                  >
                    ({reviewCount.toLocaleString()})
                  </Typography>
                )}
              </Stack>
            </Tooltip>
          ) : (
            <Stack
              direction="row"
              spacing={0.4}
              sx={{ alignItems: "center", mt: 0.25 }}
            >
              <StarRounded sx={{ fontSize: 14, color: C.textMuted }} />
              <Typography
                sx={{
                  fontSize: 11.5,
                  color: C.textMuted,
                  fontWeight: 500,
                  lineHeight: 1,
                }}
              >
                Chưa có đánh giá
              </Typography>
            </Stack>
          )}

          {/* Price row */}
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: "baseline", mt: 0.25 }}
          >
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 800,
                color: C.textDark,
                lineHeight: 1.2,
              }}
            >
              {isFree ? "Miễn phí" : fmtPrice(displayPrice)}
            </Typography>
            {Boolean(course.giaGoc && course.giaGoc > displayPrice) && (
              <Typography
                sx={{
                  fontSize: 11.5,
                  color: C.textMuted,
                  textDecoration: "line-through",
                  fontWeight: 500,
                }}
              >
                {fmtPrice(course.giaGoc!)}
              </Typography>
            )}
          </Stack>

          {/* Bottom Badge: Pill badge (Brand red "Tất cả cấp độ" / Level) */}
          <Box sx={{ mt: 0.5 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1,
                py: 0.35,
                borderRadius: "6px",
                bgcolor: C.primary,
                color: "#ffffff",
                width: "fit-content",
              }}
            >
              <WorkspacePremiumRounded
                sx={{ fontSize: 13, color: "#ffffff" }}
              />
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#ffffff",
                  lineHeight: 1.2,
                }}
              >
                {levelBadge}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {hovered && (
        <Portal>
          <HoverPanel
            course={course}
            anchorEl={cardRef}
            onAddCart={onAddCart}
            onMouseEnter={handlePanelEnter}
            onMouseLeave={handlePanelLeave}
          />
        </Portal>
      )}
    </>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({
  title,
  linkText,
  href,
}: {
  title: string;
  linkText?: string;
  href?: string;
}) {
  return (
    <Stack
      direction="row"
      sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}
    >
      <Typography sx={{ fontSize: 20, fontWeight: 900, color: C.textDark }}>
        {title}
      </Typography>
      {linkText && href && (
        <Typography
          component="a"
          href={href}
          sx={{
            fontSize: 13.5,
            fontWeight: 800,
            color: C.primary,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {linkText} <ArrowForwardRounded sx={{ fontSize: 16 }} />
        </Typography>
      )}
    </Stack>
  );
}

// ─── Continue-learning progress card (Styled in harmony with standard CourseCard) ───
function ContinueLearningCard({
  item,
  onOpen,
  width = 240,
}: {
  item: KhoaHocDto;
  onOpen: (c: KhoaHocDto) => void;
  width?: number;
}) {
  const { isFavorited, toggleFavorite } = useFavorite();
  const favorited = isFavorited(item.id);
  const title = item.tieuDe || item.title || "";
  const pct = Math.max(
    0,
    Math.min(100, Math.round(item.phanTramHoanThanh ?? item.progress ?? 0)),
  );
  const done = item.soBaiGiangHoanThanh;
  const total = item.tongBaiGiang;

  const ratingVal = item.rating ?? item.diemDanhGiaTrungBinh;
  const hasRating = typeof ratingVal === "number" && ratingVal > 0;
  const reviewCount = item.soLuongDanhGia ?? 0;
  const instructorName =
    item.danhSachGiangVienHienThi && item.danhSachGiangVienHienThi.length > 0
      ? item.danhSachGiangVienHienThi.join(", ")
      : item.tenGiangVien || item.instructor || "Giảng viên EduVerse";

  return (
    <Paper
      elevation={0}
      onClick={() => onOpen(item)}
      sx={{
        width,
        flexShrink: 0,
        borderRadius: "10px",
        overflow: "hidden",
        border: `1px solid ${C.border}`,
        bgcolor: C.white,
        cursor: "pointer",
        transition:
          "transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
          borderColor: C.primaryBorder,
          "& .card-wishlist-btn": {
            opacity: 1,
          },
        },
      }}
    >
      {/* ── 1. Thumbnail Image ── */}
      <Box
        sx={{
          height: 136,
          background: isValidImage(item.hinhAnhKhoaHoc)
            ? `url(${item.hinhAnhKhoaHoc}) center/cover no-repeat`
            : "var(--dashboard-surface-muted)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {!isValidImage(item.hinhAnhKhoaHoc) && (
          <Stack sx={{ alignItems: "center", justifyContent: "center" }}>
            <SchoolRounded sx={{ color: C.textMuted, fontSize: 32 }} />
            <Typography
              sx={{
                color: C.textMuted,
                fontSize: 11,
                fontWeight: 700,
                mt: 0.75,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              EDUVERSE
            </Typography>
          </Stack>
        )}

        {/* Wishlist heart button */}
        <IconButton
          className="card-wishlist-btn"
          aria-label={favorited ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
          aria-pressed={favorited}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleFavorite(item.id, title);
          }}
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 28,
            height: 28,
            bgcolor: "rgba(255, 255, 255, 0.92)",
            color: favorited ? C.primary : "rgba(31, 41, 55, 0.4)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            zIndex: 5,
            opacity: favorited ? 1 : 0,
            transition: "opacity 180ms ease, transform 150ms ease",
            p: 0,
            "&:hover": {
              bgcolor: "#ffffff",
              color: C.primary,
              transform: "scale(1.1)",
            },
          }}
        >
          <FavoriteHeartIcon active={favorited} color={C.primary} />
        </IconButton>
      </Box>

      {/* ── 2. Card Content ── */}
      <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
        {/* Title */}
        <Typography
          sx={{
            fontSize: 13.5,
            fontWeight: 700,
            lineHeight: 1.4,
            height: 38,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            color: C.textDark,
          }}
        >
          {title}
        </Typography>

        {/* Instructor name */}
        <Typography
          sx={{
            fontSize: 11.5,
            color: C.textMuted,
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {instructorName}
        </Typography>

        {/* Rating score + Stars OR 'Chưa có đánh giá' */}
        {hasRating ? (
          <Tooltip title={`${reviewCount} lượt đánh giá`} arrow placement="top">
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ alignItems: "center", mt: 0.25, width: "fit-content" }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#b45309",
                  lineHeight: 1,
                }}
              >
                {ratingVal.toFixed(1).replace(".", ",")}
              </Typography>
              <Stack direction="row" spacing={0.1} sx={{ alignItems: "center" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarRounded
                    key={star}
                    sx={{
                      fontSize: 13.5,
                      color:
                        star <= Math.round(ratingVal)
                          ? "#f59e0b"
                          : "#d1d5db",
                    }}
                  />
                ))}
              </Stack>
              {reviewCount > 0 && (
                <Typography
                  sx={{
                    fontSize: 11.5,
                    color: C.textMuted,
                    fontWeight: 500,
                    lineHeight: 1,
                  }}
                >
                  ({reviewCount.toLocaleString()})
                </Typography>
              )}
            </Stack>
          </Tooltip>
        ) : (
          <Stack
            direction="row"
            spacing={0.4}
            sx={{ alignItems: "center", mt: 0.25 }}
          >
            <StarRounded sx={{ fontSize: 14, color: C.textMuted }} />
            <Typography
              sx={{
                fontSize: 11.5,
                color: C.textMuted,
                fontWeight: 500,
                lineHeight: 1,
              }}
            >
              Chưa có đánh giá
            </Typography>
          </Stack>
        )}

        {/* Progress row: Text + Percentage + Bar */}
        <Box sx={{ mt: 0.5 }}>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              mb: 0.5,
            }}
          >
            <Typography
              sx={{
                fontSize: 11.5,
                color: C.textMuted,
                fontWeight: 500,
              }}
            >
              {done != null && total != null
                ? `${done}/${total} bài học`
                : "Tiến độ học tập"}
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 800,
                color: pct === 100 ? STATUS.success : C.primary,
              }}
            >
              {pct}%
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              height: 5,
              borderRadius: 3,
              bgcolor: "rgba(0,0,0,0.06)",
              "& .MuiLinearProgress-bar": {
                background:
                  pct === 100
                    ? `linear-gradient(90deg, #34D399 0%, ${STATUS.success} 100%)`
                    : `linear-gradient(90deg, ${STATUS.errorDark} 0%, ${BRAND.main} 100%)`,
                borderRadius: 3,
              },
            }}
          />
        </Box>

        {/* Bottom Action Button (Full Width, Modern & Elegant) */}
        <Button
          fullWidth
          variant="contained"
          size="small"
          startIcon={
            pct === 100 ? (
              <CheckCircleRounded sx={{ fontSize: "16px !important" }} />
            ) : (
              <PlayArrowRounded sx={{ fontSize: "18px !important" }} />
            )
          }
          onClick={(e) => {
            e.stopPropagation();
            onOpen(item);
          }}
          sx={{
            mt: 0.75,
            borderRadius: "8px",
            py: 0.75,
            fontWeight: 700,
            fontSize: 12.5,
            background:
              pct === 100
                ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                : C.gradientCrimson,
            color: "#ffffff",
            boxShadow:
              pct === 100
                ? "0 3px 10px rgba(16,185,129,0.25)"
                : "0 3px 10px rgba(139,19,19,0.22)",
            textTransform: "none",
            transition: "all 200ms ease",
            "&:hover": {
              background:
                pct === 100
                  ? "linear-gradient(135deg, #059669 0%, #047857 100%)"
                  : GRADIENTS.crimsonHover,
              boxShadow:
                pct === 100
                  ? "0 5px 14px rgba(16,185,129,0.35)"
                  : "0 5px 14px rgba(139,19,19,0.32)",
              transform: "translateY(-1px)",
            },
          }}
        >
          {pct === 100 ? "Xem lại" : "Tiếp tục học"}
        </Button>
      </Box>
    </Paper>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudentHomeContent() {
  const router = useRouter();
  const { fetchFavorites } = useFavorite();
  const user = useSelector((state: any) => state.auth.user);
  const roles = useSelector((state: any) => state.auth.roles) || [];
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleAvatarUpdate = () => {
      if (typeof window !== "undefined" && user?.email) {
        const stored = localStorage.getItem(`user_avatar_${user.email}`);
        if (stored) {
          setUserAvatar(stored);
        }
      }
    };
    window.addEventListener("avatar_updated", handleAvatarUpdate);
    handleAvatarUpdate();
    return () =>
      window.removeEventListener("avatar_updated", handleAvatarUpdate);
  }, [user?.email]);

  const [courseImages, setCourseImages] = useState<Record<string, string>>({});
  const [titleImages, setTitleImages] = useState<Record<string, string>>({});
  // Toàn bộ khóa học đã duyệt, máy chủ trả về sẵn theo thứ tự mới nhất trước
  const [latestCourses, setLatestCourses] = useState<any[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(
    new Set(),
  );
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"courses" | "assigned" | "paths">(
    "courses",
  );
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const tabsRef = useRef<HTMLDivElement>(null);

  // "Tiếp tục học": lấy trực tiếp từ danh sách khoahoc-list (latestCourses),
  // vì mỗi phần tử ở đó đã có sẵn daDangKy, phanTramHoanThanh, idDangKiKhoaHoc
  // do backend trả về theo đúng người dùng hiện tại.
  const continuingCourses = useMemo(() => {
    if (!latestCourses || !Array.isArray(latestCourses)) return [];
    return latestCourses.filter((c: any) => c.daDangKy === true);
  }, [latestCourses]);

  // Lọc danh sách "Khóa học mới nhất":
  // 1. Chỉ lấy khóa học được tạo trong 1 tháng gần nhất (30 ngày)
  // 2. Chỉ hiển thị khóa học người dùng chưa sở hữu, chưa đăng ký
  const filteredLatestCourses = useMemo(() => {
    if (!latestCourses || !Array.isArray(latestCourses)) return [];

    const enrolledIds = new Set<string>(enrolledCourseIds);
    continuingCourses.forEach((item) => {
      if (isValidGuid(item.id)) enrolledIds.add(String(item.id));
      if (isValidGuid(item.idKhoaHoc)) enrolledIds.add(String(item.idKhoaHoc));
      if (isValidGuid(item.idDangKiKhoaHoc))
        enrolledIds.add(String(item.idDangKiKhoaHoc));
      if (isValidGuid(item.idDangKyKhoaHoc))
        enrolledIds.add(String(item.idDangKyKhoaHoc));
    });
    if (data?.continueLearning?.courses) {
      data.continueLearning.courses.forEach((item: any) => {
        if (isValidGuid(item.id)) enrolledIds.add(String(item.id));
        if (isValidGuid(item.idKhoaHoc))
          enrolledIds.add(String(item.idKhoaHoc));
      });
    }

    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    oneMonthAgo.setHours(0, 0, 0, 0);

    return latestCourses
      .filter((c: any) => {
        // Loại bỏ nếu người dùng đã đăng ký / sở hữu khóa học
        if (
          c.daDangKy === true ||
          c.daDangKyKhoaHoc === true ||
          c.isEnrolled === true ||
          c.daMua === true
        ) {
          return false;
        }

        const courseId = String(c.id || c.idKhoaHoc || "");
        if (isValidGuid(courseId) && enrolledIds.has(courseId)) return false;
        if (
          isValidGuid(c.idDangKiKhoaHoc) &&
          enrolledIds.has(String(c.idDangKiKhoaHoc))
        ) {
          return false;
        }
        if (
          isValidGuid(c.idDangKyKhoaHoc) &&
          enrolledIds.has(String(c.idDangKyKhoaHoc))
        ) {
          return false;
        }

        // BẮT BUỘC: Khóa học phải được tạo trong vòng 1 tháng gần nhất
        const rawDate =
          c.ngayTao ||
          c.createdDate ||
          c.ngayTaoKhoaHoc ||
          c.createdAt ||
          c.created_at;

        if (!rawDate) return false;

        const date = new Date(rawDate);
        if (isNaN(date.getTime()) || date < oneMonthAgo) {
          return false;
        }

        return true;
      })
      .sort((a: any, b: any) => {
        const dateA = new Date(
          a.ngayTao || a.createdDate || a.createdAt || 0,
        ).getTime();
        const dateB = new Date(
          b.ngayTao || b.createdDate || b.createdAt || 0,
        ).getTime();
        return dateB - dateA;
      });
  }, [
    latestCourses,
    continuingCourses,
    enrolledCourseIds,
    data,
  ]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch approved courses to retrieve real image urls (bypassing dashboard endpoint omissions)
      if (roles.includes("Admin") || roles.includes("GiaoVien")) {
        try {
          const approvedRes = await apiService.get<any>(
            "/KhoaHoc/khoahoc-getlist-daduyet",
          );
          const items = approvedRes.data || [];
          const imgMap: Record<string, string> = {};
          const tMap: Record<string, string> = {};
          items.forEach((item: any) => {
            if (item.id && item.hinhAnhKhoaHoc) {
              imgMap[item.id] = item.hinhAnhKhoaHoc;
            }
            if (item.tieuDe && item.hinhAnhKhoaHoc) {
              tMap[item.tieuDe] = item.hinhAnhKhoaHoc;
            }
          });
          setCourseImages(imgMap);
          setTitleImages(tMap);
        } catch (err) {
          console.error("Failed to load course image map:", err);
        }
      }

      // Lấy danh sách khóa học người dùng đã đăng ký / sở hữu
      try {
        const myCoursesRes = await apiService.get<any>(
          "/KhoaHoc/khoahoc-dangki?pageIndex=1&pageSize=1000",
        );
        const myItems =
          myCoursesRes.data?.items ||
          myCoursesRes.data?.data ||
          myCoursesRes.data ||
          [];
        if (Array.isArray(myItems)) {
          const ids = new Set<string>();
          myItems.forEach((it: any) => {
            if (it.id) ids.add(String(it.id));
            if (it.idKhoaHoc) ids.add(String(it.idKhoaHoc));
            if (it.idDangKiKhoaHoc) ids.add(String(it.idDangKiKhoaHoc));
            if (it.idDangKyKhoaHoc) ids.add(String(it.idDangKyKhoaHoc));
          });
          setEnrolledCourseIds(ids);
        }
      } catch (err) {
        console.error("Failed to load enrolled courses:", err);
      }

      // Toàn bộ khóa học đã duyệt cho mục "Khóa học mới nhất" và "Tiếp tục học".
      // Endpoint khoahoc-list cho phép truy cập ẩn danh, đã lọc sẵn
      // TrangThaiPheDuyet = DaDuyet, sắp xếp giảm dần theo NgayTao, và trả kèm
      // daDangKy / phanTramHoanThanh / idDangKiKhoaHoc theo người dùng hiện tại.
      try {
        const listRes = await apiService.get<any>(
          "/KhoaHoc/khoahoc-list?pageIndex=1&pageSize=100",
        );
        const list = listRes.data?.items || listRes.data?.data || [];
        if (Array.isArray(list)) {
          setLatestCourses(list);
          // Tận dụng luôn ảnh từ danh sách này để bổ sung cho bản đồ ảnh
          setCourseImages((prev) => {
            const next = { ...prev };
            list.forEach((it: any) => {
              if (it?.id && it?.hinhAnhKhoaHoc && !next[it.id]) {
                next[it.id] = it.hinhAnhKhoaHoc;
              }
            });
            return next;
          });
        }
      } catch (err) {
        console.error("Failed to load latest courses:", err);
      }

      const res = await apiService.get<DashboardData>(
        "/dashboard?role=HocVien",
      );
      if (res.status && res.data) {
        setData(res.data);
      } else {
        setError(res.message ?? "Không thể tải dữ liệu.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    void fetchFavorites();
  }, [load, fetchFavorites]);

  const handleOpenCourse = useCallback(
    (course: KhoaHocDto) => {
      const courseId = course.id || (course as any).idKhoaHoc;
      if (!isValidGuid(courseId)) return;

      const hasValidDangKiId = isValidGuid(course.idDangKiKhoaHoc);
      const isEnrolled =
        course.daDangKy === true ||
        (hasValidDangKiId && (course as any).progress !== undefined);

      if (isEnrolled) {
        const learningId = hasValidDangKiId ? course.idDangKiKhoaHoc : courseId;
        router.push(`/student/courses/my-courses/learning/${learningId}`);
      } else {
        router.push(`/student/enroll-courses/${courseId}`);
      }
    },
    [router],
  );

  const handleAddCart = useCallback(async (course: KhoaHocDto) => {
    const id = isValidGuid(course.id)
      ? course.id
      : (course as any).idKhoaHoc || "";
    if (!isValidGuid(id)) return;
    try {
      await apiService.post(`/GioHang/${id}`);
    } catch {
      // silent
    }
    setAddedIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }, 2500);
  }, []);

  const goExplore = useCallback(
    () => router.push("/student/explore"),
    [router],
  );

  const openAssessments = useCallback(() => {
    setActiveTab("courses");
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <Stack spacing={4} sx={{ width: "100%", py: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: "16px",
            border: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Skeleton variant="circular" width={60} height={60} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width={260} height={26} />
            <Skeleton width={160} height={18} sx={{ mt: 1 }} />
          </Box>
        </Paper>
        <Grid container spacing={2.25}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" height={150} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" height={150} />
          </Grid>
        </Grid>
        <Box>
          <Skeleton width={200} height={26} sx={{ mb: 2 }} />
          <Box sx={{ display: "flex", gap: 2.5, overflow: "hidden" }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </Box>
        </Box>
      </Stack>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 5 },
          textAlign: "center",
          borderRadius: "20px",
          border: `1px solid ${C.primaryBorder}`,
          bgcolor: C.card,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.6,
          mt: 2,
        }}
      >
        <Typography sx={{ color: C.primary, fontWeight: 800, fontSize: 16 }}>
          {error ?? "Có lỗi xảy ra khi tải dữ liệu."}
        </Typography>
        <Typography sx={{ color: C.textSecondary, fontSize: 13.5 }}>
          Vui lòng thử lại. Nếu vẫn lỗi, kiểm tra kết nối mạng của bạn.
        </Typography>
        <Button
          onClick={() => void load()}
          startIcon={<RefreshRounded />}
          variant="contained"
          sx={{
            mt: 0.5,
            borderRadius: "11px",
            px: 2.6,
            py: 1,
            fontWeight: 800,
            bgcolor: C.primary,
            boxShadow: "none",
            "&:hover": { bgcolor: C.primaryDark, boxShadow: "none" },
          }}
        >
          Thử lại
        </Button>
      </Paper>
    );
  }

  const {
    welcomeStats,
    interestedSkills,
    historyRecommendation,
    promotedCourses,
  } = data;

  const emptyForTab: Record<string, { title: string; desc: string }> = {
    courses: {
      title: "Chưa có khóa học đang học",
      desc: "Khi bạn đăng ký và bắt đầu học, khóa học sẽ xuất hiện ở đây để tiếp tục.",
    },
    assigned: {
      title: "Chưa có khóa học được chỉ định",
      desc: "Các khóa học được chỉ định cho bạn sẽ hiển thị ở khu vực này.",
    },
    paths: {
      title: "Chưa có lộ trình học tập nào",
      desc: "Lộ trình học tập bạn tham gia sẽ xuất hiện tại đây.",
    },
  };

  return (
    <Stack spacing={4} sx={{ width: "100%", py: { xs: 1, md: 1.5 } }}>
      {/* ── 1. Welcome ─────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 3.5 },
          borderRadius: "16px",
          bgcolor: C.white,
          border: `1px solid ${C.border}`,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 4,
          flexWrap: "wrap",
          mb: 4,
        }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: "center", gap: 3, flex: 1, minWidth: 280 }}
        >
          <Avatar
            src={
              userAvatar ||
              user?.anhDaiDien ||
              welcomeStats?.avatarUrl ||
              undefined
            }
            sx={{
              width: 72,
              height: 72,
              bgcolor: C.primary,
              color: "#fff",
              fontWeight: 800,
              fontSize: 22,
              border: `3px solid ${C.white}`,
              boxShadow: `0 4px 12px rgba(139,19,19,0.1)`,
            }}
          >
            {initialsOf(user?.hoTen || welcomeStats?.userName)}
          </Avatar>
          <Box>
            <Typography
              sx={{
                fontSize: { xs: 20, md: 24 },
                fontWeight: 900,
                color: C.textDark,
                letterSpacing: "-0.5px",
                mb: 0.5,
              }}
            >
              Chào mừng {user?.hoTen || welcomeStats?.userName || "học viên"}{" "}
              trở lại!
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                color: C.textSecondary,
                fontWeight: 500,
                lineHeight: 1.5,
                maxWidth: 480,
              }}
            >
              {welcomeStats?.subtitle ||
                "Khám phá các khóa học mới và tiếp tục hành trình nâng cao tri thức của bạn ngay hôm nay."}
            </Typography>
          </Box>
        </Stack>

        {/* Right side stats */}
        <Stack
          direction="row"
          spacing={2}
          sx={{
            flexShrink: 0,
            width: { xs: "100%", sm: "auto" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {/* Courses Count */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: C.primaryTint,
              border: `1px solid ${C.primaryBorder}`,
              borderRadius: "12px",
              p: 2,
              minWidth: { xs: 90, sm: 110 },
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: C.white,
                borderColor: "rgba(139,19,19,0.12)",
                boxShadow: "0 6px 16px rgba(139,19,19,0.04)",
              },
            }}
          >
            <AutoStoriesRounded
              sx={{ color: C.primary, fontSize: 24, mb: 1 }}
            />
            <Typography
              sx={{ fontSize: 18, fontWeight: 800, color: C.textDark }}
            >
              {welcomeStats?.totalCourses || 0}
            </Typography>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: C.textSecondary,
                mt: 0.25,
              }}
            >
              Khóa học
            </Typography>
          </Box>

          {/* Progress Percent */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: C.primaryTint,
              border: `1px solid ${C.primaryBorder}`,
              borderRadius: "12px",
              p: 2,
              minWidth: { xs: 90, sm: 110 },
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: C.white,
                borderColor: "rgba(139,19,19,0.12)",
                boxShadow: "0 6px 16px rgba(139,19,19,0.04)",
              },
            }}
          >
            <AccessTimeRounded
              sx={{ color: STATUS.info, fontSize: 24, mb: 1 }}
            />
            <Typography
              sx={{ fontSize: 18, fontWeight: 800, color: C.textDark }}
            >
              {welcomeStats?.progressPercent || 0}%
            </Typography>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: C.textSecondary,
                mt: 0.25,
              }}
            >
              Tiến độ
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* ── 3. Tiếp tục học ─────────────────────────────────────────── */}
      <Box ref={tabsRef}>
        <SectionHeader title="Tiếp tục học" />
        {continuingCourses.length === 0 ? (
          <EmptyState
            icon={<InboxRounded />}
            title="Chưa có khóa học đang học"
            desc="Khi bạn đăng ký và bắt đầu học, khóa học sẽ xuất hiện ở đây để tiếp tục."
            actionLabel="Khám phá khóa học"
            onAction={goExplore}
          />
        ) : (
          <CarouselRow>
            {continuingCourses.map((item: any, i: number) => (
              <ContinueLearningCard
                key={item.idDangKiKhoaHoc || item.id || i}
                item={{
                  ...item,
                  phanTramHoanThanh: item.phanTramHoanThanh ?? 0,
                  idDangKiKhoaHoc: item.idDangKiKhoaHoc,
                  hinhAnhKhoaHoc:
                    item.hinhAnhKhoaHoc ||
                    courseImages[item.id || ""] ||
                    titleImages[item.tieuDe || item.title || ""],
                }}
                onOpen={handleOpenCourse}
              />
            ))}
          </CarouselRow>
        )}
      </Box>

      {/* ── 6. Khóa học mới nhất (chỉ khóa tạo trong 1 tháng & chưa đăng ký) ── */}
      {filteredLatestCourses.length > 0 && (
        <Box>
          <SectionHeader title="Khóa học mới nhất" />
          <CarouselRow>
            {filteredLatestCourses.map((c: any, i: number) => (
              <CourseCard
                key={c.id || i}
                course={{
                  ...c,
                  hinhAnhKhoaHoc:
                    c.hinhAnhKhoaHoc ||
                    courseImages[c.id || ""] ||
                    titleImages[c.tieuDe || ""],
                }}
                onAddCart={handleAddCart}
                onClick={handleOpenCourse}
              />
            ))}
          </CarouselRow>
        </Box>
      )}

      {/* ── Khóa học ưu đãi (voucher do Admin tạo) ──────────────────── */}
      {promotedCourses && promotedCourses.length > 0 && (
        <Box>
          <SectionHeader title="Khóa học ưu đãi" />
          <CarouselRow>
            {promotedCourses.map((c, i) => (
              <Box key={c.id || i} sx={{ position: "relative", flexShrink: 0 }}>
                <Chip
                  size="small"
                  sx={{
                    position: "absolute",
                    top: -10,
                    left: 10,
                    zIndex: 6,
                    bgcolor: STATUS.warning,
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: 10.5,
                    height: 22,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
                  }}
                />
                <CourseCard
                  course={{
                    ...c,
                    hinhAnhKhoaHoc:
                      c.hinhAnhKhoaHoc ||
                      courseImages[c.id || ""] ||
                      titleImages[c.tieuDe || ""],
                  }}
                  onAddCart={handleAddCart}
                  onClick={handleOpenCourse}
                />
              </Box>
            ))}
          </CarouselRow>
        </Box>
      )}

      {/* ── Cart toast ─────────────────────────────────────────────── */}
      {addedIds.size > 0 && (
        <Paper
          elevation={0}
          onClick={() => router.push("/student/cart")}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1600,
            px: 2.25,
            py: 1.5,
            borderRadius: "12px",
            bgcolor: C.textDark,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            cursor: "pointer",
            boxShadow: "0 12px 32px rgba(0,0,0,0.22)",
          }}
        >
          <CheckCircleRounded sx={{ color: C.ok, fontSize: 20 }} />
          <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>
            Đã thêm vào giỏ hàng
          </Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#FBBF24" }}>
            Xem giỏ →
          </Typography>
        </Paper>
      )}
    </Stack>
  );
}
