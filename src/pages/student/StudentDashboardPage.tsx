import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  FileText,
  HelpCircle,
  Award,
  Bell,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Star,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { storage } from '../../services/storage';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const student = storage.getStudentById(user?.studentId || 'stu_1') || storage.getStudents()[0];
  const assignments = storage.getAssignments(student.classId);
  const quizzes = storage.getQuizzes(student.classId);
  const schedules = storage.getSchedules(student.classId);
  const announcements = storage.getAnnouncements().slice(0, 3);
  const badges = storage.getRewardBadges(student.id);

  const pendingHomework = assignments.filter((a) => a.status === 'published');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 p-6 rounded-2xl text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Chào em, {student.fullName}!</h1>
            <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded">
              {student.className}
            </span>
          </div>
          <p className="text-xs text-emerald-100 mt-1">
            Mã học sinh: {student.code} · {student.group} · STT: {student.orderNumber}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/20 text-center">
            <span className="text-[10px] text-emerald-100 block">Điểm trung bình (GPA)</span>
            <div className="text-xl font-black text-white">{student.gpa} / 10</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/20 text-center">
            <span className="text-[10px] text-emerald-100 block">Chuyên cần</span>
            <div className="text-xl font-black text-white">{student.attendanceRate}%</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Homework Pending & Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Homework & Quizzes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Homework */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Bài tập cần làm ({pendingHomework.length})
                </h3>
              </div>
              <button
                onClick={() => navigate('/student/assignments')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                Xem tất cả →
              </button>
            </div>

            <div className="space-y-2.5">
              {pendingHomework.map((asg) => (
                <div
                  key={asg.id}
                  onClick={() => navigate('/student/assignments')}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/70 cursor-pointer transition flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900">{asg.title}</span>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Hạn nộp: {new Date(asg.dueDate).toLocaleDateString('vi-VN')}</span>
                      <span>·</span>
                      <span>Môn: {asg.subject}</span>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shrink-0">
                    Nộp bài
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Online Quizzes */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm">Bài kiểm tra trực tuyến</h3>
              </div>
              <button
                onClick={() => navigate('/student/quizzes')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                Vào làm bài →
              </button>
            </div>

            <div className="space-y-2.5">
              {quizzes.map((qz) => (
                <div
                  key={qz.id}
                  onClick={() => navigate('/student/quizzes')}
                  className="p-3.5 rounded-xl border border-slate-100 bg-purple-50/30 hover:bg-purple-50/60 cursor-pointer transition flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900">{qz.title}</span>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Thời lượng: {qz.durationMinutes} phút · {qz.questions.length} câu hỏi
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-purple-600 text-white font-bold rounded-lg">
                    Làm bài
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Today's Schedule & Achievements */}
        <div className="space-y-6">
          {/* Today's Timetable */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Lịch học hôm nay</h3>
              </div>
              <button
                onClick={() => navigate('/student/schedule')}
                className="text-xs text-blue-600 font-semibold"
              >
                Cả tuần
              </button>
            </div>

            <div className="space-y-2">
              {schedules.slice(0, 3).map((s) => (
                <div key={s.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>Tiết {s.period}: {s.subject}</span>
                    <span className="text-[10px] text-blue-600 font-mono">{s.startTime}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {s.room} · GV: {s.teacherName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges & Rewards */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm">Bảng thành tích của em</h3>
              </div>
              <span className="font-black text-amber-600">+{student.rewardPoints} đ</span>
            </div>

            <div className="space-y-2">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-amber-50/60 border border-amber-200"
                >
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <div>
                    <div className="font-bold text-amber-900">{b.badgeName}</div>
                    <div className="text-[10px] text-amber-700">{b.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
