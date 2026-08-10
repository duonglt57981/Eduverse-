"use client";

import { Box, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import { coLyDoTuChoi, LyDoTuChoiDto } from "./courseEditCore";

interface Props {
  // Object lyDoTuChois trả về từ API cho 1 bài giảng hoặc 1 bài kiểm tra
  lyDoTuChoi?: LyDoTuChoiDto | null;
}

// Đặt component này ngay dưới mỗi item bài giảng / bài kiểm tra trong danh sách curriculum.
// Ví dụ dùng trong CurriculumContent.tsx:
//   <BaiGiangItem ... />
//   <LyDoTuChoiInline lyDoTuChoi={baiGiang.lyDoTuChois} />
export default function LyDoTuChoiInline({ lyDoTuChoi }: Props) {
  if (!coLyDoTuChoi(lyDoTuChoi)) return null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1,
        mt: 0.75,
        mb: 0.5,
        mx: 0.5,
        px: 1.4,
        py: 0.9,
        borderRadius: "8px",
        bgcolor: "#FEF2F2",
        border: "1px solid #FEE2E2",
      }}
    >
      <ErrorOutlineIcon
        sx={{ fontSize: 16, color: "#DC2626", flexShrink: 0, mt: "1px" }}
      />
      <Typography
        sx={{
          fontSize: 12.5,
          color: "#B91C1C",
          fontWeight: 600,
          whiteSpace: "pre-wrap",
        }}
      >
        {lyDoTuChoi?.lyDo}
      </Typography>
    </Box>
  );
}
