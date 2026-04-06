const API_BASE = 'http://localhost:5005/api';

export const API_ENDPOINTS = {
  AUTH: {
    ME: `${API_BASE}/auth/me`,
    LOGIN: `${API_BASE}/auth/login`,
    REGISTER: `${API_BASE}/auth/register`,
    LOGOUT: `${API_BASE}/auth/logout`,
  },
  USER: {
    PURCHASE: `${API_BASE}/user/purchase`,
    PROFILE: `${API_BASE}/user/profile`,
    CHANGE_PASSWORD: `${API_BASE}/user/change-password`,
    UPLOAD_AVATAR: `${API_BASE}/user/upload-avatar`,
    COMPLETE_MODULE: `${API_BASE}/user/complete-module`,
    CURRENT_MODULE: `${API_BASE}/user/current-module`,
  },
  MODULES: (id) => `${API_BASE}/modules/${id}`,
  MODULES_DATA: (id) => `${API_BASE}/modules/${id}/data`,
};

export default API_BASE;
