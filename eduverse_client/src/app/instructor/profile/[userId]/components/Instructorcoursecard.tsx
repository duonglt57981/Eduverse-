// src/app/instructor/profile/[userId]/components/InstructorCourseCard.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Stack,
  Chip,
  Box,
  Button,
} from "@mui/material"; // thêm Button
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import PlayLessonOutlinedIcon from "@mui/icons-material/PlayLessonOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import {
  formatGiaTien,
  formatSoLuong,
  formatThoiLuong,
} from "./types/Constants";
import SafeHTML from "./common/SafeHTML";

interface InstructorCourseCardProps {
  khoaHoc: KhoaHocType;
  onClick?: (khoaHoc: KhoaHocType) => void;
}

export default function InstructorCourseCard({
  khoaHoc,
  onClick,
}: InstructorCourseCardProps) {
  const router = useRouter();

  const khAny = khoaHoc as unknown as Record<string, unknown>;

  const coGiaGoc =
    khoaHoc.giaGoc !== undefined &&
    khoaHoc.giaGoc !== null &&
    khoaHoc.gia !== undefined &&
    khoaHoc.giaGoc > (khoaHoc.gia ?? 0);

  const laMienPhi = (khoaHoc.gia ?? 0) === 0;

  const thoiLuong =
    khoaHoc.tongThoiLuong ||
    (khAny.thoiLuong as number) ||
    (khAny.tongThoiGian as number) ||
    0;
  const tongBaiGiang =
    khoaHoc.soLuongBaiGiang ||
    (khAny.tongBaiGiang as number) ||
    (khAny.soBaiGiang as number) ||
    0;
  const soHocVien =
    khoaHoc.soLuongHocVien ||
    (khAny.tongHocVien as number) ||
    (khAny.soHocVien as number) ||
    0;
  const soLuongDanhGia =
    khoaHoc.soLuongDanhGia ||
    (khAny.soLuongDanhGia as number) ||
    (khAny.tongDanhGia as number) ||
    0;
  const diemDanhGiaTrungBinh =
    khoaHoc.diemDanhGiaTrungBinh ||
    (khAny.diemDanhGia as number) ||
    (khAny.diemDanhGia as number) ||
    0;

  // Lấy thông tin đăng ký
  const daDangKy = (khAny.daDangKy as boolean) ?? false;
  const idDangKiKhoaHoc = khAny.idDangKiKhoaHoc as string | undefined;

  const cleanMoTa = (khoaHoc.moTa || "")
    .replace(/<p>\s*<strong>\s*Mô tả khóa học\s*<\/strong>\s*<\/p>/gi, "")
    .replace(/Mô tả khóa học/gi, "")
    .trim();

  const soSaoDay = Math.min(5, Math.max(0, Math.round(diemDanhGiaTrungBinh)));
  const diemHienThi = diemDanhGiaTrungBinh.toFixed(1);

  const thongKe = [
    { icon: AccessTimeOutlinedIcon, label: formatThoiLuong(thoiLuong) },
    { icon: PlayLessonOutlinedIcon, label: `${tongBaiGiang} bài` },
    { icon: GroupsOutlinedIcon, label: `${formatSoLuong(soHocVien)} học viên` },
  ];

  // Xử lý click vào card: nếu đã đăng ký thì điều hướng học, ngược lại gọi onClick
  const handleCardClick = () => {
    if (daDangKy && idDangKiKhoaHoc) {
      router.push(`/student/courses/my-courses/learning/${idDangKiKhoaHoc}`);
    } else {
      onClick?.(khoaHoc);
    }
  };

  // Xử lý click nút "Tiếp tục học" (có thể stop propagation để không trigger card click nếu muốn, nhưng ở đây ta có thể để nó cùng hành động)
  const handleContinueClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // ngăn không cho card click kích hoạt thêm lần nữa, nhưng nếu dùng chung logic thì không cần thiết
    if (daDangKy && idDangKiKhoaHoc) {
      router.push(`/student/courses/my-courses/learning/${idDangKiKhoaHoc}`);
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "20px",
        border: "1px solid var(--ev-divider, #ECE7E4)",
        bgcolor: "var(--ev-paper, #FFFFFF)",
        boxShadow: "0 2px 10px rgba(31,41,55,0.04)",
        transition:
          "box-shadow 0.28s ease, border-color 0.28s ease, transform 0.28s ease",
        overflow: "hidden",
        "&:hover": {
          boxShadow: "0 18px 36px rgba(139,19,19,0.10)",
          borderColor: "rgba(139,19,19,0.28)",
          transform: "translateY(-3px)",
        },
        "& *": {
          fontFamily:
            "var(--font-primary, var(--ev-font-family, 'Be Vietnam Pro', sans-serif)) !important",
        },
      }}
    >
      <CardActionArea
        onClick={handleCardClick}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        {/* Ảnh */}
        <Box
          sx={{ position: "relative", overflow: "hidden", aspectRatio: "16/9" }}
        >
          <CardMedia
            component="img"
            image={khoaHoc.hinhAnhKhoaHoc || "/images/course-placeholder.png"}
            alt={khoaHoc.tieuDe}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.45s ease",
              ".MuiCardActionArea-root:hover &": {
                transform: "scale(1.05)",
              },
            }}
          />

          {/* Overlay gradient nhẹ để chip/text nổi hơn */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 35%)",
              pointerEvents: "none",
            }}
          />

          {khoaHoc.capDo && (
            <Chip
              size="small"
              label={khoaHoc.capDo}
              sx={{
                position: "absolute",
                top: 10,
                left: 10,
                zIndex: 2,
                bgcolor: "rgba(31, 41, 55, 0.78)",
                color: "#FFFFFF",
                backdropFilter: "blur(8px)",
                fontWeight: 700,
                fontSize: 11,
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.22)",
              }}
            />
          )}
          {/* Đã bỏ badge "Đã đăng ký" */}
        </Box>

        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            width: "100%",
            p: 2.25,
          }}
        >
          {/* Tiêu đề */}
          <Typography
            variant="subtitle1"
            title={khoaHoc.tieuDe}
            sx={{
              fontWeight: 800,
              fontSize: 15.5,
              color: "var(--ev-text-primary, #1F2937)",
              lineHeight: 1.35,
              mb: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: 42,
            }}
          >
            {khoaHoc.tieuDe}
          </Typography>

          {/* Đánh giá */}
          <Stack
            direction="row"
            spacing={0.6}
            sx={{ alignItems: "center", mb: 1.25 }}
          >
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 13,
                color: "#B45309",
                lineHeight: 1,
              }}
            >
              {diemHienThi}
            </Typography>
            <Stack direction="row" sx={{ alignItems: "center" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <StarRoundedIcon
                  key={i}
                  sx={{
                    fontSize: 15,
                    color: i < soSaoDay ? "#F59E0B" : "rgba(0,0,0,0.15)",
                  }}
                />
              ))}
            </Stack>
            <Typography
              variant="caption"
              sx={{
                fontSize: 11.5,
                color: "var(--ev-text-secondary, #4B5563)",
              }}
            >
              ({formatSoLuong(soLuongDanhGia)})
            </Typography>
          </Stack>

          {/* Mô tả */}
          {cleanMoTa && (
            <SafeHTML
              html={cleanMoTa}
              lineClamp={2}
              expandable={false}
              sx={{
                mb: 2,
                fontSize: "0.85rem",
                color: "var(--ev-text-secondary, #4B5563)",
                lineHeight: 1.5,
              }}
            />
          )}

          {/* Thống kê: bài giảng / thời lượng / học viên */}
          <Stack
            direction="row"
            spacing={0.8}
            sx={{ mb: 2, flexWrap: "wrap", gap: 0.8 }}
          >
            {thongKe.map(({ icon: Icon, label }, i) => (
              <Stack
                key={i}
                direction="row"
                spacing={0.5}
                sx={{
                  alignItems: "center",
                  px: 1,
                  py: 0.4,
                  borderRadius: "8px",
                  bgcolor: "var(--ev-paper-alt, #F7F5F2)",
                }}
              >
                <Icon
                  sx={{
                    fontSize: 14,
                    color: "var(--ev-text-secondary, #4B5563)",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    fontSize: 11,
                    color: "var(--ev-text-secondary, #4B5563)",
                  }}
                >
                  {label}
                </Typography>
              </Stack>
            ))}
          </Stack>

          {/* Phần giá hoặc nút "Tiếp tục học" nếu đã đăng ký */}
          <Box
            sx={{
              mt: "auto",
              pt: 1.5,
              borderTop: "1px dashed var(--ev-divider, #ECE7E4)",
            }}
          >
            {daDangKy ? (
              // Nếu đã đăng ký -> hiển thị nút "Tiếp tục học"
              <Button
                variant="contained"
                fullWidth
                onClick={handleContinueClick}
                sx={{
                  bgcolor: "#8B1313",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: "8px",
                  py: 0.8,
                  fontSize: "0.9rem",
                  "&:hover": {
                    bgcolor: "#6B0F0F",
                  },
                }}
              >
                Tiếp tục học
              </Button>
            ) : (
              // Chưa đăng ký -> hiển thị giá
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "baseline" }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 900,
                    fontSize: 17,
                    color: laMienPhi ? "#15803D" : "#8B1313",
                  }}
                >
                  {laMienPhi ? "Miễn phí" : formatGiaTien(khoaHoc.gia)}
                </Typography>
                {coGiaGoc && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.disabled",
                      textDecoration: "line-through",
                      fontSize: 12.5,
                    }}
                  >
                    {formatGiaTien(khoaHoc.giaGoc)}
                  </Typography>
                )}
              </Stack>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
