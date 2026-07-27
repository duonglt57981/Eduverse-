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
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { useCourseCreate } from "../context/CourseCreateContext";
import StepWrapper from "../context/StepWrapper";
import KhoaHocService from "@/src/services/KhoaHocService";
import { danhMucService } from "@/src/services/danhmucService";
import { DanhMucDto } from "@/src/types/khoaHoc";
import AuthGuard from "@/src/components/AuthGuard";
import { CreateKhoaHocRequest } from "@/src/types/khoaHoc/Request/request";

// Trạng thái danh mục mặc định được phép hiển thị khi tạo khóa học
const TRANG_THAI_DANH_MUC_MAC_DINH = "HoatDong";
// Lấy toàn bộ danh mục (không phân trang) để hiển thị đầy đủ cho giảng viên chọn
const SO_LUONG_DANH_MUC_TOI_DA = 1000;

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

  useEffect(() => {
    const fetchDanhMuc = async () => {
      setLoadingDanhMuc(true);
      setError(null);
      try {
        const response = await danhMucService.getList({
          keyword: searchKeyword || undefined,
          pageIndex: 1,
          pageSize: SO_LUONG_DANH_MUC_TOI_DA,
          trangThai: TRANG_THAI_DANH_MUC_MAC_DINH,
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
    if (selected.length === 0) {
      setError("Vui lòng chọn ít nhất một danh mục.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setFormData({ danhSachDanhMuc: selected });

      const payload: CreateKhoaHocRequest = {
        tieuDe: formData.tieuDe,
        danhSachDanhMuc: selected,
      };

      const createResponse = await khoaHocService.CreateKhoaHoc(payload);
      const khoaHocId = createResponse.data.id;
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
        <Box
          sx={{
            bgcolor: "#ffffff",
            borderRadius: "20px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.03)",
            p: { xs: 3, sm: 5 },
            width: "100%",
            maxWidth: 820,
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            py: { xs: 3, sm: 5 },
            px: { xs: 2, sm: 5 },
          }}
        >
          {/* Tiêu đề */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              textAlign: "center",
              mb: 1.5,
              color: "#111827",
              fontSize: { xs: "1.25rem", sm: "1.6rem" },
            }}
          >
            Chọn danh mục phù hợp
          </Typography>

          {/* Mô tả */}
          <Typography
            sx={{
              textAlign: "center",
              color: "#6B7280",
              fontSize: 14,
              mb: 4,
              maxWidth: 480,
              mx: "auto",
              lineHeight: 1.5,
            }}
          >
            Danh mục giúp học viên dễ dàng tìm thấy khóa học của bạn trên hệ thống.
          </Typography>

          {/* Ô tìm kiếm */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 4,
              width: "100%",
            }}
          >
            <TextField
              size="small"
              placeholder="Tìm danh mục..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              sx={{
                width: "100%",
                maxWidth: 420,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  height: "44px",
                  bgcolor: "#ffffff",
                  fontSize: 14,
                  "& fieldset": {
                    borderColor: "#D1D5DB",
                  },
                  "&:hover fieldset": {
                    borderColor: "#7A1F2B",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#7A1F2B",
                    borderWidth: 2,
                  },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: "#9CA3AF" }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchKeyword ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchKeyword("")}
                        aria-label="Xóa từ khóa tìm kiếm"
                        sx={{ color: "#9CA3AF" }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />
          </Box>

          {/* Hiển thị các danh mục đã chọn dưới dạng Chips */}
          {selected.length > 0 && (
            <Box
              sx={{
                mb: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.2,
                flexWrap: "wrap",
                borderBottom: "1px dashed #E5E7EB",
                pb: 2.5,
              }}
            >
              <Typography variant="body2" sx={{ color: "#4B5563", fontWeight: 600 }}>
                Đã chọn:
              </Typography>
              {selected.map((id) => {
                const cat = danhMucList.find((c) => c.id === id);
                return cat ? (
                  <Chip
                    key={id}
                    label={cat.tenDanhMuc}
                    size="medium"
                    onDelete={() => toggleCategory(id)}
                    sx={{
                      bgcolor: "#FFF1F2",
                      color: "#7A1F2B",
                      fontWeight: 600,
                      fontSize: 13,
                      borderRadius: "8px",
                      border: "1px solid #FCA5A5",
                      "& .MuiChip-deleteIcon": {
                        color: "#7A1F2B",
                        "&:hover": { color: "#611722" },
                      },
                    }}
                  />
                ) : null;
              })}
            </Box>
          )}

          {/* Danh sách danh mục loading / skeleton */}
          {loadingDanhMuc ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
                gap: 2,
                maxHeight: 420,
                overflowY: "auto",
                pr: 0.5,
              }}
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    height: 72,
                    borderRadius: "12px",
                    bgcolor: "#F3F4F6",
                    animation: "pulse 1.5s infinite ease-in-out",
                    "@keyframes pulse": {
                      "0%": { opacity: 0.6 },
                      "50%": { opacity: 1 },
                      "100%": { opacity: 0.6 },
                    },
                  }}
                />
              ))}
            </Box>
          ) : (
            <>
              {/* Empty state */}
              {danhMucList.length === 0 && (
                <Typography
                  sx={{
                    textAlign: "center",
                    color: "#9CA3AF",
                    py: 6,
                    fontSize: 15,
                    fontWeight: 500,
                  }}
                >
                  {searchKeyword
                    ? "Không tìm thấy danh mục phù hợp."
                    : "Chưa có danh mục nào."}
                </Typography>
              )}

              {/* Grid danh mục */}
              {danhMucList.length > 0 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(3, 1fr)",
                      lg: "repeat(4, 1fr)",
                    },
                    gap: 2,
                    maxHeight: "380px",
                    overflowY: "auto",
                    pr: 1,
                    py: 0.5,
                    "&::-webkit-scrollbar": {
                      width: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "transparent",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "#E5E7EB",
                      borderRadius: "10px",
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                      background: "#D1D5DB",
                    },
                  }}
                >
                  {danhMucList.map((cat) => {
                    const isSelected = selected.includes(cat.id);
                    return (
                      <Card
                        key={cat.id}
                        variant="outlined"
                        sx={{
                          height: 72,
                          borderRadius: "12px",
                          borderColor: isSelected ? "#7A1F2B" : "#E5E7EB",
                          borderWidth: isSelected ? 2 : 1,
                          cursor: "pointer",
                          position: "relative",
                          transition: "all 0.2s ease",
                          bgcolor: isSelected ? "#FFF1F2" : "#ffffff",
                          boxShadow: isSelected
                            ? "0 4px 12px rgba(122,31,43,0.06)"
                            : "none",
                          "&:hover": {
                            borderColor: "#7A1F2B",
                            bgcolor: isSelected ? "#FFF1F2" : "#F9FAFB",
                            transform: "translateY(-2px)",
                            boxShadow: "0 6px 16px rgba(0,0,0,0.04)",
                          },
                          "&:focus-within": {
                            outline: "2px solid #7A1F2B",
                            outlineOffset: "2px",
                          },
                        }}
                        onClick={() => toggleCategory(cat.id)}
                      >
                        <CardActionArea
                          sx={{
                            px: 2,
                            py: 1,
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {isSelected && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: 6,
                                right: 6,
                                width: 16,
                                height: 16,
                                borderRadius: "50%",
                                bgcolor: "#7A1F2B",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 1px 4px rgba(122,31,43,0.2)",
                              }}
                            >
                              <CheckIcon sx={{ fontSize: 10, fontWeight: "bold" }} />
                            </Box>
                          )}

                          <Typography
                            sx={{
                              fontWeight: isSelected ? 700 : 500,
                              fontSize: 14,
                              color: isSelected ? "#7A1F2B" : "#374151",
                              textAlign: "center",
                              lineHeight: 1.3,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
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
            </>
          )}

          {/* Hiển thị lỗi */}
          {error && (
            <Alert severity="error" sx={{ mt: 3, borderRadius: "10px" }}>
              {error}
            </Alert>
          )}

          {/* Loading khi đang tạo khóa học */}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <CircularProgress sx={{ color: "#7A1F2B" }} />
            </Box>
          )}
        </Box>
      </StepWrapper>
    </AuthGuard>
  );
}
