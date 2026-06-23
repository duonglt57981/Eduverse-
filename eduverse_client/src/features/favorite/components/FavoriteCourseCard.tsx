'use client';

import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Box,
  IconButton
} from '@mui/material';
import {
  CalendarMonthRounded,
  DeleteOutlineRounded,
  ArrowForwardRounded,
  PersonOutlineRounded
} from '@mui/icons-material';
import { FavoriteCourse } from '../types/favorite.type';
import { CourseVisual } from '@/src/components/landing/landing-shared';

interface FavoriteCourseCardProps {
  course: FavoriteCourse;
  onRemove: () => void;
}

export default function FavoriteCourseCard({ course, onRemove }: FavoriteCourseCardProps) {
  // Parse palette and badge details from hinhAnh string
  let palette: readonly string[] = ['#09131d', '#17445f', '#0b1018'];
  let badge = 'Khóa học';
  try {
    const parsed = JSON.parse(course.hinhAnh);
    if (parsed.palette) palette = parsed.palette;
    if (parsed.badge) badge = parsed.badge;
  } catch {
    // default/fallback
  }

  // Format price
  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return price.toLocaleString('vi-VN') + 'đ';
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <Card
      elevation={0}
      sx={{
        p: 1.75,
        borderRadius: 2.8,
        border: '1px solid rgba(17,17,17,0.08)',
        bgcolor: '#fff',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 22px 36px rgba(24,18,20,0.1)',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CourseVisual palette={palette} badge={badge} />
        <IconButton
          onClick={onRemove}
          sx={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 34,
            height: 34,
            bgcolor: 'rgba(255,255,255,0.9)',
            color: '#8d1313',
            transition: 'all 150ms ease',
            '&:hover': {
              bgcolor: '#8d1313',
              color: '#ffffff',
            },
          }}
        >
          <DeleteOutlineRounded sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <CardContent sx={{ p: 0, pt: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" sx={{ alignItems: 'center', mb: 1, color: 'rgba(24,24,27,0.54)', gap: 0.5 }}>
          <PersonOutlineRounded sx={{ fontSize: 16 }} />
          <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500 }}>
            {course.giangVien}
          </Typography>
        </Stack>

        <Typography
          variant="h3"
          sx={{
            fontSize: 20,
            fontWeight: 900,
            lineHeight: 1.3,
            color: '#19171c',
            mb: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            height: 52,
          }}
        >
          {course.tieuDe}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'rgba(24,24,27,0.54)',
            fontSize: 13,
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.5,
            height: 38,
          }}
        >
          {course.moTa}
        </Typography>

        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Stack direction="row" sx={{ alignItems: 'center', color: 'rgba(24,24,27,0.44)', gap: 0.5 }}>
            <CalendarMonthRounded sx={{ fontSize: 15 }} />
            <Typography variant="caption" sx={{ fontSize: 12, fontWeight: 600 }}>
              Thêm: {formatDate(course.createdDate)}
            </Typography>
          </Stack>

          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 950,
              color: '#8d1313',
            }}
          >
            {formatPrice(course.giaTien)}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 'auto', pt: 1 }}>
          <Button
            onClick={onRemove}
            variant="outlined"
            color="error"
            fullWidth
            sx={{
              borderRadius: 2.8,
              py: 1.1,
              fontWeight: 700,
              borderColor: 'rgba(141,19,19,0.2)',
              color: '#8d1313',
              '&:hover': {
                bgcolor: 'rgba(141,19,19,0.05)',
                borderColor: '#8d1313',
              },
            }}
          >
            Bỏ yêu thích
          </Button>

          <Button
            variant="contained"
            endIcon={<ArrowForwardRounded />}
            fullWidth
            sx={{
              borderRadius: 2.8,
              py: 1.1,
              background: 'linear-gradient(90deg, #9f1717 0%, #7f1d1d 100%)',
              fontWeight: 800,
              boxShadow: 'none',
              '&:hover': {
                background: 'linear-gradient(90deg, #8f1515 0%, #6f1919 100%)',
              },
            }}
          >
            Xem khóa học
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
