"use client";

import { useRouter } from "next/navigation";
import { Box, Typography, Card, CardActionArea, Stack } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AuthGuard from "@/src/components/AuthGuard";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import { CSSVAR, BRAND as BRAND_TOKEN } from "@/src/theme/tokens";
import { useSelector } from "@/src/store/hook";

const BRAND = BRAND_TOKEN.main;
const FONT = "var(--font-primary, var(--ev-font-family, 'Be Vietnam Pro', sans-serif))";

const options = [
  {
    key: "approve",
    tag: "Chờ phê duyệt",
    title: "Kiểm duyệt khóa học",
    description:
      "Xem xét, kiểm tra nội dung bài giảng, video và bài kiểm tra đang chờ được duyệt trước khi xuất bản lên hệ thống.",
    buttonLabel: "Bắt đầu kiểm duyệt",
    route: "/admin/approve-courses",
    personnelRoute: "/personnel/approve-courses",
    accent: BRAND,
    accentSoft: "rgba(139, 19, 19, 0.06)",
  },
  {
    key: "manage",
    tag: "Toàn bộ hệ thống",
    title: "Xem xét lại khóa học",
    description:
      "Quản lý, tra cứu lịch sử kiểm duyệt và theo dõi trạng thái của tất cả các khóa học đang phát hành trên Eduverse.",
    buttonLabel: "Xem danh sách khóa học",
    route: "/admin/inspect-courses",
    personnelRoute: "/personnel/inspect-courses",
    accent: "#0F172A",
    accentSoft: "rgba(15, 23, 42, 0.05)",
  },
];

export default function CoursesHubPage() {
  const router = useRouter();
  const roles = useSelector((s) => s.auth.roles) || [];
  const isPersonnel =
    roles.some(
      (r: string) =>
        r.toLowerCase() === "personnel" ||
        r.toLowerCase() === "nhanvien" ||
        r.toLowerCase() === "kiemduyet",
    ) && !roles.includes("Admin");

  return (
    <AuthGuard allowedRoles={["Admin", "personnel"]}>
      <DashboardShell>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            minHeight: { xs: "auto", sm: "calc(100vh - 70px)" },
            py: { xs: 5, sm: 7 },
            px: { xs: 2.5, sm: 4 },
            bgcolor: "transparent",
            fontFamily: FONT,
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 840, mx: "auto" }}>
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: { xs: 4, sm: 5 } }}>
              <Typography
                sx={{
                  display: "inline-block",
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: BRAND,
                  bgcolor: "rgba(139, 19, 19, 0.06)",
                  px: 2,
                  py: 0.6,
                  borderRadius: "999px",
                  mb: 2,
                  fontFamily: FONT,
                  border: "1px solid rgba(139, 19, 19, 0.14)",
                }}
              >
                Quản lý khóa học
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1.65rem", sm: "2.15rem" },
                  color: "#0F172A",
                  mb: 1.25,
                  letterSpacing: "-0.025em",
                  fontFamily: FONT,
                }}
              >
                Bạn muốn thực hiện điều gì?
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: 14, sm: 15 },
                  color: "#64748B",
                  maxWidth: 480,
                  mx: "auto",
                  lineHeight: 1.6,
                  fontFamily: FONT,
                }}
              >
                Chọn một chức năng bên dưới để tiếp tục với quy trình làm việc của bạn.
              </Typography>
            </Box>

            {/* Option Cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                gap: { xs: 2.5, sm: 3 },
              }}
            >
              {options.map(
                ({ key, tag, title, description, buttonLabel, route, personnelRoute, accent, accentSoft }) => (
                  <Card
                    key={key}
                    elevation={0}
                    sx={{
                      position: "relative",
                      borderRadius: "20px",
                      border: "1.5px solid #E2E8F0",
                      bgcolor: "#FFFFFF",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                      transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        bgcolor: accent,
                        opacity: 0,
                        transition: "opacity 0.25s ease",
                      },
                      "&:hover": {
                        transform: "translateY(-4px)",
                        borderColor: key === "approve" ? "rgba(139, 19, 19, 0.35)" : "#94A3B8",
                        boxShadow:
                          key === "approve"
                            ? "0 16px 36px rgba(139, 19, 19, 0.09)"
                            : "0 16px 36px rgba(15, 23, 42, 0.08)",
                        "&::before": {
                          opacity: 1,
                        },
                        "& .card-action-btn": {
                          bgcolor: key === "approve" ? BRAND : "#0F172A",
                          color: "#FFFFFF",
                          borderColor: "transparent",
                        },
                        "& .card-arrow-icon": {
                          transform: "translateX(4px)",
                        },
                      },
                    }}
                    onClick={() =>
                      router.push(
                        isPersonnel && personnelRoute
                          ? personnelRoute
                          : route,
                      )
                    }
                  >
                    <CardActionArea
                      sx={{
                        p: { xs: 3, sm: 3.5 },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        height: "100%",
                        flex: 1,
                      }}
                    >
                      <Box sx={{ width: "100%" }}>
                        {/* Tag */}
                        <Box
                          sx={{
                            display: "inline-block",
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            color: accent,
                            bgcolor: accentSoft,
                            px: 1.5,
                            py: 0.4,
                            borderRadius: "6px",
                            mb: 2,
                            fontFamily: FONT,
                          }}
                        >
                          {tag}
                        </Box>

                        {/* Title */}
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: { xs: 18, sm: 20 },
                            color: "#0F172A",
                            mb: 1.25,
                            fontFamily: FONT,
                            letterSpacing: "-0.015em",
                          }}
                        >
                          {title}
                        </Typography>

                        {/* Description */}
                        <Typography
                          sx={{
                            fontSize: 13.5,
                            color: "#64748B",
                            lineHeight: 1.65,
                            fontFamily: FONT,
                            mb: 3,
                          }}
                        >
                          {description}
                        </Typography>
                      </Box>

                      {/* Action Button */}
                      <Box
                        className="card-action-btn"
                        sx={{
                          width: "100%",
                          py: 1.2,
                          px: 2,
                          borderRadius: "12px",
                          bgcolor: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                          color: "#334155",
                          fontSize: 13.5,
                          fontWeight: 700,
                          fontFamily: FONT,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          transition: "all 0.25s ease",
                        }}
                      >
                        <span>{buttonLabel}</span>
                        <ArrowForwardRoundedIcon
                          className="card-arrow-icon"
                          sx={{
                            fontSize: 18,
                            transition: "transform 0.25s ease",
                          }}
                        />
                      </Box>
                    </CardActionArea>
                  </Card>
                ),
              )}
            </Box>

            {/* Subtle Footer Note */}
            <Typography
              sx={{
                mt: 4,
                fontSize: 12.5,
                color: "#94A3B8",
                textAlign: "center",
                fontFamily: FONT,
              }}
            >
              Bạn có thể kiểm duyệt hoặc quản lý khóa học từ đây bất cứ lúc nào.
            </Typography>
          </Box>
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}
