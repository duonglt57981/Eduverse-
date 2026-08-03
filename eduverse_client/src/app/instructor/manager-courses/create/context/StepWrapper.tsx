"use client";

import { ReactNode } from "react";
import { Box, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardIos";
import { BRAND } from "@/src/theme/tokens";

interface Props {
  children: ReactNode;
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  disableNext?: boolean;
  showBack?: boolean;
}

// ====== Bảng màu ======
const MAU = {
  chinh: BRAND.main,
  chinhDam: BRAND.darker,
  chinhNhat: BRAND.light,
  vien: BRAND.border,
};

export default function StepWrapper({
  children,
  onNext,
  onBack,
  nextLabel = "Tiếp tục",
  disableNext = false,
  showBack = true,
}: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100vh - 200px)",
        height: "100%",
      }}
    >
      {/* Nội dung bước */}
      <Box sx={{ flex: 1, pb: 4 }}>{children}</Box>

      {/* Thanh điều hướng sticky */}
      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          bgcolor: "#F8F9FB",
          pt: 2,
          pb: { xs: 2, sm: 3 },
          mt: "auto",
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, sm: 4 },
        }}
      >
          {showBack && onBack ? (
            <Button
              variant="outlined"
              onClick={onBack}
              startIcon={<ArrowBackIcon sx={{ fontSize: 13 }} />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "var(--ev-text-secondary, #4B5563)",
                borderColor: "var(--ev-divider, #ECE7E4)",
                px: { xs: 2.5, sm: 3 },
                py: 1.2,
                borderRadius: "10px",
                fontSize: 14,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "var(--ev-paper-alt, #FBFAF9)",
                  borderColor: "#8A7676",
                  color: "var(--ev-text-primary, #1F2937)",
                },
                "&:focus-visible": {
                  outline: "2px solid #8B1313",
                },
              }}
            >
              Quay lại
            </Button>
          ) : (
            <Box />
          )}

          <Button
            variant="contained"
            onClick={onNext}
            disabled={disableNext}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
            sx={{
              bgcolor: MAU.chinh,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 14,
              px: { xs: 3, sm: 4 },
              py: 1.2,
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(122,31,43,0.15)",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: MAU.chinhDam,
                boxShadow: "0 6px 16px rgba(122,31,43,0.25)",
                transform: "translateY(-1px)",
              },
              "&.Mui-disabled": {
                bgcolor: "#ECE7E4",
                color: "var(--ev-grey, #8A7676)",
                boxShadow: "none",
              },
              "&:focus-visible": {
                outline: "2px solid #8B1313",
              },
            }}
          >
            {nextLabel}
          </Button>
      </Box>
    </Box>
  );
}
