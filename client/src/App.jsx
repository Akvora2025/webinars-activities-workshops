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
import Layout from './components/Layout';
import Placeholder from './pages/Placeholder';
import ReportIssue from './pages/ReportIssue';

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

        {/* Admin dashboard route */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/events/:id" element={<AdminEventDetail />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout><Home /></Layout>
            </ProtectedRoute>
          }
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
              <Layout><Placeholder title="My Certificates" /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/videos"
          element={
            <ProtectedRoute>
              <Layout><Placeholder title="Video Library" /></Layout>
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



