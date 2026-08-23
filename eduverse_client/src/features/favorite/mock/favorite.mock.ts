import { FavoriteCourse } from "../types/favorite.type";
import { BRAND, STATUS, CSSVAR } from "@/src/theme/tokens";

export interface CourseData {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  students: string;
  duration: string;
  price: string;
  originalPrice: string;
  category: string;
  level: string;
  isFree: boolean;
  tags: string[];
  palette: [string, string, string];
  badge: string;
  description: string;
}

export const MOCK_COURSES: CourseData[] = [
  {
    id: "reactjs",
    title: "Lập trình ReactJS toàn tập 2026",
    instructor: "Lê Trần Bình",
    rating: 4.8,
    students: "8,540",
    duration: "32 giờ",
    price: "599.000đ",
    originalPrice: "1.099.000đ",
    category: "development",
    level: "Người mới bắt đầu",
    isFree: false,
    tags: ["React", "Frontend", "JavaScript"],
    palette: [CSSVAR.textPrimary, "#2563eb", CSSVAR.textPrimary],
    badge: "Phổ biến",
    description: "Học ReactJS từ cơ bản đến nâng cao, làm chủ Hooks, Router, Redux/Zustand và xây dựng dự án SPA thực chiến."
  },
  {
    id: "aspnetcore",
    title: "Xây dựng Web API với ASP.NET Core",
    instructor: "Phạm Việt Hùng",
    rating: 4.9,
    students: "6,210",
    duration: "40 giờ",
    price: "899.000đ",
    originalPrice: "1.590.000đ",
    category: "development",
    level: "Trung cấp",
    isFree: false,
    tags: ["C#", "ASP.NET Core", "Web API"],
    palette: ["#1e1b4b", "#4f46e5", "#312e81"],
    badge: "Nổi bật",
    description: "Học thiết kế kiến trúc Clean Architecture, RESTful API, Entity Framework Core và phân quyền JWT."
  },
  {
    id: "nodejs",
    title: "Lập trình NodeJS & Express thực chiến",
    instructor: "Lê Trần Bình",
    rating: 4.7,
    students: "9,850",
    duration: "36 giờ",
    price: "699.000đ",
    originalPrice: "1.299.000đ",
    category: "development",
    level: "Trung cấp",
    isFree: false,
    tags: ["Node.js", "Express", "Backend"],
    palette: ["#062f4f", "#111111", "#222222"],
    badge: "Thực chiến",
    description: "Xây dựng hệ thống backend hiệu năng cao, kết nối MongoDB/PostgreSQL, xử lý auth, upload file và deploy."
  },
  {
    id: "flutter",
    title: "Lập trình di động đa nền tảng với Flutter",
    instructor: "Hoàng Gia Bảo",
    rating: 4.8,
    students: "5,340",
    duration: "45 giờ",
    price: "999.000đ",
    originalPrice: "1.890.000đ",
    category: "development",
    level: "Người mới bắt đầu",
    isFree: false,
    tags: ["Flutter", "Dart", "Mobile"],
    palette: [CSSVAR.textPrimary, STATUS.info, CSSVAR.textPrimary],
    badge: "Xu hướng",
    description: "Tạo ứng dụng Android & iOS mượt mà, tối ưu UI/UX, quản lý state với Bloc/Provider và tích hợp Firebase."
  },
  {
    id: "docker",
    title: "Đóng gói ứng dụng với Docker & Compose",
    instructor: "Phạm Việt Hùng",
    rating: 4.6,
    students: "4,200",
    duration: "15 giờ",
    price: "499.000đ",
    originalPrice: "890.000đ",
    category: "development",
    level: "Người mới bắt đầu",
    isFree: false,
    tags: ["Docker", "DevOps", "Containers"],
    palette: ["#172554", "#1d4ed8", "#1e3a8a"],
    badge: "Cơ bản",
    description: "Làm chủ Containerization, viết Dockerfile tối ưu, quản lý volumes, networks và thiết lập Docker Compose."
  },
  {
    id: "kubernetes",
    title: "Triển khai Kubernetes trong Doanh nghiệp",
    instructor: "Phạm Việt Hùng",
    rating: 4.9,
    students: "3,110",
    duration: "30 giờ",
    price: "1.290.000đ",
    originalPrice: "2.490.000đ",
    category: "development",
    level: "Nâng cao",
    isFree: false,
    tags: ["Kubernetes", "K8s", "DevOps"],
    palette: ["#1e1b4b", "#4338ca", "#312e81"],
    badge: "Nâng cao",
    description: "Quản trị cụm K8s, triển khai Helm Charts, quản lý Ingress, autoscaling và giám sát hệ thống với Prometheus."
  },
  {
    id: "mongodb",
    title: "Làm chủ cơ sở dữ liệu NoSQL MongoDB",
    instructor: "TS. Nguyễn Minh Anh",
    rating: 4.7,
    students: "4,670",
    duration: "20 giờ",
    price: "399.000đ",
    originalPrice: "790.000đ",
    category: "ai-data",
    level: "Người mới bắt đầu",
    isFree: false,
    tags: ["MongoDB", "NoSQL", "Database"],
    palette: ["#064e3b", "#059669", "#022c22"],
    badge: "Dễ học",
    description: "Thiết kế tài liệu JSON hiệu quả, viết truy vấn aggregate nâng cao, lập chỉ mục index và sharding database."
  },
  {
    id: "sqlserver",
    title: "Thiết kế & Tối ưu Cơ sở dữ liệu SQL Server",
    instructor: "TS. Nguyễn Minh Anh",
    rating: 4.8,
    students: "7,820",
    duration: "24 giờ",
    price: "450.000đ",
    originalPrice: "890.000đ",
    category: "ai-data",
    level: "Trung cấp",
    isFree: false,
    tags: ["SQL Server", "Database", "T-SQL"],
    palette: ["#1a0f0f", BRAND.main, "#200d0d"],
    badge: "Quan trọng",
    description: "Tối ưu hóa Store Procedures, thiết kế Indexes hợp lý, đọc Execution Plan và khắc phục điểm nghẽn hiệu năng."
  },
  {
    id: "nextjs-fullstack",
    title: "Lập trình Web Fullstack với React & Node.js",
    instructor: "Lê Trần Bình",
    rating: 4.9,
    students: "12,405",
    duration: "47 giờ",
    price: "799.000đ",
    originalPrice: "1.299.000đ",
    category: "development",
    level: "Trung cấp",
    isFree: false,
    tags: ["Lập trình", "React", "Node.js"],
    palette: ["#09131d", "#17445f", "#0b1018"],
    badge: "Bán chạy",
    description: "Làm chủ React 19, Next.js 15 App Router, Node.js, Express và SQL Server."
  },
  {
    id: "ux-masterclass",
    title: "Chuyên đề Thiết kế UI/UX 2026",
    instructor: "Diễm Phương",
    rating: 4.8,
    students: "13,210",
    duration: "29 giờ",
    price: "1.490.000đ",
    originalPrice: "2.500.000đ",
    category: "design",
    level: "Nâng cao",
    isFree: false,
    tags: ["Thiết kế", "UI/UX", "Figma"],
    palette: ["#24131f", "#8e4a59", "#231722"],
    badge: "Khóa mới",
    description: "Học thiết kế giao diện hiện đại, UX research và prototype bằng Figma."
  },
  {
    id: "digital-marketing",
    title: "Chiến lược Marketing số cho Thương hiệu Hiện đại",
    instructor: "Minh Quân",
    rating: 4.7,
    students: "8,900",
    duration: "35 giờ",
    price: "850.000đ",
    originalPrice: "1.800.000đ",
    category: "marketing",
    level: "Trung cấp",
    isFree: false,
    tags: ["Marketing", "Hiệu suất", "Thương hiệu"],
    palette: ["#07131e", "#0d617b", "#081119"],
    badge: "Xu hướng",
    description: "Tối ưu hóa chiến dịch quảng cáo Facebook, Google và xây dựng phễu chuyển đổi."
  },
  {
    id: "ai-business",
    title: "AI & Dữ liệu cho Lãnh đạo Doanh nghiệp",
    instructor: "Daniel Torres",
    rating: 4.9,
    students: "6,420",
    duration: "26 giờ",
    price: "1.990.000đ",
    originalPrice: "2.890.000đ",
    category: "ai-data",
    level: "Nâng cao",
    isFree: false,
    tags: ["AI & Dữ liệu", "Lãnh đạo", "Phân tích"],
    palette: ["#061019", "#15566e", "#08131d"],
    badge: "Đánh giá cao",
    description: "AI & Dữ liệu cho Lãnh đạo Doanh nghiệp"
  }
];

export function mapToFavoriteCourse(course: CourseData, favoriteId: string, createdDate?: string): FavoriteCourse {
  return {
    id: favoriteId,
    khoaHocId: course.id,
    tieuDe: course.title,
    moTa: course.description,
    hinhAnh: JSON.stringify({ palette: course.palette, badge: course.badge }), // Storing representation
    giangVien: course.instructor,
    giaTien: parseInt(course.price.replace(/\D/g, "") || "0", 10),
    createdDate: createdDate || new Date().toISOString(),
    isFavorite: true
  };
}
