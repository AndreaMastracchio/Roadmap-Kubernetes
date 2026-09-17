import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import KubeTypography from './KubeTypography';

const KubeLoader = ({ message, py = 20 }) => {
  const { t } = useTranslation();
  const displayMessage = message || t('module.loading');
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
        {displayMessage}
      </KubeTypography>
    </Box>
  );
};

export default KubeLoader;
