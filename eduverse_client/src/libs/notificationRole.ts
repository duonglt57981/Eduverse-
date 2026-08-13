import { ThongBao } from "@/src/types/thongbao";

export type NotificationRole = "Admin" | "Personnel" | "GiaoVien" | "HocVien";

const ADMIN_TYPES = new Set([
  "yeucauruttien",
  "khoahocchoduyet",
  "muakhoahoc",
  "yeucaunangcapgiangvien",
]);

const HIDDEN_ADMIN_TYPES = new Set(["dangkykhoahoc", "taokhoahoc"]);

const PERSONNEL_TYPES = new Set(["phancongkiemduyetkhoahoc"]);

const INSTRUCTOR_TYPES = new Set([
  "guiyeucauruttien",
  "ruttienthanhcong",
  "ruttientuchoi",
  "doanhthu",
  "khoahocdaduyet",
  "khoahoctuchoi",
  "hocviendangkykhoahoc",
]);

const STUDENT_TYPES = new Set([
  "muakhoahocthanhcong",
]);

const HIDDEN_STUDENT_TYPES = new Set(["dangkykhoahocthanhcong"]);

const roleFromLink = (link?: string): NotificationRole | null => {
  const normalized = link?.trim().toLocaleLowerCase() || "";
  if (/(^|\/)admin(\/|$|\?)/.test(normalized)) return "Admin";
  if (/(^|\/)personnel(\/|$|\?)/.test(normalized)) return "Personnel";
  if (/(^|\/)instructor(\/|$|\?)/.test(normalized)) return "GiaoVien";
  if (/(^|\/)student(\/|$|\?)/.test(normalized)) return "HocVien";
  return null;
};

export const getNotificationRole = (
  notification: ThongBao,
): NotificationRole | null => {
  const type = (notification.loaiThongBao || notification.type || "")
    .replace(/\s+/g, "")
    .toLocaleLowerCase();
  if (HIDDEN_ADMIN_TYPES.has(type) || HIDDEN_STUDENT_TYPES.has(type)) return null;

  const linkedRole = roleFromLink(notification.link);
  if (linkedRole) return linkedRole;

  if (ADMIN_TYPES.has(type)) return "Admin";
  if (PERSONNEL_TYPES.has(type)) return "Personnel";
  if (INSTRUCTOR_TYPES.has(type)) return "GiaoVien";
  if (STUDENT_TYPES.has(type)) return "HocVien";

  const text = [notification.tieuDe, notification.noiDung, notification.message]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("vi-VN");

  if (/chờ phê duyệt|cho phe duyet|yêu cầu nâng cấp giảng viên|yeu cau nang cap giang vien|yêu cầu rút tiền mới|yeu cau rut tien moi|đơn mua khóa học mới|don mua khoa hoc moi/.test(text)) {
    return "Admin";
  }
  if (/được phê duyệt|duoc phe duyet|bị từ chối|bi tu choi|doanh thu mới|doanh thu moi|có học viên mới|co hoc vien moi/.test(text)) {
    return "GiaoVien";
  }
  if (/đăng ký khóa học thành công|dang ky khoa hoc thanh cong|mua khóa học thành công|mua khoa hoc thanh cong|khóa học vừa có bản cập nhật|khoa hoc vua co ban cap nhat/.test(text)) {
    return "HocVien";
  }

  return null;
};

export const isNotificationForRole = (
  notification: ThongBao,
  role: NotificationRole,
) => getNotificationRole(notification) === role;
