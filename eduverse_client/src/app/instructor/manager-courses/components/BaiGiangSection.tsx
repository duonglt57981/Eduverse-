/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/instructor/manager-courses/components/BaiGiangSection.tsx
"use client";

import { useRef, useState } from "react";
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
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import BaiGiangService from "@/src/services/BaiGiangService";
import { BaiGiangType, TaiLieuType, BaiGiangForm } from "../types";
import {
  R,
  RedBtn,
  OutlineBtn,
  UploadZone,
  BaiGiangRow,
  fmtTime,
} from "../types/constants";
import { useToast } from "./useToast";
import { ConfirmDialog } from "./ConfirmDialog";
import { TaiLieuSection } from "./TaiLieuSection";

const bgSvc = new BaiGiangService();

interface BaiGiangSectionProps {
  phanId: string;
  items: BaiGiangType[];
  onRefresh: () => void;
  onMutated?: () => void;
  canEdit?: boolean;
}

export function BaiGiangSection({
  phanId,
  items,
  onRefresh,
  onMutated,
  canEdit = false,
}: BaiGiangSectionProps) {
  const { show, ToastComponent } = useToast();
  const [expandedBg, setExpandedBg] = useState<Record<string, boolean>>({});
  const [taiLieuMap, setTaiLieuMap] = useState<Record<string, TaiLieuType[]>>(
    {},
  );
  const [adding, setAdding] = useState(false);
  const [editTarget, setEditTarget] = useState<BaiGiangType | null>(null);
  const [form, setForm] = useState<BaiGiangForm>({
    tieuDe: "",
    loaiBaiGiang: "Video",
    thoiLuong: "",
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [delLoading, setDelLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{
    el: HTMLElement;
    bg: BaiGiangType;
  } | null>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const toggleBg = async (bgId: string) => {
    setExpandedBg((p) => ({ ...p, [bgId]: !p[bgId] }));
    if (!taiLieuMap[bgId]) {
      setTaiLieuMap((p) => ({ ...p, [bgId]: [] }));
    }
  };

  const openAdd = () => {
    if (!canEdit) return;
    setForm({ tieuDe: "", loaiBaiGiang: "Video", thoiLuong: "" });
    setVideoFile(null);
    setEditTarget(null);
    setAdding(true);
  };

  const openEdit = (bg: BaiGiangType) => {
    if (!canEdit) return;
    setForm({
      tieuDe: bg.tieuDe ?? "",
      loaiBaiGiang: bg.loaiBaiGiang ?? "Video",
      thoiLuong: String(bg.thoiLuong ?? ""),
    });
    setVideoFile(null);
    setEditTarget(bg);
    setAdding(true);
    setMenuAnchor(null);
  };

  const handleSave = async () => {
    if (!form.tieuDe.trim()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("TieuDe", form.tieuDe.trim());
      fd.append("LoaiBaiGiang", form.loaiBaiGiang);
      fd.append("ThoiLuong", form.thoiLuong || "0");
      if (videoFile) fd.append("VideoFile", videoFile);

      if (editTarget) {
        fd.append("Id", editTarget.id!);
        await bgSvc.UpdateBaiGiang(fd as any);
        show("Đã cập nhật bài giảng");
      } else {
        fd.append("IdPhan", phanId);
        await bgSvc.CreateBaiGiang(fd as any);
        show("Đã thêm bài giảng");
      }
      setAdding(false);
      onRefresh();
    } catch {
      show("Lỗi khi lưu bài giảng", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    setDelLoading(true);
    try {
      await bgSvc.DeleteBaiGiang(confirmDel);
      show("Đã xoá bài giảng");
      setConfirmDel(null);
      onRefresh();
    } catch {
      show("Lỗi khi xoá", "error");
    } finally {
      setDelLoading(false);
    }
  };

  return (
    <Box sx={{ px: 2, pb: 1 }}>
      {items.map((bg) => (
        <Box key={bg.id}>
          <BaiGiangRow>
            <DragIndicatorIcon sx={{ fontSize: 14, color: "#ccc", mr: 1 }} />
            <VideoLibraryIcon
              sx={{ fontSize: 15, color: alpha(R, 0.6), mr: 1 }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                {bg.tieuDe}
              </Typography>
              <Stack direction="row" spacing={1} sx={{alignItems:"center"}}>
                <Typography sx={{ fontSize: 11, color: "#999" }}>
                  {bg.loaiBaiGiang}
                </Typography>
                {bg.thoiLuong ? (
                  <Typography sx={{ fontSize: 11, color: "#bbb" }}>
                    · {fmtTime(bg.thoiLuong)}
                  </Typography>
                ) : null}
                {bg.laBaiGiangFree && (
                  <Chip
                    label="Free"
                    size="small"
                    sx={{
                      fontSize: "0.6rem",
                      height: 16,
                      bgcolor: "#e8f5e9",
                      color: "#2e7d32",
                    }}
                  />
                )}
              </Stack>
            </Box>
            <Stack direction="row" spacing={0.5} sx={{alignItems:"center"}}>
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
          <Collapse in={expandedBg[bg.id!]}>
            <TaiLieuSection
              baiGiangId={bg.id!}
              items={taiLieuMap[bg.id!] ?? []}
              onRefresh={() => {
                setTaiLieuMap((p) => ({ ...p, [bg.id!]: [] }));
              }}
              canEdit={canEdit}
            />
          </Collapse>
        </Box>
      ))}

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

      {canEdit && adding && (
        <Box
          sx={{
            mt: 1,
            p: 2,
            border: "1px dashed #fcc",
            borderRadius: 2,
            background: "#fffafa",
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1.5, color: R }}>
            {editTarget ? "Sửa bài giảng" : "Bài giảng mới"}
          </Typography>
          <Stack spacing={1.5}>
            <TextField
              size="small"
              label="Tiêu đề"
              fullWidth
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
            />
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                select
                label="Loại"
                sx={{
                  minWidth: 130,
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: R,
                  },
                }}
                value={form.loaiBaiGiang}
                onChange={(e) =>
                  setForm((p) => ({ ...p, loaiBaiGiang: e.target.value }))
                }
              >
                {["Video", "TaiLieu", "Quiz"].map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                label="Thời lượng (giây)"
                type="number"
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: R,
                  },
                }}
                value={form.thoiLuong}
                onChange={(e) =>
                  setForm((p) => ({ ...p, thoiLuong: e.target.value }))
                }
              />
            </Stack>
            {form.loaiBaiGiang === "Video" && (
              <>
                <input
                  ref={videoRef}
                  type="file"
                  accept="video/*"
                  style={{ display: "none" }}
                  onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                />
                <UploadZone onClick={() => videoRef.current?.click()}>
                  <CloudUploadIcon sx={{ color: alpha(R, 0.4), mb: 0.5 }} />
                  <Typography sx={{ fontSize: 12, color: "#888" }}>
                    {videoFile
                      ? videoFile.name
                      : "Chọn file video (MP4, WebM…)"}
                  </Typography>
                </UploadZone>
              </>
            )}
            <Stack direction="row" spacing={1}>
              <OutlineBtn
                size="small"
                onClick={() => {
                  setAdding(false);
                  setEditTarget(null);
                }}
              >
                Hủy
              </OutlineBtn>
              <RedBtn
                size="small"
                onClick={handleSave}
                disabled={!form.tieuDe.trim() || saving}
              >
                {saving ? (
                  <CircularProgress size={14} sx={{ color: "#fff" }} />
                ) : (
                  "Lưu"
                )}
              </RedBtn>
            </Stack>
          </Stack>
        </Box>
      )}

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
        message="Bài giảng sẽ bị xoá vĩnh viễn, bao gồm toàn bộ tài liệu đính kèm."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(null)}
        loading={delLoading}
      />
      {ToastComponent}
    </Box>
  );
}
