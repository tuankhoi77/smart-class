import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building,
  Users,
  GraduationCap,
  ShieldCheck,
  History,
  Settings,
  Server,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { storage } from '../../services/storage';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const schools = storage.getSchools();
  const classes = storage.getClasses();
  const users = storage.getUsers();
  const students = storage.getStudents();
  const logs = storage.getAuditLogs();

  const teacherCount = users.filter((u) => u.role === 'teacher').length;
  const parentCount = users.filter((u) => u.role === 'parent').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 p-6 rounded-2xl text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">
              A
            </div>
            <h1 className="text-xl font-bold">Trung tâm Quản trị Toàn Hệ thống</h1>
          </div>
          <p className="text-xs text-purple-200 mt-1">
            Kiến trúc Multi-school SaaS · Quản trị phân quyền RBAC, người dùng và nhật ký an ninh
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Hệ thống hoạt động bình thường
          </span>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Trường / Cơ sở</span>
            <Building className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{schools.length}</div>
          <span className="text-[10px] text-slate-400">Cơ sở giáo dục</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Lớp học</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{classes.length}</div>
          <span className="text-[10px] text-slate-400">Đang hoạt động</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Giáo viên</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{teacherCount}</div>
          <span className="text-[10px] text-slate-400">Cán bộ giảng dạy</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Học sinh</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{students.length}</div>
          <span className="text-[10px] text-slate-400">Đang theo học</span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Phụ huynh</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{parentCount}</div>
          <span className="text-[10px] text-slate-400">Tài khoản kết nối</span>
        </div>
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => navigate('/admin/schools')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 cursor-pointer transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Quản lý Trường & Cơ sở</h3>
              <p className="text-xs text-slate-400">Mô hình Multi-tenant đa trường</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>

        <div
          onClick={() => navigate('/admin/users')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 cursor-pointer transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Quản lý 4 Vai trò</h3>
              <p className="text-xs text-slate-400">Admin, Giáo viên, Học sinh, Phụ huynh</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>

        <div
          onClick={() => navigate('/admin/audit-logs')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 cursor-pointer transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Nhật ký Audit Log</h3>
              <p className="text-xs text-slate-400">Lưu vết thao tác và an ninh</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Latest Audit Activity */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm">Nhật ký hoạt động hệ thống gần đây</h3>
          <button
            onClick={() => navigate('/admin/audit-logs')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            Xem toàn bộ ({logs.length}) →
          </button>
        </div>

        <div className="space-y-2">
          {logs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-800">{log.action}</span>
                <span className="text-slate-400 ml-2">[{log.module}]</span>
                <div className="text-[11px] text-slate-500 mt-0.5">{log.details}</div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-bold text-blue-700">{log.userName}</span>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
