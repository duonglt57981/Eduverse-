"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Card, CardActionArea } from "@mui/material";
import OndemandVideoOutlinedIcon from "@mui/icons-material/OndemandVideoOutlined";
import CheckIcon from "@mui/icons-material/Check";
import StepWrapper from "../context/StepWrapper";
import AuthGuard from "@/src/components/AuthGuard";
import { BRAND, CSSVAR } from "@/src/theme/tokens";

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
            py: { xs: 2, sm: 4 },
          }}
        >
          {/* Main Card Container */}
          <Box
            sx={{
              bgcolor: CSSVAR.paper,
              borderRadius: "20px",
              border: `1px solid ${CSSVAR.divider}`,
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.03)",
              p: { xs: 3, sm: 6 },
              width: "100%",
              maxWidth: 680,
              mx: "auto",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Header info inside the card */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.25rem", sm: "1.6rem" },
                mb: 1.5,
                color: CSSVAR.textPrimary,
              }}
            >
              Bạn muốn tạo nội dung học tập nào?
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: 13, sm: 15 },
                color: CSSVAR.textMuted,
                mb: 4,
                maxWidth: 480,
                lineHeight: 1.5,
              }}
            >
              Chọn loại nội dung phù hợp để bắt đầu xây dựng khóa học của bạn.
            </Typography>

            {/* Selection Card */}
            <Card
              variant="outlined"
              sx={{
                width: "100%",
                maxWidth: 380,
                borderRadius: "16px",
                borderColor: selected ? BRAND.main : CSSVAR.divider,
                borderWidth: selected ? 2 : 1,
                bgcolor: selected ? "#FFF1F2" : "#ffffff",
                boxShadow: selected
                  ? "0 8px 30px rgba(122, 31, 43, 0.08)"
                  : "0 2px 12px rgba(0, 0, 0, 0.01)",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                cursor: "pointer",
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(122, 31, 43, 0.08)",
                  borderColor: BRAND.main,
                },
                "&:focus-within": {
                  outline: `2px solid ${BRAND.main}`,
                  outlineOffset: "2px",
                },
              }}
              onClick={handleSelect}
            >
              <CardActionArea
                sx={{
                  p: { xs: 3, sm: 4 },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                {/* Active Checkmark Badge */}
                {selected && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      bgcolor: BRAND.main,
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 6px rgba(122,31,43,0.3)",
                    }}
                  >
                    <CheckIcon sx={{ fontSize: 13, fontWeight: "bold" }} />
                  </Box>
                )}

                <Box
                  sx={{
                    color: selected ? BRAND.main : CSSVAR.textSecondary,
                    bgcolor: selected ? "#FEE2E2" : CSSVAR.paperAlt,
                    borderRadius: "12px",
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2.5,
                    transition: "all 0.2s ease",
                  }}
                >
                  <OndemandVideoOutlinedIcon sx={{ fontSize: 40 }} />
                </Box>

                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 18,
                    mb: 1.5,
                    color: selected ? BRAND.main : CSSVAR.textPrimary,
                  }}
                >
                  Khóa học
                </Typography>

                <Typography
                  sx={{
                    fontSize: 14,
                    color: CSSVAR.textSecondary,
                    lineHeight: 1.6,
                    textAlign: "center",
                  }}
                >
                  Tạo ra những trải nghiệm học tập phong phú với sự hỗ trợ của các
                  bài giảng video, bài kiểm tra, bài tập lập trình, v.v.
                </Typography>
              </CardActionArea>
            </Card>

            {/* Informational Note at Bottom */}
            <Typography
              sx={{
                mt: 4,
                fontSize: 13,
                color: CSSVAR.textMuted,
              }}
            >
              Bạn vẫn có thể cập nhật nội dung chi tiết sau khi khóa học được khởi tạo.
            </Typography>
          </Box>
        </Box>
      </StepWrapper>
    </AuthGuard>
  );
}
