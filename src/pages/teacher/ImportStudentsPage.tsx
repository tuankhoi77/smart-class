import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Check,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { useClass } from '../../contexts/ClassContext';
import { storage } from '../../services/storage';

interface ParsedStudentRow {
  index: number;
  code: string;
  fullName: string;
  gender: string;
  birthDate: string;
  group: string;
  parentName: string;
  parentPhone: string;
  isValid: boolean;
  errors: string[];
}

export const ImportStudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { classes, currentClassId, currentClass } = useClass();

  const [selectedClassId, setSelectedClassId] = useState(currentClassId || 'cls_10a1');
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Download & Upload, 2: Mapping, 3: Preview & Validate, 4: Success
  const [fileUploaded, setFileUploaded] = useState<File | null>(null);

  // Column Mapping state
  const [columnMapping, setColumnMapping] = useState({
    code: 'Mã học sinh',
    fullName: 'Họ và tên',
    gender: 'Giới tính',
    birthDate: 'Ngày sinh',
    group: 'Tổ sinh hoạt',
    parentName: 'Họ tên Phụ huynh',
    parentPhone: 'Số điện thoại PH',
  });

  // Parsed and validated rows
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [hasErrors, setHasErrors] = useState(false);

  // Sample CSV generator for download
  const handleDownloadSample = () => {
    const sampleCSV =
      'Mã học sinh,Họ và tên,Giới tính,Ngày sinh,Tổ sinh hoạt,Họ tên Phụ huynh,Số điện thoại PH\n' +
      'HS25-1010,Đặng Quốc Bảo,Nam,2010-06-20,Tổ 1,Đặng Văn Bình,0912999888\n' +
      'HS25-1011,Ngô Khánh Huyền,Nữ,2010-09-15,Tổ 2,Ngô Thị Hà,0987111222\n' +
      'HS25-1012,Lý Gia Khiêm,Nam,2010-03-08,Tổ 3,Lý Văn Phong,0903444555\n' +
      'HS25-1013,Trịnh Thu Trang,Nữ,2010-12-01,Tổ 4,Trịnh Văn Long,0976555666';

    const blob = new Blob(['\uFEFF' + sampleCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Mau_DanhSach_HocSinh.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Simulated CSV/Excel reader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileUploaded(file);

    // Read and parse
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSVText(text);
      setStep(2); // Go to column mapping
    };
    reader.readAsText(file);
  };

  // Or use demo file directly if user clicks "Dùng dữ liệu mẫu tải sẵn"
  const handleUseDemoData = () => {
    const demoCSV =
      'Mã học sinh,Họ và tên,Giới tính,Ngày sinh,Tổ sinh hoạt,Họ tên Phụ huynh,Số điện thoại PH\n' +
      'HS25-1021,Nguyễn Thế Vinh,Nam,2010-04-12,Tổ 1,Nguyễn Văn Hùng,0912333444\n' +
      'HS25-1022,Phan Quỳnh Chi,Nữ,2010-07-28,Tổ 2,Phan Đình Nam,0988777666\n' +
      'HS25-1023,Dương Anh Tuấn,Nam,2010-11-03,Tổ 3,Dương Minh Tuấn,0934555888\n' +
      'HS25-1024,Vũ Thảo Vy,Nữ,,Tổ 4,Vũ Thị Lan,0901222333\n' + // Intentionally missing birthDate for error check demonstration
      'HS25-1025,Trần Đức Minh,Nam,2010-01-19,Tổ 1,Trần Văn Thắng,0977666555';

    parseCSVText(demoCSV);
    setFileUploaded(new File([demoCSV], 'Demo_HocSinh.csv'));
    setStep(2);
  };

  const parseCSVText = (text: string) => {
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return;

    const dataLines = lines.slice(1);
    const rows: ParsedStudentRow[] = dataLines.map((line, idx) => {
      const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      const code = cols[0] || '';
      const fullName = cols[1] || '';
      const gender = cols[2] || 'Nam';
      const birthDate = cols[3] || '';
      const group = cols[4] || 'Tổ 1';
      const parentName = cols[5] || '';
      const parentPhone = cols[6] || '';

      const errors: string[] = [];
      if (!fullName) errors.push('Thiếu họ và tên');
      if (!birthDate) errors.push('Thiếu ngày sinh');
      if (!code) errors.push('Thiếu mã học sinh');

      return {
        index: idx + 1,
        code,
        fullName,
        gender,
        birthDate,
        group,
        parentName,
        parentPhone,
        isValid: errors.length === 0,
        errors,
      };
    });

    setParsedRows(rows);
    setHasErrors(rows.some((r) => !r.isValid));
  };

  // Step 3 Confirmation & Save
  const handleConfirmAndSave = () => {
    const targetClass = storage.getClassById(selectedClassId);
    if (!targetClass) return;

    // Filter valid rows or take all with defaults
    const validRows = parsedRows.map((r) => ({
      code: r.code || `HS25-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: r.fullName || 'Học sinh',
      gender: (r.gender === 'Nữ' || r.gender === 'female' ? 'female' : 'male') as 'male' | 'female',
      birthDate: r.birthDate || '2010-01-01',
      group: r.group || 'Tổ 1',
      parentName: r.parentName,
      parentPhone: r.parentPhone,
    }));

    const count = storage.importStudents(validRows, targetClass.id, targetClass.name);

    storage.addAuditLog({
      userId: 'u_teacher_1',
      userName: 'Thầy Nguyễn Văn An',
      userRole: 'teacher',
      action: 'Import danh sách học sinh từ file',
      module: 'Học sinh',
      details: `Import thành công ${count} học sinh vào lớp ${targetClass.name}`,
    });

    setStep(4);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Step Indicator Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
          <button onClick={() => navigate('/teacher/students')} className="hover:text-blue-600 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Danh sách học sinh
          </button>
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          Quy trình Import Học sinh từ Excel / CSV
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Thực hiện theo 8 bước chuẩn: Tải file mẫu → Upload → Ánh xạ cột → Xem trước & Kiểm tra lỗi → Xác nhận & Lưu
        </p>
      </div>

      {/* Stepper Progress */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div
            className={`p-2 rounded-lg font-bold ${
              step === 1 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-400'
            }`}
          >
            1. File mẫu & Upload
          </div>
          <div
            className={`p-2 rounded-lg font-bold ${
              step === 2 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-400'
            }`}
          >
            2. Ánh xạ cột (Mapping)
          </div>
          <div
            className={`p-2 rounded-lg font-bold ${
              step === 3 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-400'
            }`}
          >
            3. Preview & Kiểm tra lỗi
          </div>
          <div
            className={`p-2 rounded-lg font-bold ${
              step === 4 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-400'
            }`}
          >
            4. Hoàn tất & Đã lưu
          </div>
        </div>
      </div>

      {/* Select Destination Class */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-800">Lớp học tiếp nhận *</label>
          <span className="text-[11px] text-slate-400">Chọn lớp mà bạn muốn thêm các học sinh này vào</span>
        </div>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none"
        >
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name} (Hiện có: {cls.studentCount} HS)
            </option>
          ))}
        </select>
      </div>

      {/* STEP 1: DOWNLOAD SAMPLE & UPLOAD */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-blue-50/60 border border-blue-100 rounded-xl">
            <div>
              <h3 className="text-sm font-bold text-blue-900">1. Tải về file mẫu Excel / CSV chuẩn</h3>
              <p className="text-xs text-blue-700 mt-0.5">
                File mẫu đã bao gồm các cột bắt buộc: Mã HS, Họ và tên, Giới tính, Ngày sinh, Tổ, Phụ huynh...
              </p>
            </div>
            <button
              onClick={handleDownloadSample}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-blue-700 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-50 transition shadow-2xs shrink-0"
            >
              <Download className="w-4 h-4" /> Tải file mẫu .CSV
            </button>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-blue-400 transition bg-slate-50/50">
            <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <div className="text-sm font-bold text-slate-800">Chọn file Excel (.xlsx, .xls) hoặc CSV để tải lên</div>
            <p className="text-xs text-slate-400 mt-1 mb-4">Dung lượng tối đa 10MB</p>

            <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs">
              <Upload className="w-4 h-4" /> Chọn file từ máy tính
              <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} className="hidden" />
            </label>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500 mr-2">Hoặc thử nghiệm nhanh với dữ liệu mẫu:</span>
              <button
                type="button"
                onClick={handleUseDemoData}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Nhập file demo mẫu 5 học sinh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: COLUMN MAPPING */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">2. Ánh xạ các cột trong file tải lên</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kiểm tra khớp các trường dữ liệu hệ thống với các tiêu đề cột trong file của bạn
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
              {fileUploaded?.name || 'Demo_HocSinh.csv'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <label className="font-semibold text-slate-700 block mb-1">Mã học sinh</label>
              <select
                value={columnMapping.code}
                onChange={(e) => setColumnMapping({ ...columnMapping, code: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-md outline-none"
              >
                <option value="Mã học sinh">Mã học sinh</option>
                <option value="MaHS">MaHS</option>
                <option value="ID">ID</option>
              </select>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <label className="font-semibold text-slate-700 block mb-1">Họ và tên *</label>
              <select
                value={columnMapping.fullName}
                onChange={(e) => setColumnMapping({ ...columnMapping, fullName: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-md outline-none"
              >
                <option value="Họ và tên">Họ và tên</option>
                <option value="HoTen">HoTen</option>
                <option value="Full Name">Full Name</option>
              </select>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <label className="font-semibold text-slate-700 block mb-1">Giới tính</label>
              <select
                value={columnMapping.gender}
                onChange={(e) => setColumnMapping({ ...columnMapping, gender: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-md outline-none"
              >
                <option value="Giới tính">Giới tính</option>
                <option value="GioiTinh">GioiTinh</option>
              </select>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <label className="font-semibold text-slate-700 block mb-1">Ngày sinh *</label>
              <select
                value={columnMapping.birthDate}
                onChange={(e) => setColumnMapping({ ...columnMapping, birthDate: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-md outline-none"
              >
                <option value="Ngày sinh">Ngày sinh</option>
                <option value="NgaySinh">NgaySinh</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Quay lại
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
            >
              Tiếp tục kiểm tra dữ liệu <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PREVIEW & VALIDATION */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                3. Xem trước (Preview) & Báo cáo lỗi chi tiết theo dòng
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tìm thấy {parsedRows.length} dòng dữ liệu trong file
              </p>
            </div>

            {hasErrors ? (
              <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-500" /> Phát hiện dòng có dữ liệu chưa chuẩn
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tất cả các dòng hợp lệ 100%
              </div>
            )}
          </div>

          {/* Validation Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Dòng</th>
                  <th className="py-2.5 px-3">Mã HS</th>
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3">Giới tính</th>
                  <th className="py-2.5 px-3">Ngày sinh</th>
                  <th className="py-2.5 px-3">Tổ</th>
                  <th className="py-2.5 px-3">Phụ huynh</th>
                  <th className="py-2.5 px-3 text-center">Trạng thái xác thực</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedRows.map((r) => (
                  <tr key={r.index} className={r.isValid ? 'hover:bg-slate-50' : 'bg-red-50/50'}>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{r.index}</td>
                    <td className="py-2.5 px-3 font-mono font-medium">{r.code}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{r.fullName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{r.gender}</td>
                    <td className="py-2.5 px-3 font-mono">
                      {r.birthDate ? (
                        r.birthDate
                      ) : (
                        <span className="text-red-500 font-bold bg-red-100 px-1.5 py-0.5 rounded">
                          Thiếu
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">{r.group}</td>
                    <td className="py-2.5 px-3 text-slate-600">{r.parentName || '-'}</td>
                    <td className="py-2.5 px-3 text-center">
                      {r.isValid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <Check className="w-3 h-3" /> Hợp lệ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                          <AlertCircle className="w-3 h-3" /> {r.errors.join(', ')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-between">
            <span>
              Người dùng xác nhận: Dữ liệu sẽ được ghi trực tiếp vào cơ sở dữ liệu lớp học sau khi nhấn nút bên dưới.
            </span>
            <span className="font-bold text-slate-900">Sẵn sàng lưu {parsedRows.length} bản ghi</span>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Quay lại bước trước
            </button>
            <button
              onClick={handleConfirmAndSave}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
            >
              <Check className="w-4 h-4" /> Xác nhận & Lưu vào hệ thống
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SUCCESS */}
      {step === 4 && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-2xs text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Import học sinh thành công!</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Toàn bộ danh sách học sinh từ file đã được bổ sung vào lớp học và cập nhật sĩ số thành công.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => navigate('/teacher/students')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition"
            >
              Xem danh sách học sinh
            </button>
            <button
              onClick={() => {
                setStep(1);
                setFileUploaded(null);
                setParsedRows([]);
              }}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Import thêm file khác
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
