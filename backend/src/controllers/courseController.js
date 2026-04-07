const path = require('path');
const fs = require('fs').promises;

exports.getAllCourses = async (req, res) => {
  try {
    const publicDir = '/project_public';
    const privateDir = '/project_private';
    const localDir = path.join(__dirname, '../../project_public');

    // Proviamo a determinare quale directory usare
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

        // Se l'utente non ha accesso ai corsi privati e il corso lo è, lo gestiamo
        // (La logica di acquisto rimane nel frontend/AuthContext)
        courses.push(course);
      } catch (e) {
        // Se non c'è course.json, saltiamo la cartella
      }
    }

    // Aggiungiamo anche i corsi in private se disponibili
    let privDir = privateDir;
    try {
      await fs.access(privDir);
      const privFolders = await fs.readdir(privDir);
      for (const folder of privFolders) {
        const courseJsonPath = path.join(privDir, folder, 'course.json');
        try {
          await fs.access(courseJsonPath);
          const data = await fs.readFile(courseJsonPath, 'utf-8');
          courses.push(JSON.parse(data));
        } catch (e) {}
      }
    } catch (e) {}

    res.json(courses);
  } catch (error) {
    console.error('Errore caricamento corsi:', error);
    res.status(500).json({ error: 'Errore nel caricamento dei corsi' });
  }
};
