"use client";

import { useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  LinearProgress,
  Chip,
} from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SchoolIcon from "@mui/icons-material/School";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useDispatch, useSelector } from "../../../store/hook";
import {
  getKhoaHocDaDangKy,
  getKhoaHocPaged,
} from "../../../store/khoaHoc/KhoaHocSlice";
import { useRouter } from "next/navigation";

const PRIMARY = "#9b1c1c";

export default function TrangChuPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((s) => s.auth);
  const { daDangKys =[], pagedResult } = useSelector((s) => s.khoaHoc);

  useEffect(() => {
    dispatch(getKhoaHocDaDangKy());
    dispatch(getKhoaHocPaged({ pageIndex: 1, pageSize: 4 }));
  }, [dispatch]);

  const stats = [
    { icon: <SchoolIcon />, label: "Khóa học", value: daDangKys.length },
    { icon: <AccessTimeIcon />, label: "Giờ đã học", value: "0h" },
    { icon: <WorkspacePremiumIcon />, label: "Chứng chỉ", value: 0 },
    { icon: <TrendingUpIcon />, label: "Tiến độ", value: "0%" },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Card
        sx={{
          borderRadius: 3,
          mb: 3,
          overflow: "hidden",
          position: "relative",
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #5c1111 100%)`,
          color: "#fff",
        }}
      >
        <CardContent sx={{ p: 3, position: "relative", zIndex: 1 }}>
          <Typography sx={{ fontSize: 13, opacity: 0.8, mb: 0.5 }}>
            Chào mừng trở lại
          </Typography>

          <Typography sx={{ fontSize: 24, fontWeight: 800, mb: 1 }}>
            Chào mừng trở lại, {user?.hoTen ?? "bạn"}!
          </Typography>

          <Typography sx={{ fontSize: 13, opacity: 0.8, mb: 2, maxWidth: 400 }}>
            Bạn đã hoàn thành 65% mục tiêu học tập trong tuần này. Tiếp tục phát
            huy nhé!
          </Typography>

          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              borderRadius: 2,
              fontWeight: 700,
              fontSize: 13,
              backdropFilter: "blur(4px)",
            }}
          >
            Tiếp tục bài học gần nhất
          </Button>
        </CardContent>

        <Box
          sx={{
            position: "absolute",
            right: -40,
            top: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.05)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            right: 60,
            bottom: -60,
            width: 150,
            height: 150,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.04)",
          }}
        />
      </Card>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, i) => (
          <Grid key={i} size={{ xs: 6, sm: 3 }}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: "#fff0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: PRIMARY,
                }}
              >
                {stat.icon}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 20 }}>
                  {stat.value}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  {stat.label}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
              Khóa học đang học
            </Typography>
            <Button
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => router.push("/khoa-hoc-cua-toi")}
              sx={{ color: PRIMARY, fontSize: 13, fontWeight: 600 }}
            >
              Xem tất cả
            </Button>
          </Box>

          {daDangKys.length === 0 ? (
            <Card
              sx={{
                borderRadius: 3,
                p: 4,
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <SchoolIcon sx={{ fontSize: 48, color: "#ddd", mb: 1 }} />
              <Typography sx={{ color: "text.secondary", fontSize: 14, mb: 2 }}>
                Bạn chưa đăng ký khóa học nào
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push("/kham-pha")}
                sx={{
                  bgcolor: PRIMARY,
                  "&:hover": { bgcolor: "#7f1d1d" },
                  borderRadius: 2,
                }}
              >
                Khám phá khóa học
              </Button>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {(Array.isArray(daDangKys) ? daDangKys : []).slice(0, 2).map((kh) => (
                <Grid key={kh.id} size={{ xs: 12, sm: 6 }}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      cursor: "pointer",
                      "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.1)" },
                    }}
                    onClick={() => router.push(`/khoahoc/${kh.id}/hoc`)}
                  >
                    <Box sx={{ position: "relative" }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={kh.hinhAnhKhoaHoc || "/placeholder.jpg"}
                        alt={kh.tieuDe}
                      />
                      {kh.loaiKhoaHoc && (
                        <Chip
                          label={kh.loaiKhoaHoc}
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            bgcolor: PRIMARY,
                            color: "#fff",
                            fontSize: 11,
                          }}
                        />
                      )}
                    </Box>

                    <CardContent sx={{ p: 2 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: 13,
                          lineHeight: 1.4,
                          mb: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {kh.tieuDe}
                      </Typography>

                      <Box sx={{ mb: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            sx={{ fontSize: 11, color: "text.secondary" }}
                          >
                            Tiến độ
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: PRIMARY,
                            }}
                          >
                            0%
                          </Typography>
                        </Box>

                        <LinearProgress
                          variant="determinate"
                          value={0}
                          sx={{
                            borderRadius: 4,
                            height: 5,
                            bgcolor: "#f0e8e8",
                            "& .MuiLinearProgress-bar": { bgcolor: PRIMARY },
                          }}
                        />
                      </Box>

                      <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        endIcon={<PlayArrowIcon />}
                        sx={{
                          bgcolor: PRIMARY,
                          "&:hover": { bgcolor: "#7f1d1d" },
                          borderRadius: 2,
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        Tiếp tục học
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 3,
              mb: 2,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
              Khóa học đề xuất
            </Typography>
            <Button
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => router.push("/kham-pha")}
              sx={{ color: PRIMARY, fontSize: 13, fontWeight: 600 }}
            >
              Xem tất cả
            </Button>
          </Box>

          <Grid container spacing={2}>
            {(pagedResult?.items ?? []).slice(0, 2).map((kh) => (
              <Grid key={kh.id} size={{ xs: 12, sm: 6 }}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    cursor: "pointer",
                    "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.1)" },
                  }}
                  onClick={() => router.push(`/khoahoc/${kh.id}`)}
                >
                  <CardMedia
                    component="img"
                    height="130"
                    image={kh.hinhAnhKhoaHoc || "/placeholder.jpg"}
                    alt={kh.tieuDe}
                  />
                  <CardContent sx={{ p: 2 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: 13,
                        lineHeight: 1.4,
                        mb: 1,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {kh.tieuDe}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{ fontWeight: 700, fontSize: 13, color: PRIMARY }}
                      >
                        {kh.gia
                          ? kh.gia.toLocaleString("vi-VN") + "đ"
                          : "Miễn phí"}
                      </Typography>

                      <Button
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: PRIMARY,
                          color: PRIMARY,
                          borderRadius: 2,
                          fontSize: 11,
                          py: 0.3,
                          "&:hover": { bgcolor: PRIMARY, color: "#fff" },
                        }}
                      >
                        Xem chi tiết
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              p: 2.5,
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                Lịch học hôm nay
              </Typography>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                {new Date().toLocaleDateString("vi-VN", {
                  day: "numeric",
                  month: "long",
                })}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: 13,
                color: "text.secondary",
                textAlign: "center",
                py: 2,
              }}
            >
              Không có lịch học hôm nay
            </Typography>
          </Card>

          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              p: 2.5,
              mb: 2,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 2 }}>
              Bài kiểm tra gần đây
            </Typography>
            <Typography
              sx={{
                fontSize: 13,
                color: "text.secondary",
                textAlign: "center",
                py: 2,
              }}
            >
              Chưa có bài kiểm tra nào
            </Typography>
          </Card>

          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              p: 2.5,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 2 }}>
              Chứng chỉ tiêu biểu
            </Typography>
            <Box sx={{ textAlign: "center", py: 2 }}>
              <WorkspacePremiumIcon sx={{ fontSize: 48, color: "#ddd" }} />
              <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 1 }}>
                Hoàn thành khóa học để nhận chứng chỉ
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
