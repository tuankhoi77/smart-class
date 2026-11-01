import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Filter,
  CheckCircle2,
  TrendingUp,
  Award,
  Users,
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
import { useClass } from '../../contexts/ClassContext';
import { storage } from '../../services/storage';

export const ReportsPage: React.FC = () => {
  const { classes, currentClassId, currentClass } = useClass();

  const [classId, setClassId] = useState(currentClassId || 'cls_10a1');
  const [reportType, setReportType] = useState('performance');
  const [term, setTerm] = useState('term1');

  const students = storage.getStudentsByClass(classId);

  // Grade Distribution Chart Data
  const gradeDistribution = [
    { grade: 'Xuất sắc (9.0-10)', count: students.filter((s) => s.gpa >= 9.0).length || 2, color: '#16A34A' },
    { grade: 'Giỏi (8.0-8.9)', count: students.filter((s) => s.gpa >= 8.0 && s.gpa < 9.0).length || 4, color: '#2563EB' },
    { grade: 'Khá (6.5-7.9)', count: students.filter((s) => s.gpa >= 6.5 && s.gpa < 8.0).length || 1, color: '#F59E0B' },
    { grade: 'Trung bình (<6.5)', count: students.filter((s) => s.gpa < 6.5).length || 1, color: '#EF4444' },
  ];

  const handleExportCSV = () => {
    const headers = 'STT,Mã HS,Họ và tên,Lớp,Tổ,GPA,Xếp loại,Chuyên cần (%),Bài tập nộp\n';
    const rows = students
      .map(
        (s, idx) =>
          `${idx + 1},"${s.code}","${s.fullName}","${s.className}","${s.group}",${s.gpa},"${
            s.gpa >= 9 ? 'Xuất sắc' : s.gpa >= 8 ? 'Giỏi' : s.gpa >= 6.5 ? 'Khá' : 'Trung bình'
          }",${s.attendanceRate}%,${s.submittedAssignmentsCount}/${s.totalAssignmentsCount}`
      )
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BaoCao_${currentClass?.name || '10A1'}_${term}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Báo cáo & Thống kê Tổng hợp</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Báo cáo kết quả học tập, chuyên cần, bài tập và đánh giá thi đua theo từng lớp
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Printer className="w-4 h-4 text-slate-500" /> In báo cáo
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
          >
            <Download className="w-4 h-4" /> Xuất file CSV / Excel
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Lớp học</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Kỳ báo cáo</label>
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none"
          >
            <option value="term1">Học kỳ 1 (2025 - 2026)</option>
            <option value="term2">Học kỳ 2 (2025 - 2026)</option>
            <option value="year">Cả năm học</option>
          </select>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-center">
          <span className="text-xs text-slate-400 font-medium">Tổng số học sinh</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{students.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-center">
          <span className="text-xs text-slate-400 font-medium">GPA trung bình lớp</span>
          <div className="text-2xl font-black text-blue-600 mt-1">8.4 / 10</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-center">
          <span className="text-xs text-slate-400 font-medium">Chuyên cần trung bình</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">96.8%</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-center">
          <span className="text-xs text-slate-400 font-medium">Tỷ lệ hoàn thành bài tập</span>
          <div className="text-2xl font-black text-purple-600 mt-1">94.2%</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3">Phân loại học lực lớp</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="grade" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={45}>
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3">Tỷ trọng xếp loại học tập</h3>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Roster Report Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-2.5 px-3">STT</th>
                <th className="py-2.5 px-3">Mã HS</th>
                <th className="py-2.5 px-3">Họ và tên</th>
                <th className="py-2.5 px-3">Tổ</th>
                <th className="py-2.5 px-3 text-center">GPA</th>
                <th className="py-2.5 px-3 text-center">Xếp loại</th>
                <th className="py-2.5 px-3 text-center">Chuyên cần</th>
                <th className="py-2.5 px-3 text-center">Bài tập nộp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((stu, i) => (
                <tr key={stu.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono text-slate-400">{i + 1}</td>
                  <td className="py-2.5 px-3 font-mono font-medium">{stu.code}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{stu.fullName}</td>
                  <td className="py-2.5 px-3 text-slate-600">{stu.group}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-blue-600 font-mono">
                    {stu.gpa}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        stu.gpa >= 9
                          ? 'bg-emerald-100 text-emerald-800'
                          : stu.gpa >= 8
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {stu.gpa >= 9 ? 'Xuất sắc' : stu.gpa >= 8 ? 'Giỏi' : 'Khá'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-emerald-600 font-mono">
                    {stu.attendanceRate}%
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-600">
                    {stu.submittedAssignmentsCount} / {stu.totalAssignmentsCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
