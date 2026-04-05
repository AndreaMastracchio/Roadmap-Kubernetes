import React from 'react';
import { Box } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import KubeButton from './ui/KubeButton';

const NavigationButtons = ({ currentModule, allModules, onModuleSelect }) => {
  const currentIndex = allModules.findIndex((m) => m.id === currentModule.id);
  const prevModule = currentIndex > 0 ? allModules[currentIndex - 1] : null;
  const nextModule = currentIndex < allModules.length - 1 ? allModules[currentIndex + 1] : null;

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      mt: 8, 
      pt: 4, 
      borderTop: '1px solid #e0e0e0' 
    }}>
      <Box>
        {prevModule && (
          <KubeButton
            variant="outlined"
            startIcon={<ChevronLeft />}
            onClick={() => onModuleSelect(prevModule)}
          >
            {prevModule.title}
          </KubeButton>
        )}
      </Box>
      <Box>
        {nextModule && (
          <KubeButton
            variant="contained"
            endIcon={<ChevronRight />}
            onClick={() => onModuleSelect(nextModule)}
          >
            {nextModule.title}
          </KubeButton>
        )}
      </Box>
    </Box>
  );
};

export default NavigationButtons;
