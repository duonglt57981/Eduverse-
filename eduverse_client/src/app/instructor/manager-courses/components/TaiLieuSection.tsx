// src/app/instructor/manager-courses/components/TaiLieuSection.tsx
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
  Button,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import TaiLieuService from "@/src/services/TaiLieuService";
import { TaiLieuType } from "@/src/types/TaiLieu/Dto/TaiLieuDto";
import {
  R,
  RedBtn,
  OutlineBtn,
  UploadZone,
  TaiLieuRow,
} from "../types/constants";
import { useToast } from "./useToast";
import { ConfirmDialog } from "./ConfirmDialog";

const tlSvc = new TaiLieuService();

interface TaiLieuSectionProps {
  baiGiangId: string;
  items: TaiLieuType[];
  onRefresh: () => void;
  canEdit?: boolean;
}

export function TaiLieuSection({
  baiGiangId,
  items,
  onRefresh,
  canEdit = false,
}: TaiLieuSectionProps) {
  const { show, ToastComponent } = useToast();
  const [adding, setAdding] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [delLoading, setDelLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAdd = async () => {
    if (!file) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("IdBaiGiang", baiGiangId);
      fd.append("Document", file);
      fd.append("TenTaiLieu", file.name);
      fd.append("LoaiTaiLieu", file.type.includes("pdf") ? "PDF" : "TaiLieu");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await tlSvc.CreateTaiLieu(fd as any);
      show("Đã thêm tài liệu");
      setAdding(false);
      setFile(null);
      onRefresh();
    } catch {
      show("Lỗi khi thêm tài liệu", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    setDelLoading(true);
    try {
      await tlSvc.DeleteTaiLieu(confirmDel);
      show("Đã xoá tài liệu");
      setConfirmDel(null);
      onRefresh();
    } catch {
      show("Lỗi khi xoá", "error");
    } finally {
      setDelLoading(false);
    }
  };

  return (
    <Box sx={{ ml: 2, mt: 1 }}>
      {items.map((tl) => (
        <TaiLieuRow key={tl.id}>
          <AttachFileIcon sx={{ fontSize: 14, color: alpha(R, 0.5), mr: 1 }} />
          <Typography sx={{ fontSize: 12, flex: 1, color: "#555" }}>
            {tl.tenTaiLieu ?? tl.url ?? "Tài liệu"}
          </Typography>
          <Chip
            label={tl.loaiTaiLieu ?? "File"}
            size="small"
            sx={{
              fontSize: "0.65rem",
              height: 18,
              mr: 1,
              bgcolor: "#fff0f0",
              color: R,
            }}
          />
          {canEdit && (
            <Tooltip title="Xoá">
              <IconButton
                size="small"
                onClick={() => setConfirmDel(tl.id!)}
                sx={{ color: alpha(R, 0.6), "&:hover": { color: R } }}
              >
                <DeleteIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          )}
        </TaiLieuRow>
      ))}

      {canEdit && adding ? (
        <Box sx={{ mb: 1 }}>
          <input
            ref={fileRef}
            type="file"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <UploadZone onClick={() => fileRef.current?.click()}>
            <CloudUploadIcon sx={{ color: alpha(R, 0.4), mb: 0.5 }} />
            <Typography sx={{ fontSize: 12, color: "#888" }}>
              {file ? file.name : "Nhấn để chọn file"}
            </Typography>
          </UploadZone>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <OutlineBtn
              size="small"
              onClick={() => {
                setAdding(false);
                setFile(null);
              }}
            >
              Hủy
            </OutlineBtn>
            <RedBtn size="small" onClick={handleAdd} disabled={!file || saving}>
              {saving ? (
                <CircularProgress size={14} sx={{ color: "#fff" }} />
              ) : (
                "Lưu"
              )}
            </RedBtn>
          </Stack>
        </Box>
      ) : canEdit && !adding ? (
        <Button
          size="small"
          startIcon={<AddIcon />}
          sx={{
            fontSize: "0.72rem",
            color: alpha(R, 0.7),
            textTransform: "none",
            mt: 0.5,
          }}
          onClick={() => setAdding(true)}
        >
          Thêm tài liệu
        </Button>
      ) : null}

      <ConfirmDialog
        open={!!confirmDel}
        title="Xoá tài liệu"
        message="Bạn chắc chắn muốn xoá tài liệu này?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(null)}
        loading={delLoading}
      />
      {ToastComponent}
    </Box>
  );
}
