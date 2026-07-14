/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/instructor/manager-courses/components/RichTextEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { Box, Typography, IconButton, Stack, Tooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { COLORS  } from "../../../admin/approve-courses/types/constants";
const R = COLORS.primary;
//R cua instructor ko ton tai nen toi dung mau cua admin
// Icons
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatStrikethroughIcon from "@mui/icons-material/FormatStrikethrough";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import CodeIcon from "@mui/icons-material/Code";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import LinkIcon from "@mui/icons-material/Link";
import FormatClearIcon from "@mui/icons-material/FormatClear";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import Looks3Icon from "@mui/icons-material/Looks3";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  readOnly?: boolean;
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isActive = (name: string, attrs?: any) => {
    if (attrs) {
      return editor.isActive(name, attrs);
    }
    return editor.isActive(name);
  };

  const toggleHeading = (level: number) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const isHeadingActive = (level: number) => {
    return editor.isActive("heading", { level });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 0.5,
        p: 1,
        borderBottom: `1px solid ${alpha(R, 0.2)}`,
        bgcolor: alpha(R, 0.02),
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
      }}
    >
      <Stack
        direction="row"
        spacing={0.5}
        sx={{ flexWrap: "wrap", alignItems: "center" }}
      >
        {/* Undo/Redo */}
        <Tooltip title="Hoàn tác">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().undo().run()}
            sx={{
              color: "#555",
              "&:hover": { bgcolor: alpha(R, 0.05) },
            }}
          >
            <UndoIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Làm lại">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().redo().run()}
            sx={{
              color: "#555",
              "&:hover": { bgcolor: alpha(R, 0.05) },
            }}
          >
            <RedoIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Box sx={{ width: 1, height: 24, bgcolor: alpha(R, 0.1), mx: 0.5 }} />

        {/* Headings */}
        <Tooltip title="Tiêu đề 1">
          <IconButton
            size="small"
            onClick={() => toggleHeading(1)}
            sx={{
              color: isHeadingActive(1) ? R : "#555",
              bgcolor: isHeadingActive(1) ? alpha(R, 0.1) : "transparent",
              "&:hover": { bgcolor: alpha(R, 0.05) },
            }}
          >
            <LooksOneIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Tiêu đề 2">
          <IconButton
            size="small"
            onClick={() => toggleHeading(2)}
            sx={{
              color: isHeadingActive(2) ? R : "#555",
              bgcolor: isHeadingActive(2) ? alpha(R, 0.1) : "transparent",
              "&:hover": { bgcolor: alpha(R, 0.05) },
            }}
          >
            <LooksTwoIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Tiêu đề 3">
          <IconButton
            size="small"
            onClick={() => toggleHeading(3)}
            sx={{
              color: isHeadingActive(3) ? R : "#555",
              bgcolor: isHeadingActive(3) ? alpha(R, 0.1) : "transparent",
              "&:hover": { bgcolor: alpha(R, 0.05) },
            }}
          >
            <Looks3Icon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Box sx={{ width: 1, height: 24, bgcolor: alpha(R, 0.1), mx: 0.5 }} />

        {/* Text formatting */}
        <Tooltip title="Đậm">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBold().run()}
            sx={{
              color: isActive("bold") ? R : "#555",
              bgcolor: isActive("bold") ? alpha(R, 0.1) : "transparent",
              "&:hover": { bgcolor: alpha(R, 0.05) },
            }}
          >
            <FormatBoldIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Nghiêng">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            sx={{
              color: isActive("italic") ? R : "#555",
              bgcolor: isActive("italic") ? alpha(R, 0.1) : "transparent",
              "&:hover": { bgcolor: alpha(R, 0.05) },
            }}
          >
            <FormatItalicIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Gạch chân">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            sx={{
              color: isActive("underline") ? R : "#555",
              bgcolor: isActive("underline") ? alpha(R, 0.1) : "transparent",
              "&:hover": { bgcolor: alpha(R, 0.05) },
            }}
          >
            <FormatUnderlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Gạch ngang">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            sx={{
              color: isActive("strike") ? R : "#555",
              bgcolor: isActive("strike") ? alpha(R, 0.1) : "transparent",
              "&:hover": { bgcolor: alpha(R, 0.05) },
            }}
          >
            <FormatStrikethroughIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Xóa định dạng">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
            sx={{
              color: "#555",
              "&:hover": { bgcolor: alpha(R, 0.05) },
            }}
          >
            <FormatClearIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Box sx={{ width: 1, height: 24, bgcolor: alpha(R, 0.1), mx: 0.5 }} />

        {/* Lists */}
        <Tooltip title="Danh sách không thứ tự">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            sx={{
              color: isActive("bulletList") ? R : "#555",
              bgcolor: isActive("bulletList") ? alpha(R, 0.1) : "transparent",
              "&:hover": { bgcolor: alpha(R, 0.05) },
            }}
          >
            <FormatListBulletedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Danh sách có thứ tự">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            sx={{
              color: isActive("orderedList") ? R : "#555",
              bgcolor: isActive("orderedList") ? alpha(R, 0.1) : "transparent",
              "&:hover": { bgcolor: alpha(R, 0.05) },
            }}
          >
            <FormatListNumberedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Box sx={{ width: 1, height: 24, bgcolor: alpha(R, 0.1), mx: 0.5 }} />

        {/* Alignment */}
        <Tooltip title="Căn trái">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            sx={{
              color: isActive("left") ? R : "#555",
              bgcolor: isActive("left") ? alpha(R, 0.1) : "transparent",
              "&:hover": {
                bgcolor: alpha(R, 0.05),
              },
            }}
          >
            <FormatAlignLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Căn giữa">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            sx={{
              color: isActive("paragraph", { textAlign: "center" })
                ? R
                : "#555",
              bgcolor: isActive("paragraph", { textAlign: "center" })
                ? alpha(R, 0.1)
                : "transparent",
              "&:hover": {
                bgcolor: alpha(R, 0.05),
              },
            }}
          >
            <FormatAlignCenterIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Căn phải">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            sx={{
              color: isActive("paragraph", { textAlign: "center" })
                ? R
                : "#555",
              bgcolor: isActive("paragraph", { textAlign: "center" })
                ? alpha(R, 0.1)
                : "transparent",
              "&:hover": {
                bgcolor: alpha(R, 0.05),
              },
            }}
          >
            <FormatAlignRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Căn đều">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            sx={{
              color: isActive("paragraph", { textAlign: "center" })
                ? R
                : "#555",
              bgcolor: isActive("paragraph", { textAlign: "center" })
                ? alpha(R, 0.1)
                : "transparent",
              "&:hover": {
                bgcolor: alpha(R, 0.05),
              },
            }}
          >
            <FormatAlignJustifyIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Box sx={{ width: 1, height: 24, bgcolor: alpha(R, 0.1), mx: 0.5 }} />

        {/* Special */}
        <Tooltip title="Trích dẫn">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            sx={{
              color: isActive("blockquote") ? R : "#555",
              bgcolor: isActive("blockquote") ? alpha(R, 0.1) : "transparent",
              "&:hover": { bgcolor: alpha(R, 0.05) },
            }}
          >
            <FormatQuoteIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Mã nguồn">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            sx={{
              color: isActive("codeBlock") ? R : "#555",
              bgcolor: isActive("codeBlock") ? alpha(R, 0.1) : "transparent",
              "&:hover": { bgcolor: alpha(R, 0.05) },
            }}
          >
            <CodeIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Chèn link">
          <IconButton
            size="small"
            onClick={() => {
              const url = window.prompt("Nhập URL:");
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            sx={{
              color: isActive("link") ? R : "#555",
              bgcolor: isActive("link") ? alpha(R, 0.1) : "transparent",
              "&:hover": { bgcolor: alpha(R, 0.05) },
            }}
          >
            <LinkIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  height = 200,
  readOnly = false,
  label,
  required = false,
  error = false,
  helperText,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rich-text-image",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "rich-text-link",
        },
      }),
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "ProseMirror",
      },
    },
  });

  return (
    <Box>
      {label && (
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            mb: 1,
            color: "#555",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          {label}
          {required && (
            <Typography
              component="span"
              sx={{ color: "#d32f2f", fontSize: 14 }}
            >
              *
            </Typography>
          )}
        </Typography>
      )}
      <Box
        sx={{
          border: `1px solid ${error ? "#d32f2f" : alpha(R, 0.2)}`,
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: readOnly ? "#f9f9f9" : "#fff",
          "& .ProseMirror": {
            minHeight: height,
            padding: "12px 16px",
            outline: "none",
            fontSize: "14px",
            lineHeight: 1.7,
            color: "#333",
            "&:focus": {
              outline: "none",
            },
            "& p": {
              margin: "4px 0",
            },
            "& h1": {
              fontSize: "28px",
              fontWeight: 700,
              margin: "12px 0 8px",
              lineHeight: 1.3,
            },
            "& h2": {
              fontSize: "24px",
              fontWeight: 700,
              margin: "10px 0 6px",
              lineHeight: 1.3,
            },
            "& h3": {
              fontSize: "20px",
              fontWeight: 600,
              margin: "8px 0 4px",
              lineHeight: 1.3,
            },
            "& ul, & ol": {
              paddingLeft: "24px",
              margin: "4px 0",
            },
            "& li": {
              margin: "2px 0",
            },
            "& blockquote": {
              borderLeft: `4px solid ${R}`,
              paddingLeft: "16px",
              margin: "8px 0",
              color: "#666",
              fontStyle: "italic",
            },
            "& code": {
              background: "#f5f5f5",
              padding: "2px 6px",
              borderRadius: "4px",
              fontFamily: "monospace",
              fontSize: "0.9em",
            },
            "& pre": {
              background: "#f5f5f5",
              padding: "12px",
              borderRadius: "8px",
              overflowX: "auto",
              "& code": {
                background: "transparent",
                padding: 0,
              },
            },
            "& img": {
              maxWidth: "100%",
              height: "auto",
              borderRadius: "8px",
              margin: "4px 0",
            },
            "& a": {
              color: R,
              textDecoration: "underline",
            },
            "& .ProseMirror-selectednode": {
              outline: `2px solid ${R}`,
            },
            "&.ProseMirror-focused": {
              outline: "none",
            },
            "& .ProseMirror-placeholder": {
              color: "#aaa",
              pointerEvents: "none",
            },
          },
        }}
      >
        {!readOnly && <MenuBar editor={editor} />}
        <EditorContent editor={editor} />
      </Box>
      {helperText && (
        <Typography
          sx={{
            fontSize: 11.5,
            color: error ? "#d32f2f" : "#666",
            mt: 0.5,
            ml: 1,
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
}
