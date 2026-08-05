/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Box,
  Stack,
  Typography,
  Grid,
  Paper,
  Card,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  CircularProgress,
  Chip,
  Switch,
  CardContent,
} from "@mui/material";
import {
  SearchRounded,
  AddRounded,
  EditRounded,
  DeleteRounded,
  RefreshRounded,
  PeopleAltRounded,
  ShieldRounded,
  VpnKeyRounded,
  AssignmentIndRounded,
  FilterListRounded,
  GetAppRounded,
  LockRounded,
  CheckCircleRounded,
  RadioButtonUncheckedRounded,
  MenuBookRounded,
  CategoryRounded,
  FactCheckRounded,
  PaymentRounded,
  SettingsRounded,
} from "@mui/icons-material";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import AuthGuard from "@/src/components/AuthGuard";
import { apiService } from "@/src/services/index";
import Swal from "sweetalert2";
import { BRAND, NEUTRAL, STATUS, CSSVAR } from "@/src/theme/tokens";

// Premium color tokens based on the EduVerse design
const COLORS = {
  primary: BRAND.main,
  primaryLight: STATUS.errorDark,
  primaryBgLight: BRAND.light,
  bgLight: NEUTRAL.bg,
  white: NEUTRAL.paper,
  textDark: NEUTRAL.textPrimary,
  textSecondary: NEUTRAL.textSecondary,
  green: STATUS.success,
  greenBg: STATUS.successSoft,
  orange: STATUS.warning,
  orangeBg: STATUS.warningSoft,
  red: STATUS.error,
  redBg: STATUS.errorSoft,
  blue: STATUS.info,
  blueBg: STATUS.infoSoft,
  greyBorder: NEUTRAL.divider,
  greyLight: CSSVAR.paperAlt,
};

interface RoleItem {
  id: string;
  name: string;
  displayName: string;
  prefix: string;
  description: string;
  createdDate: string;
  userCount: number;
  permissionCount: string;
}

interface RoleStats {
  totalRoles: number;
  totalUsersAssigned: number;
  mostPopularRole: string;
}

// ===== Cấu hình quyền hạn (data-driven). Backend lưu mỗi mã quyền dưới dạng role-claim =====
interface PermissionItem {
  label: string;
  code: string;
  desc?: string;
}
interface PermissionGroup {
  title: string;
  icon: typeof PeopleAltRounded;
  permissions: PermissionItem[];
}
const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    title: "Quản lý người dùng",
    icon: PeopleAltRounded,
    permissions: [
      { label: "Xem người dùng", code: "User.View", desc: "Xem danh sách và hồ sơ chi tiết" },
      { label: "Chỉnh sửa thông tin", code: "User.Edit", desc: "Cập nhật dữ liệu người dùng" },
      { label: "Xóa người dùng", code: "User.Delete", desc: "Vô hiệu hóa hoặc xóa tài khoản" },
    ],
  },
  {
    title: "Quản lý khóa học",
    icon: MenuBookRounded,
    permissions: [
      { label: "Xem khóa học", code: "Course.View" },
      { label: "Tạo mới", code: "Course.Create" },
      { label: "Sửa nội dung", code: "Course.Edit" },
      { label: "Xóa khóa học", code: "Course.Delete" },
    ],
  },
  {
    title: "Quản lý danh mục",
    icon: CategoryRounded,
    permissions: [
      { label: "Xem danh mục", code: "Category.View" },
      { label: "Tạo / Sửa danh mục", code: "Category.Manage" },
      { label: "Xóa danh mục", code: "Category.Delete" },
    ],
  },
  {
    title: "Kiểm duyệt nội dung",
    icon: FactCheckRounded,
    permissions: [
      { label: "Duyệt khóa học", code: "Course.Approve" },
      { label: "Quản lý bài kiểm tra", code: "Test.Manage" },
    ],
  },
  {
    title: "Tài chính",
    icon: PaymentRounded,
    permissions: [
      { label: "Xem thanh toán", code: "Payment.View" },
      { label: "Duyệt rút tiền", code: "Withdrawal.Approve" },
    ],
  },
  {
    title: "Hệ thống & Vai trò",
    icon: SettingsRounded,
    permissions: [
      { label: "Quản lý vai trò & quyền", code: "Role.Manage" },
      { label: "Cấu hình hệ thống", code: "System.Settings" },
    ],
  },
];
const TOTAL_PERMISSIONS = PERMISSION_GROUPS.reduce(
  (sum, g) => sum + g.permissions.length,
  0,
);

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [allRoles, setAllRoles] = useState<RoleItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Statistics states
  const [stats, setStats] = useState<RoleStats>({
    totalRoles: 0,
    totalUsersAssigned: 0,
    mostPopularRole: "Chưa có",
  });

  // Selected role for permissions matrix
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [savingPermissions, setSavingPermissions] = useState(false);

  // Dialog Add/Edit states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleName, setRoleName] = useState("");

  const fetchRoles = async (autoSelectId?: string) => {
    setLoading(true);
    try {
      const response = await apiService.get<any>("/roles");
      if (response.status && response.data) {
        const fetchedItems = response.data.items || [];
        setAllRoles(fetchedItems);
        setRoles(fetchedItems);
        if (response.data.statistics) {
          setStats(response.data.statistics);
        }

        // Set default selected role
        if (fetchedItems.length > 0) {
          const toSelect = autoSelectId
            ? fetchedItems.find((r: any) => r.id === autoSelectId) ||
              fetchedItems[0]
            : fetchedItems[0];
          setSelectedRole(toSelect);
          fetchRolePermissions(toSelect.id);
        } else {
          setSelectedRole(null);
        }
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Lỗi tải dữ liệu",
        text: "Không thể kết nối với máy chủ Backend",
        confirmButtonColor: COLORS.primary,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async (roleId: string) => {
    try {
      const res = await apiService.get<any>(`/roles/${roleId}/permissions`);
      if (res.status && res.data) {
        setPermissions(res.data);
      } else {
        setPermissions([]);
      }
    } catch (err) {
      console.error(err);
      setPermissions([]);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRoles();
  }, []);

  const handleSelectRole = (role: RoleItem) => {
    setSelectedRole(role);
    fetchRolePermissions(role.id);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      if (!search.trim()) {
        setRoles(allRoles);
      } else {
        const query = search.toLowerCase().trim();
        setRoles(
          allRoles.filter(
            (r) =>
              r.displayName.toLowerCase().includes(query) ||
              r.name.toLowerCase().includes(query),
          ),
        );
      }
    });
  };

  const handleRefresh = () => {
    setSearch("");
    fetchRoles(selectedRole?.id);
  };

  const openAddDialog = () => {
    setDialogMode("add");
    setEditingRoleId(null);
    setRoleName("");
    setDialogOpen(true);
  };

  const openEditDialog = (role: RoleItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent changing selected role row
    setDialogMode("edit");
    setEditingRoleId(role.id);
    setRoleName(role.name);
    setDialogOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin",
        text: "Tên vai trò không được để trống",
        confirmButtonColor: COLORS.primary,
      });
      return;
    }

    setLoading(true);
    try {
      let res;
      if (dialogMode === "add") {
        res = await apiService.post<any>("/roles", { name: roleName.trim() });
      } else {
        res = await apiService.put<any>(`/roles/${editingRoleId}`, {
          name: roleName.trim(),
        });
      }

      if (res.status) {
        setDialogOpen(false);
        Swal.fire({
          icon: "success",
          title:
            dialogMode === "add"
              ? "Tạo vai trò thành công"
              : "Cập nhật thành công",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchRoles(editingRoleId || undefined);
      } else {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: res.message || "Thao tác thất bại",
          confirmButtonColor: COLORS.primary,
        });
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Lỗi hệ thống",
        text: err?.response?.data?.message || "Không thể gửi yêu cầu",
        confirmButtonColor: COLORS.primary,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (role: RoleItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row selection
    if (
      role.name === "Admin" ||
      role.name === "GiaoVien" ||
      role.name === "HocVien"
    ) {
      Swal.fire({
        icon: "error",
        title: "Thao tác bị chặn",
        text: "Không thể xóa vai trò mặc định của hệ thống!",
        confirmButtonColor: COLORS.primary,
      });
      return;
    }

    if (role.userCount > 0) {
      Swal.fire({
        icon: "error",
        title: "Không thể xóa",
        text: `Vai trò đang được gán cho ${role.userCount} tài khoản.`,
        confirmButtonColor: COLORS.primary,
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "Xác nhận xóa?",
      text: `Bạn có chắc chắn muốn xóa vai trò "${role.displayName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: COLORS.primary,
      cancelButtonColor: COLORS.textSecondary,
      confirmButtonText: "Đồng ý xóa",
      cancelButtonText: "Hủy bỏ",
    });

    if (confirm.isConfirmed) {
      setLoading(true);
      try {
        const res = await apiService.delete<any>(`/roles/${role.id}`);
        if (res.status) {
          Swal.fire({
            icon: "success",
            title: "Đã xóa vai trò",
            timer: 1500,
            showConfirmButton: false,
          });
          fetchRoles();
        } else {
          Swal.fire({
            icon: "error",
            title: "Lỗi",
            text: res.message || "Xóa vai trò thất bại",
            confirmButtonColor: COLORS.primary,
          });
        }
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể kết nối đến API",
          confirmButtonColor: COLORS.primary,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Toggle user permissions
  const handleTogglePermission = (permissionCode: string) => {
    if (selectedRole?.name === "Admin") return; // Admin has all permissions, cannot toggle
    setPermissions((prev) =>
      prev.includes(permissionCode)
        ? prev.filter((p) => p !== permissionCode)
        : [...prev, permissionCode],
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    if (selectedRole.name === "Admin") {
      Swal.fire({
        icon: "info",
        title: "Quản trị viên",
        text: "Vai trò Admin mặc định sở hữu toàn bộ quyền hạn trong hệ thống.",
        confirmButtonColor: COLORS.primary,
      });
      return;
    }

    setSavingPermissions(true);
    try {
      const res = await apiService.post<any>(
        `/roles/${selectedRole.id}/permissions`,
        permissions,
      );
      if (res.status) {
        Swal.fire({
          icon: "success",
          title: "Đã lưu thay đổi",
          text: "Ma trận phân quyền đã được cập nhật thành công",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchRoles(selectedRole.id);
      } else {
        Swal.fire({
          icon: "error",
          title: "Lỗi lưu trữ",
          text: res.message || "Có lỗi xảy ra",
          confirmButtonColor: COLORS.primary,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể kết nối đến máy chủ",
        confirmButtonColor: COLORS.primary,
      });
    } finally {
      setSavingPermissions(false);
    }
  };

  const getRoleBadgeColor = (prefix: string) => {
    switch (prefix) {
      case "AD":
        return { bg: COLORS.primary, text: COLORS.white };
      case "IN":
        return { bg: "#FDF2F2", text: COLORS.primary };
      case "ST":
        return { bg: "#FDF2F2", text: COLORS.primary };
      default:
        return { bg: COLORS.greyLight, text: COLORS.textSecondary };
    }
  };

  const getRoleDisplayNameVi = (name: string) => {
    if (!name) return "Vai trò tùy chỉnh";
    const lower = name.toLowerCase();
    if (lower === "admin") return "Quản trị viên";
    if (lower === "giaovien" || lower === "instructor") return "Giảng viên";
    if (lower === "hocvien" || lower === "student") return "Học viên";
    if (lower === "personnel" || lower === "nhanvien") return "Nhân viên";
    return name;
  };

  return (
    <AuthGuard allowedRoles={["Admin"]}>
      <DashboardShell>
        <Box sx={{ p: 4, bgcolor: COLORS.bgLight, minHeight: "100%" }}>
          {/* Header */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              mb: 4,
              gap: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: "var(--ev-text-primary, #1F2937)",
                  mb: 0.5,
                }}
              >
                Quản lý vai trò & Phân quyền
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: COLORS.textSecondary, fontWeight: 500 }}
              >
                Định nghĩa và kiểm soát quyền hạn của các nhóm người dùng trong
                hệ thống EduVerse.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={openAddDialog}
              sx={{
                bgcolor: COLORS.primary,
                borderRadius: "8px",
                px: 3,
                py: 1.5,
                fontWeight: 700,
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(128,20,20,0.15)",
                transition: "all 200ms ease",
                "&:hover": {
                  bgcolor: COLORS.primaryBgLight,
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 16px rgba(128,20,20,0.25)",
                },
              }}
            >
              Tạo vai trò mới
            </Button>
          </Stack>

          {/* Statistics Cards */}
          <Grid container spacing={3.5} sx={{ width: "100%", m: 0, mb: 4 }}>
            {/* Card 1: Total Roles */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  bgcolor: COLORS.white,
                  border: "1.5px solid #FBFAF9",
                  display: "flex",
                  alignItems: "center",
                  gap: 2.5,
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    bgcolor: COLORS.redBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PeopleAltRounded
                    sx={{ color: COLORS.primaryLight, fontSize: 28 }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: COLORS.textSecondary,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Tổng vai trò
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, color: COLORS.textDark, mt: 0.5 }}
                  >
                    {stats.totalRoles}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Card 2: Active Roles */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  bgcolor: COLORS.white,
                  border: "1.5px solid #FBFAF9",
                  display: "flex",
                  alignItems: "center",
                  gap: 2.5,
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    bgcolor: COLORS.greenBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShieldRounded sx={{ color: COLORS.green, fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: COLORS.textSecondary,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Đang hoạt động
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, color: COLORS.textDark, mt: 0.5 }}
                  >
                    {stats.totalRoles}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Card 3: Total Claims/Permissions */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  bgcolor: COLORS.white,
                  border: "1.5px solid #FBFAF9",
                  display: "flex",
                  alignItems: "center",
                  gap: 2.5,
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    bgcolor: COLORS.orangeBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <VpnKeyRounded sx={{ color: COLORS.orange, fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: COLORS.textSecondary,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Tổng quyền hạn
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, color: COLORS.textDark, mt: 0.5 }}
                  >
                    {TOTAL_PERMISSIONS}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Card 4: Users Assigned */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  bgcolor: COLORS.white,
                  border: "1.5px solid #FBFAF9",
                  display: "flex",
                  alignItems: "center",
                  gap: 2.5,
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    bgcolor: COLORS.redBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AssignmentIndRounded
                    sx={{ color: COLORS.primaryLight, fontSize: 28 }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: COLORS.textSecondary,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Người dùng đã gán
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, color: COLORS.textDark, mt: 0.5 }}
                  >
                    {stats.totalUsersAssigned}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Table Card (Danh sách vai trò) */}
          <Card
            elevation={0}
            sx={{
              borderRadius: "16px",
              border: "1.5px solid var(--ev-divider, #ECE7E4)",
              overflow: "hidden",
              bgcolor: COLORS.white,
              mb: 4,
            }}
          >
            {/* Header filters */}
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                p: 3,
                borderBottom: "1.5px solid #FBFAF9",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: COLORS.textDark }}
              >
                Danh sách vai trò
              </Typography>
              <Stack direction="row" spacing={1.5}>
                {/* Embedded quick search inside filter row */}
                <form onSubmit={handleSearchSubmit}>
                  <TextField
                    placeholder="Tìm kiếm..."
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{
                      width: "200px",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        height: "38px",
                        fontSize: 14,
                      },
                    }}
                  />
                </form>
                <IconButton
                  sx={{
                    border: "1.5px solid var(--ev-divider, #ECE7E4)",
                    borderRadius: "8px",
                    width: "38px",
                    height: "38px",
                  }}
                  title="Lọc"
                >
                  <FilterListRounded
                    sx={{ color: COLORS.textSecondary, fontSize: 20 }}
                  />
                </IconButton>
                <IconButton
                  onClick={handleRefresh}
                  sx={{
                    border: "1.5px solid var(--ev-divider, #ECE7E4)",
                    borderRadius: "8px",
                    width: "38px",
                    height: "38px",
                  }}
                  title="Tải lại"
                >
                  <RefreshRounded
                    sx={{ color: COLORS.textSecondary, fontSize: 20 }}
                  />
                </IconButton>
              </Stack>
            </Stack>

            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 8,
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <CircularProgress sx={{ color: COLORS.primary }} />
                <Typography
                  sx={{ color: COLORS.textSecondary, fontWeight: 600 }}
                >
                  Đang tải danh sách vai trò...
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: "var(--ev-paper-alt, #F7F5F2)" }}>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 800,
                          color: COLORS.textSecondary,
                          py: 2.5,
                          pl: 4,
                        }}
                      >
                        TÊN VAI TRÒ
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 800, color: COLORS.textSecondary }}
                      >
                        MÔ TẢ
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 800,
                          color: COLORS.textSecondary,
                          textAlign: "center",
                        }}
                      >
                        SỐ QUYỀN
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 800,
                          color: COLORS.textSecondary,
                          textAlign: "center",
                        }}
                      >
                        NGƯỜI DÙNG
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 800, color: COLORS.textSecondary }}
                      >
                        TRẠNG THÁI
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 800, color: COLORS.textSecondary }}
                      >
                        NGÀY TẠO
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 800,
                          color: COLORS.textSecondary,
                          textAlign: "right",
                          pr: 4,
                        }}
                      >
                        THAO TÁC
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roles.map((role) => {
                      const isSelected = selectedRole?.id === role.id;
                      const badge = getRoleBadgeColor(role.prefix);
                      return (
                        <TableRow
                          key={role.id}
                          onClick={() => handleSelectRole(role)}
                          sx={{
                            cursor: "pointer",
                            bgcolor: isSelected
                              ? "rgba(128,20,20,0.03)"
                              : COLORS.white,
                            borderLeft: isSelected
                              ? `4px solid ${COLORS.primary}`
                              : "4px solid transparent",
                            "&:hover": { bgcolor: "rgba(128,20,20,0.015)" },
                            transition: "all 150ms ease",
                          }}
                        >
                          {/* Tên vai trò (Prefix Chip + Display Name) */}
                          <TableCell sx={{ py: 2.5, pl: isSelected ? 3 : 4 }}>
                            <Stack
                              direction="row"
                              spacing={2}
                              sx={{ alignItems: "center" }}
                            >
                              <Box
                                sx={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "6px",
                                  bgcolor: badge.bg,
                                  color: badge.text,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 800,
                                  fontSize: 13,
                                }}
                              >
                                {role.prefix}
                              </Box>
                              <Typography
                                sx={{ fontWeight: 700, color: COLORS.textDark }}
                              >
                                {getRoleDisplayNameVi(role.displayName || role.name)}
                              </Typography>
                            </Stack>
                          </TableCell>

                          {/* Mô tả */}
                          <TableCell
                            sx={{
                              color: COLORS.textSecondary,
                              fontWeight: 500,
                              maxWidth: "280px",
                            }}
                          >
                            {role.description}
                          </TableCell>

                          {/* Số quyền (All badge or number badge) */}
                          <TableCell sx={{ textAlign: "center" }}>
                            {role.permissionCount === "All" ? (
                              <Chip
                                label="All"
                                size="small"
                                sx={{
                                  bgcolor: "#FDF2F2",
                                  color: COLORS.primaryLight,
                                  fontWeight: 800,
                                  borderRadius: "6px",
                                  px: 1,
                                }}
                              />
                            ) : (
                              <Chip
                                label={role.permissionCount}
                                size="small"
                                sx={{
                                  bgcolor: COLORS.blueBg,
                                  color: COLORS.blue,
                                  fontWeight: 800,
                                  borderRadius: "6px",
                                  px: 1,
                                }}
                              />
                            )}
                          </TableCell>

                          {/* Người dùng */}
                          <TableCell
                            sx={{
                              textAlign: "center",
                              fontWeight: 700,
                              color: COLORS.textDark,
                            }}
                          >
                            {role.userCount.toLocaleString()}
                          </TableCell>

                          {/* Trạng thái */}
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{ alignItems: "center" }}
                            >
                              <Box
                                sx={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  bgcolor: COLORS.green,
                                }}
                              />
                              <Typography
                                sx={{
                                  color: COLORS.green,
                                  fontWeight: 700,
                                  fontSize: 13,
                                }}
                              >
                                HOẠT ĐỘNG
                              </Typography>
                            </Stack>
                          </TableCell>

                          {/* Ngày tạo */}
                          <TableCell
                            sx={{
                              color: COLORS.textSecondary,
                              fontWeight: 500,
                            }}
                          >
                            {role.createdDate}
                          </TableCell>

                          {/* Thao tác */}
                          <TableCell sx={{ textAlign: "right", pr: 4 }}>
                            <IconButton
                              size="small"
                              onClick={(e) => openEditDialog(role, e)}
                              sx={{
                                color: COLORS.textSecondary,
                                mr: 1,
                                "&:hover": {
                                  bgcolor: "rgba(0,0,0,0.05)",
                                  color: COLORS.primary,
                                },
                              }}
                              title="Sửa tên vai trò"
                            >
                              <EditRounded fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => handleDeleteRole(role, e)}
                              disabled={
                                role.name === "Admin" ||
                                role.name === "GiaoVien" ||
                                role.name === "HocVien"
                              }
                              sx={{
                                color: COLORS.textSecondary,
                                "&:hover": {
                                  bgcolor: "rgba(239,68,68,0.05)",
                                  color: COLORS.red,
                                },
                              }}
                              title="Xóa vai trò"
                            >
                              <DeleteRounded fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>

          {/* Interactive Permission Matrix Panel */}
          {selectedRole && (
            <Card
              elevation={0}
              sx={{
                borderRadius: "16px",
                border: "1.5px solid var(--ev-divider, #ECE7E4)",
                bgcolor: COLORS.white,
                overflow: "hidden",
              }}
            >
              {/* Header section with Hủy và Lưu */}
              <Box
                sx={{
                  p: 3,
                  bgcolor: "#8B1313",
                  color: COLORS.white,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Ma trận phân quyền: {getRoleDisplayNameVi(selectedRole.displayName || selectedRole.name)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}
                  >
                    Đang xem cấu hình quyền hạn cho vai trò{" "}
                    {getRoleDisplayNameVi(selectedRole.name)}.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={() => fetchRolePermissions(selectedRole.id)}
                    sx={{
                      color: COLORS.white,
                      borderColor: "rgba(255,255,255,0.3)",
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "8px",
                      px: 3,
                      "&:hover": {
                        borderColor: COLORS.white,
                        bgcolor: "rgba(255,255,255,0.08)",
                      },
                    }}
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    variant="contained"
                    disabled={
                      savingPermissions || selectedRole.name === "Admin"
                    }
                    onClick={handleSavePermissions}
                    sx={{
                      bgcolor: COLORS.white,
                      color: COLORS.primary,
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "8px",
                      px: 3,
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor: "#FFF5F5",
                      },
                      "&:disabled": {
                        bgcolor: "rgba(255,255,255,0.3)",
                        color: "rgba(255,255,255,0.6)",
                      },
                    }}
                  >
                    {savingPermissions ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </Stack>
              </Box>

              {/* Ma trận quyền — render data-driven từ PERMISSION_GROUPS */}
              <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                <Grid container spacing={3} sx={{ width: "100%", m: 0 }}>
                  {PERMISSION_GROUPS.map((group) => {
                    const GroupIcon = group.icon;
                    return (
                      <Grid size={{ xs: 12, md: 6 }} key={group.title}>
                        <Box sx={{ height: "100%" }}>
                          <Stack
                            direction="row"
                            spacing={1.25}
                            sx={{ mb: 2, alignItems: "center" }}
                          >
                            <GroupIcon
                              sx={{ color: COLORS.primary, fontSize: 20 }}
                            />
                            <Typography
                              sx={{
                                fontWeight: 800,
                                color: COLORS.textDark,
                                fontSize: 15,
                              }}
                            >
                              {group.title}
                            </Typography>
                          </Stack>
                          <Stack spacing={1.25}>
                            {group.permissions.map((item) => {
                              const isAdmin = selectedRole.name === "Admin";
                              const isChecked =
                                isAdmin || permissions.includes(item.code);
                              return (
                                <Box
                                  key={item.code}
                                  onClick={() => {
                                    if (!isAdmin)
                                      handleTogglePermission(item.code);
                                  }}
                                  sx={{
                                    px: 2,
                                    py: 1.5,
                                    borderRadius: "10px",
                                    border: isChecked
                                      ? `1.5px solid ${COLORS.primary}`
                                      : `1.5px solid ${COLORS.greyBorder}`,
                                    bgcolor: isChecked
                                      ? COLORS.primaryBgLight
                                      : COLORS.white,
                                    cursor: isAdmin ? "not-allowed" : "pointer",
                                    opacity: isAdmin ? 0.9 : 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 1.5,
                                    transition: "all 150ms ease",
                                    "&:hover": {
                                      borderColor: isAdmin
                                        ? undefined
                                        : COLORS.primary,
                                    },
                                  }}
                                >
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                      sx={{
                                        fontWeight: 700,
                                        color: isChecked
                                          ? COLORS.primary
                                          : COLORS.textDark,
                                        fontSize: 13.5,
                                      }}
                                    >
                                      {item.label}
                                    </Typography>
                                    {item.desc ? (
                                      <Typography
                                        sx={{
                                          color: COLORS.textSecondary,
                                          fontSize: 12,
                                          mt: 0.25,
                                        }}
                                      >
                                        {item.desc}
                                      </Typography>
                                    ) : null}
                                  </Box>
                                  {isChecked ? (
                                    <CheckCircleRounded
                                      sx={{
                                        color: COLORS.primary,
                                        fontSize: 22,
                                        flexShrink: 0,
                                      }}
                                    />
                                  ) : (
                                    <RadioButtonUncheckedRounded
                                      sx={{
                                        color: COLORS.textSecondary,
                                        fontSize: 22,
                                        flexShrink: 0,
                                      }}
                                    />
                                  )}
                                </Box>
                              );
                            })}
                          </Stack>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Card>
          )}

          {/* Add/Edit Role Dialog */}
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            maxWidth="xs"
            fullWidth
            slotProps={{
              paper: {
                sx: {
                  borderRadius: "16px",
                  p: 1.5,
                },
              },
            }}
          >
            <DialogTitle
              sx={{
                fontWeight: 800,
                color: COLORS.textDark,
                borderBottom: "1.5px solid #FBFAF9",
                pb: 2,
              }}
            >
              {dialogMode === "add"
                ? "Tạo vai trò mới"
                : "Chỉnh sửa tên vai trò"}
            </DialogTitle>
            <form onSubmit={handleSubmitForm}>
              <DialogContent sx={{ mt: 2 }}>
                <Grid container spacing={3} sx={{ width: "100%", m: 0 }}>
                  <Grid size={{ xs: 12 }}>
                    <Stack spacing={0.75}>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: COLORS.textDark,
                        }}
                      >
                        Tên vai trò{" "}
                        <span style={{ color: COLORS.primary }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        placeholder="Ví dụ: Admin, GiaoVien, HocVien VIP..."
                        required
                        disabled={
                          dialogMode === "edit" &&
                          (roleName === "Admin" ||
                            roleName === "GiaoVien" ||
                            roleName === "HocVien")
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            height: "50px",
                          },
                        }}
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions
                sx={{ p: 3, borderTop: "1.5px solid #FBFAF9", gap: 1.5 }}
              >
                <Button
                  onClick={() => setDialogOpen(false)}
                  sx={{
                    color: COLORS.textSecondary,
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 3,
                    py: 1.25,
                  }}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    bgcolor: COLORS.primary,
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 3,
                    py: 1.25,
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: COLORS.primaryLight,
                    },
                  }}
                >
                  {dialogMode === "add" ? "Thêm mới" : "Cập nhật"}
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}
