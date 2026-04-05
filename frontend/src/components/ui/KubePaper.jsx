import React from 'react';
import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  border: '1px solid #e0e0e0',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
  padding: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(6),
  },
  backgroundColor: '#fff',
}));

const KubePaper = ({ children, ...props }) => {
  return (
    <StyledPaper elevation={0} {...props}>
      {children}
    </StyledPaper>
  );
};

export default KubePaper;
