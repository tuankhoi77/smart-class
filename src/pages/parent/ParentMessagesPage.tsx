import React, { useState } from 'react';
import { MessageSquare, Send, User, Check, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { storage } from '../../services/storage';
import { ParentMessage } from '../../types';

export const ParentMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const child = storage.getStudentById(user?.childrenIds?.[0] || 'stu_1') || storage.getStudents()[0];

  const [messages, setMessages] = useState<ParentMessage[]>(() =>
    storage.getParentMessages().filter((m) => m.studentName === child.fullName)
  );

  const [inputText, setInputText] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ParentMessage = {
      id: 'msg_' + Date.now(),
      parentId: user?.id || 'u_parent_1',
      parentName: user?.name || 'Lê Tiến Thành',
      teacherId: 'u_teacher_1',
      teacherName: 'Thầy Nguyễn Văn An',
      studentName: child.fullName,
      senderRole: 'parent',
      message: inputText,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    storage.sendParentMessage(newMsg);
    setMessages([...messages, newMsg]);
    setInputText('');

    // Simulate teacher automated acknowledgment after 1.5 seconds if test interaction
    setTimeout(() => {
      const reply: ParentMessage = {
        id: 'msg_' + (Date.now() + 1),
        parentId: user?.id || 'u_parent_1',
        parentName: user?.name || 'Lê Tiến Thành',
        teacherId: 'u_teacher_1',
        teacherName: 'Thầy Nguyễn Văn An',
        studentName: child.fullName,
        senderRole: 'teacher',
        message: `Chào gia đình em ${child.fullName}, thầy đã nhận được tin nhắn và sẽ theo dõi, phản hồi cụ thể cho phụ huynh nhé!`,
        timestamp: new Date().toISOString(),
        isRead: true,
      };
      storage.sendParentMessage(reply);
      setMessages((prev) => [...prev, reply]);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Trao đổi với Giáo viên chủ nhiệm</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Kênh liên lạc trực tiếp giữa Phụ huynh em {child.fullName} và Thầy Nguyễn Văn An
        </p>
      </div>

      {/* Chat Window Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col h-[65vh] overflow-hidden">
        {/* Chat Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              GV
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Thầy Nguyễn Văn An</div>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Trực tuyến hỗ trợ
              </span>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium">Lớp {child.className}</span>
        </div>

        {/* Messages List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3.5 text-xs bg-slate-50/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.senderRole === 'parent' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="text-[10px] text-slate-400 mb-1">
                {m.senderRole === 'parent' ? 'Bạn (Phụ huynh)' : m.teacherName}
              </div>
              <div
                className={`p-3.5 rounded-2xl max-w-md leading-relaxed shadow-2xs ${
                  m.senderRole === 'parent'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                {m.message}
              </div>
              <div className="text-[9px] text-slate-400 mt-1">
                {new Date(m.timestamp).toLocaleTimeString('vi-VN')}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
          <input
            type="text"
            required
            placeholder="Nhập tin nhắn gửi thầy/cô chủ nhiệm..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Send className="w-4 h-4" /> Gửi
          </button>
        </form>
      </div>
    </div>
  );
};
