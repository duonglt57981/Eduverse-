"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  Divider,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import NotificationsIcon from "@mui/icons-material/Notifications";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useDispatch, useSelector } from "../../../store/hook";
import {
  getThongBaoAdmin,
  danhDauDaDoc,
} from "../../../store/rutTien/RutTienSlice";

const PRIMARY = "#9b1c1c";

const loaiColor: Record<
  string,
  "default" | "success" | "error" | "warning" | "info"
> = {
  YeuCauRutTien: "warning",
  DoanhThu: "success",
  RutTienThanhCong: "success",
  RutTienTuChoi: "error",
};

const loaiLabel: Record<string, string> = {
  YeuCauRutTien: "Rút tiền",
  DoanhThu: "Doanh thu",
  RutTienThanhCong: "Thành công",
  RutTienTuChoi: "Từ chối",
};

export default function AdminThongBaoPage() {
  const dispatch = useDispatch();
  const { thongBaoAdmins } = useSelector((s) => s.rutTien);

  const [search, setSearch] = useState("");
  const [filterLoai, setFilterLoai] = useState("");

  useEffect(() => {
    dispatch(getThongBaoAdmin());
  }, [dispatch]);

  const filtered = thongBaoAdmins.filter((t) => {
    const matchSearch =
      !search ||
      t.tieuDe?.toLowerCase().includes(search.toLowerCase()) ||
      t.noiDung?.toLowerCase().includes(search.toLowerCase());
    const matchLoai = !filterLoai || t.loaiThongBao === filterLoai;
    return matchSearch && matchLoai;
  });

  const chuaDoc = thongBaoAdmins.filter((t) => !t.daDoc).length;

  const loaiOptions = [
    ...new Set(
      thongBaoAdmins
        .map((t) => t.loaiThongBao)
        .filter((l): l is string => l !== undefined && l !== null),
    ),
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 24,
              fontWeight: 700,
              color: "text.primary",
              mb: 0.5,
            }}
          >
            Quản lý thông báo
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
            Theo dõi các thông báo từ hệ thống và giảng viên
          </Typography>
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        {[
          {
            label: "Tổng thông báo",
            value: thongBaoAdmins.length,
            color: "#1e40af",
            bg: "#eff6ff",
          },
          {
            label: "Chưa đọc",
            value: chuaDoc,
            color: "#d97706",
            bg: "#fffbeb",
          },
          {
            label: "Đã đọc",
            value: thongBaoAdmins.length - chuaDoc,
            color: "#059669",
            bg: "#f0fdf4",
          },
          {
            label: "Yêu cầu rút tiền",
            value: thongBaoAdmins.filter(
              (t) => t.loaiThongBao === "YeuCauRutTien",
            ).length,
            color: PRIMARY,
            bg: "#fff0f0",
          },
        ].map((s) => (
          <Card
            key={s.label}
            sx={{
              borderRadius: 2.5,
              p: 2,
              flex: "1 1 160px",
              bgcolor: s.bg,
              boxShadow: "none",
            }}
          >
            <Typography sx={{ fontSize: 28, fontWeight: 800, color: s.color }}>
              {s.value}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              {s.label}
            </Typography>
          </Card>
        ))}
      </Box>

      {/* Filter */}
      <Card sx={{ borderRadius: 3, mb: 2, p: 2 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            placeholder="Tìm kiếm thông báo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              flex: 1,
              minWidth: 200,
              "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                borderColor: PRIMARY,
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label="Tất cả"
              size="small"
              onClick={() => setFilterLoai("")}
              variant={!filterLoai ? "filled" : "outlined"}
              sx={{
                bgcolor: !filterLoai ? PRIMARY : "transparent",
                color: !filterLoai ? "#fff" : "text.primary",
                borderColor: !filterLoai ? PRIMARY : "#ddd",
                cursor: "pointer",
              }}
            />
            {loaiOptions.map((l) => (
              <Chip
                key={l}
                label={loaiLabel[l] ?? l}
                size="small"
                onClick={() => setFilterLoai(filterLoai === l ? "" : l)}
                color={
                  filterLoai === l ? (loaiColor[l] ?? "default") : "default"
                }
                variant={filterLoai === l ? "filled" : "outlined"}
                sx={{ cursor: "pointer" }}
              />
            ))}
          </Box>
        </Box>
      </Card>

      {/* Danh sách */}
      <Card sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f9f8f6" }}>
                <TableCell sx={{ fontWeight: 700, width: 40 }}></TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tiêu đề</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Loại</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Thời gian</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <NotificationsIcon
                        sx={{ fontSize: 48, color: "#ddd", mb: 1 }}
                      />
                      <Typography
                        sx={{ color: "text.secondary", fontSize: 14 }}
                      >
                        Không có thông báo
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => (
                  <TableRow
                    key={t.id}
                    sx={{
                      bgcolor: !t.daDoc ? "#fffbf0" : "transparent",
                      "&:hover": { bgcolor: "#f9f8f6" },
                    }}
                  >
                    <TableCell>
                      {!t.daDoc && (
                        <FiberManualRecordIcon
                          sx={{ fontSize: 10, color: "#f59e0b" }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{ fontWeight: !t.daDoc ? 700 : 400, fontSize: 13 }}
                      >
                        {t.tieuDe}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "text.secondary",
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {t.noiDung}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          loaiLabel[t.loaiThongBao ?? ""] ??
                          t.loaiThongBao ??
                          "Hệ thống"
                        }
                        color={loaiColor[t.loaiThongBao ?? ""] ?? "default"}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: "text.secondary" }}>
                      {t.thoiGianTao
                        ? new Date(t.thoiGianTao).toLocaleString("vi-VN")
                        : ""}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t.daDoc ? "Đã đọc" : "Chưa đọc"}
                        color={t.daDoc ? "success" : "warning"}
                        size="small"
                        variant={t.daDoc ? "outlined" : "filled"}
                      />
                    </TableCell>
                    <TableCell>
                      {!t.daDoc && (
                        <Button
                          size="small"
                          onClick={() => dispatch(danhDauDaDoc(t.id))}
                          sx={{
                            color: PRIMARY,
                            fontSize: 12,
                            p: 0,
                            minWidth: 0,
                            fontWeight: 600,
                          }}
                        >
                          Đánh dấu đã đọc
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
