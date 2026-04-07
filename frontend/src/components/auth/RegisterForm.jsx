import React from 'react';
import { TextField, Box } from '@mui/material';
import KubeButton from '../ui/KubeButton';

const RegisterForm = ({
  name, setName,
  email, setEmail,
  password, setPassword,
  phone, setPhone,
  onSubmit
}) => {
  return (
    <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
      <TextField
        margin="normal"
        required
        fullWidth
        label="Nome Completo"
        autoComplete="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Numero di Telefono"
        autoComplete="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+391234567890"
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <KubeButton
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, py: 1.5 }}
      >
        Crea Account
      </KubeButton>
    </Box>
  );
};

export default RegisterForm;
