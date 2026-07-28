import { CloudinaryUrlInfo } from "@/src/types/Cloudinary/Dto/CloudinaryDto";

export interface QualityLevel {
  index: number;
  label: string;
  bitrate: number;
  height: number;
}

export interface ErrorDetail {
  type: "backend" | "network" | "auth";
  message: string;
}

export interface ProgressData {
  daHoanThanh: boolean;
  thoiGianXem: number;
}

export const CLOUDINARY_PROFILES = [
  {
    profile: "sp_full_hd",
    label: "1080p HD",
    height: 1080,
    bitrate: 4_000_000,
  },
  { profile: "sp_hd", label: "720p HD", height: 720, bitrate: 2_000_000 },
  { profile: "sp_sd", label: "480p", height: 480, bitrate: 800_000 },
] as const;

export interface CloudinaryProfile {
  profile: string;
  label: string;
  height: number;
  bitrate: number;
}
