'use client';

import { Box, Typography, Stack, Chip } from '@mui/material';

interface FavoriteHeaderProps {
  count: number;
}

export default function FavoriteHeader({ count }: FavoriteHeaderProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <Box>
          <Chip
            label="Danh sách mong muốn"
            sx={{
              bgcolor: 'rgba(159,23,23,0.08)',
              color: '#9f1717',
              fontWeight: 900,
              mb: 1.5,
            }}
          />
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: 32, sm: 40, md: 48 },
              fontWeight: 900,
              letterSpacing: '-1px',
              lineHeight: 1.1,
              color: 'text.primary',
            }}
          >
            Khóa Học Yêu Thích
          </Typography>
          <Typography
            sx={{
              mt: 1,
              fontSize: 15,
              color: 'rgba(24,24,27,0.6)',
              fontWeight: 500,
            }}
          >
            Bạn đang lưu trữ {count} khóa học trong danh sách của mình
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
