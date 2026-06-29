"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Stack,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useDispatch, useSelector } from "../../../store/hook";
import { getDonHang } from "../../../store/thanhToan/ThanhToanSlice";

const PRIMARY = "#9b1c1c";

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { donHangs } = useSelector((s) => s.thanhToan);

  const code = searchParams.get("code");
  const orderCode = searchParams.get("orderCode");
  const isSuccess = code === "00";

  useEffect(() => {
    if (isSuccess) {
      dispatch(getDonHang());
    }
  }, [dispatch, isSuccess]);

  const donHang = donHangs.find(
    (d) =>
      d.maGiaoDich === `EDU${orderCode}` ||
      d.maGiaoDich?.includes(orderCode ?? ""),
  );

  return (
    <Box
      sx={{
        bgcolor: "#f9f8f6",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: "center",
            mb: 4,
          }}
        >
          {isSuccess ? (
            <CheckCircleIcon sx={{ fontSize: 72, color: PRIMARY }} />
          ) : (
            <CancelIcon sx={{ fontSize: 72, color: "#999" }} />
          )}

          <Typography
            sx={{
              fontSize: 24,
              fontWeight: 800,
              mt: 2,
              color: isSuccess ? PRIMARY : "text.secondary",
            }}
          >
            {isSuccess
              ? "Thanh toán thành công!"
              : code === "cancel"
                ? "Đã hủy thanh toán"
                : "Thanh toán thất bại"}
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              fontSize: 14,
              mt: 1,
            }}
          >
            {isSuccess
              ? "Chào mừng bạn đến với khóa học. Giao dịch của bạn đã được xử lý thành công."
              : "Giao dịch không thành công. Vui lòng thử lại."}
          </Typography>
        </Box>

        {isSuccess && donHang && (
          <Card
            sx={{
              borderRadius: 3,
              p: 2.5,
              mb: 3,
              borderLeft: `4px solid ${PRIMARY}`,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 13,
                mb: 1.5,
                letterSpacing: 0.5,
              }}
            >
              CHI TIẾT ĐƠN HÀNG
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 1,
                mb: 2,
              }}
            >
              <Box>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  Mã đơn hàng
                </Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                  {donHang.maGiaoDich}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  Tổng thanh toán
                </Typography>
                <Typography
                  sx={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}
                >
                  {donHang.soTienThanhToan?.toLocaleString("vi-VN")}đ
                </Typography>
              </Box>
            </Box>

            {/* Danh sách khóa học */}
            {donHang.chiTiets && donHang.chiTiets.length > 0 && (
              <>
                <Divider sx={{ mb: 1.5 }} />
                <Typography
                  sx={{ fontSize: 12, color: "text.secondary", mb: 1 }}
                >
                  Khóa học đã mua:
                </Typography>
                <Stack spacing={0.5}>
                  {donHang.chiTiets.map((ct, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                        📚 {ct.tenKhoaHoc ?? "Khóa học"}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 12, color: PRIMARY, fontWeight: 600 }}
                      >
                        {ct.giaLucDat?.toLocaleString("vi-VN")}đ
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </>
            )}
          </Card>
        )}

        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            onClick={() => router.push("/khoa-hoc-cua-toi")}
            sx={{
              bgcolor: PRIMARY,
              "&:hover": { bgcolor: "#7f1d1d" },
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            Bắt đầu học ngay
          </Button>

          <Button
            variant="outlined"
            onClick={() => router.push("/kham-pha")}
            sx={{
              borderColor: PRIMARY,
              color: PRIMARY,
              borderRadius: 2,
            }}
          >
            Khám phá thêm
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
