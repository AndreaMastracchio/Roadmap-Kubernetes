import React, { useState } from 'react';
import {
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Alert,
  Divider,
} from '@mui/material';
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material';

import KubeButton from '../ui/KubeButton';
import KubePaper from '../ui/KubePaper';
import KubeTypography from '../ui/KubeTypography';

const Quiz = ({ questions, onFinish }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!questions || questions.length === 0) return null;

  const handleOptionChange = (event) => {
    setSelectedOption(parseInt(event.target.value));
  };

  const handleNext = () => {
    const isCorrect = selectedOption === questions[currentQuestion].correct;
    if (isCorrect) setScore(score + 1);

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    setShowResult(false);
    setSelectedOption(null);
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setFinished(true);
      if (onFinish) onFinish(score + (selectedOption === questions[currentQuestion].correct ? 1 : 0));
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <Box sx={{ mt: 4, p: 3, textAlign: 'center' }}>
        <KubeTypography variant="h5" weight="bold" sx={{ mb: 2 }}>🎉 Quiz Completato!</KubeTypography>
        <KubeTypography variant="body1" sx={{ mb: 3 }}>
          Hai risposto correttamente a {score} su {questions.length} domande.
        </KubeTypography>
        <KubeButton variant="contained" onClick={restartQuiz}>Riprova</KubeButton>
      </Box>
    );
  }

  const question = questions[currentQuestion];

  return (
    <Box sx={{ mt: 8, mb: 6 }}>
      <Divider sx={{ mb: 6 }} />
      <KubeTypography variant="h5" weight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        🧠 Quiz di verifica <KubeTypography variant="h6" color="text.secondary" component="span">({currentQuestion + 1}/{questions.length})</KubeTypography>
      </KubeTypography>
      <KubePaper sx={{ p: 4, bgcolor: '#ffffff', borderRadius: 4 }}>
        <KubeTypography variant="h6" weight="semibold" sx={{ mb: 3, color: '#111827' }}>
          {question.question}
        </KubeTypography>
        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <RadioGroup value={selectedOption !== null ? selectedOption : ''} onChange={handleOptionChange}>
            {question.options.map((option, index) => (
              <FormControlLabel
                key={index}
                value={index}
                control={<Radio disabled={showResult} color="primary" />}
                label={option}
                sx={{
                  my: 0.75,
                  mx: 0,
                  p: 1.5,
                  borderRadius: 3,
                  transition: 'all 0.2s ease',
                  bgcolor: showResult && index === question.correct ? 'rgba(76, 175, 80, 0.08)' :
                           showResult && selectedOption === index && index !== question.correct ? 'rgba(244, 67, 54, 0.08)' :
                           selectedOption === index ? 'rgba(50, 108, 229, 0.04)' : 'transparent',
                  border: showResult && index === question.correct ? '1px solid #4caf50' :
                          showResult && selectedOption === index && index !== question.correct ? '1px solid #f44336' :
                          selectedOption === index ? '1px solid #326ce540' : '1px solid #e5e7eb',
                  '&:hover': {
                    bgcolor: showResult ? 'inherit' : 'rgba(50, 108, 229, 0.02)',
                  }
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        {showResult && (
          <Box sx={{ mt: 4 }}>
            <Alert
              severity={selectedOption === question.correct ? "success" : "error"}
              icon={selectedOption === question.correct ? <CheckCircleOutline /> : <ErrorOutline />}
              sx={{ borderRadius: 3, border: '1px solid', borderColor: selectedOption === question.correct ? '#4caf5030' : '#f4433630' }}
            >
              <KubeTypography weight="bold" variant="subtitle2" sx={{ mb: 0.5 }}>
                {selectedOption === question.correct ? "Ottimo lavoro!" : "Quasi corretto!"}
              </KubeTypography>
              <KubeTypography variant="body2">{question.explanation}</KubeTypography>
            </Alert>
            <KubeButton variant="contained" sx={{ mt: 3 }} onClick={handleNextQuestion}>
              {currentQuestion + 1 < questions.length ? "Prossima domanda" : "Vedi risultati"}
            </KubeButton>
          </Box>
        )}

        {!showResult && (
          <KubeButton
            variant="contained"
            disabled={selectedOption === null}
            sx={{ mt: 4, minWidth: 160 }}
            onClick={handleNext}
          >
            Verifica risposta
          </KubeButton>
        )}
      </KubePaper>
    </Box>
  );
};

export default Quiz;
