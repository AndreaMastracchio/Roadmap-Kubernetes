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
  // Sidebar specific props
  courses,
  modules,
  activeSection,
  questions,
  handleCourseSelect,
  handleModuleSelect,
  handleSectionSelect
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Header 
        drawerOpen={drawerOpen}
        isDesktop={isDesktop}
        handleDrawerToggle={handleDrawerToggle}
        activeCourse={activeCourse}
        activeModule={activeModule}
        currentDrawerWidth={drawerOpen && isDesktop ? drawerWidth : 0}
        isResizing={isResizing}
        onBackToHome={onBackToHome}
        onOpenIntro={onOpenIntro}
      />
      
      <Box sx={{ display: 'flex', flex: 1, pt: 8 }}>
        <Sidebar 
          courses={courses}
          activeCourse={activeCourse}
          modules={modules}
          activeModule={activeModule}
          activeSection={activeSection}
          questions={questions}
          handleCourseSelect={handleCourseSelect}
          handleModuleSelect={handleModuleSelect}
          handleSectionSelect={handleSectionSelect}
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
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
            p: { xs: 2, sm: 3, md: 4 },
            width: { md: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
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
