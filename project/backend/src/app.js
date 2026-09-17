const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');

const { env } = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiters');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const botRoutes = require('./routes/botRoutes');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

// Define allowed origins for local development and your Vercel deployment
const allowedOrigins = [
  'http://localhost:3000',
  env.CLIENT_URL
].filter(Boolean); // Removes undefined values if CLIENT_URL isn't set yet

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman, mobile apps, or curl)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error('Not allowed by CORS policy'));
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Gzip/deflate response bodies - cheap win for JSON payload size and
// perceived API latency, especially on job-listing/dashboard endpoints.
app.use(compression());

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());

if (!env.isTest) {
  app.use(morgan(env.isProd ? 'combined' : 'dev'));
}

app.use('/api', apiLimiter);

// 1. Root Route (Fixes Render's GET / 404 health check)
app.get('/', (_req, res) => {
  res.status(200).json({ success: true, message: 'WizJobAI API is running successfully.' });
});

// 2. Health Check Route
app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'WizJobAI API is healthy.', env: env.NODE_ENV });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/bots', botRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;