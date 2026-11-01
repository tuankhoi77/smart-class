import React, { useState } from 'react';
import { Building, Plus, Search, MapPin, Phone, Mail, GraduationCap } from 'lucide-react';
import { storage } from '../../services/storage';
import { School } from '../../types';

export const AdminSchoolsPage: React.FC = () => {
  const [schools, setSchools] = useState<School[]>(() => storage.getSchools());
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newSchool, setNewSchool] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    principalName: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const created: School = {
      id: 'sch_' + Date.now(),
      name: newSchool.name,
      code: newSchool.code,
      address: newSchool.address,
      phone: newSchool.phone,
      email: newSchool.email,
      principalName: newSchool.principalName,
      academicYearId: 'ay_2025_2026',
      classesCount: 0,
      studentsCount: 0,
    };

    storage.saveSchool(created);
    storage.addAuditLog({
      userId: 'u_admin',
      userName: 'Vũ Hoàng Minh',
      userRole: 'admin',
      action: 'Tạo cơ sở trường học mới',
      module: 'Trường học',
      details: `Khởi tạo trường ${created.name} (${created.code})`,
    });

    setSchools(storage.getSchools());
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản lý Trường & Cơ sở Đào tạo</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mô hình Multi-organization hỗ trợ quản lý tập trung nhiều trường học và trung tâm
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
        >
          <Plus className="w-4 h-4" /> Thêm trường học mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {schools.map((sch) => (
          <div
            key={sch.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{sch.name}</h3>
                  <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    Mã: {sch.code}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{sch.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{sch.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{sch.email}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Hiệu trưởng: <strong>{sch.principalName}</strong></span>
              <span className="font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded">
                {sch.classesCount} Lớp · {sch.studentsCount} HS
              </span>
            </div>
          </div>
        ))}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Thêm Trường / Cơ sở mới</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên trường học *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: THPT Amsterdam"
                  value={newSchool.name}
                  onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã đơn vị *</label>
                  <input
                    type="text"
                    required
                    placeholder="AMS-003"
                    value={newSchool.code}
                    onChange={(e) => setNewSchool({ ...newSchool, code: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hiệu trưởng</label>
                  <input
                    type="text"
                    value={newSchool.principalName}
                    onChange={(e) => setNewSchool({ ...newSchool, principalName: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={newSchool.address}
                  onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={newSchool.phone}
                    onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email liên hệ</label>
                  <input
                    type="email"
                    value={newSchool.email}
                    onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Lưu trường học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
