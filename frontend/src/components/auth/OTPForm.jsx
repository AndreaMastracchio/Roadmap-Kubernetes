import React from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import KubeButton from '../ui/KubeButton';

const OTPForm = ({ otp, setOtp, phone, onVerify, onResend, onBack }) => {
  return (
    <Box component="form" onSubmit={onVerify} sx={{ mt: 1 }}>
      <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
        Inserisci il codice di verifica inviato al numero <strong>{phone}</strong>
      </Typography>
      <TextField
        margin="normal"
        required
        fullWidth
        label="Codice OTP (6 cifre)"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        autoFocus
        inputProps={{ maxLength: 6 }}
      />
      <Button
        fullWidth
        variant="text"
        onClick={onResend}
        sx={{ mt: 1, textTransform: 'none' }}
      >
        Non hai ricevuto il codice? Reinvia
      </Button>
      <KubeButton
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, py: 1.5 }}
      >
        Verifica
      </KubeButton>
      <Button
        fullWidth
        variant="text"
        onClick={onBack}
        sx={{ mt: 0, textTransform: 'none' }}
      >
        Torna al login
      </Button>
    </Box>
  );
};

export default OTPForm;
