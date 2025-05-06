import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createLogger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = createLogger('mysql');
let connection = null;

// Default data for the application
const defaultExercises = [
  {
    name: "Press de banca",
    muscleGroups: ["Pecho", "Tríceps"],
    equipment: ["Barra", "Banco"],
    description: "Ejercicio básico para pecho",
    difficulty: "Intermedio",
    sets: 4,
    reps: "8-12",
    rest: "90s",
    calories: 5,
    caloriesPerRep: 0.5,
    emoji: "💪",
    requiresGym: true,
    videoUrl: ""
  },
  {
    name: "Sentadillas",
    muscleGroups: ["Piernas", "Glúteos"],
    equipment: ["Barra"],
    description: "Ejercicio básico para piernas",
    difficulty: "Intermedio",
    sets: 4,
    reps: "8-12",
    rest: "120s",
    calories: 8,
    caloriesPerRep: 0.8,
    emoji: "🦵",
    requiresGym: false,
    videoUrl: ""
  },
  {
    name: "Dominadas",
    muscleGroups: ["Espalda", "Bíceps"],
    equipment: ["Barra de dominadas"],
    description: "Ejercicio para espalda y brazos",
    difficulty: "Avanzado",
    sets: 4,
    reps: "6-10",
    rest: "90s",
    calories: 6,
    caloriesPerRep: 0.7,
    emoji: "🏋️",
    requiresGym: false,
    videoUrl: ""
  },
  {
    name: "Curl de bíceps",
    muscleGroups: ["Bíceps"],
    equipment: ["Mancuernas"],
    description: "Ejercicio de aislamiento para bíceps",
    difficulty: "Principiante",
    sets: 3,
    reps: "10-15",
    rest: "60s",
    calories: 3,
    caloriesPerRep: 0.3,
    emoji: "💪",
    requiresGym: false,
    videoUrl: ""
  },
  {
    name: "Extensión de tríceps",
    muscleGroups: ["Tríceps"],
    equipment: ["Polea", "Barra"],
    description: "Ejercicio de aislamiento para tríceps",
    difficulty: "Principiante",
    sets: 3,
    reps: "10-15",
    rest: "60s",
    calories: 3,
    caloriesPerRep: 0.3,
    emoji: "💪",
    requiresGym: true,
    videoUrl: ""
  },
  {
    name: "Remo con barra",
    muscleGroups: ["Espalda"],
    equipment: ["Barra"],
    description: "Ejercicio compuesto para espalda",
    difficulty: "Intermedio",
    sets: 4,
    reps: "8-12",
    rest: "90s",
    calories: 6,
    caloriesPerRep: 0.6,
    emoji: "🏋️",
    requiresGym: true,
    videoUrl: ""
  },
  {
    name: "Plancha",
    muscleGroups: ["Core", "Abdominales"],
    equipment: ["Sin equipo"],
    description: "Ejercicio isométrico para core",
    difficulty: "Principiante",
    sets: 3,
    reps: "30-60s",
    rest: "60s",
    calories: 4,
    caloriesPerRep: 0,
    emoji: "🧘",
    requiresGym: false,
    videoUrl: ""
  },
  {
    name: "Peso muerto",
    muscleGroups: ["Espalda", "Piernas", "Glúteos"],
    equipment: ["Barra"],
    description: "Ejercicio compuesto para todo el cuerpo",
    difficulty: "Avanzado",
    sets: 4,
    reps: "6-10",
    rest: "120s",
    calories: 9,
    caloriesPerRep: 0.9,
    emoji: "🏋️",
    requiresGym: true,
    videoUrl: ""
  },
  {
    name: "Press militar",
    muscleGroups: ["Hombros", "Tríceps"],
    equipment: ["Barra", "Mancuernas"],
    description: "Ejercicio compuesto para hombros",
    difficulty: "Intermedio",
    sets: 4,
    reps: "8-12",
    rest: "90s",
    calories: 5,
    caloriesPerRep: 0.5,
    emoji: "💪",
    requiresGym: true,
    videoUrl: ""
  },
  {
    name: "Elevaciones laterales",
    muscleGroups: ["Hombros"],
    equipment: ["Mancuernas"],
    description: "Ejercicio de aislamiento para hombros",
    difficulty: "Principiante",
    sets: 3,
    reps: "12-15",
    rest: "60s",
    calories: 3,
    caloriesPerRep: 0.2,
    emoji: "🤸",
    requiresGym: false,
    videoUrl: ""
  }
];

const defaultEquipment = [
  {
    name: "Mancuernas",
    muscleGroups: ["Todo el cuerpo"],
    description: "Pesas libres para ejercicios variados",
    image: "",
    emoji: "🏋️",
    category: "Peso libre",
    caloriesPerHour: 300
  },
  {
    name: "Barra olímpica",
    muscleGroups: ["Todo el cuerpo"],
    description: "Barra de 20kg para ejercicios compuestos",
    image: "",
    emoji: "🏋️",
    category: "Peso libre",
    caloriesPerHour: 350
  },
  {
    name: "Máquina de press",
    muscleGroups: ["Pecho", "Hombros", "Tríceps"],
    description: "Máquina para ejercicios de press",
    image: "",
    emoji: "🏋️",
    category: "Máquina",
    caloriesPerHour: 250
  },
  {
    name: "Máquina de polea",
    muscleGroups: ["Espalda", "Bíceps", "Tríceps"],
    description: "Sistema de poleas para ejercicios variados",
    image: "",
    emoji: "🏋️",
    category: "Máquina",
    caloriesPerHour: 280
  },
  {
    name: "Banco ajustable",
    muscleGroups: ["Todo el cuerpo"],
    description: "Banco con diferentes posiciones de inclinación",
    image: "",
    emoji: "🛋️",
    category: "Accesorio",
    caloriesPerHour: 0
  }
];

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

// Initialize database with default data
async function initializeDefaultData() {
  if (!connection) {
    throw new Error('Not connected to database');
  }
  
  try {
    // Check if exercises table is empty
    const [exerciseRows] = await connection.execute('SELECT COUNT(*) as count FROM exercises');
    if (exerciseRows[0].count === 0) {
      logger.info('Exercises table is empty, adding default exercises');
      await saveExercises({}, defaultExercises);
    } else {
      logger.info(`Exercises table already has ${exerciseRows[0].count} records, skipping default data`);
    }
    
    // Check if equipment table is empty
    const [equipmentRows] = await connection.execute('SELECT COUNT(*) as count FROM equipment');
    if (equipmentRows[0].count === 0) {
      logger.info('Equipment table is empty, adding default equipment');
      await saveEquipment({}, defaultEquipment);
    } else {
      logger.info(`Equipment table already has ${equipmentRows[0].count} records, skipping default data`);
    }
    
    return { success: true };
  } catch (error) {
    logger.error('Error initializing default data:', error);
    return { success: false, error: error.message };
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

// Add these new functions for routines database

async function initializeRoutinesDb(config) {
  try {
    // Create a connection to the routines database
    const routinesConnection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database
    });
    
    logger.info(`Connected to routines database: ${config.database}@${config.host}:${config.port}`);
    
    // Create routines table
    await routinesConnection.execute(`
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
    logger.info('Ensured routines table exists in routines database');
    
    // Close the routines connection
    await routinesConnection.end();
    
    return { success: true, message: 'Routines database initialized successfully' };
  } catch (error) {
    logger.error('Error initializing routines database:', error);
    return { success: false, error: error.message };
  }
}

async function saveRoutinesToSeparateDb(config, routines) {
  try {
    // Create a connection to the routines database
    const routinesConnection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database
    });
    
    // First ensure the table exists
    await routinesConnection.execute(`
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
    
    // Clear existing routines
    await routinesConnection.execute('TRUNCATE TABLE routines');
    
    // Insert all routines
    for (const routine of routines) {
      await routinesConnection.execute(
        `INSERT INTO routines (
          name, objetivo, nivel, equipamiento, dias, exercises, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          routine.name,
          routine.objetivo || '',
          routine.nivel || '',
          routine.equipamiento || '',
          routine.dias || 0,
          JSON.stringify(routine.exercises || {}),
          routine.status || 'pending'
        ]
      );
    }
    
    // Close the routines connection
    await routinesConnection.end();
    
    logger.info(`Saved ${routines.length} routines to separate database`);
    return { success: true };
  } catch (error) {
    logger.error('Error saving routines to separate database:', error);
    return { success: false, error: error.message };
  }
}

async function getRoutinesFromSeparateDb(config) {
  try {
    // Create a connection to the routines database
    const routinesConnection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database
    });
    
    // First ensure the table exists
    await routinesConnection.execute(`
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
    
    const [rows] = await routinesConnection.execute('SELECT * FROM routines');
    
    // Map database rows to Routine objects
    const routines = rows.map(row => ({
      id: row.id,
      name: row.name,
      objetivo: row.objetivo,
      nivel: row.nivel,
      equipamiento: row.equipamiento,
      dias: row.dias,
      exercises: JSON.parse(row.exercises),
      status: row.status || 'pending',
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    // Close the routines connection
    await routinesConnection.end();
    
    logger.info(`Retrieved ${routines.length} routines from separate database`);
    return { success: true, data: routines };
  } catch (error) {
    logger.error('Error getting routines from separate database:', error);
    return { success: false, error: error.message };
  }
}

// Add these functions to the exports
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
  getUserProfile,
  initializeDefaultData,
  initializeRoutinesDb,
  saveRoutinesToSeparateDb,
  getRoutinesFromSeparateDb
};
