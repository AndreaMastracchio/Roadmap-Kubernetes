import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextField, Box } from '@mui/material';
import KubeButton from '../ui/KubeButton';

const RegisterForm = ({
  name, setName,
  email, setEmail,
  password, setPassword,
  onSubmit
}) => {
  const { t } = useTranslation();
  return (
    <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
      <TextField
        margin="normal"
        required
        fullWidth
        label={t('auth.fullName')}
        autoComplete="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label={t('auth.email')}
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label={t('auth.passwordMin8')}
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
        {t('auth.createAccount')}
      </KubeButton>
    </Box>
  );
};

export default RegisterForm;
