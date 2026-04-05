import { createTheme } from '@mui/material';

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

export default theme;
