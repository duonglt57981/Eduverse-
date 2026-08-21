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
  Button,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";

import AuthGuard from "@/src/components/AuthGuard";
import {
  COLORS,
  FONTS,
  PAGE_SIZE,
  normalizeListResponse,
} from "./types/constants";
import { StatusChip } from "./types";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import { STATUS, BRAND, CSSVAR } from "@/src/theme/tokens";
import KiemDuyetService from "@/src/services/KiemDuyetServide";
import { NhanVienPheDuyetDto } from "@/src/types/KiemDuyet/Dto/dto";

const kiemDuyetService = new KiemDuyetService();

const FILE_BASE_URL =
  process.env.NEXT_PUBLIC_FILE_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "";

const DEFAULT_SORT = "cu-nhat";
const DEFAULT_TAB: "ChoDuyet" | "TatCa" | "DangDuyet" = "TatCa";
const DEFAULT_ASSIGNMENT: "TatCa" | "ChuaPhanCong" | "DaPhanCong" = "TatCa";

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
          bgcolor: CSSVAR.paperAlt,
          border: `1px dashed ${CSSVAR.divider}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ImageRoundedIcon
          sx={{ color: CSSVAR.textMuted, fontSize: 30 }}
        />
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
        bgcolor: CSSVAR.paperAlt,
        border: `1px solid ${CSSVAR.divider}`,
      }}
    />
  );
}

export default function DuyetKhoaHocPage() {
  const router = useRouter();

  const [tab, setTab] = useState<"ChoDuyet" | "TatCa" | "DangDuyet">(
    DEFAULT_TAB,
  );
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);
  const [assignmentStatus, setAssignmentStatus] = useState<"TatCa" | "ChuaPhanCong" | "DaPhanCong">(DEFAULT_ASSIGNMENT);
  const [reviewerId, setReviewerId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const [stats, setStats] = useState({ choDuyet: 0, dangDuyet: 0 });
  const [reviewers, setReviewers] = useState<NhanVienPheDuyetDto[]>([]);

  const isFilterDirty =
    keywordInput.trim() !== "" ||
    keyword.trim() !== "" ||
    sortBy !== DEFAULT_SORT ||
    tab !== DEFAULT_TAB ||
    assignmentStatus !== DEFAULT_ASSIGNMENT ||
    reviewerId !== "" ||
    fromDate !== "" ||
    toDate !== "";

  const searchParams = useMemo(() => {
    const params: any = {
      pageIndex: page,
      pageSize: PAGE_SIZE,
    };
    if (keyword.trim()) params.Keyword = keyword.trim();
    if (tab !== "TatCa") params.TrangThaiPheDuyet = tab;
    if (assignmentStatus !== "TatCa") params.TinhTrangPhanCong = assignmentStatus;
    if (reviewerId) params.NguoiDuyetId = reviewerId;
    if (fromDate) params.TuNgay = fromDate;
    if (toDate) params.DenNgay = toDate;

    switch (sortBy) {
      case "moi-nhat":
        params.SapXepNgay = "Moi";
        break;
      case "cu-nhat":
        params.SapXepNgay = "Cu";
        break;
      case "ten-a-z":
        params.SapXepTen = "AZ";
        break;
      case "ten-z-a":
        params.SapXepTen = "ZA";
        break;
      default:
        params.SapXepNgay = "Cu";
    }
    return params;
  }, [keyword, tab, sortBy, assignmentStatus, reviewerId, fromDate, toDate, page]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await kiemDuyetService.GetListKiemDuyetKhoaHoc(searchParams);
      const { list, totalPage: tp } = normalizeListResponse(res, PAGE_SIZE);
      setItems(list);
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
      const params: any = { pageIndex: 1, pageSize: 20 };
      const res = await kiemDuyetService.GetListKiemDuyetKhoaHoc(params);
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
    try {
      const res = await kiemDuyetService.GetDanhSachNhanVien({ pageSize: 100 });
      if (res?.data?.items) {
        setReviewers(res.data.items);
      }
    } catch {
      // 403 Forbidden for personnel role - reviewers array remains empty safely
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    fetchStats();
    fetchReviewers();
  }, [fetchStats, fetchReviewers]);

  const handleTabChange = (newTab: string) => {
    setTab(newTab as any);
    setPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(keywordInput);
    setPage(1);
  };

  const handleSortChange = (e: any) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const handleAssignmentStatusChange = (e: any) => {
    const value = e.target.value;
    setAssignmentStatus(value);
    if (value === "ChuaPhanCong") setReviewerId("");
    setPage(1);
  };

  const handleResetFilters = () => {
    setKeywordInput("");
    setKeyword("");
    setSortBy(DEFAULT_SORT);
    setTab(DEFAULT_TAB);
    setAssignmentStatus(DEFAULT_ASSIGNMENT);
    setReviewerId("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const handleOpenCourse = (id: string) => {
    if (!id) return;
    router.push(`/personnel/approve-courses/${id}`);
  };

  const handleOpenHistory = () => {
    router.push(`/personnel/approve-courses/history`);
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
                {/* Hàng 1: Ô tìm kiếm, Nút Tìm kiếm, Trạng thái, Sắp xếp, Nút đặt lại */}
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
                      bgcolor: CSSVAR.paper,
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

                  {/* Nút Tìm kiếm đỏ đô */}
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

                  {/* Tất cả trạng thái */}
                  <Select
                    size="small"
                    value={tab}
                    onChange={(e) => handleTabChange(e.target.value)}
                    aria-label="Trạng thái kiểm duyệt"
                    sx={{
                      minWidth: { xs: "100%", sm: 170 },
                      height: 42,
                      borderRadius: "10px",
                      bgcolor: CSSVAR.paper,
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
                          sx={{ fontSize: 18, color: CSSVAR.textMuted }}
                        />
                      </InputAdornment>
                    }
                    sx={{
                      minWidth: { xs: "100%", sm: 165 },
                      borderRadius: "10px",
                      height: 42,
                      bgcolor: CSSVAR.paperAlt,
                      flexShrink: 0,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: CSSVAR.divider,
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: COLORS.primary,
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: BRAND.main,
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
                          bgcolor: alpha(BRAND.main, 0.06),
                          border: "1px solid",
                          borderColor: alpha(BRAND.main, 0.15),
                          borderRadius: "10px",
                          width: 42,
                          height: 42,
                          flexShrink: 0,
                          color: BRAND.main,
                          transition: "all .18s ease",
                          "&:hover": {
                            bgcolor: alpha(BRAND.main, 0.12),
                            borderColor: BRAND.main,
                          },
                        }}
                      >
                        <RestartAltRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>

                {/* Hàng 2: Tất cả phân công, Tất cả chuyên viên, Từ ngày gửi, Đến ngày gửi */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                      lg: "repeat(4, minmax(0, 1fr))",
                    },
                    gap: 1.25,
                    mt: 1.25,
                  }}
                >
                  <Select
                    size="small"
                    value={assignmentStatus}
                    onChange={handleAssignmentStatusChange}
                    aria-label="Tình trạng phân công"
                    sx={{
                      height: 42,
                      borderRadius: "10px",
                      bgcolor: CSSVAR.paper,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: COLORS.line,
                      },
                    }}
                  >
                    <MenuItem value="TatCa">Tất cả phân công</MenuItem>
                    <MenuItem value="ChuaPhanCong">Chưa phân công</MenuItem>
                    <MenuItem value="DaPhanCong">Đã phân công</MenuItem>
                  </Select>

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
                      bgcolor: CSSVAR.paper,
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
                        bgcolor: CSSVAR.paper,
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
                        bgcolor: CSSVAR.paper,
                        "& fieldset": { borderColor: COLORS.line },
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* ═══════ COURSE LIST ═══════ */}
            <Box sx={{ p: 2 }}>
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
                        borderColor: CSSVAR.divider,
                        color: CSSVAR.textMuted,
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
                    const id = item.idKhoaHoc || item.id;
                    const trangThaiPheDuyet =
                      item.trangThaiPheDuyet || item.trangThai;

                    return (
                      <Box
                        key={id}
                        onClick={() => handleOpenCourse(id)}
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
                          bgcolor: COLORS.paperRaised,
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
                            boxShadow: `0 10px 28px ${alpha(COLORS.primary, 0.1)}`,
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
                            {item.createDate && (
                              <Typography
                                sx={{
                                  fontSize: 12,
                                  color: CSSVAR.textMuted,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.3,
                                }}
                              >
                                Tạo:{" "}
                                {new Date(item.createDate).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </Typography>
                            )}
                          </Stack>
                        </Box>

                        {/* Action */}
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            className="view-btn"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenCourse(id);
                            }}
                            sx={{
                              border: `1px solid ${COLORS.line}`,
                              borderRadius: "12px",
                              color: CSSVAR.textMuted,
                              width: 40,
                              height: 40,
                              flexShrink: 0,
                              transition: "all .18s ease",
                            }}
                          >
                            <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
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
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}
