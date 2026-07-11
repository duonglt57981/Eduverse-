"use client";

import { ReactNode } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import KhoaHocService from "@/src/services/KhoaHocService";
import {
  CourseEditProvider,
  useCourseEdit,
} from "./components/CourseEditContext";
import { tinhTongThoiLuongGiay } from "./components/courseEditCore";
import CourseEditLayout, { NhomSidebar } from "./components/CourseEditLayout";

const DUONG_DAN_THEO_KEY: Record<string, string> = {
  curriculum: "curriculum",
  basics: "basics",
};

function KhungChinhSuaKhoaHoc({ children }: { children: ReactNode }) {
  const router = useRouter();
  const params = useParams<{ corsesId: string }>();
  const pathname = usePathname();
  const idKhoaHoc = params.corsesId;

  const {
    trangThai,
    setTrangThai,
    lyDoTuChoi,
    thongTin,
    phans,
    loading,
    refreshData,
  } = useCourseEdit();

  const tongGiay = tinhTongThoiLuongGiay(phans);
  const tongPhut = Math.floor(tongGiay / 60);
  const activeKey = pathname?.split("/").pop() || "curriculum";

  const diChuyenDenSegment = (segment: string) => {
    router.push(`/instructor/manager-courses/${idKhoaHoc}/manager/${segment}`);
  };

  const khoaHocService = new KhoaHocService();

  const guiPheDuyet = async () => {
    try {
      const result = await khoaHocService.ChuyenTTChoDuyetBatch([idKhoaHoc]);
      if (result.status !== false) {
        setTrangThai("ChoDuyet");
        await refreshData();
      }
    } catch (error) {
      console.error("Lỗi gửi phê duyệt:", error);
    }
  };

  const suaTiep = async () => {
    try {
      const result = await khoaHocService.ChuyenTTDangSuaBatch([idKhoaHoc]);
      if (result.status !== false) {
        setTrangThai("DangSua");
        await refreshData();
      }
    } catch (error) {
      console.error("Lỗi chuyển trạng thái:", error);
    }
  };

  const nhomSidebar: NhomSidebar[] = [
    {
      tieuDe: "Tạo nội dung của bạn",
      muc: [
        {
          key: "curriculum",
          nhan: "Chương trình giảng dạy",
          hoanThanh: tongGiay >= 30 * 60,
        },
      ],
    },
    {
      tieuDe: "Đăng tải khóa học của bạn",
      muc: [
        {
          key: "basics",
          nhan: "Trang đích của khóa học",
          hoanThanh: !!thongTin.hinhAnhKhoaHoc,
        },
      ],
    },
  ];

  return (
    <CourseEditLayout
      tenKhoaHoc={thongTin.tieuDe || "Khóa học chưa có tiêu đề"}
      trangThai={trangThai}
      thoiLuongDaTai={`Đã tải lên video có nội dung dài ${tongPhut} phút.`}
      thongTinKhoaHoc={thongTin}
      phans={phans}
      lyDoTuChoi={lyDoTuChoi}
      nhomSidebar={nhomSidebar}
      activeKey={activeKey}
      loading={loading}
      onBack={() => router.push("/instructor/manager-courses")}
      onNavigateSidebar={(key) =>
        diChuyenDenSegment(DUONG_DAN_THEO_KEY[key] ?? key)
      }
      onGuiPheDuyet={guiPheDuyet}
      onSuaTiep={suaTiep}
      onDiChuyenDenTuValidate={(diChuyenDen) =>
        diChuyenDenSegment(DUONG_DAN_THEO_KEY[diChuyenDen] ?? diChuyenDen)
      }
    >
      {children}
    </CourseEditLayout>
  );
}

export default function ManageCourseLayout({
  children,
}: {
  children: ReactNode;
}) {
  const params = useParams<{ corsesId: string }>();
  const coursesId = params.corsesId;

  if (!coursesId) {
    return <div>Loading...</div>;
  }

  return (
    <CourseEditProvider coursesId={coursesId}>
      <KhungChinhSuaKhoaHoc>{children}</KhungChinhSuaKhoaHoc>
    </CourseEditProvider>
  );
}
