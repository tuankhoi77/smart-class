import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  Check,
  Paperclip,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { storage } from '../../services/storage';
import { Assignment, Submission } from '../../types';

export const StudentAssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const student = storage.getStudentById(user?.studentId || 'stu_1') || storage.getStudents()[0];
  const assignments = storage.getAssignments(student.classId);

  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSaveSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment) return;

    const submission: Submission = {
      id: `subm_${submittingAssignment.id}_${student.id}`,
      assignmentId: submittingAssignment.id,
      studentId: student.id,
      studentName: student.fullName,
      submittedAt: new Date().toISOString(),
      content: submissionContent,
      attachments: [{ name: 'BaiLam_HocSinh.pdf', url: '#', size: '1.2 MB' }],
      score: null,
      status: 'submitted',
    };

    storage.saveSubmission(submission);
    storage.addAuditLog({
      userId: user?.id || 'u_student_1',
      userName: student.fullName,
      userRole: 'student',
      action: 'Nộp bài tập về nhà',
      module: 'Bài tập',
      details: `Học sinh nộp bài "${submittingAssignment.title}"`,
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setSubmittingAssignment(null);
      setSubmissionContent('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Bài tập về nhà của em</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Theo dõi tiến độ làm bài, nộp bài trực tuyến và xem điểm số, lời nhận xét từ thầy cô
        </p>
      </div>

      <div className="space-y-4">
        {assignments.map((asg) => {
          const subs = storage.getSubmissions(asg.id);
          const mySub = subs.find((s) => s.studentId === student.id);
          const isSubmitted = !!mySub && mySub.status !== 'pending';

          return (
            <div
              key={asg.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
                    {asg.subject}
                  </span>
                  <span className="text-xs text-slate-400">· Hạn nộp: {new Date(asg.dueDate).toLocaleString('vi-VN')}</span>
                </div>

                <div>
                  {mySub?.status === 'graded' ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                      Đã chấm: {mySub.score} / {asg.maxScore} điểm
                    </span>
                  ) : isSubmitted ? (
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                      Đã nộp bài (Chờ chấm)
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                      Chưa nộp bài
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{asg.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{asg.description}</p>
              </div>

              {/* Feedback if graded */}
              {mySub?.feedback && (
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900">
                  <strong className="block mb-0.5 text-blue-950 font-bold">Lời nhận xét của Thầy Cô:</strong>
                  {mySub.feedback}
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    setSubmittingAssignment(asg);
                    setSubmissionContent(mySub?.content || '');
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition shadow-xs ${
                    isSubmitted
                      ? 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isSubmitted ? 'Xem lại / Nộp bổ sung' : 'Làm & Nộp bài ngay'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submission Modal */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">
              Nộp bài: {submittingAssignment.title}
            </h3>

            {submittedSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-center rounded-xl space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-bold">Đã nộp bài tập thành công!</div>
                <p className="text-[11px] text-emerald-600">Thầy cô sẽ sớm xem và chấm điểm cho em.</p>
              </div>
            ) : (
              <form onSubmit={handleSaveSubmission} className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nội dung câu trả lời / Lời giải của em:
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Gõ trực tiếp bài làm hoặc tóm tắt nội dung giải bài tập vào đây..."
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl text-center">
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <span className="text-[11px] text-slate-500 block">
                    Đính kèm file PDF hoặc hình ảnh bài làm viết tay
                  </span>
                  <label className="mt-2 inline-block px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold cursor-pointer text-[10px]">
                    Chọn file đính kèm
                    <input type="file" className="hidden" />
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmittingAssignment(null)}
                    className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                  >
                    Xác nhận nộp bài
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
