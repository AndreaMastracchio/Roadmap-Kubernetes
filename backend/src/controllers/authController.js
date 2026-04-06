const bcrypt = require('bcryptjs');
const db = require('../config/db');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Tutti i campi sono obbligatori' });
  }

  try {
    // Verifica se l'utente esiste già
    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'Email già registrata' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Inserisci utente
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const newUser = { id: result.insertId, name, email, avatar_url: null };

    // Inizializza sessione
    req.session.user = newUser;

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error(error);
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

    const userData = { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url };
    req.session.user = userData;

    res.json({ success: true, user: userData });
  } catch (error) {
    console.error(error);
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
    const userId = req.session.user.id;

    // Recupera acquisti
    const [purchases] = await db.query('SELECT course_id FROM user_purchases WHERE user_id = ?', [userId]);
    const purchasedProjects = purchases.map(p => p.course_id);

    // Recupera progressi
    const [progress] = await db.query('SELECT module_key FROM user_progress WHERE user_id = ?', [userId]);
    const completedModules = progress.map(p => p.module_key);

    // Recupera ultimo modulo per corso
    const [status] = await db.query('SELECT course_id, last_module_id FROM user_course_status WHERE user_id = ?', [userId]);
    const lastVisitedModules = {};
    status.forEach(s => {
      lastVisitedModules[s.course_id] = s.last_module_id;
    });

    res.json({
      success: true,
      user: {
        ...req.session.user,
        purchasedProjects,
        completedModules,
        lastVisitedModules
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Errore recupero profilo' });
  }
};
