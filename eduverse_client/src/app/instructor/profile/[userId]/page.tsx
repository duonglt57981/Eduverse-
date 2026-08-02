// src/app/instructor/profile/[userId]/page.tsx
/* eslint-disable react/jsx-no-undef */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Box, Container, Typography, Alert, Divider } from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import InstructorCourseList from "./components/Instructorcourselist";
import InstructorHeroSection from "./components/Instructorherosection";
import {
  trichXuatGiangVienKhoaHoc,
  trichXuatTenHienThi,
} from "./components/types/Constants";
import KhoaHocService from "@/src/services/KhoaHocService";
import { GiangVienKhoaHocDto, KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import StudentDashboardShell from "@/src/components/dashboard/StudentDashboardShell";
import AuthGuard from "@/src/components/AuthGuard";

const PAGE_SIZE = 12;

export default function InstructorProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string;

  const [khoaHocService] = useState(() => new KhoaHocService());

  const [duLieu, setDuLieu] = useState<GiangVienKhoaHocDto | null>(null);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [tongSoTrang, setTongSoTrang] = useState(1);

  const taiDuLieu = useCallback(
    async (trang: number) => {
      if (!userId) {
        setLoi("Không tìm thấy ID giảng viên.");
        setDangTai(false);
        return;
      }

      setDangTai(true);
      setLoi(null);
      try {
        const res = await khoaHocService.GetListByGiangVien(userId, {
          pageIndex: trang,
          pageSize: PAGE_SIZE,
        });
        const ketQua = trichXuatGiangVienKhoaHoc(res);

        if (!ketQua) {
          setLoi("Không thể tải thông tin giảng viên.");
          setDuLieu(null);
          return;
        }

        setDuLieu(ketQua);

        const paged: any = ketQua.khoaHocs;
        const tong =
          paged?.totalPage ??
          paged?.TotalPage ??
          paged?.totalPages ??
          paged?.TotalPages ??
          (paged?.totalCount && paged?.pageSize
            ? Math.ceil(paged.totalCount / paged.pageSize)
            : 1);
        setTongSoTrang(tong || 1);
      } catch (error) {
        console.error("Error loading instructor profile:", error);
        setLoi("Đã có lỗi xảy ra khi tải hồ sơ giảng viên. Vui lòng thử lại.");
      } finally {
        setDangTai(false);
      }
    },
    [khoaHocService, userId],
  );

  useEffect(() => {
    taiDuLieu(pageIndex);
  }, [pageIndex, userId, taiDuLieu]);

  const handleDoiTrang = (trang: number) => {
    setPageIndex(trang);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChonKhoaHoc = (khoaHoc: KhoaHocType) => {
    router.push(`/student/enroll-courses/${khoaHoc.id}`);
  };

  const danhSachKhoaHoc: KhoaHocType[] = (duLieu?.khoaHocs as any)?.items ?? [];

  if (dangTai) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography>Đang tải...</Typography>
      </Container>
    );
  }

  if (loi) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">{loi}</Alert>
      </Container>
    );
  }

  if (!userId) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="warning">Không tìm thấy ID giảng viên.</Alert>
      </Container>
    );
  }

  return (
    <AuthGuard allowedRoles={["HocVien", "GiaoVien", "Admin"]}>
      <StudentDashboardShell>
        <Box>
          {duLieu?.thongTinGiangVien ? (
            <InstructorHeroSection
              giangVien={duLieu.thongTinGiangVien}
              danhSachKhoaHoc={danhSachKhoaHoc}
              tongSoKhoaHoc={
                (duLieu.khoaHocs as any)?.totalCount ?? danhSachKhoaHoc.length
              }
              tongHocVienDangHoc={(duLieu as any)?.tongHocVienDangHoc}
              tongHocVienDangKy={(duLieu as any)?.tongHocVienDangKy}
            />
          ) : (
            <Box sx={{ bgcolor: "#1c1d1f", height: 220 }} />
          )}

          <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              {duLieu?.thongTinGiangVien
                ? `Khóa học của ${trichXuatTenHienThi(duLieu.thongTinGiangVien)}`
                : "Khóa học"}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <InstructorCourseList
              danhSachKhoaHoc={danhSachKhoaHoc}
              dangTai={dangTai}
              pageIndex={pageIndex}
              tongSoTrang={tongSoTrang}
              onDoiTrang={handleDoiTrang}
              onChonKhoaHoc={handleChonKhoaHoc}
            />
          </Container>
        </Box>
      </StudentDashboardShell>
    </AuthGuard>
  );
}
