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
} from "@mui/icons-material";
import { useState, useCallback } from "react";
import { MAU, tinhTongThoiLuongGiay } from "../../components/courseEditCore";
import { PhanHocType } from "@/src/types/PhanHoc/Dto/PhanHocdto";
import { BaiGiangType } from "@/src/types/BaiGiang/Dto/BaiGiangDto";
import { BaiKiemTraDto } from "@/src/types/baiKiemTra/Dto/baiKiemTraDto";
import { TaiLieuType } from "@/src/types/TaiLieu/Dto/TaiLieuDto";
import AuthGuard from "@/src/components/AuthGuard";
import { useCourseEdit } from "../../components/CourseEditContext";

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
import DashboardShell from "@/src/components/dashboard/DashboardShell";

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

// ===== Định dạng thời lượng =====
function dinhDangThoiLuong(giay: number) {
  const p = Math.floor(giay / 60);
  const g = giay % 60;
  return `${p}:${String(g).padStart(2, "0")}`;
}

// ===== Validation video =====
function validateVideoFile(
  file: File,
): Promise<{ valid: boolean; error?: string }> {
  return new Promise((resolve) => {
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
          error: `Độ phân giải tối thiểu 854x480 (hiện tại: ${width}x${height})`,
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

// ===== Component SortableItem =====
function SortableItem({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
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
    touchAction: "none",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

// ===== COMPONENT FORM BÀI KIỂM TRA (có drag-drop câu hỏi) =====
function QuizForm({
  isEditing,
  readOnly = false,
  data,
  onDataChange,
  onAddQuestion,
  onRemoveQuestion,
  onUpdateQuestion,
  onAddDapAn,
  onRemoveDapAn,
  onUpdateDapAn,
  onToggleDapAnDung,
  onCancel,
  onSubmit,
  loading,
  submitLabel,
  expandedQuestions,
  toggleQuestionExpand,
  onReorderQuestions,
}: {
  isEditing: boolean;
  readOnly?: boolean;
  data: any;
  onDataChange: (field: string, value: any) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (qId: string) => void;
  onUpdateQuestion: (qId: string, field: string, value: any) => void;
  onAddDapAn: (qId: string) => void;
  onRemoveDapAn: (qId: string, dId: string) => void;
  onUpdateDapAn: (qId: string, dId: string, field: string, value: any) => void;
  onToggleDapAnDung: (qId: string, dId: string, checked: boolean) => void;
  onCancel: () => void;
  onSubmit: () => void;
  loading: boolean;
  submitLabel: string;
  expandedQuestions: Record<string, boolean>;
  toggleQuestionExpand: (qId: string) => void;
  onReorderQuestions?: (newQuestions: any[]) => void;
}) {
  const isFormDisabled = readOnly || loading;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEndQuestions = (event: DragEndEvent) => {
    if (!onReorderQuestions || readOnly) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = data.cauHois.findIndex((q: any) => q.id === active.id);
    const newIndex = data.cauHois.findIndex((q: any) => q.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newQuestions = arrayMove(data.cauHois, oldIndex, newIndex).map(
      (q: any, idx: number) => ({ ...q, thuTuSapXep: idx + 1 }),
    );
    onReorderQuestions(newQuestions);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, color: MAU.chuDen }}
      >
        {readOnly
          ? "Xem bài kiểm tra"
          : isEditing
            ? "Chỉnh sửa bài kiểm tra"
            : "Tạo bài kiểm tra mới"}
      </Typography>

      {!readOnly && (
        <>
          <TextField
            label="Tiêu đề bài kiểm tra *"
            placeholder="Nhập tiêu đề bài kiểm tra"
            value={data.tenBaiKiemTra || ""}
            onChange={(e) => onDataChange("tenBaiKiemTra", e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
            required
            disabled={isFormDisabled}
            slotProps={{
              input: {
                sx: {
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: MAU.chinh,
                  },
                },
              },
            }}
          />
          <TextField
            label="Mô tả bài kiểm tra"
            placeholder="Nhập mô tả bài kiểm tra"
            value={data.moTa || ""}
            onChange={(e) => onDataChange("moTa", e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
            multiline
            rows={2}
            disabled={isFormDisabled}
            slotProps={{
              input: {
                sx: {
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: MAU.chinh,
                  },
                },
              },
            }}
          />
        </>
      )}

      {readOnly && data.tenBaiKiemTra && (
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "#6B7280" }}
          >
            Tiêu đề:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
            {data.tenBaiKiemTra}
          </Typography>
          {data.moTa && (
            <>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#6B7280" }}
              >
                Mô tả:
              </Typography>
              <Typography variant="body2" sx={{ color: "#4B5563", mb: 1 }}>
                {data.moTa}
              </Typography>
            </>
          )}
          <Divider sx={{ my: 1 }} />
        </Box>
      )}

      {data.cauHois && data.cauHois.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEndQuestions}
        >
          <SortableContext
            items={data.cauHois.map((q: any) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            {data.cauHois.map((q: any, qIndex: number) => {
              const isExpanded = expandedQuestions[q.id] || false;
              return (
                <SortableItem key={q.id} id={q.id}>
                  <Box sx={{ mb: 1.5 }}>
                    <Paper
                      sx={{
                        bgcolor: "#FAFAFA",
                        border: "1px solid #EDEFF3",
                        borderRadius: "8px",
                        overflow: "hidden",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: isExpanded ? MAU.chinh : "#D1D5DB",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          p: 1.5,
                          cursor: "pointer",
                          bgcolor: isExpanded ? "#F5F6F8" : "transparent",
                          transition: "background-color 0.2s ease",
                          "&:hover": {
                            bgcolor: "#F0F1F3",
                          },
                        }}
                        onClick={() => toggleQuestionExpand(q.id)}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: 14,
                              flexShrink: 0,
                            }}
                          >
                            Câu hỏi {qIndex + 1}
                          </Typography>
                          <Chip
                            size="small"
                            label={
                              q.loaiCauHoi === "ONE"
                                ? "Trắc nghiệm"
                                : "Lựa chọn nhiều"
                            }
                            sx={{
                              fontSize: 11,
                              fontWeight: 600,
                              bgcolor: MAU.chinh + "1A",
                              color: MAU.chinhDam,
                              flexShrink: 0,
                              height: 22,
                            }}
                          />
                          {!isExpanded && q.noiDungCauHoi && (
                            <Typography
                              sx={{
                                fontSize: 13,
                                color: "#6B7280",
                                ml: 1,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                flex: 1,
                              }}
                            >
                              {q.noiDungCauHoi}
                            </Typography>
                          )}
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            flexShrink: 0,
                            gap: 0.5,
                          }}
                        >
                          {!readOnly && (
                            <>
                              <Tooltip title="Xóa câu hỏi">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveQuestion(q.id);
                                  }}
                                  sx={{
                                    color: "#9AA2B1",
                                    "&:hover": { color: "#C62828" },
                                  }}
                                >
                                  <DeleteOutlined fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <DragIndicator
                                sx={{
                                  fontSize: 18,
                                  color: "#C7CCD6",
                                  cursor: "grab",
                                }}
                              />
                            </>
                          )}
                          <Tooltip title={isExpanded ? "Thu gọn" : "Mở rộng"}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleQuestionExpand(q.id);
                              }}
                            >
                              {isExpanded ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      <Collapse in={isExpanded} timeout="auto">
                        <Box sx={{ p: 2, pt: 1 }}>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            size="small"
                            label="Nội dung câu hỏi *"
                            placeholder="Nhập nội dung câu hỏi"
                            value={q.noiDungCauHoi || ""}
                            onChange={(e) =>
                              onUpdateQuestion(
                                q.id,
                                "noiDungCauHoi",
                                e.target.value,
                              )
                            }
                            sx={{ mb: 1.5 }}
                            disabled={readOnly}
                            required
                            slotProps={{
                              input: {
                                sx: {
                                  "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    {
                                      borderColor: MAU.chinh,
                                    },
                                },
                              },
                            }}
                          />
                          <Box
                            sx={{
                              display: "flex",
                              gap: 2,
                              flexWrap: "wrap",
                              mb: 1.5,
                            }}
                          >
                            <FormControl
                              size="small"
                              sx={{ minWidth: 200 }}
                              disabled={readOnly}
                            >
                              <InputLabel>Loại câu hỏi</InputLabel>
                              <Select
                                value={q.loaiCauHoi || "ONE"}
                                label="Loại câu hỏi"
                                onChange={(e) =>
                                  onUpdateQuestion(
                                    q.id,
                                    "loaiCauHoi",
                                    e.target.value,
                                  )
                                }
                                sx={{
                                  "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    {
                                      borderColor: MAU.chinh,
                                    },
                                }}
                              >
                                <MenuItem value="ONE">
                                  Trắc nghiệm (1 đáp án)
                                </MenuItem>
                                <MenuItem value="MULTI">
                                  Lựa chọn nhiều
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, mb: 1.5, color: "#1F2937" }}
                          >
                            Đáp án{" "}
                            {!readOnly && (
                              <span style={{ color: "#C62828" }}>*</span>
                            )}
                            {readOnly && (
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 400,
                                  color: "#6B7280",
                                  marginLeft: 8,
                                }}
                              >
                                ({q.danhSachDapAn?.length || 0} đáp án)
                              </span>
                            )}
                          </Typography>
                          {q.danhSachDapAn?.map((d: any, dIdx: number) => {
                            const isDapAnDung = d.laDapAnDung || false;
                            return (
                              <Box
                                key={d.id}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 1,
                                  bgcolor:
                                    isDapAnDung && readOnly
                                      ? "#E8F5E9"
                                      : "#fff",
                                  p: 1,
                                  borderRadius: "6px",
                                  border: `1px solid ${
                                    isDapAnDung && readOnly
                                      ? "#4CAF50"
                                      : "#EDEFF3"
                                  }`,
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    borderColor:
                                      isDapAnDung && readOnly
                                        ? "#4CAF50"
                                        : MAU.chinh,
                                  },
                                }}
                              >
                                {q.loaiCauHoi === "ONE" ? (
                                  <Radio
                                    checked={isDapAnDung}
                                    onChange={(e) =>
                                      onToggleDapAnDung(
                                        q.id,
                                        d.id,
                                        e.target.checked,
                                      )
                                    }
                                    size="small"
                                    sx={{
                                      color: MAU.chinh,
                                      "&.Mui-checked": { color: MAU.chinh },
                                    }}
                                    disabled={readOnly}
                                  />
                                ) : (
                                  <Checkbox
                                    checked={isDapAnDung}
                                    onChange={(e) =>
                                      onToggleDapAnDung(
                                        q.id,
                                        d.id,
                                        e.target.checked,
                                      )
                                    }
                                    size="small"
                                    sx={{
                                      color: MAU.chinh,
                                      "&.Mui-checked": { color: MAU.chinh },
                                    }}
                                    disabled={readOnly}
                                  />
                                )}
                                <TextField
                                  fullWidth
                                  size="small"
                                  placeholder={`Đáp án ${dIdx + 1}`}
                                  value={d.noiDungDapAn || ""}
                                  onChange={(e) =>
                                    onUpdateDapAn(
                                      q.id,
                                      d.id,
                                      "noiDungDapAn",
                                      e.target.value,
                                    )
                                  }
                                  disabled={readOnly}
                                  slotProps={{
                                    input: {
                                      sx: {
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                          {
                                            borderColor: MAU.chinh,
                                          },
                                      },
                                    },
                                  }}
                                />
                                {!readOnly && (
                                  <Tooltip title="Xóa đáp án">
                                    <IconButton
                                      size="small"
                                      onClick={() => onRemoveDapAn(q.id, d.id)}
                                      sx={{
                                        color: "#9AA2B1",
                                        "&:hover": { color: "#C62828" },
                                      }}
                                    >
                                      <DeleteOutlined fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            );
                          })}
                          {!readOnly && (
                            <Button
                              startIcon={<Add />}
                              onClick={() => onAddDapAn(q.id)}
                              size="small"
                              sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                color: MAU.chinh,
                                border: `1px dashed ${MAU.chinh}`,
                                borderRadius: "6px",
                                width: "100%",
                                py: 0.75,
                                mt: 0.5,
                                "&:hover": {
                                  bgcolor: `${MAU.chinh}0F`,
                                  borderColor: MAU.chinhDam,
                                },
                              }}
                            >
                              Thêm đáp án
                            </Button>
                          )}
                        </Box>
                      </Collapse>
                    </Paper>
                  </Box>
                </SortableItem>
              );
            })}
          </SortableContext>
        </DndContext>
      )}

      {!readOnly && (
        <Button
          startIcon={<Add />}
          onClick={onAddQuestion}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            color: MAU.chinh,
            border: `1px dashed ${MAU.chinh}`,
            borderRadius: "8px",
            width: "100%",
            py: 1.5,
            "&:hover": {
              bgcolor: `${MAU.chinh}0F`,
              borderColor: MAU.chinhDam,
            },
          }}
        >
          Thêm câu hỏi
        </Button>
      )}

      {!readOnly && (
        <Box
          sx={{ display: "flex", gap: 1, justifyContent: "flex-end", mt: 1 }}
        >
          <Button
            size="small"
            onClick={onCancel}
            disabled={loading}
            sx={{
              textTransform: "none",
              color: "#8A93A3",
              fontWeight: 600,
              "&:hover": {
                bgcolor: "#F5F6F8",
              },
            }}
          >
            Hủy bỏ
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={onSubmit}
            disabled={loading}
            sx={{
              bgcolor: MAU.chinh,
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              "&:hover": { bgcolor: MAU.chinhDam },
              "&.Mui-disabled": {
                bgcolor: "#E0E0E0",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              submitLabel
            )}
          </Button>
        </Box>
      )}
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
    createTaiLieu,
    deleteTaiLieu,
    loading: contextLoading,
    refreshData,
    trangThai,
  } = useCourseEdit();

  // ===== State =====
  const [expandedLectures, setExpandedLectures] = useState<
    Record<string, boolean>
  >({});
  const [expandedQuizzes, setExpandedQuizzes] = useState<
    Record<string, boolean>
  >({});
  const [addForm, setAddForm] = useState<{
    phanId: string;
    type: "BaiGiang" | "BaiKiemTra";
    title?: string;
    file?: File | null;
    isFree?: boolean;
    tenBaiKiemTra?: string;
    moTa?: string;
    cauHois?: {
      id: string;
      noiDungCauHoi: string;
      loaiCauHoi: "ONE" | "MULTI";
      diem: number;
      doKho: "De" | "TrungBinh" | "Kho";
      danhSachDapAn: {
        id: string;
        noiDungDapAn: string;
        laDapAnDung: boolean;
        thuTuSapXep: number;
      }[];
    }[];
  } | null>(null);

  const [editingLecture, setEditingLecture] = useState<{
    phanId: string;
    lectureId: string;
    title: string;
    isFree: boolean;
    file: File | null;
  } | null>(null);

  const [editingQuiz, setEditingQuiz] = useState<{
    phanId: string;
    quizId: string;
    tenBaiKiemTra: string;
    moTa: string;
    cauHois: {
      id: string;
      noiDungCauHoi: string;
      loaiCauHoi: "ONE" | "MULTI";
      diem: number;
      doKho: "De" | "TrungBinh" | "Kho";
      danhSachDapAn: {
        id: string;
        noiDungDapAn: string;
        laDapAnDung: boolean;
        thuTuSapXep: number;
      }[];
    }[];
  } | null>(null);

  const [expandedQuestions, setExpandedQuestions] = useState<
    Record<string, boolean>
  >({});
  const [menuAnchor, setMenuAnchor] = useState<{
    position: { top: number; left: number };
    phanId: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
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
  const [tempVideoFiles, setTempVideoFiles] = useState<{
    [baiGiangId: string]: File;
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
    mieuTa: string;
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

  // Kiểm tra có thể chỉnh sửa hay không (chỉ DangSua mới cho sửa)
  const isEditable = trangThai === "DangSua";

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
          icon: <QuizOutlined sx={{ fontSize: 22, color: "#D97706" }} />,
          iconBg: "#FEF3E2",
          title: "Trắc nghiệm",
          description: "Kiểm tra nhanh mức độ hiểu bài sau mỗi bài học.",
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

  // 1. Sắp xếp phần
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
      await refreshData();
    } finally {
      setLoading(false);
    }
  };

  // 2. Sắp xếp các mục trong phần
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

    const updatedPhan = {
      ...phan,
      DanhSachBaiGiang: newItems
        .filter((item) => item.kind === "BaiGiang")
        .map((item, idx) => ({ ...item.data, thuTuSapXep: idx + 1 })),
      DanhDachBaiKiemTra: newItems
        .filter((item) => item.kind === "BaiKiemTra")
        .map((item, idx) => ({ ...item.data, thuTuSapXep: idx + 1 })),
    };

    setPhans(phans.map((p) => (p.id === phanId ? updatedPhan : p)));

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
          updateBaiKiemTra(phanId, kt.id, {
            tenBaiKiemTra: kt.tenBaiKiemTra,
            moTa: kt.moTa || "",
            cauHois: kt.cauHois || [],
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
      await refreshData();
    } finally {
      setLoading(false);
    }
  };

  // 3. Sắp xếp câu hỏi
  const handleReorderQuestions = async (
    phanId: string,
    quizId: string,
    newCauHois: any[],
  ) => {
    if (!isEditable) return;

    // Cập nhật state
    setPhans(
      phans.map((p) =>
        p.id === phanId
          ? {
              ...p,
              DanhDachBaiKiemTra: p.DanhDachBaiKiemTra?.map((kt) =>
                kt.id === quizId
                  ? {
                      ...kt,
                      cauHois: newCauHois.map((q, idx) => ({
                        ...q,
                        thuTuSapXep: idx + 1,
                      })),
                    }
                  : kt,
              ),
            }
          : p,
      ),
    );

    try {
      const phan = phans.find((p) => p.id === phanId);
      const quiz = phan?.DanhDachBaiKiemTra?.find((kt) => kt.id === quizId);
      if (!quiz) return;

      await updateBaiKiemTra(phanId, quizId, {
        tenBaiKiemTra: quiz.tenBaiKiemTra,
        moTa: quiz.moTa || "",
        cauHois: newCauHois.map((q, idx) => ({ ...q, thuTuSapXep: idx + 1 })),
        thuTuSapXep: quiz.thuTuSapXep,
      });
      setToast({
        open: true,
        message: "Đã cập nhật thứ tự câu hỏi",
        severity: "success",
      });
    } catch (error: any) {
      setToast({
        open: true,
        message: error.message || "Lỗi cập nhật thứ tự câu hỏi",
        severity: "error",
      });
      await refreshData();
    }
  };

  // ===== CÁC HÀM CRUD =====

  const moThemPhan = () => {
    if (!isEditable) return;
    setPhanForm({ mode: "add", tenPhan: "", mieuTa: "" });
  };

  const moSuaPhan = (phanId: string) => {
    if (!isEditable) return;
    const phan = phans.find((p) => p.id === phanId);
    if (!phan) return;
    setPhanForm({
      mode: "edit",
      phanId,
      tenPhan: phan.tenPhan || "",
      mieuTa: phan.mieuTa || "",
    });
  };

  const submitPhanForm = async () => {
    if (!phanForm) return;
    const { mode, phanId, tenPhan, mieuTa } = phanForm;
    if (!tenPhan.trim()) {
      setToast({
        open: true,
        message: "Vui lòng nhập tiêu đề phần",
        severity: "error",
      });
      return;
    }
    setLoading(true);
    try {
      if (mode === "add") {
        await createPhan({ tenPhan, mieuTa });
        setToast({
          open: true,
          message: "Đã thêm phần mới",
          severity: "success",
        });
      } else if (mode === "edit" && phanId) {
        await updatePhan(phanId, { tenPhan, mieuTa });
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
      setLoading(false);
    }
  };

  const xoaPhan = async (phanId: string) => {
    if (!isEditable) return;
    setDeleteDialog({
      open: true,
      onConfirm: async () => {
        setDeleteDialog({ open: false, onConfirm: () => {} });
        setLoading(true);
        try {
          await deletePhan(phanId);
          const newPhans = phans.filter((p) => p.id !== phanId);
          setPhans(newPhans);
          setToast({ open: true, message: "Đã xóa phần", severity: "success" });
        } catch (error: any) {
          setToast({
            open: true,
            message: error.message || "Lỗi xóa phần",
            severity: "error",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const xoaBaiGiang = async (phanId: string, baiGiangId: string) => {
    if (!isEditable) return;
    setDeleteDialog({
      open: true,
      onConfirm: async () => {
        setDeleteDialog({ open: false, onConfirm: () => {} });
        try {
          await deleteBaiGiang(phanId, baiGiangId);
          const updatedPhans = phans.map((p) =>
            p.id === phanId
              ? {
                  ...p,
                  DanhSachBaiGiang: p.DanhSachBaiGiang?.filter(
                    (b) => b.id !== baiGiangId,
                  ),
                }
              : p,
          );
          setPhans(updatedPhans);
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
        }
      },
    });
  };

  const saveBaiGiang = async (
    phanId: string,
    baiGiangId: string,
    tieuDe?: string,
    isFree?: boolean,
  ) => {
    setLoading(true);
    try {
      const phan = phans.find((p) => p.id === phanId);
      if (!phan) return;
      const bg = (phan.DanhSachBaiGiang ?? []).find((b) => b.id === baiGiangId);
      if (!bg) return;

      await updateBaiGiang(phanId, baiGiangId, {
        tieuDe: tieuDe !== undefined ? tieuDe : bg.tieuDe,
        isFree: isFree !== undefined ? isFree : bg.laBaiGiangFree,
        file: tempVideoFiles[baiGiangId] || null,
      });
      setTempVideoFiles((prev) => {
        const newState = { ...prev };
        delete newState[baiGiangId];
        return newState;
      });
      setToast({
        open: true,
        message: "Bài giảng đã được lưu",
        severity: "success",
      });
    } catch (error: any) {
      setToast({
        open: true,
        message: error.message || "Lỗi lưu bài giảng",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditLecture = (phanId: string, lectureId: string) => {
    if (!isEditable) return;
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

    const phan = phans.find((p) => p.id === phanId);
    if (phan) {
      const updatedBg = phan.DanhSachBaiGiang?.map((bg) =>
        bg.id === lectureId
          ? { ...bg, tieuDe: title.trim(), laBaiGiangFree: isFree }
          : bg,
      );
      const updatedPhans = phans.map((p) =>
        p.id === phanId ? { ...p, DanhSachBaiGiang: updatedBg } : p,
      );
      setPhans(updatedPhans);
    }

    if (file) {
      setTempVideoFiles((prev) => ({ ...prev, [lectureId]: file }));
    }

    await saveBaiGiang(phanId, lectureId, title.trim(), isFree);
    setEditingLecture(null);
  };

  const xoaBaiKiemTra = async (phanId: string, baiKiemTraId: string) => {
    if (!isEditable) return;
    setDeleteDialog({
      open: true,
      onConfirm: async () => {
        setDeleteDialog({ open: false, onConfirm: () => {} });
        setLoading(true);
        try {
          await deleteBaiKiemTra(phanId, baiKiemTraId);
          setToast({
            open: true,
            message: "Đã xóa bài kiểm tra",
            severity: "success",
          });
        } catch (error: any) {
          setToast({
            open: true,
            message: error.message || "Lỗi xóa bài kiểm tra",
            severity: "error",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // === Handlers cho bài kiểm tra ===
  const handleAddQuestion = () => {
    if (!addForm || addForm.type !== "BaiKiemTra") return;
    const newQuestion = {
      id: uuidv4(),
      noiDungCauHoi: "",
      loaiCauHoi: "ONE" as const,
      diem: 1,
      doKho: "TrungBinh" as const,
      danhSachDapAn: [
        { id: uuidv4(), noiDungDapAn: "", laDapAnDung: false, thuTuSapXep: 0 },
        { id: uuidv4(), noiDungDapAn: "", laDapAnDung: false, thuTuSapXep: 1 },
      ],
    };
    setAddForm((prev) => ({
      ...prev!,
      cauHois: [...(prev!.cauHois || []), newQuestion],
    }));
    setExpandedQuestions((prev) => ({ ...prev, [newQuestion.id]: true }));
  };

  const handleRemoveQuestion = (qId: string) => {
    if (!addForm) return;
    setAddForm((prev) => ({
      ...prev!,
      cauHois: (prev!.cauHois || []).filter((q) => q.id !== qId),
    }));
    setExpandedQuestions((prev) => {
      const newState = { ...prev };
      delete newState[qId];
      return newState;
    });
  };

  const toggleQuestionExpand = (qId: string) => {
    setExpandedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleQuizGeneralChange = (field: string, value: any) => {
    if (!addForm) return;
    setAddForm((prev) => ({ ...prev!, [field]: value }));
  };

  const handleUpdateQuestion = (qId: string, field: string, value: any) => {
    if (!addForm) return;
    setAddForm((prev) => ({
      ...prev!,
      cauHois: (prev!.cauHois || []).map((q) =>
        q.id === qId ? { ...q, [field]: value } : q,
      ),
    }));
  };

  const handleAddDapAn = (qId: string) => {
    if (!addForm) return;
    setAddForm((prev) => ({
      ...prev!,
      cauHois: (prev!.cauHois || []).map((q) => {
        if (q.id !== qId) return q;
        const newDapAn = {
          id: uuidv4(),
          noiDungDapAn: "",
          laDapAnDung: false,
          thuTuSapXep: q.danhSachDapAn.length,
        };
        return { ...q, danhSachDapAn: [...q.danhSachDapAn, newDapAn] };
      }),
    }));
  };

  const handleRemoveDapAn = (qId: string, dId: string) => {
    if (!addForm) return;
    setAddForm((prev) => ({
      ...prev!,
      cauHois: (prev!.cauHois || []).map((q) => {
        if (q.id !== qId) return q;
        if (q.danhSachDapAn.length <= 2) {
          setToast({
            open: true,
            message: "Cần ít nhất 2 đáp án",
            severity: "error",
          });
          return q;
        }
        return {
          ...q,
          danhSachDapAn: q.danhSachDapAn.filter((d) => d.id !== dId),
        };
      }),
    }));
  };

  const handleUpdateDapAn = (
    qId: string,
    dId: string,
    field: string,
    value: any,
  ) => {
    if (!addForm) return;
    setAddForm((prev) => ({
      ...prev!,
      cauHois: (prev!.cauHois || []).map((q) => {
        if (q.id !== qId) return q;
        return {
          ...q,
          danhSachDapAn: q.danhSachDapAn.map((d) =>
            d.id === dId ? { ...d, [field]: value } : d,
          ),
        };
      }),
    }));
  };

  const handleToggleDapAnDung = (
    qId: string,
    dId: string,
    checked: boolean,
  ) => {
    if (!addForm) return;
    setAddForm((prev) => ({
      ...prev!,
      cauHois: (prev!.cauHois || []).map((q) => {
        if (q.id !== qId) return q;
        let newDapAn = q.danhSachDapAn.map((d) =>
          d.id === dId ? { ...d, laDapAnDung: checked } : d,
        );
        if (q.loaiCauHoi === "ONE" && checked) {
          newDapAn = newDapAn.map((d) =>
            d.id === dId
              ? { ...d, laDapAnDung: true }
              : { ...d, laDapAnDung: false },
          );
        }
        return { ...q, danhSachDapAn: newDapAn };
      }),
    }));
  };

  const handleCreateQuiz = async () => {
    if (!addForm || addForm.type !== "BaiKiemTra") return;
    const { phanId, tenBaiKiemTra, moTa, cauHois } = addForm;

    if (!tenBaiKiemTra || tenBaiKiemTra.trim() === "") {
      setToast({
        open: true,
        message: "Vui lòng nhập tiêu đề bài kiểm tra",
        severity: "error",
      });
      return;
    }
    if (!cauHois || cauHois.length === 0) {
      setToast({
        open: true,
        message: "Vui lòng thêm ít nhất một câu hỏi",
        severity: "error",
      });
      return;
    }
    for (const q of cauHois) {
      if (!q.noiDungCauHoi.trim()) {
        setToast({
          open: true,
          message: "Vui lòng nhập nội dung câu hỏi",
          severity: "error",
        });
        return;
      }
      if (q.danhSachDapAn.some((d) => !d.noiDungDapAn.trim())) {
        setToast({
          open: true,
          message: "Vui lòng nhập nội dung cho tất cả đáp án",
          severity: "error",
        });
        return;
      }
      if (!q.danhSachDapAn.some((d) => d.laDapAnDung)) {
        setToast({
          open: true,
          message: "Mỗi câu hỏi cần có ít nhất một đáp án đúng",
          severity: "error",
        });
        return;
      }
    }

    setLoading(true);
    try {
      await createBaiKiemTra(phanId, {
        tenBaiKiemTra: tenBaiKiemTra.trim(),
        moTa: moTa || "",
        cauHois,
      });
      setToast({
        open: true,
        message: "Đã tạo bài kiểm tra",
        severity: "success",
      });
      setAddForm(null);
      setExpandedQuestions({});
    } catch (error: any) {
      setToast({
        open: true,
        message: error.message || "Lỗi tạo bài kiểm tra",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuiz = (phanId: string, quizId: string) => {
    if (!isEditable) return;
    const phan = phans.find((p) => p.id === phanId);
    if (!phan) return;
    const quiz = phan.DanhDachBaiKiemTra?.find((kt) => kt.id === quizId);
    if (!quiz) return;

    const initialExpanded: Record<string, boolean> = {};
    if (quiz.cauHois) {
      quiz.cauHois.forEach((q: any) => {
        const id = q.id || uuidv4();
        initialExpanded[id] = true;
      });
    }
    setExpandedQuestions(initialExpanded);

    setEditingQuiz({
      phanId,
      quizId,
      tenBaiKiemTra: quiz.tenBaiKiemTra || "",
      moTa: quiz.moTa || "",
      cauHois: quiz.cauHois
        ? quiz.cauHois.map((q: any) => ({
            id: q.id || uuidv4(),
            noiDungCauHoi: q.noiDungCauHoi || q.tenCauHoi || "",
            loaiCauHoi: q.loaiCauHoi || "ONE",
            diem: q.diem || 1,
            doKho: q.doKho || "TrungBinh",
            danhSachDapAn: (q.danhSachDapAn || []).map((d: any) => ({
              id:
                d.id ||
                "da_" + Date.now() + Math.random().toString(36).substr(2, 3),
              noiDungDapAn: d.noiDungDapAn || "",
              laDapAnDung: d.laDapAnDung || false,
              thuTuSapXep: d.thuTuSapXep || 0,
            })),
          }))
        : [],
    });
  };

  const cancelEditQuiz = () => {
    setEditingQuiz(null);
    setExpandedQuestions({});
  };

  const saveEditQuiz = async () => {
    if (!editingQuiz) return;
    const { phanId, quizId, tenBaiKiemTra, moTa, cauHois } = editingQuiz;

    if (!tenBaiKiemTra || tenBaiKiemTra.trim() === "") {
      setToast({
        open: true,
        message: "Vui lòng nhập tiêu đề bài kiểm tra",
        severity: "error",
      });
      return;
    }
    if (!cauHois || cauHois.length === 0) {
      setToast({
        open: true,
        message: "Vui lòng thêm ít nhất một câu hỏi",
        severity: "error",
      });
      return;
    }
    for (const q of cauHois) {
      if (!q.noiDungCauHoi.trim()) {
        setToast({
          open: true,
          message: "Vui lòng nhập nội dung câu hỏi",
          severity: "error",
        });
        return;
      }
      if (q.danhSachDapAn.some((d) => !d.noiDungDapAn.trim())) {
        setToast({
          open: true,
          message: "Vui lòng nhập nội dung cho tất cả đáp án",
          severity: "error",
        });
        return;
      }
      if (!q.danhSachDapAn.some((d) => d.laDapAnDung)) {
        setToast({
          open: true,
          message: "Mỗi câu hỏi cần có ít nhất một đáp án đúng",
          severity: "error",
        });
        return;
      }
    }

    setLoading(true);
    try {
      await updateBaiKiemTra(phanId, quizId, {
        tenBaiKiemTra: tenBaiKiemTra.trim(),
        moTa,
        cauHois,
      });
      setToast({
        open: true,
        message: "Đã cập nhật bài kiểm tra",
        severity: "success",
      });
      setEditingQuiz(null);
      setExpandedQuestions({});
    } catch (error: any) {
      setToast({
        open: true,
        message: error.message || "Lỗi cập nhật bài kiểm tra",
        severity: "error",
      });
    } finally {
      setLoading(false);
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
    setLoading(true);
    try {
      await createTaiLieu(phanId, baiGiangId, file, tenTaiLieu);
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
        try {
          await deleteTaiLieu(phanId, baiGiangId, taiLieuId);
          const updatedPhans = phans.map((p) =>
            p.id === phanId
              ? {
                  ...p,
                  DanhSachBaiGiang: p.DanhSachBaiGiang?.map((bg) =>
                    bg.id === baiGiangId
                      ? {
                          ...bg,
                          danhSachTaiLieu: bg.danhSachTaiLieu?.filter(
                            (tl: TaiLieuType) => tl.id !== taiLieuId,
                          ),
                        }
                      : bg,
                  ),
                }
              : p,
          );
          setPhans(updatedPhans);
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
  };

  const tongThoiLuong = tinhTongThoiLuongGiay(phans);
  const tongPhut = Math.floor(tongThoiLuong / 60);

  const handleVideoFileSelect = async (baiGiangId: string, file: File) => {
    if (!isEditable) return;
    const result = await validateVideoFile(file);
    if (!result.valid) {
      alert(`File không hợp lệ: ${result.error}`);
      return;
    }
    setTempVideoFiles((prev) => ({ ...prev, [baiGiangId]: file }));
    setToast({
      open: true,
      message: "Đã chọn video mới, bấm Lưu để cập nhật",
      severity: "info",
    });
  };

  const chonTuyChonThemMuc = (tuyChon: TuyChonThemMuc) => {
    if (!menuAnchor || tuyChon.disabled || !isEditable) return;
    const phanId = menuAnchor.phanId;
    if (!phanId) return;

    if (tuyChon.type === "BaiGiang") {
      setAddForm({
        phanId,
        type: "BaiGiang",
        title: "",
        file: null,
        isFree: false,
      });
    } else if (tuyChon.type === "BaiKiemTra") {
      setAddForm({
        phanId,
        type: "BaiKiemTra",
        tenBaiKiemTra: "",
        moTa: "",
        cauHois: [
          {
            id: uuidv4(),
            noiDungCauHoi: "",
            loaiCauHoi: "ONE",
            diem: 1,
            doKho: "TrungBinh",
            danhSachDapAn: [
              {
                id: uuidv4(),
                noiDungDapAn: "",
                laDapAnDung: false,
                thuTuSapXep: 0,
              },
              {
                id: uuidv4(),
                noiDungDapAn: "",
                laDapAnDung: false,
                thuTuSapXep: 1,
              },
            ],
          },
        ],
      });
      setExpandedQuestions({ q1: true });
    }
    setMenuAnchor(null);
  };

  // ===== RENDER =====
  return (
    <AuthGuard allowedRoles={["Admin", "GiaoVien"]}>
      <Box sx={{ maxWidth: 900, mx: "auto", pb: 12, bgcolor: "transparent" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 26, color: "#111827", mb: 0.5 }}>
              Chương trình giảng dạy
            </Typography>
            <Typography
              sx={{ fontSize: 14.5, color: "#6B7280", lineHeight: 1.6, maxWidth: 600 }}
            >
              Hãy thiết kế khóa học của bạn theo từng phần, mỗi phần tập trung vào
              một mục tiêu học tập duy nhất. Sau đó, thêm nội dung, hoạt động thực
              hành và bài kiểm tra.
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.8,
              bgcolor: "#EFF6FF",
              color: "#2563EB",
              border: "1px solid #BFDBFE",
              px: 2,
              py: 0.8,
              borderRadius: "8px",
              fontSize: 13.5,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            Tổng thời lượng: {tongPhut} phút
          </Box>
        </Box>

        {/* Thông báo khi không thể chỉnh sửa */}
        {!isEditable && (
          <Alert
            severity={trangThai === "DaDuyet" ? "success" : "info"}
            sx={{ mb: 3 }}
          >
            {trangThai === "DaDuyet"
              ? "Khóa học đã được duyệt. Bạn không thể chỉnh sửa chương trình giảng dạy."
              : trangThai === "TuChoi"
                ? "Khóa học bị từ chối. Vui lòng chỉnh sửa và gửi lại."
                : "Khóa học đang trong quá trình duyệt. Bạn không thể chỉnh sửa chương trình giảng dạy trong giai đoạn này."}
          </Alert>
        )}

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

                return (
                  <SortableItem key={phanId} id={phanId}>
                    <Box>
                      <Box
                        sx={{
                          bgcolor: "#F5F6F8",
                          border: "1px solid #E7E9EE",
                          borderRadius: "14px",
                          p: 2.5,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1.5,
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 800,
                              color: "#1F2937",
                              flexShrink: 0,
                            }}
                          >
                            Phần {idx + 1}:
                          </Typography>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: 15,
                              color: "#1F2937",
                              flex: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {phan.tenPhan || "Phần mới"}
                          </Typography>
                          {isEditable && (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => moSuaPhan(phanId)}
                              >
                                <EditOutlined
                                  fontSize="small"
                                  sx={{ color: "#9AA2B1" }}
                                />
                              </IconButton>
                              <Tooltip title="Xóa phần">
                                <IconButton
                                  size="small"
                                  onClick={() => xoaPhan(phanId)}
                                >
                                  <DeleteOutlined
                                    fontSize="small"
                                    sx={{ color: "#9AA2B1" }}
                                  />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          <DragIndicator
                            sx={{
                              fontSize: 20,
                              color: "#C7CCD6",
                              cursor: isEditable ? "grab" : "default",
                            }}
                          />
                        </Box>

                        {/* DANH SÁCH MỤC TRONG PHẦN (BÀI GIẢNG + BÀI KIỂM TRA) VỚI DRAG-DROP */}
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) =>
                            handleDragEndItems(event, phanId)
                          }
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
                                  const hasNewVideo = !!tempVideoFiles[itemId];
                                  const isEditing =
                                    editingLecture?.lectureId === itemId;

                                  return (
                                    <SortableItem key={itemId} id={itemId}>
                                      <Paper
                                        sx={{
                                          mb: 1,
                                          border: "1px solid #EDEFF3",
                                          borderRadius: "8px",
                                          overflow: "hidden",
                                          bgcolor: "#fff",
                                          transition: "all 0.2s ease",
                                          "&:hover": {
                                            borderColor: "#D1D5DB",
                                          },
                                        }}
                                      >
                                        <ListItem
                                          sx={{
                                            px: 1.5,
                                            py: 0.75,
                                            pr: 14,
                                            bgcolor: "transparent",
                                            "&:hover": {
                                              bgcolor: "rgba(0,0,0,0.02)",
                                            },
                                          }}
                                          secondaryAction={
                                            <Box
                                              sx={{
                                                display: "flex",
                                                gap: 0.5,
                                              }}
                                            >
                                              {isEditable && (
                                                <>
                                                  <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                      handleEditLecture(
                                                        phanId,
                                                        itemId,
                                                      )
                                                    }
                                                  >
                                                    <EditOutlined
                                                      fontSize="small"
                                                      sx={{
                                                        color: "#9AA2B1",
                                                      }}
                                                    />
                                                  </IconButton>
                                                  <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                      xoaBaiGiang(
                                                        phanId,
                                                        itemId,
                                                      )
                                                    }
                                                  >
                                                    <DeleteOutlined
                                                      fontSize="small"
                                                      sx={{
                                                        color: "#9AA2B1",
                                                      }}
                                                    />
                                                  </IconButton>
                                                </>
                                              )}
                                              <IconButton
                                                size="small"
                                                onClick={() =>
                                                  toggleLecture(itemId)
                                                }
                                              >
                                                {isExpanded ? (
                                                  <ExpandLess fontSize="small" />
                                                ) : (
                                                  <ExpandMore fontSize="small" />
                                                )}
                                              </IconButton>
                                            </Box>
                                          }
                                        >
                                          <ListItemIcon sx={{ minWidth: 28 }}>
                                            {isComplete ? (
                                              <CheckCircle
                                                sx={{
                                                  fontSize: 18,
                                                  color: MAU.chinh,
                                                }}
                                              />
                                            ) : (
                                              <RadioButtonUnchecked
                                                sx={{
                                                  fontSize: 18,
                                                  color: "#C7CCD6",
                                                }}
                                              />
                                            )}
                                          </ListItemIcon>
                                          <ListItemText
                                            sx={{ minWidth: 0 }}
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
                                                  <Box
                                                    component="span"
                                                    sx={{ fontWeight: 800 }}
                                                  >
                                                    {`Bài giảng ${soThuTuMuc}: `}
                                                  </Box>
                                                  {bg.tieuDe || "Chưa đặt tên"}
                                                </Box>
                                                <Chip
                                                  size="small"
                                                  label={
                                                    bg.urlBaiGiang
                                                      ? "Có video"
                                                      : "Chưa có video"
                                                  }
                                                  sx={{
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    bgcolor: bg.urlBaiGiang
                                                      ? `${MAU.chinh}1A`
                                                      : "#F1F2F5",
                                                    color: bg.urlBaiGiang
                                                      ? MAU.chinhDam
                                                      : "#8A93A3",
                                                    flexShrink: 0,
                                                  }}
                                                />
                                              </Box>
                                            }
                                          />
                                        </ListItem>

                                        <Collapse in={isExpanded}>
                                          <Box sx={{ px: 2, pb: 2 }}>
                                            {isEditing ? (
                                              <Box
                                                sx={{
                                                  display: "flex",
                                                  flexDirection: "column",
                                                  gap: 1,
                                                }}
                                              >
                                                <TextField
                                                  variant="standard"
                                                  placeholder="Nhập tiêu đề bài giảng"
                                                  value={editingLecture.title}
                                                  onChange={(e) =>
                                                    setEditingLecture((prev) =>
                                                      prev
                                                        ? {
                                                            ...prev,
                                                            title:
                                                              e.target.value,
                                                          }
                                                        : null,
                                                    )
                                                  }
                                                  autoFocus
                                                  required
                                                />
                                                <FormControlLabel
                                                  control={
                                                    <Checkbox
                                                      checked={
                                                        editingLecture.isFree ||
                                                        false
                                                      }
                                                      onChange={(e) =>
                                                        setEditingLecture(
                                                          (prev) =>
                                                            prev
                                                              ? {
                                                                  ...prev,
                                                                  isFree:
                                                                    e.target
                                                                      .checked,
                                                                }
                                                              : null,
                                                        )
                                                      }
                                                      sx={{
                                                        color: MAU.chinh,
                                                        "&.Mui-checked": {
                                                          color: MAU.chinh,
                                                        },
                                                      }}
                                                    />
                                                  }
                                                  label="Miễn phí"
                                                />
                                                <Box>
                                                  <Button
                                                    component="label"
                                                    variant="outlined"
                                                    startIcon={<AttachFile />}
                                                    sx={{
                                                      textTransform: "none",
                                                      borderColor: MAU.chinh,
                                                      color: MAU.chinh,
                                                      fontWeight: 600,
                                                      "&:hover": {
                                                        bgcolor: `${MAU.chinh}0F`,
                                                      },
                                                    }}
                                                  >
                                                    {editingLecture.file
                                                      ? "Thay đổi video"
                                                      : bg.urlBaiGiang
                                                        ? "Thay video"
                                                        : "Chọn video"}
                                                    <input
                                                      type="file"
                                                      accept="video/*"
                                                      hidden
                                                      onChange={async (e) => {
                                                        const file =
                                                          e.target.files?.[0];
                                                        if (file) {
                                                          const result =
                                                            await validateVideoFile(
                                                              file,
                                                            );
                                                          if (result.valid) {
                                                            setEditingLecture(
                                                              (prev) =>
                                                                prev
                                                                  ? {
                                                                      ...prev,
                                                                      file,
                                                                    }
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
                                                  {editingLecture.file ? (
                                                    <Typography
                                                      variant="body2"
                                                      sx={{
                                                        mt: 0.5,
                                                        color: "#6B7280",
                                                      }}
                                                    >
                                                      Đã chọn:{" "}
                                                      {editingLecture.file.name}
                                                    </Typography>
                                                  ) : bg.urlBaiGiang ? (
                                                    <Typography
                                                      variant="body2"
                                                      sx={{
                                                        mt: 0.5,
                                                        color: "#6B7280",
                                                      }}
                                                    >
                                                      Video hiện tại:{" "}
                                                      {dinhDangThoiLuong(
                                                        bg.thoiLuong ?? 0,
                                                      )}
                                                    </Typography>
                                                  ) : (
                                                    <Typography
                                                      variant="body2"
                                                      sx={{
                                                        mt: 0.5,
                                                        color: "#8A93A3",
                                                      }}
                                                    >
                                                      Chưa có video
                                                    </Typography>
                                                  )}
                                                </Box>
                                                <Box
                                                  sx={{
                                                    display: "flex",
                                                    gap: 1,
                                                    justifyContent: "flex-end",
                                                    mt: 1,
                                                  }}
                                                >
                                                  <Button
                                                    size="small"
                                                    onClick={cancelEditLecture}
                                                    sx={{
                                                      textTransform: "none",
                                                      color: "#8A93A3",
                                                    }}
                                                  >
                                                    Hủy bỏ
                                                  </Button>
                                                  <Button
                                                    size="small"
                                                    variant="contained"
                                                    onClick={saveEditedLecture}
                                                    sx={{
                                                      bgcolor: MAU.chinh,
                                                      textTransform: "none",
                                                      fontWeight: 700,
                                                      "&:hover": {
                                                        bgcolor: MAU.chinhDam,
                                                      },
                                                    }}
                                                  >
                                                    Lưu
                                                  </Button>
                                                </Box>
                                              </Box>
                                            ) : (
                                              <Box
                                                sx={{
                                                  display: "flex",
                                                  flexDirection: "column",
                                                  gap: 0.5,
                                                }}
                                              >
                                                <Typography
                                                  sx={{
                                                    fontWeight: 600,
                                                    fontSize: 13,
                                                    color: "#1F2937",
                                                  }}
                                                >
                                                  Video:
                                                </Typography>
                                                {bg.urlBaiGiang ? (
                                                  <Box
                                                    sx={{
                                                      display: "flex",
                                                      alignItems: "center",
                                                      gap: 2,
                                                      flexWrap: "wrap",
                                                    }}
                                                  >
                                                    <Box
                                                      sx={{
                                                        width: 88,
                                                        height: 56,
                                                        borderRadius: "8px",
                                                        bgcolor: `${MAU.chinh}0F`,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                          "center",
                                                        cursor: "pointer",
                                                      }}
                                                      onClick={() => {
                                                        if (bg.urlBaiGiang) {
                                                          setVideoPopup({
                                                            open: true,
                                                            url: bg.urlBaiGiang,
                                                          });
                                                        }
                                                      }}
                                                    >
                                                      <PlayCircleOutlined
                                                        sx={{
                                                          color: MAU.chinh,
                                                        }}
                                                      />
                                                    </Box>
                                                    <Typography
                                                      sx={{
                                                        fontSize: 13.5,
                                                        fontWeight: 600,
                                                      }}
                                                    >
                                                      {dinhDangThoiLuong(
                                                        bg.thoiLuong ?? 0,
                                                      )}
                                                    </Typography>
                                                    {isEditable && (
                                                      <>
                                                        <Button
                                                          component="label"
                                                          size="small"
                                                          startIcon={
                                                            <EditOutlined fontSize="small" />
                                                          }
                                                          sx={{
                                                            textTransform:
                                                              "none",
                                                            color: MAU.chinh,
                                                            fontWeight: 600,
                                                          }}
                                                        >
                                                          Thay video
                                                          <input
                                                            type="file"
                                                            accept="video/*"
                                                            hidden
                                                            onChange={async (
                                                              e,
                                                            ) => {
                                                              const file =
                                                                e.target
                                                                  .files?.[0];
                                                              if (file) {
                                                                await handleVideoFileSelect(
                                                                  itemId,
                                                                  file,
                                                                );
                                                                e.target.value =
                                                                  "";
                                                              }
                                                            }}
                                                          />
                                                        </Button>
                                                        <Box
                                                          sx={{
                                                            display: "flex",
                                                            alignItems:
                                                              "center",
                                                            gap: 1,
                                                          }}
                                                        >
                                                          <Typography
                                                            sx={{
                                                              fontSize: 12.5,
                                                              color: "#8A93A3",
                                                            }}
                                                          >
                                                            Miễn phí xem thử:
                                                          </Typography>
                                                          <Switch
                                                            size="small"
                                                            checked={
                                                              !!bg.laBaiGiangFree
                                                            }
                                                            onChange={(e) => {
                                                              const phan =
                                                                phans.find(
                                                                  (p) =>
                                                                    p.id ===
                                                                    phanId,
                                                                );
                                                              if (phan) {
                                                                const updatedBg =
                                                                  phan.DanhSachBaiGiang?.map(
                                                                    (b) =>
                                                                      b.id ===
                                                                      itemId
                                                                        ? {
                                                                            ...b,
                                                                            laBaiGiangFree:
                                                                              e
                                                                                .target
                                                                                .checked,
                                                                          }
                                                                        : b,
                                                                  );
                                                                const updatedPhans =
                                                                  phans.map(
                                                                    (p) =>
                                                                      p.id ===
                                                                      phanId
                                                                        ? {
                                                                            ...p,
                                                                            DanhSachBaiGiang:
                                                                              updatedBg,
                                                                          }
                                                                        : p,
                                                                  );
                                                                setPhans(
                                                                  updatedPhans,
                                                                );
                                                              }
                                                              saveBaiGiang(
                                                                phanId,
                                                                itemId,
                                                              );
                                                            }}
                                                          />
                                                        </Box>
                                                      </>
                                                    )}
                                                  </Box>
                                                ) : (
                                                  <Box
                                                    component="label"
                                                    sx={{
                                                      display: "flex",
                                                      flexDirection: "column",
                                                      alignItems: "center",
                                                      justifyContent: "center",
                                                      gap: 1,
                                                      py: 2,
                                                      border:
                                                        "1px dashed #E3E6EB",
                                                      borderRadius: "10px",
                                                      cursor: isEditable
                                                        ? "pointer"
                                                        : "default",
                                                      "&:hover": {
                                                        borderColor: isEditable
                                                          ? MAU.chinh
                                                          : "#E3E6EB",
                                                        bgcolor: isEditable
                                                          ? `${MAU.chinh}0F`
                                                          : "transparent",
                                                      },
                                                    }}
                                                  >
                                                    {hasNewVideo ? (
                                                      <>
                                                        <Typography
                                                          sx={{
                                                            fontSize: 13,
                                                            fontWeight: 600,
                                                            color: MAU.chinh,
                                                          }}
                                                        >
                                                          Đã chọn:{" "}
                                                          {
                                                            tempVideoFiles[
                                                              itemId
                                                            ]?.name
                                                          }
                                                        </Typography>
                                                        {isEditable && (
                                                          <Button
                                                            size="small"
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setTempVideoFiles(
                                                                (prev) => {
                                                                  const newState =
                                                                    {
                                                                      ...prev,
                                                                    };
                                                                  delete newState[
                                                                    itemId
                                                                  ];
                                                                  return newState;
                                                                },
                                                              );
                                                              setToast({
                                                                open: true,
                                                                message:
                                                                  "Đã hủy chọn video",
                                                                severity:
                                                                  "info",
                                                              });
                                                            }}
                                                            sx={{
                                                              textTransform:
                                                                "none",
                                                              color:
                                                                "error.main",
                                                              fontWeight: 600,
                                                            }}
                                                          >
                                                            Hủy bỏ
                                                          </Button>
                                                        )}
                                                      </>
                                                    ) : (
                                                      <>
                                                        <PlayCircleOutlined
                                                          sx={{
                                                            color: MAU.chinh,
                                                            opacity: 0.6,
                                                          }}
                                                        />
                                                        <Typography
                                                          sx={{
                                                            fontSize: 13,
                                                            fontWeight: 600,
                                                          }}
                                                        >
                                                          {isEditable
                                                            ? "Tải lên video"
                                                            : "Chưa có video"}
                                                        </Typography>
                                                      </>
                                                    )}
                                                    {isEditable && (
                                                      <input
                                                        type="file"
                                                        accept="video/*"
                                                        hidden
                                                        onChange={async (e) => {
                                                          const file =
                                                            e.target.files?.[0];
                                                          if (file) {
                                                            await handleVideoFileSelect(
                                                              itemId,
                                                              file,
                                                            );
                                                            e.target.value = "";
                                                          }
                                                        }}
                                                      />
                                                    )}
                                                  </Box>
                                                )}

                                                <Box sx={{ mt: 1 }}>
                                                  <Typography
                                                    sx={{
                                                      fontWeight: 600,
                                                      fontSize: 13,
                                                      color: "#8A93A3",
                                                      mb: 0.5,
                                                    }}
                                                  >
                                                    Tài nguyên
                                                  </Typography>
                                                  <List dense disablePadding>
                                                    {(
                                                      bg.danhSachTaiLieu ?? []
                                                    ).map((tl: TaiLieuType) => (
                                                      <ListItem
                                                        key={tl.id}
                                                        secondaryAction={
                                                          isEditable && (
                                                            <IconButton
                                                              edge="end"
                                                              size="small"
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                xoaTaiLieu(
                                                                  phanId,
                                                                  itemId,
                                                                  tl.id as string,
                                                                );
                                                              }}
                                                            >
                                                              <DeleteOutlined fontSize="small" />
                                                            </IconButton>
                                                          )
                                                        }
                                                        sx={{
                                                          cursor: "pointer",
                                                          py: 0,
                                                        }}
                                                        onClick={() => {
                                                          const docUrl =
                                                            (tl as any).url ||
                                                            (tl as any)
                                                              .duongDan ||
                                                            "";
                                                          if (docUrl) {
                                                            setDocPopup({
                                                              open: true,
                                                              url: docUrl,
                                                              name:
                                                                tl.tenTaiLieu ||
                                                                "Tài liệu",
                                                            });
                                                          } else {
                                                            setToast({
                                                              open: true,
                                                              message:
                                                                "Không có URL tài liệu",
                                                              severity: "error",
                                                            });
                                                          }
                                                        }}
                                                      >
                                                        <ListItemIcon>
                                                          <AttachFile fontSize="small" />
                                                        </ListItemIcon>
                                                        <ListItemText
                                                          primary={
                                                            tl.tenTaiLieu
                                                          }
                                                          secondary={
                                                            tl.loaiTaiLieu
                                                          }
                                                        />
                                                      </ListItem>
                                                    ))}
                                                  </List>
                                                  {isEditable && (
                                                    <>
                                                      {addResourceForm[itemId]
                                                        ?.open ? (
                                                        <Box
                                                          sx={{
                                                            display: "flex",
                                                            flexDirection:
                                                              "column",
                                                            gap: 1,
                                                            mt: 1,
                                                            p: 1.5,
                                                            bgcolor: "#F5F6F8",
                                                            borderRadius: "8px",
                                                          }}
                                                        >
                                                          <TextField
                                                            variant="standard"
                                                            placeholder="Nhập tên tài liệu"
                                                            value={
                                                              addResourceForm[
                                                                itemId
                                                              ]?.tenTaiLieu ||
                                                              ""
                                                            }
                                                            onChange={(e) =>
                                                              setAddResourceForm(
                                                                (prev) => ({
                                                                  ...prev,
                                                                  [itemId]: {
                                                                    ...prev[
                                                                      itemId
                                                                    ],
                                                                    tenTaiLieu:
                                                                      e.target
                                                                        .value,
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
                                                              alignItems:
                                                                "center",
                                                            }}
                                                          >
                                                            <Button
                                                              component="label"
                                                              variant="outlined"
                                                              startIcon={
                                                                <AttachFile />
                                                              }
                                                              sx={{
                                                                textTransform:
                                                                  "none",
                                                                borderColor:
                                                                  MAU.chinh,
                                                                color:
                                                                  MAU.chinh,
                                                                fontWeight: 600,
                                                              }}
                                                            >
                                                              {addResourceForm[
                                                                itemId
                                                              ]?.file
                                                                ? "Thay đổi file"
                                                                : "Chọn file"}
                                                              <input
                                                                type="file"
                                                                hidden
                                                                onChange={(
                                                                  e,
                                                                ) => {
                                                                  const file =
                                                                    e.target
                                                                      .files?.[0];
                                                                  if (file) {
                                                                    setAddResourceForm(
                                                                      (
                                                                        prev,
                                                                      ) => ({
                                                                        ...prev,
                                                                        [itemId]:
                                                                          {
                                                                            ...prev[
                                                                              itemId
                                                                            ],
                                                                            file,
                                                                          },
                                                                      }),
                                                                    );
                                                                  }
                                                                }}
                                                              />
                                                            </Button>
                                                            {addResourceForm[
                                                              itemId
                                                            ]?.file && (
                                                              <Typography
                                                                variant="body2"
                                                                sx={{
                                                                  color:
                                                                    "#6B7280",
                                                                }}
                                                              >
                                                                {
                                                                  addResourceForm[
                                                                    itemId
                                                                  ]?.file?.name
                                                                }
                                                              </Typography>
                                                            )}
                                                          </Box>
                                                          <Box
                                                            sx={{
                                                              display: "flex",
                                                              gap: 1,
                                                              justifyContent:
                                                                "flex-end",
                                                            }}
                                                          >
                                                            <Button
                                                              size="small"
                                                              onClick={() =>
                                                                setAddResourceForm(
                                                                  (prev) => ({
                                                                    ...prev,
                                                                    [itemId]: {
                                                                      tenTaiLieu:
                                                                        "",
                                                                      file: null,
                                                                      open: false,
                                                                    },
                                                                  }),
                                                                )
                                                              }
                                                              sx={{
                                                                textTransform:
                                                                  "none",
                                                                color:
                                                                  "#8A93A3",
                                                              }}
                                                            >
                                                              Hủy bỏ
                                                            </Button>
                                                            <Button
                                                              size="small"
                                                              variant="contained"
                                                              onClick={() => {
                                                                const form =
                                                                  addResourceForm[
                                                                    itemId
                                                                  ];
                                                                if (
                                                                  !form?.tenTaiLieu ||
                                                                  !form.tenTaiLieu.trim()
                                                                ) {
                                                                  setToast({
                                                                    open: true,
                                                                    message:
                                                                      "Vui lòng nhập tên tài liệu",
                                                                    severity:
                                                                      "error",
                                                                  });
                                                                  return;
                                                                }
                                                                if (
                                                                  form?.file
                                                                ) {
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
                                                                    severity:
                                                                      "error",
                                                                  });
                                                                }
                                                              }}
                                                              sx={{
                                                                bgcolor:
                                                                  MAU.chinh,
                                                                textTransform:
                                                                  "none",
                                                                fontWeight: 700,
                                                                "&:hover": {
                                                                  bgcolor:
                                                                    MAU.chinhDam,
                                                                },
                                                              }}
                                                            >
                                                              Thêm
                                                            </Button>
                                                          </Box>
                                                        </Box>
                                                      ) : (
                                                        <Button
                                                          size="small"
                                                          startIcon={<Add />}
                                                          onClick={() =>
                                                            setAddResourceForm(
                                                              (prev) => ({
                                                                ...prev,
                                                                [itemId]: {
                                                                  tenTaiLieu:
                                                                    "",
                                                                  file: null,
                                                                  open: true,
                                                                },
                                                              }),
                                                            )
                                                          }
                                                          sx={{
                                                            textTransform:
                                                              "none",
                                                            color: MAU.chinh,
                                                            fontWeight: 600,
                                                          }}
                                                        >
                                                          Thêm tài liệu
                                                        </Button>
                                                      )}
                                                    </>
                                                  )}
                                                </Box>
                                              </Box>
                                            )}
                                          </Box>
                                        </Collapse>
                                      </Paper>
                                    </SortableItem>
                                  );
                                } else {
                                  // Bài kiểm tra
                                  const kt = item.data as BaiKiemTraDto;
                                  const isEditingQuiz =
                                    editingQuiz?.quizId === itemId;
                                  const isQuizExpanded =
                                    !!expandedQuizzes[itemId];
                                  const tenHienThi =
                                    kt.tenBaiKiemTra ||
                                    `Bài kiểm tra ${kt.soCauHoi || 0} câu hỏi`;

                                  if (isEditingQuiz) {
                                    return (
                                      <SortableItem key={itemId} id={itemId}>
                                        <Box sx={{ mb: 1 }}>
                                          <Paper
                                            sx={{
                                              border: "1px solid #EDEFF3",
                                              borderRadius: "8px",
                                              overflow: "hidden",
                                              bgcolor: "#fff",
                                            }}
                                          >
                                            <Box sx={{ p: 2 }}>
                                              <QuizForm
                                                isEditing={true}
                                                readOnly={false}
                                                data={editingQuiz}
                                                onDataChange={(field, value) =>
                                                  setEditingQuiz((prev) => ({
                                                    ...prev!,
                                                    [field]: value,
                                                  }))
                                                }
                                                onAddQuestion={() => {
                                                  if (!editingQuiz) return;
                                                  const newQ = {
                                                    id: uuidv4(),
                                                    noiDungCauHoi: "",
                                                    loaiCauHoi: "ONE" as const,
                                                    diem: 1,
                                                    doKho: "TrungBinh" as const,
                                                    danhSachDapAn: [
                                                      {
                                                        id: uuidv4(),
                                                        noiDungDapAn: "",
                                                        laDapAnDung: false,
                                                        thuTuSapXep: 0,
                                                      },
                                                      {
                                                        id: uuidv4(),
                                                        noiDungDapAn: "",
                                                        laDapAnDung: false,
                                                        thuTuSapXep: 1,
                                                      },
                                                    ],
                                                  };
                                                  setEditingQuiz((prev) => ({
                                                    ...prev!,
                                                    cauHois: [
                                                      ...(prev!.cauHois || []),
                                                      newQ,
                                                    ],
                                                  }));
                                                  setExpandedQuestions(
                                                    (prev) => ({
                                                      ...prev,
                                                      [newQ.id]: true,
                                                    }),
                                                  );
                                                }}
                                                onRemoveQuestion={(qId) => {
                                                  if (!editingQuiz) return;
                                                  setEditingQuiz((prev) => ({
                                                    ...prev!,
                                                    cauHois:
                                                      prev!.cauHois.filter(
                                                        (q) => q.id !== qId,
                                                      ),
                                                  }));
                                                  setExpandedQuestions(
                                                    (prev) => {
                                                      const newState = {
                                                        ...prev,
                                                      };
                                                      delete newState[qId];
                                                      return newState;
                                                    },
                                                  );
                                                }}
                                                onUpdateQuestion={(
                                                  qId,
                                                  field,
                                                  value,
                                                ) => {
                                                  if (!editingQuiz) return;
                                                  setEditingQuiz((prev) => ({
                                                    ...prev!,
                                                    cauHois: prev!.cauHois.map(
                                                      (q) =>
                                                        q.id === qId
                                                          ? {
                                                              ...q,
                                                              [field]: value,
                                                            }
                                                          : q,
                                                    ),
                                                  }));
                                                }}
                                                onAddDapAn={(qId) => {
                                                  if (!editingQuiz) return;
                                                  setEditingQuiz((prev) => ({
                                                    ...prev!,
                                                    cauHois: prev!.cauHois.map(
                                                      (q) => {
                                                        if (q.id !== qId)
                                                          return q;
                                                        const newDapAn = {
                                                          id: uuidv4(),
                                                          noiDungDapAn: "",
                                                          laDapAnDung: false,
                                                          thuTuSapXep:
                                                            q.danhSachDapAn
                                                              .length,
                                                        };
                                                        return {
                                                          ...q,
                                                          danhSachDapAn: [
                                                            ...q.danhSachDapAn,
                                                            newDapAn,
                                                          ],
                                                        };
                                                      },
                                                    ),
                                                  }));
                                                }}
                                                onRemoveDapAn={(qId, dId) => {
                                                  if (!editingQuiz) return;
                                                  setEditingQuiz((prev) => ({
                                                    ...prev!,
                                                    cauHois: prev!.cauHois.map(
                                                      (q) => {
                                                        if (q.id !== qId)
                                                          return q;
                                                        if (
                                                          q.danhSachDapAn
                                                            .length <= 2
                                                        ) {
                                                          setToast({
                                                            open: true,
                                                            message:
                                                              "Cần ít nhất 2 đáp án",
                                                            severity: "error",
                                                          });
                                                          return q;
                                                        }
                                                        return {
                                                          ...q,
                                                          danhSachDapAn:
                                                            q.danhSachDapAn.filter(
                                                              (d) =>
                                                                d.id !== dId,
                                                            ),
                                                        };
                                                      },
                                                    ),
                                                  }));
                                                }}
                                                onUpdateDapAn={(
                                                  qId,
                                                  dId,
                                                  field,
                                                  value,
                                                ) => {
                                                  if (!editingQuiz) return;
                                                  setEditingQuiz((prev) => ({
                                                    ...prev!,
                                                    cauHois: prev!.cauHois.map(
                                                      (q) => {
                                                        if (q.id !== qId)
                                                          return q;
                                                        return {
                                                          ...q,
                                                          danhSachDapAn:
                                                            q.danhSachDapAn.map(
                                                              (d) =>
                                                                d.id === dId
                                                                  ? {
                                                                      ...d,
                                                                      [field]:
                                                                        value,
                                                                    }
                                                                  : d,
                                                            ),
                                                        };
                                                      },
                                                    ),
                                                  }));
                                                }}
                                                onToggleDapAnDung={(
                                                  qId,
                                                  dId,
                                                  checked,
                                                ) => {
                                                  if (!editingQuiz) return;
                                                  setEditingQuiz((prev) => ({
                                                    ...prev!,
                                                    cauHois: prev!.cauHois.map(
                                                      (q) => {
                                                        if (q.id !== qId)
                                                          return q;
                                                        let newDapAn =
                                                          q.danhSachDapAn.map(
                                                            (d) =>
                                                              d.id === dId
                                                                ? {
                                                                    ...d,
                                                                    laDapAnDung:
                                                                      checked,
                                                                  }
                                                                : d,
                                                          );
                                                        if (
                                                          q.loaiCauHoi ===
                                                            "ONE" &&
                                                          checked
                                                        ) {
                                                          newDapAn =
                                                            newDapAn.map((d) =>
                                                              d.id === dId
                                                                ? {
                                                                    ...d,
                                                                    laDapAnDung: true,
                                                                  }
                                                                : {
                                                                    ...d,
                                                                    laDapAnDung: false,
                                                                  },
                                                            );
                                                        }
                                                        return {
                                                          ...q,
                                                          danhSachDapAn:
                                                            newDapAn,
                                                        };
                                                      },
                                                    ),
                                                  }));
                                                }}
                                                onCancel={cancelEditQuiz}
                                                onSubmit={saveEditQuiz}
                                                loading={loading}
                                                submitLabel="Cập nhật"
                                                expandedQuestions={
                                                  expandedQuestions
                                                }
                                                toggleQuestionExpand={
                                                  toggleQuestionExpand
                                                }
                                                onReorderQuestions={(
                                                  newQuestions,
                                                ) =>
                                                  handleReorderQuestions(
                                                    phanId,
                                                    itemId,
                                                    newQuestions,
                                                  )
                                                }
                                              />
                                            </Box>
                                          </Paper>
                                        </Box>
                                      </SortableItem>
                                    );
                                  }

                                  return (
                                    <SortableItem key={itemId} id={itemId}>
                                      <Paper
                                        sx={{
                                          mb: 1,
                                          border: "1px solid #EDEFF3",
                                          borderRadius: "8px",
                                          overflow: "hidden",
                                          bgcolor: "#fff",
                                          transition: "all 0.2s ease",
                                          "&:hover": {
                                            borderColor: "#D1D5DB",
                                          },
                                        }}
                                      >
                                        <ListItem
                                          sx={{
                                            px: 1.5,
                                            py: 0.75,
                                            pr: 14,
                                            bgcolor: "transparent",
                                            "&:hover": {
                                              bgcolor: "rgba(0,0,0,0.02)",
                                            },
                                          }}
                                          secondaryAction={
                                            <Box
                                              sx={{
                                                display: "flex",
                                                gap: 0.5,
                                              }}
                                            >
                                              {isEditable && (
                                                <>
                                                  <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                      handleEditQuiz(
                                                        phanId,
                                                        itemId,
                                                      )
                                                    }
                                                  >
                                                    <EditOutlined
                                                      fontSize="small"
                                                      sx={{
                                                        color: "#9AA2B1",
                                                      }}
                                                    />
                                                  </IconButton>
                                                  <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                      xoaBaiKiemTra(
                                                        phanId,
                                                        itemId,
                                                      )
                                                    }
                                                  >
                                                    <DeleteOutlined
                                                      fontSize="small"
                                                      sx={{
                                                        color: "#9AA2B1",
                                                      }}
                                                    />
                                                  </IconButton>
                                                </>
                                              )}
                                              <IconButton
                                                size="small"
                                                onClick={() =>
                                                  toggleQuizItem(itemId)
                                                }
                                              >
                                                {isQuizExpanded ? (
                                                  <ExpandLess fontSize="small" />
                                                ) : (
                                                  <ExpandMore fontSize="small" />
                                                )}
                                              </IconButton>
                                            </Box>
                                          }
                                        >
                                          <ListItemIcon sx={{ minWidth: 28 }}>
                                            {isComplete ? (
                                              <CheckCircle
                                                sx={{
                                                  fontSize: 18,
                                                  color: MAU.chinh,
                                                }}
                                              />
                                            ) : (
                                              <RadioButtonUnchecked
                                                sx={{
                                                  fontSize: 18,
                                                  color: "#C7CCD6",
                                                }}
                                              />
                                            )}
                                          </ListItemIcon>
                                          <ListItemText
                                            sx={{ minWidth: 0 }}
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
                                                  <Box
                                                    component="span"
                                                    sx={{ fontWeight: 800 }}
                                                  >
                                                    {`Bài kiểm tra ${soThuTuMuc}: `}
                                                  </Box>
                                                  {tenHienThi}
                                                </Box>
                                                <Chip
                                                  size="small"
                                                  label={`${kt.soCauHoi ?? 0} câu hỏi`}
                                                  sx={{
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    bgcolor: isComplete
                                                      ? `${MAU.chinh}1A`
                                                      : "#F1F2F5",
                                                    color: isComplete
                                                      ? MAU.chinhDam
                                                      : "#8A93A3",
                                                    flexShrink: 0,
                                                  }}
                                                />
                                              </Box>
                                            }
                                          />
                                        </ListItem>

                                        <Collapse in={isQuizExpanded}>
                                          <Box sx={{ px: 2, pb: 2 }}>
                                            <QuizForm
                                              isEditing={false}
                                              readOnly={true}
                                              data={{
                                                tenBaiKiemTra: tenHienThi,
                                                moTa: kt.moTa || "",
                                                cauHois: kt.cauHois || [],
                                              }}
                                              onDataChange={() => {}}
                                              onAddQuestion={() => {}}
                                              onRemoveQuestion={() => {}}
                                              onUpdateQuestion={() => {}}
                                              onAddDapAn={() => {}}
                                              onRemoveDapAn={() => {}}
                                              onUpdateDapAn={() => {}}
                                              onToggleDapAnDung={() => {}}
                                              onCancel={() => {}}
                                              onSubmit={() => {}}
                                              loading={false}
                                              submitLabel=""
                                              expandedQuestions={
                                                expandedQuestions
                                              }
                                              toggleQuestionExpand={
                                                toggleQuestionExpand
                                              }
                                            />
                                          </Box>
                                        </Collapse>
                                      </Paper>
                                    </SortableItem>
                                  );
                                }
                              })}
                            </Box>
                          </SortableContext>
                        </DndContext>

                        {/* FORM THÊM MỚI BÀI GIẢNG / BÀI KIỂM TRA */}
                        {addForm?.phanId === phanId && isEditable && (
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 1.5,
                              bgcolor: "#fff",
                              border: `1px dashed ${MAU.chinh}`,
                              borderRadius: "10px",
                              py: 2,
                              px: 2,
                              mt: 1,
                            }}
                          >
                            {addForm.type === "BaiGiang" && (
                              <>
                                <TextField
                                  variant="standard"
                                  placeholder="Nhập tiêu đề bài giảng"
                                  value={addForm.title || ""}
                                  onChange={(e) =>
                                    setAddForm((prev) => ({
                                      ...prev!,
                                      title: e.target.value,
                                    }))
                                  }
                                  sx={{
                                    flex: 1,
                                    "& .MuiInput-underline:before": {
                                      display: "none",
                                    },
                                  }}
                                  autoFocus
                                  required
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={addForm.isFree || false}
                                      onChange={(e) =>
                                        setAddForm((prev) => ({
                                          ...prev!,
                                          isFree: e.target.checked,
                                        }))
                                      }
                                      sx={{
                                        color: MAU.chinh,
                                        "&.Mui-checked": { color: MAU.chinh },
                                      }}
                                    />
                                  }
                                  label="Miễn phí"
                                  sx={{ color: "#1F2937", fontWeight: 500 }}
                                />
                                <Box>
                                  <Button
                                    component="label"
                                    variant="outlined"
                                    startIcon={<AttachFile />}
                                    sx={{
                                      textTransform: "none",
                                      borderColor: MAU.chinh,
                                      color: MAU.chinh,
                                      fontWeight: 600,
                                      "&:hover": {
                                        bgcolor: `${MAU.chinh}0F`,
                                      },
                                    }}
                                  >
                                    {addForm.file
                                      ? "Thay đổi video"
                                      : "Chọn video"}
                                    <input
                                      type="file"
                                      accept="video/*"
                                      hidden
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const result =
                                            await validateVideoFile(file);
                                          if (result.valid) {
                                            setAddForm((prev) => ({
                                              ...prev!,
                                              file,
                                            }));
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
                                  {addForm.file && (
                                    <Typography
                                      variant="body2"
                                      sx={{ mt: 0.5, color: "#6B7280" }}
                                    >
                                      Đã chọn: {addForm.file.name}
                                    </Typography>
                                  )}
                                  <Box sx={{ mt: 1 }}>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        color: "#8A93A3",
                                        fontSize: 12,
                                      }}
                                    >
                                      <InfoOutlined sx={{ fontSize: 16 }} />
                                      Lưu ý: Dung lượng ≤ 100MB, độ phân giải ≥
                                      854x480.
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 1,
                                    justifyContent: "flex-end",
                                    mt: 1,
                                  }}
                                >
                                  <Button
                                    size="small"
                                    onClick={() => setAddForm(null)}
                                    sx={{
                                      textTransform: "none",
                                      color: "#8A93A3",
                                    }}
                                  >
                                    Hủy bỏ
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => {
                                      if (addForm.type === "BaiGiang") {
                                        const { title, file, isFree, phanId } =
                                          addForm;

                                        if (!title || !title.trim()) {
                                          setToast({
                                            open: true,
                                            message:
                                              "Vui lòng nhập tiêu đề bài giảng",
                                            severity: "error",
                                          });
                                          return;
                                        }

                                        setLoading(true);
                                        createBaiGiang(phanId, {
                                          tieuDe: title.trim(),
                                          file,
                                          isFree: isFree || false,
                                        })
                                          .then(() => {
                                            setToast({
                                              open: true,
                                              message: "Đã thêm bài giảng",
                                              severity: "success",
                                            });
                                            setAddForm(null);
                                          })
                                          .catch((err) => {
                                            setToast({
                                              open: true,
                                              message:
                                                err.message ||
                                                "Lỗi tạo bài giảng",
                                              severity: "error",
                                            });
                                          })
                                          .finally(() => setLoading(false));
                                      }
                                    }}
                                    sx={{
                                      bgcolor: MAU.chinh,
                                      textTransform: "none",
                                      fontWeight: 700,
                                      "&:hover": { bgcolor: MAU.chinhDam },
                                    }}
                                  >
                                    Thêm bài giảng
                                  </Button>
                                </Box>
                              </>
                            )}

                            {addForm.type === "BaiKiemTra" && (
                              <QuizForm
                                isEditing={false}
                                readOnly={false}
                                data={addForm}
                                onDataChange={handleQuizGeneralChange}
                                onAddQuestion={handleAddQuestion}
                                onRemoveQuestion={handleRemoveQuestion}
                                onUpdateQuestion={handleUpdateQuestion}
                                onAddDapAn={handleAddDapAn}
                                onRemoveDapAn={handleRemoveDapAn}
                                onUpdateDapAn={handleUpdateDapAn}
                                onToggleDapAnDung={handleToggleDapAnDung}
                                onCancel={() => {
                                  setAddForm(null);
                                  setExpandedQuestions({});
                                }}
                                onSubmit={handleCreateQuiz}
                                loading={loading}
                                submitLabel="Tạo bài kiểm tra"
                                expandedQuestions={expandedQuestions}
                                toggleQuestionExpand={toggleQuestionExpand}
                              />
                            )}
                          </Box>
                        )}

                        {isEditable && (
                          <Button
                            startIcon={<Add />}
                            onClick={(e) => {
                              const rect =
                                e.currentTarget.getBoundingClientRect();
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
                              bgcolor: "#fff",
                              "&:hover": { bgcolor: `${MAU.chinh}0F` },
                            }}
                          >
                            Mục trong chương trình giảng dạy
                          </Button>
                        )}
                      </Box>

                      {/* Form chỉnh sửa phần */}
                      {isEditingPhan && isEditable && (
                        <Box
                          sx={{
                            mt: 2,
                            p: 3,
                            border: "1px solid #E5E7EB",
                            borderRadius: "16px",
                            bgcolor: "#ffffff",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                          }}
                        >
                          <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#111827", mb: 2 }}>
                            Chỉnh sửa phần
                          </Typography>
                          
                          <Box sx={{ mb: 2.5 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: 13.5, color: "#374151", mb: 1 }}>
                              Tiêu đề phần <Box component="span" sx={{ color: "#DC2626" }}>*</Box>
                            </Typography>
                            <TextField
                              placeholder="Nhập tiêu đề..."
                              value={phanForm.tenPhan}
                              onChange={(e) =>
                                setPhanForm({
                                  ...phanForm,
                                  tenPhan: e.target.value,
                                })
                              }
                              fullWidth
                              variant="outlined"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "10px",
                                  height: "46px",
                                  fontSize: 14,
                                  "& fieldset": { borderColor: "#D1D5DB" },
                                  "&:hover fieldset": { borderColor: "#7A1F2B" },
                                  "&.Mui-focused fieldset": { borderColor: "#7A1F2B", borderWidth: 2 },
                                },
                              }}
                            />
                          </Box>

                          <Box sx={{ mb: 3 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: 13.5, color: "#374151", mb: 1 }}>
                              Mục tiêu học được sau phần này <Box component="span" sx={{ color: "#DC2626" }}>*</Box>
                            </Typography>
                            <TextField
                              placeholder="Sau khi hoàn thành phần này, sinh viên sẽ có thể làm được những gì?"
                              value={phanForm.mieuTa}
                              onChange={(e) =>
                                setPhanForm({
                                  ...phanForm,
                                  mieuTa: e.target.value,
                                })
                              }
                              fullWidth
                              multiline
                              rows={3}
                              variant="outlined"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "10px",
                                  fontSize: 14,
                                  p: 1.5,
                                  "& fieldset": { borderColor: "#D1D5DB" },
                                  "&:hover fieldset": { borderColor: "#7A1F2B" },
                                  "&.Mui-focused fieldset": { borderColor: "#7A1F2B", borderWidth: 2 },
                                },
                              }}
                            />
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              gap: 1.5,
                              justifyContent: "flex-end",
                            }}
                          >
                            <Button
                              onClick={() => setPhanForm(null)}
                              sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                color: "#4B5563",
                                py: 1,
                                px: 2.5,
                                borderRadius: "8px",
                                "&:hover": { bgcolor: "#F3F4F6", color: "#111827" },
                              }}
                            >
                              Hủy bỏ
                            </Button>
                            <Button
                              variant="contained"
                              onClick={submitPhanForm}
                              disabled={loading}
                              sx={{
                                bgcolor: MAU.chinh,
                                textTransform: "none",
                                fontWeight: 700,
                                py: 1,
                                px: 3,
                                borderRadius: "8px",
                                boxShadow: "0 2px 8px rgba(122,31,43,0.15)",
                                "&:hover": {
                                  bgcolor: MAU.chinhDam,
                                  boxShadow: "0 4px 12px rgba(122,31,43,0.25)",
                                },
                                "&.Mui-disabled": {
                                  bgcolor: "#E5E7EB",
                                  color: "#9CA3AF",
                                  boxShadow: "none",
                                },
                              }}
                            >
                              Cập nhật
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </SortableItem>
                );
              })}
            </Box>
          </SortableContext>
        </DndContext>

        {/* Nút thêm phần mới */}
        {phanForm?.mode === "add" && isEditable ? (
          <Box
            sx={{
              mt: 3,
              p: 3,
              border: "1px solid #E5E7EB",
              borderRadius: "16px",
              bgcolor: "#ffffff",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#111827", mb: 2 }}>
              Thêm phần mới
            </Typography>

            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 13.5, color: "#374151", mb: 1 }}>
                Tiêu đề phần <Box component="span" sx={{ color: "#DC2626" }}>*</Box>
              </Typography>
              <TextField
                placeholder="Nhập tiêu đề..."
                value={phanForm.tenPhan}
                onChange={(e) =>
                  setPhanForm({ ...phanForm, tenPhan: e.target.value })
                }
                fullWidth
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    height: "46px",
                    fontSize: 14,
                    "& fieldset": { borderColor: "#D1D5DB" },
                    "&:hover fieldset": { borderColor: "#7A1F2B" },
                    "&.Mui-focused fieldset": { borderColor: "#7A1F2B", borderWidth: 2 },
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 13.5, color: "#374151", mb: 1 }}>
                Mục tiêu học được sau phần này <Box component="span" sx={{ color: "#DC2626" }}>*</Box>
              </Typography>
              <TextField
                placeholder="Sau khi hoàn thành phần này, sinh viên sẽ có thể làm được những gì?"
                value={phanForm.mieuTa}
                onChange={(e) =>
                  setPhanForm({ ...phanForm, mieuTa: e.target.value })
                }
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    fontSize: 14,
                    p: 1.5,
                    "& fieldset": { borderColor: "#D1D5DB" },
                    "&:hover fieldset": { borderColor: "#7A1F2B" },
                    "&.Mui-focused fieldset": { borderColor: "#7A1F2B", borderWidth: 2 },
                  },
                }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
              <Button
                onClick={() => setPhanForm(null)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  color: "#4B5563",
                  py: 1,
                  px: 2.5,
                  borderRadius: "8px",
                  "&:hover": { bgcolor: "#F3F4F6", color: "#111827" },
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="contained"
                onClick={submitPhanForm}
                disabled={loading}
                sx={{
                  bgcolor: MAU.chinh,
                  textTransform: "none",
                  fontWeight: 700,
                  py: 1,
                  px: 3,
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(122,31,43,0.15)",
                  "&:hover": {
                    bgcolor: MAU.chinhDam,
                    boxShadow: "0 4px 12px rgba(122,31,43,0.25)",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "#E5E7EB",
                    color: "#9CA3AF",
                    boxShadow: "none",
                  },
                }}
              >
                Thêm phần
              </Button>
            </Box>
          </Box>
        ) : (
          <Button
            startIcon={<Add />}
            onClick={moThemPhan}
            disabled={loading || !isEditable}
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
              bgcolor: "#ffffff",
              boxShadow: "0 2px 8px rgba(122,31,43,0.05)",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: MAU.chinhNhat,
                boxShadow: "0 4px 12px rgba(122,31,43,0.12)",
                transform: "translateY(-1px)",
              },
            }}
          >
            Phần
          </Button>
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
                  color: "#6B7280",
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
                        color: "#1F2937",
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
                          color: "#8A93A3",
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
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700, color: MAU.chuDen }}>
            Video bài giảng
            <IconButton
              aria-label="close"
              onClick={() => setVideoPopup({ ...videoPopup, open: false })}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {videoPopup.url ? (
              <video
                controls
                style={{ width: "100%", maxHeight: "70vh" }}
                src={videoPopup.url}
              />
            ) : (
              <Typography>Không có video</Typography>
            )}
          </DialogContent>
        </Dialog>

        {/* Popup tài liệu */}
        <Dialog
          open={docPopup.open}
          onClose={() => setDocPopup({ ...docPopup, open: false })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700, color: MAU.chuDen }}>
            {docPopup.name || "Tài liệu"}
            <IconButton
              aria-label="close"
              onClick={() => setDocPopup({ ...docPopup, open: false })}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {docPopup.url ? (
              <iframe
                src={docPopup.url}
                style={{ width: "100%", height: "60vh", border: "none" }}
                title={docPopup.name}
              />
            ) : (
              <Typography>Không thể xem trước tài liệu</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button
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
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle
            id="delete-dialog-title"
            sx={{ fontWeight: 700, color: MAU.chuDen }}
          >
            Vui lòng xác nhận
          </DialogTitle>
          <DialogContent>
            <DialogContentText
              id="delete-dialog-description"
              sx={{ color: MAU.chuXam }}
            >
              Bạn sắp xóa một mục trong chương trình giảng dạy. Bạn có chắc chắn
              muốn xóa?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() =>
                setDeleteDialog({ open: false, onConfirm: () => {} })
              }
              sx={{
                textTransform: "none",
                fontWeight: 700,
                color: MAU.chuXam,
              }}
            >
              Hủy bỏ
            </Button>
            <Button
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
              Xóa bỏ
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
