'use client';

import AuthGuard from '@/src/components/AuthGuard';
import StudentDashboardShell from "@/src/components/dashboard/StudentDashboardShell";
import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Divider, TextField,
  CircularProgress, Avatar, Chip, Snackbar, Alert,
} from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SchoolIcon from "@mui/icons-material/School";
import { useDispatch, useSelector } from "@/src/store/hook";
import { getGioHang, xoaKhoiGioHang, themVaoGioHang } from "@/src/store/gioHang/GioHangSlice";
import { getDanhSachMuaSau, luuMuaSau, xoaKhoiMuaSau, chuyenVaoGioHang } from "@/src/store/danhSachMuonMuaSau/DanhSachMuonMuaSauSlice";
import { getKhoaHocPaged } from "@/src/store/khoaHoc/KhoaHocSlice";
import { apiService } from "@/src/services/index";
import { useRouter } from "next/navigation";

interface MaGiamGiaResponse {
  hopLe: boolean;
  thongBao?: string;
  phanTramGiam?: number;
  soTienGiam?: number;
  soTienSauGiam?: number;
}

const PRIMARY = "#8D1313";

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
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">("success");
  const { gioHang, loading } = useSelector((s) => s.gioHang);
  const [maGiamGia, setMaGiamGia] = useState("");
  const [giaInfo, setGiaInfo] = useState<MaGiamGiaResponse | null>(null);
  const [apDungLoading, setApDungLoading] = useState(false);
  const [dangKyLoading, setDangKyLoading] = useState(false);
  const { items: savedItems } = useSelector((s) => s.muaSau);

  const items = gioHang?.items ?? [];
  const tongTien = gioHang?.tongTien ?? 0;
  const tongThanhToan = giaInfo?.hopLe ? (giaInfo.soTienSauGiam ?? tongTien) : tongTien;

  // Phân loại khóa học miễn phí và có phí
  const mienphi = items.filter((i) => !i.gia || i.gia === 0);
  const coPhí = items.filter((i) => i.gia && i.gia > 0);
  const tatCaLaMienPhi = items.length > 0 && coPhí.length === 0;

  useEffect(() => { dispatch(getGioHang()); }, [dispatch]);
  useEffect(() => { dispatch(getDanhSachMuaSau()); }, [dispatch]);
  useEffect(() => {
    dispatch(getKhoaHocPaged({ pageIndex: 1, pageSize: 4, search: "", danhMucId: "", capDo: "" }));
  }, [dispatch]);

  const formatGia = (gia?: number) =>
    gia && gia > 0 ? `${gia.toLocaleString("vi-VN")} ₫` : "Miễn phí";

  const handleApDungMa = async () => {
    if (!maGiamGia.trim()) return;
    setApDungLoading(true);
    try {
      const res = await apiService.post<MaGiamGiaResponse>(
        "/thanhtoan/kiem-tra-ma-giam-gia",
        { maGiamGia, khoaHocIds: coPhí.map((i) => i.idKhoaHoc!).filter(Boolean) }
      );
      setGiaInfo(res.data);
    } catch {
      setGiaInfo({ hopLe: false, thongBao: "Có lỗi xảy ra" });
    } finally {
      setApDungLoading(false);
    }
  };

  // Đăng ký toàn bộ khóa học miễn phí trong giỏ
  const handleDangKyMienPhi = async () => {
    const dsMienPhi = items.filter((i) => !i.gia || i.gia === 0);
    if (dsMienPhi.length === 0) return;

    setDangKyLoading(true);
    try {
      const results = await Promise.allSettled(
        dsMienPhi.map((item) =>
          apiService.post(`/dangkikhoahoc/dangki-khoahoc/${item.idKhoaHoc}`)
        )
      );

      const thanhCong = results.filter((r) => r.status === "fulfilled").length;
      const thatBai = results.filter((r) => r.status === "rejected").length;

      // Xóa khỏi giỏ các khóa đã đăng ký thành công
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
        setTimeout(() => router.push("/student/my-courses"), 1500);
      } else if (thanhCong > 0) {
        setAlertMessage(`Đăng ký ${thanhCong} thành công, ${thatBai} thất bại (có thể đã đăng ký)`);
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
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "40vh" }}>
        <CircularProgress sx={{ color: PRIMARY }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 26, fontWeight: 900, color: PRIMARY, mb: 0.5 }}>
          Giỏ hàng của tôi
        </Typography>
        <Typography sx={{ color: "rgba(31,41,55,0.55)", fontSize: 14 }}>
          {items.length} khóa học trong giỏ hàng
          {mienphi.length > 0 && (
            <Box component="span" sx={{ ml: 1, color: "success.main", fontWeight: 600 }}>
              ({mienphi.length} miễn phí)
            </Box>
          )}
        </Typography>
      </Box>

      {items.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 10, borderRadius: "16px",
          border: "1.5px dashed rgba(141,19,19,0.18)", bgcolor: "rgba(141,19,19,0.02)" }}>
          <Typography sx={{ fontSize: 40, mb: 2 }}>🛒</Typography>
          <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 1, color: "text.primary" }}>
            Giỏ hàng trống
          </Typography>
          <Typography sx={{ color: "text.secondary", mb: 3, fontSize: 14 }}>
            Hãy khám phá và thêm khóa học bạn yêu thích!
          </Typography>
          <Button variant="contained" onClick={() => router.push("/student/explore")}
            sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#7f1d1d" }, borderRadius: "10px", fontWeight: 700, px: 4, py: 1.2 }}>
            Khám phá khóa học
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start", flexDirection: { xs: "column", md: "row" } }}>

          {/* ── Danh sách khóa học ── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Divider sx={{ borderColor: "rgba(141,19,19,0.1)" }} />
            {items.map((item) => {
              const laMienPhi = !item.gia || item.gia === 0;
              return (
                <Box key={item.id}>
                  <Box sx={{ display: "flex", gap: 2, py: 2.5, alignItems: "flex-start" }}>
                    {/* Thumbnail */}
                    <Box sx={{ width: 130, height: 80, flexShrink: 0, borderRadius: "10px", overflow: "hidden", bgcolor: "#f0f0f0" }}>
                      {item.hinhAnh ? (
                        <img src={item.hinhAnh} alt={item.tenKhoaHoc ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <Avatar variant="square" sx={{ width: "100%", height: "100%", bgcolor: "#e0e0e0", fontSize: 13, color: "#999" }}>Ảnh</Avatar>
                      )}
                    </Box>

                    {/* Thông tin */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 14, lineHeight: 1.4, color: "text.primary" }}>
                          {item.tenKhoaHoc}
                        </Typography>
                        {laMienPhi && (
                          <Chip label="Miễn phí" size="small" color="success"
                            sx={{ height: 18, fontSize: 10, fontWeight: 700 }} />
                        )}
                      </Box>
                      <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}>
                        {item.tenTacGia ?? "Giảng viên"}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                        {item.tongBaiGiang != null && (
                          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                            {item.tongBaiGiang} bài giảng
                          </Typography>
                        )}
                        {item.tongThoiLuong != null && (
                          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                            • {formatThoiLuong(item.tongThoiLuong)}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Button size="small" startIcon={<DeleteOutlinedIcon sx={{ fontSize: 16 }} />}
                          onClick={async () => {
                            await dispatch(xoaKhoiGioHang(item.idKhoaHoc!));
                            dispatch(getGioHang());
                          }}
                          sx={{ color: PRIMARY, fontSize: 12, p: 0, minWidth: 0, fontWeight: 600 }}>
                          Xóa
                        </Button>
                        {!laMienPhi && (
                          <Button size="small" startIcon={<FavoriteBorderIcon sx={{ fontSize: 16 }} />}
                            onClick={async () => {
                              await dispatch(luuMuaSau(item.idKhoaHoc!));
                              await dispatch(xoaKhoiGioHang(item.idKhoaHoc!));
                              dispatch(getGioHang());
                              dispatch(getDanhSachMuaSau());
                            }}
                            sx={{ color: PRIMARY, fontSize: 12, p: 0, minWidth: 0, fontWeight: 600 }}>
                            Lưu để mua sau
                          </Button>
                        )}
                      </Box>
                    </Box>

                    {/* Giá */}
                    <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                      {laMienPhi ? (
                        <Typography sx={{ fontWeight: 800, fontSize: 16, color: "success.main" }}>
                          Miễn phí
                        </Typography>
                      ) : (
                        <>
                          <Typography sx={{ fontWeight: 800, fontSize: 16, color: PRIMARY }}>
                            {formatGia(item.gia)}
                          </Typography>
                          {item.giaGoc && item.giaGoc > (item.gia ?? 0) && (
                            <Typography sx={{ fontSize: 12, color: "#6a6f73", textDecoration: "line-through" }}>
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
          <Box sx={{ width: { xs: "100%", md: 300 }, flexShrink: 0,
            borderRadius: "16px", border: "1.5px solid rgba(141,19,19,0.12)",
            bgcolor: "rgba(141,19,19,0.015)", p: 3 }}>

            {tatCaLaMienPhi ? (
              /* Toàn bộ miễn phí */
              <>
                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <SchoolIcon sx={{ fontSize: 48, color: "success.main", mb: 1 }} />
                  <Typography sx={{ fontSize: 22, fontWeight: 900, color: "success.main", mb: 0.5 }}>
                    Miễn phí!
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    {items.length} khóa học không mất phí
                  </Typography>
                </Box>
                <Button fullWidth variant="contained" size="large"
                  disabled={dangKyLoading}
                  onClick={handleDangKyMienPhi}
                  startIcon={dangKyLoading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <SchoolIcon />}
                  sx={{ bgcolor: "success.main", "&:hover": { bgcolor: "success.dark" },
                    borderRadius: "10px", fontWeight: 800, fontSize: 15, py: 1.5 }}>
                  {dangKyLoading ? "Đang đăng ký..." : "Đăng ký ngay"}
                </Button>
              </>
            ) : (
              /* Có khóa học trả phí */
              <>
                {/* Nếu có cả miễn phí lẫn trả phí, hiện cảnh báo */}
                {mienphi.length > 0 && (
                  <Alert severity="info" sx={{ borderRadius: "10px", mb: 2, fontSize: 12 }}>
                    <strong>{mienphi.length} khóa học miễn phí</strong> sẽ được đăng ký tự động khi thanh toán
                  </Alert>
                )}

                <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}>Tổng thanh toán:</Typography>
                <Typography sx={{ fontSize: 30, fontWeight: 900, color: PRIMARY, mb: 0.5 }}>
                  {tongThanhToan > 0 ? `${tongThanhToan.toLocaleString("vi-VN")} ₫` : "Miễn phí"}
                </Typography>

                {giaInfo?.hopLe && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography sx={{ fontSize: 13, color: "text.secondary", textDecoration: "line-through" }}>
                      {formatGia(tongTien)}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "success.main", fontWeight: 700 }}>
                      Tiết kiệm {formatGia(giaInfo.soTienGiam)} ({giaInfo.phanTramGiam}% giảm)
                    </Typography>
                  </Box>
                )}

                <Button fullWidth variant="contained" size="large"
                  disabled={items.length === 0 || loading}
                  onClick={() => {
                    if (giaInfo?.hopLe) sessionStorage.setItem("maGiamGia", maGiamGia);
                    else sessionStorage.removeItem("maGiamGia");
                    router.push("/student/payment");
                  }}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#7f1d1d" }, borderRadius: "10px",
                    fontWeight: 800, fontSize: 15, py: 1.5, mb: 2.5, mt: 1,
                    "&.Mui-disabled": { bgcolor: "#ddd", color: "#aaa" } }}>
                  Tiến hành thanh toán
                </Button>

                <Divider sx={{ mb: 2, borderColor: "rgba(141,19,19,0.1)" }} />

                <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 1, color: "text.primary" }}>Mã ưu đãi</Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 1.5 }}>
                  Áp dụng mã coupon hoặc khuyến mãi
                </Typography>

                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField size="small" fullWidth placeholder="Nhập mã..."
                    value={maGiamGia}
                    onChange={(e) => { setMaGiamGia(e.target.value); setGiaInfo(null); }}
                    error={giaInfo !== null && !giaInfo.hopLe}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 13, bgcolor: "#fff",
                      "&.Mui-focused fieldset": { borderColor: PRIMARY } } }}
                  />
                  <Button variant="outlined" size="small"
                    disabled={apDungLoading || !maGiamGia.trim()}
                    onClick={handleApDungMa}
                    sx={{ borderColor: PRIMARY, color: PRIMARY, borderRadius: "8px", px: 2,
                      whiteSpace: "nowrap", flexShrink: 0, fontWeight: 700,
                      "&:hover": { bgcolor: "#fff0f0", borderColor: PRIMARY } }}>
                    {apDungLoading ? <CircularProgress size={14} sx={{ color: PRIMARY }} /> : "Áp dụng"}
                  </Button>
                </Box>
                {giaInfo && (
                  <Typography sx={{ fontSize: 12, color: giaInfo.hopLe ? "success.main" : "error.main", mt: 0.75 }}>
                    {giaInfo.thongBao}
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
          <Typography sx={{ fontSize: 17, fontWeight: 800, mb: 1.5, color: "text.primary" }}>
            Đã lưu để mua sau ({savedItems.length})
          </Typography>
          <Divider sx={{ mb: 1, borderColor: "rgba(141,19,19,0.1)" }} />
          {savedItems.map((item) => (
            <Box key={item.id}>
              <Box sx={{ display: "flex", gap: 2, py: 2.5, alignItems: "flex-start" }}>
                <Box sx={{ width: 130, height: 80, flexShrink: 0, borderRadius: "10px", overflow: "hidden", bgcolor: "#f0f0f0" }}>
                  {item.hinhAnh ? (
                    <img src={item.hinhAnh} alt={item.tenKhoaHoc ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Box sx={{ width: "100%", height: "100%", bgcolor: "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Typography sx={{ fontSize: 12, color: "#999" }}>Ảnh</Typography>
                    </Box>
                  )}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 0.5, lineHeight: 1.4, color: "text.primary" }}>
                    {item.tenKhoaHoc}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 1 }}>
                    {item.tenTacGia ?? "Giảng viên"}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button size="small"
                      onClick={async () => {
                        await dispatch(chuyenVaoGioHang(item.idKhoaHoc!));
                        dispatch(getGioHang());
                        dispatch(getDanhSachMuaSau());
                      }}
                      sx={{ color: PRIMARY, fontSize: 12, p: 0, minWidth: 0, fontWeight: 700 }}>
                      Chuyển vào giỏ hàng
                    </Button>
                    <Button size="small"
                      onClick={async () => {
                        await dispatch(xoaKhoiMuaSau(item.idKhoaHoc!));
                        dispatch(getDanhSachMuaSau());
                      }}
                      sx={{ color: "#666", fontSize: 12, p: 0, minWidth: 0 }}>
                      Xóa
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                  {!item.gia || item.gia === 0 ? (
                    <Typography sx={{ fontWeight: 800, fontSize: 15, color: "success.main" }}>Miễn phí</Typography>
                  ) : (
                    <>
                      <Typography sx={{ fontWeight: 800, fontSize: 15, color: PRIMARY }}>
                        {formatGia(item.gia)}
                      </Typography>
                      {item.giaGoc && item.giaGoc > (item.gia ?? 0) && (
                        <Typography sx={{ fontSize: 12, color: "#6a6f73", textDecoration: "line-through" }}>
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
          <Typography sx={{ fontSize: 17, fontWeight: 800, mb: 2, color: "text.primary" }}>
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
                  <Box sx={{ display: "flex", gap: 2, py: 2, alignItems: "flex-start" }}>
                    <Box sx={{ width: 130, height: 80, flexShrink: 0, borderRadius: "10px", overflow: "hidden", bgcolor: "#f0f0f0" }}>
                      {kh.hinhAnhKhoaHoc ? (
                        <img src={kh.hinhAnhKhoaHoc} alt={kh.tieuDe ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <Box sx={{ width: "100%", height: "100%", bgcolor: "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Typography sx={{ fontSize: 12, color: "#999" }}>Ảnh</Typography>
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 0.5, lineHeight: 1.4, color: "text.primary" }}>
                        {kh.tieuDe}
                      </Typography>
                      {kh.capDo && (
                        <Chip label={kh.capDo} size="small" sx={{ fontSize: 11, height: 20, mb: 0.5, bgcolor: "#f0f0f0" }} />
                      )}
                    </Box>
                    <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                      {laMienPhi ? (
                        <Typography sx={{ fontWeight: 800, fontSize: 15, mb: 0.5, color: "success.main" }}>
                          Miễn phí
                        </Typography>
                      ) : (
                        <>
                          <Typography sx={{ fontWeight: 800, fontSize: 15, mb: 0.5, color: PRIMARY }}>
                            {formatGia(kh.gia)}
                          </Typography>
                          {kh.giaGoc && kh.giaGoc > (kh.gia ?? 0) && (
                            <Typography sx={{ fontSize: 12, color: "#6a6f73", textDecoration: "line-through", mb: 0.5 }}>
                              {formatGia(kh.giaGoc)}
                            </Typography>
                          )}
                        </>
                      )}
                      {laMienPhi ? (
                        <Button size="small" variant="contained"
                          onClick={async () => {
                            try {
                              await apiService.post(`/dangkikhoahoc/dangki-khoahoc/${kh.id}`);
                              setAlertMessage("Đăng ký khóa học miễn phí thành công!");
                              setAlertSeverity("success");
                              setOpen(true);
                            } catch {
                              setAlertMessage("Đã đăng ký rồi hoặc có lỗi xảy ra");
                              setAlertSeverity("error");
                              setOpen(true);
                            }
                          }}
                          sx={{ bgcolor: "success.main", "&:hover": { bgcolor: "success.dark" },
                            borderRadius: "8px", fontSize: 12, fontWeight: 700 }}>
                          Đăng ký ngay
                        </Button>
                      ) : (
                        <Button size="small" variant="outlined"
                          onClick={async () => {
                            try {
                              await dispatch(themVaoGioHang(kh.id)).unwrap();
                              setAlertMessage("Đã thêm vào giỏ hàng!");
                              setAlertSeverity("success");
                              setOpen(true);
                              dispatch(getGioHang());
                            } catch {
                              setAlertMessage("Lỗi thêm vào giỏ hàng");
                              setAlertSeverity("error");
                              setOpen(true);
                            }
                          }}
                          sx={{ borderColor: PRIMARY, color: PRIMARY, borderRadius: "8px",
                            fontSize: 12, fontWeight: 700, "&:hover": { bgcolor: PRIMARY, color: "#fff" } }}>
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

      <Snackbar open={open} autoHideDuration={3000} onClose={() => setOpen(false)}>
        <Alert severity={alertSeverity} onClose={() => setOpen(false)}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default function StudentCartPage() {
  return (
    <AuthGuard allowedRoles={['HocVien', 'GiaoVien']}>
      <StudentDashboardShell>
        <Box sx={{ p: { xs: 2, md: 4 }, borderRadius: '24px', border: '1px solid rgba(141,19,19,0.06)',
          bgcolor: '#ffffff', boxShadow: '0 10px 30px rgba(141,19,19,0.015)' }}>
          <GioHangContent />
        </Box>
      </StudentDashboardShell>
    </AuthGuard>
  );
}