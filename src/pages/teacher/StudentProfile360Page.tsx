import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  MessageSquare,
  History,
  ArrowLeft,
  Edit,
  TrendingUp,
  Clock,
  Send,
} from 'lucide-react';
import { storage } from '../../services/storage';

export const StudentProfile360Page: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const student = storage.getStudentById(id || '');

  const [activeTab, setActiveTab] = useState<
    'overview' | 'grades' | 'attendance' | 'assignments' | 'behavior' | 'alerts' | 'parent' | 'history'
  >('overview');

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: student?.fullName || '',
    phone: student?.phone || '',
    address: student?.address || '',
    parentName: student?.parentName || '',
    parentPhone: student?.parentPhone || '',
    status: student?.status || 'studying',
  });

  if (!student) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h2 className="text-base font-bold text-slate-800">Không tìm thấy hồ sơ học sinh</h2>
        <button
          onClick={() => navigate('/teacher/students')}
          className="mt-3 text-xs text-blue-600 font-semibold"
        >
          Quay lại danh sách học sinh
        </button>
      </div>
    );
  }

  const grades = storage.getGrades(undefined, student.id);
  const attendanceList = storage.getAllAttendance().filter((a) => a.studentId === student.id);
  const behaviors = storage.getBehaviors(student.id);
  const badges = storage.getRewardBadges(student.id);
  const alerts = storage.getSmartAlerts().filter((a) => a.studentId === student.id);
  const parentMessages = storage.getParentMessages().filter((m) => m.studentName === student.fullName);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...student,
      fullName: editForm.fullName,
      phone: editForm.phone,
      address: editForm.address,
      parentName: editForm.parentName,
      parentPhone: editForm.parentPhone,
      status: editForm.status as any,
    };
    storage.saveStudent(updated);
    storage.addAuditLog({
      userId: 'u_teacher_1',
      userName: 'Thầy Nguyễn Văn An',
      userRole: 'teacher',
      action: 'Cập nhật hồ sơ học sinh',
      module: 'Học sinh',
      details: `Cập nhật thông tin em ${updated.fullName} (${updated.code})`,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách học sinh
      </button>

      {/* 360° Profile Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={
                student.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
              }
              alt={student.fullName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">{student.fullName}</h1>
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {student.code}
                </span>
                <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                  {student.status === 'studying' ? 'Đang học' : 'Bảo lưu'}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                <span>{student.className}</span>
                <span>·</span>
                <span>{student.group}</span>
                <span>·</span>
                <span>STT: {student.orderNumber}</span>
                <span>·</span>
                <span>Giới tính: {student.gender === 'female' ? 'Nữ' : 'Nam'}</span>
                <span>·</span>
                <span>Sinh ngày: {student.birthDate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <Edit className="w-3.5 h-3.5" /> Chỉnh sửa hồ sơ
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
            >
              In học bạ 360°
            </button>
          </div>
        </div>

        {/* 4 Core 360 KPI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 font-medium">Điểm trung bình (GPA)</span>
            <div className="text-2xl font-black text-blue-600 mt-0.5">{student.gpa} / 10</div>
            <span className="text-[10px] text-slate-400">Xếp loại: Giỏi</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 font-medium">Tỷ lệ chuyên cần</span>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">
              {student.attendanceRate}%
            </div>
            <span className="text-[10px] text-slate-400">Có mặt đủ buổi</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 font-medium">Hoàn thành bài tập</span>
            <div className="text-2xl font-black text-purple-600 mt-0.5">
              {student.submittedAssignmentsCount} / {student.totalAssignmentsCount}
            </div>
            <span className="text-[10px] text-slate-400">Đạt 93.3% nộp đúng hạn</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 font-medium">Điểm rèn luyện / Khen thưởng</span>
            <div className="text-2xl font-black text-amber-500 mt-0.5">
              +{student.rewardPoints} đ
            </div>
            <span className="text-[10px] text-slate-400">{badges.length} huy hiệu vinh danh</span>
          </div>
        </div>
      </div>

      {/* Edit Form Modal Drawer */}
      {isEditing && (
        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-lg animate-in fade-in">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Cập nhật hồ sơ học sinh</h3>
          <form onSubmit={handleSaveEdit} className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Họ và tên</label>
              <input
                type="text"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Số điện thoại HS</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Trạng thái học tập</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                className="w-full p-2 border border-slate-200 rounded-lg outline-none"
              >
                <option value="studying">Đang học</option>
                <option value="transferred">Đã chuyển trường</option>
                <option value="reserved">Bảo lưu</option>
                <option value="suspended">Đình chỉ</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Họ tên Phụ huynh</label>
              <input
                type="text"
                value={editForm.parentName}
                onChange={(e) => setEditForm({ ...editForm, parentName: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Số điện thoại PH</label>
              <input
                type="text"
                value={editForm.parentPhone}
                onChange={(e) => setEditForm({ ...editForm, parentPhone: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Địa chỉ cư trú</label>
              <input
                type="text"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg outline-none"
              />
            </div>

            <div className="col-span-full flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs navigation for 360 dossier */}
      <div className="border-b border-slate-200 bg-white px-3 rounded-t-xl overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {[
            { id: 'overview', label: 'Tổng quan hồ sơ', icon: User },
            { id: 'grades', label: 'Bảng điểm chi tiết', icon: ClipboardList },
            { id: 'attendance', label: 'Lịch sử chuyên cần', icon: Clock },
            { id: 'behavior', label: 'Hành vi & Thi đua', icon: Award },
            { id: 'alerts', label: `Cảnh báo học tập (${alerts.length})`, icon: AlertTriangle },
            { id: 'parent', label: 'Phụ huynh & Liên lạc', icon: MessageSquare },
            { id: 'history', label: 'Lịch sử học tập', icon: History },
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

      {/* SUB-TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Thông tin cá nhân & Liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Email:</span>
                <span className="font-bold text-slate-800">{student.email || 'Chưa cấp email'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Điện thoại HS:</span>
                <span className="font-bold text-slate-800">{student.phone || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Địa chỉ:</span>
                <span className="font-bold text-slate-800">{student.address || 'Hà Nội'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Thông tin Gia đình & Người giám hộ</h3>
            <div className="space-y-3">
              <div>
                <span className="text-slate-400 block mb-0.5">Họ và tên Phụ huynh:</span>
                <span className="font-bold text-slate-800 text-sm">{student.parentName || 'Lê Tiến Thành'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Mối quan hệ:</span>
                <span className="font-bold text-slate-800">{student.parentRelation || 'Bố'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Số điện thoại liên hệ khẩn cấp:</span>
                <span className="font-mono font-bold text-blue-600">{student.parentPhone || '0978901234'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GRADES */}
      {activeTab === 'grades' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Điểm số các đầu điểm (Môn Toán & Môn học khác)</h3>
            <span className="text-xs text-blue-600 font-bold">GPA hiện tại: {student.gpa}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Loại điểm</th>
                  <th className="py-2.5 px-3">Môn</th>
                  <th className="py-2.5 px-3 text-center">Điểm số</th>
                  <th className="py-2.5 px-3 text-center">Hệ số</th>
                  <th className="py-2.5 px-3">Ghi chú của giáo viên</th>
                  <th className="py-2.5 px-3">Ngày nhập</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grades.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-800">{g.typeName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{g.subject}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-blue-600 font-mono text-sm">
                      {g.score}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">x{g.weight}</td>
                    <td className="py-2.5 px-3 text-slate-500">{g.note || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{g.updatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Nhật ký chuyên cần của học sinh</h3>
            <span className="text-xs font-bold text-emerald-600">Đạt {student.attendanceRate}%</span>
          </div>

          <div className="space-y-2 text-xs">
            {attendanceList.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50"
              >
                <div>
                  <div className="font-bold text-slate-800">Ngày {a.date} ({a.period})</div>
                  {a.reason && <div className="text-[11px] text-slate-500 mt-0.5">Lý do: {a.reason}</div>}
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    a.status === 'present'
                      ? 'bg-emerald-100 text-emerald-800'
                      : a.status === 'excused'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {a.status === 'present' ? 'Có mặt' : a.status === 'excused' ? 'Có phép' : 'Nghỉ'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: BEHAVIOR */}
      {activeTab === 'behavior' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-5">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3">Huy hiệu thi đua đạt được</h3>
            <div className="flex flex-wrap gap-3">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs"
                >
                  <Award className="w-5 h-5 text-amber-500" />
                  <div>
                    <div className="font-bold text-amber-900">{b.badgeName}</div>
                    <div className="text-[10px] text-amber-700">{b.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3">Nhật ký nhận xét & ghi nhận hành vi</h3>
            <div className="space-y-2.5 text-xs">
              {behaviors.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-800">{b.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{b.content}</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Giáo viên ghi: {b.teacherName} · Ngày {b.date}
                    </div>
                  </div>
                  <span
                    className={`font-black text-sm ${
                      b.points > 0 ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {b.points > 0 ? `+${b.points}` : b.points} đ
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: ALERTS */}
      {activeTab === 'alerts' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Cảnh báo thông minh về tiến độ & kỷ luật</h3>
          {alerts.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              Học sinh không có cảnh báo nguy cơ nào. Rất tốt!
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alt) => (
                <div key={alt.id} className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs">
                  <div className="flex items-center justify-between font-bold text-red-900">
                    <span>{alt.title}</span>
                    <span className="uppercase text-[10px] bg-red-200 px-2 py-0.5 rounded">
                      {alt.severity}
                    </span>
                  </div>
                  <p className="text-red-800 mt-1">{alt.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 6: PARENT */}
      {activeTab === 'parent' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Kênh liên lạc trực tiếp Phụ huynh - Giáo viên</h3>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            {parentMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-xl max-w-md ${
                  msg.senderRole === 'teacher'
                    ? 'ml-auto bg-blue-600 text-white'
                    : 'mr-auto bg-white border border-slate-200 text-slate-800'
                }`}
              >
                <div className="text-[10px] opacity-75 font-semibold mb-0.5">
                  {msg.senderRole === 'teacher' ? 'Thầy Nguyễn Văn An' : msg.parentName}
                </div>
                <div>{msg.message}</div>
                <div className="text-[9px] opacity-60 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 7: HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">Lịch sử học tập & Chuyển giao</h3>
          <ul className="space-y-3 relative border-l border-slate-200 ml-3 pl-4">
            <li className="relative">
              <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600" />
              <div className="font-bold text-slate-800">Nhập học lớp 10A1 (Năm học 2025 - 2026)</div>
              <p className="text-slate-400 text-[11px]">Ngày 05/09/2025 · Trúng tuyển đợt 1</p>
            </li>
            <li className="relative">
              <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <div className="font-bold text-slate-800">Được bầu làm Tổ phó Tổ 1</div>
              <p className="text-slate-400 text-[11px]">Ngày 15/09/2025 · Đại hội chi đoàn lớp</p>
            </li>
            <li className="relative">
              <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className="font-bold text-slate-800">Đạt danh hiệu "Ngôi sao Chăm chỉ" tháng 9</div>
              <p className="text-slate-400 text-[11px]">Ngày 30/09/2025 · Tuyên dương toàn trường</p>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
