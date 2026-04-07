import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../config/api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  loading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      if (!action.payload) return { ...state, loading: false, user: null, error: null };
      return {
        ...state,
        loading: false,
        user: {
          ...action.payload,
          purchasedProjects: action.payload.purchasedProjects || [],
          completedModules: action.payload.completedModules || [],
          lastVisitedModules: action.payload.lastVisitedModules || {}
        },
        error: null
      };
    case 'AUTH_FAILURE':
      return { ...state, loading: false, user: null, error: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'LOGOUT':
      return { ...state, user: null, loading: false, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Caricamento iniziale dell'utente dalla sessione (backend)
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.AUTH.ME, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
          dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (e) {
        dispatch({ type: 'AUTH_FAILURE', payload: "Errore di connessione" });
      }
    };
    fetchMe();
  }, []);

  const login = useCallback(async (email, password) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        if (data.requiresOTP) {
          dispatch({ type: 'AUTH_FAILURE', payload: null }); // Rimuove errori precedenti
          return { success: true, requiresOTP: true, phone: data.phone, otp: data.otp };
        }
        const meRes = await fetch(API_ENDPOINTS.AUTH.ME, { credentials: 'include' });
        const meData = await meRes.json();
        dispatch({ type: 'AUTH_SUCCESS', payload: meData.user });
        return { success: true };
      }
      dispatch({ type: 'AUTH_FAILURE', payload: data.message });
      return { success: false, message: data.message };
    } catch (e) {
      dispatch({ type: 'AUTH_FAILURE', payload: 'Errore di connessione al server' });
      return { success: false, message: 'Errore di connessione al server' };
    }
  }, []);

  const register = useCallback(async (userData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        if (data.requiresOTP) {
          dispatch({ type: 'AUTH_FAILURE', payload: null });
          return { success: true, requiresOTP: true, phone: data.phone, otp: data.otp };
        }
        dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
        return { success: true };
      }
      dispatch({ type: 'AUTH_FAILURE', payload: data.message });
      return { success: false, message: data.message };
    } catch (e) {
      dispatch({ type: 'AUTH_FAILURE', payload: 'Errore di connessione al server' });
      return { success: false, message: 'Errore di connessione al server' };
    }
  }, []);

  const verifyOTP = useCallback(async (phone, otp, type) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.VERIFY_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, type }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
        return { success: true };
      }
      dispatch({ type: 'AUTH_FAILURE', payload: data.message });
      return { success: false, message: data.message };
    } catch (e) {
      dispatch({ type: 'AUTH_FAILURE', payload: 'Errore durante la verifica' });
      return { success: false, message: 'Errore durante la verifica' };
    }
  }, []);

  const resendOTP = useCallback(async (phone) => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.RESEND_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
        credentials: 'include'
      });
      return await response.json();
    } catch (e) {
      return { success: false, message: 'Errore connessione' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST', credentials: 'include' });
      dispatch({ type: 'LOGOUT' });
    } catch (e) {
      console.error("Errore logout:", e);
    }
  }, []);

  const hasAccessToProject = useCallback((projectId) => {
    // Se non c'è l'utente loggato, non ha accesso ai progetti privati (l'acquisto è salvato su utente)
    // Se l'utente è loggato, verifichiamo se l'ha acquistato
    if (!state.user) return false;
    return state.user.purchasedProjects?.includes(projectId);
  }, [state.user]);

  const buyProject = useCallback(async (projectId) => {
    if (!state.user) return { success: false, message: 'Devi essere loggato' };
    try {
      const response = await fetch(API_ENDPOINTS.USER.PURCHASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: projectId }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        dispatch({
          type: 'UPDATE_USER',
          payload: { purchasedProjects: [...(state.user.purchasedProjects || []), projectId] }
        });
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'Errore durante l\'acquisto' };
    }
  }, [state.user]);

  const updateProfile = useCallback(async (updatedData) => {
    if (!state.user) return { success: false, message: 'Devi essere loggato' };
    try {
      const response = await fetch(API_ENDPOINTS.USER.PROFILE, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: updatedData.name }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        dispatch({ type: 'UPDATE_USER', payload: data.user });
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'Errore durante l\'aggiornamento' };
    }
  }, [state.user]);

  const changePassword = useCallback(async (oldPassword, newPassword) => {
    if (!state.user) return { success: false, message: 'Devi essere loggato' };
    try {
      const response = await fetch(API_ENDPOINTS.USER.CHANGE_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
        credentials: 'include'
      });
      return await response.json();
    } catch (e) {
      return { success: false, message: 'Errore durante il cambio password' };
    }
  }, [state.user]);

  const uploadAvatar = useCallback(async (file) => {
    if (!state.user) return { success: false, message: 'Devi essere loggato' };
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await fetch(API_ENDPOINTS.USER.UPLOAD_AVATAR, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        dispatch({ type: 'UPDATE_USER', payload: data.user });
        return { success: true, avatarUrl: data.avatarUrl };
      }
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'Errore durante il caricamento dell\'avatar' };
    }
  }, [state.user]);

  const completeModule = useCallback(async (moduleId) => {
    if (!state.user) return;
    try {
      const response = await fetch(API_ENDPOINTS.USER.COMPLETE_MODULE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleKey: moduleId }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        if (!state.user.completedModules?.includes(moduleId)) {
          dispatch({
            type: 'UPDATE_USER',
            payload: { completedModules: [...(state.user.completedModules || []), moduleId] }
          });
        }
      }
    } catch (e) {
      console.error("Errore completeModule:", e);
    }
  }, [state.user]);

  const updateLastVisitedModule = useCallback(async (courseId, moduleId) => {
    if (!state.user) return;
    try {
      const response = await fetch(API_ENDPOINTS.USER.CURRENT_MODULE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, lastModuleId: moduleId }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        dispatch({
          type: 'UPDATE_USER',
          payload: {
            lastVisitedModules: {
              ...(state.user.lastVisitedModules || {}),
              [courseId]: moduleId
            }
          }
        });
      }
    } catch (e) {
      console.error("Errore updateLastVisitedModule:", e);
    }
  }, [state.user]);

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      verifyOTP,
      resendOTP,
      hasAccessToProject,
      buyProject,
      updateProfile,
      changePassword,
      uploadAvatar,
      completeModule,
      updateLastVisitedModule
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
