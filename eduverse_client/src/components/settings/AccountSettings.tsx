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
} from "@mui/icons-material";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import DOMPurify from "dompurify";
import { apiService } from "@/src/services/index";

interface ProfileData {
  hoTen: string;
  email: string;
  phoneNumber: string;
  phoneNumberConfirmed: boolean;
  ngaySinh: string;
  diaChi: string;
  tieuSu: string;
  anhDaiDien: string;
  chucVu: string;
  twoFactorEnabled: boolean;
}

interface UploadAvatarResponse {
  url: string;
}

type SanitizeConfig = NonNullable<Parameters<typeof DOMPurify.sanitize>[1]>;

// Cấu hình cho phép của DOMPurify khi hiển thị nội dung Tiểu sử (HTML do Tiptap sinh ra)
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

// Lấy text thuần từ HTML để đếm số từ (bỏ thẻ HTML, khoảng trắng thừa)
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

// Tiểu sử không bắt buộc, nhưng nếu đã nhập thì phải từ 50 đến 1500 từ.
// Trả về null nếu hợp lệ, ngược lại trả về thông báo lỗi.
function validateTieuSu(html: string): string | null {
  const wordCount = countWords(html);
  if (wordCount === 0) return null; // để trống -> hợp lệ
  if (wordCount < TIEU_SU_MIN_WORDS) {
    return `Tiểu sử cần ít nhất ${TIEU_SU_MIN_WORDS} từ (hiện tại: ${wordCount} từ)`;
  }
  if (wordCount > TIEU_SU_MAX_WORDS) {
    return `Tiểu sử tối đa ${TIEU_SU_MAX_WORDS} từ (hiện tại: ${wordCount} từ)`;
  }
  return null;
}

// Toolbar đơn giản cho Tiptap
function TieuSuToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const btnSx = (active: boolean) => ({
    color: active ? "primary.main" : "text.secondary",
    bgcolor: active
      ? (theme: Theme) => alpha(theme.palette.primary.main, 0.1)
      : "transparent",
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
    <Stack
      direction="row"
      spacing={0.5}
      sx={{
        p: 0.5,
        borderBottom: "1px solid",
        borderColor: "divider",
        flexWrap: "wrap",
      }}
    >
      <Tooltip title="Đậm">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleBold().run()}
          sx={btnSx(editor.isActive("bold"))}
        >
          <FormatBoldRounded fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Nghiêng">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          sx={btnSx(editor.isActive("italic"))}
        >
          <FormatItalicRounded fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Gạch chân">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          sx={btnSx(editor.isActive("underline"))}
        >
          <FormatUnderlinedRounded fontSize="small" />
        </IconButton>
      </Tooltip>
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />
      <Tooltip title="Danh sách gạch đầu dòng">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          sx={btnSx(editor.isActive("bulletList"))}
        >
          <FormatListBulletedRounded fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Danh sách đánh số">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          sx={btnSx(editor.isActive("orderedList"))}
        >
          <FormatListNumberedRounded fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Trích dẫn">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          sx={btnSx(editor.isActive("blockquote"))}
        >
          <FormatQuoteRounded fontSize="small" />
        </IconButton>
      </Tooltip>
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />
      <Tooltip title="Chèn liên kết">
        <IconButton
          size="small"
          onClick={setLink}
          sx={btnSx(editor.isActive("link"))}
        >
          <LinkRounded fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

export default function AccountSettings() {
  const theme = useTheme();
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

  // ── Xác minh số điện thoại ──
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyStep, setVerifyStep] = useState<1 | 2>(1);
  const [verifyOtp, setVerifyOtp] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifyInfo, setVerifyInfo] = useState('');

  const [profile, setProfile] = useState<ProfileData>({
    hoTen: "",
    email: "",
    phoneNumber: "",
    phoneNumberConfirmed: false,
    ngaySinh: "",
    diaChi: "",
    tieuSu: "",
    anhDaiDien: "",
    chucVu: "",
    twoFactorEnabled: false,
  });

  const [tempProfile, setTempProfile] = useState<ProfileData>({ ...profile });
  const [tieuSuError, setTieuSuError] = useState<string | null>(null);
  const [tieuSuWordCount, setTieuSuWordCount] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Tiptap editor cho trường "Tiểu sử" (nội dung HTML)
  const tieuSuEditor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: "Giới thiệu ngắn gọn về bản thân...",
      }),
    ],
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

  // Fetch profile from API on mount
  const fetchProfile = useCallback(async () => {
    try {
      setFetchLoading(true);
      const res = await apiService.get<Partial<ProfileData>>("/profile");
      if (res.status && res.data) {
        const data = res.data;
        const profileData: ProfileData = {
          hoTen: data.hoTen || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          phoneNumberConfirmed: Boolean(data.phoneNumberConfirmed),
          ngaySinh: data.ngaySinh || "",
          diaChi: data.diaChi || "",
          tieuSu: data.tieuSu || "",
          anhDaiDien: data.anhDaiDien || "",
          chucVu: data.chucVu || "",
          twoFactorEnabled: data.twoFactorEnabled || false,
        };
        setProfile(profileData);
        setTempProfile(profileData);
        // Đồng bộ số từ / lỗi validate cho Tiểu sử ngay khi dữ liệu vừa tải xong,
        // để nếu người dùng bấm "Chỉnh sửa" ngay sau đó, state đã sẵn sàng chính xác.
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
    // fetchProfile() gọi setState (setFetchLoading, setProfile, ...) ngay khi effect
    // chạy lúc mount - đây là pattern data-fetching-on-mount chuẩn, không phải cascade
    // render ngoài ý muốn, nên tắt cảnh báo của rule set-state-in-effect ở đây.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, [fetchProfile]);

  // Đồng bộ nội dung editor (hệ thống ngoài React) mỗi khi profile được nạp/lưu.
  // Effect này CHỈ đồng bộ Tiptap editor, không setState nào khác được gọi ở đây
  // (word count / error đã được cập nhật sẵn ở nơi profile thực sự thay đổi:
  // fetchProfile khi tải dữ liệu, và onUpdate/handleEditToggle khi chỉnh sửa/hủy).
  useEffect(() => {
    if (!tieuSuEditor || isFirstLoad) return;
    if (!isEditing) {
      tieuSuEditor.commands.setContent(profile.tieuSu || "", {
        emitUpdate: false,
      });
    }
  }, [profile.tieuSu, tieuSuEditor, isEditing, isFirstLoad]);

  // Bật/tắt khả năng chỉnh sửa của editor theo trạng thái isEditing
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
      // Hủy chỉnh sửa: khôi phục lại nội dung gốc
      tieuSuEditor?.commands.setContent(profile.tieuSu || "", {
        emitUpdate: false,
      });
    }
    setTieuSuWordCount(countWords(profile.tieuSu || ""));
    setTieuSuError(null);
    setIsEditing(!isEditing);
  };

  // Gửi mã OTP tới số điện thoại đang lưu trong hồ sơ
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

  // Xác nhận mã OTP và đánh dấu số điện thoại đã xác minh
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

  // Upload avatar to backend (POST /api/profile/avatar)
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
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
      // Fallback to local preview if API fails
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

  // Save profile to backend (PUT /api/profile)
  const handleSave = async () => {
    // Validate Tiểu sử: không bắt buộc, nhưng nếu nhập thì phải 50-1500 từ
    const tieuSuValidationError = validateTieuSu(tempProfile.tieuSu);
    if (tieuSuValidationError) {
      setTieuSuError(tieuSuValidationError);
      showNotification(tieuSuValidationError, "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        hoTen: tempProfile.hoTen,
        email: tempProfile.email,
        phoneNumber: tempProfile.phoneNumber,
        diaChi: tempProfile.diaChi,
        ngaySinh: tempProfile.ngaySinh,
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

  // Loading skeleton
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

      {/* ── Hộp thoại xác minh số điện thoại ── */}
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
              <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                {profile.chucVu || "Học viên"}
              </Typography>
              <Typography
                sx={{ color: "primary.main", fontSize: 13, fontWeight: 700 }}
              >
                {profile.email}
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
                  value={isEditing ? tempProfile.email : profile.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="example@gmail.com"
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
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneRounded fontSize="inherit" sx={{ color: 'rgba(25,23,28,0.4)' }} /> Số điện thoại
                  </Typography>
                  {profile.phoneNumber ? (
                    profile.phoneNumberConfirmed ? (
                      <Chip
                        size="small"
                        icon={<VerifiedRounded sx={{ fontSize: 15 }} />}
                        label="Đã xác minh"
                        sx={{
                          height: 22,
                          fontSize: 11,
                          fontWeight: 800,
                          color: '#059669',
                          bgcolor: 'rgba(16,185,129,0.10)',
                          '& .MuiChip-icon': { color: '#059669' },
                        }}
                      />
                    ) : (
                      <Button
                        size="small"
                        onClick={openVerifyDialog}
                        startIcon={<ErrorOutlineRounded sx={{ fontSize: 15 }} />}
                        sx={{
                          minWidth: 0,
                          px: 1,
                          py: 0.2,
                          fontSize: 11.5,
                          fontWeight: 800,
                          textTransform: 'none',
                          borderRadius: '8px',
                          color: '#D97706',
                          bgcolor: 'rgba(245,158,11,0.10)',
                          '&:hover': { bgcolor: 'rgba(245,158,11,0.18)' },
                        }}
                      >
                        Chưa xác minh — Xác minh ngay
                      </Button>
                    )
                  ) : null}
                </Stack>
                <TextField
                  fullWidth
                  name="phoneNumber"
                  value={
                    isEditing ? tempProfile.phoneNumber : profile.phoneNumber
                  }
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
                    inputLabel: { shrink: true },
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
                      "& fieldset": {
                        borderColor: "rgba(17,17,17,0.08)",
                      },
                    },
                  }}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Stack spacing={0.75}>
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
                  <LocationOnRounded
                    fontSize="inherit"
                    sx={{ color: "rgba(25,23,28,0.4)" }}
                  />{" "}
                  Địa chỉ
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="diaChi"
                  value={isEditing ? tempProfile.diaChi : profile.diaChi}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Nhập địa chỉ của bạn"
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
                      "& fieldset": {
                        borderColor: "rgba(17,17,17,0.08)",
                      },
                    },
                  }}
                />
              </Stack>
            </Grid>

            {/* Tiểu sử: chỉnh sửa bằng Tiptap (rich text), hiển thị HTML đã sanitize bằng DOMPurify */}
            <Grid size={{ xs: 12 }}>
              <Stack spacing={0.75}>
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

                {isEditing ? (
                  <>
                    <Box
                      sx={{
                        borderRadius: 2.8,
                        border: "1px solid",
                        borderColor: tieuSuError
                          ? "error.main"
                          : "rgba(17,17,17,0.08)",
                        overflow: "hidden",
                        bgcolor: "background.paper",
                        "&:focus-within": {
                          borderColor: tieuSuError
                            ? "error.main"
                            : "primary.main",
                          boxShadow: (t) =>
                            `0 0 0 3px ${alpha(
                              tieuSuError
                                ? t.palette.error.main
                                : t.palette.primary.main,
                              0.12,
                            )}`,
                        },
                      }}
                    >
                      <TieuSuToolbar editor={tieuSuEditor} />
                      <Box
                        sx={{
                          px: 1.75,
                          py: 1.25,
                          minHeight: 96,
                          maxHeight: 260,
                          overflowY: "auto",
                          fontSize: 14,
                          lineHeight: 1.6,
                          "& .ProseMirror": { outline: "none" },
                          "& .ProseMirror p.is-editor-empty:first-of-type::before":
                            {
                              content: "attr(data-placeholder)",
                              color: "text.disabled",
                              float: "left",
                              height: 0,
                              pointerEvents: "none",
                            },
                          "& p": { m: 0, mb: 0.75 },
                          "& ul, & ol": { pl: 3, mb: 0.75 },
                          "& a": { color: theme.palette.primary.main },
                          "& blockquote": {
                            borderLeft: "3px solid",
                            borderColor: "divider",
                            pl: 1.5,
                            ml: 0,
                            color: "text.secondary",
                          },
                        }}
                      >
                        <EditorContent editor={tieuSuEditor} />
                      </Box>
                    </Box>
                    <Stack
                      direction="row"
                      sx={{
                        mt: 0.5,
                        px: 0.25,
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: tieuSuError ? "error.main" : "text.secondary",
                          fontWeight: tieuSuError ? 700 : 400,
                        }}
                      >
                        {tieuSuError ||
                          "Không bắt buộc — nếu nhập, cần 50–1500 từ"}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 12,
                          flexShrink: 0,
                          ml: 1,
                          color: tieuSuError ? "error.main" : "text.disabled",
                        }}
                      >
                        {tieuSuWordCount}/{TIEU_SU_MAX_WORDS} từ
                      </Typography>
                    </Stack>
                  </>
                ) : (
                  <Box
                    sx={{
                      borderRadius: 2.8,
                      bgcolor: "action.hover",
                      px: 1.75,
                      py: 1.25,
                      minHeight: 96,
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: profile.tieuSu ? "text.primary" : "text.disabled",
                      "& p": { m: 0, mb: 0.75 },
                      "& ul, & ol": { pl: 3, mb: 0.75 },
                      "& a": { color: "primary.main" },
                      "& blockquote": {
                        borderLeft: "3px solid",
                        borderColor: "divider",
                        pl: 1.5,
                        ml: 0,
                        color: "text.secondary",
                      },
                    }}
                    dangerouslySetInnerHTML={{
                      __html: profile.tieuSu
                        ? sanitizeHtml(profile.tieuSu)
                        : "Giới thiệu ngắn gọn về bản thân...",
                    }}
                  />
                )}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
