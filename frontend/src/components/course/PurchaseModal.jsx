import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { ShoppingBagOutlined as ShopIcon, CheckCircleOutline } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

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
        Acquista Corso
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {course.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {course.description}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body1">Prezzo:</Typography>
          <Typography variant="h5" fontWeight="bold" color="primary.main">
            {course.price}
          </Typography>
        </Box>

        {!user && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(244, 67, 54, 0.05)', borderRadius: 2, border: '1px dashed #f44336' }}>
            <Typography variant="body2" color="error" align="center" sx={{ fontWeight: 'medium', mb: 1 }}>
              Devi essere loggato per procedere.
            </Typography>
            <Button 
              fullWidth 
              variant="outlined" 
              color="error" 
              size="small"
              onClick={handleLoginClick}
            >
              Accedi o Registrati ora
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Annulla</Button>
        <Button 
          variant="contained" 
          onClick={onPurchase} 
          disabled={!user}
          startIcon={<CheckCircleOutline />}
          sx={{ fontWeight: 'bold' }}
        >
          Conferma Acquisto
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PurchaseModal;
