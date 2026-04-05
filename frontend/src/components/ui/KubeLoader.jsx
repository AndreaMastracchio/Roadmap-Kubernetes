import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import KubeTypography from './KubeTypography';

const KubeLoader = ({ message = 'Caricamento...', py = 20 }) => {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: py,
      gap: 2,
      width: '100%'
    }}>
      <CircularProgress 
        size={50} 
        thickness={4} 
        sx={{ color: '#326ce5' }} 
      />
      <KubeTypography 
        variant="body2" 
        color="text.secondary"
        weight="medium"
      >
        {message}
      </KubeTypography>
    </Box>
  );
};

export default KubeLoader;
