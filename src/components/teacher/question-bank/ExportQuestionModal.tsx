import React, { useState } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  CheckCircle2,
  Check,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { BankQuestion, ExportConfig } from '../../../types/questionBank';
import {
  exportToExcel,
  exportToWord,
  printExamOrQuestionList,
} from '../../../services/questionBankExporter';

interface ExportQuestionModalProps {
  selectedQuestions: BankQuestion[];
  filteredQuestions: BankQuestion[];
  onClose: () => void;
}

export const ExportQuestionModal: React.FC<ExportQuestionModalProps> = ({
  selectedQuestions,
  filteredQuestions,
  onClose,
}) => {
  const hasSelection = selectedQuestions.length > 0;
  const [scope, setScope] = useState<'selected' | 'filtered'>(
    hasSelection ? 'selected' : 'filtered'
  );
  const [format, setFormat] = useState<'excel' | 'word' | 'pdf'>('excel');
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeTeacherInfo, setIncludeTeacherInfo] = useState(true);
  const [schoolName, setSchoolName] = useState('TRƯỜNG THPT CHUYÊN QUỐC HỌC');
  const [examTitle, setExamTitle] = useState('ĐỀ ÔN TẬP KIỂM TRA CHUYÊN ĐỀ');
  const [durationMinutes, setDurationMinutes] = useState(45);

  const targetQuestions = scope === 'selected' ? selectedQuestions : filteredQuestions;

  const handleExecuteExport = () => {
    if (targetQuestions.length === 0) {
      alert('Không có câu hỏi nào trong danh sách được chọn.');
      return;
    }

    const config: ExportConfig = {
      format,
      includeAnswers,
      includeExplanations,
      includeMetadata,
      includeTeacherInfo,
      schoolName,
      examTitle,
      durationMinutes,
      targetScope: scope,
    };

    if (format === 'excel') {
      exportToExcel(targetQuestions, config);
    } else if (format === 'word') {
      exportToWord(targetQuestions, config);
    } else {
      printExamOrQuestionList(targetQuestions, config);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#090d16] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#060910]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Download className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Xuất câu hỏi ra tệp (Export)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Xuất danh sách câu hỏi kèm đáp án và lời giải sang Excel, Word hoặc bản in PDF
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

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Scope Selector */}
          <div className="space-y-2">
            <label className="font-bold text-slate-300 block uppercase tracking-wider text-[11px]">
              1. Phạm vi xuất câu hỏi:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => hasSelection && setScope('selected')}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  !hasSelection
                    ? 'opacity-40 cursor-not-allowed bg-[#060910] border-slate-800'
                    : scope === 'selected'
                    ? 'bg-blue-600/15 border-blue-500 text-blue-200'
                    : 'bg-[#060910] border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Các câu được tick chọn</span>
                  {scope === 'selected' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                </div>
                <span className="font-mono text-cyan-400 font-bold block mt-1">
                  {selectedQuestions.length} câu hỏi
                </span>
              </div>

              <div
                onClick={() => setScope('filtered')}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  scope === 'filtered'
                    ? 'bg-blue-600/15 border-blue-500 text-blue-200'
                    : 'bg-[#060910] border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Toàn bộ theo bộ lọc hiện tại</span>
                  {scope === 'filtered' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                </div>
                <span className="font-mono text-cyan-400 font-bold block mt-1">
                  {filteredQuestions.length} câu hỏi
                </span>
              </div>
            </div>
          </div>

          {/* Format Selector */}
          <div className="space-y-2">
            <label className="font-bold text-slate-300 block uppercase tracking-wider text-[11px]">
              2. Định dạng xuất tệp:
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div
                onClick={() => setFormat('excel')}
                className={`p-3 rounded-xl border transition cursor-pointer text-left ${
                  format === 'excel'
                    ? 'bg-emerald-950/20 border-emerald-500 text-emerald-200'
                    : 'bg-[#060910] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-400 mb-1.5" />
                <div className="font-bold text-xs">Excel (.xlsx)</div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Bảng tính dữ liệu đầy đủ
                </span>
              </div>

              <div
                onClick={() => setFormat('word')}
                className={`p-3 rounded-xl border transition cursor-pointer text-left ${
                  format === 'word'
                    ? 'bg-blue-950/20 border-blue-500 text-blue-200'
                    : 'bg-[#060910] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <FileText className="w-5 h-5 text-blue-400 mb-1.5" />
                <div className="font-bold text-xs">Word (.doc)</div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Đề thi & Tài liệu in ấn
                </span>
              </div>

              <div
                onClick={() => setFormat('pdf')}
                className={`p-3 rounded-xl border transition cursor-pointer text-left ${
                  format === 'pdf'
                    ? 'bg-rose-950/20 border-rose-500 text-rose-200'
                    : 'bg-[#060910] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Printer className="w-5 h-5 text-rose-400 mb-1.5" />
                <div className="font-bold text-xs">In ấn / PDF (A4)</div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Bố cục in chuẩn học sinh
                </span>
              </div>
            </div>
          </div>

          {/* Content Options */}
          <div className="space-y-2">
            <label className="font-bold text-slate-300 block uppercase tracking-wider text-[11px]">
              3. Tùy chọn nội dung xuất:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#060910] p-4 rounded-xl border border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={includeAnswers}
                  onChange={(e) => setIncludeAnswers(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Kèm bảng đáp án chuẩn</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={includeExplanations}
                  onChange={(e) => setIncludeExplanations(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Kèm lời giải & giải thích chi tiết</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Kèm mức độ, chủ đề & mã câu hỏi</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={includeTeacherInfo}
                  onChange={(e) => setIncludeTeacherInfo(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Kèm tiêu đề trường & thông tin giáo viên</span>
              </label>
            </div>
          </div>

          {/* Exam Header Customization */}
          <div className="space-y-2">
            <label className="font-bold text-slate-300 block uppercase tracking-wider text-[11px]">
              4. Cấu hình tiêu đề tài liệu xuất:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#060910] p-4 rounded-xl border border-slate-800">
              <div>
                <label className="text-slate-400 block mb-1">Tên trường / Đơn vị</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tiêu đề đề thi / Tài liệu</label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Thời gian làm bài (phút)</label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-[#090d16] border border-slate-700 rounded-lg text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#060910] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold transition"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={handleExecuteExport}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition"
          >
            <Download className="w-4 h-4" /> Tải về {targetQuestions.length} câu hỏi (
            {format.toUpperCase()})
          </button>
        </div>
      </div>
    </div>
  );
};
