import React from 'react';
import { X, AlertTriangle, Check, ArrowRight, Copy, ShieldAlert } from 'lucide-react';
import { BankQuestion, DuplicateMatch } from '../../../types/questionBank';

interface DuplicateCompareModalProps {
  candidate: BankQuestion;
  match: DuplicateMatch;
  onClose: () => void;
  onKeepCandidate: () => void;
  onEditCandidate?: () => void;
}

export const DuplicateCompareModal: React.FC<DuplicateCompareModalProps> = ({
  candidate,
  match,
  onClose,
  onKeepCandidate,
  onEditCandidate,
}) => {
  const existing = match.existingQuestion;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#090d16] border border-amber-500/40 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#060910]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Phát hiện nghi trùng câu hỏi
                </h3>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    match.isExact
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  {match.isExact ? '100% Trùng khớp tuyệt đối' : `${match.similarityScore}% Độ tương đồng`}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Đối chiếu nội dung giữa câu hỏi mới và câu hỏi đang lưu trong ngân hàng
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

        {/* Body: Side-by-Side Comparison */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Overlapping Tokens */}
          {match.matchedTokens.length > 0 && (
            <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl space-y-1.5">
              <span className="font-bold text-amber-300 block text-[11px] uppercase tracking-wider">
                Các từ ngữ & cụm trùng lặp chính ({match.matchedTokens.length} từ):
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {match.matchedTokens.map((tok, i) => (
                  <span
                    key={i}
                    className="bg-amber-900/40 text-amber-200 border border-amber-700/50 px-2 py-0.5 rounded text-[11px] font-mono"
                  >
                    {tok}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Grid Side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: New Candidate */}
            <div className="p-4 bg-[#060910] border border-blue-500/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-blue-400 uppercase tracking-wider text-[11px]">
                  Câu hỏi mới (Đang tạo / Import)
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  {candidate.type}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Môn / Khối:</span>
                <span className="font-semibold text-slate-200">
                  {candidate.subject} · {candidate.grade}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Nội dung đề bài:</span>
                <div className="p-3 bg-[#090d16] border border-slate-800 rounded-lg text-slate-100 font-medium whitespace-pre-line leading-relaxed">
                  {candidate.content}
                </div>
              </div>

              {candidate.options && (
                <div className="space-y-1">
                  <span className="text-slate-500 block">Các lựa chọn:</span>
                  <div className="space-y-1 pl-1">
                    {candidate.options.map((opt, i) => (
                      <div key={i} className="text-slate-300">
                        <b>{String.fromCharCode(65 + i)}.</b> {opt}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Existing Question */}
            <div className="p-4 bg-[#060910] border border-amber-500/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                  Câu hỏi đã có trong ngân hàng
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {existing.type}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Môn / Khối:</span>
                <span className="font-semibold text-slate-200">
                  {existing.subject} · {existing.grade}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Nội dung đề bài:</span>
                <div className="p-3 bg-[#090d16] border border-slate-800 rounded-lg text-slate-100 font-medium whitespace-pre-line leading-relaxed">
                  {existing.content}
                </div>
              </div>

              {existing.options && (
                <div className="space-y-1">
                  <span className="text-slate-500 block">Các lựa chọn:</span>
                  <div className="space-y-1 pl-1">
                    {existing.options.map((opt, i) => (
                      <div key={i} className="text-slate-300">
                        <b>{String.fromCharCode(65 + i)}.</b> {opt}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-[#060910] flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold transition"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            {onEditCandidate && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditCandidate();
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition"
              >
                Chỉnh sửa câu mới
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onKeepCandidate();
                onClose();
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <Check className="w-3.5 h-3.5" /> Bỏ qua cảnh báo & Vẫn lưu câu mới
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
