"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  Typography,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Skeleton,
  useTheme,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import {
  EditRounded,
  SaveRounded,
  CloseRounded,
  CameraAltRounded,
  PersonRounded,
  EmailRounded,
  PhoneRounded,
  CakeRounded,
  LocationOnRounded,
  VerifiedRounded,
  ErrorOutlineRounded,
  DescriptionRounded,
  FormatBoldRounded,
  FormatItalicRounded,
  FormatUnderlinedRounded,
  FormatListBulletedRounded,
  FormatListNumberedRounded,
  LinkRounded,
  FormatQuoteRounded,
  WcRounded,
  BadgeRounded,
} from "@mui/icons-material";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import DOMPurify from "dompurify";
import { usePathname } from "next/navigation";
import { apiService } from "@/src/services/index";
import { STATUS } from "@/src/theme/tokens";

interface ProfileData {
  userName?: string;
  hoTen: string;
  email: string;
  phoneNumber: string;
  phoneNumberConfirmed: boolean;
  ngaySinh: string;
  gioiTinh: number;
  diaChi: string;
  tieuSu: string;
  anhDaiDien: string;
  chucVu: string;
  roles?: string[];
  twoFactorEnabled: boolean;
  isGoogleAccount?: boolean;
}

interface UploadAvatarResponse {
  url: string;
}

type SanitizeConfig = NonNullable<Parameters<typeof DOMPurify.sanitize>[1]>;

const SANITIZE_CONFIG: SanitizeConfig = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "a",
    "ul",
    "ol",
    "li",
    "blockquote",
    "h1",
    "h2",
    "h3",
    "code",
    "pre",
    "span",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "style", "class"],
};

function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") return "";
  return DOMPurify.sanitize(html || "", SANITIZE_CONFIG);
}

const TIEU_SU_MIN_WORDS = 50;
const TIEU_SU_MAX_WORDS = 1500;

function getPlainTextFromHtml(html: string) {
  if (typeof window === "undefined" || !html) return "";
  const el = document.createElement("div");
  el.innerHTML = sanitizeHtml(html);
  return (el.textContent || el.innerText || "").trim();
}

function countWords(html: string) {
  const plain = getPlainTextFromHtml(html);
  if (!plain) return 0;
  return plain.split(/\s+/).filter(Boolean).length;
}

function validateTieuSu(html: string): string | null {
  const wordCount = countWords(html);
  if (wordCount === 0) return null;
  if (wordCount < TIEU_SU_MIN_WORDS) {
    return `Tiểu sử cần ít nhất ${TIEU_SU_MIN_WORDS} từ (hiện tại: ${wordCount} từ)`;
  }
  if (wordCount > TIEU_SU_MAX_WORDS) {
    return `Tiểu sử tối đa ${TIEU_SU_MAX_WORDS} từ (hiện tại: ${wordCount} từ)`;
  }
  return null;
}

const TIEU_SU_EXTENSIONS = [
  StarterKit.configure({
    link: {
      openOnClick: false,
      HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
    },
  }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Placeholder.configure({
    placeholder: "Giới thiệu ngắn gọn về bản thân...",
  }),
];

function TieuSuToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const btnSx = (active: boolean) => ({
    color: active ? "#FFFFFF" : "text.secondary",
    bgcolor: active ? "primary.main" : "transparent",
    borderRadius: "8px",
    p: "6px",
    transition: "all 180ms ease",
    "&:hover": {
      bgcolor: active ? "primary.dark" : "rgba(139,19,19,0.08)",
      color: active ? "#FFFFFF" : "primary.main",
    },
  });

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Nhập URL liên kết:", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.03)"
            : "rgba(139,19,19,0.025)",
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 0.75,
      }}
    >
      <Tooltip title="In đậm (Ctrl+B)">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleBold().run()}
          sx={btnSx(editor.isActive("bold"))}
        >
          <FormatBoldRounded sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="In nghiêng (Ctrl+I)">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          sx={btnSx(editor.isActive("italic"))}
        >
          <FormatItalicRounded sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Gạch chân (Ctrl+U)">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          sx={btnSx(editor.isActive("underline"))}
        >
          <FormatUnderlinedRounded sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5, borderColor: "divider" }} />

      <Tooltip title="Danh sách gạch đầu dòng">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          sx={btnSx(editor.isActive("bulletList"))}
        >
          <FormatListBulletedRounded sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Danh sách số">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          sx={btnSx(editor.isActive("orderedList"))}
        >
          <FormatListNumberedRounded sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Trích dẫn">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          sx={btnSx(editor.isActive("blockquote"))}
        >
          <FormatQuoteRounded sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5, borderColor: "divider" }} />

      <Tooltip title="Chèn liên kết">
        <IconButton
          size="small"
          onClick={setLink}
          sx={btnSx(editor.isActive("link"))}
        >
          <LinkRounded sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export default function AccountSettings() {
  const theme = useTheme();
  const pathname = usePathname();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyStep, setVerifyStep] = useState<1 | 2>(1);
  const [verifyOtp, setVerifyOtp] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifyInfo, setVerifyInfo] = useState('');

  const [profile, setProfile] = useState<ProfileData>({
    userName: "",
    hoTen: "",
    email: "",
    phoneNumber: "",
    phoneNumberConfirmed: false,
    ngaySinh: "",
    gioiTinh: 0,
    diaChi: "",
    tieuSu: "",
    anhDaiDien: "",
    chucVu: "",
    twoFactorEnabled: false,
    isGoogleAccount: false,
  });

  const [tempProfile, setTempProfile] = useState<ProfileData>({ ...profile });
  const [tieuSuError, setTieuSuError] = useState<string | null>(null);
  const [tieuSuWordCount, setTieuSuWordCount] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const tieuSuEditor = useEditor({
    extensions: TIEU_SU_EXTENSIONS,
    content: "",
    editable: false,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setTempProfile((prev) => ({ ...prev, tieuSu: html }));
      setTieuSuWordCount(countWords(html));
      setTieuSuError(validateTieuSu(html));
    },
  });

  const showNotification = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setShowSnackbar(true);
  };

  const fetchProfile = useCallback(async () => {
    try {
      setFetchLoading(true);
      const res = await apiService.get<Partial<ProfileData>>("/profile");
      if (res.status && res.data) {
        const data = res.data;
        const profileData: ProfileData = {
          userName: data.userName || "",
          hoTen: data.hoTen || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          phoneNumberConfirmed: Boolean(data.phoneNumberConfirmed),
          ngaySinh: data.ngaySinh || "",
          gioiTinh: data.gioiTinh !== undefined && data.gioiTinh !== null ? data.gioiTinh : 0,
          diaChi: data.diaChi || "",
          tieuSu: data.tieuSu || "",
          anhDaiDien: data.anhDaiDien || "",
          chucVu: data.chucVu || "",
          roles: Array.isArray(data.roles) ? data.roles : [],
          twoFactorEnabled: data.twoFactorEnabled || false,
          isGoogleAccount: Boolean(data.isGoogleAccount),
        };
        setProfile(profileData);
        setTempProfile(profileData);
        setTieuSuWordCount(countWords(profileData.tieuSu));
        setTieuSuError(null);
        setIsFirstLoad(false);
      }
    } catch {
      showNotification("Không thể tải thông tin hồ sơ", "error");
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!tieuSuEditor || isFirstLoad) return;
    if (!isEditing) {
      tieuSuEditor.commands.setContent(profile.tieuSu || "", {
        emitUpdate: false,
      });
    }
  }, [profile.tieuSu, tieuSuEditor, isEditing, isFirstLoad]);

  useEffect(() => {
    if (!tieuSuEditor) return;
    tieuSuEditor.setEditable(isEditing);
  }, [isEditing, tieuSuEditor]);

  const handleEditToggle = () => {
    if (!isEditing) {
      setTempProfile({ ...profile });
      tieuSuEditor?.commands.setContent(profile.tieuSu || "", {
        emitUpdate: false,
      });
    } else {
      tieuSuEditor?.commands.setContent(profile.tieuSu || "", {
        emitUpdate: false,
      });
    }
    setTieuSuWordCount(countWords(profile.tieuSu || ""));
    setTieuSuError(null);
    setIsEditing(!isEditing);
  };

  const handleSendPhoneOtp = async () => {
    setVerifyError('');
    setVerifyInfo('');
    setVerifyLoading(true);
    try {
      const res = await apiService.post<{ message?: string }>('/auth/send-phone-otp', {
        phoneNumber: profile.phoneNumber,
      });
      setVerifyInfo(res.message || 'Đã gửi mã xác minh.');
      setVerifyStep(2);
    } catch (err: unknown) {
      setVerifyError(typeof err === 'string' ? err : 'Không gửi được mã xác minh.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleConfirmPhoneOtp = async () => {
    setVerifyError('');
    setVerifyLoading(true);
    try {
      const res = await apiService.post<{ message?: string }>('/auth/confirm-phone-otp', {
        phoneNumber: profile.phoneNumber,
        otp: verifyOtp.trim(),
      });
      setProfile((prev) => ({ ...prev, phoneNumberConfirmed: true }));
      setSnackbarMessage(res.message || 'Xác minh số điện thoại thành công.');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
      closeVerifyDialog();
    } catch (err: unknown) {
      setVerifyError(typeof err === 'string' ? err : 'Xác minh thất bại.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const openVerifyDialog = () => {
    setVerifyStep(1);
    setVerifyOtp('');
    setVerifyError('');
    setVerifyInfo('');
    setVerifyOpen(true);
  };

  const closeVerifyDialog = () => {
    setVerifyOpen(false);
    setVerifyOtp('');
    setVerifyError('');
    setVerifyInfo('');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>,
  ) => {
    const { name, value } = e.target;
    setTempProfile((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification("Ảnh tải lên không được vượt quá 5MB", "error");
      return;
    }

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiService.post<UploadAvatarResponse>(
        "/profile/avatar",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (res.status && res.data?.url) {
        const newUrl = res.data.url;
        localStorage.setItem(`user_avatar_${profile.email}`, newUrl);
        window.dispatchEvent(new Event("avatar_updated"));
        setProfile((prev) => ({ ...prev, anhDaiDien: newUrl }));
        setTempProfile((prev) => ({ ...prev, anhDaiDien: newUrl }));
        showNotification("Cập nhật ảnh đại diện thành công!", "success");
      } else {
        showNotification(res.message || "Không thể tải ảnh lên", "error");
      }
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        localStorage.setItem(`user_avatar_${profile.email}`, base64);
        window.dispatchEvent(new Event("avatar_updated"));
        setTempProfile((prev) => ({ ...prev, anhDaiDien: base64 }));
        if (!isEditing) {
          setProfile((prev) => ({ ...prev, anhDaiDien: base64 }));
        }
      };
      reader.readAsDataURL(file);
      showNotification("Đã lưu ảnh tạm thời (chưa upload lên server)", "error");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    if (tempProfile.ngaySinh) {
      const selectedDate = new Date(tempProfile.ngaySinh);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        showNotification("Ngày sinh không được là ngày trong tương lai", "error");
        return;
      }
    }

    const tieuSuValidationError = validateTieuSu(tempProfile.tieuSu);
    if (tieuSuValidationError) {
      setTieuSuError(tieuSuValidationError);
      showNotification(tieuSuValidationError, "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userName: tempProfile.isGoogleAccount ? tempProfile.userName : profile.userName,
        hoTen: tempProfile.hoTen,
        email: profile.email,
        phoneNumber: tempProfile.phoneNumber,
        diaChi: tempProfile.diaChi,
        ngaySinh: tempProfile.ngaySinh,
        gioiTinh: tempProfile.gioiTinh,
        tieuSu: tempProfile.tieuSu,
      };

      const res = await apiService.put<ProfileData>("/profile", payload);
      if (res.status) {
        setProfile({ ...tempProfile });
        setIsEditing(false);
        showNotification("Cập nhật thông tin tài khoản thành công!", "success");
      } else {
        showNotification(res.message || "Cập nhật thất bại", "error");
      }
    } catch {
      showNotification("Có lỗi xảy ra khi cập nhật hồ sơ", "error");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(-2)
      .join("")
      .toUpperCase();
  };

  if (fetchLoading) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 2.8,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={4}
            sx={{
              mb: 4,
              pb: 4,
              borderBottom: "1px solid",
              borderColor: "divider",
              alignItems: "center",
            }}
          >
            <Skeleton variant="circular" width={110} height={110} />
            <Stack spacing={1} sx={{ flexGrow: 1 }}>
              <Skeleton variant="text" width={200} height={36} />
              <Skeleton variant="text" width={160} height={20} />
              <Skeleton variant="text" width={220} height={18} />
            </Stack>
            <Skeleton
              variant="rounded"
              width={120}
              height={40}
              sx={{ borderRadius: 999 }}
            />
          </Stack>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid size={{ xs: 12, sm: i === 5 || i === 6 ? 12 : 6 }} key={i}>
                <Stack spacing={0.75}>
                  <Skeleton variant="text" width={80} height={18} />
                  <Skeleton
                    variant="rounded"
                    height={i === 6 ? 100 : 50}
                    sx={{ borderRadius: 2.8 }}
                  />
                </Stack>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog
        open={verifyOpen}
        onClose={closeVerifyDialog}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '20px' } } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography sx={{ fontSize: 16.5, fontWeight: 900, color: 'text.primary' }}>
            Xác minh số điện thoại
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
              {verifyStep === 1
                ? `Hệ thống sẽ gửi một mã gồm 6 chữ số tới số ${profile.phoneNumber}. Sau khi xác minh, bạn có thể dùng số này để khôi phục mật khẩu.`
                : 'Nhập mã gồm 6 chữ số vừa nhận được. Mã có hiệu lực trong 5 phút.'}
            </Typography>

            {verifyInfo ? (
              <Alert severity="info" sx={{ borderRadius: 2, fontSize: 12.5 }}>
                {verifyInfo}
              </Alert>
            ) : null}
            {verifyError ? (
              <Alert severity="error" sx={{ borderRadius: 2, fontSize: 12.5 }}>
                {verifyError}
              </Alert>
            ) : null}

            {verifyStep === 2 ? (
              <TextField
                fullWidth
                autoFocus
                label="Mã xác minh"
                value={verifyOtp}
                onChange={(e) => setVerifyOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                slotProps={{
                  htmlInput: {
                    inputMode: 'numeric',
                    maxLength: 6,
                    style: { letterSpacing: 8, fontWeight: 800, fontSize: 20, textAlign: 'center' },
                  },
                }}
              />
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={closeVerifyDialog}
            sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'none' }}
          >
            Hủy
          </Button>
          {verifyStep === 1 ? (
            <Button
              variant="contained"
              disableElevation
              disabled={verifyLoading || !profile.phoneNumber}
              onClick={handleSendPhoneOtp}
              sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '10px' }}
            >
              {verifyLoading ? 'Đang gửi...' : 'Gửi mã xác minh'}
            </Button>
          ) : (
            <Button
              variant="contained"
              disableElevation
              disabled={verifyLoading || verifyOtp.length < 6}
              onClick={handleConfirmPhoneOtp}
              sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '10px' }}
            >
              {verifyLoading ? 'Đang xác minh...' : 'Xác nhận'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Card
        elevation={0}
        sx={{
          borderRadius: 2.8,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={4}
            sx={{
              mb: 4,
              pb: 4,
              borderBottom: "1px solid",
              borderColor: "divider",
              alignItems: "center",
            }}
          >
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={isEditing ? tempProfile.anhDaiDien : profile.anhDaiDien}
                sx={{
                  width: 110,
                  height: 110,
                  fontSize: 34,
                  fontWeight: 900,
                  border: "4px solid",
                  borderColor: "background.paper",
                  boxShadow: "0 8px 24px rgba(17,17,17,0.12)",
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  color: "#fff",
                }}
              >
                {getInitials(isEditing ? tempProfile.hoTen : profile.hoTen)}
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                style={{ display: "none" }}
              />
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  bgcolor: "primary.main",
                  color: "#fff",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                  width: 36,
                  height: 36,
                }}
              >
                {avatarUploading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <CameraAltRounded fontSize="small" />
                )}
              </IconButton>
            </Box>

            <Stack
              spacing={1}
              sx={{ textAlign: { xs: "center", sm: "left" }, flexGrow: 1 }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  color: "text.primary",
                  letterSpacing: "-0.5px",
                }}
              >
                {profile.hoTen || "Học viên EduVerse"}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 14, fontWeight: 700 }}>
                {profile.roles?.some(r => r.toLowerCase() === "personnel" || r.toLowerCase() === "nhanvien")
                  ? "Nhân viên kiểm duyệt"
                  : profile.roles?.some(r => r.toLowerCase() === "admin")
                  ? "Quản trị viên"
                  : profile.roles?.some(r => r.toLowerCase() === "giaovien" || r.toLowerCase() === "instructor")
                  ? "Giảng viên EduVerse"
                  : profile.chucVu || "Học viên EduVerse"}
              </Typography>
            </Stack>

            <Box>
              {!isEditing ? (
                <Button
                  variant="outlined"
                  startIcon={<EditRounded />}
                  onClick={handleEditToggle}
                  sx={{
                    px: 3,
                    py: 1.1,
                    borderRadius: 999,
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    color: "primary.main",
                    fontWeight: 800,
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  Chỉnh sửa
                </Button>
              ) : (
                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    startIcon={<CloseRounded />}
                    onClick={handleEditToggle}
                    disabled={loading}
                    sx={{
                      px: 2.5,
                      py: 1.1,
                      borderRadius: 999,
                      borderColor: "divider",
                      color: "text.secondary",
                      fontWeight: 800,
                      "&:hover": {
                        borderColor: "text.secondary",
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={
                      loading ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <SaveRounded />
                      )
                    }
                    onClick={handleSave}
                    disabled={loading}
                    sx={{
                      px: 3,
                      py: 1.1,
                      borderRadius: 999,
                      bgcolor: "primary.main",
                      boxShadow: (theme) =>
                        `0 8px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                      fontWeight: 800,
                      "&:hover": {
                        bgcolor: "primary.dark",
                        boxShadow: (theme) =>
                          `0 10px 24px ${alpha(theme.palette.primary.main, 0.26)}`,
                      },
                    }}
                  >
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </Stack>
              )}
            </Box>
          </Stack>

          <Grid container spacing={3}>
            {/* Row 1: Họ tên & Tên đăng nhập */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={0.75}>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "text.primary",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    height: 24,
                  }}
                >
                  <PersonRounded
                    fontSize="inherit"
                    sx={{ color: "rgba(25,23,28,0.4)" }}
                  />{" "}
                  Họ tên
                </Typography>
                <TextField
                  fullWidth
                  name="hoTen"
                  value={isEditing ? tempProfile.hoTen : profile.hoTen}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Nhập họ và tên"
                  slotProps={{
                    input: {
                      sx: {
                        borderRadius: 2.8,
                        bgcolor: !isEditing
                          ? "action.hover"
                          : "background.paper",
                        transition: "all 160ms ease",
                      },
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 46,
                      borderRadius: 2.8,
                      "& fieldset": {
                        borderColor: "rgba(17,17,17,0.08)",
                      },
                    },
                  }}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={0.75}>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "text.primary",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    height: 24,
                  }}
                >
                  <BadgeRounded
                    fontSize="inherit"
                    sx={{ color: "rgba(25,23,28,0.4)" }}
                  />{" "}
                  Tên đăng nhập
                </Typography>
                <TextField
                  fullWidth
                  name="userName"
                  value={isEditing ? tempProfile.userName : profile.userName}
                  onChange={handleChange}
                  disabled={!isEditing || !profile.isGoogleAccount}
                  placeholder="Tên đăng nhập hệ thống"
                  helperText={
                    !profile.isGoogleAccount
                      ? "Cố định khi đăng ký bằng tài khoản/mật khẩu"
                      : isEditing
                      ? "Bạn có thể đổi tên đăng nhập (tài khoản Google)"
                      : ""
                  }
                  slotProps={{
                    input: {
                      sx: {
                        borderRadius: 2.8,
                        bgcolor: !isEditing || !profile.isGoogleAccount
                          ? "action.hover"
                          : "background.paper",
                        transition: "all 160ms ease",
                      },
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 46,
                      borderRadius: 2.8,
                      "& fieldset": {
                        borderColor: "rgba(17,17,17,0.08)",
                      },
                    },
                    "& .MuiFormHelperText-root": {
                      fontSize: 11,
                      mt: 0.5,
                    },
                  }}
                />
              </Stack>
            </Grid>

            {/* Row 2: Email & Số điện thoại */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={0.75}>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "text.primary",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    height: 24,
                  }}
                >
                  <EmailRounded
                    fontSize="inherit"
                    sx={{ color: "rgba(25,23,28,0.4)" }}
                  />{" "}
                  Email
                </Typography>
                <TextField
                  fullWidth
                  name="email"
                  value={profile.email}
                  disabled
                  placeholder="example@gmail.com"
                  helperText="Email không thể thay đổi sau khi đăng ký tài khoản"
                  slotProps={{
                    input: {
                      sx: {
                        borderRadius: 2.8,
                        bgcolor: "action.hover",
                        transition: "all 160ms ease",
                      },
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 46,
                      borderRadius: 2.8,
                      "& fieldset": {
                        borderColor: "rgba(17,17,17,0.08)",
                      },
                    },
                    "& .MuiFormHelperText-root": {
                      fontSize: 11,
                      mt: 0.5,
                    },
                  }}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={0.75}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between", height: 24 }}>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "text.primary",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <PhoneRounded
                      fontSize="inherit"
                      sx={{ color: "rgba(25,23,28,0.4)" }}
                    />{" "}
                    Số điện thoại
                  </Typography>
                  {profile.phoneNumber ? (
                    profile.phoneNumberConfirmed ? (
                      <Chip
                        icon={<VerifiedRounded sx={{ fontSize: "14px !important" }} />}
                        label="Đã xác minh"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 11,
                          fontWeight: 800,
                          bgcolor: alpha("#059669", 0.12),
                          color: "#059669",
                          border: `1px solid ${alpha("#059669", 0.25)}`,
                          "& .MuiChip-icon": { color: "#059669" },
                        }}
                      />
                    ) : (
                      <Chip
                        icon={<ErrorOutlineRounded sx={{ fontSize: "14px !important" }} />}
                        label="Chưa xác minh"
                        size="small"
                        onClick={openVerifyDialog}
                        sx={{
                          height: 20,
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: "pointer",
                          bgcolor: alpha("#F59E0B", 0.14),
                          color: "#B45309",
                          border: `1px solid ${alpha("#F59E0B", 0.3)}`,
                          "& .MuiChip-icon": { color: "#B45309" },
                        }}
                      />
                    )
                  ) : null}
                </Stack>
                <TextField
                  fullWidth
                  name="phoneNumber"
                  value={isEditing ? tempProfile.phoneNumber : profile.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Nhập số điện thoại"
                  slotProps={{
                    input: {
                      sx: {
                        borderRadius: 2.8,
                        bgcolor: !isEditing
                          ? "action.hover"
                          : "background.paper",
                        transition: "all 160ms ease",
                      },
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 46,
                      borderRadius: 2.8,
                      "& fieldset": {
                        borderColor: "rgba(17,17,17,0.08)",
                      },
                    },
                  }}
                />
              </Stack>
            </Grid>

            {/* Row 3: Ngày sinh & Giới tính */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={0.75}>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "text.primary",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    height: 24,
                  }}
                >
                  <CakeRounded
                    fontSize="inherit"
                    sx={{ color: "rgba(25,23,28,0.4)" }}
                  />{" "}
                  Ngày sinh
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  name="ngaySinh"
                  value={isEditing ? tempProfile.ngaySinh : profile.ngaySinh}
                  onChange={handleChange}
                  disabled={!isEditing}
                  slotProps={{
                    htmlInput: {
                      max: new Date().toISOString().split("T")[0],
                    },
                    input: {
                      sx: {
                        borderRadius: 2.8,
                        bgcolor: !isEditing
                          ? "action.hover"
                          : "background.paper",
                        transition: "all 160ms ease",
                      },
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 46,
                      borderRadius: 2.8,
                      "& fieldset": {
                        borderColor: "rgba(17,17,17,0.08)",
                      },
                    },
                  }}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={0.75}>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "text.primary",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    height: 24,
                  }}
                >
                  <WcRounded
                    fontSize="inherit"
                    sx={{ color: "rgba(25,23,28,0.4)" }}
                  />{" "}
                  Giới tính
                </Typography>
                <FormControl fullWidth disabled={!isEditing}>
                  <Select
                    name="gioiTinh"
                    value={isEditing ? tempProfile.gioiTinh : profile.gioiTinh}
                    onChange={(e) =>
                      setTempProfile((prev) => ({
                        ...prev,
                        gioiTinh: Number(e.target.value),
                      }))
                    }
                    sx={{
                      height: 46,
                      borderRadius: 2.8,
                      bgcolor: !isEditing
                        ? "action.hover"
                        : "background.paper",
                      "& fieldset": {
                        borderColor: "rgba(17,17,17,0.08)",
                      },
                    }}
                  >
                    <MenuItem value={0}>Nữ</MenuItem>
                    <MenuItem value={1}>Nam</MenuItem>
                    <MenuItem value={2}>Khác</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>



            {/* Row 4: Tiểu sử (Chỉ hiển thị cho Giảng viên và Học viên) */}
            {!(
              pathname.startsWith("/admin") ||
              pathname.startsWith("/personnel") ||
              profile.roles?.some((r) =>
                ["admin", "personnel", "nhanvien"].includes(r.toLowerCase()),
              )
            ) && (
              <Grid size={{ xs: 12 }}>
                  <Stack spacing={0.75}>
                    <Stack
                      direction="row"
                      sx={{ height: 24, justifyContent: "space-between", alignItems: "center" }}
                    >
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "text.primary",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <DescriptionRounded
                          fontSize="inherit"
                          sx={{ color: "rgba(25,23,28,0.4)" }}
                        />{" "}
                        Tiểu sử
                      </Typography>
                      {isEditing && (
                        <Chip
                          size="small"
                          variant="outlined"
                          label={
                            tieuSuWordCount > 0 && tieuSuWordCount < TIEU_SU_MIN_WORDS
                              ? `${tieuSuWordCount} / ${TIEU_SU_MAX_WORDS} từ (cần ≥${TIEU_SU_MIN_WORDS})`
                              : `${tieuSuWordCount} / ${TIEU_SU_MAX_WORDS} từ`
                          }
                          sx={{
                            height: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            borderColor: tieuSuError
                              ? STATUS.error
                              : tieuSuWordCount > 0
                              ? "primary.main"
                              : "divider",
                            color: tieuSuError
                              ? STATUS.error
                              : tieuSuWordCount > 0
                              ? "primary.main"
                              : "text.secondary",
                            bgcolor: tieuSuError
                              ? "rgba(220,38,38,0.06)"
                              : tieuSuWordCount > 0
                              ? "rgba(139,19,19,0.04)"
                              : "transparent",
                          }}
                        />
                      )}
                    </Stack>

                    <Box
                      sx={{
                        borderRadius: 2.8,
                        border: "1px solid",
                        borderColor: tieuSuError
                          ? STATUS.error
                          : isEditing
                          ? "primary.main"
                          : "rgba(17,17,17,0.08)",
                        bgcolor: !isEditing
                          ? "action.hover"
                          : "background.paper",
                        transition: "all 160ms ease",
                        overflow: "hidden",
                        "& .ProseMirror": {
                          p: 2,
                          minHeight: 120,
                          outline: "none",
                          fontSize: 14,
                          lineHeight: 1.6,
                          color: "text.primary",
                          fontFamily: "inherit",
                          "& p.is-editor-empty:first-child::before": {
                            color: "text.secondary",
                            content: "attr(data-placeholder)",
                            float: "left",
                            height: 0,
                            pointerEvents: "none",
                            fontStyle: "italic",
                            opacity: 0.75,
                          },
                          "& blockquote": {
                            borderLeft: "3px solid",
                            borderColor: "primary.main",
                            pl: 1.5,
                            ml: 0,
                            my: 1,
                            fontStyle: "italic",
                            color: "text.secondary",
                            bgcolor: "rgba(139,19,19,0.03)",
                            py: 1,
                            borderRadius: "0 8px 8px 0",
                          },
                          "& ul, & ol": { pl: 2.5, my: 0.5 },
                          "& a": {
                            color: "primary.main",
                            fontWeight: 700,
                            textDecoration: "underline",
                          },
                        },
                      }}
                    >
                      {isEditing && <TieuSuToolbar editor={tieuSuEditor} />}
                      {isEditing ? (
                        <EditorContent editor={tieuSuEditor} />
                      ) : (
                        <Box
                          sx={{
                            p: 2,
                            minHeight: 46,
                            fontSize: 14,
                            lineHeight: 1.6,
                            color: "rgba(25, 23, 28, 0.45)", // Style xám mờ đồng bộ với các field disabled khác
                            "& p": { m: 0 },
                          }}
                          dangerouslySetInnerHTML={{
                            __html:
                              sanitizeHtml(profile.tieuSu) ||
                              "<p style='font-style: italic;'>Chưa có tiểu sử</p>",
                          }}
                        />
                      )}
                    </Box>

                    {tieuSuError && (
                      <Typography
                        variant="caption"
                        sx={{ color: STATUS.error, fontSize: 11.5, fontWeight: 700, pl: 0.5 }}
                      >
                        {tieuSuError}
                      </Typography>
                    )}
                  </Stack>
                </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
