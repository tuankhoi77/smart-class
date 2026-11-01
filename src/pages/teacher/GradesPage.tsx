import React, { useState } from 'react';
import {
  ClipboardList,
  Download,
  Plus,
  Save,
  Search,
  Check,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { useClass } from '../../contexts/ClassContext';
import { storage } from '../../services/storage';
import { GradeItem, Student } from '../../types';

export const GradesPage: React.FC = () => {
  const { classes, currentClassId, currentClass } = useClass();

  const [classId, setClassId] = useState(currentClassId || 'cls_10a1');
  const [subject, setSubject] = useState('Toán học');
  const [term, setTerm] = useState<'term1' | 'term2'>('term1');

  const students = storage.getStudentsByClass(classId);
  const grades = storage.getGrades(classId);

  // Grade state mapping: studentId -> { oral: number, quiz15m: number, test45m: number, midterm: number, final: number }
  const [gradeMatrix, setGradeMatrix] = useState<Record<string, Record<string, number>>>(() => {
    const map: Record<string, Record<string, number>> = {};
    students.forEach((s) => {
      const studentGrades = grades.filter((g) => g.studentId === s.id);
      const oral = studentGrades.find((g) => g.type === 'oral')?.score ?? 9.0;
      const q15 = studentGrades.find((g) => g.type === 'quiz_15m')?.score ?? 8.5;
      const t45 = studentGrades.find((g) => g.type === 'test_45m')?.score ?? 8.0;
      const mid = studentGrades.find((g) => g.type === 'midterm')?.score ?? 8.5;
      const fin = studentGrades.find((g) => g.type === 'final')?.score ?? 9.0;

      map[s.id] = { oral, q15, t45, mid, fin };
    });
    return map;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const calculateGPA = (scores: Record<string, number>) => {
    const { oral, q15, t45, mid, fin } = scores;
    // Weights: oral: 1, q15: 1, t45: 2, mid: 2, fin: 3 -> Total weights = 9
    const total = oral * 1 + q15 * 1 + t45 * 2 + mid * 2 + fin * 3;
    return Number((total / 9).toFixed(1));
  };

  const handleScoreChange = (studentId: string, colKey: string, value: string) => {
    const num = Math.max(0, Math.min(10, parseFloat(value) || 0));
    setGradeMatrix((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [colKey]: num,
      },
    }));
    setSavedSuccess(false);
  };

  const handleSaveAllGrades = () => {
    students.forEach((s) => {
      const scores = gradeMatrix[s.id] || { oral: 9, q15: 8.5, t45: 8, mid: 8.5, fin: 9 };
      const newGPA = calculateGPA(scores);

      // Save student updated GPA
      const updatedStudent = { ...s, gpa: newGPA };
      storage.saveStudent(updatedStudent);

      // Save each grade item
      storage.saveGrade({
        id: `grd_${classId}_${s.id}_oral`,
        classId,
        studentId: s.id,
        subject,
        term,
        type: 'oral',
        typeName: 'Kiểm tra miệng',
        score: scores.oral,
        weight: 1,
        updatedAt: '2026-10-04',
      });
      storage.saveGrade({
        id: `grd_${classId}_${s.id}_q15`,
        classId,
        studentId: s.id,
        subject,
        term,
        type: 'quiz_15m',
        typeName: 'Kiểm tra 15 phút',
        score: scores.q15,
        weight: 1,
        updatedAt: '2026-10-04',
      });
      storage.saveGrade({
        id: `grd_${classId}_${s.id}_t45`,
        classId,
        studentId: s.id,
        subject,
        term,
        type: 'test_45m',
        typeName: 'Kiểm tra 1 tiết',
        score: scores.t45,
        weight: 2,
        updatedAt: '2026-10-04',
      });
    });

    storage.addAuditLog({
      userId: 'u_teacher_1',
      userName: 'Thầy Nguyễn Văn An',
      userRole: 'teacher',
      action: 'Lưu bảng điểm lớp',
      module: 'Điểm số',
      details: `Lưu điểm môn ${subject} cho lớp ${currentClass?.name || classId}`,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportExcel = () => {
    const headers = 'STT,Mã HS,Họ và tên,Lớp,Miệng (x1),15 Phút (x1),1 Tiết (x2),Giữa kỳ (x2),Học kỳ (x3),ĐTB Môn\n';
    const rows = students
      .map((s, idx) => {
        const scores = gradeMatrix[s.id] || { oral: 9, q15: 8.5, t45: 8, mid: 8.5, fin: 9 };
        const gpa = calculateGPA(scores);
        return `${idx + 1},"${s.code}","${s.fullName}","${s.className}",${scores.oral},${scores.q15},${scores.t45},${scores.mid},${scores.fin},${gpa}`;
      })
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BangDiem_${currentClass?.name || '10A1'}_${subject}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Sổ điểm & Bảng đánh giá</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Nhập điểm trực tiếp trên lưới, tự động tính điểm trung bình (GPA) và xuất Excel báo cáo
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <Download className="w-4 h-4 text-slate-400" /> Xuất bảng điểm Excel
          </button>
          <button
            onClick={handleSaveAllGrades}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow-md shadow-blue-900/40"
          >
            <Save className="w-4 h-4" /> Lưu bảng điểm
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          Đã lưu toàn bộ điểm số và tính toán lại GPA học sinh thành công!
        </div>
      )}

      {/* Filter Bar - Pure Dark Theme */}
      <div className="bg-[#090d16] p-4 rounded-xl border border-slate-800 shadow-xl flex flex-wrap items-center gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Lớp học</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="text-xs font-bold text-white bg-[#060910] border border-slate-800 rounded-lg p-2 outline-none focus:border-cyan-500 cursor-pointer"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Môn học</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="text-xs font-bold text-white bg-[#060910] border border-slate-800 rounded-lg p-2 outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="Toán học">Toán học</option>
            <option value="Vật lý">Vật lý</option>
            <option value="Hóa học">Hóa học</option>
            <option value="Ngữ văn">Ngữ văn</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Học kỳ</label>
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value as any)}
            className="text-xs font-bold text-white bg-[#060910] border border-slate-800 rounded-lg p-2 outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="term1">Học kỳ 1 (2025 - 2026)</option>
            <option value="term2">Học kỳ 2 (2025 - 2026)</option>
          </select>
        </div>
      </div>

      {/* Grade Grid Matrix - Pure Dark Theme, ĐTB (GPA) seamlessly blended into background */}
      <div className="bg-[#090d16] rounded-xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#060910] border-b border-slate-800 text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-3 w-10 text-center text-slate-400">STT</th>
                <th className="py-3 px-3 w-28">Mã HS</th>
                <th className="py-3 px-3">Họ và tên học sinh</th>
                <th className="py-3 px-2 text-center w-24">Miệng (x1)</th>
                <th className="py-3 px-2 text-center w-24">15 Phút (x1)</th>
                <th className="py-3 px-2 text-center w-24">1 Tiết (x2)</th>
                <th className="py-3 px-2 text-center w-24">Giữa kỳ (x2)</th>
                <th className="py-3 px-2 text-center w-24">Học kỳ (x3)</th>
                <th className="py-3 px-3 text-center w-24 text-cyan-400 font-bold">ĐTB (GPA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {students.map((stu, idx) => {
                const scores = gradeMatrix[stu.id] || { oral: 9, q15: 8.5, t45: 8, mid: 8.5, fin: 9 };
                const gpa = calculateGPA(scores);

                return (
                  <tr key={stu.id} className="hover:bg-[#0e1424] transition">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono text-cyan-400 font-medium">{stu.code}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{stu.fullName}</td>

                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={scores.oral}
                        onChange={(e) => handleScoreChange(stu.id, 'oral', e.target.value)}
                        className="w-16 p-1 text-center font-mono bg-[#060910] text-white border border-slate-800 rounded-md focus:border-cyan-500 outline-none"
                      />
                    </td>

                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={scores.q15}
                        onChange={(e) => handleScoreChange(stu.id, 'q15', e.target.value)}
                        className="w-16 p-1 text-center font-mono bg-[#060910] text-white border border-slate-800 rounded-md focus:border-cyan-500 outline-none"
                      />
                    </td>

                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={scores.t45}
                        onChange={(e) => handleScoreChange(stu.id, 't45', e.target.value)}
                        className="w-16 p-1 text-center font-mono bg-[#060910] text-white border border-slate-800 rounded-md focus:border-cyan-500 outline-none"
                      />
                    </td>

                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={scores.mid}
                        onChange={(e) => handleScoreChange(stu.id, 'mid', e.target.value)}
                        className="w-16 p-1 text-center font-mono bg-[#060910] text-white border border-slate-800 rounded-md focus:border-cyan-500 outline-none"
                      />
                    </td>

                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={scores.fin}
                        onChange={(e) => handleScoreChange(stu.id, 'fin', e.target.value)}
                        className="w-16 p-1 text-center font-mono bg-[#060910] text-white border border-slate-800 rounded-md focus:border-cyan-500 outline-none"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className="font-mono font-bold text-sm text-cyan-400">{gpa}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
