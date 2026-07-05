/* eslint-disable @typescript-eslint/no-explicit-any */

// src/app/instructor/manager-courses/components/CourseDetailPanel.tsx
"use client";

import { useCallback, useEffect, useState, useRef } from "react";
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
import { KhoaHocType } from "../types";
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
  isPendingApproval,
  statusChip,
  isApproved,
  resolveApiResult,
  TEXT_GRAY,
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
  const [changing, setChanging] = useState(false);
  const [contentStats, setContentStats] = useState({ phan: 0, baiGiang: 0 });
  const handleStatsChange = useCallback(
    (phan: number, baiGiang: number) => setContentStats({ phan, baiGiang }),
    [],
  );

  const [changeCount, setChangeCount] = useState(0);
  const [lockExpiry, setLockExpiry] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentCourse(initialCourse);
  }, [initialCourse]);

  useEffect(() => {
    if (!lockExpiry) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRemainingSeconds(0);
      setIsLocked(false);
      return;
    }
    const updateLock = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((lockExpiry - now) / 1000));
      setRemainingSeconds(remaining);
      setIsLocked(remaining > 0);
      if (remaining === 0) {
        setLockExpiry(null);
        clearInterval(interval);
      }
    };
    updateLock();
    const interval = setInterval(updateLock, 1000);
    return () => clearInterval(interval);
  }, [lockExpiry]);

  const draft = isDraftCourse(currentCourse);
  const current = isCurrentVersion(currentCourse);
  const isLockedApproved = isLockedApprovedCourse(currentCourse);
  const isDangSua = currentCourse.trangThaiPheDuyet === "DangSua";
  const isChoDuyet = currentCourse.trangThaiPheDuyet === "ChoDuyet";
  const isDaDuyet = currentCourse.trangThaiPheDuyet === "DaDuyet";
  const isPending = isPendingApproval(currentCourse.trangThaiPheDuyet);

  const canEditContent = currentCourse.daDangKy === true && !isLockedApproved;
  const baseKhoaHocId = draft ? currentCourse.idBanGhiTruoc : currentCourse.id;

  const canSubmit = !isLockedApproved && (isDangSua || draft);
  const canEdit = !isLockedApproved && isChoDuyet;
  const canPublish = isDaDuyet && draft;
  const canCreateDraftFromApproved = isLockedApproved;

  const lockMinutes = Math.floor(remainingSeconds / 60);
  const lockSeconds = remainingSeconds % 60;
  const lockDisplay = `${lockMinutes}:${lockSeconds.toString().padStart(2, "0")}`;

  const updateCourseLocal = (updated: KhoaHocType) => {
    setCurrentCourse(updated);
    if (onCourseUpdate) onCourseUpdate(updated);
  };

  const handleSuccessfulStatusChange = () => {
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    const newCount = changeCount + 1;
    setChangeCount(newCount);
    if (newCount >= 5) {
      setLockExpiry(Date.now() + 5 * 60 * 1000);
      setChangeCount(0);
      show("Bạn đã chuyển trạng thái quá nhiều lần. Tạm khoá 5 phút.", "error");
    } else {
      resetTimeoutRef.current = setTimeout(() => setChangeCount(0), 60 * 1000);
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
      const { ok, data, errorMsg: apiErr } = resolveApiResult(result);
      if (ok) {
        if (data) updateCourseLocal(data);
        else if (optimisticStatus)
          updateCourseLocal({ ...currentCourse, ...optimisticStatus });
        show(successMsg);
        onRefresh();
        handleSuccessfulStatusChange();
      } else {
        show(apiErr ?? errorMsg, "error");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || errorMsg;
      show(msg, "error");
    } finally {
      setChanging(false);
    }
  };

  const handleChuyenTTChoDuyet = () =>
    handleStatusChange(
      () => khoaHocSvc.ChuyenTTChoDuyetBatch([currentCourse.id!]),
      "Đã gửi yêu cầu phê duyệt",
      "Lỗi chuyển trạng thái",
      { trangThaiPheDuyet: "ChoDuyet" },
    );

  const handleChuyenTTDangSua = () =>
    handleStatusChange(
      () => khoaHocSvc.ChuyenTTDangSuaBatch([currentCourse.id!]),
      "Đã chuyển sang Đang sửa",
      "Lỗi chuyển trạng thái",
      { trangThaiPheDuyet: "DangSua" },
    );

  const minutes = Math.floor((currentCourse.tongThoiLuong ?? 0) / 60);

  return (
    <Box sx={{ animation: `${fadeIn} 0.3s ease` }}>
      {/* Header */}
      {/* Header */}
      <Box sx={{ display: "flex", gap: 3, mb: 4, alignItems: "center" }}>
        <Box
          sx={{
            width: 120,
            height: 80,
            borderRadius: "8px",
            overflow: "hidden",
            flexShrink: 0,
            bgcolor: "rgba(141, 19, 19, 0.04)",
            border: "1px solid rgba(141, 19, 19, 0.08)",
            boxShadow: "0 4px 12px rgba(141, 19, 19, 0.03)",
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
            sx={{
              fontWeight: 900,
              fontSize: 18,
              mb: 1,
              lineHeight: 1.3,
              color: "#1F2937",
              fontFamily: '"Be Vietnam Pro", sans-serif',
            }}
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

          <Stack
            direction="row"
            spacing={1}
            sx={{ flexWrap: "wrap", gap: 0.5 }}
          >
            {statusChip(currentCourse.trangThaiPheDuyet)}
            {statusChip(currentCourse.trangThai)}
            {isApproved(currentCourse.trangThaiPheDuyet) && (
              <Chip
                label="✅ Đã duyệt"
                size="small"
                sx={{
                  fontSize: "0.6rem",
                  height: 18,
                  bgcolor: "#e8f5e9",
                  color: "#2e7d32",
                }}
              />
            )}
            {(currentCourse as any).danhSachDanhMuc?.map((dm: any) => (
              <Chip
                key={dm.id}
                icon={
                  <CategoryIcon
                    sx={{ fontSize: 12, color: `${R} !important` }}
                  />
                }
                label={dm.tenDanhMuc}
                size="small"
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  height: 24,
                  bgcolor: "rgba(141, 19, 19, 0.05)",
                  color: R,
                  border: "1px solid rgba(141, 19, 19, 0.1)",
                }}
              />
            ))}
            <Chip
              icon={
                <PeopleIcon sx={{ fontSize: 12, color: "#666 !important" }} />
              }
              label={`${currentCourse.soLuongHocVien ?? 0} Học viên`}
              size="small"
              sx={{
                fontSize: "0.72rem",
                fontWeight: 600,
                height: 24,
                bgcolor: "#fcfbf9",
                color: "#555",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            />
            {minutes > 0 && (
              <Chip
                icon={
                  <AccessTimeIcon
                    sx={{ fontSize: 12, color: "#666 !important" }}
                  />
                }
                label={fmtTime(currentCourse.tongThoiLuong)}
                size="small"
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  height: 24,
                  bgcolor: "#fcfbf9",
                  color: "#555",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              />
            )}
            <Chip
              icon={
                <MenuBookIcon sx={{ fontSize: 12, color: "#666 !important" }} />
              }
              label={`${currentCourse.tongBaiGiang ?? 0} Bài học`}
              size="small"
              sx={{
                fontSize: "0.72rem",
                fontWeight: 600,
                height: 24,
                bgcolor: "#fcfbf9",
                color: "#555",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            />
          </Stack>
        </Box>
      </Box>

      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 2.5, flexWrap: "wrap", gap: 1.5 }}
        useFlexGap
      >
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
                Tạo bản nháp
              </OutlineBtn>
            </span>
          </Tooltip>
        )}
        {changing && (
          <CircularProgress size={20} sx={{ color: R, alignSelf: "center" }} />
        )}
      </Stack>

      {isLocked && (
        <Typography sx={{ fontSize: 13, color: "#d32f2f", mt: 1 }}>
          ⛔ Tạm khoá chuyển trạng thái ({lockDisplay})
        </Typography>
      )}
      {isLockedApproved && (
        <Typography sx={{ fontSize: 12, color: TEXT_GRAY, mb: 2 }}>
          Đây là bản đã duyệt và đang công khai. Chỉnh sửa nội dung bên dưới sẽ
          áp dụng trực tiếp lên bản đang công khai — hoặc bạn có thể nhấn
          &quot;Tạo bản nháp&quot; nếu muốn thử nghiệm thay đổi riêng trước khi
          công khai.
        </Typography>
      )}
      {isPending && (
        <Typography sx={{ fontSize: 12, color: "#e65100", mb: 2 }}>
          Khóa học đang ở trạng thái {isChoDuyet ? "Chờ duyệt" : "Đang duyệt"},
          không thể chỉnh sửa nội dung.
          {isChoDuyet &&
            ` Nhấn "Sửa tiếp" để chuyển về Đang sửa trước khi chỉnh sửa.`}
        </Typography>
      )}
      {draft && currentCourse.isBanHienTai !== true && (
        <Typography sx={{ fontSize: 12, color: TEXT_GRAY, mb: 2 }}>
          Đây là bản nháp (chưa phải bản hiện tại), không thể thêm/sửa phần học
          cho tới khi bản nháp này được duyệt và trở thành bản chính.
        </Typography>
      )}

      <Divider sx={{ my: 3, borderColor: "rgba(141, 19, 19, 0.08)" }} />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2.5,
        }}
      >
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: 16,
            color: R,
            fontFamily: '"Be Vietnam Pro", sans-serif',
          }}
        >
          Nội dung khóa học
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#777", fontWeight: 600 }}>
          {contentStats.phan} phần · {contentStats.baiGiang} bài giảng
        </Typography>
      </Box>

      {baseKhoaHocId ? (
        <PhanSection
          khoaHocId={baseKhoaHocId}
          canEdit={canEditContent}
          onStatsChange={handleStatsChange}
        />
      ) : (
        <Typography sx={{ fontSize: 12.5, color: "#d32f2f", py: 1 }}>
          Không xác định ID khóa học.
        </Typography>
      )}

      {ToastComponent}
    </Box>
  );
}
