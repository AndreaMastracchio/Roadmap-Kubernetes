import React from 'react';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ExpandLess,
  ExpandMore,
  AssignmentOutlined,
  QuizOutlined,
  SignalCellularAlt,
  SignalCellularAlt1Bar,
  SignalCellularAlt2Bar,
} from '@mui/icons-material';

const SidebarContent = ({
  modules,
  activeModule,
  activeSection,
  questions,
  handleModuleSelect,
  handleSectionSelect,
  handleDrawerToggle,
  isDesktop
}) => (
  <div>
    <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <img
          src="https://raw.githubusercontent.com/kubernetes/kubernetes/master/logo/logo.svg"
          alt="K8s Logo"
          style={{ width: 32, height: 32 }}
        />
        <Typography variant="h6" noWrap sx={{ fontWeight: 'bold', color: '#326ce5', fontSize: '1.1rem' }}>
          KubeStudy
        </Typography>
      </Box>
      {isDesktop && (
        <IconButton onClick={handleDrawerToggle} size="small">
          <ChevronLeftIcon />
        </IconButton>
      )}
    </Toolbar>
    <Divider />
    <List sx={{ pt: 2, px: 1 }}>
      {modules.map((mod) => (
        <React.Fragment key={mod.id}>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={activeModule.id === mod.id}
              onClick={() => handleModuleSelect(mod)}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{mod.icon}</ListItemIcon>
              <ListItemText
                primary={mod.title}
                primaryTypographyProps={{ 
                  variant: 'body2', 
                  fontWeight: activeModule.id === mod.id ? 700 : 500,
                  fontSize: '0.85rem'
                }}
                secondary={
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                    <Tooltip title={`Livello: ${mod.level}`} arrow placement="right">
                      <Box sx={{ 
                        display: 'flex', 
                        color: mod.level === 'Avanzato' ? 'error.main' : mod.level === 'Intermedio' ? 'warning.main' : 'success.main' 
                      }}>
                        {mod.level === 'Base' && <SignalCellularAlt1Bar sx={{ fontSize: 16 }} />}
                        {mod.level === 'Intermedio' && <SignalCellularAlt2Bar sx={{ fontSize: 16 }} />}
                        {mod.level === 'Avanzato' && <SignalCellularAlt sx={{ fontSize: 16 }} />}
                      </Box>
                    </Tooltip>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                      {mod.time}
                    </Typography>
                  </Box>
                }
              />
              {mod.sections && (activeModule.id === mod.id ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />)}
            </ListItemButton>
          </ListItem>
          
          {mod.sections && (
            <Collapse in={activeModule.id === mod.id} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ mb: 1 }}>
                {mod.sections.map((section) => (
                  <ListItemButton
                    key={section.id}
                    selected={activeSection === section.anchor}
                    sx={{ pl: 6, py: 0.5, borderRadius: 2 }}
                    onClick={() => handleSectionSelect(section.anchor)}
                  >
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <AssignmentOutlined sx={{ 
                        fontSize: 16, 
                        color: activeSection === section.anchor ? 'primary.main' : 'inherit' 
                      }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={section.title} 
                      primaryTypographyProps={{ 
                        variant: 'caption', 
                        fontWeight: activeSection === section.anchor ? 700 : 500, 
                        fontSize: '0.75rem',
                        color: activeSection === section.anchor ? 'primary.main' : 'inherit'
                      }}
                    />
                  </ListItemButton>
                ))}
                {mod.id === activeModule.id && questions.length > 0 && (
                  <ListItemButton
                    selected={activeSection === 'quiz-section'}
                    sx={{ pl: 6, py: 0.5, borderRadius: 2 }}
                    onClick={() => handleSectionSelect('quiz-section')}
                  >
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <QuizOutlined sx={{ 
                        fontSize: 16, 
                        color: 'primary.main' 
                      }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Quiz di verifica" 
                      primaryTypographyProps={{ 
                        variant: 'caption', 
                        fontWeight: activeSection === 'quiz-section' ? 900 : 700, 
                        fontSize: '0.75rem',
                        color: 'primary.main' 
                      }}
                    />
                  </ListItemButton>
                )}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      ))}
    </List>
  </div>
);

const Sidebar = (props) => {
  const {
    mobileOpen,
    handleDrawerToggle,
    drawerWidth,
    drawerOpen,
    startResizing,
    isResizing,
    isDesktop
  } = props;

  return (
    <Box
      component="nav"
      sx={{ 
        width: { md: isDesktop && drawerOpen ? drawerWidth : 0 }, 
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
        <SidebarContent {...props} isDesktop={false} />
      </Drawer>
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth, 
            borderRight: '1px solid #e0e0e0',
            left: drawerOpen ? 0 : -drawerWidth,
            transition: isResizing ? 'none' : (theme) => theme.transitions.create(['width', 'left'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          },
        }}
        open={drawerOpen}
      >
        <SidebarContent {...props} isDesktop={true} />
        {/* Handle di ridimensionamento */}
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
      </Drawer>
    </Box>
  );
};

export default Sidebar;
