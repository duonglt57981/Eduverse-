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
        bgcolor: "#0D0505",
        background:
          "linear-gradient(135deg, #1A0909 0%, #0D0505 50%, #170808 100%)",
        color: "common.white",
        pt: { xs: 6, md: 7 },
        pb: { xs: 6, md: 7 },
        position: "relative",
        overflow: "hidden",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        "& *": {
          fontFamily:
            "var(--font-primary, var(--ev-font-family, 'Be Vietnam Pro', sans-serif)) !important",
        },
      }}
    >
      {/* Background glow accent */}
      <Box
        sx={{
          position: "absolute",
          top: "-30%",
          right: "-5%",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,19,19,0.25) 0%, rgba(139,19,19,0) 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-30%",
          left: "-5%",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,19,19,0.15) 0%, rgba(139,19,19,0) 70%)",
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
          {/* Avatar Ring */}
          <Box
            sx={{
              p: "4px",
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #8B1313 0%, rgba(255,255,255,0.2) 100%)",
              boxShadow: "0 16px 40px rgba(0, 0, 0, 0.4)",
              flexShrink: 0,
            }}
          >
            <Avatar
              src={giangVien.anhDaiDien}
              alt={tenHienThi}
              sx={{
                width: { xs: 110, md: 145 },
                height: { xs: 110, md: 145 },
                fontSize: 48,
                bgcolor: "#2D0B0B",
                color: "#FFFFFF",
                fontWeight: 800,
              }}
            >
              {tenHienThi.charAt(0)}
            </Avatar>
          </Box>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", md: "flex-start" },
            }}
          >
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
                letterSpacing: "-0.02em",
              }}
            >
              {tenHienThi}
            </Typography>

            {giangVien.chucVu && (
              <Box
                sx={{
                  display: "inline-block",
                  px: 1.6,
                  py: 0.4,
                  borderRadius: "20px",
                  bgcolor: "rgba(139, 19, 19, 0.25)",
                  border: "1px solid rgba(139, 19, 19, 0.4)",
                  color: "#FECDD3",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  mb: 2,
                }}
              >
                {giangVien.chucVu}
              </Box>
            )}

            {/* Hiển thị tiểu sử với expand/collapse */}
            {(giangVien.tieuSu || giangVien.gioiThieu) && (
              <SafeHTML
                html={giangVien.tieuSu || giangVien.gioiThieu || ""}
                maxLength={200}
                buttonColor="#F87171"
                sx={{
                  fontSize: "0.95rem",
                  lineHeight: 1.8,
                  maxWidth: 680,
                  color: "rgba(255, 255, 255, 0.8)",
                }}
              />
            )}

            <Stack
              direction="row"
              spacing={2}
              sx={{
                flexWrap: "wrap",
                justifyContent: { xs: "center", md: "flex-start" },
                gap: 1.5,
                mt: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  px: 2,
                  py: 1,
                  borderRadius: "12px",
                  bgcolor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                }}
              >
                <SchoolOutlinedIcon
                  sx={{ color: "#FCA5A5", fontSize: 20 }}
                />
                <Typography
                  sx={{ fontSize: 13, color: "rgba(255, 255, 255, 0.7)" }}
                >
                  <Box
                    component="span"
                    sx={{
                      fontWeight: 850,
                      color: "#FFFFFF",
                      mr: 0.5,
                      fontSize: 15,
                    }}
                  >
                    {tongSoKhoaHoc}
                  </Box>
                  khóa học
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  px: 2,
                  py: 1,
                  borderRadius: "12px",
                  bgcolor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                }}
              >
                <GroupsOutlinedIcon
                  sx={{ color: "#93C5FD", fontSize: 20 }}
                />
                <Typography
                  sx={{ fontSize: 13, color: "rgba(255, 255, 255, 0.7)" }}
                >
                  <Box
                    component="span"
                    sx={{
                      fontWeight: 850,
                      color: "#FFFFFF",
                      mr: 0.5,
                      fontSize: 15,
                    }}
                  >
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
                  px: 2,
                  py: 1,
                  borderRadius: "12px",
                  bgcolor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                }}
              >
                <HowToRegOutlinedIcon
                  sx={{ color: "#6EE7B7", fontSize: 20 }}
                />
                <Typography
                  sx={{ fontSize: 13, color: "rgba(255, 255, 255, 0.7)" }}
                >
                  <Box
                    component="span"
                    sx={{
                      fontWeight: 850,
                      color: "#FFFFFF",
                      mr: 0.5,
                      fontSize: 15,
                    }}
                  >
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
