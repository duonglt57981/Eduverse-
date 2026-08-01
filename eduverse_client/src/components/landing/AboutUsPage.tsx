'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowForwardRounded, CheckCircleRounded, StarRounded } from '@mui/icons-material';
import { Avatar, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import {
  aboutTimeline,
  aboutValues,
  instructorCatalog,
  testimonials,
  stats,
} from './landing-data';
import {
  SectionHeading,
} from './landing-shared';

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('');
}

export default function AboutUsPage() {
  const featuredTeam = instructorCatalog.slice(0, 3);

  return (
    <>
      <Box
            sx={{
              pt: { xs: 5, md: 7 },
              pb: { xs: 4, md: 6 },
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.02fr) minmax(420px, 0.98fr)' },
              gap: { xs: 4, md: 5 },
              alignItems: 'center',
            }}
          >
            <Box>
              <Chip
                label="Chúng tôi đang định hình một thế hệ học tập mới"
                sx={{
                  bgcolor: 'rgba(159,23,23,0.08)',
                  color: '#9f1717',
                  fontWeight: 900,
                  mb: 2.25,
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: 36, sm: 48, md: 62 },
                  lineHeight: 1.04,
                  letterSpacing: '-1.5px',
                  fontWeight: 900,
                  maxWidth: 700,
                  color: '#1a1a1a',
                }}
              >
                EduVerse kiến tạo hành trình học tập hiện đại và bền vững
              </Typography>
              <Typography
                sx={{
                  mt: 2.25,
                  maxWidth: 620,
                  fontSize: 15.5,
                  lineHeight: 1.95,
                  color: 'var(--ev-text-muted, rgba(24,24,27,0.62))',
                }}
              >
                EduVerse mang đến trải nghiệm học tập trực tuyến cao cấp, kết hợp
                nội dung thực chiến, công nghệ hiện đại và cộng đồng học viên tích cực
                để giúp người học phát triển kỹ năng thật, sự nghiệp thật.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.4} sx={{ mt: 3 }}>
                <Button
                  component={Link}
                  href="/auth/login"
                  variant="contained"
                  sx={{
                    px: 2.8,
                    py: 1.25,
                    borderRadius: 2.8,
                    background: 'linear-gradient(90deg, #9f1717 0%, #7f1d1d 100%)',
                  }}
                >
                  Khám phá EduVerse
                </Button>
                <Button
                  component={Link}
                  href="/courses"
                  variant="outlined"
                  sx={{
                    px: 2.8,
                    py: 1.25,
                    borderRadius: 2.8,
                    borderColor: 'rgba(24,24,27,0.14)',
                    color: 'rgba(24,24,27,0.82)',
                  }}
                >
                  Xem lộ trình học
                </Button>
              </Stack>
            </Box>

            <Box sx={{ position: 'relative' }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.25, md: 1.6 },
                  borderRadius: 2.8,
                  border: '1px solid rgba(127,29,29,0.18)',
                  boxShadow: '0 26px 50px rgba(90, 26, 26, 0.14)',
                  bgcolor: '#fff7f4',
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 2.8,
                    minHeight: { xs: 280, sm: 340, md: 420 },
                    background:
                      'linear-gradient(135deg, rgba(255,247,240,0.96), rgba(255,240,233,0.94))',
                  }}
                >
                  <Image
                    src="/auth/img/img03.jpg"
                    alt="EduVerse team"
                    fill
                    priority
                    sizes="(max-width: 900px) 100vw, 48vw"
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center center',
                      transform: 'scale(1.08)',
                    }}
                  />
                </Box>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  position: 'absolute',
                  left: { xs: 12, md: -18 },
                  bottom: { xs: 14, md: 26 },
                  px: 2,
                  py: 1.4,
                  borderRadius: 2.8,
                  border: '1px solid rgba(17,17,17,0.08)',
                  boxShadow: '0 18px 32px rgba(30,24,26,0.10)',
                  bgcolor: 'var(--ev-paper, #fff)',
                }}
              >
                <Typography sx={{ fontSize: 22, fontWeight: 900, color: '#7f1d1d' }}>
                  95%
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: 'var(--ev-text-muted, rgba(24,24,27,0.54))' }}>
                  Tỷ lệ hài lòng từ học viên
                </Typography>
              </Paper>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
              gap: 2,
              py: { xs: 2, md: 3 },
            }}
          >
            {stats.map((item) => (
              <Paper
                key={item.label}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2.8,
                  border: '1px solid rgba(17,17,17,0.06)',
                  bgcolor: 'rgba(255,255,255,0.76)',
                }}
              >
                <Typography sx={{ fontSize: { xs: 26, md: 34 }, fontWeight: 900, color: '#a21a1a' }}>
                  {item.value}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.75,
                    fontSize: 12.5,
                    fontWeight: 800,
                    color: 'rgba(24,24,27,0.56)',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.label}
                </Typography>
              </Paper>
            ))}
          </Box>

          <Box sx={{ py: { xs: 5, md: 7 } }}>
            <SectionHeading
              title="Giá trị làm nên EduVerse"
              description="Chúng tôi xây dựng nền tảng học tập dựa trên tính ứng dụng, chất lượng nội dung, trải nghiệm cao cấp và sự phát triển bền vững cho người học."
              align="center"
            />
            <Box
              sx={{
                mt: 3.5,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              {aboutValues.map((item) => {
                const Icon = item.icon;
                return (
                  <Paper
                    key={item.title}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2.8,
                      border: '1px solid rgba(127,18,18,0.22)',
                      bgcolor: 'var(--ev-paper, #fff)',
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2.8,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'rgba(127,29,29,0.08)',
                        color: '#8B1313',
                        mb: 1.5,
                      }}
                    >
                      <Icon />
                    </Box>
                    <Typography sx={{ fontSize: 22, fontWeight: 900 }}>{item.title}</Typography>
                    <Typography sx={{ mt: 1, fontSize: 14.5, lineHeight: 1.9, color: 'var(--ev-text-muted, rgba(24,24,27,0.62))' }}>
                      {item.description}
                    </Typography>
                  </Paper>
                );
              })}
            </Box>
          </Box>

          <Box sx={{ py: { xs: 5, md: 7 } }}>
            <SectionHeading
              eyebrow="Hành trình"
              title="Dấu mốc phát triển của EduVerse"
              description="Từ ý tưởng ban đầu đến một hệ sinh thái học tập hoàn chỉnh, mỗi giai đoạn đều tập trung vào trải nghiệm người học và chất lượng đào tạo."
              align="center"
            />
            <Box
              sx={{
                mt: 4,
                position: 'relative',
                maxWidth: 980,
                mx: 'auto',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: { xs: 14, md: '50%' },
                  top: 0,
                  bottom: 0,
                  width: 2,
                  bgcolor: 'rgba(127,18,18,0.18)',
                  transform: { md: 'translateX(-50%)' },
                }}
              />
              <Stack spacing={2.5}>
                {aboutTimeline.map((item, index) => (
                  <Box
                    key={item.year}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr 80px 1fr' },
                      gap: 2,
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ order: { xs: 2, md: index % 2 === 0 ? 1 : 3 } }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.25,
                          borderRadius: 2.8,
                          border: '1px solid rgba(17,17,17,0.08)',
                          bgcolor: 'var(--ev-paper, #fff)',
                        }}
                      >
                        <Typography sx={{ fontSize: 14, fontWeight: 900, color: '#8B1313' }}>
                          {item.year}
                        </Typography>
                        <Typography sx={{ mt: 0.7, fontSize: 20, fontWeight: 900 }}>
                          {item.title}
                        </Typography>
                        <Typography sx={{ mt: 0.9, fontSize: 14, lineHeight: 1.85, color: 'var(--ev-text-muted, rgba(24,24,27,0.58))' }}>
                          {item.description}
                        </Typography>
                      </Paper>
                    </Box>
                    <Box
                      sx={{
                        order: { xs: 1, md: 2 },
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          bgcolor: '#8B1313',
                          border: '4px solid #F7F5F2',
                          boxShadow: '0 0 0 4px rgba(141,19,19,0.12)',
                        }}
                      />
                    </Box>
                    <Box sx={{ display: { xs: 'none', md: 'block' }, order: index % 2 === 0 ? 3 : 1 }} />
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>

          <Box sx={{ py: { xs: 5, md: 7 } }}>
            <SectionHeading
              eyebrow="Đội ngũ"
              title="Những gương mặt đồng hành cùng học viên"
              description="EduVerse quy tụ đội ngũ giảng viên và chuyên gia với kinh nghiệm sâu, tư duy hiện đại và khả năng truyền đạt truyền cảm hứng."
              align="center"
            />
            <Box
              sx={{
                mt: 3.5,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              {featuredTeam.map((member) => (
                <Paper
                  key={member.id}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2.8,
                    border: '1px solid rgba(17,17,17,0.08)',
                    bgcolor: 'var(--ev-paper, #fff)',
                    textAlign: 'center',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 88,
                      height: 88,
                      mx: 'auto',
                      mb: 1.5,
                      background: `linear-gradient(135deg, ${member.palette[0]} 0%, ${member.palette[1]} 58%, ${member.palette[2]} 100%)`,
                      fontSize: 28,
                      fontWeight: 900,
                    }}
                  >
                    {getInitials(member.name)}
                  </Avatar>
                  <Typography sx={{ fontSize: 18, fontWeight: 900 }}>{member.name}</Typography>
                  <Typography sx={{ mt: 0.6, fontSize: 13, color: '#8B1313', fontWeight: 800 }}>
                    {member.specialization}
                  </Typography>
                  <Typography sx={{ mt: 0.8, fontSize: 13, color: 'rgba(24,24,27,0.56)' }}>
                    {member.experience} kinh nghiệm
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              py: { xs: 5, md: 7 },
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(320px, 0.9fr) minmax(0, 1.1fr)' },
              gap: 2,
              alignItems: 'stretch',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2.8,
                border: '1px solid rgba(17,17,17,0.08)',
                bgcolor: '#f2eeea',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.12em', color: '#8B1313', textTransform: 'uppercase' }}>
                Vì sao chọn EduVerse
              </Typography>
              <Typography sx={{ mt: 1.2, fontSize: 34, lineHeight: 1.08, fontWeight: 900 }}>
                Một nền tảng học tập tinh gọn nhưng mạnh mẽ
              </Typography>
              <Stack spacing={1.2} sx={{ mt: 2.5 }}>
                {[
                  'Nội dung thực chiến, sát nhu cầu nghề nghiệp',
                  'Mentor chất lượng và lộ trình cá nhân hóa',
                  'Dashboard theo dõi tiến độ rõ ràng, hiện đại',
                  'Chứng chỉ giá trị, cộng đồng học viên tích cực',
                ].map((item) => (
                  <Stack key={item} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <CheckCircleRounded sx={{ mt: 0.2, color: '#8B1313', fontSize: 18 }} />
                    <Typography sx={{ fontSize: 14, lineHeight: 1.8, color: 'var(--ev-text-muted, rgba(24,24,27,0.68))' }}>
                      {item}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              {testimonials.map((item) => (
                <Paper
                  key={item.name}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2.8,
                    border: '1px solid rgba(17,17,17,0.08)',
                    bgcolor: 'var(--ev-paper, #fff)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                >
                  <Stack direction="row" spacing={0.35} sx={{ color: '#efb21a', flexShrink: 0 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarRounded key={star} sx={{ fontSize: 18 }} />
                    ))}
                  </Stack>
                  <Typography sx={{ mt: 1.4, fontSize: 14, lineHeight: 1.9, color: 'var(--ev-text-muted, rgba(24,24,27,0.68))', flexGrow: 1 }}>
                    {item.quote}
                  </Typography>
                  <Box sx={{ mt: 1.8, flexShrink: 0 }}>
                    <Typography sx={{ fontSize: 14.5, fontWeight: 900 }}>
                      {item.name}
                    </Typography>
                    <Typography sx={{ mt: 0.45, fontSize: 12.5, color: 'var(--ev-text-muted, rgba(24,24,27,0.54))' }}>
                      {item.role}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>

          <Paper
            elevation={0}
            sx={{
              mt: { xs: 2, md: 4 },
              p: { xs: 3, md: 5 },
              borderRadius: 2.8,
              overflow: 'hidden',
              position: 'relative',
              color: '#fff',
              background:
                'radial-gradient(circle at top right, rgba(255,255,255,0.12), transparent 25%), linear-gradient(135deg, #8d1010 0%, #6f0f0f 100%)',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                right: -60,
                top: -40,
                width: 220,
                height: 220,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.08)',
              }}
            />
            <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontSize: { xs: 28, md: 38 } }}>
                Sẵn sàng đồng hành cùng EduVerse?
              </Typography>
              <Typography sx={{ mt: 1.5, maxWidth: 700, mx: 'auto', lineHeight: 1.9, color: 'rgba(255,255,255,0.82)' }}>
                Hãy bắt đầu hành trình học tập cùng nền tảng được thiết kế cho người học hiện đại,
                với nội dung chất lượng, mentor giỏi và trải nghiệm cao cấp.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3, justifyContent: 'center' }}>
                <Button
                  component={Link}
                  href="/auth/login"
                  variant="contained"
                  sx={{ px: 2.8, py: 1.25, borderRadius: 2.8, bgcolor: 'var(--ev-paper, #fff)', color: '#7f1d1d' }}
                >
                  Bắt đầu ngay
                </Button>
                <Button
                  component={Link}
                  href="/courses"
                  variant="outlined"
                  endIcon={<ArrowForwardRounded />}
                  sx={{ px: 2.8, py: 1.25, borderRadius: 2.8, borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
                >
                  Xem khóa học
                </Button>
              </Stack>
            </Box>
          </Paper>
    </>
  );
}

