import 'video.js';

declare module 'video.js' {
  interface Player {
    qualityLevels?: () => {
      length: number;
      [index: number]: {
        bitrate: number;
        height: number;
        enabled: boolean;
      };
    };
    qualitySelector?: {
      update: () => void;
    };
  }
}

// BẮT BUỘC: biến file thành module để declaration được áp dụng
export {};