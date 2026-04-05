import React from 'react';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledListItemButton = styled(ListItemButton)(({ theme, active }) => ({
  borderRadius: 12,
  margin: '2px 8px',
  padding: '10px 16px',
  transition: 'all 0.2s ease',
  backgroundColor: active ? '#326ce510' : 'transparent',
  color: active ? '#326ce5' : '#4b5563',
  '&:hover': {
    backgroundColor: active ? '#326ce515' : '#f3f4f6',
    color: active ? '#326ce5' : '#111827',
  },
  '& .MuiListItemIcon-root': {
    minWidth: 36,
    color: active ? '#326ce5' : 'inherit',
  },
}));

const KubeListItem = ({ 
  icon, 
  primary, 
  secondary, 
  active, 
  onClick, 
  sx = {}, 
  primaryTypographyProps = {},
  hideText = false,
  ...props 
}) => {
  return (
    <ListItem disablePadding sx={{ mb: 0.5, ...sx }} {...props}>
      <StyledListItemButton 
        active={active ? 1 : 0} 
        onClick={onClick}
        sx={{
          justifyContent: hideText ? 'center' : 'flex-start',
          px: hideText ? 0 : 2,
        }}
      >
        {icon && (
          <ListItemIcon sx={{ 
            minWidth: hideText ? 0 : 36, 
            mr: hideText ? 0 : 1,
            display: 'flex',
            justifyContent: 'center'
          }}>
            {icon}
          </ListItemIcon>
        )}
        {!hideText && (
          <ListItemText
            primary={primary}
            secondary={secondary}
            primaryTypographyProps={{
              variant: 'body2',
              fontWeight: active ? 700 : 500,
              fontSize: '0.875rem',
              ...primaryTypographyProps
            }}
            secondaryTypographyProps={{
              variant: 'caption',
              sx: { mt: 0.5, display: 'block' }
            }}
          />
        )}
      </StyledListItemButton>
    </ListItem>
  );
};

export default KubeListItem;
