import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { VerifyDocumentsPage } from './pages/VerifyDocumentsPage';
import { EmploymentHRPage } from './pages/EmploymentHRPage';
import { DocumentVerificationPage } from './pages/DocumentVerificationPage';
import { ResumeCareerPage } from './pages/ResumeCareerPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard Shell with Multi-Domain Nested Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/verify" element={<VerifyDocumentsPage />} />
          <Route path="/verify/employment" element={<EmploymentHRPage />} />
          <Route path="/verify/employment/documents" element={<DocumentVerificationPage />} />
          <Route path="/verify/employment/resume" element={<ResumeCareerPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Backwards-compatibility aliases */}
          <Route path="/domain-workflows" element={<Navigate to="/verify" replace />} />
          <Route path="/document-verification" element={<Navigate to="/verify/employment/documents" replace />} />
          <Route path="/resume-career" element={<Navigate to="/verify/employment/resume" replace />} />
        </Route>

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
