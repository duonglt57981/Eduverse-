"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Stack, TextField, Button, alpha } from "@mui/material";
import { COLORS } from "@/src/app/admin/approve-courses/types/constants";
import { CSSVAR } from "@/src/theme/tokens";

export default function KhoiTuChoiForm({
  ghiChu,
  onChange,
  onCancel,
  onConfirm,
  actionLoading,
}: any) {
  return (
    <Box
      sx={{
        border: `1px solid ${alpha(COLORS.danger, 0.3)}`,
        borderRadius: 2,
        bgcolor: COLORS.dangerSoft,
        p: 2,
      }}
    >
      <TextField
        label="Lý do từ chối"
        multiline
        minRows={2}
        fullWidth
        autoFocus
        value={ghiChu}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nhập lý do để giảng viên chỉnh sửa lại..."
        size="small"
        sx={{ bgcolor: CSSVAR.paper, borderRadius: 1 }}
      />
      <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
        <Button
          size="small"
          onClick={onCancel}
          sx={{ textTransform: "none", color: COLORS.inkSoft }}
        >
          Hủy
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={onConfirm}
          disabled={!ghiChu.trim() || actionLoading}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            bgcolor: COLORS.danger,
            "&:hover": { bgcolor: "#8F2E24" },
          }}
        >
          Xác nhận từ chối
        </Button>
      </Stack>
    </Box>
  );
}
