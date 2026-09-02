/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  IconButton,
  SxProps,
  Theme,
  Tooltip,
} from "@mui/material";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import { BRAND } from "@/src/theme/tokens";
import { getAvatarInitials } from "@/src/utils/avatarUtils";

export type EduAvatarSize =
  | "xs" // 24px, font 10px
  | "sm" // 32px, font 13px
  | "md" // 40px, font 15px
  | "lg" // 48px, font 18px
  | "xl" // 64px, font 24px
  | "2xl" // 80px, font 30px
  | "profile" // 128px, font 48px
  | "profileLarge" // 160px, font 58px
  | number;

const SIZE_MAP: Record<
  string,
  { size: number; fontSize: number; border: number }
> = {
  xs: { size: 24, fontSize: 10.5, border: 1.5 },
  sm: { size: 32, fontSize: 13, border: 2 },
  md: { size: 40, fontSize: 15, border: 2 },
  lg: { size: 48, fontSize: 18, border: 2 },
  xl: { size: 64, fontSize: 24, border: 2.5 },
  "2xl": { size: 80, fontSize: 30, border: 3 },
  profile: { size: 128, fontSize: 48, border: 3.5 },
  profileLarge: { size: 160, fontSize: 58, border: 4 },
};

export interface EduAvatarProps {
  src?: string | null;
  name?: string | null;
  alt?: string;
  size?: EduAvatarSize;
  sx?: SxProps<Theme>;
  className?: string;
  border?: boolean | string;
  shadow?: boolean | string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  children?: React.ReactNode;
}

export { getAvatarInitials } from "@/src/utils/avatarUtils";

export const EduAvatar = React.forwardRef<HTMLDivElement, EduAvatarProps>(
  function EduAvatar(
    {
      src,
      name,
      alt,
      size = "md",
      sx,
      className,
      border = true,
      shadow = true,
      onClick,
      children,
      ...rest
    },
    ref,
  ) {
    const [imgError, setImgError] = useState(false);

    // Reset imgError khi URL src thay đổi
    useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImgError(false);
    }, [src]);

    // Tính toán kích thước & font size
    let pxSize = 40;
    let pxFontSize = 15;
    let pxBorder = 2;

    if (typeof size === "number") {
      pxSize = size;
      pxFontSize = Math.round(size * 0.38);
      pxBorder = size >= 64 ? 2.5 : size >= 32 ? 2 : 1.5;
    } else if (SIZE_MAP[size]) {
      pxSize = SIZE_MAP[size].size;
      pxFontSize = SIZE_MAP[size].fontSize;
      pxBorder = SIZE_MAP[size].border;
    }

    const initials = getAvatarInitials(name);
    const hasValidImage = Boolean(src && !imgError);

    const defaultBorder =
      border === true
        ? `${pxBorder}px solid #FFFFFF`
        : typeof border === "string"
          ? border
          : "none";

    const defaultShadow =
      shadow === true
        ? "0 2px 8px rgba(0, 0, 0, 0.08)"
        : typeof shadow === "string"
          ? shadow
          : "none";

    return (
      <Avatar
        ref={ref}
        src={hasValidImage ? (src as string) : undefined}
        alt={alt || name || "User Avatar"}
        slotProps={{
          img: {
            onError: () => setImgError(true),
            style: { objectFit: "cover", objectPosition: "center" },
          },
        }}
        className={className}
        onClick={onClick}
        {...rest}
        sx={{
          width: pxSize,
          height: pxSize,
          minWidth: pxSize,
          minHeight: pxSize,
          borderRadius: "50%",
          bgcolor: BRAND.main, // Màu đỏ đô EduVerse #8B1313
          color: "#FFFFFF",
          fontWeight: 700,
          fontSize: pxFontSize,
          fontFamily: "var(--font-heading, 'Be Vietnam Pro', sans-serif)",
          lineHeight: 1,
          letterSpacing: "0.02em",
          border: defaultBorder,
          boxShadow: defaultShadow,
          flexShrink: 0,
          userSelect: "none",
          cursor: onClick ? "pointer" : "default",
          transition: "all 0.2s ease",
          "& img": {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          },
          ...sx,
        }}
      >
        {children || (!hasValidImage ? initials : null)}
      </Avatar>
    );
  },
);

// ── Nút chỉnh sửa Avatar (Dành riêng cho Profile / Settings) ──
export function AvatarEditButton({
  onClick,
  tooltip = "Thay đổi ảnh đại diện",
  size = 36,
  iconSize = 18,
}: {
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  tooltip?: string;
  size?: number;
  iconSize?: number;
}) {
  return (
    <Tooltip title={tooltip}>
      <IconButton
        onClick={onClick}
        aria-label={tooltip}
        sx={{
          position: "absolute",
          bottom: 2,
          right: 2,
          width: size,
          height: size,
          bgcolor: BRAND.main,
          color: "#FFFFFF",
          border: "2px solid #FFFFFF",
          boxShadow: "0 4px 12px rgba(139, 19, 19, 0.35)",
          "&:hover": {
            bgcolor: BRAND.dark,
            transform: "scale(1.06)",
          },
          transition: "all 0.2s ease",
          zIndex: 2,
        }}
      >
        <CameraAltRoundedIcon sx={{ fontSize: iconSize }} />
      </IconButton>
    </Tooltip>
  );
}

export const UserAvatar = EduAvatar;
export default EduAvatar;
