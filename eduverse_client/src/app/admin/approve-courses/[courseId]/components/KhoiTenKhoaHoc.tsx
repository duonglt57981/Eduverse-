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
import { boxSx, COLORS, FONTS } from "../../types/constants";
import StatusChip from "./StatusChip";

export default function KhoiTenKhoaHoc({
  detail,
  isChoDuyet,
  actionLoading,
  onDuyet,
  onTuChoiClick,
}: any) {
  return (
    <Box sx={{ ...boxSx, p: 2.5 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        {detail?.hinhAnhKhoaHoc && (
          <Avatar
            variant="rounded"
            src={detail.hinhAnhKhoaHoc}
            sx={{ width: 229, height: 139, borderRadius: 1.5 }} // ✅ tăng kích thước
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
                fontWeight: 600,
                fontSize: 22,
                color: COLORS.ink,
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
              sx={{ mt: 0.5, flexWrap: "wrap" }}
            >
              <Typography variant="caption" sx={{ color: COLORS.inkSoft }}>
                Giảng viên: {detail.createBy || "Không xác định"}
              </Typography>
              {detail.loaiKhoaHoc && (
                <Chip
                  label={detail.loaiKhoaHoc}
                  size="small"
                  sx={{ bgcolor: "#F1EBE8", color: COLORS.inkSoft }}
                />
              )}
              {detail.capDo && (
                <Chip
                  label={`Cấp độ: ${detail.capDo}`}
                  size="small"
                  sx={{ bgcolor: "#F1EBE8", color: COLORS.inkSoft }}
                />
              )}
              {detail.giaGoc != null && (
                <Chip
                  label={`Giá: ${detail.giaGoc.toLocaleString()} VND`}
                  size="small"
                  sx={{ bgcolor: "#F1EBE8", color: COLORS.inkSoft }}
                />
              )}
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
