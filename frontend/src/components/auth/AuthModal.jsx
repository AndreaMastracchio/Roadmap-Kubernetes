import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { Close as CloseIcon, PersonAdd, Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const AuthModal = ({ open, onClose }) => {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [pendingPhone, setPendingPhone] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { login, register, verifyOTP, resendOTP } = useAuth();

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setError('');
    setMessage('');
    setShowOTP(false);
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    const result = await resendOTP(pendingPhone);
    if (result.success) {
      setMessage('Codice reinviato con successo');
    } else {
      setError(result.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (showOTP) {
      const type = tab === 0 ? 'login' : 'register';
      const result = await verifyOTP(pendingPhone, otp, type);
      if (result.success) {
        onClose();
        setShowOTP(false);
        setOtp('');
      } else {
        setError(result.message);
      }
      return;
    }

    if (tab === 0) { // Login
      const result = await login(email, password);
      if (result.success) {
        if (result.requiresOTP) {
          setShowOTP(true);
          setPendingPhone(result.phone);
        } else {
          onClose();
        }
      } else {
        setError(result.message);
      }
    } else { // Register
      const result = await register({ name, email, password, phone });
      if (result.success) {
        if (result.requiresOTP) {
          setShowOTP(true);
          setPendingPhone(result.phone);
        } else {
          onClose();
        }
      } else {
        setError(result.message);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {showOTP ? 'Verifica Codice' : (tab === 0 ? 'Accedi' : 'Registrati')}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {!showOTP && (
          <Tabs value={tab} onChange={handleTabChange} variant="fullWidth" sx={{ mb: 3 }}>
            <Tab icon={<LoginIcon />} label="Login" />
            <Tab icon={<PersonAdd />} label="Registrati" />
          </Tabs>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          
          {showOTP ? (
            <>
              <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
                Inserisci il codice di verifica inviato al numero <strong>{pendingPhone}</strong>
              </Typography>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Codice OTP (6 cifre)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                autoFocus
              />
              <Button
                fullWidth
                variant="text"
                onClick={handleResend}
                sx={{ mt: 1, textTransform: 'none' }}
              >
                Non hai ricevuto il codice? Reinvia
              </Button>
            </>
          ) : (
            <>
              {tab === 1 && (
                <>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Nome Completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Numero di Telefono"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+391234567890"
                  />
                </>
              )}
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus={tab === 0}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
          >
            {showOTP ? 'Verifica' : (tab === 0 ? 'Accedi' : 'Crea Account')}
          </Button>
          
          {showOTP && (
            <Button
              fullWidth
              variant="text"
              onClick={() => setShowOTP(false)}
              sx={{ mt: 0, textTransform: 'none' }}
            >
              Torna al login
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
