// src/app/instructor/profile/[userId]/components/Instructorcourselist.tsx
"use client";

import React from "react";
import {
  Box,
  Grid,
  Pagination,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import SentimentDissatisfiedOutlinedIcon from "@mui/icons-material/SentimentDissatisfiedOutlined";
import InstructorCourseCard from "./Instructorcoursecard";
import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";

interface InstructorCourseListProps {
  danhSachKhoaHoc: KhoaHocType[];
  dangTai: boolean;
  pageIndex: number;
  tongSoTrang: number;
  onDoiTrang: (trang: number) => void;
  onChonKhoaHoc?: (khoaHoc: KhoaHocType) => void;
}

const SKELETON_COUNT = 8;

export default function InstructorCourseList({
  danhSachKhoaHoc,
  dangTai,
  pageIndex,
  tongSoTrang,
  onDoiTrang,
  onChonKhoaHoc,
}: InstructorCourseListProps) {
  if (dangTai) {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Skeleton variant="rounded" height={160} sx={{ mb: 1.5, borderRadius: "16px" }} />
            <Skeleton variant="text" height={24} sx={{ borderRadius: "4px" }} />
            <Skeleton variant="text" width="60%" sx={{ borderRadius: "4px" }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (danhSachKhoaHoc.length === 0) {
    return (
      <Stack
        sx={{
          alignItems: "center",
          justifyContent: "center",
          py: 8,
          color: "text.secondary",
        }}
        spacing={1.5}
      >
        <SentimentDissatisfiedOutlinedIcon sx={{ fontSize: 48, color: "var(--ev-text-muted, #9CA3AF)" }} />
        <Typography variant="body1" sx={{ fontWeight: 600, color: "var(--ev-text-secondary, #4B5563)" }}>
          Giảng viên này chưa có khóa học nào được công bố.
        </Typography>
      </Stack>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {danhSachKhoaHoc.map((khoaHoc) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={khoaHoc.id}>
            <InstructorCourseCard khoaHoc={khoaHoc} onClick={onChonKhoaHoc} />
          </Grid>
        ))}
      </Grid>

      {tongSoTrang > 1 && (
        <Stack
          sx={{
            alignItems: "center",
            mt: 5,
          }}
        >
          <Pagination
            page={pageIndex}
            count={tongSoTrang}
            onChange={(_, trang) => onDoiTrang(trang)}
            shape="rounded"
            sx={{
              "& .MuiPaginationItem-root": {
                fontWeight: 700,
                borderRadius: "8px",
              },
              "& .MuiPaginationItem-root.Mui-selected": {
                bgcolor: "#8B1313 !important",
                color: "#FFFFFF !important",
              },
            }}
          />
        </Stack>
      )}
    </Box>
  );
}
