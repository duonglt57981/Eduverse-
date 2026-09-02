import { ThongBao } from "@/src/types/thongbao";

/**
 * Resolves the destination URL for a given notification.
 * Handles explicit links, corrects legacy/outdated route patterns,
 * and infers the correct target page based on notification type, title, content, itemId, and user role.
 */
export function resolveNotificationUrl(
  notification: ThongBao,
  currentPath: string = "",
  userRoles: string[] = []
): string {
  const rawLink = notification.link?.trim();
  const loai = (notification.loaiThongBao || notification.type || "").toLowerCase();
  const tieuDe = (notification.tieuDe || "").toLowerCase();
  const noiDung = (notification.noiDung || notification.message || "").toLowerCase();
  const itemId = notification.itemId;

  const isInstructor =
    currentPath.startsWith("/instructor") ||
    userRoles.includes("GiaoVien") ||
    userRoles.includes("Instructor") ||
    userRoles.includes("GiangVien");

  const isAdmin =
    currentPath.startsWith("/admin") ||
    userRoles.includes("Admin") ||
    userRoles.includes("QuanTriVien");

  const isPersonnel =
    currentPath.startsWith("/personnel") ||
    userRoles.includes("Personnel") ||
    userRoles.includes("NhanVien") ||
    userRoles.includes("KiemDuyet");

  // 1. External HTTP(S) links
  if (rawLink && /^https?:\/\//i.test(rawLink)) {
    return rawLink;
  }

  // 2. Normalization of existing relative link patterns
  if (rawLink) {
    const link = rawLink.startsWith("/") ? rawLink : `/${rawLink}`;

    // Fix: /instructor/courses/{id}/qna... -> /instructor/manager-courses/{id}/manager/qna...
    const instructorQnaMatch = link.match(
      /^\/instructor\/courses\/([^/]+)\/qna(\?.*)?$/i
    );
    if (instructorQnaMatch) {
      const courseId = instructorQnaMatch[1];
      const query = instructorQnaMatch[2] || "";
      return `/instructor/manager-courses/${courseId}/manager/qna${query}`;
    }

    // Fix: /instructor/courses/{id}/manager/... -> /instructor/manager-courses/{id}/manager/...
    const legacyManagerMatch = link.match(
      /^\/instructor\/courses\/([^/]+)\/manager(.*)$/i
    );
    if (legacyManagerMatch) {
      return `/instructor/manager-courses/${legacyManagerMatch[1]}/manager${legacyManagerMatch[2] || ""}`;
    }

    // Fix: /instructor/courses/{id} -> /instructor/manager-courses/{id}/manager/basics
    const courseDetailMatch = link.match(/^\/instructor\/courses\/([^/]+)$/i);
    if (courseDetailMatch) {
      return `/instructor/manager-courses/${courseDetailMatch[1]}/manager/basics`;
    }

    // Fix: /instructor/courses -> /instructor/manager-courses
    if (link === "/instructor/courses" || link === "/instructor/courses/") {
      return "/instructor/manager-courses";
    }

    // Fix: /instructor/invites/{id} -> /instructor/invites
    if (link.startsWith("/instructor/invites")) {
      return "/instructor/invites";
    }

    // Fix: /instructor/revenue -> /instructor/money
    if (link === "/instructor/revenue" || link.startsWith("/instructor/revenue")) {
      return "/instructor/money";
    }

    // Fix: /instructor/students -> /instructor/manager-courses/{id}/manager/performance or /instructor/manager-courses
    if (link.startsWith("/instructor/students")) {
      if (itemId) {
        return `/instructor/manager-courses/${itemId}/manager/performance`;
      }
      return "/instructor/manager-courses";
    }

    // Fix: /khoa-hoc/{id} -> /student/enroll-courses/{id}
    const publicCourseMatch = link.match(/^\/khoa-hoc\/([^/]+)$/i);
    if (publicCourseMatch) {
      return `/student/enroll-courses/${publicCourseMatch[1]}`;
    }

    // If already a valid application route
    if (
      link.startsWith("/instructor/") ||
      link.startsWith("/student/") ||
      link.startsWith("/admin/") ||
      link.startsWith("/personnel/")
    ) {
      return link;
    }
  }

  // 3. Fallback inference based on notification properties

  // ─── ADMIN & PERSONNEL ───
  if (
    isAdmin ||
    isPersonnel ||
    loai.includes("admin") ||
    loai.includes("kiemduyet") ||
    loai.includes("pheduyet")
  ) {
    if (
      loai.includes("ruttien") ||
      tieuDe.includes("rút tiền") ||
      noiDung.includes("rút tiền")
    ) {
      return "/admin/withdrawal-request";
    }
    if (
      loai.includes("thanhtoan") ||
      loai.includes("muakhoahoc") ||
      tieuDe.includes("đơn mua") ||
      tieuDe.includes("thanh toán")
    ) {
      return "/admin/payments";
    }
    if (
      loai.includes("phancongkiemduyet") ||
      tieuDe.includes("phân công kiểm duyệt")
    ) {
      return isPersonnel
        ? "/personnel/approve-courses"
        : "/admin/approve-courses";
    }
    if (
      loai.includes("khoahocchoduyet") ||
      loai.includes("xemxet") ||
      tieuDe.includes("phê duyệt") ||
      tieuDe.includes("chờ phê duyệt")
    ) {
      return itemId
        ? `/admin/approve-courses/${itemId}`
        : "/admin/approve-courses";
    }
    if (
      loai.includes("nangcapgiangvien") ||
      (tieuDe.includes("giảng viên") &&
        (tieuDe.includes("nâng cấp") || tieuDe.includes("yêu cầu")))
    ) {
      return "/admin/dashboard?tab=instructor-requests";
    }
    if (loai.includes("khuyenmai") || tieuDe.includes("khuyến mãi")) {
      return "/admin/promotions";
    }
    if (isAdmin) {
      return "/admin/notifications";
    }
  }

  // ─── INSTRUCTOR ───
  if (
    isInstructor ||
    loai.includes("hocviendangky") ||
    loai.includes("cauhoimoi") ||
    loai.includes("doanhthu") ||
    loai.includes("loimoi") ||
    loai.includes("ruttien") ||
    tieuDe.includes("học viên mới") ||
    tieuDe.includes("câu hỏi mới") ||
    tieuDe.includes("doanh thu") ||
    tieuDe.includes("lời mời") ||
    tieuDe.includes("cộng tác")
  ) {
    // 1. Học viên đăng ký khóa học mới
    if (
      loai.includes("hocviendangky") ||
      tieuDe.includes("học viên mới") ||
      noiDung.includes("đăng ký khóa học")
    ) {
      if (itemId) {
        return `/instructor/manager-courses/${itemId}/manager/performance`;
      }
      return "/instructor/manager-courses";
    }

    // 2. Câu hỏi mới từ học viên (Q&A)
    if (
      loai.includes("cauhoimoi") ||
      loai.includes("hoidap") ||
      tieuDe.includes("câu hỏi mới") ||
      noiDung.includes("đặt câu hỏi")
    ) {
      if (itemId) {
        return `/instructor/manager-courses/${itemId}/manager/qna`;
      }
      return "/instructor/manager-courses";
    }

    // 3. Doanh thu & Rút tiền
    if (
      loai.includes("doanhthu") ||
      loai.includes("ruttien") ||
      tieuDe.includes("doanh thu") ||
      tieuDe.includes("rút tiền")
    ) {
      return "/instructor/money";
    }

    // 4. Lời mời giảng viên / Lời mời khuyến mãi / Eduverse Deals
    if (
      loai.includes("loimoi") ||
      loai.includes("khuyenmai") ||
      loai.includes("deals") ||
      tieuDe.includes("lời mời") ||
      tieuDe.includes("khuyến mãi")
    ) {
      return "/instructor/invites";
    }

    // 5. Kết quả phê duyệt khóa học (Đã duyệt, từ chối, xem xét lại)
    if (
      loai.includes("khoahoc") ||
      loai.includes("duyet") ||
      tieuDe.includes("phê duyệt") ||
      tieuDe.includes("từ chối") ||
      tieuDe.includes("xem xét")
    ) {
      if (itemId) {
        return `/instructor/manager-courses/${itemId}/manager/basics`;
      }
      return "/instructor/manager-courses";
    }

    // 6. Đánh giá mới
    if (loai.includes("danhgia") || tieuDe.includes("đánh giá")) {
      if (itemId) {
        return `/instructor/manager-courses/${itemId}/manager/reviews`;
      }
      return "/instructor/manager-courses";
    }

    if (itemId) {
      return `/instructor/manager-courses/${itemId}/manager/basics`;
    }

    return "/instructor/dashboard";
  }

  // ─── STUDENT ───
  // 1. Giảng viên trả lời câu hỏi của bạn
  if (
    loai.includes("traloicauhoi") ||
    tieuDe.includes("trả lời câu hỏi") ||
    noiDung.includes("trả lời câu hỏi")
  ) {
    if (itemId) {
      return `/student/courses/my-courses/learning/${itemId}?tab=qna`;
    }
    return "/student/courses/my-courses";
  }

  // 2. Mua khóa học thành công
  if (
    loai.includes("muakhoahoc") ||
    tieuDe.includes("mua khóa học") ||
    tieuDe.includes("thanh toán")
  ) {
    return "/student/courses/my-courses";
  }

  // 3. Khóa học hết hạn hoặc phản hồi đánh giá
  if (
    loai.includes("hethan") ||
    loai.includes("danhgia") ||
    tieuDe.includes("hết hạn") ||
    tieuDe.includes("đánh giá")
  ) {
    if (itemId) {
      return `/student/enroll-courses/${itemId}`;
    }
    return "/student/courses/my-courses";
  }

  // General Fallback
  if (itemId) {
    return `/student/enroll-courses/${itemId}`;
  }

  return "/student/dashboard";
}
