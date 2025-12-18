// The main application file, now with protected routes.

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Analyze from './pages/Analyze.jsx';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/Homepage';
import ConsultationPage from './pages/ConsultationPage.jsx';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage.jsx';
import ProtectedRoute from './components/ProtectedRoute'; 
import QuizPage from './pages/QuizPage.jsx';
import RoutinePage from './pages/Routine.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Profile from './pages/ProfilePage.jsx';
import { ThemeProvider } from './context/ThemeContext'; 
import BlogPage from './pages/BlogPage.jsx';
import AdvicePage from './pages/AdvicePage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminRoute from './components/AdminRoute.jsx';
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8 text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">Oops, something went wrong.</h1>
          <p className="text-gray-600">We are sorry for the inconvenience. Please try refreshing the page.</p>
        </div>
      );
    }
    return this.props.children; 
  }
}


// ---------------------------------------------------------

function App() {
  return (
    <Router>
      <AuthProvider>
           <ThemeProvider>
        <ErrorBoundary>
          <ToastContainer position="top-right" autoClose={5000} />
          
          
          <div className="font-sans antialiased bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-grow">
              <Routes>
                {/* --- Public Routes --- */}
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/analyze" element={<Analyze />} />
                <Route path="/quiz" element={<QuizPage />} />
                <Route path="/routine" element={<RoutinePage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/advice" element={<AdvicePage />} />
                <Route path="/consultation" element={<ConsultationPage />} />
                 
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                     }/>

                {/* --- Protected Routes --- */}
                <Route element={<ProtectedRoute />}>
                  
                  {/* Add any other future protected routes here */}
                </Route>
              </Routes>
            </div>
            <Footer />
          </div>
        </ErrorBoundary>
      </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;