'use client';

import { useEffect } from 'react';
import AuthGuard from '@/src/components/AuthGuard';
import StudentDashboardShell from "@/src/components/dashboard/StudentDashboardShell";
import { Box } from '@mui/material';
import { useFavorite } from '@/src/features/favorite/hooks/useFavorite';
import FavoriteHeader from '@/src/features/favorite/components/FavoriteHeader';
import FavoriteGrid from '@/src/features/favorite/components/FavoriteGrid';

export default function StudentFavoritesPage() {
  const { favorites, loading, fetchFavorites, removeFavorite } = useFavorite();

  useEffect(() => {
    void fetchFavorites();
  }, [fetchFavorites]);

  return (
    <AuthGuard allowedRoles={['HocVien', 'GiaoVien']}>
      <StudentDashboardShell>
        <Box sx={{ py: 2 }}>
          <FavoriteHeader count={favorites.length} />
          <FavoriteGrid
            favorites={favorites}
            loading={loading}
            onRemove={removeFavorite}
          />
        </Box>
      </StudentDashboardShell>
    </AuthGuard>
  );
}
