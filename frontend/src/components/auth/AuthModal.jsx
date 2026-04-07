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

import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import OTPForm from './OTPForm';

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
      if (result.otp) {
        setOtp(result.otp);
        setMessage(`Nuovo codice di test generato: ${result.otp}`);
      } else {
        setMessage('Codice reinviato con successo');
      }
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
          if (result.otp) {
            setOtp(result.otp);
            setMessage(`Codice di test generato (Modalità Sviluppo): ${result.otp}`);
          }
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
          if (result.otp) {
            setOtp(result.otp);
            setMessage(`Codice di test generato (Modalità Sviluppo): ${result.otp}`);
          }
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

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

        {showOTP ? (
          <OTPForm 
            otp={otp} 
            setOtp={setOtp} 
            phone={pendingPhone} 
            onVerify={handleSubmit} 
            onResend={handleResend}
            onBack={() => setShowOTP(false)}
          />
        ) : (
          tab === 0 ? (
            <LoginForm 
              email={email} 
              setEmail={setEmail} 
              password={password} 
              setPassword={setPassword} 
              onSubmit={handleSubmit}
            />
          ) : (
            <RegisterForm 
              name={name} 
              setName={setName} 
              email={email} 
              setEmail={setEmail} 
              password={password} 
              setPassword={setPassword} 
              phone={phone} 
              setPhone={setPhone} 
              onSubmit={handleSubmit}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
