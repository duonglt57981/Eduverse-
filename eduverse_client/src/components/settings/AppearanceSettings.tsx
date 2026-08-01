/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Stack,
  Button,
  Chip,
} from '@mui/material';
import {
  WbSunnyRounded,
  NightsStayRounded,
  SettingsSuggestRounded,
  CheckRounded,
  StarRounded,
  PaletteRounded,
  OndemandVideoRounded,
} from '@mui/icons-material';
import { useThemeSettings } from '@/src/contexts/ThemeSettingsContext';
import { alpha, useTheme } from '@mui/material/styles';

export default function AppearanceSettings() {
  const {
    themeMode,
    currentAccent,
    setThemeMode,
    saveSettings,
    resetSettings,
  } = useThemeSettings();

  const theme = useTheme();

  // Preview styling variables based on selected theme & accent
  const isDarkPreview = theme.palette.mode === 'dark';
  const previewBg = isDarkPreview ? '#121212' : '#F7F5F2';
  const previewPaper = isDarkPreview ? '#1e1e1e' : '#ffffff';
  const previewTextPrimary = isDarkPreview ? '#ffffff' : '#19171c';
  const previewTextSecondary = isDarkPreview ? '#a09ba5' : '#69656c';
  const previewBorder = isDarkPreview ? 'rgba(255,255,255,0.08)' : 'rgba(17,17,17,0.06)';

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Khối Cấu hình bên trái */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={3}>
            {/* Chế độ hiển thị */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 2.8,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PaletteRounded sx={{ color: 'primary.main' }} /> Chế độ hiển thị
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 13.5, mb: 3 }}>
                  Tùy chỉnh giao diện sáng hoặc tối để phù hợp với môi trường làm việc của bạn.
                </Typography>

                <Grid container spacing={2}>
                  {[
                    { id: 'light', name: 'Giao diện Sáng', desc: 'Trải nghiệm giao diện tươi sáng cổ điển.', icon: WbSunnyRounded },
                    { id: 'dark', name: 'Giao diện Tối', desc: 'Tối ưu cho mắt khi học vào ban đêm.', icon: NightsStayRounded },
                    { id: 'system', name: 'Theo hệ thống', desc: 'Tự động đồng bộ với cấu hình thiết bị.', icon: SettingsSuggestRounded },
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const isActive = themeMode === mode.id;
                    return (
                      <Grid size={{ xs: 12, sm: 4 }} key={mode.id}>
                        <Box
                          onClick={() => setThemeMode(mode.id as any)}
                          sx={{
                            p: 2.25,
                            borderRadius: 2.8,
                            border: isActive ? `2px solid ${currentAccent.value}` : '1px solid',
                            borderColor: isActive ? currentAccent.value : 'divider',
                            bgcolor: isActive ? alpha(currentAccent.value, 0.04) : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 180ms ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            height: '100%',
                            '&:hover': {
                              borderColor: isActive ? currentAccent.value : 'text.secondary',
                              bgcolor: isActive ? alpha(currentAccent.value, 0.08) : 'action.hover',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: '50%',
                              bgcolor: isActive ? currentAccent.value : 'action.hover',
                              color: isActive ? '#fff' : 'text.secondary',
                              display: 'grid',
                              placeItems: 'center',
                              mb: 1.5,
                            }}
                          >
                            <Icon fontSize="small" />
                          </Box>
                          <Typography sx={{ fontSize: 14.5, fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                            {mode.name}
                          </Typography>
                          <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.4 }}>
                            {mode.desc}
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>

            {/* Action buttons */}
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', mt: 1 }}>
              <Button
                variant="outlined"
                onClick={resetSettings}
                sx={{
                  px: 3,
                  py: 1.25,
                  borderRadius: 999,
                  borderColor: 'divider',
                  color: 'text.secondary',
                  fontWeight: 800,
                  '&:hover': {
                    borderColor: 'text.secondary',
                    bgcolor: 'action.hover',
                  },
                }}
              >
                Khôi phục mặc định
              </Button>
              <Button
                variant="contained"
                onClick={saveSettings}
                sx={{
                  px: 4,
                  py: 1.25,
                  borderRadius: 999,
                  bgcolor: 'primary.main',
                  boxShadow: 'none',
                  fontWeight: 800,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                Lưu thay đổi
              </Button>
            </Stack>
          </Stack>
        </Grid>

        {/* Khung xem trước Realtime bên phải */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2.8,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.3px' }}>
                Xem trước giao diện
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 13.5, mb: 3 }}>
                Xem giao diện mẫu thay đổi theo thời gian thực dựa trên tùy chọn của bạn.
              </Typography>

              {/* Mô phỏng UI Container */}
              <Box
                sx={{
                  flex: 1,
                  borderRadius: 2.8,
                  bgcolor: previewBg,
                  border: `1px solid ${previewBorder}`,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 240ms ease',
                  minHeight: 320,
                  boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.02)',
                }}
              >
                {/* Header giả lập */}
                <Box
                  sx={{
                    px: 2,
                    py: 1.25,
                    bgcolor: previewPaper,
                    borderBottom: `1px solid ${previewBorder}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 240ms ease',
                  }}
                >
                  <Typography sx={{ fontSize: 12, fontWeight: 900, color: previewTextPrimary }}>
                    EduVerse
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: `${currentAccent.value}18`, display: 'grid', placeItems: 'center' }}>
                      <CheckRounded sx={{ fontSize: 10, color: currentAccent.value }} />
                    </Box>
                    <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: currentAccent.value }} />
                  </Stack>
                </Box>

                {/* Body giả lập (Sidebar + Content) */}
                <Stack direction="row" sx={{ flexGrow: 1, minHeight: 0 }}>
                  {/* Sidebar giả lập */}
                  <Box
                    sx={{
                      width: 76,
                      bgcolor: previewPaper,
                      borderRight: `1px solid ${previewBorder}`,
                      p: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.75,
                      transition: 'all 240ms ease',
                    }}
                  >
                    <Box sx={{ px: 1, py: 0.5, borderRadius: 1.5, bgcolor: `${currentAccent.value}14`, color: currentAccent.value }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 800, textAlign: 'center' }}>
                        Học tập
                      </Typography>
                    </Box>
                    {['Chứng chỉ', 'Tài liệu'].map((label, idx) => (
                      <Box key={idx} sx={{ px: 1, py: 0.5, borderRadius: 1.5, color: previewTextSecondary }}>
                        <Typography sx={{ fontSize: 10, fontWeight: 700, textAlign: 'center', opacity: 0.8 }}>
                          {label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Main Content giả lập */}
                  <Box sx={{ flex: 1, p: 2, overflow: 'hidden' }}>
                    <Stack spacing={1.5}>
                      {/* Tiêu đề & Tag hệ thống */}
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 900, color: previewTextPrimary }}>
                          Bảng điều khiển
                        </Typography>
                        {themeMode === 'system' && (
                          <Chip label="Đồng bộ OS" size="small" sx={{ height: 16, fontSize: 8, fontWeight: 800, bgcolor: 'var(--ev-divider, rgba(17,17,17,0.06))', color: previewTextSecondary }} />
                        )}
                      </Stack>

                      {/* Course Card giả lập */}
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: previewPaper,
                          border: `1px solid ${previewBorder}`,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
                          transition: 'all 240ms ease',
                        }}
                      >
                        {/* Hình ảnh khóa học */}
                        <Box
                          sx={{
                            height: 64,
                            borderRadius: 1.5,
                            background: `linear-gradient(135deg, ${currentAccent.value} 0%, ${currentAccent.value}cc 100%)`,
                            position: 'relative',
                            mb: 1.25,
                            overflow: 'hidden',
                          }}
                        >
                          <Box sx={{ position: 'absolute', inset: 0, opacity: 0.15, bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <OndemandVideoRounded sx={{ color: '#fff', fontSize: 28 }} />
                          </Box>
                          <Chip label="PRO" size="small" sx={{ position: 'absolute', top: 6, left: 6, height: 14, fontSize: 8, fontWeight: 900, bgcolor: 'var(--ev-paper, #fff)', color: currentAccent.value }} />
                        </Box>

                        <Typography sx={{ fontSize: 11, fontWeight: 900, color: previewTextPrimary, lineHeight: 1.2, mb: 0.5 }}>
                          Lập trình Fullstack Web React/NodeJS thực chiến
                        </Typography>
                        <Typography sx={{ fontSize: 9, color: previewTextSecondary, mb: 1.25 }}>
                          Giảng viên: Mr. Minh Anh
                        </Typography>

                        <Stack direction="row" sx={{ spacing: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                          <Stack direction="row" spacing={0.3} sx={{ alignItems: 'center' }}>
                            <StarRounded sx={{ fontSize: 10, color: '#f57c00' }} />
                            <Typography sx={{ fontSize: 9, fontWeight: 900, color: previewTextPrimary }}>
                              4.9
                            </Typography>
                          </Stack>
                          <Button
                            size="small"
                            variant="contained"
                            sx={{
                              height: 20,
                              fontSize: 9,
                              fontWeight: 800,
                              bgcolor: currentAccent.value,
                              color: '#fff',
                              borderRadius: 999,
                              textTransform: 'none',
                              boxShadow: 'none',
                              '&:hover': {
                                bgcolor: currentAccent.hoverColor,
                              },
                            }}
                          >
                            Học tiếp
                          </Button>
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
