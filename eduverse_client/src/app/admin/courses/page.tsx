"use client";

import { useRouter } from "next/navigation";
import { Box, Typography, Card, CardActionArea, Divider } from "@mui/material";
import { Source_Serif_4, Inter } from "next/font/google";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import AuthGuard from "@/src/components/AuthGuard";
import DashboardShell from "@/src/components/dashboard/DashboardShell";

const serif = Source_Serif_4({
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700"],
  display: "swap",
});
const sans = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const BRAND = "#7A1F2B";
const BRAND_DEEP = "#4E1119";
const PARCHMENT = "#FBF7F1";
const PARCHMENT_DEEP = "#F1E6DA";
const INK = "#241A1D";
const INK_MUTED = "#8B7F78";
const GOLD = "#B8862E";
const HAIRLINE = "#E8DFD4";

const options = [
  {
    key: "approve",
    numeral: "I",
    icon: AdminPanelSettingsOutlinedIcon,
    title: "Kiểm duyệt khóa học",
    description:
      "Xem xét và phê duyệt các khóa học đang chờ được kiểm duyệt trước khi xuất bản.",
    tag: "Quản trị viên",
    route: "/admin/approve-courses",
  },
  {
    key: "manage",
    numeral: "II",
    icon: LibraryBooksOutlinedIcon,
    title: "Xem xét lại khóa học",
    description:
      "Quản lý và theo dõi tất cả các khóa học đang phát hành trên Eduverses.",
    tag: "Quản trị viên",
    route: "/admin/inspect-courses",
  },
  {
    key: "tasks",
    numeral: "III",
    icon: AssignmentTurnedInOutlinedIcon,
    title: "Phân khóa học kiểm duyệt",
    description:
      "Phân công và quản lý các khóa học cần được kiểm duyệt cho các thành viên trong nhóm.",
    tag: "Quản trị viên",
    route: "/admin/tasks-course",
  },
];

export default function Step1Page() {
  const router = useRouter();

  return (
    <AuthGuard allowedRoles={["Admin", "personnel"]}>
      <DashboardShell>
        <Box
          className={sans.className}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            minHeight: { xs: "auto", sm: "calc(100vh - 64px)" },
            py: { xs: 5, sm: 7 },
            px: { xs: 2, sm: 3 },
            background: `
              radial-gradient(900px 420px at 50% -8%, ${PARCHMENT_DEEP} 0%, rgba(241,230,218,0) 62%),
              ${PARCHMENT}
            `,
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 980, mx: "auto" }}>
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: { xs: 4, sm: 5 } }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  fontSize: 11.5,
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: BRAND,
                  border: `1px solid ${BRAND}`,
                  px: 1.75,
                  py: 0.6,
                  mb: 2.5,
                  "&::before, &::after": {
                    content: '""',
                    display: "block",
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    bgcolor: GOLD,
                  },
                }}
              >
                Quản lý khóa học
              </Box>

              <Typography
                className={serif.className}
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.7rem", sm: "2.3rem" },
                  color: INK,
                  mb: 1.25,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.15,
                }}
              >
                Bạn muốn thực hiện điều gì?
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: 13.5, sm: 15 },
                  color: INK_MUTED,
                  maxWidth: 460,
                  mx: "auto",
                  lineHeight: 1.6,
                }}
              >
                Chọn một chức năng bên dưới để tiếp tục với khóa học của bạn.
              </Typography>
            </Box>

            {/* Option cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: { xs: 2.5, sm: 3 },
              }}
            >
              {options.map(
                ({
                  key,
                  numeral,
                  icon: Icon,
                  title,
                  description,
                  tag,
                  route,
                }) => (
                  <Card
                    key={key}
                    variant="outlined"
                    sx={{
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: "6px",
                      borderColor: HAIRLINE,
                      borderTop: `3px solid ${BRAND}`,
                      bgcolor: "#ffffff",
                      boxShadow: "0 1px 2px rgba(36, 26, 29, 0.05)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        boxShadow: "0 18px 34px rgba(122, 31, 43, 0.14)",
                        transform: "translateY(-5px)",
                        borderColor: HAIRLINE,
                      },
                      "&:hover .seal": {
                        transform: "rotate(0deg)",
                        borderColor: BRAND,
                      },
                      "&:hover .cta-arrow": {
                        transform: "translateX(3px)",
                        opacity: 1,
                      },
                      "&:focus-within": {
                        outline: `2px solid ${GOLD}`,
                        outlineOffset: "2px",
                      },
                    }}
                    onClick={() => router.push(route)}
                  >
                    {/* ghost numeral */}
                    <Typography
                      className={serif.className}
                      aria-hidden
                      sx={{
                        position: "absolute",
                        top: -18,
                        right: 4,
                        fontSize: 100,
                        fontWeight: 700,
                        color: BRAND_DEEP,
                        opacity: 0.05,
                        lineHeight: 1,
                        userSelect: "none",
                        pointerEvents: "none",
                      }}
                    >
                      {numeral}
                    </Typography>

                    <CardActionArea
                      sx={{
                        p: { xs: 2.75, sm: 3.25 },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        height: "100%",
                        position: "relative",
                      }}
                    >
                      {/* stamped seal */}
                      <Box
                        className="seal"
                        sx={{
                          color: BRAND,
                          bgcolor: PARCHMENT,
                          border: `1.5px dashed ${BRAND}`,
                          borderRadius: "50%",
                          width: 52,
                          height: 52,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 2.25,
                          transform: "rotate(-6deg)",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <Icon sx={{ fontSize: 24 }} />
                      </Box>

                      <Typography
                        sx={{
                          fontSize: 10.5,
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: GOLD,
                          mb: 1,
                        }}
                      >
                        {tag}
                      </Typography>

                      <Typography
                        className={serif.className}
                        sx={{
                          fontWeight: 700,
                          fontSize: 18.5,
                          mb: 1,
                          color: INK,
                          lineHeight: 1.3,
                        }}
                      >
                        {title}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 13.5,
                          color: INK_MUTED,
                          lineHeight: 1.6,
                          mb: 2.5,
                          flex: 1,
                        }}
                      >
                        {description}
                      </Typography>

                      <Divider
                        sx={{ width: "100%", borderColor: HAIRLINE, mb: 2 }}
                      />

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: BRAND,
                        }}
                      >
                        Bắt đầu
                        <ArrowForwardRoundedIcon
                          className="cta-arrow"
                          sx={{
                            fontSize: 17,
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

            <Box
              sx={{
                mt: 4,
                pt: 2.5,
                borderTop: `1px solid ${HAIRLINE}`,
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: 12.5, color: INK_MUTED }}>
                Bạn có thể kiểm duyệt hoặc quản lý khóa học từ đây bất cứ lúc
                nào.
              </Typography>
            </Box>
          </Box>
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}
