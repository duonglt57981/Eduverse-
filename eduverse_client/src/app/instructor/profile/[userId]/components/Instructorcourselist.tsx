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
            <Skeleton variant="rounded" height={160} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={24} />
            <Skeleton variant="text" width="60%" />
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
        <SentimentDissatisfiedOutlinedIcon sx={{ fontSize: 48 }} />
        <Typography variant="body1">
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
            color="primary"
            onChange={(_, trang) => onDoiTrang(trang)}
            shape="rounded"
          />
        </Stack>
      )}
    </Box>
  );
}
