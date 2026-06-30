'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  Stack,
  Divider,
  Button,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  NotificationsActiveRounded,
  EmailRounded,
  NotificationsNoneRounded,
  SmsRounded,
  DnsRounded,
  SchoolRounded,
  WorkspacePremiumRounded,
  ReceiptLongRounded,
} from '@mui/icons-material';

const STORAGE_KEY_CHANNELS = 'eduverse_notification_channels';
const STORAGE_KEY_TOPICS = 'eduverse_notification_topics';

const defaultChannels = { email: true, push: true, sms: false };
const defaultTopics = { system: true, course: true, certificate: true, payment: true };

export default function NotificationSettings() {
  const theme = useTheme();
  const [channels, setChannels] = useState(defaultChannels);
  const [topics, setTopics] = useState(defaultTopics);
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedChannels = localStorage.getItem(STORAGE_KEY_CHANNELS);
      const savedTopics = localStorage.getItem(STORAGE_KEY_TOPICS);
      if (savedChannels) setChannels(JSON.parse(savedChannels));
      if (savedTopics) setTopics(JSON.parse(savedTopics));
    } catch {
      // Silent fail — use defaults
    }
  }, []);

  const handleChannelToggle = (channel: keyof typeof channels) => {
    setChannels((prev) => ({ ...prev, [channel]: !prev[channel] }));
  };

  const handleTopicToggle = (topic: keyof typeof topics) => {
    setTopics((prev) => ({ ...prev, [topic]: !prev[topic] }));
  };

  // Save to localStorage (TODO: replace with API call when backend supports it)
  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(channels));
      localStorage.setItem(STORAGE_KEY_TOPICS, JSON.stringify(topics));
    } catch {
      // Silent fail
    }
    setShowSnackbar(true);
  };

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
          Lưu cấu hình thông báo thành công!
        </Alert>
      </Snackbar>

      <Stack spacing={3}>
        {/* Kênh nhận thông báo */}
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
              <NotificationsActiveRounded sx={{ color: 'primary.main' }} /> Kênh nhận thông báo
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 13.5, mb: 3 }}>
              Cấu hình các phương thức Eduverse liên hệ và gửi thông báo cho bạn.
            </Typography>

            <Stack spacing={2.5} divider={<Divider sx={{ opacity: 0.6 }} />}>
              {/* Email */}
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Box sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.08), width: 40, height: 40, borderRadius: 2, display: 'grid', placeItems: 'center' }}>
                    <EmailRounded fontSize="small" />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 14.5, fontWeight: 800 }}>Thông báo qua Email</Typography>
                    <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 0.2 }}>
                      Gửi hóa đơn, kết quả học tập tuần và các cập nhật quan trọng vào hộp thư.
                    </Typography>
                  </Box>
                </Stack>
                <Switch
                  checked={channels.email}
                  onChange={() => handleChannelToggle('email')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'primary.main' },
                  }}
                />
              </Stack>

              {/* Push Notification */}
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Box sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.08), width: 40, height: 40, borderRadius: 2, display: 'grid', placeItems: 'center' }}>
                    <NotificationsNoneRounded fontSize="large" />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 14.5, fontWeight: 800 }}>Thông báo trình duyệt (Push Notification)</Typography>
                    <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 0.2 }}>
                      Nhận thông báo trực tiếp tức thời trên trình duyệt web khi đang học.
                    </Typography>
                  </Box>
                </Stack>
                <Switch
                  checked={channels.push}
                  onChange={() => handleChannelToggle('push')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'primary.main' },
                  }}
                />
              </Stack>

              {/* SMS */}
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Box sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.08), width: 40, height: 40, borderRadius: 2, display: 'grid', placeItems: 'center' }}>
                    <SmsRounded fontSize="small" />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 14.5, fontWeight: 800 }}>Tin nhắn SMS / Zalo</Typography>
                    <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 0.2 }}>
                      Nhận mã xác thực đăng nhập, nhắc nhở lịch học đặc biệt qua điện thoại.
                    </Typography>
                  </Box>
                </Stack>
                <Switch
                  checked={channels.sms}
                  onChange={() => handleChannelToggle('sms')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'primary.main' },
                  }}
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Nội dung thông báo theo chủ đề */}
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
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.3px' }}>
              Thông báo theo chủ đề
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 13.5, mb: 3 }}>
              Chọn các sự kiện hoặc chủ đề mà bạn muốn nhận thông báo.
            </Typography>

            <Stack spacing={2.5} divider={<Divider sx={{ opacity: 0.6 }} />}>
              {/* Thông báo hệ thống */}
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Box sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.08), width: 40, height: 40, borderRadius: 2, display: 'grid', placeItems: 'center' }}>
                    <DnsRounded fontSize="small" />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 14.5, fontWeight: 800 }}>Thông báo hệ thống</Typography>
                    <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 0.2 }}>
                      Báo trì định kỳ, cập nhật tính năng mới và các chính sách bảo mật tài khoản.
                    </Typography>
                  </Box>
                </Stack>
                <Switch
                  checked={topics.system}
                  onChange={() => handleTopicToggle('system')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'primary.main' },
                  }}
                />
              </Stack>

              {/* Thông báo khóa học */}
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Box sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.08), width: 40, height: 40, borderRadius: 2, display: 'grid', placeItems: 'center' }}>
                    <SchoolRounded fontSize="small" />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 14.5, fontWeight: 800 }}>Thông báo khóa học</Typography>
                    <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 0.2 }}>
                      Nhắc nhở bài tập, thông báo có bài học mới, phản hồi thảo luận từ giảng viên.
                    </Typography>
                  </Box>
                </Stack>
                <Switch
                  checked={topics.course}
                  onChange={() => handleTopicToggle('course')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'primary.main' },
                  }}
                />
              </Stack>

              {/* Thông báo chứng chỉ */}
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Box sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.08), width: 40, height: 40, borderRadius: 2, display: 'grid', placeItems: 'center' }}>
                    <WorkspacePremiumRounded fontSize="small" />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 14.5, fontWeight: 800 }}>Thông báo chứng chỉ & thành tích</Typography>
                    <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 0.2 }}>
                      Xác nhận cấp chứng chỉ, hoàn thành xuất sắc thử thách hoặc bài tập kiểm tra.
                    </Typography>
                  </Box>
                </Stack>
                <Switch
                  checked={topics.certificate}
                  onChange={() => handleTopicToggle('certificate')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'primary.main' },
                  }}
                />
              </Stack>

              {/* Thông báo thanh toán */}
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Box sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.08), width: 40, height: 40, borderRadius: 2, display: 'grid', placeItems: 'center' }}>
                    <ReceiptLongRounded fontSize="small" />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 14.5, fontWeight: 800 }}>Thông báo thanh toán & hóa đơn</Typography>
                    <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 0.2 }}>
                      Xác nhận thanh toán học phí thành công, biên lai điện tử và các ưu đãi học phí.
                    </Typography>
                  </Box>
                </Stack>
                <Switch
                  checked={topics.payment}
                  onChange={() => handleTopicToggle('payment')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'primary.main' },
                  }}
                />
              </Stack>
            </Stack>
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
