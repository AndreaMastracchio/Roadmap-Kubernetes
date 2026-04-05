import React from 'react';
import { Box, Divider } from '@mui/material';
import KubeTypography from './KubeTypography';

const KubeSection = ({ title, icon, children, id, sx = {} }) => {
  return (
    <Box id={id} sx={{ mt: 8, pt: 4, ...sx }}>
      <Divider sx={{ mb: 6, borderStyle: 'dashed', borderWidth: '1px' }} />
      <KubeTypography 
        variant="h5" 
        weight="bold" 
        sx={{ 
          mb: 4, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          color: '#1e293b'
        }}
      >
        {icon && React.cloneElement(icon, { sx: { fontSize: 32, color: '#326ce5' } })}
        {title}
      </KubeTypography>
      {children}
    </Box>
  );
};

export default KubeSection;
