import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import { DashboardLayout } from './components/layout/DashboardLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';

// Dashboard Pages
import { OverviewPage } from './pages/dashboard/OverviewPage';
import { LinksPage } from './pages/links/LinksPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { BioEditorPage } from './pages/bio/BioEditorPage';
import { SettingsPage } from './pages/settings/SettingsPage';

// Landing Page
import { LandingPage } from './pages/LandingPage';

// Public Bio & 404
import { PublicBioPage } from './pages/bio/PublicBioPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Landing Page in Wispr Flow Aesthetic */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Public Creator Bio Page */}
            <Route path="/bio/:username" element={<PublicBioPage />} />

            {/* Authenticated Dashboard Pages */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<OverviewPage />} />
              <Route path="/links" element={<LinksPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/bio" element={<BioEditorPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
