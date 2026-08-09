// src/app/instructor/profile/[userId]/components/Instructorherosection.tsx
"use client";

import React from "react";
import {
  Box,
  Avatar,
  Typography,
  Stack,
  Chip,
} from "@mui/material";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
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

export default function InstructorHeroSection({
  giangVien,
  danhSachKhoaHoc,
  tongSoKhoaHoc,
  tongHocVienDangHoc,
  tongHocVienDangKy,
}: InstructorHeroSectionProps) {
  const tenHienThi = trichXuatTenHienThi(giangVien);
  const chucVuHienThi = giangVien.chucVu || "Giảng viên EduVerse";

  return (
    <Box
      sx={{
        borderRadius: { xs: "18px", md: "24px" },
        bgcolor: "#0D0505",
        background:
          "linear-gradient(135deg, #1C0909 0%, #0D0505 60%, #160808 100%)",
        color: "common.white",
        py: { xs: 4, sm: 5, md: 6 },
        px: { xs: 2.5, sm: 4, md: 5 },
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.16)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        "& *": {
          fontFamily:
            "var(--font-primary, var(--ev-font-family, 'Be Vietnam Pro', sans-serif)) !important",
        },
      }}
    >
      {/* Background glow accents */}
      <Box
        sx={{
          position: "absolute",
          top: "-20%",
          right: "-5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,19,19,0.3) 0%, rgba(139,19,19,0) 70%)",
          filter: "blur(70px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-20%",
          left: "-5%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,19,19,0.2) 0%, rgba(139,19,19,0) 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 3.5, md: 5 }}
          sx={{
            alignItems: { xs: "center", md: "flex-start" },
            textAlign: { xs: "center", md: "left" },
          }}
        >
          {/* Avatar Area with double ring and consistent brand fallback color */}
          <Box
            sx={{
              position: "relative",
              p: "4px",
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #8B1313 0%, rgba(255,255,255,0.25) 100%)",
              boxShadow: "0 16px 40px rgba(0, 0, 0, 0.45)",
              flexShrink: 0,
            }}
          >
            <Avatar
              src={giangVien.anhDaiDien}
              alt={tenHienThi}
              sx={{
                width: { xs: 115, md: 145 },
                height: { xs: 115, md: 145 },
                fontSize: { xs: 44, md: 56 },
                bgcolor: "#8B1313",
                color: "#FFFFFF",
                fontWeight: 900,
                border: "4px solid #1C0909",
              }}
            >
              {tenHienThi.charAt(0).toUpperCase()}
            </Avatar>
          </Box>

          {/* Details Column */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", md: "flex-start" },
            }}
          >
            {/* Name Header */}
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                fontSize: { xs: "1.75rem", sm: "2.2rem", md: "2.5rem" },
                lineHeight: 1.2,
                mb: 1.2,
                wordBreak: "break-word",
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
              }}
            >
              {tenHienThi}
            </Typography>

            {/* Role & Verification Badge */}
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
                mb: 2,
                flexWrap: "wrap",
                justifyContent: { xs: "center", md: "flex-start" },
              }}
            >
              <Chip
                icon={<VerifiedRoundedIcon sx={{ fontSize: "16px !important", color: "#F87171 !important" }} />}
                label={chucVuHienThi}
                size="small"
                sx={{
                  bgcolor: "rgba(139, 19, 19, 0.35)",
                  border: "1px solid rgba(248, 113, 113, 0.3)",
                  color: "#FECDD3",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  py: 1.8,
                  px: 0.5,
                  borderRadius: "20px",
                }}
              />
            </Stack>

            {/* Bio / Summary */}
            {(giangVien.tieuSu || giangVien.gioiThieu) ? (
              <SafeHTML
                html={giangVien.tieuSu || giangVien.gioiThieu || ""}
                maxLength={220}
                buttonColor="#F87171"
                sx={{
                  fontSize: "0.95rem",
                  lineHeight: 1.8,
                  maxWidth: 720,
                  color: "rgba(255, 255, 255, 0.82)",
                  mb: 3,
                }}
              />
            ) : (
              <Typography
                sx={{
                  fontSize: "0.95rem",
                  lineHeight: 1.7,
                  maxWidth: 720,
                  color: "rgba(255, 255, 255, 0.65)",
                  mb: 3,
                }}
              >
                Giảng viên chính thức tại hệ thống EduVerse, chuyên nghiên cứu và chia sẻ kiến thức chuyên môn chất lượng cao.
              </Typography>
            )}

            {/* 3 Stat Chips with enhanced hierarchy and consistent spacing */}
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                flexWrap: "wrap",
                justifyContent: { xs: "center", md: "flex-start" },
                gap: 1.5,
              }}
            >
              {/* Courses Stat */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  px: 2.2,
                  py: 1.1,
                  borderRadius: "14px",
                  bgcolor: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  backdropFilter: "blur(12px)",
                  transition: "background-color 200ms ease, border-color 200ms ease",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    borderColor: "rgba(255, 255, 255, 0.22)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "10px",
                    bgcolor: "rgba(239, 68, 68, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <SchoolOutlinedIcon sx={{ color: "#FCA5A5", fontSize: 19 }} />
                </Box>
                <Box sx={{ textAlign: "left" }}>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      color: "#FFFFFF",
                      fontSize: 16,
                      lineHeight: 1.1,
                    }}
                  >
                    {tongSoKhoaHoc}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.65)",
                    }}
                  >
                    khóa học
                  </Typography>
                </Box>
              </Box>

              {/* Active Students Stat */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  px: 2.2,
                  py: 1.1,
                  borderRadius: "14px",
                  bgcolor: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  backdropFilter: "blur(12px)",
                  transition: "background-color 200ms ease, border-color 200ms ease",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    borderColor: "rgba(255, 255, 255, 0.22)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "10px",
                    bgcolor: "rgba(59, 130, 246, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <GroupsOutlinedIcon sx={{ color: "#93C5FD", fontSize: 19 }} />
                </Box>
                <Box sx={{ textAlign: "left" }}>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      color: "#FFFFFF",
                      fontSize: 16,
                      lineHeight: 1.1,
                    }}
                  >
                    {formatSoLuong(tongHocVienDangHoc)}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.65)",
                    }}
                  >
                    học viên đang học
                  </Typography>
                </Box>
              </Box>

              {/* Registered Students Stat */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  px: 2.2,
                  py: 1.1,
                  borderRadius: "14px",
                  bgcolor: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  backdropFilter: "blur(12px)",
                  transition: "background-color 200ms ease, border-color 200ms ease",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    borderColor: "rgba(255, 255, 255, 0.22)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "10px",
                    bgcolor: "rgba(16, 185, 129, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <HowToRegOutlinedIcon sx={{ color: "#6EE7B7", fontSize: 19 }} />
                </Box>
                <Box sx={{ textAlign: "left" }}>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      color: "#FFFFFF",
                      fontSize: 16,
                      lineHeight: 1.1,
                    }}
                  >
                    {formatSoLuong(tongHocVienDangKy)}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.65)",
                    }}
                  >
                    học viên đã đăng ký
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
