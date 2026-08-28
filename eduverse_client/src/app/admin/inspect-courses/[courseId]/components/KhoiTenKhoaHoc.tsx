"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Stack,
  Typography,
  Avatar,
  Chip,
  alpha,
} from "@mui/material";
import { boxSx, FONTS } from "../types/constants";
import StatusChip from "./StatusChip";
import { BRAND, CSSVAR } from "@/src/theme/tokens";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SellRoundedIcon from "@mui/icons-material/SellRounded";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

export default function KhoiTenKhoaHoc({
  detail,
}: any) {
  return (
    <Box
      sx={{
        ...boxSx,
        p: { xs: 2, sm: 2.25 },
        position: "relative",
        bgcolor: "#FFFFFF",
        flexShrink: 0,
        width: "100%",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 2, sm: 2.5 }}
        sx={{ alignItems: { xs: "flex-start", sm: "center" } }}
      >
        {detail?.hinhAnhKhoaHoc && (
          <Box
            sx={{
              position: "relative",
              flexShrink: 0,
              width: { xs: "100%", sm: 150, md: 170 },
              height: { xs: 110, sm: 95, md: 105 },
              borderRadius: "14px",
              overflow: "hidden",
              border: `1px solid ${CSSVAR.divider}`,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              bgcolor: "#0F172A",
            }}
          >
            <Avatar
              variant="rounded"
              src={detail.hinhAnhKhoaHoc}
              alt={detail?.tieuDe || "Khóa học"}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Box>
        )}

        <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
          <Stack
            direction="row"
            sx={{
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 1.5,
              mb: 1,
            }}
          >
            <Typography
              sx={{
                fontFamily: FONTS.display,
                fontWeight: 900,
                fontSize: { xs: 16, sm: 18, md: 19 },
                lineHeight: 1.3,
                letterSpacing: "-0.02em",
                color: "#0F172A",
                flex: 1,
              }}
            >
              {detail?.tieuDe || detail?.tenKhoaHoc || "Tên khóa học"}
            </Typography>

            <StatusChip
              trangThai={detail?.trangThaiPheDuyet ?? detail?.trangThai}
            />
          </Stack>

          {detail && (
            <Stack spacing={1}>
              {/* Giảng viên & Cấp độ & Giá */}
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                sx={{ flexWrap: "wrap", alignItems: "center" }}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.6,
                    px: 1.1,
                    py: 0.35,
                    borderRadius: "8px",
                    bgcolor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <PersonRoundedIcon sx={{ fontSize: 14, color: "#64748B" }} />
                  <Typography
                    variant="caption"
                    sx={{ color: "#64748B", fontWeight: 600, fontSize: 12 }}
                  >
                    Giảng viên:{" "}
                    <span style={{ color: "#0F172A", fontWeight: 800 }}>
                      {detail.createBy || "Không xác định"}
                    </span>
                  </Typography>
                </Box>

                {detail.loaiKhoaHoc && (
                  <Chip
                    icon={<LayersRoundedIcon sx={{ fontSize: "13px !important", color: "#64748B" }} />}
                    label={detail.loaiKhoaHoc}
                    size="small"
                    sx={{
                      bgcolor: "#F8FAFC",
                      color: "#334155",
                      fontWeight: 700,
                      fontSize: 11.5,
                      borderRadius: "8px",
                      border: "1px solid #E2E8F0",
                      height: 24,
                    }}
                  />
                )}

                {detail.capDo && (
                  <Chip
                    label={`Cấp độ: ${detail.capDo}`}
                    size="small"
                    sx={{
                      bgcolor: "#F8FAFC",
                      color: "#334155",
                      fontWeight: 700,
                      fontSize: 11.5,
                      borderRadius: "8px",
                      border: "1px solid #E2E8F0",
                      height: 24,
                    }}
                  />
                )}

                {detail.giaGoc != null && (
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                      px: 1.1,
                      py: 0.35,
                      borderRadius: "8px",
                      bgcolor: "#F0FDF4",
                      border: "1px solid #BBF7D0",
                      color: "#16A34A",
                    }}
                  >
                    <SellRoundedIcon sx={{ fontSize: 12 }} />
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: 12,
                        lineHeight: 1,
                      }}
                    >
                      {detail.giaGoc === 0
                        ? "Miễn phí"
                        : `${detail.giaGoc.toLocaleString("vi-VN")} đ`}
                    </Typography>
                  </Box>
                )}
              </Stack>

              {/* Danh mục */}
              {detail.danhMucs && detail.danhMucs.length > 0 && (
                <Stack
                  direction="row"
                  spacing={0.6}
                  useFlexGap
                  sx={{ flexWrap: "wrap", alignItems: "center" }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: "#94A3B8",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      mr: 0.25,
                    }}
                  >
                    Danh mục:
                  </Typography>
                  {detail.danhMucs.map((cat: string, index: number) => (
                    <Chip
                      key={index}
                      label={cat}
                      size="small"
                      sx={{
                        bgcolor: "transparent",
                        color: BRAND.main,
                        fontWeight: 700,
                        fontSize: 11,
                        borderRadius: "6px",
                        border: `1px solid ${alpha(BRAND.main, 0.2)}`,
                        height: 20,
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Stack>
          )}
        </Box>
      </Stack>

      {/* Lý do từ chối nếu có */}
      {detail?.ghiChuTuChoi && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: "12px",
            bgcolor: "#FEF2F2",
            border: "1px solid #FECACA",
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
          }}
        >
          <ErrorOutlineRoundedIcon sx={{ color: "#DC2626", fontSize: 18, mt: 0.1 }} />
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 800,
                color: "#991B1B",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Ghi chú từ chối trước đó
            </Typography>
            <Typography
              sx={{
                fontSize: 13,
                color: "#B91C1C",
                lineHeight: 1.4,
                fontWeight: 500,
                mt: 0.25,
              }}
            >
              {detail.ghiChuTuChoi}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
