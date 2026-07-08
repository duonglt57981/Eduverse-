"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import { PhanHocType } from "@/src/types/PhanHoc/Dto/PhanHocdto";
import {
  MAU,
  TrangThaiKhoaHoc,
  kiemTraDieuKienGuiDuyet,
  MucThieu,
} from "./courseEditCore";

interface Props {
  trangThai: TrangThaiKhoaHoc;
  thongTinKhoaHoc: KhoaHocType;
  phans: PhanHocType[];
  lyDoTuChoi?: string | null;
  onGuiPheDuyet: () => Promise<void>;
  onSuaTiep: () => Promise<void>;
  onDiChuyenDen: (diChuyenDen: MucThieu["diChuyenDen"]) => void;
}

export default function CourseStatusAction({
  trangThai,
  thongTinKhoaHoc,
  phans,
  lyDoTuChoi,
  onGuiPheDuyet,
  onSuaTiep,
  onDiChuyenDen,
}: Props) {
  const [dangXuLy, setDangXuLy] = useState(false);
  const [moPopupThieu, setMoPopupThieu] = useState(false);
  const [danhSachThieu, setDanhSachThieu] = useState<MucThieu[]>([]);

  const xuLyBamGuiPheDuyet = async () => {
    const ketQua = kiemTraDieuKienGuiDuyet(thongTinKhoaHoc, phans);
    if (!ketQua.hopLe) {
      setDanhSachThieu(ketQua.danhSachThieu);
      setMoPopupThieu(true);
      return;
    }
    try {
      setDangXuLy(true);
      await onGuiPheDuyet();
    } finally {
      setDangXuLy(false);
    }
  };

  const xuLyBamSuaTiep = async () => {
    try {
      setDangXuLy(true);
      await onSuaTiep();
    } finally {
      setDangXuLy(false);
    }
  };

  const dongPopupVaDiChuyen = (diChuyenDen: MucThieu["diChuyenDen"]) => {
    setMoPopupThieu(false);
    onDiChuyenDen(diChuyenDen);
  };

  if (trangThai === "DangDuyet") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <LockOutlinedIcon sx={{ fontSize: 18, color: "#bbb" }} />
        <Typography sx={{ fontSize: 13, color: "#bbb" }}>
          Đang được duyệt — không thể chỉnh sửa
        </Typography>
      </Box>
    );
  }

  if (trangThai === "TuChoi") {
    return (
      <Typography sx={{ fontSize: 13, color: "#ffb4b4", maxWidth: 360 }}>
        Bị từ chối{lyDoTuChoi ? `: ${lyDoTuChoi}` : "."}
      </Typography>
    );
  }

  if (trangThai === "DaDuyet") {
    return (
      <Typography sx={{ fontSize: 13, color: "#8be0a6" }}>
        Khóa học đã được duyệt
      </Typography>
    );
  }

  if (trangThai === "ChoDuyet") {
    return (
      <Button
        variant="outlined"
        onClick={xuLyBamSuaTiep}
        disabled={dangXuLy}
        sx={{
          textTransform: "none",
          fontWeight: 700,
          color: "#fff",
          borderColor: "rgba(255,255,255,0.4)",
          "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
        }}
      >
        {dangXuLy ? (
          <CircularProgress size={18} sx={{ color: "#fff" }} />
        ) : (
          "Sửa tiếp"
        )}
      </Button>
    );
  }

  // Mặc định: trạng thái "Đang sửa" hoặc chưa xác định
  return (
    <>
      <Button
        variant="contained"
        onClick={xuLyBamGuiPheDuyet}
        disabled={dangXuLy}
        sx={{
          bgcolor: MAU.chinh,
          textTransform: "none",
          fontWeight: 700,
          px: 3,
          boxShadow: "none",
          "&:hover": { bgcolor: MAU.chinhDam, boxShadow: "none" },
        }}
      >
        {dangXuLy ? (
          <CircularProgress size={18} sx={{ color: "#fff" }} />
        ) : (
          "Gửi Phê Duyệt"
        )}
      </Button>

      <Dialog
        open={moPopupThieu}
        onClose={() => setMoPopupThieu(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 700,
          }}
        >
          Hoàn thiện khóa học trước khi gửi duyệt
          <IconButton size="small" onClick={() => setMoPopupThieu(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Khóa học chưa đáp ứng đủ điều kiện để gửi duyệt. Vui lòng hoàn thiện
            các mục dưới đây.
          </Alert>

          <List disablePadding>
            {danhSachThieu.map((muc) => (
              <ListItem
                key={muc.id}
                sx={{
                  alignItems: "flex-start",
                  border: `1px solid ${MAU.vien}`,
                  borderRadius: "10px",
                  mb: 1.5,
                  cursor: "pointer",
                  "&:hover": { bgcolor: MAU.chinhNhat },
                }}
                onClick={() => dongPopupVaDiChuyen(muc.diChuyenDen)}
              >
                <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                  <ErrorOutlineIcon sx={{ color: MAU.canhBaoChu }} />
                </ListItemIcon>
                <ListItemText
                  primary={muc.nhan}
                  secondary={muc.moTa}
                  slotProps={{
                    primary: { sx: { fontWeight: 700, fontSize: 14.5 } },
                    secondary: { sx: { fontSize: 13 } },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setMoPopupThieu(false)}
            sx={{ textTransform: "none", color: MAU.chuXam }}
          >
            Để sau
          </Button>
          {danhSachThieu[0] && (
            <Button
              variant="contained"
              onClick={() => dongPopupVaDiChuyen(danhSachThieu[0].diChuyenDen)}
              sx={{
                bgcolor: MAU.chinh,
                textTransform: "none",
                fontWeight: 700,
                "&:hover": { bgcolor: MAU.chinhDam },
              }}
            >
              Đi hoàn thiện ngay
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
