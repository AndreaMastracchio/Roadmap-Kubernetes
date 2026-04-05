import React from 'react';
import { Card, CardActionArea, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  border: '1px solid #eef2f6',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0px 12px 30px rgba(50, 108, 229, 0.15)',
    borderColor: '#326ce540',
  },
}));

const KubeCard = ({ children, onClick, disabled, sx = {}, ...props }) => {
  const content = (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', ...sx }}>
      {children}
    </Box>
  );

  return (
    <StyledCard {...props}>
      {onClick ? (
        <CardActionArea 
          onClick={onClick} 
          disabled={disabled}
          sx={{ height: '100%', display: 'flex', alignItems: 'stretch', flexDirection: 'column' }}
        >
          {content}
        </CardActionArea>
      ) : content}
    </StyledCard>
  );
};

export default KubeCard;
