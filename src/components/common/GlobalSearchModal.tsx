import React, { useState, useMemo } from 'react';
import { Search, X, User, GraduationCap, FileText, HelpCircle, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../services/storage';
import { useAuth } from '../../contexts/AuthContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { role } = useAuth();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { students: [], classes: [], assignments: [], quizzes: [], announcements: [] };

    const students = storage
      .getStudents()
      .filter((s) => s.fullName.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))
      .slice(0, 4);

    const classes = storage
      .getClasses()
      .filter((c) => c.name.toLowerCase().includes(q) || c.room.toLowerCase().includes(q))
      .slice(0, 3);

    const assignments = storage
      .getAssignments()
      .filter((a) => a.title.toLowerCase().includes(q) || a.subject.toLowerCase().includes(q))
      .slice(0, 3);

    const quizzes = storage
      .getQuizzes()
      .filter((qz) => qz.title.toLowerCase().includes(q))
      .slice(0, 3);

    const announcements = storage
      .getAnnouncements()
      .filter((an) => an.title.toLowerCase().includes(q))
      .slice(0, 3);

    return { students, classes, assignments, quizzes, announcements };
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.students.length +
    results.classes.length +
    results.assignments.length +
    results.quizzes.length +
    results.announcements.length;

  const handleSelect = (url: string) => {
    onClose();
    navigate(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#090d16] text-slate-100 rounded-xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800">
          <Search className="w-5 h-5 text-cyan-400 mr-3 shrink-0" />
          <input
            type="text"
            className="w-full text-white placeholder-slate-500 text-sm md:text-base outline-none bg-transparent"
            placeholder="Tìm kiếm học sinh, lớp, bài tập, đề kiểm tra, thông báo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white p-1 mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs bg-slate-850 hover:bg-slate-800 text-slate-300 font-medium px-2 py-1 rounded border border-slate-700"
          >
            ESC
          </button>
        </div>

        {/* Results Box */}
        <div className="overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="text-center py-8 text-slate-400 text-sm">
              Nhập từ khóa (tên học sinh, mã số, tên lớp, bài tập...) để tìm kiếm nhanh trong toàn bộ hệ thống
            </div>
          )}

          {query && totalResults === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              Không tìm thấy kết quả phù hợp cho "{query}"
            </div>
          )}

          {/* Students */}
          {results.students.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Học sinh
              </div>
              <div className="space-y-1">
                {results.students.map((s) => (
                  <div
                    key={s.id}
                    onClick={() =>
                      handleSelect(
                        role === 'teacher' ? `/teacher/students/${s.id}` : `/teacher/students`
                      )
                    }
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                        {s.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-800">{s.fullName}</div>
                        <div className="text-xs text-slate-500">
                          {s.code} · {s.className} · {s.group}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                      GPA {s.gpa}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Classes */}
          {results.classes.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" /> Lớp học
              </div>
              <div className="space-y-1">
                {results.classes.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelect(`/teacher/classes/${c.id}`)}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition border border-transparent hover:border-slate-200"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-800">{c.name}</div>
                      <div className="text-xs text-slate-500">
                        {c.room} · GV: {c.teacherName} · {c.studentCount} học sinh
                      </div>
                    </div>
                    <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {c.joinCode}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assignments */}
          {results.assignments.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Bài tập
              </div>
              <div className="space-y-1">
                {results.assignments.map((a) => (
                  <div
                    key={a.id}
                    onClick={() =>
                      handleSelect(
                        role === 'student' ? '/student/assignments' : `/teacher/assignments`
                      )
                    }
                    className="p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition border border-transparent hover:border-slate-200"
                  >
                    <div className="text-sm font-medium text-slate-800 line-clamp-1">{a.title}</div>
                    <div className="text-xs text-slate-500">
                      {a.className} · Môn: {a.subject} · Hạn nộp: {new Date(a.dueDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quizzes */}
          {results.quizzes.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" /> Đề kiểm tra & Quiz
              </div>
              <div className="space-y-1">
                {results.quizzes.map((q) => (
                  <div
                    key={q.id}
                    onClick={() =>
                      handleSelect(role === 'student' ? '/student/quizzes' : `/teacher/quizzes`)
                    }
                    className="p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition border border-transparent hover:border-slate-200"
                  >
                    <div className="text-sm font-medium text-slate-800">{q.title}</div>
                    <div className="text-xs text-slate-500">
                      {q.className} · Thời lượng: {q.durationMinutes} phút · {q.questions.length} câu hỏi
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Announcements */}
          {results.announcements.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" /> Thông báo
              </div>
              <div className="space-y-1">
                {results.announcements.map((an) => (
                  <div
                    key={an.id}
                    onClick={() =>
                      handleSelect(
                        role === 'parent'
                          ? '/parent/announcements'
                          : role === 'student'
                          ? '/student/announcements'
                          : '/teacher/announcements'
                      )
                    }
                    className="p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition border border-transparent hover:border-slate-200"
                  >
                    <div className="text-sm font-medium text-slate-800 line-clamp-1">{an.title}</div>
                    <div className="text-xs text-slate-500">Người gửi: {an.senderName}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-400 text-right">
          Nhấn Enter hoặc click chuột để điều hướng trực tiếp
        </div>
      </div>
    </div>
  );
};
