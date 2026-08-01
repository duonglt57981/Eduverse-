"use client";

import { useState, useMemo } from "react";
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
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { PhanHocType } from "@/src/types/PhanHoc/Dto/PhanHocdto";
import {
  MAU,
  TrangThaiKhoaHoc,
  kiemTraDieuKienGuiDuyet,
  MucThieu,
  kiemTraCoBanGhiDangSua,
  ThongTinKhoaHocCoBan,
} from "./courseEditCore";

interface Props {
  trangThai: TrangThaiKhoaHoc;
  thongTinKhoaHoc: ThongTinKhoaHocCoBan;
  phans: PhanHocType[];
  lyDoTuChoi?: string | null;
  onGuiPheDuyet: () => Promise<void>;
  onDiChuyenDen: (diChuyenDen: MucThieu["diChuyenDen"]) => void;
}

export default function CourseStatusAction({
  trangThai,
  thongTinKhoaHoc,
  phans,
  lyDoTuChoi,
  onGuiPheDuyet,
  onDiChuyenDen,
}: Props) {
  const [dangXuLy, setDangXuLy] = useState(false);
  const [moPopupThieu, setMoPopupThieu] = useState(false);
  const [danhSachThieu, setDanhSachThieu] = useState<MucThieu[]>([]);

  const { coDangSua, chiTiet } = useMemo(() => {
    return kiemTraCoBanGhiDangSua(thongTinKhoaHoc, phans);
  }, [thongTinKhoaHoc, phans]);

  const dangSuaList = useMemo((): string[] => {
    const list: string[] = [];
    if (chiTiet.khoaHoc) list.push("Khóa học");
    if (chiTiet.baiGiang) list.push("Bài giảng");
    if (chiTiet.taiLieu) list.push("Tài liệu");
    if (chiTiet.baiKiemTra) list.push("Bài kiểm tra");
    if (chiTiet.cauHoi) list.push("Câu hỏi");
    if (chiTiet.dapAn) list.push("Đáp án");
    return list;
  }, [chiTiet]);

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

  if (trangThai === "ChoDuyet") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <LockOutlinedIcon sx={{ fontSize: 18, color: "#FFB74D" }} />
        <Typography sx={{ fontSize: 13, color: "#FFB74D" }}>
          ⏳ Đang chờ phê duyệt — không thể chỉnh sửa
        </Typography>
      </Box>
    );
  }

  if (trangThai === "TuChoi") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Typography sx={{ fontSize: 13, color: "#ffb4b4", maxWidth: 360 }}>
          Bị từ chối{lyDoTuChoi ? `: ${lyDoTuChoi}` : "."}
        </Typography>
        <Typography sx={{ fontSize: 13, color: "var(--ev-text-muted, #8A93A3)" }}>
          Vui lòng chỉnh sửa và gửi lại
        </Typography>
      </Box>
    );
  }

  if (trangThai === "DaDuyet") {
    return (
      <Typography sx={{ fontSize: 13, color: "#8be0a6" }}>
        Khóa học đã được duyệt
      </Typography>
    );
  }

  const isDisabled = !coDangSua || trangThai !== "DangSua";

  return (
    <>
      <Tooltip
        title={
          isDisabled ? (
            <Box sx={{ p: 1 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, mb: 0.5, color: "#fff" }}
              >
                Không có nội dung nào ở trạng thái Đang sửa
              </Typography>
              <Typography
                variant="caption"
                sx={{ display: "block", color: "#aaa" }}
              >
                Cần ít nhất một bản ghi ở trạng thái Đang sửa để gửi duyệt.
              </Typography>
              <Typography
                variant="caption"
                sx={{ display: "block", color: "#888", mt: 0.5 }}
              >
                Các loại cần kiểm tra: Khóa học, Bài giảng, Tài liệu, Bài kiểm
                tra, Câu hỏi, Đáp án
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 1 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, mb: 0.5, color: "#fff" }}
              >
                Đang có các mục ở trạng thái Đang sửa:
              </Typography>
              {dangSuaList.map((item) => (
                <Typography
                  key={item}
                  variant="caption"
                  sx={{ display: "block", color: "#ddd" }}
                >
                  • {item}
                </Typography>
              ))}
            </Box>
          )
        }
        placement="bottom"
        arrow
        slotProps={{
          tooltip: {
            sx: {
              bgcolor: "#1c1d1f",
              maxWidth: 320,
              borderRadius: "8px",
              p: 1,
            },
          },
        }}
      >
        <span>
          <Button
            variant="contained"
            onClick={xuLyBamGuiPheDuyet}
            disabled={isDisabled || dangXuLy}
            sx={{
              bgcolor: MAU.chinh,
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              boxShadow: "none",
              opacity: isDisabled ? 0.5 : 1,
              "&:hover": {
                bgcolor: isDisabled ? MAU.chinh : MAU.chinhDam,
                boxShadow: "none",
              },
              "&.Mui-disabled": {
                bgcolor: MAU.chinh,
                opacity: 0.5,
                color: "#fff",
              },
            }}
          >
            {dangXuLy ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              "Gửi Phê Duyệt"
            )}
          </Button>
        </span>
      </Tooltip>

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
          {danhSachThieu.length > 0 && (
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
