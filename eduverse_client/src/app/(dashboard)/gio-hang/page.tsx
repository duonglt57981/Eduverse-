"use client";

interface MaGiamGiaResponse {
  hopLe: boolean;
  thongBao?: string;
  phanTramGiam?: number;
  soTienGiam?: number;
  soTienSauGiam?: number;
}

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  TextField,
  CircularProgress,
  Avatar,
  Rating,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useDispatch, useSelector } from "../../../store/hook";
import {
  getGioHang,
  xoaKhoiGioHang,
  themVaoGioHang,
} from "../../../store/gioHang/GioHangSlice";
import {
  getDanhSachMuaSau,
  luuMuaSau,
  xoaKhoiMuaSau,
  chuyenVaoGioHang,
} from "../../../store/danhSachMuonMuaSau/DanhSachMuonMuaSauSlice";
import { getKhoaHocPaged } from "../../../store/khoaHoc/KhoaHocSlice";
import { apiService } from "../../../services/index";
import { useRouter } from "next/navigation";

const PRIMARY = "#9b1c1c";

const formatThoiLuong = (phut?: number) => {
  if (!phut) return null;
  const gio = Math.floor(phut / 60);
  const p = phut % 60;
  if (gio > 0 && p > 0) return `${gio} giờ ${p} phút`;
  if (gio > 0) return `${gio} giờ`;
  return `${p} phút`;
};

export default function GioHangPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { pagedResult } = useSelector((s) => s.khoaHoc);
  const [open, setOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const { gioHang, loading } = useSelector((s) => s.gioHang);
  const [maGiamGia, setMaGiamGia] = useState("");
  const [giaInfo, setGiaInfo] = useState<MaGiamGiaResponse | null>(null);
  const [apDungLoading, setApDungLoading] = useState(false);
  const { items: savedItems } = useSelector((s) => s.muaSau);

  const items = gioHang?.items ?? [];
  const tongTien = gioHang?.tongTien ?? 0;
  const tongThanhToan = giaInfo?.hopLe
    ? (giaInfo.soTienSauGiam ?? tongTien)
    : tongTien;

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

  const formatGia = (gia?: number) =>
    gia ? `${gia.toLocaleString("vi-VN")} ₫` : "Miễn phí";

  const handleApDungMa = async () => {
    if (!maGiamGia.trim()) return;
    setApDungLoading(true);
    try {
      const res = await apiService.post<MaGiamGiaResponse>(
        "/thanhtoan/kiem-tra-ma-giam-gia",
        {
          maGiamGia,
          khoaHocIds: items.map((i) => i.idKhoaHoc!).filter(Boolean),
        },
      );
      setGiaInfo(res.data);
    } catch {
      setGiaInfo({ hopLe: false, thongBao: "Có lỗi xảy ra" });
    } finally {
      setApDungLoading(false);
    }
  };

  if (loading && !gioHang) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress sx={{ color: PRIMARY }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>
      <Typography
        sx={{ fontSize: 28, fontWeight: 700, mb: 0.5, color: "text.primary" }}
      >
        Giỏ hàng
      </Typography>
      <Typography sx={{ color: "text.secondary", fontSize: 14, mb: 3 }}>
        {items.length} khóa học trong giỏ hàng
      </Typography>

      {items.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 600, mb: 1 }}>
            Giỏ hàng trống
          </Typography>
          <Typography sx={{ color: "text.secondary", mb: 3 }}>
            Hãy khám phá và thêm khóa học bạn yêu thích!
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push("/kham-pha")}
            sx={{
              bgcolor: PRIMARY,
              "&:hover": { bgcolor: "#7f1d1d" },
              borderRadius: 1,
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
            <Divider />
            {items.map((item) => (
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
                    sx={{
                      width: 130,
                      height: 80,
                      flexShrink: 0,
                      borderRadius: 1,
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

                  {/* Thông tin */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
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
                      {item.tenTacGia ?? "Giảng viên"}
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

                    {/* Actions */}
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button
                        size="small"
                        startIcon={<DeleteOutlinedIcon sx={{ fontSize: 16 }} />}
                        onClick={async () => {
                          await dispatch(xoaKhoiGioHang(item.idKhoaHoc!));
                          dispatch(getGioHang());
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
                      <Button
                        size="small"
                        startIcon={<FavoriteBorderIcon sx={{ fontSize: 16 }} />}
                        onClick={async () => {
                          await dispatch(luuMuaSau(item.idKhoaHoc!));
                          await dispatch(xoaKhoiGioHang(item.idKhoaHoc!));
                          dispatch(getGioHang());
                          dispatch(getDanhSachMuaSau());
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
                    </Box>
                  </Box>

                  {/* Giá */}
                  <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: 16,
                        color: "text.primary",
                      }}
                    >
                      {formatGia(item.gia)}
                    </Typography>
                    {item.giaGoc && item.giaGoc > (item.gia ?? 0) && (
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "#6a6f73",
                          textDecoration: "line-through",
                        }}
                      >
                        {formatGia(item.giaGoc)}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Divider />
              </Box>
            ))}
          </Box>

          {/* ── Tóm tắt đơn hàng ── */}
          <Box sx={{ width: { xs: "100%", md: 300 }, flexShrink: 0 }}>
            <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}>
              Tổng:
            </Typography>
            <Typography
              sx={{
                fontSize: 32,
                fontWeight: 800,
                color: "text.primary",
                mb: 0.5,
              }}
            >
              {formatGia(tongThanhToan)}
            </Typography>

            {giaInfo?.hopLe && (
              <Box sx={{ mb: 1 }}>
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
                  sx={{ fontSize: 13, color: "success.main", fontWeight: 600 }}
                >
                  Tiết kiệm {formatGia(giaInfo.soTienGiam)} (
                  {giaInfo.phanTramGiam}% giảm)
                </Typography>
              </Box>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={items.length === 0 || loading}
              onClick={() => {
                if (giaInfo?.hopLe)
                  sessionStorage.setItem("maGiamGia", maGiamGia);
                else sessionStorage.removeItem("maGiamGia");
                router.push("/thanh-toan");
              }}
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: PRIMARY,
                "&:hover": { bgcolor: "#7f1d1d" },
                borderRadius: 1,
                fontWeight: 700,
                fontSize: 15,
                py: 1.5,
                mb: 2,
                "&.Mui-disabled": { bgcolor: "#ddd", color: "#aaa" },
              }}
            >
              Tiến hành thanh toán
            </Button>

            <Divider sx={{ mb: 2 }} />

            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                mb: 1.5,
                color: "text.primary",
              }}
            >
              Ưu đãi
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 1 }}>
              Áp dụng mã coupon hoặc khuyến mãi
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Nhập mã..."
                value={maGiamGia}
                onChange={(e) => {
                  setMaGiamGia(e.target.value);
                  setGiaInfo(null);
                }}
                error={giaInfo !== null && !giaInfo.hopLe}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    fontSize: 13,
                    "&.Mui-focused fieldset": { borderColor: PRIMARY },
                  },
                }}
              />
              <Button
                variant="outlined"
                size="small"
                disabled={apDungLoading || !maGiamGia.trim()}
                onClick={handleApDungMa}
                sx={{
                  borderColor: PRIMARY,
                  color: PRIMARY,
                  borderRadius: 1,
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
                  "Áp dụng"
                )}
              </Button>
            </Box>

            {giaInfo && (
              <Typography
                sx={{
                  fontSize: 12,
                  color: giaInfo.hopLe ? "success.main" : "error.main",
                  mt: 0.5,
                }}
              >
                {giaInfo.thongBao}
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {/* ── Đã lưu để mua sau ── */}
      {savedItems.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography
            sx={{ fontSize: 18, fontWeight: 700, mb: 1, color: "text.primary" }}
          >
            Đã lưu để mua sau ({savedItems.length})
          </Typography>
          <Divider sx={{ mb: 1 }} />

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
                    borderRadius: 1,
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
                      fontWeight: 600,
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
                    {item.tenTacGia ?? "Giảng viên"}
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
                      onClick={async () => {
                        await dispatch(chuyenVaoGioHang(item.idKhoaHoc!));
                        dispatch(getGioHang());
                        dispatch(getDanhSachMuaSau());
                      }}
                      sx={{
                        color: PRIMARY,
                        fontSize: 12,
                        p: 0,
                        minWidth: 0,
                        fontWeight: 600,
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
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: "text.primary",
                    }}
                  >
                    {formatGia(item.gia)}
                  </Typography>
                  {item.giaGoc && item.giaGoc > (item.gia ?? 0) && (
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "#6a6f73",
                        textDecoration: "line-through",
                      }}
                    >
                      {formatGia(item.giaGoc)}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Divider />
            </Box>
          ))}
        </Box>
      )}

      {/* ── Bạn cũng có thể thích ── */}
      {pagedResult && pagedResult.items.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 3 }} />
          <Typography
            sx={{ fontSize: 18, fontWeight: 700, mb: 2, color: "text.primary" }}
          >
            Bạn cũng có thể thích
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {pagedResult.items
            .filter((kh) => !items.some((i) => i.idKhoaHoc === kh.id))
            .slice(0, 4)
            .map((kh) => (
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
                      borderRadius: 1,
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
                        fontWeight: 600,
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

                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      {kh.tongBaiGiang && (
                        <Typography
                          sx={{ fontSize: 12, color: "text.secondary" }}
                        >
                          {kh.tongBaiGiang} bài giảng
                        </Typography>
                      )}
                      {kh.tongThoiLuong && (
                        <Typography
                          sx={{ fontSize: 12, color: "text.secondary" }}
                        >
                          • {formatThoiLuong(kh.tongThoiLuong)}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: 15,
                        mb: 0.5,
                        color: "text.primary",
                      }}
                    >
                      {formatGia(kh.gia)}
                    </Typography>
                    {kh.giaGoc && kh.giaGoc > (kh.gia ?? 0) && (
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "#6a6f73",
                          textDecoration: "line-through",
                          mb: 0.5,
                        }}
                      >
                        {formatGia(kh.giaGoc)}
                      </Typography>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={async () => {
                        try {
                          await dispatch(themVaoGioHang(kh.id)).unwrap();
                          setAlertMessage("Đã thêm vào giỏ hàng!");
                          setOpen(true);
                          dispatch(getGioHang());
                        } catch {
                          setAlertMessage("Lỗi thêm vào giỏ hàng");
                          setOpen(true);
                        }
                      }}
                      sx={{
                        borderColor: PRIMARY,
                        color: PRIMARY,
                        borderRadius: 1,
                        fontSize: 12,
                        "&:hover": { bgcolor: PRIMARY, color: "#fff" },
                      }}
                    >
                      Thêm vào giỏ
                    </Button>
                  </Box>
                </Box>
                <Divider />
              </Box>
            ))}
        </Box>
      )}

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
      >
        <Alert severity="success" onClose={() => setOpen(false)}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
