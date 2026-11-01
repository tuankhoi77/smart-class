import { BankQuestion, QuestionStatus } from '../types/questionBank';
import { db } from './firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

const STORAGE_KEY = 'smart_school_question_bank_v1';

async function syncQuestionToFirestore(q: BankQuestion) {
  try {
    await setDoc(doc(db, 'questions', q.id), q);
  } catch (err) {
    console.warn('Firestore question sync note:', err);
  }
}

async function removeQuestionFromFirestore(id: string) {
  try {
    await deleteDoc(doc(db, 'questions', id));
  } catch (err) {
    console.warn('Firestore question delete note:', err);
  }
}

export const initialQuestionBank: BankQuestion[] = [
  // 1. Trắc nghiệm 1 đáp án
  {
    id: 'qb_toan10_001',
    code: 'QB-TOAN10-001',
    type: 'single_choice',
    content: 'Trong các mệnh đề sau về tập hợp số thực, mệnh đề nào sau đây là MỆNH ĐỀ ĐÚNG?',
    grade: 'Lớp 10',
    subject: 'Toán học',
    chapter: 'Chương 1: Mệnh đề và Tập hợp',
    topic: 'Mệnh đề toán học',
    difficulty: 'knowledge',
    points: 0.5,
    tags: ['Mệnh đề', 'Số thực', 'Căn bản'],
    source: 'manual',
    author: 'Thầy Nguyễn Văn Nam',
    status: 'approved',
    options: [
      '∀x ∈ ℝ: x² > 0',
      '∃x ∈ ℝ: x² = 0',
      '∀x ∈ ℕ: x > 1',
      '∃x ∈ ℤ: x² < 0'
    ],
    correctAnswer: 1,
    explanation: 'Với x = 0 thì x² = 0 (0 ∈ ℝ), do đó mệnh đề tồn tại ∃x ∈ ℝ: x² = 0 là mệnh đề đúng.',
    sourceDocument: 'SGK Toán 10 - Bộ Cánh Diều',
    createdAt: '2026-09-15T08:00:00Z',
    updatedAt: '2026-10-02T10:30:00Z',
  },

  // 2. Trắc nghiệm nhiều đáp án
  {
    id: 'qb_ly12_002',
    code: 'QB-LY12-002',
    type: 'multiple_choice',
    content: 'Trong dao động điều hòa của con lắc lò xo nằm ngang (bỏ qua mọi ma sát), những đại lượng nào sau đây biến thiên tuần hoàn cùng tần số với li độ x?',
    grade: 'Lớp 12',
    subject: 'Vật lí',
    chapter: 'Chương 1: Dao động cơ',
    topic: 'Dao động điều hòa',
    difficulty: 'comprehension',
    points: 1.0,
    tags: ['Dao động cơ', 'Con lắc lò xo', 'Đại lượng dao động'],
    source: 'manual',
    author: 'Cô Trần Mai Lan',
    status: 'approved',
    options: [
      'Vận tốc tức thời v',
      'Gia tốc tức thời a',
      'Lực kéo về Fkv',
      'Động năng của vật Wđ'
    ],
    correctAnswers: [0, 1, 2],
    explanation: 'Vận tốc, gia tốc và lực kéo về biến thiên điều hòa cùng tần số f với li độ. Trong khi đó động năng biến thiên tuần hoàn với tần số gấp đôi (2f).',
    sourceDocument: 'Tài liệu bồi dưỡng Vật lí 12',
    createdAt: '2026-09-18T09:15:00Z',
    updatedAt: '2026-10-05T14:20:00Z',
  },

  // 3. Đúng/Sai theo từng ý
  {
    id: 'qb_hoa11_003',
    code: 'QB-HOA11-003',
    type: 'true_false_group',
    content: 'Xét cân bằng hóa học trong bình kín ở nhiệt độ không đổi: N₂(k) + 3H₂(k) ⇄ 2NH₃(k), phản ứng thuận là phản ứng tỏa nhiệt (ΔH < 0). Hãy xác định tính Đúng/Sai của các phát biểu sau:',
    grade: 'Lớp 11',
    subject: 'Hóa học',
    chapter: 'Chương 1: Cân bằng hóa học',
    topic: 'Nguyên lý chuyển dịch Le Chatelier',
    difficulty: 'application',
    points: 1.0,
    tags: ['Cân bằng hóa học', 'Le Chatelier', 'Nhiệt động học'],
    source: 'ai',
    author: 'AI Trợ lý Sư phạm',
    status: 'approved',
    statements: [
      {
        id: 'st_1',
        text: 'Khi tăng áp suất chung của hệ, cân bằng chuyển dịch theo chiều thuận tạo thêm NH₃.',
        isCorrect: true,
        explanation: 'Phản ứng thuận làm giảm số mol khí (từ 4 mol về 2 mol), nên khi tăng áp suất hệ sẽ chuyển dịch sang chiều thuận.'
      },
      {
        id: 'st_2',
        text: 'Khi tăng nhiệt độ của hệ, hằng số cân bằng Kc của phản ứng tăng lên.',
        isCorrect: false,
        explanation: 'Vì phản ứng thuận tỏa nhiệt (ΔH < 0), khi tăng nhiệt độ cân bằng chuyển dịch theo chiều nghịch, dẫn đến Kc giảm.'
      },
      {
        id: 'st_3',
        text: 'Thêm chất xúc tác Fe làm tăng hiệu suất tổng hợp khí amoniac.',
        isCorrect: false,
        explanation: 'Chất xúc tác chỉ làm tăng tốc độ đạt tới trạng thái cân bằng, không làm chuyển dịch cân bằng hay thay đổi hiệu suất.'
      },
      {
        id: 'st_4',
        text: 'Lấy bớt NH₃ ra khỏi hệ phản ứng sẽ làm cân bằng tiếp tục dịch chuyển theo chiều thuận.',
        isCorrect: true,
        explanation: 'Theo nguyên lý Le Chatelier, giảm nồng độ sản phẩm kích thích phản ứng thuận diễn ra để bù lại lượng đã mất.'
      }
    ],
    sourceDocument: 'Sách Chuyên đề Hóa học 11',
    createdAt: '2026-09-22T11:00:00Z',
    updatedAt: '2026-10-06T16:00:00Z',
  },

  // 4. Ghép đôi (Matching)
  {
    id: 'qb_su12_004',
    code: 'QB-SU12-004',
    type: 'matching',
    content: 'Hãy ghép nối các chiến dịch lịch sử quan trọng trong kháng chiến chống Pháp (cột A) với ý nghĩa chiến lược tương ứng (cột B):',
    grade: 'Lớp 12',
    subject: 'Lịch sử',
    chapter: 'Chương 3: Cuộc kháng chiến toàn quốc chống thực dân Pháp',
    topic: 'Các chiến dịch quân sự lớn',
    difficulty: 'comprehension',
    points: 1.0,
    tags: ['Lịch sử Việt Nam', 'Kháng chiến chống Pháp', 'Chiến dịch quân sự'],
    source: 'manual',
    author: 'Thầy Lê Hoàng Quân',
    status: 'approved',
    matchingPairs: [
      {
        id: 'pair_1',
        left: 'Chiến dịch Việt Bắc thu - đông 1947',
        right: 'Làm thất bại hoàn toàn chiến lược "đánh nhanh thắng nhanh" của thực dân Pháp'
      },
      {
        id: 'pair_2',
        left: 'Chiến dịch Biên giới thu - đông 1950',
        right: 'Quân đội ta giành quyền chủ động chiến lược trên chiến trường chính Bắc Bộ'
      },
      {
        id: 'pair_3',
        left: 'Cuộc Tiến công chiến lược Đông - Xuân 1953 - 1954',
        right: 'Buộc quân Pháp phải phân tán lực lượng thành 5 nơi đóng quân cơ động'
      },
      {
        id: 'pair_4',
        left: 'Chiến dịch Điện Biên Phủ 1954',
        right: 'Đập tan hoàn toàn kế hoạch Nava, xoay chuyển cục diện chiến tranh'
      }
    ],
    explanation: 'Mỗi chiến dịch mang một bước ngoặt lịch sử: 1947 phá vỡ đánh nhanh thắng nhanh; 1950 giành quyền chủ động; 1953-1954 xé nhỏ lực lượng địch; 1954 quyết định thắng lợi.',
    createdAt: '2026-09-25T14:30:00Z',
    updatedAt: '2026-10-08T09:10:00Z',
  },

  // 5. Sắp xếp (Ordering)
  {
    id: 'qb_sinh10_005',
    code: 'QB-SINH10-005',
    type: 'ordering',
    content: 'Sắp xếp các kì của quá trình phân chia nhân tế bào trong nguyên phân theo đúng trình tự diễn ra tự nhiên:',
    grade: 'Lớp 10',
    subject: 'Sinh học',
    chapter: 'Phần 3: Sinh học tế bào',
    topic: 'Chu kì tế bào và nguyên phân',
    difficulty: 'knowledge',
    points: 1.0,
    tags: ['Nguyên phân', 'Chu kì tế bào', 'Di truyền'],
    source: 'manual',
    author: 'Cô Đỗ Thu Hà',
    status: 'approved',
    orderingItems: [
      { id: 'ord_1', text: 'Kì đầu (Prophase): Nhiễm sắc thể bắt đầu co xoắn, màng nhân tiêu biến', correctIndex: 1 },
      { id: 'ord_2', text: 'Kì giữa (Metaphase): Nhiễm sắc thể co xoắn cực đại và xếp thành một hàng trên mặt phẳng xích đạo', correctIndex: 2 },
      { id: 'ord_3', text: 'Kì sau (Anaphase): Các nhiễm sắc tử chị em tách nhau ra và di chuyển về hai cực của tế bào', correctIndex: 3 },
      { id: 'ord_4', text: 'Kì cuối (Telophase): Màng nhân tái xuất hiện, nhiễm sắc thể dãn xoắn dần', correctIndex: 4 }
    ],
    explanation: 'Trình tự diễn ra phân chia nhân nguyên phân: Kì đầu -> Kì giữa -> Kì sau -> Kì cuối, tiếp theo là phân chia tế bào chất.',
    createdAt: '2026-09-28T08:45:00Z',
    updatedAt: '2026-10-10T11:00:00Z',
  },

  // 6. Điền khuyết (Fill Blank)
  {
    id: 'qb_van11_006',
    code: 'QB-VAN11-006',
    type: 'fill_blank',
    content: 'Điền từ ngữ thích hợp vào các chỗ trống để hoàn chỉnh nhận định về nghệ thuật trong bài thơ "Vội vàng" của Xuân Diệu:',
    grade: 'Lớp 11',
    subject: 'Ngữ văn',
    chapter: 'Văn học hiện đại Việt Nam',
    topic: 'Thơ mới 1932 - 1945',
    difficulty: 'comprehension',
    points: 1.0,
    tags: ['Vội vàng', 'Xuân Diệu', 'Thơ mới'],
    source: 'manual',
    author: 'Thầy Hoàng Minh Đức',
    status: 'approved',
    templateText: 'Trong phong trào Thơ mới, nhà phê bình Hoài Thanh từng đánh giá Xuân Diệu là nhà thơ [blank_1] nhất trong các nhà thơ mới. Tác phẩm "Vội vàng" thể hiện một quan niệm nhân sinh mới mẻ: nguồn hạnh phúc đích thực và thiên đường đẹp nhất nằm ngay giữa chốn [blank_2].',
    blanks: [
      {
        id: 'blank_1',
        acceptedAnswers: ['mới nhất', 'mới'],
        caseSensitive: false,
        hint: 'Tính từ mô tả sự cách tân độc đáo'
      },
      {
        id: 'blank_2',
        acceptedAnswers: ['trần gian', 'trần thế', 'cuộc đời trần thế'],
        caseSensitive: false,
        hint: 'Nơi con người đang sống thực tại'
      }
    ],
    explanation: 'Hoài Thanh viết trong Thi nhân Việt Nam: "Xuân Diệu là nhà thơ mới nhất trong các nhà thơ mới". Ông quan niệm thiên đường không ở đâu xa mà có sẵn nơi trần thế.',
    createdAt: '2026-10-01T15:20:00Z',
    updatedAt: '2026-10-12T10:15:00Z',
  },

  // 7. Trả lời ngắn (Short Answer)
  {
    id: 'qb_anh10_007',
    code: 'QB-ANH10-007',
    type: 'short_answer',
    content: 'Complete the sentence with the correct form of the verb in brackets:\n"If the weather (be) __________ fine tomorrow, our class will go on a picnic in the national park."',
    grade: 'Lớp 10',
    subject: 'Tiếng Anh',
    chapter: 'Unit 5: Inventions & Environment',
    topic: 'Conditional Sentences Type 1',
    difficulty: 'comprehension',
    points: 0.5,
    tags: ['Conditional Type 1', 'Grammar', 'Verb Form'],
    source: 'import',
    author: 'Hệ thống Import',
    status: 'approved',
    sampleAnswer: 'is',
    acceptedVariations: ['is', 'Is'],
    caseSensitive: false,
    explanation: 'Trong mệnh đề điều kiện loại 1 (If clause), động từ ở thì hiện tại đơn giản. Chủ ngữ "the weather" là danh từ không đếm được nên chia to be là "is".',
    createdAt: '2026-10-04T16:00:00Z',
    updatedAt: '2026-10-14T08:30:00Z',
  },

  // 8. Tự luận (Essay)
  {
    id: 'qb_tin11_008',
    code: 'QB-TIN11-008',
    type: 'essay',
    content: 'Trình bày ý tưởng thuật toán sắp xếp nổi bọt (Bubble Sort) trên dãy số nguyên a₁, a₂, ..., an. Nêu rõ độ phức tạp thời gian trong trường hợp tốt nhất và trường hợp xấu nhất, đồng thời giải thích cách cải tiến thuật toán khi dãy số đã có thứ tự sẵn.',
    grade: 'Lớp 11',
    subject: 'Tin học',
    chapter: 'Chủ đề F: Giải quyết vấn đề với sự trợ giúp của máy tính',
    topic: 'Thuật toán sắp xếp cơ bản',
    difficulty: 'high_application',
    points: 2.0,
    tags: ['Bubble Sort', 'Thuật toán', 'Độ phức tạp'],
    source: 'manual',
    author: 'Cô Vũ Thị Thu',
    status: 'approved',
    rubric: `Thang chấm chi tiết (Tổng 2.0 điểm):
- 0.5đ: Nêu đúng nguyên lý so sánh từng cặp phần tử liền kề và hoán đổi nếu sai thứ tự.
- 0.5đ: Nêu đúng độ phức tạp trường hợp xấu nhất O(n²) và trường hợp tốt nhất O(n) sau khi cải tiến.
- 1.0đ: Trình bày chính xác kỹ thuật đặt cờ hiệu (boolean swapped / flag) để dừng vòng lặp sớm khi một lượt duyệt không phát sinh phép hoán đổi nào.`,
    suggestedAnswer: `1. Ý tưởng Bubble Sort: Duyệt qua danh sách, so sánh hai phần tử liền kề và đổi chỗ nếu chúng không đúng thứ tự (ví dụ phần tử trước lớn hơn phần tử sau). Sau mỗi lượt duyệt, phần tử lớn nhất sẽ "nổi" về cuối dãy.
2. Độ phức tạp:
   - Trường hợp xấu nhất (dãy nghịch đảo hoàn toàn): O(n²).
   - Trường hợp tốt nhất (dãy đã sắp xếp sẵn): O(n) nếu có cờ hiệu phát hiện dừng sớm.
3. Cải tiến: Sử dụng biến cờ hiệu swapped = false trước mỗi vòng lặp trong. Nếu có đổi chỗ thì gán swapped = true. Kết thúc vòng lặp trong nếu swapped vẫn là false nghĩa là mảng đã được sắp xếp, thoát vòng lặp ngay lập tức.`,
    createdAt: '2026-10-06T10:00:00Z',
    updatedAt: '2026-10-15T14:40:00Z',
  },

  // 9. Câu hỏi theo đoạn văn/tình huống (Passage Group)
  {
    id: 'qb_anh12_009',
    code: 'QB-ANH12-009',
    type: 'passage_group',
    content: 'Read the following passage about Artificial Intelligence in Education and answer the comprehension sub-questions below:',
    grade: 'Lớp 12',
    subject: 'Tiếng Anh',
    chapter: 'Unit 9: Choosing a Career & Technology',
    topic: 'Reading Comprehension: AI & Learning',
    difficulty: 'high_application',
    points: 2.0,
    tags: ['Reading Comprehension', 'AI in Education', 'Passage Question'],
    source: 'ai',
    author: 'AI Trợ lý Sư phạm',
    status: 'approved',
    passage: `Artificial Intelligence (AI) is transforming modern education by tailoring instruction to individual student needs. Through adaptive learning platforms, software evaluates each learner's strengths and learning pace in real time, delivering customized exercises and immediate explanatory feedback. 

However, experts caution that technology cannot replace human teachers. The empathetic guidance, ethical mentorship, and critical thinking cultivated through teacher-student dialogue remain irreplaceable elements of wholesome education. Effective modern classrooms are envisioned as collaborative ecosystems where educators leverage AI for administrative efficiency while dedicating more quality time to pedagogical mentoring.`,
    subQuestions: [
      {
        id: 'sub_1',
        type: 'single_choice',
        content: 'According to paragraph 1, how does adaptive learning software support individual students?',
        options: [
          'By providing uniform assignments to every classroom member',
          'By evaluating student pace in real time and providing customized feedback',
          'By grading exams without needing any teacher verification',
          'By replacing textbooks entirely with audio lectures'
        ],
        correctAnswer: 1,
        explanation: 'The passage explicitly notes that adaptive platforms evaluate each learner\'s pace in real time and deliver customized exercises and explanatory feedback.',
        points: 1.0,
      },
      {
        id: 'sub_2',
        type: 'single_choice',
        content: 'What is the author\'s main conclusion regarding the future role of educators?',
        options: [
          'Teachers will be gradually phased out by smart robotic agents',
          'Teachers will focus on software maintenance rather than instruction',
          'Educators should collaborate with AI to spend more time on meaningful mentoring',
          'Schools should ban all algorithmic technologies to preserve traditional ethics'
        ],
        correctAnswer: 2,
        explanation: 'Paragraph 2 highlights that educators can leverage AI for routine efficiency to dedicate more quality time to pedagogical and empathetic mentoring.',
        points: 1.0,
      }
    ],
    explanation: 'Bài đọc rèn luyện năng lực đọc hiểu chuyên sâu về ứng dụng chuyển đổi số và AI trong giáo dục hiện đại.',
    createdAt: '2026-10-09T08:20:00Z',
    updatedAt: '2026-10-16T17:00:00Z',
  },

  // 10. Bản nháp (Draft)
  {
    id: 'qb_toan12_010',
    code: 'QB-TOAN12-010',
    type: 'single_choice',
    content: 'Tìm nguyên hàm của hàm số f(x) = e^(2x) + sin(x) trên tập số thực ℝ:',
    grade: 'Lớp 12',
    subject: 'Toán học',
    chapter: 'Chương 3: Nguyên hàm và Tích phân',
    topic: 'Nguyên hàm cơ bản',
    difficulty: 'knowledge',
    points: 0.5,
    tags: ['Nguyên hàm', 'Giải tích 12'],
    source: 'manual',
    author: 'Thầy Nguyễn Văn Nam',
    status: 'draft',
    options: [
      'F(x) = (1/2)e^(2x) - cos(x) + C',
      'F(x) = 2e^(2x) + cos(x) + C',
      'F(x) = (1/2)e^(2x) + cos(x) + C',
      'F(x) = e^(2x) - cos(x) + C'
    ],
    correctAnswer: 0,
    explanation: '∫e^(2x)dx = (1/2)e^(2x) + C1 và ∫sin(x)dx = -cos(x) + C2. Vậy F(x) = (1/2)e^(2x) - cos(x) + C.',
    createdAt: '2026-10-16T10:00:00Z',
    updatedAt: '2026-10-16T10:00:00Z',
  },

  // 11. Chờ duyệt (Pending)
  {
    id: 'qb_dia10_011',
    code: 'QB-DIA10-011',
    type: 'single_choice',
    content: 'Hiện tượng ngày đêm luân phiên trên Trái Đất là kết quả trực tiếp của chuyển động nào?',
    grade: 'Lớp 10',
    subject: 'Địa lí',
    chapter: 'Chương 1: Trái Đất trong hệ Mặt Trời',
    topic: 'Hệ quả chuyển động của Trái Đất',
    difficulty: 'knowledge',
    points: 0.5,
    tags: ['Địa lí tự nhiên', 'Hệ Mặt Trời'],
    source: 'ai',
    author: 'AI Trợ lý Sư phạm',
    status: 'pending',
    options: [
      'Chuyển động tự quay quanh trục của Trái Đất từ Tây sang Đông',
      'Chuyển động tịnh tiến của Trái Đất quanh Mặt Trời theo quỹ đạo elip',
      'Sự thay đổi góc nghiêng trục Trái Đất theo từng mùa',
      'Lực hút hấp dẫn biến thiên từ Mặt Trăng'
    ],
    correctAnswer: 0,
    explanation: 'Do Trái Đất có dạng hình cầu và tự quay quanh trục từ Tây sang Đông nên chỉ có một nửa được chiếu sáng, sinh ra ngày đêm luân phiên.',
    createdAt: '2026-10-17T09:30:00Z',
    updatedAt: '2026-10-17T09:30:00Z',
  },

  // 12. Đã lưu trữ (Archived)
  {
    id: 'qb_hoa10_012',
    code: 'QB-HOA10-012',
    type: 'single_choice',
    content: 'Cấu hình electron nguyên tử của nguyên tố Natri (Z = 11) ở trạng thái cơ bản là gì? (Câu hỏi ôn tập cũ)',
    grade: 'Lớp 10',
    subject: 'Hóa học',
    chapter: 'Chương 1: Cấu tạo nguyên tử',
    topic: 'Vỏ nguyên tử',
    difficulty: 'knowledge',
    points: 0.5,
    tags: ['Cấu tạo nguyên tử', 'Ôn tập'],
    source: 'manual',
    author: 'Thầy Lê Hoàng Quân',
    status: 'archived',
    options: [
      '1s² 2s² 2p⁶ 3s¹',
      '1s² 2s² 2p⁵ 3s²',
      '1s² 2s² 2p⁶ 3s²',
      '1s² 2s² 2p⁶'
    ],
    correctAnswer: 0,
    explanation: 'Natri có Z = 11 electron, phân bố: 1s² (2) -> 2s² 2p⁶ (8) -> 3s¹ (1).',
    createdAt: '2026-08-10T09:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
  }
];

export const questionBankStorage = {
  getQuestions(): BankQuestion[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialQuestionBank));
        return initialQuestionBank;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading Question Bank from storage, falling back to seed:', e);
      return initialQuestionBank;
    }
  },

  saveQuestions(questions: BankQuestion[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
    } catch (e) {
      console.error('Error saving Question Bank to storage:', e);
    }
  },

  addQuestion(question: BankQuestion): BankQuestion {
    const list = this.getQuestions();
    const now = new Date().toISOString();
    const newQ: BankQuestion = {
      ...question,
      id: question.id || `qb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: question.createdAt || now,
      updatedAt: now,
    };
    const updated = [newQ, ...list];
    this.saveQuestions(updated);
    syncQuestionToFirestore(newQ);
    return newQ;
  },

  addQuestions(newQuestions: BankQuestion[]): void {
    const list = this.getQuestions();
    const now = new Date().toISOString();
    const prepared = newQuestions.map((q) => ({
      ...q,
      id: q.id || `qb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: q.createdAt || now,
      updatedAt: now,
    }));
    this.saveQuestions([...prepared, ...list]);
    prepared.forEach((q) => syncQuestionToFirestore(q));
  },

  updateQuestion(id: string, updates: Partial<BankQuestion>): BankQuestion | null {
    const list = this.getQuestions();
    const idx = list.findIndex((q) => q.id === id);
    if (idx === -1) return null;
    const updated: BankQuestion = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[idx] = updated;
    this.saveQuestions(list);
    syncQuestionToFirestore(updated);
    return updated;
  },

  deleteQuestion(id: string): boolean {
    const list = this.getQuestions();
    const filtered = list.filter((q) => q.id !== id);
    if (filtered.length === list.length) return false;
    this.saveQuestions(filtered);
    removeQuestionFromFirestore(id);
    return true;
  },

  batchUpdateStatus(ids: string[], status: QuestionStatus): void {
    const list = this.getQuestions();
    const now = new Date().toISOString();
    const updated = list.map((q) => {
      if (ids.includes(q.id)) {
        const item = { ...q, status, updatedAt: now };
        syncQuestionToFirestore(item);
        return item;
      }
      return q;
    });
    this.saveQuestions(updated);
  },

  batchDelete(ids: string[]): void {
    const list = this.getQuestions();
    const filtered = list.filter((q) => !ids.includes(q.id));
    this.saveQuestions(filtered);
    ids.forEach((id) => removeQuestionFromFirestore(id));
  },

  duplicateQuestion(id: string): BankQuestion | null {
    const list = this.getQuestions();
    const original = list.find((q) => q.id === id);
    if (!original) return null;

    const copyCode = original.code ? `${original.code}-COPY` : `QB-${Date.now().toString().slice(-4)}`;
    const duplicate: BankQuestion = {
      ...original,
      id: `qb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      code: copyCode,
      content: `${original.content} (Bản sao)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveQuestions([duplicate, ...list]);
    syncQuestionToFirestore(duplicate);
    return duplicate;
  },

  resetToDefaultSeed(): BankQuestion[] {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialQuestionBank));
    return initialQuestionBank;
  }
};
