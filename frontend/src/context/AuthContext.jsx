import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 初始化检查
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 尝试通过 Refresh Token 获取新的 Access Token
        const { data } = await api.get('/auth/refresh');
        
        // 设置 Axios 默认头
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        
        // 获取用户信息
        const userResponse = await api.get('/auth/me');
        setUser(userResponse.data);
      } catch (error) {
        // 失败说明没登录 (Cookie 无效或过期)
        setUser(null);
        // 确保清除可能存在的旧 header
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (formData) => {
    try {
      const data = await authService.login(formData);
      
      // 保存 Access Token 到 Axios 默认头
      api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
      
      setUser(data); // data 里包含了 user 信息
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      // 注册通常不需要自动登录，或者取决于你的业务逻辑
      // 这里保持你原本的逻辑，只返回成功
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
    }
  };

  // 这里的 isAuthenticated 动态通过 !!user 计算，不需要 state
  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated: !!user, 
      login, 
      register,
      logout 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};