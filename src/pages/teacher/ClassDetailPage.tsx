import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  FileText,
  ClipboardList,
  Award,
  Calendar,
  BarChart3,
  Layers,
  QrCode,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { useClass } from '../../contexts/ClassContext';
import {
  ClassRoom,
  Student,
  AttendanceRecord,
  Assignment,
  GradeItem,
  BehaviorRecord,
  ScheduleItem,
} from '../../types';

export const ClassDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setCurrentClassId } = useClass();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'students' | 'attendance' | 'assignments' | 'grades' | 'behavior' | 'schedule' | 'reports'
  >('overview');

  const initialClass = storage.getClassById(id || '');
  const [currentClassData, setCurrentClassData] = useState<ClassRoom | undefined>(initialClass);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(initialClass?.name || '');

  useEffect(() => {
    if (id) {
      setCurrentClassId(id);
      const cls = storage.getClassById(id);
      setCurrentClassData(cls);
      if (cls) setEditedName(cls.name);
    }
  }, [id, setCurrentClassId]);

  if (!currentClassData) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h2 className="text-base font-bold text-slate-800">Không tìm thấy thông tin lớp học</h2>
        <button
          onClick={() => navigate('/teacher/classes')}
          className="mt-3 text-xs text-blue-600 font-semibold"
        >
          Quay lại danh sách lớp
        </button>
      </div>
    );
  }

  const handleSaveClassName = () => {
    if (!currentClassData || !editedName.trim()) {
      setIsEditingName(false);
      return;
    }
    const updated = { ...currentClassData, name: editedName.trim() };
    storage.saveClass(updated);
    setCurrentClassData(updated);

    const clsStudents = storage.getStudentsByClass(updated.id);
    clsStudents.forEach((s) => {
      s.className = updated.name;
      storage.saveStudent(s);
    });

    storage.addAuditLog({
      userId: 'u_teacher_1',
      userName: 'Thầy Nguyễn Văn An',
      userRole: 'teacher',
      action: 'Đổi tên lớp học',
      module: 'Lớp học',
      details: `Đổi tên lớp thành ${updated.name}`,
    });

    setIsEditingName(false);
  };

  const classRoom = currentClassData;

  const students = storage.getStudentsByClass(classRoom.id);
  const assignments = storage.getAssignments(classRoom.id);
  const [schedulesList, setSchedulesList] = useState<ScheduleItem[]>(() => storage.getSchedules(classRoom.id));
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editingScheduleSubject, setEditingScheduleSubject] = useState('');
  const attendanceToday = storage.getAttendance(classRoom.id, '2026-10-04');
  const grades = storage.getGrades(classRoom.id);
  const behaviors = storage.getBehaviors(undefined, classRoom.id);

  const handleSaveScheduleSubject = (scheduleId: string) => {
    if (!editingScheduleSubject.trim()) {
      setEditingScheduleId(null);
      return;
    }
    const target = schedulesList.find((s) => s.id === scheduleId);
    if (target) {
      const updated = { ...target, subject: editingScheduleSubject.trim() };
      storage.saveScheduleItem(updated);
      setSchedulesList(storage.getSchedules(classRoom.id));
    }
    setEditingScheduleId(null);
  };

  const handleDeleteScheduleItem = (scheduleId: string) => {
    storage.deleteScheduleItem(scheduleId);
    setSchedulesList(storage.getSchedules(classRoom.id));
  };

  // Simple state for quick student modal
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'male' | 'female'>('male');
  const [newStudentGroup, setNewStudentGroup] = useState('Tổ 1');

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newStudent: Student = {
      id: 'stu_' + Date.now(),
      code: `HS25-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: newStudentName,
      gender: newStudentGender,
      birthDate: '2010-05-15',
      classId: classRoom.id,
      className: classRoom.name,
      group: newStudentGroup,
      orderNumber: students.length + 1,
      status: 'studying',
      gpa: 8.0,
      attendanceRate: 100,
      rewardPoints: 50,
      submittedAssignmentsCount: 0,
      totalAssignmentsCount: 0,
      behaviorScore: 90,
    };

    storage.saveStudent(newStudent);
    storage.addAuditLog({
      userId: 'u_teacher_1',
      userName: 'Thầy Nguyễn Văn An',
      userRole: 'teacher',
      action: 'Thêm học sinh vào lớp',
      module: 'Học sinh',
      details: `Thêm học sinh ${newStudent.fullName} vào lớp ${classRoom.name}`,
    });

    setNewStudentName('');
    setIsAddStudentOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Class Banner Header */}
      <div className="bg-[#090d16] p-5 rounded-xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xs"
            style={{ backgroundColor: classRoom.color || '#2563EB' }}
          >
            {classRoom.name.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveClassName();
                      if (e.key === 'Escape') setIsEditingName(false);
                    }}
                    autoFocus
                    className="text-base font-bold text-white bg-[#060910] border border-cyan-500 rounded-md px-2 py-0.5 outline-none max-w-[200px]"
                    placeholder="Tên lớp..."
                  />
                  <button
                    onClick={handleSaveClassName}
                    className="p-1 text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 rounded transition"
                    title="Lưu tên lớp (Enter)"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="p-1 text-slate-400 hover:text-slate-300 bg-slate-800 rounded transition"
                    title="Hủy (Esc)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 group">
                  <h1 className="text-xl font-bold text-white">{classRoom.name}</h1>
                  <button
                    onClick={() => {
                      setEditedName(classRoom.name);
                      setIsEditingName(true);
                    }}
                    title="Chỉnh sửa tên lớp"
                    className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              )}
              <span className="text-[11px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 px-2 py-0.5 rounded font-mono">
                Mã: {classRoom.joinCode}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {classRoom.gradeName} · {classRoom.subjectName} · {classRoom.room} · Sĩ số: {students.length} HS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/teacher/assignments')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold transition shadow-md"
          >
            <FileText className="w-3.5 h-3.5" /> Giao bài tập
          </button>
        </div>
      </div>

      {/* 8 Detail Tabs */}
      <div className="border-b border-slate-200 bg-white px-3 rounded-t-xl overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {[
            { id: 'overview', label: 'Tổng quan', icon: Layers },
            { id: 'students', label: `Học sinh (${students.length})`, icon: Users },
            { id: 'attendance', label: 'Điểm danh', icon: UserCheck },
            { id: 'assignments', label: `Bài tập (${assignments.length})`, icon: FileText },
            { id: 'grades', label: 'Điểm số', icon: ClipboardList },
            { id: 'behavior', label: 'Thi đua & Hành vi', icon: Award },
            { id: 'schedule', label: 'Thời khóa biểu', icon: Calendar },
            { id: 'reports', label: 'Báo cáo lớp', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition ${
                  isActive
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Thông tin chung về lớp học</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Giáo viên phụ trách</span>
                  <span className="font-bold text-slate-800">{classRoom.teacherName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Phòng học</span>
                  <span className="font-bold text-slate-800">{classRoom.room}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Niên khóa</span>
                  <span className="font-bold text-slate-800">{classRoom.academicYear}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Trạng thái</span>
                  <span className="font-bold text-emerald-600">Đang giảng dạy</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-xs block mb-0.5">Mô tả lớp học</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {classRoom.description || 'Chưa cập nhật mô tả'}
                </p>
              </div>
            </div>

            {/* Quick stats in class */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                <span className="text-xs text-slate-400">Điểm trung bình (GPA)</span>
                <div className="text-2xl font-black text-blue-600 mt-1">8.4</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                <span className="text-xs text-slate-400">Tỷ lệ chuyên cần</span>
                <div className="text-2xl font-black text-emerald-600 mt-1">96.8%</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                <span className="text-xs text-slate-400">Tỷ lệ nộp bài tập</span>
                <div className="text-2xl font-black text-purple-600 mt-1">94.2%</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Join QR Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 text-center shadow-2xs">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Mã tham gia lớp
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Dành cho học sinh và phụ huynh</p>

              <div className="my-4 inline-block p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                    `https://smartedu.edu.vn/join/${classRoom.joinCode}`
                  )}`}
                  alt="QR"
                  className="w-32 h-32 mx-auto"
                />
              </div>

              <div className="font-mono text-sm font-black text-blue-700 bg-blue-50 py-1.5 px-4 rounded-lg inline-block">
                {classRoom.joinCode}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS */}
      {activeTab === 'students' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900">
              Danh sách học sinh lớp {classRoom.name} ({students.length} em)
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/teacher/students/import')}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Import Excel / CSV
              </button>
              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
              >
                <Plus className="w-4 h-4" /> Thêm học sinh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">STT</th>
                  <th className="py-2.5 px-3">Mã HS</th>
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3">Giới tính</th>
                  <th className="py-2.5 px-3">Tổ</th>
                  <th className="py-2.5 px-3 text-center">GPA</th>
                  <th className="py-2.5 px-3 text-center">Chuyên cần</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((stu, idx) => (
                  <tr key={stu.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-700">{stu.code}</td>
                    <td className="py-2.5 px-3">
                      <div
                        onClick={() => navigate(`/teacher/students/${stu.id}`)}
                        className="font-bold text-slate-800 hover:text-blue-600 cursor-pointer flex items-center gap-2"
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                          {stu.fullName.slice(0, 1)}
                        </div>
                        <span>{stu.fullName}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {stu.gender === 'female' ? 'Nữ' : 'Nam'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">{stu.group}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-blue-600">{stu.gpa}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-600">
                      {stu.attendanceRate}%
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => navigate(`/teacher/students/${stu.id}`)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold"
                      >
                        Hồ sơ 360°
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="bg-[#090d16] p-5 rounded-xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Điểm danh ngày hôm nay (04/10/2026)</h3>
              <p className="text-xs text-slate-400">Ghi nhận chuyên cần lớp {classRoom.name}</p>
            </div>
            <button
              onClick={() => navigate('/teacher/attendance')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
            >
              Mở trang điểm danh chi tiết <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
            {students.map((stu) => {
              const rec = attendanceToday.find((a) => a.studentId === stu.id);
              const status = rec?.status || 'present';
              return (
                <div
                  key={stu.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-[#060910] hover:bg-[#0e1424] transition"
                >
                  <span className="font-semibold text-white">{stu.fullName}</span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded border ${
                      status === 'present'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                        : status === 'excused'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                        : 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                    }`}
                  >
                    {status === 'present' ? 'Có mặt' : status === 'excused' ? 'Có phép' : 'Vắng'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Bài tập giao cho lớp {classRoom.name}</h3>
            <button
              onClick={() => navigate('/teacher/assignments')}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
            >
              + Tạo bài tập mới
            </button>
          </div>

          <div className="space-y-3">
            {assignments.map((asg) => (
              <div
                key={asg.id}
                onClick={() => navigate('/teacher/assignments')}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 cursor-pointer transition flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-bold text-slate-800">{asg.title}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Ngày giao: {asg.assignedDate} · Hạn nộp: {new Date(asg.dueDate).toLocaleDateString('vi-VN')} · Thang điểm: {asg.maxScore}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-blue-600">
                    {asg.submissionsCount || 0} / {students.length} nộp bài
                  </div>
                  <span className="text-[10px] text-slate-400">Đã chấm: {asg.gradedCount || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: GRADES */}
      {activeTab === 'grades' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Bảng điểm tổng hợp ({classRoom.name})</h3>
            <button
              onClick={() => navigate('/teacher/grades')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Mở sổ điểm chi tiết & xuất Excel →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">STT</th>
                  <th className="py-2.5 px-3">Học sinh</th>
                  <th className="py-2.5 px-3 text-center">Miệng</th>
                  <th className="py-2.5 px-3 text-center">15 Phút</th>
                  <th className="py-2.5 px-3 text-center">1 Tiết</th>
                  <th className="py-2.5 px-3 text-center font-bold text-blue-700">ĐTB (GPA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((stu, i) => (
                  <tr key={stu.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{i + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{stu.fullName}</td>
                    <td className="py-2.5 px-3 text-center font-mono">9.0</td>
                    <td className="py-2.5 px-3 text-center font-mono">8.5</td>
                    <td className="py-2.5 px-3 text-center font-mono">8.8</td>
                    <td className="py-2.5 px-3 text-center font-bold text-blue-600 font-mono">
                      {stu.gpa}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: BEHAVIOR */}
      {activeTab === 'behavior' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Thi đua & Ghi nhận hành vi</h3>
            <button
              onClick={() => navigate('/teacher/behavior')}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold"
            >
              + Ghi nhận rèn luyện
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {behaviors.map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-800">
                    {b.studentName} · <span className="font-medium text-slate-600">{b.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{b.content}</div>
                </div>
                <div
                  className={`font-black text-sm ${
                    b.points > 0 ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {b.points > 0 ? `+${b.points}` : b.points} đ
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Thời khóa biểu tuần ({classRoom.name})</h3>
            <button
              onClick={() => navigate('/teacher/schedule')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Chỉnh sửa thời khóa biểu →
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {schedulesList.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between group hover:border-blue-200 hover:bg-blue-50/40 transition"
              >
                <div className="flex-1 mr-3">
                  <span className="font-bold text-blue-700">Thứ {s.dayOfWeek} · Tiết {s.period}</span>
                  {editingScheduleId === s.id ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="text"
                        value={editingScheduleSubject}
                        onChange={(e) => setEditingScheduleSubject(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveScheduleSubject(s.id);
                          if (e.key === 'Escape') setEditingScheduleId(null);
                        }}
                        autoFocus
                        className="text-xs font-semibold px-2 py-0.5 border border-blue-500 rounded bg-white outline-none ring-2 ring-blue-100"
                        placeholder="Tên môn..."
                      />
                      <button
                        onClick={() => handleSaveScheduleSubject(s.id)}
                        className="p-1 text-emerald-600 hover:text-emerald-700 bg-emerald-50 rounded transition"
                        title="Lưu (Enter)"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingScheduleId(null)}
                        className="p-1 text-slate-400 hover:text-slate-600 bg-slate-100 rounded transition"
                        title="Hủy (Esc)"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="font-semibold text-slate-800">{s.subject}</div>
                      {/* Action buttons: CHỈ HIỆN KHI RÊ CHUỘT VÀO, BỎ CHUỘT RA THÌ ẨN HOÀN TOÀN */}
                      <div className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingScheduleId(s.id);
                            setEditingScheduleSubject(s.subject);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded transition"
                          title="Bút chì: Đổi tên môn học"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteScheduleItem(s.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Xóa môn khỏi TKB"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="text-[11px] text-slate-500 mt-0.5">{s.room} · GV: {s.teacherName}</div>
                </div>
                <div className="font-mono text-slate-600 font-medium shrink-0">
                  {s.startTime} - {s.endTime}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: REPORTS */}
      {activeTab === 'reports' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Báo cáo tổng kết lớp {classRoom.name}</h3>
            <button
              onClick={() => navigate('/teacher/reports')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
            >
              Xuất báo cáo PDF / Excel
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-2">
            <div className="font-bold text-slate-800">Đánh giá chung học kỳ 1 (Niên khóa 2025 - 2026)</div>
            <p className="text-slate-600 leading-relaxed">
              Tập thể lớp {classRoom.name} duy trì nề nếp kỷ luật tốt, tỷ lệ chuyên cần đạt 96.8%. 
              Điểm trung bình các môn tự nhiên ở mức Khá - Giỏi (8.4/10). Cần tăng cường phụ đạo cho các em học sinh có điểm kiểm tra 15 phút dưới 6.5.
            </p>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3">Thêm học sinh mới</h3>
            <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn C"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={newStudentGender}
                    onChange={(e) => setNewStudentGender(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tổ sinh hoạt</label>
                  <select
                    value={newStudentGroup}
                    onChange={(e) => setNewStudentGroup(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  >
                    <option value="Tổ 1">Tổ 1</option>
                    <option value="Tổ 2">Tổ 2</option>
                    <option value="Tổ 3">Tổ 3</option>
                    <option value="Tổ 4">Tổ 4</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Lưu học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
