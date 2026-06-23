'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Stack,
  Skeleton,
  Paper,
} from '@mui/material';
import { EmojiEventsRounded, HelpOutlineRounded } from '@mui/icons-material';
import StudentDashboardShell from '@/src/components/dashboard/StudentDashboardShell';
import CertificateCard from '@/src/components/certificate/CertificateCard';
import CertificateFilter from '@/src/components/certificate/CertificateFilter';
import CertificateStats from '@/src/components/certificate/CertificateStats';
import ClaimCertificateDemo from '@/src/components/certificate/ClaimCertificateDemo';
import { CertificateFilters } from '@/src/types/certificate';
import { useGetCertificates, useGetCertificateStats } from '@/src/services/certificate.service';

export default function StudentCertificatesPage() {
  const [filters, setFilters] = useState<CertificateFilters>({
    keyword: '',
    trangThai: 'Tất cả',
    sortBy: 'newest',
  });

  const { data: certsResponse, isLoading: listLoading } = useGetCertificates(filters);
  const { data: statsResponse, isLoading: statsLoading } = useGetCertificateStats();

  const certificates = certsResponse?.data || [];
  const stats = statsResponse?.data || {
    tongSoChungChi: 0,
    tyLeHoanThanh: 0,
    khoaHocDaHoanThanh: 0,
    chungChiMoiNhat: null,
  };

  return (
    <StudentDashboardShell>
      <Box sx={{ px: { xs: 2, md: 3.5 }, py: { xs: 2.5, md: 4 } }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.2,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'rgba(127,29,29,0.08)',
                color: '#7f1d1d',
              }}
            >
              <EmojiEventsRounded fontSize="medium" />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: 24, md: 32 },
                  fontWeight: 900,
                  color: '#19171c',
                  letterSpacing: '-0.6px',
                }}
              >
                Hồ sơ Chứng chỉ của tôi
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 14.5, color: 'text.secondary' }}>
                Xem, tải xuống PDF hoặc chia sẻ các văn bằng chứng chỉ học thuật bạn đã tích lũy tại Eduverse.
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Layout Grid */}
        <Grid container spacing={3} sx={{ alignItems: 'start' }}>
          {/* Main Content Area */}
          <Grid size={{ xs: 12, xl: 8.5 }}>
            {/* Demo Claim Widget at the top of main content */}
            <ClaimCertificateDemo />

            {/* Filter Control Section */}
            <CertificateFilter filters={filters} onChange={setFilters} />

            {/* List Header */}
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}
            >
              <Typography sx={{ fontSize: 18, fontWeight: 900, color: '#19171c', letterSpacing: '-0.3px' }}>
                Danh sách chứng chỉ ({certificates.length})
              </Typography>
            </Stack>

            {/* Certificates Grid */}
            {listLoading ? (
              <Grid container spacing={2.5}>
                {[1, 2, 4].map((i) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={i}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 2.8,
                        border: '1px solid rgba(17,17,17,0.08)',
                        bgcolor: '#fff',
                      }}
                    >
                      <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2, mb: 2 }} />
                      <Skeleton variant="text" height={28} width="80%" sx={{ mb: 1 }} />
                      <Skeleton variant="text" height={20} width="60%" sx={{ mb: 2 }} />
                      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                        <Skeleton variant="rectangular" height={36} width="45%" sx={{ borderRadius: 1.5 }} />
                        <Skeleton variant="rectangular" height={36} width="45%" sx={{ borderRadius: 1.5 }} />
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : certificates.length > 0 ? (
              <Grid container spacing={2.5}>
                {certificates.map((cert) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={cert.id}>
                    <CertificateCard certificate={cert} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 8,
                  borderRadius: 2.8,
                  border: '1px dashed rgba(17,17,17,0.15)',
                  bgcolor: '#fff',
                  textAlign: 'center',
                }}
              >
                <HelpOutlineRounded sx={{ fontSize: 56, color: 'rgba(24,24,27,0.25)', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#19171c', mb: 1 }}>
                  Không tìm thấy chứng chỉ phù hợp
                </Typography>
                <Typography sx={{ fontSize: 14, color: 'text.secondary', maxWidth: 420, mx: 'auto' }}>
                  Thử thay đổi từ khóa tìm kiếm hoặc lọc theo trạng thái khác để hiển thị các kết quả tương ứng.
                </Typography>
              </Paper>
            )}
          </Grid>

          {/* Right Sidebar Statistics */}
          <Grid size={{ xs: 12, xl: 3.5 }}>
            <CertificateStats stats={stats} loading={statsLoading} />
          </Grid>
        </Grid>
      </Box>
    </StudentDashboardShell>
  );
}
