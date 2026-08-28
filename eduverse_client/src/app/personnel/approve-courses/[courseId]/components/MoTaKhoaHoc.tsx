"use client";
import { useState } from "react";
import { Box, Button, alpha } from "@mui/material";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { BRAND } from "@/src/theme/tokens";
import { FONTS } from "@/src/app/admin/approve-courses/types/constants";

export default function MoTaKhoaHoc({ html }: { html: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box>
      <Box
        sx={{
          fontFamily: FONTS.body,
          fontSize: "14px",
          lineHeight: 1.75,
          color: "#334155",
          maxHeight: expanded ? "none" : 120,
          overflow: "hidden",
          position: "relative",
          display: "flow-root",
          width: "100%",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
          transition: "max-height .25s ease",
          "& p": { m: 0, mb: 1.25 },
          "& ul, & ol": { pl: 3, m: 0, mb: 1.25 },
          "& img, & video, & iframe, & table": {
            maxWidth: "100%",
            height: "auto",
            borderRadius: "12px",
          },
          ...(!expanded && {
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 50,
              background: `linear-gradient(to bottom, ${alpha("#ffffff", 0)}, #ffffff)`,
            },
          }),
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <Button
        size="small"
        onClick={() => setExpanded((v) => !v)}
        endIcon={
          <KeyboardArrowDownRoundedIcon
            sx={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
        }
        sx={{
          textTransform: "none",
          mt: 0.75,
          color: BRAND.main,
          fontWeight: 700,
          fontSize: 13,
          "&:hover": { bgcolor: alpha(BRAND.main, 0.04) },
        }}
      >
        {expanded ? "Thu gọn mô tả" : "Xem thêm toàn bộ mô tả"}
      </Button>
    </Box>
  );
}
