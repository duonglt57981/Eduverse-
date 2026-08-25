// src/components/EduverseDeals/EduverseDealsToggle.tsx
"use client";

import { Box, Switch, Typography } from "@mui/material";
import { EduverseDealsLabel } from "./EduverseDealsInfo";
import { BRAND } from "@/src/theme/tokens";

interface EduverseDealsToggleProps {
  checked: boolean; // true = khóa học đang tham gia chương trình
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

// ── Component thuần UI — chỉ hiển thị trạng thái + emit sự kiện đổi.
// Việc gọi API lưu lựa chọn do trang cha xử lý, để component này tái
// dùng được ở nhiều chỗ (trang sửa khóa học đơn lẻ, danh sách khóa học
// của giảng viên...) mà không phụ thuộc 1 endpoint cụ thể. ──
export function EduverseDealsToggle({
  checked,
  onChange,
  disabled,
}: EduverseDealsToggleProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        p: 1.5,
        borderRadius: "10px",
        border: `1px solid ${checked ? `${BRAND.main}40` : "rgba(0,0,0,0.1)"}`,
        bgcolor: checked ? `${BRAND.main}08` : "transparent",
        transition: "all 150ms ease",
      }}
    >
      <Box>
        <EduverseDealsLabel />
        <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.3 }}>
          {checked
            ? "Khóa học này đang tham gia chương trình ưu đãi."
            : "Khóa học này chưa tham gia chương trình ưu đãi."}
        </Typography>
      </Box>
      <Switch
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        sx={{
          "& .MuiSwitch-switchBase.Mui-checked": { color: BRAND.main },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            bgcolor: BRAND.main,
          },
        }}
      />
    </Box>
  );
}
