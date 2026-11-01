import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Dices,
  RotateCw,
  Users,
  Clock,
  HelpCircle,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Check,
  Award,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { useClass } from '../../contexts/ClassContext';

export const ClassroomToolsPage: React.FC = () => {
  const { currentClassId, currentClass } = useClass();
  const students = storage.getStudentsByClass(currentClassId || 'cls_10a1');

  const [activeTool, setActiveTool] = useState<'wheel' | 'random' | 'groups' | 'timer' | 'quick_quiz'>('wheel');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 1. LUCKY WHEEL & RANDOM PICKER STATE
  const [avoidRepeat, setAvoidRepeat] = useState(true);
  const [callHistory, setCallHistory] = useState<string[]>([]);
  const [chosenStudent, setChosenStudent] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinDeg, setSpinDeg] = useState(0);

  const eligibleStudents = students.filter(
    (s) => !avoidRepeat || !callHistory.includes(s.fullName)
  );

  const handleSpinWheel = () => {
    if (isSpinning || eligibleStudents.length === 0) return;

    setIsSpinning(true);
    setChosenStudent(null);

    const randomIdx = Math.floor(Math.random() * eligibleStudents.length);
    const winner = eligibleStudents[randomIdx];

    // Spin animation math
    const addedRounds = 5 + Math.floor(Math.random() * 3);
    const targetDegree = spinDeg + addedRounds * 360 + Math.floor(Math.random() * 360);
    setSpinDeg(targetDegree);

    setTimeout(() => {
      setIsSpinning(false);
      setChosenStudent(winner.fullName);
      setCallHistory((prev) => [winner.fullName, ...prev]);

      // Fire confetti celebration
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    }, 3000);
  };

  // 2. AUTO GROUP GENERATOR STATE
  const [groupCount, setGroupCount] = useState(4);
  const [generatedGroups, setGeneratedGroups] = useState<string[][]>([]);

  const handleGenerateGroups = () => {
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const groups: string[][] = Array.from({ length: groupCount }, () => []);

    shuffled.forEach((stu, i) => {
      groups[i % groupCount].push(stu.fullName);
    });

    setGeneratedGroups(groups);
  };

  // 3. COUNTDOWN TIMER & BELL STATE
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 mins
  const [timerRunning, setTimerRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false);
      if (soundEnabled) {
        // Simple synthetic web audio beep
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          osc.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 1);
        } catch (e) {
          // ignore
        }
      }
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds, soundEnabled]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 4. QUICK QUIZ STATE
  const [quickQuestion, setQuickQuestion] = useState('Khái niệm hàm số đồng biến khi nào?');
  const [quickVotes, setQuickVotes] = useState({ A: 12, B: 18, C: 4, D: 2 });

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900 text-white p-6 overflow-y-auto' : ''}`}>
      {/* Header and Projector Fullscreen Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-bold ${isFullscreen ? 'text-white' : 'text-slate-900'}`}>
            Bộ Công cụ Tương tác Lớp học
          </h1>
          <p className={`text-xs ${isFullscreen ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>
            Vòng quay may mắn, chọn học sinh ngẫu nhiên, chia nhóm, đồng hồ đếm ngược và trắc nghiệm trực quan máy chiếu
          </p>
        </div>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-xs ${
            isFullscreen
              ? 'bg-amber-400 text-slate-900 hover:bg-amber-300'
              : 'bg-slate-800 text-white hover:bg-slate-900'
          }`}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          {isFullscreen ? 'Thoát chế độ máy chiếu' : 'Chế độ máy chiếu Fullscreen'}
        </button>
      </div>

      {/* Tool Tabs */}
      <div className={`p-1 rounded-xl border flex overflow-x-auto text-xs ${
        isFullscreen ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        {[
          { id: 'wheel', label: '1. Vòng quay may mắn', icon: RotateCw },
          { id: 'random', label: '2. Gọi ngẫu nhiên', icon: Dices },
          { id: 'groups', label: '3. Chia nhóm tự động', icon: Users },
          { id: 'timer', label: '4. Đồng hồ đếm ngược', icon: Clock },
          { id: 'quick_quiz', label: '5. Quiz nhanh máy chiếu', icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTool === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTool(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : isFullscreen
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TOOL 1: LUCKY WHEEL */}
      {activeTool === 'wheel' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 p-8 rounded-2xl border flex flex-col items-center justify-center text-center ${
            isFullscreen ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            {/* Wheel Canvas Graphic */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 my-4 flex items-center justify-center">
              {/* Pointer */}
              <div className="absolute top-0 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-amber-400 drop-shadow-md" />

              {/* Rotating Circle Container */}
              <div
                style={{
                  transform: `rotate(${spinDeg}deg)`,
                  transition: isSpinning ? 'transform 3s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none',
                }}
                className="w-full h-full rounded-full border-8 border-blue-600 bg-gradient-to-tr from-blue-500 via-indigo-600 to-purple-600 shadow-2xl flex items-center justify-center relative overflow-hidden"
              >
                <div className="absolute inset-2 rounded-full border-4 border-dashed border-white/40" />
                <div className="w-20 h-20 rounded-full bg-white text-slate-900 font-black text-sm flex items-center justify-center shadow-lg z-10">
                  {isSpinning ? 'Đang quay...' : 'SPIN'}
                </div>
              </div>
            </div>

            {chosenStudent && (
              <div className="my-3 p-4 bg-amber-400 text-slate-900 font-black text-xl rounded-2xl animate-bounce shadow-xl">
                🎉 Chúc mừng em: {chosenStudent} !
              </div>
            )}

            <button
              onClick={handleSpinWheel}
              disabled={isSpinning || eligibleStudents.length === 0}
              className="mt-4 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-500/30 transition flex items-center gap-2"
            >
              <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              Quay Vòng May Mắn
            </button>
          </div>

          {/* Settings & Call History */}
          <div className={`p-5 rounded-xl border space-y-4 text-xs ${
            isFullscreen ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <h3 className="font-bold text-sm">Cài đặt lượt quay</h3>

            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <input
                type="checkbox"
                checked={avoidRepeat}
                onChange={(e) => setAvoidRepeat(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="font-semibold">Tránh lặp lại học sinh đã được gọi</span>
            </label>

            <div className="text-[11px] text-slate-400">
              Còn lại: <strong>{eligibleStudents.length} / {students.length}</strong> học sinh chưa quay
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">Lịch sử lượt gọi ({callHistory.length})</span>
                {callHistory.length > 0 && (
                  <button
                    onClick={() => setCallHistory([])}
                    className="text-[10px] text-blue-500 hover:underline"
                  >
                    Xóa lịch sử
                  </button>
                )}
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {callHistory.map((name, i) => (
                  <div
                    key={i}
                    className="p-1.5 rounded bg-slate-50 dark:bg-slate-700 font-semibold flex items-center justify-between"
                  >
                    <span>{name}</span>
                    <span className="text-[10px] text-slate-400">#{callHistory.length - i}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 2: RANDOM PICKER */}
      {activeTool === 'random' && (
        <div className={`p-8 rounded-2xl border text-center space-y-6 max-w-xl mx-auto ${
          isFullscreen ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
            <Dices className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold">Chọn ngẫu nhiên học sinh lên bảng</h2>

          {chosenStudent ? (
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-xl">
              <span className="text-xs uppercase tracking-wider opacity-80">Học sinh được chọn</span>
              <div className="text-3xl font-black mt-1">{chosenStudent}</div>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 text-sm">
              Bấm nút bên dưới để chọn ngẫu nhiên một bạn
            </div>
          )}

          <button
            onClick={handleSpinWheel}
            disabled={isSpinning || eligibleStudents.length === 0}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition"
          >
            Chọn học sinh tiếp theo
          </button>
        </div>
      )}

      {/* TOOL 3: AUTO GROUPS */}
      {activeTool === 'groups' && (
        <div className={`p-6 rounded-2xl border space-y-6 ${
          isFullscreen ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div>
              <h3 className="font-bold text-sm">Chia nhóm học tập tự động ({students.length} học sinh)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Xáo trộn ngẫu nhiên phân chia đều vào các nhóm</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span>Số lượng nhóm:</span>
                <select
                  value={groupCount}
                  onChange={(e) => setGroupCount(Number(e.target.value))}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent font-bold outline-none"
                >
                  <option value={2}>2 nhóm</option>
                  <option value={3}>3 nhóm</option>
                  <option value={4}>4 nhóm</option>
                  <option value={6}>6 nhóm</option>
                </select>
              </div>

              <button
                onClick={handleGenerateGroups}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
              >
                Chia nhóm ngay
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {generatedGroups.map((grp, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border ${
                  isFullscreen ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="font-bold text-xs text-blue-600 dark:text-blue-400 mb-2 border-b border-slate-200 dark:border-slate-600 pb-1">
                  Nhóm {i + 1} ({grp.length} bạn)
                </div>
                <ul className="space-y-1 text-xs">
                  {grp.map((name, sIdx) => (
                    <li key={sIdx} className="p-1 rounded bg-white dark:bg-slate-800 shadow-2xs font-medium">
                      {sIdx + 1}. {name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOOL 4: COUNTDOWN TIMER */}
      {activeTool === 'timer' && (
        <div className={`p-8 rounded-2xl border text-center space-y-6 max-w-xl mx-auto ${
          isFullscreen ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="text-6xl sm:text-8xl font-black font-mono tracking-tight text-blue-600 dark:text-blue-400">
            {formatTimer(timerSeconds)}
          </div>

          {/* Quick preset buttons */}
          <div className="flex justify-center gap-2">
            {[60, 180, 300, 600, 900].map((sec) => (
              <button
                key={sec}
                onClick={() => {
                  setTimerSeconds(sec);
                  setTimerRunning(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  isFullscreen ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {sec / 60} phút
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md"
            >
              {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {timerRunning ? 'Tạm dừng' : 'Bắt đầu đếm'}
            </button>
            <button
              onClick={() => {
                setTimerRunning(false);
                setTimerSeconds(300);
              }}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Đặt lại"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Bật/tắt âm thanh chuông"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* TOOL 5: QUICK QUIZ */}
      {activeTool === 'quick_quiz' && (
        <div className={`p-6 rounded-2xl border space-y-5 ${
          isFullscreen ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div>
            <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
              Khảo sát / Biểu quyết nhanh cả lớp
            </span>
            <input
              type="text"
              value={quickQuestion}
              onChange={(e) => setQuickQuestion(e.target.value)}
              className="text-lg font-bold w-full bg-transparent border-b border-slate-200 dark:border-slate-700 outline-none pb-1 mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(['A', 'B', 'C', 'D'] as const).map((choice) => (
              <div
                key={choice}
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  isFullscreen ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-sm">
                    {choice}
                  </span>
                  <span className="font-bold text-sm">Lựa chọn {choice}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setQuickVotes((prev) => ({
                        ...prev,
                        [choice]: prev[choice] + 1,
                      }))
                    }
                    className="px-3 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold rounded-lg hover:bg-blue-500/30 text-xs"
                  >
                    +1 Giơ tay ({quickVotes[choice]})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
