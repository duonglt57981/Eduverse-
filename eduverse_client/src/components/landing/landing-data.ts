import {
  AutoAwesomeRounded,
  EmojiEventsRounded,
  LaptopChromebookRounded,
  PublicRounded,
  QueryStatsRounded,
  SchoolRounded,
  SecurityRounded,
  WorkspacePremiumRounded,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';

export type LandingNavItem = {
  label: string;
  href: string;
};

export type LandingStat = {
  value: string;
  label: string;
};

export type LandingCourse = {
  badge: string;
  title: string;
  subtitle: string;
  price: string;
  palette: [string, string, string];
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
  hinhAnhKhoaHoc?: string;
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
  { label: 'Trang chủ', href: '/' },
  { label: 'Khóa học', href: '/courses' },
  { label: 'Yêu thích', href: '/favorite' },
  { label: 'Giảng viên', href: '/instructors' },
  { label: 'Về chúng tôi', href: '/about-us' },
  { label: 'Liên hệ', href: '/contact' },
];

export const stats: LandingStat[] = [
  { value: '10K+', label: 'Học viên' },
  { value: '500+', label: 'Khóa học' },
  { value: '120+', label: 'Giảng viên' },
  { value: '95%', label: 'Hài lòng' },
];

export const featuredCourses: LandingCourse[] = [
  {
    badge: 'Mới',
    title: 'Lập trình Fullstack Next.js & Tailwind',
    subtitle: 'Giảng viên: Trần Khang',
    price: '1.299.000đ',
    palette: ['#07131e', '#17445f', '#081019'],
  },
  {
    badge: 'Nổi bật',
    title: 'Chuyên đề Thiết kế UI/UX 2026',
    subtitle: 'Giảng viên: Diễm Phương',
    price: '899.000đ',
    palette: ['#23151f', '#8e4a59', '#251420'],
  },
  {
    badge: 'Tốt nhất',
    title: 'Khoa học Dữ liệu & AI cho Kinh doanh',
    subtitle: 'Giảng viên: Lê Phong',
    price: '2.499.000đ',
    palette: ['#08141e', '#0f6178', '#071019'],
  },
];

export const benefits: LandingBenefit[] = [
  {
    title: 'Lộ trình cá nhân hóa',
    description: 'Đề xuất khóa học theo mục tiêu và năng lực học tập của bạn.',
    icon: QueryStatsRounded,
  },
  {
    title: 'Giảng viên thực chiến',
    description: 'Học cùng chuyên gia từ doanh nghiệp, startup và tập đoàn lớn.',
    icon: SchoolRounded,
  },
  {
    title: 'Chứng chỉ giá trị',
    description: 'Nhận chứng chỉ hoàn thành chuyên nghiệp để nâng cấp hồ sơ.',
    icon: WorkspacePremiumRounded,
  },
  {
    title: 'Học mọi lúc mọi nơi',
    description: 'Tối ưu trải nghiệm trên desktop, tablet và mobile.',
    icon: LaptopChromebookRounded,
  },
  {
    title: 'Cộng đồng toàn cầu',
    description: 'Kết nối học viên, giảng viên và đối tác trên nhiều lĩnh vực.',
    icon: PublicRounded,
  },
  {
    title: 'Bảo mật và ổn định',
    description: 'Hạ tầng an toàn, tốc độ cao cho hành trình học tập liên tục.',
    icon: SecurityRounded,
  },
];

export const mentorHighlights = [
  { name: 'Amanda Mason', role: 'Chuyên gia Chiến lược Tăng trưởng Marketing' },
  { name: 'Nguyễn Nam', role: 'Chuyên gia Lãnh đạo Số' },
  { name: 'Isabella Nguyen', role: 'Trưởng bộ phận Trải nghiệm Học tập' },
  { name: 'Daniel Torres', role: 'Cố vấn AI cho Doanh nghiệp' },
] as const;

export const testimonials: LandingTestimonial[] = [
  {
    quote:
      'EduVerse giúp tôi xây lại lộ trình sự nghiệp rõ ràng hơn. Giao diện đẹp, học rất có động lực.',
    name: 'Minh Châu',
    role: 'Nhà thiết kế Sản phẩm',
  },
  {
    quote:
      'Khóa học thực tiễn, giảng viên phản hồi nhanh và dashboard theo dõi tiến độ cực kỳ rõ ràng.',
    name: 'Đức Huy',
    role: 'Chuyên viên Marketing',
  },
  {
    quote:
      'Tôi thích cảm giác cao cấp của nền tảng. Nội dung tinh gọn, hiện đại và đáng tiền.',
    name: 'Lan Anh',
    role: 'Chuyên viên Phân tích Kinh doanh',
  },
];

export const landingPills = [
  {
    title: 'Học mọi lúc',
    subtitle: 'Linh hoạt',
    icon: AutoAwesomeRounded,
  },
  {
    title: 'Tối ưu lộ trình',
    subtitle: 'Cá nhân hóa',
    icon: QueryStatsRounded,
  },
  {
    title: 'Tăng tốc sự nghiệp',
    subtitle: 'Chứng chỉ',
    icon: EmojiEventsRounded,
  },
] as const;

export const courseCategories: CourseCategory[] = [
  { label: 'Lập trình', value: 'development', count: 124 },
  { label: 'Thiết kế', value: 'design', count: 82 },
  { label: 'Marketing', value: 'marketing', count: 68 },
  { label: 'AI & Data', value: 'ai-data', count: 94 },
  { label: 'Kinh doanh', value: 'business', count: 76 },
  { label: 'Ngoại ngữ', value: 'language', count: 56 },
];

export const courseCatalog: CourseCatalogItem[] = [
  {
    id: 'nextjs-fullstack',
    badge: 'Bán chạy',
    title: 'Lập trình Web Fullstack với React & Node.js',
    instructor: 'Lê Trần Bình',
    rating: 4.9,
    students: '12,405',
    duration: '47 giờ',
    price: '799.000đ',
    originalPrice: '1.299.000đ',
    category: 'development',
    level: 'Trung cấp',
    isFree: false,
    tags: ['Lập trình', 'React', 'Node.js'],
    palette: ['#09131d', '#17445f', '#0b1018'],
  },
  {
    id: 'ux-masterclass',
    badge: 'Khóa mới',
    title: 'Chuyên đề Thiết kế UI/UX 2026',
    instructor: 'Diễm Phương',
    rating: 4.8,
    students: '13,210',
    duration: '29 giờ',
    price: '1.490.000đ',
    originalPrice: '2.500.000đ',
    category: 'design',
    level: 'Nâng cao',
    isFree: false,
    tags: ['Thiết kế', 'UI/UX', 'Figma'],
    palette: ['#24131f', '#8e4a59', '#231722'],
  },
  {
    id: 'digital-marketing',
    badge: 'Xu hướng',
    title: 'Chiến lược Marketing số cho Thương hiệu Hiện đại',
    instructor: 'Minh Quân',
    rating: 4.7,
    students: '8,900',
    duration: '35 giờ',
    price: '850.000đ',
    originalPrice: '1.800.000đ',
    category: 'marketing',
    level: 'Trung cấp',
    isFree: false,
    tags: ['Marketing', 'Hiệu suất', 'Thương hiệu'],
    palette: ['#07131e', '#0d617b', '#081119'],
  },
  {
    id: 'ai-business',
    badge: 'Đánh giá cao',
    title: 'AI & Dữ liệu cho Lãnh đạo Doanh nghiệp',
    instructor: 'Daniel Torres',
    rating: 4.9,
    students: '6,420',
    duration: '26 giờ',
    price: '1.990.000đ',
    originalPrice: '2.890.000đ',
    category: 'ai-data',
    level: 'Nâng cao',
    isFree: false,
    tags: ['AI & Dữ liệu', 'Lãnh đạo', 'Phân tích'],
    palette: ['#061019', '#15566e', '#08131d'],
  },
  {
    id: 'reactjs',
    badge: 'Phổ biến',
    title: 'Lập trình ReactJS toàn tập 2026',
    instructor: 'Lê Trần Bình',
    rating: 4.8,
    students: '8,540',
    duration: '32 giờ',
    price: '599.000đ',
    originalPrice: '1.099.000đ',
    category: 'development',
    level: 'Người mới bắt đầu',
    isFree: false,
    tags: ['React', 'Frontend', 'JavaScript'],
    palette: ['#0f172a', '#2563eb', '#1e293b'],
  },
  {
    id: 'aspnetcore',
    badge: 'Nổi bật',
    title: 'Xây dựng Web API với ASP.NET Core',
    instructor: 'Phạm Việt Hùng',
    rating: 4.9,
    students: '6,210',
    duration: '40 giờ',
    price: '899.000đ',
    originalPrice: '1.590.000đ',
    category: 'development',
    level: 'Trung cấp',
    isFree: false,
    tags: ['C#', 'ASP.NET Core', 'Web API'],
    palette: ['#1e1b4b', '#4f46e5', '#312e81'],
  },
  {
    id: 'nodejs',
    badge: 'Thực chiến',
    title: 'Lập trình NodeJS & Express thực chiến',
    instructor: 'Lê Trần Bình',
    rating: 4.7,
    students: '9,850',
    duration: '36 giờ',
    price: '699.000đ',
    originalPrice: '1.299.000đ',
    category: 'development',
    level: 'Trung cấp',
    isFree: false,
    tags: ['Node.js', 'Express', 'Backend'],
    palette: ['#062f4f', '#111111', '#222222'],
  },
  {
    id: 'flutter',
    badge: 'Xu hướng',
    title: 'Lập trình di động đa nền tảng với Flutter',
    instructor: 'Hoàng Gia Bảo',
    rating: 4.8,
    students: '5,340',
    duration: '45 giờ',
    price: '999.000đ',
    originalPrice: '1.890.000đ',
    category: 'development',
    level: 'Người mới bắt đầu',
    isFree: false,
    tags: ['Flutter', 'Dart', 'Mobile'],
    palette: ['#0f172a', '#0284c7', '#0f172a'],
  },
  {
    id: 'docker',
    badge: 'Cơ bản',
    title: 'Đóng gói ứng dụng với Docker & Compose',
    instructor: 'Phạm Việt Hùng',
    rating: 4.6,
    students: '4,200',
    duration: '15 giờ',
    price: '499.000đ',
    originalPrice: '890.000đ',
    category: 'development',
    level: 'Người mới bắt đầu',
    isFree: false,
    tags: ['Docker', 'DevOps', 'Containers'],
    palette: ['#172554', '#1d4ed8', '#1e3a8a'],
  },
  {
    id: 'kubernetes',
    badge: 'Nâng cao',
    title: 'Triển khai Kubernetes trong Doanh nghiệp',
    instructor: 'Phạm Việt Hùng',
    rating: 4.9,
    students: '3,110',
    duration: '30 giờ',
    price: '1.290.000đ',
    originalPrice: '2.490.000đ',
    category: 'development',
    level: 'Nâng cao',
    isFree: false,
    tags: ['Kubernetes', 'K8s', 'DevOps'],
    palette: ['#1e1b4b', '#4338ca', '#312e81'],
  },
  {
    id: 'mongodb',
    badge: 'Dễ học',
    title: 'Làm chủ cơ sở dữ liệu NoSQL MongoDB',
    instructor: 'TS. Nguyễn Minh Anh',
    rating: 4.7,
    students: '4,670',
    duration: '20 giờ',
    price: '399.000đ',
    originalPrice: '790.000đ',
    category: 'ai-data',
    level: 'Người mới bắt đầu',
    isFree: false,
    tags: ['MongoDB', 'NoSQL', 'Database'],
    palette: ['#064e3b', '#059669', '#022c22'],
  },
  {
    id: 'sqlserver',
    badge: 'Quan trọng',
    title: 'Thiết kế & Tối ưu Cơ sở dữ liệu SQL Server',
    instructor: 'TS. Nguyễn Minh Anh',
    rating: 4.8,
    students: '7,820',
    duration: '24 giờ',
    price: '450.000đ',
    originalPrice: '890.000đ',
    category: 'ai-data',
    level: 'Trung cấp',
    isFree: false,
    tags: ['SQL Server', 'Database', 'T-SQL'],
    palette: ['#1a0f0f', '#8B1313', '#200d0d'],
  },
];

export const instructorCategories: InstructorCategory[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Kỹ thuật', value: 'technology' },
  { label: 'Thiết kế', value: 'design' },
  { label: 'Kinh doanh', value: 'business' },
  { label: 'AI & Data', value: 'ai-data' },
];

export const instructorCatalog: InstructorItem[] = [
  {
    id: 'nguyen-minh-anh',
    name: 'TS. Nguyễn Minh Anh',
    specialization: 'Chuyên gia Khoa học Dữ liệu & AI',
    shortBio:
      'Hơn 12 năm kinh nghiệm thiết kế hệ thống dữ liệu, cố vấn chiến lược AI và triển khai đổi mới số cho doanh nghiệp.',
    rating: 4.9,
    students: '12,500+',
    courses: 8,
    experience: '12 năm',
    category: 'ai-data',
    featured: true,
    palette: ['#1f0f12', '#8B1313', '#251013'],
    socials: [
      { label: 'LinkedIn', href: '#' },
      { label: 'Email', href: '#' },
      { label: 'Website', href: '#' },
    ],
  },
  {
    id: 'ha-hoang-nam',
    name: 'ThS. Lê Hoàng Nam',
    specialization: 'Giám đốc Sáng tạo & Thiết kế UX/UI',
    shortBio:
      'Người đứng sau nhiều sản phẩm số quy mô lớn, tập trung vào trải nghiệm người dùng và hệ thiết kế hiện đại.',
    rating: 5.0,
    students: '8,900+',
    courses: 6,
    experience: '10 năm',
    category: 'design',
    featured: true,
    palette: ['#160f16', '#8e4a59', '#241621'],
    socials: [
      { label: 'Dribbble', href: '#' },
      { label: 'Behance', href: '#' },
      { label: 'Email', href: '#' },
    ],
  },
  {
    id: 'tran-thu-ha',
    name: 'Trần Thu Hà',
    specialization: 'Trưởng nhóm Quản lý Sản phẩm',
    shortBio:
      'Cố vấn sản phẩm số, chuyên xây dựng lộ trình phát triển kỹ năng quản trị sản phẩm cho đội ngũ trẻ.',
    rating: 4.8,
    students: '8,700+',
    courses: 5,
    experience: '8 năm',
    category: 'business',
    palette: ['#2b1214', '#aa3d4e', '#2a1518'],
    socials: [
      { label: 'LinkedIn', href: '#' },
      { label: 'Email', href: '#' },
    ],
  },
  {
    id: 'pham-viet-hung',
    name: 'Phạm Việt Hùng',
    specialization: 'Tư vấn Điện toán Đám mây',
    shortBio:
      'Chuyên gia kiến trúc hệ thống và điện toán đám mây, đào tạo thực chiến cho kỹ sư backend và DevOps.',
    rating: 4.9,
    students: '12,450+',
    courses: 9,
    experience: '12 năm',
    category: 'technology',
    palette: ['#13212f', '#385671', '#1a2835'],
    socials: [
      { label: 'GitHub', href: '#' },
      { label: 'LinkedIn', href: '#' },
      { label: 'Email', href: '#' },
    ],
  },
  {
    id: 'hoang-gia-bao',
    name: 'Hoàng Gia Bảo',
    specialization: 'Lập trình viên Fullstack',
    shortBio:
      'Tập trung vào React, Node.js và kiến trúc web hiện đại, giúp học viên xây dự án sẵn sàng triển khai thực tế.',
    rating: 4.7,
    students: '8,650+',
    courses: 7,
    experience: '7 năm',
    category: 'technology',
    palette: ['#2a1a12', '#a85b34', '#2b1e18'],
    socials: [
      { label: 'GitHub', href: '#' },
      { label: 'LinkedIn', href: '#' },
    ],
  },
  {
    id: 'dang-thao-linh',
    name: 'Đặng Thảo Linh',
    specialization: 'Chuyên gia Chiến lược Marketing số',
    shortBio:
      'Cố vấn chiến lược marketing đa kênh, nổi bật với nội dung thực tiễn và tư duy đo lường hiệu quả.',
    rating: 5.0,
    students: '10,450+',
    courses: 6,
    experience: '9 năm',
    category: 'business',
    palette: ['#0f1724', '#253f6c', '#131d2a'],
    socials: [
      { label: 'LinkedIn', href: '#' },
      { label: 'Email', href: '#' },
      { label: 'Website', href: '#' },
    ],
  },
  {
    id: 'vu-thanh-lam',
    name: 'Vũ Thanh Lâm',
    specialization: 'Tư vấn Sản phẩm AI',
    shortBio:
      'Kết nối AI với bài toán sản phẩm và vận hành, đồng hành cùng nhiều startup trong hành trình tăng trưởng.',
    rating: 4.9,
    students: '9,200+',
    courses: 4,
    experience: '11 năm',
    category: 'ai-data',
    palette: ['#101624', '#20506b', '#142233'],
    socials: [
      { label: 'LinkedIn', href: '#' },
      { label: 'Email', href: '#' },
    ],
  },
  {
    id: 'ngo-diem-my',
    name: 'Ngô Diễm My',
    specialization: 'Nhà thiết kế Thương hiệu & Hình ảnh',
    shortBio:
      'Giảng viên thiết kế thương hiệu với gu thẩm mỹ hiện đại, tập trung vào tính ứng dụng và hệ thống hóa tư duy.',
    rating: 4.8,
    students: '7,980+',
    courses: 5,
    experience: '8 năm',
    category: 'design',
    palette: ['#2a1117', '#8f405a', '#2c1620'],
    socials: [
      { label: 'Behance', href: '#' },
      { label: 'Dribbble', href: '#' },
      { label: 'Email', href: '#' },
    ],
  },
];

export const instructorTestimonials: LandingTestimonial[] = [
  {
    quote:
      'EduVerse giúp mình tiếp cận giảng viên chất lượng cao, bài giảng sâu và rất gần với thực tế công việc.',
    name: 'Lê Văn Tùng',
    role: 'Học viên khóa Khoa học Dữ liệu',
  },
  {
    quote:
      'Mình học được rất nhiều từ cách giảng viên giải thích tình huống thực tế. Rõ ràng, hiện đại và truyền cảm hứng.',
    name: 'Nguyễn Thùy Dương',
    role: 'Học viên khóa Thiết kế UI/UX',
  },
];

export const aboutValues: AboutValueItem[] = [
  {
    title: 'Sứ mệnh',
    description:
      'Mở ra môi trường học tập chuẩn quốc tế, nơi mọi người có thể nâng cấp kỹ năng thực chiến và phát triển sự nghiệp bền vững.',
    icon: SchoolRounded,
  },
  {
    title: 'Tầm nhìn',
    description:
      'Trở thành nền tảng e-learning dẫn đầu cho người đi làm tại Việt Nam với trải nghiệm học tập hiện đại, tinh gọn và truyền cảm hứng.',
    icon: PublicRounded,
  },
  {
    title: 'Giá trị cốt lõi',
    description:
      'Lấy chất lượng nội dung, tính ứng dụng thực tế, cá nhân hóa và cộng đồng học tập làm trọng tâm phát triển lâu dài.',
    icon: WorkspacePremiumRounded,
  },
  {
    title: 'Triết lý học tập',
    description:
      'Học để làm được việc. Mỗi khóa học đều hướng đến năng lực thực tế, dự án thật và khả năng áp dụng ngay vào công việc.',
    icon: QueryStatsRounded,
  },
];

export const aboutTimeline: AboutTimelineItem[] = [
  {
    year: 'Quý 1 · 2026',
    title: 'Hình thành ý tưởng EduVerse',
    description:
      'Đội ngũ sáng lập bắt đầu phác thảo mô hình học tập số, tập trung vào người đi làm và kỹ năng thực chiến.',
  },
  {
    year: 'Quý 2 · 2026',
    title: 'Xây dựng nền tảng',
    description:
      'Bắt tay phát triển hệ thống khóa học, công cụ cho giảng viên và trải nghiệm học tập trực tuyến đầu tiên.',
  },
  {
    year: 'Quý 3 · 2026',
    title: 'Ra mắt phiên bản đầu tiên',
    description:
      'Giới thiệu những khóa học đầu tiên về công nghệ, thiết kế và quản trị cùng mô hình giảng viên đồng hành.',
  },
  {
    year: 'Định hướng 2027',
    title: 'Mở rộng hệ sinh thái học tập',
    description:
      'Từng bước mở rộng danh mục nội dung, hoàn thiện dashboard học tập, chứng chỉ và hỗ trợ nghề nghiệp cho học viên.',
  },
];

export const contactInfo = [
  {
    title: 'Email hỗ trợ',
    value: 'support@eduverse.edu.vn',
    detail: 'Phản hồi trong vòng 24 giờ làm việc',
    icon: SchoolRounded,
  },
  {
    title: 'Hotline',
    value: '1900 8888 66',
    detail: 'Tư vấn khóa học và hỗ trợ kỹ thuật',
    icon: QueryStatsRounded,
  },
  {
    title: 'Địa chỉ',
    value: 'Lầu 15, Tòa nhà Innovation, Quận 12, TP.HCM',
    detail: 'Không gian gặp gỡ đối tác và tổ chức workshop',
    icon: PublicRounded,
  },
  {
    title: 'Giờ làm việc',
    value: 'Thứ 2 - Thứ 6: 08:00 - 18:00',
    detail: 'Thứ 7: 08:00 - 12:00',
    icon: WorkspacePremiumRounded,
  },
] satisfies ContactInfoItem[];

export const contactFaqs: ContactFaqItem[] = [
  {
    question: 'Bao lâu EduVerse phản hồi sau khi gửi form?',
    answer: 'Đội ngũ hỗ trợ thường phản hồi trong vòng 24 giờ làm việc qua email hoặc hotline.',
  },
  {
    question: 'Tôi có thể nhận tư vấn lộ trình học cá nhân không?',
    answer: 'Có. Bạn chỉ cần để lại mục tiêu học tập, đội ngũ EduVerse sẽ đề xuất lộ trình phù hợp.',
  },
  {
    question: 'Doanh nghiệp muốn hợp tác đào tạo thì liên hệ ở đâu?',
    answer: 'Bạn có thể dùng form liên hệ hoặc gửi trực tiếp email tới bộ phận hợp tác tại support@eduverse.edu.vn.',
  },
] as const;
