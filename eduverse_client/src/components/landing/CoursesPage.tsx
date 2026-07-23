'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import KhoaHocService from '@/src/services/KhoaHocService';
import { danhMucService } from '@/src/services/danhmucService';
import {
  ArrowForwardRounded,
  FavoriteBorderRounded,
  QueryStatsRounded,
  SchoolRounded,
  SearchRounded,
  TimerRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Paper,
  Rating,
  Select,
  type SelectChangeEvent,
  Stack,
  TextField,
  Typography,
  Checkbox,
} from '@mui/material';
import {
  type CourseCatalogItem,
  type CourseCategory,
} from './landing-data';
import { CourseVisual } from './landing-shared';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TextFieldAny = TextField as any;

type CourseSortOption = 'newest' | 'price-low' | 'price-high';
type PriceFilter = 'all' | 'free' | 'paid';

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
  const isFree = kh.loaiKhoaHoc === 'Khóa học miễn phí';
  const durationSeconds = Number(kh.tongThoiLuong || 0);
  const durationHours = Math.floor(durationSeconds / 3600);
  const durationMinutes = Math.floor((durationSeconds % 3600) / 60);
  const duration = durationSeconds > 0
    ? `${durationHours > 0 ? `${durationHours} giờ ` : ''}${durationMinutes} phút`.trim()
    : 'Chưa cập nhật';

  return {
    id: kh.id,
    title: kh.tieuDe || 'Khóa học không tên',
    instructor: kh.tenGiangVien || kh.createdBy || 'Chưa cập nhật',
    rating: mockRating,
    students: kh.soLuongHocVien || 0,
    price: isFree ? 'Miễn phí' : kh.gia != null ? `${kh.gia.toLocaleString('vi-VN')}đ` : 'Chưa cập nhật',
    originalPrice: kh.giaGoc && kh.giaGoc > 0 ? `${kh.giaGoc?.toLocaleString('vi-VN')}đ` : '',
    level: kh.capDo || 'Mọi cấp độ',
    duration,
    category: kh.loaiKhoaHoc || 'Khác',
    badge: isFree ? 'Miễn phí' : 'Trả phí',
    tags: [kh.capDo || 'Tự chọn', isFree ? 'Free' : 'Pro'],
    palette: [
      '#8B1313',
      '#c2410c',
      '#fff7f4'
    ],
    isFree
  };
};

export default function CoursesPage({
  initialSearch = '',
}: {
  initialSearch?: string;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [appliedSearch, setAppliedSearch] = useState(initialSearch.trim());
  const [searchRevision, setSearchRevision] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<CourseSortOption>('newest');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const [courses, setCourses] = useState<CourseCatalogItem[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = -1;
  const [loading, setLoading] = useState(false);

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
              value: dm.id,
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
    const controller = new AbortController();

    const fetchCourses = async () => {
      setLoading(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const searchParams: any = {
          pageIndex,
          pageSize,
          keyword: appliedSearch || undefined,
          danhMucId: activeCategory !== 'all' ? activeCategory : undefined,
          capDo: selectedLevel || undefined,
          loaiKhoaHoc: priceFilter === 'free'
            ? 'Khóa học miễn phí'
            : priceFilter === 'paid'
              ? 'Khóa học trả phí'
              : undefined,
          sortPrice: sortBy === 'price-low' ? 'asc' : sortBy === 'price-high' ? 'desc' : undefined
        };
        const response = await courseService.GetList(searchParams, controller.signal);
        if (response?.status && response.data) {
          const mapped = (response.data.items || []).map(mapToCatalogItem);
          setCourses(mapped);
          setTotalCourses(response.data.totalCount || 0);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Error fetching courses from ES backend:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchCourses();
    return () => controller.abort();
  }, [appliedSearch, searchRevision, activeCategory, sortBy, priceFilter, selectedLevel, pageIndex, pageSize, courseService]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const submitSearch = () => {
    setAppliedSearch(search.trim());
    setSearchRevision((current) => current + 1);
    setPageIndex(1);
  };

  const toggleLevel = (level: string) => {
    setSelectedLevel((current) => current === level ? null : level);
    setPageIndex(1);
  };

  const resetFilters = useCallback(() => {
    setActiveCategory('all');
    setPriceFilter('all');
    setSelectedLevel(null);
    setSearch('');
    setAppliedSearch('');
    setSearchRevision((current) => current + 1);
    setSortBy('newest');
    setPageIndex(1);
  }, []);

  useEffect(() => {
    window.addEventListener('eduverse:reset-explore', resetFilters);
    return () => window.removeEventListener('eduverse:reset-explore', resetFilters);
  }, [resetFilters]);

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
                    onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        submitSearch();
                      }
                    }}
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
                </Box>
                <Button
                  variant="contained"
                  onClick={submitSearch}
                  startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
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
                  onClick={resetFilters}
                  disabled={activeCategory === 'all' && priceFilter === 'all' && selectedLevel === null && search === '' && appliedSearch === '' && sortBy === 'newest'}
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
                <FilterGroup title="Chủ đề">
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
                      {(showAllCategories ? categories : categories.slice(0, 6)).map((category) => (
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
                                setPageIndex(1);
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
                      {categories.length > 6 ? (
                        <Button
                          onClick={() => setShowAllCategories((current) => !current)}
                          sx={{
                            alignSelf: 'flex-start',
                            minWidth: 0,
                            px: 1,
                            color: '#8B1313',
                            fontWeight: 800,
                            textTransform: 'none',
                          }}
                        >
                          {showAllCategories ? 'Thu gọn' : `Hiển thị thêm (${categories.length - 6})`}
                        </Button>
                      ) : null}
                    </Stack>
                  </Box>
                </FilterGroup>

                <Divider />

                <FilterGroup title="Giá">
                  {([
                    { value: 'free', label: 'Miễn phí' },
                    { value: 'paid', label: 'Trả phí' },
                  ] as const).map((option) => (
                    <FormControlLabel
                      key={option.value}
                      control={(
                        <Checkbox
                          checked={priceFilter === option.value}
                          onChange={() => {
                            setPriceFilter((current) => current === option.value ? 'all' : option.value);
                            setPageIndex(1);
                          }}
                          size="small"
                          sx={{ color: 'rgba(24,24,27,0.3)', '&.Mui-checked': { color: '#8B1313' } }}
                        />
                      )}
                      label={option.label}
                      sx={{ m: 0, '& .MuiFormControlLabel-label': { fontSize: 14.5, fontWeight: 600 } }}
                    />
                  ))}
                </FilterGroup>



                <Divider />

                <FilterGroup title="Cấp độ">
                  {['Tất cả cấp độ', 'Người mới bắt đầu', 'Trung cấp', 'Nâng cao'].map((level) => {
                    const selected = selectedLevel === level;
                    return (
                      <FormControlLabel
                        key={level}
                        control={(
                          <Checkbox
                            checked={selected}
                            onChange={() => toggleLevel(level)}
                            size="small"
                            sx={{ color: 'rgba(24,24,27,0.3)', '&.Mui-checked': { color: '#8B1313' } }}
                          />
                        )}
                        label={level}
                        sx={{
                          m: 0,
                          color: selected ? '#8B1313' : 'rgba(24,24,27,0.72)',
                          '& .MuiFormControlLabel-label': { fontSize: 14.5, fontWeight: selected ? 800 : 600 },
                        }}
                      />
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
                  {loading ? 'Đang tìm khóa học…' : `${totalCourses} khóa học được tìm thấy`}
                </Typography>
                <Select<CourseSortOption>
                  size="small"
                  value={sortBy}
                  onChange={(event: SelectChangeEvent<CourseSortOption>) =>
                    {
                      setSortBy(event.target.value as CourseSortOption);
                      setPageIndex(1);
                    }
                  }
                  sx={{ minWidth: 170, borderRadius: 2.8, bgcolor: '#fff' }}
                >
                  <MenuItem value="newest">Mới nhất</MenuItem>
                  <MenuItem value="price-low">Giá thấp trước</MenuItem>
                  <MenuItem value="price-high">Giá cao trước</MenuItem>
                </Select>
              </Stack>
              {loading ? (
                <Paper
                  role="status"
                  aria-live="polite"
                  elevation={0}
                  sx={{
                    minHeight: 220,
                    display: 'grid',
                    placeItems: 'center',
                    p: 4,
                    borderRadius: 2.8,
                    border: '1px solid rgba(139,19,19,0.10)',
                    bgcolor: 'rgba(255,255,255,0.82)',
                    boxShadow: '0 16px 36px rgba(60,20,20,0.05)',
                  }}
                >
                  <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', width: 56, height: 56 }}>
                      <CircularProgress
                        variant="determinate"
                        value={100}
                        size={56}
                        thickness={4}
                        sx={{ color: 'rgba(139,19,19,0.12)' }}
                      />
                      <CircularProgress
                        size={56}
                        thickness={4}
                        sx={{ position: 'absolute', inset: 0, color: '#8B1313' }}
                      />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 19, fontWeight: 900, color: '#1f2937' }}>
                        Đang tìm khóa học phù hợp
                      </Typography>
                      <Typography sx={{ mt: 0.6, fontSize: 14, color: 'rgba(24,24,27,0.56)' }}>
                        Vui lòng chờ trong giây lát…
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              ) : courses.length > 0 ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
                    gap: 2,
                  }}
                >
                  {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </Box>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
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
              )}
            </Box>
          </Box>
    </>
  );
}

