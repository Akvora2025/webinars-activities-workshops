import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import Home from './pages/Home';
import Webinars from './pages/Webinars';
import Workshops from './pages/Workshops';
import Internships from './pages/Internships';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminEventDetail from './pages/AdminEventDetail';
import AdminVideos from './pages/AdminVideos';
import AdminAnnouncements from './pages/AdminAnnouncements';
import AdminCertificates from './pages/AdminCertificates';
import AdminCertificateIssue from './pages/AdminCertificateIssue';
import AdminCertificateManage from './pages/AdminCertificateManage';
import UserCertificates from './pages/UserCertificates';
import Layout from './components/Layout';
import Placeholder from './pages/Placeholder';
import ReportIssue from './pages/ReportIssue';
import Dashboard from './pages/Dashboard';
import Videos from './pages/Videos';


function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Clerk's multi-step flows need wildcard routes */}
        <Route path="/sign-in/*" element={<SignIn />} />
        <Route path="/sign-up/*" element={<SignUp />} />

        {/* Admin login route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin dashboard routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/events/:id" element={<AdminEventDetail />} />
        <Route path="/admin/videos" element={<AdminVideos />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />

        {/* Admin Certificates Nested Routes */}
        <Route path="/admin/certificates" element={<AdminCertificates />}>
          <Route index element={<Navigate to="issue" replace />} />
          <Route path="issue" element={<AdminCertificateIssue />} />
          <Route path="manage" element={<AdminCertificateManage />} />
        </Route>
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="/webinars"
          element={
            <ProtectedRoute>
              <Layout><Webinars /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/workshops"
          element={
            <ProtectedRoute>
              <Layout><Workshops /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/internships"
          element={
            <ProtectedRoute>
              <Layout><Internships /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/certificates"
          element={
            <ProtectedRoute>
              <Layout><UserCertificates /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/videos"
          element={
            <ProtectedRoute>
              <Layout><Videos /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/report-issue"
          element={
            <ProtectedRoute>
              <Layout><ReportIssue /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <Layout><Placeholder title="Ask Support" /></Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;



