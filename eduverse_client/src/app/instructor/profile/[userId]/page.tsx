// src/app/instructor/profile/[userId]/page.tsx
/* eslint-disable react/jsx-no-undef */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Alert,
  Divider,
  Chip,
} from "@mui/material";
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
import { BRAND, CSSVAR } from "@/src/theme/tokens";

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
        const [gvRes, publicListRes] = await Promise.allSettled([
          khoaHocService.GetListByGiangVien(userId, {
            pageIndex: trang,
            pageSize: PAGE_SIZE,
          }),
          khoaHocService.GetList({ pageSize: 100 }),
        ]);

        const res = gvRes.status === "fulfilled" ? gvRes.value : null;
        const publicRes =
          publicListRes.status === "fulfilled" ? publicListRes.value : null;

        const ketQua = trichXuatGiangVienKhoaHoc(res);

        if (!ketQua) {
          setLoi("Không thể tải thông tin giảng viên.");
          setDuLieu(null);
          return;
        }

        // Build a lookup map of public courses to enrich duration, lessons count & student count accurately
        const publicCourseItems =
          (publicRes?.data as any)?.items || (publicRes as any)?.items || [];
        const publicCourseMap = new Map<string, any>();
        if (Array.isArray(publicCourseItems)) {
          publicCourseItems.forEach((kh: any) => {
            if (kh.id) publicCourseMap.set(String(kh.id), kh);
          });
        }

        // Enrich items list
        const rawItems = (ketQua.khoaHocs as any)?.items || [];
        const instructorFullName = ketQua.thongTinGiangVien
          ? trichXuatTenHienThi(ketQua.thongTinGiangVien)
          : undefined;

        const enrichedItems = rawItems.map((kh: any) => {
          const matched = publicCourseMap.get(String(kh.id || ""));
          const gvName =
            (Array.isArray(kh.danhSachGiangVienHienThi) && kh.danhSachGiangVienHienThi.length > 0)
              ? kh.danhSachGiangVienHienThi.join(", ")
              : kh.tenGiangVien ||
                kh.giangVien ||
                kh.instructor ||
                (Array.isArray(matched?.danhSachGiangVienHienThi) && matched.danhSachGiangVienHienThi.length > 0
                  ? matched.danhSachGiangVienHienThi.join(", ")
                  : undefined) ||
                matched?.tenGiangVien ||
                matched?.giangVien ||
                instructorFullName ||
                "Giảng viên EduVerse";

          return {
            ...kh,
            tenGiangVien: gvName,
            giangVien: gvName,
            instructor: gvName,
            tongThoiLuong:
              kh.tongThoiLuong ||
              kh.thoiLuong ||
              kh.tongThoiGian ||
              matched?.tongThoiLuong ||
              matched?.thoiLuong ||
              0,
            tongBaiGiang:
              kh.tongBaiGiang ||
              kh.soBaiGiang ||
              kh.soLuongBaiGiang ||
              matched?.tongBaiGiang ||
              matched?.soBaiGiang ||
              0,
            soLuongHocVien:
              kh.soLuongHocVien ||
              kh.tongHocVien ||
              kh.soHocVien ||
              matched?.soLuongHocVien ||
              matched?.tongHocVien ||
              0,
            capDo: kh.capDo || matched?.capDo || "Tất cả cấp độ",
            gia: kh.gia ?? matched?.gia ?? 0,
            giaGoc: kh.giaGoc ?? matched?.giaGoc,
          };
        });

        if ((ketQua.khoaHocs as any)?.items) {
          (ketQua.khoaHocs as any).items = enrichedItems;
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
    <StudentDashboardShell>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: CSSVAR.bg,
          "& *": {
            fontFamily:
              "var(--font-primary, var(--ev-font-family, 'Be Vietnam Pro', sans-serif)) !important",
          },
        }}
      >
        <Container
          maxWidth="lg"
          sx={{ mt: 2, px: { xs: 2, md: 2.5 }, pt: 0, pb: { xs: 1, md: 2 } }}
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
            <Box
              sx={{ bgcolor: "#0D0505", height: 220, borderRadius: "24px" }}
            />
          )}
        </Container>

        <Container
          maxWidth="lg"
          sx={{ px: { xs: 2, md: 2.5 }, py: { xs: 3, md: 4 } }}
        >
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
                color: CSSVAR.textPrimary,
                letterSpacing: "-0.01em",
              }}
            >
              {duLieu?.thongTinGiangVien
                ? `Khóa học của ${trichXuatTenHienThi(duLieu.thongTinGiangVien)}`
                : "Danh sách khóa học"}
            </Typography>

            {danhSachKhoaHoc.length > 0 && (
              <Chip
                label={`${(duLieu?.khoaHocs as any)?.totalCount ?? danhSachKhoaHoc.length} khóa học`}
                size="medium"
                sx={{
                  bgcolor: "rgba(139,19,19,0.06)",
                  border: "1px solid rgba(139,19,19,0.18)",
                  color: BRAND.main,
                  fontWeight: 800,
                  fontSize: 13,
                  height: 32,
                  borderRadius: "10px",
                }}
              />
            )}
          </Box>
          <Divider sx={{ mb: 4, borderColor: CSSVAR.divider }} />

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
  );
}
