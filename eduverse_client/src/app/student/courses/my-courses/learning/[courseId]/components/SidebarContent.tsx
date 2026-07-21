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

const PRIMARY_RED = "#8B1313";

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
  // Quiz theo phần học: key = idPhan, value = danh sách bài kiểm tra của phần đó
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

  const filteredPhanHocs = useMemo(() => {
    if (!khoaHoc?.danhSachPhanHoc) return [];
    if (!searchTerm.trim()) return khoaHoc.danhSachPhanHoc;
    const lower = searchTerm.toLowerCase();
    return khoaHoc.danhSachPhanHoc
      .map((phan) => ({
        ...phan,
        danhSachBaiGiang:
          phan.DanhSachBaiGiang?.filter((bg: BaiGiangType) =>
            bg.tieuDe?.toLowerCase().includes(lower),
          ) ?? [],
      }))
      .filter((phan) => phan.danhSachBaiGiang.length > 0);
  }, [khoaHoc, searchTerm]);

  // ✅ Dùng as const để fix lỗi type
  const textFieldProps = {
    fullWidth: true,
    size: "small" as const,
    placeholder: "Tìm kiếm bài giảng...",
    value: searchTerm,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      onSearchChange(e.target.value),
    InputProps: {
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
    sx: { mb: 1.5 },
  } as const;

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          p: 2.5,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: "background.paper",
          flexShrink: 0,
          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.02)}`,
        }}
      >
        <Stack
          direction="row"
          sx={{
            mb: 1.5,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
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
            ...textFieldProps.sx, 
            "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "background.default" } 
          }} 
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>
            Tiến độ học tập
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: PRIMARY_RED }}>
            {phanTramHoanThanh}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={phanTramHoanThanh}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: alpha(PRIMARY_RED, 0.1),
            "& .MuiLinearProgress-bar": {
              backgroundColor: PRIMARY_RED,
              borderRadius: 3,
            },
            mb: 0.75,
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "right" }}>
          {soBaiHoanThanh}/{tongBai} bài
        </Typography>
      </Box>

      <Box sx={{ overflowY: "auto", flex: 1, pb: 2 }}>
        {filteredPhanHocs.map((phan, idx) => {
          const isOpen = phanDangMo.has(phan.id!);
          const isPlaying = phan.id === idPhanPlay;
          const doneCnt =
            phan.DanhSachBaiGiang?.filter(
              (b: BaiGiangType) => progressMap.get(b.id!)?.daHoanThanh === true,
            ).length ?? 0;
          const totalMin = Math.floor(
            (phan.DanhSachBaiGiang?.reduce(
              (s: number, b: BaiGiangType) => s + (b.thoiLuong ?? 0),
              0,
            ) ?? 0) / 60,
          );
          return (
            <Box key={phan.id ?? idx}>
              <ListItemButton
                onClick={() => onTogglePhan(phan.id!, idPhanPlay)}
                sx={{
                  bgcolor: isPlaying ? alpha(PRIMARY_RED, 0.04) : "transparent",
                  borderLeft: `3px solid ${isPlaying ? PRIMARY_RED : "transparent"}`,
                  py: 1.5,
                  px: 2.5,
                  transition: "background-color 0.2s",
                  "&:hover": {
                    bgcolor: alpha(PRIMARY_RED, 0.06),
                  },
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700 }}
                    color={isPlaying ? PRIMARY_RED : "text.primary"}
                    noWrap
                  >
                    {phan.thuTuSapXep ?? idx + 1}. {phan.tenPhan}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {doneCnt}/{phan.DanhSachBaiGiang?.length ?? 0} bài ·{" "}
                    {totalMin}p
                  </Typography>
                </Box>
                {isOpen ? (
                  <ExpandLessIcon sx={{ fontSize: 20 }} />
                ) : (
                  <ExpandMoreIcon sx={{ fontSize: 20 }} />
                )}
              </ListItemButton>
              <Collapse in={isOpen}>
                <List disablePadding>
                  {phan.DanhSachBaiGiang?.map((bg: BaiGiangType, i: number) => {
                    const bgDone =
                      progressMap.get(bg.id!)?.daHoanThanh === true;
                    const isSelected = baiGiang?.id === bg.id;
                    return (
                      <Box key={bg.id ?? i}>
                        <ListItemButton
                          selected={isSelected}
                          onClick={() => onSelectBaiGiang(bg)}
                          sx={{
                            pl: 3.5,
                            pr: 2.5,
                            py: 1.25,
                            borderLeft: `3px solid ${isSelected ? PRIMARY_RED : "transparent"}`,
                            bgcolor: isSelected
                              ? alpha(PRIMARY_RED, 0.08)
                              : "transparent",
                            transition: "all 0.2s",
                            "&:hover": {
                              bgcolor: alpha(PRIMARY_RED, 0.04),
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            {bgDone ? (
                              <CheckCircleIcon
                                sx={{ color: PRIMARY_RED, fontSize: 18 }}
                              />
                            ) : (
                              <PlayArrowIcon
                                sx={{
                                  color: isSelected
                                    ? PRIMARY_RED
                                    : "text.disabled",
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
                                  fontWeight: isSelected ? 600 : 400,
                                  lineHeight: 1.4,
                                }}
                                color={
                                  isSelected ? PRIMARY_RED : "text.primary"
                                }
                              >
                                {bg.tieuDe}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                color="text.secondary"
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

                  {/* Quiz đặt ở CUỐI danh sách bài giảng của phần học */}
                  {(quizTheoPhan?.get(phan.id!) ?? []).map((quiz) => {
                    const isQuizSelected = idQuizDangChon === quiz.id;
                    return (
                      <ListItemButton
                        key={quiz.id}
                        selected={isQuizSelected}
                        onClick={() => onSelectQuiz?.(quiz)}
                        sx={{
                          pl: 3,
                          py: 1,
                          borderLeft: `3px solid ${isQuizSelected ? PRIMARY_RED : "transparent"}`,
                          bgcolor: isQuizSelected
                            ? alpha(PRIMARY_RED, 0.05)
                            : "transparent",
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <QuizIcon
                            sx={{
                              color: isQuizSelected
                                ? PRIMARY_RED
                                : "text.disabled",
                              fontSize: 18,
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: isQuizSelected ? 600 : 400,
                                lineHeight: 1.4,
                              }}
                              color={
                                isQuizSelected ? PRIMARY_RED : "text.primary"
                              }
                            >
                              {quiz.tenBaiKiemTra ?? "Bài kiểm tra"}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary"
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
