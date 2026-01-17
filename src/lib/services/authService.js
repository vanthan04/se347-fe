import api from "@/lib/api/api";
import { API_ENDPOINTS } from "@/lib/contants";

export const authService = {
  // Login
  login: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  // Signup Customer
  signupCustomer: async (data) => {
    const payload = {
      ...data,
      role: 'customer'
    };
    const response = await api.post(API_ENDPOINTS.AUTH.SIGNUP_CUSTOMER, payload);
    return response.data;
  },

  // Signup Tasker
  signupTasker: async (data) => {
    const response = await api.post(API_ENDPOINTS.AUTH.SIGNUP_TASKER, data);
    return response.data;
  },

  // Verify Email OTP
  verifyEmail: async (data) => {
    const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data);
    return response.data;
  },

  // Resend OTP
  resendOtp: async (email) => {
    const response = await api.post(API_ENDPOINTS.AUTH.RESEND_OTP, { email });
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (email) => {
    const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  },

  // Verify Reset Password OTP
  verifyResetOtp: async (data) => {
    const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_RESET_OTP, data);
    return response.data;
  },

  // Set New Password
  setPassword: async (data) => {
    const response = await api.post(API_ENDPOINTS.AUTH.SET_PASSWORD, data);
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.clear();
  }
};
