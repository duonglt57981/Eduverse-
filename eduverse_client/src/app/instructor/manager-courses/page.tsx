// src/app/instructor/manager-courses/page.tsx
"use client";
import AuthGuard from "@/src/components/AuthGuard";
import DashboardShell from "@/src/components/dashboard/DashboardShell";

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
  PageWrap,
  RedBtn,
  isDraftCourse,
  isCurrentVersion,
} from "./types/constants";
import { useToast } from "./components/useToast";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { CourseDialog } from "./components/CourseDialog";
import { CourseDetailPanel } from "./components/CourseDetailPanel";
import { CourseListItem } from "./components/CourseListItem";

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
      const items = (res as any).items ?? [];
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
        setSelected((prev) => prev ?? items[0]);
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

  // 🔥 Hàm cập nhật khóa học trong danh sách realtime
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

  return (
    <AuthGuard allowedRoles={["GiaoVien"]}>
      <DashboardShell>
        <PageWrap>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
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
        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Tải lại">
            <IconButton
              onClick={loadCourses}
              sx={{ 
                border: "1.5px solid rgba(141, 19, 19, 0.15)", 
                borderRadius: 3,
                bgcolor: "#fff",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "rgba(141, 19, 19, 0.04)",
                  borderColor: R,
                }
              }}
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
                p: 2.25,
                borderRadius: "8px",
                border: "1px solid rgba(141, 19, 19, 0.08)",
                borderLeft: `4px solid ${s.color}`,
                boxShadow: "0 2px 8px rgba(141, 19, 19, 0.01)",
                bgcolor: "#fff",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(141, 19, 19, 0.03)",
                  borderColor: alpha(s.color, 0.3),
                }
              }}
            >
              <Typography
                sx={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: s.color,
                  lineHeight: 1.1,
                }}
              >
                {s.val}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#777", mt: 0.5, fontWeight: 500 }}>
                {s.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              borderRadius: "8px",
              border: "1px solid rgba(141, 19, 19, 0.08)",
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(141, 19, 19, 0.01)",
              bgcolor: "#fff",
            }}
          >
            <Box sx={{ p: 2, borderBottom: "1px solid rgba(141, 19, 19, 0.06)", bgcolor: "#faf9f6" }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Tìm kiếm khóa học..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon
                          sx={{ color: "rgba(141, 19, 19, 0.5)", fontSize: 18 }}
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
                      borderRadius: "6px",
                      fontSize: 13,
                      bgcolor: "#ffffff",
                      transition: "all 0.2s ease",
                      "& fieldset": { borderColor: "rgba(141, 19, 19, 0.12)" },
                      "&:hover fieldset": { borderColor: "rgba(141, 19, 19, 0.3)" },
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 3px rgba(141, 19, 19, 0.04)",
                      },
                      "&.Mui-focused fieldset": { borderColor: R },
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
                      />
                      {hasDraftToggle &&
                        isExpanded &&
                        relatedDrafts.map((d) => (
                          <CourseListItem
                            key={d.id}
                            course={d}
                            isDraft
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

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            sx={{
              borderRadius: "8px",
              border: "1px solid rgba(141, 19, 19, 0.08)",
              p: 3.5,
              boxShadow: "0 4px 20px rgba(141, 19, 19, 0.01)",
              minHeight: 450,
              bgcolor: "#fff",
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

      <Menu
        open={!!menuAnchor}
        anchorEl={menuAnchor?.el}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => menuAnchor && handleEdit(menuAnchor.course)}>
          <EditIcon sx={{ fontSize: 16, mr: 1 }} /> Chỉnh sửa thông tin
        </MenuItem>
        <MenuItem
          sx={{ color: R }}
          onClick={() => {
            if (menuAnchor) {
              setConfirmDel(menuAnchor.course);
              setMenuAnchor(null);
            }
          }}
        >
          <DeleteIcon sx={{ fontSize: 16, mr: 1 }} /> Xoá khóa học
        </MenuItem>
      </Menu>

      <CourseDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditCourse(null);
        }}
        onSaved={loadCourses}
        editCourse={editCourse}
      />

      <ConfirmDialog
        open={!!confirmDel}
        title="Xoá khóa học"
        message={`Bạn chắc chắn muốn xoá "${confirmDel?.tieuDe}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(null)}
        loading={delLoading}
      />

      {ToastComponent}
    </PageWrap>
      </DashboardShell>
    </AuthGuard>
  );
}
