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
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import AuthGuard from "@/src/components/AuthGuard";
import {
  COLORS,
  FONTS,
  boxSx,
  PAGE_SIZE,
} from "@/src/app/admin/approve-courses/types/constants";
import { StatusChip } from "@/src/app/admin/approve-courses/types/index";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import KiemDuyetService from "@/src/services/KiemDuyetServide";

const kiemDuyetService = new KiemDuyetService();

const FILE_BASE_URL =
  process.env.NEXT_PUBLIC_FILE_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "";

const DEFAULT_SORT = "moi-nhat";
const DEFAULT_TAB: "TatCa" | "DaDuyet" | "TuChoi" = "TatCa";

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

export default function LichSuKiemDuyetPage() {
  const router = useRouter();

  const [tab, setTab] = useState<"TatCa" | "DaDuyet" | "TuChoi">(DEFAULT_TAB);
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const [stats, setStats] = useState({ daDuyet: 0, tuChoi: 0, tong: 0 });

  const isFilterDirty =
    keywordInput.trim() !== "" ||
    keyword.trim() !== "" ||
    sortBy !== DEFAULT_SORT ||
    tab !== DEFAULT_TAB;

  const searchParams = useMemo(() => {
    const params: any = {
      pageIndex: page,
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
        params.SapXepNgay = "Moi";
    }
    return params;
  }, [keyword, tab, sortBy, page]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await kiemDuyetService.GetListLichSuKiemDuyet(searchParams);
      if (res?.data) {
        setItems(res.data.items || []);
        setTotalPage(res.data.totalPage || 1);
      } else {
        setItems([]);
        setTotalPage(1);
      }
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
      const params: any = {
        pageIndex: 1,
        pageSize: 20,
      };
      const res = await kiemDuyetService.GetListLichSuKiemDuyet(params);

      let list: any[] = [];
      if (res?.data) {
        list = res.data.items || [];
      }

      setStats({
        daDuyet: list.filter((x: any) => x.trangThaiPheDuyet === "DaDuyet")
          .length,
        tuChoi: list.filter((x: any) => x.trangThaiPheDuyet === "TuChoi")
          .length,
        tong: list.length,
      });
    } catch (e) {
      console.error("Lỗi tải thống kê:", e);
      setStats({ daDuyet: 0, tuChoi: 0, tong: 0 });
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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
    router.push(`/admin/approve-courses/history/${id}/course`);
  };

  // Sửa: Điều hướng về trang admin/approve-courses
  const handleGoBack = () => {
    router.push("/admin/approve-courses");
  };

  return (
    <AuthGuard allowedRoles={["Admin", "personnel"]}>
      <DashboardShell>
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Header */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: "center", mb: 0.5 }}
          >
            <Tooltip title="Quay lại danh sách phê duyệt">
              <IconButton
                onClick={handleGoBack}
                sx={{
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: 2,
                  color: COLORS.ink,
                  bgcolor: "var(--ev-paper, #FFFFFF)",
                  "&:hover": {
                    borderColor: COLORS.primary,
                    color: COLORS.primary,
                    bgcolor: alpha(COLORS.primary, 0.06),
                  },
                }}
              >
                <ArrowBackRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: { xs: 20, sm: 24 },
                  fontWeight: 700,
                  fontFamily: FONTS.display,
                  color: COLORS.ink,
                  lineHeight: 1.25,
                }}
              >
                Lịch sử kiểm duyệt khóa học
              </Typography>
              <Typography
                sx={{ fontSize: 13, color: COLORS.inkSoft, mt: 0.25 }}
              >
                Tra cứu các khóa học đã được duyệt hoặc từ chối.
              </Typography>
            </Box>
          </Stack>

          {/* Thống kê nhanh */}
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
                label: "Tổng đã xử lý",
                value: stats.tong,
                color: COLORS.primary,
                cardBg:
                  "linear-gradient(135deg, rgba(139,19,19,0.04) 0%, rgba(139,19,19,0.01) 100%)",
                borderColor: "rgba(139,19,19,0.14)",
                iconBg: "linear-gradient(135deg, #8B1313 0%, #6D0F0F 100%)",
                iconShadow: "0 4px 12px rgba(139,19,19,0.22)",
                icon: <SchoolRoundedIcon sx={{ fontSize: 20 }} />,
              },
              {
                label: "Đã duyệt",
                value: stats.daDuyet,
                color: "#059669",
                cardBg:
                  "linear-gradient(135deg, rgba(16,185,129,0.04) 0%, rgba(16,185,129,0.01) 100%)",
                borderColor: "rgba(16,185,129,0.16)",
                iconBg: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                iconShadow: "0 4px 12px rgba(16,185,129,0.22)",
                icon: <CheckCircleRoundedIcon sx={{ fontSize: 20 }} />,
              },
              {
                label: "Từ chối",
                value: stats.tuChoi,
                color: "#DC2626",
                cardBg:
                  "linear-gradient(135deg, rgba(239,68,68,0.04) 0%, rgba(239,68,68,0.01) 100%)",
                borderColor: "rgba(239,68,68,0.16)",
                iconBg: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                iconShadow: "0 4px 12px rgba(239,68,68,0.22)",
                icon: <CancelRoundedIcon sx={{ fontSize: 20 }} />,
              },
            ].map((stat, index) => (
              <Box
                key={index}
                sx={{
                  flex: 1,
                  minWidth: {
                    xs: "100%",
                    sm: "calc(50% - 6px)",
                    md: "calc(33.33% - 8px)",
                  },
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: "1.25rem 1.5rem",
                    borderRadius: "18px",
                    border: `1px solid ${stat.borderColor}`,
                    background: stat.cardBg,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "12px",
                      background: stat.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      flexShrink: 0,
                      boxShadow: stat.iconShadow,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 22,
                        fontWeight: 900,
                        lineHeight: 1.1,
                        color: stat.color,
                      }}
                    >
                      {loadingStats ? (
                        <CircularProgress size={18} />
                      ) : (
                        stat.value
                      )}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 12.5,
                        color: "var(--ev-text-secondary, #4B5563)",
                        fontWeight: 600,
                        mt: 0.4,
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
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
                        height: 40,
                        borderRadius: "12px",
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
                      height: 40,
                      minWidth: { xs: "100%", sm: 170 },
                      bgcolor: "var(--ev-paper, #FFFFFF)",
                      borderRadius: "12px",
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
                    <MenuItem value="moi-nhat">Mới nhất</MenuItem>
                    <MenuItem value="cu-nhat">Cũ nhất</MenuItem>
                    <MenuItem value="ten-a-z">Tên A→Z</MenuItem>
                    <MenuItem value="ten-z-a">Tên Z→A</MenuItem>
                  </Select>

                  <Tooltip title="Đặt lại bộ lọc">
                    <span>
                      <IconButton
                        onClick={handleResetFilters}
                        disabled={!isFilterDirty}
                        sx={{
                          bgcolor: "var(--ev-paper, #FFFFFF)",
                          border: `1px solid ${COLORS.line}`,
                          borderRadius: "12px",
                          width: 40,
                          height: 40,
                          flexShrink: 0,
                          color: isFilterDirty
                            ? COLORS.primary
                            : "rgba(75, 85, 99, 0.4)",
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
                  bgcolor: "var(--ev-paper, #FFFFFF)",
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
                <Tab label="Đã duyệt" value="DaDuyet" />
                <Tab label="Từ chối" value="TuChoi" />
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
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <SchoolRoundedIcon
                    sx={{ fontSize: 34, color: COLORS.line, mb: 1 }}
                  />
                  <Typography sx={{ color: COLORS.inkSoft, fontSize: 14 }}>
                    Không có khóa học nào.
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ display: "block", mt: 0.25, color: COLORS.inkSoft }}
                  >
                    {tab === "TatCa"
                      ? "Hiện chưa có khóa học nào được duyệt hoặc từ chối."
                      : tab === "DaDuyet"
                        ? "Chưa có khóa học nào được duyệt."
                        : "Chưa có khóa học nào bị từ chối."}
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.25}>
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
                          p: 1.25,
                          border: `1px solid ${COLORS.line}`,
                          borderRadius: 2.5,
                          cursor: "pointer",
                          transition: "all .15s ease",
                          bgcolor: "var(--ev-paper, #FFFFFF)",
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
                              fontSize: 14.5,
                              color: COLORS.ink,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              mb: 0.5,
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
                                sx={{ color: COLORS.inkSoft }}
                              >
                                Ngày tạo:{" "}
                                {new Date(item.createDate).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </Typography>
                            )}
                            {item.createBy && (
                              <Typography
                                variant="caption"
                                sx={{ color: COLORS.inkSoft }}
                              >
                                Người tạo: {item.createBy}
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
                          sx={{ color: "rgba(31, 41, 55, 0.5)" }}
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
