/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
} from "@mui/material";
import Image from "next/image";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { useState, useEffect, useCallback } from "react";
import AuthGuard from "@/src/components/AuthGuard";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import LoiMoiGiangVienService, {
  LoiMoiChoXacNhanDto,
} from "@/src/services/LoiMoiGiangVienService";
import { BRAND, NEUTRAL } from "@/src/theme/tokens";

const MAU = {
  chinh: BRAND.main,
  chinhDam: BRAND.dark,
  chinhNhat: BRAND.light,
  vien: NEUTRAL.divider,
};

const DANH_SACH_QUYEN_HIEN_THI = [
  { key: "manage", nhan: "Quản lý nội dung" },
  { key: "performance", nhan: "Xem thống kê" },
  { key: "qnA", nhan: "Hỏi đáp" },
  { key: "reviews", nhan: "Đánh giá" },
  { key: "assignments", nhan: "Bài tập" },
  { key: "materials", nhan: "Tài liệu" },
  { key: "promotions", nhan: "Khuyến mãi" },
];

function TrangThaiChip({ trangThai }: { trangThai: string }) {
  const map: Record<string, { nhan: string; mau: string; nen: string }> = {
    Pending: { nhan: "Chờ xác nhận", mau: "#D97706", nen: "#FEF3C7" },
    Accepted: { nhan: "Đã chấp nhận", mau: "#16A34A", nen: "#DCFCE7" },
    Rejected: { nhan: "Đã từ chối", mau: "#DC2626", nen: "#FEE2E2" },
  };
  const cfg = map[trangThai] ?? {
    nhan: trangThai,
    mau: "#8A7676",
    nen: "#F5F6F8",
  };
  return (
    <Chip
      label={cfg.nhan}
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: 11,
        color: cfg.mau,
        bgcolor: cfg.nen,
        borderRadius: "6px",
      }}
    />
  );
}

export default function InvitesPage() {
  const [danhSach, setDanhSach] = useState<LoiMoiChoXacNhanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dangXuLyId, setDangXuLyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const loadDanhSach = useCallback(async () => {
    setLoading(true);
    try {
      const data = await LoiMoiGiangVienService.GetLoiMoiCuaToi();
      setDanhSach(data);
    } catch (err: any) {
      setToast({
        open: true,
        message: err.message || "Lỗi tải dữ liệu",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDanhSach();
  }, [loadDanhSach]);

  const handlePhanHoi = async (id: string, dongY: boolean) => {
    setDangXuLyId(id);
    try {
      await LoiMoiGiangVienService.PhanHoi(id, dongY);
      setToast({
        open: true,
        message: dongY ? "Đã chấp nhận lời mời!" : "Đã từ chối lời mời",
        severity: "success",
      });
      await loadDanhSach();
    } catch (err: any) {
      setToast({
        open: true,
        message: err.message || "Có lỗi xảy ra",
        severity: "error",
      });
    } finally {
      setDangXuLyId(null);
    }
  };

  const pending = danhSach.filter((x) => x.trangThai === "Pending");
  const resolved = danhSach.filter((x) => x.trangThai !== "Pending");

  return (
    <AuthGuard allowedRoles={["Admin", "GiaoVien"]}>
      <DashboardShell>
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: "auto" }}>
          <Typography
            sx={{ fontWeight: 900, fontSize: 26, color: "#1E293B", mb: 0.5 }}
          >
            Lời mời cộng tác
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#4B5563", mb: 4 }}>
            Các lời mời tham gia giảng dạy cùng giảng viên khác
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: MAU.chinh }} />
            </Box>
          ) : danhSach.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                textAlign: "center",
                py: 8,
                borderRadius: "16px",
                border: `1px dashed ${MAU.vien}`,
              }}
            >
              <SchoolOutlinedIcon
                sx={{ fontSize: 48, color: MAU.chinh, opacity: 0.5, mb: 2 }}
              />
              <Typography
                sx={{ fontWeight: 700, fontSize: 16, color: "#1F2937" }}
              >
                Chưa có lời mời nào
              </Typography>
              <Typography sx={{ fontSize: 14, color: "#8A7676", mt: 0.5 }}>
                Khi có giảng viên mời bạn cộng tác, lời mời sẽ hiện ở đây.
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {/* Chờ xác nhận */}
              {pending.length > 0 && (
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: 15,
                      color: "#1F2937",
                      mb: 2,
                    }}
                  >
                    Chờ xác nhận ({pending.length})
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {pending.map((lm) => (
                      <LoiMoiCard
                        key={lm.id}
                        loiMoi={lm}
                        dangXuLy={dangXuLyId === lm.id}
                        onPhanHoi={handlePhanHoi}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Đã xử lý */}
              {resolved.length > 0 && (
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: 15,
                      color: "#8A7676",
                      mb: 2,
                    }}
                  >
                    Đã xử lý ({resolved.length})
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {resolved.map((lm) => (
                      <LoiMoiCard key={lm.id} loiMoi={lm} dangXuLy={false} />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          <Snackbar
            open={toast.open}
            autoHideDuration={4000}
            onClose={() => setToast({ ...toast, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert severity={toast.severity} sx={{ width: "100%" }}>
              {toast.message}
            </Alert>
          </Snackbar>
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}

function LoiMoiCard({
  loiMoi,
  dangXuLy,
  onPhanHoi,
}: {
  loiMoi: LoiMoiChoXacNhanDto;
  dangXuLy: boolean;
  onPhanHoi?: (id: string, dongY: boolean) => void;
}) {
  const isPending = loiMoi.trangThai === "Pending";
  const quyenDuocCap = DANH_SACH_QUYEN_HIEN_THI.filter(
    (q) => (loiMoi as any)[q.key] === true,
  );

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "14px",
        border: `1px solid ${isPending ? `${BRAND.main}44` : NEUTRAL.divider}`,
        bgcolor: isPending ? `${BRAND.main}05` : "var(--ev-paper, #FFFFFF)",
        overflow: "hidden",
      }}
    >
      {/* Thông tin khóa học */}
      <Box sx={{ display: "flex", gap: 2, p: 2.5 }}>
        <Box
          sx={{
            width: 72,
            height: 48,
            borderRadius: "8px",
            flexShrink: 0,
            bgcolor: "var(--ev-paper-alt, #F5F6F8)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {loiMoi.hinhAnhKhoaHoc ? (
            <Image
              src={loiMoi.hinhAnhKhoaHoc}
              alt=""
              fill
              style={{ objectFit: "cover" }}
              unoptimized
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SchoolOutlinedIcon sx={{ color: "#C7CCD6", fontSize: 22 }} />
            </Box>
          )}
        </Box>

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
              sx={{
                fontWeight: 700,
                fontSize: 15,
                color: "#1F2937",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {loiMoi.tenKhoaHoc || "Chưa có tên"}
            </Typography>
            <TrangThaiChip trangThai={loiMoi.trangThai} />
          </Box>

          {/* Người mời */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              src={loiMoi.anhNguoiMoi || ""}
              sx={{ width: 20, height: 20, fontSize: 11 }}
            >
              {loiMoi.tenNguoiMoi?.[0]}
            </Avatar>
            <Typography sx={{ fontSize: 13, color: "#4B5563" }}>
              Mời bởi <strong>{loiMoi.tenNguoiMoi || "Giảng viên"}</strong>
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#8A7676" }}>
              · {new Date(loiMoi.ngayMoi).toLocaleDateString("vi-VN")}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Quyền và % */}
      <Box sx={{ px: 2.5, py: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 1.5,
            flexWrap: "wrap",
          }}
        >
          <Chip
            label={`${loiMoi.tyLeChiaDoanhThu}% doanh thu`}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: 12,
              bgcolor: `${BRAND.main}14`,
              color: BRAND.main,
            }}
          />
          {loiMoi.visible && (
            <Chip
              label="Hiển thị công khai"
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: 12,
                bgcolor: "#DCFCE7",
                color: "#16A34A",
              }}
            />
          )}
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {quyenDuocCap.length > 0 ? (
            quyenDuocCap.map((q) => (
              <Chip
                key={q.key}
                label={q.nhan}
                size="small"
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  bgcolor: "var(--ev-paper-alt, #F5F6F8)",
                  color: "#4B5563",
                }}
              />
            ))
          ) : (
            <Typography
              sx={{ fontSize: 12, color: "#8A7676", fontStyle: "italic" }}
            >
              Chưa có quyền nào
            </Typography>
          )}
        </Box>
      </Box>

      {/* Actions */}
      {isPending && onPhanHoi && (
        <>
          <Divider />
          <Box
            sx={{
              px: 2.5,
              py: 2,
              display: "flex",
              gap: 1.5,
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              startIcon={
                dangXuLy ? <CircularProgress size={14} /> : <CloseIcon />
              }
              disabled={dangXuLy}
              onClick={() => onPhanHoi(loiMoi.id, false)}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "10px",
                borderColor: "#DC2626",
                color: "#DC2626",
                "&:hover": { bgcolor: "#FEE2E2", borderColor: "#DC2626" },
              }}
            >
              Từ chối
            </Button>
            <Button
              variant="contained"
              startIcon={
                dangXuLy ? (
                  <CircularProgress size={14} sx={{ color: "#fff" }} />
                ) : (
                  <CheckIcon />
                )
              }
              disabled={dangXuLy}
              onClick={() => onPhanHoi(loiMoi.id, true)}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "10px",
                boxShadow: "none",
                bgcolor: BRAND.main,
                "&:hover": { bgcolor: BRAND.dark, boxShadow: "none" },
              }}
            >
              Chấp nhận
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
}
