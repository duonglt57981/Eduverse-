"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/src/services/index";
import { useFavorite } from "@/src/features/favorite/hooks/useFavorite";
import { useSelector } from "@/src/store/hook";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  Avatar,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  StarRounded,
  SchoolRounded,
  PeopleAltRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  MoreVertRounded,
  LocalFireDepartmentRounded,
  InfoOutlined,
  PlayCircleOutlineRounded,
  ArticleOutlined,
  PsychologyRounded,
  CloudQueueRounded,
  TrendingUpRounded,
  AutoAwesomeRounded,
  QuizRounded,
  ShoppingCartRounded,
  FavoriteBorderRounded,
  FavoriteRounded,
  CheckCircleRounded,
  AccessTimeRounded,
  MenuBookRounded,
  ArrowForwardRounded,
  WorkspacePremiumRounded,
} from "@mui/icons-material";

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  primary: "#8B1313",
  primaryLight: "#B91C1C",
  primaryDark: "#7F1D1D",
  white: "var(--ev-paper, #FFFFFF)",
  textDark: "var(--ev-text-primary, #1F2937)",
  textSecondary: "var(--ev-text-secondary, #4B5563)",
  gradientAI: "linear-gradient(135deg, #8B1313 0%, #7C3AED 100%)",
  gradientTeal: "linear-gradient(135deg, #0D9488 0%, #005F55 100%)",
  gradientCrimson: "linear-gradient(90deg, #9f1717 0%, #7f1d1d 100%)",
  purpleAI: "#7C3AED",
};

// ─── Level gradient map ───────────────────────────────────────────────────────
const LEVEL_GRADIENT: Record<string, string> = {
  "Cơ bản": "linear-gradient(135deg, #10B981 0%, #059669 100%)",
  "Trung cấp": "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
  "Nâng cao": "linear-gradient(135deg, #8B1313 0%, #7C3AED 100%)",
  "Cao cấp": "linear-gradient(135deg, #8B1313 0%, #7C3AED 100%)",
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
  // For continue learning items
  idDangKiKhoaHoc?: string;
  soBaiGiangHoanThanh?: number;
  phanTramHoanThanh?: number;
  // Dashboard-specific fields
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
  return "#F1F5F9";
}

function isValidImage(url?: string): boolean {
  if (!url) return false;
  const t = url.trim();
  if (!t || t === "không có" || t === "aaaaaaaa" || t === "string" || t === "null" || t === "undefined") return false;
  return t.startsWith("http") || t.startsWith("/") || t.startsWith(".");
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
            bgcolor: "var(--ev-paper, #FFFFFF)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
            border: "1px solid rgba(0,0,0,0.06)",
            width: 38,
            height: 38,
            "&:hover": { bgcolor: "var(--ev-paper-alt, #F3F4F6)" },
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
            bgcolor: "var(--ev-paper, #FFFFFF)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
            border: "1px solid rgba(0,0,0,0.06)",
            width: 38,
            height: 38,
            "&:hover": { bgcolor: "var(--ev-paper-alt, #F3F4F6)" },
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

  useEffect(() => {
  const update = () => {
    const el = anchorEl.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const PANEL_WIDTH = 310;
    const GAP = 12;

    // Thử hiện bên phải trước
    let left = rect.right + GAP;

    // Nếu tràn phải → hiện bên trái
    if (left + PANEL_WIDTH > window.innerWidth - 8) {
      left = rect.left - PANEL_WIDTH - GAP;
    }

    // Nếu vẫn tràn trái → căn giữa màn hình
    if (left < 8) {
      left = Math.max(8, (window.innerWidth - PANEL_WIDTH) / 2);
    }

    // Tính top
    let top = rect.top + window.scrollY; // ← thêm scrollY
    const PANEL_HEIGHT = 420;
    if (rect.top + PANEL_HEIGHT > window.innerHeight) {
      top = window.scrollY + window.innerHeight - PANEL_HEIGHT - 8;
    }
    if (top < window.scrollY + 8) {
      top = window.scrollY + 8;
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
        animation: "fadeIn 150ms ease",
        "@keyframes fadeIn": {
          from: { opacity: 0, transform: "translateX(-8px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
      }}
    >
      <Box sx={{ height: 5, background: gradient }} />
      <Box sx={{ p: 2.5 }}>
        {/* Level + type */}
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
                bgcolor: "rgba(141,19,19,0.07)",
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
                color: "var(--ev-text-muted, rgba(31,41,55,0.45))",
                fontWeight: 600,
                lineHeight: "20px",
              }}
            >
              {course.loaiKhoaHoc}
            </Typography>
          )}
        </Stack>

        {/* Title */}
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

        {/* Meta */}
        <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
          {course.tongThoiLuong != null && (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              <AccessTimeRounded
                sx={{ fontSize: 13, color: "var(--ev-text-muted, rgba(31,41,55,0.4))" }}
              />
              <Typography
                sx={{
                  fontSize: 11.5,
                  color: "var(--ev-text-muted, rgba(31,41,55,0.5))",
                  fontWeight: 600,
                }}
              >
                {fmtDuration(course.tongThoiLuong)}
              </Typography>
            </Stack>
          )}
          {course.tongBaiGiang != null && (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              <MenuBookRounded
                sx={{ fontSize: 13, color: "var(--ev-text-muted, rgba(31,41,55,0.4))" }}
              />
              <Typography
                sx={{
                  fontSize: 11.5,
                  color: "var(--ev-text-muted, rgba(31,41,55,0.5))",
                  fontWeight: 600,
                }}
              >
                {course.tongBaiGiang} bài giảng
              </Typography>
            </Stack>
          )}
        </Stack>

        {/* Mô tả */}
        {course.moTa && (
          <Typography
            sx={{
              fontSize: 12.5,
              color: "var(--ev-text-secondary, rgba(31,41,55,0.6))",
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

        {/* Price */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "baseline", mb: 2 }}
        >
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 900,
              color: isFree ? "#10B981" : C.primary,
            }}
          >
            {fmtPrice(course.gia ?? 0)}
          </Typography>
          {course.giaGoc && course.giaGoc > (course.gia ?? 0) && (
            <Typography
              sx={{
                fontSize: 13,
                color: "var(--ev-text-muted, rgba(31,41,55,0.35))",
                textDecoration: "line-through",
                fontWeight: 600,
              }}
            >
              {course.giaGoc.toLocaleString("vi-VN")}đ
            </Typography>
          )}
        </Stack>

        {/* CTA */}
        <Stack spacing={1.2}>
          {course.daDangKy ? (
            <Button
              fullWidth
              variant="contained"
              startIcon={<CheckCircleRounded />}
              disabled
              onClick={(e) => e.stopPropagation()}
              sx={{
                borderRadius: "12px",
                py: 1.1,
                fontWeight: 800,
                fontSize: 13.5,
                bgcolor: "#10B981",
                "&.Mui-disabled": {
                  bgcolor: "#10B981",
                  color: "#FFFFFF",
                  opacity: 0.85,
                },
              }}
            >
              Đã đăng ký
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
                color: "#FFFFFF",
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
                <FavoriteRounded sx={{ color: "#8B1313" }} />
              ) : (
                <FavoriteBorderRounded />
              )
            }
            sx={{
              borderRadius: "12px",
              py: 1,
              fontWeight: 700,
              fontSize: 13,
              borderColor: "rgba(141,19,19,0.2)",
              color: C.primary,
              "&:hover": {
                borderColor: C.primary,
                bgcolor: "rgba(141,19,19,0.03)",
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

// ─── Course Card (Carousel item, fixed width, uniform) ───────────────────────
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
  const isFree =
    course.loaiKhoaHoc !== "Khóa học trả phí" &&
    (!course.gia || course.gia <= 0);
  const displayPrice = course.gia ?? course.giaGoc ?? (course as Record<string, unknown>).giagoc as number ?? 0;
  const title = course.tieuDe || course.title || "";
  const rating = course.rating ?? 4.8;
  const students = course.soLuongHocVien ?? course.studentsCount ?? 0;

  const handleCardEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);

    setHoverCard(true);
    setHovered(true);
  };

  const handleCardLeave = () => {
    setHoverCard(false);

    leaveTimer.current = setTimeout(() => {
      if (!hoverPanel) {
        setHovered(false);
      }
    }, 150);
  };

  const handlePanelEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);

    setHoverPanel(true);
  };

  const handlePanelLeave = () => {
    setHoverPanel(false);

    leaveTimer.current = setTimeout(() => {
      if (!hoverCard) {
        setHovered(false);
      }
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
          border: "1px solid rgba(0,0,0,0.07)",
          bgcolor: C.white,
          cursor: "pointer",
          transition:
            "transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 32px rgba(141,19,19,0.08)",
            borderColor: "rgba(141,19,19,0.15)",
          },
        }}
      >
        {/* Thumbnail */}
        <Box
          sx={{
            height: 136,
            background: isValidImage(course.hinhAnhKhoaHoc)
              ? `url(${course.hinhAnhKhoaHoc}) center/cover no-repeat`
              : "#F1F5F9",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!isValidImage(course.hinhAnhKhoaHoc) && (
            <Stack sx={{ alignItems: "center", justifyContent: "center" }}>
              <SchoolRounded sx={{ color: "var(--ev-text-muted, #94A3B8)", fontSize: 32 }} />
              <Typography
                sx={{
                  color: "var(--ev-text-muted, #94A3B8)",
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
          {(course.capDo || course.level) && (
            <Chip
              label={course.capDo || course.level}
              size="small"
              sx={{
                position: "absolute",
                top: 8,
                right: 42,
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
              top: 5,
              right: 8,
              width: 26,
              height: 26,
              bgcolor: "rgba(255, 255, 255, 0.95)",
              color: favorited ? "#8B1313" : "rgba(31, 41, 55, 0.4)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              zIndex: 5,
              transition: "all 150ms ease",
              p: 0,
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 1)",
                color: "#8B1313",
                transform: "scale(1.08)",
              },
            }}
          >
            {favorited ? (
              <FavoriteRounded sx={{ fontSize: 16, color: "#8B1313" }} />
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
                top: 8,
                left: 8,
                bgcolor: "#10B981",
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: 10,
                height: 20,
                "& .MuiChip-icon": { color: "#fff !important" },
              }}
            />
          )}
          {isFree && (
            <Chip
              label={
                (course.gia ?? 0) === 0
                  ? "MIỄN PHÍ"
                  : `${course.gia?.toLocaleString("vi-VN")}₫`
              }
              size="small"
              sx={{
                position: "absolute",
                bottom: 8,
                left: 8,
                bgcolor: (course.gia ?? 0) === 0 ? "#10B981" : "#8B1313",
                color: "#FFFFFF",
                fontWeight: 900,
                fontSize: 9.5,
                height: 18,
              }}
            />
          )}
        </Box>

        {/* Content */}
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

          {/* Meta */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mb: 1.25, flexWrap: "wrap", gap: 0.5 }}
          >
            {course.tongBaiGiang != null && (
              <Typography
                sx={{
                  fontSize: 11,
                  color: "var(--ev-text-muted, rgba(31,41,55,0.45))",
                  fontWeight: 600,
                }}
              >
                📖 {course.tongBaiGiang} bài
              </Typography>
            )}
            {course.tongThoiLuong != null && (
              <Typography
                sx={{
                  fontSize: 11,
                  color: "var(--ev-text-muted, rgba(31,41,55,0.45))",
                  fontWeight: 600,
                }}
              >
                ⏱ {fmtDuration(course.tongThoiLuong)}
              </Typography>
            )}
          </Stack>

          <Divider sx={{ mb: 1.25, opacity: 0.45 }} />

          {/* Bottom row */}
          <Stack
            direction="row"
            sx={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 14.5,
                  fontWeight: 900,
                  color: isFree ? "#10B981" : C.primary,
                }}
              >
                {isFree ? "Miễn phí" : fmtPrice(displayPrice)}
              </Typography>
              {course.giaGoc && course.giaGoc > displayPrice && (
                <Typography
                  sx={{
                    fontSize: 10.5,
                    color: "var(--ev-text-muted, rgba(31,41,55,0.35))",
                    textDecoration: "line-through",
                    fontWeight: 600,
                  }}
                >
                  {course.giaGoc.toLocaleString("vi-VN")}đ
                </Typography>
              )}
            </Box>
            {students > 0 && (
              <Stack
                direction="row"
                spacing={0.4}
                sx={{ alignItems: "center" }}
              >
                <PeopleAltRounded
                  sx={{ fontSize: 13, color: "var(--ev-text-muted, rgba(31,41,55,0.4))" }}
                />
                <Typography
                  sx={{
                    fontSize: 11,
                    color: "var(--ev-text-muted, rgba(31,41,55,0.45))",
                    fontWeight: 600,
                  }}
                >
                  {students.toLocaleString()}
                </Typography>
              </Stack>
            )}
            {students === 0 && rating > 0 && (
              <Stack
                direction="row"
                spacing={0.4}
                sx={{ alignItems: "center" }}
              >
                <StarRounded sx={{ fontSize: 14, color: "#F59E0B" }} />
                <Typography
                  sx={{ fontSize: 11.5, fontWeight: 700, color: C.textDark }}
                >
                  {rating}
                </Typography>
              </Stack>
            )}
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
      {linkText && (
        <Typography
          component="a"
          href={href ?? "#"}
          sx={{
            fontSize: 13.5,
            fontWeight: 800,
            color: C.primary,
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {linkText}
        </Typography>
      )}
    </Stack>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudentDashboardContent() {
  const router = useRouter();
  const { fetchFavorites } = useFavorite();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = useSelector((state: any) => state.auth.user);
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
    return () => window.removeEventListener("avatar_updated", handleAvatarUpdate);
  }, [user?.email]);

  const [courseImages, setCourseImages] = useState<Record<string, string>>({});
  const [titleImages, setTitleImages] = useState<Record<string, string>>({});
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "courses" | "assigned" | "paths"
  >("courses");
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Fetch dashboard data
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // Fetch approved courses to retrieve real image urls (bypassing dashboard endpoint omissions)
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const approvedRes = await apiService.get<any>("/KhoaHoc/khoahoc-getlist-daduyet");
          const items = approvedRes.data || [];
          const imgMap: Record<string, string> = {};
          const tMap: Record<string, string> = {};
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

        const res = await apiService.get<DashboardData>("/dashboard?role=HocVien");
        if (res.status && res.data) {
          setData(res.data);
          // Set default selected skill
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
    };
    void load();
    void fetchFavorites();
  }, [fetchFavorites]);

  // Điều hướng sang trang chi tiết/preview khóa học
  const handleOpenCourse = useCallback(
    (course: KhoaHocDto) => {
      const id = course.id || course.idDangKiKhoaHoc;
      if (!id) return;
      router.push(`/student/enroll-courses/${id}`);
    },
    [router],
  );

  // Add to cart
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

  // Filter skills courses
  const filteredSkillCourses = useMemo(() => {
    if (!data?.skillsCourses) return [];
    if (!selectedSkill) return data.skillsCourses;
    const s = selectedSkill.toLowerCase();
    return data.skillsCourses.filter((c) => {
      const t = (c.tieuDe || c.title || "").toLowerCase();
      if (s === "test")
        return (
          t.includes("ai") ||
          t.includes("machine learning") ||
          t.includes("llm") ||
          t.includes("python") ||
          t.includes("chatbot")
        );
      if (s === "python") return t.includes("python") || t.includes("data");
      if (s === "reactjs")
        return (
          t.includes("react") || t.includes("javascript") || t.includes("html")
        );
      if (s === "sql server") return t.includes("sql") || t.includes("dữ liệu");
      if (s === "aws")
        return (
          t.includes("aws") ||
          t.includes("cloud") ||
          t.includes("microservices") ||
          t.includes("docker")
        );
      if (s === "ui/ux")
        return (
          t.includes("figma") ||
          t.includes("ui") ||
          t.includes("ux") ||
          t.includes("thiết kế")
        );
      return true;
    });
  }, [selectedSkill, data]);

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: 350 }}>
        <CircularProgress sx={{ color: C.primary }} />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: "20px",
          border: "1px solid rgba(220,38,38,0.1)",
          bgcolor: "#FFF5F5",
        }}
      >
        <Typography sx={{ color: "#B91C1C", fontWeight: 700 }}>
          {error ?? "Có lỗi xảy ra khi tải dữ liệu."}
        </Typography>
      </Paper>
    );
  }

  const {
    welcomeStats,
    continueLearning,
    interestedSkills,
    nextSectors,
    premiumSelection,
    historyRecommendation,
  } = data;

  const tabCourses = (() => {
    switch (activeTab) {
      case "courses":
        return continueLearning?.courses ?? [];
      case "paths":
        return continueLearning?.paths ?? [];
      default:
        return [];
    }
  })();

  return (
    <Stack spacing={4} sx={{ width: "100%" }}>
      {/* ── 1. Welcome Banner ──────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: "24px",
          bgcolor: C.white,
          border: `1px solid rgba(139,19,19,0.08)`,
          background: "linear-gradient(135deg, rgba(139,19,19,0.02) 0%, rgba(255,255,255,1) 100%)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.02)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 4,
          flexWrap: "wrap",
          mb: 4,
        }}
      >
        <Stack direction="row" sx={{ alignItems: "center", gap: 3, flex: 1, minWidth: 280 }}>
          <Avatar
            src={userAvatar || user?.anhDaiDien || welcomeStats?.avatarUrl || undefined}
            sx={{
              width: 72,
              height: 72,
              bgcolor: C.primary,
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: 22,
              border: "3px solid #fff",
              boxShadow: `0 0 0 3px rgba(139,19,19,0.12), 0 8px 24px rgba(139,19,19,0.12)`,
            }}
          >
            {welcomeStats?.userName || user?.hoTen
              ? (() => {
                  const name = (user?.hoTen || welcomeStats?.userName || '').trim();
                  const parts = name.split(/\s+/);
                  if (parts.length === 0) return "HV";
                  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
                  return (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
                })()
              : "HV"}
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
              Chào mừng {user?.hoTen || welcomeStats?.userName || "học viên"} trở lại! 👋
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
              {welcomeStats?.subtitle || "Khám phá các khóa học mới và tiếp tục hành trình nâng cao tri thức của bạn ngay hôm nay."}
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
            }}
          >
            <SchoolRounded sx={{ color: C.primary, fontSize: 24, mb: 1 }} />
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: C.textDark }}>
              {welcomeStats?.totalCourses || 0}
            </Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, mt: 0.25 }}>
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
            }}
          >
            <TrendingUpRounded sx={{ color: C.primary, fontSize: 24, mb: 1 }} />
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: C.textDark }}>
              {welcomeStats?.progressPercent || 0}%
            </Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, mt: 0.25 }}>
              Tiến độ
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* ── 2. AI + Assessment Banners ─────────────────────────────── */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: "24px",
              background: C.gradientAI,
              color: "#FFFFFF",
              minHeight: 210,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 10px 24px rgba(124,58,237,0.15)",
              transition: "transform 200ms ease",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <Box
              sx={{
                position: "absolute",
                right: -20,
                bottom: -20,
                width: 150,
                height: 150,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <PsychologyRounded
                sx={{ fontSize: 64, color: "rgba(255,255,255,0.18)" }}
              />
            </Box>
            <Box sx={{ zIndex: 1 }}>
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 900,
                  mb: 1,
                  letterSpacing: "-0.3px",
                }}
              >
                AI phù hợp với bạn
              </Typography>
              <Typography
                sx={{
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  opacity: 0.9,
                  maxWidth: "85%",
                }}
              >
                Luôn dẫn đầu với các kỹ năng AI theo nhu cầu giúp nâng cao sự
                nghiệp và giúp bạn được chú ý.
              </Typography>
            </Box>
            <Box sx={{ zIndex: 1, mt: 3 }}>
              <Button
                variant="contained"
                onClick={() => router.push("/student/explore")}
                sx={{
                  bgcolor: "var(--ev-paper, #FFFFFF)",
                  color: C.primary,
                  fontWeight: 800,
                  borderRadius: "50px",
                  px: 3,
                  py: 1,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#FFF5F7", boxShadow: "none" },
                }}
              >
                Khám phá các khóa học về AI
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: "24px",
              background: C.gradientTeal,
              color: "#FFFFFF",
              minHeight: 210,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 10px 24px rgba(13,148,136,0.15)",
              transition: "transform 200ms ease",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <Box
              sx={{
                position: "absolute",
                right: -20,
                bottom: -20,
                width: 150,
                height: 150,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <QuizRounded
                sx={{ fontSize: 64, color: "rgba(255,255,255,0.18)" }}
              />
            </Box>
            <Box sx={{ zIndex: 1 }}>
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 900,
                  mb: 1,
                  letterSpacing: "-0.3px",
                }}
              >
                Kiểm tra kỹ năng của bạn
              </Typography>
              <Typography
                sx={{
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  opacity: 0.9,
                  maxWidth: "85%",
                }}
              >
                Khám phá điểm mạnh và nhận định hướng về những gì nên học tiếp
                theo.
              </Typography>
            </Box>
            <Box sx={{ zIndex: 1, mt: 3 }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: "var(--ev-paper, #FFFFFF)",
                  color: "#005F55",
                  fontWeight: 800,
                  borderRadius: "50px",
                  px: 3,
                  py: 1,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#F0FDF4", boxShadow: "none" },
                }}
              >
                Khám phá bài đánh giá
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── 3. Learning Streak ─────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: "24px",
          border: "1px solid rgba(141,19,19,0.07)",
          bgcolor: C.white,
          boxShadow: "0 4px 16px rgba(141,19,19,0.01)",
        }}
      >
        <Grid container spacing={3} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography
              sx={{ fontSize: 17, fontWeight: 900, color: C.textDark }}
            >
              Bắt đầu một chuỗi mới
            </Typography>
            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "var(--ev-text-muted, rgba(31,41,55,0.5))",
                fontWeight: 500,
              }}
            >
              Đã xong vòng truy cập, giờ hãy hoàn thành vòng xem.
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  bgcolor: "rgba(141,19,19,0.04)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <LocalFireDepartmentRounded
                  sx={{ color: C.primary, fontSize: 24 }}
                />
              </Box>
              <Box>
                <Typography
                  sx={{ fontSize: 15, fontWeight: 900, color: C.textDark }}
                >
                  {welcomeStats?.progressPercent ?? 0} tuần
                </Typography>
                <Typography
                  sx={{
                    fontSize: 11.5,
                    color: "var(--ev-text-muted, rgba(31,41,55,0.4))",
                    fontWeight: 600,
                  }}
                >
                  Chuỗi hiện tại
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: "center",
                justifyContent: { xs: "flex-start", md: "flex-end" },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: 44,
                  height: 44,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <svg width="44" height="44" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="rgba(141,19,19,0.06)"
                    strokeWidth="3.5"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke={C.primary}
                    strokeWidth="3.5"
                    strokeDasharray="0 100"
                    strokeDashoffset="25"
                    strokeLinecap="round"
                  />
                </svg>
                <Box
                  sx={{
                    position: "absolute",
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: C.primary,
                    border: "2px solid #fff",
                  }}
                />
              </Box>
              <Box>
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ alignItems: "center" }}
                >
                  <Typography
                    sx={{ fontSize: 13, fontWeight: 800, color: C.textDark }}
                  >
                    0/30 phút khóa học
                  </Typography>
                  <InfoOutlined
                    sx={{ fontSize: 13, color: "var(--ev-text-muted, rgba(31,41,55,0.4))" }}
                  />
                </Stack>
                <Typography
                  sx={{
                    fontSize: 11,
                    color: "var(--ev-text-muted, rgba(31,41,55,0.4))",
                    fontWeight: 600,
                    mt: 0.2,
                  }}
                >
                  🟢 1/1 lượt truy cập
                </Typography>
                <Typography
                  component="a"
                  href="#"
                  sx={{
                    display: "inline-block",
                    fontSize: 11,
                    fontWeight: 800,
                    color: C.primary,
                    textDecoration: "none",
                    mt: 0.3,
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Xem tất cả hoạt động
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* ── 4. Continue Learning ───────────────────────────────────── */}
      <Box>
        <SectionHeader
          title="Hoàn thành nốt phần bạn đang làm dở"
        />

        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 3,
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            "& .MuiTabs-indicator": {
              bgcolor: C.primary,
              height: 3,
              borderRadius: "3px",
            },
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--ev-text-muted, rgba(31,41,55,0.5))",
              minWidth: 100,
              px: 1.5,
              pb: 1.5,
              "&.Mui-selected": { color: C.primary },
            },
          }}
        >
          <Tab value="courses" label="Khóa học" />
          <Tab value="assigned" label="Các khóa học được chỉ định" />
          <Tab value="paths" label="Lộ trình học tập" />
        </Tabs>

        {/* Courses tab */}
        {activeTab === "courses" &&
          (tabCourses.length > 0 ? (
            <CarouselRow>
              {tabCourses.map((item) => (
                <Paper
                  key={item.id || item.idDangKiKhoaHoc}
                  elevation={0}
                  onClick={() => handleOpenCourse(item)}
                  sx={{
                    width: 300,
                    flexShrink: 0,
                    p: 2.5,
                    borderRadius: "20px",
                    border: "1px solid rgba(0,0,0,0.06)",
                    bgcolor: C.white,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    position: "relative",
                    cursor: "pointer",
                    transition: "transform 200ms, box-shadow 200ms",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.03)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "12px",
                      flexShrink: 0,
                      background: getGradient(item),
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {item.contentType === "Bài viết" ? (
                      <ArticleOutlined sx={{ fontSize: 26, color: "#FFFFFF" }} />
                    ) : (
                      <PlayCircleOutlineRounded
                        sx={{ fontSize: 28, color: "#FFFFFF" }}
                      />
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 13.5,
                        fontWeight: 800,
                        color: C.textDark,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.tieuDe || item.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--ev-text-muted, rgba(31,41,55,0.5))",
                        mt: 0.2,
                      }}
                    >
                      {item.contentType ?? "Video bài giảng"}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: "var(--ev-text-muted, rgba(31,41,55,0.4))",
                        fontWeight: 600,
                        mt: 0.5,
                      }}
                    >
                      {item.duration ??
                        (item.tongThoiLuong
                          ? fmtDuration(item.tongThoiLuong)
                          : "")}
                      {item.tongBaiGiang
                        ? ` • Còn ${item.tongBaiGiang} giờ học`
                        : ""}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => e.stopPropagation()}
                    sx={{ alignSelf: "flex-start", mt: -0.5, mr: -0.5 }}
                  >
                    <MoreVertRounded
                      sx={{ fontSize: 18, color: "var(--ev-text-muted, rgba(31,41,55,0.4))" }}
                    />
                  </IconButton>
                  {/* Progress bar */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 16,
                      right: 16,
                      height: 3,
                      bgcolor: "rgba(0,0,0,0.04)",
                      borderRadius: "2px",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: `${item.phanTramHoanThanh ?? item.progress ?? 0}%`,
                        bgcolor: C.primary,
                        borderRadius: "2px",
                      }}
                    />
                  </Box>
                </Paper>
              ))}
            </CarouselRow>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: "20px",
                border: "1px solid rgba(141,19,19,0.06)",
                bgcolor: C.white,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{ fontSize: 16, fontWeight: 700, color: C.textDark, mb: 1 }}
              >
                Chưa có khóa học đang học
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push("/student/explore")}
                sx={{
                  background: C.gradientCrimson,
                  color: "#FFFFFF",
                  borderRadius: "12px",
                  px: 3,
                  py: 1,
                  fontWeight: 800,
                  boxShadow: "none",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #7f1d1d 0%, #681212 100%)",
                    boxShadow: "none",
                  },
                }}
              >
                Khám phá khóa học
              </Button>
            </Paper>
          ))}

        {/* Assigned tab */}
        {activeTab === "assigned" && (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: "20px",
              border: "1px solid rgba(141,19,19,0.06)",
              bgcolor: C.white,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 2,
            }}
          >
            <Typography
              sx={{ fontSize: 17, fontWeight: 900, color: C.textDark }}
            >
              Chưa có khóa học nào được chỉ định
            </Typography>
            <Typography
              sx={{
                fontSize: 13.5,
                color: "var(--ev-text-muted, rgba(31,41,55,0.5))",
                maxWidth: 620,
                lineHeight: 1.6,
              }}
            >
              Khi khóa học được chỉ định cho bạn, khóa học sẽ xuất hiện ở đây.
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push("/student/explore")}
              sx={{
                background: C.gradientCrimson,
                color: "#FFFFFF",
                borderRadius: "12px",
                px: 3,
                py: 1,
                fontWeight: 800,
                boxShadow: "none",
                "&:hover": {
                  background:
                    "linear-gradient(90deg, #7f1d1d 0%, #681212 100%)",
                  boxShadow: "none",
                },
              }}
            >
              Khám phá khóa học
            </Button>
          </Paper>
        )}

        {/* Paths tab */}
        {activeTab === "paths" &&
          (tabCourses.length > 0 ? (
            <CarouselRow>
              {tabCourses.map((item) => (
                <Paper
                  key={item.id}
                  elevation={0}
                  onClick={() => handleOpenCourse(item)}
                  sx={{
                    width: 300,
                    flexShrink: 0,
                    p: 3,
                    borderRadius: "20px",
                    border: "1px solid rgba(0,0,0,0.07)",
                    bgcolor: C.white,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 150,
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "transform 200ms, box-shadow 200ms",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 10px 24px rgba(0,0,0,0.04)",
                    },
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: "var(--ev-text-muted, rgba(31,41,55,0.4))",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {item.contentType ?? "Lộ trình học tập"}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: 14.5,
                        fontWeight: 800,
                        color: C.textDark,
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.tieuDe || item.title}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "var(--ev-text-muted, rgba(31,41,55,0.5))",
                      fontWeight: 700,
                    }}
                  >
                    {item.duration ??
                      `${item.soBaiGiangHoanThanh ?? 0}/${item.tongBaiGiang ?? 0} mục đã hoàn thành`}
                  </Typography>
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      bgcolor: C.primary,
                    }}
                  />
                </Paper>
              ))}
            </CarouselRow>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: "20px",
                border: "1px solid rgba(141,19,19,0.06)",
                bgcolor: C.white,
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: 15, color: "var(--ev-text-muted, rgba(31,41,55,0.5))" }}>
                Chưa có lộ trình học tập nào.
              </Typography>
            </Paper>
          ))}


      </Box>

      {/* ── 5. Next Sectors ────────────────────────────────────────── */}
      {nextSectors && nextSectors.length > 0 && (
        <Box>
          <SectionHeader title="Lĩnh vực sẽ học tiếp theo" />
          <Typography
            sx={{
              fontSize: 13.5,
              color: "var(--ev-text-muted, rgba(31,41,55,0.5))",
              mb: 3,
              mt: -1.5,
            }}
          >
            Các khóa học đề xuất dành cho bạn
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "repeat(4, minmax(0, 1fr))",
              },
              gap: 2.5,
            }}
          >
            {nextSectors.map((sec) => (
              <Paper
                key={sec.id}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "20px",
                  border: "1px solid rgba(0,0,0,0.06)",
                  bgcolor: C.white,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 170,
                  cursor: "pointer",
                  transition: "all 200ms ease",
                  "&:hover": {
                    borderColor: C.primary,
                    boxShadow: "0 8px 24px rgba(141,19,19,0.04)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "12px",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(141,19,19,0.04)",
                    mb: 2,
                  }}
                >
                  {sec.iconName === "ai" ? (
                    <PsychologyRounded
                      sx={{ color: C.primary, fontSize: 26 }}
                    />
                  ) : sec.iconName === "cloud" ? (
                    <CloudQueueRounded
                      sx={{ color: C.primary, fontSize: 26 }}
                    />
                  ) : sec.iconName === "marketing" ? (
                    <TrendingUpRounded
                      sx={{ color: C.primary, fontSize: 26 }}
                    />
                  ) : (
                    <SchoolRounded sx={{ color: C.primary, fontSize: 26 }} />
                  )}
                </Box>
                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 900,
                    color: C.textDark,
                    mb: 1.5,
                  }}
                >
                  {sec.title}
                </Typography>
                <Stack spacing={0.75}>
                  {(sec.subfields ?? []).map((sub, i) => (
                    <Typography
                      key={i}
                      sx={{
                        fontSize: 12.5,
                        color: "var(--ev-text-secondary, rgba(31,41,55,0.6))",
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        "&:before": {
                          content: '""',
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          bgcolor: C.primary,
                          display: "inline-block",
                          flexShrink: 0,
                        },
                      }}
                    >
                      {sub}
                    </Typography>
                  ))}
                </Stack>
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      {/* ── 6. Skills Courses ──────────────────────────────────────── */}
      {(interestedSkills?.length || filteredSkillCourses.length > 0) && (
        <Box>
          <SectionHeader
            title="Dựa trên kỹ năng bạn quan tâm, chúng tôi khuyến nghị bạn"
          />
          {interestedSkills && interestedSkills.length > 0 && (
            <Stack
              direction="row"
              spacing={1.25}
              sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}
            >
              {interestedSkills.map((badge) => {
                const isActive = selectedSkill === badge;
                return (
                  <Chip
                    key={badge}
                    label={badge}
                    onClick={() => setSelectedSkill(badge)}
                    sx={{
                      bgcolor: isActive ? C.primary : "rgba(0,0,0,0.03)",
                      color: isActive ? "var(--ev-paper, #FFFFFF)" : "rgba(31,41,55,0.65)",
                      fontWeight: 800,
                      fontSize: 13,
                      px: 1,
                      py: 1.8,
                      borderRadius: "50px",
                      border: isActive
                        ? `1px solid ${C.primary}`
                        : "1px solid rgba(0,0,0,0.05)",
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: isActive ? C.primary : "rgba(141,19,19,0.05)",
                        color: isActive ? "var(--ev-paper, #FFFFFF)" : C.primary,
                      },
                      transition: "all 150ms ease",
                    }}
                  />
                );
              })}
            </Stack>
          )}
          {filteredSkillCourses.length > 0 ? (
            <CarouselRow>
              {filteredSkillCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onAddCart={handleAddCart}
                  onClick={handleOpenCourse}
                  width={240}
                />
              ))}
            </CarouselRow>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "18px",
                border: "1px solid rgba(141,19,19,0.06)",
                bgcolor: C.white,
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: 14, color: "var(--ev-text-muted, rgba(31,41,55,0.5))" }}>
                Không có khóa học phù hợp với kỹ năng này.
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* ── 7. Premium Selection ───────────────────────────────────── */}
      {premiumSelection && (
        <Box>
          <SectionHeader title="Các khóa học hàng đầu chúng tôi chọn cho bạn" />

          {/* Hero card */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: "24px",
              overflow: "hidden",
              border: "1px solid rgba(141,19,19,0.07)",
              bgcolor: C.white,
              mb: 3,
              boxShadow: "0 8px 24px rgba(141,19,19,0.02)",
            }}
          >
            <Grid container>
              <Grid
                size={{ xs: 12, md: 5 }}
                sx={{
                  minHeight: 240,
                  background:
                    premiumSelection.thumbnailGradient ?? C.gradientCrimson,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <Typography
                  sx={{
                    color: "#FFFFFF",
                    fontSize: 36,
                    fontWeight: 900,
                    opacity: 0.1,
                  }}
                >
                  PREMIUM
                </Typography>
                <Chip
                  icon={<StarRounded sx={{ fontSize: "14px" }} />}
                  label="LỰA CHỌN HÀNG ĐẦU"
                  sx={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    bgcolor: "rgba(255,255,255,0.95)",
                    color: C.primary,
                    fontWeight: 900,
                    fontSize: 11,
                    height: 26,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    "& .MuiChip-icon": { color: `${C.primary} !important` },
                  }}
                />
              </Grid>
              <Grid
                size={{ xs: 12, md: 7 }}
                sx={{
                  p: { xs: 3, md: 4 },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11.5,
                    fontWeight: 800,
                    color: C.primaryLight,
                    mb: 1,
                  }}
                >
                  KHÓA HỌC ĐẶC BIỆT
                </Typography>
                <Typography
                  sx={{
                    fontSize: 19,
                    fontWeight: 900,
                    color: C.textDark,
                    mb: 1.5,
                    lineHeight: 1.4,
                  }}
                >
                  {premiumSelection.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13.5,
                    color: "var(--ev-text-secondary, rgba(31,41,55,0.6))",
                    mb: 3,
                    lineHeight: 1.6,
                  }}
                >
                  {premiumSelection.description}
                </Typography>
                <Stack spacing={1} sx={{ mb: 3 }}>
                  {premiumSelection.instructor && (
                    <Typography
                      sx={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: C.textDark,
                      }}
                    >
                      Giảng viên:{" "}
                      <span
                        style={{ fontWeight: 500, color: "var(--ev-text-secondary, rgba(31,41,55,0.7))" }}
                      >
                        {premiumSelection.instructor}
                      </span>
                    </Typography>
                  )}
                  <Stack
                    direction="row"
                    spacing={2.5}
                    sx={{ alignItems: "center" }}
                  >
                    {premiumSelection.rating && (
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ alignItems: "center" }}
                      >
                        <StarRounded sx={{ color: "#F59E0B", fontSize: 16 }} />
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: C.textDark,
                          }}
                        >
                          {premiumSelection.rating}
                        </Typography>
                      </Stack>
                    )}
                    {premiumSelection.studentsCount != null && (
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "var(--ev-text-muted, rgba(31,41,55,0.5))",
                          fontWeight: 600,
                        }}
                      >
                        👥 {premiumSelection.studentsCount.toLocaleString()} học
                        viên
                      </Typography>
                    )}
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    sx={{
                      background: C.gradientCrimson,
                      color: "#FFFFFF",
                      fontWeight: 800,
                      borderRadius: "12px",
                      px: 3,
                      py: 1,
                      boxShadow: "none",
                      "&:hover": {
                        background:
                          "linear-gradient(90deg, #7f1d1d 0%, #681212 100%)",
                        boxShadow: "none",
                      },
                    }}
                  >
                    Xem khóa học
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      borderColor: "rgba(141,19,19,0.25)",
                      color: C.primary,
                      fontWeight: 800,
                      borderRadius: "12px",
                      px: 2.5,
                      py: 1,
                      "&:hover": {
                        borderColor: C.primary,
                        bgcolor: "rgba(141,19,19,0.03)",
                      },
                    }}
                  >
                    Thêm vào danh sách
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Related courses */}
          {premiumSelection.relatedCourses &&
            premiumSelection.relatedCourses.length > 0 && (
              <CarouselRow>
                {premiumSelection.relatedCourses.map((c) => (
                  <CourseCard
                    key={c.id}
                    course={c}
                    onAddCart={handleAddCart}
                    onClick={handleOpenCourse}
                    width={240}
                  />
                ))}
              </CarouselRow>
            )}
        </Box>
      )}

      {/* ── 8. History Recommendation ──────────────────────────────── */}
      {historyRecommendation?.courses &&
        historyRecommendation.courses.length > 0 && (
          <Box>
            <Typography
              sx={{ fontSize: 20, fontWeight: 900, color: C.textDark }}
            >
              Vì bạn đã học &quot;{historyRecommendation.basedOnCourse}&quot;
            </Typography>
            <Typography
              sx={{
                fontSize: 13.5,
                color: "var(--ev-text-muted, rgba(31,41,55,0.5))",
                mb: 3,
                mt: 0.5,
              }}
            >
              Đề xuất từ động cơ trí tuệ nhân tạo (AI Recommendation Engine).
            </Typography>
            <CarouselRow>
              {historyRecommendation.courses.map((c) => (
                <CourseCard
                  key={c.id}
                  course={c}
                  onAddCart={handleAddCart}
                  onClick={handleOpenCourse}
                  width={240}
                />
              ))}
            </CarouselRow>
          </Box>
        )}

      {/* Cart notification */}
      {addedIds.size > 0 && (
        <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 2000 }}>
          <Paper
            elevation={0}
            sx={{
              px: 2.5,
              py: 1.5,
              borderRadius: "14px",
              bgcolor: C.textDark,
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
          >
            <CheckCircleRounded sx={{ fontSize: 18, color: "#10B981" }} />
            <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>
              Đã thêm vào giỏ hàng
            </Typography>
            <Button
              size="small"
              onClick={() => router.push("/student/cart")}
              sx={{
                color: "#93C5FD",
                fontWeight: 800,
                fontSize: 12.5,
                px: 1,
                minWidth: 0,
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              Xem giỏ →
            </Button>
          </Paper>
        </Box>
      )}
    </Stack>
  );
}
