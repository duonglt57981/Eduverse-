"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
  Dialog,
  Tooltip,
  alpha,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import HighQualityRoundedIcon from "@mui/icons-material/HighQualityRounded";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "@videojs/http-streaming";

try {
  if (typeof videojs !== "undefined" && (videojs as any).log) {
    (videojs as any).log.level("off");
  }
} catch (_) {}
import {
  COLORS,
  FONTS,
  getFileKind,
  getFileName,
  isTrangThaiCho,
} from "../../types/constants";
import StatusChip from "./StatusChip";
import LyDoTuChoiInput from "./LyDoTuChoiInput";

// ======================== CLOUDINARY HELPERS ========================
interface CloudinaryUrlInfo {
  cloudName: string;
  publicId: string;
  version: string;
  baseUrl: string;
}

function parseCloudinaryUrl(url: string): CloudinaryUrlInfo | null {
  try {
    const u = new URL(url);
    if (
      !u.hostname.includes("cloudinary.com") &&
      !u.hostname.includes("res.cloudinary.com")
    ) {
      return null;
    }
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 4 || parts[1] !== "video" || parts[2] !== "upload") {
      return null;
    }
    const cloudName = parts[0];
    const baseUrl = `${u.origin}/${cloudName}/video/upload`;
    const afterUpload = parts.slice(3);

    let versionIdx = -1;
    for (let i = 0; i < afterUpload.length; i++) {
      if (/^v\d{8,}$/.test(afterUpload[i])) {
        versionIdx = i;
        break;
      }
    }

    let version = "";
    let publicIdSegments: string[];
    if (versionIdx !== -1) {
      version = afterUpload[versionIdx];
      publicIdSegments = afterUpload.slice(versionIdx + 1);
    } else {
      let startIdx = 0;
      for (let i = 0; i < afterUpload.length - 1; i++) {
        if (
          /^(sp_|vc_|ac_|f_|q_|w_|h_|c_|fl_|so_|du_|br_|fps_)/.test(
            afterUpload[i],
          )
        ) {
          startIdx = i + 1;
        }
      }
      publicIdSegments = afterUpload.slice(startIdx);
    }

    const lastSeg = publicIdSegments[publicIdSegments.length - 1];
    publicIdSegments[publicIdSegments.length - 1] = lastSeg.replace(
      /\.[^.]+$/,
      "",
    );
    const publicId = publicIdSegments.join("/");
    if (!publicId) return null;

    return { cloudName, publicId, version, baseUrl };
  } catch {
    return null;
  }
}

function buildCloudinaryHlsUrl(
  info: CloudinaryUrlInfo,
  profile: string,
): string {
  const versionPart = info.version ? `${info.version}/` : "";
  return `${info.baseUrl}/${profile}/${versionPart}${info.publicId}.m3u8`;
}

function getOptimalHlsUrl(originalUrl: string): {
  masterUrl: string;
  cloudinaryInfo: CloudinaryUrlInfo | null;
} {
  const info = parseCloudinaryUrl(originalUrl);
  if (!info) return { masterUrl: originalUrl, cloudinaryInfo: null };
  return {
    masterUrl: buildCloudinaryHlsUrl(info, "sp_auto"),
    cloudinaryInfo: info,
  };
}

// ======================== VIDEO.JS STYLES ========================
// Thay thế toàn bộ phần VIDEO_JS_STYLES bằng nội dung dưới đây
const VIDEO_JS_STYLES = (PRIMARY_RED: string) => `
  /* Nút play tam giác, không nền, không poster */
  .video-js .vjs-big-play-button {
    background-color: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    width: 80px !important;
    height: 80px !important;
    line-height: 80px !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    margin: 0 !important;
    padding: 0 !important;
    transition: opacity 0.2s ease, transform 0.2s ease !important;
    opacity: 0.9 !important;
    font-size: 5em !important;
    color: #fff !important;
    text-shadow: 0 0 20px rgba(0,0,0,0.6) !important;
  }
  .video-js .vjs-big-play-button .vjs-icon-placeholder:before {
    content: "\\25B6" !important;
    font-size: 1em !important;
    line-height: 1 !important;
    position: relative !important;
    top: 0 !important;
    left: 4px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    height: 100% !important;
  }
  .video-js:hover .vjs-big-play-button {
    opacity: 1 !important;
    transform: translate(-50%, -50%) scale(1.05) !important;
  }
  /* Khi đang phát, ẩn nút tam giác */
  .video-js.vjs-playing .vjs-big-play-button {
    display: none !important;
  }
  /* Giữ màu primary cho thanh tiến trình */
  .video-js .vjs-play-progress {
    background-color: ${PRIMARY_RED} !important;
  }
  .video-js .vjs-volume-level {
    background-color: ${PRIMARY_RED} !important;
  }
  .video-js .vjs-load-progress {
    background-color: rgba(255,255,255,0.4) !important;
  }
  /* Ẩn poster (ảnh đại diện) */
  .video-js .vjs-poster {
    display: none !important;
  }
`;

// ======================== CONSTANTS ========================
const VIEW_MIN_HEIGHT = 300;
const VIEW_MAX_HEIGHT = 600;
const FULL_HEIGHT = "calc(100vh - 132px)";
const TOOLBAR_CROP_PX = 48;
const LOAD_TIMEOUT_MS = 30000;

interface QualityLevel {
  index: number;
  label: string;
  bitrate: number;
  height: number;
}

interface TechWithVhs {
  vhs?: {
    stats?: {
      bandwidth?: number;
    };
  };
}

// ======================== MAIN COMPONENT ========================
export default function NoiDungViewer({
  selected,
  onSaveLyDo,
}: {
  selected: any;
  onSaveLyDo?: (
    loai: "baiGiang" | "baiKiemTra",
    id: string | number,
    lyDo: string,
  ) => Promise<void>;
}) {
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
      : loai === "taiLieu"
        ? item.tenTaiLieu || item.tieuDe || "Tài liệu"
        : item.tenBaiKiemTra || item.tieuDe || "Bài kiểm tra";

  const url =
    item.duongDan ??
    item.url ??
    item.videoUrl ??
    item.fileUrl ??
    item.link ??
    item.urlBaiGiang ??
    null;

  const isTest = loai === "baiKiemTra";

  // ----- Xác định id và lý do hiện tại cho form -----
  const idDoiTuong =
    loai === "baiGiang"
      ? item.idBaiGiang
      : loai === "baiKiemTra"
        ? item.idBaiKiemTra
        : null;
  const isPending = isTrangThaiCho(item.trangThaiPheDuyet);
  const showLyDoForm =
    (loai === "baiGiang" || loai === "baiKiemTra") &&
    isPending &&
    typeof onSaveLyDo === "function" &&
    idDoiTuong;

  // ---- LẤY LÝ DO TỪ CHỐI (hỗ trợ object và array) ----
  let currentLyDo = "";
  const lyDoData = item.lyDoTuChois;

  if (lyDoData) {
    if (Array.isArray(lyDoData) && lyDoData.length > 0) {
      currentLyDo = lyDoData
        .map((l: any) => l.lyDo || "")
        .filter(Boolean)
        .join(", ");
    } else if (typeof lyDoData === "object" && lyDoData.lyDo) {
      currentLyDo = lyDoData.lyDo;
    } else if (typeof lyDoData === "string") {
      currentLyDo = lyDoData;
    }
  }

  // Fallback cho trường cũ (nếu có)
  if (!currentLyDo && typeof item.lyDoTuChoi === "string") {
    currentLyDo = item.lyDoTuChoi;
  }
  if (!currentLyDo && Array.isArray(item.lyDoTuChoi)) {
    currentLyDo = item.lyDoTuChoi.filter(Boolean).join(", ");
  }
  // ------------------------------------

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        position: "relative",
        isolation: "isolate",
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
        {loai === "baiGiang" ? (
          <PlayCircleIcon sx={{ color: COLORS.primary, fontSize: 22 }} />
        ) : loai === "taiLieu" ? (
          <AttachFileIcon sx={{ color: COLORS.gold, fontSize: 22 }} />
        ) : (
          <QuizRoundedIcon sx={{ color: "#7C3AED", fontSize: 22 }} />
        )}
        <Typography
          sx={{
            flex: 1,
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 18,
            color: "var(--ev-text-primary, #1F2937)",
          }}
          noWrap
        >
          {title}
        </Typography>
        <StatusChip trangThai={item.trangThaiPheDuyet} />
        {url && !isTest && (
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

      <Box sx={{ mb: 2, position: "relative" }}>
        <ViewerBody
          loai={loai}
          url={url}
          item={item}
          minHeight={VIEW_MIN_HEIGHT}
          maxHeight={VIEW_MAX_HEIGHT}
        />
      </Box>

      {/* ---- HIỂN THỊ FORM LÝ DO TỪ CHỐI NẾU CÓ ---- */}
      {showLyDoForm && (
        <LyDoTuChoiInput
          key={`${loai}-${idDoiTuong}`}
          idDoiTuong={idDoiTuong}
          loaiDoiTuong={loai === "baiGiang" ? "BaiGiang" : "BaiKiemTra"}
          initialValue={currentLyDo}
          onSave={(lyDo) => onSaveLyDo(loai, idDoiTuong, lyDo)}
        />
      )}

      {url && !isTest && (
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
              minHeight={VIEW_MIN_HEIGHT}
              maxHeight={FULL_HEIGHT}
              isFullscreen
            />
          </Box>
        </Dialog>
      )}
    </Box>
  );
}

// ======================== VIEWER BODY ========================
function ViewerBody({
  loai,
  url,
  item,
  minHeight,
  maxHeight,
  isFullscreen = false,
}: {
  loai: string;
  url: string | null;
  item: any;
  minHeight: string | number;
  maxHeight: string | number;
  isFullscreen?: boolean;
}) {
  // Bài kiểm tra
  if (loai === "baiKiemTra") {
    const cauHois: any[] = item.cauHois ?? [];
    return (
      <Box
        sx={{
          minHeight,
          maxHeight,
          overflowY: "auto",
          overflowX: "hidden",
          position: "relative",
          isolation: "isolate",
          contain: "layout paint",
          bgcolor: "var(--ev-paper-alt, #FBFAF9)",
          border: `1px solid ${COLORS.line}`,
          p: 2,
          borderRadius: 2,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: alpha(COLORS.primary, 0.2),
            borderRadius: "8px",
          },
        }}
      >
        {cauHois.length === 0 ? (
          <Typography
            sx={{ color: COLORS.inkSoft, textAlign: "center", mt: 4 }}
          >
            Bài kiểm tra chưa có câu hỏi.
          </Typography>
        ) : (
          <Stack spacing={2}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 16,
                  color: COLORS.ink,
                  fontFamily: FONTS.display,
                }}
              >
                Danh sách câu hỏi
              </Typography>
              <Typography
                sx={{
                  fontSize: 14,
                  color: COLORS.inkSoft,
                  fontWeight: 500,
                }}
              >
                {cauHois.length} câu hỏi
              </Typography>
            </Box>

            {cauHois.map((ch: any, idx: number) => (
              <Paper
                key={ch.idCauHoi ?? idx}
                elevation={0}
                sx={{
                  p: 2,
                  border: `1px solid ${COLORS.line}`,
                  backgroundColor: "var(--ev-paper, #FFFFFF)",
                  transition: "box-shadow 0.2s",
                  "&:hover": {
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  },
                  position: "relative",
                  isolation: "isolate",
                  overflow: "hidden",
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}
                >
                  <Box
                    sx={{
                      minWidth: 28,
                      height: 28,
                      borderRadius: "50%",
                      backgroundColor: alpha(COLORS.primary, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      mt: 0.2,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: COLORS.primary,
                      }}
                    >
                      {idx + 1}
                    </Typography>
                  </Box>
                  {/* Nội dung câu hỏi có thể chứa HTML (bold, italic, ảnh, danh sách...) nên render bằng dangerouslySetInnerHTML thay vì text thuần */}
                  <Box
                    sx={{
                      flex: 1,
                      fontWeight: 600,
                      color: COLORS.ink,
                      fontSize: 15,
                      lineHeight: 1.5,
                      "& p": { m: 0 },
                      "& img": {
                        maxWidth: "100%",
                        borderRadius: 1,
                        display: "block",
                        my: 0.5,
                      },
                      "& ul, & ol": { pl: 3, m: 0 },
                    }}
                    dangerouslySetInnerHTML={{
                      __html: ch.noiDungCauHoi ?? ch.tieuDe ?? "",
                    }}
                  />
                </Box>

                <Box sx={{ ml: 4.5, mt: 1.5 }}>
                  <Stack spacing={0.75}>
                    {(ch.dapAns ?? []).map((da: any, daIdx: number) => {
                      const isCorrect =
                        da.dapAnDung || da.isDung || da.laDapAnDung;
                      return (
                        <Box
                          key={da.idDapAn ?? daIdx}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            p: 0.75,
                            borderRadius: 1,
                            backgroundColor: isCorrect
                              ? alpha(COLORS.success, 0.08)
                              : "transparent",
                            transition: "background-color 0.15s",
                          }}
                        >
                          {isCorrect ? (
                            <CheckCircleIcon
                              sx={{
                                color: COLORS.success,
                                fontSize: 18,
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <RadioButtonUncheckedIcon
                              sx={{
                                color: COLORS.inkSoft,
                                fontSize: 18,
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <Typography
                            variant="body2"
                            sx={{
                              color: isCorrect ? COLORS.ink : COLORS.inkSoft,
                              fontWeight: isCorrect ? 600 : 400,
                              fontSize: 14,
                            }}
                          >
                            {da.noiDungDapAn ?? da.tieuDe}
                          </Typography>
                          {isCorrect && (
                            <Box
                              component="span"
                              sx={{
                                ml: "auto",
                                fontSize: 11,
                                fontWeight: 600,
                                color: COLORS.success,
                                backgroundColor: alpha(COLORS.success, 0.12),
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                              }}
                            >
                              Đúng
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    );
  }

  // Không có URL
  if (!url) {
    return (
      <Box
        sx={{
          minHeight,
          maxHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: COLORS.paper,
          border: `1px dashed ${COLORS.line}`,
          position: "relative",
          isolation: "isolate",
          overflow: "hidden",
          borderRadius: 2,
          flexShrink: 0,
        }}
      >
        <Typography sx={{ color: COLORS.inkSoft }}>
          Chưa có nội dung để xem trước.
        </Typography>
      </Box>
    );
  }

  // Video
  if (loai === "baiGiang") {
    return (
      <VideoPlayer
        url={url}
        minHeight={minHeight}
        maxHeight={maxHeight}
        isFullscreen={isFullscreen}
      />
    );
  }

  // Tài liệu
  return (
    <TaiLieuPreview
      url={url}
      tenTaiLieu={item.tenTaiLieu || item.tieuDe || "Tài liệu"}
      minHeight={minHeight}
      maxHeight={maxHeight}
    />
  );
}

// ======================== VIDEO PLAYER ========================
function VideoPlayer({
  url,
  minHeight,
  maxHeight,
  isFullscreen = false,
}: {
  url: string;
  minHeight: string | number;
  maxHeight: string | number;
  isFullscreen?: boolean;
}) {
  const [useFallback, setUseFallback] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadTimedOut, setLoadTimedOut] = useState(false);

  const handleFallback = useCallback(() => {
    setUseFallback(true);
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { masterUrl } = getOptimalHlsUrl(url);
  const isHls = masterUrl.includes(".m3u8");

  useEffect(() => {
    if (useFallback && !isHls) {
      const video = videoRef.current;
      if (!video) return;
      setIsLoading(true);
      setHasError(false);
      setLoadTimedOut(false);
      video.load();

      const timeout = setTimeout(() => {
        setLoadTimedOut(true);
        setIsLoading(false);
      }, LOAD_TIMEOUT_MS);

      const onCanPlay = () => {
        clearTimeout(timeout);
        setIsLoading(false);
        setLoadTimedOut(false);
      };
      video.addEventListener("canplay", onCanPlay);
      video.addEventListener("loadeddata", onCanPlay);
      video.addEventListener("error", () => {
        clearTimeout(timeout);
        setIsLoading(false);
        setHasError(true);
      });
      return () => {
        clearTimeout(timeout);
        video.removeEventListener("canplay", onCanPlay);
        video.removeEventListener("loadeddata", onCanPlay);
      };
    }
  }, [useFallback, isHls, masterUrl]);

  if (!useFallback) {
    return (
      <VideoJsPlayer
        url={url}
        minHeight={minHeight}
        maxHeight={maxHeight}
        isFullscreen={isFullscreen}
        onFallback={handleFallback}
      />
    );
  }

  if (isHls) {
    return (
      <Box
        sx={{
          width: "100%",
          aspectRatio: "16/9",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#000",
          p: 3,
          position: "relative",
          isolation: "isolate",
          overflow: "hidden",
          borderRadius: 2,
          flexShrink: 0,
        }}
      >
        <Typography sx={{ color: "#fff", textAlign: "center" }}>
          Video ở định dạng HLS (streaming) không thể phát với trình duyệt hiện
          tại.
          <br />
          Vui lòng sử dụng trình duyệt hỗ trợ (Chrome, Edge, Firefox mới).
        </Typography>
        <Button
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          sx={{ mt: 2, color: "#fff", borderColor: "#fff" }}
        >
          Mở video trực tiếp
        </Button>
      </Box>
    );
  }

  const getVideoType = (src: string): string => {
    if (src.includes(".m3u8")) return "application/x-mpegURL";
    if (src.endsWith(".webm")) return "video/webm";
    if (src.endsWith(".ogg")) return "video/ogg";
    if (src.endsWith(".mov")) return "video/quicktime";
    if (src.endsWith(".avi")) return "video/x-msvideo";
    return "video/mp4";
  };

  return (
    <Box
      sx={{
        width: "100%",
        aspectRatio: "16/9",
        bgcolor: "#000",
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
        borderRadius: 2,
        flexShrink: 0,
      }}
    >
      {isLoading && !hasError && !loadTimedOut && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            bgcolor: "#000",
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: `4px solid ${alpha(COLORS.primary, 0.25)}`,
              borderTopColor: COLORS.primary,
              animation: "spin 0.85s linear infinite",
              "@keyframes spin": {
                to: { transform: "rotate(360deg)" },
              },
            }}
          />
          <Typography variant="caption" sx={{ color: "#fff" }}>
            Đang tải video...
          </Typography>
        </Box>
      )}
      {(hasError || loadTimedOut) && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.25,
            bgcolor: "#000",
            px: 3,
          }}
        >
          <Typography sx={{ color: "#fff", textAlign: "center" }}>
            {loadTimedOut
              ? "Tải video quá lâu. Vui lòng thử lại."
              : "Không thể phát video."}
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              setHasError(false);
              setLoadTimedOut(false);
              setIsLoading(true);
              const video = videoRef.current;
              if (video) {
                video.load();
              }
            }}
            sx={{
              textTransform: "none",
              bgcolor: COLORS.primary,
              "&:hover": { bgcolor: COLORS.primaryDark },
            }}
          >
            Thử lại
          </Button>
        </Box>
      )}
      <video
        ref={videoRef}
        controls
        preload="metadata"
        playsInline
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "contain",
          visibility:
            isLoading || hasError || loadTimedOut ? "hidden" : "visible",
        }}
      >
        <source src={masterUrl} type={getVideoType(masterUrl)} />
        <Typography sx={{ color: "#fff", p: 2 }}>
          Trình duyệt của bạn không hỗ trợ phát video.
        </Typography>
      </video>
    </Box>
  );
}

// ======================== VIDEO.JS PLAYER ========================
function VideoJsPlayer({
  url,
  minHeight,
  maxHeight,
  isFullscreen = false,
  onFallback,
}: {
  url: string;
  minHeight: string | number;
  maxHeight: string | number;
  isFullscreen?: boolean;
  onFallback: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSelectedRef = useRef(false);

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
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const { masterUrl } = getOptimalHlsUrl(url);
  const isHls = masterUrl.includes(".m3u8");

  const getVideoType = (src: string): string => {
    if (src.includes(".m3u8")) return "application/x-mpegURL";
    if (src.endsWith(".webm")) return "video/webm";
    if (src.endsWith(".ogg")) return "video/ogg";
    if (src.endsWith(".mov")) return "video/quicktime";
    if (src.endsWith(".avi")) return "video/x-msvideo";
    return "video/mp4";
  };

  useEffect(() => {
    if (!document.getElementById("vjs-kiemduyet-styles")) {
      const s = document.createElement("style");
      s.id = "vjs-kiemduyet-styles";
      s.textContent = VIDEO_JS_STYLES(COLORS.primary);
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
      clearAllTimers();
      setLoadTimedOut(true);
      setIsLoading(false);
    }, LOAD_TIMEOUT_MS);
  }, [clearAllTimers]);

  const applyQuality = useCallback((q: number | "auto") => {
    const ql = (playerRef.current as any)?.qualityLevels?.();
    if (ql) {
      for (let i = 0; i < ql.length; i++) {
        ql[i].enabled = q === "auto" ? true : i === q;
      }
    }
    setSelectedQuality(q);
    setMenuAnchor(null);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setHasError(false);
    setIsLoading(true);
    setLoadTimedOut(false);
    setLoadElapsed(0);
    setQualityLevels([]);
    setSelectedQuality("auto");
    setCurrentBandwidthKbps(null);
    autoSelectedRef.current = false;
    startLoadTimeout();

    const videoEl = document.createElement("video");
    videoEl.className = "video-js vjs-big-play-centered";
    container.appendChild(videoEl);

    try {
      const player = videojs(videoEl, {
        controls: true,
        autoplay: false,
        preload: "auto",
        fluid: true,
        fill: true,
        responsive: true,
        aspectRatio: "16:9",
        html5: {
          vhs: isHls
            ? {
                overrideNative: true,
                useNetworkInformationApi: true,
                enableLowInitialPlaylist: false,
                smoothQualityChange: true,
                handlePartialData: true,
                bandwidth: 8_000_000,
              }
            : undefined,
          nativeVideoTracks: false,
          nativeAudioTracks: false,
          nativeTextTracks: false,
        },
        controlBar: {
          volumePanel: { inline: false },
          pictureInPictureToggle: false,
          chaptersButton: false,
          subtitlesButton: false,
          captionsButton: false,
          audioTrackButton: false,
          descriptionsButton: false,
        },
        sources: [
          {
            src: masterUrl,
            type: getVideoType(masterUrl),
            crossOrigin: "anonymous",
          },
        ],
      });

      playerRef.current = player;

      const markReady = () => {
        clearAllTimers();
        setIsLoading(false);
        setLoadTimedOut(false);
      };

      player.on("loadedmetadata", () => {
        markReady();

        if (isHls) {
          const ql = (player as any).qualityLevels?.();
          if (ql) {
            const buildLevels = () => {
              const levels: QualityLevel[] = [];
              for (let i = 0; i < ql.length; i++) {
                const lv = ql[i];
                const h: number = lv.height ?? 0;
                const bitrate: number = lv.bitrate ?? 0;
                let label: string;
                if (h >= 2160) label = "4K (2160p)";
                else if (h >= 1440) label = "1440p";
                else if (h >= 1080) label = "1080p HD";
                else if (h >= 720) label = "720p HD";
                else if (h >= 480) label = "480p";
                else if (h >= 360) label = "360p";
                else if (h >= 240) label = "240p";
                else if (h > 0) label = `${h}p`;
                else label = `${Math.round(bitrate / 1000)} kbps`;
                levels.push({ index: i, label, bitrate, height: h });
              }
              levels.sort((a, b) => b.bitrate - a.bitrate);
              const seen = new Set<string>();
              const unique = levels.filter((l) => {
                if (seen.has(l.label)) return false;
                seen.add(l.label);
                return true;
              });
              if (unique.length > 0) {
                setQualityLevels(unique);
                if (!autoSelectedRef.current) {
                  autoSelectedRef.current = true;
                  applyQuality(unique[0].index);
                }
              }
            };
            buildLevels();
            ql.on("addqualitylevel", buildLevels);
            ql.on("removequalitylevel", buildLevels);
          }
        }
      });

      player.on("playing", markReady);
      player.on("canplay", markReady);

      player.on("timeupdate", () => {
        if (!isHls) return;
        const tech = player.tech(true);
        const vhs = (tech as unknown as TechWithVhs)?.vhs;
        if (vhs?.stats?.bandwidth) {
          setCurrentBandwidthKbps(Math.round(vhs.stats.bandwidth / 1000));
        }
      });

      player.on("error", () => {
        clearAllTimers();
        setIsLoading(false);
        setHasError(true);
      });

      return () => {
        clearAllTimers();
        const p: any = playerRef.current;
        playerRef.current = null;
        try {
          if (p && typeof p.isDisposed === "function" && !p.isDisposed()) {
            p.dispose();
          }
        } catch {
          // ignore
        }
        if (container && videoEl.parentNode === container) {
          container.removeChild(videoEl);
        }
      };
    } catch (err) {
      console.error("Video.js init error:", err);
      onFallback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterUrl, isHls, startLoadTimeout, onFallback]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setLoadTimedOut(false);
    setIsLoading(true);
    setLoadElapsed(0);
    startLoadTimeout();
    const p = playerRef.current;
    if (p && typeof p.load === "function") {
      p.load();
    }
  }, [startLoadTimeout]);

  const containerStyle = isFullscreen
    ? {
        width: "100%",
        height: "100%",
        minHeight: minHeight,
        maxHeight: maxHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative" as const,
        isolation: "isolate" as const,
        overflow: "hidden" as const,
        borderRadius: 2,
        flexShrink: 0,
      }
    : {
        width: "100%",
        aspectRatio: "16/9",
        position: "relative" as const,
        isolation: "isolate" as const,
        overflow: "hidden" as const,
        borderRadius: 2,
        flexShrink: 0,
      };

  return (
    <Box sx={containerStyle}>
      <Box
        ref={containerRef}
        sx={{
          width: "100%",
          height: isFullscreen ? "100%" : "100%",
          visibility:
            isLoading || hasError || loadTimedOut ? "hidden" : "visible",
          "& .video-js": {
            width: "100% !important",
            height: "100% !important",
          },
        }}
      />
      {!isLoading && !hasError && !loadTimedOut && isHls && (
        <>
          <Tooltip title="Chất lượng video">
            <IconButton
              size="small"
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 2,
                bgcolor: alpha("#000", 0.55),
                color: "#fff",
                "&:hover": { bgcolor: alpha("#000", 0.75) },
              }}
            >
              <HighQualityRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={menuAnchor}
            open={!!menuAnchor}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem
              selected={selectedQuality === "auto"}
              onClick={() => applyQuality("auto")}
            >
              <ListItemText
                primary="Tự động"
                secondary={
                  currentBandwidthKbps
                    ? `${Math.round(currentBandwidthKbps / 1000)} Mbps`
                    : undefined
                }
              />
            </MenuItem>
            {qualityLevels.map((lv) => (
              <MenuItem
                key={lv.index}
                selected={selectedQuality === lv.index}
                onClick={() => applyQuality(lv.index)}
              >
                {lv.index === qualityLevels[0]?.index && (
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <HighQualityRoundedIcon
                      fontSize="small"
                      sx={{ color: COLORS.primary }}
                    />
                  </ListItemIcon>
                )}
                <ListItemText inset={lv.index !== qualityLevels[0]?.index}>
                  {lv.label}
                </ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </>
      )}

      {isLoading && !hasError && !loadTimedOut && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            bgcolor: "#000",
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: `4px solid ${alpha(COLORS.primary, 0.25)}`,
              borderTopColor: COLORS.primary,
              animation: "vjs-kiemduyet-spin 0.85s linear infinite",
              "@keyframes vjs-kiemduyet-spin": {
                to: { transform: "rotate(360deg)" },
              },
            }}
          />
          <Typography variant="caption" sx={{ color: "#fff" }}>
            Đang tải video{loadElapsed >= 5 ? ` (${loadElapsed}s)…` : "…"}
          </Typography>
        </Box>
      )}

      {(hasError || loadTimedOut) && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.25,
            bgcolor: "#000",
            px: 3,
          }}
        >
          <Typography sx={{ color: "#fff", textAlign: "center" }}>
            {loadTimedOut
              ? "Tải video quá lâu. Vui lòng kiểm tra kết nối và thử lại."
              : "Không thể phát video. Vui lòng thử lại."}
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={handleRetry}
            sx={{
              textTransform: "none",
              bgcolor: COLORS.primary,
              "&:hover": { bgcolor: COLORS.primaryDark },
            }}
          >
            Thử lại
          </Button>
        </Box>
      )}
    </Box>
  );
}

// ======================== TÀI LIỆU PREVIEW ========================
function TaiLieuPreview({
  url,
  tenTaiLieu,
  minHeight,
  maxHeight,
}: {
  url: string;
  tenTaiLieu: string;
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
        border: `1px solid ${COLORS.line}`,
        minHeight: minHeight,
        maxHeight: maxHeight,
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
        borderRadius: 2,
        flexShrink: 0,
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
          border: `1px solid ${COLORS.line}`,
          bgcolor: "var(--ev-paper-alt, #FBFAF9)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: minHeight,
          maxHeight: maxHeight,
          position: "relative",
          isolation: "isolate",
          overflow: "hidden",
          borderRadius: 2,
          flexShrink: 0,
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
        minHeight: minHeight,
        maxHeight: maxHeight,
        border: `1px dashed ${COLORS.line}`,
        bgcolor: COLORS.paper,
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
        borderRadius: 2,
        flexShrink: 0,
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
