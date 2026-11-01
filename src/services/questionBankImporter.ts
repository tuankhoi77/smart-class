import * as XLSX from 'xlsx';
import {
  BankQuestion,
  BankQuestionType,
  ImportPreviewResult,
  ImportRowError,
  QuestionDifficulty,
} from '../types/questionBank';
import { detectDuplicates } from './duplicateDetector';

// Map diverse Vietnamese labels to normalized question type
export function normalizeQuestionType(raw: string): BankQuestionType | null {
  if (!raw) return null;
  const s = raw.toLowerCase().trim();

  if (s.includes('nhiều') || s === 'multiple_choice' || s === 'tn_nhieu') {
    return 'multiple_choice';
  }
  if (
    s.includes('đúng') ||
    s.includes('sai') ||
    s === 'true_false' ||
    s === 'true_false_group' ||
    s === 'tf'
  ) {
    return 'true_false_group';
  }
  if (s.includes('ghép') || s === 'matching' || s === 'match') {
    return 'matching';
  }
  if (s.includes('xếp') || s === 'sắp' || s === 'ordering' || s === 'order') {
    return 'ordering';
  }
  if (s.includes('khuyết') || s.includes('chỗ trống') || s === 'fill_blank' || s === 'blank') {
    return 'fill_blank';
  }
  if (s.includes('ngắn') || s === 'short_answer' || s === 'short') {
    return 'short_answer';
  }
  if (s.includes('luận') || s === 'essay') {
    return 'essay';
  }
  if (s.includes('đoạn văn') || s.includes('tình huống') || s === 'passage_group' || s === 'passage') {
    return 'passage_group';
  }
  if (s.includes('trắc nghiệm') || s.includes('1 đáp án') || s === 'single_choice' || s === 'mcq') {
    return 'single_choice';
  }

  return 'single_choice'; // default fallback
}

// Map difficulty labels
export function normalizeDifficulty(raw: string): QuestionDifficulty {
  if (!raw) return 'knowledge';
  const s = raw.toLowerCase().trim();
  if (s.includes('thông hiểu') || s === 'comprehension') return 'comprehension';
  if (s.includes('cao') || s === 'high_application') return 'high_application';
  if (s.includes('vận dụng') || s === 'application') return 'application';
  return 'knowledge';
}

/**
 * Download standard Excel import template
 */
export function downloadExcelTemplate(): void {
  const sampleData = [
    {
      'Mã câu': 'QB-MAU-001',
      'Dạng câu hỏi': 'Trắc nghiệm 1 đáp án',
      'Khối lớp': 'Lớp 10',
      'Môn học': 'Toán học',
      'Chương / Bài': 'Chương 1: Mệnh đề',
      'Chủ đề': 'Mệnh đề chứa biến',
      'Mức độ (Nhận biết/Thông hiểu/Vận dụng/Vận dụng cao)': 'Nhận biết',
      'Điểm': 0.5,
      'Nội dung đề bài': 'Khẳng định nào sau đây là mệnh đề toán học?',
      'Phương án A': 'Hà Nội là thủ đô của Việt Nam',
      'Phương án B': 'Trời hôm nay đẹp quá!',
      'Phương án C': 'Bạn đã làm bài tập chưa?',
      'Phương án D': 'Hãy học bài đi!',
      'Đáp án đúng (A/B/C/D hoặc số 0/1/2/3)': 'A',
      'Lời giải chi tiết': 'Câu cảm thán và câu hỏi không phải là mệnh đề khẳng định có tính đúng sai.',
      'Thẻ tags (cách nhau bởi dấu phẩy)': 'Mệnh đề, Nhận biết',
    },
    {
      'Mã câu': 'QB-MAU-002',
      'Dạng câu hỏi': 'Đúng/Sai theo từng ý',
      'Khối lớp': 'Lớp 11',
      'Môn học': 'Hóa học',
      'Chương / Bài': 'Chương 1: Cân bằng hóa học',
      'Chủ đề': 'Chuyển dịch cân bằng',
      'Mức độ (Nhận biết/Thông hiểu/Vận dụng/Vận dụng cao)': 'Thông hiểu',
      'Điểm': 1.0,
      'Nội dung đề bài': 'Xét cân bằng N2 + 3H2 ⇄ 2NH3 (tỏa nhiệt). Xác định Đúng/Sai cho các ý sau:',
      'Phương án A': 'Ý a: Tăng áp suất cân bằng dịch sang phải (Đúng)',
      'Phương án B': 'Ý b: Tăng nhiệt độ làm tăng hằng số Kc (Sai)',
      'Phương án C': 'Ý c: Chất xúc tác làm tăng tốc độ đạt cân bằng (Đúng)',
      'Phương án D': 'Ý d: Bơm thêm khí trơ đẳng tích làm chuyển dịch cân bằng (Sai)',
      'Đáp án đúng (A/B/C/D hoặc số 0/1/2/3)': 'a:D, b:S, c:D, d:S',
      'Lời giải chi tiết': 'Phân tích dựa trên nguyên lý Le Chatelier.',
      'Thẻ tags (cách nhau bởi dấu phẩy)': 'Cân bằng hóa học, Hóa 11',
    },
    {
      'Mã câu': 'QB-MAU-003',
      'Dạng câu hỏi': 'Trả lời ngắn',
      'Khối lớp': 'Lớp 12',
      'Môn học': 'Vật lí',
      'Chương / Bài': 'Chương 1: Dao động cơ',
      'Chủ đề': 'Con lắc lò xo',
      'Mức độ (Nhận biết/Thông hiểu/Vận dụng/Vận dụng cao)': 'Vận dụng',
      'Điểm': 1.0,
      'Nội dung đề bài': 'Một con lắc lò xo có k = 100 N/m, m = 100g. Chu kì dao động riêng T bằng bao nhiêu giây? (Lấy π² = 10, làm tròn 1 chữ số thập phân)',
      'Phương án A': '',
      'Phương án B': '',
      'Phương án C': '',
      'Phương án D': '',
      'Đáp án đúng (A/B/C/D hoặc số 0/1/2/3)': '0.2',
      'Lời giải chi tiết': 'T = 2π√(m/k) = 2π√(0.1/100) = 0.2s.',
      'Thẻ tags (cách nhau bởi dấu phẩy)': 'Con lắc lò xo, Chu kì',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template_Import_CauHoi');
  XLSX.writeFile(wb, 'Mau_Import_Ngan_Hang_Cau_Hoi.xlsx');
}

/**
 * Download standard CSV import template
 */
export function downloadCsvTemplate(): void {
  const headers = 'Mã câu,Dạng câu hỏi,Khối lớp,Môn học,Chương / Bài,Chủ đề,Mức độ,Điểm,Nội dung đề bài,Phương án A,Phương án B,Phương án C,Phương án D,Đáp án đúng,Lời giải chi tiết,Thẻ tags\n';
  const row1 = '"QB-CSV-001","Trắc nghiệm 1 đáp án","Lớp 10","Toán học","Chương 1","Mệnh đề toán học","Nhận biết",0.5,"Khẳng định nào sau đây là mệnh đề đúng?","1 + 1 = 3","Số 5 là số lẻ","Hình tròn có 4 góc","Hà Nội là một quốc gia","B","5 là số nguyên tố lẻ nhỏ hơn 7.","Mệnh đề, Toán 10"\n';
  const row2 = '"QB-CSV-002","Đúng/Sai theo từng ý","Lớp 11","Hóa học","Chương 1","Cân bằng hóa học","Thông hiểu",1.0,"Xét cân bằng hóa học N2 + 3H2 ⇄ 2NH3 (tỏa nhiệt). Xác định tính Đúng/Sai:","Ý a: Tăng áp suất cân bằng dịch sang phải (Đúng)","Ý b: Tăng nhiệt độ cân bằng dịch sang phải (Sai)","Ý c: Thêm xúc tác làm tăng hiệu suất (Sai)","Ý d: Lấy bớt NH3 ra cân bằng chuyển dịch chiều thuận (Đúng)","a:D, b:S, c:S, d:D","Nguyên lý chuyển dịch cân bằng Le Chatelier.","Cân bằng, Hóa 11"\n';
  const row3 = '"QB-CSV-003","Trả lời ngắn","Lớp 12","Vật lí","Chương 1","Dao động điều hòa","Vận dụng",1.0,"Một con lắc lò xo có k = 100 N/m, m = 100g. Chu kì dao động riêng T bằng bao nhiêu giây?","","","","","0.2","T = 2π√(m/k) = 0.2s.","Dao động cơ, Vật lí 12"\n';

  const blob = new Blob(['\uFEFF' + headers + row1 + row2 + row3], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Mau_Import_Ngan_Hang_Cau_Hoi.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Download standard Word (.doc) import template
 */
export function downloadWordTemplate(): void {
  const content = `MẪU SOẠN CÂU HỎI NHẬP VÀO HỆ THỐNG (ĐỊNH DẠNG WORD)
========================================================================

Câu 1: Trong các mệnh đề sau về tập hợp số thực, mệnh đề nào là mệnh đề đúng?
A. ∀x ∈ ℝ: x² > 0
B. ∃x ∈ ℝ: x² = 0
C. ∀x ∈ ℕ: x > 1
D. ∃x ∈ ℤ: x² < 0
Đáp án: B
Lời giải: Với x = 0 thì x² = 0, nên tồn tại số thực x thỏa mãn điều kiện.

Câu 2: Cho tam giác ABC đều cạnh a. Độ dài vectơ AB + AC bằng bao nhiêu?
A. a√3
B. 2a
C. a
D. a√3/2
Đáp án: A
Lời giải: Dựng hình bình hành ABDC, độ dài đường chéo là 2 * (a√3/2) = a√3.

Câu 3: Khí nào sau đây chiếm tỉ lệ thể tích lớn nhất trong không khí sạch?
A. Khí Oxi (O₂)
B. Khí Nitơ (N₂)
C. Khí Cacbonic (CO₂)
D. Khí Argon (Ar)
Đáp án: B
Lời giải: Khí Nitơ chiếm khoảng 78% thể tích không khí sạch.
`;

  const blob = new Blob(['\uFEFF', content], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Mau_Import_Ngan_Hang_Word.doc';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Download JSON schema template
 */
export function downloadJsonTemplate(): void {
  const jsonTemplate = [
    {
      code: 'QB-JSON-001',
      type: 'single_choice',
      content: 'Nội dung câu hỏi trắc nghiệm...',
      grade: 'Lớp 10',
      subject: 'Toán học',
      chapter: 'Chương 1',
      topic: 'Chủ đề 1',
      difficulty: 'knowledge',
      points: 1.0,
      tags: ['Căn bản'],
      options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
      correctAnswer: 0,
      explanation: 'Giải thích chi tiết...',
      status: 'approved',
    },
  ];

  const blob = new Blob([JSON.stringify(jsonTemplate, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Parse an Excel buffer / array buffer into questions with error checking
 */
export async function parseExcelImport(
  file: File,
  existingBank: BankQuestion[]
): Promise<ImportPreviewResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('Tệp Excel không chứa bất kỳ bảng tính (sheet) nào!');
  }

  const sheet = workbook.Sheets[sheetName];
  const rawRows: any[] = XLSX.utils.sheet_to_json(sheet);

  if (rawRows.length === 0) {
    throw new Error('Bảng tính trống, không tìm thấy dữ liệu câu hỏi!');
  }

  const validQuestions: BankQuestion[] = [];
  const errors: ImportRowError[] = [];

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 2; // Row in Excel (header is row 1)
    const code = String(row['Mã câu'] || row['Code'] || `QB-IMP-${Date.now().toString().slice(-4)}-${idx + 1}`).trim();
    const content = String(row['Nội dung đề bài'] || row['Nội dung'] || row['Content'] || '').trim();
    const rawType = String(row['Dạng câu hỏi'] || row['Type'] || 'single_choice');
    const type = normalizeQuestionType(rawType) || 'single_choice';
    const grade = String(row['Khối lớp'] || row['Grade'] || 'Lớp 10').trim();
    const subject = String(row['Môn học'] || row['Subject'] || 'Chung').trim();
    const chapter = String(row['Chương / Bài'] || row['Chapter'] || '').trim();
    const topic = String(row['Chủ đề'] || row['Topic'] || 'Tổng hợp').trim();
    const difficulty = normalizeDifficulty(String(row['Mức độ'] || row['Difficulty'] || 'knowledge'));
    const points = Number(row['Điểm'] || row['Points'] || 1.0);
    const explanation = String(row['Lời giải chi tiết'] || row['Explanation'] || '').trim();
    const tagsRaw = String(row['Thẻ tags'] || row['Tags'] || '');
    const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : [];

    // Validation 1: Missing content
    if (!content) {
      errors.push({
        rowNumber: rowNum,
        questionCode: code,
        field: 'Nội dung đề bài',
        reason: 'Nội dung câu hỏi đang để trống',
        suggestion: 'Nhập nội dung câu hỏi đầy đủ ở cột "Nội dung đề bài".',
      });
      return;
    }

    // Validation 2: Single Choice
    if (type === 'single_choice') {
      const optA = String(row['Phương án A'] || row['A'] || '').trim();
      const optB = String(row['Phương án B'] || row['B'] || '').trim();
      const optC = String(row['Phương án C'] || row['C'] || '').trim();
      const optD = String(row['Phương án D'] || row['D'] || '').trim();
      const options = [optA, optB, optC, optD].filter(Boolean);

      if (options.length < 2) {
        errors.push({
          rowNumber: rowNum,
          questionCode: code,
          field: 'Phương án lựa chọn',
          reason: `Câu trắc nghiệm chỉ có ${options.length} phương án (cần tối thiểu 2 phương án)`,
          suggestion: 'Bổ sung ít nhất 2 phương án lựa chọn A, B.',
        });
        return;
      }

      // Check correctAnswer
      const rawAns = String(row['Đáp án đúng'] || row['Đáp án'] || 'A').toUpperCase().trim();
      let correctIdx = 0;
      if (rawAns === 'A' || rawAns === '0') correctIdx = 0;
      else if (rawAns === 'B' || rawAns === '1') correctIdx = 1;
      else if (rawAns === 'C' || rawAns === '2') correctIdx = 2;
      else if (rawAns === 'D' || rawAns === '3') correctIdx = 3;

      if (correctIdx >= options.length) {
        errors.push({
          rowNumber: rowNum,
          questionCode: code,
          field: 'Đáp án đúng',
          reason: `Đáp án "${rawAns}" vượt quá số lượng phương án có sẵn (${options.length})`,
          suggestion: 'Chỉnh đáp án nằm trong khoảng các phương án đã khai báo.',
        });
        return;
      }

      validQuestions.push({
        id: `qb_imp_${Date.now()}_${idx}`,
        code,
        type: 'single_choice',
        content,
        grade,
        subject,
        chapter,
        topic,
        difficulty,
        points: isNaN(points) ? 1.0 : points,
        tags,
        source: 'import',
        author: 'Giáo viên Import',
        status: 'pending',
        options,
        correctAnswer: correctIdx,
        explanation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    // Validation 3: True / False Group
    if (type === 'true_false_group') {
      const optA = String(row['Phương án A'] || row['A'] || '').trim();
      const optB = String(row['Phương án B'] || row['B'] || '').trim();
      const optC = String(row['Phương án C'] || row['C'] || '').trim();
      const optD = String(row['Phương án D'] || row['D'] || '').trim();
      const rawItems = [optA, optB, optC, optD].filter(Boolean);

      const statements = (rawItems.length > 0 ? rawItems : ['Mệnh đề 1', 'Mệnh đề 2']).map(
        (txt, sIdx) => ({
          id: `st_${sIdx + 1}`,
          text: txt,
          isCorrect: sIdx % 2 === 0, // default alternating or parsed
        })
      );

      validQuestions.push({
        id: `qb_imp_${Date.now()}_${idx}`,
        code,
        type: 'true_false_group',
        content,
        grade,
        subject,
        chapter,
        topic,
        difficulty,
        points: isNaN(points) ? 1.0 : points,
        tags,
        source: 'import',
        author: 'Giáo viên Import',
        status: 'pending',
        statements,
        explanation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    // Default generic valid question (Short answer, Essay, etc.)
    const sampleAnswer = String(row['Đáp án đúng'] || row['Đáp án'] || 'Đáp án mẫu').trim();
    validQuestions.push({
      id: `qb_imp_${Date.now()}_${idx}`,
      code,
      type,
      content,
      grade,
      subject,
      chapter,
      topic,
      difficulty,
      points: isNaN(points) ? 1.0 : points,
      tags,
      source: 'import',
      author: 'Giáo viên Import',
      status: 'pending',
      sampleAnswer,
      suggestedAnswer: sampleAnswer,
      explanation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  // Run duplicate detector on parsed valid questions
  const duplicates = detectDuplicates(validQuestions, existingBank, 75);

  return {
    validQuestions,
    errors,
    duplicates,
    totalParsed: rawRows.length,
  };
}

/**
 * Parse JSON standard format
 */
export async function parseJsonImport(
  file: File,
  existingBank: BankQuestion[]
): Promise<ImportPreviewResult> {
  const text = await file.text();
  let json: any[];
  try {
    json = JSON.parse(text);
    if (!Array.isArray(json)) {
      json = [json];
    }
  } catch (e: any) {
    throw new Error('Tệp JSON không đúng định dạng cú pháp: ' + e.message);
  }

  const validQuestions: BankQuestion[] = [];
  const errors: ImportRowError[] = [];

  json.forEach((item, idx) => {
    const rowNum = idx + 1;
    if (!item.content) {
      errors.push({
        rowNumber: rowNum,
        questionCode: item.code || `JSON-${rowNum}`,
        field: 'content',
        reason: 'Thiếu trường content (Nội dung câu hỏi)',
        suggestion: 'Khai báo "content": "Nội dung đề bài..."',
      });
      return;
    }

    const type = item.type || 'single_choice';
    validQuestions.push({
      id: item.id || `qb_json_${Date.now()}_${idx}`,
      code: item.code || `QB-JSON-${Date.now().toString().slice(-4)}-${idx + 1}`,
      type,
      content: item.content,
      grade: item.grade || 'Lớp 10',
      subject: item.subject || 'Chung',
      chapter: item.chapter || '',
      topic: item.topic || 'Chủ đề chung',
      difficulty: item.difficulty || 'knowledge',
      points: Number(item.points) || 1.0,
      tags: Array.isArray(item.tags) ? item.tags : [],
      source: 'import',
      author: 'Import JSON',
      status: item.status || 'pending',
      options: item.options || [],
      correctAnswer: item.correctAnswer ?? 0,
      correctAnswers: item.correctAnswers || [],
      statements: item.statements || [],
      matchingPairs: item.matchingPairs || [],
      orderingItems: item.orderingItems || [],
      templateText: item.templateText,
      blanks: item.blanks,
      sampleAnswer: item.sampleAnswer,
      suggestedAnswer: item.suggestedAnswer,
      rubric: item.rubric,
      passage: item.passage,
      subQuestions: item.subQuestions,
      explanation: item.explanation || '',
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  const duplicates = detectDuplicates(validQuestions, existingBank, 75);

  return {
    validQuestions,
    errors,
    duplicates,
    totalParsed: json.length,
  };
}

/**
 * Parse plain text or Word raw text (e.g. "Câu 1: ... A. ... B. ... C. ... D. ... Đáp án: A")
 */
export function parseWordRawText(
  text: string,
  existingBank: BankQuestion[],
  subject = 'Toán học',
  grade = 'Lớp 10'
): ImportPreviewResult {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const questions: BankQuestion[] = [];
  const errors: ImportRowError[] = [];

  let currentContent = '';
  let currentOptions: string[] = [];
  let currentAnswer = 0;
  let currentExplanation = '';
  let questionCounter = 0;

  function pushCurrent() {
    if (currentContent) {
      questionCounter++;
      questions.push({
        id: `qb_word_${Date.now()}_${questionCounter}`,
        code: `QB-WORD-${questionCounter}`,
        type: 'single_choice',
        content: currentContent,
        grade,
        subject,
        topic: 'Nhập từ Word',
        difficulty: 'knowledge',
        points: 1.0,
        tags: ['Word Import'],
        source: 'import',
        author: 'Giáo viên Import Word',
        status: 'pending',
        options: currentOptions.length >= 2 ? currentOptions : ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D'],
        correctAnswer: currentAnswer,
        explanation: currentExplanation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    currentContent = '';
    currentOptions = [];
    currentAnswer = 0;
    currentExplanation = '';
  }

  lines.forEach((line, lIdx) => {
    // Detect question start: "Câu 1:", "Câu 1.", "1.", "1:"
    const qMatch = line.match(/^(?:câu\s*\d+[\.:]|(\d+)[\.:])\s*(.*)$/i);
    if (qMatch) {
      pushCurrent();
      currentContent = qMatch[2] || line;
      return;
    }

    // Detect options: "A. ...", "B. ...", "C. ...", "D. ..."
    const optMatch = line.match(/^([A-D])[\.:\)]\s*(.*)$/i);
    if (optMatch) {
      currentOptions.push(optMatch[2]);
      return;
    }

    // Detect answer line: "Đáp án: A", "ĐA: B"
    const ansMatch = line.match(/^(?:đáp án|đa)[\s:]*([A-D0-3])/i);
    if (ansMatch) {
      const letter = ansMatch[1].toUpperCase();
      if (letter === 'A' || letter === '0') currentAnswer = 0;
      else if (letter === 'B' || letter === '1') currentAnswer = 1;
      else if (letter === 'C' || letter === '2') currentAnswer = 2;
      else if (letter === 'D' || letter === '3') currentAnswer = 3;
      return;
    }

    // Detect explanation
    const expMatch = line.match(/^(?:lời giải|hướng dẫn giải|giải thích)[\s:]*(.*)$/i);
    if (expMatch) {
      currentExplanation = expMatch[1] || '';
      return;
    }

    // Otherwise append to current content or explanation
    if (currentExplanation) {
      currentExplanation += ' ' + line;
    } else if (currentContent) {
      currentContent += ' ' + line;
    }
  });

  pushCurrent();

  if (questions.length === 0) {
    errors.push({
      rowNumber: 1,
      field: 'Văn bản Word',
      reason: 'Không nhận diện được cấu trúc câu hỏi nào trong văn bản đã nhập',
      suggestion: 'Đảm bảo mỗi câu bắt đầu bằng "Câu 1: ...", tiếp theo là "A. ... B. ...", và "Đáp án: A".',
    });
  }

  const duplicates = detectDuplicates(questions, existingBank, 75);

  return {
    validQuestions: questions,
    errors,
    duplicates,
    totalParsed: questions.length + errors.length,
  };
}
