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
  UploadFileOutlined,
  Save,
  CheckCircle,
  RadioButtonUnchecked,
  DragIndicator,
  OndemandVideoOutlined,
  Close as CloseIcon,
  InfoOutlined,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { MAU, tinhTongThoiLuongGiay } from "../../components/courseEditCore";
import { PhanHocType } from "@/src/types/PhanHoc/Dto/PhanHocdto";
import { BaiGiangType } from "@/src/types/BaiGiang/Dto/BaiGiangDto";
import { BaiKiemTraDto } from "@/src/types/baiKiemTra/Dto/baiKiemTraDto";
import { TaiLieuType } from "@/src/types/TaiLieu/Dto/TaiLieuDto";
import AuthGuard from "@/src/components/AuthGuard";
import { useCourseEdit } from "../../components/CourseEditContext";
import BaiKiemTraService from "@/src/services/BaiKiemTraService";

function dinhDangThoiLuong(giay: number) {
  const p = Math.floor(giay / 60);
  const g = giay % 60;
  return `${p}:${String(g).padStart(2, "0")}`;
}

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

// ===== COMPONENT FORM BÀI KIỂM TRA =====
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
}) {
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
        <TextField
          label="Tiêu đề bài kiểm tra"
          value={data.tenBaiKiemTra || ""}
          onChange={(e) => onDataChange("tenBaiKiemTra", e.target.value)}
          variant="outlined"
          size="small"
          fullWidth
        />
      )}
      {!readOnly && (
        <TextField
          label="Mô tả bài kiểm tra"
          value={data.moTa || ""}
          onChange={(e) => onDataChange("moTa", e.target.value)}
          variant="outlined"
          size="small"
          fullWidth
          multiline
          rows={2}
        />
      )}

      {data.cauHois?.map((q: any, qIndex: number) => {
        const isExpanded = readOnly ? true : !!expandedQuestions[q.id];
        return (
          <Box key={q.id} sx={{ mb: 1.5 }}>
            <Paper
              sx={{
                bgcolor: "#FAFAFA",
                border: "1px solid #EDEFF3",
                borderRadius: "8px",
                overflow: "hidden",
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
                  "&:hover": { bgcolor: "#F0F1F3" },
                }}
                onClick={() => {
                  if (!readOnly) toggleQuestionExpand(q.id);
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                    Câu hỏi {qIndex + 1}
                  </Typography>
                  <Chip
                    size="small"
                    label={
                      q.loaiCauHoi === "ONE" ? "Trắc nghiệm" : "Lựa chọn nhiều"
                    }
                    sx={{
                      fontSize: 11,
                      bgcolor: MAU.chinh + "1A",
                      color: MAU.chinhDam,
                    }}
                  />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {!readOnly && (
                    <>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveQuestion(q.id);
                        }}
                      >
                        <DeleteOutlined
                          fontSize="small"
                          sx={{ color: "#9AA2B1" }}
                        />
                      </IconButton>
                      <DragIndicator
                        sx={{ fontSize: 18, color: "#C7CCD6", cursor: "grab" }}
                      />
                    </>
                  )}
                  {!readOnly && (
                    <IconButton
                      size="small"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  )}
                </Box>
              </Box>
              <Collapse in={isExpanded}>
                <Box sx={{ p: 2, pt: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    label="Nội dung câu hỏi"
                    value={q.noiDungCauHoi}
                    onChange={(e) =>
                      onUpdateQuestion(q.id, "noiDungCauHoi", e.target.value)
                    }
                    sx={{ mb: 1 }}
                    disabled={readOnly}
                  />
                  <Box
                    sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 1 }}
                  >
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Loại</InputLabel>
                      <Select
                        value={q.loaiCauHoi}
                        label="Loại"
                        onChange={(e) =>
                          onUpdateQuestion(q.id, "loaiCauHoi", e.target.value)
                        }
                        disabled={readOnly}
                      >
                        <MenuItem value="ONE">Trắc nghiệm (1 đáp án)</MenuItem>
                        <MenuItem value="MULTI">Lựa chọn nhiều</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Độ khó</InputLabel>
                      <Select
                        value={q.doKho}
                        label="Độ khó"
                        onChange={(e) =>
                          onUpdateQuestion(q.id, "doKho", e.target.value)
                        }
                        disabled={readOnly}
                      >
                        <MenuItem value="De">Dễ</MenuItem>
                        <MenuItem value="TrungBinh">Trung bình</MenuItem>
                        <MenuItem value="Kho">Khó</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Đáp án
                  </Typography>
                  {q.danhSachDapAn.map((d: any, dIdx: number) => (
                    <Box
                      key={d.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                        bgcolor: "#fff",
                        p: 1,
                        borderRadius: "6px",
                        border: "1px solid #EDEFF3",
                      }}
                    >
                      {q.loaiCauHoi === "ONE" ? (
                        <Radio
                          checked={d.laDapAnDung}
                          onChange={(e) =>
                            onToggleDapAnDung(q.id, d.id, e.target.checked)
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
                          checked={d.laDapAnDung}
                          onChange={(e) =>
                            onToggleDapAnDung(q.id, d.id, e.target.checked)
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
                        value={d.noiDungDapAn}
                        onChange={(e) =>
                          onUpdateDapAn(
                            q.id,
                            d.id,
                            "noiDungDapAn",
                            e.target.value,
                          )
                        }
                        disabled={readOnly}
                      />
                      {!readOnly && (
                        <IconButton
                          size="small"
                          onClick={() => onRemoveDapAn(q.id, d.id)}
                        >
                          <DeleteOutlined
                            fontSize="small"
                            sx={{ color: "#9AA2B1" }}
                          />
                        </IconButton>
                      )}
                    </Box>
                  ))}
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
                        py: 0.5,
                      }}
                    >
                      Thêm đáp án
                    </Button>
                  )}
                </Box>
              </Collapse>
            </Paper>
          </Box>
        );
      })}

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
            py: 1,
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
            sx={{ textTransform: "none", color: "#8A93A3" }}
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
              "&:hover": { bgcolor: MAU.chinhDam },
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
  } = useCourseEdit();

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

  const baiKiemTraService = new BaiKiemTraService();

  const nhomTuyChonThemMuc: NhomTuyChonThemMuc[] = [
    {
      groupLabel: "Nội dung bài học",
      options: [
        {
          type: "BaiGiang",
          icon: <OndemandVideoOutlined sx={{ fontSize: 20 }} />,
          iconBg: `${MAU.chinh}1A`,
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
          icon: <QuizOutlined sx={{ fontSize: 20, color: "#D97706" }} />,
          iconBg: "#FEF3E2",
          title: "Trắc nghiệm",
          description: "Kiểm tra nhanh mức độ hiểu bài sau mỗi bài học.",
        },
      ],
    },
  ];

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

  // === CRUD phần ===
  const moThemPhan = () => {
    setPhanForm({ mode: "add", tenPhan: "", mieuTa: "" });
  };

  const moSuaPhan = (phanId: string) => {
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

  // === CRUD bài giảng ===
  const xoaBaiGiang = async (phanId: string, baiGiangId: string) => {
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

  const saveBaiGiang = async (phanId: string, baiGiangId: string) => {
    setLoading(true);
    try {
      const phan = phans.find((p) => p.id === phanId);
      if (!phan) return;
      const bg = (phan.DanhSachBaiGiang ?? []).find((b) => b.id === baiGiangId);
      if (!bg) return;
      await updateBaiGiang(phanId, baiGiangId, {
        tieuDe: bg.tieuDe,
        isFree: bg.laBaiGiangFree,
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
    const phan = phans.find((p) => p.id === phanId);
    if (phan) {
      const updatedBg = phan.DanhSachBaiGiang?.map((bg) =>
        bg.id === lectureId
          ? { ...bg, tieuDe: title, laBaiGiangFree: isFree }
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
    await saveBaiGiang(phanId, lectureId);
    setEditingLecture(null);
  };

  // === CRUD bài kiểm tra ===
  const xoaBaiKiemTra = async (phanId: string, baiKiemTraId: string) => {
    setDeleteDialog({
      open: true,
      onConfirm: async () => {
        setDeleteDialog({ open: false, onConfirm: () => {} });
        try {
          await deleteBaiKiemTra(phanId, baiKiemTraId);
          const updatedPhans = phans.map((p) =>
            p.id === phanId
              ? {
                  ...p,
                  DanhDachBaiKiemTra: p.DanhDachBaiKiemTra?.filter(
                    (kt) => kt.id !== baiKiemTraId,
                  ),
                }
              : p,
          );
          setPhans(updatedPhans);
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
        }
      },
    });
  };

  // === Handlers cho bài kiểm tra ===
  const handleAddQuestion = () => {
    if (!addForm || addForm.type !== "BaiKiemTra") return;
    const newQuestion = {
      id: "q_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      noiDungCauHoi: "",
      loaiCauHoi: "ONE" as const,
      diem: 1,
      doKho: "TrungBinh" as const,
      danhSachDapAn: [
        { id: "a1", noiDungDapAn: "", laDapAnDung: false, thuTuSapXep: 0 },
        { id: "a2", noiDungDapAn: "", laDapAnDung: false, thuTuSapXep: 1 },
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
          id: "da_" + Date.now() + Math.random().toString(36).substr(2, 3),
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
        tenBaiKiemTra,
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
    const phan = phans.find((p) => p.id === phanId);
    if (!phan) return;
    const quiz = phan.DanhDachBaiKiemTra?.find((kt) => kt.id === quizId);
    if (!quiz) return;
    setEditingQuiz({
      phanId,
      quizId,
      tenBaiKiemTra: quiz.tenBaiKiemTra || "",
      moTa: quiz.moTa || "",
      cauHois: quiz.cauHois
        ? quiz.cauHois.map((q: any) => ({
            id:
              q.id ||
              "q_" + Date.now() + Math.random().toString(36).substr(2, 4),
            noiDungCauHoi: q.noiDungCauHoi || q.tenCauHoi || "",
            loaiCauHoi: q.loaiCauHoi || "ONE",
            diem: q.diem || 1,
            doKho: q.doKho || "TrungBinh",
            danhSachDapAn: (q.danhSachDapAn || []).map((d: any) => ({
              id:
                d.id ||
                "da_" + Date.now() + Math.random().toString(36).substr(2, 3),
              noiDungDapAn: d.noiDungDapAn,
              laDapAnDung: d.laDapAnDung || false,
              thuTuSapXep: d.thuTuSapXep || 0,
            })),
          }))
        : [],
    });
    setExpandedQuestions(
      quiz.cauHois
        ? quiz.cauHois.reduce(
            (acc: any, q: any) => ({ ...acc, [q.id || "q_temp"]: true }),
            {},
          )
        : {},
    );
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
      await updateBaiKiemTra(phanId, quizId, { tenBaiKiemTra, moTa, cauHois });
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

  const handleVideoFileSelect = (baiGiangId: string, file: File) => {
    setTempVideoFiles((prev) => ({ ...prev, [baiGiangId]: file }));
    setToast({
      open: true,
      message: "Đã chọn video mới, bấm Lưu để cập nhật",
      severity: "info",
    });
  };

  const chonTuyChonThemMuc = (tuyChon: TuyChonThemMuc) => {
    if (!menuAnchor || tuyChon.disabled) return;
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
            id: "q1",
            noiDungCauHoi: "",
            loaiCauHoi: "ONE",
            diem: 1,
            doKho: "TrungBinh",
            danhSachDapAn: [
              {
                id: "a1",
                noiDungDapAn: "",
                laDapAnDung: false,
                thuTuSapXep: 0,
              },
              {
                id: "a2",
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

  // === Load quiz tự động ===
  useEffect(() => {
    const phanIds = phans.map((p) => p.id as string).filter(Boolean);
    if (phanIds.length === 0) return;

    const loadQuizzes = async () => {
      for (const phanId of phanIds) {
        try {
          const res = await baiKiemTraService.GetListForManager(phanId);
          const rawList: any = (res as any)?.data?.data ?? res?.data;
          if (res.status !== false && rawList) {
            const mappedList = rawList.map((item: any) => ({
              ...item,
              cauHois: (item.danhSachCauHois || []).map((q: any) => ({
                id: q.id,
                noiDungCauHoi: q.noiDungCauHoi || q.tenCauHoi || "",
                loaiCauHoi: q.loaiCauHoi,
                doKho: q.doKho,
                danhSachDapAn: q.danhSachDapAns || [],
              })),
            }));
            const updatedPhans = phans.map((p) =>
              p.id === phanId ? { ...p, DanhDachBaiKiemTra: mappedList } : p,
            );
            setPhans(updatedPhans);
          }
        } catch (err) {
          console.error("Lỗi tải bài kiểm tra cho phần", phanId, err);
        }
      }
    };
    loadQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phans.map((p) => p.id).join(",")]);

  // ===== RENDER =====
  return (
    <AuthGuard allowedRoles={["Admin", "GiaoVien"]}>
      <Box sx={{ maxWidth: 900, mx: "auto", pb: 12, bgcolor: "#FBFBFD" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
            gap: 2,
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: 24, color: "#1F2937" }}>
            Chương trình giảng dạy
          </Typography>
          <Button
            variant="outlined"
            startIcon={<UploadFileOutlined fontSize="small" />}
            onClick={() => {}}
            sx={{
              flexShrink: 0,
              textTransform: "none",
              fontWeight: 700,
              color: MAU.chinh,
              borderColor: MAU.chinh,
              borderRadius: "10px",
              "&:hover": { bgcolor: `${MAU.chinh}0F`, borderColor: MAU.chinh },
            }}
          >
            Trình tải lên hàng loạt
          </Button>
        </Box>

        <Box sx={{ borderBottom: "1px solid #EDEFF3", mb: 3 }} />

        <Typography
          sx={{ fontSize: 13.5, color: "#8A93A3", mb: 1, lineHeight: 1.7 }}
        >
          Hãy thiết kế khóa học của bạn theo từng phần, mỗi phần tập trung vào
          một mục tiêu học tập duy nhất. Sau đó, thêm nội dung, hoạt động thực
          hành và bài kiểm tra.
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#8A93A3", mb: 3 }}>
          Tổng thời lượng: {tongPhut} phút
        </Typography>

        {(loading || contextLoading) && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress sx={{ color: MAU.chinh }} />
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {phans.map((phan, idx) => {
            const phanId = phan.id as string;
            const items = getItems(phan);
            const isEditingPhan =
              phanForm?.mode === "edit" && phanForm?.phanId === phanId;

            return (
              <Box key={phanId}>
                {/* Phần */}
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
                      sx={{ fontWeight: 800, color: "#1F2937", flexShrink: 0 }}
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
                    <IconButton size="small" onClick={() => moSuaPhan(phanId)}>
                      <EditOutlined
                        fontSize="small"
                        sx={{ color: "#9AA2B1" }}
                      />
                    </IconButton>
                    <Tooltip title="Xóa phần">
                      <IconButton size="small" onClick={() => xoaPhan(phanId)}>
                        <DeleteOutlined
                          fontSize="small"
                          sx={{ color: "#9AA2B1" }}
                        />
                      </IconButton>
                    </Tooltip>
                    <DragIndicator
                      sx={{ fontSize: 20, color: "#C7CCD6", cursor: "grab" }}
                    />
                  </Box>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    {items.map((item) => {
                      const isComplete = isItemComplete(item);
                      const itemId = item.data.id as string;

                      if (item.kind === "BaiGiang") {
                        const bg = item.data as BaiGiangType;
                        const isExpanded = !!expandedLectures[itemId];
                        const hasNewVideo = !!tempVideoFiles[itemId];
                        const isEditing = editingLecture?.lectureId === itemId;

                        return (
                          <Box key={`item-${item.kind}-${itemId}`}>
                            <ListItem
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                bgcolor: "transparent",
                                "&:hover": { bgcolor: "rgba(0,0,0,0.02)" },
                              }}
                              secondaryAction={
                                <Box sx={{ display: "flex", gap: 0.5 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleEditLecture(phanId, itemId)
                                    }
                                  >
                                    <EditOutlined
                                      fontSize="small"
                                      sx={{ color: "#9AA2B1" }}
                                    />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => xoaBaiGiang(phanId, itemId)}
                                  >
                                    <DeleteOutlined
                                      fontSize="small"
                                      sx={{ color: "#9AA2B1" }}
                                    />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => toggleLecture(itemId)}
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
                                    sx={{ fontSize: 18, color: MAU.chinh }}
                                  />
                                ) : (
                                  <RadioButtonUnchecked
                                    sx={{ fontSize: 18, color: "#C7CCD6" }}
                                  />
                                )}
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
                                    }}
                                  >
                                    {bg.tieuDe || "Bài giảng"}
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
                                      }}
                                    />
                                  </Box>
                                }
                              />
                            </ListItem>

                            <Collapse in={isExpanded}>
                              <Box sx={{ pl: 5, pr: 2, pb: 1 }}>
                                {isEditing ? (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 1,
                                      p: 1,
                                    }}
                                  >
                                    <TextField
                                      variant="standard"
                                      placeholder="Nhập tiêu đề bài giảng"
                                      value={editingLecture.title}
                                      onChange={(e) =>
                                        setEditingLecture((prev) =>
                                          prev
                                            ? { ...prev, title: e.target.value }
                                            : null,
                                        )
                                      }
                                      autoFocus
                                    />
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={
                                            editingLecture.isFree || false
                                          }
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
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file)
                                              setEditingLecture((prev) =>
                                                prev ? { ...prev, file } : null,
                                              );
                                          }}
                                        />
                                      </Button>
                                      {editingLecture.file ? (
                                        <Typography
                                          variant="body2"
                                          sx={{ mt: 0.5, color: "#6B7280" }}
                                        >
                                          Đã chọn: {editingLecture.file.name}
                                        </Typography>
                                      ) : bg.urlBaiGiang ? (
                                        <Typography
                                          variant="body2"
                                          sx={{ mt: 0.5, color: "#6B7280" }}
                                        >
                                          Video hiện tại:{" "}
                                          {dinhDangThoiLuong(bg.thoiLuong ?? 0)}
                                        </Typography>
                                      ) : (
                                        <Typography
                                          variant="body2"
                                          sx={{ mt: 0.5, color: "#8A93A3" }}
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
                                          "&:hover": { bgcolor: MAU.chinhDam },
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
                                            justifyContent: "center",
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
                                            sx={{ color: MAU.chinh }}
                                          />
                                        </Box>
                                        <Typography
                                          sx={{
                                            fontSize: 13.5,
                                            fontWeight: 600,
                                          }}
                                        >
                                          {dinhDangThoiLuong(bg.thoiLuong ?? 0)}
                                        </Typography>
                                        <Button
                                          component="label"
                                          size="small"
                                          startIcon={
                                            <EditOutlined fontSize="small" />
                                          }
                                          sx={{
                                            textTransform: "none",
                                            color: MAU.chinh,
                                            fontWeight: 600,
                                          }}
                                        >
                                          Thay video
                                          <input
                                            type="file"
                                            accept="video/*"
                                            hidden
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file)
                                                handleVideoFileSelect(
                                                  itemId,
                                                  file,
                                                );
                                            }}
                                          />
                                        </Button>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
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
                                            checked={!!bg.laBaiGiangFree}
                                            onChange={(e) => {
                                              const phan = phans.find(
                                                (p) => p.id === phanId,
                                              );
                                              if (phan) {
                                                const updatedBg =
                                                  phan.DanhSachBaiGiang?.map(
                                                    (b) =>
                                                      b.id === itemId
                                                        ? {
                                                            ...b,
                                                            laBaiGiangFree:
                                                              e.target.checked,
                                                          }
                                                        : b,
                                                  );
                                                const updatedPhans = phans.map(
                                                  (p) =>
                                                    p.id === phanId
                                                      ? {
                                                          ...p,
                                                          DanhSachBaiGiang:
                                                            updatedBg,
                                                        }
                                                      : p,
                                                );
                                                setPhans(updatedPhans);
                                              }
                                              saveBaiGiang(phanId, itemId);
                                            }}
                                          />
                                        </Box>
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
                                          border: "1px dashed #E3E6EB",
                                          borderRadius: "10px",
                                          cursor: "pointer",
                                          "&:hover": {
                                            borderColor: MAU.chinh,
                                            bgcolor: `${MAU.chinh}0F`,
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
                                              {tempVideoFiles[itemId]?.name}
                                            </Typography>
                                            <Button
                                              size="small"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setTempVideoFiles((prev) => {
                                                  const newState = { ...prev };
                                                  delete newState[itemId];
                                                  return newState;
                                                });
                                                setToast({
                                                  open: true,
                                                  message: "Đã hủy chọn video",
                                                  severity: "info",
                                                });
                                              }}
                                              sx={{
                                                textTransform: "none",
                                                color: "error.main",
                                                fontWeight: 600,
                                              }}
                                            >
                                              Hủy bỏ
                                            </Button>
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
                                              Tải lên video
                                            </Typography>
                                          </>
                                        )}
                                        <input
                                          type="file"
                                          accept="video/*"
                                          hidden
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file)
                                              handleVideoFileSelect(
                                                itemId,
                                                file,
                                              );
                                          }}
                                        />
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
                                        {(bg.danhSachTaiLieu ?? []).map(
                                          (tl: TaiLieuType) => (
                                            <ListItem
                                              key={tl.id}
                                              secondaryAction={
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
                                              }
                                              sx={{ cursor: "pointer", py: 0 }}
                                              onClick={() => {
                                                const docUrl =
                                                  (tl as any).url ||
                                                  (tl as any).duongDan ||
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
                                                primary={tl.tenTaiLieu}
                                                secondary={tl.loaiTaiLieu}
                                              />
                                            </ListItem>
                                          ),
                                        )}
                                      </List>
                                      {addResourceForm[itemId]?.open ? (
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 1,
                                            mt: 1,
                                            p: 1.5,
                                            bgcolor: "#F5F6F8",
                                            borderRadius: "8px",
                                          }}
                                        >
                                          <TextField
                                            variant="standard"
                                            placeholder="Nhập tên tài liệu (để trống lấy tên file)"
                                            value={
                                              addResourceForm[itemId]
                                                ?.tenTaiLieu || ""
                                            }
                                            onChange={(e) =>
                                              setAddResourceForm((prev) => ({
                                                ...prev,
                                                [itemId]: {
                                                  ...prev[itemId],
                                                  tenTaiLieu: e.target.value,
                                                },
                                              }))
                                            }
                                          />
                                          <Box
                                            sx={{
                                              display: "flex",
                                              gap: 1,
                                              alignItems: "center",
                                            }}
                                          >
                                            <Button
                                              component="label"
                                              variant="outlined"
                                              startIcon={<AttachFile />}
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
                                                hidden
                                                onChange={(e) => {
                                                  const file =
                                                    e.target.files?.[0];
                                                  if (file) {
                                                    setAddResourceForm(
                                                      (prev) => ({
                                                        ...prev,
                                                        [itemId]: {
                                                          ...prev[itemId],
                                                          file,
                                                        },
                                                      }),
                                                    );
                                                  }
                                                }}
                                              />
                                            </Button>
                                            {addResourceForm[itemId]?.file && (
                                              <Typography
                                                variant="body2"
                                                sx={{ color: "#6B7280" }}
                                              >
                                                {
                                                  addResourceForm[itemId]?.file
                                                    ?.name
                                                }
                                              </Typography>
                                            )}
                                          </Box>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              gap: 1,
                                              justifyContent: "flex-end",
                                            }}
                                          >
                                            <Button
                                              size="small"
                                              onClick={() =>
                                                setAddResourceForm((prev) => ({
                                                  ...prev,
                                                  [itemId]: {
                                                    tenTaiLieu: "",
                                                    file: null,
                                                    open: false,
                                                  },
                                                }))
                                              }
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
                                                const form =
                                                  addResourceForm[itemId];
                                                if (form?.file) {
                                                  uploadTaiLieu(
                                                    phanId,
                                                    itemId,
                                                    form.file,
                                                    form.tenTaiLieu,
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
                                            fontWeight: 600,
                                          }}
                                        >
                                          Thêm tài liệu
                                        </Button>
                                      )}
                                    </Box>
                                  </Box>
                                )}
                              </Box>
                            </Collapse>
                          </Box>
                        );
                      } else {
                        // ===== BÀI KIỂM TRA =====
                        const kt = item.data as BaiKiemTraDto;
                        const isEditingQuiz = editingQuiz?.quizId === itemId;
                        const isQuizExpanded = !!expandedQuizzes[itemId];
                        const tenHienThi =
                          kt.tenBaiKiemTra ||
                          `Bài kiểm tra ${kt.soCauHoi || 0} câu hỏi`;

                        if (isEditingQuiz) {
                          return (
                            <Box
                              key={`item-${item.kind}-${itemId}`}
                              sx={{ pl: 4, pr: 2 }}
                            >
                              <Box
                                sx={{
                                  bgcolor: "#fff",
                                  border: "1px solid #E7E9EE",
                                  borderRadius: "10px",
                                  p: 2,
                                }}
                              >
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
                                      id:
                                        "q_" +
                                        Date.now() +
                                        "_" +
                                        Math.random().toString(36).substr(2, 4),
                                      noiDungCauHoi: "",
                                      loaiCauHoi: "ONE" as const,
                                      diem: 1,
                                      doKho: "TrungBinh" as const,
                                      danhSachDapAn: [
                                        {
                                          id: "a1",
                                          noiDungDapAn: "",
                                          laDapAnDung: false,
                                          thuTuSapXep: 0,
                                        },
                                        {
                                          id: "a2",
                                          noiDungDapAn: "",
                                          laDapAnDung: false,
                                          thuTuSapXep: 1,
                                        },
                                      ],
                                    };
                                    setEditingQuiz((prev) => ({
                                      ...prev!,
                                      cauHois: [...(prev!.cauHois || []), newQ],
                                    }));
                                    setExpandedQuestions((prev) => ({
                                      ...prev,
                                      [newQ.id]: true,
                                    }));
                                  }}
                                  onRemoveQuestion={(qId) => {
                                    if (!editingQuiz) return;
                                    setEditingQuiz((prev) => ({
                                      ...prev!,
                                      cauHois: prev!.cauHois.filter(
                                        (q) => q.id !== qId,
                                      ),
                                    }));
                                    setExpandedQuestions((prev) => {
                                      const newState = { ...prev };
                                      delete newState[qId];
                                      return newState;
                                    });
                                  }}
                                  onUpdateQuestion={(qId, field, value) => {
                                    if (!editingQuiz) return;
                                    setEditingQuiz((prev) => ({
                                      ...prev!,
                                      cauHois: prev!.cauHois.map((q) =>
                                        q.id === qId
                                          ? { ...q, [field]: value }
                                          : q,
                                      ),
                                    }));
                                  }}
                                  onAddDapAn={(qId) => {
                                    if (!editingQuiz) return;
                                    setEditingQuiz((prev) => ({
                                      ...prev!,
                                      cauHois: prev!.cauHois.map((q) => {
                                        if (q.id !== qId) return q;
                                        const newDapAn = {
                                          id:
                                            "da_" +
                                            Date.now() +
                                            Math.random()
                                              .toString(36)
                                              .substr(2, 3),
                                          noiDungDapAn: "",
                                          laDapAnDung: false,
                                          thuTuSapXep: q.danhSachDapAn.length,
                                        };
                                        return {
                                          ...q,
                                          danhSachDapAn: [
                                            ...q.danhSachDapAn,
                                            newDapAn,
                                          ],
                                        };
                                      }),
                                    }));
                                  }}
                                  onRemoveDapAn={(qId, dId) => {
                                    if (!editingQuiz) return;
                                    setEditingQuiz((prev) => ({
                                      ...prev!,
                                      cauHois: prev!.cauHois.map((q) => {
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
                                          danhSachDapAn: q.danhSachDapAn.filter(
                                            (d) => d.id !== dId,
                                          ),
                                        };
                                      }),
                                    }));
                                  }}
                                  onUpdateDapAn={(qId, dId, field, value) => {
                                    if (!editingQuiz) return;
                                    setEditingQuiz((prev) => ({
                                      ...prev!,
                                      cauHois: prev!.cauHois.map((q) => {
                                        if (q.id !== qId) return q;
                                        return {
                                          ...q,
                                          danhSachDapAn: q.danhSachDapAn.map(
                                            (d) =>
                                              d.id === dId
                                                ? { ...d, [field]: value }
                                                : d,
                                          ),
                                        };
                                      }),
                                    }));
                                  }}
                                  onToggleDapAnDung={(qId, dId, checked) => {
                                    if (!editingQuiz) return;
                                    setEditingQuiz((prev) => ({
                                      ...prev!,
                                      cauHois: prev!.cauHois.map((q) => {
                                        if (q.id !== qId) return q;
                                        let newDapAn = q.danhSachDapAn.map(
                                          (d) =>
                                            d.id === dId
                                              ? { ...d, laDapAnDung: checked }
                                              : d,
                                        );
                                        if (q.loaiCauHoi === "ONE" && checked) {
                                          newDapAn = newDapAn.map((d) =>
                                            d.id === dId
                                              ? { ...d, laDapAnDung: true }
                                              : { ...d, laDapAnDung: false },
                                          );
                                        }
                                        return {
                                          ...q,
                                          danhSachDapAn: newDapAn,
                                        };
                                      }),
                                    }));
                                  }}
                                  onCancel={cancelEditQuiz}
                                  onSubmit={saveEditQuiz}
                                  loading={loading}
                                  submitLabel="Cập nhật"
                                  expandedQuestions={expandedQuestions}
                                  toggleQuestionExpand={toggleQuestionExpand}
                                />
                              </Box>
                            </Box>
                          );
                        }

                        return (
                          <Box key={`item-${item.kind}-${itemId}`}>
                            <ListItem
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                bgcolor: "transparent",
                              }}
                              secondaryAction={
                                <Box sx={{ display: "flex", gap: 0.5 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleEditQuiz(phanId, itemId)
                                    }
                                  >
                                    <EditOutlined
                                      fontSize="small"
                                      sx={{ color: "#9AA2B1" }}
                                    />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      xoaBaiKiemTra(phanId, itemId)
                                    }
                                  >
                                    <DeleteOutlined
                                      fontSize="small"
                                      sx={{ color: "#9AA2B1" }}
                                    />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => toggleQuizItem(itemId)}
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
                                    sx={{ fontSize: 18, color: MAU.chinh }}
                                  />
                                ) : (
                                  <RadioButtonUnchecked
                                    sx={{ fontSize: 18, color: "#C7CCD6" }}
                                  />
                                )}
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
                                    }}
                                  >
                                    {tenHienThi}
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
                                      }}
                                    />
                                  </Box>
                                }
                              />
                            </ListItem>
                            <Collapse in={isQuizExpanded}>
                              <Box sx={{ pl: 5, pr: 2, pb: 1 }}>
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
                                  expandedQuestions={(kt.cauHois || []).reduce(
                                    (acc, q) => ({ ...acc, [q.id]: true }),
                                    {},
                                  )}
                                  toggleQuestionExpand={() => {}}
                                />
                              </Box>
                            </Collapse>
                          </Box>
                        );
                      }
                    })}

                    {/* FORM THÊM MỚI BÀI GIẢNG / BÀI KIỂM TRA */}
                    {addForm?.phanId === phanId && (
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
                                  "&:hover": { bgcolor: `${MAU.chinh}0F` },
                                }}
                              >
                                {addForm.file ? "Thay đổi video" : "Chọn video"}
                                <input
                                  type="file"
                                  accept="video/*"
                                  hidden
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file)
                                      setAddForm((prev) => ({
                                        ...prev!,
                                        file,
                                      }));
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
                                  Lưu ý: Tất cả các tệp phải có độ phân giải tối
                                  thiểu 720p và dung lượng dưới 100MB.
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
                                sx={{ textTransform: "none", color: "#8A93A3" }}
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
                                    setLoading(true);
                                    createBaiGiang(phanId, {
                                      tieuDe: title || "Bài giảng mới",
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
                                            err.message || "Lỗi tạo bài giảng",
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

                    <Button
                      startIcon={<Add />}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenuAnchor({
                          position: { top: rect.bottom + 6, left: rect.left },
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
                  </Box>
                </Box>

                {/* Form chỉnh sửa phần (hiện ngay dưới phần) */}
                {isEditingPhan && (
                  <Box
                    sx={{
                      mt: 1,
                      p: 2,
                      border: "1px solid #EDEFF3",
                      borderRadius: "10px",
                      bgcolor: "#fff",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, mb: 1 }}>
                      Chỉnh sửa phần
                    </Typography>
                    <TextField
                      label="Nhập tiêu đề"
                      value={phanForm.tenPhan}
                      onChange={(e) =>
                        setPhanForm({ ...phanForm, tenPhan: e.target.value })
                      }
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      label="Sau khi hoàn thành phần này, sinh viên sẽ có thể làm được những gì?"
                      value={phanForm.mieuTa}
                      onChange={(e) =>
                        setPhanForm({ ...phanForm, mieuTa: e.target.value })
                      }
                      fullWidth
                      multiline
                      rows={2}
                      sx={{ mb: 2 }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        onClick={() => setPhanForm(null)}
                        sx={{ textTransform: "none", color: "#8A93A3" }}
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
                          "&:hover": { bgcolor: MAU.chinhDam },
                        }}
                      >
                        Cập nhật
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Nút thêm phần mới (cuối trang) */}
        {phanForm?.mode === "add" ? (
          <Box
            sx={{
              mt: 2.5,
              p: 2,
              border: "1px solid #EDEFF3",
              borderRadius: "10px",
              bgcolor: "#fff",
            }}
          >
            <Typography sx={{ fontWeight: 700, mb: 1 }}>
              Thêm phần mới
            </Typography>
            <TextField
              label="Nhập tiêu đề"
              value={phanForm.tenPhan}
              onChange={(e) =>
                setPhanForm({ ...phanForm, tenPhan: e.target.value })
              }
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Sau khi hoàn thành phần này, sinh viên sẽ có thể làm được những gì?"
              value={phanForm.mieuTa}
              onChange={(e) =>
                setPhanForm({ ...phanForm, mieuTa: e.target.value })
              }
              fullWidth
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button
                onClick={() => setPhanForm(null)}
                sx={{ textTransform: "none", color: "#8A93A3" }}
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
                  "&:hover": { bgcolor: MAU.chinhDam },
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
            disabled={loading}
            sx={{
              mt: 2.5,
              textTransform: "none",
              fontWeight: 700,
              color: MAU.chinh,
              border: `1px solid ${MAU.chinh}`,
              borderRadius: "10px",
              px: 2,
              bgcolor: "#fff",
              "&:hover": { bgcolor: `${MAU.chinh}0F` },
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
                width: 340,
                maxWidth: "calc(100vw - 32px)",
                maxHeight: 420,
                borderRadius: "14px",
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
                  disabled={tuyChon.disabled}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                    px: 2,
                    py: 1,
                    mx: 1,
                    borderRadius: "10px",
                    opacity: tuyChon.disabled ? 0.5 : 1,
                    "&:hover": {
                      bgcolor: tuyChon.disabled ? "transparent" : "#F5F6F8",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
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
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#1F2937",
                        lineHeight: 1.4,
                      }}
                    >
                      {tuyChon.title}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 12.5, color: "#8A93A3", lineHeight: 1.5 }}
                    >
                      {tuyChon.description}
                    </Typography>
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
              sx={{ textTransform: "none", fontWeight: 700, color: MAU.chuXam }}
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
