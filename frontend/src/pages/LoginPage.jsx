import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const token = await userCredential.user.getIdToken();
      localStorage.setItem('token', token);

      navigate('/');
    } catch (error) {
      setMessage(error.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="flex rounded-2xl shadow-2xl max-w-4xl w-full bg-white dark:bg-gray-800 overflow-hidden">

        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h1 className="text-3xl font-extrabold mb-2">Welcome Back!</h1>
          <p className="text-gray-500 mb-8">Log in to continue to SkinWise.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border rounded-lg"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {message && <p className="mt-4 text-red-600 text-center">{message}</p>}

          <div className="mt-8 text-center">
            Don’t have an account?
            <Link to="/register" className="text-indigo-600 font-semibold ml-1">
              Register
            </Link>
          </div>
        </div>

        <div className="hidden md:block w-1/2 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560185127-6ed189bf02a4')" }}>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
