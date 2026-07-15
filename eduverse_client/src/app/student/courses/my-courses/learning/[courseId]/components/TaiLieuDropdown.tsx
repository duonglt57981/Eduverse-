"use client";

import { useState, useCallback } from "react";
import {
  Box,
  ListItemButton,
  Typography,
  Collapse,
  Stack,
  IconButton,
  alpha,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AttachFile as AttachFileIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { TaiLieuType } from "@/src/types/TaiLieu/Dto/TaiLieuDto";

const PRIMARY_RED = "#8B1313";

interface TaiLieuDropdownProps {
  danhSachTaiLieu: TaiLieuType[];
}

export const TaiLieuDropdown = ({ danhSachTaiLieu }: TaiLieuDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [downloading, setDL] = useState<string | null>(null);

  const extractDriveId = useCallback((url: string) => {
    for (const p of [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /[?&]id=([a-zA-Z0-9_-]+)/,
    ]) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  }, []);

  const handleDownload = useCallback(
    async (tl: TaiLieuType, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!tl.url) return;
      const key = tl.id ?? tl.url;
      setDL(key);
      try {
        const driveId = extractDriveId(tl.url);
        if (driveId) {
          window.open(
            `https://drive.google.com/uc?export=download&id=${driveId}`,
            "_blank",
          );
        } else {
          const res = await fetch(tl.url, { mode: "cors", cache: "no-store" });
          const blob = await res.blob();
          const getExt = () => {
            const nameExt = (tl.tenTaiLieu ?? "").match(
              /\.([a-zA-Z0-9]+)$/,
            )?.[1];
            if (nameExt) return nameExt.toLowerCase();
            const urlExt = tl
              .url!.split("?")[0]
              .match(/\.([a-zA-Z0-9]+)$/)?.[1];
            if (urlExt) return urlExt.toLowerCase();
            const ct = res.headers.get("Content-Type") ?? blob.type;
            const ctMap: Record<string, string> = {
              "application/pdf": "pdf",
              "application/msword": "doc",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                "docx",
              "application/vnd.ms-excel": "xls",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                "xlsx",
              "application/vnd.ms-powerpoint": "ppt",
              "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                "pptx",
              "image/jpeg": "jpg",
              "image/png": "png",
              "image/gif": "gif",
              "text/plain": "txt",
            };
            const matched = Object.keys(ctMap).find((k) => ct.includes(k));
            return matched ? ctMap[matched] : "pdf";
          };
          const ext = getExt();
          const baseName = (tl.tenTaiLieu ?? "tai-lieu").replace(
            /\.[a-zA-Z0-9]+$/,
            "",
          );
          const fileName = `${baseName}.${ext}`;
          const href = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = href;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(href);
        }
      } catch {
        window.open(tl.url, "_blank");
      } finally {
        setTimeout(() => setDL(null), 3000);
      }
    },
    [extractDriveId],
  );

  return (
    <Box sx={{ borderTop: "1px solid", borderColor: "divider" }}>
      <ListItemButton
        onClick={() => setOpen((v) => !v)}
        sx={{ pl: 4, py: 0.75 }}
      >
        <AttachFileIcon sx={{ fontSize: 14, color: PRIMARY_RED, mr: 0.75 }} />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ flex: 1, fontWeight: 500 }}
        >
          {danhSachTaiLieu.length} tài liệu
        </Typography>
        {open ? (
          <ExpandLessIcon sx={{ fontSize: 16 }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: 16 }} />
        )}
      </ListItemButton>
      <Collapse in={open}>
        <Stack sx={{ pl: 4, pr: 1.5, pb: 1, gap: 0.5 }}>
          {danhSachTaiLieu.map((tl, idx) => {
            const isPdf = tl.loaiTaiLieu === "PDF";
            const key = tl.id ?? tl.url ?? idx;
            const isLoading = downloading === key;
            return (
              <Box
                key={key}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: isLoading
                    ? alpha(PRIMARY_RED, 0.08)
                    : alpha("#000", 0.02),
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                {isPdf ? (
                  <PictureAsPdfIcon
                    sx={{ fontSize: 15, color: PRIMARY_RED, flexShrink: 0 }}
                  />
                ) : (
                  <DescriptionIcon
                    sx={{ fontSize: 15, color: "#2980b9", flexShrink: 0 }}
                  />
                )}
                <Typography
                  variant="caption"
                  sx={{ flex: 1, fontWeight: 500 }}
                  noWrap
                >
                  {isLoading ? "Đang tải..." : tl.tenTaiLieu}
                </Typography>
                {!isLoading && (
                  <IconButton
                    size="small"
                    onClick={(e) => handleDownload(tl, e)}
                    sx={{ color: PRIMARY_RED, p: 0.3 }}
                  >
                    <DownloadIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Box>
            );
          })}
        </Stack>
      </Collapse>
    </Box>
  );
};
