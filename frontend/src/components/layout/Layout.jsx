import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = ({
  children,
  drawerOpen,
  mobileOpen,
  handleDrawerToggle,
  drawerWidth,
  startResizing,
  isResizing,
  activeCourse,
  activeModule,
  onBackToHome,
  onOpenIntro,
  onToggleConsole,
  onOpenAuth,
  onOpenProfile, // Aggiunto
  isConsoleOpen,
  isDashboardOpen,
  isProfileOpen,
  // Sidebar specific props
  courses,
  modules,
  sections,
  activeSection,
  questions,
  exercises,
  handleCourseSelect,
  handleModuleSelect,
  handleSectionSelect
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Larghezza effettiva della sidebar
  const miniDrawerWidth = 70;
  const currentWidth = isDesktop
    ? (drawerOpen ? drawerWidth : miniDrawerWidth)
    : 0;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Header
        drawerOpen={drawerOpen}
        isDesktop={isDesktop}
        handleDrawerToggle={handleDrawerToggle}
        activeCourse={activeCourse}
        activeModule={activeModule}
        currentDrawerWidth={currentWidth}
        isResizing={isResizing}
        onBackToHome={onBackToHome}
        onOpenIntro={onOpenIntro}
        onOpenAuth={onOpenAuth} // Passato all'header
        onOpenProfile={onOpenProfile} // Passato all'header
        isDashboardOpen={isDashboardOpen}
        isProfileOpen={isProfileOpen}
      />

      <Box sx={{ display: 'flex', flex: 1, pt: 8 }}>
        <Sidebar
          courses={courses}
          activeCourse={activeCourse}
          modules={modules}
          sections={sections}
          activeModule={activeModule}
          activeSection={activeSection}
          questions={questions}
          exercises={exercises}
          handleCourseSelect={handleCourseSelect}
          handleModuleSelect={handleModuleSelect}
          handleSectionSelect={handleSectionSelect}
          onToggleConsole={onToggleConsole}
          onOpenAuth={onOpenAuth}
          isConsoleOpen={isConsoleOpen}
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          drawerWidth={drawerWidth}
          miniDrawerWidth={miniDrawerWidth}
          drawerOpen={drawerOpen}
          startResizing={startResizing}
          isResizing={isResizing}
          isDesktop={isDesktop}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            width: { md: `calc(100% - ${currentWidth}px)` },
            ml: { md: 0 },
            transition: isResizing ? 'none' : theme.transitions.create(['width', 'margin-left'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            display: 'flex',
            flexDirection: 'column',
            minHeight: 'calc(100vh - 64px)'
          }}
        >
          <Box sx={{ flex: 1 }}>
            {children}
          </Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
