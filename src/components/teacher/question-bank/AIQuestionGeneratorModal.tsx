import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Upload,
  FileText,
  RefreshCw,
  Edit,
  Eye,
  Check,
  Ban,
  Layers,
  HelpCircle,
} from 'lucide-react';
import {
  BankQuestion,
  BankQuestionType,
  QuestionDifficulty,
} from '../../../types/questionBank';
import { findClosestDuplicate } from '../../../services/duplicateDetector';

interface AIQuestionGeneratorModalProps {
  existingQuestions: BankQuestion[];
  onClose: () => void;
  onSaveApproved: (approvedQuestions: BankQuestion[]) => void;
}

const QUESTION_TYPE_OPTIONS: Array<{ type: BankQuestionType; label: string }> = [
  { type: 'single_choice', label: 'Trắc nghiệm 1 đáp án' },
  { type: 'multiple_choice', label: 'Trắc nghiệm nhiều đáp án' },
  { type: 'true_false_group', label: 'Đúng / Sai theo từng ý' },
  { type: 'matching', label: 'Ghép đôi (Matching)' },
  { type: 'ordering', label: 'Sắp xếp thứ tự' },
  { type: 'fill_blank', label: 'Điền khuyết' },
  { type: 'short_answer', label: 'Trả lời ngắn' },
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

export const AIQuestionGeneratorModal: React.FC<AIQuestionGeneratorModalProps> = ({
  existingQuestions,
  onClose,
  onSaveApproved,
}) => {
  // Wizard current step: 1..4
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Source
  const [sourceType, setSourceType] = useState<'topic' | 'document'>('topic');
  const [topic, setTopic] = useState('Khảo sát hàm số và tính đơn điệu');
  const [documentText, setDocumentText] = useState('');
  const [guidance, setGuidance] = useState('Tập trung vào tính đồng biến, nghịch biến; tránh các bài toán chứa tham số m quá phức tạp.');

  // Step 2: Configuration
  const [subject, setSubject] = useState('Toán học');
  const [grade, setGrade] = useState('Lớp 10');
  const [chapter, setChapter] = useState('Chương 1: Mệnh đề và hàm số');
  const [questionCount, setQuestionCount] = useState(4);
  const [selectedTypes, setSelectedTypes] = useState<BankQuestionType[]>([
    'single_choice',
    'true_false_group',
    'short_answer',
  ]);
  const [difficultyDistribution, setDifficultyDistribution] = useState({
    knowledge: 25,
    comprehension: 50,
    application: 25,
    high_application: 0,
  });

  // Step 3 & 4: Generated Questions & Review
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAiReal, setIsAiReal] = useState<boolean>(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<
    Array<{
      question: BankQuestion;
      approved: boolean;
      rejected: boolean;
      duplicateWarning?: string;
      isModified?: boolean;
    }>
  >([]);

  // Inline edit state in Step 4
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editExplanation, setEditExplanation] = useState('');

  // Handle file upload in Step 1
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước tệp vượt quá giới hạn 5MB');
      return;
    }

    try {
      const text = await file.text();
      setDocumentText(text.slice(0, 3000));
      setSourceType('document');
    } catch (err) {
      console.error('Error reading file:', err);
    }
  };

  // Step 3: Trigger generation
  const handleGenerate = async () => {
    setStep(3);
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai/generate-question-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          subject,
          grade,
          chapter,
          questionCount,
          questionTypes: selectedTypes,
          difficultyDistribution,
          guidance,
          documentContext: sourceType === 'document' ? documentText : '',
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Lỗi khi gọi dịch vụ sinh câu hỏi');
      }

      setIsAiReal(!!data.isAiReal);

      // Validate schema and check duplicates
      const rawList: any[] = data.questions || [];
      const prepared = rawList.map((q: any, idx: number) => {
        const warnings: string[] = [];

        // Validation rule check
        if (!q.content) warnings.push('Thiếu nội dung câu hỏi.');
        if (q.type === 'single_choice') {
          if (!q.options || q.options.length < 2) warnings.push('Câu trắc nghiệm thiếu phương án lựa chọn.');
          if (q.correctAnswer === undefined || q.correctAnswer < 0) warnings.push('Chưa xác định đáp án đúng rõ ràng.');
        }

        // Duplicate check against existing bank
        const dupMatch = findClosestDuplicate({ content: q.content }, existingQuestions, 75);
        let dupWarn: string | undefined = undefined;
        if (dupMatch) {
          dupWarn = `Nghi trùng ${dupMatch.similarityScore}% với câu [${dupMatch.existingQuestion.code}] trong ngân hàng.`;
        }

        const bankQ: BankQuestion = {
          id: `qb_ai_${Date.now()}_${idx}`,
          code: q.code || `QB-AI-${Date.now().toString().slice(-4)}-${idx + 1}`,
          type: q.type || 'single_choice',
          content: q.content || 'Nội dung câu hỏi',
          grade,
          subject,
          chapter,
          topic,
          difficulty: q.difficulty || 'comprehension',
          points: Number(q.points) || 1.0,
          tags: Array.isArray(q.tags) ? q.tags : [subject, topic, 'AI Generated'],
          source: 'ai',
          author: 'AI Trợ lý Sư phạm',
          status: 'pending',
          options: q.options,
          correctAnswer: q.correctAnswer,
          correctAnswers: q.correctAnswers,
          statements: q.statements,
          matchingPairs: q.matchingPairs,
          orderingItems: q.orderingItems,
          templateText: q.templateText,
          blanks: q.blanks,
          sampleAnswer: q.sampleAnswer,
          acceptedVariations: q.acceptedVariations,
          rubric: q.rubric,
          suggestedAnswer: q.suggestedAnswer,
          passage: q.passage,
          subQuestions: q.subQuestions,
          explanation: q.explanation || '',
          sourceDocument: sourceType === 'document' ? 'Tài liệu giáo viên tải lên' : undefined,
          warnings,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return {
          question: bankQ,
          approved: warnings.length === 0, // Auto pre-approve only if no critical schema errors
          rejected: false,
          duplicateWarning: dupWarn,
          isModified: false,
        };
      });

      setGeneratedQuestions(prepared);
      setStep(4);
    } catch (err: any) {
      console.error('Generation error:', err);
      setErrorMsg(err.message || 'Không thể kết nối đến máy chủ sinh AI');
      setStep(2);
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle approve / reject for item
  const toggleApprove = (idx: number) => {
    setGeneratedQuestions((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          const nextApproved = !item.approved;
          return {
            ...item,
            approved: nextApproved,
            rejected: nextApproved ? false : item.rejected,
          };
        }
        return item;
      })
    );
  };

  const toggleReject = (idx: number) => {
    setGeneratedQuestions((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          const nextRejected = !item.rejected;
          return {
            ...item,
            rejected: nextRejected,
            approved: nextRejected ? false : item.approved,
          };
        }
        return item;
      })
    );
  };

  // Save inline edit
  const handleSaveInlineEdit = (idx: number) => {
    setGeneratedQuestions((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          return {
            ...item,
            isModified: true,
            question: {
              ...item.question,
              content: editContent,
              explanation: editExplanation,
            },
          };
        }
        return item;
      })
    );
    setEditingIndex(null);
  };

  // Save all approved questions into Question Bank
  const handleConfirmSave = () => {
    const approvedList = generatedQuestions
      .filter((item) => item.approved && !item.rejected)
      .map((item) => ({
        ...item.question,
        status: 'approved' as const,
      }));

    if (approvedList.length === 0) {
      alert('Chưa có câu hỏi nào được chọn Duyệt! Vui lòng tích duyệt ít nhất 1 câu hỏi.');
      return;
    }

    onSaveApproved(approvedList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#090d16] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Wizard Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#060910]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  AI Trợ lý Soạn câu hỏi & Đề cương
                </h2>
                {isAiReal ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    Gemini 3.8 Flash Online
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                    Sư phạm Thích ứng
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Quy trình 4 bước: Nguồn học liệu → Cấu hình phân bố → Kiểm tra schema → Giáo viên duyệt
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Progress Bar */}
        <div className="bg-[#070b13] px-6 py-2.5 border-b border-slate-800/80 flex items-center justify-between text-xs">
          {[
            { stepNum: 1, label: '1. Chọn nguồn' },
            { stepNum: 2, label: '2. Cấu hình bộ câu' },
            { stepNum: 3, label: '3. Sinh & Kiểm tra' },
            { stepNum: 4, label: '4. Giáo viên duyệt' },
          ].map((item) => (
            <div
              key={item.stepNum}
              className={`flex items-center gap-1.5 font-semibold ${
                step === item.stepNum
                  ? 'text-cyan-400 font-bold'
                  : step > item.stepNum
                  ? 'text-emerald-400'
                  : 'text-slate-500'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step === item.stepNum
                    ? 'bg-cyan-500 text-slate-950'
                    : step > item.stepNum
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {step > item.stepNum ? '✓' : item.stepNum}
              </span>
              <span className="hidden sm:inline">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Wizard Step Contents */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-950/30 border border-rose-500/50 rounded-xl text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: CHỌN NGUỒN */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-100 block">
                  Bước 1: Chọn nguồn tài liệu & Mục tiêu học tập
                </span>
                <p className="text-slate-400">
                  Bạn có thể nhập chủ đề kiến thức hoặc tải lên bài học / giáo án để AI trích xuất nội dung
                </p>
              </div>

              {/* Source Mode Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setSourceType('topic')}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    sourceType === 'topic'
                      ? 'bg-blue-600/15 border-blue-500 text-blue-200'
                      : 'bg-[#060910] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>Nhập chủ đề kiến thức</span>
                    {sourceType === 'topic' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Nhập tên bài học, khái niệm trọng tâm hoặc mục tiêu cần kiểm tra
                  </p>
                </div>

                <div
                  onClick={() => setSourceType('document')}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    sourceType === 'document'
                      ? 'bg-blue-600/15 border-blue-500 text-blue-200'
                      : 'bg-[#060910] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>Tải lên tài liệu / Dán văn bản</span>
                    {sourceType === 'document' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Đính kèm file giáo án (.txt, .docx, .json) hoặc dán đoạn văn bản
                  </p>
                </div>
              </div>

              {/* Content input for topic */}
              {sourceType === 'topic' ? (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">
                    Tên chủ đề / Mục tiêu cần kiểm tra *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ví dụ: Định lý Viète và ứng dụng, Phản ứng thế Halogen, Tây Tiến..."
                    className="w-full px-3.5 py-2.5 bg-[#060910] border border-slate-800 rounded-xl text-slate-100 text-sm outline-none focus:border-cyan-500"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 text-center bg-[#060910] transition">
                    <Upload className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                    <label className="font-semibold text-slate-300 block cursor-pointer">
                      <span>Bấm để tải file tài liệu (txt, docx, json)</span>
                      <input
                        type="file"
                        accept=".txt,.doc,.docx,.json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Giới hạn kích thước tối đa 5MB
                    </span>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">
                      Hoặc dán trực tiếp nội dung văn bản bài học:
                    </label>
                    <textarea
                      rows={4}
                      value={documentText}
                      onChange={(e) => setDocumentText(e.target.value)}
                      placeholder="Dán nội dung bài giảng, tóm tắt lý thuyết tại đây..."
                      className="w-full p-3 bg-[#060910] border border-slate-800 rounded-xl text-slate-100 font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Teacher Guidance / Constraints */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">
                  Hướng dẫn & Lưu ý sư phạm (Tùy chọn):
                </label>
                <textarea
                  rows={2}
                  value={guidance}
                  onChange={(e) => setGuidance(e.target.value)}
                  placeholder="Ví dụ: Soạn đề thi bám sát cấu trúc mới, có tình huống thực tế, tránh các câu hỏi học vẹt..."
                  className="w-full p-3 bg-[#060910] border border-slate-800 rounded-xl text-slate-100 text-xs outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: CẤU HÌNH BỘ CÂU HỎI */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-100 block">
                  Bước 2: Cấu hình Khối môn & Phân bố câu hỏi
                </span>
                <p className="text-slate-400">
                  Thiết lập môn học, khối lớp, số lượng và các dạng câu hỏi bạn mong muốn AI tạo ra
                </p>
              </div>

              {/* Basic selection grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#060910] p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Môn học</label>
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
                  <label className="text-slate-400 block mb-1 font-semibold">Khối lớp</label>
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
                  <label className="text-slate-400 block mb-1 font-semibold">Chương / Bài</label>
                  <input
                    type="text"
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    placeholder="Chương 1..."
                    className="w-full px-2.5 py-1.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Số lượng câu (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Question Types checkboxes */}
              <div className="space-y-2">
                <label className="font-bold text-slate-300 block uppercase tracking-wider text-[11px]">
                  Các dạng câu hỏi muốn AI tạo ra (Chọn ít nhất 1 dạng):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {QUESTION_TYPE_OPTIONS.map((t) => {
                    const isChecked = selectedTypes.includes(t.type);
                    return (
                      <div
                        key={t.type}
                        onClick={() => {
                          if (isChecked) {
                            if (selectedTypes.length > 1) {
                              setSelectedTypes(selectedTypes.filter((x) => x !== t.type));
                            }
                          } else {
                            setSelectedTypes([...selectedTypes, t.type]);
                          }
                        }}
                        className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition ${
                          isChecked
                            ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                            : 'bg-[#060910] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          className="w-3.5 h-3.5 text-blue-600 rounded"
                        />
                        <span className="font-medium truncate">{t.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Distribution */}
              <div className="space-y-2">
                <label className="font-bold text-slate-300 block uppercase tracking-wider text-[11px]">
                  Phân bố mức độ tư duy (Tổng = 100%):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#060910] p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-sky-400 font-semibold block mb-1">Nhận biết (%)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={difficultyDistribution.knowledge}
                      onChange={(e) =>
                        setDifficultyDistribution({
                          ...difficultyDistribution,
                          knowledge: Number(e.target.value),
                        })
                      }
                      className="w-full px-2.5 py-1 bg-[#090d16] border border-slate-700 rounded text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-emerald-400 font-semibold block mb-1">Thông hiểu (%)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={difficultyDistribution.comprehension}
                      onChange={(e) =>
                        setDifficultyDistribution({
                          ...difficultyDistribution,
                          comprehension: Number(e.target.value),
                        })
                      }
                      className="w-full px-2.5 py-1 bg-[#090d16] border border-slate-700 rounded text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-amber-400 font-semibold block mb-1">Vận dụng (%)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={difficultyDistribution.application}
                      onChange={(e) =>
                        setDifficultyDistribution({
                          ...difficultyDistribution,
                          application: Number(e.target.value),
                        })
                      }
                      className="w-full px-2.5 py-1 bg-[#090d16] border border-slate-700 rounded text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-rose-400 font-semibold block mb-1">Vận dụng cao (%)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={difficultyDistribution.high_application}
                      onChange={(e) =>
                        setDifficultyDistribution({
                          ...difficultyDistribution,
                          high_application: Number(e.target.value),
                        })
                      }
                      className="w-full px-2.5 py-1 bg-[#090d16] border border-slate-700 rounded text-slate-100 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SINH & KIỂM TRA (LOADING) */}
          {step === 3 && (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Đang sinh bộ câu hỏi với AI...</h3>
                <p className="text-slate-400 max-w-md mx-auto text-xs">
                  Hệ thống đang cấu trúc hóa các phương án, lời giải, thang điểm và tự động đối chiếu quy tắc sư phạm
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: GIÁO VIÊN DUYỆT */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#060910] rounded-xl border border-slate-800">
                <div>
                  <span className="text-sm font-bold text-white block">
                    Bước 4: Kiểm tra & Phê duyệt câu hỏi ({generatedQuestions.length} câu)
                  </span>
                  <p className="text-slate-400 text-xs">
                    Vui lòng đối chiếu tài liệu nguồn, chỉnh sửa nếu cần và bấm Duyệt từng câu trước khi lưu
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedQuestions((prev) =>
                        prev.map((item) => ({ ...item, approved: true, rejected: false }))
                      );
                    }}
                    className="px-2.5 py-1 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-lg hover:bg-emerald-600/30 transition font-semibold"
                  >
                    Duyệt tất cả
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg flex items-center gap-1 transition"
                  >
                    <RefreshCw className="w-3 h-3" /> Sinh lại bộ mới
                  </button>
                </div>
              </div>

              {/* Questions review list */}
              <div className="space-y-3">
                {generatedQuestions.map((item, idx) => {
                  const q = item.question;
                  const isEditingThis = editingIndex === idx;

                  return (
                    <div
                      key={q.id || idx}
                      className={`p-4 rounded-xl border transition space-y-3 ${
                        item.approved
                          ? 'bg-[#060910] border-emerald-500/50'
                          : item.rejected
                          ? 'bg-rose-950/10 border-rose-500/30 opacity-60'
                          : 'bg-[#060910] border-slate-800'
                      }`}
                    >
                      {/* Item header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded text-[11px]">
                            Câu {idx + 1}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                            {q.type}
                          </span>
                          <span className="text-[11px] font-bold text-amber-400">{q.points} điểm</span>
                        </div>

                        {/* Approve / Reject buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleApprove(idx)}
                            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                              item.approved
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-800 text-slate-400 hover:text-emerald-300'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            {item.approved ? 'Đã duyệt' : 'Duyệt'}
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleReject(idx)}
                            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                              item.rejected
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-rose-300'
                            }`}
                          >
                            <Ban className="w-3.5 h-3.5" />
                            {item.rejected ? 'Từ chối' : 'Bỏ qua'}
                          </button>

                          {!isEditingThis && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingIndex(idx);
                                setEditContent(q.content);
                                setEditExplanation(q.explanation || '');
                              }}
                              className="p-1 text-slate-400 hover:text-cyan-400 transition"
                              title="Sửa nội dung"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Warnings / Duplicate alert */}
                      {item.duplicateWarning && (
                        <div className="p-2 bg-amber-950/30 border border-amber-500/40 rounded-lg text-amber-300 flex items-center gap-1.5 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{item.duplicateWarning}</span>
                        </div>
                      )}

                      {/* Content view / inline edit */}
                      {isEditingThis ? (
                        <div className="space-y-2 p-3 bg-[#090d16] border border-blue-500/40 rounded-xl">
                          <span className="font-bold text-blue-400 block">Chỉnh sửa nội dung đề bài:</span>
                          <textarea
                            rows={3}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-2.5 bg-[#060910] border border-slate-700 rounded text-slate-100"
                          />
                          <span className="font-bold text-blue-400 block pt-1">
                            Chỉnh sửa lời giải:
                          </span>
                          <textarea
                            rows={2}
                            value={editExplanation}
                            onChange={(e) => setEditExplanation(e.target.value)}
                            className="w-full p-2.5 bg-[#060910] border border-slate-700 rounded text-slate-100"
                          />
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingIndex(null)}
                              className="px-2.5 py-1 bg-slate-800 text-slate-400 rounded"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveInlineEdit(idx)}
                              className="px-3 py-1 bg-blue-600 text-white rounded font-bold"
                            >
                              Lưu thay đổi
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-100 font-medium whitespace-pre-line leading-relaxed text-sm">
                          {q.content}
                        </div>
                      )}

                      {/* Options rendering */}
                      {q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = q.correctAnswer === oIdx;
                            return (
                              <div
                                key={oIdx}
                                className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${
                                  isCorrect
                                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                                    : 'bg-[#090d16] border-slate-800 text-slate-300'
                                }`}
                              >
                                <span className="font-mono font-bold w-5">
                                  {String.fromCharCode(65 + oIdx)}.
                                </span>
                                <span>{opt}</span>
                                {isCorrect && (
                                  <span className="text-[10px] ml-auto font-bold text-emerald-400">
                                    Đáp án đúng
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Statements for True/False */}
                      {q.statements && (
                        <div className="space-y-1 pt-1">
                          {q.statements.map((st, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-2 bg-[#090d16] border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-cyan-400 font-bold">
                                  {String.fromCharCode(97 + sIdx)})
                                </span>
                                <span>{st.text}</span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  st.isCorrect
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-rose-500/20 text-rose-400'
                                }`}
                              >
                                {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Short answer / Sample */}
                      {q.sampleAnswer && (
                        <div className="p-2 bg-teal-950/20 border border-teal-800/40 rounded-lg text-teal-300 text-xs">
                          <b>Đáp án chuẩn:</b> {q.sampleAnswer}
                        </div>
                      )}

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="p-2.5 bg-blue-950/20 border border-blue-800/30 rounded-lg text-blue-200 text-xs">
                          <b className="text-blue-400">Lời giải chi tiết:</b> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-[#060910] flex items-center justify-between">
          {step > 1 && step !== 3 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold transition"
            >
              Hủy
            </button>
          )}

          {step === 1 && (
            <button
              type="button"
              onClick={() => {
                if (sourceType === 'topic' && !topic.trim()) {
                  alert('Vui lòng nhập tên chủ đề.');
                  return;
                }
                setStep(2);
              }}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition"
            >
              Tiếp tục: Cấu hình <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={handleGenerate}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" /> Bắt đầu sinh câu hỏi AI
            </button>
          )}

          {step === 4 && (
            <button
              type="button"
              onClick={handleConfirmSave}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition"
            >
              <Check className="w-4 h-4" /> Lưu các câu đã duyệt vào Ngân hàng
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
