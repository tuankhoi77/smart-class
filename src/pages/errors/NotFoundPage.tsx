import React from 'react';
import { HelpCircle, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">404</h1>
        <h2 className="text-base font-bold text-slate-800 mt-2">Trang không tồn tại</h2>
        <p className="text-xs text-slate-500 mt-2">
          Đường dẫn bạn yêu cầu không tìm thấy trên hệ thống hoặc đã được di chuyển sang địa chỉ mới.
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
