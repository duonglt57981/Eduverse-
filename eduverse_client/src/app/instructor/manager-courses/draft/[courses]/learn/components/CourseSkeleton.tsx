"use client";

import { Box, AppBar, Toolbar, Skeleton } from "@mui/material";

export const CourseSkeleton = () => (
  <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar sx={{ gap: 2 }}>
        <Skeleton variant="rectangular" width={110} height={34} />
        <Skeleton variant="text" sx={{ flex: 1 }} />
        <Skeleton variant="rounded" width={100} height={36} />
      </Toolbar>
    </AppBar>
    <Box sx={{ flex: 1, display: "flex" }}>
      <Box sx={{ flex: 1, p: 3 }}>
        <Skeleton
          variant="rectangular"
          height={360}
          sx={{ borderRadius: 2, mb: 2 }}
        />
        <Skeleton variant="text" width="60%" height={36} />
        <Skeleton variant="rounded" height={70} sx={{ mt: 2 }} />
      </Box>
      <Skeleton
        variant="rectangular"
        width={380}
        sx={{ borderLeft: 1, borderColor: "divider" }}
      />
    </Box>
  </Box>
);
