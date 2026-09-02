/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CSSVAR, STATUS } from "@/src/theme/tokens";
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
  Snackbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import UndoIcon from "@mui/icons-material/Undo";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
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
  laChuSoHuu?: boolean;
  onGuiPheDuyet: () => Promise<void>;
  onHuyPheDuyet?: () => Promise<void>;
  onDiChuyenDen: (diChuyenDen: MucThieu["diChuyenDen"]) => void;
}

export default function CourseStatusAction({
  trangThai,
  thongTinKhoaHoc,
  phans,
  lyDoTuChoi,
  laChuSoHuu = true,
  onGuiPheDuyet,
  onHuyPheDuyet,
  onDiChuyenDen,
}: Props) {
  const [dangXuLy, setDangXuLy] = useState(false);
  const [moPopupThieu, setMoPopupThieu] = useState(false);
  const [danhSachThieu, setDanhSachThieu] = useState<MucThieu[]>([]);
  const [moDialogHuyDuyet, setMoDialogHuyDuyet] = useState(false);
  const [dangHuyDuyet, setDangHuyDuyet] = useState(false);
  const [loiGuiDuyet, setLoiGuiDuyet] = useState<string | null>(null);

  const xuLyXacNhanHuyDuyet = async () => {
    if (!onHuyPheDuyet) return;
    try {
      setDangHuyDuyet(true);
      await onHuyPheDuyet();
      setMoDialogHuyDuyet(false);
    } finally {
      setDangHuyDuyet(false);
    }
  };

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
    if (!laChuSoHuu) {
      setLoiGuiDuyet("Chỉ giảng viên chủ sở hữu mới có quyền gửi phê duyệt khóa học.");
      return;
    }
    const ketQua = kiemTraDieuKienGuiDuyet(thongTinKhoaHoc, phans);
    if (!ketQua.hopLe) {
      setDanhSachThieu(ketQua.danhSachThieu);
      setMoPopupThieu(true);
      return;
    }
    try {
      setDangXuLy(true);
      setLoiGuiDuyet(null);
      await onGuiPheDuyet();
    } catch (err: any) {
      setLoiGuiDuyet(
        err?.response?.data?.message ||
          err?.message ||
          "Gửi phê duyệt thất bại",
      );
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
      <>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <LockOutlinedIcon sx={{ fontSize: 18, color: "#FFB74D" }} />
            <Typography
              sx={{ fontSize: 13, color: "#FFB74D", fontWeight: 600 }}
            >
              Đang chờ phê duyệt
            </Typography>
          </Box>
          {onHuyPheDuyet && laChuSoHuu && (
            <Button
              variant="contained"
              onClick={() => setMoDialogHuyDuyet(true)}
              startIcon={<UndoIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: STATUS.warningDark,
                color: "#ffffff",
                textTransform: "none",
                fontWeight: 700,
                fontSize: 13,
                px: 2,
                py: 0.7,
                borderRadius: "8px",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "#B45309",
                  boxShadow: "none",
                },
              }}
            >
              Hủy duyệt
            </Button>
          )}
        </Box>

        {/* Dialog xác nhận hủy duyệt */}
        <Dialog
          open={moDialogHuyDuyet}
          onClose={() => !dangHuyDuyet && setMoDialogHuyDuyet(false)}
          maxWidth="xs"
          fullWidth
          slotProps={{
            paper: { sx: { borderRadius: "14px" } },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              fontWeight: 800,
              fontSize: 17,
              color: MAU.chuDen,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                bgcolor: "#FEF3C7",
                color: STATUS.warningDark,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <WarningAmberRoundedIcon fontSize="small" />
            </Box>
            Hủy yêu cầu phê duyệt?
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: MAU.chuXam, fontSize: 14 }}>
              Bạn có chắc chắn muốn hủy yêu cầu phê duyệt khóa học này không?
              Khóa học sẽ được chuyển về trạng thái &quot;Đang sửa&quot;.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              onClick={() => setMoDialogHuyDuyet(false)}
              disabled={dangHuyDuyet}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: MAU.chuXam,
              }}
            >
              Đóng
            </Button>
            <Button
              onClick={xuLyXacNhanHuyDuyet}
              variant="contained"
              disabled={dangHuyDuyet}
              sx={{
                bgcolor: STATUS.warningDark,
                textTransform: "none",
                fontWeight: 700,
                "&:hover": { bgcolor: "#B45309" },
              }}
            >
              {dangHuyDuyet ? (
                <CircularProgress size={16} sx={{ color: "#fff" }} />
              ) : (
                "Xác nhận hủy"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  if (trangThai === "TuChoi") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {/* <Typography sx={{ fontSize: 13, color: "#ffb4b4", maxWidth: 360 }}>
          Bị từ chối{lyDoTuChoi ? `: ${lyDoTuChoi}` : "."}
        </Typography> */}
        <Typography sx={{ fontSize: 13, color: CSSVAR.textMuted }}>
          Vui lòng chỉnh sửa và gửi lại
        </Typography>
      </Box>
    );
  }

  if (trangThai === "XemXet") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <WarningAmberRoundedIcon sx={{ fontSize: 18, color: "#9D174D" }} />
        <Typography sx={{ fontSize: 13, color: "#9D174D", fontWeight: 600 }}>
          Vi phạm
        </Typography>
        <Typography
          sx={{ fontSize: 13, color: "var(--ev-text-muted, #8A7676)" }}
        >
          — Vui lòng chỉnh sửa và gửi lại
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

  if (!laChuSoHuu && trangThai === "DangSua") {
    return (
      <Tooltip
        title="Chỉ giảng viên chủ sở hữu mới có quyền gửi phê duyệt khóa học"
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
            disabled
            sx={{
              bgcolor: MAU.chinh,
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              boxShadow: "none",
              opacity: 0.5,
              "&.Mui-disabled": {
                bgcolor: MAU.chinh,
                opacity: 0.5,
                color: "#fff",
              },
            }}
          >
            Gửi Phê Duyệt
          </Button>
        </span>
      </Tooltip>
    );
  }

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
      <Snackbar
        open={!!loiGuiDuyet}
        autoHideDuration={6000}
        onClose={() => setLoiGuiDuyet(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="error"
          onClose={() => setLoiGuiDuyet(null)}
          sx={{ width: "100%" }}
        >
          {loiGuiDuyet}
        </Alert>
      </Snackbar>
    </>
  );
}
