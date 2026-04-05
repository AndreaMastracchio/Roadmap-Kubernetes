import React, { memo } from 'react';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  Toolbar,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  QuizOutlined,
  SignalCellularAlt,
  SignalCellularAlt1Bar,
  SignalCellularAlt2Bar,
  HomeOutlined,
  Terminal as TerminalIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  ShoppingBagOutlined as ShopIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import KubeListItem from '../ui/KubeListItem';
import KubeTypography from '../ui/KubeTypography';
import { Avatar, Button, Typography } from '@mui/material';

const SidebarContent = memo(({
  courses,
  activeCourse,
  modules,
  activeModule,
  activeSection,
  questions,
  handleCourseSelect,
  handleModuleSelect,
  handleSectionSelect,
  handleDrawerToggle,
  onToggleConsole,
  isConsoleOpen,
  onOpenAuth,
  isDesktop,
  drawerOpen // Aggiunto
}) => {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#ffffff', borderRight: '1px solid #f1f5f9', overflow: 'hidden' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: drawerOpen ? 'space-between' : 'center', px: drawerOpen ? 2.5 : 1, py: 3 }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer', flexShrink: 0 }}
          onClick={() => handleCourseSelect(null)}
        >
          <Box
            sx={{
              bgcolor: '#326ce5',
              borderRadius: '10px',
              p: 0.7,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(50, 108, 229, 0.25)',
              flexShrink: 0,
              width: 32,
              height: 32
            }}
          >
            <img
              src="https://raw.githubusercontent.com/kubernetes/kubernetes/master/logo/logo.svg"
              alt="K8s Logo"
              style={{ width: 20, height: 20, filter: 'brightness(0) invert(1)', flexShrink: 0 }}
            />
          </Box>
          {drawerOpen && (
            <KubeTypography weight="bold" variant="h6" sx={{ color: '#1e293b', fontSize: '1.25rem', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              KubeStudy
            </KubeTypography>
          )}
        </Box>
        {isDesktop && (
          <IconButton 
            onClick={handleDrawerToggle} 
            size="small" 
            sx={{ 
              bgcolor: 'white', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
              '&:hover': { bgcolor: '#f3f4f6' },
              display: drawerOpen ? 'flex' : 'none' // Lo mostriamo solo se aperto qui, se chiuso usiamo quello sotto o quello in header
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}
      </Toolbar>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', px: 1, pb: 4 }}>
        <KubeListItem
          onClick={onToggleConsole}
          active={isConsoleOpen}
          hideText={!drawerOpen}
          icon={
            <Box sx={{
              p: 0.8,
              borderRadius: 1.5,
              bgcolor: 'rgba(0,0,0,0.05)',
              display: 'flex',
              color: '#1e293b'
            }}>
              <TerminalIcon sx={{ fontSize: 18 }} />
            </Box>
          }
          primary="Console Interattiva"
          sx={{ mb: 2, mt: 0, bgcolor: 'rgba(0,0,0,0.02)' }}
        />
        <Divider sx={{ my: 2, mx: drawerOpen ? 2 : 1, opacity: 0.5 }} />

      {drawerOpen && (
        <KubeTypography
          variant="overline"
          weight="bold"
          color="text.secondary"
          sx={{ px: 2, mt: 1, mb: 1, display: 'block', letterSpacing: 1.5, fontSize: '0.65rem', opacity: 0.8 }}
        >
          {activeCourse ? 'CONTENUTO CORSO' : 'ESPLORA PERCORSI'}
        </KubeTypography>
      )}

      {!activeCourse ? (
        <>
          {courses.filter(c => !c.comingSoon && !c.isPrivate).map((course) => (
            <KubeListItem
              key={course.id}
              onClick={() => handleCourseSelect(course)}
              hideText={!drawerOpen}
              icon={
                <Box sx={{
                  p: 0.8,
                  borderRadius: 1.5,
                  bgcolor: `${course.color}10`,
                  display: 'flex',
                  color: course.color
                }}>
                  {React.cloneElement(course.icon, { sx: { fontSize: 18 } })}
                </Box>
              }
              primary={course.title}
              sx={{ mb: 1 }}
            />
          ))}
        </>
      ) : (
        <>
          <KubeListItem
            onClick={() => handleCourseSelect(null)}
            hideText={!drawerOpen}
            icon={<HomeOutlined fontSize="small" />}
            primary="Torna alla Home"
            sx={{ mb: 2, mt: 1 }}
          />
          <Divider sx={{ my: 1, mx: drawerOpen ? 2 : 1, opacity: 0.5 }} />

          {modules.map((mod) => (
            <React.Fragment key={mod.id}>
              <KubeListItem
                onClick={() => handleModuleSelect(mod)}
                active={activeModule && activeModule.id === mod.id}
                hideText={!drawerOpen}
                icon={React.cloneElement(mod.icon, { fontSize: 'small' })}
                primary={mod.title}
                secondary={
                  drawerOpen && (mod.level || mod.time) ? (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {mod.level && (
                        <Tooltip title={`Livello: ${mod.level}`} arrow placement="right">
                          <Box sx={{
                            display: 'flex',
                            color: mod.level === 'Avanzato' ? 'error.main' : mod.level === 'Intermedio' ? 'warning.main' : 'success.main',
                            opacity: 0.8
                          }}>
                            {mod.level === 'Base' && <SignalCellularAlt1Bar sx={{ fontSize: 14 }} />}
                            {mod.level === 'Intermedio' && <SignalCellularAlt2Bar sx={{ fontSize: 14 }} />}
                            {mod.level === 'Avanzato' && <SignalCellularAlt sx={{ fontSize: 14 }} />}
                          </Box>
                        </Tooltip>
                      )}
                      {mod.time && (
                        <KubeTypography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                          {mod.level && '• '} {mod.time}
                        </KubeTypography>
                      )}
                    </Box>
                  ) : null
                }
                sx={{
                  '& .MuiListItemSecondaryAction-root': { right: 16 }
                }}
              />

              <Collapse in={drawerOpen && activeModule && activeModule.id === mod.id} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ mb: 1, ml: 2, borderLeft: '1px solid #e5e7eb', my: 0.5 }}>
                  {mod.sections && mod.sections.map((section) => (
                    <KubeListItem
                      key={section.id}
                      onClick={() => handleSectionSelect(section.anchor)}
                      active={activeSection === section.anchor}
                      primary={section.title}
                      sx={{ py: 0, '& .MuiListItemButton-root': { py: 0.5, borderRadius: '0 8px 8px 0', ml: 0 } }}
                      primaryTypographyProps={{
                        fontSize: '0.8rem',
                        color: activeSection === section.anchor ? '#326ce5' : '#6b7280'
                      }}
                    />
                  ))}
                  {mod.id === activeModule?.id && questions.length > 0 && (
                    <KubeListItem
                      onClick={() => handleSectionSelect('quiz-section')}
                      active={activeSection === 'quiz-section'}
                      icon={<QuizOutlined sx={{ fontSize: 16 }} />}
                      primary="Quiz di verifica"
                      sx={{ py: 0, '& .MuiListItemButton-root': { py: 0.5, borderRadius: '0 8px 8px 0', ml: 0 } }}
                      primaryTypographyProps={{
                        fontSize: '0.8rem',
                        color: activeSection === 'quiz-section' ? '#326ce5' : '#326ce5'
                      }}
                    />
                  )}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </>
      )}
      </Box>
      
      {!drawerOpen && isDesktop && (
        <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconButton 
              onClick={handleDrawerToggle} 
              size="small" 
              sx={{ 
                bgcolor: '#326ce5', 
                color: 'white',
                boxShadow: '0 4px 12px rgba(50, 108, 229, 0.3)',
                '&:hover': { bgcolor: '#285ad1' } 
              }}
            >
                <ChevronRightIcon fontSize="small" />
            </IconButton>
        </Box>
      )}
    </Box>
  );
});

const Sidebar = memo((props) => {
  const {
    mobileOpen,
    handleDrawerToggle,
    drawerWidth,
    miniDrawerWidth, // Aggiunto
    drawerOpen,
    startResizing,
    isResizing,
    isDesktop,
    onToggleConsole,
    isConsoleOpen,
    onOpenAuth,
    ...otherProps
  } = props;

  return (
    <Box
      component="nav"
      sx={{
        width: { md: isDesktop ? (drawerOpen ? drawerWidth : miniDrawerWidth) : 0 },
        flexShrink: { md: 0 },
        transition: isResizing ? 'none' : (theme) => theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        <SidebarContent
          {...otherProps}
          onToggleConsole={onToggleConsole}
          isConsoleOpen={isConsoleOpen}
          onOpenAuth={onOpenAuth}
          handleDrawerToggle={handleDrawerToggle}
          isDesktop={false}
          drawerOpen={true}
        />
      </Drawer>
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerOpen ? drawerWidth : miniDrawerWidth,
            borderRight: '1px solid #e2e8f0',
            transition: isResizing ? 'none' : (theme) => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            overflowX: 'hidden'
          },
        }}
        open
      >
        <SidebarContent
          {...otherProps}
          onToggleConsole={onToggleConsole}
          isConsoleOpen={isConsoleOpen}
          onOpenAuth={onOpenAuth}
          handleDrawerToggle={handleDrawerToggle}
          isDesktop={true}
          drawerOpen={drawerOpen}
        />
        {/* Handle di ridimensionamento */}
        {drawerOpen && (
          <Box
            onMouseDown={startResizing}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '4px',
              cursor: 'col-resize',
              zIndex: 1000,
              '&:hover': {
                bgcolor: 'primary.main',
                opacity: 0.5,
              },
            }}
          />
        )}
      </Drawer>
    </Box>
  );
});

export default Sidebar;
