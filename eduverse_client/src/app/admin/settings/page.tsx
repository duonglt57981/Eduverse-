"use client";

import React, { useState, useEffect, useRef } from "react";
import AuthGuard from "@/src/components/AuthGuard";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import {
  FormControl,
  InputLabel,
  Box,
  Typography,
  Grid,
  Stack,
  Tab,
  Tabs,
  Paper,
  Divider,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Avatar,
  InputAdornment,
  Alert,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import {
  AdminPanelSettingsRounded,
  SecurityRounded,
  SettingsApplicationsRounded,
  SaveRounded,
  EmailRounded,
  PhoneRounded,
  PhotoCameraRounded,
  VisibilityRounded,
  VisibilityOffRounded,
  WarningRounded,
  CheckCircleOutlineRounded,
  PhoneIphoneRounded,
  LaptopMacRounded,
  ErrorOutlineRounded,
  PersonRounded,
} from "@mui/icons-material";
import { useSelector } from "@/src/store/hook";
import { apiService } from "@/src/services/index";
import Swal from "sweetalert2";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AccountSettings from "@/src/components/settings/AccountSettings";

export default function AdminSettingsPage() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user info from Redux store as baseline
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reduxUser = useSelector((state: any) => state.auth.user);
  const isPersonnel =
    pathname.startsWith("/personnel") ||
    reduxUser?.roles?.some((r: string) => r.toLowerCase() === "personnel" || r.toLowerCase() === "nhanvien");

  // --- Real-time loading & profile states ---
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [profile, setProfile] = useState({
    hoTen: "",
    email: "",
    phone: "",
    diaChi: "",
    tieuSu: "",
    ngaySinh: "",
    avatarUrl: "",
    roles: "Super Admin",
    twoFactorEnabled: false,
  });

  // Original profile copy for unsaved check
  const [originalProfile, setOriginalProfile] = useState({ ...profile });

  // Fetch /api/profile
  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiService.get<any>("/profile");
      if (response.status && response.data) {
        const d = response.data;
        const mapped = {
          hoTen: d.hoTen || reduxUser?.hoTen || "Quản trị viên",
          email: d.email || reduxUser?.email || "admin@eduverse.id.vn",
          phone: d.phoneNumber || reduxUser?.soDienThoai || "",
          diaChi: d.diaChi || "",
          tieuSu: d.tieuSu || "",
          ngaySinh: d.ngaySinh || "",
          avatarUrl: d.anhDaiDien || "",
          roles: reduxUser?.roles?.[0] || "Super Admin",
          twoFactorEnabled: d.twoFactorEnabled || false,
        };
        setProfile(mapped);
        setOriginalProfile(mapped);
      }
    } catch (err) {
      console.error("Lỗi khi tải thông tin admin:", err);
      // Fallback to redux
      const fallback = {
        hoTen: reduxUser?.hoTen || "Quản trị viên",
        email: reduxUser?.email || "admin@eduverse.id.vn",
        phone: reduxUser?.soDienThoai || "",
        diaChi: "",
        tieuSu: "",
        ngaySinh: "",
        avatarUrl: "",
        roles: reduxUser?.roles?.[0] || "Super Admin",
        twoFactorEnabled: false,
      };
      setProfile(fallback);
      setOriginalProfile(fallback);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    // Defer to a microtask so the profile fetch's state updates don't run
    // synchronously within the effect body.
    Promise.resolve().then(() => fetchProfile());
  }, [reduxUser]);

  // --- 2FA States & variables ---
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // --- System operations (Cached in localStorage) ---
  const defaultSystem = {
    siteName: "EduVerse LMS",
    contactEmail: "contact@eduverse.id.vn",
    supportPhone: "19001234",
    timezone: "Asia/Ho_Chi_Minh",
    currency: "VND",
    maintenanceMode: false,
    allowRegistration: true,
    maxUploadSize: 50,
    commissionRate: 15, // 15% commission default
    minWithdrawal: 100000, // 100k min
    maxWithdrawal: 50000000, // 50m max
    requireApproveCourse: true,
    requireBankLinked: true,
  };
  const loadCachedSystem = (): typeof defaultSystem => {
    if (typeof window !== "undefined") {
      const cachedSystem = localStorage.getItem("eduverse_system_settings");
      if (cachedSystem) {
        try {
          return JSON.parse(cachedSystem);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return defaultSystem;
  };
  const [system, setSystem] = useState(loadCachedSystem);
  const [originalSystem, setOriginalSystem] = useState(loadCachedSystem);
  const [testStates, setTestStates] = useState<
    Record<string, "testing" | "success" | "failed">
  >({});

  // --- Active Sessions mock list ---
  const [sessions, setSessions] = useState([
    {
      id: "1",
      os: "Windows 11",
      browser: "Chrome 127",
      ip: "113.161.42.***",
      location: "Hà Nội, VN",
      time: "Hôm nay - 15:42",
      current: true,
    },
    {
      id: "2",
      os: "iOS 17.5",
      browser: "Safari Mobile",
      ip: "14.162.245.***",
      location: "TP. Hồ Chí Minh, VN",
      time: "Hôm qua - 22:15",
      current: false,
    },
    {
      id: "3",
      os: "macOS Sonoma",
      browser: "Firefox 125",
      ip: "115.79.136.***",
      location: "Đà Nẵng, VN",
      time: "25/07/2026 - 08:30",
      current: false,
    },
  ]);

  // Parse real device info and load real IP/Location on client mount
  useEffect(() => {
    // Defer to a microtask so the state updates below don't run
    // synchronously within the effect body.
    Promise.resolve().then(() => {
      if (typeof window !== "undefined") {
        const ua = navigator.userAgent;
        let browser = "Unknown Browser";
        let os = "Unknown OS";

        // Parse OS
        if (ua.indexOf("Windows NT 10.0") !== -1) os = "Windows 10/11";
        else if (ua.indexOf("Windows NT 6.2") !== -1) os = "Windows 8";
        else if (ua.indexOf("Windows NT 6.1") !== -1) os = "Windows 7";
        else if (ua.indexOf("Macintosh") !== -1) os = "macOS";
        else if (ua.indexOf("iPhone") !== -1) os = "iOS";
        else if (ua.indexOf("iPad") !== -1) os = "iPadOS";
        else if (ua.indexOf("Android") !== -1) os = "Android";
        else if (ua.indexOf("Linux") !== -1) os = "Linux";

        // Parse Browser
        if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
        else if (ua.indexOf("SamsungBrowser") !== -1)
          browser = "Samsung Browser";
        else if (ua.indexOf("Opera") !== -1 || ua.indexOf("OPR") !== -1)
          browser = "Opera";
        else if (ua.indexOf("Edge") !== -1 || ua.indexOf("Edg") !== -1)
          browser = "Microsoft Edge";
        else if (ua.indexOf("Chrome") !== -1) browser = "Chrome";
        else if (ua.indexOf("Safari") !== -1) browser = "Safari";

        // Try to extract browser version
        const match = ua.match(
          /(chrome|safari|firefox|msie|trident|opera|edge|edg)\/?\s*(\d+)/i,
        );
        const version = match && match[2] ? ` ${match[2]}` : "";
        const fullBrowser = `${browser}${version}`;

        setSessions((prev) =>
          prev.map((s) =>
            s.current ? { ...s, os: os, browser: fullBrowser } : s,
          ),
        );

        // Fetch real IP and Location using public API
        fetch("https://ipapi.co/json/")
          .then((res) => res.json())
          .then((data) => {
            if (data && data.ip) {
              const parts = data.ip.split(".");
              const maskedIp =
                parts.length === 4
                  ? `${parts[0]}.${parts[1]}.${parts[2]}.***`
                  : data.ip;
              const locationStr = `${data.city || "Hà Nội"}, ${data.country_name || "VN"}`;
              setSessions((prev) =>
                prev.map((s) =>
                  s.current ? { ...s, ip: maskedIp, location: locationStr } : s,
                ),
              );
            }
          })
          .catch((err) => {
            console.log("Không thể lấy địa chỉ IP thực:", err);
          });
      }
    });
  }, []);

  // --- Change Handlers ---
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSystemChange = (e: any) => {
    const name = e.target.name as string;
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setSystem((prev) => ({ ...prev, [name]: value }));
  };

  // --- Profile Picture Upload ---
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    // File validation
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "File quá lớn",
        text: "Vui lòng chọn ảnh đại diện có dung lượng dưới 2MB.",
      });
      return;
    }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiService.post<any>("/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status && response.data?.url) {
        setProfile((prev) => ({ ...prev, avatarUrl: response.data.url }));
        setOriginalProfile((prev) => ({
          ...prev,
          avatarUrl: response.data.url,
        }));
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Đã cập nhật ảnh đại diện quản trị thành công!",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error(response.message || "Lỗi phản hồi từ server");
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Tải lên thất bại",
        text:
          err instanceof Error
            ? err.message
            : "Không thể cập nhật ảnh đại diện lên máy chủ.",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // --- Save profile details ---
  const handleSaveProfile = async () => {
    if (!profile.hoTen.trim()) {
      Swal.fire({
        icon: "error",
        title: "Lỗi nhập liệu",
        text: "Họ và tên quản trị viên không được bỏ trống.",
      });
      return;
    }

    if (
      profile.phone &&
      !/^(84|0[3|5|7|8|9])+([0-9]{8})\b$/.test(profile.phone)
    ) {
      Swal.fire({
        icon: "error",
        title: "Số điện thoại hợp lệ",
        text: "Vui lòng nhập đúng định dạng số điện thoại Việt Nam.",
      });
      return;
    }

    setSavingProfile(true);
    try {
      const response = await apiService.put("/profile", {
        hoTen: profile.hoTen.trim(),
        email: profile.email,
        phoneNumber: profile.phone,
        diaChi: profile.diaChi,
        tieuSu: profile.tieuSu,
        ngaySinh: profile.ngaySinh,
      });

      if (response.status) {
        setOriginalProfile({ ...profile });
        Swal.fire({
          icon: "success",
          title: "Đã lưu cấu hình",
          text: "Cập nhật thông tin hồ sơ Admin thành công!",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text:
          err instanceof Error
            ? err.message
            : "Có lỗi xảy ra khi lưu thông tin.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // --- Reset forms ---
  const handleResetProfile = () => {
    setProfile({ ...originalProfile });
  };

  // --- Save system settings (localStorage) ---
  const handleSaveSystem = () => {
    if (system.minWithdrawal < 0 || system.maxWithdrawal < 0) {
      Swal.fire("Lỗi", "Hạn mức rút tiền phải là số dương!", "error");
      return;
    }
    if (system.maxWithdrawal <= system.minWithdrawal) {
      Swal.fire(
        "Lỗi",
        "Hạn mức tối đa phải lớn hơn hạn mức tối thiểu!",
        "error",
      );
      return;
    }
    if (system.commissionRate < 0 || system.commissionRate > 100) {
      Swal.fire(
        "Lỗi",
        "Tỷ lệ hoa hồng phải nằm trong khoảng từ 0% đến 100%!",
        "error",
      );
      return;
    }

    // Modal confirmation for financial metrics
    const isFinancialChanged =
      system.commissionRate !== originalSystem.commissionRate ||
      system.minWithdrawal !== originalSystem.minWithdrawal ||
      system.maxWithdrawal !== originalSystem.maxWithdrawal ||
      system.maintenanceMode !== originalSystem.maintenanceMode;

    if (isFinancialChanged) {
      Swal.fire({
        title: "Xác nhận thay đổi cấu hình quan trọng",
        text: "Bạn đang thay đổi các chỉ số tài chính hoặc chế độ hoạt động của toàn bộ hệ thống. Bạn chắc chắn muốn áp dụng các thiết lập mới?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: '#8B1313',
        cancelButtonColor: '#4B5563',
        confirmButtonText: 'Đồng ý cập nhật',
        cancelButtonText: 'Hủy bỏ',
      }).then((result) => {
        if (result.isConfirmed) {
          saveSystemData();
        }
      });
    } else {
      saveSystemData();
    }
  };

  const saveSystemData = () => {
    localStorage.setItem("eduverse_system_settings", JSON.stringify(system));
    setOriginalSystem({ ...system });
    Swal.fire({
      icon: "success",
      title: "Đã lưu cấu hình",
      text: "Đồng bộ hóa cấu hình vận hành hệ thống thành công!",
      timer: 1800,
      showConfirmButton: false,
    });
  };

  const handleResetSystem = () => {
    setSystem({ ...originalSystem });
  };

  // --- 2FA OTP Setup ---
  const handle2FAToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      // Prompt 2FA activation
      Swal.fire({
        title: "Kích hoạt Xác thực 2 lớp (2FA)",
        text: "Cổng kết nối sẽ tạo mã QR bảo mật. Bạn cần dùng Google Authenticator quét để lấy OTP đăng nhập.",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: '#8B1313',
        confirmButtonText: 'Tiếp tục',
        cancelButtonText: 'Quay lại',
      }).then(async (res) => {
        if (res.isConfirmed) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response = await apiService.post<any>("/enable-2fa", {
              enable: true,
            });
            if (response.status && response.data) {
              setQrCodeUrl(response.data.qrCode);
              setSecretKey(response.data.secret);
              setOtpDialogOpen(true);
            } else {
              throw new Error(response.message);
            }
          } catch (err) {
            Swal.fire(
              "Lỗi",
              err instanceof Error
                ? err.message
                : "Không thể tạo mã xác thực 2FA lúc này.",
              "error",
            );
          }
        }
      });
    } else {
      // Prompt 2FA deactivation
      Swal.fire({
        title: "Tắt xác thực 2 lớp?",
        text: "Bảo mật tài khoản của bạn sẽ bị giảm sút. Bạn chắc chắn muốn tắt tính năng này?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DC2626",
        confirmButtonText: "Tắt 2FA",
        cancelButtonText: "Hủy",
      }).then(async (res) => {
        if (res.isConfirmed) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response = await apiService.post<any>("/enable-2fa", {
              enable: false,
            });
            if (response.status) {
              setProfile((prev) => ({ ...prev, twoFactorEnabled: false }));
              setOriginalProfile((prev) => ({
                ...prev,
                twoFactorEnabled: false,
              }));
              Swal.fire(
                "Đã tắt",
                "Đã hủy kích hoạt tính năng bảo vệ 2FA.",
                "success",
              );
            } else {
              throw new Error(response.message);
            }
          } catch (err) {
            Swal.fire(
              "Lỗi",
              err instanceof Error ? err.message : "Không thể tắt 2FA lúc này.",
              "error",
            );
          }
        }
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
      Swal.fire(
        "Mã không hợp lệ",
        "Mã xác thực OTP phải chứa đúng 6 chữ số.",
        "error",
      );
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await apiService.post("/verify-otp", { code: otpCode });
      if (res.status) {
        setProfile((prev) => ({ ...prev, twoFactorEnabled: true }));
        setOriginalProfile((prev) => ({ ...prev, twoFactorEnabled: true }));
        setOtpDialogOpen(false);
        setOtpCode("");
        Swal.fire(
          "Thành công",
          "Đã kích hoạt bảo mật xác thực 2 yếu tố thành công!",
          "success",
        );
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      Swal.fire(
        "Lỗi xác thực",
        err instanceof Error
          ? err.message
          : "Mã OTP không chính xác hoặc đã hết hạn.",
        "error",
      );
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleRevokeSession = (id: string) => {
    Swal.fire({
      title: "Đăng xuất thiết bị này?",
      text: "Phiên làm việc trên thiết bị này sẽ lập tức mất hiệu lực.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: '#8B1313',
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy',
    }).then((res) => {
      if (res.isConfirmed) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
        Swal.fire(
          "Đã thu hồi",
          "Đã đăng xuất phiên hoạt động khỏi thiết bị.",
          "success",
        );
      }
    });
  };

  const handleRevokeAllOthers = () => {
    Swal.fire({
      title: "Đăng xuất khỏi tất cả thiết bị khác?",
      text: "Tất cả các phiên làm việc ngoại trừ phiên hiện tại sẽ bị thu hồi token.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      confirmButtonText: "Thu hồi toàn bộ",
      cancelButtonText: "Hủy",
    }).then((res) => {
      if (res.isConfirmed) {
        setSessions((prev) => prev.filter((s) => s.current));
        Swal.fire(
          "Đăng xuất hoàn tất",
          "Đã thu hồi quyền truy cập trên mọi thiết bị khác thành công.",
          "success",
        );
      }
    });
  };

  // --- Connection Testing ---
  const handleTestConnection = (
    service: "google" | "cloudinary" | "zoom" | "elasticsearch",
  ) => {
    setTestStates((prev) => ({ ...prev, [service]: "testing" }));
    setTimeout(() => {
      const isOk = Math.random() > 0.15; // 85% success rate
      setTestStates((prev) => ({
        ...prev,
        [service]: isOk ? "success" : "failed",
      }));
      if (isOk) {
        Swal.fire({
          icon: "success",
          title: "Kết nối ổn định",
          text: `Cổng tích hợp dịch vụ ${service.toUpperCase()} phản hồi tốt!`,
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Kết nối thất bại",
          text: `Không thể kết nối đến máy chủ ${service.toUpperCase()}. Vui lòng kiểm tra lại Keys.`,
        });
      }
    }, 1200);
  };

  // --- Danger zone actions ---
  const handleDisableAccount = () => {
    Swal.fire({
      title: "Vô hiệu hóa tài khoản quản trị?",
      html: "Đây là hành động nguy hiểm. Tài khoản của bạn sẽ bị tạm khóa ngay lập tức và không thể quản trị hệ thống. <br/><br/>Hãy gõ chữ <b>CONFIRM</b> vào ô dưới đây để tiếp tục:",
      icon: "warning",
      input: "text",
      inputPlaceholder: "Gõ CONFIRM...",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      confirmButtonText: "Yêu cầu khóa",
      cancelButtonText: "Hủy",
      preConfirm: (value) => {
        if (value !== "CONFIRM") {
          Swal.showValidationMessage("Vui lòng gõ chính xác chữ CONFIRM!");
        }
        return value;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          "Lỗi an toàn",
          "Bạn là Super Admin duy nhất đang hoạt động. Hệ thống từ chối yêu cầu tự vô hiệu hóa tài khoản!",
          "error",
        );
      }
    });
  };

  // --- Unsaved changes checking ---
  const isProfileDirty =
    JSON.stringify(profile) !== JSON.stringify(originalProfile);
  const isSystemDirty =
    JSON.stringify(system) !== JSON.stringify(originalSystem);
  const hasUnsavedChanges = isProfileDirty || isSystemDirty;

  const userInitials = profile.hoTen
    ? profile.hoTen.split(" ").pop()?.substring(0, 2).toUpperCase() || "AD"
    : "AD";

  if (isPersonnel) {
    return (
      <AuthGuard allowedRoles={["Admin", "personnel"]}>
        <DashboardShell>
          <Box
            sx={{
              px: { xs: 2.5, md: 4.5 },
              py: { xs: 3, md: 5 },
              width: "100%",
              maxWidth: 1200,
              mx: "auto",
            }}
          >
            <Box sx={{ mb: 3.5 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: "text.primary",
                  letterSpacing: "-0.7px",
                  mb: 1,
                }}
              >
                Hồ sơ cá nhân
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 14.5 }}>
                Quản lý và cập nhật thông tin tài khoản cá nhân của bạn trên hệ thống EduVerse.
              </Typography>
            </Box>

            <AccountSettings />
          </Box>
        </DashboardShell>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={["Admin", "personnel"]}>
      <DashboardShell>
        <Box sx={{ px: { xs: 2.5, md: 4.5 }, py: { xs: 3, md: 5.5 } }}>
          {/* Header */}
          <Box sx={{ mb: 4.5 }}>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center", mb: 1 }}
            >
              <Typography
                sx={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: 'var(--ev-text-primary, #1F2937)',
                }}
              >
                {isPersonnel ? "Thông tin tài khoản cá nhân" : "Cấu hình & Cài đặt hệ thống"}
              </Typography>
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  bgcolor: isPersonnel ? "#F3E8FF" : "#FEF2F2",
                  border: isPersonnel ? "1px solid #C084FC" : "1px solid #FCA5A5",
                  borderRadius: "8px",
                }}
              >
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: isPersonnel ? "#7C3AED" : "#8B1313" }}>
                  {isPersonnel ? "NHÂN VIÊN KIỂM DUYỆT" : "SUPER ADMIN"}
                </Typography>
              </Box>
            </Stack>
            <Typography sx={{ color: 'var(--ev-text-secondary, #4B5563)', fontSize: 14 }}>
              {isPersonnel
                ? "Cổng quản lý và điều chỉnh thông tin hồ sơ cá nhân của bạn tại EduVerse."
                : "Cổng quản lý và điều chỉnh thông tin hồ sơ bảo mật cá nhân, thông số vận hành của EduVerse."}
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ alignItems: "flex-start" }}>
            {/* Navigation Tabs Bar */}
            <Grid size={{ xs: 12, md: 3.5, lg: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "20px",
                  border: "1px solid rgba(0,0,0,0.06)",
                  bgcolor: "var(--ev-paper, #ffffff)",
                  p: 1.8,
                  position: "sticky",
                  top: "110px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.01)",
                }}
              >
                <Tabs
                  orientation="vertical"
                  value={activeTab}
                  onChange={(e, val) => setActiveTab(val)}
                  sx={{
                    "& .MuiTabs-indicator": {
                      left: 0,
                      right: 'auto',
                      bgcolor: '#8B1313',
                      width: 4,
                      borderRadius: "4px",
                    },
                    "& .MuiTab-root": {
                      alignItems: "center",
                      justifyContent: "flex-start",
                      textAlign: "left",
                      fontWeight: 700,
                      fontSize: 13.5,
                      textTransform: "none",
                      py: 1.6,
                      px: 2,
                      borderRadius: '12px',
                      color: 'var(--ev-text-secondary, #4B5563)',
                      minHeight: 48,
                      mb: 0.8,
                      transition: 'all 200ms ease',
                      '&:hover': {
                        bgcolor: '#FEF2F2',
                        color: '#8B1313',
                      },
                      '&.Mui-selected': {
                        bgcolor: '#FEF2F2',
                        color: '#8B1313',
                      },
                    },
                  }}
                >
                  <Tab
                    label={isPersonnel ? "Tài khoản cá nhân" : "Tài khoản Admin"}
                    icon={
                      isPersonnel ? (
                        <PersonRounded sx={{ mr: 1.5, fontSize: 20 }} />
                      ) : (
                        <AdminPanelSettingsRounded sx={{ mr: 1.5, fontSize: 20 }} />
                      )
                    }
                    iconPosition="start"
                  />
                  {!isPersonnel && (
                    <Tab
                      label="Bảo mật & Phiên"
                      icon={<SecurityRounded sx={{ mr: 1.5, fontSize: 20 }} />}
                      iconPosition="start"
                    />
                  )}
                  {!isPersonnel && (
                    <Tab
                      label="Vận hành hệ thống"
                      icon={
                        <SettingsApplicationsRounded
                          sx={{ mr: 1.5, fontSize: 20 }}
                        />
                      }
                      iconPosition="start"
                    />
                  )}
                </Tabs>
              </Paper>
            </Grid>

            {/* Content Area */}
            <Grid size={{ xs: 12, md: 8.5, lg: 9 }}>
              <Stack spacing={4}>
                {/* Loader State */}
                {loadingProfile && activeTab === 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: "24px",
                      border: "1px solid rgba(0,0,0,0.06)",
                      bgcolor: "var(--ev-paper, #ffffff)",
                      p: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CircularProgress size={36} sx={{ color: '#8B1313', mr: 2 }} />
                    <Typography sx={{ fontWeight: 650, color: 'var(--ev-text-secondary, #4B5563)' }}>
                      Đang đồng bộ hồ sơ máy chủ...
                    </Typography>
                  </Paper>
                ) : (
                  <>
                    {/* Tab 0: Account Settings */}
                    {activeTab === 0 && (
                      <>
                        <Paper
                          elevation={0}
                          sx={{
                            borderRadius: "24px",
                            border: "1px solid rgba(0,0,0,0.06)",
                            bgcolor: "var(--ev-paper, #ffffff)",
                            p: { xs: 3, md: 4.5 },
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3.5, color: 'var(--ev-text-primary, #1F2937)' }}>
                            {isPersonnel ? "Hồ sơ cá nhân nhân viên" : "Hồ sơ quản trị viên"}
                          </Typography>

                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={3}
                            sx={{ mb: 4.5, alignItems: "center" }}
                          >
                            <Box sx={{ position: "relative" }}>
                              <Avatar
                                src={profile.avatarUrl || undefined}
                                sx={{
                                  width: 80,
                                  height: 80,
                                  bgcolor: '#8B1313',
                                  color: '#fff',
                                  fontWeight: 800,
                                  fontSize: 26,
                                  border: "3px solid #FEF2F2",
                                  boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
                                }}
                              >
                                {userInitials}
                              </Avatar>
                              <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                              />
                              <IconButton
                                onClick={handleAvatarClick}
                                disabled={uploadingAvatar}
                                sx={{
                                  position: "absolute",
                                  bottom: -2,
                                  right: -2,
                                  bgcolor: '#1F2937',
                                  color: '#fff',
                                  p: 0.8,
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                  "&:hover": { bgcolor: "#1F2937" },
                                }}
                              >
                                {uploadingAvatar ? (
                                  <CircularProgress
                                    size={14}
                                    sx={{ color: "#fff" }}
                                  />
                                ) : (
                                  <PhotoCameraRounded sx={{ fontSize: 15 }} />
                                )}
                              </IconButton>
                            </Box>
                            <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                              <Typography sx={{ fontWeight: 800, fontSize: 16.5 }}>{profile.hoTen}</Typography>
                              <Typography sx={{ color: 'var(--ev-text-secondary, #4B5563)', fontSize: 13, mt: 0.5 }}>
                                Vai trò hệ thống: <strong style={{ color: isPersonnel ? '#7C3AED' : '#8B1313' }}>
                                  {isPersonnel || profile.roles?.toLowerCase() === "personnel" ? "Nhân viên kiểm duyệt" : profile.roles}
                                </strong>
                              </Typography>
                            </Box>
                          </Stack>

                          <Grid container spacing={3.5}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                fullWidth
                                label="Họ và tên"
                                name="hoTen"
                                value={profile.hoTen}
                                onChange={handleProfileChange}
                                variant="outlined"
                                slotProps={{
                                  input: {
                                    style: { borderRadius: "12px" },
                                  },
                                }}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                fullWidth
                                label="Địa chỉ Email"
                                name="email"
                                value={profile.email}
                                disabled
                                variant="outlined"
                                slotProps={{
                                  input: {
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <EmailRounded sx={{ color: 'var(--ev-text-secondary, #4B5563)', fontSize: 18 }} />
                                      </InputAdornment>
                                    ),
                                    style: { borderRadius: '12px', backgroundColor: 'var(--ev-paper-alt, #FBFAF9)' },
                                  },
                                }}
                                helperText="Email được liên kết với tài khoản Google và không thể chỉnh sửa tại đây."
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                fullWidth
                                label="Số điện thoại"
                                name="phone"
                                value={profile.phone}
                                onChange={handleProfileChange}
                                variant="outlined"
                                slotProps={{
                                  input: {
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <PhoneRounded sx={{ color: 'var(--ev-text-secondary, #4B5563)', fontSize: 18 }} />
                                      </InputAdornment>
                                    ),
                                    style: { borderRadius: "12px" },
                                  },
                                }}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                fullWidth
                                label="Địa chỉ cư trú"
                                name="diaChi"
                                value={profile.diaChi}
                                onChange={handleProfileChange}
                                variant="outlined"
                                slotProps={{
                                  input: {
                                    style: { borderRadius: "12px" },
                                  },
                                }}
                              />
                            </Grid>
                          </Grid>

                          <Divider
                            sx={{ my: 4.5, borderColor: "rgba(0,0,0,0.06)" }}
                          />

                          <Stack
                            direction="row"
                            spacing={2}
                            sx={{ justifyContent: "flex-start" }}
                          >
                            <Button
                              variant="contained"
                              startIcon={
                                savingProfile ? (
                                  <CircularProgress
                                    size={16}
                                    sx={{ color: "#fff" }}
                                  />
                                ) : (
                                  <SaveRounded />
                                )
                              }
                              onClick={handleSaveProfile}
                              disabled={savingProfile || !isProfileDirty}
                              sx={{
                                bgcolor: '#8B1313',
                                color: '#fff',
                                borderRadius: '12px',
                                px: 3,
                                py: 1.25,
                                fontWeight: 700,
                                fontSize: 13,
                                boxShadow: "none",
                                "&:hover": { bgcolor: "#7F1D1D" },
                              }}
                            >
                              Lưu thay đổi hồ sơ
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={handleResetProfile}
                              disabled={!isProfileDirty}
                              sx={{
                                borderColor: 'var(--ev-divider, #ECE7E4)',
                                color: 'var(--ev-text-secondary, #4B5563)',
                                borderRadius: '12px',
                                px: 3,
                                py: 1.25,
                                fontWeight: 700,
                                fontSize: 13,
                                '&:hover': { bgcolor: 'var(--ev-paper-alt, #FBFAF9)', borderColor: 'var(--ev-divider, #ECE7E4)' },
                              }}
                            >
                              Đặt lại
                            </Button>
                          </Stack>
                        </Paper>

                        {/* Role info card readonly */}
                        <Paper
                          elevation={0}
                          sx={{
                            borderRadius: "24px",
                            border: "1px solid rgba(0,0,0,0.06)",
                            bgcolor: "var(--ev-paper, #ffffff)",
                            p: { xs: 3, md: 4.5 },
                          }}
                        >
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, color: 'var(--ev-text-primary, #1F2937)' }}>
                            Phạm vi vai trò & Quyền hạn
                          </Typography>
                          <Typography sx={{ color: 'var(--ev-text-secondary, #4B5563)', fontSize: 13, mb: 3 }}>
                            Quyền lực của tài khoản được đồng bộ hóa từ hệ thống phân quyền của EduVerse.
                          </Typography>

                          <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Box sx={{ p: 2.5, borderRadius: '14px', border: '1px dashed #ECE7E4', bgcolor: 'var(--ev-paper-alt, #F7F5F2)' }}>
                                <Typography sx={{ fontSize: 11, fontWeight: 800, color: 'var(--ev-text-secondary, #4B5563)', mb: 0.5 }}>
                                  VAI TRÒ HIỆN TẠI
                                </Typography>
                                <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#8B1313' }}>
                                  {profile.roles === 'Super Admin' ? 'Super Administrator' : 'Administrator'}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Box sx={{ p: 2.5, borderRadius: '14px', border: '1px dashed #ECE7E4', bgcolor: 'var(--ev-paper-alt, #F7F5F2)' }}>
                                <Typography sx={{ fontSize: 11, fontWeight: 800, color: 'var(--ev-text-secondary, #4B5563)', mb: 0.5 }}>
                                  PHẠM VI QUYỀN HẠN
                                </Typography>
                                <Typography sx={{ fontSize: 15, fontWeight: 800, color: 'var(--ev-text-primary, #1F2937)' }}>
                                  {profile.roles === 'Super Admin' ? 'Toàn quyền cấu hình (Full Control)' : 'Kiểm duyệt viên (Moderator)'}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>

                          <Box
                            sx={{
                              mt: 3,
                              display: "flex",
                              justifyContent: "flex-start",
                            }}
                          >
                            <Button
                              component={Link}
                              href="/admin/roles"
                              variant="text"
                              sx={{
                                textTransform: 'none',
                                color: '#8B1313',
                                fontWeight: 700,
                                fontSize: 13,
                                p: 0,
                                "&:hover": {
                                  bgcolor: "transparent",
                                  textDecoration: "underline",
                                },
                              }}
                            >
                              Truy cập quản lý phân vai trò & quyền hạn →
                            </Button>
                          </Box>
                        </Paper>

                        {/* Danger Zone */}
                        <Paper
                          elevation={0}
                          sx={{
                            borderRadius: "24px",
                            border: "1px solid #FCA5A5",
                            bgcolor: "#FEF2F2",
                            p: { xs: 3, md: 4.5 },
                          }}
                        >
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, color: '#8B1313' }}>
                            Khu vực nguy hiểm (Danger Zone)
                          </Typography>
                          <Typography
                            sx={{ color: "#7F1D1D", fontSize: 13, mb: 3 }}
                          >
                            Các thao tác dưới đây có tác động trực tiếp đến khả
                            năng truy cập tài khoản quản trị. Hãy cẩn trọng.
                          </Typography>

                          <Stack spacing={2}>
                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              spacing={2}
                              sx={{
                                justifyContent: "space-between",
                                alignItems: { xs: "flex-start", sm: "center" },
                              }}
                            >
                              <Box>
                                <Typography sx={{ fontWeight: 750, fontSize: 14, color: 'var(--ev-text-primary, #1F2937)' }}>
                                  Tạm khóa / Vô hiệu hóa tài khoản
                                </Typography>
                                <Typography sx={{ fontSize: 12.5, color: 'var(--ev-text-secondary, #4B5563)' }}>
                                  Tài khoản Admin của bạn sẽ bị tạm ngưng và đăng xuất tức thì.
                                </Typography>
                              </Box>
                              <Button
                                variant="contained"
                                onClick={handleDisableAccount}
                                sx={{
                                  bgcolor: "#DC2626",
                                  color: "#fff",
                                  borderRadius: "10px",
                                  fontWeight: 700,
                                  fontSize: 12.5,
                                  px: 2.2,
                                  py: 1,
                                  boxShadow: "none",
                                  "&:hover": { bgcolor: "#B91C1C" },
                                }}
                              >
                                Vô hiệu hóa
                              </Button>
                            </Stack>

                            <Divider
                              sx={{ borderColor: "rgba(153,27,27,0.1)" }}
                            />

                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              spacing={2}
                              sx={{
                                justifyContent: "space-between",
                                alignItems: { xs: "flex-start", sm: "center" },
                              }}
                            >
                              <Box>
                                <Typography sx={{ fontWeight: 750, fontSize: 14, color: 'var(--ev-text-primary, #1F2937)' }}>
                                  Đăng xuất khỏi thiết bị khác
                                </Typography>
                                <Typography sx={{ fontSize: 12.5, color: 'var(--ev-text-secondary, #4B5563)' }}>
                                  Thu hồi toàn bộ phiên đăng nhập của tài khoản này ở mọi trình duyệt khác.
                                </Typography>
                              </Box>
                              <Button
                                variant="outlined"
                                onClick={handleRevokeAllOthers}
                                sx={{
                                  borderColor: "rgba(220,38,38,0.4)",
                                  color: "#DC2626",
                                  borderRadius: "10px",
                                  fontWeight: 700,
                                  fontSize: 12.5,
                                  px: 2.2,
                                  py: 1,
                                  "&:hover": {
                                    bgcolor: "#FFF1F2",
                                    borderColor: "#DC2626",
                                  },
                                }}
                              >
                                Đăng xuất tất cả
                              </Button>
                            </Stack>
                          </Stack>
                        </Paper>
                      </>
                    )}

                    {/* Tab 1: Security Overview & Sessions */}
                    {activeTab === 1 && (
                      <>
                        {/* 2FA Card */}
                        <Paper
                          elevation={0}
                          sx={{
                            borderRadius: "24px",
                            border: "1px solid rgba(0,0,0,0.06)",
                            bgcolor: "var(--ev-paper, #ffffff)",
                            p: { xs: 3, md: 4.5 },
                          }}
                        >
                          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--ev-text-primary, #1F2937)' }}>
                              Xác thực hai yếu tố (2FA)
                            </Typography>
                            {profile.twoFactorEnabled ? (
                              <Box
                                sx={{
                                  px: 1.5,
                                  py: 0.5,
                                  bgcolor: "#ECFDF5",
                                  border: "1px solid #A7F3D0",
                                  borderRadius: "8px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <CheckCircleOutlineRounded
                                  sx={{ fontSize: 14, color: "#15803D" }}
                                />
                                <Typography
                                  sx={{
                                    fontSize: 11.5,
                                    fontWeight: 800,
                                    color: "#15803D",
                                  }}
                                >
                                  ĐÃ BẬT
                                </Typography>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  px: 1.5,
                                  py: 0.5,
                                  bgcolor: "#FFF7ED",
                                  border: "1px solid #FED7AA",
                                  borderRadius: "8px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <ErrorOutlineRounded
                                  sx={{ fontSize: 14, color: "#D97706" }}
                                />
                                <Typography
                                  sx={{
                                    fontSize: 11.5,
                                    fontWeight: 800,
                                    color: "#D97706",
                                  }}
                                >
                                  CHƯA BẬT
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                          <Typography sx={{ color: 'var(--ev-text-secondary, #4B5563)', fontSize: 13, mb: 3 }}>
                            Kích hoạt phương pháp mật mã động sử dụng Google Authenticator để bổ sung thêm một lớp bảo mật nghiêm ngặt cho tài khoản Admin của bạn.
                          </Typography>

                          <FormControlLabel
                            control={
                              <Switch
                                checked={profile.twoFactorEnabled}
                                onChange={handle2FAToggle}
                                name="enable2FA"
                                color="success"
                              />
                            }
                            label={
                              <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: 14, color: 'var(--ev-text-primary, #1F2937)' }}>
                                  Yêu cầu mã xác thực khi đăng nhập tài khoản
                                </Typography>
                              </Box>
                            }
                          />
                        </Paper>

                        {/* Device session manager */}
                        <Paper
                          elevation={0}
                          sx={{
                            borderRadius: "24px",
                            border: "1px solid rgba(0,0,0,0.06)",
                            bgcolor: "var(--ev-paper, #ffffff)",
                            p: { xs: 3, md: 4.5 },
                          }}
                        >
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                            sx={{
                              justifyContent: "space-between",
                              alignItems: { xs: "flex-start", sm: "center" },
                              mb: 3.5,
                            }}
                          >
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--ev-text-primary, #1F2937)' }}>
                                Phiên hoạt động đang chạy
                              </Typography>
                              <Typography sx={{ color: 'var(--ev-text-secondary, #4B5563)', fontSize: 13 }}>
                                Danh sách các trình duyệt và thiết bị đang duy trì phiên kết nối vào tài khoản của bạn.
                              </Typography>
                            </Box>
                            {sessions.length > 1 && (
                              <Button
                                size="small"
                                onClick={handleRevokeAllOthers}
                                sx={{
                                  textTransform: "none",
                                  color: "#DC2626",
                                  fontWeight: 800,
                                  fontSize: 12.5,
                                  "&:hover": { bgcolor: "#FFF1F2" },
                                }}
                              >
                                Đăng xuất tất cả thiết bị khác
                              </Button>
                            )}
                          </Stack>

                          <Stack spacing={2}>
                            {sessions.map((sess) => (
                              <Box
                                key={sess.id}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  p: 2,
                                  borderRadius: '14px',
                                  border: '1px solid #ECE7E4',
                                  bgcolor: sess.current ? '#EFF6FF' : 'transparent',
                                }}
                              >
                                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                                  {sess.os.toLowerCase().includes('windows') || sess.os.toLowerCase().includes('mac') ? (
                                    <LaptopMacRounded sx={{ fontSize: 24, color: sess.current ? '#2563EB' : '#4B5563' }} />
                                  ) : (
                                    <PhoneIphoneRounded sx={{ fontSize: 24, color: sess.current ? '#2563EB' : '#4B5563' }} />
                                  )}
                                  <Box>
                                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                      <Typography sx={{ fontSize: 14, fontWeight: 750, color: 'var(--ev-text-primary, #1F2937)' }}>
                                        {sess.browser} ({sess.os})
                                      </Typography>
                                      {sess.current && (
                                        <Box
                                          sx={{
                                            px: 1,
                                            py: 0.2,
                                            bgcolor: "#3B82F6",
                                            borderRadius: "4px",
                                          }}
                                        >
                                          <Typography
                                            sx={{
                                              fontSize: 9,
                                              fontWeight: 900,
                                              color: "#fff",
                                            }}
                                          >
                                            HIỆN TẠI
                                          </Typography>
                                        </Box>
                                      )}
                                    </Stack>
                                    <Typography sx={{ fontSize: 12.5, color: 'var(--ev-text-secondary, #4B5563)', mt: 0.2 }}>
                                      IP: {sess.ip} • {sess.location} • Đăng nhập lúc: {sess.time}
                                    </Typography>
                                  </Box>
                                </Stack>
                                {!sess.current && (
                                  <Button
                                    size="small"
                                    onClick={() => handleRevokeSession(sess.id)}
                                    sx={{
                                      textTransform: 'none',
                                      color: 'var(--ev-text-secondary, #4B5563)',
                                      fontWeight: 700,
                                      fontSize: 12,
                                    }}
                                  >
                                    Đăng xuất
                                  </Button>
                                )}
                              </Box>
                            ))}
                          </Stack>
                        </Paper>
                      </>
                    )}

                    {/* Tab 2: System Configurations */}
                    {activeTab === 2 && (
                      <>
                        <Paper
                          elevation={0}
                          sx={{
                            borderRadius: "24px",
                            border: "1px solid rgba(0,0,0,0.06)",
                            bgcolor: "var(--ev-paper, #ffffff)",
                            p: { xs: 3, md: 4.5 },
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3.5, color: 'var(--ev-text-primary, #1F2937)' }}>
                            Cấu hình cổng LMS & Vận hành
                          </Typography>

                          <Grid container spacing={3.5}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                fullWidth
                                label="Tên cổng thông tin LMS"
                                name="siteName"
                                value={system.siteName}
                                onChange={handleSystemChange}
                                variant="outlined"
                                slotProps={{
                                  input: { style: { borderRadius: "12px" } },
                                }}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                fullWidth
                                label="Email liên hệ hệ thống"
                                name="contactEmail"
                                value={system.contactEmail}
                                onChange={handleSystemChange}
                                variant="outlined"
                                slotProps={{
                                  input: { style: { borderRadius: "12px" } },
                                }}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                fullWidth
                                label="Hotline hỗ trợ vận hành"
                                name="supportPhone"
                                value={system.supportPhone}
                                onChange={handleSystemChange}
                                variant="outlined"
                                slotProps={{
                                  input: { style: { borderRadius: "12px" } },
                                }}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <FormControl fullWidth>
                                <InputLabel id="max-upload-label">
                                  Dung lượng video/tệp tải lên tối đa
                                </InputLabel>
                                <Select
                                  labelId="max-upload-label"
                                  name="maxUploadSize"
                                  value={system.maxUploadSize}
                                  label="Dung lượng video/tệp tải lên tối đa"
                                  onChange={handleSystemChange}
                                  sx={{ borderRadius: "12px" }}
                                >
                                  <MenuItem value={10}>10 MB</MenuItem>
                                  <MenuItem value={20}>20 MB</MenuItem>
                                  <MenuItem value={50}>
                                    50 MB (Mặc định)
                                  </MenuItem>
                                  <MenuItem value={100}>100 MB</MenuItem>
                                  <MenuItem value={500}>500 MB</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <FormControl fullWidth>
                                <InputLabel id="timezone-label">
                                  Múi giờ mặc định
                                </InputLabel>
                                <Select
                                  labelId="timezone-label"
                                  name="timezone"
                                  value={system.timezone}
                                  label="Múi giờ mặc định"
                                  onChange={handleSystemChange}
                                  sx={{ borderRadius: "12px" }}
                                >
                                  <MenuItem value="Asia/Ho_Chi_Minh">
                                    Việt Nam (GMT+7)
                                  </MenuItem>
                                  <MenuItem value="UTC">
                                    Giờ Quốc Tế (UTC)
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <FormControl fullWidth>
                                <InputLabel id="currency-label">
                                  Đơn vị tiền tệ chính
                                </InputLabel>
                                <Select
                                  labelId="currency-label"
                                  name="currency"
                                  value={system.currency}
                                  label="Đơn vị tiền tệ chính"
                                  disabled
                                  onChange={handleSystemChange}
                                  sx={{ borderRadius: '12px', bgcolor: 'var(--ev-paper-alt, #FBFAF9)' }}
                                >
                                  <MenuItem value="VND">
                                    Việt Nam Đồng (đ)
                                  </MenuItem>
                                  <MenuItem value="USD">Đô la Mỹ ($)</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                          </Grid>
                        </Paper>

                        {/* Financial and Withdraw Configuration */}
                        <Paper
                          elevation={0}
                          sx={{
                            borderRadius: "24px",
                            border: "1px solid rgba(0,0,0,0.06)",
                            bgcolor: "var(--ev-paper, #ffffff)",
                            p: { xs: 3, md: 4.5 },
                          }}
                        >
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, color: 'var(--ev-text-primary, #1F2937)' }}>
                            Thông số Tài chính & Thanh toán
                          </Typography>
                          <Typography sx={{ color: 'var(--ev-text-secondary, #4B5563)', fontSize: 13, mb: 3.5 }}>
                            Cấu hình mức rút tiền và tỷ lệ khấu trừ chiết khấu hoa hồng khóa học trên hệ thống.
                          </Typography>

                          <Grid container spacing={3.5}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                              <TextField
                                fullWidth
                                type="number"
                                label="Tỷ lệ hoa hồng (%)"
                                name="commissionRate"
                                value={system.commissionRate}
                                onChange={handleSystemChange}
                                variant="outlined"
                                slotProps={{
                                  input: {
                                    style: { borderRadius: "12px" },
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        %
                                      </InputAdornment>
                                    ),
                                  },
                                }}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                              <TextField
                                fullWidth
                                type="number"
                                label="Hạn mức rút tối thiểu"
                                name="minWithdrawal"
                                value={system.minWithdrawal}
                                onChange={handleSystemChange}
                                variant="outlined"
                                slotProps={{
                                  input: {
                                    style: { borderRadius: "12px" },
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        đ
                                      </InputAdornment>
                                    ),
                                  },
                                }}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                              <TextField
                                fullWidth
                                type="number"
                                label="Hạn mức rút tối đa"
                                name="maxWithdrawal"
                                value={system.maxWithdrawal}
                                onChange={handleSystemChange}
                                variant="outlined"
                                slotProps={{
                                  input: {
                                    style: { borderRadius: "12px" },
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        đ
                                      </InputAdornment>
                                    ),
                                  },
                                }}
                              />
                            </Grid>
                          </Grid>
                        </Paper>

                        {/* Operational toggles */}
                        <Paper
                          elevation={0}
                          sx={{
                            borderRadius: "24px",
                            border: "1px solid rgba(0,0,0,0.06)",
                            bgcolor: "var(--ev-paper, #ffffff)",
                            p: { xs: 3, md: 4.5 },
                          }}
                        >
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3, color: 'var(--ev-text-primary, #1F2937)' }}>
                            Các tùy chọn vận hành
                          </Typography>

                          <Stack spacing={3}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={system.allowRegistration}
                                  onChange={handleSystemChange}
                                  name="allowRegistration"
                                  color="success"
                                />
                              }
                              label={
                                <Box>
                                  <Typography sx={{ fontWeight: 750, fontSize: 14, color: 'var(--ev-text-primary, #1F2937)' }}>
                                    Cho phép đăng ký thành viên mới
                                  </Typography>
                                  <Typography sx={{ color: 'var(--ev-text-secondary, #4B5563)', fontSize: 12.5 }}>
                                    Mở cổng form đăng ký cho phép học viên và giảng viên tự tạo tài khoản mới.
                                  </Typography>
                                </Box>
                              }
                            />

                            <Divider sx={{ borderColor: "rgba(0,0,0,0.05)" }} />

                            <FormControlLabel
                              control={
                                <Switch
                                  checked={system.requireApproveCourse}
                                  onChange={handleSystemChange}
                                  name="requireApproveCourse"
                                  color="success"
                                />
                              }
                              label={
                                <Box>
                                  <Typography sx={{ fontWeight: 750, fontSize: 14, color: 'var(--ev-text-primary, #1F2937)' }}>
                                    Bắt buộc phê duyệt khóa học
                                  </Typography>
                                  <Typography sx={{ color: 'var(--ev-text-secondary, #4B5563)', fontSize: 12.5 }}>
                                    Khóa học mới tạo bởi Giảng viên phải thông qua Admin kiểm duyệt trước khi hiển thị công khai.
                                  </Typography>
                                </Box>
                              }
                            />

                            <Divider sx={{ borderColor: "rgba(0,0,0,0.05)" }} />

                            <FormControlLabel
                              control={
                                <Switch
                                  checked={system.requireBankLinked}
                                  onChange={handleSystemChange}
                                  name="requireBankLinked"
                                  color="success"
                                />
                              }
                              label={
                                <Box>
                                  <Typography sx={{ fontWeight: 750, fontSize: 14, color: 'var(--ev-text-primary, #1F2937)' }}>
                                    Ràng buộc liên kết tài khoản ngân hàng
                                  </Typography>
                                  <Typography sx={{ color: 'var(--ev-text-secondary, #4B5563)', fontSize: 12.5 }}>
                                    Gi giảng viên bắt buộc phải liên kết tài khoản ngân hàng trước khi tạo yêu cầu rút tiền.
                                  </Typography>
                                </Box>
                              }
                            />
                          </Stack>
                        </Paper>

                        {/* Maintenance Mode */}
                        <Paper
                          elevation={0}
                          sx={{
                            borderRadius: "24px",
                            border: system.maintenanceMode
                              ? "1px solid #FCA5A5"
                              : "1px solid rgba(0,0,0,0.06)",
                            bgcolor: system.maintenanceMode
                              ? "#FEF2F2"
                              : "#ffffff",
                            p: { xs: 3, md: 4.5 },
                            transition: 'all 200ms ease',
                          }}
                        >
                          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: system.maintenanceMode ? '#8B1313' : '#1F2937' }}>
                              Chế độ Bảo trì Hệ thống
                            </Typography>
                            <Switch
                              checked={system.maintenanceMode}
                              onChange={handleSystemChange}
                              name="maintenanceMode"
                              color="error"
                            />
                          </Stack>
                          <Typography sx={{ color: 'var(--ev-text-secondary, #4B5563)', fontSize: 13, mb: 2 }}>
                            Kích hoạt chế độ bảo trì sẽ chặn tạm thời mọi phiên truy cập thông thường từ Học viên và Giảng viên, chỉ cho phép tài khoản Admin vào hệ thống để sửa lỗi.
                          </Typography>
                          {system.maintenanceMode && (
                            <Alert
                              severity="error"
                              icon={<WarningRounded />}
                              sx={{ borderRadius: "12px" }}
                            >
                              Hệ thống hiện đang nằm trong chế độ đóng băng bảo
                              trì. Chỉ Super Admin mới có thể thay đổi thiết lập
                              này.
                            </Alert>
                          )}
                        </Paper>

                        {/* Action buttons */}
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Button
                            variant="contained"
                            startIcon={<SaveRounded />}
                            onClick={handleSaveSystem}
                            disabled={!isSystemDirty}
                            sx={{
                              bgcolor: '#8B1313',
                              color: '#fff',
                              borderRadius: '12px',
                              px: 3,
                              py: 1.25,
                              fontWeight: 700,
                              fontSize: 13,
                              boxShadow: "none",
                              "&:hover": { bgcolor: "#7F1D1D" },
                            }}
                          >
                            Lưu cấu hình vận hành
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={handleResetSystem}
                            disabled={!isSystemDirty}
                            sx={{
                              borderColor: 'var(--ev-divider, #ECE7E4)',
                              color: 'var(--ev-text-secondary, #4B5563)',
                              borderRadius: '12px',
                              px: 3,
                              py: 1.25,
                              fontWeight: 700,
                              fontSize: 13,
                              '&:hover': { bgcolor: 'var(--ev-paper-alt, #FBFAF9)', borderColor: 'var(--ev-divider, #ECE7E4)' },
                            }}
                          >
                            Đặt lại
                          </Button>
                        </Box>
                      </>
                    )}
                  </>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* ── 2FA Code Validation Dialog ── */}
        <Dialog
          open={otpDialogOpen}
          onClose={() => setOtpDialogOpen(false)}
          slotProps={{
            paper: {
              style: {
                borderRadius: "20px",
                padding: "16px",
                maxWidth: "440px",
              },
            },
          }}
        >
          <DialogTitle
            sx={{ fontWeight: 850, fontSize: 17, pb: 1, textAlign: "center" }}
          >
            Quét mã để kích hoạt 2FA
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ alignItems: "center", py: 1 }}>
              {qrCodeUrl && (
                <Box
                  component="img"
                  src={qrCodeUrl}
                  alt="2FA QR Code"
                  sx={{
                    width: 160,
                    height: 160,
                    borderRadius: '12px',
                    border: '1px solid #ECE7E4',
                    p: 1,
                  }}
                />
              )}
              <Typography sx={{ fontSize: 13, color: 'var(--ev-text-secondary, #4B5563)', textAlign: 'center', lineHeight: 1.6 }}>
                Quét mã này bằng ứng dụng Authenticator (Google/Microsoft), sau đó nhập mã OTP 6 chữ số được tạo ra bên dưới để hoàn tất kích hoạt.
              </Typography>
              <TextField
                fullWidth
                label="Mã xác thực OTP (6 chữ số)"
                placeholder="Nhập mã OTP..."
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                slotProps={{
                  input: {
                    style: {
                      borderRadius: "12px",
                      textAlign: "center",
                      letterSpacing: "4px",
                      fontWeight: 800,
                    },
                  },
                }}
              />
              {secretKey && (
                <Tooltip title="Sử dụng khóa này nếu không quét được mã QR">
                  <Typography sx={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--ev-text-muted, #8A7676)', cursor: 'help' }}>
                    Khóa thủ công: {secretKey}
                  </Typography>
                </Tooltip>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setOtpDialogOpen(false)}
              sx={{ color: 'var(--ev-text-secondary, #4B5563)', fontWeight: 700, textTransform: 'none' }}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="contained"
              onClick={handleVerifyOtp}
              disabled={verifyingOtp}
              sx={{
                bgcolor: '#8B1313',
                color: '#fff',
                borderRadius: '10px',
                fontWeight: 700,
                px: 3,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": { bgcolor: "#7F1D1D" },
              }}
            >
              {verifyingOtp ? (
                <CircularProgress size={16} sx={{ color: "#fff" }} />
              ) : (
                "Xác minh"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Unsaved Changes Sticky Alert Banner ── */}
        {hasUnsavedChanges && (
          <Box
            sx={{
              position: "fixed",
              bottom: 24,
              left: { xs: 16, md: 300 },
              right: 16,
              bgcolor: '#1F2937',
              color: '#fff',
              py: 1.8,
              px: 3,
              borderRadius: "16px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              zIndex: 1000,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <WarningRounded sx={{ color: "#D97706", fontSize: 22 }} />
              <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>
                Bạn có các thay đổi chưa được lưu lại trên trang này!
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  handleResetProfile();
                  handleResetSystem();
                }}
                sx={{
                  color: "rgba(255,255,255,0.65)",
                  fontWeight: 700,
                  fontSize: 12.5,
                  textTransform: "none",
                  "&:hover": { color: "#fff" },
                }}
              >
                Hủy bỏ thay đổi
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  if (isProfileDirty) handleSaveProfile();
                  if (isSystemDirty) handleSaveSystem();
                }}
                sx={{
                  bgcolor: '#8B1313',
                  color: '#fff',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: 12.5,
                  px: 2.5,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#7F1D1D" },
                }}
              >
                Lưu tất cả
              </Button>
            </Stack>
          </Box>
        )}
      </DashboardShell>
    </AuthGuard>
  );
}
