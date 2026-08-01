"use client";

import { Suspense, useEffect } from "react";
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
import AuthGuard from "@/src/components/AuthGuard";
import StudentDashboardShell from "@/src/components/dashboard/StudentDashboardShell";

const PRIMARY = "#8B1313";

function PaymentResultContent() {
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

  // idDangKi trả về trong chiTiets của đơn hàng - dùng để điều hướng thẳng
  // vào đúng khóa học vừa mua trên trang học
  const idDangKiVuaMua = (
    donHang?.chiTiets?.[0] as { idDangKi?: string | number } | undefined
  )?.idDangKi;

  return (
    <AuthGuard allowedRoles={["HocVien", "GiaoVien"]}>
      <StudentDashboardShell>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "70vh",
          }}
        >
          <Container maxWidth="sm">
            {/* Icon + tiêu đề */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
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

              <Typography sx={{ color: "text.secondary", fontSize: 14, mt: 1 }}>
                {isSuccess
                  ? "Chào mừng bạn đến với khóa học. Giao dịch của bạn đã được xử lý thành công."
                  : "Giao dịch không thành công. Vui lòng thử lại."}
              </Typography>
            </Box>

            {/* Chi tiết đơn hàng */}
            {isSuccess && donHang && (
              <Card
                sx={{
                  borderRadius: "24px",
                  p: 2.5,
                  mb: 3,
                  border: "1px solid rgba(141,19,19,0.06)",
                  borderLeft: `4px solid ${PRIMARY}`,
                  bgcolor: "#ffffff",
                  boxShadow: "0 10px 30px rgba(141,19,19,0.015)",
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
                            sx={{
                              fontSize: 12,
                              color: PRIMARY,
                              fontWeight: 600,
                            }}
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

            {/* Nút hành động */}
            <Stack
              direction="row"
              spacing={2}
              sx={{ justifyContent: "center" }}
            >
              <Button
                variant="contained"
                onClick={() =>
                  router.push(
                    idDangKiVuaMua
                      ? `/student/courses/my-courses/learning/${idDangKiVuaMua}`
                      : "/student/courses/my-courses/learning/",
                  )
                }
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
                onClick={() => router.push("/student/explore")}
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
      </StudentDashboardShell>
    </AuthGuard>
  );
}
export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <PaymentResultContent />
    </Suspense>
  );
}
