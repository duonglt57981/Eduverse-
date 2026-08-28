/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Stack,
  Typography,
  Skeleton,
  IconButton,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import AuthGuard from "@/src/components/AuthGuard";

import {
  NoiDungViewer,
  MoTaKhoaHoc,
  KhoiTenKhoaHoc,
  KhoiTuChoiForm,
} from "./types/index";
import {
  COLORS,
  FONTS,
  boxSx,
  normalizeDetailResponse,
} from "./types/constants";
import KiemDuyetService from "@/src/services/KiemDuyetServide";
import KiemDuyetSidebar from "./components/KiemDuyetSidebar";
import { ApiResponse } from "@/src/types/types";
import { LyDoTuChoiRequest } from "@/src/types/KiemDuyet/Dto/dto";
import { BRAND, CSSVAR } from "@/src/theme/tokens";

const kiemDuyetService = new KiemDuyetService();

type ConfirmAction = "duyet" | "tuChoi" | null;

const scrollbarSx = {
  overflowY: "auto" as const,
  overflowX: "hidden" as const,
  minHeight: 0,
  "&::-webkit-scrollbar": { width: 5 },
  "&::-webkit-scrollbar-track": { background: "transparent" },
  "&::-webkit-scrollbar-thumb": {
    background: alpha(BRAND.main, 0.2),
    borderRadius: 8,
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: alpha(BRAND.main, 0.35),
  },
};

const DOI_TUONG_ID_KEY: Record<"baiGiang" | "baiKiemTra" | "taiLieu", string> =
  {
    baiGiang: "idBaiGiang",
    baiKiemTra: "idBaiKiemTra",
    taiLieu: "idTaiLieu",
  };

const LOAI_DOI_TUONG: Record<
  "baiGiang" | "baiKiemTra" | "taiLieu",
  "BaiGiang" | "BaiKiemTra" | "TaiLieu"
> = {
  baiGiang: "BaiGiang",
  baiKiemTra: "BaiKiemTra",
  taiLieu: "TaiLieu",
};

export default function ChiTietKiemDuyetKhoaHocPage() {
  const params = useParams();
  const router = useRouter();
  const idKhoaHoc = (params?.courseId as string) ?? "";

  const [detailLoading, setDetailLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [ghiChu, setGhiChu] = useState("");
  const [showTuChoi, setShowTuChoi] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const [lyDoIdMap, setLyDoIdMap] = useState<Record<string, string>>({});

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // ── Tìm nội dung đầu tiên (bài giảng hoặc bài kiểm tra) trong cây detail ──
  const findFirstContent = useCallback((detailData: any) => {
    if (!detailData?.phans || detailData.phans.length === 0) return null;
    for (const phan of detailData.phans) {
      if (phan.baiGiangs && phan.baiGiangs.length > 0) {
        return { loai: "baiGiang" as const, item: phan.baiGiangs[0] };
      }
      if (phan.baiKiemTras && phan.baiKiemTras.length > 0) {
        return { loai: "baiKiemTra" as const, item: phan.baiKiemTras[0] };
      }
    }
    return null;
  }, []);

  // ── Chọn nội dung ──
  const handleSelectContent = useCallback(
    (loai: "baiGiang" | "taiLieu" | "baiKiemTra", item: any) => {
      setSelectedContent({ loai, item });

      if (loai === "baiGiang" || loai === "baiKiemTra" || loai === "taiLieu") {
        const doiTuongId = item?.[DOI_TUONG_ID_KEY[loai]];
        let existingLyDoId: string | null = null;
        const lyDoData = item?.lyDoTuChois;

        if (lyDoData) {
          if (Array.isArray(lyDoData) && lyDoData.length > 0) {
            const first = lyDoData[0];
            if (first?.id) existingLyDoId = first.id;
          } else if (typeof lyDoData === "object" && lyDoData.id) {
            existingLyDoId = lyDoData.id;
          }
        }

        if (!existingLyDoId) {
          existingLyDoId =
            item?.idLyDoTuChoi ?? item?.lyDoTuChoiId ?? item?.lyDo?.id ?? null;
        }

        if (doiTuongId && existingLyDoId) {
          const key = `${loai}-${doiTuongId}`;
          setLyDoIdMap((prev) =>
            prev[key] ? prev : { ...prev, [key]: String(existingLyDoId) },
          );
        }
      }
    },
    [],
  );

  // ── Tự động chọn nội dung đầu tiên khi detail load xong ──
  useEffect(() => {
    if (!detailLoading && detail && !selectedContent) {
      const first = findFirstContent(detail);
      if (first) {
        handleSelectContent(first.loai, first.item);
      }
    }
  }, [
    detailLoading,
    detail,
    selectedContent,
    findFirstContent,
    handleSelectContent,
  ]);

  // ── Hàm tải chi tiết (trả về dữ liệu) ──
  const fetchDetail = useCallback(async () => {
    if (!idKhoaHoc) {
      setDetailLoading(false);
      return null;
    }
    setDetailLoading(true);
    try {
      const res = await kiemDuyetService.GetDetailKiemDuyetKhoaHoc(idKhoaHoc);
      const normalizedData = normalizeDetailResponse(res);
      setDetail(normalizedData);
      return normalizedData;
    } catch (error) {
      console.error("Lỗi tải chi tiết:", error);
      setDetail(null);
      return null;
    } finally {
      setDetailLoading(false);
    }
  }, [idKhoaHoc]);

  // ── Fetch khi component mount ──
  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const goBackToList = useCallback(() => {
    router.push("/admin/inspect-courses");
  }, [router]);

  // ── Hàm đệ quy tìm và cập nhật lý do từ chối trong cây dữ liệu detail ──
  const patchLyDoInTree = (
    node: any,
    matchKey: string,
    id: string,
    lyDo: string,
  ): boolean => {
    if (node == null || typeof node !== "object") return false;

    if (Array.isArray(node)) {
      for (const child of node) {
        if (patchLyDoInTree(child, matchKey, id, lyDo)) return true;
      }
      return false;
    }

    if (node[matchKey] === id) {
      if (Array.isArray(node.lyDoTuChois) && node.lyDoTuChois.length > 0) {
        node.lyDoTuChois[0].lyDo = lyDo;
      } else if (
        typeof node.lyDoTuChois === "object" &&
        node.lyDoTuChois !== null
      ) {
        node.lyDoTuChois.lyDo = lyDo;
      } else {
        node.lyDoTuChois = { lyDo };
      }
      node.lyDoTuChoi = lyDo;
      return true;
    }

    for (const key of Object.keys(node)) {
      if (key !== "lyDoTuChois" && key !== "lyDoTuChoi") {
        if (patchLyDoInTree(node[key], matchKey, id, lyDo)) return true;
      }
    }
    return false;
  };

  // ── Lưu lý do từ chối (Create hoặc Update) và cập nhật UI ──
  const handleSaveLyDo = useCallback(
    async (
      loai: "baiGiang" | "baiKiemTra" | "taiLieu",
      id: string | number,
      lyDo: string,
    ) => {
      const key = `${loai}-${id}`;
      const existingId = lyDoIdMap[key];

      try {
        const request: LyDoTuChoiRequest = {
          ...(existingId ? { id: existingId } : {}),
          idDoiTuong: String(id),
          loaiDoiTuong: LOAI_DOI_TUONG[loai],
          lyDo,
        };

        const res = existingId
          ? await kiemDuyetService.UpdateLyDoTuChoi(request)
          : await kiemDuyetService.CreateLyDoTuChoi(request);

        if (!existingId) {
          const newId = (res?.data as any)?.id ?? (res?.data as any)?.createdId;
          if (newId) {
            setLyDoIdMap((prev) => ({ ...prev, [key]: String(newId) }));
          }
        }

        setDetail((prevDetail: any) => {
          if (!prevDetail) return prevDetail;
          const matchKey = DOI_TUONG_ID_KEY[loai];
          const newDetail = { ...prevDetail };
          const found = patchLyDoInTree(newDetail, matchKey, String(id), lyDo);
          if (found) {
            if (
              selectedContent &&
              selectedContent.loai === loai &&
              selectedContent.item[matchKey] === id
            ) {
              const newItem = { ...selectedContent.item };
              if (
                Array.isArray(newItem.lyDoTuChois) &&
                newItem.lyDoTuChois.length > 0
              ) {
                newItem.lyDoTuChois[0].lyDo = lyDo;
              } else if (
                typeof newItem.lyDoTuChois === "object" &&
                newItem.lyDoTuChois !== null
              ) {
                newItem.lyDoTuChois.lyDo = lyDo;
              } else {
                newItem.lyDoTuChois = { lyDo };
              }
              newItem.lyDoTuChoi = lyDo;
              setSelectedContent({ loai, item: newItem });
            }
            return newDetail;
          }
          fetchDetail();
          return prevDetail;
        });

        setSnackbar({
          open: true,
          message: existingId
            ? "✅ Đã cập nhật lý do từ chối!"
            : "✅ Đã lưu lý do từ chối!",
          severity: "success",
        });
      } catch (error: any) {
        console.error("Lỗi lưu lý do:", error);
        setSnackbar({
          open: true,
          message: error?.message || "❌ Lỗi khi lưu lý do từ chối!",
          severity: "error",
        });
        throw error;
      }
    },
    [fetchDetail, lyDoIdMap, selectedContent],
  );

  // ── Từ chối toàn bộ khóa học ──
  const handleTuChoi = async () => {
    if (!detail) return;
    setActionLoading(true);
    try {
      const res: ApiResponse<any> = await kiemDuyetService.KiemDuyetKhoaHoc({
        idKhoaHoc: detail.idKhoaHoc,
        trangThaiPheDuyet: "TuChoi",
        lyDo: ghiChu,
      });
      const isSuccess = res?.status === true;
      if (isSuccess) {
        setSnackbar({
          open: true,
          message: res?.message || "✅ Đã ngưng hoạt động khóa học thành công!",
          severity: "success",
        });
        setTimeout(goBackToList, 1500);
      } else {
        setSnackbar({
          open: true,
          message: res?.message || "❌ Ngưng hoạt động khóa học thất bại",
          severity: "error",
        });
      }
    } catch (error: any) {
      console.error("Lỗi từ chối:", error);
      setSnackbar({
        open: true,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "❌ Đã xảy ra lỗi khi ngưng hoạt động khóa học",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
      setShowTuChoi(false);
      setGhiChu("");
    }
  };

  const handleTuChoiConfirmClick = () => setConfirmAction("tuChoi");
  const handleConfirmDialogOk = () => {
    if (confirmAction === "tuChoi") handleTuChoi();
  };

  const hasDescription = detail?.moTa && detail.moTa.trim().length > 0;

  // ── Giao diện chính ──
  return (
    <AuthGuard allowedRoles={["Admin", "personnel"]}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: "12px", fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box
        sx={{
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          p: { xs: 2, sm: 3 },
          bgcolor: "#F8FAFC",
        }}
      >
        {/* Header Bar */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: "center", mb: 2.5, flexShrink: 0 }}
        >
          <Tooltip title="Quay lại danh sách">
            <IconButton
              onClick={goBackToList}
              sx={{
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
                color: "#0F172A",
                bgcolor: "#FFFFFF",
                p: 1.1,
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "#FFFFFF",
                  borderColor: alpha(BRAND.main, 0.4),
                  transform: "translateX(-2px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                },
              }}
              size="medium"
            >
              <ArrowBackRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: { xs: 20, sm: 24 },
                fontWeight: 900,
                fontFamily: FONTS.display,
                color: "#0F172A",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              Xem xét khóa học
            </Typography>
            <Typography
              sx={{
                fontSize: 13,
                color: "#64748B",
                fontWeight: 500,
                display: { xs: "none", sm: "block" },
              }}
            >
              Kiểm tra nội dung các bài học, tài liệu và cập nhật trạng thái hoạt động của khóa học
            </Typography>
          </Box>

          {!detailLoading && detail && (
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                disabled={actionLoading}
                startIcon={<BlockRoundedIcon sx={{ fontSize: 18 }} />}
                onClick={() => setShowTuChoi(true)}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 13.5,
                  borderRadius: "12px",
                  borderColor: "#FECACA",
                  bgcolor: "#FEF2F2",
                  color: "#DC2626",
                  px: 2.5,
                  py: 1,
                  height: 42,
                  boxShadow: "0 1px 3px rgba(220, 38, 38, 0.05)",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    borderColor: "#DC2626",
                    bgcolor: "#FEE2E2",
                    boxShadow: "0 4px 12px rgba(220, 38, 38, 0.15)",
                  },
                }}
              >
                Ngưng hoạt động
              </Button>
            </Stack>
          )}
        </Stack>

        {showTuChoi && (
          <Box sx={{ mb: 2, flexShrink: 0 }}>
            <KhoiTuChoiForm
              ghiChu={ghiChu}
              onChange={setGhiChu}
              onCancel={() => {
                setShowTuChoi(false);
                setGhiChu("");
              }}
              onConfirm={handleTuChoiConfirmClick}
              actionLoading={actionLoading}
            />
          </Box>
        )}

        {/* Modal xác nhận ngưng hoạt động */}
        <Dialog
          open={confirmAction !== null}
          onClose={() => {
            if (!actionLoading) setConfirmAction(null);
          }}
          maxWidth="xs"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                borderRadius: "20px",
                p: 1,
                boxShadow: "0 20px 48px rgba(0, 0, 0, 0.15)",
              },
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 18,
              color: "#0F172A",
              pt: 2,
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                bgcolor: "#FEF2F2",
                color: "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <WarningAmberRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            Xác nhận ngưng hoạt động khóa học?
          </DialogTitle>
          <DialogContent sx={{ py: 1.5 }}>
            <Typography sx={{ color: "#64748B", fontSize: 14.5, lineHeight: 1.6 }}>
              Bạn có chắc chắn muốn ngưng hoạt động khóa học{" "}
              <Box component="span" sx={{ fontWeight: 800, color: "#0F172A" }}>
                &quot;{detail?.tieuDe || "Khóa học"}&quot;
              </Box>{" "}
              không? Khóa học sẽ được chuyển sang trạng thái &quot;Từ chối&quot; và tạm thời không còn hiển thị công khai.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
            <Button
              onClick={() => setConfirmAction(null)}
              disabled={actionLoading}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "#64748B",
                borderRadius: "8px",
                px: 2,
              }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmDialogOk}
              disabled={actionLoading}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                bgcolor: "#DC2626",
                borderRadius: "8px",
                px: 2.5,
                boxShadow: "none",
                "&:hover": { bgcolor: "#B91C1C", boxShadow: "none" },
              }}
            >
              {actionLoading ? (
                <CircularProgress size={16} sx={{ color: "#fff" }} />
              ) : (
                "Xác nhận ngưng"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Main 2-Column Split Workspace */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2.5,
            overflow: { xs: "auto", md: "hidden" },
          }}
        >
          {/* Left Column: Viewer & Details */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              pr: { md: 0.5 },
              ...scrollbarSx,
              "& > *": {
                flexShrink: 0,
              },
            }}
          >
            {detailLoading ? (
              <>
                <Skeleton variant="rounded" height={110} sx={{ borderRadius: "18px" }} />
                <Skeleton variant="rounded" height={420} sx={{ borderRadius: "18px" }} />
              </>
            ) : detail ? (
              <>
                <KhoiTenKhoaHoc detail={detail} />
                <Box sx={{ ...boxSx, p: { xs: 2, sm: 2.5 } }}>
                  <NoiDungViewer
                    selected={selectedContent}
                    onSaveLyDo={handleSaveLyDo}
                  />
                </Box>
                {hasDescription && (
                  <Box sx={{ ...boxSx, p: { xs: 2, sm: 2.5 } }}>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "#475569",
                        fontFamily: FONTS.display,
                        mb: 1.5,
                      }}
                    >
                      Mô tả khóa học
                    </Typography>
                    <MoTaKhoaHoc html={detail.moTa} />
                  </Box>
                )}
              </>
            ) : (
              <Box
                sx={{
                  ...boxSx,
                  minHeight: 240,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 4,
                  textAlign: "center",
                }}
              >
                <SchoolRoundedIcon
                  sx={{
                    fontSize: 48,
                    color: alpha(BRAND.main, 0.2),
                    mb: 1.5,
                  }}
                />
                <Typography sx={{ color: "#64748B", fontWeight: 600 }}>
                  Không tìm thấy thông tin khóa học.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Right Column: Sidebar */}
          <Box
            sx={{
              width: { xs: "100%", md: 380, lg: 400 },
              flexShrink: 0,
              ...boxSx,
              overflow: "hidden",
            }}
          >
            {detailLoading ? (
              <Stack spacing={1.5} sx={{ p: 2.5 }}>
                <Skeleton variant="rounded" height={44} sx={{ borderRadius: "12px" }} />
                <Skeleton variant="rounded" height={60} sx={{ borderRadius: "14px" }} />
                <Skeleton variant="rounded" height={60} sx={{ borderRadius: "14px" }} />
                <Skeleton variant="rounded" height={60} sx={{ borderRadius: "14px" }} />
              </Stack>
            ) : detail ? (
              <KiemDuyetSidebar
                detail={detail}
                selected={selectedContent}
                onSelectContent={handleSelectContent}
              />
            ) : (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography sx={{ color: "#64748B", fontWeight: 500 }}>
                  Không có dữ liệu để hiển thị.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </AuthGuard>
  );
}
