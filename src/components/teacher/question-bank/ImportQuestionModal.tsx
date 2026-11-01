import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  FileText,
  Code,
  Download,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldAlert,
  Info,
} from 'lucide-react';
import {
  BankQuestion,
  ImportPreviewResult,
  DuplicateMatch,
} from '../../../types/questionBank';
import {
  downloadExcelTemplate,
  downloadJsonTemplate,
  parseExcelImport,
  parseJsonImport,
  parseWordRawText,
} from '../../../services/questionBankImporter';
import { DuplicateCompareModal } from './DuplicateCompareModal';

interface ImportQuestionModalProps {
  existingQuestions: BankQuestion[];
  onClose: () => void;
  onImportSuccess: (importedQuestions: BankQuestion[]) => void;
}

export const ImportQuestionModal: React.FC<ImportQuestionModalProps> = ({
  existingQuestions,
  onClose,
  onImportSuccess,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [importMethod, setImportMethod] = useState<'excel' | 'json' | 'word'>('excel');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [wordRawText, setWordRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parseResult, setParseResult] = useState<ImportPreviewResult | null>(null);

  // Duplicate inspect modal
  const [inspectDuplicate, setInspectDuplicate] = useState<{
    candidate: BankQuestion;
    match: DuplicateMatch;
  } | null>(null);

  // Process file upload / parsing
  const handleParse = async () => {
    setIsLoading(true);
    try {
      let result: ImportPreviewResult;

      if (importMethod === 'excel') {
        if (!selectedFile) {
          alert('Vui lòng chọn tệp Excel (.xlsx, .xls)');
          setIsLoading(false);
          return;
        }
        result = await parseExcelImport(selectedFile, existingQuestions);
      } else if (importMethod === 'json') {
        if (!selectedFile) {
          alert('Vui lòng chọn tệp JSON (.json)');
          setIsLoading(false);
          return;
        }
        result = await parseJsonImport(selectedFile, existingQuestions);
      } else {
        if (!wordRawText.trim()) {
          alert('Vui lòng dán văn bản câu hỏi Word');
          setIsLoading(false);
          return;
        }
        result = parseWordRawText(wordRawText, existingQuestions);
      }

      setParseResult(result);
      setStep(2);
    } catch (err: any) {
      console.error('Import parse error:', err);
      alert('Lỗi xử lý tệp: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (!parseResult || parseResult.validQuestions.length === 0) {
      alert('Không có câu hỏi hợp lệ nào để nhập.');
      return;
    }

    onImportSuccess(parseResult.validQuestions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#090d16] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#060910]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Import câu hỏi vào Ngân hàng
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Hỗ trợ Excel (.xlsx), JSON chuẩn hóa, và văn bản Word với kiểm tra lỗi & chống trùng
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

        {/* Wizard Step Progress */}
        <div className="bg-[#070b13] px-6 py-2.5 border-b border-slate-800/80 flex items-center gap-6 text-xs">
          <span
            className={`font-semibold flex items-center gap-1.5 ${
              step === 1 ? 'text-cyan-400 font-bold' : 'text-emerald-400'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                step === 1 ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-emerald-500 text-slate-950'
              }`}
            >
              1
            </span>
            Tải tệp & Định dạng
          </span>
          <span className="text-slate-600">→</span>
          <span
            className={`font-semibold flex items-center gap-1.5 ${
              step === 2 ? 'text-cyan-400 font-bold' : 'text-slate-500'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                step === 2 ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }`}
            >
              2
            </span>
            Xem trước, Báo lỗi & Xác nhận
          </span>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {step === 1 ? (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Method Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setImportMethod('excel')}
                  className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                    importMethod === 'excel'
                      ? 'bg-emerald-950/20 border-emerald-500 text-emerald-200'
                      : 'bg-[#060910] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <FileSpreadsheet className="w-6 h-6 text-emerald-400 mb-2" />
                  <div className="font-bold text-xs">Microsoft Excel (.xlsx, .xls)</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Nhập dữ liệu theo bảng tính chuẩn có cột đề bài, phương án, đáp án
                  </p>
                </div>

                <div
                  onClick={() => setImportMethod('json')}
                  className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                    importMethod === 'json'
                      ? 'bg-blue-950/20 border-blue-500 text-blue-200'
                      : 'bg-[#060910] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Code className="w-6 h-6 text-blue-400 mb-2" />
                  <div className="font-bold text-xs">Định dạng JSON chuẩn</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Nhập cấu trúc dữ liệu đầy đủ cho cả 9 dạng câu hỏi và metadata
                  </p>
                </div>

                <div
                  onClick={() => setImportMethod('word')}
                  className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                    importMethod === 'word'
                      ? 'bg-purple-950/20 border-purple-500 text-purple-200'
                      : 'bg-[#060910] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <FileText className="w-6 h-6 text-purple-400 mb-2" />
                  <div className="font-bold text-xs">Văn bản Word (.doc, .docx)</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tự động nhận diện cấu trúc Câu 1: ... A. ... B. ... Đáp án: A
                  </p>
                </div>
              </div>

              {/* Template Download Buttons */}
              <div className="p-3.5 bg-[#060910] border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>Chưa có mẫu chuẩn? Tải tệp template để điền dữ liệu chính xác:</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={downloadExcelTemplate}
                    className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg font-semibold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Tải mẫu Excel (.xlsx)
                  </button>
                  <button
                    type="button"
                    onClick={downloadJsonTemplate}
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-lg font-semibold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Tải mẫu JSON
                  </button>
                </div>
              </div>

              {/* File Input or Word Textarea */}
              {importMethod !== 'word' ? (
                <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-8 text-center bg-[#060910] transition space-y-2">
                  <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <label className="font-semibold text-slate-200 block text-sm cursor-pointer">
                    <span>
                      {selectedFile ? selectedFile.name : 'Nhấp để chọn tệp hoặc kéo thả vào đây'}
                    </span>
                    <input
                      type="file"
                      accept={importMethod === 'excel' ? '.xlsx,.xls,.csv' : '.json'}
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  {selectedFile && (
                    <span className="text-[11px] text-emerald-400 font-mono block">
                      Đã chọn: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                  <span className="text-[11px] text-slate-500 block">
                    Định dạng hỗ trợ: {importMethod === 'excel' ? '.xlsx, .xls, .csv' : '.json'} (Tối đa 10MB)
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="font-bold text-slate-300 block">
                    Dán nội dung câu hỏi từ tệp Word (.docx):
                  </label>
                  <textarea
                    rows={8}
                    value={wordRawText}
                    onChange={(e) => setWordRawText(e.target.value)}
                    placeholder={`Câu 1: Trong các mệnh đề sau, mệnh đề nào đúng?
A. ∀x ∈ ℝ: x² > 0
B. ∃x ∈ ℝ: x² = 0
C. ∀x ∈ ℕ: x > 1
D. ∃x ∈ ℤ: x² < 0
Đáp án: B
Lời giải: Với x = 0 thì x² = 0.

Câu 2: ...`}
                    className="w-full p-3 bg-[#060910] border border-slate-800 rounded-xl text-slate-100 font-mono text-xs leading-relaxed"
                  />
                </div>
              )}
            </div>
          ) : (
            /* STEP 2: PREVIEW & VALIDATION */
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Summary KPIs */}
              {parseResult && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-[#060910] border border-slate-800 rounded-xl">
                    <span className="text-slate-500 block">Tổng số đã xử lý</span>
                    <span className="text-lg font-bold text-white font-mono">
                      {parseResult.totalParsed}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl">
                    <span className="text-emerald-400 block">Hợp lệ & Sẵn sàng</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">
                      {parseResult.validQuestions.length}
                    </span>
                  </div>
                  <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl">
                    <span className="text-rose-400 block">Dòng bị lỗi</span>
                    <span className="text-lg font-bold text-rose-400 font-mono">
                      {parseResult.errors.length}
                    </span>
                  </div>
                  <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl">
                    <span className="text-amber-400 block">Nghi trùng lặp</span>
                    <span className="text-lg font-bold text-amber-400 font-mono">
                      {parseResult.duplicates.length}
                    </span>
                  </div>
                </div>
              )}

              {/* Error Table (if any) */}
              {parseResult && parseResult.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" /> Báo cáo lỗi chi tiết theo dòng / câu (
                    {parseResult.errors.length}):
                  </div>
                  <div className="border border-rose-500/30 rounded-xl overflow-hidden bg-[#060910]">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#090d16] text-rose-300 border-b border-slate-800">
                        <tr>
                          <th className="py-2 px-3 w-16 text-center">Dòng</th>
                          <th className="py-2 px-3 w-28">Trường lỗi</th>
                          <th className="py-2 px-3">Nguyên nhân</th>
                          <th className="py-2 px-3">Gợi ý khắc phục</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70 text-slate-300">
                        {parseResult.errors.map((err, i) => (
                          <tr key={i} className="hover:bg-rose-950/10">
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-400">
                              #{err.rowNumber}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-200">
                              {err.field}
                            </td>
                            <td className="py-2.5 px-3 text-rose-300">{err.reason}</td>
                            <td className="py-2.5 px-3 text-slate-400 italic">
                              {err.suggestion}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Duplicates Alert */}
              {parseResult && parseResult.duplicates.length > 0 && (
                <div className="p-3.5 bg-amber-950/20 border border-amber-500/40 rounded-xl space-y-2">
                  <div className="font-bold text-amber-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" /> Phát hiện{' '}
                      {parseResult.duplicates.length} câu hỏi có nội dung nghi trùng trong ngân hàng
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {parseResult.duplicates.map((dup, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-[#060910] rounded-lg border border-slate-800 flex items-center justify-between"
                      >
                        <div className="truncate flex-1 pr-2">
                          <span className="font-bold text-cyan-400 mr-2 font-mono">
                            {dup.candidate.code}:
                          </span>
                          <span className="text-slate-300 truncate">{dup.candidate.content}</span>
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

              {/* Valid Questions Preview Table */}
              {parseResult && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> Danh sách câu hỏi hợp lệ sẵn sàng Import (
                    {parseResult.validQuestions.length}):
                  </div>
                  <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#060910] max-h-60 overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#090d16] text-slate-400 border-b border-slate-800 sticky top-0">
                        <tr>
                          <th className="py-2 px-3 w-10 text-center">STT</th>
                          <th className="py-2 px-3 w-28">Mã câu</th>
                          <th className="py-2 px-3 w-32">Dạng câu</th>
                          <th className="py-2 px-3">Nội dung đề bài</th>
                          <th className="py-2 px-3 w-20 text-center">Điểm</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70 text-slate-300">
                        {parseResult.validQuestions.map((q, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/40">
                            <td className="py-2.5 px-3 text-center text-slate-500">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-mono text-cyan-400 font-bold">
                              {q.code}
                            </td>
                            <td className="py-2.5 px-3 text-slate-300">{q.type}</td>
                            <td className="py-2.5 px-3 truncate max-w-xs">{q.content}</td>
                            <td className="py-2.5 px-3 text-center font-mono text-amber-400">
                              {q.points}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#060910] flex items-center justify-between">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold transition"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleParse}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition disabled:opacity-50"
              >
                {isLoading ? 'Đang phân tích...' : 'Tiếp tục: Kiểm tra dữ liệu'} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Chọn lại tệp
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={!parseResult || parseResult.validQuestions.length === 0}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> Xác nhận Import {parseResult?.validQuestions.length || 0} câu
              </button>
            </>
          )}
        </div>
      </div>

      {/* Duplicate Inspect Modal */}
      {inspectDuplicate && (
        <DuplicateCompareModal
          candidate={inspectDuplicate.candidate}
          match={inspectDuplicate.match}
          onClose={() => setInspectDuplicate(null)}
          onKeepCandidate={() => {
            setInspectDuplicate(null);
          }}
        />
      )}
    </div>
  );
};
