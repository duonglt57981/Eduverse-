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
  CircularProgress,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import AuthGuard from "@/src/components/AuthGuard";
import {
  COLORS,
  FONTS,
  PAGE_SIZE,
} from "@/src/app/admin/approve-courses/types/constants";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import KhoaHocService from "@/src/services/KhoaHocService";

const khoaHocService = new KhoaHocService();

const FILE_BASE_URL =
  process.env.NEXT_PUBLIC_FILE_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "";

const DEFAULT_SORT = "moi-nhat";

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

  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);
  const [sortInput, setSortInput] = useState(DEFAULT_SORT);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const [tongDaDuyet, setTongDaDuyet] = useState(0);

  const isFilterDirty =
    keywordInput.trim() !== "" ||
    keyword.trim() !== "" ||
    sortInput !== DEFAULT_SORT ||
    sortBy !== DEFAULT_SORT;

  const searchParams = useMemo(() => {
    const params: any = {
      pageIndex: page,
      pageSize: PAGE_SIZE,
    };
    if (keyword.trim()) params.keyword = keyword.trim();

    // API nhận hai tham số sapXepNgay / sapXepTen.
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
        params.sapXepNgay = "Moi";
    }
    return params;
  }, [keyword, sortBy, page]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      // Sử dụng GetListKhoaHocPhatHanh thay vì GetListLichSuKiemDuyet
      const res = await khoaHocService.GetListKhoaHocPhatHanh(searchParams);
      if (res?.data) {
        setItems(res.data.items || []);
        setTotalPage(res.data.totalPage || 1);
      } else {
        setItems([]);
        setTotalPage(1);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách khóa học đã phát hành:", error);
      setItems([]);
      setTotalPage(1);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      // Lấy tổng số khóa học đã phát hành
      const res = await khoaHocService.GetListKhoaHocPhatHanh({
        pageIndex: 1,
        pageSize: 1,
      } as any);

      const total = res?.data?.totalCount ?? 0;
      setTongDaDuyet(total);
    } catch (e) {
      console.error("Lỗi tải thống kê:", e);
      setTongDaDuyet(0);
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
    setSortBy(sortInput);
    setPage(1);
  };

  const handleSortChange = (e: any) => {
    setSortInput(e.target.value);
  };

  const handleResetFilters = () => {
    setKeywordInput("");
    setKeyword("");
    setSortInput(DEFAULT_SORT);
    setSortBy(DEFAULT_SORT);
    setPage(1);
  };

  const handleOpenCourse = (id: string) => {
    if (!id) return;
    router.push(`/admin/inspect-courses/${id}`);
  };

  const handleGoBack = () => {
    router.push("/admin/courses");
  };

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
              bgcolor: "var(--ev-paper, #FFFFFF)",
              p: { xs: 2.5, sm: 3.5 },
              mb: 2.5,
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            {/* Watermark trang trí — gắn với chủ đề "khóa học" */}
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
                spacing={1.25}
                sx={{
                  alignItems: "center",
                  alignSelf: { xs: "stretch", sm: "center" },
                  pl: { xs: 0, sm: 2.5 },
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
          </Box>

          {/* Bộ lọc */}
          <Box
            sx={{
              borderRadius: 3,
              border: `1px solid ${COLORS.line}`,
              bgcolor: "#fff",
              overflow: "hidden",
            }}
          >
            <Box
              component="form"
              onSubmit={handleSearchSubmit}
              sx={{
                p: 2,
                borderBottom: `1px solid ${COLORS.line}`,
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: mix(COLORS.ink, 0.45),
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  mb: 1.25,
                }}
              >
                Tìm kiếm & sắp xếp
              </Typography>

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
                    "& .MuiOutlinedInput-root": {
                      height: 40,
                      borderRadius: 2,
                      bgcolor: COLORS.paper,
                      "& fieldset": { borderColor: "transparent" },
                      "&:hover fieldset": { borderColor: COLORS.line },
                      "&.Mui-focused": { bgcolor: "#fff" },
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
                  value={sortInput}
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
                    height: 40,
                    borderRadius: 2,
                    bgcolor: COLORS.paper,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "transparent",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: COLORS.line,
                    },
                    "&.Mui-focused": { bgcolor: "#fff" },
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

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SearchIcon />}
                  disabled={loading}
                  sx={{
                    minWidth: { xs: "100%", sm: 124 },
                    height: 40,
                    borderRadius: 2,
                    px: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor: COLORS.primary,
                    boxShadow: "none",
                    "&:hover": { bgcolor: COLORS.primary, boxShadow: "none" },
                  }}
                >
                  Tìm kiếm
                </Button>

                <Tooltip title="Đặt lại bộ lọc">
                  <span>
                    <IconButton
                      onClick={handleResetFilters}
                      disabled={!isFilterDirty}
                      sx={{
                        border: `1px solid ${COLORS.line}`,
                        borderRadius: 2,
                        width: 40,
                        height: 40,
                        flexShrink: 0,
                        color: isFilterDirty
                          ? COLORS.primary
                          : mix(COLORS.inkSoft, 0.4),
                        "&:hover": {
                          borderColor: COLORS.primary,
                          bgcolor: mix(COLORS.primary, 0.06),
                        },
                      }}
                    >
                      <RestartAltRoundedIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            </Box>

            {/* Danh sách */}
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
              ) : items.length === 0 ? (
                <Box sx={{ py: 7, textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      bgcolor: COLORS.paper,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 1.5,
                    }}
                  >
                    <SchoolRoundedIcon
                      sx={{ fontSize: 26, color: mix(COLORS.primary, 0.35) }}
                    />
                  </Box>
                  <Typography
                    sx={{ color: COLORS.ink, fontSize: 14, fontWeight: 600 }}
                  >
                    Không tìm thấy khóa học nào
                  </Typography>
                  <Typography
                    variant="caption"
                    color={COLORS.inkSoft}
                    sx={{ display: "block", mt: 0.25 }}
                  >
                    Hiện chưa có khóa học nào được phát hành phù hợp với bộ lọc
                    hiện tại.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.25}>
                  {items.map((item) => {
                    const id = item.id || item.idKhoaHoc;

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
                          "&:hover .go-arrow": {
                            transform: "translateX(2px)",
                            color: COLORS.primary,
                          },
                        }}
                      >
                        <CourseThumbnail
                          src={item.hinhAnhKhoaHoc || item.anhBia}
                          alt={item.tieuDe || "Khóa học"}
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
                        >
                          <Tooltip title="Xem chi tiết">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCourse(id);
                              }}
                              sx={{ color: mix(COLORS.ink, 0.5) }}
                            >
                              <VisibilityRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <ChevronRightRoundedIcon
                            className="go-arrow"
                            sx={{
                              color: mix(COLORS.ink, 0.25),
                              transition: "all .18s ease",
                            }}
                          />
                        </Stack>
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
