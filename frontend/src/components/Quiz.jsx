import React, { useState } from 'react';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Button,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material';

const Quiz = ({ questions }) => {
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
        <Typography variant="h5" gutterBottom>🎉 Quiz Completato!</Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Hai risposto correttamente a {score} su {questions.length} domande.
        </Typography>
        <Button variant="contained" onClick={restartQuiz}>Riprova</Button>
      </Box>
    );
  }

  const question = questions[currentQuestion];

  return (
    <Box sx={{ mt: 6, mb: 4 }}>
      <Divider sx={{ mb: 4 }} />
      <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        🧠 Esercizio Interattivo ({currentQuestion + 1}/{questions.length})
      </Typography>
      <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 3, bgcolor: '#fcfcfc' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
          {question.question}
        </Typography>
        <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
          <RadioGroup value={selectedOption !== null ? selectedOption : ''} onChange={handleOptionChange}>
            {question.options.map((option, index) => (
              <FormControlLabel
                key={index}
                value={index}
                control={<Radio disabled={showResult} />}
                label={option}
                sx={{
                  my: 0.5,
                  p: 1,
                  borderRadius: 2,
                  bgcolor: showResult && index === question.correct ? 'rgba(76, 175, 80, 0.1)' :
                           showResult && selectedOption === index && index !== question.correct ? 'rgba(244, 67, 54, 0.1)' : 'transparent',
                  border: showResult && index === question.correct ? '1px solid #4caf50' :
                          showResult && selectedOption === index && index !== question.correct ? '1px solid #f44336' : '1px solid transparent'
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        {showResult && (
          <Box sx={{ mt: 3 }}>
            <Alert
              severity={selectedOption === question.correct ? "success" : "error"}
              icon={selectedOption === question.correct ? <CheckCircleOutline /> : <ErrorOutline />}
              sx={{ borderRadius: 2 }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {selectedOption === question.correct ? "Corretto!" : "Sbagliato!"}
              </Typography>
              <Typography variant="body2">{question.explanation}</Typography>
            </Alert>
            <Button variant="contained" sx={{ mt: 2 }} onClick={handleNextQuestion}>
              {currentQuestion + 1 < questions.length ? "Prossima domanda" : "Vedi risultati"}
            </Button>
          </Box>
        )}

        {!showResult && (
          <Button
            variant="contained"
            disabled={selectedOption === null}
            sx={{ mt: 3 }}
            onClick={handleNext}
          >
            Verifica risposta
          </Button>
        )}
      </Paper>
    </Box>
  );
};

export default Quiz;
