import React from 'react';
import { Award, Star, Trophy, ThumbsUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { storage } from '../../services/storage';

export const StudentAchievementsPage: React.FC = () => {
  const { user } = useAuth();
  const student = storage.getStudentById(user?.studentId || 'stu_1') || storage.getStudents()[0];
  const badges = storage.getRewardBadges(student.id);
  const behaviors = storage.getBehaviors(student.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Bảng vàng Thành tích & Huy hiệu</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Ghi nhận những nỗ lực, tiến bộ vượt bậc và tinh thần học tập gương mẫu của em
        </p>
      </div>

      {/* Badges Collection */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Huy hiệu đã đạt được ({badges.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-xl border border-amber-200 bg-gradient-to-tr from-amber-50 to-orange-50/30 flex items-start gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Star className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{b.badgeName}</h4>
                <p className="text-xs text-slate-600 mt-0.5">{b.reason}</p>
                <span className="text-[10px] text-slate-400 block mt-2">
                  Ngày nhận: {b.awardedAt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Behavior / Commendations log */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <ThumbsUp className="w-4 h-4 text-blue-600" />
          Lời khen & Ghi nhận từ Thầy Cô
        </h3>

        <div className="space-y-3">
          {behaviors.map((beh) => (
            <div
              key={beh.id}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-bold text-slate-900">{beh.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{beh.content}</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Người khen: {beh.teacherName} · Ngày {beh.date}
                </div>
              </div>
              <span className="font-black text-emerald-600 text-sm">+{beh.points} đ</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
