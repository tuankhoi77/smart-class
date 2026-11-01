import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  ClipboardList,
  FileText,
  AlertTriangle,
  MessageSquare,
  Award,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { storage } from '../../services/storage';

export const ParentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load child
  const childId = user?.childrenIds?.[0] || 'stu_1';
  const child = storage.getStudentById(childId) || storage.getStudents()[0];

  const attendanceToday = storage.getAttendance(child.classId, '2026-10-04').find((a) => a.studentId === child.id);
  const assignments = storage.getAssignments(child.classId);
  const alerts = storage.getSmartAlerts().filter((a) => a.studentId === child.id);
  const behaviors = storage.getBehaviors(child.id);

  return (
    <div className="space-y-6">
      {/* Top Banner: Child Switcher & Overview */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-6 rounded-2xl text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Cổng thông tin Phụ huynh học sinh</h1>
            <span className="text-xs bg-white/20 font-bold px-2 py-0.5 rounded">
              Lớp {child.className}
            </span>
          </div>
          <p className="text-xs text-amber-100 mt-1">
            Đang theo dõi học sinh: <strong>{child.fullName}</strong> ({child.code}) · GVCN: Thầy Nguyễn Văn An
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/20 text-center">
            <span className="text-[10px] text-amber-100 block">ĐTB học kỳ (GPA)</span>
            <div className="text-xl font-black text-white">{child.gpa} / 10</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/20 text-center">
            <span className="text-[10px] text-amber-100 block">Chuyên cần</span>
            <div className="text-xl font-black text-white">{child.attendanceRate}%</div>
          </div>
        </div>
      </div>

      {/* Today Attendance & Quick Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Điểm danh hôm nay
          </span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <div className="text-base font-bold text-slate-900">
                {attendanceToday?.status === 'present' || !attendanceToday ? 'Đã có mặt tại lớp' : 'Vắng / Trễ'}
              </div>
              <span className="text-[11px] text-slate-400">Ghi nhận lúc 07:15 sáng</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tiến độ bài tập về nhà
          </span>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-black text-blue-600">
                {child.submittedAssignmentsCount} / {child.totalAssignmentsCount}
              </div>
              <span className="text-[11px] text-slate-400">Đã hoàn thành đúng hạn</span>
            </div>
            <button
              onClick={() => navigate('/parent/assignments')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Xem bài tập →
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Kênh liên lạc Giáo viên
          </span>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-900">Thầy Nguyễn Văn An</div>
              <span className="text-[11px] text-slate-400">SĐT: 0912345678</span>
            </div>
            <button
              onClick={() => navigate('/parent/messages')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-2xs"
            >
              Nhắn tin
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Performance & Recent Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Commendations */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Ghi nhận rèn luyện từ Thầy Cô
              </h3>
              <span className="text-xs font-bold text-amber-600">+{child.rewardPoints} điểm thi đua</span>
            </div>

            <div className="space-y-2.5">
              {behaviors.map((b) => (
                <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{b.title}</span>
                    <span className="text-emerald-600 font-bold">+{b.points} đ</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">{b.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right alerts */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Nhắc nhở học tập
            </h3>

            {alerts.length === 0 ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-center rounded-xl text-xs">
                Cháu học tập chuyên cần và chấp hành tốt nội quy. Gia đình yên tâm nhé!
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                {alerts.map((alt) => (
                  <div key={alt.id} className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800">
                    <div className="font-bold">{alt.title}</div>
                    <p className="text-[11px] mt-0.5">{alt.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
