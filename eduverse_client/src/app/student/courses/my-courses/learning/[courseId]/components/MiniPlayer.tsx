// src/app/khoa-hoc/components/MiniPlayer.tsx

"use client";

import { VideoPlayer } from "./VideoPlayer";

interface MiniPlayerProps {
  url: string;
  savedTime?: number;
  isCompleted?: boolean;
  onTimeUpdate: (t: number) => void;
  onEnded: () => void;
  onExpand: () => void;
  onClose: () => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  playerId?: string;
  autoPlay?: boolean;
  onUnmount?: (time: number) => void;
}

/**
 * MiniPlayer - Wrapper của VideoPlayer với mini=true
 *
 * QUAN TRỌNG: Component này chỉ là wrapper, KHÔNG tạo instance video.js mới.
 * Nó sử dụng chính VideoPlayer với prop mini=true để hiển thị ở chế độ mini.
 *
 * Đảm bảo chỉ có DUY NHẤT một VideoPlayer được mount tại một thời điểm.
 * Khi mini xuất hiện, VideoPlayer full sẽ bị unmount và MiniPlayer sẽ mount.
 * Khi mở rộng, MiniPlayer unmount và VideoPlayer full mount lại với thời gian
 * được đồng bộ qua savedTime.
 */
export const MiniPlayer = ({
  url,
  savedTime,
  isCompleted,
  onTimeUpdate,
  onEnded,
  onExpand,
  onClose,
  onPlayStateChange,
  playerId = "mini",
  autoPlay = true,
  onUnmount,
}: MiniPlayerProps) => {
  return (
    <VideoPlayer
      url={url}
      savedTime={savedTime}
      isCompleted={isCompleted}
      onTimeUpdate={onTimeUpdate}
      onEnded={onEnded}
      playerId={playerId}
      autoPlay={autoPlay}
      mini={true}
      onExpandClick={onExpand}
      onCloseClick={onClose}
      onPlayStateChange={onPlayStateChange}
      onUnmount={onUnmount}
    />
  );
};
