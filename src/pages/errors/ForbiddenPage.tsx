import React from 'react';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">403</h1>
        <h2 className="text-base font-bold text-slate-800 mt-2">Truy cập bị từ chối</h2>
        <p className="text-xs text-slate-500 mt-2">
          Tài khoản với vai trò hiện tại của bạn không có đặc quyền truy cập vào đường dẫn hoặc module này.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
          <button
            onClick={() => navigate(`/${role}/dashboard`)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
          >
            <Home className="w-4 h-4" /> Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};
