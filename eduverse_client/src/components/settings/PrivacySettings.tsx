'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  Stack,
  Button,
  Grid,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ShieldRounded,
  VisibilityRounded,
  WorkspacePremiumRounded,
  EmojiEventsRounded,
  SearchRounded,
  ForumRounded,
} from '@mui/icons-material';

const STORAGE_KEY = 'eduverse_privacy_settings';

const defaultPrivacy = {
  publicProfile: true,
  showCertificates: true,
  showLeaderboard: false,
  searchable: true,
  allowMessages: true,
};

export default function PrivacySettings() {
  const theme = useTheme();
  const [privacy, setPrivacy] = useState(defaultPrivacy);
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setPrivacy(JSON.parse(saved));
    } catch {
      // Silent fail — use defaults
    }
  }, []);

  const handleToggle = (setting: keyof typeof privacy) => {
    setPrivacy((prev) => ({ ...prev, [setting]: !prev[setting] }));
  };

  // Save to localStorage (TODO: replace with API call when backend supports it)
  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(privacy));
    } catch {
      // Silent fail
    }
    setShowSnackbar(true);
  };

  const privacyOptions = [
    {
      id: 'publicProfile' as const,
      title: 'Hiển thị hồ sơ công khai',
      desc: 'Cho phép các học viên khác xem thông tin giới thiệu, các khóa học bạn đang tham gia và các bài viết thảo luận của bạn.',
      icon: VisibilityRounded,
    },
    {
      id: 'showCertificates' as const,
      title: 'Hiển thị chứng chỉ đã đạt',
      desc: 'Cho phép nhà tuyển dụng và các thành viên khác tra cứu, xác minh các chứng chỉ bạn đã hoàn thành trên hệ thống Eduverse.',
      icon: WorkspacePremiumRounded,
    },
    {
      id: 'showLeaderboard' as const,
      title: 'Hiển thị thành tích học tập',
      desc: 'Hiển thị điểm số học tập, thứ hạng của bạn trên bảng xếp hạng (Leaderboard) tuần/tháng của lớp học.',
      icon: EmojiEventsRounded,
    },
    {
      id: 'searchable' as const,
      title: 'Cho phép tìm kiếm tài khoản',
      desc: 'Cho phép người khác tìm ra tài khoản của bạn thông qua số điện thoại hoặc email liên kết khi họ tìm kiếm bạn bè.',
      icon: SearchRounded,
    },
    {
      id: 'allowMessages' as const,
      title: 'Cho phép nhận tin nhắn trực tiếp',
      desc: 'Cho phép giảng viên, trợ giảng hoặc các học viên khác gửi tin nhắn trực tiếp cho bạn để trao đổi bài tập hoặc thảo luận dự án.',
      icon: ForumRounded,
    },
  ];

  return (
    <Box>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity="success"
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          Cập nhật quyền riêng tư thành công!
        </Alert>
      </Snackbar>

      <Stack spacing={3}>
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
              <ShieldRounded sx={{ color: 'primary.main' }} /> Cài đặt quyền riêng tư
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 13.5, mb: 3 }}>
              Kiểm soát dữ liệu cá nhân nào bạn muốn chia sẻ với cộng đồng học viên Eduverse và nhà tuyển dụng bên ngoài.
            </Typography>

            <Grid container spacing={2.5}>
              {privacyOptions.map((opt) => {
                const Icon = opt.icon;
                const isChecked = privacy[opt.id];
                return (
                  <Grid size={{ xs: 12 }} key={opt.id}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 2.8,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'action.hover',
                        transition: 'all 160ms ease',
                        '&:hover': {
                          borderColor: alpha(theme.palette.primary.main, 0.15),
                          bgcolor: alpha(theme.palette.primary.main, 0.01),
                        },
                      }}
                    >
                      <Stack direction="row" spacing={2.5} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                          <Box
                            sx={{
                              color: isChecked ? 'primary.main' : 'text.secondary',
                              bgcolor: isChecked ? alpha(theme.palette.primary.main, 0.08) : 'action.selected',
                              width: 44,
                              height: 44,
                              borderRadius: 2,
                              display: 'grid',
                              placeItems: 'center',
                              flexShrink: 0,
                              mt: 0.25,
                              transition: 'all 240ms ease',
                            }}
                          >
                            <Icon fontSize="medium" />
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: 15, fontWeight: 800, color: 'text.primary' }}>
                              {opt.title}
                            </Typography>
                            <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5, lineHeight: 1.6 }}>
                              {opt.desc}
                            </Typography>
                          </Box>
                        </Stack>
                        <Switch
                          checked={isChecked}
                          onChange={() => handleToggle(opt.id)}
                          sx={{
                            mt: 0.5,
                            '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'primary.main' },
                          }}
                        />
                      </Stack>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>

        {/* Nút lưu cấu hình */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleSave}
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
        </Box>
      </Stack>
    </Box>
  );
}
