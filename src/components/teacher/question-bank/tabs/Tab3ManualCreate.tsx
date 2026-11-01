import React, { useState, useEffect, useRef } from 'react';
import {
  Edit3,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Save,
  Check,
  HelpCircle,
  FileText,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';
import {
  BankQuestion,
  BankQuestionType,
  QuestionDifficulty,
  QuestionStatus,
  TrueFalseStatement,
  FillBlankItem,
} from '../../../../types/questionBank';
import { findClosestDuplicate } from '../../../../services/duplicateDetector';

interface Tab3ManualCreateProps {
  existingQuestions: BankQuestion[];
  onSaveQuestion: (question: BankQuestion) => void;
}

// 5 Core Question Types matching exact user screenshot
export const QUESTION_TYPE_OPTIONS: Array<{
  type: BankQuestionType;
  label: string;
}> = [
  { type: 'single_choice', label: 'Trắc nghiệm - Pick One (1 đáp án)' },
  { type: 'multiple_choice', label: 'Nhiều đáp án - Pick Many' },
  { type: 'true_false_group', label: 'Đúng / Sai' },
  { type: 'fill_blank', label: 'Điền khuyết' },
  { type: 'essay', label: 'Tự luận' },
];

const SUBJECTS = [
  'Toán học',
  'Ngữ văn',
  'Tiếng Anh',
  'Vật lí',
  'Hóa học',
  'Sinh học',
  'Lịch sử',
  'Địa lí',
  'Tin học',
  'GDCD',
];

const GRADES = ['Lớp 10', 'Lớp 11', 'Lớp 12', 'Khối 6', 'Khối 7', 'Khối 8', 'Khối 9'];

export const Tab3ManualCreate: React.FC<Tab3ManualCreateProps> = ({
  existingQuestions,
  onSaveQuestion,
}) => {
  // 1. Core Selection (Môn học, Lớp, Dạng câu hỏi)
  const [subject, setSubject] = useState('Toán học');
  const [grade, setGrade] = useState('Lớp 10');
  const [type, setType] = useState<BankQuestionType>('single_choice');

  // Metadata
  const [code, setCode] = useState(`QB-TOAN10-${Date.now().toString().slice(-4)}`);
  const [chapter, setChapter] = useState('Chương 1: Mệnh đề và tập hợp');
  const [topic, setTopic] = useState('Mệnh đề toán học');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('knowledge');
  const [points, setPoints] = useState(1.0);
  const [status, setStatus] = useState<QuestionStatus>('approved');
  const [tags, setTags] = useState('Toán 10, Căn bản');

  // Content
  const [content, setContent] = useState('');
  const [explanation, setExplanation] = useState('');

  // 1 & 2. Pick one / Pick many Options
  const [options, setOptions] = useState<string[]>([
    'Phương án A',
    'Phương án B',
    'Phương án C',
    'Phương án D',
  ]);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([0]);

  // 3. Đúng / Sai
  const [statements, setStatements] = useState<TrueFalseStatement[]>([
    { id: 'st_1', text: 'Mệnh đề a', isCorrect: true },
    { id: 'st_2', text: 'Mệnh đề b', isCorrect: false },
    { id: 'st_3', text: 'Mệnh đề c', isCorrect: true },
    { id: 'st_4', text: 'Mệnh đề d', isCorrect: false },
  ]);

  // 4. Điền khuyết
  const [templateText, setTemplateText] = useState(
    'Thủ đô của Việt Nam là [blank_1], có diện tích lớn là thành phố [blank_2].'
  );
  const [blanks, setBlanks] = useState<FillBlankItem[]>([
    { id: 'blank_1', acceptedAnswers: ['Hà Nội', 'ha noi'], hint: 'Thủ đô' },
    { id: 'blank_2', acceptedAnswers: ['Hồ Chí Minh', 'TP.HCM', 'Sài Gòn'], hint: 'Đô thị phía Nam' },
  ]);

  // 5. Tự luận
  const [rubric, setRubric] = useState('Thang điểm chi tiết (1.0 điểm):\n- 0.5đ: Nêu đúng định nghĩa.\n- 0.5đ: Áp dụng vào ví dụ thực tế.');
  const [suggestedAnswer, setSuggestedAnswer] = useState('');

  // Duplicate warning
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Dropdown open state for Kiểu câu hỏi
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update auto code when subject or grade changes
  useEffect(() => {
    const subjCode = subject.slice(0, 3).toUpperCase();
    const gradeNum = grade.replace(/[^0-9]/g, '');
    setCode(`QB-${subjCode}${gradeNum || '10'}-${Date.now().toString().slice(-4)}`);
  }, [subject, grade]);

  // Check duplicate on content change
  useEffect(() => {
    if (content.length > 15) {
      const match = findClosestDuplicate({ content }, existingQuestions, 75);
      if (match) {
        setDuplicateWarning(
          `Cảnh báo trùng lặp: Nội dung có độ tương đồng ${match.similarityScore}% với câu [${match.existingQuestion.code}] "${match.existingQuestion.content.slice(0, 45)}..."`
        );
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  }, [content, existingQuestions]);

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!content.trim()) errs.push('Vui lòng nhập nội dung đề bài câu hỏi.');
    if (!code.trim()) errs.push('Mã câu hỏi không được để trống.');

    if (type === 'single_choice' || type === 'multiple_choice') {
      const validOpts = options.filter((o) => o.trim().length > 0);
      if (validOpts.length < 2) errs.push('Cần ít nhất 2 phương án lựa chọn.');
    } else if (type === 'true_false_group') {
      if (statements.length === 0) errs.push('Cần ít nhất 1 mệnh đề Đúng/Sai.');
    } else if (type === 'fill_blank') {
      if (!templateText.includes('[blank_')) {
        errs.push('Văn bản điền khuyết phải chứa ít nhất một vị trí dạng [blank_1]');
      }
    }

    setValidationErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newQ: BankQuestion = {
      id: `qb_manual_${Date.now()}`,
      code: code.trim(),
      type,
      content: content.trim(),
      grade,
      subject,
      chapter: chapter.trim(),
      topic: topic.trim(),
      difficulty,
      points: Number(points) || 1.0,
      tags: tagList,
      source: 'manual',
      author: 'Giáo viên bộ môn',
      status,
      explanation: explanation.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Type payloads
      options: type === 'single_choice' || type === 'multiple_choice' ? options : undefined,
      correctAnswer: type === 'single_choice' ? correctAnswer : undefined,
      correctAnswers: type === 'multiple_choice' ? correctAnswers : undefined,
      statements: type === 'true_false_group' ? statements : undefined,
      templateText: type === 'fill_blank' ? templateText : undefined,
      blanks: type === 'fill_blank' ? blanks : undefined,
      rubric: type === 'essay' ? rubric.trim() : undefined,
      suggestedAnswer: type === 'essay' ? suggestedAnswer.trim() : undefined,
    };

    onSaveQuestion(newQ);

    // Reset content for next question
    setContent('');
    setExplanation('');
    setDuplicateWarning(null);
    setValidationErrors([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="p-3.5 bg-rose-950/30 border border-rose-500/50 rounded-xl text-rose-300 space-y-1 text-xs">
            <div className="font-bold flex items-center gap-1.5 text-rose-400">
              <AlertTriangle className="w-4 h-4" /> Vui lòng kiểm tra lại:
            </div>
            <ul className="list-disc list-inside space-y-0.5 pl-1">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Duplicate Warning */}
        {duplicateWarning && (
          <div className="p-3 bg-amber-950/30 border border-amber-500/50 rounded-xl text-amber-300 flex items-start gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{duplicateWarning}</span>
          </div>
        )}

        {/* Section: Subject, Grade, and Kiểu câu hỏi */}
        <div className="bg-[#090d16] border border-slate-800 rounded-xl p-5 space-y-5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Môn học & Khối lớp
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1.5 font-bold">Môn học *</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-[#060910] border border-slate-700 rounded-xl text-slate-100 font-medium outline-none focus:border-blue-500"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1.5 font-bold">Khối lớp *</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 bg-[#060910] border border-slate-700 rounded-xl text-slate-100 font-medium outline-none focus:border-blue-500"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Kiểu câu hỏi dropdown matching the exact user screenshot */}
          <div className="space-y-2 pt-3 border-t border-slate-800/80">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Kiểu câu hỏi
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-[#060910] border-2 border-cyan-400 rounded-lg text-white font-medium text-xs sm:text-sm shadow-lg shadow-cyan-500/10 hover:border-cyan-300 transition cursor-pointer"
              >
                <span className="font-medium">
                  {QUESTION_TYPE_OPTIONS.find((o) => o.type === type)?.label || 'Tự luận'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-300 transition-transform duration-200 ${
                    isTypeDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isTypeDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#060910] border border-cyan-500/60 rounded-lg shadow-2xl py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  {QUESTION_TYPE_OPTIONS.map((opt) => {
                    const isSelected = type === opt.type;
                    return (
                      <div
                        key={opt.type}
                        onClick={() => {
                          setType(opt.type);
                          setIsTypeDropdownOpen(false);
                        }}
                        className={`px-4 py-2.5 text-xs sm:text-sm cursor-pointer transition select-none flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#1d63ed] text-white font-medium'
                            : 'text-slate-200 hover:bg-slate-800/80'
                        }`}
                      >
                        <span>{opt.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section: Metadata */}
        <div className="bg-[#090d16] border border-slate-800 rounded-xl p-5 space-y-4">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Phân loại & Điểm số
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Chương / Bài</label>
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="VD: Chương 1..."
                className="w-full px-2.5 py-1.5 bg-[#060910] border border-slate-700 rounded-lg text-slate-100"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Chủ đề kiến thức</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="VD: Mệnh đề toán học..."
                className="w-full px-2.5 py-1.5 bg-[#060910] border border-slate-700 rounded-lg text-slate-100"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Mức độ tư duy</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
                className="w-full px-2.5 py-1.5 bg-[#060910] border border-slate-700 rounded-lg text-slate-100"
              >
                <option value="knowledge">Nhận biết</option>
                <option value="comprehension">Thông hiểu</option>
                <option value="application">Vận dụng</option>
                <option value="high_application">Vận dụng cao</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Điểm mặc định</label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="10"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-[#060910] border border-slate-700 rounded-lg text-slate-100 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Trạng thái duyệt</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as QuestionStatus)}
                className="w-full px-2.5 py-1.5 bg-[#060910] border border-slate-700 rounded-lg text-slate-100"
              >
                <option value="approved">Đã duyệt (Chính thức)</option>
                <option value="pending">Chờ duyệt</option>
                <option value="draft">Bản nháp</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Thẻ tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Toán 10, Căn bản..."
                className="w-full px-2.5 py-1.5 bg-[#060910] border border-slate-700 rounded-lg text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Section: Question Content & Dynamic Type Inputs */}
        <div className="bg-[#090d16] border border-slate-800 rounded-xl p-5 space-y-4">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Nội dung đề bài & Đáp án
          </label>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 block font-semibold">Nội dung câu hỏi *</label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung đề bài tại đây..."
              className="w-full p-3.5 bg-[#060910] border border-slate-700 rounded-xl text-slate-100 text-xs sm:text-sm outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>

          {/* DẠNG 1: Trắc nghiệm - Pick one */}
          {type === 'single_choice' && (
            <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">
                  Phương án lựa chọn (Chọn 1 đáp án đúng bằng nút tròn):
                </span>
                <button
                  type="button"
                  onClick={() => setOptions([...options, `Phương án ${String.fromCharCode(65 + options.length)}`])}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm phương án
                </button>
              </div>

              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="pick_one_answer"
                      checked={correctAnswer === idx}
                      onChange={() => setCorrectAnswer(idx)}
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                    />
                    <span className="font-mono font-bold text-slate-400 w-5">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const next = [...options];
                        next[idx] = e.target.value;
                        setOptions(next);
                      }}
                      className="flex-1 px-3 py-1.5 bg-[#060910] border border-slate-700 rounded-lg text-slate-100"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DẠNG 2: Nhiều đáp án - Pick many */}
          {type === 'multiple_choice' && (
            <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">
                  Phương án lựa chọn (Tick chọn các đáp án đúng bằng ô vuông):
                </span>
                <button
                  type="button"
                  onClick={() => setOptions([...options, `Phương án ${String.fromCharCode(65 + options.length)}`])}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm phương án
                </button>
              </div>

              <div className="space-y-2">
                {options.map((opt, idx) => {
                  const isChecked = correctAnswers.includes(idx);
                  return (
                    <div key={idx} className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) setCorrectAnswers([...correctAnswers, idx]);
                          else setCorrectAnswers(correctAnswers.filter((i) => i !== idx));
                        }}
                        className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                      />
                      <span className="font-mono font-bold text-slate-400 w-5">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const next = [...options];
                          next[idx] = e.target.value;
                          setOptions(next);
                        }}
                        className="flex-1 px-3 py-1.5 bg-[#060910] border border-slate-700 rounded-lg text-slate-100"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DẠNG 3: Đúng / Sai */}
          {type === 'true_false_group' && (
            <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">
                  Danh sách các mệnh đề và nhãn Đúng / Sai:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setStatements([
                      ...statements,
                      { id: `st_${statements.length + 1}`, text: '', isCorrect: true },
                    ])
                  }
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm mệnh đề
                </button>
              </div>

              <div className="space-y-2">
                {statements.map((st, idx) => (
                  <div key={st.id} className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400 w-5">
                      {String.fromCharCode(97 + idx)})
                    </span>
                    <input
                      type="text"
                      placeholder="Nội dung mệnh đề..."
                      value={st.text}
                      onChange={(e) => {
                        const next = [...statements];
                        next[idx].text = e.target.value;
                        setStatements(next);
                      }}
                      className="flex-1 px-3 py-1.5 bg-[#060910] border border-slate-700 rounded-lg text-slate-100"
                    />

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...statements];
                          next[idx].isCorrect = true;
                          setStatements(next);
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                          st.isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        ĐÚNG
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...statements];
                          next[idx].isCorrect = false;
                          setStatements(next);
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                          !st.isCorrect ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        SAI
                      </button>
                    </div>

                    {statements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setStatements(statements.filter((_, i) => i !== idx))}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DẠNG 4: Điền khuyết */}
          {type === 'fill_blank' && (
            <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
              <label className="font-bold text-slate-300 block">
                Đoạn văn điền khuyết (Dùng cú pháp [blank_1], [blank_2] để đánh dấu vị trí trống):
              </label>
              <textarea
                rows={3}
                value={templateText}
                onChange={(e) => setTemplateText(e.target.value)}
                className="w-full p-3 bg-[#060910] border border-slate-700 rounded-xl text-slate-100"
              />

              <span className="font-bold text-slate-400 block pt-1">
                Khai báo đáp án được chấp nhận cho mỗi vị trí:
              </span>
              <div className="space-y-2">
                {blanks.map((b, idx) => (
                  <div key={b.id} className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400 w-16">[{b.id}]:</span>
                    <input
                      type="text"
                      placeholder="Các đáp án cách nhau bởi dấu phẩy (,)"
                      value={b.acceptedAnswers.join(', ')}
                      onChange={(e) => {
                        const next = [...blanks];
                        next[idx].acceptedAnswers = e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean);
                        setBlanks(next);
                      }}
                      className="flex-1 px-3 py-1.5 bg-[#060910] border border-slate-700 rounded-lg text-slate-100"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DẠNG 5: Tự luận */}
          {type === 'essay' && (
            <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">
                  Hướng dẫn chấm & Thang điểm Rubric:
                </label>
                <textarea
                  rows={3}
                  value={rubric}
                  onChange={(e) => setRubric(e.target.value)}
                  placeholder="Tiêu chí chấm điểm chi tiết..."
                  className="w-full p-2.5 bg-[#060910] border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">
                  Bài làm mẫu gợi ý / Lời giải chuẩn:
                </label>
                <textarea
                  rows={3}
                  value={suggestedAnswer}
                  onChange={(e) => setSuggestedAnswer(e.target.value)}
                  placeholder="Nội dung bài làm gợi ý..."
                  className="w-full p-2.5 bg-[#060910] border border-slate-700 rounded-lg text-slate-100"
                />
              </div>
            </div>
          )}

          {/* Lời giải chi tiết */}
          <div className="pt-2 border-t border-slate-800 text-xs space-y-1">
            <label className="text-slate-400 font-semibold block">Lời giải & Hướng dẫn giải chi tiết</label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Giải thích vì sao đáp án đúng..."
              className="w-full p-2.5 bg-[#060910] border border-slate-700 rounded-lg text-slate-100"
            />
          </div>
        </div>

        {/* Live Preview & Submit Buttons */}
        <div className="p-4 bg-[#090d16] border border-slate-800 rounded-xl flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Câu hỏi mới sẽ được lưu trực tiếp vào Ngân hàng câu hỏi của bạn.
          </span>

          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition cursor-pointer"
          >
            <Save className="w-4 h-4" /> Lưu câu hỏi vào Ngân hàng
          </button>
        </div>
      </form>
    </div>
  );
};
