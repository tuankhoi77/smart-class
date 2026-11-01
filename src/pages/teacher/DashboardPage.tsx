import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  AlertTriangle,
  FileText,
  PlusCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronRight,
  Send,
  Dices,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useClass } from '../../contexts/ClassContext';
import { storage } from '../../services/storage';

export const TeacherDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { currentClass, classes, setCurrentClassId } = useClass();
  const navigate = useNavigate();

  const students = storage.getStudentsByClass(currentClass?.id || 'cls_10a1');
  const today = '2026-10-04';
  const attendanceToday = storage.getAttendance(currentClass?.id || 'cls_10a1', today);

  const presentCount = attendanceToday.filter((a) => a.status === 'present').length;
  const excusedCount = attendanceToday.filter((a) => a.status === 'excused').length;
  const unexcusedCount = attendanceToday.filter((a) => a.status === 'unexcused').length;
  const lateCount = attendanceToday.filter((a) => a.status === 'late').length;

  const totalStudents = students.length || currentClass?.studentCount || 36;
  const effectivePresent = attendanceToday.length > 0 ? presentCount : totalStudents - 1;

  const assignments = storage.getAssignments(currentClass?.id);
  const pendingGradingCount = assignments.reduce((acc, a) => acc + (a.submissionsCount || 0) - (a.gradedCount || 0), 0);
  const smartAlerts = storage.getSmartAlerts(currentClass?.id).filter((a) => a.status !== 'resolved');

  // Chart data
  const attendanceRateData = [
    { name: 'Có mặt', value: effectivePresent, color: '#16A34A' },
    { name: 'Có phép', value: excusedCount || 1, color: '#F59E0B' },
    { name: 'Không phép', value: unexcusedCount || 0, color: '#EF4444' },
    { name: 'Đi trễ', value: lateCount || 1, color: '#8B5CF6' },
  ];

  const weeklyAttendanceChart = [
    { day: 'T2', tyLe: 98 },
    { day: 'T3', tyLe: 96 },
    { day: 'T4', tyLe: 94 },
    { day: 'T5', tyLe: 97 },
    { day: 'T6', tyLe: 100 },
    { day: 'Hôm nay', tyLe: 96 },
  ];

  const recentBehaviors = storage.getBehaviors(undefined, currentClass?.id).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Class Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#090d16] p-5 rounded-xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">
              Xin chào, <span className="text-cyan-400">{user?.name || 'Thầy Nguyễn Văn An'}</span>!
            </h1>
            <span className="text-xs bg-blue-950/80 text-blue-300 border border-blue-800/80 font-bold px-2.5 py-0.5 rounded-full">
              Lớp {currentClass?.name || '10A1'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hôm nay là Chủ nhật, ngày 04 tháng 10 năm 2026 · Năm học 2025 - 2026
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400">Đổi lớp:</label>
          <select
            value={currentClass?.id}
            onChange={(e) => setCurrentClassId(e.target.value)}
            className="text-xs font-bold text-cyan-300 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-slate-100">
                {c.name} ({c.studentCount} HS)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-[#090d16] p-4 rounded-xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Sĩ số lớp</span>
            <div className="w-7 h-7 rounded-lg bg-blue-950/70 text-blue-400 border border-blue-900/50 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{totalStudents}</span>
            <span className="text-[11px] text-slate-400">học sinh</span>
          </div>
        </div>

        <div className="bg-[#090d16] p-4 rounded-xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Có mặt hôm nay</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-950/70 text-emerald-400 border border-emerald-900/50 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{effectivePresent}</span>
            <span className="text-[11px] text-slate-400">/ {totalStudents}</span>
          </div>
        </div>

        <div className="bg-[#090d16] p-4 rounded-xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Vắng có phép</span>
            <div className="w-7 h-7 rounded-lg bg-amber-950/70 text-amber-400 border border-amber-900/50 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">{excusedCount || 1}</span>
            <span className="text-[11px] text-slate-400">học sinh</span>
          </div>
        </div>

        <div className="bg-[#090d16] p-4 rounded-xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Bài chưa chấm</span>
            <div className="w-7 h-7 rounded-lg bg-purple-950/70 text-purple-400 border border-purple-900/50 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-400">{pendingGradingCount || 2}</span>
            <span className="text-[11px] text-slate-400">bài nộp</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-[#090d16] p-4 rounded-xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Cảnh báo HS</span>
            <div className="w-7 h-7 rounded-lg bg-rose-950/70 text-rose-400 border border-rose-900/50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400">{smartAlerts.length}</span>
            <span className="text-[11px] text-slate-400">cần xử lý</span>
          </div>
        </div>
      </div>

      {/* Quick Action Bar for Classroom */}
      <div className="bg-gradient-to-r from-blue-950 to-indigo-950 border border-blue-900/50 rounded-xl p-4 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold flex items-center gap-1.5 text-white">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Thao tác nhanh trên lớp học
          </div>
          <div className="text-xs text-blue-200 mt-0.5">
            Thao tác trực tiếp với sĩ số và học liệu lớp {currentClass?.name}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => navigate('/teacher/assignments')}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/40 text-xs font-semibold px-3 py-2 rounded-lg transition"
          >
            <FileText className="w-3.5 h-3.5" />
            Giao bài
          </button>
          <button
            onClick={() => navigate('/teacher/grades')}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-sky-400 border border-sky-500/40 text-xs font-semibold px-3 py-2 rounded-lg transition"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Vào điểm
          </button>
          <button
            onClick={() => navigate('/teacher/tools/wheel')}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 py-2 rounded-lg transition shadow-md"
          >
            <Dices className="w-3.5 h-3.5" />
            Gọi tên
          </button>
          <button
            onClick={() => navigate('/teacher/announcements')}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-violet-400 border border-violet-500/40 text-xs font-semibold px-3 py-2 rounded-lg transition"
          >
            <Send className="w-3.5 h-3.5" />
            Thông báo
          </button>
        </div>
      </div>

      {/* Main Grid: Charts & Today's Schedule & Smart Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Attendance Trend & Class Distribution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Attendance Bar Chart */}
          <div className="bg-[#090d16] p-5 rounded-xl border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Tỷ lệ chuyên cần trong tuần ({currentClass?.name})
                </h3>
                <p className="text-xs text-slate-400">Trung bình đạt 96.8% có mặt đúng giờ</p>
              </div>
              <button
                onClick={() => navigate('/teacher/attendance/history')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition"
              >
                Xem chi tiết <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyAttendanceChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value: any) => [`${value}%`, 'Chuyên cần']}
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                  />
                  <Bar dataKey="tyLe" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending Submissions / Urgent Items */}
          <div className="bg-[#090d16] p-5 rounded-xl border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Bài tập đang giao & Cần chấm</h3>
              <button
                onClick={() => navigate('/teacher/assignments')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition"
              >
                Xem tất cả ({assignments.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {assignments.map((asg) => (
                <div
                  key={asg.id}
                  onClick={() => navigate('/teacher/assignments')}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-800/80 bg-slate-950/60 hover:bg-slate-900 cursor-pointer transition"
                >
                  <div className="flex-1 pr-3">
                    <div className="text-xs font-bold text-slate-100 line-clamp-1">{asg.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Hạn nộp: {new Date(asg.dueDate).toLocaleDateString('vi-VN')} · Môn {asg.subject}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-cyan-400">
                      {asg.submissionsCount || 0} / {totalStudents} đã nộp
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Đã chấm: {asg.gradedCount || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Smart Alerts & Today Schedule & Behavior */}
        <div className="space-y-6">
          {/* Smart Alerts Box */}
          <div className="bg-[#090d16] p-5 rounded-xl border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-white">Cảnh báo học sinh</h3>
              </div>
              <button
                onClick={() => navigate('/teacher/alerts')}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition"
              >
                Chi tiết
              </button>
            </div>

            {smartAlerts.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Không có cảnh báo vi phạm hoặc sa sút nào.
              </div>
            ) : (
              <div className="space-y-2.5">
                {smartAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    onClick={() => navigate('/teacher/alerts')}
                    className="p-3 rounded-lg border border-rose-900/50 bg-rose-950/30 hover:bg-rose-950/50 cursor-pointer transition text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-rose-300">
                      <span>{alt.studentName}</span>
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700/50">
                        {alt.severity === 'high' ? 'Khẩn' : 'Chú ý'}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-200 mt-1">{alt.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                      {alt.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Schedule Mini Widget */}
          <div className="bg-[#090d16] p-5 rounded-xl border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Lịch dạy hôm nay</h3>
              </div>
              <button
                onClick={() => navigate('/teacher/schedule')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition"
              >
                Xem tuần
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60">
                <div className="flex items-center justify-between font-semibold text-slate-200">
                  <span className="text-cyan-300">Tiết 1-2: Toán học (Đại số)</span>
                  <span className="text-[11px] text-amber-300 font-mono">07:15 - 08:50</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Lớp 10A1 · Phòng 301 - Tòa A
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60">
                <div className="flex items-center justify-between font-semibold text-slate-200">
                  <span className="text-cyan-300">Tiết 3-4: Toán hình học</span>
                  <span className="text-[11px] text-amber-300 font-mono">09:05 - 10:40</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Lớp 11B1 · Phòng 204 - Tòa B
                </div>
              </div>
            </div>
          </div>

          {/* Recent Student Behavior / Commendation */}
          <div className="bg-[#090d16] p-5 rounded-xl border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Ghi nhận thi đua gần đây</h3>
              </div>
              <button
                onClick={() => navigate('/teacher/behavior')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition"
              >
                Xem sổ
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {recentBehaviors.map((b) => (
                <div key={b.id} className="p-2 rounded-lg border border-slate-800/80 bg-slate-950/60">
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span>{b.studentName}</span>
                    <span
                      className={`text-[11px] font-bold ${
                        b.points > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {b.points > 0 ? `+${b.points}` : b.points} đ
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{b.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
