/**
 * Trang chủ tương ứng với vai trò của người dùng sau khi đăng nhập.
 * Dùng chung cho login, đăng nhập Google và điều hướng lại khi quay về "/".
 */
export function getRoleHomePath(roles: string[] | null | undefined): string {
  const list = roles || [];
  if (list.includes("Admin")) return "/admin/dashboard";
  if (list.includes("GiaoVien")) return "/instructor/dashboard";
  if (list.includes("personnel")) return "/personnel/approve-courses";
  return "/student/dashboard";
}
