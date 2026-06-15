import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import FeaturesPage from './pages/public/FeaturesPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import ConsultationPage from './pages/ConsultationPage';
import AdvicePage from './pages/AdvicePage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import QuizPage from './pages/QuizPage';

// App (Dashboard) Pages
import DashboardPage from './pages/app/DashboardPage';
import AnalyzePage from './pages/app/AnalyzePage';
import AnalysisResultPage from './pages/app/AnalysisResultPage';
import HistoryPage from './pages/app/HistoryPage';
import ProgressPage from './pages/app/ProgressPage';
import RoutinePage from './pages/app/RoutinePage';
import ProfilePage from './pages/ProfilePage';

// Portals
import AdminDashboard from './pages/admin/AdminDashboard';
import BrandDashboard from './pages/brand/BrandDashboard';

// Guards
import ProtectedRoute from './components/ProtectedRoute'; 
import AdminRoute from './components/AdminRoute';
import BrandRoute from './components/BrandRoute';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-8 text-center">
          <h1 className="text-4xl font-bold text-rose-500 mb-4">Oops, something went wrong.</h1>
          <p className="text-slate-600 dark:text-slate-400">We are sorry for the inconvenience. Please try refreshing the page.</p>
        </div>
      );
    }
    return this.props.children; 
  }
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <ErrorBoundary>
            <ToastContainer position="top-right" autoClose={5000} />
            <Routes>
              
              {/* --- Public App Layout --- */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/advice" element={<AdvicePage />} />
                <Route path="/consultation" element={<ConsultationPage />} />
                <Route path="/quiz" element={<QuizPage />} />
              </Route>

              {/* --- Auth Layout --- */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* --- App Dashboard Layout (Protected) --- */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/analyze" element={<AnalyzePage />} />
                  <Route path="/analysis/:id" element={<AnalysisResultPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/progress" element={<ProgressPage />} />
                  <Route path="/routine" element={<RoutinePage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
              </Route>

              {/* --- Admin Portal --- */}
              <Route path="/admin" element={<AdminRoute><AppLayout /></AdminRoute>}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
              </Route>

              {/* --- Brand Portal --- */}
              <Route path="/brand" element={<BrandRoute><AppLayout /></BrandRoute>}>
                <Route index element={<Navigate to="/brand/dashboard" replace />} />
                <Route path="dashboard" element={<BrandDashboard />} />
              </Route>

            </Routes>
          </ErrorBoundary>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;