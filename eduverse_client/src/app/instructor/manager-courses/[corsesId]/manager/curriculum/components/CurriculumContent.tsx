/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  Box,
  Typography,
  Button,
  IconButton,
  Collapse,
  TextField,
  Menu,
  MenuItem,
  Divider,
  Switch,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Radio,
  FormControl,
  Select,
  InputLabel,
  Paper,
  GlobalStyles,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  PlayCircleOutlined,
  QuizOutlined,
  Add,
  DeleteOutlined,
  EditOutlined,
  AttachFile,
  Save,
  CheckCircle,
  RadioButtonUnchecked,
  DragIndicator,
  OndemandVideoOutlined,
  Close as CloseIcon,
  InfoOutlined,
  ErrorOutlined,
  FormatBoldOutlined,
  FormatItalicOutlined,
  FormatListBulletedOutlined,
  InsertLinkOutlined,
  FormatUnderlinedOutlined,
  CloudUploadOutlined,
  AutorenewOutlined,
  ScheduleOutlined,
  LockOpenOutlined,
  LockOutlined,
  DescriptionOutlined,
} from "@mui/icons-material";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  MAU,
  tinhTongThoiLuongGiay,
  validateTieuDeBaiGiang,
  validateTenTaiLieu,
  validateTenBaiKiemTra,
  validateMoTaBaiKiemTra,
  validateNoiDungCauHoi,
  validateNoiDungDapAn,
  trimString,
  isNoiDungHtmlRong,
  SO_DAP_AN_TOI_THIEU,
  SO_DAP_AN_TOI_DA,
} from "../../components/courseEditCore";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import { PhanHocType } from "@/src/types/PhanHoc/Dto/PhanHocdto";
import { BaiGiangType } from "@/src/types/BaiGiang/Dto/BaiGiangDto";
import {
  BaiKiemTraDto,
  CauHoiDto,
} from "@/src/types/baiKiemTra/Dto/baiKiemTraDto";
import { TaiLieuType } from "@/src/types/TaiLieu/Dto/TaiLieuDto";
import AuthGuard from "@/src/components/AuthGuard";
import { useCourseEdit } from "../../components/CourseEditContext";
import { cleanHtmlContent } from "@/src/utils/htmlHelpers";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuidv4 } from "uuid";

// ===== Import SignalR & Next =====
import * as signalR from "@microsoft/signalr";
import { useParams } from "next/navigation";
import { createCourseHubConnection } from "@/src/services/signalRService";
import { BRAND, CSSVAR, STATUS } from "@/src/theme/tokens";

// ===== CSS Animation =====
const pulseKeyframes = `
  @keyframes pulse {
    0% { opacity: 0.4; transform: scale(0.9); }
    50% { opacity: 1; transform: scale(1.1); }
    100% { opacity: 0.4; transform: scale(0.9); }
  }
`;

// ===== Ràng buộc tài liệu =====
const DUNG_LUONG_TAI_LIEU_TOI_DA = 50 * 1024 * 1024;
const DUOI_TAI_LIEU_HOP_LE = [".doc", ".docx"];

function layDuoiFile(tenFile: string): string {
  const idx = tenFile.lastIndexOf(".");
  return idx === -1 ? "" : tenFile.slice(idx).toLowerCase();
}

function validateTaiLieu(file: File): { valid: boolean; error?: string } {
  const duoi = layDuoiFile(file.name);
  if (!DUOI_TAI_LIEU_HOP_LE.includes(duoi)) {
    return {
      valid: false,
      error: `Định dạng tài liệu không hợp lệ. Chỉ chấp nhận: ${DUOI_TAI_LIEU_HOP_LE.join(", ")}`,
    };
  }
  if (file.size > DUNG_LUONG_TAI_LIEU_TOI_DA) {
    return {
      valid: false,
      error: `Dung lượng tài liệu vượt quá ${DUNG_LUONG_TAI_LIEU_TOI_DA / (1024 * 1024)}MB`,
    };
  }
  return { valid: true };
}

// ===== RICH TEXT EDITOR COMPONENT =====
function RichTextEditor({
  value,
  onChange,
  placeholder,
  disabled,
  minHeight = 120,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const dangTuThayDoi = useRef(false);

  useEffect(() => {
    if (dangTuThayDoi.current) {
      dangTuThayDoi.current = false;
      return;
    }
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const emitChange = () => {
    if (editorRef.current) {
      dangTuThayDoi.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  const applyFormat = (command: string, val?: string) => {
    document.execCommand(command, false, val || "");
    emitChange();
  };

  const handleInput = () => {
    emitChange();
  };

  const sanitizeHtml = (html: string): string => {
    if (!html) return "";

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    const allowedTags = [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "ul",
      "ol",
      "li",
      "a",
      "span",
      "div",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "pre",
      "code",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "sub",
      "sup",
      "hr",
    ];

    const allElements = tempDiv.querySelectorAll("*");
    allElements.forEach((el) => {
      if (!allowedTags.includes(el.tagName.toLowerCase())) {
        const text = el.textContent || "";
        const textNode = document.createTextNode(text);
        el.parentNode?.replaceChild(textNode, el);
      }
    });

    const scripts = tempDiv.querySelectorAll("script");
    scripts.forEach((script) => script.remove());

    const allElements2 = tempDiv.querySelectorAll("*");
    allElements2.forEach((el) => {
      const attrs = el.attributes;
      const toRemove: string[] = [];
      for (let i = 0; i < attrs.length; i++) {
        const attrName = attrs[i].name;
        if (attrName.startsWith("on")) {
          toRemove.push(attrName);
        }
        if (
          attrName === "href" &&
          attrs[i].value.toLowerCase().startsWith("javascript:")
        ) {
          toRemove.push(attrName);
        }
        if (
          attrName === "src" &&
          attrs[i].value.toLowerCase().startsWith("javascript:")
        ) {
          toRemove.push(attrName);
        }
        if (attrName === "style") {
          const style = attrs[i].value.toLowerCase();
          if (style.includes("expression") || style.includes("javascript:")) {
            toRemove.push(attrName);
          }
        }
      }
      toRemove.forEach((attr) => el.removeAttribute(attr));
    });

    return tempDiv.innerHTML;
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    const htmlData = e.clipboardData.getData("text/html");
    const textData = e.clipboardData.getData("text/plain");

    let contentToInsert = "";

    if (htmlData) {
      contentToInsert = sanitizeHtml(htmlData);
    } else if (textData) {
      contentToInsert = textData.replace(/\n/g, "<br>");
    }

    if (contentToInsert && editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (
        selection &&
        (selection.rangeCount === 0 ||
          !editorRef.current.contains(selection.anchorNode))
      ) {
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      document.execCommand("insertHTML", false, contentToInsert);
    }

    emitChange();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      document.execCommand("insertParagraph", false);
      e.preventDefault();
    }
  };

  return (
    <Box
      sx={{
        border: `1px solid ${isFocused ? MAU.chinh : "#E3E6EB"}`,
        borderRadius: "10px",
        overflow: "hidden",
        bgcolor: CSSVAR.paper,
        transition: "border-color 0.15s ease",
        "&:focus-within": {
          borderColor: MAU.chinh,
          borderWidth: 1.5,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          px: 1.5,
          py: 0.75,
          borderBottom: "1px solid #EDEFF3",
          bgcolor: "var(--ev-paper-alt, #FAFAFA)",
          flexWrap: "wrap",
        }}
      >
        <IconButton
          size="small"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat("bold");
          }}
          disabled={disabled}
          sx={{
            color: "var(--ev-text-muted, #9AA2B1)",
            "&:hover": { color: MAU.chinh, bgcolor: `${MAU.chinh}0F` },
          }}
        >
          <FormatBoldOutlined fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat("italic");
          }}
          disabled={disabled}
          sx={{
            color: "var(--ev-text-muted, #9AA2B1)",
            "&:hover": { color: MAU.chinh, bgcolor: `${MAU.chinh}0F` },
          }}
        >
          <FormatItalicOutlined fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat("underline");
          }}
          disabled={disabled}
          sx={{
            color: "var(--ev-text-muted, #9AA2B1)",
            "&:hover": { color: MAU.chinh, bgcolor: `${MAU.chinh}0F` },
          }}
        >
          <FormatUnderlinedOutlined fontSize="small" />
        </IconButton>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />
        <IconButton
          size="small"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat("insertUnorderedList");
          }}
          disabled={disabled}
          sx={{
            color: "var(--ev-text-muted, #9AA2B1)",
            "&:hover": { color: MAU.chinh, bgcolor: `${MAU.chinh}0F` },
          }}
        >
          <FormatListBulletedOutlined fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat("insertOrderedList");
          }}
          disabled={disabled}
          sx={{
            color: "var(--ev-text-muted, #9AA2B1)",
            "&:hover": { color: MAU.chinh, bgcolor: `${MAU.chinh}0F` },
          }}
        >
          <FormatListBulletedOutlined
            fontSize="small"
            sx={{ transform: "rotate(90deg)" }}
          />
        </IconButton>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />
        <IconButton
          size="small"
          onMouseDown={(e) => {
            e.preventDefault();
            const url = prompt("Nhập URL link:");
            if (url) applyFormat("createLink", url);
          }}
          disabled={disabled}
          sx={{
            color: "var(--ev-text-muted, #9AA2B1)",
            "&:hover": { color: MAU.chinh, bgcolor: `${MAU.chinh}0F` },
          }}
        >
          <InsertLinkOutlined fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat("removeFormat");
          }}
          disabled={disabled}
          sx={{
            color: "var(--ev-text-muted, #9AA2B1)",
            "&:hover": { color: MAU.chinh, bgcolor: `${MAU.chinh}0F` },
          }}
        >
          <FormatUnderlinedOutlined
            fontSize="small"
            sx={{ transform: "rotate(45deg)" }}
          />
        </IconButton>
      </Box>
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        data-placeholder={placeholder}
        style={{
          padding: "12px 16px",
          fontSize: "14px",
          lineHeight: 1.7,
          color: CSSVAR.textPrimary,
          minHeight: `${minHeight}px`,
          outline: "none",
          cursor: disabled ? "default" : "text",
          backgroundColor: CSSVAR.paper,
          borderRadius: "0 0 10px 10px",
        }}
        className="rich-text-editor"
      />
      <style jsx>{`
        .rich-text-editor:empty:before {
          content: attr(data-placeholder);
          color: #b0b6c0;
          pointer-events: none;
        }
        .rich-text-editor p {
          margin: 0 0 0.5em 0;
        }
        .rich-text-editor ul,
        .rich-text-editor ol {
          margin: 0 0 0.5em 0;
          padding-left: 1.5em;
        }
        .rich-text-editor li {
          margin-bottom: 0.25em;
        }
        .rich-text-editor a {
          color: ${MAU.chinh};
          text-decoration: underline;
        }
        .rich-text-editor strong {
          font-weight: 700;
        }
        .rich-text-editor em {
          font-style: italic;
        }
        .rich-text-editor u {
          text-decoration: underline;
        }
        .rich-text-editor h1,
        .rich-text-editor h2,
        .rich-text-editor h3 {
          margin: 0.5em 0;
        }
        .rich-text-editor blockquote {
          border-left: 3px solid ${MAU.chinh};
          padding-left: 1em;
          margin: 0.5em 0;
          color: ${CSSVAR.textMuted};
        }
        .rich-text-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }
        .rich-text-editor table {
          border-collapse: collapse;
          width: 100%;
          margin: 0.5em 0;
        }
        .rich-text-editor th,
        .rich-text-editor td {
          border: 1px solid #e3e6eb;
          padding: 6px 12px;
          text-align: left;
        }
        .rich-text-editor th {
          background-color: #f5f6f8;
          font-weight: 700;
        }
        .rich-text-editor pre {
          background-color: #f5f6f8;
          padding: 1em;
          border-radius: 4px;
          overflow-x: auto;
          font-family: monospace;
        }
        .rich-text-editor code {
          background-color: #f5f6f8;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: monospace;
        }
      `}</style>
    </Box>
  );
}

// Hàm stripHtml để lấy text thuần
function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<!--[\s\S]*?-->/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const noPropagation = {
  onKeyDown: (e: React.KeyboardEvent) => e.stopPropagation(),
  onKeyUp: (e: React.KeyboardEvent) => e.stopPropagation(),
  onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
  onClick: (e: React.MouseEvent) => e.stopPropagation(),
};

type LoaiMucThem = "BaiGiang" | "BaiKiemTra";

interface TuyChonThemMuc {
  type: LoaiMucThem;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  disabled?: boolean;
}

interface NhomTuyChonThemMuc {
  groupLabel: string;
  options: TuyChonThemMuc[];
}

function dinhDangThoiLuong(giay: number) {
  const p = Math.floor(giay / 60);
  const g = giay % 60;
  return `${p}:${String(g).padStart(2, "0")}`;
}

function dinhDangDungLuong(bytes: number) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function validateVideoFile(
  file: File,
): Promise<{ valid: boolean; error?: string }> {
  return new Promise((resolve) => {
    const duoi = layDuoiFile(file.name);
    const DUOI_VIDEO_HOP_LE = [".mp4", ".mov"];
    if (!DUOI_VIDEO_HOP_LE.includes(duoi)) {
      resolve({
        valid: false,
        error: `Định dạng video không hợp lệ. Chỉ chấp nhận: ${DUOI_VIDEO_HOP_LE.join(", ")}`,
      });
      return;
    }

    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      resolve({
        valid: false,
        error: `Dung lượng vượt quá 100MB (hiện tại: ${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
      });
      return;
    }
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = function () {
      const width = video.videoWidth;
      const height = video.videoHeight;
      URL.revokeObjectURL(url);
      if (width < 854 || height < 480) {
        resolve({
          valid: false,
          error: `Độ phân giải tối thiểu 854x480 (480p). Hiện tại: ${width}x${height}`,
        });
      } else {
        resolve({ valid: true });
      }
    };
    video.onerror = function () {
      URL.revokeObjectURL(url);
      resolve({ valid: false, error: "Không thể đọc metadata của video" });
    };
    video.src = url;
  });
}

// ===== SECTION ITEM - COMPONENT RIÊNG =====
function SectionItem({
  phan,
  idx,
  isEditable,
  children,
  onEdit,
  onDelete,
}: {
  phan: PhanHocType;
  idx: number;
  isEditable: boolean;
  children: React.ReactNode;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { id } = phan;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Box>
        <Box
          sx={{
            bgcolor: "var(--ev-paper-alt, #F5F6F8)",
            border: "1px solid #E7E9EE",
            borderRadius: "14px",
            p: 2.5,
          }}
        >
          <Box
            {...(isEditable ? listeners : {})}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              mb: 1.5,
              cursor: isEditable ? "grab" : "default",
              touchAction: "none",
              userSelect: "none",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                minWidth: 0,
                flex: 1,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  color: CSSVAR.textPrimary,
                  flexShrink: 0,
                }}
              >
                Phần {idx + 1}:
              </Typography>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: CSSVAR.textPrimary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  minWidth: 0,
                }}
              >
                {phan.tenPhan || "Phần mới"}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                flexShrink: 0,
              }}
            >
              <NguoiThucHienLabel
                createdBy={(phan as any).createdBy}
                updatedBy={(phan as any).updatedBy}
                updatedDate={(phan as any).updatedDate}
                sx={{ mr: 0.5 }}
              />
              {isEditable && (
                <>
                  <IconButton
                    {...noPropagation}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(id);
                    }}
                  >
                    <EditOutlined
                      fontSize="small"
                      sx={{ color: "var(--ev-text-muted, #9AA2B1)" }}
                    />
                  </IconButton>
                  <Tooltip title="Xóa phần">
                    <IconButton
                      {...noPropagation}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(id);
                      }}
                    >
                      <DeleteOutlined
                        fontSize="small"
                        sx={{ color: "var(--ev-text-muted, #9AA2B1)" }}
                      />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              <DragIndicator
                sx={{
                  fontSize: 20,
                  color: "var(--ev-grey, #C7CCD6)",
                }}
              />
            </Box>
          </Box>
          {children}
        </Box>
      </Box>
    </div>
  );
}

// ===== LECTURE ITEM - COMPONENT RIÊNG =====
function LectureItem({
  bg,
  itemId,
  phanId,
  soThuTuMuc,
  isComplete,
  isExpanded,
  isEditable,
  dangTai = false,
  lyDoTuChoi,
  children,
  onToggle,
  onEdit,
  onDelete,
  onShowLyDo, // thêm prop
}: {
  bg: BaiGiangType;
  itemId: string;
  phanId: string;
  soThuTuMuc: number;
  isComplete: boolean;
  isExpanded: boolean;
  isEditable: boolean;
  dangTai?: boolean;
  lyDoTuChoi?: any; // LyDoTuChoiDto | null
  children: React.ReactNode;
  onToggle: (id: string) => void;
  onEdit: (phanId: string, id: string) => void;
  onDelete: (phanId: string, id: string) => void;
  onShowLyDo: (lyDo: string) => void; // thêm prop
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: itemId });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasLyDo = lyDoTuChoi?.lyDo;

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Paper
        sx={{
          mb: 1,
          border: "1px solid #EDEFF3",
          borderRadius: "8px",
          overflow: "hidden",
          bgcolor: CSSVAR.paper,
          transition: "all 0.2s ease",
          "&:hover": { borderColor: CSSVAR.divider },
        }}
      >
        <ListItem
          {...(isEditable ? listeners : {})}
          sx={{
            px: 1.5,
            py: 0.75,
            bgcolor: "transparent",
            cursor: isEditable ? "grab" : "default",
            touchAction: "none",
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            "&:hover": {
              bgcolor: "rgba(0,0,0,0.02)",
            },
          }}
          onClick={() => onToggle(itemId)}
        >
          {/* Vùng bên trái: Icon + Tiêu đề + Chip trạng thái video */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
              flex: "1 1 auto",
            }}
          >
            <ListItemIcon sx={{ minWidth: 28, flexShrink: 0 }}>
              {isComplete ? (
                <CheckCircle sx={{ fontSize: 18, color: MAU.chinh }} />
              ) : (
                <RadioButtonUnchecked
                  sx={{ fontSize: 18, color: "var(--ev-grey, #C7CCD6)" }}
                />
              )}
            </ListItemIcon>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                minWidth: 0,
                flex: 1,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 500,
                  fontSize: 14,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  minWidth: 0,
                }}
              >
                <Box component="span" sx={{ fontWeight: 800 }}>
                  {`Bài giảng ${soThuTuMuc}: `}
                </Box>
                {bg.tieuDe || "Chưa đặt tên"}
              </Typography>
              <Chip
                size="small"
                label={
                  dangTai
                    ? "Đang tải video..."
                    : bg.urlBaiGiang
                      ? "Có video"
                      : "Chưa có video"
                }
                sx={{
                  fontSize: 10,
                  fontWeight: 700,
                  bgcolor: dangTai
                    ? "#FFF7ED"
                    : bg.urlBaiGiang
                      ? `${MAU.chinh}1A`
                      : "#F1F2F5",
                  color: dangTai
                    ? STATUS.warningDark
                    : bg.urlBaiGiang
                      ? MAU.chinhDam
                      : CSSVAR.textMuted,
                  flexShrink: 0,
                }}
              />
            </Box>
          </Box>

          {/* Vùng bên phải: Tên người thực hiện + Các nút thao tác */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              flexShrink: 0,
            }}
          >
            <NguoiThucHienLabel
              createdBy={(bg as any).createdBy}
              updatedBy={(bg as any).updatedBy}
              updatedDate={(bg as any).updatedDate}
              sx={{ mr: 0.5 }}
            />
            {dangTai && (
              <CircularProgress
                size={16}
                sx={{ color: MAU.chinh, mr: 0.5 }}
              />
            )}
            {isEditable && (
              <>
                <IconButton
                  {...noPropagation}
                  size="small"
                  disabled={dangTai}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(phanId, itemId);
                  }}
                >
                  <EditOutlined
                    fontSize="small"
                    sx={{ color: "var(--ev-text-muted, #9AA2B1)" }}
                  />
                </IconButton>
                <IconButton
                  {...noPropagation}
                  size="small"
                  disabled={dangTai}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(phanId, itemId);
                  }}
                >
                  <DeleteOutlined
                    fontSize="small"
                    sx={{ color: "var(--ev-text-muted, #9AA2B1)" }}
                  />
                </IconButton>
              </>
            )}
            {/* Hiển thị từ chối bài giảng - khi bấm vào mở popup */}
            {hasLyDo && (
              <IconButton
                {...noPropagation}
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowLyDo(lyDoTuChoi.lyDo);
                }}
                sx={{
                  color: STATUS.error,
                  "&:hover": { bgcolor: "#FEE2E2" },
                }}
              >
                <ErrorOutlined fontSize="small" />
              </IconButton>
            )}
            <IconButton
              {...noPropagation}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggle(itemId);
              }}
            >
              {isExpanded ? (
                <ExpandLess fontSize="small" />
              ) : (
                <ExpandMore fontSize="small" />
              )}
            </IconButton>
          </Box>
        </ListItem>

        <Collapse in={isExpanded}>
          <Box sx={{ px: 2, pb: 2 }}>
            {children}

            {/* Hiển thị lý do từ chối ở cuối phần mở rộng */}
            {hasLyDo && (
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.5,
                  bgcolor: "#FEF2F2",
                  border: "1px solid #FECACA",
                  borderRadius: "8px",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "#991B1B",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <ErrorOutlined sx={{ fontSize: 16, mt: 0.2 }} />
                  <Box
                    dangerouslySetInnerHTML={{ __html: lyDoTuChoi.lyDo }}
                    sx={{
                      "& p": { margin: 0 },
                      "& ul, & ol": { margin: "4px 0", paddingLeft: "18px" },
                    }}
                  />
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </Paper>
    </div>
  );
}

// ===== BÀI GIẢNG ĐANG TẢI LÊN (placeholder) =====
function PendingLectureItem({
  tieuDe,
  soThuTuMuc,
}: {
  tieuDe: string;
  soThuTuMuc: number;
}) {
  return (
    <Paper
      sx={{
        mb: 1,
        border: "1px dashed #EDEFF3",
        borderRadius: "8px",
        overflow: "hidden",
        bgcolor: "#FAFAFB",
      }}
    >
      <ListItem sx={{ px: 1.5, py: 0.75 }}>
        <ListItemIcon sx={{ minWidth: 28 }}>
          <CircularProgress size={16} sx={{ color: MAU.chinh }} />
        </ListItemIcon>
        <ListItemText
          primary={
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontSize: 14,
                fontWeight: 500,
                minWidth: 0,
              }}
            >
              <Box
                component="span"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  minWidth: 0,
                }}
              >
                <Box component="span" sx={{ fontWeight: 800 }}>
                  {`Bài giảng ${soThuTuMuc}: `}
                </Box>
                {tieuDe}
              </Box>
              <Chip
                size="small"
                label="Đang tải video..."
                sx={{
                  fontSize: 10,
                  fontWeight: 700,
                  bgcolor: "#FFF7ED",
                  color: STATUS.warningDark,
                  flexShrink: 0,
                }}
              />
            </Box>
          }
        />
      </ListItem>
    </Paper>
  );
}

// ===== QUIZ ITEM - COMPONENT RIÊNG =====
function QuizItem({
  kt,
  itemId,
  phanId,
  soThuTuMuc,
  tenHienThi,
  isComplete,
  isExpanded,
  isEditable,
  lyDoTuChoi,
  children,
  onToggle,
  onEdit,
  onDelete,
  onShowLyDo, // thêm prop
}: {
  kt: BaiKiemTraDto;
  itemId: string;
  phanId: string;
  soThuTuMuc: number;
  tenHienThi: string;
  isComplete: boolean;
  isExpanded: boolean;
  isEditable: boolean;
  lyDoTuChoi?: any; // LyDoTuChoiDto | null
  children: React.ReactNode;
  onToggle: (id: string) => void;
  onEdit: (phanId: string, id: string) => void;
  onDelete: (phanId: string, id: string) => void;
  onShowLyDo: (lyDo: string) => void; // thêm prop
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: itemId });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasLyDo = lyDoTuChoi?.lyDo;

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Paper
        sx={{
          mb: 1,
          border: "1px solid #EDEFF3",
          borderRadius: "8px",
          overflow: "hidden",
          bgcolor: CSSVAR.paper,
          transition: "all 0.2s ease",
          "&:hover": { borderColor: CSSVAR.divider },
        }}
      >
        <ListItem
          {...(isEditable ? listeners : {})}
          sx={{
            px: 1.5,
            py: 0.75,
            bgcolor: isExpanded ? "#F5F6F8" : "transparent",
            cursor: isEditable ? "grab" : "default",
            touchAction: "none",
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            "&:hover": {
              bgcolor: "rgba(0,0,0,0.02)",
            },
          }}
          onClick={() => onToggle(itemId)}
        >
          {/* Vùng bên trái: Icon + Tiêu đề + Chip số câu hỏi */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
              flex: "1 1 auto",
            }}
          >
            <ListItemIcon sx={{ minWidth: 28, flexShrink: 0 }}>
              {isComplete ? (
                <CheckCircle sx={{ fontSize: 18, color: MAU.chinh }} />
              ) : (
                <RadioButtonUnchecked
                  sx={{ fontSize: 18, color: "var(--ev-grey, #C7CCD6)" }}
                />
              )}
            </ListItemIcon>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                minWidth: 0,
                flex: 1,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 500,
                  fontSize: 14,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  minWidth: 0,
                }}
              >
                <Box component="span" sx={{ fontWeight: 800 }}>
                  {`Bài kiểm tra ${soThuTuMuc}: `}
                </Box>
                {tenHienThi}
              </Typography>
              <Chip
                size="small"
                label={`${kt.soCauHoi ?? 0} câu hỏi`}
                sx={{
                  fontSize: 10,
                  fontWeight: 700,
                  bgcolor: isComplete ? `${MAU.chinh}1A` : "#F1F2F5",
                  color: isComplete ? MAU.chinhDam : CSSVAR.textMuted,
                  flexShrink: 0,
                }}
              />
            </Box>
          </Box>

          {/* Vùng bên phải: Tên người thực hiện + Các nút thao tác */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              flexShrink: 0,
            }}
          >
            <NguoiThucHienLabel
              createdBy={(kt as any).createdBy}
              updatedBy={(kt as any).updatedBy}
              updatedDate={(kt as any).updatedDate}
              sx={{ mr: 0.5 }}
            />
            {isEditable && (
              <>
                <Tooltip title="Sửa bài kiểm tra">
                  <IconButton
                    {...noPropagation}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(phanId, itemId);
                    }}
                  >
                    <EditOutlined
                      fontSize="small"
                      sx={{ color: "var(--ev-text-muted, #9AA2B1)" }}
                    />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Xóa bài kiểm tra">
                  <IconButton
                    {...noPropagation}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(phanId, itemId);
                    }}
                  >
                    <DeleteOutlined
                      fontSize="small"
                      sx={{ color: "var(--ev-text-muted, #9AA2B1)" }}
                    />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {/* Hiển thị lý do qiuzzz - khi bấm vào mở popup */}
            {hasLyDo && (
              <IconButton
                {...noPropagation}
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowLyDo(lyDoTuChoi.lyDo);
                }}
                sx={{
                  color: STATUS.error,
                  "&:hover": { bgcolor: "#FEE2E2" },
                }}
              >
                <ErrorOutlined fontSize="small" />
              </IconButton>
            )}
            <IconButton
              {...noPropagation}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggle(itemId);
              }}
            >
              {isExpanded ? (
                <ExpandLess fontSize="small" />
              ) : (
                <ExpandMore fontSize="small" />
              )}
            </IconButton>
          </Box>
        </ListItem>

        <Collapse in={isExpanded}>
          <Box sx={{ px: 2, pb: 2 }}>
            {children}

            {/* Hiển thị lý do từ chối ở cuối phần mở rộng */}
            {hasLyDo && (
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.5,
                  bgcolor: "#FEF2F2",
                  border: "1px solid #FECACA",
                  borderRadius: "8px",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "#991B1B",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <ErrorOutlined sx={{ fontSize: 16, mt: 0.2 }} />
                  <Box
                    dangerouslySetInnerHTML={{ __html: lyDoTuChoi.lyDo }}
                    sx={{
                      "& p": { margin: 0 },
                      "& ul, & ol": { margin: "4px 0", paddingLeft: "18px" },
                    }}
                  />
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </Paper>
    </div>
  );
}

// ===== INTERFACE =====
interface CauHoiFormData {
  id: string;
  noiDungCauHoi: string;
  loaiCauHoi: "ONE" | "MULTI";
  doKho: "De" | "TrungBinh" | "Kho";
  danhSachDapAn: {
    id: string;
    noiDungDapAn: string;
    laDapAnDung: boolean;
    thuTuSapXep: number;
    giaiThich?: string;
  }[];
}

// ===== ẢNH 1: FORM TẠO QUIZ =====
function QuizCreateForm({
  data,
  onDataChange,
  onCancel,
  onSubmit,
  loading,
}: {
  data: { tenBaiKiemTra: string; moTa: string };
  onDataChange: (field: string, value: any) => void;
  onCancel: () => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  const soKyTuConLai = 80 - (data.tenBaiKiemTra?.length || 0);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 2.5,
        border: "1.5px dashed #C7CCD6",
        borderRadius: "14px",
        bgcolor: CSSVAR.paper,
      }}
    >
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: 16,
          color: CSSVAR.textPrimary,
        }}
      >
        Bài kiểm tra mới: Nhập tiêu đề
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <TextField
          {...noPropagation}
          fullWidth
          placeholder="Nhập tiêu đề bài kiểm tra"
          value={data.tenBaiKiemTra || ""}
          onChange={(e) => {
            if (e.target.value.length <= 80) {
              onDataChange("tenBaiKiemTra", e.target.value);
            }
          }}
          variant="outlined"
          disabled={loading}
          autoFocus
          slotProps={{
            input: {
              sx: {
                bgcolor: CSSVAR.paper,
                borderRadius: "10px",
                fontSize: 14.5,
                "& fieldset": { borderColor: "#E3E6EB" },
                "&:hover fieldset": { borderColor: "#C7CCD6" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: MAU.chinh,
                  borderWidth: 1.5,
                },
              },
            },
          }}
        />
        <Typography
          sx={{
            fontSize: 12,
            color: soKyTuConLai <= 10 ? "#C62828" : "#9AA2B1",
            textAlign: "right",
          }}
        >
          {soKyTuConLai} ký tự còn lại
        </Typography>
      </Box>

      <Box>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 12.5,
            color: CSSVAR.textMuted,
            mb: 0.5,
          }}
        >
          Mô tả bài kiểm tra
        </Typography>
        <RichTextEditor
          value={data.moTa || ""}
          onChange={(value) => onDataChange("moTa", value)}
          placeholder="Mô tả ngắn gọn về bài kiểm tra này..."
          disabled={loading}
          minHeight={120}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
        <Button
          {...noPropagation}
          onClick={onCancel}
          disabled={loading}
          sx={{
            textTransform: "none",
            color: CSSVAR.textMuted,
            fontWeight: 600,
            borderRadius: "8px",
            px: 2,
            "&:hover": { bgcolor: "var(--ev-paper-alt, #F5F6F8)" },
          }}
        >
          Hủy bỏ
        </Button>
        <Button
          {...noPropagation}
          variant="contained"
          onClick={onSubmit}
          disabled={loading || !data.tenBaiKiemTra?.trim()}
          sx={{
            bgcolor: CSSVAR.divider,
            color: CSSVAR.textMuted,
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            borderRadius: "8px",
            boxShadow: "none",
            "&:hover": {
              bgcolor: data.tenBaiKiemTra?.trim() ? MAU.chinhDam : CSSVAR.divider,
              boxShadow: "none",
            },
            ...(data.tenBaiKiemTra?.trim() && {
              bgcolor: MAU.chinh,
              color: "#fff",
            }),
            "&.Mui-disabled": { bgcolor: CSSVAR.divider, color: "#A1A6B0" },
          }}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: "#fff" }} />
          ) : (
            "Thêm bài kiểm tra"
          )}
        </Button>
      </Box>
    </Box>
  );
}

// ===== ẢNH 2: FORM CẬP NHẬT QUIZ =====
function QuizUpdateForm({
  data,
  onDataChange,
  onCancel,
  onSubmit,
  loading,
}: {
  data: { tenBaiKiemTra: string; moTa: string };
  onDataChange: (field: string, value: any) => void;
  onCancel: () => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  const soKyTuConLai = 80 - (data.tenBaiKiemTra?.length || 0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: 16,
          color: CSSVAR.textPrimary,
        }}
      >
        Sửa bài kiểm tra
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <TextField
          {...noPropagation}
          fullWidth
          placeholder="Nhập tiêu đề bài kiểm tra"
          value={data.tenBaiKiemTra || ""}
          onChange={(e) => {
            if (e.target.value.length <= 80) {
              onDataChange("tenBaiKiemTra", e.target.value);
            }
          }}
          variant="outlined"
          size="small"
          disabled={loading}
          autoFocus
          slotProps={{
            input: {
              sx: {
                bgcolor: CSSVAR.paper,
                fontWeight: 600,
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: MAU.chinh,
                  borderWidth: 2,
                },
              },
            },
          }}
        />
        <Typography
          sx={{
            fontSize: 12,
            color: soKyTuConLai <= 10 ? "#C62828" : CSSVAR.textMuted,
            textAlign: "right",
          }}
        >
          {soKyTuConLai} ký tự còn lại
        </Typography>
      </Box>

      <Box>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 12.5,
            color: CSSVAR.textMuted,
            mb: 0.5,
          }}
        >
          Mô tả bài kiểm tra
        </Typography>
        <RichTextEditor
          value={data.moTa || ""}
          onChange={(value) => onDataChange("moTa", value)}
          placeholder="Mô tả ngắn gọn về bài kiểm tra này..."
          disabled={loading}
          minHeight={120}
        />
      </Box>

      <Box
        sx={{ display: "flex", gap: 1, justifyContent: "flex-end", mt: 0.5 }}
      >
        <Button
          {...noPropagation}
          onClick={onCancel}
          disabled={loading}
          sx={{
            textTransform: "none",
            color: CSSVAR.textMuted,
            fontWeight: 600,
            borderRadius: "8px",
            "&:hover": { bgcolor: "var(--ev-paper-alt, #F5F6F8)" },
          }}
        >
          Hủy bỏ
        </Button>
        <Button
          {...noPropagation}
          variant="contained"
          onClick={onSubmit}
          disabled={loading || !data.tenBaiKiemTra?.trim()}
          sx={{
            bgcolor: MAU.chinh,
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            borderRadius: "8px",
            boxShadow: "none",
            "&:hover": { bgcolor: MAU.chinhDam, boxShadow: "none" },
            "&.Mui-disabled": { bgcolor: CSSVAR.divider, color: "#A1A6B0" },
          }}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: "#fff" }} />
          ) : (
            "Lưu bài kiểm tra"
          )}
        </Button>
      </Box>
    </Box>
  );
}

// ===== ẢNH 3: FORM THÊM/SỬA CÂU HỎI VÀ ĐÁP ÁN =====
const CHU_CAI = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
];

function dinhDangNgayGio(ngay?: string | null): string {
  if (!ngay) return "";
  try {
    const d = new Date(ngay);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function NguoiThucHienLabel({
  createdBy,
  updatedBy,
  updatedDate,
  sx,
}: {
  createdBy?: string | null;
  updatedBy?: string | null;
  updatedDate?: string | null;
  sx?: object;
}) {
  const tao = createdBy?.trim();
  const suaGanNhat = updatedBy?.trim();
  const tenHienThi = suaGanNhat || tao;
  if (!tenHienThi) return null;

  const coNguoiSuaKhac = !!suaGanNhat && suaGanNhat !== tao;
  const ngayHienThi = dinhDangNgayGio(updatedDate);

  return (
    <Tooltip
      title={
        <Box sx={{ fontSize: 12 }}>
          {coNguoiSuaKhac ? (
            <>
              <Box>Tạo bởi: {tao}</Box>
              <Box>Sửa gần nhất bởi: {suaGanNhat}</Box>
            </>
          ) : (
            <Box>Tạo bởi: {tenHienThi}</Box>
          )}
          {ngayHienThi && <Box sx={{ opacity: 0.8 }}>Lúc: {ngayHienThi}</Box>}
        </Box>
      }
    >
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.4,
          flexShrink: 0,
          cursor: "default",
          maxWidth: { xs: 110, sm: 150, md: 200 },
          ...sx,
        }}
      >
        <PersonOutlineIcon
          sx={{ fontSize: 13, color: "#9AA2B1", flexShrink: 0 }}
        />
        <Typography
          component="span"
          sx={{
            fontSize: 11,
            fontWeight: 500,
            color: "#9AA2B1",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {tenHienThi}
        </Typography>
      </Box>
    </Tooltip>
  );
}

function QuestionDetailForm({
  question,
  onQuestionChange,
  onAddDapAn,
  onRemoveDapAn,
  onUpdateDapAn,
  onToggleDapAnDung,
  onSave,
  onCancel,
  loading,
  isEditing,
  quizTitle,
}: {
  question: CauHoiFormData;
  onQuestionChange: (field: string, value: any) => void;
  onAddDapAn: () => void;
  onRemoveDapAn: (dId: string) => void;
  onUpdateDapAn: (dId: string, field: string, value: any) => void;
  onToggleDapAnDung: (dId: string, checked: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
  isEditing: boolean;
  quizTitle?: string;
}) {
  const hasDapAnDung =
    question.danhSachDapAn?.some((d) => d.laDapAnDung) || false;
  const soDapAn = question.danhSachDapAn?.length || 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1.5,
          borderBottom: "1px solid #EDEFF3",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor: `${MAU.chinh}1A`,
              color: MAU.chinhDam,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {isEditing ? (
              <EditOutlined sx={{ fontSize: 15 }} />
            ) : (
              <Add sx={{ fontSize: 18 }} />
            )}
          </Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 16,
              color: CSSVAR.textPrimary,
            }}
          >
            {isEditing ? "Sửa câu hỏi" : "Thêm câu hỏi trắc nghiệm"}
          </Typography>
        </Box>
        {quizTitle && (
          <Chip
            size="small"
            label={quizTitle}
            sx={{
              fontSize: 11,
              fontWeight: 600,
              bgcolor: "var(--ev-paper-alt, #F5F6F8)",
              color: CSSVAR.textMuted,
              maxWidth: 220,
            }}
          />
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Loại câu hỏi</InputLabel>
          <Select
            {...noPropagation}
            label="Loại câu hỏi"
            value={question.loaiCauHoi}
            onChange={(e) => onQuestionChange("loaiCauHoi", e.target.value)}
            disabled={loading}
            sx={{
              bgcolor: CSSVAR.paper,
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: MAU.chinh,
              },
            }}
          >
            <MenuItem value="ONE">Chọn một đáp án</MenuItem>
            <MenuItem value="MULTI">Chọn nhiều đáp án</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 14,
            color: CSSVAR.textPrimary,
            mb: 1,
          }}
        >
          Câu hỏi
        </Typography>
        <RichTextEditor
          value={question.noiDungCauHoi || ""}
          onChange={(value) => onQuestionChange("noiDungCauHoi", value)}
          placeholder="Nhập nội dung câu hỏi..."
          disabled={loading}
          minHeight={130}
        />
      </Box>

      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 14,
              color: CSSVAR.textPrimary,
            }}
          >
            Đáp án
          </Typography>
          <Typography
            sx={{ fontSize: 12, color: CSSVAR.textMuted }}
          >
            {soDapAn}/15 đáp án
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          {(question.danhSachDapAn || []).map((d, index) => (
            <Box
              key={d.id}
              sx={{
                position: "relative",
                border: `1.5px solid ${d.laDapAnDung ? MAU.chinh : "#E3E6EB"}`,
                borderRadius: "10px",
                bgcolor: d.laDapAnDung ? `${MAU.chinh}0A` : "#fff",
                transition: "all 0.15s ease",
                p: 1.5,
                "&:hover": {
                  borderColor: d.laDapAnDung ? MAU.chinh : "#C7CCD6",
                },
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.5,
                    pt: 0.25,
                  }}
                >
                  <Box
                    onClick={() => {
                      if (!loading) {
                        onToggleDapAnDung(d.id, !d.laDapAnDung);
                      }
                    }}
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      bgcolor: d.laDapAnDung ? MAU.chinh : "#F1F2F5",
                      color: d.laDapAnDung ? "#fff" : CSSVAR.textMuted,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 12,
                      flexShrink: 0,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {CHU_CAI[index] || index + 1}
                  </Box>
                  {question.loaiCauHoi === "ONE" ? (
                    <Radio
                      {...noPropagation}
                      checked={Boolean(d.laDapAnDung)}
                      onChange={() =>
                        onToggleDapAnDung(d.id, true)
                      }
                      size="small"
                      sx={{
                        p: 0,
                        color: "var(--ev-grey, #C7CCD6)",
                        "&.Mui-checked": { color: MAU.chinh },
                      }}
                      disabled={loading}
                    />
                  ) : (
                    <Checkbox
                      {...noPropagation}
                      checked={Boolean(d.laDapAnDung)}
                      onChange={(e) =>
                        onToggleDapAnDung(d.id, e.target.checked)
                      }
                      size="small"
                      sx={{
                        p: 0,
                        color: "var(--ev-grey, #C7CCD6)",
                        "&.Mui-checked": { color: MAU.chinh },
                      }}
                      disabled={loading}
                    />
                  )}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <TextField
                    {...noPropagation}
                    fullWidth
                    size="small"
                    placeholder={`Nhập đáp án ${CHU_CAI[index] || index + 1}`}
                    value={d.noiDungDapAn || ""}
                    onChange={(e) =>
                      onUpdateDapAn(d.id, "noiDungDapAn", e.target.value)
                    }
                    disabled={loading}
                    variant="standard"
                    slotProps={{
                      input: {
                        disableUnderline: true,
                        sx: { fontSize: 14, fontWeight: 500 },
                      },
                    }}
                  />
                </Box>

                <Tooltip
                  title={
                    soDapAn <= SO_DAP_AN_TOI_THIEU
                      ? `Cần giữ tối thiểu ${SO_DAP_AN_TOI_THIEU} đáp án`
                      : "Xóa đáp án"
                  }
                >
                  <span>
                    <IconButton
                      {...noPropagation}
                      size="small"
                      onClick={() => onRemoveDapAn(d.id)}
                      disabled={loading || soDapAn <= SO_DAP_AN_TOI_THIEU}
                      sx={{
                        flexShrink: 0,
                        color: CSSVAR.textMuted,
                        "&:hover": {
                          color: STATUS.error,
                          bgcolor: "#FEE2E2",
                        },
                      }}
                    >
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>

                {question.danhSachDapAn.length < SO_DAP_AN_TOI_THIEU && (
                  <Box
                    sx={{
                      mt: 1,
                      px: 1.5,
                      py: 0.75,
                      bgcolor: "#FDECEC",
                      borderRadius: "8px",
                    }}
                  >
                    <Typography sx={{ fontSize: 12.5, color: "#C62828" }}>
                      Cần ít nhất {SO_DAP_AN_TOI_THIEU} đáp án
                    </Typography>
                  </Box>
                )}
                {!hasDapAnDung && (
                  <Box
                    sx={{
                      mt: 1,
                      px: 1.5,
                      py: 0.75,
                      bgcolor: "#FDECEC",
                      borderRadius: "8px",
                    }}
                  >
                    <Typography sx={{ fontSize: 12.5, color: "#C62828" }}>
                      Vui lòng chọn ít nhất một đáp án đúng
                    </Typography>
                  </Box>
                )}
                {soDapAn >= SO_DAP_AN_TOI_DA && (
                  <Box
                    sx={{
                      mt: 1,
                      px: 1.5,
                      py: 0.75,
                      bgcolor: "#FFF4E5",
                      borderRadius: "8px",
                    }}
                  >
                    <Typography sx={{ fontSize: 12.5, color: "#B26A00" }}>
                      Đã đạt tối đa {SO_DAP_AN_TOI_DA} đáp án
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>

        <Button
          {...noPropagation}
          startIcon={<Add />}
          onClick={onAddDapAn}
          disabled={loading || soDapAn >= 15}
          fullWidth
          sx={{
            mt: 1.25,
            textTransform: "none",
            fontWeight: 600,
            fontSize: 13.5,
            color: MAU.chinh,
            border: `1.5px dashed ${MAU.chinh}66`,
            borderRadius: "10px",
            py: 1.1,
            "&:hover": {
              bgcolor: `${MAU.chinh}0F`,
              borderColor: MAU.chinh,
            },
          }}
        >
          Thêm đáp án
        </Button>

        {!hasDapAnDung && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              mt: 1,
              px: 1.5,
              py: 0.75,
              bgcolor: "#FDECEC",
              borderRadius: "8px",
            }}
          >
            <ErrorOutlined sx={{ fontSize: 16, color: "#C62828" }} />
            <Typography
              sx={{ fontSize: 12.5, color: "#C62828", fontWeight: 500 }}
            >
              Vui lòng chọn ít nhất một đáp án đúng
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          justifyContent: "flex-end",
          pt: 1.5,
          borderTop: "1px solid #EDEFF3",
        }}
      >
        <Button
          {...noPropagation}
          onClick={onCancel}
          disabled={loading}
          sx={{
            textTransform: "none",
            color: CSSVAR.textMuted,
            fontWeight: 600,
            borderRadius: "8px",
            "&:hover": { bgcolor: "var(--ev-paper-alt, #F5F6F8)" },
          }}
        >
          Hủy bỏ
        </Button>
        <Button
          {...noPropagation}
          variant="contained"
          onClick={onSave}
          disabled={
            loading ||
            !question.noiDungCauHoi?.trim() ||
            !question.danhSachDapAn?.some((d) => d.laDapAnDung)
          }
          sx={{
            bgcolor: MAU.chinh,
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            borderRadius: "8px",
            boxShadow: "none",
            "&:hover": { bgcolor: MAU.chinhDam, boxShadow: "none" },
            "&.Mui-disabled": { bgcolor: CSSVAR.divider, color: "#A1A6B0" },
          }}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: "#fff" }} />
          ) : (
            "Lưu câu hỏi"
          )}
        </Button>
      </Box>
    </Box>
  );
}

// ===== ẢNH 4: DANH SÁCH CÂU HỎI =====
function QuestionListView({
  questions,
  onEdit,
  onDelete,
  onAddNew,
  isEditable,
  showAddButton = true,
  expandedQuestions,
  onToggleQuestion,
}: {
  questions: any[];
  onEdit: (question: any) => void;
  onDelete: (questionId: string) => void;
  onAddNew: () => void;
  isEditable: boolean;
  showAddButton?: boolean;
  expandedQuestions: Record<string, boolean>;
  onToggleQuestion: (id: string) => void;
}) {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 14.5,
            color: CSSVAR.textPrimary,
          }}
        >
          Câu hỏi{" "}
          <Box
            component="span"
            sx={{
              fontWeight: 600,
              fontSize: 12.5,
              color: CSSVAR.textMuted,
              ml: 0.5,
            }}
          >
            ({questions.length})
          </Box>
        </Typography>
        {isEditable && showAddButton && (
          <Button
            {...noPropagation}
            size="small"
            startIcon={<Add sx={{ fontSize: 16 }} />}
            onClick={onAddNew}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13,
              color: MAU.chinh,
              borderRadius: "8px",
              "&:hover": { bgcolor: `${MAU.chinh}0F` },
            }}
          >
            Câu hỏi mới
          </Button>
        )}
      </Box>

      {questions.length === 0 ? (
        <Box
          sx={{
            border: "1.5px dashed #E3E6EB",
            borderRadius: "10px",
            py: 3,
            textAlign: "center",
          }}
        >
          <QuizOutlined
            sx={{ fontSize: 28, color: "var(--ev-grey, #C7CCD6)", mb: 0.5 }}
          />
          <Typography
            sx={{ fontSize: 13, color: CSSVAR.textMuted }}
          >
            Chưa có câu hỏi nào trong bài kiểm tra này.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          {questions.map((q, index) => {
            const isExpanded = expandedQuestions[q.id] || false;
            const plainText = stripHtml(
              q.noiDungCauHoi || "Câu hỏi chưa có nội dung",
            );

            return (
              <Paper
                key={q.id}
                elevation={0}
                sx={{
                  border: "1px solid #EDEFF3",
                  borderRadius: "10px",
                  bgcolor: CSSVAR.paper,
                  transition: "all 0.15s ease",
                  "&:hover": {
                    borderColor: MAU.chinh,
                    boxShadow: "0 1px 6px rgba(17,24,39,0.06)",
                  },
                  overflow: "hidden",
                }}
              >
                {/* Header – có thể bấm để mở rộng */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    px: 1.5,
                    py: 1,
                    cursor: "pointer",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.02)" },
                  }}
                  onClick={() => onToggleQuestion(q.id)}
                >
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      bgcolor: `${MAU.chinh}14`,
                      color: MAU.chinhDam,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: CSSVAR.textPrimary,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {plainText}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                        mt: 0.25,
                      }}
                    >
                      <Chip
                        size="small"
                        label={
                          q.loaiCauHoi === "ONE"
                            ? "Trắc nghiệm"
                            : "Lựa chọn nhiều"
                        }
                        sx={{
                          fontSize: 10,
                          fontWeight: 600,
                          bgcolor: `${MAU.chinh}14`,
                          color: MAU.chinhDam,
                          height: 18,
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: 11,
                          color: CSSVAR.textMuted,
                        }}
                      >
                        {q.danhSachDapAn?.length ?? 0} đáp án
                      </Typography>
                    </Box>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleQuestion(q.id);
                    }}
                  >
                    {isExpanded ? (
                      <ExpandLess fontSize="small" />
                    ) : (
                      <ExpandMore fontSize="small" />
                    )}
                  </IconButton>

                  {isEditable && showAddButton && (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.25,
                        flexShrink: 0,
                      }}
                    >
                      <Tooltip title="Sửa câu hỏi">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(q);
                          }}
                          sx={{
                            color: "var(--ev-text-muted, #9AA2B1)",
                            "&:hover": { color: MAU.chinh },
                          }}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa câu hỏi">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(q.id);
                          }}
                          sx={{
                            color: "var(--ev-text-muted, #9AA2B1)",
                            "&:hover": { color: "#C62828" },
                          }}
                        >
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>

                {/* Phần mở rộng hiển thị chi tiết câu hỏi và đáp án */}
                <Collapse in={isExpanded}>
                  <Box sx={{ px: 2, pb: 2 }}>
                    {/* Nội dung câu hỏi (hỗ trợ HTML) */}
                    <Box
                      dangerouslySetInnerHTML={{
                        __html: cleanHtmlContent(q.noiDungCauHoi || ""),
                      }}
                      sx={{
                        mb: 1.5,
                        "& p": { margin: "0 0 0.5em 0" },
                        "& ul, & ol": { margin: "4px 0", paddingLeft: "18px" },
                      }}
                    />
                    {/* Danh sách đáp án */}
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: CSSVAR.textMuted,
                        mb: 0.5,
                      }}
                    >
                      Đáp án:
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      {(q.danhSachDapAn || []).map((d: any, idx: number) => (
                        <Box
                          key={d.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            px: 1.5,
                            py: 0.75,
                            borderRadius: "6px",
                            bgcolor: d.laDapAnDung
                              ? `${MAU.chinh}0A`
                              : "transparent",
                            border: d.laDapAnDung
                              ? `1px solid ${MAU.chinh}44`
                              : "1px solid transparent",
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: 13,
                              color: CSSVAR.textMuted,
                              minWidth: 24,
                            }}
                          >
                            {String.fromCharCode(65 + idx)}.
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 13,
                              color: CSSVAR.textPrimary,
                            }}
                          >
                            {d.noiDungDapAn || "(Trống)"}
                          </Typography>
                          {d.laDapAnDung && (
                            <CheckCircle
                              sx={{
                                fontSize: 16,
                                color: MAU.chinh,
                                ml: "auto",
                              }}
                            />
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Collapse>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

// ===== BÀI GIẢNG: CHẾ ĐỘ XEM (READ-ONLY) =====
function LectureInfoView({
  bg,
  onPlayVideo,
  onOpenDoc,
  onDeleteDoc,
  isEditable,
}: {
  bg: BaiGiangType;
  onPlayVideo: (url: string) => void;
  onOpenDoc: (url: string, name: string) => void;
  onDeleteDoc: (taiLieuId: string) => void;
  isEditable: boolean;
}) {
  const taiLieus = (bg.danhSachTaiLieu ?? (bg as any).taiLieus ?? []) as TaiLieuType[];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.75,
          p: 1.5,
          border: "1px solid #EDEFF3",
          borderRadius: "12px",
          bgcolor: "var(--ev-paper-alt, #FAFBFC)",
        }}
      >
        <Box
          onClick={() => bg.urlBaiGiang && onPlayVideo(bg.urlBaiGiang)}
          sx={{
            position: "relative",
            width: 108,
            height: 68,
            borderRadius: "10px",
            flexShrink: 0,
            bgcolor: bg.urlBaiGiang ? CSSVAR.textPrimary : CSSVAR.divider,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: bg.urlBaiGiang ? "pointer" : "default",
            overflow: "hidden",
            "&:hover .play-overlay": { transform: "scale(1.08)" },
          }}
        >
          {bg.urlBaiGiang ? (
            <PlayCircleOutlined
              className="play-overlay"
              sx={{
                fontSize: 34,
                color: "#fff",
                transition: "transform 0.15s ease",
              }}
            />
          ) : (
            <OndemandVideoOutlined
              sx={{ fontSize: 26, color: "var(--ev-grey, #C7CCD6)" }}
            />
          )}
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 0.6,
          }}
        >
          <Typography
            sx={{
              fontSize: 13.5,
              fontWeight: 700,
              color: CSSVAR.textPrimary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {bg.tieuDe || "Chưa đặt tên"}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              flexWrap: "wrap",
            }}
          >
            <Chip
              size="small"
              icon={<ScheduleOutlined sx={{ fontSize: 14 }} />}
              label={
                bg.urlBaiGiang
                  ? dinhDangThoiLuong(bg.thoiLuong ?? 0)
                  : "Chưa có thời lượng"
              }
              sx={{
                fontSize: 11,
                fontWeight: 600,
                height: 22,
                bgcolor: "#F1F2F5",
                color: CSSVAR.textSecondary,
                "& .MuiChip-icon": {
                  color: CSSVAR.textMuted,
                  ml: "6px",
                },
              }}
            />
            <Chip
              size="small"
              icon={
                bg.laBaiGiangFree ? (
                  <LockOpenOutlined sx={{ fontSize: 14 }} />
                ) : (
                  <LockOutlined sx={{ fontSize: 14 }} />
                )
              }
              label={bg.laBaiGiangFree ? "Xem thử miễn phí" : "Yêu cầu đăng ký"}
              sx={{
                fontSize: 11,
                fontWeight: 600,
                height: 22,
                bgcolor: bg.laBaiGiangFree ? `${MAU.chinh}14` : "#F1F2F5",
                color: bg.laBaiGiangFree ? MAU.chinhDam : CSSVAR.textMuted,
                "& .MuiChip-icon": {
                  color: bg.laBaiGiangFree ? MAU.chinhDam : CSSVAR.textMuted,
                  ml: "6px",
                },
              }}
            />
            {!bg.urlBaiGiang && (
              <Chip
                size="small"
                label="Chưa có video"
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  height: 22,
                  bgcolor: "#FDECEC",
                  color: "#C62828",
                }}
              />
            )}
          </Box>
        </Box>
      </Box>

      <Box>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 12.5,
            color: CSSVAR.textMuted,
            mb: 0.75,
            textTransform: "uppercase",
            letterSpacing: 0.3,
          }}
        >
          Tài nguyên ({taiLieus.length})
        </Typography>

        {taiLieus.length === 0 ? (
          <Typography
            sx={{ fontSize: 12.5, color: "#B0B6C0", fontStyle: "italic" }}
          >
            Chưa có tài liệu đính kèm.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6 }}>
            {taiLieus.map((tl) => (
              <Box
                key={tl.id}
                onClick={() => {
                  const docUrl = (tl as any).url || (tl as any).duongDan || "";
                  if (docUrl) {
                    onOpenDoc(docUrl, tl.tenTaiLieu || "Tài liệu");
                  }
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.25,
                  py: 0.85,
                  border: "1px solid #EDEFF3",
                  borderRadius: "8px",
                  cursor: "pointer",
                  bgcolor: CSSVAR.paper,
                  "&:hover": {
                    borderColor: MAU.chinh,
                    bgcolor: `${MAU.chinh}08`,
                  },
                }}
              >
                <DescriptionOutlined sx={{ fontSize: 17, color: MAU.chinh }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: CSSVAR.textPrimary,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tl.tenTaiLieu}
                  </Typography>
                  {tl.loaiTaiLieu && (
                    <Typography
                      sx={{
                        fontSize: 10.5,
                        color: "var(--ev-text-muted, #9AA2B1)",
                      }}
                    >
                      {tl.loaiTaiLieu}
                    </Typography>
                  )}
                </Box>
                <NguoiThucHienLabel
                  createdBy={(tl as any).createdBy}
                  updatedBy={(tl as any).updatedBy}
                  updatedDate={(tl as any).updatedDate}
                />
                {isEditable && (
                  <IconButton
                    {...noPropagation}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDoc(tl.id as string);
                    }}
                    sx={{
                      color: "var(--ev-grey, #C7CCD6)",
                      "&:hover": { color: "#C62828" },
                    }}
                  >
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ===== FORM TẠO BÀI GIẢNG MỚI =====
function LectureCreateForm({
  data,
  onDataChange,
  onSelectFile,
  onCancel,
  onSubmit,
  loading,
}: {
  data: { title: string; file: File | null; isFree: boolean };
  onDataChange: (field: "title" | "isFree", value: any) => void;
  onSelectFile: (file: File) => void;
  onCancel: () => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  const soKyTuConLai = 100 - (data.title?.length || 0);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await validateVideoFile(file);
    if (result.valid) {
      onSelectFile(file);
    } else {
      alert(`File không hợp lệ: ${result.error}`);
    }
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (loading) return;
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const result = await validateVideoFile(file);
    if (result.valid) {
      onSelectFile(file);
    } else {
      alert(`File không hợp lệ: ${result.error}`);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
        p: 0,
        borderRadius: "18px",
        overflow: "hidden",
        border: "1px solid #E7E9F0",
        bgcolor: CSSVAR.paper,
        boxShadow: "0 4px 24px rgba(17,24,39,0.06)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2.5,
          py: 2,
          background: `linear-gradient(135deg, ${MAU.chinh} 0%, ${MAU.chinhDam} 100%)`,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            bgcolor: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(4px)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <OndemandVideoOutlined sx={{ fontSize: 19 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>
            Bài giảng mới
          </Typography>
          <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
            Thêm video và thông tin cho bài giảng
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          px: 2.5,
          pb: 2.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 12.5,
              color: CSSVAR.textMuted,
              mb: 0.75,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            Tên bài giảng
            <Box component="span" sx={{ color: MAU.chinh }}>
              *
            </Box>
          </Typography>
          <TextField
            {...noPropagation}
            fullWidth
            placeholder="Ví dụ: Giới thiệu tổng quan khóa học"
            value={data.title || ""}
            onChange={(e) => {
              if (e.target.value.length <= 100) {
                onDataChange("title", e.target.value);
              }
            }}
            autoFocus
            required
            disabled={loading}
            slotProps={{
              input: {
                sx: {
                  bgcolor: CSSVAR.paperAlt,
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: 14.5,
                  height: "50px",
                  transition: "background-color 0.15s ease",
                  "& fieldset": { borderColor: CSSVAR.divider },
                  "&:hover": { bgcolor: CSSVAR.paperAlt },
                  "&.Mui-focused": { bgcolor: CSSVAR.paper },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: MAU.chinh,
                    borderWidth: 2,
                  },
                },
              },
            }}
          />
          <Typography
            sx={{
              fontSize: 11,
              color: soKyTuConLai <= 10 ? "#C62828" : "#B0B6C0",
              textAlign: "right",
              mt: 0.4,
            }}
          >
            {soKyTuConLai} ký tự còn lại
          </Typography>
        </Box>

        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 12.5,
              color: CSSVAR.textMuted,
              mb: 0.75,
            }}
          >
            Video bài giảng
          </Typography>

          {!data.file ? (
            <Box
              component="label"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                py: 4.5,
                borderRadius: "14px",
                bgcolor: isDragOver ? `${MAU.chinh}0D` : "#FAFBFC",
                border: `2px dashed ${isDragOver ? MAU.chinh : "#D7DBE3"}`,
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: MAU.chinh,
                  bgcolor: `${MAU.chinh}08`,
                  "& .upload-icon": { transform: "translateY(-2px)" },
                },
              }}
            >
              <Box
                className="upload-icon"
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  bgcolor: `${MAU.chinh}14`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.2s ease",
                }}
              >
                <CloudUploadOutlined sx={{ fontSize: 26, color: MAU.chinh }} />
              </Box>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: CSSVAR.textPrimary,
                }}
              >
                Kéo thả hoặc bấm để chọn video
              </Typography>
              <Typography
                sx={{ fontSize: 11.5, color: "var(--ev-text-muted, #9AA2B1)" }}
              >
                Dung lượng tối đa 100MB · Độ phân giải tối thiểu 854×480
              </Typography>
              <input
                type="file"
                accept="video/*"
                hidden
                disabled={loading}
                onChange={handleFileInput}
              />
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.5,
                border: `1.5px solid ${MAU.chinh}33`,
                borderRadius: "14px",
                bgcolor: `${MAU.chinh}06`,
              }}
            >
              <Box
                sx={{
                  width: 88,
                  height: 56,
                  borderRadius: "10px",
                  bgcolor: MAU.chinh,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <PlayCircleOutlined sx={{ fontSize: 28, color: "#fff" }} />
              </Box>
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.3,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: CSSVAR.textPrimary,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {data.file.name}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                  <CheckCircle sx={{ fontSize: 13, color: MAU.chinh }} />
                  <Typography
                    sx={{
                      fontSize: 11.5,
                      color: MAU.chinhDam,
                      fontWeight: 600,
                    }}
                  >
                    Video đã sẵn sàng
                    {data.file.size
                      ? ` · ${dinhDangDungLuong(data.file.size)}`
                      : ""}
                  </Typography>
                </Box>
              </Box>
              <Button
                {...noPropagation}
                component="label"
                size="small"
                startIcon={<AutorenewOutlined fontSize="small" />}
                disabled={loading}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 12.5,
                  color: MAU.chinh,
                  bgcolor: CSSVAR.paper,
                  border: `1px solid ${MAU.chinh}44`,
                  borderRadius: "9px",
                  px: 1.5,
                  flexShrink: 0,
                  "&:hover": {
                    bgcolor: `${MAU.chinh}0F`,
                    borderColor: MAU.chinh,
                  },
                }}
              >
                Thay thế
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  disabled={loading}
                  onChange={handleFileInput}
                />
              </Button>
            </Box>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 1.75,
            py: 1.25,
            borderRadius: "12px",
            bgcolor: data.isFree ? `${MAU.chinh}0A` : CSSVAR.paperAlt,
            border: `1px solid ${data.isFree ? `${MAU.chinh}33` : CSSVAR.divider}`,
            transition: "all 0.15s ease",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "9px",
                bgcolor: data.isFree ? MAU.chinh : CSSVAR.divider,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.15s ease",
              }}
            >
              {data.isFree ? (
                <LockOpenOutlined sx={{ fontSize: 17, color: "#fff" }} />
              ) : (
                <LockOutlined
                  sx={{ fontSize: 17, color: "var(--ev-text-muted, #9AA2B1)" }}
                />
              )}
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: CSSVAR.textPrimary,
                }}
              >
                Xem thử miễn phí
              </Typography>
              <Typography
                sx={{ fontSize: 11, color: CSSVAR.textMuted }}
              >
                Cho phép học viên xem trước khi đăng ký
              </Typography>
            </Box>
          </Box>
          <Switch
            {...noPropagation}
            checked={data.isFree || false}
            disabled={loading}
            onChange={(e) => onDataChange("isFree", e.target.checked)}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": { color: MAU.chinh },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                bgcolor: MAU.chinh,
              },
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: "flex-end",
            pt: 1.5,
            borderTop: "1px solid #F1F2F5",
          }}
        >
          <Button
            {...noPropagation}
            onClick={onCancel}
            disabled={loading}
            sx={{
              textTransform: "none",
              color: CSSVAR.textMuted,
              fontWeight: 700,
              borderRadius: "10px",
              px: 2,
              "&:hover": { bgcolor: "var(--ev-paper-alt, #F5F6F8)" },
            }}
          >
            Hủy bỏ
          </Button>
          <Button
            {...noPropagation}
            variant="contained"
            onClick={onSubmit}
            disabled={loading || !data.title?.trim()}
            sx={{
              bgcolor: MAU.chinh,
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              borderRadius: "10px",
              boxShadow: `0 4px 12px ${MAU.chinh}40`,
              "&:hover": {
                bgcolor: MAU.chinhDam,
                boxShadow: `0 4px 14px ${MAU.chinh}55`,
              },
              "&.Mui-disabled": {
                bgcolor: CSSVAR.divider,
                color: "#A1A6B0",
                boxShadow: "none",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : (
              "Thêm bài giảng"
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

// ===== COMPONENT CHÍNH =====
export default function CurriculumContent() {
  const {
    phans,
    setPhans,
    createPhan,
    updatePhan,
    deletePhan,
    createBaiGiang,
    updateBaiGiang,
    deleteBaiGiang,
    createBaiKiemTra,
    updateBaiKiemTra,
    deleteBaiKiemTra,
    createCauHoi,
    updateCauHoi,
    deleteCauHoi,
    createTaiLieu,
    deleteTaiLieu,
    loading: contextLoading,
    refreshData,
    trangThai,
  } = useCourseEdit();

  // Lấy courseId từ URL
  const params = useParams();
  const courseId = params?.corsesId as string;

  // ===== State =====
  const [expandedLectures, setExpandedLectures] = useState<
    Record<string, boolean>
  >({});
  const [expandedQuizzes, setExpandedQuizzes] = useState<
    Record<string, boolean>
  >({});

  const [quizCreateForm, setQuizCreateForm] = useState<{
    phanId: string;
    tenBaiKiemTra: string;
    moTa: string;
  } | null>(null);

  const [quizUpdateForm, setQuizUpdateForm] = useState<{
    phanId: string;
    quizId: string;
    tenBaiKiemTra: string;
    moTa: string;
  } | null>(null);

  const [questionEditor, setQuestionEditor] = useState<{
    phanId: string;
    quizId: string;
    question: CauHoiFormData;
    isEditing: boolean;
    quizTitle?: string;
  } | null>(null);

  const [addForm, setAddForm] = useState<{
    phanId: string;
    type: "BaiGiang" | "BaiKiemTra";
    title?: string;
    file?: File | null;
    isFree?: boolean;
  } | null>(null);

  const [editingLecture, setEditingLecture] = useState<{
    phanId: string;
    lectureId: string;
    title: string;
    isFree: boolean;
    file: File | null;
  } | null>(null);

  const [menuAnchor, setMenuAnchor] = useState<{
    position: { top: number; left: number };
    phanId: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  // Trạng thái thêm/sửa bài giảng chạy ngầm (không chặn cả trang)
  type BaiGiangDangCho = {
    key: string;
    tieuDe: string;
    isFree: boolean;
  };
  const [pendingLectures, setPendingLectures] = useState<
    Record<string, BaiGiangDangCho[]>
  >({});
  const [updatingLectureIds, setUpdatingLectureIds] = useState<Set<string>>(
    new Set(),
  );
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  const [addResourceForm, setAddResourceForm] = useState<{
    [baiGiangId: string]: {
      tenTaiLieu: string;
      file: File | null;
      open: boolean;
    };
  }>({});

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    onConfirm: () => void;
  }>({
    open: false,
    onConfirm: () => {},
  });

  const [phanForm, setPhanForm] = useState<{
    mode: "add" | "edit";
    phanId?: string;
    tenPhan: string;
  } | null>(null);

  const [videoPopup, setVideoPopup] = useState<{ open: boolean; url: string }>({
    open: false,
    url: "",
  });

  const [docPopup, setDocPopup] = useState<{
    open: boolean;
    url: string;
    name: string;
  }>({
    open: false,
    url: "",
    name: "",
  });

  // State cho popup lý do
  const [lyDoPopup, setLyDoPopup] = useState<{ open: boolean; lyDo: string }>({
    open: false,
    lyDo: "",
  });

  const isEditable = trangThai === "DangSua";

  // ===== SIGNALR (thay thế polling) =====
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const isRefreshingRef = useRef(false);
  const [signalRConnected, setSignalRConnected] = useState(false);

  // Debounce refresh để tránh gọi nhiều lần
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => {
      if (!isRefreshingRef.current) {
        refreshData();
      }
      refreshTimeoutRef.current = null;
    }, 500);
  }, [refreshData]);

  // Kết nối SignalR
  useEffect(() => {
    if (!courseId || !isEditable) {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
        setSignalRConnected(false);
      }
      return;
    }

    const connect = async () => {
      if (connectionRef.current) {
        return;
      }

      try {
        const connection = createCourseHubConnection();
        // =========================
        // ĐĂNG KÝ EVENT
        // =========================

        connection.on(
          "SectionUpdated",
          (courseIdFromEvent: string, sectionId: string) => {
            console.log("📡 SectionUpdated", courseIdFromEvent, sectionId);

            if (courseIdFromEvent === courseId) {
              debouncedRefresh();
            }
          },
        );

        connection.on(
          "LectureUpdated",
          (courseIdFromEvent: string, lectureId: string) => {
            console.log("📡 LectureUpdated", courseIdFromEvent, lectureId);

            if (courseIdFromEvent === courseId) {
              debouncedRefresh();
            }
          },
        );

        connection.on(
          "QuizUpdated",
          (courseIdFromEvent: string, quizId: string) => {
            console.log("📡 QuizUpdated", courseIdFromEvent, quizId);

            if (courseIdFromEvent === courseId) {
              debouncedRefresh();
            }
          },
        );

        connection.on(
          "QuestionUpdated",
          (courseIdFromEvent: string, questionId: string) => {
            console.log("📡 QuestionUpdated", courseIdFromEvent, questionId);

            if (courseIdFromEvent === courseId) {
              debouncedRefresh();
            }
          },
        );

        connection.on(
          "DocumentUpdated",
          (courseIdFromEvent: string, documentId: string) => {
            console.log("📡 DocumentUpdated", courseIdFromEvent, documentId);

            if (courseIdFromEvent === courseId) {
              debouncedRefresh();
            }
          },
        );

        connection.on("CourseUpdated", (courseIdFromEvent: string) => {
          console.log("📡 CourseUpdated", courseIdFromEvent);

          if (courseIdFromEvent === courseId) {
            debouncedRefresh();
          }
        });

        // =========================
        // SIGNALR LIFECYCLE
        // =========================

        connection.onreconnecting((error) => {
          console.warn("⚠️ SignalR reconnecting...", error);

          setSignalRConnected(false);
        });

        connection.onreconnected(async (connectionId) => {
          console.log("🔄 SignalR reconnected:", connectionId);

          try {
            // Join lại group sau khi reconnect
            await connection.invoke("JoinCourseGroup", courseId);

            console.log(`✅ Rejoined course group: ${courseId}`);

            setSignalRConnected(true);

            debouncedRefresh();
          } catch (error) {
            console.error("❌ Failed to rejoin course group:", error);
          }
        });

        connection.onclose((error) => {
          console.warn("🔌 SignalR connection closed", error);

          setSignalRConnected(false);

          connectionRef.current = null;
        });

        // =========================
        // START CONNECTION
        // =========================

        await connection.start();

        console.log("✅ SignalR connected");

        // Lưu connection ngay sau khi start thành công
        connectionRef.current = connection;

        // =========================
        // JOIN COURSE GROUP
        // =========================

        await connection.invoke("JoinCourseGroup", courseId);

        console.log(`✅ Joined course group: ${courseId}`);

        setSignalRConnected(true);
      } catch (error) {
        console.error("❌ SignalR connection failed:", error);

        setSignalRConnected(false);

        connectionRef.current = null;

        // Retry sau 5 giây
        setTimeout(() => {
          if (!connectionRef.current) {
            connect();
          }
        }, 5000);
      }
    };

    connect();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
        setSignalRConnected(false);
        console.log("🔌 SignalR disconnected");
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, [courseId, isEditable, debouncedRefresh]);

  // ===== Sensors cho DnD =====
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // ===== Menu thêm mục =====
  const nhomTuyChonThemMuc: NhomTuyChonThemMuc[] = [
    {
      groupLabel: "Nội dung bài học",
      options: [
        {
          type: "BaiGiang",
          icon: <OndemandVideoOutlined sx={{ fontSize: 22 }} />,
          iconBg: "#FDECEC",
          title: "Bài giảng",
          description: "Thêm video bài giảng cho học viên theo dõi.",
        },
      ],
    },
    {
      groupLabel: "Kiểm tra kiến thức",
      options: [
        {
          type: "BaiKiemTra",
          icon: <QuizOutlined sx={{ fontSize: 22, color: STATUS.warningDark }} />,
          iconBg: "#FEF3E2",
          title: "Bài kiểm tra",
          description: "Tạo bài kiểm tra với nhiều câu hỏi trắc nghiệm.",
        },
      ],
    },
  ];

  // ===== Helper =====
  const getItems = (phan: PhanHocType) => {
    const lectures = (phan.DanhSachBaiGiang ?? []).map((bg) => ({
      kind: "BaiGiang" as const,
      data: bg,
    }));
    const quizzes = (phan.DanhDachBaiKiemTra ?? []).map((kt) => ({
      kind: "BaiKiemTra" as const,
      data: kt,
    }));
    return [...lectures, ...quizzes].sort((a, b) => {
      const aOrder = a.kind === "BaiGiang" ? (a.data.thuTuSapXep ?? 0) : 0;
      const bOrder = b.kind === "BaiGiang" ? (b.data.thuTuSapXep ?? 0) : 0;
      return aOrder - bOrder;
    });
  };

  const isItemComplete = (item: { kind: string; data: any }) => {
    if (item.kind === "BaiGiang") return !!item.data.urlBaiGiang;
    return (item.data.soCauHoi ?? 0) > 0;
  };

  // ===== DRAG-DROP HANDLERS =====
  const handleDragEndSections = async (event: DragEndEvent) => {
    if (!isEditable) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = phans.findIndex((p) => p.id === active.id);
    const newIndex = phans.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newPhans = arrayMove(phans, oldIndex, newIndex).map((p, index) => ({
      ...p,
      thuTuSapXep: index + 1,
    }));

    setPhans(newPhans);

    isRefreshingRef.current = true;
    setLoading(true);
    try {
      await Promise.all(
        newPhans.map((p) =>
          updatePhan(p.id, {
            tenPhan: p.tenPhan || "",
            mieuTa: p.mieuTa || "",
            thuTuSapXep: p.thuTuSapXep,
          }),
        ),
      );
      setToast({
        open: true,
        message: "Đã cập nhật thứ tự các phần",
        severity: "success",
      });
    } catch (error: any) {
      setToast({
        open: true,
        message: error.message || "Lỗi cập nhật thứ tự phần",
        severity: "error",
      });
    } finally {
      isRefreshingRef.current = false;
      setLoading(false);
    }
  };

  const handleDragEndItems = async (event: DragEndEvent, phanId: string) => {
    if (!isEditable) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const phan = phans.find((p) => p.id === phanId);
    if (!phan) return;

    const items = getItems(phan);
    const oldIndex = items.findIndex((item) => item.data.id === active.id);
    const newIndex = items.findIndex((item) => item.data.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(items, oldIndex, newIndex);
    const orderedItems = newItems.map((item, idx) => ({
      ...item,
      thuTuSapXep: idx + 1,
    }));

    const updatedPhan = {
      ...phan,
      DanhSachBaiGiang: orderedItems
        .filter((item) => item.kind === "BaiGiang")
        .map((item) => ({ ...item.data, thuTuSapXep: item.thuTuSapXep })),
      DanhDachBaiKiemTra: orderedItems
        .filter((item) => item.kind === "BaiKiemTra")
        .map((item) => ({ ...item.data, thuTuSapXep: item.thuTuSapXep })),
    };

    setPhans(phans.map((p) => (p.id === phanId ? updatedPhan : p)));

    isRefreshingRef.current = true;
    setLoading(true);
    try {
      const updatePromises: Promise<void>[] = [];
      updatedPhan.DanhSachBaiGiang.forEach((bg) => {
        updatePromises.push(
          updateBaiGiang(phanId, bg.id, {
            thuTuSapXep: bg.thuTuSapXep,
            tieuDe: bg.tieuDe,
            isFree: bg.laBaiGiangFree,
          }),
        );
      });
      updatedPhan.DanhDachBaiKiemTra.forEach((kt) => {
        updatePromises.push(
          updateBaiKiemTra(kt.id, {
            tenBaiKiemTra: kt.tenBaiKiemTra ?? "",
            moTa: kt.moTa || "",
            thuTuSapXep: kt.thuTuSapXep,
          }),
        );
      });
      await Promise.all(updatePromises);
      setToast({
        open: true,
        message: "Đã cập nhật thứ tự các mục trong phần",
        severity: "success",
      });
    } catch (error: any) {
      setToast({
        open: true,
        message: error.message || "Lỗi cập nhật thứ tự mục",
        severity: "error",
      });
    } finally {
      isRefreshingRef.current = false;
      setLoading(false);
    }
  };

  // ===== CÁC HÀM CRUD =====
  // (Thay thế isPollingRef bằng isRefreshingRef trong tất cả các hàm)

  const moThemPhan = () => {
    if (!isEditable) return;
    setAddForm(null);
    setQuizCreateForm(null);
    setEditingLecture(null);
    setPhanForm({ mode: "add", tenPhan: "" });
  };

  const moSuaPhan = (phanId: string) => {
    if (!isEditable) return;
    setAddForm(null);
    setQuizCreateForm(null);
    setEditingLecture(null);
    const phan = phans.find((p) => p.id === phanId);
    if (!phan) return;
    setPhanForm({
      mode: "edit",
      phanId,
      tenPhan: phan.tenPhan || "",
    });
  };

  const submitPhanForm = async () => {
    if (!phanForm) return;
    const { mode, phanId, tenPhan } = phanForm;

    const tenPhanTrimmed = trimString(tenPhan);

    if (!tenPhanTrimmed) {
      setToast({
        open: true,
        message: "Vui lòng nhập tiêu đề phần",
        severity: "error",
      });
      return;
    }

    isRefreshingRef.current = true;
    setLoading(true);
    try {
      if (mode === "add") {
        const newOrder = phans.length + 1;
        await createPhan({
          tenPhan: tenPhanTrimmed,
          mieuTa: "",
          thuTuSapXep: newOrder,
        });
        setToast({
          open: true,
          message: "Đã thêm phần mới",
          severity: "success",
        });
      } else if (mode === "edit" && phanId) {
        const phanHienTai = phans.find((p) => p.id === phanId);
        await updatePhan(phanId, {
          tenPhan: tenPhanTrimmed,
          mieuTa: phanHienTai?.mieuTa || "",
        });
        setToast({
          open: true,
          message: "Đã cập nhật phần",
          severity: "success",
        });
      }
      setPhanForm(null);
    } catch (error: any) {
      setToast({
        open: true,
        message: error.message || "Lỗi xử lý phần",
        severity: "error",
      });
    } finally {
      isRefreshingRef.current = false;
      setLoading(false);
    }
  };

  const xoaPhan = async (phanId: string) => {
    if (!isEditable) return;
    setDeleteDialog({
      open: true,
      onConfirm: async () => {
        setDeleteDialog({ open: false, onConfirm: () => {} });
        isRefreshingRef.current = true;
        setLoading(true);
        try {
          await deletePhan(phanId);
          setToast({ open: true, message: "Đã xóa phần", severity: "success" });
        } catch (error: any) {
          setToast({
            open: true,
            message: error.message || "Lỗi xóa phần",
            severity: "error",
          });
        } finally {
          isRefreshingRef.current = false;
          setLoading(false);
        }
      },
    });
  };

  // ===== XỬ LÝ QUIZ =====
  const handleCreateQuiz = async () => {
    if (!quizCreateForm) return;
    const { phanId, tenBaiKiemTra, moTa } = quizCreateForm;

    const tenTrimmed = trimString(tenBaiKiemTra);
    if (!tenTrimmed) {
      setToast({
        open: true,
        message: "Vui lòng nhập tiêu đề bài kiểm tra",
        severity: "error",
      });
      return;
    }
    const tenValid = validateTenBaiKiemTra(tenTrimmed);
    if (!tenValid.valid) {
      setToast({
        open: true,
        message: tenValid.error || "Lỗi validate",
        severity: "error",
      });
      return;
    }

    const moTaTrimmed = trimString(moTa);
    const moTaValid = validateMoTaBaiKiemTra(moTaTrimmed);
    if (!moTaValid.valid) {
      setToast({
        open: true,
        message: moTaValid.error || "Lỗi validate",
        severity: "error",
      });
      return;
    }

    const phan = phans.find((p) => p.id === phanId);
    const currentItems = [
      ...(phan?.DanhSachBaiGiang || []),
      ...(phan?.DanhDachBaiKiemTra || []),
    ];
    const newOrder = currentItems.length + 1;

    isRefreshingRef.current = true;
    setLoading(true);
    try {
      const result = await createBaiKiemTra(phanId, {
        tenBaiKiemTra: tenTrimmed,
        moTa: moTaTrimmed,
        thuTuSapXep: newOrder,
      });

      setToast({
        open: true,
        message: "Đã tạo bài kiểm tra",
        severity: "success",
      });
      setQuizCreateForm(null);
      if (result.id) {
        setExpandedQuizzes((prev) => ({ ...prev, [result.id!]: true }));
      }
    } catch (error: any) {
      setToast({
        open: true,
        message: error.message || "Lỗi tạo bài kiểm tra",
        severity: "error",
      });
    } finally {
      isRefreshingRef.current = false;
      setLoading(false);
    }
  };

  const handleOpenQuizUpdate = (phanId: string, quizId: string) => {
    if (!isEditable) return;
    const phan = phans.find((p) => p.id === phanId);
    if (!phan) return;
    const quiz = phan.DanhDachBaiKiemTra?.find((kt) => kt.id === quizId);
    if (!quiz) return;

    setQuizUpdateForm({
      phanId,
      quizId,
      tenBaiKiemTra: quiz.tenBaiKiemTra || "",
      moTa: quiz.moTa || "",
    });
    setExpandedQuizzes((prev) => ({ ...prev, [quizId]: true }));
  };

  const handleSaveQuizUpdate = async () => {
    if (!quizUpdateForm) return;
    const { quizId, tenBaiKiemTra, moTa } = quizUpdateForm;

    const tenTrimmed = trimString(tenBaiKiemTra);
    if (!tenTrimmed) {
      setToast({
        open: true,
        message: "Vui lòng nhập tiêu đề bài kiểm tra",
        severity: "error",
      });
      return;
    }
    const tenValid = validateTenBaiKiemTra(tenTrimmed);
    if (!tenValid.valid) {
      setToast({
        open: true,
        message: tenValid.error || "Lỗi validate",
        severity: "error",
      });
      return;
    }

    const moTaTrimmed = trimString(moTa);
    const moTaValid = validateMoTaBaiKiemTra(moTaTrimmed);
    if (!moTaValid.valid) {
      setToast({
        open: true,
        message: moTaValid.error || "Lỗi validate",
        severity: "error",
      });
      return;
    }

    isRefreshingRef.current = true;
    setLoading(true);
    try {
      await updateBaiKiemTra(quizId, {
        tenBaiKiemTra: tenTrimmed,
        moTa: moTaTrimmed,
      });

      setToast({
        open: true,
        message: "Đã cập nhật bài kiểm tra",
        severity: "success",
      });
      setQuizUpdateForm(null);
    } catch (error: any) {
      setToast({
        open: true,
        message: error.message || "Lỗi cập nhật",
        severity: "error",
      });
    } finally {
      isRefreshingRef.current = false;
      setLoading(false);
    }
  };

  const handleCloseQuizUpdate = () => {
    setQuizUpdateForm(null);
  };

  const handleAddQuestion = (
    phanId: string,
    quizId: string,
    quizTitle?: string,
  ) => {
    if (!isEditable) return;
    const newQuestion: CauHoiFormData = {
      id: uuidv4(),
      noiDungCauHoi: "",
      loaiCauHoi: "ONE",
      doKho: "TrungBinh",
      danhSachDapAn: [
        { id: uuidv4(), noiDungDapAn: "", laDapAnDung: false, thuTuSapXep: 0 },
        { id: uuidv4(), noiDungDapAn: "", laDapAnDung: false, thuTuSapXep: 1 },
        { id: uuidv4(), noiDungDapAn: "", laDapAnDung: false, thuTuSapXep: 2 },
      ],
    };
    setQuestionEditor({
      phanId,
      quizId,
      question: newQuestion,
      isEditing: false,
      quizTitle,
    });
  };

  const handleEditQuestion = (
    phanId: string,
    quizId: string,
    question: any,
    quizTitle?: string,
  ) => {
    if (!isEditable) return;
    const editQuestion: CauHoiFormData = {
      id: question.id,
      noiDungCauHoi: question.noiDungCauHoi || "",
      loaiCauHoi: question.loaiCauHoi || "ONE",
      doKho: question.doKho || "TrungBinh",
      danhSachDapAn: (question.danhSachDapAn || []).map((d: any) => ({
        id: d.id || uuidv4(),
        noiDungDapAn: d.noiDungDapAn || "",
        laDapAnDung: d.laDapAnDung || false,
        thuTuSapXep: d.thuTuSapXep || 0,
        giaiThich: d.giaiThich || "",
      })),
    };
    setQuestionEditor({
      phanId,
      quizId,
      question: editQuestion,
      isEditing: true,
      quizTitle,
    });
  };

  const handleSaveQuestion = async () => {
    if (!questionEditor) return;
    const { phanId, quizId, question, isEditing } = questionEditor;

    const noiDungTrimmed = trimString(question.noiDungCauHoi);
    if (isNoiDungHtmlRong(question.noiDungCauHoi)) {
      setToast({
        open: true,
        message: "Vui lòng nhập nội dung câu hỏi",
        severity: "error",
      });
      return;
    }
    const noiDungValid = validateNoiDungCauHoi(noiDungTrimmed);
    if (!noiDungValid.valid) {
      setToast({
        open: true,
        message: noiDungValid.error || "Lỗi validate",
        severity: "error",
      });
      return;
    }

    if (question.danhSachDapAn.length < SO_DAP_AN_TOI_THIEU) {
      setToast({
        open: true,
        message: `Cần ít nhất ${SO_DAP_AN_TOI_THIEU} đáp án`,
        severity: "error",
      });
      return;
    }
    if (question.danhSachDapAn.length > SO_DAP_AN_TOI_DA) {
      setToast({
        open: true,
        message: `Tối đa ${SO_DAP_AN_TOI_DA} đáp án`,
        severity: "error",
      });
      return;
    }

    const soDapAnDung = question.danhSachDapAn.filter(
      (d) => d.laDapAnDung,
    ).length;
    if (soDapAnDung === 0) {
      setToast({
        open: true,
        message: "Cần có ít nhất 1 đáp án đúng",
        severity: "error",
      });
      return;
    }
    if (question.loaiCauHoi === "ONE" && soDapAnDung > 1) {
      setToast({
        open: true,
        message: "Câu hỏi một đáp án chỉ được có đúng 1 đáp án đúng",
        severity: "error",
      });
      return;
    }
    if (soDapAnDung >= question.danhSachDapAn.length) {
      setToast({
        open: true,
        message: "Số đáp án đúng phải nhỏ hơn tổng số đáp án",
        severity: "error",
      });
      return;
    }

    const noiDungDapAns: string[] = [];
    for (const dapAn of question.danhSachDapAn) {
      const dapAnTrimmed = trimString(dapAn.noiDungDapAn);
      if (!dapAnTrimmed) {
        setToast({
          open: true,
          message: "Vui lòng nhập nội dung cho tất cả đáp án",
          severity: "error",
        });
        return;
      }
      const dapAnValid = validateNoiDungDapAn(dapAnTrimmed);
      if (!dapAnValid.valid) {
        setToast({
          open: true,
          message: dapAnValid.error || "Lỗi validate",
          severity: "error",
        });
        return;
      }
      noiDungDapAns.push(dapAnTrimmed.toLowerCase());
    }

    const uniqueDapAns = new Set(noiDungDapAns);
    if (uniqueDapAns.size !== noiDungDapAns.length) {
      setToast({
        open: true,
        message: "Các đáp án không được trùng nhau",
        severity: "error",
      });
      return;
    }

    const phan = phans.find((p) => p.id === phanId);
    const quiz = phan?.DanhDachBaiKiemTra?.find((q) => q.id === quizId);
    const currentQuestions = quiz?.cauHois || [];
    const newOrder = currentQuestions.length + 1;

    isRefreshingRef.current = true;
    setLoading(true);
    try {
      if (isEditing) {
        await updateCauHoi(phanId, quizId, question.id, {
          noiDungCauHoi: noiDungTrimmed,
          loaiCauHoi: question.loaiCauHoi,
          doKho: question.doKho,
          danhSachDapAn: question.danhSachDapAn.map((d, idx) => ({
            id: d.id,
            noiDungDapAn: trimString(d.noiDungDapAn),
            laDapAnDung: d.laDapAnDung,
            thuTuSapXep: idx + 1,
          })),
        });
        setToast({
          open: true,
          message: "Đã cập nhật câu hỏi",
          severity: "success",
        });
      } else {
        await createCauHoi(phanId, quizId, {
          noiDungCauHoi: noiDungTrimmed,
          loaiCauHoi: question.loaiCauHoi,
          doKho: question.doKho,
          thuTuSapXep: newOrder,
          danhSachDapAn: question.danhSachDapAn.map((d, idx) => ({
            noiDungDapAn: trimString(d.noiDungDapAn),
            laDapAnDung: d.laDapAnDung,
            thuTuSapXep: idx + 1,
          })),
        });
        setToast({
          open: true,
          message: "Đã thêm câu hỏi mới",
          severity: "success",
        });
      }

      setQuestionEditor(null);
    } catch (error: any) {
      setToast({
        open: true,
        message: error.message || "Lỗi lưu câu hỏi",
        severity: "error",
      });
    } finally {
      isRefreshingRef.current = false;
      setLoading(false);
    }
  };

  const handleDeleteQuestion = (
    phanId: string,
    quizId: string,
    questionId: string,
  ) => {
    if (!isEditable) return;
    setDeleteDialog({
      open: true,
      onConfirm: async () => {
        setDeleteDialog({ open: false, onConfirm: () => {} });
        isRefreshingRef.current = true;
        setLoading(true);
        try {
          await deleteCauHoi(phanId, quizId, questionId);
          setToast({
            open: true,
            message: "Đã xóa câu hỏi",
            severity: "success",
          });
        } catch (error: any) {
          setToast({
            open: true,
            message: error.message || "Lỗi xóa câu hỏi",
            severity: "error",
          });
        } finally {
          isRefreshingRef.current = false;
          setLoading(false);
        }
      },
    });
  };

  const handleDeleteQuiz = async (phanId: string, quizId: string) => {
    if (!isEditable) return;
    setDeleteDialog({
      open: true,
      onConfirm: async () => {
        setDeleteDialog({ open: false, onConfirm: () => {} });
        isRefreshingRef.current = true;
        setLoading(true);
        try {
          await deleteBaiKiemTra(phanId, quizId);
          setToast({
            open: true,
            message: "Đã xóa bài kiểm tra",
            severity: "success",
          });
          if (quizUpdateForm?.quizId === quizId) {
            setQuizUpdateForm(null);
          }
        } catch (error: any) {
          setToast({
            open: true,
            message: error.message || "Lỗi xóa bài kiểm tra",
            severity: "error",
          });
        } finally {
          isRefreshingRef.current = false;
          setLoading(false);
        }
      },
    });
  };

  // ===== XỬ LÝ BÀI GIẢNG =====
  const xoaBaiGiang = async (phanId: string, baiGiangId: string) => {
    if (!isEditable) return;
    setDeleteDialog({
      open: true,
      onConfirm: async () => {
        setDeleteDialog({ open: false, onConfirm: () => {} });
        isRefreshingRef.current = true;
        setLoading(true);
        try {
          await deleteBaiGiang(phanId, baiGiangId);
          setToast({
            open: true,
            message: "Đã xóa bài giảng",
            severity: "success",
          });
        } catch (error: any) {
          setToast({
            open: true,
            message: error.message || "Lỗi xóa bài giảng",
            severity: "error",
          });
        } finally {
          isRefreshingRef.current = false;
          setLoading(false);
        }
      },
    });
  };

  const handleEditLecture = (phanId: string, lectureId: string) => {
    if (!isEditable) return;
    setPhanForm(null);
    setAddForm(null);
    setQuizCreateForm(null);

    const phan = phans.find((p) => p.id === phanId);
    if (!phan) return;
    const bg = phan.DanhSachBaiGiang?.find((b) => b.id === lectureId);
    if (!bg) return;
    setEditingLecture({
      phanId,
      lectureId,
      title: bg.tieuDe || "",
      isFree: bg.laBaiGiangFree || false,
      file: null,
    });
    setExpandedLectures((prev) => ({ ...prev, [lectureId]: true }));
  };

  const cancelEditLecture = () => {
    setEditingLecture(null);
  };

  const saveEditedLecture = async () => {
    if (!editingLecture) return;
    const { phanId, lectureId, title, isFree, file } = editingLecture;

    if (!title || !title.trim()) {
      setToast({
        open: true,
        message: "Vui lòng nhập tiêu đề bài giảng",
        severity: "error",
      });
      return;
    }

    setEditingLecture(null);
    setUpdatingLectureIds((prev) => new Set(prev).add(lectureId));

    isRefreshingRef.current = true;
    try {
      await updateBaiGiang(phanId, lectureId, {
        tieuDe: title.trim(),
        isFree: isFree,
        file: file || null,
      });

      setToast({
        open: true,
        message: "Bài giảng đã được cập nhật",
        severity: "success",
      });
    } catch (error: any) {
      setToast({
        open: true,
        message: error.message || "Lỗi lưu bài giảng",
        severity: "error",
      });
    } finally {
      setUpdatingLectureIds((prev) => {
        const next = new Set(prev);
        next.delete(lectureId);
        return next;
      });
      isRefreshingRef.current = false;
    }
  };

  // === Tài liệu ===
  const uploadTaiLieu = async (
    phanId: string,
    baiGiangId: string,
    file: File,
    tenTaiLieu?: string,
  ) => {
    if (!isEditable) return;

    if (!file) {
      setToast({
        open: true,
        message: "Vui lòng chọn file tài liệu",
        severity: "error",
      });
      return;
    }

    const tenTrimmed = trimString(tenTaiLieu || "");
    if (!tenTrimmed) {
      setToast({
        open: true,
        message: "Vui lòng nhập tên tài liệu",
        severity: "error",
      });
      return;
    }
    const tenValid = validateTenTaiLieu(tenTrimmed);
    if (!tenValid.valid) {
      setToast({
        open: true,
        message: tenValid.error || "Lỗi validate",
        severity: "error",
      });
      return;
    }

    const validation = validateTaiLieu(file);
    if (!validation.valid) {
      setToast({
        open: true,
        message: validation.error || "Tài liệu không hợp lệ",
        severity: "error",
      });
      return;
    }

    isRefreshingRef.current = true;
    setLoading(true);
    try {
      await createTaiLieu(phanId, baiGiangId, file, tenTrimmed);
      setToast({
        open: true,
        message: "Tài liệu đã được thêm",
        severity: "success",
      });
      setAddResourceForm((prev) => ({
        ...prev,
        [baiGiangId]: { tenTaiLieu: "", file: null, open: false },
      }));
    } catch (error: any) {
      setToast({
        open: true,
        message: error.message || "Lỗi upload tài liệu",
        severity: "error",
      });
    } finally {
      isRefreshingRef.current = false;
      setLoading(false);
    }
  };

  const xoaTaiLieu = async (
    phanId: string,
    baiGiangId: string,
    taiLieuId: string,
  ) => {
    if (!isEditable) return;
    setDeleteDialog({
      open: true,
      onConfirm: async () => {
        setDeleteDialog({ open: false, onConfirm: () => {} });
        isRefreshingRef.current = true;
        setLoading(true);
        try {
          await deleteTaiLieu(phanId, baiGiangId, taiLieuId);
          setToast({
            open: true,
            message: "Đã xóa tài liệu",
            severity: "success",
          });
        } catch (error: any) {
          setToast({
            open: true,
            message: error.message || "Lỗi xóa tài liệu",
            severity: "error",
          });
        } finally {
          isRefreshingRef.current = false;
          setLoading(false);
        }
      },
    });
  };

  // === Toggle ===
  const toggleLecture = (lectureId: string) => {
    setExpandedLectures((prev) => ({ ...prev, [lectureId]: !prev[lectureId] }));
  };

  const toggleQuizItem = (quizId: string) => {
    setExpandedQuizzes((prev) => ({ ...prev, [quizId]: !prev[quizId] }));

    if (!expandedQuizzes[quizId] && quizUpdateForm?.quizId === quizId) {
      setQuizUpdateForm(null);
    }
  };

  const [expandedQuestions, setExpandedQuestions] = useState<
    Record<string, boolean>
  >({});

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };
  const tongThoiLuong = tinhTongThoiLuongGiay(phans);
  const tongPhut = Math.floor(tongThoiLuong / 60);

  const chonTuyChonThemMuc = (tuyChon: TuyChonThemMuc) => {
    if (!menuAnchor || tuyChon.disabled || !isEditable) return;
    const phanId = menuAnchor.phanId;
    if (!phanId) return;

    setMenuAnchor(null);
    setAddForm(null);
    setQuizCreateForm(null);

    if (tuyChon.type === "BaiGiang") {
      setAddForm({
        phanId,
        type: "BaiGiang",
        title: "",
        file: null,
        isFree: false,
      });
    } else if (tuyChon.type === "BaiKiemTra") {
      setQuizCreateForm({
        phanId,
        tenBaiKiemTra: "",
        moTa: "",
      });
    }
  };

  const handleCreateBaiGiang = async () => {
    if (!addForm) return;
    const { phanId, title, file, isFree } = addForm;

    const titleTrimmed = trimString(title || "");
    if (!titleTrimmed) {
      setToast({
        open: true,
        message: "Vui lòng nhập tiêu đề bài giảng",
        severity: "error",
      });
      return;
    }
    const titleValid = validateTieuDeBaiGiang(titleTrimmed);
    if (!titleValid.valid) {
      setToast({
        open: true,
        message: titleValid.error || "Lỗi validate",
        severity: "error",
      });
      return;
    }

    if (!file) {
      setToast({
        open: true,
        message: "Vui lòng chọn video cho bài giảng",
        severity: "error",
      });
      return;
    }

    setAddForm(null);

    const phan = phans.find((p) => p.id === phanId);
    const currentItems = [
      ...(phan?.DanhSachBaiGiang || []),
      ...(phan?.DanhDachBaiKiemTra || []),
    ];
    const newOrder = currentItems.length + 1;

    const key = `pending_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setPendingLectures((prev) => ({
      ...prev,
      [phanId]: [
        ...(prev[phanId] || []),
        { key, tieuDe: titleTrimmed, isFree: !!isFree },
      ],
    }));

    isRefreshingRef.current = true;
    try {
      await createBaiGiang(phanId, {
        tieuDe: titleTrimmed,
        file,
        isFree: isFree || false,
        thuTuSapXep: newOrder,
      });
      setToast({
        open: true,
        message: `Đã thêm bài giảng "${titleTrimmed}"`,
        severity: "success",
      });
    } catch (error: any) {
      setToast({
        open: true,
        message: error.message || `Lỗi tạo bài giảng "${titleTrimmed}"`,
        severity: "error",
      });
    } finally {
      setPendingLectures((prev) => ({
        ...prev,
        [phanId]: (prev[phanId] || []).filter((item) => item.key !== key),
      }));
      isRefreshingRef.current = false;
    }
  };

  // Hàm show lý do
  const showLyDo = (lyDo: string) => {
    setLyDoPopup({ open: true, lyDo });
  };

  // ===== RENDER =====
  return (
    <AuthGuard allowedRoles={["Admin", "GiaoVien"]}>
      <GlobalStyles styles={pulseKeyframes} />
      <Box sx={{ maxWidth: 900, mx: "auto", pb: 12 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
            mb: 3,
          }}
        >
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: 26,
              color: CSSVAR.textPrimary,
            }}
          >
            Chương trình giảng dạy
          </Typography>
          {/* {signalRConnected && (
            <Chip
              size="small"
              label="🔴 Live"
              sx={{
                bgcolor: "#4CAF50",
                color: "#fff",
                fontWeight: 700,
                fontSize: 11,
              }}
            />
          )} */}
        </Box>

        <Typography
          sx={{
            fontSize: 14,
            color: CSSVAR.textSecondary,
            mb: 2.5,
            lineHeight: 1.7,
          }}
        >
          Thiết kế khóa học của bạn theo từng phần, mỗi phần tập trung vào một
          mục tiêu học tập duy nhất. Sau đó, thêm nội dung, hoạt động thực hành
          và bài kiểm tra.
        </Typography>

        {(loading || contextLoading) && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress sx={{ color: MAU.chinh }} />
          </Box>
        )}

        {/* DANH SÁCH PHẦN VỚI DRAG-DROP */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEndSections}
        >
          <SortableContext
            items={phans.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {phans.map((phan, idx) => {
                const phanId = phan.id as string;
                const items = getItems(phan);
                const isEditingPhan =
                  phanForm?.mode === "edit" && phanForm?.phanId === phanId;
                const isAddingPhan = phanForm?.mode === "add";

                const hasAddForm =
                  quizCreateForm?.phanId === phanId ||
                  addForm?.phanId === phanId;

                return (
                  <SectionItem
                    key={phanId}
                    phan={phan}
                    idx={idx}
                    isEditable={isEditable}
                    onEdit={moSuaPhan}
                    onDelete={xoaPhan}
                  >
                    {/* FORM SỬA PHẦN */}
                    {isEditingPhan && isEditable && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          border: `1px solid ${MAU.chinh}44`,
                          borderRadius: "12px",
                          bgcolor: `${MAU.chinh}06`,
                          position: "relative",
                        }}
                      >
                        {loading && (
                          <Box
                            sx={{
                              position: "absolute",
                              inset: 0,
                              bgcolor: "rgba(255,255,255,0.7)",
                              borderRadius: "12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              zIndex: 10,
                              backdropFilter: "blur(2px)",
                            }}
                          >
                            <CircularProgress
                              size={28}
                              sx={{ color: MAU.chinh }}
                            />
                          </Box>
                        )}

                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: 15,
                            color: CSSVAR.textPrimary,
                            mb: 1.5,
                            opacity: loading ? 0.5 : 1,
                            pointerEvents: loading ? "none" : "auto",
                          }}
                        >
                          Sửa phần
                        </Typography>
                        <TextField
                          {...noPropagation}
                          label="Tiêu đề phần"
                          value={phanForm.tenPhan}
                          onChange={(e) =>
                            setPhanForm({
                              ...phanForm,
                              tenPhan: e.target.value,
                            })
                          }
                          fullWidth
                          disabled={loading}
                          sx={{
                            mb: 2,
                            opacity: loading ? 0.5 : 1,
                            pointerEvents: loading ? "none" : "auto",
                          }}
                        />
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "flex-end",
                            opacity: loading ? 0.5 : 1,
                            pointerEvents: loading ? "none" : "auto",
                          }}
                        >
                          <Button
                            {...noPropagation}
                            onClick={() => setPhanForm(null)}
                            disabled={loading}
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              color: CSSVAR.textSecondary,
                              py: 0.75,
                              px: 2.5,
                              borderRadius: "8px",
                              "&:hover": {
                                bgcolor: CSSVAR.paperAlt,
                              },
                            }}
                          >
                            Hủy bỏ
                          </Button>
                          <Button
                            {...noPropagation}
                            variant="contained"
                            onClick={submitPhanForm}
                            disabled={loading || !phanForm.tenPhan?.trim()}
                            sx={{
                              bgcolor: MAU.chinh,
                              textTransform: "none",
                              fontWeight: 700,
                              py: 0.75,
                              px: 3,
                              borderRadius: "8px",
                              boxShadow: "0 2px 8px rgba(122,31,43,0.15)",
                              "&:hover": {
                                bgcolor: MAU.chinhDam,
                                boxShadow: "0 4px 12px rgba(122,31,43,0.25)",
                              },
                              "&.Mui-disabled": {
                                bgcolor: CSSVAR.divider,
                                color: CSSVAR.textMuted,
                                boxShadow: "none",
                              },
                            }}
                          >
                            Lưu phần
                          </Button>
                        </Box>
                      </Box>
                    )}

                    {/* DANH SÁCH MỤC TRONG PHẦN */}
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => handleDragEndItems(event, phanId)}
                    >
                      <SortableContext
                        items={items.map((item) => item.data.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                          }}
                        >
                          {items.map((item, itemIdx) => {
                            const isComplete = isItemComplete(item);
                            const itemId = item.data.id as string;
                            const soThuTuMuc = itemIdx + 1;

                            if (item.kind === "BaiGiang") {
                              const bg = item.data as BaiGiangType;
                              const isExpanded = !!expandedLectures[itemId];
                              const isEditing =
                                editingLecture?.lectureId === itemId;
                              const lyDoTuChoi = (bg as any).lyDoTuChois;

                              return (
                                <LectureItem
                                  key={itemId}
                                  bg={bg}
                                  itemId={itemId}
                                  phanId={phanId}
                                  soThuTuMuc={soThuTuMuc}
                                  isComplete={isComplete}
                                  isExpanded={isExpanded}
                                  isEditable={isEditable}
                                  dangTai={updatingLectureIds.has(itemId)}
                                  lyDoTuChoi={lyDoTuChoi}
                                  onToggle={toggleLecture}
                                  onEdit={handleEditLecture}
                                  onDelete={xoaBaiGiang}
                                  onShowLyDo={showLyDo}
                                >
                                  {isEditing ? (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 2,
                                        p: 2,
                                        border: `1px dashed ${MAU.chinh}`,
                                        borderRadius: "12px",
                                        bgcolor: `${MAU.chinh}05`,
                                        position: "relative",
                                      }}
                                    >
                                      {loading && (
                                        <Box
                                          sx={{
                                            position: "absolute",
                                            inset: 0,
                                            bgcolor: "rgba(255,255,255,0.7)",
                                            borderRadius: "12px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            zIndex: 10,
                                            backdropFilter: "blur(2px)",
                                          }}
                                        >
                                          <CircularProgress
                                            size={32}
                                            sx={{ color: MAU.chinh }}
                                          />
                                        </Box>
                                      )}

                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                          opacity: loading ? 0.5 : 1,
                                          pointerEvents: loading
                                            ? "none"
                                            : "auto",
                                        }}
                                      >
                                        <EditOutlined
                                          sx={{
                                            fontSize: 18,
                                            color: MAU.chinh,
                                          }}
                                        />
                                        <Typography
                                          sx={{
                                            fontWeight: 700,
                                            fontSize: 14.5,
                                            color:
                                              CSSVAR.textPrimary,
                                          }}
                                        >
                                          Chỉnh sửa bài giảng
                                        </Typography>
                                      </Box>

                                      <Box
                                        sx={{
                                          opacity: loading ? 0.5 : 1,
                                          pointerEvents: loading
                                            ? "none"
                                            : "auto",
                                        }}
                                      >
                                        <Typography
                                          sx={{
                                            fontWeight: 700,
                                            fontSize: 12.5,
                                            color:
                                              CSSVAR.textMuted,
                                            mb: 0.5,
                                          }}
                                        >
                                          Tên bài giảng
                                        </Typography>
                                        <TextField
                                          {...noPropagation}
                                          fullWidth
                                          placeholder="Nhập tiêu đề bài giảng"
                                          value={editingLecture.title}
                                          onChange={(e) =>
                                            setEditingLecture((prev) =>
                                              prev
                                                ? {
                                                    ...prev,
                                                    title: e.target.value,
                                                  }
                                                : null,
                                            )
                                          }
                                          autoFocus
                                          required
                                          disabled={loading}
                                          slotProps={{
                                            input: {
                                              sx: {
                                                bgcolor:
                                                  CSSVAR.paper,
                                                borderRadius: "10px",
                                                fontWeight: 600,
                                                height: "50px",
                                              },
                                            },
                                          }}
                                        />
                                      </Box>

                                      {!bg.urlBaiGiang &&
                                      !editingLecture.file ? (
                                        <Box
                                          component="label"
                                          sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 0.75,
                                            py: 3.5,
                                            border: `1.5px dashed ${MAU.chinh}66`,
                                            borderRadius: "12px",
                                            bgcolor: CSSVAR.paper,
                                            cursor: loading
                                              ? "default"
                                              : "pointer",
                                            textAlign: "center",
                                            transition: "all 0.15s ease",
                                            opacity: loading ? 0.5 : 1,
                                            pointerEvents: loading
                                              ? "none"
                                              : "auto",
                                            "&:hover": {
                                              borderColor: loading
                                                ? MAU.chinh + "66"
                                                : MAU.chinh,
                                              bgcolor: loading
                                                ? "#fff"
                                                : `${MAU.chinh}0A`,
                                            },
                                          }}
                                        >
                                          <CloudUploadOutlined
                                            sx={{
                                              fontSize: 30,
                                              color: MAU.chinh,
                                            }}
                                          />
                                          <Typography
                                            sx={{
                                              fontSize: 13.5,
                                              fontWeight: 700,
                                              color:
                                                CSSVAR.textPrimary,
                                            }}
                                          >
                                            Chọn video bài giảng
                                          </Typography>
                                          <Typography
                                            sx={{
                                              fontSize: 11.5,
                                              color:
                                                CSSVAR.textMuted,
                                            }}
                                          >
                                            Dung lượng tối đa 100MB, độ phân
                                            giải ≥ 854x480
                                          </Typography>
                                          <input
                                            type="file"
                                            accept="video/*"
                                            hidden
                                            disabled={loading}
                                            onChange={async (e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                const result =
                                                  await validateVideoFile(file);
                                                if (result.valid) {
                                                  setEditingLecture((prev) =>
                                                    prev
                                                      ? { ...prev, file }
                                                      : null,
                                                  );
                                                } else {
                                                  alert(
                                                    `File không hợp lệ: ${result.error}`,
                                                  );
                                                  e.target.value = "";
                                                }
                                              }
                                            }}
                                          />
                                        </Box>
                                      ) : (
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                            p: 1.5,
                                            border: "1px solid #E3E6EB",
                                            borderRadius: "12px",
                                            bgcolor: CSSVAR.paper,
                                            opacity: loading ? 0.5 : 1,
                                            pointerEvents: loading
                                              ? "none"
                                              : "auto",
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              width: 96,
                                              height: 60,
                                              borderRadius: "8px",
                                              bgcolor: editingLecture.file
                                                ? `${MAU.chinh}14`
                                                : CSSVAR.textPrimary,
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              flexShrink: 0,
                                            }}
                                          >
                                            {editingLecture.file ? (
                                              <CloudUploadOutlined
                                                sx={{
                                                  fontSize: 26,
                                                  color: MAU.chinh,
                                                }}
                                              />
                                            ) : (
                                              <PlayCircleOutlined
                                                sx={{
                                                  fontSize: 30,
                                                  color: "#fff",
                                                }}
                                              />
                                            )}
                                          </Box>
                                          <Box
                                            sx={{
                                              flex: 1,
                                              minWidth: 0,
                                              display: "flex",
                                              flexDirection: "column",
                                              gap: 0.4,
                                            }}
                                          >
                                            {editingLecture.file ? (
                                              <>
                                                <Typography
                                                  sx={{
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    color: MAU.chinh,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                  }}
                                                >
                                                  {editingLecture.file.name}
                                                </Typography>
                                                <Typography
                                                  sx={{
                                                    fontSize: 11.5,
                                                    color:
                                                      CSSVAR.textMuted,
                                                  }}
                                                >
                                                  Video mới đã chọn
                                                  {editingLecture.file.size
                                                    ? ` · ${dinhDangDungLuong(
                                                        editingLecture.file
                                                          .size,
                                                      )}`
                                                    : ""}
                                                </Typography>
                                              </>
                                            ) : (
                                              <>
                                                <Typography
                                                  sx={{
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    color:
                                                      CSSVAR.textPrimary,
                                                  }}
                                                >
                                                  {dinhDangThoiLuong(
                                                    bg.thoiLuong ?? 0,
                                                  )}
                                                </Typography>
                                                <Typography
                                                  sx={{
                                                    fontSize: 11.5,
                                                    color:
                                                      CSSVAR.textMuted,
                                                  }}
                                                >
                                                  Video hiện tại
                                                </Typography>
                                              </>
                                            )}
                                          </Box>
                                          <Button
                                            {...noPropagation}
                                            component="label"
                                            size="small"
                                            startIcon={
                                              <AutorenewOutlined fontSize="small" />
                                            }
                                            disabled={loading}
                                            sx={{
                                              textTransform: "none",
                                              fontWeight: 700,
                                              fontSize: 12.5,
                                              color: MAU.chinh,
                                              border: `1px solid ${MAU.chinh}66`,
                                              borderRadius: "8px",
                                              px: 1.5,
                                              flexShrink: 0,
                                              "&:hover": {
                                                bgcolor: `${MAU.chinh}0F`,
                                                borderColor: MAU.chinh,
                                              },
                                            }}
                                          >
                                            Thay thế
                                            <input
                                              type="file"
                                              accept="video/*"
                                              hidden
                                              disabled={loading}
                                              onChange={async (e) => {
                                                const file =
                                                  e.target.files?.[0];
                                                if (file) {
                                                  const result =
                                                    await validateVideoFile(
                                                      file,
                                                    );
                                                  if (result.valid) {
                                                    setEditingLecture((prev) =>
                                                      prev
                                                        ? { ...prev, file }
                                                        : null,
                                                    );
                                                  } else {
                                                    alert(
                                                      `File không hợp lệ: ${result.error}`,
                                                    );
                                                    e.target.value = "";
                                                  }
                                                }
                                              }}
                                            />
                                          </Button>
                                        </Box>
                                      )}

                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          px: 1.5,
                                          py: 1,
                                          border: "1px solid #E3E6EB",
                                          borderRadius: "10px",
                                          bgcolor: CSSVAR.paper,
                                          opacity: loading ? 0.5 : 1,
                                          pointerEvents: loading
                                            ? "none"
                                            : "auto",
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                          }}
                                        >
                                          {editingLecture.isFree ? (
                                            <LockOpenOutlined
                                              sx={{
                                                fontSize: 18,
                                                color: MAU.chinh,
                                              }}
                                            />
                                          ) : (
                                            <LockOutlined
                                              sx={{
                                                fontSize: 18,
                                                color:
                                                  "var(--ev-text-muted, #9AA2B1)",
                                              }}
                                            />
                                          )}
                                          <Box>
                                            <Typography
                                              sx={{
                                                fontSize: 13,
                                                fontWeight: 700,
                                                color:
                                                  CSSVAR.textPrimary,
                                              }}
                                            >
                                              Xem thử miễn phí
                                            </Typography>
                                            <Typography
                                              sx={{
                                                fontSize: 11,
                                                color:
                                                  CSSVAR.textMuted,
                                              }}
                                            >
                                              Cho phép học viên xem trước khi
                                              đăng ký
                                            </Typography>
                                          </Box>
                                        </Box>
                                        <Switch
                                          {...noPropagation}
                                          checked={
                                            editingLecture.isFree || false
                                          }
                                          disabled={loading}
                                          onChange={(e) =>
                                            setEditingLecture((prev) =>
                                              prev
                                                ? {
                                                    ...prev,
                                                    isFree: e.target.checked,
                                                  }
                                                : null,
                                            )
                                          }
                                          sx={{
                                            "& .MuiSwitch-switchBase.Mui-checked":
                                              { color: MAU.chinh },
                                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                              { bgcolor: MAU.chinh },
                                          }}
                                        />
                                      </Box>

                                      {!loading && (
                                        <Box
                                          sx={{
                                            display: "flex",
                                            gap: 1,
                                            justifyContent: "flex-end",
                                          }}
                                        >
                                          <Button
                                            {...noPropagation}
                                            size="small"
                                            onClick={cancelEditLecture}
                                            sx={{
                                              textTransform: "none",
                                              color:
                                                CSSVAR.textMuted,
                                              fontWeight: 600,
                                              borderRadius: "8px",
                                            }}
                                          >
                                            Hủy bỏ
                                          </Button>
                                          <Button
                                            {...noPropagation}
                                            size="small"
                                            variant="contained"
                                            onClick={saveEditedLecture}
                                            sx={{
                                              bgcolor: MAU.chinh,
                                              textTransform: "none",
                                              fontWeight: 700,
                                              borderRadius: "8px",
                                              boxShadow: "none",
                                              "&:hover": {
                                                bgcolor: MAU.chinhDam,
                                                boxShadow: "none",
                                              },
                                            }}
                                          >
                                            Lưu thay đổi
                                          </Button>
                                        </Box>
                                      )}
                                    </Box>
                                  ) : (
                                    <LectureInfoView
                                      bg={bg}
                                      isEditable={isEditable}
                                      onPlayVideo={(url) =>
                                        setVideoPopup({
                                          open: true,
                                          url,
                                        })
                                      }
                                      onOpenDoc={(url, name) =>
                                        setDocPopup({
                                          open: true,
                                          url,
                                          name,
                                        })
                                      }
                                      onDeleteDoc={(taiLieuId) =>
                                        xoaTaiLieu(phanId, itemId, taiLieuId)
                                      }
                                    />
                                  )}

                                  {!isEditing && (
                                    <Box sx={{ mt: 1.5 }}>
                                      {isEditable && (
                                        <>
                                          {addResourceForm[itemId]?.open ? (
                                            <Box
                                              sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 1,
                                                p: 1.5,
                                                bgcolor:
                                                  "var(--ev-paper-alt, #F5F6F8)",
                                                borderRadius: "10px",
                                              }}
                                            >
                                              <TextField
                                                {...noPropagation}
                                                variant="standard"
                                                placeholder="Nhập tên tài liệu"
                                                value={
                                                  addResourceForm[itemId]
                                                    ?.tenTaiLieu || ""
                                                }
                                                onChange={(e) =>
                                                  setAddResourceForm(
                                                    (prev) => ({
                                                      ...prev,
                                                      [itemId]: {
                                                        ...prev[itemId],
                                                        tenTaiLieu:
                                                          e.target.value,
                                                      },
                                                    }),
                                                  )
                                                }
                                                required
                                              />
                                              <Box
                                                sx={{
                                                  display: "flex",
                                                  gap: 1,
                                                  alignItems: "center",
                                                }}
                                              >
                                                <Button
                                                  {...noPropagation}
                                                  component="label"
                                                  variant="outlined"
                                                  size="small"
                                                  startIcon={
                                                    <AttachFile fontSize="small" />
                                                  }
                                                  sx={{
                                                    textTransform: "none",
                                                    borderColor: MAU.chinh,
                                                    color: MAU.chinh,
                                                    fontWeight: 600,
                                                  }}
                                                >
                                                  {addResourceForm[itemId]?.file
                                                    ? "Thay đổi file"
                                                    : "Chọn file"}
                                                  <input
                                                    type="file"
                                                    accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                    hidden
                                                    onChange={(e) => {
                                                      const file =
                                                        e.target.files?.[0];
                                                      if (file) {
                                                        const validation =
                                                          validateTaiLieu(file);
                                                        if (!validation.valid) {
                                                          setToast({
                                                            open: true,
                                                            message:
                                                              validation.error ||
                                                              "File không hợp lệ",
                                                            severity: "error",
                                                          });
                                                          e.target.value = "";
                                                          return;
                                                        }
                                                        const fileName =
                                                          file.name.replace(
                                                            /\.[^/.]+$/,
                                                            "",
                                                          );
                                                        setAddResourceForm(
                                                          (prev) => ({
                                                            ...prev,
                                                            [itemId]: {
                                                              ...prev[itemId],
                                                              file,
                                                              tenTaiLieu:
                                                                prev[itemId]
                                                                  ?.tenTaiLieu ||
                                                                fileName,
                                                            },
                                                          }),
                                                        );
                                                      }
                                                    }}
                                                  />
                                                </Button>
                                                {addResourceForm[itemId]
                                                  ?.file && (
                                                  <Typography
                                                    variant="body2"
                                                    sx={{
                                                      color:
                                                        CSSVAR.textMuted,
                                                      fontSize: 12.5,
                                                    }}
                                                  >
                                                    {
                                                      addResourceForm[itemId]
                                                        ?.file?.name
                                                    }
                                                  </Typography>
                                                )}
                                              </Box>
                                              <Typography
                                                variant="caption"
                                                sx={{
                                                  color:
                                                    CSSVAR.textMuted,
                                                  display: "block",
                                                }}
                                              >
                                                Hỗ trợ file .doc, .docx (dung lượng
                                                tối đa 50MB)
                                              </Typography>
                                              <Box
                                                sx={{
                                                  display: "flex",
                                                  gap: 1,
                                                  justifyContent: "flex-end",
                                                }}
                                              >
                                                <Button
                                                  {...noPropagation}
                                                  size="small"
                                                  onClick={() =>
                                                    setAddResourceForm(
                                                      (prev) => ({
                                                        ...prev,
                                                        [itemId]: {
                                                          tenTaiLieu: "",
                                                          file: null,
                                                          open: false,
                                                        },
                                                      }),
                                                    )
                                                  }
                                                  sx={{
                                                    textTransform: "none",
                                                    color:
                                                      CSSVAR.textMuted,
                                                  }}
                                                >
                                                  Hủy bỏ
                                                </Button>
                                                <Button
                                                  {...noPropagation}
                                                  size="small"
                                                  variant="contained"
                                                  onClick={() => {
                                                    const form =
                                                      addResourceForm[itemId];
                                                    if (
                                                      !form?.tenTaiLieu ||
                                                      !form.tenTaiLieu.trim()
                                                    ) {
                                                      setToast({
                                                        open: true,
                                                        message:
                                                          "Vui lòng nhập tên tài liệu",
                                                        severity: "error",
                                                      });
                                                      return;
                                                    }
                                                    if (form?.file) {
                                                      uploadTaiLieu(
                                                        phanId,
                                                        itemId,
                                                        form.file,
                                                        form.tenTaiLieu.trim(),
                                                      );
                                                    } else {
                                                      setToast({
                                                        open: true,
                                                        message:
                                                          "Vui lòng chọn file",
                                                        severity: "error",
                                                      });
                                                    }
                                                  }}
                                                  sx={{
                                                    bgcolor: MAU.chinh,
                                                    textTransform: "none",
                                                    fontWeight: 700,
                                                    "&:hover": {
                                                      bgcolor: MAU.chinhDam,
                                                    },
                                                  }}
                                                >
                                                  Thêm
                                                </Button>
                                              </Box>
                                            </Box>
                                          ) : (
                                            <Button
                                              {...noPropagation}
                                              size="small"
                                              startIcon={<Add />}
                                              onClick={() =>
                                                setAddResourceForm((prev) => ({
                                                  ...prev,
                                                  [itemId]: {
                                                    tenTaiLieu: "",
                                                    file: null,
                                                    open: true,
                                                  },
                                                }))
                                              }
                                              sx={{
                                                textTransform: "none",
                                                color: MAU.chinh,
                                                fontWeight: 700,
                                                border: `1px dashed ${MAU.chinh}66`,
                                                borderRadius: "8px",
                                                px: 1.5,
                                                "&:hover": {
                                                  bgcolor: `${MAU.chinh}0F`,
                                                  borderColor: MAU.chinh,
                                                },
                                              }}
                                            >
                                              Thêm tài liệu
                                            </Button>
                                          )}
                                        </>
                                      )}
                                    </Box>
                                  )}
                                </LectureItem>
                              );
                            } else {
                              // Quiz
                              const kt = item.data as BaiKiemTraDto;
                              const isQuizExpanded = !!expandedQuizzes[itemId];
                              const isQuizUpdating =
                                quizUpdateForm?.quizId === itemId &&
                                quizUpdateForm?.phanId === phanId;
                              const isQuestionEditing =
                                questionEditor?.quizId === itemId &&
                                questionEditor?.phanId === phanId;
                              const tenHienThi =
                                kt.tenBaiKiemTra ||
                                `Bài kiểm tra ${soThuTuMuc}`;
                              const lyDoTuChoi = (kt as any).lyDoTuChois;

                              return (
                                <QuizItem
                                  key={itemId}
                                  kt={kt}
                                  itemId={itemId}
                                  phanId={phanId}
                                  soThuTuMuc={soThuTuMuc}
                                  tenHienThi={tenHienThi}
                                  isComplete={isComplete}
                                  isExpanded={isQuizExpanded}
                                  isEditable={isEditable}
                                  lyDoTuChoi={lyDoTuChoi}
                                  onToggle={toggleQuizItem}
                                  onEdit={handleOpenQuizUpdate}
                                  onDelete={handleDeleteQuiz}
                                  onShowLyDo={showLyDo}
                                >
                                  {isQuizUpdating ? (
                                    <QuizUpdateForm
                                      data={{
                                        tenBaiKiemTra:
                                          quizUpdateForm.tenBaiKiemTra,
                                        moTa: quizUpdateForm.moTa,
                                      }}
                                      onDataChange={(field, value) =>
                                        setQuizUpdateForm((prev) =>
                                          prev
                                            ? { ...prev, [field]: value }
                                            : null,
                                        )
                                      }
                                      onCancel={handleCloseQuizUpdate}
                                      onSubmit={handleSaveQuizUpdate}
                                      loading={loading}
                                    />
                                  ) : isQuestionEditing ? (
                                    <QuestionDetailForm
                                      question={questionEditor.question}
                                      onQuestionChange={(field, value) =>
                                         setQuestionEditor((prev) => {
                                           if (!prev) return null;
                                           const updatedQuestion = {
                                             ...prev.question,
                                             [field]: value,
                                           };
                                           if (
                                             field === "loaiCauHoi" &&
                                             value === "ONE"
                                           ) {
                                             let foundFirst = false;
                                             updatedQuestion.danhSachDapAn = (
                                               prev.question.danhSachDapAn || []
                                             ).map((d) => {
                                               if (d.laDapAnDung) {
                                                 if (!foundFirst) {
                                                   foundFirst = true;
                                                   return {
                                                     ...d,
                                                     laDapAnDung: true,
                                                   };
                                                 }
                                                 return {
                                                   ...d,
                                                   laDapAnDung: false,
                                                 };
                                               }
                                               return d;
                                             });
                                           }
                                           return {
                                             ...prev,
                                             question: updatedQuestion,
                                           };
                                         })
                                       }
                                      onAddDapAn={() => {
                                        if (!questionEditor) return;
                                        if (
                                          questionEditor.question.danhSachDapAn
                                            .length >= 15
                                        ) {
                                          setToast({
                                            open: true,
                                            message: "Tối đa 15 đáp án",
                                            severity: "error",
                                          });
                                          return;
                                        }
                                        const newDapAn = {
                                          id: uuidv4(),
                                          noiDungDapAn: "",
                                          laDapAnDung: false,
                                          thuTuSapXep:
                                            questionEditor.question
                                              .danhSachDapAn.length,
                                          giaiThich: "",
                                        };
                                        setQuestionEditor((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                question: {
                                                  ...prev.question,
                                                  danhSachDapAn: [
                                                    ...prev.question
                                                      .danhSachDapAn,
                                                    newDapAn,
                                                  ],
                                                },
                                              }
                                            : null,
                                        );
                                      }}
                                      onRemoveDapAn={(dId) => {
                                        if (!questionEditor) return;
                                        if (
                                          questionEditor.question.danhSachDapAn
                                            .length <= 2
                                        ) {
                                          setToast({
                                            open: true,
                                            message: "Cần ít nhất 2 đáp án",
                                            severity: "error",
                                          });
                                          return;
                                        }
                                        setQuestionEditor((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                question: {
                                                  ...prev.question,
                                                  danhSachDapAn:
                                                    prev.question.danhSachDapAn.filter(
                                                      (d) => d.id !== dId,
                                                    ),
                                                },
                                              }
                                            : null,
                                        );
                                      }}
                                      onUpdateDapAn={(dId, field, value) => {
                                        if (!questionEditor) return;
                                        setQuestionEditor((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                question: {
                                                  ...prev.question,
                                                  danhSachDapAn:
                                                    prev.question.danhSachDapAn.map(
                                                      (d) =>
                                                        d.id === dId
                                                          ? {
                                                              ...d,
                                                              [field]: value,
                                                            }
                                                          : d,
                                                    ),
                                                },
                                              }
                                            : null,
                                        );
                                      }}
                                      onToggleDapAnDung={(dId, checked) => {
                                        if (!questionEditor) return;
                                        setQuestionEditor((prev) => {
                                          if (!prev) return null;
                                          let newDapAn: typeof prev.question.danhSachDapAn;
                                          if (
                                            prev.question.loaiCauHoi === "ONE"
                                          ) {
                                            newDapAn =
                                              prev.question.danhSachDapAn.map(
                                                (d) => ({
                                                  ...d,
                                                  laDapAnDung: d.id === dId,
                                                }),
                                              );
                                          } else {
                                            newDapAn =
                                              prev.question.danhSachDapAn.map(
                                                (d) =>
                                                  d.id === dId
                                                    ? {
                                                        ...d,
                                                        laDapAnDung: checked,
                                                      }
                                                    : d,
                                              );
                                          }
                                          return {
                                            ...prev,
                                            question: {
                                              ...prev.question,
                                              danhSachDapAn: newDapAn,
                                            },
                                          };
                                        });
                                      }}
                                      onSave={handleSaveQuestion}
                                      onCancel={() => {
                                        setQuestionEditor(null);
                                      }}
                                      loading={loading}
                                      isEditing={questionEditor.isEditing}
                                      quizTitle={tenHienThi}
                                    />
                                  ) : (
                                    <QuestionListView
                                      questions={kt.cauHois || []}
                                      onEdit={(q) =>
                                        handleEditQuestion(
                                          phanId,
                                          itemId,
                                          q,
                                          tenHienThi,
                                        )
                                      }
                                      onDelete={(qId) =>
                                        handleDeleteQuestion(
                                          phanId,
                                          itemId,
                                          qId,
                                        )
                                      }
                                      onAddNew={() =>
                                        handleAddQuestion(
                                          phanId,
                                          itemId,
                                          tenHienThi,
                                        )
                                      }
                                      isEditable={isEditable}
                                      showAddButton={isEditable} // Chỉ hiện nút thêm khi đang sửa
                                      expandedQuestions={expandedQuestions}
                                      onToggleQuestion={toggleQuestion}
                                    />
                                  )}
                                </QuizItem>
                              );
                            }
                          })}

                          {/* BÀI GIẢNG ĐANG TẢI VIDEO LÊN (placeholder) */}
                          {(pendingLectures[phanId] || []).map((item, idx) => (
                            <PendingLectureItem
                              key={item.key}
                              tieuDe={item.tieuDe}
                              soThuTuMuc={items.length + idx + 1}
                            />
                          ))}
                        </Box>
                      </SortableContext>
                    </DndContext>

                    {/* FORM TẠO QUIZ */}
                    {quizCreateForm?.phanId === phanId && isEditable && (
                      <Box sx={{ mt: 1 }}>
                        <QuizCreateForm
                          data={{
                            tenBaiKiemTra: quizCreateForm.tenBaiKiemTra || "",
                            moTa: quizCreateForm.moTa || "",
                          }}
                          onDataChange={(field, value) =>
                            setQuizCreateForm((prev) =>
                              prev ? { ...prev, [field]: value } : null,
                            )
                          }
                          onCancel={() => {
                            setQuizCreateForm(null);
                          }}
                          onSubmit={handleCreateQuiz}
                          loading={loading}
                        />
                      </Box>
                    )}

                    {/* FORM THÊM BÀI GIẢNG */}
                    {addForm?.phanId === phanId &&
                      addForm.type === "BaiGiang" &&
                      isEditable && (
                        <Box sx={{ mt: 1 }}>
                          <LectureCreateForm
                            data={{
                              title: addForm.title || "",
                              file: addForm.file || null,
                              isFree: addForm.isFree || false,
                            }}
                            onDataChange={(field, value) =>
                              setAddForm((prev) =>
                                prev ? { ...prev, [field]: value } : null,
                              )
                            }
                            onSelectFile={(file) =>
                              setAddForm((prev) =>
                                prev ? { ...prev, file } : null,
                              )
                            }
                            onCancel={() => {
                              setAddForm(null);
                            }}
                            loading={loading}
                            onSubmit={handleCreateBaiGiang}
                          />
                        </Box>
                      )}

                    {/* Nút thêm mục */}
                    {isEditable && !hasAddForm && (
                      <Button
                        {...noPropagation}
                        startIcon={<Add />}
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setMenuAnchor({
                            position: {
                              top: rect.bottom + 6,
                              left: rect.left,
                            },
                            phanId,
                          });
                        }}
                        sx={{
                          alignSelf: "flex-start",
                          textTransform: "none",
                          fontWeight: 700,
                          color: MAU.chinh,
                          border: `1px solid ${MAU.chinh}`,
                          borderRadius: "10px",
                          px: 2,
                          mt: 1,
                          bgcolor: CSSVAR.paper,
                          "&:hover": { bgcolor: `${MAU.chinh}0F` },
                        }}
                      >
                        Thêm mục
                      </Button>
                    )}

                    {/* Indicator khi đang thêm */}
                    {isEditable && hasAddForm && (
                      <Box
                        sx={{
                          mt: 1.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          px: 2,
                          py: 1,
                          bgcolor: `${MAU.chinh}0A`,
                          borderRadius: "10px",
                          border: `1px solid ${MAU.chinh}33`,
                        }}
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: MAU.chinh,
                            animation: "pulse 1.5s ease-in-out infinite",
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: 13,
                            color: CSSVAR.textSecondary,
                            fontWeight: 500,
                          }}
                        >
                          {quizCreateForm?.phanId === phanId
                            ? "Đang thêm bài kiểm tra mới vào phần này..."
                            : "Đang thêm bài giảng mới vào phần này..."}
                        </Typography>
                      </Box>
                    )}
                  </SectionItem>
                );
              })}
            </Box>
          </SortableContext>
        </DndContext>

        {/* Nút thêm phần mới */}
        {isEditable && phanForm?.mode !== "add" && (
          <Button
            {...noPropagation}
            startIcon={<Add />}
            onClick={moThemPhan}
            disabled={loading}
            sx={{
              mt: 3,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 14,
              color: MAU.chinh,
              border: `1px solid ${MAU.chinh}`,
              borderRadius: "10px",
              px: 3,
              py: 1,
              bgcolor: CSSVAR.paper,
              boxShadow: "0 2px 8px rgba(122,31,43,0.05)",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: MAU.chinhNhat,
                boxShadow: "0 4px 12px rgba(122,31,43,0.12)",
                transform: "translateY(-1px)",
              },
            }}
          >
            Thêm phần
          </Button>
        )}

        {/* Form thêm phần mới */}
        {phanForm?.mode === "add" && isEditable && (
          <Box
            sx={{
              mt: 3.5,
              p: 3.5,
              border: `1px solid ${CSSVAR.divider}`,
              borderRadius: "16px",
              bgcolor: CSSVAR.paper,
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              position: "relative",
            }}
          >
            {loading && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: "rgba(255,255,255,0.7)",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                  backdropFilter: "blur(2px)",
                }}
              >
                <CircularProgress size={28} sx={{ color: MAU.chinh }} />
              </Box>
            )}

            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 16,
                color: CSSVAR.textPrimary,
                mb: 2,
                opacity: loading ? 0.5 : 1,
                pointerEvents: loading ? "none" : "auto",
              }}
            >
              Thêm phần mới
            </Typography>
            <TextField
              {...noPropagation}
              placeholder="Tiêu đề phần"
              value={phanForm.tenPhan}
              onChange={(e) =>
                setPhanForm({ ...phanForm, tenPhan: e.target.value })
              }
              fullWidth
              disabled={loading}
              sx={{
                mb: 2,
                opacity: loading ? 0.5 : 1,
                pointerEvents: loading ? "none" : "auto",
              }}
            />
            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: "flex-end",
                opacity: loading ? 0.5 : 1,
                pointerEvents: loading ? "none" : "auto",
              }}
            >
              <Button
                {...noPropagation}
                onClick={() => setPhanForm(null)}
                disabled={loading}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  color: CSSVAR.textSecondary,
                  py: 1.2,
                  px: 3,
                  borderRadius: "10px",
                  "&:hover": {
                    bgcolor: CSSVAR.paperAlt,
                    color: CSSVAR.textPrimary,
                  },
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                {...noPropagation}
                variant="contained"
                onClick={submitPhanForm}
                disabled={loading || !phanForm.tenPhan?.trim()}
                sx={{
                  bgcolor: BRAND.main,
                  textTransform: "none",
                  fontWeight: 800,
                  py: 1.2,
                  px: 3.5,
                  borderRadius: "10px",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#7F1D1D",
                    boxShadow: "none",
                  },
                  "&.Mui-disabled": {
                    bgcolor: CSSVAR.divider,
                    color: CSSVAR.textMuted,
                    boxShadow: "none",
                  },
                }}
              >
                Thêm phần
              </Button>
            </Box>
          </Box>
        )}

        {/* MENU thêm mục */}
        <Menu
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          anchorReference="anchorPosition"
          anchorPosition={menuAnchor?.position}
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          disableScrollLock
          slotProps={{
            paper: {
              sx: {
                width: 380,
                maxWidth: "calc(100vw - 32px)",
                maxHeight: 460,
                borderRadius: "16px",
                boxShadow: "0 8px 28px rgba(17,24,39,0.12)",
                border: "1px solid #EDEFF3",
                py: 1,
              },
            },
          }}
        >
          {nhomTuyChonThemMuc.map((nhom, nhomIdx) => (
            <Box key={nhom.groupLabel}>
              <Typography
                sx={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: CSSVAR.textMuted,
                  px: 2,
                  pt: nhomIdx === 0 ? 0.5 : 1.5,
                  pb: 0.75,
                }}
              >
                {nhom.groupLabel}
              </Typography>
              {nhom.options.map((tuyChon) => (
                <MenuItem
                  key={tuyChon.title}
                  {...noPropagation}
                  onClick={() => chonTuyChonThemMuc(tuyChon)}
                  disabled={tuyChon.disabled || !isEditable}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                    px: 2,
                    py: 1.25,
                    mx: 1,
                    borderRadius: "12px",
                    whiteSpace: "normal",
                    opacity: tuyChon.disabled || !isEditable ? 0.5 : 1,
                    "&:hover": {
                      bgcolor:
                        tuyChon.disabled || !isEditable
                          ? "transparent"
                          : "#F5F6F8",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      bgcolor: tuyChon.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: MAU.chinh,
                    }}
                  >
                    {tuyChon.icon}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: 14.5,
                        color: CSSVAR.textPrimary,
                        lineHeight: 1.4,
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      }}
                    >
                      {tuyChon.title}
                    </Typography>
                    {tuyChon.description && (
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          color: CSSVAR.textMuted,
                          lineHeight: 1.5,
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          mt: 0.25,
                        }}
                      >
                        {tuyChon.description}
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              ))}
              {nhomIdx < nhomTuyChonThemMuc.length - 1 && (
                <Divider sx={{ mx: 2, my: 1 }} />
              )}
            </Box>
          ))}
        </Menu>

        {/* Popup video */}
        <Dialog
          open={videoPopup.open}
          onClose={() => setVideoPopup({ ...videoPopup, open: false })}
          maxWidth="lg"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                height: "90vh",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
              },
            },
          }}
        >
          <DialogTitle
            sx={{ fontWeight: 700, color: MAU.chuDen, flexShrink: 0 }}
          >
            Video bài giảng
            <IconButton
              aria-label="close"
              onClick={() => setVideoPopup({ ...videoPopup, open: false })}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent
            dividers
            sx={{
              flex: 1,
              display: "flex",
              p: 0,
              bgcolor: "#000",
              minHeight: 0,
            }}
          >
            {videoPopup.url ? (
              <video
                controls
                autoPlay
                style={{
                  width: "100%",
                  height: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
                src={videoPopup.url}
              />
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ color: "#fff" }}>Không có video</Typography>
              </Box>
            )}
          </DialogContent>
        </Dialog>

        {/* Popup tài liệu */}
        <Dialog
          open={docPopup.open}
          onClose={() => setDocPopup({ ...docPopup, open: false })}
          maxWidth="lg"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                height: "90vh",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
              },
            },
          }}
        >
          <DialogTitle
            sx={{ fontWeight: 700, color: MAU.chuDen, flexShrink: 0 }}
          >
            {docPopup.name || "Tài liệu"}
            <IconButton
              aria-label="close"
              onClick={() => setDocPopup({ ...docPopup, open: false })}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent
            dividers
            sx={{ flex: 1, display: "flex", p: 0, minHeight: 0 }}
          >
            {docPopup.url ? (
              docPopup.url.toLowerCase().includes(".pdf") ||
              docPopup.name?.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={docPopup.url}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  title={docPopup.name}
                />
              ) : (
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                    docPopup.url,
                  )}`}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  title={docPopup.name}
                />
              )
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography>Không thể xem trước tài liệu</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ flexShrink: 0 }}>
            <Button
              {...noPropagation}
              onClick={() => {
                if (docPopup.url) {
                  const link = document.createElement("a");
                  link.href = docPopup.url;
                  link.download = docPopup.name || "download";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }}
              color="primary"
              startIcon={<Save />}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Tải xuống
            </Button>
            <Button
              {...noPropagation}
              onClick={() => setDocPopup({ ...docPopup, open: false })}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog xác nhận xóa */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, onConfirm: () => {} })}
        >
          <DialogTitle sx={{ fontWeight: 700, color: MAU.chuDen }}>
            Xác nhận xóa
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: MAU.chuXam }}>
              Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn
              tác.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              {...noPropagation}
              onClick={() =>
                setDeleteDialog({ open: false, onConfirm: () => {} })
              }
              sx={{ textTransform: "none", fontWeight: 700, color: MAU.chuXam }}
            >
              Hủy bỏ
            </Button>
            <Button
              {...noPropagation}
              onClick={() => deleteDialog.onConfirm()}
              variant="contained"
              sx={{
                bgcolor: MAU.chinh,
                color: "#fff",
                textTransform: "none",
                fontWeight: 700,
                "&:hover": { bgcolor: MAU.chinhDam },
              }}
            >
              Xóa
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog hiển thị lý do */}
        <Dialog
          open={lyDoPopup.open}
          onClose={() => setLyDoPopup({ open: false, lyDo: "" })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700, color: MAU.chuDen }}>
            Lý do từ chối
            <IconButton
              aria-label="close"
              onClick={() => setLyDoPopup({ open: false, lyDo: "" })}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Box
              dangerouslySetInnerHTML={{ __html: lyDoPopup.lyDo }}
              sx={{
                "& p": { margin: "0 0 0.5em 0" },
                "& ul, & ol": { margin: "4px 0", paddingLeft: "18px" },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setLyDoPopup({ open: false, lyDo: "" })}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={toast.open}
          autoHideDuration={3000}
          onClose={() => setToast({ ...toast, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={toast.severity} sx={{ width: "100%" }}>
            {toast.message}
          </Alert>
        </Snackbar>
      </Box>
    </AuthGuard>
  );
}
