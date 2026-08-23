"use client";

import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Box,
  IconButton,
  Chip,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  StarRounded,
  PeopleAltRounded,
  FavoriteRounded,
  ArrowForwardRounded,
  SchoolRounded,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { FavoriteCourse } from "../types/favorite.type";
import { BRAND, CSSVAR, STATUS } from "@/src/theme/tokens";

interface FavoriteCourseCardProps {
  course: FavoriteCourse;
  onRemove: () => void;
}

export default function FavoriteCourseCard({
  course,
  onRemove,
}: FavoriteCourseCardProps) {
  const router = useRouter();

  let badge = "Khóa học";
  let imageUrl = "";

  try {
    const parsed = JSON.parse(course.hinhAnh);
    if (parsed.badge) badge = parsed.badge;
    if (parsed.imageUrl) imageUrl = parsed.imageUrl;
  } catch {
    if (
      course.hinhAnh &&
      (course.hinhAnh.startsWith("http") ||
        course.hinhAnh.startsWith("/") ||
        course.hinhAnh.startsWith("."))
    ) {
      imageUrl = course.hinhAnh;
    }
  }

  const level = course.capDo || badge || "Trung cấp";
  const rating = course.diemDanhGiaTrungBinh ?? null;
  const students = course.soLuongHocVien ?? 0;

  return (
    <Card
      elevation={0}
      onClick={() => router.push(`/student/enroll-courses/${course.khoaHocId}`)}
      sx={{
        borderRadius: "18px",
        border: "1px solid rgba(0,0,0,0.07)",
        bgcolor: "var(--ev-paper, #fff)",
        transition:
          "transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(139,19,19,0.08)",
          borderColor: "rgba(139,19,19,0.18)",
        },
      }}
    >
      {/* Thumbnail Area */}
      <Box
        sx={{
          height: 145,
          position: "relative",
          overflow: "hidden",
          background: imageUrl
            ? `url(${imageUrl}) center/cover no-repeat`
            : "var(--dashboard-surface-muted, #f3f4f6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!imageUrl && (
          <Stack sx={{ alignItems: "center", justifyContent: "center" }}>
            <SchoolRounded sx={{ color: "rgba(31,41,55,0.3)", fontSize: 36 }} />
            <Typography
              sx={{
                color: "rgba(31,41,55,0.35)",
                fontSize: 10,
                fontWeight: 800,
                mt: 0.5,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              EDUVERSE
            </Typography>
          </Stack>
        )}

        {/* Level Tag Overlay */}
        <Chip
          label={level}
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            bgcolor: "rgba(255,255,255,0.92)",
            color: BRAND.main,
            fontWeight: 800,
            fontSize: 10,
            height: 20,
          }}
        />

        {/* Heart Icon Button to Remove from Favorite */}
        <Tooltip title="Bỏ yêu thích" arrow placement="top">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            sx={{
              position: "absolute",
              top: 8,
              right: 10,
              width: 28,
              height: 28,
              bgcolor: "rgba(255, 255, 255, 0.95)",
              color: BRAND.main,
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              zIndex: 5,
              transition: "all 150ms ease",
              p: 0,
              "&:hover": {
                bgcolor: BRAND.main,
                color: "#ffffff",
                transform: "scale(1.08)",
                "& .MuiSvgIcon-root": {
                  color: "#ffffff",
                },
              },
            }}
          >
            <FavoriteRounded sx={{ fontSize: 16, color: BRAND.main }} />
          </IconButton>
        </Tooltip>

        {/* Free Badge */}
        {course.giaTien === 0 && (
          <Chip
            label="MIỄN PHÍ"
            size="small"
            sx={{
              position: "absolute",
              bottom: 8,
              left: 10,
              bgcolor: STATUS.success,
              color: "#fff",
              fontWeight: 900,
              fontSize: 9.5,
              height: 18,
            }}
          />
        )}
      </Box>

      {/* Course Details Content */}
      <CardContent
        sx={{
          p: 2,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Title */}
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 800,
            lineHeight: 1.4,
            color: CSSVAR.textPrimary,
            mb: 0.5,
            height: 39,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {course.tieuDe}
        </Typography>

        {/* Instructor */}
        <Typography
          sx={{
            fontSize: 12,
            color: CSSVAR.textMuted,
            fontWeight: 600,
            mb: 1.25,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {course.giangVien || "Giảng viên EduVerse"}
        </Typography>

        <Divider sx={{ mb: 1.5, opacity: 0.4 }} />

        {/* Price & Rating Row */}
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            mt: "auto",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 15.5,
                fontWeight: 900,
                color: course.giaTien === 0 ? STATUS.success : BRAND.main,
              }}
            >
              {course.giaTien === 0
                ? "Miễn phí"
                : `${course.giaTien.toLocaleString("vi-VN")}đ`}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.2} sx={{ alignItems: "center" }}>
            {rating !== null ? (
              <Stack
                direction="row"
                spacing={0.3}
                sx={{ alignItems: "center" }}
              >
                <StarRounded sx={{ fontSize: 14, color: STATUS.warning }} />
                <Typography
                  sx={{
                    fontSize: 11.5,
                    fontWeight: 800,
                    color: CSSVAR.textPrimary,
                  }}
                >
                  {rating.toFixed(1)}
                </Typography>
              </Stack>
            ) : (
              <Typography
                sx={{
                  fontSize: 11,
                  color: CSSVAR.textMuted,
                  fontStyle: "italic",
                }}
              >
                Chưa có đánh giá
              </Typography>
            )}
            <Stack direction="row" spacing={0.3} sx={{ alignItems: "center" }}>
              <PeopleAltRounded
                sx={{ fontSize: 13, color: "rgba(31,41,55,0.45)" }}
              />
              <Typography
                sx={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "rgba(31,41,55,0.6)",
                }}
              >
                {students.toLocaleString()}
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1}>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            variant="outlined"
            fullWidth
            sx={{
              borderRadius: "11px",
              py: 0.9,
              fontWeight: 700,
              fontSize: 12.5,
              borderColor: "rgba(139,19,19,0.2)",
              color: BRAND.main,
              textTransform: "none",
              "&:hover": {
                bgcolor: "rgba(139,19,19,0.04)",
                borderColor: BRAND.main,
              },
            }}
          >
            Bỏ yêu thích
          </Button>

          <Button
            variant="contained"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/student/enroll-courses/${course.khoaHocId}`);
            }}
            endIcon={<ArrowForwardRounded sx={{ fontSize: 15 }} />}
            fullWidth
            sx={{
              borderRadius: "11px",
              py: 0.9,
              fontWeight: 800,
              fontSize: 12.5,
              bgcolor: BRAND.main,
              color: "#fff",
              boxShadow: "none",
              textTransform: "none",
              "&:hover": {
                bgcolor: "#7F1D1D",
                boxShadow: "none",
              },
            }}
          >
            Xem khóa học
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
