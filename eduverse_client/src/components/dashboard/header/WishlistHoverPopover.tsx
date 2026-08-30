/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Box,
  Typography,
  Button,
  Divider,
  Stack,
  Popper,
  Paper,
  Fade,
} from "@mui/material";
import { FavoriteBorderOutlined, SchoolRounded } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { FavoriteCourse } from "@/src/features/favorite/types/favorite.type";
import { BRAND } from "@/src/theme/tokens";
import { useDispatch } from "@/src/store/hook";
import { themVaoGioHang } from "@/src/store/gioHang/GioHangSlice";
import Swal from "sweetalert2";

interface WishlistHoverPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  favorites: FavoriteCourse[];
}

function getCourseImage(hinhAnh?: string): string {
  if (!hinhAnh) return "";
  try {
    const parsed = JSON.parse(hinhAnh);
    if (parsed.imageUrl) return parsed.imageUrl;
  } catch {}
  if (
    hinhAnh.startsWith("http") ||
    hinhAnh.startsWith("/") ||
    hinhAnh.startsWith(".")
  ) {
    return hinhAnh;
  }
  return "";
}

export default function WishlistHoverPopover({
  anchorEl,
  open,
  onMouseEnter,
  onMouseLeave,
  favorites,
}: WishlistHoverPopoverProps) {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleAddToCart = async (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    try {
      await dispatch(themVaoGioHang(courseId)).unwrap();
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Đã thêm vào giỏ hàng!",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (err: any) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "info",
        title: typeof err === "string" ? err : "Đã có trong giỏ hàng",
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      transition
      sx={{ zIndex: 99999, pointerEvents: "auto" }}
      modifiers={[
        {
          name: "offset",
          options: {
            offset: [0, 4],
          },
        },
        {
          name: "preventOverflow",
          options: {
            padding: 12,
          },
        },
      ]}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={150}>
          <Box
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            sx={{ pt: "8px", mt: "-4px", pointerEvents: "auto" }}
          >
            <Paper
              elevation={0}
              sx={{
                width: 320,
                maxWidth: "calc(100vw - 24px)",
                borderRadius: "12px",
                border: "1px solid rgba(0,0,0,0.1)",
                boxShadow: "0 14px 40px rgba(0,0,0,0.18)",
                bgcolor: "background.paper",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* List items (Scrollable) */}
              <Box sx={{ maxHeight: 380, overflowY: "auto", p: 1.5 }}>
                {favorites.length === 0 ? (
                  <Box sx={{ py: 4, px: 2, textAlign: "center" }}>
                    <FavoriteBorderOutlined
                      sx={{ fontSize: 36, color: "text.disabled", mb: 1 }}
                    />
                    <Typography
                      sx={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: "text.secondary",
                        mb: 1.5,
                      }}
                    >
                      Danh sách mong ước của bạn đang trống.
                    </Typography>
                    <Button
                      onClick={() => {
                        router.push("/student/dashboard");
                      }}
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: 13,
                        color: BRAND.main,
                      }}
                    >
                      Khám phá khóa học
                    </Button>
                  </Box>
                ) : (
                  <Stack spacing={1.5} divider={<Divider sx={{ my: 0.5 }} />}>
                    {favorites.map((course) => {
                      const img = getCourseImage(course.hinhAnh);
                      const isFree = !course.giaTien || course.giaTien <= 0;
                      return (
                        <Box
                          key={course.id}
                          onClick={() => {
                            router.push(
                              `/student/enroll-courses/${course.khoaHocId}`,
                            );
                          }}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            cursor: "pointer",
                            p: 0.5,
                            borderRadius: "8px",
                            transition: "background-color 150ms ease",
                            "&:hover": {
                              bgcolor: "rgba(0,0,0,0.02)",
                              "& .item-title": {
                                color: BRAND.main,
                              },
                            },
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1.25}
                            sx={{ alignItems: "flex-start" }}
                          >
                            {/* Thumbnail */}
                            <Box
                              sx={{
                                width: 64,
                                height: 64,
                                borderRadius: "8px",
                                flexShrink: 0,
                                overflow: "hidden",
                                background: img
                                ? `url(${img}) center/cover no-repeat`
                                  : "var(--dashboard-surface-muted, #f3f4f6)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {!img && (
                                <SchoolRounded
                                  sx={{ fontSize: 24, color: "text.disabled" }}
                                />
                              )}
                            </Box>

                            {/* Content */}
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Typography
                                className="item-title"
                                sx={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  lineHeight: 1.35,
                                  color: "text.primary",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  transition: "color 150ms ease",
                                }}
                              >
                                {course.tieuDe}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: 11.5,
                                  color: "text.secondary",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  mt: 0.25,
                                }}
                              >
                                {course.giangVien || "Giảng viên EduVerse"}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: 13.5,
                                  fontWeight: 800,
                                  color: "text.primary",
                                  mt: 0.25,
                                }}
                              >
                                {isFree
                                  ? "Miễn phí"
                                  : `${course.giaTien.toLocaleString("vi-VN")} đ`}
                              </Typography>
                            </Box>
                          </Stack>

                          {/* Add to Cart button under each item */}
                          <Button
                            variant="outlined"
                            fullWidth
                            onClick={(e) => handleAddToCart(e, course.khoaHocId)}
                            sx={{
                              borderRadius: "6px",
                              py: 0.5,
                              fontSize: 12.5,
                              fontWeight: 700,
                              borderColor: "rgba(139, 19, 19, 0.3)",
                              color: BRAND.main,
                              textTransform: "none",
                              "&:hover": {
                                bgcolor: "rgba(139, 19, 19, 0.04)",
                                borderColor: BRAND.main,
                              },
                            }}
                          >
                            Thêm vào giỏ hàng
                          </Button>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>

              {/* Footer bottom button */}
              {favorites.length > 0 && (
                <Box
                  sx={{
                    p: 1.5,
                    borderTop: "1px solid rgba(0,0,0,0.08)",
                    bgcolor: "var(--dashboard-surface, #fff)",
                  }}
                >
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => {
                      router.push("/student/favorites");
                    }}
                    sx={{
                      borderRadius: "8px",
                      py: 1,
                      fontSize: 13.5,
                      fontWeight: 800,
                      bgcolor: BRAND.main,
                      color: "#ffffff",
                      boxShadow: "none",
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: BRAND.dark,
                        boxShadow: "none",
                      },
                    }}
                  >
                    Chuyển đến danh sách mong ước
                  </Button>
                </Box>
              )}
            </Paper>
          </Box>
        </Fade>
      )}
    </Popper>
  );
}
