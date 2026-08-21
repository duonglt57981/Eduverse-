'use client';

import { BRAND } from "@/src/theme/tokens";
import Link from 'next/link';
import {
  ArrowForwardRounded,
  EmailRounded,
  FacebookRounded,
  LocationOnRounded,
  SendRounded,
  SupportAgentRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { contactFaqs, contactInfo } from './landing-data';
import {
  SectionHeading,
} from './landing-shared';

function ContactField({
  label,
  multiline = false,
  rows,
}: {
  label: string;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <TextField
      fullWidth
      placeholder={label}
      multiline={multiline}
      rows={rows}
      variant="outlined"
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2.8,
          bgcolor: '#faf8f7',
          transition: 'box-shadow 160ms ease, border-color 160ms ease, background-color 160ms ease',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--ev-divider, rgba(17,17,17,0.08))',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(139,19,19,0.3)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: BRAND.main,
          },
          '&.Mui-focused': {
            bgcolor: 'var(--ev-paper, #fff)',
            boxShadow: '0 0 0 4px rgba(139,19,19,0.12)',
          },
        },
        '& input.MuiOutlinedInput-input': {
          padding: '16px 14px',
          lineHeight: '1.4',
        },
        '& input::placeholder, & textarea::placeholder': {
          color: 'rgba(17,17,17,0.5)',
          opacity: 1,
        },
      }}
    />
  );
}

export default function ContactPage() {
  return (
    <>
      <Paper
            elevation={0}
            sx={{
              mt: { xs: 3, md: 4 },
              px: { xs: 3, md: 5 },
              py: { xs: 5, md: 7 },
              borderRadius: 2.8,
              textAlign: 'center',
              overflow: 'hidden',
              position: 'relative',
              background:
                'linear-gradient(135deg, rgba(255,244,244,0.96) 0%, rgba(247,239,239,0.94) 55%, rgba(255,248,248,0.96) 100%)',
              border: '1px solid rgba(141,19,19,0.08)',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(circle at 18% 28%, rgba(159,23,23,0.08), transparent 12%), radial-gradient(circle at 66% 22%, rgba(159,23,23,0.06), transparent 16%), linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.48) 45%, transparent 70%)',
              }}
            />
            <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 720, mx: 'auto' }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: 34, md: 54 },
                  lineHeight: 1.06,
                  letterSpacing: '-1.2px',
                  fontWeight: 900,
                  color: '#7f1212',
                }}
              >
                Liên hệ với chúng tôi
              </Typography>
              <Typography
                sx={{
                  mt: 1.6,
                  fontSize: 15.5,
                  lineHeight: 1.9,
                  color: 'var(--ev-text-muted, rgba(24,24,27,0.62))',
                }}
              >
                Đội ngũ EduVerse luôn sẵn sàng hỗ trợ bạn. Hãy để lại lời nhắn, chúng tôi sẽ
                phản hồi trong vòng 24 giờ làm việc.
              </Typography>
            </Box>
          </Paper>

          <Box
            sx={{
              py: { xs: 4, md: 5 },
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.12fr) 380px' },
              gap: 2.2,
              alignItems: 'start',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 2.8,
                border: '1px solid rgba(17,17,17,0.08)',
                bgcolor: 'var(--ev-paper, #fff)',
                boxShadow: '0 18px 34px rgba(24,18,20,0.08)',
              }}
            >
              <Typography sx={{ fontSize: 32, lineHeight: 1.1, fontWeight: 900 }}>
                Gửi tin nhắn cho chúng tôi
              </Typography>

              <Box
                sx={{
                  mt: 2.5,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                  gap: 1.6,
                }}
              >
                <ContactField label="Họ và tên" />
                <ContactField label="Email" />
                <ContactField label="Số điện thoại" />
                <ContactField label="Chủ đề" />
                <Box sx={{ gridColumn: { xs: 'auto', sm: '1 / -1' } }}>
                  <ContactField label="Nội dung" multiline rows={6} />
                </Box>
              </Box>

              <Button
                variant="contained"
                endIcon={<SendRounded />}
                sx={{
                  mt: 2.5,
                  px: 2.8,
                  py: 1.25,
                  borderRadius: 2.8,
                  background: `linear-gradient(90deg, #9f1717 0%, ${BRAND.main} 100%)`,
                  boxShadow: '0 10px 24px rgba(139,19,19,0.18)',
                  transition: 'background 160ms ease, box-shadow 160ms ease',
                  '&:hover': {
                    background: `linear-gradient(90deg, ${BRAND.main} 0%, #6b1414 100%)`,
                    boxShadow: '0 12px 28px rgba(139,19,19,0.24)',
                  },
                }}
              >
                Gửi lời nhắn ngay
              </Button>
            </Paper>

            <Stack spacing={1.6}>
              {contactInfo.map((item) => {
                const Icon = item.icon;
                return (
                  <Paper
                    key={item.title}
                    elevation={0}
                    sx={{
                      p: 2.1,
                      borderRadius: 2.8,
                      border: '1px solid rgba(17,17,17,0.08)',
                      bgcolor: 'var(--ev-paper, #fff)',
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2.8,
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: 'rgba(141,19,19,0.08)',
                          color: BRAND.main,
                          flexShrink: 0,
                        }}
                      >
                        <Icon />
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 14.5, fontWeight: 900 }}>{item.title}</Typography>
                        <Typography sx={{ mt: 0.45, fontSize: 14, color: 'rgba(24,24,27,0.9)' }}>
                          {item.value}
                        </Typography>
                        <Typography sx={{ mt: 0.35, fontSize: 12.5, color: 'rgba(24,24,27,0.56)' }}>
                          {item.detail}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}

              <Box sx={{ pt: 1 }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 900,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--ev-text-muted, rgba(24,24,27,0.58))',
                  }}
                >
                  Kết nối với chúng tôi
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1.3 }}>
                  {[
                    { icon: <FacebookRounded sx={{ fontSize: 19 }} />, href: '#' },
                    { icon: <EmailRounded sx={{ fontSize: 19 }} />, href: '#' },
                    { icon: <SupportAgentRounded sx={{ fontSize: 19 }} />, href: '#' },
                  ].map((item, index) => (
                    <IconButton
                      key={index}
                      component={Link}
                      href={item.href}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: '#1f1f23',
                        color: '#fff',
                        '&:hover': { bgcolor: '#7f1212' },
                      }}
                    >
                      {item.icon}
                    </IconButton>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              py: { xs: 4, md: 5 },
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(320px, 0.92fr) minmax(0, 1.08fr)' },
              gap: 2.2,
              alignItems: 'start',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2.8,
                border: '1px solid rgba(17,17,17,0.08)',
                bgcolor: 'var(--ev-paper, #fff)',
              }}
            >
              <SectionHeading
                eyebrow="Hỗ trợ"
                title="Cần hỗ trợ nhanh?"
                description="Một vài câu hỏi phổ biến trước khi bạn gửi yêu cầu trực tiếp cho đội ngũ EduVerse."
              />

              <Stack spacing={1.3} sx={{ mt: 2.3 }}>
                {contactFaqs.map((item) => (
                  <Paper
                    key={item.question}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2.8,
                      border: '1px solid rgba(17,17,17,0.07)',
                      bgcolor: '#faf8f7',
                    }}
                  >
                    <Typography sx={{ fontSize: 15, fontWeight: 900 }}>
                      {item.question}
                    </Typography>
                    <Typography sx={{ mt: 0.7, fontSize: 13.5, lineHeight: 1.8, color: 'var(--ev-text-muted, rgba(24,24,27,0.58))' }}>
                      {item.answer}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                borderRadius: 2.8,
                overflow: 'hidden',
                border: '1px solid rgba(17,17,17,0.08)',
                bgcolor: '#e9e4e2',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  minHeight: { xs: 300, md: 420 },
                  background:
                    'linear-gradient(180deg, rgba(240,236,234,0.98), rgba(225,220,218,0.96))',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'repeating-linear-gradient(25deg, rgba(255,255,255,0.35) 0 4px, transparent 4px 40px), repeating-linear-gradient(-18deg, rgba(255,255,255,0.25) 0 3px, transparent 3px 46px)',
                    opacity: 0.8,
                  }}
                />
                {[
                  { top: '62%', left: '24%', active: false },
                  { top: '54%', left: '39%', active: false },
                  { top: '50%', left: '57%', active: true },
                ].map((pin, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'absolute',
                      top: pin.top,
                      left: pin.left,
                      transform: 'translate(-50%, -100%)',
                    }}
                  >
                    <LocationOnRounded
                      sx={{
                        fontSize: pin.active ? 38 : 32,
                        color: pin.active ? '#7f1212' : 'rgba(24,24,27,0.38)',
                        filter: 'drop-shadow(0 10px 16px rgba(24,18,20,0.12))',
                      }}
                    />
                  </Box>
                ))}
                <Paper
                  elevation={0}
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    bottom: 18,
                    transform: 'translateX(-50%)',
                    px: 1.6,
                    py: 1,
                    borderRadius: 2.8,
                    bgcolor: 'var(--ev-paper, #fff)',
                    border: '1px solid rgba(17,17,17,0.08)',
                  }}
                >
                  <Stack direction="row" spacing={1.4} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 800, whiteSpace: 'nowrap' }}>
                      EduVerse Hub - TP. Ho Chi Minh
                    </Typography>
                    <Button
                      size="small"
                      endIcon={<ArrowForwardRounded />}
                      sx={{ color: '#7f1212', borderRadius: 2.8 }}
                    >
                      Xem trên bản đồ
                    </Button>
                  </Stack>
                </Paper>
              </Box>
            </Paper>
          </Box>
    </>
  );
}

