import React from 'react';
import { Box } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import KubeButton from '../ui/KubeButton';
import KubeTypography from '../ui/KubeTypography';

const NavigationButtons = ({ currentModule, allModules, onModuleSelect }) => {
  if (!currentModule || !allModules || allModules.length === 0) return null;

  const currentIndex = allModules.findIndex((m) => m.id === currentModule.id);
  if (currentIndex === -1) return null;
  const prevModule = currentIndex > 0 ? allModules[currentIndex - 1] : null;
  const nextModule = currentIndex < allModules.length - 1 ? allModules[currentIndex + 1] : null;

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      mt: 10,
      pt: 4,
      borderTop: '1px solid #e5e7eb',
      gap: 2
    }}>
      <Box sx={{ flex: 1, textAlign: 'left' }}>
        {prevModule && (
          <Box onClick={() => onModuleSelect(prevModule)} sx={{ cursor: 'pointer', '&:hover .MuiButton-root': { bgcolor: '#f3f4f6' } }}>
            <KubeTypography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', ml: 1 }}>
              Precedente
            </KubeTypography>
            <KubeButton
              variant="outlined"
              startIcon={<ChevronLeft />}
              sx={{ borderRadius: 3, py: 1.5, px: 2, borderColor: '#e5e7eb', color: '#4b5563' }}
            >
              {prevModule.title}
            </KubeButton>
          </Box>
        )}
      </Box>
      <Box sx={{ flex: 1, textAlign: 'right' }}>
        {nextModule && (
          <Box onClick={() => onModuleSelect(nextModule)} sx={{ cursor: 'pointer', '&:hover .MuiButton-root': { bgcolor: '#2b5dc8' } }}>
            <KubeTypography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', mr: 1 }}>
              Prossimo Modulo
            </KubeTypography>
            <KubeButton
              variant="contained"
              endIcon={<ChevronRight />}
              sx={{ borderRadius: 3, py: 1.5, px: 2, boxShadow: '0 4px 12px rgba(50, 108, 229, 0.2)' }}
            >
              {nextModule.title}
            </KubeButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default NavigationButtons;
