// Question Bank Types & Schemas

export type BankQuestionType =
  | 'single_choice'       // 1. Trắc nghiệm 1 đáp án
  | 'multiple_choice'     // 2. Trắc nghiệm nhiều đáp án
  | 'true_false_group'    // 3. Đúng/Sai theo từng ý
  | 'matching'            // 4. Ghép đôi
  | 'ordering'            // 5. Sắp xếp
  | 'fill_blank'          // 6. Điền khuyết
  | 'short_answer'        // 7. Trả lời ngắn
  | 'essay'               // 8. Tự luận
  | 'passage_group';      // 9. Câu hỏi theo đoạn văn/tình huống

export type QuestionDifficulty =
  | 'knowledge'        // Nhận biết
  | 'comprehension'    // Thông hiểu
  | 'application'      // Vận dụng
  | 'high_application'; // Vận dụng cao

export type QuestionStatus =
  | 'draft'     // Bản nháp
  | 'pending'   // Chờ duyệt
  | 'approved'  // Đã duyệt
  | 'rejected'  // Từ chối
  | 'archived'; // Đã lưu trữ

export type QuestionSource = 'manual' | 'ai' | 'import';

// Type 3: Đúng/Sai theo từng mệnh đề
export interface TrueFalseStatement {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

// Type 4: Ghép đôi
export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

// Type 5: Sắp xếp
export interface OrderingItem {
  id: string;
  text: string;
  correctIndex: number; // 1, 2, 3...
}

// Type 6: Điền khuyết
export interface FillBlankItem {
  id: string; // ví dụ "blank_1"
  acceptedAnswers: string[];
  caseSensitive?: boolean;
  hint?: string;
}

// Sub-question for Passage Group (Type 9)
export interface SubQuestion {
  id: string;
  type: 'single_choice' | 'multiple_choice' | 'fill_blank' | 'short_answer';
  content: string;
  options?: string[];
  correctAnswer?: number | number[] | string;
  explanation?: string;
  points: number;
}

// Main Bank Question interface
export interface BankQuestion {
  id: string;
  code: string; // e.g. "QB-TOAN10-001"
  type: BankQuestionType;
  content: string;
  grade: string; // "Khối 10", "Lớp 10", etc.
  subject: string; // "Toán học", "Ngữ văn", etc.
  chapter?: string; // Chương / Bài
  topic: string; // Chủ đề
  difficulty: QuestionDifficulty;
  points: number;
  tags: string[];
  source: QuestionSource;
  author: string;
  status: QuestionStatus;
  explanation?: string;
  sourceDocument?: string;
  createdAt: string;
  updatedAt: string;

  // Type-specific payloads:
  // single_choice & multiple_choice
  options?: string[];
  correctAnswer?: number; // for single_choice (index 0..n)
  correctAnswers?: number[]; // for multiple_choice (array of indices)

  // true_false_group
  statements?: TrueFalseStatement[];

  // matching
  matchingPairs?: MatchingPair[];

  // ordering
  orderingItems?: OrderingItem[];

  // fill_blank
  templateText?: string; // Đoạn văn bản chứa các vị trí [blank_1], [blank_2]
  blanks?: FillBlankItem[];

  // short_answer
  sampleAnswer?: string;
  acceptedVariations?: string[];
  caseSensitive?: boolean;

  // essay
  rubric?: string; // Thang chấm & tiêu chí
  suggestedAnswer?: string;

  // passage_group
  passage?: string; // Đoạn văn / ngữ liệu chung
  subQuestions?: SubQuestion[];

  // Validation warning flags (AI/Import generated)
  warnings?: string[];
}

// Filter query state
export interface QuestionBankFilter {
  search: string;
  grade: string;
  subject: string;
  chapter: string;
  type: string; // 'all' or BankQuestionType
  difficulty: string; // 'all' or QuestionDifficulty
  status: string; // 'all' or QuestionStatus
  source: string; // 'all' or QuestionSource
  tag: string;
  sortBy: 'newest' | 'oldest' | 'code' | 'points' | 'difficulty';
}

// Import & Validation Types
export interface ImportRowError {
  rowNumber: number;
  questionCode?: string;
  field: string;
  reason: string;
  suggestion: string;
}

export interface DuplicateMatch {
  existingQuestion: BankQuestion;
  similarityScore: number; // 0 - 100
  matchedTokens: string[];
  isExact: boolean;
}

export interface ImportPreviewResult {
  validQuestions: BankQuestion[];
  errors: ImportRowError[];
  duplicates: Array<{
    candidate: BankQuestion;
    match: DuplicateMatch;
  }>;
  totalParsed: number;
}

// Export Configuration
export interface ExportConfig {
  format: 'excel' | 'word' | 'pdf';
  includeAnswers: boolean;
  includeExplanations: boolean;
  includeMetadata: boolean;
  includeTeacherInfo: boolean;
  schoolName: string;
  examTitle: string;
  durationMinutes: number;
  targetScope: 'selected' | 'filtered' | 'all';
}
