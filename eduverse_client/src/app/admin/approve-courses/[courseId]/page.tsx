/* eslint-disable @typescript-eslint/no-explicit-any */
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
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";

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
import KiemDuyetSidebar from "../[courseId]/components/KiemDuyetSidebar";

const kiemDuyetService = new KiemDuyetService();

type ConfirmAction = "duyet" | "tuChoi" | null;

// Style thanh cuộn mảnh, đồng bộ theme - dùng chung cho cả 2 cột
// minHeight: 0 là bắt buộc để phần tử flex-child có overflow:auto co đúng
// theo chiều cao còn lại thay vì tràn ra ngoài container cha.
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

  const fetchDetail = useCallback(async () => {
    if (!idKhoaHoc) return;
    setDetailLoading(true);
    try {
      const res = await kiemDuyetService.GetDetailKiemDuyetKhoaHoc(idKhoaHoc);
      setDetail(normalizeDetailResponse(res));
    } catch (error) {
      console.error("Lỗi tải chi tiết:", error);
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, [idKhoaHoc]);

  useEffect(() => {
    // Fetch có chủ đích khi mount / khi idKhoaHoc thay đổi.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDetail();
  }, [fetchDetail]);

  const handleSelectContent = (
    loai: "baiGiang" | "taiLieu" | "baiKiemTra",
    item: any,
  ) => {
    setSelectedContent({ loai, item });
  };

  const handleDuyet = async () => {
    if (!detail) return;
    setActionLoading(true);
    try {
      const res = await kiemDuyetService.KiemDuyetKhoaHoc({
        idKhoaHoc: detail.idKhoaHoc,
        trangThaiPheDuyet: "DaDuyet",
      });
      if (res?.status) await fetchDetail();
    } catch (error) {
      console.error("Lỗi duyệt:", error);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleTuChoi = async () => {
    if (!detail) return;
    setActionLoading(true);
    try {
      const res = await kiemDuyetService.KiemDuyetKhoaHoc({
        idKhoaHoc: detail.idKhoaHoc,
        trangThaiPheDuyet: "TuChoi",
        lyDo: ghiChu,
      });
      if (res?.status) {
        await fetchDetail();
        setShowTuChoi(false);
        setGhiChu("");
      }
    } catch (error) {
      console.error("Lỗi từ chối:", error);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
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

  // Chỉ hiển thị mô tả nếu có nội dung
  const hasDescription = detail?.moTa && detail.moTa.trim().length > 0;

  return (
    <AuthGuard allowedRoles={["Admin"]}>
      {/*
        Toàn bộ trang chiếm đúng 100dvh và tự chia làm 2 phần:
        - Phần header/form (chiều cao tự nhiên, co giãn theo nội dung)
        - Phần nội dung 2 cột (flex: 1, chiếm hết phần còn lại, minHeight: 0
          để không tràn ra ngoài bất kể header cao bao nhiêu)
        Nhờ vậy không cần đoán số px cố định (vd "220px") -> hết bug
        khoảng trắng che dữ liệu khi header đổi chiều cao (mở form Từ chối,
        wrap dòng trên mobile, v.v.)
      */}
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
            onClick={() => router.push("/admin/approve-courses")}
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

        {/* Nội dung chính: hai cột, mỗi cột có thanh cuộn độc lập.
            flex: 1 + minHeight: 0 => chiếm hết phần còn lại của viewport,
            tự động co giãn theo chiều cao thật của header phía trên,
            không còn phụ thuộc vào số px cố định. */}
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
            ) : (
              <KiemDuyetSidebar
                detail={detail}
                selected={selectedContent}
                onSelectContent={handleSelectContent}
              />
            )}
          </Box>
        </Box>
      </Box>
    </AuthGuard>
  );
}
