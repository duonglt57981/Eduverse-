"use client";

import { ReactNode } from "react";
import { Box, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardIos";

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
  chinh: "#8B1313",
  chinhDam: "#611722",
  chinhNhat: "#F8ECEE",
  vien: "#EFE0E2",
  disabledBg: "#F3D9DC",
  disabledText: "#B98890",
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
        minHeight: "calc(100vh - 180px)",
        height: "100%",
      }}
    >
      {/* Nội dung bước */}
      <Box sx={{ flex: 1 }}>{children}</Box>

      {/* Thanh điều hướng */}
      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          mt: 4,
          pt: 2.5,
          pb: 2,
          borderTop: `1px solid ${MAU.vien}`,
          display: "flex",
          alignItems: "center",
          justifyContent: showBack && onBack ? "space-between" : "flex-end",
          gap: 2,
          bgcolor: "#ffffff",
        }}
      >
        {showBack && onBack ? (
          <Button
            variant="text"
            onClick={onBack}
            startIcon={<ArrowBackIcon sx={{ fontSize: 14 }} />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: MAU.chinh,
              px: 2,
              py: 1,
              borderRadius: "10px",
              "&:hover": { bgcolor: MAU.chinhNhat },
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
          endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
          sx={{
            bgcolor: MAU.chinh,
            textTransform: "none",
            fontWeight: 700,
            fontSize: 15,
            px: 4,
            py: 1.2,
            borderRadius: "12px",
            boxShadow: `0 8px 18px rgba(122,31,43,0.28)`,
            transition: "all .18s ease",
            "&:hover": {
              bgcolor: MAU.chinhDam,
              boxShadow: `0 10px 22px rgba(122,31,43,0.35)`,
              transform: "translateY(-1px)",
            },
            "&.Mui-disabled": {
              bgcolor: MAU.disabledBg,
              color: MAU.disabledText,
              boxShadow: "none",
            },
          }}
        >
          {nextLabel}
        </Button>
      </Box>
    </Box>
  );
}
