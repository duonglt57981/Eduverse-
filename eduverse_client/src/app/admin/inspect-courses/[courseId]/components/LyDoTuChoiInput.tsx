/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
  alpha,
  Typography,
} from "@mui/material";
import FormatBoldRoundedIcon from "@mui/icons-material/FormatBoldRounded";
import FormatItalicRoundedIcon from "@mui/icons-material/FormatItalicRounded";
import FormatUnderlinedRoundedIcon from "@mui/icons-material/FormatUnderlinedRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import { COLORS } from "@/src/app/admin/approve-courses/types/constants";

interface LyDoTuChoiInputProps {
  idDoiTuong: string | number;
  loaiDoiTuong: "BaiGiang" | "BaiKiemTra" | "TaiLieu";
  initialValue?: string;
  onSave: (lyDo: string) => Promise<void>;
  disabled?: boolean;
}

const FORMAT_BUTTONS: {
  command: string;
  icon: React.ElementType;
  label: string;
}[] = [
  { command: "bold", icon: FormatBoldRoundedIcon, label: "In đậm" },
  { command: "italic", icon: FormatItalicRoundedIcon, label: "In nghiêng" },
  {
    command: "underline",
    icon: FormatUnderlinedRoundedIcon,
    label: "Gạch chân",
  },
  {
    command: "insertUnorderedList",
    icon: FormatListBulletedRoundedIcon,
    label: "Danh sách",
  },
];

const isHtmlEmpty = (html: string) =>
  !html || html.replace(/<[^>]*>/g, "").trim().length === 0;

const safeAlpha = (color: string, opacity: number) => {
  if (typeof color === "string" && color.trim().startsWith("var(")) {
    return `color-mix(in srgb, ${color} ${Math.round(opacity * 100)}%, transparent)`;
  }
  return alpha(color, opacity);
};

export default function LyDoTuChoiInput({
  idDoiTuong,
  loaiDoiTuong: _loaiDoiTuong,
  initialValue = "",
  onSave,
  disabled = false,
}: LyDoTuChoiInputProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [lyDo, setLyDo] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  useEffect(() => {
    setLyDo(initialValue || "");
    if (editorRef.current) {
      editorRef.current.innerHTML = initialValue || "";
    }
    setStatus("idle");
  }, [initialValue, idDoiTuong]);

  const handleInput = () => {
    if (editorRef.current) {
      setLyDo(editorRef.current.innerHTML);
    }
  };

  const applyFormat = (command: string) => {
    if (disabled || loading) return;
    editorRef.current?.focus();
    document.execCommand(command);
    if (editorRef.current) {
      setLyDo(editorRef.current.innerHTML);
    }
  };

  const handleSave = async () => {
    if (isHtmlEmpty(lyDo)) {
      setStatus("error");
      return;
    }
    setLoading(true);
    setStatus("saving");
    try {
      await onSave(lyDo);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      console.error("Lỗi lưu lý do:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        border: `1px solid ${safeAlpha(COLORS.primary, 0.2)}`,
        borderRadius: 2,
        bgcolor: safeAlpha(COLORS.primary, 0.03),
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 600, mb: 1, color: COLORS.ink }}
      >
        Ghi chú
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          mb: 0.75,
          p: 0.5,
          borderRadius: 1.5,
          bgcolor: "var(--ev-paper, #FFFFFF)",
          border: `1px solid ${safeAlpha(COLORS.primary, 0.15)}`,
          width: "fit-content",
        }}
      >
        {FORMAT_BUTTONS.map(({ command, icon: Icon, label }, idx) => (
          <Box key={command} sx={{ display: "flex", alignItems: "center" }}>
            {idx === FORMAT_BUTTONS.length - 1 && (
              <Divider
                orientation="vertical"
                flexItem
                sx={{ mx: 0.25, height: 20, alignSelf: "center" }}
              />
            )}
            <Tooltip title={label}>
              <span>
                <IconButton
                  size="small"
                  disabled={disabled || loading}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyFormat(command)}
                  sx={{
                    color: COLORS.primary,
                    "&:hover": { bgcolor: safeAlpha(COLORS.primary, 0.08) },
                  }}
                >
                  <Icon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        ))}
      </Box>

      <Box
        ref={editorRef}
        contentEditable={!disabled && !loading}
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder="Nhập lý do từ chối cho nội dung này..."
        sx={{
          minHeight: 72,
          maxHeight: 240,
          overflowY: "auto",
          p: 1.25,
          fontSize: 14,
          lineHeight: 1.6,
          color: COLORS.ink,
          bgcolor: "var(--ev-paper, #FFFFFF)",
          border: `1px solid ${safeAlpha(COLORS.primary, 0.25)}`,
          borderRadius: 1.5,
          outline: "none",
          cursor: disabled || loading ? "not-allowed" : "text",
          opacity: disabled || loading ? 0.6 : 1,
          "&:focus": {
            borderColor: COLORS.primary,
            boxShadow: `0 0 0 2px ${safeAlpha(COLORS.primary, 0.12)}`,
          },
          "&:empty:before": {
            content: "attr(data-placeholder)",
            color: safeAlpha(COLORS.ink, 0.4),
          },
          "& ul, & ol": { pl: 3, m: 0 },
          "& p": { m: 0 },
        }}
      />

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
        {status === "saving" && (
          <>
            <CircularProgress size={16} sx={{ color: COLORS.primary }} />
            <Typography variant="caption" sx={{ color: COLORS.inkSoft }}>
              Đang lưu...
            </Typography>
          </>
        )}
        {status === "saved" && (
          <Typography variant="caption" sx={{ color: COLORS.success }}>
            ✓ Đã lưu
          </Typography>
        )}
        {status === "error" && (
          <Typography variant="caption" sx={{ color: COLORS.danger }}>
            ✗ Lỗi lưu, thử lại
          </Typography>
        )}
        <Button
          size="small"
          variant="outlined"
          onClick={handleSave}
          disabled={isHtmlEmpty(lyDo) || loading || disabled}
          sx={{
            textTransform: "none",
            ml: "auto",
            borderColor: COLORS.primary,
            color: COLORS.primary,
            "&:hover": { bgcolor: safeAlpha(COLORS.primary, 0.04) },
          }}
        >
          Lưu lý do
        </Button>
      </Box>
    </Box>
  );
}
