'use client';

import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Box,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import {
  AccessTimeRounded,
  DeleteOutlineRounded,
  ArrowForwardRounded,
  PersonOutlineRounded,
  StarRounded,
  MenuBookRounded,
} from '@mui/icons-material';
import { FavoriteCourse } from '../types/favorite.type';
import { CourseVisual } from '@/src/components/landing/landing-shared';
import { courseCatalog } from '@/src/components/landing/landing-data';

interface FavoriteCourseCardProps {
  course: FavoriteCourse;
  onRemove: () => void;
}

export default function FavoriteCourseCard({ course, onRemove }: FavoriteCourseCardProps) {
  // Look up additional data from courseCatalog
  const catalogItem = courseCatalog.find((c) => c.id === course.khoaHocId);

  // Parse palette and badge details from hinhAnh string
  let palette: readonly string[] = ['#09131d', '#17445f', '#0b1018'];
  let badge = 'Khóa học';
  let imageUrl = '';

  try {
    const parsed = JSON.parse(course.hinhAnh);
    if (parsed.palette) palette = parsed.palette;
    if (parsed.badge) badge = parsed.badge;
    if (parsed.imageUrl) imageUrl = parsed.imageUrl;
  } catch {
    if (
      course.hinhAnh &&
      (course.hinhAnh.startsWith('http') ||
        course.hinhAnh.startsWith('/') ||
        course.hinhAnh.startsWith('.'))
    ) {
      imageUrl = course.hinhAnh;
    }
  }

  const level = catalogItem?.level || badge;
  const rating = catalogItem?.rating || 4.8;
  const students = catalogItem?.students || '0';
  const duration = catalogItem?.duration || '30 giờ';

  // Format price
  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return price.toLocaleString('vi-VN') + 'đ';
  };

  // Level gradient map consistent with dashboard
  const LEVEL_GRADIENT: Record<string, string> = {
    'Cơ bản': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    'Trung cấp': 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    'Nâng cao': 'linear-gradient(135deg, #8D1313 0%, #7C3AED 100%)',
    'Người mới bắt đầu': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  };

  const gradient = LEVEL_GRADIENT[level] || 'linear-gradient(90deg, #9f1717 0%, #7f1d1d 100%)';

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '18px',
        border: '1px solid rgba(0,0,0,0.07)',
        bgcolor: '#fff',
        transition: 'transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 32px rgba(141,19,19,0.08)',
          borderColor: 'rgba(141,19,19,0.15)',
        },
      }}
    >
      {/* Thumbnail / Visual Area */}
      <Box sx={{ position: 'relative', height: 140, overflow: 'hidden' }}>
        {imageUrl ? (
          <Box
            sx={{
              height: '100%',
              background: `url(${imageUrl}) center/cover no-repeat`,
            }}
          />
        ) : (
          <Box sx={{ mt: -30 }}>
            <CourseVisual palette={palette} badge={badge} />
          </Box>
        )}

        {/* Level Tag Overlay */}
        <Chip
          label={level}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            bgcolor: 'rgba(255,255,255,0.92)',
            color: '#8d1313',
            fontWeight: 800,
            fontSize: 10,
            height: 20,
            zIndex: 5,
          }}
        />

        {/* Delete button nicely aligned */}
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 30,
            height: 30,
            bgcolor: 'rgba(255,255,255,0.95)',
            color: '#8d1313',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            zIndex: 5,
            transition: 'all 150ms ease',
            p: 0,
            '&:hover': {
              bgcolor: '#8d1313',
              color: '#ffffff',
              transform: 'scale(1.08)',
            },
          }}
        >
          <DeleteOutlineRounded sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Course Details Content */}
      <CardContent
        sx={{
          p: 2.25,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Instructor */}
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            mb: 1,
            color: 'rgba(31,41,55,0.45)',
            gap: 0.5,
          }}
        >
          <PersonOutlineRounded sx={{ fontSize: 14 }} />
          <Typography
            variant="body2"
            sx={{ fontSize: 12, fontWeight: 700 }}
          >
            {course.giangVien || 'Giảng viên EduVerse'}
          </Typography>
        </Stack>

        {/* Title */}
        <Typography
          variant="h3"
          sx={{
            fontSize: 14.5,
            fontWeight: 800,
            lineHeight: 1.4,
            color: '#1F2937',
            mb: 1,
            height: 40,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {course.tieuDe}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(31,41,55,0.6)',
            fontSize: 12.5,
            lineHeight: 1.5,
            mb: 2,
            height: 38,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {course.moTa}
        </Typography>

        {/* Metadata Details */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}
        >
          <Typography
            sx={{
              fontSize: 11,
              color: 'rgba(31,41,55,0.45)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <AccessTimeRounded sx={{ fontSize: 12 }} /> {duration}
          </Typography>

          <Typography
            sx={{
              fontSize: 11,
              color: 'rgba(31,41,55,0.45)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <StarRounded sx={{ fontSize: 13, color: '#efb21a' }} /> {rating}
          </Typography>

          <Typography
            sx={{
              fontSize: 11,
              color: 'rgba(31,41,55,0.45)',
              fontWeight: 600,
            }}
          >
            👥 {students} học viên
          </Typography>
        </Stack>

        <Divider sx={{ mb: 2, opacity: 0.5 }} />

        {/* Bottom Actions Area */}
        <Stack
          direction="row"
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2.25,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 900,
                color: '#8d1313',
              }}
            >
              {formatPrice(course.giaTien)}
            </Typography>
            {catalogItem?.originalPrice && (
              <Typography
                sx={{
                  fontSize: 11,
                  color: 'rgba(31,41,55,0.35)',
                  textDecoration: 'line-through',
                  fontWeight: 600,
                }}
              >
                {catalogItem.originalPrice}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Actions Button Bar */}
        <Stack
          direction="row"
          spacing={1.2}
          sx={{ mt: 'auto' }}
        >
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            variant="outlined"
            color="error"
            fullWidth
            sx={{
              borderRadius: '12px',
              py: 1,
              fontWeight: 700,
              fontSize: 13,
              borderColor: 'rgba(141,19,19,0.2)',
              color: '#8d1313',
              textTransform: 'none',
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
              borderRadius: '12px',
              py: 1,
              fontWeight: 800,
              fontSize: 13,
              background: 'linear-gradient(90deg, #9f1717 0%, #7f1d1d 100%)',
              boxShadow: 'none',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(90deg, #8f1515 0%, #6f1919 100%)',
                boxShadow: 'none',
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
