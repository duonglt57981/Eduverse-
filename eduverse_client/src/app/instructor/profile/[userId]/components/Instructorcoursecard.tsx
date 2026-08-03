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

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "16px",
        border: "1px solid var(--ev-divider, #ECE7E4)",
        bgcolor: "var(--ev-paper, #FFFFFF)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.05)",
          transform: "translateY(-4px)",
          borderColor: "rgba(139,19,19,0.2)",
        },
        "& *": {
          fontFamily: "var(--ev-font-family, 'Be Vietnam Pro', sans-serif) !important",
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
        <CardMedia
          component="img"
          image={khoaHoc.hinhAnhKhoaHoc || "/images/course-placeholder.png"}
          alt={khoaHoc.tieuDe}
          sx={{ aspectRatio: "16/9", objectFit: "cover" }}
        />
        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              mb: 0.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: 48,
            }}
            title={khoaHoc.tieuDe}
          >
            {khoaHoc.tieuDe}
          </Typography>

          {/* Hiển thị mô tả với HTML và line clamp */}
          {khoaHoc.moTa && (
            <SafeHTML
              html={khoaHoc.moTa}
              lineClamp={2}
              expandable={false}
              sx={{
                mb: 1.5,
                fontSize: "0.875rem",
                color: "text.secondary",
              }}
            />
          )}

          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              mb: 1.5,
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {khoaHoc.capDo && (
              <Chip
                size="small"
                label={khoaHoc.capDo}
                color={CAP_DO_MAU[khoaHoc.capDo] ?? "default"}
                variant="outlined"
              />
            )}
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              <AccessTimeOutlinedIcon
                sx={{ fontSize: 16, color: "text.secondary" }}
              />
              <Typography variant="caption" color="text.secondary">
                {formatThoiLuong(khoaHoc.tongThoiLuong)}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              <PlayLessonOutlinedIcon
                sx={{ fontSize: 16, color: "text.secondary" }}
              />
              <Typography variant="caption" color="text.secondary">
                {khoaHoc.tongBaiGiang ?? 0} bài giảng
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              <GroupsOutlinedIcon
                sx={{ fontSize: 16, color: "text.secondary" }}
              />
              <Typography variant="caption" color="text.secondary">
                {formatSoLuong(khoaHoc.soLuongHocVien)} học viên
              </Typography>
            </Stack>
          </Stack>

          <Box sx={{ mt: "auto" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "baseline" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {formatGiaTien(khoaHoc.gia)}
              </Typography>
              {coGiaGoc && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.disabled",
                    textDecoration: "line-through",
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
