import {
  AccessTimeRounded,
  AssignmentTurnedInRounded,
  AutoGraphRounded,
  CalendarMonthRounded,
  CampaignRounded,
  EmojiEventsRounded,
  ExploreRounded,
  FavoriteBorderRounded,
  HomeRounded,
  MenuBookRounded,
  NotificationsRounded,
  QuizRounded,
  SchoolRounded,
  SettingsRounded,
  TimelineRounded,
  PsychologyRounded,
  CodeRounded,
  CloudQueueRounded,
  TrendingUpRounded,
  WorkspacePremiumRounded,
  BarChartRounded,
  OfflineBoltRounded,
  EventRounded,
  AutoAwesomeRounded
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';

// --- TYPES ---

export type DashboardNavItem = {
  label: string;
  icon: SvgIconComponent;
  active?: boolean;
  badge?: number;
};

export type WelcomeStats = {
  userName: string;
  avatarUrl?: string;
  subtitle: string;
  totalCourses: number;
  progressPercent: number;
  certificatesCount: number;
};

export type AIRecommendationBanner = {
  id: string;
  type: 'ai_recommend' | 'skill_assess';
  title: string;
  description: string;
  buttonText: string;
  bgGradient: string;
  illustrationType: 'ai' | 'tech';
};

export type ContinueCourseItem = {
  id: string;
  title: string;
  contentType: string;
  duration: string;
  progress: number;
  thumbnailGradient: string;
};

export type ContinueLearningData = {
  courses: ContinueCourseItem[];
  paths: ContinueCourseItem[];
  certificates: ContinueCourseItem[];
  assessments: ContinueCourseItem[];
};

export type NextSectorItem = {
  id: string;
  title: string;
  iconName: 'data' | 'ai' | 'cloud' | 'marketing';
  subfields: string[];
  bgLight: string;
  iconColor: string;
};

export type CourseCardItem = {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  studentsCount: number;
  level: 'Cơ bản' | 'Trung cấp' | 'Nâng cao';
  thumbnailGradient: string;
};

export type PremiumFeaturedCourse = {
  title: string;
  description: string;
  instructor: string;
  rating: number;
  studentsCount: number;
  level: string;
  thumbnailGradient: string;
  relatedCourses: CourseCardItem[];
};

export type HistoryRecommendation = {
  basedOnCourse: string;
  courses: CourseCardItem[];
};

export type TrendingCourseItem = {
  id: string;
  title: string;
  tag: 'Xu hướng' | 'Hot' | 'Được yêu thích';
  tagColor: string;
  tagBg: string;
  studentsCount: number;
  rating: number;
};

export type LearningAchievements = {
  streakDays: number;
  certificates: number;
  hoursSpent: number;
  skillScore: number;
};

export type UpcomingEventItem = {
  id: string;
  type: 'Webinar AI' | 'Workshop UI/UX' | 'Talkshow Career Path';
  title: string;
  date: string;
  time: string;
  speaker: string;
};

export type FooterColumn = {
  title: string;
  links: { label: string; url: string }[];
};

// --- MOCK DATA ---

export const sidebarPrimaryItems: DashboardNavItem[] = [
  { label: 'Trang chủ', icon: HomeRounded, active: true },
  { label: 'Khóa học của tôi', icon: MenuBookRounded },
  { label: 'Khám phá', icon: ExploreRounded },
  { label: 'Lộ trình học tập', icon: TimelineRounded },
  { label: 'Lịch học', icon: CalendarMonthRounded },
  { label: 'Kiểm tra & Đánh giá', icon: QuizRounded },
  { label: 'Chứng chỉ', icon: EmojiEventsRounded },
  { label: 'Yêu thích', icon: FavoriteBorderRounded },
] as const;

export const sidebarSecondaryItems: DashboardNavItem[] = [
  { label: 'Hồ sơ cá nhân', icon: SchoolRounded },
  { label: 'Cài đặt hệ thống', icon: SettingsRounded },
] as const;

export const welcomeData: WelcomeStats = {
  userName: 'Nguyễn Văn A',
  subtitle: 'Hôm nay là thời điểm tuyệt vời để tiếp tục hành trình học tập của bạn.',
  totalCourses: 6,
  progressPercent: 72,
  certificatesCount: 4,
};

export const aiRecommendationBanners: AIRecommendationBanner[] = [
  {
    id: 'banner-ai',
    type: 'ai_recommend',
    title: 'AI đề xuất khóa học phù hợp',
    description: 'Dựa trên lịch sử học tập, AI đề xuất các kỹ năng và khóa học giúp bạn phát triển nhanh hơn.',
    buttonText: 'Khám phá ngay',
    bgGradient: 'linear-gradient(135deg, #8B1E3F 0%, #7C3AED 100%)',
    illustrationType: 'ai',
  },
  {
    id: 'banner-skills',
    type: 'skill_assess',
    title: 'Kiểm tra năng lực của bạn',
    description: 'Thực hiện bài đánh giá để AI xây dựng lộ trình học tập tối ưu.',
    buttonText: 'Bắt đầu đánh giá',
    bgGradient: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
    illustrationType: 'tech',
  },
];

export const continueLearningTabsData: ContinueLearningData = {
  courses: [
    {
      id: 'c-1',
      title: 'HTML & CSS Nâng Cao',
      contentType: 'Video bài giảng',
      duration: 'Còn 2 giờ học',
      progress: 70,
      thumbnailGradient: 'linear-gradient(135deg, #F43F5E 0%, #C084FC 100%)',
    },
    {
      id: 'c-2',
      title: 'Lập trình Javascript Thực Chiến',
      contentType: 'Thực hành Lab',
      duration: 'Còn 4 giờ học',
      progress: 45,
      thumbnailGradient: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
    },
    {
      id: 'c-3',
      title: 'Thiết kế giao diện với Figma',
      contentType: 'Video bài giảng',
      duration: 'Còn 1.5 giờ học',
      progress: 85,
      thumbnailGradient: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
    },
  ],
  paths: [
    {
      id: 'p-1',
      title: 'Lộ trình Frontend Developer chuyên nghiệp',
      contentType: 'Lộ trình nghề nghiệp',
      duration: 'Còn 12 khóa học',
      progress: 35,
      thumbnailGradient: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
    },
    {
      id: 'p-2',
      title: 'Lộ trình Trở thành AI Engineer',
      contentType: 'Lộ trình nâng cấp',
      duration: 'Còn 8 khóa học',
      progress: 15,
      thumbnailGradient: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
    },
  ],
  certificates: [
    {
      id: 'cert-1',
      title: 'Chứng chỉ ReactJS nâng cao',
      contentType: 'Dự án tốt nghiệp',
      duration: 'Đang chấm điểm',
      progress: 95,
      thumbnailGradient: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
    },
    {
      id: 'cert-2',
      title: 'Chứng chỉ UI/UX Professional',
      contentType: 'Bài thi lý thuyết & Thực hành',
      duration: 'Còn 1 bài thi',
      progress: 80,
      thumbnailGradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    },
  ],
  assessments: [
    {
      id: 'test-1',
      title: 'Kiểm tra Tư duy Thuật toán & Cấu trúc dữ liệu',
      contentType: 'Trắc nghiệm & Code',
      duration: '45 phút',
      progress: 0,
      thumbnailGradient: 'linear-gradient(135deg, #6B7280 0%, #374151 100%)',
    },
    {
      id: 'test-2',
      title: 'Đánh giá năng lực Tiếng Anh đầu ra B2',
      contentType: 'Nghe & Đọc',
      duration: '90 phút',
      progress: 0,
      thumbnailGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    },
  ],
};

export const nextSectorsData: NextSectorItem[] = [
  {
    id: 'sec-1',
    title: 'Data Science',
    iconName: 'data',
    subfields: ['Phân tích dữ liệu', 'Machine Learning'],
    bgLight: 'rgba(14, 165, 233, 0.05)',
    iconColor: '#0EA5E9',
  },
  {
    id: 'sec-2',
    title: 'AI & Generative AI',
    iconName: 'ai',
    subfields: ['Prompt Engineering', 'AI Agents'],
    bgLight: 'rgba(124, 58, 237, 0.05)',
    iconColor: '#7C3AED',
  },
  {
    id: 'sec-3',
    title: 'Cloud Computing',
    iconName: 'cloud',
    subfields: ['AWS', 'Azure'],
    bgLight: 'rgba(236, 72, 153, 0.05)',
    iconColor: '#EC4899',
  },
  {
    id: 'sec-4',
    title: 'Digital Marketing',
    iconName: 'marketing',
    subfields: ['SEO', 'Content Marketing'],
    bgLight: 'rgba(16, 185, 129, 0.05)',
    iconColor: '#10B981',
  },
];

export const interestedSkillsBadges: string[] = ['AI', 'Python', 'ReactJS', 'SQL Server', 'AWS', 'UI/UX'];

export const skillsCoursesData: CourseCardItem[] = [
  {
    id: 'sc-1',
    title: 'Xây dựng ứng dụng AI với Python & OpenAI',
    instructor: 'TS. Nguyễn Minh Triết',
    rating: 4.9,
    studentsCount: 1540,
    level: 'Nâng cao',
    thumbnailGradient: 'linear-gradient(135deg, #7C3AED 0%, #C74A67 100%)',
  },
  {
    id: 'sc-2',
    title: 'Lập trình Fullstack với ReactJS & NodeJS',
    instructor: 'ThS. Trần Hoàng Nam',
    rating: 4.8,
    studentsCount: 3200,
    level: 'Trung cấp',
    thumbnailGradient: 'linear-gradient(135deg, #0EA5E9 0%, #7C3AED 100%)',
  },
  {
    id: 'sc-3',
    title: 'Thiết kế giao diện UI/UX chuẩn Modern SaaS',
    instructor: 'Designer Nguyễn Hải Yến',
    rating: 4.9,
    studentsCount: 980,
    level: 'Cơ bản',
    thumbnailGradient: 'linear-gradient(135deg, #EC4899 0%, #C74A67 100%)',
  },
  {
    id: 'sc-4',
    title: 'Quản trị Cơ sở dữ liệu với SQL Server',
    instructor: 'TS. Phạm Ngọc Anh',
    rating: 4.6,
    studentsCount: 1250,
    level: 'Trung cấp',
    thumbnailGradient: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
  },
];

export const premiumSelectionData: PremiumFeaturedCourse = {
  title: 'Chuyên gia Thiết kế Giải pháp đám mây AWS (Solutions Architect)',
  description: 'Trở thành kiến trúc sư đám mây chuyên nghiệp. Học cách thiết kế hệ thống chịu tải lớn, bảo mật cao và tối ưu chi phí trên nền tảng AWS. Khóa học bao gồm lý thuyết chuyên sâu và hơn 20 bài thực hành Lab thực tế giúp bạn sẵn sàng chinh phục chứng chỉ quốc tế AWS SAA-C03.',
  instructor: 'AWS Certified Trainer - Mr. Hoàng Lâm',
  rating: 4.95,
  studentsCount: 1850,
  level: 'Nâng cao (Chuyên nghiệp)',
  thumbnailGradient: 'linear-gradient(135deg, #8B1E3F 0%, #1E1B4B 100%)',
  relatedCourses: [
    {
      id: 'pre-rel-1',
      title: 'AWS Cloud Practitioner Essentials',
      instructor: 'Mr. Hoàng Lâm',
      rating: 4.7,
      studentsCount: 2400,
      level: 'Cơ bản',
      thumbnailGradient: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
    },
    {
      id: 'pre-rel-2',
      title: 'Kubernetes & Docker trên AWS',
      instructor: 'TS. Vũ Hải Nam',
      rating: 4.85,
      studentsCount: 920,
      level: 'Nâng cao',
      thumbnailGradient: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)',
    },
    {
      id: 'pre-rel-3',
      title: 'Bảo mật Hệ thống thông tin đám mây',
      instructor: 'Chuyên gia Lê Minh Tuấn',
      rating: 4.9,
      studentsCount: 750,
      level: 'Nâng cao',
      thumbnailGradient: 'linear-gradient(135deg, #DC2626 0%, #7F1D1D 100%)',
    },
  ],
};

export const historyRecommendationData: HistoryRecommendation = {
  basedOnCourse: 'Lập trình Web Frontend',
  courses: [
    {
      id: 'hist-1',
      title: 'Lập trình ReactJS chuyên sâu từ Zero đến Hero',
      instructor: 'ThS. Trần Hoàng Nam',
      rating: 4.9,
      studentsCount: 2100,
      level: 'Trung cấp',
      thumbnailGradient: 'linear-gradient(135deg, #0891B2 0%, #083344 100%)',
    },
    {
      id: 'hist-2',
      title: 'Xây dựng Web App với NextJS 14 (App Router)',
      instructor: 'Developer Nguyễn Văn Minh',
      rating: 4.85,
      studentsCount: 1450,
      level: 'Nâng cao',
      thumbnailGradient: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
    },
    {
      id: 'hist-3',
      title: 'TypeScript toàn tập cho Lập trình viên JavaScript',
      instructor: 'Developer Hoàng Quốc Khánh',
      rating: 4.75,
      studentsCount: 1800,
      level: 'Trung cấp',
      thumbnailGradient: 'linear-gradient(135deg, #2563EB 0%, #1E3A8A 100%)',
    },
    {
      id: 'hist-4',
      title: 'Thiết kế giao diện UI/UX hiện đại trên Web',
      instructor: 'Designer Nguyễn Hải Yến',
      rating: 4.8,
      studentsCount: 1100,
      level: 'Cơ bản',
      thumbnailGradient: 'linear-gradient(135deg, #C084FC 0%, #581C87 100%)',
    },
  ],
};

export const trendingCoursesData: TrendingCourseItem[] = [
  {
    id: 'tr-1',
    title: 'Phát triển Đại lý AI (AI Agents) thế hệ mới',
    tag: 'Xu hướng',
    tagColor: '#FFFFFF',
    tagBg: 'linear-gradient(135deg, #8B1E3F 0%, #7C3AED 100%)',
    studentsCount: 2450,
    rating: 4.95,
  },
  {
    id: 'tr-2',
    title: 'Kỹ nghệ Gợi ý (Prompt Engineering) chuyên nghiệp',
    tag: 'Hot',
    tagColor: '#FFFFFF',
    tagBg: '#C74A67',
    studentsCount: 4200,
    rating: 4.85,
  },
  {
    id: 'tr-3',
    title: 'AWS Certified Solutions Architect (SAA-C03)',
    tag: 'Được yêu thích',
    tagColor: '#FFFFFF',
    tagBg: '#7C3AED',
    studentsCount: 1850,
    rating: 4.9,
  },
  {
    id: 'tr-4',
    title: 'Phân tích dữ liệu kinh doanh (Data Analyst)',
    tag: 'Hot',
    tagColor: '#FFFFFF',
    tagBg: '#C74A67',
    studentsCount: 3100,
    rating: 4.75,
  },
  {
    id: 'tr-5',
    title: 'An ninh mạng & Phòng chống tấn công (Cyber Security)',
    tag: 'Xu hướng',
    tagColor: '#FFFFFF',
    tagBg: 'linear-gradient(135deg, #8B1E3F 0%, #7C3AED 100%)',
    studentsCount: 1250,
    rating: 4.8,
  },
];

export const learningAchievementsData: LearningAchievements = {
  streakDays: 12,
  certificates: 8,
  hoursSpent: 54,
  skillScore: 850,
};

export const upcomingEventsData: UpcomingEventItem[] = [
  {
    id: 'ev-1',
    type: 'Webinar AI',
    title: 'Tương lai của Lập trình: Đồng hành cùng AI Copilot & Agents',
    date: '15/06/2026',
    time: '19:30 - 21:30',
    speaker: 'GS. TS. Nguyễn Thanh Đức (AI Research Lead)',
  },
  {
    id: 'ev-2',
    type: 'Workshop UI/UX',
    title: 'Ứng dụng Material Design 3 vào Thiết kế Sản phẩm SaaS chuyên nghiệp',
    date: '20/06/2026',
    time: '09:00 - 11:30',
    speaker: 'Mrs. Yến Nguyễn (Senior Product Designer)',
  },
  {
    id: 'ev-3',
    type: 'Talkshow Career Path',
    title: 'Lộ trình thăng tiến lên Kiến trúc sư giải pháp Đám mây (Solutions Architect)',
    date: '25/06/2026',
    time: '14:30 - 16:30',
    speaker: 'Mr. Lâm Hoàng (Principal Solutions Architect)',
  },
];

export const footerColumnsData: FooterColumn[] = [
  {
    title: 'EduVerse',
    links: [
      { label: 'Giới thiệu về nền tảng', url: '/about-us' },
      { label: 'Liên hệ hợp tác', url: '/contact' },
      { label: 'Điều khoản dịch vụ', url: '/terms' },
    ],
  },
  {
    title: 'Hỗ trợ học viên',
    links: [
      { label: 'Câu hỏi thường gặp FAQ', url: '/faq' },
      { label: 'Trung tâm trợ giúp', url: '/help' },
      { label: 'Báo lỗi hệ thống', url: '/report-bug' },
    ],
  },
  {
    title: 'Chương trình học',
    links: [
      { label: 'Danh mục khóa học', url: '/courses' },
      { label: 'Lộ trình nghề nghiệp', url: '/paths' },
      { label: 'Chứng chỉ quốc tế', url: '/certificates' },
    ],
  },
];