import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  QrCode,
  Save,
  RotateCcw,
  Calendar,
  Check,
  X,
  Camera,
  Users,
  Sparkles,
} from 'lucide-react';
import { useClass } from '../../contexts/ClassContext';
import { storage } from '../../services/storage';
import { AttendanceRecord, AttendanceStatus, Student } from '../../types';

export const AttendancePage: React.FC = () => {
  const { classes, currentClassId, setCurrentClassId } = useClass();

  // If currentClassId is valid, use it; otherwise fallback to first class in list or 'cls_10a1'
  const [classId, setClassId] = useState<string>(() => {
    if (currentClassId && (currentClassId === 'all' || classes.some((c) => c.id === currentClassId))) {
      return currentClassId;
    }
    return classes[0]?.id || 'cls_10a1';
  });

  const [date, setDate] = useState('2026-10-04');

  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: AttendanceStatus; reason?: string }>
  >({});
  const [isSaved, setIsSaved] = useState(false);
  const [isQrScanOpen, setIsQrScanOpen] = useState(false);
  const [editingReasonId, setEditingReasonId] = useState<string | null>(null);
  const [reasonInput, setReasonInput] = useState('');

  // Keep classId in sync if currentClassId changes from external navbar selector
  useEffect(() => {
    if (
      currentClassId &&
      currentClassId !== classId &&
      (currentClassId === 'all' || classes.some((c) => c.id === currentClassId))
    ) {
      setClassId(currentClassId);
    }
  }, [currentClassId, classes]);

  // Load students for current classId
  const loadStudents = () => {
    let list: Student[] = [];
    if (!classId || classId === 'all') {
      list = storage.getStudents();
    } else {
      list = storage.getStudentsByClass(classId);
    }

    // Safety fallback: if list is somehow empty, ensure auto-seed and reload
    if (!list || list.length === 0) {
      if (classId && classId !== 'all') {
        const cls = storage.getClassById(classId);
        const seeded = storage.seedCohortForClass(classId, cls?.name || 'Lớp học');
        const all = storage.getStudents();
        all.push(...seeded);
        localStorage.setItem('smartedu_students', JSON.stringify(all));
        list = storage.getStudentsByClass(classId);
      } else {
        list = storage.getStudents();
      }
    }

    setStudents(list || []);

    // Load existing records for this class & date
    const existing = storage.getAttendance(classId, date);
    const map: Record<string, { status: AttendanceStatus; reason?: string }> = {};

    (list || []).forEach((s) => {
      const rec = existing.find((e) => e.studentId === s.id);
      if (rec) {
        map[s.id] = { status: rec.status, reason: rec.reason };
      } else {
        map[s.id] = { status: 'present' }; // default present
      }
    });

    setAttendanceMap(map);
    setIsSaved(false);
  };

  useEffect(() => {
    loadStudents();
  }, [classId, date]);

  const handleSelectClass = (newClassId: string) => {
    setClassId(newClassId);
    if (newClassId !== 'all') {
      setCurrentClassId(newClassId);
    }
  };

  const handleSeedCurrentClass = () => {
    if (classId && classId !== 'all') {
      const cls = storage.getClassById(classId);
      const seeded = storage.seedCohortForClass(classId, cls?.name || 'Lớp học');
      const all = storage.getStudents().filter((s) => s.classId !== classId);
      all.push(...seeded);
      localStorage.setItem('smartedu_students', JSON.stringify(all));
      loadStudents();
    } else {
      storage.resetDatabase();
      loadStudents();
    }
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; reason?: string }> = {};
    students.forEach((s) => {
      updated[s.id] = { status: 'present' };
    });
    setAttendanceMap(updated);
    setIsSaved(false);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
    setIsSaved(false);

    if (status === 'excused' || status === 'unexcused' || status === 'late') {
      setEditingReasonId(studentId);
      setReasonInput(attendanceMap[studentId]?.reason || '');
    }
  };

  const handleSaveReason = (studentId: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        reason: reasonInput,
      },
    }));
    setEditingReasonId(null);
    setReasonInput('');
  };

  const handleSaveAttendance = () => {
    const records: AttendanceRecord[] = students.map((s) => ({
      id: `att_${s.classId || classId}_${date}_${s.id}`,
      classId: s.classId || classId,
      date,
      period: '',
      studentId: s.id,
      studentName: s.fullName,
      studentCode: s.code,
      status: attendanceMap[s.id]?.status || 'present',
      reason: attendanceMap[s.id]?.reason || '',
      updatedBy: 'Thầy Nguyễn Văn An',
      updatedAt: new Date().toISOString(),
    }));

    storage.saveAttendanceBatch(records);

    const targetClass = storage.getClassById(classId);
    storage.addAuditLog({
      userId: 'u_teacher_1',
      userName: 'Thầy Nguyễn Văn An',
      userRole: 'teacher',
      action: 'Lưu điểm danh',
      module: 'Điểm danh',
      details: `Lưu điểm danh ngày ${date} cho lớp ${targetClass?.name || classId}`,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Pure dark mode button configurations - NO WHITE BACKGROUND/BORDER
  const statusConfig: Record<
    AttendanceStatus,
    { label: string; activeClass: string; inactiveClass: string }
  > = {
    present: {
      label: 'Có mặt',
      activeClass: 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950',
      inactiveClass:
        'bg-[#080d19] text-emerald-400 border border-slate-800 hover:bg-slate-800 hover:text-emerald-300',
    },
    excused: {
      label: 'Có phép',
      activeClass: 'bg-amber-600 text-white font-bold shadow-md shadow-amber-950',
      inactiveClass:
        'bg-[#080d19] text-amber-400 border border-slate-800 hover:bg-slate-800 hover:text-amber-300',
    },
    unexcused: {
      label: 'Không phép',
      activeClass: 'bg-rose-600 text-white font-bold shadow-md shadow-rose-950',
      inactiveClass:
        'bg-[#080d19] text-rose-400 border border-slate-800 hover:bg-slate-800 hover:text-rose-300',
    },
    late: {
      label: 'Đi trễ',
      activeClass: 'bg-purple-600 text-white font-bold shadow-md shadow-purple-950',
      inactiveClass:
        'bg-[#080d19] text-purple-400 border border-slate-800 hover:bg-slate-800 hover:text-purple-300',
    },
    early_leave: {
      label: 'Về sớm',
      activeClass: 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-950',
      inactiveClass:
        'bg-[#080d19] text-indigo-400 border border-slate-800 hover:bg-slate-800 hover:text-indigo-300',
    },
  };

  const counts = {
    present: Object.values(attendanceMap).filter((v) => v.status === 'present').length,
    excused: Object.values(attendanceMap).filter((v) => v.status === 'excused').length,
    unexcused: Object.values(attendanceMap).filter((v) => v.status === 'unexcused').length,
    late: Object.values(attendanceMap).filter((v) => v.status === 'late').length,
    early_leave: Object.values(attendanceMap).filter((v) => v.status === 'early_leave').length,
  };

  const allSystemStudents = storage.getStudents();

  return (
    <div className="space-y-6 pb-28">
      {/* Top Controls Container - Pure Dark Theme */}
      <div className="bg-[#090d16] p-5 rounded-xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-cyan-400" />
              Điểm danh lớp học
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Thao tác cực nhanh: Đánh dấu tất cả có mặt, sau đó chỉ cần chạm để chỉnh ngoại lệ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQrScanOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <QrCode className="w-4 h-4 text-cyan-400" /> Quét QR điểm danh
            </button>
            <button
              onClick={handleMarkAllPresent}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 border border-cyan-400 rounded-lg text-xs font-bold transition shadow-md shadow-cyan-950/40"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" /> Đánh dấu tất cả Có mặt
            </button>
          </div>
        </div>

        {/* Date & Class Selectors - Pure Dark Theme (Removed period/session) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Chọn Lớp học điểm danh
            </label>
            <select
              value={classId}
              onChange={(e) => handleSelectClass(e.target.value)}
              className="w-full text-xs font-bold text-white bg-[#060910] border border-slate-800 rounded-lg p-2.5 outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">
                Toàn trường ({allSystemStudents.length} học sinh)
              </option>
              {classes.map((cls) => {
                const countInClass = allSystemStudents.filter((s) => s.classId === cls.id).length;
                return (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({countInClass} HS)
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Ngày điểm danh
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs font-bold text-white bg-[#060910] border border-slate-800 rounded-lg p-2.5 outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Summary KPI Counters - Pure Dark Theme */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center text-xs">
        <div className="bg-[#090d16] border border-emerald-900/60 p-3 rounded-xl shadow-md">
          <span className="text-[11px] text-emerald-400 font-semibold">Có mặt</span>
          <div className="text-xl font-black text-emerald-300 mt-0.5">{counts.present}</div>
        </div>
        <div className="bg-[#090d16] border border-amber-900/60 p-3 rounded-xl shadow-md">
          <span className="text-[11px] text-amber-400 font-semibold">Có phép</span>
          <div className="text-xl font-black text-amber-300 mt-0.5">{counts.excused}</div>
        </div>
        <div className="bg-[#090d16] border border-rose-900/60 p-3 rounded-xl shadow-md">
          <span className="text-[11px] text-rose-400 font-semibold">Không phép</span>
          <div className="text-xl font-black text-rose-300 mt-0.5">{counts.unexcused}</div>
        </div>
        <div className="bg-[#090d16] border border-purple-900/60 p-3 rounded-xl shadow-md">
          <span className="text-[11px] text-purple-400 font-semibold">Đi trễ</span>
          <div className="text-xl font-black text-purple-300 mt-0.5">{counts.late}</div>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-[#090d16] border border-indigo-900/60 p-3 rounded-xl shadow-md">
          <span className="text-[11px] text-indigo-400 font-semibold">Về sớm</span>
          <div className="text-xl font-black text-indigo-300 mt-0.5">{counts.early_leave}</div>
        </div>
      </div>

      {/* Roster & Attendance Status Buttons - Pure Dark Theme */}
      {students.length === 0 ? (
        <div className="bg-[#090d16] rounded-xl border border-slate-800 p-10 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#060910] border border-slate-700 flex items-center justify-center text-slate-400">
            <Users className="w-7 h-7 text-cyan-400" />
          </div>
          <h3 className="text-base font-bold text-white">Chưa có học sinh nào trong lớp này</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Lớp học hiện tại chưa có dữ liệu học sinh hoặc các học sinh vừa bị xóa. Bạn có thể nạp ngay danh sách học sinh mẫu cho lớp hoặc chọn xem toàn trường.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleSeedCurrentClass}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition shadow-md shadow-cyan-950/40"
            >
              Nạp ngay danh sách học sinh mẫu cho lớp
            </button>
            <button
              onClick={() => handleSelectClass('all')}
              className="px-4 py-2 bg-[#060910] hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold rounded-lg text-xs transition"
            >
              Xem toàn bộ học sinh trường ({allSystemStudents.length} HS)
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#090d16] rounded-xl border border-slate-800 shadow-xl divide-y divide-slate-800/80 overflow-hidden">
          {students.map((stu, idx) => {
            const currentStatus = attendanceMap[stu.id]?.status || 'present';
            const reason = attendanceMap[stu.id]?.reason;
            const isReasoning = editingReasonId === stu.id;

            return (
              <div
                key={stu.id}
                className="p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#0e1424] transition group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-400 w-6 text-center">
                    {idx + 1}
                  </span>
                  <img
                    src={
                      stu.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                    }
                    alt={stu.fullName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white tracking-wide">{stu.fullName}</span>
                      <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                        {stu.className}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="font-mono text-cyan-400">{stu.code}</span>
                      <span>·</span>
                      <span>{stu.group}</span>
                      {reason && (
                        <span className="text-amber-300 bg-amber-950/70 border border-amber-800/80 px-2 py-0.5 rounded font-medium text-[11px]">
                          Lý do: {reason}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Segmented Buttons - Pure Dark Themes */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {(['present', 'excused', 'unexcused', 'late', 'early_leave'] as AttendanceStatus[]).map(
                    (statusKey) => {
                      const isSelected = currentStatus === statusKey;
                      const conf = statusConfig[statusKey];
                      return (
                        <button
                          key={statusKey}
                          type="button"
                          onClick={() => handleStatusChange(stu.id, statusKey)}
                          className={`text-xs px-3 py-1.5 rounded-lg transition min-w-[76px] text-center font-semibold ${
                            isSelected ? conf.activeClass : conf.inactiveClass
                          }`}
                        >
                          {conf.label}
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Reason inline editor - Pure dark theme */}
                {isReasoning && (
                  <div className="col-span-full mt-2 p-2.5 bg-[#060910] border border-amber-800/80 rounded-lg flex items-center gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Nhập lý do nghỉ / đi muộn (vd: Bị ốm có đơn thuốc, hỏng xe...)"
                      value={reasonInput}
                      onChange={(e) => setReasonInput(e.target.value)}
                      className="flex-1 p-2 bg-[#090d16] border border-slate-700 rounded text-xs outline-none text-white focus:border-amber-400"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveReason(stu.id)}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold transition shadow"
                    >
                      Lưu lý do
                    </button>
                    <button
                      onClick={() => setEditingReasonId(null)}
                      className="p-1.5 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky Bottom Save Action Bar - Pure Dark */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#070a12]/95 backdrop-blur-md border-t border-slate-800 px-4 py-3 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-300">
            Tổng cộng: <strong className="text-white">{students.length} học sinh</strong> ·{' '}
            <span className="text-emerald-400 font-bold">{counts.present} có mặt</span> ·{' '}
            <span className="text-amber-400 font-bold">{counts.excused} có phép</span> ·{' '}
            <span className="text-rose-400 font-bold">{counts.unexcused} không phép</span> ·{' '}
            <span className="text-purple-400 font-bold">{counts.late} đi trễ</span>
          </div>

          <div className="flex items-center gap-3">
            {isSaved && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 animate-in fade-in">
                <Check className="w-4 h-4" /> Đã lưu vào hệ thống!
              </span>
            )}
            <button
              onClick={handleSaveAttendance}
              className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-cyan-950/60 transition hover:scale-105"
            >
              <Save className="w-4 h-4" />
              Lưu sổ điểm danh
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Scanner Simulator Modal - Pure Dark Theme */}
      {isQrScanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b0f19] text-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-800 space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-white">Điểm danh qua mã QR</h3>
            <p className="text-xs text-slate-400">
              Học sinh quét mã QR tại cửa lớp hoặc máy quét của giáo viên để tự động điểm danh
            </p>

            <div className="relative w-48 h-48 mx-auto bg-[#060910] border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center text-white">
              <Camera className="w-12 h-12 text-slate-400 animate-pulse" />
              <div className="absolute inset-4 border-2 border-cyan-400 rounded-lg animate-pulse" />
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Đang mô phỏng camera quét thẻ QR học sinh...
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  handleMarkAllPresent();
                  setIsQrScanOpen(false);
                }}
                className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold transition shadow"
              >
                Mô phỏng quét xong cả lớp
              </button>
              <button
                onClick={() => setIsQrScanOpen(false)}
                className="px-4 py-2 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-lg text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
