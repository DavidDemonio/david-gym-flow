
import mysql from 'mysql2/promise';
import { createLogger } from './logger.js';

const logger = createLogger('initialize_routines_db');

/**
 * Initialize the routines database with necessary tables
 */
async function initializeRoutinesDatabase(config) {
  logger.info(`Initializing routines database: ${config.database}@${config.host}:${config.port}`);
  
  try {
    // Create a connection to the database
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database
    });
    
    // Create the routines table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS routines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        objetivo VARCHAR(50),
        nivel VARCHAR(20),
        equipamiento VARCHAR(50),
        dias INT,
        exercises JSON,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    logger.info('Created routines table');
    
    // Close the connection
    await connection.end();
    
    logger.info('Routines database initialization completed');
    return { success: true };
  } catch (err) {
    logger.error('Error initializing routines database:', err);
    return { success: false, error: err.message };
  }
}

export { initializeRoutinesDatabase };
