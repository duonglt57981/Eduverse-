'use client';

import { useState } from 'react';
import {
  Paper,
  Typography,
  Stack,
  Box,
  Slider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  EmojiEventsRounded,
  CheckCircleOutlineRounded,
  SchoolRounded,
} from '@mui/icons-material';
import { useClaimCertificate } from '@/src/services/certificate.service';
import Swal from 'sweetalert2';

export default function ClaimCertificateDemo() {
  const [progress, setProgress] = useState(85);
  const [dialogOpen, setDialogOpen] = useState(false);
  const claimMutation = useClaimCertificate();

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setProgress(newValue as number);
  };

  const handleClaimClick = () => {
    setDialogOpen(true);
  };

  const handleConfirmClaim = async () => {
    setDialogOpen(false);
    
    try {
      await claimMutation.mutateAsync({
        tenChungChi: 'Chuyên gia Khoa học Dữ liệu & Học máy',
        tenKhoaHoc: 'Khoa học Dữ liệu & AI cho Quản lý Executive',
        diemTongKet: 9.5,
        tongThoiGianHoc: 140,
        trangThai: 'Hoạt động',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      });

      Swal.fire({
        icon: 'success',
        title: 'Nhận chứng chỉ thành công!',
        text: 'Chứng chỉ "Chuyên gia Khoa học Dữ liệu & Học máy" đã được thêm vào bộ sưu tập của bạn.',
        confirmButtonText: 'Tuyệt vời',
        confirmButtonColor: '#7f1d1d',
      });
      
      // Reset progress to let them try again
      setProgress(85);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Có lỗi xảy ra khi nhận chứng chỉ. Vui lòng thử lại.',
      });
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.75,
        borderRadius: 2.8,
        border: '1px dashed #7f1d1d',
        bgcolor: 'rgba(127, 29, 29, 0.02)',
        mb: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background trophy */}
      <EmojiEventsRounded
        sx={{
          position: 'absolute',
          right: -10,
          bottom: -15,
          fontSize: 120,
          color: 'rgba(127, 29, 29, 0.03)',
          pointerEvents: 'none',
        }}
      />

      <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <SchoolRounded sx={{ color: '#7f1d1d' }} />
          <Typography sx={{ fontSize: 16, fontWeight: 900, color: '#7f1d1d', letterSpacing: '-0.2px' }}>
            DEMO: Quy trình Nhận chứng chỉ sau khóa học
          </Typography>
        </Stack>
        
        <Typography sx={{ fontSize: 13.5, color: 'text.secondary', lineHeight: 1.6 }}>
          Kéo thanh trượt tiến độ khóa học bên dưới lên <strong>100%</strong> để mở khóa và thử nghiệm tính năng nhận chứng chỉ tự động.
        </Typography>

        <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid rgba(17,17,17,0.06)' }}>
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#1a181e', mb: 0.5 }}>
            Khóa học đang học: Khoa học Dữ liệu & AI cho Quản lý Executive
          </Typography>
          
          <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontSize: 12.5, color: 'text.secondary', fontWeight: 600 }}>
              Tiến trình học tập
            </Typography>
            <Typography sx={{ fontSize: 12.5, fontWeight: 900, color: progress === 100 ? '#1f7a4d' : '#7f1d1d' }}>
              {progress}% {progress === 100 && ' (Hoàn thành)'}
            </Typography>
          </Stack>

          {/* Slider to control progress */}
          <Box sx={{ px: 1, mb: 1.5 }}>
            <Slider
              value={progress}
              onChange={handleSliderChange}
              step={5}
              min={50}
              max={100}
              valueLabelDisplay="auto"
              sx={{
                color: progress === 100 ? '#1f7a4d' : '#7f1d1d',
                height: 6,
                '& .MuiSlider-thumb': {
                  width: 16,
                  height: 16,
                  transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                  '&:before': {
                    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
                  },
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: `0px 0px 0px 8px ${
                      progress === 100 ? 'rgba(31, 122, 77, 0.16)' : 'rgba(127, 29, 29, 0.16)'
                    }`,
                  },
                },
              }}
            />
          </Box>

          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              display: 'none', // Hidden, using slider visually
            }}
          />

          {/* Conditional Claim Button */}
          {progress === 100 && (
            <Button
              fullWidth
              variant="contained"
              onClick={handleClaimClick}
              disabled={claimMutation.isPending}
              startIcon={<CheckCircleOutlineRounded />}
              sx={{
                mt: 1,
                py: 1.25,
                bgcolor: '#1f7a4d',
                color: '#fff',
                fontWeight: 900,
                fontSize: 14.5,
                borderRadius: 2,
                boxShadow: '0 10px 20px rgba(31, 122, 77, 0.15)',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 0 0 rgba(31, 122, 77, 0.4)' },
                  '70%': { boxShadow: '0 0 0 10px rgba(31, 122, 77, 0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(31, 122, 77, 0)' },
                },
                '&:hover': {
                  bgcolor: '#175e3a',
                },
              }}
            >
              {claimMutation.isPending ? 'Đang xử lý...' : 'Nhận chứng chỉ'}
            </Button>
          )}
        </Box>
      </Stack>

      {/* MUI Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-labelledby="claim-dialog-title"
        aria-describedby="claim-dialog-description"
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 2.8,
            p: 1.5,
          },
        }}
      >
        <DialogTitle id="claim-dialog-title" sx={{ fontWeight: 900, color: '#7f1d1d', pb: 1 }}>
          Xác nhận nhận chứng chỉ khóa học
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="claim-dialog-description" sx={{ color: '#4a484e', fontSize: 14.5, lineHeight: 1.6 }}>
            Chúc mừng bạn đã hoàn thành 100% bài học! Hệ thống Eduverse sẽ tiến hành số hóa và cấp mã số chứng nhận chính thức cho bạn. 
            <br />
            <br />
            Họ tên người nhận: <strong>Tạ Minh Anh</strong>.
            <br />
            Tên chứng chỉ: <strong>Chuyên gia Khoa học Dữ liệu & Học máy</strong>.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{ color: 'rgba(24,24,27,0.54)', fontWeight: 800 }}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleConfirmClaim}
            variant="contained"
            autoFocus
            sx={{
              bgcolor: '#7f1d1d',
              color: '#fff',
              fontWeight: 800,
              px: 2.5,
              borderRadius: 2,
              '&:hover': {
                bgcolor: '#5f1616',
              },
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
