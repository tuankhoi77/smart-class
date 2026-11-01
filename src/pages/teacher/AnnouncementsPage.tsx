import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Send,
  Paperclip,
  CheckCircle2,
  Users,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { useClass } from '../../contexts/ClassContext';
import { Announcement } from '../../types';

export const AnnouncementsPage: React.FC = () => {
  const { classes, currentClassId } = useClass();

  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    storage.getAnnouncements()
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    classId: currentClassId || 'cls_10a1',
    priority: 'normal' as 'normal' | 'important' | 'urgent',
    targetRole: 'all' as 'all' | 'students' | 'parents',
  });

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClass = storage.getClassById(form.classId);

    const newAnnouncement: Announcement = {
      id: 'anc_' + Date.now(),
      title: form.title,
      content: form.content,
      priority: form.priority,
      classId: form.classId,
      className: targetClass?.name || 'Tất cả lớp',
      senderName: 'Thầy Nguyễn Văn An',
      senderRole: 'Giáo viên chủ nhiệm',
      sentAt: new Date().toISOString(),
      targetRole: form.targetRole,
      readBy: [],
    };

    storage.saveAnnouncement(newAnnouncement);
    storage.addAuditLog({
      userId: 'u_teacher_1',
      userName: 'Thầy Nguyễn Văn An',
      userRole: 'teacher',
      action: 'Gửi thông báo lớp',
      module: 'Thông báo',
      details: `Gửi thông báo "${newAnnouncement.title}" tới đối tượng: ${newAnnouncement.targetRole}`,
    });

    setAnnouncements(storage.getAnnouncements());
    setIsCreateOpen(false);
    setForm({
      title: '',
      content: '',
      classId: currentClassId || 'cls_10a1',
      priority: 'normal',
      targetRole: 'all',
    });
  };

  const priorityStyles: Record<string, { label: string; class: string }> = {
    normal: { label: 'Bình thường', class: 'bg-slate-100 text-slate-700' },
    important: { label: 'Quan trọng', class: 'bg-blue-100 text-blue-800 font-bold' },
    urgent: { label: 'Khẩn cấp', class: 'bg-red-100 text-red-800 font-black' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Bảng Tin & Thông báo</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gửi thông báo tới toàn thể học sinh, phụ huynh hoặc theo từng lớp riêng biệt
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
        >
          <Plus className="w-4 h-4" /> Soạn thông báo mới
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((a) => {
          const pri = priorityStyles[a.priority] || priorityStyles.normal;
          return (
            <div
              key={a.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${pri.class}`}>
                    {pri.label}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Gửi tới: {a.targetRole === 'parents' ? 'Phụ huynh' : a.targetRole === 'students' ? 'Học sinh' : 'Cả phụ huynh & học sinh'}
                  </span>
                  {a.className && <span className="text-xs text-slate-400">· {a.className}</span>}
                </div>

                <span className="text-[11px] text-slate-400">
                  {new Date(a.sentAt).toLocaleString('vi-VN')}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{a.title}</h3>
                <p className="text-xs text-slate-700 mt-1.5 leading-relaxed whitespace-pre-wrap">
                  {a.content}
                </p>

                {a.attachments && a.attachments.length > 0 && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                    {a.attachments.map((att, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{att.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                <span>Người gửi: <strong>{a.senderName}</strong> ({a.senderRole})</span>
                <span className="flex items-center gap-1 font-semibold text-slate-600">
                  <Eye className="w-3.5 h-3.5" /> {a.readBy.length} người đã xem
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Announcement Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Soạn thông báo mới</h3>
            <form onSubmit={handleSendAnnouncement} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiêu đề thông báo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lịch thi giữa kỳ 1 và kế hoạch ôn tập"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gửi cho lớp</label>
                  <select
                    value={form.classId}
                    onChange={(e) => setForm({ ...form, classId: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none font-semibold"
                  >
                    <option value="all">Toàn bộ các lớp</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Đối tượng nhận</label>
                  <select
                    value={form.targetRole}
                    onChange={(e) => setForm({ ...form, targetRole: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none font-semibold"
                  >
                    <option value="all">Tất cả (Học sinh & Phụ huynh)</option>
                    <option value="parents">Chỉ gửi Phụ huynh</option>
                    <option value="students">Chỉ gửi Học sinh</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mức độ ưu tiên</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none font-semibold"
                >
                  <option value="normal">Thông thường</option>
                  <option value="important">Quan trọng</option>
                  <option value="urgent">Khẩn cấp</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nội dung thông báo *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Nhập nội dung thông báo đầy đủ..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  <Send className="w-4 h-4" /> Phát hành thông báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
