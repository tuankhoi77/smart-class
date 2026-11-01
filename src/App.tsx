import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ClassProvider } from './contexts/ClassContext';
import { AppLayout } from './layouts/AppLayout';
import { RoleGuard } from './components/common/RoleGuard';

// Public & Error Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ForbiddenPage } from './pages/errors/ForbiddenPage';
import { NotFoundPage } from './pages/errors/NotFoundPage';

// Teacher Pages
import { TeacherDashboardPage } from './pages/teacher/DashboardPage';
import { ClassesPage } from './pages/teacher/ClassesPage';
import { ClassDetailPage } from './pages/teacher/ClassDetailPage';
import { StudentsPage } from './pages/teacher/StudentsPage';
import { ImportStudentsPage } from './pages/teacher/ImportStudentsPage';
import { StudentProfile360Page } from './pages/teacher/StudentProfile360Page';
import { AttendancePage } from './pages/teacher/AttendancePage';
import { AttendanceHistoryPage } from './pages/teacher/AttendanceHistoryPage';
import { SchedulePage } from './pages/teacher/SchedulePage';
import { AssignmentsPage } from './pages/teacher/AssignmentsPage';
import { QuizzesPage } from './pages/teacher/QuizzesPage';
import { QuestionBankPage } from './pages/teacher/QuestionBankPage';
import { ResourcesPage } from './pages/teacher/ResourcesPage';
import { AIAssistantPage } from './pages/teacher/AIAssistantPage';
import { GradesPage } from './pages/teacher/GradesPage';
import { BehaviorPage } from './pages/teacher/BehaviorPage';
import { AlertsPage } from './pages/teacher/AlertsPage';
import { ClassroomToolsPage } from './pages/teacher/ClassroomToolsPage';
import { AnnouncementsPage } from './pages/teacher/AnnouncementsPage';
import { ReportsPage } from './pages/teacher/ReportsPage';
import { TeacherProfilePage } from './pages/teacher/ProfilePage';

// Student Pages
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { StudentAssignmentsPage } from './pages/student/StudentAssignmentsPage';
import { StudentQuizzesPage } from './pages/student/StudentQuizzesPage';
import { StudentGradesPage } from './pages/student/StudentGradesPage';
import { StudentAchievementsPage } from './pages/student/StudentAchievementsPage';

// Parent Pages
import { ParentDashboardPage } from './pages/parent/ParentDashboardPage';
import { ParentMessagesPage } from './pages/parent/ParentMessagesPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminSchoolsPage } from './pages/admin/AdminSchoolsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Root redirect based on role
const RootRedirect: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={`/${role}/dashboard`} replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ClassProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/403" element={<ForbiddenPage />} />

            {/* Authenticated Layout Routes */}
            <Route element={<AppLayout />}>
              {/* Teacher Routes (Protected) */}
              <Route
                path="/teacher/dashboard"
                element={
                  <RoleGuard allowedRoles={['teacher', 'admin']}>
                    <TeacherDashboardPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/classes"
                element={
                  <RoleGuard allowedRoles={['teacher', 'admin']}>
                    <ClassesPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/classes/:id"
                element={
                  <RoleGuard allowedRoles={['teacher', 'admin']}>
                    <ClassDetailPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/students"
                element={
                  <RoleGuard allowedRoles={['teacher', 'admin']}>
                    <StudentsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/students/import"
                element={
                  <RoleGuard allowedRoles={['teacher', 'admin']}>
                    <ImportStudentsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/students/:id"
                element={
                  <RoleGuard allowedRoles={['teacher', 'admin']}>
                    <StudentProfile360Page />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/attendance"
                element={
                  <RoleGuard allowedRoles={['teacher', 'admin']}>
                    <AttendancePage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/attendance/history"
                element={
                  <RoleGuard allowedRoles={['teacher', 'admin']}>
                    <AttendanceHistoryPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/schedule"
                element={
                  <RoleGuard allowedRoles={['teacher', 'admin']}>
                    <SchedulePage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/assignments"
                element={
                  <RoleGuard allowedRoles={['teacher', 'admin']}>
                    <AssignmentsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/quizzes"
                element={
                  <RoleGuard allowedRoles={['teacher', 'admin']}>
                    <QuizzesPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/grading"
                element={
                  <RoleGuard allowedRoles={['teacher', 'admin']}>
                    <QuizzesPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/question-bank"
                element={
                  <RoleGuard allowedRoles={['teacher', 'admin']}>
                    <QuestionBankPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/resources"
                element={
                  <RoleGuard allowedRoles={['teacher', 'admin']}>
                    <ResourcesPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/ai"
                element={
                  <RoleGuard allowedRoles={['teacher', 'admin']}>
                    <AIAssistantPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/grades"
                element={
                  <RoleGuard allowedRoles={['teacher', 'admin']}>
                    <GradesPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/behavior"
                element={
                  <RoleGuard allowedRoles={['teacher', 'admin']}>
                    <BehaviorPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/alerts"
                element={
                  <RoleGuard allowedRoles={['teacher', 'admin']}>
                    <AlertsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/tools"
                element={
                  <RoleGuard allowedRoles={['teacher', 'admin']}>
                    <ClassroomToolsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/tools/*"
                element={
                  <RoleGuard allowedRoles={['teacher', 'admin']}>
                    <ClassroomToolsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/announcements"
                element={
                  <RoleGuard allowedRoles={['teacher', 'admin']}>
                    <AnnouncementsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/reports"
                element={
                  <RoleGuard allowedRoles={['teacher', 'admin']}>
                    <ReportsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/profile"
                element={
                  <RoleGuard allowedRoles={['teacher', 'admin']}>
                    <TeacherProfilePage />
                  </RoleGuard>
                }
              />

              {/* Student Routes (Protected) */}
              <Route
                path="/student/dashboard"
                element={
                  <RoleGuard allowedRoles={['student', 'admin']}>
                    <StudentDashboardPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/schedule"
                element={
                  <RoleGuard allowedRoles={['student', 'admin']}>
                    <SchedulePage />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/assignments"
                element={
                  <RoleGuard allowedRoles={['student', 'admin']}>
                    <StudentAssignmentsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/quizzes"
                element={
                  <RoleGuard allowedRoles={['student', 'admin']}>
                    <StudentQuizzesPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/grades"
                element={
                  <RoleGuard allowedRoles={['student', 'admin']}>
                    <StudentGradesPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/achievements"
                element={
                  <RoleGuard allowedRoles={['student', 'admin']}>
                    <StudentAchievementsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/resources"
                element={
                  <RoleGuard allowedRoles={['student', 'admin']}>
                    <ResourcesPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/announcements"
                element={
                  <RoleGuard allowedRoles={['student', 'admin']}>
                    <AnnouncementsPage />
                  </RoleGuard>
                }
              />

              {/* Parent Routes (Protected) */}
              <Route
                path="/parent/dashboard"
                element={
                  <RoleGuard allowedRoles={['parent', 'admin']}>
                    <ParentDashboardPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/parent/attendance"
                element={
                  <RoleGuard allowedRoles={['parent', 'admin']}>
                    <AttendanceHistoryPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/parent/grades"
                element={
                  <RoleGuard allowedRoles={['parent', 'admin']}>
                    <StudentGradesPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/parent/assignments"
                element={
                  <RoleGuard allowedRoles={['parent', 'admin']}>
                    <StudentAssignmentsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/parent/behavior"
                element={
                  <RoleGuard allowedRoles={['parent', 'admin']}>
                    <StudentAchievementsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/parent/messages"
                element={
                  <RoleGuard allowedRoles={['parent', 'admin']}>
                    <ParentMessagesPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/parent/announcements"
                element={
                  <RoleGuard allowedRoles={['parent', 'admin']}>
                    <AnnouncementsPage />
                  </RoleGuard>
                }
              />

              {/* Admin Routes (Protected) */}
              <Route
                path="/admin/dashboard"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/schools"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminSchoolsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/academic-years"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminSchoolsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/grades-subjects"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminSchoolsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminUsersPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/classes"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <ClassesPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/rbac"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminUsersPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminAuditLogsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminSettingsPage />
                  </RoleGuard>
                }
              />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ClassProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
