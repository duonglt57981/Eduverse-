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
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';

export type DashboardNavItem = {
  label: string;
  icon: SvgIconComponent;
  active?: boolean;
};

export type DashboardStatCard = {
  label: string;
  value: string;
  caption: string;
  icon: SvgIconComponent;
};

export type DashboardCourse = {
  title: string;
  mentor: string;
  progress: number;
  badge: string;
  palette: [string, string, string];
};

export type DashboardFeaturedCourse = {
  title: string;
  subtitle: string;
  price: string;
  palette: [string, string, string];
};

export type DashboardQuickAction = {
  title: string;
  desc: string;
  icon: SvgIconComponent;
};

export type DashboardScheduleItem = {
  time: string;
  duration: string;
  title: string;
  detail: string;
};

export type DashboardAssessment = {
  subject: string;
  score: string;
  status: string;
  tone: string;
  bg: string;
};

export type DashboardActivity = {
  title: string;
  time: string;
};

export const sidebarPrimaryItems: DashboardNavItem[] = [
  { label: 'Trang chủ', icon: HomeRounded, active: true },
  { label: 'Khóa học của tôi', icon: MenuBookRounded },
  { label: 'Khám phá', icon: ExploreRounded },
  { label: 'Lịch học', icon: CalendarMonthRounded },
  { label: 'Kiểm tra', icon: QuizRounded },
  { label: 'Chứng chỉ', icon: EmojiEventsRounded },
  { label: 'Yêu thích', icon: FavoriteBorderRounded },
  { label: 'Thông báo', icon: NotificationsRounded },
] as const;

export const sidebarSecondaryItems: DashboardNavItem[] = [
  { label: 'Hồ sơ', icon: SchoolRounded },
  { label: 'Cài đặt', icon: SettingsRounded },
] as const;

export const statCards: DashboardStatCard[] = [
  {
    label: 'Khóa học',
    value: '12',
    caption: '3 khóa học mới tuần này',
    icon: MenuBookRounded,
  },
  {
    label: 'Số giờ học',
    value: '45.5h',
    caption: 'Tăng 6.4h so với tuần trước',
    icon: AccessTimeRounded,
  },
  {
    label: 'Chứng chỉ',
    value: '08',
    caption: '2 chứng chỉ đang chờ duyệt',
    icon: AssignmentTurnedInRounded,
  },
  {
    label: 'Tiến độ',
    value: '82%',
    caption: 'Gần mục tiêu 90% tháng này',
    icon: TimelineRounded,
  },
] as const;

export const inProgressCourses: DashboardCourse[] = [
  {
    title: 'Quản trị Chiến lược Cấp cao',
    mentor: 'GS. Robert Chang',
    progress: 75,
    badge: 'Cao cấp',
    palette: ['#13090c', '#3e0f12', '#11090c'],
  },
  {
    title: 'Phân tích Tài chính Doanh nghiệp',
    mentor: 'TS. Elena Gilbert',
    progress: 40,
    badge: 'Phổ biến',
    palette: ['#0d0f14', '#292f3d', '#0f1219'],
  },
] as const;

export const featuredCourses: DashboardFeaturedCourse[] = [
  {
    title: 'Lãnh đạo trong Kỷ nguyên Số',
    subtitle: '4.9 (1.2K học viên)',
    price: '2.490.000đ',
    palette: ['#16080d', '#7e1015', '#231013'],
  },
  {
    title: 'Thiết kế Trải nghiệm Người dùng',
    subtitle: '4.8 (850 học viên)',
    price: '1.850.000đ',
    palette: ['#05111f', '#15263d', '#09131d'],
  },
] as const;

export const quickActions: DashboardQuickAction[] = [
  {
    title: 'Đặt lịch giảng viên',
    desc: 'Trao đổi 1:1 với giảng viên',
    icon: CampaignRounded,
  },
  {
    title: 'Ôn tập nhanh',
    desc: 'Làm bài kiểm tra trong 10 phút',
    icon: QuizRounded,
  },
  {
    title: 'Báo cáo tiến độ',
    desc: 'Xem đánh giá tuần này',
    icon: AutoGraphRounded,
  },
] as const;

export const todaySchedule: DashboardScheduleItem[] = [
  {
    time: '14:00',
    duration: '90 phút',
    title: 'Kỹ năng Quản trị',
    detail: 'Workshop trực tiếp với TS. Nam',
  },
  {
    time: '16:30',
    duration: '45 phút',
    title: 'Tài chính Quốc tế',
    detail: 'Video bài giảng Chương 4',
  },
] as const;

export const recentAssessments: DashboardAssessment[] = [
  {
    subject: 'Marketing Căn bản',
    score: '8.5',
    status: 'Đạt',
    tone: '#1f7a4d',
    bg: 'rgba(31,122,77,0.10)',
  },
  {
    subject: 'Phân tích Vi mô',
    score: '8.2',
    status: 'Đạt',
    tone: '#1f7a4d',
    bg: 'rgba(31,122,77,0.10)',
  },
  {
    subject: 'Anh văn Thương mại',
    score: '--',
    status: 'Sắp tới',
    tone: '#a33a22',
    bg: 'rgba(163,58,34,0.10)',
  },
] as const;

export const activities: DashboardActivity[] = [
  {
    title: 'Bạn hoàn thành bài tập "Lãnh đạo Chiến lược".',
    time: '10 phút trước',
  },
  {
    title: 'Chứng chỉ "Phân tích Kinh doanh" đã được cấp.',
    time: '2 giờ trước',
  },
  {
    title: 'Lịch học mới đã được thêm vào tối nay.',
    time: 'Hôm nay',
  },
] as const;