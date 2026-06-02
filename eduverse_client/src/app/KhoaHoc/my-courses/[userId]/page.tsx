"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Be_Vietnam_Pro } from "next/font/google";
import KhoaHocService from "@/src/services/KhoaHocService";
import { KhoaHocType } from "@/src/types/khoaHoc/dto";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const isValidGuid = (id: string) => {
  const regex = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
  return regex.test(id);
};

interface ApiError {
  response?: {
    status?: number;
    data?: unknown;
  };
  message?: string;
}

const MyCoursesPage = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string;

  const [courses, setCourses] = useState<KhoaHocType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isUserIdValid = userId && isValidGuid(userId);

  useEffect(() => {
    if (!isUserIdValid) return;

    let isMounted = true;

    const fetchMyCourses = async () => {
      try {
        const khoaHocService = new KhoaHocService();
        const rawData = await khoaHocService.getmyKhoaHoc(userId);
        
        // Xử lý lấy mảng items từ các cấu trúc API khác nhau
        let items: KhoaHocType[] = [];
        
        if (rawData) {
          // Nếu rawData đã là mảng
          if (Array.isArray(rawData)) {
            items = rawData;
          }
          // Kiểm tra cấu trúc { data: { items: [...] } }
          else if (typeof rawData === 'object' && 'data' in rawData) {
            const data = (rawData as Record<string, unknown>).data;
            if (data && typeof data === 'object' && 'items' in data && Array.isArray((data as Record<string, unknown>).items)) {
              items = (data as Record<string, unknown>).items as KhoaHocType[];
            }
          }
          // Kiểm tra cấu trúc { items: [...] }
          else if (typeof rawData === 'object' && 'items' in rawData && Array.isArray((rawData as Record<string, unknown>).items)) {
            items = (rawData as Record<string, unknown>).items as KhoaHocType[];
          }
        }
        
        if (isMounted) {
          setCourses(items);
          setError("");
        }
      } catch (err: unknown) {
        console.error(err);
        let message = "Không thể tải danh sách khóa học. Vui lòng thử lại sau.";
        const apiError = err as ApiError;
        if (apiError?.response?.status === 404) {
          message = "Không tìm thấy khóa học nào cho người dùng này.";
        } else if (apiError?.response?.status === 401 || apiError?.response?.status === 403) {
          message = "Bạn không có quyền truy cập danh sách khóa học này.";
        }
        if (isMounted) {
          setError(message);
          setCourses([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMyCourses();

    return () => {
      isMounted = false;
    };
  }, [userId, isUserIdValid]);

  const handleCourseClick = (idDangKyKhoaHoc: string) => {
    if (idDangKyKhoaHoc) {
      router.push(`/khoahoc/my-courses/learning/${idDangKyKhoaHoc}`);
    }
  };

  if (!userId || !isValidGuid(userId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-gray-800">ID người dùng không hợp lệ.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải khóa học của bạn...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-gray-800">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow">
          <div className="text-gray-400 text-5xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-gray-800">Bạn chưa đăng ký khóa học nào</h2>
          <p className="text-gray-600 mt-2">Hãy khám phá các khóa học và bắt đầu học ngay!</p>
          <Link href="/khoahoc" className="mt-4 inline-block px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">
            Khám phá khóa học
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${beVietnamPro.className} min-h-screen bg-gray-50`}>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/khoahoc/1-removebg-preview.png"
              alt="EduVerse"
              width={120}
              height={36}
              className="object-contain"
            />
          </Link>
          <h1 className="text-lg font-semibold text-gray-800">Khóa học của tôi</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Danh sách khóa học đã đăng ký</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => handleCourseClick(course.idDangKiKhoaHoc!)}
              className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:shadow-lg border border-gray-100"
            >
              <div className="relative h-40 w-full bg-gray-200">
                {course.hinhAnhKhoaHoc ? (
                  <Image
                    src={course.hinhAnhKhoaHoc}
                    alt={course.tieuDe || "Khóa học"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200">
                    <span className="text-red-400 text-4xl">📘</span>
                  </div>
                )}
                {course.PhanTramHoanThanh !== undefined && (
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {course.PhanTramHoanThanh}% hoàn thành
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800 line-clamp-2">{course.tieuDe}</h3>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{course.moTa}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <span>📺</span>
                    <span>{course.tongBaiGiang || 0} bài</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <span>⏱️</span>
                    <span>{Math.floor((course.tongThoiLuong || 0) / 60)} phút</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCourseClick(course.idDangKiKhoaHoc!);
                  }}
                  className="mt-4 w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition"
                >
                  Học ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MyCoursesPage;