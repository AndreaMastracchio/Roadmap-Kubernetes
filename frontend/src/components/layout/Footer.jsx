import React from 'react';
import { Box, Link, Divider } from '@mui/material';
import KubeTypography from '../ui/KubeTypography';
import KubeContainer from '../ui/KubeContainer';

const Footer = () => {
  return (
    <Box component="footer" sx={{ bgcolor: '#f8fafc', pt: 8, pb: 4, mt: 'auto', borderTop: '1px solid #e2e8f0' }}>
      <KubeContainer maxWidth="xl">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', mb: 4, gap: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ bgcolor: '#326ce5', borderRadius: 1.2, p: 0.6, display: 'flex' }}>
                <img
                  src="https://raw.githubusercontent.com/kubernetes/kubernetes/master/logo/logo.svg"
                  alt="K8s Logo"
                  style={{ width: 16, height: 16, filter: 'brightness(0) invert(1)' }}
                />
              </Box>
              <KubeTypography weight="bold" variant="h6" sx={{ fontSize: '1rem', color: '#111827' }}>
                KubeStudy
              </KubeTypography>
            </Box>
            <KubeTypography variant="body2" color="text.secondary" sx={{ maxWidth: 300, lineHeight: 1.6 }}>
              Piattaforma open-source per padroneggiare Kubernetes attraverso roadmap strutturate ed esercizi interattivi.
            </KubeTypography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4, opacity: 0.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <KubeTypography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} Nightmare. Creato per la community.
          </KubeTypography>
          <KubeTypography variant="caption" color="text.secondary">
            v1.2.0
          </KubeTypography>
        </Box>
      </KubeContainer>
    </Box>
  );
};

export default Footer;
