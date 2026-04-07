const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redisClient = require('./config/redis');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5005;

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const courseRoutes = require('./routes/courseRoutes');

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

// Rotte API
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/courses', courseRoutes);

// Route temporanea per health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Avvio server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
