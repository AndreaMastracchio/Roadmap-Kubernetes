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
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (tab === 0) { // Login
      const result = await login(email, password);
      if (result.success) {
        onClose();
      } else {
        setError(result.message);
      }
    } else { // Register
      const result = await register({ name, email, password });
      if (result.success) {
        onClose();
      } else {
        setError(result.message);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{tab === 0 ? 'Accedi' : 'Registrati'}</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Tabs value={tab} onChange={handleTabChange} variant="fullWidth" sx={{ mb: 3 }}>
          <Tab icon={<LoginIcon />} label="Login" />
          <Tab icon={<PersonAdd />} label="Registrati" />
        </Tabs>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {tab === 1 && (
            <TextField
              margin="normal"
              required
              fullWidth
              label="Nome Completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
          >
            {tab === 0 ? 'Accedi' : 'Crea Account'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
