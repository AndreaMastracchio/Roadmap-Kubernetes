import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import {
  Box,
  CssBaseline,
  ThemeProvider,
  Fade,
} from '@mui/material';
import { QuizOutlined, AssignmentOutlined, Terminal as TerminalIcon } from '@mui/icons-material';

// Config & Hooks
import { AuthProvider } from './context/AuthContext';
import { courses } from './config/courses.jsx';
import { introModule } from './config/modules.jsx';
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
import HomeView from './components/course/HomeView';
import Dashboard from './components/user/Dashboard'; 
import Profile from './components/user/Profile'; // Nuovo
import Quiz from './components/learning/Quiz';
import CodingExercises from './components/learning/CodingExercises';
import NavigationButtons from './components/learning/NavigationButtons';
import TerminalConsole from './components/learning/TerminalConsole';
import AuthModal from './components/auth/AuthModal';
import PurchaseModal from './components/course/PurchaseModal';
import { useAuth } from './context/AuthContext';

const DEFAULT_DRAWER_WIDTH = 280;

function AppContent() {
  const { user, hasAccessToProject, buyProject, completeModule, updateLastVisitedModule } = useAuth();
  const { width: drawerWidth, isResizing, startResizing } = useResizer(DEFAULT_DRAWER_WIDTH);
  const {
    drawerOpen, mobileOpen, activeCourse, activeModule, isConsoleOpen,
    authModalOpen, purchaseModalOpen, courseToPurchase, view,
    actions
  } = useAppUI();

  const isDashboardOpen = view === 'dashboard';
  const isProfileOpen = view === 'profile';

  // Custom Hooks per la gestione dei dati e dello scroll
  const { content, questions, exercises, loading } = useModuleContent(activeCourse, activeModule);
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
      id: 'intro',
      title: 'Informazioni',
      modules: [introModule],
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
        return <Dashboard onSelectCourse={handleCourseSelect} />;
      }
      if (isProfileOpen && user) {
        return <Profile />;
      }
      return <HomeView onSelectCourse={handleCourseSelect} />;
    }

    return (
      <KubeContainer maxWidth="lg">
        <Fade in={!loading} timeout={400}>
          <Box>
            <KubePaper sx={{ mb: 4, minHeight: '60vh', position: 'relative' }}>
              {loading ? (
                <KubeLoader message="Caricamento contenuti del modulo..." />
              ) : (
                <>
                  <Box className="markdown-content">
                    <ReactMarkdown rehypePlugins={[rehypeSlug]}>{content}</ReactMarkdown>
                  </Box>

                  {exercises && exercises.length > 0 && (
                    <KubeSection
                      id="exercises-section"
                      title="Esercitazioni Pratiche"
                      icon={<AssignmentOutlined />}
                    >
                      <CodingExercises 
                        exercises={exercises} 
                        key={`${activeModule.id}-exercises`} 
                        onFinish={handleModuleFinish}
                      />
                    </KubeSection>
                  )}

                  {questions.length > 0 && (
                    <KubeSection
                      id="quiz-section"
                      title="Quiz di Verifica"
                      icon={<QuizOutlined />}
                    >
                      <Quiz 
                        questions={questions} 
                        key={activeModule.id} 
                        onFinish={handleModuleFinish}
                      />
                    </KubeSection>
                  )}

                  {!activeCourse.isIntro && (
                    <NavigationButtons
                      currentModule={activeModule}
                      allModules={activeCourse.modules}
                      onModuleSelect={handleModuleSelect}
                    />
                  )}
                </>
              )}
            </KubePaper>
          </Box>
        </Fade>
      </KubeContainer>
    );
  }, [activeCourse, activeModule, content, exercises, questions, loading, handleCourseSelect, handleModuleSelect, isDashboardOpen, isProfileOpen, user]);

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
        activeSection={activeSection}
        questions={questions}
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
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
