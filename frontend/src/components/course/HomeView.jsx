import React from 'react';
import { Box } from '@mui/material';
import CourseCard from './CourseCard';
import { courses } from '../../config/courses';
import KubeTypography from '../ui/KubeTypography';
import KubeContainer from '../ui/KubeContainer';
import KubeGrid from '../ui/KubeGrid';

const HomeView = ({ onSelectCourse }) => {
  return (
    <KubeContainer maxWidth="xl" sx={{ mt: 6, mb: 10 }}>
      <Box sx={{ mb: 8, textAlign: 'center' }}>
        <KubeTypography
          variant="h3"
          weight="bold"
          sx={{ mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}
        >
          I tuoi percorsi di studio
        </KubeTypography>
        <KubeTypography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 700, mx: 'auto', lineHeight: 1.6 }}
        >
          Esplora la nostra libreria di corsi e roadmap per padroneggiare Kubernetes e l'ecosistema Cloud Native.
        </KubeTypography>
      </Box>

      <KubeTypography variant="h5" weight="bold" sx={{ mb: 4, color: '#1e293b' }}>
        I Nostri Percorsi
      </KubeTypography>

      <KubeGrid
        columns={{
          xs: 1,
          sm: 2,
          md: 3
        }}
        gap={4}
      >
        {courses.filter(c => !c.comingSoon).map((course) => (
          <Box
            key={course.id}
            sx={{
              minWidth: 0,
              width: '100%'
            }}
          >
            <CourseCard
              course={course}
              onSelect={onSelectCourse}
            />
          </Box>
        ))}
      </KubeGrid>

      <KubeTypography variant="h5" weight="bold" sx={{ mb: 4, mt: 10, color: '#64748b', opacity: 0.8 }}>
        Prossimamente
      </KubeTypography>

      <KubeGrid
        columns={{
          xs: 1,
          sm: 2,
          md: 3
        }}
        gap={4}
        sx={{ opacity: 0.8 }}
      >
        {courses.filter(c => c.comingSoon).map((course) => (
          <Box
            key={course.id}
            sx={{
              minWidth: 0,
              width: '100%'
            }}
          >
            <CourseCard
              course={course}
              onSelect={onSelectCourse}
            />
          </Box>
        ))}
      </KubeGrid>
    </KubeContainer>
  );
};

export default HomeView;
