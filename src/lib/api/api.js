import axios from 'axios';
import { CONFIG } from "@/config/config";
import { APP_PATHS } from '@/lib/contants';
import useUserStore from '@/lib/stores/userStore'; 

const api = axios.create({
  baseURL: `${CONFIG.API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Thêm token vào request
api.interceptors.request.use((config) => {
  // Lấy token từ Zustand thay vì localStorage thủ công
  const token = useUserStore.getState().token; 
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Gọi hàm logout từ Zustand để xóa sạch state và storage cùng lúc
      useUserStore.getState().logout(); 
      
      // Chuyển hướng về trang login
      window.location.href = APP_PATHS.AUTH.LOGIN;
    }
    return Promise.reject(error);
  }
);

export default api;