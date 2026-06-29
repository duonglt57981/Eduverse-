export const VIDEO_JS_STYLES = (
  PRIMARY_RED: string,
  PRIMARY_RED_DARK: string,
) => `
  .video-js .vjs-big-play-button {
    background-color: ${PRIMARY_RED} !important;
    border-color: ${PRIMARY_RED} !important;
    border-radius: 50% !important;
    width: 64px !important;
    height: 64px !important;
    line-height: 64px !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    margin: 0 !important;
  }
  .video-js .vjs-big-play-button:hover {
    background-color: ${PRIMARY_RED_DARK} !important;
  }
  .video-js .vjs-control-bar {
    background: linear-gradient(transparent, rgba(0,0,0,0.85)) !important;
    height: 48px !important;
    padding: 0 8px !important;
    display: flex !important;
    align-items: center !important;
  }
  .video-js .vjs-progress-control {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    display: flex !important;
    align-items: center !important;
    height: 100% !important;
    pointer-events: auto !important;
    cursor: pointer !important;
  }
  .video-js .vjs-progress-holder {
    flex: auto !important;
    height: 5px !important;
    border-radius: 3px !important;
    transition: height 0.15s ease !important;
    cursor: pointer !important;
  }
  .video-js .vjs-progress-control:hover .vjs-progress-holder {
    height: 9px !important;
  }
  .video-js .vjs-play-progress,
  .video-js .vjs-play-progress:before {
    background-color: ${PRIMARY_RED} !important;
  }
  .video-js .vjs-play-progress:before {
    top: -0.28em !important;
    font-size: 0.95em !important;
  }
  .video-js .vjs-load-progress {
    background-color: rgba(255,255,255,0.25) !important;
    border-radius: 3px !important;
  }
  .video-js .vjs-load-progress div {
    background-color: rgba(255,255,255,0.15) !important;
  }
  .video-js .vjs-slider {
    background-color: rgba(255,255,255,0.2) !important;
    border-radius: 3px !important;
  }
  .video-js .vjs-volume-level {
    background-color: ${PRIMARY_RED} !important;
  }
  .video-js .vjs-mouse-display .vjs-time-tooltip,
  .video-js .vjs-play-progress .vjs-time-tooltip {
    background: rgba(0,0,0,0.82) !important;
    border-radius: 4px !important;
    font-size: 11px !important;
    padding: 2px 6px !important;
  }
  .video-js .vjs-menu-item.vjs-selected,
  .video-js .vjs-menu-item.vjs-selected:focus,
  .video-js .vjs-menu-item.vjs-selected:hover {
    background-color: ${PRIMARY_RED} !important;
    color: #fff !important;
  }
  .video-js .vjs-menu-item:hover {
    background-color: rgba(139,26,26,0.3) !important;
  }
  .video-js .vjs-menu-button-popup .vjs-menu {
    bottom: 2.5em !important;
  }
  .video-js {
    width: 100% !important;
    font-family: inherit !important;
  }
  .video-js .vjs-loading-spinner { display: none !important; }
  .video-js.vjs-waiting .vjs-loading-spinner { display: none !important; }
  .video-js.vjs-seeking .vjs-loading-spinner { display: none !important; }
`;
