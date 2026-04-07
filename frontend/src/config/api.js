const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

export const API_ENDPOINTS = {
  AUTH: {
    ME: `${API_BASE}/auth/me`,
    LOGIN: `${API_BASE}/auth/login`,
    REGISTER: `${API_BASE}/auth/register`,
    LOGOUT: `${API_BASE}/auth/logout`,
    VERIFY_OTP: `${API_BASE}/auth/verify-otp`,
    RESEND_OTP: `${API_BASE}/auth/resend-otp`,
  },
  USER: {
    PURCHASE: `${API_BASE}/user/purchase`,
    PROFILE: `${API_BASE}/user/profile`,
    CHANGE_PASSWORD: `${API_BASE}/user/change-password`,
    UPLOAD_AVATAR: `${API_BASE}/user/upload-avatar`,
    COMPLETE_MODULE: `${API_BASE}/user/complete-module`,
    CURRENT_MODULE: `${API_BASE}/user/current-module`,
  },
  COURSES: {
    LIST: `${API_BASE}/courses`
  },
  MODULES: (courseId, id) => `${API_BASE}/modules/${courseId}/${id}`,
  MODULES_DATA: (courseId, id) => `${API_BASE}/modules/${courseId}/${id}/data`,
};

export default API_BASE;
