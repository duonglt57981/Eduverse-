// src/app/student/courses/my-courses/learning/[courseId]/utils/videoHelpers.ts

export const VIDEO_JS_STYLES = (
  PRIMARY_RED: string,
  PRIMARY_RED_DARK: string,
) => `
  /* ===== RESET OVERRIDES - Đảm bảo video.js hiển thị đúng ===== */
  .video-js,
  .video-js * {
    box-sizing: border-box !important;
  }

  .video-js {
    font-family: "Roboto", Arial, sans-serif !important;
    font-size: 14px !important;
    color: #fff !important;
    width: 100% !important;
    height: 100% !important;
    background-color: #000 !important;
  }

  .video-js .vjs-tech {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
  }

  .video-js .vjs-poster {
    background-size: cover !important;
    background-position: center !important;
  }

  /* Video bài giảng luôn là VOD - ẩn tuyệt đối mọi phần tử "LIVE"
     phòng trường hợp video.js vẫn tạo ra chúng (fallback an toàn,
     bên cạnh việc đã tắt liveui/liveDisplay/seekToLive ở JS). */
  .video-js .vjs-live-control,
  .video-js .vjs-seek-to-live-control,
  .video-js .vjs-live-display {
    display: none !important;
  }

  .video-js .vjs-control-bar {
    position: absolute !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    z-index: 2 !important;
    background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%) !important;
    height: 48px !important;
    display: flex !important;
    align-items: center !important;
    padding: 0 12px !important;
    gap: 2px !important;
    font-size: 13px !important;
    overflow: visible !important;
  }
  
  .video-js .vjs-control {
    flex: 0 0 auto !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    margin: 0 !important;
    opacity: 1 !important;
  }

  /* Ép thứ tự cố định cho TỪNG nút, không phụ thuộc DOM mặc định của
     video.js — đây là nguyên nhân chính gây ra layout dạt lung tung
     như ảnh lỗi (nhóm trái/phải không đúng chỗ, khoảng trống thất
     thường). Nhóm trái: Play, Volume, Time. Spacer co giãn ở giữa.
     Nhóm phải: tốc độ phát, CC, fullscreen. */
  .video-js .vjs-control-bar .vjs-play-control { order: 1 !important; }
  .video-js .vjs-control-bar .vjs-volume-panel { order: 2 !important; }
  .video-js .vjs-control-bar .vjs-current-time { order: 3 !important; }
  .video-js .vjs-control-bar .vjs-time-divider { order: 4 !important; }
  .video-js .vjs-control-bar .vjs-duration { order: 5 !important; }
  .video-js .vjs-control-bar .vjs-remaining-time { order: 5 !important; }
  .video-js .vjs-control-bar .vjs-spacer,
  .video-js .vjs-control-bar .vjs-custom-control-spacer {
    order: 6 !important;
    flex: 1 1 auto !important;
    height: 100% !important;
  }
  .video-js .vjs-control-bar .vjs-playback-rate { order: 7 !important; }
  .video-js .vjs-control-bar .vjs-captions-button { order: 8 !important; }
  .video-js .vjs-control-bar .vjs-subs-caps-button { order: 8 !important; }
  .video-js .vjs-control-bar .vjs-fullscreen-control { order: 9 !important; }
  
  .video-js .vjs-button {
    width: 40px !important;
    height: 100% !important;
    cursor: pointer !important;
  }
  
  .video-js .vjs-button > .vjs-icon-placeholder:before {
    display: block !important;
    font-size: 20px !important;
    line-height: 1 !important;
  }
  
  /* ===== BIG PLAY BUTTON ===== */
  .video-js .vjs-big-play-button {
    background-color: rgba(0,0,0,0.65) !important;
    border: none !important;
    border-radius: 12px !important;
    width: 72px !important;
    height: 52px !important;
    line-height: 52px !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    margin: 0 !important;
    transition: background-color 0.2s, transform 0.2s !important;
  }
  
  .video-js .vjs-big-play-button:hover {
    background-color: ${PRIMARY_RED} !important;
    transform: translate(-50%, -50%) scale(1.05) !important;
  }
  
  .video-js .vjs-big-play-button .vjs-icon-placeholder:before {
    font-size: 28px !important;
    color: #fff !important;
  }
  
  /* ===== PROGRESS BAR ===== */
  /* .vjs-control-bar có padding 0 12px, nên nếu progress-control chỉ
     left:0/right:0 nó sẽ neo theo mép PADDING (hụt vào trong 12px mỗi
     bên) chứ không phải mép thật của video => lệch so với các nút bên
     dưới. Bù trừ đúng bằng giá trị padding để nó luôn full-bleed. */
  .video-js .vjs-progress-control {
    position: absolute !important;
    top: -6px !important;
    left: -12px !important;
    right: -12px !important;
    width: calc(100% + 24px) !important;
    height: 6px !important;
    display: flex !important;
    align-items: center !important;
    cursor: pointer !important;
  }
  
  .video-js .vjs-progress-control .vjs-progress-holder {
    margin: 0 12px !important;
    height: 4px !important;
    border-radius: 2px !important;
    background-color: rgba(255,255,255,0.25) !important;
    transition: height 0.15s !important;
  }
  
  .video-js .vjs-progress-control:hover .vjs-progress-holder {
    height: 6px !important;
  }
  
  .video-js .vjs-play-progress {
    background-color: ${PRIMARY_RED} !important;
    border-radius: 2px !important;
    max-width: 100% !important;
  }
  
  .video-js .vjs-play-progress:before {
    content: "" !important;
    position: absolute !important;
    top: 50% !important;
    right: -6px !important;
    width: 14px !important;
    height: 14px !important;
    background-color: ${PRIMARY_RED} !important;
    border-radius: 50% !important;
    transform: translateY(-50%) scale(0) !important;
    transition: transform 0.15s ease !important;
  }
  
  .video-js .vjs-progress-control:hover .vjs-play-progress:before {
    transform: translateY(-50%) scale(1) !important;
  }
  
  .video-js .vjs-load-progress {
    background-color: rgba(255,255,255,0.3) !important;
    border-radius: 2px !important;
  }
  
  .video-js .vjs-load-progress div {
    background: transparent !important;
  }
  
  /* ===== VOLUME ===== */
  .video-js .vjs-volume-panel {
    display: flex !important;
    align-items: center !important;
  }
  
  .video-js .vjs-volume-control {
    display: flex !important;
    align-items: center !important;
  }
  
  .video-js .vjs-volume-bar {
    width: 80px !important;
    height: 4px !important;
    border-radius: 2px !important;
    background-color: rgba(255,255,255,0.25) !important;
    margin: 0 8px !important;
  }
  
  .video-js .vjs-volume-level {
    background-color: #fff !important;
    border-radius: 2px !important;
  }
  
  .video-js .vjs-volume-level:before {
    content: "" !important;
    position: absolute !important;
    top: 50% !important;
    right: -5px !important;
    width: 12px !important;
    height: 12px !important;
    background-color: #fff !important;
    border-radius: 50% !important;
    transform: translateY(-50%) !important;
  }
  
  /* ===== TIME DISPLAY ===== */
  .video-js .vjs-time-control {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    padding: 0 !important;
    margin: 0 !important;
    height: 100% !important;
    line-height: 1 !important;
    font-variant-numeric: tabular-nums !important;
  }
  
  .video-js .vjs-time-divider {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    margin: 0 2px !important;
    height: 100% !important;
    line-height: 1 !important;
  }
  
  .video-js .vjs-remaining-time {
    display: none !important;
  }
  
  .video-js .vjs-current-time {
    display: flex !important;
  }
  
  .video-js .vjs-duration {
    display: flex !important;
  }
  
  /* ===== PLAYBACK RATES ===== */
  .video-js .vjs-playback-rate {
    display: flex !important;
  }
  
  .video-js .vjs-playback-rate .vjs-playback-rate-value {
    font-size: 13px !important;
    font-weight: 600 !important;
    line-height: 1 !important;
  }
  
  /* ===== MENU ===== */
  /* Trước đây "left: 0" khiến menu luôn bật ra lệch về mép trái của
     control bar thay vì nằm ngay phía trên nút bấm gây ra nó => nhìn
     như bị "lệch nhau". Căn giữa menu theo đúng nút trigger. */
  .video-js .vjs-menu-button-popup .vjs-menu {
    position: absolute !important;
    bottom: 2.5em !important;
    left: 50% !important;
    right: auto !important;
    transform: translateX(-50%) !important;
  }
  
  .video-js .vjs-menu-content {
    background-color: rgba(28,28,28,0.95) !important;
    border-radius: 8px !important;
    padding: 6px 0 !important;
    box-shadow: 0 4px 16px rgba(0,0,0,0.5) !important;
    white-space: nowrap !important;
  }
  
  .video-js .vjs-menu-item {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 8px 16px !important;
    font-size: 13px !important;
    cursor: pointer !important;
  }
  
  .video-js .vjs-menu-item.vjs-selected {
    background-color: rgba(255,255,255,0.15) !important;
    color: #fff !important;
  }
  
  .video-js .vjs-menu-item:hover {
    background-color: rgba(255,255,255,0.1) !important;
  }
  
  /* ===== OTHER ===== */
  .video-js .vjs-slider {
    border-radius: 2px !important;
  }
  
  .video-js .vjs-loading-spinner {
    display: none !important;
  }
  
  .video-js.vjs-waiting .vjs-loading-spinner {
    display: none !important;
  }
  
  .video-js.vjs-seeking .vjs-loading-spinner {
    display: none !important;
  }
  
  /* ===== FULLSCREEN ===== */
  .video-js .vjs-fullscreen-control {
    cursor: pointer !important;
  }
  
  /* ===== PICTURE IN PICTURE ===== */
  .video-js .vjs-picture-in-picture-control {
    display: none !important;
  }
  
  /* ===== TOOLTIP ===== */
  .video-js .vjs-mouse-display .vjs-time-tooltip {
    background: rgba(0,0,0,0.85) !important;
    border-radius: 4px !important;
    font-size: 12px !important;
    padding: 4px 8px !important;
    bottom: 20px !important;
  }
`;
