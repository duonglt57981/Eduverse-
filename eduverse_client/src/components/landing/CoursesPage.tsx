'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import KhoaHocService from '@/src/services/KhoaHocService';
import { danhMucService } from '@/src/services/danhmucService';
import {
  ArrowForwardRounded,
  FavoriteBorderRounded,
  MenuBookRounded,
  QueryStatsRounded,
  SchoolRounded,
  SearchRounded,
  TimerRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Paper,
  Rating,
  Select,
  type SelectChangeEvent,
  Stack,
  Switch,
  TextField,
  Typography,
  Checkbox,
} from '@mui/material';
import {
  type CourseCatalogItem,
  type CourseCategory,
} from './landing-data';
import {
  CourseVisual,
  SectionHeading,
} from './landing-shared';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TextFieldAny = TextField as any;

type CourseSortOption = 'newest' | 'rating' | 'price-low';

function CategoryCard({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.25,
        borderRadius: 2.8,
        border: active ? '1px solid rgba(141,19,19,0.24)' : '1px solid rgba(17,17,17,0.07)',
        bgcolor: active ? 'rgba(141,19,19,0.05)' : '#fff',
        cursor: 'pointer',
        transition: 'all 180ms ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 18px 30px rgba(24,18,20,0.08)',
        },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2.8,
          display: 'grid',
          placeItems: 'center',
          bgcolor: active ? 'rgba(141,19,19,0.12)' : 'rgba(141,19,19,0.06)',
          color: '#8B1313',
          mb: 1.5,
        }}
      >
        <MenuBookRounded />
      </Box>
      <Typography sx={{ fontSize: 16, fontWeight: 900 }}>{label}</Typography>
      {count ? (
        <Typography sx={{ mt: 0.65, fontSize: 12.5, color: 'rgba(24,24,27,0.56)' }}>
          {count} khóa học
        </Typography>
      ) : null}
    </Paper>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography
        sx={{
          mb: 1.2,
          fontSize: 12,
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'rgba(24,24,27,0.6)',
        }}
      >
        {title}
      </Typography>
      <Stack spacing={1}>{children}</Stack>
    </Box>
  );
}

function CourseCard({ course }: { course: CourseCatalogItem }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.75,
        borderRadius: 2.8,
        border: '1px solid rgba(17,17,17,0.08)',
        bgcolor: '#fff',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 22px 36px rgba(24,18,20,0.1)',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CourseVisual palette={course.palette} badge={course.badge} />
        <Button
          sx={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 34,
            minWidth: 34,
            height: 34,
            p: 0,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.9)',
            color: '#8B1313',
          }}
        >
          <FavoriteBorderRounded sx={{ fontSize: 18 }} />
        </Button>
      </Box>

      <Stack direction="row" spacing={0.8} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
        {course.tags.slice(0, 2).map((tag) => (
          <Chip
            key={tag}
            label={tag}
            size="small"
            sx={{
              height: 26,
              borderRadius: 2.8,
              bgcolor: 'rgba(17,17,17,0.05)',
              fontWeight: 700,
            }}
          />
        ))}
        <Chip
          label={course.duration}
          size="small"
          sx={{
            height: 26,
            borderRadius: 2.8,
            bgcolor: 'rgba(141,19,19,0.06)',
            color: '#8B1313',
            fontWeight: 800,
          }}
        />
      </Stack>

      <Typography sx={{ mt: 1.35, fontSize: 22, fontWeight: 900, lineHeight: 1.24, letterSpacing: '-0.4px' }}>
        {course.title}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mt: 1.4, alignItems: 'center', flexWrap: 'wrap' }}>
        <Rating value={course.rating} precision={0.1} readOnly size="small" />
        <Typography sx={{ fontSize: 13, color: 'rgba(24,24,27,0.54)', fontWeight: 700 }}>
          {course.rating.toFixed(1)}
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'rgba(24,24,27,0.54)' }}>
          ({course.students} học viên) • {course.level}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1.4} sx={{ mt: 1.25, color: 'rgba(24,24,27,0.54)', flexWrap: 'wrap' }}>
        <Stack direction="row" spacing={0.65} sx={{ alignItems: 'center' }}>
          <SchoolRounded sx={{ fontSize: 17 }} />
          <Typography sx={{ fontSize: 12.5 }}>{course.category}</Typography>
        </Stack>
        <Stack direction="row" spacing={0.65} sx={{ alignItems: 'center' }}>
          <TimerRounded sx={{ fontSize: 17 }} />
          <Typography sx={{ fontSize: 12.5 }}>{course.duration}</Typography>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1.2} sx={{ mt: 1.5, alignItems: 'baseline' }}>
        <Typography sx={{ fontSize: 13.5, color: 'rgba(24,24,27,0.38)', textDecoration: 'line-through' }}>
          {course.originalPrice}
        </Typography>
        <Typography sx={{ fontSize: 28, fontWeight: 900, color: '#8B1313' }}>
          {course.price}
        </Typography>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.1} sx={{ mt: 1.75 }}>
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
          Xem chi tiết
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
          Đăng ký ngay
        </Button>
      </Stack>
    </Paper>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapToCatalogItem = (kh: any): CourseCatalogItem => {
  // Stable hash based on course ID to generate a consistent rating between 4.0 and 5.0
  const charCodeSum = (kh.id || '').split('').reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0);
  const mockRating = 4.0 + (charCodeSum % 11) * 0.1; // yields: 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0

  return {
    id: kh.id,
    title: kh.tieuDe || 'Khóa học không tên',
    instructor: kh.tenGiangVien || 'Chưa cập nhật',
    rating: mockRating,
    students: kh.soLuongHocVien || 0,
    price: kh.gia === 0 || kh.gia === null ? 'Miễn phí' : `${kh.gia?.toLocaleString('vi-VN')}đ`,
    originalPrice: kh.giaGoc && kh.giaGoc > 0 ? `${kh.giaGoc?.toLocaleString('vi-VN')}đ` : '',
    level: kh.capDo || 'Mọi cấp độ',
    duration: kh.tongThoiLuong ? `${Math.round(kh.tongThoiLuong / 60)} giờ` : 'Chưa cập nhật',
    category: kh.loaiKhoaHoc || 'Khác',
    badge: kh.gia === 0 || kh.gia === null ? "Miễn phí" : "",
    tags: [kh.capDo || 'Tự chọn', kh.gia === 0 || kh.gia === null ? 'Free' : 'Pro'],
    palette: [
      '#8B1313',
      '#c2410c',
      '#fff7f4'
    ],
    isFree: kh.gia === 0 || kh.gia === null
  };
};

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<CourseSortOption>('newest');
  const [freeOnly, setFreeOnly] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);

  const [courses, setCourses] = useState<CourseCatalogItem[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const courseService = useMemo(() => new KhoaHocService(), []);

  // Danh mục thật từ phần quản lý danh mục của Admin (/danhmuc, công khai)
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await danhMucService.getList({ pageIndex: 1, pageSize: 100 });
        if (active && res.status && res.data) {
          setCategories(
            (res.data.items || []).map((dm) => ({
              label: dm.tenDanhMuc || 'Danh mục',
              value: dm.tenDanhMuc || '',
            })),
          );
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const searchParams: any = {
          pageIndex,
          pageSize,
          keyword: (search || (activeCategory !== 'all' ? activeCategory : '')) || undefined,
          capDo: selectedLevels.length > 0 ? selectedLevels[0] : undefined,
          isFree: freeOnly || undefined,
          sortPrice: sortBy === 'price-low' ? 'asc' : sortBy === 'rating' ? 'desc' : undefined
        };
        const response = await courseService.GetList(searchParams);
        if (response?.status && response.data) {
          const mapped = (response.data.items || []).map(mapToCatalogItem);
          setCourses(mapped);
          setTotalCourses(response.data.totalCount || 0);
        }
      } catch (err) {
        console.error("Error fetching courses from ES backend:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [search, activeCategory, sortBy, freeOnly, selectedLevels, pageIndex, pageSize, courseService]);

  const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    setSearch(val);
    if (val.trim().length > 1) {
      try {
        const res = await courseService.GetSearchSuggestions(val);
        if (res?.status && res.data) {
          setSuggestions(res.data);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const filteredCourses = useMemo(() => {
    let result = courses;
    if (minRating !== null) {
      result = result.filter((c) => c.rating >= minRating);
    }
    return result;
  }, [courses, minRating]);

  const toggleLevel = (level: string) => {
    setSelectedLevels((current) =>
      current.includes(level)
        ? current.filter((item) => item !== level)
        : [...current, level],
    );
  };

  return (
    <>
      <Box
            sx={{
              pt: { xs: 5, md: 7 },
              pb: { xs: 4, md: 5 },
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 0.96fr) minmax(440px, 1.04fr)' },
              gap: { xs: 4, md: 5 },
              alignItems: 'center',
            }}
          >
            <Box>
              <Chip
                label="Nền tảng học tập chuẩn quốc tế"
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
                  fontSize: { xs: 36, sm: 48, md: 64 },
                  lineHeight: 1.04,
                  letterSpacing: '-1.6px',
                  fontWeight: 900,
                  maxWidth: 680,
                  color: '#1a1a1a',
                }}
              >
                Khám phá hàng trăm
                <br />
                <Box component="span" sx={{ color: '#8B1313' }}>
                  khóa học
                </Box>{' '}
                chất lượng
              </Typography>
              <Typography
                sx={{
                  mt: 2.25,
                  maxWidth: 620,
                  fontSize: 15.5,
                  lineHeight: 1.9,
                  color: 'rgba(24,24,27,0.62)',
                }}
              >
                Học từ chuyên gia hàng đầu và nâng cấp kỹ năng với lộ trình học
                tập được cá nhân hóa, công nghệ hiện đại và cộng đồng học viên dẫn đầu.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.4} sx={{ mt: 3, alignItems: 'stretch', width: '100%' }}>
                <Box sx={{ position: 'relative', width: '100%', maxWidth: 420 }}>
                  <TextFieldAny
                    fullWidth
                    variant="outlined"
                    value={search}
                    onChange={handleSearchChange}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Tìm kiếm khóa học, kỹ năng..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRounded sx={{ color: 'rgba(24,24,27,0.38)' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: 48,
                        bgcolor: '#fff',
                        borderRadius: 2.8,
                        transition: 'box-shadow 160ms ease, border-color 160ms ease',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(17,17,17,0.12)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(127,29,29,0.38)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#7f1d1d',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 0 0 4px rgba(127,29,29,0.12)',
                        },
                      },
                    }}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <Paper
                      elevation={4}
                      sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        mt: 1,
                        maxHeight: 250,
                        overflowY: 'auto',
                        borderRadius: 2,
                        border: '1px solid rgba(17,17,17,0.08)',
                        bgcolor: '#fff',
                      }}
                    >
                      {suggestions.map((suggestion, idx) => (
                        <MenuItem
                          key={idx}
                          onClick={() => {
                            setSearch(suggestion);
                            setShowSuggestions(false);
                          }}
                          sx={{ py: 1.2, px: 2, fontSize: 14.5 }}
                        >
                          <SearchRounded sx={{ fontSize: 16, mr: 1.5, color: 'rgba(24,24,27,0.38)' }} />
                          {suggestion}
                        </MenuItem>
                      ))}
                    </Paper>
                  )}
                </Box>
                <Button
                  variant="contained"
                  sx={{
                    px: 3.2,
                    height: 48,
                    borderRadius: 2.8,
                    background: 'linear-gradient(90deg, #9f1717 0%, #7f1d1d 100%)',
                    boxShadow: '0 8px 20px rgba(127,29,29,0.18)',
                    transition: 'background 160ms ease, box-shadow 160ms ease',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #7f1d1d 0%, #6b1414 100%)',
                      boxShadow: '0 10px 24px rgba(127,29,29,0.24)',
                    },
                  }}
                >
                  Tìm kiếm ngay
                </Button>
              </Stack>
            </Box>

            <Box sx={{ position: 'relative' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
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
                    minHeight: { xs: 270, sm: 340, md: 360 },
                    background:
                      'linear-gradient(135deg, rgba(255,247,240,0.96), rgba(255,240,233,0.94))',
                  }}
                >
                  <Image
                    src="/auth/img/Illustration_Section_v2.png"
                    alt="EduVerse learning space"
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
                  left: { xs: 10, md: 24 },
                  bottom: { xs: 10, md: -16 },
                  px: 2.2,
                  py: 1.5,
                  borderRadius: 2.8,
                  border: '1px solid rgba(17,17,17,0.08)',
                  boxShadow: '0 18px 32px rgba(30,24,26,0.10)',
                  bgcolor: '#fff',
                }}
              >
                <Typography sx={{ fontSize: 24, fontWeight: 900, color: '#8B1313' }}>
                  15K+
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: 'rgba(24,24,27,0.54)' }}>
                  Học viên tham gia học tập
                </Typography>
              </Paper>
            </Box>
          </Box>



          <Box
            sx={{
              py: { xs: 4, md: 6 },
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '300px minmax(0, 1fr)' },
              gap: 2.5,
              alignItems: 'start',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2.8,
                border: '1px solid rgba(17,17,17,0.08)',
                bgcolor: '#fff',
                position: { lg: 'sticky' },
                top: { lg: 100 },
              }}
            >
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography sx={{ fontSize: 22, fontWeight: 900 }}>Bộ lọc</Typography>
                <Button
                  onClick={() => {
                    setActiveCategory('all');
                    setFreeOnly(false);
                    setSelectedLevels([]);
                    setSearch('');
                    setSortBy('newest');
                    setMinRating(null);
                  }}
                  disabled={activeCategory === 'all' && !freeOnly && selectedLevels.length === 0 && search === '' && sortBy === 'newest' && minRating === null}
                  sx={{
                    color: '#8B1313',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&.Mui-disabled': {
                      color: 'rgba(24,24,27,0.3)',
                    },
                  }}
                >
                  Xóa tất cả
                </Button>
              </Stack>

              <Stack spacing={2.5}>
                <FilterGroup title="Danh mục">
                  <Box
                    sx={{
                      maxHeight: '320px',
                      overflowY: 'auto',
                      pr: 1,
                      '&::-webkit-scrollbar': {
                        width: '6px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(139,19,19,0.2)',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: 'rgba(139,19,19,0.4)',
                      },
                    }}
                  >
                    <Stack spacing={1.5}>
                      {categories.map((category) => (
                        <FormControlLabel
                          key={category.value}
                          control={
                            <Checkbox
                              checked={activeCategory === category.value}
                              onChange={() => {
                                if (activeCategory === category.value) {
                                  setActiveCategory('all');
                                } else {
                                  setActiveCategory(category.value);
                                }
                              }}
                              size="small"
                              sx={{
                                color: 'rgba(24,24,27,0.23)',
                                p: 0,
                                mr: 1.5,
                                mt: '2px',
                                '&.Mui-checked': {
                                  color: '#8B1313',
                                },
                              }}
                            />
                          }
                          label={category.label}
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            width: '100%',
                            m: 0,
                            py: 0.5,
                            px: 1,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'background-color 150ms ease',
                            '&:hover': {
                              bgcolor: 'rgba(141, 19, 19, 0.04)',
                            },
                            '& .MuiFormControlLabel-label': {
                              fontSize: 14.5,
                              fontWeight: activeCategory === category.value ? 700 : 500,
                              color: activeCategory === category.value ? '#8B1313' : '#475569',
                              textAlign: 'left',
                              lineHeight: 1.4,
                              userSelect: 'none',
                            },
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </FilterGroup>

                <Divider />

                <FilterGroup title="Giá">
                  <FormControlLabel
                    control={<Switch checked={freeOnly} onChange={(event) => setFreeOnly(event.target.checked)} />}
                    label="Chỉ hiện khóa miễn phí"
                  />
                </FilterGroup>

                <Divider />

                <FilterGroup title="Đánh giá">
                  <Button
                    onClick={() => setMinRating(minRating === 4.5 ? null : 4.5)}
                    sx={{
                      justifyContent: 'flex-start',
                      width: '100%',
                      px: 1.2,
                      py: 0.8,
                      borderRadius: 2.8,
                      color: minRating === 4.5 ? '#8B1313' : 'rgba(24,24,27,0.72)',
                      bgcolor: minRating === 4.5 ? 'rgba(141,19,19,0.06)' : 'transparent',
                      textTransform: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.2,
                      '&:hover': {
                        bgcolor: minRating === 4.5 ? 'rgba(141,19,19,0.1)' : 'rgba(24,24,27,0.04)',
                      },
                    }}
                  >
                    <Rating value={4.5} precision={0.5} readOnly size="small" />
                    <Typography sx={{ fontSize: 13.5, fontWeight: minRating === 4.5 ? 700 : 500 }}>
                      4.5 trở lên
                    </Typography>
                  </Button>
                </FilterGroup>

                <Divider />

                <FilterGroup title="Cấp độ">
                  {['Người mới bắt đầu', 'Trung cấp', 'Nâng cao'].map((level) => {
                    const selected = selectedLevels.includes(level);
                    return (
                      <Button
                        key={level}
                        onClick={() => toggleLevel(level)}
                        sx={{
                          justifyContent: 'flex-start',
                          px: 1.2,
                          py: 1,
                          borderRadius: 2.8,
                          color: selected ? '#8B1313' : 'rgba(24,24,27,0.72)',
                          bgcolor: selected ? 'rgba(141,19,19,0.06)' : 'transparent',
                        }}
                      >
                        {level}
                      </Button>
                    );
                  })}
                </FilterGroup>
              </Stack>
            </Paper>

            <Box>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                sx={{
                  mb: 2.2,
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', md: 'center' },
                  gap: 1.5,
                }}
              >
                <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
                  {filteredCourses.length} khóa học được tìm thấy
                </Typography>
                <Select<CourseSortOption>
                  size="small"
                  value={sortBy}
                  onChange={(event: SelectChangeEvent<CourseSortOption>) =>
                    setSortBy(event.target.value as CourseSortOption)
                  }
                  sx={{ minWidth: 170, borderRadius: 2.8, bgcolor: '#fff' }}
                >
                  <MenuItem value="newest">Mới nhất</MenuItem>
                  <MenuItem value="rating">Đánh giá cao</MenuItem>
                  <MenuItem value="price-low">Giá thấp trước</MenuItem>
                </Select>
              </Stack>



              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
                  gap: 2,
                }}
              >
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </Box>

              {filteredCourses.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    mt: 2,
                    borderRadius: 2.8,
                    border: '1px dashed rgba(17,17,17,0.14)',
                    textAlign: 'center',
                    bgcolor: 'rgba(255,255,255,0.7)',
                  }}
                >
                  <QueryStatsRounded sx={{ fontSize: 34, color: '#8B1313' }} />
                  <Typography sx={{ mt: 1.2, fontSize: 22, fontWeight: 900 }}>
                    Không tìm thấy khóa học
                  </Typography>
                  <Typography sx={{ mt: 0.8, color: 'rgba(24,24,27,0.58)' }}>
                    Hãy thử từ khóa khác hoặc xóa bộ lọc để xem thêm lựa chọn.
                  </Typography>
                </Paper>
              ) : null}
            </Box>
          </Box>
    </>
  );
}

