// src/app/instructor/manager-courses/components/ConfirmDialog.tsx
"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import { R, RH, OutlineBtn } from "../types/constants";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: R }}>{title}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <OutlineBtn onClick={onCancel}>Hủy</OutlineBtn>
        <Button
          variant="contained"
          sx={{
            bgcolor: R,
            "&:hover": { bgcolor: RH },
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={18} sx={{ color: "#fff" }} />
          ) : (
            "Xác nhận"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
