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

function localizeCourse(course, lang) {
  return {
    ...course,
    title: resolveLocalizedField(course.title, lang),
    description: resolveLocalizedField(course.description, lang),
    duration: resolveLocalizedField(course.duration, lang),
    modules: course.modules?.map(m => ({
      ...m,
      title: resolveLocalizedField(m.title, lang)
    })) || []
  };
}

exports.getAllCourses = async (req, res) => {
  try {
    const lang = getLang(req);
    const publicDir = '/project_public';
    const privateDir = '/project_private';
    const localDir = path.join(__dirname, '../../project_public');

    let targetDir = publicDir;
    try {
      await fs.access(targetDir);
    } catch (e) {
      targetDir = localDir;
    }

    const folders = await fs.readdir(targetDir);
    const courses = [];

    for (const folder of folders) {
      const courseJsonPath = path.join(targetDir, folder, 'course.json');
      try {
        await fs.access(courseJsonPath);
        const data = await fs.readFile(courseJsonPath, 'utf-8');
        const course = JSON.parse(data);
        courses.push(localizeCourse(course, lang));
      } catch (e) {}
    }

    let privDir = privateDir;
    try {
      await fs.access(privDir);
      const privFolders = await fs.readdir(privDir);
      for (const folder of privFolders) {
        const courseJsonPath = path.join(privDir, folder, 'course.json');
        try {
          await fs.access(courseJsonPath);
          const data = await fs.readFile(courseJsonPath, 'utf-8');
          const course = JSON.parse(data);
          courses.push(localizeCourse(course, lang));
        } catch (e) {}
      }
    } catch (e) {}

    res.json(courses);
  } catch (error) {
    console.error('Errore caricamento corsi:', error);
    res.status(500).json({ error: 'Errore nel caricamento dei corsi' });
  }
};
