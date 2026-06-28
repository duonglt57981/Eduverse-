'use client';

import {
  Paper,
  Grid,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  InputAdornment,
  Stack,
  Typography,
} from '@mui/material';
import { SearchRounded, FilterListRounded } from '@mui/icons-material';
import { CertificateFilters } from '@/src/types/certificate';

interface CertificateFilterProps {
  filters: CertificateFilters;
  onChange: (newFilters: CertificateFilters) => void;
}

export default function CertificateFilter({ filters, onChange }: CertificateFilterProps) {
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...filters,
      keyword: e.target.value,
    });
  };

  const handleStatusChange = (e: any) => {
    onChange({
      ...filters,
      trangThai: e.target.value as string,
    });
  };

  const handleSortChange = (e: any) => {
    onChange({
      ...filters,
      sortBy: e.target.value as string,
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2.8,
        border: '1px solid rgba(17,17,17,0.08)',
        bgcolor: '#fff',
        mb: 3,
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
        <FilterListRounded sx={{ color: '#7f1d1d' }} fontSize="small" />
        <Typography sx={{ fontSize: 16, fontWeight: 900, color: '#19171c', letterSpacing: '-0.2px' }}>
          Bộ lọc & Tìm kiếm
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        {/* Search Input */}
        <Grid size={{ xs: 12, md: 5 }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm chứng chỉ, khóa học..."
            value={filters.keyword}
            onChange={handleKeywordChange}
            variant="outlined"
            size="medium"
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
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': {
                  borderColor: 'rgba(17,17,17,0.12)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(127,29,29,0.30)',
                },
              },
            }}
          />
        </Grid>

        {/* Status Filter */}
        <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
          <FormControl fullWidth>
            <InputLabel id="status-select-label" sx={{ fontSize: 14 }}>Trạng thái</InputLabel>
            <Select
              labelId="status-select-label"
              id="status-select"
              value={filters.trangThai}
              label="Trạng thái"
              onChange={handleStatusChange}
              size="medium"
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(17,17,17,0.12)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(127,29,29,0.30)',
                },
              }}
            >
              <MenuItem value="Tất cả">Tất cả trạng thái</MenuItem>
              <MenuItem value="Hoạt động">Hoạt động</MenuItem>
              <MenuItem value="Đang chờ">Đang chờ duyệt</MenuItem>
              <MenuItem value="Thu hồi">Đã thu hồi</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Sort Dropdown */}
        <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
          <FormControl fullWidth>
            <InputLabel id="sort-select-label" sx={{ fontSize: 14 }}>Sắp xếp theo</InputLabel>
            <Select
              labelId="sort-select-label"
              id="sort-select"
              value={filters.sortBy}
              label="Sắp xếp theo"
              onChange={handleSortChange}
              size="medium"
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(17,17,17,0.12)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(127,29,29,0.30)',
                },
              }}
            >
              <MenuItem value="newest">Ngày cấp: Mới nhất</MenuItem>
              <MenuItem value="oldest">Ngày cấp: Cũ nhất</MenuItem>
              <MenuItem value="highest_score">Điểm: Cao đến thấp</MenuItem>
              <MenuItem value="lowest_score">Điểm: Thấp đến cao</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
}
