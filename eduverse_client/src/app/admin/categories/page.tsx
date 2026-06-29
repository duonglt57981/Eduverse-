'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/src/components/AuthGuard';
import DashboardShell from '@/src/components/dashboard/DashboardShell';
import { danhMucService } from '@/src/services/danhmucService';
import Swal from 'sweetalert2';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  SearchRounded,
  AddRounded,
  EditRounded,
  DeleteRounded,
  RefreshRounded,
  CategoryRounded,
  FolderOpenRounded,
  CheckCircleRounded,
  TrendingUpRounded,
  SchoolRounded,
  VisibilityRounded,
  FilterListRounded,
} from '@mui/icons-material';

// Cohesive Crimson color palette matching the Eduverse platform
const COLORS = {
  primary: '#8D1313',       // Crimson Red
  primaryLight: '#B91C1C',  // Light Crimson
  primaryDark: '#7F1D1D',   // Dark Crimson
  primaryBgLight: '#FFF5F5',// Extra light pink/red background
  bgLight: '#FFF8F6',       // Premium cream-rose background
  white: '#FFFFFF',
  textDark: '#1E293B',      // Slate 800
  textSecondary: '#64748B', // Slate 500
  green: '#10B981',         // Active state emerald
  greenBg: '#ECFDF5',
  orange: '#F59E0B',        // Warning/key gold
  orangeBg: '#FFFBEB',
  red: '#EF4444',           // Error red
  redBg: '#FEF2F2',
  blue: '#3B82F6',
  blueBg: '#EFF6FF',
  purple: '#8B5CF6',
  purpleBg: '#F5F3FF',
};

interface CategoryItem {
  id: string;
  tenDanhMuc: string;
  ngayTao: string | null;
  trangThai: string | null;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<CategoryItem | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await danhMucService.getList({
        keyword: search || undefined,
        pageIndex,
        pageSize,
      });
      if (res.status && res.data) {
        setCategories(res.data.items || []);
        setTotalItems(res.data.totalCount || 0);
        setTotalPages(res.data.totalPage || 1);
      } else {
        setCategories([]);
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi tải dữ liệu',
        text: 'Không thể kết nối đến API',
        confirmButtonColor: COLORS.primary,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [pageIndex]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPageIndex(1);
    fetchCategories();
  };

  // Open Add dialog
  const openAddDialog = () => {
    setDialogMode('add');
    setEditingId(null);
    setCategoryName('');
    setDialogOpen(true);
  };

  // Open Edit dialog
  const openEditDialog = (cat: CategoryItem) => {
    setDialogMode('edit');
    setEditingId(cat.id);
    setCategoryName(cat.tenDanhMuc);
    setDialogOpen(true);
  };

  // Open Detail dialog
  const openDetailDialog = (cat: CategoryItem) => {
    setDetailItem(cat);
    setDetailOpen(true);
  };

  // Submit Add/Edit
  const handleSubmitForm = async () => {
    if (!categoryName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Tên danh mục không được để trống',
        confirmButtonColor: COLORS.primary,
      });
      return;
    }

    setLoading(true);
    try {
      let res;
      if (dialogMode === 'add') {
        res = await danhMucService.create({ tenDanhMuc: categoryName.trim() });
      } else {
        res = await danhMucService.update({ id: editingId!, tenDanhMuc: categoryName.trim() });
      }
      if (res.status) {
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: dialogMode === 'add' ? 'Thêm danh mục mới thành công!' : 'Cập nhật danh mục thành công!',
          confirmButtonColor: COLORS.primary,
          timer: 2000,
          showConfirmButton: false,
        });
        setDialogOpen(false);
        fetchCategories();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: res.message || 'Thao tác thất bại',
          confirmButtonColor: COLORS.primary,
        });
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi hệ thống',
        text: 'Không thể kết nối đến máy chủ',
        confirmButtonColor: COLORS.primary,
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const handleDelete = async (cat: CategoryItem) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa',
      html: `Bạn có chắc muốn xóa danh mục <b>"${cat.tenDanhMuc}"</b>?<br/><span style="color:#64748B;font-size:13px;">Các khóa học thuộc danh mục này có thể bị ảnh hưởng.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: COLORS.red,
      cancelButtonColor: COLORS.textSecondary,
      confirmButtonText: 'Xóa danh mục',
      cancelButtonText: 'Hủy bỏ',
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const res = await danhMucService.delete(cat.id);
        if (res.status) {
          Swal.fire({
            icon: 'success',
            title: 'Đã xóa!',
            text: 'Danh mục đã được xóa thành công.',
            confirmButtonColor: COLORS.primary,
            timer: 2000,
            showConfirmButton: false,
          });
          fetchCategories();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: res.message || 'Xóa danh mục thất bại',
            confirmButtonColor: COLORS.primary,
          });
        }
      } catch (err) {
        console.error(err);
        Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể kết nối đến API', confirmButtonColor: COLORS.primary });
      } finally {
        setLoading(false);
      }
    }
  };

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Stats
  const totalCount = totalItems || categories.length;
  const activeCount = categories.filter(c => c.trangThai === 'Active' || !c.trangThai).length;
  const inactiveCount = categories.filter(c => c.trangThai === 'Inactive').length;

  // Generate category prefix (first 2 letters)
  const getPrefix = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Category prefix chip colors
  const prefixColors = [
    { bg: '#FEE2E2', color: '#991B1B' },
    { bg: '#DBEAFE', color: '#1E40AF' },
    { bg: '#D1FAE5', color: '#065F46' },
    { bg: '#EDE9FE', color: '#5B21B6' },
    { bg: '#FEF3C7', color: '#92400E' },
    { bg: '#FCE7F3', color: '#9D174D' },
    { bg: '#E0E7FF', color: '#3730A3' },
    { bg: '#CCFBF1', color: '#115E59' },
  ];

  const getPrefixColor = (index: number) => prefixColors[index % prefixColors.length];

  return (
    <AuthGuard allowedRoles={['Admin']}>
      <DashboardShell>
        <Box sx={{ p: 4, bgcolor: COLORS.bgLight, minHeight: '100%' }}>

          {/* Header */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4, gap: 2 }}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 850, color: COLORS.primary, mb: 1, letterSpacing: '-0.75px' }}>
                Quản lý danh mục
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontWeight: 500 }}>
                Tạo, chỉnh sửa và quản lý danh mục phân loại khóa học trong hệ thống EduVerse.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={openAddDialog}
              sx={{
                bgcolor: COLORS.primary,
                borderRadius: '50px',
                px: 3,
                py: 1.25,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: 14,
                boxShadow: '0 8px 24px rgba(141,19,19,0.25)',
                transition: 'all 200ms ease',
                '&:hover': {
                  bgcolor: COLORS.primaryDark,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(141,19,19,0.35)',
                },
              }}
            >
              Thêm danh mục
            </Button>
          </Stack>

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ width: '100%', m: 0, mb: 4 }}>

            {/* Card 1: Total Categories */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '24px',
                  border: '1px solid rgba(141,19,19,0.06)',
                  bgcolor: COLORS.white,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                }}
              >
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '16px',
                      bgcolor: COLORS.redBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CategoryRounded sx={{ color: COLORS.primary, fontSize: 24 }} />
                  </Box>
                  <Chip
                    label="Tổng"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(141,19,19,0.08)',
                      color: COLORS.primary,
                      fontWeight: 800,
                      fontSize: 11,
                      borderRadius: '10px',
                    }}
                  />
                </Stack>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                  Tổng danh mục
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.textDark, lineHeight: 1.1, fontSize: '2rem' }}>
                  {totalCount}
                </Typography>
              </Paper>
            </Grid>

            {/* Card 2: Active */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '24px',
                  border: '1px solid rgba(141,19,19,0.06)',
                  bgcolor: COLORS.white,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                }}
              >
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '16px',
                      bgcolor: COLORS.greenBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircleRounded sx={{ color: COLORS.green, fontSize: 24 }} />
                  </Box>
                  <Chip
                    label="Ổn định"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(16,185,129,0.1)',
                      color: COLORS.green,
                      fontWeight: 800,
                      fontSize: 11,
                      borderRadius: '10px',
                    }}
                  />
                </Stack>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                  Đang hoạt động
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.textDark, lineHeight: 1.1, fontSize: '2rem' }}>
                  {activeCount}
                </Typography>
              </Paper>
            </Grid>

            {/* Card 3: Inactive */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '24px',
                  border: '1px solid rgba(141,19,19,0.06)',
                  bgcolor: COLORS.white,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                }}
              >
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '16px',
                      bgcolor: COLORS.orangeBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FolderOpenRounded sx={{ color: COLORS.orange, fontSize: 24 }} />
                  </Box>
                  <Chip
                    label="Cần duyệt"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(245,158,11,0.1)',
                      color: COLORS.orange,
                      fontWeight: 800,
                      fontSize: 11,
                      borderRadius: '10px',
                    }}
                  />
                </Stack>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                  Tạm ẩn
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.textDark, lineHeight: 1.1, fontSize: '2rem' }}>
                  {inactiveCount}
                </Typography>
              </Paper>
            </Grid>

            {/* Card 4: Courses Linked */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '24px',
                  border: '1px solid rgba(141,19,19,0.06)',
                  bgcolor: COLORS.white,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                }}
              >
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '16px',
                      bgcolor: COLORS.purpleBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SchoolRounded sx={{ color: COLORS.purple, fontSize: 24 }} />
                  </Box>
                  <Chip
                    label="Liên kết"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(139,92,246,0.1)',
                      color: COLORS.purple,
                      fontWeight: 800,
                      fontSize: 11,
                      borderRadius: '10px',
                    }}
                  />
                </Stack>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                  Khóa học liên kết
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.textDark, lineHeight: 1.1, fontSize: '2rem' }}>
                  —
                </Typography>
              </Paper>
            </Grid>

          </Grid>

          {/* Main Table Card */}
          <Card
            elevation={0}
            sx={{
              borderRadius: '24px',
              border: '1px solid rgba(141,19,19,0.06)',
              overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
            }}
          >
            {/* Card Header with Search & Filters */}
            <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between">
                <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.textDark, fontSize: 17 }}>
                  Danh sách danh mục
                </Typography>

                <Stack direction="row" spacing={1.5} alignItems="center">
                  {/* Search */}
                  <form onSubmit={handleSearchSubmit} style={{ display: 'flex' }}>
                    <TextField
                      placeholder="Tìm kiếm..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      size="small"
                      sx={{
                        width: 220,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '14px',
                          bgcolor: '#F8FAFC',
                          height: 42,
                          '& fieldset': { borderColor: '#E2E8F0' },
                          '&:hover fieldset': { borderColor: COLORS.primary },
                          '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1.5 },
                        },
                        '& .MuiInputBase-input': { fontSize: 13.5, fontWeight: 500 },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchRounded sx={{ color: COLORS.textSecondary, fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </form>

                  {/* Filter button */}
                  <Tooltip title="Bộ lọc">
                    <IconButton
                      sx={{
                        border: '1px solid #E2E8F0',
                        borderRadius: '14px',
                        width: 42,
                        height: 42,
                        '&:hover': { bgcolor: COLORS.primaryBgLight },
                      }}
                    >
                      <FilterListRounded sx={{ color: COLORS.textSecondary, fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>

                  {/* Refresh button */}
                  <Tooltip title="Làm mới dữ liệu">
                    <IconButton
                      onClick={() => { setSearch(''); setPageIndex(1); fetchCategories(); }}
                      sx={{
                        border: '1px solid #E2E8F0',
                        borderRadius: '14px',
                        width: 42,
                        height: 42,
                        '&:hover': { bgcolor: COLORS.primaryBgLight },
                      }}
                    >
                      <RefreshRounded sx={{ color: COLORS.textSecondary, fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Box>

            {/* Table */}
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: COLORS.textSecondary, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, pl: 3 }}>
                      Tên danh mục
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: COLORS.textSecondary, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>
                      Trạng thái
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: COLORS.textSecondary, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>
                      Ngày tạo
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: COLORS.textSecondary, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, pr: 3 }}>
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <CircularProgress size={32} sx={{ color: COLORS.primary }} />
                        <Typography sx={{ mt: 2, color: COLORS.textSecondary, fontSize: 14 }}>
                          Đang tải dữ liệu...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <FolderOpenRounded sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
                        <Typography sx={{ color: COLORS.textSecondary, fontWeight: 600, fontSize: 14 }}>
                          Chưa có danh mục nào
                        </Typography>
                        <Typography sx={{ color: '#94A3B8', fontSize: 13, mt: 0.5 }}>
                          Nhấn &quot;Thêm danh mục&quot; để tạo danh mục đầu tiên.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((cat, idx) => {
                      const pc = getPrefixColor(idx);
                      const isActive = cat.trangThai === 'Active' || !cat.trangThai;
                      return (
                        <TableRow
                          key={cat.id}
                          sx={{
                            transition: 'all 150ms ease',
                            '&:hover': { bgcolor: COLORS.primaryBgLight },
                            '&:last-child td': { borderBottom: 'none' },
                          }}
                        >
                          {/* Category Name with prefix chip */}
                          <TableCell sx={{ py: 2.5, pl: 3 }}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '12px',
                                  bgcolor: pc.bg,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <Typography sx={{ fontWeight: 900, fontSize: 13, color: pc.color, letterSpacing: '0.5px' }}>
                                  {getPrefix(cat.tenDanhMuc)}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography sx={{ fontWeight: 700, color: COLORS.textDark, fontSize: 14.5 }}>
                                  {cat.tenDanhMuc}
                                </Typography>
                                <Typography sx={{ color: COLORS.textSecondary, fontSize: 12, mt: 0.25 }}>
                                  Phân loại khóa học
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>

                          {/* Status */}
                          <TableCell sx={{ py: 2.5 }}>
                            <Chip
                              label={isActive ? 'Hoạt động' : 'Tạm ẩn'}
                              size="small"
                              icon={
                                <Box
                                  sx={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: '50%',
                                    bgcolor: isActive ? COLORS.green : COLORS.orange,
                                    ml: 1,
                                  }}
                                />
                              }
                              sx={{
                                bgcolor: isActive ? COLORS.greenBg : COLORS.orangeBg,
                                color: isActive ? '#065F46' : '#92400E',
                                fontWeight: 700,
                                fontSize: 12.5,
                                borderRadius: '10px',
                                pl: 0.5,
                              }}
                            />
                          </TableCell>

                          {/* Created Date */}
                          <TableCell sx={{ py: 2.5 }}>
                            <Typography sx={{ color: COLORS.textSecondary, fontSize: 13.5, fontWeight: 500 }}>
                              {formatDate(cat.ngayTao)}
                            </Typography>
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="center" sx={{ py: 2.5, pr: 3 }}>
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <Tooltip title="Xem chi tiết">
                                <IconButton
                                  size="small"
                                  onClick={() => openDetailDialog(cat)}
                                  sx={{
                                    color: COLORS.blue,
                                    bgcolor: COLORS.blueBg,
                                    borderRadius: '10px',
                                    width: 34,
                                    height: 34,
                                    '&:hover': { bgcolor: '#DBEAFE' },
                                  }}
                                >
                                  <VisibilityRounded sx={{ fontSize: 17 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Chỉnh sửa">
                                <IconButton
                                  size="small"
                                  onClick={() => openEditDialog(cat)}
                                  sx={{
                                    color: COLORS.primary,
                                    bgcolor: COLORS.primaryBgLight,
                                    borderRadius: '10px',
                                    width: 34,
                                    height: 34,
                                    '&:hover': { bgcolor: '#FFE4E6' },
                                  }}
                                >
                                  <EditRounded sx={{ fontSize: 17 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(cat)}
                                  sx={{
                                    color: COLORS.red,
                                    bgcolor: COLORS.redBg,
                                    borderRadius: '10px',
                                    width: 34,
                                    height: 34,
                                    '&:hover': { bgcolor: '#FECACA' },
                                  }}
                                >
                                  <DeleteRounded sx={{ fontSize: 17 }} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderTop: '1px solid #F1F5F9' }}>
                <Typography sx={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: 500 }}>
                  Hiển thị {categories.length} / {totalItems} danh mục
                </Typography>
                <Pagination
                  count={totalPages}
                  page={pageIndex}
                  onChange={(_, v) => setPageIndex(v)}
                  color="standard"
                  shape="rounded"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontWeight: 600,
                      borderRadius: '12px',
                      '&.Mui-selected': {
                        bgcolor: COLORS.primary,
                        color: COLORS.white,
                        '&:hover': { bgcolor: COLORS.primaryDark },
                      },
                    },
                  }}
                />
              </Box>
            )}
          </Card>

          {/* Add/Edit Dialog */}
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '24px',
                p: 1,
              },
            }}
          >
            <DialogTitle sx={{ fontWeight: 800, color: COLORS.textDark, fontSize: 20, pb: 1 }}>
              {dialogMode === 'add' ? '✦ Thêm danh mục mới' : '✎ Chỉnh sửa danh mục'}
            </DialogTitle>
            <DialogContent>
              <Typography sx={{ color: COLORS.textSecondary, fontSize: 13.5, mb: 3 }}>
                {dialogMode === 'add'
                  ? 'Tạo danh mục mới để phân loại khóa học trên nền tảng EduVerse.'
                  : 'Cập nhật tên danh mục. Các khóa học thuộc danh mục sẽ tự động được cập nhật.'}
              </Typography>

              <Typography sx={{ fontWeight: 700, color: COLORS.textDark, fontSize: 13.5, mb: 1 }}>
                Tên danh mục
              </Typography>
              <TextField
                fullWidth
                placeholder="Nhập tên danh mục (VD: Trí tuệ Nhân tạo)"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitForm(); }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    height: 48,
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: COLORS.primary },
                    '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 2 },
                  },
                  '& .MuiInputBase-input': { fontSize: 14, fontWeight: 500 },
                }}
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
              <Button
                onClick={() => setDialogOpen(false)}
                sx={{
                  borderRadius: '14px',
                  px: 3,
                  py: 1,
                  color: COLORS.textSecondary,
                  fontWeight: 700,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#F1F5F9' },
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmitForm}
                disabled={loading}
                sx={{
                  bgcolor: COLORS.primary,
                  borderRadius: '14px',
                  px: 3,
                  py: 1,
                  fontWeight: 700,
                  textTransform: 'none',
                  boxShadow: '0 4px 16px rgba(141,19,19,0.3)',
                  '&:hover': { bgcolor: COLORS.primaryDark },
                  '&.Mui-disabled': { bgcolor: '#D1D5DB' },
                }}
              >
                {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : (dialogMode === 'add' ? 'Thêm mới' : 'Cập nhật')}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Detail Dialog */}
          <Dialog
            open={detailOpen}
            onClose={() => setDetailOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '24px',
                p: 1,
              },
            }}
          >
            <DialogTitle sx={{ fontWeight: 800, color: COLORS.textDark, fontSize: 20, pb: 1 }}>
              Chi tiết danh mục
            </DialogTitle>
            <DialogContent>
              {detailItem && (
                <Box>
                  <Stack spacing={3} sx={{ mt: 1 }}>
                    {/* Category Name Card */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: '16px',
                        bgcolor: COLORS.primaryBgLight,
                        border: `1px solid rgba(141,19,19,0.08)`,
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: '16px',
                            bgcolor: COLORS.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography sx={{ fontWeight: 900, fontSize: 18, color: '#fff' }}>
                            {getPrefix(detailItem.tenDanhMuc)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 800, color: COLORS.textDark, fontSize: 18 }}>
                            {detailItem.tenDanhMuc}
                          </Typography>
                          <Typography sx={{ color: COLORS.textSecondary, fontSize: 13 }}>
                            Danh mục phân loại khóa học
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>

                    {/* Info Grid */}
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <Typography sx={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>
                          ID
                        </Typography>
                        <Typography sx={{ color: COLORS.textDark, fontSize: 13, fontWeight: 500, wordBreak: 'break-all' }}>
                          {detailItem.id}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography sx={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>
                          Trạng thái
                        </Typography>
                        <Chip
                          label={detailItem.trangThai === 'Active' || !detailItem.trangThai ? 'Hoạt động' : 'Tạm ẩn'}
                          size="small"
                          sx={{
                            bgcolor: (detailItem.trangThai === 'Active' || !detailItem.trangThai) ? COLORS.greenBg : COLORS.orangeBg,
                            color: (detailItem.trangThai === 'Active' || !detailItem.trangThai) ? '#065F46' : '#92400E',
                            fontWeight: 700,
                            fontSize: 12,
                            borderRadius: '10px',
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography sx={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>
                          Ngày tạo
                        </Typography>
                        <Typography sx={{ color: COLORS.textDark, fontSize: 13.5, fontWeight: 500 }}>
                          {formatDate(detailItem.ngayTao)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Stack>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
              <Button
                onClick={() => setDetailOpen(false)}
                sx={{
                  borderRadius: '14px',
                  px: 3,
                  py: 1,
                  color: COLORS.textSecondary,
                  fontWeight: 700,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#F1F5F9' },
                }}
              >
                Đóng
              </Button>
              {detailItem && (
                <Button
                  variant="contained"
                  onClick={() => { setDetailOpen(false); openEditDialog(detailItem); }}
                  startIcon={<EditRounded />}
                  sx={{
                    bgcolor: COLORS.primary,
                    borderRadius: '14px',
                    px: 3,
                    py: 1,
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': { bgcolor: COLORS.primaryDark },
                  }}
                >
                  Chỉnh sửa
                </Button>
              )}
            </DialogActions>
          </Dialog>

        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}
