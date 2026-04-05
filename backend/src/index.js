const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const Redis = require('ioredis');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Configurazione Redis
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

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

// Sessioni con Redis
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    name: 'kubesid',
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 giorni
    },
  })
);

// Rotte API
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Route per servire i moduli da project_public/k8s-fondamentali
app.get('/api/modules/:moduleId', async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    // In Docker usiamo il mount point fisso, in locale usiamo il path relativo
    let baseDir = '/project_public';
    try {
      await fs.access(baseDir);
    } catch (e) {
      baseDir = path.join(__dirname, '../../project_public');
    }
    const modulesPath = path.join(baseDir, 'k8s-fondamentali');

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

    const filePath = moduleMap[moduleId];
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

// Route per servire i JSON dei quiz/esercizi
app.get('/api/modules/:moduleId/data', async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    // In Docker usiamo il mount point fisso, in locale usiamo il path relativo
    let baseDir = '/project_public';
    try {
      await fs.access(baseDir);
    } catch (e) {
      baseDir = path.join(__dirname, '../../project_public');
    }
    const modulesPath = path.join(baseDir, 'k8s-fondamentali');

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

    const filePath = moduleMap[moduleId];
    if (!filePath) {
      return res.json({ quiz: [], exercises: [] });
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
