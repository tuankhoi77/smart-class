import React, { useState, useEffect, useMemo } from 'react';
import {
  Database,
  Plus,
  Sparkles,
  Upload,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Copy,
  Edit,
  Trash2,
  Eye,
  Archive,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Check,
  RotateCcw,
  BookOpen,
  Edit3,
  Zap,
  Target,
  Award,
  CheckSquare,
  ToggleLeft,
  Edit2,
  FileText,
  ArrowLeftRight,
  ListOrdered,
  MessageSquare,
  XCircle,
  FileEdit,
} from 'lucide-react';
import {
  BankQuestion,
  BankQuestionType,
  QuestionDifficulty,
  QuestionStatus,
  QuestionBankFilter,
} from '../../types/questionBank';
import { questionBankStorage } from '../../services/questionBankStorage';
import { QuestionDetailModal } from '../../components/teacher/question-bank/QuestionDetailModal';
import { QuestionFormModal } from '../../components/teacher/question-bank/QuestionFormModal';
import { AIQuestionGeneratorModal } from '../../components/teacher/question-bank/AIQuestionGeneratorModal';
import { ImportQuestionModal } from '../../components/teacher/question-bank/ImportQuestionModal';
import { ExportQuestionModal } from '../../components/teacher/question-bank/ExportQuestionModal';
import { Tab1Import } from '../../components/teacher/question-bank/tabs/Tab1Import';
import { Tab2AIGenerate } from '../../components/teacher/question-bank/tabs/Tab2AIGenerate';
import { Tab3ManualCreate } from '../../components/teacher/question-bank/tabs/Tab3ManualCreate';

const SUBJECTS = [
  'Tất cả môn',
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

const GRADES = ['Tất cả khối', 'Lớp 10', 'Lớp 11', 'Lớp 12', 'Khối 6', 'Khối 7', 'Khối 8', 'Khối 9'];

const TYPE_LABELS: Record<string, string> = {
  all: 'Tất cả dạng câu',
  single_choice: 'Trắc nghiệm 1 đáp án',
  multiple_choice: 'Trắc nghiệm nhiều đáp án',
  true_false_group: 'Đúng / Sai từng ý',
  matching: 'Ghép đôi',
  ordering: 'Sắp xếp thứ tự',
  fill_blank: 'Điền khuyết',
  short_answer: 'Trả lời ngắn',
  essay: 'Tự luận',
  passage_group: 'Đoạn văn / Tình huống',
};

const TYPE_CONFIG_MAP: Record<
  string,
  { shortLabel: string; fullLabel: string; icon: React.FC<{ className?: string }>; iconColor: string }
> = {
  single_choice: { shortLabel: '1 đáp án', fullLabel: 'Trắc nghiệm 1 đáp án', icon: CheckCircle2, iconColor: 'text-blue-400' },
  multiple_choice: { shortLabel: 'Nhiều đáp án', fullLabel: 'Trắc nghiệm nhiều đáp án', icon: CheckSquare, iconColor: 'text-indigo-400' },
  true_false_group: { shortLabel: 'Đúng/Sai', fullLabel: 'Đúng / Sai từng ý', icon: ToggleLeft, iconColor: 'text-emerald-400' },
  fill_blank: { shortLabel: 'Điền khuyết', fullLabel: 'Điền vào chỗ trống', icon: Edit2, iconColor: 'text-cyan-400' },
  essay: { shortLabel: 'Tự luận', fullLabel: 'Tự luận chấm điểm', icon: FileText, iconColor: 'text-rose-400' },
  matching: { shortLabel: 'Ghép đôi', fullLabel: 'Nối ghép cặp đôi', icon: ArrowLeftRight, iconColor: 'text-amber-400' },
  ordering: { shortLabel: 'Thứ tự', fullLabel: 'Sắp xếp thứ tự', icon: ListOrdered, iconColor: 'text-purple-400' },
  short_answer: { shortLabel: 'Trả lời ngắn', fullLabel: 'Trả lời ngắn', icon: MessageSquare, iconColor: 'text-teal-400' },
  passage_group: { shortLabel: 'Chùm câu', fullLabel: 'Đoạn văn / Tình huống', icon: Layers, iconColor: 'text-fuchsia-400' },
};

const DIFFICULTY_MAP: Record<
  string,
  { label: string; fullLabel: string; color: string; bg: string; border: string; icon: React.FC<{ className?: string }> }
> = {
  knowledge: { label: 'NB', fullLabel: 'Nhận biết', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', icon: Zap },
  comprehension: { label: 'TH', fullLabel: 'Thông hiểu', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: BookOpen },
  application: { label: 'VD', fullLabel: 'Vận dụng', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Target },
  high_application: { label: 'VDC', fullLabel: 'Vận dụng cao', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: Award },
};

const STATUS_MAP: Record<
  string,
  { label: string; fullLabel: string; color: string; bg: string; border: string; icon: React.FC<{ className?: string }> }
> = {
  approved: { label: 'Duyệt', fullLabel: 'Đã duyệt', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2 },
  pending: { label: 'Chờ', fullLabel: 'Chờ duyệt', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Clock },
  draft: { label: 'Nháp', fullLabel: 'Bản nháp', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: FileEdit },
  rejected: { label: 'Từ chối', fullLabel: 'Từ chối', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: XCircle },
  archived: { label: 'Lưu trữ', fullLabel: 'Đã lưu trữ', color: 'text-slate-500', bg: 'bg-slate-800', border: 'border-slate-700', icon: Archive },
};

export const QuestionBankPage: React.FC = () => {
  // Questions list loaded from persistence
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'points'>('newest');

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Main view tab: 'bank' (table & stats), 'import' (Tab 1), 'ai' (Tab 2), 'manual' (Tab 3)
  const [mainTab, setMainTab] = useState<'bank' | 'import' | 'ai' | 'manual'>('bank');

  // Modals state
  const [activeModal, setActiveModal] = useState<
    'form' | 'ai' | 'import' | 'export' | 'detail' | null
  >(null);
  const [modalQuestion, setModalQuestion] = useState<BankQuestion | null>(null);

  // Confirm delete dialog state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBatchDelete, setConfirmBatchDelete] = useState(false);

  // Load questions on mount
  const loadData = () => {
    const list = questionBankStorage.getQuestions();
    setQuestions(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // KPIs
  const stats = useMemo(() => {
    const total = questions.length;
    const approved = questions.filter((q) => q.status === 'approved').length;
    const pending = questions.filter((q) => q.status === 'pending').length;
    const draft = questions.filter((q) => q.status === 'draft').length;
    const knowledge = questions.filter((q) => q.difficulty === 'knowledge').length;
    const comprehension = questions.filter((q) => q.difficulty === 'comprehension').length;
    const application = questions.filter((q) => q.difficulty === 'application').length;
    const highApp = questions.filter((q) => q.difficulty === 'high_application').length;

    return { total, approved, pending, draft, knowledge, comprehension, application, highApp };
  }, [questions]);

  // Filtering
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Search text
      if (search) {
        const query = search.toLowerCase();
        const matchContent = q.content.toLowerCase().includes(query);
        const matchCode = q.code.toLowerCase().includes(query);
        const matchTopic = q.topic.toLowerCase().includes(query);
        const matchTags = q.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchContent && !matchCode && !matchTopic && !matchTags) return false;
      }

      // Subject
      if (selectedSubject !== 'all' && q.subject !== selectedSubject) return false;

      // Grade
      if (selectedGrade !== 'all' && q.grade !== selectedGrade) return false;

      // Type
      if (selectedType !== 'all' && q.type !== selectedType) return false;

      // Difficulty
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;

      // Status
      if (selectedStatus !== 'all' && q.status !== selectedStatus) return false;

      // Source
      if (selectedSource !== 'all' && q.source !== selectedSource) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortBy === 'oldest') return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      if (sortBy === 'points') return b.points - a.points;
      return 0;
    });
  }, [
    questions,
    search,
    selectedSubject,
    selectedGrade,
    selectedType,
    selectedDifficulty,
    selectedStatus,
    selectedSource,
    sortBy,
  ]);

  // Paginated items
  const totalPages = Math.ceil(filteredQuestions.length / pageSize) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, page]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [search, selectedSubject, selectedGrade, selectedType, selectedDifficulty, selectedStatus, selectedSource, sortBy]);

  // Select all / toggle
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedQuestions.map((q) => q.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk actions
  const handleBulkApprove = () => {
    questionBankStorage.batchUpdateStatus(selectedIds, 'approved');
    loadData();
    setSelectedIds([]);
    showToast(`Đã duyệt thành công ${selectedIds.length} câu hỏi vào ngân hàng chính thức.`);
  };

  const handleBulkPending = () => {
    questionBankStorage.batchUpdateStatus(selectedIds, 'pending');
    loadData();
    setSelectedIds([]);
    showToast(`Đã chuyển ${selectedIds.length} câu hỏi về trạng thái Chờ duyệt.`);
  };

  const handleBulkArchive = () => {
    questionBankStorage.batchUpdateStatus(selectedIds, 'archived');
    loadData();
    setSelectedIds([]);
    showToast(`Đã lưu trữ ${selectedIds.length} câu hỏi.`);
  };

  const handleExecuteBatchDelete = () => {
    questionBankStorage.batchDelete(selectedIds);
    loadData();
    const count = selectedIds.length;
    setSelectedIds([]);
    setConfirmBatchDelete(false);
    showToast(`Đã xóa vĩnh viễn ${count} câu hỏi.`);
  };

  // Single Question Actions
  const handleSaveQuestion = (savedQ: BankQuestion) => {
    const existing = questions.find((q) => q.id === savedQ.id);
    if (existing) {
      questionBankStorage.updateQuestion(savedQ.id, savedQ);
      showToast(`Đã cập nhật câu hỏi [${savedQ.code}].`);
    } else {
      questionBankStorage.addQuestion(savedQ);
      showToast(`Đã thêm mới câu hỏi [${savedQ.code}] vào ngân hàng.`);
    }
    loadData();
    setActiveModal(null);
  };

  const handleDuplicate = (q: BankQuestion) => {
    const dup = questionBankStorage.duplicateQuestion(q.id);
    if (dup) {
      loadData();
      showToast(`Đã sao chép thành công câu hỏi [${dup.code}].`);
    }
  };

  const handleDeleteSingle = (id: string) => {
    questionBankStorage.deleteQuestion(id);
    loadData();
    setConfirmDeleteId(null);
    showToast('Đã xóa câu hỏi khỏi ngân hàng.');
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedSubject('all');
    setSelectedGrade('all');
    setSelectedType('all');
    setSelectedDifficulty('all');
    setSelectedStatus('all');
    setSelectedSource('all');
  };

  const hasActiveFilters =
    search !== '' ||
    selectedSubject !== 'all' ||
    selectedGrade !== 'all' ||
    selectedType !== 'all' ||
    selectedDifficulty !== 'all' ||
    selectedStatus !== 'all' ||
    selectedSource !== 'all';

  return (
    <div className="space-y-6 pb-12">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#090d16] border border-cyan-500/50 text-cyan-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Database className="w-4 h-4 text-cyan-400" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Ngân hàng câu hỏi
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý, tạo mới và xuất bản câu hỏi kiểm tra
          </p>
        </div>

        {/* Header Right Action: Export */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveModal('export')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#090d16] hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" /> Xuất dữ liệu (Export)
          </button>
        </div>
      </div>

      {/* Tabs ordered from Tab 1 to Tab 3 from Left to Right */}
      <div className="bg-[#090d16] border border-slate-800 p-1.5 rounded-2xl flex flex-wrap items-center gap-1.5 shadow-xl">
        {/* TAB 1: Import */}
        <button
          type="button"
          onClick={() => setMainTab('import')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            mainTab === 'import'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/50 shadow-md shadow-emerald-500/10'
              : 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10'
          }`}
        >
          <Upload className="w-4 h-4 text-emerald-400" />
          <span>Tab 1: Import</span>
        </button>

        {/* TAB 2: AI */}
        <button
          type="button"
          onClick={() => setMainTab('ai')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            mainTab === 'ai'
              ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/10'
              : 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Tab 2: Tạo bằng AI</span>
        </button>

        {/* TAB 3: Tạo bằng tay */}
        <button
          type="button"
          onClick={() => setMainTab('manual')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            mainTab === 'manual'
              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/50 shadow-md shadow-blue-500/10'
              : 'text-slate-400 hover:text-blue-300 hover:bg-blue-500/10'
          }`}
        >
          <Edit3 className="w-4 h-4 text-blue-400" />
          <span>Tab 3: Tạo bằng tay</span>
        </button>

        {/* KHO CÂU HỎI */}
        <button
          type="button"
          onClick={() => setMainTab('bank')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            mainTab === 'bank'
              ? 'bg-slate-800 text-white shadow-md border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Database className="w-4 h-4 text-blue-400" />
          <span>Kho câu hỏi</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-900 border border-slate-700 text-slate-300 font-mono">
            {questions.length}
          </span>
        </button>
      </div>

      {mainTab === 'bank' && (
        <>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Tổng số */}
        <div className="bg-[#090d16] border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Tổng số câu hỏi</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Database className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">{stats.total}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Trong kho lưu trữ giáo viên
          </span>
        </div>

        {/* Card 2: Đã duyệt */}
        <div className="bg-[#090d16] border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Đã duyệt chính thức</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">{stats.approved}</div>
          <span className="text-[11px] text-emerald-500/80 mt-1 block">
            Sẵn sàng đưa vào đề thi ({stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%)
          </span>
        </div>

        {/* Card 3: Bản nháp & Chờ duyệt */}
        <div className="bg-[#090d16] border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Chờ duyệt / Bản nháp</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2 font-mono">
            {stats.pending + stats.draft}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {stats.pending} chờ duyệt · {stats.draft} bản nháp
          </span>
        </div>

        {/* Card 4: Mức độ tư duy */}
        <div className="bg-[#090d16] border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Phân bố mức độ</span>
            <span className="text-[10px] text-cyan-400 font-bold">4 Cấp độ</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
            <div className="bg-[#060910] p-1.5 rounded border border-slate-800/80">
              <span className="text-sky-400 font-bold block">{stats.knowledge}</span>
              <span className="text-slate-500 text-[9px]">Biết</span>
            </div>
            <div className="bg-[#060910] p-1.5 rounded border border-slate-800/80">
              <span className="text-emerald-400 font-bold block">{stats.comprehension}</span>
              <span className="text-slate-500 text-[9px]">Hiểu</span>
            </div>
            <div className="bg-[#060910] p-1.5 rounded border border-slate-800/80">
              <span className="text-amber-400 font-bold block">{stats.application}</span>
              <span className="text-slate-500 text-[9px]">VD</span>
            </div>
            <div className="bg-[#060910] p-1.5 rounded border border-slate-800/80">
              <span className="text-rose-400 font-bold block">{stats.highApp}</span>
              <span className="text-slate-500 text-[9px]">VDC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#090d16] border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
        {/* Top search & quick sorts */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm nội dung câu hỏi, chủ đề hoặc từ khóa..."
              className="w-full pl-10 pr-4 py-2 bg-[#060910] border border-slate-800 rounded-xl text-slate-100 text-xs outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs text-slate-400 font-medium">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-[#060910] border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 outline-none font-semibold"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="points">Điểm cao nhất</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-lg text-xs font-semibold transition"
              >
                <X className="w-3.5 h-3.5" /> Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Multi-Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
          {/* 1. Môn học */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Môn học:
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full text-xs bg-[#060910] border border-slate-800 text-slate-200 rounded-lg px-2 py-1.5 outline-none font-medium"
            >
              <option value="all">Tất cả môn học</option>
              {SUBJECTS.filter((s) => s !== 'Tất cả môn').map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Khối lớp */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Khối lớp:
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full text-xs bg-[#060910] border border-slate-800 text-slate-200 rounded-lg px-2 py-1.5 outline-none font-medium"
            >
              <option value="all">Tất cả khối lớp</option>
              {GRADES.filter((g) => g !== 'Tất cả khối').map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Dạng câu hỏi (9 dạng) */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Dạng câu hỏi:
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs bg-[#060910] border border-slate-800 text-slate-200 rounded-lg px-2 py-1.5 outline-none font-medium"
            >
              {Object.entries(TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Mức độ tư duy */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Mức độ:
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full text-xs bg-[#060910] border border-slate-800 text-slate-200 rounded-lg px-2 py-1.5 outline-none font-medium"
            >
              <option value="all">Tất cả mức độ</option>
              <option value="knowledge">Nhận biết</option>
              <option value="comprehension">Thông hiểu</option>
              <option value="application">Vận dụng</option>
              <option value="high_application">Vận dụng cao</option>
            </select>
          </div>

          {/* 5. Trạng thái duyệt */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Trạng thái:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs bg-[#060910] border border-slate-800 text-slate-200 rounded-lg px-2 py-1.5 outline-none font-medium"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="approved">Đã duyệt</option>
              <option value="pending">Chờ duyệt</option>
              <option value="draft">Bản nháp</option>
              <option value="archived">Lưu trữ</option>
            </select>
          </div>

          {/* 6. Nguồn tạo */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Nguồn tạo:
            </label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full text-xs bg-[#060910] border border-slate-800 text-slate-200 rounded-lg px-2 py-1.5 outline-none font-medium"
            >
              <option value="all">Tất cả nguồn</option>
              <option value="manual">Thủ công</option>
              <option value="ai">AI đề xuất</option>
              <option value="import">Import tệp</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar (when selected) */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-blue-950/40 border border-blue-500/50 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white bg-blue-600 px-2 py-0.5 rounded font-mono">
              {selectedIds.length}
            </span>
            <span className="text-slate-200 font-medium">câu hỏi đang được chọn</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleBulkApprove}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Duyệt tất cả câu hỏi được chọn"
            >
              <Check className="w-3.5 h-3.5" /> Duyệt
            </button>

            <button
              type="button"
              onClick={handleBulkPending}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Chuyển sang trạng thái chờ duyệt"
            >
              <Clock className="w-3.5 h-3.5" /> Chờ
            </button>

            <button
              type="button"
              onClick={handleBulkArchive}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Lưu trữ câu hỏi"
            >
              <Archive className="w-3.5 h-3.5" /> Lưu trữ
            </button>

            <button
              type="button"
              onClick={() => setConfirmBatchDelete(true)}
              className="px-3 py-1.5 bg-rose-600/30 text-rose-300 hover:bg-rose-600/40 border border-rose-500/40 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Xóa các câu hỏi đã chọn"
            >
              <Trash2 className="w-3.5 h-3.5" /> Xóa ({selectedIds.length})
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
              title="Bỏ chọn tất cả"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Questions List: Desktop Table + Mobile Cards */}
      <div className="bg-[#090d16] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {filteredQuestions.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center space-y-3 p-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-500 mx-auto">
              <Database className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-200">Không tìm thấy câu hỏi phù hợp</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {hasActiveFilters
                  ? 'Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bấm Xóa bộ lọc để xem toàn bộ câu hỏi.'
                  : 'Chưa có câu hỏi nào trong ngân hàng. Bấm "Tạo câu hỏi" hoặc "AI tạo câu hỏi" để bắt đầu.'}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-semibold transition"
              >
                Xóa toàn bộ bộ lọc
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-[#060910] text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          paginatedQuestions.length > 0 &&
                          paginatedQuestions.every((q) => selectedIds.includes(q.id))
                        }
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3 w-36">Dạng câu</th>
                    <th className="py-3 px-3">Nội dung câu hỏi & Lời giải</th>
                    <th className="py-3 px-3 w-32">Môn / Khối</th>
                    <th className="py-3 px-3 w-20 text-center">Mức độ</th>
                    <th className="py-3 px-3 w-16 text-center">Điểm</th>
                    <th className="py-3 px-3 w-24 text-center">Trạng thái</th>
                    <th className="py-3 px-3 w-24 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {paginatedQuestions.map((q) => {
                    const isSelected = selectedIds.includes(q.id);
                    const diffConfig = DIFFICULTY_MAP[q.difficulty] || DIFFICULTY_MAP.knowledge;
                    const statusConfig = STATUS_MAP[q.status] || STATUS_MAP.pending;
                    const typeConfig = TYPE_CONFIG_MAP[q.type] || {
                      shortLabel: q.type,
                      fullLabel: q.type,
                      icon: Layers,
                      iconColor: 'text-slate-400',
                    };

                    return (
                      <tr
                        key={q.id}
                        className={`transition hover:bg-slate-900/50 ${
                          isSelected ? 'bg-blue-950/20' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(q.id)}
                            className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                          />
                        </td>

                        {/* Dạng câu hỏi với Icon gọn gàng */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <typeConfig.icon className={`w-3.5 h-3.5 shrink-0 ${typeConfig.iconColor}`} />
                            <span className="font-semibold text-slate-200">
                              {typeConfig.shortLabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                            {q.source === 'ai' ? (
                              <span className="inline-flex items-center gap-0.5 text-purple-400 font-medium">
                                <Sparkles className="w-2.5 h-2.5" /> AI
                              </span>
                            ) : q.source === 'import' ? (
                              <span className="inline-flex items-center gap-0.5 text-cyan-400 font-medium">
                                <Upload className="w-2.5 h-2.5" /> Import
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-slate-400 font-medium">
                                <Edit3 className="w-2.5 h-2.5" /> Thủ công
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Nội dung tóm tắt */}
                        <td className="py-3 px-3 max-w-md">
                          <div
                            onClick={() => {
                              setModalQuestion(q);
                              setActiveModal('detail');
                            }}
                            className="font-medium text-slate-100 hover:text-cyan-300 cursor-pointer line-clamp-2 leading-relaxed"
                          >
                            {q.content}
                          </div>
                          {q.explanation && (
                            <span className="text-[11px] text-slate-400 italic block mt-1 line-clamp-1">
                              Lời giải: {q.explanation}
                            </span>
                          )}
                        </td>

                        {/* Môn & Khối */}
                        <td className="py-3 px-3">
                          <span className="font-bold text-white block">{q.subject}</span>
                          <span className="text-[11px] text-slate-400 truncate block max-w-[130px]" title={q.topic}>
                            {q.grade} · {q.topic}
                          </span>
                        </td>

                        {/* Mức độ - Icon + nhãn ngắn gọn */}
                        <td className="py-3 px-3 text-center">
                          <span
                            title={diffConfig.fullLabel}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${diffConfig.bg} ${diffConfig.color} ${diffConfig.border}`}
                          >
                            <diffConfig.icon className="w-3 h-3 shrink-0" />
                            <span>{diffConfig.label}</span>
                          </span>
                        </td>

                        {/* Điểm */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">
                          {q.points}
                        </td>

                        {/* Trạng thái - Icon + nhãn ngắn gọn */}
                        <td className="py-3 px-3 text-center">
                          <span
                            title={statusConfig.fullLabel}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
                          >
                            <statusConfig.icon className="w-3 h-3 shrink-0" />
                            <span>{statusConfig.label}</span>
                          </span>
                        </td>

                        {/* Thao tác */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setModalQuestion(q);
                                setActiveModal('detail');
                              }}
                              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setModalQuestion(q);
                                setActiveModal('form');
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDuplicate(q)}
                              className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                              title="Nhân bản"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(q.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                              title="Xóa câu hỏi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-slate-800 p-3 space-y-3">
              {paginatedQuestions.map((q) => {
                const isSelected = selectedIds.includes(q.id);
                const diffConfig = DIFFICULTY_MAP[q.difficulty] || DIFFICULTY_MAP.knowledge;
                const statusConfig = STATUS_MAP[q.status] || STATUS_MAP.pending;
                const typeConfig = TYPE_CONFIG_MAP[q.type] || {
                  shortLabel: q.type,
                  fullLabel: q.type,
                  icon: Layers,
                  iconColor: 'text-slate-400',
                };

                return (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-xl border transition space-y-2.5 ${
                      isSelected ? 'bg-blue-950/20 border-blue-500/40' : 'bg-[#060910] border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(q.id)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <div className="flex items-center gap-1.5">
                          <typeConfig.icon className={`w-3.5 h-3.5 ${typeConfig.iconColor}`} />
                          <span className="text-xs font-semibold text-slate-200">
                            {typeConfig.shortLabel}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          title={diffConfig.fullLabel}
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold border ${diffConfig.bg} ${diffConfig.color} ${diffConfig.border}`}
                        >
                          <diffConfig.icon className="w-2.5 h-2.5" />
                          <span>{diffConfig.label}</span>
                        </span>

                        <span
                          title={statusConfig.fullLabel}
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
                        >
                          <statusConfig.icon className="w-2.5 h-2.5" />
                          <span>{statusConfig.label}</span>
                        </span>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setModalQuestion(q);
                        setActiveModal('detail');
                      }}
                      className="text-slate-100 font-medium text-xs leading-relaxed line-clamp-2 cursor-pointer"
                    >
                      {q.content}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/70 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300 font-semibold">{q.subject}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">{q.grade}</span>
                        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">{q.points}đ</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setModalQuestion(q);
                            setActiveModal('detail');
                          }}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setModalQuestion(q);
                            setActiveModal('form');
                          }}
                          className="p-1 text-slate-400 hover:text-blue-400"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(q)}
                          className="p-1 text-slate-400 hover:text-purple-400"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(q.id)}
                          className="p-1 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-800 bg-[#060910] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-400">
                Hiển thị {(page - 1) * pageSize + 1} -{' '}
                {Math.min(page * pageSize, filteredQuestions.length)} trong tổng số{' '}
                <span className="font-bold text-white font-mono">{filteredQuestions.length}</span> câu hỏi
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg font-semibold flex items-center gap-1 transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Trước
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setPage(pNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                        page === pNum
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {pNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg font-semibold flex items-center gap-1 transition"
                >
                  Sau <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Dialog for Single Delete */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Xác nhận xóa câu hỏi</h3>
                <p className="text-xs text-slate-400">Hành động này không thể hoàn tác</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn câu hỏi này khỏi ngân hàng không?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSingle(confirmDeleteId)}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Batch Delete */}
      {confirmBatchDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Xóa hàng loạt câu hỏi</h3>
                <p className="text-xs text-slate-400">
                  {selectedIds.length} câu hỏi được chọn
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn toàn bộ {selectedIds.length} câu hỏi đã chọn không?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmBatchDelete(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteBatchDelete}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Xác nhận xóa tất cả
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      )}

      {/* TAB 1: Import từ Word/Excel/CSV */}
      {mainTab === 'import' && (
        <Tab1Import
          existingQuestions={questions}
          onImportSuccess={(newQuestions) => {
            questionBankStorage.addQuestions(newQuestions);
            loadData();
            showToast(`Đã import thành công ${newQuestions.length} câu hỏi vào ngân hàng!`);
            setMainTab('bank');
          }}
        />
      )}

      {/* TAB 2: Tạo bằng AI thông minh */}
      {mainTab === 'ai' && (
        <Tab2AIGenerate
          existingQuestions={questions}
          onSaveApproved={(approvedList) => {
            questionBankStorage.addQuestions(approvedList);
            loadData();
            showToast(`Đã lưu ${approvedList.length} câu hỏi AI vào ngân hàng!`);
            setMainTab('bank');
          }}
        />
      )}

      {/* TAB 3: Tạo câu hỏi bằng tay */}
      {mainTab === 'manual' && (
        <Tab3ManualCreate
          existingQuestions={questions}
          onSaveQuestion={(newQuestion) => {
            questionBankStorage.addQuestion(newQuestion);
            loadData();
            showToast(`Đã thêm mới câu hỏi [${newQuestion.code}] vào ngân hàng!`);
            setMainTab('bank');
          }}
        />
      )}

      {/* Modal 1: Detail Modal */}
      {activeModal === 'detail' && (
        <QuestionDetailModal
          question={modalQuestion}
          onClose={() => setActiveModal(null)}
          onEdit={(q) => {
            setModalQuestion(q);
            setActiveModal('form');
          }}
          onDuplicate={(q) => {
            handleDuplicate(q);
            setActiveModal(null);
          }}
        />
      )}

      {/* Modal 2: Form Modal (Create / Edit) */}
      {activeModal === 'form' && (
        <QuestionFormModal
          initialQuestion={modalQuestion}
          existingQuestions={questions}
          onClose={() => setActiveModal(null)}
          onSave={handleSaveQuestion}
        />
      )}

      {/* Modal 3: AI Generator Modal */}
      {activeModal === 'ai' && (
        <AIQuestionGeneratorModal
          existingQuestions={questions}
          onClose={() => setActiveModal(null)}
          onSaveApproved={(approvedList) => {
            questionBankStorage.addQuestions(approvedList);
            loadData();
            showToast(`Đã thêm thành công ${approvedList.length} câu hỏi AI vào ngân hàng.`);
          }}
        />
      )}

      {/* Modal 4: Import Modal */}
      {activeModal === 'import' && (
        <ImportQuestionModal
          existingQuestions={questions}
          onClose={() => setActiveModal(null)}
          onImportSuccess={(importedList) => {
            questionBankStorage.addQuestions(importedList);
            loadData();
            showToast(`Đã nhập thành công ${importedList.length} câu hỏi vào ngân hàng.`);
          }}
        />
      )}

      {/* Modal 5: Export Modal */}
      {activeModal === 'export' && (
        <ExportQuestionModal
          selectedQuestions={questions.filter((q) => selectedIds.includes(q.id))}
          filteredQuestions={filteredQuestions}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};
