// src/app/instructor/manager-courses/components/CourseListItem.tsx
"use client";

import { Box, Typography, Chip, IconButton, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";
import SchoolIcon from "@mui/icons-material/School";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import { R, isValidImg, statusChip } from "../types/constants";

interface CourseListItemProps {
  course: KhoaHocType;
  isDraft: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onOpenMenu: (e: React.MouseEvent<HTMLElement>) => void;
  hasDraftToggle?: boolean;
  draftExpanded?: boolean;
  onToggleDraft?: () => void;
  isNestedDraftRow?: boolean;
}

export function CourseListItem({
  course,
  isDraft,
  isSelected,
  onSelect,
  onOpenMenu,
  hasDraftToggle,
  draftExpanded,
  onToggleDraft,
  isNestedDraftRow,
}: CourseListItemProps) {
  return (
    <Box
      sx={{
        p: 1.5,
        pl: isNestedDraftRow ? 3 : 1.5,
        borderBottom: "1px solid #faf0f0",
        position: "relative",
        bgcolor: isSelected
          ? alpha(R, 0.04)
          : isNestedDraftRow
            ? "#fffaf5"
            : undefined,
        cursor: "pointer",
      }}
      onClick={onSelect}
    >
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
        {hasDraftToggle && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleDraft?.();
            }}
            sx={{ mt: -0.25, ml: -0.5, color: alpha(R, 0.6) }}
          >
            {draftExpanded ? (
              <ExpandLessIcon sx={{ fontSize: 16 }} />
            ) : (
              <ExpandMoreIcon sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        )}

        <Box
          sx={{
            width: 44,
            height: 32,
            borderRadius: 1.5,
            overflow: "hidden",
            flexShrink: 0,
            bgcolor: "#fde8e8",
          }}
        >
          {isValidImg(course.hinhAnhKhoaHoc) ? (
            <img
              src={course.hinhAnhKhoaHoc!}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SchoolIcon sx={{ fontSize: 16, color: alpha(R, 0.35) }} />
            </Box>
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 12.5,
              fontWeight: 700,
              lineHeight: 1.3,
              mb: 0.5,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: isSelected ? R : "inherit",
            }}
          >
            {course.tieuDe}
            {isDraft && (
              <Chip
                label="Nháp"
                size="small"
                sx={{
                  ml: 0.5,
                  fontSize: "0.5rem",
                  height: 16,
                  bgcolor: "#fff3e0",
                  color: "#e65100",
                }}
              />
            )}
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {statusChip(course.trangThaiPheDuyet)}
          </Stack>
        </Box>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onOpenMenu(e);
          }}
          sx={{ mt: -0.5 }}
        >
          <MoreVertIcon sx={{ fontSize: 16, color: "#bbb" }} />
        </IconButton>
      </Box>
      {isSelected && (
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            bgcolor: R,
            borderRadius: "0 2px 2px 0",
          }}
        />
      )}
    </Box>
  );
}
