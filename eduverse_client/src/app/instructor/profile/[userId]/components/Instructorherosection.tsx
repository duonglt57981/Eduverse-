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
        bgcolor: "#0A0505",
        background: "linear-gradient(135deg, #1C0A0A 0%, #0B0505 100%)",
        color: "common.white",
        pt: { xs: 6, md: 8 },
        pb: { xs: 6, md: 7 },
        position: "relative",
        overflow: "hidden",
        "& *": {
          fontFamily: "var(--ev-font-family, 'Be Vietnam Pro', sans-serif) !important",
        },
      }}
    >
      {/* Background glow accent */}
      <Box
        sx={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,19,19,0.18) 0%, rgba(139,19,19,0) 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 4, md: 5 }}
          sx={{
            alignItems: { xs: "center", md: "center" },
            textAlign: { xs: "center", md: "left" },
          }}
        >
          <Avatar
            src={giangVien.anhDaiDien}
            alt={tenHienThi}
            sx={{
              width: { xs: 110, md: 145 },
              height: { xs: 110, md: 145 },
              fontSize: 48,
              border: "4px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 12px 36px rgba(0, 0, 0, 0.3)",
              bgcolor: "rgba(139, 19, 19, 0.1)",
              color: "#FFFFFF",
            }}
          >
            {tenHienThi.charAt(0)}
          </Avatar>

          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: { xs: "center", md: "flex-start" } }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                fontSize: { xs: "1.8rem", md: "2.4rem" },
                mb: 0.8,
                wordBreak: "break-word",
                background: "linear-gradient(120deg, #FFFFFF 0%, #F3F4F6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {tenHienThi}
            </Typography>

            {giangVien.chucVu && (
              <Typography
                variant="subtitle1"
                sx={{
                  color: "rgba(255, 255, 255, 0.85)",
                  fontWeight: 600,
                  fontSize: "1.05rem",
                  mb: 2,
                }}
              >
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
                  maxWidth: 680,
                  color: "rgba(255, 255, 255, 0.7)",
                }}
              />
            )}

            <Stack
              direction="row"
              spacing={2.5}
              sx={{
                flexWrap: "wrap",
                justifyContent: { xs: "center", md: "flex-start" },
                gap: 1.5,
                mt: 3.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  px: 2.2,
                  py: 1.1,
                  borderRadius: "12px",
                  bgcolor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                <GroupsOutlinedIcon sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 20 }} />
                <Typography sx={{ fontSize: 13, color: "rgba(255, 255, 255, 0.65)" }}>
                  <Box component="span" sx={{ fontWeight: 800, color: "#FFFFFF", mr: 0.5, fontSize: 15.5 }}>
                    {formatSoLuong(tongHocVienDangHoc)}
                  </Box>
                  học viên đang học
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  px: 2.2,
                  py: 1.1,
                  borderRadius: "12px",
                  bgcolor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                <HowToRegOutlinedIcon sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 20 }} />
                <Typography sx={{ fontSize: 13, color: "rgba(255, 255, 255, 0.65)" }}>
                  <Box component="span" sx={{ fontWeight: 800, color: "#FFFFFF", mr: 0.5, fontSize: 15.5 }}>
                    {formatSoLuong(tongHocVienDangKy)}
                  </Box>
                  học viên đã đăng ký
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
