'use client';

import { useEffect } from 'react';
import { Container } from '@mui/material';
import { useFavorite } from '@/src/features/favorite/hooks/useFavorite';
import FavoriteHeader from '@/src/features/favorite/components/FavoriteHeader';
import FavoriteGrid from '@/src/features/favorite/components/FavoriteGrid';
import AuthGuard from '@/src/components/AuthGuard';

export default function FavoritePage() {
  const { favorites, loading, favoriteCount, fetchFavorites, removeFavorite } = useFavorite();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return (
    <AuthGuard allowedRoles={['HocVien', 'GiaoVien']}>
      <Container maxWidth="xl" sx={{ pt: { xs: 4, md: 6 }, pb: { xs: 6, md: 8 } }}>
        <FavoriteHeader count={favoriteCount} />
        <FavoriteGrid
          favorites={favorites}
          loading={loading}
          onRemove={(courseId, courseTitle) => removeFavorite(courseId, courseTitle, true)}
        />
      </Container>
    </AuthGuard>
  );
}
