import React, { useState } from 'react';
import {
  X,
  Eye,
  CheckCircle2,
  FileText,
  Copy,
  Edit,
  Sparkles,
  BookOpen,
  Award,
  Layers,
  HelpCircle,
  Clock,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { BankQuestion, BankQuestionType } from '../../../types/questionBank';

interface QuestionDetailModalProps {
  question: BankQuestion | null;
  onClose: () => void;
  onEdit: (q: BankQuestion) => void;
  onDuplicate: (q: BankQuestion) => void;
}

const TYPE_CONFIG: Record<
  BankQuestionType,
  { label: string; color: string; bg: string; border: string }
> = {
  single_choice: { label: 'Trắc nghiệm 1 đáp án', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  multiple_choice: { label: 'Trắc nghiệm nhiều đáp án', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  true_false_group: { label: 'Đúng/Sai theo từng ý', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  matching: { label: 'Ghép đôi', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  ordering: { label: 'Sắp xếp thứ tự', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  fill_blank: { label: 'Điền khuyết', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  short_answer: { label: 'Trả lời ngắn', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30' },
  essay: { label: 'Tự luận', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  passage_group: { label: 'Đoạn văn / Tình huống', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30' },
};

const DIFFICULTY_MAP: Record<string, { label: string; color: string; bg: string }> = {
  knowledge: { label: 'Nhận biết', color: 'text-sky-400', bg: 'bg-sky-500/10' },
  comprehension: { label: 'Thông hiểu', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  application: { label: 'Vận dụng', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  high_application: { label: 'Vận dụng cao', color: 'text-rose-400', bg: 'bg-rose-500/10' },
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Bản nháp', color: 'text-slate-400', bg: 'bg-slate-500/10' },
  pending: { label: 'Chờ duyệt', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  approved: { label: 'Đã duyệt', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  rejected: { label: 'Từ chối', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  archived: { label: 'Đã lưu trữ', color: 'text-slate-500', bg: 'bg-slate-800' },
};

export const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({
  question,
  onClose,
  onEdit,
  onDuplicate,
}) => {
  const [viewMode, setViewMode] = useState<'teacher' | 'student'>('teacher');
  const [studentAnswers, setStudentAnswers] = useState<Record<string, any>>({});

  if (!question) return null;

  const typeConfig = TYPE_CONFIG[question.type] || TYPE_CONFIG.single_choice;
  const diffConfig = DIFFICULTY_MAP[question.difficulty] || DIFFICULTY_MAP.knowledge;
  const statusConfig = STATUS_MAP[question.status] || STATUS_MAP.pending;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#090d16] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#060910]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-white bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md">
              {question.subject} · {question.grade}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${typeConfig.bg} ${typeConfig.color} ${typeConfig.border}`}
            >
              {typeConfig.label}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${diffConfig.bg} ${diffConfig.color}`}>
              {diffConfig.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-[#0d1322] border border-slate-800 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setViewMode('teacher')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  viewMode === 'teacher'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Chế độ Giáo viên
              </button>
              <button
                type="button"
                onClick={() => setViewMode('student')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  viewMode === 'student'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Học sinh làm bài
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#060910] rounded-xl border border-slate-800/90 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Môn học & Khối:</span>
              <span className="font-semibold text-slate-200">
                {question.subject} · {question.grade}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Chủ đề:</span>
              <span className="font-semibold text-slate-200 truncate block" title={question.topic}>
                {question.topic}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Điểm số:</span>
              <span className="font-mono font-bold text-amber-400">{question.points} điểm</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Trạng thái:</span>
              <span className={`font-semibold ${statusConfig.color}`}>{statusConfig.label}</span>
            </div>
          </div>

          {/* Question Content */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" /> Nội dung đề bài
            </div>
            <div className="p-4 bg-[#060910] border border-slate-800 rounded-xl text-slate-100 font-medium leading-relaxed whitespace-pre-line text-sm sm:text-base">
              {question.content}
            </div>
          </div>

          {/* Type-Specific Content Interactive Area */}
          <div className="space-y-3">
            {/* 1. Single Choice */}
            {question.type === 'single_choice' && question.options && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Các phương án lựa chọn:
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {question.options.map((opt, idx) => {
                    const isCorrect = viewMode === 'teacher' && question.correctAnswer === idx;
                    const isSelected = studentAnswers['single'] === idx;

                    return (
                      <div
                        key={idx}
                        onClick={() =>
                          viewMode === 'student' &&
                          setStudentAnswers({ ...studentAnswers, single: idx })
                        }
                        className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                          isCorrect
                            ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200'
                            : isSelected
                            ? 'bg-blue-950/40 border-blue-500 text-blue-200'
                            : 'bg-[#060910] border-slate-800 hover:border-slate-700 text-slate-200'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 shrink-0 rounded-lg font-bold flex items-center justify-center text-xs font-mono ${
                            isCorrect
                              ? 'bg-emerald-500 text-slate-950'
                              : isSelected
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <div className="flex-1 text-sm pt-0.5">{opt}</div>
                        {isCorrect && (
                          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/80">
                            Đáp án đúng
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Multiple Choice */}
            {question.type === 'multiple_choice' && question.options && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Các phương án lựa chọn (Chọn nhiều):
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {question.options.map((opt, idx) => {
                    const isCorrect =
                      viewMode === 'teacher' && (question.correctAnswers || []).includes(idx);
                    const selectedList: number[] = studentAnswers['multi'] || [];
                    const isSelected = selectedList.includes(idx);

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (viewMode === 'student') {
                            const next = isSelected
                              ? selectedList.filter((i) => i !== idx)
                              : [...selectedList, idx];
                            setStudentAnswers({ ...studentAnswers, multi: next });
                          }
                        }}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                          isCorrect
                            ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200'
                            : isSelected
                            ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200'
                            : 'bg-[#060910] border-slate-800 hover:border-slate-700 text-slate-200'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 shrink-0 rounded font-bold flex items-center justify-center text-xs font-mono ${
                            isCorrect
                              ? 'bg-emerald-500 text-slate-950'
                              : isSelected
                              ? 'bg-indigo-500 text-white'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <div className="flex-1 text-sm pt-0.5">{opt}</div>
                        {isCorrect && (
                          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/80">
                            Đáp án đúng
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. True/False Group */}
            {question.type === 'true_false_group' && question.statements && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Mệnh đề ĐÚNG / SAI:
                </div>
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#060910]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#090d16] text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">Ý</th>
                        <th className="py-2.5 px-3">Mệnh đề</th>
                        <th className="py-2.5 px-3 text-center w-28">
                          {viewMode === 'teacher' ? 'Đáp án chuẩn' : 'Lựa chọn của bạn'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {question.statements.map((st, idx) => (
                        <tr key={st.id} className="hover:bg-slate-900/40">
                          <td className="py-3 px-3 text-center font-bold font-mono text-cyan-400">
                            {String.fromCharCode(97 + idx)})
                          </td>
                          <td className="py-3 px-3 text-slate-200 font-medium">{st.text}</td>
                          <td className="py-3 px-3 text-center">
                            {viewMode === 'teacher' ? (
                              <span
                                className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase ${
                                  st.isCorrect
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                }`}
                              >
                                {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                              </span>
                            ) : (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setStudentAnswers({
                                      ...studentAnswers,
                                      [`tf_${st.id}`]: true,
                                    })
                                  }
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                    studentAnswers[`tf_${st.id}`] === true
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  Đ
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setStudentAnswers({
                                      ...studentAnswers,
                                      [`tf_${st.id}`]: false,
                                    })
                                  }
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                    studentAnswers[`tf_${st.id}`] === false
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  S
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. Matching */}
            {question.type === 'matching' && question.matchingPairs && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Ghép đôi các phần tử tương ứng:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-cyan-400 block mb-1">Cột A</span>
                    {question.matchingPairs.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#060910] border border-slate-800 rounded-xl text-xs flex items-center gap-2"
                      >
                        <span className="font-bold text-cyan-400 font-mono w-5">{idx + 1}.</span>
                        <span className="text-slate-200">{p.left}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-amber-400 block mb-1">Cột B</span>
                    {question.matchingPairs.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#060910] border border-slate-800 rounded-xl text-xs flex items-center gap-2"
                      >
                        <span className="font-bold text-amber-400 font-mono w-5">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <span className="text-slate-200">{p.right}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {viewMode === 'teacher' && (
                  <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl text-xs text-amber-300">
                    <span className="font-bold">Cặp ghép chuẩn: </span>
                    {question.matchingPairs
                      .map((p, idx) => `${idx + 1} ↔ ${String.fromCharCode(65 + idx)}`)
                      .join('  |  ')}
                  </div>
                )}
              </div>
            )}

            {/* 5. Ordering */}
            {question.type === 'ordering' && question.orderingItems && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Trình tự sắp xếp chuẩn:
                </div>
                <div className="space-y-2">
                  {question.orderingItems
                    .slice()
                    .sort((a, b) =>
                      viewMode === 'teacher' ? a.correctIndex - b.correctIndex : 0
                    )
                    .map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3 bg-[#060910] border border-slate-800 rounded-xl text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center font-mono font-bold">
                            {viewMode === 'teacher' ? item.correctIndex : idx + 1}
                          </span>
                          <span className="text-slate-200">{item.text}</span>
                        </div>
                        {viewMode === 'teacher' && (
                          <span className="text-[11px] text-purple-400 font-mono">
                            Thứ tự {item.correctIndex}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 6. Fill Blank */}
            {question.type === 'fill_blank' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Đoạn văn điền khuyết:
                </div>
                <div className="p-4 bg-[#060910] border border-slate-800 rounded-xl text-slate-200 leading-relaxed text-sm">
                  {question.templateText || question.content}
                </div>
                {viewMode === 'teacher' && question.blanks && (
                  <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl space-y-1.5 text-xs text-cyan-200">
                    <span className="font-bold block text-cyan-400">Đáp án cho các vị trí trống:</span>
                    {question.blanks.map((b) => (
                      <div key={b.id} className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-300">[{b.id}]:</span>
                        <span>{b.acceptedAnswers.join('  hoặc  ')}</span>
                        {b.hint && <span className="text-slate-400">({b.hint})</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 7. Short Answer */}
            {question.type === 'short_answer' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Trả lời ngắn:
                </div>
                {viewMode === 'student' ? (
                  <input
                    type="text"
                    placeholder="Nhập câu trả lời ngắn của bạn tại đây..."
                    className="w-full px-3.5 py-2.5 bg-[#060910] border border-slate-800 rounded-xl text-slate-100 text-sm outline-none focus:border-cyan-500"
                  />
                ) : (
                  <div className="p-3 bg-teal-950/30 border border-teal-800/40 rounded-xl space-y-1 text-xs text-teal-200">
                    <div className="font-bold text-teal-400">Đáp án mẫu: {question.sampleAnswer}</div>
                    {question.acceptedVariations && (
                      <div className="text-slate-400">
                        Các biến thể chấp nhận:{' '}
                        {question.acceptedVariations.join('  |  ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 8. Essay */}
            {question.type === 'essay' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Hướng dẫn chấm & Thang điểm (Rubric):
                </div>
                <div className="p-4 bg-[#060910] border border-slate-800 rounded-xl text-slate-300 whitespace-pre-line text-xs leading-relaxed">
                  {question.rubric || 'Chưa cấu hình rubric chi tiết.'}
                </div>
                {viewMode === 'teacher' && question.suggestedAnswer && (
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-400 block">Bài làm gợi ý:</span>
                    <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-emerald-200 whitespace-pre-line text-xs leading-relaxed">
                      {question.suggestedAnswer}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 9. Passage Group */}
            {question.type === 'passage_group' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-wider">
                    Đoạn văn / Ngữ liệu tình huống chung:
                  </span>
                  <div className="p-4 bg-[#060910] border-l-4 border-l-fuchsia-500 border border-slate-800 rounded-xl text-slate-200 italic leading-relaxed text-sm whitespace-pre-line">
                    {question.passage}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Các câu hỏi con ({question.subQuestions?.length || 0} câu):
                  </span>
                  {(question.subQuestions || []).map((sub, sIdx) => (
                    <div
                      key={sub.id}
                      className="p-3.5 bg-[#060910] border border-slate-800 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">
                          Câu {sIdx + 1}: {sub.content}
                        </span>
                        <span className="font-mono text-amber-400 font-bold">{sub.points}đ</span>
                      </div>
                      {sub.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          {sub.options.map((opt, oIdx) => {
                            const isSubCorrect =
                              viewMode === 'teacher' && sub.correctAnswer === oIdx;
                            return (
                              <div
                                key={oIdx}
                                className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${
                                  isSubCorrect
                                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                                    : 'bg-[#090d16] border-slate-800 text-slate-300'
                                }`}
                              >
                                <span className="font-mono font-bold">
                                  {String.fromCharCode(65 + oIdx)}.
                                </span>
                                <span>{opt}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Teacher Explanation (View Mode: Teacher) */}
          {viewMode === 'teacher' && question.explanation && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" /> Lời giải & Giải thích chi tiết
              </div>
              <div className="p-3.5 bg-blue-950/20 border border-blue-800/40 rounded-xl text-blue-200 text-xs leading-relaxed whitespace-pre-line">
                {question.explanation}
              </div>
            </div>
          )}

          {/* Tags & Document */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              {question.tags.map((t, idx) => (
                <span key={idx} className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 text-[11px]">
                  #{t}
                </span>
              ))}
            </div>
            {question.sourceDocument && (
              <span className="italic text-slate-500">Nguồn: {question.sourceDocument}</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#060910] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDuplicate(question)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5" /> Sao chép câu hỏi
            </button>
            <button
              type="button"
              onClick={() => onEdit(question)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            >
              <Edit className="w-3.5 h-3.5" /> Chỉnh sửa
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
