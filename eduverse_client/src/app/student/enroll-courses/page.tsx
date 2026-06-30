/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  Alert,
  Paper,
  Stack,
  Divider,
  Tabs,
  Tab,
  Avatar,
  Dialog,
  DialogContent,
  CircularProgress,
  Snackbar,
  alpha,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SchoolIcon from "@mui/icons-material/School";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockIcon from "@mui/icons-material/Lock";
import StarIcon from "@mui/icons-material/Star";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import DevicesIcon from "@mui/icons-material/Devices";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import FolderIcon from "@mui/icons-material/Folder";
import CloseIcon from "@mui/icons-material/Close";
import AuthGuard from "@/src/components/AuthGuard";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import DangKiService from "@/src/services/DangKiService";
import KhoaHocService from "@/src/services/KhoaHocService";
import { KhoaHocType } from "../../instructor/manager-courses/types";

// ─── constants ────────────────────────────────────────────────────────────────

const RED = "#8D1313";
const RED_HOVER = "#6B1010";

// ─── styled components ────────────────────────────────────────────────────────

const HeroBanner = styled(Box)(() => ({
  background: "#1c1d1f",
  borderRadius: 20,
  padding: "2rem",
  marginBottom: "1.5rem",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    right: 0,
    width: 220,
    height: "100%",
    background: `radial-gradient(circle at top right, ${alpha(RED, 0.35)}, transparent 70%)`,
    pointerEvents: "none",
  },
}));

const SidebarCard = styled(Paper)(() => ({
  borderRadius: 16,
  border: "1px solid #fde8e8",
  boxShadow: "0 10px 30px rgba(141,19,19,0.08)",
  overflow: "hidden",
  position: "sticky",
  top: 24,
}));

const ThumbBox = styled(Box)<{ bgimg?: string }>(({ bgimg }) => ({
  position: "relative",
  paddingTop: "56%",
  background: bgimg
    ? `#1c1d1f url(${bgimg}) center/cover no-repeat`
    : "#1c1d1f",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const SectionCard = styled(Paper)(() => ({
  borderRadius: 16,
  border: "1px solid #fde8e8",
  boxShadow: "0 4px 16px rgba(141,19,19,0.05)",
  padding: "1.5rem",
}));

const LessonRow = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 0",
  borderBottom: "1px solid #f4f4f4",
  fontSize: 13,
  "&:last-child": { borderBottom: "none" },
}));

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatTongThoiLuong(totalSeconds?: number): string {
  if (!totalSeconds || totalSeconds <= 0) return "0 giờ";
  const hours = totalSeconds / 3600;
  return `${hours.toFixed(1)} giờ video`;
}

function formatLessonDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// mock reviews — chưa có API đánh giá
const REVIEWS = [
  {
    initials: "NM",
    name: "Nguyễn Minh",
    rating: 5,
    date: "12/06/2026",
    text: "Khóa học rất chi tiết và dễ hiểu. Giảng viên giải thích từng bước một, rất phù hợp với người mới bắt đầu.",
  },
  {
    initials: "HT",
    name: "Hoàng Thư",
    rating: 4,
    date: "05/06/2026",
    text: "Nội dung phong phú, bài tập thực hành tốt. Mong muốn thêm phần Next.js trong khóa học.",
  },
  {
    initials: "VD",
    name: "Việt Dũng",
    rating: 5,
    date: "28/05/2026",
    text: "Đã học nhiều khóa React nhưng đây là khóa tôi tâm đắc nhất. Cấu trúc rõ ràng, ví dụ thực tế.",
  },
];

// ─── inner content ──────────────────────────────────────────────────────────────

function CourseRegistrationContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const courseId = params?.id ?? "";

  const [tab, setTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  const [khoaHoc, setKhoaHoc] = useState<KhoaHocType | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const dangKiService = new DangKiService();
  const khoaHocService = new KhoaHocService();

  // ── Fetch dữ liệu khóa học ──────────────────────────────────────────────
  useEffect(() => {
    if (!courseId) return;

    let active = true;

    (async () => {
      setPageLoading(true);
      setPageError(null);
      try {
        const res = await khoaHocService.GetKhoaHocPreview(courseId);
        if (!active) return;
        setKhoaHoc(res.data);
        setEnrolled(!!res.data?.daDangKy);
      } catch {
        if (active) {
          setPageError("Không tải được thông tin khóa học. Vui lòng thử lại.");
        }
      } finally {
        if (active) setPageLoading(false);
      }
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await dangKiService.DangKiKhoaHocMienPhi(courseId);
      setModalOpen(false);
      setEnrolled(true);
      setSnackbar({
        open: true,
        message: "Đăng ký thành công! Chúc bạn học tốt.",
        severity: "success",
      });
    } catch {
      setModalOpen(false);
      setSnackbar({
        open: true,
        message: "Đăng ký thất bại. Vui lòng thử lại.",
        severity: "error",
      });
    } finally {
      setRegistering(false);
    }
  };

  if (pageLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: RED }} />
      </Box>
    );
  }

  if (pageError || !khoaHoc) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {pageError ?? "Không tìm thấy khóa học."}
      </Alert>
    );
  }

  const phanHocs = khoaHoc.danhSachPhanHoc ?? [];
  const isFree =
    khoaHoc.loaiKhoaHoc === "Khóa học miễn phí" ||
    !khoaHoc.gia ||
    khoaHoc.gia === 0;

  return (
    <Box>
      <Grid container spacing={3}>
        {/* ── Main column ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <HeroBanner>
            <Chip
              label={khoaHoc.loaiKhoaHoc ?? "KHÓA HỌC"}
              size="small"
              sx={{
                bgcolor: RED,
                color: "#fff",
                fontWeight: 700,
                fontSize: 11,
                mb: 1.5,
              }}
            />
            <Typography
              variant="h5"
              sx={{ color: "#fff", fontWeight: 800, mb: 1.5, lineHeight: 1.35 }}
            >
              {khoaHoc.tieuDe}
            </Typography>
            <Typography
              sx={{ color: "#ccc", fontSize: 13, mb: 2, lineHeight: 1.7 }}
            >
              {khoaHoc.moTa}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", mb: 2 }}
            >
              <Stack direction="row">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} sx={{ fontSize: 16, color: "#e0a800" }} />
                ))}
              </Stack>
              <Typography sx={{ color: "#aaa", fontSize: 12 }}>
                {khoaHoc.soLuongHocVien ?? 0} học viên
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={2.5}
              sx={{ flexWrap: "wrap", mb: 2 }}
            >
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <AccessTimeIcon sx={{ fontSize: 14, color: "#bbb" }} />
                <Typography sx={{ fontSize: 12, color: "#bbb" }}>
                  {formatTongThoiLuong(khoaHoc.tongThoiLuong)}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <MenuBookIcon sx={{ fontSize: 14, color: "#bbb" }} />
                <Typography sx={{ fontSize: 12, color: "#bbb" }}>
                  {khoaHoc.tongBaiGiang ?? 0} bài học
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <WorkspacePremiumIcon sx={{ fontSize: 14, color: "#bbb" }} />
                <Typography sx={{ fontSize: 12, color: "#bbb" }}>
                  Chứng chỉ hoàn thành
                </Typography>
              </Stack>
            </Stack>
          </HeroBanner>

          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              mb: 2.5,
              minHeight: 40,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: 13,
                minHeight: 40,
                color: "text.secondary",
              },
              "& .Mui-selected": { color: `${RED} !important` },
              "& .MuiTabs-indicator": { backgroundColor: RED },
            }}
          >
            <Tab label="Tổng quan" />
            <Tab label={`Nội dung (${phanHocs.length})`} />
            <Tab label="Đánh giá" />
          </Tabs>

          {tab === 0 && (
            <SectionCard>
              <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 2 }}>
                Mô tả khóa học
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  lineHeight: 1.8,
                  mb: 3,
                }}
              >
                {khoaHoc.moTa}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack direction="row" spacing={3} sx={{ flexWrap: "wrap" }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <MenuBookIcon sx={{ fontSize: 16, color: RED }} />
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    {phanHocs.length} phần học
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PlayArrowIcon sx={{ fontSize: 16, color: RED }} />
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    {khoaHoc.tongBaiGiang ?? 0} bài giảng
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FolderIcon sx={{ fontSize: 16, color: RED }} />
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    {khoaHoc.tongTaiLieu ?? 0} tài liệu đính kèm
                  </Typography>
                </Stack>
              </Stack>
            </SectionCard>
          )}

          {tab === 1 && (
            <Stack spacing={2}>
              {phanHocs.length === 0 && (
                <SectionCard>
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    Khóa học chưa có nội dung.
                  </Typography>
                </SectionCard>
              )}
              {phanHocs.map((phan, i) => (
                <SectionCard
                  key={phan.id ?? i}
                  sx={{ p: 0, overflow: "hidden" }}
                >
                  <Box sx={{ p: 2, bgcolor: "#fdf2f2" }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                      {phan.tenPhan}
                    </Typography>
                  </Box>
                  <Box sx={{ px: 2 }}>
                    {(phan.danhSachBaiGiang ?? []).map((bg: any, j: number) => (
                      <LessonRow key={bg.id ?? j}>
                        {bg.laBaiGiangFree ? (
                          <PlayArrowIcon
                            sx={{ fontSize: 16, color: "text.disabled" }}
                          />
                        ) : (
                          <LockIcon
                            sx={{ fontSize: 16, color: "text.disabled" }}
                          />
                        )}
                        <Typography sx={{ flex: 1, fontSize: 13 }}>
                          {bg.tieuDe}
                        </Typography>
                        {bg.laBaiGiangFree && (
                          <Chip
                            label="Miễn phí"
                            size="small"
                            sx={{
                              bgcolor: "#e8f5e9",
                              color: "#2e7d32",
                              fontSize: 10,
                              height: 20,
                            }}
                          />
                        )}
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "text.disabled",
                            minWidth: 40,
                            textAlign: "right",
                          }}
                        >
                          {formatLessonDuration(bg.thoiLuong)}
                        </Typography>
                      </LessonRow>
                    ))}
                  </Box>
                </SectionCard>
              ))}
            </Stack>
          )}

          {tab === 2 && (
            <SectionCard>
              <Stack divider={<Divider />} spacing={2}>
                {REVIEWS.map((r, i) => (
                  <Box key={i}>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{ alignItems: "center", mb: 1 }}
                    >
                      <Avatar
                        sx={{
                          width: 34,
                          height: 34,
                          bgcolor: RED,
                          fontSize: 13,
                        }}
                      >
                        {r.initials}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                          {r.name}
                        </Typography>
                        <Stack direction="row">
                          {[...Array(5)].map((_, k) => (
                            <StarIcon
                              key={k}
                              sx={{
                                fontSize: 13,
                                color: k < r.rating ? "#e0a800" : "#e0e0e0",
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                      <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
                        {r.date}
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "text.secondary",
                        lineHeight: 1.65,
                      }}
                    >
                      {r.text}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </SectionCard>
          )}
        </Grid>

        {/* ── Sidebar ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <SidebarCard>
            <ThumbBox bgimg={khoaHoc.hinhAnhKhoaHoc}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  bgcolor: alpha(RED, 0.9),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <PlayArrowIcon sx={{ color: "#fff", fontSize: 26 }} />
              </Box>
              {khoaHoc.urlViewPreviewKhoaHoc && (
                <Chip
                  label="Xem thử miễn phí"
                  size="small"
                  sx={{
                    position: "absolute",
                    bottom: 10,
                    left: 10,
                    bgcolor: "rgba(0,0,0,0.55)",
                    color: "#ddd",
                    fontSize: 10,
                    height: 22,
                  }}
                />
              )}
            </ThumbBox>

            <Box sx={{ p: 2.5 }}>
              <Stack
                direction="row"
                spacing={1.25}
                sx={{ alignItems: "baseline", mb: 0.5 }}
              >
                <Typography sx={{ fontSize: 24, fontWeight: 800 }}>
                  {isFree
                    ? "Miễn phí"
                    : `${khoaHoc.gia?.toLocaleString("vi-VN")}₫`}
                </Typography>
                {khoaHoc.giaGoc && khoaHoc.giaGoc !== khoaHoc.gia && (
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "text.disabled",
                      textDecoration: "line-through",
                    }}
                  >
                    {khoaHoc.giaGoc.toLocaleString("vi-VN")}₫
                  </Typography>
                )}
              </Stack>

              {!enrolled ? (
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<SchoolIcon />}
                  onClick={() => setModalOpen(true)}
                  sx={{
                    bgcolor: isFree ? "#2d7a35" : RED,
                    "&:hover": { bgcolor: isFree ? "#245f2a" : RED_HOVER },
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: 2,
                    py: 1.25,
                    mb: 1.25,
                  }}
                >
                  {isFree ? "Đăng ký miễn phí" : "Đăng ký ngay"}
                </Button>
              ) : (
                <Alert
                  icon={<CheckCircleIcon fontSize="inherit" />}
                  severity="success"
                  sx={{ mb: 1.25, borderRadius: 2 }}
                  action={
                    <Button
                      size="small"
                      onClick={() =>
                        router.push(`/hoc-vien/khoa-hoc-cua-toi/${khoaHoc.id}`)
                      }
                      sx={{ color: "#1b5e20", fontWeight: 700 }}
                    >
                      Vào học
                    </Button>
                  }
                >
                  Đã đăng ký
                </Alert>
              )}

              <Stack
                direction="row"
                spacing={0.5}
                sx={{ justifyContent: "center", mb: 2 }}
              >
                <VerifiedUserIcon
                  sx={{ fontSize: 14, color: "text.disabled" }}
                />
                <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
                  Đảm bảo hoàn tiền trong 30 ngày
                </Typography>
              </Stack>

              <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1.25 }}>
                Khóa học bao gồm
              </Typography>
              <Stack spacing={1}>
                {[
                  {
                    icon: <PlayArrowIcon />,
                    label: formatTongThoiLuong(khoaHoc.tongThoiLuong),
                  },
                  {
                    icon: <FolderIcon />,
                    label: `${khoaHoc.tongTaiLieu ?? 0} tài nguyên tải về`,
                  },
                  {
                    icon: <DevicesIcon />,
                    label: "Truy cập trên mọi thiết bị",
                  },
                  { icon: <AllInclusiveIcon />, label: "Truy cập trọn đời" },
                  {
                    icon: <WorkspacePremiumIcon />,
                    label: "Chứng chỉ hoàn thành",
                  },
                ].map((item, i) => (
                  <Stack
                    key={i}
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center" }}
                  >
                    <Box
                      sx={{
                        color: "text.disabled",
                        display: "flex",
                        fontSize: 16,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      {item.label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </SidebarCard>
        </Grid>
      </Grid>

      {/* ── Confirm dialog ── */}
      <Dialog
        open={modalOpen}
        onClose={() => !registering && setModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogContent sx={{ p: 3.5 }}>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 0.5,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Xác nhận đăng ký
            </Typography>
            <Box
              onClick={() => !registering && setModalOpen(false)}
              sx={{ cursor: "pointer", color: "text.disabled" }}
            >
              <CloseIcon fontSize="small" />
            </Box>
          </Stack>
          <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2.5 }}>
            {isFree
              ? "Bạn sắp đăng ký khóa học sau hoàn toàn miễn phí."
              : "Bạn sắp đăng ký khóa học sau."}
          </Typography>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "center",
              bgcolor: "#fdf2f2",
              borderRadius: 2,
              p: 1.75,
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: RED,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              <SchoolIcon />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                {khoaHoc.tieuDe}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
                {khoaHoc.tongBaiGiang ?? 0} bài học ·{" "}
                {formatTongThoiLuong(khoaHoc.tongThoiLuong)}
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={1.25}>
            <Button
              fullWidth
              variant="contained"
              disabled={registering}
              onClick={handleRegister}
              startIcon={
                registering ? (
                  <CircularProgress size={16} sx={{ color: "#fff" }} />
                ) : (
                  <SchoolIcon />
                )
              }
              sx={{
                bgcolor: RED,
                "&:hover": { bgcolor: RED_HOVER },
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
                py: 1.25,
              }}
            >
              {registering ? "Đang đăng ký..." : "Xác nhận đăng ký"}
            </Button>
            <Button
              fullWidth
              variant="text"
              disabled={registering}
              onClick={() => setModalOpen(false)}
              sx={{
                color: "text.secondary",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Hủy bỏ
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// ─── exported page ────────────────────────────────────────────────────────────

export default function CourseRegistrationPage() {
  return (
    <AuthGuard allowedRoles={["HocVien", "GiaoVien"]}>
      <DashboardShell>
        <Paper
          elevation={0}
          sx={{
            p: 4.5,
            borderRadius: "24px",
            border: "1px solid rgba(141,19,19,0.06)",
            bgcolor: "#ffffff",
            boxShadow: "0 10px 30px rgba(141,19,19,0.015)",
          }}
        >
          <CourseRegistrationContent />
        </Paper>
      </DashboardShell>
    </AuthGuard>
  );
}
