import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw';
import {
  Box,
  CssBaseline,
  ThemeProvider,
  Fade,
} from '@mui/material';
import { QuizOutlined, AssignmentOutlined, Terminal as TerminalIcon } from '@mui/icons-material';

// Config & Hooks
import { AuthProvider } from './context/AuthContext';
import { API_ENDPOINTS } from './config/api';
import { getIcon } from './utils/iconMapper';
import { useResizer } from './hooks/useResizer';
import { useModuleContent } from './hooks/useModuleContent';
import { useScrollSpy } from './hooks/useScrollSpy';
import { useAppUI } from './hooks/useAppUI';
import theme from './theme';

// Layout & UI Components
import Layout from './components/layout/Layout';
import KubeContainer from './components/ui/KubeContainer';
import KubePaper from './components/ui/KubePaper';
import KubeTypography from './components/ui/KubeTypography';
import KubeLoader from './components/ui/KubeLoader';
import KubeSection from './components/ui/KubeSection';

// Feature Components
import ErrorBoundary from './components/ui/ErrorBoundary';
import HomeView from './components/course/HomeView';
import Dashboard from './components/user/Dashboard';
import Profile from './components/user/Profile';
import ModuleViewer from './components/learning/ModuleViewer';
import TerminalConsole from './components/learning/TerminalConsole';
import AuthModal from './components/auth/AuthModal';
import PurchaseModal from './components/course/PurchaseModal';
import { useAuth } from './context/AuthContext';

const DEFAULT_DRAWER_WIDTH = 280;

function AppContent() {
  const { user, hasAccessToProject, buyProject, completeModule, updateLastVisitedModule } = useAuth();
  const { width: drawerWidth, isResizing, startResizing } = useResizer(DEFAULT_DRAWER_WIDTH);
  const [courses, setCourses] = useState([]);
  const {
    drawerOpen, mobileOpen, activeCourse, activeModule, isConsoleOpen,
    authModalOpen, purchaseModalOpen, courseToPurchase, view,
    actions
  } = useAppUI();

  // Caricamento corsi dal backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.COURSES.LIST);
        if (!res.ok) throw new Error('Errore caricamento corsi');
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error('Data caricata non è un array:', data);
          return;
        }

        const mapped = data.map(c => ({
          ...c,
          icon: getIcon(c.icon),
          modules: (c.modules || []).map(m => ({
            ...m,
            icon: getIcon(m.icon)
          }))
        }));
        setCourses(mapped);
      } catch (err) {
        console.error('Errore fetch corsi:', err);
      }
    };
    fetchCourses();
  }, []);

  const isDashboardOpen = view === 'dashboard';
  const isProfileOpen = view === 'profile';

  // Custom Hooks per la gestione dei dati e dello scroll
  const { content, sections, questions, exercises, loading } = useModuleContent(activeCourse, activeModule);
  const { activeSection, setActiveSection } = useScrollSpy(content, questions, exercises);

  useEffect(() => {
    if (activeModule) {
      window.scrollTo(0, 0);
      setActiveSection('');
    }
  }, [activeModule, setActiveSection]);

  const handleDrawerToggle = useCallback(() => {
    actions.toggleDrawer();
  }, [actions]);

  const handleCourseSelect = useCallback((course) => {
    if (course && course.isPrivate && !hasAccessToProject(course.id)) {
      actions.openPurchase(course);
      return;
    }

    actions.selectCourse(course);

    if (course && course.modules && course.modules.length > 0) {
      // Priorità: il primo modulo NON completato nel corso
      const firstUncompletedModule = course.modules.find(m =>
        !user?.completedModules?.includes(`${course.id}-${m.id}`) &&
        !user?.completedModules?.includes(m.id)
      );

      // Se non ci sono moduli incompleti, prendiamo l'ultimo visitato o il primo
      const backendLastModuleId = user?.lastVisitedModules?.[course.id];
      const localLastModuleId = localStorage.getItem(`last-mod-${course.id}`);
      const lastModuleId = backendLastModuleId || localLastModuleId;
      const lastModule = course.modules.find(m => m.id === lastModuleId);

      const targetModule = firstUncompletedModule || lastModule || course.modules[0];
      actions.selectModule(targetModule);

      // Sincronizza con il backend se necessario
      if (user && !backendLastModuleId) {
        updateLastVisitedModule(course.id, targetModule.id);
      }
    } else {
      actions.selectModule(null);
    }
  }, [hasAccessToProject, user, actions, updateLastVisitedModule]);

  const handleConfirmPurchase = useCallback(async () => {
    if (courseToPurchase) {
      const result = await buyProject(courseToPurchase.id);
      if (result.success) {
        actions.closePurchase();
        handleCourseSelect(courseToPurchase);
      }
    }
  }, [courseToPurchase, buyProject, handleCourseSelect, actions]);

  const handleModuleSelect = useCallback((mod) => {
    actions.selectModule(mod);
    if (activeCourse && mod) {
      localStorage.setItem(`last-mod-${activeCourse.id}`, mod.id);
      if (user) {
        updateLastVisitedModule(activeCourse.id, mod.id);
      }
    }
  }, [activeCourse, user, updateLastVisitedModule, actions]);

  const handleBackToHome = useCallback((viewType) => {
    if (viewType === 'dashboard') {
      actions.openDashboard();
    } else if (viewType === 'profile') {
      actions.openProfile();
    } else {
      actions.openHome();
    }
  }, [actions]);

  const handleProfileOpen = useCallback(() => {
    if (!user) {
      actions.openAuth();
    } else {
      handleBackToHome('profile');
    }
  }, [user, handleBackToHome, actions]);

  const handleModuleFinish = useCallback(() => {
    if (activeCourse && activeModule) {
      completeModule(`${activeCourse.id}-${activeModule.id}`);
    }
  }, [activeCourse, activeModule, completeModule]);

  const handleOpenIntro = useCallback(() => {
    const virtualIntroCourse = {
      id: 'k8s-fondamentali',
      title: 'Informazioni',
      modules: [{
        id: 'intro',
        title: 'Benvenuto',
        icon: getIcon('SchoolIcon')
      }],
      isIntro: true
    };
    handleCourseSelect(virtualIntroCourse);
  }, [handleCourseSelect]);

  const handleSectionSelect = useCallback((anchor) => {
    const element = document.getElementById(anchor);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    actions.setMobileOpen(false);
  }, [actions]);

  const mainContent = useMemo(() => {
    if (!activeCourse) {
      if (isDashboardOpen && user) {
        return <Dashboard onSelectCourse={handleCourseSelect} courses={courses} />;
      }
      if (isProfileOpen && user) {
        return <Profile onDashboard={() => handleBackToHome('dashboard')} />;
      }
      return <HomeView onSelectCourse={handleCourseSelect} courses={courses} />;
    }

    return (
      <ModuleViewer
        activeCourse={activeCourse}
        activeModule={activeModule}
        content={content}
        questions={questions}
        exercises={exercises}
        loading={loading}
        handleModuleFinish={handleModuleFinish}
        handleModuleSelect={handleModuleSelect}
      />
    );
  }, [activeCourse, activeModule, content, exercises, questions, loading, handleCourseSelect, handleModuleSelect, handleModuleFinish, isDashboardOpen, isProfileOpen, user, handleBackToHome, courses]);

  return (
    <>
      <Layout
        drawerOpen={drawerOpen}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        drawerWidth={drawerWidth}
        startResizing={startResizing}
        isResizing={isResizing}
        activeCourse={activeCourse}
        activeModule={activeModule}
        onBackToHome={handleBackToHome}
        onOpenIntro={handleOpenIntro}
        onToggleConsole={actions.toggleConsole}
        isConsoleOpen={isConsoleOpen}
        onOpenAuth={actions.openAuth}
        onOpenProfile={handleProfileOpen}
        isDashboardOpen={isDashboardOpen}
        isProfileOpen={isProfileOpen}
        // Sidebar specific props
        courses={courses}
        modules={activeCourse ? activeCourse.modules : []}
        sections={sections}
        activeSection={activeSection}
        questions={questions}
        exercises={exercises}
        handleCourseSelect={handleCourseSelect}
        handleModuleSelect={handleModuleSelect}
        handleSectionSelect={handleSectionSelect}
      >
        {mainContent}
      </Layout>
      {isConsoleOpen && (
        <TerminalConsole
          courses={courses}
          onClose={actions.toggleConsole}
        />
      )}
      <AuthModal open={authModalOpen} onClose={actions.closeAuth} />
      <PurchaseModal
        open={purchaseModalOpen}
        onClose={actions.closePurchase}
        course={courseToPurchase}
        onPurchase={handleConfirmPurchase}
        onOpenAuth={actions.openAuth}
      />
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <CssBaseline />
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
