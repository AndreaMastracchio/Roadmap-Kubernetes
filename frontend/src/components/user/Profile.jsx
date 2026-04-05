import React, { useState } from 'react';
import { Box, TextField, Button, Avatar, Grid, Alert } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import KubeTypography from '../ui/KubeTypography';
import KubeCard from '../ui/KubeCard';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateProfile({ name });
    if (res.success) {
      setMessage({ type: 'success', text: 'Profilo aggiornato con successo!' });
    } else {
      setMessage({ type: 'error', text: res.message || 'Errore durante l\'aggiornamento.' });
    }
    setLoading(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
      <KubeTypography variant="h4" weight="bold" sx={{ mb: 4 }}>
        Impostazioni Profilo
      </KubeTypography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <KubeCard sx={{ textAlign: 'center', p: 4 }}>
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100, 
                mx: 'auto', 
                mb: 2, 
                bgcolor: 'primary.main',
                fontSize: '2rem'
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <KubeTypography weight="bold">{user?.name}</KubeTypography>
            <KubeTypography variant="body2" color="text.secondary">{user?.email}</KubeTypography>
          </KubeCard>
        </Grid>

        <Grid item xs={12} md={8}>
          <KubeCard sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {message.text && (
                  <Alert severity={message.type}>{message.text}</Alert>
                )}
                
                <TextField
                  label="Nome Completo"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  variant="outlined"
                />

                <TextField
                  label="Email"
                  fullWidth
                  value={user?.email}
                  disabled
                  variant="outlined"
                  helperText="L'email non può essere modificata."
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<SaveIcon />}
                  disabled={loading || name === user?.name}
                  sx={{ mt: 2, py: 1.5 }}
                >
                  {loading ? 'Salvataggio...' : 'Salva Modifiche'}
                </Button>
              </Box>
            </form>
          </KubeCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
