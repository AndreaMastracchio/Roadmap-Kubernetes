const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redisClient = require('./config/redis');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5005;

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Servire file statici (avatar)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Sessioni con Redis
app.use(
  session({
    store: new RedisStore({
      client: redisClient,
      prefix: 'kubesess:',
    }),
    name: 'kubesid',
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 giorni
      sameSite: 'lax', // Importante per cookie in cross-origin locale (8080 <-> 5005)
    },
  })
);

// Funzione helper per risolvere il path dei moduli (public o private)
async function getModulesPath(courseId = 'k8s-fondamentali') {
  const publicDir = '/project_public';
  const privateDir = '/project_private';

  // Proviamo a vedere se il corso è in public
  let fullPath = path.join(publicDir, courseId);
  try {
    await fs.access(fullPath);
    return fullPath;
  } catch (e) {
    // Se non è in public, proviamo in private
    fullPath = path.join(privateDir, courseId);
    try {
      await fs.access(fullPath);
      return fullPath;
    } catch (e2) {
      // Fallback per sviluppo locale senza Docker
      return path.join(__dirname, '../../project_public', courseId);
    }
  }
}

// Rotte API
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Route per servire i moduli in base al corso e modulo
app.get('/api/modules/:courseId/:moduleId', async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const modulesPath = await getModulesPath(courseId);

    // Mapping dei moduli ai loro percorsi
    const moduleMap = {
      'intro': 'README.md',
      '01': '01-fondamentali/README.md',
      '02': '02-architettura/README.md',
      '03': '03-risorse-base/README.md',
      '04': '04-networking/README.md',
      '05': '05-storage/README.md',
      '06': '06-sicurezza/README.md',
      '07': '07-helm/README.md',
      '08': '08-operatori-go/README.md',
      '09': '09-comandi-utili/README.md',
      '10': '10-esame-finale/README.md'
    };

    let filePath = moduleMap[moduleId];
    
    // Se non è nella mappa fissa, proviamo a usare l'ID come percorso cartella
    if (!filePath && moduleId !== 'intro') {
      filePath = path.join(moduleId, 'README.md');
    }

    if (!filePath) {
      return res.status(404).json({ error: 'Modulo non trovato' });
    }

    const fullPath = path.join(modulesPath, filePath);
    const content = await fs.readFile(fullPath, 'utf-8');

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(content);
  } catch (error) {
    console.error('Errore lettura modulo:', error);
    res.status(500).json({ error: 'Errore nel caricamento del modulo' });
  }
});

// Route per servire i JSON dei quiz/esercizi in base al corso e modulo
app.get('/api/modules/:courseId/:moduleId/data', async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const modulesPath = await getModulesPath(courseId);

    const moduleMap = {
      '01': '01-fondamentali/exercises.json',
      '02': '02-architettura/exercises.json',
      '03': '03-risorse-base/exercises.json',
      '04': '04-networking/exercises.json',
      '05': '05-storage/exercises.json',
      '06': '06-sicurezza/exercises.json',
      '07': '07-helm/exercises.json',
      '08': '08-operatori-go/exercises.json',
      '09': '09-comandi-utili/exercises.json',
      '10': '10-esame-finale/exercises.json'
    };

    let filePath = moduleMap[moduleId];

    // Se non è nella mappa fissa, proviamo a usare l'ID come percorso cartella
    if (!filePath) {
      filePath = path.join(moduleId, 'exercises.json');
    }

    const fullPath = path.join(modulesPath, filePath);
    const content = await fs.readFile(fullPath, 'utf-8');
    res.json(JSON.parse(content));
  } catch (error) {
    console.error('Errore lettura JSON modulo:', error);
    res.json({ quiz: [], exercises: [] });
  }
});

// Route temporanea per health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Avvio server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
