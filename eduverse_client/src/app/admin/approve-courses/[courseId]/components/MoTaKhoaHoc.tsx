"use client";
import { useState } from "react";
import { Box, Button, alpha } from "@mui/material";
import { COLORS, FONTS } from "@/src/app/admin/approve-courses/types/constants";

export default function MoTaKhoaHoc({ html }: { html: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box>
      <Box
        sx={{
          fontFamily: FONTS.body,
          fontSize: "14px",
          lineHeight: 1.75,
          color: COLORS.inkSoft,
          maxHeight: expanded ? "none" : 120,
          overflow: "hidden",
          position: "relative",
          // Establish a new block-formatting context so floated/absolute
          // content inside the rich-text HTML (images, captions, etc. from
          // a WYSIWYG editor) is always contained by this box instead of
          // "leaking" out and overlapping the sections rendered after it
          // (video/tài liệu viewer below).
          display: "flow-root",
          width: "100%",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
          transition: "max-height .2s ease",
          "& p": { m: 0, mb: 1 },
          "& ul": { pl: 3, m: 0, mb: 1 },
          // Any media embedded directly in the description content must
          // never be wider/taller than its container.
          "& img, & video, & iframe, & table": {
            maxWidth: "100%",
            height: "auto",
          },
          ...(!expanded && {
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 40,
              background: `linear-gradient(to bottom, ${alpha("#ffffff", 0)}, #ffffff)`,
            },
          }),
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <Button
        size="small"
        onClick={() => setExpanded((v) => !v)}
        sx={{
          textTransform: "none",
          mt: 0.5,
          px: 0,
          minWidth: 0,
          color: COLORS.primary,
          fontWeight: 600,
          "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
        }}
      >
        {expanded ? "Thu gọn" : "Xem thêm"}
      </Button>
    </Box>
  );
}
