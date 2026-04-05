import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_URL = 'http://localhost:5005/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Caricamento iniziale dell'utente dalla sessione (backend)
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include' // Importante per inviare il cookie di sessione
        });
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        }
      } catch (e) {
        console.error("Errore fetchMe:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        // Carichiamo l'utente completo dopo il login
        const meRes = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
        const meData = await meRes.json();
        setUser(meData.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'Errore di connessione al server' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'Errore di connessione al server' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
      setUser(null);
    } catch (e) {
      console.error("Errore logout:", e);
    }
  };

  const hasAccessToProject = (projectId) => {
    // Progetti pubblici: visibili a tutti
    if (projectId === 'k8s-fondamentali' || projectId === 'intro' || projectId.startsWith('0') || projectId === '10') {
        return true;
    }
    
    // Progetti privati: solo se loggato e acquistati
    if (!user) return false;
    return user.purchasedProjects?.includes(projectId);
  };

  const buyProject = async (projectId) => {
    if (!user) return { success: false, message: 'Devi essere loggato' };
    
    try {
      const response = await fetch(`${API_URL}/user/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: projectId }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        const updatedUser = { 
          ...user, 
          purchasedProjects: [...(user.purchasedProjects || []), projectId] 
        };
        setUser(updatedUser);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'Errore durante l\'acquisto' };
    }
  };

  const updateProfile = async (updatedData) => {
    if (!user) return { success: false, message: 'Devi essere loggato' };
    
    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: updatedData.name }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setUser({ ...user, name: updatedData.name });
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'Errore durante l\'aggiornamento' };
    }
  };

  const completeModule = async (moduleId) => {
    if (!user) return;
    
    try {
      const response = await fetch(`${API_URL}/user/complete-module`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleKey: moduleId }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        if (!user.completedModules?.includes(moduleId)) {
            setUser({
              ...user,
              completedModules: [...(user.completedModules || []), moduleId]
            });
        }
      }
    } catch (e) {
      console.error("Errore completeModule:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      loading, 
      hasAccessToProject, 
      buyProject,
      updateProfile,
      completeModule
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
