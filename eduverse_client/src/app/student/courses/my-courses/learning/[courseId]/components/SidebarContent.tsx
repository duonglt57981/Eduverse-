// src/app/student/courses/my-courses/learning/[courseId]/components/SidebarContent.tsx

"use client";

import { useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  alpha,
  LinearProgress,
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Quiz as QuizIcon,
} from "@mui/icons-material";
import { TaiLieuDropdown } from "./TaiLieuDropdown";
import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import { BaiGiangType } from "@/src/types/BaiGiang/Dto/BaiGiangDto";
import { BaiKiemTraDto } from "@/src/types/baiKiemTra/Dto/baiKiemTraDto";

const PRIMARY_RED = "#991B1B";

// Interface khớp với response thực tế từ BE (camelCase)
interface PhanHocApi {
  id?: string;
  tenPhan?: string;
  thuTuSapXep?: number;
  danhSachBaiGiang?: BaiGiangType[];
  danhSachBaiKiemTra?: BaiKiemTraDto[];
}

interface SidebarContentProps {
  khoaHoc: KhoaHocType;
  baiGiang: BaiGiangType | null;
  phanDangMo: Set<string>;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onTogglePhan: (id: string, playingPhanId?: string) => void;
  onSelectBaiGiang: (bg: BaiGiangType) => void;
  progressMap: Map<string, { daHoanThanh: boolean; thoiGianXem: number }>;
  phanTramHoanThanh: number;
  soBaiHoanThanh: number;
  tongBai: number;
  idPhanPlay?: string;
  isMobile?: boolean;
  onCloseMobile?: () => void;
  quizTheoPhan?: Map<string, BaiKiemTraDto[]>;
  idQuizDangChon?: string;
  onSelectQuiz?: (quiz: BaiKiemTraDto) => void;
}

export const SidebarContent = ({
  khoaHoc,
  baiGiang,
  phanDangMo,
  searchTerm,
  onSearchChange,
  onTogglePhan,
  onSelectBaiGiang,
  progressMap,
  phanTramHoanThanh,
  soBaiHoanThanh,
  tongBai,
  idPhanPlay,
  isMobile,
  onCloseMobile,
  quizTheoPhan,
  idQuizDangChon,
  onSelectQuiz,
}: SidebarContentProps) => {
  // Cast sang PhanHocApi[] để dùng đúng field camelCase từ BE
  const phanHocList = useMemo(
    () => (khoaHoc?.danhSachPhanHoc as unknown as PhanHocApi[]) ?? [],
    [khoaHoc?.danhSachPhanHoc],
  );

  // 🔍 Lọc bài giảng theo từ khóa tìm kiếm (CẢI TIẾN)
  const filteredPhanHocs = useMemo(() => {
    if (!phanHocList.length) return [];
    const lower = searchTerm.trim().toLowerCase();

    // Nếu không có từ khóa, trả về toàn bộ
    if (!lower) return phanHocList;

    return phanHocList
      .map((phan) => {
        // Lọc bài giảng theo từ khóa
        const filteredBaiGiang = (phan.danhSachBaiGiang ?? []).filter((bg) =>
          bg.tieuDe?.toLowerCase().includes(lower),
        );

        // Lọc quiz theo từ khóa
        const filteredQuiz = (phan.danhSachBaiKiemTra ?? []).filter((q) =>
          q.tenBaiKiemTra?.toLowerCase().includes(lower),
        );

        // Kiểm tra tên phần có khớp không
        const tenPhanKhop =
          phan.tenPhan?.toLowerCase().includes(lower) ?? false;

        return {
          ...phan,
          danhSachBaiGiang: tenPhanKhop
            ? (phan.danhSachBaiGiang ?? [])
            : filteredBaiGiang,
          danhSachBaiKiemTra: tenPhanKhop
            ? (phan.danhSachBaiKiemTra ?? [])
            : filteredQuiz,
          _keepAll: tenPhanKhop,
        };
      })
      .filter((phan) => {
        // Giữ phần nếu tên phần khớp hoặc có ít nhất 1 bài giảng/quiz khớp
        return (
          phan._keepAll ||
          (phan.danhSachBaiGiang?.length ?? 0) > 0 ||
          (phan.danhSachBaiKiemTra?.length ?? 0) > 0
        );
      });
  }, [phanHocList, searchTerm]);

  // Đếm số kết quả tìm kiếm
  const soKetQuaTimKiem = useMemo(() => {
    if (!searchTerm.trim()) return 0;
    let count = 0;
    filteredPhanHocs.forEach((phan) => {
      count += (phan.danhSachBaiGiang ?? []).length;
      count += (phan.danhSachBaiKiemTra ?? []).length;
    });
    return count;
  }, [filteredPhanHocs, searchTerm]);

  // Xóa từ khóa tìm kiếm
  const handleClearSearch = useCallback(() => {
    onSearchChange("");
  }, [onSearchChange]);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        bgcolor: "#ffffff",
      }}
    >
      {/* Header - luôn hiển thị */}
      <Box
        sx={{
          p: 3,
          borderBottom: "1px solid #E5E7EB",
          bgcolor: "#ffffff",
          flexShrink: 0,
        }}
      >
        <Stack
          direction="row"
          sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 900, color: "#111827" }}
          >
            Nội dung khóa học
          </Typography>
          {isMobile && onCloseMobile && (
            <IconButton size="small" onClick={onCloseMobile}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>

        {/* 🔍 Ô tìm kiếm - CẢI TIẾN */}
        <Box sx={{ mb: 2.25 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm bài giảng..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "42px",
                borderRadius: "10px",
                bgcolor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                transition: "all 0.2s ease",
                "& fieldset": { border: "none" },
                "&:hover": {
                  borderColor: "#CBD5E1",
                  bgcolor: "#F1F5F9",
                },
                "&.Mui-focused": {
                  borderColor: PRIMARY_RED,
                  bgcolor: "#ffffff",
                  boxShadow: `0 0 0 4px ${alpha(PRIMARY_RED, 0.08)}`,
                },
              },
              "& .MuiInputBase-input": {
                fontSize: "14px",
                color: "#111827",
                padding: "8px 12px",
                "&::placeholder": {
                  color: "#94A3B8",
                  fontWeight: 400,
                },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start" sx={{ ml: 0.5 }}>
                    <SearchIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm ? (
                  <InputAdornment position="end" sx={{ gap: 0.5 }}>
                    <Chip
                      label={`${soKetQuaTimKiem} kết quả`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "10px",
                        fontWeight: 700,
                        bgcolor: alpha(PRIMARY_RED, 0.08),
                        color: PRIMARY_RED,
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      sx={{ p: 0.5 }}
                    >
                      <CloseIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />
        </Box>

        {/* Tiến độ học tập */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 0.75,
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: "#64748B" }}
          >
            Tiến độ học tập
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 800, color: PRIMARY_RED }}
          >
            {phanTramHoanThanh}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={phanTramHoanThanh}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: "#F1F5F9",
            "& .MuiLinearProgress-bar": {
              backgroundColor: PRIMARY_RED,
              borderRadius: 3,
            },
            mb: 1,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "right",
            fontWeight: 600,
            color: "#64748B",
          }}
        >
          Đã hoàn thành {soBaiHoanThanh}/{tongBai} bài học
        </Typography>
      </Box>

      {/* Phần danh sách bài giảng - có thể cuộn */}
      <Box sx={{ overflowY: "auto", flex: 1, pb: 2 }}>
        {filteredPhanHocs.length > 0 ? (
          filteredPhanHocs.map((phan, idx) => {
            const isOpen = phanDangMo.has(phan.id!);
            const isPlaying = phan.id === idPhanPlay;
            const dsBaiGiang = phan.danhSachBaiGiang ?? [];
            const dsQuiz = phan.danhSachBaiKiemTra ?? [];
            const doneCnt = dsBaiGiang.filter(
              (b) => progressMap.get(b.id!)?.daHoanThanh === true,
            ).length;
            const totalMin = Math.floor(
              dsBaiGiang.reduce((s, b) => s + (b.thoiLuong ?? 0), 0) / 60,
            );

            // Hiển thị số lượng kết quả tìm thấy trong phần
            const soKetQuaTrongPhan = dsBaiGiang.length + dsQuiz.length;

            return (
              <Box key={phan.id ?? idx}>
                <ListItemButton
                  onClick={() => onTogglePhan(phan.id!, idPhanPlay)}
                  sx={{
                    bgcolor: isOpen ? "#F8FAFC" : "#ffffff",
                    borderBottom: "1px solid #F1F5F9",
                    borderLeft: `3px solid ${
                      isPlaying ? PRIMARY_RED : "transparent"
                    }`,
                    py: 2,
                    px: 3,
                    transition: "background-color 0.2s",
                    "&:hover": {
                      bgcolor: "#F8FAFC",
                    },
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 800,
                        color: isPlaying ? PRIMARY_RED : "#111827",
                      }}
                      noWrap
                    >
                      {phan.thuTuSapXep ?? idx + 1}. {phan.tenPhan}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: "#64748B",
                        mt: 0.5,
                        display: "block",
                      }}
                    >
                      {searchTerm.trim()
                        ? `${soKetQuaTrongPhan} kết quả tìm thấy`
                        : `${doneCnt}/${dsBaiGiang.length} bài giảng · ${totalMin} phút`}
                    </Typography>
                  </Box>
                  {isOpen ? (
                    <ExpandLessIcon sx={{ fontSize: 20, color: "#64748B" }} />
                  ) : (
                    <ExpandMoreIcon sx={{ fontSize: 20, color: "#64748B" }} />
                  )}
                </ListItemButton>

                <Collapse in={isOpen} timeout="auto">
                  <List disablePadding>
                    {/* Danh sách bài giảng */}
                    {dsBaiGiang.map((bg, i) => {
                      const bgDone =
                        progressMap.get(bg.id!)?.daHoanThanh === true;
                      const isSelected = baiGiang?.id === bg.id;
                      return (
                        <Box key={bg.id ?? i}>
                          <ListItemButton
                            selected={isSelected}
                            onClick={() => onSelectBaiGiang(bg)}
                            sx={{
                              pl: 4,
                              pr: 3,
                              py: 1.75,
                              borderLeft: `4px solid ${
                                isSelected ? PRIMARY_RED : "transparent"
                              }`,
                              bgcolor: isSelected
                                ? "#FEF2F2 !important"
                                : "transparent",
                              transition: "all 0.15s ease",
                              "&:hover": {
                                bgcolor: "#F8FAFC",
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 28 }}>
                              {bgDone ? (
                                <CheckCircleIcon
                                  sx={{ color: "#15803D", fontSize: 18 }}
                                />
                              ) : (
                                <PlayArrowIcon
                                  sx={{
                                    color: isSelected ? PRIMARY_RED : "#94A3B8",
                                    fontSize: 18,
                                  }}
                                />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: isSelected ? 800 : 600,
                                    lineHeight: 1.4,
                                    fontSize: "13.5px",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                  color={isSelected ? PRIMARY_RED : "#1F2937"}
                                >
                                  {bg.tieuDe}
                                </Typography>
                              }
                              secondary={
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#64748B",
                                    fontWeight: 500,
                                    mt: 0.5,
                                    display: "block",
                                  }}
                                >
                                  {Math.floor((bg.thoiLuong ?? 0) / 60)}p{" "}
                                  {(bg.thoiLuong ?? 0) % 60}s
                                </Typography>
                              }
                            />
                          </ListItemButton>
                          {(bg.danhSachTaiLieu?.length ?? 0) > 0 && (
                            <TaiLieuDropdown
                              danhSachTaiLieu={bg.danhSachTaiLieu!}
                            />
                          )}
                        </Box>
                      );
                    })}

                    {/* Danh sách Quiz */}
                    {dsQuiz.map((quiz) => {
                      const isQuizSelected = idQuizDangChon === quiz.id;
                      return (
                        <ListItemButton
                          key={quiz.id}
                          selected={isQuizSelected}
                          onClick={() => onSelectQuiz?.(quiz)}
                          sx={{
                            pl: 4,
                            pr: 3,
                            py: 1.75,
                            borderLeft: `4px solid ${
                              isQuizSelected ? PRIMARY_RED : "transparent"
                            }`,
                            bgcolor: isQuizSelected
                              ? "#FEF2F2 !important"
                              : "transparent",
                            transition: "all 0.15s ease",
                            "&:hover": {
                              bgcolor: "#F8FAFC",
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            <QuizIcon
                              sx={{
                                color: isQuizSelected ? PRIMARY_RED : "#94A3B8",
                                fontSize: 18,
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: isQuizSelected ? 800 : 600,
                                  lineHeight: 1.4,
                                  fontSize: "13.5px",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                                color={isQuizSelected ? PRIMARY_RED : "#1F2937"}
                              >
                                {quiz.tenBaiKiemTra ?? "Bài kiểm tra"}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#64748B",
                                  fontWeight: 500,
                                  mt: 0.5,
                                  display: "block",
                                }}
                              >
                                {quiz.soCauHoi ?? 0} câu hỏi
                                {quiz.gioiHanThoiGian
                                  ? ` · ${quiz.gioiHanThoiGian} phút`
                                  : ""}
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>
            );
          })
        ) : (
          // Hiển thị khi không có kết quả tìm kiếm
          <Box sx={{ p: 4, textAlign: "center" }}>
            {searchTerm.trim() ? (
              <>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 700, color: "#1F2937", mb: 1 }}
                >
                  Không tìm thấy kết quả
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Không tìm thấy bài giảng nào phù hợp với &quot;
                  {searchTerm}&quot;
                </Typography>
                <Chip
                  label="Xóa tìm kiếm"
                  onClick={handleClearSearch}
                  sx={{
                    bgcolor: PRIMARY_RED,
                    color: "#fff",
                    fontWeight: 700,
                    "&:hover": { bgcolor: "#7F1D1D" },
                  }}
                />
              </>
            ) : (
              <Typography color="text.secondary" variant="body2">
                Không có bài giảng nào trong khóa học này
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
