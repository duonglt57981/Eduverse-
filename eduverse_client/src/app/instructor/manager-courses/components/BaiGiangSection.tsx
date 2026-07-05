// src/app/instructor/manager-courses/components/BaiGiangSection.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  CircularProgress,
  TextField,
  MenuItem,
  Menu,
  Collapse,
  Button,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircle";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SendIcon from "@mui/icons-material/Send";
import EditNoteIcon from "@mui/icons-material/EditNote";
import CloseIcon from "@mui/icons-material/Close";

import BaiGiangService from "@/src/services/BaiGiangService";
import { BaiGiangType, BaiGiangForm } from "../types";
import {
  R,
  RH,
  RedBtn,
  OutlineBtn,
  UploadZone,
  BaiGiangRow,
  fmtTime,
  isCurrentVersion,
  groupVersions,
  extractList,
  resolveApiResult,
  getErrMsg,
  TEXT_DARK,
  TEXT_GRAY,
  BORDER_GRAY,
} from "../types/constants";
import { useToast } from "./useToast";
import { ConfirmDialog } from "./ConfirmDialog";
import { TaiLieuSection } from "./TaiLieuSection";

const bgSvc = new BaiGiangService();

const getStatusInfo = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
    case "chờ duyệt":
      return { label: "Chờ duyệt", color: "#ed6c02", bg: "#fff3e0" };
    case "approved":
    case "đã duyệt":
      return { label: "Đã duyệt", color: "#2e7d32", bg: "#e8f5e9" };
    case "rejected":
    case "từ chối":
      return { label: "Từ chối", color: "#d32f2f", bg: "#ffebee" };
    case "draft":
    case "nháp":
      return { label: "Nháp", color: "#757575", bg: "#f5f5f5" };
    default:
      return {
        label: status || "Không xác định",
        color: "#757575",
        bg: "#f5f5f5",
      };
  }
};

type VersionedBaiGiang = BaiGiangType & {
  idBanGhiTruoc?: string | null;
  isBanHienTai?: boolean;
  trangThaiPheDuyet?: string;
};

// URL video của bài giảng được backend trả về qua trường `urlBaiGiang`.
function resolveVideoUrl(bg?: VersionedBaiGiang | null): string | undefined {
  const url = (bg as { urlBaiGiang?: string } | null | undefined)?.urlBaiGiang;
  return url && url.trim() ? url : undefined;
}

interface BaiGiangSectionProps {
  phanId: string;
  onMutated?: () => void;
  canEdit?: boolean;
}

export function BaiGiangSection({
  phanId,
  onMutated,
  canEdit = false,
}: BaiGiangSectionProps) {
  const { show, ToastComponent } = useToast();
  const [items, setItems] = useState<VersionedBaiGiang[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBg, setExpandedBg] = useState<Record<string, boolean>>({});
  const [expandedDrafts, setExpandedDrafts] = useState<Record<string, boolean>>(
    {},
  );
  const [adding, setAdding] = useState(false);
  const [editTarget, setEditTarget] = useState<VersionedBaiGiang | null>(null);
  const [form, setForm] = useState<BaiGiangForm>({
    tieuDe: "",
    laBaiGiangFree: false,
    videoFile: null,
  });
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [delLoading, setDelLoading] = useState(false);
  const [changingId, setChangingId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{
    el: HTMLElement;
    bg: VersionedBaiGiang;
  } | null>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  // Preview cho video mới chọn (chưa lưu) — tạo/huỷ object URL an toàn.
  const [newVideoUrl, setNewVideoUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!form.videoFile) {
      setNewVideoUrl(null);
      return;
    }
    const objUrl = URL.createObjectURL(form.videoFile);
    setNewVideoUrl(objUrl);
    return () => URL.revokeObjectURL(objUrl);
  }, [form.videoFile]);

  // Dialog xem nhanh video của một bài giảng bất kỳ trong danh sách.
  const [previewTarget, setPreviewTarget] = useState<{
    title: string;
    url: string;
  } | null>(null);

  const load = useCallback(async () => {
    if (!phanId) return;
    setLoading(true);
    try {
      const res = await bgSvc.GetListBaiGiangManager(phanId);
      setItems(extractList<VersionedBaiGiang>(res));
    } catch {
      show("Không thể tải danh sách bài giảng", "error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [phanId, show]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    await load();
    onMutated?.();
  };

  const toggleBg = (bgId: string) =>
    setExpandedBg((p) => ({ ...p, [bgId]: !p[bgId] }));
  const toggleDraftRow = (groupKey: string) =>
    setExpandedDrafts((p) => ({ ...p, [groupKey]: !p[groupKey] }));

  const openAdd = () => {
    if (!canEdit) return;
    if (videoRef.current) videoRef.current.value = "";
    setForm({ tieuDe: "", laBaiGiangFree: false, videoFile: null });
    setEditTarget(null);
    setAdding(true);
  };
  const openEdit = (bg: VersionedBaiGiang) => {
    if (!canEdit) return;
    if (videoRef.current) videoRef.current.value = "";
    setForm({
      tieuDe: bg.tieuDe ?? "",
      laBaiGiangFree: bg.laBaiGiangFree ?? false,
      videoFile: null,
    });
    setEditTarget(bg);
    setAdding(true);
    setMenuAnchor(null);
  };
  const closeForm = () => {
    if (saving) return;
    setAdding(false);
    setEditTarget(null);
    if (videoRef.current) videoRef.current.value = "";
    setForm({ tieuDe: "", laBaiGiangFree: false, videoFile: null });
  };

  const handleSave = async () => {
    if (!canEdit) return;
    if (!form.tieuDe.trim()) {
      show("Vui lòng nhập tên bài giảng", "error");
      return;
    }
    // Tạo mới bắt buộc phải chọn video; sửa thì không chọn video mới = giữ
    // nguyên video cũ.
    if (!form.videoFile && !editTarget) {
      show("Vui lòng chọn video bài giảng", "error");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("TieuDe", form.tieuDe.trim());
      fd.append("LaBaiGiangFree", String(form.laBaiGiangFree));
      if (form.videoFile) fd.append("Video", form.videoFile);

      const result: any = editTarget
        ? await (() => {
            fd.append("IdBaiGiang", editTarget.id!);
            fd.append("IdPhan", phanId);
            fd.append("Id", editTarget.id!);
            return bgSvc.UpdateBaiGiang(fd as any);
          })()
        : await (() => {
            fd.append("IdPhan", phanId);
            return bgSvc.CreateBaiGiang(fd as any);
          })();

      const { ok, errorMsg } = resolveApiResult(result);
      if (!ok) {
        show(errorMsg ?? "Lỗi khi lưu bài giảng", "error");
        return;
      }
      show(editTarget ? "Đã cập nhật bài giảng" : "Đã thêm bài giảng");
      setAdding(false);
      setEditTarget(null);
      if (videoRef.current) videoRef.current.value = "";
      await refresh();
    } catch (error: any) {
      show(getErrMsg(error, "Lỗi khi lưu bài giảng"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel || !canEdit) return;
    setDelLoading(true);
    try {
      const result: any = await bgSvc.DeleteBaiGiang(confirmDel);
      const { ok, errorMsg } = resolveApiResult(result);
      if (!ok) {
        show(errorMsg ?? "Lỗi khi xoá bài giảng", "error");
        return;
      }
      show("Đã xoá bài giảng");
      setConfirmDel(null);
      await refresh();
    } catch (error: any) {
      show(getErrMsg(error, "Lỗi khi xoá bài giảng"), "error");
    } finally {
      setDelLoading(false);
    }
  };

  const updateItemLocal = (id: string, patch: Partial<VersionedBaiGiang>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    );
  };

  const handleChuyenTTChoDuyet = async (bg: VersionedBaiGiang) => {
    if (changingId || !canEdit) return;
    setChangingId(bg.id!);
    try {
      const result: any = await bgSvc.ChuyenTTChoDuyet(bg.id!);
      const { ok, data, errorMsg } = resolveApiResult(result);
      if (!ok) {
        show(errorMsg ?? "Lỗi chuyển trạng thái", "error");
        return;
      }
      updateItemLocal(bg.id!, data ?? { trangThaiPheDuyet: "ChoDuyet" });
      show("Đã gửi bài giảng đi phê duyệt");
      onMutated?.();
    } catch (error: any) {
      show(getErrMsg(error, "Lỗi chuyển trạng thái"), "error");
    } finally {
      setChangingId(null);
    }
  };

  const handleChuyenTTDangSua = async (bg: VersionedBaiGiang) => {
    if (changingId || !canEdit) return;
    setChangingId(bg.id!);
    try {
      const result: any = await bgSvc.ChuyenTTDangSua(bg.id!);
      const { ok, data, errorMsg } = resolveApiResult(result);
      if (!ok) {
        show(errorMsg ?? "Lỗi chuyển trạng thái", "error");
        return;
      }
      updateItemLocal(bg.id!, data ?? { trangThaiPheDuyet: "DangSua" });
      show("Đã chuyển bài giảng sang Đang sửa");
      onMutated?.();
    } catch (error: any) {
      show(getErrMsg(error, "Lỗi chuyển trạng thái"), "error");
    } finally {
      setChangingId(null);
    }
  };

  const groups = groupVersions<VersionedBaiGiang>(items);
  const groupKeys = Object.keys(groups);

  const renderRow = (bg: VersionedBaiGiang, isDraftRow: boolean) => {
    const statusInfo = getStatusInfo(bg.trangThaiPheDuyet);
    const bgIsDangSua = bg.trangThaiPheDuyet === "DangSua";
    const bgIsChoDuyet = bg.trangThaiPheDuyet === "ChoDuyet";
    const isChangingThis = changingId === bg.id;

    return (
      <Box key={bg.id}>
        <BaiGiangRow>
          <DragIndicatorIcon sx={{ fontSize: 14, color: "#ccc", mr: 1 }} />
          <VideoLibraryIcon
            sx={{ fontSize: 15, color: alpha(R, 0.6), mr: 1 }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{ fontSize: 13, fontWeight: 600, color: TEXT_DARK }}
            >
              {bg.tieuDe}
              {isDraftRow && (
                <Chip
                  label="Nháp"
                  size="small"
                  sx={{
                    ml: 0.75,
                    fontSize: "0.55rem",
                    height: 15,
                    bgcolor: "#fff3e0",
                    color: "#e65100",
                  }}
                />
              )}
              {!isDraftRow && isCurrentVersion(bg) && (
                <Chip
                  label="Chính"
                  size="small"
                  sx={{
                    ml: 0.75,
                    fontSize: "0.55rem",
                    height: 15,
                    bgcolor: "#e8f5e9",
                    color: "#2e7d32",
                  }}
                />
              )}
              {bg.laBaiGiangFree && (
                <Chip
                  label="Free"
                  size="small"
                  sx={{
                    ml: 0.5,
                    fontSize: "0.55rem",
                    height: 15,
                    bgcolor: "#e3f2fd",
                    color: "#1565c0",
                  }}
                />
              )}
              {bg.trangThaiPheDuyet && (
                <Chip
                  label={statusInfo.label}
                  size="small"
                  sx={{
                    ml: 0.5,
                    fontSize: "0.55rem",
                    height: 15,
                    bgcolor: statusInfo.bg,
                    color: statusInfo.color,
                  }}
                />
              )}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ fontSize: 11, color: TEXT_GRAY }}>
                Video
              </Typography>
              {bg.thoiLuong && (
                <Typography sx={{ fontSize: 11, color: TEXT_GRAY }}>
                  · {fmtTime(bg.thoiLuong)}
                </Typography>
              )}
            </Stack>
            {canEdit && (bgIsDangSua || bgIsChoDuyet) && (
              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                {bgIsDangSua && (
                  <Tooltip title="Gửi phê duyệt">
                    <span>
                      <Button
                        size="small"
                        startIcon={<SendIcon sx={{ fontSize: 12 }} />}
                        onClick={() => handleChuyenTTChoDuyet(bg)}
                        disabled={!!changingId}
                        sx={{
                          fontSize: "0.62rem",
                          minWidth: 0,
                          lineHeight: 1.4,
                          py: 0.25,
                          px: 1,
                          borderRadius: 999,
                          color: "#fff",
                          bgcolor: R,
                          textTransform: "none",
                          "&:hover": { bgcolor: RH },
                          "&.Mui-disabled": {
                            bgcolor: alpha(R, 0.35),
                            color: "#fff",
                          },
                        }}
                      >
                        {isChangingThis ? (
                          <CircularProgress size={11} sx={{ color: "#fff" }} />
                        ) : (
                          "Gửi phê duyệt"
                        )}
                      </Button>
                    </span>
                  </Tooltip>
                )}
                {bgIsChoDuyet && (
                  <Tooltip title="Chuyển về Đang sửa">
                    <span>
                      <Button
                        size="small"
                        startIcon={<EditNoteIcon sx={{ fontSize: 12 }} />}
                        onClick={() => handleChuyenTTDangSua(bg)}
                        disabled={!!changingId}
                        sx={{
                          fontSize: "0.62rem",
                          minWidth: 0,
                          lineHeight: 1.4,
                          py: 0.25,
                          px: 1,
                          borderRadius: 999,
                          color: R,
                          border: `1px solid ${alpha(R, 0.4)}`,
                          textTransform: "none",
                          "&:hover": { bgcolor: alpha(R, 0.06) },
                        }}
                      >
                        {isChangingThis ? (
                          <CircularProgress size={11} sx={{ color: R }} />
                        ) : (
                          "Sửa tiếp"
                        )}
                      </Button>
                    </span>
                  </Tooltip>
                )}
              </Stack>
            )}
          </Box>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Tooltip
              title={resolveVideoUrl(bg) ? "Xem video" : "Chưa có video"}
            >
              <span>
                <IconButton
                  size="small"
                  disabled={!resolveVideoUrl(bg)}
                  onClick={() =>
                    setPreviewTarget({
                      title: bg.tieuDe ?? "Bài giảng",
                      url: resolveVideoUrl(bg)!,
                    })
                  }
                  sx={{ color: alpha(R, 0.6), "&:hover": { color: R } }}
                >
                  <PlayCircleOutlineIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Xem tài liệu">
              <IconButton
                size="small"
                onClick={() => toggleBg(bg.id!)}
                sx={{ color: alpha(R, 0.5), "&:hover": { color: R } }}
              >
                <AttachFileIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Tuỳ chọn">
              <IconButton
                size="small"
                onClick={(e) => setMenuAnchor({ el: e.currentTarget, bg })}
                sx={{ color: "#aaa" }}
                disabled={!canEdit}
              >
                <MoreVertIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </BaiGiangRow>
        <Collapse in={!!expandedBg[bg.id!]}>
          <TaiLieuSection
            baiGiangId={bg.id!}
            canEdit={canEdit}
            onMutated={onMutated}
          />
        </Collapse>
      </Box>
    );
  };

  return (
    <Box sx={{ px: 2, pb: 1 }}>
      {loading ? (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 1 }}>
          <CircularProgress size={14} sx={{ color: alpha(R, 0.5) }} />
          <Typography sx={{ fontSize: 11.5, color: TEXT_GRAY }}>
            Đang tải bài giảng…
          </Typography>
        </Stack>
      ) : groupKeys.length === 0 ? (
        <Typography sx={{ fontSize: 11.5, color: TEXT_GRAY, mb: 0.5 }}>
          Chưa có bài giảng nào
        </Typography>
      ) : (
        groupKeys.map((key) => {
          const group = groups[key];
          if (!group) return null;
          const mainRow = group.current ?? group.drafts[0];
          const drafts = group.current ? group.drafts : group.drafts.slice(1);
          const hasDraftToggle = drafts.length > 0;
          const isExpanded = !!expandedDrafts[key];
          if (!mainRow) return null;
          return (
            <Box key={key} sx={{ mb: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                {hasDraftToggle && (
                  <IconButton
                    size="small"
                    onClick={() => toggleDraftRow(key)}
                    sx={{ mt: 0.5, mr: -0.5, color: alpha(R, 0.6) }}
                  >
                    {isExpanded ? (
                      <ExpandLessIcon sx={{ fontSize: 15 }} />
                    ) : (
                      <ExpandMoreIcon sx={{ fontSize: 15 }} />
                    )}
                  </IconButton>
                )}
                <Box sx={{ flex: 1 }}>{renderRow(mainRow, false)}</Box>
              </Box>
              {hasDraftToggle && (
                <Collapse in={isExpanded}>
                  <Box sx={{ pl: 3 }}>
                    {drafts.map((d) => renderRow(d, true))}
                  </Box>
                </Collapse>
              )}
            </Box>
          );
        })
      )}

      {canEdit && !adding && (
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={openAdd}
          sx={{
            fontSize: "0.75rem",
            color: alpha(R, 0.7),
            textTransform: "none",
            mt: 0.5,
          }}
        >
          Thêm bài giảng
        </Button>
      )}

      <Dialog
        open={adding}
        onClose={closeForm}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 800,
            fontSize: 15.5,
            color: TEXT_DARK,
          }}
        >
          {editTarget ? "Sửa bài giảng" : "Bài giảng mới"}
          <IconButton size="small" onClick={closeForm} disabled={saving}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: BORDER_GRAY }}>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <TextField
              size="small"
              label="Tiêu đề bài giảng *"
              fullWidth
              required
              autoFocus
              value={form.tieuDe}
              onChange={(e) =>
                setForm((p) => ({ ...p, tieuDe: e.target.value }))
              }
              sx={{
                "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                  borderColor: R,
                },
                "& label.Mui-focused": { color: R },
              }}
              placeholder="Nhập tiêu đề..."
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.laBaiGiangFree}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, laBaiGiangFree: e.target.checked }))
                  }
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: R },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: R,
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: 13, color: TEXT_DARK }}>
                  {form.laBaiGiangFree ? "🔓 Miễn phí" : "🔒 Trả phí"}
                </Typography>
              }
            />

            {/* ── Video ─────────────────────────────────────────── */}
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography
                  sx={{ fontSize: 13, fontWeight: 600, color: TEXT_DARK }}
                >
                  Video bài giảng {!editTarget && "*"}
                </Typography>
                {newVideoUrl ? (
                  <Chip
                    label="Video mới (chưa lưu)"
                    size="small"
                    sx={{
                      fontSize: "0.62rem",
                      height: 18,
                      bgcolor: "#fff3e0",
                      color: "#e65100",
                    }}
                  />
                ) : editTarget && resolveVideoUrl(editTarget) ? (
                  <Chip
                    label="Video hiện tại"
                    size="small"
                    sx={{
                      fontSize: "0.62rem",
                      height: 18,
                      bgcolor: "#e3f2fd",
                      color: "#1565c0",
                    }}
                  />
                ) : null}
              </Stack>

              {/* Trình phát xem trước: video mới nếu vừa chọn, ngược lại video hiện có khi sửa */}
              {(newVideoUrl || (editTarget && resolveVideoUrl(editTarget))) && (
                <Box
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    border: `1px solid ${BORDER_GRAY}`,
                    bgcolor: "#000",
                    mb: 1,
                  }}
                >
                  <video
                    key={newVideoUrl ?? resolveVideoUrl(editTarget)}
                    src={newVideoUrl ?? resolveVideoUrl(editTarget)}
                    controls
                    style={{
                      width: "100%",
                      maxHeight: 260,
                      display: "block",
                      background: "#000",
                    }}
                  />
                </Box>
              )}

              <input
                ref={videoRef}
                type="file"
                accept="video/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  if (file) setForm((p) => ({ ...p, videoFile: file }));
                }}
              />
              <UploadZone onClick={() => videoRef.current?.click()}>
                {form.videoFile ? (
                  <ChangeCircleIcon sx={{ color: alpha(R, 0.4), mb: 0.5 }} />
                ) : (
                  <CloudUploadIcon sx={{ color: alpha(R, 0.4), mb: 0.5 }} />
                )}
                <Typography sx={{ fontSize: 12, color: TEXT_GRAY }}>
                  {form.videoFile
                    ? `✅ ${form.videoFile.name} (${(form.videoFile.size / (1024 * 1024)).toFixed(1)} MB) — nhấn để chọn video khác`
                    : editTarget
                      ? "📹 Nhấn để đổi video (không chọn = giữ nguyên)"
                      : "📹 Nhấn để chọn video (MP4, WebM…)"}
                </Typography>
              </UploadZone>

              {form.videoFile && editTarget && (
                <Button
                  size="small"
                  onClick={() => {
                    if (videoRef.current) videoRef.current.value = "";
                    setForm((p) => ({ ...p, videoFile: null }));
                  }}
                  sx={{
                    mt: 0.5,
                    fontSize: 11,
                    textTransform: "none",
                    color: TEXT_GRAY,
                    p: 0,
                    minWidth: 0,
                    "&:hover": { color: R, background: "transparent" },
                  }}
                >
                  Huỷ chọn, giữ video cũ
                </Button>
              )}
              {!form.videoFile && !editTarget && (
                <Typography sx={{ fontSize: 11, color: "#d32f2f", mt: 0.5 }}>
                  * Vui lòng chọn file video
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <OutlineBtn size="small" onClick={closeForm} disabled={saving}>
            Hủy
          </OutlineBtn>
          <RedBtn
            size="small"
            onClick={handleSave}
            disabled={
              !form.tieuDe.trim() || (!form.videoFile && !editTarget) || saving
            }
          >
            {saving ? (
              <CircularProgress size={14} sx={{ color: "#fff" }} />
            ) : (
              "Lưu"
            )}
          </RedBtn>
        </DialogActions>
      </Dialog>

      {/* Dialog xem nhanh video của một bài giảng trong danh sách */}
      <Dialog
        open={!!previewTarget}
        onClose={() => setPreviewTarget(null)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, overflow: "hidden" } } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 700,
            fontSize: 14.5,
            color: TEXT_DARK,
            py: 1.25,
          }}
        >
          {previewTarget?.title}
          <IconButton size="small" onClick={() => setPreviewTarget(null)}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: "#000" }}>
          {previewTarget && (
            <video
              key={previewTarget.url}
              src={previewTarget.url}
              controls
              autoPlay
              style={{ width: "100%", maxHeight: "70vh", display: "block" }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Menu
        open={!!menuAnchor}
        anchorEl={menuAnchor?.el}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => menuAnchor && openEdit(menuAnchor.bg)}
          disabled={!canEdit}
        >
          <EditIcon sx={{ fontSize: 16, mr: 1 }} /> Sửa bài giảng
        </MenuItem>
        <MenuItem
          sx={{ color: R }}
          onClick={() => {
            if (menuAnchor) {
              setConfirmDel(menuAnchor.bg.id!);
              setMenuAnchor(null);
            }
          }}
          disabled={!canEdit}
        >
          <DeleteIcon sx={{ fontSize: 16, mr: 1 }} /> Xoá bài giảng
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={!!confirmDel}
        title="Xoá bài giảng"
        message="Bài giảng và tài liệu sẽ bị xoá vĩnh viễn."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(null)}
        loading={delLoading}
      />
      {ToastComponent}
    </Box>
  );
}
