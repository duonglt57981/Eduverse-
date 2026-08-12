"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import { MAU, LichSuKiemDuyetDto } from "./courseEditCore";

interface Props {
  open: boolean;
  onClose: () => void;
  lichSu: LichSuKiemDuyetDto | null;
}

export default function LichSuKiemDuyetDialog({
  open,
  onClose,
  lichSu,
}: Props) {
  // Chỉ cần quan tâm duy nhất trường lyDo
  const lyDo = lichSu?.lyDo?.trim() || "";
  const coDuLieu = lyDo.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontWeight: 800,
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <HistoryOutlinedIcon sx={{ color: MAU.chinh, fontSize: 22 }} />
          Lý do từ chối
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {!coDuLieu ? (
          <Typography
            sx={{
              fontSize: 13.5,
              color: "#8A7676",
              py: 2,
              textAlign: "center",
            }}
          >
            Chưa có lịch sử kiểm duyệt nào cho khóa học này.
          </Typography>
        ) : (
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: "10px",
              bgcolor: "#FEF2F2",
              border: "1px solid #FEE2E2",
            }}
          >
            <Typography
              sx={{
                fontSize: 13.5,
                color: "#7F1D1D",
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
              }}
            >
              {lyDo}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Chip
          label="Đóng"
          onClick={onClose}
          sx={{
            fontWeight: 700,
            cursor: "pointer",
            bgcolor: MAU.chinh,
            color: "#fff",
            px: 1,
            "&:hover": { bgcolor: MAU.chinhDam },
          }}
        />
      </DialogActions>
    </Dialog>
  );
}
