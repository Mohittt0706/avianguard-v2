import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from '@/context/AuthContext';
import { FcmProvider } from '@/context/FcmContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import RegisterPage from './pages/RegisterPage';
import RegistrationSuccessPage from './pages/RegistrationSuccessPage';
import NotificationInboxPage from './pages/NotificationInboxPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <FcmProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/success" element={<RegistrationSuccessPage />} />
            <Route path="/notifications" element={<NotificationInboxPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </FcmProvider>
    </BrowserRouter>
  );
}
