import React, { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Clock,
  Shuffle,
  BarChart,
  CheckCircle2,
  Trash2,
  Edit,
  Sparkles,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { useClass } from '../../contexts/ClassContext';
import { storage } from '../../services/storage';
import { Quiz, QuizQuestion, QuestionType } from '../../types';

export const QuizzesPage: React.FC = () => {
  const { classes, currentClassId } = useClass();

  const [selectedClassId, setSelectedClassId] = useState(currentClassId || 'cls_10a1');
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => storage.getQuizzes(selectedClassId));

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedQuizDetails, setSelectedQuizDetails] = useState<Quiz | null>(null);

  const [newQuizForm, setNewQuizForm] = useState({
    title: '',
    subject: 'Toán học',
    description: '',
    durationMinutes: 15,
    totalPoints: 10,
    shuffleQuestions: true,
    shuffleAnswers: true,
    openTime: '2026-10-05T08:00',
    closeTime: '2026-10-08T23:59',
  });

  const [questionsList, setQuestionsList] = useState<QuizQuestion[]>([
    {
      id: 'q_' + Date.now() + '_1',
      type: 'single_choice',
      content: 'Tập hợp các số tự nhiên nhỏ hơn 5 là:',
      options: ['{0, 1, 2, 3, 4}', '{1, 2, 3, 4, 5}', '{0, 1, 2, 3, 4, 5}', '{1, 2, 3, 4}'],
      correctAnswer: 0,
      explanation: 'Số tự nhiên nhỏ hơn 5 gồm 0, 1, 2, 3, 4.',
      points: 2.5,
    },
    {
      id: 'q_' + Date.now() + '_2',
      type: 'true_false',
      content: 'Mọi số nguyên tố đều là số lẻ. Đúng hay Sai?',
      options: ['Đúng', 'Sai'],
      correctAnswer: 1, // Sai (vì có số 2 là số chẵn)
      explanation: 'Số 2 là số nguyên tố chẵn duy nhất.',
      points: 2.5,
    },
  ]);

  const handleClassChange = (newId: string) => {
    setSelectedClassId(newId);
    setQuizzes(storage.getQuizzes(newId));
  };

  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClass = storage.getClassById(selectedClassId);

    const newQuiz: Quiz = {
      id: 'quiz_' + Date.now(),
      classId: selectedClassId,
      className: targetClass?.name || '10A1',
      subject: newQuizForm.subject,
      title: newQuizForm.title,
      description: newQuizForm.description,
      durationMinutes: Number(newQuizForm.durationMinutes),
      openTime: newQuizForm.openTime,
      closeTime: newQuizForm.closeTime,
      shuffleQuestions: newQuizForm.shuffleQuestions,
      shuffleAnswers: newQuizForm.shuffleAnswers,
      totalPoints: Number(newQuizForm.totalPoints),
      status: 'active',
      questions: questionsList,
      attemptsCount: 0,
      averageScore: 0,
    };

    storage.saveQuiz(newQuiz);
    storage.addAuditLog({
      userId: 'u_teacher_1',
      userName: 'Thầy Nguyễn Văn An',
      userRole: 'teacher',
      action: 'Tạo đề kiểm tra trực tuyến',
      module: 'Kiểm tra',
      details: `Soạn đề "${newQuiz.title}" gồm ${newQuiz.questions.length} câu hỏi`,
    });

    setQuizzes(storage.getQuizzes(selectedClassId));
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Đề kiểm tra & Quiz trực tuyến</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Soạn đề thi từ ngân hàng câu hỏi, hỗ trợ tự động đảo câu/đáp án và tự động chấm điểm
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
        >
          <Plus className="w-4 h-4" /> Soạn đề kiểm tra mới
        </button>
      </div>

      {/* Class filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Lớp học:</label>
          <select
            value={selectedClassId}
            onChange={(e) => handleClassChange(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-400">Tổng số: {quizzes.length} đề kiểm tra</span>
      </div>

      {/* Quizzes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {quizzes.map((qz) => (
          <div
            key={qz.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {qz.subject} · {qz.className}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    qz.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {qz.status === 'active' ? 'Đang mở' : 'Đã đóng'}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-2">{qz.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{qz.description}</p>

              <div className="grid grid-cols-3 gap-2 mt-4 py-3 border-y border-slate-100 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Thời lượng</span>
                  <span className="font-bold text-slate-800">{qz.durationMinutes} phút</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Số câu hỏi</span>
                  <span className="font-bold text-slate-800">{qz.questions.length} câu</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Đã nộp bài</span>
                  <span className="font-bold text-blue-600">{qz.attemptsCount || 28} HS</span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between text-xs">
              <div className="text-[11px] text-slate-400">
                Điểm TB: <strong className="text-slate-800">{qz.averageScore || 8.2} / 10</strong>
              </div>

              <button
                onClick={() => setSelectedQuizDetails(qz)}
                className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Xem chi tiết đề <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Quiz Details Modal */}
      {selectedQuizDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedQuizDetails.title}</h3>
                <span className="text-xs text-slate-500">
                  {selectedQuizDetails.className} · {selectedQuizDetails.questions.length} câu hỏi · Thời lượng {selectedQuizDetails.durationMinutes} phút
                </span>
              </div>
              <button
                onClick={() => setSelectedQuizDetails(null)}
                className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {selectedQuizDetails.questions.map((q, idx) => (
                <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800">
                    Câu {idx + 1}: {q.content} ({q.points} điểm)
                  </div>
                  {q.options && (
                    <div className="space-y-1 pl-2">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-lg border ${
                            q.correctAnswer === oIdx
                              ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-800'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt} {q.correctAnswer === oIdx && '✓ (Đáp án đúng)'}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.explanation && (
                    <div className="p-2 bg-blue-50/60 rounded-lg text-[11px] text-blue-800 border border-blue-100">
                      <strong>Lời giải chi tiết:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Quiz Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Soạn đề kiểm tra mới</h3>
            <form onSubmit={handleCreateQuiz} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên đề kiểm tra *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Kiểm tra 15 phút - Mệnh đề toán học"
                  value={newQuizForm.title}
                  onChange={(e) => setNewQuizForm({ ...newQuizForm, title: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Môn học</label>
                  <input
                    type="text"
                    value={newQuizForm.subject}
                    onChange={(e) => setNewQuizForm({ ...newQuizForm, subject: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Thời lượng (phút)</label>
                  <input
                    type="number"
                    value={newQuizForm.durationMinutes}
                    onChange={(e) =>
                      setNewQuizForm({ ...newQuizForm, durationMinutes: Number(e.target.value) })
                    }
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 py-2 border-y border-slate-100">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newQuizForm.shuffleQuestions}
                    onChange={(e) =>
                      setNewQuizForm({ ...newQuizForm, shuffleQuestions: e.target.checked })
                    }
                    className="rounded text-blue-600"
                  />
                  <span>Đảo thứ tự câu hỏi</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newQuizForm.shuffleAnswers}
                    onChange={(e) =>
                      setNewQuizForm({ ...newQuizForm, shuffleAnswers: e.target.checked })
                    }
                    className="rounded text-blue-600"
                  />
                  <span>Đảo thứ tự đáp án</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Tạo đề thi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
