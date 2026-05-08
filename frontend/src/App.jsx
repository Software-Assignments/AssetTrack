// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Import all pages
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

export default function App() {
  return (
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/assets" element={<AssetListPage />} />
            <Route path="/assets/:id" element={<AssetDetailPage />} />
            <Route path="/assets/register" element={<AssetRegistrationPage />} />
            <Route path="/assets/assign" element={<AssignTransferPage />} />
            <Route path="/search" element={<AdvancedSearchPage />} />
            <Route path="/search/results" element={<SearchResultsPage />} />
            <Route path="/condition-report" element={<ConditionReportPage />} />
            <Route path="/condition-reports" element={<ConditionReportsListPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
  );
}