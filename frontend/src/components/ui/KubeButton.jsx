import React from 'react';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 10,
  textTransform: 'none',
  fontWeight: 600,
  padding: '8px 20px',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0px 4px 12px rgba(50, 108, 229, 0.2)',
  },
}));

const KubeButton = (props) => {
  return <StyledButton {...props} />;
};

export default KubeButton;
