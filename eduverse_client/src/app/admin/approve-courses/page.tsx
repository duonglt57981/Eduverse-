/* eslint-disable @typescript-eslint/no-explicit-any */
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
  alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";

import AuthGuard from "@/src/components/AuthGuard";
import KiemDuyetService from "@/src/services/KiemDuyetServide";
import {
  COLORS,
  FONTS,
  boxSx,
  TABS,
  PAGE_SIZE,
  normalizeListResponse,
} from "./types/constants";
import { StatusChip } from "./types";
import DashboardShell from "@/src/components/dashboard/DashboardShell";

const kiemDuyetService = new KiemDuyetService();

// Base URL cho ảnh tĩnh (khác với base URL của API JSON, ví dụ API là
// https://api.eduverse.vn/api nhưng ảnh nằm ở https://api.eduverse.vn).
// Chỉnh biến env NEXT_PUBLIC_FILE_BASE_URL trong .env.local cho khớp backend.
const FILE_BASE_URL =
  process.env.NEXT_PUBLIC_FILE_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "";

function resolveImageUrl(path?: string | null): string | null {
  if (!path) return null;
  // Đã là URL tuyệt đối (http/https) -> dùng luôn
  if (/^https?:\/\//i.test(path)) return path;
  // Đường dẫn tương đối -> ghép với base URL file
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

  const [tab, setTab] = useState<"ChoDuyet" | "TatCa" | "DaDuyet" | "TuChoi">(
    "ChoDuyet",
  );
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState<any[]>([]);
  const [totalPage, setTotalPage] = useState(1);

  const searchParams = useMemo(() => {
    const params: any = { trang: page, soLuong: PAGE_SIZE };
    if (keyword.trim()) params.tuKhoa = keyword.trim();
    if (tab !== "TatCa") params.trangThaiPheDuyet = tab;
    return params;
  }, [keyword, tab, page]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await kiemDuyetService.GetListKiemDuyetKhoaHoc(searchParams);
      const { list, totalPage: tp } = normalizeListResponse(res, PAGE_SIZE);
      setItems(list);
      setTotalPage(tp);
    } catch (error) {
      console.error("Lỗi tải danh sách kiểm duyệt:", error);
      setItems([]);
      setTotalPage(1);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchList();
  }, [fetchList]);

  const handleTabChange = (_: any, newTab: string) => {
    setTab(newTab as any);
    setPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(keywordInput);
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
          <Typography
            sx={{
              fontSize: 28,
              fontWeight: 700,
              fontFamily: FONTS.display,
              color: COLORS.ink,
              mb: 3,
            }}
          >
            Kiểm duyệt khóa học
          </Typography>

          <Box sx={{ ...boxSx, p: 2 }}>
            {/* Thanh tìm kiếm + tabs */}
            <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 2 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Tìm khóa học, giảng viên..."
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                sx={{
                  bgcolor: "#fff",
                  mb: 1.5,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                    "& fieldset": { borderColor: COLORS.line },
                    "&:hover fieldset": { borderColor: COLORS.primary },
                    "&.Mui-focused fieldset": { borderColor: COLORS.primary },
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
              <Tabs
                value={tab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons={false}
                slotProps={{
                  indicator: {
                    style: { backgroundColor: COLORS.primary, height: 2 },
                  },
                }}
                sx={{
                  minHeight: 32,
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                    color: COLORS.inkSoft,
                    minHeight: 32,
                    fontSize: 12.5,
                    px: 1.25,
                    minWidth: "auto",
                  },
                  "& .Mui-selected": {
                    color: `${COLORS.primary} !important`,
                  },
                }}
              >
                {TABS.map((t) => (
                  <Tab key={t.value} value={t.value} label={t.label} />
                ))}
              </Tabs>
            </Box>

            {/* Danh sách khóa học */}
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
                {items.map((item: any) => {
                  const id = item.idKhoaHoc;
                  const trangThaiPheDuyet =
                    item.trangThaiPheDuyet ?? item.trangThai;

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
                          boxShadow: `0 2px 10px ${alpha(COLORS.primary, 0.12)}`,
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
              <Stack direction="row" sx={{ justifyContent: "center", pt: 2.5 }}>
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
      </DashboardShell>
    </AuthGuard>
  );
}
