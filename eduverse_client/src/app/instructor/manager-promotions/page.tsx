"use client";
import { LAYOUT_SPACING, MAU } from "@/src/theme/tokens";

import AuthGuard from "@/src/components/AuthGuard";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Stack,
  Tooltip,
} from "@mui/material";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { useCallback, useEffect, useState } from "react";
import KhuyenMaiService, {
  KhuyenMaiDto,
} from "@/src/services/KhuyenMaiService";
import KhoaHocService, { KhoaHocMiniDto } from "@/src/services/KhoaHocService";

function conHieuLuc(km: KhuyenMaiDto): boolean {
  if (!km.ngayKetThuc) return true;
  return new Date(km.ngayKetThuc).getTime() >= Date.now();
}

interface KhuyenMaiForm {
  maGiamGia: string;
  phanTramGiam: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  soLuongHieuLuc: string;
  idsKhoaHoc: string[];
}

const formRong: KhuyenMaiForm = {
  maGiamGia: "",
  phanTramGiam: "",
  ngayBatDau: "",
  ngayKetThuc: "",
  soLuongHieuLuc: "",
  idsKhoaHoc: [],
};

function QuanLyKhuyenMaiContent() {
  const [danhSach, setDanhSach] = useState<KhuyenMaiDto[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);
  const [thanhCong, setThanhCong] = useState<string | null>(null);

  const [moForm, setMoForm] = useState(false);
  const [dangSua, setDangSua] = useState<KhuyenMaiDto | null>(null);
  const [form, setForm] = useState<KhuyenMaiForm>(formRong);
  const [dangLuu, setDangLuu] = useState(false);

  const [khoaHocDaDuyet, setKhoaHocDaDuyet] = useState<KhoaHocMiniDto[]>([]);
  const [dangTaiKhoaHoc, setDangTaiKhoaHoc] = useState(false);

  const [xacNhanXoa, setXacNhanXoa] = useState<KhuyenMaiDto | null>(null);
  const [dangXoa, setDangXoa] = useState(false);

  const [khuyenMaiSvc] = useState(() => new KhuyenMaiService());
  const [khoaHocSvc] = useState(() => new KhoaHocService());

  const taiDanhSach = useCallback(async () => {
    setDangTai(true);
    setLoi(null);
    try {
      const res = await khuyenMaiSvc.GetListAll();
      if (res.status === false) {
        setLoi(res.message || "Không tải được danh sách mã giảm giá");
        return;
      }
      setDanhSach(res.data ?? []);
    } catch (err) {
      console.error(err);
      setLoi("Đã xảy ra lỗi khi tải danh sách mã giảm giá");
    } finally {
      setDangTai(false);
    }
  }, [khuyenMaiSvc]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    taiDanhSach();
  }, [taiDanhSach]);

  const taiKhoaHocDaDuyet = useCallback(async () => {
    setDangTaiKhoaHoc(true);
    try {
      const res = await khoaHocSvc.GetApprovedListForSelect();
      if (res.status === false) {
        setLoi(res.message || "Không tải được danh sách khóa học đã duyệt");
        return;
      }
      const rawData = res.data ?? [];
      const uniqueMap = new Map<string, KhoaHocMiniDto>();
      for (const item of rawData) {
        const key = item.id || item.tieuDe;
        if (key && !uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      }
      setKhoaHocDaDuyet(Array.from(uniqueMap.values()));
    } catch (err) {
      console.error(err);
      setLoi("Đã xảy ra lỗi khi tải danh sách khóa học");
    } finally {
      setDangTaiKhoaHoc(false);
    }
  }, [khoaHocSvc]);

  const moTaoMoi = () => {
    setDangSua(null);
    setForm(formRong);
    setMoForm(true);
    taiKhoaHocDaDuyet();
  };

  const moSua = (km: KhuyenMaiDto) => {
    setDangSua(km);
    setForm({
      maGiamGia: km.maGiamGia ?? "",
      phanTramGiam: String(km.phanTramGiam ?? ""),
      ngayBatDau: km.ngayBatDau ? km.ngayBatDau.slice(0, 10) : "",
      ngayKetThuc: km.ngayKetThuc ? km.ngayKetThuc.slice(0, 10) : "",
      soLuongHieuLuc:
        km.soLuongHieuLuc != null ? String(km.soLuongHieuLuc) : "",
      idsKhoaHoc: (km.danhSachKhoaHoc ?? []).map((c) => c.id),
    });
    setMoForm(true);
    taiKhoaHocDaDuyet();
  };

  const dongForm = () => {
    if (dangLuu) return;
    setMoForm(false);
    setDangSua(null);
    setForm(formRong);
  };

  const toggleKhoaHoc = (id: string) => {
    setForm((p) => ({
      ...p,
      idsKhoaHoc: p.idsKhoaHoc.includes(id)
        ? p.idsKhoaHoc.filter((x) => x !== id)
        : [...p.idsKhoaHoc, id],
    }));
  };

  const luuKhuyenMai = async () => {
    setLoi(null);
    setThanhCong(null);

    if (!form.maGiamGia.trim()) {
      setLoi("Vui lòng nhập mã giảm giá");
      return;
    }
    const phanTram = Number(form.phanTramGiam);
    if (!phanTram || phanTram <= 0 || phanTram > 100) {
      setLoi("Phần trăm giảm phải trong khoảng 1-100");
      return;
    }
    if (form.idsKhoaHoc.length === 0) {
      setLoi("Vui lòng chọn ít nhất một khóa học đã duyệt");
      return;
    }

    setDangLuu(true);
    try {
      const payload = {
        maGiamGia: form.maGiamGia.trim(),
        phanTramGiam: phanTram,
        ngayBatDau: form.ngayBatDau || null,
        ngayKetThuc: form.ngayKetThuc || null,
        soLuongHieuLuc: form.soLuongHieuLuc
          ? Number(form.soLuongHieuLuc)
          : null,
        idsKhoaHoc: form.idsKhoaHoc,
      };

      const res = dangSua
        ? await khuyenMaiSvc.UpdateKhuyenMai({ id: dangSua.id, ...payload })
        : await khuyenMaiSvc.CreateKhuyenMai(payload);

      if (res.status === false) {
        setLoi(res.message || "Lỗi khi lưu mã giảm giá");
        return;
      }
      setThanhCong(dangSua ? "Đã cập nhật mã giảm giá" : "Đã tạo mã giảm giá");
      dongForm();
      await taiDanhSach();
    } catch (err) {
      console.error(err);
      setLoi("Đã xảy ra lỗi khi lưu mã giảm giá");
    } finally {
      setDangLuu(false);
    }
  };

  const xoaKhuyenMai = async () => {
    if (!xacNhanXoa) return;
    setDangXoa(true);
    try {
      const res = await khuyenMaiSvc.DeleteKhuyenMai(xacNhanXoa.id);
      if (res.status === false) {
        setLoi(res.message || "Lỗi khi xoá mã giảm giá");
        return;
      }
      setThanhCong("Đã xoá mã giảm giá");
      setXacNhanXoa(null);
      await taiDanhSach();
    } catch (err) {
      console.error(err);
      setLoi("Đã xảy ra lỗi khi xoá mã giảm giá");
    } finally {
      setDangXoa(false);
    }
  };

  const cardSx = {
    p: LAYOUT_SPACING.cardPadding,
    mb: 2,
    bgcolor: "var(--ev-paper, #FFFFFF)",
    border: `1px solid #EDEFF3`,
    borderRadius: 3,
    boxShadow: "0 1px 2px rgba(16,24,40,0.02)",
    transition: "box-shadow .2s ease, border-color .2s ease",
    "&:hover": {
      borderColor: MAU.chinh + "40",
      boxShadow: "0 4px 16px rgba(16,24,40,0.05)",
    },
  } as const;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 3,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: 26,
              color: "var(--ev-text-primary, #1F2937)",
            }}
          >
            Quản lý khuyến mãi
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: MAU.chuXam, mt: 0.5 }}>
            Tạo mã giảm giá áp dụng cho các khóa học đã được duyệt.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={moTaoMoi}
          sx={{
            bgcolor: MAU.chinh,
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2,
            px: 3,
            boxShadow: "none",
            "&:hover": { bgcolor: MAU.chinhDam, boxShadow: "none" },
          }}
        >
          Tạo mã giảm giá
        </Button>
      </Box>

      {(loi || thanhCong) && (
        <Box sx={{ mb: 2 }}>
          {loi && (
            <Alert severity="error" onClose={() => setLoi(null)}>
              {loi}
            </Alert>
          )}
          {thanhCong && (
            <Alert severity="success" onClose={() => setThanhCong(null)}>
              {thanhCong}
            </Alert>
          )}
        </Box>
      )}

      {dangTai ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: MAU.chinh }} />
        </Box>
      ) : danhSach.length === 0 ? (
        <Paper elevation={0} sx={{ ...cardSx, textAlign: "center", py: 6 }}>
          <LocalOfferOutlinedIcon
            sx={{ fontSize: 40, color: MAU.vien, mb: 1 }}
          />
          <Typography sx={{ fontSize: 14, color: MAU.chuXam }}>
            Chưa có mã giảm giá nào
          </Typography>
        </Paper>
      ) : (
        danhSach.map((km) => {
          const hieuLuc = conHieuLuc(km);
          return (
            <Paper key={km.id} elevation={0} sx={cardSx}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center", flexWrap: "wrap", mb: 1 }}
                  >
                    <LocalOfferOutlinedIcon
                      sx={{ fontSize: 18, color: MAU.chinh }}
                    />
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: 16,
                        color: "var(--ev-text-primary, #1F2937)",
                      }}
                    >
                      {km.maGiamGia}
                    </Typography>
                    <Chip
                      label={`-${km.phanTramGiam}%`}
                      size="small"
                      sx={{
                        height: 22,
                        fontWeight: 700,
                        bgcolor: "#EAF7EE",
                        color: "#1B8A4C",
                      }}
                    />
                    {!hieuLuc && (
                      <Chip
                        label="Đã hết hạn"
                        size="small"
                        sx={{
                          height: 22,
                          bgcolor: "#FDECEC",
                          color: "#C62828",
                        }}
                      />
                    )}
                    {km.soLuongHieuLuc != null && (
                      <Typography sx={{ fontSize: 12, color: MAU.chuXam }}>
                        Số lượng: {km.soLuongHieuLuc}
                      </Typography>
                    )}
                  </Stack>

                  {(km.ngayBatDau || km.ngayKetThuc) && (
                    <Typography
                      sx={{ fontSize: 12.5, color: MAU.chuXam, mb: 1 }}
                    >
                      {km.ngayBatDau
                        ? new Date(km.ngayBatDau).toLocaleDateString("vi-VN")
                        : "—"}
                      {" → "}
                      {km.ngayKetThuc
                        ? new Date(km.ngayKetThuc).toLocaleDateString("vi-VN")
                        : "Không giới hạn"}
                    </Typography>
                  )}

                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ flexWrap: "wrap", gap: 0.5 }}
                  >
                    {(km.danhSachKhoaHoc ?? []).length === 0 ? (
                      <Typography sx={{ fontSize: 12, color: "#bbb" }}>
                        Chưa áp dụng cho khóa học nào
                      </Typography>
                    ) : (
                      km.danhSachKhoaHoc!.map((c) => (
                        <Tooltip key={c.id} title={c.tieuDe} arrow>
                          <Chip
                            label={c.tieuDe}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: "0.72rem",
                              bgcolor: MAU.chinhNhat,
                              color: MAU.chinh,
                              maxWidth: 240,
                            }}
                          />
                        </Tooltip>
                      ))
                    )}
                  </Stack>
                </Box>

                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={() => moSua(km)}>
                    <EditOutlinedIcon
                      fontSize="small"
                      sx={{ color: MAU.chuXam }}
                    />
                  </IconButton>
                  <IconButton size="small" onClick={() => setXacNhanXoa(km)}>
                    <DeleteIcon fontSize="small" sx={{ color: MAU.chuXam }} />
                  </IconButton>
                </Stack>
              </Box>
            </Paper>
          );
        })
      )}

      {/* Dialog tạo / sửa */}
      <Dialog open={moForm} onClose={dongForm} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 800,
          }}
        >
          {dangSua ? "Sửa mã giảm giá" : "Tạo mã giảm giá"}
          <IconButton size="small" onClick={dongForm} disabled={dangLuu}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack
            spacing={2}
            sx={{
              pt: 0.5,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                minHeight: "44px",
                bgcolor: "var(--ev-paper, #FFFFFF)",
                "& fieldset": {
                  borderColor: "var(--ev-divider, #ECE7E4)",
                },
                "&:hover fieldset": {
                  borderColor: "#8A7676",
                },
                "&.Mui-focused fieldset": {
                  borderColor: MAU.chinh,
                },
              },
              "& .MuiOutlinedInput-input": {
                py: "10px",
                px: "14px",
                fontSize: "14px",
              },
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  mb: 0.5,
                  color: "var(--ev-text-primary, #1F2937)",
                }}
              >
                Mã giảm giá *
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={form.maGiamGia}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    maGiamGia: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="VD: HE2026"
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  mb: 0.5,
                  color: "var(--ev-text-primary, #1F2937)",
                }}
              >
                Phần trăm giảm (%) *
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={form.phanTramGiam}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phanTramGiam: e.target.value }))
                }
                placeholder="VD: 20"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            <Stack direction="row" spacing={1.5}>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    mb: 0.5,
                    color: "var(--ev-text-primary, #1F2937)",
                  }}
                >
                  Ngày bắt đầu
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={form.ngayBatDau}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, ngayBatDau: e.target.value }))
                  }
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    mb: 0.5,
                    color: "var(--ev-text-primary, #1F2937)",
                  }}
                >
                  Ngày kết thúc
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={form.ngayKetThuc}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, ngayKetThuc: e.target.value }))
                  }
                />
              </Box>
            </Stack>

            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  mb: 0.5,
                  color: "var(--ev-text-primary, #1F2937)",
                }}
              >
                Số lượng hiệu lực (để trống = không giới hạn)
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={form.soLuongHieuLuc}
                onChange={(e) =>
                  setForm((p) => ({ ...p, soLuongHieuLuc: e.target.value }))
                }
                placeholder="VD: 50"
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  mb: 1,
                  color: "var(--ev-text-primary, #1F2937)",
                }}
              >
                Áp dụng cho khóa học đã duyệt *
              </Typography>
              {dangTaiKhoaHoc ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={20} sx={{ color: MAU.chinh }} />
                </Box>
              ) : khoaHocDaDuyet.length === 0 ? (
                <Typography sx={{ fontSize: 12.5, color: MAU.chuXam }}>
                  Bạn chưa có khóa học nào được duyệt.
                </Typography>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    maxHeight: 220,
                    overflowY: "auto",
                  }}
                >
                  {khoaHocDaDuyet.map((c) => {
                    const active = form.idsKhoaHoc.includes(c.id);
                    return (
                      <Tooltip key={c.id} title={c.tieuDe} arrow>
                        <Chip
                          label={c.tieuDe}
                          onClick={() => toggleKhoaHoc(c.id)}
                          sx={{
                            borderRadius: "999px",
                            fontWeight: 600,
                            maxWidth: 260,
                            border: `1.5px solid ${active ? MAU.chinh : "#ECE7E4"}`,
                            bgcolor: active ? MAU.chinhNhat : "transparent",
                            color: active ? MAU.chinh : "#4B5563",
                            "&:hover": { bgcolor: MAU.chinhNhat },
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={dongForm}
            disabled={dangLuu}
            sx={{ textTransform: "none", color: MAU.chuXam }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={luuKhuyenMai}
            disabled={dangLuu}
            sx={{
              bgcolor: MAU.chinh,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
              "&:hover": { bgcolor: MAU.chinhDam, boxShadow: "none" },
            }}
          >
            {dangLuu ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              "Lưu"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xoá */}
      <Dialog
        open={!!xacNhanXoa}
        onClose={() => setXacNhanXoa(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: MAU.chinh }}>
          Xoá mã giảm giá
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: MAU.chuXam }}>
            Bạn chắc chắn muốn xoá mã &quot;{xacNhanXoa?.maGiamGia}&quot;?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setXacNhanXoa(null)}
            sx={{ textTransform: "none", color: MAU.chuXam }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={xoaKhuyenMai}
            disabled={dangXoa}
            sx={{
              bgcolor: "#C62828",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": { bgcolor: "#a02020" },
            }}
          >
            {dangXoa ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              "Xác nhận xoá"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function ManagerPromotionsPage() {
  return (
    <AuthGuard allowedRoles={["GiaoVien", "Admin"]}>
      <DashboardShell>
        <Box
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: "24px",
            border: "1px solid rgba(141,19,19,0.06)",
            bgcolor: "var(--ev-paper, #FFFFFF)",
            boxShadow: "0 10px 30px rgba(141,19,19,0.015)",
          }}
        >
          <QuanLyKhuyenMaiContent />
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}
