import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Avatar,
  Grid,
  Alert,
  Divider,
  IconButton,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon,
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  Person as PersonIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import KubeTypography from '../ui/KubeTypography';
import KubeCard from '../ui/KubeCard';
import { useAuth } from '../../context/AuthContext';
import API_BASE from '../../config/api';

const Profile = () => {
  const { user, updateProfile, changePassword, uploadAvatar } = useAuth();

  // Stati per il profilo base
  const [name, setName] = useState(user?.name || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Stati per la password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Stati per l'avatar
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Messaggi di feedback
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    const res = await updateProfile({ name });
    if (res.success) {
      showMessage('success', 'Profilo aggiornato con successo!');
    } else {
      showMessage('error', res.message || 'Errore durante l\'aggiornamento.');
    }
    setProfileLoading(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return showMessage('error', 'Le password non coincidono.');
    }
    if (newPassword.length < 6) {
      return showMessage('error', 'La nuova password deve essere di almeno 6 caratteri.');
    }

    setPasswordLoading(true);
    const res = await changePassword(oldPassword, newPassword);
    if (res.success) {
      showMessage('success', 'Password aggiornata con successo!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      showMessage('error', res.message || 'Errore durante il cambio password.');
    }
    setPasswordLoading(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return showMessage('error', 'L\'immagine deve essere inferiore a 2MB.');
    }

    setAvatarLoading(true);
    const res = await uploadAvatar(file);
    if (res.success) {
      showMessage('success', 'Immagine del profilo aggiornata!');
    } else {
      showMessage('error', res.message || 'Errore durante il caricamento dell\'immagine.');
    }
    setAvatarLoading(false);
  };

  const avatarUrl = user?.avatar_url
    ? `${API_BASE.replace('/api', '')}${user.avatar_url}`
    : null;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <KubeTypography variant="h4" weight="bold">
          Il Tuo Profilo
        </KubeTypography>
        <KubeTypography variant="body1" color="text.secondary">
          Gestisci le tue informazioni personali e la sicurezza dell'account.
        </KubeTypography>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Colonna Sinistra: Avatar e Info Rapide */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <KubeCard sx={{ textAlign: 'center', p: 4, position: 'relative' }}>
              <Box sx={{ position: 'relative', width: 150, height: 150, mx: 'auto', mb: 3 }}>
                <Avatar
                  src={avatarUrl}
                  sx={{
                    width: '150px',
                    height: '150px',
                    mx: 'auto',
                    bgcolor: 'primary.main',
                    fontSize: '3.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: '4px solid #fff'
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                {avatarLoading && (
                  <Box sx={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    bgcolor: 'rgba(255,255,255,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%'
                  }}>
                    <CircularProgress size={40} />
                  </Box>
                )}
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="span"
                  onClick={handleAvatarClick}
                  sx={{
                    position: 'absolute',
                    bottom: 5,
                    right: 5,
                    bgcolor: 'white',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  <PhotoCameraIcon />
                </IconButton>
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </Box>
              <KubeTypography variant="h6" weight="bold">{user?.name}</KubeTypography>
              <KubeTypography variant="body2" color="text.secondary">{user?.email}</KubeTypography>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ textAlign: 'left' }}>
                <KubeTypography variant="caption" color="text.secondary" weight="bold" sx={{ textTransform: 'uppercase' }}>
                  Stato Account
                </KubeTypography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, bgcolor: 'success.main', borderRadius: '50%' }} />
                  <KubeTypography variant="body2">Attivo</KubeTypography>
                </Box>
              </Box>
            </KubeCard>

            <KubeCard sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
              <KubeTypography variant="h6" weight="bold" sx={{ mb: 1 }}>
                Progressi
              </KubeTypography>
              <KubeTypography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                Hai completato {user?.completedModules?.length || 0} moduli finora.
              </KubeTypography>
              <Button
                variant="outlined"
                fullWidth
                sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                onClick={() => window.location.hash = '#dashboard'} // Semplificato per ora
              >
                Vai alla Dashboard
              </Button>
            </KubeCard>
          </Box>
        </Grid>

        {/* Colonna Destra: Form Impostazioni e Sicurezza */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Informazioni Personali */}
            <KubeCard sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PersonIcon color="primary" />
                <KubeTypography variant="h6" weight="bold">Informazioni Personali</KubeTypography>
              </Box>

              <form onSubmit={handleUpdateProfile}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    label="Nome Completo"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    label="Email"
                    fullWidth
                    value={user?.email}
                    disabled
                    variant="outlined"
                    helperText="L'indirizzo email è collegato al tuo account e non può essere modificato."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={profileLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      disabled={profileLoading || name === user?.name}
                      sx={{ px: 4 }}
                    >
                      {profileLoading ? 'Salvataggio...' : 'Salva Modifiche'}
                    </Button>
                  </Box>
                </Box>
              </form>
            </KubeCard>

            {/* Sicurezza / Password */}
            <KubeCard sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <LockIcon color="primary" />
                <KubeTypography variant="h6" weight="bold">Sicurezza Account</KubeTypography>
              </Box>

              <form onSubmit={handleChangePassword}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    label="Vecchia Password"
                    type={showOldPassword ? 'text' : 'password'}
                    fullWidth
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    variant="outlined"
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowOldPassword(!showOldPassword)} edge="end">
                            {showOldPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Divider sx={{ my: 1 }}>
                    <KubeTypography variant="caption" color="text.secondary">Nuova Password</KubeTypography>
                  </Divider>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Nuova Password"
                        type={showNewPassword ? 'text' : 'password'}
                        fullWidth
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        variant="outlined"
                        required
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                                {showNewPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Conferma Nuova Password"
                        type={showNewPassword ? 'text' : 'password'}
                        fullWidth
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        variant="outlined"
                        required
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="secondary"
                      startIcon={passwordLoading ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
                      disabled={passwordLoading || !oldPassword || !newPassword}
                      sx={{ px: 4 }}
                    >
                      {passwordLoading ? 'Aggiornamento...' : 'Aggiorna Password'}
                    </Button>
                  </Box>
                </Box>
              </form>
            </KubeCard>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
