'use client';

import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Slide,
  Box,
  Button,
  Stack,
  Container,
} from '@mui/material';
import { CloseRounded, PrintRounded, WorkspacePremiumRounded } from '@mui/icons-material';
import React, { useRef } from 'react';
import { Certificate } from '@/src/types/certificate';

const Transition = React.forwardRef(function Transition(
  props: any,
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface CertificateViewerModalProps {
  open: boolean;
  onClose: () => void;
  certificate: Certificate;
  studentName?: string;
}

export default function CertificateViewerModal({
  open,
  onClose,
  certificate,
  studentName = 'Tạ Minh Anh', // Default student name from dashboard shell
}: CertificateViewerModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      slots={{ transition: Transition }}
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: '#f5f3f0',
        },
        // CSS for print media
        '@media print': {
          'body *': {
            visibility: 'hidden',
          },
          '#certificate-print-area, #certificate-print-area *': {
            visibility: 'visible',
          },
          '#certificate-print-area': {
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            margin: 0,
            padding: 0,
            bgcolor: '#fff',
          },
        },
      }}
    >
      <AppBar
        elevation={0}
        sx={{
          position: 'relative',
          bgcolor: '#7f1d1d',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
            <CloseRounded />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1, fontWeight: 800, fontSize: 16 }} component="div">
            Bản xem trước chứng chỉ: {certificate.maSoChungChi}
          </Typography>
          <Button
            color="inherit"
            startIcon={<PrintRounded />}
            onClick={handlePrint}
            sx={{ fontWeight: 800 }}
          >
            In / Xuất PDF
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          display: 'grid',
          placeItems: 'center',
          py: 6,
          px: 2,
          overflowY: 'auto',
        }}
      >
        <Container maxWidth="md">
          {/* Certificate Board */}
          <Box
            id="certificate-print-area"
            ref={printRef}
            sx={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1.414/1', // A4 Landscape ratio
              bgcolor: '#fff',
              boxShadow: '0 25px 60px rgba(0,0,0,0.08)',
              borderRadius: '2px',
              border: '24px solid #fff', // Thick white margin
              outline: '1px solid rgba(0,0,0,0.08)',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            {/* Inner Gold Border */}
            <Box
              sx={{
                position: 'absolute',
                inset: 8,
                border: '3px double #d4af37', // Double gold border
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: { xs: 4, sm: 6 },
                boxSizing: 'border-box',
              }}
            >
              {/* Corner Ornaments */}
              {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => {
                const isTop = corner.startsWith('top');
                const isLeft = corner.endsWith('left');
                return (
                  <Box
                    key={corner}
                    sx={{
                      position: 'absolute',
                      top: isTop ? 12 : 'auto',
                      bottom: isTop ? 'auto' : 12,
                      left: isLeft ? 12 : 'auto',
                      right: isLeft ? 'auto' : 12,
                      width: 24,
                      height: 24,
                      borderTop: isTop ? '3px solid #d4af37' : 'none',
                      borderBottom: isTop ? 'none' : '3px solid #d4af37',
                      borderLeft: isLeft ? '3px solid #d4af37' : 'none',
                      borderRight: isLeft ? 'none' : '3px solid #d4af37',
                    }}
                  />
                );
              })}

              {/* Top Section: Logo & Brand */}
              <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: '#7f1d1d',
                  }}
                >
                  <WorkspacePremiumRounded sx={{ fontSize: 44, color: '#d4af37' }} />
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: '"Cinzel", "Playfair Display", serif, "Roboto"',
                      fontWeight: 900,
                      letterSpacing: '2px',
                      fontSize: { xs: 20, sm: 28 },
                    }}
                  >
                    EDUVERSE
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: '"Great Vibes", cursive, "Playfair Display", serif',
                    color: '#d4af37',
                    fontSize: { xs: 18, sm: 26 },
                    fontWeight: 500,
                    lineHeight: 1,
                  }}
                >
                  Academy of Advanced Executive Education
                </Typography>
              </Stack>

              {/* Middle Section: Certification statement */}
              <Stack spacing={2} sx={{ alignItems: 'center', width: '100%', my: { xs: 1, sm: 2 } }}>
                <Typography
                  sx={{
                    fontSize: { xs: 12, sm: 14 },
                    fontWeight: 700,
                    color: 'rgba(24,24,27,0.54)',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                  }}
                >
                  Chứng nhận hoàn thành khóa học
                </Typography>
                
                <Typography
                  sx={{
                    fontFamily: '"Alex Brush", "Playfair Display", serif',
                    fontSize: { xs: 28, sm: 46 },
                    color: '#1a181e',
                    fontWeight: 600,
                    lineHeight: 1.1,
                  }}
                >
                  {studentName}
                </Typography>

                <Box sx={{ width: '60px', height: '1px', bgcolor: 'rgba(212,175,55,0.6)', my: 0.5 }} />

                <Typography
                  align="center"
                  sx={{
                    fontSize: { xs: 12, sm: 14.5 },
                    color: 'rgba(24,24,27,0.72)',
                    maxWidth: 580,
                    lineHeight: 1.6,
                    px: 2,
                  }}
                >
                  Đã hoàn thành xuất sắc chương trình đào tạo chuyên sâu và đạt đầy đủ các tiêu chí học thuật của khóa học:
                  <br />
                  <Typography
                    component="span"
                    sx={{
                      display: 'inline-block',
                      mt: 1.25,
                      fontSize: { xs: 14, sm: 20 },
                      fontWeight: 900,
                      color: '#7f1d1d',
                      letterSpacing: '-0.2px',
                    }}
                  >
                    {certificate.tenKhoaHoc}
                  </Typography>
                </Typography>
              </Stack>

              {/* Bottom Section: Details & Signatures */}
              <Stack
                direction="row"
                sx={{
                  width: '100%',
                  px: { xs: 1, sm: 4 },
                  pb: { xs: 1, sm: 2 },
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                }}
              >
                {/* Left: Certificate ID & Issue Date */}
                <Stack spacing={1.5} sx={{ minWidth: 140 }}>
                  <Box>
                    <Typography sx={{ fontSize: '10px', color: 'rgba(24,24,27,0.48)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Mã số chứng chỉ
                    </Typography>
                    <Typography sx={{ fontSize: '12.5px', fontWeight: 800, color: '#1a181e', fontFamily: 'monospace' }}>
                      {certificate.maSoChungChi}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '10px', color: 'rgba(24,24,27,0.48)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Ngày cấp chứng nhận
                    </Typography>
                    <Typography sx={{ fontSize: '12.5px', fontWeight: 800, color: '#1a181e' }}>
                      {certificate.ngayCap.split('-').reverse().join('/')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '10px', color: 'rgba(24,24,27,0.48)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Kết quả học tập
                    </Typography>
                    <Typography sx={{ fontSize: '12.5px', fontWeight: 800, color: '#1f7a4d' }}>
                      Điểm tổng kết: {certificate.diemTongKet.toFixed(1)}/10.0
                    </Typography>
                  </Box>
                </Stack>

                {/* Center: Gold/Red Seal */}
                <Box
                  sx={{
                    position: 'relative',
                    width: { xs: 70, sm: 100 },
                    height: { xs: 70, sm: 100 },
                    display: 'grid',
                    placeItems: 'center',
                    transform: 'translateY(-10px)',
                  }}
                >
                  {/* Decorative Outer Circle */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      border: '2px dashed #d4af37',
                      animation: 'spin 60s linear infinite',
                      '@keyframes spin': {
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }}
                  />
                  <Box
                    sx={{
                      width: '82%',
                      height: '82%',
                      borderRadius: '50%',
                      bgcolor: 'rgba(212,175,55,0.06)',
                      border: '3px solid #d4af37',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#d4af37',
                      boxShadow: '0 4px 10px rgba(212,175,55,0.15)',
                    }}
                  >
                    <WorkspacePremiumRounded sx={{ fontSize: { xs: 24, sm: 34 } }} />
                    <Typography
                      sx={{
                        fontSize: { xs: '6.5px', sm: '8.5px' },
                        fontWeight: 900,
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        lineHeight: 1,
                        mt: 0.5,
                      }}
                    >
                      VERIFIED
                    </Typography>
                  </Box>
                </Box>

                {/* Right: Signature */}
                <Stack spacing={0.5} sx={{ alignItems: 'center', minWidth: 140 }}>
                  <Box sx={{ position: 'relative', height: 45, width: 120, display: 'grid', placeItems: 'center' }}>
                    {/* Simulated Handwriting Signature */}
                    <Typography
                      sx={{
                        fontFamily: '"Mrs Saint Delafield", "Great Vibes", cursive, serif',
                        fontSize: 44,
                        color: '#1a365d',
                        lineHeight: 1,
                        transform: 'rotate(-5deg) translateY(5px)',
                      }}
                    >
                      EduVerse
                    </Typography>
                  </Box>
                  <Box sx={{ width: 110, height: '1px', bgcolor: 'rgba(24,24,27,0.15)' }} />
                  <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#1a181e' }}>
                    GS. TS. Nguyễn Văn Nam
                  </Typography>
                  <Typography sx={{ fontSize: '9px', color: 'rgba(24,24,27,0.48)', fontWeight: 700 }}>
                    Hội đồng Học thuật EduVerse
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>
    </Dialog>
  );
}
