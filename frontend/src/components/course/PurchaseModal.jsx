import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Divider
} from '@mui/material';
import { ShoppingBagOutlined as ShopIcon, CheckCircleOutline } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import KubeTypography from '../ui/KubeTypography';
import KubeButton from '../ui/KubeButton';

const PurchaseModal = ({ open, onClose, course, onPurchase, onOpenAuth }) => {
  const { user } = useAuth();

  if (!course) return null;

  const handleLoginClick = () => {
    onClose();
    if (onOpenAuth) onOpenAuth();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShopIcon color="primary" />
        <KubeTypography variant="h6" weight="bold">Acquista Corso</KubeTypography>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <KubeTypography variant="h6" weight="bold" gutterBottom>
            {course.title}
          </KubeTypography>
          <KubeTypography variant="body2" color="text.secondary">
            {course.description}
          </KubeTypography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <KubeTypography variant="body1">Prezzo:</KubeTypography>
          <KubeTypography variant="h5" weight="bold" color="primary.main">
            {course.price}
          </KubeTypography>
        </Box>

        {!user && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(244, 67, 54, 0.05)', borderRadius: 2, border: '1px dashed #f44336' }}>
            <KubeTypography variant="body2" color="error" align="center" weight="medium" sx={{ mb: 1 }}>
              Devi essere loggato per procedere.
            </KubeTypography>
            <KubeButton 
              fullWidth 
              variant="outlined" 
              color="error" 
              size="small"
              onClick={handleLoginClick}
            >
              Accedi o Registrati ora
            </KubeButton>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <KubeButton onClick={onClose} color="inherit">Annulla</KubeButton>
        <KubeButton 
          variant="contained" 
          onClick={onPurchase} 
          disabled={!user}
          startIcon={<CheckCircleOutline />}
        >
          Conferma Acquisto
        </KubeButton>
      </DialogActions>
    </Dialog>
  );
};

export default PurchaseModal;
