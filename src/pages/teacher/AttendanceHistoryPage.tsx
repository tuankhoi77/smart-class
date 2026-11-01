import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Download,
  Search,
  Filter,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useClass } from '../../contexts/ClassContext';
import { storage } from '../../services/storage';

export const AttendanceHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { classes, currentClassId } = useClass();

  const [selectedClassId, setSelectedClassId] = useState(currentClassId || 'all');
  const [statusFilter, setStatusFilter] = useState('all');

  const allRecords = storage.getAllAttendance();
  const filtered = allRecords.filter((rec) => {
    const matchClass = selectedClassId === 'all' || rec.classId === selectedClassId;
    const matchStatus = statusFilter === 'all' || rec.status === statusFilter;
    return matchClass && matchStatus;
  });

  const handleExportCSV = () => {
    const headers = 'Ngày,Lớp,Mã HS,Họ và tên,Trạng thái,Lý do,Người ghi nhận,Thời gian\n';
    const rows = filtered
      .map(
        (r) =>
          `"${r.date}","${r.classId}","${r.studentCode}","${r.studentName}","${
            r.status === 'present'
              ? 'Có mặt'
              : r.status === 'excused'
              ? 'Có phép'
              : r.status === 'late'
              ? 'Đi trễ'
              : 'Không phép'
          }","${r.reason || ''}","${r.updatedBy}","${r.updatedAt}"`
      )
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `LichSuDiemDanh_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header - Pure Dark */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#090d16] p-5 rounded-xl border border-slate-800 shadow-xl">
        <div>
          <button
            onClick={() => navigate('/teacher/attendance')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition mb-1.5"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" /> Quay lại Điểm danh hôm nay
          </button>
          <h1 className="text-xl font-bold text-white">Lịch sử & Thống kê Chuyên cần</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Lưu vết toàn bộ quá trình điểm danh theo ngày, tuần, tháng và học kỳ
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold transition shadow-md shadow-cyan-950/40"
        >
          <Download className="w-4 h-4" /> Xuất báo cáo CSV
        </button>
      </div>

      {/* Filter Bar - Pure Dark */}
      <div className="bg-[#090d16] p-4 rounded-xl border border-slate-800 shadow-xl flex flex-wrap items-center gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Lớp học</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="text-xs font-bold text-white bg-[#060910] border border-slate-800 rounded-lg p-2 outline-none focus:border-cyan-500"
          >
            <option value="all">Tất cả lớp học</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-bold text-white bg-[#060910] border border-slate-800 rounded-lg p-2 outline-none focus:border-cyan-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="present">Có mặt</option>
            <option value="excused">Có phép</option>
            <option value="unexcused">Không phép</option>
            <option value="late">Đi trễ</option>
          </select>
        </div>

        <div className="ml-auto text-xs text-slate-400">
          Tìm thấy <strong className="text-white font-mono">{filtered.length}</strong> bản ghi điểm danh
        </div>
      </div>

      {/* History Table - Pure Dark */}
      <div className="bg-[#090d16] rounded-xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#060910] border-b border-slate-800 text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-3.5">Ngày</th>
                <th className="py-3 px-3.5">Mã HS</th>
                <th className="py-3 px-3.5">Họ và tên</th>
                <th className="py-3 px-3.5 text-center">Trạng thái</th>
                <th className="py-3 px-3.5">Lý do ghi nhận</th>
                <th className="py-3 px-3.5 text-right">Người ghi nhận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="font-semibold text-slate-300">Chưa có bản ghi điểm danh nào phù hợp.</p>
                      <p className="text-[11px] text-slate-500">
                        Vào mục Điểm danh hôm nay để lưu sổ điểm danh lớp học.
                      </p>
                      <button
                        onClick={() => navigate('/teacher/attendance')}
                        className="mt-2 px-3.5 py-1.5 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-lg text-xs font-bold transition"
                      >
                        Đến trang Điểm danh
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#0e1424] transition">
                    <td className="py-3 px-3.5 font-mono font-medium text-slate-300">{rec.date}</td>
                    <td className="py-3 px-3.5 font-mono text-cyan-400">{rec.studentCode}</td>
                    <td className="py-3 px-3.5 font-bold text-white">{rec.studentName}</td>
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${
                          rec.status === 'present'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                            : rec.status === 'excused'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                            : rec.status === 'late'
                            ? 'bg-purple-950/80 text-purple-300 border-purple-800/80'
                            : 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                        }`}
                      >
                        {rec.status === 'present'
                          ? 'Có mặt'
                          : rec.status === 'excused'
                          ? 'Có phép'
                          : rec.status === 'late'
                          ? 'Đi trễ'
                          : 'Vắng'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-400">{rec.reason || '-'}</td>
                    <td className="py-3 px-3.5 text-right text-slate-400 font-mono text-[11px]">
                      {rec.updatedBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
