export const VIDEO_JS_STYLES = (
  PRIMARY_RED: string,
  PRIMARY_RED_DARK: string,
) => `
  /* Big play button - keep center red on hover like YouTube */
  .video-js .vjs-big-play-button {
    background-color: rgba(0,0,0,0.6) !important;
    border: none !important;
    border-radius: 12px !important;
    width: 68px !important;
    height: 48px !important;
    line-height: 48px !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    margin: 0 !important;
    transition: background-color 0.2s !important;
  }
  .video-js:hover .vjs-big-play-button {
    background-color: ${PRIMARY_RED} !important;
  }
  
  /* Control bar gradient */
  .video-js .vjs-control-bar {
    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 60%, transparent 100%) !important;
    height: 48px !important;
    padding: 0 12px !important;
    display: flex !important;
    align-items: center !important;
  }

  /* Progress bar container spans full width at the top of the control bar */
  .video-js .vjs-progress-control {
    position: absolute !important;
    top: -5px !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    height: 5px !important;
    display: flex !important;
    align-items: center !important;
    cursor: pointer !important;
    transition: transform 0.1s, top 0.1s, height 0.1s !important;
  }
  
  /* Make hit area larger */
  .video-js .vjs-progress-control .vjs-progress-holder {
    margin: 0 12px !important;
    height: 3px !important;
    transition: height 0.1s !important;
    border-radius: 0 !important;
    background-color: rgba(255,255,255,0.2) !important;
  }
  
  /* Hover state for progress bar */
  .video-js .vjs-progress-control:hover .vjs-progress-holder {
    height: 5px !important;
  }

  /* Colors for progress */
  .video-js .vjs-play-progress {
    background-color: ${PRIMARY_RED} !important;
  }
  .video-js .vjs-load-progress {
    background-color: rgba(255,255,255,0.4) !important;
  }
  .video-js .vjs-load-progress div {
    background: transparent !important;
  }

  /* The little red dot (handle) */
  .video-js .vjs-play-progress:before {
    content: "" !important;
    position: absolute !important;
    top: 50% !important;
    right: -6.5px !important;
    width: 13px !important;
    height: 13px !important;
    background-color: ${PRIMARY_RED} !important;
    border-radius: 50% !important;
    transform: translateY(-50%) scale(0) !important;
    transition: transform 0.1s cubic-bezier(0.4,0.0,1,1) !important;
  }
  
  /* Show dot on hover or scrub */
  .video-js .vjs-progress-control:hover .vjs-play-progress:before {
    transform: translateY(-50%) scale(1) !important;
  }

  /* Slider general */
  .video-js .vjs-slider {
    border-radius: 0 !important;
  }

  /* Volume slider */
  .video-js .vjs-volume-panel {
    display: flex !important;
    align-items: center !important;
    margin-right: 8px !important;
    transition: width 0.2s !important;
  }
  .video-js .vjs-volume-level {
    background-color: #fff !important;
  }
  .video-js .vjs-volume-level:before {
    content: "" !important;
    position: absolute !important;
    top: 50% !important;
    right: -6px !important;
    width: 12px !important;
    height: 12px !important;
    background-color: #fff !important;
    border-radius: 50% !important;
    transform: translateY(-50%) !important;
  }

  /* Time text formatting */
  .video-js .vjs-time-control {
    display: flex !important;
    align-items: center !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    font-family: "Roboto", Arial, sans-serif !important;
    padding: 0 4px !important;
    height: 48px !important;
    line-height: normal !important;
  }
  .video-js .vjs-time-divider {
    display: flex !important;
    align-items: center !important;
    padding: 0 2px !important;
    height: 48px !important;
    line-height: normal !important;
  }
  /* Hide remaining time to avoid duplication with duration */
  .video-js .vjs-remaining-time {
    display: none !important;
  }

  /* Button alignment */
  .video-js .vjs-button, .video-js .vjs-control {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    height: 48px !important;
  }
  .video-js .vjs-button {
    width: 44px !important;
  }
  
  /* Icon centering override */
  .video-js .vjs-icon-placeholder:before {
    position: static !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  
  /* Tooltips */
  .video-js .vjs-mouse-display .vjs-time-tooltip,
  .video-js .vjs-play-progress .vjs-time-tooltip {
    background: rgba(28,28,28,0.9) !important;
    border-radius: 2px !important;
    font-size: 13px !important;
    font-family: "Roboto", Arial, sans-serif !important;
    padding: 5px 9px !important;
    bottom: 15px !important;
  }

  /* Menus */
  .video-js .vjs-menu-item.vjs-selected,
  .video-js .vjs-menu-item.vjs-selected:focus,
  .video-js .vjs-menu-item.vjs-selected:hover {
    background-color: rgba(255,255,255,0.1) !important;
    color: #fff !important;
  }
  .video-js .vjs-menu-item:hover {
    background-color: rgba(255,255,255,0.1) !important;
  }
  .video-js .vjs-menu-button-popup .vjs-menu {
    bottom: 2em !important;
  }
  .video-js .vjs-menu-content {
    background-color: rgba(28,28,28,0.9) !important;
    border-radius: 8px !important;
    padding: 8px 0 !important;
  }

  .video-js {
    width: 100% !important;
    font-family: "Roboto", Arial, sans-serif !important;
  }
  .video-js .vjs-loading-spinner { display: none !important; }
  .video-js.vjs-waiting .vjs-loading-spinner { display: none !important; }
  .video-js.vjs-seeking .vjs-loading-spinner { display: none !important; }
`;
