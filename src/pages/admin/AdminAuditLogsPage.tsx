import React, { useState } from 'react';
import { History, Search, Download, ShieldCheck, Filter } from 'lucide-react';
import { storage } from '../../services/storage';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState(() => storage.getAuditLogs());
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');

  const filtered = logs.filter((l) => {
    const matchSearch =
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase());
    const matchModule = selectedModule === 'all' || l.module === selectedModule;
    return matchSearch && matchModule;
  });

  const handleExportCSV = () => {
    const headers = 'Thời gian,Người thực hiện,Vai trò,Hành động,Module,Chi tiết,IP\n';
    const rows = filtered
      .map(
        (l) =>
          `"${l.timestamp}","${l.userName}","${l.userRole}","${l.action}","${l.module}","${l.details}","${l.ip}"`
      )
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AuditLog_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Nhật ký Hoạt động (Audit Log)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lưu vết an ninh mọi thao tác quan trọng: sửa/xóa điểm, điểm danh, đổi quyền, import dữ liệu
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
        >
          <Download className="w-4 h-4" /> Xuất Audit Log CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo hành động, người thực hiện..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Module:</label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none"
          >
            <option value="all">Tất cả module</option>
            <option value="Điểm danh">Điểm danh</option>
            <option value="Điểm số">Điểm số</option>
            <option value="Bài tập">Bài tập</option>
            <option value="Học sinh">Học sinh</option>
            <option value="Xác thực">Xác thực</option>
            <option value="Hệ thống">Hệ thống</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-3">Người thực hiện</th>
                <th className="py-3 px-3">Hành động</th>
                <th className="py-3 px-3">Module</th>
                <th className="py-3 px-4">Chi tiết thao tác</th>
                <th className="py-3 px-3 text-right">IP Client</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {new Date(l.timestamp).toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900">{l.userName}</span>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">
                      {l.userRole}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-blue-700">{l.action}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]">
                      {l.module}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{l.details}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400">{l.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
