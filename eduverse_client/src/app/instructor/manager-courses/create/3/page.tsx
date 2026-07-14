"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useCourseCreate } from "../context/CourseCreateContext";
import StepWrapper from "../context/StepWrapper";
import KhoaHocService from "@/src/services/KhoaHocService";
import { danhMucService } from "@/src/services/danhmucService";
import { DanhMucDto } from "@/src/types/khoaHoc";
import AuthGuard from "@/src/components/AuthGuard";

export default function Step5Page() {
  const router = useRouter();
  const { formData, setFormData } = useCourseCreate();
  const [selected, setSelected] = useState<string[]>(
    formData.danhSachDanhMuc || [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [danhMucList, setDanhMucList] = useState<DanhMucDto[]>([]);
  const [loadingDanhMuc, setLoadingDanhMuc] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  const khoaHocService = useMemo(() => new KhoaHocService(), []);

  // Lấy danh sách danh mục khi component mount hoặc tìm kiếm thay đổi
  useEffect(() => {
    const fetchDanhMuc = async () => {
      setLoadingDanhMuc(true);
      setError(null);
      try {
        const response = await danhMucService.getList({
          keyword: searchKeyword || undefined,
          pageIndex: 1,
          pageSize: 20,
        });
        if (response.status !== false && response.data) {
          setDanhMucList(response.data.items || []);
        } else {
          setError("Không thể tải danh mục.");
        }
      } catch (err) {
        console.error(err);
        setError("Lỗi khi tải danh mục.");
      } finally {
        setLoadingDanhMuc(false);
      }
    };
    fetchDanhMuc();
  }, [searchKeyword]);

  const toggleCategory = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleCreate = async () => {
    // Kiểm tra đã chọn danh mục chưa
    if (selected.length === 0) {
      setError("Vui lòng chọn ít nhất một danh mục.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Cập nhật context
      setFormData({ danhSachDanhMuc: selected });

      // Tạo payload dạng FormData
      const payload = new FormData();
      if (formData.tieuDe) {
        payload.append("tieuDe", formData.tieuDe);
      }
      selected.forEach((id) => payload.append("danhSachDanhMuc", id));

      // Gọi API tạo khóa học
      const createResponse = await khoaHocService.CreateKhoaHoc(payload);
      const khoaHocId = createResponse.id;
      router.push(
        `/instructor/manager-courses/${khoaHocId}/manager/curriculum`,
      );
    } catch (err) {
      console.error(err);
      setError("Đã xảy ra lỗi khi tạo khóa học");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={["Admin", "GiaoVien"]}>
      <StepWrapper
        onNext={handleCreate}
        onBack={() => router.push("/instructor/manager-courses/create/2")}
        nextLabel="Tạo khóa học"
        disableNext={loading || loadingDanhMuc || selected.length === 0}
      >
        <Box sx={{ maxWidth: 820, mx: "auto", pt: 0, pb: 2, px: 2 }}>
          {/* Tiêu đề */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              textAlign: "center",
              mb: 1,
              mt: 0,
              color: "#1A1A1A",
              fontSize: { xs: "1.15rem", sm: "1.4rem", md: "1.6rem" },
              whiteSpace: { xs: "normal", md: "nowrap" },
            }}
          >
            Loại kiến thức bạn sẽ chia sẻ phù hợp nhất với danh mục nào?
          </Typography>

          {/* Mô tả */}
          <Typography
            sx={{
              textAlign: "center",
              color: "#7B8794",
              fontSize: 14,
              mb: 2,
            }}
          >
            Nếu bạn không chắc chắn về danh mục phù hợp, bạn có thể thay đổi
            sau.
          </Typography>

          {/* Ô tìm kiếm */}
          <TextField
            size="small"
            placeholder="Tìm danh mục..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            sx={{ mb: 3, width: "100%", maxWidth: 400 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Hiển thị các danh mục đã chọn */}
          {selected.length > 0 && (
            <Box
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography variant="body2" sx={{ color: "#555" }}>
                Đã chọn:
              </Typography>
              {selected.map((id) => {
                const cat = danhMucList.find((c) => c.id === id);
                return cat ? (
                  <Chip
                    key={id}
                    label={cat.tenDanhMuc}
                    size="small"
                    onDelete={() => toggleCategory(id)}
                    sx={{ bgcolor: "#fdf2f3", color: "#7A1F2B" }}
                  />
                ) : null;
              })}
            </Box>
          )}

          {/* Loading danh mục */}
          {loadingDanhMuc && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Danh sách danh mục */}
          {!loadingDanhMuc && danhMucList.length === 0 && (
            <Typography sx={{ textAlign: "center", color: "#999", py: 4 }}>
              {searchKeyword
                ? "Không tìm thấy danh mục nào."
                : "Chưa có danh mục nào."}
            </Typography>
          )}

          {!loadingDanhMuc && danhMucList.length > 0 && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 2,
              }}
            >
              {danhMucList.map((cat) => {
                const isSelected = selected.includes(cat.id);
                return (
                  <Card
                    key={cat.id}
                    variant="outlined"
                    sx={{
                      width: 160,
                      borderRadius: 2,
                      borderColor: isSelected ? "#7A1F2B" : "#e0e0e0",
                      borderWidth: isSelected ? 2 : 1,
                      cursor: "pointer",
                      transition: "0.15s",
                      bgcolor: isSelected ? "#fdf2f3" : "#fff",
                      "&:hover": {
                        borderColor: "#7A1F2B",
                        bgcolor: "#fdf2f3",
                      },
                    }}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    <CardActionArea
                      sx={{
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: 15,
                          color: isSelected ? "#7A1F2B" : "#1A1A1A",
                        }}
                      >
                        {cat.tenDanhMuc}
                      </Typography>
                    </CardActionArea>
                  </Card>
                );
              })}
            </Box>
          )}

          {/* Hiển thị lỗi */}
          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading khi đang tạo khóa học */}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <CircularProgress />
            </Box>
          )}
        </Box>
      </StepWrapper>
    </AuthGuard>
  );
}
