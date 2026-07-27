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
  Tabs,
  Tab,
  Skeleton,
  Pagination,
  IconButton,
  Tooltip,
  alpha,
  Select,
  MenuItem,
  Paper,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";

import AuthGuard from "@/src/components/AuthGuard";
import {
  COLORS,
  FONTS,
  boxSx,
  PAGE_SIZE,
  normalizeListResponse,
} from "./types/constants";
import { StatusChip } from "./types";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import KiemDuyetService from "@/src/services/KiemDuyetServide";

const kiemDuyetService = new KiemDuyetService();

const FILE_BASE_URL =
  process.env.NEXT_PUBLIC_FILE_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "";

const DEFAULT_SORT = "cu-nhat";
const DEFAULT_TAB: "ChoDuyet" | "TatCa" | "DangDuyet" = "TatCa";

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
          width: 96,
          height: 64,
          borderRadius: 1.5,
          flexShrink: 0,
          bgcolor: COLORS.paper,
          border: `1px dashed ${COLORS.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ImageRoundedIcon sx={{ color: alpha(COLORS.primary, 0.25) }} />
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
        width: 96,
        height: 64,
        borderRadius: 1.5,
        objectFit: "cover",
        flexShrink: 0,
        bgcolor: COLORS.line,
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
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const [stats, setStats] = useState({ choDuyet: 0, dangDuyet: 0 });

  const isFilterDirty =
    keywordInput.trim() !== "" ||
    keyword.trim() !== "" ||
    sortBy !== DEFAULT_SORT ||
    tab !== DEFAULT_TAB;

  const searchParams = useMemo(() => {
    const params: any = {
      pageNumber: page,
      pageSize: PAGE_SIZE,
    };
    if (keyword.trim()) params.Keyword = keyword.trim();
    if (tab !== "TatCa") params.TrangThaiPheDuyet = tab;
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
  }, [keyword, tab, sortBy, page]);

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
      const params: any = { pageNumber: 1, pageSize: 1000 };
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

  // Fetch khi component mount
  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Fetch stats khi mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = () => {
    fetchList();
    fetchStats();
  };

  const handleTabChange = (_: any, newTab: string) => {
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

  const handleResetFilters = () => {
    setKeywordInput("");
    setKeyword("");
    setSortBy(DEFAULT_SORT);
    setTab(DEFAULT_TAB);
    setPage(1);
  };

  const handleOpenCourse = (id: string) => {
    if (!id) return;
    router.push(`/admin/approve-courses/${id}`);
  };

  return (
    <AuthGuard allowedRoles={["Admin"]}>
      <DashboardShell>
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 700,
                fontFamily: FONTS.display,
                color: COLORS.ink,
              }}
            >
              Kiểm duyệt khóa học
            </Typography>
            <Tooltip title="Tải lại dữ liệu">
              <IconButton
                onClick={handleRefresh}
                sx={{ bgcolor: alpha(COLORS.primary, 0.08), borderRadius: 2 }}
              >
                <RefreshIcon sx={{ color: COLORS.primary }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Thống kê nhanh */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              mb: 3,
            }}
          >
            {[
              {
                label: "Tổng cần duyệt",
                value: stats.choDuyet + stats.dangDuyet,
                color: COLORS.primary,
              },
              {
                label: "Chờ duyệt",
                value: stats.choDuyet,
                color: "warning.main",
              },
              {
                label: "Đang duyệt",
                value: stats.dangDuyet,
                color: "info.main",
              },
            ].map((stat, index) => (
              <Box
                key={index}
                sx={{
                  flex: 1,
                  minWidth: {
                    xs: "100%",
                    sm: "calc(50% - 8px)",
                    md: "calc(33.33% - 12px)",
                  },
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: `1px solid ${COLORS.line}`,
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: stat.color }}
                  >
                    {loadingStats ? <CircularProgress size={24} /> : stat.value}
                  </Typography>
                  <Typography variant="body2" color={COLORS.inkSoft}>
                    {stat.label}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>

          {/* Bộ lọc */}
          <Box sx={{ ...boxSx, p: 0, overflow: "hidden" }}>
            {/* Thanh công cụ lọc */}
            <Box
              sx={{
                p: 2,
                bgcolor: alpha(COLORS.primary, 0.04),
                borderBottom: `1px solid ${COLORS.line}`,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", mb: 1.5 }}
              >
                <FilterListRoundedIcon
                  sx={{ fontSize: 18, color: COLORS.primary }}
                />
                <Typography
                  sx={{
                    fontSize: 13,
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
                      bgcolor: "#fff",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
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

                  <Select
                    size="small"
                    value={sortBy}
                    onChange={handleSortChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <SwapVertRoundedIcon
                          sx={{ fontSize: 18, color: COLORS.inkSoft }}
                        />
                      </InputAdornment>
                    }
                    sx={{
                      minWidth: { xs: "100%", sm: 170 },
                      bgcolor: "#fff",
                      borderRadius: 2,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: COLORS.line,
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: COLORS.primary,
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: COLORS.primary,
                      },
                    }}
                  >
                    <MenuItem value="cu-nhat">Cũ nhất</MenuItem>
                    <MenuItem value="moi-nhat">Mới nhất</MenuItem>
                    <MenuItem value="ten-a-z">Tên A→Z</MenuItem>
                    <MenuItem value="ten-z-a">Tên Z→A</MenuItem>
                  </Select>

                  <Tooltip title="Đặt lại bộ lọc">
                    <span>
                      <IconButton
                        onClick={handleResetFilters}
                        disabled={!isFilterDirty}
                        sx={{
                          bgcolor: "#fff",
                          border: `1px solid ${COLORS.line}`,
                          borderRadius: 2,
                          width: 40,
                          height: 40,
                          flexShrink: 0,
                          color: isFilterDirty
                            ? COLORS.primary
                            : alpha(COLORS.inkSoft, 0.4),
                          "&:hover": {
                            borderColor: COLORS.primary,
                            bgcolor: alpha(COLORS.primary, 0.06),
                          },
                        }}
                      >
                        <RestartAltRoundedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Box>

              <Tabs
                value={tab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons={false}
                sx={{
                  mt: 1.5,
                  minHeight: 34,
                  bgcolor: "#fff",
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: 2,
                  px: 0.5,
                  width: "fit-content",
                  "& .MuiTabs-indicator": { display: "none" },
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                    color: COLORS.inkSoft,
                    minHeight: 34,
                    fontSize: 12.5,
                    px: 1.5,
                    my: 0.5,
                    minWidth: "auto",
                    borderRadius: 1.5,
                    transition: "all .15s ease",
                  },
                  "& .Mui-selected": {
                    color: "#fff !important",
                    bgcolor: COLORS.primary,
                  },
                }}
              >
                <Tab label="Tất cả" value="TatCa" />
                <Tab label="Chờ duyệt" value="ChoDuyet" />
                <Tab label="Đang duyệt" value="DangDuyet" />
              </Tabs>
            </Box>

            {/* Danh sách */}
            <Box sx={{ p: 2 }}>
              {loading ? (
                <Stack spacing={1.5}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      variant="rounded"
                      height={92}
                      sx={{ borderRadius: 2 }}
                    />
                  ))}
                </Stack>
              ) : items.length === 0 ? (
                <Box sx={{ py: 7, textAlign: "center" }}>
                  <SchoolRoundedIcon
                    sx={{ fontSize: 36, color: COLORS.line, mb: 1 }}
                  />
                  <Typography sx={{ color: COLORS.inkSoft }}>
                    Không có khóa học nào.
                  </Typography>
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
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 1.5,
                          border: `1px solid ${COLORS.line}`,
                          borderRadius: 2.5,
                          cursor: "pointer",
                          transition: "all .15s ease",
                          bgcolor: "#fff",
                          "&:hover": {
                            boxShadow: `0 2px 10px ${alpha(
                              COLORS.primary,
                              0.12,
                            )}`,
                            borderColor: COLORS.primary,
                          },
                        }}
                      >
                        <CourseThumbnail
                          src={item.hinhAnhKhoaHoc}
                          alt={item.tieuDe}
                        />

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: 15,
                              color: COLORS.ink,
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
                            sx={{ alignItems: "center", flexWrap: "wrap" }}
                          >
                            <StatusChip
                              trangThai={trangThaiPheDuyet}
                              size="small"
                            />
                            {item.createDate && (
                              <Typography
                                variant="caption"
                                color={COLORS.inkSoft}
                              >
                                Tạo:{" "}
                                {new Date(item.createDate).toLocaleDateString()}
                              </Typography>
                            )}
                          </Stack>
                        </Box>

                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCourse(id);
                          }}
                          sx={{ color: alpha(COLORS.ink, 0.5) }}
                        >
                          <VisibilityRoundedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    );
                  })}
                </Stack>
              )}

              {!loading && items.length > 0 && totalPage > 1 && (
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
      </DashboardShell>
    </AuthGuard>
  );
}
