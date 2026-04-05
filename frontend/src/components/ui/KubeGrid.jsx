import React from 'react';
import { Box } from '@mui/material';

const KubeGrid = ({
  children,
  columns = { xs: 1, sm: 2, md: 3 },
  gap = 4,
  sx = {},
  ...props
}) => {
  // Convertiamo le colonne in gridTemplateColumns
  const getGridTemplate = (val) => {
    if (typeof val === 'number') return `repeat(${val}, 1fr)`;
    if (val === 'auto auto auto') return 'auto auto auto'; // Supporto per la specifica richiesta
    return val;
  };

  const gridTemplateColumns = {};
  if (typeof columns === 'object') {
    Object.keys(columns).forEach(key => {
      gridTemplateColumns[key] = getGridTemplate(columns[key]);
    });
  } else {
    gridTemplateColumns.xs = getGridTemplate(columns);
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns,
        gap,
        ...sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default KubeGrid;
