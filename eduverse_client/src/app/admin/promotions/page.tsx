/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import AuthGuard from "@/src/components/AuthGuard";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Checkbox,
  Avatar,
  CircularProgress,
  Tooltip,
  Stack,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CloseIcon from "@mui/icons-material/Close";
import SchoolIcon from "@mui/icons-material/School";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { apiService } from "@/src/services/index";
import { useSelector } from "react-redux";

// ─── Types ────────────────────────────────────────────────────────────────────
interface KhoaHocMiniDto {
  id: string;
  tieuDe?: string;
  hinhAnhKhoaHoc?: string;
}

interface KhuyenMaiDto {
  id?: string;
  maGiamGia?: string;
  phanTramGiam?: number;
  ngayBatDau?: string;
  ngayKetThuc?: string;
  soLuongHieuLuc?: number;
  createdDate: string;
  danhSachKhoaHoc?: KhoaHocMiniDto[];
}

interface FormState {
  maGiamGia: string;
  phanTramGiam: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  soLuongHieuLuc: string;
  idsKhoaHoc: string[];
}

const EMPTY_FORM: FormState = {
  maGiamGia: "",
  phanTramGiam: "",
  ngayBatDau: "",
  ngayKetThuc: "",
  soLuongHieuLuc: "",
  idsKhoaHoc: [],
};

const PRIMARY = "#8B1313";
const PRIMARY_SOFT = "#FEF2F2";
const PRIMARY_BORDER = "#FECACA";

// ─── Status chip ──────────────────────────────────────────────────────────────
function StatusChip({
  batDau,
  ketThuc,
}: {
  batDau?: string;
  ketThuc?: string;
}) {
  const now = new Date();
  const start = batDau ? new Date(batDau) : null;
  const end = ketThuc ? new Date(ketThuc) : null;

  if (!start || !end)
    return (
      <Chip
        label="Không xác định"
        size="small"
        sx={{
          bgcolor: "var(--ev-paper-alt, #FBFAF9)",
          color: "var(--ev-text-muted, #8A7676)",
        }}
      />
    );
  if (now < start)
    return (
      <Chip
        label="Chưa bắt đầu"
        size="small"
        sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 700 }}
      />
    );
  if (now > end)
    return (
      <Chip
        label="Hết hạn"
        size="small"
        sx={{
          bgcolor: "var(--ev-paper-alt, #FBFAF9)",
          color: "var(--ev-text-muted, #8A7676)",
          fontWeight: 700,
        }}
      />
    );
  return (
    <Chip
      label="Đang hoạt động"
      size="small"
      sx={{ bgcolor: "#ECFDF5", color: "#059669", fontWeight: 700 }}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function PromotionsContent() {
  const [list, setList] = useState<KhuyenMaiDto[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  // Khóa học picker
  const [allKhoaHoc, setAllKhoaHoc] = useState<KhoaHocMiniDto[]>([]);
  const [loadingKH, setLoadingKH] = useState(false);
  const [searchKH, setSearchKH] = useState("");

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState<KhuyenMaiDto | null>(null);

  // ── Load danh sách khuyến mãi ──
  const loadList = async () => {
    setLoadingList(true);
    try {
      const res = await apiService.get<KhuyenMaiDto[]>(
        "/KhuyenMai/khuyenmai-getlistall",
      );
      setList(res.data ?? []);
    } catch {
      setError("Không thể tải danh sách khuyến mãi");
    } finally {
      setLoadingList(false);
    }
  };

  // ── Load danh sách khóa học đã duyệt ──
  const loadKhoaHoc = async () => {
    setLoadingKH(true);
    try {
      const res = await apiService.get<KhoaHocMiniDto[]>(
        "/KhuyenMai/khuyenmai-getall-khoahoc-daduyet",
      );
      setAllKhoaHoc(res.data ?? []);
    } catch {
      setAllKhoaHoc([]);
    } finally {
      setLoadingKH(false);
    }
  };

  useEffect(() => {
    const fetchList = async () => {
      await loadList();
    };

    fetchList();
  }, []);

  // ── Mở dialog tạo mới ──
  const handleOpenCreate = async () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setSearchKH("");
    setOpenDialog(true);
    await loadKhoaHoc();
  };

  // ── Mở dialog chỉnh sửa ──
  const handleOpenEdit = async (km: KhuyenMaiDto) => {
    setEditId(km.id ?? null);
    setForm({
      maGiamGia: km.maGiamGia ?? "",
      phanTramGiam: km.phanTramGiam?.toString() ?? "",
      ngayBatDau: km.ngayBatDau ? km.ngayBatDau.slice(0, 10) : "",
      ngayKetThuc: km.ngayKetThuc ? km.ngayKetThuc.slice(0, 10) : "",
      soLuongHieuLuc: km.soLuongHieuLuc?.toString() ?? "",
      idsKhoaHoc: (km.danhSachKhoaHoc ?? []).map((kh) => kh.id),
    });
    setFormError("");
    setSearchKH("");
    setOpenDialog(true);
    await loadKhoaHoc();
  };

  // ── Validate form ──
  const user = useSelector((state: any) => state.auth.user);
  const isAdmin = user?.roles?.includes("Admin");
  const max = isAdmin ? 30 : 100;

  const validateForm = (): boolean => {
    if (!form.maGiamGia.trim()) {
      setFormError("Vui lòng nhập mã giảm giá");
      return false;
    }

    const pct = Number(form.phanTramGiam);

    if (pct <= 0) {
      setFormError("Phần trăm giảm phải lớn hơn 0%");
      return false;
    }

    if (pct > max) {
      setFormError(`Phần trăm giảm không được vượt quá ${max}%`);
      return false;
    }

    if (!form.ngayBatDau) {
      setFormError("Vui lòng chọn ngày bắt đầu");
      return false;
    }

    if (!form.ngayKetThuc) {
      setFormError("Vui lòng chọn ngày kết thúc");
      return false;
    }

    if (new Date(form.ngayBatDau) > new Date(form.ngayKetThuc)) {
      setFormError("Ngày bắt đầu không được sau ngày kết thúc");
      return false;
    }

    if (form.idsKhoaHoc.length === 0) {
      setFormError("Vui lòng chọn ít nhất 1 khóa học");
      return false;
    }

    setFormError("");
    return true;
  };

  // ── Submit form ──
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = {
        maGiamGia: form.maGiamGia.trim().toUpperCase(),
        phanTramGiam: Number(form.phanTramGiam),
        ngayBatDau: form.ngayBatDau,
        ngayKetThuc: form.ngayKetThuc,
        soLuongHieuLuc: form.soLuongHieuLuc
          ? Number(form.soLuongHieuLuc)
          : null,
        idsKhoaHoc: form.idsKhoaHoc,
      };

      if (editId) {
        await apiService.put("/KhuyenMai/khuyenmai-update", {
          id: editId,
          ...payload,
        });
        setSuccessMsg("Cập nhật khuyến mãi thành công!");
      } else {
        await apiService.post("/KhuyenMai/khuyenmai-create", payload);
        setSuccessMsg("Tạo khuyến mãi thành công!");
      }

      setOpenDialog(false);
      await loadList();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e: unknown) {
      setFormError(
        typeof e === "string" ? e : "Có lỗi xảy ra, vui lòng thử lại",
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Xoá khuyến mãi ──
  const handleDelete = async () => {
    if (!confirmDelete?.id) return;
    setDeleting(confirmDelete.id);
    try {
      await apiService.delete(
        `/KhuyenMai/khuyenmai-delete/${confirmDelete.id}`,
      );
      setConfirmDelete(null);
      setSuccessMsg("Đã xoá khuyến mãi!");
      await loadList();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("Xoá thất bại, vui lòng thử lại");
    } finally {
      setDeleting(null);
    }
  };

  // ── Toggle chọn khóa học ──
  const toggleKhoaHoc = (id: string) => {
    setForm((prev) => ({
      ...prev,
      idsKhoaHoc: prev.idsKhoaHoc.includes(id)
        ? prev.idsKhoaHoc.filter((x) => x !== id)
        : [...prev.idsKhoaHoc, id],
    }));
  };

  const filteredKH = allKhoaHoc.filter((kh) =>
    (kh.tieuDe ?? "").toLowerCase().includes(searchKH.toLowerCase()),
  );

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("vi-VN") : "—";

  return (
    <Box>
      {/* Header */}
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 26,
              fontWeight: 900,
              color: "var(--ev-text-primary, #1F2937)",
              mb: 0.5,
            }}
          >
            Quản lý khuyến mãi
          </Typography>
          <Typography sx={{ fontSize: 14, color: "rgba(31,41,55,0.6)" }}>
            Tạo và quản lý mã giảm giá cho các khóa học đã được phê duyệt
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{
            bgcolor: PRIMARY,
            "&:hover": { bgcolor: "#7F1D1D" },
            borderRadius: "12px",
            fontWeight: 700,
            px: 3,
            py: 1.2,
            boxShadow: "0 4px 12px rgba(141,19,19,0.2)",
          }}
        >
          Tạo khuyến mãi
        </Button>
      </Stack>

      {/* Success / Error banner */}
      {successMsg && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            bgcolor: "#ECFDF5",
            border: "1px solid #A7F3D0",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <CheckCircleIcon sx={{ color: "#059669", fontSize: 20 }} />
          <Typography sx={{ color: "#059669", fontWeight: 600, fontSize: 14 }}>
            {successMsg}
          </Typography>
        </Paper>
      )}
      {error && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            bgcolor: PRIMARY_SOFT,
            border: `1px solid ${PRIMARY_BORDER}`,
            borderRadius: "12px",
          }}
        >
          <Typography sx={{ color: PRIMARY, fontWeight: 600, fontSize: 14 }}>
            {error}
          </Typography>
        </Paper>
      )}

      {/* Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "20px",
          border: "1px solid var(--ev-divider, #ECE7E4)",
          overflow: "hidden",
        }}
      >
        {loadingList ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: PRIMARY }} />
          </Box>
        ) : list.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <LocalOfferIcon sx={{ fontSize: 56, color: "#ECE7E4", mb: 2 }} />
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 16,
                color: "var(--ev-text-secondary, #4B5563)",
                mb: 0.5,
              }}
            >
              Chưa có khuyến mãi nào
            </Typography>
            <Typography
              sx={{
                color: "var(--ev-text-muted, #8A7676)",
                fontSize: 14,
                mb: 3,
              }}
            >
              Tạo mã giảm giá đầu tiên để bắt đầu
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              sx={{
                bgcolor: PRIMARY,
                "&:hover": { bgcolor: "#7F1D1D" },
                borderRadius: "10px",
                fontWeight: 700,
              }}
            >
              Tạo khuyến mãi
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "var(--ev-paper-alt, #FBFAF9)" }}>
                  {[
                    "Mã giảm giá",
                    "Giảm giá",
                    "Thời gian",
                    "Số lượng",
                    "Khóa học",
                    "Trạng thái",
                    "",
                  ].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: "var(--ev-text-secondary, #4B5563)",
                        py: 1.5,
                        borderBottom: "1px solid var(--ev-divider, #ECE7E4)",
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {list.map((km) => (
                  <TableRow
                    key={km.id}
                    sx={{ "&:hover": { bgcolor: "#FAFAFA" } }}
                  >
                    <TableCell>
                      <Chip
                        label={km.maGiamGia}
                        size="small"
                        icon={
                          <LocalOfferIcon
                            sx={{ fontSize: "14px !important" }}
                          />
                        }
                        sx={{
                          bgcolor: PRIMARY_SOFT,
                          color: PRIMARY,
                          fontWeight: 800,
                          fontSize: 13,
                          border: `1px solid ${PRIMARY_BORDER}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{ fontWeight: 800, fontSize: 18, color: PRIMARY }}
                      >
                        {km.phanTramGiam}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "var(--ev-text-secondary, #4B5563)",
                        }}
                      >
                        {formatDate(km.ngayBatDau)} →{" "}
                        {formatDate(km.ngayKetThuc)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "var(--ev-text-secondary, #4B5563)",
                        }}
                      >
                        {km.soLuongHieuLuc ?? "∞"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ flexWrap: "wrap" }}
                      >
                        {(km.danhSachKhoaHoc ?? []).slice(0, 2).map((kh) => (
                          <Tooltip key={kh.id} title={kh.tieuDe ?? ""}>
                            <Avatar
                              src={kh.hinhAnhKhoaHoc}
                              sx={{
                                width: 28,
                                height: 28,
                                fontSize: 11,
                                bgcolor: PRIMARY_SOFT,
                                color: PRIMARY,
                              }}
                            >
                              <SchoolIcon sx={{ fontSize: 14 }} />
                            </Avatar>
                          </Tooltip>
                        ))}
                        {(km.danhSachKhoaHoc?.length ?? 0) > 2 && (
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              fontSize: 11,
                              bgcolor: "var(--ev-paper-alt, #FBFAF9)",
                              color: "var(--ev-text-muted, #8A7676)",
                            }}
                          >
                            +{(km.danhSachKhoaHoc?.length ?? 0) - 2}
                          </Avatar>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <StatusChip
                        batDau={km.ngayBatDau}
                        ketThuc={km.ngayKetThuc}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ justifyContent: "flex-end" }}
                      >
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEdit(km)}
                            sx={{
                              color: "var(--ev-text-muted, #8A7676)",
                              "&:hover": {
                                color: PRIMARY,
                                bgcolor: PRIMARY_SOFT,
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xoá">
                          <IconButton
                            size="small"
                            onClick={() => setConfirmDelete(km)}
                            disabled={deleting === km.id}
                            sx={{
                              color: "var(--ev-text-muted, #8A7676)",
                              "&:hover": {
                                color: "#DC2626",
                                bgcolor: "#FEF2F2",
                              },
                            }}
                          >
                            {deleting === km.id ? (
                              <CircularProgress size={16} />
                            ) : (
                              <DeleteIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ── Dialog tạo/sửa ── */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: "20px", overflow: "hidden" },
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: PRIMARY,
            color: "#fff",
            py: 2.5,
            px: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <LocalOfferIcon />
            <Typography sx={{ fontWeight: 800, fontSize: 17 }}>
              {editId ? "Chỉnh sửa khuyến mãi" : "Tạo khuyến mãi mới"}
            </Typography>
          </Stack>
          <IconButton
            onClick={() => setOpenDialog(false)}
            sx={{ color: "#fff" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              mb: 3,
            }}
          >
            {/* Mã giảm giá */}
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--ev-text-secondary, #4B5563)",
                  mb: 0.8,
                }}
              >
                Mã giảm giá *
              </Typography>
              <TextField
                fullWidth
                placeholder="VD: SALE20"
                value={form.maGiamGia}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    maGiamGia: e.target.value.toUpperCase(),
                  }))
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    height: 46,
                    "&.Mui-focused fieldset": { borderColor: PRIMARY },
                  },
                }}
              />
            </Box>

            {/* Phần trăm giảm */}
            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--ev-text-secondary, #4B5563)",
                  mb: 0.8,
                }}
              >
                Phần trăm giảm (%) *
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="VD: 20"
                slotProps={{
                  htmlInput: { min: 1, max: 100 },
                }}
                value={form.phanTramGiam}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phanTramGiam: e.target.value }))
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    height: 46,
                    "&.Mui-focused fieldset": { borderColor: PRIMARY },
                  },
                }}
              />
            </Box>

            {/* Số lượng */}
            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--ev-text-secondary, #4B5563)",
                  mb: 0.8,
                }}
              >
                Số lượt dùng{" "}
                <span
                  style={{
                    color: "var(--ev-text-muted, #8A7676)",
                    fontWeight: 400,
                  }}
                >
                  (để trống = không giới hạn)
                </span>
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="Không giới hạn"
                slotProps={{
                  htmlInput: { min: 1 },
                }}
                value={form.soLuongHieuLuc}
                onChange={(e) =>
                  setForm((p) => ({ ...p, soLuongHieuLuc: e.target.value }))
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    height: 46,
                    "&.Mui-focused fieldset": { borderColor: PRIMARY },
                  },
                }}
              />
            </Box>

            {/* Ngày bắt đầu */}
            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--ev-text-secondary, #4B5563)",
                  mb: 0.8,
                }}
              >
                Ngày bắt đầu *
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={form.ngayBatDau}
                onChange={(e) =>
                  setForm((p) => ({ ...p, ngayBatDau: e.target.value }))
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    height: 46,
                    "&.Mui-focused fieldset": { borderColor: PRIMARY },
                  },
                }}
              />
            </Box>

            {/* Ngày kết thúc */}
            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--ev-text-secondary, #4B5563)",
                  mb: 0.8,
                }}
              >
                Ngày kết thúc *
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={form.ngayKetThuc}
                onChange={(e) =>
                  setForm((p) => ({ ...p, ngayKetThuc: e.target.value }))
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    height: 46,
                    "&.Mui-focused fieldset": { borderColor: PRIMARY },
                  },
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ mb: 2.5 }} />

          {/* Chọn khóa học */}
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--ev-text-secondary, #4B5563)",
              mb: 1.5,
            }}
          >
            Chọn khóa học áp dụng *
            {form.idsKhoaHoc.length > 0 && (
              <Chip
                label={`${form.idsKhoaHoc.length} đã chọn`}
                size="small"
                sx={{
                  ml: 1,
                  bgcolor: PRIMARY_SOFT,
                  color: PRIMARY,
                  fontWeight: 700,
                  fontSize: 12,
                }}
              />
            )}
          </Typography>

          {/* Search khóa học */}
          <TextField
            fullWidth
            placeholder="Tìm kiếm khóa học..."
            value={searchKH}
            onChange={(e) => setSearchKH(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{
                        color: "var(--ev-text-muted, #8A7676)",
                        fontSize: 18,
                      }}
                    />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              mb: 1.5,
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                height: 46,
                "&.Mui-focused fieldset": { borderColor: PRIMARY },
              },
            }}
          />

          {/* Danh sách khóa học */}
          <Box
            sx={{
              maxHeight: 260,
              overflowY: "auto",
              border: "1px solid var(--ev-divider, #ECE7E4)",
              borderRadius: "12px",
              p: 1,
            }}
          >
            {loadingKH ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={28} sx={{ color: PRIMARY }} />
              </Box>
            ) : filteredKH.length === 0 ? (
              <Typography
                sx={{
                  textAlign: "center",
                  py: 4,
                  color: "var(--ev-text-muted, #8A7676)",
                  fontSize: 14,
                }}
              >
                Không tìm thấy khóa học nào
              </Typography>
            ) : (
              filteredKH.map((kh) => {
                const checked = form.idsKhoaHoc.includes(kh.id);
                return (
                  <Box
                    key={kh.id}
                    onClick={() => toggleKhoaHoc(kh.id)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1,
                      borderRadius: "8px",
                      cursor: "pointer",
                      bgcolor: checked ? PRIMARY_SOFT : "transparent",
                      border: checked
                        ? `1px solid ${PRIMARY_BORDER}`
                        : "1px solid transparent",
                      mb: 0.5,
                      "&:hover": {
                        bgcolor: checked ? PRIMARY_SOFT : "#FBFAF9",
                      },
                      transition: "all 150ms ease",
                    }}
                  >
                    <Checkbox
                      checked={checked}
                      size="small"
                      sx={{
                        p: 0,
                        color: "#ECE7E4",
                        "&.Mui-checked": { color: PRIMARY },
                      }}
                    />
                    <Avatar
                      src={kh.hinhAnhKhoaHoc}
                      variant="rounded"
                      sx={{ width: 36, height: 36, bgcolor: PRIMARY_SOFT }}
                    >
                      <SchoolIcon sx={{ fontSize: 18, color: PRIMARY }} />
                    </Avatar>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: checked ? 700 : 500,
                        color: checked ? PRIMARY : "#4B5563",
                        flex: 1,
                      }}
                    >
                      {kh.tieuDe}
                    </Typography>
                    {checked && (
                      <CheckCircleIcon sx={{ fontSize: 18, color: PRIMARY }} />
                    )}
                  </Box>
                );
              })
            )}
          </Box>

          {/* Form error */}
          {formError && (
            <Paper
              elevation={0}
              sx={{
                mt: 2,
                p: 1.5,
                bgcolor: PRIMARY_SOFT,
                border: `1px solid ${PRIMARY_BORDER}`,
                borderRadius: "10px",
              }}
            >
              <Typography
                sx={{ color: PRIMARY, fontSize: 13, fontWeight: 600 }}
              >
                {formError}
              </Typography>
            </Paper>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
            borderTop: "1px solid var(--ev-divider, #ECE7E4)",
            gap: 1,
          }}
        >
          <Button
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            sx={{
              borderColor: "var(--ev-divider, #ECE7E4)",
              color: "var(--ev-text-secondary, #4B5563)",
              borderRadius: "10px",
              fontWeight: 600,
              "&:hover": { borderColor: "#8A7676" },
            }}
          >
            Huỷ
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={saving}
            startIcon={
              saving ? <CircularProgress size={16} color="inherit" /> : null
            }
            sx={{
              bgcolor: PRIMARY,
              "&:hover": { bgcolor: "#7F1D1D" },
              borderRadius: "10px",
              fontWeight: 700,
              px: 3,
            }}
          >
            {saving ? "Đang lưu..." : editId ? "Cập nhật" : "Tạo khuyến mãi"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Confirm delete dialog ── */}
      <Dialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: "16px" },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            fontSize: 17,
            color: "var(--ev-text-primary, #1F2937)",
          }}
        >
          Xoá khuyến mãi?
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{ fontSize: 14, color: "var(--ev-text-muted, #8A7676)" }}
          >
            Bạn có chắc muốn xoá mã{" "}
            <strong style={{ color: PRIMARY }}>
              {confirmDelete?.maGiamGia}
            </strong>
            ? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setConfirmDelete(null)}
            variant="outlined"
            sx={{
              borderColor: "var(--ev-divider, #ECE7E4)",
              color: "var(--ev-text-secondary, #4B5563)",
              borderRadius: "10px",
              fontWeight: 600,
            }}
          >
            Huỷ
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            disabled={!!deleting}
            sx={{
              bgcolor: "#DC2626",
              "&:hover": { bgcolor: "#B91C1C" },
              borderRadius: "10px",
              fontWeight: 700,
            }}
          >
            Xoá
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function AdminPromotionsPage() {
  return (
    <AuthGuard allowedRoles={["Admin"]}>
      <DashboardShell>
        <PromotionsContent />
      </DashboardShell>
    </AuthGuard>
  );
}
