import { useReducer, useCallback, useMemo } from 'react';

const initialState = {
  drawerOpen: true,
  mobileOpen: false,
  activeCourse: null, // null = Home
  activeModule: null,
  isConsoleOpen: false,
  authModalOpen: false,
  view: 'home', // 'home', 'dashboard', 'profile', 'course'
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_DRAWER':
      return { ...state, drawerOpen: !state.drawerOpen, mobileOpen: !state.mobileOpen };
    case 'SET_MOBILE_OPEN':
      return { ...state, mobileOpen: action.payload };
    case 'OPEN_HOME':
      return { ...state, activeCourse: null, activeModule: null, view: 'home', mobileOpen: false };
    case 'OPEN_DASHBOARD':
      return { ...state, activeCourse: null, activeModule: null, view: 'dashboard', mobileOpen: false };
    case 'OPEN_PROFILE':
      return { ...state, activeCourse: null, activeModule: null, view: 'profile', mobileOpen: false };
    case 'SELECT_COURSE':
      return { ...state, activeCourse: action.payload, view: 'course', mobileOpen: false };
    case 'SELECT_MODULE':
      return { ...state, activeModule: action.payload, mobileOpen: false };
    case 'TOGGLE_CONSOLE':
      return { ...state, isConsoleOpen: !state.isConsoleOpen, mobileOpen: false };
    case 'OPEN_AUTH':
      return { ...state, authModalOpen: true, mobileOpen: false };
    case 'CLOSE_AUTH':
      return { ...state, authModalOpen: false };
    default:
      return state;
  }
};

export const useAppUI = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const toggleDrawer = useCallback(() => dispatch({ type: 'TOGGLE_DRAWER' }), []);
  const setMobileOpen = useCallback((open) => dispatch({ type: 'SET_MOBILE_OPEN', payload: open }), []);
  const openHome = useCallback(() => dispatch({ type: 'OPEN_HOME' }), []);
  const openDashboard = useCallback(() => dispatch({ type: 'OPEN_DASHBOARD' }), []);
  const openProfile = useCallback(() => dispatch({ type: 'OPEN_PROFILE' }), []);
  const selectCourse = useCallback((course) => dispatch({ type: 'SELECT_COURSE', payload: course }), []);
  const selectModule = useCallback((mod) => dispatch({ type: 'SELECT_MODULE', payload: mod }), []);
  const toggleConsole = useCallback(() => dispatch({ type: 'TOGGLE_CONSOLE' }), []);
  const openAuth = useCallback(() => dispatch({ type: 'OPEN_AUTH' }), []);
  const closeAuth = useCallback(() => dispatch({ type: 'CLOSE_AUTH' }), []);
  const actions = useMemo(() => ({
    toggleDrawer,
    setMobileOpen,
    openHome,
    openDashboard,
    openProfile,
    selectCourse,
    selectModule,
    toggleConsole,
    openAuth,
    closeAuth
  }), [
    toggleDrawer, setMobileOpen, openHome, openDashboard, openProfile,
    selectCourse, selectModule, toggleConsole, openAuth, closeAuth
  ]);

  return {
    ...state,
    actions
  };
};
