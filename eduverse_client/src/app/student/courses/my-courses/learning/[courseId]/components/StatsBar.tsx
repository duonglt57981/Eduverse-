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
        display: "flex",
        borderRadius: 2,
        overflow: "hidden",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: "blur(12px)",
      }}
    >
      {items.map((item, i) => (
        <Box
          key={i}
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1.25,
            borderRight:
              i < items.length - 1
                ? `1px solid ${alpha(theme.palette.divider, 0.5)}`
                : "none",
          }}
        >
          <Box sx={{ color: PRIMARY_RED, opacity: 0.75, display: "flex" }}>
            {item.icon}
          </Box>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", lineHeight: 1.2 }}
            >
              {item.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, lineHeight: 1.3 }}
            >
              {item.label}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};
