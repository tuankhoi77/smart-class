import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  Globe,
  FileText,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Check,
  Ban,
  Edit,
  Layers,
  HelpCircle,
  Eye,
  Trash2,
} from 'lucide-react';
import { BankQuestion, BankQuestionType, QuestionDifficulty } from '../../../../types/questionBank';
import { findClosestDuplicate } from '../../../../services/duplicateDetector';

interface Tab2AIGenerateProps {
  existingQuestions: BankQuestion[];
  onSaveApproved: (questions: BankQuestion[]) => void;
}

const QUESTION_TYPES = [
  { type: 'single_choice' as BankQuestionType, label: 'Trắc nghiệm 1 đáp án' },
  { type: 'multiple_choice' as BankQuestionType, label: 'Nhiều đáp án' },
  { type: 'true_false_group' as BankQuestionType, label: 'Đúng / Sai từng ý' },
  { type: 'fill_blank' as BankQuestionType, label: 'Điền khuyết' },
  { type: 'short_answer' as BankQuestionType, label: 'Trả lời ngắn' },
  { type: 'essay' as BankQuestionType, label: 'Tự luận' },
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

export const Tab2AIGenerate: React.FC<Tab2AIGenerateProps> = ({
  existingQuestions,
  onSaveApproved,
}) => {
  // 5 Input Sources: curriculum, image, web_link, pdf_word, topic
  const [sourceType, setSourceType] = useState<
    'curriculum' | 'image' | 'web_link' | 'pdf_word' | 'topic'
  >('curriculum');

  // Input states
  const [topic, setTopic] = useState('Khảo sát hàm số và tính đơn điệu');
  const [curriculumText, setCurriculumText] = useState(
    'Bài 1: Tính đơn điệu của hàm số. Mục tiêu: Nhận biết tính đồng biến, nghịch biến qua đạo hàm y\' >= 0 hoặc y\' <= 0. Tìm các khoảng đơn điệu của hàm số bậc ba, hàm phân thức.'
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [webUrl, setWebUrl] = useState('https://vi.wikipedia.org/wiki/H%C3%A0m_s%E1%BB%91_%C4%91%C6%A1n_%C4%91i%E1%BB%87u');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docText, setDocText] = useState('');
  const [guidance, setGuidance] = useState('Soạn câu hỏi trọng tâm, bám sát sách giáo khoa mới, có tính phân loại rõ rệt.');

  // Configuration
  const [subject, setSubject] = useState('Toán học');
  const [grade, setGrade] = useState('Lớp 10');
  const [chapter, setChapter] = useState('Chương 1: Ứng dụng đạo hàm');
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

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiReal, setIsAiReal] = useState<boolean>(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<
    Array<{
      question: BankQuestion;
      approved: boolean;
      rejected: boolean;
      duplicateWarning?: string;
    }>
  >([]);

  // Inline edit state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editExplanation, setEditExplanation] = useState('');

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Doc/PDF Upload
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocFile(file);
    try {
      const text = await file.text();
      setDocText(text.slice(0, 3000));
    } catch (err) {
      console.warn('Cannot read doc as text, using filename:', err);
      setDocText(`Tài liệu đính kèm: ${file.name}`);
    }
  };

  // Call AI Endpoint
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      let documentContext = '';
      if (sourceType === 'curriculum') documentContext = curriculumText;
      else if (sourceType === 'pdf_word') documentContext = docText;
      else if (sourceType === 'web_link') documentContext = `URL tài liệu: ${webUrl}`;

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
          sourceType,
          documentContext,
          imageData: sourceType === 'image' ? imageBase64 : '',
          imageMimeType: imageFile?.type || 'image/jpeg',
          webUrl: sourceType === 'web_link' ? webUrl : '',
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Lỗi khi sinh câu hỏi AI');
      }

      setIsAiReal(!!data.isAiReal);

      const rawList: any[] = data.questions || [];
      const prepared = rawList.map((q: any, idx: number) => {
        const dupMatch = findClosestDuplicate({ content: q.content }, existingQuestions, 75);
        const dupWarn = dupMatch
          ? `Nghi trùng ${dupMatch.similarityScore}% với câu [${dupMatch.existingQuestion.code}] trong ngân hàng.`
          : undefined;

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
          tags: Array.isArray(q.tags) ? q.tags : [subject, 'AI Generated'],
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
          explanation: q.explanation || '',
          sourceDocument:
            sourceType === 'image'
              ? `Ảnh: ${imageFile?.name || 'Đề thi'}`
              : sourceType === 'web_link'
              ? webUrl
              : sourceType === 'pdf_word'
              ? `Tệp: ${docFile?.name || 'Tài liệu'}`
              : 'Giáo án sư phạm',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return {
          question: bankQ,
          approved: true, // Pre-selected for convenience
          rejected: false,
          duplicateWarning: dupWarn,
        };
      });

      setGeneratedQuestions(prepared);
    } catch (err: any) {
      console.error('AI Generation error:', err);
      alert('Không thể tạo câu hỏi: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleApprove = (idx: number) => {
    setGeneratedQuestions((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, approved: !item.approved, rejected: false } : item))
    );
  };

  const toggleReject = (idx: number) => {
    setGeneratedQuestions((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, rejected: !item.rejected, approved: false } : item))
    );
  };

  const handleSaveInline = (idx: number) => {
    setGeneratedQuestions((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              question: {
                ...item.question,
                content: editContent,
                explanation: editExplanation,
              },
            }
          : item
      )
    );
    setEditingIndex(null);
  };

  const handleSaveToBank = () => {
    const approved = generatedQuestions
      .filter((q) => q.approved && !q.rejected)
      .map((q) => ({ ...q.question, status: 'approved' as const }));

    if (approved.length === 0) {
      alert('Vui lòng chọn Duyệt ít nhất một câu hỏi trước khi lưu.');
      return;
    }

    onSaveApproved(approved);
    setGeneratedQuestions([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Compact Source Selector & AI Status Bar */}
      <div className="bg-[#090d16] border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Source Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setSourceType('curriculum')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              sourceType === 'curriculum'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-300" /> Giáo án
          </button>

          <button
            type="button"
            onClick={() => setSourceType('image')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              sourceType === 'image'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-300" /> File ảnh
          </button>

          <button
            type="button"
            onClick={() => setSourceType('web_link')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              sourceType === 'web_link'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-amber-300" /> Link web
          </button>

          <button
            type="button"
            onClick={() => setSourceType('pdf_word')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              sourceType === 'pdf_word'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-300" /> PDF / Word
          </button>

          <button
            type="button"
            onClick={() => setSourceType('topic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              sourceType === 'topic'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-300" /> Chủ đề
          </button>
        </div>

        {/* AI Status */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Gemini 3.8 Flash Online
          </span>
        </div>
      </div>

      {/* Source Specific Input Box */}
      <div className="p-4 sm:p-5 bg-[#090d16] border border-slate-800 rounded-xl space-y-3">
        {/* Source: Curriculum */}
        {sourceType === 'curriculum' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              Nội dung Giáo án / Trích dẫn SGK cần soạn câu hỏi:
            </label>
            <textarea
              rows={4}
              value={curriculumText}
              onChange={(e) => setCurriculumText(e.target.value)}
              placeholder="Dán nội dung bài học, định lý, công thức hoặc mục tiêu cần kiểm tra..."
              className="w-full p-3 bg-[#060910] border border-slate-800 rounded-xl text-slate-100 text-xs leading-relaxed outline-none focus:border-cyan-500"
            />
          </div>
        )}

        {/* Source: Image */}
        {sourceType === 'image' && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 block">
              Tải lên hình ảnh đề bài / bài tập (Gemini Vision OCR):
            </label>
            <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-6 text-center bg-[#060910] transition">
              {imageBase64 ? (
                <div className="space-y-3">
                  <img
                    src={imageBase64}
                    alt="Uploaded preview"
                    className="max-h-48 mx-auto rounded-lg border border-slate-700 object-contain"
                  />
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs text-emerald-400 font-mono font-bold">
                      ✓ Đã tải ảnh: {imageFile?.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImageBase64('');
                      }}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-2">
                  <Upload className="w-8 h-8 text-emerald-400 mx-auto" />
                  <span className="text-xs font-bold text-slate-300 block">
                    Bấm để chọn tệp hình ảnh (.png, .jpg, .jpeg, .webp)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <span className="text-[11px] text-slate-500 block">
                    Tối đa 5MB. AI sẽ trích xuất chữ và công thức từ hình ảnh
                  </span>
                </label>
              )}
            </div>
          </div>
        )}

        {/* Source: Web URL */}
        {sourceType === 'web_link' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              Nhập đường dẫn trang web tài liệu học tập (URL):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3.5 py-2.5 bg-[#060910] border border-slate-800 rounded-xl text-slate-100 text-xs font-mono outline-none focus:border-cyan-500"
              />
            </div>
            <span className="text-[11px] text-slate-500 block">
              AI sẽ phân tích kiến thức từ trang web học liệu để thiết kế các câu hỏi tương ứng
            </span>
          </div>
        )}

        {/* Source: PDF / Word */}
        {sourceType === 'pdf_word' && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 block">
              Tải lên tệp tài liệu PDF hoặc Word (.docx / .doc):
            </label>
            <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-6 text-center bg-[#060910] transition">
              {docFile ? (
                <div className="space-y-2">
                  <FileText className="w-8 h-8 text-purple-400 mx-auto" />
                  <span className="text-xs text-purple-300 font-bold block">
                    ✓ Đã chọn: {docFile.name} ({(docFile.size / 1024).toFixed(1)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setDocFile(null);
                      setDocText('');
                    }}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Chọn tệp khác
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-2">
                  <Upload className="w-8 h-8 text-purple-400 mx-auto" />
                  <span className="text-xs font-bold text-slate-300 block">
                    Bấm để tải tệp PDF hoặc tài liệu Word
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleDocUpload}
                    className="hidden"
                  />
                  <span className="text-[11px] text-slate-500 block">
                    Hỗ trợ .pdf, .docx, .doc, .txt tối đa 10MB
                  </span>
                </label>
              )}
            </div>
          </div>
        )}

        {/* Common Topic & Guidance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Tên chuyên đề / Bài học:
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Nhập tên bài học..."
              className="w-full px-3 py-1.5 bg-[#060910] border border-slate-800 rounded-lg text-slate-100 text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Hướng dẫn / Yêu cầu bổ sung cho AI:
            </label>
            <input
              type="text"
              value={guidance}
              onChange={(e) => setGuidance(e.target.value)}
              placeholder="Ví dụ: Nhấn mạnh vào ứng dụng thực tiễn..."
              className="w-full px-3 py-1.5 bg-[#060910] border border-slate-800 rounded-lg text-slate-100 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Configuration Box */}
      <div className="p-4 sm:p-5 bg-[#090d16] border border-slate-800 rounded-xl space-y-4">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          2. Cấu hình Môn học, Khối lớp & Dạng câu hỏi:
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Môn học</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#060910] border border-slate-800 rounded-lg text-slate-100"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Khối lớp</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#060910] border border-slate-800 rounded-lg text-slate-100"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Chương / Bài</label>
            <input
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#060910] border border-slate-800 rounded-lg text-slate-100"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Số lượng câu (1 - 10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-[#060910] border border-slate-800 rounded-lg text-slate-100 font-mono font-bold"
            />
          </div>
        </div>

        {/* Question Types Checkboxes */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-400 block">Các dạng câu hỏi muốn sinh:</span>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {QUESTION_TYPES.map((t) => {
              const isChecked = selectedTypes.includes(t.type);
              return (
                <label
                  key={t.type}
                  className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer text-xs transition ${
                    isChecked
                      ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                      : 'bg-[#060910] border-slate-800 text-slate-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTypes([...selectedTypes, t.type]);
                      } else {
                        if (selectedTypes.length > 1) {
                          setSelectedTypes(selectedTypes.filter((x) => x !== t.type));
                        }
                      }
                    }}
                    className="w-3.5 h-3.5 text-blue-600 rounded"
                  />
                  <span className="truncate">{t.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" /> Đang phân tích và sinh câu hỏi...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" /> Bắt đầu tạo câu hỏi bằng AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Review & Approve Section */}
      {generatedQuestions.length > 0 && (
        <div className="bg-[#090d16] border border-slate-800 rounded-xl p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Kết quả sinh câu hỏi ({generatedQuestions.length} câu)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Kiểm tra câu hỏi, đáp án, chỉnh sửa nếu cần và bấm Duyệt trước khi lưu chính thức
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setGeneratedQuestions((prev) =>
                    prev.map((q) => ({ ...q, approved: true, rejected: false }))
                  )
                }
                className="px-3 py-1.5 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold hover:bg-emerald-600/30 transition"
              >
                Duyệt tất cả
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Sinh lại
              </button>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-3">
            {generatedQuestions.map((item, idx) => {
              const q = item.question;
              const isEditing = editingIndex === idx;

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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded text-[11px]">
                        Câu {idx + 1}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                        {q.type}
                      </span>
                      <span className="text-[11px] font-bold text-amber-400">{q.points}đ</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleApprove(idx)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                          item.approved
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-emerald-300'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" /> {item.approved ? 'Đã duyệt' : 'Duyệt'}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleReject(idx)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                          item.rejected
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-rose-300'
                        }`}
                      >
                        <Ban className="w-3.5 h-3.5" /> {item.rejected ? 'Từ chối' : 'Bỏ qua'}
                      </button>

                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingIndex(idx);
                            setEditContent(q.content);
                            setEditExplanation(q.explanation || '');
                          }}
                          className="p-1 text-slate-400 hover:text-cyan-400"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {item.duplicateWarning && (
                    <div className="p-2 bg-amber-950/30 border border-amber-500/40 rounded-lg text-amber-300 flex items-center gap-1.5 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{item.duplicateWarning}</span>
                    </div>
                  )}

                  {isEditing ? (
                    <div className="space-y-2 p-3 bg-[#090d16] border border-blue-500/40 rounded-xl text-xs">
                      <textarea
                        rows={3}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 bg-[#060910] border border-slate-700 rounded text-slate-100"
                      />
                      <textarea
                        rows={2}
                        value={editExplanation}
                        onChange={(e) => setEditExplanation(e.target.value)}
                        placeholder="Lời giải chi tiết..."
                        className="w-full p-2 bg-[#060910] border border-slate-700 rounded text-slate-100"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingIndex(null)}
                          className="px-2.5 py-1 bg-slate-800 text-slate-400 rounded"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveInline(idx)}
                          className="px-3 py-1 bg-blue-600 text-white rounded font-bold"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-100 font-medium text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                      {q.content}
                    </div>
                  )}

                  {q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-lg border flex items-center gap-2 ${
                            q.correctAnswer === oIdx
                              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                              : 'bg-[#090d16] border-slate-800 text-slate-300'
                          }`}
                        >
                          <span className="font-mono font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                          <span>{opt}</span>
                          {q.correctAnswer === oIdx && (
                            <span className="text-[10px] ml-auto font-bold text-emerald-400">
                              Đáp án đúng
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.explanation && (
                    <div className="p-2.5 bg-blue-950/20 border border-blue-800/30 rounded-lg text-blue-200 text-xs">
                      <b className="text-blue-400">Lời giải chi tiết:</b> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Confirm Save to Bank */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Đã duyệt{' '}
              <b className="text-emerald-400 font-mono">
                {generatedQuestions.filter((q) => q.approved && !q.rejected).length}
              </b>{' '}
              / {generatedQuestions.length} câu hỏi
            </span>
            <button
              type="button"
              onClick={handleSaveToBank}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <Check className="w-4 h-4" /> Lưu các câu đã duyệt vào Ngân hàng câu hỏi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
