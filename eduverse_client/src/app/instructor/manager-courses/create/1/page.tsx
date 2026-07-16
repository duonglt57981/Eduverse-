"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Card, CardActionArea } from "@mui/material";
import OndemandVideoOutlinedIcon from "@mui/icons-material/OndemandVideoOutlined";
import StepWrapper from "../context/StepWrapper";
import AuthGuard from "@/src/components/AuthGuard";

export default function Step1Page() {
  const router = useRouter();
  const [selected, setSelected] = useState(false);

  const handleNext = () => {
    if (selected) {
      router.push("/instructor/manager-courses/create/2");
    }
  };

  const handleSelect = () => {
    setSelected(true);
  };

  return (
    <AuthGuard allowedRoles={["Admin", "GiaoVien"]}>
      <StepWrapper onNext={handleNext} showBack={false} disableNext={!selected}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: 700,
            mx: "auto",
            textAlign: "center",
            py: { xs: 2, sm: 4 },
          }}
        >
          {/* Tiêu đề */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.25rem", sm: "1.75rem" },
              mb: 4,
              color: "#1A1A1A",
            }}
          >
            Trước tiên, hãy cùng tìm hiểu xem bạn đang tạo ra loại khóa học nào.
          </Typography>

          {/* Card - Khóa học */}
          <Card
            variant="outlined"
            sx={{
              width: "100%",
              maxWidth: 400,
              borderRadius: 3,
              borderColor: selected ? "#8B1313" : "#e0e0e0",
              borderWidth: selected ? 2 : 1,
              bgcolor: selected ? "#fdf2f3" : "#ffffff",
              boxShadow: selected
                ? "0 8px 32px rgba(122, 31, 43, 0.12)"
                : "0 2px 12px rgba(0,0,0,0.04)",
              transition: "all 0.25s ease",
              cursor: "pointer",
              "&:hover": {
                boxShadow: "0 8px 32px rgba(122, 31, 43, 0.12)",
                transform: "translateY(-4px)",
                borderColor: selected ? "#8B1313" : "#b0b0b0",
              },
            }}
            onClick={handleSelect}
          >
            <CardActionArea
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  color: selected ? "#8B1313" : "#666",
                  fontSize: 48,
                  mb: 2,
                }}
              >
                <OndemandVideoOutlinedIcon sx={{ fontSize: 48 }} />
              </Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 20,
                  mb: 1.5,
                  color: selected ? "#8B1313" : "#1A1A1A",
                }}
              >
                Khóa học
              </Typography>
              <Typography
                sx={{
                  fontSize: 14,
                  color: "#4a4a4a",
                  lineHeight: 1.6,
                  maxWidth: 300,
                }}
              >
                Tạo ra những trải nghiệm học tập phong phú với sự hỗ trợ của các
                bài giảng video, bài kiểm tra, bài tập lập trình, v.v.
              </Typography>
            </CardActionArea>
          </Card>

          {/* Ghi chú phụ */}
          <Typography
            sx={{
              mt: 4,
              fontSize: 13,
              color: "#7B8794",
            }}
          >
            Bạn có thể thay đổi loại khóa học sau nếu cần.
          </Typography>
        </Box>
      </StepWrapper>
    </AuthGuard>
  );
}
