"use client";

import { useState, useMemo } from "react";
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
  useTheme,
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
// Không sửa file type gốc, chỉ dùng nội bộ ở đây
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
  const theme = useTheme();

  // Cast sang PhanHocApi[] để dùng đúng field camelCase từ BE
  const phanHocList = (khoaHoc?.danhSachPhanHoc as unknown as PhanHocApi[]) ?? [];

  const filteredPhanHocs = useMemo(() => {
    if (!phanHocList.length) return [];
    if (!searchTerm.trim()) return phanHocList;
    const lower = searchTerm.toLowerCase();
    return phanHocList
      .map((phan) => ({
        ...phan,
        danhSachBaiGiang:
          phan.danhSachBaiGiang?.filter((bg) =>
            bg.tieuDe?.toLowerCase().includes(lower),
          ) ?? [],
      }))
      .filter((phan) => phan.danhSachBaiGiang.length > 0);
  }, [phanHocList, searchTerm]);

  const textFieldProps = {
    fullWidth: true,
    size: "small" as const,
    placeholder: "Tìm kiếm bài giảng...",
    value: searchTerm,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      onSearchChange(e.target.value),
    slotProps: {
      input: {
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ fontSize: 18 }} color="action" />
          </InputAdornment>
        ),
        endAdornment: searchTerm ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => onSearchChange("")}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </InputAdornment>
        ) : undefined,
      },
    },
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", bgcolor: "var(--ev-paper, #ffffff)" }}>
      <Box sx={{
        p: 3,
        borderBottom: "1px solid #E5E7EB",
        bgcolor: "var(--ev-paper, #ffffff)",
        flexShrink: 0,
      }}>
        <Stack direction="row" sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "var(--ev-text-primary, #111827)" }}>
            Nội dung khóa học
          </Typography>
          {isMobile && onCloseMobile && (
            <IconButton size="small" onClick={onCloseMobile}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>

        <TextField
          {...textFieldProps}
          sx={{
            mb: 2.25,
            "& .MuiOutlinedInput-root": {
              height: "42px",
              borderRadius: "10px",
              bgcolor: "var(--ev-paper-alt, #F8FAFC)",
              "& fieldset": { borderColor: "var(--ev-divider, #E2E8F0)" },
              "&:hover fieldset": { borderColor: "#CBD5E1" },
              "&.Mui-focused fieldset": { borderColor: PRIMARY_RED, borderWidth: "1.5px" },
            },
            "& .MuiInputBase-input": {
              fontSize: "14px",
              color: "var(--ev-text-primary, #111827)",
            }
          }}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "var(--ev-text-secondary, #64748B)" }}>
            Tiến độ học tập
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 800, color: PRIMARY_RED }}>
            {phanTramHoanThanh}%
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={phanTramHoanThanh}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: "var(--ev-paper-alt, #F1F5F9)",
            "& .MuiLinearProgress-bar": { backgroundColor: PRIMARY_RED, borderRadius: 3 },
            mb: 1
          }} />
        <Typography variant="caption" sx={{ display: "block", textAlign: "right", fontWeight: 600, color: "var(--ev-text-secondary, #64748B)" }}>
          Đã hoàn thành {soBaiHoanThanh}/{tongBai} bài học
        </Typography>
      </Box>

      <Box sx={{ overflowY: "auto", flex: 1, pb: 2 }}>
        {filteredPhanHocs.map((phan, idx) => {
          const isOpen = phanDangMo.has(phan.id!);
          const isPlaying = phan.id === idPhanPlay;
          const dsBaiGiang = phan.danhSachBaiGiang ?? [];
          const doneCnt = dsBaiGiang.filter(
            (b) => progressMap.get(b.id!)?.daHoanThanh === true,
          ).length;
          const totalMin = Math.floor(
            dsBaiGiang.reduce((s, b) => s + (b.thoiLuong ?? 0), 0) / 60,
          );

          return (
            <Box key={phan.id ?? idx}>
              <ListItemButton
                onClick={() => onTogglePhan(phan.id!, idPhanPlay)}
                sx={{
                  bgcolor: isOpen ? "#F8FAFC" : "#ffffff",
                  borderBottom: "1px solid #F1F5F9",
                  borderLeft: `3px solid ${isPlaying ? PRIMARY_RED : "transparent"}`,
                  py: 2,
                  px: 3,
                  transition: "background-color 0.2s",
                  "&:hover": {
                    bgcolor: "var(--ev-paper-alt, #F8FAFC)",
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
                    sx={{ fontWeight: 600, color: "var(--ev-text-secondary, #64748B)", mt: 0.5, display: "block" }}
                  >
                    {doneCnt}/{dsBaiGiang.length} bài giảng · {totalMin} phút
                  </Typography>
                </Box>
                {isOpen ? (
                  <ExpandLessIcon sx={{ fontSize: 20, color: "var(--ev-text-secondary, #64748B)" }} />
                ) : (
                  <ExpandMoreIcon sx={{ fontSize: 20, color: "var(--ev-text-secondary, #64748B)" }} />
                )}
              </ListItemButton>

              <Collapse in={isOpen}>
                <List disablePadding>
                  {dsBaiGiang.map((bg, i) => {
                    const bgDone = progressMap.get(bg.id!)?.daHoanThanh === true;
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
                            borderLeft: `4px solid ${isSelected ? PRIMARY_RED : "transparent"}`,
                            bgcolor: isSelected ? "#FEF2F2 !important" : "transparent",
                            transition: "all 0.15s ease",
                            "&:hover": {
                              bgcolor: "var(--ev-paper-alt, #F8FAFC)",
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            {bgDone ? (
                              <CheckCircleIcon sx={{ color: "#15803D", fontSize: 18 }} />
                            ) : (
                              <PlayArrowIcon sx={{ color: isSelected ? PRIMARY_RED : "#94A3B8", fontSize: 18 }} />
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
                              <Typography variant="caption" sx={{ color: "var(--ev-text-secondary, #64748B)", fontWeight: 500, mt: 0.5, display: "block" }}>
                                {Math.floor((bg.thoiLuong ?? 0) / 60)}p{" "}
                                {(bg.thoiLuong ?? 0) % 60}s
                              </Typography>
                            }
                          />
                        </ListItemButton>
                        {(bg.danhSachTaiLieu?.length ?? 0) > 0 && (
                          <TaiLieuDropdown danhSachTaiLieu={bg.danhSachTaiLieu!} />
                        )}
                      </Box>
                    );
                  })}

                  {/* Quiz ở cuối danh sách bài giảng */}
                  {(quizTheoPhan?.get(phan.id!) ?? []).map((quiz) => {
                    const isQuizSelected = idQuizDangChon === quiz.id;
                    return (
                      <ListItemButton
                        key={quiz.id}
                        selected={isQuizSelected}
                        onClick={() => onSelectQuiz?.(quiz)}
                        sx={{
                          pl: 4, pr: 3, py: 1.75,
                          borderLeft: `4px solid ${isQuizSelected ? PRIMARY_RED : "transparent"}`,
                          bgcolor: isQuizSelected ? "#FEF2F2 !important" : "transparent",
                          transition: "all 0.15s ease",
                          "&:hover": {
                            bgcolor: "var(--ev-paper-alt, #F8FAFC)",
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <QuizIcon sx={{ color: isQuizSelected ? PRIMARY_RED : "#94A3B8", fontSize: 18 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2"
                              sx={{
                                fontWeight: isQuizSelected ? 800 : 600,
                                lineHeight: 1.4,
                                fontSize: "13.5px",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                              color={isQuizSelected ? PRIMARY_RED : "#1F2937"}>
                              {quiz.tenBaiKiemTra ?? "Bài kiểm tra"}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ color: "var(--ev-text-secondary, #64748B)", fontWeight: 500, mt: 0.5, display: "block" }}>
                              {quiz.soCauHoi ?? 0} câu hỏi
                              {quiz.gioiHanThoiGian ? ` · ${quiz.gioiHanThoiGian} phút` : ""}
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
        })}

        {filteredPhanHocs.length === 0 && (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary" variant="body2">
              Không tìm thấy bài giảng.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};