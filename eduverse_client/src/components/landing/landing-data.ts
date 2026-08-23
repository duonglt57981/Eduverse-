import {
  AutoAwesomeRounded,
  EmojiEventsRounded,
  LaptopChromebookRounded,
  PublicRounded,
  QueryStatsRounded,
  SchoolRounded,
  SecurityRounded,
  WorkspacePremiumRounded,
} from "@mui/icons-material";
import type { SvgIconComponent } from "@mui/icons-material";
import { BRAND, STATUS, CSSVAR } from "@/src/theme/tokens";

export type LandingNavItem = {
  label: string;
  href: string;
};

export type LandingStat = {
  value: string;
  label: string;
};

export type LandingCourse = {
  id?: string;
  badge: string;
  title: string;
  subtitle: string;
  price: string;
  palette: [string, string, string];
  hinhAnhKhoaHoc?: string;
};

export type CourseCategory = {
  label: string;
  value: string;
  count?: number;
};

export type CourseCatalogItem = {
  id: string;
  badge: string;
  title: string;
  instructor: string;
  rating: number | null;
  students: string | number;
  studentCount?: number;
  duration: string;
  price: string;
  priceValue?: number;
  originalPrice: string;
  createdAt?: number;
  category: string;
  level: string;
  isFree: boolean;
  tags: string[];
  palette: [string, string, string];
  hinhAnhKhoaHoc?: string;
  soLuongDanhGia?: number;
};

export type InstructorCategory = {
  label: string;
  value: string;
};

export type InstructorSocial = {
  label: string;
  href: string;
};

export type InstructorItem = {
  id: string;
  name: string;
  specialization: string;
  shortBio: string;
  rating: number;
  students: string;
  courses: number;
  experience: string;
  category: string;
  featured?: boolean;
  palette: [string, string, string];
  socials: InstructorSocial[];
};

export type AboutValueItem = {
  title: string;
  description: string;
  icon: SvgIconComponent;
};

export type AboutTimelineItem = {
  year: string;
  title: string;
  description: string;
};

export type ContactInfoItem = {
  title: string;
  value: string;
  detail: string;
  icon: SvgIconComponent;
};

export type ContactFaqItem = {
  question: string;
  answer: string;
};

export type LandingBenefit = {
  title: string;
  description: string;
  icon: SvgIconComponent;
};

export type LandingTestimonial = {
  quote: string;
  name: string;
  role: string;
};

export const navItems: LandingNavItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Khóa học", href: "/courses" },
  { label: "Yêu thích", href: "/favorite" },
  { label: "Giảng viên", href: "/instructors" },
  { label: "Về chúng tôi", href: "/about-us" },
  { label: "Liên hệ", href: "/contact" },
];

export const stats: LandingStat[] = [
  { value: "10K+", label: "Học viên" },
  { value: "500+", label: "Khóa học" },
  { value: "120+", label: "Giảng viên" },
  { value: "95%", label: "Hài lòng" },
];

export const featuredCourses: LandingCourse[] = [
  {
    badge: "Mới",
    title: "Lập trình Fullstack Next.js & Tailwind",
    subtitle: "Giảng viên: Trần Khang",
    price: "1.299.000đ",
    palette: ["#07131e", "#17445f", "#081019"],
  },
  {
    badge: "Nổi bật",
    title: "Chuyên đề Thiết kế UI/UX 2026",
    subtitle: "Giảng viên: Diễm Phương",
    price: "899.000đ",
    palette: ["#23151f", "#8e4a59", "#251420"],
  },
  {
    badge: "Tốt nhất",
    title: "Khoa học Dữ liệu & AI cho Kinh doanh",
    subtitle: "Giảng viên: Lê Phong",
    price: "2.499.000đ",
    palette: ["#08141e", "#0f6178", "#071019"],
  },
];

export const benefits: LandingBenefit[] = [
  {
    title: "Lộ trình cá nhân hóa",
    description: "Đề xuất khóa học theo mục tiêu và năng lực học tập của bạn.",
    icon: QueryStatsRounded,
  },
  {
    title: "Giảng viên thực chiến",
    description:
      "Học cùng chuyên gia từ doanh nghiệp, startup và tập đoàn lớn.",
    icon: SchoolRounded,
  },
  {
    title: "Chứng chỉ giá trị",
    description: "Nhận chứng chỉ hoàn thành chuyên nghiệp để nâng cấp hồ sơ.",
    icon: WorkspacePremiumRounded,
  },
  {
    title: "Học mọi lúc mọi nơi",
    description: "Tối ưu trải nghiệm trên desktop, tablet và mobile.",
    icon: LaptopChromebookRounded,
  },
  {
    title: "Cộng đồng toàn cầu",
    description: "Kết nối học viên, giảng viên và đối tác trên nhiều lĩnh vực.",
    icon: PublicRounded,
  },
  {
    title: "Bảo mật và ổn định",
    description: "Hạ tầng an toàn, tốc độ cao cho hành trình học tập liên tục.",
    icon: SecurityRounded,
  },
];

export const mentorHighlights = [
  {
    name: "Nguyễn Thị Lương Hậu",
    role: "Chuyên gia Lập trình Frontend & UX/UI",
  },
  { name: "Hoàng Long", role: "Chuyên gia Lập trình Fullstack & Backend" },
  { name: "Dương Lương Triều", role: "Kiến trúc sư giải pháp & Cloud DevOps" },
  { name: "Mạnh Lê Đức", role: "Chuyên gia Trí tuệ Nhân tạo & AI Engineer" },
] as const;

export const testimonials: LandingTestimonial[] = [
  {
    quote:
      "EduVerse giúp tôi xây lại lộ trình sự nghiệp rõ ràng hơn. Giao diện đẹp, học rất có động lực.",
    name: "Minh Châu",
    role: "Nhà thiết kế Sản phẩm",
  },
  {
    quote:
      "Khóa học thực tiễn, giảng viên phản hồi nhanh và dashboard theo dõi tiến độ cực kỳ rõ ràng.",
    name: "Đức Huy",
    role: "Chuyên viên Marketing",
  },
  {
    quote:
      "Tôi thích cảm giác cao cấp của nền tảng. Nội dung tinh gọn, hiện đại và đáng tiền.",
    name: "Lan Anh",
    role: "Chuyên viên Phân tích Kinh doanh",
  },
];
export const instructorCategories: InstructorCategory[] = [
  { label: "Tất cả", value: "all" },
  { label: "Kỹ thuật", value: "technology" },
  { label: "Thiết kế", value: "design" },
  { label: "Kinh doanh", value: "business" },
  { label: "AI & Data", value: "ai-data" },
];

export const instructorCatalog: InstructorItem[] = [
  {
    id: "luong-hau",
    name: "Nguyễn Thị Lương Hậu",
    specialization: "Chuyên gia Lập trình Frontend & UX/UI",
    shortBio:
      "Hơn 8 năm kinh nghiệm thiết kế giao diện hiện đại, giảng dạy các công nghệ Next.js, Tailwind CSS và tối ưu hóa trải nghiệm người dùng.",
    rating: 4.9,
    students: "12,500+",
    courses: 8,
    experience: "8 năm",
    category: "design",
    featured: true,
    palette: ["#1f0f12", BRAND.main, "#251013"],
    socials: [
      { label: "LinkedIn", href: "#" },
      { label: "Email", href: "#" },
      { label: "Website", href: "#" },
    ],
  },
  {
    id: "hoang-long",
    name: "Hoàng Long",
    specialization: "Chuyên gia Lập trình Fullstack & Backend",
    shortBio:
      "Chuyên gia thiết kế hệ thống phần mềm lớn, phát triển API hiệu năng cao với ASP.NET Core, SQL Server và Node.js.",
    rating: 5.0,
    students: "8,900+",
    courses: 6,
    experience: "10 năm",
    category: "technology",
    featured: true,
    palette: ["#160f16", "#8e4a59", "#241621"],
    socials: [
      { label: "Dribbble", href: "#" },
      { label: "Behance", href: "#" },
      { label: "Email", href: "#" },
    ],
  },
  {
    id: "duong-trieu",
    name: "Dương Lương Triều",
    specialization: "Kiến trúc sư giải pháp & Cloud DevOps",
    shortBio:
      "Nhiều năm kinh nghiệm tư vấn giải pháp chuyển đổi số, triển khai CI/CD và kiến trúc Microservices trên nền tảng đám mây AWS/Docker.",
    rating: 4.8,
    students: "8,700+",
    courses: 5,
    experience: "8 năm",
    category: "technology",
    featured: true,
    palette: ["#2b1214", "#aa3d4e", "#2a1518"],
    socials: [
      { label: "LinkedIn", href: "#" },
      { label: "Email", href: "#" },
    ],
  },
  {
    id: "manh-le-duc",
    name: "Mạnh Lê Đức",
    specialization: "Chuyên gia Trí tuệ Nhân tạo & AI Engineer",
    shortBio:
      "Nghiên cứu và triển khai các mô hình Machine Learning, tích hợp mô hình ngôn ngữ lớn (LLM) và phát triển ứng dụng AI thực chiến.",
    rating: 4.9,
    students: "12,450+",
    courses: 9,
    experience: "12 năm",
    category: "ai-data",
    palette: ["#13212f", "#385671", "#1a2835"],
    socials: [
      { label: "GitHub", href: "#" },
      { label: "LinkedIn", href: "#" },
      { label: "Email", href: "#" },
    ],
  },
  {
    id: "hoang-gia-bao",
    name: "Hoàng Gia Bảo",
    specialization: "Lập trình viên Fullstack",
    shortBio:
      "Tập trung vào React, Node.js và kiến trúc web hiện đại, giúp học viên xây dự án sẵn sàng triển khai thực tế.",
    rating: 4.7,
    students: "8,650+",
    courses: 7,
    experience: "7 năm",
    category: "technology",
    palette: ["#2a1a12", "#a85b34", "#2b1e18"],
    socials: [
      { label: "GitHub", href: "#" },
      { label: "LinkedIn", href: "#" },
    ],
  },
  {
    id: "dang-thao-linh",
    name: "Đặng Thảo Linh",
    specialization: "Chuyên gia Chiến lược Marketing số",
    shortBio:
      "Cố vấn chiến lược marketing đa kênh, nổi bật với nội dung thực tiễn và tư duy đo lường hiệu quả.",
    rating: 5.0,
    students: "10,450+",
    courses: 6,
    experience: "9 năm",
    category: "business",
    palette: ["#0f1724", "#253f6c", "#131d2a"],
    socials: [
      { label: "LinkedIn", href: "#" },
      { label: "Email", href: "#" },
      { label: "Website", href: "#" },
    ],
  },
  {
    id: "vu-thanh-lam",
    name: "Vũ Thanh Lâm",
    specialization: "Tư vấn Sản phẩm AI",
    shortBio:
      "Kết nối AI với bài toán sản phẩm và vận hành, đồng hành cùng nhiều startup trong hành trình tăng trưởng.",
    rating: 4.9,
    students: "9,200+",
    courses: 4,
    experience: "11 năm",
    category: "ai-data",
    palette: ["#101624", "#20506b", "#142233"],
    socials: [
      { label: "LinkedIn", href: "#" },
      { label: "Email", href: "#" },
    ],
  },
  {
    id: "ngo-diem-my",
    name: "Ngô Diễm My",
    specialization: "Nhà thiết kế Thương hiệu & Hình ảnh",
    shortBio:
      "Giảng viên thiết kế thương hiệu với gu thẩm mỹ hiện đại, tập trung vào tính ứng dụng và hệ thống hóa tư duy.",
    rating: 4.8,
    students: "7,980+",
    courses: 5,
    experience: "8 năm",
    category: "design",
    palette: ["#2a1117", "#8f405a", "#2c1620"],
    socials: [
      { label: "Behance", href: "#" },
      { label: "Dribbble", href: "#" },
      { label: "Email", href: "#" },
    ],
  },
];

export const instructorTestimonials: LandingTestimonial[] = [
  {
    quote:
      "EduVerse giúp mình tiếp cận giảng viên chất lượng cao, bài giảng sâu và rất gần với thực tế công việc.",
    name: "Lê Văn Tùng",
    role: "Học viên khóa Khoa học Dữ liệu",
  },
  {
    quote:
      "Mình học được rất nhiều từ cách giảng viên giải thích tình huống thực tế. Rõ ràng, hiện đại và truyền cảm hứng.",
    name: "Nguyễn Thùy Dương",
    role: "Học viên khóa Thiết kế UI/UX",
  },
];

export const landingPills = [
  {
    title: "Học mọi lúc",
    subtitle: "Linh hoạt",
    icon: AutoAwesomeRounded,
  },
  {
    title: "Tối ưu lộ trình",
    subtitle: "Cá nhân hóa",
    icon: QueryStatsRounded,
  },
  {
    title: "Tăng tốc sự nghiệp",
    subtitle: "Chứng chỉ",
    icon: EmojiEventsRounded,
  },
] as const;

export const courseCategories: CourseCategory[] = [
  { label: "Lập trình", value: "development", count: 124 },
  { label: "Thiết kế", value: "design", count: 82 },
  { label: "Marketing", value: "marketing", count: 68 },
  { label: "AI & Data", value: "ai-data", count: 94 },
  { label: "Kinh doanh", value: "business", count: 76 },
  { label: "Ngoại ngữ", value: "language", count: 56 },
];

export const aboutValues: AboutValueItem[] = [
  {
    title: "Sứ mệnh",
    description:
      "Mở ra môi trường học tập chuẩn quốc tế, nơi mọi người có thể nâng cấp kỹ năng thực chiến và phát triển sự nghiệp bền vững.",
    icon: SchoolRounded,
  },
  {
    title: "Tầm nhìn",
    description:
      "Trở thành nền tảng e-learning dẫn đầu cho người đi làm tại Việt Nam với trải nghiệm học tập hiện đại, tinh gọn và truyền cảm hứng.",
    icon: PublicRounded,
  },
  {
    title: "Giá trị cốt lõi",
    description:
      "Lấy chất lượng nội dung, tính ứng dụng thực tế, cá nhân hóa và cộng đồng học tập làm trọng tâm phát triển lâu dài.",
    icon: WorkspacePremiumRounded,
  },
  {
    title: "Triết lý học tập",
    description:
      "Học để làm được việc. Mỗi khóa học đều hướng đến năng lực thực tế, dự án thật và khả năng áp dụng ngay vào công việc.",
    icon: QueryStatsRounded,
  },
];

export const aboutTimeline: AboutTimelineItem[] = [
  {
    year: "Quý 1 · 2026",
    title: "Hình thành ý tưởng EduVerse",
    description:
      "Đội ngũ sáng lập bắt đầu phác thảo mô hình học tập số, tập trung vào người đi làm và kỹ năng thực chiến.",
  },
  {
    year: "Quý 2 · 2026",
    title: "Xây dựng nền tảng",
    description:
      "Bắt tay phát triển hệ thống khóa học, công cụ cho giảng viên và trải nghiệm học tập trực tuyến đầu tiên.",
  },
  {
    year: "Quý 3 · 2026",
    title: "Ra mắt phiên bản đầu tiên",
    description:
      "Giới thiệu những khóa học đầu tiên về công nghệ, thiết kế và quản trị cùng mô hình giảng viên đồng hành.",
  },
  {
    year: "Định hướng 2027",
    title: "Mở rộng hệ sinh thái học tập",
    description:
      "Từng bước mở rộng danh mục nội dung, hoàn thiện dashboard học tập, chứng chỉ và hỗ trợ nghề nghiệp cho học viên.",
  },
];

export const contactInfo = [
  {
    title: "Email hỗ trợ",
    value: "support@eduverse.edu.vn",
    detail: "Phản hồi trong vòng 24 giờ làm việc",
    icon: SchoolRounded,
  },
  {
    title: "Hotline",
    value: "1900 8888 66",
    detail: "Tư vấn khóa học và hỗ trợ kỹ thuật",
    icon: QueryStatsRounded,
  },
  {
    title: "Địa chỉ",
    value: "Lầu 15, Tòa nhà Innovation, Quận 12, TP.HCM",
    detail: "Không gian gặp gỡ đối tác và tổ chức workshop",
    icon: PublicRounded,
  },
  {
    title: "Giờ làm việc",
    value: "Thứ 2 - Thứ 6: 08:00 - 18:00",
    detail: "Thứ 7: 08:00 - 12:00",
    icon: WorkspacePremiumRounded,
  },
] satisfies ContactInfoItem[];

export const contactFaqs: ContactFaqItem[] = [
  {
    question: "Bao lâu EduVerse phản hồi sau khi gửi form?",
    answer:
      "Đội ngũ hỗ trợ thường phản hồi trong vòng 24 giờ làm việc qua email hoặc hotline.",
  },
  {
    question: "Tôi có thể nhận tư vấn lộ trình học cá nhân không?",
    answer:
      "Có. Bạn chỉ cần để lại mục tiêu học tập, đội ngũ EduVerse sẽ đề xuất lộ trình phù hợp.",
  },
  {
    question: "Doanh nghiệp muốn hợp tác đào tạo thì liên hệ ở đâu?",
    answer:
      "Bạn có thể dùng form liên hệ hoặc gửi trực tiếp email tới bộ phận hợp tác tại support@eduverse.edu.vn.",
  },
] as const;
