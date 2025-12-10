import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useContext(AuthContext);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate email format
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address (e.g., example@domain.com)');
      setLoading(false);
      return;
    }

    try {
      const result = await login(formData);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-8 bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl border border-slate-700 w-full max-w-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-white">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 font-medium text-slate-200">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-3 bg-slate-700 border border-slate-600 rounded text-base text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium text-slate-200">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-3 bg-slate-700 border border-slate-600 rounded text-base text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {error && (
            <div className="bg-red-900/50 text-red-200 px-3 py-3 rounded mb-4 border border-red-700">
              {error}
            </div>
          )}
          <button 
            type="submit" 
            className="w-full px-3 py-3 bg-blue-600 text-white rounded text-base cursor-pointer mt-4 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60 transition-colors" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center mt-4 text-slate-300">
          Don't have an account? <Link to="/register" className="text-blue-400 no-underline hover:text-blue-300 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

