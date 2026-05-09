import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'ADMIN' || user.role === 'MANAGER') return <Navigate to="/dashboard" />;
  return <Navigate to="/assets" />;
}

import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import AssetListPage from './pages/AssetListPage';
import AssetDetailPage from './pages/AssetDetailPage';
import AssetRegistrationPage from './pages/AssetRegistrationPage';
import AssignTransferPage from './pages/AssignTransferPage';
import AdvancedSearchPage from './pages/AdvancedSearchPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ConditionReportPage from './pages/ConditionReportPage';
import ConditionReportsListPage from './pages/ConditionReportsListPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AlertSettingsPage from './pages/AlertSettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NotificationProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              {/* Dashboard (Member 5) */}
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Assets */}
              <Route path="/assets" element={<AssetListPage />} />
              <Route path="/assets/register" element={<AssetRegistrationPage />} />
              <Route path="/assets/assign" element={<AssignTransferPage />} />
              <Route path="/assets/:id" element={<AssetDetailPage />} />

              {/* Search */}
              <Route path="/search" element={<AdvancedSearchPage />} />
              <Route path="/search/results" element={<SearchResultsPage />} />

              {/* Condition Reports */}
              <Route path="/condition-report" element={<ConditionReportPage />} />
              <Route path="/condition-reports" element={<ConditionReportsListPage />} />

              {/* Analytics (Member 5) */}
              <Route path="/analytics" element={<AnalyticsPage />} />

              {/* Alert Settings (Member 5) */}
              <Route path="/alert-settings" element={<AlertSettingsPage />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </NotificationProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
