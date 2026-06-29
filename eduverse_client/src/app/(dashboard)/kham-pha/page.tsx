"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  Pagination,
  Skeleton,
  Rating,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useDispatch, useSelector } from "../../../store/hook";
import {
  getKhoaHocPaged,
  getDanhMuc,
  toggleYeuThich,
} from "../../../store/khoaHoc/KhoaHocSlice";
import { themVaoGioHang } from "../../../store/gioHang/GioHangSlice";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

const PRIMARY = "#9b1c1c";

export default function KhamPhaPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { pagedResult, danhMucs, loading } = useSelector((s) => s.khoaHoc);

  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("keyword") ?? "");

  const [danhMucId, setDanhMucId] = useState("");
  const [capDo, setCapDo] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );

  useEffect(() => {
    dispatch(getDanhMuc());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      getKhoaHocPaged({
        pageIndex: page,
        pageSize: 8,
        search,
        danhMucId,
        capDo,
      }),
    );
  }, [dispatch, page, search, danhMucId, capDo]);

  const formatGia = (gia?: number) =>
    gia ? `${gia.toLocaleString("vi-VN")}đ` : "Miễn phí";

  return (
    <Box sx={{ bgcolor: "#f9f8f6", minHeight: "100vh", py: 3 }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Sidebar filter */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box
              sx={{
                bgcolor: "#fff",
                borderRadius: 3,
                p: 2.5,
                position: "sticky",
                top: 80,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 2 }}>
                Danh mục
              </Typography>

              <FormGroup>
                {danhMucs.map((dm) => (
                  <FormControlLabel
                    key={dm.id}
                    control={
                      <Checkbox
                        size="small"
                        checked={danhMucId === dm.id}
                        onChange={() =>
                          setDanhMucId(danhMucId === dm.id ? "" : dm.id)
                        }
                        sx={{
                          color: PRIMARY,
                          "&.Mui-checked": { color: PRIMARY },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: 13 }}>
                        {dm.tenDanhMuc}
                      </Typography>
                    }
                  />
                ))}
              </FormGroup>

              <Divider sx={{ my: 2 }} />

              <FormControl>
                <FormLabel
                  sx={{ fontWeight: 700, fontSize: 15, color: "#111", mb: 1 }}
                >
                  Cấp độ
                </FormLabel>

                <RadioGroup
                  value={capDo}
                  onChange={(e) => setCapDo(e.target.value)}
                >
                  {["", "Sơ cấp", "Trung cấp", "Cao cấp"].map((c) => (
                    <FormControlLabel
                      key={c}
                      value={c}
                      control={
                        <Radio
                          size="small"
                          sx={{
                            color: PRIMARY,
                            "&.Mui-checked": { color: PRIMARY },
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: 13 }}>
                          {c || "Tất cả"}
                        </Typography>
                      }
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>
          </Grid>

          {/* Main content */}
          <Grid size={{ xs: 12, md: 9 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm khóa học, kỹ năng..."
              size="small"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              sx={{
                mb: 3,
                bgcolor: "#fff",
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": {
                    borderColor: PRIMARY,
                  },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2 }}>
              Tất cả khóa học ({pagedResult?.totalCount ?? 0})
            </Typography>

            <Grid container spacing={2}>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <Skeleton
                        variant="rectangular"
                        height={180}
                        sx={{ borderRadius: 2 }}
                      />
                      <Skeleton sx={{ mt: 1 }} />
                      <Skeleton width="60%" />
                    </Grid>
                  ))
                : pagedResult?.items.map((kh) => (
                    <Grid key={kh.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <Card
                        sx={{
                          borderRadius: 3,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                          cursor: "pointer",
                          transition: "transform 0.2s",
                          "&:hover": { transform: "translateY(-4px)" },
                        }}
                        onClick={() => router.push(`/khoahoc/${kh.id}`)}
                      >
                        <Box sx={{ position: "relative" }}>
                          <CardMedia
                            component="img"
                            height="160"
                            image={kh.hinhAnhKhoaHoc || "/placeholder.jpg"}
                            alt={kh.tieuDe}
                          />

                          {kh.capDo && (
                            <Chip
                              label={kh.capDo}
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

                          <Box
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              bgcolor: "rgba(255,255,255,0.9)",
                              borderRadius: "50%",
                              width: 32,
                              height: 32,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(toggleYeuThich(kh.id));
                            }}
                          >
                            {kh.daYeuThich ? (
                              <FavoriteIcon
                                sx={{ fontSize: 18, color: PRIMARY }}
                              />
                            ) : (
                              <FavoriteBorderIcon
                                sx={{ fontSize: 18, color: "#999" }}
                              />
                            )}
                          </Box>
                        </Box>

                        <CardContent sx={{ p: 1.5 }}>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: 13,
                              lineHeight: 1.4,
                              mb: 0.5,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {kh.tieuDe}
                          </Typography>

                          <Rating
                            value={4.5}
                            readOnly
                            size="small"
                            precision={0.5}
                            sx={{ mb: 0.5 }}
                          />

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: 700,
                                fontSize: 14,
                                color: PRIMARY,
                              }}
                            >
                              {formatGia(kh.gia)}
                            </Typography>

                            {kh.giaGoc && kh.giaGoc > (kh.gia ?? 0) && (
                              <Typography
                                sx={{
                                  fontSize: 12,
                                  color: "#999",
                                  textDecoration: "line-through",
                                }}
                              >
                                {formatGia(kh.giaGoc)}
                              </Typography>
                            )}
                          </Box>

                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            sx={{
                              mt: 1,
                              borderColor: PRIMARY,
                              color: PRIMARY,
                              borderRadius: 2,
                              fontSize: 12,
                              "&:hover": { bgcolor: PRIMARY, color: "#fff" },
                            }}
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await dispatch(themVaoGioHang(kh.id)).unwrap();
                                setAlertMessage("Thêm vào giỏ hàng thành công");
                                setAlertSeverity("success");
                                setOpen(true);
                              } catch (message) {
                                setAlertMessage(String(message));
                                setAlertSeverity("error");
                                setOpen(true);
                              }
                            }}
                          >
                            Thêm vào giỏ
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
            </Grid>

            {pagedResult && pagedResult.totalPage > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 4,
                }}
              >
                <Pagination
                  count={pagedResult.totalPage}
                  page={page}
                  onChange={(_, v) => setPage(v)}
                  sx={{
                    "& .MuiPaginationItem-root.Mui-selected": {
                      bgcolor: PRIMARY,
                      color: "#fff",
                    },
                  }}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
      >
        <Alert severity={alertSeverity} onClose={() => setOpen(false)}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
