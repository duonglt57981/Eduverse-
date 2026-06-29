// src/app/instructor/manager-courses/components/PhanSection.tsx
"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Stack,
  CircularProgress,
  TextField,
  MenuItem,
  Menu,
  Collapse,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FolderIcon from "@mui/icons-material/Folder";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import PhanService from "@/src/services/PhanService";
import { PhanHocType, BaiGiangType, PhanForm } from "../types";
import {
  R,
  RedBtn,
  OutlineBtn,
  PhanRow,
  SectionHeader,
} from "../types/constants";
import { useToast } from "./useToast";
import { ConfirmDialog } from "./ConfirmDialog";
import { BaiGiangSection } from "./BaiGiangSection";

const phanSvc = new PhanService();

interface PhanSectionProps {
  khoaHocId: string;
  items: PhanHocType[];
  onRefresh: () => void;
  canEdit?: boolean;
}

export function PhanSection({
  khoaHocId,
  items,
  onRefresh,
  canEdit = false,
}: PhanSectionProps) {
  const { show, ToastComponent } = useToast();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [baiGiangMap, setBaiGiangMap] = useState<
    Record<string, BaiGiangType[]>
  >({});
  const [adding, setAdding] = useState(false);
  const [editTarget, setEditTarget] = useState<PhanHocType | null>(null);
  const [form, setForm] = useState<PhanForm>({ tenPhan: "", mieuTa: "" });
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [delLoading, setDelLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{
    el: HTMLElement;
    phan: PhanHocType;
  } | null>(null);

  const togglePhan = (phanId: string, phan: PhanHocType) => {
    setExpanded((p) => ({ ...p, [phanId]: !p[phanId] }));
    if (!baiGiangMap[phanId] && phan.danhSachBaiGiang) {
      setBaiGiangMap((p) => ({ ...p, [phanId]: phan.danhSachBaiGiang ?? [] }));
    }
  };

  const openAdd = () => {
    if (!canEdit) return;
    setForm({ tenPhan: "", mieuTa: "" });
    setEditTarget(null);
    setAdding(true);
  };

  const openEdit = async (phan: PhanHocType) => {
    if (!canEdit) return;
    try {
      const res = await phanSvc.GetToUpdatePhan(phan.id!);
      const data = res.data as any;
      setForm({
        tenPhan: data?.tenPhan ?? phan.tenPhan ?? "",
        mieuTa: data?.mieuTa ?? phan.mieuTa ?? "",
      });
    } catch {
      setForm({ tenPhan: phan.tenPhan ?? "", mieuTa: phan.mieuTa ?? "" });
    }
    setEditTarget(phan);
    setAdding(true);
    setMenuAnchor(null);
  };

  const handleSave = async () => {
    if (!form.tenPhan.trim()) return;
    setSaving(true);
    try {
      if (editTarget) {
        await phanSvc.UpdatePhanHoc({
          id: editTarget.id!,
          tenPhan: form.tenPhan,
          mieuTa: form.mieuTa,
        } as any);
        show("Đã cập nhật phần học");
      } else {
        await phanSvc.CreatePhanHoc({
          idKhoaHoc: khoaHocId,
          tenPhan: form.tenPhan,
          mieuTa: form.mieuTa,
        } as any);
        show("Đã thêm phần học");
      }
      setAdding(false);
      setEditTarget(null);
      onRefresh();
    } catch {
      show("Lỗi khi lưu phần học", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    setDelLoading(true);
    try {
      await phanSvc.DeletePhanHoc(confirmDel);
      show("Đã xoá phần học");
      setConfirmDel(null);
      onRefresh();
    } catch {
      show("Lỗi khi xoá phần học", "error");
    } finally {
      setDelLoading(false);
    }
  };

  return (
    <Box>
      {items.map((phan) => {
        const isOpen = expanded[phan.id!];
        const baiGiangs = baiGiangMap[phan.id!] ?? phan.danhSachBaiGiang ?? [];
        return (
          <PhanRow key={phan.id}>
            <SectionHeader onClick={() => togglePhan(phan.id!, phan)}>
              <Stack direction="row" spacing={1} alignItems="center">
                {isOpen ? (
                  <ExpandLessIcon sx={{ color: R, fontSize: 18 }} />
                ) : (
                  <ExpandMoreIcon sx={{ color: alpha(R, 0.5), fontSize: 18 }} />
                )}
                <FolderIcon sx={{ color: R, fontSize: 17 }} />
                <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>
                  {phan.tenPhan}
                </Typography>
                {phan.danhSachBaiGiang?.length ? (
                  <Chip
                    label={`${phan.danhSachBaiGiang.length} bài`}
                    size="small"
                    sx={{
                      fontSize: "0.65rem",
                      height: 18,
                      bgcolor: alpha(R, 0.08),
                      color: R,
                    }}
                  />
                ) : null}
              </Stack>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuAnchor({ el: e.currentTarget, phan });
                }}
                disabled={!canEdit}
                sx={{ opacity: canEdit ? 1 : 0.3 }}
              >
                <MoreVertIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </SectionHeader>

            <Collapse in={isOpen}>
              {phan.mieuTa && (
                <Typography sx={{ fontSize: 12, color: "#888", px: 2, pb: 1 }}>
                  {phan.mieuTa}
                </Typography>
              )}
              <BaiGiangSection
                phanId={phan.id!}
                items={baiGiangs}
                onRefresh={onRefresh}
                canEdit={canEdit}
              />
            </Collapse>
          </PhanRow>
        );
      })}

      {canEdit && !adding ? (
        <OutlineBtn startIcon={<AddIcon />} onClick={openAdd} sx={{ mt: 1 }}>
          Thêm phần học
        </OutlineBtn>
      ) : canEdit && adding ? (
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
            {editTarget ? "Sửa phần học" : "Phần học mới"}
          </Typography>
          <Stack spacing={1.5}>
            <TextField
              size="small"
              label="Tên phần"
              fullWidth
              value={form.tenPhan}
              onChange={(e) =>
                setForm((p) => ({ ...p, tenPhan: e.target.value }))
              }
              sx={{
                "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                  borderColor: R,
                },
                "& label.Mui-focused": { color: R },
              }}
            />
            <TextField
              size="small"
              label="Mô tả (tuỳ chọn)"
              fullWidth
              multiline
              rows={2}
              value={form.mieuTa}
              onChange={(e) =>
                setForm((p) => ({ ...p, mieuTa: e.target.value }))
              }
              sx={{
                "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                  borderColor: R,
                },
                "& label.Mui-focused": { color: R },
              }}
            />
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
                disabled={!form.tenPhan.trim() || saving}
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
      ) : null}

      <Menu
        open={!!menuAnchor}
        anchorEl={menuAnchor?.el}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => menuAnchor && openEdit(menuAnchor.phan)}
          disabled={!canEdit}
        >
          <EditIcon sx={{ fontSize: 16, mr: 1 }} /> Sửa phần học
        </MenuItem>
        <MenuItem
          sx={{ color: R }}
          onClick={() => {
            if (menuAnchor) {
              setConfirmDel(menuAnchor.phan.id!);
              setMenuAnchor(null);
            }
          }}
          disabled={!canEdit}
        >
          <DeleteIcon sx={{ fontSize: 16, mr: 1 }} /> Xoá phần học
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={!!confirmDel}
        title="Xoá phần học"
        message="Toàn bộ bài giảng và tài liệu trong phần này sẽ bị xoá."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(null)}
        loading={delLoading}
      />
      {ToastComponent}
    </Box>
  );
}
