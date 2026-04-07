import React from 'react';
import { Box } from '@mui/material';
import KubeTypography from './KubeTypography';
import KubeButton from './KubeButton';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh',
            p: 4,
            textAlign: 'center',
            bgcolor: '#f8fafc'
          }}
        >
          <KubeTypography variant="h3" weight="bold" sx={{ mb: 2, color: '#e11d48' }}>
            Ops! Qualcosa è andato storto.
          </KubeTypography>
          <KubeTypography variant="body1" sx={{ mb: 4, color: '#64748b' }}>
            Si è verificato un errore imprevisto durante la navigazione.
          </KubeTypography>
          <KubeButton 
            variant="contained" 
            onClick={() => window.location.href = '/'}
          >
            Torna alla Home
          </KubeButton>
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mt: 4, p: 2, bgcolor: '#fee2e2', borderRadius: 2, textAlign: 'left', overflow: 'auto', maxWidth: '80%' }}>
              <KubeTypography variant="caption" sx={{ fontFamily: 'monospace' }}>
                {this.state.error && this.state.error.toString()}
              </KubeTypography>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
