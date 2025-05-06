
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import * as mysql from './mysql.js';
import * as email from './email.js';
import { createLogger } from './logger.js';

// Get the directory name correctly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment variables from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env file found, using default environment variables');
  dotenv.config();
}

const app = express();
const port = process.env.PORT || 3000;
const logger = createLogger('server');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, '../dist')));

// MySQL API endpoints
app.post('/api/mysql/connect', async (req, res) => {
  try {
    const result = await mysql.connectToDatabase(req.body);
    res.json(result);
  } catch (error) {
    logger.error('Error connecting to database:', error);
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/mysql/test-connection', async (req, res) => {
  try {
    const result = await mysql.testConnection(req.body);
    res.json(result);
  } catch (error) {
    logger.error('Error testing connection:', error);
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/mysql/disconnect', async (req, res) => {
  try {
    const result = await mysql.disconnect();
    res.json(result);
  } catch (error) {
    logger.error('Error disconnecting:', error);
    res.json({ success: false, error: error.message });
  }
});

// Equipment endpoints
app.post('/api/mysql/save-equipment', async (req, res) => {
  try {
    const result = await mysql.saveEquipment(req.body.config, req.body.equipment);
    res.json(result);
  } catch (error) {
    logger.error('Error saving equipment:', error);
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/mysql/get-equipment', async (req, res) => {
  try {
    const result = await mysql.getEquipment(req.body);
    res.json(result);
  } catch (error) {
    logger.error('Error getting equipment:', error);
    res.json({ success: false, error: error.message });
  }
});

// Exercise endpoints
app.post('/api/mysql/save-exercises', async (req, res) => {
  try {
    const result = await mysql.saveExercises(req.body.config, req.body.exercises);
    res.json(result);
  } catch (error) {
    logger.error('Error saving exercises:', error);
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/mysql/get-exercises', async (req, res) => {
  try {
    const result = await mysql.getExercises(req.body);
    res.json(result);
  } catch (error) {
    logger.error('Error getting exercises:', error);
    res.json({ success: false, error: error.message });
  }
});

// Routine endpoints
app.post('/api/mysql/save-routines', async (req, res) => {
  try {
    const result = await mysql.saveRoutines(req.body.config, req.body.routines);
    res.json(result);
  } catch (error) {
    logger.error('Error saving routines:', error);
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/mysql/get-routines', async (req, res) => {
  try {
    const result = await mysql.getRoutines(req.body);
    res.json(result);
  } catch (error) {
    logger.error('Error getting routines:', error);
    res.json({ success: false, error: error.message });
  }
});

// User profile endpoints
app.post('/api/mysql/save-user-profile', async (req, res) => {
  try {
    const result = await mysql.saveUserProfile(req.body.config, req.body.profile);
    res.json(result);
  } catch (error) {
    logger.error('Error saving user profile:', error);
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/mysql/get-user-profile', async (req, res) => {
  try {
    const result = await mysql.getUserProfile(req.body.config, req.body.email);
    res.json(result);
  } catch (error) {
    logger.error('Error getting user profile:', error);
    res.json({ success: false, error: error.message });
  }
});

// Email API endpoints
app.post('/api/email/test-connection', async (req, res) => {
  try {
    const result = await email.testEmailConnection(req.body);
    res.json(result);
  } catch (error) {
    logger.error('Error testing email connection:', error);
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/email/send', async (req, res) => {
  try {
    const { config, to, subject, body } = req.body;
    const result = await email.sendEmail(config, to, subject, body);
    res.json(result);
  } catch (error) {
    logger.error('Error sending email:', error);
    res.json({ success: false, error: error.message });
  }
});

// Add an endpoint to get environment variables
app.get('/api/env', (req, res) => {
  // Only return non-sensitive environment variables
  const safeEnv = {
    MYSQL_HOST: process.env.MYSQL_HOST,
    MYSQL_PORT: process.env.MYSQL_PORT,
    MYSQL_DATABASE: process.env.MYSQL_DATABASE,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    FROM_EMAIL: process.env.FROM_EMAIL,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_SECURE_TYPE: process.env.SMTP_SECURE_TYPE,
    APP_NAME: process.env.APP_NAME,
    DEBUG_MODE: process.env.DEBUG_MODE
  };
  
  res.json({ success: true, env: safeEnv });
});

// Catch-all handler for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start the server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Log MySQL connection info (without password)
  if (process.env.MYSQL_HOST) {
    logger.info(`MySQL configured: ${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT || '3306'}`);
  }
  
  // Log SMTP connection info (without password)
  if (process.env.SMTP_HOST) {
    logger.info(`SMTP configured: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || '587'}`);
  }
});
