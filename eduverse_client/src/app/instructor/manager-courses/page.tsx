/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/static-components */
// src/app/instructor/manager-courses/page.tsx
"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Stack,
  IconButton,
  TextField,
  Tooltip,
  Skeleton,
  Menu,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import SchoolIcon from "@mui/icons-material/School";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import KhoaHocService from "@/src/services/KhoaHocService";
import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import {
  R,
  RedBtn,
  isDraftCourse,
  isCurrentVersion,
  canGuiDuyet,
  canSuaTiep,
  isPendingApproval,
} from "./types/constants";
import { useToast } from "./components/useToast";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { CourseDialog } from "./components/CourseDialog";
import { CourseDetailPanel } from "./components/CourseDetailPanel";
import { CourseListItem } from "./components/CourseListItem";
import { BulkActionBar } from "./components/BulkActionBar";

// Import AuthGuard và StudentDashboardShell
import AuthGuard from "@/src/components/AuthGuard";
import StudentDashboardShell from "@/src/components/dashboard/StudentDashboardShell";
import DashboardShell from "@/src/components/dashboard/DashboardShell";

const khoaHocSvc = new KhoaHocService();

export default function TeacherCourseManager() {
  const { show, ToastComponent } = useToast();

  const [courses, setCourses] = useState<KhoaHocType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<KhoaHocType | null>(null);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<KhoaHocType | null>(null);
  const [confirmDel, setConfirmDel] = useState<KhoaHocType | null>(null);
  const [delLoading, setDelLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{
    el: HTMLElement;
    course: KhoaHocType;
  } | null>(null);
  const [expandedDrafts, setExpandedDrafts] = useState<Record<string, boolean>>(
    {},
  );

  // Tích chọn hàng loạt
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const loadingRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const initialExpandedSetRef = useRef(false);

  const loadCourses = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await khoaHocSvc.GetListForManager({
        pageIndex: 1,
        pageSize: 50,
      });
      const items = (res as { items?: KhoaHocType[] }).items ?? [];
      setCourses(items);

      // Tự động mở rộng bản nháp lần đầu
      if (!initialExpandedSetRef.current && items.length > 0) {
        const newExpanded: Record<string, boolean> = {};
        items.forEach((c: KhoaHocType) => {
          if (isDraftCourse(c) && c.idBanGhiTruoc) {
            newExpanded[c.idBanGhiTruoc] = true;
          }
        });
        setExpandedDrafts(newExpanded);
        initialExpandedSetRef.current = true;
      }

      if (items.length > 0) {
        setSelected((prev) => {
          if (!prev) return items[0];
          const fresh = items.find((c) => c.id === prev.id);
          return fresh ?? items[0];
        });
      } else {
        setSelected(null);
      }
    } catch {
      show("Không thể tải danh sách khóa học", "error");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [show]);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadCourses();
    }
  }, [loadCourses]);

  const updateCourseInList = useCallback((updatedCourse: KhoaHocType) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)),
    );
    setSelected((prev) =>
      prev?.id === updatedCourse.id ? updatedCourse : prev,
    );
  }, []);

  const filtered = useMemo(
    () =>
      courses.filter(
        (c) =>
          !search ||
          (c.tieuDe ?? "").toLowerCase().includes(search.toLowerCase()),
      ),
    [courses, search],
  );

  const { mainRows, draftsByParentId } = useMemo(() => {
    const drafts: Record<string, KhoaHocType[]> = {};
    const mains: KhoaHocType[] = [];

    for (const c of filtered) {
      if (isDraftCourse(c)) {
        const parentId = c.idBanGhiTruoc as string;
        if (parentId) {
          if (!drafts[parentId]) drafts[parentId] = [];
          drafts[parentId].push(c);
        } else {
          mains.push(c);
        }
      } else {
        mains.push(c);
      }
    }
    return { mainRows: mains, draftsByParentId: drafts };
  }, [filtered]);

  const handleDelete = async () => {
    if (!confirmDel) return;
    if (isPendingApproval(confirmDel.trangThaiPheDuyet)) {
      show(
        "Không thể xoá khóa học khi đang ở trạng thái Chờ duyệt / Đang duyệt",
        "error",
      );
      setConfirmDel(null);
      return;
    }
    setDelLoading(true);
    try {
      await khoaHocSvc.DeleteKhoaHoc(confirmDel.id!);
      show("Đã xoá khóa học");
      setConfirmDel(null);
      if (selected?.id === confirmDel.id) setSelected(null);
      loadCourses();
    } catch {
      show("Lỗi khi xoá khóa học", "error");
    } finally {
      setDelLoading(false);
    }
  };

  const handleEdit = (course: KhoaHocType) => {
    setEditCourse(course);
    setDialogOpen(true);
    setMenuAnchor(null);
  };

  const toggleDraftRow = (parentId: string) => {
    setExpandedDrafts((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  };

  // ─── Tích chọn hàng loạt ────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectedCourses = useMemo(
    () => courses.filter((c) => c.id && selectedIds.has(c.id)),
    [courses, selectedIds],
  );
  const approvableSelected = selectedCourses.filter((c) =>
    canGuiDuyet(c.trangThaiPheDuyet),
  );
  const editableSelected = selectedCourses.filter((c) =>
    canSuaTiep(c.trangThaiPheDuyet),
  );

  const runBulkStatusChange = async (
    targets: KhoaHocType[],
    apiCall: (id: string) => Promise<any>,
    successMsg: string,
  ) => {
    if (targets.length === 0 || bulkLoading) return;
    setBulkLoading(true);
    try {
      const results = await Promise.allSettled(
        targets.map((c) => apiCall(c.id!)),
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      const ok = results.length - failed;
      if (ok > 0) show(`${successMsg} (${ok} bản ghi)`);
      if (failed > 0) show(`${failed} bản ghi thao tác thất bại`, "error");
      clearSelection();
      await loadCourses();
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkGuiDuyet = async () => {
    if (approvableSelected.length === 0 || bulkLoading) return;
    setBulkLoading(true);
    try {
      const ids = approvableSelected.map((c) => c.id!);
      const result = await khoaHocSvc.ChuyenTTChoDuyetBatch(ids);
      const data = result.data ?? [];
      const successCount = data.length;
      const failed = ids.length - successCount;
      if (successCount > 0) show(`Đã gửi phê duyệt (${successCount} khóa học)`);
      if (failed > 0) show(`${failed} khóa học thao tác thất bại`, "error");
      clearSelection();
      await loadCourses();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi gửi phê duyệt hàng loạt";
      show(msg, "error");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkSuaTiep = async () => {
    if (editableSelected.length === 0 || bulkLoading) return;
    setBulkLoading(true);
    try {
      const ids = editableSelected.map((c) => c.id!);
      const result = await khoaHocSvc.ChuyenTTDangSuaBatch(ids);
      const data = result.data ?? [];
      const successCount = data.length;
      const failed = ids.length - successCount;
      if (successCount > 0)
        show(`Đã chuyển về Đang sửa (${successCount} khóa học)`);
      if (failed > 0) show(`${failed} khóa học thao tác thất bại`, "error");
      clearSelection();
      await loadCourses();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi sửa tiếp hàng loạt";
      show(msg, "error");
    } finally {
      setBulkLoading(false);
    }
  };

  const stats = useMemo(
    () => ({
      total: courses.length,
      active: courses.filter((c) => c.trangThai === "HoatDong").length,
      pending: courses.filter(
        (c) =>
          c.trangThaiPheDuyet === "ChoDuyet" ||
          c.trangThaiPheDuyet === "DangDuyet",
      ).length,
      draft: courses.filter((c) => c.trangThaiPheDuyet === "DangSua").length,
      current: courses.filter((c) => isCurrentVersion(c)).length,
      draftVersions: courses.filter((c) => isDraftCourse(c)).length,
    }),
    [courses],
  );

  // Component nội dung chính
  const MainContent = () => (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: 22, color: R }}>
            Quản lý khóa học
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#999", mt: 0.25 }}>
            Tạo và quản lý nội dung giảng dạy của bạn
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Tải lại">
            <IconButton
              onClick={loadCourses}
              sx={{ border: "1px solid #fde8e8", borderRadius: 2 }}
            >
              <RefreshIcon sx={{ color: R, fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <RedBtn
            startIcon={<AddIcon />}
            onClick={() => {
              setEditCourse(null);
              setDialogOpen(true);
            }}
          >
            Tạo khóa học
          </RedBtn>
        </Stack>
      </Box>

      {/* Thống kê */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label: "Tổng khóa học",
            val: stats.total,
            color: R,
            bg: alpha(R, 0.08),
          },
          {
            label: "Đang hoạt động",
            val: stats.active,
            color: "#2e7d32",
            bg: "#e8f5e9",
          },
          {
            label: "Chờ / đang duyệt",
            val: stats.pending,
            color: "#e65100",
            bg: "#fff3e0",
          },
          {
            label: "Đang chỉnh sửa",
            val: stats.draft,
            color: "#37474f",
            bg: "#eceff1",
          },
          {
            label: "Bản chính",
            val: stats.current,
            color: "#1565c0",
            bg: "#e3f2fd",
          },
          {
            label: "Bản nháp",
            val: stats.draftVersions,
            color: "#e65100",
            bg: "#fff3e0",
          },
        ].map((s) => (
          <Grid key={s.label} size={{ xs: 6, sm: 4, md: 2 }}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid #f0dada",
                boxShadow: "none",
                bgcolor: "#fff",
              }}
            >
              <Typography
                sx={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: s.color,
                  lineHeight: 1,
                }}
              >
                {s.val}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#999", mt: 0.25 }}>
                {s.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Danh sách và chi tiết khóa học */}
      <Grid container spacing={3}>
        {/* Danh sách khóa học */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              borderRadius: 3,
              border: "1px solid #f0dada",
              overflow: "hidden",
              boxShadow: "none",
            }}
          >
            <Box sx={{ p: 1.5, borderBottom: "1px solid #f5e0e0" }}>
              <BulkActionBar
                selectedCount={selectedIds.size}
                approvableCount={approvableSelected.length}
                editableCount={editableSelected.length}
                onApprove={handleBulkGuiDuyet}
                onContinueEdit={handleBulkSuaTiep}
                onClear={clearSelection}
                loading={bulkLoading}
                itemLabel="khóa học"
              />
              <TextField
                size="small"
                fullWidth
                placeholder="Tìm khóa học…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon
                          sx={{ color: alpha(R, 0.4), fontSize: 18 }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: search ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearch("")}>
                          <ClearIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                    sx: {
                      borderRadius: 2,
                      fontSize: 13,
                      "& fieldset": { borderColor: "#f0dada" },
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ maxHeight: "calc(100vh - 340px)", overflowY: "auto" }}>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Box key={i} sx={{ p: 2, borderBottom: "1px solid #faf0f0" }}>
                    <Skeleton
                      variant="rectangular"
                      height={14}
                      width="70%"
                      sx={{ mb: 1, borderRadius: 1 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      height={10}
                      width="45%"
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                ))
              ) : mainRows.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <SchoolIcon
                    sx={{ fontSize: 40, color: alpha(R, 0.15), mb: 1 }}
                  />
                  <Typography sx={{ fontSize: 13, color: "#bbb" }}>
                    Không tìm thấy khóa học
                  </Typography>
                </Box>
              ) : (
                mainRows.map((c) => {
                  const relatedDrafts = draftsByParentId[c.id!] ?? [];
                  const hasDraftToggle = relatedDrafts.length > 0;
                  const isExpanded = !!expandedDrafts[c.id!];
                  return (
                    <Box key={c.id}>
                      <CourseListItem
                        course={c}
                        isDraft={isDraftCourse(c)}
                        isSelected={selected?.id === c.id}
                        onSelect={() => setSelected(c)}
                        onOpenMenu={(e) =>
                          setMenuAnchor({ el: e.currentTarget, course: c })
                        }
                        hasDraftToggle={hasDraftToggle}
                        draftExpanded={isExpanded}
                        onToggleDraft={() => toggleDraftRow(c.id!)}
                        checked={selectedIds.has(c.id!)}
                        onToggleCheck={() => toggleSelect(c.id!)}
                      />
                      {hasDraftToggle &&
                        isExpanded &&
                        relatedDrafts.map((d) => (
                          <CourseListItem
                            key={d.id}
                            course={d}
                            isDraft
                            checked={selectedIds.has(d.id!)}
                            onToggleCheck={() => toggleSelect(d.id!)}
                            isNestedDraftRow
                            isSelected={selected?.id === d.id}
                            onSelect={() => setSelected(d)}
                            onOpenMenu={(e) =>
                              setMenuAnchor({ el: e.currentTarget, course: d })
                            }
                          />
                        ))}
                    </Box>
                  );
                })
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Chi tiết khóa học */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            sx={{
              borderRadius: 3,
              border: "1px solid #f0dada",
              p: 3,
              boxShadow: "none",
              minHeight: 400,
            }}
          >
            {!selected ? (
              <Box sx={{ textAlign: "center", py: 10 }}>
                <SchoolIcon
                  sx={{ fontSize: 64, color: alpha(R, 0.1), mb: 2 }}
                />
                <Typography sx={{ color: "#bbb", fontSize: 14 }}>
                  Chọn một khóa học để xem nội dung
                </Typography>
              </Box>
            ) : (
              <CourseDetailPanel
                key={selected.id}
                course={selected}
                onRefresh={loadCourses}
                onEdit={() => {
                  setEditCourse(selected);
                  setDialogOpen(true);
                }}
                onCourseUpdate={updateCourseInList}
              />
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Menu Context */}
      <Menu
        open={!!menuAnchor}
        anchorEl={menuAnchor?.el}
        onClose={() => setMenuAnchor(null)}
      >
        <Tooltip
          title={
            menuAnchor && isPendingApproval(menuAnchor.course.trangThaiPheDuyet)
              ? "Không thể chỉnh sửa khi khóa học đang Chờ duyệt / Đang duyệt"
              : ""
          }
        >
          <span>
            <MenuItem
              onClick={() => menuAnchor && handleEdit(menuAnchor.course)}
              disabled={
                !!menuAnchor &&
                isPendingApproval(menuAnchor.course.trangThaiPheDuyet)
              }
            >
              <EditIcon sx={{ fontSize: 16, mr: 1 }} /> Chỉnh sửa thông tin
            </MenuItem>
          </span>
        </Tooltip>
        <Tooltip
          title={
            menuAnchor && isPendingApproval(menuAnchor.course.trangThaiPheDuyet)
              ? "Không thể xoá khi khóa học đang Chờ duyệt / Đang duyệt"
              : ""
          }
        >
          <span>
            <MenuItem
              sx={{ color: R }}
              onClick={() => {
                if (menuAnchor) {
                  setConfirmDel(menuAnchor.course);
                  setMenuAnchor(null);
                }
              }}
              disabled={
                !!menuAnchor &&
                isPendingApproval(menuAnchor.course.trangThaiPheDuyet)
              }
            >
              <DeleteIcon sx={{ fontSize: 16, mr: 1 }} /> Xoá khóa học
            </MenuItem>
          </span>
        </Tooltip>
      </Menu>

      {/* Dialog tạo/sửa khóa học */}
      <CourseDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditCourse(null);
        }}
        onSaved={loadCourses}
        editCourse={editCourse}
      />

      {/* Dialog xác nhận xóa */}
      <ConfirmDialog
        open={!!confirmDel}
        title="Xoá khóa học"
        message={`Bạn chắc chắn muốn xoá "${confirmDel?.tieuDe}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(null)}
        loading={delLoading}
      />

      {/* Toast notifications */}
      {ToastComponent}
    </>
  );

  // Render với AuthGuard và StudentDashboardShell
  return (
    <AuthGuard allowedRoles={["GiaoVien", "Admin"]}>
      <DashboardShell>
        <Paper
          elevation={0}
          sx={{
            p: 4.5,
            borderRadius: "24px",
            border: "1px solid rgba(141,19,19,0.06)",
            bgcolor: "#ffffff",
            boxShadow: "0 10px 30px rgba(141,19,19,0.015)",
          }}
        >
          <MainContent />
        </Paper>
      </DashboardShell>
    </AuthGuard>
  );
}
