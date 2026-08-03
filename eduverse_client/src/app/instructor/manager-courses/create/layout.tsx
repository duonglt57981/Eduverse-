/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import { CourseCreateProvider } from "./context/CourseCreateContext";

// ✅ 3 Bước
const STEPS = ["Chọn loại", "Thông tin", "Danh mục"];

// Tùy chỉnh Connector nối giữa các bước
const QontoConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 14,
    left: "calc(-50% + 20px)",
    right: "calc(50% + 20px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#8B1313",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#8B1313",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: "var(--ev-divider, #ECE7E4)",
    borderTopWidth: 2,
    borderRadius: 1,
    transition: "border-color 0.2s ease",
  },
}));

// Tùy chỉnh Icon hiển thị cho từng bước
function QontoStepIcon(props: {
  active?: boolean;
  completed?: boolean;
  icon?: ReactNode;
}) {
  const { active, completed, icon } = props;

  return (
    <Box
      sx={{
        display: "flex",
        height: 30,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
      }}
    >
      {completed ? (
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            bgcolor: "#8B1313",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            boxShadow: "0 2px 6px rgba(122,31,43,0.3)",
          }}
        >
          <CheckIcon sx={{ fontSize: 16, fontWeight: "bold" }} />
        </Box>
      ) : (
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: `2px solid ${active ? "#8B1313" : "#ECE7E4"}`,
            bgcolor: active ? "#fff" : "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: active ? "#8B1313" : "#8A7676",
            fontSize: 13,
            fontWeight: 700,
            boxShadow: active ? "0 2px 8px rgba(122,31,43,0.15)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          {icon}
        </Box>
      )}
    </Box>
  );
}

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
          bgcolor: "#F8F9FB",
        }}
      >
        {/* Header */}
        <Box
          component="header"
          sx={{
            bgcolor: "var(--ev-paper, #FFFFFF)",
            borderBottom: "1px solid var(--ev-divider, #ECE7E4)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: { xs: 2, sm: 4 },
              py: 1,
            }}
          >
            {/* Left side: Logo & Step indicator */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1.5, sm: 2 },
              }}
            >
              <Image
                src="/khoahoc/1-removebg-preview.png"
                alt="EduVerse"
                width={140}
                height={50}
                style={{ objectFit: "contain" }}
                priority
              />
              <Box sx={{ width: "1px", height: 20, bgcolor: "#ECE7E4" }} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 13, sm: 15 },
                    fontWeight: 600,
                    color: "var(--ev-text-primary, #1F2937)",
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  Tạo khóa học
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: 13, sm: 15 },
                    color: "var(--ev-text-muted, #8A7676)",
                    display: { xs: "block", sm: "block" },
                  }}
                >
                  <Box
                    component="span"
                    sx={{ display: { sm: "inline", xs: "none" } }}
                  >
                    |{" "}
                  </Box>
                  Bước {currentStep + 1} / {total}
                </Typography>
              </Box>
            </Box>

            {/* Right side: Exit Button */}
            <Box
              component="button"
              onClick={handleExit}
              aria-label="Thoát luồng tạo khóa học"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                cursor: "pointer",
                bgcolor: "transparent",
                border: "none",
                py: 0.8,
                px: 1.5,
                borderRadius: "8px",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "var(--ev-paper-alt, #FBFAF9)",
                },
                "&:focus-visible": {
                  outline: "2px solid #8B1313",
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--ev-text-secondary, #4B5563)",
                }}
              >
                Thoát
              </Typography>
              <CloseIcon sx={{ fontSize: 18, color: "var(--ev-text-secondary, #4B5563)" }} />
            </Box>
          </Box>
        </Box>

        {/* Stepper Section */}
        <Box
          sx={{
            bgcolor: "var(--ev-paper, #FFFFFF)",
            borderBottom: "1px solid var(--ev-divider, #ECE7E4)",
            pt: 3,
            pb: 2.5,
          }}
        >
          <Box sx={{ maxWidth: 700, mx: "auto", px: { xs: 2, sm: 4 } }}>
            <Stepper
              activeStep={currentStep}
              alternativeLabel
              connector={<QontoConnector />}
            >
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel
                    slots={{ stepIcon: QontoStepIcon }}
                    sx={{
                      "& .MuiStepLabel-label": {
                        fontSize: { xs: 11, sm: 13 },
                        fontWeight: 500,
                        color: "var(--ev-grey, #8A7676)",
                        mt: 0.8,
                        transition: "color 0.2s ease",
                      },
                      "& .MuiStepLabel-label.Mui-active": {
                        color: "#8B1313",
                        fontWeight: 600,
                      },
                      "& .MuiStepLabel-label.Mui-completed": {
                        color: "var(--ev-text-secondary, #4B5563)",
                        fontWeight: 600,
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            px: { xs: 2, sm: 4 },
            py: { xs: 3, sm: 4 },
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 1000,
              mx: "auto",
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </CourseCreateProvider>
  );
}
