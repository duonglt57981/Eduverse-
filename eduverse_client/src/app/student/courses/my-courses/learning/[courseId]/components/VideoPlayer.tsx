/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/khoa-hoc/components/VideoPlayer.tsx

"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  alpha,
} from "@mui/material";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import { OpenInFull as OpenInFullIcon, Close as CloseIcon } from "@mui/icons-material";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "@videojs/http-streaming";

try {
  if (typeof videojs !== "undefined" && (videojs as any).log) {
    (videojs as any).log.level("off");
  }
} catch (_) {}
import { QualityMenu } from "./QualityMenu";
import { QualityLevel } from "../types";
import { getOptimalHlsUrl, buildCloudinaryHlsUrl } from "../utils/cloudinary";
import { VIDEO_JS_STYLES } from "../utils/videoHelpers";
import { CloudinaryUrlInfo } from "@/src/types/Cloudinary/Dto/CloudinaryDto";
import { BRAND } from "@/src/theme/tokens";

const PRIMARY_RED = BRAND.main;
const PRIMARY_RED_DARK = "#7F1D1D";
const LOAD_TIMEOUT_MS = 30000;
const FALLBACK_DEMO_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

interface VideoPlayerProps {
  url: string;
  savedTime?: number;
  isCompleted?: boolean;
  onTimeUpdate: (t: number) => void;
  onEnded: () => void;
  playerId?: string;
  autoPlay?: boolean;
  mini?: boolean;
  onExpandClick?: () => void;
  onCloseClick?: () => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  /** Gọi khi component bị unmount để lưu thời gian cuối */
  onUnmount?: (time: number) => void;
}

interface TechWithVhs {
  vhs?: {
    stats?: {
      bandwidth?: number;
    };
  };
}

export const VideoPlayer = ({
  url,
  savedTime,
  isCompleted,
  onTimeUpdate,
  onEnded,
  playerId = "main",
  autoPlay = true,
  mini = false,
  onExpandClick,
  onCloseClick,
  onPlayStateChange,
  onUnmount,
}: VideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const initialTimeSetRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);
  const currentTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);

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

  const getVideoType = useMemo(() => {
    if (url.includes(".m3u8")) return "application/x-mpegURL";
    if (url.includes(".ts")) return "video/MP2T";
    if (url.includes(".mp4")) return "video/mp4";
    return "video/mp4";
  }, [url]);

  const isHls = useMemo(() => {
    return url.includes(".m3u8");
  }, [url]);

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
    intervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        setLoadElapsed((e) => e + 1);
      }
    }, 1000);
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (isMountedRef.current) {
        setLoadTimedOut(true);
        setIsLoading(false);
      }
    }, LOAD_TIMEOUT_MS);
  }, [clearAllTimers]);

  const applyVhsQuality = useCallback((q: number | "auto") => {
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
          if (autoPlay) {
            p.play()?.catch(() => {});
          }
        });
      }
    },
    [cloudinaryInfo, autoPlay],
  );

  // Main video setup
  useEffect(() => {
    isMountedRef.current = true;

    let s = document.getElementById("vjs-student-styles") as HTMLStyleElement;
    if (!s) {
      s = document.createElement("style");
      s.id = "vjs-student-styles";
      document.head.appendChild(s);
    }
    s.textContent = VIDEO_JS_STYLES(BRAND.main, "#7F1D1D");

    if (!containerRef.current) return;

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

    // Tạo video element
    // mini: giữ khoá tỉ lệ 16:9 (fluid) vì mini-player có kích thước cố định nhỏ
    // full: dùng chế độ "fill" để video lấp đầy 100% chiều rộng/chiều cao của
    // container cha (container cha đã được page.tsx set height = 100vh - header)
    const videoEl = document.createElement("video");
    videoEl.className = mini
      ? "video-js vjs-big-play-centered vjs-16-9"
      : "video-js vjs-big-play-centered vjs-fill";
    videoEl.setAttribute("playsinline", "true");
    containerRef.current.appendChild(videoEl);

    const sourceType = isHlsUrl ? "application/x-mpegURL" : getVideoType;

    // Cấu hình player
    const player = videojs(videoEl, {
      controls: true,
      autoplay: autoPlay,
      preload: "auto",
      fluid: mini,
      fill: !mini,
      aspectRatio: mini ? "16:9" : undefined,
      liveui: false,
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
          : undefined,
        nativeVideoTracks: false,
        nativeAudioTracks: false,
        nativeTextTracks: false,
      },
      controlBar: {
        volumePanel: { inline: true },
        progressControl: { seekBar: true },
        remainingTimeDisplay: false,
        playbackRateMenuButton: true,
        pictureInPictureToggle: false,
        chaptersButton: false,
        subtitlesButton: false,
        captionsButton: false,
        audioTrackButton: false,
        descriptionsButton: false,
        liveDisplay: false,
        seekToLive: false,
      },
      sources: [{ src: finalUrl, type: sourceType }],
    });

    playerRef.current = player;
    initialTimeSetRef.current = false;

    const markReady = () => {
      clearAllTimers();
      if (isMountedRef.current) {
        setIsLoading(false);
        setLoadTimedOut(false);
      }
    };

    player.on("canplay", markReady);

    player.on("loadedmetadata", () => {
      markReady();

      // Set saved time
      if (
        !initialTimeSetRef.current &&
        !isCompleted &&
        savedTime &&
        savedTime > 5
      ) {
        player.currentTime(savedTime);
        initialTimeSetRef.current = true;
      }

      if (autoPlay) {
        player.play()?.catch(() => {});
      }

      if (isHlsUrl) {
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
            if (unique.length > 0 && isMountedRef.current) {
              setQualityLevels(unique);
            }
          };
          buildLevels();
          ql.on("addqualitylevel", buildLevels);
          ql.on("removequalitylevel", buildLevels);
        }
      }
    });

    player.on("play", () => {
      isPlayingRef.current = true;
      onPlayStateChange?.(true);
    });

    player.on("playing", () => {
      isPlayingRef.current = true;
      onPlayStateChange?.(true);
      clearAllTimers();
      if (isMountedRef.current) {
        setIsLoading(false);
        setLoadTimedOut(false);
      }
    });

    player.on("pause", () => {
      // Bỏ qua sự kiện pause tạm thời do người dùng đang kéo thanh tua (scrubbing)
      if (typeof player.scrubbing === "function" && player.scrubbing()) {
        return;
      }
      isPlayingRef.current = false;
      onPlayStateChange?.(false);
    });

    player.on("seeked", () => {
      markReady();
    });

    let lastSent = 0;
    player.on("timeupdate", () => {
      const ct = player.currentTime() ?? 0;
      currentTimeRef.current = ct;

      if (isHlsUrl) {
        const tech = player.tech(true);
        const vhs = (tech as unknown as TechWithVhs)?.vhs;
        if (vhs?.stats?.bandwidth && isMountedRef.current) {
          setCurrentBandwidthKbps(Math.round(vhs.stats.bandwidth / 1000));
        }
      }
      if (ct - lastSent >= 10) {
        lastSent = ct;
        onTimeUpdate(ct);
      }
    });

    player.on("ended", () => {
      isPlayingRef.current = false;
      onPlayStateChange?.(false);
      onEnded();
    });

    let triedFallback = false;
    player.on("error", () => {
      const err = player.error?.();
      if (err) {
        console.warn(
          `[VideoPlayer:${playerId}] Media error (code ${err.code}): ${err.message}`,
        );
      }
      const currentSrc = player.currentSrc?.() ?? "";
      if (isHlsUrl && currentSrc.includes(".m3u8") && info) {
        console.warn(
          `[VideoPlayer:${playerId}] HLS failed, falling back to direct file`,
        );
        const fallbackUrl = url;
        const fallbackType = url.includes(".ts") ? "video/MP2T" : "video/mp4";
        player.src({ src: fallbackUrl, type: fallbackType });
        player.load();
        player.one("error", () => {
          if (!triedFallback && activeUrlRef.current !== FALLBACK_DEMO_VIDEO) {
            triedFallback = true;
            console.warn(`[VideoPlayer:${playerId}] Trying demo video fallback...`);
            activeUrlRef.current = FALLBACK_DEMO_VIDEO;
            player.src({ src: FALLBACK_DEMO_VIDEO, type: "video/mp4" });
            player.load();
            player.play()?.catch(() => {});
            return;
          }
          clearAllTimers();
          if (isMountedRef.current) {
            setIsLoading(false);
            setHasError(true);
          }
        });
      } else {
        if (!triedFallback && activeUrlRef.current !== FALLBACK_DEMO_VIDEO) {
          triedFallback = true;
          console.warn(`[VideoPlayer:${playerId}] Trying demo video fallback...`);
          activeUrlRef.current = FALLBACK_DEMO_VIDEO;
          player.src({ src: FALLBACK_DEMO_VIDEO, type: "video/mp4" });
          player.load();
          player.play()?.catch(() => {});
          return;
        }
        clearAllTimers();
        if (isMountedRef.current) {
          setIsLoading(false);
          setHasError(true);
        }
      }
    });

    // Xử lý resize khi mini thay đổi
    const handleResize = () => {
      if (player && !player.isDisposed?.()) {
        player.trigger("resize");
      }
    };

    // Cleanup
    return () => {
      isMountedRef.current = false;
      clearAllTimers();

      // Lưu thời gian cuối trước khi unmount
      if (onUnmount) {
        onUnmount(currentTimeRef.current);
      }

      const p: any = playerRef.current;
      playerRef.current = null;
      try {
        if (p && typeof p.isDisposed === "function" && !p.isDisposed()) {
          p.dispose();
        }
      } catch (_) {}
      const container = containerRef.current;
      if (container && videoEl.parentNode === container) {
        container.removeChild(videoEl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, playerId]);

  // Xử lý khi mini thay đổi - chỉ trigger resize, không dispose
  useEffect(() => {
    const player = playerRef.current;

    if (!player || player.isDisposed()) return;

    const timer = setTimeout(() => {
      const currentPlayer = playerRef.current;

      if (!currentPlayer || currentPlayer.isDisposed()) return;

      currentPlayer.trigger("resize");
    }, 50);

    return () => {
      clearTimeout(timer);
    };
  }, [mini]);

  // Xử lý autoPlay khi mini thay đổi
  useEffect(() => {
    const player = playerRef.current;
    if (player && !player.isDisposed?.() && autoPlay) {
      // Nếu đang ở mini và video đang play, giữ nguyên
      // Nếu chuyển từ mini sang full và đang pause, có thể resume
      if (!mini && !isPlayingRef.current) {
        player.play()?.catch(() => {});
      }
    }
  }, [mini, autoPlay]);

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
      const type = isHlsUrl
        ? "application/x-mpegURL"
        : finalUrl.includes(".ts")
          ? "video/MP2T"
          : "video/mp4";
      p.src({ src: finalUrl, type });
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
            p: mini ? 1 : 0,
          }}
        >
          <VideoLibraryIcon
            sx={{ fontSize: mini ? 28 : 56, color: PRIMARY_RED, mb: 0.5 }}
          />
          {!mini && (
            <>
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
            </>
          )}
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
            gap: mini ? 1 : 2,
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              width: mini ? 28 : 52,
              height: mini ? 28 : 52,
              borderRadius: "50%",
              border: `${mini ? 3 : 4}px solid ${alpha(PRIMARY_RED, 0.25)}`,
              borderTopColor: PRIMARY_RED,
              animation: "vjs-spin 0.85s linear infinite",
              "@keyframes vjs-spin": { to: { transform: "rotate(360deg)" } },
            }}
          />
          {!mini && (
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.85)" }}
            >
              Đang tải bài giảng…
            </Typography>
          )}
          {!mini && (
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
          )}
          {!mini && loadElapsed >= 5 && (
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
    <Box
      sx={
        mini
          ? {
              position: "fixed",
              bottom: 24,
              right: 24,
              width: 360,
              zIndex: 1300,
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
              border: `2px solid ${PRIMARY_RED}`,
              bgcolor: "#000",
              "@media (max-width: 600px)": {
                width: 280,
                bottom: 16,
                right: 16,
              },
            }
          : {
              width: "100%",
              height: "100%",
              bgcolor: "#000",
              position: "relative",
            }
      }
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: mini ? "auto" : "100%",
        }}
      >
        {renderOverlay()}
        <Box
          ref={containerRef}
          sx={{
            width: "100%",
            height: mini ? "auto" : "100%",
            visibility:
              isLoading || hasError || loadTimedOut ? "hidden" : "visible",
          }}
        />
        {!isLoading && !hasError && !loadTimedOut && isHls && !mini && (
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
      {mini && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 21,
            display: "flex",
            alignItems: "center",
            gap: 0.75,
          }}
        >
          {onExpandClick && (
            <Tooltip title="Mở rộng">
              <IconButton
                size="small"
                onClick={onExpandClick}
                sx={{
                  bgcolor: "rgba(0,0,0,0.65)",
                  color: "#fff",
                  width: 30,
                  height: 30,
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  "&:hover": { bgcolor: PRIMARY_RED },
                }}
              >
                <OpenInFullIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
          {onCloseClick && (
            <Tooltip title="Đóng & Tạm dừng">
              <IconButton
                size="small"
                onClick={onCloseClick}
                sx={{
                  bgcolor: "rgba(0,0,0,0.65)",
                  color: "#fff",
                  width: 30,
                  height: 30,
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  "&:hover": { bgcolor: PRIMARY_RED },
                }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
};
