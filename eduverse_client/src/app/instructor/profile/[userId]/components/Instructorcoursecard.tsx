// src/app/instructor/profile/[userId]/components/InstructorCourseCard.tsx
"use client";

import { BRAND, STATUS } from "@/src/theme/tokens";
import React from "react";
import { useRouter } from "next/navigation";
import {
  Paper,
  Typography,
  Stack,
  Chip,
  Box,
  Button,
  Divider,
  IconButton,
} from "@mui/material";
import {
  StarRounded,
  PeopleAltRounded,
  FavoriteBorderRounded,
  FavoriteRounded,
  PlayArrowRounded,
  SchoolRounded,
} from "@mui/icons-material";
import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import { useFavorite } from "@/src/features/favorite/hooks/useFavorite";
import {
  formatGiaTien,
  formatThoiLuong,
} from "./types/Constants";

interface InstructorCourseCardProps {
  khoaHoc: KhoaHocType;
  onClick?: (khoaHoc: KhoaHocType) => void;
}

export default function InstructorCourseCard({
  khoaHoc,
  onClick,
}: InstructorCourseCardProps) {
  const router = useRouter();
  const { isFavorited, toggleFavorite } = useFavorite();

  const khAny = khoaHoc as unknown as Record<string, unknown>;

  const coGiaGoc =
    khoaHoc.giaGoc !== undefined &&
    khoaHoc.giaGoc !== null &&
    khoaHoc.gia !== undefined &&
    khoaHoc.giaGoc > (khoaHoc.gia ?? 0);

  const laMienPhi = (khoaHoc.gia ?? 0) === 0;

  const thoiLuong =
    khoaHoc.tongThoiLuong ||
    (khAny.thoiLuong as number) ||
    (khAny.tongThoiGian as number) ||
    0;
  const tongBaiGiang =
    khoaHoc.soLuongBaiGiang ||
    (khAny.tongBaiGiang as number) ||
    (khAny.soBaiGiang as number) ||
    0;
  const soHocVien =
    khoaHoc.soLuongHocVien ||
    (khAny.tongHocVien as number) ||
    (khAny.soHocVien as number) ||
    0;
  const diemDanhGiaTrungBinh =
    khoaHoc.diemDanhGiaTrungBinh ||
    (khAny.diemDanhGia as number) ||
    (khAny.rating as number) ||
    5.0;

  const daDangKy = (khAny.daDangKy as boolean) ?? false;
  const idDangKiKhoaHoc = khAny.idDangKiKhoaHoc as string | undefined;

  const instructorName =
    (khAny.tenGiangVien as string) ||
    (khAny.instructor as string) ||
    (khAny.giangVien as string) ||
    "Giảng viên EduVerse";

  const favorited = isFavorited(khoaHoc.id);
  const ratingVal = diemDanhGiaTrungBinh > 0 ? diemDanhGiaTrungBinh : 5.0;

  const handleCardClick = () => {
    if (daDangKy && idDangKiKhoaHoc) {
      router.push(`/student/courses/my-courses/learning/${idDangKiKhoaHoc}`);
    } else {
      onClick?.(khoaHoc);
    }
  };

  const handleContinueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (daDangKy && idDangKiKhoaHoc) {
      router.push(`/student/courses/my-courses/learning/${idDangKiKhoaHoc}`);
    }
  };

  return (
    <Paper
      elevation={0}
      onClick={handleCardClick}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "18px",
        overflow: "hidden",
        border: "1px solid var(--dashboard-border, rgba(0,0,0,0.07))",
        bgcolor: "var(--dashboard-surface, #FFFFFF)",
        cursor: "pointer",
        transition:
          "transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(139,19,19,0.08)",
          borderColor: "var(--dashboard-primary-border, rgba(139,19,19,0.25))",
          "& .course-card-img": {
            transform: "scale(1.05)",
          },
        },
      }}
    >
      {/* Thumbnail Box */}
      <Box
        sx={{
          height: 136,
          position: "relative",
          overflow: "hidden",
          background: khoaHoc.hinhAnhKhoaHoc
            ? `url(${khoaHoc.hinhAnhKhoaHoc}) center/cover no-repeat`
            : "var(--dashboard-surface-muted, #f3f4f6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!khoaHoc.hinhAnhKhoaHoc && (
          <Stack sx={{ alignItems: "center", justifyContent: "center" }}>
            <SchoolRounded sx={{ color: "var(--dashboard-text-muted, #8A7676)", fontSize: 32 }} />
            <Typography
              sx={{
                color: "var(--dashboard-text-muted, #8A7676)",
                fontSize: 10,
                fontWeight: 700,
                mt: 0.75,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              EDUVERSE
            </Typography>
          </Stack>
        )}

        {/* Level Chip - Top Left */}
        {khoaHoc.capDo && (
          <Chip
            label={khoaHoc.capDo}
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              bgcolor: "rgba(255,255,255,0.92)",
              color: BRAND.main,
              fontWeight: 800,
              fontSize: 10,
              height: 20,
              backdropFilter: "blur(4px)",
            }}
          />
        )}

        {/* Heart Icon Button - Top Right */}
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(khoaHoc.id, khoaHoc.tieuDe || "");
          }}
          sx={{
            position: "absolute",
            top: 6,
            right: 8,
            width: 28,
            height: 28,
            bgcolor: "rgba(255, 255, 255, 0.95)",
            color: favorited ? BRAND.main : "rgba(31, 41, 55, 0.4)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            zIndex: 5,
            transition: "all 150ms ease",
            p: 0,
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 1)",
              color: BRAND.main,
              transform: "scale(1.08)",
            },
          }}
        >
          {favorited ? (
            <FavoriteRounded sx={{ fontSize: 16, color: BRAND.main }} />
          ) : (
            <FavoriteBorderRounded sx={{ fontSize: 16 }} />
          )}
        </IconButton>

        {/* Free Badge - Bottom Left */}
        {!daDangKy && laMienPhi && (
          <Chip
            label="MIỄN PHÍ"
            size="small"
            sx={{
              position: "absolute",
              bottom: 8,
              left: 8,
              bgcolor: STATUS.success,
              color: "#fff",
              fontWeight: 900,
              fontSize: 9.5,
              height: 18,
            }}
          />
        )}
      </Box>

      {/* Card Content Body */}
      <Box
        sx={{
          p: 1.75,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Title */}
        <Typography
          sx={{
            fontSize: 13.5,
            fontWeight: 800,
            lineHeight: 1.4,
            height: 38,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            color: "var(--dashboard-text-primary, #1F2937)",
            mb: 0.5,
          }}
        >
          {khoaHoc.tieuDe}
        </Typography>

        {/* Instructor Name */}
        <Typography
          sx={{
            fontSize: 11.5,
            color: "var(--dashboard-text-muted, #8A7676)",
            fontWeight: 600,
            mb: 0.75,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {instructorName}
        </Typography>

        {/* Metadata Details */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ mb: 1.25, flexWrap: "wrap", gap: 0.5 }}
        >
          {tongBaiGiang > 0 && (
            <Typography
              sx={{
                fontSize: 11,
                color: "var(--dashboard-text-muted, #8A7676)",
                fontWeight: 600,
              }}
            >
              📖 {tongBaiGiang} bài
            </Typography>
          )}
          {thoiLuong > 0 && (
            <Typography
              sx={{
                fontSize: 11,
                color: "var(--dashboard-text-muted, #8A7676)",
                fontWeight: 600,
              }}
            >
              ⏱ {formatThoiLuong(thoiLuong)}
            </Typography>
          )}
        </Stack>

        <Divider sx={{ mb: 1.25, opacity: 0.45 }} />

        {/* Bottom Price & Rating Row */}
        <Box sx={{ mt: "auto" }}>
          {daDangKy ? (
            <Button
              fullWidth
              variant="contained"
              startIcon={<PlayArrowRounded />}
              onClick={handleContinueClick}
              sx={{
                borderRadius: "10px",
                py: 0.8,
                fontWeight: 800,
                fontSize: 13,
                bgcolor: BRAND.main,
                color: "#fff",
                boxShadow: "none",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#7F1D1D",
                  boxShadow: "none",
                },
              }}
            >
              Tiếp tục học
            </Button>
          ) : (
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 14.5,
                    fontWeight: 900,
                    color: laMienPhi ? STATUS.success : BRAND.main,
                  }}
                >
                  {laMienPhi ? "Miễn phí" : formatGiaTien(khoaHoc.gia)}
                </Typography>
                {coGiaGoc && (
                  <Typography
                    sx={{
                      fontSize: 10.5,
                      color: "var(--dashboard-text-muted, #8A7676)",
                      textDecoration: "line-through",
                      fontWeight: 600,
                    }}
                  >
                    {formatGiaTien(khoaHoc.giaGoc)}
                  </Typography>
                )}
              </Box>

              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Stack
                  direction="row"
                  spacing={0.3}
                  sx={{ alignItems: "center" }}
                >
                  <StarRounded sx={{ fontSize: 14, color: STATUS.warning }} />
                  <Typography
                    sx={{
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: "var(--dashboard-text-primary, #1F2937)",
                    }}
                  >
                    {ratingVal.toFixed(1)}
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  spacing={0.3}
                  sx={{ alignItems: "center" }}
                >
                  <PeopleAltRounded
                    sx={{ fontSize: 13, color: "rgba(31,41,55,0.45)" }}
                  />
                  <Typography
                    sx={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "rgba(31,41,55,0.6)",
                    }}
                  >
                    {soHocVien}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
