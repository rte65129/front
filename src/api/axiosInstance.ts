import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🔥 ВАЖНО: Проверяем, что это не запрос на refresh и не повторяющийся запрос
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 👇 ПРОВЕРКА: есть ли refresh token
        const cookies = document.cookie;
        if (!cookies.includes('long-lived-token')) {
          throw new Error('No refresh token');
        }

        await axios.post(
          'http://localhost:3000/api/auth/refresh', 
          {}, 
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
        
        processQueue();
        return axiosInstance(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError);
        
        // 🔥 ВАЖНО: Очищаем всё и редиректим на логин
        localStorage.removeItem('user');
        document.cookie = 'short-lived-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        document.cookie = 'long-lived-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        
        // Используем window.location для полного редиректа
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;