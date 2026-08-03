"use client";

import { useRouter } from "next/navigation";
import { Box, TextField, Typography } from "@mui/material";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import { useCourseCreate } from "../context/CourseCreateContext";
import StepWrapper from "../context/StepWrapper";
import { useState } from "react";
import AuthGuard from "@/src/components/AuthGuard";

export default function Step2Page() {
  const router = useRouter();
  const { formData, setFormData } = useCourseCreate();
  const [tieuDeError, setTieuDeError] = useState("");

  const handleChange = (value: string) => {
    if (value.length > 99) {
      setTieuDeError("Tiêu đề không được vượt quá 99 ký tự.");
    } else {
      setTieuDeError("");
    }
    setFormData({ tieuDe: value });
  };

  // ✅ Chỉ kiểm tra tiêu đề hợp lệ
  const isValid = formData.tieuDe && formData.tieuDe.trim().length > 0 && !tieuDeError;

  return (
    <AuthGuard allowedRoles={["Admin", "GiaoVien"]}>
      <StepWrapper
        onNext={() => router.push("/instructor/manager-courses/create/3")}
        onBack={() => router.push("/instructor/manager-courses/create/1")}
        disableNext={!isValid}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            width: "100%",
            alignItems: "stretch",
            py: { xs: 1, sm: 3 },
          }}
        >
          {/* Cột trái: Form đặt tên */}
          <Box
            sx={{
              flex: { xs: "1 1 auto", md: "0 0 62%" },
              bgcolor: "var(--ev-paper, #FFFFFF)",
              borderRadius: "20px",
              border: "1px solid var(--ev-divider, #ECE7E4)",
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.03)",
              p: { xs: 3, sm: 5 },
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                fontSize: { xs: "1.25rem", sm: "1.6rem" },
                color: "var(--ev-text-primary, #1F2937)",
              }}
            >
              Đặt tên cho khóa học
            </Typography>

            <Typography
              sx={{
                color: "var(--ev-text-muted, #8A7676)",
                fontSize: 14,
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              Sử dụng một tiêu đề ngắn gọn, rõ ràng và giúp học viên hiểu được nội dung chính mà khóa học của bạn sẽ mang lại.
            </Typography>

            {/* Khối Input */}
            <Box sx={{ width: "100%" }}>
              <Box
                sx={{
                  mb: 1.2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography sx={{ fontWeight: 600, fontSize: 14, color: "var(--ev-text-secondary, #4B5563)" }}>
                  Tên khóa học <Box component="span" sx={{ color: "#DC2626" }}>*</Box>
                </Typography>
                <Typography sx={{ fontSize: 12, color: "var(--ev-grey, #8A7676)", fontWeight: 500 }}>
                  {formData.tieuDe?.length || 0}/99 ký tự
                </Typography>
              </Box>

              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ví dụ: Lập trình React từ cơ bản đến nâng cao"
                value={formData.tieuDe || ""}
                onChange={(e) => handleChange(e.target.value)}
                error={!!tieuDeError}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    height: "48px",
                    fontSize: 14,
                    bgcolor: "var(--ev-paper, #FFFFFF)",
                    "& fieldset": {
                      borderColor: "var(--ev-divider, #ECE7E4)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#8B1313",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#8B1313",
                      borderWidth: 2,
                    },
                  },
                }}
              />

              {tieuDeError && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1.2 }}>
                  <ErrorOutlineIcon sx={{ fontSize: 16, color: "#DC2626" }} />
                  <Typography sx={{ fontSize: 13, color: "#DC2626", fontWeight: 500 }}>
                    {tieuDeError}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Cột phải: Mẹo đặt tên (Tips) */}
          <Box
            sx={{
              flex: { xs: "1 1 auto", md: "0 0 38%" },
              bgcolor: "var(--ev-paper, #FFFFFF)",
              borderRadius: "20px",
              border: "1px solid var(--ev-divider, #ECE7E4)",
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.03)",
              p: { xs: 3, sm: 4 },
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Box
                sx={{
                  bgcolor: "#FEF3C7",
                  color: "#D97706",
                  borderRadius: "8px",
                  p: 0.8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LightbulbOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: "var(--ev-text-primary, #1F2937)" }}>
                Mẹo đặt tên khóa học
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: 14, color: "var(--ev-text-secondary, #4B5563)", mb: 0.5 }}>
                  Nêu rõ kết quả học tập
                </Typography>
                <Typography sx={{ fontSize: 13, color: "var(--ev-text-muted, #8A7676)", lineHeight: 1.5 }}>
                  Hãy nêu bật kỹ năng hoặc mục tiêu cụ thể mà học viên sẽ có được (ví dụ: làm chủ, xây dựng dự án thực tế).
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: 14, color: "var(--ev-text-secondary, #4B5563)", mb: 0.5 }}>
                  Tránh viết hoa toàn bộ
                </Typography>
                <Typography sx={{ fontSize: 13, color: "var(--ev-text-muted, #8A7676)", lineHeight: 1.5 }}>
                  Không nên viết hoa tất cả các chữ cái (như LẬP TRÌNH REACT). Điều này giúp tiêu đề chuyên nghiệp và dễ đọc hơn.
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: 14, color: "var(--ev-text-secondary, #4B5563)", mb: 0.5 }}>
                  Ngắn gọn và trực diện
                </Typography>
                <Typography sx={{ fontSize: 13, color: "var(--ev-text-muted, #8A7676)", lineHeight: 1.5 }}>
                  Tiêu đề nên súc tích, tránh lan man, giúp người học dễ dàng nhận diện chủ đề khóa học khi lướt tìm kiếm.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </StepWrapper>
    </AuthGuard>
  );
}
