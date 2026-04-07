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

    const filePath = path.join(courseDir, moduleFolder, 'exercises.json');
    const content = await fs.readFile(filePath, 'utf-8');
    res.json(JSON.parse(content));
  } catch (error) {
    res.json({ quiz: [], exercises: [] });
  }
};
