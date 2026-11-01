import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Users,
  Copy,
  Archive,
  QrCode,
  ArrowRight,
  MoreVertical,
  Check,
  Trash2,
  Calendar,
  Layers,
  Pencil,
  Edit,
  X,
  Settings,
  BookOpen,
  UserCheck,
  Sparkles,
  Palette,
  Shield,
  Clock,
  UserPlus,
  ExternalLink,
} from 'lucide-react';
import { useClass } from '../../contexts/ClassContext';
import { storage } from '../../services/storage';
import { ClassRoom, Student, ScheduleItem } from '../../types';

export const ClassesPage: React.FC = () => {
  const { classes, refreshClasses, setCurrentClassId } = useClass();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<ClassRoom | null>(null);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState<ClassRoom | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<ClassRoom | null>(null);
  const [editActiveTab, setEditActiveTab] = useState<'info' | 'students' | 'schedule' | 'settings'>('info');
  const [targetYear, setTargetYear] = useState('2026 - 2027');

  // Quick inline rename states
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Full edit modal form state
  const [editClassForm, setEditClassForm] = useState({
    name: '',
    gradeLevelId: 'gr_10',
    gradeName: 'Khối 10',
    subjectName: 'Toán học',
    room: '',
    description: '',
    color: '#2563EB',
    status: 'active' as 'active' | 'archived',
    teacherName: 'Thầy Nguyễn Văn An',
    academicYear: '2025 - 2026',
    joinCode: '',
  });

  // Modal student management state
  const [editStudents, setEditStudents] = useState<Student[]>([]);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'male' | 'female'>('male');
  const [newStudentGroup, setNewStudentGroup] = useState('Tổ 1');
  const [studentSearch, setStudentSearch] = useState('');

  // Modal schedule state
  const [editSchedules, setEditSchedules] = useState<ScheduleItem[]>([]);

  const [newClassForm, setNewClassForm] = useState({
    name: '',
    gradeLevelId: 'gr_10',
    gradeName: 'Khối 10',
    subjectName: 'Toán học',
    room: '',
    description: '',
    color: '#2563EB',
  });

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredClasses = classes.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.room.toLowerCase().includes(search.toLowerCase()) ||
      c.joinCode.toLowerCase().includes(search.toLowerCase());
    const matchGrade = selectedGrade === 'all' || c.gradeLevelId === selectedGrade;
    const matchStatus = selectedStatus === 'all' || c.status === selectedStatus;
    return matchSearch && matchGrade && matchStatus;
  });

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    const gradeObj = storage.getGradeLevels().find((g) => g.id === newClassForm.gradeLevelId);
    const newClass: ClassRoom = {
      id: 'cls_' + Date.now(),
      name: newClassForm.name,
      gradeLevelId: newClassForm.gradeLevelId,
      gradeName: gradeObj?.name || 'Khối 10',
      subjectName: newClassForm.subjectName,
      academicYear: '2025 - 2026',
      teacherId: 'u_teacher_1',
      teacherName: 'Thầy Nguyễn Văn An',
      room: newClassForm.room || 'Phòng học mới',
      description: newClassForm.description,
      color: newClassForm.color,
      studentCount: 0,
      status: 'active',
      joinCode: 'JOIN' + Math.floor(1000 + Math.random() * 9000),
    };

    storage.saveClass(newClass);
    storage.addAuditLog({
      userId: 'u_teacher_1',
      userName: 'Thầy Nguyễn Văn An',
      userRole: 'teacher',
      action: 'Tạo lớp học mới',
      module: 'Lớp học',
      details: `Khởi tạo lớp: ${newClass.name} (${newClass.room})`,
    });

    refreshClasses();
    setIsCreateOpen(false);
    setNewClassForm({
      name: '',
      gradeLevelId: 'gr_10',
      gradeName: 'Khối 10',
      subjectName: 'Toán học',
      room: '',
      description: '',
      color: '#2563EB',
    });
  };

  const handleDuplicate = () => {
    if (!isDuplicateOpen) return;
    const res = storage.duplicateClass(isDuplicateOpen.id, targetYear);
    if (res) {
      storage.addAuditLog({
        userId: 'u_teacher_1',
        userName: 'Thầy Nguyễn Văn An',
        userRole: 'teacher',
        action: 'Sao chép lớp sang năm học mới',
        module: 'Lớp học',
        details: `Sao chép ${isDuplicateOpen.name} sang năm học ${targetYear}`,
      });
      refreshClasses();
      setIsDuplicateOpen(null);
    }
  };

  const handleStartRename = (cls: ClassRoom) => {
    setEditingClassId(cls.id);
    setEditingName(cls.name);
  };

  const handleSaveRename = (classId: string) => {
    if (!editingName.trim()) {
      setEditingClassId(null);
      return;
    }
    const target = storage.getClassById(classId);
    if (target) {
      const oldName = target.name;
      target.name = editingName.trim();
      storage.saveClass(target);

      // Update student references
      const students = storage.getStudentsByClass(classId);
      students.forEach((s) => {
        s.className = target.name;
        storage.saveStudent(s);
      });

      storage.addAuditLog({
        userId: 'u_teacher_1',
        userName: 'Thầy Nguyễn Văn An',
        userRole: 'teacher',
        action: 'Đổi tên lớp học',
        module: 'Lớp học',
        details: `Đổi tên lớp từ "${oldName}" thành "${target.name}"`,
      });

      refreshClasses();
    }
    setEditingClassId(null);
  };

  const handleStartEditModal = (cls: ClassRoom) => {
    setIsEditModalOpen(cls);
    setEditActiveTab('info');
    setEditClassForm({
      name: cls.name,
      gradeLevelId: cls.gradeLevelId,
      gradeName: cls.gradeName,
      subjectName: cls.subjectName || 'Toán học',
      room: cls.room,
      description: cls.description || '',
      color: cls.color || '#2563EB',
      status: cls.status,
      teacherName: cls.teacherName || 'Thầy Nguyễn Văn An',
      academicYear: cls.academicYear || '2025 - 2026',
      joinCode: cls.joinCode || '',
    });
    setEditStudents(storage.getStudentsByClass(cls.id));
    setEditSchedules(storage.getSchedules(cls.id));
  };

  const handleAddStudentInModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditModalOpen || !newStudentName.trim()) return;

    const newStudent: Student = {
      id: 'stu_' + Date.now(),
      code: `HS25-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: newStudentName.trim(),
      gender: newStudentGender,
      birthDate: '2010-05-15',
      classId: isEditModalOpen.id,
      className: editClassForm.name.trim() || isEditModalOpen.name,
      group: newStudentGroup,
      orderNumber: editStudents.length + 1,
      status: 'studying',
      gpa: 8.0,
      attendanceRate: 100,
      rewardPoints: 50,
      submittedAssignmentsCount: 0,
      totalAssignmentsCount: 0,
      behaviorScore: 90,
    };

    storage.saveStudent(newStudent);
    const updatedList = storage.getStudentsByClass(isEditModalOpen.id);
    setEditStudents(updatedList);

    // Update class student count
    const target = storage.getClassById(isEditModalOpen.id);
    if (target) {
      target.studentCount = updatedList.length;
      storage.saveClass(target);
      refreshClasses();
    }

    setNewStudentName('');
  };

  const handleDeleteStudentInModal = (studentId: string) => {
    if (!isEditModalOpen) return;
    storage.deleteStudent(studentId);
    const updatedList = storage.getStudentsByClass(isEditModalOpen.id);
    setEditStudents(updatedList);

    const target = storage.getClassById(isEditModalOpen.id);
    if (target) {
      target.studentCount = updatedList.length;
      storage.saveClass(target);
      refreshClasses();
    }
  };

  const handleSaveEditModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditModalOpen || !editClassForm.name.trim()) return;

    const gradeObj = storage.getGradeLevels().find((g) => g.id === editClassForm.gradeLevelId);
    const updatedClass: ClassRoom = {
      ...isEditModalOpen,
      name: editClassForm.name.trim(),
      gradeLevelId: editClassForm.gradeLevelId,
      gradeName: gradeObj?.name || editClassForm.gradeName,
      subjectName: editClassForm.subjectName.trim() || 'Chung',
      room: editClassForm.room.trim() || 'Phòng học',
      description: editClassForm.description.trim(),
      color: editClassForm.color,
      status: editClassForm.status,
      teacherName: editClassForm.teacherName.trim() || isEditModalOpen.teacherName,
      academicYear: editClassForm.academicYear.trim() || isEditModalOpen.academicYear,
      joinCode: editClassForm.joinCode.trim() || isEditModalOpen.joinCode,
      studentCount: editStudents.length,
    };

    storage.saveClass(updatedClass);

    // Update students className
    const students = storage.getStudentsByClass(updatedClass.id);
    students.forEach((s) => {
      s.className = updatedClass.name;
      storage.saveStudent(s);
    });

    storage.addAuditLog({
      userId: 'u_teacher_1',
      userName: 'Thầy Nguyễn Văn An',
      userRole: 'teacher',
      action: 'Chỉnh sửa thông tin lớp học',
      module: 'Lớp học',
      details: `Cập nhật toàn diện thông tin lớp ${updatedClass.name}`,
    });

    refreshClasses();
    setIsEditModalOpen(null);
  };

  const handleArchive = (id: string) => {
    storage.archiveClass(id);
    refreshClasses();
  };

  const handleDelete = (cls: ClassRoom) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa lớp ${cls.name}? Dữ liệu liên quan có thể bị ảnh hưởng!`)) {
      storage.deleteClass(cls.id);
      storage.addAuditLog({
        userId: 'u_teacher_1',
        userName: 'Thầy Nguyễn Văn An',
        userRole: 'teacher',
        action: 'Xóa lớp học',
        module: 'Lớp học',
        details: `Xóa lớp ${cls.name}`,
      });
      refreshClasses();
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Quản lý lớp học</h1>
          <p className="text-xs text-slate-400 mt-1">
            Danh sách các lớp giảng dạy và chủ nhiệm trong năm học 2025 - 2026
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 px-3.5 py-2 rounded-lg transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          Tạo lớp mới
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#090d16] p-4 rounded-xl border border-slate-800 shadow-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên lớp, phòng học, mã tham gia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#060910] border border-slate-800 text-slate-100 placeholder-slate-500 rounded-lg outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="text-xs font-semibold text-slate-200 bg-[#060910] border border-slate-800 rounded-lg px-2.5 py-1.5 outline-none"
          >
            <option value="all">Tất cả Khối</option>
            <option value="gr_10">Khối 10</option>
            <option value="gr_11">Khối 11</option>
            <option value="gr_12">Khối 12</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-semibold text-slate-200 bg-[#060910] border border-slate-800 rounded-lg px-2.5 py-1.5 outline-none"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="active">Đang giảng dạy</option>
            <option value="archived">Đã lưu trữ</option>
          </select>
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClasses.map((cls) => (
          <div
            key={cls.id}
            className="bg-[#090d16] rounded-xl border border-slate-800 overflow-hidden shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div>
              {/* Card Header Stripe with Color */}
              <div
                className="h-3"
                style={{ backgroundColor: cls.color || '#2563EB' }}
              />

              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="w-full">
                    <div className="flex items-center gap-2 flex-wrap">
                      {editingClassId === cls.id ? (
                        <div
                          className="flex items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(cls.id);
                              if (e.key === 'Escape') setEditingClassId(null);
                            }}
                            autoFocus
                            className="text-base font-bold text-white bg-[#060910] border border-cyan-500 rounded-md px-2 py-0.5 outline-none max-w-[180px]"
                            placeholder="Tên lớp..."
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRename(cls.id)}
                            className="p-1 text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 rounded transition"
                            title="Lưu tên lớp (Enter)"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingClassId(null)}
                            className="p-1 text-slate-400 hover:text-slate-300 bg-slate-800 rounded transition"
                            title="Hủy (Esc)"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 group">
                          <h3
                            onClick={() => {
                              setCurrentClassId(cls.id);
                              navigate(`/teacher/classes/${cls.id}`);
                            }}
                            className="text-base font-bold text-white hover:text-cyan-400 cursor-pointer transition"
                          >
                            {cls.name}
                          </h3>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartRename(cls);
                            }}
                            title="Chỉnh sửa tên lớp"
                            className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          cls.status === 'active'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {cls.status === 'active' ? 'Đang hoạt động' : 'Lưu trữ'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {cls.subjectName} · {cls.room}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                  {cls.description || 'Không có mô tả chi tiết'}
                </p>

                {/* Sĩ số & Join Code */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cls.studentCount} học sinh</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-400">Mã:</span>
                    <button
                      onClick={() => handleCopyCode(cls.joinCode)}
                      title="Sao chép mã tham gia"
                      className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-950 px-2 py-0.5 rounded flex items-center gap-1 transition border border-cyan-800/50"
                    >
                      {cls.joinCode}
                      {copiedCode === cls.joinCode ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-cyan-400" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsQrModalOpen(cls)}
                      title="Mã QR tham gia"
                      className="p-1 text-slate-400 hover:text-cyan-300 transition"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Action Footer */}
            <div className="bg-[#060910] px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartEditModal(cls)}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] font-bold"
                  title="Chỉnh sửa thông tin lớp học"
                >
                  <Edit className="w-3.5 h-3.5" /> Sửa
                </button>
                <button
                  onClick={() => setIsDuplicateOpen(cls)}
                  className="text-slate-400 hover:text-slate-200 flex items-center gap-1 text-[11px]"
                  title="Sao chép lớp sang năm học mới"
                >
                  <Copy className="w-3 h-3" /> Sao chép
                </button>
                <button
                  onClick={() => handleArchive(cls.id)}
                  className="text-slate-400 hover:text-slate-200 flex items-center gap-1 text-[11px]"
                  title="Lưu trữ"
                >
                  <Archive className="w-3 h-3" />
                  {cls.status === 'active' ? 'Lưu trữ' : 'Kích hoạt'}
                </button>
                <button
                  onClick={() => handleDelete(cls)}
                  className="text-rose-400 hover:text-rose-300 p-1 transition"
                  title="Xóa lớp"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              <button
                onClick={() => {
                  setCurrentClassId(cls.id);
                  navigate(`/teacher/classes/${cls.id}`);
                }}
                className="font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
              >
                Vào lớp <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Class Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b0f19] text-slate-100 rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-800">
            <h3 className="text-base font-bold text-white mb-3">Tạo lớp học mới</h3>
            <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tên lớp *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lớp 10A3, Lớp 11A1 Chuyên..."
                  value={newClassForm.name}
                  onChange={(e) => setNewClassForm({ ...newClassForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#060910] border border-slate-800 rounded-lg outline-none focus:border-cyan-500 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Khối *</label>
                  <select
                    value={newClassForm.gradeLevelId}
                    onChange={(e) =>
                      setNewClassForm({ ...newClassForm, gradeLevelId: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#060910] border border-slate-800 rounded-lg outline-none text-slate-200"
                  >
                    <option value="gr_10">Khối 10</option>
                    <option value="gr_11">Khối 11</option>
                    <option value="gr_12">Khối 12</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Môn học / Chức vụ</label>
                  <input
                    type="text"
                    placeholder="Toán học, Chủ nhiệm..."
                    value={newClassForm.subjectName}
                    onChange={(e) =>
                      setNewClassForm({ ...newClassForm, subjectName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#060910] border border-slate-800 rounded-lg outline-none text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Phòng học</label>
                <input
                  type="text"
                  placeholder="Phòng 303 - Tòa A"
                  value={newClassForm.room}
                  onChange={(e) => setNewClassForm({ ...newClassForm, room: e.target.value })}
                  className="w-full px-3 py-2 bg-[#060910] border border-slate-800 rounded-lg outline-none text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Mô tả ngắn</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả mục tiêu lớp học hoặc thông tin thêm..."
                  value={newClassForm.description}
                  onChange={(e) =>
                    setNewClassForm({ ...newClassForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#060910] border border-slate-800 rounded-lg outline-none text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Màu nhận diện</label>
                <div className="flex items-center gap-2">
                  {['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0284C7'].map(
                    (col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setNewClassForm({ ...newClassForm, color: col })}
                        style={{ backgroundColor: col }}
                        className={`w-6 h-6 rounded-full border-2 ${
                          newClassForm.color === col ? 'border-white scale-110 shadow-md ring-2 ring-cyan-400' : 'border-transparent'
                        }`}
                      />
                    )
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-2 border border-slate-800 rounded-lg text-slate-300 hover:bg-slate-800 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg font-bold"
                >
                  Tạo lớp ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b0f19] text-slate-100 rounded-xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-800">
            <h3 className="text-base font-bold text-white">
              Mã QR tham gia {isQrModalOpen.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Học sinh và phụ huynh quét mã bằng điện thoại để vào lớp
            </p>

            {/* Generated QR graphic */}
            <div className="my-5 p-4 bg-white rounded-xl inline-block mx-auto shadow-md">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  `https://smartedu.edu.vn/join/${isQrModalOpen.joinCode}`
                )}`}
                alt="QR Code"
                className="w-40 h-40 mx-auto"
              />
            </div>

            <div className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 py-1.5 px-3 rounded-lg inline-block">
              Mã vào lớp: {isQrModalOpen.joinCode}
            </div>

            <div className="mt-5">
              <button
                onClick={() => setIsQrModalOpen(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Class Modal */}
      {isDuplicateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b0f19] text-slate-100 rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-800">
            <h3 className="text-base font-bold text-white">
              Sao chép lớp {isDuplicateOpen.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Nhân bản cấu trúc môn học, phòng học sang niên khóa mới
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Năm học đích
                </label>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  className="w-full px-3 py-2 bg-[#060910] border border-slate-800 rounded-lg outline-none text-slate-200"
                >
                  <option value="2026 - 2027">Năm học 2026 - 2027</option>
                  <option value="2027 - 2028">Năm học 2027 - 2028</option>
                </select>
              </div>

              <div className="p-2.5 bg-amber-950/40 border border-amber-800/60 rounded-lg text-[11px] text-amber-300">
                Lưu ý: Lớp mới được tạo sẽ kế thừa cấu hình môn học và phòng học, danh sách học sinh ban đầu sẽ để trống để import khóa mới.
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  onClick={() => setIsDuplicateOpen(null)}
                  className="px-3 py-1.5 border border-slate-800 rounded-lg text-slate-300 hover:bg-slate-800 font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDuplicate}
                  className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg font-bold"
                >
                  Xác nhận sao chép
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Full-Featured Edit Class Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0b0f19] text-slate-100 rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-800 my-8 animate-in fade-in flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md"
                  style={{ backgroundColor: editClassForm.color || '#2563EB' }}
                >
                  {editClassForm.name ? editClassForm.name.slice(0, 2).toUpperCase() : 'LH'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      Chỉnh sửa lớp học: <span className="text-cyan-400">{isEditModalOpen.name}</span>
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-mono">
                      {isEditModalOpen.joinCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Quản lý thông tin chung, học sinh ({editStudents.length}), lịch giảng dạy và thiết lập nâng cao
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentClassId(isEditModalOpen.id);
                    setIsEditModalOpen(null);
                    navigate(`/teacher/classes/${isEditModalOpen.id}`);
                  }}
                  className="hidden sm:flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 transition"
                  title="Mở chi tiết lớp học"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Vào trang lớp
                </button>
                <button
                  onClick={() => setIsEditModalOpen(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex items-center gap-2 pt-3 pb-3 border-b border-slate-800/80 shrink-0 overflow-x-auto">
              {[
                { id: 'info', label: 'Thông tin chung', icon: Edit },
                { id: 'students', label: `Danh sách học sinh (${editStudents.length})`, icon: Users },
                { id: 'schedule', label: `Thời khóa biểu (${editSchedules.length})`, icon: Calendar },
                { id: 'settings', label: 'Cài đặt & Tiện ích', icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = editActiveTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setEditActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents Scrollable */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {/* TAB 1: THÔNG TIN LỚP HỌC */}
              {editActiveTab === 'info' && (
                <form id="editClassForm" onSubmit={handleSaveEditModal} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1.5">
                        Tên lớp học <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: 10A1, 10A2..."
                        value={editClassForm.name}
                        onChange={(e) =>
                          setEditClassForm({ ...editClassForm, name: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#060910] border border-slate-800 rounded-lg outline-none focus:border-cyan-500 text-slate-100 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1.5">
                        Mã tham gia lớp
                      </label>
                      <input
                        type="text"
                        value={editClassForm.joinCode}
                        onChange={(e) =>
                          setEditClassForm({ ...editClassForm, joinCode: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#060910] border border-slate-800 rounded-lg outline-none focus:border-cyan-500 text-cyan-300 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1.5">Khối *</label>
                      <select
                        value={editClassForm.gradeLevelId}
                        onChange={(e) =>
                          setEditClassForm({ ...editClassForm, gradeLevelId: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#060910] border border-slate-800 rounded-lg outline-none text-slate-200"
                      >
                        <option value="gr_10">Khối 10</option>
                        <option value="gr_11">Khối 11</option>
                        <option value="gr_12">Khối 12</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1.5">Môn học phụ trách</label>
                      <input
                        type="text"
                        placeholder="Toán học, Vật lý..."
                        value={editClassForm.subjectName}
                        onChange={(e) =>
                          setEditClassForm({ ...editClassForm, subjectName: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#060910] border border-slate-800 rounded-lg outline-none text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1.5">Phòng học</label>
                      <input
                        type="text"
                        placeholder="Phòng 301 - Tòa A"
                        value={editClassForm.room}
                        onChange={(e) =>
                          setEditClassForm({ ...editClassForm, room: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#060910] border border-slate-800 rounded-lg outline-none text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1.5">Giáo viên chủ nhiệm / Phụ trách</label>
                      <input
                        type="text"
                        value={editClassForm.teacherName}
                        onChange={(e) =>
                          setEditClassForm({ ...editClassForm, teacherName: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#060910] border border-slate-800 rounded-lg outline-none text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1.5">Năm học</label>
                      <input
                        type="text"
                        value={editClassForm.academicYear}
                        onChange={(e) =>
                          setEditClassForm({ ...editClassForm, academicYear: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#060910] border border-slate-800 rounded-lg outline-none text-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1.5">Trạng thái giảng dạy</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setEditClassForm({ ...editClassForm, status: 'active' })}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                          editClassForm.status === 'active'
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                            : 'bg-[#060910] border-slate-800 text-slate-400'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs">Đang hoạt động / Giảng dạy</div>
                          <div className="text-[11px] opacity-80 mt-0.5">Hiện diện trên toàn bộ bảng điểm, TKB và sổ điểm danh</div>
                        </div>
                        {editClassForm.status === 'active' && <Check className="w-4 h-4 text-emerald-400" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditClassForm({ ...editClassForm, status: 'archived' })}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                          editClassForm.status === 'archived'
                            ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                            : 'bg-[#060910] border-slate-800 text-slate-400'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs">Lưu trữ lớp</div>
                          <div className="text-[11px] opacity-80 mt-0.5">Ẩn khỏi danh sách chính, bảo lưu nguyên vẹn dữ liệu điểm số</div>
                        </div>
                        {editClassForm.status === 'archived' && <Check className="w-4 h-4 text-amber-400" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1.5">Mô tả & Ghi chú lớp học</label>
                    <textarea
                      rows={2}
                      placeholder="Mô tả mục tiêu lớp học, giáo án hoặc lưu ý giáo viên..."
                      value={editClassForm.description}
                      onChange={(e) =>
                        setEditClassForm({ ...editClassForm, description: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#060910] border border-slate-800 rounded-lg outline-none text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1.5">Màu nhận diện lớp học</label>
                    <div className="flex items-center gap-3 flex-wrap">
                      {['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0284C7', '#ec4899', '#14b8a6'].map(
                        (col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setEditClassForm({ ...editClassForm, color: col })}
                            style={{ backgroundColor: col }}
                            className={`w-7 h-7 rounded-full border-2 transition ${
                              editClassForm.color === col
                                ? 'border-white scale-110 shadow-lg ring-2 ring-cyan-400'
                                : 'border-transparent opacity-80 hover:opacity-100'
                            }`}
                          />
                        )
                      )}
                    </div>
                  </div>
                </form>
              )}

              {/* TAB 2: QUẢN LÝ HỌC SINH */}
              {editActiveTab === 'students' && (
                <div className="space-y-4">
                  {/* Add Student Quick Form */}
                  <form onSubmit={handleAddStudentInModal} className="p-3.5 bg-[#060910] rounded-xl border border-slate-800 flex flex-col md:flex-row gap-2.5 items-center justify-between">
                    <div className="flex-1 w-full flex items-center gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Nhập họ và tên học sinh mới..."
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-[#0b0f19] border border-slate-700 rounded-lg text-xs outline-none focus:border-cyan-500 text-slate-100"
                      />
                      <select
                        value={newStudentGender}
                        onChange={(e) => setNewStudentGender(e.target.value as any)}
                        className="px-2.5 py-1.5 bg-[#0b0f19] border border-slate-700 rounded-lg text-xs outline-none text-slate-200 font-semibold"
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                      </select>
                      <select
                        value={newStudentGroup}
                        onChange={(e) => setNewStudentGroup(e.target.value)}
                        className="px-2.5 py-1.5 bg-[#0b0f19] border border-slate-700 rounded-lg text-xs outline-none text-slate-200 font-semibold"
                      >
                        <option value="Tổ 1">Tổ 1</option>
                        <option value="Tổ 2">Tổ 2</option>
                        <option value="Tổ 3">Tổ 3</option>
                        <option value="Tổ 4">Tổ 4</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full md:w-auto flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg transition"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Thêm HS
                    </button>
                  </form>

                  {/* Search Student in Modal */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Tìm học sinh theo tên, mã HS..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-[#060910] border border-slate-800 rounded-lg text-xs outline-none text-slate-200"
                      />
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      Tổng: <span className="text-cyan-400 font-bold">{editStudents.length}</span> em
                    </span>
                  </div>

                  {/* Students Table in Modal */}
                  <div className="bg-[#060910] rounded-xl border border-slate-800 overflow-hidden max-h-72 overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#0a0e1a] text-slate-400 font-semibold border-b border-slate-800 sticky top-0">
                        <tr>
                          <th className="py-2 px-3">STT</th>
                          <th className="py-2 px-3">Mã HS</th>
                          <th className="py-2 px-3">Họ và tên</th>
                          <th className="py-2 px-3">Giới tính</th>
                          <th className="py-2 px-3">Tổ</th>
                          <th className="py-2 px-3 text-center">GPA</th>
                          <th className="py-2 px-3 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 text-slate-300">
                        {editStudents
                          .filter((s) => s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) || s.code.toLowerCase().includes(studentSearch.toLowerCase()))
                          .map((stu, i) => (
                            <tr key={stu.id} className="hover:bg-slate-900/60 transition">
                              <td className="py-2 px-3 text-slate-500 font-mono">{i + 1}</td>
                              <td className="py-2 px-3 font-mono text-cyan-400">{stu.code}</td>
                              <td className="py-2 px-3 font-bold text-white">{stu.fullName}</td>
                              <td className="py-2 px-3 text-slate-400">{stu.gender === 'female' ? 'Nữ' : 'Nam'}</td>
                              <td className="py-2 px-3 text-slate-300">{stu.group}</td>
                              <td className="py-2 px-3 text-center font-bold text-emerald-400">{stu.gpa}</td>
                              <td className="py-2 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStudentInModal(stu.id)}
                                  className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition"
                                  title="Xóa học sinh khỏi lớp"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: THỜI KHÓA BIỂU */}
              {editActiveTab === 'schedule' && (
                <div className="space-y-3">
                  <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl text-xs text-cyan-300 flex items-center justify-between">
                    <span>Thời khóa biểu lớp {isEditModalOpen.name} ({editSchedules.length} tiết đã xếp)</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditModalOpen(null);
                        navigate('/teacher/schedule');
                      }}
                      className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded text-[11px] transition"
                    >
                      Mở trang TKB toàn màn hình
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {editSchedules.map((sc) => (
                      <div key={sc.id} className="p-2.5 bg-[#060910] border border-slate-800 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-cyan-300">Thứ {sc.dayOfWeek} · Tiết {sc.period}</span>
                          <span className="text-[10px] text-amber-300 font-mono">{sc.startTime} - {sc.endTime}</span>
                        </div>
                        <div className="font-semibold text-white">{sc.subject}</div>
                        <div className="text-[11px] text-slate-400">{sc.teacherName} · {sc.room}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: CÀI ĐẶT & TIỆN ÍCH */}
              {editActiveTab === 'settings' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-[#060910] border border-slate-800 rounded-xl space-y-3">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-cyan-400" /> Mã QR và liên kết vào lớp
                    </h4>
                    <p className="text-slate-400 text-xs">
                      Học sinh và phụ huynh có thể dùng camera điện thoại quét mã QR này để tự động tham gia lớp học {isEditModalOpen.name}.
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="p-2 bg-white rounded-lg">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                            `https://smartedu.edu.vn/join/${editClassForm.joinCode}`
                          )}`}
                          alt="QR"
                          className="w-24 h-24"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="text-slate-400">Mã vào lớp:</div>
                        <div className="font-mono text-base font-bold text-cyan-300">{editClassForm.joinCode}</div>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(editClassForm.joinCode)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold text-xs flex items-center gap-1.5 transition"
                        >
                          <Copy className="w-3.5 h-3.5" /> Sao chép mã
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#060910] border border-rose-950/60 rounded-xl space-y-2">
                    <h4 className="font-bold text-rose-400 text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Vùng quản trị rủi ro
                    </h4>
                    <p className="text-slate-400 text-xs">
                      Xóa lớp học sẽ gỡ bỏ liên kết học sinh và thời khóa biểu tương ứng. Hãy cẩn trọng khi thực hiện.
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditModalOpen(null);
                          handleDelete(isEditModalOpen);
                        }}
                        className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-600/40 rounded-lg font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa vĩnh viễn lớp học này
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 shrink-0">
              <span className="text-xs text-slate-400">
                Lớp học: <span className="text-white font-bold">{editClassForm.name}</span> · Sĩ số: <span className="text-cyan-400 font-bold">{editStudents.length}</span> HS
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(null)}
                  className="px-3.5 py-2 border border-slate-800 rounded-lg text-slate-300 hover:bg-slate-800 font-semibold text-xs transition"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSaveEditModal(e)}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg font-bold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
