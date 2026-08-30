/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Autocomplete,
  Box,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Skeleton,
  Pagination,
  IconButton,
  Tooltip,
  alpha,
  MenuItem,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";

import AuthGuard from "@/src/components/AuthGuard";
import { COLORS, FONTS } from "@/src/app/admin/approve-courses/types/constants";

const PAGE_SIZE = 20;
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import KhoaHocService from "@/src/services/KhoaHocService";
import KiemDuyetService from "@/src/services/KiemDuyetServide";
import type { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import { CSSVAR, RADIUS, SHADOWS } from "@/src/theme/tokens";

const khoaHocService = new KhoaHocService();
const kiemDuyetService = new KiemDuyetService();

const FILE_BASE_URL =
  process.env.NEXT_PUBLIC_FILE_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "";

const DEFAULT_SORT = "moi-nhat";

type SortOption = "moi-nhat" | "cu-nhat";

interface CourseFilters {
  keyword: string;
  creatorKey: string;
  fromDate: string;
  toDate: string;
  sort: SortOption;
}

interface CreatorOption {
  key: string;
  id?: string;
  label: string;
}

type PublishedCourse = KhoaHocType & {
  idKhoaHoc?: string;
  anhBia?: string | null;
  createdDate?: string | Date;
};

const DEFAULT_FILTERS: CourseFilters = {
  keyword: "",
  creatorKey: "",
  fromDate: "",
  toDate: "",
  sort: DEFAULT_SORT,
};

/**
 * Normalize text for Vietnamese accent-insensitive search
 */
function normalizeText(value: string = ""): string {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getCourseTimestamp(course: PublishedCourse): number | null {
  if (!course.createdDate) return null;
  const timestamp = new Date(course.createdDate).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function filtersEqual(left: CourseFilters, right: CourseFilters): boolean {
  return (
    left.keyword === right.keyword &&
    left.creatorKey === right.creatorKey &&
    left.fromDate === right.fromDate &&
    left.toDate === right.toDate &&
    left.sort === right.sort
  );
}

function mix(cssColor: string, opacity: number) {
  const pct = Math.round(Math.max(0, Math.min(1, opacity)) * 100);
  return `color-mix(in srgb, ${cssColor} ${pct}%, transparent)`;
}

function resolveImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = FILE_BASE_URL.replace(/\/$/, "");
  const rel = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${rel}` : path;
}

function CourseThumbnail({
  src,
  alt,
  width = 160,
}: {
  src?: string | null;
  alt: string;
  width?: number;
}) {
  const [errored, setErrored] = useState(false);
  const resolved = resolveImageUrl(src);
  const showFallback = !resolved || errored;

  return (
    <Box sx={{ position: "relative", flexShrink: 0, width }}>
      {showFallback ? (
        <Box
          sx={{
            width: "100%",
            aspectRatio: "16/9",
            borderRadius: 1.25,
            bgcolor: COLORS.paper,
            border: `1px solid ${COLORS.line}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ImageRoundedIcon sx={{ color: mix(COLORS.primary, 0.25) }} />
        </Box>
      ) : (
        <Box
          component="img"
          src={resolved}
          alt={alt}
          onError={() => setErrored(true)}
          sx={{
            width: "100%",
            aspectRatio: "16/9",
            borderRadius: 2,
            objectFit: "cover",
            bgcolor: COLORS.line,
            display: "block",
          }}
        />
      )}

      {/* Huy hiệu đã duyệt — gắn trực tiếp lên ảnh */}
      <Tooltip title="Khóa học đã được duyệt">
        <Box
          sx={{
            position: "absolute",
            bottom: -6,
            right: -6,
            width: 22,
            height: 22,
            borderRadius: "50%",
            bgcolor: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
          }}
        >
          <VerifiedRoundedIcon sx={{ fontSize: 18, color: "success.main" }} />
        </Box>
      </Tooltip>
    </Box>
  );
}

export default function LichSuKiemDuyetPage() {
  const router = useRouter();

  const [draftFilters, setDraftFilters] =
    useState<CourseFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<CourseFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  // ── Data state ──
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PublishedCourse[]>([]);

  // Dialog state for stopping course
  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [stopReason, setStopReason] = useState("");
  const [stopReasonError, setStopReasonError] = useState("");
  const [submittingStop, setSubmittingStop] = useState(false);

  // Snackbar feedback
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const hasAppliedFilters = !filtersEqual(appliedFilters, DEFAULT_FILTERS);
  const hasUnappliedChanges = !filtersEqual(draftFilters, appliedFilters);
  const isFilterDirty =
    !filtersEqual(draftFilters, DEFAULT_FILTERS) || hasAppliedFilters;
  const isDateRangeInvalid = Boolean(
    draftFilters.fromDate &&
    draftFilters.toDate &&
    draftFilters.fromDate > draftFilters.toDate,
  );

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await khoaHocService.GetListKhoaHocPhatHanh({
        pageIndex: 1,
        pageSize: -1,
      });
      if (res?.data) {
        setItems(res.data.items || []);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách khóa học đã phát hành:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isDateRangeInvalid) return;
    setAppliedFilters({
      ...draftFilters,
      keyword: draftFilters.keyword.trim(),
    });
    setPage(1);
  };

  const handleResetFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const handleOpenCourse = (id: string) => {
    if (!id) return;
    router.push(`/admin/inspect-courses/${id}`);
  };

  const handleOpenHistory = () => {
    router.push("/admin/inspect-courses/history");
  };

  const handleGoBack = () => {
    router.push("/admin/courses");
  };

  // Stop course handlers
  const handleOpenStopDialog = (id: string) => {
    setSelectedCourseId(id);
    setStopReason("");
    setStopReasonError("");
    setStopDialogOpen(true);
  };

  const handleCloseStopDialog = () => {
    setStopDialogOpen(false);
    setSelectedCourseId(null);
    setStopReason("");
    setStopReasonError("");
  };

  const handleConfirmStop = async () => {
    if (!selectedCourseId) return;
    if (!stopReason.trim()) {
      setStopReasonError("Vui lòng nhập lý do ngưng hoạt động.");
      return;
    }
    setSubmittingStop(true);
    try {
      await kiemDuyetService.KiemDuyetKhoaHoc({
        idKhoaHoc: selectedCourseId,
        trangThaiPheDuyet: "TuChoi",
        lyDo: stopReason.trim(),
      });
      setSnackbar({
        open: true,
        message: "Đã ngưng hoạt động khóa học thành công.",
        severity: "success",
      });
      // Refresh data
      await fetchList();
      handleCloseStopDialog();
    } catch (error: unknown) {
      console.error("Lỗi khi ngưng hoạt động:", error);
      setSnackbar({
        open: true,
        message:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra, vui lòng thử lại.",
        severity: "error",
      });
    } finally {
      setSubmittingStop(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const creatorOptions = useMemo<CreatorOption[]>(() => {
    const creators = new Map<string, CreatorOption>();
    items.forEach((course) => {
      const label = course.createdBy?.trim();
      if (!label) return;
      const id = course.createdId?.trim();
      const key = id ? `id:${id}` : `name:${normalizeText(label)}`;
      if (!creators.has(key)) creators.set(key, { key, id, label });
    });
    return Array.from(creators.values()).sort((a, b) =>
      a.label.localeCompare(b.label, "vi"),
    );
  }, [items]);

  const creatorAutocompleteOptions = useMemo<CreatorOption[]>(
    () => [{ key: "", label: "Tất cả người tạo" }, ...creatorOptions],
    [creatorOptions],
  );

  const selectedCreator =
    creatorAutocompleteOptions.find(
      (option) => option.key === draftFilters.creatorKey,
    ) ?? creatorAutocompleteOptions[0];

  const filteredItems = useMemo(() => {
    const normalizedKeyword = normalizeText(appliedFilters.keyword);
    const creator = creatorOptions.find(
      (option) => option.key === appliedFilters.creatorKey,
    );
    const fromTimestamp = appliedFilters.fromDate
      ? new Date(`${appliedFilters.fromDate}T00:00:00.000`).getTime()
      : null;
    const toTimestamp = appliedFilters.toDate
      ? new Date(`${appliedFilters.toDate}T23:59:59.999`).getTime()
      : null;

    const filtered = items.filter((course) => {
      if (
        normalizedKeyword &&
        !normalizeText(course.tieuDe ?? "").includes(normalizedKeyword)
      ) {
        return false;
      }

      if (creator) {
        const matchesCreator = creator.id
          ? course.createdId === creator.id
          : normalizeText(course.createdBy ?? "") ===
            normalizeText(creator.label);
        if (!matchesCreator) return false;
      }

      if (fromTimestamp !== null || toTimestamp !== null) {
        const courseTimestamp = getCourseTimestamp(course);
        if (courseTimestamp === null) return false;
        if (fromTimestamp !== null && courseTimestamp < fromTimestamp)
          return false;
        if (toTimestamp !== null && courseTimestamp > toTimestamp) return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      const aTime = getCourseTimestamp(a);
      const bTime = getCourseTimestamp(b);
      if (aTime === null && bTime === null) return 0;
      if (aTime === null) return 1;
      if (bTime === null) return -1;
      return appliedFilters.sort === "cu-nhat" ? aTime - bTime : bTime - aTime;
    });
  }, [items, appliedFilters, creatorOptions]);

  const totalPage = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  // Result label
  const resultLabel = useMemo(() => {
    const count = filteredItems.length;
    const hasFilter =
      appliedFilters.keyword !== "" ||
      appliedFilters.creatorKey !== "" ||
      appliedFilters.fromDate !== "" ||
      appliedFilters.toDate !== "";

    if (loading) return null;
    if (hasFilter) {
      return `${count} khóa học được tìm thấy`;
    }
    return `${items.length} khóa học`;
  }, [filteredItems.length, items.length, loading, appliedFilters]);

  const tongDaDuyet = items.length;
  const loadingStats = loading;
  const filterControlSx = {
    width: "100%",
    minWidth: 0,
    "& .MuiOutlinedInput-root": {
      minHeight: 44,
      borderRadius: `${RADIUS.base}px`,
      bgcolor: COLORS.paperRaised,
      transition: "border-color 120ms ease, box-shadow 120ms ease",
      "& fieldset": { borderColor: COLORS.line },
      "&:hover fieldset": { borderColor: mix(COLORS.primary, 0.65) },
      "&.Mui-focused": { boxShadow: SHADOWS.focus },
      "&.Mui-focused fieldset": {
        borderColor: COLORS.primary,
        borderWidth: 1.5,
      },
    },
    "& .MuiInputLabel-root": { fontSize: 14 },
  } as const;

  return (
    <AuthGuard allowedRoles={["Admin"]}>
      <DashboardShell>
        <Box
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            width: "100%",
            fontFamily: FONTS.display,
          }}
        >
          {/* Hero — tiêu đề, quay lại và số liệu gộp thành một dải duy nhất */}
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "20px",
              border: `1px solid ${COLORS.line}`,
              bgcolor: CSSVAR.paper,
              p: { xs: 2.5, sm: 3.5 },
              mb: 2.5,
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            <SchoolRoundedIcon
              sx={{
                position: "absolute",
                right: -18,
                top: -18,
                fontSize: 160,
                color: mix(COLORS.primary, 0.06),
                transform: "rotate(-12deg)",
              }}
            />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 2.5, sm: 2 }}
              sx={{
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                position: "relative",
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center", minWidth: 0 }}
              >
                <Tooltip title="Quay lại danh sách phê duyệt">
                  <IconButton
                    onClick={handleGoBack}
                    sx={{
                      border: `1px solid ${COLORS.line}`,
                      borderRadius: 2,
                      color: COLORS.ink,
                      bgcolor: "#fff",
                      flexShrink: 0,
                      "&:hover": {
                        borderColor: COLORS.primary,
                        color: COLORS.primary,
                        bgcolor: mix(COLORS.primary, 0.06),
                      },
                    }}
                  >
                    <ArrowBackRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: { xs: 20, sm: 25 },
                      fontWeight: 700,
                      fontFamily: FONTS.display,
                      color: COLORS.ink,
                      lineHeight: 1.25,
                    }}
                  >
                    Khóa học đã phát hành
                  </Typography>
                  <Typography
                    sx={{ fontSize: 13, color: COLORS.inkSoft, mt: 0.25 }}
                  >
                    Danh sách các khóa học đã được phê duyệt và đang phát hành
                    trên Eduverse.
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: "center",
                  alignSelf: { xs: "stretch", sm: "center" },
                  flexWrap: "wrap",
                  gap: 1.5,
                }}
              >
                <Tooltip title="Lịch sử xem xét">
                  <IconButton
                    onClick={handleOpenHistory}
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "14px",
                      flexShrink: 0,
                      color: COLORS.primary,
                      bgcolor: alpha(COLORS.primary, 0.08),
                      border: `1px solid ${alpha(COLORS.primary, 0.14)}`,
                      transition: "all .18s ease",
                      "&:hover": {
                        bgcolor: alpha(COLORS.primary, 0.16),
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <HistoryRoundedIcon sx={{ fontSize: 22 }} />
                  </IconButton>
                </Tooltip>

                <Stack
                  direction="row"
                  spacing={1.25}
                  sx={{
                    alignItems: "center",
                    pl: { xs: 0, sm: 2 },
                    borderLeft: {
                      xs: "none",
                      sm: `1px solid ${mix(COLORS.ink, 0.08)}`,
                    },
                    flexShrink: 0,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: alpha("#16A34A", 0.12),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <VerifiedRoundedIcon
                      sx={{ color: "success.main", fontSize: 22 }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: COLORS.ink,
                        lineHeight: 1.1,
                        fontFamily: FONTS.display,
                      }}
                    >
                      {loadingStats ? (
                        <CircularProgress
                          size={18}
                          sx={{ color: "success.main" }}
                        />
                      ) : (
                        tongDaDuyet
                      )}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 11.5,
                        color: COLORS.inkSoft,
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                        fontWeight: 600,
                      }}
                    >
                      Khóa học đã phát hành
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Stack>
          </Box>

          {/* ── Main Content Card ── */}
          <Box
            sx={{
              borderRadius: 3,
              border: `1px solid ${COLORS.line}`,
              bgcolor: "#fff",
              overflow: "hidden",
            }}
          >
            {/* ── Filter Bar ── */}
            <Box
              component="form"
              onSubmit={handleSearchSubmit}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderBottom: `1px solid ${COLORS.line}`,
                bgcolor: COLORS.paper,
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 0.75, sm: 1.5 }}
                sx={{
                  alignItems: { xs: "flex-start", sm: "center" },
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Box>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ alignItems: "center" }}
                  >
                    <FilterListRoundedIcon
                      aria-hidden="true"
                      sx={{ fontSize: 18, color: COLORS.primary }}
                    />
                    <Typography
                      component="h2"
                      sx={{ fontSize: 14, fontWeight: 800, color: COLORS.ink }}
                    >
                      Tìm kiếm &amp; bộ lọc
                    </Typography>
                  </Stack>
                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 12.5,
                      lineHeight: 1.45,
                      color: COLORS.inkSoft,
                    }}
                  >
                    Chọn điều kiện, sau đó bấm Tìm kiếm để áp dụng.
                  </Typography>
                </Box>

                {(hasAppliedFilters || hasUnappliedChanges) && (
                  <Chip
                    label={hasUnappliedChanges ? "Chưa áp dụng" : "Đang lọc"}
                    size="small"
                    sx={{
                      height: 26,
                      fontSize: 11,
                      fontWeight: 700,
                      bgcolor: hasUnappliedChanges
                        ? mix(COLORS.gold, 0.12)
                        : mix(COLORS.primary, 0.1),
                      color: hasUnappliedChanges ? COLORS.gold : COLORS.primary,
                      border: `1px solid ${
                        hasUnappliedChanges
                          ? mix(COLORS.gold, 0.24)
                          : mix(COLORS.primary, 0.18)
                      }`,
                    }}
                  />
                )}
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
                  gap: { xs: 1.5, sm: 1.75 },
                  alignItems: "start",
                }}
              >
                {/* Draft values only. Results change after submit. */}
                <TextField
                  size="small"
                  fullWidth
                  label="Tên khóa học"
                  placeholder="Ví dụ: AWS, React..."
                  value={draftFilters.keyword}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      keyword: event.target.value,
                    }))
                  }
                  sx={{
                    ...filterControlSx,
                    gridColumn: { xs: "span 12", sm: "span 12", md: "span 6" },
                  }}
                  slotProps={{
                    htmlInput: { "aria-label": "Tìm kiếm khóa học" },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon
                            sx={{ color: COLORS.inkSoft, fontSize: 19 }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Autocomplete
                  size="small"
                  openOnFocus
                  autoHighlight
                  clearOnEscape
                  options={creatorAutocompleteOptions}
                  value={selectedCreator}
                  onChange={(_, option) =>
                    setDraftFilters((current) => ({
                      ...current,
                      creatorKey: option?.key ?? "",
                    }))
                  }
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) =>
                    option.key === value.key
                  }
                  filterOptions={(options, state) => {
                    const keyword = normalizeText(state.inputValue);
                    if (!keyword) return options;
                    return options.filter(
                      (option) =>
                        option.key !== "" &&
                        normalizeText(option.label).includes(keyword),
                    );
                  }}
                  noOptionsText="Không tìm thấy người tạo phù hợp"
                  sx={{
                    ...filterControlSx,
                    gridColumn: { xs: "span 12", sm: "span 12", md: "span 6" },
                    "& .MuiOutlinedInput-root": {
                      ...filterControlSx["& .MuiOutlinedInput-root"],
                      height: 44,
                      py: 0,
                    },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Người tạo"
                      placeholder="Tìm người tạo..."
                      slotProps={{
                        inputLabel: params.slotProps.inputLabel,
                        htmlInput: params.slotProps.htmlInput,
                        input: {
                          ...params.slotProps.input,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <PersonRoundedIcon
                                  sx={{ fontSize: 17, color: COLORS.inkSoft }}
                                />
                              </InputAdornment>
                              {params.slotProps.input.startAdornment}
                            </>
                          ),
                        },
                      }}
                    />
                  )}
                />

                <TextField
                  size="small"
                  type="date"
                  label="Từ ngày"
                  value={draftFilters.fromDate}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      fromDate: event.target.value,
                    }))
                  }
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: {
                      max: draftFilters.toDate || undefined,
                      "aria-describedby": isDateRangeInvalid
                        ? "course-date-range-error"
                        : undefined,
                    },
                  }}
                  error={isDateRangeInvalid}
                  sx={{
                    ...filterControlSx,
                    gridColumn: { xs: "span 12", sm: "span 6", md: "span 3" },
                  }}
                />

                <TextField
                  size="small"
                  type="date"
                  label="Đến ngày"
                  value={draftFilters.toDate}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      toDate: event.target.value,
                    }))
                  }
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: {
                      min: draftFilters.fromDate || undefined,
                      "aria-describedby": isDateRangeInvalid
                        ? "course-date-range-error"
                        : undefined,
                    },
                  }}
                  error={isDateRangeInvalid}
                  sx={{
                    ...filterControlSx,
                    gridColumn: { xs: "span 12", sm: "span 6", md: "span 3" },
                  }}
                />

                {/* Sort dropdown */}
                <TextField
                  select
                  size="small"
                  label="Sắp xếp"
                  value={draftFilters.sort}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      sort: event.target.value as SortOption,
                    }))
                  }
                  slotProps={{
                    select: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SwapVertRoundedIcon
                            aria-hidden="true"
                            sx={{ fontSize: 18, color: COLORS.inkSoft }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    ...filterControlSx,
                    gridColumn: { xs: "span 12", sm: "span 6", md: "span 3" },
                  }}
                >
                  <MenuItem value="moi-nhat">Mới nhất</MenuItem>
                  <MenuItem value="cu-nhat">Cũ nhất</MenuItem>
                </TextField>

                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    minWidth: 0,
                    width: "100%",
                    gridColumn: { xs: "span 12", sm: "span 6", md: "span 3" },
                    alignItems: "center",
                  }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isDateRangeInvalid}
                    startIcon={<SearchIcon aria-hidden="true" />}
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      height: 44,
                      borderRadius: `${RADIUS.base}px`,
                      bgcolor: COLORS.primary,
                      boxShadow: "none",
                      whiteSpace: "nowrap",
                      fontWeight: 700,
                      fontSize: 14,
                      "&:hover": {
                        bgcolor: COLORS.primaryDark,
                        boxShadow: SHADOWS.sm,
                      },
                      "&.Mui-focusVisible": { boxShadow: SHADOWS.focus },
                    }}
                  >
                    Tìm kiếm
                  </Button>

                  {isFilterDirty && (
                    <Tooltip title="Đặt lại tất cả bộ lọc">
                      <Button
                        variant="outlined"
                        onClick={handleResetFilters}
                        startIcon={<RestartAltRoundedIcon aria-hidden="true" />}
                        sx={{
                          flex: { xs: 1, sm: "0 0 auto" },
                          minWidth: { xs: 0, sm: "auto" },
                          px: { sm: 1.75 },
                          height: 44,
                          borderRadius: `${RADIUS.base}px`,
                          borderColor: COLORS.line,
                          color: COLORS.inkSoft,
                          bgcolor: COLORS.paperRaised,
                          whiteSpace: "nowrap",
                          fontWeight: 700,
                          fontSize: 13,
                          "&:hover": {
                            borderColor: COLORS.primary,
                            color: COLORS.primary,
                            bgcolor: mix(COLORS.primary, 0.05),
                          },
                          "&.Mui-focusVisible": { boxShadow: SHADOWS.focus },
                        }}
                      >
                        Đặt lại
                      </Button>
                    </Tooltip>
                  )}
                </Box>
              </Box>

              {isDateRangeInvalid && (
                <Typography
                  id="course-date-range-error"
                  role="alert"
                  sx={{
                    mt: 1,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "error.main",
                  }}
                >
                  Từ ngày không được sau Đến ngày.
                </Typography>
              )}
            </Box>

            {/* ── Result count bar ── */}
            <Box
              sx={{
                px: 2,
                py: 1,
                borderBottom: `1px solid ${COLORS.line}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                minHeight: 38,
              }}
            >
              {loading ? (
                <Skeleton width={120} height={16} />
              ) : (
                <Typography
                  sx={{ fontSize: 13, color: COLORS.inkSoft, fontWeight: 500 }}
                >
                  {resultLabel}
                </Typography>
              )}
            </Box>

            {/* ── Course list ── */}
            <Box sx={{ p: 2 }}>
              {loading ? (
                <Stack spacing={1.5}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      variant="rounded"
                      height={100}
                      sx={{ borderRadius: 2.5 }}
                    />
                  ))}
                </Stack>
              ) : filteredItems.length === 0 ? (
                /* ── Empty state ── */
                <Box sx={{ py: 7, textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      bgcolor: COLORS.paper,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    <SearchOffRoundedIcon
                      sx={{ fontSize: 30, color: mix(COLORS.primary, 0.35) }}
                    />
                  </Box>
                  <Typography
                    sx={{
                      color: COLORS.ink,
                      fontSize: 15,
                      fontWeight: 700,
                      mb: 0.5,
                    }}
                  >
                    Không tìm thấy khóa học phù hợp.
                  </Typography>
                  <Typography
                    variant="caption"
                    color={COLORS.inkSoft}
                    sx={{
                      display: "block",
                      mb: 2.5,
                      maxWidth: 360,
                      mx: "auto",
                    }}
                  >
                    Thử thay đổi từ khóa hoặc bộ lọc để xem kết quả khác.
                  </Typography>
                  {isFilterDirty && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleResetFilters}
                      startIcon={<RestartAltRoundedIcon fontSize="small" />}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: 2,
                        borderColor: COLORS.line,
                        color: COLORS.inkSoft,
                        "&:hover": {
                          borderColor: COLORS.primary,
                          color: COLORS.primary,
                        },
                      }}
                    >
                      Xóa bộ lọc
                    </Button>
                  )}
                </Box>
              ) : (
                <Stack spacing={1.25}>
                  {paginatedItems.map((item) => {
                    const id = String(item.id || item.idKhoaHoc || "");

                    return (
                      <Box
                        key={id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 1.5,
                          border: `1px solid ${COLORS.line}`,
                          borderRadius: 2.5,
                          bgcolor: "#fff",
                          transition: "all .18s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: `0 8px 20px ${mix(
                              COLORS.primary,
                              0.12,
                            )}`,
                            borderColor: mix(COLORS.primary, 0.4),
                          },
                        }}
                      >
                        <CourseThumbnail
                          src={item.hinhAnhKhoaHoc || item.anhBia}
                          alt={item.tieuDe || "Khóa học"}
                        />

                        <Box
                          sx={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                          onClick={() => handleOpenCourse(id)}
                        >
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: 15,
                              color: COLORS.ink,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              mb: 0.5,
                            }}
                          >
                            {item.tieuDe || "Khóa học"}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1.75}
                            useFlexGap
                            sx={{ alignItems: "center", flexWrap: "wrap" }}
                          >
                            {item.createdDate && (
                              <Stack
                                direction="row"
                                spacing={0.5}
                                sx={{ alignItems: "center" }}
                              >
                                <CalendarTodayRoundedIcon
                                  sx={{
                                    fontSize: 13,
                                    color: mix(COLORS.inkSoft, 0.8),
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  color={COLORS.inkSoft}
                                >
                                  {new Date(
                                    item.createdDate,
                                  ).toLocaleDateString("vi-VN")}
                                </Typography>
                              </Stack>
                            )}
                            {item.createdBy && (
                              <Stack
                                direction="row"
                                spacing={0.5}
                                sx={{ alignItems: "center" }}
                              >
                                <PersonRoundedIcon
                                  sx={{
                                    fontSize: 13,
                                    color: mix(COLORS.inkSoft, 0.8),
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  color={COLORS.inkSoft}
                                >
                                  {item.createdBy}
                                </Typography>
                              </Stack>
                            )}
                          </Stack>
                        </Box>

                        <Stack
                          direction="row"
                          spacing={0.25}
                          sx={{ alignItems: "center", flexShrink: 0 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Replace view button with stop button */}
                          <Tooltip title="Ngưng hoạt động khóa học">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenStopDialog(id);
                              }}
                              sx={{ color: mix(COLORS.ink, 0.5) }}
                            >
                              <BlockRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              )}

              {!loading && filteredItems.length > 0 && totalPage > 1 && (
                <Stack
                  direction="row"
                  sx={{ justifyContent: "center", pt: 2.5 }}
                >
                  <Pagination
                    count={totalPage}
                    page={page}
                    onChange={(_, v) => setPage(v)}
                    shape="rounded"
                    size="small"
                    sx={{
                      "& .Mui-selected": {
                        bgcolor: `${COLORS.primary} !important`,
                        color: "#fff",
                      },
                    }}
                  />
                </Stack>
              )}
            </Box>
          </Box>
        </Box>

        {/* Dialog xác nhận ngưng hoạt động */}
        <Dialog
          open={stopDialogOpen}
          onClose={handleCloseStopDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700, color: COLORS.ink }}>
            Ngưng hoạt động khóa học
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Lý do ngưng hoạt động"
              fullWidth
              multiline
              rows={3}
              required
              error={Boolean(stopReasonError)}
              helperText={stopReasonError}
              value={stopReason}
              onChange={(e) => {
                setStopReason(e.target.value);
                if (stopReasonError && e.target.value.trim()) {
                  setStopReasonError("");
                }
              }}
              placeholder="Nhập lý do ngưng hoạt động (bắt buộc)..."
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              onClick={handleCloseStopDialog}
              disabled={submittingStop}
              sx={{ color: COLORS.inkSoft, textTransform: "none" }}
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleConfirmStop}
              variant="contained"
              disabled={submittingStop || !stopReason.trim()}
              sx={{
                bgcolor: "error.main",
                textTransform: "none",
                "&:hover": { bgcolor: "error.dark" },
              }}
            >
              {submittingStop ? <CircularProgress size={20} /> : "Xác nhận"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar thông báo */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </DashboardShell>
    </AuthGuard>
  );
}
