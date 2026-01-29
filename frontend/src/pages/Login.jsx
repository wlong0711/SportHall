import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(''); //显示重发成功的绿色提示
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false); // 重发按钮的加载状态
  const [showResend, setShowResend] = useState(false); // 控制是否显示重发按钮
  const navigate = useNavigate();
  const { login, isAuthenticated } = useContext(AuthContext);

  // Redirect if already authenticated
  useEffect(() => {
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
    setSuccessMsg(''); // 清除成功消息
    setShowResend(false);// 用户重新输入时，隐藏重发按钮
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    setError('');
    setSuccessMsg('');
    
    try {
      await authService.resendVerification(formData.email);
      setSuccessMsg(`Verification email resent to ${formData.email}. Please check your inbox.`);
      setShowResend(false); // 发送成功后隐藏按钮
    } catch (err) {
      // 获取后端返回的具体错误信息
      const message = err.response?.data?.message || 'Failed to resend email.';
      setError(message);
    } finally {
      setResendLoading(false);
    }
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
        //检测是否需要验证邮箱
        const msg = result.message || 'Login failed.';
        setError(msg);
        if (msg === 'Please verify your email first') {
          setShowResend(true); // 显示重发按钮
        }
      }
    } catch (err) {
      // 这里的 catch 主要是处理网络错误等
      // 如果 AuthContext 里的 login 抛出错误，也要在这里检查
      const errorMsg = err.message || 'An unexpected error occurred.';
      setError(errorMsg);
      if (errorMsg === 'Please verify your email first') {
         setShowResend(true);
      }
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

          <div className="flex justify-end mb-4">
            <Link 
              to="/forgot-password" 
              className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {error && (
            <div className="bg-red-900/50 text-red-200 px-3 py-3 rounded mb-4 border border-red-700">
              {error}
              {/* --- 5. 显示重发按钮 --- */}
              {showResend && (
                <div className="mt-2 pt-2 border-t border-red-800/50">
                  <p className="text-sm text-red-100 mb-2">Didn't receive the email?</p>
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={resendLoading}
                    className="text-sm bg-red-800 hover:bg-red-700 text-white py-1 px-3 rounded transition-colors disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 成功提示区域 */}
          {successMsg && (
            <div className="bg-green-900/50 text-green-200 px-3 py-3 rounded mb-4 border border-green-700">
              {successMsg}
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

