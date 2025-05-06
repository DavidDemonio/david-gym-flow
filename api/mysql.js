
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { createLogger } = require('./logger');

let connection = null;
const logger = createLogger('mysql');

// Create tables if they don't exist
async function initTables(conn) {
  logger.info('Initializing database tables');
  
  try {
    // Create equipment table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS equipment (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        muscleGroups JSON,
        emoji VARCHAR(10),
        category VARCHAR(50),
        caloriesPerHour INT,
        image VARCHAR(255)
      )
    `);
    
    // Create exercises table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS exercises (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        muscleGroups JSON,
        equipment JSON,
        difficulty VARCHAR(20),
        sets INT,
        reps VARCHAR(20),
        rest VARCHAR(20),
        calories INT,
        caloriesPerRep INT,
        emoji VARCHAR(10),
        requiresGym BOOLEAN,
        videoUrl VARCHAR(255)
      )
    `);
    
    // Create routines table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS routines (
        id INT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        objetivo VARCHAR(50),
        nivel VARCHAR(20),
        equipamiento VARCHAR(50),
        dias INT,
        exercises JSON
      )
    `);
    
    // Create user profiles table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        email VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100),
        notificationsEnabled BOOLEAN
      )
    `);
    
    logger.info('Database tables initialized successfully');
    return true;
  } catch (error) {
    logger.error('Error initializing tables:', error);
    throw error;
  }
}

async function connectToDatabase(config) {
  try {
    if (connection) {
      await connection.end();
      connection = null;
    }
    
    // Create the connection
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database
    });
    
    // Test the connection
    await connection.ping();
    
    // Initialize tables
    await initTables(connection);
    
    logger.info(`Connected to MySQL database: ${config.host}:${config.port}/${config.database}`);
    return { success: true };
  } catch (error) {
    logger.error('Connection error:', error);
    return { success: false, error: error.message };
  }
}

async function testConnection(config) {
  try {
    const tempConnection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database
    });
    
    await tempConnection.ping();
    await tempConnection.end();
    
    logger.info(`Connection test successful to ${config.host}:${config.port}/${config.database}`);
    return { success: true };
  } catch (error) {
    logger.error('Test connection error:', error);
    return { success: false, error: error.message };
  }
}

async function disconnect() {
  if (connection) {
    try {
      await connection.end();
      connection = null;
      logger.info('Disconnected from MySQL database');
      return { success: true };
    } catch (error) {
      logger.error('Disconnect error:', error);
      return { success: false, error: error.message };
    }
  }
  
  return { success: true };
}

// Equipment functions
async function saveEquipment(config, equipmentList) {
  try {
    if (!connection) {
      await connectToDatabase(config);
    }
    
    // Clear the table first
    await connection.execute('TRUNCATE TABLE equipment');
    
    // Insert all equipment
    const promises = equipmentList.map(async (item) => {
      await connection.execute(
        `INSERT INTO equipment 
        (id, name, description, muscleGroups, emoji, category, caloriesPerHour, image) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id || `eq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          item.name,
          item.description || '',
          JSON.stringify(item.muscleGroups || []),
          item.emoji || '🏋️',
          item.category || 'General',
          item.caloriesPerHour || 0,
          item.image || ''
        ]
      );
    });
    
    await Promise.all(promises);
    logger.info(`Saved ${equipmentList.length} equipment items`);
    
    return { success: true };
  } catch (error) {
    logger.error('Error saving equipment:', error);
    return { success: false, error: error.message };
  }
}

async function getEquipment(config) {
  try {
    if (!connection) {
      await connectToDatabase(config);
    }
    
    const [rows] = await connection.query('SELECT * FROM equipment');
    
    // Convert JSON strings back to objects
    const equipment = rows.map(row => ({
      ...row,
      muscleGroups: JSON.parse(row.muscleGroups)
    }));
    
    logger.info(`Retrieved ${equipment.length} equipment items`);
    return { success: true, data: equipment };
  } catch (error) {
    logger.error('Error retrieving equipment:', error);
    return { success: false, error: error.message };
  }
}

// Exercise functions
async function saveExercises(config, exercises) {
  try {
    if (!connection) {
      await connectToDatabase(config);
    }
    
    // Clear the table first
    await connection.execute('TRUNCATE TABLE exercises');
    
    // Insert all exercises
    const promises = exercises.map(async (item) => {
      await connection.execute(
        `INSERT INTO exercises 
        (id, name, description, muscleGroups, equipment, difficulty, sets, reps, rest, calories, caloriesPerRep, emoji, requiresGym, videoUrl) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id || `ex-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          item.name,
          item.description || '',
          JSON.stringify(item.muscleGroups || []),
          JSON.stringify(item.equipment || []),
          item.difficulty || 'principiante',
          item.sets || 3,
          item.reps || '12',
          item.rest || '60s',
          item.calories || 0,
          item.caloriesPerRep || 0,
          item.emoji || '💪',
          item.requiresGym || false,
          item.videoUrl || ''
        ]
      );
    });
    
    await Promise.all(promises);
    logger.info(`Saved ${exercises.length} exercises`);
    
    return { success: true };
  } catch (error) {
    logger.error('Error saving exercises:', error);
    return { success: false, error: error.message };
  }
}

async function getExercises(config) {
  try {
    if (!connection) {
      await connectToDatabase(config);
    }
    
    const [rows] = await connection.query('SELECT * FROM exercises');
    
    // Convert JSON strings back to objects
    const exercises = rows.map(row => ({
      ...row,
      muscleGroups: JSON.parse(row.muscleGroups),
      equipment: JSON.parse(row.equipment)
    }));
    
    logger.info(`Retrieved ${exercises.length} exercises`);
    return { success: true, data: exercises };
  } catch (error) {
    logger.error('Error retrieving exercises:', error);
    return { success: false, error: error.message };
  }
}

// Routine functions
async function saveRoutines(config, routines) {
  try {
    if (!connection) {
      await connectToDatabase(config);
    }
    
    // Clear the table first
    await connection.execute('TRUNCATE TABLE routines');
    
    // Insert all routines
    const promises = routines.map(async (item) => {
      await connection.execute(
        `INSERT INTO routines 
        (id, name, objetivo, nivel, equipamiento, dias, exercises) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id || Date.now(),
          item.name,
          item.objetivo || '',
          item.nivel || '',
          item.equipamiento || '',
          item.dias || 0,
          JSON.stringify(item.exercises || {})
        ]
      );
    });
    
    await Promise.all(promises);
    logger.info(`Saved ${routines.length} routines`);
    
    return { success: true };
  } catch (error) {
    logger.error('Error saving routines:', error);
    return { success: false, error: error.message };
  }
}

async function getRoutines(config) {
  try {
    if (!connection) {
      await connectToDatabase(config);
    }
    
    const [rows] = await connection.query('SELECT * FROM routines');
    
    // Convert JSON strings back to objects
    const routines = rows.map(row => ({
      ...row,
      exercises: JSON.parse(row.exercises)
    }));
    
    logger.info(`Retrieved ${routines.length} routines`);
    return { success: true, data: routines };
  } catch (error) {
    logger.error('Error retrieving routines:', error);
    return { success: false, error: error.message };
  }
}

// User profile functions
async function saveUserProfile(config, profile) {
  try {
    if (!connection) {
      await connectToDatabase(config);
    }
    
    // Replace the profile if it exists
    await connection.execute(
      `REPLACE INTO user_profiles 
      (email, name, notificationsEnabled) 
      VALUES (?, ?, ?)`,
      [
        profile.email,
        profile.name || '',
        profile.notificationsEnabled || false
      ]
    );
    
    logger.info(`Saved user profile for ${profile.email}`);
    return { success: true };
  } catch (error) {
    logger.error('Error saving user profile:', error);
    return { success: false, error: error.message };
  }
}

async function getUserProfile(config, email) {
  try {
    if (!connection) {
      await connectToDatabase(config);
    }
    
    const [rows] = await connection.query(
      'SELECT * FROM user_profiles WHERE email = ?',
      [email]
    );
    
    if (rows.length === 0) {
      return { success: true, data: null };
    }
    
    logger.info(`Retrieved user profile for ${email}`);
    return { success: true, data: rows[0] };
  } catch (error) {
    logger.error('Error retrieving user profile:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  connectToDatabase,
  testConnection,
  disconnect,
  saveEquipment,
  getEquipment,
  saveExercises,
  getExercises,
  saveRoutines,
  getRoutines,
  saveUserProfile,
  getUserProfile
};
