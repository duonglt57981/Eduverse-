import Swal from "sweetalert2";
import { STATUS } from "@/src/theme/tokens";

/**
 * Hiển thị hộp thoại xác nhận đăng xuất chuẩn phong cách Chuyên nghiệp / Enterprise (Linear / Vercel design).
 */
export const handleConfirmLogout = async (onConfirm: () => void | Promise<void>) => {
  const result = await Swal.fire({
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: 4px 4px 0 4px;">
        <div style="width: 56px; height: 56px; border-radius: 16px; background-color: #FEF2F2; border: 1px solid #FEE2E2; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.08);">
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${STATUS.error}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </div>
        <h3 style="font-size: 19px; font-weight: 800; color: #111827; margin: 0 0 8px 0; font-family: var(--ev-font-family), sans-serif; letter-spacing: -0.3px;">
          Xác nhận đăng xuất
        </h3>
        <p style="font-size: 14px; font-weight: 500; color: #6B7280; margin: 0 0 24px 0; font-family: var(--ev-font-family), sans-serif; line-height: 1.55; max-width: 320px;">
          Bạn có chắc chắn muốn rời khỏi phiên làm việc? Mọi tiến trình học tập của bạn đều đã được lưu an toàn.
        </p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Đăng xuất",
    cancelButtonText: "Quay lại",
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      container: "ev-swal-container",
      popup: "ev-swal-popup",
      confirmButton: "ev-swal-confirm-btn",
      cancelButton: "ev-swal-cancel-btn",
      actions: "ev-swal-actions",
    },
  });

  if (result.isConfirmed) {
    await onConfirm();
  }
};
