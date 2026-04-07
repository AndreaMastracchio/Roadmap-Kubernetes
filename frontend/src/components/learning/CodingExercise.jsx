import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Divider,
  Alert,
  IconButton,
} from '@mui/material';
import { CheckCircle, Error, HelpOutline, Lightbulb } from '@mui/icons-material';
import KubeButton from '../ui/KubeButton';
import KubePaper from '../ui/KubePaper';
import KubeTypography from '../ui/KubeTypography';

const CodingExercise = ({ exercise, onComplete }) => {
  const [inputs, setInputs] = useState({});
  const [results, setResults] = useState({});
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Reset state when exercise changes
    setInputs({});
    setResults({});
    setIsCorrect(false);
    setShowHint(false);
    setSubmitted(false);
  }, [exercise]);

  if (!exercise) return null;

  const handleInputChange = (id, value) => {
    setInputs({ ...inputs, [id]: value });
  };

  const checkAnswers = () => {
    let allCorrect = true;
    const newResults = {};

    exercise.answers?.forEach((ans) => {
      const userValue = (inputs[ans.id] || '').trim();
      const isAnsCorrect = ans.accepted.includes(userValue);
      newResults[ans.id] = isAnsCorrect;
      if (!isAnsCorrect) allCorrect = false;
    });

    setResults(newResults);
    setIsCorrect(allCorrect);
    setSubmitted(true);
    if (allCorrect && onComplete) onComplete();
  };

  const renderCode = () => {
    const templateArray = Array.isArray(exercise.template) ? exercise.template : [exercise.template];
    return (
      <Box sx={{ bgcolor: '#1e1e1e', p: 3, borderRadius: 3, border: '1px solid #333', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)' }}>
        {templateArray.map((line, lineIdx) => {
          const parts = line.split(/(\{\{.*?\}\})/);
          return (
            <Box key={lineIdx} sx={{ display: 'flex', alignItems: 'center', minHeight: '1.8rem', flexWrap: 'wrap' }}>
              <KubeTypography sx={{ mr: 2, color: '#555', minWidth: '1.5rem', userSelect: 'none', textAlign: 'right', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                {lineIdx + 1}
              </KubeTypography>
              {parts.map((part, partIdx) => {
                if (part.startsWith('{{') && part.endsWith('}}')) {
                  const id = part.slice(2, -2);
                  const isFieldCorrect = results[id];
                  const ansConfig = exercise.answers.find(a => a.id === id);

                  return (
                    <TextField
                      key={partIdx}
                      size="small"
                      variant="standard"
                      value={inputs[id] || ''}
                      onChange={(e) => handleInputChange(id, e.target.value)}
                      disabled={submitted && isCorrect}
                      placeholder={ansConfig?.placeholder || "..."}
                      sx={{
                        mx: 0.5,
                        width: ansConfig?.width || '120px',
                        input: {
                          fontFamily: 'monospace',
                          fontSize: '0.9rem',
                          color: submitted ? (isFieldCorrect ? '#4caf50' : '#f44336') : '#ce9178',
                          fontWeight: submitted && isFieldCorrect ? 'bold' : 'normal',
                          textAlign: 'center',
                          pb: 0.2
                        },
                        '& .MuiInput-underline:before': { borderBottomColor: '#444' },
                        '& .MuiInput-underline:after': { borderBottomColor: isFieldCorrect ? '#4caf50' : '#f44336' },
                        '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#666' },
                      }}
                      autoComplete="off"
                    />
                  );
                }
                return (
                  <KubeTypography
                    key={partIdx}
                    sx={{
                      fontFamily: '"Fira Code", "Courier New", monospace',
                      fontSize: '0.9rem',
                      whiteSpace: 'pre',
                      color: '#d4d4d4',
                      lineHeight: 1.5
                    }}
                  >
                    {part}
                  </KubeTypography>
                );
              })}
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Box sx={{ mt: 6, mb: 4 }}>
      <Divider sx={{ mb: 4 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <KubeTypography variant="h5" weight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          💻 Esercizio di Coding: {exercise.title}
        </KubeTypography>
        <IconButton onClick={() => setShowHint(!showHint)} color="primary" size="small" sx={{ bgcolor: showHint ? '#326ce515' : 'transparent' }}>
          <Lightbulb fontSize="small" />
        </IconButton>
      </Box>

      {showHint && (
        <Alert severity="info" icon={<HelpOutline fontSize="small" />} sx={{ mb: 2, borderRadius: 3, border: '1px solid #326ce520' }}>
          <KubeTypography variant="body2">{exercise.hint}</KubeTypography>
        </Alert>
      )}

      {renderCode()}

      <Box sx={{ mt: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
        <KubeButton
          variant="contained"
          onClick={checkAnswers}
          disabled={submitted && isCorrect}
          sx={{ minWidth: 160 }}
        >
          Verifica Soluzione
        </KubeButton>
        {submitted && isCorrect && (
          <KubeTypography sx={{ color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
            <CheckCircle fontSize="small" /> Ottimo lavoro!
          </KubeTypography>
        )}
        {submitted && !isCorrect && (
          <KubeTypography sx={{ color: '#d32f2f', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
            <Error fontSize="small" /> Qualcosa non va. Riprova!
          </KubeTypography>
        )}
      </Box>

      {submitted && !isCorrect && (
        <Alert severity="warning" sx={{ mt: 3, borderRadius: 3, border: '1px solid #ed6c0230' }}>
          Controlla bene le istruzioni e la sintassi. Assicurati di aver rispettato maiuscole e minuscole dove necessario.
        </Alert>
      )}
    </Box>
  );
};

export default CodingExercise;
