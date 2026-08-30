/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Chip,
  Snackbar,
  Alert,
  Stack,
} from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
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

function getCourseImage(hinhAnh?: string): string {
  if (!hinhAnh) return "";
  try {
    const parsed = JSON.parse(hinhAnh);
    if (parsed.imageUrl) return parsed.imageUrl;
  } catch {}
  if (
    hinhAnh.startsWith("http") ||
    hinhAnh.startsWith("/") ||
    hinhAnh.startsWith(".")
  ) {
    return hinhAnh;
  }
  return "";
}

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
    setDangKyLoading(true);
    try {
      const ketQua = await Promise.allSettled(
        items.map((i) =>
          apiService.post(`/dangkikhoahoc/dangki-khoahoc/${i.idKhoaHoc}`),
        ),
      );
      const thanhCong = ketQua.filter((r) => r.status === "fulfilled").length;
      await Promise.all(items.map((i) => dispatch(xoaKhoiGioHang(i.idKhoaHoc!))));
      dispatch(getGioHang());
      setAlertMessage(
        thanhCong === items.length
          ? `Đã đăng ký thành công ${thanhCong} khóa học!`
          : `Đã đăng ký ${thanhCong}/${items.length} khóa học (có thể một số đã được đăng ký trước đó).`,
      );
      setAlertSeverity(thanhCong > 0 ? "success" : "error");
      setOpen(true);
      if (thanhCong > 0) {
        setTimeout(() => router.push("/student/courses/my-courses"), 1500);
      }
    } catch {
      setAlertMessage("Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.");
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
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{ fontSize: 26, fontWeight: 900, color: "text.primary", mb: 0.5 }}
        >
          Giỏ hàng của tôi
        </Typography>
        <Typography
          sx={{
            color: "text.secondary",
            fontSize: 14,
          }}
        >
          {items.length} khóa học trong giỏ hàng
          {mienphi.length > 0 && (
            <Box
              component="span"
              sx={{ ml: 1, color: "#059669", fontWeight: 700 }}
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
            py: 8,
            px: 3,
            borderRadius: "16px",
            border: "1.5px dashed rgba(0,0,0,0.12)",
            bgcolor: "rgba(0,0,0,0.01)",
          }}
        >
          <Typography sx={{ fontSize: 44, mb: 1.5 }}>🛒</Typography>
          <Typography
            sx={{ fontSize: 18, fontWeight: 800, mb: 0.75, color: "text.primary" }}
          >
            Giỏ hàng của bạn đang trống
          </Typography>
          <Typography sx={{ color: "text.secondary", mb: 3, fontSize: 14 }}>
            Hãy khám phá thêm nhiều khóa học bổ ích và thêm vào giỏ hàng nhé!
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push("/student/explore")}
            sx={{
              bgcolor: PRIMARY,
              "&:hover": { bgcolor: BRAND.dark },
              borderRadius: "10px",
              fontWeight: 800,
              px: 3.5,
              py: 1.2,
              boxShadow: "none",
              textTransform: "none",
            }}
          >
            Khám phá khóa học
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            gap: 3.5,
            alignItems: "flex-start",
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* ── Danh sách khóa học ── */}
          <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
            <Divider sx={{ borderColor: "rgba(0,0,0,0.08)" }} />
            {items.map((item) => {
              const laMienPhi = !item.gia || item.gia === 0;
              const imgUrl = getCourseImage(item.hinhAnh);
              const instructor =
                item.danhSachGiangVien && item.danhSachGiangVien.length > 0
                  ? item.danhSachGiangVien.join(", ")
                  : (item.tenTacGia ?? "Giảng viên EduVerse");

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
                    {/* Thumbnail */}
                    <Box
                      onClick={() => {
                        if (item.idKhoaHoc) {
                          router.push(`/student/enroll-courses/${item.idKhoaHoc}`);
                        }
                      }}
                      sx={{
                        width: 140,
                        height: 84,
                        flexShrink: 0,
                        borderRadius: "10px",
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,0.08)",
                        bgcolor: "var(--dashboard-surface-muted, #f3f4f6)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={item.tenKhoaHoc ?? ""}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <SchoolRoundedIcon
                          sx={{ fontSize: 32, color: "text.disabled" }}
                        />
                      )}
                    </Box>

                    {/* Information */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography
                          onClick={() => {
                            if (item.idKhoaHoc) {
                              router.push(
                                `/student/enroll-courses/${item.idKhoaHoc}`,
                              );
                            }
                          }}
                          sx={{
                            fontWeight: 700,
                            fontSize: 15,
                            lineHeight: 1.35,
                            color: "text.primary",
                            cursor: "pointer",
                            transition: "color 150ms ease",
                            "&:hover": {
                              color: PRIMARY,
                            },
                          }}
                        >
                          {item.tenKhoaHoc}
                        </Typography>
                        {laMienPhi && (
                          <Chip
                            label="Miễn phí"
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              bgcolor: "rgba(16, 185, 129, 0.12)",
                              color: "#047857",
                              border: "1px solid rgba(16, 185, 129, 0.25)",
                              borderRadius: "4px",
                            }}
                          />
                        )}
                      </Box>

                      <Typography
                        sx={{ fontSize: 12.5, color: "text.secondary", mb: 0.5 }}
                      >
                        {instructor}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          mb: 1.25,
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

                      {/* Action Links */}
                      <Stack direction="row" spacing={2.5}>
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
                            color: "text.secondary",
                            fontSize: 12.5,
                            p: 0,
                            minWidth: 0,
                            fontWeight: 600,
                            textTransform: "none",
                            "&:hover": {
                              color: "error.main",
                              bgcolor: "transparent",
                            },
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
                              color: "text.secondary",
                              fontSize: 12.5,
                              p: 0,
                              minWidth: 0,
                              fontWeight: 600,
                              textTransform: "none",
                              "&:hover": {
                                color: PRIMARY,
                                bgcolor: "transparent",
                              },
                            }}
                          >
                            Lưu để mua sau
                          </Button>
                        )}
                      </Stack>
                    </Box>

                    {/* Price Column */}
                    <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                      {laMienPhi ? (
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: 16,
                            color: "#059669",
                          }}
                        >
                          Miễn phí
                        </Typography>
                      ) : (
                        <>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: 16.5,
                              color: "text.primary",
                            }}
                          >
                            {formatGia(item.gia)}
                          </Typography>
                          {Boolean(
                            item.giaGoc && item.giaGoc > (item.gia ?? 0),
                          ) && (
                            <Typography
                              sx={{
                                fontSize: 12.5,
                                color: "text.disabled",
                                textDecoration: "line-through",
                                mt: 0.25,
                              }}
                            >
                              {formatGia(item.giaGoc)}
                            </Typography>
                          )}
                        </>
                      )}
                    </Box>
                  </Box>
                  <Divider sx={{ borderColor: "rgba(0,0,0,0.06)" }} />
                </Box>
              );
            })}
          </Box>

          {/* ── Tóm tắt đơn hàng (Order Summary Card) ── */}
          <Box
            sx={{
              width: { xs: "100%", md: 320 },
              flexShrink: 0,
              borderRadius: "16px",
              border: "1px solid rgba(0,0,0,0.08)",
              bgcolor: "background.paper",
              boxShadow: "0 6px 24px rgba(0,0,0,0.04)",
              p: 2.5,
            }}
          >
            {tatCaLaMienPhi ? (
              <>
                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <SchoolRoundedIcon
                    sx={{ fontSize: 44, color: "#059669", mb: 1 }}
                  />
                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: 900,
                      color: "#059669",
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
                      <SchoolRoundedIcon />
                    )
                  }
                  sx={{
                    bgcolor: "#059669",
                    "&:hover": { bgcolor: "#047857" },
                    borderRadius: "10px",
                    fontWeight: 800,
                    fontSize: 15,
                    py: 1.4,
                    boxShadow: "none",
                    textTransform: "none",
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
                    sx={{
                      borderRadius: "10px",
                      mb: 2,
                      fontSize: 12,
                      bgcolor: "rgba(37, 99, 235, 0.06)",
                      color: "#1e40af",
                      border: "1px solid rgba(37, 99, 235, 0.15)",
                    }}
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
                    fontSize: 28,
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
                  <Box
                    sx={{
                      mb: 1.5,
                      p: 1,
                      borderRadius: "8px",
                      bgcolor: "rgba(16, 185, 129, 0.08)",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center", justifyContent: "space-between" }}
                    >
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          color: "text.secondary",
                          textDecoration: "line-through",
                        }}
                      >
                        {formatGia(tongTien)}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          color: "#047857",
                          fontWeight: 700,
                        }}
                      >
                        Tiết kiệm {formatGia(ketQuaMa.tongSoTienGiam)}
                      </Typography>
                    </Stack>
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
                    "&:hover": { bgcolor: BRAND.dark },
                    borderRadius: "10px",
                    fontWeight: 800,
                    fontSize: 15,
                    py: 1.35,
                    mb: 2.5,
                    mt: 1,
                    boxShadow: "0 4px 14px rgba(139,19,19,0.22)",
                    textTransform: "none",
                    "&.Mui-disabled": { bgcolor: "#e2e8f0", color: "#94a3b8" },
                  }}
                >
                  Tiến hành thanh toán
                </Button>

                <Divider sx={{ mb: 2, borderColor: "rgba(0,0,0,0.08)" }} />

                {/* Voucher Section */}
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 800,
                    mb: 0.5,
                    color: "text.primary",
                  }}
                >
                  Mã ưu đãi
                </Typography>
                <Typography
                  sx={{ fontSize: 12, color: "text.secondary", mb: 1.5 }}
                >
                  Có thể áp dụng nhiều mã cùng lúc, mỗi mã chỉ giảm cho 1 khóa học
                </Typography>

                {/* Available Coupons list */}
                {loadingMaKhaDung ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 1 }}
                  >
                    <CircularProgress size={16} sx={{ color: PRIMARY }} />
                  </Box>
                ) : dsMaKhaDung.filter(
                    (km) => !dsMaDaThem.includes(km.maGiamGia),
                  ).length > 0 ? (
                  <Box sx={{ mb: 1.75 }}>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "text.primary",
                        mb: 0.75,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <ConfirmationNumberOutlinedIcon sx={{ fontSize: 15, color: PRIMARY }} />
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
                              border: "1.5px dashed rgba(139, 19, 19, 0.25)",
                              borderRadius: "8px",
                              px: 1.25,
                              py: 0.75,
                              cursor: apDungLoading ? "default" : "pointer",
                              opacity: apDungLoading ? 0.6 : 1,
                              bgcolor: "rgba(139, 19, 19, 0.02)",
                              transition: "all 0.15s ease",
                              "&:hover": apDungLoading
                                ? {}
                                : {
                                    bgcolor: "rgba(139, 19, 19, 0.05)",
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
                                  letterSpacing: 0.25,
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
                                bgcolor: "rgba(139, 19, 19, 0.08)",
                                color: PRIMARY,
                                fontWeight: 800,
                                fontSize: 11,
                                height: 22,
                                border: "1px solid rgba(139, 19, 19, 0.2)",
                                "&:hover": {
                                  bgcolor: PRIMARY,
                                  color: "#ffffff",
                                },
                              }}
                            />
                          </Box>
                        ))}
                    </Box>
                  </Box>
                ) : null}

                {/* Applied Coupons Chips */}
                {dsMaDaThem.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.75,
                      mb: 1.5,
                    }}
                  >
                    {ketQuaMa?.ketQua.map((kq) => {
                      const isValid = kq.hopLe;
                      return (
                        <Chip
                          key={kq.maGiamGia}
                          label={
                            isValid
                              ? `${kq.maGiamGia} (-${formatGia(kq.soTienGiam)})`
                              : `${kq.maGiamGia} (không áp dụng)`
                          }
                          onDelete={() => handleXoaMa(kq.maGiamGia)}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: 12,
                            borderRadius: "6px",
                            height: 26,
                            bgcolor: isValid
                              ? "rgba(16, 185, 129, 0.12)"
                              : "rgba(239, 68, 68, 0.08)",
                            color: isValid ? "#065f46" : "#991b1b",
                            border: isValid
                              ? "1px solid rgba(16, 185, 129, 0.3)"
                              : "1px solid rgba(239, 68, 68, 0.2)",
                            "& .MuiChip-deleteIcon": {
                              color: isValid ? "#059669" : "#dc2626",
                              fontSize: 16,
                              "&:hover": {
                                color: isValid ? "#047857" : "#b91c1c",
                              },
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                )}

                {/* Coupon Input Box */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "stretch",
                    height: 38,
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
                        bgcolor: "background.paper",
                        "& fieldset": {
                          borderColor: "rgba(0,0,0,0.15)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(0,0,0,0.25)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: PRIMARY,
                        },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    disabled={apDungLoading || !maDangNhap.trim()}
                    onClick={handleThemMa}
                    sx={{
                      height: "100%",
                      bgcolor: PRIMARY,
                      color: "#ffffff",
                      borderRadius: "8px",
                      px: 2,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      fontWeight: 700,
                      fontSize: 13,
                      boxShadow: "none",
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: BRAND.dark,
                        boxShadow: "none",
                      },
                      "&.Mui-disabled": {
                        bgcolor: "#e2e8f0",
                        color: "#94a3b8",
                      },
                    }}
                  >
                    {apDungLoading ? (
                      <CircularProgress size={14} sx={{ color: "#fff" }} />
                    ) : (
                      "Thêm"
                    )}
                  </Button>
                </Box>

                {/* Error Notice */}
                {ketQuaMa?.ketQua.some((k) => !k.hopLe) && (
                  <Box
                    sx={{
                      mt: 1.25,
                      p: 1,
                      borderRadius: "8px",
                      bgcolor: "rgba(239, 68, 68, 0.06)",
                      border: "1px solid rgba(239, 68, 68, 0.18)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 0.75,
                    }}
                  >
                    <InfoOutlinedIcon
                      sx={{ fontSize: 16, color: "error.main", mt: "1px", flexShrink: 0 }}
                    />
                    <Typography
                      sx={{ fontSize: 11.5, color: "#b91c1c", lineHeight: 1.4 }}
                    >
                      {ketQuaMa.ketQua
                        .filter((k) => !k.hopLe)
                        .map((k) => `${k.maGiamGia}: ${k.thongBao}`)
                        .join(" • ")}
                    </Typography>
                  </Box>
                )}

                {vuaThayDoiGioHang && !ketQuaMa && (
                  <Box
                    sx={{
                      mt: 1.25,
                      p: 1,
                      borderRadius: "8px",
                      bgcolor: "rgba(245, 158, 11, 0.08)",
                      border: "1px solid rgba(245, 158, 11, 0.2)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 0.75,
                    }}
                  >
                    <InfoOutlinedIcon
                      sx={{ fontSize: 16, color: "#d97706", mt: "1px", flexShrink: 0 }}
                    />
                    <Typography
                      sx={{ fontSize: 11.5, color: "#b45309", lineHeight: 1.4 }}
                    >
                      Giỏ hàng đã thay đổi — vui lòng áp dụng lại mã giảm giá nếu cần.
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      )}

      {/* ── Đã lưu để mua sau ── */}
      {savedItems.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 800,
              mb: 1.5,
              color: "text.primary",
            }}
          >
            Đã lưu để mua sau ({savedItems.length})
          </Typography>
          <Divider sx={{ mb: 1, borderColor: "rgba(0,0,0,0.08)" }} />
          {savedItems.map((item) => {
            const imgUrl = getCourseImage(item.hinhAnh);
            const isFree = !item.gia || item.gia === 0;
            const instructor =
              item.danhSachGiangVien && item.danhSachGiangVien.length > 0
                ? item.danhSachGiangVien.join(", ")
                : (item.tenTacGia ?? "Giảng viên EduVerse");

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
                    onClick={() => {
                      if (item.idKhoaHoc) {
                        router.push(`/student/enroll-courses/${item.idKhoaHoc}`);
                      }
                    }}
                    sx={{
                      width: 140,
                      height: 84,
                      flexShrink: 0,
                      borderRadius: "10px",
                      overflow: "hidden",
                      border: "1px solid rgba(0,0,0,0.08)",
                      bgcolor: "var(--dashboard-surface-muted, #f3f4f6)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={item.tenKhoaHoc ?? ""}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <SchoolRoundedIcon
                        sx={{ fontSize: 32, color: "text.disabled" }}
                      />
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      onClick={() => {
                        if (item.idKhoaHoc) {
                          router.push(`/student/enroll-courses/${item.idKhoaHoc}`);
                        }
                      }}
                      sx={{
                        fontWeight: 700,
                        fontSize: 15,
                        mb: 0.5,
                        lineHeight: 1.35,
                        color: "text.primary",
                        cursor: "pointer",
                        "&:hover": { color: PRIMARY },
                      }}
                    >
                      {item.tenKhoaHoc}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 12.5, color: "text.secondary", mb: 1 }}
                    >
                      {instructor}
                    </Typography>
                    <Stack direction="row" spacing={2.5}>
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
                          fontSize: 12.5,
                          p: 0,
                          minWidth: 0,
                          fontWeight: 700,
                          textTransform: "none",
                          "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
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
                        sx={{
                          color: "text.secondary",
                          fontSize: 12.5,
                          p: 0,
                          minWidth: 0,
                          fontWeight: 600,
                          textTransform: "none",
                          "&:hover": { color: "error.main", bgcolor: "transparent" },
                        }}
                      >
                        Xóa
                      </Button>
                    </Stack>
                  </Box>
                  <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    {isFree ? (
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: 16,
                          color: "#059669",
                        }}
                      >
                        Miễn phí
                      </Typography>
                    ) : (
                      <>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: 16.5,
                            color: "text.primary",
                          }}
                        >
                          {formatGia(item.gia)}
                        </Typography>
                        {Boolean(
                          item.giaGoc && item.giaGoc > (item.gia ?? 0),
                        ) && (
                          <Typography
                            sx={{
                              fontSize: 12.5,
                              color: "text.disabled",
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
                <Divider sx={{ borderColor: "rgba(0,0,0,0.06)" }} />
              </Box>
            );
          })}
        </Box>
      )}

      {/* ── Bạn cũng có thể thích (Recommendations) ── */}
      {pagedResult && pagedResult.items.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Divider sx={{ mb: 3, borderColor: "rgba(0,0,0,0.08)" }} />
          <Typography
            sx={{ fontSize: 18, fontWeight: 800, mb: 2, color: "text.primary" }}
          >
            Bạn cũng có thể thích
          </Typography>
          <Divider sx={{ mb: 2, borderColor: "rgba(0,0,0,0.06)" }} />
          {pagedResult.items
            .filter((kh) => !items.some((i) => i.idKhoaHoc === kh.id))
            .slice(0, 4)
            .map((kh) => {
              const laMienPhi = !kh.gia || kh.gia === 0;
              const imgUrl = getCourseImage(kh.hinhAnhKhoaHoc);
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
                      onClick={() => router.push(`/student/enroll-courses/${kh.id}`)}
                      sx={{
                        width: 140,
                        height: 84,
                        flexShrink: 0,
                        borderRadius: "10px",
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,0.08)",
                        bgcolor: "var(--dashboard-surface-muted, #f3f4f6)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={kh.tieuDe ?? ""}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <SchoolRoundedIcon
                          sx={{ fontSize: 32, color: "text.disabled" }}
                        />
                      )}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        onClick={() => router.push(`/student/enroll-courses/${kh.id}`)}
                        sx={{
                          fontWeight: 700,
                          fontSize: 15,
                          mb: 0.5,
                          lineHeight: 1.35,
                          color: "text.primary",
                          cursor: "pointer",
                          "&:hover": { color: PRIMARY },
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
                            fontWeight: 700,
                            height: 20,
                            mb: 0.5,
                            bgcolor: "rgba(139, 19, 19, 0.08)",
                            color: PRIMARY,
                            borderRadius: "4px",
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
                            mb: 0.75,
                            color: "#059669",
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
                              mb: 0.5,
                              color: "text.primary",
                            }}
                          >
                            {formatGia(kh.gia)}
                          </Typography>
                          {Boolean(kh.giaGoc && kh.giaGoc > (kh.gia ?? 0)) && (
                            <Typography
                              sx={{
                                fontSize: 12,
                                color: "text.disabled",
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
                            bgcolor: "#059669",
                            "&:hover": { bgcolor: "#047857" },
                            borderRadius: "8px",
                            fontSize: 12,
                            fontWeight: 700,
                            boxShadow: "none",
                            textTransform: "none",
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
                            borderColor: "rgba(139, 19, 19, 0.3)",
                            color: PRIMARY,
                            borderRadius: "8px",
                            fontSize: 12,
                            fontWeight: 700,
                            textTransform: "none",
                            "&:hover": {
                              bgcolor: "rgba(139, 19, 19, 0.04)",
                              borderColor: PRIMARY,
                            },
                          }}
                        >
                          Thêm vào giỏ
                        </Button>
                      )}
                    </Box>
                  </Box>
                  <Divider sx={{ borderColor: "rgba(0,0,0,0.06)" }} />
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
            borderRadius: "20px",
            border: "1px solid rgba(0,0,0,0.06)",
            bgcolor: "background.paper",
            boxShadow: "0 4px 24px rgba(0,0,0,0.02)",
          }}
        >
          <GioHangContent />
        </Box>
      </StudentDashboardShell>
    </AuthGuard>
  );
}
