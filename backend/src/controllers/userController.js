const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.purchaseCourse = async (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Login richiesto' });
  const { courseId } = req.body;
  const userId = req.session.user.id;

  try {
    await db.query(
      'INSERT IGNORE INTO user_purchases (user_id, course_id) VALUES (?, ?)',
      [userId, courseId]
    );

    // Aggiorna la sessione
    if (!req.session.user.purchasedProjects) req.session.user.purchasedProjects = [];
    if (!req.session.user.purchasedProjects.includes(courseId)) {
      req.session.user.purchasedProjects.push(courseId);
    }

    res.json({ success: true, message: 'Corso acquistato', user: req.session.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Errore durante l\'acquisto' });
  }
};

exports.completeModule = async (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Login richiesto' });
  const { moduleKey } = req.body;
  const userId = req.session.user.id;

  try {
    await db.query(
      'INSERT IGNORE INTO user_progress (user_id, module_key) VALUES (?, ?)',
      [userId, moduleKey]
    );

    // Aggiorna la sessione
    if (!req.session.user.completedModules) req.session.user.completedModules = [];
    if (!req.session.user.completedModules.includes(moduleKey)) {
      req.session.user.completedModules.push(moduleKey);
    }

    res.json({ success: true, message: 'Modulo completato', user: req.session.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Errore salvataggio progresso' });
  }
};

exports.updateCourseStatus = async (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Login richiesto' });
  const { courseId, lastModuleId } = req.body;
  const userId = req.session.user.id;

  try {
    await db.query(
      'INSERT INTO user_course_status (user_id, course_id, last_module_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE last_module_id = ?',
      [userId, courseId, lastModuleId, lastModuleId]
    );

    // Aggiorna la sessione
    if (!req.session.user.lastVisitedModules) req.session.user.lastVisitedModules = {};
    req.session.user.lastVisitedModules[courseId] = lastModuleId;

    res.json({ success: true, message: 'Stato corso aggiornato', user: req.session.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Errore aggiornamento stato corso' });
  }
};

exports.updateProfile = async (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Login richiesto' });
  const { name } = req.body;
  const userId = req.session.user.id;

  try {
    await db.query('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
    req.session.user.name = name;
    res.json({ success: true, message: 'Profilo aggiornato', user: req.session.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Errore aggiornamento profilo' });
  }
};

exports.changePassword = async (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Login richiesto' });
  const { oldPassword, newPassword } = req.body;
  const userId = req.session.user.id;

  try {
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Utente non trovato' });

    const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Vecchia password errata' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

    res.json({ success: true, message: 'Password aggiornata con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Errore durante il cambio password' });
  }
};

exports.uploadAvatar = async (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Login richiesto' });
  if (!req.file) return res.status(400).json({ success: false, message: 'Nessun file caricato' });

  const userId = req.session.user.id;
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;

  try {
    await db.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, userId]);
    req.session.user.avatar_url = avatarUrl;
    res.json({ success: true, message: 'Avatar aggiornato', avatarUrl, user: req.session.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Errore durante l\'aggiornamento dell\'avatar' });
  }
};
