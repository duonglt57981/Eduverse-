"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Stack, TextField, Button, Typography } from "@mui/material";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";

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
        border: "1px solid #FECACA",
        borderRadius: "16px",
        bgcolor: "#FEF2F2",
        p: 2.5,
        boxShadow: "0 4px 16px rgba(220, 38, 38, 0.05)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <HighlightOffRoundedIcon sx={{ color: "#DC2626", fontSize: 20 }} />
        <Typography sx={{ fontWeight: 800, fontSize: 15, color: "#991B1B" }}>
          Nhập lý do từ chối toàn bộ khóa học
        </Typography>
      </Box>

      <Typography
        variant="caption"
        sx={{ display: "block", color: "#B91C1C", mb: 1.5, fontSize: 12.5 }}
      >
        Lý do này sẽ được gửi thông báo đến giảng viên để họ biết cần bổ sung hoặc
        sửa đổi những nội dung gì.
      </Typography>

      <TextField
        multiline
        minRows={3}
        fullWidth
        autoFocus
        value={ghiChu}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ví dụ: Khóa học thiếu bài kiểm tra tổng kết, một số video có chất lượng âm thanh chưa rõ..."
        size="small"
        sx={{
          bgcolor: "#FFFFFF",
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            fontSize: 13.5,
            "& fieldset": { borderColor: "#FECACA" },
            "&:hover fieldset": { borderColor: "#F87171" },
            "&.Mui-focused fieldset": {
              borderColor: "#DC2626",
              borderWidth: 1.5,
            },
          },
        }}
      />

      <Stack
        direction="row"
        spacing={1.5}
        sx={{ mt: 2, justifyContent: "flex-end" }}
      >
        <Button
          size="small"
          onClick={onCancel}
          sx={{
            textTransform: "none",
            color: "#64748B",
            fontWeight: 600,
            px: 2,
            "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
          }}
        >
          Hủy bỏ
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={onConfirm}
          disabled={!ghiChu.trim() || actionLoading}
          sx={{
            textTransform: "none",
            fontWeight: 800,
            bgcolor: "#DC2626",
            borderRadius: "8px",
            px: 2.5,
            py: 0.7,
            boxShadow: "0 2px 8px rgba(220, 38, 38, 0.25)",
            "&:hover": {
              bgcolor: "#B91C1C",
              boxShadow: "0 4px 14px rgba(220, 38, 38, 0.35)",
            },
          }}
        >
          Xác nhận từ chối khóa học
        </Button>
      </Stack>
    </Box>
  );
}
