const app = require('./src/app');
const { env } = require('./src/config/env');
const { connectDB } = require('./src/config/db');

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});


const start = async () => {
  await connectDB();

  const server = app.listen(env.PORT || 5003, () => {
    console.log(`[server] WizJobAI API running on port ${env.PORT || 5003} in ${env.NODE_ENV || 'development'} mode`);
  });

  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down...', err);
    server.close(() => process.exit(1));
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => process.exit(0));
  });
};

start();
