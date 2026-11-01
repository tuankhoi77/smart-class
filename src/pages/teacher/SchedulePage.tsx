import React, { useState, useEffect, useRef } from 'react';
import {
  Pencil,
  Trash2,
  Undo2,
  Redo2,
  FileSpreadsheet,
  Download,
  Save,
  Plus,
  AlertCircle,
  Calendar,
  User,
  MapPin,
  GraduationCap,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useClass } from '../../contexts/ClassContext';
import { storage } from '../../services/storage';

export type ScheduleType = 'class' | 'teacher' | 'room';

export interface TimetableColumn {
  id: string;
  label: string;
}

export interface TimetableRow {
  id: string;
  periodNumber: number;
  time: string;
  cells: Record<string, string>;
}

export interface TimetableGrid {
  columns: TimetableColumn[];
  rows: TimetableRow[];
}

const ALL_DAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

const DEFAULT_TEACHERS = [
  'Thầy Nguyễn Văn An (Toán)',
  'Cô Trần Thị Mai (Ngữ văn)',
  'Thầy Lê Văn Tuấn (Vật lý)',
  'Cô Phạm Thị Lan (Hóa học)',
  'Thầy Hoàng Đức Minh (Tiếng Anh)',
  'Cô Đặng Thu Hà (Sinh học)',
  'Thầy Vũ Quốc Huy (Lịch sử)',
];

const DEFAULT_ROOMS = [
  'Phòng 301 - Tòa A',
  'Phòng 302 - Tòa A',
  'Phòng 303 - Tòa A',
  'Phòng Lab 1 - Tòa B',
  'Phòng Tin học 2 - Tòa B',
  'Nhà Đa Năng',
];

const calculateDefaultTime = (periodIndex: number): string => {
  // Starts at 7:00, each period is 45 minutes
  const totalStartMinutes = 7 * 60 + periodIndex * 45;
  const totalEndMinutes = totalStartMinutes + 45;

  const startH = Math.floor(totalStartMinutes / 60);
  const startM = totalStartMinutes % 60;
  const endH = Math.floor(totalEndMinutes / 60);
  const endM = totalEndMinutes % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(startH)}:${pad(startM)} - ${pad(endH)}:${pad(endM)}`;
};

const createInitialGrid = (): TimetableGrid => {
  const columns: TimetableColumn[] = [
    { id: 'col_2', label: 'Thứ 2' },
    { id: 'col_3', label: 'Thứ 3' },
    { id: 'col_4', label: 'Thứ 4' },
    { id: 'col_5', label: 'Thứ 5' },
    { id: 'col_6', label: 'Thứ 6' },
  ];

  const rows: TimetableRow[] = [];
  for (let i = 0; i < 5; i++) {
    const rowId = `row_${i + 1}`;
    const cells: Record<string, string> = {};
    columns.forEach((col) => {
      cells[col.id] = '-trống-';
    });
    rows.push({
      id: rowId,
      periodNumber: i + 1,
      time: calculateDefaultTime(i),
      cells,
    });
  }

  return { columns, rows };
};

const reindexColumns = (cols: TimetableColumn[]): TimetableColumn[] => {
  return cols.map((col, index) => ({
    ...col,
    label: ALL_DAY_LABELS[index] || `Ngày ${index + 1}`,
  }));
};

const reindexRows = (rows: TimetableRow[]): TimetableRow[] => {
  return rows.map((row, index) => ({
    ...row,
    periodNumber: index + 1,
  }));
};

export const SchedulePage: React.FC = () => {
  const { classes, currentClassId } = useClass();

  // 3 Schedule Types
  const [scheduleType, setScheduleType] = useState<ScheduleType>('class');
  const [selectedClassId, setSelectedClassId] = useState<string>(currentClassId || classes[0]?.id || 'cls_10a1');
  const [selectedTeacher, setSelectedTeacher] = useState<string>(DEFAULT_TEACHERS[0]);
  const [selectedRoom, setSelectedRoom] = useState<string>(DEFAULT_ROOMS[0]);

  // Compute active storage key
  const getStorageKey = (type: ScheduleType, targetId: string) => `timetable_grid_${type}_${targetId}`;
  const currentTargetId =
    scheduleType === 'class' ? selectedClassId : scheduleType === 'teacher' ? selectedTeacher : selectedRoom;

  // Timetable State
  const [grid, setGrid] = useState<TimetableGrid>(() => {
    const key = `timetable_grid_class_${currentClassId || 'cls_10a1'}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return createInitialGrid();
  });

  // Undo / Redo History
  const [history, setHistory] = useState<TimetableGrid[]>([grid]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Edit & Delete Modes
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [lastSavedGrid, setLastSavedGrid] = useState<TimetableGrid>(grid);

  // Popups
  const [showUnsavedModal, setShowUnsavedModal] = useState<boolean>(false);
  const [showDayLimitModal, setShowDayLimitModal] = useState<boolean>(false);

  // Hidden File Input for Excel Import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load grid when target changes
  useEffect(() => {
    const key = getStorageKey(scheduleType, currentTargetId);
    const saved = localStorage.getItem(key);
    let loadedGrid: TimetableGrid;
    if (saved) {
      try {
        loadedGrid = JSON.parse(saved);
      } catch (e) {
        loadedGrid = createInitialGrid();
      }
    } else {
      loadedGrid = createInitialGrid();
    }
    setGrid(loadedGrid);
    setLastSavedGrid(loadedGrid);
    setHistory([loadedGrid]);
    setHistoryIndex(0);
    setHasUnsavedChanges(false);
    setIsEditMode(false);
    setIsDeleteMode(false);
  }, [scheduleType, currentTargetId]);

  // Update Grid Helper with Undo History
  const updateGridWithHistory = (newGrid: TimetableGrid) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newGrid);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setGrid(newGrid);
    setHasUnsavedChanges(true);
  };

  // Keyboard Shortcuts: Ctrl+Z and Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          // Ctrl+Shift+Z => Redo
          e.preventDefault();
          handleRedo();
        } else {
          // Ctrl+Z => Undo
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        // Ctrl+Y => Redo
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  // 1. Chỉnh sửa (Toggle Edit Mode)
  const handleToggleEdit = () => {
    if (isDeleteMode) {
      setIsDeleteMode(false);
    }

    if (isEditMode) {
      // User is trying to turn off edit mode
      if (hasUnsavedChanges) {
        setShowUnsavedModal(true);
      } else {
        setIsEditMode(false);
      }
    } else {
      setIsEditMode(true);
    }
  };

  // Save changes
  const handleSave = () => {
    const key = getStorageKey(scheduleType, currentTargetId);
    localStorage.setItem(key, JSON.stringify(grid));

    // Audit log
    storage.addAuditLog({
      userId: 'u_teacher_1',
      userName: 'Thầy Nguyễn Văn An',
      userRole: 'teacher',
      action: 'Lưu thời khóa biểu',
      module: 'Thời khóa biểu',
      details: `Đã lưu thời khóa biểu ${
        scheduleType === 'class' ? 'lớp' : scheduleType === 'teacher' ? 'giáo viên' : 'phòng'
      } (${currentTargetId})`,
    });

    setLastSavedGrid(grid);
    setHasUnsavedChanges(false);
    setIsEditMode(false);
    setIsDeleteMode(false);
    // Disable both Undo and Redo after saving as requested
    setHistory([grid]);
    setHistoryIndex(0);
  };

  // 2. Xóa (Toggle Delete Mode)
  const handleToggleDelete = () => {
    if (isEditMode) {
      setIsEditMode(false);
    }
    setIsDeleteMode((prev) => !prev);
  };

  // 3. Hoàn tác (Undo)
  const canUndo = historyIndex > 0;
  const handleUndo = () => {
    if (canUndo) {
      const prevGrid = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setGrid(prevGrid);
      setHasUnsavedChanges(true);
    }
  };

  // 4. Làm lại (Redo)
  const canRedo = historyIndex < history.length - 1;
  const handleRedo = () => {
    if (canRedo) {
      const nextGrid = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setGrid(nextGrid);
      setHasUnsavedChanges(true);
    }
  };

  // 5. Import Excel
  const handleTriggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

        if (rawData && rawData.length > 1) {
          // Parse header row for days (skip column 0 which is Tiết/Giờ)
          const headerRow = rawData[0];
          const importedColCount = Math.min(7, Math.max(1, headerRow.length - 1));

          const importedColumns: TimetableColumn[] = [];
          for (let c = 0; c < importedColCount; c++) {
            importedColumns.push({
              id: `col_imp_${c}_${Date.now()}`,
              label: ALL_DAY_LABELS[c] || `Ngày ${c + 1}`,
            });
          }

          const importedRows: TimetableRow[] = [];
          for (let r = 1; r < rawData.length; r++) {
            const rowValues = rawData[r] || [];
            if (rowValues.length === 0) continue;

            const timeCol = rowValues[0] ? String(rowValues[0]) : calculateDefaultTime(r - 1);
            const cells: Record<string, string> = {};

            importedColumns.forEach((col, colIdx) => {
              const cellVal = rowValues[colIdx + 1];
              cells[col.id] = cellVal ? String(cellVal).trim() : '-trống-';
            });

            importedRows.push({
              id: `row_imp_${r}_${Date.now()}`,
              periodNumber: r,
              time: timeCol,
              cells,
            });
          }

          if (importedRows.length > 0) {
            const newGrid: TimetableGrid = {
              columns: importedColumns,
              rows: importedRows,
            };
            updateGridWithHistory(newGrid);
            setIsEditMode(true);
          }
        }
      } catch (err) {
        console.error('Error importing file:', err);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  // 6. Xuất file Excel
  const handleExportFile = () => {
    try {
      const exportData: (string | number)[][] = [];

      // Header row
      const headerRow = ['Tiết / Giờ', ...grid.columns.map((c) => c.label)];
      exportData.push(headerRow);

      // Data rows
      grid.rows.forEach((row) => {
        const rowData: (string | number)[] = [
          `Tiết ${row.periodNumber} (${row.time})`,
          ...grid.columns.map((col) => row.cells[col.id] || '-trống-'),
        ];
        exportData.push(rowData);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'ThoiKhoaBieu');

      const safeName = currentTargetId.replace(/[^a-zA-Z0-9]/g, '_');
      XLSX.writeFile(workbook, `ThoiKhoaBieu_${scheduleType}_${safeName}.xlsx`);
    } catch (err) {
      console.error('Error exporting file:', err);
    }
  };

  // Cell Content Change
  const handleCellChange = (rowId: string, colId: string, value: string) => {
    const newRows = grid.rows.map((row) => {
      if (row.id === rowId) {
        return {
          ...row,
          cells: {
            ...row.cells,
            [colId]: value,
          },
        };
      }
      return row;
    });

    const newGrid: TimetableGrid = {
      ...grid,
      rows: newRows,
    };
    updateGridWithHistory(newGrid);
  };

  // Time String Change
  const handleTimeChange = (rowId: string, newTime: string) => {
    const newRows = grid.rows.map((row) => {
      if (row.id === rowId) {
        return {
          ...row,
          time: newTime,
        };
      }
      return row;
    });

    const newGrid: TimetableGrid = {
      ...grid,
      rows: newRows,
    };
    updateGridWithHistory(newGrid);
  };

  // Add Column at Index
  const handleAddColumn = (insertIndex: number) => {
    if (grid.columns.length >= 7) {
      setShowDayLimitModal(true);
      return;
    }

    const newColId = `col_${Date.now()}`;
    const newColumns = [...grid.columns];
    newColumns.splice(insertIndex, 0, { id: newColId, label: '' });

    const reindexedCols = reindexColumns(newColumns);

    const newRows = grid.rows.map((row) => ({
      ...row,
      cells: {
        ...row.cells,
        [newColId]: '-trống-',
      },
    }));

    updateGridWithHistory({
      columns: reindexedCols,
      rows: newRows,
    });
  };

  // Delete Column at Index
  const handleDeleteColumn = (colIndex: number) => {
    if (grid.columns.length <= 1) return; // Keep at least 1 column

    const targetCol = grid.columns[colIndex];
    const newColumns = grid.columns.filter((_, idx) => idx !== colIndex);
    const reindexedCols = reindexColumns(newColumns);

    // Keep existing cell data intact, just remove targetCol key
    const newRows = grid.rows.map((row) => {
      const newCells = { ...row.cells };
      delete newCells[targetCol.id];
      return {
        ...row,
        cells: newCells,
      };
    });

    updateGridWithHistory({
      columns: reindexedCols,
      rows: newRows,
    });
  };

  // Add Row at Index
  const handleAddRow = (insertIndex: number) => {
    const newRowId = `row_${Date.now()}`;
    const cells: Record<string, string> = {};
    grid.columns.forEach((col) => {
      cells[col.id] = '-trống-';
    });

    const defaultTime = calculateDefaultTime(insertIndex);
    const newRow: TimetableRow = {
      id: newRowId,
      periodNumber: insertIndex + 1,
      time: defaultTime,
      cells,
    };

    const newRows = [...grid.rows];
    newRows.splice(insertIndex, 0, newRow);
    const reindexedRows = reindexRows(newRows);

    updateGridWithHistory({
      columns: grid.columns,
      rows: reindexedRows,
    });
  };

  // Delete Row at Index
  const handleDeleteRow = (rowIndex: number) => {
    if (grid.rows.length <= 1) return; // Keep at least 1 row

    const newRows = grid.rows.filter((_, idx) => idx !== rowIndex);
    const reindexedRows = reindexRows(newRows);

    updateGridWithHistory({
      columns: grid.columns,
      rows: reindexedRows,
    });
  };

  // Cell Click in Delete Mode: Clear cell text immediately
  const handleCellClickInDeleteMode = (rowId: string, colId: string) => {
    handleCellChange(rowId, colId, '-trống-');
  };

  // Discard Unsaved Changes Modal Actions
  const handleConfirmDiscard = () => {
    setGrid(lastSavedGrid);
    setHasUnsavedChanges(false);
    setIsEditMode(false);
    setShowUnsavedModal(false);
  };

  const handleConfirmSaveAndClose = () => {
    handleSave();
    setShowUnsavedModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input for Excel Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        accept=".xlsx,.xls,.csv"
        className="hidden"
      />

      {/* 3 Schedule Types Selector */}
      <div className="bg-[#090d16] p-2.5 rounded-xl border border-slate-800 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Switcher: Lịch lớp học, Lịch giáo viên, Lịch phòng học */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setScheduleType('class')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
              scheduleType === 'class'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-cyan-300" />
            Lịch lớp học
          </button>
          <button
            type="button"
            onClick={() => setScheduleType('teacher')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
              scheduleType === 'teacher'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5 text-amber-300" />
            Lịch giáo viên
          </button>
          <button
            type="button"
            onClick={() => setScheduleType('room')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
              scheduleType === 'room'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-300" />
            Lịch phòng học
          </button>
        </div>

        {/* Target Item Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-cyan-400">
            {scheduleType === 'class'
              ? 'Chọn lớp:'
              : scheduleType === 'teacher'
              ? 'Chọn giáo viên:'
              : 'Chọn phòng:'}
          </span>
          {scheduleType === 'class' && (
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="text-xs font-bold text-cyan-300 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id} className="bg-slate-900 text-slate-100">
                  {cls.name} ({cls.room})
                </option>
              ))}
            </select>
          )}

          {scheduleType === 'teacher' && (
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="text-xs font-bold text-amber-300 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 outline-none focus:ring-1 focus:ring-amber-500"
            >
              {DEFAULT_TEACHERS.map((t) => (
                <option key={t} value={t} className="bg-slate-900 text-slate-100">
                  {t}
                </option>
              ))}
            </select>
          )}

          {scheduleType === 'room' && (
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="text-xs font-bold text-emerald-300 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {DEFAULT_ROOMS.map((r) => (
                <option key={r} value={r} className="bg-slate-900 text-slate-100">
                  {r}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 1. KHU VỰC THANH CHỨC NĂNG (TOP BAR) - ĐÚNG 6 NÚT CHÍNH NẰM TRÊN CÙNG MỘT THANH NGANG */}
      <div className="bg-[#090d16] p-2.5 rounded-xl border border-slate-800 shadow-lg flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* NÚT 1: Chỉnh sửa */}
          <button
            type="button"
            onClick={handleToggleEdit}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
              isEditMode
                ? 'bg-blue-600 text-white ring-2 ring-cyan-400 shadow-blue-500/30'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            <Pencil className="w-3.5 h-3.5 text-cyan-200" />
            {isEditMode ? 'Đang chỉnh sửa' : 'Chỉnh sửa'}
          </button>

          {/* Nút Lưu (chỉ xuất hiện khi đang bật chế độ Chỉnh sửa) */}
          {isEditMode && (
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-md shadow-emerald-600/30 animate-in fade-in"
              title="Lưu thay đổi vào hệ thống"
            >
              <Save className="w-3.5 h-3.5 text-emerald-100" />
              Lưu
            </button>
          )}

          {/* NÚT 2: Xóa (Màu đỏ, nằm cạnh nút Chỉnh sửa) */}
          <button
            type="button"
            onClick={handleToggleDelete}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
              isDeleteMode
                ? 'bg-rose-600 text-white ring-2 ring-rose-400 shadow-rose-500/30'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
            title="Bật/tắt chế độ xóa: click vào ô/hàng/cột để xóa ngay lập tức"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-200" />
            {isDeleteMode ? 'Đang bật Xóa' : 'Xóa'}
          </button>

          {/* NÚT 3: Hoàn tác (Undo) */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={!canUndo}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              canUndo
                ? 'border-slate-700 text-slate-200 bg-slate-900 hover:bg-slate-800 hover:text-white cursor-pointer'
                : 'border-slate-800/80 text-slate-600 bg-slate-900/40 cursor-not-allowed'
            }`}
            title="Hoàn tác (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5 text-cyan-400" />
            Hoàn tác
          </button>

          {/* NÚT 4: Làm lại (Redo) */}
          <button
            type="button"
            onClick={handleRedo}
            disabled={!canRedo}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              canRedo
                ? 'border-slate-700 text-slate-200 bg-slate-900 hover:bg-slate-800 hover:text-white cursor-pointer'
                : 'border-slate-800/80 text-slate-600 bg-slate-900/40 cursor-not-allowed'
            }`}
            title="Làm lại (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5 text-cyan-400" />
            Làm lại
          </button>

          {/* NÚT 5: Import Excel */}
          <button
            type="button"
            onClick={handleTriggerImport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 text-emerald-400 bg-slate-900 hover:bg-slate-800 hover:text-emerald-300 transition"
            title="Nhập thời khóa biểu từ file Excel (.xlsx, .csv)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            Import Excel
          </button>

          {/* NÚT 6: Xuất file */}
          <button
            type="button"
            onClick={handleExportFile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 text-sky-400 bg-slate-900 hover:bg-slate-800 hover:text-sky-300 transition"
            title="Xuất thời khóa biểu ra file Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            Xuất thời khóa biểu
          </button>
        </div>

        {/* Trạng thái chế độ */}
        {isDeleteMode && (
          <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5 animate-pulse">
            <Trash2 className="w-3.5 h-3.5" />
            Chế độ xóa: Kích ô để xóa, kích tiêu đề để xóa cột/hàng
          </div>
        )}
        {isEditMode && !isDeleteMode && (
          <div className="text-xs font-medium text-cyan-400 flex items-center gap-1.5">
            <Pencil className="w-3.5 h-3.5" />
            Chế độ sửa: Gõ trực tiếp vào ô, nhấn Enter để xuống dòng
          </div>
        )}
      </div>

      {/* BẢNG THỜI KHÓA BIỂU */}
      <div className="bg-[#090d16] rounded-xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse table-fixed">
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-200 font-bold">
                {/* Cột 1: Tiết / Giờ */}
                <th className="py-2 px-2 w-28 text-center border-r border-slate-800 bg-slate-950 text-cyan-300 font-bold select-none text-[11px]">
                  Tiết / Giờ
                </th>

                {/* Các cột Thứ (Thứ 2 đến Chủ Nhật) */}
                {grid.columns.map((col, colIdx) => (
                  <th
                    key={col.id}
                    className={`py-2 px-2 text-center border-r border-slate-800 last:border-r-0 relative select-none transition ${
                      isDeleteMode
                        ? 'hover:bg-rose-950/60 hover:text-rose-300 cursor-pointer text-slate-300'
                        : 'bg-slate-900/80 text-slate-200 font-bold'
                    }`}
                    onClick={() => {
                      if (isDeleteMode) {
                        handleDeleteColumn(colIdx);
                      }
                    }}
                    title={
                      isDeleteMode
                        ? `Kích để xóa cột ${col.label} (tự động căn chỉnh lại thứ tự)`
                        : col.label
                    }
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-sky-300 tracking-wide font-bold text-xs">{col.label}</span>
                      {isDeleteMode && (
                        <Trash2 className="w-3 h-3 text-rose-400 animate-bounce" />
                      )}
                    </div>

                    {/* Dấu + Thêm cột khi rê chuột vào vạch ngăn cách giữa 2 cột (khi ở chế độ Chỉnh sửa) */}
                    {isEditMode && !isDeleteMode && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddColumn(colIdx + 1);
                        }}
                        className="absolute -right-2.5 top-0 h-full w-5 z-30 flex items-center justify-center cursor-pointer group/col-divider"
                        title="Kích vào đây để thêm cột ngày tiếp theo"
                      >
                        <div className="w-4 h-4 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center opacity-0 group-hover/col-divider:opacity-100 transition-opacity duration-150 shadow-md shadow-cyan-500/50">
                          <Plus className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </th>
                ))}

                {/* Nút Thêm Thứ rõ ràng trên Header khi ở chế độ Chỉnh sửa (chỉ thêm từ Thứ 2 đến Chủ Nhật) */}
                {isEditMode && !isDeleteMode && (
                  <th
                    className={`py-2 px-2 w-24 text-center select-none transition cursor-pointer ${
                      grid.columns.length < 7
                        ? 'bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-400 border-l border-dashed border-cyan-500/50'
                        : 'bg-slate-900/40 text-slate-600 cursor-not-allowed border-l border-slate-800'
                    }`}
                    onClick={() => {
                      if (grid.columns.length < 7) {
                        handleAddColumn(grid.columns.length);
                      } else {
                        setShowDayLimitModal(true);
                      }
                    }}
                    title={
                      grid.columns.length < 7
                        ? `Kích để thêm ${ALL_DAY_LABELS[grid.columns.length]}`
                        : 'Đã đạt giới hạn tối đa 7 ngày trong tuần (từ Thứ 2 đến Chủ Nhật)'
                    }
                  >
                    <div className="flex items-center justify-center gap-1 text-[11px] font-bold">
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                      <span>
                        {grid.columns.length < 7
                          ? `+ ${ALL_DAY_LABELS[grid.columns.length]}`
                          : 'Đủ 7 ngày'}
                      </span>
                    </div>
                  </th>
                )}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/80">
              {grid.rows.map((row, rowIdx) => (
                <tr key={row.id} className="relative group/row hover:bg-slate-900/30 transition-colors">
                  {/* Cột 1 (Tiết/Giờ): Hệ thống tự đánh số Tiết, cho phép click sửa trực tiếp thời gian */}
                  <td
                    className={`py-1.5 px-1.5 border-r border-slate-800 align-middle select-none transition text-center relative ${
                      isDeleteMode
                        ? 'hover:bg-rose-950/60 hover:text-rose-300 cursor-pointer bg-slate-900/80'
                        : 'bg-slate-950/90 text-slate-300'
                    }`}
                    onClick={() => {
                      if (isDeleteMode) {
                        handleDeleteRow(rowIdx);
                      }
                    }}
                    title={
                      isDeleteMode
                        ? `Kích để xóa hàng Tiết ${row.periodNumber} (tự động căn chỉnh lại thứ tự)`
                        : `Tiết ${row.periodNumber}`
                    }
                  >
                    <div className="flex flex-col items-center justify-center py-1 gap-0.5 relative">
                      <div className="font-bold text-white flex items-center gap-1 leading-none">
                        <span className="text-cyan-400 font-mono text-xs">Tiết {row.periodNumber}</span>
                        {isDeleteMode && (
                          <Trash2 className="w-3 h-3 text-rose-400 animate-bounce" />
                        )}
                      </div>

                      {/* Cho phép sửa trực tiếp thời gian khi ở chế độ Chỉnh sửa */}
                      {isEditMode && !isDeleteMode ? (
                        <input
                          type="text"
                          value={row.time}
                          onChange={(e) => handleTimeChange(row.id, e.target.value)}
                          className="w-20 text-[10px] font-mono text-center text-cyan-300 bg-slate-950 border border-cyan-500/70 rounded px-1 py-0 outline-none focus:ring-1 focus:ring-cyan-400"
                          placeholder="07:00 - 07:45"
                          title="Sửa thời gian bắt đầu và kết thúc tiết"
                        />
                      ) : (
                        <span className="text-[10px] text-amber-300/90 font-mono leading-tight">
                          {row.time}
                        </span>
                      )}

                      {/* Dấu + Thêm hàng khi rê chuột vào vạch ngăn cách giữa 2 hàng (khi ở chế độ Chỉnh sửa) */}
                      {isEditMode && !isDeleteMode && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddRow(rowIdx + 1);
                          }}
                          className="absolute -bottom-2.5 left-0 w-full h-5 z-20 flex items-center justify-center cursor-pointer group/row-divider"
                          title="Kích vào đây để chèn thêm tiết học"
                        >
                          <div className="w-4 h-4 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center opacity-0 group-row/divider:opacity-100 transition-opacity duration-150 shadow-md shadow-cyan-500/50">
                            <Plus className="w-3 h-3 stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Các ô dữ liệu theo từng cột Thứ */}
                  {grid.columns.map((col) => {
                    const rawVal = row.cells[col.id];
                    const isBlank = !rawVal || rawVal.trim() === '' || rawVal.trim() === '-trống-';
                    const displayVal = isBlank ? '-trống-' : rawVal;

                    return (
                      <td
                        key={col.id}
                        className={`p-1.5 border-r border-slate-800 last:border-r-0 align-middle transition ${
                          isDeleteMode
                            ? 'hover:bg-rose-950/40 hover:border-rose-500/50 cursor-pointer'
                            : 'hover:bg-slate-900/40'
                        }`}
                        onClick={() => {
                          if (isDeleteMode) {
                            handleCellClickInDeleteMode(row.id, col.id);
                          }
                        }}
                        title={isDeleteMode ? 'Kích để xóa ô này về -trống-' : undefined}
                      >
                        {isEditMode && !isDeleteMode ? (
                          <textarea
                            value={rawVal === '-trống-' ? '' : rawVal || ''}
                            onChange={(e) => handleCellChange(row.id, col.id, e.target.value)}
                            onBlur={(e) => {
                              if (!e.target.value.trim()) {
                                handleCellChange(row.id, col.id, '-trống-');
                              }
                            }}
                            placeholder="-trống-"
                            rows={Math.max(1, (rawVal || '').split('\n').length)}
                            className="w-full min-h-[38px] p-1.5 bg-slate-950/70 border border-slate-800 resize-none outline-none focus:bg-slate-950 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-md text-[11px] text-white font-medium whitespace-pre-wrap break-words leading-tight transition placeholder:text-slate-600"
                          />
                        ) : (
                          <div
                            className={`min-h-[38px] p-1.5 text-[11px] rounded-md whitespace-pre-wrap break-words leading-tight flex flex-col justify-center select-text ${
                              isBlank
                                ? 'text-slate-600 italic text-center font-normal'
                                : 'text-emerald-300 font-medium'
                            }`}
                          >
                            {displayVal}
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* Cột phụ tương ứng với nút Thêm Thứ khi ở chế độ Chỉnh sửa */}
                  {isEditMode && !isDeleteMode && (
                    <td className="p-1 border-l border-dashed border-slate-800/80 bg-slate-950/20 text-center text-slate-700 italic select-none text-[10px]">
                      —
                    </td>
                  )}
                </tr>
              ))}

              {/* HÀNG THÊM TIẾT HỌC KHI Ở CHẾ ĐỘ CHỈNH SỬA */}
              {isEditMode && !isDeleteMode && (
                <tr>
                  <td
                    colSpan={grid.columns.length + 2}
                    onClick={() => handleAddRow(grid.rows.length)}
                    className="py-2 px-3 text-center bg-[#07090e] hover:bg-cyan-950/30 border-t border-dashed border-cyan-500/50 cursor-pointer text-cyan-400 hover:text-cyan-300 font-bold text-xs transition select-none group/add-row"
                    title="Kích vào đây để thêm tiết học tiếp theo"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-cyan-500/20 group-hover/add-row:bg-cyan-500 group-hover/add-row:text-slate-950 text-cyan-400 flex items-center justify-center transition shadow-xs">
                        <Plus className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-[11px]">+ Thêm tiết học tiếp theo (Tiết {grid.rows.length + 1})</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP: CẢNH BÁO BẠN CHƯA LƯU THAY ĐỔI */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-[#090d16] rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-800 text-slate-100">
            <div className="w-10 h-10 rounded-full bg-amber-550/20 text-amber-400 flex items-center justify-center mb-3 border border-amber-500/30">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Bạn chưa lưu thay đổi</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Bạn có các thay đổi chưa được lưu trên thời khóa biểu. Bạn muốn lưu các thay đổi này trước khi tắt chế độ chỉnh sửa hay hủy bỏ?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="px-3.5 py-1.5 border border-slate-700 rounded-lg text-slate-300 font-medium text-xs hover:bg-slate-800 hover:text-white transition"
              >
                Hủy thay đổi
              </button>
              <button
                type="button"
                onClick={handleConfirmSaveAndClose}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-xs"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP: THÔNG BÁO GIỚI HẠN 7 NGÀY */}
      {showDayLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-[#090d16] rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-800 text-slate-100">
            <div className="w-10 h-10 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center mb-3 border border-cyan-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Không thể thêm cột</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Không thể thêm cột vì một tuần chỉ có 7 ngày (từ Thứ 2 đến Chủ Nhật).
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowDayLimitModal(false)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow-xs"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
