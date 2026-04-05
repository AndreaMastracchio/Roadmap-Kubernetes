import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, InputBase, Fade, IconButton } from '@mui/material';
import { Terminal as TerminalIcon, Close as CloseIcon } from '@mui/icons-material';
import KubeTypography from '../ui/KubeTypography';

const API_BASE = 'http://localhost:5005/api';

const TerminalConsole = ({ courses, onClose }) => {
  const [history, setHistory] = useState([
    { type: 'info', content: 'Benvenuto nella KubeStudy Interactive Console!' },
    { type: 'info', content: 'Digita "help" per vedere i comandi disponibili.' }
  ]);
  const [input, setInput] = useState('');
  const [currentCourse, setCurrentCourse] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleAutocomplete = () => {
    if (currentQuestion) return;

    const parts = input.split(' ');
    const baseCommands = ['help', 'list', 'use', 'clear', 'exit'];

    if (parts.length === 1) {
      const commandPart = parts[0].toLowerCase();
      const matches = baseCommands.filter(c => c.startsWith(commandPart));

      if (matches.length === 1) {
        setInput(matches[0] + ' ');
      } else if (matches.length > 1) {
        setHistory(prev => [...prev, { type: 'info', content: matches.join('  ') }]);
      }
    } else if (parts[0].toLowerCase() === 'use') {
      const argPart = parts[1] ? parts[1].toLowerCase() : '';
      const availableCourses = courses.filter(c => !c.comingSoon);
      const matches = availableCourses.filter(c => c.id.toLowerCase().startsWith(argPart));

      if (matches.length === 1) {
        setInput(`use ${matches[0].id}`);
      } else if (matches.length > 1) {
        setHistory(prev => [...prev, { type: 'info', content: matches.map(m => m.id).join('  ') }]);
      }
    }
  };

  const handleCommand = async (cmd) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    setHistory(prev => [...prev, { type: 'input', content: `$ ${cmd}` }]);

    if (currentQuestion) {
      checkAnswer(cmd);
      setInput('');
      return;
    }

    if (trimmedCmd === 'help') {
      setHistory(prev => [...prev, { type: 'info', content: 'Comandi disponibili:\n- list: Mostra i corsi disponibili\n- use <id>: Seleziona un corso\n- clear: Pulisce la console\n- exit: Chiudi la console' }]);
    } else if (trimmedCmd === 'list') {
      const availableCourses = courses.filter(c => !c.comingSoon);
      const courseList = availableCourses.map(c => `- ${c.id}: ${c.title}`).join('\n');
      setHistory(prev => [...prev, { type: 'info', content: `Corsi disponibili:\n${courseList}` }]);
    } else if (trimmedCmd.startsWith('use ')) {
      const courseId = trimmedCmd.split(' ')[1];
      const course = courses.find(c => c.id === courseId && !c.comingSoon);
      if (course) {
        setHistory(prev => [...prev, { type: 'success', content: `Corso "${course.title}" selezionato. Caricamento domande...` }]);
        await loadCourseQuestions(course);
      } else {
        setHistory(prev => [...prev, { type: 'error', content: `Corso "${courseId}" non trovato o non disponibile. Digita "list" per vedere gli ID validi.` }]);
      }
    } else if (trimmedCmd === 'clear') {
      setHistory([]);
    } else if (trimmedCmd === 'exit') {
      onClose();
    } else if (trimmedCmd === '') {
      // Do nothing
    } else {
      setHistory(prev => [...prev, { type: 'error', content: `Comando sconosciuto: ${trimmedCmd}. Digita "help" per assistenza.` }]);
    }

    setInput('');
  };

  const loadCourseQuestions = async (course) => {
    let questions = [];
    for (const mod of course.modules) {
      try {
        const res = await fetch(`${API_BASE}/modules/${mod.id}/data`);
        if (res.ok) {
          const data = await res.json();
          const moduleExercises = Array.isArray(data)
            ? data.filter(item => item.type === 'coding')
            : (data.exercises || []);

          questions = [...questions, ...moduleExercises.map(ex => ({ ...ex, moduleTitle: mod.title }))];
        }
      } catch (e) {
        console.error(`Errore nel caricamento del modulo ${mod.id}`, e);
      }
    }

    if (questions.length > 0) {
      setAllQuestions(questions);
      setCurrentCourse(course);
      askNextQuestion(questions);
    } else {
      setHistory(prev => [...prev, { type: 'error', content: 'Nessun comando trovato per questo corso.' }]);
    }
  };

  const askNextQuestion = (questionsList = allQuestions) => {
    if (questionsList.length === 0) {
      setHistory(prev => [...prev, { type: 'success', content: 'Ottimo lavoro! Hai completato tutti i comandi per questo corso.' }]);
      setHistory(prev => [...prev, { type: 'info', content: 'Digita "use <id>" per un altro corso o "exit" per uscire.' }]);
      setCurrentCourse(null);
      setCurrentQuestion(null);
      return;
    }

    const randomIndex = Math.floor(Math.random() * questionsList.length);
    const question = questionsList[randomIndex];

    // Mostriamo il template con i placeholder evidenziati
    let displayTemplate = question.template.join('\n');

    setHistory(prev => [...prev, {
      type: 'question',
      content: `\n--- PROSSIMA SFIDA ---`
    }]);
    setHistory(prev => [...prev, {
      type: 'info',
      content: `Modulo: ${question.moduleTitle}\nObiettivo: ${question.title}\nHint: ${question.hint}`
    }]);
    setHistory(prev => [...prev, {
      type: 'question',
      content: `Comando da completare:\n${displayTemplate}`
    }]);

    setCurrentQuestion(question);
    setAllQuestions(questionsList.filter((_, i) => i !== randomIndex));
  };

  const checkAnswer = (answer) => {
    if (answer.toLowerCase() === 'skip') {
      setHistory(prev => [...prev, { type: 'info', content: 'Domanda saltata.' }]);
      askNextQuestion();
      return;
    }

    if (answer.toLowerCase() === 'hint') {
      let hintMsg = `Suggerimento: ${currentQuestion.hint}`;

      if (currentQuestion.answers && currentQuestion.answers.length > 0) {
        const paramsInfo = currentQuestion.answers
          .map(a => `- {{${a.id}}}: es. ${a.accepted[0]}`)
          .join('\n');
        hintMsg += `\n\nParametri richiesti:\n${paramsInfo}`;
      }

      setHistory(prev => [...prev, { type: 'info', content: hintMsg }]);
      return;
    }

    const acceptedAnswers = currentQuestion.answers.map(a => a.accepted);
    const lowerAnswer = answer.toLowerCase();

    // Verifichiamo se l'utente ha inserito tutte le parti richieste
    const missingParts = [];
    acceptedAnswers.forEach((options, index) => {
      const found = options.some(opt => lowerAnswer.includes(opt.toLowerCase()));
      if (!found) {
        missingParts.push(currentQuestion.answers[index].id);
      }
    });

    if (missingParts.length === 0) {
      setHistory(prev => [...prev, { type: 'success', content: '✓ Eccellente! Comando corretto.' }]);
      askNextQuestion();
    } else {
      const missingHint = missingParts.map(p => `{{${p}}}`).join(', ');
      setHistory(prev => [...prev, { type: 'error', content: `✗ Non è del tutto corretto. Parametri mancanti o errati: ${missingHint}. Riprova o digita "hint".` }]);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2000,
        bgcolor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 1, md: 4 }
      }}
    >
      <Fade in={true} timeout={300}>
        <Paper
          elevation={24}
          sx={{
            width: '100%',
            maxWidth: '1000px',
            height: '80vh',
            bgcolor: '#1e1e1e',
            color: '#d4d4d4',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid #333'
          }}
        >
          {/* Header */}
          <Box sx={{ bgcolor: '#333', px: 2, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TerminalIcon fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                KubeStudy Terminal
              </Typography>
            </Box>
            <IconButton size="small" onClick={onClose} sx={{ color: '#aaa', '&:hover': { color: '#fff' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Terminal Output */}
          <Box
            ref={scrollRef}
            sx={{
              flexGrow: 1,
              p: 2,
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5
            }}
          >
            {history.map((line, i) => (
              <Box key={i} sx={{
                color: line.type === 'error' ? '#f44336' :
                       line.type === 'success' ? '#4caf50' :
                       line.type === 'question' ? '#2196f3' :
                       line.type === 'input' ? '#fff' : '#aaa',
                whiteSpace: 'pre-wrap'
              }}>
                {line.content}
              </Box>
            ))}
          </Box>

          {/* Terminal Input */}
          <Box sx={{ p: 2, borderTop: '1px solid #333', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontFamily: 'monospace', color: '#4caf50', fontWeight: 'bold' }}>$</Typography>
            <InputBase
              fullWidth
              autoFocus
              inputRef={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCommand(input);
                } else if (e.key === 'Tab') {
                  e.preventDefault();
                  handleAutocomplete();
                }
              }}
              sx={{
                color: '#fff',
                fontFamily: 'monospace',
                fontSize: '14px'
              }}
            />
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default TerminalConsole;
