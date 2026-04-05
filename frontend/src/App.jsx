import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Quiz from './components/Quiz';
import {
  AppBar,
  Box,
  CssBaseline,
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
  Container,
  Paper,
  Chip,
  ThemeProvider,
  createTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Book as BookIcon,
  School as SchoolIcon,
  Code as CodeIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  NetworkCheck as NetworkIcon,
  Architecture as ArchitectureIcon,
  Terminal as TerminalIcon,
  Layers as LayersIcon,
  Inventory2 as InventoryIcon,
} from '@mui/icons-material';

const drawerWidth = 280;

const modules = [
  { id: 'intro', title: 'Benvenuto', file: 'intro.md', icon: <SchoolIcon />, level: 'Base', time: '5 min' },
  { id: '01', title: '1. Fondamentali', file: '01.md', icon: <LayersIcon />, level: 'Base', time: '20 min' },
  { id: '02', title: '2. Architettura', file: '02.md', icon: <ArchitectureIcon />, level: 'Intermedio', time: '30 min' },
  { id: '03', title: '3. Risorse Base', file: '03.md', icon: <InventoryIcon />, level: 'Base', time: '25 min' },
  { id: '04', title: '4. Networking', file: '04.md', icon: <NetworkIcon />, level: 'Avanzato', time: '40 min' },
  { id: '05', title: '5. Storage', file: '05.md', icon: <StorageIcon />, level: 'Intermedio', time: '30 min' },
  { id: '06', title: '6. Sicurezza', file: '06.md', icon: <SecurityIcon />, level: 'Avanzato', time: '35 min' },
  { id: '07', title: '7. Helm', file: '07.md', icon: <TerminalIcon />, level: 'Intermedio', time: '20 min' },
  { id: '08', title: '8. Operatori Go', file: '08.md', icon: <CodeIcon />, level: 'Avanzato', time: '60 min' },
];

const theme = createTheme({
  palette: {
    primary: {
      main: '#326ce5', // Colore ufficiale Kubernetes
    },
    background: {
      default: '#f4f7f9',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
  },
  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(50, 108, 229, 0.08)',
            color: '#326ce5',
            '& .MuiListItemIcon-root': {
              color: '#326ce5',
            },
            '&:hover': {
              backgroundColor: 'rgba(50, 108, 229, 0.12)',
            },
          },
        },
      },
    },
  },
});

function App() {
  const [activeModule, setActiveModule] = useState(modules[0]);
  const [content, setContent] = useState('');
  const [questions, setQuestions] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    // Caricamento contenuto Markdown
    fetch(`/modules/${activeModule.file}`)
      .then((res) => res.text())
      .then((text) => setContent(text))
      .catch(() => setContent('# Errore\nImpossibile caricare il modulo.'));

    // Caricamento domande Quiz (se esistono)
    const jsonFile = activeModule.file.replace('.md', '.json');
    fetch(`/modules/${jsonFile}`)
      .then((res) => {
        if (!res.ok) throw new Error('No quiz');
        return res.json();
      })
      .then((data) => setQuestions(data))
      .catch(() => setQuestions([]));
  }, [activeModule]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleModuleSelect = (mod) => {
    setActiveModule(mod);
    if (!isDesktop) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <img
            src="https://raw.githubusercontent.com/kubernetes/kubernetes/master/logo/logo.svg"
            alt="K8s Logo"
            style={{ width: 40, height: 40 }}
          />
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: '#326ce5' }}>
            KubeStudy
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ pt: 2 }}>
        {modules.map((mod) => (
          <ListItem key={mod.id} disablePadding>
            <ListItemButton
              selected={activeModule.id === mod.id}
              onClick={() => handleModuleSelect(mod)}
            >
              <ListItemIcon>{mod.icon}</ListItemIcon>
              <ListItemText
                primary={mod.title}
                primaryTypographyProps={{ variant: 'body2', fontWeight: activeModule.id === mod.id ? 700 : 500 }}
                secondary={
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                    <Chip label={mod.level} size="small" sx={{ height: 16, fontSize: '0.65rem' }} color={mod.level === 'Avanzato' ? 'error' : mod.level === 'Intermedio' ? 'warning' : 'success'} variant="outlined" />
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', alignSelf: 'center' }}>• {mod.time}</Typography>
                  </Box>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            bgcolor: 'white',
            color: 'text.primary',
            boxShadow: 'none',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="subtitle1" noWrap component="div" sx={{ color: 'text.secondary' }}>
              Roadmap /
            </Typography>
            <Typography variant="subtitle1" noWrap component="div" sx={{ ml: 1, fontWeight: 'bold' }}>
              {activeModule.title}
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
          aria-label="mailbox folders"
        >
          {/* Mobile drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Migliora le performance su mobile.
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          {/* Desktop drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid #e0e0e0' },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            minHeight: '100vh',
            pt: { xs: 10, md: 12 },
          }}
        >
          <Container maxWidth="lg">
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 6 },
                borderRadius: 4,
                border: '1px solid #e0e0e0',
                bgcolor: 'white'
              }}
            >
              <Box className="markdown-content">
                <ReactMarkdown>{content}</ReactMarkdown>
              </Box>
              {questions.length > 0 && (
                <Quiz questions={questions} key={activeModule.id} />
              )}
            </Paper>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
