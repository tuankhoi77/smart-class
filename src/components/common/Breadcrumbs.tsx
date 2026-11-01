import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  teacher: 'Giáo viên',
  student: 'Học sinh',
  parent: 'Phụ huynh',
  admin: 'Quản trị viên',
  dashboard: 'Tổng quan',
  classes: 'Quản lý',
  create: 'Tạo mới',
  students: 'Học sinh',
  import: 'Import dữ liệu',
  attendance: 'Điểm danh',
  history: 'Lịch sử',
  schedule: 'Thời khóa biểu',
  assignments: 'Bài tập',
  grading: 'Chấm bài',
  quizzes: 'Đề kiểm tra & Quiz',
  'question-bank': 'Ngân hàng câu hỏi',
  resources: 'Học liệu',
  ai: 'AI Trợ giảng',
  grades: 'Bảng điểm',
  behavior: 'Hành vi & Rèn luyện',
  rewards: 'Thi đua',
  alerts: 'Cảnh báo học sinh',
  tools: 'Công cụ lớp học',
  wheel: 'Vòng quay may mắn',
  random: 'Chọn ngẫu nhiên',
  groups: 'Chia nhóm',
  timer: 'Đồng hồ đếm ngược',
  'quick-quiz': 'Trắc nghiệm nhanh',
  announcements: 'Thông báo',
  reports: 'Báo cáo & Thống kê',
  profile: 'Hồ sơ cá nhân',
  settings: 'Cài đặt hệ thống',
  achievements: 'Thành tích',
  schools: 'Trường & Trung tâm',
  'academic-years': 'Năm học & Khối',
  users: 'Người dùng',
  rbac: 'Phân quyền',
  'audit-logs': 'Nhật ký hệ thống',
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length <= 1) return null;

  return (
    <nav className="flex items-center text-xs text-slate-400 mb-4 overflow-x-auto whitespace-nowrap py-1">
      <Link
        to="/"
        className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition"
      >
        <Home className="w-3.5 h-3.5 text-cyan-400" />
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = ROUTE_LABELS[value] || value;

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3 h-3 mx-1 text-slate-600 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-white bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                {label}
              </span>
            ) : (
              <Link to={to} className="text-slate-400 hover:text-cyan-400 transition">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
