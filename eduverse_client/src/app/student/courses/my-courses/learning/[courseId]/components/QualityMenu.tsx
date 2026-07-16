"use client";

import { useState, useMemo } from "react";
import { Box, Typography, Paper, alpha } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HdIcon from "@mui/icons-material/Hd";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import { QualityLevel, CLOUDINARY_PROFILES } from "../types";
import { CloudinaryUrlInfo } from "@/src/types/Cloudinary/Dto/CloudinaryDto";

const PRIMARY_RED = "#8B1313";
const PRIMARY_RED_DARK = "#6B1414";

interface QualityMenuProps {
  qualityLevels: QualityLevel[];
  selectedQuality: number | "auto";
  currentBandwidthKbps: number | null;
  onSelectQuality: (q: number | "auto") => void;
  cloudinaryInfo: CloudinaryUrlInfo | null;
  onSelectCloudinaryProfile: (profile: string | "auto") => void;
  selectedProfile: string | "auto";
}

export const QualityMenu = ({
  qualityLevels,
  selectedQuality,
  currentBandwidthKbps,
  onSelectQuality,
  cloudinaryInfo,
  onSelectCloudinaryProfile,
  selectedProfile,
}: QualityMenuProps) => {
  const [open, setOpen] = useState(false);
  const useManualProfiles =
    qualityLevels.length === 0 && cloudinaryInfo !== null;

  const currentLabel = useMemo(() => {
    if (useManualProfiles) {
      if (selectedProfile === "auto") return "Tự động";
      return (
        CLOUDINARY_PROFILES.find((p) => p.profile === selectedProfile)?.label ??
        "Tự động"
      );
    }
    if (selectedQuality === "auto") {
      if (currentBandwidthKbps && currentBandwidthKbps > 0) {
        const bw =
          currentBandwidthKbps >= 1000
            ? `${(currentBandwidthKbps / 1000).toFixed(1)} Mbps`
            : `${currentBandwidthKbps} kbps`;
        return `Tự động · ${bw}`;
      }
      return "Tự động";
    }
    return (
      qualityLevels.find((q) => q.index === selectedQuality)?.label ?? "Auto"
    );
  }, [
    selectedQuality,
    qualityLevels,
    currentBandwidthKbps,
    useManualProfiles,
    selectedProfile,
  ]);

  if (qualityLevels.length === 0 && !cloudinaryInfo) return null;

  const isAutoSelected = useManualProfiles
    ? selectedProfile === "auto"
    : selectedQuality === "auto";

  return (
    <Box sx={{ position: "absolute", bottom: 52, right: 12, zIndex: 20 }}>
      {open && (
        <Box
          onClick={() => setOpen(false)}
          sx={{ position: "fixed", inset: 0, zIndex: -1 }}
        />
      )}

      {open && (
        <Paper
          sx={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            right: 0,
            minWidth: 180,
            py: 0.75,
            bgcolor: "rgba(18,18,18,0.97)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 1.5,
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              px: 2,
              py: 0.5,
              display: "block",
              color: "rgba(255,255,255,0.4)",
              fontWeight: 700,
              letterSpacing: "0.08em",
              fontSize: "0.65rem",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              mb: 0.5,
              pb: 0.75,
            }}
          >
            ĐỘ PHÂN GIẢI
          </Typography>

          {/* Auto option */}
          <Box
            onClick={() => {
              if (useManualProfiles) onSelectCloudinaryProfile("auto");
              else onSelectQuality("auto");
              setOpen(false);
            }}
            sx={{
              px: 2,
              py: 0.75,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              bgcolor: isAutoSelected
                ? alpha(PRIMARY_RED, 0.18)
                : "transparent",
              "&:hover": { bgcolor: alpha(PRIMARY_RED, 0.12) },
              transition: "background 0.15s",
            }}
          >
            <SignalCellularAltIcon
              sx={{
                fontSize: 15,
                color: isAutoSelected ? PRIMARY_RED : "rgba(255,255,255,0.45)",
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: isAutoSelected ? PRIMARY_RED : "#fff",
                  fontWeight: isAutoSelected ? 700 : 400,
                  display: "block",
                  lineHeight: 1.2,
                }}
              >
                Tự động
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.6rem",
                  color: "rgba(255,255,255,0.4)",
                  lineHeight: 1.2,
                }}
              >
                {useManualProfiles ? "Adaptive bitrate" : "Theo tốc độ mạng"}
              </Typography>
            </Box>
            {isAutoSelected && (
              <CheckCircleIcon
                sx={{ fontSize: 13, color: PRIMARY_RED, flexShrink: 0 }}
              />
            )}
          </Box>

          <Box sx={{ height: 1, bgcolor: "rgba(255,255,255,0.06)", my: 0.5 }} />

          {/* Quality options */}
          {useManualProfiles
            ? CLOUDINARY_PROFILES.map((p) => {
                const isSelected = selectedProfile === p.profile;
                const isHD = p.height >= 720;
                return (
                  <Box
                    key={p.profile}
                    onClick={() => {
                      onSelectCloudinaryProfile(p.profile);
                      setOpen(false);
                    }}
                    sx={{
                      px: 2,
                      py: 0.75,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      bgcolor: isSelected
                        ? alpha(PRIMARY_RED, 0.18)
                        : "transparent",
                      "&:hover": { bgcolor: alpha(PRIMARY_RED, 0.12) },
                      transition: "background 0.15s",
                    }}
                  >
                    <HdIcon
                      sx={{
                        fontSize: 15,
                        color: isSelected
                          ? PRIMARY_RED
                          : isHD
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(255,255,255,0.35)",
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: isSelected ? PRIMARY_RED : "#fff",
                          fontWeight: isSelected ? 700 : 400,
                          display: "block",
                          lineHeight: 1.2,
                        }}
                      >
                        {p.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.6rem",
                          lineHeight: 1.2,
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        {p.bitrate >= 1_000_000
                          ? `~${(p.bitrate / 1_000_000).toFixed(1)} Mbps`
                          : `~${Math.round(p.bitrate / 1000)} kbps`}
                      </Typography>
                    </Box>
                    {isSelected && (
                      <CheckCircleIcon
                        sx={{ fontSize: 13, color: PRIMARY_RED, flexShrink: 0 }}
                      />
                    )}
                  </Box>
                );
              })
            : qualityLevels.map((q) => {
                const isSelected = selectedQuality === q.index;
                const isHD = q.height >= 720;
                return (
                  <Box
                    key={q.index}
                    onClick={() => {
                      onSelectQuality(q.index);
                      setOpen(false);
                    }}
                    sx={{
                      px: 2,
                      py: 0.75,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      bgcolor: isSelected
                        ? alpha(PRIMARY_RED, 0.18)
                        : "transparent",
                      "&:hover": { bgcolor: alpha(PRIMARY_RED, 0.12) },
                      transition: "background 0.15s",
                    }}
                  >
                    <HdIcon
                      sx={{
                        fontSize: 15,
                        color: isSelected
                          ? PRIMARY_RED
                          : isHD
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(255,255,255,0.35)",
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: isSelected ? PRIMARY_RED : "#fff",
                          fontWeight: isSelected ? 700 : 400,
                          display: "block",
                          lineHeight: 1.2,
                        }}
                      >
                        {q.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.6rem",
                          lineHeight: 1.2,
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        {q.bitrate >= 1_000_000
                          ? `${(q.bitrate / 1_000_000).toFixed(1)} Mbps`
                          : `${Math.round(q.bitrate / 1000)} kbps`}
                      </Typography>
                    </Box>
                    {isSelected && (
                      <CheckCircleIcon
                        sx={{ fontSize: 13, color: PRIMARY_RED, flexShrink: 0 }}
                      />
                    )}
                  </Box>
                );
              })}
        </Paper>
      )}

      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{
          px: 1.25,
          py: 0.45,
          borderRadius: 1,
          bgcolor: open ? PRIMARY_RED : "rgba(0,0,0,0.72)",
          border: `1px solid ${open ? PRIMARY_RED : "rgba(255,255,255,0.22)"}`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 0.6,
          transition: "all 0.18s",
          "&:hover": {
            bgcolor: open ? PRIMARY_RED_DARK : "rgba(139,26,26,0.75)",
          },
          userSelect: "none",
        }}
      >
        <HdIcon sx={{ fontSize: 14, color: "#fff", flexShrink: 0 }} />
        <Typography
          sx={{
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.68rem",
            whiteSpace: "nowrap",
            maxWidth: 130,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {currentLabel}
        </Typography>
      </Box>
    </Box>
  );
};
