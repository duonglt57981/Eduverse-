/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
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
  alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";

import AuthGuard from "@/src/components/AuthGuard";
import DashboardShell from "@/src/components/dashboard/DashboardShell";

import {
  NoiDungViewer,
  MoTaKhoaHoc,
  KhoaHocAccordionItem,
  KhoiTenKhoaHoc,
  KhoiTuChoiForm,
} from "./types/index";
import {
  COLORS,
  FONTS,
  boxSx,
  SCROLL_AREA_HEIGHT,
  TABS,
  PAGE_SIZE,
  normalizeListResponse,
  normalizeDetailResponse,
  normalizeTrangThai,
  isTrangThaiCho,
} from "./types/constants";
import KiemDuyetService from "@/src/services/KiemDuyetServide";

const kiemDuyetService = new KiemDuyetService();

export default function DuyetKhoaHocPage() {
  const [tab, setTab] = useState<"ChoDuyet" | "TatCa" | "DaDuyet" | "TuChoi">(
    "ChoDuyet",
  );
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<any[]>([]);
  const [totalPage, setTotalPage] = useState(1);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [ghiChu, setGhiChu] = useState("");
  const [showTuChoi, setShowTuChoi] = useState(false);

  const searchParams = useMemo(() => {
    const params: any = { page, pageSize: PAGE_SIZE };
    if (keyword.trim()) params.keyword = keyword.trim();
    if (tab !== "TatCa") params.trangThai = tab;
    return params;
  }, [keyword, tab, page]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await kiemDuyetService.GetListKiemDuyetKhoaHoc(searchParams);
      const { list, totalPage: tp } = normalizeListResponse(res, PAGE_SIZE);
      setItems(list);
      setTotalPage(tp);
      if (list.length > 0) {
        setSelectedId((prev) => prev ?? list[0].idKhoaHoc ?? list[0].id);
        setExpandedId((prev) => prev ?? list[0].idKhoaHoc ?? list[0].id);
      } else {
        setSelectedId(null);
        setExpandedId(null);
        setSelectedContent(null);
        setDetail(null);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
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

  useEffect(() => {
    if (!selectedId) {
      // Reset về rỗng khi bỏ chọn — cũng là đồng bộ state với dependency
      // bên ngoài (selectedId), không phải setState tuỳ tiện; tắt rule ở
      // đúng dòng này vì rule chưa nhận diện được trường hợp hợp lệ này.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDetail(null);
      return;
    }
    let cancelled = false;
    const fetchDetail = async () => {
      setDetailLoading(true);
      try {
        const res =
          await kiemDuyetService.GetDetailKiemDuyetKhoaHoc(selectedId);
        if (!cancelled) setDetail(normalizeDetailResponse(res));
      } catch (error) {
        console.error("Lỗi tải chi tiết:", error);
        if (!cancelled) setDetail(null);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    };
    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const handleToggleExpand = (id: string) => {
    const willExpand = expandedId !== id;
    setExpandedId(willExpand ? id : null);
    if (willExpand) {
      setSelectedId(id);
      setSelectedContent(null);
    }
  };

  const handleSelectContent = (loai: "baiGiang" | "taiLieu", item: any) => {
    setSelectedContent({ loai, item });
  };

  const handleDuyet = async (id: string, isDuyet: boolean) => {
    setActionLoading(true);
    try {
      const res = await kiemDuyetService.KiemDuyetKhoaHoc({
        idBanNhap: id,
        trangThaiPheDuyet: isDuyet ? "DaDuyet" : "TuChoi",
      });
      if (res?.status) {
        await fetchList();
        const detailRes = await kiemDuyetService.GetDetailKiemDuyetKhoaHoc(id);
        setDetail(normalizeDetailResponse(detailRes));
      }
    } catch (error) {
      console.error("Lỗi duyệt:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTuChoi = async (id: string, ghiChuValue: string) => {
    setActionLoading(true);
    try {
      // FIX: dùng đúng field của KiemDuyetKhoaHocRequest — idBanNhap thay
      // idKhoaHoc, trangThaiPheDuyet: "TuChoi" thay isDuyet: false, và lyDo
      // (không phải ghiChu) để truyền lý do từ chối.
      const res = await kiemDuyetService.KiemDuyetKhoaHoc({
        idBanNhap: id,
        trangThaiPheDuyet: "TuChoi",
        lyDo: ghiChuValue,
      });
      if (res?.status) {
        await fetchList();
        const detailRes = await kiemDuyetService.GetDetailKiemDuyetKhoaHoc(id);
        setDetail(normalizeDetailResponse(detailRes));
        setShowTuChoi(false);
        setGhiChu("");
      }
    } catch (error) {
      console.error("Lỗi từ chối:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const trangThaiKhoaHoc = detail
    ? normalizeTrangThai(detail.trangThaiPheDuyet)
    : null;
  const isChoDuyet = isTrangThaiCho(trangThaiKhoaHoc);

  const handleTabChange = (_: any, newTab: string) => {
    setTab(newTab as any);
    setPage(1);
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    setPage(1);
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

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
              alignItems: "flex-start",
            }}
          >
            {/* Cột trái */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                maxHeight: { md: SCROLL_AREA_HEIGHT },
                overflowY: { md: "auto" },
                pr: { md: 2 },
                "&::-webkit-scrollbar": { width: 6 },
                "&::-webkit-scrollbar-track": { background: "transparent" },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: alpha(COLORS.primary, 0.22),
                  borderRadius: 999,
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: alpha(COLORS.primary, 0.35),
                },
                scrollbarWidth: "thin",
                scrollbarColor: `${alpha(COLORS.primary, 0.22)} transparent`,
              }}
            >
              <KhoiTenKhoaHoc
                detail={detail}
                isChoDuyet={isChoDuyet}
                actionLoading={actionLoading}
                onDuyet={() => detail && handleDuyet(detail.idKhoaHoc, true)}
                onTuChoiClick={() => setShowTuChoi(true)}
              />

              {showTuChoi && (
                <KhoiTuChoiForm
                  ghiChu={ghiChu}
                  onChange={setGhiChu}
                  onCancel={() => {
                    setShowTuChoi(false);
                    setGhiChu("");
                  }}
                  onConfirm={() =>
                    detail && handleTuChoi(detail.idKhoaHoc, ghiChu)
                  }
                  actionLoading={actionLoading}
                />
              )}

              <Box sx={{ ...boxSx, p: 2.5, minHeight: 420 }}>
                {detailLoading ? (
                  <Skeleton variant="rounded" height={380} />
                ) : detail ? (
                  <NoiDungViewer selected={selectedContent} />
                ) : (
                  <Box
                    sx={{
                      minHeight: 380,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <SchoolRoundedIcon
                      sx={{
                        fontSize: 40,
                        color: alpha(COLORS.primary, 0.2),
                        mb: 1.5,
                      }}
                    />
                    <Typography sx={{ color: COLORS.inkSoft }}>
                      Chọn một khóa học bên phải để bắt đầu kiểm duyệt.
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ ...boxSx, p: 2.5 }}>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: COLORS.inkSoft,
                    mb: 1.25,
                  }}
                >
                  Mô tả khóa học
                </Typography>
                {detail?.moTa ? (
                  <MoTaKhoaHoc html={detail.moTa} />
                ) : (
                  <Typography variant="body2" sx={{ color: COLORS.inkSoft }}>
                    Khóa học chưa có mô tả.
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Cột phải */}
            <Box
              sx={{
                width: { xs: "100%", md: 360 },
                flexShrink: 0,
                position: { md: "sticky" },
                top: { md: 0 },
                alignSelf: "flex-start",
                ...boxSx,
                display: "flex",
                flexDirection: "column",
                maxHeight: { md: SCROLL_AREA_HEIGHT },
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderBottom: `1px solid ${COLORS.line}`,
                  bgcolor: COLORS.paper,
                  flexShrink: 0,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: COLORS.inkSoft,
                    mb: 1.5,
                  }}
                >
                  Danh sách khóa học
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Tìm khóa học, giảng viên..."
                  value={keyword}
                  onChange={handleKeywordChange}
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

              <Box sx={{ flex: 1, overflowY: "auto", p: 1.5 }}>
                {loading ? (
                  <Stack spacing={1.25}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        variant="rounded"
                        height={64}
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
                  <Stack spacing={1.25}>
                    {items.map((item: any) => {
                      const id = item.idKhoaHoc ?? item.id;
                      const isExpanded = expandedId === id;
                      return (
                        <KhoaHocAccordionItem
                          key={id}
                          item={item}
                          isSelectedCourse={selectedId === id}
                          isExpanded={isExpanded}
                          detail={isExpanded ? detail : null}
                          detailLoading={isExpanded && detailLoading}
                          selectedContent={selectedContent}
                          onToggleExpand={handleToggleExpand}
                          onSelectContent={handleSelectContent}
                        />
                      );
                    })}
                  </Stack>
                )}
              </Box>

              {!loading && items.length > 0 && (
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "center",
                    p: 1.5,
                    borderTop: `1px solid ${COLORS.line}`,
                    bgcolor: COLORS.paper,
                    flexShrink: 0,
                  }}
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
