const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function loadUserData(userId) {
  const [[user]] = await db.query('SELECT id, name, email, avatar_url FROM users WHERE id = ?', [userId]);
  if (!user) return null;

  const [progress] = await db.query('SELECT module_key FROM user_progress WHERE user_id = ?', [userId]);
  const completedModules = progress.map(p => p.module_key);

  const [status] = await db.query('SELECT course_id, last_module_id FROM user_course_status WHERE user_id = ?', [userId]);
  const lastVisitedModules = {};
  status.forEach(s => {
    lastVisitedModules[s.course_id] = s.last_module_id;
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url,
    completedModules,
    lastVisitedModules
  };
}

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Nome, email e password sono obbligatori' });
  }
  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'La password deve avere almeno 8 caratteri' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email già registrata' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const userData = await loadUserData(result.insertId);
    req.session.user = userData;
    res.status(201).json({ success: true, user: userData });
  } catch (error) {
    console.error('Errore registrazione:', error);
    res.status(500).json({ success: false, message: 'Errore durante la registrazione' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email e password sono obbligatorie' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Credenziali non valide' });
    }

    const userData = await loadUserData(user.id);
    req.session.user = userData;
    res.json({ success: true, user: userData });
  } catch (error) {
    console.error('Errore login:', error);
    res.status(500).json({ success: false, message: 'Errore durante il login' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Errore durante il logout' });
    }
    res.clearCookie('kubesid');
    res.json({ success: true, message: 'Logout effettuato' });
  });
};

exports.getMe = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Non autenticato' });
  }

  try {
    const userData = await loadUserData(req.session.user.id);
    if (!userData) {
      return res.status(401).json({ success: false, message: 'Non autenticato' });
    }
    req.session.user = userData;
    res.json({ success: true, user: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Errore recupero profilo' });
  }
};
