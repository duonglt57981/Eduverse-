"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Hls, { Level } from "hls.js";
import KhoaHocService from "@/src/services/KhoaHocService";
import TienDoHocTapService from "@/src/services/TienDoHocTapService";
import { BaiGiangType } from "@/src/types/BaiGiang/BaiGiangDto";
import { TaiLieuType } from "@/src/types/TaiLieu/TaiLieuDto";
import { KhoaHocType } from "@/src/types/khoaHoc/dto";
import { UpdateTienDoBaiGiangRequest } from "@/src/types/tienDoHocTap/Request/UpdateTienDoBaiGiangRequest";
import { PhanHocType } from "@/src/types/PhanHoc/PhanHocdto";

// ─── Palette (màu sắc) ──────────────────────────────────────────────────────
const C = {
  red: "#c0392b",
  redHover: "#a93226",
  redLight: "#fdecea",
  redMid: "#e74c3c",
  redGlow: "rgba(192,57,43,0.18)",
} as const;

const T = {
  bg: "#f8f8f8",
  bgCard: "#ffffff",
  bgAlt: "#f2f2f2",
  bgHover: "#ebebeb",
  border: "#e0e0e0",
  borderStrong: "#d0d0d0",
  text: "#111111",
  textSub: "#666666",
  textHint: "#999999",
  appbar: "#ffffff",
  sidebarHead: "#f5f5f5",
  divider: "#e8e8e8",
  shadow: "rgba(0,0,0,0.06)",
} as const;

const SIDEBAR_W = 380;
const HEADER_H = 60;
const KhoaHocSvc = new KhoaHocService();
const TienDoSvc = new TienDoHocTapService();

// ─── Types (chất lượng video) ───────────────────────────────────────────────
interface QualityLevel {
  index: number;
  label: string;
  height: number;
  bitrate?: number;
}

interface NetworkInformation extends EventTarget {
  downlink: number;
  effectiveType: string;
  rtt: number;
  saveData: boolean;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

const QUALITY_PRESETS = [
  { height: 2160, label: "4K", bitrate: 8000 },
  { height: 1440, label: "2K", bitrate: 5000 },
  { height: 1080, label: "1080p", bitrate: 3000 },
  { height: 720, label: "720p", bitrate: 2000 },
  { height: 480, label: "480p", bitrate: 1000 },
  { height: 360, label: "360p", bitrate: 600 },
];

// ─── Icon components (giữ nguyên toàn bộ) ───────────────────────────────────
const IconPlay = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

const IconCheck = ({ size = 16, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconNext = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" />
  </svg>
);

const IconChevR = ({ size = 18, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const IconChevL = ({ size = 18, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const IconChevD = ({ size = 14, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconChevU = ({ size = 14, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const IconPdf = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={C.redMid}>
    <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z" />
  </svg>
);

const IconFile = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#2980b9">
    <path d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5z" />
  </svg>
);

const IconAttach = ({ size = 12, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
  </svg>
);

const IconDL = ({ size = 13, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconSettings = ({ size = 18, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconSearch = ({ size = 18, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconVideo = ({ size = 44, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <rect x="2" y="7" width="15" height="10" rx="2" />
    <path d="M17 9l5-3v12l-5-3V9z" />
  </svg>
);

const IconClock = ({ size = 15, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconBook = ({ size = 15, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
);

const IconPeople = ({ size = 15, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const IconLoader = ({ size = 16, color = C.red }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    style={{ animation: "spin 1s linear infinite" }}
  >
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);

// ─── Quality Menu Component ────────────────────────────────────────────────
const QualityMenu = ({
  levels,
  currentLevel,
  autoActualHeight,
  networkSpeed,
  onSelect,
  onAutoDetect,
}: {
  levels: QualityLevel[];
  currentLevel: number;
  autoActualHeight: number | null;
  networkSpeed: number | null;
  onSelect: (idx: number) => void;
  onAutoDetect?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const getRecommendedQuality = useCallback(() => {
    if (!networkSpeed) return -1;
    if (networkSpeed >= 50)
      return levels.find((l) => l.height === 2160)?.index ?? -1;
    if (networkSpeed >= 25)
      return levels.find((l) => l.height === 1080)?.index ?? -1;
    if (networkSpeed >= 10)
      return levels.find((l) => l.height === 720)?.index ?? -1;
    if (networkSpeed >= 5)
      return levels.find((l) => l.height === 480)?.index ?? -1;
    return levels.find((l) => l.height === 360)?.index ?? -1;
  }, [networkSpeed, levels]);

  const getCurrentDisplayLabel = () => {
    if (currentLevel === -1) {
      if (autoActualHeight) {
        const h = autoActualHeight;
        if (h >= 2160) return "4K";
        if (h >= 1440) return "2K";
        if (h >= 1080) return "1080p";
        if (h >= 720) return "720p";
        if (h >= 480) return "480p";
        return `${h}p`;
      }
      return "Tự động";
    }
    const level = levels.find((l) => l.index === currentLevel);
    if (!level) return "Tự động";
    if (level.height === 2160) return "4K";
    if (level.height === 1440) return "2K";
    if (level.height === 1080) return "1080p";
    if (level.height === 720) return "720p";
    if (level.height === 480) return "480p";
    if (level.height === 360) return "360p";
    return level.label;
  };

  const isLowQuality = () => {
    if (currentLevel === -1)
      return autoActualHeight ? autoActualHeight < 720 : false;
    const level = levels.find((l) => l.index === currentLevel);
    return level ? level.height < 720 : false;
  };

  if (levels.length <= 1) return null;

  const uniqueLevels = levels
    .filter(
      (level, index, self) =>
        level.index === -1 ||
        self.findIndex((l) => l.height === level.height) === index,
    )
    .sort((a, b) => {
      if (a.index === -1) return -1;
      if (b.index === -1) return 1;
      return b.height - a.height;
    });

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 10px",
          borderRadius: 6,
          cursor: "pointer",
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)",
          color: "#fff",
          fontSize: 12,
          fontWeight: 500,
          transition: "all .2s ease",
          fontFamily: "inherit",
          border: "none",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(0,0,0,0.85)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "rgba(0,0,0,0.7)")
        }
      >
        <IconSettings size={14} color="#fff" />
        <span>{getCurrentDisplayLabel()}</span>
        {isLowQuality() && (
          <span
            style={{
              background: "#ff9800",
              color: "#000",
              fontSize: 9,
              padding: "1px 4px",
              borderRadius: 3,
              marginLeft: 2,
            }}
          >
            SD
          </span>
        )}
        <IconChevD size={10} color="rgba(255,255,255,0.7)" />
      </button>
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 8px)",
              right: 0,
              background: "rgba(28,28,28,0.95)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              minWidth: 220,
              padding: "6px 0",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              zIndex: 100,
            }}
          >
            <div
              style={{
                padding: "8px 12px 10px",
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                marginBottom: 4,
              }}
            >
              Chất lượng
              {networkSpeed && networkSpeed < 5 && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 10,
                    color: "#ff9800",
                    background: "rgba(255,152,0,0.2)",
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  ⚠️ Mạng yếu
                </span>
              )}
              {networkSpeed && networkSpeed >= 5 && networkSpeed < 10 && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 10,
                    color: "#ffc107",
                    background: "rgba(255,193,7,0.2)",
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  📶 {networkSpeed} Mbps
                </span>
              )}
              {networkSpeed && networkSpeed >= 10 && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 10,
                    color: "#4caf50",
                    background: "rgba(76,175,80,0.2)",
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  🚀 {networkSpeed} Mbps
                </span>
              )}
            </div>
            {uniqueLevels.map((lv) => (
              <QualityMenuItem
                key={lv.index}
                level={lv}
                isSelected={lv.index === currentLevel}
                isRecommended={
                  lv.index === getRecommendedQuality() &&
                  currentLevel === -1 &&
                  lv.index !== -1
                }
                networkSpeed={networkSpeed}
                onSelect={() => {
                  onSelect(lv.index);
                  setOpen(false);
                }}
              />
            ))}
            {onAutoDetect && currentLevel !== -1 && (
              <div
                onClick={() => {
                  onAutoDetect();
                  setOpen(false);
                }}
                style={{
                  padding: "8px 12px",
                  marginTop: 4,
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  fontSize: 11,
                  color: "#3ea6ff",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "background .15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <span>🔄</span> Tự động (Auto)
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const QualityMenuItem = ({
  level,
  isSelected,
  isRecommended,
  networkSpeed,
  onSelect,
}: {
  level: QualityLevel;
  isSelected: boolean;
  isRecommended: boolean;
  networkSpeed: number | null;
  onSelect: () => void;
}) => {
  const [hov, setHov] = useState(false);
  const getDisplayLabel = () => {
    if (level.index === -1) return "Tự động";
    if (level.height === 2160) return "4K";
    if (level.height === 1440) return "2K";
    if (level.height === 1080) return "1080p";
    if (level.height === 720) return "720p (HD)";
    if (level.height === 480) return "480p";
    if (level.height === 360) return "360p";
    return level.label;
  };
  const isSuitableForNetwork = () => {
    if (!networkSpeed || level.index === -1) return false;
    if (level.height === 2160 && networkSpeed >= 50) return true;
    if (level.height === 1080 && networkSpeed >= 25) return true;
    if (level.height === 720 && networkSpeed >= 10) return true;
    if (level.height === 480 && networkSpeed >= 5) return true;
    if (level.height === 360 && networkSpeed >= 2) return true;
    return false;
  };
  const getBitrateWarning = () => {
    if (!networkSpeed || level.index === -1 || !level.bitrate) return null;
    const requiredMbps = level.bitrate / 1000;
    if (networkSpeed < requiredMbps)
      return { text: `Cần ${requiredMbps} Mbps`, color: "#ff9800" };
    return null;
  };
  const warning = getBitrateWarning();

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        cursor: "pointer",
        background: isSelected
          ? "rgba(62, 166, 255, 0.15)"
          : hov
            ? "rgba(255,255,255,0.08)"
            : "transparent",
        color: isSelected ? "#3ea6ff" : "#fff",
        fontSize: 12,
        fontWeight: isSelected ? 500 : 400,
        transition: "all .1s ease",
      }}
    >
      {isSelected ? (
        <div style={{ width: 18 }}>
          <IconCheck size={12} color="#3ea6ff" />
        </div>
      ) : (
        <div style={{ width: 18 }} />
      )}
      <span style={{ flex: 1 }}>{getDisplayLabel()}</span>
      {isSuitableForNetwork() && !isSelected && level.index !== -1 && (
        <span
          style={{
            fontSize: 9,
            color: "#4caf50",
            background: "rgba(76,175,80,0.2)",
            padding: "2px 5px",
            borderRadius: 3,
          }}
        >
          ✓ Phù hợp
        </span>
      )}
      {isRecommended && !isSelected && level.index !== -1 && (
        <span
          style={{
            fontSize: 9,
            color: "#2196f3",
            background: "rgba(33,150,243,0.2)",
            padding: "2px 5px",
            borderRadius: 3,
          }}
        >
          🎯 Khuyến nghị
        </span>
      )}
      {warning && !isSelected && level.index !== -1 && (
        <span
          style={{
            fontSize: 9,
            color: warning.color,
            background: "rgba(255,152,0,0.2)",
            padding: "2px 5px",
            borderRadius: 3,
          }}
        >
          ⚠️ {warning.text}
        </span>
      )}
      {level.bitrate && !isSelected && level.index !== -1 && !warning && (
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
          {level.bitrate / 1000} Mbps
        </span>
      )}
    </div>
  );
};

// ─── TaiLieuDropdown ───────────────────────────────────────────────────────
const TaiLieuDropdown = ({
  danhSachTaiLieu,
}: {
  danhSachTaiLieu: TaiLieuType[];
}) => {
  const [open, setOpen] = useState(false);
  const [downloading, setDL] = useState<string | null>(null);
  const extractDriveId = useCallback((url: string) => {
    const patterns = [/\/file\/d\/([a-zA-Z0-9_-]+)/, /[?&]id=([a-zA-Z0-9_-]+)/];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
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
          const response = await fetch(tl.url, {
            mode: "cors",
            cache: "no-store",
          });
          const blob = await response.blob();
          const href = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = href;
          link.download = tl.tenTaiLieu ?? "tai-lieu";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
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
    <div style={{ borderTop: `1px dashed ${T.border}`, background: "#fafafa" }}>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 12px 8px 44px",
          cursor: "pointer",
          userSelect: "none",
          transition: "background .15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = T.bgHover)}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <IconAttach size={12} color={C.red} />
        <span
          style={{ fontSize: 11, fontWeight: 600, color: T.textSub, flex: 1 }}
        >
          {danhSachTaiLieu.length} tài liệu đính kèm
        </span>
        {open ? (
          <IconChevU color={T.textSub} />
        ) : (
          <IconChevD color={T.textSub} />
        )}
      </div>
      <div
        style={{
          overflow: "hidden",
          maxHeight: open ? `${danhSachTaiLieu.length * 52}px` : "0",
          transition: "max-height .2s ease",
        }}
      >
        <div
          style={{
            padding: "2px 10px 8px 44px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {danhSachTaiLieu.map((tl, ti) => {
            const isPdf = tl.loaiTaiLieu === "PDF";
            const key = tl.id ?? tl.url ?? String(ti);
            const isLoading = downloading === key;
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  borderRadius: 8,
                  cursor: isLoading ? "wait" : "pointer",
                  border: `1px solid ${T.border}`,
                  background: isLoading ? C.redLight : T.bgCard,
                }}
              >
                {isPdf ? <IconPdf /> : <IconFile />}
                <span
                  style={{
                    fontSize: 12,
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: isLoading ? C.red : T.text,
                  }}
                >
                  {isLoading ? "Đang tải xuống..." : tl.tenTaiLieu}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "2px 5px",
                    borderRadius: 4,
                    background: isPdf ? "#fdecea" : "#e8f0fe",
                    color: isPdf ? C.redMid : "#2980b9",
                  }}
                >
                  {tl.loaiTaiLieu}
                </span>
                {!isLoading && (
                  <button
                    type="button"
                    aria-label={`Tải xuống ${tl.tenTaiLieu}`}
                    onClick={(e) => handleDownload(tl, e)}
                    className="downloadBtn"
                  >
                    <IconDL size={13} color={C.red} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <style jsx>{`
        .downloadBtn {
          background: none;
          border: none;
          cursor: pointer;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
};

// ─── Spinner ────────────────────────────────────────────────────────────────
const Spinner = ({
  size = 20,
  color = C.red,
}: {
  size?: number;
  color?: string;
}) => (
  <div
    style={{
      width: size,
      height: size,
      border: `2px solid ${color}22`,
      borderTop: `2px solid ${color}`,
      borderRadius: "50%",
      animation: "spin 0.75s linear infinite",
    }}
  />
);

// ─── Progress Bar ───────────────────────────────────────────────────────────
const Progress = ({
  value,
  height = 5,
}: {
  value: number;
  height?: number;
}) => (
  <div
    style={{
      background: "#f5d5d5",
      borderRadius: height,
      height,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        height: "100%",
        borderRadius: height,
        width: `${Math.max(0, Math.min(100, value))}%`,
        background: `linear-gradient(90deg, ${C.redHover}, ${C.redMid})`,
        transition: "width .4s ease",
      }}
    />
  </div>
);

// ─── Chip ───────────────────────────────────────────────────────────────────
const Chip = ({
  label,
  bg = "#e8f5e9",
  color = "#27ae60",
}: {
  label: string;
  bg?: string;
  color?: string;
}) => (
  <span
    style={{
      fontSize: 10,
      fontWeight: 700,
      padding: "2px 7px",
      borderRadius: 5,
      background: bg,
      color,
    }}
  >
    {label}
  </span>
);

// ─── Button ─────────────────────────────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  variant = "outline",
  size = "sm",
  disabled = false,
  style: extraStyle,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "filled" | "outline" | "ghost";
  size?: "sm" | "md";
  disabled?: boolean;
  style?: React.CSSProperties;
}) => {
  const [hov, setHov] = useState(false);
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontFamily: "inherit",
    cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: size === "sm" ? 12 : 14,
    padding: size === "sm" ? "6px 12px" : "10px 20px",
    transition: "all .15s",
    opacity: disabled ? 0.6 : 1,
    ...(variant === "filled" && {
      background: hov ? C.redHover : C.red,
      color: "#fff",
      border: "none",
      boxShadow: hov ? `0 4px 16px ${C.redGlow}` : "none",
    }),
    ...(variant === "outline" && {
      background: hov ? C.redLight : "transparent",
      color: hov ? C.red : T.textSub,
      border: `1px solid ${hov ? C.red : T.border}`,
    }),
    ...(variant === "ghost" && {
      background: hov ? T.bgHover : "transparent",
      color: T.textSub,
      border: "none",
    }),
    ...extraStyle,
  };
  return (
    <button
      style={base}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  );
};

// ─── Input ──────────────────────────────────────────────────────────────────
const Input = ({
  label,
  value,
  onChange,
  onKeyDown,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: focused ? C.red : T.textSub,
        }}
      >
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          padding: "10px 14px",
          borderRadius: 8,
          fontSize: 14,
          fontFamily: "inherit",
          border: `1.5px solid ${focused ? C.red : T.border}`,
          background: T.bgCard,
          color: T.text,
          outline: "none",
          transition: "border-color .15s",
        }}
      />
    </div>
  );
};

// ─── Accordion ──────────────────────────────────────────────────────────────
const AccordionSection = ({
  phan,
  pi,
  isOpen,
  isPlaying,
  doneCnt,
  totalMin,
  onToggle,
  children,
}: {
  phan: PhanHocType;
  pi: number;
  isOpen: boolean;
  isPlaying: boolean;
  doneCnt: number;
  totalMin: number;
  onToggle: () => void;
  children: React.ReactNode;
}) => {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${T.border}` }}>
      <div
        onClick={onToggle}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          cursor: "pointer",
          userSelect: "none",
          background: isPlaying ? "#fff5f5" : hov ? T.bgHover : T.bgAlt,
          borderLeft: `3px solid ${isPlaying ? C.red : "transparent"}`,
          transition: "all .15s",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 12.5,
              color: isPlaying ? C.red : T.text,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.45,
            }}
          >
            {phan.thuTuSapXep ?? pi + 1}. {phan.tenPhan}
          </div>
          <div style={{ color: T.textSub, fontSize: 11, marginTop: 2 }}>
            {doneCnt}/{phan.DanhSachBaiGiang?.length ?? 0} bài · {totalMin}p
          </div>
        </div>
        <div
          style={{
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform .2s",
            color: isPlaying ? C.red : T.textSub,
          }}
        >
          <IconChevD size={17} color={isPlaying ? C.red : T.textSub} />
        </div>
      </div>
      <div
        style={{
          overflow: "hidden",
          maxHeight: isOpen ? "9999px" : "0",
          transition: "max-height .25s ease",
          background: T.bgCard,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ─── BaiGiangItem ───────────────────────────────────────────────────────────
const BaiGiangItem = ({
  bg,
  isActive,
  isDone,
  onClick,
  children,
}: {
  bg: BaiGiangType;
  isActive: boolean;
  isDone: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}) => {
  const [hov, setHov] = useState(false);
  return (
    <div id={`bai-${bg.id}`}>
      <div
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: "12px 16px",
          cursor: "pointer",
          background: isActive ? C.redLight : hov ? T.bgHover : "transparent",
          borderLeft: `3px solid ${isActive ? C.red : "transparent"}`,
          transition: "all .15s",
        }}
      >
        <div
          style={{
            marginTop: 1,
            flexShrink: 0,
            color: isActive ? C.red : isDone ? C.red : T.textHint,
          }}
        >
          {isDone ? (
            <IconCheck size={16} color={C.red} />
          ) : (
            <IconPlay size={16} color={isActive ? C.red : T.textHint} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.5,
              fontWeight: isActive ? 700 : 400,
              color: isActive ? C.red : T.text,
            }}
          >
            {bg.tieuDe}
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 3,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: T.textHint, fontSize: 11 }}>
              {Math.floor((bg.thoiLuong ?? 0) / 60)}p{(bg.thoiLuong ?? 0) % 60}s
            </span>
            {bg.laBaiGiangFree && <Chip label="Miễn phí" />}
            {isDone && !isActive && (
              <span style={{ color: C.red, fontSize: 10, fontWeight: 700 }}>
                ✓ Hoàn thành
              </span>
            )}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

// ─── VideoPlaceholder ───────────────────────────────────────────────────────
const VideoPlaceholder = () => (
  <div
    style={{
      height: "45vh",
      minHeight: 280,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      background: "linear-gradient(160deg, #0c0c0c 0%, #1a0808 100%)",
    }}
  >
    <div
      style={{
        width: 90,
        height: 90,
        borderRadius: "50%",
        background: `${C.red}15`,
        border: `2px solid ${C.red}25`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <IconVideo size={40} color={C.red} />
    </div>
    <span style={{ color: "#555", fontSize: 14, letterSpacing: 0.3 }}>
      Chọn bài giảng để bắt đầu học
    </span>
  </div>
);

// ─── StatsBar ────────────────────────────────────────────────────────────────
const StatsBar = ({ khoaHoc }: { khoaHoc: KhoaHocType }) => (
  <div
    style={{
      display: "flex",
      gap: 0,
      flexWrap: "wrap",
      background: T.bgAlt,
      borderRadius: 10,
      border: `1px solid ${T.border}`,
      overflow: "hidden",
    }}
  >
    {[
      {
        icon: <IconClock size={15} color={T.textSub} />,
        label: khoaHoc.tongThoiLuong
          ? `${Math.floor(khoaHoc.tongThoiLuong / 3600)}h ${Math.floor((khoaHoc.tongThoiLuong % 3600) / 60)}p`
          : "0h 0p",
        title: "Tổng thời lượng",
      },
      {
        icon: <IconBook size={15} color={T.textSub} />,
        label: `${khoaHoc.tongBaiGiang ?? 0} bài giảng`,
        title: "Số bài",
      },
      {
        icon: <IconPeople size={15} color={T.textSub} />,
        label: `${(khoaHoc.soLuongHocVien ?? 0).toLocaleString("vi-VN")} học viên`,
        title: "Học viên",
      },
    ].map(({ icon, label, title }, i) => (
      <div
        key={i}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 20px",
          flex: 1,
          minWidth: 120,
          borderRight: i < 2 ? `1px solid ${T.border}` : "none",
        }}
      >
        {icon}
        <div>
          <div
            style={{
              fontSize: 10,
              color: T.textHint,
              fontWeight: 500,
              marginBottom: 1,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>
            {label}
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────
const KhoaHocPage = () => {
  // State cho hai ID nhập thủ công
  const [khoaHoc, setKhoaHoc] = useState<KhoaHocType | null>(null);
  const [loading, setLoading] = useState(false);
  const [idDangKy, setIdDangKy] = useState("");
  const [idNguoiDung, setIdNguoiDung] = useState("");
  const [error, setError] = useState("");
  const [baiGiang, setBaiGiang] = useState<BaiGiangType | null>(null);
  const [danhSachTatCa, setDanhSachTatCa] = useState<BaiGiangType[]>([]);
  const [phanDangMo, setPhanDangMo] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [autoActualHeight, setAutoActualHeight] = useState<number | null>(null);
  const [networkSpeed, setNetworkSpeed] = useState<number | null>(null);

  const lastUpdateTimeRef = useRef<Record<string, number>>({});
  const updatingRef = useRef<Record<string, boolean>>({});

  const mounted = typeof window !== "undefined";
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Network Speed Detection
  useEffect(() => {
    if (!mounted) return;
    const nav = navigator as NavigatorWithConnection;
    const getSpeed = () => {
      if (nav.connection?.downlink) setNetworkSpeed(nav.connection.downlink);
    };
    getSpeed();
    nav.connection?.addEventListener("change", getSpeed);
    return () => nav.connection?.removeEventListener("change", getSpeed);
  }, [mounted]);

  // Helper flatten
  const flatten = useCallback((d: KhoaHocType | null): BaiGiangType[] => {
    if (!d) return [];
    return d.danhSachPhanHoc?.flatMap((p) => p.danhSachBaiGiang ?? []) ?? [];
  }, []);

  const isBaiHoanThanh = useCallback(
    (bgId: string) => {
      if (!bgId) return false;
      const bg = danhSachTatCa.find((b) => b.id === bgId);
      return bg?.daHoanThanh === true;
    },
    [danhSachTatCa],
  );

  const tongBai = danhSachTatCa.length;
  const soBaiHoanThanh = danhSachTatCa.filter(
    (b) => b.daHoanThanh === true,
  ).length;
  const phanTramHoanThanh = useMemo(
    () => (tongBai === 0 ? 0 : Math.round((soBaiHoanThanh / tongBai) * 100)),
    [tongBai, soBaiHoanThanh],
  );

  // Gửi cập nhật tiến độ
  const sendProgress = useCallback(
    async (
      baiGiangId: string,
      thoiGianXem: number,
    ): Promise<KhoaHocType | null> => {
      if (!idDangKy || !baiGiangId) return null;
      if (updatingRef.current[baiGiangId]) return null;
      updatingRef.current[baiGiangId] = true;
      try {
        const request: UpdateTienDoBaiGiangRequest = {
          idDangKyKhoaHoc: idDangKy,
          idBaiGiang: baiGiangId,
          thoiGianXem: Math.floor(thoiGianXem),
          LanCuoiXem: new Date(),
        };
        await TienDoSvc.updateTienDoBaiGiang(request);
        if (idNguoiDung) {
          const refreshed = await KhoaHocSvc.getLearningKhoaHoc(
            idDangKy,
            idNguoiDung,
          );
          setKhoaHoc(refreshed);
          setDanhSachTatCa(flatten(refreshed));
          return refreshed;
        }
        return null;
      } catch (err) {
        console.error("Lỗi cập nhật tiến độ:", err);
        return null;
      } finally {
        updatingRef.current[baiGiangId] = false;
      }
    },
    [idDangKy, idNguoiDung, flatten],
  );

  const chonBaiGiang = useCallback((bg: BaiGiangType) => {
    setBaiGiang(bg);
    if (bg.idPhan)
      setPhanDangMo((prev) => new Set([...prev, bg.idPhan as string]));
    lastUpdateTimeRef.current[bg.id as string] = 0;
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || !baiGiang?.id) return;
    const currentTime = videoRef.current.currentTime;
    if (!currentTime || isNaN(videoRef.current.duration)) return;
    const bgId = baiGiang.id as string;
    const lastSent = lastUpdateTimeRef.current[bgId] ?? 0;
    if (currentTime - lastSent >= 10) {
      lastUpdateTimeRef.current[bgId] = currentTime;
      sendProgress(bgId, currentTime);
    }
  }, [baiGiang, sendProgress]);

  const handleVideoEnded = useCallback(async () => {
    if (!baiGiang?.id) return;
    const bgId = baiGiang.id as string;
    const duration = videoRef.current?.duration || baiGiang.thoiLuong || 0;
    const refreshed = await sendProgress(bgId, duration);
    const currentList = refreshed ? flatten(refreshed) : danhSachTatCa;
    const idx = currentList.findIndex((b) => b.id === bgId);
    if (idx !== -1) {
      let nextIdx = idx + 1;
      while (
        nextIdx < currentList.length &&
        currentList[nextIdx].daHoanThanh === true
      )
        nextIdx++;
      if (nextIdx < currentList.length) chonBaiGiang(currentList[nextIdx]);
    }
  }, [baiGiang, danhSachTatCa, sendProgress, chonBaiGiang, flatten]);

  const handleSelectQuality = useCallback((idx: number) => {
    const hls = hlsRef.current;
    if (!hls) return;
    setCurrentQuality(idx);
    if (idx === -1) {
      hls.currentLevel = -1;
      hls.loadLevel = -1;
      setAutoActualHeight(null);
      return;
    }
    hls.currentLevel = idx;
    hls.nextLevel = idx;
  }, []);

  const handleAutoDetect = useCallback(() => {
    const hls = hlsRef.current;
    if (!hls) return;
    hls.currentLevel = -1;
    hls.loadLevel = -1;
    setCurrentQuality(-1);
    setAutoActualHeight(null);
  }, []);

  const togglePhan = useCallback((id: string, playingId?: string) => {
    if (id === playingId) return;
    setPhanDangMo((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }, []);

  // HLS Player
  useEffect(() => {
    if (!baiGiang?.urlBaiGiang) return;
    const video = videoRef.current;
    if (!video) return;
    const url = baiGiang.urlBaiGiang;
    setQualityLevels([]);
    setCurrentQuality(-1);
    setAutoActualHeight(null);
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (url.endsWith(".m3u8") && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        capLevelToPlayerSize: false,
        startLevel: -1,
        abrEwmaDefaultEstimate: 5e6,
        abrBandWidthFactor: 0.95,
        abrBandWidthUpFactor: 1,
        minAutoBitrate: 300000,
      });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(
        Hls.Events.MANIFEST_PARSED,
        (_: string, data: { levels: Level[] }) => {
          const levels: QualityLevel[] = (data.levels as Level[])
            .map((l, i) => {
              const preset = QUALITY_PRESETS.find((p) => p.height === l.height);
              return {
                index: i,
                height: l.height,
                label: preset?.label ?? `${l.height}p`,
                bitrate: preset?.bitrate ?? l.bitrate,
              };
            })
            .filter(
              (l, i, arr) => arr.findIndex((x) => x.height === l.height) === i,
            )
            .sort((a, b) => b.height - a.height);
          setQualityLevels([
            { index: -1, label: "Auto", height: 0, bitrate: undefined },
            ...levels,
          ]);
          setCurrentQuality(-1);
          video.play().catch(() => {});
        },
      );
      hls.on(
        Hls.Events.LEVEL_SWITCHED,
        (_: string, data: { level: number }) => {
          const height = hls.levels[data.level]?.height ?? null;
          setCurrentQuality((prev) => {
            if (prev === -1) {
              setAutoActualHeight(height);
              return -1;
            }
            return data.level;
          });
        },
      );
      hls.on(
        Hls.Events.ERROR,
        (_: string, d: { fatal: boolean; type?: string }) => {
          if (d.fatal) {
            console.error("HLS fatal:", d);
            if (d.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          }
        },
      );
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.load();
    } else {
      video.src = url;
      video.load();
    }
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [baiGiang]);

  // Seek & auto play
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !baiGiang) return;
    const handleCanPlay = () => {
      if (
        !baiGiang.daHoanThanh &&
        baiGiang.thoiGianXem &&
        baiGiang.thoiGianXem > 0
      ) {
        if (Math.abs(video.currentTime - baiGiang.thoiGianXem) > 0.5)
          video.currentTime = baiGiang.thoiGianXem;
      }
      video.play().catch((e) => console.log("Autoplay failed:", e));
    };
    video.addEventListener("canplay", handleCanPlay);
    if (video.readyState >= 2) handleCanPlay();
    return () => video.removeEventListener("canplay", handleCanPlay);
  }, [baiGiang]);

  const getInitialLecture = useCallback(
    (lectures: BaiGiangType[]): BaiGiangType | null => {
      const notCompleted = lectures.find((l) => l.daHoanThanh === false);
      return notCompleted ?? (lectures.length > 0 ? lectures[0] : null);
    },
    [],
  );

  const isValidGuid = (str: string) =>
    /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(str.trim());

  const fetchKhoaHoc = useCallback(async () => {
    const trimmedIdDangKy = idDangKy.trim();
    const trimmedIdNguoiDung = idNguoiDung.trim();
    if (!trimmedIdDangKy) {
      setError("Vui lòng nhập ID đăng ký khóa học");
      return;
    }
    if (!trimmedIdNguoiDung) {
      setError("Vui lòng nhập ID người dùng");
      return;
    }
    if (!isValidGuid(trimmedIdDangKy)) {
      setError("ID đăng ký không đúng định dạng (GUID)");
      return;
    }
    if (!isValidGuid(trimmedIdNguoiDung)) {
      setError("ID người dùng không đúng định dạng (GUID)");
      return;
    }
    try {
      setError("");
      setLoading(true);
      setKhoaHoc(null);
      setBaiGiang(null);
      setPhanDangMo(new Set());
      const res = await KhoaHocSvc.getLearningKhoaHoc(
        trimmedIdDangKy,
        trimmedIdNguoiDung,
      );
      setKhoaHoc(res);
      const ds = flatten(res);
      setDanhSachTatCa(ds);
      if (ds.length > 0) {
        const initial = getInitialLecture(ds);
        if (initial) {
          chonBaiGiang(initial);
          setSidebarOpen(true);
        }
      }
    } catch (err) {
      const error = err as { response?: { status: number } };
      console.error(err);
      if (error.response?.status === 401 || error.response?.status === 403)
        setError("Bạn không có quyền truy cập khóa học này.");
      else if (error.response?.status === 404)
        setError("Không tìm thấy khóa học. Vui lòng kiểm tra lại ID đăng ký.");
      else setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [idDangKy, idNguoiDung, flatten, chonBaiGiang, getInitialLecture]);

  const currentIdx = danhSachTatCa.findIndex((b) => b.id === baiGiang?.id);
  const coTiepTheo = currentIdx !== -1 && currentIdx < danhSachTatCa.length - 1;
  const idPhanPlay = baiGiang?.idPhan as string | undefined;

  const scrollbarStyle = `
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: ${T.bgAlt}; }
    ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: ${C.red}; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: none; } }
  `;

  if (!mounted) return null;

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: T.bg,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <style>{scrollbarStyle}</style>

      {/* HEADER */}
      <div
        style={{
          height: HEADER_H,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: 12,
          background: T.appbar,
          borderBottom: `2px solid ${khoaHoc ? C.red : T.border}`,
          zIndex: 1200,
          boxShadow: `0 1px 8px ${T.shadow}`,
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <Image
            src="/khoahoc/1-removebg-preview.png"
            alt="EduVerse"
            width={110}
            height={34}
            style={{ objectFit: "contain" }}
          />
        </div>
        {khoaHoc ? (
          <>
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              title={sidebarOpen ? "Ẩn nội dung" : "Hiện nội dung"}
              style={{
                width: 32,
                height: 32,
                borderRadius: 7,
                cursor: "pointer",
                border: `1.5px solid ${sidebarOpen ? C.red : T.border}`,
                background: sidebarOpen ? C.redLight : T.bgAlt,
                color: sidebarOpen ? C.red : T.textSub,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all .2s",
                flexShrink: 0,
              }}
            >
              {sidebarOpen ? (
                <IconChevR size={16} color={C.red} />
              ) : (
                <IconChevL size={16} color={T.textSub} />
              )}
            </button>
            <div
              style={{
                width: 1,
                height: 24,
                background: T.border,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: T.text,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {khoaHoc.tieuDe}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexShrink: 0,
              }}
            >
              <div style={{ textAlign: "right" }}>
                <div
                  style={{ fontSize: 10, color: T.textHint, lineHeight: 1.3 }}
                >
                  Tiến độ
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.red }}>
                  {phanTramHoanThanh}%
                </div>
              </div>
              <div style={{ width: 90 }}>
                <Progress value={phanTramHoanThanh} />
              </div>
              <div
                style={{ fontSize: 12, color: T.textSub, whiteSpace: "nowrap" }}
              >
                {soBaiHoanThanh}/{tongBai}
              </div>
            </div>
            {coTiepTheo && (
              <Btn
                variant="outline"
                onClick={() => {
                  let n = currentIdx + 1;
                  while (
                    n < danhSachTatCa.length &&
                    danhSachTatCa[n].daHoanThanh === true
                  )
                    n++;
                  if (n < danhSachTatCa.length) chonBaiGiang(danhSachTatCa[n]);
                }}
              >
                <IconNext size={15} /> Tiếp theo
              </Btn>
            )}
          </>
        ) : (
          <div
            style={{
              flex: 1,
              fontSize: 13,
              color: T.textHint,
              fontStyle: "italic",
              paddingLeft: 8,
            }}
          >
            Nền tảng học trực tuyến hàng đầu Việt Nam
          </div>
        )}
      </div>

      {/* FORM NHẬP ID THỦ CÔNG */}
      {!khoaHoc && (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            overflow: "auto",
            background: T.bg,
            animation: "fadeIn .35s ease",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              background: T.bgCard,
              borderRadius: 16,
              border: `1px solid ${T.border}`,
              padding: "40px 36px",
              boxShadow: `0 4px 32px ${T.shadow}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Image
                src="/khoahoc/1-removebg-preview.png"
                alt="EduVerse"
                width={140}
                height={44}
                style={{ objectFit: "contain" }}
              />
            </div>
            <div
              style={{
                width: 36,
                height: 3,
                background: C.red,
                borderRadius: 2,
                margin: "0 auto 20px",
              }}
            />
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 20,
                  color: T.text,
                  marginBottom: 6,
                }}
              >
                Nhập thông tin khóa học
              </div>
              <div style={{ fontSize: 14, color: T.textSub }}>
                Vui lòng nhập ID đăng ký và ID người dùng để truy cập
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                marginBottom: error ? 12 : 24,
              }}
            >
              <Input
                label="ID Đăng ký khóa học"
                value={idDangKy}
                onChange={setIdDangKy}
                onKeyDown={(e) => e.key === "Enter" && fetchKhoaHoc()}
                placeholder="Nhập ID đăng ký (GUID)"
              />
              <Input
                label="ID Người dùng"
                value={idNguoiDung}
                onChange={setIdNguoiDung}
                onKeyDown={(e) => e.key === "Enter" && fetchKhoaHoc()}
                placeholder="Nhập ID người dùng (GUID)"
              />
            </div>
            {error && (
              <div
                style={{
                  color: "#e53935",
                  fontSize: 13,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>⚠</span> {error}
              </div>
            )}
            <button
              onClick={fetchKhoaHoc}
              disabled={loading || !idDangKy.trim() || !idNguoiDung.trim()}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 10,
                background:
                  loading || !idDangKy.trim() || !idNguoiDung.trim()
                    ? C.red + "99"
                    : C.red,
                color: "#fff",
                border: "none",
                cursor:
                  loading || !idDangKy.trim() || !idNguoiDung.trim()
                    ? "not-allowed"
                    : "pointer",
                fontFamily: "inherit",
                fontWeight: 700,
                fontSize: 15,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: `0 4px 18px ${C.redGlow}`,
                transition: "all .2s",
              }}
            >
              {loading ? (
                <>
                  <Spinner size={16} color="#fff" /> Đang tải...
                </>
              ) : (
                <>
                  <IconSearch size={16} color="#fff" /> Vào học ngay
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* KHU VỰC HỌC (khi đã có khóa học) */}
      {khoaHoc && (
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Cột trái: video + thông tin */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            <div
              style={{
                flexShrink: 0,
                background: "#000",
                position: "relative",
              }}
            >
              {baiGiang?.urlBaiGiang ? (
                <>
                  <video
                    ref={videoRef}
                    controls
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleVideoEnded}
                    style={{
                      width: "100%",
                      maxHeight: "55vh",
                      display: "block",
                      objectFit: "contain",
                      background: "#000",
                    }}
                  />
                  {qualityLevels.length > 1 && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 12,
                        right: 12,
                        zIndex: 10,
                      }}
                    >
                      <QualityMenu
                        levels={qualityLevels}
                        currentLevel={currentQuality}
                        autoActualHeight={autoActualHeight}
                        networkSpeed={networkSpeed}
                        onSelect={handleSelectQuality}
                        onAutoDetect={handleAutoDetect}
                      />
                    </div>
                  )}
                </>
              ) : (
                <VideoPlaceholder />
              )}
            </div>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                background: T.bg,
                padding: "24px 32px",
              }}
            >
              {baiGiang && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    marginBottom: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ color: T.textSub, fontSize: 12 }}>
                    {khoaHoc.danhSachPhanHoc?.find((p) => p.id === idPhanPlay)
                      ?.tenPhan ?? ""}
                  </span>
                  <IconChevR size={14} color={T.textHint} />
                  <span style={{ color: C.red, fontWeight: 600, fontSize: 12 }}>
                    {baiGiang.tieuDe}
                  </span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 16,
                  marginBottom: 16,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1
                    style={{
                      fontWeight: 700,
                      color: T.text,
                      fontSize: 22,
                      margin: "0 0 8px",
                      lineHeight: 1.3,
                    }}
                  >
                    {baiGiang?.tieuDe ?? khoaHoc.tieuDe}
                  </h1>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    {baiGiang && (
                      <span style={{ color: T.textSub, fontSize: 13 }}>
                        Bài {currentIdx + 1}/{danhSachTatCa.length} ·{" "}
                        {Math.floor((baiGiang.thoiLuong ?? 0) / 60)}p
                        {(baiGiang.thoiLuong ?? 0) % 60}s
                      </span>
                    )}
                    {baiGiang?.laBaiGiangFree && <Chip label="Miễn phí" />}
                    {baiGiang && isBaiHoanThanh(baiGiang.id as string) && (
                      <Chip
                        label="✓ Đã hoàn thành"
                        bg={C.redLight}
                        color={C.red}
                      />
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {coTiepTheo && (
                    <Btn
                      variant="filled"
                      onClick={() => {
                        let n = currentIdx + 1;
                        while (
                          n < danhSachTatCa.length &&
                          danhSachTatCa[n].daHoanThanh === true
                        )
                          n++;
                        if (n < danhSachTatCa.length)
                          chonBaiGiang(danhSachTatCa[n]);
                      }}
                    >
                      Bài tiếp theo <IconNext size={15} color="#fff" />
                    </Btn>
                  )}
                </div>
              </div>
              <div
                style={{ height: 1, background: T.divider, margin: "20px 0" }}
              />
              <StatsBar khoaHoc={khoaHoc} />
            </div>
          </div>

          {/* Sidebar nội dung khóa học */}
          <div
            style={{
              width: sidebarOpen ? SIDEBAR_W : 0,
              flexShrink: 0,
              overflow: "hidden",
              transition: "width .28s cubic-bezier(.4,0,.2,1)",
              borderLeft: sidebarOpen ? `1px solid ${T.border}` : "none",
              display: "flex",
              flexDirection: "column",
              background: T.bgCard,
            }}
          >
            <div
              style={{
                padding: "14px 16px 12px",
                borderBottom: `2px solid ${C.red}`,
                background: T.sidebarHead,
                flexShrink: 0,
                minWidth: SIDEBAR_W,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>
                  Nội dung khóa học
                </span>
                <Btn
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  style={{ padding: "4px 6px", borderRadius: 6 }}
                >
                  <IconChevR size={16} color={T.textSub} />
                </Btn>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 4,
                }}
              >
                <div style={{ flex: 1 }}>
                  <Progress value={phanTramHoanThanh} height={5} />
                </div>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 11,
                    color: C.red,
                    whiteSpace: "nowrap",
                  }}
                >
                  {phanTramHoanThanh}%
                </span>
              </div>
              <div style={{ fontSize: 11, color: T.textHint }}>
                {soBaiHoanThanh}/{tongBai} bài đã hoàn thành
              </div>
            </div>
            <div style={{ overflowY: "auto", flex: 1, minWidth: SIDEBAR_W }}>
              {khoaHoc.danhSachPhanHoc?.map((phan, pi) => {
                const isOpen = phanDangMo.has(phan.id ?? "");
                const isPlaying = phan.id === idPhanPlay;
                const doneCnt =
                  phan.danhSachBaiGiang?.filter((b: BaiGiangType) =>
                    isBaiHoanThanh(b.id as string),
                  ).length ?? 0;
                const totalMin = Math.floor(
                  (phan.danhSachBaiGiang?.reduce(
                    (a: number, b: BaiGiangType) => a + (b.thoiLuong ?? 0),
                    0,
                  ) ?? 0) / 60,
                );
                return (
                  <AccordionSection
                    key={phan.id ?? pi}
                    phan={phan}
                    pi={pi}
                    isOpen={isOpen}
                    isPlaying={isPlaying}
                    doneCnt={doneCnt}
                    totalMin={totalMin}
                    onToggle={() => togglePhan(phan.id ?? "", idPhanPlay)}
                  >
                    {(phan.danhSachBaiGiang?.length ?? 0) === 0 && (
                      <div
                        style={{
                          color: T.textHint,
                          padding: "16px 20px",
                          fontStyle: "italic",
                          fontSize: 13,
                        }}
                      >
                        Chưa có bài giảng
                      </div>
                    )}
                    {phan.danhSachBaiGiang?.map(
                      (bg: BaiGiangType, bi: number) => (
                        <BaiGiangItem
                          key={bg.id ?? bi}
                          bg={bg}
                          isActive={baiGiang?.id === bg.id}
                          isDone={bg.daHoanThanh === true}
                          onClick={() => chonBaiGiang(bg)}
                        >
                          {(bg.danhSachTaiLieu?.length ?? 0) > 0 && (
                            <TaiLieuDropdown
                              danhSachTaiLieu={bg.danhSachTaiLieu ?? []}
                            />
                          )}
                        </BaiGiangItem>
                      ),
                    )}
                  </AccordionSection>
                );
              })}
            </div>
          </div>

          {/* Nút mở sidebar khi đóng */}
          {!sidebarOpen && (
            <div
              style={{
                position: "fixed",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 900,
                animation: "slideIn .2s ease",
              }}
            >
              <div
                onClick={() => setSidebarOpen(true)}
                title="Mở nội dung khóa học"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  width: 26,
                  paddingTop: 20,
                  paddingBottom: 20,
                  background: C.red,
                  borderRadius: "8px 0 0 8px",
                  cursor: "pointer",
                  boxShadow: `-3px 0 14px ${C.redGlow}`,
                  transition: "all .2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.width = "30px";
                  e.currentTarget.style.background = C.redHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.width = "26px";
                  e.currentTarget.style.background = C.red;
                }}
              >
                <IconChevL size={16} color="#fff" />
                <span
                  style={{
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 700,
                    writingMode: "vertical-rl",
                    letterSpacing: 1,
                  }}
                >
                  NỘI DUNG
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KhoaHocPage;
