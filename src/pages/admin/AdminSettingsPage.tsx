import React, { useState } from 'react';
import { Settings, Save, Download, Upload, RotateCcw, Check, Shield } from 'lucide-react';
import { storage } from '../../services/storage';
import { SystemConfig } from '../../types';

export const AdminSettingsPage: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>(() => storage.getSystemConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateSystemConfig(config);
    storage.addAuditLog({
      userId: 'u_admin',
      userName: 'Vũ Hoàng Minh',
      userRole: 'admin',
      action: 'Cập nhật cấu hình hệ thống',
      module: 'Cấu hình',
      details: 'Cập nhật tham số hoạt động toàn trường',
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleBackupDatabase = () => {
    const backupData = {
      users: storage.getUsers(),
      schools: storage.getSchools(),
      academicYears: storage.getAcademicYears(),
      classes: storage.getClasses(),
      students: storage.getStudents(),
      attendance: storage.getAllAttendance(),
      schedules: storage.getSchedules(),
      assignments: storage.getAssignments(),
      quizzes: storage.getQuizzes(),
      resources: storage.getResources(),
      grades: storage.getGrades(),
      behaviors: storage.getBehaviors(),
      auditLogs: storage.getAuditLogs(),
      timestamp: new Date().toISOString(),
    };

    const json = JSON.stringify(backupData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartEdu_FullBackup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleResetData = () => {
    if (window.confirm('CẢNH BÁO: Khôi phục toàn bộ cơ sở dữ liệu về trạng thái mẫu ban đầu?')) {
      storage.resetDatabase();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Cấu hình Hệ thống & Sao lưu Dữ liệu</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Quản lý các thông số vận hành chung, chính sách điểm danh, AI và sao lưu phục hồi dữ liệu
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          Đã lưu các thiết lập cấu hình thành công!
        </div>
      )}

      {/* General Configuration Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
          1. Thông số Vận hành Trường học
        </h3>

        <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tên đơn vị chính</label>
            <input
              type="text"
              value={config.schoolName}
              onChange={(e) => setConfig({ ...config, schoolName: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Năm học hiện tại</label>
              <input
                type="text"
                value={config.currentAcademicYear}
                onChange={(e) => setConfig({ ...config, currentAcademicYear: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Học kỳ hiện tại</label>
              <select
                value={config.currentTerm}
                onChange={(e) => setConfig({ ...config, currentTerm: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg outline-none font-semibold"
              >
                <option value="Học kỳ 1">Học kỳ 1</option>
                <option value="Học kỳ 2">Học kỳ 2</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Giờ chốt điểm danh sáng</label>
              <input
                type="time"
                value={config.attendanceCutoffTime}
                onChange={(e) => setConfig({ ...config, attendanceCutoffTime: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Thang điểm chuẩn</label>
              <select
                value={config.gradingScale}
                onChange={(e) => setConfig({ ...config, gradingScale: e.target.value as any })}
                className="w-full p-2 border border-slate-200 rounded-lg outline-none font-semibold"
              >
                <option value="10">Thang điểm 10 (Chuẩn THPT Việt Nam)</option>
                <option value="100">Thang điểm 100</option>
                <option value="4">Thang điểm 4 (GPA Đại học)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.allowParentMessaging}
                onChange={(e) => setConfig({ ...config, allowParentMessaging: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span className="font-semibold text-slate-800">
                Cho phép Phụ huynh gửi tin nhắn trực tiếp cho Giáo viên chủ nhiệm
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableAiFeatures}
                onChange={(e) => setConfig({ ...config, enableAiFeatures: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span className="font-semibold text-slate-800">
                Bật tính năng AI Trợ giảng (Soạn đề, giáo án, phân tích kết quả học tập)
              </span>
            </label>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition"
            >
              <Save className="w-4 h-4" /> Lưu cấu hình hệ thống
            </button>
          </div>
        </form>
      </div>

      {/* Backup and Restore Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
          2. Sao lưu Toàn bộ Cơ sở Dữ liệu (Backup & Disaster Recovery)
        </h3>

        <p className="text-xs text-slate-500">
          Xuất toàn bộ cơ sở dữ liệu (Người dùng, Lớp học, Học sinh, Điểm số, Điểm danh, Bài tập, Lịch sử) thành tập tin JSON dự phòng.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleBackupDatabase}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold transition shadow-xs"
          >
            <Download className="w-4 h-4" /> Tải về bản Sao lưu JSON
          </button>

          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-lg text-xs font-bold transition"
          >
            <RotateCcw className="w-4 h-4" /> Đặt lại dữ liệu mẫu (Reset)
          </button>
        </div>
      </div>
    </div>
  );
};
