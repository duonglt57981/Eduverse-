"use client";

import { Box, Typography, alpha, useTheme } from "@mui/material";
import {
  Schedule as ScheduleIcon,
  MenuBook as MenuBookIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";

const PRIMARY_RED = "#8B1A1A";

interface StatsBarProps {
  khoaHoc: KhoaHocType;
}

export const StatsBar = ({ khoaHoc }: StatsBarProps) => {
  const theme = useTheme();

  const items = [
    {
      icon: <ScheduleIcon sx={{ fontSize: 16 }} />,
      label: khoaHoc.tongThoiLuong
        ? `${Math.floor(khoaHoc.tongThoiLuong / 3600)}h ${Math.floor((khoaHoc.tongThoiLuong % 3600) / 60)}p`
        : "0h 0p",
      title: "Thời lượng",
    },
    {
      icon: <MenuBookIcon sx={{ fontSize: 16 }} />,
      label: `${khoaHoc.tongBaiGiang ?? 0} bài`,
      title: "Bài giảng",
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 16 }} />,
      label: (khoaHoc.soLuongHocVien ?? 0).toLocaleString("vi-VN"),
      title: "Học viên",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
        gap: 2,
      }}
    >
      {items.map((item, i) => (
        <Box
          key={i}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            borderRadius: 3,
            backgroundColor: "background.paper",
            border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
            boxShadow: `0px 2px 10px ${alpha(theme.palette.common.black, 0.03)}`,
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: `0px 4px 16px ${alpha(theme.palette.common.black, 0.06)}`,
            }
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 2,
              backgroundColor: alpha(PRIMARY_RED, 0.08),
              color: PRIMARY_RED,
            }}
          >
            {item.icon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 0.25, fontWeight: 500 }}
            >
              {item.title}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, lineHeight: 1.2 }}
            >
              {item.label}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};
