"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Avatar,
  Chip,
  Checkbox,
  Divider,
  Button,
  CircularProgress,
  Pagination,
  Snackbar,
  Alert,
  Tooltip,
  GlobalStyles,
  IconButton,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SchoolIcon from "@mui/icons-material/School";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import KiemDuyetServiceClass from "@/src/services/KiemDuyetServide";
import {
  KhoaHocKiemDuyetListDto,
  KiemDuyetSearchDto,
  NhanVienPheDuyetDto,
  NhanVienSearch,
} from "@/src/types/KiemDuyet/Dto/dto";
import { PagedList } from "@/src/types/types";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import AuthGuard from "@/src/components/AuthGuard";
import { useRouter } from "next/navigation";
const kiemDuyetService = new KiemDuyetServiceClass();
type BoLocNhanVien = "" | "ChuaCoKhoaHoc" | "Tang" | "Giam";

const PAGE_SIZE_DEFAULT = 10;

// Trạng thái phê duyệt chỉ lấy các khóa học đang "Chờ duyệt"
const TRANG_THAI_CHO_DUYET = "ChoDuyet";

// Debounce cho ô tìm kiếm nhân viên/khóa học trước khi gọi API
const DEBOUNCE_MS = 350;

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

// ================= DESIGN TOKENS =================
// Đồng bộ với hệ giao diện Dashboard hiện có: nền kem, card trắng bo tròn
// đổ bóng nhẹ, chữ navy đậm, điểm nhấn burgundy, font Plus Jakarta Sans.
const tokens = {
  bg: "var(--ev-bg, #F7F5F2)",
  surface: "var(--ev-paper, #FFFFFF)",
  surfaceAlt: "var(--ev-paper-alt, #FBFAF9)",
  border: "var(--ev-divider, #ECE7E4)",
  navy: "var(--ev-text-primary, #1F2937)",
  navySoft: "var(--ev-text-secondary, #4B5563)",
  maroon: "#8B1313",
  maroonDark: "#6B0E0E",
  maroonSoft: "rgba(139,19,19,0.08)",
  green: "#16A34A",
  greenSoft: "#DCFCE7",
  amber: "#D97706",
  amberSoft: "#FEF3C7",
  violet: "#7C5CFC",
  violetSoft: "#EEE9FE",
  blue: "#2563EB",
  blueSoft: "#EFF6FF",
  font: "var(--font-primary, var(--ev-font-family, 'Be Vietnam Pro', sans-serif))",
  radius: "16px",
  shadow: "0 4px 20px rgba(0,0,0,0.03)",
};

// Huy hiệu số đếm dạng viên thuốc bo tròn — dùng cho "đã duyệt" / số lượng chọn
function CountPill({
  value,
  tone = "green",
}: {
  value: number | string;
  tone?: "green" | "maroon";
}) {
  const color = tone === "maroon" ? tokens.maroon : tokens.green;
  const bg = tone === "maroon" ? tokens.maroonSoft : tokens.greenSoft;
  return (
    <Box
      sx={{
        px: 1,
        height: 22,
        borderRadius: "999px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: tokens.font,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1,
        bgcolor: bg,
        color,
      }}
    >
      {value}
    </Box>
  );
}

// Nhãn "→ đang phân cho" — viên thuốc bo tròn đồng bộ với các badge phần trăm
// trên Dashboard (nền hồng nhạt, chữ burgundy đậm).
function RoutingTag({ name }: { name: string }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        pl: 1,
        pr: 1.5,
        py: 0.5,
        borderRadius: "999px",
        bgcolor: tokens.maroonSoft,
      }}
    >
      <ArrowForwardIcon sx={{ fontSize: 14, color: tokens.maroon }} />
      <Typography
        sx={{
          fontFamily: tokens.font,
          fontWeight: 700,
          fontSize: 13,
          color: tokens.maroon,
        }}
      >
        {name}
      </Typography>
    </Box>
  );
}

export default function PhanKhoaHocKiemDuyet() {
  const router = useRouter();

  // ----- Danh sách nhân viên -----
  const [danhSachNhanVien, setDanhSachNhanVien] = useState<
    NhanVienPheDuyetDto[]
  >([]);
  const [nhanVienDangChon, setNhanVienDangChon] =
    useState<NhanVienPheDuyetDto | null>(null);
  const [loadingNhanVien, setLoadingNhanVien] = useState<boolean>(false);
  const [searchNhanVien, setSearchNhanVien] = useState<string>("");
  const [searchNhanVienDebounced, setSearchNhanVienDebounced] =
    useState<string>("");

  // ----- Bộ lọc nhân viên: 1 combobox gộp, áp dụng ngay khi đổi -----
  const [boLocNhanVien, setBoLocNhanVien] = useState<BoLocNhanVien>("");

  // ----- Danh sách khóa học -----
  const [danhSachKhoaHoc, setDanhSachKhoaHoc] = useState<
    KhoaHocKiemDuyetListDto[]
  >([]);
  const [khoaHocDaChon, setKhoaHocDaChon] = useState<Set<string>>(new Set());
  const [loadingKhoaHoc, setLoadingKhoaHoc] = useState<boolean>(false);
  const [searchKhoaHoc, setSearchKhoaHoc] = useState<string>("");
  const [searchKhoaHocDebounced, setSearchKhoaHocDebounced] =
    useState<string>("");
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize] = useState<number>(PAGE_SIZE_DEFAULT);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPage, setTotalPage] = useState<number>(1);

  // ----- Trạng thái submit -----
  const [dangPhanCong, setDangPhanCong] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  // ================= DEBOUNCE Ô TÌM KIẾM =================
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchNhanVienDebounced(searchNhanVien);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchNhanVien]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKhoaHocDebounced(searchKhoaHoc);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchKhoaHoc]);

  // ================= LOAD DANH SÁCH NHÂN VIÊN =================
  const loadDanhSachNhanVien = useCallback(async () => {
    setLoadingNhanVien(true);
    try {
      const search: NhanVienSearch = {
        keyword: searchNhanVienDebounced.trim() || undefined,
        chuaCoKhoaHoc: boLocNhanVien === "ChuaCoKhoaHoc" || undefined,
        SapXepTheoSoLuongKhoaHoc:
          boLocNhanVien === "Tang" || boLocNhanVien === "Giam"
            ? boLocNhanVien
            : "",
      };
      // Trang phân công tổng không gắn với 1 khóa học cụ thể nên truyền idKhoaHoc rỗng
      const response = await kiemDuyetService.GetDanhSachNhanVien("", search);
      const data = response?.data?.items ?? [];
      setDanhSachNhanVien(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách nhân viên kiểm duyệt:", error);
      setSnackbar({
        open: true,
        message: "Không thể tải danh sách nhân viên kiểm duyệt.",
        severity: "error",
      });
    } finally {
      setLoadingNhanVien(false);
    }
  }, [searchNhanVienDebounced, boLocNhanVien]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch dữ liệu khi mount/khi filter đổi, setState nằm trong hàm async bên trong
    loadDanhSachNhanVien();
  }, [loadDanhSachNhanVien]);

  // Nếu nhân viên đang chọn không còn nằm trong danh sách sau khi lọc thì bỏ chọn
  useEffect(() => {
    if (
      nhanVienDangChon &&
      !danhSachNhanVien.some((nv) => nv.userId === nhanVienDangChon.userId)
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- đồng bộ lựa chọn với dữ liệu mới tải về
      setNhanVienDangChon(null);
    }
  }, [danhSachNhanVien, nhanVienDangChon]);

  // ================= LOAD DANH SÁCH KHÓA HỌC CHỜ PHÂN =================
  // Chỉ lấy các khóa học có trangThaiPheDuyet = "ChoDuyet"
  const loadDanhSachKhoaHoc = useCallback(async () => {
    setLoadingKhoaHoc(true);
    try {
      const search: KiemDuyetSearchDto = {
        keyword: searchKhoaHocDebounced.trim() || undefined,
        pageIndex,
        pageSize,
        trangThaiPheDuyet: TRANG_THAI_CHO_DUYET,
      };
      const response = await kiemDuyetService.GetListKiemDuyetKhoaHoc(search);
      const paged = response.data as PagedList<KhoaHocKiemDuyetListDto>;
      const items = paged?.items ?? [];

      // Lọc thêm ở client để đảm bảo chỉ hiển thị khóa học đang chờ duyệt,
      // phòng trường hợp API chưa lọc đúng theo trangThaiPheDuyet.
      const itemsChoDuyet = items.filter(
        (kh) => kh.trangThaiPheDuyet === TRANG_THAI_CHO_DUYET,
      );

      setDanhSachKhoaHoc(itemsChoDuyet);
      setTotalCount(paged?.totalCount ?? itemsChoDuyet.length);
      setTotalPage(paged?.totalPage ?? 1);
    } catch (error) {
      console.error("Lỗi khi tải danh sách khóa học chờ phân:", error);
      setSnackbar({
        open: true,
        message: "Không thể tải danh sách khóa học.",
        severity: "error",
      });
    } finally {
      setLoadingKhoaHoc(false);
    }
  }, [searchKhoaHocDebounced, pageIndex, pageSize]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch dữ liệu khi mount/khi filter đổi, setState nằm trong hàm async bên trong
    loadDanhSachKhoaHoc();
  }, [loadDanhSachKhoaHoc]);

  // Reset về trang 1 khi đổi từ khóa tìm kiếm
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset trang khi search thay đổi, là phản ứng hợp lệ với thay đổi từ prop/state khác
    setPageIndex(1);
  }, [searchKhoaHocDebounced]);

  // ================= HANDLERS =================
  const handleChonNhanVien = (nv: NhanVienPheDuyetDto) => {
    setNhanVienDangChon(nv);
  };

  const handleToggleKhoaHoc = (idKhoaHoc: string) => {
    setKhoaHocDaChon((prev) => {
      const next = new Set(prev);
      if (next.has(idKhoaHoc)) {
        next.delete(idKhoaHoc);
      } else {
        next.add(idKhoaHoc);
      }
      return next;
    });
  };

  const dangChonTatCaTrangHienTai = useMemo(() => {
    if (danhSachKhoaHoc.length === 0) return false;
    return danhSachKhoaHoc.every((kh) => khoaHocDaChon.has(kh.idKhoaHoc));
  }, [danhSachKhoaHoc, khoaHocDaChon]);

  const handleChonTatCaTrangHienTai = () => {
    setKhoaHocDaChon((prev) => {
      const next = new Set(prev);
      if (dangChonTatCaTrangHienTai) {
        danhSachKhoaHoc.forEach((kh) => next.delete(kh.idKhoaHoc));
      } else {
        danhSachKhoaHoc.forEach((kh) => next.add(kh.idKhoaHoc));
      }
      return next;
    });
  };

  const handleQuayLai = () => {
    router.back();
  };

  // Đặt lại combobox lọc về mặc định và luôn ép tải lại danh sách —
  // kể cả khi combobox đã ở giá trị mặc định (useEffect sẽ không tự chạy lại
  // vì dependency không đổi), nên gọi thẳng loadDanhSachNhanVien ở đây.
  const handleReloadBoLoc = () => {
    setBoLocNhanVien("");
    setSearchNhanVien("");
    void loadDanhSachNhanVien();
  };

  const handlePhanCong = async () => {
    if (!nhanVienDangChon?.userId) {
      setSnackbar({
        open: true,
        message: "Vui lòng chọn nhân viên kiểm duyệt.",
        severity: "error",
      });
      return;
    }
    if (khoaHocDaChon.size === 0) {
      setSnackbar({
        open: true,
        message: "Vui lòng chọn ít nhất 1 khóa học.",
        severity: "error",
      });
      return;
    }

    setDangPhanCong(true);
    try {
      await kiemDuyetService.PhanKhoaHocKiemDuyet(
        Array.from(khoaHocDaChon),
        nhanVienDangChon.userId,
      );

      setSnackbar({
        open: true,
        message: `Đã phân ${khoaHocDaChon.size} khóa học cho ${nhanVienDangChon.hoTen}.`,
        severity: "success",
      });

      setKhoaHocDaChon(new Set());
      await Promise.all([loadDanhSachNhanVien(), loadDanhSachKhoaHoc()]);
    } catch (error) {
      console.error("Lỗi khi phân khóa học kiểm duyệt:", error);
      setSnackbar({
        open: true,
        message: "Phân công thất bại. Vui lòng thử lại.",
        severity: "error",
      });
    } finally {
      setDangPhanCong(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // ================= RENDER =================
  return (
    <AuthGuard allowedRoles={["Admin"]}>
      <DashboardShell>
        <GlobalStyles
          styles={`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        `}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            gap: 2.5,
            p: 3,
            bgcolor: tokens.bg,
            fontFamily: tokens.font,
          }}
        >
          {/* ===== TIÊU ĐỀ TRANG ===== */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Tooltip title="Quay lại">
              <IconButton
                onClick={handleQuayLai}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  border: `1px solid ${tokens.border}`,
                  bgcolor: tokens.surface,
                  "&:hover": { bgcolor: tokens.surfaceAlt },
                }}
              >
                <ArrowBackIcon sx={{ color: tokens.navy }} fontSize="small" />
              </IconButton>
            </Tooltip>
            <Box>
              <Typography
                sx={{
                  fontFamily: tokens.font,
                  fontWeight: 800,
                  fontSize: 26,
                  color: tokens.navy,
                  letterSpacing: "-0.01em",
                }}
              >
                Phân công kiểm duyệt khóa học
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  fontFamily: tokens.font,
                  fontSize: 14,
                  color: tokens.navySoft,
                }}
              >
                Chọn một nhân viên kiểm duyệt, sau đó chọn các khóa học cần
                giao.
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ display: "flex", gap: 2.5, flex: 1, minHeight: 0 }}>
            {/* ===== CỘT TRÁI: DANH SÁCH NHÂN VIÊN ===== */}
            <Paper
              elevation={0}
              sx={{
                width: 330,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                bgcolor: tokens.surface,
                border: `1px solid ${tokens.border}`,
                borderRadius: tokens.radius,
                boxShadow: tokens.shadow,
              }}
            >
              <Box sx={{ p: 2.5, pb: 2 }}>
                <Stack
                  direction="row"
                  sx={{ alignItems: "center", justifyContent: "space-between" }}
                >
                  <Typography
                    sx={{
                      fontFamily: tokens.font,
                      fontWeight: 700,
                      fontSize: 16,
                      color: tokens.navy,
                    }}
                  >
                    Nhân viên kiểm duyệt
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: tokens.font,
                      fontWeight: 600,
                      fontSize: 12,
                      color: tokens.navySoft,
                    }}
                  >
                    {danhSachNhanVien.length} người
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Tìm nhân viên..."
                    value={searchNhanVien}
                    onChange={(e) => setSearchNhanVien(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 40,
                        bgcolor: tokens.surfaceAlt,
                        borderRadius: "10px",
                        fontFamily: tokens.font,
                        fontSize: 14,
                        "& fieldset": { borderColor: tokens.border },
                        "&:hover fieldset": { borderColor: tokens.maroon },
                        "&.Mui-focused fieldset": {
                          borderColor: tokens.maroon,
                          borderWidth: "1.5px",
                        },
                      },
                    }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon
                              fontSize="small"
                              sx={{ color: tokens.navySoft }}
                            />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <Tooltip title="Tải lại và đặt lại bộ lọc">
                    <IconButton
                      onClick={handleReloadBoLoc}
                      disabled={loadingNhanVien}
                      sx={{
                        flexShrink: 0,
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        border: `1px solid ${tokens.border}`,
                        bgcolor: tokens.surfaceAlt,
                        "&:hover": { borderColor: tokens.maroon },
                      }}
                    >
                      <RefreshIcon
                        fontSize="small"
                        sx={{ color: tokens.navySoft }}
                      />
                    </IconButton>
                  </Tooltip>
                </Stack>

                <FormControl size="small" fullWidth sx={{ mt: 1 }}>
                  <Select
                    value={boLocNhanVien}
                    onChange={(e) =>
                      setBoLocNhanVien(e.target.value as BoLocNhanVien)
                    }
                    displayEmpty
                    sx={{
                      height: 40,
                      borderRadius: "10px",
                      bgcolor: tokens.surfaceAlt,
                      fontFamily: tokens.font,
                      fontSize: 13,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: tokens.border,
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: tokens.maroon,
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: tokens.maroon,
                        borderWidth: "1.5px",
                      },
                    }}
                  >
                    <MenuItem
                      value=""
                      sx={{ fontFamily: tokens.font, fontSize: 13 }}
                    >
                      Mặc định
                    </MenuItem>
                    <MenuItem
                      value="ChuaCoKhoaHoc"
                      sx={{ fontFamily: tokens.font, fontSize: 13 }}
                    >
                      Chưa có khóa học nào
                    </MenuItem>
                    <MenuItem
                      value="Tang"
                      sx={{ fontFamily: tokens.font, fontSize: 13 }}
                    >
                      Số khóa học đã duyệt: Tăng dần
                    </MenuItem>
                    <MenuItem
                      value="Giam"
                      sx={{ fontFamily: tokens.font, fontSize: 13 }}
                    >
                      Số khóa học đã duyệt: Giảm dần
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ borderColor: tokens.border }} />

              <Box sx={{ flex: 1, overflowY: "auto", p: 1 }}>
                {loadingNhanVien ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 4 }}
                  >
                    <CircularProgress size={26} sx={{ color: tokens.maroon }} />
                  </Box>
                ) : danhSachNhanVien.length === 0 ? (
                  <Typography
                    sx={{
                      fontFamily: tokens.font,
                      fontSize: 13,
                      color: tokens.navySoft,
                      textAlign: "center",
                      py: 4,
                    }}
                  >
                    Không có nhân viên nào phù hợp.
                  </Typography>
                ) : (
                  <List disablePadding>
                    {danhSachNhanVien.map((nv) => {
                      const dangChon = nv.userId === nhanVienDangChon?.userId;
                      return (
                        <ListItemButton
                          key={nv.userId ?? nv.hoTen}
                          selected={dangChon}
                          onClick={() => handleChonNhanVien(nv)}
                          sx={{
                            mb: 0.5,
                            py: 1.1,
                            px: 1.25,
                            borderRadius: "12px",
                            borderLeft: "3px solid",
                            borderLeftColor: dangChon
                              ? tokens.maroon
                              : "transparent",
                            bgcolor: dangChon
                              ? tokens.maroonSoft
                              : "transparent",
                            transition: "background-color 120ms ease",
                            "&:hover": {
                              bgcolor: dangChon
                                ? tokens.maroonSoft
                                : tokens.surfaceAlt,
                            },
                            "&.Mui-selected": {
                              bgcolor: tokens.maroonSoft,
                            },
                            "&.Mui-selected:hover": {
                              bgcolor: tokens.maroonSoft,
                            },
                          }}
                        >
                          <Avatar
                            src={nv.anhDaiDien ?? undefined}
                            sx={{
                              width: 38,
                              height: 38,
                              mr: 1.5,
                              fontSize: 14,
                              fontFamily: tokens.font,
                              fontWeight: 700,
                              bgcolor: tokens.violetSoft,
                              color: tokens.violet,
                            }}
                          >
                            {nv.hoTen?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <ListItemText
                            primary={
                              <Typography
                                sx={{
                                  fontFamily: tokens.font,
                                  fontWeight: 700,
                                  fontSize: 14,
                                  color: tokens.navy,
                                }}
                              >
                                {nv.hoTen}
                              </Typography>
                            }
                            secondary={
                              <Stack
                                direction="row"
                                spacing={1}
                                sx={{ mt: 0.5, alignItems: "center" }}
                                component="span"
                              >
                                <Chip
                                  label={nv.role}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontFamily: tokens.font,
                                    fontWeight: 600,
                                    fontSize: 11,
                                    color: tokens.navySoft,
                                    bgcolor: tokens.surfaceAlt,
                                  }}
                                />
                                <Tooltip title="Số khóa học đã duyệt">
                                  <span>
                                    <CountPill value={nv.soLuongKhoaHocDuyet} />
                                  </span>
                                </Tooltip>
                              </Stack>
                            }
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                )}
              </Box>
            </Paper>

            {/* ===== CỘT PHẢI: DANH SÁCH KHÓA HỌC CHỜ PHÂN ===== */}
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                bgcolor: tokens.surface,
                border: `1px solid ${tokens.border}`,
                borderRadius: tokens.radius,
                boxShadow: tokens.shadow,
              }}
            >
              <Box sx={{ p: 2.5, pb: 2 }}>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1.5,
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.25}
                    sx={{ alignItems: "center", flexWrap: "wrap" }}
                  >
                    <Typography
                      sx={{
                        fontFamily: tokens.font,
                        fontWeight: 700,
                        fontSize: 16,
                        color: tokens.navy,
                      }}
                    >
                      Khóa học chờ phân
                    </Typography>
                    {nhanVienDangChon && (
                      <RoutingTag name={nhanVienDangChon.hoTen} />
                    )}
                  </Stack>

                  <Button
                    variant="contained"
                    disableElevation
                    startIcon={
                      dangPhanCong ? (
                        <CircularProgress size={16} sx={{ color: "#fff" }} />
                      ) : (
                        <CheckCircleIcon fontSize="small" />
                      )
                    }
                    disabled={
                      dangPhanCong ||
                      !nhanVienDangChon ||
                      khoaHocDaChon.size === 0
                    }
                    onClick={handlePhanCong}
                    sx={{
                      fontFamily: tokens.font,
                      fontWeight: 700,
                      fontSize: 13.5,
                      textTransform: "none",
                      borderRadius: "10px",
                      px: 2.25,
                      py: 1,
                      bgcolor: tokens.maroon,
                      "&:hover": { bgcolor: tokens.maroonDark },
                      "&.Mui-disabled": {
                        bgcolor: tokens.border,
                        color: tokens.navySoft,
                      },
                    }}
                  >
                    Phân công · {khoaHocDaChon.size}
                  </Button>
                </Stack>

                <TextField
                  size="small"
                  fullWidth
                  placeholder="Tìm khóa học theo tiêu đề..."
                  value={searchKhoaHoc}
                  onChange={(e) => setSearchKhoaHoc(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 40,
                      bgcolor: tokens.surfaceAlt,
                      borderRadius: "10px",
                      fontFamily: tokens.font,
                      fontSize: 14,
                      "& fieldset": { borderColor: tokens.border },
                      "&:hover fieldset": { borderColor: tokens.maroon },
                      "&.Mui-focused fieldset": {
                        borderColor: tokens.maroon,
                        borderWidth: "1.5px",
                      },
                    },
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon
                            fontSize="small"
                            sx={{ color: tokens.navySoft }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <Divider sx={{ borderColor: tokens.border }} />

              <Box sx={{ px: 2.5, py: 1.25 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <Checkbox
                    size="small"
                    checked={dangChonTatCaTrangHienTai}
                    indeterminate={
                      khoaHocDaChon.size > 0 && !dangChonTatCaTrangHienTai
                    }
                    onChange={handleChonTatCaTrangHienTai}
                    disabled={danhSachKhoaHoc.length === 0}
                    sx={{
                      color: tokens.border,
                      "&.Mui-checked": { color: tokens.maroon },
                      "&.MuiCheckbox-indeterminate": { color: tokens.maroon },
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: tokens.font,
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: tokens.navySoft,
                    }}
                  >
                    Chọn tất cả · {danhSachKhoaHoc.length} khóa học trang này
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ flex: 1, overflowY: "auto", px: 2.5 }}>
                {loadingKhoaHoc ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 6 }}
                  >
                    <CircularProgress size={26} sx={{ color: tokens.maroon }} />
                  </Box>
                ) : danhSachKhoaHoc.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 6 }}>
                    <SchoolIcon
                      sx={{ fontSize: 38, mb: 1, color: tokens.border }}
                    />
                    <Typography
                      sx={{
                        fontFamily: tokens.font,
                        fontSize: 13,
                        color: tokens.navySoft,
                      }}
                    >
                      Không có khóa học nào chờ duyệt.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1} sx={{ py: 1.25 }}>
                    {danhSachKhoaHoc.map((kh) => {
                      const dangChon = khoaHocDaChon.has(kh.idKhoaHoc);
                      return (
                        <Paper
                          key={kh.idKhoaHoc}
                          elevation={0}
                          onClick={() => handleToggleKhoaHoc(kh.idKhoaHoc)}
                          sx={{
                            p: 1.25,
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            cursor: "pointer",
                            borderRadius: "12px",
                            border: "1px solid",
                            borderColor: dangChon
                              ? tokens.maroon
                              : tokens.border,
                            bgcolor: dangChon
                              ? tokens.maroonSoft
                              : tokens.surfaceAlt,
                            transition:
                              "border-color 120ms ease, background-color 120ms ease",
                            "&:hover": {
                              borderColor: tokens.maroon,
                            },
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={dangChon}
                            onChange={() => handleToggleKhoaHoc(kh.idKhoaHoc)}
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                              color: tokens.border,
                              "&.Mui-checked": { color: tokens.maroon },
                            }}
                          />
                          <Avatar
                            variant="rounded"
                            src={kh.hinhAnhKhoaHoc ?? undefined}
                            sx={{
                              width: 46,
                              height: 46,
                              borderRadius: "10px",
                              bgcolor: tokens.blueSoft,
                              color: tokens.blue,
                            }}
                          >
                            <SchoolIcon fontSize="small" />
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              component="div"
                              noWrap
                              title={kh.tieuDe}
                              sx={{
                                fontFamily: tokens.font,
                                fontWeight: 700,
                                fontSize: 14,
                                color: tokens.navy,
                              }}
                            >
                              {kh.tieuDe}
                            </Typography>
                            <Stack
                              direction="row"
                              spacing={0.5}
                              sx={{ mt: 0.5 }}
                            >
                              <Chip
                                label={kh.trangThaiPheDuyet === "ChoDuyet" ? "ChoDuyet" : kh.trangThaiPheDuyet}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontFamily: tokens.font,
                                  fontSize: 11,
                                  fontWeight: 750,
                                  borderRadius: "6px",
                                  color: tokens.amber,
                                  bgcolor: tokens.amberSoft,
                                }}
                              />
                            </Stack>
                          </Box>
                        </Paper>
                      );
                    })}
                  </Stack>
                )}
              </Box>

              <Divider sx={{ borderColor: tokens.border, mt: 1.25 }} />
              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: tokens.font,
                    fontWeight: 600,
                    fontSize: 12.5,
                    color: tokens.navySoft,
                  }}
                >
                  Tổng cộng: {totalCount} khóa học
                </Typography>
                <Pagination
                  count={totalPage}
                  page={pageIndex}
                  onChange={(_, value) => setPageIndex(value)}
                  size="small"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      fontFamily: tokens.font,
                      fontWeight: 600,
                      color: tokens.navySoft,
                    },
                    "& .Mui-selected": {
                      bgcolor: `${tokens.maroon} !important`,
                      color: "#fff",
                    },
                  }}
                />
              </Box>
            </Paper>
          </Box>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={3500}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              variant="filled"
              sx={{
                width: "100%",
                fontFamily: tokens.font,
                fontWeight: 600,
                bgcolor:
                  snackbar.severity === "success"
                    ? tokens.green
                    : tokens.maroon,
              }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}
