/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/instructor/manager-courses/components/PhanSection.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
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
import BaiGiangService from "@/src/services/BaiGiangService";
import { PhanHocType, PhanForm, BaiGiangType } from "../types";
import {
  R,
  RedBtn,
  OutlineBtn,
  PhanRow,
  SectionHeader,
  isCurrentVersion,
  groupVersions,
  extractList,
  resolveApiResult,
  TEXT_DARK,
  TEXT_GRAY,
  BORDER_GRAY,
  SURFACE_SUBTLE,
} from "../types/constants";
import { useToast } from "./useToast";
import { ConfirmDialog } from "./ConfirmDialog";
import { BaiGiangSection } from "./BaiGiangSection";
import { RichTextEditor } from "./RichTextEditor";
import { RenderRichText } from "../utils/sanitize";

const phanSvc = new PhanService();
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

type VersionedPhan = PhanHocType & {
  idBanGhiTruoc?: string | null;
  isBanHienTai?: boolean;
  trangThaiPheDuyet?: string;
};

interface PhanSectionProps {
  khoaHocId: string;
  canEdit?: boolean;
  onStatsChange?: (phanCount: number, baiGiangCount: number) => void;
}

export function PhanSection({
  khoaHocId,
  canEdit = false,
  onStatsChange,
}: PhanSectionProps) {
  const { show, ToastComponent } = useToast();
  const [items, setItems] = useState<VersionedPhan[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [expandedDrafts, setExpandedDrafts] = useState<Record<string, boolean>>(
    {},
  );
  const [adding, setAdding] = useState(false);
  const [editTarget, setEditTarget] = useState<VersionedPhan | null>(null);
  const [form, setForm] = useState<PhanForm>({ tenPhan: "", mieuTa: "" });
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [delLoading, setDelLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{
    el: HTMLElement;
    phan: VersionedPhan;
  } | null>(null);

  const load = useCallback(async () => {
    if (!khoaHocId) return;
    setLoading(true);
    try {
      const res = await phanSvc.GetListPhanManager(khoaHocId);
      const list = extractList<VersionedPhan>(res);
      setItems(list);
      if (onStatsChange) {
        const currentPhans = list.filter((p) => !p.idBanGhiTruoc);
        try {
          const counts = await Promise.all(
            currentPhans.map(async (phan) => {
              try {
                const bgRes = await bgSvc.GetListBaiGiangManager(phan.id!);
                const arr = extractList<BaiGiangType>(bgRes as any);
                return arr.filter((b) => !(b as any).idBanGhiTruoc).length;
              } catch {
                return 0;
              }
            }),
          );
          const total = counts.reduce((s, c) => s + c, 0);
          onStatsChange(currentPhans.length, total);
        } catch {
          onStatsChange(currentPhans.length, 0);
        }
      }
    } catch {
      show("Không thể tải danh sách phần học", "error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [khoaHocId, show, onStatsChange]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const togglePhan = (phanId: string) =>
    setExpanded((p) => ({ ...p, [phanId]: !p[phanId] }));
  const toggleDraftRow = (groupKey: string) =>
    setExpandedDrafts((p) => ({ ...p, [groupKey]: !p[groupKey] }));

  const openAdd = () => {
    if (!canEdit) return;
    setForm({ tenPhan: "", mieuTa: "" });
    setEditTarget(null);
    setAdding(true);
  };
  const openEdit = async (phan: VersionedPhan) => {
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
    if (!canEdit) return;
    if (!form.tenPhan.trim()) {
      show("Vui lòng nhập tên phần học", "error");
      return;
    }
    setSaving(true);
    try {
      const result: any = editTarget
        ? await phanSvc.UpdatePhanHoc({
            idKhoaHoc: khoaHocId,
            id: editTarget.id!,
            tenPhan: form.tenPhan.trim(),
            mieuTa: form.mieuTa,
          } as any)
        : await phanSvc.CreatePhanHoc({
            idKhoaHoc: khoaHocId,
            tenPhan: form.tenPhan.trim(),
            mieuTa: form.mieuTa,
          } as any);

      const { ok, errorMsg } = resolveApiResult(result);
      if (!ok) {
        show(errorMsg ?? "Lỗi khi lưu phần học", "error");
        return;
      }
      show(editTarget ? "Đã cập nhật phần học" : "Đã thêm phần học");
      setAdding(false);
      setEditTarget(null);
      await load();
    } catch (error: any) {
      show(
        error?.response?.data?.message ||
          error?.message ||
          "Lỗi khi lưu phần học",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel || !canEdit) return;
    setDelLoading(true);
    try {
      const result: any = await phanSvc.DeletePhanHoc(confirmDel);
      const { ok, errorMsg } = resolveApiResult(result);
      if (!ok) {
        show(errorMsg ?? "Lỗi khi xoá phần học", "error");
        return;
      }
      show("Đã xoá phần học");
      setConfirmDel(null);
      await load();
    } catch (error: any) {
      show(
        error?.response?.data?.message ||
          error?.message ||
          "Lỗi khi xoá phần học",
        "error",
      );
    } finally {
      setDelLoading(false);
    }
  };

  const groups = groupVersions<VersionedPhan>(items);
  const groupKeys = Object.keys(groups);

  const renderRow = (phan: VersionedPhan, isDraftRow: boolean) => {
    const isOpen = !!expanded[phan.id!];
    const statusInfo = getStatusInfo(phan.trangThaiPheDuyet);
    return (
      <PhanRow key={phan.id}>
        <SectionHeader onClick={() => togglePhan(phan.id!)}>
          <Stack
            component="div"
            direction="row"
            spacing={1}
            sx={{ alignItems: "center" }}
          >
            {isOpen ? (
              <ExpandLessIcon sx={{ color: R, fontSize: 18 }} />
            ) : (
              <ExpandMoreIcon sx={{ color: alpha(R, 0.5), fontSize: 18 }} />
            )}
            <FolderIcon sx={{ color: R, fontSize: 17 }} />
            <Typography
              sx={{ fontWeight: 700, fontSize: 13.5, color: TEXT_DARK }}
            >
              {phan.tenPhan}
            </Typography>
            {isDraftRow && (
              <Chip
                label="Nháp"
                size="small"
                sx={{
                  fontSize: "0.55rem",
                  height: 15,
                  bgcolor: "#fff3e0",
                  color: "#e65100",
                }}
              />
            )}
            {!isDraftRow && isCurrentVersion(phan) && (
              <Chip
                label="Chính"
                size="small"
                sx={{
                  fontSize: "0.55rem",
                  height: 15,
                  bgcolor: "#e8f5e9",
                  color: "#2e7d32",
                }}
              />
            )}
            {phan.trangThaiPheDuyet && (
              <Chip
                label={statusInfo.label}
                size="small"
                sx={{
                  fontSize: "0.55rem",
                  height: 15,
                  bgcolor: statusInfo.bg,
                  color: statusInfo.color,
                }}
              />
            )}
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
            <Box sx={{ px: 2, pb: 1 }}>
              <RenderRichText html={phan.mieuTa} />
            </Box>
          )}
          {isOpen && (
            <BaiGiangSection
              phanId={phan.id!}
              onMutated={load}
              canEdit={canEdit}
            />
          )}
        </Collapse>
      </PhanRow>
    );
  };

  return (
    <Box>
      {loading ? (
        <Stack
          component="div"
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", py: 2 }}
        >
          <CircularProgress size={16} sx={{ color: alpha(R, 0.5) }} />
          <Typography sx={{ fontSize: 12.5, color: TEXT_GRAY }}>
            Đang tải nội dung khóa học…
          </Typography>
        </Stack>
      ) : groupKeys.length === 0 ? (
        <Typography sx={{ fontSize: 12.5, color: TEXT_GRAY, py: 1 }}>
          Chưa có phần học nào
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
            <Box key={key}>
              <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                {hasDraftToggle && (
                  <IconButton
                    size="small"
                    onClick={() => toggleDraftRow(key)}
                    sx={{ mt: 0.75, mr: -0.5, color: alpha(R, 0.6) }}
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

      {canEdit && !adding ? (
        <OutlineBtn startIcon={<AddIcon />} onClick={openAdd} sx={{ mt: 1 }}>
          Thêm phần học
        </OutlineBtn>
      ) : canEdit && adding ? (
        <Box
          sx={{
            mt: 1,
            p: 2,
            border: `1px dashed ${BORDER_GRAY}`,
            borderRadius: 2,
            background: SURFACE_SUBTLE,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1.5, color: R }}>
            {editTarget ? "Sửa phần học" : "Phần học mới"}
          </Typography>
          <Stack spacing={1.5}>
            <TextField
              size="small"
              label="Tên phần *"
              fullWidth
              required
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
            <RichTextEditor
              value={form.mieuTa}
              onChange={(value) => setForm((p) => ({ ...p, mieuTa: value }))}
              placeholder="Mô tả..."
              height={150}
              label="Mô tả"
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
