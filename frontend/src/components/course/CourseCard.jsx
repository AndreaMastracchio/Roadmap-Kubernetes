import React from 'react';
import { Box, Chip } from '@mui/material';
import { AccessTime as TimeIcon, ChevronRight as ArrowIcon } from '@mui/icons-material';
import KubeCard from '../ui/KubeCard';
import KubeTypography from '../ui/KubeTypography';

const CourseCard = ({ course, onSelect }) => {
  return (
    <KubeCard
      onClick={() => !course.comingSoon && onSelect(course)}
      disabled={course.comingSoon}
      sx={{ 
        p: 2, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        opacity: course.comingSoon ? 0.7 : 1 
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <Box 
          sx={{ 
            p: 1, 
            borderRadius: 2, 
            bgcolor: `${course.color}15`, 
            color: course.color,
            display: 'flex',
            mr: 1.2
          }}
        >
          {React.cloneElement(course.icon, { fontSize: 'small' })}
        </Box>
        <KubeTypography weight="bold" variant="subtitle2" sx={{ lineHeight: 1.2 }}>
          {course.title}
        </KubeTypography>
      </Box>

      <KubeTypography 
        variant="caption" 
        color="text.secondary" 
        sx={{ 
          mb: 2, 
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2rem'
        }}
      >
        {course.description}
      </KubeTypography>

      <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
          <TimeIcon sx={{ fontSize: '0.8rem' }} />
          <KubeTypography variant="caption" weight="semibold" sx={{ fontSize: '0.7rem' }}>
            {course.duration}
          </KubeTypography>
        </Box>

        {course.comingSoon ? (
          <Chip label="Coming Soon" size="small" variant="outlined" color="secondary" sx={{ fontSize: '0.6rem', height: 18 }} />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', color: course.color }}>
            <KubeTypography variant="button" weight="bold" sx={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
              Dettagli
            </KubeTypography>
            <ArrowIcon sx={{ fontSize: '0.9rem' }} />
          </Box>
        )}
      </Box>
    </KubeCard>
  );
};

export default CourseCard;
