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

const kiemDuyetService = new KiemDuyetService();

type ConfirmAction = "duyet" | "tuChoi" | null;

// Style thanh cuộn mảnh, đồng bộ theme - dùng chung cho cả 2 cột
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

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchDetail = useCallback(async () => {
    if (!idKhoaHoc) {
      setDetailLoading(false);
      return;
    }
    setDetailLoading(true);
    try {
      const res = await kiemDuyetService.GetDetailKiemDuyetKhoaHoc(idKhoaHoc);
      const normalizedData = normalizeDetailResponse(res);
      setDetail(normalizedData);
    } catch (error) {
      console.error("Lỗi tải chi tiết:", error);
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, [idKhoaHoc]);

  // Fetch khi component mount hoặc id thay đổi
  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleSelectContent = (
    loai: "baiGiang" | "taiLieu" | "baiKiemTra",
    item: any,
  ) => {
    setSelectedContent({ loai, item });
  };

  // ── Hàm quay về trang danh sách ──
  const goBackToList = useCallback(() => {
    router.push("/admin/approve-courses");
  }, [router]);

  // ── Hàm duyệt khóa học ──
  const handleDuyet = async () => {
    if (!detail) return;
    setActionLoading(true);
    try {
      const res: ApiResponse<any> = await kiemDuyetService.KiemDuyetKhoaHoc({
        idKhoaHoc: detail.idKhoaHoc,
        trangThaiPheDuyet: "DaDuyet",
      });

      console.log("Kết quả duyệt khóa học:", res); // TODO: xoá sau khi debug xong
      const isSuccess = res?.status === true;

      if (isSuccess) {
        setSnackbar({
          open: true,
          message: "✅ Duyệt khóa học thành công!",
          severity: "success",
        });
        setTimeout(() => {
          goBackToList();
        }, 1500);
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

  // ── Hàm từ chối khóa học ──
  const handleTuChoi = async () => {
    if (!detail) return;
    setActionLoading(true);
    try {
      const res: ApiResponse<any> = await kiemDuyetService.KiemDuyetKhoaHoc({
        idKhoaHoc: detail.idKhoaHoc,
        trangThaiPheDuyet: "TuChoi",
        lyDo: ghiChu,
      });

      console.log("Kết quả từ chối khóa học:", res); // TODO: xoá sau khi debug xong

      const isSuccess = res?.status === true;

      if (isSuccess) {
        setSnackbar({
          open: true,
          message: res?.message || "✅ Từ chối khóa học thành công!",
          severity: "success",
        });
        setTimeout(() => {
          goBackToList();
        }, 1500);
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

  // ── Khóa học đã được duyệt: hiển thị nguyên trang thông báo, không cho
  // kiểm duyệt lại nữa. Bấm quay lại sẽ điều hướng về danh sách kiểm duyệt. ──
  if (!detailLoading && detail && isDaDuyet) {
    return (
      <AuthGuard allowedRoles={["Admin"]}>
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

  return (
    <AuthGuard allowedRoles={["Admin"]}>
      {/* Snackbar thông báo */}
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
          p: 3,
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center", mb: 3, flexShrink: 0 }}
        >
          <IconButton
            onClick={goBackToList}
            sx={{
              border: `1px solid ${COLORS.line}`,
              borderRadius: 1.5,
              color: COLORS.ink,
            }}
            size="small"
          >
            <ArrowBackRoundedIcon fontSize="small" />
          </IconButton>
          <Typography
            sx={{
              fontSize: 28,
              fontWeight: 700,
              fontFamily: FONTS.display,
              color: COLORS.ink,
              flex: 1,
            }}
          >
            Kiểm duyệt khóa học
          </Typography>

          {!detailLoading && detail && isChoDuyet && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                disabled={actionLoading}
                onClick={() => setShowTuChoi(true)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderColor: COLORS.danger,
                  color: COLORS.danger,
                  "&:hover": {
                    borderColor: "#8F2E24",
                    bgcolor: COLORS.dangerSoft,
                  },
                }}
              >
                Từ chối
              </Button>
              <Button
                variant="contained"
                size="small"
                disabled={actionLoading}
                onClick={handleDuyetClick}
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
                {actionLoading && confirmAction === "duyet" ? (
                  <CircularProgress size={16} sx={{ color: "#fff" }} />
                ) : (
                  "Duyệt khóa học"
                )}
              </Button>
            </Stack>
          )}
        </Stack>

        {/* Form từ chối */}
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

        {/* Dialog xác nhận */}
        <Dialog
          open={confirmAction !== null}
          onClose={() => {
            if (!actionLoading) setConfirmAction(null);
          }}
          maxWidth="xs"
          fullWidth
          slotProps={{
            paper: { sx: { borderRadius: 2 } },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontFamily: FONTS.display,
              fontWeight: 700,
              color: COLORS.ink,
            }}
          >
            <HelpOutlineRoundedIcon
              sx={{
                color:
                  confirmAction === "tuChoi" ? COLORS.danger : COLORS.primary,
              }}
            />
            {confirmAction === "tuChoi"
              ? "Xác nhận từ chối khóa học"
              : "Xác nhận duyệt khóa học"}
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: COLORS.inkSoft }}>
              {confirmAction === "tuChoi"
                ? "Bạn có chắc chắn muốn từ chối khóa học này không?"
                : "Bạn có chắc chắn muốn duyệt khóa học này không?"}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              onClick={() => setConfirmAction(null)}
              disabled={actionLoading}
              sx={{ textTransform: "none", color: COLORS.inkSoft }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmDialogOk}
              disabled={actionLoading}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                bgcolor:
                  confirmAction === "tuChoi" ? COLORS.danger : COLORS.primary,
                boxShadow: "none",
                "&:hover": {
                  bgcolor:
                    confirmAction === "tuChoi" ? "#8F2E24" : COLORS.primaryDark,
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

        {/* Nội dung chính */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            overflow: { xs: "auto", md: "hidden" },
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
              pr: { md: 1 },
              ...scrollbarSx,
            }}
          >
            {detailLoading ? (
              <>
                <Skeleton variant="rounded" height={110} />
                <Skeleton variant="rounded" height={420} />
              </>
            ) : detail ? (
              <>
                <KhoiTenKhoaHoc detail={detail} />

                <Box sx={{ ...boxSx, p: 2.5 }}>
                  <NoiDungViewer selected={selectedContent} />
                </Box>

                {hasDescription && (
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
                    <MoTaKhoaHoc html={detail.moTa} />
                  </Box>
                )}
              </>
            ) : (
              <Box
                sx={{
                  ...boxSx,
                  minHeight: 200,
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
                  Không tìm thấy khóa học.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Cột phải: Sidebar */}
          <Box
            sx={{
              width: { xs: "100%", md: 380 },
              flexShrink: 0,
              pr: { md: 1 },
              ...boxSx,
              ...scrollbarSx,
            }}
          >
            {detailLoading ? (
              <Stack spacing={1.5} sx={{ p: 2 }}>
                <Skeleton variant="rounded" height={90} />
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={56} />
              </Stack>
            ) : detail ? (
              <KiemDuyetSidebar
                detail={detail}
                selected={selectedContent}
                onSelectContent={handleSelectContent}
              />
            ) : (
              <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography sx={{ color: COLORS.inkSoft }}>
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
