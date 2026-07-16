"use client";
import { MAU } from "@/src/theme/tokens";

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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import AuthGuard from "@/src/components/AuthGuard";
import KhoaHocService from "@/src/services/KhoaHocService";
import { KhoaHocType, KhoaHocSearch } from "@/src/types/khoaHoc/Dto/dto";
import DashboardShell from "@/src/components/dashboard/DashboardShell";

// ====== Định nghĩa kiểu PagedList ======
interface PagedList<T> {
  items: T[];
  pageIndex?: number;
  pageSize?: number;
  totalCount?: number;
  totalPage?: number;
}

// ====== Bảng màu thương hiệu EduVerse ======

// ====== Đường dẫn ======
const duongDanChiTietKhoaHoc = (id: string) =>
  `/instructor/manager-courses/${id}/manager/curriculum`;
const duongDanTaoKhoaHocMoi = "/instructor/manager-courses/create/1";
const SO_LUONG_MOI_TRANG = 20;

// ====== Helper ======
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

// ====== Nội dung trang ======
function KhoaHocContent() {
  const router = useRouter();
  const khoaHocService = useMemo(() => new KhoaHocService(), []);

  const [tabDangChon, setTabDangChon] = useState<"khoa-hoc" | "goi-khoa-hoc">(
    "khoa-hoc",
  );
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");
  const [sapXep, setSapXep] = useState("moi-nhat");
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);
  const [danhSachKhoaHoc, setDanhSachKhoaHoc] = useState<KhoaHocType[]>([]);
  const [tongSoTrang, setTongSoTrang] = useState(1);

  // Hàm lấy danh sách
  const layDanhSachKhoaHoc = useCallback(
    async (signal?: AbortSignal) => {
      setDangTai(true);
      setLoi(null);
      try {
        const searchParams: KhoaHocSearch = {
          timKiem: tuKhoaTimKiem || undefined,
          sapXep,
          pageNumber: trangHienTai,
          pageSize: SO_LUONG_MOI_TRANG,
        };

        // Gọi API và nhận về ApiResponse<PagedList<KhoaHocType>>
        const response = await khoaHocService.GetListForManager(searchParams);

        if (signal?.aborted) return;

        // // Kiểm tra response
        // if (!response || response.status === false || !response.data) {
        //   setLoi(response?.message || "Không có dữ liệu khóa học.");
        //   setDanhSachKhoaHoc([]);
        //   setTongSoTrang(1);
        //   return;
        // }

        // Lấy data (PagedList)
        const data: PagedList<KhoaHocType> = response.data;
        setDanhSachKhoaHoc(data.items || []);
        setTongSoTrang(Math.max(1, data.totalPage ?? 1));
      } catch (err) {
        if (signal?.aborted) return;
        console.error("❌ Lỗi fetch:", err);
        setLoi("Có lỗi xảy ra khi tải danh sách khóa học.");
        setDanhSachKhoaHoc([]);
      } finally {
        if (!signal?.aborted) setDangTai(false);
      }
    },
    [tuKhoaTimKiem, sapXep, trangHienTai, khoaHocService],
  );

  // Gọi fetch khi các dependency thay đổi
  useEffect(() => {
    const abortController = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Cần gọi async để fetch dữ liệu, không thể tránh setState trong effect này
    layDanhSachKhoaHoc(abortController.signal);
    return () => abortController.abort();
  }, [layDanhSachKhoaHoc]);

  const xuLyBamKhoaHoc = (id?: string) => {
    if (!id) return;
    router.push(duongDanChiTietKhoaHoc(id));
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
        value={tabDangChon}
        onChange={(_, gt) => setTabDangChon(gt)}
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
              height: 44,
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
            height: 44,
            borderRadius: "12px",
            color: MAU.chinh,
            fontWeight: 600,
            bgcolor: MAU.chinhNhat,
            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
            "& .MuiSelect-select": { display: "flex", alignItems: "center" },
          }}
        >
          <MenuItem value="moi-nhat">Mới nhất</MenuItem>
          <MenuItem value="cu-nhat">Cũ nhất</MenuItem>
          <MenuItem value="ten-a-z">Tên A-Z</MenuItem>
          <MenuItem value="hoc-vien-nhieu-nhat">Nhiều học viên nhất</MenuItem>
        </Select>
      </Box>

      {/* Trạng thái tải / lỗi */}
      {dangTai && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: MAU.chinh }} />
        </Box>
      )}

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
        </Box>
      )}

      {!dangTai && !loi && danhSachKhoaHoc.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: { xs: 6, sm: 9 },
            px: 3,
            borderRadius: "20px",
            border: `1.5px dashed ${MAU.vien}`,
            background: "linear-gradient(180deg, #FFFFFF 0%, #FDF6F6 100%)",
          }}
        >
          <Box
            sx={{
              width: 88,
              height: 88,
              mx: "auto",
              mb: 2.5,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "radial-gradient(circle at 30% 30%, #FBEFEF 0%, #F3D5D5 100%)",
              boxShadow: "0 10px 24px rgba(139,19,19,0.12)",
            }}
          >
            <SchoolOutlinedIcon sx={{ fontSize: 44, color: MAU.chinh }} />
          </Box>
          <Typography
            sx={{ fontWeight: 800, fontSize: 19, color: MAU.chuDen, mb: 0.75 }}
          >
            {tuKhoaTimKiem
              ? "Không tìm thấy khóa học phù hợp"
              : "Chưa có khóa học nào"}
          </Typography>
          <Typography
            sx={{
              color: MAU.chuXam,
              fontSize: 14,
              maxWidth: 440,
              mx: "auto",
              mb: 3,
              lineHeight: 1.65,
            }}
          >
            {tuKhoaTimKiem
              ? `Không có khóa học nào khớp với "${tuKhoaTimKiem}". Hãy thử từ khóa khác.`
              : "Bắt đầu hành trình giảng dạy bằng cách tạo khóa học đầu tiên và chia sẻ kiến thức tới học viên."}
          </Typography>
          {!tuKhoaTimKiem && (
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
              Tạo khóa học đầu tiên
            </Button>
          )}
        </Box>
      )}

      {/* Danh sách khóa học */}
      {!dangTai && !loi && danhSachKhoaHoc.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {danhSachKhoaHoc.map((khoaHoc) => {
            const pheDuyet = thongTinTrangThaiPheDuyet(
              khoaHoc.trangThaiPheDuyet,
            );
            return (
              <Box
                key={khoaHoc.id}
                onClick={() => xuLyBamKhoaHoc(khoaHoc.id)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2.5,
                  border: `1px solid ${MAU.vien}`,
                  borderRadius: "16px",
                  p: 1.5,
                  cursor: "pointer",
                  transition: "all .18s ease",
                  "&:hover": {
                    boxShadow: "0 8px 22px rgba(139,19,19,0.10)",
                    borderColor: MAU.chinh,
                    transform: "translateY(-2px)",
                  },
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
                      unoptimized // Nếu URL ảnh từ domain ngoài, cần unoptimized
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
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                    {khoaHoc.trangThai && (
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: MAU.chuXam,
                          fontWeight: 700,
                          letterSpacing: 0.3,
                        }}
                      >
                        {khoaHoc.trangThai.toUpperCase()}
                      </Typography>
                    )}
                  </Box>
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
            onChange={(_, trang) => setTrangHienTai(trang)}
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
