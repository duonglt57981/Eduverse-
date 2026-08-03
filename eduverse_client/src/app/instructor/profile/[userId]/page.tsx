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
        <Box
          sx={{
            minHeight: "100vh",
            bgcolor: "var(--ev-bg, #F7F5F2)",
            "& *": {
              fontFamily:
                "var(--font-primary, var(--ev-font-family, 'Be Vietnam Pro', sans-serif)) !important",
            },
          }}
        >
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
            <Box sx={{ bgcolor: "#0D0505", height: 220 }} />
          )}

          <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
                mb: 2,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: 20, md: 24 },
                  color: "var(--ev-text-primary, #1F2937)",
                  letterSpacing: "-0.01em",
                }}
              >
                {duLieu?.thongTinGiangVien
                  ? `Khóa học của ${trichXuatTenHienThi(duLieu.thongTinGiangVien)}`
                  : "Danh sách khóa học"}
              </Typography>

              {danhSachKhoaHoc.length > 0 && (
                <Box
                  sx={{
                    px: 1.8,
                    py: 0.5,
                    borderRadius: "10px",
                    bgcolor: "rgba(139,19,19,0.08)",
                    border: "1px solid rgba(139,19,19,0.15)",
                    color: "#8B1313",
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {(duLieu?.khoaHocs as any)?.totalCount ?? danhSachKhoaHoc.length} khóa học
                </Box>
              )}
            </Box>
            <Divider sx={{ mb: 4, borderColor: "var(--ev-divider, #ECE7E4)" }} />

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
