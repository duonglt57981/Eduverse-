"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  useCourseEdit,
  CourseEditProvider,
} from "./components/CourseEditContext";
import CourseEditLayout from "./components/CourseEditLayout";
import { tinhTongThoiLuongGiay, MucThieu } from "./components/courseEditCore";
import KhoaHocService from "@/src/services/KhoaHocService";
import { useState, useCallback, useEffect } from "react";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    thongTin,
    phans,
    trangThai,
    setTrangThai,
    lyDoTuChoi,
    loading,
    refreshData,
    idKhoaHoc,
    clearState,
    saveState,
  } = useCourseEdit();

  const [dangXuLy, setDangXuLy] = useState(false);
  const khoaHocService = new KhoaHocService();

  // Lưu state khi rời trang
  useEffect(() => {
    return () => {
      saveState();
    };
  }, [saveState]);

  const activeKey = pathname?.includes("/basics") ? "basics" : "curriculum";

  const tongGiay = tinhTongThoiLuongGiay(phans);
  const tongPhut = Math.floor(tongGiay / 60);
  const thoiLuongHienThi = tongPhut > 0 ? `${tongPhut} phút` : "Chưa có video";

  const basicsHoanThanh = Boolean(
    thongTin.tieuDe &&
    thongTin.tieuDe.trim().length >= 10 &&
    thongTin.moTa &&
    thongTin.moTa.length > 200 &&
    thongTin.capDo &&
    thongTin.hinhAnhKhoaHoc,
  );

  const curriculumHoanThanh = phans.some((p) =>
    (p.DanhSachBaiGiang ?? []).some((bg) => bg.uRLBaiGiang),
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
      ],
    },
  ];

  const handleNavigateSidebar = (key: string) => {
    saveState(); // Lưu trước khi chuyển tab
    router.push(`/instructor/manager-courses/${idKhoaHoc}/manager/${key}`);
  };

  const handleBack = () => {
    clearState(); // Xóa state khi quay lại danh sách
    router.push("/instructor/manager-courses");
  };

  const handleGuiPheDuyet = useCallback(async () => {
    setDangXuLy(true);
    try {
      const res = await khoaHocService.ChuyenTTChoDuyetBatch(idKhoaHoc);
      if (res.status !== false) {
        setTrangThai("ChoDuyet");
        await refreshData();
        alert("Đã gửi phê duyệt thành công!");
      } else {
        alert(res.message || "Gửi phê duyệt thất bại");
      }
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi khi gửi phê duyệt");
    } finally {
      setDangXuLy(false);
    }
  }, [idKhoaHoc, khoaHocService, setTrangThai, refreshData]);

  const handleDiChuyenDenTuValidate = useCallback(
    (diChuyenDen: MucThieu["diChuyenDen"]) => {
      saveState();
      if (diChuyenDen === "basics") {
        router.push(`/instructor/manager-courses/${idKhoaHoc}/manager/basics`);
      } else {
        router.push(
          `/instructor/manager-courses/${idKhoaHoc}/manager/curriculum`,
        );
      }
    },
    [idKhoaHoc, router, saveState],
  );

  return (
    <CourseEditLayout
      tenKhoaHoc={thongTin.tieuDe || "Chưa đặt tên"}
      trangThai={trangThai}
      thoiLuongDaTai={thoiLuongHienThi}
      thongTinKhoaHoc={thongTin}
      phans={phans}
      lyDoTuChoi={lyDoTuChoi}
      nhomSidebar={nhomSidebar}
      activeKey={activeKey}
      loading={loading || dangXuLy}
      onBack={handleBack}
      onNavigateSidebar={handleNavigateSidebar}
      onGuiPheDuyet={handleGuiPheDuyet}
      onDiChuyenDenTuValidate={handleDiChuyenDenTuValidate}
      onRefreshData={refreshData}
    >
      {children}
    </CourseEditLayout>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <CourseEditProvider>
      <LayoutContent>{children}</LayoutContent>
    </CourseEditProvider>
  );
}
