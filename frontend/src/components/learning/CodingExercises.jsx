import React, { useState } from 'react';
import { Box } from '@mui/material';
import CodingExercise from './CodingExercise';
import KubeButton from '../ui/KubeButton';
import KubeTypography from '../ui/KubeTypography';

const CodingExercises = ({ exercises }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [finished, setFinished] = useState(false);

  if (!exercises || exercises.length === 0) return null;

  const handleComplete = () => {
    if (!completedExercises.includes(currentIdx)) {
      setCompletedExercises([...completedExercises, currentIdx]);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < exercises.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setFinished(true);
    }
  };

  const restart = () => {
    setCurrentIdx(0);
    setCompletedExercises([]);
    setFinished(false);
  };

  if (finished) {
    return (
      <Box sx={{ mt: 4, p: 4, textAlign: 'center', bgcolor: 'rgba(76, 175, 80, 0.05)', borderRadius: 4, border: '1px dashed #4caf50' }}>
        <KubeTypography variant="h5" weight="bold" gutterBottom>🎉 Esercitazioni Completate!</KubeTypography>
        <KubeTypography variant="body1" sx={{ mb: 3 }}>
          Ottimo lavoro! Hai completato tutte le sfide di coding di questo modulo.
        </KubeTypography>
        <KubeButton variant="contained" onClick={restart}>Ricomincia</KubeButton>
      </Box>
    );
  }

  const exercise = exercises[currentIdx];
  const isCompleted = completedExercises.includes(currentIdx);

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <KubeTypography variant="subtitle1" weight="medium" sx={{ mb: 2, color: 'text.secondary' }}>
        Sfida {currentIdx + 1} di {exercises.length}
      </KubeTypography>
      
      <CodingExercise 
        exercise={exercise} 
        onComplete={handleComplete}
      />

      {isCompleted && (
        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <KubeButton 
            variant="contained" 
            onClick={handleNext}
            color="primary"
            sx={{ px: 4 }}
          >
            {currentIdx + 1 < exercises.length ? "Prossima Sfida" : "Termina Sfide"}
          </KubeButton>
        </Box>
      )}
    </Box>
  );
};

export default CodingExercises;
