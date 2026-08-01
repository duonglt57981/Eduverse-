'use client';

import { useState } from 'react';
import {
  Paper,
  Typography,
  Stack,
  Box,
  LinearProgress,
  Chip,
  Avatar,
  Divider,
  ButtonBase,
} from '@mui/material';
import {
  EmojiEventsRounded,
  MenuBookRounded,
  TimelineRounded,
  WorkspacePremiumRounded,
  ArrowForwardIosRounded,
} from '@mui/icons-material';
import { CertificateStats as StatsType, Certificate } from '@/src/types/certificate';
import CertificateViewerModal from './CertificateViewerModal';

interface CertificateStatsProps {
  stats: StatsType;
  loading?: boolean;
}

export default function CertificateStats({ stats, loading = false }: CertificateStatsProps) {
  const [viewerOpen, setViewerOpen] = useState(false);

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2.8,
          border: '1px solid rgba(17,17,17,0.08)',
          bgcolor: 'var(--ev-paper, #fff)',
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.secondary' }}>
          Đang tải dữ liệu thống kê...
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2.5}>
      {/* Overview Card */}
      <Paper
        elevation={0}
        sx={{
          p: 2.75,
          borderRadius: 2.8,
          border: '1px solid rgba(17,17,17,0.08)',
          bgcolor: 'var(--ev-paper, #fff)',
        }}
      >
        <Typography sx={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.3px', mb: 2, color: 'var(--ev-text-primary, #19171c)' }}>
          Thống kê học tập
        </Typography>

        <Stack spacing={2}>
          {/* Total Certificates */}
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.2,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'rgba(212,175,55,0.12)',
                color: '#b59325',
              }}
            >
              <EmojiEventsRounded fontSize="medium" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--ev-text-muted, rgba(24,24,27,0.54))' }}>
                TỔNG SỐ CHỨNG CHỈ
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.25 }}>
                <Typography sx={{ fontSize: 24, fontWeight: 900, color: 'var(--ev-text-primary, #19171c)', lineHeight: 1 }}>
                  {stats.tongSoChungChi.toString().padStart(2, '0')}
                </Typography>
                <Chip
                  label="Đã hoàn thành"
                  size="small"
                  color="success"
                  sx={{
                    height: 20,
                    fontSize: '10.5px',
                    fontWeight: 800,
                  }}
                />
              </Stack>
            </Box>
          </Stack>

          {/* Completed Courses */}
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
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
              <MenuBookRounded fontSize="medium" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--ev-text-muted, rgba(24,24,27,0.54))' }}>
                KHÓA HỌC ĐÃ HOÀN THÀNH
              </Typography>
              <Typography sx={{ mt: 0.25, fontSize: 20, fontWeight: 900, color: 'var(--ev-text-primary, #19171c)' }}>
                {stats.khoaHocDaHoanThanh} <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ev-text-muted, rgba(24,24,27,0.54))' }}>khóa học</span>
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 1, opacity: 0.6 }} />

          {/* Completion Progress */}
          <Box>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <TimelineRounded sx={{ color: 'var(--ev-text-muted, rgba(24,24,27,0.54))', fontSize: 18 }} />
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: 'var(--ev-text-muted, rgba(24,24,27,0.72))' }}>
                  Tỷ lệ hoàn thành học tập
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: 13, fontWeight: 900, color: '#7f1d1d' }}>
                {stats.tyLeHoanThanh}%
              </Typography>
            </Stack>
            
            <LinearProgress
              variant="determinate"
              value={stats.tyLeHoanThanh}
              sx={{
                height: 8,
                borderRadius: 2.8,
                bgcolor: 'rgba(127,29,29,0.08)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2.8,
                  background: 'linear-gradient(90deg, #aa1c1c 0%, #7f1d1d 100%)',
                },
              }}
            />
            <Typography sx={{ mt: 0.75, fontSize: 11.5, color: 'rgba(24,24,27,0.48)' }}>
              Được tính toán dựa trên số giờ học và kết quả kiểm tra.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Newest Certificate Card */}
      {stats.chungChiMoiNhat && (
        <Paper
          elevation={0}
          sx={{
            p: 2.75,
            borderRadius: 2.8,
            border: '1px solid rgba(17,17,17,0.08)',
            bgcolor: 'var(--ev-paper, #fff)',
            overflow: 'hidden',
          }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: 900, letterSpacing: '-0.2px', mb: 2, color: 'var(--ev-text-primary, #19171c)' }}>
            Chứng chỉ mới nhất
          </Typography>

          <ButtonBase
            onClick={() => setViewerOpen(true)}
            sx={{
              display: 'block',
              textAlign: 'left',
              width: '100%',
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'rgba(17,17,17,0.02)',
              border: '1px solid rgba(17,17,17,0.05)',
              transition: 'all 180ms ease',
              '&:hover': {
                bgcolor: 'rgba(127,29,29,0.035)',
                borderColor: 'rgba(127,29,29,0.12)',
              },
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Avatar
                src={stats.chungChiMoiNhat.thumbnail}
                alt={stats.chungChiMoiNhat.tenChungChi}
                variant="rounded"
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: '#7f1d1d',
                  borderRadius: 1.5,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <WorkspacePremiumRounded />
              </Avatar>
              
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: '#1a181e',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {stats.chungChiMoiNhat.tenChungChi}
                </Typography>
                
                <Typography
                  sx={{
                    mt: 0.25,
                    fontSize: 12,
                    color: 'var(--ev-text-muted, rgba(24,24,27,0.54))',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Cấp ngày {stats.chungChiMoiNhat.ngayCap.split('-').reverse().join('/')}
                </Typography>
              </Box>
              
              <ArrowForwardIosRounded sx={{ fontSize: 12, color: 'rgba(24,24,27,0.36)' }} />
            </Stack>
          </ButtonBase>

          <CertificateViewerModal
            open={viewerOpen}
            onClose={() => setViewerOpen(false)}
            certificate={stats.chungChiMoiNhat}
          />
        </Paper>
      )}
    </Stack>
  );
}
