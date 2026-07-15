/* eslint-disable react-hooks/static-components */
"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Divider,
  Select,
  MenuItem,
  FormControl,
  Popover,
} from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatStrikethroughIcon from "@mui/icons-material/FormatStrikethrough";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import LinkIcon from "@mui/icons-material/Link";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import TitleIcon from "@mui/icons-material/Title";
import FormatClearIcon from "@mui/icons-material/FormatClear";
import ImageIcon from "@mui/icons-material/Image";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import CodeIcon from "@mui/icons-material/Code";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";

const MAU = {
  chinh: "#8B1313",
  chinhNhat: "#F8ECEE",
  vien: "#E7DADC",
  chuXam: "#6a6f73",
  nenTrang: "#ffffff",
};

const FONT_FAMILIES = [
  { label: "Mặc định", value: "" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
];

const FONT_SIZES = [
  { label: "Nhỏ", value: "1" },
  { label: "Nhỏ vừa", value: "2" },
  { label: "Bình thường", value: "3" },
  { label: "Lớn", value: "4" },
  { label: "Lớn hơn", value: "5" },
  { label: "Rất lớn", value: "6" },
  { label: "Cực lớn", value: "7" },
];

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  minHeight = 260,
}: Props) {
  const vungSoanRef = useRef<HTMLDivElement>(null);
  const [dinhDangDangBat, setDinhDangDangBat] = useState<
    Record<string, boolean>
  >({});
  const daKhoiTao = useRef(false);
  const [fontSize, setFontSize] = useState("3");
  const [fontFamily, setFontFamily] = useState("");
  const [colorAnchorEl, setColorAnchorEl] = useState<null | HTMLElement>(null);
  const [bgColorAnchorEl, setBgColorAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [selectedBgColor, setSelectedBgColor] = useState("#ffffff");

  // Bật styleWithCSS để dùng CSS thay vì thẻ font
  useEffect(() => {
    document.execCommand("styleWithCSS", false, "true");
  }, []);

  // Đồng bộ nội dung ban đầu
  useEffect(() => {
    if (vungSoanRef.current && !daKhoiTao.current) {
      vungSoanRef.current.innerHTML = value || "";
      daKhoiTao.current = true;
    }
  }, [value]);

  const capNhatTrangThaiNut = useCallback(() => {
    try {
      setDinhDangDangBat({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
        blockquote: document.queryCommandState("blockquote"),
        code: document.queryCommandState("code"),
      });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", capNhatTrangThaiNut);
    return () =>
      document.removeEventListener("selectionchange", capNhatTrangThaiNut);
  }, [capNhatTrangThaiNut]);

  const thucThi = (lenh: string, giaTri?: string) => {
    vungSoanRef.current?.focus();
    document.execCommand(lenh, false, giaTri);
    capNhatTrangThaiNut();
    onChange(vungSoanRef.current?.innerHTML ?? "");
  };

  const chenTieuDe = () => {
    vungSoanRef.current?.focus();
    document.execCommand("formatBlock", false, "h3");
    onChange(vungSoanRef.current?.innerHTML ?? "");
  };

  const chenLienKet = () => {
    const url = window.prompt("Nhập đường dẫn liên kết:");
    if (!url) return;
    vungSoanRef.current?.focus();
    document.execCommand("createLink", false, url);
    onChange(vungSoanRef.current?.innerHTML ?? "");
  };

  const chenAnh = () => {
    const url = window.prompt("Nhập URL ảnh:");
    if (!url) return;
    vungSoanRef.current?.focus();
    document.execCommand("insertImage", false, url);
    onChange(vungSoanRef.current?.innerHTML ?? "");
  };

  const doiFontSize = (size: string) => {
    setFontSize(size);
    vungSoanRef.current?.focus();
    document.execCommand("fontSize", false, size);
    onChange(vungSoanRef.current?.innerHTML ?? "");
  };

  const doiFontFamily = (family: string) => {
    setFontFamily(family);
    vungSoanRef.current?.focus();
    document.execCommand("fontName", false, family);
    onChange(vungSoanRef.current?.innerHTML ?? "");
  };

  const doiMauChu = (color: string) => {
    setSelectedColor(color);
    vungSoanRef.current?.focus();
    document.execCommand("foreColor", false, color);
    onChange(vungSoanRef.current?.innerHTML ?? "");
    setColorAnchorEl(null);
  };

  const doiMauNen = (color: string) => {
    setSelectedBgColor(color);
    vungSoanRef.current?.focus();
    document.execCommand("hiliteColor", false, color);
    onChange(vungSoanRef.current?.innerHTML ?? "");
    setBgColorAnchorEl(null);
  };

  const NutCongCu = ({
    tooltip,
    active,
    onClick,
    children,
  }: {
    tooltip: string;
    active?: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <Tooltip title={tooltip} arrow>
      <IconButton
        size="small"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        sx={{
          borderRadius: "8px",
          color: active ? "#fff" : MAU.chuXam,
          bgcolor: active ? MAU.chinh : "transparent",
          "&:hover": {
            bgcolor: active ? MAU.chinh : MAU.chinhNhat,
            color: active ? "#fff" : MAU.chinh,
          },
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );

  return (
    <Box
      sx={{
        border: `1px solid ${MAU.vien}`,
        borderRadius: "14px",
        overflow: "hidden",
        bgcolor: MAU.nenTrang,
      }}
    >
      {/* Thanh công cụ */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 0.5,
          px: 1.5,
          py: 1,
          bgcolor: MAU.chinhNhat,
          borderBottom: `1px solid ${MAU.vien}`,
        }}
      >
        {/* Font Family */}
        <FormControl size="small" sx={{ minWidth: 100, mr: 1 }}>
          <Select
            value={fontFamily}
            onChange={(e) => doiFontFamily(e.target.value)}
            displayEmpty
            sx={{
              fontSize: 12,
              bgcolor: MAU.nenTrang,
              borderRadius: "8px",
              "& .MuiSelect-select": { py: 0.5 },
            }}
            inputProps={{ "aria-label": "Phông chữ" }}
          >
            <MenuItem value="">Mặc định</MenuItem>
            {FONT_FAMILIES.slice(1).map((f) => (
              <MenuItem key={f.value} value={f.value}>
                {f.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Font Size */}
        <FormControl size="small" sx={{ minWidth: 80, mr: 1 }}>
          <Select
            value={fontSize}
            onChange={(e) => doiFontSize(e.target.value)}
            sx={{
              fontSize: 12,
              bgcolor: MAU.nenTrang,
              borderRadius: "8px",
              "& .MuiSelect-select": { py: 0.5 },
            }}
            inputProps={{ "aria-label": "Cỡ chữ" }}
          >
            {FONT_SIZES.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 0.5, borderColor: MAU.vien }}
        />

        <NutCongCu tooltip="Tiêu đề" onClick={chenTieuDe}>
          <TitleIcon fontSize="small" />
        </NutCongCu>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 0.5, borderColor: MAU.vien }}
        />

        <NutCongCu
          tooltip="In đậm"
          active={dinhDangDangBat.bold}
          onClick={() => thucThi("bold")}
        >
          <FormatBoldIcon fontSize="small" />
        </NutCongCu>
        <NutCongCu
          tooltip="In nghiêng"
          active={dinhDangDangBat.italic}
          onClick={() => thucThi("italic")}
        >
          <FormatItalicIcon fontSize="small" />
        </NutCongCu>
        <NutCongCu
          tooltip="Gạch chân"
          active={dinhDangDangBat.underline}
          onClick={() => thucThi("underline")}
        >
          <FormatUnderlinedIcon fontSize="small" />
        </NutCongCu>
        <NutCongCu
          tooltip="Gạch ngang"
          active={dinhDangDangBat.strikeThrough}
          onClick={() => thucThi("strikeThrough")}
        >
          <FormatStrikethroughIcon fontSize="small" />
        </NutCongCu>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 0.5, borderColor: MAU.vien }}
        />

        <NutCongCu
          tooltip="Danh sách chấm"
          active={dinhDangDangBat.insertUnorderedList}
          onClick={() => thucThi("insertUnorderedList")}
        >
          <FormatListBulletedIcon fontSize="small" />
        </NutCongCu>
        <NutCongCu
          tooltip="Danh sách số"
          active={dinhDangDangBat.insertOrderedList}
          onClick={() => thucThi("insertOrderedList")}
        >
          <FormatListNumberedIcon fontSize="small" />
        </NutCongCu>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 0.5, borderColor: MAU.vien }}
        />

        <NutCongCu
          tooltip="Căn trái"
          active={dinhDangDangBat.justifyLeft}
          onClick={() => thucThi("justifyLeft")}
        >
          <FormatAlignLeftIcon fontSize="small" />
        </NutCongCu>
        <NutCongCu
          tooltip="Căn giữa"
          active={dinhDangDangBat.justifyCenter}
          onClick={() => thucThi("justifyCenter")}
        >
          <FormatAlignCenterIcon fontSize="small" />
        </NutCongCu>
        <NutCongCu
          tooltip="Căn phải"
          active={dinhDangDangBat.justifyRight}
          onClick={() => thucThi("justifyRight")}
        >
          <FormatAlignRightIcon fontSize="small" />
        </NutCongCu>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 0.5, borderColor: MAU.vien }}
        />

        <NutCongCu
          tooltip="Blockquote"
          active={dinhDangDangBat.blockquote}
          onClick={() => thucThi("formatBlock", "blockquote")}
        >
          <FormatQuoteIcon fontSize="small" />
        </NutCongCu>
        <NutCongCu
          tooltip="Code"
          active={dinhDangDangBat.code}
          onClick={() => thucThi("formatBlock", "code")}
        >
          <CodeIcon fontSize="small" />
        </NutCongCu>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 0.5, borderColor: MAU.vien }}
        />

        <NutCongCu tooltip="Chèn liên kết" onClick={chenLienKet}>
          <LinkIcon fontSize="small" />
        </NutCongCu>
        <NutCongCu tooltip="Chèn ảnh" onClick={chenAnh}>
          <ImageIcon fontSize="small" />
        </NutCongCu>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 0.5, borderColor: MAU.vien }}
        />

        {/* Màu chữ */}
        <Tooltip title="Màu chữ" arrow>
          <IconButton
            size="small"
            onClick={(e) => setColorAnchorEl(e.currentTarget)}
            sx={{
              borderRadius: "8px",
              color: MAU.chuXam,
              "&:hover": { bgcolor: MAU.chinhNhat, color: MAU.chinh },
            }}
            aria-label="Chọn màu chữ"
          >
            <FormatColorTextIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Popover
          open={Boolean(colorAnchorEl)}
          anchorEl={colorAnchorEl}
          onClose={() => setColorAnchorEl(null)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
        >
          <Box sx={{ p: 2 }}>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => doiMauChu(e.target.value)}
              aria-label="Chọn màu chữ"
              title="Chọn màu chữ"
            />
          </Box>
        </Popover>

        {/* Màu nền */}
        <Tooltip title="Màu nền" arrow>
          <IconButton
            size="small"
            onClick={(e) => setBgColorAnchorEl(e.currentTarget)}
            sx={{
              borderRadius: "8px",
              color: MAU.chuXam,
              "&:hover": { bgcolor: MAU.chinhNhat, color: MAU.chinh },
            }}
            aria-label="Chọn màu nền"
          >
            <FormatColorFillIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Popover
          open={Boolean(bgColorAnchorEl)}
          anchorEl={bgColorAnchorEl}
          onClose={() => setBgColorAnchorEl(null)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
        >
          <Box sx={{ p: 2 }}>
            <input
              type="color"
              value={selectedBgColor}
              onChange={(e) => doiMauNen(e.target.value)}
              aria-label="Chọn màu nền"
              title="Chọn màu nền"
            />
          </Box>
        </Popover>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 0.5, borderColor: MAU.vien }}
        />

        <NutCongCu
          tooltip="Xóa định dạng"
          onClick={() => thucThi("removeFormat")}
        >
          <FormatClearIcon fontSize="small" />
        </NutCongCu>

        <Box sx={{ flex: 1 }} />

        <NutCongCu tooltip="Hoàn tác" onClick={() => thucThi("undo")}>
          <UndoIcon fontSize="small" />
        </NutCongCu>
        <NutCongCu tooltip="Làm lại" onClick={() => thucThi("redo")}>
          <RedoIcon fontSize="small" />
        </NutCongCu>
      </Box>

      {/* Vùng soạn thảo */}
      <Box
        ref={vungSoanRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        onBlur={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        data-placeholder={placeholder}
        sx={{
          minHeight,
          px: 3,
          py: 2.5,
          fontSize: 15,
          lineHeight: 1.7,
          color: "#231313",
          outline: "none",
          overflowY: "auto",
          "&:empty:before": {
            content: "attr(data-placeholder)",
            color: "#b0a8a8",
          },
          "& ul, & ol": { pl: 3, m: 0 },
          "& h3": { fontSize: 19, fontWeight: 700, my: 1 },
          "& a": { color: MAU.chinh },
          "& blockquote": {
            borderLeft: `4px solid ${MAU.chinh}`,
            margin: "0.5em 0",
            paddingLeft: "1em",
            color: "#555",
          },
          "& pre, & code": {
            backgroundColor: "#f5f5f5",
            padding: "0.2em 0.4em",
            borderRadius: "4px",
            fontFamily: "monospace",
          },
          "& pre": { padding: "0.8em" },
        }}
      />
    </Box>
  );
}
