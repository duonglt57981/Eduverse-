'use client';

import { useEffect } from 'react';
import { Box, Container } from '@mui/material';
import {
  LandingNavbar,
  LandingFooter,
  LandingThemeProvider,
} from '@/src/components/landing/landing-shared';
import { useFavorite } from '@/src/features/favorite/hooks/useFavorite';
import FavoriteHeader from '@/src/features/favorite/components/FavoriteHeader';
import FavoriteGrid from '@/src/features/favorite/components/FavoriteGrid';

export default function FavoritePage() {
  const { favorites, loading, favoriteCount, fetchFavorites, removeFavorite } = useFavorite();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return (
    <LandingThemeProvider>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, md: 3 }, flexGrow: 1 }}>
          <LandingNavbar activePath="/favorite" />

          <Container maxWidth="xl" sx={{ pt: { xs: 4, md: 6 }, pb: { xs: 6, md: 8 } }}>
            <FavoriteHeader count={favoriteCount} />
            <FavoriteGrid
              favorites={favorites}
              loading={loading}
              onRemove={(courseId, courseTitle) => removeFavorite(courseId, courseTitle, true)}
            />
          </Container>

          <LandingFooter />
        </Box>
      </Box>
    </LandingThemeProvider>
  );
}
