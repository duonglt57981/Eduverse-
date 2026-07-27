"use client";

import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { VideoPlayer } from "./VideoPlayer";

interface LessonVideoSectionProps {
  url: string;
  savedTime?: number;
  isCompleted?: boolean;    
  onTimeUpdate: (t: number) => void;
  onEnded: () => void;
  playerId?: string;
  autoPlay?: boolean;
  /** Tắt hẳn tính năng tự thu nhỏ khi cuộn, nếu trang của bạn không cần. */
  enableMiniOnScroll?: boolean;
}

export const LessonVideoSection = ({
  url,
  savedTime,
  isCompleted,
  onTimeUpdate,
  onEnded,
  playerId = "main",
  autoPlay = true,
  enableMiniOnScroll = true,
}: LessonVideoSectionProps) => {
  // Vùng "neo" đặt đúng vị trí video trong luồng nội dung bài học.
  // Khi vùng này cuộn ra khỏi khung nhìn, player sẽ tự chuyển sang
  // chế độ mini (nổi góc màn hình); cuộn trở lại thì tự trở về bình
  // thường. Người dùng cũng có thể tự bấm nút mở rộng ở mini để quay
  // lại ngay lập tức và cuộn trang về đúng vị trí video.
  const anchorRef = useRef<HTMLDivElement>(null);
  const [isAnchorVisible, setIsAnchorVisible] = useState(true);
  const [manuallyExpanded, setManuallyExpanded] = useState(false);

  useEffect(() => {
    if (!enableMiniOnScroll) return;
    const el = anchorRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAnchorVisible(entry.isIntersecting);
        // Mỗi lần vùng neo hiện lại trong khung nhìn (người dùng tự
        // cuộn lên), coi như đã "mở rộng" xong, reset cờ thủ công.
        if (entry.isIntersecting) setManuallyExpanded(false);
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enableMiniOnScroll]);

  const isMini = enableMiniOnScroll && !isAnchorVisible && !manuallyExpanded;

  const handleExpandClick = () => {
    // Bấm nút mở rộng ở mini: cuộn trang về đúng vị trí video gốc.
    // Đặt cờ manuallyExpanded=true ngay để player chuyển về chế độ
    // full tức thì, không phải đợi scroll animation chạy xong rồi
    // IntersectionObserver mới báo lại.
    setManuallyExpanded(true);
    anchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box ref={anchorRef} sx={{ width: "100%" }}>
      <VideoPlayer
        url={url}
        savedTime={savedTime}
        isCompleted={isCompleted}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        playerId={playerId}
        autoPlay={autoPlay}
        mini={isMini}
        onExpandClick={handleExpandClick}
      />
      {/* Khi mini đang nổi cố định (position: fixed), vùng neo này vẫn
          giữ đúng chỗ trong layout để không bị "nhảy" nội dung bên
          dưới lên lấp chỗ trống. */}
      {isMini && <Box sx={{ width: "100%", aspectRatio: "16 / 9" }} />}
    </Box>
  );
};
