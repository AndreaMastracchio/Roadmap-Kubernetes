import React, { memo } from 'react';
import { AppBar, Toolbar, IconButton, Box } from '@mui/material';
import { Menu as MenuIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import KubeTypography from '../ui/KubeTypography';

const Header = memo(({ 
  drawerOpen, 
  isDesktop, 
  handleDrawerToggle, 
  activeCourse,
  activeModule, 
  currentDrawerWidth, 
  isResizing,
  onBackToHome,
  onOpenIntro
}) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${currentDrawerWidth}px)` },
        ml: { md: `${currentDrawerWidth}px` },
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        color: 'text.primary',
        boxShadow: '0 1px 0 rgba(0,0,0,0.05)',
        borderBottom: 'none',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: isResizing ? 'none' : (theme) => theme.transitions.create(['width', 'margin-left'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar sx={{ height: 64 }}>
        {(!drawerOpen || !isDesktop) && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, bgcolor: '#f3f4f6', borderRadius: 2 }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <KubeTypography 
            variant="body2" 
            weight="medium"
            sx={{ 
              color: 'text.secondary', 
              cursor: 'pointer',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              '&:hover': { color: 'primary.main', bgcolor: '#326ce510' }
            }}
            onClick={onBackToHome}
          >
            Home
          </KubeTypography>
          {activeCourse && (
            <>
              <ChevronRightIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              <KubeTypography 
                variant="body2" 
                weight="medium"
                sx={{ 
                  color: 'text.secondary',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  '&:hover': { color: 'primary.main', bgcolor: '#326ce510' },
                  cursor: 'pointer'
                }}
                onClick={() => {}} // Could go back to course root
              >
                {activeCourse.title}
              </KubeTypography>
            </>
          )}
          {activeModule && (
            <>
              <ChevronRightIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              <KubeTypography 
                variant="body2" 
                weight="bold" 
                sx={{ 
                  color: '#111827',
                  px: 1,
                  py: 0.5
                }}
              >
                {activeModule.title}
              </KubeTypography>
            </>
          )}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <KubeTypography 
            variant="body2" 
            weight="medium"
            sx={{ 
              color: 'text.secondary', 
              cursor: 'pointer',
              px: 1.5,
              py: 0.8,
              borderRadius: 2,
              transition: 'all 0.2s',
              '&:hover': { color: 'primary.main', bgcolor: '#326ce510' }
            }}
            onClick={onOpenIntro}
          >
            Cos'è questo progetto?
          </KubeTypography>
        </Box>
      </Toolbar>
    </AppBar>
  );
});

export default Header;
