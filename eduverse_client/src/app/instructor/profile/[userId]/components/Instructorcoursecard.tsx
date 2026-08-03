// src/app/instructor/profile/[userId]/components/Instructorcoursecard.tsx
"use client";

import React from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Stack,
  Chip,
  Box,
} from "@mui/material";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import PlayLessonOutlinedIcon from "@mui/icons-material/PlayLessonOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import {
  CAP_DO_MAU,
  formatGiaTien,
  formatSoLuong,
  formatThoiLuong,
} from "./types/Constants";
import SafeHTML from "./common/SafeHTML";

interface InstructorCourseCardProps {
  khoaHoc: KhoaHocType;
  onClick?: (khoaHoc: KhoaHocType) => void;
}

export default function InstructorCourseCard({
  khoaHoc,
  onClick,
}: InstructorCourseCardProps) {
  const coGiaGoc =
    khoaHoc.giaGoc !== undefined &&
    khoaHoc.giaGoc !== null &&
    khoaHoc.gia !== undefined &&
    khoaHoc.giaGoc > (khoaHoc.gia ?? 0);

  // Clean description text
  const cleanMoTa = (khoaHoc.moTa || "")
    .replace(/<p>\s*<strong>\s*Mô tả khóa học\s*<\/strong>\s*<\/p>/gi, "")
    .replace(/Mô tả khóa học/gi, "")
    .trim();

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "20px",
        border: "1px solid var(--ev-divider, #ECE7E4)",
        bgcolor: "var(--ev-paper, #FFFFFF)",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        "&:hover": {
          boxShadow: "0 16px 36px rgba(139,19,19,0.08)",
          transform: "translateY(-6px)",
          borderColor: "rgba(139,19,19,0.25)",
        },
        "& *": {
          fontFamily:
            "var(--font-primary, var(--ev-font-family, 'Be Vietnam Pro', sans-serif)) !important",
        },
      }}
    >
      <CardActionArea
        onClick={() => onClick?.(khoaHoc)}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <Box sx={{ position: "relative", overflow: "hidden", aspectRatio: "16/9" }}>
          <CardMedia
            component="img"
            image={khoaHoc.hinhAnhKhoaHoc || "/images/course-placeholder.png"}
            alt={khoaHoc.tieuDe}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />

          {khoaHoc.capDo && (
            <Chip
              size="small"
              label={khoaHoc.capDo}
              sx={{
                position: "absolute",
                top: 10,
                left: 10,
                zIndex: 2,
                bgcolor: "rgba(31, 41, 55, 0.8)",
                color: "#FFFFFF",
                backdropFilter: "blur(8px)",
                fontWeight: 700,
                fontSize: 11,
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />
          )}
        </Box>

        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            width: "100%",
            p: 2.5,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              fontSize: 16,
              color: "var(--ev-text-primary, #1F2937)",
              lineHeight: 1.35,
              mb: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: 44,
            }}
            title={khoaHoc.tieuDe}
          >
            {khoaHoc.tieuDe}
          </Typography>

          {/* Hiển thị mô tả sạch với HTML */}
          {cleanMoTa && (
            <SafeHTML
              html={cleanMoTa}
              lineClamp={2}
              expandable={false}
              sx={{
                mb: 2,
                fontSize: "0.875rem",
                color: "var(--ev-text-secondary, #4B5563)",
                lineHeight: 1.5,
              }}
            />
          )}

          <Stack
            direction="row"
            spacing={1.2}
            sx={{
              mb: 2,
              flexWrap: "wrap",
              gap: 0.8,
            }}
          >
            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                alignItems: "center",
                px: 1,
                py: 0.4,
                borderRadius: "6px",
                bgcolor: "var(--ev-paper-alt, #F7F5F2)",
              }}
            >
              <AccessTimeOutlinedIcon
                sx={{ fontSize: 15, color: "var(--ev-text-secondary, #4B5563)" }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  fontSize: 11.5,
                  color: "var(--ev-text-secondary, #4B5563)",
                }}
              >
                {formatThoiLuong(khoaHoc.tongThoiLuong)}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                alignItems: "center",
                px: 1,
                py: 0.4,
                borderRadius: "6px",
                bgcolor: "var(--ev-paper-alt, #F7F5F2)",
              }}
            >
              <PlayLessonOutlinedIcon
                sx={{ fontSize: 15, color: "var(--ev-text-secondary, #4B5563)" }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  fontSize: 11.5,
                  color: "var(--ev-text-secondary, #4B5563)",
                }}
              >
                {khoaHoc.tongBaiGiang ?? 0} bài
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                alignItems: "center",
                px: 1,
                py: 0.4,
                borderRadius: "6px",
                bgcolor: "var(--ev-paper-alt, #F7F5F2)",
              }}
            >
              <GroupsOutlinedIcon
                sx={{ fontSize: 15, color: "var(--ev-text-secondary, #4B5563)" }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  fontSize: 11.5,
                  color: "var(--ev-text-secondary, #4B5563)",
                }}
              >
                {formatSoLuong(khoaHoc.soLuongHocVien)} học viên
              </Typography>
            </Stack>
          </Stack>

          <Box sx={{ mt: "auto", pt: 1, borderTop: "1px dashed var(--ev-divider, #ECE7E4)" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "baseline" }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 900,
                  fontSize: 17,
                  color: "#8B1313",
                }}
              >
                {formatGiaTien(khoaHoc.gia)}
              </Typography>
              {coGiaGoc && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.disabled",
                    textDecoration: "line-through",
                    fontSize: 13,
                  }}
                >
                  {formatGiaTien(khoaHoc.giaGoc)}
                </Typography>
              )}
            </Stack>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
