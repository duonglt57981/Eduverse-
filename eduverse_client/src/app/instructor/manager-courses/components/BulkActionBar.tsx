// src/app/instructor/manager-courses/components/BulkActionBar.tsx
"use client";

import {
  Box,
  Button,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SendIcon from "@mui/icons-material/Send";
import EditNoteIcon from "@mui/icons-material/EditNote";
import CloseIcon from "@mui/icons-material/Close";
import { R, TEXT_DARK } from "../types/constants";

interface BulkActionBarProps {
  selectedCount: number;
  approvableCount: number;
  editableCount: number;
  onApprove: () => void;
  onContinueEdit: () => void;
  onClear: () => void;
  loading?: boolean;
  itemLabel?: string;
}

export function BulkActionBar({
  selectedCount,
  approvableCount,
  editableCount,
  onApprove,
  onContinueEdit,
  onClear,
  loading = false,
  itemLabel = "mục",
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        px: 1.5,
        py: 1,
        mb: 1,
        borderRadius: "999px",
        bgcolor: TEXT_DARK,
        flexWrap: "wrap",
        animation: "bulkBarIn 0.15s ease",
        "@keyframes bulkBarIn": {
          from: { opacity: 0, transform: "translateY(-4px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            bgcolor: R,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {selectedCount}
        </Box>
        <Typography sx={{ fontSize: 12.5, color: "#fff", fontWeight: 600 }}>
          {itemLabel} đã chọn
        </Typography>
      </Stack>

      <Stack direction="row" spacing={0.75} alignItems="center">
        {loading && <CircularProgress size={15} sx={{ color: "#fff" }} />}
        <Button
          size="small"
          startIcon={<SendIcon sx={{ fontSize: 14 }} />}
          onClick={onApprove}
          disabled={approvableCount === 0 || loading}
          sx={{
            bgcolor: approvableCount === 0 ? alpha("#fff", 0.08) : "#fff",
            color: approvableCount === 0 ? alpha("#fff", 0.4) : R,
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.72rem",
            py: 0.4,
            px: 1.4,
            borderRadius: "999px",
            "&:hover": {
              bgcolor: approvableCount === 0 ? undefined : "#f3e4e4",
            },
          }}
        >
          Gửi phê duyệt{approvableCount > 0 ? ` (${approvableCount})` : ""}
        </Button>
        <Button
          size="small"
          startIcon={<EditNoteIcon sx={{ fontSize: 14 }} />}
          onClick={onContinueEdit}
          disabled={editableCount === 0 || loading}
          sx={{
            bgcolor: "transparent",
            color: editableCount === 0 ? alpha("#fff", 0.35) : "#fff",
            border: `1px solid ${editableCount === 0 ? alpha("#fff", 0.15) : alpha("#fff", 0.5)}`,
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.72rem",
            py: 0.4,
            px: 1.4,
            borderRadius: "999px",
            "&:hover": {
              bgcolor: editableCount === 0 ? undefined : alpha("#fff", 0.1),
            },
          }}
        >
          Sửa tiếp{editableCount > 0 ? ` (${editableCount})` : ""}
        </Button>
        <Button
          size="small"
          onClick={onClear}
          disabled={loading}
          sx={{
            minWidth: 0,
            width: 26,
            height: 26,
            p: 0,
            borderRadius: "50%",
            color: alpha("#fff", 0.7),
            "&:hover": { bgcolor: alpha("#fff", 0.12) },
          }}
        >
          <CloseIcon sx={{ fontSize: 15 }} />
        </Button>
      </Stack>
    </Box>
  );
}
