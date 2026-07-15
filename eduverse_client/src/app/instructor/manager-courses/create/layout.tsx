"use client";

import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import { CourseCreateProvider } from "./context/CourseCreateContext";

// ✅ Chỉ còn 3 bước
const STEPS = ["Chọn loại", "Thông tin", "Danh mục"];

export default function CreateLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentStep = parseInt(pathname.split("/").pop() || "1", 10) - 1;
  const total = STEPS.length;

  const handleExit = () => router.push("/instructor/manager-courses");

  return (
    <CourseCreateProvider>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#fff",
        }}
      >
        {/* Header */}
        <Box sx={{ borderBottom: "1px solid #eee" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 3,
              py: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Image
                src="/khoahoc/1-removebg-preview.png"
                alt="EduVerse"
                width={180}
                height={60}
                style={{ objectFit: "contain" }}
                priority
              />
              <Box sx={{ width: "1px", height: 20, bgcolor: "#ddd" }} />
              <Typography sx={{ fontSize: 14, color: "#333" }}>
                Bước {currentStep + 1} trong {total}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                cursor: "pointer",
              }}
              onClick={handleExit}
            >
              <Typography sx={{ fontSize: 14, color: "#666" }}>
                Thoát
              </Typography>
              <IconButton size="small" sx={{ color: "#666" }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={((currentStep + 1) / total) * 100}
            sx={{
              height: 3,
              "& .MuiLinearProgress-bar": { bgcolor: "#8B1313" },
              bgcolor: "#f2d9db",
            }}
          />
        </Box>

        {/* Stepper */}
        <Box sx={{ px: 4, py: 3 }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Nội dung chính */}
        <Box sx={{ flex: 1, px: 4, py: 2 }}>{children}</Box>
      </Box>
    </CourseCreateProvider>
  );
}
