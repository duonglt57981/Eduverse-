// src/app/instructor/profile/[userId]/components/Instructorherosection.tsx
"use client";

import React from "react";
import {
  Box,
  Container,
  Avatar,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import { formatSoLuong, trichXuatTenHienThi } from "./types/Constants";
import { AppUser, KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import SafeHTML from "./common/SafeHTML";

interface InstructorHeroSectionProps {
  giangVien: AppUser;
  danhSachKhoaHoc: KhoaHocType[];
  tongSoKhoaHoc: number;
  tongHocVienDangHoc?: number;
  tongHocVienDangKy?: number;
}

const ThongKeItem = ({
  icon,
  giaTri,
  nhan,
}: {
  icon: React.ReactNode;
  giaTri: string;
  nhan: string;
}) => (
  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
    {icon}
    <Typography variant="body2" sx={{ color: "grey.200" }}>
      <Box component="span" sx={{ fontWeight: 700, color: "common.white" }}>
        {giaTri}
      </Box>{" "}
      {nhan}
    </Typography>
  </Stack>
);

export default function InstructorHeroSection({
  giangVien,
  danhSachKhoaHoc,
  tongSoKhoaHoc,
  tongHocVienDangHoc,
  tongHocVienDangKy,
}: InstructorHeroSectionProps) {
  const tenHienThi = trichXuatTenHienThi(giangVien);

  return (
    <Box
      sx={{
        bgcolor: "#1c1d1f",
        color: "common.white",
        pt: { xs: 5, md: 7 },
        pb: { xs: 5, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 3, md: 5 }}
          sx={{
            alignItems: { xs: "flex-start", md: "center" },
          }}
        >
          <Avatar
            src={giangVien.anhDaiDien}
            alt={tenHienThi}
            sx={{
              width: { xs: 96, md: 140 },
              height: { xs: 96, md: 140 },
              fontSize: 48,
              border: "3px solid",
              borderColor: "grey.700",
            }}
          >
            {tenHienThi.charAt(0)}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mb: 0.5, wordBreak: "break-word" }}
            >
              {tenHienThi}
            </Typography>

            {giangVien.chucVu && (
              <Typography variant="subtitle1" sx={{ color: "grey.300", mb: 2 }}>
                {giangVien.chucVu}
              </Typography>
            )}

            {/* Hiển thị tiểu sử với expand/collapse */}
            {(giangVien.tieuSu || giangVien.gioiThieu) && (
              <SafeHTML
                html={giangVien.tieuSu || giangVien.gioiThieu || ""}
                maxLength={200}
                sx={{
                  fontSize: "0.95rem",
                  lineHeight: 1.8,
                  maxWidth: 640,
                  color: "grey.300",
                }}
              />
            )}

            <Stack
              direction="row"
              spacing={{ xs: 2, sm: 4 }}
              sx={{
                flexWrap: "wrap",
                gap: 1,
                mt: 2,
              }}
            >
              <ThongKeItem
                icon={
                  <GroupsOutlinedIcon
                    fontSize="small"
                    sx={{ color: "grey.300" }}
                  />
                }
                giaTri={formatSoLuong(tongHocVienDangHoc)}
                nhan="học viên đang học"
              />
              <ThongKeItem
                icon={
                  <HowToRegOutlinedIcon
                    fontSize="small"
                    sx={{ color: "grey.300" }}
                  />
                }
                giaTri={formatSoLuong(tongHocVienDangKy)}
                nhan="học viên đã đăng ký"
              />
            </Stack>
          </Box>
        </Stack>
      </Container>
      <Divider sx={{ borderColor: "grey.800", mt: { xs: 4, md: 5 } }} />
    </Box>
  );
}
