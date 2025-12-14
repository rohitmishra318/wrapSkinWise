import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock } from 'lucide-react';


const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user, data.token);
        navigate('/');
      } else {
        setMessage(data.message || 'Login failed.');
      }
    } catch (error) {
      setMessage('Login failed due to a network error.');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    // The main background is handled by index.css
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="flex rounded-2xl shadow-2xl max-w-4xl w-full bg-white dark:bg-gray-800 overflow-hidden">

        {/* Form Panel */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Welcome Back!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Log in to continue to RentHub.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="email" name="email" placeholder="Email Address" 
                    onChange={handleChange} required 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="password" name="password" placeholder="Password" 
                    onChange={handleChange} required 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="text-right">
                <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Forgot password?</a>
            </div>
            
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">Don't have an account? 
              <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline ml-1">Register here</Link>
            </p>
          </div>
        </div>

        {/* Image Panel */}
        <div className="hidden md:block w-1/2 bg-cover bg-center"
             style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560185127-6ed189bf02a4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')" }}>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
