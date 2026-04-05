import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

const Header = ({ 
  drawerOpen, 
  isDesktop, 
  handleDrawerToggle, 
  activeModule, 
  currentDrawerWidth, 
  isResizing 
}) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${currentDrawerWidth}px)` },
        ml: { md: `${currentDrawerWidth}px` },
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        color: 'text.primary',
        boxShadow: 'none',
        borderBottom: '1px solid #e0e0e0',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: isResizing ? 'none' : (theme) => theme.transitions.create(['width', 'margin-left'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar>
        {(!drawerOpen || !isDesktop) && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle2" noWrap sx={{ color: 'text.secondary', fontWeight: 400 }}>
            Roadmap /
          </Typography>
          <Typography variant="subtitle2" noWrap sx={{ ml: 1, fontWeight: 700 }}>
            {activeModule.title}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
