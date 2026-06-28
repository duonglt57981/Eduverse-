'use client';

import Link from 'next/link';
import { Box, Button, Typography, Paper } from '@mui/material';
import { FavoriteRounded } from '@mui/icons-material';

export default function FavoriteEmpty() {
  return (
    <Paper
      elevation={0}
      sx={{
        py: 8,
        px: 4,
        borderRadius: 2.8,
        border: '1px dashed rgba(17,17,17,0.14)',
        textAlign: 'center',
        bgcolor: 'rgba(255,255,255,0.7)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 600,
        mx: 'auto',
        my: 4,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: 'rgba(141,19,19,0.06)',
          display: 'grid',
          placeItems: 'center',
          mb: 3,
          color: '#8d1313',
          animation: 'pulse 2s infinite ease-in-out',
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.1)' },
            '100%': { transform: 'scale(1)' },
          },
        }}
      >
        <FavoriteRounded sx={{ fontSize: 40 }} />
      </Box>

      <Typography
        variant="h4"
        sx={{
          fontSize: 24,
          fontWeight: 900,
          mb: 1.5,
          color: '#19171c',
        }}
      >
        Bạn chưa có khóa học yêu thích nào
      </Typography>

      <Typography
        sx={{
          color: 'rgba(24,24,27,0.58)',
          fontSize: 15,
          mb: 4,
          maxWidth: 400,
          lineHeight: 1.6,
        }}
      >
        Khám phá hàng trăm khóa học lập trình, thiết kế, marketing chất lượng cao và thêm chúng vào danh sách yêu thích của bạn ngay hôm nay!
      </Typography>

      <Button
        component={Link}
        href="/courses"
        variant="contained"
        sx={{
          px: 4,
          py: 1.5,
          borderRadius: 2.8,
          background: 'linear-gradient(90deg, #9f1717 0%, #7f1d1d 100%)',
          boxShadow: '0 8px 20px rgba(159,23,23,0.2)',
          fontSize: 15,
          fontWeight: 800,
          '&:hover': {
            background: 'linear-gradient(90deg, #8f1515 0%, #6f1919 100%)',
            boxShadow: '0 10px 24px rgba(159,23,23,0.3)',
          },
        }}
      >
        Khám phá khóa học ngay
      </Button>
    </Paper>
  );
}
