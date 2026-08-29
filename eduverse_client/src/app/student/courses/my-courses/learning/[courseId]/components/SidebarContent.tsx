// src/app/student/courses/my-courses/learning/[courseId]/components/SidebarContent.tsx

"use client";

import { useMemo, useCallback, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  TextField,
  InputAdornment,
  Collapse,
  alpha,
  CircularProgress,
  Chip,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  PlayArrowRounded as PlayArrowRoundedIcon,
  CheckCircleRounded as CheckCircleRoundedIcon,
  QuizRounded as QuizRoundedIcon,
  FolderOpenOutlined as FolderOpenOutlinedIcon,
  QuestionAnswerOutlined as QuestionAnswerOutlinedIcon,
} from "@mui/icons-material";
import { TaiLieuDropdown } from "./TaiLieuDropdown";
import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import { BaiGiangType } from "@/src/types/BaiGiang/Dto/BaiGiangDto";
import { BaiKiemTraDto } from "@/src/types/baiKiemTra/Dto/baiKiemTraDto";
import { BRAND } from "@/src/theme/tokens";

const PRIMARY_RED = BRAND.main;

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
  onOpenQnA?: (bg: BaiGiangType) => void;
}

export const SidebarContent = ({
  khoaHoc,
  baiGiang,
  phanDangMo,
  searchTerm,
  onSearchChange,
  onTogglePhan,
  onSelectBaiGiang,
  onOpenQnA,
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
  const [openTaiLieuMap, setOpenTaiLieuMap] = useState<Record<string, boolean>>({});

  // Cast sang PhanHocApi[] để dùng đúng field camelCase từ BE
  const phanHocList = useMemo(
    () => (khoaHoc?.danhSachPhanHoc as unknown as PhanHocApi[]) ?? [],
    [khoaHoc?.danhSachPhanHoc],
  );

  // 🔍 Lọc bài giảng theo từ khóa tìm kiếm
  const filteredPhanHocs = useMemo(() => {
    if (!phanHocList.length) return [];
    const lower = searchTerm.trim().toLowerCase();

    // Nếu không có từ khóa, trả về toàn bộ
    if (!lower) return phanHocList;

    return phanHocList
      .map((phan) => {
        const filteredBaiGiang = (phan.danhSachBaiGiang ?? []).filter((bg) =>
          bg.tieuDe?.toLowerCase().includes(lower),
        );

        const filteredQuiz = (phan.danhSachBaiKiemTra ?? []).filter((q) =>
          q.tenBaiKiemTra?.toLowerCase().includes(lower),
        );

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

  // Thống kê tổng số phần và phần hoàn thành
  const tongSoPhan = phanHocList.length;
  const soPhanHoanThanh = useMemo(() => {
    return phanHocList.filter((phan) => {
      const bgs = phan.danhSachBaiGiang ?? [];
      if (bgs.length === 0) return false;
      return bgs.every((b) => progressMap.get(b.id!)?.daHoanThanh === true);
    }).length;
  }, [phanHocList, progressMap]);

  // Tổng số mục (bài giảng + quiz)
  const tongSoMuc = useMemo(() => {
    return phanHocList.reduce((acc, phan) => {
      return (
        acc +
        (phan.danhSachBaiGiang?.length ?? 0) +
        (phan.danhSachBaiKiemTra?.length ?? 0)
      );
    }, 0);
  }, [phanHocList]);

  // Xóa từ khóa tìm kiếm
  const handleClearSearch = useCallback(() => {
    onSearchChange("");
  }, [onSearchChange]);

  const toggleTaiLieu = (bgId: string) => {
    setOpenTaiLieuMap((prev) => ({
      ...prev,
      [bgId]: !prev[bgId],
    }));
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        bgcolor: "#FFFFFF",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.25,
          pb: 1.5,
          bgcolor: "#FFFFFF",
          flexShrink: 0,
        }}
      >
        {/* Section Title & Mobile Close */}
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.75,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: "#1E293B",
              fontSize: "19px",
              letterSpacing: "-0.2px",
            }}
          >
            Nội dung khóa học
          </Typography>
          {isMobile && onCloseMobile && (
            <IconButton size="small" onClick={onCloseMobile}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
        </Stack>

        {/* Search input */}
        <Box sx={{ mb: 0.5 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm bài giảng..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "40px",
                borderRadius: "14px",
                bgcolor: "#F1F4F9",
                border: "1px solid transparent",
                transition: "all 0.2s ease",
                "& fieldset": { border: "none" },
                "&:hover": {
                  bgcolor: "#E9EDF5",
                },
                "&.Mui-focused": {
                  borderColor: PRIMARY_RED,
                  bgcolor: "#FFFFFF",
                  boxShadow: `0 0 0 3px ${alpha(PRIMARY_RED, 0.1)}`,
                },
              },
              "& .MuiInputBase-input": {
                fontSize: "13.5px",
                color: "#1E293B",
                padding: "8px 12px",
                "&::placeholder": {
                  color: "#94A3B8",
                  fontWeight: 500,
                },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start" sx={{ ml: 0.5 }}>
                    <SearchIcon
                      sx={{
                        fontSize: 18,
                        color: "#94A3B8",
                      }}
                    />
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
                      <CloseIcon
                        sx={{
                          fontSize: 16,
                          color: "#94A3B8",
                        }}
                      />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />
        </Box>
      </Box>

      {/* Curriculum Sections List - Scrollable */}
      <Box
        sx={{
          overflowY: "auto",
          flex: 1,
          px: 2,
          pb: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "#CBD5E1",
            borderRadius: 3,
          },
        }}
      >
        {filteredPhanHocs.length > 0 ? (
          filteredPhanHocs.map((phan, idx) => {
            const isOpen = phanDangMo.has(phan.id!);
            const isPlaying = phan.id === idPhanPlay;
            const dsBaiGiang = phan.danhSachBaiGiang ?? [];
            const dsQuiz = phan.danhSachBaiKiemTra ?? [];
            const totalItems = dsBaiGiang.length + dsQuiz.length;
            const doneCnt = dsBaiGiang.filter(
              (b) => progressMap.get(b.id!)?.daHoanThanh === true,
            ).length;
            const totalMin = Math.floor(
              dsBaiGiang.reduce((s, b) => s + (b.thoiLuong ?? 0), 0) / 60,
            );
            const isSectionDone = totalItems > 0 && doneCnt === dsBaiGiang.length;

            return (
              <Box key={phan.id ?? idx} sx={{ mb: 0.5 }}>
                {/* Section Accordion Header */}
                <Box
                  onClick={() => onTogglePhan(phan.id!, idPhanPlay)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1.25,
                    borderRadius: "16px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "#F8FAFC",
                    },
                  }}
                >
                  {/* Circular Section Progress Badge */}
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: isSectionDone
                        ? "2px solid #16A34A"
                        : "2px solid #E2E8F0",
                      bgcolor: isSectionDone ? "#F0FDF4" : "#FFFFFF",
                      color: isSectionDone ? "#16A34A" : "#475569",
                      fontWeight: 800,
                      fontSize: "12.5px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isSectionDone ? (
                      <CheckCircleRoundedIcon sx={{ fontSize: 20 }} />
                    ) : (
                      `${doneCnt}/${dsBaiGiang.length}`
                    )}
                  </Box>

                  {/* Section Title & Metadata */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "11.5px",
                        fontWeight: 700,
                        color: "#64748B",
                        textTransform: "none",
                        lineHeight: 1.2,
                        mb: 0.3,
                      }}
                    >
                      Phần {phan.thuTuSapXep ?? idx + 1}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: "14.5px",
                        color: isPlaying ? PRIMARY_RED : "#1E293B",
                        lineHeight: 1.3,
                      }}
                      noWrap
                    >
                      {phan.tenPhan}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "#64748B",
                        mt: 0.3,
                      }}
                    >
                      {searchTerm.trim()
                        ? `${totalItems} kết quả`
                        : `${totalItems} mục  •  ${totalMin > 0 ? `${totalMin} phút` : "Chưa có video"}`}
                    </Typography>
                  </Box>

                  {/* Chevron Expand/Collapse */}
                  <IconButton
                    size="small"
                    sx={{
                      color: "#64748B",
                      p: 0.5,
                      "&:hover": { color: "#1E293B" },
                    }}
                  >
                    {isOpen ? (
                      <KeyboardArrowUpIcon sx={{ fontSize: 22 }} />
                    ) : (
                      <KeyboardArrowDownIcon sx={{ fontSize: 22 }} />
                    )}
                  </IconButton>
                </Box>

                {/* Section Content (Lectures & Quizzes) */}
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.25,
                      pt: 1.25,
                      pl: 0.5,
                    }}
                  >
                    {/* Lectures List */}
                    {dsBaiGiang.map((bg, i) => {
                      const bgDone =
                        progressMap.get(bg.id!)?.daHoanThanh === true;
                      const isSelected = baiGiang?.id === bg.id;
                      const hasDocs = (bg.danhSachTaiLieu?.length ?? 0) > 0;
                      const isDocOpen = openTaiLieuMap[bg.id!] || false;

                      return (
                        <Box key={bg.id ?? i}>
                          {/* Lecture Card */}
                          <Box
                            onClick={() => onSelectBaiGiang(bg)}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                              p: "12px 14px",
                              borderRadius: "16px",
                              cursor: "pointer",
                              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                              bgcolor: isSelected ? "#FFFFFF" : "#F1F4F9",
                              border: isSelected
                                ? `2px solid ${PRIMARY_RED}`
                                : "1.5px solid transparent",
                              boxShadow: isSelected
                                ? `0 4px 16px ${alpha(PRIMARY_RED, 0.12)}`
                                : "none",
                              "&:hover": {
                                bgcolor: isSelected ? "#FFFFFF" : "#E9EDF5",
                                transform: "translateY(-1px)",
                              },
                            }}
                          >
                            {/* Left Rounded Square Icon Box */}
                            <Box
                              sx={{
                                width: 44,
                                height: 44,
                                borderRadius: "12px",
                                bgcolor: "#FFFFFF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                                flexShrink: 0,
                                color: isSelected
                                  ? PRIMARY_RED
                                  : bgDone
                                    ? "#16A34A"
                                    : "#1E293B",
                                transition: "all 0.2s ease",
                              }}
                            >
                              {bgDone ? (
                                <CheckCircleRoundedIcon sx={{ fontSize: 22 }} />
                              ) : (
                                <PlayArrowRoundedIcon
                                  sx={{
                                    fontSize: 22,
                                    color: isSelected ? PRIMARY_RED : "#1E293B",
                                  }}
                                />
                              )}
                            </Box>

                            {/* Title & Duration */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                sx={{
                                  fontWeight: isSelected ? 800 : 700,
                                  fontSize: "13.5px",
                                  lineHeight: 1.35,
                                  color: isSelected ? PRIMARY_RED : "#1E293B",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {i + 1}. {bg.tieuDe}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: "12px",
                                  color: "#64748B",
                                  fontWeight: 500,
                                  mt: 0.4,
                                }}
                              >
                                {Math.floor((bg.thoiLuong ?? 0) / 60)} phút
                                {(bg.thoiLuong ?? 0) % 60 > 0
                                  ? ` ${(bg.thoiLuong ?? 0) % 60}s`
                                  : ""}
                              </Typography>
                            </Box>

                            {/* Right Action Icons (Document / Q&A) */}
                            <Stack
                              direction="row"
                              spacing={0.5}
                              sx={{ alignItems: "center", flexShrink: 0 }}
                            >
                              {hasDocs && (
                                <Tooltip
                                  title={`${bg.danhSachTaiLieu?.length} tài liệu đính kèm`}
                                  arrow
                                >
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleTaiLieu(bg.id!);
                                    }}
                                    sx={{
                                      color: isDocOpen ? PRIMARY_RED : "#64748B",
                                      p: 0.6,
                                      bgcolor: isDocOpen
                                        ? alpha(PRIMARY_RED, 0.08)
                                        : "transparent",
                                      "&:hover": {
                                        color: PRIMARY_RED,
                                        bgcolor: alpha(PRIMARY_RED, 0.08),
                                      },
                                    }}
                                  >
                                    <FolderOpenOutlinedIcon
                                      sx={{ fontSize: 18 }}
                                    />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {onOpenQnA && (
                                <Tooltip title="Đặt câu hỏi bài này" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenQnA(bg);
                                    }}
                                    sx={{
                                      color: "#64748B",
                                      p: 0.6,
                                      "&:hover": {
                                        color: PRIMARY_RED,
                                        bgcolor: alpha(PRIMARY_RED, 0.08),
                                      },
                                    }}
                                  >
                                    <QuestionAnswerOutlinedIcon
                                      sx={{ fontSize: 17 }}
                                    />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </Box>

                          {/* Attached Document Dropdown */}
                          {hasDocs && isDocOpen && (
                            <Box sx={{ mt: 0.75, pl: 2 }}>
                              <TaiLieuDropdown
                                danhSachTaiLieu={bg.danhSachTaiLieu!}
                              />
                            </Box>
                          )}
                        </Box>
                      );
                    })}

                    {/* Quiz List */}
                    {dsQuiz.map((quiz, qIdx) => {
                      const isQuizSelected = idQuizDangChon === quiz.id;
                      return (
                        <Box
                          key={quiz.id}
                          onClick={() => onSelectQuiz?.(quiz)}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            p: "12px 14px",
                            borderRadius: "16px",
                            cursor: "pointer",
                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                            bgcolor: isQuizSelected ? "#FFFFFF" : "#F1F4F9",
                            border: isQuizSelected
                              ? `2px solid ${PRIMARY_RED}`
                              : "1.5px solid transparent",
                            boxShadow: isQuizSelected
                              ? `0 4px 16px ${alpha(PRIMARY_RED, 0.12)}`
                              : "none",
                            "&:hover": {
                              bgcolor: isQuizSelected ? "#FFFFFF" : "#E9EDF5",
                              transform: "translateY(-1px)",
                            },
                          }}
                        >
                          {/* Left Rounded Square Quiz Icon */}
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: "12px",
                              bgcolor: "#FFFFFF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                              flexShrink: 0,
                              color: isQuizSelected ? PRIMARY_RED : "#64748B",
                            }}
                          >
                            <QuizRoundedIcon sx={{ fontSize: 22 }} />
                          </Box>

                          {/* Quiz Info */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontWeight: isQuizSelected ? 800 : 700,
                                fontSize: "13.5px",
                                lineHeight: 1.35,
                                color: isQuizSelected ? PRIMARY_RED : "#1E293B",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {dsBaiGiang.length + qIdx + 1}.{" "}
                              {quiz.tenBaiKiemTra ?? "Bài kiểm tra"}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "12px",
                                color: "#64748B",
                                fontWeight: 500,
                                mt: 0.4,
                              }}
                            >
                              {quiz.soCauHoi ?? 0} câu hỏi
                              {quiz.gioiHanThoiGian
                                ? `  •  ${quiz.gioiHanThoiGian} phút`
                                : ""}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Collapse>
              </Box>
            );
          })
        ) : (
          /* Empty Search State */
          <Box sx={{ p: 4, textAlign: "center" }}>
            {searchTerm.trim() ? (
              <>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: "#1E293B",
                    fontSize: "15px",
                    mb: 1,
                  }}
                >
                  Không tìm thấy kết quả
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#64748B", mb: 2, fontSize: "13px" }}
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
                    borderRadius: "10px",
                    "&:hover": { bgcolor: "#7F1D1D" },
                  }}
                />
              </>
            ) : (
              <Typography sx={{ color: "#64748B", fontSize: "13.5px" }}>
                Không có bài giảng nào trong khóa học này
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Bottom Overall Progress Dock */}
      <Box
        sx={{
          p: "16px 20px",
          bgcolor: "#F3F6FB",
          borderTop: "1px solid #E2E8F0",
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "14px",
            color: "#1E293B",
            mb: 1.5,
          }}
        >
          Tiến độ tổng thể của bạn
        </Typography>

        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          {/* Circular Progress Gauge */}
          <Box
            sx={{
              position: "relative",
              width: 50,
              height: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {/* Background Ring */}
            <CircularProgress
              variant="determinate"
              value={100}
              size={50}
              thickness={5}
              sx={{ color: "#E2E8F0", position: "absolute" }}
            />
            {/* Accent Progress Ring */}
            <CircularProgress
              variant="determinate"
              value={phanTramHoanThanh}
              size={50}
              thickness={5}
              sx={{
                color: PRIMARY_RED,
                strokeLinecap: "round",
                position: "absolute",
              }}
            />
            <Typography
              sx={{
                fontSize: "11px",
                fontWeight: 900,
                color: "#1E293B",
              }}
            >
              {phanTramHoanThanh}%
            </Typography>
          </Box>

          {/* Stat 1: Completed Sections */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: "16px",
                color: PRIMARY_RED,
                lineHeight: 1.1,
              }}
            >
              {soPhanHoanThanh}/{tongSoPhan}
            </Typography>
            <Typography
              sx={{
                fontSize: "11.5px",
                fontWeight: 500,
                color: "#64748B",
                mt: 0.3,
                whiteSpace: "nowrap",
              }}
            >
              phần đã hoàn thành
            </Typography>
          </Box>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ borderColor: "#E2E8F0", height: 32, my: "auto" }}
          />

          {/* Stat 2: Completed Items */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: "16px",
                color: PRIMARY_RED,
                lineHeight: 1.1,
              }}
            >
              {soBaiHoanThanh}/{tongSoMuc}
            </Typography>
            <Typography
              sx={{
                fontSize: "11.5px",
                fontWeight: 500,
                color: "#64748B",
                mt: 0.3,
                whiteSpace: "nowrap",
              }}
            >
              mục đã hoàn thành
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};
