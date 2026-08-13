/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  useCourseEdit,
  CourseEditProvider,
} from "./components/CourseEditContext";
import CourseEditLayout from "./components/CourseEditLayout";
import {
  tinhTongThoiLuongGiay,
  MucThieu,
  demSoKyTu,
  demSoKyTuKeCaDauCach,
  SO_KY_TU_TIEU_DE_TOI_THIEU,
  SO_KY_TU_MO_TA_TOI_THIEU,
  SO_KY_TU_MO_TA_TOI_DA,
} from "./components/courseEditCore";
import KhoaHocService from "@/src/services/KhoaHocService";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  Snackbar,
} from "@mui/material";
import { MAU } from "./components/courseEditCore";
import { useSignalR } from "@/src/hook/useSignalR";
import { thongBaoService } from "@/src/services/ThongBaoService";
import type { ThongBao } from "@/src/types/thongbao";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    thongTin,
    phans,
    trangThai,
    setTrangThai,
    lyDoTuChoi,
    lichSuKiemDuyet,
    loading,
    refreshData,
    idKhoaHoc,
    clearState,
    saveState,
    isDirty,
    resetDirty,
  } = useCourseEdit();

  const [dangXuLy, setDangXuLy] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );
  const [showDirtyDialog, setShowDirtyDialog] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "success" });
  const handledNotificationIds = useRef(new Set<string>());

  const khoaHocService = useMemo(() => new KhoaHocService(), []);

  const handleCourseReviewNotification = useCallback(
    (notification: ThongBao) => {
      const type = (notification.loaiThongBao || notification.type || "")
        .replace(/\s+/g, "")
        .toLocaleLowerCase();
      const isReviewResult =
        type === "khoahoctuchoi" || type === "khoahocdaduyet";
      const isCurrentCourse =
        notification.itemId?.toLocaleLowerCase() ===
          idKhoaHoc.toLocaleLowerCase() ||
        notification.link
          ?.toLocaleLowerCase()
          .includes(idKhoaHoc.toLocaleLowerCase());

      if (
        !notification.id ||
        !isReviewResult ||
        !isCurrentCourse ||
        handledNotificationIds.current.has(notification.id)
      ) {
        return;
      }

      handledNotificationIds.current.add(notification.id);
      const rejected = type === "khoahoctuchoi";
      setToast({
        open: true,
        message:
          notification.noiDung ||
          notification.message ||
          (rejected
            ? "Khóa học đã bị từ chối. Vui lòng xem lý do và chỉnh sửa lại."
            : "Khóa học đã được phê duyệt."),
        severity: rejected ? "warning" : "success",
      });
      void refreshData();
    },
    [idKhoaHoc, refreshData],
  );

  useSignalR("ReceiveNotification", handleCourseReviewNotification);

  useEffect(() => {
    let active = true;

    const loadMissedReviewNotification = async () => {
      try {
        const response = await thongBaoService.getUnreadNotifications();
        if (!active || !response?.status || !Array.isArray(response.data))
          return;

        response.data.forEach(handleCourseReviewNotification);
      } catch (error) {
        console.error("Không thể tải thông báo kiểm duyệt khóa học:", error);
      }
    };

    void loadMissedReviewNotification();
    const intervalId = window.setInterval(loadMissedReviewNotification, 30_000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadMissedReviewNotification();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleCourseReviewNotification]);

  useEffect(() => {
    return () => {
      saveState();
    };
  }, [saveState]);

  const activeKey = pathname?.includes("/basics")
    ? "basics"
    : pathname?.includes("/instructors")
      ? "instructors"
      : pathname?.includes("/qna")
        ? "qna"
        : pathname?.includes("/performance")
          ? "performance"
          : pathname?.includes("/reviews")
            ? "reviews"
            : "curriculum";

  const tongGiay = tinhTongThoiLuongGiay(phans);
  const tongPhut = Math.floor(tongGiay / 60);
  const thoiLuongHienThi = tongPhut > 0 ? `${tongPhut} phút` : "Chưa có video";

  const soKyTuMoTaHienTai = demSoKyTuKeCaDauCach(thongTin.moTa || "");

  const basicsHoanThanh = Boolean(
    thongTin.tieuDe &&
    demSoKyTu(thongTin.tieuDe) >= SO_KY_TU_TIEU_DE_TOI_THIEU &&
    thongTin.moTa &&
    demSoKyTu(thongTin.moTa) >= SO_KY_TU_MO_TA_TOI_THIEU &&
    soKyTuMoTaHienTai <= SO_KY_TU_MO_TA_TOI_DA &&
    thongTin.capDo &&
    thongTin.hinhAnhKhoaHoc,
  );

  const curriculumHoanThanh = phans.some((p) =>
    (p.DanhSachBaiGiang ?? []).some((bg) => bg.urlBaiGiang),
  );

  const nhomSidebar = [
    {
      tieuDe: "Khóa học",
      muc: [
        {
          key: "basics",
          nhan: "Thông tin cơ bản",
          hoanThanh: basicsHoanThanh,
        },
        {
          key: "curriculum",
          nhan: "Chương trình giảng dạy",
          hoanThanh: curriculumHoanThanh,
        },
        {
          key: "instructors", // ← thêm mới
          nhan: "Quản lý giảng viên",
          hoanThanh: false, // không cần check hoàn thành
        },
        {
          key: "qna",
          nhan: "Hỏi đáp",
          hoanThanh: false,
        },
        {
          key: "performance",
          nhan: "Thống kê",
          hoanThanh: false,
        },
        {
          key: "reviews",
          nhan: "Đánh giá",
          hoanThanh: false,
        },
      ],
    },
  ];

  const performNavigation = useCallback(
    (key: string) => {
      // LƯU DỮ LIỆU TRƯỚC KHI CHUYỂN TRANG
      saveState();
      router.push(`/instructor/manager-courses/${idKhoaHoc}/manager/${key}`);
    },
    [idKhoaHoc, router, saveState],
  );

  const performBack = useCallback(() => {
    // XÓA STATE KHI QUAY LẠI DANH SÁCH
    clearState();
    resetDirty();
    router.push("/instructor/manager-courses");
  }, [clearState, resetDirty, router]);

  const performDiChuyenDen = useCallback(
    (diChuyenDen: MucThieu["diChuyenDen"]) => {
      saveState();
      if (diChuyenDen === "basics") {
        router.push(`/instructor/manager-courses/${idKhoaHoc}/manager/basics`);
      } else if (diChuyenDen === "curriculum") {
        router.push(
          `/instructor/manager-courses/${idKhoaHoc}/manager/curriculum`,
        );
      } else if (diChuyenDen === "qna") {
        router.push(`/instructor/manager-courses/${idKhoaHoc}/manager/qna`);
      } else if (diChuyenDen === "performance") {
        router.push(
          `/instructor/manager-courses/${idKhoaHoc}/manager/performance`,
        );
      } else if (diChuyenDen === "reviews") {
        router.push(`/instructor/manager-courses/${idKhoaHoc}/manager/reviews`);
      }
      // instructors không có trong validate flow, chỉ navigate bình thường
    },
    [idKhoaHoc, router, saveState],
  );

  const handleNavigateSidebar = useCallback(
    (key: string) => {
      if (isDirty && trangThai === "DangSua") {
        setPendingNavigation(key);
        setShowDirtyDialog(true);
      } else {
        performNavigation(key);
      }
    },
    [isDirty, trangThai, performNavigation],
  );

  const handleBack = useCallback(() => {
    if (isDirty && trangThai === "DangSua") {
      setPendingNavigation("back");
      setShowDirtyDialog(true);
    } else {
      performBack();
    }
  }, [isDirty, trangThai, performBack]);

  const handleDiChuyenDenTuValidate = useCallback(
    (diChuyenDen: MucThieu["diChuyenDen"]) => {
      if (isDirty && trangThai === "DangSua") {
        setPendingNavigation(diChuyenDen);
        setShowDirtyDialog(true);
      } else {
        performDiChuyenDen(diChuyenDen);
      }
    },
    [isDirty, trangThai, performDiChuyenDen],
  );

  const handleConfirmNavigation = useCallback(() => {
    setShowDirtyDialog(false);
    if (pendingNavigation) {
      // KHI NGƯỜI DÙNG XÁC NHẬN RỜI ĐI, KHÔNG LƯU MÀ XÓA DỮ LIỆU ĐANG SỬA
      // resetDirty() sẽ xóa trạng thái dirty
      resetDirty();

      if (pendingNavigation === "back") {
        performBack();
      } else if (
        pendingNavigation === "basics" ||
        pendingNavigation === "curriculum"
      ) {
        performDiChuyenDen(pendingNavigation as MucThieu["diChuyenDen"]);
      } else {
        performNavigation(pendingNavigation);
      }
    }
    setPendingNavigation(null);
  }, [
    pendingNavigation,
    resetDirty,
    performBack,
    performDiChuyenDen,
    performNavigation,
  ]);

  const handleCancelNavigation = useCallback(() => {
    setShowDirtyDialog(false);
    setPendingNavigation(null);
  }, []);

  const handleGuiPheDuyet = useCallback(async () => {
    // VALIDATE: Cần ít nhất 5 bài giảng
    const totalBaiGiang = phans.reduce((total, phan) => {
      return total + (phan.DanhSachBaiGiang?.length || 0);
    }, 0);

    if (totalBaiGiang < 5) {
      setToast({
        open: true,
        message: `Cần ít nhất 5 bài giảng để gửi duyệt. Hiện tại: ${totalBaiGiang} bài giảng.`,
        severity: "error",
      });
      return;
    }

    setDangXuLy(true);
    try {
      const res = await khoaHocService.ChuyenTTChoDuyetBatch(idKhoaHoc);

      // KIỂM TRA ĐÚNG CÁCH: res.status === true HOẶC res.success === true
      if (res?.status === true) {
        setTrangThai("ChoDuyet");
        await refreshData();
        resetDirty();
        setToast({
          open: true,
          message: "Đã gửi phê duyệt thành công!",
          severity: "success",
        });
      } else {
        setToast({
          open: true,
          message: res?.message || "Gửi phê duyệt thất bại",
          severity: "error",
        });
      }
    } catch (error: any) {
      console.error(error);
      setToast({
        open: true,
        message: error?.message || "Đã xảy ra lỗi khi gửi phê duyệt",
        severity: "error",
      });
    } finally {
      setDangXuLy(false);
    }
  }, [idKhoaHoc, khoaHocService, setTrangThai, refreshData, resetDirty, phans]);

  const dialogContent = useMemo(() => {
    if (pendingNavigation === "back") {
      return {
        title: "Bạn có thay đổi chưa lưu",
        message:
          "Bạn có thay đổi chưa được lưu trên trang này. Bạn có muốn rời khỏi trang và mất những thay đổi này không?",
        confirmText: "Rời khỏi",
        cancelText: "Ở lại",
      };
    }
    return {
      title: "Bạn có thay đổi chưa lưu",
      message:
        "Bạn có thay đổi chưa được lưu trên trang này. Bạn có muốn chuyển sang trang khác và mất những thay đổi này không?",
      confirmText: "Chuyển trang",
      cancelText: "Ở lại",
    };
  }, [pendingNavigation]);

  return (
    <>
      <CourseEditLayout
        tenKhoaHoc={thongTin.tieuDe || "Chưa đặt tên"}
        trangThai={trangThai}
        thoiLuongDaTai={thoiLuongHienThi}
        thongTinKhoaHoc={thongTin}
        phans={phans}
        lyDoTuChoi={lyDoTuChoi}
        lichSuKiemDuyet={lichSuKiemDuyet}
        nhomSidebar={nhomSidebar}
        activeKey={activeKey}
        loading={loading || dangXuLy}
        idKhoaHoc={idKhoaHoc}
        onBack={handleBack}
        onNavigateSidebar={handleNavigateSidebar}
        onGuiPheDuyet={handleGuiPheDuyet}
        onDiChuyenDenTuValidate={handleDiChuyenDenTuValidate}
        onRefreshData={refreshData}
      >
        {children}
      </CourseEditLayout>

      <Dialog
        open={showDirtyDialog}
        onClose={handleCancelNavigation}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              p: 1,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: MAU.chuDen,
            fontSize: 18,
          }}
        >
          {dialogContent.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: MAU.chuXam, fontSize: 14.5 }}>
            {dialogContent.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={handleCancelNavigation}
            sx={{
              textTransform: "none",
              color: MAU.chuXam,
              fontWeight: 600,
              "&:hover": {
                bgcolor: "var(--ev-paper-alt, #F5F6F8)",
              },
            }}
          >
            {dialogContent.cancelText}
          </Button>
          <Button
            onClick={handleConfirmNavigation}
            variant="contained"
            sx={{
              bgcolor: MAU.chinh,
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              "&:hover": {
                bgcolor: MAU.chinhDam,
              },
            }}
          >
            {dialogContent.confirmText}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          sx={{ width: "100%", borderRadius: "12px" }}
          onClose={() => setToast({ ...toast, open: false })}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <CourseEditProvider>
      <LayoutContent>{children}</LayoutContent>
    </CourseEditProvider>
  );
}
