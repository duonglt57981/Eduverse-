/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
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
  Select,
  MenuItem,
  Menu,
  Button,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import AuthGuard from "@/src/components/AuthGuard";
import {
  COLORS,
  FONTS,
  PAGE_SIZE,
  isTrangThaiCho,
  normalizeListResponse,
} from "./types/constants";
import { StatusChip } from "./types";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import { STATUS } from "@/src/theme/tokens";
import KiemDuyetService from "@/src/services/KiemDuyetServide";
import AssignReviewerDialog from "./components/AssignReviewerDialog";
import { useSelector } from "@/src/store/hook";
import {
  KhoaHocKiemDuyetListDto,
  KiemDuyetSearchDto,
  NhanVienPheDuyetDto,
  PhanCongKiemDuyetResultDto,
} from "@/src/types/KiemDuyet/Dto/dto";

const kiemDuyetService = new KiemDuyetService();

const FILE_BASE_URL =
  process.env.NEXT_PUBLIC_FILE_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "";

const DEFAULT_SORT = "cu-nhat";
const DEFAULT_TAB: "ChoDuyet" | "TatCa" | "DangDuyet" = "TatCa";
const DEFAULT_ASSIGNMENT = "TatCa";

function resolveImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = FILE_BASE_URL.replace(/\/$/, "");
  const rel = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${rel}` : path;
}

function CourseThumbnail({ src, alt }: { src?: string | null; alt: string }) {
  const [errored, setErrored] = useState(false);
  const resolved = resolveImageUrl(src);

  if (!resolved || errored) {
    return (
      <Box
        sx={{
          width: 132,
          height: 84,
          borderRadius: "14px",
          flexShrink: 0,
          bgcolor: "var(--ev-paper-alt, #FBFAF9)",
          border: "1px dashed var(--ev-divider, #ECE7E4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ImageRoundedIcon sx={{ color: "var(--ev-grey, #8A7676)", fontSize: 30 }} />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={resolved}
      alt={alt}
      onError={() => setErrored(true)}
      sx={{
        width: 132,
        height: 84,
        borderRadius: "14px",
        objectFit: "cover",
        flexShrink: 0,
        bgcolor: "var(--ev-paper-alt, #FBFAF9)",
        border: "1px solid var(--ev-divider, #ECE7E4)",
      }}
    />
  );
}

export default function DuyetKhoaHocPage() {
  const router = useRouter();
  const roles = useSelector((state) => state.auth.roles) ?? [];
  const isAdmin = roles.includes("Admin");

  const [tab, setTab] = useState<"ChoDuyet" | "TatCa" | "DangDuyet">(
    DEFAULT_TAB,
  );
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);
  const [assignmentStatus, setAssignmentStatus] = useState<
    "TatCa" | "ChuaPhanCong" | "DaPhanCong"
  >(DEFAULT_ASSIGNMENT);
  const [reviewerId, setReviewerId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [items, setItems] = useState<KhoaHocKiemDuyetListDto[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const [stats, setStats] = useState({ choDuyet: 0, dangDuyet: 0 });
  const [reviewers, setReviewers] = useState<NhanVienPheDuyetDto[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(new Set());
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [courseIdsToAssign, setCourseIdsToAssign] = useState<string[]>([]);
  const [actionMenu, setActionMenu] = useState<{
    anchorEl: HTMLElement;
    course: KhoaHocKiemDuyetListDto;
  } | null>(null);
  const [approvingCourseId, setApprovingCourseId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const isFilterDirty =
    keywordInput.trim() !== "" ||
    keyword.trim() !== "" ||
    sortBy !== DEFAULT_SORT ||
    assignmentStatus !== DEFAULT_ASSIGNMENT ||
    reviewerId !== "" ||
    fromDate !== "" ||
    toDate !== "" ||
    tab !== DEFAULT_TAB;

  const searchParams = useMemo(() => {
    const params: KiemDuyetSearchDto = {
      pageIndex: page,
      pageSize: PAGE_SIZE,
    };
    if (keyword.trim()) params.keyword = keyword.trim();
    if (tab !== "TatCa") params.trangThaiPheDuyet = tab;
    if (assignmentStatus !== "TatCa") {
      params.trangThaiPhanCong = assignmentStatus;
    }
    if (reviewerId) params.idNguoiDuyet = reviewerId;
    if (fromDate) params.tuNgay = fromDate;
    if (toDate) params.denNgay = toDate;
    switch (sortBy) {
      case "moi-nhat":
        params.sapXepNgay = "Moi";
        break;
      case "cu-nhat":
        params.sapXepNgay = "Cu";
        break;
      case "ten-a-z":
        params.sapXepTen = "AZ";
        break;
      case "ten-z-a":
        params.sapXepTen = "ZA";
        break;
      default:
        params.sapXepNgay = "Cu";
    }
    return params;
  }, [keyword, tab, assignmentStatus, reviewerId, fromDate, toDate, sortBy, page]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await kiemDuyetService.GetListKiemDuyetKhoaHoc(searchParams);
      if (res.status === false) throw new Error(res.message);
      const { list, totalPage: tp } = normalizeListResponse(res, PAGE_SIZE);
      setItems(list as KhoaHocKiemDuyetListDto[]);
      setTotalPage(tp);
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
      setItems([]);
      setTotalPage(1);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const params: KiemDuyetSearchDto = { pageIndex: 1, pageSize: 1000 };
      const res = await kiemDuyetService.GetListKiemDuyetKhoaHoc(params);
      if (res.status === false) throw new Error(res.message);
      const { list } = normalizeListResponse(res, 1000);
      setStats({
        choDuyet: list.filter((x: any) => x.trangThaiPheDuyet === "ChoDuyet")
          .length,
        dangDuyet: list.filter((x: any) => x.trangThaiPheDuyet === "DangDuyet")
          .length,
      });
    } catch (e) {
      console.error("Lỗi tải thống kê:", e);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchReviewers = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await kiemDuyetService.GetDanhSachNhanVien({
        pageIndex: 1,
        pageSize: 50,
      });
      if (res.status === false) throw new Error(res.message);
      const { list } = normalizeListResponse(res, 50);
      setReviewers(list as NhanVienPheDuyetDto[]);
    } catch (error) {
      console.error("Lỗi tải danh sách chuyên viên:", error);
      setReviewers([]);
    }
  }, [isAdmin]);

  // Fetch khi component mount
  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Fetch stats khi mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    void fetchReviewers();
  }, [fetchReviewers]);

  useEffect(() => {
    setSelectedCourseIds(new Set());
  }, [keyword, tab, assignmentStatus, reviewerId, fromDate, toDate, sortBy]);

  const handleTabChange = (_: any, newTab: string) => {
    setTab(newTab as any);
    setPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(keywordInput.trim());
    setPage(1);
  };

  const handleSortChange = (e: any) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const handleAssignmentStatusChange = (e: any) => {
    const value = e.target.value as
      | "TatCa"
      | "ChuaPhanCong"
      | "DaPhanCong";
    setAssignmentStatus(value);
    if (value === "ChuaPhanCong") setReviewerId("");
    setPage(1);
  };

  const handleResetFilters = () => {
    setKeywordInput("");
    setKeyword("");
    setSortBy(DEFAULT_SORT);
    setAssignmentStatus(DEFAULT_ASSIGNMENT);
    setReviewerId("");
    setFromDate("");
    setToDate("");
    setTab(DEFAULT_TAB);
    setPage(1);
  };

  const handleOpenCourse = (id: string) => {
    if (!id) return;
    router.push(`/admin/approve-courses/${id}`);
  };

  const handleOpenHistory = () => {
    router.push(`/admin/approve-courses/history`);
  };

  const handleGoBack = () => {
    router.push("/admin/courses");
  };

  const eligibleItems = useMemo(
    () => items.filter((item) => isTrangThaiCho(item.trangThaiPheDuyet)),
    [items],
  );
  const selectedOnPage = eligibleItems.filter((item) => selectedCourseIds.has(item.idKhoaHoc)).length;
  const allOnPageSelected = eligibleItems.length > 0 && selectedOnPage === eligibleItems.length;
  const someOnPageSelected = selectedOnPage > 0 && !allOnPageSelected;

  const toggleCourse = (courseId: string) => {
    setSelectedCourseIds((current) => {
      const next = new Set(current);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  };

  const toggleCurrentPage = () => {
    setSelectedCourseIds((current) => {
      const next = new Set(current);
      eligibleItems.forEach((item) => {
        if (allOnPageSelected) next.delete(item.idKhoaHoc);
        else next.add(item.idKhoaHoc);
      });
      return next;
    });
  };

  const handleAssigned = async (result: PhanCongKiemDuyetResultDto) => {
    setAssignDialogOpen(false);
    setCourseIdsToAssign([]);
    setSelectedCourseIds(new Set());
    setSnackbar({
      open: true,
      severity: "success",
      message: `Đã phân công ${result.soKhoaHocDaPhan} khóa học cho ${result.tenNguoiDuyet}.`,
    });
    await Promise.all([fetchList(), fetchStats()]);
  };

  const handleConflict = (message: string) => {
    setAssignDialogOpen(false);
    setCourseIdsToAssign([]);
    setSelectedCourseIds(new Set());
    setSnackbar({
      open: true,
      severity: "error",
      message,
    });
    void fetchList();
  };

  const openAssignmentDialog = (courseIds: string[]) => {
    if (courseIds.length === 0) return;
    setCourseIdsToAssign(courseIds);
    setAssignDialogOpen(true);
  };

  const closeActionMenu = () => setActionMenu(null);

  const handleApproveCourse = async (course: KhoaHocKiemDuyetListDto) => {
    const courseId = course.idKhoaHoc;
    if (!courseId || approvingCourseId) return;
    closeActionMenu();
    setApprovingCourseId(courseId);
    try {
      const response = await kiemDuyetService.KiemDuyetKhoaHoc({
        idKhoaHoc: courseId,
        trangThaiPheDuyet: "DaDuyet",
      });
      if (response.status === false) throw new Error(response.message);
      setSelectedCourseIds((current) => {
        const next = new Set(current);
        next.delete(courseId);
        return next;
      });
      setSnackbar({
        open: true,
        severity: "success",
        message: `Đã duyệt khóa học ${course.tieuDe}.`,
      });
      await Promise.all([fetchList(), fetchStats()]);
    } catch (error) {
      setSnackbar({
        open: true,
        severity: "error",
        message:
          error instanceof Error
            ? error.message
            : "Không thể duyệt khóa học. Vui lòng thử lại.",
      });
    } finally {
      setApprovingCourseId(null);
    }
  };

  return (
    <AuthGuard allowedRoles={["Admin", "personnel"]}>
      <DashboardShell>
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Header */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: "center", mb: 0.5 }}
          >
            {/* Nút quay lại */}
            <Tooltip title="Quay lại danh sách khóa học">
              <IconButton
                onClick={handleGoBack}
                sx={{
                  bgcolor: alpha(COLORS.primary, 0.06),
                  borderRadius: 2,
                  flexShrink: 0,
                  width: 40,
                  height: 40,
                  "&:hover": {
                    bgcolor: alpha(COLORS.primary, 0.12),
                  },
                }}
              >
                <ArrowBackRoundedIcon sx={{ color: COLORS.primary }} />
              </IconButton>
            </Tooltip>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: { xs: 21, sm: 26 },
                  fontWeight: 900,
                  fontFamily: FONTS.display,
                  color: COLORS.ink,
                  letterSpacing: "-0.5px",
                  lineHeight: 1.2,
                }}
              >
                Kiểm duyệt khóa học
              </Typography>
              <Typography
                sx={{
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: COLORS.inkSoft,
                  mt: 0.4,
                }}
              >
                Xem và xử lý các khóa học đang chờ phê duyệt.
              </Typography>
            </Box>

            <Tooltip title="Lịch sử duyệt">
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
                <HistoryRoundedIcon sx={{ fontSize: 21 }} />
              </IconButton>
            </Tooltip>

            {isAdmin && selectedCourseIds.size > 0 && (
              <Button
                variant="contained"
                onClick={() => openAssignmentDialog(Array.from(selectedCourseIds))}
                sx={{
                  minWidth: { xs: 44, sm: 150 },
                  height: 44,
                  borderRadius: "12px",
                  bgcolor: COLORS.primary,
                  textTransform: "none",
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  px: { xs: 1.5, sm: 2.25 },
                }}
              >
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  Phân công ({selectedCourseIds.size})
                </Box>
                <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                  {selectedCourseIds.size}
                </Box>
              </Button>
            )}
          </Stack>

          {/* ═══════ STATS CARDS ═══════ */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
              mt: 2.5,
              mb: 2.5,
            }}
          >
            {[
              {
                label: "Tổng cần duyệt",
                value: stats.choDuyet + stats.dangDuyet,
                color: COLORS.primary,
                bgColor: alpha(COLORS.primary, 0.09),
                icon: (
                  <AssignmentTurnedInRoundedIcon
                    sx={{ fontSize: 24, color: COLORS.primary }}
                  />
                ),
              },
              {
                label: "Chờ duyệt",
                value: stats.choDuyet,
                color: COLORS.gold,
                bgColor: COLORS.goldSoft,
                icon: (
                  <HourglassTopRoundedIcon
                    sx={{ fontSize: 24, color: COLORS.gold }}
                  />
                ),
              },
              {
                label: "Đang duyệt",
                value: stats.dangDuyet,
                color: STATUS.info,
                bgColor: STATUS.infoSoft,
                icon: (
                  <PendingActionsRoundedIcon
                    sx={{ fontSize: 24, color: STATUS.info }}
                  />
                ),
              },
            ].map((stat, i) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  minWidth: {
                    xs: "100%",
                    sm: "calc(50% - 6px)",
                    md: "calc(33.33% - 8px)",
                  },
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.75}
                  sx={{
                    alignItems: "center",
                    p: 2.25,
                    borderRadius: "18px",
                    border: `1px solid ${COLORS.line}`,
                    bgcolor: COLORS.paperRaised,
                  }}
                >
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      flexShrink: 0,
                      borderRadius: "14px",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: stat.bgColor,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 26,
                        fontWeight: 900,
                        color: stat.color,
                        lineHeight: 1.15,
                        letterSpacing: "-0.5px",
                      }}
                    >
                      {loadingStats ? <CircularProgress size={20} /> : stat.value}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: COLORS.inkSoft,
                        mt: 0.2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ))}
          </Box>

          {/* ═══════ BỘ LỌC + DANH SÁCH ═══════ */}
          <Box
            sx={{
              border: `1px solid ${COLORS.line}`,
              borderRadius: "22px",
              bgcolor: COLORS.paperRaised,
              overflow: "hidden",
              boxShadow: `0 4px 20px ${alpha(COLORS.primary, 0.04)}`,
            }}
          >
            {/* Thanh công cụ lọc */}
            <Box
              sx={{
                p: 2.5,
                bgcolor: alpha(COLORS.primary, 0.035),
                borderBottom: `1px solid ${COLORS.line}`,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", mb: 1.25 }}
              >
                <FilterListRoundedIcon
                  sx={{ fontSize: 17, color: COLORS.primary }}
                />
                <Typography
                  sx={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: COLORS.ink,
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                  }}
                >
                  Tìm kiếm & lọc
                </Typography>
              </Stack>

              <Box component="form" onSubmit={handleSearchSubmit}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.25}
                  sx={{ alignItems: { sm: "center" } }}
                >
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Tìm theo tên khóa học..."
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    sx={{
                      bgcolor: "var(--ev-paper, #FFFFFF)",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        height: 42,
                        "& fieldset": { borderColor: COLORS.line },
                        "&:hover fieldset": { borderColor: COLORS.primary },
                        "&.Mui-focused fieldset": {
                          borderColor: COLORS.primary,
                        },
                      },
                    }}
                    slotProps={{
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

                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SearchIcon />}
                    disabled={loading}
                    sx={{
                      minWidth: { xs: "100%", sm: 118 },
                      height: 42,
                      borderRadius: "10px",
                      bgcolor: COLORS.primary,
                      textTransform: "none",
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    Tìm kiếm
                  </Button>

                  <Select
                    size="small"
                    value={tab}
                    onChange={(e) => handleTabChange(null, e.target.value)}
                    aria-label="Trạng thái kiểm duyệt"
                    sx={{
                      minWidth: { xs: "100%", sm: 170 },
                      height: 42,
                      borderRadius: "10px",
                      bgcolor: "var(--ev-paper, #FFFFFF)",
                      flexShrink: 0,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: COLORS.line,
                      },
                    }}
                  >
                    <MenuItem value="TatCa">Tất cả trạng thái</MenuItem>
                    <MenuItem value="ChoDuyet">Chờ duyệt</MenuItem>
                    <MenuItem value="DangDuyet">Đang duyệt</MenuItem>
                  </Select>

                  {/* Sort */}
                  <Select
                    size="small"
                    value={sortBy}
                    onChange={handleSortChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <SwapVertRoundedIcon
                          sx={{ fontSize: 18, color: "var(--ev-text-muted, #8A7676)" }}
                        />
                      </InputAdornment>
                    }
                    sx={{
                      minWidth: { xs: "100%", sm: 165 },
                      borderRadius: "10px",
                      height: 42,
                      bgcolor: "var(--ev-paper-alt, #FBFAF9)",
                      flexShrink: 0,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "var(--ev-divider, #ECE7E4)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: COLORS.primary,
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#8B1313",
                        borderWidth: 1.5,
                      },
                    }}
                  >
                    <MenuItem value="cu-nhat">Cũ nhất</MenuItem>
                    <MenuItem value="moi-nhat">Mới nhất</MenuItem>
                    <MenuItem value="ten-a-z">Tên A→Z</MenuItem>
                    <MenuItem value="ten-z-a">Tên Z→A</MenuItem>
                  </Select>

                  {/* Reset filter */}
                  {isFilterDirty && (
                    <Tooltip title="Đặt lại bộ lọc">
                      <IconButton
                        onClick={handleResetFilters}
                        sx={{
                          bgcolor: alpha("#8B1313", 0.06),
                          border: "1px solid",
                          borderColor: alpha("#8B1313", 0.15),
                          borderRadius: "10px",
                          width: 42,
                          height: 42,
                          flexShrink: 0,
                          color: "#8B1313",
                          transition: "all .18s ease",
                          "&:hover": {
                            bgcolor: alpha("#8B1313", 0.12),
                            borderColor: "#8B1313",
                          },
                        }}
                      >
                        <RestartAltRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                      lg: isAdmin
                        ? "repeat(4, minmax(0, 1fr))"
                        : "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 1.25,
                    mt: 1.25,
                  }}
                >
                  {isAdmin && (
                    <Select
                      size="small"
                      value={assignmentStatus}
                      onChange={handleAssignmentStatusChange}
                      aria-label="Tình trạng phân công"
                      sx={{
                        height: 42,
                        borderRadius: "10px",
                        bgcolor: "var(--ev-paper, #FFFFFF)",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: COLORS.line,
                        },
                      }}
                    >
                      <MenuItem value="TatCa">Tất cả phân công</MenuItem>
                      <MenuItem value="ChuaPhanCong">Chưa phân công</MenuItem>
                      <MenuItem value="DaPhanCong">Đã phân công</MenuItem>
                    </Select>
                  )}

                  {isAdmin && (
                    <Select
                      size="small"
                      displayEmpty
                      value={reviewerId}
                      onChange={(e) => {
                        const value = e.target.value;
                        setReviewerId(value);
                        if (value) setAssignmentStatus("DaPhanCong");
                        setPage(1);
                      }}
                      aria-label="Chuyên viên kiểm duyệt"
                      sx={{
                        height: 42,
                        borderRadius: "10px",
                        bgcolor: "var(--ev-paper, #FFFFFF)",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: COLORS.line,
                        },
                      }}
                    >
                      <MenuItem value="">Tất cả chuyên viên</MenuItem>
                      {reviewers.map((reviewer) => (
                        <MenuItem
                          key={reviewer.userId}
                          value={reviewer.userId || ""}
                        >
                          {reviewer.hoTen} ({reviewer.soLuongKhoaHocDuyet})
                        </MenuItem>
                      ))}
                    </Select>
                  )}

                  <TextField
                    size="small"
                    type="date"
                    label="Từ ngày gửi"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setPage(1);
                    }}
                    slotProps={{
                      inputLabel: { shrink: true },
                      htmlInput: { max: toDate || undefined },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 42,
                        borderRadius: "10px",
                        bgcolor: "var(--ev-paper, #FFFFFF)",
                        "& fieldset": { borderColor: COLORS.line },
                      },
                    }}
                  />

                  <TextField
                    size="small"
                    type="date"
                    label="Đến ngày gửi"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setPage(1);
                    }}
                    slotProps={{
                      inputLabel: { shrink: true },
                      htmlInput: { min: fromDate || undefined },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 42,
                        borderRadius: "10px",
                        bgcolor: "var(--ev-paper, #FFFFFF)",
                        "& fieldset": { borderColor: COLORS.line },
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* ═══════ COURSE LIST ═══════ */}
            <Box sx={{ p: 2 }}>
              {isAdmin && !loading && items.length > 0 && (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={0.5}
                  sx={{
                    mb: 1.5,
                    px: 0.5,
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={allOnPageSelected}
                        indeterminate={someOnPageSelected}
                        onChange={toggleCurrentPage}
                        disabled={eligibleItems.length === 0}
                        sx={{ color: COLORS.primary, "&.Mui-checked": { color: COLORS.primary } }}
                      />
                    }
                    label="Chọn tất cả trang hiện tại"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: 13.5, fontWeight: 700, color: COLORS.ink } }}
                  />
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: COLORS.primary }}>
                    Đã chọn {selectedCourseIds.size} khóa học
                  </Typography>
                </Stack>
              )}
              {loading ? (
                <Stack spacing={1.5}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      variant="rounded"
                      height={96}
                      sx={{ borderRadius: 3.5 }}
                    />
                  ))}
                </Stack>
              ) : items.length === 0 ? (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <SchoolRoundedIcon
                    sx={{ fontSize: 34, color: COLORS.line, mb: 1 }}
                  />
                  <Typography sx={{ color: COLORS.inkSoft, fontSize: 14 }}>
                    Không có khóa học nào.
                  </Typography>
                  {isFilterDirty && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<RestartAltRoundedIcon />}
                      onClick={handleResetFilters}
                      sx={{
                        mt: 1.5,
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: 13,
                        borderColor: "var(--ev-divider, #ECE7E4)",
                        color: "var(--ev-text-muted, #8A7676)",
                        borderRadius: 2.5,
                        px: 2.5,
                        "&:hover": {
                          borderColor: COLORS.primary,
                          color: COLORS.primary,
                          bgcolor: alpha(COLORS.primary, 0.05),
                        },
                      }}
                    >
                      Xóa bộ lọc
                    </Button>
                  )}
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {items.map((item) => {
                    const id = item.idKhoaHoc;
                    const trangThaiPheDuyet =
                      item.trangThaiPheDuyet || item.trangThai;
                    const eligible = isTrangThaiCho(item.trangThaiPheDuyet);
                    const isSelected = selectedCourseIds.has(id);

                    return (
                      <Box
                        key={id}
                        onClick={(event) => {
                          const target = event.target as HTMLElement;
                          if (
                            target.closest("[data-course-checkbox]") ||
                            target.closest("[data-course-action]")
                          )
                            return;
                          handleOpenCourse(id);
                        }}
                        sx={{
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          gap: 2.25,
                          p: 1.75,
                          border: `1px solid ${COLORS.line}`,
                          borderRadius: "18px",
                          cursor: "pointer",
                          overflow: "hidden",
                          transition: "all .2s ease",
                          bgcolor: isSelected ? alpha(COLORS.primary, 0.045) : COLORS.paperRaised,
                          borderColor: isSelected ? alpha(COLORS.primary, 0.45) : COLORS.line,
                          // Vạch màu bên trái, chỉ hiện khi rê chuột
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 4,
                            bgcolor: COLORS.primary,
                            opacity: 0,
                            transition: "opacity .2s ease",
                          },
                          "&:hover": {
                            borderColor: alpha(COLORS.primary, 0.35),
                            boxShadow: `0 10px 28px ${alpha(COLORS.primary, 0.10)}`,
                            transform: "translateY(-2px)",
                            "&::before": { opacity: 1 },
                            "& .view-btn": {
                              color: COLORS.paperRaised,
                              borderColor: COLORS.primary,
                              bgcolor: COLORS.primary,
                            },
                          },
                        }}
                      >
                        {isAdmin && (
                          <Box
                            data-course-checkbox
                            onClick={(event) => event.stopPropagation()}
                            sx={{ display: "flex", flexShrink: 0 }}
                          >
                            <Checkbox
                              checked={isSelected}
                              disabled={!eligible}
                              aria-label={`Chọn khóa học ${item.tieuDe}`}
                              onChange={() => toggleCourse(id)}
                              sx={{
                                color: COLORS.primary,
                                "&.Mui-checked": { color: COLORS.primary },
                              }}
                            />
                          </Box>
                        )}
                        {/* Thumbnail */}
                        <CourseThumbnail
                          src={item.hinhAnhKhoaHoc}
                          alt={item.tieuDe}
                        />

                        {/* Info */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: 15.5,
                              color: COLORS.ink,
                              letterSpacing: "-0.2px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              mb: 0.75,
                            }}
                          >
                            {item.tieuDe}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            useFlexGap
                            sx={{
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            <StatusChip
                              trangThai={trangThaiPheDuyet}
                              size="small"
                            />
                            {item.createBy && (
                              <Typography
                                sx={{
                                  fontSize: 12,
                                  color: "var(--ev-grey, #8A7676)",
                                }}
                              >
                                Giảng viên: {item.createBy}
                              </Typography>
                            )}
                            {(item.ngayGuiDuyet || item.createDate) && (
                              <Typography
                                sx={{
                                  fontSize: 12,
                                  color: "var(--ev-grey, #8A7676)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.3,
                                }}
                              >
                                Gửi:{" "}
                                {new Date(
                                  item.ngayGuiDuyet || item.createDate!,
                                ).toLocaleDateString("vi-VN")}
                              </Typography>
                            )}
                            {isAdmin && (
                              <Typography
                                sx={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: item.idNguoiDuyet
                                    ? STATUS.info
                                    : COLORS.gold,
                                }}
                              >
                                {item.idNguoiDuyet
                                  ? `Phụ trách: ${item.tenNguoiDuyet || "Đã phân công"}`
                                  : "Chưa phân công"}
                              </Typography>
                            )}
                          </Stack>
                        </Box>

                        {/* Action */}
                        <Tooltip title="Thao tác">
                          <IconButton
                            data-course-action
                            className="view-btn"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenu({
                                anchorEl: e.currentTarget,
                                course: item,
                              });
                            }}
                            aria-label={`Thao tác với khóa học ${item.tieuDe}`}
                            sx={{
                              border: `1px solid ${COLORS.line}`,
                              borderRadius: "12px",
                              color: "var(--ev-grey, #8A7676)",
                              width: 40,
                              height: 40,
                              flexShrink: 0,
                              transition: "all .18s ease",
                            }}
                          >
                            <MoreVertRoundedIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    );
                  })}
                </Stack>
              )}

              {/* ═══════ PAGINATION ═══════ */}
              {!loading && items.length > 0 && totalPage > 1 && (
                <Stack direction="row" sx={{ justifyContent: "center", pt: 3 }}>
                  <Pagination
                    count={totalPage}
                    page={page}
                    onChange={(_, v) => setPage(v)}
                    shape="rounded"
                    size="small"
                    sx={{
                      "& .MuiPaginationItem-root": {
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: 13,
                        transition: "all .15s ease",
                      },
                      "& .Mui-selected": {
                        bgcolor: `${COLORS.primary} !important`,
                        color: "#fff",
                        boxShadow: `0 2px 8px ${alpha(COLORS.primary, 0.3)}`,
                      },
                    }}
                  />
                </Stack>
              )}
            </Box>
          </Box>

          {isAdmin && (
            <AssignReviewerDialog
              open={assignDialogOpen}
              courseIds={courseIdsToAssign}
              onClose={() => {
                setAssignDialogOpen(false);
                setCourseIdsToAssign([]);
              }}
              onAssigned={(result) => void handleAssigned(result)}
              onConflict={handleConflict}
            />
          )}
          <Menu
            anchorEl={actionMenu?.anchorEl ?? null}
            open={Boolean(actionMenu)}
            onClose={closeActionMenu}
            onClick={(event) => event.stopPropagation()}
            slotProps={{
              paper: {
                sx: {
                  minWidth: 190,
                  mt: 0.75,
                  borderRadius: "12px",
                  border: `1px solid ${COLORS.line}`,
                  boxShadow: "0 12px 32px rgba(31, 41, 55, 0.14)",
                },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                const courseId = actionMenu?.course.idKhoaHoc;
                closeActionMenu();
                if (courseId) handleOpenCourse(courseId);
              }}
              sx={{ gap: 1.25, fontSize: 14 }}
            >
              <VisibilityRoundedIcon fontSize="small" />
              Chi tiết
            </MenuItem>
            {isAdmin && (
              <MenuItem
                disabled={
                  !actionMenu ||
                  !isTrangThaiCho(actionMenu.course.trangThaiPheDuyet)
                }
                onClick={() => {
                  const courseId = actionMenu?.course.idKhoaHoc;
                  closeActionMenu();
                  if (courseId) openAssignmentDialog([courseId]);
                }}
                sx={{ gap: 1.25, fontSize: 14 }}
              >
                <PersonAddAltRoundedIcon fontSize="small" />
                Phân công lại
              </MenuItem>
            )}
            <MenuItem
              disabled={
                !actionMenu ||
                !isTrangThaiCho(actionMenu.course.trangThaiPheDuyet) ||
                Boolean(approvingCourseId)
              }
              onClick={() => {
                if (actionMenu) void handleApproveCourse(actionMenu.course);
              }}
              sx={{ gap: 1.25, fontSize: 14, color: STATUS.success }}
            >
              {approvingCourseId === actionMenu?.course.idKhoaHoc ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <CheckCircleOutlineRoundedIcon fontSize="small" />
              )}
              Duyệt
            </MenuItem>
          </Menu>
          <Snackbar
            open={snackbar.open}
            autoHideDuration={5000}
            onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert
              severity={snackbar.severity}
              variant="filled"
              onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}
