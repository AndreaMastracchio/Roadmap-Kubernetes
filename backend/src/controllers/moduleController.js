const path = require('path');
const fs = require('fs').promises;

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
    const courseDir = await getCourseDir(courseId);

    if (!courseDir) {
      return res.status(404).json({ error: 'Corso non trovato' });
    }

    const moduleFolder = await resolveModulePath(courseDir, moduleId);
    if (!moduleFolder) {
      return res.status(404).json({ error: 'Modulo non trovato' });
    }

    const filePath = moduleId === 'intro'
      ? path.join(courseDir, 'README.md')
      : path.join(courseDir, moduleFolder, 'README.md');

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
    const courseDir = await getCourseDir(courseId);

    if (!courseDir) {
      return res.json({ quiz: [], exercises: [] });
    }

    const moduleFolder = await resolveModulePath(courseDir, moduleId);
    if (!moduleFolder || moduleId === 'intro') {
      return res.json({ quiz: [], exercises: [] });
    }

    const results = { quiz: [], exercises: [] };

    // Tenta di leggere exercises.json (poteva contenere entrambi o solo esercizi)
    try {
      const exPath = path.join(courseDir, moduleFolder, 'exercises.json');
      const exContent = await fs.readFile(exPath, 'utf-8');
      const exData = JSON.parse(exContent);

      if (Array.isArray(exData)) {
        results.exercises = exData;
      } else {
        if (exData.quiz) results.quiz = exData.quiz;
        if (exData.exercises) results.exercises = exData.exercises;
      }
    } catch (e) {}

    // Tenta di leggere quiz.json (se presente separatamente)
    try {
      const qzPath = path.join(courseDir, moduleFolder, 'quiz.json');
      const qzContent = await fs.readFile(qzPath, 'utf-8');
      const qzData = JSON.parse(qzContent);

      const newQuiz = Array.isArray(qzData) ? qzData : (qzData.quiz || []);
      // Evitiamo duplicati se quiz era già in exercises.json (anche se raro)
      const existingQuestions = new Set(results.quiz.map(q => q.question));
      newQuiz.forEach(q => {
        if (!existingQuestions.has(q.question)) {
          results.quiz.push(q);
        }
      });
    } catch (e) {}

    res.json(results);
  } catch (error) {
    console.error('Errore lettura dati modulo:', error);
    res.json({ quiz: [], exercises: [] });
  }
};
