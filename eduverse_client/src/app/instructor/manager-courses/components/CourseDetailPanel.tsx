/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/instructor/manager-courses/components/CourseDetailPanel.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  CircularProgress,
  Divider,
  Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SchoolIcon from "@mui/icons-material/School";
import EditNoteIcon from "@mui/icons-material/EditNote";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PeopleIcon from "@mui/icons-material/People";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CategoryIcon from "@mui/icons-material/Category";

import KhoaHocService from "@/src/services/KhoaHocService";
import { KhoaHocType, PhanHocType } from "../types";
import {
  R,
  RedBtn,
  OutlineBtn,
  fadeIn,
  fmtTime,
  isValidImg,
  isDraftCourse,
  isCurrentVersion,
  isLockedApprovedCourse,
  statusChip,
} from "../types/constants";
import { useToast } from "./useToast";
import { PhanSection } from "./PhanSection";

const khoaHocSvc = new KhoaHocService();

interface CourseDetailPanelProps {
  course: KhoaHocType;
  onRefresh: () => void;
  onEdit: () => void;
  onCourseUpdate?: (updatedCourse: KhoaHocType) => void;
}

export function CourseDetailPanel({
  course: initialCourse,
  onRefresh,
  onEdit,
  onCourseUpdate,
}: CourseDetailPanelProps) {
  const { show, ToastComponent } = useToast();
  const [currentCourse, setCurrentCourse] =
    useState<KhoaHocType>(initialCourse);
  const [phanList, setPhanList] = useState<PhanHocType[]>(
    (initialCourse as any).danhSachPhanHoc ?? [],
  );
  const [changing, setChanging] = useState(false);

  // --- State cho chức năng khoá chuyển trạng thái ---
  const [changeCount, setChangeCount] = useState(0);
  const [lockExpiry, setLockExpiry] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentCourse(initialCourse);
    setPhanList((initialCourse as any).danhSachPhanHoc ?? []);
  }, [initialCourse]);

  // Đếm ngược thời gian khoá
  useEffect(() => {
    if (!lockExpiry) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRemainingSeconds(0);
      return;
    }
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((lockExpiry - Date.now()) / 1000),
      );
      setRemainingSeconds(remaining);
      if (remaining === 0) {
        setLockExpiry(null);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockExpiry]);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const draft = isDraftCourse(currentCourse);
  const current = isCurrentVersion(currentCourse);
  const isLockedApproved = isLockedApprovedCourse(currentCourse);
  const isDangSua = currentCourse.trangThaiPheDuyet === "DangSua";
  const isChoDuyet = currentCourse.trangThaiPheDuyet === "ChoDuyet";
  const isDaDuyet = currentCourse.trangThaiPheDuyet === "DaDuyet";

  const canEditContent = currentCourse.daDangKy === true && !isLockedApproved;
  const baseKhoaHocId = draft ? currentCourse.idBanGhiTruoc : currentCourse.id;

  const canSubmit = !isLockedApproved && (isDangSua || draft);
  const canEdit = !isLockedApproved && isChoDuyet;
  const canPublish = isDaDuyet && draft;
  const canCreateDraftFromApproved = isLockedApproved;

  const isLocked = lockExpiry !== null && currentTime < lockExpiry;
  const lockMinutes = Math.floor(remainingSeconds / 60);
  const lockSeconds = remainingSeconds % 60;
  const lockDisplay = `${lockMinutes}:${lockSeconds.toString().padStart(2, "0")}`;

  const updateCourseLocal = (updated: KhoaHocType) => {
    setCurrentCourse(updated);
    setPhanList((updated as any).danhSachPhanHoc ?? []);
    if (onCourseUpdate) onCourseUpdate(updated);
  };

  /**
   * Kiểm tra response có thành công không.
   * API có thể trả nhiều shape khác nhau:
   *   - { success: true, data: {...} }
   *   - { status: true/200, data: {...} }
   *   - { data: {...} }          → không có success field, chỉ cần data tồn tại
   *   - truthy object không null → coi là thành công (API đã throw nếu lỗi)
   */
  function resolveApiResult(result: any): {
    ok: boolean;
    data: KhoaHocType | null;
    errorMsg: string | null;
  } {
    if (!result)
      return {
        ok: false,
        data: null,
        errorMsg: "Không có phản hồi từ máy chủ",
      };

    const explicitFail =
      result.success === false ||
      (typeof result.status === "number" && result.status >= 400);
    if (explicitFail) {
      const msg =
        result.message ||
        (Array.isArray(result.errors)
          ? result.errors.join(", ")
          : result.errors) ||
        null;
      return { ok: false, data: null, errorMsg: msg };
    }

    const data: KhoaHocType | null =
      result.data ?? result.result ?? result.khoaHoc ?? null;

    return { ok: true, data, errorMsg: null };
  }

  // --- Hàm xử lý tăng đếm chuyển trạng thái ---
  const handleSuccessfulStatusChange = () => {
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);

    const newCount = changeCount + 1;
    setChangeCount(newCount);

    if (newCount >= 5) {
      setLockExpiry(Date.now() + 5 * 60 * 1000);
      setChangeCount(0);
      show("Bạn đã chuyển trạng thái quá nhiều lần. Tạm khoá 5 phút.", "error");
    } else {
      resetTimeoutRef.current = setTimeout(() => {
        setChangeCount(0);
      }, 60 * 1000);
    }
  };

  const handleStatusChange = async (
    apiCall: () => Promise<any>,
    successMsg: string,
    errorMsg: string,
    optimisticStatus?: Partial<KhoaHocType>,
  ) => {
    if (changing || isLocked) return;
    setChanging(true);
    try {
      const result = await apiCall();
      console.log("API response:", result);

      const { ok, data, errorMsg: apiErr } = resolveApiResult(result);

      if (ok) {
        if (data) {
          updateCourseLocal(data);
        } else if (optimisticStatus) {
          const patched: KhoaHocType = {
            ...currentCourse,
            ...optimisticStatus,
          };
          updateCourseLocal(patched);
        }
        show(successMsg);
        onRefresh();
        // ✅ Tăng đếm sau khi thành công
        handleSuccessfulStatusChange();
      } else {
        show(apiErr ?? errorMsg, "error");
      }
    } catch (error: any) {
      console.error("Lỗi chuyển trạng thái:", error);
      const msg = error?.response?.data?.message || error?.message || errorMsg;
      show(msg, "error");
    } finally {
      setChanging(false);
    }
  };

  const handleChuyenTTChoDuyet = () => {
    handleStatusChange(
      () => khoaHocSvc.ChuyenTTChoDuyet(currentCourse.id!),
      "Đã gửi yêu cầu phê duyệt",
      "Lỗi chuyển trạng thái",
      { trangThaiPheDuyet: "ChoDuyet" },
    );
  };

  const handleChuyenTTDangSua = () => {
    handleStatusChange(
      () => khoaHocSvc.ChuyenTTDangSua(currentCourse.id!),
      "Đã chuyển sang trạng thái Đang sửa",
      "Lỗi chuyển trạng thái",
      { trangThaiPheDuyet: "DangSua" },
    );
  };
  // Chua có API cho PublishDraft, nên tạm comment lại

  // const handlePublishDraft = () => {
  //   handleStatusChange(
  //     () => khoaHocSvc.PublishDraft(currentCourse.id!),
  //     "Đã xuất bản bản nháp thành công",
  //     "Lỗi xuất bản",
  //     { trangThaiPheDuyet: "DaDuyet" },
  //   );
  // };

  const minutes = Math.floor((currentCourse.tongThoiLuong ?? 0) / 60);

  return (
    <Box sx={{ animation: `${fadeIn} 0.3s ease` }}>
      {/* Header */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Box
          sx={{
            width: 96,
            height: 68,
            borderRadius: 2,
            overflow: "hidden",
            flexShrink: 0,
            bgcolor: "#fde8e8",
          }}
        >
          {isValidImg(currentCourse.hinhAnhKhoaHoc) ? (
            <img
              src={currentCourse.hinhAnhKhoaHoc!}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SchoolIcon sx={{ color: alpha(R, 0.3), fontSize: 28 }} />
            </Box>
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{ fontWeight: 800, fontSize: 15, mb: 0.5, lineHeight: 1.3 }}
          >
            {currentCourse.tieuDe}
            {draft && (
              <Chip
                label="Bản nháp"
                size="small"
                sx={{
                  ml: 1,
                  fontSize: "0.6rem",
                  height: 18,
                  bgcolor: "#fff3e0",
                  color: "#e65100",
                }}
              />
            )}
            {current && !draft && (
              <Chip
                label="Bản chính"
                size="small"
                sx={{
                  ml: 1,
                  fontSize: "0.6rem",
                  height: 18,
                  bgcolor: "#e8f5e9",
                  color: "#2e7d32",
                }}
              />
            )}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap",gap: 0.5 }}>
            {statusChip(currentCourse.trangThaiPheDuyet)}
            {statusChip(currentCourse.trangThai)}
            {(currentCourse as any).danhSachDanhMuc?.map((dm: any) => (
              <Chip
                key={dm.id}
                icon={<CategoryIcon sx={{ fontSize: 11 }} />}
                label={dm.tenDanhMuc}
                size="small"
                sx={{
                  fontSize: "0.65rem",
                  height: 20,
                  bgcolor: alpha(R, 0.08),
                  color: R,
                }}
              />
            ))}
            <Chip
              icon={<PeopleIcon sx={{ fontSize: 11 }} />}
              label={`${currentCourse.soLuongHocVien ?? 0} HV`}
              size="small"
              sx={{ fontSize: "0.65rem", height: 20, bgcolor: "#f5f5f5" }}
            />
            {minutes > 0 && (
              <Chip
                icon={<AccessTimeIcon sx={{ fontSize: 11 }} />}
                label={fmtTime(currentCourse.tongThoiLuong)}
                size="small"
                sx={{ fontSize: "0.65rem", height: 20, bgcolor: "#f5f5f5" }}
              />
            )}
            <Chip
              icon={<MenuBookIcon sx={{ fontSize: 11 }} />}
              label={`${currentCourse.tongBaiGiang ?? 0} bài`}
              size="small"
              sx={{ fontSize: "0.65rem", height: 20, bgcolor: "#f5f5f5" }}
            />
          </Stack>
        </Box>
      </Box>

      <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
        {canSubmit && (
          <Tooltip title={isLocked ? `Bị khoá (${lockDisplay})` : ""}>
            <span>
              <RedBtn
                startIcon={<SendIcon />}
                onClick={handleChuyenTTChoDuyet}
                disabled={changing || isLocked}
              >
                Gửi phê duyệt
              </RedBtn>
            </span>
          </Tooltip>
        )}
        {canEdit && (
          <Tooltip title={isLocked ? `Bị khoá (${lockDisplay})` : ""}>
            <span>
              <OutlineBtn
                startIcon={<EditNoteIcon />}
                onClick={handleChuyenTTDangSua}
                disabled={changing || isLocked}
              >
                Sửa tiếp
              </OutlineBtn>
            </span>
          </Tooltip>
        )}
        {canPublish && (
          <Tooltip title={isLocked ? `Bị khoá (${lockDisplay})` : ""}>
            <span>
              <RedBtn
                startIcon={<CheckCircleIcon />}
                // onClick={handlePublishDraft}
                disabled={changing || isLocked}
              >
                Xuất bản bản nháp
              </RedBtn>
            </span>
          </Tooltip>
        )}
        {canCreateDraftFromApproved && (
          <Tooltip title={isLocked ? `Bị khoá (${lockDisplay})` : ""}>
            <span>
              <OutlineBtn
                startIcon={<EditNoteIcon />}
                onClick={onEdit}
                disabled={changing || isLocked}
              >
                Tạo bản nháp để sửa
              </OutlineBtn>
            </span>
          </Tooltip>
        )}
        {changing && (
          <CircularProgress size={20} sx={{ color: R, alignSelf: "center" }} />
        )}
      </Stack>

      {/* Hiển thị thông báo khoá */}
      {isLocked && (
        <Typography sx={{ fontSize: 13, color: "#d32f2f", mt: 1 }}>
          ⛔ Tạm khoá chuyển trạng thái ({lockDisplay})
        </Typography>
      )}

      {isLockedApproved && (
        <Typography sx={{ fontSize: 12, color: "#999", mb: 2 }}>
          Đây là bản đã duyệt và đang công khai. Để chỉnh sửa nội dung, hãy tạo
          bản nháp — các thay đổi sẽ không ảnh hưởng tới bản đang chạy cho đến
          khi bạn xuất bản.
        </Typography>
      )}
      {isChoDuyet && !isLockedApproved && (
        <Typography sx={{ fontSize: 12, color: "#e65100", mb: 2 }}>
          Khóa học đang ở trạng thái Chờ duyệt. Bạn vẫn có thể chỉnh sửa nội
          dung nhưng trạng thái sẽ không tự động thay đổi.
        </Typography>
      )}

      <Divider sx={{ mb: 2, borderColor: "#fde8e8" }} />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 14, color: R }}>
          Nội dung khóa học
        </Typography>
        <Typography sx={{ fontSize: 12, color: "#999" }}>
          {phanList.length} phần ·{" "}
          {phanList.reduce(
            (s, p) => s + ((p as any).danhSachBaiGiang?.length ?? 0),
            0,
          )}{" "}
          bài giảng
        </Typography>
      </Box>

      <PhanSection
        khoaHocId={baseKhoaHocId!}
        items={phanList}
        onRefresh={onRefresh}
        canEdit={canEditContent}
      />

      {ToastComponent}
    </Box>
  );
}
