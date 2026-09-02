/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Slider,
  Stack,
  Box,
  Typography,
  Tooltip,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  RotateLeftRounded,
  RotateRightRounded,
  AddRounded,
  RemoveRounded,
  RestartAltRounded,
  CheckRounded,
  CloseRounded,
  VisibilityRounded,
} from "@mui/icons-material";

interface AvatarCropModalProps {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onSave: (croppedBlob: Blob) => Promise<void> | void;
  loading?: boolean;
}

const VIEWPORT_SIZE = 340;
const CROP_RADIUS = 130; // Diameter = 260px
const OUTPUT_SIZE = 512;

export function AvatarCropModal({
  open,
  imageSrc,
  onClose,
  onSave,
  loading = false,
}: AvatarCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Load image when imageSrc changes or modal opens
  useEffect(() => {
    if (!open || !imageSrc) {
      setImage(null);
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [open, imageSrc]);

  // Calculate pan limits to prevent white/empty gaps inside the crop circle
  const getClampedPan = useCallback(
    (
      currentPan: { x: number; y: number },
      currentZoom: number,
      currentRot: number,
      img: HTMLImageElement,
    ) => {
      const isRotated90 = currentRot === 90 || currentRot === 270;
      const effImgW = isRotated90 ? img.height : img.width;
      const effImgH = isRotated90 ? img.width : img.height;

      const cropDiameter = CROP_RADIUS * 2;
      const baseScale = Math.max(cropDiameter / effImgW, cropDiameter / effImgH);
      const totalScale = baseScale * currentZoom;

      const effDrawnW = effImgW * totalScale;
      const effDrawnH = effImgH * totalScale;

      const maxPanX = Math.max(0, (effDrawnW - cropDiameter) / 2);
      const maxPanY = Math.max(0, (effDrawnH - cropDiameter) / 2);

      return {
        x: Math.min(Math.max(currentPan.x, -maxPanX), maxPanX),
        y: Math.min(Math.max(currentPan.y, -maxPanY), maxPanY),
      };
    },
    [],
  );

  // Render on main editor canvas and mini preview canvas
  const drawCanvases = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const w = VIEWPORT_SIZE;
    const h = VIEWPORT_SIZE;
    const cx = w / 2;
    const cy = h / 2;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Dark background
    ctx.fillStyle = "#0F172A";
    ctx.fillRect(0, 0, w, h);

    // Calculate clamped pan
    const clampedPan = getClampedPan(pan, zoom, rotation, image);

    const isRotated90 = rotation === 90 || rotation === 270;
    const effImgW = isRotated90 ? image.height : image.width;
    const effImgH = isRotated90 ? image.width : image.height;

    const cropDiameter = CROP_RADIUS * 2;
    const baseScale = Math.max(cropDiameter / effImgW, cropDiameter / effImgH);
    const totalScale = baseScale * zoom;

    const drawnW = image.width * totalScale;
    const drawnH = image.height * totalScale;

    // Draw transformed image
    ctx.save();
    ctx.translate(cx + clampedPan.x, cy + clampedPan.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(image, -drawnW / 2, -drawnH / 2, drawnW, drawnH);
    ctx.restore();

    // Dark overlay outside the crop circle
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.68)";
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.arc(cx, cy, CROP_RADIUS, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.restore();

    // White circle outline guide
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, CROP_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Subtle center crosshair guide
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy);
    ctx.lineTo(cx + 10, cy);
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx, cy + 10);
    ctx.stroke();
    ctx.restore();

    ctx.restore();

    // Draw Mini Preview Canvas
    const previewCanvas = previewCanvasRef.current;
    if (previewCanvas) {
      const pCtx = previewCanvas.getContext("2d");
      if (pCtx) {
        const pSize = 72;
        previewCanvas.width = pSize * dpr;
        previewCanvas.height = pSize * dpr;
        previewCanvas.style.width = `${pSize}px`;
        previewCanvas.style.height = `${pSize}px`;

        pCtx.save();
        pCtx.scale(dpr, dpr);

        // Circular clipping
        pCtx.beginPath();
        pCtx.arc(pSize / 2, pSize / 2, pSize / 2, 0, Math.PI * 2);
        pCtx.clip();

        const pRatio = pSize / cropDiameter;
        const pDrawnW = drawnW * pRatio;
        const pDrawnH = drawnH * pRatio;

        pCtx.translate(pSize / 2 + clampedPan.x * pRatio, pSize / 2 + clampedPan.y * pRatio);
        pCtx.rotate((rotation * Math.PI) / 180);
        pCtx.drawImage(image, -pDrawnW / 2, -pDrawnH / 2, pDrawnW, pDrawnH);
        pCtx.restore();
      }
    }
  }, [image, zoom, rotation, pan, getClampedPan]);

  useEffect(() => {
    drawCanvases();
  }, [drawCanvases]);

  // Mouse & Touch Drag Handlers
  const handlePointerDown = (clientX: number, clientY: number) => {
    if (!image) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: clientX, y: clientY };
    panStartRef.current = { ...pan };
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current || !image) return;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;

    const newPan = {
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    };

    setPan(getClampedPan(newPan, zoom, rotation, image));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Zoom control
  const handleZoomChange = (_: Event, val: number | number[]) => {
    const nextZoom = typeof val === "number" ? val : val[0];
    setZoom(nextZoom);
    if (image) {
      setPan((prev) => getClampedPan(prev, nextZoom, rotation, image));
    }
  };

  const adjustZoom = (delta: number) => {
    const nextZoom = Math.min(Math.max(Number((zoom + delta).toFixed(2)), 1), 3);
    setZoom(nextZoom);
    if (image) {
      setPan((prev) => getClampedPan(prev, nextZoom, rotation, image));
    }
  };

  // Rotate control
  const handleRotate = (delta: number) => {
    const nextRot = (rotation + delta + 360) % 360;
    setRotation(nextRot);
    if (image) {
      setPan((prev) => getClampedPan(prev, zoom, nextRot, image));
    }
  };

  // Reset controls
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    adjustZoom(delta);
  };

  // Save / Export cropped 1:1 image
  const handleSave = () => {
    if (!image) return;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = OUTPUT_SIZE;
    exportCanvas.height = OUTPUT_SIZE;
    const eCtx = exportCanvas.getContext("2d");
    if (!eCtx) return;

    const cropDiameter = CROP_RADIUS * 2;
    const clampedPan = getClampedPan(pan, zoom, rotation, image);

    const isRotated90 = rotation === 90 || rotation === 270;
    const effImgW = isRotated90 ? image.height : image.width;
    const effImgH = isRotated90 ? image.width : image.height;

    const baseScale = Math.max(cropDiameter / effImgW, cropDiameter / effImgH);
    const totalScale = baseScale * zoom;

    const drawnW = image.width * totalScale;
    const drawnH = image.height * totalScale;

    const scaleFactor = OUTPUT_SIZE / cropDiameter;
    const finalDrawnW = drawnW * scaleFactor;
    const finalDrawnH = drawnH * scaleFactor;

    eCtx.save();
    eCtx.translate(
      OUTPUT_SIZE / 2 + clampedPan.x * scaleFactor,
      OUTPUT_SIZE / 2 + clampedPan.y * scaleFactor,
    );
    eCtx.rotate((rotation * Math.PI) / 180);
    eCtx.drawImage(
      image,
      -finalDrawnW / 2,
      -finalDrawnH / 2,
      finalDrawnW,
      finalDrawnH,
    );
    eCtx.restore();

    exportCanvas.toBlob(
      (blob) => {
        if (blob) {
          onSave(blob);
        }
      },
      "image/jpeg",
      0.92,
    );
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "24px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
            overflow: "hidden",
            bgcolor: "#FFFFFF",
          },
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          p: 2.5,
          pb: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #F1F5F9",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "1.05rem",
              fontWeight: 800,
              color: "#0F172A",
              letterSpacing: "-0.01em",
            }}
          >
            Chỉnh sửa ảnh đại diện
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "#64748B", mt: 0.25 }}>
            Kéo để di chuyển, dùng thanh trượt để phóng to / thu nhỏ
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          disabled={loading}
          sx={{
            color: "#64748B",
            bgcolor: "#F8FAFC",
            "&:hover": { bgcolor: "#F1F5F9", color: "#0F172A" },
          }}
        >
          <CloseRounded fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ p: 2.5, bgcolor: "#FAFAFA" }}>
        <Stack spacing={2.5} sx={{ alignItems: "center" }}>
          {/* Main Cropper Canvas */}
          <Box
            onWheel={handleWheel}
            onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
            onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={(e) => {
              if (e.touches.length === 1) {
                handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchMove={(e) => {
              if (e.touches.length === 1) {
                handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchEnd={handlePointerUp}
            sx={{
              width: VIEWPORT_SIZE,
              height: VIEWPORT_SIZE,
              maxWidth: "100%",
              borderRadius: "20px",
              overflow: "hidden",
              bgcolor: "#0F172A",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              cursor: "grab",
              "&:active": { cursor: "grabbing" },
              touchAction: "none",
              userSelect: "none",
              position: "relative",
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                display: "block",
                width: "100%",
                height: "100%",
              }}
            />
          </Box>

          {/* Zoom Slider Control */}
          <Box sx={{ width: "100%", px: 1 }}>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center", width: "100%" }}
            >
              <Tooltip title="Thu nhỏ">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => adjustZoom(-0.1)}
                    disabled={zoom <= 1 || loading}
                    sx={{
                      color: "#64748B",
                      border: "1px solid #E2E8F0",
                      bgcolor: "#FFFFFF",
                      "&:hover": { bgcolor: "#F8FAFC" },
                    }}
                  >
                    <RemoveRounded fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Slider
                value={zoom}
                min={1}
                max={3}
                step={0.01}
                onChange={handleZoomChange}
                disabled={loading}
                sx={{
                  flex: 1,
                  color: "#8B1313",
                  "& .MuiSlider-thumb": {
                    width: 18,
                    height: 18,
                    bgcolor: "#FFFFFF",
                    border: "2.5px solid #8B1313",
                    boxShadow: "0 2px 6px rgba(139, 19, 19, 0.25)",
                    "&:hover, &.Mui-focusVisible": {
                      boxShadow: "0 0 0 8px rgba(139, 19, 19, 0.12)",
                    },
                  },
                  "& .MuiSlider-rail": {
                    bgcolor: "#CBD5E1",
                  },
                }}
              />

              <Tooltip title="Phóng to">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => adjustZoom(0.1)}
                    disabled={zoom >= 3 || loading}
                    sx={{
                      color: "#64748B",
                      border: "1px solid #E2E8F0",
                      bgcolor: "#FFFFFF",
                      "&:hover": { bgcolor: "#F8FAFC" },
                    }}
                  >
                    <AddRounded fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Chip
                label={`${Math.round(zoom * 100)}%`}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  color: "#475569",
                  minWidth: 50,
                }}
              />
            </Stack>
          </Box>

          {/* Rotate & Reset Controls + Live Mini Preview */}
          <Stack
            direction="row"
            sx={{
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
              pt: 0.5,
              borderTop: "1px solid #F1F5F9",
            }}
          >
            <Stack direction="row" spacing={1}>
              <Tooltip title="Xoay trái 90°">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleRotate(-90)}
                  disabled={loading}
                  startIcon={<RotateLeftRounded sx={{ fontSize: 18 }} />}
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "#475569",
                    borderColor: "#E2E8F0",
                    bgcolor: "#FFFFFF",
                    "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" },
                  }}
                >
                  -90°
                </Button>
              </Tooltip>

              <Tooltip title="Xoay phải 90°">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleRotate(90)}
                  disabled={loading}
                  startIcon={<RotateRightRounded sx={{ fontSize: 18 }} />}
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "#475569",
                    borderColor: "#E2E8F0",
                    bgcolor: "#FFFFFF",
                    "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" },
                  }}
                >
                  +90°
                </Button>
              </Tooltip>

              <Tooltip title="Đặt lại vị trí ban đầu">
                <IconButton
                  size="small"
                  onClick={handleReset}
                  disabled={loading}
                  sx={{
                    border: "1px solid #E2E8F0",
                    bgcolor: "#FFFFFF",
                    color: "#64748B",
                    "&:hover": { bgcolor: "#F8FAFC", color: "#0F172A" },
                  }}
                >
                  <RestartAltRounded fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>

            {/* Live Mini Round Preview */}
            <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
              <Box sx={{ textAlign: "right" }}>
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#64748B",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <VisibilityRounded sx={{ fontSize: 13, color: "#8B1313" }} />
                  Xem trước
                </Typography>
                <Typography sx={{ fontSize: "0.65rem", color: "#94A3B8" }}>
                  Hình tròn 1:1
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  border: "2px solid #8B1313",
                  boxShadow: "0 4px 10px rgba(139, 19, 19, 0.18)",
                  overflow: "hidden",
                  bgcolor: "#F8FAFC",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <canvas
                  ref={previewCanvasRef}
                  style={{ width: "100%", height: "100%" }}
                />
              </Box>
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions
        sx={{
          p: 2.5,
          pt: 1.5,
          borderTop: "1px solid #F1F5F9",
          bgcolor: "#FFFFFF",
          gap: 1.5,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.88rem",
            px: 2.5,
            py: 1,
            color: "#64748B",
            borderColor: "#E2E8F0",
            "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" },
          }}
        >
          Hủy
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading || !image}
          startIcon={
            loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <CheckRounded sx={{ fontSize: 18 }} />
            )
          }
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 800,
            fontSize: "0.88rem",
            px: 3,
            py: 1,
            bgcolor: "#8B1313",
            boxShadow: "0 4px 14px rgba(139, 19, 19, 0.25)",
            "&:hover": {
              bgcolor: "#700F0F",
              boxShadow: "0 6px 18px rgba(139, 19, 19, 0.35)",
            },
          }}
        >
          {loading ? "Đang lưu..." : "Lưu ảnh"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AvatarCropModal;
