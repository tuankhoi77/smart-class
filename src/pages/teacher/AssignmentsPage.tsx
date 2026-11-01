import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  BellRing,
  Edit,
  Trash2,
  Paperclip,
  Check,
  Send,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { useClass } from '../../contexts/ClassContext';
import { storage } from '../../services/storage';
import { Assignment, Submission, AssignmentStatus, SubmissionStatus } from '../../types';

export const AssignmentsPage: React.FC = () => {
  const { classes, currentClassId } = useClass();

  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'closed' | 'draft'>('all');
  const [selectedClassId, setSelectedClassId] = useState(currentClassId || 'cls_10a1');

  const [assignments, setAssignments] = useState<Assignment[]>(() =>
    storage.getAssignments(selectedClassId)
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [gradingAssignment, setGradingAssignment] = useState<Assignment | null>(null);
  const [submissionsList, setSubmissionsList] = useState<Submission[]>([]);
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);

  const [gradeInput, setGradeInput] = useState<number>(9);
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [gradeStatusInput, setGradeStatusInput] = useState<SubmissionStatus>('graded');

  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Form for new assignment
  const [newForm, setNewForm] = useState({
    title: '',
    subject: 'Toán học',
    description: '',
    dueDate: '2026-10-12T23:59',
    maxScore: 10,
    status: 'published' as AssignmentStatus,
    targetType: 'class' as 'class' | 'group' | 'student',
  });

  const handleClassChange = (newId: string) => {
    setSelectedClassId(newId);
    setAssignments(storage.getAssignments(newId));
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClass = storage.getClassById(selectedClassId);

    const newAssignment: Assignment = {
      id: 'asg_' + Date.now(),
      classId: selectedClassId,
      className: targetClass?.name || '10A1',
      subject: newForm.subject,
      title: newForm.title,
      description: newForm.description,
      assignedDate: '2026-10-04',
      dueDate: newForm.dueDate,
      maxScore: Number(newForm.maxScore),
      status: newForm.status,
      targetType: newForm.targetType,
      submissionsCount: 0,
      gradedCount: 0,
    };

    storage.saveAssignment(newAssignment);
    storage.addAuditLog({
      userId: 'u_teacher_1',
      userName: 'Thầy Nguyễn Văn An',
      userRole: 'teacher',
      action: 'Giao bài tập mới',
      module: 'Bài tập',
      details: `Giao bài "${newAssignment.title}" cho lớp ${newAssignment.className}`,
    });

    setAssignments(storage.getAssignments(selectedClassId));
    setIsCreateModalOpen(false);
    setNewForm({
      title: '',
      subject: 'Toán học',
      description: '',
      dueDate: '2026-10-12T23:59',
      maxScore: 10,
      status: 'published',
      targetType: 'class',
    });
  };

  const handleOpenGrading = (asg: Assignment) => {
    setGradingAssignment(asg);
    const subs = storage.getSubmissions(asg.id);

    // If no submissions exist yet for some students, generate dummy submissions for full test experience
    const students = storage.getStudentsByClass(asg.classId);
    if (subs.length === 0 && students.length > 0) {
      students.slice(0, 3).forEach((s, idx) => {
        const generated: Submission = {
          id: `subm_${asg.id}_${s.id}`,
          assignmentId: asg.id,
          studentId: s.id,
          studentName: s.fullName,
          submittedAt: '2026-10-03T20:00:00Z',
          content: `Thưa thầy em nộp bài tập ạ. Em đã làm xong các bài 1, 2, 3 và kiểm tra lại kết quả cẩn thận.`,
          attachments: [{ name: `BaiLam_${s.fullName.replace(/\s+/g, '')}.pdf`, url: '#', size: '1.4 MB' }],
          score: idx === 0 ? 9.5 : null,
          feedback: idx === 0 ? 'Bài làm rất tốt, lập luận sạch đẹp!' : '',
          status: idx === 0 ? 'graded' : 'submitted',
        };
        storage.saveSubmission(generated);
      });
    }

    const reloaded = storage.getSubmissions(asg.id);
    setSubmissionsList(reloaded);
    setActiveSubmission(reloaded[0] || null);
    if (reloaded[0]) {
      setGradeInput(reloaded[0].score ?? 9);
      setFeedbackInput(reloaded[0].feedback || '');
      setGradeStatusInput(reloaded[0].status || 'graded');
    }
  };

  const handleSaveGrade = () => {
    if (!activeSubmission) return;

    const updated: Submission = {
      ...activeSubmission,
      score: gradeInput,
      feedback: feedbackInput,
      status: gradeStatusInput,
      gradedAt: new Date().toISOString(),
    };

    storage.saveSubmission(updated);
    storage.addAuditLog({
      userId: 'u_teacher_1',
      userName: 'Thầy Nguyễn Văn An',
      userRole: 'teacher',
      action: 'Chấm điểm bài nộp',
      module: 'Bài tập',
      details: `Chấm ${updated.score} điểm cho học sinh ${updated.studentName}`,
    });

    if (gradingAssignment) {
      const subs = storage.getSubmissions(gradingAssignment.id);
      setSubmissionsList(subs);
      setActiveSubmission(updated);
      setAssignments(storage.getAssignments(selectedClassId));
    }
  };

  const handleSendReminder = (asg: Assignment) => {
    storage.addAuditLog({
      userId: 'u_teacher_1',
      userName: 'Thầy Nguyễn Văn An',
      userRole: 'teacher',
      action: 'Gửi nhắc nhở nộp bài',
      module: 'Bài tập',
      details: `Gửi tin nhắn nhắc học sinh chưa nộp bài "${asg.title}"`,
    });

    setReminderToast(`Đã gửi thông báo nhắc nhở nộp bài tập "${asg.title}" đến các học sinh chưa nộp!`);
    setTimeout(() => setReminderToast(null), 3000);
  };

  const filteredAssignments = assignments.filter((a) => {
    if (activeTab === 'published') return a.status === 'published';
    if (activeTab === 'closed') return a.status === 'closed';
    if (activeTab === 'draft') return a.status === 'draft';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản lý Bài tập & Chấm điểm</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Giao bài tập về nhà, thu bài trực tuyến, chấm điểm và gửi nhận xét cá nhân hóa
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
        >
          <Plus className="w-4 h-4" /> Giao bài tập mới
        </button>
      </div>

      {reminderToast && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <BellRing className="w-4 h-4 text-blue-600" />
          {reminderToast}
        </div>
      )}

      {/* Filter and Tab Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {[
            { id: 'all', label: 'Tất cả bài tập' },
            { id: 'published', label: 'Đang giao' },
            { id: 'closed', label: 'Hết hạn' },
            { id: 'draft', label: 'Bản nháp' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-semibold text-slate-500">Lớp:</label>
          <select
            value={selectedClassId}
            onChange={(e) => handleClassChange(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400 text-xs">
            Chưa có bài tập nào trong mục này. Bấm "+ Giao bài tập mới" để bắt đầu.
          </div>
        ) : (
          filteredAssignments.map((asg) => (
            <div
              key={asg.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      asg.status === 'published'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : asg.status === 'closed'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {asg.status === 'published'
                      ? 'Đang giao'
                      : asg.status === 'closed'
                      ? 'Đã kết thúc'
                      : 'Bản nháp'}
                  </span>
                  <span className="text-xs font-bold text-slate-400 font-mono">{asg.subject}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500 font-medium">{asg.className}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-1">{asg.title}</h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{asg.description}</p>

                <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Hạn nộp: {new Date(asg.dueDate).toLocaleString('vi-VN')}
                  </span>
                  <span>Thang điểm: {asg.maxScore}</span>
                </div>
              </div>

              {/* Progress and actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left sm:text-right pr-4">
                  <div className="text-sm font-black text-blue-600">
                    {asg.submissionsCount || 0} bài đã nộp
                  </div>
                  <div className="text-xs text-slate-400">
                    Đã chấm: <strong className="text-slate-700">{asg.gradedCount || 0}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendReminder(asg)}
                    title="Nhắc nhở học sinh chưa nộp bài"
                    className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
                  >
                    <BellRing className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenGrading(asg)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    Chấm bài ({asg.submissionsCount || 0})
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Assignment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3">Tạo bài tập mới</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiêu đề bài tập *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bài tập tuần 6 - Hàm số bậc nhất và bậc hai"
                  value={newForm.title}
                  onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Môn học</label>
                  <input
                    type="text"
                    value={newForm.subject}
                    onChange={(e) => setNewForm({ ...newForm, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Thang điểm tối đa</label>
                  <input
                    type="number"
                    value={newForm.maxScore}
                    onChange={(e) => setNewForm({ ...newForm, maxScore: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hạn nộp bài *</label>
                <input
                  type="datetime-local"
                  required
                  value={newForm.dueDate}
                  onChange={(e) => setNewForm({ ...newForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mô tả & Hướng dẫn làm bài</label>
                <textarea
                  rows={3}
                  placeholder="Yêu cầu học sinh làm các bài tập trang bao nhiêu, cách thức nộp file..."
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phạm vi giao</label>
                  <select
                    value={newForm.targetType}
                    onChange={(e) => setNewForm({ ...newForm, targetType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  >
                    <option value="class">Cả lớp</option>
                    <option value="group">Theo tổ</option>
                    <option value="student">Cá nhân học sinh</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Trạng thái phát hành</label>
                  <select
                    value={newForm.status}
                    onChange={(e) => setNewForm({ ...newForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  >
                    <option value="published">Giao ngay</option>
                    <option value="draft">Lưu bản nháp</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Tạo bài tập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {gradingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Chấm bài: {gradingAssignment.title}
                </h3>
                <span className="text-xs text-slate-400">
                  {gradingAssignment.className} · Thang điểm {gradingAssignment.maxScore}
                </span>
              </div>
              <button
                onClick={() => setGradingAssignment(null)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200"
              >
                Đóng
              </button>
            </div>

            {/* Split Pane: Submissions List (Left) & Grading Panel (Right) */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Submissions list */}
              <div className="w-1/3 border-r border-slate-200 overflow-y-auto divide-y divide-slate-100">
                {submissionsList.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Chưa có học sinh nào nộp bài.
                  </div>
                ) : (
                  submissionsList.map((sub) => {
                    const isSelected = activeSubmission?.id === sub.id;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => {
                          setActiveSubmission(sub);
                          setGradeInput(sub.score ?? 9);
                          setFeedbackInput(sub.feedback || '');
                          setGradeStatusInput(sub.status);
                        }}
                        className={`p-3 cursor-pointer text-xs transition ${
                          isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span>{sub.studentName}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              sub.status === 'graded'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {sub.status === 'graded' ? `${sub.score} đ` : 'Chưa chấm'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Nộp lúc: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString('vi-VN') : 'Đang làm'}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Panel: Content & Grading Controls */}
              <div className="flex-1 p-6 overflow-y-auto space-y-5 text-xs">
                {activeSubmission ? (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Bài làm của em: {activeSubmission.studentName}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          Nộp ngày: {new Date(activeSubmission.submittedAt || '').toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                        {activeSubmission.status === 'graded' ? 'Đã chấm điểm' : 'Chờ chấm'}
                      </span>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nội dung bài làm:</label>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {activeSubmission.content || 'Học sinh chỉ nộp file đính kèm bên dưới.'}
                      </div>
                    </div>

                    {activeSubmission.attachments && activeSubmission.attachments.length > 0 && (
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Tệp đính kèm:</label>
                        <div className="flex items-center gap-2">
                          {activeSubmission.attachments.map((att, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 p-2 bg-slate-100 rounded-lg text-slate-700 font-medium"
                            >
                              <Paperclip className="w-3.5 h-3.5" />
                              <span>{att.name}</span>
                              <span className="text-slate-400 text-[10px]">({att.size})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grading Form */}
                    <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-800 mb-1">
                            Điểm số (Thang {gradingAssignment.maxScore}):
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max={gradingAssignment.maxScore}
                            value={gradeInput}
                            onChange={(e) => setGradeInput(Number(e.target.value))}
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-sm text-blue-700 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-800 mb-1">Đánh giá kết quả:</label>
                          <select
                            value={gradeStatusInput}
                            onChange={(e) => setGradeStatusInput(e.target.value as any)}
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none font-semibold"
                          >
                            <option value="graded">Đạt yêu cầu (Đã chấm)</option>
                            <option value="resubmit">Yêu cầu làm lại</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Lời nhận xét của Thầy/Cô:
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Viết nhận xét chi tiết, khen ngợi điểm tốt và chỉ rõ chỗ cần khắc phục..."
                          value={feedbackInput}
                          onChange={(e) => setFeedbackInput(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-lg outline-none"
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleSaveGrade}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition"
                        >
                          <Check className="w-4 h-4" /> Lưu điểm & Trả bài cho học sinh
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16 text-slate-400">
                    Chọn một bài nộp ở danh sách bên trái để chấm điểm
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
