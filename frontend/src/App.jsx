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
  const { user, hasAccessToProject, buyProject, completeModule } = useAuth();
  const { width: drawerWidth, isResizing, startResizing } = useResizer(DEFAULT_DRAWER_WIDTH);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [activeCourse, setActiveCourse] = useState(null); // null = Home
  const [activeModule, setActiveModule] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [courseToPurchase, setCourseToPurchase] = useState(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Nuovo

  // Custom Hooks per la gestione dei dati e dello scroll
  const { content, questions, exercises, loading } = useModuleContent(activeModule);
  const { activeSection, setActiveSection } = useScrollSpy(content, questions, exercises);

  useEffect(() => {
    if (activeModule) {
      window.scrollTo(0, 0);
      setActiveSection('');
    }
  }, [activeModule, setActiveSection]);

  const handleDrawerToggle = useCallback(() => {
    setDrawerOpen((prev) => !prev);
    setMobileOpen((prev) => !prev);
  }, []);

  const handleCourseSelect = useCallback((course) => {
    if (course && course.isPrivate && !hasAccessToProject(course.id)) {
      setCourseToPurchase(course);
      setPurchaseModalOpen(true);
      return;
    }

    setActiveCourse(course);
    setIsDashboardOpen(false); // Chiudi dashboard se apri un corso
    if (course && course.modules && course.modules.length > 0) {
      setActiveModule(course.modules[0]);
    } else {
      setActiveModule(null);
    }
    setMobileOpen(false);
  }, [hasAccessToProject]);

  const handleConfirmPurchase = useCallback(() => {
    if (courseToPurchase) {
      const result = buyProject(courseToPurchase.id);
      if (result.success) {
        setPurchaseModalOpen(false);
        handleCourseSelect(courseToPurchase);
      }
    }
  }, [courseToPurchase, buyProject, handleCourseSelect]);

  const handleModuleSelect = useCallback((mod) => {
    setActiveModule(mod);
    setMobileOpen(false);
  }, []);

  const handleBackToHome = useCallback((view) => {
    setActiveCourse(null);
    setActiveModule(null);
    if (view === 'dashboard') {
      setIsDashboardOpen(true);
      setIsProfileOpen(false);
    } else if (view === 'profile') {
      setIsDashboardOpen(false);
      setIsProfileOpen(true);
    } else {
      setIsDashboardOpen(false);
      setIsProfileOpen(false);
    }
  }, []);

  const handleProfileOpen = useCallback(() => {
    if (!user) {
      setAuthModalOpen(true);
    } else {
      handleBackToHome('profile');
    }
  }, [user, handleBackToHome]);

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
    setActiveCourse(virtualIntroCourse);
    setActiveModule(introModule);
    setMobileOpen(false);
  }, []);

  const handleToggleConsole = useCallback(() => {
    setIsConsoleOpen((prev) => !prev);
    setMobileOpen(false);
  }, []);

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
    setMobileOpen(false);
  }, []);

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
                      <CodingExercises exercises={exercises} key={`${activeModule.id}-exercises`} />
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
        onToggleConsole={handleToggleConsole}
        isConsoleOpen={isConsoleOpen}
        onOpenAuth={() => setAuthModalOpen(true)}
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
          onClose={() => setIsConsoleOpen(false)}
        />
      )}
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <PurchaseModal
        open={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        course={courseToPurchase}
        onPurchase={handleConfirmPurchase}
        onOpenAuth={() => setAuthModalOpen(true)}
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
