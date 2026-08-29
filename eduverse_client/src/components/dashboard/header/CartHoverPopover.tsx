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
import { ShoppingCartOutlined, SchoolRounded } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { GioHangDto } from "@/src/types/gioHang.d";
import { BRAND } from "@/src/theme/tokens";

interface CartHoverPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  gioHang: GioHangDto | null;
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

export default function CartHoverPopover({
  anchorEl,
  open,
  onMouseEnter,
  onMouseLeave,
  gioHang,
}: CartHoverPopoverProps) {
  const router = useRouter();
  const items = gioHang?.items || [];
  const totalPrice = items.reduce((sum, item) => sum + (item.gia || 0), 0);

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
            offset: [0, 2],
          },
        },
      ]}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={180}>
          <Box
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            sx={{ pt: "6px", pointerEvents: "auto" }}
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
              <Box sx={{ maxHeight: 360, overflowY: "auto", p: 1.5 }}>
                {items.length === 0 ? (
                  <Box sx={{ py: 4, px: 2, textAlign: "center" }}>
                    <ShoppingCartOutlined
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
                      Giỏ hàng của bạn đang trống.
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
                    {items.map((item) => {
                      const img = getCourseImage(item.hinhAnh);
                      const isFree = !item.gia || item.gia <= 0;
                      const instructor =
                        item.tenTacGia ||
                        (item.danhSachGiangVien && item.danhSachGiangVien.length > 0
                          ? item.danhSachGiangVien.join(", ")
                          : "Giảng viên EduVerse");

                      return (
                        <Box
                          key={item.id}
                          onClick={() => {
                            if (item.idKhoaHoc) {
                              router.push(
                                `/student/enroll-courses/${item.idKhoaHoc}`,
                              );
                            } else {
                              router.push("/student/cart");
                            }
                          }}
                          sx={{
                            display: "flex",
                            gap: 1.25,
                            alignItems: "flex-start",
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
                              {item.tenKhoaHoc}
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
                              {instructor}
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
                                : `${item.gia?.toLocaleString("vi-VN")} đ`}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>

              {/* Footer Total + Checkout button */}
              {items.length > 0 && (
                <Box
                  sx={{
                    p: 1.5,
                    borderTop: "1px solid rgba(0,0,0,0.08)",
                    bgcolor: "var(--dashboard-surface, #fff)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: "text.primary",
                      mb: 1,
                    }}
                  >
                    Tổng: {totalPrice.toLocaleString("vi-VN")} đ
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => {
                      router.push("/student/cart");
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
                    Chuyển đến giỏ hàng
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
