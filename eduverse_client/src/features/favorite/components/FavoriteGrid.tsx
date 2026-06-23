'use client';

import { Box, Skeleton, Paper } from '@mui/material';
import { FavoriteCourse } from '../types/favorite.type';
import FavoriteCourseCard from './FavoriteCourseCard';
import FavoriteEmpty from './FavoriteEmpty';

interface FavoriteGridProps {
  favorites: FavoriteCourse[];
  loading: boolean;
  onRemove: (courseId: string, courseTitle: string) => void;
}

export default function FavoriteGrid({ favorites, loading, onRemove }: FavoriteGridProps) {
  if (loading) {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
          gap: 3,
        }}
      >
        {Array.from({ length: 4 }).map((_, idx) => (
          <Paper
            key={idx}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2.8,
              border: '1px solid rgba(17,17,17,0.08)',
              bgcolor: '#fff',
              height: 440,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2.8 }} />
            <Skeleton variant="text" height={24} width="40%" />
            <Skeleton variant="text" height={32} width="80%" />
            <Skeleton variant="text" height={40} width="100%" />
            <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
              <Skeleton variant="rectangular" height={36} width="50%" sx={{ borderRadius: 2.8 }} />
              <Skeleton variant="rectangular" height={36} width="50%" sx={{ borderRadius: 2.8 }} />
            </Box>
          </Paper>
        ))}
      </Box>
    );
  }

  if (favorites.length === 0) {
    return <FavoriteEmpty />;
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
        gap: 3,
      }}
    >
      {favorites.map((course) => (
        <FavoriteCourseCard
          key={course.id}
          course={course}
          onRemove={() => onRemove(course.khoaHocId, course.tieuDe)}
        />
      ))}
    </Box>
  );
}
