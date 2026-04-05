import React from 'react';
import { Box, Grid, LinearProgress, Chip } from '@mui/material';
import { 
  School as SchoolIcon, 
  CheckCircle as CheckCircleIcon, 
  TrendingUp as ProgressIcon
} from '@mui/icons-material';
import KubeTypography from '../ui/KubeTypography';
import KubeCard from '../ui/KubeCard';
import { useAuth } from '../../context/AuthContext';
import { courses } from '../../config/courses';

const Dashboard = ({ onSelectCourse }) => {
  const { user } = useAuth();

  if (!user) return null;

  // Filtriamo solo i corsi che l'utente può vedere (pubblici + privati acquistati)
  const userCourses = courses.filter(course => 
    !course.comingSoon && 
    (!course.isPrivate || user.purchasedProjects?.includes(course.id))
  );

  const calculateProgress = (course) => {
    if (!course.modules || course.modules.length === 0) return 0;
    const completedCount = course.modules.filter(mod => 
      user.completedModules?.includes(`${course.id}-${mod.id}`) || 
      user.completedModules?.includes(mod.id)
    ).length;
    return Math.round((completedCount / course.modules.length) * 100);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <KubeTypography variant="h4" weight="bold" sx={{ color: '#1e293b', mb: 1 }}>
            La tua Dashboard 🚀
          </KubeTypography>
          <KubeTypography color="text.secondary">
            Bentornato {user.name}, ecco i tuoi progressi attuali.
          </KubeTypography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
           <KubeCard sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, minWidth: 160 }}>
              <Box sx={{ bgcolor: '#326ce515', p: 1, borderRadius: 2, color: '#326ce5' }}>
                <SchoolIcon />
              </Box>
              <Box>
                <KubeTypography variant="h6" weight="bold">{userCourses.length}</KubeTypography>
                <KubeTypography variant="caption" color="text.secondary">Corsi Attivi</KubeTypography>
              </Box>
           </KubeCard>
           <KubeCard sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, minWidth: 160 }}>
              <Box sx={{ bgcolor: '#10b98115', p: 1, borderRadius: 2, color: '#10b981' }}>
                <CheckCircleIcon />
              </Box>
              <Box>
                <KubeTypography variant="h6" weight="bold">{user.completedModules?.length || 0}</KubeTypography>
                <KubeTypography variant="caption" color="text.secondary">Moduli Completati</KubeTypography>
              </Box>
           </KubeCard>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Corsi dell'utente */}
        <Grid item xs={12}>
          <KubeTypography variant="h6" weight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ProgressIcon sx={{ color: '#326ce5' }} /> I tuoi corsi
          </KubeTypography>
          
          <Grid container spacing={3}>
            {userCourses.length > 0 ? (
              userCourses.map(course => {
                const progress = calculateProgress(course);
                return (
                  <Grid item xs={12} md={6} lg={4} key={course.id}>
                    <KubeCard 
                      sx={{ p: 0, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}
                      onClick={() => onSelectCourse(course)}
                    >
                      <Box sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ color: course.color, display: 'flex' }}>{course.icon}</Box>
                                <Box>
                                  <KubeTypography weight="bold">{course.title}</KubeTypography>
                                  <KubeTypography variant="caption" color="text.secondary">{course.modules?.length || 0} Moduli</KubeTypography>
                                </Box>
                             </Box>
                             <Chip 
                              label={progress === 100 ? 'Completato' : `${progress}%`} 
                              color={progress === 100 ? 'success' : 'primary'}
                              size="small"
                              variant={progress === 100 ? 'filled' : 'outlined'}
                             />
                          </Box>
                          <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                               <KubeTypography variant="caption" color="text.secondary">Progresso</KubeTypography>
                               <KubeTypography variant="caption" weight="bold">{progress}%</KubeTypography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={progress} 
                              sx={{ height: 8, borderRadius: 4, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { borderRadius: 4 } }}
                            />
                          </Box>
                      </Box>
                    </KubeCard>
                  </Grid>
                );
              })
            ) : (
              <Grid item xs={12}>
                <KubeCard sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc' }}>
                  <KubeTypography color="text.secondary">Non hai ancora corsi attivi. Inizia esplorando la Home!</KubeTypography>
                </KubeCard>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
