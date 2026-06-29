import { Certificate } from "../types/certificate";

export const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: "cert-1",
    maSoChungChi: "EV-2026-NXFST88",
    tenChungChi: "Chuyên viên Lập trình Fullstack Next.js",
    tenKhoaHoc: "Next.js 15 & React 19 Toàn Tập",
    ngayCap: "2026-05-15",
    diemTongKet: 9.6,
    tongThoiGianHoc: 120,
    trangThai: "Hoạt động",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    id: "cert-2",
    maSoChungChi: "EV-2026-UIUX912",
    tenChungChi: "Nhà thiết kế Trải nghiệm Người dùng (UX/UI)",
    tenKhoaHoc: "Thiết kế Sản phẩm Kỹ thuật số Cao cấp",
    ngayCap: "2026-04-10",
    diemTongKet: 8.8,
    tongThoiGianHoc: 80,
    trangThai: "Hoạt động",
    thumbnail: "https://images.unsplash.com/photo-1541462608141-2ffb68df685e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    id: "cert-3",
    maSoChungChi: "EV-2026-MNGST05",
    tenChungChi: "Quản trị Chiến lược Doanh nghiệp",
    tenKhoaHoc: "Lãnh đạo và Chiến lược Kinh doanh Cấp cao",
    ngayCap: "2026-03-22",
    diemTongKet: 9.2,
    tongThoiGianHoc: 95,
    trangThai: "Hoạt động",
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    id: "cert-4",
    maSoChungChi: "EV-2026-CORPF47",
    tenChungChi: "Phân tích Tài chính Doanh nghiệp",
    tenKhoaHoc: "Tài chính & Kế toán dành cho Quản lý",
    ngayCap: "2026-02-18",
    diemTongKet: 8.5,
    tongThoiGianHoc: 60,
    trangThai: "Hoạt động",
    thumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    id: "cert-5",
    maSoChungChi: "EV-2026-AIML303",
    tenChungChi: "Chuyên gia Trí tuệ Nhân tạo & Machine Learning",
    tenKhoaHoc: "Ứng dụng Deep Learning trong Kinh doanh",
    ngayCap: "2026-01-05",
    diemTongKet: 9.8,
    tongThoiGianHoc: 150,
    trangThai: "Hoạt động",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    id: "cert-6",
    maSoChungChi: "EV-2025-PYDT901",
    tenChungChi: "Kỹ sư Phân tích Dữ liệu Python",
    tenKhoaHoc: "Khoa học Dữ liệu và Phân tích Trực quan",
    ngayCap: "2025-12-10",
    diemTongKet: 9.0,
    tongThoiGianHoc: 75,
    trangThai: "Thu hồi",
    thumbnail: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
];

const LOCAL_STORAGE_KEY = "eduverse_student_certificates";

export function getStoredCertificates(): Certificate[] {
  if (typeof window === "undefined") {
    return INITIAL_CERTIFICATES;
  }
  
  const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_CERTIFICATES));
    return INITIAL_CERTIFICATES;
  }
  
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Error parsing stored certificates", e);
    return INITIAL_CERTIFICATES;
  }
}

export function saveStoredCertificates(certs: Certificate[]): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(certs));
  }
}

export function addStoredCertificate(cert: Certificate): Certificate[] {
  const current = getStoredCertificates();
  // Avoid duplicating id
  if (current.some(c => c.id === cert.id)) {
    return current;
  }
  const updated = [cert, ...current];
  saveStoredCertificates(updated);
  return updated;
}

export function deleteStoredCertificate(id: string): Certificate[] {
  const current = getStoredCertificates();
  const updated = current.filter(c => c.id !== id);
  saveStoredCertificates(updated);
  return updated;
}
