/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowForwardRounded,
  EmailRounded,
  LanguageRounded,
  LinkedIn,
  SearchRounded,
  StarRounded,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  instructorCatalog,
  instructorCategories,
  instructorTestimonials,
  type InstructorItem,
} from './landing-data';
import {
  SectionHeading,
} from './landing-shared';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TextFieldAny = TextField as any;

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('');
}

function SocialIcon({ label }: { label: string }) {
  if (label === 'LinkedIn') return <LinkedIn sx={{ fontSize: 18 }} />;
  if (label === 'Email') return <EmailRounded sx={{ fontSize: 18 }} />;
  return <LanguageRounded sx={{ fontSize: 18 }} />;
}

function MentorPortrait({
  mentor,
  size = 132,
  ring = false,
}: {
  mentor: InstructorItem;
  size?: number;
  ring?: boolean;
}) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        p: ring ? 1.5 : 0,
        background: ring
          ? 'radial-gradient(circle, rgba(173,38,38,0.18) 0%, rgba(173,38,38,0.08) 55%, transparent 70%)'
          : 'transparent',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Box
        sx={{
          width: ring ? size - 18 : size,
          height: ring ? size - 18 : size,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${mentor.palette[0]} 0%, ${mentor.palette[1]} 58%, ${mentor.palette[2]} 100%)`,
          boxShadow: '0 20px 40px rgba(25,18,20,0.18)',
          position: 'relative',
          overflow: 'hidden',
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          fontSize: size / 3.3,
          fontWeight: 900,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 28% 22%, rgba(255,255,255,0.18), transparent 24%), linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.28) 100%)',
          }}
        />
        <Box sx={{ position: 'absolute', bottom: -22, width: '72%', height: '44%', borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.14)' }} />
        <Typography sx={{ position: 'relative', zIndex: 1, fontSize: size / 3.3, fontWeight: 900 }}>
          {getInitials(mentor.name)}
        </Typography>
      </Box>
    </Box>
  );
}

function FeaturedMentorCard({ mentor }: { mentor: InstructorItem }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2.8,
        border: '1px solid rgba(17,17,17,0.08)',
        bgcolor: 'var(--ev-paper, #fff)',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 22px 36px rgba(24,18,20,0.10)',
        },
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <MentorPortrait mentor={mentor} size={112} />
        <Box sx={{ flex: 1 }}>
          <Chip
            label="GIẢNG VIÊN NỔI BẬT"
            size="small"
            sx={{ mb: 1, bgcolor: 'rgba(141,19,19,0.08)', color: '#8B1313', fontWeight: 900 }}
          />
          <Typography sx={{ fontSize: 21, fontWeight: 900 }}>{mentor.name}</Typography>
          <Typography sx={{ mt: 0.6, fontSize: 13.5, color: '#8B1313', fontWeight: 800 }}>
            {mentor.specialization}
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 13, lineHeight: 1.8, color: 'var(--ev-text-muted, rgba(24,24,27,0.58))' }}>
            {mentor.shortBio}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 1.25, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 800 }}>{mentor.students}</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 800 }}>Đánh giá {mentor.rating}</Typography>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Chip
      label={label}
      onClick={onClick}
      sx={{
        height: 34,
        borderRadius: 2.8,
        fontWeight: 800,
        bgcolor: active ? '#7f1212' : '#fff',
        color: active ? '#fff' : 'rgba(24,24,27,0.72)',
        border: active ? 'none' : '1px solid rgba(17,17,17,0.08)',
      }}
    />
  );
}

function InstructorCard({ mentor }: { mentor: InstructorItem }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2.8,
        border: '1px solid rgba(17,17,17,0.08)',
        bgcolor: 'var(--ev-paper, #fff)',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 24px 38px rgba(24,18,20,0.10)',
        },
      }}
    >
      <Box
        sx={{
          p: 1.1,
          borderRadius: 2.8,
          background: 'linear-gradient(180deg, rgba(127,18,18,0.06), rgba(127,18,18,0.02))',
        }}
      >
        <MentorPortrait mentor={mentor} size={176} />
      </Box>

      <Stack direction="row" spacing={0.5} sx={{ mt: 1.3, alignItems: 'center', justifyContent: 'center' }}>
        <StarRounded sx={{ fontSize: 18, color: '#efb21a' }} />
        <Typography sx={{ fontSize: 13.5, fontWeight: 800 }}>{mentor.rating}</Typography>
      </Stack>

      <Typography sx={{ mt: 1.1, textAlign: 'center', fontSize: 21, fontWeight: 900 }}>
        {mentor.name}
      </Typography>
      <Typography sx={{ mt: 0.5, textAlign: 'center', fontSize: 13, color: '#8B1313', fontWeight: 800 }}>
        {mentor.specialization}
      </Typography>
      <Typography sx={{ mt: 0.9, textAlign: 'center', fontSize: 13, lineHeight: 1.8, color: 'var(--ev-text-muted, rgba(24,24,27,0.58))' }}>
        {mentor.shortBio}
      </Typography>

      <Stack direction="row" spacing={1.2} sx={{ mt: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Chip label={`${mentor.students} học viên`} size="small" sx={{ bgcolor: 'rgba(17,17,17,0.05)', fontWeight: 800 }} />
        <Chip label={`${mentor.courses} khóa học`} size="small" sx={{ bgcolor: 'rgba(17,17,17,0.05)', fontWeight: 800 }} />
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 1.4, justifyContent: 'center' }}>
        {mentor.socials.map((social) => (
          <IconButton
            key={social.label}
            component={Link}
            href={social.href}
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'rgba(141,19,19,0.06)',
              color: '#8B1313',
              '&:hover': { bgcolor: 'rgba(141,19,19,0.12)' },
            }}
          >
            <SocialIcon label={social.label} />
          </IconButton>
        ))}
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.1} sx={{ mt: 1.7 }}>
        <Button
          component={Link}
          href="/auth/login"
          variant="outlined"
          sx={{
            flex: 1,
            borderRadius: 2.8,
            borderColor: 'rgba(17,17,17,0.12)',
            color: 'rgba(24,24,27,0.78)',
          }}
        >
          Xem hồ sơ
        </Button>
        <Button
          component={Link}
          href="/auth/login"
          variant="contained"
          endIcon={<ArrowForwardRounded />}
          sx={{
            flex: 1,
            borderRadius: 2.8,
            background: 'linear-gradient(90deg, #9f1717 0%, #7f1d1d 100%)',
          }}
        >
          Khám phá khóa học
        </Button>
      </Stack>
    </Paper>
  );
}

export default function InstructorsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const featuredMentors = useMemo(
    () => instructorCatalog.filter((item) => item.featured),
    [],
  );

  const filteredMentors = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return instructorCatalog.filter((mentor) => {
      const matchCategory =
        activeCategory === 'all' ? true : mentor.category === activeCategory;
      const matchSearch =
        !normalized ||
        mentor.name.toLowerCase().includes(normalized) ||
        mentor.specialization.toLowerCase().includes(normalized) ||
        mentor.shortBio.toLowerCase().includes(normalized);

      return matchCategory && matchSearch;
    });
  }, [activeCategory, search]);

  return (
    <>
      <Box
            sx={{
              pt: { xs: 5, md: 7 },
              pb: { xs: 4, md: 6 },
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.02fr) minmax(360px, 0.98fr)' },
              gap: { xs: 4, md: 5 },
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: 36, sm: 48, md: 60 },
                  lineHeight: 1.05,
                  letterSpacing: '-1.4px',
                  fontWeight: 900,
                  maxWidth: 620,
                  color: '#1a1a1a',
                }}
              >
                Học từ những chuyên gia hàng đầu
              </Typography>
              <Typography
                sx={{
                  mt: 2.25,
                  maxWidth: 620,
                  fontSize: 15.5,
                  lineHeight: 1.9,
                  color: 'var(--ev-text-muted, rgba(24,24,27,0.62))',
                }}
              >
                Kết nối với giảng viên giàu kinh nghiệm trong nhiều lĩnh vực. Chương trình
                học được dẫn dắt bởi mentor thực chiến, truyền cảm hứng và bám sát nhu cầu nghề nghiệp.
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
                  Trở thành giảng viên
                </Button>
                <Button
                  component={Link}
                  href="/auth/login"
                  variant="outlined"
                  sx={{
                    px: 2.8,
                    py: 1.25,
                    borderRadius: 2.8,
                    borderColor: 'rgba(24,24,27,0.14)',
                    color: 'rgba(24,24,27,0.82)',
                  }}
                >
                  Khám phá khóa học
                </Button>
              </Stack>
            </Box>

            <Box sx={{ display: 'grid', placeItems: 'center' }}>
              <Box
                sx={{
                  width: { xs: 270, sm: 320, md: 360 },
                  height: { xs: 270, sm: 320, md: 360 },
                  borderRadius: '50%',
                  border: '1px solid rgba(141,19,19,0.12)',
                  position: 'relative',
                  display: 'grid',
                  placeItems: 'center',
                  background:
                    'radial-gradient(circle, rgba(141,19,19,0.06) 0%, rgba(141,19,19,0.02) 58%, transparent 72%)',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 18,
                    borderRadius: '50%',
                    border: '1px solid rgba(141,19,19,0.08)',
                  }}
                />
                <Box sx={{ position: 'absolute', top: 34, left: 26, width: 8, height: 8, borderRadius: '50%', bgcolor: '#8B1313' }} />
                <Box sx={{ position: 'absolute', bottom: 58, right: 34, width: 10, height: 10, borderRadius: '50%', bgcolor: '#efb7b7' }} />
                <MentorPortrait mentor={featuredMentors[0] ?? instructorCatalog[0]} size={194} ring />
              </Box>
            </Box>
          </Box>

          <Box sx={{ py: { xs: 4, md: 5 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3.5 }}>
              <SectionHeading
                eyebrow="Giảng viên nổi bật"
                title="Giảng viên tiêu biểu"
                description="Những mentor nổi bật với kinh nghiệm thực chiến, tư duy hiện đại và đánh giá rất cao từ học viên."
                align="center"
              />
              <Button endIcon={<ArrowForwardRounded />} sx={{ color: '#8B1313', mt: 1.5 }}>
                Xem hồ sơ đầy đủ
              </Button>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              {featuredMentors.map((mentor) => (
                <FeaturedMentorCard key={mentor.id} mentor={mentor} />
              ))}
            </Box>
          </Box>

          <Box sx={{ py: { xs: 5, md: 6 } }}>
            <SectionHeading
              title="Danh mục giảng viên"
              description="Lựa chọn chuyên môn bạn quan tâm để tìm mentor phù hợp nhất với định hướng nghề nghiệp."
              align="center"
            />

            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={2}
              sx={{ mt: 3, justifyContent: 'space-between', alignItems: { xs: 'stretch', lg: 'center' } }}
            >
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {instructorCategories.map((item) => (
                  <FilterChip
                    key={item.value}
                    label={item.label}
                    active={item.value === activeCategory}
                    onClick={() => setActiveCategory(item.value)}
                  />
                ))}
              </Stack>

              <TextFieldAny
                fullWidth
                value={search}
                onChange={(event: any) => setSearch(event.target.value)}
                placeholder="Tìm tên giảng viên..."
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRounded sx={{ color: 'rgba(24,24,27,0.38)' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  maxWidth: { xs: '100%', lg: 300 },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'var(--ev-paper, #fff)',
                    borderRadius: 2.8,
                  },
                }}
              />
            </Stack>

            <Box
              sx={{
                mt: 3,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              {filteredMentors.map((mentor) => (
                <InstructorCard key={mentor.id} mentor={mentor} />
              ))}
            </Box>

            <Stack sx={{ mt: 3, alignItems: 'center' }}>
              <Button
                variant="outlined"
                sx={{
                  px: 3.4,
                  py: 1.15,
                  borderRadius: 2.8,
                  borderColor: 'rgba(127,18,18,0.3)',
                  color: '#7f1212',
                }}
              >
                Xem thêm giảng viên khác
              </Button>
            </Stack>
          </Box>

          <Box
            sx={{
              py: { xs: 5, md: 6 },
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '360px repeat(2, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2.8,
                border: '1px solid rgba(17,17,17,0.08)',
                bgcolor: '#f2eeea',
              }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.12em', color: '#8B1313', textTransform: 'uppercase' }}>
                Cảm nhận học viên
              </Typography>
              <Typography sx={{ mt: 1.1, fontSize: 38, lineHeight: 1.05, letterSpacing: '-1px', fontWeight: 900 }}>
                Cảm nhận từ học viên
              </Typography>
              <Typography sx={{ mt: 1.4, fontSize: 14.5, lineHeight: 1.9, color: 'rgba(24,24,27,0.6)' }}>
                Hơn 90.000 học viên tin tưởng học tập nhờ sự dẫn dắt của đội ngũ giảng viên trên EduVerse.
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                <IconButton sx={{ bgcolor: 'var(--ev-paper, #fff)', border: '1px solid rgba(17,17,17,0.08)' }}>
                  <ArrowForwardRounded sx={{ transform: 'rotate(180deg)', fontSize: 18 }} />
                </IconButton>
                <IconButton sx={{ bgcolor: 'var(--ev-paper, #fff)', border: '1px solid rgba(17,17,17,0.08)' }}>
                  <ArrowForwardRounded sx={{ fontSize: 18 }} />
                </IconButton>
              </Stack>
            </Paper>

            {instructorTestimonials.map((item) => (
              <Paper
                key={item.name}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2.8,
                  border: '1px solid rgba(17,17,17,0.08)',
                  bgcolor: 'var(--ev-paper, #fff)',
                }}
              >
                <Stack direction="row" spacing={0.35} sx={{ color: '#efb21a' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarRounded key={star} sx={{ fontSize: 18 }} />
                  ))}
                </Stack>
                <Typography sx={{ mt: 1.35, fontSize: 14, lineHeight: 1.95, color: 'var(--ev-text-muted, rgba(24,24,27,0.72))' }}>
                  {`"` + item.quote + `"`}
                </Typography>
                <Stack direction="row" spacing={1.2} sx={{ mt: 2.2, alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#7f1212', width: 42, height: 42 }}>
                    {getInitials(item.name)}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: 14.5, fontWeight: 900 }}>{item.name}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: 'var(--ev-text-muted, rgba(24,24,27,0.54))' }}>
                      {item.role}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Box>

          <Paper
            elevation={0}
            sx={{
              mt: { xs: 1, md: 2 },
              p: { xs: 3, md: 5 },
              borderRadius: 2.8,
              overflow: 'hidden',
              position: 'relative',
              color: '#fff',
              background:
                'radial-gradient(circle at top right, rgba(255,255,255,0.10), transparent 24%), linear-gradient(135deg, #8d1010 0%, #6f0f0f 100%)',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: 28,
                top: 24,
                width: 110,
                height: 110,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                right: 42,
                bottom: 24,
                width: 160,
                height: 160,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
            <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontSize: { xs: 28, md: 38 } }}>
                Bạn đã sẵn sàng chia sẻ kiến thức của mình?
              </Typography>
              <Typography sx={{ mt: 1.4, maxWidth: 700, mx: 'auto', lineHeight: 1.9, color: 'rgba(255,255,255,0.82)' }}>
                Gia nhập đội ngũ hơn 500+ giảng viên uy tín tại EduVerse và xây dựng cộng đồng học tập chất lượng dành cho người đi làm.
              </Typography>
              <Button
                component={Link}
                href="/auth/login"
                variant="contained"
                sx={{
                  mt: 3,
                  px: 3.2,
                  py: 1.25,
                  borderRadius: 2.8,
                  bgcolor: 'var(--ev-paper, #fff)',
                  color: '#7f1212',
                }}
              >
                Đăng ký làm giảng viên ngay
              </Button>
            </Box>
          </Paper>
    </>
  );
}

