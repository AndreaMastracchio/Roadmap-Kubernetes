const db = require('../config/db');

exports.purchaseCourse = async (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Login richiesto' });
  const { courseId } = req.body;
  const userId = req.session.user.id;

  try {
    await db.query(
      'INSERT IGNORE INTO user_purchases (user_id, course_id) VALUES (?, ?)',
      [userId, courseId]
    );
    res.json({ success: true, message: 'Corso acquistato' });
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
    res.json({ success: true, message: 'Modulo completato' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Errore salvataggio progresso' });
  }
};

exports.updateProfile = async (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Login richiesto' });
  const { name } = req.body;
  const userId = req.session.user.id;

  try {
    await db.query('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
    req.session.user.name = name;
    res.json({ success: true, message: 'Profilo aggiornato' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Errore aggiornamento profilo' });
  }
};
