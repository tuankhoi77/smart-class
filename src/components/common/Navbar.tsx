import React, { useState } from 'react';
import {
  Search,
  Plus,
  Bell,
  CheckCircle2,
  ChevronDown,
  User as UserIcon,
  LogOut,
  RotateCcw,
  Sparkles,
  BookOpen,
  UserCheck,
  FilePlus,
  GraduationCap,
  HelpCircle,
  Menu,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useClass } from '../../contexts/ClassContext';
import { storage } from '../../services/storage';
import { GlobalSearchModal } from './GlobalSearchModal';
import { UserRole } from '../../types';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, firebaseUser, role, switchRole, logout, loginWithGoogle } = useAuth();
  const { classes, currentClassId, setCurrentClassId } = useClass();
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const announcements = storage.getAnnouncements();
  const unreadAnnouncements = announcements.filter(
    (a) => !user || !a.readBy.includes(user.id)
  );

  const roleLabels: Record<UserRole, { label: string; badgeColor: string }> = {
    admin: { label: 'Admin', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' },
    teacher: { label: 'Giáo viên', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200' },
    student: { label: 'Học sinh', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    parent: { label: 'Phụ huynh', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
  };

  const handleResetData = () => {
    if (window.confirm('Khôi phục toàn bộ dữ liệu mẫu ban đầu của hệ thống?')) {
      storage.resetDatabase();
      window.location.reload();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-[#090d16] border-b border-slate-800/80 px-4 flex items-center justify-between shadow-lg shadow-black/40">
        {/* Left: Mobile Toggle & Brand & Class Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => {
              if (role === 'admin') navigate('/admin/dashboard');
              else if (role === 'teacher') navigate('/teacher/dashboard');
              else if (role === 'student') navigate('/student/dashboard');
              else if (role === 'parent') navigate('/parent/dashboard');
            }}
            className="flex items-center gap-2.5 cursor-pointer mr-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-sky-500/30 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-black text-cyan-300 tracking-tight group-hover:text-cyan-200 transition-colors block leading-tight">
                EdTech SmartClass
              </span>
            </div>
          </div>

          {/* Teacher Active Class Selector */}
          {role === 'teacher' && classes.length > 0 && (
            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-800">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <select
                value={currentClassId}
                onChange={(e) => setCurrentClassId(e.target.value)}
                className="text-xs font-semibold text-cyan-300 bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer focus:border-cyan-500 transition"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id} className="bg-slate-900 text-slate-100">
                    {cls.name} ({cls.studentCount} HS)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Center: Global Search Trigger */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between text-left text-xs text-slate-400 bg-slate-900/70 hover:bg-slate-900 hover:text-slate-200 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-lg transition"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Tìm kiếm học sinh, lớp, bài tập, học liệu...</span>
            </span>
            <kbd className="hidden lg:inline-block font-mono bg-slate-800 border border-slate-700 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right: Quick Action, Notifications, Role Switcher, Account */}
        <div className="flex items-center gap-2">
          {/* Mobile search icon */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Quick Action Button for Teacher */}
          {role === 'teacher' && (
            <div className="relative">
              <button
                onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-3 py-1.5 rounded-lg transition shadow-md shadow-blue-600/30 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Tạo nhanh</span>
              </button>

              {isQuickActionOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsQuickActionOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-800 py-1.5 z-50 text-xs">
                    <button
                      onClick={() => {
                        setIsQuickActionOpen(false);
                        navigate('/teacher/attendance');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:bg-slate-800 text-left font-medium hover:text-emerald-300 transition"
                    >
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      Điểm danh lớp hôm nay
                    </button>
                    <button
                      onClick={() => {
                        setIsQuickActionOpen(false);
                        navigate('/teacher/assignments');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:bg-slate-800 text-left font-medium hover:text-blue-300 transition"
                    >
                      <FilePlus className="w-4 h-4 text-blue-400" />
                      Giao bài tập mới
                    </button>
                    <button
                      onClick={() => {
                        setIsQuickActionOpen(false);
                        navigate('/teacher/ai');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:bg-slate-800 text-left font-medium hover:text-purple-300 transition"
                    >
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      AI Soạn đề / Giáo án
                    </button>
                    <button
                      onClick={() => {
                        setIsQuickActionOpen(false);
                        navigate('/teacher/students/import');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:bg-slate-800 text-left font-medium hover:text-indigo-300 transition"
                    >
                      <UserIcon className="w-4 h-4 text-indigo-400" />
                      Import danh sách học sinh
                    </button>
                    <button
                      onClick={() => {
                        setIsQuickActionOpen(false);
                        navigate('/teacher/announcements');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:bg-slate-800 text-left font-medium hover:text-amber-300 transition"
                    >
                      <Bell className="w-4 h-4 text-amber-400" />
                      Gửi thông báo lớp
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
              title="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {unreadAnnouncements.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              )}
              {unreadAnnouncements.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>

            {isNotificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsNotificationsOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-800 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Thông báo mới ({unreadAnnouncements.length})
                    </span>
                    <button
                      onClick={() => {
                        if (user) {
                          announcements.forEach((a) => storage.markAnnouncementRead(a.id, user.id));
                        }
                        setIsNotificationsOpen(false);
                      }}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      Đọc tất cả
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                    {announcements.slice(0, 5).map((a) => (
                      <div
                        key={a.id}
                        onClick={() => {
                          if (user) storage.markAnnouncementRead(a.id, user.id);
                          setIsNotificationsOpen(false);
                          if (role === 'parent') navigate('/parent/announcements');
                          else if (role === 'student') navigate('/student/announcements');
                          else navigate('/teacher/announcements');
                        }}
                        className="p-3 hover:bg-slate-800/80 cursor-pointer transition text-xs"
                      >
                        <div className="font-semibold text-slate-100 line-clamp-1">{a.title}</div>
                        <div className="text-slate-400 mt-0.5 line-clamp-2">{a.content}</div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {new Date(a.sentAt).toLocaleDateString('vi-VN')} · {a.senderName}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Role Switcher Pill Bar (Admin, GV, HS, PH) */}
          <div className="hidden xl:flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
            {(['teacher', 'student', 'parent', 'admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  switchRole(r);
                  navigate(`/${r}/dashboard`);
                }}
                className={`text-[11px] font-semibold px-2 py-1 rounded transition ${
                  role === r
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {roleLabels[r].label}
              </button>
            ))}
          </div>

          {/* Profile & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-900 transition"
            >
              <img
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                }
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-700 ring-2 ring-blue-500/30"
              />
              <div className="hidden md:block text-left text-xs">
                <div className="font-semibold text-slate-100 truncate max-w-[120px]">
                  {user?.name || 'Khách'}
                </div>
                <div className="text-[10px] text-cyan-400 font-medium">
                  {roleLabels[role]?.label}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
            </button>

            {isProfileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-800 py-1.5 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <div className="font-bold text-slate-100">{user?.name}</div>
                    <div className="text-slate-400 text-[11px]">{user?.email}</div>
                    <div className="mt-1 flex items-center justify-between">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-bold border bg-blue-950/60 text-cyan-300 border-cyan-700/60"
                      >
                        {roleLabels[role]?.label}
                      </span>
                      {firebaseUser && (
                        <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Firebase
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Firebase Google Auth */}
                  {!firebaseUser && (
                    <div className="p-2 border-b border-slate-800">
                      <button
                        onClick={async () => {
                          await loginWithGoogle();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Đăng nhập Google (Firebase)
                      </button>
                    </div>
                  )}

                  {/* Mobile Role Switcher */}
                  <div className="xl:hidden px-3 py-2 border-b border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Chuyển vai trò test
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {(['teacher', 'student', 'parent', 'admin'] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            switchRole(r);
                            setIsProfileMenuOpen(false);
                            navigate(`/${r}/dashboard`);
                          }}
                          className={`text-left px-2 py-1 rounded text-xs transition ${
                            role === r
                              ? 'bg-blue-600 text-white font-bold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {roleLabels[r].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      if (role === 'teacher') navigate('/teacher/profile');
                      else if (role === 'admin') navigate('/admin/settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-200 hover:bg-slate-800 text-left"
                  >
                    <UserIcon className="w-4 h-4 text-cyan-400" />
                    Hồ sơ & Tài khoản
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleResetData();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-amber-400 hover:bg-slate-800 text-left"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-400" />
                    Khôi phục dữ liệu mẫu
                  </button>

                  <div className="border-t border-slate-800 my-1" />

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-slate-800 text-left font-medium"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    Đăng xuất
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
