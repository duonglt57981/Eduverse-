"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  useCourseEdit,
  CourseEditProvider,
} from "./components/CourseEditContext";
import CourseEditLayout from "./components/CourseEditLayout";
import { tinhTongThoiLuongGiay, MucThieu } from "./components/courseEditCore";
import KhoaHocService from "@/src/services/KhoaHocService";
import { useState } from "react";

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
  } = useCourseEdit();

  const [dangXuLy, setDangXuLy] = useState(false);
  const khoaHocService = new KhoaHocService();

  // Xác định tab đang active (dựa trên đường dẫn)
  const activeKey = pathname?.includes("/basics") ? "basics" : "curriculum";

  // Tính thời lượng
  const tongGiay = tinhTongThoiLuongGiay(phans);
  const tongPhut = Math.floor(tongGiay / 60);
  const thoiLuongHienThi = tongPhut > 0 ? `${tongPhut} phút` : "Chưa có video";

  // Xác định trạng thái hoàn thành cho sidebar
  const basicsHoanThanh = Boolean(
    thongTin.tieuDe &&
    thongTin.tieuDe.trim().length >= 10 &&
    thongTin.moTa &&
    thongTin.moTa.length > 200 &&
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
      ],
    },
  ];

  // Điều hướng sidebar – sửa đường dẫn
  const handleNavigateSidebar = (key: string) => {
    router.push(`/instructor/manager-courses/${idKhoaHoc}/manager/${key}`);
  };

  // Quay lại danh sách khóa học
  const handleBack = () => {
    router.push("/instructor/manager-courses");
  };

  // Gửi phê duyệt
  const handleGuiPheDuyet = async () => {
    setDangXuLy(true);
    try {
      const res = await khoaHocService.ChuyenTTChoDuyetBatch(idKhoaHoc);
      if (res.status !== false) {
        setTrangThai("ChoDuyet");
        await refreshData();
      } else {
        alert(res.message || "Gửi phê duyệt thất bại");
      }
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi");
    } finally {
      setDangXuLy(false);
    }
  };

  // Sửa tiếp
  const handleSuaTiep = async () => {
    setDangXuLy(true);
    try {
      const res = await khoaHocService.ChuyenTTDangSuaBatch(idKhoaHoc);
      if (res.status !== false) {
        setTrangThai("DangSua");
        await refreshData();
      } else {
        alert(res.message || "Không thể chuyển về trạng thái sửa");
      }
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi");
    } finally {
      setDangXuLy(false);
    }
  };

  // Xử lý khi validate thiếu
  const handleDiChuyenDenTuValidate = (
    diChuyenDen: MucThieu["diChuyenDen"],
  ) => {
    if (diChuyenDen === "basics") {
      router.push(`/instructor/manager-courses/${idKhoaHoc}/manager/basics`);
    } else {
      router.push(
        `/instructor/manager-courses/${idKhoaHoc}/manager/curriculum`,
      );
    }
  };

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
      onSuaTiep={handleSuaTiep}
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
