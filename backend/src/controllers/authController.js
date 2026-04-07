const bcrypt = require('bcryptjs');
const db = require('../config/db');
const otpService = require('../services/otpService');
const redisClient = require('../config/redis');

exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ success: false, message: 'Tutti i campi (incluso telefono) sono obbligatori' });
  }

  try {
    // Verifica se l'utente esiste già nel DB (per email o telefono)
    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ? OR phone = ?', [email, phone]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'Email o telefono già registrati' });
    }

    // Genera OTP e salva i dati utente temporaneamente in Redis
    const otp = otpService.generateOTP();
    const hashedPassword = await bcrypt.hash(password, 12);

    const pendingUser = { name, email, password: hashedPassword, phone };
    await redisClient.set(`pending_user:${phone}`, JSON.stringify(pendingUser), 'EX', 600); // 10 minuti

    await otpService.saveOTP(phone, otp);
    const isMock = await otpService.sendOTP(phone, otp);

    res.status(200).json({
      success: true,
      message: isMock ? 'OTP generato (Ambiente Sviluppo)' : 'OTP inviato al numero di telefono',
      requiresOTP: true,
      phone,
      otp: isMock ? otp : undefined // Solo in modalità mock per facilitare il test
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Errore durante l\'invio dell\'OTP' });
  }
};

exports.verifyOTP = async (req, res) => {
  const { phone, otp, type } = req.body; // type: 'register' o 'login'

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Telefono e OTP sono obbligatori' });
  }

  try {
    const isValid = await otpService.verifyOTP(phone, otp);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'OTP non valido o scaduto' });
    }

    if (type === 'register') {
      const userDataStr = await redisClient.get(`pending_user:${phone}`);
      if (!userDataStr) {
        return res.status(400).json({ success: false, message: 'Dati di registrazione non trovati. Riprova la registrazione.' });
      }

      const { name, email, password } = JSON.parse(userDataStr);

      // Salva nel DB
      const [result] = await db.query(
        'INSERT INTO users (name, email, password, phone, is_phone_verified) VALUES (?, ?, ?, ?, true)',
        [name, email, password, phone]
      );

      const newUser = {
        id: result.insertId,
        name,
        email,
        phone,
        avatar_url: null,
        purchasedProjects: [],
        completedModules: [],
        lastVisitedModules: {}
      };

      await redisClient.del(`pending_user:${phone}`);
      req.session.user = newUser;
      return res.status(201).json({ success: true, user: newUser });

    } else {
      // Login flow
      const userIdStr = await redisClient.get(`pending_auth:${phone}`);
      if (!userIdStr) {
        return res.status(400).json({ success: false, message: 'Sessione di login scaduta. Riprova.' });
      }

      const [[user]] = await db.query('SELECT * FROM users WHERE id = ?', [parseInt(userIdStr)]);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Utente non trovato' });
      }

      // Recupera acquisti
      const [purchased] = await db.query('SELECT course_id FROM user_purchases WHERE user_id = ?', [user.id]);
      const purchasedProjects = purchased.map(p => p.course_id);

      // Recupera progressi
      const [progress] = await db.query('SELECT module_key FROM user_progress WHERE user_id = ?', [user.id]);
      const completedModules = progress.map(p => p.module_key);

      // Recupera stato corsi (ultimo modulo visitato)
      const [status] = await db.query('SELECT course_id, last_module_id FROM user_course_status WHERE user_id = ?', [user.id]);
      const lastVisitedModules = {};
      status.forEach(s => {
        lastVisitedModules[s.course_id] = s.last_module_id;
      });

      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
        purchasedProjects,
        completedModules,
        lastVisitedModules
      };

      await redisClient.del(`pending_auth:${phone}`);
      req.session.user = userData;
      return res.json({ success: true, user: userData });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Errore durante la verifica dell\'OTP' });
  }
};

exports.resendOTP = async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Telefono obbligatorio' });
  }

  try {
    const otp = otpService.generateOTP();
    await otpService.saveOTP(phone, otp);
    const isMock = await otpService.sendOTP(phone, otp);
    res.json({
      success: true,
      message: isMock ? 'Nuovo OTP generato (Sviluppo)' : 'Nuovo OTP inviato',
      otp: isMock ? otp : undefined
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Errore durante l\'invio del nuovo OTP' });
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

    // Se l'utente non ha ancora verificato il telefono
    if (!user.is_phone_verified) {
      const otp = otpService.generateOTP();
      await otpService.saveOTP(user.phone, otp);
      const isMock = await otpService.sendOTP(user.phone, otp);
      return res.status(200).json({
        success: true,
        message: isMock ? 'Telefono non verificato. OTP generato.' : 'Telefono non verificato. OTP inviato.',
        requiresOTP: true,
        phone: user.phone,
        otp: isMock ? otp : undefined
      });
    }

    // Invia OTP per 2FA al login
    const otp = otpService.generateOTP();
    await otpService.saveOTP(user.phone, otp);
    const isMock = await otpService.sendOTP(user.phone, otp);

    // Salva il tentativo di login in Redis
    await redisClient.set(`pending_auth:${user.phone}`, user.id.toString(), 'EX', 600); // 10 minuti

    res.json({
      success: true,
      message: isMock ? 'OTP 2FA generato (Sviluppo)' : 'OTP per 2FA inviato al numero di telefono',
      requiresOTP: true,
      phone: user.phone,
      otp: isMock ? otp : undefined
    });
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
