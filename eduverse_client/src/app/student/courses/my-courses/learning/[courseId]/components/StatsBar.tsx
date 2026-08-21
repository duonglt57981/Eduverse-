"use client";

import { Box, Typography, alpha, useTheme } from "@mui/material";
import {
  Schedule as ScheduleIcon,
  MenuBook as MenuBookIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import { BRAND, CSSVAR } from "@/src/theme/tokens";

const PRIMARY_RED = BRAND.main;

interface StatsBarProps {
  khoaHoc: KhoaHocType;
}

export const StatsBar = ({ khoaHoc }: StatsBarProps) => {
  const theme = useTheme();

  const items = [
    {
      icon: <ScheduleIcon sx={{ fontSize: 18 }} />,
      label: khoaHoc.tongThoiLuong
        ? `${Math.floor(khoaHoc.tongThoiLuong / 3600)}h ${Math.floor((khoaHoc.tongThoiLuong % 3600) / 60)}p`
        : "0h 0p",
      title: "Thời lượng",
    },
    {
      icon: <MenuBookIcon sx={{ fontSize: 18 }} />,
      label: `${khoaHoc.tongBaiGiang ?? 0} bài giảng`,
      title: "Bài học",
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 18 }} />,
      label: (khoaHoc.soLuongHocVien ?? 0).toLocaleString("vi-VN"),
      title: "Học viên",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
        gap: 2.25,
      }}
    >
      {items.map((item, i) => (
        <Box
          key={i}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2.25,
            borderRadius: "16px",
            backgroundColor: CSSVAR.paper,
            border: `1px solid ${CSSVAR.divider}`,
            boxShadow: "0 4px 12px rgba(0,0,0,0.015)",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              borderColor: "#CBD5E1",
              boxShadow: "0 6px 16px rgba(0,0,0,0.03)",
            }
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 46,
              height: 46,
              borderRadius: "10px",
              backgroundColor: alpha(PRIMARY_RED, 0.08),
              color: PRIMARY_RED,
            }}
          >
            {item.icon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{ display: "block", mb: 0.5, fontWeight: 700, color: CSSVAR.textSecondary }}
            >
              {item.title}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, lineHeight: 1.2, color: CSSVAR.textPrimary }}
            >
              {item.label}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};
