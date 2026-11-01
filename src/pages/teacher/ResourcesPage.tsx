import React, { useState } from 'react';
import {
  FolderArchive,
  FileText,
  Video,
  Link as LinkIcon,
  Download,
  Heart,
  Search,
  Plus,
  Share2,
  Eye,
  Sparkles,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { ResourceDocument } from '../../types';

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<ResourceDocument[]>(() => storage.getResources());
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [previewItem, setPreviewItem] = useState<ResourceDocument | null>(null);

  const handleToggleFavorite = (id: string) => {
    storage.toggleFavoriteResource(id);
    setResources(storage.getResources());
  };

  const filtered = resources.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.chapter.toLowerCase().includes(search.toLowerCase());
    const matchType = selectedType === 'all' || r.type === selectedType;
    const matchSubject = selectedSubject === 'all' || r.subject === selectedSubject;
    return matchSearch && matchType && matchSubject;
  });

  const typeIcons: Record<string, any> = {
    pdf: FileText,
    pptx: FileText,
    docx: FileText,
    video: Video,
    link: LinkIcon,
    lesson_plan: Sparkles,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kho Học liệu số & Giáo án</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lưu trữ PDF, bài giảng điện tử PowerPoint, phiếu học tập và video bài giảng
          </p>
        </div>

        <button
          onClick={() => alert('Chọn tải lên tài liệu mới (Hỗ trợ PDF, Word, PPTX tối đa 50MB)')}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
        >
          <Plus className="w-4 h-4" /> Tải lên tài liệu mới
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên tài liệu, chương, bài giảng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none"
          >
            <option value="all">Mọi môn học</option>
            <option value="Toán học">Toán học</option>
            <option value="Vật lý">Vật lý</option>
            <option value="Ngữ văn">Ngữ văn</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none"
          >
            <option value="all">Mọi định dạng</option>
            <option value="pdf">Tài liệu PDF</option>
            <option value="pptx">Slide PowerPoint</option>
            <option value="docx">Văn bản Word</option>
            <option value="video">Video thí nghiệm</option>
          </select>
        </div>
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => {
          const Icon = typeIcons[item.type] || FileText;
          return (
            <div
              key={item.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.type.toUpperCase()}</span>
                  </div>
                  <button
                    onClick={() => handleToggleFavorite(item.id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        item.isFavorite ? 'fill-red-500 text-red-500' : ''
                      }`}
                    />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-2">{item.title}</h3>
                <div className="text-xs text-slate-500 mt-1">
                  {item.subject} · {item.gradeName}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{item.chapter}</div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">{item.size} · {item.downloads} lượt tải</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="p-1.5 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-50"
                    title="Xem trước"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => alert(`Bắt đầu tải xuống: ${item.title}`)}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    <Download className="w-3.5 h-3.5" /> Tải về
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">{previewItem.title}</h3>
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
              <FileText className="w-12 h-12 text-blue-600 mx-auto" />
              <div className="font-bold text-slate-800 text-xs">
                Xem trước tài liệu: {previewItem.title}
              </div>
              <p className="text-[11px] text-slate-500">
                Tác giả: {previewItem.authorName} · Dung lượng: {previewItem.size}
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  alert('Tải xuống tài liệu thành công!');
                  setPreviewItem(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
              >
                Tải về máy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
