"use client";

import { useRouter } from "next/navigation";
import { Box, Typography, Card, CardActionArea } from "@mui/material";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import AuthGuard from "@/src/components/AuthGuard";
import DashboardShell from "@/src/components/dashboard/DashboardShell";

const BRAND = "#7A1F2B";
const BRAND_SOFT = "#FDEDEF";

const options = [
  {
    key: "approve",
    icon: AdminPanelSettingsOutlinedIcon,
    title: "Kiểm duyệt khóa học",
    description:
      "Xem xét và phê duyệt các khóa học đang chờ được kiểm duyệt trước khi xuất bản.",
    tag: "Dành cho quản trị viên",
    route: "/admin/approve-courses",
  },
  {
    key: "manage",
    icon: LibraryBooksOutlinedIcon,
    title: "Xem xét lại khóa học",
    description:
      "Quản lý và theo dõi tất cả các khóa học đang phát hành trên Eduverses.",
    tag: "Dành cho quản trị viên",
    route: "/admin/inspect-courses",
  },
  {
    key: "tasks",
    icon: AssignmentTurnedInOutlinedIcon,
    title: "Phân khóa học kiểm duyệt",
    description:
      "Phân công và quản lý các khóa học cần được kiểm duyệt cho các thành viên trong nhóm.",
    tag: "Dành cho quản trị viên",
    route: "/admin/tasks-course",
  },
];

export default function Step1Page() {
  const router = useRouter();

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
            minHeight: { xs: "auto", sm: "calc(100vh - 64px)" },
            py: { xs: 4, sm: 5 },
            px: { xs: 2, sm: 3 },
            background:
              "radial-gradient(1100px 500px at 50% -10%, #FBE7E9 0%, rgba(251,231,233,0) 60%), #FAFAFA",
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 760, mx: "auto" }}>
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: { xs: 3, sm: 3.5 } }}>
              <Typography
                sx={{
                  display: "inline-block",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: BRAND,
                  bgcolor: BRAND_SOFT,
                  px: 1.75,
                  py: 0.5,
                  borderRadius: "999px",
                  mb: 1.5,
                }}
              >
                Quản lý khóa học
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1.35rem", sm: "1.75rem" },
                  color: "#111827",
                  mb: 1,
                  letterSpacing: "-0.01em",
                }}
              >
                Bạn muốn thực hiện điều gì?
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: 13.5, sm: 15 },
                  color: "#6B7280",
                  maxWidth: 440,
                  mx: "auto",
                  lineHeight: 1.5,
                }}
              >
                Chọn một chức năng bên dưới để tiếp tục với khóa học của bạn.
              </Typography>
            </Box>

            {/* Option cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                gap: { xs: 2, sm: 2.5 },
              }}
            >
              {options.map(
                ({ key, icon: Icon, title, description, tag, route }) => (
                  <Card
                    key={key}
                    variant="outlined"
                    sx={{
                      borderRadius: "18px",
                      borderColor: "#E7E7EA",
                      bgcolor: "#ffffff",
                      boxShadow: "0 1px 2px rgba(17, 24, 39, 0.04)",
                      transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        boxShadow: "0 16px 32px rgba(122, 31, 43, 0.12)",
                        transform: "translateY(-5px)",
                        borderColor: BRAND,
                      },
                      "&:hover .cta-arrow": {
                        transform: "translateX(3px)",
                        opacity: 1,
                      },
                      "&:focus-within": {
                        outline: `2px solid ${BRAND}`,
                        outlineOffset: "2px",
                      },
                    }}
                    onClick={() => router.push(route)}
                  >
                    <CardActionArea
                      sx={{
                        p: { xs: 2.5, sm: 3 },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        height: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          color: BRAND,
                          bgcolor: BRAND_SOFT,
                          borderRadius: "12px",
                          width: 48,
                          height: 48,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 2,
                        }}
                      >
                        <Icon sx={{ fontSize: 26 }} />
                      </Box>

                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          color: "#9CA3AF",
                          mb: 0.75,
                        }}
                      >
                        {tag}
                      </Typography>

                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 17,
                          mb: 0.75,
                          color: "#111827",
                        }}
                      >
                        {title}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 13.5,
                          color: "#6B7280",
                          lineHeight: 1.55,
                          mb: 2,
                          flex: 1,
                        }}
                      >
                        {description}
                      </Typography>

                      <Box
                        sx={{
                          mt: "auto",
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          fontSize: 14,
                          fontWeight: 600,
                          color: BRAND,
                        }}
                      >
                        Bắt đầu
                        <ArrowForwardRoundedIcon
                          className="cta-arrow"
                          sx={{
                            fontSize: 18,
                            opacity: 0.6,
                            transition: "all 0.25s ease",
                          }}
                        />
                      </Box>
                    </CardActionArea>
                  </Card>
                ),
              )}
            </Box>

            <Typography
              sx={{
                mt: 3,
                fontSize: 12.5,
                color: "#9CA3AF",
                textAlign: "center",
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
