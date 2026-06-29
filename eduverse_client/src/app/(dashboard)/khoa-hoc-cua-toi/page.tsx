'use client';

import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Skeleton,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useDispatch, useSelector } from "../../../store/hook";
import { getKhoaHocDaDangKy } from "../../../store/khoaHoc/KhoaHocSlice";
import { useRouter } from "next/navigation";

const PRIMARY = "#9b1c1c";

export default function KhoaHocCuaToiPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { daDangKys =[], loading } = useSelector((s) => s.khoaHoc);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    dispatch(getKhoaHocDaDangKy());
  }, [dispatch]);

  return (
    <Box sx={{ bgcolor: "#f9f8f6", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 24, fontWeight: 800 }}>
              Khóa học của tôi
            </Typography>

            <Typography sx={{ color: "text.secondary", fontSize: 14, mt: 0.5 }}>
              Chào mừng trở lại! Bạn đang có{" "}
              <Box component="span" sx={{ color: PRIMARY, fontWeight: 700 }}>
                {daDangKys.length} khóa học
              </Box>{" "}
              đang tiến hành.
            </Typography>
          </Box>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            mb: 3,
            "& .MuiTab-root": { fontWeight: 600, fontSize: 14 },
            "& .Mui-selected": { color: PRIMARY },
            "& .MuiTabs-indicator": { bgcolor: PRIMARY },
          }}
        >
          <Tab label="Tất cả" />
          <Tab label="Đang học" />
          <Tab label="Đã hoàn thành" />
          <Tab label="Yêu thích" />
        </Tabs>

        <Grid container spacing={2.5}>
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Skeleton
                    variant="rectangular"
                    height={200}
                    sx={{ borderRadius: 3 }}
                  />
                  <Skeleton sx={{ mt: 1 }} />
                  <Skeleton width="60%" />
                </Grid>
              ))
            : daDangKys.map((kh) => (
                <Grid key={kh.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      transition: "transform 0.2s",
                      "&:hover": { transform: "translateY(-4px)" },
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <CardMedia
                        component="img"
                        height="180"
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
                          fontSize: 14,
                          lineHeight: 1.4,
                          mb: 1.5,
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
                          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                            Tiến độ hoàn thành
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 12,
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
                            height: 6,
                            bgcolor: "#f0e8e8",
                            "& .MuiLinearProgress-bar": { bgcolor: PRIMARY },
                          }}
                        />
                      </Box>

                      <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 1.5 }}>
                        0/{kh.tongBaiGiang ?? 0} Bài học
                      </Typography>

                      <Button
                        fullWidth
                        variant="contained"
                        endIcon={<PlayArrowIcon />}
                        onClick={() => router.push(`/khoahoc/${kh.id}/hoc`)}
                        sx={{
                          bgcolor: PRIMARY,
                          "&:hover": { bgcolor: "#7f1d1d" },
                          borderRadius: 2,
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        Tiếp tục học
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
        </Grid>
      </Container>
    </Box>
  );
}