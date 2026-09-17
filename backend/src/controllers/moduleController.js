const path = require('path');
const fs = require('fs').promises;

const SUPPORTED_LANGS = ['it', 'en', 'es', 'fr', 'de', 'pt'];
const DEFAULT_LANG = 'it';

function getLang(req) {
  const lang = req.query.lang || DEFAULT_LANG;
  return SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
}

function resolveLocalizedField(field, lang) {
  if (!field || typeof field !== 'object') return field;
  if (field[lang]) return field[lang];
  if (field[DEFAULT_LANG]) return field[DEFAULT_LANG];
  return Object.values(field)[0] || '';
}

function localizeQuiz(items, lang) {
  return items.map(item => ({
    ...item,
    question: resolveLocalizedField(item.question, lang),
    options: Array.isArray(item.options)
      ? item.options.map(o => resolveLocalizedField(o, lang))
      : item.options,
    explanation: resolveLocalizedField(item.explanation, lang)
  }));
}

function localizeExercises(items, lang) {
  return items.map(item => ({
    ...item,
    title: resolveLocalizedField(item.title, lang),
    hint: resolveLocalizedField(item.hint, lang),
    description: resolveLocalizedField(item.description, lang)
  }));
}

// Helper per trovare il path reale di un modulo (es. "01" -> "01-fondamentali")
async function resolveModulePath(courseDir, moduleId) {
  if (moduleId === 'intro') return 'README.md';

  try {
    const files = await fs.readdir(courseDir);
    const folder = files.find(f => f.startsWith(moduleId + '-') || f === moduleId);
    return folder || null;
  } catch (e) {
    return null;
  }
}

async function getCourseDir(courseId) {
  const publicDir = '/project_public';
  const privateDir = '/project_private';
  const localDir = path.join(__dirname, '../../project_public');

  const paths = [
    path.join(publicDir, courseId),
    path.join(privateDir, courseId),
    path.join(localDir, courseId)
  ];

  for (const p of paths) {
    try {
      await fs.access(p);
      return p;
    } catch (e) {}
  }
  return null;
}

exports.getModuleContent = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const lang = getLang(req);
    const courseDir = await getCourseDir(courseId);

    if (!courseDir) {
      return res.status(404).json({ error: 'Corso non trovato' });
    }

    const moduleFolder = await resolveModulePath(courseDir, moduleId);
    if (!moduleFolder) {
      return res.status(404).json({ error: 'Modulo non trovato' });
    }

    const moduleDir = moduleId === 'intro'
      ? courseDir
      : path.join(courseDir, moduleFolder);

    // Try localized README first, fallback to default
    const localizedPath = path.join(moduleDir, `README.${lang}.md`);
    const fallbackPath = path.join(moduleDir, 'README.md');

    let filePath;
    try {
      await fs.access(localizedPath);
      filePath = localizedPath;
    } catch {
      filePath = fallbackPath;
    }

    const content = await fs.readFile(filePath, 'utf-8');
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(content);
  } catch (error) {
    console.error('Errore lettura modulo:', error);
    res.status(500).json({ error: 'Errore nel caricamento del modulo' });
  }
};

exports.getModuleData = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const lang = getLang(req);
    const courseDir = await getCourseDir(courseId);

    if (!courseDir) {
      return res.json({ quiz: [], exercises: [] });
    }

    const moduleFolder = await resolveModulePath(courseDir, moduleId);
    if (!moduleFolder || moduleId === 'intro') {
      return res.json({ quiz: [], exercises: [] });
    }

    const results = { quiz: [], exercises: [] };

    // Tenta di leggere exercises.json
    try {
      const exPath = path.join(courseDir, moduleFolder, 'exercises.json');
      const exContent = await fs.readFile(exPath, 'utf-8');
      const exData = JSON.parse(exContent);

      let exercises = [];
      if (Array.isArray(exData)) {
        exercises = exData;
      } else {
        if (exData.quiz) results.quiz = exData.quiz;
        if (exData.exercises) exercises = exData.exercises;
      }
      results.exercises = localizeExercises(exercises, lang);
    } catch (e) {}

    // Tenta di leggere quiz.json
    try {
      const qzPath = path.join(courseDir, moduleFolder, 'quiz.json');
      const qzContent = await fs.readFile(qzPath, 'utf-8');
      const qzData = JSON.parse(qzContent);

      const newQuiz = Array.isArray(qzData) ? qzData : (qzData.quiz || []);
      const existingQuestions = new Set(results.quiz.map(q =>
        typeof q.question === 'object' ? q.question[DEFAULT_LANG] : q.question
      ));
      newQuiz.forEach(q => {
        const key = typeof q.question === 'object' ? q.question[DEFAULT_LANG] : q.question;
        if (!existingQuestions.has(key)) {
          results.quiz.push(q);
        }
      });
      results.quiz = localizeQuiz(results.quiz, lang);
    } catch (e) {}

    res.json(results);
  } catch (error) {
    console.error('Errore lettura dati modulo:', error);
    res.json({ quiz: [], exercises: [] });
  }
};
