import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Certificate, CertificateFilters, CertificateStats } from "../types/certificate";
import { ApiResponse } from "../types/types";
import {
  getStoredCertificates,
  addStoredCertificate,
  deleteStoredCertificate,
} from "../data/certificates";

// Simulated network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const certificateService = {
  // GET /api/ChungChi - Get all certificates with filters and sorting
  async getList(filters: CertificateFilters): Promise<ApiResponse<Certificate[]>> {
    await delay(400); // Simulate network latency
    let list = getStoredCertificates();

    // 1. Keyword search (by certificate name or course name)
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.tenChungChi.toLowerCase().includes(kw) ||
          c.tenKhoaHoc.toLowerCase().includes(kw) ||
          c.maSoChungChi.toLowerCase().includes(kw)
      );
    }

    // 2. Status filter
    if (filters.trangThai && filters.trangThai !== "Tất cả") {
      list = list.filter((c) => c.trangThai === filters.trangThai);
    }

    // 3. Sorting
    if (filters.sortBy) {
      if (filters.sortBy === "newest") {
        list.sort((a, b) => new Date(b.ngayCap).getTime() - new Date(a.ngayCap).getTime());
      } else if (filters.sortBy === "oldest") {
        list.sort((a, b) => new Date(a.ngayCap).getTime() - new Date(b.ngayCap).getTime());
      } else if (filters.sortBy === "highest_score") {
        list.sort((a, b) => b.diemTongKet - a.diemTongKet);
      } else if (filters.sortBy === "lowest_score") {
        list.sort((a, b) => a.diemTongKet - b.diemTongKet);
      }
    }

    return {
      status: true,
      message: "Lấy danh sách chứng chỉ thành công",
      data: list,
    };
  },

  // GET /api/ChungChi/{id} - Get certificate by ID
  async getById(id: string): Promise<ApiResponse<Certificate>> {
    await delay(200);
    const list = getStoredCertificates();
    const cert = list.find((c) => c.id === id);
    if (!cert) {
      throw new Error("Không tìm thấy chứng chỉ");
    }
    return {
      status: true,
      message: "Lấy chi tiết chứng chỉ thành công",
      data: cert,
    };
  },

  // POST /api/ChungChi/Create - Create (Claim) a new certificate
  async claim(cert: Omit<Certificate, "id" | "maSoChungChi" | "ngayCap">): Promise<ApiResponse<Certificate>> {
    await delay(600);
    
    // Generate mock details
    const timestamp = Date.now();
    const randomHex = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    const newCert: Certificate = {
      ...cert,
      id: `cert-new-${timestamp}`,
      maSoChungChi: `EV-2026-CLM${randomHex}`,
      ngayCap: new Date().toISOString().split("T")[0],
    };

    addStoredCertificate(newCert);

    return {
      status: true,
      message: "Nhận chứng chỉ thành công!",
      data: newCert,
    };
  },

  // DELETE /api/ChungChi/{id} - Delete/Revoke a certificate (for demo purposes)
  async delete(id: string): Promise<ApiResponse<boolean>> {
    await delay(300);
    deleteStoredCertificate(id);
    return {
      status: true,
      message: "Xóa chứng chỉ thành công",
      data: true,
    };
  },

  // GET /api/ChungChi/Stats - Get statistics
  async getStats(): Promise<ApiResponse<CertificateStats>> {
    await delay(300);
    const list = getStoredCertificates();
    const activeCerts = list.filter((c) => c.trangThai === "Hoạt động");
    
    // Find newest certificate
    let newest: Certificate | null = null;
    if (activeCerts.length > 0) {
      newest = [...activeCerts].sort(
        (a, b) => new Date(b.ngayCap).getTime() - new Date(a.ngayCap).getTime()
      )[0];
    }

    return {
      status: true,
      message: "Lấy thống kê thành công",
      data: {
        tongSoChungChi: activeCerts.length,
        tyLeHoanThanh: activeCerts.length > 0 ? Math.min(100, 70 + activeCerts.length * 5) : 60, // Mock learning progress rate
        khoaHocDaHoanThanh: list.length, // Completed courses
        chungChiMoiNhat: newest,
      },
    };
  },
};

// --- REACT QUERY HOOKS ---

export const CERTIFICATE_KEYS = {
  all: ["certificates"] as const,
  lists: () => [...CERTIFICATE_KEYS.all, "list"] as const,
  list: (filters: CertificateFilters) => [...CERTIFICATE_KEYS.lists(), filters] as const,
  details: () => [...CERTIFICATE_KEYS.all, "detail"] as const,
  detail: (id: string) => [...CERTIFICATE_KEYS.details(), id] as const,
  stats: () => [...CERTIFICATE_KEYS.all, "stats"] as const,
};

// Hook: Get all certificates
export function useGetCertificates(filters: CertificateFilters) {
  return useQuery({
    queryKey: CERTIFICATE_KEYS.list(filters),
    queryFn: () => certificateService.getList(filters),
  });
}

// Hook: Get certificate details by ID
export function useGetCertificateById(id: string) {
  return useQuery({
    queryKey: CERTIFICATE_KEYS.detail(id),
    queryFn: () => certificateService.getById(id),
    enabled: !!id,
  });
}

// Hook: Get certificate statistics
export function useGetCertificateStats() {
  return useQuery({
    queryKey: CERTIFICATE_KEYS.stats(),
    queryFn: () => certificateService.getStats(),
  });
}

// Hook: Claim (Create) Certificate Mutation
export function useClaimCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (certData: Omit<Certificate, "id" | "maSoChungChi" | "ngayCap">) =>
      certificateService.claim(certData),
    onSuccess: () => {
      // Invalidate queries to refresh listing and stats
      queryClient.invalidateQueries({ queryKey: CERTIFICATE_KEYS.all });
    },
  });
}

// Hook: Delete Certificate Mutation (useful for resetting demo)
export function useDeleteCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => certificateService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CERTIFICATE_KEYS.all });
    },
  });
}
