import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import {
  Box,
  CssBaseline,
  Container,
  Typography,
  ThemeProvider,
  useMediaQuery,
  CircularProgress,
  Fade,
} from '@mui/material';
import { QuizOutlined } from '@mui/icons-material';

// Config & Hooks
import { modules } from './config/modules.jsx';
import { useResizer } from './hooks/useResizer';
import { useModuleContent } from './hooks/useModuleContent';
import { useScrollSpy } from './hooks/useScrollSpy';
import theme from './theme';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Quiz from './components/Quiz';
import NavigationButtons from './components/NavigationButtons';
import KubePaper from './components/ui/KubePaper';

const DEFAULT_DRAWER_WIDTH = 280;

function App() {
  const { width: drawerWidth, isResizing, startResizing } = useResizer(DEFAULT_DRAWER_WIDTH);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [activeModule, setActiveModule] = useState(modules[0]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Custom Hooks per la gestione dei dati e dello scroll
  const { content, questions, loading } = useModuleContent(activeModule);
  const { activeSection, setActiveSection } = useScrollSpy(content, questions);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveSection('');
  }, [activeModule, setActiveSection]);

  const handleDrawerToggle = useCallback(() => {
    if (isDesktop) {
      setDrawerOpen((prev) => !prev);
    } else {
      setMobileOpen((prev) => !prev);
    }
  }, [isDesktop]);

  const handleModuleSelect = useCallback((mod) => {
    setActiveModule(mod);
    if (!isDesktop) {
      setMobileOpen(false);
    }
  }, [isDesktop]);

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
    if (!isDesktop) {
      setMobileOpen(false);
    }
  }, [isDesktop]);

  const currentDrawerWidth = useMemo(() => 
    isDesktop && drawerOpen ? drawerWidth : 0
  , [isDesktop, drawerOpen, drawerWidth]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        
        <Header 
          drawerOpen={drawerOpen}
          isDesktop={isDesktop}
          handleDrawerToggle={handleDrawerToggle}
          activeModule={activeModule}
          currentDrawerWidth={currentDrawerWidth}
          isResizing={isResizing}
        />

        <Sidebar 
          modules={modules}
          activeModule={activeModule}
          activeSection={activeSection}
          questions={questions}
          handleModuleSelect={handleModuleSelect}
          handleSectionSelect={handleSectionSelect}
          handleDrawerToggle={handleDrawerToggle}
          mobileOpen={mobileOpen}
          drawerWidth={drawerWidth}
          drawerOpen={drawerOpen}
          startResizing={startResizing}
          isResizing={isResizing}
          isDesktop={isDesktop}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 3 },
            width: { md: `calc(100% - ${currentDrawerWidth}px)` },
            minHeight: '100vh',
            pt: { xs: 10, md: 12 },
            transition: isResizing ? 'none' : (theme) => theme.transitions.create(['width', 'margin-left'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Container maxWidth="lg">
            <Fade in={!loading} timeout={400}>
              <Box>
                <KubePaper sx={{ mb: 4, minHeight: '60vh', position: 'relative' }}>
                  {loading ? (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      py: 20,
                      gap: 2
                    }}>
                      <CircularProgress size={60} thickness={4} />
                      <Typography variant="body1" color="text.secondary">
                        Caricamento contenuti...
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Box className="markdown-content">
                        <ReactMarkdown rehypePlugins={[rehypeSlug]}>{content}</ReactMarkdown>
                      </Box>

                      {questions.length > 0 && (
                        <Box id="quiz-section" sx={{ mt: 8, pt: 4, borderTop: '2px dashed #e0e0e0' }}>
                          <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <QuizOutlined color="primary" fontSize="large" />
                            Quiz di Verifica
                          </Typography>
                          <Quiz questions={questions} key={activeModule.id} />
                        </Box>
                      )}

                      <NavigationButtons 
                        currentModule={activeModule}
                        allModules={modules}
                        onModuleSelect={handleModuleSelect}
                      />
                    </>
                  )}
                </KubePaper>
              </Box>
            </Fade>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
