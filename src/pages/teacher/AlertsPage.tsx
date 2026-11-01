import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  User,
  ArrowRight,
  ShieldAlert,
  Send,
  Check,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { useClass } from '../../contexts/ClassContext';
import { SmartAlert, AlertStatus } from '../../types';

export const AlertsPage: React.FC = () => {
  const { currentClassId, currentClass } = useClass();

  const [alerts, setAlerts] = useState<SmartAlert[]>(() =>
    storage.getSmartAlerts(currentClassId || 'cls_10a1')
  );

  const [statusFilter, setStatusFilter] = useState<'all' | AlertStatus>('all');
  const [resolvingAlert, setResolvingAlert] = useState<SmartAlert | null>(null);
  const [resolveNote, setResolveNote] = useState('');

  const handleUpdateStatus = (id: string, newStatus: AlertStatus, note?: string) => {
    storage.updateAlertStatus(id, newStatus, note);
    storage.addAuditLog({
      userId: 'u_teacher_1',
      userName: 'Thầy Nguyễn Văn An',
      userRole: 'teacher',
      action: 'Cập nhật cảnh báo học sinh',
      module: 'Cảnh báo',
      details: `Chuyển cảnh báo sang trạng thái "${newStatus}"`,
    });
    setAlerts(storage.getSmartAlerts(currentClassId || 'cls_10a1'));
    if (newStatus === 'resolved') {
      setResolvingAlert(null);
      setResolveNote('');
    }
  };

  const filtered = alerts.filter((a) => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  const statusBadges: Record<AlertStatus, { label: string; class: string }> = {
    new: { label: 'Mới phát hiện', class: 'bg-red-50 text-red-700 border-red-200' },
    viewed: { label: 'Đã xem', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    processing: { label: 'Đang can thiệp', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    resolved: { label: 'Đã giải quyết', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Hệ thống Cảnh báo Học sinh Thông minh</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tự động phát hiện học sinh nghỉ học nhiều (&gt;3 buổi), nợ bài tập, đi trễ hoặc có dấu hiệu giảm sút học lực
        </p>
      </div>

      {/* Filter Segmented Control */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap gap-2 text-xs">
        {[
          { id: 'all', label: 'Tất cả cảnh báo' },
          { id: 'new', label: '1. Mới' },
          { id: 'viewed', label: '2. Đã xem' },
          { id: 'processing', label: '3. Đang xử lý' },
          { id: 'resolved', label: '4. Đã giải quyết' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === tab.id
                ? 'bg-blue-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400 text-xs">
            Không có cảnh báo nào trong trạng thái này.
          </div>
        ) : (
          filtered.map((alt) => {
            const conf = statusBadges[alt.status];
            return (
              <div
                key={alt.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        alt.severity === 'high'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{alt.studentName}</span>
                      <span className="text-slate-400 text-xs ml-2">({alt.className})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${conf.class}`}
                    >
                      {conf.label}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Tạo lúc: {new Date(alt.createdAt).toLocaleTimeString('vi-VN')}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-xs">{alt.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alt.description}</p>

                  {alt.resolvedNote && (
                    <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                      <strong>Ghi chú xử lý:</strong> {alt.resolvedNote}
                    </div>
                  )}
                </div>

                {/* Workflow Transitions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-[11px] text-slate-400">
                    Quy trình xử lý: Mới → Đã xem → Đang xử lý → Đã giải quyết
                  </div>

                  <div className="flex items-center gap-2">
                    {alt.status === 'new' && (
                      <button
                        onClick={() => handleUpdateStatus(alt.id, 'viewed')}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-bold hover:bg-blue-100 transition"
                      >
                        Đánh dấu Đã xem
                      </button>
                    )}

                    {(alt.status === 'new' || alt.status === 'viewed') && (
                      <button
                        onClick={() => handleUpdateStatus(alt.id, 'processing')}
                        className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-bold hover:bg-amber-100 transition"
                      >
                        Bắt đầu xử lý / Liên hệ PH
                      </button>
                    )}

                    {alt.status !== 'resolved' && (
                      <button
                        onClick={() => {
                          setResolvingAlert(alt);
                          setResolveNote('');
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition shadow-2xs"
                      >
                        Đã giải quyết xong
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resolve Dialog Modal */}
      {resolvingAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">
              Xác nhận giải quyết cảnh báo: {resolvingAlert.studentName}
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ghi chú biện pháp đã thực hiện *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Ví dụ: Đã gọi điện cho phụ huynh em, gia đình cam kết nhắc nhở con làm bài và đi học đúng giờ..."
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResolvingAlert(null)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() =>
                  handleUpdateStatus(resolvingAlert.id, 'resolved', resolveNote)
                }
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
              >
                Lưu kết quả & Đóng cảnh báo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
