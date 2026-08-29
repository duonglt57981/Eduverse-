// src/app/student/courses/my-courses/learning/[courseId]/utils/videoHelpers.ts

export const VIDEO_JS_STYLES = (
  PRIMARY_RED: string,
  PRIMARY_RED_DARK: string,
) => `
  /* ===== RESET OVERRIDES ===== */
  .video-js,
  .video-js * {
    box-sizing: border-box !important;
  }

  .video-js {
    font-family: inherit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
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

  /* Ẩn tuyệt đối các thành phần thừa gây rác giao diện */
  .video-js .vjs-live-control,
  .video-js .vjs-seek-to-live-control,
  .video-js .vjs-live-display,
  .video-js .vjs-chapters-button,
  .video-js .vjs-descriptions-button,
  .video-js .vjs-audio-button,
  .video-js .vjs-subs-caps-button,
  .video-js .vjs-subtitles-button,
  .video-js .vjs-captions-button,
  .video-js .vjs-picture-in-picture-control,
  .video-js .vjs-remaining-time,
  .video-js .vjs-remaining-time-display,
  .video-js .vjs-time-control.vjs-remaining-time,
  .video-js .vjs-time-control:not(.vjs-current-time):not(.vjs-time-divider):not(.vjs-duration),
  .video-js .vjs-spacer,
  .video-js .vjs-custom-control-spacer,
  .video-js .vjs-modal-dialog,
  .video-js .vjs-text-track-settings {
    display: none !important;
  }

  /* ===== CONTROL BAR ===== */
  .video-js .vjs-control-bar {
    position: absolute !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    z-index: 2 !important;
    background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 60%, transparent 100%) !important;
    height: 64px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    padding: 16px 12px 10px 12px !important;
    gap: 0 !important;
    font-size: 13px !important;
    overflow: visible !important;
  }

  .video-js .vjs-control-bar > * {
    order: 10 !important;
  }

  .video-js .vjs-control {
    flex: 0 0 auto !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    margin: 0 !important;
    opacity: 1 !important;
  }

  /* ===== PROGRESS BAR (Stretched on top with prominent red head dot) ===== */
  .video-js .vjs-progress-control {
    position: absolute !important;
    top: 6px !important;
    left: 12px !important;
    right: 12px !important;
    width: calc(100% - 24px) !important;
    height: 12px !important;
    display: flex !important;
    align-items: center !important;
    cursor: pointer !important;
    z-index: 3 !important;
  }
  .video-js .vjs-progress-control .vjs-progress-holder {
    margin: 0 !important;
    height: 4px !important;
    border-radius: 2px !important;
    background-color: rgba(255,255,255,0.25) !important;
    transition: height 0.15s ease !important;
    width: 100% !important;
  }
  .video-js .vjs-progress-control:hover .vjs-progress-holder {
    height: 6px !important;
  }
  .video-js .vjs-play-progress {
    background-color: #FF0000 !important;
    border-radius: 2px !important;
  }
  .video-js .vjs-play-progress:before {
    content: "" !important;
    position: absolute !important;
    top: 50% !important;
    right: -6px !important;
    width: 14px !important;
    height: 14px !important;
    background-color: #FF0000 !important;
    border: 2px solid #FFFFFF !important;
    border-radius: 50% !important;
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.9) !important;
    transform: translateY(-50%) !important;
    display: block !important;
    transition: transform 0.15s ease !important;
  }
  .video-js .vjs-progress-control:hover .vjs-play-progress:before {
    transform: translateY(-50%) scale(1.15) !important;
  }
  .video-js .vjs-load-progress {
    background-color: rgba(255,255,255,0.35) !important;
    border-radius: 2px !important;
  }
  .video-js .vjs-load-progress div {
    background: transparent !important;
  }

  /* ===== BUTTONS & PILLS ===== */
  /* [LEFT GROUP] 1. Play/Pause circular glass pill */
  .video-js .vjs-control-bar .vjs-play-control {
    order: 1 !important;
    width: 36px !important;
    height: 36px !important;
    border-radius: 50% !important;
    background: rgba(255, 255, 255, 0.12) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(255, 255, 255, 0.18) !important;
    cursor: pointer !important;
    margin: 0 8px 0 0 !important;
    transition: all 0.2s ease !important;
  }
  .video-js .vjs-control-bar .vjs-play-control:hover {
    background: rgba(255, 255, 255, 0.24) !important;
    transform: scale(1.05) !important;
  }

  /* [LEFT GROUP] 2. Volume circular glass pill with smooth slider expand */
  .video-js .vjs-control-bar .vjs-volume-panel {
    order: 2 !important;
    width: 36px !important;
    height: 36px !important;
    border-radius: 18px !important;
    background: rgba(255, 255, 255, 0.12) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(255, 255, 255, 0.18) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s ease !important;
    overflow: hidden !important;
    padding: 0 !important;
    margin: 0 8px 0 0 !important;
    cursor: pointer !important;
    z-index: 5 !important;
  }
  .video-js .vjs-control-bar .vjs-volume-panel:hover,
  .video-js .vjs-control-bar .vjs-volume-panel:focus-within,
  .video-js .vjs-control-bar .vjs-volume-panel.vjs-slider-active,
  .video-js .vjs-control-bar .vjs-volume-panel.vjs-volume-panel-horizontal:hover,
  .video-js .vjs-control-bar .vjs-volume-panel.vjs-volume-panel-horizontal.vjs-slider-active,
  .video-js .vjs-control-bar .vjs-volume-panel.vjs-volume-panel-horizontal.vjs-hover {
    width: 120px !important;
    background: rgba(255, 255, 255, 0.18) !important;
  }
  .video-js .vjs-mute-control {
    width: 36px !important;
    height: 36px !important;
    flex: 0 0 36px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: transparent !important;
    border: none !important;
    cursor: pointer !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .video-js .vjs-volume-control {
    flex: 1 1 auto !important;
    display: flex !important;
    align-items: center !important;
    margin: 0 !important;
    padding: 0 10px 0 0 !important;
    height: 100% !important;
    opacity: 0 !important;
    width: 0 !important;
    transition: opacity 0.2s ease, width 0.2s ease !important;
    pointer-events: none !important;
  }
  .video-js .vjs-volume-panel:hover .vjs-volume-control,
  .video-js .vjs-volume-panel:focus-within .vjs-volume-control,
  .video-js .vjs-volume-panel.vjs-slider-active .vjs-volume-control,
  .video-js .vjs-volume-panel.vjs-volume-panel-horizontal.vjs-slider-active .vjs-volume-control,
  .video-js .vjs-volume-panel.vjs-hover .vjs-volume-control {
    opacity: 1 !important;
    width: 74px !important;
    pointer-events: auto !important;
  }
  .video-js .vjs-volume-bar {
    width: 100% !important;
    height: 4px !important;
    border-radius: 2px !important;
    background-color: rgba(255, 255, 255, 0.3) !important;
    margin: 0 !important;
    cursor: pointer !important;
    position: relative !important;
    transition: height 0.15s ease !important;
  }
  .video-js .vjs-volume-panel:hover .vjs-volume-bar,
  .video-js .vjs-volume-panel.vjs-slider-active .vjs-volume-bar {
    height: 5px !important;
  }
  .video-js .vjs-volume-level {
    background-color: #FFFFFF !important;
    height: 100% !important;
    border-radius: 2px !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
  }
  .video-js .vjs-volume-level:before {
    content: "" !important;
    position: absolute !important;
    top: 50% !important;
    right: -5px !important;
    width: 10px !important;
    height: 10px !important;
    background-color: #FFFFFF !important;
    border-radius: 50% !important;
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.9) !important;
    transform: translateY(-50%) !important;
    display: block !important;
  }

  /* [LEFT GROUP] 3. Time display: Single unified seamless glass capsule pill (0 gaps, 0 internal seams) */
  .video-js .vjs-control-bar .vjs-current-time {
    order: 3 !important;
    height: 36px !important;
    border-top-left-radius: 18px !important;
    border-bottom-left-radius: 18px !important;
    background: rgba(255, 255, 255, 0.12) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(255, 255, 255, 0.18) !important;
    border-right: none !important;
    padding: 0 2px 0 12px !important;
    margin: 0 !important;
    display: flex !important;
    align-items: center !important;
    font-size: 12.5px !important;
    font-weight: 700 !important;
    font-variant-numeric: tabular-nums !important;
    letter-spacing: 0.02em !important;
    color: #FFFFFF !important;
  }
  .video-js .vjs-current-time-display {
    background: transparent !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .video-js .vjs-control-bar .vjs-time-divider {
    order: 4 !important;
    height: 36px !important;
    background: rgba(255, 255, 255, 0.12) !important;
    backdrop-filter: blur(8px) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.18) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.18) !important;
    border-left: none !important;
    border-right: none !important;
    padding: 0 4px !important;
    margin: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    min-width: unset !important;
    color: rgba(255, 255, 255, 0.6) !important;
    font-size: 12.5px !important;
  }
  .video-js .vjs-control-bar .vjs-duration {
    order: 5 !important;
    height: 36px !important;
    border-top-right-radius: 18px !important;
    border-bottom-right-radius: 18px !important;
    background: rgba(255, 255, 255, 0.12) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(255, 255, 255, 0.18) !important;
    border-left: none !important;
    padding: 0 12px 0 2px !important;
    margin: 0 !important;
    display: flex !important;
    align-items: center !important;
    font-size: 12.5px !important;
    font-weight: 700 !important;
    font-variant-numeric: tabular-nums !important;
    letter-spacing: 0.02em !important;
    color: #FFFFFF !important;
  }
  .video-js .vjs-duration-display {
    background: transparent !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* [RIGHT GROUP] 4. Playback rate: order 100 + margin-left: auto pushes entire right group to the absolute far right */
  .video-js .vjs-control-bar .vjs-playback-rate {
    order: 100 !important;
    margin-left: auto !important;
    margin-right: 8px !important;
    width: 36px !important;
    height: 36px !important;
    border-radius: 50% !important;
    background: rgba(255, 255, 255, 0.12) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(255, 255, 255, 0.18) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
  }
  .video-js .vjs-control-bar .vjs-playback-rate:hover {
    background: rgba(255, 255, 255, 0.24) !important;
    transform: scale(1.05) !important;
  }
  .video-js .vjs-playback-rate .vjs-playback-rate-value {
    font-size: 12px !important;
    font-weight: 700 !important;
    line-height: 36px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  /* [RIGHT GROUP] 5. Fullscreen control: order 101 (sits directly at the right border) */
  .video-js .vjs-control-bar .vjs-fullscreen-control {
    order: 101 !important;
    width: 36px !important;
    height: 36px !important;
    border-radius: 50% !important;
    background: rgba(255, 255, 255, 0.12) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(255, 255, 255, 0.18) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
    margin: 0 !important;
  }
  .video-js .vjs-control-bar .vjs-fullscreen-control:hover {
    background: rgba(255, 255, 255, 0.24) !important;
    transform: scale(1.05) !important;
  }

  .video-js .vjs-button > .vjs-icon-placeholder:before {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 18px !important;
    line-height: 1 !important;
    height: 100% !important;
    width: 100% !important;
  }

  /* Big play button */
  .video-js .vjs-big-play-button {
    background-color: rgba(15, 23, 42, 0.75) !important;
    backdrop-filter: blur(10px) !important;
    border: 2px solid rgba(255, 255, 255, 0.25) !important;
    border-radius: 50% !important;
    width: 68px !important;
    height: 68px !important;
    line-height: 64px !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    margin: 0 !important;
    padding: 0 !important;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
    font-size: 2.6em !important;
    color: #fff !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
  }
  .video-js:hover .vjs-big-play-button {
    background-color: ${PRIMARY_RED} !important;
    border-color: ${PRIMARY_RED} !important;
    transform: translate(-50%, -50%) scale(1.08) !important;
    box-shadow: 0 12px 36px rgba(139, 19, 19, 0.6) !important;
  }
  .video-js.vjs-playing .vjs-big-play-button {
    display: none !important;
  }

  /* Menu popup */
  .video-js .vjs-menu-button-popup .vjs-menu {
    position: absolute !important;
    bottom: 3.2em !important;
    left: 50% !important;
    right: auto !important;
    transform: translateX(-50%) !important;
  }
  .video-js .vjs-menu-content {
    background-color: rgba(15, 23, 42, 0.95) !important;
    backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(255,255,255,0.15) !important;
    border-radius: 12px !important;
    padding: 6px 0 !important;
    box-shadow: 0 12px 32px rgba(0,0,0,0.6) !important;
  }
  .video-js .vjs-menu-item {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 8px 18px !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    cursor: pointer !important;
  }
  .video-js .vjs-menu-item.vjs-selected {
    background-color: rgba(255,255,255,0.18) !important;
    color: #fff !important;
    font-weight: 700 !important;
  }
  .video-js .vjs-menu-item:hover {
    background-color: rgba(255,255,255,0.12) !important;
  }

  .video-js .vjs-slider {
    border-radius: 2px !important;
  }
  .video-js .vjs-loading-spinner,
  .video-js.vjs-waiting .vjs-loading-spinner,
  .video-js.vjs-seeking .vjs-loading-spinner {
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
