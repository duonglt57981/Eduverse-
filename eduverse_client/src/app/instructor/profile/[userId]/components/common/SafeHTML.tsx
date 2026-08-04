/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/common/SafeHTML.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Box, Button } from "@mui/material";
import DOMPurify from "dompurify";

interface SafeHTMLProps {
  /** Nội dung HTML cần hiển thị */
  html: string;
  /** Số dòng hiển thị tối đa (không truyền thì hiển thị full) */
  lineClamp?: number;
  /** Số ký tự tối đa trước khi hiện nút "Xem thêm" */
  maxLength?: number;
  /** Custom styles */
  sx?: any;
  /** Class name */
  className?: string;
  /** Màu chữ */
  color?: string;
  /** Màu nút Xem thêm */
  buttonColor?: string;
  /** Cho phép expand/collapse */
  expandable?: boolean;
  /** Kích thước font */
  fontSize?: string | number;
}

export default function SafeHTML({
  html,
  lineClamp,
  maxLength = 200,
  sx,
  className,
  color,
  buttonColor = "primary.main",
  expandable = true,
  fontSize = "inherit",
}: SafeHTMLProps) {
  const [expanded, setExpanded] = useState(false);

  // Sanitize HTML để tránh XSS
  const sanitizedHtml = useMemo(() => {
    if (!html) return "";

    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "b",
        "i",
        "u",
        "em",
        "strong",
        "ul",
        "ol",
        "li",
        "span",
        "div",
        "a",
        "img",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "blockquote",
        "pre",
        "code",
        "table",
        "thead",
        "tbody",
        "tr",
        "td",
        "th",
        "hr",
      ],
      ALLOWED_ATTR: [
        "href",
        "target",
        "rel",
        "src",
        "alt",
        "class",
        "style",
        "width",
        "height",
        "colspan",
        "rowspan",
      ],
      ADD_ATTR: ["target"],
    });
  }, [html]);

  // CSS chung cho các thẻ HTML
  const htmlStyles = {
    fontSize: fontSize,
    fontFamily: "var(--font-primary, var(--ev-font-family, 'Be Vietnam Pro', sans-serif))",
    "& p": { margin: "0 0 0.5rem 0" },
    "& ul, & ol": { paddingLeft: "1.5rem", margin: "0 0 0.5rem 0" },
    "& li": { marginBottom: "0.25rem" },
    "& h1, & h2, & h3, & h4, & h5, & h6": {
      margin: "0.5rem 0 0.25rem 0",
      fontWeight: 600,
    },
    "& blockquote": {
      borderLeft: "3px solid",
      borderColor: "primary.main",
      paddingLeft: "1rem",
      margin: "0.5rem 0",
      fontStyle: "italic",
    },
    "& pre": {
      backgroundColor: "rgba(0,0,0,0.06)",
      padding: "0.75rem",
      borderRadius: "4px",
      overflowX: "auto",
      fontSize: "0.875rem",
      fontFamily: "monospace",
    },
    "& code": {
      backgroundColor: "rgba(0,0,0,0.06)",
      padding: "0.1rem 0.3rem",
      borderRadius: "3px",
      fontSize: "0.875rem",
      fontFamily: "monospace",
    },
    "& a": {
      color: buttonColor,
      textDecoration: "none",
      "&:hover": { textDecoration: "underline" },
    },
    "& img": {
      maxWidth: "100%",
      height: "auto",
      borderRadius: "4px",
    },
    "& table": {
      width: "100%",
      borderCollapse: "collapse",
      margin: "0.5rem 0",
    },
    "& th, & td": {
      border: "1px solid rgba(0,0,0,0.12)",
      padding: "0.5rem",
      textAlign: "left",
    },
    "& th": {
      backgroundColor: "rgba(0,0,0,0.04)",
      fontWeight: 600,
    },
    "& hr": {
      border: "none",
      borderTop: "1px solid rgba(0,0,0,0.12)",
      margin: "0.5rem 0",
    },
  };

  if (!html || !sanitizedHtml) return null;

  // Tính độ dài text thuần
  const plainText = html.replace(/<[^>]*>/g, "");
  const shouldTruncate = expandable && plainText.length > maxLength;

  // Nếu không cần cắt hoặc không expandable, hiển thị toàn bộ
  if (!shouldTruncate) {
    return (
      <Box
        className={className}
        sx={{
          ...sx,
          ...htmlStyles,
          ...(lineClamp && {
            display: "-webkit-box",
            WebkitLineClamp: lineClamp,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }),
          color: color || "inherit",
        }}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  // Hiển thị với nút xem thêm/thu gọn
  return (
    <Box className={className} sx={{ ...sx, color: color || "inherit" }}>
      <Box
        sx={{
          ...htmlStyles,
          display: "-webkit-box",
          WebkitLineClamp: expanded ? "unset" : 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          wordBreak: "break-word",
        }}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
      <Button
        size="small"
        onClick={() => setExpanded(!expanded)}
        sx={{
          mt: 1,
          color: buttonColor,
          textTransform: "none",
          fontWeight: 700,
          fontSize: "0.875rem",
          p: 0,
          minWidth: "auto",
          "&:hover": {
            bgcolor: "transparent",
            textDecoration: "underline",
          },
        }}
      >
        {expanded ? "Thu gọn" : "Xem thêm"}
      </Button>
    </Box>
  );
}
