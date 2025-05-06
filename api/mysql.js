
import mysql from 'mysql2/promise';
import { createLogger } from './logger.js';

const logger = createLogger('mysql');
let connection = null;

async function connectToDatabase(config) {
  try {
    if (connection) {
      await connection.end();
      connection = null;
      logger.info('Closed previous database connection');
    }
    
    // Create a connection
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database
    });
    
    logger.info(`Connected to MySQL database: ${config.database}@${config.host}:${config.port}`);
    
    // Ensure tables exist
    await ensureTablesExist();
    
    return { success: true };
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    return { success: false, error: error.message };
  }
}

async function testConnection(config) {
  try {
    // Try to create a connection
    const testConnection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database
    });
    
    // Close the test connection
    await testConnection.end();
    
    logger.info(`Test connection successful: ${config.database}@${config.host}:${config.port}`);
    return { success: true };
  } catch (error) {
    logger.error('Test connection failed:', error);
    return { success: false, error: error.message };
  }
}

async function disconnect() {
  if (connection) {
    try {
      await connection.end();
      connection = null;
      logger.info('Disconnected from database');
      return { success: true };
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
      return { success: false, error: error.message };
    }
  }
  return { success: true, message: 'Not connected' };
}

async function ensureTablesExist() {
  if (!connection) {
    throw new Error('Not connected to database');
  }
  
  try {
    // Create equipment table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS equipment (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        muscle_groups JSON,
        description TEXT,
        image VARCHAR(255),
        emoji VARCHAR(10),
        category VARCHAR(50),
        calories_per_hour INT
      )
    `);
    logger.info('Ensured equipment table exists');
    
    // Create exercises table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        muscle_groups JSON,
        equipment JSON,
        description TEXT,
        difficulty VARCHAR(20),
        sets INT,
        reps VARCHAR(50),
        rest VARCHAR(20),
        calories INT,
        calories_per_rep FLOAT,
        emoji VARCHAR(10),
        requires_gym BOOLEAN,
        video_url VARCHAR(255)
      )
    `);
    logger.info('Ensured exercises table exists');
    
    // Create routines table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS routines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        objetivo VARCHAR(50),
        nivel VARCHAR(20),
        equipamiento VARCHAR(50),
        dias INT,
        exercises JSON
      )
    `);
    logger.info('Ensured routines table exists');
    
    // Create user_profiles table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(100),
        notifications_enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    logger.info('Ensured user_profiles table exists');
    
  } catch (error) {
    logger.error('Error ensuring tables exist:', error);
    throw error;
  }
}

// Equipment CRUD operations
async function saveEquipment(config, equipment) {
  if (!connection) {
    await connectToDatabase(config);
  }
  
  try {
    // Clear existing equipment
    await connection.execute('TRUNCATE TABLE equipment');
    
    // Insert all equipment
    for (const item of equipment) {
      await connection.execute(
        'INSERT INTO equipment (name, muscle_groups, description, image, emoji, category, calories_per_hour) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          item.name,
          JSON.stringify(item.muscleGroups || []),
          item.description || '',
          item.image || '',
          item.emoji || '',
          item.category || '',
          item.caloriesPerHour || 0
        ]
      );
    }
    
    logger.info(`Saved ${equipment.length} equipment items to database`);
    return { success: true };
  } catch (error) {
    logger.error('Error saving equipment:', error);
    return { success: false, error: error.message };
  }
}

async function getEquipment(config) {
  if (!connection) {
    await connectToDatabase(config);
  }
  
  try {
    const [rows] = await connection.execute('SELECT * FROM equipment');
    
    // Map database rows to Equipment objects
    const equipment = rows.map(row => ({
      id: row.id,
      name: row.name,
      muscleGroups: JSON.parse(row.muscle_groups),
      description: row.description,
      image: row.image,
      emoji: row.emoji,
      category: row.category,
      caloriesPerHour: row.calories_per_hour
    }));
    
    logger.info(`Retrieved ${equipment.length} equipment items from database`);
    return { success: true, data: equipment };
  } catch (error) {
    logger.error('Error getting equipment:', error);
    return { success: false, error: error.message };
  }
}

// Exercise CRUD operations
async function saveExercises(config, exercises) {
  if (!connection) {
    await connectToDatabase(config);
  }
  
  try {
    // Clear existing exercises
    await connection.execute('TRUNCATE TABLE exercises');
    
    // Insert all exercises
    for (const exercise of exercises) {
      await connection.execute(
        `INSERT INTO exercises (
          name, muscle_groups, equipment, description, difficulty,
          sets, reps, rest, calories, calories_per_rep, emoji, requires_gym, video_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          exercise.name,
          JSON.stringify(exercise.muscleGroups || []),
          JSON.stringify(exercise.equipment || []),
          exercise.description || '',
          exercise.difficulty || '',
          exercise.sets || null,
          exercise.reps || '',
          exercise.rest || '',
          exercise.calories || 0,
          exercise.caloriesPerRep || 0,
          exercise.emoji || '',
          exercise.requiresGym || false,
          exercise.videoUrl || ''
        ]
      );
    }
    
    logger.info(`Saved ${exercises.length} exercises to database`);
    return { success: true };
  } catch (error) {
    logger.error('Error saving exercises:', error);
    return { success: false, error: error.message };
  }
}

async function getExercises(config) {
  if (!connection) {
    await connectToDatabase(config);
  }
  
  try {
    const [rows] = await connection.execute('SELECT * FROM exercises');
    
    // Map database rows to Exercise objects
    const exercises = rows.map(row => ({
      id: row.id,
      name: row.name,
      muscleGroups: JSON.parse(row.muscle_groups),
      equipment: JSON.parse(row.equipment),
      description: row.description,
      difficulty: row.difficulty,
      sets: row.sets,
      reps: row.reps,
      rest: row.rest,
      calories: row.calories,
      caloriesPerRep: row.calories_per_rep,
      emoji: row.emoji,
      requiresGym: row.requires_gym === 1,
      videoUrl: row.video_url
    }));
    
    logger.info(`Retrieved ${exercises.length} exercises from database`);
    return { success: true, data: exercises };
  } catch (error) {
    logger.error('Error getting exercises:', error);
    return { success: false, error: error.message };
  }
}

// Routine CRUD operations
async function saveRoutines(config, routines) {
  if (!connection) {
    await connectToDatabase(config);
  }
  
  try {
    // Clear existing routines
    await connection.execute('TRUNCATE TABLE routines');
    
    // Insert all routines
    for (const routine of routines) {
      await connection.execute(
        'INSERT INTO routines (name, objetivo, nivel, equipamiento, dias, exercises) VALUES (?, ?, ?, ?, ?, ?)',
        [
          routine.name,
          routine.objetivo || '',
          routine.nivel || '',
          routine.equipamiento || '',
          routine.dias || 0,
          JSON.stringify(routine.exercises || {})
        ]
      );
    }
    
    logger.info(`Saved ${routines.length} routines to database`);
    return { success: true };
  } catch (error) {
    logger.error('Error saving routines:', error);
    return { success: false, error: error.message };
  }
}

async function getRoutines(config) {
  if (!connection) {
    await connectToDatabase(config);
  }
  
  try {
    const [rows] = await connection.execute('SELECT * FROM routines');
    
    // Map database rows to Routine objects
    const routines = rows.map(row => ({
      id: row.id,
      name: row.name,
      objetivo: row.objetivo,
      nivel: row.nivel,
      equipamiento: row.equipamiento,
      dias: row.dias,
      exercises: JSON.parse(row.exercises)
    }));
    
    logger.info(`Retrieved ${routines.length} routines from database`);
    return { success: true, data: routines };
  } catch (error) {
    logger.error('Error getting routines:', error);
    return { success: false, error: error.message };
  }
}

// User profile CRUD operations
async function saveUserProfile(config, profile) {
  if (!connection) {
    await connectToDatabase(config);
  }
  
  try {
    // Check if profile exists
    const [existingRows] = await connection.execute(
      'SELECT id FROM user_profiles WHERE email = ?',
      [profile.email]
    );
    
    if (existingRows.length > 0) {
      // Update existing profile
      await connection.execute(
        'UPDATE user_profiles SET name = ?, notifications_enabled = ? WHERE email = ?',
        [
          profile.name || '',
          profile.notificationsEnabled === undefined ? true : profile.notificationsEnabled,
          profile.email
        ]
      );
    } else {
      // Insert new profile
      await connection.execute(
        'INSERT INTO user_profiles (email, name, notifications_enabled) VALUES (?, ?, ?)',
        [
          profile.email,
          profile.name || '',
          profile.notificationsEnabled === undefined ? true : profile.notificationsEnabled
        ]
      );
    }
    
    logger.info(`Saved user profile for ${profile.email}`);
    return { success: true };
  } catch (error) {
    logger.error('Error saving user profile:', error);
    return { success: false, error: error.message };
  }
}

async function getUserProfile(config, email) {
  if (!connection) {
    await connectToDatabase(config);
  }
  
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM user_profiles WHERE email = ?',
      [email]
    );
    
    if (rows.length === 0) {
      return { success: true, data: null };
    }
    
    // Map database row to UserProfile object
    const profile = {
      email: rows[0].email,
      name: rows[0].name,
      notificationsEnabled: rows[0].notifications_enabled === 1
    };
    
    logger.info(`Retrieved user profile for ${email}`);
    return { success: true, data: profile };
  } catch (error) {
    logger.error('Error getting user profile:', error);
    return { success: false, error: error.message };
  }
}

export {
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
