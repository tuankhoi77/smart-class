import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  AlertTriangle,
  HelpCircle,
  Eye,
  CheckCircle2,
  Sparkles,
  Save,
  Layers,
  ChevronDown,
} from 'lucide-react';
import {
  BankQuestion,
  BankQuestionType,
  QuestionDifficulty,
  QuestionStatus,
  TrueFalseStatement,
  MatchingPair,
  OrderingItem,
  FillBlankItem,
  SubQuestion,
} from '../../../types/questionBank';
import { findClosestDuplicate } from '../../../services/duplicateDetector';

interface QuestionFormModalProps {
  initialQuestion?: BankQuestion | null;
  existingQuestions: BankQuestion[];
  onClose: () => void;
  onSave: (question: BankQuestion) => void;
}

const QUESTION_TYPES: Array<{ type: BankQuestionType; label: string; desc: string }> = [
  { type: 'single_choice', label: 'Trắc nghiệm - Pick One (1 đáp án)', desc: 'Nhiều phương án lựa chọn, chỉ có 1 phương án đúng' },
  { type: 'multiple_choice', label: 'Nhiều đáp án - Pick Many', desc: 'Học sinh chọn 2 hoặc nhiều phương án đúng' },
  { type: 'true_false_group', label: 'Đúng / Sai', desc: 'Nhiều mệnh đề độc lập với nhãn Đúng/Sai' },
  { type: 'fill_blank', label: 'Điền khuyết', desc: 'Đoạn văn chứa chỗ trống [blank_1], [blank_2] cần điền' },
  { type: 'essay', label: 'Tự luận', desc: 'Đề bài kèm rubric hướng dẫn chấm và bài làm gợi ý' },
  { type: 'matching', label: 'Ghép đôi (Matching)', desc: 'Nối các phần tử ở cột A với phần tử tương ứng ở cột B' },
  { type: 'ordering', label: 'Sắp xếp thứ tự', desc: 'Sắp xếp các bước/giai đoạn theo trình tự logic' },
  { type: 'short_answer', label: 'Trả lời ngắn', desc: 'Đáp án mẫu và danh sách biến thể được chấp nhận' },
  { type: 'passage_group', label: 'Đoạn văn / Tình huống', desc: 'Ngữ liệu chung kèm các câu hỏi con độc lập' },
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

export const QuestionFormModal: React.FC<QuestionFormModalProps> = ({
  initialQuestion,
  existingQuestions,
  onClose,
  onSave,
}) => {
  const isEditing = !!initialQuestion;

  // Form states
  const [code, setCode] = useState(
    initialQuestion?.code || `QB-${Date.now().toString().slice(-4)}`
  );
  const [type, setType] = useState<BankQuestionType>(
    initialQuestion?.type || 'single_choice'
  );
  const [content, setContent] = useState(initialQuestion?.content || '');
  const [grade, setGrade] = useState(initialQuestion?.grade || 'Lớp 10');
  const [subject, setSubject] = useState(initialQuestion?.subject || 'Toán học');
  const [chapter, setChapter] = useState(initialQuestion?.chapter || '');
  const [topic, setTopic] = useState(initialQuestion?.topic || 'Chủ đề trọng tâm');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>(
    initialQuestion?.difficulty || 'comprehension'
  );
  const [points, setPoints] = useState(initialQuestion?.points ?? 1.0);
  const [tagsInput, setTagsInput] = useState(
    initialQuestion?.tags ? initialQuestion.tags.join(', ') : ''
  );
  const [explanation, setExplanation] = useState(initialQuestion?.explanation || '');
  const [status, setStatus] = useState<QuestionStatus>(
    initialQuestion?.status || 'approved'
  );

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
  const [sourceDocument, setSourceDocument] = useState(
    initialQuestion?.sourceDocument || ''
  );

  // Type-specific state
  // 1 & 2. Single / Multi Choice
  const [options, setOptions] = useState<string[]>(
    initialQuestion?.options && initialQuestion.options.length > 0
      ? initialQuestion.options
      : ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D']
  );
  const [correctAnswer, setCorrectAnswer] = useState<number>(
    initialQuestion?.correctAnswer ?? 0
  );
  const [correctAnswers, setCorrectAnswers] = useState<number[]>(
    initialQuestion?.correctAnswers || [0]
  );

  // 3. True/False Statements
  const [statements, setStatements] = useState<TrueFalseStatement[]>(
    initialQuestion?.statements || [
      { id: 'st_1', text: 'Mệnh đề a', isCorrect: true },
      { id: 'st_2', text: 'Mệnh đề b', isCorrect: false },
      { id: 'st_3', text: 'Mệnh đề c', isCorrect: true },
    ]
  );

  // 4. Matching Pairs
  const [matchingPairs, setMatchingPairs] = useState<MatchingPair[]>(
    initialQuestion?.matchingPairs || [
      { id: 'p_1', left: 'Vế A1', right: 'Khái niệm tương ứng B1' },
      { id: 'p_2', left: 'Vế A2', right: 'Khái niệm tương ứng B2' },
    ]
  );

  // 5. Ordering Items
  const [orderingItems, setOrderingItems] = useState<OrderingItem[]>(
    initialQuestion?.orderingItems || [
      { id: 'ord_1', text: 'Giai đoạn khởi đầu', correctIndex: 1 },
      { id: 'ord_2', text: 'Giai đoạn phát triển', correctIndex: 2 },
      { id: 'ord_3', text: 'Giai đoạn kết thúc', correctIndex: 3 },
    ]
  );

  // 6. Fill Blank
  const [templateText, setTemplateText] = useState(
    initialQuestion?.templateText ||
      'Thủ đô của Việt Nam là [blank_1], còn trung tâm kinh tế phía Nam là [blank_2].'
  );
  const [blanks, setBlanks] = useState<FillBlankItem[]>(
    initialQuestion?.blanks || [
      { id: 'blank_1', acceptedAnswers: ['Hà Nội', 'ha noi'], hint: 'Thủ đô' },
      { id: 'blank_2', acceptedAnswers: ['TP Hồ Chí Minh', 'TP.HCM', 'Sài Gòn'], hint: 'Thành phố lớn' },
    ]
  );

  // 7. Short Answer
  const [sampleAnswer, setSampleAnswer] = useState(initialQuestion?.sampleAnswer || '');
  const [variationsInput, setVariationsInput] = useState(
    initialQuestion?.acceptedVariations ? initialQuestion.acceptedVariations.join(', ') : ''
  );

  // 8. Essay
  const [rubric, setRubric] = useState(initialQuestion?.rubric || '');
  const [suggestedAnswer, setSuggestedAnswer] = useState(
    initialQuestion?.suggestedAnswer || ''
  );

  // 9. Passage Group
  const [passage, setPassage] = useState(initialQuestion?.passage || '');
  const [subQuestions, setSubQuestions] = useState<SubQuestion[]>(
    initialQuestion?.subQuestions || [
      {
        id: 'sub_1',
        type: 'single_choice',
        content: 'Theo đoạn văn trên, nhận định nào sau đây là chính xác?',
        options: ['Lựa chọn 1', 'Lựa chọn 2', 'Lựa chọn 3', 'Lựa chọn 4'],
        correctAnswer: 0,
        points: 1.0,
      },
    ]
  );

  // Duplicate warning detection
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (content.length > 15) {
      const match = findClosestDuplicate(
        { id: initialQuestion?.id, content },
        existingQuestions,
        75
      );
      if (match) {
        setDuplicateWarning(
          `Cảnh báo: Nội dung câu hỏi có độ tương đồng ${match.similarityScore}% với câu [${match.existingQuestion.code}] "${match.existingQuestion.content.slice(0, 50)}..."`
        );
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  }, [content, initialQuestion, existingQuestions]);

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!content.trim()) errs.push('Vui lòng nhập nội dung đề bài.');

    if (type === 'single_choice' || type === 'multiple_choice') {
      const validOptions = options.filter((o) => o.trim().length > 0);
      if (validOptions.length < 2) errs.push('Câu trắc nghiệm cần tối thiểu 2 phương án lựa chọn.');
    } else if (type === 'true_false_group') {
      if (statements.length === 0) errs.push('Cần ít nhất 1 mệnh đề Đúng/Sai.');
    } else if (type === 'matching') {
      if (matchingPairs.length === 0) errs.push('Cần ít nhất 1 cặp ghép đôi.');
    } else if (type === 'ordering') {
      if (orderingItems.length < 2) errs.push('Cần ít nhất 2 phần tử để sắp xếp thứ tự.');
    } else if (type === 'fill_blank') {
      if (!templateText.includes('[blank_')) {
        errs.push('Văn bản điền khuyết phải chứa ít nhất một vị trí dạng [blank_1]');
      }
    } else if (type === 'short_answer') {
      if (!sampleAnswer.trim()) errs.push('Vui lòng nhập đáp án mẫu cho câu trả lời ngắn.');
    } else if (type === 'passage_group') {
      if (!passage.trim()) errs.push('Vui lòng nhập nội dung đoạn văn/ngữ liệu chung.');
      if (subQuestions.length === 0) errs.push('Cần ít nhất 1 câu hỏi con.');
    }

    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const variations = variationsInput
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    const questionData: BankQuestion = {
      id: initialQuestion?.id || `qb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      code: code.trim(),
      type,
      content: content.trim(),
      grade,
      subject,
      chapter: chapter.trim(),
      topic: topic.trim(),
      difficulty,
      points: Number(points) || 1.0,
      tags,
      source: initialQuestion?.source || 'manual',
      author: initialQuestion?.author || 'Giáo viên hiện tại',
      status,
      explanation: explanation.trim(),
      sourceDocument: sourceDocument.trim(),
      createdAt: initialQuestion?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Type payloads
      options: type === 'single_choice' || type === 'multiple_choice' ? options : undefined,
      correctAnswer: type === 'single_choice' ? correctAnswer : undefined,
      correctAnswers: type === 'multiple_choice' ? correctAnswers : undefined,
      statements: type === 'true_false_group' ? statements : undefined,
      matchingPairs: type === 'matching' ? matchingPairs : undefined,
      orderingItems: type === 'ordering' ? orderingItems : undefined,
      templateText: type === 'fill_blank' ? templateText : undefined,
      blanks: type === 'fill_blank' ? blanks : undefined,
      sampleAnswer: type === 'short_answer' ? sampleAnswer.trim() : undefined,
      acceptedVariations: type === 'short_answer' ? [sampleAnswer.trim(), ...variations] : undefined,
      rubric: type === 'essay' ? rubric.trim() : undefined,
      suggestedAnswer: type === 'essay' ? suggestedAnswer.trim() : undefined,
      passage: type === 'passage_group' ? passage.trim() : undefined,
      subQuestions: type === 'passage_group' ? subQuestions : undefined,
    };

    onSave(questionData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#090d16] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#060910]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-500" />
              {isEditing ? 'Chỉnh sửa câu hỏi' : 'Tạo mới câu hỏi trong ngân hàng'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Hỗ trợ đầy đủ 9 dạng câu hỏi sư phạm, kiểm tra trùng lặp và xem trước tức thời
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="flex items-center bg-[#0d1322] border border-slate-800 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  activeTab === 'edit'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Nhập liệu form
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  activeTab === 'preview'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Xem trước (Live Preview)
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
          {/* Duplicate alert if found */}
          {duplicateWarning && (
            <div className="p-3 bg-amber-950/30 border border-amber-500/50 rounded-xl text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div className="text-xs leading-relaxed">{duplicateWarning}</div>
            </div>
          )}

          {/* Validation errors */}
          {errors.length > 0 && (
            <div className="p-3 bg-rose-950/30 border border-rose-500/50 rounded-xl text-rose-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-400">
                <AlertTriangle className="w-4 h-4" /> Vui lòng kiểm tra lại thông tin:
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-1">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'edit' ? (
            <>
              {/* Kiểu câu hỏi dropdown matching user screenshot */}
              <div className="space-y-2">
                <label className="font-bold text-slate-300 block uppercase tracking-wider text-[11px]">
                  Kiểu câu hỏi
                </label>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-[#060910] border-2 border-cyan-400 rounded-lg text-white font-medium text-xs sm:text-sm shadow-lg shadow-cyan-500/10 hover:border-cyan-300 transition cursor-pointer"
                  >
                    <span className="font-medium">
                      {QUESTION_TYPES.find((t) => t.type === type)?.label || 'Tự luận'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-300 transition-transform duration-200 ${
                        isTypeDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isTypeDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#060910] border border-cyan-500/60 rounded-lg shadow-2xl py-1 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                      {QUESTION_TYPES.map((opt) => {
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

              {/* General Metadata */}
              <div className="space-y-2">
                <label className="font-bold text-slate-300 block uppercase tracking-wider text-[11px]">
                  2. Thông tin phân loại & điểm số:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#060910] p-4 rounded-xl border border-slate-800">
                  <div>
                    <label className="text-slate-400 block mb-1">Môn học *</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100"
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Khối lớp *</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100"
                    >
                      {GRADES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Mức độ tư duy *</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
                      className="w-full px-2.5 py-1.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100"
                    >
                      <option value="knowledge">Nhận biết</option>
                      <option value="comprehension">Thông hiểu</option>
                      <option value="application">Vận dụng</option>
                      <option value="high_application">Vận dụng cao</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Chủ đề kiến thức</label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Ví dụ: Đạo hàm, Mệnh đề..."
                      className="w-full px-2.5 py-1.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Chương / Bài</label>
                    <input
                      type="text"
                      value={chapter}
                      onChange={(e) => setChapter(e.target.value)}
                      placeholder="Ví dụ: Chương 1 Bài 2"
                      className="w-full px-2.5 py-1.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100"
                    />
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
                      className="w-full px-2.5 py-1.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Trạng thái duyệt</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as QuestionStatus)}
                      className="w-full px-2.5 py-1.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100"
                    >
                      <option value="approved">Đã duyệt (Chính thức)</option>
                      <option value="pending">Chờ duyệt</option>
                      <option value="draft">Bản nháp</option>
                      <option value="archived">Lưu trữ</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Question Content */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block uppercase tracking-wider text-[11px]">
                  3. Nội dung đề bài *
                </label>
                <textarea
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Nhập nội dung đề bài câu hỏi tại đây..."
                  className="w-full p-3 bg-[#060910] border border-slate-800 rounded-xl text-slate-100 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Dynamic Form based on Type */}
              <div className="space-y-3 p-4 bg-[#060910] border border-slate-800 rounded-xl">
                {/* 1 & 2: Options for Single / Multiple Choice */}
                {(type === 'single_choice' || type === 'multiple_choice') && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300">
                        {type === 'single_choice'
                          ? 'Phương án lựa chọn (Chọn 1 đáp án đúng bằng nút tròn):'
                          : 'Phương án lựa chọn (Tick chọn các đáp án đúng bằng ô vuông):'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOptions([...options, `Phương án mới ${options.length + 1}`])}
                        className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5" /> Thêm phương án
                      </button>
                    </div>

                    <div className="space-y-2">
                      {options.map((opt, idx) => {
                        const letter = String.fromCharCode(65 + idx);
                        const isCorrectSingle = correctAnswer === idx;
                        const isCorrectMulti = correctAnswers.includes(idx);

                        return (
                          <div key={idx} className="flex items-center gap-2">
                            {type === 'single_choice' ? (
                              <input
                                type="radio"
                                name="single_correct"
                                checked={isCorrectSingle}
                                onChange={() => setCorrectAnswer(idx)}
                                className="w-4 h-4 text-blue-600 cursor-pointer"
                              />
                            ) : (
                              <input
                                type="checkbox"
                                checked={isCorrectMulti}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setCorrectAnswers([...correctAnswers, idx]);
                                  } else {
                                    setCorrectAnswers(correctAnswers.filter((i) => i !== idx));
                                  }
                                }}
                                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                              />
                            )}

                            <span className="font-mono font-bold text-slate-400 w-5">{letter}.</span>

                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const next = [...options];
                                next[idx] = e.target.value;
                                setOptions(next);
                              }}
                              className="flex-1 px-3 py-1.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100"
                            />

                            {options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                                className="p-1 text-slate-500 hover:text-rose-400 transition"
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

                {/* 3: True / False Group */}
                {type === 'true_false_group' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300">
                        Danh sách mệnh đề và nhãn Đúng / Sai:
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
                            value={st.text}
                            placeholder="Nhập nội dung mệnh đề..."
                            onChange={(e) => {
                              const next = [...statements];
                              next[idx].text = e.target.value;
                              setStatements(next);
                            }}
                            className="flex-1 px-3 py-1.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100"
                          />

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...statements];
                                next[idx].isCorrect = true;
                                setStatements(next);
                              }}
                              className={`px-2 py-1 rounded font-bold text-[11px] ${
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
                              className={`px-2 py-1 rounded font-bold text-[11px] ${
                                !st.isCorrect ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              SAI
                            </button>
                          </div>

                          {statements.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setStatements(statements.filter((_, i) => i !== idx))
                              }
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

                {/* 4: Matching */}
                {type === 'matching' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300">
                        Cấu hình các cặp ghép đôi chuẩn:
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setMatchingPairs([
                            ...matchingPairs,
                            { id: `p_${matchingPairs.length + 1}`, left: '', right: '' },
                          ])
                        }
                        className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5" /> Thêm cặp ghép
                      </button>
                    </div>

                    <div className="space-y-2">
                      {matchingPairs.map((pair, idx) => (
                        <div key={pair.id} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder={`Vế A${idx + 1}`}
                            value={pair.left}
                            onChange={(e) => {
                              const next = [...matchingPairs];
                              next[idx].left = e.target.value;
                              setMatchingPairs(next);
                            }}
                            className="px-3 py-1.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder={`Vế B${idx + 1} (Tương ứng)`}
                              value={pair.right}
                              onChange={(e) => {
                                const next = [...matchingPairs];
                                next[idx].right = e.target.value;
                                setMatchingPairs(next);
                              }}
                              className="flex-1 px-3 py-1.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100"
                            />
                            {matchingPairs.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setMatchingPairs(matchingPairs.filter((_, i) => i !== idx))
                                }
                                className="p-1 text-slate-500 hover:text-rose-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5: Ordering */}
                {type === 'ordering' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300">
                        Các phần tử và thứ tự chuẩn (1, 2, 3...):
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setOrderingItems([
                            ...orderingItems,
                            {
                              id: `ord_${orderingItems.length + 1}`,
                              text: '',
                              correctIndex: orderingItems.length + 1,
                            },
                          ])
                        }
                        className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5" /> Thêm phần tử
                      </button>
                    </div>

                    <div className="space-y-2">
                      {orderingItems.map((item, idx) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={item.correctIndex}
                            onChange={(e) => {
                              const next = [...orderingItems];
                              next[idx].correctIndex = Number(e.target.value);
                              setOrderingItems(next);
                            }}
                            className="w-16 px-2 py-1.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100 text-center font-mono"
                          />
                          <input
                            type="text"
                            placeholder="Nội dung giai đoạn / phần tử..."
                            value={item.text}
                            onChange={(e) => {
                              const next = [...orderingItems];
                              next[idx].text = e.target.value;
                              setOrderingItems(next);
                            }}
                            className="flex-1 px-3 py-1.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100"
                          />
                          {orderingItems.length > 2 && (
                            <button
                              type="button"
                              onClick={() =>
                                setOrderingItems(orderingItems.filter((_, i) => i !== idx))
                              }
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

                {/* 6: Fill Blank */}
                {type === 'fill_blank' && (
                  <div className="space-y-3">
                    <label className="font-bold text-slate-300 block">
                      Đoạn văn chứa vị trí trống (Dùng ký hiệu [blank_1], [blank_2]...):
                    </label>
                    <textarea
                      rows={3}
                      value={templateText}
                      onChange={(e) => setTemplateText(e.target.value)}
                      className="w-full p-2.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100"
                    />

                    <span className="font-bold text-slate-400 block pt-1">
                      Khai báo đáp án chấp nhận cho từng chỗ trống:
                    </span>
                    {blanks.map((b, idx) => (
                      <div key={b.id} className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-400 w-16">[{b.id}]:</span>
                        <input
                          type="text"
                          placeholder="Các đáp án cách nhau bằng dấu phẩy (,)"
                          value={b.acceptedAnswers.join(', ')}
                          onChange={(e) => {
                            const next = [...blanks];
                            next[idx].acceptedAnswers = e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean);
                            setBlanks(next);
                          }}
                          className="flex-1 px-3 py-1.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* 7: Short Answer */}
                {type === 'short_answer' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Đáp án mẫu chính thức *</label>
                      <input
                        type="text"
                        value={sampleAnswer}
                        onChange={(e) => setSampleAnswer(e.target.value)}
                        placeholder="Ví dụ: Trạng thái cân bằng"
                        className="w-full px-3 py-1.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">
                        Các biến thể chấp nhận được khác (cách nhau bởi dấu phẩy):
                      </label>
                      <input
                        type="text"
                        value={variationsInput}
                        onChange={(e) => setVariationsInput(e.target.value)}
                        placeholder="Ví dụ: cân bằng, trạng thái cực trị"
                        className="w-full px-3 py-1.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100"
                      />
                    </div>
                  </div>
                )}

                {/* 8: Essay */}
                {type === 'essay' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-400 block mb-1">
                        Hướng dẫn chấm & Thang điểm (Rubric):
                      </label>
                      <textarea
                        rows={3}
                        value={rubric}
                        onChange={(e) => setRubric(e.target.value)}
                        placeholder="Khai báo tiêu chí chấm điểm chi tiết..."
                        className="w-full p-2.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Bài làm gợi ý / Lời giải mẫu:</label>
                      <textarea
                        rows={3}
                        value={suggestedAnswer}
                        onChange={(e) => setSuggestedAnswer(e.target.value)}
                        placeholder="Nội dung bài làm gợi ý chuẩn..."
                        className="w-full p-2.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100"
                      />
                    </div>
                  </div>
                )}

                {/* 9: Passage Group */}
                {type === 'passage_group' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-400 block mb-1 font-bold">
                        Đoạn văn / Tình huống đề bài chung:
                      </label>
                      <textarea
                        rows={4}
                        value={passage}
                        onChange={(e) => setPassage(e.target.value)}
                        placeholder="Dán nội dung bài đọc, tình huống thực tế hoặc case study..."
                        className="w-full p-2.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100"
                      />
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-300">
                          Các câu hỏi con liên kết ({subQuestions.length}):
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setSubQuestions([
                              ...subQuestions,
                              {
                                id: `sub_${subQuestions.length + 1}`,
                                type: 'single_choice',
                                content: `Câu hỏi con ${subQuestions.length + 1}`,
                                options: ['A', 'B', 'C', 'D'],
                                correctAnswer: 0,
                                points: 1.0,
                              },
                            ])
                          }
                          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          <Plus className="w-3.5 h-3.5" /> Thêm câu hỏi con
                        </button>
                      </div>

                      <div className="space-y-3">
                        {subQuestions.map((sub, sIdx) => (
                          <div
                            key={sub.id}
                            className="p-3 bg-[#090d16] border border-slate-700 rounded-lg space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-cyan-400 font-mono">
                                Câu {sIdx + 1}:
                              </span>
                              {subQuestions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSubQuestions(subQuestions.filter((_, i) => i !== sIdx))
                                  }
                                  className="text-slate-500 hover:text-rose-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              value={sub.content}
                              onChange={(e) => {
                                const next = [...subQuestions];
                                next[sIdx].content = e.target.value;
                                setSubQuestions(next);
                              }}
                              className="w-full px-2.5 py-1.5 bg-[#060910] border border-slate-800 rounded text-slate-100"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Explanation & Tags */}
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1 uppercase tracking-wider text-[11px]">
                    4. Lời giải & Giải thích chi tiết
                  </label>
                  <textarea
                    rows={2}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Giải thích vì sao đáp án đúng, phương pháp tư duy..."
                    className="w-full p-2.5 bg-[#060910] border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Thẻ tags (phân cách bằng dấu phẩy)</label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="Mệnh đề, Số thực, Đạo hàm..."
                      className="w-full px-3 py-1.5 bg-[#060910] border border-slate-800 rounded-lg text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Tài liệu nguồn trích dẫn</label>
                    <input
                      type="text"
                      value={sourceDocument}
                      onChange={(e) => setSourceDocument(e.target.value)}
                      placeholder="SGK Toán 10 Cánh Diều, Đề thi THPT 2025..."
                      className="w-full px-3 py-1.5 bg-[#060910] border border-slate-800 rounded-lg text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Live Preview Tab */
            <div className="p-4 bg-[#060910] rounded-xl border border-slate-800 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-mono text-cyan-400 font-bold">{code || 'QB-MAU-001'}</span>
                <span className="text-amber-400 font-mono font-bold">{points} điểm</span>
              </div>
              <div className="font-medium text-slate-100 text-sm whitespace-pre-line leading-relaxed">
                {content || '(Chưa nhập nội dung đề bài)'}
              </div>

              {type === 'single_choice' && (
                <div className="grid grid-cols-1 gap-2 pt-2">
                  {options.map((opt, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-lg border text-xs flex items-center gap-2.5 ${
                        correctAnswer === i
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                          : 'bg-[#090d16] border-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="font-mono font-bold w-5">{String.fromCharCode(65 + i)}.</span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              )}

              {explanation && (
                <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-lg text-blue-200">
                  <span className="font-bold block text-blue-400">Lời giải:</span> {explanation}
                </div>
              )}
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold transition"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition"
            >
              <Save className="w-4 h-4" /> {isEditing ? 'Cập nhật câu hỏi' : 'Lưu vào ngân hàng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
