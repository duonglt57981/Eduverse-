"use client";

import { useRouter } from "next/navigation";
import { Box, TextField, Typography, Paper } from "@mui/material";
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
  const isValid = formData.tieuDe && formData.tieuDe.length > 0 && !tieuDeError;

  return (
    <AuthGuard>
      <StepWrapper
        onNext={() => router.push("/instructor/manager-courses/create/3")}
        onBack={() => router.push("/instructor/manager-courses/create/1")}
        disableNext={!isValid}
      >
        <Box
          sx={{
            maxWidth: 760,
            mx: "auto",
            py: 2,
            px: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              textAlign: "center",
              mb: 1,
              fontSize: { xs: "1.15rem", sm: "1.4rem", md: "1.6rem" },
              color: "#1A1A1A",
            }}
          >
            Đặt tên cho khóa học của bạn
          </Typography>

          <Typography
            sx={{
              textAlign: "center",
              color: "#7B8794",
              fontSize: 14,
              mb: 4,
              maxWidth: 480,
            }}
          >
            Hãy chọn một tiêu đề ngắn gọn, dễ hiểu và thu hút người học.
          </Typography>

          <Paper
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 600,
              border: "1px solid #e0e0e0",
              borderRadius: 3,
              overflow: "hidden",
              bgcolor: "#ffffff",
            }}
          >
            {/* Trường Tiêu đề */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 2,
                py: 1,
                bgcolor: "#ffffff",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 500,
                  color: "#333",
                  minWidth: 80,
                  fontSize: 14,
                }}
              >
                Tiêu đề
              </Typography>
              <TextField
                fullWidth
                variant="standard"
                placeholder="Nhập tiêu đề khóa học..."
                value={formData.tieuDe || ""}
                onChange={(e) => handleChange(e.target.value)}
                error={!!tieuDeError}
                helperText={tieuDeError}
                sx={{
                  "& .MuiInputBase-input": {
                    color: "#1A1A1A !important",
                    fontSize: 14,
                    padding: "8px 0",
                  },
                  "& .MuiInputBase-root": {
                    backgroundColor: "transparent !important",
                  },
                  "& .MuiInput-underline:before": {
                    display: "none",
                  },
                  "& .MuiInput-underline:after": {
                    display: "none",
                  },
                }}
              />
            </Box>
          </Paper>
        </Box>
      </StepWrapper>
    </AuthGuard>
  );
}
