// src/app/instructor/profile/[userId]/components/InstructorCourseCard.tsx
"use client";

import { BRAND } from "@/src/theme/tokens";
import React from "react";
import { useRouter } from "next/navigation";
import {
  Paper,
  Typography,
  Stack,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  StarRounded,
  SchoolRounded,
  WorkspacePremiumRounded,
} from "@mui/icons-material";
import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import { useFavorite } from "@/src/features/favorite/hooks/useFavorite";
import FavoriteHeartIcon from "@/src/features/favorite/components/FavoriteHeartIcon";

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

  let badge = "";
  let imageUrl = "";

  const hinhAnhRaw =
    khoaHoc.hinhAnhKhoaHoc || (khAny.hinhAnh as string) || "";
  try {
    const parsed = JSON.parse(hinhAnhRaw);
    if (parsed.badge) badge = parsed.badge;
    if (parsed.imageUrl) imageUrl = parsed.imageUrl;
  } catch {
    if (
      hinhAnhRaw &&
      (hinhAnhRaw.startsWith("http") ||
        hinhAnhRaw.startsWith("/") ||
        hinhAnhRaw.startsWith("."))
    ) {
      imageUrl = hinhAnhRaw;
    }
  }

  const levelBadge = khoaHoc.capDo || badge || "Tất cả cấp độ";
  const ratingVal =
    khoaHoc.diemDanhGiaTrungBinh ||
    (khAny.diemDanhGia as number) ||
    (khAny.rating as number) ||
    0;
  const hasRating = typeof ratingVal === "number" && ratingVal > 0;
  const reviewCount =
    khoaHoc.soLuongDanhGia ||
    (khAny.soLuongDanhGia as number) ||
    (khAny.soDanhGia as number) ||
    0;

  const giaHienTai =
    khoaHoc.gia !== undefined
      ? khoaHoc.gia
      : (khAny.giaTien as number) !== undefined
        ? (khAny.giaTien as number)
        : 0;
  const isFree = !giaHienTai || giaHienTai <= 0;
  const coGiaGoc =
    khoaHoc.giaGoc !== undefined &&
    khoaHoc.giaGoc !== null &&
    khoaHoc.giaGoc > giaHienTai;

  const instructorName =
    (khAny.tenGiangVien as string) ||
    (khAny.instructor as string) ||
    (khAny.giangVien as string) ||
    "Giảng viên EduVerse";

  const favorited = isFavorited(khoaHoc.id);

  const handleCardClick = () => {
    if (onClick) {
      onClick(khoaHoc);
    } else {
      router.push(`/student/enroll-courses/${khoaHoc.id}`);
    }
  };

  return (
    <Paper
      elevation={0}
      onClick={handleCardClick}
      sx={{
        borderRadius: "10px",
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.08)",
        bgcolor: "var(--dashboard-surface, #fff)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition:
          "transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
          borderColor: "rgba(141,19,19,0.2)",
          "& .card-wishlist-btn": {
            transform: "scale(1.1)",
          },
        },
      }}
    >
      {/* ── 1. Thumbnail Image ── */}
      <Box
        sx={{
          height: 140,
          background: imageUrl
            ? `url(${imageUrl}) center/cover no-repeat`
            : "var(--dashboard-surface-muted, #f3f4f6)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {!imageUrl && (
          <Stack sx={{ alignItems: "center", justifyContent: "center" }}>
            <SchoolRounded
              sx={{
                color: "var(--dashboard-text-muted, rgba(31,41,55,0.4))",
                fontSize: 32,
              }}
            />
            <Typography
              sx={{
                color: "var(--dashboard-text-muted, rgba(31,41,55,0.4))",
                fontSize: 11,
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

        {/* Wishlist heart button (active / red) */}
        <Tooltip
          title={favorited ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
          arrow
          placement="top"
        >
          <IconButton
            className="card-wishlist-btn"
            aria-label={favorited ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleFavorite(khoaHoc.id, khoaHoc.tieuDe || "");
            }}
            sx={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 28,
              height: 28,
              bgcolor: "rgba(255, 255, 255, 0.92)",
              color: favorited ? BRAND.main : "rgba(31, 41, 55, 0.4)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              zIndex: 5,
              transition: "transform 150ms ease, background-color 150ms ease",
              p: 0,
              "&:hover": {
                bgcolor: "#ffffff",
                color: BRAND.main,
                transform: "scale(1.15)",
              },
            }}
          >
            <FavoriteHeartIcon active={favorited} color={BRAND.main} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── 2. Card Content ── */}
      <Box
        sx={{
          p: 1.5,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          flexGrow: 1,
        }}
      >
        {/* Title */}
        <Typography
          sx={{
            fontSize: 13.5,
            fontWeight: 700,
            lineHeight: 1.4,
            height: 38,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            color: "var(--dashboard-text-primary, #111827)",
          }}
        >
          {khoaHoc.tieuDe}
        </Typography>

        {/* Instructor name */}
        <Typography
          sx={{
            fontSize: 11.5,
            color: "var(--dashboard-text-muted, rgba(31,41,55,0.6))",
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {instructorName}
        </Typography>

        {/* Rating score + Stars OR 'Chưa có đánh giá' */}
        {hasRating ? (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: "center", mt: 0.25 }}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: "#b45309",
                lineHeight: 1,
              }}
            >
              {ratingVal.toFixed(1).replace(".", ",")}
            </Typography>
            <Stack direction="row" spacing={0.1} sx={{ alignItems: "center" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarRounded
                  key={star}
                  sx={{
                    fontSize: 13.5,
                    color:
                      star <= Math.round(ratingVal)
                        ? "#f59e0b"
                        : "#d1d5db",
                  }}
                />
              ))}
            </Stack>
            {reviewCount > 0 && (
              <Typography
                sx={{
                  fontSize: 11.5,
                  color: "var(--dashboard-text-muted, rgba(31,41,55,0.6))",
                  fontWeight: 500,
                  lineHeight: 1,
                }}
              >
                ({reviewCount.toLocaleString()})
              </Typography>
            )}
          </Stack>
        ) : (
          <Stack
            direction="row"
            spacing={0.4}
            sx={{ alignItems: "center", mt: 0.25 }}
          >
            <StarRounded
              sx={{
                fontSize: 14,
                color: "var(--dashboard-text-muted, rgba(31,41,55,0.4))",
              }}
            />
            <Typography
              sx={{
                fontSize: 11.5,
                color: "var(--dashboard-text-muted, rgba(31,41,55,0.6))",
                fontWeight: 500,
                lineHeight: 1,
              }}
            >
              Chưa có đánh giá
            </Typography>
          </Stack>
        )}

        {/* Price row */}
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ alignItems: "baseline", mt: 0.25 }}
        >
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 800,
              color: "var(--dashboard-text-primary, #111827)",
              lineHeight: 1.2,
            }}
          >
            {isFree ? "Miễn phí" : `${giaHienTai.toLocaleString("vi-VN")}đ`}
          </Typography>
          {coGiaGoc && (
            <Typography
              sx={{
                fontSize: 12,
                color: "var(--dashboard-text-muted, rgba(31,41,55,0.4))",
                textDecoration: "line-through",
                lineHeight: 1.2,
              }}
            >
              {khoaHoc.giaGoc?.toLocaleString("vi-VN")}đ
            </Typography>
          )}
        </Stack>

        {/* Bottom Badge: Pill badge (Brand red "Tất cả cấp độ" / Level) */}
        <Box sx={{ mt: "auto", pt: 0.5 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: 1,
              py: 0.35,
              borderRadius: "6px",
              bgcolor: BRAND.main,
              color: "#ffffff",
              width: "fit-content",
            }}
          >
            <WorkspacePremiumRounded
              sx={{ fontSize: 13, color: "#ffffff" }}
            />
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.2,
              }}
            >
              {levelBadge}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
