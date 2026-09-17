import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Link, Divider } from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import KubeTypography from '../ui/KubeTypography';
import KubeContainer from '../ui/KubeContainer';
import { SUPPORT, hasCoffeeLink } from '../../config/support';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <Box component="footer" sx={{ bgcolor: '#f8fafc', pt: 8, pb: 4, mt: 'auto', borderTop: '1px solid #e2e8f0' }}>
      <KubeContainer maxWidth="xl">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', mb: 4, gap: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ bgcolor: '#326ce5', borderRadius: 1.2, p: 0.6, display: 'flex' }}>
                <SchoolIcon sx={{ width: 16, height: 16, color: '#fff' }} />
              </Box>
              <KubeTypography weight="bold" variant="h6" sx={{ fontSize: '1rem', color: '#111827' }}>
                {t('brand.name')}
              </KubeTypography>
            </Box>
            <KubeTypography variant="body2" color="text.secondary" sx={{ maxWidth: 300, lineHeight: 1.6 }}>
              {t('brand.tagline')}
            </KubeTypography>
          </Box>

          {hasCoffeeLink && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: { md: 'flex-end' }, justifyContent: 'center', gap: 1.5 }}>
              <KubeTypography variant="body2" color="text.secondary">
                {t('footer.freeMessage')}
              </KubeTypography>
              <Link
                href={SUPPORT.COFFEE_URL}
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2.5,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: '#ffdd00',
                  color: '#111827',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    bgcolor: '#ffdd00'
                  }
                }}
              >
                ☕ {t('footer.coffeeButton')}
              </Link>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 4, opacity: 0.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <KubeTypography variant="caption" color="text.secondary">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </KubeTypography>
          <KubeTypography variant="caption" color="text.secondary">
            v1.2.0
          </KubeTypography>
        </Box>
      </KubeContainer>
    </Box>
  );
};

export default Footer;
