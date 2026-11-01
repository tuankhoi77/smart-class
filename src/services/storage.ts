import {
  User,
  School,
  AcademicYear,
  GradeLevel,
  Subject,
  ClassRoom,
  Student,
  Parent,
  AttendanceRecord,
  ScheduleItem,
  Assignment,
  Submission,
  Quiz,
  ResourceDocument,
  GradeItem,
  BehaviorRecord,
  RewardBadge,
  SmartAlert,
  Announcement,
  ParentMessage,
  AuditLog,
  SystemConfig,
} from '../types';
import {
  initialUsers,
  initialSchools,
  initialAcademicYears,
  initialGradeLevels,
  initialSubjects,
  initialClasses,
  initialStudents,
  initialAttendanceRecords,
  initialSchedules,
  initialAssignments,
  initialSubmissions,
  initialQuizzes,
  initialResources,
  initialGradeItems,
  initialBehaviorRecords,
  initialRewardBadges,
  initialSmartAlerts,
  initialAnnouncements,
  initialParentMessages,
  initialAuditLogs,
  initialSystemConfig,
} from '../data/initialData';

const PREFIX = 'smartedu_';

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

class StorageService {
  // Users
  getUsers(): User[] {
    return getStored<User[]>('users', initialUsers);
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  saveUser(user: User): void {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    setStored('users', users);
  }

  deleteUser(id: string): void {
    const users = this.getUsers().filter((u) => u.id !== id);
    setStored('users', users);
  }

  // Schools
  getSchools(): School[] {
    return getStored<School[]>('schools', initialSchools);
  }

  saveSchool(school: School): void {
    const list = this.getSchools();
    const idx = list.findIndex((s) => s.id === school.id);
    if (idx >= 0) list[idx] = school;
    else list.push(school);
    setStored('schools', list);
  }

  // Academic Years
  getAcademicYears(): AcademicYear[] {
    return getStored<AcademicYear[]>('academic_years', initialAcademicYears);
  }

  saveAcademicYear(year: AcademicYear): void {
    const list = this.getAcademicYears();
    const idx = list.findIndex((y) => y.id === year.id);
    if (idx >= 0) list[idx] = year;
    else list.push(year);
    setStored('academic_years', list);
  }

  // Grade Levels & Subjects
  getGradeLevels(): GradeLevel[] {
    return getStored<GradeLevel[]>('grade_levels', initialGradeLevels);
  }

  getSubjects(): Subject[] {
    return getStored<Subject[]>('subjects', initialSubjects);
  }

  // Classes
  getClasses(): ClassRoom[] {
    return getStored<ClassRoom[]>('classes', initialClasses);
  }

  getClassById(id: string): ClassRoom | undefined {
    return this.getClasses().find((c) => c.id === id);
  }

  saveClass(cls: ClassRoom): void {
    const classes = this.getClasses();
    const idx = classes.findIndex((c) => c.id === cls.id);
    if (idx >= 0) {
      classes[idx] = cls;
    } else {
      classes.push(cls);
    }
    setStored('classes', classes);
  }

  archiveClass(id: string): void {
    const classes = this.getClasses();
    const target = classes.find((c) => c.id === id);
    if (target) {
      target.status = target.status === 'archived' ? 'active' : 'archived';
      setStored('classes', classes);
    }
  }

  deleteClass(id: string): void {
    const classes = this.getClasses().filter((c) => c.id !== id);
    setStored('classes', classes);
  }

  duplicateClass(sourceId: string, newYear: string): ClassRoom | null {
    const source = this.getClassById(sourceId);
    if (!source) return null;
    const newClass: ClassRoom = {
      ...source,
      id: 'cls_' + Date.now(),
      name: `${source.name} (${newYear})`,
      academicYear: newYear,
      studentCount: 0,
      joinCode: 'JOIN' + Math.floor(1000 + Math.random() * 9000),
      status: 'active',
    };
    this.saveClass(newClass);
    return newClass;
  }

  seedCohortForClass(classId: string, className: string): Student[] {
    const cohorts: Record<string, Array<{ name: string; gender: 'male' | 'female'; parent: string; phone: string; rel: string }>> = {
      cls_10a1: [
        { name: 'Lê Hoàng An', gender: 'male', parent: 'Lê Tiến Thành', phone: '0978901234', rel: 'Bố' },
        { name: 'Nguyễn Thảo Linh', gender: 'female', parent: 'Nguyễn Văn Đức', phone: '0912111222', rel: 'Bố' },
        { name: 'Trần Gia Bảo', gender: 'male', parent: 'Trần Văn Hiếu', phone: '0903334455', rel: 'Bố' },
        { name: 'Vũ Minh Châu', gender: 'female', parent: 'Vũ Văn Long', phone: '0984445566', rel: 'Bố' },
        { name: 'Phạm Đức Huy', gender: 'male', parent: 'Phạm Văn Nam', phone: '0915556677', rel: 'Bố' },
        { name: 'Hoàng Mai Anh', gender: 'female', parent: 'Hoàng Văn Tuấn', phone: '0976667788', rel: 'Bố' },
        { name: 'Đỗ Tuấn Kiệt', gender: 'male', parent: 'Đỗ Quốc Khánh', phone: '0907778899', rel: 'Bố' },
        { name: 'Bùi Phương Uyên', gender: 'female', parent: 'Bùi Văn Hùng', phone: '0988889900', rel: 'Bố' },
      ],
      cls_10a2: [
        { name: 'Nguyễn Quốc Anh', gender: 'male', parent: 'Nguyễn Văn Hải', phone: '0982345678', rel: 'Bố' },
        { name: 'Trần Mai Phương', gender: 'female', parent: 'Lê Thị Lan', phone: '0912456789', rel: 'Mẹ' },
        { name: 'Đặng Minh Tuấn', gender: 'male', parent: 'Đặng Đình Dũng', phone: '0973567890', rel: 'Bố' },
        { name: 'Lê Thu Trang', gender: 'female', parent: 'Trần Thu Hà', phone: '0964678901', rel: 'Mẹ' },
        { name: 'Hoàng Nhật Minh', gender: 'male', parent: 'Hoàng Văn Hùng', phone: '0915789012', rel: 'Bố' },
        { name: 'Vũ Bảo Ngọc', gender: 'female', parent: 'Phạm Mai Anh', phone: '0986890123', rel: 'Mẹ' },
        { name: 'Phan Thanh Tùng', gender: 'male', parent: 'Phan Đức Thắng', phone: '0977901234', rel: 'Bố' },
        { name: 'Bùi Thùy Dung', gender: 'female', parent: 'Nguyễn Bích Thủy', phone: '0908012345', rel: 'Mẹ' },
        { name: 'Nguyễn Đình Trọng', gender: 'male', parent: 'Nguyễn Văn Bình', phone: '0919123456', rel: 'Bố' },
        { name: 'Phạm Thúy Nga', gender: 'female', parent: 'Đỗ Thị Minh', phone: '0981234567', rel: 'Mẹ' },
        { name: 'Đỗ Gia Huy', gender: 'male', parent: 'Đỗ Mạnh Cường', phone: '0972345678', rel: 'Bố' },
        { name: 'Lâm Yến Nhi', gender: 'female', parent: 'Lý Hải Vân', phone: '0963456789', rel: 'Mẹ' },
      ],
      cls_11b1: [
        { name: 'Nguyễn Hải Nam', gender: 'male', parent: 'Nguyễn Văn Tuấn', phone: '0984567890', rel: 'Bố' },
        { name: 'Trịnh Thanh Hằng', gender: 'female', parent: 'Vũ Thị Hạnh', phone: '0975678901', rel: 'Mẹ' },
        { name: 'Đinh Công Mạnh', gender: 'male', parent: 'Đinh Văn Quang', phone: '0916789012', rel: 'Bố' },
        { name: 'Hồ Diệu Linh', gender: 'female', parent: 'Lê Thị Hoa', phone: '0967890123', rel: 'Mẹ' },
        { name: 'Lương Quốc Hưng', gender: 'male', parent: 'Lương Thế Vinh', phone: '0988901234', rel: 'Bố' },
        { name: 'Chu Minh Hạnh', gender: 'female', parent: 'Đỗ Hoàng Yến', phone: '0909012345', rel: 'Mẹ' },
        { name: 'Phạm Gia Huy', gender: 'male', parent: 'Phan Văn Long', phone: '0911123456', rel: 'Bố' },
        { name: 'Tạ Khánh Huyền', gender: 'female', parent: 'Ngô Mỹ Duyên', phone: '0982234567', rel: 'Mẹ' },
      ],
      cls_12c3: [
        { name: 'Nguyễn Thành Đạt', gender: 'male', parent: 'Nguyễn Hữu Đạt', phone: '0973345678', rel: 'Bố' },
        { name: 'Lê Ngọc Mai', gender: 'female', parent: 'Bùi Thị Liên', phone: '0964456789', rel: 'Mẹ' },
        { name: 'Trần Hữu Thắng', gender: 'male', parent: 'Trần Văn Chiến', phone: '0915567890', rel: 'Bố' },
        { name: 'Vương Thu Thảo', gender: 'female', parent: 'Đặng Thu Trang', phone: '0986678901', rel: 'Mẹ' },
        { name: 'Đào Văn Quân', gender: 'male', parent: 'Đào Quốc Dũng', phone: '0977789012', rel: 'Bố' },
        { name: 'Mai Bảo Trâm', gender: 'female', parent: 'Nguyễn Phương Oanh', phone: '0908890123', rel: 'Mẹ' },
        { name: 'Hà Tiến Dũng', gender: 'male', parent: 'Hà Văn Hùng', phone: '0919901234', rel: 'Bố' },
        { name: 'Vũ Phương Thảo', gender: 'female', parent: 'Trương Mai Chi', phone: '0980012345', rel: 'Mẹ' },
      ],
    };

    const targetKey = classId && cohorts[classId] ? classId : (classId || 'cls_10a1');
    const source = cohorts[targetKey] || cohorts['cls_10a2'];
    const prefixCode = (targetKey || '10A1').replace('cls_', '').toUpperCase();

    const avatarsMale = [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    ];
    const avatarsFemale = [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
    ];

    return source.map((item, idx) => {
      const isFemale = item.gender === 'female';
      const avatar = isFemale
        ? avatarsFemale[idx % avatarsFemale.length]
        : avatarsMale[idx % avatarsMale.length];
      const gpa = Number((8.1 + (idx % 5) * 0.3).toFixed(1));
      const attRate = 96 + (idx % 5);

      return {
        id: `stu_${targetKey}_${idx + 1}`,
        code: `HS25-${prefixCode}${String(idx + 1).padStart(2, '0')}`,
        fullName: item.name,
        gender: item.gender,
        birthDate: `2010-${String((idx % 12) + 1).padStart(2, '0')}-15`,
        classId: targetKey,
        className: className || 'Lớp ' + prefixCode,
        group: `Tổ ${(idx % 4) + 1}`,
        orderNumber: idx + 1,
        avatar,
        email: `hs.${targetKey}.${idx + 1}@smartedu.vn`,
        phone: item.phone,
        address: 'Hà Nội',
        status: 'studying',
        parentId: `par_${targetKey}_${idx + 1}`,
        parentName: item.parent,
        parentPhone: item.phone,
        parentRelation: item.rel,
        gpa,
        attendanceRate: attRate > 100 ? 100 : attRate,
        rewardPoints: 100 + idx * 10,
        submittedAssignmentsCount: 12,
        totalAssignmentsCount: 14,
        behaviorScore: 94,
      };
    });
  }

  // Students
  getStudents(): Student[] {
    let students = getStored<Student[]>('students', initialStudents);
    if (!students || students.length === 0) {
      students = [...initialStudents];
      setStored('students', students);
    }

    const classes = this.getClasses();
    let updated = false;

    classes.forEach((cls) => {
      const classStudents = students.filter((s) => s.classId === cls.id);
      if (classStudents.length === 0) {
        const seeded = this.seedCohortForClass(cls.id, cls.name);
        students.push(...seeded);
        cls.studentCount = seeded.length;
        updated = true;
      }
    });

    if (updated) {
      setStored('students', students);
      setStored('classes', classes);
    }

    return students;
  }

  getStudentById(id: string): Student | undefined {
    return this.getStudents().find((s) => s.id === id);
  }

  getStudentsByClass(classId: string): Student[] {
    const all = this.getStudents();
    if (!classId || classId === 'all') {
      return all;
    }

    let filtered = all.filter((s) => s.classId === classId);
    if (filtered.length === 0) {
      const cls = this.getClassById(classId);
      const className = cls?.name || 'Lớp học';
      const seeded = this.seedCohortForClass(classId, className);
      all.push(...seeded);
      setStored('students', all);
      if (cls) {
        cls.studentCount = seeded.length;
        const classes = this.getClasses();
        const cIdx = classes.findIndex((c) => c.id === cls.id);
        if (cIdx >= 0) {
          classes[cIdx] = cls;
          setStored('classes', classes);
        }
      }
      return seeded;
    }
    return filtered;
  }

  saveStudent(student: Student): void {
    const students = this.getStudents();
    const idx = students.findIndex((s) => s.id === student.id);
    if (idx >= 0) {
      students[idx] = student;
    } else {
      students.push(student);
    }
    setStored('students', students);

    // Update class student count
    const classes = this.getClasses();
    const cls = classes.find((c) => c.id === student.classId);
    if (cls) {
      cls.studentCount = students.filter((s) => s.classId === student.classId).length;
      setStored('classes', classes);
    }

    // Keep parent record synced
    if (student.parentName || student.parentPhone) {
      const parents = this.getParents();
      const parentIdx = parents.findIndex(
        (p) => p.studentId === student.id || (student.parentId && p.id === student.parentId)
      );
      if (parentIdx >= 0) {
        parents[parentIdx].fullName = student.parentName || parents[parentIdx].fullName;
        parents[parentIdx].phone = student.parentPhone || parents[parentIdx].phone;
        parents[parentIdx].relation = student.parentRelation || parents[parentIdx].relation;
        parents[parentIdx].studentName = student.fullName;
        parents[parentIdx].className = student.className;
        parents[parentIdx].classId = student.classId;
        parents[parentIdx].zaloPhone = student.parentPhone || parents[parentIdx].zaloPhone;
        setStored('parents', parents);
      } else if (student.parentName) {
        parents.push({
          id: student.parentId || 'par_' + student.id,
          fullName: student.parentName,
          phone: student.parentPhone || '',
          studentId: student.id,
          studentName: student.fullName,
          studentCode: student.code,
          classId: student.classId,
          className: student.className,
          relation: student.parentRelation || 'Bố/Mẹ',
          zaloPhone: student.parentPhone || '',
        });
        setStored('parents', parents);
      }
    }
  }

  deleteStudent(id: string): void {
    const student = this.getStudentById(id);
    const students = this.getStudents().filter((s) => s.id !== id);
    setStored('students', students);

    // TỰ ĐỘNG XÓA LUÔN PHỤ HUYNH KHI XÓA HỌC SINH (Yêu cầu đề bài)
    const parents = this.getParents().filter(
      (p) => p.studentId !== id && (!student || (p.id !== student.parentId && p.phone !== student.parentPhone))
    );
    setStored('parents', parents);

    // Dọn dẹp điểm số của học sinh bị xóa
    const grades = this.getGrades().filter((g) => g.studentId !== id);
    setStored('grades', grades);

    if (student) {
      const classes = this.getClasses();
      const cls = classes.find((c) => c.id === student.classId);
      if (cls) {
        cls.studentCount = students.filter((s) => s.classId === student.classId).length;
        setStored('classes', classes);
      }
    }
  }

  // Parents
  getParents(): Parent[] {
    const stored = localStorage.getItem(PREFIX + 'parents');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing parents:', e);
      }
    }

    // Auto-bootstrap from students
    const students = this.getStudents();
    const bootstrapped: Parent[] = [];
    students.forEach((s) => {
      if (s.parentName || s.parentPhone) {
        bootstrapped.push({
          id: s.parentId || `par_${s.id}`,
          fullName: s.parentName || 'Phụ huynh ' + s.fullName,
          phone: s.parentPhone || '0981234567',
          studentId: s.id,
          studentName: s.fullName,
          studentCode: s.code,
          classId: s.classId,
          className: s.className,
          relation: s.parentRelation || 'Bố/Mẹ',
          email: s.email ? `ph.${s.code.toLowerCase()}@smartedu.vn` : undefined,
          address: s.address,
          job: 'Công chức / Kinh doanh',
          zaloPhone: s.parentPhone || '0981234567',
          notes: 'Quan tâm sát sao việc học của con',
        });
      }
    });
    setStored('parents', bootstrapped);
    return bootstrapped;
  }

  getParentById(id: string): Parent | undefined {
    return this.getParents().find((p) => p.id === id);
  }

  saveParent(parent: Parent): void {
    const list = this.getParents();
    const idx = list.findIndex((p) => p.id === parent.id);
    if (idx >= 0) {
      list[idx] = parent;
    } else {
      list.push(parent);
    }
    setStored('parents', list);

    // Sync back to student
    if (parent.studentId) {
      const student = this.getStudentById(parent.studentId);
      if (student) {
        student.parentId = parent.id;
        student.parentName = parent.fullName;
        student.parentPhone = parent.phone;
        student.parentRelation = parent.relation;
        // save directly to avoid circular calls
        const students = this.getStudents();
        const sIdx = students.findIndex((s) => s.id === student.id);
        if (sIdx >= 0) {
          students[sIdx] = student;
          setStored('students', students);
        }
      }
    }
  }

  deleteParent(id: string): void {
    const parent = this.getParentById(id);
    const list = this.getParents().filter((p) => p.id !== id);
    setStored('parents', list);

    if (parent && parent.studentId) {
      const student = this.getStudentById(parent.studentId);
      if (student) {
        student.parentName = '';
        student.parentPhone = '';
        student.parentId = undefined;
        const students = this.getStudents();
        const sIdx = students.findIndex((s) => s.id === student.id);
        if (sIdx >= 0) {
          students[sIdx] = student;
          setStored('students', students);
        }
      }
    }
  }

  importStudents(newStudents: Partial<Student>[], classId: string, className: string): number {
    const students = this.getStudents();
    let count = 0;
    const startingSTT = students.filter((s) => s.classId === classId).length + 1;

    newStudents.forEach((raw, index) => {
      const student: Student = {
        id: 'stu_' + Date.now() + '_' + index,
        code: raw.code || `HS25-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: raw.fullName || 'Học sinh mới',
        gender: raw.gender === 'female' ? 'female' : 'male',
        birthDate: raw.birthDate || '2010-01-01',
        classId: classId,
        className: className,
        group: raw.group || `Tổ ${(index % 4) + 1}`,
        orderNumber: startingSTT + index,
        phone: raw.phone || '',
        email: raw.email || '',
        address: raw.address || '',
        status: 'studying',
        parentName: raw.parentName || '',
        parentPhone: raw.parentPhone || '',
        parentRelation: raw.parentRelation || 'Phụ huynh',
        gpa: 8.0,
        attendanceRate: 100,
        rewardPoints: 50,
        submittedAssignmentsCount: 0,
        totalAssignmentsCount: 0,
        behaviorScore: 90,
      };
      students.push(student);
      count++;
    });

    setStored('students', students);

    const classes = this.getClasses();
    const cls = classes.find((c) => c.id === classId);
    if (cls) {
      cls.studentCount = students.filter((s) => s.classId === classId).length;
      setStored('classes', classes);
    }

    return count;
  }

  // Attendance
  getAttendance(classId: string, date: string): AttendanceRecord[] {
    const list = getStored<AttendanceRecord[]>('attendance', initialAttendanceRecords);
    if (!classId || classId === 'all') {
      return list.filter((a) => a.date === date);
    }
    return list.filter((a) => a.classId === classId && a.date === date);
  }

  getAllAttendance(): AttendanceRecord[] {
    return getStored<AttendanceRecord[]>('attendance', initialAttendanceRecords);
  }

  saveAttendanceBatch(records: AttendanceRecord[]): void {
    const current = this.getAllAttendance();
    const updated = [...current];

    records.forEach((record) => {
      const idx = updated.findIndex((r) => r.id === record.id);
      if (idx >= 0) {
        updated[idx] = record;
      } else {
        updated.push(record);
      }
    });

    setStored('attendance', updated);
  }

  // Schedules
  getSchedules(classId?: string): ScheduleItem[] {
    const list = getStored<ScheduleItem[]>('schedules', initialSchedules);
    if (!classId || classId === 'all') return list;
    return list.filter((s) => s.classId === classId);
  }

  saveScheduleItem(item: ScheduleItem): void {
    const list = this.getSchedules();
    const idx = list.findIndex((s) => s.id === item.id);
    if (idx >= 0) list[idx] = item;
    else list.push(item);
    setStored('schedules', list);
  }

  deleteScheduleItem(id: string): void {
    const list = this.getSchedules().filter((s) => s.id !== id);
    setStored('schedules', list);
  }

  // Assignments & Submissions
  getAssignments(classId?: string): Assignment[] {
    const list = getStored<Assignment[]>('assignments', initialAssignments);
    if (!classId || classId === 'all') return list;
    return list.filter((a) => a.classId === classId);
  }

  getAssignmentById(id: string): Assignment | undefined {
    return this.getAssignments().find((a) => a.id === id);
  }

  saveAssignment(assignment: Assignment): void {
    const list = this.getAssignments();
    const idx = list.findIndex((a) => a.id === assignment.id);
    if (idx >= 0) list[idx] = assignment;
    else list.push(assignment);
    setStored('assignments', list);
  }

  deleteAssignment(id: string): void {
    const list = this.getAssignments().filter((a) => a.id !== id);
    setStored('assignments', list);
  }

  getSubmissions(assignmentId: string): Submission[] {
    const list = getStored<Submission[]>('submissions', initialSubmissions);
    return list.filter((s) => s.assignmentId === assignmentId);
  }

  saveSubmission(submission: Submission): void {
    const list = getStored<Submission[]>('submissions', initialSubmissions);
    const idx = list.findIndex((s) => s.id === submission.id);
    if (idx >= 0) list[idx] = submission;
    else list.push(submission);
    setStored('submissions', list);

    // Update assignment submission count
    const assignments = this.getAssignments();
    const asg = assignments.find((a) => a.id === submission.assignmentId);
    if (asg) {
      const subs = list.filter((s) => s.assignmentId === submission.assignmentId);
      asg.submissionsCount = subs.filter((s) => s.status !== 'pending').length;
      asg.gradedCount = subs.filter((s) => s.status === 'graded').length;
      setStored('assignments', assignments);
    }
  }

  // Quizzes
  getQuizzes(classId?: string): Quiz[] {
    const list = getStored<Quiz[]>('quizzes', initialQuizzes);
    if (!classId || classId === 'all') return list;
    return list.filter((q) => q.classId === classId);
  }

  getQuizById(id: string): Quiz | undefined {
    return this.getQuizzes().find((q) => q.id === id);
  }

  saveQuiz(quiz: Quiz): void {
    const list = this.getQuizzes();
    const idx = list.findIndex((q) => q.id === quiz.id);
    if (idx >= 0) list[idx] = quiz;
    else list.push(quiz);
    setStored('quizzes', list);
  }

  deleteQuiz(id: string): void {
    const list = this.getQuizzes().filter((q) => q.id !== id);
    setStored('quizzes', list);
  }

  // Resources
  getResources(): ResourceDocument[] {
    return getStored<ResourceDocument[]>('resources', initialResources);
  }

  saveResource(resource: ResourceDocument): void {
    const list = this.getResources();
    const idx = list.findIndex((r) => r.id === resource.id);
    if (idx >= 0) list[idx] = resource;
    else list.push(resource);
    setStored('resources', list);
  }

  deleteResource(id: string): void {
    const list = this.getResources().filter((r) => r.id !== id);
    setStored('resources', list);
  }

  toggleFavoriteResource(id: string): void {
    const list = this.getResources();
    const target = list.find((r) => r.id === id);
    if (target) {
      target.isFavorite = !target.isFavorite;
      setStored('resources', list);
    }
  }

  // Grades
  getGrades(classId?: string, studentId?: string): GradeItem[] {
    let list = getStored<GradeItem[]>('grades', initialGradeItems);
    if (classId && classId !== 'all') list = list.filter((g) => g.classId === classId);
    if (studentId) list = list.filter((g) => g.studentId === studentId);
    return list;
  }

  saveGrade(grade: GradeItem): void {
    const list = getStored<GradeItem[]>('grades', initialGradeItems);
    const idx = list.findIndex((g) => g.id === grade.id);
    if (idx >= 0) list[idx] = grade;
    else list.push(grade);
    setStored('grades', list);

    // Update student GPA
    this.recalculateStudentGPA(grade.studentId);
  }

  deleteGrade(id: string): void {
    const list = getStored<GradeItem[]>('grades', initialGradeItems);
    const item = list.find((g) => g.id === id);
    const filtered = list.filter((g) => g.id !== id);
    setStored('grades', filtered);
    if (item) this.recalculateStudentGPA(item.studentId);
  }

  private recalculateStudentGPA(studentId: string): void {
    const grades = this.getGrades(undefined, studentId);
    if (grades.length === 0) return;
    const totalWeightedScore = grades.reduce((acc, g) => acc + g.score * g.weight, 0);
    const totalWeights = grades.reduce((acc, g) => acc + g.weight, 0);
    const gpa = totalWeights > 0 ? Number((totalWeightedScore / totalWeights).toFixed(1)) : 8.0;

    const student = this.getStudentById(studentId);
    if (student) {
      student.gpa = gpa;
      this.saveStudent(student);
    }
  }

  // Behavior
  getBehaviors(studentId?: string, classId?: string): BehaviorRecord[] {
    let list = getStored<BehaviorRecord[]>('behaviors', initialBehaviorRecords);
    if (studentId) list = list.filter((b) => b.studentId === studentId);
    if (classId && classId !== 'all') list = list.filter((b) => b.classId === classId);
    return list;
  }

  saveBehavior(record: BehaviorRecord): void {
    const list = getStored<BehaviorRecord[]>('behaviors', initialBehaviorRecords);
    list.unshift(record);
    setStored('behaviors', list);

    // Update student behavior points
    const student = this.getStudentById(record.studentId);
    if (student) {
      student.behaviorScore = Math.max(0, Math.min(100, student.behaviorScore + record.points));
      student.rewardPoints = Math.max(0, student.rewardPoints + record.points);
      this.saveStudent(student);
    }
  }

  // Rewards & Badges
  getRewardBadges(studentId?: string): RewardBadge[] {
    const list = getStored<RewardBadge[]>('reward_badges', initialRewardBadges);
    if (studentId) return list.filter((b) => b.studentId === studentId);
    return list;
  }

  awardBadge(badge: RewardBadge): void {
    const list = getStored<RewardBadge[]>('reward_badges', initialRewardBadges);
    list.unshift(badge);
    setStored('reward_badges', list);
  }

  // Alerts
  getSmartAlerts(classId?: string): SmartAlert[] {
    const list = getStored<SmartAlert[]>('smart_alerts', initialSmartAlerts);
    if (classId && classId !== 'all') return list.filter((a) => a.classId === classId);
    return list;
  }

  updateAlertStatus(id: string, status: SmartAlert['status'], resolvedNote?: string): void {
    const list = getStored<SmartAlert[]>('smart_alerts', initialSmartAlerts);
    const target = list.find((a) => a.id === id);
    if (target) {
      target.status = status;
      if (status === 'resolved') {
        target.resolvedAt = new Date().toISOString();
        if (resolvedNote) target.resolvedNote = resolvedNote;
      }
      setStored('smart_alerts', list);
    }
  }

  // Announcements
  getAnnouncements(): Announcement[] {
    return getStored<Announcement[]>('announcements', initialAnnouncements);
  }

  saveAnnouncement(announcement: Announcement): void {
    const list = this.getAnnouncements();
    const idx = list.findIndex((a) => a.id === announcement.id);
    if (idx >= 0) list[idx] = announcement;
    else list.unshift(announcement);
    setStored('announcements', list);
  }

  markAnnouncementRead(id: string, userId: string): void {
    const list = this.getAnnouncements();
    const target = list.find((a) => a.id === id);
    if (target && !target.readBy.includes(userId)) {
      target.readBy.push(userId);
      setStored('announcements', list);
    }
  }

  // Parent Messages
  getParentMessages(): ParentMessage[] {
    return getStored<ParentMessage[]>('parent_messages', initialParentMessages);
  }

  sendParentMessage(msg: ParentMessage): void {
    const list = this.getParentMessages();
    list.push(msg);
    setStored('parent_messages', list);
  }

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return getStored<AuditLog[]>('audit_logs', initialAuditLogs);
  }

  addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp' | 'ip'>): void {
    const list = this.getAuditLogs();
    const log: AuditLog = {
      ...entry,
      id: 'aud_' + Date.now(),
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1',
    };
    list.unshift(log);
    setStored('audit_logs', list.slice(0, 100)); // Keep latest 100
  }

  // System Config
  getSystemConfig(): SystemConfig {
    return getStored<SystemConfig>('system_config', initialSystemConfig);
  }

  updateSystemConfig(config: Partial<SystemConfig>): void {
    const current = this.getSystemConfig();
    const updated = { ...current, ...config };
    setStored('system_config', updated);
  }

  // Reset to sample data
  resetDatabase(): void {
    localStorage.clear();
    setStored('users', initialUsers);
    setStored('schools', initialSchools);
    setStored('academic_years', initialAcademicYears);
    setStored('grade_levels', initialGradeLevels);
    setStored('subjects', initialSubjects);
    setStored('classes', initialClasses);
    setStored('students', initialStudents);
    setStored('attendance', initialAttendanceRecords);
    setStored('schedules', initialSchedules);
    setStored('assignments', initialAssignments);
    setStored('submissions', initialSubmissions);
    setStored('quizzes', initialQuizzes);
    setStored('resources', initialResources);
    setStored('grades', initialGradeItems);
    setStored('behaviors', initialBehaviorRecords);
    setStored('reward_badges', initialRewardBadges);
    setStored('smart_alerts', initialSmartAlerts);
    setStored('announcements', initialAnnouncements);
    setStored('parent_messages', initialParentMessages);
    setStored('audit_logs', initialAuditLogs);
    setStored('system_config', initialSystemConfig);
  }
}

export const storage = new StorageService();
