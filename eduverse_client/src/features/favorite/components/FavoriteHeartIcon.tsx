"use client";

import { FavoriteBorderRounded, FavoriteRounded } from "@mui/icons-material";
import { keyframes } from "@mui/material/styles";

const fillHeart = keyframes`
  0% {
    opacity: 0.35;
    transform: scale(0.72);
  }
  55% {
    opacity: 1;
    transform: scale(1.18);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

interface FavoriteHeartIconProps {
  active: boolean;
  color: string;
  size?: number;
}

export default function FavoriteHeartIcon({
  active,
  color,
  size = 16,
}: FavoriteHeartIconProps) {
  if (!active) {
    return <FavoriteBorderRounded sx={{ fontSize: size }} />;
  }

  return (
    <FavoriteRounded
      sx={{
        fontSize: size,
        color,
        transformOrigin: "center",
        animation: `${fillHeart} 360ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
        "@media (prefers-reduced-motion: reduce)": {
          animation: "none",
        },
      }}
    />
  );
}
