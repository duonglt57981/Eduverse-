"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
  Dialog,
  Tooltip,
  alpha,
} from "@mui/material";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { COLORS, FONTS, getFileKind, getFileName } from "../types/constants";
import StatusChip from "./StatusChip";

const VIEW_HEIGHT = "42vh";
const VIEW_MIN_HEIGHT = 320;
const VIEW_MAX_HEIGHT = 480;
const FULL_HEIGHT = "calc(100vh - 132px)";

const clipFixSx = {
  isolation: "isolate" as const,
  transform: "translateZ(0)",
  WebkitMaskImage: "-webkit-radial-gradient(white, black)",
  contain: "paint" as const,
};

const TOOLBAR_CROP_PX = 48;

export default function NoiDungViewer({ selected }: { selected: any }) {
  const [openFull, setOpenFull] = useState(false);

  if (!selected) {
    return (
      <Box
        sx={{
          minHeight: VIEW_MIN_HEIGHT,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SchoolRoundedIcon
          sx={{ fontSize: 40, color: alpha(COLORS.primary, 0.2), mb: 1.5 }}
        />
        <Typography sx={{ color: COLORS.inkSoft, fontFamily: FONTS.body }}>
          Chọn một bài giảng hoặc tài liệu bên phải để xem nội dung
        </Typography>
      </Box>
    );
  }

  const { loai, item } = selected;
  const title =
    loai === "baiGiang"
      ? item.tenBaiGiang || item.tieuDe || "Bài giảng"
      : item.tenTaiLieu || item.tieuDe || "Tài liệu";
  const url =
    item.duongDan ??
    item.url ??
    item.videoUrl ??
    item.fileUrl ??
    item.link ??
    item.urlBaiGiang ??
    null;

  return (
    <Box sx={{ width: "100%", maxWidth: "100%", overflow: "hidden" }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
        {loai === "baiGiang" ? (
          <PlayCircleIcon sx={{ color: COLORS.primary }} />
        ) : (
          <AttachFileIcon sx={{ color: COLORS.primary }} />
        )}
        <Typography
          sx={{
            flex: 1,
            fontFamily: FONTS.display,
            fontWeight: 600,
            fontSize: 18,
            color: COLORS.ink,
          }}
          noWrap
        >
          {title}
        </Typography>
        <StatusChip trangThai={item.trangThaiPheDuyet} />
        {url && (
          <Tooltip title="Xem toàn màn hình">
            <IconButton
              size="small"
              onClick={() => setOpenFull(true)}
              sx={{
                color: COLORS.inkSoft,
                border: `1px solid ${COLORS.line}`,
                borderRadius: 1.5,
                "&:hover": {
                  color: COLORS.primary,
                  borderColor: COLORS.primary,
                },
              }}
            >
              <FullscreenRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <Box sx={{ mb: 2 }}>
        <ViewerBody
          loai={loai}
          url={url}
          item={item}
          height={VIEW_HEIGHT}
          minHeight={VIEW_MIN_HEIGHT}
          maxHeight={VIEW_MAX_HEIGHT}
          mode="inline"
        />
      </Box>

      {url && (
        <Dialog
          open={openFull}
          onClose={() => setOpenFull(false)}
          fullWidth
          maxWidth="lg"
          slotProps={{
            paper: {
              sx: { borderRadius: 2, bgcolor: COLORS.paperRaised ?? "#fff" },
            },
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "center",
              px: 2,
              py: 1.25,
              borderBottom: `1px solid ${COLORS.line}`,
            }}
          >
            {loai === "baiGiang" ? (
              <PlayCircleIcon sx={{ color: COLORS.primary }} />
            ) : (
              <AttachFileIcon sx={{ color: COLORS.primary }} />
            )}
            <Typography
              sx={{
                flex: 1,
                fontFamily: FONTS.display,
                fontWeight: 600,
                fontSize: 17,
                color: COLORS.ink,
              }}
              noWrap
            >
              {title}
            </Typography>
            <IconButton size="small" onClick={() => setOpenFull(false)}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Box sx={{ p: 2 }}>
            <ViewerBody
              loai={loai}
              url={url}
              item={item}
              height={FULL_HEIGHT}
              minHeight={VIEW_MIN_HEIGHT}
              maxHeight={FULL_HEIGHT}
              mode="full"
            />
          </Box>
        </Dialog>
      )}
    </Box>
  );
}

function ViewerBody({
  loai,
  url,
  item,
  height,
  minHeight,
  maxHeight,
  mode = "inline",
}: {
  loai: string;
  url: string | null;
  item: any;
  height: string | number;
  minHeight: string | number;
  maxHeight: string | number;
  mode?: "inline" | "full";
}) {
  if (!url) {
    return (
      <Box
        sx={{
          height,
          minHeight,
          maxHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: COLORS.paper,
          borderRadius: 2,
          border: `1px dashed ${COLORS.line}`,
        }}
      >
        <Typography sx={{ color: COLORS.inkSoft }}>
          Chưa có nội dung để xem trước.
        </Typography>
      </Box>
    );
  }

  if (loai === "baiGiang") {
    return (
      <Box
        sx={{
          width: "100%",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "#000",
          height,
          minHeight,
          maxHeight,
          lineHeight: 0,
          display: mode === "full" ? "flex" : undefined,
          alignItems: mode === "full" ? "center" : undefined,
          justifyContent: mode === "full" ? "center" : undefined,
          ...clipFixSx,
        }}
      >
        <video
          key={url}
          src={url}
          controls
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: mode === "full" ? "contain" : "cover",
            objectPosition: "center",
          }}
        />
      </Box>
    );
  }

  return (
    <TaiLieuPreview
      url={url}
      tenTaiLieu={item.tenTaiLieu || item.tieuDe || "Tài liệu"}
      height={height}
      minHeight={minHeight}
      maxHeight={maxHeight}
    />
  );
}

function TaiLieuPreview({
  url,
  tenTaiLieu,
  height,
  minHeight,
  maxHeight,
}: {
  url: string;
  tenTaiLieu: string;
  height: string | number;
  minHeight: string | number;
  maxHeight: string | number;
}) {
  const kind = getFileKind(url);
  const fileName = getFileName(url, tenTaiLieu);

  const frameBox = (children: React.ReactNode) => (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        borderRadius: 2,
        overflow: "hidden",
        border: `1px solid ${COLORS.line}`,
        height,
        minHeight,
        maxHeight,
        position: "relative",
        ...clipFixSx,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {children}
      </Box>
    </Box>
  );

  if (kind === "pdf") {
    return frameBox(
      <iframe
        src={url}
        title={fileName}
        width="100%"
        height="100%"
        scrolling="no"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: `calc(100% + ${TOOLBAR_CROP_PX}px)`,
          maxWidth: "100%",
          border: "none",
          display: "block",
          overflow: "hidden",
        }}
      />,
    );
  }

  if (kind === "image") {
    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          borderRadius: 2,
          overflow: "hidden",
          border: `1px solid ${COLORS.line}`,
          bgcolor: "#F5F1EE",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height,
          minHeight,
          maxHeight,
          ...clipFixSx,
        }}
      >
        <Box
          component="img"
          src={url}
          alt={fileName}
          sx={{
            maxWidth: "100%",
            maxHeight: "100%",
            display: "block",
            objectFit: "contain",
          }}
        />
      </Box>
    );
  }

  if (kind === "office") {
    const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    return frameBox(
      <iframe
        src={viewerUrl}
        title={fileName}
        width="100%"
        height="100%"
        scrolling="no"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: `calc(100% + ${TOOLBAR_CROP_PX}px)`,
          maxWidth: "100%",
          border: "none",
          display: "block",
          overflow: "hidden",
        }}
      />,
    );
  }

  return (
    <Stack
      spacing={1.5}
      sx={{
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        alignItems: "center",
        justifyContent: "center",
        height,
        minHeight,
        maxHeight,
        border: `1px dashed ${COLORS.line}`,
        borderRadius: 2,
        bgcolor: COLORS.paper,
      }}
    >
      <Typography variant="body2" sx={{ color: COLORS.inkSoft }}>
        Định dạng file này chưa hỗ trợ xem trước trực tiếp.
      </Typography>
      <Button
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        variant="outlined"
        startIcon={<OpenInNewRoundedIcon />}
        sx={{
          textTransform: "none",
          borderColor: COLORS.primary,
          color: COLORS.primary,
          "&:hover": {
            borderColor: COLORS.primaryDark,
            bgcolor: alpha(COLORS.primary, 0.04),
          },
        }}
      >
        Mở tài liệu
      </Button>
    </Stack>
  );
}
