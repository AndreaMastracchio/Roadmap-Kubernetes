import React, { memo, useState } from 'react';
import { AppBar, Toolbar, IconButton, Box, Avatar, Menu, MenuItem, ListItemIcon, Divider } from '@mui/material';
import { 
  Menu as MenuIcon, 
  ChevronRight as ChevronRightIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import KubeTypography from '../ui/KubeTypography';
import { useAuth } from '../../context/AuthContext';

const Header = memo(({ 
  drawerOpen, 
  isDesktop, 
  handleDrawerToggle, 
  activeCourse,
  activeModule, 
  currentDrawerWidth, 
  isResizing,
  onBackToHome,
  onOpenIntro,
  onOpenAuth, // Nuovo: per aprire il modale login se non loggato
  onOpenProfile, // Nuovo: per aprire il profilo
  isDashboardOpen,
  isProfileOpen
}) => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    onBackToHome();
  };

  const handleDashboard = () => {
    handleClose();
    onBackToHome('dashboard');
  };

  const handleProfile = () => {
    handleClose();
    onOpenProfile();
  };

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
          {isDashboardOpen && !activeCourse && (
            <>
              <ChevronRightIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              <KubeTypography 
                variant="body2" 
                weight="medium"
                sx={{ 
                  color: 'primary.main',
                  bgcolor: '#326ce510',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                Dashboard
              </KubeTypography>
            </>
          )}
          {isProfileOpen && !activeCourse && (
            <>
              <ChevronRightIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              <KubeTypography 
                variant="body2" 
                weight="medium"
                sx={{ 
                  color: 'primary.main',
                  bgcolor: '#326ce510',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                Profilo
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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

          <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24, alignSelf: 'center' }} />

          {user ? (
            <>
              <IconButton 
                onClick={handleClick}
                size="small"
                sx={{ ml: 1, p: 0.5, border: '1px solid #e2e8f0' }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#326ce5', fontSize: '0.875rem' }}>
                  {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <KubeTypography weight="bold" variant="body2">{user.name || 'Studente'}</KubeTypography>
                  <KubeTypography variant="caption" color="text.secondary">{user.email}</KubeTypography>
                </Box>
                <Divider />
                <MenuItem onClick={handleDashboard}>
                  <ListItemIcon>
                    <DashboardIcon fontSize="small" />
                  </ListItemIcon>
                  Dashboard
                </MenuItem>
                <MenuItem onClick={handleProfile}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Profilo
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <KubeTypography variant="body2" sx={{ color: 'error.main' }}>Esci</KubeTypography>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <KubeTypography 
              variant="body2" 
              weight="bold"
              sx={{ 
                color: 'primary.main', 
                cursor: 'pointer',
                px: 2,
                py: 0.8,
                borderRadius: 2,
                bgcolor: '#326ce510',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#326ce520' }
              }}
              onClick={onOpenAuth}
            >
              Accedi / Registrati
            </KubeTypography>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
});

export default Header;
