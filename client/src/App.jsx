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
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/webinars"
          element={
            <ProtectedRoute>
              <Webinars />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workshops"
          element={
            <ProtectedRoute>
              <Workshops />
            </ProtectedRoute>
          }
        />
        <Route
          path="/internships"
          element={
            <ProtectedRoute>
              <Internships />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;



