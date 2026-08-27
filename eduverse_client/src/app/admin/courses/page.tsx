"use client";

import { useRouter } from "next/navigation";
import { Box, Typography, Card, CardActionArea } from "@mui/material";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AuthGuard from "@/src/components/AuthGuard";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import { CSSVAR, BRAND as BRAND_TOKEN } from "@/src/theme/tokens";

const BRAND = BRAND_TOKEN.main;
const BRAND_SOFT = "rgba(139,19,19,0.08)";
const FONT = "var(--font-primary, var(--ev-font-family, 'Be Vietnam Pro', sans-serif))";

import { useSelector } from "@/src/store/hook";

const options = [
  {
    key: "approve",
    step: "01",
    icon: AdminPanelSettingsOutlinedIcon,
    title: "Kiểm duyệt khóa học",
    description:
      "Xem xét và phê duyệt các khóa học đang chờ được kiểm duyệt trước khi xuất bản.",
    tag: "Dành cho quản trị viên",
    route: "/admin/approve-courses",
    personnelRoute: "/personnel/approve-courses",
    accent: BRAND,
    accentSoft: "rgba(139,19,19,0.08)",
  },
  {
    key: "manage",
    step: "02",
    icon: LibraryBooksOutlinedIcon,
    title: "Xem xét lại khóa học",
    description:
      "Quản lý và theo dõi tất cả các khóa học đang phát hành trên Eduverses.",
    tag: "Dành cho quản trị viên",
    route: "/admin/inspect-courses",
    personnelRoute: "/personnel/inspect-courses",
    accent: "#B45309",
    accentSoft: "rgba(180,83,9,0.08)",
  },
];

export default function Step1Page() {
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
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            minHeight: { xs: "auto", sm: "calc(100vh - 64px)" },
            py: { xs: 4, sm: 5 },
            px: { xs: 2, sm: 3 },
            bgcolor: "transparent",
            fontFamily: FONT,
          }}
        >
          <Box sx={{ position: "relative", width: "100%", maxWidth: 820, mx: "auto" }}>
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: { xs: 4, sm: 5 } }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.75,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: BRAND,
                  bgcolor: BRAND_SOFT,
                  px: 2,
                  py: 0.75,
                  borderRadius: "999px",
                  mb: 2,
                  fontFamily: FONT,
                  border: `1px solid ${BRAND}22`,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: BRAND,
                    display: "inline-block",
                  }}
                />
                Quản lý khóa học
              </Box>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                  color: CSSVAR.textPrimary,
                  mb: 1.25,
                  letterSpacing: "-0.015em",
                  fontFamily: FONT,
                }}
              >
                Bạn muốn thực hiện điều gì?
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: 13.5, sm: 15 },
                  color: CSSVAR.textSecondary,
                  maxWidth: 460,
                  mx: "auto",
                  lineHeight: 1.6,
                  fontFamily: FONT,
                }}
              >
                Chọn một chức năng bên dưới để tiếp tục với khóa học của bạn.
              </Typography>
            </Box>

            {/* Option cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                gap: { xs: 2, sm: 2.5 },
              }}
            >
              {options.map(
                ({ key, step, icon: Icon, title, description, tag, route, personnelRoute, accent, accentSoft }) => (
                  <Card
                    key={key}
                    variant="outlined"
                    sx={{
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: "20px",
                      borderColor: CSSVAR.divider,
                      bgcolor: CSSVAR.paper,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: `linear-gradient(90deg, ${accent}, ${accent}99)`,
                        opacity: 0.85,
                      },
                      "&:hover": {
                        boxShadow: `0 18px 36px ${accentSoft}`,
                        transform: "translateY(-6px)",
                        borderColor: accent,
                      },
                      "&:hover .cta-arrow": {
                        transform: "translateX(3px)",
                        opacity: 1,
                      },
                      "&:hover .card-icon-badge": {
                        transform: "scale(1.06)",
                      },
                      "&:focus-within": {
                        outline: `2px solid ${accent}`,
                        outlineOffset: "2px",
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
                        p: { xs: 2.75, sm: 3.25 },
                        pt: { xs: 3, sm: 3.5 },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        height: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          mb: 2,
                        }}
                      >
                        <Box
                          className="card-icon-badge"
                          sx={{
                            color: accent,
                            bgcolor: accentSoft,
                            borderRadius: "14px",
                            width: 50,
                            height: 50,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "transform 0.28s ease",
                          }}
                        >
                          <Icon sx={{ fontSize: 26 }} />
                        </Box>

                        <Typography
                          sx={{
                            fontSize: 22,
                            fontWeight: 800,
                            color: CSSVAR.divider,
                            lineHeight: 1,
                            fontFamily: FONT,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {step}
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: accent,
                          mb: 0.75,
                          fontFamily: FONT,
                        }}
                      >
                        {tag}
                      </Typography>

                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 17,
                          mb: 0.75,
                          color: CSSVAR.textPrimary,
                          fontFamily: FONT,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {title}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 13.5,
                          color: CSSVAR.textSecondary,
                          lineHeight: 1.6,
                          mb: 2.5,
                          flex: 1,
                          fontFamily: FONT,
                        }}
                      >
                        {description}
                      </Typography>

                      <Box
                        sx={{
                          mt: "auto",
                          width: "100%",
                          pt: 1.5,
                          borderTop: `1px solid ${CSSVAR.divider}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontSize: 14,
                          fontWeight: 700,
                          color: accent,
                          fontFamily: FONT,
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
                color: CSSVAR.textSecondary,
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
