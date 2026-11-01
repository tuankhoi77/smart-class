import React from 'react';
import { ClipboardList, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { storage } from '../../services/storage';

export const StudentGradesPage: React.FC = () => {
  const { user } = useAuth();
  const student = storage.getStudentById(user?.studentId || 'stu_1') || storage.getStudents()[0];
  const grades = storage.getGrades(undefined, student.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Bảng điểm học tập của em</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Theo dõi chi tiết các cột điểm miệng, 15 phút, 1 tiết và điểm trung bình tích lũy
        </p>
      </div>

      {/* GPA Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Điểm trung bình học kỳ 1 (GPA)
          </span>
          <div className="text-4xl font-black text-blue-600 mt-1">{student.gpa} / 10</div>
          <span className="inline-block mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            Xếp loại học lực: Giỏi
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px]">Chuyên cần</span>
            <span className="font-bold text-emerald-600 text-sm">{student.attendanceRate}%</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px]">Rèn luyện</span>
            <span className="font-bold text-blue-600 text-sm">+{student.rewardPoints} đ</span>
          </div>
        </div>
      </div>

      {/* Detailed Grades Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Bài kiểm tra</th>
                <th className="py-3 px-3">Môn học</th>
                <th className="py-3 px-3 text-center">Hệ số</th>
                <th className="py-3 px-3 text-center">Điểm số</th>
                <th className="py-3 px-3">Lời nhận xét của thầy cô</th>
                <th className="py-3 px-3 text-right">Ngày ghi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {grades.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-800">{g.typeName}</td>
                  <td className="py-3 px-3 text-slate-600 font-medium">{g.subject}</td>
                  <td className="py-3 px-3 text-center font-mono">x{g.weight}</td>
                  <td className="py-3 px-3 text-center font-mono font-black text-sm text-blue-600">
                    {g.score}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{g.note || 'Làm bài tốt, tiếp tục phát huy!'}</td>
                  <td className="py-3 px-3 text-right text-slate-400 font-mono">{g.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
