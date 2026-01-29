import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // 页面初始加载检查 Token 时的 loading
  const [isTokenValid, setIsTokenValid] = useState(false); // Token 是否有效

  const { resetToken } = useParams(); // 从 URL 获取 token
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      try {
        await authService.validateResetToken(resetToken);
        setIsTokenValid(true); // Token 有效，显示表单
      } catch (err) {
        setIsTokenValid(false); // Token 无效，显示错误页
        setError('The password reset link is invalid or has expired.');
      } finally {
        setPageLoading(false); // 检查结束
      }
    };
    checkToken();
  }, [resetToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(resetToken, password);
      setMessage('Password reset successful! Redirecting to login...');
      
      // 成功后延迟 2 秒跳转到首页 (因为后端已自动登录)
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Link might be expired.');
      setLoading(false);
    }
  };

// A. 正在检查 Token 中... 显示 Loading
  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900 text-white">
        <p>Verifying link...</p>
      </div>
    );
  }

  // B. Token 无效... 显示错误信息，不显示表单
  if (!isTokenValid) {
    return (
      <div className="flex justify-center items-center min-h-screen p-8 bg-slate-900">
        <div className="bg-slate-800 p-8 rounded-lg shadow-xl border border-red-700 w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Invalid Link</h2>
          <p className="text-slate-300 mb-6">
            {error || 'This password reset link is invalid or has expired.'}
          </p>
          <button 
            onClick={() => navigate('/forgot-password')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-8 bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl border border-slate-700 w-full max-w-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-white">Reset Password</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 font-medium text-slate-200">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              className="w-full px-3 py-3 bg-slate-700 border border-slate-600 rounded text-base text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium text-slate-200">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
              className="w-full px-3 py-3 bg-slate-700 border border-slate-600 rounded text-base text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-900/50 text-red-200 px-3 py-3 rounded mb-4 border border-red-700 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-900/50 text-green-200 px-3 py-3 rounded mb-4 border border-green-700 text-sm">
              {message}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full px-3 py-3 bg-blue-600 text-white rounded text-base cursor-pointer mt-2 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Reseting Password...' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;