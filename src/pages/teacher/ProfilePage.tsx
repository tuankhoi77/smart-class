import React, { useState } from 'react';
import { User, Mail, Phone, Building, Shield, Check, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const TeacherProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    schoolName: user?.schoolName || 'THPT Chuyên Nguyễn Huệ',
  });
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Hồ sơ cá nhân & Tài khoản</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Quản lý thông tin tài khoản giáo viên và đơn vị công tác
        </p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          Cập nhật hồ sơ tài khoản thành công!
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
          <img
            src={
              user?.avatar ||
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
            }
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
          />
          <div>
            <h2 className="text-base font-bold text-slate-900">{user?.name}</h2>
            <div className="text-xs text-slate-400 font-mono">{user?.email}</div>
            <span className="inline-block mt-1 text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              Giáo viên Toán học & Chủ nhiệm
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Họ và tên *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email tài khoản</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                disabled
                value={user?.email}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Số điện thoại liên lạc</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Trường học / Cơ sở đào tạo</label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={form.schoolName}
                onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition"
            >
              <Save className="w-4 h-4" /> Lưu thông tin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
