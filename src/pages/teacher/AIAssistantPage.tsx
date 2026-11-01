import React, { useState } from 'react';
import {
  Sparkles,
  HelpCircle,
  BookOpen,
  UserCheck,
  BarChart,
  Check,
  Copy,
  Edit,
  Save,
  Loader2,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { useClass } from '../../contexts/ClassContext';
import { Quiz, QuizQuestion } from '../../types';

export const AIAssistantPage: React.FC = () => {
  const { classes, currentClassId, currentClass } = useClass();

  const [activeTab, setActiveTab] = useState<'quiz' | 'lesson_plan' | 'feedback' | 'analytics'>('quiz');
  const [loading, setLoading] = useState(false);

  // Tab 1: Quiz Generator state
  const [quizForm, setQuizForm] = useState({
    topic: 'Bất phương trình bậc nhất hai ẩn',
    subject: 'Toán học',
    grade: 'Khối 10',
    questionCount: 4,
    difficulty: 'Trung bình',
  });
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[]>([]);
  const [savedQuizSuccess, setSavedQuizSuccess] = useState(false);

  // Tab 2: Lesson Plan state
  const [lessonForm, setLessonForm] = useState({
    topic: 'Đồ thị và sự biến thiên của hàm số bậc hai',
    subject: 'Toán học',
    grade: 'Lớp 10',
    duration: 45,
  });
  const [generatedLessonPlan, setGeneratedLessonPlan] = useState('');

  // Tab 3: Student Feedback state
  const students = storage.getStudentsByClass(currentClassId || 'cls_10a1');
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [generatedFeedback, setGeneratedFeedback] = useState('');

  // Tab 4: Analytics
  const [analyticsText, setAnalyticsText] = useState('');

  // AI Quiz Generator Call
  const handleGenerateQuiz = async () => {
    setLoading(true);
    setSavedQuizSuccess(false);
    try {
      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizForm),
      });
      const data = await res.json();
      if (data.success && data.questions) {
        setGeneratedQuestions(data.questions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // AI Lesson Plan Call
  const handleGenerateLessonPlan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonForm),
      });
      const data = await res.json();
      if (data.success && data.content) {
        setGeneratedLessonPlan(data.content);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // AI Feedback Call
  const handleGenerateFeedback = async () => {
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/student-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.fullName,
          gpa: student.gpa,
          attendanceRate: student.attendanceRate,
          behaviorScore: student.behaviorScore,
          strengths: 'Chăm chỉ, hăng hái xây dựng bài và có ý thức tổ chức kỷ luật tốt',
          areasForImprovement: 'Cần chú ý cẩn thận hơn trong các bước giải toán tự luận',
        }),
      });
      const data = await res.json();
      if (data.success && data.feedback) {
        setGeneratedFeedback(data.feedback);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Save generated quiz to real quizzes list
  const handleSaveQuizToDatabase = () => {
    if (generatedQuestions.length === 0) return;

    const newQuiz: Quiz = {
      id: 'quiz_ai_' + Date.now(),
      classId: currentClassId || 'cls_10a1',
      className: currentClass?.name || '10A1',
      subject: quizForm.subject,
      title: `[Đề AI] ${quizForm.topic}`,
      description: `Đề thi trắc nghiệm soạn tự động bởi Trợ lý AI và đã được Giáo viên kiểm duyệt.`,
      durationMinutes: 15,
      openTime: '2026-10-05T08:00',
      closeTime: '2026-10-10T23:59',
      shuffleQuestions: true,
      shuffleAnswers: true,
      totalPoints: 10,
      status: 'active',
      questions: generatedQuestions,
      attemptsCount: 0,
      averageScore: 0,
    };

    storage.saveQuiz(newQuiz);
    storage.addAuditLog({
      userId: 'u_teacher_1',
      userName: 'Thầy Nguyễn Văn An',
      userRole: 'teacher',
      action: 'Duyệt & Lưu đề thi AI',
      module: 'AI Trợ giảng',
      details: `Lưu đề kiểm tra "${newQuiz.title}" vào lớp ${newQuiz.className}`,
    });

    setSavedQuizSuccess(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 rounded-2xl text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <h1 className="text-xl font-bold">AI Trợ giảng Sư phạm Thông minh</h1>
          </div>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Tự động hóa soạn đề kiểm tra, soạn giáo án, viết nhận xét học bạ học sinh và phân tích kết quả học tập.
            Nội dung AI luôn được Thầy/Cô trực tiếp xem trước và chỉnh sửa trước khi công bố.
          </p>
        </div>

        <div className="text-xs bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/20 text-white font-mono shrink-0">
          Model: gemini-3.8-flash (Standard)
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-2xs flex overflow-x-auto text-xs">
        {[
          { id: 'quiz', label: '1. AI Soạn đề kiểm tra & Quiz', icon: HelpCircle },
          { id: 'lesson_plan', label: '2. AI Soạn Kế hoạch bài dạy (Giáo án)', icon: BookOpen },
          { id: 'feedback', label: '3. AI Viết nhận xét học sinh', icon: UserCheck },
          { id: 'analytics', label: '4. AI Phân tích & Đề xuất phương pháp', icon: BarChart },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: QUIZ GENERATOR */}
      {activeTab === 'quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Cấu hình tham số soạn đề</h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chủ đề bài học *</label>
              <input
                type="text"
                value={quizForm.topic}
                onChange={(e) => setQuizForm({ ...quizForm, topic: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Môn học</label>
                <input
                  type="text"
                  value={quizForm.subject}
                  onChange={(e) => setQuizForm({ ...quizForm, subject: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Khối lớp</label>
                <input
                  type="text"
                  value={quizForm.grade}
                  onChange={(e) => setQuizForm({ ...quizForm, grade: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số câu hỏi</label>
                <select
                  value={quizForm.questionCount}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, questionCount: Number(e.target.value) })
                  }
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                >
                  <option value={3}>3 câu</option>
                  <option value={4}>4 câu</option>
                  <option value={5}>5 câu</option>
                  <option value={10}>10 câu</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Độ khó</label>
                <select
                  value={quizForm.difficulty}
                  onChange={(e) => setQuizForm({ ...quizForm, difficulty: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                >
                  <option value="Cơ bản">Cơ bản</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Nâng cao">Nâng cao</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateQuiz}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Bắt đầu tạo đề với AI
            </button>
          </div>

          {/* Result & Teacher Edit Panel */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Đề kiểm tra do AI khởi tạo ({generatedQuestions.length} câu)
                </h3>
                <span className="text-[11px] text-slate-400">
                  Thầy/Cô có thể chỉnh sửa trực tiếp nội dung từng câu hỏi trước khi lưu vào ngân hàng đề
                </span>
              </div>

              {generatedQuestions.length > 0 && (
                <button
                  onClick={handleSaveQuizToDatabase}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" /> Duyệt & Lưu vào đề thi lớp
                </button>
              )}
            </div>

            {savedQuizSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                Đề kiểm tra đã được lưu vào hệ thống! Học sinh có thể truy cập để làm bài.
              </div>
            )}

            {generatedQuestions.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                Chọn chủ đề và nhấn "Bắt đầu tạo đề với AI" để sinh câu hỏi tự động.
              </div>
            ) : (
              <div className="space-y-4">
                {generatedQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>Câu {idx + 1}:</span>
                      <span className="text-slate-400 font-mono">{q.points || 2.5} điểm</span>
                    </div>

                    <textarea
                      rows={2}
                      value={q.content}
                      onChange={(e) => {
                        const copy = [...generatedQuestions];
                        copy[idx].content = e.target.value;
                        setGeneratedQuestions(copy);
                      }}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none font-semibold text-slate-900"
                    />

                    {q.options && (
                      <div className="space-y-1.5 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <span className="font-bold w-4 text-slate-500">{String.fromCharCode(65 + oIdx)}:</span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const copy = [...generatedQuestions];
                                copy[idx].options![oIdx] = e.target.value;
                                setGeneratedQuestions(copy);
                              }}
                              className={`flex-1 p-1.5 border rounded-lg text-xs outline-none ${
                                q.correctAnswer === oIdx
                                  ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-800'
                                  : 'bg-white border-slate-300'
                              }`}
                            />
                            {q.correctAnswer === oIdx && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                Đáp án đúng
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LESSON PLAN */}
      {activeTab === 'lesson_plan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Thông tin bài dạy</h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tên bài học *</label>
              <input
                type="text"
                value={lessonForm.topic}
                onChange={(e) => setLessonForm({ ...lessonForm, topic: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Môn học</label>
                <input
                  type="text"
                  value={lessonForm.subject}
                  onChange={(e) => setLessonForm({ ...lessonForm, subject: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Thời lượng (phút)</label>
                <input
                  type="number"
                  value={lessonForm.duration}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, duration: Number(e.target.value) })
                  }
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateLessonPlan}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Soạn Kế hoạch bài dạy
            </button>
          </div>

          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Nội dung Kế hoạch bài dạy (Giáo án)</h3>
              {generatedLessonPlan && (
                <button
                  onClick={() => alert('Đã lưu vào Kho tài liệu giảng dạy của bạn!')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  <Save className="w-3.5 h-3.5" /> Lưu vào Kho học liệu
                </button>
              )}
            </div>

            {generatedLessonPlan ? (
              <textarea
                rows={16}
                value={generatedLessonPlan}
                onChange={(e) => setGeneratedLessonPlan(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="text-center py-20 text-slate-400 text-xs">
                Nhập tên bài học và nhấn "Soạn Kế hoạch bài dạy" để AI hỗ trợ.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: STUDENT FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Chọn học sinh cần viết nhận xét</h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Học sinh *</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg outline-none font-bold"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.code}) - GPA: {s.gpa}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerateFeedback}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Tạo lời nhận xét cá nhân hóa
            </button>
          </div>

          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Đoạn nhận xét học bạ đề xuất</h3>
              {generatedFeedback && (
                <button
                  onClick={() => alert('Đã lưu nhận xét vào học bạ học sinh!')}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  <Save className="w-3.5 h-3.5 inline mr-1" /> Lưu vào Hồ sơ học bạ
                </button>
              )}
            </div>

            {generatedFeedback ? (
              <div className="space-y-3">
                <textarea
                  rows={6}
                  value={generatedFeedback}
                  onChange={(e) => setGeneratedFeedback(e.target.value)}
                  className="w-full p-4 border border-blue-200 bg-blue-50/20 rounded-xl text-xs leading-relaxed outline-none font-medium text-slate-800"
                />
                <p className="text-[11px] text-slate-400 italic">
                  * Giáo viên có thể chỉnh sửa trực tiếp câu từ cho đúng với thực tế quan sát tại lớp.
                </p>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 text-xs">
                Chọn học sinh và nhấn "Tạo lời nhận xét cá nhân hóa".
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ANALYTICS & SUGGESTIONS */}
      {activeTab === 'analytics' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                AI Phân tích kết quả học tập lớp {currentClass?.name}
              </h3>
              <p className="text-slate-400 text-[11px]">
                Tổng hợp dựa trên số liệu chuyên cần, điểm kiểm tra 15 phút và mức độ hoàn thành bài tập
              </p>
            </div>
            <button
              onClick={() =>
                setAnalyticsText(
                  `### BÁO CÁO PHÂN TÍCH HỌC TẬP TỪ AI:\n1. **Điểm mạnh:** 85% học sinh trong lớp nắm chắc kiến thức cơ bản về tập hợp và bất phương trình. Tỷ lệ chuyên cần đạt 96.8%.\n2. **Vấn đề cần lưu ý:** Có 2 học sinh thường xuyên nợ bài tập về nhà (Trần Gia Bảo và Phạm Đức Huy). Điểm kiểm tra 1 tiết câu hình học vectơ còn sai sót nhiều.\n3. **Đề xuất sư phạm:** Tổ chức học nhóm đôi bạn cùng tiến trong tuần tới; dành 10 phút đầu giờ thứ 4 chữa lại câu hình học; thông báo sớm cho phụ huynh em Trần Gia Bảo để cùng phối hợp theo dõi tại nhà.`
                )
              }
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
            >
              Chạy phân tích AI
            </button>
          </div>

          {analyticsText ? (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl whitespace-pre-wrap leading-relaxed font-sans text-slate-800">
              {analyticsText}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              Nhấn "Chạy phân tích AI" để nhận bản tóm tắt tình hình học tập và khuyến nghị sư phạm.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
