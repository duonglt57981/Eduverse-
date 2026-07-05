declare module "@silvermine/videojs-quality-selector" {
  import type videojs from "video.js";
  const qualitySelector: (vjs: typeof videojs) => void;
  export default qualitySelector;
}
