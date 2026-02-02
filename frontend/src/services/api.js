import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 允许发送 cookies
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    // 我们不再从 localStorage 拿，而是假设调用者通过某种方式传进来，
    // 或者更简单的做法：我们在 AuthContext 里把 token 设为 axios 的默认 header
    // 这里先保持简单，如果 header 里有 token 就用
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 如果是 401 且不是重试过的请求
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 标记，防止死循环

      try {
        // 调用 refresh 接口 (浏览器会自动带上 Cookie)
        const { data } = await api.get('/auth/refresh');
        
        // 拿到新的 accessToken
        const newAccessToken = data.accessToken;
        
        // 更新 Axios 默认头 (这样后续请求就有了)
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // 这里需要一种方式通知 AuthContext 更新 token...
        // 简单做法：重试原请求
        return api(originalRequest);
      } catch (refreshError) {
        // 刷新失败（Refresh Token 也过期了），强制登出
        // 可以在这里清除状态，跳转登录页
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

