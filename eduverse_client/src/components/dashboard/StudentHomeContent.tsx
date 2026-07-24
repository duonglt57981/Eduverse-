/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
  FavoriteBorderRounded,
  FavoriteRounded,
  CheckCircleRounded,
  AccessTimeRounded,
  MenuBookRounded,
  ArrowForwardRounded,
  EditRounded,
  RefreshRounded,
  WorkspacePremiumRounded,
  AutoStoriesRounded,
  InboxRounded,
  PlayCircleFilledRounded,
} from "@mui/icons-material";

// ─── Palette (brand maroon, toned neutrals) ──────────────────────────────────
const C = {
  primary: "#8B1313",
  primaryDark: "#6D0F0F",
  primaryTint: "#FBEFEF",
  primaryBorder: "#F0DEDE",
  info: "#0284C7",
  infoTint: "#E4F1F8",
  white: "#FFFFFF",
  card: "#FFFFFF",
  border: "#ECE7E4",
  border2: "#E5E0DC",
  textDark: "#1F2937",
  textSecondary: "#6B7280",
  textMuted: "#9AA0A6",
  ok: "#10B981",
  okTint: "#E9F9F1",
  warn: "#F59E0B",
  gradientCrimson: "linear-gradient(90deg, #9f1717 0%, #7f1d1d 100%)",
};

const LEVEL_GRADIENT: Record<string, string> = {
  "Cơ bản": "linear-gradient(135deg, #10B981 0%, #059669 100%)",
  "Trung cấp": "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
  "Nâng cao": "linear-gradient(135deg, #8B1313 0%, #B91C1C 100%)",
  "Cao cấp": "linear-gradient(135deg, #7F1D1D 0%, #B91C1C 100%)",
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
  studentsCount?: number;
  level?: string;
  instructor?: string;
  title?: string;
  subtitle?: string;
  categoryNames?: string[];
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
  premiumSelection?: {
    title?: string;
    description?: string;
    instructor?: string;
    rating?: number;
    studentsCount?: number;
    thumbnailGradient?: string;
    relatedCourses?: KhoaHocDto[];
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

function getGradient(course: KhoaHocDto) {
  if (course.thumbnailGradient) return course.thumbnailGradient;
  return (
    LEVEL_GRADIENT[course.capDo ?? course.level ?? ""] ?? C.gradientCrimson
  );
}

function initialsOf(name?: string) {
  if (!name || name === "học viên") return "HV";
  const cleanName = name.trim();
  const parts = cleanName.split(/\s+/);
  if (parts.length === 0) return "HV";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
}

function roleLabel(roles: string[]) {
  if (roles.includes("Admin")) return "Quản trị viên";
  if (roles.includes("GiaoVien")) return "Giảng viên";
  return "Học viên";
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
            bgcolor: "#fff",
            boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
            border: "1px solid rgba(0,0,0,0.06)",
            width: 38,
            height: 38,
            "&:hover": { bgcolor: "#F3F4F6" },
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
            bgcolor: "#fff",
            boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
            border: "1px solid rgba(0,0,0,0.06)",
            width: 38,
            height: 38,
            "&:hover": { bgcolor: "#F3F4F6" },
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
        bgcolor: "#FCFBFA",
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
  const isFree = (course.gia ?? 0) === 0;
  

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
        bgcolor: C.white,
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
            {course.moTa}
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
            {fmtPrice(course.gia ?? 0)}
          </Typography>
          {course.giaGoc && course.giaGoc > (course.gia ?? 0) && (
            <Typography
              sx={{
                fontSize: 13,
                color: C.textMuted,
                textDecoration: "line-through",
                fontWeight: 600,
              }}
            >
              {course.giaGoc.toLocaleString("vi-VN")}đ
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
                router.push(`/hoc-vien/khoa-hoc-cua-toi/${course.id}`);
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
                  background:
                    "linear-gradient(90deg, #7f1d1d 0%, #681212 100%)",
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
              isFavorited(course.id) ? (
                <FavoriteRounded sx={{ color: C.primary }} />
              ) : (
                <FavoriteBorderRounded />
              )
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
  const gradient = getGradient(course);
  const isFree = (course.gia ?? 0) === 0;
  const title = course.tieuDe || course.title || "";
  // Chỉ hiển thị đánh giá khi có dữ liệu thật (không dùng giá trị bịa)
  const rating = course.rating ?? null;
  const students = course.soLuongHocVien ?? course.studentsCount ?? 0;

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
          borderRadius: "18px",
          overflow: "hidden",
          border: `1px solid ${C.border}`,
          bgcolor: C.white,
          cursor: "pointer",
          transition:
            "transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 32px rgba(139,19,19,0.10)",
            borderColor: C.primaryBorder,
          },
        }}
      >
        <Box
          sx={{
            height: 136,
            background: course.hinhAnhKhoaHoc
              ? `url(${course.hinhAnhKhoaHoc}) center/cover no-repeat`
              : gradient,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!course.hinhAnhKhoaHoc && (
            <Typography
              sx={{
                color: "#fff",
                fontSize: 20,
                fontWeight: 900,
                opacity: 0.12,
                userSelect: "none",
              }}
            >
              EduVerse
            </Typography>
          )}
          {(course.capDo || course.level) && (
            <Chip
              label={course.capDo || course.level}
              size="small"
              sx={{
                position: "absolute",
                top: 8,
                left: 8,
                bgcolor: "rgba(255,255,255,0.92)",
                color: C.primary,
                fontWeight: 800,
                fontSize: 10,
                height: 20,
              }}
            />
          )}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleFavorite(course.id, title);
            }}
            sx={{
              position: "absolute",
              top: 6,
              right: 8,
              width: 28,
              height: 28,
              bgcolor: "rgba(255, 255, 255, 0.95)",
              color: favorited ? C.primary : "rgba(31, 41, 55, 0.4)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              zIndex: 5,
              transition: "all 150ms ease",
              p: 0,
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 1)",
                color: C.primary,
                transform: "scale(1.08)",
              },
            }}
          >
            {favorited ? (
              <FavoriteRounded sx={{ fontSize: 16, color: C.primary }} />
            ) : (
              <FavoriteBorderRounded sx={{ fontSize: 16 }} />
            )}
          </IconButton>
          {course.daDangKy && (
            <Chip
              icon={<CheckCircleRounded sx={{ fontSize: "12px !important" }} />}
              label="Đã học"
              size="small"
              sx={{
                position: "absolute",
                bottom: 8,
                left: 8,
                bgcolor: C.ok,
                color: "#fff",
                fontWeight: 800,
                fontSize: 10,
                height: 20,
                "& .MuiChip-icon": { color: "#fff !important" },
              }}
            />
          )}
          {!course.daDangKy && isFree && (
            <Chip
              label="MIỄN PHÍ"
              size="small"
              sx={{
                position: "absolute",
                bottom: 8,
                left: 8,
                bgcolor: C.ok,
                color: "#fff",
                fontWeight: 900,
                fontSize: 9.5,
                height: 18,
              }}
            />
          )}
        </Box>

        <Box sx={{ p: 1.75 }}>
          <Typography
            sx={{
              fontSize: 13.5,
              fontWeight: 800,
              lineHeight: 1.4,
              height: 38,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              color: C.textDark,
              mb: 0.5,
            }}
          >
            {title}
          </Typography>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mb: 1.25, flexWrap: "wrap", gap: 0.5 }}
          >
            {course.tongBaiGiang != null && (
              <Typography
                sx={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}
              >
                📖 {course.tongBaiGiang} bài
              </Typography>
            )}
            {course.tongThoiLuong != null && (
              <Typography
                sx={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}
              >
                ⏱ {fmtDuration(course.tongThoiLuong)}
              </Typography>
            )}
          </Stack>

          <Divider sx={{ mb: 1.25, opacity: 0.45 }} />

          <Stack
            direction="row"
            sx={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 14.5,
                  fontWeight: 900,
                  color: isFree ? C.ok : C.primary,
                }}
              >
                {fmtPrice(course.gia ?? 0)}
              </Typography>
              {course.giaGoc && course.giaGoc > (course.gia ?? 0) && (
                <Typography
                  sx={{
                    fontSize: 10.5,
                    color: C.textMuted,
                    textDecoration: "line-through",
                    fontWeight: 600,
                  }}
                >
                  {course.giaGoc.toLocaleString("vi-VN")}đ
                </Typography>
              )}
            </Box>
            {students > 0 ? (
              <Stack
                direction="row"
                spacing={0.4}
                sx={{ alignItems: "center" }}
              >
                <PeopleAltRounded sx={{ fontSize: 13, color: C.textMuted }} />
                <Typography
                  sx={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}
                >
                  {students.toLocaleString()}
                </Typography>
              </Stack>
            ) : rating != null && rating > 0 ? (
              <Stack
                direction="row"
                spacing={0.4}
                sx={{ alignItems: "center" }}
              >
                <StarRounded sx={{ fontSize: 14, color: C.warn }} />
                <Typography
                  sx={{ fontSize: 11.5, fontWeight: 700, color: C.textDark }}
                >
                  {rating}
                </Typography>
              </Stack>
            ) : null}
          </Stack>
        </Box>
      </Paper>

      {hovered && (
        <HoverPanel
          course={course}
          anchorEl={cardRef}
          onAddCart={onAddCart}
          onMouseEnter={handlePanelEnter}
          onMouseLeave={handlePanelLeave}
        />
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

// ─── Continue-learning progress card ─────────────────────────────────────────
function ContinueLearningCard({
  item,
  onOpen,
}: {
  item: KhoaHocDto;
  onOpen: (c: KhoaHocDto) => void;
}) {
  const title = item.tieuDe || item.title || "";
  const gradient = getGradient(item);
  const pct = Math.max(
    0,
    Math.min(100, Math.round(item.phanTramHoanThanh ?? item.progress ?? 0)),
  );
  const done = item.soBaiGiangHoanThanh;
  const total = item.tongBaiGiang;

  return (
    <Paper
      elevation={0}
      onClick={() => onOpen(item)}
      sx={{
        display: "flex",
        gap: 1.75,
        p: 1.5,
        borderRadius: "14px",
        border: `1px solid ${C.border}`,
        bgcolor: C.white,
        cursor: "pointer",
        transition:
          "transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 12px 32px rgba(139,19,19,0.10)",
          borderColor: C.primaryBorder,
        },
      }}
    >
      <Box
        sx={{
          width: 116,
          height: 80,
          borderRadius: "10px",
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
          background: item.hinhAnhKhoaHoc
            ? `url(${item.hinhAnhKhoaHoc}) center/cover no-repeat`
            : gradient,
          display: "grid",
          placeItems: "center",
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.92)",
            color: C.primary,
            display: "grid",
            placeItems: "center",
          }}
        >
          <PlayArrowRounded />
        </Box>
      </Box>
      <Box
        sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}
      >
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 800,
            color: C.textDark,
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </Typography>
        {done != null && total != null && (
          <Typography sx={{ fontSize: 11.5, color: C.textMuted, mt: 0.4 }}>
            {done}/{total} bài giảng
          </Typography>
        )}
        <Box
          sx={{
            mt: "auto",
            pt: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              flex: 1,
              height: 6,
              borderRadius: 99,
              bgcolor: "#EEE9E5",
              "& .MuiLinearProgress-bar": { bgcolor: C.ok, borderRadius: 99 },
            }}
          />
          <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: C.ok }}>
            {pct}%
          </Typography>
        </Box>
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

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "courses" | "assigned" | "paths" | "certs" | "tests"
  >("courses");
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [showFullPremiumDescription, setShowFullPremiumDescription] = useState(false);
  const [premiumDescriptionHtml, setPremiumDescriptionHtml] = useState("");
  const tabsRef = useRef<HTMLDivElement>(null);
  const skillScrollRef = useRef<HTMLDivElement>(null);

  const scrollSkills = (direction: -1 | 1) => {
    skillScrollRef.current?.scrollBy({
      left: direction * Math.min(skillScrollRef.current.clientWidth * 0.75, 640),
      behavior: "smooth",
    });
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.get<DashboardData>(
        "/dashboard?role=HocVien",
      );
      if (res.status && res.data) {
        setData(res.data);
        setPremiumDescriptionHtml(
          DOMPurify.sanitize(res.data.premiumSelection?.description || ""),
        );
        setShowFullPremiumDescription(false);
        if (res.data.interestedSkills?.length) {
          setSelectedSkill(res.data.interestedSkills[0]);
        }
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
      const id = course.id || course.idDangKiKhoaHoc;
      if (!id) return;
      router.push(`/student/enroll-courses/${id}`);
    },
    [router],
  );

  const handleAddCart = useCallback(async (course: KhoaHocDto) => {
    const id = course.id || course.idDangKiKhoaHoc || "";
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
    setActiveTab("tests");
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const filteredSkillCourses = useMemo(() => {
    if (!data?.skillsCourses) return [];
    if (!selectedSkill) return data.skillsCourses;
    return data.skillsCourses.filter((course) =>
      course.categoryNames?.includes(selectedSkill),
    );
  }, [selectedSkill, data]);

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
          bgcolor: "#FFF7F7",
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
    continueLearning,
    interestedSkills,
    premiumSelection,
    historyRecommendation,
  } = data;

  const tabItems: KhoaHocDto[] = (() => {
    switch (activeTab) {
      case "courses":
        return continueLearning?.courses ?? [];
      case "paths":
        return continueLearning?.paths ?? [];
      case "certs":
        return continueLearning?.certificates ?? [];
      case "tests":
        return continueLearning?.assessments ?? [];
      default:
        return [];
    }
  })();

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
    certs: {
      title: "Chưa có chứng chỉ nào",
      desc: "Hoàn thành khóa học để nhận chứng chỉ và theo dõi tại đây.",
    },
    tests: {
      title: "Chưa có bài đánh giá nào",
      desc: "Khi bạn tham gia bài đánh giá kỹ năng, kết quả sẽ hiển thị ở đây.",
    },
  };

  return (
    <Stack spacing={4} sx={{ width: "100%", py: { xs: 1, md: 1.5 } }}>
      {/* ── 1. Welcome ─────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: "24px",
          bgcolor: C.white,
          border: `1px solid rgba(139,19,19,0.08)`,
          background:
            "linear-gradient(135deg, rgba(139,19,19,0.02) 0%, rgba(255,255,255,1) 100%)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.02)",
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
              border: "3px solid #fff",
              boxShadow: `0 0 0 3px rgba(139,19,19,0.12), 0 8px 24px rgba(139,19,19,0.12)`,
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
              trở lại! 👋
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
              bgcolor: "rgba(139,19,19,0.03)",
              border: "1px solid rgba(139,19,19,0.06)",
              borderRadius: "16px",
              p: 2,
              minWidth: { xs: 90, sm: 110 },
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 6px 20px rgba(139,19,19,0.06)",
                borderColor: "rgba(139,19,19,0.15)",
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
              bgcolor: "rgba(139,19,19,0.03)",
              border: "1px solid rgba(139,19,19,0.06)",
              borderRadius: "16px",
              p: 2,
              minWidth: { xs: 90, sm: 110 },
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 6px 20px rgba(139,19,19,0.06)",
                borderColor: "rgba(139,19,19,0.15)",
              },
            }}
          >
            <AccessTimeRounded sx={{ color: C.primary, fontSize: 24, mb: 1 }} />
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

          {/* Certificates Count */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(139,19,19,0.03)",
              border: "1px solid rgba(139,19,19,0.06)",
              borderRadius: "16px",
              p: 2,
              minWidth: { xs: 90, sm: 110 },
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 6px 20px rgba(139,19,19,0.06)",
                borderColor: "rgba(139,19,19,0.15)",
              },
            }}
          >
            <WorkspacePremiumRounded
              sx={{ color: C.primary, fontSize: 24, mb: 1 }}
            />
            <Typography
              sx={{ fontSize: 18, fontWeight: 800, color: C.textDark }}
            >
              {welcomeStats?.certificatesCount || 0}
            </Typography>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: C.textSecondary,
                mt: 0.25,
              }}
            >
              Chứng chỉ
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* ── 2. Gợi ý học tập (2 card sáng, nhấn đỏ đô) ──────────────── */}
      <Grid container spacing={2.25}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              position: "relative",
              overflow: "hidden",
              height: "100%",
              p: { xs: 2.5, md: 3 },
              borderRadius: "16px",
              border: `1px solid ${C.border}`,
              bgcolor: C.white,
              "&::before": {
                content: '""',
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 5,
                bgcolor: C.primary,
              },
              display: "flex",
              flexDirection: "column",
              gap: 1.25,
            }}
          >
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "12px",
                bgcolor: C.primaryTint,
                color: C.primary,
                display: "grid",
                placeItems: "center",
              }}
            >
              <PsychologyRounded />
            </Box>
            <Typography
              sx={{ fontSize: 17, fontWeight: 800, color: C.textDark }}
            >
              Kỹ năng AI phù hợp với bạn
            </Typography>
            <Typography sx={{ fontSize: 13.5, color: C.textSecondary }}>
              Đi trước xu hướng với các khóa học AI giúp nâng cao sự nghiệp của
              bạn.
            </Typography>
            <Button
              onClick={goExplore}
              variant="contained"
              endIcon={<ArrowForwardRounded />}
              sx={{
                mt: 0.5,
                alignSelf: "flex-start",
                borderRadius: "11px",
                px: 2.2,
                py: 1,
                fontWeight: 800,
                fontSize: 13.5,
                bgcolor: C.primary,
                boxShadow: "none",
                "&:hover": { bgcolor: C.primaryDark, boxShadow: "none" },
              }}
            >
              Khám phá khóa học AI
            </Button>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              position: "relative",
              overflow: "hidden",
              height: "100%",
              p: { xs: 2.5, md: 3 },
              borderRadius: "16px",
              border: `1px solid ${C.border}`,
              bgcolor: C.white,
              "&::before": {
                content: '""',
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 5,
                bgcolor: C.info,
              },
              display: "flex",
              flexDirection: "column",
              gap: 1.25,
            }}
          >
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "12px",
                bgcolor: C.infoTint,
                color: C.info,
                display: "grid",
                placeItems: "center",
              }}
            >
              <QuizRounded />
            </Box>
            <Typography
              sx={{ fontSize: 17, fontWeight: 800, color: C.textDark }}
            >
              Kiểm tra kỹ năng của bạn
            </Typography>
            <Typography sx={{ fontSize: 13.5, color: C.textSecondary }}>
              Khám phá điểm mạnh và nhận định hướng nên học tiếp theo qua các
              bài đánh giá.
            </Typography>
            <Button
              onClick={openAssessments}
              variant="contained"
              endIcon={<ArrowForwardRounded />}
              sx={{
                mt: 0.5,
                alignSelf: "flex-start",
                borderRadius: "11px",
                px: 2.2,
                py: 1,
                fontWeight: 800,
                fontSize: 13.5,
                bgcolor: C.info,
                boxShadow: "none",
                "&:hover": { bgcolor: "#026aa5", boxShadow: "none" },
              }}
            >
              Khám phá bài đánh giá
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* ── 3. Tiếp tục học + tabs ──────────────────────────────────── */}
      <Box ref={tabsRef}>
        <SectionHeader
          title="Tiếp tục học"
          linkText="Học tập"
          href="/student/courses"
        />
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: 44,
            mb: 2.5,
            borderBottom: `1px solid ${C.border}`,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              fontSize: 14,
              color: C.textSecondary,
              minHeight: 44,
              px: 1.75,
            },
            "& .Mui-selected": { color: `${C.primary} !important` },
            "& .MuiTabs-indicator": {
              backgroundColor: C.primary,
              height: 3,
              borderRadius: 3,
            },
          }}
        >
          <Tab value="courses" label="Khóa học" />
          <Tab value="assigned" label="Các khóa học được chỉ định" />
          <Tab value="paths" label="Lộ trình học tập" />
          <Tab value="certs" label="Luyện thi chứng chỉ" />
          <Tab value="tests" label="Bài đánh giá" />
        </Tabs>

        {activeTab === "assigned" || tabItems.length === 0 ? (
          <EmptyState
            icon={<InboxRounded />}
            title={emptyForTab[activeTab].title}
            desc={emptyForTab[activeTab].desc}
            actionLabel="Khám phá khóa học"
            onAction={goExplore}
          />
        ) : activeTab === "courses" ? (
          <Grid container spacing={2}>
            {tabItems.map((item, i) => (
              <Grid
                key={item.id || item.idDangKiKhoaHoc || i}
                size={{ xs: 12, md: 6 }}
              >
                <ContinueLearningCard item={item} onOpen={handleOpenCourse} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <CarouselRow>
            {tabItems.map((item, i) => (
              <CourseCard
                key={item.id || i}
                course={item}
                onAddCart={handleAddCart}
                onClick={handleOpenCourse}
              />
            ))}
          </CarouselRow>
        )}
      </Box>

      {/* ── 4. Lĩnh vực sẽ học tiếp theo (data-gated) ───────────────── */}
      {/* ── 5. Khóa học theo kỹ năng (data-gated) ───────────────────── */}
      {interestedSkills && interestedSkills.length > 0 && (
        <Box>
          <SectionHeader
            title="Dựa trên kỹ năng bạn quan tâm"
            linkText="Chỉnh sửa"
            href="/student/profile"
          />
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", mb: 1.5, minWidth: 0 }}
          >
            <IconButton
              aria-label="Xem kỹ năng phía trước"
              onClick={() => scrollSkills(-1)}
              size="small"
              sx={{
                flexShrink: 0,
                border: `1px solid ${C.border2}`,
                bgcolor: C.white,
                color: C.primary,
                boxShadow: "0 4px 12px rgba(31, 41, 55, 0.06)",
                "&:hover": { bgcolor: C.primaryTint },
              }}
            >
              <ChevronLeftRounded />
            </IconButton>

            <Stack
              ref={skillScrollRef}
              direction="row"
              spacing={1}
              sx={{
                flex: 1,
                minWidth: 0,
                overflowX: "auto",
                scrollBehavior: "smooth",
                scrollSnapType: "x proximity",
                py: 0.5,
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              {interestedSkills.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  onClick={() => setSelectedSkill(skill)}
                  sx={{
                    flexShrink: 0,
                    scrollSnapAlign: "start",
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: "pointer",
                    bgcolor: selectedSkill === skill ? C.primary : "#fff",
                    color: selectedSkill === skill ? "#fff" : C.textSecondary,
                    border: `1px solid ${selectedSkill === skill ? C.primary : C.border2}`,
                    "&:hover": {
                      bgcolor: selectedSkill === skill ? C.primaryDark : C.primaryTint,
                    },
                  }}
                />
              ))}
            </Stack>

            <IconButton
              aria-label="Xem thêm kỹ năng"
              onClick={() => scrollSkills(1)}
              size="small"
              sx={{
                flexShrink: 0,
                border: `1px solid ${C.border2}`,
                bgcolor: C.white,
                color: C.primary,
                boxShadow: "0 4px 12px rgba(31, 41, 55, 0.06)",
                "&:hover": { bgcolor: C.primaryTint },
              }}
            >
              <ChevronRightRounded />
            </IconButton>
          </Stack>
          {filteredSkillCourses.length > 0 ? (
            <CarouselRow>
              {filteredSkillCourses.map((c, i) => (
                <CourseCard
                  key={c.id || i}
                  course={c}
                  onAddCart={handleAddCart}
                  onClick={handleOpenCourse}
                />
              ))}
            </CarouselRow>
          ) : (
            <EmptyState
              title="Không có khóa học phù hợp với kỹ năng này"
              desc="Thử chọn một kỹ năng khác hoặc khám phá thêm khóa học."
              actionLabel="Khám phá khóa học"
              onAction={goExplore}
            />
          )}
        </Box>
      )}

      {/* ── 6. Lựa chọn hàng đầu (data-gated) ───────────────────────── */}
      {premiumSelection && (
        <Box>
          <SectionHeader title="Lựa chọn hàng đầu cho bạn" />
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  minHeight: 200,
                  borderRadius: "16px",
                  overflow: "hidden",
                  position: "relative",
                  p: { xs: 3, md: 3.5 },
                  color: "#fff",
                  background:
                    premiumSelection.thumbnailGradient || C.gradientCrimson,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                <Chip
                  icon={
                    <WorkspacePremiumRounded
                      sx={{
                        color: "#fff !important",
                        fontSize: "15px !important",
                      }}
                    />
                  }
                  label="LỰA CHỌN HÀNG ĐẦU"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    bgcolor: "rgba(255,255,255,0.18)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 10.5,
                  }}
                />
                <Typography
                  sx={{ fontSize: 20, fontWeight: 900, lineHeight: 1.3 }}
                >
                  {premiumSelection.title}
                </Typography>
                {premiumSelection.instructor && (
                  <Typography sx={{ fontSize: 13, opacity: 0.9, mt: 0.5 }}>
                    {premiumSelection.instructor}
                  </Typography>
                )}
                <Stack direction="row" spacing={2} sx={{ mt: 1.25 }}>
                  {premiumSelection.rating != null &&
                    premiumSelection.rating > 0 && (
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ alignItems: "center" }}
                      >
                        <StarRounded sx={{ fontSize: 16, color: "#FBBF24" }} />
                        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                          {premiumSelection.rating}
                        </Typography>
                      </Stack>
                    )}
                  {premiumSelection.studentsCount != null &&
                    premiumSelection.studentsCount > 0 && (
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ alignItems: "center" }}
                      >
                        <PeopleAltRounded sx={{ fontSize: 16 }} />
                        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                          {premiumSelection.studentsCount.toLocaleString()}
                        </Typography>
                      </Stack>
                    )}
                </Stack>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              {premiumSelection.description && (
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      position: "relative",
                      maxHeight: showFullPremiumDescription ? "none" : 190,
                      overflow: "hidden",
                      fontSize: 14,
                      color: C.textSecondary,
                      lineHeight: 1.7,
                      "& h1, & h2, & h3": {
                        color: C.textDark,
                        fontSize: 16,
                        lineHeight: 1.4,
                        mt: 1.25,
                        mb: 0.75,
                      },
                      "& p": { my: 0.75 },
                      "& ul, & ol": { my: 0.75, pl: 2.5 },
                      "& li": { mb: 0.35 },
                      "& hr": { border: 0, borderTop: `1px solid ${C.border}`, my: 1.25 },
                      ...(!showFullPremiumDescription && {
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          right: 0,
                          bottom: 0,
                          height: 64,
                          pointerEvents: "none",
                          background:
                            "linear-gradient(180deg, rgba(247,245,242,0) 0%, #F7F5F2 88%)",
                        },
                      }),
                    }}
                    dangerouslySetInnerHTML={{ __html: premiumDescriptionHtml }}
                  />
                  <Button
                    size="small"
                    onClick={() => setShowFullPremiumDescription((current) => !current)}
                    endIcon={
                      showFullPremiumDescription
                        ? <ChevronLeftRounded sx={{ transform: "rotate(90deg)" }} />
                        : <ChevronRightRounded sx={{ transform: "rotate(90deg)" }} />
                    }
                    sx={{
                      mt: 0.75,
                      px: 0,
                      minWidth: 0,
                      color: C.primary,
                      fontWeight: 800,
                      textTransform: "none",
                      "&:hover": { bgcolor: "transparent", color: C.primaryDark },
                    }}
                  >
                    {showFullPremiumDescription ? "Thu gọn" : "Xem tất cả"}
                  </Button>
                </Box>
              )}
              {premiumSelection.relatedCourses &&
              premiumSelection.relatedCourses.length > 0 ? (
                <CarouselRow>
                  {premiumSelection.relatedCourses.map((c, i) => (
                    <CourseCard
                      key={c.id || i}
                      course={c}
                      onAddCart={handleAddCart}
                      onClick={handleOpenCourse}
                      width={220}
                    />
                  ))}
                </CarouselRow>
              ) : (
                <Button
                  onClick={goExplore}
                  variant="outlined"
                  endIcon={<ArrowForwardRounded />}
                  sx={{
                    borderRadius: "11px",
                    fontWeight: 800,
                    color: C.primary,
                    borderColor: C.primaryBorder,
                    "&:hover": {
                      borderColor: C.primary,
                      bgcolor: C.primaryTint,
                    },
                  }}
                >
                  Khám phá thêm khóa học
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ── 7. Gợi ý theo lịch sử (data-gated) ──────────────────────── */}
      {historyRecommendation &&
        historyRecommendation.courses &&
        historyRecommendation.courses.length > 0 && (
          <Box>
            <SectionHeader
              title={
                historyRecommendation.basedOnCourse
                  ? `Vì bạn đã học "${historyRecommendation.basedOnCourse}"`
                  : "Gợi ý cho bạn"
              }
            />
            <CarouselRow>
              {historyRecommendation.courses.map((c, i) => (
                <CourseCard
                  key={c.id || i}
                  course={c}
                  onAddCart={handleAddCart}
                  onClick={handleOpenCourse}
                />
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
