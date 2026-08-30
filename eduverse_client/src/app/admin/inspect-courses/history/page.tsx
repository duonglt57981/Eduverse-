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
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import AuthGuard from "@/src/components/AuthGuard";
import {
  COLORS,
  FONTS,
  boxSx,
  PAGE_SIZE,
} from "@/src/app/admin/approve-courses/types/constants";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import KiemDuyetService from "@/src/services/KiemDuyetServide";
import { BRAND, CSSVAR, STATUS } from "@/src/theme/tokens";

const kiemDuyetService = new KiemDuyetService();

const FILE_BASE_URL =
  process.env.NEXT_PUBLIC_FILE_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "";

const DEFAULT_SORT = "moi-nhat";

// Cấu hình hiển thị cho từng trạng thái phê duyệt
const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
  }
> = {
  DaDuyet: {
    label: "Đã duyệt",
    color: "#059669",
    bg: "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.05) 100%)",
    border: "rgba(16,185,129,0.3)",
    icon: <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />,
  },
  TuChoi: {
    label: "Từ chối",
    color: STATUS.error,
    bg: "linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.05) 100%)",
    border: "rgba(239,68,68,0.3)",
    icon: <CancelRoundedIcon sx={{ fontSize: 14 }} />,
  },
  ChoDuyet: {
    label: "Chờ duyệt",
    color: STATUS.warningDark,
    bg: "linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.05) 100%)",
    border: "rgba(245,158,11,0.3)",
    icon: <HourglassTopRoundedIcon sx={{ fontSize: 14 }} />,
  },
};

const DEFAULT_STATUS_CONFIG = {
  label: "Không rõ",
  color: "#6B7280",
  bg: "rgba(107,114,128,0.08)",
  border: "rgba(107,114,128,0.25)",
  icon: null as React.ReactNode,
};

function getStatusConfig(trangThai?: string | null) {
  if (!trangThai) return DEFAULT_STATUS_CONFIG;
  return (
    STATUS_CONFIG[trangThai] ?? { ...DEFAULT_STATUS_CONFIG, label: trangThai }
  );
}

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
          width: { xs: 112, sm: 160 },
          height: { xs: 63, sm: 90 },
          borderRadius: 1.25,
          flexShrink: 0,
          bgcolor: COLORS.paper,
          border: `1px dashed ${COLORS.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ImageRoundedIcon
          sx={{ color: alpha(COLORS.primary, 0.25), fontSize: 32 }}
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
        width: { xs: 112, sm: 160 },
        height: { xs: 63, sm: 90 },
        borderRadius: 1.25,
        objectFit: "cover",
        flexShrink: 0,
        bgcolor: COLORS.line,
      }}
    />
  );
}

export default function LichSuKiemDuyetPage() {
  const router = useRouter();

  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const [stats, setStats] = useState({ tong: 0 });

  const isFilterDirty =
    keywordInput.trim() !== "" ||
    keyword.trim() !== "" ||
    sortBy !== DEFAULT_SORT;

  // Chỉ lấy các khóa học có trạng thái XemXet
  const searchParams = useMemo(() => {
    const params: any = {
      pageIndex: page,
      pageSize: PAGE_SIZE,
      trangThaiPheDuyet: "XemXet", // ✅ chỉ lấy khóa học chờ duyệt
    };
    if (keyword.trim()) params.Keyword = keyword.trim();

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
  }, [keyword, sortBy, page]);

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
      // Thống kê cũng chỉ tính các khóa XemXet
      const res = await kiemDuyetService.GetListLichSuKiemDuyet({
        pageIndex: 1,
        pageSize: 1,
        trangThaiPheDuyet: "XemXet",
      });
      setStats({ tong: res?.data?.totalCount || 0 });
    } catch (e) {
      console.error("Lỗi tải thống kê:", e);
      setStats({ tong: 0 });
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
    setPage(1);
  };

  const handleOpenCourse = (id: string) => {
    if (!id) return;
    router.push(`/admin/inspect-courses/history/${id}/course`);
  };

  const handleGoBack = () => {
    router.push("/admin/inspect-courses");
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
                  bgcolor: CSSVAR.paper,
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
                Lịch sử khóa học đã xem xét
              </Typography>
              <Typography
                sx={{ fontSize: 13, color: COLORS.inkSoft, mt: 0.25 }}
              >
                Danh sách các khóa học đang chờ duyệt.
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
            <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: 260 } }}>
              <Paper
                elevation={0}
                sx={{
                  p: "1.25rem 1.5rem",
                  borderRadius: "18px",
                  border: "1px solid rgba(139,19,19,0.14)",
                  background:
                    "linear-gradient(135deg, rgba(139,19,19,0.04) 0%, rgba(139,19,19,0.01) 100%)",
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
                    background: `linear-gradient(135deg, ${BRAND.main} 0%, ${BRAND.dark} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(139,19,19,0.22)",
                  }}
                >
                  <SchoolRoundedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: 22,
                      fontWeight: 900,
                      lineHeight: 1.1,
                      color: COLORS.primary,
                    }}
                  >
                    {loadingStats ? <CircularProgress size={18} /> : stats.tong}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      color: CSSVAR.textSecondary,
                      fontWeight: 600,
                      mt: 0.4,
                    }}
                  >
                    Tổng khóa học chờ duyệt
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Bộ lọc */}
          <Box sx={{ ...boxSx, p: 0, overflow: "hidden" }}>
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
                      bgcolor: CSSVAR.paper,
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
                      bgcolor: CSSVAR.paper,
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
                          bgcolor: CSSVAR.paper,
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
                    Hiện chưa có khóa học nào đang chờ duyệt.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.75}>
                  {items.map((item) => {
                    const id = item.idKhoaHoc || item.id;
                    const trangThaiPheDuyet =
                      item.trangThaiPheDuyet || item.trangThai;
                    const statusCfg = getStatusConfig(trangThaiPheDuyet);

                    return (
                      <Box
                        key={id}
                        onClick={() => handleOpenCourse(id)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: { xs: 1.5, sm: 2.5 },
                          p: { xs: 1.5, sm: 2 },
                          border: `1px solid ${COLORS.line}`,
                          borderRadius: 2,
                          cursor: "pointer",
                          transition: "all .15s ease",
                          bgcolor: CSSVAR.paper,
                          "&:hover": {
                            boxShadow: `0 4px 16px ${alpha(
                              COLORS.primary,
                              0.14,
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
                              fontSize: { xs: 15, sm: 16.5 },
                              color: COLORS.ink,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              lineHeight: 1.35,
                              mb: 1,
                            }}
                          >
                            {item.tieuDe}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1.25}
                            useFlexGap
                            sx={{ alignItems: "center", flexWrap: "wrap" }}
                          >
                            <Box
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.6,
                                px: 1.4,
                                py: 0.6,
                                borderRadius: "999px",
                                background: statusCfg.bg,
                                border: `1px solid ${statusCfg.border}`,
                                color: statusCfg.color,
                                fontSize: 13,
                                fontWeight: 700,
                                letterSpacing: 0.2,
                                lineHeight: 1,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {statusCfg.icon}
                              {statusCfg.label}
                            </Box>

                            {item.createDate && (
                              <Typography
                                sx={{ color: COLORS.inkSoft, fontSize: 13 }}
                              >
                                Ngày tạo:{" "}
                                {new Date(item.createDate).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </Typography>
                            )}
                            {item.createBy && (
                              <Typography
                                sx={{ color: COLORS.inkSoft, fontSize: 13 }}
                              >
                                Người tạo: {item.createBy}
                              </Typography>
                            )}
                          </Stack>
                        </Box>

                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCourse(id);
                          }}
                          sx={{
                            color: "rgba(31, 41, 55, 0.5)",
                            border: `1px solid ${COLORS.line}`,
                            borderRadius: "12px",
                            width: 40,
                            height: 40,
                            flexShrink: 0,
                            "&:hover": {
                              borderColor: COLORS.primary,
                              color: COLORS.primary,
                              bgcolor: alpha(COLORS.primary, 0.06),
                            },
                          }}
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
