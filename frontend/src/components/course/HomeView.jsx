import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import CourseCard from './CourseCard';
import KubeTypography from '../ui/KubeTypography';
import KubeContainer from '../ui/KubeContainer';
import KubeGrid from '../ui/KubeGrid';

const GROUP_LABELS = {
  'certifications': { it: 'Certificazioni', en: 'Certifications' },
  'fundamentals': { it: 'Fondamentali', en: 'Fundamentals' },
  'devops': { it: 'DevOps & Automazione', en: 'DevOps & Automation' },
  'backend': { it: 'Backend', en: 'Backend' },
  'frontend': { it: 'Frontend', en: 'Frontend' },
  'mobile': { it: 'Mobile', en: 'Mobile' },
  'other': { it: 'Altri', en: 'Other' }
};

const HomeView = ({ courses = [], onSelectCourse }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';

  const activeCourses = courses.filter(c => !c.comingSoon);
  const comingSoonCourses = courses.filter(c => c.comingSoon);

  const grouped = activeCourses.reduce((acc, course) => {
    const g = course.group || 'other';
    if (!acc[g]) acc[g] = [];
    acc[g].push(course);
    return acc;
  }, {});

  const sortedGroups = Object.keys(grouped).sort((a, b) => {
    const order = ['certifications', 'fundamentals', 'devops', 'backend', 'frontend', 'mobile', 'other'];
    return order.indexOf(a) - order.indexOf(b);
  });

  return (
    <KubeContainer maxWidth="xl" sx={{ mt: 6, mb: 10 }}>
      <Box sx={{ mb: 8, textAlign: 'center' }}>
        <KubeTypography
          variant="h3"
          weight="bold"
          sx={{ mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}
        >
          {t('home.heroTitle')}
        </KubeTypography>
        <KubeTypography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 700, mx: 'auto', lineHeight: 1.6 }}
        >
          {t('home.heroSubtitle')}
        </KubeTypography>
      </Box>

      {sortedGroups.map(groupKey => (
        <Box key={groupKey} sx={{ mb: 8 }}>
          <KubeTypography variant="h5" weight="bold" sx={{ mb: 4, color: '#1e293b' }}>
            {GROUP_LABELS[groupKey]?.[lang] || GROUP_LABELS[groupKey]?.en || groupKey}
          </KubeTypography>

          <KubeGrid columns={{ xs: 1, sm: 2, md: 3 }} gap={4}>
            {grouped[groupKey].map((course) => (
              <Box key={course.id} sx={{ minWidth: 0, width: '100%' }}>
                <CourseCard course={course} onSelect={onSelectCourse} />
              </Box>
            ))}
          </KubeGrid>
        </Box>
      ))}

      {comingSoonCourses.length > 0 && (
        <Box sx={{ mb: 8 }}>
          <KubeTypography variant="h5" weight="bold" sx={{ mb: 4, mt: 10, color: '#64748b', opacity: 0.8 }}>
            {t('home.comingSoon')}
          </KubeTypography>
          <KubeGrid columns={{ xs: 1, sm: 2, md: 3 }} gap={4} sx={{ opacity: 0.8 }}>
            {comingSoonCourses.map((course) => (
              <Box key={course.id} sx={{ minWidth: 0, width: '100%' }}>
                <CourseCard course={course} onSelect={onSelectCourse} />
              </Box>
            ))}
          </KubeGrid>
        </Box>
      )}
    </KubeContainer>
  );
};

export default HomeView;
