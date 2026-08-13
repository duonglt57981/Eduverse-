"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import KiemDuyetService from "@/src/services/KiemDuyetServide";
import {
  NhanVienPheDuyetDto,
  PhanCongKiemDuyetResultDto,
} from "@/src/types/KiemDuyet/Dto/dto";
import { COLORS, FONTS } from "../types/constants";

const service = new KiemDuyetService();
const PAGE_SIZE = 8;
const DEBOUNCE_MS = 350;

type ReviewerFilter = "all" | "idle" | "asc" | "desc";

interface AssignReviewerDialogProps {
  open: boolean;
  courseIds: string[];
  onClose: () => void;
  onAssigned: (result: PhanCongKiemDuyetResultDto) => void;
  onConflict: (message: string) => void;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Không thể hoàn tất yêu cầu. Vui lòng thử lại.";
}

function workloadTone(count: number) {
  if (count === 0) return { label: "Rảnh", color: "success" as const };
  if (count >= 8) return { label: "Tải cao", color: "error" as const };
  return { label: "Đang xử lý", color: "warning" as const };
}

export default function AssignReviewerDialog({
  open,
  courseIds,
  onClose,
  onAssigned,
  onConflict,
}: AssignReviewerDialogProps) {
  const [reviewers, setReviewers] = useState<NhanVienPheDuyetDto[]>([]);
  const [selected, setSelected] = useState<NhanVienPheDuyetDto | null>(null);
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<ReviewerFilter>("all");
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSequence = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setKeyword(keywordInput.trim());
      setPage(1);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [keywordInput]);

  const loadReviewers = useCallback(async () => {
    if (!open) return;
    const sequence = ++requestSequence.current;
    setLoading(true);
    setError(null);
    try {
      const response = await service.GetDanhSachNhanVien({
        keyword: keyword || undefined,
        chuaCoKhoaHoc: filter === "idle" || undefined,
        sapXepTheoSoLuongKhoaHoc:
          filter === "asc" || filter === "desc" ? filter : undefined,
        pageIndex: page,
        pageSize: PAGE_SIZE,
      });
      if (sequence !== requestSequence.current) return;
      if (response.status === false) throw new Error(response.message);
      const paged = response.data;
      setReviewers(paged?.items ?? []);
      setTotalCount(paged?.totalCount ?? 0);
      setTotalPage(Math.max(1, paged?.totalPage ?? 1));
    } catch (loadError) {
      if (sequence !== requestSequence.current) return;
      setReviewers([]);
      setTotalCount(0);
      setTotalPage(1);
      setError(getErrorMessage(loadError));
    } finally {
      if (sequence === requestSequence.current) setLoading(false);
    }
  }, [filter, keyword, open, page]);

  useEffect(() => {
    void loadReviewers();
  }, [loadReviewers]);

  useEffect(() => {
    if (!open) {
      requestSequence.current += 1;
      setSelected(null);
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (submitting || !selected?.userId || courseIds.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await service.PhanKhoaHocKiemDuyet(
        courseIds,
        selected.userId,
      );
      if (response.status === false) throw new Error(response.message);
      onAssigned(response.data);
    } catch (submitError) {
      const message = getErrorMessage(submitError);
      setError(message);
      if (message.includes("vừa được") || message.includes("không còn đủ điều kiện")) {
        onConflict(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 0, sm: "22px" },
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: "100dvh", sm: "88vh" },
            bgcolor: COLORS.paperRaised,
          },
        },
      }}
    >
      <DialogTitle sx={{ px: { xs: 2, sm: 3 }, pt: 3, pb: 1 }}>
        <Typography sx={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 900, color: COLORS.ink }}>
          Chọn chuyên viên kiểm duyệt
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: 13.5, color: COLORS.inkSoft }}>
          Phân công {courseIds.length} khóa học cho một chuyên viên.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, sm: 3 }, pt: "16px !important" }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          <TextField
            size="small"
            fullWidth
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            placeholder="Tìm theo họ tên..."
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: COLORS.inkSoft }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          />
          <Select
            size="small"
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value as ReviewerFilter);
              setPage(1);
            }}
            sx={{ minWidth: { sm: 180 }, borderRadius: "12px" }}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="idle">Chưa có khóa học</MenuItem>
            <MenuItem value="asc">Tải tăng dần</MenuItem>
            <MenuItem value="desc">Tải giảm dần</MenuItem>
          </Select>
        </Stack>

        <Stack direction="row" sx={{ mt: 2, mb: 1, justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: COLORS.inkSoft }}>
            {totalCount} chuyên viên
          </Typography>
          {selected && (
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: COLORS.primary }}>
              Đã chọn: {selected.hoTen}
            </Typography>
          )}
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}

        <Box sx={{ minHeight: 250, border: `1px solid ${COLORS.line}`, borderRadius: "16px", overflow: "hidden" }}>
          {loading ? (
            <Box sx={{ minHeight: 250, display: "grid", placeItems: "center" }}>
              <CircularProgress size={30} sx={{ color: COLORS.primary }} />
            </Box>
          ) : reviewers.length === 0 ? (
            <Stack sx={{ alignItems: "center", justifyContent: "center", minHeight: 250, color: COLORS.inkSoft }}>
              <PersonSearchRoundedIcon sx={{ fontSize: 38, mb: 1, opacity: 0.55 }} />
              <Typography sx={{ fontSize: 14 }}>Không tìm thấy chuyên viên phù hợp.</Typography>
              {error && <Button onClick={() => void loadReviewers()} sx={{ mt: 1 }}>Thử lại</Button>}
            </Stack>
          ) : (
            <List disablePadding>
              {reviewers.map((reviewer) => {
                const isSelected = selected?.userId === reviewer.userId;
                const workload = workloadTone(reviewer.soLuongKhoaHocDuyet);
                return (
                  <ListItemButton
                    key={reviewer.userId}
                    selected={isSelected}
                    onClick={() => setSelected(reviewer)}
                    sx={{
                      gap: 1.5,
                      py: 1.35,
                      borderBottom: `1px solid ${COLORS.line}`,
                      "&:last-child": { borderBottom: 0 },
                      "&.Mui-selected": {
                        bgcolor: alpha(COLORS.primary, 0.08),
                        boxShadow: `inset 3px 0 ${COLORS.primary}`,
                      },
                    }}
                  >
                    <Avatar src={reviewer.anhDaiDien || undefined} alt={reviewer.hoTen} sx={{ width: 44, height: 44, bgcolor: COLORS.primary }}>
                      {reviewer.hoTen?.trim().charAt(0).toUpperCase() || "C"}
                    </Avatar>
                    <ListItemText
                      primary={reviewer.hoTen || "Chuyên viên"}
                      secondary={`${reviewer.role} · ${reviewer.soLuongKhoaHocDuyet} khóa học đang xử lý`}
                      slotProps={{
                        primary: { sx: { fontWeight: 800, color: COLORS.ink, fontSize: 14 } },
                        secondary: { sx: { color: COLORS.inkSoft, fontSize: 12.5, mt: 0.25 } },
                      }}
                    />
                    <Chip size="small" label={workload.label} color={workload.color} variant="outlined" />
                    {isSelected && <CheckCircleRoundedIcon sx={{ color: COLORS.primary }} />}
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </Box>

        {totalPage > 1 && (
          <Stack sx={{ alignItems: "center", mt: 2 }}>
            <Pagination
              page={page}
              count={totalPage}
              onChange={(_, value) => setPage(value)}
              size="small"
              shape="rounded"
              disabled={loading}
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2.5, borderTop: `1px solid ${COLORS.line}` }}>
        <Button onClick={onClose} disabled={submitting} sx={{ color: COLORS.inkSoft, textTransform: "none", fontWeight: 700 }}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={!selected?.userId || courseIds.length === 0 || submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{ bgcolor: COLORS.primary, borderRadius: "11px", px: 2.5, textTransform: "none", fontWeight: 800 }}
        >
          {submitting ? "Đang phân công..." : `Phân công ${courseIds.length} khóa học`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
