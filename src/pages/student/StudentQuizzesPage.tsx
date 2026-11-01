import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../contexts/AuthContext';
import { storage } from '../../services/storage';
import { Quiz, QuizQuestion } from '../../types';

export const StudentQuizzesPage: React.FC = () => {
  const { user } = useAuth();
  const student = storage.getStudentById(user?.studentId || 'stu_1') || storage.getStudents()[0];
  const quizzes = storage.getQuizzes(student.classId);

  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; maxScore: number; correctCount: number } | null>(null);

  useEffect(() => {
    let timer: any = null;
    if (activeQuiz && !isSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isSubmitted && activeQuiz) {
      handleSubmitQuiz();
    }
    return () => clearInterval(timer);
  }, [activeQuiz, isSubmitted, timeLeft]);

  const handleStartQuiz = (q: Quiz) => {
    setActiveQuiz(q);
    setSelectedAnswers({});
    setTimeLeft(q.durationMinutes * 60);
    setIsSubmitted(false);
    setScoreResult(null);
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;

    let correct = 0;
    activeQuiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const totalQuestions = activeQuiz.questions.length || 1;
    const finalScore = Number(((correct / totalQuestions) * activeQuiz.totalPoints).toFixed(1));

    setIsSubmitted(true);
    setScoreResult({
      score: finalScore,
      maxScore: activeQuiz.totalPoints,
      correctCount: correct,
    });

    // Confetti for good results
    if (finalScore >= 8) {
      try {
        confetti({ particleCount: 80, spread: 60 });
      } catch (e) {}
    }

    storage.addAuditLog({
      userId: user?.id || 'u_student_1',
      userName: student.fullName,
      userRole: 'student',
      action: 'Nộp bài kiểm tra trực tuyến',
      module: 'Kiểm tra',
      details: `Học sinh hoàn thành bài "${activeQuiz.title}" (Đạt ${finalScore}/${activeQuiz.totalPoints} điểm)`,
    });
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Bài kiểm tra & Thi trực tuyến</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Làm bài thi trắc nghiệm theo thời gian thực với hệ thống tự động chấm điểm tức thì
        </p>
      </div>

      {!activeQuiz ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {quizzes.map((qz) => (
            <div
              key={qz.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
                    {qz.subject} · {qz.className}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Đang mở
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2">{qz.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{qz.description}</p>

                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {qz.durationMinutes} phút
                  </span>
                  <span>{qz.questions.length} câu hỏi</span>
                  <span>Thang điểm: {qz.totalPoints}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleStartQuiz(qz)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                >
                  Bắt đầu làm bài thi
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Active Quiz Exam Screen */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
          {/* Exam Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">{activeQuiz.title}</h2>
              <span className="text-xs text-slate-400">
                Thí sinh: {student.fullName} ({student.code}) · Thang điểm {activeQuiz.totalPoints}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {!isSubmitted ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg font-mono font-bold text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimer(timeLeft)}</span>
                </div>
              ) : (
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Thoát bài thi
                </button>
              )}
            </div>
          </div>

          {/* Results summary banner if submitted */}
          {isSubmitted && scoreResult && (
            <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-center space-y-1 shadow-md">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                Kết quả bài thi trực tuyến
              </span>
              <div className="text-3xl font-black">{scoreResult.score} / {scoreResult.maxScore} điểm</div>
              <p className="text-xs text-emerald-100">
                Đúng {scoreResult.correctCount} trên tổng số {activeQuiz.questions.length} câu hỏi.
              </p>
            </div>
          )}

          {/* Questions list */}
          <div className="space-y-6 text-xs">
            {activeQuiz.questions.map((q, idx) => {
              const userAns = selectedAnswers[q.id];
              return (
                <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="font-bold text-slate-900 text-sm">
                    Câu {idx + 1}: {q.content} ({q.points} điểm)
                  </div>

                  <div className="space-y-1.5">
                    {q.options?.map((opt, oIdx) => {
                      const isChosen = userAns === oIdx;
                      const isCorrect = q.correctAnswer === oIdx;

                      let itemStyle = 'border-slate-200 bg-white hover:bg-slate-100 text-slate-800';
                      if (isSubmitted) {
                        if (isCorrect) itemStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
                        else if (isChosen && !isCorrect) itemStyle = 'border-red-500 bg-red-50 text-red-800';
                      } else if (isChosen) {
                        itemStyle = 'border-blue-500 bg-blue-50 text-blue-800 font-bold';
                      }

                      return (
                        <div
                          key={oIdx}
                          onClick={() => handleSelectOption(q.id, oIdx)}
                          className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${itemStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full border flex items-center justify-center font-bold text-[10px]">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isSubmitted && isCorrect && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              Đáp án đúng
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {isSubmitted && q.explanation && (
                    <div className="p-2.5 bg-blue-50/70 border border-blue-100 text-blue-900 rounded-lg text-[11px]">
                      <strong>Giải thích:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          {!isSubmitted && (
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={handleSubmitQuiz}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                Nộp bài & Chấm điểm tức thì
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
