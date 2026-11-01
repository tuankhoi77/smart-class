export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  status: 'active' | 'inactive';
  schoolId?: string;
  schoolName?: string;
  studentId?: string; // If role === 'student'
  childrenIds?: string[]; // If role === 'parent'
  lastLoginAt?: string;
  createdAt: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  principalName: string;
  academicYearId: string;
  classesCount: number;
  studentsCount: number;
}

export interface AcademicYear {
  id: string;
  name: string;
  isCurrent: boolean;
  startDate: string;
  endDate: string;
}

export interface GradeLevel {
  id: string;
  name: string;
  level: number; // 10, 11, 12...
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  iconName: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  gradeLevelId: string;
  gradeName: string;
  subjectName?: string;
  academicYear: string;
  teacherId: string;
  teacherName: string;
  room: string;
  description: string;
  color: string;
  studentCount: number;
  status: 'active' | 'archived';
  joinCode: string;
  scheduleSummary?: string;
}

export type AttendanceStatus = 'present' | 'excused' | 'unexcused' | 'late' | 'early_leave';

export interface Student {
  id: string;
  code: string;
  fullName: string;
  gender: 'male' | 'female';
  birthDate: string;
  classId: string;
  className: string;
  group: string; // "Tổ 1", "Tổ 2", etc.
  orderNumber: number; // STT
  avatar?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'studying' | 'transferred' | 'suspended' | 'reserved';
  parentId?: string;
  parentName?: string;
  parentPhone?: string;
  parentRelation?: string;
  // 360 Computed stats
  gpa: number;
  attendanceRate: number;
  rewardPoints: number;
  submittedAssignmentsCount: number;
  totalAssignmentsCount: number;
  behaviorScore: number;
}

export interface Parent {
  id: string;
  fullName: string;
  phone: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  classId: string;
  className: string;
  relation: string; // 'Bố' | 'Mẹ' | 'Người giám hộ'
  email?: string;
  address?: string;
  job?: string;
  zaloPhone?: string;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  period: string; // "Tiết 1", "Buổi sáng", etc.
  studentId: string;
  studentName: string;
  studentCode: string;
  status: AttendanceStatus;
  reason?: string;
  updatedBy: string;
  updatedAt: string;
}

export interface ScheduleItem {
  id: string;
  classId: string;
  className: string;
  dayOfWeek: 2 | 3 | 4 | 5 | 6 | 7; // Thứ 2 - Thứ 7
  period: number; // 1 - 5
  startTime: string;
  endTime: string;
  subject: string;
  room: string;
  teacherName: string;
  note?: string;
}

export type AssignmentStatus = 'draft' | 'published' | 'closed';

export interface Assignment {
  id: string;
  classId: string;
  className: string;
  subject: string;
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  maxScore: number;
  status: AssignmentStatus;
  targetType: 'class' | 'group' | 'student';
  targetIds?: string[];
  attachments?: { name: string; url: string; size: string }[];
  submissionsCount?: number;
  gradedCount?: number;
}

export type SubmissionStatus = 'pending' | 'submitted' | 'late' | 'graded' | 'resubmit';

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  submittedAt?: string;
  content: string;
  attachments?: { name: string; url: string; size: string }[];
  score: number | null;
  feedback?: string;
  status: SubmissionStatus;
  gradedAt?: string;
}

export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[];
  correctAnswer: any; // index, string, or boolean
  explanation?: string;
  points: number;
}

export interface Quiz {
  id: string;
  classId: string;
  className: string;
  subject: string;
  title: string;
  description: string;
  durationMinutes: number;
  openTime: string;
  closeTime: string;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  totalPoints: number;
  status: 'active' | 'upcoming' | 'closed';
  questions: QuizQuestion[];
  attemptsCount?: number;
  averageScore?: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  startedAt: string;
  submittedAt: string;
  score: number;
  maxScore: number;
  answers: Record<string, any>;
}

export interface ResourceDocument {
  id: string;
  title: string;
  type: 'pdf' | 'docx' | 'pptx' | 'video' | 'link' | 'lesson_plan';
  gradeName: string;
  subject: string;
  chapter: string;
  lesson: string;
  url: string;
  size: string;
  authorName: string;
  downloads: number;
  isFavorite: boolean;
  createdAt: string;
}

export interface GradeItem {
  id: string;
  classId: string;
  studentId: string;
  subject: string;
  term: 'term1' | 'term2' | 'year';
  type: 'oral' | 'quiz_15m' | 'test_45m' | 'midterm' | 'final';
  typeName: string;
  score: number;
  weight: number;
  note?: string;
  updatedAt: string;
}

export interface BehaviorRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  type: 'positive' | 'needs_improvement';
  points: number;
  title: string;
  content: string;
  teacherName: string;
  date: string;
}

export interface RewardBadge {
  id: string;
  studentId: string;
  badgeName: string;
  icon: string;
  reason: string;
  awardedAt: string;
}

export type AlertType = 'absent_high' | 'late_high' | 'missing_homework' | 'low_grades' | 'grade_drop';
export type AlertStatus = 'new' | 'viewed' | 'processing' | 'resolved';

export interface SmartAlert {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  classId: string;
  type: AlertType;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: AlertStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedNote?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  classId: string; // 'all' or specific class ID
  className?: string;
  senderName: string;
  senderRole: string;
  sentAt: string;
  targetRole: 'all' | 'students' | 'parents';
  readBy: string[]; // User IDs who have read
  attachments?: { name: string; url: string; size: string }[];
}

export interface ParentMessage {
  id: string;
  parentId: string;
  parentName: string;
  teacherId: string;
  teacherName: string;
  studentName: string;
  senderRole: 'teacher' | 'parent';
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ip: string;
}

export interface SystemConfig {
  schoolName: string;
  currentAcademicYear: string;
  currentTerm: string;
  attendanceCutoffTime: string;
  gradingScale: '10' | '100' | '4';
  allowParentMessaging: boolean;
  enableAiFeatures: boolean;
}
