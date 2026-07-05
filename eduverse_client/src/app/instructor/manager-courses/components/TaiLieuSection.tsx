// src/app/instructor/manager-courses/components/TaiLieuSection.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  CircularProgress,
  Button,
  TextField,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SendIcon from "@mui/icons-material/Send";
import EditNoteIcon from "@mui/icons-material/EditNote";

import TaiLieuService from "@/src/services/TaiLieuService";
import { TaiLieuType } from "@/src/types/TaiLieu/Dto/TaiLieuDto";
import {
  R,
  RH,
  RedBtn,
  OutlineBtn,
  UploadZone,
  TaiLieuRow,
  extractList,
  resolveApiResult,
  getErrMsg,
  TEXT_DARK,
  TEXT_GRAY,
  BORDER_GRAY,
  SURFACE_SUBTLE,
} from "../types/constants";
import { useToast } from "./useToast";
import { ConfirmDialog } from "./ConfirmDialog";

const tlSvc = new TaiLieuService();

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

interface TaiLieuSectionProps {
  baiGiangId: string;
  canEdit?: boolean;
  onMutated?: () => void;
}

export function TaiLieuSection({
  baiGiangId,
  canEdit = false,
  onMutated,
}: TaiLieuSectionProps) {
  const { show, ToastComponent } = useToast();
  const [items, setItems] = useState<TaiLieuType[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [tenTaiLieu, setTenTaiLieu] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [delLoading, setDelLoading] = useState(false);
  const [changingId, setChangingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!baiGiangId) return;
    setLoading(true);
    try {
      const res = await tlSvc.GetListTaiLieuManager(baiGiangId);
      setItems(extractList<TaiLieuType>(res));
    } catch {
      show("Không thể tải danh sách tài liệu", "error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [baiGiangId, show]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!canEdit) return;
    if (!file) {
      show("Vui lòng chọn file tài liệu", "error");
      return;
    }
    if (!tenTaiLieu.trim()) {
      show("Vui lòng nhập tên tài liệu", "error");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("IdBaiGiang", baiGiangId);
      fd.append("Document", file);
      fd.append("TenTaiLieu", tenTaiLieu.trim());
      fd.append("LoaiTaiLieu", file.type.includes("pdf") ? "PDF" : "TaiLieu");
      const result: any = await tlSvc.CreateTaiLieu(fd as any);
      const { ok, errorMsg } = resolveApiResult(result);
      if (!ok) {
        show(errorMsg ?? "Lỗi khi thêm tài liệu", "error");
        return;
      }
      show("Đã thêm tài liệu");
      setAdding(false);
      setFile(null);
      setTenTaiLieu("");
      await load();
      onMutated?.();
    } catch (error: any) {
      show(getErrMsg(error, "Lỗi khi thêm tài liệu"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel || !canEdit) return;
    setDelLoading(true);
    try {
      const result: any = await tlSvc.DeleteTaiLieu(confirmDel);
      const { ok, errorMsg } = resolveApiResult(result);
      if (!ok) {
        show(errorMsg ?? "Lỗi khi xoá tài liệu", "error");
        return;
      }
      show("Đã xoá tài liệu");
      setConfirmDel(null);
      await load();
      onMutated?.();
    } catch (error: any) {
      show(getErrMsg(error, "Lỗi khi xoá tài liệu"), "error");
    } finally {
      setDelLoading(false);
    }
  };

  const updateItemLocal = (id: string, patch: Partial<TaiLieuType>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    );
  };

  const handleChuyenTTChoDuyet = async (tl: TaiLieuType) => {
    if (changingId || !canEdit) return;
    setChangingId(tl.id!);
    try {
      const result: any = await tlSvc.ChuyenTTChoDuyet(tl.id!);
      const { ok, data, errorMsg } = resolveApiResult(result);
      if (!ok) {
        show(errorMsg ?? "Lỗi chuyển trạng thái", "error");
        return;
      }
      updateItemLocal(tl.id!, data ?? { trangThaiPheDuyet: "ChoDuyet" });
      show("Đã gửi tài liệu đi phê duyệt");
      onMutated?.();
    } catch (error: any) {
      show(getErrMsg(error, "Lỗi chuyển trạng thái"), "error");
    } finally {
      setChangingId(null);
    }
  };

  const handleChuyenTTDangSua = async (tl: TaiLieuType) => {
    if (changingId || !canEdit) return;
    setChangingId(tl.id!);
    try {
      const result: any = await tlSvc.ChuyenTTDangSua(tl.id!);
      const { ok, data, errorMsg } = resolveApiResult(result);
      if (!ok) {
        show(errorMsg ?? "Lỗi chuyển trạng thái", "error");
        return;
      }
      updateItemLocal(tl.id!, data ?? { trangThaiPheDuyet: "DangSua" });
      show("Đã chuyển tài liệu sang Đang sửa");
      onMutated?.();
    } catch (error: any) {
      show(getErrMsg(error, "Lỗi chuyển trạng thái"), "error");
    } finally {
      setChangingId(null);
    }
  };

  return (
    <Box sx={{ ml: 2, mt: 1 }}>
      {loading ? (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 1 }}>
          <CircularProgress size={14} sx={{ color: alpha(R, 0.5) }} />
          <Typography sx={{ fontSize: 11.5, color: TEXT_GRAY }}>
            Đang tải tài liệu…
          </Typography>
        </Stack>
      ) : items.length === 0 ? (
        <Typography sx={{ fontSize: 11.5, color: TEXT_GRAY, mb: 0.5 }}>
          Chưa có tài liệu nào
        </Typography>
      ) : (
        items.map((tl) => {
          const statusInfo = getStatusInfo(tl.trangThaiPheDuyet);
          const tlIsDangSua = tl.trangThaiPheDuyet === "DangSua";
          const tlIsChoDuyet = tl.trangThaiPheDuyet === "ChoDuyet";
          const isChangingThis = changingId === tl.id;
          return (
            <Box key={tl.id}>
              <TaiLieuRow>
                <AttachFileIcon
                  sx={{ fontSize: 14, color: alpha(R, 0.5), mr: 1 }}
                />
                <Typography sx={{ fontSize: 12, flex: 1, color: TEXT_DARK }}>
                  {tl.tenTaiLieu ?? tl.url ?? "Tài liệu"}
                </Typography>
                {tl.trangThaiPheDuyet && (
                  <Chip
                    label={statusInfo.label}
                    size="small"
                    sx={{
                      fontSize: "0.6rem",
                      height: 18,
                      mr: 0.5,
                      bgcolor: statusInfo.bg,
                      color: statusInfo.color,
                    }}
                  />
                )}
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
              {canEdit && (tlIsDangSua || tlIsChoDuyet) && (
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ ml: 3.5, mb: 0.5, mt: -0.25 }}
                >
                  {tlIsDangSua && (
                    <Tooltip title="Gửi phê duyệt">
                      <span>
                        <Button
                          size="small"
                          startIcon={<SendIcon sx={{ fontSize: 12 }} />}
                          onClick={() => handleChuyenTTChoDuyet(tl)}
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
                            <CircularProgress
                              size={11}
                              sx={{ color: "#fff" }}
                            />
                          ) : (
                            "Gửi phê duyệt"
                          )}
                        </Button>
                      </span>
                    </Tooltip>
                  )}
                  {tlIsChoDuyet && (
                    <Tooltip title="Chuyển về Đang sửa">
                      <span>
                        <Button
                          size="small"
                          startIcon={<EditNoteIcon sx={{ fontSize: 12 }} />}
                          onClick={() => handleChuyenTTDangSua(tl)}
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
          );
        })
      )}

      {canEdit && adding ? (
        <Box sx={{ mb: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="Tên tài liệu *"
            placeholder="Nhập tên..."
            required
            value={tenTaiLieu}
            onChange={(e) => setTenTaiLieu(e.target.value)}
            sx={{ mb: 1 }}
          />
          <input
            ref={fileRef}
            type="file"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setFile(f);
                if (!tenTaiLieu) setTenTaiLieu(f.name.replace(/\.[^/.]+$/, ""));
              }
            }}
          />
          <UploadZone onClick={() => fileRef.current?.click()}>
            <CloudUploadIcon sx={{ color: alpha(R, 0.4), mb: 0.5 }} />
            <Typography sx={{ fontSize: 12, color: TEXT_GRAY }}>
              {file ? file.name : "Nhấn để chọn file"}
            </Typography>
          </UploadZone>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <OutlineBtn
              size="small"
              onClick={() => {
                setAdding(false);
                setFile(null);
                setTenTaiLieu("");
              }}
            >
              Hủy
            </OutlineBtn>
            <RedBtn
              size="small"
              onClick={handleAdd}
              disabled={!file || !tenTaiLieu.trim() || saving}
            >
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
