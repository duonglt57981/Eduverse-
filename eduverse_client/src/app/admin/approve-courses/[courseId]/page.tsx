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
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import AuthGuard from "@/src/components/AuthGuard";

import {
  NoiDungViewer,
  MoTaKhoaHoc,
  KhoiTenKhoaHoc,
  KhoiTuChoiForm,
} from "../types/index";
import {
  COLORS,
  FONTS,
  boxSx,
  normalizeDetailResponse,
  isTrangThaiCho,
} from "../types/constants";
import KiemDuyetService from "@/src/services/KiemDuyetServide";
import KiemDuyetSidebar from "./components/KiemDuyetSidebar";
import { ApiResponse } from "@/src/types/types";
import { LyDoTuChoiRequest } from "@/src/types/KiemDuyet/Dto/dto";
import { CSSVAR } from "@/src/theme/tokens";

const kiemDuyetService = new KiemDuyetService();

type ConfirmAction = "duyet" | "tuChoi" | null;

const scrollbarSx = {
  overflowY: "auto" as const,
  overflowX: "hidden" as const,
  minHeight: 0,
  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-track": { background: "transparent" },
  "&::-webkit-scrollbar-thumb": {
    background: alpha(COLORS.primary, 0.25),
    borderRadius: 8,
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: alpha(COLORS.primary, 0.4),
  },
};

// ── Nhận diện & lấy id của bài giảng / bài kiểm tra một cách "khoan dung" ──
// Một số dữ liệu API thực tế không trả về idBaiGiang/idBaiKiemTra trên mọi
// node (chỉ có "id" chung), nên cần fallback sang "id" — nhưng chỉ khi node
// đó thực sự "trông giống" bài giảng/bài kiểm tra (tránh khớp nhầm sang phần,
// tài liệu, câu hỏi... cũng có field "id" khi duyệt đệ quy cả cây dữ liệu).
const isDoiTuongType = (
  node: any,
  loai: "baiGiang" | "baiKiemTra",
): boolean => {
  if (!node || typeof node !== "object") return false;
  if (loai === "baiGiang") {
    return "idBaiGiang" in node || "tenBaiGiang" in node;
  }
  return "idBaiKiemTra" in node || "tenBaiKiemTra" in node || "cauHois" in node;
};

const getDoiTuongId = (
  loai: "baiGiang" | "baiKiemTra",
  node: any,
): string | null => {
  if (!node) return null;
  const raw =
    loai === "baiGiang"
      ? (node.idBaiGiang ?? node.id)
      : (node.idBaiKiemTra ?? node.id);
  return raw != null ? String(raw) : null;
};

export default function ChiTietKiemDuyetKhoaHocPage() {
  const params = useParams();
  const router = useRouter();
  const idKhoaHoc = (params?.courseId as string) ?? "";

  const [detailLoading, setDetailLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null);
  const [selectedContent, setSelectedContent] = useState<{
    loai: "baiGiang" | "taiLieu" | "baiKiemTra";
    item: any;
    lyDoTarget?: { loai: "baiGiang" | "baiKiemTra"; item: any } | null;
  } | null>(null);
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

  // ── Tìm bài giảng cha của tài liệu ──
  const findParentBaiGiang = useCallback(
    (detailData: any, idBaiGiang: string | number) => {
      if (!detailData?.phans) return null;
      for (const phan of detailData.phans) {
        if (phan.baiGiangs && Array.isArray(phan.baiGiangs)) {
          for (const bg of phan.baiGiangs) {
            if (String(bg.idBaiGiang) === String(idBaiGiang)) return bg;
          }
        }
      }
      return null;
    },
    [],
  );

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

  // ── Chọn nội dung ──
  const handleSelectContent = useCallback(
    (
      loai: "baiGiang" | "taiLieu" | "baiKiemTra",
      item: any,
      parentBaiGiang?: any,
    ) => {
      let lyDoTarget: { loai: "baiGiang" | "baiKiemTra"; item: any } | null =
        null;

      if (loai === "taiLieu") {
        // Ưu tiên bài giảng cha được truyền trực tiếp từ sidebar (đáng tin
        // cậy hơn vì không phụ thuộc tài liệu có field idBaiGiang hay
        // không — dữ liệu API thật thường lồng tài liệu bên trong bài
        // giảng mà không lặp lại idBaiGiang trên từng tài liệu con).
        const parentBg =
          parentBaiGiang ?? findParentBaiGiang(detail, item.idBaiGiang);
        if (parentBg) {
          lyDoTarget = { loai: "baiGiang", item: parentBg };
        }
      } else if (loai === "baiGiang" || loai === "baiKiemTra") {
        lyDoTarget = { loai, item };
      }

      setSelectedContent({ loai, item, lyDoTarget });

      // Cập nhật lyDoIdMap dựa trên target (nếu có)
      const target = lyDoTarget || { loai, item };
      if (target.loai === "baiGiang" || target.loai === "baiKiemTra") {
        const doiTuongId = getDoiTuongId(target.loai, target.item);
        let existingLyDoId: string | null = null;
        const lyDoData = target.item?.lyDoTuChois;
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
            target.item?.idLyDoTuChoi ??
            target.item?.lyDoTuChoiId ??
            target.item?.lyDo?.id ??
            null;
        }
        if (doiTuongId && existingLyDoId) {
          const key = `${target.loai}-${doiTuongId}`;
          setLyDoIdMap((prev) =>
            prev[key] ? prev : { ...prev, [key]: String(existingLyDoId) },
          );
        }
      }
    },
    [detail, findParentBaiGiang],
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

  // ── Fetch khi component mount ──
  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const goBackToList = useCallback(() => {
    router.push("/admin/approve-courses");
  }, [router]);

  // ── Hàm đệ quy tìm và cập nhật lý do từ chối trong cây dữ liệu detail ──
  const patchLyDoInTree = (
    node: any,
    loai: "baiGiang" | "baiKiemTra",
    id: string,
    lyDo: string,
  ): boolean => {
    if (node == null || typeof node !== "object") return false;

    if (Array.isArray(node)) {
      for (const child of node) {
        if (patchLyDoInTree(child, loai, id, lyDo)) return true;
      }
      return false;
    }

    if (isDoiTuongType(node, loai) && getDoiTuongId(loai, node) === id) {
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
        if (patchLyDoInTree(node[key], loai, id, lyDo)) return true;
      }
    }
    return false;
  };

  // ── Lưu lý do từ chối (Create hoặc Update) và cập nhật UI ──
  const handleSaveLyDo = useCallback(
    async (
      loai: "baiGiang" | "baiKiemTra",
      id: string | number,
      lyDo: string,
    ) => {
      const key = `${loai}-${id}`;
      const existingId = lyDoIdMap[key];

      try {
        const request: LyDoTuChoiRequest = {
          ...(existingId ? { id: existingId } : {}),
          idDoiTuong: String(id),
          loaiDoiTuong: loai === "baiGiang" ? "BaiGiang" : "BaiKiemTra",
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

        // Cập nhật local state
        setDetail((prevDetail: any) => {
          if (!prevDetail) return prevDetail;
          const newDetail = { ...prevDetail };
          const found = patchLyDoInTree(newDetail, loai, String(id), lyDo);
          if (found) {
            // Cập nhật selectedContent nếu đang xem chính đối tượng đó
            if (
              selectedContent &&
              selectedContent.loai === loai &&
              getDoiTuongId(loai, selectedContent.item) === String(id)
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
              setSelectedContent({ ...selectedContent, item: newItem });
            }
            // Nếu selectedContent là tài liệu và target là bài giảng
            if (
              selectedContent &&
              selectedContent.loai === "taiLieu" &&
              selectedContent.lyDoTarget?.loai === loai &&
              getDoiTuongId(loai, selectedContent.lyDoTarget.item) ===
                String(id)
            ) {
              const newTargetItem = { ...selectedContent.lyDoTarget.item };
              if (
                Array.isArray(newTargetItem.lyDoTuChois) &&
                newTargetItem.lyDoTuChois.length > 0
              ) {
                newTargetItem.lyDoTuChois[0].lyDo = lyDo;
              } else if (
                typeof newTargetItem.lyDoTuChois === "object" &&
                newTargetItem.lyDoTuChois !== null
              ) {
                newTargetItem.lyDoTuChois.lyDo = lyDo;
              } else {
                newTargetItem.lyDoTuChois = { lyDo };
              }
              newTargetItem.lyDoTuChoi = lyDo;
              setSelectedContent({
                ...selectedContent,
                lyDoTarget: { loai, item: newTargetItem },
              });
            }
            return newDetail;
          }
          // Fallback: fetch lại nếu không tìm thấy
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

  // ── Duyệt toàn bộ khóa học ──
  const handleDuyet = async () => {
    if (!detail) return;
    setActionLoading(true);
    try {
      const res: ApiResponse<any> = await kiemDuyetService.KiemDuyetKhoaHoc({
        idKhoaHoc: detail.idKhoaHoc,
        trangThaiPheDuyet: "DaDuyet",
      });
      const isSuccess = res?.status === true;
      if (isSuccess) {
        setSnackbar({
          open: true,
          message: "✅ Duyệt khóa học thành công!",
          severity: "success",
        });
        setTimeout(goBackToList, 1500);
      } else {
        setSnackbar({
          open: true,
          message: res?.message || "❌ Duyệt khóa học thất bại",
          severity: "error",
        });
      }
    } catch (error: any) {
      console.error("Lỗi duyệt:", error);
      setSnackbar({
        open: true,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "❌ Đã xảy ra lỗi khi duyệt khóa học",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

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
          message: res?.message || "✅ Từ chối khóa học thành công!",
          severity: "success",
        });
        setTimeout(goBackToList, 1500);
      } else {
        setSnackbar({
          open: true,
          message: res?.message || "❌ Từ chối khóa học thất bại",
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
          "❌ Đã xảy ra lỗi khi từ chối khóa học",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
      setShowTuChoi(false);
      setGhiChu("");
    }
  };

  const handleDuyetClick = () => setConfirmAction("duyet");
  const handleTuChoiConfirmClick = () => setConfirmAction("tuChoi");
  const handleConfirmDialogOk = () => {
    if (confirmAction === "duyet") handleDuyet();
    else if (confirmAction === "tuChoi") handleTuChoi();
  };

  const trangThaiKhoaHoc = detail
    ? (detail.trangThaiPheDuyet ?? detail.trangThai)
    : null;
  const isChoDuyet = isTrangThaiCho(trangThaiKhoaHoc);
  const isDaDuyet =
    trangThaiKhoaHoc === "DaDuyet" || trangThaiKhoaHoc === "TuChoi";
  const hasDescription = detail?.moTa && detail.moTa.trim().length > 0;

  // ── Nếu đã duyệt / từ chối ──
  if (!detailLoading && detail && isDaDuyet) {
    return (
      <AuthGuard allowedRoles={["Admin", "personnel"]}>
        <Box
          sx={{
            height: "100dvh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            p: 3,
          }}
        >
          <Box
            sx={{
              ...boxSx,
              p: 5,
              maxWidth: 480,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <CheckCircleRoundedIcon
              sx={{ fontSize: 64, color: COLORS.success, mb: 2 }}
            />
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 700,
                fontFamily: FONTS.display,
                color: COLORS.ink,
                mb: 1,
              }}
            >
              Khóa học này đã được duyệt
            </Typography>
            <Typography sx={{ color: COLORS.inkSoft, mb: 3 }}>
              &quot;{detail?.tieuDe || detail?.tenKhoaHoc || "Khóa học"}&quot;
              đã được duyệt trước đó và không còn nằm trong danh sách chờ kiểm
              duyệt.
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={goBackToList}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                bgcolor: COLORS.primary,
                boxShadow: "none",
                "&:hover": {
                  bgcolor: COLORS.primaryDark,
                  boxShadow: "none",
                },
              }}
            >
              Quay lại danh sách kiểm duyệt
            </Button>
          </Box>
        </Box>
      </AuthGuard>
    );
  }

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
          sx={{ width: "100%" }}
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
        {/* Top Navigation Bar */}
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "center",
            mb: 2.5,
            flexShrink: 0,
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Tooltip title="Quay lại danh sách">
              <IconButton
                onClick={goBackToList}
                sx={{
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  color: "#334155",
                  bgcolor: "#FFFFFF",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    bgcolor: "#F1F5F9",
                    borderColor: "#CBD5E1",
                    transform: "translateX(-2px)",
                  },
                }}
                size="medium"
              >
                <ArrowBackRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Box>
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
                Kiểm duyệt khóa học
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#64748B", fontWeight: 600, fontSize: 12 }}
              >
                Đánh giá chất lượng nội dung và quyết định phê duyệt
              </Typography>
            </Box>
          </Stack>

          {!detailLoading && detail && isChoDuyet && (
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                disabled={actionLoading}
                onClick={() => setShowTuChoi(true)}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 13.5,
                  borderRadius: "12px",
                  borderColor: "#FECACA",
                  color: "#DC2626",
                  bgcolor: "#FFFFFF",
                  px: 2.5,
                  py: 1,
                  height: 42,
                  transition: "all 0.15s ease",
                  "&:hover": {
                    borderColor: "#DC2626",
                    bgcolor: "#FEF2F2",
                  },
                }}
              >
                Từ chối
              </Button>
              <Button
                variant="contained"
                disabled={actionLoading}
                onClick={handleDuyetClick}
                startIcon={
                  actionLoading && confirmAction === "duyet" ? undefined : (
                    <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
                  )
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                  fontSize: 13.5,
                  borderRadius: "12px",
                  bgcolor: COLORS.primary,
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
                  boxShadow: `0 4px 14px ${alpha(COLORS.primary, 0.28)}`,
                  px: 3,
                  py: 1,
                  height: 42,
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    boxShadow: `0 6px 20px ${alpha(COLORS.primary, 0.38)}`,
                    transform: "translateY(-1px)",
                  },
                }}
              >
                {actionLoading && confirmAction === "duyet" ? (
                  <CircularProgress size={16} sx={{ color: "#fff" }} />
                ) : (
                  "Duyệt khóa học"
                )}
              </Button>
            </Stack>
          )}
        </Stack>

        {showTuChoi && (
          <Box sx={{ mb: 2.5, flexShrink: 0 }}>
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
                width: 36,
                height: 36,
                borderRadius: "50%",
                bgcolor:
                  confirmAction === "tuChoi" ? "#FEF2F2" : "#F0FDF4",
                color:
                  confirmAction === "tuChoi" ? "#DC2626" : "#16A34A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {confirmAction === "tuChoi" ? (
                <HelpOutlineRoundedIcon sx={{ fontSize: 20 }} />
              ) : (
                <CheckCircleRoundedIcon sx={{ fontSize: 20 }} />
              )}
            </Box>
            {confirmAction === "tuChoi"
              ? "Xác nhận từ chối khóa học"
              : "Xác nhận duyệt khóa học"}
          </DialogTitle>
          <DialogContent sx={{ py: 1.5 }}>
            <Typography sx={{ color: "#64748B", fontSize: 14.5, lineHeight: 1.6 }}>
              {confirmAction === "tuChoi"
                ? "Bạn có chắc chắn muốn từ chối khóa học này không? Khóa học sẽ được chuyển về trạng thái Từ chối cùng với các ghi chú chỉnh sửa gửi cho giảng viên."
                : "Bạn có chắc chắn muốn phê duyệt khóa học này không? Khóa học sẽ được xuất bản công khai lên nền tảng EduVerse sau khi duyệt."}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
            <Button
              onClick={() => setConfirmAction(null)}
              disabled={actionLoading}
              sx={{
                textTransform: "none",
                color: "#64748B",
                fontWeight: 600,
                borderRadius: "8px",
                px: 2,
              }}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmDialogOk}
              disabled={actionLoading}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                borderRadius: "8px",
                px: 2.5,
                bgcolor:
                  confirmAction === "tuChoi" ? "#DC2626" : COLORS.primary,
                boxShadow: "none",
                "&:hover": {
                  bgcolor:
                    confirmAction === "tuChoi"
                      ? "#B91C1C"
                      : COLORS.primaryDark,
                  boxShadow: "none",
                },
              }}
            >
              {actionLoading ? (
                <CircularProgress size={16} sx={{ color: "#fff" }} />
              ) : confirmAction === "tuChoi" ? (
                "Xác nhận từ chối"
              ) : (
                "Xác nhận duyệt"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Main Content Viewport */}
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
          {/* Left Column: Course Header, Viewer & Description */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              pr: { md: 0.5 },
              "& > *": {
                flexShrink: 0,
              },
              ...scrollbarSx,
            }}
          >
            {detailLoading ? (
              <>
                <Skeleton variant="rounded" height={120} sx={{ borderRadius: "20px", flexShrink: 0 }} />
                <Skeleton variant="rounded" height={440} sx={{ borderRadius: "20px", flexShrink: 0 }} />
              </>
            ) : detail ? (
              <>
                <KhoiTenKhoaHoc detail={detail} />

                <Box sx={{ ...boxSx, p: { xs: 2, sm: 2.5 }, flexShrink: 0 }}>
                  <NoiDungViewer
                    selected={selectedContent}
                    onSaveLyDo={handleSaveLyDo}
                  />
                </Box>

                {hasDescription && (
                  <Box sx={{ ...boxSx, p: { xs: 2, sm: 2.5 }, flexShrink: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "#475569",
                        mb: 1.5,
                        fontFamily: FONTS.display,
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
                  flexShrink: 0,
                }}
              >
                <SchoolRoundedIcon
                  sx={{
                    fontSize: 48,
                    color: "#CBD5E1",
                    mb: 1.5,
                  }}
                />
                <Typography sx={{ color: "#64748B", fontWeight: 600 }}>
                  Không tìm thấy thông tin khóa học.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Right Column: Course Curriculum Sidebar */}
          <Box
            sx={{
              width: { xs: "100%", md: 390 },
              flexShrink: 0,
              ...boxSx,
              overflow: "hidden",
            }}
          >
            {detailLoading ? (
              <Stack spacing={1.5} sx={{ p: 2.5 }}>
                <Skeleton variant="rounded" height={50} sx={{ borderRadius: "12px" }} />
                <Skeleton variant="rounded" height={80} sx={{ borderRadius: "14px" }} />
                <Skeleton variant="rounded" height={80} sx={{ borderRadius: "14px" }} />
                <Skeleton variant="rounded" height={80} sx={{ borderRadius: "14px" }} />
              </Stack>
            ) : detail ? (
              <KiemDuyetSidebar
                detail={detail}
                selected={selectedContent}
                onSelectContent={handleSelectContent}
              />
            ) : (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography sx={{ color: "#94A3B8" }}>
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
