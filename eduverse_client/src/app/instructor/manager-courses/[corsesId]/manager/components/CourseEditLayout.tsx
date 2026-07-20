"use client";

import { ReactNode, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosNew";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import { PhanHocType } from "@/src/types/PhanHoc/Dto/PhanHocdto";
import { MAU, TrangThaiKhoaHoc, thongTinTrangThai } from "./courseEditCore";
import CourseStatusAction from "./CourseStatusAction";
import type { MucThieu } from "./courseEditCore";

export interface MucSidebar {
  key: string;
  nhan: string;
  hoanThanh: boolean;
}

export interface NhomSidebar {
  tieuDe: string;
  muc: MucSidebar[];
}

interface Props {
  children: ReactNode;
  tenKhoaHoc: string;
  trangThai: TrangThaiKhoaHoc;
  thoiLuongDaTai: string;
  thongTinKhoaHoc: KhoaHocType;
  phans: PhanHocType[];
  lyDoTuChoi?: string | null;
  nhomSidebar?: NhomSidebar[];
  activeKey: string;
  loading?: boolean;
  onBack: () => void;
  onNavigateSidebar: (key: string) => void;
  onGuiPheDuyet: () => Promise<void>;
  onDiChuyenDenTuValidate: (diChuyenDen: MucThieu["diChuyenDen"]) => void;
  onRefreshData?: () => void;
}

export default function CourseEditLayout({
  children,
  tenKhoaHoc,
  trangThai,
  thoiLuongDaTai,
  thongTinKhoaHoc,
  phans,
  lyDoTuChoi,
  nhomSidebar = [],
  activeKey,
  loading = false,
  onBack,
  onNavigateSidebar,
  onGuiPheDuyet,
  onDiChuyenDenTuValidate,
  onRefreshData,
}: Props) {
  const [anchorXemTruoc, setAnchorXemTruoc] = useState<null | HTMLElement>(
    null,
  );
  const trangThaiHienThi = thongTinTrangThai(trangThai);

  // Kiểm tra nếu đang ở trạng thái không cho phép chỉnh sửa
  const isReadOnly = trangThai === "ChoDuyet" || trangThai === "DangDuyet";

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress sx={{ color: MAU.chinh }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fff" }}>
      {/* Header */}
      <Box sx={{ bgcolor: "#1c1d1f", color: "#fff" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 1.5,
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              minWidth: 0,
              flex: "1 1 auto",
            }}
          >
            <Box
              onClick={onBack}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                color: "#ddd",
                "&:hover": { color: "#fff" },
                flexShrink: 0,
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 14 }} />
              <Typography sx={{ fontSize: 14, whiteSpace: "nowrap" }}>
                Quay lại
              </Typography>
            </Box>

            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: 14, sm: 15, md: 17 },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: "#fff",
                flex: "1 1 auto",
                minWidth: 80,
              }}
              title={tenKhoaHoc}
            >
              {tenKhoaHoc || "Chưa đặt tên"}
            </Typography>

            <Chip
              label={trangThaiHienThi.nhan}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: 11,
                bgcolor: "rgba(255,255,255,0.14)",
                color: "#fff",
                flexShrink: 0,
              }}
            />

            <Typography
              sx={{
                fontSize: 13,
                color: "#aaa",
                display: { xs: "none", md: "block" },
                flexShrink: 0,
              }}
            >
              {thoiLuongDaTai}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexShrink: 0,
            }}
          >
            <Button
              onClick={(e) => setAnchorXemTruoc(e.currentTarget)}
              endIcon={<KeyboardArrowDownIcon />}
              sx={{
                color: "#fff",
                textTransform: "none",
                fontWeight: 700,
                border: "1px solid rgba(255,255,255,0.4)",
                borderRadius: "8px",
                px: 2,
              }}
            >
              Xem trước
            </Button>
            <Menu
              anchorEl={anchorXemTruoc}
              open={Boolean(anchorXemTruoc)}
              onClose={() => setAnchorXemTruoc(null)}
            >
              <MenuItem onClick={() => setAnchorXemTruoc(null)}>
                Xem trang đích
              </MenuItem>
              <MenuItem onClick={() => setAnchorXemTruoc(null)}>
                Xem chương trình giảng dạy
              </MenuItem>
            </Menu>

            <CourseStatusAction
              trangThai={trangThai}
              thongTinKhoaHoc={thongTinKhoaHoc}
              phans={phans}
              lyDoTuChoi={lyDoTuChoi}
              onGuiPheDuyet={onGuiPheDuyet}
              onDiChuyenDen={onDiChuyenDenTuValidate}
            />

            <IconButton size="small" sx={{ color: "#ddd" }}>
              <SettingsOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Main content */}
      <Box sx={{ display: "flex", alignItems: "flex-start" }}>
        <Box
          sx={{
            width: 280,
            flexShrink: 0,
            px: 3,
            py: 4,
            display: { xs: "none", md: "block" },
          }}
        >
          {Array.isArray(nhomSidebar) &&
            nhomSidebar.map((nhom) => (
              <Box key={nhom.tieuDe} sx={{ mb: 3.5 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 14.5,
                    mb: 1.5,
                    color: MAU.chuDen,
                  }}
                >
                  {nhom.tieuDe}
                </Typography>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}
                >
                  {nhom.muc.map((m) => {
                    const dangChon = m.key === activeKey;
                    return (
                      <Box
                        key={m.key}
                        onClick={() => {
                          if (isReadOnly) return;
                          onNavigateSidebar(m.key);
                        }}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          py: 0.75,
                          pl: dangChon ? 1.25 : 1.5,
                          borderLeft: dangChon
                            ? `3px solid ${MAU.chinh}`
                            : "3px solid transparent",
                          cursor: isReadOnly ? "not-allowed" : "pointer",
                          borderRadius: "4px",
                          bgcolor: dangChon ? MAU.chinhNhat : "transparent",
                          opacity: isReadOnly ? 0.6 : 1,
                          "&:hover": {
                            bgcolor: isReadOnly ? "transparent" : MAU.chinhNhat,
                          },
                        }}
                      >
                        {m.hoanThanh ? (
                          <CheckCircleIcon
                            sx={{ fontSize: 18, color: MAU.chinh }}
                          />
                        ) : (
                          <RadioButtonUncheckedIcon
                            sx={{ fontSize: 18, color: "#ccc" }}
                          />
                        )}
                        <Typography
                          sx={{
                            fontSize: 13.5,
                            fontWeight: dangChon ? 700 : 500,
                            color: dangChon ? MAU.chuDen : "#444",
                          }}
                        >
                          {m.nhan}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ))}
        </Box>

        <Box sx={{ flex: 1, px: { xs: 2, md: 4 }, py: 4, minWidth: 0 }}>
          {isReadOnly && (
            <Box
              sx={{
                mb: 3,
                px: 2,
                py: 1.25,
                borderRadius: "10px",
                bgcolor: "#FFF8E1",
                border: "1px solid #FFE082",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography
                sx={{ fontSize: 13.5, color: "#F57C00", fontWeight: 600 }}
              >
                ⏳ Khóa học đang trong quá trình duyệt — mọi nội dung bị khóa,
                không thể chỉnh sửa cho đến khi có kết quả phê duyệt.
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              pointerEvents: isReadOnly ? "none" : "auto",
              opacity: isReadOnly ? 0.6 : 1,
              transition: "opacity .15s ease",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
