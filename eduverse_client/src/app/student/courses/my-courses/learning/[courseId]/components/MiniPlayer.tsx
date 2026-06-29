"use client";

import { Box, IconButton, Tooltip } from "@mui/material";
import { OpenInFull as OpenInFullIcon } from "@mui/icons-material";
import { VideoPlayer } from "./VideoPlayer";

const PRIMARY_RED = "#8B1A1A";

interface MiniPlayerProps {
  url: string;
  savedTime?: number;
  isCompleted?: boolean;
  onTimeUpdate: (t: number) => void;
  onEnded: () => void;
  onExpand: () => void;
}

export const MiniPlayer = ({
  url,
  savedTime,
  isCompleted,
  onTimeUpdate,
  onEnded,
  onExpand,
}: MiniPlayerProps) => {
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 300,
        zIndex: 1300,
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
        border: `2px solid ${PRIMARY_RED}`,
      }}
    >
      <VideoPlayer
        url={url}
        savedTime={savedTime}
        isCompleted={isCompleted}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
      />
      <Tooltip title="Mở rộng">
        <IconButton
          size="small"
          onClick={onExpand}
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            bgcolor: "rgba(0,0,0,0.6)",
            color: "#fff",
            "&:hover": { bgcolor: PRIMARY_RED },
          }}
        >
          <OpenInFullIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
