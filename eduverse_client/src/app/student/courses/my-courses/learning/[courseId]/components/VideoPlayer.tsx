// src/app/khoa-hoc/components/VideoPlayer.tsx

"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Box, Typography, Button, alpha } from "@mui/material";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "@videojs/http-streaming";
import { QualityMenu } from "./QualityMenu";
import { QualityLevel } from "../types";
import { getOptimalHlsUrl, buildCloudinaryHlsUrl } from "../utils/cloudinary";
import { VIDEO_JS_STYLES } from "../utils/videoHelpers";
import { CloudinaryUrlInfo } from "@/src/types/Cloudinary/Dto/CloudinaryDto";

const PRIMARY_RED = "#8B1A1A";
const PRIMARY_RED_DARK = "#6B1414";
const LOAD_TIMEOUT_MS = 30000;

interface VideoPlayerProps {
  url: string;
  savedTime?: number;
  isCompleted?: boolean;
  onTimeUpdate: (t: number) => void;
  onEnded: () => void;
}

export const VideoPlayer = ({
  url,
  savedTime,
  isCompleted,
  onTimeUpdate,
  onEnded,
}: VideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const initialTimeSetRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [loadElapsed, setLoadElapsed] = useState(0);

  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<number | "auto">(
    "auto",
  );
  const [currentBandwidthKbps, setCurrentBandwidthKbps] = useState<
    number | null
  >(null);
  const [cloudinaryInfo, setCloudinaryInfo] =
    useState<CloudinaryUrlInfo | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | "auto">(
    "auto",
  );

  const activeUrlRef = useRef<string>(url);

  // Kiểm tra URL có phải HLS không
  const isHls = useMemo(() => {
    return url.includes(".m3u8");
  }, [url]);

  // Inject styles
  useEffect(() => {
    if (!document.getElementById("vjs-custom-styles")) {
      const s = document.createElement("style");
      s.id = "vjs-custom-styles";
      s.textContent = VIDEO_JS_STYLES(PRIMARY_RED, PRIMARY_RED_DARK);
      document.head.appendChild(s);
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startLoadTimeout = useCallback(() => {
    clearAllTimers();
    setLoadElapsed(0);
    intervalRef.current = setInterval(() => setLoadElapsed((e) => e + 1), 1000);
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setLoadTimedOut(true);
      setIsLoading(false);
    }, LOAD_TIMEOUT_MS);
  }, [clearAllTimers]);

  const applyVhsQuality = useCallback((q: number | "auto") => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ql = (playerRef.current as any)?.qualityLevels?.();
    if (!ql) return;
    if (q === "auto") {
      for (let i = 0; i < ql.length; i++) ql[i].enabled = true;
    } else {
      for (let i = 0; i < ql.length; i++) ql[i].enabled = i === q;
    }
    setSelectedQuality(q);
  }, []);

  const applyCloudinaryProfile = useCallback(
    (profile: string | "auto") => {
      if (!cloudinaryInfo) return;
      const newUrl =
        profile === "auto"
          ? buildCloudinaryHlsUrl(cloudinaryInfo, "sp_auto")
          : buildCloudinaryHlsUrl(cloudinaryInfo, profile);
      setSelectedProfile(profile);
      activeUrlRef.current = newUrl;
      const p = playerRef.current;
      if (p && typeof p.src === "function") {
        const currentTime = p.currentTime?.() ?? 0;
        p.src({ src: newUrl, type: "application/x-mpegURL" });
        p.load();
        p.one("loadedmetadata", () => {
          if (currentTime > 5) p.currentTime(currentTime);
          p.play()?.catch(() => {});
        });
      }
    },
    [cloudinaryInfo],
  );

  // Main video setup
  useEffect(() => {
    if (!containerRef.current) return;

    // Xác định URL HLS tối ưu (nếu là Cloudinary) hoặc giữ nguyên
    const { masterUrl, cloudinaryInfo: info } = getOptimalHlsUrl(url);
    const finalUrl = masterUrl || url;
    const isHlsUrl = finalUrl.includes(".m3u8");
    setCloudinaryInfo(info);
    activeUrlRef.current = finalUrl;

    setHasError(false);
    setIsLoading(true);
    setLoadTimedOut(false);
    setLoadElapsed(0);
    setQualityLevels([]);
    setSelectedQuality("auto");
    setSelectedProfile("auto");
    setCurrentBandwidthKbps(null);
    startLoadTimeout();

    const videoEl = document.createElement("video");
    videoEl.className = "video-js vjs-big-play-centered";
    containerRef.current.appendChild(videoEl);

    // Xác định type source
    const sourceType = isHlsUrl ? "application/x-mpegURL" : "video/mp4";

    const player = videojs(videoEl, {
      controls: true,
      autoplay: true,
      preload: "auto",
      fluid: true,
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      html5: {
        vhs: isHlsUrl
          ? {
              overrideNative: true,
              useNetworkInformationApi: true,
              enableLowInitialPlaylist: true,
              limitRenditionByPlayerDimensions: true,
              smoothQualityChange: true,
              allowSeeksWithinUnsafeLiveWindow: true,
              handlePartialData: true,
              bandwidth: 4_000_000,
            }
          : undefined, // Không dùng VHS cho video thường
        nativeVideoTracks: false,
        nativeAudioTracks: false,
        nativeTextTracks: false,
      },
      controlBar: {
        volumePanel: { inline: false },
        progressControl: { seekBar: true },
        remainingTimeDisplay: { displayNegative: false },
        playbackRateMenuButton: true,
        pictureInPictureToggle: false,
        chaptersButton: false,
        subtitlesButton: false,
        captionsButton: false,
        audioTrackButton: false,
        descriptionsButton: false,
      },
      sources: [{ src: finalUrl, type: sourceType }],
    });

    playerRef.current = player;
    initialTimeSetRef.current = false;

    const markReady = () => {
      clearAllTimers();
      setIsLoading(false);
      setLoadTimedOut(false);
    };

    player.on("canplay", markReady);

    player.on("loadedmetadata", () => {
      markReady();
      if (
        !initialTimeSetRef.current &&
        !isCompleted &&
        savedTime &&
        savedTime > 5
      ) {
        player.currentTime(savedTime);
        initialTimeSetRef.current = true;
      }
      player.play()?.catch(() => {});

      // Chỉ lấy quality levels nếu là HLS
      if (isHlsUrl) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ql = (player as any).qualityLevels?.();
        if (ql) {
          const buildLevels = () => {
            const levels: QualityLevel[] = [];
            for (let i = 0; i < ql.length; i++) {
              const lv = ql[i];
              const height: number = lv.height ?? 0;
              const bitrate: number = lv.bitrate ?? 0;
              let label: string;
              if (height >= 2160) label = "4K (2160p)";
              else if (height >= 1440) label = "1440p";
              else if (height >= 1080) label = "1080p HD";
              else if (height >= 720) label = "720p HD";
              else if (height >= 480) label = "480p";
              else if (height >= 360) label = "360p";
              else if (height >= 240) label = "240p";
              else if (height > 0) label = `${height}p`;
              else label = `${Math.round(bitrate / 1000)} kbps`;
              levels.push({ index: i, label, bitrate, height });
            }
            levels.sort((a, b) => b.bitrate - a.bitrate);
            const seen = new Set<string>();
            const unique = levels.filter((l) => {
              if (seen.has(l.label)) return false;
              seen.add(l.label);
              return true;
            });
            if (unique.length > 0) setQualityLevels(unique);
          };
          buildLevels();
          ql.on("addqualitylevel", buildLevels);
          ql.on("removequalitylevel", buildLevels);
        }
      }
    });

    player.on("playing", () => {
      clearAllTimers();
      setIsLoading(false);
      setLoadTimedOut(false);
    });

    let lastSent = 0;
    player.on("timeupdate", () => {
      const ct = player.currentTime() ?? 0;
      // Lấy bandwidth nếu là HLS
      if (isHlsUrl) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tech = player.tech(true);
        if (tech?.vhs?.stats?.bandwidth) {
          setCurrentBandwidthKbps(Math.round(tech.vhs.stats.bandwidth / 1000));
        }
      }
      if (ct - lastSent >= 10) {
        lastSent = ct;
        onTimeUpdate(ct);
      }
    });

    player.on("ended", () => onEnded());

    player.on("error", () => {
      // Fallback: nếu đang dùng HLS, thử phát file gốc (nếu khác)
      const currentSrc = player.currentSrc?.() ?? "";
      if (isHlsUrl && currentSrc.includes(".m3u8") && info) {
        console.warn("[VideoPlayer] HLS failed, falling back to direct file");
        const fallbackUrl = url; // URL gốc
        player.src({ src: fallbackUrl, type: "video/mp4" });
        player.load();
        player.one("error", () => {
          clearAllTimers();
          setIsLoading(false);
          setHasError(true);
        });
      } else {
        clearAllTimers();
        setIsLoading(false);
        setHasError(true);
      }
    });

    return () => {
      clearAllTimers();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p: any = playerRef.current;
      playerRef.current = null;
      try {
        if (p && typeof p.isDisposed === "function" && !p.isDisposed())
          p.dispose();
      } catch (_) {}
      const container = containerRef.current;
      if (container && videoEl.parentNode === container)
        container.removeChild(videoEl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setLoadTimedOut(false);
    setIsLoading(true);
    setLoadElapsed(0);
    setQualityLevels([]);
    setSelectedQuality("auto");
    setSelectedProfile("auto");
    setCurrentBandwidthKbps(null);
    startLoadTimeout();
    const p = playerRef.current;
    if (p && typeof p.src === "function") {
      const { masterUrl } = getOptimalHlsUrl(url);
      const finalUrl = masterUrl || url;
      activeUrlRef.current = finalUrl;
      const isHlsUrl = finalUrl.includes(".m3u8");
      p.src({
        src: finalUrl,
        type: isHlsUrl ? "application/x-mpegURL" : "video/mp4",
      });
      p.load();
    }
  }, [url, startLoadTimeout]);

  const renderOverlay = () => {
    if (hasError || loadTimedOut) {
      return (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(8,8,8,0.93)",
            gap: 1.5,
          }}
        >
          <VideoLibraryIcon
            sx={{ fontSize: 56, color: PRIMARY_RED, mb: 0.5 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff" }}>
            {loadTimedOut ? "Tải video quá lâu" : "Không thể phát video"}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              px: 4,
              maxWidth: 380,
              color: "rgba(255,255,255,0.65)",
            }}
          >
            {loadTimedOut
              ? "Kết nối chậm hoặc nguồn video không phản hồi. Vui lòng kiểm tra đường truyền và thử lại."
              : "Có lỗi xảy ra khi phát video. Vui lòng thử lại."}
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={handleRetry}
            sx={{
              mt: 1,
              bgcolor: PRIMARY_RED,
              "&:hover": { bgcolor: PRIMARY_RED_DARK },
            }}
          >
            Thử lại
          </Button>
        </Box>
      );
    }
    if (isLoading) {
      const pct = Math.min((loadElapsed / (LOAD_TIMEOUT_MS / 1000)) * 100, 95);
      return (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(8,8,8,0.80)",
            gap: 2,
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              border: `4px solid ${alpha(PRIMARY_RED, 0.25)}`,
              borderTopColor: PRIMARY_RED,
              animation: "vjs-spin 0.85s linear infinite",
              "@keyframes vjs-spin": { to: { transform: "rotate(360deg)" } },
            }}
          />
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)" }}>
            Đang tải bài giảng…
          </Typography>
          <Box
            sx={{
              width: 180,
              height: 3,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.15)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: "100%",
                borderRadius: 2,
                bgcolor: PRIMARY_RED,
                width: `${pct}%`,
                transition: "width 1s linear",
              }}
            />
          </Box>
          {loadElapsed >= 5 && (
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.45)" }}
            >
              {loadElapsed}s — File lớn, vui lòng chờ…
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "#000", position: "relative" }}>
      {renderOverlay()}
      <Box
        ref={containerRef}
        sx={{
          width: "100%",
          visibility:
            isLoading || hasError || loadTimedOut ? "hidden" : "visible",
        }}
      />
      {!isLoading && !hasError && !loadTimedOut && isHls && (
        <QualityMenu
          qualityLevels={qualityLevels}
          selectedQuality={selectedQuality}
          currentBandwidthKbps={currentBandwidthKbps}
          onSelectQuality={applyVhsQuality}
          cloudinaryInfo={cloudinaryInfo}
          onSelectCloudinaryProfile={applyCloudinaryProfile}
          selectedProfile={selectedProfile}
        />
      )}
    </Box>
  );
};
