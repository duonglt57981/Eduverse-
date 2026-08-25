"use client";

import AuthGuard from "@/src/components/AuthGuard";
import StudentDashboardShell from "@/src/components/dashboard/StudentDashboardShell";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  TextField,
  CircularProgress,
  Avatar,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SchoolIcon from "@mui/icons-material/School";
import { useDispatch, useSelector } from "@/src/store/hook";
import {
  getGioHang,
  xoaKhoiGioHang,
  themVaoGioHang,
} from "@/src/store/gioHang/GioHangSlice";
import {
  getDanhSachMuaSau,
  luuMuaSau,
  xoaKhoiMuaSau,
  chuyenVaoGioHang,
} from "@/src/store/danhSachMuonMuaSau/DanhSachMuonMuaSauSlice";
import { getKhoaHocPaged } from "@/src/store/khoaHoc/KhoaHocSlice";
import { apiService } from "@/src/services/index";
import { useRouter } from "next/navigation";
import { BRAND, CSSVAR } from "@/src/theme/tokens";

interface KetQuaApDungMa {
  maGiamGia: string;
  hopLe: boolean;
  thongBao: string;
  phanTramGiam?: number;
  idKhoaHocDuocGiam?: string;
  tenKhoaHocDuocGiam?: string;
  soTienGiam?: number;
}

interface KhuyenMaiKhaDung {
  id: string;
  maGiamGia: string;
  phanTramGiam?: number;
  ngayKetThuc?: string;
  idsKhoaHocApDung: string[];
}

interface ApDungNhieuMaResponse {
  ketQua: KetQuaApDungMa[];
  soTienGoc: number;
  tongSoTienGiam: number;
  soTienSauGiam: number;
}

const PRIMARY = BRAND.main;

const formatThoiLuong = (phut?: number) => {
  if (!phut) return null;
  const gio = Math.floor(phut / 60);
  const p = phut % 60;
  if (gio > 0 && p > 0) return `${gio} giờ ${p} phút`;
  if (gio > 0) return `${gio} giờ`;
  return `${p} phút`;
};

function GioHangContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { pagedResult } = useSelector((s) => s.khoaHoc);
  const [open, setOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );
  const { gioHang, loading } = useSelector((s) => s.gioHang);
  const [apDungLoading, setApDungLoading] = useState(false);
  const [dangKyLoading, setDangKyLoading] = useState(false);
  const [vuaThayDoiGioHang, setVuaThayDoiGioHang] = useState(false);
  const { items: savedItems } = useSelector((s) => s.muaSau);

  // ── Mã giảm giá: hỗ trợ nhiều mã cùng lúc ──
  const [maDangNhap, setMaDangNhap] = useState("");
  const [dsMaDaThem, setDsMaDaThem] = useState<string[]>([]);
  const [ketQuaMa, setKetQuaMa] = useState<ApDungNhieuMaResponse | null>(null);
  const [dsMaKhaDung, setDsMaKhaDung] = useState<KhuyenMaiKhaDung[]>([]);
  const [loadingMaKhaDung, setLoadingMaKhaDung] = useState(false);

  const items = gioHang?.items ?? [];
  const tongTien = gioHang?.tongTien ?? 0;
  const tongThanhToan = ketQuaMa ? ketQuaMa.soTienSauGiam : tongTien;

  const mienphi = items.filter((i) => !i.gia || i.gia === 0);
  const coPhí = items.filter((i) => i.gia && i.gia > 0);
  const tatCaLaMienPhi = items.length > 0 && coPhí.length === 0;

  useEffect(() => {
    dispatch(getGioHang());
  }, [dispatch]);
  useEffect(() => {
    dispatch(getDanhSachMuaSau());
  }, [dispatch]);
  useEffect(() => {
    dispatch(
      getKhoaHocPaged({
        pageIndex: 1,
        pageSize: 4,
        search: "",
        danhMucId: "",
        capDo: "",
      }),
    );
  }, [dispatch]);
  useEffect(() => {
    const idsKhoaHoc = coPhí.map((i) => i.idKhoaHoc!).filter(Boolean);
    if (idsKhoaHoc.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDsMaKhaDung([]);
      return;
    }
    setLoadingMaKhaDung(true);
    const params = new URLSearchParams();
    idsKhoaHoc.forEach((id) => params.append("khoaHocIds", id));
    apiService
      .get<KhuyenMaiKhaDung[]>(
        `/KhuyenMai/khuyenmai-kha-dung?${params.toString()}`,
      )
      .then((res) => setDsMaKhaDung(res.data ?? []))
      .catch(() => setDsMaKhaDung([]))
      .finally(() => setLoadingMaKhaDung(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const formatGia = (gia?: number) =>
    gia && gia > 0 ? `${gia.toLocaleString("vi-VN")} ₫` : "Miễn phí";

  // Bất cứ khi nào giỏ hàng thay đổi thành phần (thêm/xoá), toàn bộ mã đã
  // áp dụng phải reset — vì kết quả được tính "đóng băng" tại một danh sách
  // khóa học cụ thể, không tự đồng bộ với BE.
  const resetMaGiamGiaSauKhiDoiGioHang = () => {
    setKetQuaMa(null);
    setDsMaDaThem([]);
    setMaDangNhap("");
    setVuaThayDoiGioHang(true);
  };

  const tinhLaiMa = async (danhSachMa: string[]) => {
    if (danhSachMa.length === 0) {
      setKetQuaMa(null);
      return;
    }
    setApDungLoading(true);
    try {
      const res = await apiService.post<ApDungNhieuMaResponse>(
        "/thanhtoan/kiem-tra-ma-giam-gia",
        {
          danhSachMa,
          khoaHocIds: coPhí.map((i) => i.idKhoaHoc!).filter(Boolean),
        },
      );
      setKetQuaMa(res.data);
      setVuaThayDoiGioHang(false);
    } catch {
      setKetQuaMa(null);
    } finally {
      setApDungLoading(false);
    }
  };

  const handleThemMa = async () => {
    if (!maDangNhap.trim()) return;
    const maMoi = maDangNhap.trim().toUpperCase();
    if (dsMaDaThem.includes(maMoi)) {
      setMaDangNhap("");
      return;
    }
    const dsMoi = [...dsMaDaThem, maMoi];
    setDsMaDaThem(dsMoi);
    setMaDangNhap("");
    await tinhLaiMa(dsMoi);
  };

  const handleXoaMa = async (ma: string) => {
    const dsMoi = dsMaDaThem.filter((m) => m !== ma);
    setDsMaDaThem(dsMoi);
    await tinhLaiMa(dsMoi);
  };

  const handleChonMa = async (ma: string) => {
    if (dsMaDaThem.includes(ma)) return;
    const dsMoi = [...dsMaDaThem, ma];
    setDsMaDaThem(dsMoi);
    await tinhLaiMa(dsMoi);
  };

  const handleDangKyMienPhi = async () => {
    const dsMienPhi = items.filter((i) => !i.gia || i.gia === 0);
    if (dsMienPhi.length === 0) return;

    setDangKyLoading(true);
    try {
      const results = await Promise.allSettled(
        dsMienPhi.map((item) =>
          apiService.post(`/dangkikhoahoc/dangki-khoahoc/${item.idKhoaHoc}`),
        ),
      );

      const thanhCong = results.filter((r) => r.status === "fulfilled").length;
      const thatBai = results.filter((r) => r.status === "rejected").length;

      for (let i = 0; i < results.length; i++) {
        if (results[i].status === "fulfilled") {
          await dispatch(xoaKhoiGioHang(dsMienPhi[i].idKhoaHoc!));
        }
      }
      dispatch(getGioHang());

      if (thanhCong > 0 && thatBai === 0) {
        setAlertMessage(`Đăng ký thành công ${thanhCong} khóa học miễn phí!`);
        setAlertSeverity("success");
        setOpen(true);
        setTimeout(() => router.push("/student/courses/my-courses"), 1500);
      } else if (thanhCong > 0) {
        setAlertMessage(
          `Đăng ký ${thanhCong} thành công, ${thatBai} thất bại (có thể đã đăng ký)`,
        );
        setAlertSeverity("success");
        setOpen(true);
      } else {
        setAlertMessage("Đã đăng ký khóa học này rồi hoặc có lỗi xảy ra");
        setAlertSeverity("error");
        setOpen(true);
      }
    } catch {
      setAlertMessage("Có lỗi xảy ra khi đăng ký");
      setAlertSeverity("error");
      setOpen(true);
    } finally {
      setDangKyLoading(false);
    }
  };

  if (loading && !gioHang) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "40vh",
        }}
      >
        <CircularProgress sx={{ color: PRIMARY }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{ fontSize: 26, fontWeight: 900, color: PRIMARY, mb: 0.5 }}
        >
          Giỏ hàng của tôi
        </Typography>
        <Typography
          sx={{
            color: "var(--ev-text-secondary, rgba(31,41,55,0.55))",
            fontSize: 14,
          }}
        >
          {items.length} khóa học trong giỏ hàng
          {mienphi.length > 0 && (
            <Box
              component="span"
              sx={{ ml: 1, color: "success.main", fontWeight: 600 }}
            >
              ({mienphi.length} miễn phí)
            </Box>
          )}
        </Typography>
      </Box>

      {items.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 10,
            borderRadius: "16px",
            border: "1.5px dashed rgba(141,19,19,0.18)",
            bgcolor: "rgba(141,19,19,0.02)",
          }}
        >
          <Typography sx={{ fontSize: 40, mb: 2 }}>🛒</Typography>
          <Typography
            sx={{ fontSize: 18, fontWeight: 700, mb: 1, color: "text.primary" }}
          >
            Giỏ hàng trống
          </Typography>
          <Typography sx={{ color: "text.secondary", mb: 3, fontSize: 14 }}>
            Hãy khám phá và thêm khóa học bạn yêu thích!
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push("/student/explore")}
            sx={{
              bgcolor: PRIMARY,
              "&:hover": { bgcolor: "#7f1d1d" },
              borderRadius: "10px",
              fontWeight: 700,
              px: 4,
              py: 1.2,
            }}
          >
            Khám phá khóa học
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            gap: 4,
            alignItems: "flex-start",
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* ── Danh sách khóa học ── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Divider sx={{ borderColor: "rgba(141,19,19,0.1)" }} />
            {items.map((item) => {
              const laMienPhi = !item.gia || item.gia === 0;
              return (
                <Box key={item.id}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      py: 2.5,
                      alignItems: "flex-start",
                    }}
                  >
                    <Box
                      sx={{
                        width: 130,
                        height: 80,
                        flexShrink: 0,
                        borderRadius: "10px",
                        overflow: "hidden",
                        bgcolor: "#f0f0f0",
                      }}
                    >
                      {item.hinhAnh ? (
                        <img
                          src={item.hinhAnh}
                          alt={item.tenKhoaHoc ?? ""}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Avatar
                          variant="square"
                          sx={{
                            width: "100%",
                            height: "100%",
                            bgcolor: "#e0e0e0",
                            fontSize: 13,
                            color: "#999",
                          }}
                        >
                          Ảnh
                        </Avatar>
                      )}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: 14,
                            lineHeight: 1.4,
                            color: "text.primary",
                          }}
                        >
                          {item.tenKhoaHoc}
                        </Typography>
                        {laMienPhi && (
                          <Chip
                            label="Miễn phí"
                            size="small"
                            color="success"
                            sx={{ height: 18, fontSize: 10, fontWeight: 700 }}
                          />
                        )}
                      </Box>
                      <Typography
                        sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}
                      >
                        {item.danhSachGiangVien &&
                        item.danhSachGiangVien.length > 0
                          ? item.danhSachGiangVien.join(", ")
                          : (item.tenTacGia ?? "Giảng viên")}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          mb: 1,
                        }}
                      >
                        {item.tongBaiGiang != null && (
                          <Typography
                            sx={{ fontSize: 12, color: "text.secondary" }}
                          >
                            {item.tongBaiGiang} bài giảng
                          </Typography>
                        )}
                        {item.tongThoiLuong != null && (
                          <Typography
                            sx={{ fontSize: 12, color: "text.secondary" }}
                          >
                            • {formatThoiLuong(item.tongThoiLuong)}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Button
                          size="small"
                          startIcon={
                            <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                          }
                          onClick={async () => {
                            await dispatch(xoaKhoiGioHang(item.idKhoaHoc!));
                            dispatch(getGioHang());
                            resetMaGiamGiaSauKhiDoiGioHang();
                          }}
                          sx={{
                            color: PRIMARY,
                            fontSize: 12,
                            p: 0,
                            minWidth: 0,
                            fontWeight: 600,
                          }}
                        >
                          Xóa
                        </Button>
                        {!laMienPhi && (
                          <Button
                            size="small"
                            startIcon={
                              <FavoriteBorderIcon sx={{ fontSize: 16 }} />
                            }
                            onClick={async () => {
                              await dispatch(luuMuaSau(item.idKhoaHoc!));
                              await dispatch(xoaKhoiGioHang(item.idKhoaHoc!));
                              dispatch(getGioHang());
                              dispatch(getDanhSachMuaSau());
                              resetMaGiamGiaSauKhiDoiGioHang();
                            }}
                            sx={{
                              color: PRIMARY,
                              fontSize: 12,
                              p: 0,
                              minWidth: 0,
                              fontWeight: 600,
                            }}
                          >
                            Lưu để mua sau
                          </Button>
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                      {laMienPhi ? (
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: 16,
                            color: "success.main",
                          }}
                        >
                          Miễn phí
                        </Typography>
                      ) : (
                        <>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: 16,
                              color: PRIMARY,
                            }}
                          >
                            {formatGia(item.gia)}
                          </Typography>
                          {Boolean(
                            item.giaGoc && item.giaGoc > (item.gia ?? 0),
                          ) && (
                            <Typography
                              sx={{
                                fontSize: 12,
                                color: CSSVAR.textMuted,
                                textDecoration: "line-through",
                              }}
                            >
                              {formatGia(item.giaGoc)}
                            </Typography>
                          )}
                        </>
                      )}
                    </Box>
                  </Box>
                  <Divider sx={{ borderColor: "rgba(141,19,19,0.08)" }} />
                </Box>
              );
            })}
          </Box>

          {/* ── Tóm tắt đơn hàng ── */}
          <Box
            sx={{
              width: { xs: "100%", md: 300 },
              flexShrink: 0,
              borderRadius: "16px",
              border: "1.5px solid rgba(141,19,19,0.12)",
              bgcolor: "rgba(141,19,19,0.015)",
              p: 3,
            }}
          >
            {tatCaLaMienPhi ? (
              <>
                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <SchoolIcon
                    sx={{ fontSize: 48, color: "success.main", mb: 1 }}
                  />
                  <Typography
                    sx={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: "success.main",
                      mb: 0.5,
                    }}
                  >
                    Miễn phí!
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    {items.length} khóa học không mất phí
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={dangKyLoading}
                  onClick={handleDangKyMienPhi}
                  startIcon={
                    dangKyLoading ? (
                      <CircularProgress size={18} sx={{ color: "#fff" }} />
                    ) : (
                      <SchoolIcon />
                    )
                  }
                  sx={{
                    bgcolor: "success.main",
                    "&:hover": { bgcolor: "success.dark" },
                    borderRadius: "10px",
                    fontWeight: 800,
                    fontSize: 15,
                    py: 1.5,
                  }}
                >
                  {dangKyLoading ? "Đang đăng ký..." : "Đăng ký ngay"}
                </Button>
              </>
            ) : (
              <>
                {mienphi.length > 0 && (
                  <Alert
                    severity="info"
                    sx={{ borderRadius: "10px", mb: 2, fontSize: 12 }}
                  >
                    <strong>{mienphi.length} khóa học miễn phí</strong> sẽ được
                    đăng ký tự động khi thanh toán
                  </Alert>
                )}

                <Typography
                  sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}
                >
                  Tổng thanh toán:
                </Typography>
                <Typography
                  sx={{
                    fontSize: 30,
                    fontWeight: 900,
                    color: PRIMARY,
                    mb: 0.5,
                  }}
                >
                  {tongThanhToan > 0
                    ? `${tongThanhToan.toLocaleString("vi-VN")} ₫`
                    : "Miễn phí"}
                </Typography>

                {ketQuaMa && ketQuaMa.tongSoTienGiam > 0 && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "text.secondary",
                        textDecoration: "line-through",
                      }}
                    >
                      {formatGia(tongTien)}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "success.main",
                        fontWeight: 700,
                      }}
                    >
                      Tiết kiệm {formatGia(ketQuaMa.tongSoTienGiam)}
                    </Typography>
                  </Box>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={items.length === 0 || loading}
                  onClick={() => {
                    if (dsMaDaThem.length > 0)
                      sessionStorage.setItem(
                        "dsMaGiamGia",
                        JSON.stringify(dsMaDaThem),
                      );
                    else sessionStorage.removeItem("dsMaGiamGia");
                    router.push("/student/payment");
                  }}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    bgcolor: PRIMARY,
                    "&:hover": { bgcolor: "#7f1d1d" },
                    borderRadius: "10px",
                    fontWeight: 800,
                    fontSize: 15,
                    py: 1.5,
                    mb: 2.5,
                    mt: 1,
                    "&.Mui-disabled": { bgcolor: "#ddd", color: "#aaa" },
                  }}
                >
                  Tiến hành thanh toán
                </Button>

                <Divider sx={{ mb: 2, borderColor: "rgba(141,19,19,0.1)" }} />

                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    mb: 1,
                    color: "text.primary",
                  }}
                >
                  Mã ưu đãi
                </Typography>
                <Typography
                  sx={{ fontSize: 12, color: "text.secondary", mb: 1.5 }}
                >
                  Có thể áp dụng nhiều mã cùng lúc, mỗi mã chỉ giảm cho 1 khóa
                  học
                </Typography>

                <Typography
                  sx={{ fontSize: 12, color: "text.secondary", mb: 1.5 }}
                >
                  Có thể áp dụng nhiều mã cùng lúc, mỗi mã chỉ giảm cho 1 khóa
                  học
                </Typography>

                {/* ★ MỚI: pick-list mã ưu đãi do Admin tạo — chọn nhanh, không cần gõ */}
                {loadingMaKhaDung ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 1 }}
                  >
                    <CircularProgress size={16} sx={{ color: PRIMARY }} />
                  </Box>
                ) : dsMaKhaDung.filter(
                    (km) => !dsMaDaThem.includes(km.maGiamGia),
                  ).length > 0 ? (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "text.primary",
                        mb: 0.75,
                      }}
                    >
                      Mã ưu đãi có sẵn
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.75,
                      }}
                    >
                      {dsMaKhaDung
                        .filter((km) => !dsMaDaThem.includes(km.maGiamGia))
                        .map((km) => (
                          <Box
                            key={km.id}
                            onClick={() =>
                              !apDungLoading && handleChonMa(km.maGiamGia)
                            }
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              border: "1.5px dashed rgba(141,19,19,0.25)",
                              borderRadius: "8px",
                              px: 1.25,
                              py: 0.75,
                              cursor: apDungLoading ? "default" : "pointer",
                              opacity: apDungLoading ? 0.6 : 1,
                              transition: "all 0.15s ease",
                              "&:hover": apDungLoading
                                ? {}
                                : {
                                    bgcolor: "rgba(141,19,19,0.04)",
                                    borderColor: PRIMARY,
                                  },
                            }}
                          >
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: 12.5,
                                  fontWeight: 800,
                                  color: PRIMARY,
                                }}
                              >
                                {km.maGiamGia}
                              </Typography>
                              <Typography
                                sx={{ fontSize: 10.5, color: "text.secondary" }}
                              >
                                Giảm {km.phanTramGiam}%
                                {km.ngayKetThuc &&
                                  ` • HSD ${new Date(km.ngayKetThuc).toLocaleDateString("vi-VN")}`}
                              </Typography>
                            </Box>
                            <Chip
                              label="Chọn"
                              size="small"
                              sx={{
                                bgcolor: PRIMARY,
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: 10.5,
                                height: 22,
                              }}
                            />
                          </Box>
                        ))}
                    </Box>
                  </Box>
                ) : null}

                {dsMaDaThem.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.75,
                      mb: 1.5,
                    }}
                  >
                    {ketQuaMa?.ketQua.map((kq) => (
                      <Chip
                        key={kq.maGiamGia}
                        label={
                          kq.hopLe
                            ? `${kq.maGiamGia} (-${formatGia(kq.soTienGiam)})`
                            : `${kq.maGiamGia} (không áp dụng)`
                        }
                        onDelete={() => handleXoaMa(kq.maGiamGia)}
                        size="small"
                        color={kq.hopLe ? "success" : "default"}
                        sx={{ fontWeight: 600 }}
                      />
                    ))}
                  </Box>
                )}

                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "stretch",
                    height: 40,
                  }}
                >
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Nhập mã rồi Enter..."
                    value={maDangNhap}
                    onChange={(e) => setMaDangNhap(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleThemMa();
                    }}
                    sx={{
                      height: "100%",
                      "& .MuiOutlinedInput-root": {
                        height: "100%",
                        borderRadius: "8px",
                        fontSize: 13,
                        bgcolor: CSSVAR.paper,
                        "&.Mui-focused fieldset": { borderColor: PRIMARY },
                      },
                    }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={apDungLoading || !maDangNhap.trim()}
                    onClick={handleThemMa}
                    sx={{
                      height: "100%",
                      borderColor: PRIMARY,
                      color: PRIMARY,
                      borderRadius: "8px",
                      px: 2,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      fontWeight: 700,
                      "&:hover": { bgcolor: "#fff0f0", borderColor: PRIMARY },
                    }}
                  >
                    {apDungLoading ? (
                      <CircularProgress size={14} sx={{ color: PRIMARY }} />
                    ) : (
                      "Thêm"
                    )}
                  </Button>
                </Box>

                {ketQuaMa?.ketQua.some((k) => !k.hopLe) && (
                  <Typography
                    sx={{ fontSize: 11.5, color: "error.main", mt: 0.75 }}
                  >
                    {ketQuaMa.ketQua
                      .filter((k) => !k.hopLe)
                      .map((k) => `${k.maGiamGia}: ${k.thongBao}`)
                      .join(" • ")}
                  </Typography>
                )}

                {vuaThayDoiGioHang && !ketQuaMa && (
                  <Typography
                    sx={{ fontSize: 11.5, color: "#e65100", mt: 0.75 }}
                  >
                    Giỏ hàng đã thay đổi — vui lòng áp dụng lại mã giảm giá nếu
                    cần.
                  </Typography>
                )}
              </>
            )}
          </Box>
        </Box>
      )}

      {/* ── Đã lưu để mua sau ── */}
      {savedItems.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Typography
            sx={{
              fontSize: 17,
              fontWeight: 800,
              mb: 1.5,
              color: "text.primary",
            }}
          >
            Đã lưu để mua sau ({savedItems.length})
          </Typography>
          <Divider sx={{ mb: 1, borderColor: "rgba(141,19,19,0.1)" }} />
          {savedItems.map((item) => (
            <Box key={item.id}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  py: 2.5,
                  alignItems: "flex-start",
                }}
              >
                <Box
                  sx={{
                    width: 130,
                    height: 80,
                    flexShrink: 0,
                    borderRadius: "10px",
                    overflow: "hidden",
                    bgcolor: "#f0f0f0",
                  }}
                >
                  {item.hinhAnh ? (
                    <img
                      src={item.hinhAnh}
                      alt={item.tenKhoaHoc ?? ""}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        bgcolor: "#e0e0e0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography sx={{ fontSize: 12, color: "#999" }}>
                        Ảnh
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: 14,
                      mb: 0.5,
                      lineHeight: 1.4,
                      color: "text.primary",
                    }}
                  >
                    {item.tenKhoaHoc}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}
                  >
                    {item.danhSachGiangVien && item.danhSachGiangVien.length > 0
                      ? item.danhSachGiangVien.join(", ")
                      : (item.tenTacGia ?? "Giảng viên")}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      size="small"
                      onClick={async () => {
                        await dispatch(chuyenVaoGioHang(item.idKhoaHoc!));
                        dispatch(getGioHang());
                        dispatch(getDanhSachMuaSau());
                        resetMaGiamGiaSauKhiDoiGioHang();
                      }}
                      sx={{
                        color: PRIMARY,
                        fontSize: 12,
                        p: 0,
                        minWidth: 0,
                        fontWeight: 700,
                      }}
                    >
                      Chuyển vào giỏ hàng
                    </Button>
                    <Button
                      size="small"
                      onClick={async () => {
                        await dispatch(xoaKhoiMuaSau(item.idKhoaHoc!));
                        dispatch(getDanhSachMuaSau());
                      }}
                      sx={{ color: "#666", fontSize: 12, p: 0, minWidth: 0 }}
                    >
                      Xóa
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                  {!item.gia || item.gia === 0 ? (
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: 15,
                        color: "success.main",
                      }}
                    >
                      Miễn phí
                    </Typography>
                  ) : (
                    <>
                      <Typography
                        sx={{ fontWeight: 800, fontSize: 15, color: PRIMARY }}
                      >
                        {formatGia(item.gia)}
                      </Typography>
                      {Boolean(
                        item.giaGoc && item.giaGoc > (item.gia ?? 0),
                      ) && (
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: CSSVAR.textMuted,
                            textDecoration: "line-through",
                          }}
                        >
                          {formatGia(item.giaGoc)}
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
              </Box>
              <Divider sx={{ borderColor: "rgba(141,19,19,0.08)" }} />
            </Box>
          ))}
        </Box>
      )}

      {/* ── Bạn cũng có thể thích ── */}
      {pagedResult && pagedResult.items.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Divider sx={{ mb: 3, borderColor: "rgba(141,19,19,0.1)" }} />
          <Typography
            sx={{ fontSize: 17, fontWeight: 800, mb: 2, color: "text.primary" }}
          >
            Bạn cũng có thể thích
          </Typography>
          <Divider sx={{ mb: 2, borderColor: "rgba(141,19,19,0.08)" }} />
          {pagedResult.items
            .filter((kh) => !items.some((i) => i.idKhoaHoc === kh.id))
            .slice(0, 4)
            .map((kh) => {
              const laMienPhi = !kh.gia || kh.gia === 0;
              return (
                <Box key={kh.id}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      py: 2,
                      alignItems: "flex-start",
                    }}
                  >
                    <Box
                      sx={{
                        width: 130,
                        height: 80,
                        flexShrink: 0,
                        borderRadius: "10px",
                        overflow: "hidden",
                        bgcolor: "#f0f0f0",
                      }}
                    >
                      {kh.hinhAnhKhoaHoc ? (
                        <img
                          src={kh.hinhAnhKhoaHoc}
                          alt={kh.tieuDe ?? ""}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            height: "100%",
                            bgcolor: "#e0e0e0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography sx={{ fontSize: 12, color: "#999" }}>
                            Ảnh
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 14,
                          mb: 0.5,
                          lineHeight: 1.4,
                          color: "text.primary",
                        }}
                      >
                        {kh.tieuDe}
                      </Typography>
                      {kh.capDo && (
                        <Chip
                          label={kh.capDo}
                          size="small"
                          sx={{
                            fontSize: 11,
                            height: 20,
                            mb: 0.5,
                            bgcolor: "#f0f0f0",
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                      {laMienPhi ? (
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: 15,
                            mb: 0.5,
                            color: "success.main",
                          }}
                        >
                          Miễn phí
                        </Typography>
                      ) : (
                        <>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: 15,
                              mb: 0.5,
                              color: PRIMARY,
                            }}
                          >
                            {formatGia(kh.gia)}
                          </Typography>
                          {Boolean(kh.giaGoc && kh.giaGoc > (kh.gia ?? 0)) && (
                            <Typography
                              sx={{
                                fontSize: 12,
                                color: CSSVAR.textMuted,
                                textDecoration: "line-through",
                                mb: 0.5,
                              }}
                            >
                              {formatGia(kh.giaGoc)}
                            </Typography>
                          )}
                        </>
                      )}
                      {laMienPhi ? (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={async () => {
                            try {
                              await apiService.post(
                                `/dangkikhoahoc/dangki-khoahoc/${kh.id}`,
                              );
                              setAlertMessage(
                                "Đăng ký khóa học miễn phí thành công!",
                              );
                              setAlertSeverity("success");
                              setOpen(true);
                            } catch {
                              setAlertMessage(
                                "Đã đăng ký rồi hoặc có lỗi xảy ra",
                              );
                              setAlertSeverity("error");
                              setOpen(true);
                            }
                          }}
                          sx={{
                            bgcolor: "success.main",
                            "&:hover": { bgcolor: "success.dark" },
                            borderRadius: "8px",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          Đăng ký ngay
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={async () => {
                            try {
                              await dispatch(themVaoGioHang(kh.id)).unwrap();
                              setAlertMessage("Đã thêm vào giỏ hàng!");
                              setAlertSeverity("success");
                              setOpen(true);
                              dispatch(getGioHang());
                              resetMaGiamGiaSauKhiDoiGioHang();
                            } catch {
                              setAlertMessage("Lỗi thêm vào giỏ hàng");
                              setAlertSeverity("error");
                              setOpen(true);
                            }
                          }}
                          sx={{
                            borderColor: PRIMARY,
                            color: PRIMARY,
                            borderRadius: "8px",
                            fontSize: 12,
                            fontWeight: 700,
                            "&:hover": { bgcolor: PRIMARY, color: "#fff" },
                          }}
                        >
                          Thêm vào giỏ
                        </Button>
                      )}
                    </Box>
                  </Box>
                  <Divider sx={{ borderColor: "rgba(141,19,19,0.08)" }} />
                </Box>
              );
            })}
        </Box>
      )}

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
      >
        <Alert severity={alertSeverity} onClose={() => setOpen(false)}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default function StudentCartPage() {
  return (
    <AuthGuard allowedRoles={["HocVien", "GiaoVien"]}>
      <StudentDashboardShell>
        <Box
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: "24px",
            border: "1px solid rgba(141,19,19,0.06)",
            bgcolor: CSSVAR.paper,
            boxShadow: "0 10px 30px rgba(141,19,19,0.015)",
          }}
        >
          <GioHangContent />
        </Box>
      </StudentDashboardShell>
    </AuthGuard>
  );
}
