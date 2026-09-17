import React from 'react';
import { Box } from '@mui/material';
import { ADS } from '../../config/ads';

const AdSlot = ({ position = 'generic', sx = {} }) => {
  if (!ADS.ENABLED) return null;

  return (
    <Box
      data-ad-slot={position}
      aria-hidden="true"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 90,
        borderRadius: 2,
        border: '1px dashed #cbd5e1',
        bgcolor: '#f8fafc',
        color: 'text.secondary',
        fontSize: '0.8rem',
        my: 3,
        ...sx
      }}
    >
      Spazio sponsor ({position})
    </Box>
  );
};

export default AdSlot;
