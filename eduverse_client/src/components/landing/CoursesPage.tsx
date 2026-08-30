"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import KhoaHocService from "@/src/services/KhoaHocService";
import { danhMucService } from "@/src/services/danhmucService";
import {
  ArrowForwardRounded,
  QueryStatsRounded,
  SchoolRounded,
  SearchRounded,
  TimerRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Paper,
  Rating,
  Select,
  Stack,
  TextField,
  Typography,
  Checkbox,
  IconButton,
  Tooltip,
} from "@mui/material";
import { type CourseCatalogItem, type CourseCategory } from "./landing-data";
import { useRouter } from "next/navigation";
import { useDispatch } from "@/src/store/hook";
import { useSelector } from "@/src/store/hook";
import { themVaoGioHang } from "@/src/store/gioHang/GioHangSlice";
import { useFavorite } from "@/src/features/favorite/hooks/useFavorite";
import FavoriteHeartIcon from "@/src/features/favorite/components/FavoriteHeartIcon";
import { BRAND, CSSVAR, STATUS } from "@/src/theme/tokens";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TextFieldAny = TextField as any;

type CourseSortOption =
  | "relevance"
  | "newest"
  | "best-selling"
  | "price-low"
  | "price-high";
type PriceFilter = "all" | "free" | "paid";

const RATING_MARKS = [0, 1, 2, 3, 4, 4.5, 5] as const;

const BRAND_COLORS = {
  primary: BRAND.main, // Đỏ đô
  primaryHover: "#7F1D1D",
  primarySoft: "#FEF2F2",
  primaryBorder: "#FECACA",
  textTitle: CSSVAR.textPrimary,
  textBody: CSSVAR.textSecondary,
  textMuted: CSSVAR.textMuted,
  borderLight: CSSVAR.divider,
};

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography
        sx={{
          mb: 1.5,
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: BRAND_COLORS.textMuted,
        }}
      >
        {title}
      </Typography>
      <Stack spacing={1}>{children}</Stack>
    </Box>
  );
}

function CourseCard({ course }: { course: CourseCatalogItem }) {
  const isFree = course.isFree;
  const imageUrl = course.hinhAnhKhoaHoc;

  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  const { isFavorited, toggleFavorite } = useFavorite();
  const favorited = isFavorited(course.id);

  // Handle "Chưa cập nhật" values gracefully
  const hasCategory =
    course.category &&
    course.category !== "Chưa cập nhật" &&
    course.category !== "Khác";
  const hasLevel = course.level && course.level !== "Chưa cập nhật";
  const displayInstructor =
    course.instructor === "Chưa cập nhật" ? "EduVerse" : course.instructor;
  const isPricePending = course.price === "Chưa cập nhật";
  const displayPrice = isPricePending ? "Đang cập nhật" : course.price;
  const hasDuration = course.duration && course.duration !== "Chưa cập nhật";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: "18px",
        border: `1px solid ${BRAND_COLORS.borderLight}`,
        bgcolor: CSSVAR.paper,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.04)",
          borderColor: BRAND_COLORS.primaryBorder,
        },
      }}
    >
      {/* Course Image area */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          pt: "56.25%", // 16:9 Aspect Ratio
          overflow: "hidden",
          borderRadius: "12px",
          bgcolor: CSSVAR.paperAlt,
        }}
      >
        {imageUrl ? (
          <Box
            component="img"
            src={imageUrl}
            alt={course.title}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.5s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />
        ) : (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: CSSVAR.textMuted,
              gap: 1,
            }}
          >
            <SchoolRounded sx={{ fontSize: 32 }} />
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              EduVerse
            </Typography>
          </Box>
        )}

        {/* Free/Paid badge */}
        <Chip
          label={course.badge}
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            height: 22,
            fontSize: 10.5,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            bgcolor: isFree ? "#E8F5E9" : BRAND_COLORS.primarySoft,
            color: isFree ? "#2E7D32" : BRAND_COLORS.primary,
            borderRadius: "6px",
            border: `1px solid ${isFree ? "#C8E6C9" : BRAND_COLORS.primaryBorder}`,
          }}
        />

        {/* Favorite icon */}
        <IconButton
          aria-pressed={favorited}
          aria-label={
            favorited
              ? "Bỏ khỏi danh sách yêu thích"
              : "Thêm vào danh sách yêu thích"
          }
          onClick={async (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!user) {
              router.push(
                `/auth/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`,
              );
              return;
            }
            await toggleFavorite(course.id, course.title);
          }}
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 32,
            height: 32,
            bgcolor: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(8px)",
            color: favorited ? BRAND_COLORS.primary : CSSVAR.textSecondary,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor: CSSVAR.paper,
              color: BRAND_COLORS.primary,
              transform: "scale(1.08)",
            },
          }}
        >
          <FavoriteHeartIcon active={favorited} color={BRAND_COLORS.primary} />
        </IconButton>
      </Box>

      {/* Course details */}
      <Box sx={{ display: "flex", flexDirection: "column", flex: 1, mt: 2 }}>
        {/* Categories & Level */}
        <Stack
          direction="row"
          spacing={0.8}
          sx={{ flexWrap: "wrap", gap: 0.5, mb: 1.5 }}
        >
          {hasCategory && (
            <Chip
              label={course.category}
              size="small"
              sx={{
                height: 22,
                fontSize: 11,
                fontWeight: 600,
                bgcolor: CSSVAR.paperAlt,
                color: BRAND_COLORS.textBody,
                borderRadius: "4px",
              }}
            />
          )}
          {hasLevel && (
            <Chip
              label={course.level}
              size="small"
              sx={{
                height: 22,
                fontSize: 11,
                fontWeight: 600,
                bgcolor: "rgba(139, 19, 19, 0.06)",
                color: BRAND_COLORS.primary,
                borderRadius: "4px",
              }}
            />
          )}
        </Stack>

        {/* Title */}
        <Typography
          sx={{
            fontSize: 16.5,
            fontWeight: 700,
            color: BRAND_COLORS.textTitle,
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            height: 46,
            mb: 0.5,
            transition: "color 0.2s ease",
            "&:hover": {
              color: BRAND_COLORS.primary,
            },
          }}
          title={course.title}
        >
          {course.title}
        </Typography>

        {/* Instructor */}
        <Typography
          sx={{ fontSize: 13, color: BRAND_COLORS.textMuted, mb: 1.5 }}
        >
          Giảng viên: {displayInstructor}
        </Typography>

        <Box sx={{ flex: 1 }} />

        {/* Ratings */}
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: "center", mb: 1.5 }}
        >
          {course.rating !== null && course.rating > 0 ? (
            <Tooltip title={`${(course.soLuongDanhGia ?? 0).toLocaleString()} lượt đánh giá`} arrow placement="top">
              <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", width: "fit-content" }}>
                <Typography
                  sx={{
                    fontSize: 13.5,
                    color: STATUS.warning,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.25,
                  }}
                >
                  ★ {course.rating.toFixed(1)}
                </Typography>
                {Boolean(course.soLuongDanhGia && course.soLuongDanhGia > 0) && (
                  <Typography sx={{ fontSize: 13, color: BRAND_COLORS.textMuted }}>
                    ({(course.soLuongDanhGia ?? 0).toLocaleString()})
                  </Typography>
                )}
              </Stack>
            </Tooltip>
          ) : (
            <Typography
              sx={{
                fontSize: 13,
                color: BRAND_COLORS.textMuted,
                fontStyle: "italic",
              }}
            >
              Chưa có đánh giá
            </Typography>
          )}
        </Stack>

        <Divider sx={{ my: 1.5, borderColor: CSSVAR.paperAlt }} />

        {/* Price & Duration info */}
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "baseline" }}>
            {course.originalPrice && !isPricePending && (
              <Typography
                sx={{
                  fontSize: 13,
                  color: CSSVAR.textMuted,
                  textDecoration: "line-through",
                }}
              >
                {course.originalPrice}
              </Typography>
            )}
            <Typography
              sx={{
                fontSize: isPricePending ? 15 : 18,
                fontWeight: 800,
                color: isPricePending
                  ? BRAND_COLORS.textMuted
                  : BRAND_COLORS.primary,
              }}
            >
              {displayPrice}
            </Typography>
          </Stack>
          {hasDuration && (
            <Typography
              sx={{
                fontSize: 12.5,
                color: BRAND_COLORS.textMuted,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <TimerRounded sx={{ fontSize: 15, color: CSSVAR.textMuted }} />
              {course.duration}
            </Typography>
          )}
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1} sx={{ width: "100%", mt: "auto" }}>
          <Button
            onClick={() => router.push(`/student/enroll-courses/${course.id}`)}
            variant="outlined"
            sx={{
              flex: 1,
              height: 40,
              fontSize: 13,
              fontWeight: 600,
              borderRadius: "10px",
              textTransform: "none",
              borderColor: CSSVAR.divider,
              color: BRAND_COLORS.textBody,
              "&:hover": {
                bgcolor: CSSVAR.paperAlt,
                borderColor: BRAND_COLORS.textMuted,
                color: BRAND_COLORS.textTitle,
              },
            }}
          >
            Chi tiết
          </Button>

          <Button
            variant="contained"
            endIcon={
              <ArrowForwardRounded sx={{ fontSize: "16px !important" }} />
            }
            onClick={async () => {
              await dispatch(themVaoGioHang(course.id));
              router.push("/student/cart");
            }}
            sx={{
              flex: 1,
              height: 40,
              fontSize: 13,
              fontWeight: 700,
              borderRadius: "10px",
              textTransform: "none",
              bgcolor: BRAND_COLORS.primary,
              boxShadow: "none",
              "&:hover": {
                bgcolor: BRAND_COLORS.primaryHover,
                boxShadow: "0 4px 12px rgba(153, 27, 27, 0.15)",
              },
            }}
          >
            Đăng ký
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapToCatalogItem = (kh: any): CourseCatalogItem => {
  // Stable hash based on course ID to generate a consistent rating between 4.0 and 5.0
  const apiRating = kh.diemDanhGiaTrungBinh;
  const rating =
    typeof apiRating === "number" && apiRating >= 0 && apiRating <= 5
      ? apiRating
      : null;
  const soLuongDanhGia = Number(kh.soLuongDanhGia || 0);
  const isFree = kh.loaiKhoaHoc === "Khóa học miễn phí";
  const priceValue = Number(kh.gia || 0);
  const studentCount = Number(kh.soLuongHocVien || 0);
  const createdAt = kh.ngayTao ? new Date(kh.ngayTao).getTime() : 0;
  const durationSeconds = Number(kh.tongThoiLuong || 0);
  const durationHours = Math.floor(durationSeconds / 3600);
  const durationMinutes = Math.floor((durationSeconds % 3600) / 60);
  const duration =
    durationSeconds > 0
      ? `${durationHours > 0 ? `${durationHours} giờ ` : ""}${durationMinutes} phút`.trim()
      : "Chưa cập nhật";
  const danhSachGV: string[] | undefined = Array.isArray(
    kh.danhSachGiangVienHienThi,
  )
    ? kh.danhSachGiangVienHienThi
    : undefined;
  const instructorDisplay =
    danhSachGV && danhSachGV.length > 0
      ? danhSachGV.join(", ")
      : kh.createdBy || "Chưa cập nhật";

  return {
    id: kh.id,
    title: kh.tieuDe || "Khóa học không tên",
    soLuongDanhGia: soLuongDanhGia,
    rating,   
    instructor: instructorDisplay,
    students: studentCount,
    studentCount,
    price: isFree
      ? "Miễn phí"
      : kh.gia != null
        ? `${kh.gia.toLocaleString("vi-VN")}đ`
        : "Chưa cập nhật",
    priceValue,
    originalPrice:
      kh.giaGoc && kh.giaGoc > 0
        ? `${kh.giaGoc?.toLocaleString("vi-VN")}đ`
        : "",
    createdAt,
    level: kh.capDo || "Mọi cấp độ",
    duration,
    category: kh.loaiKhoaHoc || "Khác",
    badge: isFree ? "Miễn phí" : "Trả phí",
    tags: [kh.capDo || "Tự chọn", isFree ? "Free" : "Pro"],
    palette: [BRAND.main, "#c2410c", "#fff7f4"],
    hinhAnhKhoaHoc:
      kh.hinhAnhKhoaHoc || kh.urlHinhAnh || kh.hinhAnh || kh.hinhAnhBia,
    isFree,
  };
};

export default function CoursesPage({
  initialSearch = "",
  excludeEnrolled = false,
}: {
  initialSearch?: string;
  excludeEnrolled?: boolean;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [appliedSearch, setAppliedSearch] = useState(initialSearch.trim());
  const [searchRevision, setSearchRevision] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<CourseSortOption>("newest");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [ratingFrom, setRatingFrom] = useState(0);
  const [ratingTo, setRatingTo] = useState(5);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const [courses, setCourses] = useState<CourseCatalogItem[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = -1;
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const { fetchFavorites } = useFavorite();

  const courseService = useMemo(() => new KhoaHocService(), []);

  useEffect(() => {
    if (user) void fetchFavorites();
  }, [fetchFavorites, user]);

  // Danh mục thật từ phần quản lý danh mục của Admin (/danhmuc, công khai)
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await danhMucService.getList({
          pageIndex: 1,
          pageSize: 100,
        });
        if (active && res.status && res.data) {
          setCategories(
            (res.data.items || []).map((dm) => ({
              label: dm.tenDanhMuc || "Danh mục",
              value: dm.id,
            })),
          );
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCourses = async () => {
      setLoading(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const searchParams: any = {
          pageIndex,
          pageSize,
          keyword: appliedSearch || undefined,
          danhMucId: activeCategory !== "all" ? activeCategory : undefined,
          capDo: selectedLevel || undefined,
          loaiKhoaHoc:
            priceFilter === "free"
              ? "Khóa học miễn phí"
              : priceFilter === "paid"
                ? "Khóa học trả phí"
                : undefined,
          sortPrice:
            sortBy === "price-low"
              ? "asc"
              : sortBy === "price-high"
                ? "desc"
                : undefined,
        };
        const response = excludeEnrolled
          ? await courseService.SearchWithElasticsearch(
              searchParams,
              controller.signal,
            )
          : await courseService.GetList(searchParams, controller.signal);
        if (response?.status && response.data) {
          const mapped = (response.data.items || []).map(mapToCatalogItem);
          const filtered = mapped.filter((course) => {
            if (course.rating === null) return ratingFrom === 0; // chỉ hiện khi người dùng không lọc theo sao tối thiểu
            return course.rating >= ratingFrom && course.rating <= ratingTo;
          });

          const sorted = [...filtered];
          if (sortBy === "newest") {
            sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          } else if (sortBy === "best-selling") {
            sorted.sort(
              (a, b) => (b.studentCount || 0) - (a.studentCount || 0),
            );
          } else if (sortBy === "price-low") {
            sorted.sort((a, b) => (a.priceValue || 0) - (b.priceValue || 0));
          } else if (sortBy === "price-high") {
            sorted.sort((a, b) => (b.priceValue || 0) - (a.priceValue || 0));
          }

          setCourses(sorted);
          setTotalCourses(sorted.length);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Error fetching courses from ES backend:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchCourses();
    return () => controller.abort();
  }, [
    appliedSearch,
    searchRevision,
    activeCategory,
    sortBy,
    priceFilter,
    selectedLevel,
    ratingFrom,
    ratingTo,
    pageIndex,
    pageSize,
    courseService,
    excludeEnrolled,
  ]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const submitSearch = () => {
    setAppliedSearch(search.trim());
    setSearchRevision((current) => current + 1);
    setPageIndex(1);
  };

  const toggleLevel = (level: string) => {
    setSelectedLevel((current) => (current === level ? null : level));
    setPageIndex(1);
  };

  const resetFilters = useCallback(() => {
    setActiveCategory("all");
    setPriceFilter("all");
    setSelectedLevel(null);
    setRatingFrom(0);
    setRatingTo(5);
    setSearch("");
    setAppliedSearch("");
    setSearchRevision((current) => current + 1);
    setSortBy("newest");
    setPageIndex(1);
  }, []);

  useEffect(() => {
    window.addEventListener("eduverse:reset-explore", resetFilters);
    return () =>
      window.removeEventListener("eduverse:reset-explore", resetFilters);
  }, [resetFilters]);

  const hasAnyFilterActive =
    activeCategory !== "all" ||
    priceFilter !== "all" ||
    selectedLevel !== null ||
    ratingFrom !== 0 ||
    ratingTo !== 5 ||
    search !== "" ||
    appliedSearch !== "" ||
    sortBy !== "newest";

  return (
    <Box sx={{ width: "100%", pt: 0, px: { xs: 2, sm: 3, md: 4 } }}>
      {/* Modern Compact Hero Card Section */}
      <Box
        sx={{
          py: { xs: 4, sm: 5, md: 5.5 },
          px: { xs: 2.5, sm: 4, md: 5 },
          borderRadius: "24px",
          bgcolor: CSSVAR.paper,
          border: `1px solid ${CSSVAR.divider}`,
          boxShadow: "0 8px 30px rgba(139, 19, 19, 0.04)",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.1fr 0.9fr" },
          gap: { xs: 4, lg: 6 },
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Chip
            label="Nền tảng học tập chuẩn quốc tế"
            sx={{
              bgcolor: BRAND_COLORS.primarySoft,
              color: BRAND_COLORS.primary,
              fontWeight: 800,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              mb: 2.5,
              border: `1px solid ${BRAND_COLORS.primaryBorder}`,
              borderRadius: "6px",
              height: 26,
            }}
          />
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: 34, sm: 44, md: 52 },
              lineHeight: 1.12,
              letterSpacing: "-1.5px",
              fontWeight: 800,
              color: BRAND_COLORS.textTitle,
              mb: 2.5,
            }}
          >
            Khám phá hàng trăm{" "}
            <Box component="span" sx={{ color: BRAND_COLORS.primary }}>
              khóa học
            </Box>{" "}
            chất lượng
          </Typography>
          <Typography
            sx={{
              fontSize: 15.5,
              lineHeight: 1.6,
              color: BRAND_COLORS.textBody,
              mb: 4,
              maxWidth: 580,
            }}
          >
            Học từ chuyên gia hàng đầu và nâng cấp kỹ năng với lộ trình học tập
            được cá nhân hóa, công nghệ hiện đại và cộng đồng học viên dẫn đầu.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ maxWidth: 520 }}
          >
            <TextField
              fullWidth
              variant="outlined"
              value={search}
              onChange={handleSearchChange}
              onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  submitSearch();
                }
              }}
              placeholder="Bạn muốn học kỹ năng gì?"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded sx={{ color: CSSVAR.textMuted }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 52,
                  bgcolor: CSSVAR.paperAlt,
                  borderRadius: "12px",
                  fontSize: 14.5,
                  transition: "all 200ms ease",
                  "& fieldset": { borderColor: BRAND_COLORS.borderLight },
                  "&:hover fieldset": { borderColor: BRAND_COLORS.primary },
                  "&.Mui-focused fieldset": {
                    borderColor: BRAND_COLORS.primary,
                    borderWidth: 1.5,
                  },
                  "&.Mui-focused": { bgcolor: CSSVAR.paper },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={submitSearch}
              startIcon={
                loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : undefined
              }
              sx={{
                px: 4,
                height: 52,
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${BRAND.main} 0%, ${BRAND.dark} 100%)`,
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: 14.5,
                textTransform: "none",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 14px rgba(139, 19, 19, 0.25)",
                transition: "all 200ms ease",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #7F1D1D 0%, #5B0B0B 100%)",
                  boxShadow: "0 6px 20px rgba(139, 19, 19, 0.38)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              Tìm kiếm ngay
            </Button>
          </Stack>
        </Box>

        <Box
          sx={{ position: "relative", display: { xs: "none", lg: "block" } }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: 360,
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 12px 36px rgba(0,0,0,0.05)",
              border: `1px solid ${BRAND_COLORS.borderLight}`,
            }}
          >
            <Image
              src="/auth/img/Illustration_Section_v2.png"
              alt="EduVerse learning space"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 48vw"
              style={{
                objectFit: "cover",
                objectPosition: "center center",
              }}
            />
          </Box>

          <Paper
            elevation={0}
            sx={{
              position: "absolute",
              left: 24,
              bottom: -16,
              px: 2.5,
              py: 1.8,
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.7)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.06)",
              bgcolor: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Typography
              sx={{
                fontSize: 24,
                fontWeight: 900,
                color: BRAND_COLORS.primary,
                lineHeight: 1.1,
              }}
            >
              15K+
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                color: BRAND_COLORS.textMuted,
                fontWeight: 600,
                mt: 0.5,
              }}
            >
              Học viên tham gia học tập
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Sidebar Filter & Grid Panel */}
      <Box
        sx={{
          pb: 8,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "280px minmax(0, 1fr)" },
          gap: 4,
          alignItems: "start",
        }}
      >
        {/* Left Filter Card */}
        <Paper
          elevation={0}
          component="aside"
          sx={{
            p: 3,
            borderRadius: "16px",
            border: `1px solid ${BRAND_COLORS.borderLight}`,
            bgcolor: CSSVAR.paper,
            position: { lg: "sticky" },
            top: { lg: 100 },
            maxHeight: { lg: "calc(100vh - 140px)" },
            overflowY: { lg: "auto" },
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: CSSVAR.divider,
              borderRadius: "999px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: CSSVAR.divider,
            },
          }}
        >
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 800,
                color: BRAND_COLORS.textTitle,
              }}
            >
              Bộ lọc
            </Typography>
            <Button
              onClick={resetFilters}
              disabled={!hasAnyFilterActive}
              sx={{
                color: BRAND_COLORS.primary,
                fontWeight: 700,
                fontSize: 13,
                textTransform: "none",
                minWidth: 0,
                p: 0,
                "&.Mui-disabled": {
                  color: CSSVAR.textMuted,
                },
                "&:hover": {
                  bgcolor: "transparent",
                  textDecoration: "underline",
                },
              }}
            >
              Xóa tất cả
            </Button>
          </Stack>

          <Stack spacing={3}>
            {/* Category Filter */}
            <FilterGroup title="Chủ đề">
              <Box
                sx={{
                  maxHeight: "260px",
                  overflowY: "auto",
                  pr: 0.5,
                  "&::-webkit-scrollbar": {
                    width: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: CSSVAR.divider,
                    borderRadius: "2px",
                  },
                }}
              >
                <Stack spacing={1}>
                  {(showAllCategories
                    ? categories
                    : categories.slice(0, 6)
                  ).map((category) => (
                    <FormControlLabel
                      key={category.value}
                      control={
                        <Checkbox
                          checked={activeCategory === category.value}
                          onChange={() => {
                            if (activeCategory === category.value) {
                              setActiveCategory("all");
                            } else {
                              setActiveCategory(category.value);
                            }
                            setPageIndex(1);
                          }}
                          size="small"
                          sx={{
                            color: CSSVAR.divider,
                            p: 0,
                            mr: 1.2,
                            "&.Mui-checked": {
                              color: BRAND_COLORS.primary,
                            },
                          }}
                        />
                      }
                      label={category.label}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        m: 0,
                        py: 0.5,
                        px: 1,
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "background-color 150ms ease",
                        "&:hover": {
                          bgcolor: CSSVAR.paperAlt,
                        },
                        "& .MuiFormControlLabel-label": {
                          fontSize: 13.5,
                          fontWeight:
                            activeCategory === category.value ? 700 : 500,
                          color:
                            activeCategory === category.value
                              ? BRAND_COLORS.primary
                              : BRAND_COLORS.textBody,
                          textAlign: "left",
                          lineHeight: 1.3,
                          userSelect: "none",
                        },
                      }}
                    />
                  ))}
                  {categories.length > 6 ? (
                    <Button
                      onClick={() =>
                        setShowAllCategories((current) => !current)
                      }
                      sx={{
                        alignSelf: "flex-start",
                        minWidth: 0,
                        px: 1,
                        py: 0.5,
                        color: BRAND_COLORS.primary,
                        fontWeight: 700,
                        fontSize: 13,
                        textTransform: "none",
                        "&:hover": {
                          bgcolor: "transparent",
                          textDecoration: "underline",
                        },
                      }}
                    >
                      {showAllCategories
                        ? "Thu gọn"
                        : `Hiển thị thêm (${categories.length - 6})`}
                    </Button>
                  ) : null}
                </Stack>
              </Box>
            </FilterGroup>

            <Divider sx={{ borderColor: BRAND_COLORS.borderLight }} />

            {/* Price Filter */}
            <FilterGroup title="Giá">
              {(
                [
                  { value: "free", label: "Miễn phí" },
                  { value: "paid", label: "Trả phí" },
                ] as const
              ).map((option) => {
                const selected = priceFilter === option.value;
                return (
                  <FormControlLabel
                    key={option.value}
                    control={
                      <Checkbox
                        checked={selected}
                        onChange={() => {
                          setPriceFilter((current) =>
                            current === option.value ? "all" : option.value,
                          );
                          setPageIndex(1);
                        }}
                        size="small"
                        sx={{
                          color: CSSVAR.divider,
                          p: 0,
                          mr: 1.2,
                          "&.Mui-checked": { color: BRAND_COLORS.primary },
                        }}
                      />
                    }
                    label={option.label}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      m: 0,
                      py: 0.5,
                      px: 1,
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "background-color 150ms ease",
                      "&:hover": { bgcolor: CSSVAR.paperAlt },
                      "& .MuiFormControlLabel-label": {
                        fontSize: 13.5,
                        fontWeight: selected ? 700 : 500,
                        color: selected
                          ? BRAND_COLORS.primary
                          : BRAND_COLORS.textBody,
                        textAlign: "left",
                        lineHeight: 1.3,
                        userSelect: "none",
                      },
                    }}
                  />
                );
              })}
            </FilterGroup>

            <Divider sx={{ borderColor: BRAND_COLORS.borderLight }} />

            {/* Level Filter */}
            <FilterGroup title="Cấp độ">
              {[
                "Tất cả cấp độ",
                "Người mới bắt đầu",
                "Trung cấp",
                "Nâng cao",
              ].map((level) => {
                const selected = selectedLevel === level;
                return (
                  <FormControlLabel
                    key={level}
                    control={
                      <Checkbox
                        checked={selected}
                        onChange={() => toggleLevel(level)}
                        size="small"
                        sx={{
                          color: CSSVAR.divider,
                          p: 0,
                          mr: 1.2,
                          "&.Mui-checked": { color: BRAND_COLORS.primary },
                        }}
                      />
                    }
                    label={level}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      m: 0,
                      py: 0.5,
                      px: 1,
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "background-color 150ms ease",
                      "&:hover": { bgcolor: CSSVAR.paperAlt },
                      "& .MuiFormControlLabel-label": {
                        fontSize: 13.5,
                        fontWeight: selected ? 700 : 500,
                        color: selected
                          ? BRAND_COLORS.primary
                          : BRAND_COLORS.textBody,
                        textAlign: "left",
                        lineHeight: 1.3,
                        userSelect: "none",
                      },
                    }}
                  />
                );
              })}
            </FilterGroup>

            <Divider sx={{ borderColor: BRAND_COLORS.borderLight }} />

            {/* Rating range filter */}
            <FilterGroup title="Đánh giá">
              <Stack direction="row" spacing={1}>
                <Select<number>
                  size="small"
                  value={ratingFrom}
                  onChange={(event) => {
                    const nextFrom = Number(event.target.value);
                    setRatingFrom(nextFrom);
                    if (nextFrom > ratingTo) setRatingTo(nextFrom);
                    setPageIndex(1);
                  }}
                  renderValue={(value) => `Từ ${value} sao`}
                  sx={{
                    flex: 1,
                    height: 40,
                    borderRadius: "9px",
                    fontSize: 13,
                    bgcolor: CSSVAR.paper,
                    "& fieldset": { borderColor: BRAND_COLORS.borderLight },
                  }}
                >
                  {RATING_MARKS.filter((mark) => mark <= ratingTo).map(
                    (mark) => (
                      <MenuItem key={mark} value={mark}>
                        {mark} sao
                      </MenuItem>
                    ),
                  )}
                </Select>
                <Select<number>
                  size="small"
                  value={ratingTo}
                  onChange={(event) => {
                    const nextTo = Number(event.target.value);
                    setRatingTo(nextTo);
                    if (nextTo < ratingFrom) setRatingFrom(nextTo);
                    setPageIndex(1);
                  }}
                  renderValue={(value) => `Đến ${value} sao`}
                  sx={{
                    flex: 1,
                    height: 40,
                    borderRadius: "9px",
                    fontSize: 13,
                    bgcolor: CSSVAR.paper,
                    "& fieldset": { borderColor: BRAND_COLORS.borderLight },
                  }}
                >
                  {RATING_MARKS.filter((mark) => mark >= ratingFrom).map(
                    (mark) => (
                      <MenuItem key={mark} value={mark}>
                        {mark} sao
                      </MenuItem>
                    ),
                  )}
                </Select>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Rating
                  readOnly
                  precision={0.5}
                  value={ratingFrom || ratingTo}
                  sx={{
                    fontSize: 21,
                    color: STATUS.warning,
                    "& .MuiRating-iconEmpty": { color: CSSVAR.divider },
                  }}
                />
                <Typography
                  sx={{ fontSize: 12.5, color: BRAND_COLORS.textMuted }}
                >
                  {ratingFrom}–{ratingTo} sao
                </Typography>
              </Stack>
            </FilterGroup>
          </Stack>
        </Paper>

        {/* Right Course Grid Panel */}
        <Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{
              mb: 3,
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 1.5,
            }}
          >
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 800,
                color: BRAND_COLORS.textTitle,
              }}
            >
              {loading
                ? "Đang tải danh sách…"
                : `Tìm thấy ${totalCourses} khóa học`}
            </Typography>
            <Paper
              elevation={0}
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1,
                p: 1,
                borderRadius: "10px",
                bgcolor: CSSVAR.paperAlt,
                border: `1px solid ${BRAND_COLORS.borderLight}`,
              }}
            >
              <Typography
                sx={{
                  px: 1,
                  fontSize: 13.5,
                  color: BRAND_COLORS.textMuted,
                  whiteSpace: "nowrap",
                }}
              >
                Sắp xếp theo
              </Typography>
              {(
                [
                  { value: "relevance", label: "Liên quan" },
                  { value: "newest", label: "Mới nhất" },
                  { value: "best-selling", label: "Bán chạy" },
                ] as const
              ).map((option) => {
                const active = sortBy === option.value;
                return (
                  <Button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setPageIndex(1);
                    }}
                    sx={{
                      minWidth: 100,
                      height: 38,
                      px: 2,
                      borderRadius: "6px",
                      bgcolor: active ? BRAND_COLORS.primary : "#ffffff",
                      color: active ? "#ffffff" : BRAND_COLORS.textBody,
                      fontSize: 13.5,
                      fontWeight: active ? 700 : 500,
                      textTransform: "none",
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor: active
                          ? BRAND_COLORS.primaryHover
                          : "rgba(139,19,19,0.06)",
                      },
                    }}
                  >
                    {option.label}
                  </Button>
                );
              })}
              <Select<string>
                size="small"
                displayEmpty
                value={
                  sortBy === "price-low" || sortBy === "price-high"
                    ? sortBy
                    : ""
                }
                onChange={(event) => {
                  setSortBy(event.target.value as CourseSortOption);
                  setPageIndex(1);
                }}
                renderValue={(value) =>
                  value === "price-low"
                    ? "Giá thấp đến cao"
                    : value === "price-high"
                      ? "Giá cao đến thấp"
                      : "Giá"
                }
                sx={{
                  minWidth: 180,
                  height: 38,
                  borderRadius: "4px",
                  bgcolor: CSSVAR.paper,
                  fontSize: 13.5,
                  color: BRAND_COLORS.textBody,
                  "& fieldset": { borderColor: "transparent" },
                  "&:hover fieldset": {
                    borderColor: BRAND_COLORS.primaryBorder,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: BRAND_COLORS.primary,
                  },
                }}
              >
                <MenuItem value="price-low">Giá thấp đến cao</MenuItem>
                <MenuItem value="price-high">Giá cao đến thấp</MenuItem>
              </Select>
            </Paper>
          </Stack>

          {loading ? (
            <Paper
              elevation={0}
              sx={{
                minHeight: 280,
                display: "grid",
                placeItems: "center",
                p: 4,
                borderRadius: "16px",
                border: `1px solid ${BRAND_COLORS.borderLight}`,
                bgcolor: CSSVAR.paper,
              }}
            >
              <Stack
                spacing={2}
                sx={{ alignItems: "center", textAlign: "center" }}
              >
                <CircularProgress
                  size={40}
                  sx={{ color: BRAND_COLORS.primary }}
                />
                <Box>
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: BRAND_COLORS.textTitle,
                    }}
                  >
                    Đang tìm khóa học phù hợp
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 13.5,
                      color: BRAND_COLORS.textMuted,
                    }}
                  >
                    Vui lòng chờ trong giây lát…
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ) : courses.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                  xl: "repeat(3, minmax(0, 1fr))",
                },
                gap: 3,
              }}
            >
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                borderRadius: "16px",
                border: `1px dashed ${BRAND_COLORS.primaryBorder}`,
                textAlign: "center",
                bgcolor: CSSVAR.paper,
              }}
            >
              <QueryStatsRounded
                sx={{ fontSize: 44, color: CSSVAR.textMuted, mb: 2 }}
              />
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: BRAND_COLORS.textTitle,
                  mb: 1,
                }}
              >
                Không tìm thấy khóa học phù hợp
              </Typography>
              <Typography
                sx={{ color: BRAND_COLORS.textMuted, fontSize: 14, mb: 3 }}
              >
                Hãy thử đổi từ khóa khác hoặc xóa bộ lọc để xem thêm lựa chọn.
              </Typography>
              <Button
                variant="outlined"
                onClick={resetFilters}
                sx={{
                  textTransform: "none",
                  borderColor: BRAND_COLORS.primary,
                  color: BRAND_COLORS.primary,
                  fontWeight: 600,
                  fontSize: 14,
                  borderRadius: "8px",
                  px: 3,
                  py: 0.8,
                  "&:hover": {
                    bgcolor: BRAND_COLORS.primarySoft,
                    borderColor: BRAND_COLORS.primaryHover,
                  },
                }}
              >
                Xóa bộ lọc
              </Button>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
}
