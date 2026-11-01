import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Users,
  UserCheck,
  Calendar,
  FileText,
  HelpCircle,
  Folder,
  Sparkles,
  Award,
  AlertTriangle,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  CheckSquare,
  MessageSquare,
  ShieldCheck,
  Settings,
  Building,
  CalendarDays,
  History,
  ClipboardList,
  ChevronDown,
  Bell,
  GraduationCap,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useClass } from '../../contexts/ClassContext';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeColor?: 'blue' | 'red';
  iconColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role } = useAuth();
  const { currentClass } = useClass();
  const location = useLocation();

  // State to track expanded status of menu sections (collapsible) - all expanded by default as in Image 2
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'LỚP HỌC': true,
    'DẠY & HỌC': true,
    'THEO DÕI & ĐÁNH GIÁ': true,
    'Học tập': true,
    'Kết quả & Học liệu': true,
    'Theo dõi con em': true,
    'Liên lạc': true,
    'Quản trị hệ thống': true,
    'Bảo mật & Cấu hình': true,
  });

  const toggleSection = (groupName: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };


  // TEACHER NAVIGATION EXACTLY DESIGNED LIKE IMAGE 2:
  // - Top Standalone: Tổng quan
  // - Group 1: LỚP HỌC (4) -> Lớp của tôi, Học sinh, Điểm danh, Thời khóa biểu
  // - Group 2: DẠY & HỌC (5) -> Ngân hàng câu hỏi (Vị trí 1), Giao bài tập (badge động), Chấm bài tự động, Tài liệu số, AI Hỗ trợ
  // - Group 3: THEO DÕI & ĐÁNH GIÁ (4) -> Sổ điểm điện tử, Chuyên cần, Hành vi & Nề nếp, Cảnh báo thông minh (badge động)
  const teacherTopStandalone: NavItem = {
    to: '/teacher/dashboard',
    label: 'Tổng quan',
    icon: LayoutGrid,
  };

  const teacherNavGroups: {
    group: string;
    countBadge: number;
    items: NavItem[];
  }[] = [
    {
      group: 'LỚP HỌC',
      countBadge: 4,
      items: [
        { to: '/teacher/classes', label: 'Lớp của tôi', icon: BookOpen },
        { to: '/teacher/students', label: 'Học sinh', icon: Users },
        { to: '/teacher/attendance', label: 'Điểm danh', icon: ClipboardCheck },
        { to: '/teacher/schedule', label: 'Thời khóa biểu', icon: Calendar },
      ],
    },
    {
      group: 'DẠY & HỌC',
      countBadge: 5,
      items: [
        { to: '/teacher/question-bank', label: 'Ngân hàng câu hỏi', icon: HelpCircle },
        { to: '/teacher/assignments', label: 'Giao bài tập', icon: FileText },
        { to: '/teacher/quizzes', label: 'Chấm bài tự động', icon: CheckSquare },
        { to: '/teacher/resources', label: 'Tài liệu số', icon: Folder },
        { to: '/teacher/ai', label: 'AI Hỗ trợ', icon: Sparkles, iconColor: 'text-fuchsia-400' },
      ],
    },
    {
      group: 'THEO DÕI & ĐÁNH GIÁ',
      countBadge: 4,
      items: [
        { to: '/teacher/grades', label: 'Sổ điểm điện tử', icon: BarChart3 },
        { to: '/teacher/attendance/history', label: 'Chuyên cần', icon: UserCheck },
        { to: '/teacher/behavior', label: 'Hành vi & Nề nếp', icon: Award },
        {
          to: '/teacher/alerts',
          label: 'Cảnh báo thông minh',
          icon: AlertTriangle,
          iconColor: 'text-amber-400',
        },
      ],
    },
  ];

  // Student / Parent / Admin nav configurations
  const studentNav: { group: string; items: NavItem[] }[] = [
    {
      group: 'Học tập',
      items: [
        { to: '/student/dashboard', label: 'Trang chủ', icon: LayoutDashboard },
        { to: '/student/schedule', label: 'Lịch học', icon: Calendar },
        { to: '/student/assignments', label: 'Bài tập cần nộp', icon: FileText },
        { to: '/student/quizzes', label: 'Bài kiểm tra trực tuyến', icon: HelpCircle },
      ],
    },
    {
      group: 'Kết quả & Học liệu',
      items: [
        { to: '/student/grades', label: 'Bảng điểm & Xếp loại', icon: ClipboardList },
        { to: '/student/achievements', label: 'Thành tích & Điểm thưởng', icon: Award },
        { to: '/student/resources', label: 'Tài liệu học tập', icon: BookOpen },
        { to: '/student/announcements', label: 'Thông báo từ giáo viên', icon: Bell },
      ],
    },
  ];

  const parentNav: { group: string; items: NavItem[] }[] = [
    {
      group: 'Theo dõi con em',
      items: [
        { to: '/parent/dashboard', label: 'Tổng quan học tập', icon: LayoutDashboard },
        { to: '/parent/attendance', label: 'Chuyên cần ngày', icon: UserCheck },
        { to: '/parent/grades', label: 'Bảng điểm chi tiết', icon: ClipboardList },
        { to: '/parent/assignments', label: 'Tiến độ làm bài', icon: FileText },
        { to: '/parent/behavior', label: 'Rèn luyện & Nhận xét', icon: Award },
      ],
    },
    {
      group: 'Liên lạc',
      items: [
        { to: '/parent/messages', label: 'Trao đổi với Giáo viên', icon: MessageSquare },
        { to: '/parent/announcements', label: 'Thông báo nhà trường', icon: Bell },
      ],
    },
  ];

  const adminNav: { group: string; items: NavItem[] }[] = [
    {
      group: 'Quản trị hệ thống',
      items: [
        { to: '/admin/dashboard', label: 'Dashboard quản trị', icon: LayoutDashboard },
        { to: '/admin/schools', label: 'Trường & Trung tâm', icon: Building },
        { to: '/admin/academic-years', label: 'Năm học & Khối môn', icon: CalendarDays },
        { to: '/admin/users', label: 'Quản lý người dùng', icon: Users },
        { to: '/admin/classes', label: 'Tất cả lớp học', icon: GraduationCap },
      ],
    },
    {
      group: 'Bảo mật & Cấu hình',
      items: [
        { to: '/admin/rbac', label: 'Phân quyền RBAC', icon: ShieldCheck },
        { to: '/admin/audit-logs', label: 'Nhật ký Audit Log', icon: History },
        { to: '/admin/settings', label: 'Cấu hình & Sao lưu', icon: Settings },
      ],
    },
  ];

  const isTeacher = role === 'teacher' || role === 'admin';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-2xs z-40 md:hidden"
        />
      )}

      {/* Sidebar with dark background exactly matching Image 2 */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-[#070b13] text-slate-100 border-r border-slate-800/80 shadow-2xl flex flex-col justify-between overflow-y-auto transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-3 space-y-3.5">
          {/* TEACHER NAVIGATION (EXACTLY MATCHING IMAGE 2) */}
          {isTeacher ? (
            <div className="space-y-3">
              {/* Top Item: Tổng quan */}
              <div>
                <NavLink
                  to={teacherTopStandalone.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[#0080dd] text-white font-bold shadow-md shadow-blue-500/20'
                        : 'text-slate-200 hover:text-white hover:bg-slate-900/60'
                    }`
                  }
                >
                  <LayoutGrid
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      location.pathname === teacherTopStandalone.to ? 'text-white' : 'text-cyan-400'
                    }`}
                  />
                  <span className="text-[13px] tracking-wide font-medium">Tổng quan</span>
                </NavLink>
              </div>

              {/* Collapsible Groups: LỚP HỌC (4), DẠY & HỌC (5), THEO DÕI & ĐÁNH GIÁ (4) */}
              {teacherNavGroups.map((groupItem, gIdx) => {
                const isExpanded = expandedSections[groupItem.group] ?? true;

                return (
                  <div key={gIdx} className="space-y-1">
                    {/* Header Group Button (exact look as Image 2: cyan text, count in parentheses, chevron down) */}
                    <button
                      type="button"
                      onClick={() => toggleSection(groupItem.group)}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
                    >
                      <span className="tracking-wider">{groupItem.group}</span>
                      <div className="flex items-center gap-1 text-cyan-400 text-xs font-semibold">
                        <span>({groupItem.countBadge})</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isExpanded ? 'rotate-0' : '-rotate-90 text-slate-500'
                          }`}
                        />
                      </div>
                    </button>

                    {/* Submenu items list */}
                    {isExpanded && (
                      <div className="space-y-0.5 pt-0.5">
                        {groupItem.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isActive = location.pathname === item.to;

                          return (
                            <NavLink
                              key={item.to}
                              to={item.to}
                              onClick={onClose}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                                isActive
                                  ? 'bg-[#0080dd] text-white font-bold shadow-md shadow-blue-500/20'
                                  : 'text-slate-200 hover:text-white hover:bg-slate-900/60 font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <ItemIcon
                                  className={`w-4 h-4 shrink-0 transition-colors ${
                                    isActive
                                      ? 'text-white'
                                      : item.iconColor || 'text-cyan-400'
                                  }`}
                                />
                                <span className="text-[13px] tracking-wide">{item.label}</span>
                              </div>

                              {item.badge !== undefined && (
                                <span
                                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                    isActive
                                      ? 'bg-[#005faa]/80 text-white'
                                      : item.badgeColor === 'red'
                                      ? 'bg-[#e11d48] text-white shadow-xs'
                                      : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Student / Parent Navigation */
            <div className="space-y-3">
              {(role === 'student' ? studentNav : parentNav).map((section, idx) => {
                const isExpanded = expandedSections[section.group] ?? true;
                return (
                  <div key={idx} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleSection(section.group)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
                    >
                      <span>{section.group}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                      />
                    </button>

                    {isExpanded && (
                      <nav className="pl-3 border-l border-slate-800 space-y-1 mt-1">
                        {section.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <NavLink
                              key={item.to}
                              to={item.to}
                              onClick={onClose}
                              className={({ isActive }) =>
                                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                                  isActive
                                    ? 'bg-blue-600 text-white font-bold'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                                }`
                              }
                            >
                              <Icon className="w-4 h-4 text-cyan-400" />
                              <span>{item.label}</span>
                            </NavLink>
                          );
                        })}
                      </nav>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER (MATCHING IMAGE 2): Năm học 2024–2025 • Học kỳ 1 • Tuần học 06 */}
        <div className="p-3.5 border-t border-slate-800/80 bg-[#07090e]">
          <div className="text-[12px] font-bold text-cyan-300">
            Năm học 2024–2025
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Học kỳ 1 • Tuần học 06
          </div>
        </div>
      </aside>
    </>
  );
};
