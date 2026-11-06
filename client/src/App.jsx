import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import api from './services/api';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider }        from './context/ThemeContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import InstructorLayout from './layouts/InstructorLayout';
import StudentLayout from './layouts/StudentLayout';

// Route guards
import ProtectedRoute from './components/common/ProtectedRoute';

// Inactivity logout
import useInactivityLogout from './hooks/useInactivityLogout';
import InactivityWarning   from './components/common/InactivityWarning';

// Public pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Courses from './pages/public/Courses';
import Training from './pages/public/Training';
import Projects from './pages/public/Projects';
import Blog from './pages/public/Blog';
import Events from './pages/public/Events';
import Gallery from './pages/public/Gallery';
import Contact from './pages/public/Contact';
import Register from './pages/public/Register';
import Login from './pages/public/Login';
import NotFound       from './pages/public/NotFound';
import CourseDetail   from './pages/public/CourseDetail';
import BlogPost       from './pages/public/BlogPost';
import VerifyCertificate from './pages/public/VerifyCertificate';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword  from './pages/public/ResetPassword';
import Search         from './pages/public/Search';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminInstructors from './pages/admin/Instructors';
import AdminCourses from './pages/admin/Courses';
import AdminApplications from './pages/admin/Applications';
import AdminAdmissions from './pages/admin/Admissions';
import AdminEnrollments from './pages/admin/Enrollments';
import AdminMaterials from './pages/admin/Materials';
import AdminAssignments from './pages/admin/Assignments';
import AdminPayments from './pages/admin/Payments';
import AdminReceipts from './pages/admin/Receipts';
import AdminCertificates from './pages/admin/Certificates';
import AdminProjects from './pages/admin/Projects';
import AdminBlog from './pages/admin/Blog';
import AdminEvents from './pages/admin/Events';
import AdminGallery from './pages/admin/Gallery';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminMessages from './pages/admin/Messages';
import AdminSettings from './pages/admin/Settings';
import AdminTeamMembers from './pages/admin/TeamMembers';
import AdminCurriculum from './pages/admin/Curriculum';
import AdminExams from './pages/admin/Exams';
import AdminSubmissions from './pages/admin/Submissions';

// Instructor pages
import InstructorDashboard from './pages/instructor/Dashboard';
import InstructorCourses from './pages/instructor/Courses';
import InstructorLessons from './pages/instructor/Lessons';
import InstructorMaterials from './pages/instructor/Materials';
import InstructorAssignments from './pages/instructor/Assignments';
import InstructorSubmissions from './pages/instructor/Submissions';
import InstructorAnnouncements from './pages/instructor/Announcements';
import InstructorExamGrading from './pages/instructor/ExamGrading';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentCourses from './pages/student/Courses';
import StudentLessons from './pages/student/Lessons';
import StudentMaterials from './pages/student/Materials';
import StudentAssignments from './pages/student/Assignments';
import StudentSubmissions from './pages/student/Submissions';
import StudentProgress from './pages/student/Progress';
import StudentAnnouncements from './pages/student/Announcements';
import StudentAdmission from './pages/student/Admission';
import StudentPayments from './pages/student/Payments';
import StudentReceipts from './pages/student/Receipts';
import StudentProjects from './pages/student/Projects';
import StudentCertificates from './pages/student/Certificates';
import StudentExams from './pages/student/Exams';

// ── Inner component so it can access AuthContext ──────────
function AppContent() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [timeoutMs,   setTimeoutMs]   = useState(30 * 60 * 1000); // default 30 min

  const WARNING_MS = 5 * 60 * 1000; // always warn 5 min before

  // Load session timeout from server settings
  useEffect(() => {
    api.get('/settings')
      .then((res) => {
        const minutes = Number(res.data?.settings?.session_timeout);
        if (minutes && minutes >= 5 && minutes <= 120) {
          setTimeoutMs(minutes * 60 * 1000);
        }
      })
      .catch(() => {}); // silently fallback to default
  }, []);

  const handleLogout = useCallback(() => {
    setShowWarning(false);
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleWarning = useCallback(() => {
    setShowWarning(true);
  }, []);

  const handleStayLoggedIn = useCallback(() => {
    setShowWarning(false);
    // The hook resets its own timers on next user activity
  }, []);

  useInactivityLogout({
    enabled:   isAuthenticated,
    timeoutMs: timeoutMs,
    warningMs: WARNING_MS,
    onLogout:  handleLogout,
    onWarning: handleWarning,
    onActivity: () => {
      if (showWarning) setShowWarning(false);
    },
  });

  return (
    <>
      <Routes>
        {/* ─── Public Routes ─── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/training" element={<Training />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/events" element={<Events />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/forgot-password"         element={<ForgotPassword />} />
          <Route path="/reset-password/:token"   element={<ResetPassword />} />
          <Route path="/courses/:id"             element={<CourseDetail />} />
          <Route path="/blog/:slug"              element={<BlogPost />} />
          <Route path="/verify"                  element={<VerifyCertificate />} />
          <Route path="/verify/:certId"          element={<VerifyCertificate />} />
          <Route path="/search"                  element={<Search />} />
        </Route>

        {/* ─── Admin Routes ─── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="instructors" element={<AdminInstructors />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="admissions" element={<AdminAdmissions />} />
          <Route path="enrollments" element={<AdminEnrollments />} />
          <Route path="materials" element={<AdminMaterials />} />
          <Route path="assignments" element={<AdminAssignments />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="receipts" element={<AdminReceipts />} />
          <Route path="certificates" element={<AdminCertificates />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="messages"      element={<AdminMessages />} />
          <Route path="settings"      element={<AdminSettings />} />
          <Route path="team"          element={<AdminTeamMembers />} />
          <Route path="curriculum"    element={<AdminCurriculum />} />
          <Route path="exams"         element={<AdminExams />} />
          <Route path="submissions"   element={<AdminSubmissions />} />
        </Route>

        {/* ─── Instructor Routes ─── */}
        <Route
          path="/instructor"
          element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <InstructorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<InstructorDashboard />} />
          <Route path="courses" element={<InstructorCourses />} />
          <Route path="lessons" element={<InstructorLessons />} />
          <Route path="materials" element={<InstructorMaterials />} />
          <Route path="assignments" element={<InstructorAssignments />} />
          <Route path="submissions" element={<InstructorSubmissions />} />
          <Route path="announcements" element={<InstructorAnnouncements />} />
          <Route path="exams" element={<InstructorExamGrading />} />
        </Route>

        {/* ─── Student Routes ─── */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="lessons" element={<StudentLessons />} />
          <Route path="materials" element={<StudentMaterials />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="submissions" element={<StudentSubmissions />} />
          <Route path="progress" element={<StudentProgress />} />
          <Route path="announcements" element={<StudentAnnouncements />} />
          <Route path="admission" element={<StudentAdmission />} />
          <Route path="payments" element={<StudentPayments />} />
          <Route path="receipts" element={<StudentReceipts />} />
          <Route path="projects" element={<StudentProjects />} />
          <Route path="certificates" element={<StudentCertificates />} />
          <Route path="exams" element={<StudentExams />} />
        </Route>

        {/* ─── 404 ─── */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Inactivity warning modal */}
      <InactivityWarning
        isOpen={showWarning}
        onStayLoggedIn={handleStayLoggedIn}
        onLogoutNow={handleLogout}
        secondsLeft={WARNING_MS / 1000}
      />    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
