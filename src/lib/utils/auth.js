import { getRedirectPathByRole } from "@/lib/contants";

export const setAuthData = (data) => {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user_id', data.user_id);
  localStorage.setItem('system_role', data.system_role);
};

export const getAuthData = () => ({
  token: localStorage.getItem('token'),
  userId: localStorage.getItem('user_id'),
  systemRole: localStorage.getItem('system_role')
});

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('system_role');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getRedirectPath = (systemRole) => {
  return getRedirectPathByRole(systemRole);
};
