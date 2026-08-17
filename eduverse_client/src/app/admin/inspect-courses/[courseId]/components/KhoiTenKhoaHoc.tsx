"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Stack,
  Typography,
  Avatar,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";
import { boxSx, COLORS, FONTS } from "../types/constants";
import StatusChip from "./StatusChip";

export default function KhoiTenKhoaHoc({
  detail,
  isChoDuyet,
  actionLoading,
  onDuyet,
  onTuChoiClick,
}: any) {
  return (
    <Box sx={{ ...boxSx, p: 3 }}>
      <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
        {detail?.hinhAnhKhoaHoc && (
          <Avatar
            variant="rounded"
            src={detail.hinhAnhKhoaHoc}
            sx={{
              width: 190,
              height: 114,
              borderRadius: "16px",
              border: "1px solid var(--ev-divider, #ECE7E4)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          />
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{ alignItems: { xs: "flex-start", sm: "center" }, spacing: 1 }}
          >
            <Typography
              sx={{
                fontFamily: FONTS.body,
                fontWeight: 900,
                fontSize: 22,
                letterSpacing: "-0.4px",
                color: "var(--ev-text-primary, #1F2937)",
                flex: 1,
                minWidth: 200,
              }}
            >
              {detail?.tieuDe || detail?.tenKhoaHoc || "Tên khóa học"}
            </Typography>
          </Stack>
          {detail && (
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ mt: 1.5, flexWrap: "wrap", alignItems: "center" }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "var(--ev-text-muted, #8A7676)",
                  fontWeight: 600,
                  mr: 1,
                }}
              >
                Giảng viên:{" "}
                <span
                  style={{
                    color: "var(--ev-text-primary, #1F2937)",
                    fontWeight: 700,
                  }}
                >
                  {detail.createBy || "Không xác định"}
                </span>
              </Typography>

              {detail.loaiKhoaHoc && (
                <Chip
                  label={detail.loaiKhoaHoc}
                  size="small"
                  sx={{
                    bgcolor: "transparent",
                    color: "var(--ev-text-secondary, #4B5563)",
                    fontWeight: 700,
                    fontSize: 12,
                    borderRadius: "8px",
                    border: "1px solid var(--ev-divider, #ECE7E4)",
                  }}
                />
              )}

              {detail.capDo && (
                <Chip
                  label={`Cấp độ: ${detail.capDo}`}
                  size="small"
                  sx={{
                    bgcolor: "transparent",
                    color: "var(--ev-text-secondary, #4B5563)",
                    fontWeight: 700,
                    fontSize: 12,
                    borderRadius: "8px",
                    border: "1px solid var(--ev-divider, #ECE7E4)",
                  }}
                />
              )}

              {detail.giaGoc != null && (
                <Chip
                  label={`Giá: ${detail.giaGoc.toLocaleString()} VND`}
                  size="small"
                  sx={{
                    bgcolor: COLORS.successSoft,
                    color: COLORS.success,
                    fontWeight: 800,
                    fontSize: 12,
                    borderRadius: "8px",
                  }}
                />
              )}

              {/* 👇 Hiển thị danh sách danh mục */}
              {detail.danhMucs?.map((cat: string, index: number) => (
                <Chip
                  key={index}
                  label={cat}
                  size="small"
                  sx={{
                    bgcolor: "transparent",
                    color: "var(--ev-text-secondary, #4B5563)",
                    fontWeight: 700,
                    fontSize: 12,
                    borderRadius: "8px",
                    border: "1px solid var(--ev-divider, #ECE7E4)",
                  }}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Stack>

      {detail && isChoDuyet && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: "flex-end", mt: 2 }}
        >
          <Button
            variant="outlined"
            size="small"
            disabled={actionLoading}
            onClick={onTuChoiClick}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderColor: COLORS.danger,
              color: COLORS.danger,
              "&:hover": { borderColor: "#8F2E24", bgcolor: COLORS.dangerSoft },
            }}
          >
            Từ chối
          </Button>
          <Button
            variant="contained"
            size="small"
            disabled={actionLoading}
            onClick={onDuyet}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              bgcolor: COLORS.primary,
              boxShadow: "none",
              "&:hover": { bgcolor: COLORS.primaryDark, boxShadow: "none" },
            }}
          >
            {actionLoading ? (
              <CircularProgress size={16} sx={{ color: "#fff" }} />
            ) : (
              "Duyệt khóa học"
            )}
          </Button>
        </Stack>
      )}

      {detail?.ghiChuTuChoi && (
        <Typography
          variant="body2"
          sx={{
            mt: 1.25,
            color: COLORS.danger,
            bgcolor: COLORS.dangerSoft,
            borderRadius: 1,
            px: 1.25,
            py: 0.75,
            display: "inline-block",
          }}
        >
          Lý do từ chối: {detail.ghiChuTuChoi}
        </Typography>
      )}
    </Box>
  );
}
