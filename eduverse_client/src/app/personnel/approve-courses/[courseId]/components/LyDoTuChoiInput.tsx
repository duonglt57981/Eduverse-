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
  Stack,
} from "@mui/material";
import FormatBoldRoundedIcon from "@mui/icons-material/FormatBoldRounded";
import FormatItalicRoundedIcon from "@mui/icons-material/FormatItalicRounded";
import FormatUnderlinedRoundedIcon from "@mui/icons-material/FormatUnderlinedRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import { BRAND, CSSVAR } from "@/src/theme/tokens";

interface LyDoTuChoiInputProps {
  idDoiTuong: string | number;
  loaiDoiTuong: "BaiGiang" | "BaiKiemTra";
  initialValue?: string;
  onSave: (lyDo: string) => Promise<void>;
  disabled?: boolean;
  /** Ghi chú phụ hiển thị dưới tiêu đề, dùng để báo cho người duyệt biết
   * ô này đang dùng chung cho bài giảng và các tài liệu con của nó. */
  scopeNote?: string;
}

const FORMAT_BUTTONS: {
  command: string;
  icon: React.ElementType;
  label: string;
}[] = [
  { command: "bold", icon: FormatBoldRoundedIcon, label: "In đậm (Ctrl+B)" },
  { command: "italic", icon: FormatItalicRoundedIcon, label: "In nghiêng (Ctrl+I)" },
  {
    command: "underline",
    icon: FormatUnderlinedRoundedIcon,
    label: "Gạch chân (Ctrl+U)",
  },
  {
    command: "insertUnorderedList",
    icon: FormatListBulletedRoundedIcon,
    label: "Danh sách gạch đầu dòng",
  },
];

const isHtmlEmpty = (html: string) =>
  !html || html.replace(/<[^>]*>/g, "").trim().length === 0;

export default function LyDoTuChoiInput({
  idDoiTuong,
  loaiDoiTuong: _loaiDoiTuong,
  initialValue = "",
  onSave,
  disabled = false,
  scopeNote,
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
      setTimeout(() => setStatus("idle"), 2500);
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
        mt: 2.5,
        p: 2.5,
        borderRadius: "16px",
        bgcolor: "#FFFDFD",
        border: "1px solid #FECACA",
        boxShadow: "0 2px 12px rgba(220, 38, 38, 0.03)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: scopeNote ? 0.5 : 1.25,
        }}
      >
        <RateReviewRoundedIcon sx={{ color: BRAND.main, fontSize: 18 }} />
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: 14,
            color: "#0F172A",
          }}
        >
          Ghi chú & Yêu cầu chỉnh sửa cho mục này
        </Typography>
      </Box>

      {scopeNote && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mb: 1.5,
            color: "#64748B",
            fontSize: 12,
          }}
        >
          💡 {scopeNote}
        </Typography>
      )}

      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          mb: 1,
          p: 0.5,
          borderRadius: "10px",
          bgcolor: "#F8FAFC",
          border: "1px solid #E2E8F0",
          width: "fit-content",
        }}
      >
        {FORMAT_BUTTONS.map(({ command, icon: Icon, label }, idx) => (
          <Box key={command} sx={{ display: "flex", alignItems: "center" }}>
            {idx === FORMAT_BUTTONS.length - 1 && (
              <Divider
                orientation="vertical"
                flexItem
                sx={{ mx: 0.5, height: 18, alignSelf: "center" }}
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
                    color: "#475569",
                    borderRadius: "6px",
                    p: 0.6,
                    "&:hover": {
                      bgcolor: alpha(BRAND.main, 0.08),
                      color: BRAND.main,
                    },
                  }}
                >
                  <Icon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        ))}
      </Box>

      {/* Rich Input Editor */}
      <Box
        ref={editorRef}
        contentEditable={!disabled && !loading}
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder="Nhập chi tiết yêu cầu giảng viên cần sửa đổi hoặc lý do từ chối mục này..."
        sx={{
          minHeight: 80,
          maxHeight: 240,
          overflowY: "auto",
          p: 1.5,
          fontSize: 13.5,
          lineHeight: 1.6,
          color: "#0F172A",
          bgcolor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "10px",
          outline: "none",
          cursor: disabled || loading ? "not-allowed" : "text",
          opacity: disabled || loading ? 0.6 : 1,
          transition: "all 0.15s ease",
          "&:focus": {
            borderColor: BRAND.main,
            boxShadow: `0 0 0 3px ${alpha(BRAND.main, 0.1)}`,
          },
          "&:empty:before": {
            content: "attr(data-placeholder)",
            color: "#94A3B8",
          },
          "& ul, & ol": { pl: 3, m: 0 },
          "& p": { m: 0 },
        }}
      />

      {/* Action Footer */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {status === "saving" && (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <CircularProgress size={14} sx={{ color: BRAND.main }} />
              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                Đang lưu ghi chú...
              </Typography>
            </Stack>
          )}
          {status === "saved" && (
            <Stack direction="row" spacing={0.6} sx={{ alignItems: "center" }}>
              <CheckCircleRoundedIcon sx={{ color: "#16A34A", fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: "#16A34A", fontWeight: 700 }}>
                Đã lưu ghi chú thành công
              </Typography>
            </Stack>
          )}
          {status === "error" && (
            <Stack direction="row" spacing={0.6} sx={{ alignItems: "center" }}>
              <ErrorOutlineRoundedIcon sx={{ color: "#DC2626", fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: "#DC2626", fontWeight: 700 }}>
                Vui lòng nhập nội dung trước khi lưu
              </Typography>
            </Stack>
          )}
        </Box>

        <Button
          size="small"
          variant="contained"
          onClick={handleSave}
          disabled={isHtmlEmpty(lyDo) || loading || disabled}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            fontSize: 13,
            bgcolor: BRAND.main,
            borderRadius: "8px",
            px: 2,
            py: 0.6,
            boxShadow: `0 2px 8px ${alpha(BRAND.main, 0.2)}`,
            "&:hover": {
              bgcolor: BRAND.dark,
              boxShadow: `0 4px 12px ${alpha(BRAND.main, 0.3)}`,
            },
          }}
        >
          Lưu ghi chú
        </Button>
      </Box>
    </Box>
  );
}
