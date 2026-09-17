import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextField, Box } from '@mui/material';
import KubeButton from '../ui/KubeButton';

const LoginForm = ({ email, setEmail, password, setPassword, onSubmit }) => {
  const { t } = useTranslation();
  return (
    <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
      <TextField
        margin="normal"
        required
        fullWidth
        label={t('auth.email')}
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoFocus
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label={t('auth.password')}
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <KubeButton
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, py: 1.5 }}
      >
        {t('auth.loginTitle')}
      </KubeButton>
    </Box>
  );
};

export default LoginForm;
