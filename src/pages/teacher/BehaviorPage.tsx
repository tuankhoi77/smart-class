import React, { useState } from 'react';
import {
  Award,
  Plus,
  ThumbsUp,
  AlertCircle,
  Users,
  Trophy,
  Star,
  Check,
} from 'lucide-react';
import { useClass } from '../../contexts/ClassContext';
import { storage } from '../../services/storage';
import { BehaviorRecord, RewardBadge } from '../../types';

export const BehaviorPage: React.FC = () => {
  const { currentClassId, currentClass } = useClass();

  const students = storage.getStudentsByClass(currentClassId || 'cls_10a1');
  const [behaviors, setBehaviors] = useState<BehaviorRecord[]>(() =>
    storage.getBehaviors(undefined, currentClassId || 'cls_10a1')
  );

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);

  const [recordForm, setRecordForm] = useState({
    studentId: students[0]?.id || '',
    type: 'positive' as 'positive' | 'needs_improvement',
    points: 10,
    title: 'Hăng hái phát biểu xây dựng bài',
    content: 'Xung phong lên bảng giải bài tập khó và giúp đỡ các bạn trong tổ.',
  });

  const [badgeForm, setBadgeForm] = useState({
    studentId: students[0]?.id || '',
    badgeName: 'Ngôi sao Chăm chỉ',
    icon: 'Star',
    reason: 'Đạt chuyên cần 100% trong tháng',
  });

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const stu = students.find((s) => s.id === recordForm.studentId);
    if (!stu) return;

    const record: BehaviorRecord = {
      id: 'beh_' + Date.now(),
      studentId: stu.id,
      studentName: stu.fullName,
      classId: currentClassId || 'cls_10a1',
      type: recordForm.type,
      points: recordForm.type === 'positive' ? Math.abs(recordForm.points) : -Math.abs(recordForm.points),
      title: recordForm.title,
      content: recordForm.content,
      teacherName: 'Thầy Nguyễn Văn An',
      date: '2026-10-04',
    };

    storage.saveBehavior(record);
    storage.addAuditLog({
      userId: 'u_teacher_1',
      userName: 'Thầy Nguyễn Văn An',
      userRole: 'teacher',
      action: 'Ghi nhận thi đua học sinh',
      module: 'Thi đua',
      details: `${record.points > 0 ? 'Khen thưởng' : 'Nhắc nhở'} em ${stu.fullName} (${record.points} đ)`,
    });

    setBehaviors(storage.getBehaviors(undefined, currentClassId || 'cls_10a1'));
    setIsRecordModalOpen(false);
  };

  const handleAwardBadge = (e: React.FormEvent) => {
    e.preventDefault();
    const stu = students.find((s) => s.id === badgeForm.studentId);
    if (!stu) return;

    const badge: RewardBadge = {
      id: 'bdg_' + Date.now(),
      studentId: stu.id,
      badgeName: badgeForm.badgeName,
      icon: badgeForm.icon,
      reason: badgeForm.reason,
      awardedAt: '2026-10-04',
    };

    storage.awardBadge(badge);
    setIsBadgeModalOpen(false);
  };

  // Group / Tổ calculation
  const groupStats: Record<string, { totalPoints: number; count: number }> = {
    'Tổ 1': { totalPoints: 120, count: 8 },
    'Tổ 2': { totalPoints: 95, count: 8 },
    'Tổ 3': { totalPoints: 110, count: 8 },
    'Tổ 4': { totalPoints: 105, count: 8 },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Thi đua, Khen thưởng & Hành vi</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ghi nhận tiến bộ, tích lũy điểm thưởng theo tổ, ưu tiên động viên và khích lệ học sinh
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBadgeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Trophy className="w-4 h-4 text-amber-500" /> Trao huy hiệu
          </button>
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" /> Ghi nhận rèn luyện
          </button>
        </div>
      </div>

      {/* Group progress cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(groupStats).map(([grpName, val], idx) => (
          <div key={grpName} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-900">{grpName}</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-amber-500 mt-1">+{val.totalPoints} đ</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{val.count} thành viên · Tiến bộ tốt</div>
          </div>
        ))}
      </div>

      {/* Behavior Logs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Nhật ký ghi nhận rèn luyện gần đây</h3>

        <div className="space-y-3">
          {behaviors.map((b) => (
            <div
              key={b.id}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    b.points > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                  }`}
                >
                  {b.points > 0 ? <ThumbsUp className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-bold text-slate-900">
                    {b.studentName} · <span className="font-medium text-slate-700">{b.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{b.content}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Ngày: {b.date} · Giáo viên: {b.teacherName}
                  </div>
                </div>
              </div>

              <div
                className={`font-black text-base ${
                  b.points > 0 ? 'text-emerald-600' : 'text-red-500'
                }`}
              >
                {b.points > 0 ? `+${b.points}` : b.points} đ
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Record Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Ghi nhận hành vi / thi đua</h3>
            <form onSubmit={handleSaveRecord} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Học sinh *</label>
                <select
                  value={recordForm.studentId}
                  onChange={(e) => setRecordForm({ ...recordForm, studentId: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none font-bold"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.group})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tính chất</label>
                  <select
                    value={recordForm.type}
                    onChange={(e) =>
                      setRecordForm({ ...recordForm, type: e.target.value as any })
                    }
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                  >
                    <option value="positive">Tích cực (+ điểm)</option>
                    <option value="needs_improvement">Nhắc nhở (- điểm)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số điểm</label>
                  <input
                    type="number"
                    value={recordForm.points}
                    onChange={(e) =>
                      setRecordForm({ ...recordForm, points: Number(e.target.value) })
                    }
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiêu đề ghi nhận</label>
                <input
                  type="text"
                  value={recordForm.title}
                  onChange={(e) => setRecordForm({ ...recordForm, title: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chi tiết nhận xét</label>
                <textarea
                  rows={2}
                  value={recordForm.content}
                  onChange={(e) => setRecordForm({ ...recordForm, content: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Lưu vào sổ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Badge Modal */}
      {isBadgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Trao tặng huy hiệu vinh danh</h3>
            <form onSubmit={handleAwardBadge} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Học sinh được trao</label>
                <select
                  value={badgeForm.studentId}
                  onChange={(e) => setBadgeForm({ ...badgeForm, studentId: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none font-bold"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.group})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên huy hiệu</label>
                <select
                  value={badgeForm.badgeName}
                  onChange={(e) => setBadgeForm({ ...badgeForm, badgeName: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                >
                  <option value="Ngôi sao Chăm chỉ">Ngôi sao Chăm chỉ</option>
                  <option value="Nhà Toán học Tương lai">Nhà Toán học Tương lai</option>
                  <option value="Bứt phá Tiến bộ">Bứt phá Tiến bộ</option>
                  <option value="Tinh thần Đồng đội">Tinh thần Đồng đội</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lý do tuyên dương</label>
                <input
                  type="text"
                  value={badgeForm.reason}
                  onChange={(e) => setBadgeForm({ ...badgeForm, reason: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBadgeModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold"
                >
                  Trao huy hiệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
