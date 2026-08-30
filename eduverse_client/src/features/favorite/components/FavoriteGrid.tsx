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
              borderRadius: "10px",
              border: "1px solid rgba(17,17,17,0.08)",
              bgcolor: "var(--dashboard-surface, #fff)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Skeleton variant="rectangular" height={140} />
            <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
              <Skeleton variant="text" height={20} width="90%" />
              <Skeleton variant="text" height={16} width="60%" />
              <Skeleton variant="text" height={16} width="40%" />
              <Skeleton variant="text" height={22} width="50%" />
              <Skeleton variant="rounded" height={22} width={80} sx={{ borderRadius: "6px", mt: 0.5 }} />
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
