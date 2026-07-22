/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Button,
  Chip,
  CircularProgress,
  Pagination,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import AuthGuard from "@/src/components/AuthGuard";
import KhoaHocService from "@/src/services/KhoaHocService";
import { KhoaHocType, KhoaHocSearch } from "@/src/types/khoaHoc/Dto/dto";
import DashboardShell from "@/src/components/dashboard/DashboardShell";

// ====== Kiểu PagedList dùng cho dữ liệu phân trang trả về từ API ======
interface PagedList<T> {
  items: T[];
  pageIndex?: number;
  pageSize?: number;
  totalCount?: number;
  totalPage?: number;
}

// ====== Bảng màu thương hiệu EduVerse ======
const MAU = {
  chinh: "#8B1313",
  chinhDam: "#5C0D0D",
  chinhNhat: "#FBEFEF",
  vien: "#F0DEDE",
  chuDen: "#231313",
  chuXam: "#8A7676",
};

// ====== Đường dẫn ======
const duongDanChiTietKhoaHoc = (id: string) =>
  `/instructor/manager-courses/${id}/manager/curriculum`;
const duongDanTaoKhoaHocMoi = "/instructor/manager-courses/create/1";
const SO_LUONG_MOI_TRANG = 20;

// ====== Helper: lấy nhãn + màu hiển thị theo trạng thái phê duyệt ======
function thongTinTrangThaiPheDuyet(trangThai?: string): {
  nhan: string;
  mau: "default" | "warning" | "success" | "error";
} {
  switch (trangThai) {
    case "ChoDuyet":
      return { nhan: "Chờ duyệt", mau: "warning" };
    case "DaDuyet":
      return { nhan: "Đã duyệt", mau: "success" };
    case "TuChoi":
      return { nhan: "Từ chối", mau: "error" };
    case "DangSua":
      return { nhan: "Đang sửa", mau: "default" };
    default:
      return { nhan: trangThai ?? "Không rõ", mau: "default" };
  }
}

// ====== Helper: trích message lỗi an toàn từ nhiều kiểu response khác nhau ======
function trichXuatThongBaoLoi(err: unknown, macDinh: string): string {
  if (err && typeof err === "object") {
    const anyErr = err as any;
    const messageTuApi =
      anyErr?.response?.data?.message ??
      anyErr?.response?.data?.errors ??
      anyErr?.data?.message ??
      anyErr?.message;
    if (typeof messageTuApi === "string" && messageTuApi.trim().length > 0) {
      return messageTuApi;
    }
  }
  return macDinh;
}

// ====== Helper: trích id bản nháp mới tạo từ nhiều shape response khác nhau ======
// apiService (interceptor axios) có thể đã tự unwrap response.data ở tầng service,
// nên response ở đây có thể là { status, data: {...} } hoặc thẳng là {...} luôn.
// Dò nhiều nhánh phổ biến để tránh báo lỗi oan khi backend thực tế đã tạo thành công.
function trichXuatIdBanNhap(response: any): string | undefined {
  if (!response) return undefined;
  return (
    response?.data?.khoaHoc?.id ??
    response?.data?.khoaHocMoi?.id ??
    response?.data?.id ??
    response?.khoaHoc?.id ??
    response?.khoaHocMoi?.id ??
    response?.id ??
    response?.data?.data?.khoaHoc?.id ??
    response?.data?.data?.id
  );
}

// ====== Helper: xác định request có thành công hay không ======
// Hỗ trợ nhiều field báo trạng thái khác nhau (status / success / isSuccess),
// chỉ coi là thất bại khi có field nào đó khẳng định rõ ràng là false.
function laThanhCong(response: any): boolean {
  if (!response) return false;
  if (response.status === false) return false;
  if (response.success === false) return false;
  if (response.isSuccess === false) return false;
  return true;
}

// ====== Nội dung trang ======
function KhoaHocContent() {
  const router = useRouter();
  const khoaHocService = useMemo(() => new KhoaHocService(), []);

  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");
  const [sapXep, setSapXep] = useState("moi-nhat");
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);
  const [danhSachKhoaHoc, setDanhSachKhoaHoc] = useState<KhoaHocType[]>([]);
  const [tongSoTrang, setTongSoTrang] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Chỉ lưu id của khóa học đang xử lý (tạo bản nháp) để disable đúng nút đó,
  // tránh việc disable toàn bộ danh sách khi chỉ 1 item đang xử lý.
  const [dangXuLyId, setDangXuLyId] = useState<string | null>(null);

  // Thông báo lỗi dạng Snackbar khi thao tác (vd: tạo bản nháp thất bại)
  const [thongBaoLoiThaoTac, setThongBaoLoiThaoTac] = useState<string | null>(
    null,
  );

  // Hàm lấy danh sách khóa học từ API
  const layDanhSachKhoaHoc = useCallback(
    async (signal?: AbortSignal) => {
      setDangTai(true);
      setLoi(null);
      try {
        const searchParams: KhoaHocSearch = {
          pageNumber: trangHienTai,
          pageSize: SO_LUONG_MOI_TRANG,
          keyword: tuKhoaTimKiem || undefined,
          loaiBan: 0,
          trangThaiPheDuyet: undefined,
        };

        const response = await khoaHocService.GetListForManager(searchParams);

        if (signal?.aborted) return;

        if (!response || response.status === false || !response.data) {
          setLoi(response?.message || "Không có dữ liệu khóa học.");
          setDanhSachKhoaHoc([]);
          setTongSoTrang(1);
          setTotalCount(0);
          return;
        }

        const data: PagedList<KhoaHocType> = response.data;
        setDanhSachKhoaHoc(data.items || []);
        setTotalCount(data.totalCount || 0);
        setTongSoTrang(Math.max(1, data.totalPage ?? 1));
      } catch (err) {
        if (signal?.aborted) return;
        console.error("Lỗi fetch danh sách khóa học:", err);
        setLoi("Có lỗi xảy ra khi tải danh sách khóa học.");
        setDanhSachKhoaHoc([]);
        setTongSoTrang(1);
        setTotalCount(0);
      } finally {
        if (!signal?.aborted) setDangTai(false);
      }
    },
    [tuKhoaTimKiem, trangHienTai, khoaHocService],
  );

  useEffect(() => {
    const abortController = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching hợp lệ, có AbortController cleanup, không gây vòng lặp render
    layDanhSachKhoaHoc(abortController.signal);
    return () => abortController.abort();
  }, [layDanhSachKhoaHoc]);

  // Xử lý xem chi tiết khóa học
  const handleViewDetail = (khoaHoc: KhoaHocType) => {
    if (khoaHoc.id) {
      router.push(duongDanChiTietKhoaHoc(khoaHoc.id));
    }
  };

  // Xử lý chỉnh sửa: gọi API tạo bản nháp trước khi điều hướng sang trang sửa
  const handleEdit = async (khoaHoc: KhoaHocType) => {
    if (!khoaHoc.id || dangXuLyId) return;

    // Nếu khóa học đang ở trạng thái "Đang sửa" → chuyển thẳng với ID hiện tại
    if (khoaHoc.trangThaiPheDuyet === "DangSua") {
      router.push(duongDanChiTietKhoaHoc(khoaHoc.id));
      return;
    }

    // Các trạng thái khác: tạo bản nháp trước khi chuyển
    setDangXuLyId(khoaHoc.id);
    setThongBaoLoiThaoTac(null);

    try {
      const response = await khoaHocService.createFullKhoaHocDraft(khoaHoc.id);

      // Log tạm để xác định chính xác shape thực tế backend trả về.
      // Có thể xoá dòng này sau khi xác nhận cấu trúc ổn định.
      if (process.env.NODE_ENV !== "production") {
        console.log("[createFullKhoaHocDraft] response:", response);
      }

      const idBanNhap = trichXuatIdBanNhap(response);

      if (laThanhCong(response) && idBanNhap) {
        router.push(duongDanChiTietKhoaHoc(idBanNhap));
        return;
      }

      setThongBaoLoiThaoTac(
        response?.message ||
          "Không thể tạo bản nháp cho khóa học này. Vui lòng kiểm tra lại trạng thái khóa học.",
      );
    } catch (error) {
      console.error("Lỗi khi tạo bản nháp:", error);
      setThongBaoLoiThaoTac(
        trichXuatThongBaoLoi(
          error,
          "Có lỗi xảy ra khi tạo bản nháp. Vui lòng thử lại sau.",
        ),
      );
    } finally {
      setDangXuLyId(null);
    }
  };

  // Xác định các action cần hiển thị dựa trên trạng thái phê duyệt
  const getAvailableActions = (trangThaiPheDuyet?: string) => {
    switch (trangThaiPheDuyet) {
      case "DaDuyet":
        return {
          showEdit: true,
          showView: true,
          editLabel: "Chỉnh sửa",
          viewLabel: "Chi tiết",
        };
      case "TuChoi":
        return {
          showEdit: true,
          showView: true,
          editLabel: "Chỉnh sửa",
          viewLabel: "Chi tiết",
        };
      case "DangSua":
        return {
          showEdit: true,
          showView: false,
          editLabel: "Chỉnh sửa",
          viewLabel: "",
        };
      case "ChoDuyet":
        return {
          showEdit: false,
          showView: true,
          editLabel: "",
          viewLabel: "Xem chi tiết",
        };
      case "DangDuyet":
        return {
          showEdit: false,
          showView: true,
          editLabel: "",
          viewLabel: "Xem chi tiết",
        };
      default:
        return {
          showEdit: true,
          showView: true,
          editLabel: "Chỉnh sửa",
          viewLabel: "Chi tiết",
        };
    }
  };

  const xuLyBamKhoaHoc = (id?: string) => {
    if (!id) return;
    router.push(duongDanChiTietKhoaHoc(id));
  };

  // Xử lý thay đổi trang
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number,
  ) => {
    setTrangHienTai(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 28, color: MAU.chuDen }}>
            Các khóa học
          </Typography>
          <Typography sx={{ fontSize: 14, color: MAU.chuXam, mt: 0.5 }}>
            Quản lý và theo dõi toàn bộ khóa học bạn đang giảng dạy
            {totalCount > 0 && ` (${totalCount} khóa học)`}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push(duongDanTaoKhoaHocMoi)}
          sx={{
            bgcolor: MAU.chinh,
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1,
            borderRadius: "12px",
            boxShadow: "0 6px 16px rgba(139,19,19,0.25)",
            "&:hover": {
              bgcolor: MAU.chinhDam,
              boxShadow: "0 8px 20px rgba(139,19,19,0.32)",
            },
          }}
        >
          Khóa học mới
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs
        value="khoa-hoc"
        sx={{
          borderBottom: `1px solid ${MAU.vien}`,
          mb: 3,
          minHeight: 40,
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: 14,
            minHeight: 40,
            color: MAU.chuXam,
          },
          "& .Mui-selected": { color: `${MAU.chinh} !important` },
          "& .MuiTabs-indicator": {
            bgcolor: MAU.chinh,
            height: 3,
            borderRadius: "3px 3px 0 0",
          },
        }}
      >
        <Tab label="Các khóa học" value="khoa-hoc" />
      </Tabs>

      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
          mb: 3,
        }}
      >
        <TextField
          size="small"
          placeholder="Tìm kiếm khóa học của bạn"
          value={tuKhoaTimKiem}
          onChange={(e) => {
            setTrangHienTai(1);
            setTuKhoaTimKiem(e.target.value);
          }}
          sx={{
            width: 300,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              bgcolor: MAU.chinhNhat,
              "& fieldset": { borderColor: "transparent" },
              "&:hover fieldset": { borderColor: MAU.vien },
              "&.Mui-focused fieldset": { borderColor: MAU.chinh },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: MAU.chinh, fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
        />

        <Select
          size="small"
          value={sapXep}
          onChange={(e) => setSapXep(e.target.value)}
          sx={{
            minWidth: 170,
            borderRadius: "12px",
            color: MAU.chinh,
            fontWeight: 600,
            bgcolor: MAU.chinhNhat,
            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
          }}
        >
          <MenuItem value="moi-nhat">Mới nhất</MenuItem>
          <MenuItem value="cu-nhat">Cũ nhất</MenuItem>
          <MenuItem value="ten-a-z">Tên A-Z</MenuItem>
          <MenuItem value="hoc-vien-nhieu-nhat">Nhiều học viên nhất</MenuItem>
        </Select>
      </Box>

      {/* Trạng thái tải */}
      {dangTai && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: MAU.chinh }} />
        </Box>
      )}

      {/* Trạng thái lỗi tải danh sách */}
      {!dangTai && loi && (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            borderRadius: "16px",
            bgcolor: "#FDECEC",
          }}
        >
          <Typography sx={{ color: "#c62828", fontWeight: 600 }}>
            {loi}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => layDanhSachKhoaHoc()}
            sx={{ mt: 2, textTransform: "none" }}
          >
            Thử lại
          </Button>
        </Box>
      )}

      {/* Trạng thái rỗng */}
      {!dangTai && !loi && danhSachKhoaHoc.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            borderRadius: "16px",
            border: `1px dashed ${MAU.vien}`,
          }}
        >
          <SchoolOutlinedIcon
            sx={{ fontSize: 40, color: MAU.chinh, opacity: 0.5, mb: 1 }}
          />
          <Typography sx={{ color: MAU.chuXam, fontWeight: 500 }}>
            Bạn chưa có khóa học nào.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push(duongDanTaoKhoaHocMoi)}
            sx={{
              mt: 2,
              bgcolor: MAU.chinh,
              textTransform: "none",
              fontWeight: 700,
              "&:hover": { bgcolor: MAU.chinhDam },
            }}
          >
            Tạo khóa học mới
          </Button>
        </Box>
      )}

      {/* Danh sách khóa học */}
      {!dangTai && !loi && danhSachKhoaHoc.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {danhSachKhoaHoc.map((khoaHoc) => {
            const pheDuyet = thongTinTrangThaiPheDuyet(
              khoaHoc.trangThaiPheDuyet,
            );

            const isDraft = khoaHoc.isBanHienTai === false;
            const actions = getAvailableActions(khoaHoc.trangThaiPheDuyet);
            const dangXuLyItemNay = dangXuLyId === khoaHoc.id;

            return (
              <Box
                key={khoaHoc.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2.5,
                  border: `1px solid ${isDraft ? MAU.chinh : MAU.vien}`,
                  borderRadius: "16px",
                  p: 1.5,
                  transition: "all .18s ease",
                  bgcolor: isDraft ? MAU.chinhNhat : "transparent",
                  position: "relative",
                  "&:hover": {
                    boxShadow: "0 8px 22px rgba(139,19,19,0.10)",
                    borderColor: MAU.chinh,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {/* Phần click vào khóa học để xem chi tiết */}
                <Box
                  onClick={() => xuLyBamKhoaHoc(khoaHoc.id)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2.5,
                    flex: 1,
                    cursor: "pointer",
                    minWidth: 0,
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: 128,
                      height: 84,
                      flexShrink: 0,
                      borderRadius: "12px",
                      overflow: "hidden",
                      bgcolor: MAU.chinhNhat,
                    }}
                  >
                    {khoaHoc.hinhAnhKhoaHoc ? (
                      <Image
                        src={khoaHoc.hinhAnhKhoaHoc}
                        alt={khoaHoc.tieuDe ?? "Khóa học"}
                        fill
                        sizes="128px"
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
                        <ArticleOutlinedIcon
                          sx={{ color: MAU.chinh, opacity: 0.4 }}
                        />
                      </Box>
                    )}

                    {isDraft && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          bgcolor: MAU.chinh,
                          color: "#fff",
                          fontSize: 9,
                          fontWeight: 700,
                          px: 0.75,
                          py: 0.25,
                          borderRadius: "4px",
                          textTransform: "uppercase",
                        }}
                      >
                        Nháp
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: 15.5,
                        color: MAU.chuDen,
                        mb: 0.75,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {khoaHoc.tieuDe ?? "Chưa đặt tên"}
                      {isDraft && (
                        <Typography
                          component="span"
                          sx={{
                            fontSize: 11,
                            color: MAU.chinh,
                            fontWeight: 600,
                            ml: 1,
                          }}
                        >
                          (Bản nháp)
                        </Typography>
                      )}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Chip
                        label={pheDuyet.nhan}
                        color={pheDuyet.mau}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: 11,
                          borderRadius: "8px",
                        }}
                      />

                      {khoaHoc.capDo && (
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: MAU.chuXam,
                            fontWeight: 500,
                          }}
                        >
                          • {khoaHoc.capDo}
                        </Typography>
                      )}

                      {khoaHoc.giaGoc !== undefined &&
                        khoaHoc.giaGoc !== null && (
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: MAU.chuXam,
                              fontWeight: 500,
                            }}
                          >
                            •{" "}
                            {khoaHoc.giaGoc === 0
                              ? "Miễn phí"
                              : `${khoaHoc.giaGoc.toLocaleString()}đ`}
                          </Typography>
                        )}
                    </Box>
                  </Box>
                </Box>

                {/* Phần action buttons - hiển thị khi hover (luôn hiện trên mobile) */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    opacity: 0,
                    transition: "opacity 0.2s ease",
                    ".MuiBox-root:hover > &": {
                      opacity: 1,
                    },
                    "@media (max-width: 600px)": {
                      opacity: 1,
                    },
                  }}
                >
                  {actions.showView && (
                    <Tooltip title={actions.viewLabel}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(khoaHoc);
                        }}
                        sx={{
                          color: MAU.chinh,
                          "&:hover": {
                            bgcolor: MAU.chinhNhat,
                          },
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {actions.showEdit && (
                    <Tooltip title={actions.editLabel}>
                      <span>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(khoaHoc);
                          }}
                          sx={{
                            color: MAU.chinh,
                            "&:hover": {
                              bgcolor: MAU.chinhNhat,
                            },
                          }}
                          disabled={dangXuLyItemNay}
                        >
                          {dangXuLyItemNay ? (
                            <CircularProgress
                              size={20}
                              sx={{ color: MAU.chinh }}
                            />
                          ) : (
                            <EditIcon />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Phân trang */}
      {!dangTai && !loi && danhSachKhoaHoc.length > 0 && tongSoTrang > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={tongSoTrang}
            page={trangHienTai}
            onChange={handlePageChange}
            shape="rounded"
            sx={{
              "& .MuiPaginationItem-root": {
                color: MAU.chuDen,
                fontWeight: 600,
                borderRadius: "10px",
              },
              "& .Mui-selected": {
                bgcolor: `${MAU.chinh} !important`,
                color: "#fff",
              },
            }}
          />
        </Box>
      )}

      {/* Snackbar thông báo lỗi khi thao tác (vd: tạo bản nháp thất bại) */}
      <Snackbar
        open={!!thongBaoLoiThaoTac}
        autoHideDuration={6000}
        onClose={() => setThongBaoLoiThaoTac(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setThongBaoLoiThaoTac(null)}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {thongBaoLoiThaoTac}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// ====== Trang (bọc AuthGuard + DashboardShell) ======
export default function InstructorCoursesPage() {
  return (
    <AuthGuard allowedRoles={["Admin", "GiaoVien"]}>
      <DashboardShell>
        <Box
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: "24px",
            border: "1px solid rgba(139,19,19,0.06)",
            bgcolor: "#ffffff",
            boxShadow: "0 10px 30px rgba(139,19,19,0.05)",
          }}
        >
          <KhoaHocContent />
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}
