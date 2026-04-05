import React from 'react';
import { Typography } from '@mui/material';

const KubeTypography = ({ variant = 'body1', weight = 400, color, sx = {}, children, ...props }) => {
  const getWeight = () => {
    switch (weight) {
      case 'bold': return 700;
      case 'semibold': return 600;
      case 'medium': return 500;
      case 'regular': return 400;
      default: return weight;
    }
  };

  return (
    <Typography
      variant={variant}
      sx={{
        fontWeight: getWeight(),
        color: color || (variant.startsWith('h') ? '#1a1a1a' : 'text.primary'),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Typography>
  );
};

export default KubeTypography;
