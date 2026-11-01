import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  FileCode,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldAlert,
  Info,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { BankQuestion, ImportPreviewResult, DuplicateMatch } from '../../../../types/questionBank';
import {
  downloadExcelTemplate,
  downloadCsvTemplate,
  downloadWordTemplate,
  downloadJsonTemplate,
  parseExcelImport,
  parseJsonImport,
  parseWordRawText,
} from '../../../../services/questionBankImporter';
import { DuplicateCompareModal } from '../DuplicateCompareModal';

interface Tab1ImportProps {
  existingQuestions: BankQuestion[];
  onImportSuccess: (questions: BankQuestion[]) => void;
}

export const Tab1Import: React.FC<Tab1ImportProps> = ({
  existingQuestions,
  onImportSuccess,
}) => {
  const [importFormat, setImportFormat] = useState<'excel' | 'csv' | 'word' | 'json'>('excel');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [wordRawText, setWordRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [previewResult, setPreviewResult] = useState<ImportPreviewResult | null>(null);
  const [inspectDuplicate, setInspectDuplicate] = useState<{
    candidate: BankQuestion;
    match: DuplicateMatch;
  } | null>(null);

  // File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewResult(null);
    }
  };

  // Run parse
  const handleStartParse = async () => {
    setIsParsing(true);
    try {
      let result: ImportPreviewResult;
      if (importFormat === 'excel' || importFormat === 'csv') {
        if (!selectedFile) {
          alert('Vui lòng chọn tệp bảng tính ' + (importFormat === 'excel' ? 'Excel (.xlsx, .xls)' : 'CSV (.csv)'));
          setIsParsing(false);
          return;
        }
        result = await parseExcelImport(selectedFile, existingQuestions);
      } else if (importFormat === 'json') {
        if (!selectedFile) {
          alert('Vui lòng chọn tệp JSON (.json)');
          setIsParsing(false);
          return;
        }
        result = await parseJsonImport(selectedFile, existingQuestions);
      } else {
        if (!wordRawText.trim()) {
          alert('Vui lòng dán văn bản câu hỏi Word');
          setIsParsing(false);
          return;
        }
        result = parseWordRawText(wordRawText, existingQuestions);
      }

      setPreviewResult(result);
    } catch (err: any) {
      console.error('Parse error:', err);
      alert('Lỗi xử lý tệp: ' + err.message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmSave = () => {
    if (!previewResult || previewResult.validQuestions.length === 0) {
      alert('Không có câu hỏi hợp lệ nào để nhập vào ngân hàng.');
      return;
    }
    onImportSuccess(previewResult.validQuestions);
    setPreviewResult(null);
    setSelectedFile(null);
    setWordRawText('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Compact Format Bar & Template Downloads */}
      <div className="bg-[#090d16] border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Format Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => {
              setImportFormat('excel');
              setPreviewResult(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              importFormat === 'excel'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel (.xlsx)
          </button>

          <button
            type="button"
            onClick={() => {
              setImportFormat('csv');
              setPreviewResult(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              importFormat === 'csv'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> CSV (.csv)
          </button>

          <button
            type="button"
            onClick={() => {
              setImportFormat('word');
              setPreviewResult(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              importFormat === 'word'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Word (.doc/.docx)
          </button>

          <button
            type="button"
            onClick={() => {
              setImportFormat('json');
              setPreviewResult(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              importFormat === 'json'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" /> JSON
          </button>
        </div>

        {/* Template Downloads */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500 text-[11px] mr-1 hidden sm:inline">Tải tệp mẫu:</span>
          <button
            type="button"
            onClick={downloadExcelTemplate}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#060910] hover:bg-slate-800 text-emerald-400 border border-slate-800 rounded-lg text-[11px] font-medium transition cursor-pointer"
          >
            <Download className="w-3 h-3" /> Mẫu Excel
          </button>
          <button
            type="button"
            onClick={downloadCsvTemplate}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#060910] hover:bg-slate-800 text-teal-400 border border-slate-800 rounded-lg text-[11px] font-medium transition cursor-pointer"
          >
            <Download className="w-3 h-3" /> Mẫu CSV
          </button>
          <button
            type="button"
            onClick={downloadWordTemplate}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#060910] hover:bg-slate-800 text-blue-400 border border-slate-800 rounded-lg text-[11px] font-medium transition cursor-pointer"
          >
            <Download className="w-3 h-3" /> Mẫu Word
          </button>
        </div>
      </div>

      {/* Input Form Area */}
      <div className="bg-[#090d16] border border-slate-800 rounded-xl p-5 space-y-4">
        {importFormat !== 'word' ? (
          <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-8 text-center bg-[#060910] transition space-y-2">
            <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <label className="font-semibold text-slate-200 block text-sm cursor-pointer">
              <span>{selectedFile ? selectedFile.name : 'Nhấp để chọn tệp tải lên hoặc kéo thả vào đây'}</span>
              <input
                type="file"
                accept={
                  importFormat === 'excel'
                    ? '.xlsx,.xls'
                    : importFormat === 'csv'
                    ? '.csv'
                    : '.json'
                }
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {selectedFile && (
              <span className="text-xs text-emerald-400 font-mono block font-bold">
                ✓ Đã chọn: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            )}
            <span className="text-[11px] text-slate-500 block">
              Định dạng áp dụng: {importFormat.toUpperCase()} · Tối đa 10MB
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-300 block text-xs">
                Dán nội dung câu hỏi từ tài liệu Word:
              </label>
              <button
                type="button"
                onClick={() =>
                  setWordRawText(`Câu 1: Khẳng định nào sau đây là mệnh đề toán học đúng?
A. ∀x ∈ ℝ: x² > 0
B. ∃x ∈ ℝ: x² = 0
C. ∀x ∈ ℕ: x > 1
D. ∃x ∈ ℤ: x² < 0
Đáp án: B
Lời giải: Với x = 0 thì x² = 0.

Câu 2: Cho tam giác ABC đều cạnh a. Độ dài vectơ AB + AC bằng bao nhiêu?
A. a√3
B. 2a
C. a
D. a√3/2
Đáp án: A
Lời giải: Dựng hình bình hành, độ dài là a√3.`)
                }
                className="text-[11px] text-cyan-400 hover:underline font-semibold"
              >
                + Điền văn bản mẫu
              </button>
            </div>
            <textarea
              rows={8}
              value={wordRawText}
              onChange={(e) => setWordRawText(e.target.value)}
              placeholder={`Câu 1: Nội dung câu hỏi...
A. Phương án A
B. Phương án B
C. Phương án C
D. Phương án D
Đáp án: A
Lời giải: Giải thích chi tiết...`}
              className="w-full p-3.5 bg-[#060910] border border-slate-800 rounded-xl text-slate-100 font-mono text-xs leading-relaxed outline-none focus:border-cyan-500"
            />
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          {selectedFile || wordRawText ? (
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setWordRawText('');
                setPreviewResult(null);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Làm mới
            </button>
          ) : null}

          <button
            type="button"
            disabled={isParsing || (!selectedFile && !wordRawText.trim())}
            onClick={handleStartParse}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            {isParsing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Đang phân tích...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Bắt đầu kiểm tra & Xem trước
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview & Validation Results Section */}
      {previewResult && (
        <div className="bg-[#090d16] border border-slate-800 rounded-xl p-5 space-y-5 animate-in fade-in duration-150">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#060910] border border-slate-800 rounded-xl">
              <span className="text-slate-500 text-xs block">Tổng số đã đọc</span>
              <span className="text-xl font-bold text-white font-mono mt-0.5 block">
                {previewResult.totalParsed} câu
              </span>
            </div>
            <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl">
              <span className="text-emerald-400 text-xs block font-semibold">Hợp lệ & Sẵn sàng</span>
              <span className="text-xl font-bold text-emerald-400 font-mono mt-0.5 block">
                {previewResult.validQuestions.length} câu
              </span>
            </div>
            <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl">
              <span className="text-rose-400 text-xs block font-semibold">Dòng bị lỗi</span>
              <span className="text-xl font-bold text-rose-400 font-mono mt-0.5 block">
                {previewResult.errors.length} dòng
              </span>
            </div>
            <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl">
              <span className="text-amber-400 text-xs block font-semibold">Nghi trùng lặp</span>
              <span className="text-xl font-bold text-amber-400 font-mono mt-0.5 block">
                {previewResult.duplicates.length} câu
              </span>
            </div>
          </div>

          {/* Errors table (if any) */}
          {previewResult.errors.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" /> Báo cáo lỗi chi tiết theo dòng ({previewResult.errors.length}):
              </div>
              <div className="border border-rose-500/30 rounded-xl overflow-hidden bg-[#060910]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#090d16] text-rose-300 border-b border-slate-800 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 w-16 text-center">Dòng</th>
                      <th className="py-2.5 px-3 w-32">Trường lỗi</th>
                      <th className="py-2.5 px-3">Nguyên nhân</th>
                      <th className="py-2.5 px-3">Cách khắc phục</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-slate-300">
                    {previewResult.errors.map((err, i) => (
                      <tr key={i} className="hover:bg-rose-950/10">
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-400">
                          #{err.rowNumber}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-200">{err.field}</td>
                        <td className="py-2.5 px-3 text-rose-300">{err.reason}</td>
                        <td className="py-2.5 px-3 text-slate-400 italic">{err.suggestion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Duplicates Alert */}
          {previewResult.duplicates.length > 0 && (
            <div className="p-4 bg-amber-950/20 border border-amber-500/40 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-amber-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>
                  Phát hiện {previewResult.duplicates.length} câu hỏi có nội dung nghi trùng lặp với ngân hàng
                </span>
              </div>
              <div className="space-y-1.5 pt-1">
                {previewResult.duplicates.map((dup, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-[#060910] rounded-lg border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="truncate flex-1">
                      <span className="text-slate-200 font-medium truncate block">{dup.candidate.content}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInspectDuplicate(dup)}
                      className="px-2.5 py-1 bg-amber-600/20 text-amber-300 border border-amber-500/40 rounded text-[11px] font-semibold hover:bg-amber-600/30 transition shrink-0"
                    >
                      Đối chiếu {dup.match.similarityScore}%
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Valid Questions Table */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" /> Danh sách câu hỏi hợp lệ sẵn sàng nạp vào ngân hàng (
              {previewResult.validQuestions.length}):
            </div>
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#060910] max-h-72 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#090d16] text-slate-400 border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">STT</th>
                    <th className="py-2.5 px-3 w-32">Dạng câu</th>
                    <th className="py-2.5 px-3">Nội dung đề bài</th>
                    <th className="py-2.5 px-3 w-28">Môn / Lớp</th>
                    <th className="py-2.5 px-3 w-24">Đáp án</th>
                    <th className="py-2.5 px-3 w-20 text-center">Điểm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {previewResult.validQuestions.map((q, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 text-center text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 text-slate-300 font-medium">{q.type}</td>
                      <td className="py-2.5 px-3 truncate max-w-xs">{q.content}</td>
                      <td className="py-2.5 px-3 text-slate-400">{q.subject} · {q.grade}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">
                        {q.type === 'single_choice' && typeof q.correctAnswer === 'number'
                          ? String.fromCharCode(65 + q.correctAnswer)
                          : q.sampleAnswer || 'Đã cấu hình'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-amber-400">{q.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-slate-400 text-xs">
              Các câu hợp lệ sẽ được lưu vào kho lưu trữ với trạng thái <b className="text-emerald-400">Chờ duyệt / Đã duyệt</b>.
            </span>
            <button
              type="button"
              disabled={previewResult.validQuestions.length === 0}
              onClick={handleConfirmSave}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <Check className="w-4 h-4" /> Xác nhận Import {previewResult.validQuestions.length} câu vào Ngân hàng
            </button>
          </div>
        </div>
      )}

      {/* Duplicate Inspect Modal */}
      {inspectDuplicate && (
        <DuplicateCompareModal
          candidate={inspectDuplicate.candidate}
          match={inspectDuplicate.match}
          onClose={() => setInspectDuplicate(null)}
          onKeepCandidate={() => setInspectDuplicate(null)}
        />
      )}
    </div>
  );
};
