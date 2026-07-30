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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";

import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import AuthGuard from "@/src/components/AuthGuard";
import {
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
          width: 120,
          height: 80,
          borderRadius: 2.5,
          flexShrink: 0,
          bgcolor: "#F9FAFB",
          border: "1px dashed #E5E7EB",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ImageRoundedIcon sx={{ color: alpha("#991B1B", 0.2), fontSize: 28 }} />
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
        width: 120,
        height: 80,
        borderRadius: 2.5,
        objectFit: "cover",
        flexShrink: 0,
        bgcolor: "#F3F4F6",
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

  // Fetch khi component mount
  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Fetch stats khi mount
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
    router.push(`/admin/approve-courses/${id}`);
  };

  const handleOpenHistory = () => {
    router.push(`/admin/approve-courses/history`);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <AuthGuard allowedRoles={["Admin"]}>
      <DashboardShell>
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Header */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: "center", mb: 0.5 }}
          >
            <Tooltip title="Quay lại">
              <IconButton
                onClick={handleGoBack}
                sx={{
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: 2,
                  color: COLORS.ink,
                  bgcolor: "#fff",
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
                Kiểm duyệt khóa học
              </Typography>
              <Typography
                sx={{ fontSize: 13, color: COLORS.inkSoft, mt: 0.25 }}
              >
                Xem và xử lý các khóa học đang chờ phê duyệt.
              </Typography>
            </Box>

            <Tooltip title="Lịch sử duyệt">
              <IconButton
                onClick={handleOpenHistory}
                sx={{
                  bgcolor: alpha(COLORS.primary, 0.08),
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              >
                <HistoryRoundedIcon sx={{ color: COLORS.primary }} />
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
                color: "#991B1B",
                bgColor: "#FEF2F2",
                icon: (
                  <AssignmentTurnedInRoundedIcon
                    sx={{ fontSize: 22, color: "#991B1B" }}
                  />
                ),
              },
              {
                label: "Chờ duyệt",
                value: stats.choDuyet,
                color: "#D97706",
                bgColor: "#FFFBEB",
                icon: (
                  <HourglassTopRoundedIcon
                    sx={{ fontSize: 22, color: "#D97706" }}
                  />
                ),
              },
              {
                label: "Đang duyệt",
                value: stats.dangDuyet,
                color: "#2563EB",
                bgColor: "#EFF6FF",
                icon: (
                  <PendingActionsRoundedIcon
                    sx={{ fontSize: 22, color: "#2563EB" }}
                  />
                ),
              },
            ].map((stat, i) => (
              <Paper
                key={i}
                elevation={0}
                sx={{
                  flex: 1,
                  minWidth: {
                    xs: "100%",
                    sm: "calc(50% - 6px)",
                    md: "calc(33.33% - 8px)",
                  },
                }}
              >
                <Box
                  sx={{
                    p: 1.75,
                    borderRadius: 2.5,
                    border: `1px solid ${COLORS.line}`,
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: stat.color, lineHeight: 1.3 }}
                  >
                    {loadingStats ? <CircularProgress size={20} /> : stat.value}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 12.5, color: COLORS.inkSoft, mt: 0.25 }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Paper>
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

              {/* Sort */}
              <Select
                size="small"
                value={sortBy}
                onChange={handleSortChange}
                startAdornment={
                  <InputAdornment position="start">
                    <SwapVertRoundedIcon
                      sx={{ fontSize: 18, color: "#9CA3AF" }}
                    />
                  </InputAdornment>
                }
                sx={{
                  minWidth: { xs: "100%", sm: 165 },
                  borderRadius: 2.5,
                  height: 42,
                  bgcolor: "#F9FAFB",
                  flexShrink: 0,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#E5E7EB",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#991B1B",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#991B1B",
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
                      bgcolor: alpha("#991B1B", 0.06),
                      border: "1px solid",
                      borderColor: alpha("#991B1B", 0.15),
                      borderRadius: 2.5,
                      width: 42,
                      height: 42,
                      flexShrink: 0,
                      color: "#991B1B",
                      transition: "all .18s ease",
                      "&:hover": {
                        bgcolor: alpha("#991B1B", 0.12),
                        borderColor: "#991B1B",
                      },
                    }}
                  >
                    <RestartAltRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
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
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: 13,
                        borderColor: "#E5E7EB",
                        color: "#6B7280",
                        borderRadius: 2.5,
                        px: 2.5,
                        "&:hover": {
                          borderColor: "#991B1B",
                          color: "#991B1B",
                          bgcolor: alpha("#991B1B", 0.04),
                        },
                      }}
                    >
                      Xóa bộ lọc
                    </Button>
                  )}
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
                          transition: "all .2s ease",
                          bgcolor: "#fff",
                          "&:hover": {
                            borderColor: "#991B1B",
                            boxShadow: `0 4px 18px ${alpha("#991B1B", 0.1)}`,
                            transform: "translateY(-1px)",
                            "& .view-btn": {
                              color: "#991B1B",
                              borderColor: "#991B1B",
                              bgcolor: alpha("#991B1B", 0.04),
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
                                  color: "#9CA3AF",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.3,
                                }}
                              >
                                Tạo:{" "}
                                {new Date(
                                  item.createDate,
                                ).toLocaleDateString("vi-VN")}
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
                              border: "1px solid #E5E7EB",
                              borderRadius: 2.5,
                              color: "#9CA3AF",
                              width: 36,
                              height: 36,
                              flexShrink: 0,
                              transition: "all .18s ease",
                            }}
                          >
                            <ArrowForwardRoundedIcon
                              sx={{ fontSize: 18 }}
                            />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    );
                  })}
                </Stack>
              )}

              {/* ═══════ PAGINATION ═══════ */}
              {!loading && items.length > 0 && totalPage > 1 && (
                <Stack
                  direction="row"
                  sx={{ justifyContent: "center", pt: 3 }}
                >
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
                        bgcolor: "#991B1B !important",
                        color: "#fff",
                        boxShadow: "0 2px 6px rgba(153,27,27,0.25)",
                      },
                    }}
                  />
                </Stack>
              )}
            </Box>
          </Paper>
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}

