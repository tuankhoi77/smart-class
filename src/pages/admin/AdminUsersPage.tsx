import React, { useState } from 'react';
import { Users, Plus, Search, Shield, Lock, RotateCcw, Edit, Trash2 } from 'lucide-react';
import { storage } from '../../services/storage';
import { User, UserRole } from '../../types';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'teacher' as UserRole,
    phone: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const created: User = {
      id: 'u_' + Date.now(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    storage.saveUser(created);
    storage.addAuditLog({
      userId: 'u_admin',
      userName: 'Vũ Hoàng Minh',
      userRole: 'admin',
      action: 'Tạo tài khoản người dùng',
      module: 'Người dùng',
      details: `Tạo tài khoản ${created.name} (${created.email}) với vai trò ${created.role}`,
    });

    setUsers(storage.getUsers());
    setIsAddOpen(false);
  };

  const handleToggleStatus = (u: User) => {
    const updated: User = {
      ...u,
      status: u.status === 'active' ? 'inactive' : 'active',
    };
    storage.saveUser(updated);
    setUsers(storage.getUsers());
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = selectedRole === 'all' || u.role === selectedRole;
    return matchSearch && matchRole;
  });

  const roleLabels: Record<UserRole, { label: string; class: string }> = {
    admin: { label: 'Admin', class: 'bg-purple-100 text-purple-800' },
    teacher: { label: 'Giáo viên', class: 'bg-blue-100 text-blue-800' },
    student: { label: 'Học sinh', class: 'bg-emerald-100 text-emerald-800' },
    parent: { label: 'Phụ huynh', class: 'bg-amber-100 text-amber-800' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản lý Người dùng & Phân quyền</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản trị danh sách tài khoản 4 vai trò: Admin, Giáo viên, Học sinh, Phụ huynh
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
        >
          <Plus className="w-4 h-4" /> Thêm người dùng mới
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Vai trò:</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Quản trị viên (Admin)</option>
            <option value="teacher">Giáo viên</option>
            <option value="student">Học sinh</option>
            <option value="parent">Phụ huynh</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-3 px-4">Người dùng</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Số điện thoại</th>
                <th className="py-3 px-3 text-center">Vai trò</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => {
                const conf = roleLabels[u.role] || roleLabels.teacher;
                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">{u.email}</td>
                    <td className="py-3 px-3 text-slate-600 font-mono">{u.phone || '-'}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${conf.class}`}>
                        {conf.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {u.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => alert(`Đã gửi email đặt lại mật khẩu cho ${u.email}`)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Đặt lại MK
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Tạo tài khoản người dùng mới</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn C"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email đăng nhập *</label>
                <input
                  type="email"
                  required
                  placeholder="user@smartclass.edu.vn"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vai trò</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none font-bold"
                  >
                    <option value="teacher">Giáo viên</option>
                    <option value="student">Học sinh</option>
                    <option value="parent">Phụ huynh</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
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
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
